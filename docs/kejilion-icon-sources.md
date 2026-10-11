# kejilion 来源应用图标清单

本仓库为此前导入的 23 个 `kejilion-` 应用分别提供 `icon.png`，不再让它们全部显示为同一个蓝色“K”占位图。

- **17 个图标**直接源自对应项目的图标资源，采用原项目 Logo、favicon 或可识别标识，并在构建时校验固定 Git blob SHA。
- **6 个图标**由于原仓库未提供合适的独立应用图标（或 favicon 与产品不符），使用本仓库绘制的**专属说明性图标**，并非相关开发者官方授权的品牌 Logo。
- 所有 `icon.png` 都是本地提交的独立 **256×256 PNG**；宝塔不需要访问第三方图标 API。
- 原应用名称、Compose、安装字段、版本和持久化目录均未变更。

## 来源项目图标（17 个）

| 应用目录后缀 | 图标原始文件 | 固定 Git blob SHA 前缀 |
|---|---|---|
| airadio | [moli-xia/AIradio/public/favicon.png](https://github.com/moli-xia/AIradio/blob/main/public/favicon.png) | `1da3a07c01fd` |
| aistudio-to-api | [iBUHub/AIStudioToAPI/ui/public/AIStudio_icon.svg](https://github.com/iBUHub/AIStudioToAPI/blob/main/ui/public/AIStudio_icon.svg) | `225095ca6f25` |
| antigravity | [lbjlaq/Antigravity-Manager/public/icon.png](https://github.com/lbjlaq/Antigravity-Manager/blob/main/public/icon.png) | `812005720370` |
| copaw | [qizhuocai/CoPaw/website/public/copaw-symbol.png](https://github.com/qizhuocai/CoPaw/blob/main/website/public/copaw-symbol.png) | `b9dd46c94187` |
| dstatus | [fev125/dstatus/static/icons/icon.svg](https://github.com/fev125/dstatus/blob/main/static/icons/icon.svg) | `3f85af5b9822` |
| easyimg | [chaos-zhu/easyimg/public/favicon.png](https://github.com/chaos-zhu/easyimg/blob/main/public/favicon.png) | `cc1a551179d7` |
| excalidraw | [homarr-labs/dashboard-icons/png/excalidraw.png](https://github.com/homarr-labs/dashboard-icons/blob/main/png/excalidraw.png) | `097e83401f91` |
| fast-note-sync-service | [haierkeys/fast-note-sync-service/frontend/static/images/icon.svg](https://github.com/haierkeys/fast-note-sync-service/blob/master/frontend/static/images/icon.svg) | `3879aa398523` |
| gemini-business2api | [yukkcat/gemini-business2api/docs/logo.svg](https://github.com/yukkcat/gemini-business2api/blob/main/docs/logo.svg) | `bbe134fc4537` |
| global-radio | [moli-xia/global-radio/public/icon-512x512.png](https://github.com/moli-xia/global-radio/blob/main/public/icon-512x512.png) | `736e302d5d3c` |
| mlflow | [mlflow/mlflow/assets/logo.svg](https://github.com/mlflow/mlflow/blob/master/assets/logo.svg) | `6dd3cde27236` |
| monitor | [monitor-probe/monitor/web-admin/public/apple-touch-icon.png](https://github.com/monitor-probe/monitor/blob/main/web-admin/public/apple-touch-icon.png) | `98be41edc218` |
| mytube | [franklioxygen/MyTube/frontend/public/favicon.png](https://github.com/franklioxygen/MyTube/blob/master/frontend/public/favicon.png) | `1d6bc66948c3` |
| nodeget | [NodeSeekDev/NodeGet-board/public/android-icon-192x192.png](https://github.com/NodeSeekDev/NodeGet-board/blob/main/public/android-icon-192x192.png) | `0901e72e1095` |
| octopus | [bestruirui/octopus/web/public/web-app-manifest-512x512.png](https://github.com/bestruirui/octopus/blob/master/web/public/web-app-manifest-512x512.png) | `be090670296e` |
| sub2api | [Wei-Shaw/sub2api/assets/logo.svg](https://github.com/Wei-Shaw/sub2api/blob/main/assets/logo.svg) | `aae9dae91354` |
| zeroclaw | [zeroclaw-labs/zeroclaw/web/public/logo.png](https://github.com/zeroclaw-labs/zeroclaw/blob/master/web/public/logo.png) | `46bd9b86c967` |

**来源说明**：Excalidraw 图标由 [Homarr Dashboard Icons](https://github.com/homarr-labs/dashboard-icons)（Apache 2.0）整理，其余均来自对应项目/相关官方前端仓库。CoPaw 使用保留原版 CoPaw 视觉标识的 [CoPaw 仓库副本](https://github.com/qizhuocai/CoPaw)，Gemini Business2API 使用其仓库迁移后的 [yukkcat 镜像](https://github.com/yukkcat/gemini-business2api)。图标原始版权、商标与许可仍归各原始权利人，本仓库不声称得到官方背书或授予额外商用权利。

## 本仓库专属说明性图标（6 个）

- `arena-brawl`：交叉双剑（AB）
- `bomb-party`：炸弹（BP）
- `ice-climber-arena`：冰山（ICE）
- `neon-arena-fps`：霓虹准星（FPS）
- `wxchat`：聊天气泡（WX）
- `hubproxy`：双向数据代理（HP）；上游自带的 favicon 仅是 GitHub 猫形符号，并非合适的 HubProxy 标识

## 更新方式

重新生成图标（仅维护者操作，**安装应用无需执行这些命令**）：

```bash
python -m pip install 'Pillow>=10,<13' 'CairoSVG>=2.7,<3' 'requests>=2.31,<3'
python scripts/rebuild_kejilion_icons.py
python scripts/validate_kejilion.py
```

构建时从 `scripts/kejilion_icon_sources.json` 所列 GitHub 仓库读取资源，并核对文件字节的 Git blob SHA，若上游资源已改变会直接报错。需要更新 Logo 时应明确更新来源 SHA 并重新审查图像。不会下载或执行第三方安装脚本。

GitHub Actions 原有的应用元数据校验和扩展的图标校验会检查全部 23 个 PNG 的签名、尺寸及内容唯一性。

**宝塔更新提示**：若重新导入仓库后仍显示旧“K”，请刷新宝塔 Docker → 应用商店 → 外部应用列表，必要时重新导入并执行浏览器强制刷新（Ctrl+F5）。浏览器或宝塔的图标缓存可能不会立即失效。

