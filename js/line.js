/* jshint esnext: true, browser: true */

const getLineEquationString = (slope, constant) => "y = " + GraphUtils.addNicely([
  GraphUtils.numberTimesText(slope, "x"), constant.toString()
]);

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph([["slope", 1], ["constant term", 0]],
                          (slope, constant, x) => slope * x + constant,
                          getLineEquationString,
                          -5, 5,
                          -5, 5,
                          300, 300);
  graph.draw();
});
