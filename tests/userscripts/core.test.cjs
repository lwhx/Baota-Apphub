const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../../userscripts/baota-external-categories.user.js');
const external = (name, type = 'Tools') => ({ appid: -1, appname: name, apptitle: name, apptype: type });
const apps = [external('note'), external('gateway', 'AI'), { ...external('official', 'AI'), appid: 1 }];

test('identifies external apps by id, including string IDs, rather than matching titles', () => {
  assert.equal(core.isExternal(apps[0]), true);
  assert.equal(core.isExternal({ ...apps[0], appid: '-1' }), true);
  assert.equal(core.isExternal({ ...apps[2], apptitle: 'kejilion - fake' }), false);
  assert.equal(core.isExternal(null), false);
});

test('native mode returns the original payload intact', () => {
  const payload = { status: true, message: { data: apps, page: '<pager/>', maximum_cpu: 8 } };
  assert.equal(core.filterPayload(payload, null, []), payload);
});

test('filters external apps by official type without changing installation metadata', () => {
  const payload = { status: true, message: { data: apps, page: '<pager/>', total: 3, maximum_cpu: 8 } };
  const result = core.filterPayload(payload, 'official:AI', []);
  assert.deepEqual(result.message.data, [apps[1]]);
  assert.equal(result.message.data[0], apps[1]);
  assert.equal(result.message.maximum_cpu, 8);
  assert.equal(result.message.total, 1);
  assert.equal(result.message.page, '');
  assert.equal(payload.message.data.length, 3);
});

test('custom membership uses exact appname and only external entries', () => {
  const groups = [{ id: 'mine', name: '我的分类', apps: ['note', 'official'] }];
  const payload = { data: apps };
  assert.deepEqual(core.filterPayload(payload, 'custom:mine', groups).data, [apps[0]]);
  assert.deepEqual(core.filterPayload(apps, 'all', groups), apps.slice(0, 2));
  assert.deepEqual(core.filterPayload(payload, 'custom:missing', groups).data, []);
});

test('supports common response envelopes and leaves failed responses intact', () => {
  for (const payload of [{ data: apps }, { data: { data: apps } }, { message: apps }, apps]) {
    assert.deepEqual(core.appList(core.filterPayload(payload, 'all', [])), apps.slice(0, 2));
  }
  const error = { status: false, msg: '登录失效' };
  assert.equal(core.filterPayload(error, 'all', []), error);
});

test('rewrites full-list requests while retaining search and auth parameters', () => {
  const body = 'app_type=Tools&p=2&row=12&query=chat&request_token=test';
  const result = new URLSearchParams(core.rewriteBody(body));
  assert.equal(result.get('app_type'), 'AppHub');
  assert.equal(result.get('p'), '1');
  assert.equal(result.get('row'), '20000');
  assert.equal(result.get('query'), 'chat');
  assert.equal(result.get('request_token'), 'test');
  assert.deepEqual(JSON.parse(core.rewriteBody('{"query":"笔记","p":2}')), { query: '笔记', p: 1, row: 20000, app_type: 'AppHub' });
});

test('validates saved custom groups, rejects duplicate IDs and unsafe structure', () => {
  assert.deepEqual(core.validateGroups([{ id: 'mine', name: '<img onerror=x>', apps: ['note', 'note'] }]),
    [{ id: 'mine', name: '<img onerror=x>', apps: ['note'] }]);
  for (const invalid of [null, {}, [{ id: 'x', name: '', apps: [] }], [{ id: 'x', name: 'a', apps: [] }, { id: 'x', name: 'b', apps: [] }]]) {
    assert.throws(() => core.validateGroups(invalid));
  }
});

test('accepts only same-origin application list/tag API URLs', () => {
  const origin = 'https://panel.example:8888';
  assert.equal(core.endpoint('/mod/docker/com/get_apps/stype', origin), 'get_apps');
  assert.equal(core.endpoint('/mod/docker/com/get_tags', origin), 'get_tags');
  assert.equal(core.endpoint('https://evil.example/mod/docker/com/get_apps', origin), null);
  assert.equal(core.endpoint('/mod/docker/com/create_app/stype', origin), null);
  assert.equal(core.endpoint('/random/get_apps', origin), null);
});

test('saved category order retains known IDs and appends new categories without losing any', () => {
  assert.deepEqual(core.orderCategories(['official:AI','custom:notes','official:Tools'],['custom:notes','official:old','custom:notes']),
    ['custom:notes','official:AI','official:Tools']);
});
test('category moves support before and after targets without mutating or dropping IDs', () => {
  const order=['official:AI','custom:notes','custom:kejilion'];
  assert.deepEqual(core.moveCategory(order,'custom:kejilion','official:AI'),['custom:kejilion','official:AI','custom:notes']);
  assert.deepEqual(core.moveCategory(order,'official:AI','custom:kejilion',true),['custom:notes','custom:kejilion','official:AI']);
  assert.deepEqual(core.moveCategory(order,'missing','official:AI'),order);
  assert.deepEqual(core.moveCategory(order,'official:AI','official:AI'),order);
  assert.deepEqual(order,['official:AI','custom:notes','custom:kejilion']);
});
test('saved category order validates IDs and keeps the fixed all-external action out of sorting', () => {
  assert.deepEqual(core.validateOrder(['custom:notes','official:AI','custom:notes']),['custom:notes','official:AI']);
  for (const invalid of [null,{},['all'],['custom:'],[3],Array(401).fill('official:AI')]) assert.throws(() => core.validateOrder(invalid));
});
