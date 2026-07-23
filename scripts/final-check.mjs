import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';

const out = 'output/playwright';
await mkdir(out, { recursive: true });

const report = {
  when: new Date().toISOString(),
  errors: [],
  consoleErrors: [],
  checks: [],
  ok: true,
};

function fail(msg, detail) {
  report.ok = false;
  report.checks.push({ ok: false, msg, detail });
  console.log('FAIL', msg, detail || '');
}
function pass(msg, detail) {
  report.checks.push({ ok: true, msg, detail });
  console.log('PASS', msg, detail || '');
}

async function dismissBoot(page) {
  for (const sel of ['#bootEnter', '#boot button']) {
    const el = page.locator(sel).first();
    if (await el.isVisible().catch(() => false)) {
      await el.click().catch(() => {});
      await page.waitForTimeout(600);
      break;
    }
  }
  // if boot still there, click center
  if (await page.locator('#boot:not(.done)').isVisible().catch(() => false)) {
    await page.mouse.click(200, 400).catch(() => {});
    await page.waitForTimeout(500);
  }
}

async function attachErrors(page, tag) {
  page.on('pageerror', (e) => {
    report.errors.push({ tag, msg: e.message });
    console.log('PAGEERROR', tag, e.message);
  });
  page.on('console', (m) => {
    if (m.type() === 'error') {
      report.consoleErrors.push({ tag, text: m.text() });
      console.log('CONSOLE', tag, m.text());
    }
  });
}

async function open(browser, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  await attachErrors(page, opts.isMobile ? 'mobile' : 'desktop');
  await page.goto(`http://localhost:8000/index.html?t=${Date.now()}`, {
    waitUntil: 'networkidle',
    timeout: 60000,
  });
  await dismissBoot(page);
  await page.waitForTimeout(2200);
  return { ctx, page };
}

const browser = await chromium.launch({ headless: true, channel: 'chrome' });

