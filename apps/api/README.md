# YOU GYM API integration test service

This is the first backend slice for testing SMS, email, and object storage adapters.

## Safety defaults

- Provider mode is `mock` by default.
- Real provider calls require `YOUGYM_INTEGRATION_MODE=aliyun`.
- Test endpoints require `X-Integration-Test-Token`.
- Real SMS, email, and OSS calls additionally require `X-Confirm-External-Send: true`.
- Secrets are read from environment variables and must never be committed.

## Start local dependencies

```powershell
docker compose up -d --build
```

This starts MySQL, Redis, MinIO, and the API at `http://localhost:8080`. The local bootstrap administrator is `owner` / `local-admin-pass`; change these values before sharing the environment.

The API image installs `curl` explicitly so both Docker and Compose health checks work consistently with the slim Java runtime image. Docker must be installed and running before using this command.

## Start the API

```powershell
Copy-Item .env.example .env
mvn spring-boot:run
```

## Check configuration

```powershell
Invoke-RestMethod http://localhost:8080/api/v1/integrations/status
```

## Test adapters in mock mode

```powershell
$headers = @{ 'X-Integration-Test-Token' = 'local-only' }
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/integrations/sms/test -Headers $headers -ContentType 'application/json' -Body '{"phoneNumber":"+8613800000000","purpose":"LOGIN"}'
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/integrations/email/test -Headers $headers -ContentType 'application/json' -Body '{"email":"test@example.com","purpose":"LOGIN"}'
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/integrations/oss/test -Headers $headers -ContentType 'application/json' -Body '{"objectKey":"health-check.txt","content":"you-gym integration test"}'
```

Real provider calls are intentionally not run by the repository test suite. Configure the Aliyun values locally, switch the mode to `aliyun`, and use the explicit confirmation header only for a controlled test recipient/bucket.

## Content media uploads

Administrators with `CONTENT_MANAGE` can upload up to 10 files per request. The request uses `multipart/form-data` with one or more `file` fields and keeps the response structure compatible with the existing `nn_family` batch upload endpoint.

```text
POST /api/file/media-upload/batch
GET  /api/file/media-url?objectName=<stored-object-key>
DELETE /api/file/media?objectName=<stored-object-key>
```

Each file is limited to 50MB. Supported resources include common raster images and GIFs, MP4/MOV/AVI/WebM/MKV video, GLB/GLTF/FBX/OBJ/STL/USDZ models, and PDF/ZIP/JSON attachments. SVG is intentionally excluded because active SVG content should not be served from the application origin.

Mock mode keeps uploaded bytes in memory and exposes a local preview URL. Aliyun mode streams files directly to OSS. Set `ALIYUN_OSS_PUBLIC_BASE_URL` when the bucket or a bound domain is publicly readable; otherwise the API returns short-lived signed URLs and refreshes them from the stored `objectName` whenever content is read.

Deleting a resource requires `CONTENT_MANAGE` and is rejected while the object is referenced by any content item. Removing an asset in the editor queues cleanup until the content save succeeds, so cancelling an edit cannot delete a still-used object.

Content management endpoints are protected by the same permission boundary:

```text
GET    /api/admin/v1/content
POST   /api/admin/v1/content
PATCH  /api/admin/v1/content/{id}
POST   /api/admin/v1/content/{id}/status
DELETE /api/admin/v1/content/{id}
```

Only draft and archived items can be deleted. Published content must be archived first. A successful delete returns the item's media asset metadata so the admin client can attempt reference-safe object cleanup; a cleanup failure is surfaced without restoring the deleted content.

Never copy the `nn_family` EOS credentials into this project. That project uses China Mobile Cloud EOS through the S3-compatible SDK, while YOU GYM's production adapter targets Aliyun OSS.

## Analytics API

## App API

The mobile app is connected to the Spring Boot API through these routes:

```text
POST  /api/v1/auth/sms/code
POST  /api/v1/auth/sms/verify
GET   /api/v1/me
PATCH /api/v1/me
POST  /api/v1/me/workouts
GET   /api/v1/me/workouts
POST  /api/v1/me/nutrition
GET   /api/v1/me/nutrition
GET   /api/v1/me/nutrition-goal
PUT   /api/v1/me/nutrition-goal
DELETE /api/v1/me/nutrition-goal
POST  /api/v1/me/measurements
GET   /api/v1/me/measurements
GET   /api/v1/me/reminders
PUT   /api/v1/me/reminders
# 提醒设置支持 trainingTime、nutritionTime、timezone、quietHoursStart、quietHoursEnd
# App 原生端会按提醒设置创建每日本地通知；Web 端不请求通知权限
GET   /api/v1/me/notifications?unreadOnly=false&limit=50
POST  /api/v1/me/notifications/{notificationId}/read
POST  /api/v1/me/notifications/read-all
POST  /api/v1/me/plans/{planId}/start
GET   /api/v1/me/plans/{planId}/progress
PATCH /api/v1/me/plans/{planId}                 # status: ACTIVE | PAUSED
GET   /api/v1/me/favorites?targetType=EXERCISE|PLAN
PUT   /api/v1/me/favorites/{targetType}/{targetId}
DELETE /api/v1/me/favorites/{targetType}/{targetId}
POST  /api/v1/me/favorites/sync
GET   /api/v1/anatomy/tree?gender=all&view=all
GET   /api/v1/content?contentType=EXERCISE&search=动作名称
GET   /api/v1/exercises?search=深蹲&equipment=杠铃
GET   /api/v1/exercises/{id}
GET   /api/v1/plans?category=增肌&search=推
GET   /api/v1/plans/{id}
GET   /api/v1/foods?search=鸡胸
GET   /api/v1/foods/{id}
```

