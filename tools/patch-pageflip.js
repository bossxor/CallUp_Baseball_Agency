/** Replace tear-open with bottom→top page flip that actually completes. */
const fs = require("fs");
const path = require("path");

const root = process.argv[2] || "T:/CallUp/apk-src";
const shellPath = path.join(root, "assets/public/assets/shell-DaKdX7f1.js");
const themeSrc = path.join(__dirname, "callup-theme.css");
const themeDst = path.join(root, "assets/public/callup-theme.css");

let s = fs.readFileSync(shellPath, "utf8");

const reps = [
  [
    'qe=B=>{var ce;const W=Y.current;if(!W.finished){W.down=!0;try{B.currentTarget.setPointerCapture(B.pointerId)}catch{}(ce=F.current)==null||ce.classList.add("cutting"),W.last=V(B),W.x0=W.last[0],ye(W.last,W.last),xe()}}',
    'qe=B=>{var ce;const W=Y.current;if(!W.finished){W.down=!0;try{B.currentTarget.setPointerCapture(B.pointerId)}catch{}(ce=F.current)==null||ce.classList.add("cutting","lifting"),W.last=V(B),W.x0=W.last[1]}}',
  ],
  [
    "is=B=>{const W=Y.current;if(!W.down||W.finished)return;const ce=V(B);W.buzz+=Math.hypot(ce[0]-W.last[0],ce[1]-W.last[1]),W.buzz>=14&&(W.buzz=0,Ge(15)),ye(W.last,ce),W.last=ce,xe(),ze(ce[0],ce[1]),Ne()&&es(ce[0]>=W.x0?1:-1)}",
    'is=B=>{const W=Y.current;if(!W.down||W.finished)return;const ce=V(B);W.last=ce;const Ae=Math.max(0,Math.min(1,(W.x0-ce[1])/160));(W.base=W.base||F.current&&F.current.querySelector(".spk-base"))&&(W.base.style.transform="perspective(900px) rotateX("+(-Ae*78).toFixed(1)+"deg)",W.base.style.transformOrigin="50% 100%");Ne()&&es(1)}',
  ],
  [
    "Ne=()=>{const B=Y.current.ys;let W=-1,ce=-1;if(B.forEach((Ae,Ce)=>{Ae!==null&&(W<0&&(W=Ce),ce=Ce)}),W<0)return!1;for(let Ae=W;Ae<=ce;Ae++)if(B[Ae]===null)return!1;return W<=2&&ce>=P-3}",
    "Ne=()=>{const B=Y.current;return!!B.down&&!B.finished&&B.x0-B.last[1]>=110}",
  ],
  [
    'es=B=>{var ps,Rs;const W=Y.current;if(W.finished||!F.current)return;W.finished=!0;const ce=W.ys;for(let ns=0;ns<P;ns++)if(ce[ns]===null){let De=ns;for(;De<P&&ce[De]===null;)De++;ce[ns]=ce[ns-1]??ce[De]??44}const Ae=ce.map((ns,De)=>[De*Z,ns+(Math.random()*2.4-1.2)]),Ce=Math.max(...ce),Pe=F.current.querySelector(".spk-base"),ts=Pe.cloneNode(!0);ts.className="spk-lid",Pe.style.clipPath=`polygon(${Ae.map(([ns,De])=>`${ns}px ${De}px`).join(",")},${_e}px ${w}px,0 ${w}px)`,ts.style.clipPath=`polygon(0 -40px,${_e}px -40px,${Ae.slice().reverse().map(([ns,De])=>`${ns}px ${De}px`).join(",")})`,F.current.appendChild(ts),(ps=oe.current)==null||ps.animate([{opacity:1},{opacity:0}],{duration:500,fill:"forwards"}),ts.animate([{transform:"none"},{transform:`translate(${B*30}px,-34px) rotate(${-B*7}deg)`,offset:.3},{transform:`translate(${B*190}px,320px) rotate(${B*38}deg)`,opacity:0}],{duration:950,easing:"cubic-bezier(.3,.1,.6,1)",fill:"forwards"}),F.current.classList.add("cut"),(Rs=ne.current)==null||Rs.classList.add("opened"),Ge([0,45]),Ze("swipe"),Oe(Ce)}',
    'es=B=>{var ps,Rs;const W=Y.current;if(W.finished||!F.current)return;W.finished=!0;const Ce=w*.52,Pe=F.current.querySelector(".spk-base");F.current.classList.add("cut","pageflip"),(ps=oe.current)==null||ps.animate([{opacity:1},{opacity:0}],{duration:180,fill:"forwards"});Pe&&(Pe.style.transformOrigin="50% 100%",Pe.animate([{transform:"perspective(900px) rotateX(0deg)"},{transform:"perspective(900px) rotateX(-102deg)",opacity:.2}],{duration:720,easing:"cubic-bezier(.2,.75,.2,1)",fill:"forwards"})),(Rs=ne.current)==null||Rs.classList.add("opened"),Ge([0,35]),Ze("swipe"),Oe(Ce)}',
  ],
  [
    "보고서 아래쪽을 위로 쓸어 올려요",
    "보고서를 아래에서 잡아 위로 넘기세요",
  ],
  [
    "보고서 아래쪽을 위로 쓸어 올려 주세요",
    "보고서를 아래에서 잡아 위로 넘기세요",
  ],
  [
    'children:"FLIP TO READ"',
    'children:"PAGE UP"',
  ],
];

for (const [a, b] of reps) {
  const n = s.split(a).length - 1;
  if (n !== 1) {
    console.error("FAIL count", n, "for", a.slice(0, 80));
    process.exit(1);
  }
  s = s.split(a).join(b);
  console.log("ok", a.slice(0, 48).replace(/\n/g, " "));
}

// FLIP TO READ may be in qu as text node without children:" wrapper after prior patch
if (s.includes("FLIP TO READ")) {
  s = s.split("FLIP TO READ").join("PAGE UP");
  console.log("ok FLIP TO READ global");
}

fs.writeFileSync(shellPath, s);
console.log("shell written");

let theme = fs.readFileSync(themeSrc, "utf8");
const marker = "/* PAGEFLIP_V2 */";
if (!theme.includes(marker)) {
  theme += `

${marker}
/* Kill tear/cut chrome — paper page lift */
.spk-top,
.spk-open,
.spk-perf,
.spk-seal,
.spk-micro,
.spk-crimp,
.spk-trail,
.spk-finger,
.spk-sp {
  display: none !important;
}
.spk-tip {
  top: auto !important;
  bottom: 10px !important;
  color: var(--ink) !important;
  font-weight: 600 !important;
}
.spk.big,
.spk.big.in {
  transform-style: preserve-3d;
  perspective: 900px;
}
.spk-base {
  transform-origin: 50% 100% !important;
  transition: transform 0.05s linear;
  will-change: transform;
  box-shadow:
    0 18px 28px -14px #00000099,
    0 1px 0 #c9b896 inset !important;
}
.spk.lifting .spk-base {
  filter: drop-shadow(0 -8px 18px rgba(240, 199, 94, 0.25));
}
.spk.pageflip .spk-base,
.spk.cut .spk-base {
  pointer-events: none;
}
.spk.cut.pageflip {
  animation: none !important;
}
.spk.gone {
  opacity: 0;
  transition: opacity 0.35s ease;
}
`;
  fs.writeFileSync(themeSrc, theme);
  console.log("theme extended");
}
fs.copyFileSync(themeSrc, themeDst);
console.log("done");
