/* ============================================================
   background.js
   Deep-space star field:
   - 3 layers of tiny white stars (far = slow, near = faster)
   - stars twinkle and drift slowly
   - layers shift a little with the mouse and with scrolling (depth)
   - a shooting star crosses the sky every few seconds
   ============================================================ */

(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var canvas = document.getElementById('bg');
  var ctx = canvas.getContext('2d');

  /* ---------- Edit these ---------- */
  var STAR_DENSITY = 4200;   // bigger number = fewer stars (pixels of screen per star)
  var MAX_STARS    = 420;    // hard limit on desktop
  var MAX_MOBILE   = 170;    // hard limit on small screens
  var SHOOT_MIN    = 4000;   // shooting star: earliest gap (ms)
  var SHOOT_MAX    = 9000;   // shooting star: latest gap (ms)

  // far layer, middle layer, near layer
  // share = part of all stars, size = radius, drift = sideways speed,
  // depth = how much it moves with the mouse / scroll, alpha = brightness
  var LAYERS = [
    { share: 0.58, size: 0.7, drift: 0.05, depth: 4,  alpha: 0.55 },
    { share: 0.30, size: 1.0, drift: 0.12, depth: 10, alpha: 0.75 },
    { share: 0.12, size: 1.5, drift: 0.22, depth: 20, alpha: 0.95 }
  ];

  var stars = [];
  var w = 0, h = 0;
  var mx = 0, my = 0;      // mouse offset, smoothed (-0.5 .. 0.5)
  var tx = 0, ty = 0;      // mouse offset, target
  var shoot = null;
  var nextShoot = performance.now() + 2500;

  /* ---------- Setup ---------- */

  function resize() {
    var ratio = Math.min(window.devicePixelRatio || 1, 2);
    w = innerWidth;
    h = innerHeight;
    canvas.width  = w * ratio;
    canvas.height = h * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    var cap   = w < 700 ? MAX_MOBILE : MAX_STARS;
    var total = Math.min(cap, Math.floor(w * h / STAR_DENSITY));

    stars = [];
    LAYERS.forEach(function (L, li) {
      var n = Math.round(total * L.share);
      for (var i = 0; i < n; i++) {
        stars.push({
          l: li,
          x: Math.random() * w,
          y: Math.random() * h,
          r: L.size * (0.6 + Math.random() * 0.8),
          a: L.alpha * (0.5 + Math.random() * 0.5),
          tw: 0.6 + Math.random() * 1.8,           // twinkle speed
          ph: Math.random() * Math.PI * 2,          // twinkle offset
          blue: Math.random() < 0.22                // some stars have a blue tint
        });
      }
    });

    if (reduce) draw(performance.now());
  }

  addEventListener('resize', resize);
  addEventListener('pointermove', function (e) {
    tx = e.clientX / w - 0.5;
    ty = e.clientY / h - 0.5;
  });

  /* ---------- Shooting star ---------- */

  function launch(now) {
    var fromLeft = Math.random() < 0.5;
    var speed = 9 + Math.random() * 6;
    var angle = (Math.PI / 180) * (20 + Math.random() * 20);   // slightly downward
    shoot = {
      x: fromLeft ? -40 : w + 40,
      y: Math.random() * h * 0.5,
      vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0
    };
    nextShoot = now + SHOOT_MIN + Math.random() * (SHOOT_MAX - SHOOT_MIN);
  }

  function drawShoot() {
    if (!shoot) return;
    shoot.x += shoot.vx;
    shoot.y += shoot.vy;
    shoot.life++;

    var len = 110;
    var k = Math.hypot(shoot.vx, shoot.vy);
    var tailX = shoot.x - (shoot.vx / k) * len;
    var tailY = shoot.y - (shoot.vy / k) * len;

    var g = ctx.createLinearGradient(shoot.x, shoot.y, tailX, tailY);
    g.addColorStop(0, 'rgba(255,255,255,0.95)');
    g.addColorStop(0.3, 'rgba(154,216,255,0.45)');
    g.addColorStop(1, 'rgba(154,216,255,0)');
    ctx.strokeStyle = g;
    ctx.lineWidth = 1.6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(shoot.x, shoot.y);
    ctx.lineTo(tailX, tailY);
    ctx.stroke();

    if (shoot.x < -200 || shoot.x > w + 200 || shoot.y > h + 200) shoot = null;
  }

  /* ---------- Draw loop ---------- */

  function draw(now) {
    ctx.clearRect(0, 0, w, h);

    // ease toward the mouse so the movement feels smooth
    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;

    var scroll = window.scrollY || 0;
    var t = now / 1000;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var L = LAYERS[s.l];

      if (!reduce) {
        s.x -= L.drift;                       // slow drift to the left
        if (s.x < -2) s.x = w + 2;
      }

      // parallax: mouse + scroll, bigger for near stars
      var px = s.x - mx * L.depth * 2;
      var py = (s.y - my * L.depth * 2 - scroll * L.depth * 0.012) % h;
      if (py < 0) py += h;

      var twinkle = reduce ? 1 : 0.65 + 0.35 * Math.sin(t * s.tw + s.ph);
      var alpha = s.a * twinkle;

      ctx.fillStyle = s.blue
        ? 'rgba(170,210,255,' + alpha + ')'
        : 'rgba(255,255,255,' + alpha + ')';
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();

      // soft halo around the brightest near stars
      if (s.l === 2 && s.r > 1.3) {
        ctx.fillStyle = 'rgba(160,200,255,' + (alpha * 0.14) + ')';
        ctx.beginPath();
        ctx.arc(px, py, s.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (!reduce) {
      if (!shoot && now > nextShoot) launch(now);
      drawShoot();
      requestAnimationFrame(draw);
    }
  }

  resize();
  if (!reduce) requestAnimationFrame(draw);
})();