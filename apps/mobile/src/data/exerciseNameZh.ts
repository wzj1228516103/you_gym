const exactNames: Record<string, string> = {
  '3/4 sit-up': '3/4 仰卧起坐',
  '45° side bend': '45° 侧屈',
  'air bike': '空中自行车',
  'assisted chest dip (kneeling)': '跪姿辅助双杠臂屈伸',
  'assisted triceps dip (kneeling)': '跪姿辅助肱三头肌臂屈伸',
  'barbell pullover to press': '杠铃上拉推举',
  'all fours squad stretch': '四点支撑股四头肌拉伸',
  'archer push up': '弓箭手俯卧撑',
  'archer pull up': '弓箭手引体向上',
};

const phraseNames: Array<[RegExp, string]> = [
  [/\bassisted chest dip kneeling\b/g, '跪姿辅助双杠臂屈伸'],
  [/\bassisted triceps dip kneeling\b/g, '跪姿辅助肱三头肌臂屈伸'],
  [/\bassisted hanging knee raise\b/g, '辅助悬垂举膝'],
  [/\bassisted lying leg raise\b/g, '辅助仰卧抬腿'],
  [/\bassisted lying calves stretch\b/g, '辅助仰卧小腿拉伸'],
  [/\bassisted lying glutes stretch\b/g, '辅助仰卧臀肌拉伸'],
  [/\bassisted lying gluteus and piriformis stretch\b/g, '辅助仰卧臀肌与梨状肌拉伸'],
  [/\bbarbell pullover to press\b/g, '杠铃上拉推举'],
  [/\bbench press\b/g, '卧推'],
  [/\bchest fly\b/g, '夹胸'],
  [/\bchest dip\b/g, '双杠臂屈伸'],
  [/\btriceps dip\b/g, '肱三头肌臂屈伸'],
  [/\bpush[- ]up\b/g, '俯卧撑'],
  [/\bpull[- ]up\b/g, '引体向上'],
  [/\bchin[- ]up\b/g, '反握引体向上'],
  [/\bsit[- ]up\b/g, '仰卧起坐'],
  [/\bshoulder press\b/g, '肩推'],
  [/\bleg press\b/g, '腿举'],
  [/\bleg extension\b/g, '腿屈伸'],
  [/\bleg curl\b/g, '腿弯举'],
  [/\bcalf raise\b/g, '提踵'],
  [/\bfront raise\b/g, '前平举'],
  [/\blateral raise\b/g, '侧平举'],
  [/\brear delt\b/g, '后三角肌'],
  [/\btriceps extension\b/g, '肱三头肌屈伸'],
  [/\bbiceps curl\b/g, '肱二头肌弯举'],
  [/\bwrist curl\b/g, '腕弯举'],
  [/\bhip thrust\b/g, '臀推'],
  [/\brussian twist\b/g, '俄罗斯转体'],
  [/\bwall sit\b/g, '靠墙静蹲'],
  [/\bstep up\b/g, '登台阶'],
  [/\bgood morning\b/g, '早安式'],
  [/\bdeadlift\b/g, '硬拉'],
  [/\bpulldown\b/g, '下拉'],
  [/\bkickback\b/g, '后踢'],
  [/\brollerout\b/g, '滚轮伸展'],
  [/\bpullover\b/g, '上拉'],
  [/\bclose grip\b/g, '窄握'],
  [/\bwide grip\b/g, '宽握'],
  [/\breverse grip\b/g, '反握'],
  [/\bguillotine\b/g, '颈前'],
  [/\bskull crusher\b/g, '仰卧臂屈伸'],
  [/\bskull\b/g, '仰卧臂屈伸'],
  [/\bjm\b/g, 'JM'],
  [/\bclean and press\b/g, '翻举推举'],
  [/\bpush press\b/g, '借力推举'],
  [/\bpower\b/g, '力量式'],
  [/\bdecline\b/g, '下斜'],
  [/\bincline\b/g, '上斜'],
  [/\bseated\b/g, '坐姿'],
  [/\bstanding\b/g, '站姿'],
  [/\blying\b/g, '仰卧'],
  [/\bbent over\b/g, '俯身'],
  [/\bunderhand\b/g, '反握'],
  [/\boverhand\b/g, '正握'],
  [/\bneutral grip\b/g, '中立握'],
];

