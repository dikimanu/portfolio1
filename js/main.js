/* ============================================================
   main.js
   - Icons helper
   - About: stat counters
   - About: mini terminal
   - Skills: radar chart, tabs and bars
   - Projects: cards, tilt, risk meter, case study window
   - Certificates: grid + full-size viewer + hidden detail text
   - Contact: secure channel form (Web3Forms)
   ============================================================ */

/* ---------- Icons: files live in assets/icons/ ---------- */
function ico(name) {
  var i = document.createElement('img');
  i.className = 'ico';
  i.src = 'assets/icons/' + name + '.svg';
  i.alt = '';
  return i;
}

/* ---------- Show more: keeps a grid to a few rows ---------- */
// Shows `step` rows first. Each click on the button shows `step` more rows.
// When everything is visible the button turns into "Show less".
// It counts the real columns on screen, so it works on phone, tablet and desktop.
function limitRows(grid, step) {
  var shown = step;      // rows currently visible
  var total = 0;         // rows in total at this screen size

  var wrap = document.createElement('div');
  wrap.className = 'more-wrap';
  wrap.style.display = 'none';

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn more-btn';
  wrap.appendChild(btn);
  grid.parentNode.insertBefore(wrap, grid.nextSibling);

  if (window.bindCursorEffects) window.bindCursorEffects(wrap);

  function apply() {
    var items = Array.prototype.slice.call(grid.children);
    var cols  = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length || 1;
    total = Math.ceil(items.length / cols);

    if (total <= step) {                       // 3 rows or fewer: no button needed
      items.forEach(function (it) { it.style.display = ''; });
      wrap.style.display = 'none';
      return;
    }

    var limit = shown * cols;
    var hidden = 0;
    items.forEach(function (it, i) {
      if (i >= limit) { it.style.display = 'none'; hidden++; }
      else it.style.display = '';
    });

    var done = shown >= total;
    wrap.style.display = 'flex';
    btn.textContent = done ? 'Show less' : 'Show more (' + hidden + ' more)';
    btn.setAttribute('aria-expanded', done ? 'true' : 'false');
  }

  btn.addEventListener('click', function () {
    if (shown >= total) {
      shown = step;                            // collapse back to the first rows
      apply();
      grid.parentNode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      shown += step;                           // load the next rows
      apply();
    }
  });

  var timer;
  addEventListener('resize', function () {
    clearTimeout(timer);
    timer = setTimeout(apply, 150);
  });
  addEventListener('load', apply);
  apply();
}

/* ---------- Edit your terminal answers here ---------- */
var TERMINAL = {
  whoami:   'Satyabrata Pal\nB.Tech CSE, Cyber Security student\n"Doing work for passion, not for greed of results."',
  skills:   'CSE Core Subjects: Operating System, DSA, DBMS, Networking\nSecurity : Basics of Ethical Hacking, Fundamentals of Cyber Security, Cryptography\nAI: Introduction to AI&ML, Data Mining and Data Visualization\nCode     : Python, C, SQL\nTools    : Linux, Git, ChatGPT, Claude, Gemini, and other AI models...',
  projects: '1. AI Password Attack Detector and Protector\n2. PortScanner\n3. Food Delivery App (MERN stack)\n4. File Encryption & Decryption (AES-GCM)\n5. Social Media App (MERN stack)\n6. Snake Mania (JS Game)',
  contact:  'email   : satyabratapal50@gmail.com\nlinkedin: linkedin.com/in/satyabrata-pal-03b5a7373'
};

/* ---------- Stat counters (count up when visible) ---------- */
(function () {
  var counters = document.querySelectorAll('.count');
  if (!counters.length) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function run(el) {
    var to = +el.dataset.to;
    if (reduce || to === 0) { el.textContent = to; return; }

    var n = 0;
    var step = Math.max(1, Math.ceil(to / 30));
    var id = setInterval(function () {
      n = Math.min(to, n + step);
      el.textContent = n;
      if (n >= to) clearInterval(id);
    }, 45);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    });
  }, { threshold: 0.6 });

  counters.forEach(function (c) { io.observe(c); });
})();

