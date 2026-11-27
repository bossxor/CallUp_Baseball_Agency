const HAS_FLAG = 'callup-has-save-v1';
const pathFor = (slot, suffix = 'bin') => `saves/slot${slot}.${suffix}`;
const DIRECTORY = 'DATA';
const CHUNK = 512 * 1024;
let loading;
let offlineDb;

function hasOfflineStore() {
  return Boolean(window.SignHereSaveExport && globalThis.indexedDB);
}

function openOfflineStore() {
  // This is the database used by the original APK shell on the same WebView origin.
  offlineDb ||= new Promise((resolve, reject) => {
    const request = indexedDB.open('football-agency', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('saves');
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); offlineDb = null; };
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  }).catch((error) => { offlineDb = null; throw error; });
  return offlineDb;
}

async function offlineSlot(mode, action) {
  const database = await openOfflineStore();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('saves', mode);
    const request = action(transaction.objectStore('saves'));
    transaction.oncomplete = () => resolve(request.result);
    transaction.onabort = transaction.onerror = () => reject(transaction.error || request.error);
  });
}

async function filesystem() {
  if (!window.Capacitor) return { plugin: null, web: false };
  if (!window.Capacitor.Plugins?.Filesystem) {
    const url = new URL('./assets/disk-ClprvGM1.js', window.location.href).href;
    loading ||= import(/* @vite-ignore */ url).catch((error) => console.warn('Filesystem registration failed', error));
    await loading;
  }
  // Older Capacitor proxies synthesize a method even for `then`.
  return { plugin: window.Capacitor.Plugins?.Filesystem ?? null, web: window.Capacitor.getPlatform?.() === 'web' };
}

export function markHasSave() {
  try { localStorage.setItem(HAS_FLAG, '1'); } catch { /* Disk is authoritative. */ }
}

export function clearHasSaveFlag() {
  try { localStorage.removeItem(HAS_FLAG); } catch { /* Disk is authoritative. */ }
}

export function flagHasSave() {
  try { return localStorage.getItem(HAS_FLAG) === '1'; } catch { return false; }
}

function encode(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function decode(data) {
  return Uint8Array.from(atob(data), (unit) => unit.charCodeAt(0));
}

async function remove(fs, path) {
  try { await fs.deleteFile({ path, directory: DIRECTORY }); } catch { /* Already absent. */ }
}

export async function writeSlotBlob(blob, slot = 0, metadata) {
  if (!blob?.size) return false;
  if (hasOfflineStore()) {
    try {
      await offlineSlot('readwrite', (store) => store.put({ blob, ...metadata && { metadata } },  `slot${slot}`));
      markHasSave();
      return true;
    } catch (error) {
      console.warn('WebView save failed', error);
    }
  }
  const { plugin: fs, web } = await filesystem();
  if (!fs) return false;
  const path = pathFor(slot);
  const temp = path + '.tmp';
  const backup = path + '.bak';
  const move = (from, to) => fs.rename({ from, to, directory: DIRECTORY });
  try {
    if (web) {
      await fs.writeFile({ path: temp, data: blob, directory: DIRECTORY, recursive: true });
    } else {
      for (let offset = 0; offset < blob.size; offset += CHUNK) {
        const data = await encode(blob.slice(offset, offset + CHUNK));
        if (offset === 0) await fs.writeFile({ path: temp, data, directory: DIRECTORY, recursive: true });
        else await fs.appendFile({ path: temp, data, directory: DIRECTORY });
      }
    }
    const size = (await fs.stat({ path: temp, directory: DIRECTORY })).size;
    if (size !== blob.size && (await readBlob(fs, temp))?.size !== blob.size) {
      throw new Error('저장 파일 크기가 일치하지 않습니다.');
    }
    const exists = await fs.stat({ path, directory: DIRECTORY }).then(() => true, () => false);
    if (exists) {
      await remove(fs, backup);
      await move(path, backup);
    }
    try {
      await move(temp, path);
    } catch (error) {
      if (exists) await move(backup, path).catch(() => {});
      throw error;
    }
    markHasSave();
    return true;
  } catch (error) {
    console.warn('Could not commit save slot', error);
    return false;
  }
}

async function readBlob(fs, path) {
  const { size } = await fs.stat({ path, directory: DIRECTORY });
  if (!size) return null;
  const chunks = [];
  for (let offset = 0; offset < size; offset += CHUNK) {
    const length = Math.min(CHUNK, size - offset);
    const { data } = await fs.readFile({ path, directory: DIRECTORY, offset, length });
    if (offset === 0 && data instanceof Blob) return data;
    const bytes = decode(data);
    if (offset === 0 && bytes.length === size) return new Blob([bytes]);
    // The web implementation ignores ranges and reports the base64 length for old files.
    if (offset === 0 && data.length === size) {
      if (bytes.length !== length) return new Blob([bytes]);
      const whole = await fs.readFile({ path, directory: DIRECTORY });
      return new Blob([decode(whole.data)]);
    }
    if (bytes.length !== length) throw new Error('저장 파일을 끝까지 읽지 못했습니다.');
    chunks.push(bytes);
  }
  return new Blob(chunks);
}

function pathsFor(slot) {
  const binary = ['bin', 'fasave'].flatMap((type) => {
    const path = pathFor(slot, type);
    return [path, path + '.bak', path + '.tmp'];
  });
  const text = pathFor(slot, 'json');
  return [...binary, text, text + '.tmp'];
}

export const CONTINUE_SLOTS = [0, 1, 2, 3];

export async function* slotCandidates(slots = CONTINUE_SLOTS) {
  if (hasOfflineStore()) {
    for (const slot of slots) {
      try {
        const record = await offlineSlot('readonly', (store) => store.get(`slot${slot}`));
        if (record?.blob instanceof Blob && record.blob.size > 0) yield { slot, blob: record.blob, metadata: record.metadata };
      } catch (error) {
        console.warn('WebView save read failed', error);
        break;
      }
    }
  }
  const { plugin: fs } = await filesystem();
  if (!fs) return;
  for (const slot of slots) {
    for (const path of pathsFor(slot)) {
      try {
        if (path.includes('.json')) {
          const { data } = await fs.readFile({ path, directory: DIRECTORY, encoding: 'utf8' });
          if (data && /"players"\s*:/.test(data)) yield { slot, raw: data };
        } else {
          const blob = await readBlob(fs, path);
          if (blob) yield { slot, blob };
        }
      } catch { /* Try another copy, including older engine slots. */ }
    }
  }
}

export async function deleteSlot(slot) {
  if (hasOfflineStore()) await offlineSlot('readwrite', (store) => store.delete(`slot${slot}`));
  const { plugin: fs } = await filesystem();
  if (!fs) return;
  for (const path of pathsFor(slot)) await remove(fs, path);
}
