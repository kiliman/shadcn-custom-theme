// This tool parses themes created by the [shadcn/ui Themes website](https://ui.shadcn.com/themes)
// and will output the closest [Tailwind CSS colors]
// (https://tailwindcss.com/docs/customizing-colors#default-color-palette) for each CSS variable.

const fs = require("fs");
const twColors = require("tailwindcss/colors");
const hsl2hex = require("hsl-to-hex");
const hex2hsl = require("hex-to-hsl");

// convert tailwind default colors to expanded format
let colors = {};
Object.entries(twColors).forEach(([key, value]) => {
  if (typeof value === "string") {
    if (!value.startsWith("#")) return;
    colors[key] = value;
  } else {
    Object.entries(value).forEach(([k, v]) => {
      colors[`${key}-${k}`] = v;
    });
  }
});

const nearestColor = require("nearest-color").from(colors);

// read theme
const theme = fs.readFileSync(process.argv[2], "utf8");

const light = {};
const dark = {};

let isLight = true; // default to light theme

// parse theme
theme.split("\n").forEach((l) => {
  const line = l.trim();
  if (!line.length) return;
  if (line.startsWith(".dark")) isLight = false;
  if (!line.startsWith("--")) return;

  const [key, value] = line.split(":");
  if (!key || !value) return;
  // make sure value is a color
  if (!value.match(/[0-9.]+\s[0-9.]+%\s[0-9.]+%;/)) return;
  const color = nearestColor(hsl2hex(...parseHsl(value)));
  if (isLight) {
    light[key] = color.name;
  } else {
    dark[key] = color.name;
  }
});

dump(":root", light);
dump(".dark", dark);

console.log(JSON.stringify({ light, dark }, null, 2));

function dump(theme, colors) {
  console.log(`${theme} \{`);
  Object.entries(colors).forEach(([key, value]) => {
    console.log(`  ${key}: ${value};`);
  });
  console.log("}\n");
}

function parseHsl(value) {
  return value
    .trim()
    .replace("%", "")
    .replace(";", "")
    .split(" ")
    .map((v) => parseFloat(v));
}
