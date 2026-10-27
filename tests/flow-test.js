const pw = require('/Users/macuser/find-the-signal/node_modules/playwright-core');
const ENGINE = process.env.ENGINE || 'chromium';
const OUT = process.env.SHOTS || "/tmp/gm-shots";
const URL = process.env.URL || 'https://www.bisonboost.com/groovemakers-preview/';
const wait = ms => new Promise(r => setTimeout(r, ms));

async function run(name, viewport, opts = {}) {
  const browser = await pw[ENGINE].launch(ENGINE === 'chromium' ? { channel: 'chrome', headless: true } : { headless: true });
  const page = await browser.newPage({ viewport, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', isMobile: !!opts.mobile, hasTouch: !!opts.mobile });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('requestfailed', r => errors.push('reqfail: ' + r.url()));
  await page.goto(URL, { waitUntil: 'networkidle' });
  const r = [];
  const setP = async p => {
    await page.evaluate(p => { const j = document.querySelector('#journey'); const s = document.querySelector('.stage'); const r = typeof fromStory === 'function' ? fromStory(p) : p; window.scrollTo({ top: j.offsetTop + (j.offsetHeight - s.offsetHeight) * r, behavior: 'instant' }); }, p);
    await wait(700);
  };
  const state = () => page.evaluate(() => ({
    chapter: document.querySelector('#chapterNo').textContent,
    stageSticky: Math.round(document.querySelector('.stage').getBoundingClientRect().top),
    sleeveOp: +getComputedStyle(document.querySelector('#sleeve')).opacity,
    gridOp: +document.querySelector('#collection').style.opacity,
    gridInert: document.querySelector('#collection').inert,
    signupOp: +document.querySelector('#selection').style.opacity,
    signupInert: document.querySelector('#selection').inert,
    hScroll: document.documentElement.scrollWidth > innerWidth,
  }));
  for (const p of [0, 0.3, 0.52]) { await setP(p); r.push({ p, ...(await state()) }); await page.screenshot({ path: `${OUT}/${name}-p${p}.png` }); }
  // Keyboard: tab to a track and press Enter
  const trackCount = await page.locator('.track').count();
  const visibleTracks = await page.evaluate(() => [...document.querySelectorAll('.track')].filter(b => { const x = b.getBoundingClientRect(); return x.bottom > 0 && x.top < innerHeight && x.right > 0 && x.left < innerWidth; }).length);
  await page.locator('.track').nth(3).focus();
  await page.keyboard.press('Enter');
  await wait(1500);
  r.push({ step: 'after select track 04', ...(await state()), title: await page.textContent('#selectionTitle') });
  await page.screenshot({ path: `${OUT}/${name}-selected.png` });
  await page.click('#continueSignup');
  await wait(1500);
  r.push({ step: 'after continue', ...(await state()) });
  // Empty submit should be blocked by required validation
  await page.click('#signup button[type=submit]');
  const blocked = await page.evaluate(() => !document.querySelector('#signup').hidden && !document.querySelector('#signup').checkValidity());
  await page.fill('input[name=dj]', 'Test DJ');
  await page.fill('input[name=email]', 'test@example.com');
  await page.fill('input[name=city]', 'Richmond');
  await page.screenshot({ path: `${OUT}/${name}-form.png` });
  await page.click('#signup button[type=submit]');
  await wait(400);
  r.push({ step: 'after submit', emptyBlocked: blocked, confirmationShown: await page.isVisible('#confirmation'), modalTitle: await page.textContent('#modalTitle') });
  await page.screenshot({ path: `${OUT}/${name}-confirm.png` });
  await page.click('#reset');
  await wait(1500);
  r.push({ step: 'after back to collection', ...(await state()) });
  // Unselected path: fresh page, jump to Join
  await page.reload({ waitUntil: 'networkidle' });
  await setP(0.9);
  r.push({ step: 'join w/o track (grid holds until a record is chosen)', gridStaysLive: await page.evaluate(() => +document.querySelector('#collection').style.opacity > .9 && document.querySelector('.track')._live === true) });
  await page.screenshot({ path: `${OUT}/${name}-needtrack.png` });
  console.log(JSON.stringify({ name, trackCount, visibleTracks, results: r, errors }, null, 1));
  await browser.close();
}
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  await run('desktop', { width: 1440, height: 900 });
  await run('mobile', { width: 390, height: 844 }, { mobile: true });
  await run('reduced', { width: 1280, height: 800 }, { reduced: true });
})().catch(e => { console.error(e); process.exit(1); });
