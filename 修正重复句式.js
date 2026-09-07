const fs = require('fs');
const path = require('path');

// Keep the first, most representative occurrence of each exact sentence.  Each
// later occurrence becomes a distinct, age-appropriate expression for its scene.
const replacements = [
  ['21', 'See you tomorrow.', 'See you next time.', '下次见。'],
  ['24', 'I am happy.', 'I feel happy.', '我感到很开心。'],
  ['05', 'I am tired.', 'I feel sleepy.', '我困了。'],
  ['24', 'I am tired.', 'I need a rest.', '我需要休息。'],
  ['32', 'This is my mom.', 'This is my mother.', '这是我的妈妈。'],
  ['32', 'I have a big family.', 'My family is big.', '我的家人很多。'],
  ['21', 'I want my mommy.', 'I want to see Mommy.', '我想见妈妈。'],
  ['32', 'I love my family.', 'I love my whole family.', '我爱我的全家。'],
  ['30', 'Open your mouth.', 'Open wide, please.', '请把嘴巴张大。'],
  ['07', 'Wash your hands.', 'Wash up, please.', '请洗洗手。'],
  ['07', 'Sit down.', 'Sit on the potty.', '坐到小马桶上。'],
  ['18', 'Be careful.', 'Hold on tight.', '抓紧一点。'],
  ['29', 'Be careful!', 'Stay safe!', '注意安全！'],
  ['29', 'Watch out!', 'Watch where you go!', '走路要看路！'],
  ['13', "Let's play!", "Let's play together!", '我们一起玩吧！'],
  ['10', 'I like it.', 'I like this food.', '我喜欢这个食物。'],
  ['10', "I don't like it.", "I don't want this food.", '我不想吃这个食物。'],
  ['07', "It's okay.", 'No worries.', '没事的。'],
  ['22', "It's okay.", "That's all right.", '没关系。'],
  ['07', 'Good job!', 'Well done!', '做得真好！'],
  ['18', 'Five more minutes.', 'Five more minutes, please.', '请再玩五分钟。'],
  ['24', "Don't be scared.", "Don't worry.", '别担心。'],
  ['30', "Don't be scared.", "You're safe here.", '这里很安全。'],
  ['07', 'Put on your pants.', 'Put your pants back on.', '把裤子穿回去。'],
  ['21', 'Put on your shoes.', 'Put your shoes on, please.', '请把鞋子穿上。'],
  ['09', 'All done!', 'All finished!', '都吃完了！'],
  ['10', 'I am done.', 'I have finished eating.', '我吃完了。'],
  ['08', 'Dry your hands.', 'Pat your hands dry.', '把手轻轻拍干。'],
  ['16', 'One, two, three.', "Let's count: one, two, three.", '我们数数：一、二、三。'],
  ['24', 'I am hungry.', 'I want a snack.', '我想吃点心。'],
  ['11', "That's enough.", 'No more, thank you.', '不用了，谢谢。'],
  ['24', 'I am thirsty.', 'I need a drink.', '我想喝水。'],
  ['10', 'Use your spoon.', 'Eat with your spoon.', '用勺子吃。'],
  ['21', 'Time for lunch.', 'Lunch is ready.', '午餐准备好了。'],
  ['22', 'Can I have a turn?', 'May I have a turn, please?', '请问可以轮到我吗？'],
  ['18', "It's my turn.", "It's my turn on the slide.", '轮到我玩滑梯了。'],
  ['22', "It's my turn.", "Now it's my turn.", '现在轮到我了。'],
  ['18', 'Wait your turn.', 'Please wait for your turn.', '请等轮到你。'],
  ['21', 'Clean up time.', 'Time to tidy up.', '该整理好了。'],
  ['22', 'This is fun.', 'Playing together is fun.', '一起玩真有趣。'],
  ['24', 'I am bored.', 'I need something to do.', '我想找点事做。'],
  ['32', 'My favorite color is red.', 'Red is my favorite color.', '红色是我最喜欢的颜色。'],
  ['17', 'The sky is blue.', 'The sky looks blue today.', '今天的天空看起来是蓝色的。'],
  ['20', 'The grass is green.', 'The grass feels soft and green.', '草又软又绿。'],
  ['31', 'I am five years old.', 'I am turning five.', '我快五岁了。'],
  ['32', 'I am five years old.', "I'm five.", '我五岁。'],
  ['32', 'I can count to ten.', 'I can count from one to ten.', '我能从一数到十。'],
  ['21', "Let's go outside.", 'Shall we play outside?', '我们出去玩吗？'],
  ['29', 'Stop!', 'Stop right there!', '立刻停下！'],
  ['32', 'I see a dog.', 'Look, a dog!', '看，一只狗！'],
  ['32', 'The dog says woof.', 'A dog goes "woof".', '小狗会“汪汪”叫。'],
  ['32', 'I go to kindergarten.', 'I go to school.', '我去上学。'],
  ['32', 'I have many friends.', 'I have lots of friends.', '我有很多朋友。'],
  ['23', 'I am sorry.', 'Sorry about that.', '这件事对不起。'],
  ['29', "Don't touch!", 'Hands off!', '不要碰！'],
  ['01', 'Night night!', 'Sweet dreams!', '祝你好梦！'],
  ['05', 'Good night, Daddy.', 'Sleep tight, Daddy.', '爸爸，睡个好觉。'],
];

const cardDir = path.join(__dirname, '场景卡片');
const files = fs.readdirSync(cardDir);
for (const [sceneId, oldEn, newEn, newCn] of replacements) {
  const file = files.find(name => name.startsWith(`场景${sceneId}_`));
  if (!file) throw new Error(`Scene ${sceneId} source was not found.`);
  const filePath = path.join(cardDir, file);
  const original = fs.readFileSync(filePath, 'utf8');
  const needle = `| ${oldEn} |`;
  const found = original.split(needle).length - 1;
  if (found !== 1) throw new Error(`${file}: expected one table row for ${oldEn}, found ${found}.`);
  const updated = original.replace(needle, `| ${newEn} |`);
  // The English replacement above is deliberately narrow; update the matching
  // Chinese cell in the same table row without touching dialogue examples.
  const linePattern = new RegExp(`(\\| ${newEn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\| )[^|]+( \\| [^|]+ \\|)`);
  const finalText = updated.replace(linePattern, `$1${newCn}$2`);
  fs.writeFileSync(filePath, finalText, 'utf8');
}

console.log(`Updated ${replacements.length} sentence rows in the canonical scene cards.`);
