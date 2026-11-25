/** Baseball terminology in the news ticker, player dialogue and record screens. */
const fs = require("node:fs");
const path = require("node:path");

const root = process.argv[2] ?? path.join(__dirname, "../apk-src");
const assets = path.join(root, "assets/public/assets");
const shellFile = "shell-DaKdX7f1.js";
const yearFile = "yearSay-CxPvW4Nr.js";
const marker = "/*CALLUP_BASEBALL_SHELL_COPY*/";

const copy = [
  ["피치 밖은 답답해요", "경기를 못 나가니 답답해요", "I hate missing games", "Odio perderme los juegos"],
  ["오늘 골 봤어요?", "오늘 안타 봤어요?", "See my hit today?", "¿Viste mi hit de hoy?"],
  ["발끝 감각이 좋네요", "배트 감각이 좋네요", "The bat feels good", "Me siento bien con el bate"],
  ["패스 길 좀 봤죠?", "찬스에서 주자를 불러들였죠?", "Saw me drive in that run?", "¿Viste cómo remolqué esa carrera?"],
  ["타자 밥 떠먹여 줬죠", "주자들이 잘 뛰어 줬어요", "The runners did a great job", "Los corredores hicieron un gran trabajo"],
  ["MOM 받을 만했죠?", "오늘 경기 MVP 받을 만했죠?", "I earned game MVP, right?", "¿Me gané el MVP del juego?"],
  ["패스 길이 다 보여요", "코스가 다 보여요", "Every pitch looks clear", "Veo clarito cada lanzamiento"],
  ["패스 길이 다 보여요.", "코스가 다 보여요.", "Every pitch looks clear.", "Veo clarito cada lanzamiento."],
  ["수비라인 조율 완벽했어요", "배터리 호흡이 좋았어요", "The battery was in sync", "La batería estuvo bien coordinada"],
  ["요즘 골 침묵이 길어지네요", "요즘 무안타가 길어지네요", "This hitless stretch is dragging on", "Se alarga mi racha sin hits"],
  ["{name}, 떨어지는 리모컨을 발로 받으려다 다쳤어요. {w}주 쉬어요", "{name}, 타격 연습 중 손목을 삐끗했어요. {w}주 쉬어요", "{name} hurt a wrist in batting practice and will miss {w} weeks", "{name} se lesionó la muñeca en práctica de bateo. Baja de {w} semanas"],
  ["{name}, 무릎 슬라이딩 세리머니가 광고판까지 갔어요. {w}주 쉬어요", "{name}, 홈 쇄도 중 발목을 삐었어요. {w}주 쉬어요", "{name} hurt an ankle sliding home and will miss {w} weeks", "{name} se lesionó el tobillo al deslizarse en home. Baja de {w} semanas"],
  ["{name}, 돌아왔어요. 리모컨은 이제 손으로만 잡는대요", "{name}, 복귀했어요. 타격 연습도 다시 시작했대요", "{name} returned and resumed batting practice", "{name} volvió y retomó la práctica de bateo"],
  ["{name}, 골망을 흔들고 관중석에 하트를 날렸어요", "{name}, 안타를 치고 응원석을 향해 손을 흔들었어요", "{name} waved to the stands after a hit", "{name} saludó a la grada tras conectar un hit"],
  ["{name}, 타점 {n}개. 정확한 송구 배달 완료", "{name}, 타점 {n}개. 득점권에서 제 몫을 했어요", "{name} came through with {n} RBI", "{name} respondió con {n} carreras impulsadas"],
  ["{name}, 평점 {r}. 잔디가 미끄러웠대요", "{name}, 평점 {r}. 타이밍을 맞추기 어려웠대요", "{name} rated {r} and said the timing felt off", "{name} recibió nota {r} y dijo que no encontró el ritmo"],
  ["{name}, 훈련 끝나고 혼자 프리킥 100개. 골망이 지쳤어요", "{name}, 훈련이 끝난 뒤 타격장에서 스윙을 100번 더 했대요", "{name} took 100 extra swings after practice", "{name} dio 100 swings extra después de la práctica"],
  ["{name}, SNS에 올린 고양이 사진이 골 영상보다 인기예요", "{name}, SNS에 올린 고양이 사진이 안타 영상보다 인기예요", "{name}'s cat photo outperformed the hit highlight", "La foto del gato de {name} superó al video de su hit"],
  ["{name}, 아마추어 앞에서 리프팅 시범 중 공을 놓쳤어요", "{name}, 아마추어 선수들에게 포구 시범을 보이다 공을 놓쳤어요", "{name} dropped the ball in a fielding demo for amateurs", "{name} dejó caer la pelota al demostrar cómo fildear"],
  ["몰래 공 차다 걸렸어요.", "몰래 캐치볼하다 걸렸어요.", "I got caught playing catch.", "Me descubrieron jugando a atrapar la pelota."],
  ["휴가 나가면 공부터 찰 거예요.", "휴가 나가면 캐치볼부터 할 거예요.", "First thing on leave: play catch.", "Lo primero en el permiso: jugar a atrapar la pelota."],
  ["마지막 골은 꼭 넣고 싶어요.", "마지막 안타는 꼭 치고 싶어요.", "I want one last hit.", "Quiero conectar un último hit."],
  ["전술 노트 외우느라 바빠요.", "팀 사인을 외우느라 바빠요.", "I'm busy learning the team's signs.", "Estoy ocupado aprendiendo las señas del equipo."],
  ["첫 안타 으면 적응 끝이에요.", "첫 안타가 나오면 마음이 놓일 거예요.", "I'll settle in after my first hit.", "Estaré tranquilo después de mi primer hit."],
  ["공이 발에 착착 붙어요.", "공이 글러브에 척척 들어와요.", "The ball keeps finding my glove.", "La pelota siempre cae en mi guante."],
  ["요즘 어깨싸움에서 안 밀려요.", "요즘 빠른 공에도 배트가 밀리지 않아요.", "My bat is catching up to fast pitches lately.", "Últimamente le agarro el ritmo a las rectas."],
  ["약한 발로만 하루 종일 찼어요.", "까다로운 코스만 하루 종일 연습했어요.", "I drilled my toughest pitch location all day.", "Practiqué todo el día contra los lanzamientos que más me cuestan."],
  ["코치님 휘슬 소리가 꿈에서도 들려요.", "코치님이 치는 펑고 소리가 꿈에서도 들려요.", "I hear the coach's fungo bat in my sleep.", "Duermo oyendo al entrenador batear roletazos."],
  ["어젯밤 꿈에서 본 골을 오늘 넣었어요.", "어젯밤 꿈에 나온 홈런을 오늘 쳤어요.", "I hit the homer I dreamed of last night.", "Hoy di el jonrón que soñé anoche."],
  ["공이 발에 안 붙어요.", "공이 배트 중심에 안 맞아요.", "Nothing's finding the barrel.", "No logro darle con el centro del bate."],
  ["패스가 자꾸 끊겨요.", "송구가 자꾸 빗나가요.", "My throws keep missing.", "Mis tiros siguen desviándose."],
  ["한 골만 들어가면 풀릴 거예요.", "안타 하나면 감을 찾을 거예요.", "One hit should get me going.", "Un hit y recuperaré el ritmo."],
  ["골 냄새가 나요.", "안타가 나올 것 같아요.", "A hit is coming.", "Siento que viene un hit."],
  ["발끝 감각이 살아 있어요.", "배트가 손에 잘 감겨요.", "The bat feels right in my hands.", "Siento el bate firme en las manos."],
  ["골 세리머니 새로 준비해야겠어요.", "다음 홈런 땐 동료들이랑 새 인사를 해 볼래요.", "I'll try a new dugout greeting after my next homer.", "Probaré un saludo nuevo en el dugout tras mi próximo jonrón."],
  ["다음 골은 대표님한테 바칠게요.", "다음 안타는 대표님한테 바칠게요.", "My next hit is for you, boss.", "Mi próximo hit es para usted."],
  ["경고 누적은 제 전문이에요.", "판정에 항의하다 또 벤치·대기에서 혼났어요.", "I got chewed out for arguing a call again.", "Me regañaron otra vez por protestar una decisión."],
  ["PK는 제가 찰게요.", "끝내기 찬스엔 저를 써 주세요.", "Put me in with the winning run on base.", "Póngame cuando la carrera del triunfo esté en base."],
  ["마지막 순간에 공은 저한테 주세요.", "승부처엔 제 차례가 왔으면 좋겠어요.", "I want my turn when the game is on the line.", "Quiero que me toque cuando se decide el juego."],
  ["더비 주간이 제일 설레요.", "라이벌과 만나는 시리즈가 제일 설레요.", "I get most excited for rivalry series.", "La serie contra nuestro rival es la que más me emociona."],
  ["결승 안타 는 꿈을 자주 꿔요.", "끝내기 안타를 치는 꿈을 자주 꿔요.", "I dream of hitting a walk-off.", "Sueño con dar un hit para ganar el juego."],
  ["추가 시간은 제 시간이에요.", "연장전에 더 집중돼요.", "I'm more focused in extra innings.", "Me concentro más en entradas extra."],
  ["실축하는 꿈을 꿨어요.", "찬스에서 삼진당하는 꿈을 꿨어요.", "I dreamed I struck out with runners on.", "Soñé que me ponchaban con corredores en base."],
  ["연습 때는 잘 들어가는데요.", "연습 때는 공이 잘 맞는데요.", "I make solid contact in practice.", "En la práctica sí le doy bien a la pelota."],
  ["승부차기 명단에선 빼 주세요.", "끝내기 찬스에 대타로 나가면 너무 떨려요.", "I'd be shaking as a pinch hitter with the game on the line.", "Me temblarían las piernas como emergente con el juego por decidir."],
  ["추가 시간에 공 오면 무서워요.", "연장전에 타구가 제 쪽으로 올까 봐 겁나요.", "I'm scared the ball will find me in extras.", "Temo que la pelota venga hacia mí en entradas extra."],
  ["태클 들어오면 일단 피하고 봐요.", "주자가 베이스로 들어오면 충돌부터 피하고 봐요.", "I stay clear when a runner slides in.", "Me aparto cuando un corredor se desliza hacia la base."],
  ["정강이 보호대는 두 겹으로 차요.", "타석에 들어갈 땐 발등 보호대를 꼭 차요.", "I wear a foot guard at the plate.", "Siempre uso un protector de pie al batear."],
  ["풀타임은 기본이죠.", "연전에도 빠지지 않아요.", "I don't miss games in a long stretch.", "No me pierdo juegos en una seguidilla."],
  ["태클 들어와도 끄떡없어요.", "몸에 맞는 공에도 끄떡없어요.", "A hit by pitch won't stop me.", "Un pelotazo no me frena."],
  ["오늘은 뒤꿈치로 넣어 볼까요?", "오늘은 밀어 쳐서 반대쪽 담장을 넘겨 볼까요?", "Maybe I'll go deep to the opposite field today.", "Quizá hoy la saque por la banda contraria."],
  ["평범한 패스는 재미없어요.", "평범한 수비보다 어려운 타구가 재밌어요.", "I like the challenge of a tough play.", "Me gusta el reto de una jugada difícil."],
  ["라보나 연습 중이에요.", "글러브로 공을 토스하는 연습 중이에요.", "I'm practicing glove flips.", "Practico pases cortos con el guante."],
  ["골보다 타점가 더 멋질 때도 있죠.", "홈런 못지않게 멋진 희생타도 있죠.", "A sacrifice can be as good as a home run.", "Un sacrificio puede valer tanto como un jonrón."],
  ["노룩 패스가 제 특기예요.", "러닝 스로가 제 특기예요.", "Throwing on the run is my specialty.", "Lanzar en carrera es mi especialidad."],
  ["가랑이 사이로 빼는 게 제일 재밌어요.", "협살에서 빠져나오는 게 제일 재밌어요.", "I love escaping a rundown.", "Me encanta escapar de un corre corre."],
  ["오버헤드킥 연습하다 넘어졌어요.", "다이빙 캐치 연습하다 고꾸라졌어요.", "I took a spill practicing diving catches.", "Me caí practicando atrapadas de clavado."],
  ["프리킥은 무조건 감아 차요.", "빠른 공은 망설이지 않고 잡아당겨요.", "If I see a fastball, I pull it.", "Si veo una recta, la halo."],
  ["짧은 패스가 제일 정확해요.", "가까운 베이스부터 확실하게 던져요.", "I take the sure throw to the closest base.", "Aseguro el tiro a la base más cercana."],
  ["헛다리는 짚어 본 적이 없어요.", "안 되는 도루는 시도하지 않아요.", "I don't try to steal a base I can't take.", "No intento robar una base si no voy a llegar."],
  ["공은 옆으로 주면 돼요.", "외야에선 중계 플레이가 먼저예요.", "Hit the cutoff man from the outfield.", "Desde los jardines busco al cortador."],
  ["멋 부리다 뺏기면 끝이에요.", "멋 부리다 놓치면 실책이죠.", "Show off and drop it, that's an error.", "Si por lucirte se te cae, es un error."],
  ["인사이드 패스면 충분해요.", "기본 동작으로 잡으면 충분해요.", "Sound fielding fundamentals are enough.", "Con fildear bien basta."],
  ["패스 성공률이 제 자존심이에요.", "실책 없이 시즌을 보내는 게 제 자존심이에요.", "I take pride in an error-free season.", "Me enorgullece pasar la temporada sin errores."],
  ["공을 찬다", "공을 던진다", "Throw the ball", "Lanzar la pelota"],
  ["그라운드에서 뵙죠", "구장에서 뵙죠", "See you at the ballpark", "Nos vemos en el estadio"],
  ["팀 전술", "팀 스타일", "Team Style", "Estilo del equipo"],
  ["{n}도움", "{n}타점", "{n} RBI", "{n} carreras impulsadas"],
  ["{as}도움", "{as}타점", "{as} RBI", "{as} carreras impulsadas"],
  ["{gl}골", "{gl}안타", "{gl} hits", "{gl} hits"],
  ["{pid}골", "{pid}안타", "{pid} hits", "{pid} hits"],
  ["최다 득점", "최다 안타", "Most Hits", "Más hits"],
  ["제 패스에 저도 가끔 놀라요", "제 스윙이 잘 맞을 때는 저도 놀라요", "I surprise myself when my swing clicks", "Hasta yo me sorprendo cuando mi swing sale bien"],
  ["더비 날만 기다렸어요", "라이벌전만 기다렸어요", "I've been waiting for the rivalry game", "Estaba esperando el juego contra nuestro rival"],
  ["마지막 1분이 제일 신나요", "9회 마지막 아웃까지 긴장감이 좋아요", "I love the tension up to the last out in the ninth", "Me gusta la tensión hasta el último out de la novena"],
  ["안 될 때는 기본 패스만 했어요", "안 풀릴 때는 포구부터 연습했어요", "When things got tough, I practiced the basics of fielding", "Cuando nada salía, practicaba lo básico del fildeo"],
  ["발끝 감각이 달라졌어요", "스윙할 때 손의 감각이 달라졌어요", "My swing feels different now", "Ahora siento distinto el swing"],
  ["패스가 한 박자 빨라졌어요", "포구에서 송구까지 한 박자 빨라졌어요", "My transfer from glove to throw got quicker", "Ahora paso más rápido del guante al tiro"],
  ["이적 첫 골은 대표님께 바칠게요", "새 팀 첫 안타는 대표님께 바칠게요", "My first hit with the new club is for you", "Mi primer hit con el nuevo club es para usted"],
];

