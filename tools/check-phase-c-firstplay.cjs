const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {pathToFileURL} = require("node:url");

const assets = path.resolve(__dirname, "../apk-src/assets/public/assets");
const engineFile = path.join(assets, "engine-DhPc-c_J.js");
const shellFile = path.join(assets, "shell-DaKdX7f1.js");

async function run() {
  let source = fs.readFileSync(engineFile, "utf8").replace(/(["'])\.\/([^"']+)\1/g,
    (_, quote, file) => quote + pathToFileURL(path.join(assets, file)).href + quote);
  source += "\nexport {V5, Qe, Cn, callupSeasonRound, callupKoreanDraft, callupSupportReport, callupScoutMatch, callupTaiwanReferrals, EU, nU, V9, Ge, Ap, ET, GT, ke, vI, Xd, Jd, Ct, Sr, sx, pd, xa, T8, callupExtraInning};";
  const engine = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));

  const g = engine.V5({agent:"QA",nat:"대한민국",agencyName:"CallUp QA",lang:"ko"},20261125,71).g;
  assert.equal(engine.j.KOR1.name,"KBO");
  assert.equal(engine.j.ESP1.name,"NPB");
  assert.equal(engine.j.ITA1.name,"MLB");
  assert.equal(engine.j.GER1.name,"CPBL");
  assert.equal(engine.j.ENG2.name,"KBO 퓨처스");
  assert.deepEqual(engine.aR,[],"no football club tournaments");
  assert.ok(engine.L.every(league=>league.season==="FEB_NOV"&&!league.down&&!league.releg&&!league.promo&&!league.split),"baseball league calendar has no club promotion or split");
  const club = g.clubs.find(team => team.league==="KOR1");
  const player = g.players[club.squad[0]];
  assert.ok(player,"Korean player seeded");
  const sign = p => {
    p.agent=2;
    g.agency.clients[p.id]={since:0,until:156,wageRate:.05,feeRate:.05,bond:50,knownLike:[]};
  };
  g.silent=false;
  g.week=0;
  sign(player);
  engine.offlineCheat(g,"seasonSalTest",player.id,new FormData(),"KRW");
  g.players[player.id].wage=200000;
  const salary=g.inbox.find(item=>item.data?.seasonEnd);
  assert.equal(salary?.tier,"unique");
  const before=g.agency.ledger.length;
  engine.Cn(g,salary.id,0);
  engine.Cn(g,salary.id,0);
  assert.equal(g.agency.ledger.length,before+1);
  assert.equal(player.wage,salary.data.wage);
  assert.equal(g.agency.ledger.at(-1).amt,Math.round(salary.data.wage/52*.05));
  engine.offlineCheat(g,"seasonSalTest",player.id,new FormData(),"KRW");
  const salaryCard=g.inbox.find(item=>item.data?.seasonEnd&&!item.done);
  const salaryDeal=engine.ET(g,salaryCard);
  const until=player.until;
  salaryDeal.offer=salaryCard.data.wage;
  engine.GT(g,salaryDeal,engine.ke(g,"salary-accept"),player.wage);
  assert.equal(salaryDeal.state,"deal");
  assert.equal(player.until,until);
  assert.equal(g.agency.ledger.at(-1).amt,Math.round(player.wage/52*.05));
  console.log("PASS C1 annual salary, one fee, QA action");

  const draftWeek=engine.callupSeasonRound()+1;
  g.week=draftWeek-1;
  engine.callupKoreanDraft(g,g.week);
  assert.equal(g.agency.draftClass.length,3);
  assert.ok(g.agency.draftClass.every(id=>g.players[id].club===-1&&!g.agency.clients[id]));
  const prospect=g.players[g.agency.draftClass[0]];
  sign(prospect);
  for(let i=0;i<8;i++){
    const applicant=g.players[g.agency.draftClass[i%3]];
    const rookie=i<3?applicant:engine.Qe(g,engine.ke(g,"rookie",i),engine.ke(g,"traits",i),{club:-1,pos:"P",age:18,nat:"대한민국",ovr:64});
    rookie.mil=1;
    sign(rookie);
  }
  const clubCount=g.clubs.length;
  g.week=draftWeek;
  engine.offlineCheat(g,"draftTest",prospect.id,new FormData(),"KRW");
  const offer=g.inbox.find(item=>item.data?.draft);
  const miss=g.inbox.find(item=>item.ev==="draftMiss");
  assert.ok(offer&&miss,"fixed cohort must produce both outcomes");
  assert.equal(g.clubs[offer.data.club].league,"KOR1");
  assert.equal(g.clubs.length,clubCount);
  assert.ok(offer.data.wage<1000000,"annual wage uses the engine currency unit");
  const draftCount=g.inbox.length;
  engine.callupKoreanDraft(g,g.week);
  assert.equal(g.inbox.length,draftCount);
  for(const item of g.inbox.filter(item=>item.data?.draft)) engine.Cn(g,item.id,0);
  assert.ok(Object.keys(g.agency.clients).some(id=>id!=player.id&&g.players[id].club>=0),"a first contract registers a draftee");
  console.log("PASS C2 signed prospects only, drafted and undrafted, one first registration");

  const injuredWeek=g.week;
  engine.offlineCheat(g,"supportInjuryTest",player.id,new FormData(),"KRW");
  const support=g.inbox.find(item=>item.ev==="support"&&item.pid===player.id);
  assert.equal(support?.tier,"unique");
  const money=g.agency.money;
  g.agency.money=0;
  engine.Cn(g,support.id,0);
  assert.ok(!support.done,"unaffordable decision remains available");
  g.agency.money=money+1000000;
  const funded=g.agency.money;
  engine.Cn(g,support.id,0);
  engine.Cn(g,support.id,0);
  assert.equal(g.agency.money,funded-support.data.cost);
  assert.equal(g.agency.ledger.at(-1).amt,-support.data.cost);
  assert.equal(player._supportReview,injuredWeek+4);
  engine.callupSupportReport(g,injuredWeek+3);
  assert.ok(!g.inbox.some(item=>item.ev==="supportReport"));
  engine.callupSupportReport(g,injuredWeek+4);
  engine.callupSupportReport(g,injuredWeek+4);
  assert.equal(g.inbox.filter(item=>item.ev==="supportReport").length,1);
  engine.offlineCheat(g,"supportFormTest",player.id,new FormData(),"KRW");
  const form=g.inbox.find(item=>item.ev==="support"&&item.data?.support==="form"&&item.pid===player.id);
  assert.equal(form?.tier,"rare");
  const moneyBeforeDecline=g.agency.money;
  engine.Cn(g,form.id,1);
  assert.equal(g.agency.money,moneyBeforeDecline);
  console.log("PASS C3 charge once, delayed review, insufficient funds, decline");

  const twFilter={region:"TW",pos:"ANY",ageMax:23,tier:0,grade:"all",age:"base"};
  assert.deepEqual(engine.cE(1,"AS"),["KR","JP","TW","US"]);
  assert.equal(engine.nU(g,twFilter),null);
  const trip=g.agency.missions.at(-1);
  g.week=trip.back;
  engine.V9(g,undefined,trip);
  const report=g.inbox.findLast(item=>item.kind==="scout");
  const candidates=Object.entries(report.data).filter(([key])=>/^p\d+$/.test(key)).map(([,id])=>id);
  assert.ok(candidates.length,"Taiwan report has candidates");
  assert.ok(candidates.every(id=>engine.callupScoutMatch(g,g.players[id],"TW")));
  g.agency.callupBaseball1=true;
  const loaded=engine.offlineParseSave(engine.vI(g));
  assert.equal(loaded.inbox.find(item=>item.id===report.id).sf.region,"TW");
  assert.deepEqual(loaded.inbox.find(item=>item.id===report.id).data,report.data);

  const free=engine.Qe(g,engine.ke(g,"foreign"),engine.ke(g,"foreign-traits"),{club:-1,pos:"P",age:23,nat:"미국",ovr:70});
  sign(free);
  const proposals=["미국","일본","대만"].map(country=>{
    const target=g.clubs.find(team=>team.country===country&&engine.Xd(g,team)<engine.Jd(team));
    assert.ok(target);
    return engine.Ge(g,engine.ke(g,"proposal",target.id),free,target,g.week,true);
  });
  assert.ok(proposals.every(Boolean));
  const deals=proposals.map(item=>engine.Ap(g,item));
  for(let i=0;i<deals.length;i++) deals[i].offer=proposals[i].data.wage;
  const ledger=g.agency.ledger.length;
  engine.GT(g,deals[1],engine.ke(g,"register"),0);
  assert.equal(free.club,proposals[1].data.club);
  assert.ok(proposals.every(item=>item.done));
  engine.GT(g,deals[2],engine.ke(g,"register-again"),0);
  assert.equal(free.club,proposals[1].data.club);
  assert.equal(g.agency.ledger.length,ledger+1);
  assert.equal(g.agency.ledger.at(-1).amt,Math.round(deals[1].sum.commission));

  const referral=engine.Qe(g,engine.ke(g,"referral"),engine.ke(g,"referral-traits"),{club:-1,pos:"P",age:24,nat:"미국",ovr:67});
  sign(referral);
  g.agency.clients={[referral.id]:g.agency.clients[referral.id]};
  const taiwan=g.clubs[proposals[2].data.club];
  const starter=taiwan.squad.map(id=>g.players[id]).find(p=>p.pos==="P");
  starter.pt=.8;
  starter.inj={severe:true,weeks:8};
  engine.callupTaiwanReferrals(g,g.week);
  const opening=g.inbox.findLast(item=>item.ev==="twReferral");
  assert.equal(opening?.pid,referral.id);
  engine.Cn(g,opening.id,0);
  const next=g.week+1;
  assert.equal(g.agency.twReferral.due,next);
  engine.callupTaiwanReferrals(g,g.week);
  assert.ok(!g.inbox.some(item=>item.kind==="offer"&&item.pid===referral.id));
  g.week=next;
  engine.callupTaiwanReferrals(g,g.week);
  const twOffer=g.inbox.find(item=>item.kind==="offer"&&item.pid===referral.id);
  assert.equal(twOffer?.data.club,taiwan.id);
  const blocked=engine.Ap(g,twOffer);
  referral.mil=3;
  blocked.offer=twOffer.data.wage;
  engine.GT(g,blocked,engine.ke(g,"ineligible"),0);
  assert.equal(blocked.state,"walked");
  assert.equal(referral.club,-1);
  assert.match(blocked.result,/자격/);
  referral.mil=1;
  const newOffer=engine.Ge(g,engine.ke(g,"budget"),referral,taiwan,g.week,true);
  const failedBudget=engine.Ap(g,newOffer);
  failedBudget.fee=engine.Ct(taiwan)+1;
  failedBudget.offer=newOffer.data.wage;
  engine.GT(g,failedBudget,engine.ke(g,"no-budget"),0);
  assert.equal(failedBudget.state,"walked");
  assert.match(failedBudget.result,/예산/);
  const fullOffer=engine.Ge(g,engine.ke(g,"full"),referral,taiwan,g.week,true);
  const failedSlot=engine.Ap(g,fullOffer);
  while(engine.Xd(g,taiwan)<engine.Jd(taiwan)){
    const occupant=engine.Qe(g,engine.ke(g,"foreign-slot",g.nextPid),engine.ke(g,"slot-traits"),{club:taiwan.id,pos:"P",age:25,nat:"미국",ovr:60});
    taiwan.squad.push(occupant.id);
  }
  failedSlot.offer=fullOffer.data.wage;
  engine.GT(g,failedSlot,engine.ke(g,"no-slot"),0);
  assert.equal(failedSlot.state,"walked");
  assert.match(failedSlot.result,/자리/);
  assert.equal(referral.club,-1);
  console.log("PASS C4 scout reload, overseas comparison and single fee, Taiwan vacancy recommendation and eligibility rejection");

  const snapshot={week:21,years:0,clients:{}};
  const gate={week:22,agency:{years:[]},inbox:[]};
  assert.equal(engine.EU(gate,snapshot),false);
  for(const item of [
    {ev:"draftMiss",tier:"rare"},{data:{draft:1},tier:"unique"},{data:{seasonEnd:1},tier:"unique"},
    {ev:"support",tier:"rare"},{ev:"supportReport",tier:"mid"},{ev:"twReferral",tier:"rare"},{kind:"offer",tier:"common"}
  ]) {
    gate.inbox=[{...item,w:21}];
    assert.equal(engine.EU(gate,snapshot),true);
    gate.inbox[0].done=true;
    assert.equal(engine.EU(gate,snapshot),false);
  }
  const shell=fs.readFileSync(shellFile,"utf8");
  const manual=shell.match(/const _cgBlock=_cgAll\.filter\((.+?)\);if\(_cgBlock\.length\)/)?.[1];
  assert.ok(manual,"Phase UI manual stop rule");
  const blocks=new Function("return "+manual)();
  assert.equal(blocks({ev:"support",tier:"unique"}),true);
  assert.equal(blocks({ev:"support",tier:"rare"}),false);
  assert.equal(blocks({ev:"supportReport",tier:"mid"}),false);
  console.log("PASS C5 arrival stops, unique manual gate, rare informational return");

  let extraHalfInnings=0;
  const scoreless={poisson:()=>{extraHalfInnings++;return 0;},chance:()=>true};
  assert.deepEqual(engine.callupExtraInning(scoreless,2,2,0,false,11),[2,2]);
  assert.equal(extraHalfInnings,4,"KBO regular season ends after eleven innings");
  assert.deepEqual(engine.callupExtraInning(scoreless,2,2,0,true),[3,2]);
  const legacyLeader={w:12,l:12,d:4,gf:40,ga:30,pts:70};
  const pctLeader={w:10,l:7,d:8,gf:30,ga:40,pts:12};
  assert.equal(engine.Sr([legacyLeader,pctLeader])[0],pctLeader,"rank by win percentage without draws");

  const fixture=engine.V5({agent:"QA",nat:"대한민국",agencyName:"CallUp QA",lang:"ko"},20261125,71).g;
  const [home,away,...rest]=fixture.clubs.filter(team=>team.league==="KOR1");
  const rng=new engine.sx(123);
  const lineup=engine.pd(fixture,home,rng,{fresh:true});
  assert.equal(lineup.length,9);
  assert.equal(lineup.filter(player=>player.pos==="P").length,1);
  const row=team=>({club:team.id,p:0,w:0,l:0,d:0,gf:0,ga:0,pts:0});
  const homeRow=row(home),awayRow=row(away);
  const [runs,allowed]=engine.xa(fixture,rng,home,away,new Map([[home.id,homeRow],[away.id,awayRow]]));
  assert.equal(homeRow.p,1);
  assert.equal(homeRow.w+homeRow.l+homeRow.d,homeRow.p);
  assert.equal(homeRow.gf,runs);
  assert.equal(homeRow.ga,allowed);
  const roster=home.squad.map(id=>fixture.players[id]);
  assert.equal(roster.reduce((sum,player)=>sum+player.st.rbi,0),runs);
  assert.ok(roster.reduce((sum,player)=>sum+player.st.h,0)>=runs);
  const [topHits,topRbi]=roster.filter(player=>player.pos!=="P");
  topHits.st.h=91;topHits.st.rbi=0;
  topRbi.st.h=10;topRbi.st.rbi=80;
  fixture.leagues.KOR1.table=[homeRow,awayRow,...rest.map(row)];
  engine.T8(fixture,engine.j.KOR1,fixture.week);
  assert.ok(topHits.honors.some(honor=>honor.endsWith("안타왕")));
  assert.ok(topRbi.honors.some(honor=>honor.endsWith("타점왕")));
  console.log("PASS baseball lineup, scored runs, standings, extra innings and batting awards");
}
run().catch(error=>{ console.error(error.message); console.error(error.stack?.split("\n").filter(line=>!line.includes("data:text")).slice(0,4).join("\n")); process.exitCode=1; });
