/* ============================================================
   loader.js
   - Boot sequence (terminal intro)
   - Name "decrypt" effect
   - Typing roles line
   ============================================================ */

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var boot    = document.getElementById('boot');
  var linesEl = document.getElementById('lines');
  var fill    = document.getElementById('fill');
  var roleEl  = document.getElementById('role');
  var finished = false;

  /* ---------- Edit these ---------- */

  // Lines shown in the boot terminal: [text, class]
  var steps = [
    ['> initializing portfolio', 'ok'],
    ['> loading modules: security, code, curiosity', 'ok'],
    ['> verifying identity', 'ok'],
    ['> ACCESS GRANTED', 'grant']
  ];

  // Roles that type out under your tagline
  var roles = [
    'Cyber Security Enthusiast',
    'Aspiring Ethical Hacker',
    'Python & Web Developer'
  ];

  /* ---------- Name decrypt effect ---------- */

  var chars = '!<>-_\\/[]{}=+*^?#01';

  function decrypt(el) {
    var target = el.dataset.t;
    var n = target.length;
    var frame = 0;
    var total = reduce ? 1 : 34;

    (function tick() {
      var out = '';
      for (var i = 0; i < n; i++) {
        out += (frame / total > i / n)
          ? target[i]
          : chars[Math.floor(Math.random() * chars.length)];
      }
      el.textContent = out;

      if (frame++ < total) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    })();
  }

  /* ---------- Typing roles ---------- */

  var ri = 0;        // which role
  var ci = 0;        // which character
  var deleting = false;

  function typeRole() {
    if (reduce) {
      roleEl.textContent = '$ ' + roles[0];
      return;
    }

    var word = roles[ri];
    roleEl.innerHTML = '$ ' + word.slice(0, ci) + '<span class="cur-blink"></span>';

    if (!deleting && ci === word.length) {
      deleting = true;
      return setTimeout(typeRole, 1600);   // pause at full word
    }
    if (deleting && ci === 0) {
      deleting = false;
      ri = (ri + 1) % roles.length;
    }

    ci += deleting ? -1 : 1;
    setTimeout(typeRole, deleting ? 35 : 70);
  }

  /* ---------- Finish boot, reveal the site ---------- */

  function finish() {
    if (finished) return;
    finished = true;

    boot.classList.add('done');
    document.body.classList.add('ready');

    document.querySelectorAll('#name .row').forEach(function (row, i) {
      setTimeout(function () { decrypt(row); }, i * 250);
    });

    typeRole();
  }

  /* ---------- Boot sequence ---------- */

  function runBoot() {
    if (reduce) { finish(); return; }

    var i = 0;
    (function next() {
      if (finished) return;

      if (i >= steps.length) {
        setTimeout(finish, 650);
        return;
      }

      var step = steps[i++];
      var line = document.createElement('div');
      line.className = step[1];
      line.textContent = step[0];
      linesEl.appendChild(line);

      fill.style.transition = 'width .5s ease';
      fill.style.width = (i / steps.length * 100) + '%';

      setTimeout(next, 520);
    })();
  }

  document.getElementById('skip').addEventListener('click', finish);
  runBoot();
})();