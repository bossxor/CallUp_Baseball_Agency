const fs = require("fs");
const vm = require("vm");

const i18n = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/i18n-D-FAABCZ.js",
  "utf8"
);
const okYt = /clubNick/.test(i18n) && i18n.includes("__callupG");
console.log("i18n clubNick resolver", okYt);

const eng = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js",
  "utf8"
);
console.log("assert clubNick init", eng.includes("a.clubNick={}"));

const shell = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/shell-DaKdX7f1.js",
  "utf8"
);
console.log("shell editor", shell.includes("CallupClubNickEditor"));
console.log("shell Cc bind", shell.includes("__callupG=s"));

const yt = (t) => {
  if (!t) return "";
  const g = globalThis.__callupG;
  const k = g?.agency?.clubNick;
  const b = k?.[t.id];
  return b || t.name;
};
const game = { agency: { clubNick: { 3: "테스트구단" } } };
globalThis.__callupG = game;
console.log(
  "probe override id3",
  yt({ id: 3, name: "인천" }) === "테스트구단" ? "PASS" : "FAIL"
);
game.agency.clubNick = {};
console.log(
  "probe default id3",
  yt({ id: 3, name: "인천" }) === "인천" ? "PASS" : "FAIL"
);