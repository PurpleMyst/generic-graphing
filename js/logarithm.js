/* jshint esnext: true, browser: true */

const validBase = base => ((0 < base && base < 1) || (base > 1));

function getExponentEquationString(base) {
  if (!validBase(base)) return "";
  return ("y = log" + GraphUtils.subscript(base.toString()) + "(x)\n" +
          "x = " + base + GraphUtils.superscript("y"));
}

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph([["base", 2]],
                          (base, x) => (validBase(base) ? Math.log(x)/Math.log(base) : NaN),
                          getExponentEquationString,
                          -5, 5,
                          -5, 5,
                          300, 300);
  graph.draw();
});
