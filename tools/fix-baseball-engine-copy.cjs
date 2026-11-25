/** Baseball match results, major-game decisions, scouting and record copy. */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ?? path.join(__dirname, "../apk-src");
const assets = path.join(root, "assets/public/assets");
const enginePath = path.join(assets, "engine-DhPc-c_J.js");
const marker = "/*CALLUP_BASEBALL_MATCH_AND_RECORDS*/";

function replaceExact(source, old, next) {
  if (!source.includes(old)) throw Error("Missing baseball engine anchor: " + old.slice(0, 130));
  return source.replace(old, () => next);
}

const edits = [
  ['if(m.length>=11)break;', 'if(m.length>=9)break;'],
  ['(e+(11-x.length)*35)/11', '(e+(9-x.length)*35)/9'],
  ['F=e0=>e0.reduce((I0,K0)=>I0+F8(K0),0)/11', 'F=e0=>e0.reduce((I0,K0)=>I0+F8(K0),0)/9'],
  ['y=p.slice().sort(ml).slice(0,11),h=y.reduce((F,w)=>F+w.ovr,0)/11', 'y=p.slice().sort(ml).slice(0,9),h=fd(y)'],
  ['function xa(x,e,t,n,l,r,i=!1)', `function callupExtraInning(rng,a,b,edge,requireWinner,limit=12){
  const home=.38*Math.exp(v(edge*.022,-.5,.5)),away=.38*Math.exp(v(-edge*.022,-.5,.5));
  for(let inning=10;inning<=limit&&a===b;inning++){
    a+=rng.poisson(home);
    b+=rng.poisson(away);
  }
  if(a===b&&requireWinner){
    if(rng.chance(v(.5+edge*.012,.3,.7)))a++;
    else b++;
  }
  return [a,b];
}
function xa(x,e,t,n,l,r,i=!1)`],
  ['Math.min(3.2,1.4*Math.exp(j*.055)*S[0]*I[1]),Q=Math.min(3.2,1.15*Math.exp(-j*.055)*I[0]*S[1])',
   'Math.min(8,4.2*Math.exp(j*.034)*S[0]*I[1]),Q=Math.min(8,4*Math.exp(-j*.034)*I[0]*S[1])'],
  ['G0?P=Hu(x,e,G0,Jc(G0,r),P,M):E&&(M=Hu(x,e,E,Jc(E,r),M,P));',
   'if(G0)P=Hu(x,e,G0,Jc(G0,r),P,M);if(E)M=Hu(x,e,E,Jc(E,r),M,P);[P,M]=callupExtraInning(e,P,M,j,!!r?.final,t.country==="한국"&&C[t.league]?.tier===1?11:12);'],
  ['P>M?($.w++,$.pts+=3,D.l++):P<M?(D.w++,D.pts+=3,$.l++):($.d++,D.d++,$.pts++,D.pts++)',
   'P>M?($.w++,D.l++):P<M?(D.w++,$.l++):($.d++,D.d++),$.pts=$.w,D.pts=D.w'],
  ['const Sr=x=>x.sort((e,t)=>t.pts-e.pts||t.gf-t.ga-(e.gf-e.ga)||t.gf-e.gf);',
   'const callupWinPct=row=>row.w/Math.max(1,row.w+row.l),callupGamesBack=(a,b)=>((a.w-b.w)+(b.l-a.l))/2;const Sr=x=>x.sort((e,t)=>callupWinPct(t)-callupWinPct(e)||t.w-e.w||t.gf-t.ga-(e.gf-e.ga)||t.gf-e.gf);'],
  ['y=O=>O>0&&O<f&&p[O-1].pts-p[O].pts<=3?[p[O].pts,p[O-1].pts]:null',
   'y=O=>O>0&&O<f&&Math.abs(callupGamesBack(p[O-1],p[O]))<=1?p[O-1]:null'],
  ['F=p.filter(O=>h.some(([j,S])=>O.pts>=j-3&&O.pts<=S+3))',
   'F=p.filter(O=>h.some(j=>Math.abs(callupGamesBack(j,O))<=1))'],
  ['xM=x=>x.pos==="RF"?Math.pow(x.stats.bat/70,3):x.pos==="SS"?.35*Math.pow(x.stats.bat/70,3):x.pos==="C"?.08:0',
   'xM=x=>x.pos==="P"?0:Math.pow(x.stats.bat/70,3)'],
  ['i=(b,p,f)=>{const y=b.str-p.str;let h=x.poisson(Math.min(3,1.25*Math.exp(y*.055))),F=x.poisson(Math.min(3,1.25*Math.exp(-y*.055)));f&&h===F&&(h+=x.poisson(.35*Math.exp(y*.055)),F+=x.poisson(.35*Math.exp(-y*.055))),r(b,h),r(p,F);const w=f&&h===F;return w&&(x.chance(v(.5+y*.01,.35,.65))?h++:F++),[h,F,w]}',
   'i=(b,p,knockout)=>{const y=b.str-p.str,home=x.poisson(Math.min(8,4*Math.exp(y*.038))),away=x.poisson(Math.min(8,4*Math.exp(-y*.038))),[h,F]=callupExtraInning(x,home,away,y,knockout);return r(b,h),r(p,F),[h,F,home===away]}'],
  ['for(let y=0;y<p;y++){const h=x.weighted(l.get(b),xM);h&&n.set(h.id,(n.get(h.id)??0)+1)}',
   'const hits=Math.max(p,x.poisson(6+p*.5));for(let y=0;y<hits;y++){const h=x.weighted(l.get(b),xM);h&&n.set(h.id,(n.get(h.id)??0)+1)}'],
  ['(M>s0?3:M===s0?1:0)', '(M>s0?1:0)'],
  ['(s0>M?3:M===s0?1:0)', '(s0>M?1:0)'],
  ['s.mi="90+"+e.int(1,5)+"\'"', 's.mi=a("9회")'],
  ['s.mi=e.int(86,90)+"\'"', 's.mi=a("{n}회",{n:e.int(7,9)})'],
  ['s.mi=e.int(55,80)+"\'"', 's.mi=a("{n}회",{n:e.int(5,8)})'],
  ['const p=e.pick(d||r==="nt"?Is.slice(1):Is);', 'const p=e.pick(d||r==="nt"||b.pos==="P"?Is.slice(1):Is);'],
  ['(t.bigCall.res===void 0&&fp(x,e,t,n),t.bigCall.res===1?r+1:t.bigCall.res===-1?Math.min(l,r):l)',
   '(t.bigCall.res===void 0&&(t.pos==="P"?t.bigCall.res=0:fp(x,e,t,n)),l+(t.pos!=="P"&&t.bigCall.res===1?1:0))'],
  ['F=M=>M.pos==="RF"?Math.pow((V2(M,"bat",0)*.55+V2(M,"bat",1)*.15+(h?V2(M,"phy",2):y===1?V2(M,"spd",0):V2(M,"bat",2))*.3)/70,3):M.pos==="SS"?.35*Math.pow((V2(M,"bat",0)*.4+V2(M,"bat",2)*.6)/70,3):M.pos==="C"?.08*Math.pow(V2(M,"phy",2)/60,2)*(h?1.3:1):0,w=y===0||y===6?0:h?1:2,O=M=>Math.pow((M.stats.fld*.4+V2(M,"fld",w)*.6)/70,2)*(M.pos==="SS"?1:M.pos==="RF"?.5:M.pos==="C"?.25:.02);for(let M=0;M<n;M++){const s0=e.weighted(t,F);if(s0&&(p.set(s0.id,(p.get(s0.id)??0)+1),e.chance(.7))){const G0=e.weighted(t.filter(E=>E!==s0),O);G0&&f.set(G0.id,(f.get(G0.id)??0)+1)}}',
   'F=M=>M.pos==="P"?0:Math.pow((V2(M,"bat",0)*.55+V2(M,"bat",1)*.15+(h?V2(M,"phy",2):y===1?V2(M,"spd",0):V2(M,"bat",2))*.3)/70,3),record=(map,batter)=>map.set(batter.id,(map.get(batter.id)??0)+1),batters=t.filter(M=>M.pos!=="P");if(batters.length){const hits=Math.max(n,e.poisson(6+n*.5));for(let M=0;M<hits;M++){const batter=e.weighted(batters,F);if(batter)record(p,batter)}for(let M=0;M<n;M++){const batter=e.weighted(batters,M=>.4*F(M)+(p.get(M.id)??0));if(batter)record(f,batter)}}'],
  ['M.pos==="RF"?D+=E*.8+$*.4:M.pos==="SS"?D+=E*.8+$*.55+n*.08+(M.stats.fld-70)*.008:M.pos==="C"?D+=E*.9+$*.4+(i0?.5:0)-l*.15+((V2(M,"fld",1)+V2(M,"fld",2))/2-70)*.008:D+=(i0?.55:0)+(s-l)*.35-l*.08+(M.stats.pit-70)*.008',
   'M.pos!=="P"?D+=E*.5+$*.3+(M.stats.fld-70)*.008+(i0?.2:0):D+=(i0?.55:0)+(s-l)*.25-l*.05+(M.stats.pit-70)*.008'],
  ['if(s0!=null&&s0.goal&&n>0&&!p.has(M.id)){const[e0,I0]=[...p][0]??[];e0!==void 0&&(I0>1?p.set(e0,I0-1):p.delete(e0)),p.set(M.id,1)}',
   'if(s0?.goal&&M.pos!=="P"&&n>0)for(const stat of [p,f]){if(stat.has(M.id))continue;const [id,count]=stat.entries().next().value??[];if(id!==void 0){if(count>1)stat.set(id,count-1);else stat.delete(id)}stat.set(M.id,1)}'],
  ['qo(i,l+" "+e.name+" 타점왕"),Pn(i,t,1),Qx(i,1),U(x,i,a("{s} {l} 타점왕 ({n}타점)",{s:l,l:S2(e),n:i.st.h}),"honor",!0,"sc")',
   'qo(i,l+" "+e.name+" 안타왕"),Pn(i,t,.8),U(x,i,a("{s} {l} 안타왕 ({n}안타)",{s:l,l:S2(e),n:i.st.h}),"honor",!0,"as")'],
  ['qo(s,l+" "+e.name+" 안타왕"),Pn(s,t,.8),U(x,s,a("{s} {l} 안타왕 ({n}도움)",{s:l,l:S2(e),n:s.st.rbi}),"honor",!0,"as")',
   'qo(s,l+" "+e.name+" 타점왕"),Pn(s,t,1),Qx(s,1),U(x,s,a("{s} {l} 타점왕 ({n}타점)",{s:l,l:S2(e),n:s.st.rbi}),"honor",!0,"sc")'],
  ['ws=x=>x.endsWith("우승")&&NC.some(e=>x.includes(e))',
   'ws=callupNationalCupWin'],
  ['id:"cupwin",name:"대륙 컵 우승",title:"챔피언스 에이전트",desc:"선수가 대륙 클럽 대회에서 우승해요",...Vt(Pl(x=>x.endsWith("우승")&&j_.some(e=>x.includes(e))))',
   'id:"cupwin",name:"국제대회 우승",title:"우승팀의 에이전트",desc:"선수가 프리미어12·올림픽·아시안게임·아시아야구선수권에서 우승해요",...Vt(Pl(callupNationalCupWin))'],
  ['function NE(x,e){', 'function callupNationalCupWin(honor){return /(?:프리미어12|올림픽|아시안게임|아시아야구선수권) 우승(?:$|[ (])/.test(honor)}function NE(x,e){'],
  ['h=>h.endsWith("우승")&&j_.some(F=>h.includes(F))', 'callupNationalCupWin'],
  ['w:Ul(e,"cup"),hist:ia(e,"cup")', 'w:Ul(e,"nt"),hist:ia(e,"nt")'],
  ['b5=x=>Y(x).filter(e=>{const t=e.club>=0?C[x.clubs[e.club].league]:void 0;return!!t&&t.tier===1&&t.level>=73}).length',
   'b5=x=>Y(x).filter(e=>{const team=x.clubs[e.club],league=team&&C[team.league];return league?.tier===1&&["한국","일본","대만","미국"].includes(league.country)}).length'],
  ['n:"안타왕",w:61,ok:x=>x.ast>=100', 'n:"타점 생산기",w:61,ok:x=>x.ast>=100'],
  ['je(x).pac', 'je(x).spd'],
  ['je(x).pas', 'je(x).fld'],
  ['je(x).def', 'je(x).fld'],
  ['je(x).dri', 'je(x).spd'],
];

