/**
 * CallUp player chrome — break SignHere trading-card look.
 * Keep stats/data; restyle cards + roster as agency dossier.
 */
const fs = require("fs");
const path = require("path");

const themePath = path.join(__dirname, "callup-theme.css");
const pubTheme = path.join(
  __dirname,
  "..",
  "apk-src",
  "assets",
  "public",
  "callup-theme.css"
);
const MARK = "/* CALLUP_PLAYER_SKIN */";

const BLOCK = `
${MARK}
/* ===== Players / cards: dossier desk ≠ SignHere gold trading cards ===== */

/* --- Swipe cards: kill gold rim + holo --- */
.card,
.card:not(.legend) {
  padding: 1px !important;
  background: var(--line) !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 28px -16px #000c !important;
}
.card.legend {
  padding: 2px !important;
  background: var(--accent-line) !important;
  box-shadow: 0 12px 28px -14px #000c, 0 0 0 1px var(--accent-line) !important;
  --holo: none !important;
}
.card.legend .lg-back {
  border-radius: 12px !important;
}
.card .face,
.card:not(.legend) .face,
.face {
  border-radius: 11px !important;
  background: var(--panel) !important;
  background-image: none !important;
}
.face:before {
  /* thin dossier rule instead of stripe wash */
  background: linear-gradient(
    180deg,
    transparent 0,
    transparent calc(100% - 1px),
    var(--line) calc(100% - 1px)
  ) !important;
  opacity: 1 !important;
}
.face:after {
  /* kill sheen sweep */
  display: none !important;
}
.news .card:is(.ck-rare, .legend):after {
  display: none !important;
}

/* Card top chrome → stamp, not seal-pill gold */
.face .top {
  border-bottom: 1px solid var(--line) !important;
  padding-bottom: 8px !important;
}
.kind {
  color: var(--sub) !important;
  letter-spacing: 0.08em !important;
  text-transform: uppercase !important;
}
.seal {
  background: var(--panel2) !important;
  color: var(--accent-hi) !important;
  border-radius: 4px !important;
  box-shadow: inset 0 0 0 1px var(--accent-line) !important;
  font-family: var(--f-num) !important;
}
.grade {
  border-radius: 4px !important;
  letter-spacing: 0.12em !important;
  font-family: var(--f-num) !important;
}
.card.legend .face .grade {
  animation: none !important;
  background: color-mix(in srgb, var(--accent) 18%, var(--panel2)) !important;
  color: var(--accent-hi) !important;
  -webkit-background-clip: unset !important;
  background-clip: unset !important;
  box-shadow: inset 0 0 0 1px var(--accent-line) !important;
}

/* Face art / about strip */
.about.pl,
.face .about.in.pl {
  margin: 8px 0 0 !important;
  padding: 10px 12px !important;
  background: var(--panel2) !important;
  border-radius: 8px !important;
  border: 1px solid var(--line) !important;
  gap: 12px !important;
  align-self: stretch !important;
  width: calc(100% - 8px) !important;
  box-sizing: border-box !important;
}
.about.pl .ovr {
  border-radius: 8px !important;
  box-shadow: inset 0 0 0 1px var(--line) !important;
}
.about.pl .ab-t b {
  font-family: var(--f-disp) !important;
  font-weight: 800 !important;
  color: var(--ink) !important;
  letter-spacing: -0.02em !important;
}
.about.pl .ab-t small {
  border-radius: 4px !important;
  background: var(--panel) !important;
  color: var(--body) !important;
}

/* Segment: underline tabs */
.sc-seg,
.pl-seg,
.seg {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  gap: 0 !important;
  border-bottom: 1px solid var(--line) !important;
  border-radius: 0 !important;
  padding: 0 8px !important;
}
.sc-seg button,
.pl-seg button,
.seg button,
.sc-tab {
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: var(--sub) !important;
  font-weight: 600 !important;
  min-height: 44px !important;
  padding: 10px 14px !important;
}
.sc-seg button.on,
.pl-seg button.on,
.seg button.on,
.sc-tab.on {
  color: var(--ink) !important;
  background: transparent !important;
  box-shadow: inset 0 -2px 0 var(--accent) !important;
}

/* Roster rows: flat dossier lines + amber rail */
.plist,
.pcards {
  background: var(--bg) !important;
  gap: 0 !important;
  padding: 0 !important;
}
.plist > .prow2,
.pcards > .prow2,
.prow2.pr2 {
  background: var(--panel) !important;
  border: none !important;
  border-bottom: 1px solid var(--line) !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  min-height: 72px !important;
  padding: 12px 14px 12px 14px !important;
  position: relative !important;
}
.plist > .prow2::before,
.pcards > .prow2::before,
.prow2.pr2::before {
  content: "" !important;
  position: absolute !important;
  left: 0 !important;
  top: 10px !important;
  bottom: 10px !important;
  width: 3px !important;
  background: var(--accent) !important;
  border-radius: 0 2px 2px 0 !important;
  opacity: 0.9 !important;
}
.mine,
.prow2.mine {
  background: color-mix(in srgb, var(--accent) 8%, var(--panel)) !important;
}
.prow2 .nm,
.prow2 b,
.plist .nm {
  color: var(--ink) !important;
  font-family: var(--f-disp) !important;
  font-weight: 700 !important;
  letter-spacing: -0.02em !important;
}
.prow2 .sub,
.prow2 small {
  color: var(--body) !important;
  font-weight: 500 !important;
}

/* Avatar: square dossier photo */
.prow2.pr2 .pr-ph {
  width: 52px !important;
  height: 52px !important;
}
.prow2.pr2 .pr-fi {
  border-radius: 8px !important;
  box-shadow: inset 0 0 0 1px var(--line) !important;
  background: var(--panel2) !important;
}
.prow2.pr2 .pr-ph.team .pr-fi {
  box-shadow: inset 0 0 0 1px var(--accent-line) !important;
}
.sp-av {
  border-radius: 8px !important;
  box-shadow: inset 0 0 0 1px var(--line) !important;
}
.pface {
  border-radius: 8px !important;
}
.ovr.pt.sm .pface,
.ovr.pt.bare.ring {
  border-radius: 8px !important;
}
.ovr.pt.bare.ring {
  box-shadow: inset 0 0 0 1px var(--line) !important;
}

/* OVR: mono stamp */
.ovr,
.ovr.pt {
  background: var(--panel2) !important;
  color: var(--ink) !important;
  box-shadow: inset 0 0 0 1px var(--line) !important;
  border-radius: 6px !important;
  font-family: var(--f-num) !important;
  font-weight: 700 !important;
}
.ovr.fog {
  opacity: 1 !important;
  filter: none !important;
}
.ovr.fog:after {
  display: none !important;
}

/* Candidate / tile cards */
.sty-cand {
  border-radius: 10px !important;
  background: var(--panel) !important;
  box-shadow: inset 0 0 0 1px var(--line) !important;
  padding: 14px 12px !important;
}
.sty-cand .cd-nm {
  font-family: var(--f-disp) !important;
  font-weight: 800 !important;
  color: var(--ink) !important;
  letter-spacing: -0.03em !important;
}
.sty-cand .cd-sub {
  color: var(--body) !important;
}
.sty-cand .cd-stats {
  border-top: 1px solid var(--line) !important;
}
.sty-cand .cd-stats span {
  background: var(--panel2) !important;
  border-radius: 4px !important;
  box-shadow: none !important;
  color: var(--ink) !important;
  font-family: var(--f-num) !important;
}
.sty-cand .cd-stats b.n {
  color: var(--accent-hi) !important;
  font-weight: 700 !important;
}
.sty-cand .cd-face .sp-av {
  box-shadow: inset 0 0 0 1px var(--line) !important;
  border-radius: 8px !important;
}

/* Detail header */
.pdet.pd2 .about.pl,
.pd2 .about.pl {
  margin: 0 !important;
  width: 100% !important;
  border-radius: 0 !important;
  border-left: none !important;
  border-right: none !important;
  border-top: none !important;
}
.pd2-nick {
  color: var(--accent-hi) !important;
}

/* Position / tag stamps */
.pk,
.pb,
.pbadges .pb {
  border-radius: 4px !important;
  background: var(--panel2) !important;
  color: var(--body) !important;
  box-shadow: inset 0 0 0 1px var(--line) !important;
  font-weight: 600 !important;
}
.pb.t2,
.pb.t3 {
  background: color-mix(in srgb, var(--accent) 14%, var(--panel2)) !important;
  color: var(--ink) !important;
  box-shadow: inset 0 0 0 1px var(--accent-line) !important;
}

/* --- .pcd trading card → CallUp compact dossier (break 280x435 silhouette) --- */
.pcd-mini {
  aspect-ratio: 280 / 210 !important;
}
.pcd-3d {
  transform: none !important;
  will-change: auto !important;
}
.pcd-3d:after,
.pcd-edge,
.pcd:after,
.pcd .pcd-holo,
.pcd .pcd-glare,
.pcd .pcd-wm,
.pcd .pcd-flag,
.pcd .pcd-vig {
  display: none !important;
}
.pcd {
  --t: var(--accent-hi) !important;
  --ink2: var(--ink) !important;
  --mut: var(--body) !important;
  width: 280px !important;
  height: 210px !important;
  border-radius: 10px !important;
  background: var(--panel) !important;
  color: var(--ink) !important;
  box-shadow: inset 3px 0 0 var(--accent), inset 0 0 0 1px var(--line) !important;
  overflow: hidden !important;
}
.pcd .pcd-fr {
  display: none !important;
}
.pcd .pcd-crest {
  left: 12px !important;
  top: 10px !important;
  width: 22px !important;
  height: 22px !important;
  filter: none !important;
  opacity: 0.9 !important;
}
.pcd .pcd-med {
  right: 10px !important;
  top: 10px !important;
}
.pcd .pcd-fc {
  left: 14px !important;
  top: 40px !important;
  width: 96px !important;
  height: 96px !important;
  transform: none !important;
  filter: none !important;
  -webkit-mask: none !important;
  mask: none !important;
  border-radius: 8px !important;
  overflow: hidden !important;
  background: var(--panel2) !important;
  box-shadow: inset 0 0 0 1px var(--line) !important;
}
.pcd .pcd-fc svg {
  transform: translateY(4px) scale(1.05) !important;
}
.pcd .pcd-nm {
  left: 122px !important;
  right: 12px !important;
  top: 36px !important;
  bottom: auto !important;
  justify-items: start !important;
  text-align: left !important;
  gap: 2px !important;
}
.pcd .pcd-nm b {
  font-family: var(--f-disp) !important;
  font-size: 18px !important;
  font-weight: 800 !important;
  letter-spacing: -0.03em !important;
  line-height: 22px !important;
  max-width: 100% !important;
  color: var(--ink) !important;
}
.pcd .pcd-nm .pcd-ln {
  display: none !important;
}
.pcd .pcd-nm small {
  letter-spacing: 0.12em !important;
  font-size: 10px !important;
  color: var(--accent-hi) !important;
}
.pcd .pcd-lh {
  left: 122px !important;
  right: 12px !important;
  top: 88px !important;
  bottom: auto !important;
  justify-items: start !important;
  text-align: left !important;
  background: transparent !important;
  padding: 0 !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}
.pcd .pcd-club {
  font-size: 13px !important;
  color: var(--accent-hi) !important;
  font-weight: 700 !important;
}
.pcd .pcd-sub {
  margin-top: 2px !important;
  font-size: 11px !important;
  color: var(--body) !important;
}
.pcd .pcd-tri {
  display: none !important;
}
.pcd-fth,
.pcd .pcd-fth {
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  height: 40px !important;
  padding: 0 14px 0 17px !important;
  border-top: 1px solid var(--line) !important;
  background: var(--panel2) !important;
  color: var(--body) !important;
  box-sizing: border-box !important;
}
.pcd .pcd-fth b {
  color: var(--accent-hi) !important;
  font-family: var(--f-num) !important;
  font-size: 14px !important;
}
.pcd .pcd-q {
  border-radius: 4px !important;
  background: var(--panel) !important;
  color: var(--sub) !important;
  box-shadow: inset 0 0 0 1px var(--line) !important;
}
.pcd-page {
  background: var(--bg) !important;
  gap: 12px !important;
}
.pcd-page .pcd,
.pcd-out .pcd {
  height: 210px !important;
}
.pcd-tw {
  perspective: none !important;
}

/* FAB */
.pl-fab {
  background: var(--fill-accent) !important;
  color: var(--accent-ink) !important;
  box-shadow: var(--sh-accent) !important;
  border-radius: 12px !important;
}

/* Crest moment: mute gold drop-shadow glow */
.mo-crest {
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.45)) !important;
  animation: none !important;
}
.mo-crest-t,
.mo-crest span {
  fill: var(--accent-hi) !important;
  color: var(--accent-hi) !important;
  background: var(--panel2) !important;
  box-shadow: inset 0 0 0 1px var(--accent-line) !important;
}
`;

let theme = fs.readFileSync(themePath, "utf8");
if (theme.includes(MARK)) {
  const i = theme.indexOf(MARK);
  const next = theme.indexOf("\n/* CALLUP_", i + MARK.length);
  theme =
    next > 0
      ? theme.slice(0, i) + BLOCK.trim() + "\n" + theme.slice(next)
      : theme.slice(0, i) + BLOCK.trim() + "\n";
  console.log("player skin CSS upserted");
} else {
  theme += "\n" + BLOCK;
  console.log("player skin CSS appended");
}
fs.writeFileSync(themePath, theme);
fs.copyFileSync(themePath, pubTheme);
console.log("fix-ui-player-skin done");
