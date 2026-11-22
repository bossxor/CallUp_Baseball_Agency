import {coachingCost, type SupportCase} from "./support.js";
import {draftDeadline, draftFee, draftRegistration, draftRound, prospectId} from "./draft.js";
import {battingLine, calendar, domesticPlayer, domesticTeams, koreaSeason, pitchingLine, renewalDeadline, renewalFee, renewalOpeningSalary, renewalRegistration, type Tier} from "./korea.js";
import {act, advance, createState, currentProfile, followUpCost, introId, hasPendingDecision, markets, missionCost, missionWeeks, parseSave, players,
  type Command, type Market, type Player, type State} from "./game.js";
import {clubs, freeAgentId, playerAgrees, type ClubId} from "./club-deals.js";

const root = document.querySelector<HTMLDivElement>("#app")!;
const saveKey = "callup-save-v1";
type Tab = "office" | "players" | "scout" | "market" | "deals" | "finance";
let state = createState();
let tab:Tab = "office";
let financeBack:Tab = "office";
let market:Market = "한국";
let marketView:Market = "한국";
let marketTier:Tier = "1군";
let showLastSeason = false;
let reportId:string | null = null;
let notice = "";
let error = "";
let busy = false;
let started = false;
let hasSave = false;
let recovery = false;
let showHistory = false;
let showCalendar = false;
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
function playerCard(original:Player, label:string):string {
  const player=currentProfile(state,original);
  return `${portrait(player,"pass-photo")}<span class="pass-data"><small>${label} · ${escape(player.market)}</small>
    <strong>${escape(player.name)}</strong>${currentPlayerLine(player)}<span class="pass-record">${escape(player.line)}</span></span>`;
}
function reportName(item:{id:string,playerId?:string, market:Market}):string {
  if (item.id===introId) return "서도윤 소개서";
  return item.playerId ? players.find(p=>p.id===item.playerId)!.name+" 추가 조사" : item.market+" 스카우트 보고서";
}
function upcoming():string {
  const entries:{week:number;label:string}[]=[];
  for (const m of state.missions) entries.push({week:m.due,label:(m.playerId?reportName(m):m.market+" 파견")+" 복귀"});
  for (const item of state.support) {
    const name=players.find(player=>player.id===item.playerId)!.name;
    if (item.status==="open") entries.push({week:item.deadline,label:name+" 지원 결정 마감"});
    if (item.status==="scheduled") entries.push({week:item.reviewWeek!,label:name+" 지원 결과"});
  }
  for (const m of state.meetings) entries.push({week:m.due,label:players.find(p=>p.id===m.playerId)!.name+" 면담 답변"});
  for (const m of state.matters) if (!m.done) entries.push({week:m.due,label:m.title+" 마감"});
  for (const offer of state.clubDeals.offers) {
    const club=clubs[offer.clubId].name;
    if (offer.status==="waiting" || offer.status==="counter") entries.push({week:offer.replyWeek,label:club+" 협상 회신"});
    if (offer.status==="open" || offer.status==="counter") entries.push({week:offer.deadline,label:club+" 제안 마감"});
  }
  const contract=state.clubDeals.contract;
  if (contract?.status==="pending") entries.push({week:contract.registrationWeek,label:clubs[contract.clubId].name+" 등록 · 수수료 입금"});
  const draft=state.domestic.draft;
  if (draft?.status==="open" || draft?.status==="counter") entries.push({week:draftDeadline(draft.season),label:"한지후 신인 계약 마감"});
  if (draft?.status==="counter") entries.push({week:draft.replyWeek!,label:"한지후 계약금 역제안 회신"});
  if (draft?.status==="pending") entries.push({week:draftRegistration(draft.season),label:"한지후 2군 등록"});
  const renewal=state.domestic.renewals.at(-1);
  if (renewal?.status==="open" || renewal?.status==="counter") entries.push({week:renewalDeadline(renewal.season),label:"서도윤 연봉 제안 마감"});
  if (renewal?.status==="counter") entries.push({week:renewal.replyWeek!,label:"서도윤 연봉 역제안 회신"});
  if (renewal?.status==="pending") entries.push({week:renewalRegistration(renewal.season),label:"서도윤 재계약 등록 · 수수료 입금"});
  const promotion=state.domestic.promotionWeek;
  if (promotion && promotion>state.week) entries.push({week:promotion,label:"서도윤 1군 등록"});
  for(let week=state.week+1;week<=state.week+4;week++){
    const season=calendar(week);
    if (season.round===draftRound && (!draft || draft.status==="undrafted" || draft.status==="expired"))
      entries.push({week,label:"국내 신인 드래프트"});
    if (season.phase!==calendar(week-1).phase) entries.push({week,label:"국내 "+season.phase+" 시작"});
  }
  const visible=entries.filter(item=>item.week>=state.week && item.week<=state.week+4).sort((a,b)=>a.week-b.week);
  return `<details id="calendar" ${showCalendar?"open":""}><summary>다가오는 4주 일정 · ${visible.length}건</summary>
    ${visible.map(item=>`<p><b>${date(item.week)}</b> ${escape(item.label)}</p>`).join("") || "<p>예정된 업무가 없습니다.</p>"}</details>`;
}
function supportCard(item:SupportCase):string {
  const player=players.find(candidate=>candidate.id===item.playerId)!;
  const role=item.playerId===domesticPlayer?"1군 외야 적응":"2군 불펜 적응";
  const attrs=`data-id="${item.playerId}"`;
  return `<article class="matter support-card">
    <h3>${player.name} · ${role}</h3>
    ${item.status==="open" ? `
      <p>${date(item.deadline)}까지 지원을 선택하세요.</p>
      <div class="renewal-actions">${button("역할 상담<small>무료</small>","support-talk",attrs,false,"primary")}
      ${button("외부 코치<small>40만 원</small>","support-coach",attrs,state.money<coachingCost,"secondary")}</div>
      <p class="small">상담은 1주, 외부 코치의 기록 점검은 2주 뒤 결과가 도착합니다.</p>` :
      `<p>${item.status==="done" ? escape(item.report) : item.status==="scheduled" ? date(item.reviewWeek!)+" 결과 예정" : "지원 결정 기한 만료"}</p>`}
  </article>`;
}
function office():string {
  const pending = state.matters.filter(item=>!item.done).sort((a,b)=>a.due-b.due);
  const support=state.support.filter(item=>item.status==="open" || item.reviewWeek===state.week && item.status==="done");
  const arrived = state.reports.filter(report=>report.week===state.week && report.id!==introId);
  const mission = state.missions[0];
  const openOffers=state.clubDeals.offers.filter(offer=>offer.status==="open").length;
  const renewal=state.domestic.renewals.at(-1);
  const renewalOpen=renewal?.status==="open";
  const draft=state.domestic.draft;
  const draftOpen=draft?.status==="open" && state.clients.includes(prospectId);
  const featured=players.find(player=>state.clients.includes(player.id));
  return `<section class="office-title" aria-label="사무실">
      <p class="week-strip">${weekDate(state.week).getUTCFullYear()} · 국내 ${calendar(state.week).phase}</p><h1>${state.week}<small>주차</small></h1>
      <p class="hero-date">${date(state.week)} 월요일</p></section>
    <section class="agenda"><div class="section-title"><h2>이번 주 업무</h2></div>
      ${pending.map(item=>`<article class="matter"><p class="deadline">${item.due===state.week?"이번 주 마감":(item.due-state.week)+"주 뒤 마감"}</p>
        <h3>${escape(item.title)}</h3><p>${escape(item.body)}</p>
        <div class="actions">${button("고객 계약","sign",`data-id="${item.id}"`,false,"primary")}
        ${button("거절","decline",`data-id="${item.id}"`,false,"quiet")}</div></article>`).join("")}
      ${support.map(supportCard).join("")}
      ${draftOpen ? button(`<span><b>한지후 신인 계약 제안</b><small>${domesticTeams[draft.team!]} · ${date(draftDeadline(draft.season))} 마감</small></span><span>협상 ›</span>`,
        "tab",'data-tab="deals"',false,"office-action") : ""}
      ${renewalOpen ? button(`<span><b>서도윤 연봉 제안</b><small>${money(renewal.salary)} · ${date(renewalDeadline(renewal.season))} 마감</small></span><span>협상 ›</span>`,
        "tab",'data-tab="deals"',false,"office-action") : ""}
      ${openOffers ? button(`구단 제안 ${openOffers}건 비교`,"tab",'data-tab="deals"',false,"primary full") : ""}
      ${arrived.map(report=>button(`<span><b>${reportName(report)}</b><small>후보 ${report.candidates.length}명 · 이번 주 도착</small></span><span>열기 ›</span>`,
        "report",`data-id="${report.id}"`,false,"office-action")).join("")}
      ${pending.length || support.length || draftOpen || renewalOpen || openOffers || arrived.length ? "" : button(`<span><b>${mission ? (mission.playerId ? reportName(mission) : mission.market+" 조사")+" 중" : "스카우트 파견"}</b>
        <small>${mission ? date(mission.due)+" 복귀 예정" : "국내외에서 새 선수를 발굴하세요."}</small></span><span>${mission ? "현황" : "지역 선택"} ›</span>`,"tab",'data-tab="scout"',false,"office-action")}
      ${state.meetings.map(item=>`<p class="task-line">${escape(players.find(player=>player.id===item.playerId)!.name)} 면담 답변 · ${date(item.due)} 예정</p>`).join("")}
    </section>
    <section class="roster-desk"><div class="section-title"><h2>${!featured && state.week===1 ? "소개받은 선수" : "담당 선수"}</h2>${button(`선수 명단 ${state.clients.length}/3 ›`,"tab",'data-tab="players"',false,"section-link")}</div>
      ${featured ? button(playerCard(featured,"담당 고객"),"tab",'data-tab="players"',false,"player-pass") :
        state.week===1 ? button(playerCard(players.find(p=>p.id===domesticPlayer)!,"소개서 열기"),"introduction","",false,"player-pass") :
        `<p class="empty">보고서에서 선수를 만나 첫 고객 계약을 맺으세요.</p>`}
    </section>
    <section><div class="section-title"><h2>이번 주 소식</h2>${button("국내 경기 기록 ›","league","",false,"section-link")}</div>
      <p class="weekly-note">${escape(state.summaries[0]?.text ?? "")}</p>
    </section>
    ${upcoming()}
    <details ${showHistory?"open":""} id="history"><summary>지난 주 업무 기록</summary>
      ${state.summaries.slice(1).map(item=>`<p><b>${item.week}주차</b> ${escape(item.text)}</p>`).join("") ||
        "<p>첫 주의 업무 기록이 여기에 쌓입니다.</p>"}</details>`;
}
function scout():string {
  const running = state.missions[0];
  const selected = running?.market ?? market;
  const cost=running?.playerId ? followUpCost : missionCost(selected);
  return `<header class="page-title"><h1>스카우트</h1></header>
    <section class="dispatch"><h2>${running ? "파견 현황" : "조사 지역"}</h2>
      <div class="regions" role="group" aria-label="조사 지역">${markets.map(item=>button(item,"region",
        `data-market="${item}" aria-pressed="${selected===item}"`,!!running,selected===item?"chosen":"")).join("")}</div>
      <dl class="route-terms"><div><dt>조사 비용</dt><dd>${money(cost)}</dd></div>
      <div><dt>${running?"복귀 예정":"예상 기간"}</dt><dd>${running?date(running.due):missionWeeks(selected)+"주"}</dd></div></dl>
      ${running ? `<p class="route-state">${running.playerId ? reportName(running) : running.market+" 조사"} 중 · 복귀까지 ${running.due-state.week}주</p>` :
        button(state.money<missionCost(selected)?"파견 비용 부족":selected+" 스카우트 파견","dispatch","",state.money<missionCost(selected),"primary full")}
    </section>
    <section><div class="section-title"><h2>도착한 보고서</h2><span>${state.reports.length}건</span></div>
      ${state.reports.slice().reverse().map(report=>button(
        `${report.candidates[0] ? portrait(report.candidates[0].player,"report-thumb") : ""}<span class="report-copy"><small>${date(report.week)} · 관찰 기록</small><b>${reportName(report)}</b><small>후보 ${report.candidates.length}명 · ${report.page+1}장부터 이어 읽기</small></span><span aria-hidden="true">↗</span>`,
        "report",`data-id="${report.id}"`,false,"report-row")).join("") ||
        '<p class="empty">첫 파견이 끝나면 조사 당시의 기록과 의견을 보관합니다.</p>'}
    </section>`;
}
function myPlayers():string {
  const selected = players.filter(player=>state.clients.includes(player.id) || state.interests.includes(player.id))
    .sort((a,b)=>Number(state.clients.includes(b.id))-Number(state.clients.includes(a.id)));
  return `<header class="page-title"><h1>내 선수</h1><p>고객 ${state.clients.length}명 · 관심 선수 ${state.interests.length}명</p></header>
    ${selected.map(player=>{
      const client=state.clients.includes(player.id);
      const latest=state.reports.slice().reverse().find(report=>report.candidates.some(candidate=>candidate.player.id===player.id));
      const renewal=player.id===domesticPlayer ? state.domestic.renewals.at(-1) : undefined;
      const draft=player.id===prospectId && state.domestic.draft;
      const support=state.support.find(item=>item.playerId===player.id);
      return `<article class="roster-entry"><div class="player-pass">${playerCard(player,client?"담당 고객":"관심 선수")}</div>
        <div class="contract-strip">${client ? "<span>계약 2년 · 수수료 5%</span>" : ""}
          ${latest ? button("관찰 기록 열기","report",`data-id="${latest.id}" data-player="${player.id}"`,false,"section-link") : ""}
          ${!client && state.interests.includes(player.id) ? button("관심 해제","unwatch",`data-id="${player.id}"`,false,"section-link") : ""}
          ${draft || renewal || client && player.id===freeAgentId ? button("구단 협상","tab",'data-tab="deals"',false,"section-link") : ""}
        </div>${support ? supportCard(support) : ""}</article>`;
    }).join("") ||
      `<section class="empty"><h2>첫 인연을 기다립니다.</h2><p>스카우트 보고서에서 관심 등록이나 면담을 요청하세요.</p>
      ${button("스카우트로 이동","tab",'data-tab="scout"',false,"primary")}</section>`}`;
}
function marketPage():string {
  const season=calendar(state.week);
  const roster=players.filter(player=>player.market===marketView);
  const draft=state.domestic.draft;
  const previousEnd=state.week-season.round-19;
  const hasArchive=previousEnd>=state.domestic.firstWeek;
  const archived=hasArchive && showLastSeason;
  const league=marketView==="한국" ? koreaSeason(state.seed,archived?previousEnd:state.week,state.domestic,marketTier) : null;
  const latest=league?.games.at(-1);
  return `<header class="page-title"><h1>시장</h1></header>
    <div class="regions" role="group" aria-label="시장 선택">${markets.map(region=>button(region,"market-view",
      `data-market="${region}" aria-pressed="${marketView===region}"`,false,marketView===region?"chosen":"")).join("")}</div>
    ${league ? `<section class="league-board"><header><h2>국내 리그</h2><span>${archived ? (season.season-1)+"시즌 · 최종" : season.season+"시즌 · "+season.phase}</span></header>
      ${hasArchive ? `<div class="season-switch" role="group" aria-label="시즌 선택">${button("이번 시즌","season-view",'data-id="current" aria-pressed="'+!archived+'"',false,"secondary")}
        ${button("지난 시즌","season-view",'data-id="previous" aria-pressed="'+archived+'"',false,"secondary")}</div>` : ""}
      <div class="tier-switch" role="group" aria-label="국내 리그 구분">${(["1군","2군"] as const).map(t=>button(t,"tier",
        `data-id="${t}" aria-pressed="${marketTier===t}"`,false,marketTier===t?"chosen":"")).join("")}</div>
      ${latest ? `<p class="score-date">${date(latest.week)} ${archived?"최종전":"경기 결과"}</p>
        <div class="score-line"><span>${domesticTeams[0]}</span><b>${latest.runs[0]} : ${latest.runs[1]}</b><span>${domesticTeams[1]}</span></div>`
        : `<p class="score-date">${season.round<4 ? "정규시즌 개막 · "+date(state.week+4-season.round) : "이번 시즌 집계된 경기가 없습니다."}</p>`}
      <table><caption>팀 순위</caption><thead><tr><th>순위</th><th>구단</th><th>승</th><th>무</th><th>패</th></tr></thead>
      <tbody>${[0,1].sort((a,b)=>league.wins[b]-league.wins[a]).map((team,i)=>`<tr><td>${league.games.length ? league.wins[0]===league.wins[1] ? 1 : i+1 : "—"}</td><th scope="row">${domesticTeams[team]}</th><td>${league.wins[team]}</td><td>${league.draws}</td><td>${league.wins[1-team]}</td></tr>`).join("")}</tbody></table>
      ${league.batting.pa ? `<p class="league-batter">서도윤 · ${marketTier} ${battingLine(league.batting)}</p>` : ""}
      ${league.pitching.outs ? `<p class="league-batter">한지후 · 2군 ${pitchingLine(league.pitching)}</p>` : ""}
      </section>` : ""}
    ${marketView==="한국" && draft ? `<section class="score-date">
      <div class="section-title"><h2>신인 드래프트</h2><span>${draft.season}시즌</span></div>
      <p class="weekly-note">${draft.team===null ? "한지후 미지명" :
        "한지후 · "+domesticTeams[draft.team]+" "+draft.round+"라운드 지명"}${draft.status==="expired"?" · 계약 기한 만료":""}</p></section>` : ""}
    <section><div class="section-title"><h2>${marketView} 선수</h2></div>
      ${roster.map(original=>{const player=currentProfile(state,original);return `<article class="market-player">${portrait(player,"portrait")}
        <div><h3>${player.name}</h3>${currentPlayerLine(player)}<p class="record">${player.line}</p></div></article>`;}).join("")}
      ${button(marketView+" 파견 현황","tab",`data-tab="scout" data-market="${marketView}"`,false,"secondary full")}
    </section>`;
}
function domesticNegotiation():string {
  const renewal=state.domestic.renewals.at(-1);
  if (!renewal) return "";
  const {status,salary,season,raise}=renewal;
  const deadline=renewalDeadline(season);
  const labels={open:"제안 도착",counter:"역제안 회신 대기",pending:"등록 대기",registered:"등록 완료",expired:"기한 만료",declined:"제안 거절"};
  const attrs=`data-id="${season}"`;
  return `<section class="renewal-slip" aria-labelledby="renewal-title">
    <div class="section-title"><h2 id="renewal-title">서도윤 연봉 협상</h2><span>${labels[status]}</span></div>
    <p class="renewal-club">인천 웨이브스 · ${season+1}시즌</p>
    <dl class="terms">
      <div><dt>${status==="registered" || status==="pending"?"보장 연봉":"구단 제안"}</dt><dd>${money(salary)}</dd></div>
      ${status!=="expired" && status!=="declined" ? `<div><dt>${status==="registered"?"수수료 입금 완료":"등록 시 수수료"}</dt><dd>${money(renewalFee(salary))}</dd></div>` : ""}
      ${status==="open" || status==="counter" ? `<div><dt>답변 마감</dt><dd>${date(deadline)}</dd></div>` : ""}
      ${status==="pending" ? `<div><dt>등록 및 입금 예정</dt><dd>${date(renewalRegistration(season))}</dd></div>` : ""}
    </dl>
    ${status==="counter" ? `<p class="small">${raise}% 인상 요청 · ${date(renewal.replyWeek!)} 회신 예정</p>` : ""}
    ${status==="open" ? `
      ${raise ? `<p class="small">${salary>renewalOpeningSalary(state.seed,state.domestic,season) ? "구단이 인상 요청을 받아들였습니다." : "구단이 기존 조건을 유지했습니다."}</p>` : ""}
      <div class="renewal-actions">${button("연봉 확정","renewal-accept",attrs,false,"primary")}
      ${button("제안 거절","renewal-decline",attrs,false,"secondary")}</div>
      ${raise===null && state.week<deadline ? `<div class="renewal-counter">
        ${([10,25] as const).map(amount=>button(`+${amount}% 역제안`,"renewal-counter",attrs+` data-raise="${amount}"`,false,"secondary")).join("")}
      </div><p class="small">역제안은 한 번 가능합니다. 구단은 다음 주 회신합니다.</p>` : ""}` : ""}
  </section>`;
}
function draftNegotiation():string {
  const draft=state.domestic.draft;
  if (!draft || !state.clients.includes(prospectId)) return "";
  const {status,team,round,season,salary,bonus,counter}=draft;
  const labels={undrafted:"미지명",open:"제안 도착",counter:"회신 대기",pending:"등록 대기",registered:"입단 완료",expired:"기한 만료"};
  const attrs=`data-id="${season}"`;
  return `<section class="renewal-slip" aria-labelledby="draft-title">
    <div class="section-title"><h2 id="draft-title">한지후 신인 계약</h2><span>${labels[status]}</span></div>
    ${team===null || status==="expired" ? `<p class="renewal-club">다음 시즌 드래프트에 다시 참가합니다.</p>` : `
      <p class="renewal-club">${domesticTeams[team]} · ${round}라운드 지명 · 2군</p>
      <dl class="terms">
        <div><dt>계약금</dt><dd>${money(bonus)}</dd></div>
        <div><dt>첫 시즌 연봉</dt><dd>${money(salary)}</dd></div>
        ${status==="open" || status==="counter" ? `<div><dt>답변 마감</dt><dd>${date(draftDeadline(season))}</dd></div>` : ""}
        ${status==="pending" ? `<div><dt>입단 예정</dt><dd>${date(draftRegistration(season))}</dd></div>` : ""}
        ${draft.represented ? `<div><dt>${status==="registered"?"수수료 입금 완료":"등록 시 수수료"}</dt><dd>${money(draftFee(draft))}</dd></div>` : ""}
      </dl>
      ${status==="counter" ? `<p class="small">계약금 20% 인상 요청 · ${date(draft.replyWeek!)} 회신 예정</p>` : ""}
      ${status==="open" ? `
        ${counter==="accepted" || counter==="rejected" ? `<p class="small">${counter==="accepted"?"구단이 계약금 인상을 받아들였습니다.":"구단이 기존 계약금 조건을 유지했습니다."}</p>` : ""}
        <div class="renewal-actions">${button("신인 계약 확정","draft-accept",attrs,false,"primary")}
        ${counter==="unused" && state.week<draftDeadline(season) ? button("계약금 +20% 역제안","draft-counter",attrs,false,"secondary") : ""}</div>` : ""}`}
  </section>`;
}
function dealsPage():string {
  const {offers,contract}=state.clubDeals;
  const eligible=state.clients.includes(freeAgentId);
  const labels={waiting:"구단 회신 대기",open:"응답 가능",counter:"역제안 회신 대기",expired:"기한 만료",closed:"다른 구단 계약으로 종료",accepted:"계약 확정"};
  const player=players.find(player=>player.id===freeAgentId)!;
  return `<header class="page-title"><h1>구단 협상</h1></header>
    ${draftNegotiation()}
    ${domesticNegotiation()}
    ${state.domestic.renewals.length || state.domestic.draft && state.clients.includes(prospectId) ? '<div class="section-title overseas-title"><h2>해외 구단</h2></div>' : ""}
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
  const refined=player && state.reports.some(r=>r.playerId===player.id);
  const investigating=player && state.missions.some(m=>m.playerId===player.id);
  const requested = player && (state.meetings.some(meeting=>meeting.playerId===player.id) ||
    state.matters.some(matter=>matter.playerId===player.id && !matter.done));
  return `<div class="report-view"><header class="report-top">${button(tab==="scout"?"스카우트로":tab==="players"?"선수 명단으로":"사무실로","close","",false,"quiet")}
    <span>${item.id===introId ? "선수 소개" : item.playerId ? "추가 조사" : item.market+" 조사"} · ${date(item.week)}</span><span>${item.page+1} / ${Math.max(1,item.candidates.length)}</span></header>
    <article class="paper" aria-label="스카우트 보고서" id="paper" tabindex="-1">
      ${player ? `<div class="player-hero">${portrait(player,"hero-portrait")}
        <div class="player-name"><p>${escape(player.position)}</p><h1>${escape(player.name)}</h1>${playerLine(player)}</div></div>
        <div class="report-body"><section><h2>관찰 기록</h2><p class="record">${escape(player.line)}</p><p class="small">${(player.id===domesticPlayer || player.id===prospectId) && (player.line.includes("타율") || player.line.includes("평균자책") || player.appearances===0)?"해당 시즌 누적":"조사 당시 기록"} · 출전량 ${player.appearances}${player.position.includes("투수")?"아웃":"타석"}</p>
          <dl class="estimate"><div><dt>현재 실력 추정</dt><dd>${Math.max(1,player.ability-(item.playerId?2:4))}–${player.ability+(item.playerId?2:4)}</dd></div>
          <div><dt>잠재력 추정</dt><dd>${candidate.low}–${candidate.high}</dd></div></dl>
          </section>
        <section class="scout-opinion"><h2>스카우트 의견</h2><p>${escape(player.opinion)}</p></section>
        <div class="follow-up">${button(refined?"추가 조사 완료":investigating?"추가 조사 중":state.missions.length?"스카우트 복귀 후 추가 조사":state.money<followUpCost?"추가 조사 비용 부족":"추가 조사 · 1주 / 30만 원","follow-up",`data-id="${player.id}"`,
          !!refined || !!state.missions.length || state.money<followUpCost,"secondary full")}</div>
        <div class="report-actions">${button(state.interests.includes(player.id)?"관심 해제":"관심 등록",state.interests.includes(player.id)?"unwatch":"interest",`data-id="${player.id}"`,false,"secondary")}
        ${button(state.clients.includes(player.id)?"담당 고객":requested?"면담 답변 대기":"면담 요청","meeting",`data-id="${player.id}"`,
          !!requested || state.clients.includes(player.id),"primary")}</div></div>` :
        `<div class="report-body empty-report"><h1>후보 없음</h1><p class="weekly-note">관찰 기간 동안 추천할 만한 후보를 찾지 못했습니다.</p></div>`}
    </article>
    <div class="report-controls" aria-label="보고서 페이지">${button("이전 장","prev","",item.page===0,"quiet")}
      <span aria-live="polite">${item.page+1} / ${Math.max(1,item.candidates.length)}</span>
      ${button("다음 장","next","",item.page>=item.candidates.length-1,"quiet")}</div></div>`;
}
function finance():string {
  const {openingBalance,entries}=state.cashbook;
  return `<header class="page-title"><h1>운영 장부</h1></header>
    <section class="finance-balance"><span>현재 잔액</span><strong>${money(state.money)}</strong></section>
    <section aria-labelledby="cashflow-title"><div class="section-title"><h2 id="cashflow-title">최근 거래</h2></div>
      ${entries.length ? `<ul class="cashflow">${entries.slice().reverse().map(entry=>
        `<li><div><strong>${escape(entry.label)}</strong><small>${entry.week}주차 · ${date(entry.week)}</small></div>
          <b class="${entry.amount>0?"income":"expense"}">${entry.amount>0?"+":"−"}${money(Math.abs(entry.amount))}</b></li>`).join("")}</ul>`
        : '<p class="empty">파견비를 지출하거나 계약 수수료를 받으면 여기에 표시됩니다.</p>'}
      <p class="small">표시 기간 시작 잔액 ${money(openingBalance)}</p>
    </section>`;
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
      ${button(`<small>${tab==="finance"?"이전 화면 ‹":"운영 자금 ›"}</small><b>${money(state.money)}</b>`,
        "finance",'',false,"balance")}</header>
      <main id="content" tabindex="-1">${({office,players:myPlayers,scout,market:marketPage,deals:dealsPage,finance})[tab]()}</main>
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
  if ((event.target as HTMLElement).id==="calendar") showCalendar=(event.target as HTMLDetailsElement).open;
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
      case "finance":
        if (tab==="finance") tab=financeBack;
        else {financeBack=tab; tab="finance";}
        break;
      case "tab":
        tab=target.dataset.tab as Tab;
        if (target.dataset.market) market=target.dataset.market as Market;
        break;
      case "season-view": showLastSeason=id==="previous"; break;
      case "support-talk":
      case "support-coach":
        await execute({type:action,playerId:id});
        notice="선수 지원을 예약했습니다.";
        break;
      case "draft-counter":
        await execute({type:"draft-counter",season:Number(id)});
        notice="계약금 역제안을 보냈습니다. 다음 주에 답변이 옵니다.";
        break;
      case "draft-accept":
        await execute({type:"draft-accept",season:Number(id)});
        notice="신인 계약을 확정했습니다. 다음 시즌에 등록합니다.";
        break;
      case "renewal-counter":
        await execute({type:"renewal-counter",season:Number(id),raise:Number(target.dataset.raise) as 10|25});
        notice="역제안을 보냈습니다. 다음 주에 답변이 옵니다.";
        break;
      case "renewal-accept":
        await execute({type:"renewal-accept",season:Number(id)});
        notice="연봉을 확정했습니다. 다음 시즌 등록 때 수수료가 입금됩니다.";
        break;
      case "renewal-decline":
        await execute({type:"renewal-decline",season:Number(id)});
        notice="연봉 제안을 거절했습니다.";
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
      case "introduction": await execute({type:"introduction"}); reportId=introId; break;
      case "league": tab="market"; marketView="한국"; showLastSeason=false; break;
      case "region": market=target.dataset.market as Market; break;
      case "market-view": marketView=target.dataset.market as Market; break;
      case "tier": marketTier=id as Tier; break;
      case "follow-up": await execute({type:"follow-up",playerId:id}); notice="추가 조사를 보냈습니다. 다음 주에 보고서가 도착합니다."; break;
      case "dispatch": await execute({type:"dispatch",market}); notice="파견을 저장했습니다."; break;
      case "unwatch": await execute({type:"unwatch",playerId:id}); notice="관심 명단에서 제외했습니다."; break;
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
    if (["region","tier","market-view","season-view"].includes(action!)) root.querySelector<HTMLButtonElement>(`[data-action="${action}"][aria-pressed="true"]`)?.focus({preventScroll:true});
    if (["finance","league","introduction","tab","report","close","next","prev","continue","title","advance"].includes(action!)) {
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
  else if (tab==="finance") root.querySelector<HTMLButtonElement>('[data-action="finance"]')?.click();
  else {tab="office"; render();}
});
render();
