/** Second-pass soccer leftovers beyond the first residual gate. */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ?? path.join(__dirname, "../apk-src");
const assets = path.join(root, "assets/public/assets");
const marker = "/*CALLUP_SOCCER_BROAD_COPY*/";

const pairs = [
  ["하프라인 장거리 골", "담장 넘기는 장거리 홈런"],
  ["하프라인 저격수", "담장 저격수"],
  ["Halfway Sniper", "Fence Sniper"],
  ["역습 때 혼자 공을 몰고 하프라인을 넘어가요", "찬스에서 혼자 밀어 2루까지 파고들어요"],
  ["Carries it past halfway alone on the", "Drives himself to second alone on the"],
  ["Pasa la mitad de cancha solo al cont", "Se mete solo hasta la segunda al cont"],
  ["하프라인", "내야"],
  ["총알 풀백", "총알 외야수"],
  ["Bullet Back", "Bullet Outfielder"],
  ["공격 가담이 좋은 풀백", "공격 가담이 좋은 외야수"],
  ["Attacking full-back", "Attacking outfielder"],
  ["Lateral ofensivo", "Jardinero ofensivo"],
  ["보복성 태클 부상", "보복성 빈볼 부상"],
  ["보복성 태클에 쓰러졌어요. 12주 이탈.", "보복성 빈볼에 맞았어요. 12주 이탈."],
  ["Revenge tackle", "Revenge HBP"],
  ["Hit by a revenge tackle. O", "Hit by a revenge pitch. O"],
  ["Falta vengativa", "Pelotazo vengativo"],
  ["Entrada vengativa. Baja 12", "Pelotazo vengativo. Baja 12"],
  ['태클:"Tackling"', '태그:"Tagging"'],
  ['태클:"Entradas"', '태그:"Tags"'],
  ["“하부 리그를 돌았어요", "“하위 리그를 돌았어요"],
  ["Full-back {n} wants to push up more", "Outfielder {n} wants to play shallower"],
  ["태클 타이밍이 기가 막혀요", "태그 타이밍이 기가 막혀요"],
  ["Perfectly timed tackles", "Perfectly timed tags"],
  ["Entradas en el momento justo", "Tags en el momento justo"],
  ["첫 태클을 피하지 않았다", "첫 몸싸움을 피하지 않았다"],
  ["He di", "He di"],
  ["No esquivó ", "No esquivó "],
];

function patchFile(file) {
  const target = path.join(assets, file);
  if (!fs.existsSync(target)) return false;
  let source = fs.readFileSync(target, "utf8");
  if (source.includes(marker)) return false;

  let head = source;
  let tail = "";
  if (file.startsWith("engine-")) {
    const cuts = ["/*CALLUP_BASEBALL_EVENT_COPY*/", "/*CALLUP_BASEBALL_SAVE_COPY*/"]
      .map((m) => source.indexOf(m))
      .filter((i) => i >= 0);
    if (cuts.length) {
      const cut = Math.min(...cuts);
      head = source.slice(0, cut);
      tail = source.slice(cut);
    }
  }

  for (const [old, next] of pairs) {
    if (old === next) continue;
    if (head.includes(old)) head = head.split(old).join(next);
  }

  fs.writeFileSync(target, (head + tail).trimEnd() + "\n" + marker + "\n");
  return true;
}

const files = fs.readdirSync(assets).filter((f) => f.endsWith(".js"));
let n = 0;
for (const file of files) if (patchFile(file)) n++;
console.log(`Soccer broad copy cleared in ${n} files.`);
