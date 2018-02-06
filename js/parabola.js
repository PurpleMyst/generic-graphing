/* jshint esnext: true, browser: true */

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph(["a", "b", "c"], 
                          (a, b, c, x) => a * Math.pow(x - b, 2) + c,
                          (a, b, c) => [[a, [[1, 'x', 1], [-b, '', 1]], 2], [c, '', 1]]);
  graph.draw();
});
