# Baota-Apphub - 宝塔面板 Docker 应用资源库

[![GitHub stars](https://img.shields.io/github/stars/lwhx/Baota-Apphub?style=flat-square)](https://github.com/lwhx/Baota-Apphub/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/lwhx/Baota-Apphub?style=flat-square)](https://github.com/lwhx/Baota-Apphub/network)
[![GitHub issues](https://img.shields.io/github/issues/lwhx/Baota-Apphub?style=flat-square)](https://github.com/lwhx/Baota-Apphub/issues)

> **社区维护的宝塔面板 Docker 应用资源库，提供完整配置的 Docker 应用，支持模板化导入部署**

## 🚀 项目简介

Baota-Apphub 是一个由社区维护的 Docker 应用资源库，专为宝塔面板用户设计。本项目收录了大量经过完整配置的 Docker 应用，用户可以通过宝塔面板的外部应用功能一键导入并部署，极大简化了 Docker 应用的部署流程。

**⚠️ 重要声明：本项目由社区维护，与宝塔官方无任何关联**

## ✨ 核心特性

### 🔧 完善的 Docker 应用配置
- **预配置完成**：所有 Docker 应用均已预先配置完成，包含完整的 docker-compose.yml 文件
- **开箱即用**：无需复杂配置，导入后即可直接部署运行
- **多版本支持**：提供多个版本选择，满足不同需求
- **标准化结构**：统一的目录结构和配置格式，确保兼容性

### 🎯 宝塔面板集成支持
- **一键导入**：支持通过 Git 仓库地址直接导入到宝塔面板
- **简化流程**：无需手动编写 Docker 配置文件
- **可视化管理**：通过宝塔面板图形界面管理 Docker 应用
- **批量部署**：支持批量导入多个应用

### 🌟 社区维护优势
- **持续更新**：社区成员持续维护和更新应用配置
- **快速响应**：问题反馈和功能请求得到及时处理
- **开源透明**：所有配置文件公开可审查，但部署前仍需检查镜像来源、权限及凭据
- **丰富资源**：涵盖各类常用 Docker 应用

## 📦 应用目录

> 部分历史应用仅有元数据，尚无可安装模板，已标记为不可安装。请勿将所有列出的应用视为通过实际部署测试。


本仓库包含 **367** 个精心配置的 Docker 应用，涵盖以下分类：

- **🌐 Web 服务**：Nginx、Apache、Caddy 等
- **💾 数据库**：MySQL、PostgreSQL、Redis、MongoDB 等
- **📊 监控工具**：Grafana、Prometheus、Netdata 等
- **🔒 安全工具**：Bitwarden、Vaultwarden、SafeLine 等
- **📁 文件管理**：Nextcloud、Seafile、Alist 等
- **🎵 媒体服务**：Jellyfin、Plex、Navidrome 等
- **🤖 AI 工具**：ChatNio、Lobe-Chat 等
- **📝 笔记工具**：Trilium、Siyuan、Obsidian 等
- **🔧 开发工具**：GitLab、Gitea、Code-Server 等

## 🧩 kejilion 来源应用

新增 23 个来自 [kejilion/apps](https://github.com/kejilion/apps) 的 Docker 应用适配模板。
**标题统一以 `kejilion - ` 开头，应用目录统一为 `apphub/kejilion-<id>`**；不覆盖已有同名应用。
详见 [来源、完整清单与安全说明](docs/kejilion-import.md)。新模板尚未经过宝塔实机部署测试。

新增 23 个应用已配置**独立的 256×256 PNG 图标**，采用上游项目标识或各自专属的原创替代图标。完整的[图标来源、维护说明](docs/kejilion-icon-sources.md)可供审查；如果宝塔仍显示旧图标，请重新导入外部应用并刷新浏览器缓存。

## 🛠️ 安装部署

### 外部应用分类（可选油猴脚本）

保留宝塔原有分类，在顶部增加一栏**仅筛选外部应用**的分类：保留当前面板的官方分类，并预置 AI/API 网关、监控运维、笔记知识库、下载工具、游戏娱乐、kejilion 来源等 10 个自定义分组。分类自动换行，支持拖动、按钮和键盘排序，顺序自动保存。支持在“管理分类”中新增、重命名、删除和批量勾选应用归属；使用原生搜索与安装流程。

- [安装油猴脚本](https://raw.githubusercontent.com/lwhx/Baota-Apphub/main/userscripts/baota-external-categories.user.js)
- [使用、兼容范围与维护说明](docs/external-categories-userscript.md)

无需修改服务器或应用模板。自定义分组保存在当前浏览器的当前面板地址；实际宝塔页面兼容性仍需实机验收。

### 前置要求

- 宝塔面板版本 **10.0 及以上**
- 已安装 Docker 和 Docker Compose
- 服务器具备互联网访问能力

### 导入方法

#### 方法一：Git 仓库导入（推荐）

1. 登录宝塔面板
2. 进入 **Docker** → **应用商店** → **更多** → **外部应用**
3. 点击 **导入应用** 按钮
4. 选择 **Git 仓库导入**
5. 输入仓库地址：
   ```
   https://github.com/lwhx/Baota-Apphub.git
   ```
   国内网络环境可以先下载 GitHub ZIP 压缩包，再选择文件导入。
6. 点击 **导入** 完成

#### 方法二：压缩包导入

1. 下载本仓库的 ZIP 压缩包
2. 在宝塔面板中选择 **从文件导入**
3. 上传下载的压缩包文件
4. 系统自动解析并导入应用

### 详细导入教程

更详细的导入步骤和使用说明，请参考宝塔官方教程：

**📖 [宝塔面板 Docker 外部应用使用教程](https://www.bt.cn/bbs/thread-147864-1-1.html)** <mcreference link="https://www.bt.cn/bbs/thread-147864-1-1.html" index="0">0</mcreference>

## 📁 目录结构

```
apphub/                               # 应用根目录（必须为 apphub）
├── alist/                           # 应用目录（应用名称）
│   ├── app.json                     # 应用配置文件
│   ├── icon.png                     # 应用图标
│   ├── 3.42.0/                      # 版本目录
│   │   └── docker-compose.yml       # Docker Compose 配置
│   └── latest/                      # 最新版本
│       └── docker-compose.yml
├── nextcloud/
│   ├── app.json
│   ├── icon.png
│   └── latest/
│       └── docker-compose.yml
└── ...                             # 更多应用
```

## 🔍 安装模板校验与安全提示

新应用和模板变更需通过 GitHub Actions 的 `Validate application catalog` 校验。
本地执行：

```bash
python -m pip install "PyYAML>=6.0,<7"
python scripts/validate_catalog.py
```

- CI 检查元数据、版本目录、图标、Compose YAML、字段重复，以及已修复模板中的共享密码回归。
- 对关键 Compose 文件进行原生配置解析，仍需在实际宝塔面板中进行首次安装与升级测试。
- 安装需要密码的应用时，请在安装界面输入独立密码，不要复用已公开的默认值。
- **升级已有实例时必须保留原数据库密码和服务密码**；更改数据库账号密码需要同步修改实际数据库服务配置。
- 历史 Docker 镜像版本未全部经过更新与安全复核，部署前检查上游安全公告与镜像来源。

## 🤝 参与贡献

我们欢迎社区成员参与项目贡献！

### 贡献方式

- **🐛 报告问题**：发现 Bug 或配置问题请提交 Issue
- **💡 功能建议**：有新的应用需求或功能建议请提交 Issue
- **🔧 提交 PR**：修复问题或添加新应用请提交 Pull Request
- **📖 完善文档**：帮助改进文档和使用说明

### 添加新应用

1. Fork 本仓库
2. 在 `apphub/` 目录下创建新的应用目录
3. 按照标准格式添加 `app.json` 和 `docker-compose.yml`
4. 测试配置文件的正确性
5. 提交 Pull Request

详细的应用配置格式请参考：[模板格式说明](template.md)

## ⚠️ 安全提醒

- **仅使用可信应用**：请只导入和使用来源可靠的应用配置
- **定期更新**：建议定期更新应用到最新版本
- **备份数据**：部署前请做好重要数据备份
- **网络安全**：注意配置防火墙和访问控制

## 📞 技术支持

- **GitHub Issues**：[提交问题和建议](https://github.com/lwhx/Baota-Apphub/issues)
- **QQ 交流群**：1061259740（宝塔 Docker 官方交流群）

## 📄 开源协议

本仓库暂未附独立许可证文件。应用模板和第三方组件的许可条件请以各上游项目为准；发布或二次分发前需完成许可证核验。

## 🙏 致谢

感谢 [@okxlin](https://github.com/okxlin) 提供的 [AppStore](https://github.com/okxlin/appstore) 项目，为本项目的导入功能提供了重要支持。

感谢所有为本项目贡献代码、提出建议和反馈问题的社区成员！

---

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**
