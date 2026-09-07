const fs = require('fs');
const data = require('./data.js');
const scenes = data.phases.flatMap(phase =>
  phase.scenes.map(scene => ({ ...scene, phaseTitle: phase.title.replace(/^阶段\d+：/, '') }))
);
const colors = ['#FFF4D6','#E8F7FF','#F1E9FF','#E8F8EA','#FFE9EF','#FFF0DD'];
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
const pad = value => String(value).padStart(2, '0');
const qrUrl = scene => 'https://quickchart.io/qr?text=' + encodeURIComponent('https://earlyenglish.linktime.link/?scene=' + scene.id) + '&size=140';

function card(scene, cardIndex) {
  const lines = scene.sentences.slice(0,3).map((sentence, lineIndex) =>
    '<div class="line"><img class="sentence-image" src="贴纸插画/scene-'+pad(scene.id)+'-'+(lineIndex+1)+'.png" alt="'+esc(sentence.en)+' 的插画"><div class="sentence"><strong>'+esc(sentence.en)+'</strong><small>'+esc(sentence.cn)+'</small></div></div>'
  ).join('');
  return '<article class="sticker" style="--paper:'+colors[cardIndex%colors.length]+'"><div class="tag">'+scene.id+' · '+esc(scene.phaseTitle)+'</div><h2>'+esc(scene.title)+'</h2><div class="english-title">'+esc(scene.vocabulary.slice(0,3).map(item=>item.word).join(' · '))+'</div><div class="lines">'+lines+'</div><div class="bottom"><div class="words">'+esc(scene.vocabulary.slice(0,5).map(item=>item.word).join(' · '))+'</div><div class="qr"><img src="'+qrUrl(scene)+'" alt="场景 '+scene.id+' 二维码"><span>扫码学这一课</span></div></div></article>';
}
let body = '';
for (let start=0; start<scenes.length; start+=6) body += '<section class="sheet">' + scenes.slice(start,start+6).map((scene,index)=>card(scene,start+index)).join('') + '</section>';
const css = `@page{size:A4;margin:8mm}*{box-sizing:border-box}body{margin:0;background:#eee;color:#263238;font-family:"Microsoft YaHei",Arial,sans-serif}.sheet{width:194mm;min-height:281mm;margin:0 auto 7mm;display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(3,1fr);gap:4mm}.sticker{background:var(--paper);border:1.2px dashed #607d8b;border-radius:6mm;padding:4.5mm;position:relative;overflow:hidden}.tag{font-size:8pt;color:#607d8b}.sticker h2{text-align:center;font-size:14pt;margin:1.5mm 0 0;color:#17324d}.english-title{text-align:center;font-size:8pt;color:#557080;margin:1mm 0 2mm}.line{display:flex;gap:2.5mm;align-items:center;padding:1.5mm 0;border-top:1px solid #ffffffaa;min-height:18mm}.sentence-image{width:18mm;height:18mm;object-fit:cover;object-position:center;border-radius:4mm;flex:none;background:#fff}.sentence strong{display:block;font-size:9.5pt}.sentence small{display:block;font-size:7.5pt;color:#52636b}.bottom{position:absolute;left:4.5mm;right:4.5mm;bottom:4mm;display:flex;align-items:end;justify-content:space-between}.words{font-size:7pt;color:#607d8b;max-width:35mm}.qr{width:18mm;text-align:center}.qr img{width:15mm;height:15mm;display:block;margin:auto}.qr span{font-size:5.5pt;color:#52636b;white-space:nowrap}@media print{body{background:#fff}.sheet{margin:0;page-break-after:always}.sheet:last-child{page-break-after:auto}}@media screen{.sheet{background:#fff;box-shadow:0 2px 12px #0002}}`;
fs.writeFileSync('./02_工作成果/幼儿英语场景贴纸.html','<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>幼儿英语场景贴纸</title><style>'+css+'</style></head><body>'+body+'</body></html>','utf8');
console.log('已生成包含 96 张 image2 插画的可打印贴纸。');
