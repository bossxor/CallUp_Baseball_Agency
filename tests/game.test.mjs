import {test} from "node:test";
import assert from "node:assert/strict";
import {act, advance, createState, parseSave, step} from "../dist/game.js";

test("dispatch persists and a report stops multi-week progress",()=>{
  const first=act(createState(),{type:"dispatch",market:"대만"});
  assert.equal(first.money,13800000);
  assert.throws(()=>act(first,{type:"dispatch",market:"한국"}));
  const restored=parseSave(JSON.stringify(first));
  const states=advance(restored,4);
  assert.equal(states.length,3);
  assert.equal(states.at(-1).reports.length,1);
  assert.equal(states.at(-1).week,4);
  assert.deepEqual(advance(first,4),states);
});

test("report page and candidate snapshot survive reload",()=>{
  let state=advance(act(createState(),{type:"dispatch",market:"한국"}),4).at(-1);
  const report=state.reports[0];
  assert.ok(report.candidates.length);
  state=act(state,{type:"page",reportId:report.id,page:report.candidates.length-1});
  const restored=parseSave(JSON.stringify(state));
  assert.deepEqual(restored.reports,state.reports);
  assert.equal(step(state).state.reports.length,1);
});

test("meeting and client contract execute once and expire",()=>{
  let state=advance(act(createState(),{type:"dispatch",market:"한국"}),4).at(-1);
  const id=state.reports[0].candidates[0].player.id;
  state=act(state,{type:"meeting",playerId:id});
  state=act(state,{type:"meeting",playerId:id});
  assert.equal(state.meetings.length,1);
  state=step(state).state;
  const open=state;
  const matter=state.matters[0];
  assert.equal(advance(state,4).length,1);
  state=act(state,{type:"sign",matterId:matter.id});
  state=act(state,{type:"sign",matterId:matter.id});
  assert.deepEqual(state.clients,[id]);
  let expired=open;
  for(let index=0;index<3;index++) expired=step(expired).state;
  assert.equal(expired.matters[0].done,true);
  assert.equal(act(expired,{type:"sign",matterId:matter.id}).clients.length,0);
});

test("quiet weeks and empty report remain usable",()=>{
  const quiet=advance(createState(),4);
  assert.equal(quiet.length,4);
  assert.ok(quiet.every(state=>state.reports.length===0 && state.matters.length===0));
  let empty;
  for(let seed=1;seed<100;seed++) {
    const result=advance(act(createState("QA",seed),{type:"dispatch",market:"일본"}),4).at(-1);
    if(result.reports[0].candidates.length===0) {empty=result;break;}
  }
  assert.ok(empty);
  assert.equal(parseSave(JSON.stringify(empty)).reports[0].page,0);
  assert.throws(()=>parseSave('{"version":8}'));
  const broken=createState();
  broken.clients=["missing"];
  assert.throws(()=>parseSave(JSON.stringify(broken)));
});

test("two club replies, counteroffer and registration survive reopening without duplicate fees",()=>{
  const legacy=createState();
  delete legacy.clubDeals;
  legacy.clients.push("us-1");
  let state=parseSave(JSON.stringify(legacy));
  const recommend=clubId=>({type:"recommend",clubId,playerId:"us-1"});
  state=act(state,recommend("tainan"));
  state=act(state,recommend("tainan"));
  state=act(state,recommend("nagoya"));
  assert.equal(state.clubDeals.offers.length,2);
  let weeks=advance(state,4);
  assert.equal(weeks.length,1);
  state=weeks[0];
  const taiwan=state.clubDeals.offers.find(item=>item.clubId==="tainan");
  assert.equal(taiwan.status,"open");
  state=act(state,{type:"counter",offerId:taiwan.id,salary:176000000});
  state=step(parseSave(JSON.stringify(state))).state;
  const japan=state.clubDeals.offers.find(item=>item.clubId==="nagoya");
  assert.equal(japan.status,"open");
  assert.equal(state.clubDeals.offers[0].salary,176000000);
  assert.throws(()=>act(state,{type:"accept-offer",offerId:japan.id}),/선수/);
  const money=state.money;
  state=act(state,{type:"accept-offer",offerId:taiwan.id});
  assert.equal(state.clubDeals.offers[1].status,"closed");
  assert.equal(state.clubDeals.contract.status,"pending");
  assert.equal(state.money,money);
  state=step(parseSave(JSON.stringify(state))).state;
  assert.equal(state.clubDeals.contract.status,"registered");
  assert.equal(state.money,money+8800000);
  state=act(state,{type:"accept-offer",offerId:taiwan.id});
  assert.equal(step(parseSave(JSON.stringify(state))).state.money,money+8800000);
});

