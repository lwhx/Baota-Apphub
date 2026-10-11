# 外部应用分类油猴脚本

## 页面效果

宝塔原有的“应用分类”栏完整保留。在下方增加独立的“外部应用分类”栏：

新增栏保持单行，分类较多时横向滚动。

- **全部外部应用**：仅展示外部导入的应用，使用面板的 `appid=-1` 标识识别；不依赖标题前缀。
- **官方分类**：读取当前面板 `get_tags` 返回的分类名称和顺序，新增官方分类也会同步显示。接口未返回分类时使用建站、数据库、存储/网盘、AI/大模型、实用工具、NAS、中间件、DevOps、多媒体、邮件服务、系统工具作为备用。
- **自定义分类**：预置 AI/API 网关、监控运维、笔记知识库、下载工具、影音电台、游戏娱乐、图床相册、网络代理、导航面板、kejilion 来源。
- **管理分类**：新增、重命名或删除分类，勾选应用归属；同一应用可属于多个分类。
- **恢复原生筛选**：退出外部筛选，恢复宝塔原生列表。点击上方原生分类同样退出外部筛选。

初次打开页面时保持原生列表；只有点击新增分类时才筛选外部应用。搜索框继续使用宝塔原生搜索。安装按钮、安装弹窗、密码字段、版本和依赖等仍由宝塔原生页面处理。

## 安装和使用

1. 浏览器安装并启用 Tampermonkey（油猴）或兼容的用户脚本管理器。
2. 打开 [脚本安装链接](https://raw.githubusercontent.com/lwhx/Baota-Apphub/main/userscripts/baota-external-categories.user.js)，确认安装。**PR 合并前**使用 [开发分支安装链接](https://raw.githubusercontent.com/lwhx/Baota-Apphub/feat/external-category-userscript-20261011/userscripts/baota-external-categories.user.js)。
3. 刷新已经登录的宝塔面板，进入 **Docker → 应用商店**。
4. 如尚未导入应用，先通过宝塔原生的 **更多 → 外部应用 → 导入应用** 导入本仓库。
5. 在新增栏中选择分类。添加自己的分类时，先点击 **全部外部应用**，清空搜索并搜索一次以加载完整外部列表，再打开 **管理分类**。

自定义分配按 `appname` 精确匹配；默认分类只列出当前仓库中的应用标识。其他仓库导入的应用自动出现在“全部外部应用”和对应官方分类中，可再手动分配到自定义分类。

配置保存在当前浏览器、当前面板地址的 `localStorage`，键为 `baota-apphub:external-categories:v1`。刷新或关闭页面后仍保留；更换浏览器、域名、协议或端口不会共享配置。取消管理弹窗不会保存修改。清除该键并刷新页面可恢复预置分类；清除网站全部数据会同时影响其他面板本地设置，不建议这样恢复。

## 兼容范围

- 针对提供 Docker 外部应用功能的宝塔 10.0+ 页面设计。
- 研究依据为 aaPanel 公共源码提交 `4af59b2386e118fc0e4b2ae838dacac992d16b1c`：
  - [应用列表、官方分类与 AppHub 筛选](https://github.com/aaPanel/aaPanel/blob/4af59b2386e118fc0e4b2ae838dacac992d16b1c/mod/project/docker/app/appManageMod.py)
  - [外部模板解析](https://github.com/aaPanel/aaPanel/blob/4af59b2386e118fc0e4b2ae838dacac992d16b1c/mod/project/docker/apphub/apphubManage.py)
  - [Vue 应用列表与分类组件](https://github.com/aaPanel/aaPanel/blob/4af59b2386e118fc0e4b2ae838dacac992d16b1c/BTPanel/static/vite/js/view-docker.js)
- 支持同源 `/mod/docker/com/get_apps` 和 `/mod/docker/com/get_tags`，以及它们的 `/stype` 形式；支持 Fetch、XHR 文本和 XHR JSON 响应。
- 支持直接 `/docker`、`/v2/docker`、`/new/docker/...`、`/apsess_<会话>/docker/...` 和 Docker hash 路由。在 `/new`、`/v2`、`/apsess_<会话>` 首页载入后，进入 Docker 页面也能挂载。页面动态重绘后自动重新挂载并保持筛选状态，重复注入只保留一份分类栏。
- 外部模式请求 `app_type=AppHub, p=1, row=20000`，再在整个返回列表上分类筛选；关闭外部模式时不改变原生列表接口参数和响应。源码中的 `get_apps` 已使用最多 20000 条的列表模式。其他版本若自行限制返回条数，需另行适配分页，不能把当前页筛选当作完整分类。
- 若找不到原生分类或搜索控件，不启动新的外部筛选；显示明确的兼容提示并保留原生状态。已经开启筛选后若控件消失，可点击上方原生分类恢复列表。脚本不模拟未加载的安装卡片，也不自行调用安装接口。

浏览器测试使用基于上述控件和接口结构构造的兼容测试页面，覆盖原生分类、搜索、安装参数、自定义管理和动态挂载。**尚未在用户实际的宝塔版本和登录会话中完成实机验收。** 中文面板或后续版本若改变路由/DOM/接口，应附面板版本、应用商店截图及脱敏后的 `get_apps`/`get_tags` 响应报错，便于适配。

## 权限和故障处理

脚本不修改服务器文件、`app.json` 或 `apptype`，不需要宝塔 API 密钥，不向第三方发送面板数据，也不加载远程代码或远程分类配置。使用 `@grant none`，必须在页面主环境运行以适配原生 Fetch/XHR；脚本管理器或 CSP 阻止主环境注入时，需要检查管理器的页面注入配置。

元数据默认 `@match *://*/*` 以兼容用户的私有面板域名和端口，但运行时限定面板入口，并仅处理指定同源列表接口。可在油猴管理器中将匹配范围进一步限定为自己的面板域名，例如 `https://panel.example.com/*`。不要在其他网站手动启用脚本。

新增栏未出现时：确认脚本已启用并刷新页面，检查是否进入 Docker 应用商店；未知页面结构会保持原生页面。分类配置损坏时会显示提示并临时使用默认分类，重新保存可恢复。保存受浏览器存储限制影响时会在弹窗中显示失败信息，保留当前配置。

## 维护与测试

维护源文件：`userscripts/src/baota-external-categories.js`。安装文件：`userscripts/baota-external-categories.user.js`。预置自定义分组：`userscripts/default-groups.json`。

不要直接修改生成的安装文件。调整源文件或分组后运行：

```bash
python scripts/build_userscript.py
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:browser
python scripts/validate_catalog.py
python scripts/validate_kejilion.py
```

`build_userscript.py --check` 校验安装文件与源文件一致，并检查预置分配引用的应用标识均存在。浏览器测试支持通过 `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` 指定已有 Chromium。CI 同时保留原有全量 Docker Compose 校验。
