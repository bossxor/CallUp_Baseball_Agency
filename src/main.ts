import './style.css'
import { advanceWeeks, createGame, moveReportPage, readSave, reportPlayers } from './game.ts'
import type { GameState, WeekSummary } from './game.ts'

const saveKey = 'callup.prototype.v1'
const app = document.querySelector<HTMLDivElement>('#app')!
const announcer = document.querySelector<HTMLDivElement>('#announcer')!
const money = new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' })
const totalPages = Math.max(1, reportPlayers.length)
const labels = { quiet: '경기 요약', scout: '스카우트 복귀', callup: '1군 등록', offer: '구단 제안' }

let state = load()
let status = ''
let saveFailed = false
let view = ''
let swipeStart: { pointer: number; x: number; y: number } | undefined

function load(): GameState {
  try {
    return readSave(localStorage.getItem(saveKey)) ?? createGame()
  } catch {
    return createGame()
  }
}

function persist(next: GameState): boolean {
  try {
    localStorage.setItem(saveKey, JSON.stringify(next))
    return true
  } catch {
    return false
  }
}

function escape(text: string | number): string {
  return String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function banner(): string {
  return status ? `<p class="notice${saveFailed ? ' notice-error' : ''}">${status}</p>` : ''
}

function weeklySummary(week: WeekSummary): string {
  return `<li class="history-row">
    <span class="history-week">${week.week}주차</span>
    <span><strong>${escape(week.headline ?? '새 주요 소식 없음')}</strong><small>${week.games}경기 진행</small></span>
  </li>`
}

function renderOffice(): string {
  const latest = state.history.at(-1)
  const reportAvailable = state.week >= 4
  return `<main class="workspace" id="content">
    <div class="screen-title">
      <h1 id="screen-heading" tabindex="-1">사무실</h1>
      <span class="screen-tag">${state.history.length ? '시즌 진행 중' : '시즌 개막'}</span>
    </div>
    <section class="scoreboard" aria-label="현재 주차 및 자금">
      <div class="field-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
      <dl class="scoreboard-readout">
        <div><dt>현재 주차</dt><dd id="current-week">${state.week}주차</dd></div>
        <div><dt>운영 자금</dt><dd class="balance">${money.format(state.balance)}</dd></div>
      </dl>
    </section>

    <section class="weekly-brief" aria-labelledby="brief-heading">
      <div class="paper-heading">
        <h2 id="brief-heading">주간 브리핑</h2>
        <span>${latest ? `${latest.week}주차` : '개막 전'}</span>
      </div>
      <div class="brief-copy">
        <span class="brief-label">${latest ? labels[latest.kind] : '첫 경기 대기'}</span>
        <h3>${escape(latest?.headline ?? (latest ? '새 주요 소식 없음' : '시즌이 시작됩니다'))}</h3>
        <p>${latest ? `이번 주 ${latest.games}경기를 진행했습니다.` : '다음 주로 진행하면 첫 경기 결과를 확인합니다.'}</p>
      </div>
    </section>

    ${reportAvailable ? `<button type="button" class="report-alert" data-action="report" aria-label="스카우트 보고서 열기">
      <span class="folder-symbol" aria-hidden="true"></span>
      <span><strong>${latest?.kind === 'scout' ? '스카우트 보고서 도착' : '스카우트 보고서'}</strong><small>대만 파견 · 후보 ${reportPlayers.length}명</small></span>
      <span class="chevron" aria-hidden="true"></span>
    </button>` : ''}

    ${state.history.length ? `<section class="history" aria-labelledby="history-heading">
      <h2 id="history-heading">주간 기록</h2>
      <ol>${[...state.history].reverse().map(weeklySummary).join('')}</ol>
    </section>` : ''}
  </main>
  <footer class="action-tray">
    ${banner()}
    <div class="office-actions">
      <details class="advance-menu">
        <summary id="advance-menu">여러 주 진행</summary>
        <div class="batch-options">
          ${[2, 3, 4].map((weeks) => `<button type="button" data-weeks="${weeks}">${weeks}주 진행</button>`).join('')}
        </div>
      </details>
      <button type="button" class="advance-button" data-weeks="1">다음 주 <span class="chevron" aria-hidden="true"></span></button>
    </div>
  </footer>`
}

function renderReport(direction: number): string {
  const player = reportPlayers[state.reportPage]
  const slide = direction ? (direction > 0 ? ' sheet-next' : ' sheet-prev') : ''
  return `<main class="workspace report-workspace" id="content">
    <button type="button" class="back-button" data-action="office"><span class="chevron left" aria-hidden="true"></span> 사무실</button>
    <div class="screen-title report-title">
      <h1 id="screen-heading" tabindex="-1">스카우트 보고서</h1>
      <span class="screen-tag">대만 파견</span>
    </div>
    <article class="sheet${slide}" id="report-sheet" aria-labelledby="sheet-heading">
      <header class="sheet-header">
        ${player ? `<div class="portrait" aria-hidden="true"><span></span></div>
        <div><p class="club">${escape(player.club)}</p><h2 id="sheet-heading" tabindex="-1">${escape(player.name)}</h2>
        <p class="position">${escape(player.position)} · ${player.age}세</p></div>`
        : '<h2 id="sheet-heading" tabindex="-1">파견 결과</h2>'}
      </header>
      ${player ? `<section class="scout-note" aria-labelledby="note-heading">
        <h3 id="note-heading">스카우트 의견</h3>
        <p>${escape(player.note)}</p>
      </section>
      <dl class="stats">
        <div><dt>출전량</dt><dd>${escape(player.sample)}</dd></div>
        <div><dt>관찰 기록</dt><dd>${escape(player.stats)}</dd></div>
        <div><dt>잠재력 추정</dt><dd>${escape(player.potential)}</dd></div>
      </dl>` : '<p>조사 조건에 맞는 후보를 찾지 못했습니다.</p>'}
    </article>
  </main>
  <footer class="action-tray">
    ${banner()}
    <nav class="page-controls" aria-label="보고서 페이지">
      <button type="button" data-page="-1" ${state.reportPage <= 0 ? 'disabled' : ''}><span class="chevron left" aria-hidden="true"></span> 이전 장</button>
      <span class="page-count"><span class="screen-reader">총 ${totalPages}장 중 </span>${state.reportPage + 1}<span aria-hidden="true"> / ${totalPages}</span><span class="screen-reader">장</span></span>
      <button type="button" data-page="1" ${state.reportPage >= totalPages - 1 ? 'disabled' : ''}>다음 장 <span class="chevron" aria-hidden="true"></span></button>
    </nav>
  </footer>`
}

function render(direction = 0): void {
  const nextView = location.hash === '#report' && state.week >= 4 ? 'report' : 'office'
  const routeChanged = view !== '' && view !== nextView
  const previousView = view
  view = nextView
  document.title = view === 'report' ? '스카우트 보고서 | 콜업' : '사무실 | 콜업'
  app.innerHTML = `<header class="brand-bar"><div class="brand-inner">
    <span class="brand-icon" aria-hidden="true"></span><strong>콜업</strong><span class="brand-label">야구 에이전시</span>
  </div></header>${view === 'report' ? renderReport(direction) : renderOffice()}`
  if (routeChanged) {
    window.scrollTo(0, 0)
    const focus = previousView === 'report' ? '[data-action="report"]' : '#screen-heading'
    app.querySelector<HTMLElement>(focus)?.focus({ preventScroll: true })
  }
}

function announce(message: string): void {
  announcer.textContent = message
}

function progress(weeks: number): void {
  const result = advanceWeeks(state, weeks, persist)
  state = result.state
  saveFailed = result.reason === 'save-error'
  const messages = {
    complete: '',
    important: '주요 소식이 도착해 이 주차에서 멈췄습니다.',
    pending: '답변 대기 중인 구단 제안이 있습니다. 한 주씩 진행할 수 있습니다.',
    'save-error': '저장하지 못했습니다. 마지막으로 저장된 주차에서 다시 시도하세요.',
  }
  status = messages[result.reason]
  render()
  const focus = weeks === 1 ? '[data-weeks="1"]' : '#advance-menu'
  app.querySelector<HTMLElement>(focus)?.focus({ preventScroll: true })
  announce(`${state.week}주차. ${state.history.at(-1)?.headline ?? ''} ${status}`.trim())
}

function changePage(direction: number): void {
  const next = moveReportPage(state, direction)
  if (next.reportPage === state.reportPage) return
  saveFailed = !persist(next)
  status = saveFailed ? '읽던 장을 저장하지 못했습니다. 다시 시도하세요.' : ''
  if (!saveFailed) state = next
  render(saveFailed ? 0 : direction)
  const heading = app.querySelector<HTMLElement>('#sheet-heading')
  if (!saveFailed) {
    window.scrollTo(0, 0)
    heading?.focus({ preventScroll: true })
  } else {
    app.querySelector<HTMLButtonElement>(`[data-page="${direction}"]`)?.focus({ preventScroll: true })
  }
  announce(status || `총 ${totalPages}장 중 ${state.reportPage + 1}장`)
}

app.addEventListener('click', (event) => {
  const target = (event.target as Element).closest<HTMLButtonElement>('button')
  if (!target || target.disabled) return
  if (target.dataset.weeks) progress(Number(target.dataset.weeks))
  if (target.dataset.page) changePage(Number(target.dataset.page))
  if (target.dataset.action === 'report') {
    status = ''
    history.pushState({ screen: 'report' }, '', '#report')
    render()
  }
  if (target.dataset.action === 'office') history.back()
})

window.addEventListener('keydown', (event) => {
  if (view !== 'report' || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault()
    changePage(event.key === 'ArrowRight' ? 1 : -1)
  }
})

app.addEventListener('pointerdown', (event) => {
  if (event.pointerType !== 'touch' || !event.isPrimary || !(event.target as Element).closest('#report-sheet')) return
  swipeStart = { pointer: event.pointerId, x: event.clientX, y: event.clientY }
})

app.addEventListener('pointerup', (event) => {
  if (swipeStart?.pointer !== event.pointerId) return
  const dx = event.clientX - swipeStart.x
  const dy = event.clientY - swipeStart.y
  swipeStart = undefined
  if (Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.5) changePage(dx < 0 ? 1 : -1)
})

app.addEventListener('pointercancel', (event) => {
  if (swipeStart?.pointer === event.pointerId) swipeStart = undefined
})

window.addEventListener('popstate', () => {
  status = ''
  render()
})

if (location.hash === '#report' && history.state?.screen !== 'report') {
  history.replaceState(null, '', location.pathname + location.search)
  if (state.week >= 4) history.pushState({ screen: 'report' }, '', '#report')
}
render()
