import assert from 'node:assert/strict';
import test from 'node:test';
import { gunzipSync, gzipSync } from 'node:zlib';
import { createEngineAdapter } from '../src/adapter/engineBridge.js';

test('continues a committed gzip world and advances week zero through the engine', async () => {
  const files = new Map();
  const flags = new Map();
  let fail = false;
  let noProgress = false;
  const mustRead = (path) => {
    if (!files.has(path)) throw new Error('Missing ' + path);
    return files.get(path);
  };
  const fs = {
    async stat({ path }) { return { size: mustRead(path).length }; },
    async writeFile({ path, data }) { files.set(path, Buffer.from(data, 'base64')); },
    async appendFile({ path, data }) { files.set(path, Buffer.concat([mustRead(path), Buffer.from(data, 'base64')])); },
    async readFile({ path, offset = 0, length }) {
      return { data: mustRead(path).subarray(offset, length == null ? undefined : offset + length).toString('base64') };
    },
    async rename({ from, to }) {
      if (fail && from.endsWith('.tmp')) throw new Error('Could not commit');
      files.set(to, mustRead(from));
      files.delete(from);
    },
    async deleteFile({ path }) { files.delete(path); },
  };
  globalThis.localStorage = {
    getItem: (key) => flags.get(key) ?? null,
    setItem: (key, value) => flags.set(key, value),
    removeItem: (key) => flags.delete(key),
  };
  globalThis.FileReader = class {
    async readAsDataURL(blob) {
      this.result = 'data:application/octet-stream;base64,' + Buffer.from(await blob.arrayBuffer()).toString('base64');
      this.onload();
    }
  };
  globalThis.window = {
    Capacitor: { Plugins: { Filesystem: new Proxy(fs, {
      get(plugin, key) {
        if (key === 'then') throw new Error('Capacitor proxy must not be treated as a promise');
        return plugin[key];
      },
    }) } },
    CallUpEngine: {
      *eA() { return { week: 0, agency: { name: 'QA', money: 100 }, clubs: [], players: {}, inbox: [] }; },
      *eK(game) {
        game.agency.money--;
        yield;
        if (!noProgress) game.week++;
      },
      bC(_game, id) { throw new Error('Unexpected agenda: ' + id); },
      async cy(game, cancelled) {
        assert.equal(cancelled(), false);
        return new Blob([gzipSync(JSON.stringify(game))]);
      },
      async cA(blob) { return JSON.parse(gunzipSync(Buffer.from(await blob.arrayBuffer()))); },
      offlineParseSave: JSON.parse,
    },
  };

  const writer = createEngineAdapter();
  flags.set('callup-has-save-v1', '1');
  assert.equal(await writer.probeHasSave(), false, 'stale flags cannot advertise a save');
  assert.equal((await writer.newGame()).saved, true);
  assert.ok(files.has('saves/slot0.bin'));

  const reader = createEngineAdapter();
  assert.equal(await reader.probeHasSave(), true);
  assert.equal((await reader.loadSave()).week, 0);
  assert.equal((await reader.advanceWeek()).week, 1);
  assert.equal(reader.getSnapshot().funds, 99 * 1500);

  noProgress = true;
  await assert.rejects(() => reader.advanceWeek(), /진행/);
  assert.equal(reader.getSnapshot().week, 1);
  assert.equal(reader.getSnapshot().funds, 99 * 1500);
  noProgress = false;

  fail = true;
  assert.equal((await reader.advanceWeek()).saved, false);
  assert.equal(reader.getSnapshot().week, 2, 'world remains available in memory');
  assert.equal((await createEngineAdapter().loadSave()).week, 1, 'failed writes preserve the last committed state');
  fail = false;
  assert.equal((await reader.saveGame()).saved, true);
  assert.equal((await createEngineAdapter().loadSave()).week, 2);

  files.set('saves/slot1.fasave', mustRead('saves/slot0.bin'));
  for (const key of [...files.keys()]) if (key.startsWith('saves/slot0.')) files.delete(key);
  assert.equal(await createEngineAdapter().probeHasSave(), true);
  assert.equal((await createEngineAdapter().loadSave()).week, 2, 'legacy slot files remain readable');

  window.Capacitor.getPlatform = () => 'web';
  fs.stat = async ({ path }) => ({ size: mustRead(path).size ?? mustRead(path).length });
  fs.writeFile = async ({ path, data }) => files.set(path, data);
  fs.readFile = async ({ path }) => ({ data: mustRead(path) });
  files.set('saves/slot1.fasave', mustRead('saves/slot1.fasave').toString('base64'));
  const webReader = createEngineAdapter();
  assert.equal((await webReader.loadSave()).week, 2, 'web legacy files report encoded size');
  assert.equal((await webReader.advanceWeek()).saved, true);
  assert.ok(files.get('saves/slot0.bin') instanceof Blob);
  assert.equal((await createEngineAdapter().loadSave()).week, 3);
});

