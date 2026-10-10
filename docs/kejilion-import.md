# kejilion/apps 来源应用适配说明

> 上游项目：https://github.com/kejilion/apps ，仓库 Git tree 版本 `1809cbb09bc812ad2796ca7cec1b3f8f9a7afa1e`。

## 命名与兼容规则

- **展示名称**：所有新应用均以 `kejilion - ` 开头；目录采用 `apphub/kejilion-<id>`，不会覆盖原有应用。
- **配置结构**：每个新应用都有 `app.json`、`icon.png`、`latest/.env`、`latest/docker-compose.yml`。
- **端口**：此批新应用使用互不重复的 `45601–45623` 端口，安装界面可修改。
- **访问安全**：敏感服务默认 `BIND_IP=127.0.0.1`，适合公网访问的游戏、白板、电台则使用 `0.0.0.0`；可通过 HTTPS 反向代理公开。
- **账号密钥**：有密码的应用不得在公开仓库中使用固定密码，首次安装时输入独立强密码；升级已运行实例时保留已有凭据。
- **持久化**：统一挂载 `APP_PATH/data` 下的目录；PostgreSQL/Redis 位于应用私有网络。
- **发布状态**：只完成 Compose 静态校验，没有完成宝塔实机首次安装、升级和数据恢复测试；不应将 CI 通过等同于可用性验证。
- **镜像**：继承上游镜像名称和原始容器端口，浮动 `latest` 镜像需要生产部署者自行固定版本。

## 已新增的 23 个应用

| 应用 | 展示标题前缀 | 默认端口 |
|---|---|---:|
| [airadio](../apphub/kejilion-airadio/app.json) | `kejilion - ` | 45601 |
| [aistudio-to-api](../apphub/kejilion-aistudio-to-api/app.json) | `kejilion - ` | 45602 |
| [antigravity](../apphub/kejilion-antigravity/app.json) | `kejilion - ` | 45603 |
| [arena-brawl](../apphub/kejilion-arena-brawl/app.json) | `kejilion - ` | 45604 |
| [bomb-party](../apphub/kejilion-bomb-party/app.json) | `kejilion - ` | 45605 |
| [copaw](../apphub/kejilion-copaw/app.json) | `kejilion - ` | 45606 |
| [dstatus](../apphub/kejilion-dstatus/app.json) | `kejilion - ` | 45607 |
| [excalidraw](../apphub/kejilion-excalidraw/app.json) | `kejilion - ` | 45608 |
| [fast-note-sync-service](../apphub/kejilion-fast-note-sync-service/app.json) | `kejilion - ` | 45609 |
| [gemini-business2api](../apphub/kejilion-gemini-business2api/app.json) | `kejilion - ` | 45610 |
| [global-radio](../apphub/kejilion-global-radio/app.json) | `kejilion - ` | 45611 |
| [hubproxy](../apphub/kejilion-hubproxy/app.json) | `kejilion - ` | 45612 |
| [ice-climber-arena](../apphub/kejilion-ice-climber-arena/app.json) | `kejilion - ` | 45613 |
| [monitor](../apphub/kejilion-monitor/app.json) | `kejilion - ` | 45614 |
| [easyimg](../apphub/kejilion-easyimg/app.json) | `kejilion - ` | 45615 |
| [mlflow](../apphub/kejilion-mlflow/app.json) | `kejilion - ` | 45616 |
| [neon-arena-fps](../apphub/kejilion-neon-arena-fps/app.json) | `kejilion - ` | 45617 |
| [octopus](../apphub/kejilion-octopus/app.json) | `kejilion - ` | 45618 |
| [wxchat](../apphub/kejilion-wxchat/app.json) | `kejilion - ` | 45619 |
| [zeroclaw](../apphub/kejilion-zeroclaw/app.json) | `kejilion - ` | 45620 |
| [nodeget](../apphub/kejilion-nodeget/app.json) | `kejilion - ` | 45621 |
| [mytube](../apphub/kejilion-mytube/app.json) | `kejilion - ` | 45622 |
| [sub2api](../apphub/kejilion-sub2api/app.json) | `kejilion - ` | 45623 |

其中 NodeGet、MyTube、Sub2API 为多容器模板；EasyImg 去掉了原始示例里访问 Docker socket 的自动更新容器。新图标是统一的 kejilion 来源标识，不冒用原应用商标。

## 暂缓转译的 14 个应用

这些应用需要更多宿主机脚本、管理员初始化或权限审计，不能直接复制 Bash 安装器作为宝塔 Compose：

| 源应用 | 暂缓原因 |
|---|---|
| [actual-budget](https://github.com/kejilion/apps/blob/main/actual-budget.conf) | 首次用户 bootstrap 需要安全初始化 |
| [AIClient-2-API](https://github.com/kejilion/apps/blob/main/AIClient-2-API.conf) | 上游有固定默认管理员凭据 |
| [CLIProxyAPI](https://github.com/kejilion/apps/blob/main/CLIProxyAPI.conf) | 需要准备配置文件/授权目录 |
| [clouddrive2](https://github.com/kejilion/apps/blob/main/clouddrive2.conf) | 依赖 FUSE、特权和宿主机挂载 |
| [dnsmgr](https://github.com/kejilion/apps/blob/main/dnsmgr.conf) | 依赖过旧 MySQL 5.7 |
| [docmost](https://github.com/kejilion/apps/blob/main/docmost.conf) | 首次管理员/工作区初始化未转译 |
| [gmssh](https://github.com/kejilion/apps/blob/main/gmssh.conf) | 依赖上游初始化容器和配置 |
| [grok2api](https://github.com/kejilion/apps/blob/main/grok2api.conf) | 依赖上游配置模板与构建文件 |
| [homebox](https://github.com/kejilion/apps/blob/main/homebox.conf) | 首次注册后需要自动关闭公开注册 |
| [kpanel](https://github.com/kejilion/apps/blob/main/kpanel.conf) | 宿主机 systemd/agent 安装流程复杂 |
| [lanqin-email](https://github.com/kejilion/apps/blob/main/lanqin-email.conf) | 邮件 DNS/TLS/端口要求高 |
| [molilotto](https://github.com/kejilion/apps/blob/main/molilotto.conf) | 浮动 Compose 及密钥初始化待审查 |
| [pika](https://github.com/kejilion/apps/blob/main/pika.conf) | 依赖外部配置文件 |
| [workbuddy2api](https://github.com/kejilion/apps/blob/main/workbuddy2api.conf) | 依赖签名校验部署脚本和宿主行为 |

另有 11 个与当前 Baota-Apphub 同名的应用（如 Headscale、FreshRSS、NTFY、NPS 等），此次不重复添加。

## 许可证与来源

来源 `kejilion/apps` 的仓库许可为 Apache License 2.0，许可证副本在 [`third_party/kejilion-apps/LICENSE`](../third_party/kejilion-apps/LICENSE)。本次对模板做了独立转换与安全修改；这些文件不表示其他仓库内容或第三方 Docker 镜像采用 Apache 2.0。

## 发布前验收

CI 应检查新增应用的元数据、版本目录、端口唯一性、安装字段与 Compose 配置。生产使用前，需要在真实宝塔环境验证参数注入、`APP_PATH`、`baota_net`、首次初始化、证书代理与数据备份/升级。
