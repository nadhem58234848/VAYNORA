import {continueRender, delayRender, staticFile} from 'remotion';
/* الخط محلي (Chromium ما يوصلش لـGoogle Fonts ورا البروكسي) */
const h = delayRender('font');
const css = [[600,'Cairo-600.ttf'],[800,'Cairo-800.ttf']].map(([w,f]) =>
  `@font-face{font-family:'Cairo';font-weight:${w};src:url('${staticFile(f as string)}') format('truetype');font-display:block;}`).join('\n')
  + `\n@font-face{font-family:'Cairo';font-weight:900;src:url('${staticFile('Cairo-800.ttf')}') format('truetype');}`;
const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
Promise.all([document.fonts.load("800 40px Cairo"), document.fonts.load("600 40px Cairo")]).then(() => continueRender(h), () => continueRender(h));
