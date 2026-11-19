import {act, advance, createState, hasPendingDecision, markets, missionCost, missionWeeks, parseSave, players,
  type Command, type Market, type Player, type State} from "./game.js";
import {clubs, freeAgentId, playerAgrees, type ClubId} from "./club-deals.js";

const root = document.querySelector<HTMLDivElement>("#app")!;
const saveKey = "callup-save-v1";
type Tab = "office" | "players" | "scout" | "market" | "deals";
let state = createState();
let tab:Tab = "office";
let market:Market = "한국";
let reportId:string | null = null;
let notice = "";
let error = "";
let busy = false;
let started = false;
let hasSave = false;
let recovery = false;
let showHistory = false;
let noticeTimer:number | undefined;
try {
  const saved = localStorage.getItem(saveKey);
  if (saved) {state = parseSave(saved); hasSave = true;}
} catch {
  recovery = true;
  error = "저장 데이터를 열지 못했습니다. 원본을 파일로 보관한 뒤 새로 시작할 수 있습니다.";
}
const escape = (value:unknown) => String(value).replace(/[&<>"']/g, char =>
  ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]!));
const money = (value:number) => new Intl.NumberFormat("ko-KR").format(value)+"원";
const weekDate = (week:number) => new Date(Date.UTC(2026,2,2)+(week-1)*7*86400000);
const date = (week:number) => new Intl.DateTimeFormat("ko-KR",{month:"long",day:"numeric",timeZone:"UTC"}).format(weekDate(week));
const button = (text:string, action:string, extra="", disabled=false, style="") =>
  `<button type="button" data-action="${action}" ${extra} ${disabled?"disabled":""} class="${style}">${text}</button>`;
