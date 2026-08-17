import type { AnatomyNode, Exercise } from '../types';

export const anatomyNodes: AnatomyNode[] = [
  {
    id: 'muscle.deltoid.anterior', moduleId: 'muscle.deltoid.anterior', color: '#3D82D9', region: '肩部', group: '肩部肌群', muscle: '三角肌', part: '前束', nameEn: 'Anterior Deltoid', side: 'front',
    hotspot: { left: '9%', top: '18%', width: '24%', height: '8%' }, hotspots: [{ left: '9%', top: '18%', width: '7%', height: '8%', radius: 18 }, { left: '26%', top: '18%', width: '7%', height: '8%', radius: 18 }], functions: ['肩关节屈曲', '肩关节内旋'], exerciseIds: ['dumbbell-shoulder-press', 'front-raise'],
  },
  {
    id: 'muscle.deltoid.middle', moduleId: 'muscle.deltoid.middle', color: '#3D82D9', region: '肩部', group: '肩部肌群', muscle: '三角肌', part: '中束', nameEn: 'Middle Deltoid', side: 'front',
    hotspot: { left: '9%', top: '18%', width: '24%', height: '9%' }, hotspots: [{ left: '9%', top: '18%', width: '5%', height: '9%', radius: 18 }, { left: '28%', top: '18%', width: '5%', height: '9%', radius: 18 }], functions: ['肩关节外展', '肱骨头稳定'], exerciseIds: ['lateral-raise', 'dumbbell-shoulder-press'],
  },
  {
    id: 'muscle.pectoralis-major.clavicular', moduleId: 'muscle.pectoralis-major.clavicular', color: '#F47732', region: '胸部', group: '胸部肌群', muscle: '胸大肌', part: '锁骨部', nameEn: 'Clavicular Pectoralis Major', side: 'front',
    hotspot: { left: '14%', top: '19%', width: '15%', height: '9%' }, hotspots: [{ left: '14%', top: '19%', width: '7%', height: '9%', radius: 22 }, { left: '21%', top: '19%', width: '8%', height: '9%', radius: 22 }], functions: ['肩关节水平内收', '肩关节屈曲'], exerciseIds: ['incline-dumbbell-press', 'push-up'],
  },
  {
    id: 'muscle.pectoralis-major.sternocostal', moduleId: 'muscle.pectoralis-major.sternocostal', color: '#F47732', region: '胸部', group: '胸部肌群', muscle: '胸大肌', part: '胸肋部', nameEn: 'Sternocostal Pectoralis Major', side: 'front',
    hotspot: { left: '14%', top: '23%', width: '15%', height: '7%' }, hotspots: [{ left: '14%', top: '23%', width: '7%', height: '7%', radius: 20 }, { left: '21%', top: '23%', width: '8%', height: '7%', radius: 20 }], functions: ['肩关节水平内收', '肩关节内收'], exerciseIds: ['parallel-bar-dip', 'push-up'],
  },
  {
    id: 'muscle.rectus-abdominis', moduleId: 'muscle.rectus-abdominis', color: '#83B83D', region: '核心', group: '前侧核心肌群', muscle: '腹直肌', part: '整体', nameEn: 'Rectus Abdominis', side: 'front',
    hotspot: { left: '17%', top: '28%', width: '8%', height: '20%' }, hotspots: [{ left: '17%', top: '28%', width: '8%', height: '20%', radius: 18 }], functions: ['躯干屈曲', '骨盆稳定'], exerciseIds: ['plank'],
  },
  {
    id: 'muscle.quadriceps.rectus-femoris', moduleId: 'muscle.quadriceps.rectus-femoris', color: '#42B7B5', region: '下肢', group: '膝伸肌群', muscle: '股四头肌', part: '股直肌', nameEn: 'Rectus Femoris', side: 'front',
    hotspot: { left: '12%', top: '46%', width: '18%', height: '25%' }, hotspots: [{ left: '12%', top: '46%', width: '7%', height: '25%', radius: 24 }, { left: '23%', top: '46%', width: '7%', height: '25%', radius: 24 }], functions: ['膝关节伸展', '髋关节屈曲'], exerciseIds: ['smith-squat', 'leg-press'],
  },
  {
    id: 'muscle.latissimus-dorsi', moduleId: 'muscle.latissimus-dorsi', color: '#83B83D', region: '背部', group: '背部肌群', muscle: '背阔肌', part: '整体', nameEn: 'Latissimus Dorsi', side: 'back',
    hotspot: { left: '71%', top: '22%', width: '16%', height: '14%' }, hotspots: [{ left: '71%', top: '22%', width: '8%', height: '14%', radius: 20 }, { left: '80%', top: '22%', width: '7%', height: '14%', radius: 20 }], functions: ['肩关节伸展', '肩关节内收'], exerciseIds: ['lat-pulldown'],
  },
  {
    id: 'muscle.gluteus-maximus', moduleId: 'muscle.gluteus-maximus', color: '#F47732', region: '臀部', group: '臀肌群', muscle: '臀大肌', part: '整体', nameEn: 'Gluteus Maximus', side: 'back',
    hotspot: { left: '70%', top: '41%', width: '17%', height: '12%' }, hotspots: [{ left: '70%', top: '41%', width: '8%', height: '12%', radius: 22 }, { left: '79%', top: '41%', width: '8%', height: '12%', radius: 22 }], functions: ['髋关节伸展', '骨盆稳定'], exerciseIds: ['smith-squat', 'hip-thrust'],
  },
  {
    id: 'muscle.gastrocnemius.medial-head', moduleId: 'muscle.gastrocnemius.medial-head', color: '#3D82D9', region: '小腿与足部', group: '小腿后侧肌群', muscle: '腓肠肌', part: '内侧头', nameEn: 'Medial Gastrocnemius', side: 'back',
    hotspot: { left: '70%', top: '69%', width: '18%', height: '18%' }, hotspots: [{ left: '70%', top: '69%', width: '7%', height: '18%', radius: 22 }, { left: '82%', top: '69%', width: '6%', height: '18%', radius: 22 }], functions: ['踝关节跖屈', '膝关节辅助屈曲'], exerciseIds: ['calf-raise'],
  },
  {
    id: 'muscle.neck', moduleId: 'muscle.neck', color: '#E23D42', region: '颈部', group: '颈部肌群', muscle: '颈部肌群', part: '整体', nameEn: 'Neck Muscles', side: 'both',
    hotspot: { left: '17%', top: '14%', width: '8%', height: '7%' }, hotspots: [{ left: '17%', top: '14%', width: '8%', height: '7%', radius: 16 }, { left: '74%', top: '10%', width: '8%', height: '11%', radius: 16 }], functions: ['颈椎稳定', '颈部屈伸控制'], exerciseIds: [],
  },
  {
    id: 'muscle.trapezius', moduleId: 'muscle.trapezius', color: '#FFC51A', region: '背部', group: '背部肌群', muscle: '斜方肌', part: '上束与中束', nameEn: 'Trapezius', side: 'back',
    hotspot: { left: '71%', top: '17%', width: '15%', height: '13%' }, hotspots: [{ left: '71%', top: '17%', width: '7%', height: '13%', radius: 20 }, { left: '79%', top: '17%', width: '7%', height: '13%', radius: 20 }], functions: ['肩胛骨上提', '肩胛骨后缩'], exerciseIds: ['dumbbell-shoulder-press', 'lat-pulldown'],
  },
  {
    id: 'muscle.deltoid.posterior', moduleId: 'muscle.deltoid.posterior', color: '#3D82D9', region: '肩部', group: '肩部肌群', muscle: '三角肌', part: '后束', nameEn: 'Posterior Deltoid', side: 'back',
    hotspot: { left: '66%', top: '18%', width: '28%', height: '9%' }, hotspots: [{ left: '66%', top: '18%', width: '8%', height: '9%', radius: 18 }, { left: '86%', top: '18%', width: '8%', height: '9%', radius: 18 }], functions: ['肩关节伸展', '肩关节水平外展'], exerciseIds: ['lat-pulldown'],
  },
  {
    id: 'muscle.biceps-brachii', moduleId: 'muscle.biceps-brachii', color: '#9755B5', region: '手臂', group: '手臂肌群', muscle: '肱二头肌', part: '整体', nameEn: 'Biceps Brachii', side: 'front',
    hotspot: { left: '7%', top: '24%', width: '28%', height: '11%' }, hotspots: [{ left: '7%', top: '24%', width: '7%', height: '11%', radius: 18 }, { left: '29%', top: '24%', width: '7%', height: '11%', radius: 18 }], functions: ['肘关节屈曲', '前臂旋后'], exerciseIds: [],
  },
  {
    id: 'muscle.triceps-brachii', moduleId: 'muscle.triceps-brachii', color: '#8070BC', region: '手臂', group: '手臂肌群', muscle: '肱三头肌', part: '整体', nameEn: 'Triceps Brachii', side: 'back',
    hotspot: { left: '63%', top: '24%', width: '33%', height: '12%' }, hotspots: [{ left: '63%', top: '24%', width: '8%', height: '12%', radius: 18 }, { left: '88%', top: '24%', width: '8%', height: '12%', radius: 18 }], functions: ['肘关节伸展', '肩关节伸展辅助'], exerciseIds: ['push-up'],
  },
  {
    id: 'muscle.forearm', moduleId: 'muscle.forearm', color: '#3BB0B9', region: '手臂', group: '前臂肌群', muscle: '前臂肌群', part: '整体', nameEn: 'Forearm Muscles', side: 'both',
    hotspot: { left: '5%', top: '33%', width: '32%', height: '15%' }, hotspots: [{ left: '5%', top: '33%', width: '8%', height: '15%', radius: 16 }, { left: '30%', top: '33%', width: '7%', height: '15%', radius: 16 }, { left: '61%', top: '33%', width: '8%', height: '15%', radius: 16 }, { left: '90%', top: '33%', width: '7%', height: '15%', radius: 16 }], functions: ['腕关节屈伸', '握力稳定'], exerciseIds: [],
  },
  {
    id: 'muscle.external-oblique', moduleId: 'muscle.external-oblique', color: '#FFC51A', region: '核心', group: '前侧核心肌群', muscle: '腹外斜肌', part: '整体', nameEn: 'External Oblique', side: 'front',
    hotspot: { left: '13%', top: '32%', width: '16%', height: '16%' }, hotspots: [{ left: '13%', top: '32%', width: '5%', height: '16%', radius: 18 }, { left: '23%', top: '32%', width: '6%', height: '16%', radius: 18 }], functions: ['躯干旋转', '躯干侧屈'], exerciseIds: ['plank'],
  },
  {
    id: 'muscle.hip-flexors', moduleId: 'muscle.hip-flexors', color: '#CB539B', region: '髋部', group: '髋部肌群', muscle: '髋屈肌群', part: '整体', nameEn: 'Hip Flexors', side: 'front',
    hotspot: { left: '15%', top: '46%', width: '12%', height: '15%' }, hotspots: [{ left: '15%', top: '46%', width: '6%', height: '15%', radius: 16 }, { left: '21%', top: '46%', width: '6%', height: '15%', radius: 16 }], functions: ['髋关节屈曲', '骨盆稳定'], exerciseIds: ['smith-squat'],
  },
  {
    id: 'muscle.adductors', moduleId: 'muscle.adductors', color: '#806FBC', region: '下肢', group: '下肢肌群', muscle: '股内收肌群', part: '整体', nameEn: 'Hip Adductors', side: 'front',
    hotspot: { left: '16%', top: '57%', width: '10%', height: '14%' }, hotspots: [{ left: '16%', top: '57%', width: '4%', height: '14%', radius: 16 }, { left: '22%', top: '57%', width: '4%', height: '14%', radius: 16 }], functions: ['髋关节内收', '骨盆稳定'], exerciseIds: ['smith-squat', 'leg-press'],
  },
  {
    id: 'muscle.gluteus-medius', moduleId: 'muscle.gluteus-medius', color: '#FFC51A', region: '臀部', group: '臀肌群', muscle: '臀中肌 / 臀小肌', part: '整体', nameEn: 'Gluteus Medius and Minimus', side: 'back',
    hotspot: { left: '68%', top: '44%', width: '21%', height: '11%' }, hotspots: [{ left: '68%', top: '44%', width: '4%', height: '11%', radius: 16 }, { left: '86%', top: '44%', width: '3%', height: '11%', radius: 16 }], functions: ['髋关节外展', '骨盆稳定'], exerciseIds: ['hip-thrust'],
  },
  {
    id: 'muscle.hamstrings', moduleId: 'muscle.hamstrings', color: '#806FBC', region: '下肢', group: '下肢肌群', muscle: '腘绳肌群', part: '整体', nameEn: 'Hamstrings', side: 'back',
    hotspot: { left: '69%', top: '52%', width: '19%', height: '19%' }, hotspots: [{ left: '69%', top: '52%', width: '8%', height: '19%', radius: 20 }, { left: '80%', top: '52%', width: '8%', height: '19%', radius: 20 }], functions: ['膝关节屈曲', '髋关节伸展'], exerciseIds: ['hip-thrust'],
  },
  {
    id: 'muscle.tibialis-anterior', moduleId: 'muscle.tibialis-anterior', color: '#CD927E', region: '小腿与足部', group: '小腿前侧肌群', muscle: '胫骨前肌', part: '整体', nameEn: 'Tibialis Anterior', side: 'front',
    hotspot: { left: '14%', top: '65%', width: '13%', height: '12%' }, hotspots: [{ left: '14%', top: '65%', width: '5%', height: '12%', radius: 14 }, { left: '21%', top: '65%', width: '5%', height: '12%', radius: 14 }], functions: ['踝关节背屈', '足弓控制'], exerciseIds: [],
  },
];

