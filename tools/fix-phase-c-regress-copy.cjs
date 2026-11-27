/** Phase C4: four-market scouting and comparable free-agent proposals. */
const fs=require("node:fs");
const path=require("node:path");
const assets=path.join(__dirname,"../apk-src/assets/public/assets");
const engine=path.join(assets,"engine-DhPc-c_J.js");
const shell=path.join(assets,"shell-DaKdX7f1.js");
function patch(file,marker,edits){
  let source=fs.readFileSync(file,"utf8");
  if(source.includes(marker))return;
  for(const [old,next] of edits){
    if(!source.includes(old))throw Error("C4 anchor missing: "+old.slice(0,120));
    source=source.replace(old,()=>next);
  }
  fs.writeFileSync(file,source);
}
const marketMarker="/*CALLUP_C4_MARKETS*/";
patch(engine,marketMarker,[
  ["function Io(x,e){return Object.keys(od).filter(t=>t===e||x>=Nh[od[t]])}",
   'const callupMarkets={KR:"한국",JP:"일본",TW:"대만",US:"미국"};'+marketMarker+
   'function callupMarket(x){return x==="대한민국"?"한국":x}function callupScoutMatch(x,p,r){const club=W(x,p);return r==="ALL"||(callupMarkets[r]?(club?.country??callupMarket(p.nat))===callupMarkets[r]:(club?C[club.league].cont:y0[p.nat]?.cont)===r)}function Io(){return Object.keys(callupMarkets)}'],
  ["od={AS:", "od={KR:1,JP:1,TW:1,US:1,AS:"],
  ['const bi={ALL:', 'const bi={...callupMarkets,ALL:'],
  ["W9={ALL:", "W9={KR:.75,JP:.8,TW:.8,US:1.1,ALL:"],
  ['x==="ALL"?t.cont==="EU":t.cont===x', 'callupMarkets[x]?t.country===callupMarkets[x]:x==="ALL"?t.cont==="EU":t.cont===x'],
  ['if(t.region!=="ALL"){const G0=W(x,P);if((G0?C[G0.league].cont:(Q=y0[P.nat])==null?void 0:Q.cont)!==t.region)continue}',
   'if(!callupScoutMatch(x,P,t.region))continue;'],
  ['y=w=>{var j;if(r.region==="ALL")return!0;const O=W(x,w);return(O?C[O.league].cont:(j=y0[w.nat])==null?void 0:j.cont)===r.region}',
   'y=w=>callupScoutMatch(x,w,r.region)'],
  ['Object.entries(y0).filter(([,m])=>t.region==="ALL"||m.cont===t.region)',
   'Object.entries(y0).filter(([nat,m])=>callupMarkets[t.region]?callupMarket(nat)===callupMarkets[t.region]:t.region==="ALL"||m.cont===t.region)'],
  ['r=criteria?.nat??(e.weighted(l,([,m])=>m.w)??e.pick(Object.entries(y0)))[0]',
   'r=(criteria?.nat&&(!callupMarkets[t.region]||callupMarket(criteria.nat)===callupMarkets[t.region])?criteria.nat:void 0)??(e.weighted(l,([,m])=>m.w)??e.pick(l.length?l:Object.entries(y0)))[0]'],
  ['const p=Fp(x,l,i,b,l.wage>0?l.wage:oe(l,C[i.league],m)*.8);',
   'if(!i||bo(x,l,i))return a("선수 등록 자격이 맞지 않아요.");if(l.nat!==i.country&&Xd(x,i)>=Jd(i))return a("외국인 등록 자리가 없어요.");if(Ct(i)<c)return a("구단 예산이 부족해요.");const p=Fp(x,l,i,b,l.wage>0?l.wage:oe(l,C[i.league],m)*.8);'],
  ['Jy=(x,e,t)=>Math.min(Wo.faCap,x*e*t*Wo.faK)', 'Jy=(x,e,t)=>Math.min(Wo.faCap,x/52*t)'],
  ['계약금가 부족하다며','계약금이 부족하다며'],
]);
// Story and bonus prospects must respect ordinary scouting conditions.
patch(engine,"/*CALLUP_SCOUT_REPORT_FILTERS*/",[
  ['if(t.offlineScout==null&&!l.gemDone&&d.length)', 'const narrow=Kc(r)||ht(r.grade)!=="all";/*CALLUP_SCOUT_REPORT_FILTERS*/if(t.offlineScout==null&&!narrow&&!l.gemDone&&d.length)'],
  ['const m = YM(x,d), c = i.know;', 'const matchesCup=r.region==="ALL"||(callupMarkets[r.region]?callupMarkets[r.region]===callupMarket(l.nat):r.region===y0[l.nat]?.cont);const m = (guaranteed||!narrow&&matchesCup&&(r.pos==="ANY"||r.pos===l.cupKid?.pos)) ? YM(x,d) : false, c = i.know;'],
]);
patch(shell,"/*CALLUP_C4_SCOUT_UI*/",[
  ['[c,l]=p.useState(((ae=Us[a.nat])==null?void 0:ae.cont)??"ALL")',
   '[c,l]=p.useState("KR")/*CALLUP_C4_SCOUT_UI*/'],
  ['i=l.kind==="offer"&&(((r=l.data)==null?void 0:r.fee)??0)>0&&l.pid!==void 0&&!((c=l.data)!=null&&c.tut)',
   'i=l.kind==="offer"&&l.pid!==void 0&&!l.data?.tut&&!l.data?.draft'],
]);
patch(engine,"/*CALLUP_C4_REGISTRATION*/",[
  ['function GT(x,e,t,n){var F;if(e.renew)return $T(x,e,t,n);',
   '/*CALLUP_C4_REGISTRATION*/function GT(x,e,t,n){var F;const item=x.inbox.find(m=>m.id===e.msgId);if(e.state==="deal"||item?.done)return;if(e.renew)return $T(x,e,t,n);const candidate=x.players[e.pid],target=x.clubs[e.club];if(!e.pro&&!item?.data?.tut){const failure=!candidate||!target||!Tl(x,candidate)||bo(x,candidate,target)?a("선수 등록 자격이 맞지 않아요."):candidate.nat!==target.country&&Xd(x,target)>=Jd(target)?a("외국인 등록 자리가 없어요."):Ct(target)<e.fee?a("구단 예산이 부족해요."):null;if(failure){e.state="walked";e.result=failure;tm(x,e);return}}'],
  ['const s=e.offer;l.wage=s,l.until=x0(x.week)+1+e.years;',
   'const s=e.offer,season=x.inbox.find(item=>item.id===e.msgId)?.data?.seasonEnd;l.wage=s;if(!season)l.until=x0(x.week)+1+e.years;'],
  ['b=Math.round(af(s,e.years,((i==null?void 0:i.feeRate)??.05)+c)*lm(x,l.id)*(e.deleg??1)*Y_(e));',
   'b=season?Math.round(s/52*(i?.feeRate??.05)):Math.round(af(s,e.years,((i==null?void 0:i.feeRate)??.05)+c)*lm(x,l.id)*(e.deleg??1)*Y_(e));'],
]);
patch(engine,"/*CALLUP_C4_TW_REFERRAL*/",[
  ["/*CALLUP_SUPPORT_FN*/",`/*CALLUP_SUPPORT_FN*//*CALLUP_C4_TW_REFERRAL*/
function callupTaiwanOpening(x,club){return club?.country==="대만"&&Xd(x,club)<Jd(club)&&club.squad.some(id=>{const p=x.players[id];return p?.pos==="P"&&p.pt>=.45&&p.inj?.severe&&p.inj.weeks>=4});}
function callupTaiwanCandidate(x,p,club){return p?.pos==="P"&&p.club<0&&!p.inj&&p.nat!==club.country&&Tl(x,p)&&!bo(x,p,club);}
function callupTaiwanReferrals(x,t){
  const ag=x.agency;
  const pending=ag.twReferral;
  if(pending&&pending.due<=t){
    delete ag.twReferral;
    const club=x.clubs[pending.club],p=x.players[pending.pid];
    if(!callupTaiwanOpening(x,club)||!callupTaiwanCandidate(x,p,club)||!Ge(x,ke(x,"cutw",t),p,club,t,true))
      O0(x,{kind:"news",ev:"twReferralClosed",tier:"mid",pid:pending.pid,title:a("대만 구단 회신"),body:a("등록 자리나 선수 조건이 바뀌어 제안을 받지 못했어요."),tone:0});
  }
  if(ag.twReferral||x.inbox.some(item=>!item.done&&item.ev==="twReferral"))return;
  const candidates=Object.keys(ag.clients).map(id=>x.players[id]).filter(p=>p?.pos==="P"&&p.club<0&&!p.inj&&Tl(x,p));
  if(!candidates.length)return;
  for(const club of x.clubs){
    if(!callupTaiwanOpening(x,club))continue;
    const p=candidates.find(candidate=>callupTaiwanCandidate(x,candidate,club)&&!x.inbox.some(item=>item.pid===candidate.id&&item.data?.club===club.id&&(!item.done&&item.kind==="offer"||item.ev==="twReferral"&&t-item.w<52)));
    if(!p)continue;
    O0(x,{kind:"news",ev:"twReferral",pid:p.id,tier:"rare",title:a("대만 선발 공백 — {c}",{c:T(club)}),body:a("{c}에 등록 자리가 있어요. 자유계약 투수 {p}을 추천할까요?",{c:T(club),p:p.name}),data:{club:club.id},choices:[{label:a("선수 추천"),hint:a("다음 주 회신")},{label:a("보류"),hint:""}],def:1,expires:t+2,tone:0});
    break;
  }
}
function callupTaiwanReferralPick(x,item,choice){
  if(choice!==0)return a("추천하지 않았어요.");
  const club=x.clubs[item.data.club],p=x.players[item.pid];
  if(!callupTaiwanOpening(x,club)||!callupTaiwanCandidate(x,p,club))return a("구단 등록 자리나 선수 자격이 바뀌었어요.");
  x.agency.twReferral={club:club.id,pid:p.id,due:x.week+1};
  return a("선수를 추천했어요. 다음 주 회신이 옵니다.");
}
`],
  ["callupSupportReport(x,t),/*CALLUP_SUPPORT_HOOK*/", "callupSupportReport(x,t),/*CALLUP_SUPPORT_HOOK*/callupTaiwanReferrals(x,t),"],
  ['n.ev==="support"?callupSupportPick(x,n,t):', 'n.ev==="support"?callupSupportPick(x,n,t):n.ev==="twReferral"?callupTaiwanReferralPick(x,n,t):'],
]);
console.log("C4 market/copy checks applied.");

