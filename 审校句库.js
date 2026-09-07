const fs = require('fs');
const vm = require('vm');

const source = fs.readFileSync('data.js', 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(`${source}; globalThis.course = courseData;`, context);

function normalizeEnglish(value) {
  return value
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^a-z0-9' ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const rows = [];
for (const phase of context.course.phases) {
  for (const scene of phase.scenes) {
    scene.sentences.forEach((sentence, index) => rows.push({
      sceneId: scene.id,
      sceneTitle: scene.title,
      index: index + 1,
      en: sentence.en,
      cn: sentence.cn,
      tone: sentence.tone,
      normalized: normalizeEnglish(sentence.en),
    }));
  }
}

const grouped = new Map();
for (const row of rows) {
  const group = grouped.get(row.normalized) || [];
  group.push(row);
  grouped.set(row.normalized, group);
}

const duplicateGroups = [...grouped.values()].filter(group => group.length > 1);
const output = {
  total: rows.length,
  exactDuplicateGroups: duplicateGroups.length,
  duplicateRowsBeyondFirst: duplicateGroups.reduce((total, group) => total + group.length - 1, 0),
  groups: duplicateGroups,
};

console.log(JSON.stringify(output, null, 2));
