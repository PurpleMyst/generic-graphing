/* jshint esnext: true, browser: true */

const getParabolaEquationString = (a, vertexX, vertexY) => GraphUtils.addNicely([
  GraphUtils.numberTimesText(a, GraphUtils.parenthesize(
    GraphUtils.addNicely(["x", (-vertexX).toString()])) + GraphUtils.superscript("2")),
  vertexY.toString()
]);

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph([["the a constant", 1], ["vertex x", 0], ["vertex y", 0]],
                          (a, vertexX, vertexY, x) => a * Math.pow(x - vertexX, 2) + vertexY,
                          getParabolaEquationString);
  graph.draw();
});