// Existing Korean baseball text with outdated or missing translations.
const locales = [
  ["멀티히트 봤죠?", "Did you see my multi-hit game?", "¿Viste mis hits de hoy?"],
  ["끝내기 안타!", "Walk-off hit!", "¡Hit para ganar el juego!"],
  ["다음엔 멀티안타 갈게요", "I'll get multiple hits next game", "Daré varios hits en el próximo juego"],
  ["타점 추가요!", "Another RBI!", "¡Otra carrera impulsada!"],
  ["정확한 송구 봤어요?", "See that throw?", "¿Viste ese tiro?"],
  ["요즘 야구할 맛 나요", "I'm enjoying baseball lately", "Últimamente disfruto mucho el béisbol"],
  ["야구가 제일 재밌어요", "Baseball's my favorite", "El béisbol es lo que más me divierte"],
  ["마수걸이 안타를 쳐야 할 텐데", "I need to get that first hit", "Necesito conectar mi primer hit"],
  ["{name}, 멀티히트! 경기 MVP 트로피를 안고 퇴근했어요", "{name} had a multi-hit game and went home with the game MVP trophy", "{name} sumó varios hits y se llevó el trofeo de MVP del juego"],
  ["{name}, 평점 {r}. 오늘은 방망이에 공이 붙었대요", "{name} rated {r} and found the barrel all game", "{name} recibió nota {r} y conectó la pelota con solidez todo el juego"],
  ["{name}, 새 야구화를 길들이느라 집에서도 신고 있대요", "{name} wears new cleats at home to break them in", "{name} usa sus tacos nuevos en casa para amoldarlos"],
  ["야구화를 매일 닦기만 해요.", "All I do now is clean my cleats.", "Ahora solo limpio mis tacos."],
  ["부대 휴게실 TV는 늘 야구 채널이에요.", "The barracks TV is always on baseball.", "La tele del cuartel siempre da béisbol."],
  ["스폰서 야구화, 진짜 편해요.", "The sponsor's cleats feel great.", "Qué cómodos los tacos del patrocinador."],
  ["야구가 체스처럼 보일 때가 있어요.", "Baseball feels like chess sometimes.", "A veces el béisbol parece ajedrez."],
  ["야구가 예전만큼 재밌지 않아요.", "Baseball isn't as fun as it used to be.", "El béisbol ya no me divierte como antes."],
  ["오늘따라 펜스가 작아 보여요.", "The fence looks awfully small today.", "Hoy la cerca se ve pequeña."],
  ["야구화를 바꿔 볼까 봐요.", "Maybe I'll try different cleats.", "Quizá pruebe otros tacos."],
  ["타격마다 펜스로 빨려 들어가요.", "Everything I hit flies to the fence.", "Todo lo que bateo vuela a la cerca."],
  ["야구가 이렇게 재밌었나요?", "Was baseball always this much fun?", "¿Siempre fue tan divertido el béisbol?"],
  ["야구도 결국 직업이잖아요.", "Baseball is a job, too.", "El béisbol también es un trabajo."],
  ["야구는 예술이라고 생각해요.", "Baseball is an art to me.", "Para mí el béisbol es un arte."],
  ["야구가 제일 좋아요.", "Baseball is my favorite.", "El béisbol es lo que más me gusta."],
  ["실력으로 보여 주죠", "I'll show you what I can do", "Le mostraré de qué soy capaz"],
  ["실력으로 보답하죠", "I'll repay your trust on the field", "Responderé a su confianza en el campo"],
  ["야구화 세 켤레가 닳았어요", "I wore out three pairs of cleats", "Desgasté tres pares de tacos"],
  ["비싼 만큼 경기로 갚을게요", "I'll prove I'm worth it on the field", "Demostraré en el campo que valió la pena"],
  ["공이 잘 보였던 해예요", "I saw the ball well this year", "Este año veía bien la pelota"],
  ["쓰러져도 공은 안 놓쳤어요", "I fell but held on to the ball", "Me caí, pero no solté la pelota"],
  ["막내라서 공은 제가 나를게요", "I'm the youngest, so I'll bring the baseballs", "Soy el menor, así que llevo las pelotas"],
  ["안타왕", "Hits Leader", "Líder en hits"],
  ["{n}안타", "{n} hits", "{n} hits"],
  ["선수를 찾고, 키우고, 파는 야구 에이전트 게임", "Scout and develop baseball talent, and negotiate contracts", "Recluta talento de béisbol, forma jugadores y negocia contratos"],
];

