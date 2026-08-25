# YOU GYM

YOU GYM 是一个面向健身新手、减脂、增肌、家庭训练和功能性训练人群的跨平台健身应用。仓库包含 React Native + Expo 移动端、Vue 管理后台、Spring Boot API、数据库迁移脚本、产品与设计文档及视觉参考素材。

## 当前范围

- 人体：可交互 2D 正反面人体、肌肉热区、一级到三级肌群层级、动作筛选与动作详情。人体探索的匹配动作来自后端动作目录和目标肌群代码，不再依赖前端静态动作 ID。
- 训练计划：计划库、计划详情、快速训练创建、训练执行、组数/次数/重量记录、休息计时、历史与趋势。
- 饮食管理：今日营养、餐次记录、食物搜索、食物详情与份量记录，食物目录读取后端数据库。
- 内容与媒体：管理后台支持动作、饮食等内容管理，图片、GIF、视频及其他资源通过媒体上传接口接入 OSS 适配层。
- 个人：身体数据、提醒、通知中心、下载缓存、帮助与账号安全。
- 登录与引导：手机号、验证码和首次使用目标设置。

首版使用 2D 人体模型，不包含 Unity 3D。短信、邮件和 OSS 适配器默认使用本地 Mock 模式，生产环境可切换为阿里云服务；详细配置见 [`apps/api/README.md`](apps/api/README.md)。

## 技术栈

- React Native 0.86
- Expo SDK 57
- TypeScript
- React Navigation 7
- React Native SVG
- AsyncStorage
- Spring Boot 3.4 + Java 17
- MySQL/H2 + Flyway
- Vue 3 + Vite + ECharts（管理后台）

应用包名：`com.yougym.app`

## 目录

```text
apps/mobile/    React Native 移动端
apps/admin/     Vue 3 管理后台
apps/api/       Spring Boot 后端与数据库迁移
docs/           产品、交互、内容与技术文档
UI/             Image2 生成的视觉参考图
assets/         原型与人体参考素材
design.md       YOU GYM 设计规范
```

## 本地运行

### 1. 启动后端 API

需要 Java 17、Maven；使用 Docker 时可先启动 MySQL、Redis 和 MinIO：

```powershell
cd apps/api
docker compose up -d --build
```

上面的 Compose 配置会同时启动 MySQL、Redis、MinIO 和 API。若只使用本机已安装的数据库依赖，也可以改用 Maven 直接启动 API：

```powershell
cd apps/api
Copy-Item .env.example .env
mvn spring-boot:run
```

API 默认地址为 `http://localhost:8080`，健康检查：

```powershell
Invoke-RestMethod http://localhost:8080/actuator/health
```

### 2. 启动移动端 App Web

```bash
cd apps/mobile
npm install
npm run web -- --port 8082
```

App Web 默认访问 `http://localhost:8082`。真机调试时，将 `EXPO_PUBLIC_API_BASE_URL` 设置为局域网中的 API 地址；Android 模拟器使用 `http://10.0.2.2:8080`，iOS 模拟器和 Web 使用 `http://localhost:8080`。

### 3. 启动管理后台

```powershell
cd apps/admin
npm install
npm run dev -- --host 0.0.0.0
```

管理后台默认访问 `http://localhost:5173`。后台登录页与 App 登录页分离，开发环境可使用 API 文档中配置的本地测试 Token 或启用持久化管理员账号。

移动端类型检查、Web 导出和管理后台构建：

```powershell
cd apps/mobile
npm run typecheck
npm run export:web

cd ..\admin
npm run typecheck
npm run build
```

要启用本地持久化管理员登录，可在启动 API 前设置 `YOUGYM_ADMIN_BOOTSTRAP_ENABLED=true`、`YOUGYM_ADMIN_BOOTSTRAP_USERNAME` 和 `YOUGYM_ADMIN_BOOTSTRAP_PASSWORD`（至少 12 位）。默认测试角色和完整 API 列表见 [`apps/api/README.md`](apps/api/README.md)。

## 数据链路

- 动作列表通过 `GET /api/v1/exercises` 读取数据库动作目录，当前包含 Exercises Dataset 与项目参考图片导入的动作数据。
- 每个动作返回 `resources`，客户端优先使用 `THUMBNAIL_IMAGE` 展示缩略图，没有该类型时回退到首个图片/GIF/视频资源。
- 人体探索加载 `GET /api/v1/anatomy/tree` 和动作目录后，根据动作的 `targetMuscles` 代码匹配到胸、背、肩、手臂、核心、臀、腿和小腿等肌群节点。
- 动作详情通过 `GET /api/v1/exercises/{id}` 读取图片、GIF、视频、步骤和数据集详情。
- 内容中心的图片、视频、GIF、3D 模型等资源通过 `/api/file/media-upload/batch` 上传；本地默认使用 Mock 存储，生产环境切换到阿里云 OSS。
- App 埋点覆盖社区入口、人体探索、动作详情、训练流程、饮食浏览和训练打卡，后台支持汇总、筛选和 CSV 导出。

## 设计基准

界面采用纯黑背景、深灰表面、`#B3FF00` 荧光黄绿色主操作色和 `#FF2D55` 肌肉高亮色。新页面应先阅读根目录的 `design.md`，并在 `390 x 844` 与 `360 x 800` 两种手机尺寸下验证。

## 内容与授权

仓库中的动作图片、GIF、视频、人体模型和食物数据仅用于开发与验证。上线前必须确认每项素材的独立生产使用授权，不应直接把未获许可的第三方数据集素材用于生产环境。

## GitHub

远程仓库：<https://github.com/wzj1228516103/you_gym>

Git 上传使用 Git Credential Manager 管理 GitHub 凭证。不要把 Personal Access Token、云服务密钥或 `.env` 文件提交到仓库；首次推送或凭证失效时，执行 `git credential-manager github login` 完成 GitHub 授权。
