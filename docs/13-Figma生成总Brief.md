# YOU GYM Figma 生成总 Brief

版本：1.0  
更新日期：2026-08-14  
目标：生成可评审、可连线、可交付 React Native 和 Vue 开发的完整 UI 文件

## 1. 给 Figma 的总任务

为 YOU GYM 设计一套 iOS/Android 双端健身 App 和配套桌面管理后台。移动端有四个一级模块：人体、训练、饮食、个人。产品核心是男性/女性高精度 3D 人体，用户可通过多级解剖导航或直接点击模型选择肌肉；选中后镜头旋转并推进到目标，肌肉高亮，再进入动作筛选。

视觉风格必须严格执行项目根目录 `design.md` 的 Fitness Neon V2 规范：纯黑主舞台、深灰玻璃表面、荧光黄绿主操作 `#B3FF00`、洋红肌肉语义 `#FF2D55`、暖红热区 `#FF4B3E`、青色空间定位 `#35E6E8`、Noto Sans 500/700。氛围可参考 Apple Fitness 的清晰数据层级和运动质感，但不得复制 Apple 的页面、图形、商标或专有素材。

Workout.cool 仅作为“场地/器械 → 肌肉 → 动作”三步生成器和计划卡信息层级的流程参考，具体边界见 `00-参考产品拆解-workout.cool.md`。禁止复制其品牌、广告、Premium、排行榜、文案、图片、代码和完整页面构图。

## 2. 必读文档与优先级

生成前完整读取：

1. `../design.md`：唯一视觉 token、字体、组件和动效真源。
2. `../YOU_GYM_产品需求文档_v1.0.md`：业务范围基线。
3. `03-页面清单与逐屏UI规格.md`：每个页面的布局和状态。
4. `04-3D人体模块专项.md`：解剖树、模型、镜头和高亮。
5. `05-训练计划与训练执行专项.md`。
6. `06-饮食管理专项.md`。
7. `07-个人中心认证与通知专项.md`。
8. `00-参考产品拆解-workout.cool.md`。

冲突时：用户最新决定 > `design.md` 视觉规则 > PRD 业务规则 > 模块专项 > 本 Brief。不要为方便生成而省略已经定义的状态。

## 3. Figma 文件页面结构

按以下顺序创建 Figma Pages：

| Page | 内容 |
| --- | --- |
| `00_Cover_&_Readme` | 项目封面、版本、文档链接、状态图例、负责人 |
| `01_Foundations` | 颜色、字体、间距、栅格、圆角、阴影、图标、动效 |
| `02_Components_Mobile` | 移动端组件、变体和交互状态 |
| `03_Auth_&_Onboarding` | SYS-01、AUTH、ONB 页面 |
| `04_Anatomy_&_Exercises` | ANA、EXE、3D 动画分镜 |
| `05_Quick_Workout_Builder` | QWK-01 至 QWK-05 |
| `06_Plans_&_Workout` | PLN、WKT、HIS 页面 |
| `07_Nutrition` | NUT 页面 |
| `08_Profile_&_System` | PRO、SYS 系统状态 |
| `09_Prototype_Flows` | 主要可点击原型的副本或入口 |
| `10_Admin_Foundations` | 后台栅格、表格、表单和状态 |
| `11_Admin_Screens` | Vue 后台关键页面 |
| `90_Archive` | 被替换方案，不能混入当前交付 |
| `99_References` | 用户参考图、Workout.cool 流程截图，仅供参考 |

每个 Page 顶部放置一个说明 Frame，包含本页目的、引用文档、已完成状态和禁止事项。

## 4. 画板与布局

### 4.1 移动端

- 主画板：`390 × 844`，名称格式 `ANA-01 / Anatomy / Default / iOS`。
- 同步检查：`360 × 800` Android 小屏，至少覆盖每个模块主页面和训练执行。
- 使用垂直 Auto Layout，页面左右安全边距 20px；底部胶囊导航左右 16px。
- 使用真实系统安全区变量，不绘制固定假刘海。
- 允许页面垂直滚动，但主要 CTA 在首屏或底部固定区域可达。
- 3D 人体页是全屏无边框舞台，不能放入卡片。

### 4.2 管理后台

- 主画板：`1440 × 1024`；内容最小宽度 1180px。
- 左侧导航 248px，折叠 72px；顶部栏 64px。
- 内容使用 12 列栅格、24px gutter、32px 页面边距。
- 表格、筛选、编辑器优先信息密度，不使用移动端超大标题。