// The club badge and league picker share the engine's baseball league names.
const divisionLabel='n("{tier}부 리그",{tier:';
patch(shell,"/*CALLUP_C4_LEAGUE_LABELS*/",[
  [divisionLabel+'t.tier})', 'n(t.name)/*CALLUP_C4_LEAGUE_LABELS*/'],
  [divisionLabel+'v.tier})', 'n(v.name)'],
]);
const leagueNames=["KBO","KBO 퓨처스","NPB","NPB 2군","CPBL","MLB","MiLB"];
for(const [file,oldLabel,labels] of [
  ["ui-DgYnPcSw.js","Division",["KBO","KBO Futures","NPB","NPB Farm","CPBL","MLB","MiLB"]],
  ["ui-DSX53OnJ.js","División",["KBO","KBO Futures","NPB","NPB Farm","CPBL","MLB","MiLB"]],
]){
  const translations=Object.fromEntries(leagueNames.map((name,index)=>[name,labels[index]]));
  patch(path.join(assets,file),"/*CALLUP_C4_LEAGUE_LABELS*/",[
    ['"{tier}부 리그":"'+oldLabel+' {tier}"', JSON.stringify(translations).slice(1,-1)+'/*CALLUP_C4_LEAGUE_LABELS*/'],
  ]);
}

