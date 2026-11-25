/** Update previously generated stories without changing saved clubs, names or outcomes. */
const fs = require("node:fs");
const path = require("node:path");
const root = process.argv[2] ?? path.join(__dirname, "../apk-src");
const engine = path.join(root, "assets/public/assets/engine-DhPc-c_J.js");
const marker = "/*CALLUP_BASEBALL_SAVE_COPY*/";
let source = fs.readFileSync(engine, "utf8");
if (source.includes(marker)) process.exit(0);
const anchor = "function KI(x){";
if (!source.includes(anchor)) throw Error("Save reader anchor missing");
if (!source.includes("function callupBaseballEventText(")) throw Error("Event copy migration missing");
const call = "const l={...e,players:n};return PE(l),";
if (!source.includes(call)) throw Error("Parsed save anchor missing");
source = source.replace(anchor, marker + String.raw`
function callupReadBaseballHistory(save, players){
  if(save.callupBaseballCopy)return;
  const archivedCup = a("이전 클럽 대회");
  const rewrite = text => callupBaseballEventText(text)
    .replace(/한국 1군/g,"KBO")
    .replace(/한국 2군/g,"KBO 퓨처스")
    .replace(/일본 1군/g,"NPB")
    .replace(/일본 2군/g,"NPB 2군")
    .replace(/대만 1군/g,"CPBL")
    .replace(/미국 메이저/g,"MLB")
    .replace(/미국 마이너/g,"MiLB")
    .replace(/유럽 클럽 (?:트로피|실드)|아시아 클럽컵|남미 클럽컵|북중미 클럽컵|아프리카 클럽 챔피언십|대륙 간 클럽컵|한국 (?:협회컵|리그컵)|(?:일본|대만|미국) 컵/g,archivedCup);
  const update = (rows, ...fields) => {
    for(const row of rows??[]){
      for(const field of fields) if(typeof row?.[field]==="string") row[field]=rewrite(row[field]);
    }
  };
  update(save.news,"text");
  update(save.inbox,"title","body","result");
  for(const item of save.inbox??[]) update(item.choices,"label","hint");
  update(save.awards,"title","text");
  update(save.agency.moments,"text");
  for(const season of [save.agency.yr,...save.agency.years??[]]) update(season?.honors,"text");
  for(const deal of save.deals??[]){
    update([deal],"result");
    update(deal.lines,"text");
  }
  for(const player of Object.values(players)){
    update(player.timeline,"text");
    if(player.honors?.length)player.honors=player.honors.map(rewrite);
  }
  // Former club competitions used these records even when their display names matched national events.
  for(const cup of save.cupHistory??[]) cup.name=archivedCup;
  save.callupBaseballCopy=1;
}
` + anchor);
source = source.replace(call, "callupReadBaseballHistory(e,n);"+call);
const fresh = 'const r={version:1,worldSeed:e,seed:t,rs:0,week:l';
if (!source.includes(fresh)) throw Error("New save anchor missing");
source = source.replace(fresh, 'const r={version:1,callupBaseballCopy:1,worldSeed:e,seed:t,rs:0,week:l');
fs.writeFileSync(engine, source);