const read = file => fs.readFileSync(path.join(assets, file), "utf8");
const write = (file, source) => fs.writeFileSync(path.join(assets, file), source, "utf8");
const readLiteral = value => JSON.stringify(value);
const shell = read(shellFile);
const year = read(yearFile);
const active = shell + year;
const usable = [];
for (const row of copy) {
  const [old, replacement] = row;
  if (active.includes(readLiteral(old)) || active.includes(readLiteral(replacement))) {
    usable.push(row);
  } else {
    console.warn("skip missing shell copy:", old);
  }
}

for (const [file, source] of [[shellFile, shell], [yearFile, year]]) {
  if (source.includes(marker)) continue;
  let updated = source;
  for (const [old, replacement] of usable) {
    updated = updated.replaceAll(readLiteral(old), readLiteral(replacement));
  }
  write(file, updated.trimEnd() + "\n" + marker + "\n");
}

for (const [file, language] of [["ui-DgYnPcSw.js", 0], ["ui-DSX53OnJ.js", 1]]) {
  let source = read(file);
  if (source.includes(marker)) continue;
  const localized = {};
  for (const [old, replacement, ...translations] of usable) {
    localized[replacement] = translations[language];
  }
  for (const [term, ...translations] of locales) {
    localized[term] = translations[language];
  }

  // Dictionaries use both quoted and bare Korean keys.
  const escaped = key => key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const keyPattern = key => /^(?:[가-힣]+)$/.test(key) ? "(?:" + escaped(readLiteral(key)) + "|" + key + ")" : escaped(readLiteral(key));
  for (const key of new Set([...copy.map(([old]) => old), ...Object.keys(localized)])) {
    const property = new RegExp("([{,])" + keyPattern(key) + ':"(?:[^"\\\\]|\\\\.)*"(,|(?=}))', "g");
    source = source.replace(property, (_, prefix, comma) => comma || prefix === "{" ? prefix : "");
  }
  const objectEnd = "};export{";
  if (!source.includes(objectEnd)) throw new Error("UI dictionary end not found: " + file);
  source = source.replace(objectEnd, () => "," + JSON.stringify(localized).slice(1, -1) + objectEnd);
  write(file, source.trimEnd() + "\n" + marker + "\n");
}

