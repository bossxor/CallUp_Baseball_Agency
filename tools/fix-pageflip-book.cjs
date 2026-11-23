/**
 * Scout report: book page-turn (rotateY from left spine), not bottom tip-over.
 * Gesture: grab right side, swipe left.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "apk-src");
const shellPath = path.join(root, "assets/public/assets/shell-DaKdX7f1.js");
const themeSrc = path.join(__dirname, "callup-theme.css");
const themeDst = path.join(root, "assets/public/callup-theme.css");

let s = fs.readFileSync(shellPath, "utf8");

const pairs = [
  // pointer down: remember X
  [
    'qe=B=>{var ce;const W=Y.current;if(!W.finished){W.down=!0;try{B.currentTarget.setPointerCapture(B.pointerId)}catch{}(ce=F.current)==null||ce.classList.add("cutting","lifting"),W.last=V(B),W.x0=W.last[1]}}',
    'qe=B=>{var ce;const W=Y.current;if(!W.finished){W.down=!0;try{B.currentTarget.setPointerCapture(B.pointerId)}catch{}(ce=F.current)==null||ce.classList.add("cutting","lifting"),W.last=V(B),W.x0=W.last[0]}}',
  ],
  // move: rotateY around left spine
  [
    'is=B=>{const W=Y.current;if(!W.down||W.finished)return;const ce=V(B);W.last=ce;const Ae=Math.max(0,Math.min(1,(W.x0-ce[1])/160));(W.base=W.base||F.current&&F.current.querySelector(".spk-base"))&&(W.base.style.transform="perspective(900px) rotateX("+(-Ae*78).toFixed(1)+"deg)",W.base.style.transformOrigin="50% 100%");Ne()&&es(1)}',
    'is=B=>{const W=Y.current;if(!W.down||W.finished)return;const ce=V(B);W.last=ce;const Ae=Math.max(0,Math.min(1,(W.x0-ce[0])/140));(W.base=W.base||F.current&&F.current.querySelector(".spk-base"))&&(W.base.style.transform="perspective(1200px) rotateY("+(-Ae*95).toFixed(1)+"deg)",W.base.style.transformOrigin="0% 50%");Ne()&&es(1)}',
  ],
  // threshold: horizontal left swipe
  [
    "Ne=()=>{const B=Y.current;return!!B.down&&!B.finished&&B.x0-B.last[1]>=56}",
    "Ne=()=>{const B=Y.current;return!!B.down&&!B.finished&&B.x0-B.last[0]>=64}",
  ],
  // release: use X delta
  [
    "const Pe=B.x0-(B.last?B.last[1]:B.x0);if(Pe>=56){es(1);return}",
    "const Pe=B.x0-(B.last?B.last[0]:B.x0);if(Pe>=64){es(1);return}",
  ],
  // complete anim: book page
  [
    'Pe&&(Pe.style.transformOrigin="50% 100%",Pe.animate([{transform:"perspective(900px) rotateX(0deg)"},{transform:"perspective(900px) rotateX(-102deg)",opacity:.2}],{duration:720,easing:"cubic-bezier(.2,.75,.2,1)",fill:"forwards"}))',
    'Pe&&(Pe.style.transformOrigin="0% 50%",Pe.animate([{transform:"perspective(1200px) rotateY(0deg)"},{transform:"perspective(1200px) rotateY(-88deg)",offset:.55},{transform:"perspective(1200px) rotateY(-160deg)",opacity:0}],{duration:780,easing:"cubic-bezier(.2,.7,.2,1)",fill:"forwards"}))',
  ],
  // tip copy
  [
    "보고서를 아래에서 잡아 위로 넘기세요",
    "책장 넘기듯 오른쪽을 잡아 왼쪽으로 쓸어 주세요",
  ],
  [
    'children:"PAGE UP"',
    'children:"TURN PAGE"',
  ],
];

let n = 0;
for (const [a, b] of pairs) {
  if (!s.includes(a)) {
    console.log("MISS", a.slice(0, 70));
    continue;
  }
  const c = s.split(a).length - 1;
  s = s.split(a).join(b);
  n += c;
  console.log("OK", c, a.slice(0, 48));
}
fs.writeFileSync(shellPath, s);
console.log("shell writes", n);

let theme = fs.readFileSync(themeSrc, "utf8");
const marker = "/* PAGEFLIP_BOOK_Y */";
if (!theme.includes(marker)) {
  // replace bottom-hit block with right-edge book turn
  theme = theme.replace(
    /\/\* PAGEFLIP_HIT_BOTTOM \*\/[\s\S]*?(?=\n\/\* |\n\.mo-crest|\n$)/,
    ""
  );
  theme += `

${marker}
/* Book page-turn: grab right edge, rotateY around left spine */
.spk.big,
.spk.big.in {
  transform-style: preserve-3d !important;
  perspective: 1200px !important;
}
.spk-base {
  transform-origin: 0% 50% !important;
  transform-style: preserve-3d !important;
  backface-visibility: hidden;
  box-shadow:
    8px 12px 28px -10px rgba(0, 0, 0, 0.45),
    inset -1px 0 0 rgba(0, 0, 0, 0.06) !important;
}
.spk.lifting .spk-base {
  filter: drop-shadow(-10px 8px 18px rgba(0, 0, 0, 0.28));
}
.spk-band2 {
  top: 0 !important;
  bottom: 0 !important;
  left: auto !important;
  right: -8px !important;
  width: 48% !important;
  height: auto !important;
  z-index: 12 !important;
  touch-action: none !important;
}
.spk-grab {
  position: absolute;
  inset: 0;
  z-index: 9;
  touch-action: none;
}
.spk.cut .spk-grab,
.spk.pageflip .spk-grab,
.spk.cut .spk-band2 {
  pointer-events: none;
}
.spk-tip {
  top: auto !important;
  bottom: 10px !important;
  z-index: 13 !important;
  pointer-events: none !important;
}
@keyframes callupPageFlip {
  0% { transform: perspective(1200px) rotateY(70deg); opacity: 0.35; }
  100% { transform: perspective(1200px) rotateY(0); opacity: 1; }
}
`;
  fs.writeFileSync(themeSrc, theme);
  console.log("theme book");
}
fs.copyFileSync(themeSrc, themeDst);
console.log("done");
