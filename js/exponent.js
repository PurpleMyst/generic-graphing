/* jshint esnext: true, browser: true */

function getExponentEquationString(base) {
  var result = "y = " + GraphUtils.parenthesize(base.toString()) + GraphUtils.superscript("x");
  if ((0 < base && base < 1) || (base > 1)) {
    result += "\nx = log" + GraphUtils.subscript(base.toString()) + "(y)";
  }
  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph([["base", 2]],
                          (base, x) => Math.pow(base, x),
                          getExponentEquationString);
  graph.draw();
});