console.log("Baseball shell and dialogue copy applied.");

// Keep the player name pools and ordinary words. Replace the legacy club and
// cup aliases: duplicated keys in that block made WBC resolve to a club cup.
const cityNames = {
  인천:"Incheon",수원:"Suwon",대전:"Daejeon",광주:"Gwangju",대구:"Daegu",부산:"Busan",
  창원:"Changwon",서울:"Seoul",고양:"Goyang",청주:"Cheongju",
  도쿄:"Tokyo",요코하마:"Yokohama",오사카:"Osaka",고베:"Kobe",나고야:"Nagoya",히로시마:"Hiroshima",
  후쿠오카:"Fukuoka",삿포로:"Sapporo",센다이:"Sendai",치바:"Chiba",사이타마:"Saitama",오키나와:"Okinawa",
  타이베이:"Taipei",타이중:"Taichung",가오슝:"Kaohsiung",타오위안:"Taoyuan",신베이:"New Taipei",화련:"Hualien",
  뉴욕:"New York",보스턴:"Boston",필라델피아:"Philadelphia",워싱턴:"Washington",애틀랜타:"Atlanta",
  마이애미:"Miami",탬파:"Tampa",토론토:"Toronto",볼티모어:"Baltimore",시카고북:"Chicago North",
  시카고남:"Chicago South",클리블랜드:"Cleveland",디트로이트:"Detroit",미네소타:"Minnesota",
  캔자스시티:"Kansas City",휴스턴:"Houston",세인트루이스:"St. Louis",밀워키:"Milwaukee",
  신시내티:"Cincinnati",피츠버그:"Pittsburgh",LA:"Los Angeles",샌프란:"San Francisco",
  샌디에이고:"San Diego",애리조나:"Arizona",콜로라도:"Colorado",시애틀:"Seattle",텍사스:"Texas",
  오클랜드:"Oakland",LA남:"Los Angeles South",탬파만:"Tampa Bay",
};
const tournamentNames = [
  ["WBC", "World Baseball Classic", "Clásico Mundial de Béisbol"],
  ["프리미어12", "Premier12", "Premier12"],
  ["아시아야구선수권", "Asian Baseball Championship", "Campeonato Asiático de Béisbol"],
  ["아시안게임", "Asian Games", "Juegos Asiáticos"],
  ["올림픽", "Olympics", "Juegos Olímpicos"],
  ["청소년 WBC", "Youth Baseball Championship", "Campeonato Juvenil de Béisbol"],
];
const namesMarker = "/*CALLUP_BASEBALL_NAMES*/";
for (const [file, language] of [["names-CdWzr2Fb.js", 1], ["names-DvEudt3S.js", 2]]) {
  const source = read(file);
  const words = {...cityNames, ...Object.fromEntries(tournamentNames.map(row => [row[0],row[language]]))};
  const wordsOpen = "},e={";
  const start = source.indexOf(wordsOpen);
  if (start < 0) throw new Error("Missing names dictionary: " + file);
  const first = start + wordsOpen.length;
  if (language === 1) {
    if (source.includes(namesMarker)) continue;
    const legacyEnd = source.indexOf('"크리스마스의 기적":', first);
    if (legacyEnd < 0 || !source.slice(first, legacyEnd).includes('"한국 협회컵":"England FA Cup"')) {
      throw new Error("Missing legacy names block: " + file);
    }
    write(file, source.slice(0, first) + JSON.stringify(words).slice(1,-1) + "," +
      source.slice(legacyEnd).trimEnd() + "\n" + namesMarker + "\n");
  } else {
    // The earlier club patch may regenerate this map on a full build.
    const exports = "export{o as default,a as pools,e as words};";
    const end = source.indexOf(exports,first);
    if (end < 0) throw new Error("Missing Spanish names exports: " + file);
    // Repair the object used by the default export if the old patch removed it.
    const updated = source.slice(0,first) + JSON.stringify(words).slice(1,-1) +
      "};const o={pools:a,words:e};" + source.slice(end);
    if (updated !== source) write(file, updated);
  }
}