const copy = [
  ["장점: 불붙으면 펄펄 날아요. 단점: 퇴장과 다툼이 잦아요.", "장점: 기세가 오르면 강해요. 단점: 항의가 길어 징계를 받기도 해요.", "Strength: rises with momentum. Weakness: arguments can lead to discipline.", "Ventaja: rinde más cuando toma impulso. Desventaja: sus protestas pueden acabar en sanción."],
  ["후반 추가시간 PK", "9회 동점, 승부처", "Tie game in the ninth", "Empate en la novena"],
  ["동점인 채 추가시간에 PK를 얻는다면 누가 찰지 미리 정해 두재요.", "9회 동점에서 득점권 기회가 오면 자기 타석을 맡을지, 대타를 요청할지 정해 두재요.", "The game could be tied in the ninth. Take the at-bat or ask for a pinch hitter?", "El juego puede llegar empatado a la novena. ¿Batear o pedir un emergente?"],
  ["직접 차기", "내가 타석에 선다", "Take the at-bat", "Tomar el turno al bate"],
  ["동료에게 양보", "대타를 요청한다", "Ask for a pinch hitter", "Pedir un bateador emergente"],
  ["동료에게 PK를 양보했어요. 팀 분위기가 좋아졌어요.", "대타를 요청했어요. 동료가 준비할 시간을 벌었어요.", "He asked for a pinch hitter and gave his teammate time to prepare.", "Pidió un bateador emergente y dio tiempo a su compañero para prepararse."],
  ["결정적 클러치 골", "9회 결정타", "Ninth-inning clutch hit", "Hit decisivo en la novena"],
  ["{c} 결승전 결승골", "{c} 결승전 결정타", "Clutch hit in the {c} final", "Hit decisivo en la final de {c}"],
  ["결승전 결승골", "결승전 결정타", "Clutch hit in the final", "Hit decisivo en la final"],
  ["직접 찬 PK가 결승골이 됐어요.", "득점권에서 적시타를 쳤어요.", "He came through with an RBI hit.", "Conectó un hit productor."],
  ["추가시간 클러치 골", "9회 적시타", "Ninth-inning RBI hit", "Hit productor en la novena"],
  ["클러치 실축 충격", "승부처 범타 충격", "Clutch at-bat disappointment", "Decepción en un turno clave"],
  ["실축…", "범타…", "Out…", "Out…"],
  ["직접 찬 PK가 펜스를 벗어났어요.", "타구가 야수 정면으로 가 득점 기회를 놓쳤어요.", "The ball went straight to a fielder and the scoring chance passed.", "Bateó directo a un defensor y se escapó la ocasión de anotar."],
  ["추가시간 클러치 실축", "9회 득점 기회 무산", "Ninth-inning opportunity missed", "Oportunidad perdida en la novena"],
  ["풀타임 투혼", "끝까지 버틴 경기", "Finished the game", "Terminó el juego"],
  ["풀타임!", "끝까지 출전!", "Stayed in!", "¡Siguió en el juego!"],
  ["승부차기 우승", "연장 승리", "Extra-inning win", "Victoria en entradas extras"],
  ["승부차기 탈락", "연장 패배", "Extra-inning loss", "Derrota en entradas extras"],
  ["{g}골", "{g}안타", "{g} hits", "{g} hits"],
  ["골잡이 메이커", "타점왕의 에이전트", "RBI Leader's Agent", "Agente del líder en impulsadas"],
  ["챔피언스 에이전트", "우승팀의 에이전트", "Champion's Agent", "Agente del campeón"],
  ["대륙 컵 우승", "국제대회 우승", "International Title", "Título internacional"],
  ["대륙 클럽 대회 우승 {n}번", "국제대회 우승 {n}번", "{n} international titles", "{n} títulos internacionales"],
  ["대륙 연맹", "대표팀 운영진", "National Team Staff", "Equipo técnico de la selección"],
  ["대륙 연맹 회장", "대표팀 운영 책임자", "National Team Director", "Director de la selección"],
  ["선수가 대륙 클럽 대회에서 우승하게 해 주세요", "선수가 프리미어12·올림픽·아시안게임·아시아야구선수권에서 우승하게 해 주세요", "Have a player win the Premier12, Olympics, Asian Games or Asian Baseball Championship", "Logra que un jugador gane el Premier12, los Juegos Olímpicos, los Juegos Asiáticos o el Campeonato Asiático de Béisbol"],
  ["선수가 대륙 클럽 대회에서 {n}번 우승하게 해 주세요", "선수가 프리미어12·올림픽·아시안게임·아시아야구선수권에서 {n}번 우승하게 해 주세요", "Have a player win {n} titles across the Premier12, Olympics, Asian Games and Asian Baseball Championship", "Logra que un jugador gane {n} títulos entre el Premier12, los Juegos Olímpicos, los Juegos Asiáticos y el Campeonato Asiático de Béisbol"],
  ["선수가 대륙 클럽 대회에서 우승해요", "선수가 프리미어12·올림픽·아시안게임·아시아야구선수권에서 우승해요", "A player wins the Premier12, Olympics, Asian Games or Asian Baseball Championship", "Un jugador gana el Premier12, los Juegos Olímpicos, los Juegos Asiáticos o el Campeonato Asiático de Béisbol"],
  ["유럽 스카우트 연합", "프로 스카우트 협회", "Pro Scouts Association", "Asociación de ojeadores profesionales"],
  ["선수 {n}명을 5대 리그 1부 구단에서 뛰게 해 주세요", "선수 {n}명을 한국·일본·대만·미국의 최상위 리그에 등록해 주세요", "Register {n} players in the top leagues of Korea, Japan, Taiwan or the US", "Inscribe a {n} jugadores en las máximas ligas de Corea, Japón, Taiwán o EE. UU."],
  ["빅이어의 사나이", "반지 수집가", "Ring Collector", "Coleccionista de anillos"],
  ["득점 기계", "타점 기계", "RBI Machine", "Máquina de impulsadas"],
  ["골잡이", "해결하는 타자", "Clutch Hitter", "Bateador decisivo"],
  ["골의 화신", "200안타 클럽", "200-Hit Club", "Club de los 200 hits"],
  ["30골 괴물", "시즌 30안타", "30-Hit Season", "Temporada de 30 hits"],
  ["득점 머신", "100안타 클럽", "100-Hit Club", "Club de los 100 hits"],
  ["20골 클럽", "시즌 20안타", "20-Hit Season", "Temporada de 20 hits"],
  ["대륙 컵의 사나이", "토너먼트 해결사", "Tournament Hitter", "Bateador de torneos"],
  ["철벽 수문장", "마운드의 에이스", "Mound Ace", "As del montículo"],
  ["거미손", "삼진 본능", "Strikeout Instinct", "Instinto de ponchador"],
  ["중원의 지배자", "내야의 지휘자", "Infield Commander", "Líder del cuadro"],
  ["패스 마스터", "수비 장인", "Fielding Specialist", "Especialista defensivo"],
  ["총알 풀백", "재빠른 포수", "Quick Catcher", "Receptor veloz"],
  ["타자보다 벽을 더 사랑하시네요", "배터리 구성만큼은 확실하네요", "You know how to build a battery.", "Sabes formar una batería."],
  ["벽돌 수집가", "배터리 전문가", "Battery Specialist", "Especialista en baterías"],
  ["DF, GK 비율", "투수·포수 비율", "Pitchers and catchers", "Lanzadores y receptores"],
  ["못 지나감", "주자는 여기까지", "Runner stops here", "El corredor se queda aquí"],
  ["태클 장인", "송구 달인", "Throwing Specialist", "Especialista en tiros"],
  ["공은 두고 가", "한 점도 안 줘", "Not a run today", "Hoy no anotan"],
  ["결승이나 더비에서 뭘 보여 준 적이 있나요?", "포스트시즌처럼 부담 큰 경기에서 보여 준 기록이 있나요?", "What has he done in high-pressure games like the postseason?", "¿Qué ha hecho en juegos de presión, como la postemporada?"],
  ["피지컬이 약합니다. 저희 리그에선 몸싸움에서 버티기 힘들 거예요.", "몸을 더 만들어야 합니다. 긴 시즌을 버틸 수 있을지 걱정돼요.", "He needs to get stronger to handle a long season.", "Necesita fortalecerse para aguantar una temporada larga."],
  ["역습 한 번이면 경기가 끝납니다. 이 속도는 가르쳐서 되는 게 아니죠.", "단타에도 한 베이스를 더 가는 선수입니다. 이런 주력은 가르치기 어렵죠.", "He takes the extra base on a single. You can't teach that speed.", "Toma una base extra con un sencillo. Esa velocidad no se enseña."],
  ["몸싸움에서 밀리는 걸 본 적이 없습니다. 어느 리그든 버팁니다.", "연전에도 몸 상태가 꾸준한 선수입니다.", "He holds up through back-to-back games.", "Mantiene la condición en juegos consecutivos."],
  ["공중볼 경합 승률이 리그 상위권이에요.", "시즌 후반에도 체력과 타구 속도가 잘 유지됐습니다.", "His stamina and exit velocity hold up late in the season.", "Mantiene su resistencia y la velocidad de salida a final de temporada."],
  ["큰 경기 체질입니다. 더비에서 안타 는 선수예요.", "큰 경기 체질입니다. 만원 관중 앞에서도 자기 스윙을 해요.", "He thrives on big games and sticks to his swing in a packed stadium.", "Se crece en los juegos importantes y mantiene su swing ante lleno total."],
  ["공격 포인트", "안타·타점 기록", "Hits and RBIs", "Hits e impulsadas"],
  ["이번 시즌만 벌써 공격 포인트 {n}개입니다.", "이번 시즌 안타와 타점을 합쳐 벌써 {n}개입니다.", "He already has {n} combined hits and RBIs this season.", "Ya suma {n} entre hits e impulsadas esta temporada."],
  ["숫자는 거짓말을 안 합니다. 올 시즌 {g}골 {a}도움이에요.", "올 시즌 {g}안타에 {a}타점을 기록했습니다.", "He has {g} hits and {a} RBIs this season.", "Lleva {g} hits y {a} carreras impulsadas esta temporada."],
  ["90분을 끝까지 뛸 체력이 남아 있는지부터 확인해야겠습니다.", "연전에도 몸 상태를 유지할 수 있는지부터 보겠습니다.", "First I need to see how well he holds up in a long series.", "Primero quiero ver cómo aguanta una serie larga."],
  ["시즌 막판 순위 싸움에선 이런 선수가 승점을 지킵니다.", "시즌 막판 순위가 걸린 연전에서 믿을 수 있는 선수입니다.", "He's a player you can trust when the standings are on the line.", "Es un jugador de confianza cuando la clasificación está en juego."],
  ["역습 한 번에 경기를 끝내는 발입니다.", "안타 하나면 2루에서 홈까지 들어올 주력입니다.", "He's quick enough to score from second on a single.", "Tiene velocidad para anotar desde segunda con un sencillo."],
  ["상대 수비 라인이 이 선수 때문에 열 걸음은 물러섭니다.", "1루에 서 있으면 상대 배터리가 견제부터 생각합니다.", "When he's on first, the battery has to watch him.", "Cuando llega a primera, la batería no puede perderlo de vista."],
  ["후반 막판 지친 수비 상대로는 거의 반칙입니다.", "경기 후반에도 상대 수비의 작은 실수를 놓치지 않아요.", "He still takes advantage of small fielding mistakes late in the game.", "Aprovecha los errores defensivos incluso al final del juego."],
  ["90분 내내 부딪혀도 체력이 안 떨어집니다.", "긴 연전에도 타격과 수비의 집중력이 떨어지지 않습니다.", "He stays sharp at the plate and in the field through a long series.", "Mantiene la concentración al bate y a la defensa en una serie larga."],
  ["상대 선수들이 이 선수와 부딪히기를 피합니다. 영상에 다 나와요.", "연전 막바지에도 타구 속도가 살아 있습니다. 영상에서도 보여요.", "His exit velocity holds up even at the end of a long series.", "Su velocidad de salida se mantiene incluso al final de una serie larga."],
  ["종료 직전 골이 커리어에 몇 개인지 세어 보셨습니까?", "9회 동점에서 나온 적시타만 따로 세어 보셨습니까?", "Have you counted his RBI hits in tied ninth innings?", "¿Ha contado sus hits productores en novenas entradas empatadas?"],
  ["프리킥 한 방이 승점 3점입니다.", "희생플라이 하나로 3루 주자를 불러들일 수 있습니다.", "He can bring a runner home from third with a sacrifice fly.", "Puede remolcar al corredor de tercera con un elevado de sacrificio."],
  ["번트 하나하나가 기회가 되는 킥입니다.", "번트를 대면 수비가 처리하기 어려운 곳에 떨어뜨립니다.", "He places bunts where the defense has a tough play.", "Coloca los toques donde a la defensa le cuesta una jugada."],
  ["박스 근처에서 반칙만 얻어도 상대 투수가 긴장합니다.", "득점권에 주자가 있으면 상대 투수의 실투를 놓치지 않습니다.", "He punishes mistakes with runners in scoring position.", "Castiga los errores con corredores en posición de anotar."],
  ["훈련 끝나고 혼자 프리킥 백 개씩 차는 선수입니다.", "훈련이 끝나도 남아서 밀어 치기를 연습합니다.", "He stays after practice to work on opposite-field hitting.", "Se queda después de entrenar para practicar el bateo hacia la banda contraria."],
  ["공격 포인트 {n}개입니다. 단장님이 사시는 건 이 숫자예요.", "안타와 타점을 합쳐 {n}개입니다. 꾸준히 득점 기회를 만들죠.", "He has {n} combined hits and RBIs. He consistently creates scoring chances.", "Suma {n} entre hits e impulsadas. Crea ocasiones de anotar con regularidad."],
  ["골이 필요할 때 공이 이 선수한테 갑니다. 이유가 있죠.", "득점이 필요할 때 이 선수의 타순이면 더그아웃이 들썩입니다.", "The dugout perks up when he's due up with a run needed.", "El dugout se anima cuando le toca batear y hace falta una carrera."],
  ["홈그로운 쿼터 생각하시면 이만한 카드가 없습니다.", "오래 함께할 국내 유망주를 찾으신다면 이만한 선수가 없습니다.", "If you want a domestic prospect to build around, he's your player.", "Si busca un prospecto local para construir su equipo, es su jugador."],
  ["경기 중에 전술을 바꿔도 교체 카드를 안 쓰셔도 됩니다.", "대타를 낸 뒤에도 여러 수비 위치를 맡길 수 있습니다.", "He can cover several fielding positions after you use a pinch hitter.", "Puede cubrir varias posiciones después de usar un bateador emergente."],
  ["그 자리는 저희 유스에서 올릴 선수도 있습니다.", "그 자리는 저희 2군에도 올려 쓸 선수가 있습니다.", "We can call someone up from our second team for that spot.", "Podemos subir a alguien del segundo equipo para ese puesto."],
  ["전술 미팅을 통역으로 들으면 절반은 놓칩니다.", "사인과 수비 지시를 바로 알아들어야 합니다. 적응이 필요하겠죠.", "He'll need time to learn our signs and fielding instructions.", "Necesitará tiempo para aprender nuestras señas e instrucciones defensivas."],
  ["유스 코치들이 10년에 한 명 나올까 말까 한 재능이라고 합니다.", "육성 코치들이 10년에 한 명 나올까 말까 한 재능이라고 합니다.", "Our development coaches call him a once-in-a-decade talent.", "Nuestros entrenadores de desarrollo dicen que es un talento que aparece una vez por década."],
  ["스쿼드 운용이 훨씬 편해지실 거예요.", "엔트리 운용이 훨씬 편해지실 거예요.", "He'll make roster management much easier.", "Facilitará mucho la gestión del plantel."],
  ["투수는 한 명만 뜁니다. 그 한 자리에 이 돈은 과합니다.", "선발진과 불펜에 쓸 예산이 따로 있습니다. 지금은 그 금액이 어렵습니다.", "Our rotation and bullpen have separate budgets. We can't spend that much right now.", "Tenemos presupuestos separados para la rotación y el bullpen. Ahora no podemos gastar tanto."],
  ["앞으로 몇 시즌은 매주 선발로 믿고 쓰실 수 있습니다.", "앞으로 몇 시즌은 1군 엔트리에서 믿고 쓰실 수 있습니다.", "You can count on him on the first-team roster for the next few seasons.", "Puede contar con él en el primer equipo durante las próximas temporadas."],
  ["계약금로", "계약금으로", "as a signing bonus", "como bono de firma"],
  ["{p}, 유니폼을 거꾸로 입고 전반 내내 뛰어", "{p}, 유니폼을 거꾸로 입은 채 첫 타석에 들어서", "{p} went up for his first at-bat with his jersey on backward", "{p} salió a su primer turno con el uniforme al revés"],
  ['{c} 구단 식당 새 메뉴 "승점 3 김치찌개" 인기', '{c} 구단 식당 새 메뉴 "끝내기 김치찌개" 인기', '{c} cafeteria serves a popular “walk-off kimchi stew”', 'Triunfa el «estofado de kimchi del walk-off» en el comedor de {c}'],
  ["{p}, 생일 케이크 촛불을 프리킥처럼 차서 껐다", "{p}, 생일 케이크를 자르기 전 배트처럼 칼을 휘둘러 동료들 웃음", "{p} made teammates laugh by taking a practice swing with the cake knife", "{p} hizo reír al equipo al ensayar un swing con el cuchillo de la tarta"],
  ["{c} 경기장 전광판, 하프타임에 고양이 영상 틀어 박수", "{c} 경기장 전광판, 7회 종료 뒤 고양이 영상 틀어 박수", "{c} crowd cheered a cat video after the seventh", "La afición de {c} aplaudió un video de gatos tras la séptima"],
  ["{p}, SNS에 올린 요리 영상 조회수가 골 영상 추월", "{p}, SNS 요리 영상 조회수가 홈런 영상 추월", "{p}'s cooking clip outdrew his home run video", "El video de cocina de {p} superó en visitas al de su jonrón"],
  ["{c} 하프타임 이벤트, 관중 승부차기에서 할머니 우승", "{c} 이닝 교대 이벤트, 시구 정확도 대결에서 할머니 우승", "A grandmother won {c}'s between-innings pitching contest", "Una abuela ganó el concurso de lanzamientos de {c} entre entradas"],
  ["{c} 마스코트, 상대 마스코트와 하프타임 댄스 배틀", "{c} 마스코트, 이닝 교대 때 원정팀 마스코트와 댄스 대결", "{c}'s mascot challenged the visitors' mascot to a dance-off between innings", "La mascota de {c} retó a la visitante a bailar entre entradas"],
  ["{p}, 팬이 던진 꽃다발을 헤딩으로 받아 박수", "{p}, 팬이 던진 꽃다발을 글러브로 받아 박수", "{p} got cheers for catching a fan's bouquet in his glove", "{p} recibió aplausos por atrapar con el guante un ramo de la afición"],
  ['{p}, 끈 풀린 야구화로 결승 도움… "끈이 행운"', '{p}, 끈 풀린 야구화로 결승 득점… "끈이 행운"', '{p} scored the winning run with an untied cleat: “Lucky lace”', '{p} anotó la carrera del triunfo con un cordón suelto: «Da suerte»'],
  ["{c} 구단 고양이, 기자석 노트북 위에서 90분 내내 낮잠", "{c} 구단 고양이, 기자석 노트북 위에서 경기 내내 낮잠", "{c}'s ballpark cat slept on a press box laptop all game", "El gato de {c} durmió todo el juego sobre un portátil de prensa"],
  ["{c} 감독, 하프타임 연설 도중 화이트보드 마커가 안 나와 손짓으로 대신", "{c} 감독, 경기 전 미팅에서 화이트보드 마커 대신 손짓으로 작전 설명", "{c}'s manager used hand signals when his marker dried up before the game", "El mánager de {c} usó señas al secarse el marcador antes del juego"],
  ["{c} 선수단, 단체 회식에서 고기 굽는 담당을 두고 승부차기", "{c} 선수단, 회식에서 고기 굽는 담당을 가위바위보로 결정", "{c} players settled grill duty by rock-paper-scissors", "Los jugadores de {c} decidieron quién cocinaba con piedra, papel o tijera"],
  ["{c} 홈구장 비둘기, 90분 내내 펜스 위에서 경기 관람", "{c} 홈구장 비둘기, 9회까지 펜스 위에서 경기 관람", "{c}'s ballpark pigeon stayed on the fence through the ninth", "La paloma del estadio de {c} siguió en la valla hasta la novena"],
  ['{p}, 프리킥 직전 신발 끈 묶다 심판에게 "천천히 하라"는 말 들어', "{p}, 타석에서 신발 끈 묶다가 타임을 한 번 더 요청", "{p} asked for time again to tie his cleats at the plate", "{p} volvió a pedir tiempo para atarse los cordones en el plato"],
  ['{p}, 생애 첫 헤딩골 뒤 "눈 감고 있었다" 고백', '{p}, 생애 첫 홈런 뒤 "공이 넘어간 줄 몰랐다" 고백', '{p} after his first homer: “I didn’t realize it went out”', '{p} tras su primer jonrón: «No vi que salió»'],
  ["{p}, 경기 중 관중석에서 날아온 비치볼을 트래핑해 박수", "{p}, 외야로 날아온 비치볼을 맨손으로 잡아 관중 환호", "{p} drew cheers with a barehanded catch of a beach ball", "{p} se llevó aplausos al atrapar una pelota de playa a mano limpia"],
  ["일본 구단들의 오일머니 공세로 영입시장 과열", "일본 구단들의 연이은 대형 계약으로 FA 시장 과열", "Big deals from Japanese clubs heat up free agency", "Los grandes contratos japoneses calientan la agencia libre"],
  ["미국 자본의 유럽 구단 연쇄 인수", "새 구단주들의 투자로 미국 구단 영입 경쟁 가열", "New ownership spending raises competition among US clubs", "Los nuevos propietarios intensifican la competencia entre clubes de EE. UU."],
];

