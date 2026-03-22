const fs = require('fs');
const path = require('path');

// 场景配置
const sceneConfig = [
  { phase: 1, scenes: ['场景01_问候与告别', '场景02_家庭成员称呼', '场景03_身体部位', '场景04_基础指令'] },
  { phase: 2, scenes: ['场景05_起床与睡觉', '场景06_穿衣服', '场景07_上厕所', '场景08_洗手'] },
  { phase: 3, scenes: ['场景09_早餐', '场景10_午餐与晚餐', '场景11_零食时间', '场景12_餐具与食物'] },
  { phase: 4, scenes: ['场景13_玩具与游戏', '场景14_颜色认知', '场景15_形状认知', '场景16_数字1到10'] },
  { phase: 5, scenes: ['场景17_天气与季节', '场景18_公园游玩', '场景19_动物世界', '场景20_植物与自然'] },
  { phase: 6, scenes: ['场景21_幼儿园生活', '场景22_朋友与分享', '场景23_礼貌用语', '场景24_情绪表达'] },
  { phase: 7, scenes: ['场景25_购物场景', '场景26_交通工具', '场景27_职业认知', '场景28_动作与活动'] },
  { phase: 8, scenes: ['场景29_安全与求助', '场景30_生病看医生', '场景31_节日庆祝', '场景32_综合复习'] }
];

const phaseTitles = [
  '基础认知',
  '日常生活',
  '用餐时光',
  '游戏与学习',
  '户外探索',
  '社交互动',
  '综合能力',
  '进阶应用'
];

const phaseDescriptions = [
  '适合刚开始接触英语的幼儿，建立最基本的语言框架。',
  '围绕幼儿每日作息，学习与日常生活密切相关的表达。',
  '聚焦用餐场景，学习与食物、餐具、用餐礼仪相关的表达。',
  '通过游戏和认知活动，扩展词汇量和表达能力。',
  '扩展至户外场景，认识自然世界。',
  '帮助幼儿学习社交技能，表达情感和礼貌用语。',
  '拓展更复杂的生活场景，提升综合运用能力。',
  '强化安全意识，学习应对各种生活场景。'
];

const sceneIcons = {
  '场景01_问候与告别': '👋',
  '场景02_家庭成员称呼': '👨‍👩‍👧‍👦',
  '场景03_身体部位': '👶',
  '场景04_基础指令': '👂',
  '场景05_起床与睡觉': '🛏️',
  '场景06_穿衣服': '👕',
  '场景07_上厕所': '🚽',
  '场景08_洗手': '🧼',
  '场景09_早餐': '🍳',
  '场景10_午餐与晚餐': '🍽️',
  '场景11_零食时间': '🍪',
  '场景12_餐具与食物': '🥄',
  '场景13_玩具与游戏': '🧸',
  '场景14_颜色认知': '🎨',
  '场景15_形状认知': '🔵',
  '场景16_数字1到10': '🔢',
  '场景17_天气与季节': '☀️',
  '场景18_公园游玩': '🛝',
  '场景19_动物世界': '🦁',
  '场景20_植物与自然': '🌳',
  '场景21_幼儿园生活': '🏫',
  '场景22_朋友与分享': '🤝',
  '场景23_礼貌用语': '💝',
  '场景24_情绪表达': '😊',
  '场景25_购物场景': '🛒',
  '场景26_交通工具': '🚗',
  '场景27_职业认知': '👮',
  '场景28_动作与活动': '🏃',
  '场景29_安全与求助': '🚨',
  '场景30_生病看医生': '🏥',
  '场景31_节日庆祝': '🎉',
  '场景32_综合复习': '📚'
};