## 5. Variables 与 Styles

### 5.1 Collections

创建：

- `Color / Semantic / Dark`
- `Typography / Mobile`
- `Typography / Admin`
- `Spacing`
- `Radius`
- `Elevation`
- `Motion`
- `Layout / Mobile`
- `Layout / Admin`

颜色变量必须逐项对应 `design.md`，包括 `color-primary`、`color-muscle`、`color-muscle-warm`、`color-marker`、背景、表面、文字、边界、成功/警告/错误/信息和营养素语义色。禁止在页面中创建未命名的相近色。

### 5.2 命名

组件：`Mobile/Button/Primary`、`Mobile/Navigation/BottomTab`、`Admin/Table/Row`。  
变量：`color/bg/canvas`、`space/4`、`radius/card`。  
图层：使用业务含义，如 `Exercise title`，禁止大量 `Frame 124`。  
页面 Frame：`[页面ID] / [名称] / [状态] / [平台]`。

## 6. 移动组件库

### 6.1 基础组件

每个组件都建立 Variant：

| 组件 | 必须属性/状态 |
| --- | --- |
| `Button/Primary` | default、pressed、loading、disabled；icon none/left/right |
| `Button/Secondary` | default、pressed、disabled |
| `Button/Icon` | default、pressed、selected、disabled；圆形 48px 热区 |
| `Input/Text` | empty、focused、filled、error、disabled |
| `Input/OTP` | empty、active、filled、error、expired |
| `Input/NumberStepper` | default、focused、disabled、unit variants |
| `Search` | empty、typing、results、no-results、offline |
| `Dropdown/Anatomy` | closed、open、searching、path-selected |
| `Chip/Filter` | default、selected、disabled、count |
| `SegmentedControl` | 2/3/4 options、selected index |
| `Switch` | on、off、disabled |
| `Checkbox` | checked、unchecked、indeterminate、error |
| `Slider` | default、disabled、range optional |

### 6.2 导航和反馈

| 组件 | 必须属性/状态 |
| --- | --- |
| `Navigation/BottomTab` | anatomy/training/nutrition/profile selected |
| `Navigation/TopBar` | title、back、actions、scroll state |
| `Sheet/Bottom` | peek、medium、expanded、loading |
| `Dialog/Confirm` | standard、danger、destructive loading |
| `Toast` | success、error、info、undo |
| `Banner` | offline、sync-pending、warning、update |
| `State/Empty` | icon、title、body、CTA |
| `State/Error` | retry、offline、permission、not-found |
| `Skeleton` | list、card、nutrition、profile |

### 6.3 业务组件

| 组件 | 变体 |
| --- | --- |
| `Anatomy/PathBreadcrumb` | 2–5 levels、long text |
| `Anatomy/NodeRow` | group/muscle/division/display-only、selected |
| `Anatomy/FocusLabel` | target、display-only、left/right |
| `Anatomy/DownloadProgress` | waiting/downloading/paused/error/complete |
| `Exercise/ListRow` | image/video、recommended、saved、unavailable |
| `Exercise/MuscleRole` | primary/secondary/stabilizer |
| `Plan/Card` | recommended/official/custom/active/completed |
| `Workout/SetRow` | pending/active/completed/error/left-right |
| `Workout/RestTimer` | normal/last10/finished/paused |
| `Workout/ExerciseHeader` | image/video/no-media/replaced |
| `Chart/Trend` | line/bar/no-data/selected-point |
| `Nutrition/MacroBar` | protein/carbs/fat/over-target |
| `Nutrition/MealSection` | empty/filled/collapsed |
| `Nutrition/FoodRow` | provider/custom/recent/incomplete |
| `Profile/SettingRow` | disclosure/switch/value/destructive |

组件内部使用 Auto Layout、变量绑定和文本溢出规则。所有可点击组件最小热区 44 × 44px。

## 7. 3D 人体视觉与原型

### 7.1 静态视觉

- 男性与女性均采用“解剖插画式 3D”模型：真实三维体积 + 简化表面，姿势自然，四肢完整，不追求真人皮肤质感。
- 默认全身状态并排展示同一性别的正面和背面，参考 `assets/references/workout-muscle-selector-reference.png` 的清晰构图。
- 全身主体使用冷灰蓝 `#9AA8BB`、深度面 `#6F7D91`、非训练结构 `#777B80`；外轮廓和肌肉分区线使用 `#F5F7FA`。
- 目标肌肉使用洋红到暖红的受控高亮，仍保留白色分区边界；边缘可带轻微发光，但不做大面积霓虹雾。
- 选中目标外的身体结构降低对比但保持可见；骨骼、肌腱和韧带使用更低饱和度。
- 背景使用 `#232323` 或纯黑，并有最少量空间地面线/青色定位标记；不使用浅色径向渐变、光球、烟雾或装饰粒子。
- 模型是舞台主体，顶部导航和右侧工具收纳，不能遮挡正在聚焦的目标。

