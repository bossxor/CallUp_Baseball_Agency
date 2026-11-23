const fs = require("fs");
const p = "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js";
let s = fs.readFileSync(p, "utf8");
const nh0 = s.indexOf("nh={");
let i = nh0 + 3;
let depth = 0;
let end = -1;
for (; i < s.length; i++) {
  if (s[i] === "{") depth++;
  else if (s[i] === "}") {
    depth--;
    if (depth === 0) {
      end = i;
      break;
    }
  }
}
let block = s.slice(nh0, end + 1);
const drills = [
  ["볼컨트롤", "컨택"],
  ["짧은패스", "송구"],
  ["민첩성", "베이스런"],
  ["시야", "선구"],
  ["가속력", "스타트"],
  ["최고속도", "전력질주"],
  ["결정력", "파워"],
  ["중거리", "선구"],
  ["가로채기", "포구"],
  ["태클", "수비범위"],
  ["대인마크", "포구"],
  ["밸런스", "근력"],
  ["드리블", "컨택"],
  ["슈팅파워", "파워"],
  ["롱패스", "송구"],
  ["점프", "근력"],
];
for (const [a, b] of drills) block = block.split(a).join(b);
s = s.slice(0, nh0) + block + s.slice(end + 1);

s = s.split("ah={FW:0,MF:1,DF:2}").join(
  'ah={RF:0,LF:0,CF:0,SS:1,"2B":1,C:2,"1B":2,"3B":2}'
);

const oLold =
  'oL=(x,e)=>x.pos==="P"?[]:nh[e][x.pos==="RF"?0:x.pos==="SS"?1:2]';
const oLnew =
  'oL=(x,e)=>x.pos==="P"?[]:nh[e][x.pos==="RF"||x.pos==="LF"||x.pos==="CF"?0:x.pos==="SS"||x.pos==="2B"?1:2]';
if (s.includes(oLold)) s = s.replace(oLold, oLnew);

fs.writeFileSync(p, s);
console.log({
  ah: s.includes("ah={RF:0"),
  start: s.includes("스타트"),
  accel: s.includes("가속력"),
  oL: s.includes('x.pos==="LF"'),
});
