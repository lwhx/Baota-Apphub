const {test,before,after} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('playwright');
const script = path.resolve(__dirname,'../../userscripts/baota-external-categories.user.js');
const fixture = fs.readFileSync(path.join(__dirname,'panel-fixture.html'),'utf8');
const apps = [
  {appid:1,appname:'official-ai',apptitle:'官方 AI',apptype:'AI',field:[{attr:'password',default:''}]},
  {appid:-1,appname:'kejilion-sub2api',apptitle:'kejilion - Sub2API',apptype:'AI',field:[{attr:'web_port',default:45616}],env:[{key:'web_port'}],depend:null},
  {appid:'-1',appname:'siyuan',apptitle:'思源笔记',apptype:'Tools',field:[{attr:'token',default:''}]},
  {appid:-1,appname:'kejilion-bomb-party',apptitle:'kejilion - Bomb Party',apptype:'Media',field:[]},
  {appid:-1,appname:'mail',apptitle:'外部邮箱',apptype:'Email',field:[]},
];
const tags = [
  {type:'Tools',desc:'实用工具',sort:5},{type:'AI',desc:'AI/大模型',sort:4},
  {type:'Email',desc:'邮件服务',sort:11},{type:'FutureType',desc:'官方新分类',sort:12},
];
let browser;
before(async () => {browser = await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {})})});
after(async () => {await browser?.close()});
async function panel(t,transport='xhr',options={}) {
  const context = await browser.newContext(); t.after(() => context.close());
  await context.addInitScript({path:script}); const page = await context.newPage(); page.setDefaultTimeout(5000);
  const requests=[],pageErrors=[]; page.on('pageerror',e => pageErrors.push(e.message));
  t.after(() => assert.deepEqual(pageErrors,[],'No page errors'));
  const origin = options.origin || 'https://panel.test';
  let html = fixture;
  if (options.searchLayout) {
    const slot = options.searchLayout === 'icon-prefix' ? 'prefix' : 'suffix';
    const input = '<div class="n-input__input"><input id="query" placeholder="支持应用名称、字段模糊搜索"></div>';
    const icon = '<div class="n-input__'+slot+'"><div id="native-search" class="flex items-center cursor-pointer"><svg aria-hidden="true"><path d="M1 1L8 8"></path></svg></div></div>';
    const search = options.searchLayout.includes('enter') ? input+'<span id="native-search" hidden></span>' : slot === 'prefix' ? icon+input : input+icon;
    const searchClass = options.searchLayout === 'placeholder-enter' ? 'n-input' : 'n-input bt-search';
    html = html.replace('<input id="query" placeholder="搜索应用"><button id="native-search" type="button">搜索</button>', '<div class="n-form-item"><div class="'+searchClass+'">'+search+'</div></div>');
    html = html.replace("document.querySelector('#native-search').onclick = loadNative;", "document.querySelector('#native-search').onclick = loadNative; document.querySelector('#query').onkeyup = event => {if (event.key === 'Enter') loadNative()};");
  }
  await page.route(`${origin}/**`,async route => {
    const request = route.request();
    if (!request.url().includes('/mod/docker/com/')) return route.fulfill({contentType:'text/html',body:html});
    const method = request.url().split('/com/')[1].split('/')[0];
    const params = new URLSearchParams(request.postData()); requests.push({method,params,headers:request.headers()});
    if (options.respond && await options.respond(route,method,params)) return;
    if (method === 'get_tags') return route.fulfill({json:{status:0,message:tags}});
    if (method === 'create_app') return route.fulfill({json:{status:true}});
    const data = method === 'get_installed_apps' ? [apps[0]] : apps.filter(app =>
      (params.get('app_type') === 'AppHub' ? Number(app.appid) === -1 : params.get('app_type') === 'all' || app.apptype === params.get('app_type')) &&
      `${app.appname} ${app.apptitle}`.toLowerCase().includes((params.get('query') || '').toLowerCase()));
    await route.fulfill({json:options.envelope === 'data' ? {status:true,data} : {status:true,message:{data,page:'<pager/>',maximum_cpu:8,maximum_memory:8192}}});
  });
  await page.goto(`${origin}${options.path || '/new/docker/app'}?transport=${transport}`);
  await page.waitForFunction(() => window.nativeRendered >= 1);
  if (options.toolbar !== false) await page.locator('#bah-external-categories').waitFor(); return {page,requests};
}
async function names(page,expected) {
  try {
    await page.waitForFunction(expected => JSON.stringify([...document.querySelectorAll('[data-app]')].map(node => node.dataset.app)) === JSON.stringify(expected),expected);
  } catch(error) {
    throw new Error(`${error.message} Actual apps: ${JSON.stringify(await page.locator('[data-app]').evaluateAll(nodes => nodes.map(n => n.dataset.app)))}`,{cause:error});
  }
}
const choice = (page,selection) => page.locator(`[data-selection="${selection}"]`);
for (const layout of ['icon-suffix','icon-prefix','enter-only','placeholder-enter']) test(`${layout}: categories refresh through native icon search without a text button`,async t => {
  const {page,requests} = await panel(t,'xhr',{searchLayout:layout});
  assert.equal(await page.locator('#native-search').textContent(),'');
  await choice(page,'official:AI').click(); await names(page,['kejilion-sub2api']);
  assert.equal(requests.findLast(r => r.method === 'get_apps').params.get('app_type'),'AppHub');
  await choice(page,'custom:notes').click(); await names(page,['siyuan']);
  await page.locator('#query').fill('笔记');
  await page.locator('#query').press('Enter'); await names(page,['siyuan']);
  await page.getByRole('button',{name:'恢复原生筛选',exact:true}).click();
  await page.locator('#query').fill(''); await page.locator('#query').press('Enter');
  await names(page,apps.map(a => a.appname));
  await choice(page,'all').click(); await names(page,apps.slice(1).map(a => a.appname));
  await page.locator('[data-native="all"]').click(); await names(page,apps.map(a => a.appname));
});
test('a custom category named 搜索 does not replace the native icon search control',async t => {
  const {page,requests} = await panel(t,'fetch',{searchLayout:'icon-suffix'});
  await page.getByRole('button',{name:'管理分类',exact:true}).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('textbox',{name:'分类名称',exact:true}).fill('搜索');
  await dialog.getByRole('button',{name:'保存分类'}).click();
  await choice(page,'official:AI').click(); await names(page,['kejilion-sub2api']);
  assert.equal(await choice(page,'official:AI').getAttribute('aria-pressed'),'true');
  assert.ok(requests.length < 10,'Native refresh must not click the custom category recursively');
});
for (const transport of ['xhr','xhr-json','fetch']) test(`${transport}: filters external before rendering and retains native install data`,async t => {
  const {page,requests} = await panel(t,transport);
  try { await names(page,apps.map(app => app.appname)); } catch(error) {
    throw new Error(`${error.message} Requests: ${JSON.stringify(requests.map(r => ({method:r.method,body:r.params.toString()})))}`,{cause:error});
  }
  assert.equal(await page.locator('[data-native]').count(),5);
  assert.equal(await choice(page,'official:FutureType').textContent(),'官方新分类');
  await choice(page,'official:AI').click(); await names(page,['kejilion-sub2api']);
  const request = requests.findLast(r => r.method === 'get_apps');
  assert.equal(request.params.get('app_type'),'AppHub'); assert.equal(request.params.get('row'),'20000');
  assert.equal(request.headers['x-csrf-token'],'fixture-auth');
  await page.locator('[data-app] button').click(); await page.waitForFunction(() => window.installApp !== null);
  assert.deepEqual(await page.evaluate(() => window.installApp),apps[1]);
  await page.waitForFunction(() => document.querySelector('#native-install').textContent !== '');
  assert.equal(requests.findLast(r => r.method === 'create_app').params.has('app_type'),false);
  await choice(page,'custom:notes').click(); await names(page,['siyuan']);
  await choice(page,'custom:games').click(); await names(page,['kejilion-bomb-party']);
  await page.locator('[data-native="all"]').click(); await names(page,apps.map(app => app.appname));
  assert.equal(await page.locator('#bah-external-categories [aria-pressed="true"]').count(),0);
});
test('search, reset, installed and portal categories continue to work',async t => {
  const {page} = await panel(t); await choice(page,'all').click(); await names(page,apps.slice(1).map(app => app.appname));
  await page.locator('#query').fill('笔记'); await page.locator('#native-search').click(); await names(page,['siyuan']);
  await page.getByRole('button',{name:'恢复原生筛选',exact:true}).click();
  await page.locator('#query').fill(''); await page.locator('#native-search').click(); await names(page,apps.map(app => app.appname));
  await choice(page,'all').click(); await page.locator('[data-native="installed"]').click(); await names(page,['official-ai']);
  await choice(page,'all').click(); await names(page,apps.slice(1).map(app => app.appname));
  await page.locator('#native-more').click(); await page.getByRole('menuitem',{name:'邮件服务'}).click(); await names(page,['mail']);
  assert.equal(await page.locator('#bah-external-categories [aria-pressed="true"]').count(),0);
});
test('custom group assignment persists safely, including literal HTML names and deletion',async t => {
  const {page} = await panel(t,'fetch'); await choice(page,'all').click(); await names(page,apps.slice(1).map(app => app.appname));
  await page.getByRole('button',{name:'管理分类',exact:true}).click(); const dialog = page.getByRole('dialog');
  await dialog.getByRole('button',{name:'新增分类'}).click();
  await dialog.getByRole('textbox',{name:'分类名称',exact:true}).fill('<img src=x onerror=alert(1)>');
  await dialog.locator('input[value="siyuan"]').check(); await dialog.getByRole('button',{name:'保存分类'}).click();
  await page.locator('#bah-external-categories').getByRole('button',{name:'<img src=x onerror=alert(1)>',exact:true}).click(); await names(page,['siyuan']);
  assert.equal(await page.locator('#bah-external-categories img').count(),0);
  await page.reload(); await page.waitForFunction(() => window.nativeRendered >= 1);
  await page.locator('#bah-external-categories').getByRole('button',{name:'<img src=x onerror=alert(1)>',exact:true}).click(); await names(page,['siyuan']);
  await page.getByRole('button',{name:'管理分类',exact:true}).click();
  const id = await page.evaluate(() => JSON.parse(localStorage.getItem('baota-apphub:external-categories:v1')).find(g => g.name.startsWith('<img')).id);
  await dialog.getByRole('combobox',{name:'选择自定义分类'}).selectOption(id);
  await dialog.getByRole('button',{name:'删除分类'}).click(); await dialog.getByRole('button',{name:'保存分类'}).click();
  assert.equal(await choice(page,`custom:${id}`).count(),0); await names(page,apps.slice(1).map(app => app.appname));
});
test('rerender/duplicate injection leave one toolbar, SPA navigation cleans up',async t => {
  const {page} = await panel(t); await page.addScriptTag({path:script});
  await choice(page,'all').click(); await names(page,apps.slice(1).map(a => a.appname));
  await page.evaluate(() => {document.querySelector('#bah-external-categories').dataset.beforeRerender='1';const item=document.querySelector('.n-form-item');item.replaceWith(item.cloneNode(true))});
  await page.waitForFunction(() => document.querySelector('#bah-external-categories') && !document.querySelector('#bah-external-categories').dataset.beforeRerender);
  assert.equal(await page.locator('#bah-external-categories').count(),1);
  assert.equal(await choice(page,'all').getAttribute('aria-pressed'),'true');
  await names(page,apps.slice(1).map(a => a.appname));
  await page.evaluate(() => {history.pushState({},'','/new/site');document.querySelector('main').replaceChildren()});
  await page.waitForFunction(() => !document.querySelector('#bah-external-categories'));
});
test('HTTP panels can create and persist custom categories',async t => {
  const {page} = await panel(t,'xhr',{origin:'http://panel.test'});
  assert.equal(await page.evaluate(() => isSecureContext),false);
  await page.getByRole('button',{name:'管理分类',exact:true}).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button',{name:'新增分类'}).click();
  await dialog.getByRole('textbox',{name:'分类名称',exact:true}).fill('HTTP 分类');
  await dialog.getByRole('button',{name:'保存分类'}).click();
  assert.equal(await page.locator('#bah-external-categories').getByRole('button',{name:'HTTP 分类',exact:true}).count(),1);
});
test('opening a session SPA at home then navigating to Docker initializes the toolbar',async t => {
  const {page} = await panel(t,'xhr',{path:'/apsess_example/home',toolbar:false});
  assert.equal(await page.locator('#bah-external-categories').count(),0);
  await page.evaluate(() => {history.pushState({},'','/apsess_example/docker/app');document.body.append(document.createElement('div'));window.dispatchEvent(new PopStateEvent('popstate'))});
  await page.locator('#bah-external-categories').waitFor();
  await choice(page,'official:AI').click(); await names(page,['kejilion-sub2api']);
});
test('corrupt storage falls back visibly and API errors remain readable',async t => {
  const {page} = await panel(t,'xhr',{respond:async (route,method,params) => {
    if (method === 'get_apps' && params.get('query') === 'error') {await route.fulfill({json:{status:false,msg:'登录失效，请重新登录'}});return true}
  }});
  await page.evaluate(() => localStorage.setItem('baota-apphub:external-categories:v1','{broken'));
  await page.reload(); await page.waitForFunction(() => window.nativeRendered >= 1);
  assert.match(await page.locator('#bah-external-categories [role="status"]').textContent(),/无法读取/);
  await choice(page,'all').click(); await page.locator('#query').fill('error'); await page.locator('#native-search').click();
  await page.waitForFunction(() => document.querySelector('#native-list').textContent.includes('登录失效'));
});
test('legacy data envelope retains external filtering',async t => {
  const {page} = await panel(t,'xhr',{envelope:'data'}); await choice(page,'official:AI').click(); await names(page,['kejilion-sub2api']);
});
test('toolbar is a single scrollable row and does not overflow the page',async t => {
  const {page} = await panel(t); await page.setViewportSize({width:1000,height:720});
  const layout = await page.locator('#bah-external-categories .bah-choices').evaluate(row => ({
    tops:[...row.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().top)),
    width:row.clientWidth,scroll:row.scrollWidth,document:document.documentElement.scrollWidth,viewport:innerWidth
  }));
  assert.equal(new Set(layout.tops).size,1);
  assert.ok(layout.scroll > layout.width);
  assert.ok(layout.document <= layout.viewport);
});
test('viewing installed apps from a native card clears external mode',async t => {
  const {page} = await panel(t); await choice(page,'all').click(); await names(page,apps.slice(1).map(a => a.appname));
  await page.evaluate(() => {window.nativeSelection='installed';return window.loadNative()});
  await names(page,['official-ai']);
  assert.equal(await page.locator('#bah-external-categories [aria-pressed="true"]').count(),0);
});
test('opening more preserves the active filter until an actual native menu category is chosen',async t => {
  const {page} = await panel(t); await choice(page,'all').click(); await names(page,apps.slice(1).map(a => a.appname));
  await page.locator('#native-more').click();
  assert.equal(await choice(page,'all').getAttribute('aria-pressed'),'true');
  await page.getByRole('menuitem',{name:'邮件服务'}).click(); await names(page,['mail']);
  assert.equal(await page.locator('#bah-external-categories [aria-pressed="true"]').count(),0);
});
test('unsupported search layout reports the reason and restores native results',async t => {
  const {page} = await panel(t);
  await page.locator('#native-search').evaluate(button => button.textContent = '未知控件');
  await choice(page,'official:AI').click();
  await page.waitForFunction(() => document.querySelector('#bah-external-categories [role="status"]').textContent.includes('未识别'));
  await names(page,apps.map(a => a.appname));
});
test('unsupported controls never change an existing native category',async t => {
  const {page,requests} = await panel(t);
  await page.locator('[data-native="Tools"]').click(); await names(page,['siyuan']);
  await page.locator('#native-search').evaluate(button => button.textContent='未知控件');
  const count = requests.length;
  await choice(page,'official:AI').click();
  await page.waitForFunction(() => document.querySelector('#bah-external-categories [role="status"]').textContent.includes('未识别'));
  assert.equal(requests.length,count);
  assert.equal(await page.evaluate(() => window.nativeSelection),'Tools');
  await names(page,['siyuan']);
});
for (const transport of ['xhr','fetch']) test(`${transport}: late external responses restore the latest native selection`,async t => {
  let finish;
  const finished = new Promise(resolve => {finish=resolve});
  const {page,requests} = await panel(t,transport,{respond:async (route,method,params) => {
    if (method !== 'get_apps' || params.get('query') !== 'slow') return false;
    await new Promise(resolve => setTimeout(resolve,150));
    await route.fulfill({json:{status:true,message:{data:apps.slice(1)}}});
    finish(); return true;
  }});
  await choice(page,'all').click(); await names(page,apps.slice(1).map(a => a.appname));
  const rendered = await page.evaluate(() => window.nativeRendered);
  await page.locator('#query').fill('slow');
  const pending = page.waitForRequest(request => request.url().includes('get_apps') && (request.postData() || '').includes('query=slow'));
  await page.locator('#native-search').click(); await pending;
  await page.locator('[data-native="all"]').click(); await page.locator('#query').fill('');
  await finished;
  await page.waitForFunction(count => window.nativeRendered >= count+3,rendered);
  await names(page,apps.map(a => a.appname));
  assert.ok(requests.length < 20,'Stale response handling must not cause a request loop');
});