/* ---------- Mini terminal ---------- */
(function () {
  var out = document.getElementById('termOut');
  var input = document.getElementById('termIn');
  if (!out || !input) return;

  function print(text, cls) {
    var line = document.createElement('div');
    if (cls) line.className = cls;
    line.textContent = text;      // textContent keeps user input safe
    out.appendChild(line);
    out.scrollTop = out.scrollHeight;
  }

  print('Welcome, visitor. Type "help" to see what I can do.', 'hl');

  var history = [];
  var pos = 0;

  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' && history.length) {
      pos = Math.max(0, pos - 1);
      input.value = history[pos];
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowDown' && history.length) {
      pos = Math.min(history.length, pos + 1);
      input.value = history[pos] || '';
      e.preventDefault();
      return;
    }
    if (e.key !== 'Enter') return;

    var cmd = input.value.trim().toLowerCase();
    input.value = '';
    if (!cmd) return;

    history.push(cmd);
    pos = history.length;
    print('$ ' + cmd, 'cmd');

    if (cmd === 'help') {
      print('Available commands: whoami, skills, projects, contact, clear');
    } else if (cmd === 'clear') {
      out.innerHTML = '';
    } else if (TERMINAL[cmd]) {
      print(TERMINAL[cmd]);
    } else {
      print('command not found: ' + cmd + '  (try "help")', 'err');
    }
  });

  // Clicking anywhere on the terminal focuses the input
  out.parentElement.addEventListener('click', function () { input.focus(); });
})();

/* ---------- Skills: edit your skills here (name, level 0-100) ---------- */
// Change each number to what you can honestly explain in an interview.
var SKILLS = {
  'Security': [
    ['Cyber Security Basics', 65],
    ['Ethical Hacking Basics', 50],
    ['Cryptography', 55],
    ['Networking', 60],
    ['Linux', 55]
  ],
  'Programming': [
    ['Python', 75],
    ['C', 60],
    ['SQL', 60],
    ['DSA', 55]
  ],
  'CSE Core & AI': [
    ['Operating Systems', 60],
    ['DBMS', 60],
    ['AI & ML Intro', 50],
    ['Data Mining', 45],
    ['Data Visualization', 50]
  ],
  'Tools': [
    ['Git & GitHub', 60],
    ['AI Assistants', 80],
    ['Command Line', 55]
  ]
};
// Icon shown on each tab (file name in assets/icons/, without .svg)
var SKILL_ICONS = {
  'Security': 'bug',
  'Programming': 'code',
  'CSE Core & AI': 'brain',
  'Tools': 'wrench'
};
// Rules: each category needs at least 3 skills. 5 looks best on the radar.

