// This tool will convert a Tailwind color palette to HSL format
// USAGE: tw2hsl.js COLOR (where COLOR is red, blue, indigo, etc.)

const twColors = require("tailwindcss/colors");
const hex2hsl = require("hex-to-hsl");

const colors = twColors[process.argv[2]];
if (!colors) {
  console.error("invalid color name");
  process.exit(1);
}

Object.entries(colors).forEach(([key, value]) => {
  const [h, s, l] = hex2hsl(value);
  console.log(`${key}: ${h} ${s}% ${l}%;`);
});
