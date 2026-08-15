const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const fa = require("react-icons/fa");

const ICONS = {
  bookOpen: fa.FaBookOpen,
  book: fa.FaBook,
  graduationCap: fa.FaUserGraduate,
  userShield: fa.FaUserShield,
  user: fa.FaUser,
  database: fa.FaDatabase,
  cloud: fa.FaCloud,
  creditCard: fa.FaCreditCard,
  mobile: fa.FaMobileAlt,
  shield: fa.FaShieldAlt,
  checkCircle: fa.FaCheckCircle,
  bug: fa.FaBug,
  lightbulb: fa.FaLightbulb,
  triangleExclaim: fa.FaExclamationTriangle,
  server: fa.FaServer,
  code: fa.FaCode,
  sync: fa.FaSyncAlt,
  bell: fa.FaBell,
  users: fa.FaUsers,
  rocket: fa.FaRocket,
  clock: fa.FaClock,
  moneyBill: fa.FaMoneyBillWave,
  flask: fa.FaFlask,
  bullseye: fa.FaBullseye,
  puzzlePiece: fa.FaPuzzlePiece,
};

const COLORS = { white: "#FFFFFF", navy: "#041632", gold: "#C89B3C" };

async function run() {
  for (const [name, Icon] of Object.entries(ICONS)) {
    for (const [colorName, color] of Object.entries(COLORS)) {
      const svg = ReactDOMServer.renderToStaticMarkup(
        React.createElement(Icon, { size: 256, color })
      );
      const out = `icons/${name}-${colorName}.png`;
      await sharp(Buffer.from(svg)).resize(256, 256).png().toFile(out);
      console.log("wrote", out);
    }
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