/* ---------- Skills: radar chart, tabs and bars ---------- */
(function () {
  var svg  = document.getElementById('radar');
  var tabs = document.getElementById('skillTabs');
  var list = document.getElementById('skillList');
  if (!svg || !tabs || !list) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var C = 200;    // centre of the chart
  var R = 118;    // radius of the chart
  var names = Object.keys(SKILLS);
  var frame;

  function make(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (text) e.textContent = text;
    return e;
  }

  function pt(i, n, v) {
    var a = -Math.PI / 2 + i * 2 * Math.PI / n;
    var r = R * v / 100;
    return [C + r * Math.cos(a), C + r * Math.sin(a)];
  }
  function ptsString(n, values) {
    return values.map(function (v, i) { return pt(i, n, v).join(','); }).join(' ');
  }

  function drawRadar(items) {
    var n = items.length;
    svg.innerHTML = '';

    [25, 50, 75, 100].forEach(function (lvl) {
      svg.appendChild(make('polygon', { 'class': 'r-ring', points: ptsString(n, items.map(function () { return lvl; })) }));
    });

    items.forEach(function (it, i) {
      var edge = pt(i, n, 100);
      svg.appendChild(make('line', { 'class': 'r-axis', x1: C, y1: C, x2: edge[0], y2: edge[1] }));

      var lab = pt(i, n, 124);
      var anchor = lab[0] < C - 8 ? 'end' : (lab[0] > C + 8 ? 'start' : 'middle');
      svg.appendChild(make('text', { 'class': 'r-lab', x: lab[0], y: lab[1] + 4, 'text-anchor': anchor }, it[0]));
    });

    var area = make('polygon', { 'class': 'r-area', points: ptsString(n, items.map(function () { return 0; })) });
    svg.appendChild(area);
    var dots = items.map(function () {
      var d = make('circle', { 'class': 'r-dot', r: 3.5, cx: C, cy: C });
      svg.appendChild(d);
      return d;
    });

    cancelAnimationFrame(frame);
    var start = null, duration = reduce ? 1 : 700;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var e = 1 - Math.pow(1 - p, 3);
      var vals = items.map(function (it) { return it[1] * e; });
      area.setAttribute('points', ptsString(n, vals));
      vals.forEach(function (v, i) {
        var xy = pt(i, n, v);
        dots[i].setAttribute('cx', xy[0]);
        dots[i].setAttribute('cy', xy[1]);
      });
      if (p < 1) frame = requestAnimationFrame(step);
    }
    frame = requestAnimationFrame(step);
  }

  function drawBars(items) {
    list.innerHTML = '';
    var fills = [];

    items.forEach(function (it) {
      var li = document.createElement('li');

      var head = document.createElement('div');
      head.className = 'sk-head';
      var nm = document.createElement('span'); nm.textContent = it[0];
      var pc = document.createElement('span'); pc.textContent = it[1] + '%';
      head.appendChild(nm); head.appendChild(pc);

      var track = document.createElement('div');
      track.className = 'sk-track';
      var fill = document.createElement('i');
      fill.className = 'sk-fill';
      track.appendChild(fill);

      li.appendChild(head); li.appendChild(track);
      list.appendChild(li);
      fills.push([fill, it[1]]);
    });

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        fills.forEach(function (f) { f[0].style.width = f[1] + '%'; });
      });
    });
  }

  function select(name) {
    Array.prototype.forEach.call(tabs.children, function (b) {
      b.setAttribute('aria-selected', b.dataset.name === name ? 'true' : 'false');
    });
    drawRadar(SKILLS[name]);
    drawBars(SKILLS[name]);
  }

  names.forEach(function (name) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'tab';
    b.dataset.name = name;
    b.setAttribute('role', 'tab');
    if (SKILL_ICONS[name]) b.appendChild(ico(SKILL_ICONS[name]));
    b.appendChild(document.createTextNode(name));
    b.addEventListener('click', function () { select(name); });
    tabs.appendChild(b);
  });

  var started = false;
  new IntersectionObserver(function (entries, io) {
    if (entries[0].isIntersecting && !started) {
      started = true;
      select(names[0]);
      io.disconnect();
    }
  }, { threshold: 0.25 }).observe(document.getElementById('skills'));
})();


/* ---------- Projects ----------
   The projects themselves are written in index.html (one block each).
   This code only reads those blocks: tilt effect, case-study window,
   missing-screenshot placeholder and the 3-row limit. ---------- */