test('snapshot uses the engine calendar and age without collapsing week zero', async () => {
  const { mapGameToSnapshot } = await import('../src/adapter/engineBridge.js');
  const snapshot = mapGameToSnapshot({
    week: 0,
    agency: { clients: { 7: {} }, money: 40 },
    clubs: [],
    players: { 7: { id: 7, name: '이준', pos: 'C', club: -1, ovr: 63.8, born: 2004 } },
  }, { mod: { d: () => '2026.07.01', offlineAge: () => 22, offlineMoneyScale: () => 1500 } });
  assert.equal(snapshot.dateLabel, '2026.07.01');
  assert.equal(snapshot.week, 0);
  assert.equal(snapshot.clients[0].age, 22);
  assert.equal(snapshot.clients[0].ovr, 64);
});

test('default new games open the verified bundled world and keep explicit seeds available', async () => {
  const { loadStarterWorld } = await import('../src/adapter/worldgen.js');
  const originalFetch = globalThis.fetch;
  window.location = { href: 'https://localhost/index.html' };
  globalThis.fetch = async (url) => {
    assert.equal(url.pathname, '/callup-starter-v1.bin');
    return new Response(new Uint8Array([31, 139]));
  };
  const mod = { async cA() {
    return { week: 0, seed: 71, agency: { name: '콜업 에이전시', callupBaseball1: true },
      clubs: [], players: {}, inbox: [{ kind: 'scout' }] };
  } };
  try {
    assert.equal(await loadStarterWorld(mod, { seed: 4 }), null);
    const game = await loadStarterWorld(mod, { agencyName: '하이파이브' });
    assert.equal(game.agency.name, '하이파이브');
    assert.equal(game.inbox[0].kind, 'scout');
    assert.ok(Number.isSafeInteger(game.seed));
  } finally {
    globalThis.fetch = originalFetch;
    delete window.location;
  }
});

test('offline WebView reads legacy records and writes to a separate committed slot', async () => {
  const { slotCandidates, writeSlotBlob } = await import('../src/adapter/diskSave.js');
  const oldBlob = new Blob([new Uint8Array([31, 139, 1])]);
  const newBlob = new Blob([new Uint8Array([31, 139, 2])]);
  const records = new Map([['slot1', { blob: oldBlob }]]);
  const database = {
    transaction(name) {
      assert.equal(name, 'saves');
      const transaction = { objectStore: () => ({
        get(key) {
          queueMicrotask(() => transaction.oncomplete());
          return { result: records.get(key) };
        },
        put(value, key) {
          queueMicrotask(() => { records.set(key, value); transaction.oncomplete(); });
          return { result: key };
        },
      }) };
      return transaction;
    },
  };
  window.SignHereSaveExport = {};
  globalThis.indexedDB = { open(name, version) {
    assert.equal(name, 'football-agency');
    assert.equal(version, 1);
    const request = { result: database };
    queueMicrotask(() => request.onsuccess());
    return request;
  } };
  try {
    assert.equal((await slotCandidates().next()).value.blob, oldBlob);
    assert.equal(await writeSlotBlob(newBlob), true);
    assert.equal(records.get('slot1').blob, oldBlob);
    assert.equal((await slotCandidates().next()).value.blob, newBlob);
  } finally {
    delete window.SignHereSaveExport;
    delete globalThis.indexedDB;
  }
});
