# SaveHomelessKitty - 校园流浪猫智能投喂系统后端

本文档为后期维护的开发与运行手册，包含架构、数据结构、接口规范、运行与排障说明。

---

## 1. 项目定位

- 后端是真相源（规则判断、日志记录）。
- 终端是“傻终端”（识别、请求、上报）。
- MVP 成功：7–14 天稳定运行、投喂日志完整、日限额生效。

---

## 2. 技术栈

- .NET 10
- ASP.NET Core Web API
- EF Core + SQLite
- Swagger 文档（Swashbuckle）
- 部署：Docker / Linux
- 文件：文件系统存储（仅保存路径）

---

## 3. 目录结构与职责

```
SaveHomelessKitty/
  Controllers/
    Admin/                 # 后台管理 API
    Terminal/              # 终端 API
  Data/
    AppDbContext.cs        # EF Core DbContext 与索引
    DbSeeder.cs            # 默认规则种子
  Dtos/                    # 请求/响应 DTO
  Models/                  # 实体与枚举
  Services/
    FeedDecisionService.cs # 冷却 / 日限额策略
  Program.cs               # 注册服务、Swagger、数据库初始化
  appsettings*.json        # 配置文件
```

---

## 4. 核心数据结构（新版猫模型）

### 4.1 猫（Cat）
**原则：猫是长期身份，不依赖模型。**

```
Cat
- Id
- Code             # 系统内部编号，如 CAT-001
- Alias            # 可选名字
- Description      # 人类可读特征
- FirstSeenAtUtc
- LastSeenAtUtc
- IsActive
- PrimaryImageId   # 可空
```

### 4.2 媒体（MediaFile）
**照片永远不直接塞进猫，作为媒体文件独立记录。**

```
MediaFile
- Id
- Type             # Cat / Feed / Other
- RelatedId        # CatId 或 FeedLogId
- Path
- ContentType
- SizeBytes
- CapturedAtUtc
- UploadedBy       # Terminal / Admin
- CreatedAtUtc
- UpdatedAtUtc
```

### 4.3 识别结果（FeedLog）
**识别是一次事件，记录在投喂日志里。**

```
FeedLog
- Id
- DeviceId
- CatId (可空)
- Recognized       # bool
- Confidence       # float
- SnapshotImageId  # 可空
- TriggeredAtUtc
- RequestedAtUtc
- Decision/Result/...
```

> 特征向量不进后端数据库，由 Python 端私有存储维护。

---

## 5. 业务规则

### 5.1 冷却时间
- 取设备最近一次成功投喂的 `ReportedAtUtc`。
- 如果 `nowUtc - lastReported < CooldownSeconds`，拒绝。

### 5.2 日限额统计
- 按 `BusinessTimeZone` 计算当天（00:00–24:00）。
- 统计当天成功投喂次数 ≥ `DailyLimitCount`，拒绝。

### 5.3 拒绝也记录
- `/api/terminal/feed/allow` 无论允许/拒绝都写 `FeedLog`。
- `Decision = Denied` 时填 `DenyReason`。

---

## 6. API 规范（重点：Python 终端）

### 6.1 允许投喂
`POST /api/terminal/feed/allow`

**Request**

```json
{
  "deviceCode": "RPI-001",
  "catId": "f7bdb3a7-6eaa-4c89-9a41-2d09f1b20a7f",
  "recognized": true,
  "confidence": 0.87,
  "triggeredAtUtc": "2026-02-04T02:00:00Z",
  "snapshotImageId": "4b9b0f1d-9a59-4a0d-b9b2-6c7d246d0c2a"
}
```

**Response**

```json
{
  "allowed": true,
  "reason": "",
  "logId": "6f4b2894-0b4f-401f-b8c9-63a77bc3a9a2",
  "cooldownRemainingSeconds": 0,
  "dailyRemainingCount": 7,
  "dailyLimitCount": 10,
  "cooldownSeconds": 900
}
```

### 6.2 上报投喂结果
`POST /api/terminal/feed/report`

```json
{
  "logId": "6f4b2894-0b4f-401f-b8c9-63a77bc3a9a2",
  "deviceCode": "RPI-001",
  "result": "Success",
  "reportedAtUtc": "2026-02-04T02:02:10Z",
  "portionGrams": 50,
  "note": "dispense ok"
}
```

### 6.3 心跳
`POST /api/terminal/devices/heartbeat`

```json
{
  "deviceCode": "RPI-001",
  "status": "Online",
  "batteryPercent": 84,
  "signalStrength": -63,
  "ipAddress": "10.0.0.15",
  "firmwareVersion": "1.0.3",
  "timestampUtc": "2026-02-04T02:00:00Z"
}
```

---

## 7. Python 端识别与数据协作规范

### 7.1 特征向量存储（Python 私有）
- Python 本地维护：`CatId -> feature vector`
- 存储方式：本地文件 / 小型 SQLite / pickle
- 后端只记录：`CatId + Confidence + Recognized`

### 7.2 识别流程（推荐）

**首次发现**

1. 终端拍照
2. Python 判断未知猫
3. 请求后端创建 Cat（无特征）
4. 上传照片到 Media
5. Python 保存特征向量（CatId -> vector）

**再次出现**

1. Python 提取特征
2. 匹配本地特征库
3. 得到 CatId + confidence
4. 调用 `/feed/allow`
5. 后端记录 FeedLog

---

## 8. Swagger

启动后访问：
```
http://localhost:5248/swagger
```
（端口以控制台输出为准）

---

## 9. 配置说明

`appsettings.json`（生产）
`appsettings.Development.json`（开发）

```json
{
  "BusinessTimeZone": "Asia/Shanghai",
  "ConnectionStrings": {
    "Default": "Data Source=/data/kitty.db"
  }
}
```

---

## 10. SQLite 初始化与变更

目前使用 `EnsureCreated()` 自动建表：
- 当数据结构变更时，需删除旧数据库重新生成。
- 开发环境数据库路径：`./data/kitty.dev.db`

---

## 11. Docker 运行

```bash
docker compose up --build
```

`./data` 映射到容器 `/data`：
- SQLite：`/data/kitty.db`

---

## 12. CORS（开发环境）

开发环境默认允许：
- `http://localhost:5173`
- `http://localhost:3000`
- `http://localhost:8080`
- `http://127.0.0.1:5173`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:8080`

可在 `appsettings.Development.json` 的 `Cors:AllowedOrigins` 配置。

---

## 13. 常见问题

- **SQLite 无法打开**：确认路径存在（开发用 `./data`，生产用 `/data`）。
- **识别结果丢失**：确认终端调用 `/feed/allow` 后再 `/feed/report`。
- **日限额不生效**：检查 `BusinessTimeZone`。

---

## 14. TODO（可选）

- 终端上传图片接口（MediaFile 生成）
- 认证与角色权限
- EF Core Migrations

---

## 15. 约定

数据库存“人类定义的事实”，模型处理“机器的判断”。