Figma 第一轮直接使用 `assets/anatomy/anatomy-front-back-placeholder.png` 作为正反面交互占位，并标注 `UnityViewport / Reference Placeholder`。后续替换为同风格男女 3D 渲染图，分别命名 `Asset/Anatomy/Male/*` 与 `Asset/Anatomy/Female/*`；位图占位不是生产 3D 资源。

### 7.2 解剖层级

导航路径至少表达四级：区域 → 肌群 → 肌肉 → 肌束/分部。例如：

```text
肩部肌群 → 三角肌 → 三角肌前束 → 左侧
```

更细的起止点、肌腱和韧带可查看，但组件要显示“展示结构”标签，不能提供“查看训练动作”主 CTA。

### 7.3 聚焦动画分镜

为 ANA-01 → ANA-04 建立 Smart Animate 分镜：

| Frame | 时间 | 视觉变化 |
| --- | ---: | --- |
| `Focus/00-Idle` | 0ms | 正面与背面双模型并排默认视图 |
| `Focus/01-Rotate` | 0–220ms | 目标所在视角成为主模型，另一模型淡出；必要时再小角度转向 |
| `Focus/02-Dolly` | 220–480ms | 镜头推进，目标移动到视觉中心 |
| `Focus/03-Highlight` | 480–600ms | 目标洋红高亮，青色定位圈收束 |
| `Focus/04-Sheet` | 600–760ms | 底部摘要面板进入，显示路径和动作 CTA |

动画 easing 使用 `ease-in-out`；不得超过 90° 的无必要旋转。开启 Reduce Motion 时跳过旋转，以 120–180ms 淡入目标近景。Figma 原型只模拟状态变化，研发按 Unity 实时镜头实现。

### 7.4 人体页控件

- 顶部：一个覆盖所有区域的下拉导航，展开时可搜索并显示多级树。
- 右侧隐藏工具组：男/女切换、正/背面、表/深层、重置镜头；默认收纳为一个图标按钮。
- 快速定位、动作 CTA、模型设置都以图标或底部面板出现，不在舞台永久堆叠文字。
- 选中肌肉后，先完成聚焦和高亮，再展开动作摘要；主操作是“查看匹配动作”。

## 8. 页面生成批次

每批完成后先校验组件和状态，再开始下一批，禁止一次生成所有页面后再统一修补。

### Batch A：Foundations 与组件

生成 01、02 Page 的全部 token、基础组件和业务组件。用一个 `Component Playground / 390` 验证中文长文本、禁用、加载、错误和 200% 字体。

### Batch B：认证与首次设置

生成：SYS-01、AUTH-01~03、ONB-01~05。  
关键原型：手机号 → 验证码 → 协议 → 身体数据 → 目标 → 经验 → 场地器械 → 推荐完成。  
必须表达短信倒计时、验证码错误/过期、可选字段跳过、推荐依据。

### Batch C：人体与动作

生成：ANA-01~08、EXE-01~04 和 3D 聚焦动画分镜。  
必须包含男性默认全身、女性聚焦、左/右侧、下拉树、展示节点说明、高精度资源下载、动作筛选正常/无结果、动作详情和视频全屏。

### Batch D：快速训练生成器

生成：QWK-01~05。  
进度标题固定为“1 场地与器械 / 2 目标肌肉 / 3 选择动作 / 4 调整 / 5 完成”，不使用营销式步骤说明。

- QWK-01：场地分段控件；器械图标 + 文字多选；“无器械”。
- QWK-02：已选解剖路径、区域树、打开 3D 人体的主入口。
- QWK-03：匹配动作列表、推荐理由、多选、筛选。
- QWK-04：拖动排序、组数、次数/时长、休息和预计总时长。
- QWK-05：摘要、开始训练、保存计划、返回修改。

### Batch E：计划、执行和历史

