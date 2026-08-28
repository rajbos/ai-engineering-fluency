'use strict';

/**
 * Per-pixel image comparison, executed inside a Chromium page.
 *
 * Doing it in the browser means PNG decoding and encoding come for free, so the
 * harness needs no image-processing dependency in any package.json.
 */

const fs = require('fs');

/** Reads a PNG into a `data:` URL so the page can load it without a file server. */
function toDataUrl(filePath) {
	return `data:image/png;base64,${fs.readFileSync(filePath).toString('base64')}`;
}

/**
 * Compares two screenshots and writes a diff image highlighting the changes.
 *
 * Views are full-page screenshots, so a change that adds a row makes the whole
 * image taller. Rather than calling that "100% different", both images are
 * compared on a canvas sized to fit each, and any area present in only one of
 * them counts as changed.
 *
 * @param {import('playwright').Page} page
 * @param {string} baselinePath
 * @param {string} currentPath
 * @param {string} diffPath   where to write the diff PNG
 * @param {number} threshold  per-channel tolerance, 0–1
 */
async function diffImagesInPage(page, baselinePath, currentPath, diffPath, threshold) {
	const result = await page.evaluate(
		async ({ baselineUrl, currentUrl, threshold }) => {
			const load = (src) => new Promise((resolve, reject) => {
				const img = new Image();
				img.onload = () => resolve(img);
				img.onerror = () => reject(new Error(`Failed to decode ${src.slice(0, 40)}…`));
				img.src = src;
			});

			const [a, b] = await Promise.all([load(baselineUrl), load(currentUrl)]);
			const width = Math.max(a.width, b.width);
			const height = Math.max(a.height, b.height);

			const readPixels = (img) => {
				const canvas = document.createElement('canvas');
				canvas.width = width;
				canvas.height = height;
				const ctx = canvas.getContext('2d', { willReadFrequently: true });
				// Areas outside a smaller image stay transparent, which reads as
				// "changed" against the taller image's opaque pixels — exactly right.
				ctx.clearRect(0, 0, width, height);
				ctx.drawImage(img, 0, 0);
				return ctx.getImageData(0, 0, width, height);
			};

			const beforePixels = readPixels(a).data;
			const afterPixels = readPixels(b).data;

			const outCanvas = document.createElement('canvas');
			outCanvas.width = width;
			outCanvas.height = height;
			const outCtx = outCanvas.getContext('2d');
			const out = outCtx.createImageData(width, height);

			const tolerance = threshold * 255;
			let changedPixels = 0;

			for (let i = 0; i < afterPixels.length; i += 4) {
				const dr = Math.abs(beforePixels[i] - afterPixels[i]);
				const dg = Math.abs(beforePixels[i + 1] - afterPixels[i + 1]);
				const db = Math.abs(beforePixels[i + 2] - afterPixels[i + 2]);
				const da = Math.abs(beforePixels[i + 3] - afterPixels[i + 3]);
				const changed = dr > tolerance || dg > tolerance || db > tolerance || da > tolerance;

				if (changed) {
					changedPixels++;
					// Changed pixels in magenta; unchanged content dimmed underneath so
					// the highlight is readable in context.
					out.data[i] = 255;
					out.data[i + 1] = 0;
					out.data[i + 2] = 200;
					out.data[i + 3] = 255;
				} else {
					const grey = (afterPixels[i] + afterPixels[i + 1] + afterPixels[i + 2]) / 3;
					const dimmed = Math.round(grey * 0.35 + 255 * 0.25);
					out.data[i] = dimmed;
					out.data[i + 1] = dimmed;
					out.data[i + 2] = dimmed;
					out.data[i + 3] = 255;
				}
			}

			outCtx.putImageData(out, 0, 0);
			const totalPixels = width * height;
			return {
				changedPixels,
				totalPixels,
				changedPercent: (changedPixels / totalPixels) * 100,
				baselineSize: `${a.width}×${a.height}`,
				currentSize: `${b.width}×${b.height}`,
				resized: a.width !== b.width || a.height !== b.height,
				diffDataUrl: changedPixels > 0 ? outCanvas.toDataURL('image/png') : null,
			};
		},
		{ baselineUrl: toDataUrl(baselinePath), currentUrl: toDataUrl(currentPath), threshold },
	);

	if (result.diffDataUrl) {
		fs.writeFileSync(diffPath, Buffer.from(result.diffDataUrl.split(',')[1], 'base64'));
	}
	delete result.diffDataUrl;
	return result;
}

module.exports = { diffImagesInPage };