(function () {
  var grid  = document.getElementById('projGrid');
  var modal = document.getElementById('projModal');
  var body  = document.getElementById('pmBody');
  if (!grid || !modal || !body) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  /* 3D tilt with glare */
  function tilt(card) {
    card.addEventListener('pointermove', function (e) {
      var r  = card.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', ((0.5 - py) * 7) + 'deg');
      card.style.setProperty('--ry', ((px - 0.5) * 9) + 'deg');
      card.style.setProperty('--gx', (px * 100) + '%');
      card.style.setProperty('--gy', (py * 100) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }

  /* screenshot missing? show a placeholder instead of a broken image */
  function watchShot(shot) {
    var img = shot.querySelector('img');
    if (!img) return;
    function missing() { shot.classList.add('missing'); img.remove(); }
    if (img.complete && img.naturalWidth === 0) missing();
    else img.addEventListener('error', missing);
  }

  /* case-study window, built from the card's own text */
  function openModal(card) {
    body.innerHTML = '';

    var h = el('h3', null, card.querySelector('h3').textContent);
    h.id = 'pmTitle';
    body.appendChild(h);
    body.appendChild(el('p', null, card.querySelector('.card-sum').textContent));

    var img = card.querySelector('.card-shot img');
    if (img) {
      var big = el('img', 'pm-shot');
      big.src = img.getAttribute('src');
      big.alt = img.alt;
      body.appendChild(big);
    }

    var detail = card.querySelector('.card-detail');
    var links = el('div', 'pm-links');
    if (detail) {
      Array.prototype.forEach.call(detail.children, function (node) {
        if (node.dataset.sec) {
          body.appendChild(el('h4', null, node.dataset.sec));
          body.appendChild(node.cloneNode(true));
        } else if (node.classList.contains('d-link')) {
          var a = el('a', 'pm-link', node.textContent);
          a.href = node.getAttribute('href');
          a.target = '_blank';
          a.rel = 'noopener';
          links.appendChild(a);
        }
      });
    }

    var chipBox = card.querySelector('.chips');
    if (chipBox) {
      body.appendChild(el('h4', null, 'Tech used'));
      body.appendChild(chipBox.cloneNode(true));
    }

    if (links.children.length) body.appendChild(links);

    if (window.bindCursorEffects) window.bindCursorEffects(body);
    modal.showModal();
    modal.scrollTop = 0;
  }

  document.getElementById('pmClose').addEventListener('click', function () { modal.close(); });
  modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });

  Array.prototype.forEach.call(grid.querySelectorAll('.card'), function (card) {
    var shot = card.querySelector('.card-shot');
    if (shot) watchShot(shot);

    card.addEventListener('click', function () { openModal(card); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(card); }
    });
    if (fine && !reduce) tilt(card);
  });

  limitRows(grid, 3);     // max 3 rows, then a "Show more" button
})();

/* ---------- Certificates ----------
   The certificates are written in index.html (one block each).
   Each one can have a hidden <span class="cert-detail" hidden> block
   with <span data-sec="Heading">text</span> lines inside it.
   This code reads those blocks: full-size viewer, detail text
   under the image, and the 3-row limit. ---------- */
(function () {
  var grid    = document.getElementById('certGrid');
  var viewer  = document.getElementById('certViewer');
  var vImg    = document.getElementById('vwImg');
  var vTitle  = document.getElementById('vwTitle');
  var vCount  = document.getElementById('vwCount');
  var vDetail = document.getElementById('vwDetail');
  var vPrev   = document.getElementById('vwPrev');
  var vNext   = document.getElementById('vwNext');
  var vClose  = document.getElementById('vwClose');
  if (!grid || !viewer || !vImg) return;

  var certs = Array.prototype.slice.call(grid.querySelectorAll('.cert'));
  var current = 0;

  function show(i) {
    current = (i + certs.length) % certs.length;      // wraps around
    var c = certs[current];
    var title = c.querySelector('.cert-title').textContent.trim();
    vImg.src = c.querySelector('.cert-img').getAttribute('src');
    vImg.alt = title;
    vTitle.textContent = title;
    vCount.textContent = (current + 1) + ' / ' + certs.length;

    // hidden detail text -> shown under the image
    if (vDetail) {
      vDetail.innerHTML = '';
      var d = c.querySelector('.cert-detail');
      if (d) {
        Array.prototype.forEach.call(d.children, function (node) {
          if (!node.dataset.sec) return;
          var h = document.createElement('h4');
          h.textContent = node.dataset.sec;
          var p = document.createElement('p');
          p.textContent = node.textContent.trim();
          vDetail.appendChild(h);
          vDetail.appendChild(p);
        });
      }
    }
  }

  certs.forEach(function (c, i) {
    c.addEventListener('click', function () { show(i); viewer.showModal(); });
  });

  vPrev.addEventListener('click', function () { show(current - 1); });
  vNext.addEventListener('click', function () { show(current + 1); });
  vClose.addEventListener('click', function () { viewer.close(); });
  viewer.addEventListener('click', function (e) { if (e.target === viewer) viewer.close(); });

  // Esc closes the dialog by itself; arrows move between certificates
  viewer.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft')  { show(current - 1); e.preventDefault(); }
    if (e.key === 'ArrowRight') { show(current + 1); e.preventDefault(); }
  });

  limitRows(grid, 3);     // max 3 rows, then a "Show more" button
})();

