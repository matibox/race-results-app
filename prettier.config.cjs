/** @type {import("prettier").Config} */
module.exports = {
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  singleQuote: true,
  jsxSingleQuote: true,
  arrowParens: "avoid",
};
