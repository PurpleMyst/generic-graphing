/* jshint esnext: true, browser: true */

document.addEventListener("DOMContentLoaded", () => {
  const graph = new Graph(["a", "b"], (a, b, x) => a * (x * x) + b);
  graph.draw();
});
