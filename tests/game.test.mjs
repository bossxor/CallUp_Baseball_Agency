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
