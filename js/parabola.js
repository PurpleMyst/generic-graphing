/* jshint esnext: true, browser: true */

const getParabolaEquationString = (a, b, c) => GraphUtils.addNicely([
  GraphUtils.numberTimesText(a, GraphUtils.parenthesize(
    GraphUtils.addNicely(["x", (-b).toString()])) + GraphUtils.SQUARED),
  c.toString()
]);

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph(["the a constant", "vertex x", "vertex y"],
                          (a, b, c, x) => a * Math.pow(x - b, 2) + c,
                          getParabolaEquationString);
  graph.draw();
});
