/* ============================================================
   cursor.js
   - Glowing dot + trailing ring that follows the mouse
   - Ring grows over links and buttons
   - Magnetic buttons (they lean toward your cursor)
   Only runs on devices with a mouse (not phones/tablets).
   ============================================================ */

(function () {
  var hasMouse = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!hasMouse) return;

  var dot  = document.querySelector('.cd');
  var ring = document.querySelector('.cr');

  var mouseX = 0, mouseY = 0;   // real mouse position
  var ringX = 0, ringY = 0;     // ring position (follows with a delay)

  document.body.classList.add('cur-on');

  /* ---------- Follow the mouse ---------- */

  addEventListener('pointermove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px)';
  });

  (function loop() {
    // 0.18 = how quickly the ring catches up (smaller = lazier trail)
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px)';
    requestAnimationFrame(loop);
  })();

  /* ---------- Ring grows over links and buttons ---------- */

  function bindHover(root) {
    root.querySelectorAll('a, button').forEach(function (el) {
      el.addEventListener('pointerenter', function () { ring.classList.add('big'); });
      el.addEventListener('pointerleave', function () { ring.classList.remove('big'); });
    });
  }
  bindHover(document);

  /* ---------- Magnetic buttons ---------- */

  function bindMagnet(root) {
    root.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.25;
        var y = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.transform = 'translate(' + x + 'px,' + y + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transform = '';
      });
    });
  }
  bindMagnet(document);

  // Lets later sections (projects, contact) turn on the same effects
  window.bindCursorEffects = function (root) {
    bindHover(root || document);
    bindMagnet(root || document);
  };
})();