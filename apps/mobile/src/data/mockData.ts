import type { AnatomyNode, Exercise } from '../types';

export const anatomyNodes: AnatomyNode[] = [
  {
    id: 'muscle.deltoid.anterior', region: '肩部', group: '肩部肌群', muscle: '三角肌', part: '前束', nameEn: 'Anterior Deltoid', side: 'front',
    hotspot: { left: '12%', top: '18%', width: '29%', height: '14%' }, functions: ['肩关节屈曲', '肩关节内旋'], exerciseIds: ['dumbbell-shoulder-press', 'front-raise'],
  },
  {
    id: 'muscle.pectoralis-major.clavicular', region: '胸部', group: '胸部肌群', muscle: '胸大肌', part: '锁骨部', nameEn: 'Clavicular Pectoralis Major', side: 'front',
    hotspot: { left: '17%', top: '26%', width: '20%', height: '12%' }, functions: ['肩关节水平内收', '肩关节屈曲'], exerciseIds: ['incline-dumbbell-press', 'push-up'],
  },
  {
    id: 'muscle.rectus-abdominis', region: '核心', group: '前侧核心肌群', muscle: '腹直肌', part: '整体', nameEn: 'Rectus Abdominis', side: 'front',
    hotspot: { left: '21%', top: '38%', width: '12%', height: '20%' }, functions: ['躯干屈曲', '骨盆稳定'], exerciseIds: ['plank'],
  },
  {
    id: 'muscle.quadriceps.rectus-femoris', region: '下肢', group: '膝伸肌群', muscle: '股四头肌', part: '股直肌', nameEn: 'Rectus Femoris', side: 'front',
    hotspot: { left: '18%', top: '58%', width: '20%', height: '25%' }, functions: ['膝关节伸展', '髋关节屈曲'], exerciseIds: ['smith-squat', 'leg-press'],
  },
  {
    id: 'muscle.latissimus-dorsi', region: '背部', group: '背部肌群', muscle: '背阔肌', part: '整体', nameEn: 'Latissimus Dorsi', side: 'back',
    hotspot: { left: '64%', top: '28%', width: '22%', height: '25%' }, functions: ['肩关节伸展', '肩关节内收'], exerciseIds: ['lat-pulldown'],
  },
  {
    id: 'muscle.gluteus-maximus', region: '臀部', group: '臀肌群', muscle: '臀大肌', part: '整体', nameEn: 'Gluteus Maximus', side: 'back',
    hotspot: { left: '65%', top: '49%', width: '20%', height: '16%' }, functions: ['髋关节伸展', '骨盆稳定'], exerciseIds: ['smith-squat', 'hip-thrust'],
  },
  {
    id: 'muscle.gastrocnemius.medial-head', region: '小腿与足部', group: '小腿后侧肌群', muscle: '腓肠肌', part: '内侧头', nameEn: 'Medial Gastrocnemius', side: 'back',
    hotspot: { left: '68%', top: '73%', width: '14%', height: '20%' }, functions: ['踝关节跖屈', '膝关节辅助屈曲'], exerciseIds: ['calf-raise'],
  },
];

