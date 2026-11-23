/** More user-facing soccer residue → baseball. */
const fs = require("fs");
const path = require("path");
const assets = path.join(__dirname, "..", "apk-src", "assets", "public", "assets");

const pairs = [
  // caps / international
  ["A매치 100경기", "대표팀 100경기"],
  ["A매치 기념", "대표팀 기념"],
  ["A매치 유니폼", "대표팀 유니폼"],
  ["A매치 부상", "대표팀 부상"],
  ["성인 대표 A매치", "성인 대표팀"],
  ["A매치 {n}경기", "대표팀 {n}경기"],
  ['n("A매치")', 'n("대표팀")'],
  ["A매치", "대표팀"],
  // winger / dribble flavor
  ["치고 달리는 윙어형", "치고 달리는 외야형"],
  ["가장 빠른 윙어", "가장 빠른 외야수"],
  ["윙어들의 습관", "외야수들의 습관"],
  ["윙어", "외야수"],
  ["드리블 마법사", "주루 마법사"],
  ["드리블이 눈에 띄게", "주루가 눈에 띄게"],
  ["군화 신고 드리블", "군화 신고 캐치볼"],
  ["콘 사이 드리블", "콘 사이 스텝"],
  // cross / bar
  ["택배 크로스 배달 완료", "정확한 송구 배달 완료"],
  ["택배 크로스", "정확한 송구"],
  ["Crosses delivered", "Throws delivered"],
  ["Centros entregados", "Tiros entregados"],
  ["훈련장 크로스바 맞히기", "훈련장 파울폴 맞히기"],
  ["hit the crossbar", "hit the foul pole"],
  ["크로스바를 넘겼어요", "펜스를 넘겼어요"],
  ["크로스바", "파울폴"],
  // own goal / clean sheet / assist labels
  ["자책골과 고의사구", "실책과 고의사구"],
  ["자책골 두 개", "실책 두 개"],
  ["자책골", "실책"],
  ["클린시트", "완봉"],
  ["도움 장인", "타점 장인"],
  ["도움 두 개의 약속", "타점 두 개의 약속"],
  ['a("도움")', 'a("타점")'],
  ['n("도움")', 'n("타점")'],
  ['"{name}, 도움 {n}개를 기록했어요"', '"{name}, 타점 {n}개를 기록했어요"'],
  ["도움 {n}개를 기록했어요", "타점 {n}개를 기록했어요"],
  ["도움 {n}개.", "타점 {n}개."],
  ["made {n#ast}", "drove in {n#rbi}"],
  // goals leftovers in titles
  ["결승전 골", "결승전 안타"],
  ["리그 득점", "리그 타점"],
  ["오늘 두 골", "오늘 두 안타"],
  ['"two goals today"', '"two hits today"'],
  ["dos goles hoy", "dos hits hoy"],
  ["Final Hero", "Walk-off Hero"],
  // fee wording §8.1
  ["이적료", "계약금"],
  // self goal kick miss text artifact
  ["고의사구 실축", "고의사구 실수"],
];

for (const f of fs.readdirSync(assets).filter((x) => x.endsWith(".js"))) {
  const fp = path.join(assets, f);
  let s = fs.readFileSync(fp, "utf8");
  const before = s;
  let n = 0;
  for (const [a, b] of pairs) {
    if (!s.includes(a)) continue;
    const c = s.split(a).length - 1;
    s = s.split(a).join(b);
    n += c;
    console.log(f, c, a.slice(0, 48));
  }
  if (s !== before) {
    fs.writeFileSync(fp, s);
    console.log("wrote", f, n);
  }
}
console.log("done");