function quoted(text) {
  const single = "'" + text.replaceAll("\\", "\\\\").replaceAll("'", "\\'") + "'";
  return [JSON.stringify(text), single];
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function translate(locale, column) {
  const file = path.join(assets, locale);
  let source = fs.readFileSync(file, "utf8");
  if (source.includes(marker)) return;
  for (const row of copy) {
    const [old, next] = row;
    const keys = quoted(old).map(escapeRegex);
    if (/^[가-힣]+$/.test(old)) keys.push("(?<![가-힣])" + old);
    const entry = new RegExp("(?:" + keys.join("|") +
      '):"(?:[^"\\\\]|\\\\.)*"', "g");
    source = source.replace(entry, () => JSON.stringify(next) + ":" + JSON.stringify(row[column]));
  }
  fs.writeFileSync(file, source.trimEnd() + "\n" + marker + "\n");
}

let engine = fs.readFileSync(enginePath, "utf8");
if (!engine.includes(marker)) {
  for (const [old, next] of edits) {
    if (old.startsWith("je(x).")) {
      if (!engine.includes(old)) throw Error("Missing legacy stat: " + old);
      engine = engine.replaceAll(old, next);
    } else {
      engine = replaceExact(engine, old, next);
    }
  }
  for (const [old, next] of copy) {
    for (const key of quoted(old)) engine = engine.replaceAll(key, () => JSON.stringify(next));
  }
  fs.writeFileSync(enginePath, engine.trimEnd() + "\n" + marker + "\n");
}

translate("ui-DgYnPcSw.js", 2);
translate("ui-DSX53OnJ.js", 3);
console.log("CallUp baseball match and record patch applied.");
