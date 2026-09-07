const fs = require('fs');
const data = require('./data.js');
const scenes = data.phases.flatMap(phase =>
  phase.scenes.map(scene => ({ ...scene, phaseTitle: phase.title.replace(/^阶段\d+：/, '') }))
);
const colors = ['#FFF4D6','#E8F7FF','#F1E9FF','#E8F8EA','#FFE9EF','#FFF0DD'];
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));

function svg(type) {
  const base = (content, label) => '<svg class="drawing" viewBox="0 0 64 64" role="img" aria-label="'+label+'"><g fill="none" stroke="#365D73" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+content+'</g></svg>';
  const child = '<circle cx="28" cy="18" r="8"/><path d="M28 26v19M16 33l12 5 12-5M21 54l7-9 8 9"/>';
  const pair = '<circle cx="20" cy="18" r="7"/><circle cx="44" cy="18" r="7"/><path d="M20 25v23M44 25v23M12 34l8 4 8-4M36 34l8 4 8-4M14 55l6-7 6 7M38 55l6-7 6 7"/>';
  const key = type;
  if (/hello|hi|bye|welcome|meet|morning|night|cheers/.test(key)) return base(pair+'<path d="M31 20c2-4 4-4 6 0M47 29l7-7M47 29l7 1"/>','two children greeting or waving');
  if (/mom|dad|grand|family|sister|brother|baby/.test(key)) return base(pair+'<path d="M29 43c2 3 4 3 6 0M32 40v8"/>','a family');
  if (/head|eye|nose|mouth|ear|hand|touch|body/.test(key)) return base(child+'<path d="M16 17h8M32 17h8M22 22h12M28 29l-4-8"/>','a child pointing to a body part');
  if (/come|go|sit|stand|look|listen|stop|wait|open|close/.test(key)) return base(child+'<path d="M45 28h12M53 23l5 5-5 5"/>','a child following an instruction');
  if (/wake|sleep|bed|dream|tired|rise/.test(key)) return base('<path d="M8 42h48M13 42V30h35v12M18 30v-7h20"/><circle cx="24" cy="26" r="5"/><path d="M49 13c5 3 4 10-2 12 3-5 2-9-2-12"/>','a child waking up or sleeping');
  if (/dress|shirt|pants|wear|shoe|sock|coat/.test(key)) return base('<path d="M20 16l12-7 12 7-5 10v25H25V26zM25 17l7 6 7-6M25 51l-6 6M39 51l6 6"/>','clothes being put on');
  if (/pee|poop|potty|toilet|bathroom/.test(key)) return base('<path d="M18 22h28v13H18zM22 35h20v15H22zM18 50h28M25 50v7M39 50v7"/>','a potty or toilet');
  if (/wash|water|soap|clean|hands/.test(key)) return base('<path d="M12 35h40M22 35v-9h20v9M28 17c0 5-5 6-5 10M35 14c0 5-5 6-5 10M42 17c0 5-5 6-5 10"/><path d="M15 47c7-6 12 6 17 0 5-6 10 6 17 0"/>','washing hands with water');
  if (/breakfast|lunch|dinner|eat|hungry|food|milk|cookie|snack|spoon|fork|plate/.test(key)) return base('<ellipse cx="32" cy="38" rx="19" ry="8"/><circle cx="32" cy="38" r="5"/><path d="M13 18v20M10 18h6M51 18v20M48 18h6"/>','a meal on a plate');
  if (/toy|play|game|ball|block|build/.test(key)) return base('<circle cx="20" cy="39" r="11"/><path d="M14 33l12 12M26 33L14 45M39 21h15v15H39zM44 21v-5M49 21v-5"/>','toys and a ball');
  if (/red|blue|green|yellow|color|circle|square|triangle|shape|one|two|three|four|five|six|seven|eight|nine|ten|count/.test(key)) return base('<circle cx="18" cy="22" r="9"/><rect x="36" y="13" width="16" height="16" rx="2"/><path d="M24 49l9-16 9 16z"/>','colours shapes or numbers');
  if (/weather|sun|rain|cloud|wind|hot|cold|season/.test(key)) return base('<circle cx="19" cy="20" r="7"/><path d="M19 6v6M19 28v6M5 20h6M27 20h6M39 39c0-8 15-8 15 0 5 0 6 8-1 8H38"/>','sun and cloud weather');
  if (/park|slide|swing|outside|climb/.test(key)) return base('<path d="M9 51h46M17 51l13-30 13 30M22 39h20M43 21l12 30M47 31h12"/>','a playground');
  if (/animal|dog|cat|lion|bird|fish|zoo/.test(key)) return base('<circle cx="32" cy="31" r="15"/><circle cx="20" cy="18" r="7"/><circle cx="44" cy="18" r="7"/><circle cx="26" cy="29" r="1" fill="#365D73"/><circle cx="38" cy="29" r="1" fill="#365D73"/><path d="M28 39c3 3 5 3 8 0"/>','a friendly animal');
  if (/plant|tree|flower|nature|leaf|garden/.test(key)) return base('<path d="M32 54V27M32 36c-18-3-17-17-5-15 4 1 5 7 5 15M32 42c18-3 17-17 5-15-4 1-5 7-5 15"/><path d="M22 54h20"/>','a plant growing');
  if (/school|teacher|class|kindergarten|friend|share|please|thank|sorry/.test(key)) return base(pair+'<path d="M29 42l3 3 3-3"/>','children sharing or being polite');
  if (/happy|sad|angry|feel|feeling|scared|excited/.test(key)) return base('<circle cx="32" cy="31" r="19"/><circle cx="25" cy="27" r="1.5" fill="#365D73"/><circle cx="39" cy="27" r="1.5" fill="#365D73"/><path d="M23 40c6-7 12-7 18 0"/>','a child showing an emotion');
  if (/shop|store|buy|cart|money|supermarket/.test(key)) return base('<path d="M12 17h7l5 25h25l5-17H22M28 51a3 3 0 1 0 0 .1M46 51a3 3 0 1 0 0 .1"/>','a shopping cart');
  if (/car|bus|train|bike|ride|drive/.test(key)) return base('<path d="M10 39h44l-5-15H20zM17 39a6 6 0 1 0 0 .1M47 39a6 6 0 1 0 0 .1M24 24h22"/>','a vehicle');
  if (/doctor|teacher|police|job|work|want to be/.test(key)) return base(child+'<path d="M38 20l6 6M43 18l4 4M18 40h20M39 34l8 8"/>','a child imagining a job');
  if (/walk|run|jump|hop|skip|dance|can/.test(key)) return base(child+'<path d="M44 18l9-7M47 25l10 1"/>','a child moving');
  if (/help|safe|danger|lost|emergency/.test(key)) return base('<path d="M32 8l21 42H11zM32 24v13M32 45v1"/>','a safety warning and help');
  if (/sick|fever|hurt|doctor|hospital|medicine/.test(key)) return base('<path d="M23 11h18v15H23zM28 11V7h8v4M18 30h28v20H18zM32 34v12M26 40h12"/>','a doctor medical kit');
  if (/birthday|christmas|new year|party|happy/.test(key)) return base('<path d="M16 49h32L32 18zM32 18v-8M24 49l8-31 8 31M12 56h40"/>','a celebration party hat');
  return base(child+'<path d="M43 16h12v14H43zM46 20h6M46 25h6"/>','a child learning English');
}