test("eligibility, occupied slots, counter limits and deadline protect the deal",()=>{
  const fresh=createState();
  assert.throws(()=>act(fresh,{type:"recommend",clubId:"tainan",playerId:"us-1"}),/고객/);
  fresh.clients.push("us-1","kr-1");
  assert.throws(()=>act(fresh,{type:"recommend",clubId:"tainan",playerId:"kr-1"}),/자유계약/);
  assert.throws(()=>act(fresh,{type:"recommend",clubId:"taichung",playerId:"us-1"}),/자리/);
  let state=step(act(fresh,{type:"recommend",clubId:"tainan",playerId:"us-1"})).state;
  const offerId=state.clubDeals.offers[0].id;
  assert.throws(()=>act(state,{type:"counter",offerId,salary:Number.NaN}),/연봉/);
  state=act(state,{type:"counter",offerId,salary:300000000});
  state=step(state).state;
  assert.equal(state.clubDeals.offers[0].reply,"declined");
  assert.throws(()=>act(state,{type:"counter",offerId,salary:176000000}),/한 번/);
  while(state.week<=state.clubDeals.offers[0].deadline) state=step(state).state;
  assert.throws(()=>act(state,{type:"accept-offer",offerId}),/기한/);
  state.clubDeals.offers[0].salary=-1;
  assert.throws(()=>parseSave(JSON.stringify(state)),/협상/);
});


test("first introduction and one-week follow-up preserve the original report and charge once",()=>{
  let state=act(createState(),{type:"introduction"});
  assert.equal(act(state,{type:"introduction"}).reports.length,1);
  const prior=structuredClone(state.reports[0]);
  const follow={type:"follow-up",playerId:"kr-1"};
  assert.throws(()=>act(state,{type:"follow-up",playerId:"tw-2"}));
  assert.throws(()=>act({...state,money:299999},follow));
  assert.throws(()=>act(act(state,{type:"dispatch",market:"미국"}),follow));
  state=act(state,follow);
  assert.throws(()=>act(state,{type:"dispatch",market:"미국"}));
  assert.equal(act(state,follow).money,14700000);
  const next=advance(parseSave(JSON.stringify(state)),4);
  assert.equal(next.length,1);
  state=parseSave(JSON.stringify(next[0]));
  assert.deepEqual(state.reports[0],prior);
  const refined=state.reports[1].candidates[0], original=prior.candidates[0];
  assert.ok(refined.low>original.low && refined.high<original.high);
  assert.notEqual(refined.player.opinion,original.player.opinion);
  assert.deepEqual(act(state,follow),state);
  assert.equal(act(state,{type:"meeting",playerId:"kr-1"}).meetings.length,1);
});

