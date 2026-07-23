import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';

const out = 'output/playwright';
await mkdir(out, { recursive: true });

// Prefer system Chrome if Playwright browser pack is incomplete for this version.
const browser = await chromium.launch({
  headless: true,
  channel: 'chrome',
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  locale: 'th-TH',
});
const page = await context.newPage();
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
page.on('console', (m) => {
  if (m.type() === 'error') console.log('CONSOLE', m.text());
});

await page.goto(`http://localhost:8000/index.html?t=${Date.now()}`, {
  waitUntil: 'networkidle',
  timeout: 60000,
});

// dismiss boot
for (const sel of ['#bootEnter', '#boot .enter', '#boot button']) {
  const el = page.locator(sel).first();
  if (await el.isVisible().catch(() => false)) {
    await el.click().catch(() => {});
    await page.waitForTimeout(600);
    break;
  }
}
// click center if still booting
const bootVisible = await page.locator('#boot').isVisible().catch(() => false);
if (bootVisible) {
  await page.mouse.click(195, 422);
  await page.waitForTimeout(800);
}

await page.waitForTimeout(2200);

// expose labels for metrics
await page.evaluate(() => {
  // labels is const in script scope — not on window; skip if missing
});

// Tutorial step 2
await page.evaluate(() => {
  if (typeof applyStep === 'function') applyStep(1);
});
await page.waitForTimeout(1300);
await page.screenshot({ path: `${out}/mfix-tut-s2.png` });

// Collapsed brief
await page.evaluate(() => {
  const p = document.getElementById('panel');
  if (p && !p.classList.contains('collapsed')) {
    document.getElementById('collapseBtn')?.click();
  }
});
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/mfix-tut-s2-collapsed.png` });

// Step 3 expanded
await page.evaluate(() => {
  const p = document.getElementById('panel');
  if (p && p.classList.contains('collapsed')) {
    document.getElementById('collapseBtn')?.click();
  }
  if (typeof applyStep === 'function') applyStep(2);
});
await page.waitForTimeout(1300);
await page.screenshot({ path: `${out}/mfix-tut-s3.png` });

// Step 6 laser
await page.evaluate(() => {
  if (typeof applyStep === 'function') applyStep(5);
});
await page.waitForTimeout(1300);
await page.screenshot({ path: `${out}/mfix-tut-s6.png` });

// Simulation expanded
await page.evaluate(() => {
  if (typeof setMode === 'function') setMode('simulation', { silent: true });
});
await page.waitForTimeout(2200);
await page.screenshot({ path: `${out}/mfix-sim-exp.png` });

// Simulation collapsed
await page.evaluate(() => {
  if (typeof setSimulationPanelCollapsed === 'function') {
    setSimulationPanelCollapsed(true);
  }
});
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/mfix-sim-col.png` });

const metrics = await page.evaluate(() => {
  const ratesParent = document.querySelector('.speed-presets');
  const rates = [...document.querySelectorAll('.speed-presets button')].map((b) => ({
    t: b.textContent.trim(),
    display: getComputedStyle(b).display,
    hidden: b.hidden,
  }));
  const simPanel = document.getElementById('simPanel');
  const missionBar = document.getElementById('missionBar');
  return {
    body: document.body.className,
    simCollapsed: !!simPanel?.classList.contains('collapsed'),
    ratesParentDisplay: ratesParent ? getComputedStyle(ratesParent).display : null,
    rates,
    dockH: missionBar?.getBoundingClientRect().height,
    panelBottom: simPanel?.getBoundingClientRect().bottom,
    brandTop: document.getElementById('brand')?.getBoundingClientRect().top,
  };
});
console.log(JSON.stringify(metrics, null, 2));

await browser.close();
console.log('DONE');