export const exercises: Exercise[] = [
  { id: 'smith-squat', name: '史密斯机深蹲', nameEn: 'Smith Machine Squat', target: '股四头肌', equipment: '史密斯机', location: '健身房', level: '中级', rating: 4.8, sets: 4, reps: '8–12', restSeconds: 90, steps: ['双脚约与肩同宽，杠铃置于斜方肌上部。', '收紧核心，髋膝同时屈曲并保持膝盖与脚尖同向。', '下降到大腿接近平行，脚掌稳定贴地。', '脚跟发力站起，避免膝关节锁死。'], mistakes: ['膝盖向内塌陷', '骨盆卷曲过度', '脚跟离地'], safety: '出现膝、髋或下背部锐痛时立即停止；先降低重量并检查站距。' },
  { id: 'leg-press', name: '腿举', nameEn: 'Leg Press', target: '股四头肌', equipment: '腿举机', location: '健身房', level: '初级', rating: 4.7, sets: 4, reps: '10–12', restSeconds: 90, steps: ['背部与臀部贴紧靠垫。', '双脚稳定踩在踏板中部。', '控制下放，膝盖保持与脚尖同向。', '推起时不锁死膝关节。'], mistakes: ['下放过深导致骨盆离垫', '膝盖内扣'], safety: '选择可以全程控制的重量，不要用手推膝盖完成最后几次。' },
  { id: 'incline-dumbbell-press', name: '哑铃上斜卧推', nameEn: 'Incline Dumbbell Press', target: '胸大肌锁骨部', equipment: '哑铃', location: '健身房', level: '初级', rating: 4.8, sets: 3, reps: '8–12', restSeconds: 75, steps: ['将训练凳调整为约 30 度。', '肩胛骨后缩下沉，双脚稳定。', '哑铃沿胸部上方控制下放。', '呼气推起，保持前臂接近垂直。'], mistakes: ['凳角过高变成肩推', '肩胛骨失去稳定'], safety: '肩前侧不适时减小下放深度并降低重量。' },
  { id: 'push-up', name: '标准俯卧撑', nameEn: 'Push-up', target: '胸大肌', equipment: '自重', location: '家庭', level: '新手', rating: 4.6, sets: 3, reps: '接近力竭', restSeconds: 60, steps: ['双手略宽于肩，身体保持直线。', '肘部约向后 45 度屈曲。', '胸部接近地面后推起。'], mistakes: ['塌腰', '耸肩', '头部前伸'], safety: '手腕不适可使用俯卧撑支架或哑铃握把。' },
  { id: 'dumbbell-shoulder-press', name: '哑铃肩推', nameEn: 'Dumbbell Shoulder Press', target: '三角肌前束', equipment: '哑铃', location: '健身房', level: '初级', rating: 4.7, sets: 4, reps: '8–10', restSeconds: 90, steps: ['坐姿保持躯干稳定。', '哑铃位于肩部两侧。', '向上推起但不碰撞哑铃。', '控制返回起始位置。'], mistakes: ['腰部过伸', '下降过深'], safety: '避免用超出控制能力的重量强行完成。' },
  { id: 'lateral-raise', name: '哑铃侧平举', nameEn: 'Dumbbell Lateral Raise', target: '三角肌中束', equipment: '哑铃', location: '健身房', level: '初级', rating: 4.8, sets: 4, reps: '12–15', restSeconds: 60, steps: ['双脚稳定站立，手肘保持轻微弯曲。', '以手肘带动手臂向身体两侧抬起。', '抬至接近肩高后短暂停顿。', '控制哑铃缓慢回到起始位置。'], mistakes: ['耸肩代偿', '借助身体摆动', '手腕高于手肘过多'], safety: '使用能够全程控制的重量；肩峰区域出现锐痛时停止动作。' },
  { id: 'parallel-bar-dip', name: '双杠臂屈伸', nameEn: 'Parallel Bar Dip', target: '胸大肌胸肋部', equipment: '双杠', location: '健身房', level: '中级', rating: 4.7, sets: 3, reps: '8–12', restSeconds: 90, steps: ['双手握住双杠并稳定肩胛骨。', '躯干适当前倾，手肘向后屈曲。', '下降到胸肩仍可稳定控制的位置。', '胸部和肱三头肌发力推回起始位置。'], mistakes: ['肩部过度前移', '下降幅度超出控制', '身体快速弹震'], safety: '肩前侧不适时缩短下降幅度，或先使用辅助双杠器械。' },
  { id: 'front-raise', name: '哑铃前平举', nameEn: 'Dumbbell Front Raise', target: '三角肌前束', equipment: '哑铃', location: '家庭', level: '初级', rating: 4.4, sets: 3, reps: '10–12', restSeconds: 60, steps: ['站立收紧核心。', '手臂微屈向前抬起。', '到肩高后控制下放。'], mistakes: ['借助身体摆动', '耸肩'], safety: '肩部撞击感明显时停止并调整活动范围。' },
  { id: 'lat-pulldown', name: '高位下拉', nameEn: 'Lat Pulldown', target: '背阔肌', equipment: '高位下拉机', location: '健身房', level: '初级', rating: 4.7, sets: 4, reps: '8–12', restSeconds: 75, steps: ['握距略宽于肩。', '先下沉肩胛再屈肘下拉。', '把手拉向上胸。', '控制回到伸展位。'], mistakes: ['身体后仰过多', '用手臂主导'], safety: '不要将把手拉到颈后。' },
  { id: 'hip-thrust', name: '杠铃臀推', nameEn: 'Barbell Hip Thrust', target: '臀大肌', equipment: '杠铃', location: '健身房', level: '中级', rating: 4.8, sets: 4, reps: '8–12', restSeconds: 90, steps: ['肩胛下缘靠在训练凳上。', '双脚与髋同宽。', '收紧核心并伸髋。', '顶端保持骨盆中立。'], mistakes: ['腰椎过伸', '双脚位置过远'], safety: '杠铃接触处使用护垫，避免压迫髋前侧。' },
  { id: 'plank', name: '平板支撑', nameEn: 'Plank', target: '核心', equipment: '自重', location: '家庭', level: '新手', rating: 4.6, sets: 3, reps: '30–45 秒', restSeconds: 45, steps: ['肘部位于肩部下方。', '从头到脚保持直线。', '正常呼吸并收紧核心。'], mistakes: ['塌腰', '臀部过高'], safety: '腰部疼痛时缩短持续时间或改用跪姿。' },
  { id: 'calf-raise', name: '站姿提踵', nameEn: 'Standing Calf Raise', target: '腓肠肌', equipment: '自重', location: '家庭', level: '新手', rating: 4.5, sets: 4, reps: '12–15', restSeconds: 60, steps: ['前脚掌稳定站立。', '脚跟缓慢抬高。', '顶端停顿后控制下放。'], mistakes: ['借助弹性快速反弹'], safety: '保持脚踝稳定，必要时扶住固定物。' },
];

