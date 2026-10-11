// ==UserScript==
// @name         Baota-Apphub 外部应用分类
// @namespace    https://github.com/lwhx/Baota-Apphub
// @version      1.0.0
// @description  保留宝塔原有分类，额外显示外部应用的官方分类与可管理的自定义分类。
// @author       lwhx
// @match        *://bt.whks.de/docker*
// @run-at       document-start
// @grant        none
// @sandbox      raw
// @inject-into  page
// @noframes
// @homepageURL  https://github.com/lwhx/Baota-Apphub
// @supportURL   https://github.com/lwhx/Baota-Apphub/issues
// @downloadURL  https://raw.githubusercontent.com/lwhx/Baota-Apphub/main/userscripts/baota-external-categories.user.js
// @updateURL    https://raw.githubusercontent.com/lwhx/Baota-Apphub/main/userscripts/baota-external-categories.user.js
// ==/UserScript==

(function () {
  'use strict';
  const DEFAULT_GROUPS = [
  {
    "id": "api-gateways",
    "name": "AI/API 网关",
    "apps": [
      "go-chatgpt-api",
      "kejilion-aistudio-to-api",
      "kejilion-antigravity",
      "kejilion-gemini-business2api",
      "kejilion-octopus",
      "kejilion-sub2api",
      "deeplx"
    ]
  },
  {
    "id": "monitoring",
    "name": "监控运维",
    "apps": [
      "amprobe",
      "beszel",
      "beszel-agent",
      "dashdot",
      "grafana",
      "hertzbeat",
      "netdata",
      "nezha-agent",
      "nezha-dash",
      "nezha-dashboard",
      "prometheus",
      "serverstatus",
      "smokeping",
      "tianji",
      "vps-stock-monitor",
      "zabbix-agent",
      "zabbix-server",
      "kejilion-dstatus",
      "kejilion-monitor"
    ]
  },
  {
    "id": "notes",
    "name": "笔记知识库",
    "apps": [
      "blinko",
      "blossom",
      "joplin-server",
      "obsidian",
      "obsidian-zh",
      "siyuan",
      "trilium",
      "trilium-cn",
      "raneto",
      "stackedit",
      "mediawiki",
      "kejilion-fast-note-sync-service"
    ]
  },
  {
    "id": "downloads",
    "name": "下载工具",
    "apps": [
      "115pc",
      "aria2-pro",
      "baidunetdisk",
      "deluge",
      "gopeed",
      "metube",
      "qBittorrent",
      "qbittorrent-vnc",
      "transmission",
      "xunlei",
      "kejilion-nodeget",
      "kejilion-mytube"
    ]
  },
  {
    "id": "radio",
    "name": "影音电台",
    "apps": [
      "audiobookshelf",
      "emby-amilys",
      "embyserver",
      "jellyfin",
      "navidrome",
      "plex",
      "splayer",
      "yesplaymusic",
      "kejilion-airadio",
      "kejilion-global-radio",
      "kejilion-mytube"
    ]
  },
  {
    "id": "games",
    "name": "游戏娱乐",
    "apps": [
      "dosgame",
      "palworld-server",
      "mcsmanager-web",
      "mcsmanager-daemon",
      "pterodactyl-china",
      "kejilion-arena-brawl",
      "kejilion-bomb-party",
      "kejilion-ice-climber-arena",
      "kejilion-neon-arena-fps"
    ]
  },
  {
    "id": "images",
    "name": "图床相册",
    "apps": [
      "chevereto",
      "easyimage2",
      "lsky-pro",
      "piclist",
      "picx",
      "picimpact",
      "slink",
      "immich",
      "mt-photos",
      "photoprism",
      "photoview",
      "kejilion-easyimg"
    ]
  },
  {
    "id": "network",
    "name": "网络代理",
    "apps": [
      "cloudflared",
      "frp-panel",
      "frp-panel-master",
      "frpc",
      "frps",
      "gh-proxy",
      "headscale",
      "headscale-derp",
      "headscale-ui",
      "headscale-webui",
      "nginx-proxy-manager",
      "npc",
      "nps",
      "rathole",
      "tailscale",
      "wireguard",
      "wireguard-easy",
      "wireguard-ui",
      "zerotier-moon",
      "zerotier-one",
      "zerotier-planet",
      "kejilion-hubproxy"
    ]
  },
  {
    "id": "navigation",
    "name": "导航面板",
    "apps": [
      "dashmachine",
      "dashy",
      "glance",
      "heimdall",
      "homepage",
      "mtab",
      "onenav",
      "sun-panel",
      "twonav",
      "van-nav"
    ]
  },
  {
    "id": "kejilion",
    "name": "kejilion 来源",
    "apps": [
      "kejilion-airadio",
      "kejilion-aistudio-to-api",
      "kejilion-antigravity",
      "kejilion-arena-brawl",
      "kejilion-bomb-party",
      "kejilion-copaw",
      "kejilion-dstatus",
      "kejilion-easyimg",
      "kejilion-excalidraw",
      "kejilion-fast-note-sync-service",
      "kejilion-gemini-business2api",
      "kejilion-global-radio",
      "kejilion-hubproxy",
      "kejilion-ice-climber-arena",
      "kejilion-mlflow",
      "kejilion-monitor",
      "kejilion-mytube",
      "kejilion-neon-arena-fps",
      "kejilion-nodeget",
      "kejilion-octopus",
      "kejilion-sub2api",
      "kejilion-wxchat",
      "kejilion-zeroclaw"
    ]
  }
];
  const DEFAULT_TAGS = [
    ['BuildWebsite', '建站'], ['Database', '数据库'], ['Storage', '存储/网盘'],
    ['AI', 'AI/大模型'], ['Tools', '实用工具'], ['NAS', 'NAS'],
    ['Middleware', '中间件'], ['DevOps', 'DevOps'], ['Media', '多媒体'],
    ['Email', '邮件服务'], ['System', '系统工具'],
  ].map(([type, desc], sort) => ({ type, desc, sort }));

  function isExternal(app) {
    return !!app && (app.appid === -1 || app.appid === '-1') && typeof app.appname === 'string';
  }

  function listSlot(payload) {
    if (Array.isArray(payload)) return { list: payload, path: [] };
    if (!payload || typeof payload !== 'object' || payload.status === false || payload.status === -1) return null;
    for (const key of ['message', 'data']) {
      if (Array.isArray(payload[key])) return { list: payload[key], path: [key] };
      if (payload[key] && Array.isArray(payload[key].data)) return { list: payload[key].data, path: [key, 'data'] };
    }
    return null;
  }

  function appList(payload) {
    return listSlot(payload)?.list || [];
  }

  function filterPayload(payload, selection, groups) {
    if (!selection) return payload;
    const slot = listSlot(payload);
    if (!slot) return payload;
    const group = groups.find(item => selection === `custom:${item.id}`);
    const members = new Set(group?.apps || []);
    const list = slot.list.filter(app => isExternal(app) && (
      selection === 'all' ||
      (selection.startsWith('official:') && app.apptype === selection.slice(9)) ||
      (selection.startsWith('custom:') && members.has(app.appname))
    ));
    if (slot.path.length === 0) return list;
    const result = { ...payload };
    let parent = result;
    for (const key of slot.path.slice(0, -1)) {
      parent[key] = { ...parent[key] };
      parent = parent[key];
    }
    parent[slot.path.at(-1)] = list;
    // External mode requests the whole catalog; remove the original, unfiltered pager.
    if (typeof parent.page === 'string') parent.page = '';
    for (const key of ['total', 'count']) if (typeof parent[key] === 'number') parent[key] = list.length;
    return result;
  }

  function rewriteBody(body) {
    const values = { app_type: 'AppHub', p: 1, row: 20000 };
    if (typeof body === 'string' && body.trimStart().startsWith('{')) {
      return JSON.stringify({ ...JSON.parse(body), ...values });
    }
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      const result = new FormData();
      for (const [key, value] of body) result.append(key, value);
      for (const [key, value] of Object.entries(values)) result.set(key, String(value));
      return result;
    }
    const result = new URLSearchParams(body || '');
    for (const [key, value] of Object.entries(values)) result.set(key, String(value));
    return result.toString();
  }

  function validateGroups(groups) {
    if (!Array.isArray(groups) || groups.length > 100) throw new Error('分类配置必须是数组，最多 100 个分类。');
    const ids = new Set();
    const names = new Set();
    return groups.map(group => {
      if (!group || typeof group.id !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(group.id) || ids.has(group.id) ||
          typeof group.name !== 'string' || !group.name.trim() || group.name.trim().length > 40 || names.has(group.name.trim()) ||
          !Array.isArray(group.apps) || group.apps.length > 20000 ||
          group.apps.some(name => typeof name !== 'string' || !name || name.length > 200)) {
        throw new Error('分类名称不能为空或重复（最多 40 字），应用标识必须是字符串。');
      }
      ids.add(group.id);
      names.add(group.name.trim());
      return { id: group.id, name: group.name.trim(), apps: [...new Set(group.apps)] };
    });
  }

  function endpoint(url, origin) {
    try {
      const parsed = new URL(url, origin);
      if (parsed.origin !== origin) return null;
      return parsed.pathname.match(/^\/mod\/docker\/com\/(get_apps|get_tags|get_installed_apps)(?:\/stype)?\/?$/)?.[1] || null;
    } catch { return null; }
  }

  const core = { isExternal, appList, filterPayload, rewriteBody, validateGroups, endpoint };
  if (typeof module === 'object' && module.exports) module.exports = core;
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  // Match broadly because panel domains, ports and SPA entry points are user-specific.
  // No interception or UI on ordinary sites, login pages or non-panel routes.
  const panelEntry = () => /(^|\/)(docker|new|v2|apsess_[^/]+)(\/|$)/.test(location.pathname) || /^#\/?docker(\/|$)/.test(location.hash);
  const dockerView = () => /(^|\/)docker(\/|$)/.test(location.pathname) || /^#\/?docker(\/|$)/.test(location.hash);
  if (!panelEntry() || window.__baotaApphubCategoriesInstalled) return;
  window.__baotaApphubCategoriesInstalled = true;
  const KEY = 'baota-apphub:external-categories:v1';
  const state = { selection: null, groups: validateGroups(DEFAULT_GROUPS), tags: DEFAULT_TAGS, apps: [], row: null, root: null, internalClick: false, generation: 0 };
  let storageProblem = '';
  try {
    const saved = localStorage.getItem(KEY);
    if (saved !== null) state.groups = validateGroups(JSON.parse(saved));
  } catch { storageProblem = '本地分类配置无法读取，暂用默认分类；可在管理分类中重新保存。'; }

  const node = (tag, text, attrs = {}) => {
    const element = document.createElement(tag);
    if (text !== undefined) element.textContent = text;
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
    return element;
  };
  const button = (text, action, attrs = {}) => {
    const element = node('button', text, { type: 'button', ...attrs });
    element.addEventListener('click', action);
    return element;
  };
  const active = () => !!state.selection && !!state.root?.isConnected && dockerView();

  function clearInstalledMode(kind) {
    if (kind !== 'get_installed_apps' || !state.selection) return;
    state.selection = null;
    state.generation++;
    renderBar();
  }

  function consume(kind, payload, generation) {
    const list = appList(payload);
    if (kind === 'get_tags' && list.length) {
      const tags = list.filter(tag => tag && typeof tag.type === 'string' && typeof tag.desc === 'string' && !['all', 'installed', 'AppHub'].includes(tag.type));
      if (tags.length) state.tags = [...new Map(tags.sort((a, b) => (a.sort || 0) - (b.sort || 0)).map(tag => [tag.type, tag])).values()];
    }
    if (kind === 'get_apps' && listSlot(payload)) state.apps = list.filter(isExternal);
    renderBar();
    if (kind === 'get_apps' && generation !== state.generation) scheduleReload();
    return kind === 'get_apps' ? filterPayload(payload, active() ? state.selection : null, state.groups) : payload;
  }

  // XHR adapter: change only get_apps request parameters and its response getters.
  // Native installation, imports, downloads, auth headers and other API calls pass through.
  const xhrOpen = XMLHttpRequest.prototype.open;
  const xhrSend = XMLHttpRequest.prototype.send;
  const responseText = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'responseText').get;
  const response = Object.getOwnPropertyDescriptor(XMLHttpRequest.prototype, 'response').get;
  const xhrMeta = new WeakMap();
  XMLHttpRequest.prototype.open = function (method, url, ...args) {
    const kind = endpoint(String(url), location.origin);
    clearInstalledMode(kind);
    const meta = { kind, generation: state.generation, cache: null, method };
    xhrMeta.set(this, meta);
    if (['get_apps', 'get_tags'].includes(kind) && !Object.hasOwn(this, '__bahResponse')) {
      Object.defineProperty(this, '__bahResponse', { value: true });
      for (const [name, getter] of [['responseText', responseText], ['response', response]]) {
        Object.defineProperty(this, name, { configurable: true, get() {
          const raw = getter.call(this);
          const info = xhrMeta.get(this);
          if (!['get_apps', 'get_tags'].includes(info?.kind) || this.readyState !== 4 || this.status < 200 || this.status >= 300) return raw;
          if (typeof raw !== 'string' && this.responseType !== 'json') return raw;
          if (!info.cache || info.cache.raw !== raw) {
            try {
              const payload = typeof raw === 'string' ? JSON.parse(raw) : raw;
              const filtered = consume(info.kind, payload, info.generation);
              info.cache = { raw, value: typeof raw === 'string' && filtered !== payload ? JSON.stringify(filtered) : filtered === payload ? raw : filtered };
            } catch { info.cache = { raw, value: raw }; }
          }
          return info.cache.value;
        } });
      }
    }
    return xhrOpen.call(this, method, url, ...args);
  };
  XMLHttpRequest.prototype.send = function (body) {
    const meta = xhrMeta.get(this);
    if (meta) meta.generation = state.generation;
    if (meta?.kind === 'get_apps' && active() && String(meta.method).toUpperCase() === 'POST') {
      try { body = rewriteBody(body); } catch { /* Preserve unsupported requests. */ }
    }
    return xhrSend.call(this, body);
  };

  if (window.fetch) {
    const originalFetch = window.fetch;
    window.fetch = async function (input, init) {
      const url = input instanceof Request ? input.url : String(input);
      const kind = endpoint(url, location.origin);
      clearInstalledMode(kind);
      if (kind === 'get_installed_apps') return originalFetch.call(this, input, init);
      if (!kind) return originalFetch.call(this, input, init);
      const generation = state.generation;
      let fetchInput = input;
      let fetchInit = init;
      const method = init?.method || (input instanceof Request ? input.method : 'GET');
      if (kind === 'get_apps' && active() && method.toUpperCase() === 'POST') {
        try {
          const request = new Request(input instanceof Request ? input.clone() : new URL(url, location.origin), init);
          const type = request.headers.get('content-type') || '';
          const body = type.includes('multipart/form-data') ? await request.clone().formData() : await request.clone().text();
          const headers = new Headers(request.headers);
          if (body instanceof FormData) headers.delete('content-type');
          fetchInput = new Request(request, { body: rewriteBody(body), headers });
          fetchInit = undefined;
        } catch { /* Preserve unsupported requests. */ }
      }
      const result = await originalFetch.call(this, fetchInput, fetchInit);
      if (!result.ok) return result;
      try {
        const payload = await result.clone().json();
        const filtered = consume(kind, payload, generation);
        if (filtered === payload) return result;
        const headers = new Headers(result.headers);
        headers.delete('content-length');
        headers.delete('content-encoding');
        const replacement = new Response(JSON.stringify(filtered), { status: result.status, statusText: result.statusText, headers });
        for (const key of ['url', 'redirected', 'type']) Object.defineProperty(replacement, key, { value: result[key] });
        return replacement;
      } catch { return result; }
    };
  }

  function exactElements(root, labels) {
    return [...root.querySelectorAll('button,a,li,div,span')].filter(element =>
      labels.includes(element.textContent.trim()) && ![...element.children].some(child => labels.includes(child.textContent.trim())));
  }

  function findCategoryRow() {
    for (const all of exactElements(document, ['全部', 'All'])) {
      if (all.closest('#bah-external-categories, #bah-category-manager')) continue;
      let parent = all.parentElement;
      for (let depth = 0; parent && depth < 4; depth++, parent = parent.parentElement) {
        if (parent.textContent.length > 700) break;
        if (exactElements(parent, ['已安装', 'Installed']).length) return parent;
      }
    }
    return null;
  }

  function ensureMount() {
    if (!dockerView()) return unmount();
    if (state.root?.isConnected && state.row?.isConnected) return;
    if (state.root) unmount(true);
    const row = findCategoryRow();
    if (!row) return;
    state.row = row;
    let anchor = row.closest('.n-form-item, .el-form-item') || row;
    if (anchor === row) {
      for (let i = 0; i < 3 && anchor.parentElement; i++) {
        const parent = anchor.parentElement;
        if (getComputedStyle(parent).display !== 'flex' || parent.querySelector('input') || parent.textContent.length > 700) break;
        anchor = parent;
      }
    }
    const root = node('section', undefined, { id: 'bah-external-categories', 'aria-label': '外部应用分类' });
    anchor.after(root);
    state.root = root;
    renderBar();
    if (state.selection) scheduleReload();
  }

  function unmount(preserveSelection = false) {
    state.root?.remove();
    document.getElementById('bah-category-manager')?.remove();
    state.root = null;
    state.row = null;
    if (!preserveSelection) {
      if (state.selection) state.generation++;
      state.selection = null;
    }
  }

  function renderBar() {
    if (!state.root?.isConnected) return;
    const choices = node('div', undefined, { class: 'bah-choices' });
    choices.append(node('span', '外部应用分类', { class: 'bah-label' }));
    for (const [value, label] of [['all', '全部外部应用'], ...state.tags.map(tag => [`official:${tag.type}`, tag.desc]), ...state.groups.map(group => [`custom:${group.id}`, group.name])]) {
      choices.append(button(label, () => select(value), { 'data-selection': value, 'aria-pressed': String(state.selection === value) }));
    }
    choices.append(button('管理分类', openManager, { class: 'bah-manage' }));
    choices.append(button('恢复原生筛选', () => select(null), { class: 'bah-reset' }));
    const text = active() ? `当前仅显示外部导入应用，匹配 ${appList(filterPayload(state.apps, state.selection, state.groups)).length} 个。` : '点击分类，仅筛选外部导入应用；点击上方原生分类可恢复原生筛选。';
    state.root.replaceChildren(choices, node('div', storageProblem || text, { class: 'bah-status', role: 'status' }));
  }

  let reloadScheduled = false;
  function scheduleReload() {
    if (reloadScheduled) return;
    reloadScheduled = true;
    setTimeout(() => { reloadScheduled = false; reloadNative(); }, 0);
  }

  function select(value) {
    // Check compatibility before changing the native tab or any request parameters.
    if (value && !nativeSearch()) {
      state.root.querySelector('[role="status"]').textContent = '未识别到宝塔搜索按钮，未启用新的外部筛选。请反馈面板版本和页面截图。';
      return;
    }
    state.selection = value;
    state.generation++;
    renderBar();
    if (value) {
      state.internalClick = true;
      try {
        const all = exactElements(state.row, ['全部', 'All'])[0];
        (all?.closest('button,[role="button"],li') || all)?.click();
      } finally { state.internalClick = false; }
    }
    scheduleReload();
  }

  function nativeSearch() {
    if (!state.row?.isConnected) return null;
    const scope = state.row.closest('form') || state.row.parentElement?.parentElement || document;
    const search = exactElements(scope, ['搜索', 'Search'])[0];
    return search?.closest('button,[role="button"]') || search;
  }

  function reloadNative() {
    if (!state.row?.isConnected) return;
    // Search always reloads the list, even when the original 'All' tab was already selected.
    const target = nativeSearch();
    if (target) target.click();
    else {
      state.selection = null;
      state.generation++;
      renderBar();
      state.root.querySelector('[role="status"]').textContent = '未识别到宝塔搜索按钮，请点击上方原生分类恢复列表，并反馈面板版本和页面截图。';
    }
  }

  document.addEventListener('click', event => {
    if (state.internalClick || !state.selection) return;
    const target = event.target.closest('button,[role="menuitem"],li,a') || event.target;
    const label = target.textContent.trim();
    const labels = ['全部', 'All', '已安装', 'Installed', '外部应用', 'External apps', ...DEFAULT_TAGS.map(tag => tag.desc), ...state.tags.map(tag => tag.desc)];
    const nativeChoice = labels.includes(label) && (state.row?.contains(target) || target.closest('[role="menuitem"],.n-dropdown-menu'));
    if (nativeChoice) {
      state.selection = null;
      state.generation++;
      renderBar();
      scheduleReload();
    }
  }, true);

  function openManager() {
    document.getElementById('bah-category-manager')?.remove();
    const dialog = node('dialog', undefined, { id: 'bah-category-manager', 'aria-label': '管理外部应用分类' });
    let draft = validateGroups(state.groups);
    let selectedId = draft[0]?.id || null;
    let membership = new Set();
    const heading = node('h3', '管理外部应用分类');
    const hint = node('p', '自定义分类可多选应用；官方分类始终保留。配置保存到当前浏览器的当前面板地址。');
    const groupList = node('select', undefined, { 'aria-label': '选择自定义分类' });
    const name = node('input', undefined, { 'aria-label': '分类名称', maxlength: '40', placeholder: '分类名称' });
    const search = node('input', undefined, { 'aria-label': '搜索外部应用', placeholder: '搜索应用名称或标识' });
    const apps = node('div', undefined, { class: 'bah-app-picker' });
    const error = node('p', '', { role: 'alert' });
    const catalog = () => [...new Map(state.apps.map(app => [app.appname, app])).values()];
    function renderApps() {
      const query = search.value.trim().toLocaleLowerCase();
      const known = catalog();
      const combined = [...known, ...[...membership].filter(id => !known.some(app => app.appname === id)).map(id => ({ appname: id, apptitle: `${id}（当前列表未加载，保留分配）` }))];
      apps.replaceChildren();
      for (const app of combined.filter(app => `${app.apptitle} ${app.appname}`.toLocaleLowerCase().includes(query))) {
        const label = node('label');
        const checkbox = node('input', undefined, { type: 'checkbox', value: app.appname });
        checkbox.checked = membership.has(app.appname);
        checkbox.addEventListener('change', () => checkbox.checked ? membership.add(app.appname) : membership.delete(app.appname));
        label.append(checkbox, document.createTextNode(`${app.apptitle || app.appname} · ${app.appname}`));
        apps.append(label);
      }
      if (!combined.length) apps.append(node('p', '请先点击“全部外部应用”加载应用，然后打开管理分类。'));
    }
    function stash() {
      const current = draft.find(group => group.id === selectedId);
      if (current) { current.name = name.value; current.apps = [...membership]; }
    }
    function load() {
      groupList.replaceChildren(...draft.map(group => node('option', group.name || '未命名分类', { value: group.id })));
      groupList.value = selectedId || '';
      const current = draft.find(group => group.id === selectedId);
      name.value = current?.name || '';
      name.disabled = !current;
      membership = new Set(current?.apps || []);
      renderApps();
    }
    groupList.addEventListener('change', () => { stash(); selectedId = groupList.value; load(); });
    search.addEventListener('input', renderApps);
    const controls = node('div', undefined, { class: 'bah-controls' });
    controls.append(
      button('新增分类', () => { stash(); selectedId = `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`; draft.push({ id: selectedId, name: '新分类', apps: [] }); load(); }),
      button('删除分类', () => { draft = draft.filter(group => group.id !== selectedId); selectedId = draft[0]?.id || null; load(); }),
      button('保存分类', () => {
        try {
          stash();
          const groups = validateGroups(draft);
          localStorage.setItem(KEY, JSON.stringify(groups));
          state.groups = groups;
          storageProblem = '';
          if (state.selection?.startsWith('custom:') && !groups.some(group => `custom:${group.id}` === state.selection)) state.selection = 'all';
          state.generation++;
          dialog.close();
          dialog.remove();
          renderBar();
          if (active()) scheduleReload();
        } catch (problem) { error.textContent = `保存失败：${problem.message}`; }
      }),
      button('取消', () => { dialog.close(); dialog.remove(); }),
    );
    dialog.addEventListener('cancel', () => dialog.remove());
    dialog.append(heading, hint, groupList, name, search, apps, error, controls);
    document.body.append(dialog);
    load();
    dialog.showModal();
  }

  function start() {
    if (!document.body) return;
    const style = node('style', `
      #bah-external-categories { width:100%; margin:10px 0 16px; font-size:13px; color:inherit; }
      #bah-external-categories .bah-choices { display:flex; flex-wrap:nowrap; align-items:center; gap:8px; overflow-x:auto; padding-bottom:4px; }
      #bah-external-categories .bah-label { margin-right:8px; white-space:nowrap; }
      #bah-external-categories button, #bah-category-manager button { flex-shrink:0; white-space:nowrap; padding:7px 12px; border:1px solid #dcdfe6; border-radius:3px; background:#f0f2f5; color:#333; cursor:pointer; font:inherit; }
      #bah-external-categories button[aria-pressed=true] { background:#20a53a; border-color:#20a53a; color:#fff; }
      #bah-external-categories .bah-manage, #bah-external-categories .bah-reset { background:transparent; color:#159632; }
      #bah-external-categories .bah-status { margin-top:8px; color:#888; font-size:12px; }
      #bah-category-manager { width:min(680px,90vw); max-height:85vh; box-sizing:border-box; border:1px solid #ddd; border-radius:8px; padding:24px; background:#fff; color:#333; font-size:14px; }
      #bah-category-manager::backdrop { background:rgba(0,0,0,.35); }
      #bah-category-manager > input, #bah-category-manager > select { box-sizing:border-box; width:100%; padding:8px; margin:6px 0; border:1px solid #ddd; border-radius:3px; }
      #bah-category-manager .bah-app-picker { max-height:34vh; overflow:auto; margin:12px 0; }
      #bah-category-manager label { display:flex; align-items:center; gap:8px; padding:6px; overflow-wrap:anywhere; }
      #bah-category-manager .bah-controls { display:flex; flex-wrap:wrap; gap:8px; }
      #bah-category-manager [role=alert] { color:#b42318; }
      @media (prefers-color-scheme:dark) { #bah-category-manager { background:#252525; color:#ddd; } }
    `);
    document.head.append(style);
    let pending = false;
    new MutationObserver(records => {
      if (records.every(record => record.target.closest?.('#bah-external-categories, #bah-category-manager'))) return;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => { pending = false; ensureMount(); });
    }).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('popstate', ensureMount);
    window.addEventListener('hashchange', ensureMount);
    ensureMount();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
