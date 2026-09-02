// Generates the desktop app icons from the shared 645x645 square brand logo.
//
// Source: ../../visualstudio-extension/src/AIEngineeringFluency/assets/logo.png
// (the only square, high-resolution brand asset in the repo). The full logo
// includes the "AI ENGINEERING FLUENCY" wordmark which is illegible at icon
// sizes, so we crop the robot mark and emit square PNGs.
//
// electron-builder generates the multi-resolution .ico for the installer from
// assets/icon.png, so a single >=256px square PNG is all we need to commit.
//
// Run:  npx electron scripts/generate-icon.js
const { app, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const SRC = path.join(
    __dirname, '..', '..',
    'visualstudio-extension', 'src', 'AIEngineeringFluency', 'assets', 'logo.png',
);
const ASSETS = path.join(__dirname, '..', 'assets');

// Crop box around the robot head within the 645x645 logo (excludes the
// wordmark and the chart bars). Square so the icon is not distorted.
const CROP = { x: 80, y: 96, width: 312, height: 312 };

function run() {
    const logo = nativeImage.createFromPath(SRC);
    if (logo.isEmpty()) {
        throw new Error(`Could not read source logo at ${SRC}`);
    }
    fs.mkdirSync(ASSETS, { recursive: true });

    const robot = logo.crop(CROP);
    const write = (name, size) => {
        const out = path.join(ASSETS, name);
        fs.writeFileSync(out, robot.resize({ width: size, height: size, quality: 'best' }).toPNG());
        console.log(`Wrote ${out} (${size}x${size})`);
    };

    // icon.png — installer/window icon source (electron-builder derives the .ico).
    write('icon.png', 512);
    // tray-icon.png — system tray icon (Electron downscales as needed).
    write('tray-icon.png', 256);
}

app.whenReady().then(() => {
    try {
        run();
        app.exit(0);
    } catch (err) {
        console.error(err);
        app.exit(1);
    }
});
