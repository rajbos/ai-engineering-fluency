const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const production = process.argv.includes('--production');

async function main() {
  const distDir = path.join(__dirname, 'dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  await esbuild.build({
    entryPoints: ['src/server.ts'],
    bundle: true,
    outfile: 'dist/server.js',
    format: 'cjs',
    platform: 'node',
    target: 'node22',
    sourcemap: !production,
    minify: production,
    // node:sqlite is a built-in module — esbuild auto-externalises node:* with platform:node,
    // but list explicitly for clarity
    external: ['node:sqlite'],
    logLevel: 'info',
  });

  // Copy Chart.js UMD bundle so the dashboard can inline it without a CDN dependency
  const chartSrc = path.join(__dirname, 'node_modules', 'chart.js', 'dist', 'chart.umd.min.js');
  const chartDst = path.join(distDir, 'chart.min.js');
  if (fs.existsSync(chartSrc)) {
    fs.copyFileSync(chartSrc, chartDst);
    console.log('Copied chart.js to dist/chart.min.js');
  } else {
    console.warn('WARNING: chart.js not found — charts will not render in the dashboard');
  }

  // Copy the dashboard header icon into the dist folder so it is served from /icon.png
  const iconSrc = path.join(__dirname, 'images', 'icon.png');
  const iconDstDir = path.join(distDir, 'images');
  if (!fs.existsSync(iconDstDir)) {
    fs.mkdirSync(iconDstDir, { recursive: true });
  }
  const iconDst = path.join(iconDstDir, 'icon.png');
  if (fs.existsSync(iconSrc)) {
    fs.copyFileSync(iconSrc, iconDst);
    console.log('Copied icon to dist/images/icon.png');
  } else {
    console.warn('WARNING: icon not found — dashboard header will not show the logo');
  }

  console.log(`Sharing server built (${production ? 'production' : 'development'})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