Local mock integration mode accepts the experience verification code `123456`.
Production mode stores only a SHA-256 code hash and sends the generated code
through the configured Aliyun SMS gateway. App sessions are bearer tokens with
30-day expiry. Guest preview remains available and only sends anonymous
analytics; it does not create an account or business records.

The admin API exposes persisted App data to users with `ANALYTICS_READ`:

```text
GET /api/admin/v1/app-users
GET /api/admin/v1/app-users/workouts
GET /api/admin/v1/app-users/nutrition
```

For Expo on a physical device, set `EXPO_PUBLIC_API_BASE_URL` to the machine's
LAN address, for example `http://192.168.1.20:8080`. Android emulators use
`http://10.0.2.2:8080` by default; iOS simulator and web default to
`http://localhost:8080`.

### Backend package convention

New business modules follow the `nn-family` style of explicit layers:

```text
com.yougym.api.<module>
├── controller       HTTP routes, validation, permissions and response shaping
├── service          module interfaces
│   └── impl         transaction and business orchestration
├── mapper           database access (MyBatis/MyBatis-Plus)
├── entity           persistence models
├── dto              request/query models
└── vo               response models
```

The analytics user directory is the first migrated module. Its routes remain
`/api/admin/v1/analytics/users` and `/api/admin/v1/analytics/users.csv`; the
existing JDBC repositories remain in place for the other analytics reports and
will be migrated module by module. MyBatis-Plus is configured for Boot 3 and
supports the same MySQL/H2 test setup.

Mobile clients can upload up to 100 events per request. `eventId` is the idempotency key.

The Expo client reads `EXPO_PUBLIC_API_BASE_URL` and uploads queued events when an event is created or the app returns to the foreground. A failed upload leaves the local queue intact. Guest analytics IDs are persisted in AsyncStorage and are not treated as authenticated user IDs.

The current event vocabulary includes community navigation, screen views, body-region and muscle selection, exercise filtering/detail views, workout lifecycle, nutrition views, and training check-ins. New event names should be added to the mobile union before they are emitted so the client and API contract stay reviewable.

The admin analytics area also exposes a nutrition behavior view. It aggregates anonymous nutrition screen views, food searches, food selections, and meal-record actions, with meal-name distribution and CSV export. The mobile catalog now reads the persisted `food_catalog` table and meal records are stored for authenticated users; the analytics view remains behavior-only and does not expose identifiable dietary details.

The user directory currently aggregates analytics identities with first/last seen time, event count, and platform. Anonymous IDs are labeled as guests, and non-anonymous analytics IDs are labeled as identified. It is not an App account database: phone numbers, profile fields, account locking, and device/session management remain reserved for the future mobile authentication module.

```powershell
$events = @{ events = @(@{
  eventId = 'evt-local-001'
  eventName = 'community_tab_clicked'
  eventVersion = 1
  occurredAt = '2026-08-18T03:00:00Z'
  sessionId = 'session-local'
  analyticsUserId = 'anonymous-local'
  platform = 'web'
  appVersion = '0.1.0'
  properties = @{ source = 'main_tab' }
}) } | ConvertTo-Json -Depth 10
Invoke-RestMethod -Method Post -Uri http://localhost:8080/api/v1/analytics/events:batch -ContentType 'application/json' -Body $events
```

The local admin endpoints currently use environment-configured role tokens. This is a development RBAC boundary, not the production login system:

- `local-admin`: `SUPER_ADMIN`, can read and export analytics.
- `local-employee`: `EMPLOYEE`, can read analytics but cannot export.
- `YOUGYM_ADMIN_TEST_TOKEN`, `YOUGYM_ADMIN_TEST_ROLE`, and `YOUGYM_ADMIN_EMPLOYEE_TOKEN` override these local defaults.

The first persistent admin session flow is also available. Set `YOUGYM_ADMIN_BOOTSTRAP_ENABLED=true` together with a username and password of at least 12 characters for a local bootstrap account. The password is stored as a BCrypt hash, and session tokens are stored only as SHA-256 hashes. Five consecutive password failures trigger a 15-minute account lock; a successful login clears the counter. The current counter is persisted in MySQL/H2 and can later move to Redis without changing the API contract.

The separate admin authentication page supports invited employee registration. Enable it only when an invite code is configured: `YOUGYM_ADMIN_REGISTRATION_ENABLED=true` and `YOUGYM_ADMIN_REGISTRATION_INVITE_CODE=<secret>`. Registration always creates an `EMPLOYEE`; a super administrator must grant any higher role from the system panel.

```text
GET /api/admin/v1/session
POST /api/admin/v1/auth/login
POST /api/admin/v1/auth/register
POST /api/admin/v1/auth/logout
GET /api/admin/v1/analytics/summary
GET /api/admin/v1/analytics/events
GET /api/admin/v1/analytics/events.csv
GET /api/admin/v1/audit/logs
GET /api/admin/v1/accounts
POST /api/admin/v1/accounts
PATCH /api/admin/v1/accounts/{username}
```

Send development tokens using `X-Admin-Test-Token`. Persistent sessions use `Authorization: Bearer <token>`. The production replacement is the planned MFA-protected admin session with persisted roles and audit logging.

## Tests

The API integration test suite starts the application against an in-memory H2 database, runs Flyway migrations, and verifies event idempotency, temporary admin authentication, and CSV export:

```powershell
mvn test
```

The mobile client type contract can be checked with:

```powershell
cd ..\mobile
npm run typecheck
```