function commit(next:State):void {
  localStorage.setItem(saveKey,JSON.stringify(next));
  state = next;
}
function playerLine(player:Player):string {
  return `<span class="player-meta">${escape(player.age)}세 · ${escape(player.position)} · ${escape(player.club)} ${escape(player.level)}</span>`;
}
function currentPlayerLine(player:Player):string {
  if (player.id!==freeAgentId) return playerLine(player);
  const contract=state.clubDeals.contract;
  const affiliation=contract?.status==="registered" ? clubs[contract.clubId].name+" 1군" : "자유계약 · 미국 마이너 출신";
  return `<span class="player-meta">${player.age}세 · ${escape(player.position)} · ${affiliation}</span>`;
}
function portrait(player:Player, style:string):string {
  return `<span class="${style} portrait-photo ${escape(player.id)}" aria-hidden="true"></span>`;
}
function playerCard(player:Player, label:string):string {
  return `${portrait(player,"pass-photo")}<span class="pass-data"><small>${label} · ${escape(player.market)}</small>
    <strong>${escape(player.name)}</strong>${currentPlayerLine(player)}<span class="pass-record">${escape(player.line)}</span></span>`;
}
function office():string {
  const pending = state.matters.filter(item=>!item.done).sort((a,b)=>a.due-b.due);
  const arrived = state.reports.filter(report=>report.week===state.week);
  const mission = state.missions[0];
  const openOffers=state.clubDeals.offers.filter(offer=>offer.status==="open").length;
  const featured=players.find(player=>state.clients.includes(player.id));
  return `<section class="office-title" aria-label="사무실">
      <p class="week-strip">${weekDate(state.week).getUTCFullYear()} 시즌</p><h1>${state.week}<small>주차</small></h1>
      <p class="hero-date">${date(state.week)} 월요일</p></section>
    <section class="agenda"><div class="section-title"><h2>이번 주 업무</h2></div>
      ${pending.map(item=>`<article class="matter"><p class="deadline">${item.due===state.week?"이번 주 마감":(item.due-state.week)+"주 뒤 마감"}</p>
        <h3>${escape(item.title)}</h3><p>${escape(item.body)}</p>
        <div class="actions">${button("고객 계약","sign",`data-id="${item.id}"`,false,"primary")}
        ${button("거절","decline",`data-id="${item.id}"`,false,"quiet")}</div></article>`).join("")}
      ${openOffers ? button(`구단 제안 ${openOffers}건 비교`,"tab",'data-tab="deals"',false,"primary full") : ""}
      ${arrived.map(report=>button(`<span><b>${report.market} 스카우트 보고서</b><small>후보 ${report.candidates.length}명 · 이번 주 도착</small></span><span>열기 ›</span>`,
        "report",`data-id="${report.id}"`,false,"office-action")).join("")}
      ${pending.length || openOffers || arrived.length ? "" : button(`<span><b>${mission ? mission.market+" 조사 중" : "스카우트 파견"}</b>
        <small>${mission ? date(mission.due)+" 복귀 예정" : "국내외에서 새 선수를 발굴하세요."}</small></span><span>${mission ? "현황" : "지역 선택"} ›</span>`,"tab",'data-tab="scout"',false,"office-action")}
      ${state.meetings.map(item=>`<p class="task-line">${escape(players.find(player=>player.id===item.playerId)!.name)} 면담 답변 · ${date(item.due)} 예정</p>`).join("")}
    </section>
    <section class="roster-desk"><div class="section-title"><h2>담당 선수</h2>${button(`선수 명단 ${state.clients.length}/3 ›`,"tab",'data-tab="players"',false,"section-link")}</div>
      ${featured ? button(playerCard(featured,"담당 고객"),"tab",'data-tab="players"',false,"player-pass") :
        `<p class="empty">보고서에서 선수를 만나 첫 고객 계약을 맺으세요.</p>`}
    </section>
    <section><div class="section-title"><h2>이번 주 소식</h2></div>
      <p class="weekly-note">${escape(state.summaries[0]?.text ?? "")}</p>
    </section>
    <details ${showHistory?"open":""} id="history"><summary>지난 주 업무 기록</summary>
      ${state.summaries.slice(1).map(item=>`<p><b>${item.week}주차</b> ${escape(item.text)}</p>`).join("") ||
        "<p>첫 주의 업무 기록이 여기에 쌓입니다.</p>"}</details>`;
}
function scout():string {
  const running = state.missions[0];
  const selected = running?.market ?? market;
  return `<header class="page-title"><h1>스카우트</h1></header>
    <section class="dispatch"><h2>${running ? "파견 현황" : "조사 지역"}</h2>
      <div class="regions" role="group" aria-label="조사 지역">${markets.map(item=>button(item,"region",
        `data-market="${item}" aria-pressed="${selected===item}"`,!!running,selected===item?"chosen":"")).join("")}</div>
      <dl class="route-terms"><div><dt>조사 비용</dt><dd>${money(missionCost(selected))}</dd></div>
      <div><dt>${running?"복귀 예정":"예상 기간"}</dt><dd>${running?date(running.due):missionWeeks(selected)+"주"}</dd></div></dl>
      ${running ? `<p class="route-state">${running.market} 조사 중 · 복귀까지 ${running.due-state.week}주</p>` :
        button(state.money<missionCost(selected)?"파견 비용 부족":selected+" 스카우트 파견","dispatch","",state.money<missionCost(selected),"primary full")}
    </section>
    <section><div class="section-title"><h2>도착한 보고서</h2><span>${state.reports.length}건</span></div>
      ${state.reports.slice().reverse().map(report=>button(
        `${report.candidates[0] ? portrait(report.candidates[0].player,"report-thumb") : ""}<span class="report-copy"><small>${date(report.week)} · 관찰 기록</small><b>${report.market} 스카우트 보고서</b><small>후보 ${report.candidates.length}명 · ${report.page+1}장부터 이어 읽기</small></span><span aria-hidden="true">↗</span>`,
        "report",`data-id="${report.id}"`,false,"report-row")).join("") ||
        '<p class="empty">첫 파견이 끝나면 조사 당시의 기록과 의견을 보관합니다.</p>'}
    </section>`;
}
function myPlayers():string {
  const selected = players.filter(player=>state.clients.includes(player.id) || state.interests.includes(player.id));
  return `<header class="page-title"><h1>내 선수</h1><p>고객 ${state.clients.length}명 · 관심 선수 ${state.interests.length}명</p></header>
    ${selected.map(player=>{
      const client=state.clients.includes(player.id);
      const latest=state.reports.slice().reverse().find(report=>report.candidates.some(candidate=>candidate.player.id===player.id));
      return `<article class="roster-entry"><div class="player-pass">${playerCard(player,client?"담당 고객":"관심 선수")}</div>
        <div class="contract-strip">${client ? "<span>계약 2년 · 수수료 5%</span>" : ""}
          ${latest ? button("관찰 기록 열기","report",`data-id="${latest.id}" data-player="${player.id}"`,false,"section-link") : ""}
          ${client && player.id===freeAgentId ? button("구단 협상","tab",'data-tab="deals"',false,"section-link") : ""}</div></article>`;
    }).join("") ||
      `<section class="empty"><h2>첫 인연을 기다립니다.</h2><p>스카우트 보고서에서 관심 등록이나 면담을 요청하세요.</p>
      ${button("스카우트로 이동","tab",'data-tab="scout"',false,"primary")}</section>`}`;
}
function marketPage():string {
  return `<header class="page-title"><h1>시장</h1><p>가상 선수와 소속 현황</p></header>
    ${markets.map(item=>`<section class="market-section"><div class="section-title"><h2>${item}</h2><span>${item==="미국"?"마이너":"현지 관찰"}</span></div>
      ${players.filter(player=>player.market===item).map(player=>`<article class="market-player">${portrait(player,"portrait")}
        <div><h3>${player.name}</h3>${currentPlayerLine(player)}<p class="record">${player.line}</p></div></article>`).join("")}</section>`).join("")}
    `;
}
function dealsPage():string {
  const {offers,contract}=state.clubDeals;
  const eligible=state.clients.includes(freeAgentId);
  const labels={waiting:"구단 회신 대기",open:"응답 가능",counter:"역제안 회신 대기",expired:"기한 만료",closed:"다른 구단 계약으로 종료",accepted:"계약 확정"};
  const player=players.find(player=>player.id===freeAgentId)!;
  return `<header class="page-title"><h1>구단 협상</h1></header>
    <div class="player-pass">${playerCard(player,eligible?"담당 고객":"협상 대상")}</div>
    <p class="contract-strip">선발 선호 · 불펜 희망 연봉 2억 4,500만 원 이상</p>
    ${contract ? `<section class="deal-card"><p class="deadline">${contract.status==="pending" ? "등록 대기 · "+contract.registrationWeek+"주차 등록 예정" : "등록 완료"}</p>
      <h2>${clubs[contract.clubId].name}</h2><p>보장 연봉 ${money(contract.salary)} · ${clubs[contract.clubId].years}년</p>
      <p>수수료 ${money(contract.fee)} · ${contract.status==="pending" ? "등록 시 입금" : "입금 완료"}</p></section>` : ""}
    ${!eligible ? `<p class="small">미국에서 마커스 리드를 스카우트하고 고객 계약을 맺으면 구단에 추천할 수 있습니다.</p>
      ${button("미국 스카우트","tab",'data-tab="scout" data-market="미국"',false,"secondary full")}` : ""}
    ${offers.length ? `<section><div class="section-title"><h2>구단 제안 비교</h2></div>
      ${offers.slice().reverse().map(offer=>{
        const club=clubs[offer.clubId];
        const agrees=playerAgrees(offer);
        const visible=offer.status!=="waiting" && !(offer.status==="closed" && offer.replyWeek>state.week && offer.requestedSalary===null);
        return `<article class="deal-card"><p class="deadline">${labels[offer.status]}</p><h3>${club.name}</h3>
          ${visible ? `<dl class="terms">
            <div><dt>보장 연봉</dt><dd>${money(offer.salary)}</dd></div>
            <div><dt>현지 통화</dt><dd>약 ${Math.round(offer.salary/club.rate).toLocaleString("ko-KR")} ${club.currency}</dd></div>
            <div><dt>기간 · 역할</dt><dd>${club.years}년 · ${club.role}</dd></div>
            <div><dt>응답 마감</dt><dd>${offer.deadline}주차</dd></div></dl>` :
            `<p class="small">${offer.status==="waiting" ? offer.replyWeek+"주차 회신 예정" : "회신 전에 협상이 종료됐습니다."}</p>`}
          ${offer.status==="counter" ? `<p class="small">${money(offer.requestedSalary!)} 요청 · ${offer.replyWeek}주차 회신 예정</p>` : ""}
          ${offer.reply!=="none" ? `<p class="small">${offer.reply==="improved" ? "구단이 요청 연봉을 받아들였습니다." : "구단이 역제안을 거절했습니다. 기존 조건으로 결정할 수 있습니다."}</p>` : ""}
          ${offer.status==="open" ? `<p class="small">${agrees ? "선수가 현재 조건에 동의합니다." : "선수가 현재 조건을 거절했습니다."}</p>
            ${button("계약 확정","accept-offer",`data-id="${offer.id}"`,!agrees,"primary full")}
            ${offer.requestedSalary===null && offer.deadline>state.week ? `<form class="counter-form" data-offer="${offer.id}">
              <label for="salary-${offer.id}">역제안할 연봉 (원)</label>
              <div><input type="number" inputmode="numeric" name="salary" id="salary-${offer.id}" required min="${offer.salary+1}" max="1000000000" value="${Math.floor(offer.salary*1.1)}">
              <button class="secondary">역제안</button></div></form>` : ""}` : ""}</article>`;
      }).join("")}</section>` : ""}
    ${!contract ? `<section><div class="section-title"><h2>구단 수요</h2></div>
      ${Object.entries(clubs).map(([id,club])=>{
        const sent=offers.some(offer=>offer.clubId===id && offer.status!=="expired");
        return `<div class="deal-club"><div><b>${club.name}</b><small>${club.market} · ${club.role} · 외국인 자리 ${club.slots ? "1석" : "마감"}</small></div>
          ${button(sent?"추천 완료":"추천","recommend",`data-id="${id}"`,!eligible || !club.slots || sent,"secondary")}</div>`;
      }).join("")}</section>` : ""}`;
}
function report():string {
  const item = state.reports.find(item=>item.id===reportId);
  if (!item) {reportId = null; return "";}
  const candidate = item.candidates[item.page];
  const player = candidate?.player;
  const requested = player && (state.meetings.some(meeting=>meeting.playerId===player.id) ||
    state.matters.some(matter=>matter.playerId===player.id && !matter.done));
  return `<div class="report-view"><header class="report-top">${button(tab==="scout"?"스카우트로":tab==="players"?"선수 명단으로":"사무실로","close","",false,"quiet")}
    <span>${item.market} 조사 · ${date(item.week)}</span><span>${item.page+1} / ${Math.max(1,item.candidates.length)}</span></header>
    <article class="paper" aria-label="스카우트 보고서" id="paper" tabindex="-1">
      ${player ? `<div class="player-hero">${portrait(player,"hero-portrait")}
        <div class="player-name"><p>${escape(player.position)}</p><h1>${escape(player.name)}</h1>${playerLine(player)}</div></div>
        <div class="report-body"><section><h2>관찰 기록</h2><p class="record">${escape(player.line)}</p><p class="small">관찰 기간 4주 · 출전량 ${player.appearances}${player.position.includes("투수")?"아웃":"타석"}</p>
          <dl class="estimate"><div><dt>현재 실력 추정</dt><dd>${Math.max(1,player.ability-4)}–${player.ability+4}</dd></div>
          <div><dt>잠재력 추정</dt><dd>${candidate.low}–${candidate.high}</dd></div></dl>
          </section>
        <section class="scout-opinion"><h2>스카우트 의견</h2><p>${escape(player.opinion)}</p></section>
        <div class="report-actions">${button(state.interests.includes(player.id)?"관심 등록됨":"관심 등록","interest",`data-id="${player.id}"`,state.interests.includes(player.id),"secondary")}
        ${button(state.clients.includes(player.id)?"담당 고객":requested?"면담 답변 대기":"면담 요청","meeting",`data-id="${player.id}"`,
          !!requested || state.clients.includes(player.id),"primary")}</div></div>` :
        `<div class="report-body empty-report"><h1>후보 없음</h1><p class="weekly-note">관찰 기간 동안 추천할 만한 후보를 찾지 못했습니다.</p></div>`}
    </article>
    <div class="report-controls" aria-label="보고서 페이지">${button("이전 장","prev","",item.page===0,"quiet")}
      <span aria-live="polite">${item.page+1} / ${Math.max(1,item.candidates.length)}</span>
      ${button("다음 장","next","",item.page>=item.candidates.length-1,"quiet")}</div></div>`;
}
function render():void {
  root.innerHTML = `<div class="shell"><div class="feedback" role="${error?"alert":"status"}" ${error||notice?"":"hidden"}>${escape(error||notice)}</div>
    ${!started ? `<main class="welcome"><header class="title-lockup"><span class="club-mark" aria-hidden="true"></span><h1>콜업</h1><p>야구 에이전시</p></header>
      <div class="start-panel">
      ${recovery ? `<p class="error">저장 데이터를 복구할 수 없습니다.</p>${button("원본 저장 파일 보관","backup","",false,"secondary")}`:""}
      ${hasSave ? `<div class="save-summary"><b>${escape(state.agency)}</b><span>${state.week}주차</span></div>
      ${button("이어하기","continue","",false,"primary full")}` :
      `<form id="start"><label for="agency">에이전시 이름</label><input id="agency" name="agency" required maxlength="24" value="콜업 에이전시" autocomplete="organization">
      <button class="primary full" ${recovery?"disabled":""}>사무실 열기</button></form>`}</div></main>` :
      reportId ? report() : `<header class="masthead">${button("<span class='club-mark' aria-hidden='true'></span>","title",'aria-label="타이틀로 돌아가기"',false,"brand-button")}<div><b>${escape(state.agency)}</b><small>${weekDate(state.week).getUTCFullYear()} · ${state.week}주차</small></div>
      <div class="balance"><small>운영 자금</small><b>${money(state.money)}</b></div></header>
      <main id="content" tabindex="-1">${({office,players:myPlayers,scout,market:marketPage,deals:dealsPage})[tab]()}</main>
      <footer class="dock"><div class="progress-row"><select aria-label="진행할 주 수" id="weeks" ${hasPendingDecision(state)?"disabled":""}>
        <option value="1">1주</option><option value="4">최대 4주</option></select>${button("다음 주 진행","advance","",busy,"primary")}</div>
      <nav aria-label="주요 화면">${([["office","사무실"],["players","내 선수"],["scout","스카우트"],["market","시장"],["deals","협상"]] as const)
        .map(([key,title])=>button(`<span class="nav-icon ${key}" aria-hidden="true"></span>${title}`,"tab",`data-tab="${key}" ${tab===key?'aria-current="page"':""}`,false,tab===key?"active":"")).join("")}</nav></footer>`}
    </div>`;
  window.clearTimeout(noticeTimer);
  if (notice && !error) noticeTimer=window.setTimeout(()=>{
    notice="";
    const feedback=root.querySelector<HTMLElement>(".feedback");
    if (feedback) feedback.hidden=true;
  },4500);
}
async function execute(command:Command):Promise<void> {
  commit(act(state,command));
}
root.addEventListener("submit", event=>{
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  if (form.dataset.offer && !busy) {
    notice=""; error="";
    try {
      commit(act(state,{type:"counter",offerId:form.dataset.offer,salary:Number(new FormData(form).get("salary"))}));
      notice="역제안을 보냈습니다. 다음 주에 회신이 도착합니다.";
    } catch (failure) {error=failure instanceof Error ? failure.message : "역제안을 저장하지 못했습니다.";}
    render();
    return;
  }
  if (form.id!=="start") return;
  try {
    commit(createState(String(new FormData(form).get("agency") ?? "")));
    started = true; hasSave = true; error = ""; render();
  } catch {error="저장 공간에 쓸 수 없습니다. 기기의 저장 공간과 앱 권한을 확인하세요."; render();}
});
root.addEventListener("toggle",event=>{
  if ((event.target as HTMLElement).id==="history") showHistory=(event.target as HTMLDetailsElement).open;
},true);
root.addEventListener("click",async event=>{
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-action]");
  if (!target || target.disabled || busy) return;
  error=""; notice="";
  const action = target.dataset.action;
  const id = target.dataset.id!;
  try {
    switch(action) {
      case "continue": started=true; tab="office"; break;
      case "title": started=false; break;
      case "tab":
        tab=target.dataset.tab as Tab;
        if (target.dataset.market) market=target.dataset.market as Market;
        break;
      case "recommend": await execute({type:"recommend",playerId:freeAgentId,clubId:id as ClubId}); notice="구단에 선수를 추천했습니다."; break;
      case "accept-offer": await execute({type:"accept-offer",offerId:id}); notice="계약을 확정했습니다. 다음 주에 등록합니다."; break;
      case "report": {
        if (target.dataset.player) {
          const item=state.reports.find(report=>report.id===id)!;
          const page=item.candidates.findIndex(candidate=>candidate.player.id===target.dataset.player);
          if (page!==item.page) await execute({type:"page",reportId:id,page});
        }
        reportId=id;
        break;
      }
      case "close": reportId=null; break;
      case "region": market=target.dataset.market as Market; break;
      case "dispatch": await execute({type:"dispatch",market}); notice="파견을 저장했습니다."; break;
      case "interest": await execute({type:"interest",playerId:id}); notice="관심 선수로 등록했습니다."; break;
      case "meeting": await execute({type:"meeting",playerId:id}); notice="면담을 요청했습니다. 다음 주에 답변이 도착합니다."; break;
      case "sign": await execute({type:"sign",matterId:id}); notice="새 고객 계약을 저장했습니다."; break;
      case "decline": await execute({type:"decline",matterId:id}); notice="안건을 마무리했습니다."; break;
      case "prev":
      case "next": {
        const item=state.reports.find(item=>item.id===reportId)!;
        await execute({type:"page",reportId:item.id,page:item.page+(action==="next"?1:-1)});
        break;
      }
      case "advance": {
        const count=Number(root.querySelector<HTMLSelectElement>("#weeks")!.value);
        busy=true;
        render();
        await new Promise(resolve=>requestAnimationFrame(resolve));
        const before=state.week;
        for (const next of advance(state,count)) commit(next);
        notice=`${state.week-before}주 진행했습니다. ${state.week}주차 업무를 저장했습니다.`;
        tab="office";
        break;
      }
      case "backup": {
        const saved=localStorage.getItem(saveKey);
        if (!saved) throw new Error("보관할 데이터가 없습니다.");
        const blob=new Blob([saved],{type:"application/json"});
        const url=URL.createObjectURL(blob);
        const link=document.createElement("a");
        link.href=url; link.download="callup-save-recovery.json"; link.click();
        setTimeout(()=>URL.revokeObjectURL(url),1000);
        notice="원본 파일 다운로드를 요청했습니다.";
        break;
      }
    }
  } catch (failure) {
    error=failure instanceof Error ? failure.message : "처리하지 못했습니다.";
    if (failure instanceof DOMException) error="저장하지 못했습니다. 이전 저장 상태가 유지됩니다. 저장 공간을 확인한 뒤 다시 시도하세요.";
  } finally {
    busy=false;
    render();
    if (action==="region") root.querySelector<HTMLButtonElement>('.regions [aria-pressed="true"]')?.focus({preventScroll:true});
    if (["tab","report","close","next","prev","continue","title","advance"].includes(action!)) {
      root.querySelector<HTMLElement>(reportId?"#paper":"#content")?.focus({preventScroll:true});
      window.scrollTo(0,0);
    }
  }
});
let swipe:{x:number;y:number}|null=null;
root.addEventListener("pointerdown",event=>{
  if ((event.target as HTMLElement).closest("#paper") &&
      !(event.target as HTMLElement).closest("button")) swipe={x:event.clientX,y:event.clientY};
});
root.addEventListener("pointerup",event=>{
  if (!swipe) return;
  const dx=event.clientX-swipe.x, dy=event.clientY-swipe.y;
  swipe=null;
  if (Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.7)
    root.querySelector<HTMLButtonElement>(`[data-action="${dx<0?"next":"prev"}"]`)?.click();
});
root.addEventListener("pointercancel",()=>{swipe=null;});
window.addEventListener("callup-back",()=>{
  if (reportId) root.querySelector<HTMLButtonElement>('[data-action="close"]')?.click();
  else {tab="office"; render();}
});
render();
