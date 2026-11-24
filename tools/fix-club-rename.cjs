/**
 * agency.clubNick override + bulk textarea UI (설정 › 구단).
 * Patches i18n yt (club label), load assert, shell game bind + editor.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const assets = path.join(root, "apk-src", "assets", "public", "assets");
const i18nPath = path.join(assets, "i18n-D-FAABCZ.js");
const engPath = path.join(assets, "engine-DhPc-c_J.js");
const shellPath = path.join(assets, "shell-DaKdX7f1.js");
const themePath = path.join(root, "tools", "callup-theme.css");
const pubTheme = path.join(root, "apk-src", "assets", "public", "callup-theme.css");

const stats = { i18n: 0, assert: 0, cc: 0, ui: 0, css: 0 };

function rep(file, oldStr, newStr, label) {
  let s = fs.readFileSync(file, "utf8");
  if (s.includes(newStr) && !oldStr) {
    console.log("ok", label);
    return;
  }
  if (!s.includes(oldStr)) {
    if (s.includes(newStr)) {
      console.log("ok", label);
      return;
    }
    console.log("MISS", label);
    process.exitCode = 1;
    return;
  }
  s = s.split(oldStr).join(newStr);
  fs.writeFileSync(file, s);
  stats[label] = (stats[label] || 0) + 1;
  console.log("patched", label);
}

// --- i18n: club display (yt / import c as T) ---
const I18N_OLD =
  'let S=null;const vt=t=>{S=t},yt=t=>t?(S==null?void 0:S(t.name))??G(t.name):"",_t=t=>t?G(t.name):"",$t=t=>';
const I18N_NEW =
  'let S=null;const vt=t=>{S=t},yt=t=>{if(!t)return"";const n=S==null?void 0:S(t.name);if(n)return n;const g=globalThis.__callupG,m=g==null?void 0:g.agency,k=m==null?void 0:m.clubNick,b=k==null?void 0:k[t.id];return b||G(t.name)},_t=t=>t?G(t.name):"",$t=t=>';
rep(i18nPath, I18N_OLD, I18N_NEW, "i18n");

// --- engine: ensure clubNick on load / stamp ---
const ASSERT_SNIP = "if(!a)return;";
const ASSERT_WITH =
  "if(!a)return;if(!a.clubNick)a.clubNick={};/*CALLUP_CLUBNICK*/";
let eng = fs.readFileSync(engPath, "utf8");
if (eng.includes("/*CALLUP_CLUBNICK*/")) {
  console.log("ok assert");
} else if (eng.includes(ASSERT_SNIP)) {
  eng = eng.replace(ASSERT_SNIP, ASSERT_WITH);
  fs.writeFileSync(engPath, eng);
  stats.assert = 1;
  console.log("patched assert");
} else {
  console.log("MISS assert anchor");
  process.exitCode = 1;
}

// --- shell: bind game + clubNick editor ---
const CC_OLD = "function Cc(s){sr=s,Xd(s,!0),ke()}";
const CC_NEW =
  "function Cc(s){sr=s,globalThis.__callupG=s,s.agency&&!s.agency.clubNick&&(s.agency.clubNick={}),Xd(s,!0),ke()}";
rep(shellPath, CC_OLD, CC_NEW, "cc");

const EDITOR = `function CallupClubNickEditor(){const g=R(),[open,a]=p.useState(!1),[text,r]=p.useState(""),c=()=>g.clubs.map(l=>{const i=(g.agency.clubNick||{})[l.id];return l.id+"|"+(i||l.name)}).join("\\n"),save=()=>{const l={};for(const line of text.split(/\\n/)){const m=line.match(/^(\\d+)\\|(.*)$/);if(!m)continue;const id=+m[1],nm=m[2].trim();if(nm)l[id]=nm}g.agency.clubNick=l,ke()},reset=()=>{g.agency.clubNick={},ke(),r(c())};return e.jsxs(e.Fragment,{children:[e.jsxs("button",{type:"button",className:"sw-row set-link",onClick:()=>{open||r(c()),a(!open)},children:[e.jsxs("span",{className:"sw-t",children:[e.jsx("b",{children:n("구단 이름 편집")}),e.jsx("small",{children:n("한 줄에 id|이름. 비우면 기본 도시명")})]}),e.jsx(K,{name:"chev",size:16})]}),open&&e.jsxs("div",{className:"callup-club-nick",children:[e.jsx("textarea",{className:"callup-club-nick-ta",value:text,rows:14,spellCheck:!1,onChange:l=>r(l.target.value)}),e.jsxs("div",{className:"callup-club-nick-actions",children:[e.jsx("button",{type:"button",className:"btn go",onClick:save,children:n("저장")}),e.jsx("button",{type:"button",className:"btn ghost",onClick:reset,children:n("기본값으로")})]})]})]})}`;

let shell = fs.readFileSync(shellPath, "utf8");
if (!shell.includes("function CallupClubNickEditor()")) {
  const anchor = "function h1({onOpen:s})";
  if (!shell.includes(anchor)) {
    console.log("MISS h1 anchor");
    process.exitCode = 1;
  } else {
    shell = shell.replace(anchor, EDITOR + anchor);
    stats.ui += 1;
    console.log("patched editor fn");
  }
} else console.log("ok editor fn");

const SET_CARD_OLD =
  'e.jsx("div",{className:"set-h",children:n("구단")}),e.jsx("div",{className:"set-card",children:e.jsx(h1,{onOpen:()=>t.open({k:"clubpatch"})})})';
const SET_CARD_NEW =
  'e.jsx("div",{className:"set-h",children:n("구단")}),e.jsxs("div",{className:"set-card",children:[e.jsx(CallupClubNickEditor,{}),e.jsx(h1,{onOpen:()=>t.open({k:"clubpatch"})})]})';

if (shell.includes(SET_CARD_NEW)) console.log("ok set-card");
else if (shell.includes(SET_CARD_OLD)) {
  shell = shell.split(SET_CARD_OLD).join(SET_CARD_NEW);
  stats.ui += 1;
  console.log("patched set-card");
} else if (shell.includes("CallupClubNickEditor")) {
  console.log("ok set-card (partial)");
} else {
  console.log("MISS set-card");
  process.exitCode = 1;
}
fs.writeFileSync(shellPath, shell);

// --- theme ---
const CSS_MARK = "/* CALLUP_CLUB_NICK */";
let theme = fs.readFileSync(themePath, "utf8");
if (!theme.includes(CSS_MARK)) {
  theme += `
${CSS_MARK}
.callup-club-nick { margin-top: 8px; display: grid; gap: 10px; }
.callup-club-nick-ta {
  width: 100%; min-height: 200px; font-family: inherit; font-size: 13px;
  padding: 10px; border-radius: var(--r-md, 10px);
  border: 1px solid color-mix(in srgb, var(--line, #ccc) 80%, transparent);
  background: var(--panel2, #f8f8f8); color: var(--ink, #111);
  resize: vertical;
}
.callup-club-nick-actions { display: flex; gap: 8px; flex-wrap: wrap; }
`;
  fs.writeFileSync(themePath, theme);
  stats.css = 1;
}
fs.copyFileSync(themePath, pubTheme);

console.log("fix-club-rename done", JSON.stringify(stats));
if (process.exitCode) process.exit(process.exitCode);