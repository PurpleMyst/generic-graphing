/* jshint esnext: true, browser: true */

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph(["slope", "constant"],
                          (slope, constant, x) => slope * x + constant,
                          (slope, constant) => [[slope, 'x'], [constant, '']]);
  graph.draw();
});
