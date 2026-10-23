import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'app', 'assets', 'icons');
const DEVICE_JS = path.join(ROOT, 'app', 'device.js');

console.log('🧪 RUNNING TDD TEST SUITE: CleanFrame Community Extensions');
console.log('---------------------------------------------------------');

// ========================================================
// TEST 1: SVG Icons Asset Integrity
// ========================================================
console.log('▶ [TEST 1] SVG Icons Asset Integrity Check...');
const EXPECTED_NEW_ICONS = [
  'emby', 'hdmi', 'moonlight', 'nuvio_legacy', 'nuviotv',
  'plex', 'tizenbrew', 'vieon', 'vtv', 'xbox'
];

for (const icon of EXPECTED_NEW_ICONS) {
  const iconPath = path.join(ICONS_DIR, `${icon}.svg`);
  assert(fs.existsSync(iconPath), `Missing expected SVG icon: ${icon}.svg`);
  
  const content = fs.readFileSync(iconPath, 'utf8');
  assert(content.includes('<svg'), `Invalid SVG root tag in ${icon}.svg`);
  assert(content.includes('viewBox='), `Missing viewBox attribute in ${icon}.svg`);
  assert(!content.includes('<script'), `Security violation: <script> found in ${icon}.svg`);
  assert(!content.includes('onload='), `Security violation: onload found in ${icon}.svg`);
  assert(!content.includes('onclick='), `Security violation: onclick found in ${icon}.svg`);
}
console.log(`  ✓ All ${EXPECTED_NEW_ICONS.length} new SVG icons passed XML & security validation.`);

// ========================================================
// TEST 2: Device Brand & Title Mapping (Seam Verification)
// ========================================================
console.log('▶ [TEST 2] Device Brand & Title Mapping Extraction...');
const deviceSource = fs.readFileSync(DEVICE_JS, 'utf8');

// Simulate minimal browser environment for device.js
const mockWindow = {
  tizen: null
};

// Evaluate device.js module logic
new Function('window', `
  ${deviceSource};
`)(mockWindow);

const FrameDevice = mockWindow.FrameDevice;
assert(FrameDevice, 'FrameDevice module failed to initialize on window');

const EXPECTED_BRAND_MAPPINGS = [
  { appId: 'vYmY3ACVaa.emby', expectedBrand: 'emby' },
  { appId: 'kIciSQlYEM.plex', expectedBrand: 'plex' },
  { appId: '7wiJRozgP7.VieOn', expectedBrand: 'vieon' },
  { appId: 'OxWOiJOOyr.vtv', expectedBrand: 'vtv' },
  { appId: 'GHI3a0zMSx.XboxGamePass', expectedBrand: 'xbox' },
  { appId: 'rJeHak5zRg.Spotify', expectedBrand: 'spotify' },
  { appId: 'NuvioTV001.NuvioTV', expectedBrand: 'nuviotv' },
  { appId: 'NuvioTV002.Nuvio', expectedBrand: 'nuvio_legacy' }
];

for (const { appId, expectedBrand } of EXPECTED_BRAND_MAPPINGS) {
  const brand = FrameDevice.brands[appId];
  assert.strictEqual(
    brand,
    expectedBrand,
    `Brand mismatch for ${appId}: got "${brand}", expected "${expectedBrand}"`
  );
}
console.log(`  ✓ All ${EXPECTED_BRAND_MAPPINGS.length} brand mappings verified in FrameDevice.brands.`);

// ========================================================
// TEST 3: Clean Titles Verification
// ========================================================
console.log('▶ [TEST 3] Clean Titles Verification...');
const EXPECTED_CLEAN_TITLES = [
  { appId: 'OxWOiJOOyr.vtv', expectedTitle: 'VTVgo' },
  { appId: 'NuvioTV002.Nuvio', expectedTitle: 'Nuvio Native' },
  { appId: 'NuvioTV001.NuvioTV', expectedTitle: 'Nuvio Web' },
  { appId: 'kIciSQlYEM.plex', expectedTitle: 'Plex' },
  { appId: 'xvvl3S1bvH.TizenBrewStandalone', expectedTitle: 'TizenBrew' },
  { appId: 'GHI3a0zMSx.XboxGamePass', expectedTitle: 'Xbox' },
  { appId: 'w0wZu3xkQq.GeForceNOW', expectedTitle: 'GeForce NOW' }
];

for (const { appId, expectedTitle } of EXPECTED_CLEAN_TITLES) {
  const title = FrameDevice.titles[appId];
  assert.strictEqual(
    title,
    expectedTitle,
    `Title mismatch for ${appId}: got "${title}", expected "${expectedTitle}"`
  );
}
console.log(`  ✓ All ${EXPECTED_CLEAN_TITLES.length} clean titles verified in FrameDevice.titles.`);

// ========================================================
// TEST 4: HDMI Source Routing Seam
// ========================================================
console.log('▶ [TEST 4] HDMI Source Routing Seam...');
let launchedTarget = null;
const mockWindowWithHdmi = {
  tizen: {
    application: {
      launch: (id, success) => {
        launchedTarget = id;
        if (success) success();
      }
    }
  }
};

new Function('window', `
  ${deviceSource};
`)(mockWindowWithHdmi);

mockWindowWithHdmi.FrameDevice.launchApp('hdmi:2', (err) => {
  assert.strictEqual(err, null, 'HDMI launch returned error');
});
assert.strictEqual(launchedTarget, 'org.tizen.tv-viewer', 'HDMI routing did not trigger tv-viewer');
console.log('  ✓ HDMI routing seam successfully triggers tv-viewer.');

console.log('---------------------------------------------------------');
console.log('🎉 ALL TDD SEAM TESTS PASSED! READY FOR COMMUNITY PULL REQUEST.');
