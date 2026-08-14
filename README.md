# YOU GYM

YOU GYM 是一个面向健身新手、减脂、增肌、家庭训练和功能性训练人群的跨平台健身应用。当前仓库包含产品与设计文档、UI 视觉参考，以及基于 React Native + Expo 的首版移动端交互原型。

## 当前范围

- 人体：可交互 2D 正反面人体、肌肉热区、三级及更细层级、动作筛选与动作详情。
- 训练计划：计划库、计划详情、快速训练创建、训练执行、组数/次数/重量记录、休息计时、历史与趋势。
- 饮食管理：今日营养、餐次记录、食物搜索、食物详情与份量记录。
- 个人：身体数据、提醒、通知中心、下载缓存、帮助与账号安全。
- 登录与引导：手机号、验证码和首次使用目标设置。

首版使用 2D 人体模型，不包含 Unity 3D。FatSecret、阿里云短信、Push、对象存储和服务端接口目前使用 Mock 数据，后续与 Spring Boot + MySQL 服务联调。

## 技术栈

- React Native 0.86
- Expo SDK 57
- TypeScript
- React Navigation 7
- React Native SVG
- AsyncStorage

应用包名：`com.yougym.app`

## 目录

```text
apps/mobile/    React Native 移动端
docs/           产品、交互、内容与技术文档
UI/             Image2 生成的视觉参考图
assets/         原型与人体参考素材
design.md       YOU GYM 设计规范
```

## 本地运行

```bash
cd apps/mobile
npm install
npm run web
```

类型检查与 Web 导出：

```bash
npm run typecheck
npm run export:web
```

## 设计基准

界面采用纯黑背景、深灰表面、`#B3FF00` 荧光黄绿色主操作色和 `#FF2D55` 肌肉高亮色。新页面应先阅读根目录的 `design.md`，并在 `390 x 844` 与 `360 x 800` 两种手机尺寸下验证。

## 内容与授权

动作媒体当前使用占位内容。上线前必须确认图片、GIF、视频、人体模型和食物数据的独立生产使用授权，不应直接把未获许可的第三方数据集素材用于生产环境。