test("Korean fixtures drive standings, batting and promotion across reloads and season boundaries",async()=>{
  const {calendar,koreaSeason,tierAt}=await import("../dist/korea.js");
  let state=createState();
  state.clients.push("kr-1");
  const start=structuredClone(state);
  let registered=false;
  for(let i=0;i<52;i++){
    const last=state.week;
    const result=step(state);
    state=parseSave(JSON.stringify(result.state));
    for(const tier of ["1군","2군"]){
      const {games,wins,draws,batting}=koreaSeason(state.seed,state.week,state.domestic,tier);
      assert.equal(wins[0]+wins[1]+draws,games.length);
      assert.equal(wins[0],games.filter(g=>g.runs[0]>g.runs[1]).length);
      assert.equal(batting.hits,games.reduce((sum,g)=>sum+g.batting.hits,0));
      assert.ok(batting.bases>=batting.hits && batting.hits+batting.walks<=batting.pa);
      for(const g of games) assert.equal(g.batting.pa>0,tier===tierAt(state.domestic,g.week));
    }
    if(state.domestic.promotionWeek===state.week){
      assert.equal(result.important,true);
      const b=koreaSeason(state.seed,last,state.domestic,"2군").batting;
      assert.ok(b.pa-b.walks>=16 && b.hits/(b.pa-b.walks)>=.3);
      registered=true;
    }
  }
  assert.ok(registered);
  assert.equal(calendar(state.week).season,2);
  assert.equal(koreaSeason(state.seed,state.week,state.domestic,"1군").games.length,0);
  let bulk=start;
  while(bulk.week<state.week) bulk=advance(bulk,Math.min(4,state.week-bulk.week)).at(-1);
  assert.deepEqual(bulk,state);
  const legacy={...start,week:15};
  delete legacy.domestic;
  const migrated=parseSave(JSON.stringify(legacy));
  assert.equal(koreaSeason(migrated.seed,15,migrated.domestic,"1군").games.length,0);
  assert.equal(koreaSeason(migrated.seed,16,step(migrated).state.domestic,"1군").games.length,1);
});

test("season renewal pauses the calendar, survives reload, and pays once at registration",()=>{
  let state=createState();
  state.clients.push("kr-1");
  while(state.week<33) state=step(state).state;
  const calendar=advance(state,4);
  state=calendar.at(-1);
  assert.equal(state.week,36);
  assert.equal(state.domestic.renewals[0].status,"open");
  assert.equal(advance(state,4).length,1);
  const initial=state.domestic.renewals[0].salary;
  state=act(state,{type:"renewal-counter",season:1,raise:10});
  assert.throws(()=>act(state,{type:"renewal-accept",season:1}));
  state=advance(parseSave(JSON.stringify(state)),4).at(-1);
  assert.equal(state.week,37);
  assert.ok(state.domestic.renewals[0].salary>initial);
  assert.throws(()=>act(state,{type:"renewal-counter",season:1,raise:10}));
  const accept={type:"renewal-accept",season:1};
  const money=state.money;
  state=act(state,accept);
  assert.deepEqual(act(state,accept),state);
  while(state.week<52) state=step(state).state;
  assert.equal(state.money,money);
  state=step(parseSave(JSON.stringify(state))).state;
  assert.equal(state.domestic.renewals[0].status,"registered");
  assert.equal(state.money,money+Math.floor(state.domestic.renewals[0].salary/20));
  assert.equal(step(parseSave(JSON.stringify(state))).state.money,state.money);
  const damaged=structuredClone(state);
  damaged.domestic.renewals[0].salary++;
  assert.throws(()=>parseSave(JSON.stringify(damaged)),/연봉 협상/);
  while(state.week<88) state=step(state).state;
  assert.deepEqual(state.domestic.renewals.map(({season,status})=>[season,status]),[[1,"registered"],[2,"open"]]);
  assert.deepEqual(parseSave(JSON.stringify(state)),state);
});

test("renewal preserves baseline after an ambitious counter and respects the deadline",()=>{
  let state=createState();
  while(state.week<35) state=step(state).state;
  assert.equal(step(state).state.domestic.renewals.length,0);
  state.clients.push("kr-1");
  state=step(state).state;
  const initial=state.domestic.renewals[0].salary;
  assert.throws(()=>act(state,{type:"renewal-counter",season:1,raise:40}));
  state=step(act(state,{type:"renewal-counter",season:1,raise:25})).state;
  assert.equal(state.domestic.renewals[0].status,"open");
  assert.equal(state.domestic.renewals[0].salary,initial);
  while(state.week<39) state=step(state).state;
  assert.throws(()=>act(state,{type:"renewal-counter",season:1,raise:10}));
  const expired=step(state).state;
  assert.equal(expired.domestic.renewals[0].status,"expired");
  assert.throws(()=>act(expired,{type:"renewal-accept",season:1}));
  const declined=act(state,{type:"renewal-decline",season:1});
  assert.equal(declined.domestic.renewals[0].status,"declined");
  assert.equal(step(declined).state.money,state.money);
  delete state.domestic.renewals;
  assert.deepEqual(parseSave(JSON.stringify(state)).domestic.renewals,[]);
});