生成：PLN-01~07、WKT-01~06、HIS-01~03。  
必须有：有计划/无计划/休息日/继续训练、官方计划卡、自定义编辑、当前组、完成组、休息最后 10 秒、替换动作、暂停退出、普通总结/个人纪录、历史和趋势无数据。

训练执行 WKT-02 是最高优先级任务页：主要输入在拇指可达区，训练计时和当前动作清楚，不能因卡片嵌套降低效率。

### Batch F：饮食

生成：NUT-01~08。  
必须标注 FatSecret 来源、估算值、份量单位、缺失营养字段、离线搜索、最近记录、自定义食物和历史数据不足。

### Batch G：个人与系统

生成：PRO-01~08、SYS-02~05。  
覆盖资料、身体趋势、目标、提醒、通知中心、下载缓存、隐私删除、帮助反馈、离线、通知权限、Unity 资源下载和强制更新。

### Batch H：管理后台

生成：后台登录/MFA、仪表盘、动作列表、动作编辑、动作审核对比、解剖树 + 3D 预览、动作映射、计划编辑、媒体处理、审核队列、发布详情、通知编辑、用户反馈、角色权限和审计日志。

## 9. 逐模块视觉重点

### 9.1 人体

首屏以真实 3D 人体为第一视觉信号，页面只有导航和 3D 舞台两大部分。快速定位、动作、男女切换全部隐藏在图标或面板中。展开面板后也要保留足够模型可见区。

### 9.2 训练

计划页以今日行动为优先，不做营销 Hero。计划卡密度适中，明确周期、频率、单次时长、器械和目标。训练执行使用大数字和可编辑表格，休息计时全屏/大面板强调时间但不改变布局。

### 9.3 饮食

热量和宏量营养使用四种清晰语义色，不让整个页面变成单一荧光黄绿。餐次是连续列表，不在卡片内再套食物卡片。超目标用中性文案，不使用羞辱性红色警报。

### 9.4 个人

安静、可扫描、设置型布局。身体数据有隐私感，不用过度显眼的大数展示敏感信息。危险操作集中到账号与隐私最下方。

## 10. 文案与内容占位

使用真实中文内容，不用 Lorem Ipsum。动作可使用：杠铃卧推、哑铃上斜卧推、俯卧撑、坐姿划船、深蹲、罗马尼亚硬拉、保加利亚分腿蹲、平板支撑。计划可使用：新手全身训练、推拉腿三分化、家庭自重计划、臀腿基础计划。

肌肉路径用完整层级，例如“胸部 → 胸肌群 → 胸大肌 → 锁骨部”。食品使用常见、可理解的示例，并明确来源和份量。不要写效果承诺或医学诊断。

动作列表可以采用 `hasaneyldrm/exercises-dataset` 的名称、器械和中文步骤作为内部示例，但数据源和 commit 必须在 Spec 中标注；未确认 Gym visual 授权时，Figma 不得把该仓库的图片/GIF 作为最终交付媒体，使用 `Asset/Exercise/Placeholder` 或已授权原创素材。

## 11. 原型 Flow

建立独立 Flow 起点：

1. `Flow A / New User`：AUTH-01 → ONB-05 → PLN-01。
2. `Flow B / Anatomy to Exercise`：ANA-01 → 下拉导航 → 聚焦动画 → EXE-01 → EXE-03。
3. `Flow C / Quick Workout`：QWK-01 → QWK-05 → WKT-01。
4. `Flow D / Complete Workout`：PLN-01 → WKT-01 → WKT-02 → WKT-03 → WKT-06 → HIS-02。
5. `Flow E / Log Food`：NUT-01 → NUT-02 → NUT-04 → NUT-05 → NUT-01。
6. `Flow F / Resource Download`：ANA-01 → SYS-04 → ANA-01 高精度。
7. `Flow G / Admin Publish`：动作编辑 → 审核 → Release → 灰度状态。

返回、关闭、取消、错误重试和离线恢复必须可点，不只连成功路径。底部 Tab 切换保持每个模块自己的导航栈。

## 12. 平台适配

- iOS 和 Android 共享视觉 token；系统返回、权限、通知设置和键盘行为遵循各自平台。
- Android 三键导航和手势导航都不遮挡底部胶囊。
- iOS 动态岛/刘海不与顶部下拉重叠。
- 数字键盘页面提供完成操作；重量/次数输入不允许键盘遮挡当前组。
- 组件不能通过屏幕宽度缩放字号；使用重排、换行或截断 + 完整 Tooltip/详情。

## 13. 可访问性标注