/* ---------- Contact: edit your details here ---------- */
// accessKey : free key from web3forms.com (safe to keep in front-end code).
// If accessKey is left as the placeholder, the form falls back to opening
// the visitor's email app (mailto) so it never fails silently.
// Each link: [label, text shown, url, icon file name]
var CONTACT = {
  accessKey: 'e12d4ccc-5e21-4139-8a22-27dd2015e3d0',
  email: 'satyabratapal50@gmail.com',
  links: [
    ['Email',     'satyabratapal50@gmail.com',                'mailto:satyabratapal50@gmail.com',                       'mail'],
    ['LinkedIn',  'linkedin.com/in/satyabrata-pal-03b5a7373', 'https://www.linkedin.com/in/satyabrata-pal-03b5a7373',   'linkedin'],
    ['Instagram', '@_satyabrata.pal',                         'https://www.instagram.com/_satyabrata.pal',              'instagram'],
    ['GitHub',    'github.com/dikimanu',                      'https://github.com/dikimanu',                            'github']
  ]
};

/* ---------- Contact: secure channel form + footer ---------- */
(function () {
  var form   = document.getElementById('ctForm');
  var links  = document.getElementById('ctLinks');
  var term   = document.getElementById('ctTerm');
  var log    = document.getElementById('ctLog');
  var cipher = document.getElementById('ctCipher');
  var btn    = document.getElementById('ctBtn');
  var status = document.getElementById('ctStatus');
  var year   = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
  if (!form || !links || !term || !log || !cipher || !btn || !status) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var busy = false;
  var hasKey = CONTACT.accessKey && CONTACT.accessKey.indexOf('PASTE_') !== 0;

  /* contact links on the left */
  CONTACT.links.forEach(function (l) {
    var li = document.createElement('li');
    var a  = document.createElement('a');
    a.href = l[2];
    if (l[2].indexOf('http') === 0) { a.target = '_blank'; a.rel = 'noopener'; }

    var s1 = document.createElement('span');
    s1.className = 'ct-name';
    s1.appendChild(ico(l[3]));
    s1.appendChild(document.createTextNode(l[0]));

    var s2 = document.createElement('span');
    s2.textContent = l[1];

    a.appendChild(s1); a.appendChild(s2);
    li.appendChild(a);
    links.appendChild(li);
  });

  function sleep(ms) {
    return new Promise(function (res) { setTimeout(res, reduce ? 0 : ms); });
  }

  function addLine(text, cls) {
    var d = document.createElement('div');
    d.className = 'ct-line' + (cls ? ' ' + cls : '');
    d.textContent = text;
    log.appendChild(d);
  }

  function setStatus(msg, cls) {
    status.textContent = msg;
    status.className = 'ct-status' + (cls ? ' ' + cls : '');
  }

  function randHex() {
    return '0123456789abcdef'.charAt(Math.floor(Math.random() * 16));
  }

  function scramble(text) {
    return new Promise(function (resolve) {
      var chars = text.slice(0, 220).split('');
      var total = reduce ? 1 : 32, frame = 0;
      var timer = setInterval(function () {
        frame++;
        var locked = Math.floor(chars.length * frame / total);
        cipher.textContent = chars.map(function (c, i) {
          return i < locked ? randHex() : c;
        }).join('');
        if (frame >= total) { clearInterval(timer); resolve(); }
      }, 45);
    });
  }

  async function deliver(name, email, msg) {
    if (!hasKey) {
      window.location.href = 'mailto:' + CONTACT.email +
        '?subject=' + encodeURIComponent('Portfolio message from ' + name) +
        '&body=' + encodeURIComponent(msg + '\n\n' + name + ' (' + email + ')');
      return 'mailto';
    }

    var res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: CONTACT.accessKey,
        subject: 'New Contact Message from Portfolio',
        from_name: 'Portfolio Contact',
        name: name,
        email: email,
        message: msg
      })
    });

    var data = {};
    try { data = await res.json(); } catch (e) {}
    if (!res.ok || !data.success) {
      console.error('Contact form error:', res.status, data.message || data);
      throw new Error(data.message || 'Request failed');
    }
    return 'sent';
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (busy) return;
    if (form.elements.website.value) return;
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var name  = form.elements.name.value.trim();
    var email = form.elements.email.value.trim();
    var msg   = form.elements.message.value.trim();

    busy = true;
    btn.disabled = true;
    setStatus('');
    log.innerHTML = '';
    cipher.textContent = msg.slice(0, 220);
    term.hidden = false;

    try {
      addLine('Opening secure channel...');
      await sleep(450);
      addLine('Generating session key...');
      await sleep(450);
      addLine('Encrypting payload...');
      await scramble(msg);
      addLine('Sending message...');

      var how = await deliver(name, email, msg);
      await sleep(300);

      if (how === 'sent') {
        addLine('Delivered.', 'ok');
        setStatus('Message sent. Thank you, I will reply soon.', 'ok');
        form.reset();
      } else {
        addLine('Email app opened.', 'ok');
        setStatus('Your email app should open with the message ready. Press send there.', 'ok');
      }
    } catch (err) {
      addLine('Delivery failed.', 'err');
      setStatus('Could not send. Please email me directly at ' + CONTACT.email + '.', 'err');
    } finally {
      busy = false;
      btn.disabled = false;
    }
  });
})();


