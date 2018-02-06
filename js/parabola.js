/* jshint esnext: true, browser: true */

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph(["a", "b", "c"], 
                          (a, b, c, x) => a * (x * x) + b * x + c,
                          (a, b, c) => [[a, 'x' + String.fromCharCode(178)], [b, 'x'], [c, '']]);
  graph.draw();
});