export const regions = ['全身', '颈部', '肩部', '胸部', '背部', '手臂', '核心', '髋部', '臀部', '下肢', '小腿与足部'];

export const plans = [
  { id: 'full-body-beginner', title: '新手全身训练', duration: '3天/周 · 6周', level: '入门', target: '增肌 · 健康', exerciseCount: 6 },
  { id: 'ppl', title: '推拉腿三分化', duration: '6天/周 · 8周', level: '中级', target: '增肌 · 力量', exerciseCount: 18 },
  { id: 'home-fat-loss', title: '家庭自重减脂', duration: '4天/周 · 6周', level: '入门', target: '减脂 · 心肺', exerciseCount: 12 },
  { id: 'glute-foundation', title: '臀腿基础计划', duration: '3天/周 · 8周', level: '入门', target: '臀腿 · 塑形', exerciseCount: 10 },
];

export const foods = [
  { id: 'chicken-cooked', name: '鸡胸肉（熟）', serving: '100g', calories: 165, protein: 31, carbs: 0, fat: 3.6, source: 'FatSecret' },
  { id: 'chicken-raw', name: '鸡胸肉（生）', serving: '100g', calories: 110, protein: 23, carbs: 0, fat: 1.2, source: 'FatSecret' },
  { id: 'chicken-breast', name: '鸡胸肉（煎）', serving: '100g', calories: 175, protein: 30, carbs: 1, fat: 5, source: 'FatSecret' },
  { id: 'chicken-corn', name: '玉米鸡胸肉', serving: '100g', calories: 180, protein: 22, carbs: 10, fat: 4, source: 'YOU GYM' },
];