/* ---------- Hero: the name tilts toward your mouse (3D) ---------- */
(function () {
  var name = document.getElementById('name');
  var hero = document.getElementById('top');
  if (!name || !hero) return;

  var fine   = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduce) return;

  hero.addEventListener('pointermove', function (e) {
    var x = e.clientX / innerWidth  - 0.5;      // -0.5 .. 0.5
    var y = e.clientY / innerHeight - 0.5;
    name.style.setProperty('--hy', (x * 12) + 'deg');     // turn left / right
    name.style.setProperty('--hx', (-y * 9) + 'deg');     // tilt up / down
  });
  hero.addEventListener('pointerleave', function () {
    name.style.setProperty('--hx', '0deg');
    name.style.setProperty('--hy', '0deg');
  });
})();

/* ---------- Scroll reveal: things fade and rise when you reach them ---------- */
(function () {
  if (!('IntersectionObserver' in window)) return;     // old browsers: just show everything

  // what should animate in
  var targets = document.querySelectorAll(
    '.sec-title, .tile, .radar-wrap, .skill-panel, .card, .cert, .ct-info, .ct-form'
  );

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  Array.prototype.forEach.call(targets, function (el) {
    // small delay by position, so items in one row appear one after another
    var idx = Array.prototype.indexOf.call(el.parentNode.children, el);
    el.style.setProperty('--d', ((idx % 4) * 0.08) + 's');
    el.classList.add('reveal');
    io.observe(el);
  });
})();

/* ---------- Cursor effects for new elements ---------- */
if (window.bindCursorEffects) {
  window.bindCursorEffects(document.querySelector('main'));
  window.bindCursorEffects(document.querySelector('.footer'));
}