export const exercises: Exercise[] = [
  { id: 'smith-squat', name: '史密斯机深蹲', nameEn: 'Smith Machine Squat', target: '股四头肌', equipment: '史密斯机', location: '健身房', level: '中级', rating: 4.8, sets: 4, reps: '8–12', restSeconds: 90, steps: ['双脚约与肩同宽，杠铃置于斜方肌上部。', '收紧核心，髋膝同时屈曲并保持膝盖与脚尖同向。', '下降到大腿接近平行，脚掌稳定贴地。', '脚跟发力站起，避免膝关节锁死。'], mistakes: ['膝盖向内塌陷', '骨盆卷曲过度', '脚跟离地'], safety: '出现膝、髋或下背部锐痛时立即停止；先降低重量并检查站距。' },
  { id: 'leg-press', name: '腿举', nameEn: 'Leg Press', target: '股四头肌', equipment: '腿举机', location: '健身房', level: '初级', rating: 4.7, sets: 4, reps: '10–12', restSeconds: 90, steps: ['背部与臀部贴紧靠垫。', '双脚稳定踩在踏板中部。', '控制下放，膝盖保持与脚尖同向。', '推起时不锁死膝关节。'], mistakes: ['下放过深导致骨盆离垫', '膝盖内扣'], safety: '选择可以全程控制的重量，不要用手推膝盖完成最后几次。' },
  { id: 'incline-dumbbell-press', name: '哑铃上斜卧推', nameEn: 'Incline Dumbbell Press', target: '胸大肌锁骨部', equipment: '哑铃', location: '健身房', level: '初级', rating: 4.8, sets: 3, reps: '8–12', restSeconds: 75, steps: ['将训练凳调整为约 30 度。', '肩胛骨后缩下沉，双脚稳定。', '哑铃沿胸部上方控制下放。', '呼气推起，保持前臂接近垂直。'], mistakes: ['凳角过高变成肩推', '肩胛骨失去稳定'], safety: '肩前侧不适时减小下放深度并降低重量。' },
  { id: 'push-up', name: '标准俯卧撑', nameEn: 'Push-up', target: '胸大肌', equipment: '自重', location: '家庭', level: '新手', rating: 4.6, sets: 3, reps: '接近力竭', restSeconds: 60, steps: ['双手略宽于肩，身体保持直线。', '肘部约向后 45 度屈曲。', '胸部接近地面后推起。'], mistakes: ['塌腰', '耸肩', '头部前伸'], safety: '手腕不适可使用俯卧撑支架或哑铃握把。' },
  { id: 'dumbbell-shoulder-press', name: '哑铃肩推', nameEn: 'Dumbbell Shoulder Press', target: '三角肌前束', equipment: '哑铃', location: '健身房', level: '初级', rating: 4.7, sets: 4, reps: '8–10', restSeconds: 90, steps: ['坐姿保持躯干稳定。', '哑铃位于肩部两侧。', '向上推起但不碰撞哑铃。', '控制返回起始位置。'], mistakes: ['腰部过伸', '下降过深'], safety: '避免用超出控制能力的重量强行完成。' },
  { id: 'front-raise', name: '哑铃前平举', nameEn: 'Dumbbell Front Raise', target: '三角肌前束', equipment: '哑铃', location: '家庭', level: '初级', rating: 4.4, sets: 3, reps: '10–12', restSeconds: 60, steps: ['站立收紧核心。', '手臂微屈向前抬起。', '到肩高后控制下放。'], mistakes: ['借助身体摆动', '耸肩'], safety: '肩部撞击感明显时停止并调整活动范围。' },
  { id: 'lat-pulldown', name: '高位下拉', nameEn: 'Lat Pulldown', target: '背阔肌', equipment: '高位下拉机', location: '健身房', level: '初级', rating: 4.7, sets: 4, reps: '8–12', restSeconds: 75, steps: ['握距略宽于肩。', '先下沉肩胛再屈肘下拉。', '把手拉向上胸。', '控制回到伸展位。'], mistakes: ['身体后仰过多', '用手臂主导'], safety: '不要将把手拉到颈后。' },
  { id: 'hip-thrust', name: '杠铃臀推', nameEn: 'Barbell Hip Thrust', target: '臀大肌', equipment: '杠铃', location: '健身房', level: '中级', rating: 4.8, sets: 4, reps: '8–12', restSeconds: 90, steps: ['肩胛下缘靠在训练凳上。', '双脚与髋同宽。', '收紧核心并伸髋。', '顶端保持骨盆中立。'], mistakes: ['腰椎过伸', '双脚位置过远'], safety: '杠铃接触处使用护垫，避免压迫髋前侧。' },
  { id: 'plank', name: '平板支撑', nameEn: 'Plank', target: '核心', equipment: '自重', location: '家庭', level: '新手', rating: 4.6, sets: 3, reps: '30–45 秒', restSeconds: 45, steps: ['肘部位于肩部下方。', '从头到脚保持直线。', '正常呼吸并收紧核心。'], mistakes: ['塌腰', '臀部过高'], safety: '腰部疼痛时缩短持续时间或改用跪姿。' },
  { id: 'calf-raise', name: '站姿提踵', nameEn: 'Standing Calf Raise', target: '腓肠肌', equipment: '自重', location: '家庭', level: '新手', rating: 4.5, sets: 4, reps: '12–15', restSeconds: 60, steps: ['前脚掌稳定站立。', '脚跟缓慢抬高。', '顶端停顿后控制下放。'], mistakes: ['借助弹性快速反弹'], safety: '保持脚踝稳定，必要时扶住固定物。' },
];

export const regions = ['全身', '肩部', '胸部', '背部', '手臂', '核心', '臀部', '下肢', '小腿与足部'];

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
