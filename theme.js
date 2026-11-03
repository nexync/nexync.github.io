// Loaded in <head> so the saved theme is applied before the page paints (no flash).
(function () {
  var root = document.documentElement;

  try {
    if (localStorage.getItem("theme") === "light") root.setAttribute("data-theme", "light");
  } catch (e) {}

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector(".theme-toggle");
    if (!button) return;

    button.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try {
        localStorage.setItem("theme", next);
      } catch (e) {}
    });
  });
})();
