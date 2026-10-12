/* planets.js - one real 3D planet per section, drawn on a fixed canvas behind the page */
(function () {
  if (!window.THREE) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small = innerWidth < 700;

  var canvas = document.createElement('canvas');
  canvas.id = 'planets';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.insertBefore(canvas, document.body.firstChild);

  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true }); }
  catch (e) { canvas.remove(); return; }
  document.documentElement.classList.add('has-planets');   // hides the CSS planets

  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  var scene = new THREE.Scene();
  var cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -2000, 2000);
  cam.position.z = 500;

  var sun = new THREE.DirectionalLight(0xfff2dd, 1.7);
  sun.position.set(-300, 250, 400);
  scene.add(sun, new THREE.AmbientLight(0x7080a8, 0.35));

  /* ---------- procedural textures ---------- */
  function tex(w, h, fn) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    fn(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    return t;
  }
  function blotches(g, w, h, n, cols, rMin, rMax, a) {
    for (var i = 0; i < n; i++) {
      var x = Math.random() * w, y = Math.random() * h, r = rMin + Math.random() * (rMax - rMin);
      g.fillStyle = cols[(Math.random() * cols.length) | 0];
      g.globalAlpha = a;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
    g.globalAlpha = 1;
  }
  function bands(g, w, h, cols, wobble) {
    for (var y = 0; y < h; y++) {
      var k = y / h * cols.length * 2.2;
      g.fillStyle = cols[Math.floor(k) % cols.length];
      g.fillRect(0, y, w, 1);
    }
    g.globalAlpha = 0.18;
    for (var j = 0; j < 40; j++) {
      g.fillStyle = cols[(Math.random() * cols.length) | 0];
      g.beginPath();
      g.ellipse(Math.random() * w, Math.random() * h, 30 + Math.random() * 90, 3 + Math.random() * wobble, 0, 0, 7);
      g.fill();
    }
    g.globalAlpha = 1;
  }

  var TEX = {
    mars: tex(512, 256, function (g, w, h) {
      g.fillStyle = '#b4573a'; g.fillRect(0, 0, w, h);
      blotches(g, w, h, 160, ['#8e3f2a', '#d08a5e', '#a24a31', '#e0a478'], 8, 46, 0.22);
      g.fillStyle = 'rgba(255,240,230,.65)'; g.fillRect(0, 0, w, 7); g.fillRect(0, h - 7, w, 7);
    }),
    jupiter: tex(512, 256, function (g, w, h) {
      bands(g, w, h, ['#e8dcc4', '#c4a27c', '#f1e7d2', '#a98562', '#d9c3a0', '#8f6f52'], 8);
      g.fillStyle = 'rgba(176,86,56,.75)'; g.beginPath(); g.ellipse(w * .62, h * .64, 28, 15, 0, 0, 7); g.fill();
    }),
    saturn: tex(512, 256, function (g, w, h) {
      bands(g, w, h, ['#efe0b4', '#d7bf86', '#f4e9c8', '#c9ae74', '#e4d29c'], 4);
    }),
    neptune: tex(512, 256, function (g, w, h) {
      g.fillStyle = '#3f74c4'; g.fillRect(0, 0, w, h);
      blotches(g, w, h, 90, ['#6fa6e8', '#2d5aa6', '#8fc0f2'], 20, 70, 0.14);
      bands(g, w, h, ['rgba(90,150,230,.18)', 'rgba(40,80,160,.18)'], 5);
    }),
    moon: tex(512, 256, function (g, w, h) {
      g.fillStyle = '#a8adb8'; g.fillRect(0, 0, w, h);
      blotches(g, w, h, 70, ['#8a8f9c', '#c6cad4', '#7c818e'], 14, 50, 0.3);
      for (var i = 0; i < 90; i++) {                       // craters
        var x = Math.random() * w, y = Math.random() * h, r = 3 + Math.random() * 12;
        g.strokeStyle = 'rgba(60,64,76,.55)'; g.lineWidth = 1.5;
        g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
        g.strokeStyle = 'rgba(255,255,255,.25)';
        g.beginPath(); g.arc(x - 1, y - 1, r, 3.6, 5.5); g.stroke();
      }
    })
  };
  var ringTex = tex(512, 4, function (g, w) {
    var gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, 'rgba(0,0,0,0)');   gr.addColorStop(.12, 'rgba(228,208,160,.85)');
    gr.addColorStop(.40, 'rgba(240,226,184,.35)'); gr.addColorStop(.48, 'rgba(0,0,0,0)');
    gr.addColorStop(.56, 'rgba(214,192,140,.8)');  gr.addColorStop(.85, 'rgba(235,218,170,.55)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, 4);
  });

  /* ---------- planet factory ---------- */
  var glowVS = 'varying vec3 n;void main(){n=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}';
  var glowFS = 'uniform vec3 col;uniform float o;varying vec3 n;void main(){float i=pow(0.72-dot(n,vec3(0.,0.,1.)),2.4);gl_FragColor=vec4(col,1.)*i*o;}';

  function make(key, glow, ring) {
    var g = new THREE.Group();
    var body = new THREE.Mesh(
      new THREE.SphereGeometry(1, 56, 40),
      new THREE.MeshStandardMaterial({ map: TEX[key], roughness: 0.92, metalness: 0, transparent: true, opacity: 0 })
    );
    var halo = new THREE.Mesh(
      new THREE.SphereGeometry(1.14, 40, 30),
      new THREE.ShaderMaterial({
        uniforms: { col: { value: new THREE.Color(glow) }, o: { value: 0 } },
        vertexShader: glowVS, fragmentShader: glowFS,
        side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
      })
    );
    g.add(halo, body);
    var rm = null;
    if (ring) {
      rm = new THREE.Mesh(
        new THREE.RingGeometry(1.35, 2.35, 96),
        new THREE.MeshBasicMaterial({ map: ringTex, side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false })
      );
      var uv = rm.geometry.attributes.uv, pos = rm.geometry.attributes.position, v = new THREE.Vector3();
      for (var i = 0; i < pos.count; i++) {              // map ring radius to texture x
        v.fromBufferAttribute(pos, i);
        uv.setXY(i, (v.length() - 1.35) / 1.0, 0.5);
      }
      rm.rotation.x = Math.PI / 2 - 0.42; rm.rotation.y = -0.25;
      g.add(rm);
    }
    g.rotation.z = 0.2;
    scene.add(g);
    return { g: g, body: body, halo: halo, ring: rm };
  }

  var LIST = [
    { id: 'about',        side:  1, size: 0.17, p: make('mars',    0xff7a4a, false) },
    { id: 'skills',       side: -1, size: 0.20, p: make('jupiter', 0xe8c89a, false) },
    { id: 'projects',     side:  1, size: 0.15, p: make('saturn',  0xf0d890, true)  },
    { id: 'certificates', side: -1, size: 0.17, p: make('neptune', 0x5aa0ff, false) },
    { id: 'contact',      side:  1, size: 0.16, p: make('moon',    0xb8c4ff, false) }
  ];
  LIST.forEach(function (it) { it.el = document.getElementById(it.id); });

  var W = 0, H = 0;
  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    cam.left = -W / 2; cam.right = W / 2; cam.top = H / 2; cam.bottom = -H / 2;
    cam.updateProjectionMatrix();
    small = W < 700;
  }
  resize();
  addEventListener('resize', resize);

  var last = 0;
  function frame(t) {
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
    LIST.forEach(function (it) {
      var r = it.el.getBoundingClientRect();
      var p = it.p;
      if (r.bottom < -200 || r.top > H + 200) { p.g.visible = false; return; }
      p.g.visible = true;

      var R = Math.min(W, H * 1.4) * it.size * (small ? 0.7 : 1);
      var mid = r.top + r.height * 0.28;                 // sits near the top of its section
      var par = (H / 2 - mid) * 0.12;                    // gentle parallax
      p.g.position.set(it.side * (W / 2 - R * (small ? 0.2 : 0.35)), H / 2 - mid + par, 0);
      p.g.scale.setScalar(R);

      var d = Math.abs(r.top + r.height / 2 - H / 2) / (H * 0.9 + r.height / 2);
      var o = Math.max(0, 1 - d) * (small ? 0.35 : 0.62);
      p.body.material.opacity = o;
      p.halo.material.uniforms.o.value = o * 1.1;
      if (p.ring) p.ring.material.opacity = o;
      if (!reduce) p.body.rotation.y += dt * 0.05;
    });
    renderer.render(scene, cam);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();