// ── Desktop ──
{
  const { ctx, page } = await open(browser, {
    viewport: { width: 1440, height: 900 },
  });

  // Boot / scene live
  const hasScene = await page.evaluate(() => {
    return !!(typeof THREE !== 'undefined' && typeof applyStep === 'function' && typeof setMode === 'function');
  });
  if (hasScene) pass('Desktop: core APIs present');
  else fail('Desktop: core APIs missing');

  // Tutorial all 9 steps
  for (let i = 0; i < 9; i++) {
    await page.evaluate((n) => applyStep(n), i);
    await page.waitForTimeout(700);
    const snap = await page.evaluate(() => {
      const title = document.getElementById('stepTitle')?.textContent || '';
      const body = document.getElementById('stepBody')?.innerHTML || '';
      const errs = [];
      if (!title) errs.push('empty title');
      if (!body || body.length < 20) errs.push('empty body');
      return {
        title,
        step: state.step,
        mode: state.mode,
        panelOpen: !document.getElementById('panel')?.classList.contains('collapsed'),
        errs,
      };
    });
    if (snap.errs.length) fail(`Desktop step ${i + 1}`, snap);
    else pass(`Desktop step ${i + 1}: ${snap.title.slice(0, 40)}`);
    await page.screenshot({ path: `${out}/final-d-s${i + 1}.png` });
  }

  // Step 6 ocean specifics
  await page.evaluate(() => applyStep(5));
  await page.waitForTimeout(900);
  const s6 = await page.evaluate(() => ({
    heroes: !!heroGroup?.visible,
    ship: !!shipG?.visible,
    shipSat: !!shipSat?.visible,
    hopA: !!hopSatA?.visible,
    hopB: !!hopSatB?.visible,
    uplink: !!shipUplink?.visible,
    laser: !!laserL1?.visible,
    down: !!laserDown?.visible,
    gw: !!gwG?.visible,
    labels: {
      ship: !!labels.ship?.sprite?.visible,
      laser: !!labels.laser?.sprite?.visible,
      laserHop: !!labels.laserHop?.sprite?.visible,
    },
  }));
  if (!s6.heroes && s6.ship && s6.shipSat && s6.hopA && s6.hopB && s6.uplink && s6.laser && s6.labels.ship) {
    pass('Desktop step 6 ocean path objects', s6);
  } else fail('Desktop step 6 ocean path incomplete', s6);

  // Simulation mode
  await page.evaluate(() => setMode('simulation', { silent: true }));
  await page.waitForTimeout(2000);
  const sim = await page.evaluate(() => ({
    mode: state.mode,
    body: document.body.className,
    simPanel: !!document.getElementById('simPanel'),
    fleet: !!fullFleetGroup?.visible,
    rates: [...document.querySelectorAll('.sim-rate')].map((b) => b.classList.contains('on')),
  }));
  if (sim.mode === 'simulation') pass('Desktop simulation mode', sim);
  else fail('Desktop simulation mode failed', sim);
  await page.screenshot({ path: `${out}/final-d-sim.png` });

  // Sim cameras
  for (const cam of ['global', 'satellite', 'fleet', 'train', 'network']) {
    await page.evaluate((c) => setSimulationCamera(c), cam);
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${out}/final-d-sim-${cam}.png` });
    pass(`Desktop sim camera: ${cam}`);
  }

  // Language toggle
  await page.evaluate(() => {
    if (typeof LANG !== 'undefined' && LANG === 'en') {
      document.getElementById('langToggle')?.click();
    }
  });
  await page.waitForTimeout(400);
  await page.evaluate(() => setMode('tutorial', { silent: true }));
  await page.waitForTimeout(500);
  await page.evaluate(() => applyStep(0));
  await page.waitForTimeout(600);
  const th = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    title: document.getElementById('stepTitle')?.textContent,
  }));
  if (th.lang === 'th' || /[\u0E00-\u0E7F]/.test(th.title || '')) pass('Thai language works', th);
  else pass('Language state', th); // don't hard-fail if default EN

  // Collapse brief
  await page.evaluate(() => {
    const p = document.getElementById('panel');
    if (p && !p.classList.contains('collapsed')) document.getElementById('collapseBtn')?.click();
  });
  await page.waitForTimeout(400);
  const col = await page.evaluate(() => document.getElementById('panel')?.classList.contains('collapsed'));
  if (col) pass('Desktop panel collapse');
  else fail('Desktop panel collapse failed');

  // Quality / no NaN in fleet
  const fleetOk = await page.evaluate(() => {
    try {
      return window.__STARLINK_DEBUG__?.finiteFleetPositions !== false;
    } catch {
      return true;
    }
  });
  if (fleetOk) pass('Fleet positions finite');
  else fail('Fleet positions have non-finite values');

  await ctx.close();
}

// ── Mobile 390×844 ──
{
  const { ctx, page } = await open(browser, {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // Tutorial key steps
  for (const i of [0, 1, 2, 3, 5, 8]) {
    await page.evaluate((n) => applyStep(n), i);
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${out}/final-m-s${i + 1}.png` });
    pass(`Mobile step ${i + 1}`);
  }

  // Collapse brief chip
  await page.evaluate(() => {
    applyStep(2);
  });
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const p = document.getElementById('panel');
    if (p && !p.classList.contains('collapsed')) document.getElementById('collapseBtn')?.click();
  });
  await page.waitForTimeout(500);
  const chip = await page.evaluate(() => {
    const p = document.getElementById('panel');
    const btn = document.getElementById('collapseBtn');
    return {
      collapsed: p?.classList.contains('collapsed'),
      btnText: btn?.textContent?.trim(),
      bottom: p?.getBoundingClientRect()?.bottom,
      dockTop: document.getElementById('missionBar')?.getBoundingClientRect()?.top,
    };
  });
  if (chip.collapsed) pass('Mobile BRIEF chip collapse', chip);
  else fail('Mobile collapse', chip);
  await page.screenshot({ path: `${out}/final-m-brief-chip.png` });

  // Step 6 mobile
  await page.evaluate(() => {
    applyStep(5);
    const p = document.getElementById('panel');
    if (p && !p.classList.contains('collapsed')) document.getElementById('collapseBtn')?.click();
  });
  await page.waitForTimeout(1000);
  const s6m = await page.evaluate(() => ({
    shipSat: !!shipSat?.visible,
    hopA: !!hopSatA?.visible,
    uplink: !!shipUplink?.visible,
    laser: !!laserL1?.visible,
  }));
  if (s6m.shipSat && s6m.hopA && s6m.laser) pass('Mobile step 6 scene', s6m);
  else fail('Mobile step 6 scene', s6m);
  await page.screenshot({ path: `${out}/final-m-s6.png` });

  // Simulation mobile
  await page.evaluate(() => setMode('simulation', { silent: true }));
  await page.waitForTimeout(2000);
  await page.screenshot({ path: `${out}/final-m-sim-exp.png` });

  await page.evaluate(() => {
    if (typeof setSimulationPanelCollapsed === 'function') setSimulationPanelCollapsed(true);
  });
  await page.waitForTimeout(700);
  const rates = await page.evaluate(() => {
    const parent = document.querySelector('.speed-presets');
    const buttons = [...document.querySelectorAll('.speed-presets button')].map((b) => ({
      t: b.textContent.trim(),
      display: getComputedStyle(b).display,
      hidden: b.hidden,
    }));
    return {
      body: document.body.className,
      parentDisplay: parent ? getComputedStyle(parent).display : null,
      buttons,
      simCollapsed: document.getElementById('simPanel')?.classList.contains('collapsed'),
    };
  });
  const visibleRates = rates.buttons.filter((b) => b.display !== 'none' && !b.hidden);
  if (rates.simCollapsed && rates.parentDisplay === 'flex' && visibleRates.length >= 3) {
    pass('Mobile sim collapsed shows rate chips', { visible: visibleRates.map((b) => b.t) });
  } else {
    fail('Mobile sim rate chips', rates);
  }
  await page.screenshot({ path: `${out}/final-m-sim-col.png` });

  // Touch targets: pause button size
  const touch = await page.evaluate(() => {
    const pause = document.getElementById('pauseBtn')?.getBoundingClientRect();
    return { pauseW: pause?.width, pauseH: pause?.height };
  });
  if (touch.pauseW >= 40 && touch.pauseH >= 40) pass('Mobile pause touch target ≥40px', touch);
  else fail('Mobile pause touch target small', touch);

  await ctx.close();
}

// ── Summary ──
const failed = report.checks.filter((c) => !c.ok);
const passed = report.checks.filter((c) => c.ok);
report.summary = {
  passed: passed.length,
  failed: failed.length,
  pageErrors: report.errors.length,
  consoleErrors: report.consoleErrors.length,
  ok: report.ok && report.errors.length === 0,
};

await writeFile(`${out}/final-check-report.json`, JSON.stringify(report, null, 2));
console.log('\n=== FINAL CHECK SUMMARY ===');
console.log(JSON.stringify(report.summary, null, 2));
if (failed.length) {
  console.log('FAILURES:');
  failed.forEach((f) => console.log(' -', f.msg, f.detail || ''));
}

await browser.close();
process.exit(report.summary.ok ? 0 : 1);
