/** Phase C5: stop the current batch for arrivals. Phase UI still owns manual gates. */
const fs=require("node:fs");
const path=require("node:path");
const assets=path.join(__dirname,"../apk-src/assets/public/assets");
function replace(source,old,next){
  if(!source.includes(old))throw Error("C5 anchor missing: "+old.slice(0,100));
  return source.replace(old,()=>next);
}
const enginePath=path.join(assets,"engine-DhPc-c_J.js");
let engine=fs.readFileSync(enginePath,"utf8");
if(!engine.includes("/*CALLUP_C5_STOPS*/")){
  engine=replace(engine,'const PN=x=>{',
    '/*CALLUP_C5_STOPS*/const callupPhaseCStops=x=>!x.done&&(x.ev==="draftMiss"||x.ev==="support"||x.ev==="supportReport"||x.ev==="twReferral"||!!x.data?.draft||!!x.data?.seasonEnd);const PN=x=>{');
  engine=replace(engine,'n.w>=e.week&&PN(n)','n.w>=e.week&&(PN(n)||callupPhaseCStops(n))');
  engine=replace(engine,'    case "optOutTest": {',[
    '    case "supportInjuryTest":',
    '    case "supportFormTest": {',
    '      if (game.inbox.some(item=>!item.done&&item.ev==="support"&&item.pid===player.id))',
    '        throw new RangeError("열려 있는 선수 지원 안건을 먼저 처리하세요.");',
    '      if (agency.supportBlock) delete agency.supportBlock[player.id];',
    '      if (action==="supportInjuryTest") player.inj={weeks:8,severe:true};',
    '      else { player.inj=null; player.form=5; player.st.apps=Math.max(6,player.st.apps); }',
    '      callupSupportAgenda(game,game.week);',
    '      break;',
    '    }',
    '    case "optOutTest": {'
  ].join("\n"));
}
if(!engine.includes('x.ev==="supportReport"||x.ev==="twReferral"||'))
  engine=replace(engine,'x.ev==="supportReport"||','x.ev==="supportReport"||x.ev==="twReferral"||');
fs.writeFileSync(enginePath,engine);
const shellPath=path.join(assets,"shell-DaKdX7f1.js");
let shell=fs.readFileSync(shellPath,"utf8");
if(!shell.includes("/*CALLUP_C5_CHEAT_UI*/")){
  shell=replace(shell,'group("치트 종류 (개인용)", [["players", "선수·자금"], ["negotiation", "협상"], ["scout", "스카우트"]], tab, setTab),',
    'group("치트 종류 (개인용)", [["players", "선수·자금"], ["negotiation", "협상"], ["scout", "스카우트"], ["qa", "Phase C 테스트"]], tab, setTab),');
  shell=replace(shell,'...(tab === "players" ? playerPanel() : tab === "negotiation" ? negotiationPanel() : scoutPanel()),',[
    '/*CALLUP_C5_CHEAT_UI*/ ...(tab === "qa" ? [',
    '  button("시즌 연봉 테스트", {disabled:!player||busy,onClick:()=>void apply("seasonSalTest")}),',
    '  button("드래프트 테스트", {disabled:!player||busy,onClick:()=>void apply("draftTest")}),',
    '  button("장기 부상 지원 테스트", {disabled:!player||busy,onClick:()=>void apply("supportInjuryTest")}),',
    '  button("부진 지원 테스트", {disabled:!player||busy,onClick:()=>void apply("supportFormTest")}),',
    '] : tab === "players" ? playerPanel() : tab === "negotiation" ? negotiationPanel() : scoutPanel()),'
  ].join("\n"));
  fs.writeFileSync(shellPath,shell);
}
console.log("C5 batch stops and device QA controls applied.");