function parseMarkdown(content) {
  const scene = {
    sentences: [],
    vocabulary: [],
    dialogs: [],
    games: [],
    review: [],
    tips: ''
  };

  // 提取场景说明
  const descMatch = content.match(/## 场景说明\s*\n([\s\S]*?)(?=\n## |$)/);
  if (descMatch) {
    scene.description = descMatch[1].trim();
  }

  // 提取核心口语 - 使用更简单的匹配
  const sentencesSection = content.match(/## 核心口语[^(]*(?:\([^)]*\))?\s*\n\s*\|[^|]+\|[^|]+\|[^|]+\|\s*\n\s*\|[-:|\s]+\|\s*\n([\s\S]*?)(?=\n## |$)/);
  if (sentencesSection) {
    const lines = sentencesSection[1].trim().split('\n').filter(l => l.trim() && l.includes('|'));
    for (const line of lines) {
      const parts = line.split('|').filter(p => p.trim());
      if (parts.length >= 3) {
        scene.sentences.push({
          en: parts[0].trim(),
          cn: parts[1].trim(),
          tone: parts[2].trim()
        });
      }
    }
  }

  // 提取核心词汇
  const vocabSection = content.match(/## 核心词汇[^(]*(?:\([^)]*\))?\s*\n\s*\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|\s*\n\s*\|[-:|\s]+\|\s*\n([\s\S]*?)(?=\n## |$)/);
  if (vocabSection) {
    const lines = vocabSection[1].trim().split('\n').filter(l => l.trim() && l.includes('|'));
    for (const line of lines) {
      const parts = line.split('|').filter(p => p.trim());
      if (parts.length >= 4) {
        scene.vocabulary.push({
          word: parts[0].trim(),
          phonetic: parts[1].trim(),
          pos: parts[2].trim(),
          cn: parts[3].trim()
        });
      }
    }
  }

  // 提取亲子对话 - 更简单的解析
  const dialogSection = content.match(/## 亲子对话示例\s*\n([\s\S]*?)(?=\n## |$)/);
  if (dialogSection) {
    const dialogText = dialogSection[1];
    // 按对话组分割
    const dialogGroups = dialogText.split(/\*\*对话\d+[^*]*\*\*/).filter(g => g.trim());
    for (const group of dialogGroups) {
      const lines = group.trim().split('\n').filter(l => l.trim());
      const dialogGroup = [];
      for (const line of lines) {
        // 匹配：- 家长：内容 或 -家长：内容
        const match = line.match(/^[-–]\s*(\S+)[:：]\s*(.+)/);
        if (match) {
          dialogGroup.push({
            speaker: match[1].trim(),
            text: match[2].trim()
          });
        }
      }
      if (dialogGroup.length > 0) {
        scene.dialogs.push(dialogGroup);
      }
    }
  }

  // 提取游戏活动
  const gamesSection = content.match(/## 教学建议与游戏活动\s*\n([\s\S]*?)(?=\n## |$)/);
  if (gamesSection) {
    const gameBlocks = gamesSection[1].split(/### 游戏\d+[:：]/).filter(g => g.trim());
    for (const block of gameBlocks) {
      const lines = block.trim().split('\n').filter(l => l.trim());
      if (lines.length > 0) {
        const title = lines[0].replace(/^[-\s]+/, '').trim();
        const desc = lines.slice(1).join(' ').trim();
        scene.games.push({ title, desc });
      }
    }
  }

  // 提取复习要点
  const reviewSection = content.match(/## 复习要点\s*\n([\s\S]*?)(?=\n## |$)/);
  if (reviewSection) {
    const lines = reviewSection[1].trim().split('\n').filter(l => l.trim());
    for (const line of lines) {
      // 匹配：- [ ] 内容 或 - 内容 或 -[ ]内容
      const match = line.match(/^[-–\*]\s*(?:\[\s*\])?\s*(.+)/);
      if (match) {
        scene.review.push(match[1].trim());
      }
    }
  }

  // 提取家长贴士
  const tipsSection = content.match(/## 家长贴士\s*\n([\s\S]*?)(?=\n## |$)/);
  if (tipsSection) {
    scene.tips = tipsSection[1].trim();
  }

  return scene;
}

function parseSceneFile(filename) {
  const filepath = path.join(__dirname, '场景卡片', filename + '.md');
  const content = fs.readFileSync(filepath, 'utf-8');

  // 提取场景编号和标题
  const match = filename.match(/场景(\d+)_(.+)/);
  const sceneNum = match ? match[1] : '00';
  const sceneTitle = match ? match[2] : filename;

  const parsed = parseMarkdown(content);

  return {
    id: sceneNum,
    title: sceneTitle,
    icon: sceneIcons[filename] || '📝',
    sentenceCount: parsed.sentences.length,
    vocabCount: parsed.vocabulary.length,
    ...parsed
  };
}

// 生成数据
const courseData = {
  phases: []
};

for (let i = 0; i < sceneConfig.length; i++) {
  const config = sceneConfig[i];
  const phase = {
    id: config.phase,
    title: `阶段${config.phase}：${phaseTitles[i]}`,
    description: phaseDescriptions[i],
    scenes: []
  };

  for (const sceneFile of config.scenes) {
    phase.scenes.push(parseSceneFile(sceneFile));
  }

  courseData.phases.push(phase);
}

// 生成JS文件
const jsContent = `// 幼儿英语口语教程数据
// 自动生成于 ${new Date().toISOString()}

const courseData = ${JSON.stringify(courseData, null, 2)};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = courseData;
}
`;

fs.writeFileSync(path.join(__dirname, 'data.js'), jsContent, 'utf-8');
console.log('数据文件已生成: data.js');

// 统计
let totalScenes = 0;
let totalSentences = 0;
let totalVocab = 0;
for (const phase of courseData.phases) {
  totalScenes += phase.scenes.length;
  for (const scene of phase.scenes) {
    totalSentences += scene.sentences.length;
    totalVocab += scene.vocabulary.length;
  }
}

console.log(`共 ${courseData.phases.length} 个阶段, ${totalScenes} 个场景`);
console.log(`核心口语: ${totalSentences} 句, 核心词汇: ${totalVocab} 个`);
