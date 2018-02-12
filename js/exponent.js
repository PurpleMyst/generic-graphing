/* jshint esnext: true, browser: true */

function getExponentEquationString(base) {
  // if base == 1 or base == 0, it's possible to graph y=base^x but a logarithm
  // with that base does not exist
  var result = "y = " + GraphUtils.parenthesize(base.toString()) + GraphUtils.superscript("x");
  if ((0 < base && base < 1) || (base > 1)) {
    result += "\nx = log" + GraphUtils.subscript(base.toString()) + "(y)";
  }
  return result;
}

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph([["base", 2]],
                          (base, x) => Math.pow(base, x),
                          getExponentEquationString,
                          -5, 5,
                          -2, 8,
                          300, 300);
  graph.draw();
});