const wordNames: Record<string, string> = {
  assisted: '辅助', alternate: '交替', alternating: '交替', ankle: '脚踝', arm: '手臂', arms: '手臂',
  back: '背部', ball: '球', bar: '杠', barbell: '杠铃', behind: '身后', bent: '屈曲', bicep: '肱二头肌', biceps: '肱二头肌',
  body: '身体', bodyweight: '自重', bosu: '半球平衡球', cable: '绳索', calf: '小腿', calves: '小腿', clean: '挺举', close: '窄握',
  concentration: '集中式', cross: '交叉', crunch: '卷腹', decline: '下斜', delt: '三角肌', delts: '三角肌', dip: '臂屈伸',
  double: '双侧', dumbbell: '哑铃', ez: 'EZ', exercise: '训练', extension: '屈伸', female: '女性', floor: '地板', fly: '飞鸟',
  forward: '向前', full: '完整', grip: '握法', hamstring: '腘绳肌', hanging: '悬垂', hands: '双手', head: '头部', high: '高位',
  hip: '髋部', incline: '上斜', inner: '内侧', inverse: '反向', inverted: '倒立', jump: '跳跃', kettlebell: '壶铃', knee: '膝', knees: '膝盖',
  kneeling: '跪姿', lat: '背阔肌', lateral: '侧向', lever: '杠杆机', leg: '腿部', legs: '双腿', lift: '举起', lying: '仰卧', low: '低位',
  machine: '器械', medicine: '药球', military: '军事推举', narrow: '窄距', neutral: '中立握', neck: '颈部', overhead: '头顶', parallel: '双杠',
  palms: '掌心', palm: '掌心', planche: '俄挺', plank: '平板支撑', prone: '俯卧', pov: '视角', preacher: '牧师凳', press: '推举', pull: '拉',
  raise: '抬举', rear: '后侧', revers: '反向', reverse: '反向', resistance: '阻力', rope: '绳索', row: '划船', run: '跑步', seated: '坐姿',
  shoulder: '肩部', side: '侧向', single: '单侧', sit: '坐姿', smith: '史密斯', snatch: '抓举', squat: '深蹲', stability: '稳定球', standing: '站姿',
  step: '台阶', straight: '直腿', stretch: '拉伸', suspended: '悬吊', supine: '仰卧', throw: '抛投', toe: '脚趾', towel: '毛巾', tricep: '肱三头肌',
  triceps: '肱三头肌', twist: '转体', twisting: '转体', upright: '直立', v: 'V字', vertical: '垂直', weighted: '负重', wide: '宽握', wall: '墙面',
  wheel: '轮', wrist: '腕部', zottman: '佐特曼', pullover: '上拉',
  guillotine: '颈前', skull: '仰卧臂屈伸', jm: 'JM', serratus: '前锯肌', oblique: '腹斜肌', obliques: '腹斜肌',
  flexors: '屈肌', stabilizers: '稳定肌', shoulders: '肩部', piriformis: '梨状肌', gluteus: '臀肌',
};

const ignoredWords = new Set(['a', 'an', 'and', 'at', 'by', 'for', 'from', 'in', 'of', 'on', 'over', 'the', 'to', 'through', 'two', 'with']);

export function translateExerciseName(value: string | null | undefined) {
  const original = value?.trim() ?? '';
  if (!original || /[\u3400-\u9fff]/.test(original)) return original;
  const exact = exactNames[original.toLowerCase()];
  if (exact) return exact;

  let normalized = original.toLowerCase().replace(/[()]/g, ' ').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [pattern, replacement] of phraseNames) normalized = normalized.replace(pattern, replacement);
  const translated = normalized.split(' ').filter(Boolean).map((token) => {
    if (/^[0-9/.°-]+$/.test(token)) return token;
    if (/^[\u3400-\u9fff]/.test(token)) return token;
    if (ignoredWords.has(token)) return '';
    return wordNames[token] ?? '';
  }).filter(Boolean).join('');
  return translated || original;
}
