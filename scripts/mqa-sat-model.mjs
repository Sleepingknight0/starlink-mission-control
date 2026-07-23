import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const out = 'output/playwright';
await mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));

await page.goto(`http://localhost:8000/index.html?t=${Date.now()}`, {
  waitUntil: 'networkidle',
  timeout: 60000,
});

for (const sel of ['#bootEnter', '#boot button']) {
  const el = page.locator(sel).first();
  if (await el.isVisible().catch(() => false)) {
    await el.click().catch(() => {});
    await page.waitForTimeout(700);
    break;
  }
}
await page.waitForTimeout(2500);

// Tutorial step 4 — satellite close with heroes
await page.evaluate(() => {
  if (typeof applyStep === 'function') applyStep(3);
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/sat-model-tut-s4.png` });

// Step 3 — often shows sat + dish
await page.evaluate(() => {
  if (typeof applyStep === 'function') applyStep(2);
});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/sat-model-tut-s3.png` });

// Simulation satellite camera
await page.evaluate(() => {
  if (typeof setMode === 'function') setMode('simulation', { silent: true });
});
await page.waitForTimeout(2000);
await page.evaluate(() => {
  if (typeof setSimulationCamera === 'function') setSimulationCamera('satellite');
});
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/sat-model-sim-close.png` });

// Fleet view
await page.evaluate(() => {
  if (typeof setSimulationCamera === 'function') setSimulationCamera('fleet');
});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/sat-model-sim-fleet.png` });

// Train view
await page.evaluate(() => {
  if (typeof setSimulationCamera === 'function') setSimulationCamera('train');
});
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}/sat-model-sim-train.png` });

// Mobile step 4
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
});
const mp = await mobile.newPage();
await mp.goto(`http://localhost:8000/index.html?t=${Date.now()}`, {
  waitUntil: 'networkidle',
  timeout: 60000,
});
for (const sel of ['#bootEnter', '#boot button']) {
  const el = mp.locator(sel).first();
  if (await el.isVisible().catch(() => false)) {
    await el.click().catch(() => {});
    await mp.waitForTimeout(700);
    break;
  }
}
await mp.waitForTimeout(2200);
await mp.evaluate(() => {
  if (typeof applyStep === 'function') applyStep(3);
  const p = document.getElementById('panel');
  if (p && !p.classList.contains('collapsed')) {
    document.getElementById('collapseBtn')?.click();
  }
});
await mp.waitForTimeout(1300);
await mp.screenshot({ path: `${out}/sat-model-mobile-s4.png` });

await browser.close();
console.log('DONE');
