const fs = require("fs");
const s = fs.readFileSync(
  "T:/CallUp/apk-src/assets/public/assets/engine-DhPc-c_J.js",
  "utf8"
);

function around(label, needle, n = 3) {
  let i = 0;
  let c = 0;
  while ((i = s.indexOf(needle, i)) >= 0 && c < n) {
    console.log("\n==", label, c, i);
    console.log(s.slice(Math.max(0, i - 60), i + needle.length + 120));
    i += needle.length;
    c++;
  }
  console.log(label, "total", s.split(needle).length - 1);
}

around("u2=", "u2=");
around("u2=", "const u2");
around("ability list", '["gk"');
around("ability list2", '["sho"');
around("GK DF array", '["GK","DF","MF","FW"]');
around("GK DF array2", "['GK','DF','MF','FW']");
around("pos GK", 'pos==="GK"');
around("===GK", '==="GK"');
around("goals", "goals");
around("assists", "assists");
around("st.gl", "st.gl");
around("st.as", "st.as");