在关键组件旁标注：VoiceOver/TalkBack 名称、Role、状态、点击热区、焦点顺序和 Reduce Motion 行为。图表提供文字摘要；肌肉高亮提供名称、路径和轮廓；图标按钮有 Tooltip/无障碍名称。

## 14. 交付标注

每个业务页面右侧放置 `Spec` 区域：

- 页面 ID、场景和入口。
- 数据依赖和字段。
- 交互、动效和导航目标。
- 加载、空、错误、离线、权限和版本冲突状态。
- 埋点事件。
- iOS/Android 差异。
- 未决问题，不能隐藏在图层名中。

组件发布到本文件 library，页面必须使用实例，不允许复制后解绑。3D 渲染占位和动作媒体标注资产替换规则、比例和裁切焦点。

## 15. 视觉检查清单

- [ ] 页面背景为 `#000000`，没有擅自新增蓝紫或米色主题。
- [ ] 荧光黄绿只用于主操作/选中/聚焦，洋红只用于肌肉/运动数据。
- [ ] 无装饰光球、无意义渐变、卡片嵌套和页面区块漂浮卡片化。
- [ ] 3D 人体无边框、主体完整、目标肌肉未被工具遮挡。
- [ ] 中文长文案在 360px 宽下不溢出按钮和卡片。
- [ ] 页面标题、卡片标题和正文层级严格对应 `design.md`。
- [ ] 图标来自统一图标库，不手绘风格不一致的 SVG。
- [ ] 所有操作热区 ≥ 44px，颜色不是唯一状态表达。
- [ ] 列表、输入、图表和视频都有加载/空/错状态。
- [ ] 训练执行和饮食记录的数字单位始终可见。

## 16. 业务检查清单

- [ ] 底部只有人体、训练、饮食、个人四个一级模块，没有社区。
- [ ] 男性与女性模型首版均有默认与聚焦页面。
- [ ] 解剖导航至少四级，并区分可训练和仅展示结构。
- [ ] 选中肌肉后先聚焦高亮，再进入动作筛选。
- [ ] 高精度资源是可下载状态，不假设全部打进安装包。
- [ ] 动作页有步骤、错误、安全、参数、热身/拉伸和审核信息。
- [ ] 训练有组数、次数、重量、计时、休息、历史和趋势。
- [ ] 饮食数据源标注 FatSecret，营养值显示估算与缺失状态。
- [ ] 阿里云短信仅出现在验证码、账号安全和重要通知流程。
- [ ] 产品全程无广告，不出现 Premium 锁定和排行榜。

## 17. 可直接提交给 Figma 生成工具的简版提示词

```text
请为 YOU GYM 创建一套完整的移动端健身 App UI 和桌面管理后台设计。先完整读取 design.md、YOU_GYM_产品需求文档_v1.0.md，以及 docs/03、04、05、06、07、13。严格以 design.md 为唯一视觉规范。

移动端主画板 390×844，同时检查 360×800。底部仅有人体、训练、饮食、个人四个一级模块。风格为 Fitness Neon V2：#000000 背景、深灰玻璃表面、#B3FF00 主操作、#FF2D55 肌肉和运动数据、#FF4B3E 热区、#35E6E8 空间标记、Noto Sans 500/700。禁止卡片嵌套、装饰光球、无意义渐变、广告、Premium 和排行榜。

人体页只有顶部多级下拉导航和全屏无边框 3D 人体两大部分。男性与女性首版都要设计。导航层级至少为区域→肌群→肌肉→肌束/分部；点击肌肉后用 5 个 Smart Animate 分镜模拟模型旋转、镜头推进、洋红高亮和底部动作面板，再进入动作筛选。男女切换、快速定位、查看动作、正背面和层级工具默认收纳为图标按钮。

按照 docs/13-Figma生成总Brief.md 中的文件页面、Variables、组件 Variant、Batch A-H、原型 Flow 和检查清单依次生成。所有页面使用 Auto Layout 和组件实例，每个页面补齐加载、空、错误、离线、权限和长文本状态，并在右侧标注页面 ID、数据、交互、导航、埋点和平台差异。
```

## 18. 完成定义

Figma 文件只有在以下条件同时满足时才算完成：Foundations 和组件可复用；页面总表中的 P0/P1 页面均生成；七条原型主流程可点击；3D 聚焦有完整分镜；360px 小屏和无障碍状态通过；移动端与后台关键页面都有规格标注；所有业务和视觉检查项完成，且没有使用第三方受保护资产作为最终交付。
