// renders the owl icon (design screen 15, home-screen variant): npm i --no-save @resvg/resvg-js && node scripts/icon.js
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const owl = (bg, line, fill, eye, pupil, size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100">
<rect width="100" height="100" fill="${bg}"/>
<path d="M27 30 L33 16.5 L42 26 Q50 23.5 58 26 L67 16.5 L73 30 Q80 40 78 54 Q76 72 62 80 Q50 86 38 80 Q24 72 22 54 Q20 40 27 30 Z" fill="${fill}" stroke="${line}" stroke-width="4" stroke-linejoin="round"/>
<circle cx="40" cy="45.5" r="9" fill="${eye}" stroke="${line}" stroke-width="4"/>
<circle cx="60" cy="45.5" r="9" fill="${eye}" stroke="${line}" stroke-width="4"/>
<circle cx="40" cy="46" r="3.8" fill="${pupil}"/>
<circle cx="60" cy="46" r="3.8" fill="${pupil}"/>
<path d="M47 55.5 L53 55.5 L50 61.5 Z" fill="${line}"/>
</svg>`;
const out = process.argv[2] ?? 'assets';
const png = (svg) => new Resvg(svg).render().asPng();
fs.writeFileSync(`${out}/icon-dark.png`, png(owl('#15140F', '#D9BE7E', 'none', 'none', '#D9BE7E', 1024)));
fs.writeFileSync(`${out}/icon.png`, png(owl('#F6F1E7', '#7A5C17', '#ECE4D3', '#F6F1E7', '#1F1C15', 1024)));
fs.writeFileSync(`${out}/splash.png`, png(owl('#15140F', '#D9BE7E', 'none', 'none', '#D9BE7E', 400)));
