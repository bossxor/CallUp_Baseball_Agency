/**
 * callupAssert: stamp missing baseball saves; remap leftover soccer pos when stamped;
 * reject only when unstamped + soccer positions present.
 * Surface r5() load failures as title toast.
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");
const eng = path.join(root, "engine-DhPc-c_J.js");
const shell = path.join(root, "shell-DaKdX7f1.js");

const soft =
  'function callupAssertBaseball(game){var a=game&&game.agency,ps=game&&game.players||{},ok={P:1,C:1,"1B":1,"2B":1,"3B":1,SS:1,LF:1,CF:1,RF:1},map={ST:"RF",CF:"CF",LW:"LF",RW:"RF",CAM:"SS",CM:"2B",CDM:"3B",LM:"LF",RM:"RF",LB:"3B",RB:"1B",CB:"C",GK:"P",FW:"RF",MF:"2B",DF:"3B"},stamped=!!(a&&(a.callupBaseball1===true||a.callupBaseball1===1)),k,p,n=0,soccer=0;if(!a)return;for(k in ps){p=ps[k];if(!p)continue;n++;if(p.pos&&!ok[p.pos]){if(stamped){p.pos=map[p.pos]||"RF";}else if(map[p.pos]){soccer++;}else throw new Error("콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.");}}if(!stamped){if(soccer>0)throw new Error("콜업 야구 세이브만 지원합니다. 새 게임을 시작하세요.");a.callupBaseball1=true;}}';

let e = fs.readFileSync(eng, "utf8");
// replace any prior callupAssertBaseball function body start through offlineCheat
const re =
  /function callupAssertBaseball\(game\)\{[\s\S]*?\}\s*function offlineCheat/;
if (re.test(e)) {
  e = e.replace(re, soft + "function offlineCheat");
  fs.writeFileSync(eng, e);
  console.log("assert replaced");
} else if (e.includes("soccer>0")) {
  console.log("assert already new soft");
} else {
  console.log("MISS assert anchor");
}

let s = fs.readFileSync(shell, "utf8");
const r5old =
  "for(const i of c)try{const o=await i();if(!o)continue;const d=await Od(o);for(const h of d.inbox??[])h.ev===\"alum\"&&!h.done&&!((l=h.data)!=null&&l.sw)&&h.choices&&h.choices.length>2&&(h.choices=h.choices.slice(0,2).map((u,m)=>({...u,label:m?n(\"코치로 일하기\"):n(\"스카우트로 일하기\")})),h.def=0);return d}catch{}return null}";
const r5mid =
  "for(const i of c)try{const o=await i();if(!o)continue;const d=await Od(o);for(const h of d.inbox??[])h.ev===\"alum\"&&!h.done&&!((l=h.data)!=null&&l.sw)&&h.choices&&h.choices.length>2&&(h.choices=h.choices.slice(0,2).map((u,m)=>({...u,label:m?n(\"코치로 일하기\"):n(\"스카우트로 일하기\")})),h.def=0);return d}catch(err){try{console.error(err)}catch{}return{__loadErr:String(err&&err.message||err)}}return null}";
if (s.includes("__loadErr")) console.log("r5 err ok");
else if (s.includes(r5old)) {
  s = s.split(r5old).join(r5mid);
  console.log("r5 surfaces err");
} else console.log("MISS r5");

const weOld =
  'const we=async M=>{tt("cont"),tc(M),d(n("불러오고 있어요"));const T=await r5();if(T&&await Promise.all([fr(M1()),fr(ks())]),d(null),!T){i(await lc());return}q4(T,M),Cc(T),s()}';
const weNew =
  'const we=async M=>{tt("cont"),tc(M),d(n("불러오고 있어요"));const T=await r5();if(T&&T.__loadErr){d(T.__loadErr);i(await lc());return}if(T&&await Promise.all([fr(M1()),fr(ks())]),d(null),!T){d(n("세이브를 불러오지 못했어요."));i(await lc());return}q4(T,M),Cc(T),s()}';
if (s.includes("T.__loadErr")) console.log("we err ok");
else if (s.includes(weOld)) {
  s = s.split(weOld).join(weNew);
  console.log("we shows load fail");
} else console.log("MISS we");

fs.writeFileSync(shell, s);
console.log("fix-load-assert done");
