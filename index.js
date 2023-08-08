// This tool will generate a custom shadcn/ui theme
// You can specify the primary, secondary, accent, and gray colors

const twColors = require("tailwindcss/colors");
const hex2hsl = require("hex-to-hsl");
const template = require("./theme.json");

let customColors = {
  primary: null,
  secondary: "gray",
  accent: "gray",
  gray: "gray",
};

if (process.argv.length < 3) {
  console.error(
    `USAGE: shadcn-custom-theme primary=COLOR [secondary=COLOR] [accent=COLOR] [gray=COLOR]`
  );
  process.exit(1);
}

process.argv.slice(2).forEach((arg) => {
  const [key, value] = arg.split("=");
  if (!key || !value) return;
  customColors[key] = value;
});

if (customColors.primary === null) {
  console.error("primary color is required");
  process.exit(1);
}

let theme = {
  light: generateTheme("light", customColors),
  dark: generateTheme("dark", customColors),
};

console.log("@layer base {");
console.log("  :root {");
dumpTheme(theme.light);
console.log("  }\n");
console.log("  .dark {");
dumpTheme(theme.dark);
console.log("  }");
console.log("}");

function dumpTheme(theme) {
  Object.entries(theme).forEach(([key, value]) => {
    console.log(`      ${key}: ${value};`);
  });
}

function generateTheme(theme, customColors) {
  let customTheme = {};
  Object.entries(template[theme]).forEach(([key, value]) => {
    if (key === "--radius") {
      customTheme[key] = value;
      return;
    }
    let [color, tint] = value.split("-");
    if (!tint) {
      customTheme[key] = getHsl(color);
      return;
    }

    let customColor = customColors[color];
    // hard-coded color like red-500 so just return it directly
    if (!customColor) {
      customTheme[key] = getHsl(value, value);
      return;
    }

    let newColor = twColors[customColor][tint];
    customTheme[key] = getHsl(newColor, `${customColor}-${tint}`);
  });
  return customTheme;
}

function getHsl(color, twColor) {
  if (color === "white") return "0 0% 100% /* white */";
  if (color === "black") return "0 0% 0% /* black */";
  const [h, s, l] = hex2hsl(color);
  return `${h} ${s}% ${l}% /* ${twColor} */`;
}
