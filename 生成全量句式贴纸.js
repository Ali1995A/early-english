const fs = require('fs');
const data = require('./data.js');
const palette = ['#FFF7E8','#F0F8FF','#F8F1FF','#EEFAF0','#FFF1F5','#F4F9E8','#FFF4E8','#EFF7F7'];
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
const pad = value => String(value).padStart(2, '0');
const qr = scene => 'https://quickchart.io/qr?text=' + encodeURIComponent('https://earlyenglish.linktime.link/?scene=' + scene.id) + '&size=110';
const cards = data.phases.flatMap(phase => phase.scenes.flatMap(scene => scene.sentences.map((sentence,index) => ({
  phase: phase.title.replace(/^阶段\d+：/, ''),
  scene,
  sentence,
  index,
}))));

function card(item, order) {
  const number = pad(item.index + 1);
  const sceneId = pad(item.scene.id);
  return '<article class="sticker" style="--paper:'+palette[order%palette.length]+'"><div class="top"><span class="scene">'+sceneId+' · '+esc(item.scene.title)+'</span><span class="number">'+number+'</span></div><img class="illustration" src="全量句式插画/scene-'+sceneId+'-'+number+'.png" alt="'+esc(item.sentence.en)+' 的插画"><div class="text"><div class="english">'+esc(item.sentence.en)+'</div><div class="chinese">'+esc(item.sentence.cn)+'</div></div><div class="footer"><span>'+esc(item.phase)+'</span><img src="'+qr(item.scene)+'" alt="场景二维码"></div></article>';
}
let body = '';
for (let start = 0; start < cards.length; start += 12) {
  body += '<section class="sheet">' + cards.slice(start,start+12).map((item,index)=>card(item,start+index)).join('') + '</section>';
}
const css = `@page{size:A4;margin:7mm}*{box-sizing:border-box}body{margin:0;background:#edf2f4;color:#23343f;font-family:"Microsoft YaHei",Arial,sans-serif}.sheet{width:196mm;min-height:283mm;margin:0 auto 7mm;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(4,1fr);gap:3.5mm}.sticker{background:var(--paper);border:1px dashed #78909c;border-radius:5mm;padding:3.2mm;position:relative;overflow:hidden;display:flex;flex-direction:column}.top{display:flex;justify-content:space-between;gap:2mm;font-size:6.5pt;color:#59707d;line-height:1.15}.scene{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.number{border:1px solid #aabcc5;border-radius:999px;padding:0 .9mm;background:#ffffff99}.illustration{width:100%;height:31mm;object-fit:cover;object-position:center;border-radius:3.5mm;background:#fff;margin:1.8mm 0}.text{min-height:15mm;text-align:center;padding:0 .5mm}.english{font-family:Georgia,"Times New Roman",serif;font-size:9.2pt;font-weight:700;line-height:1.16;color:#173e55}.chinese{font-size:7.1pt;line-height:1.25;color:#52636b;margin-top:1mm}.footer{margin-top:auto;display:flex;align-items:center;justify-content:space-between;font-size:5.8pt;color:#71838c}.footer img{width:11mm;height:11mm;background:#fff;padding:.5mm;border-radius:1mm}@media print{body{background:#fff}.sheet{margin:0;page-break-after:always}.sheet:last-child{page-break-after:auto}}@media screen{.sheet{background:#fff;box-shadow:0 2px 14px #0002}}`;
fs.writeFileSync('./02_工作成果/幼儿英语_全量句式贴纸.html','<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>幼儿英语全量句式贴纸</title><style>'+css+'</style></head><body>'+body+'</body></html>','utf8');
console.log('生成 '+cards.length+' 张独立句式贴纸，共 '+Math.ceil(cards.length/12)+' 页 A4。');
