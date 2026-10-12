/* ============================================================
   planet-flow.js
   Colours change by themselves as you scroll. The section that is
   in the middle of the screen decides the planet, and the colour
   fade (about 1 second) is done by CSS in sections.css.

   Order of the page: home -> about -> skills -> projects
                      -> certificates -> contact -> footer
   ============================================================ */
(function () {
  var root = document.documentElement;

  // section id -> planet name (palettes live in sections.css)
  var MAP = [
    ['top',          'home'],
    ['about',        'mars'],
    ['skills',       'jupiter'],
    ['projects',     'saturn'],
    ['certificates', 'neptune'],
    ['contact',      'moon']
  ];

  var items = MAP.map(function (m) {
    return { el: document.getElementById(m[0]), planet: m[1] };
  }).filter(function (it) { return it.el; });

  if (!items.length) return;

  var current = '';
  var ticking = false;

  function update() {
    ticking = false;
    var line = innerHeight * 0.45;           // the "reading line" on screen
    var pick = items[0].planet;

    for (var i = 0; i < items.length; i++) {
      if (items[i].el.getBoundingClientRect().top <= line) pick = items[i].planet;
    }

    if (pick !== current) {
      current = pick;
      root.setAttribute('data-planet', pick);
    }
  }

  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  update();
})();