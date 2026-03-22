const d = require('./data.js');
console.log('阶段数:', d.phases.length);
console.log('场景数:', d.phases.reduce((a, p) => a + p.scenes.length, 0));
d.phases.forEach((p, i) => {
  console.log(`阶段${i+1}: ${p.title}, ${p.scenes.length}个场景`);
  p.scenes.forEach(s => {
    console.log(`  - ${s.icon} ${s.title}: ${s.sentences.length}句口语, ${s.vocabulary.length}个词汇`);
  });
});
