/** Regenerate the bundled kickoff world after a save-schema or game-engine change. */
const { rename, writeFile } = require('node:fs/promises');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

async function main() {
  const publicDir = resolve(__dirname, '../apk-src/assets/public');
  const engine = await import(pathToFileURL(resolve(publicDir, 'assets/engine-DhPc-c_J.js')));
  const { runWorldGen } = await import('../shell/src/adapter/worldgen.js');
  const world = await runWorldGen(engine, { seed: 71, worldSeed: 20261125 });
  if (world?.week !== 0 || !world.inbox.some((entry) => entry.kind === 'scout')) {
    throw new Error('Starter world must open at kickoff with a scouting report.');
  }
  const blob = await engine.cz(world);
  const target = resolve(publicDir, 'callup-starter-v1.bin');
  const pending = `${target}.${process.pid}.tmp`;
  await writeFile(pending, Buffer.from(await blob.arrayBuffer()));
  await rename(pending, target);
  console.log(`Starter world ready: ${blob.size.toLocaleString('en-US')} bytes`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
