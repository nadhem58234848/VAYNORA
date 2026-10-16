const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] }); const p = await b.newPage();
  const D = '/tmp/claude-0/brand/tpl'; fs.mkdirSync(D + '/png', { recursive: true });
  for (const f of fs.readdirSync(D + '/html')) {
    const st = f.startsWith('s'); await p.setViewportSize({ width: 1080, height: st ? 1920 : 1350 });
    await p.goto('file://' + D + '/html/' + f); await p.waitForTimeout(300);
    await p.locator('#c').screenshot({ path: D + '/png/' + f.replace('.html', '.png') });
  }
  await b.close();
})();