const baseballCopy=[
  ["점유 야구","컨택 중심","Contact Focus","Contacto"],
  ["역습 야구","주루 중심","Baserunning Focus","Corrida de bases"],
  ["압박 야구","기동력과 수비","Speed and Fielding","Velocidad y defensa"],
  ["수비 야구","수비 중심","Defense Focus","Defensa"],
  ["측면 야구","장타와 주루","Power and Baserunning","Poder y corrida de bases"],
  ["롱볼 야구","장타 중심","Power Focus","Poder"],
  ["공격 야구","타격 중심","Hitting Focus","Bateo"],
  ["실리 야구","장타와 수비","Power and Fielding","Poder y defensa"],
  ["전술 궁합","팀 스타일 적합도","Team Style Fit","Encaje con el equipo"],
  ["체격이 아쉽습니다. 세트피스 수비에서 구멍이 될 수 있어요.","수비에서 타구를 끝까지 따라갈 체력이 걱정됩니다.","I'm concerned about his stamina in the field.","Me preocupa su resistencia en defensa."],
  ["발이 느리던데요. 저희는 역습 야구를 합니다.","저희는 주루를 중시합니다. 주력이 조금 아쉽네요.","We value baserunning. His speed is a concern.","Valoramos la corrida de bases. Le falta velocidad."],
  ["뒷공간을 내주면 따라잡을 속도가 없어 보입니다.","깊은 타구를 따라잡을 주력이 부족해 보여요.","He may lack the speed to track down deep hits.","Quizá le falte velocidad para alcanzar batazos profundos."],
  ["세트피스","상황 타격","Situational Hitting","Bateo situacional"],
  ["세트피스 키커로도 쓸 수 있습니다. 한 시즌 서너 골은 거기서 나와요.","주자를 진루시키는 타격에 능합니다. 득점 기회를 꾸준히 만들어 줘요.","He moves runners over and creates scoring chances.","Sabe avanzar a los corredores y crear ocasiones de anotar."],
  ["프리킥 하나로 승점을 따 오는 선수입니다.","필요한 순간에 진루타로 득점 기회를 만드는 선수입니다.","He moves runners over when it matters.","Hace avanzar a los corredores en el momento justo."],
  ["세트피스 때 상대가 두 명씩 붙습니다.","타석에 들어서면 상대 외야가 깊게 물러섭니다.","Outfielders play deep when he comes up to bat.","Los jardineros juegan atrás cuando él batea."],
  ["하부 리그 주전","2군 주전","Second-Team Starter","Titular del segundo equipo"],
  ["1부 로테이션","1군 로테이션","First-Team Rotation","Rotación del primer equipo"],
  ["1부 주전","1군 주전","First-Team Starter","Titular del primer equipo"],
  ["빅클럽 주전","우승권 팀 주전","Contender Starter","Titular en un aspirante al título"],
];
const copyMarker="/*CALLUP_C4_BASEBALL_COPY*/";
for(const [file,column] of [[engine,1],[shell,1],[path.join(assets,"ui-DgYnPcSw.js"),2],[path.join(assets,"ui-DSX53OnJ.js"),3]]){
  let source=fs.readFileSync(file,"utf8");
  if(source.includes(copyMarker))continue;
  for(const [old,ko,en,es] of baseballCopy){
    const key=JSON.stringify(old);
    if(column===1){
      source=source.replaceAll(key,JSON.stringify(ko));
    }else{
      const escaped=key.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
      const translatedKey=old==="세트피스"?'(?:'+escaped+'|세트피스)':escaped;
      const entry=new RegExp(translatedKey+':"(?:[^"\\\\]|\\\\.)*"','g');
      if(!entry.test(source)&&!source.includes(JSON.stringify(ko)+":"))throw Error("Missing translation: "+old);
      source=source.replace(entry,()=>JSON.stringify(ko)+":"+JSON.stringify(column===2?en:es));
    }
  }
  if(file===engine)source=source.replace("새 감독은 압박 야구를 좋아한대요.","새 감독은 기동력과 수비를 중시한대요.");
  fs.writeFileSync(file,source.trimEnd()+"\n"+copyMarker+"\n");
}