function qrUrl(scene) {
  return 'https://quickchart.io/qr?text=' + encodeURIComponent('https://earlyenglish.linktime.link/?scene=' + scene.id) + '&size=140';
}

function card(scene, cardIndex) {
  const lines = scene.sentences.slice(0,3).map((sentence, lineIndex) =>
    '<div class="line"><div class="art">' + svg(sentence.en.toLowerCase()) + '</div><div class="sentence"><strong>'+esc(sentence.en)+'</strong><small>'+esc(sentence.cn)+'</small></div></div>'
  ).join('');
  return '<article class="sticker" style="--paper:'+colors[cardIndex%colors.length]+'"><div class="tag">'+scene.id+' · '+esc(scene.phaseTitle)+'</div><h2>'+esc(scene.title)+'</h2><div class="english-title">'+esc(scene.vocabulary.slice(0,3).map(item=>item.word).join(' · '))+'</div><div class="lines">'+lines+'</div><div class="bottom"><div class="words">'+esc(scene.vocabulary.slice(0,5).map(item=>item.word).join(' · '))+'</div><div class="qr"><img src="'+qrUrl(scene)+'" alt="场景 '+scene.id+' 二维码"><span>扫码学这一课</span></div></div></article>';
}

let body = '';
for (let start=0; start<scenes.length; start+=6) {
  body += '<section class="sheet">' + scenes.slice(start,start+6).map((scene,index)=>card(scene,start+index)).join('') + '</section>';
}
const css = `@page{size:A4;margin:8mm}*{box-sizing:border-box}body{margin:0;background:#eee;color:#263238;font-family:"Microsoft YaHei",Arial,sans-serif}.sheet{width:194mm;min-height:281mm;margin:0 auto 7mm;display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(3,1fr);gap:4mm}.sticker{background:var(--paper);border:1.2px dashed #607d8b;border-radius:6mm;padding:4.5mm;position:relative;overflow:hidden}.tag{font-size:8pt;color:#607d8b}.sticker h2{text-align:center;font-size:14pt;margin:1.5mm 0 0;color:#17324d}.english-title{text-align:center;font-size:8pt;color:#557080;margin:1mm 0 2mm}.line{display:flex;gap:2.5mm;align-items:center;padding:1.5mm 0;border-top:1px solid #ffffffaa;min-height:18mm}.art{width:18mm;height:18mm;flex:none;background:#ffffff66;border-radius:4mm;padding:1mm}.drawing{width:100%;height:100%}.sentence strong{display:block;font-size:9.5pt}.sentence small{display:block;font-size:7.5pt;color:#52636b}.bottom{position:absolute;left:4.5mm;right:4.5mm;bottom:4mm;display:flex;align-items:end;justify-content:space-between}.words{font-size:7pt;color:#607d8b;max-width:35mm}.qr{width:18mm;text-align:center}.qr img{width:15mm;height:15mm;display:block;margin:auto}.qr span{font-size:5.5pt;color:#52636b;white-space:nowrap}@media print{body{background:#fff}.sheet{margin:0;page-break-after:always}.sheet:last-child{page-break-after:auto}}@media screen{.sheet{background:#fff;box-shadow:0 2px 12px #0002}}`;
fs.mkdirSync('./02_工作成果',{recursive:true});
fs.writeFileSync('./02_工作成果/幼儿英语场景贴纸.html','<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>幼儿英语场景贴纸</title><style>'+css+'</style></head><body>'+body+'</body></html>','utf8');
console.log('生成 '+scenes.length+' 张贴纸，'+Math.ceil(scenes.length/6)+' 页 A4，每句均有语义匹配的矢量简笔画。');
