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
