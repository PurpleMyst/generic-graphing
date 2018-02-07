/* jshint esnext: true, browser: true */

const getLineEquationString = (slope, constant) => GraphUtils.addNicely([
  GraphUtils.numberTimesText(slope, "x"), constant.toString()
]);

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph(["slope", "constant"],
                          (slope, constant, x) => slope * x + constant,
                          getLineEquationString);
  graph.draw();
});
