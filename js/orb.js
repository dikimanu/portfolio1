/* ============================================================
   orb.js
   Rotating Earth built with Three.js:
   - day side + night side with tiny city lights
   - drifting clouds
   - soft blue atmosphere glow around the edge
   - tilts a little toward your mouse, drifts away as you scroll
   (Three.js is loaded in index.html before this file.)

   Texture: by default the Earth surface is DRAWN IN CODE, so no
   image files are needed. For the real photo of Earth, save a
   NASA "Blue Marble" image as assets/images/earth.jpg
   (optional: assets/images/earth_clouds.png for clouds).
   It is used automatically when it exists.
   ============================================================ */

(function () {
  if (!window.THREE) return;   // stops quietly if Three.js did not load

  var box = document.getElementById('orb');
  if (!box) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var small  = innerWidth < 700;

  /* ---------- Edit these ---------- */
  var EARTH_SIZE   = 2.2;                  // radius of the planet
  var SPIN_SPEED   = 0.0013;               // how fast the Earth turns
  var CLOUD_SPEED  = 0.0017;               // clouds turn a bit faster
  var TEX_WIDTH    = small ? 512 : 1024;   // size of the drawn texture (height = half)
  var SUN_COLOR    = 0xfff1de;             // warm sunlight
  var GLOW_COLOR   = [0.25, 0.55, 1.0];    // atmosphere colour (red, green, blue 0-1)

  /* ============================================================
     Procedural Earth surface (value noise on a sphere)
     ============================================================ */
  /*TEX-START*/
  function h3(x, y, z) {
    var n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  }
  function vnoise(x, y, z) {
    var xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    var xf = x - xi, yf = y - yi, zf = z - zi;
    var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    var a = h3(xi, yi, zi),         b = h3(xi + 1, yi, zi);
    var c = h3(xi, yi + 1, zi),     d = h3(xi + 1, yi + 1, zi);
    var e = h3(xi, yi, zi + 1),     f = h3(xi + 1, yi, zi + 1);
    var g = h3(xi, yi + 1, zi + 1), h = h3(xi + 1, yi + 1, zi + 1);
    var x1 = a + (b - a) * u, x2 = c + (d - c) * u, x3 = e + (f - e) * u, x4 = g + (h - g) * u;
    var y1 = x1 + (x2 - x1) * v, y2 = x3 + (x4 - x3) * v;
    return y1 + (y2 - y1) * w;
  }
  function fbm(x, y, z, oct) {
    var s = 0, amp = 0.5, f = 1, m = 0;
    for (var i = 0; i < oct; i++) {
      s += amp * vnoise(x * f, y * f, z * f);
      m += amp; amp *= 0.5; f *= 2.03;
    }
    return s / m;
  }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function lerp(a, b, t) { return a + (b - a) * t; }

  var SEA = 0.565;   // sea level: higher number = more ocean

  // colour of one point on the planet (x, y, z on a unit sphere) -> written into o
  function sample(x, y, z, o) {
    var n = fbm(x * 1.7 + 3.1, y * 1.7 + 1.3, z * 1.7 + 7.7, 5);
    var aLat = Math.abs(y);
    var polar = clamp((aLat + (n - 0.5) * 0.1 - 0.93) * 24, 0, 1);
    var r, g, b, spec;

    o.lr = 0; o.lg = 0; o.lb = 0;
    o.cloud = clamp((fbm(x * 2.6 + 20, y * 3.4 + 5, z * 2.6 + 11, 5) - 0.5) * 3.2, 0, 1);

    if (n < SEA) {                                   // ocean
      var t = Math.pow(clamp(1 - (SEA - n) * 9, 0, 1), 1.6);   // 0 deep .. 1 shallow coast
      r = lerp(8, 20, t); g = lerp(40, 116, t); b = lerp(98, 172, t);
      spec = 210;
    } else {                                         // land
      var e = (n - SEA) / (1 - SEA);
      var moist = fbm(x * 2.4 + 9, y * 2.4 + 4, z * 2.4 + 2, 3);
      var dry = clamp((0.5 - moist) * 5, 0, 1) * clamp(1 - aLat * 1.5, 0, 1);
      r = lerp(34, 58, moist);  g = lerp(86, 120, moist);  b = lerp(48, 62, moist);
      r = lerp(r, 198, dry);    g = lerp(g, 168, dry);     b = lerp(b, 112, dry);
      var m = clamp((e - 0.28) * 3.2, 0, 1);                       // mountains
      r = lerp(r, 128, m);      g = lerp(g, 116, m);       b = lerp(b, 104, m);
      var tex = 0.8 + 0.4 * vnoise(x * 16, y * 16, z * 16);        // fine surface detail
      r *= tex; g *= tex; b *= tex;
      var snow = Math.max(clamp((e - 0.62) * 6, 0, 1), clamp((aLat - 0.78) * 7, 0, 1));
      r = lerp(r, 244, snow);   g = lerp(g, 247, snow);    b = lerp(b, 252, snow);
      spec = 25;

      if (aLat < 0.82 && e < 0.45) {                 // city lights for the night side
        var cluster = clamp((fbm(x * 5 + 4, y * 5 + 8, z * 5 + 1, 3) - 0.5) * 4, 0, 1);
        var d = clamp((vnoise(x * 70, y * 70, z * 70) - 0.74) * 9, 0, 1) * cluster;
        o.lr = 255 * d; o.lg = 190 * d; o.lb = 105 * d;
      }
    }

    // polar ice caps
    r = lerp(r, 236, polar); g = lerp(g, 242, polar); b = lerp(b, 250, polar);
    spec = lerp(spec, 40, polar);

    o.r = r; o.g = g; o.b = b; o.spec = spec;
  }
  /*TEX-END*/

  /* ---------- Scene, camera, renderer ---------- */

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 7;

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !small });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
  box.appendChild(renderer.domElement);

  // sunlight from the upper left, and a faint blue glow on the dark side
  var sun = new THREE.DirectionalLight(SUN_COLOR, 1.55);
  sun.position.set(-4, 2, 3);
  scene.add(sun);
  scene.add(new THREE.AmbientLight(0x5f7fcf, 0.22));

  var system = new THREE.Group();          // whole planet: position, scroll, mouse tilt
  scene.add(system);
  var axis = new THREE.Group();            // the planet's tilted axis
  axis.rotation.z = 0.41;
  system.add(axis);

  var segs = small ? 48 : 72;

  var earthMat = new THREE.MeshPhongMaterial({
    color: 0x0b2a5c,                       // plain ocean blue until the texture is ready
    specular: new THREE.Color(0x4a6a9a),
    shininess: 22
  });
  var earth = new THREE.Mesh(new THREE.SphereGeometry(EARTH_SIZE, segs, segs), earthMat);
  axis.add(earth);

  var cloudMat = new THREE.MeshPhongMaterial({
    color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false
  });
  var clouds = new THREE.Mesh(new THREE.SphereGeometry(EARTH_SIZE * 1.012, segs, segs), cloudMat);
  axis.add(clouds);

  // atmosphere: outer halo (seen from behind the planet) + thin rim on the planet
  var vert = 'varying vec3 vN;' +
             'void main(){ vN = normalize(normalMatrix * normal);' +
             'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
  var col  = 'vec3(' + GLOW_COLOR.join(',') + ')';

  var halo = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_SIZE * 1.16, segs, segs),
    new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: 'varying vec3 vN; void main(){' +
        'float i = pow(max(0.66 - dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.0);' +
        'gl_FragColor = vec4(' + col + ' * i * 1.9, i); }',
      side: THREE.BackSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    })
  );
  system.add(halo);

  var rim = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_SIZE * 1.018, segs, segs),
    new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: 'varying vec3 vN; void main(){' +
        'float f = pow(1.0 - max(dot(vN, vec3(0.0, 0.0, 1.0)), 0.0), 3.2);' +
        'gl_FragColor = vec4(' + col + ' * 1.15, f * 0.85); }',
      blending: THREE.AdditiveBlending, transparent: true, depthWrite: false
    })
  );
  system.add(rim);

  /* ---------- Textures ---------- */

  function canvasTex(canvas) {
    var t = new THREE.CanvasTexture(canvas);
    t.anisotropy = 4;
    return t;
  }

  // draws the Earth in small slices so the page never freezes
  function buildProcedural() {
    var W = TEX_WIDTH, H = W / 2;
    function mk() {
      var c = document.createElement('canvas');
      c.width = W; c.height = H;
      var ctx = c.getContext('2d');
      return { c: c, ctx: ctx, img: ctx.createImageData(W, H) };
    }
    var map = mk(), spec = mk(), lights = mk(), cloud = mk();
    var o = {}, row = 0;

    function slice() {
      var end = Math.min(H, row + 10);
      for (; row < end; row++) {
        var lat = (0.5 - (row + 0.5) / H) * Math.PI;
        var cl = Math.cos(lat), y = Math.sin(lat);
        for (var px = 0; px < W; px++) {
          var lon = ((px + 0.5) / W) * Math.PI * 2 - Math.PI;
          sample(cl * Math.cos(lon), y, cl * Math.sin(lon), o);
          var i = (row * W + px) * 4;
          map.img.data[i] = o.r;  map.img.data[i + 1] = o.g;  map.img.data[i + 2] = o.b;  map.img.data[i + 3] = 255;
          spec.img.data[i] = spec.img.data[i + 1] = spec.img.data[i + 2] = o.spec;        spec.img.data[i + 3] = 255;
          lights.img.data[i] = o.lr; lights.img.data[i + 1] = o.lg; lights.img.data[i + 2] = o.lb; lights.img.data[i + 3] = 255;
          cloud.img.data[i] = cloud.img.data[i + 1] = cloud.img.data[i + 2] = 255;        cloud.img.data[i + 3] = o.cloud * 235;
        }
      }
      if (row < H) { setTimeout(slice, 0); return; }

      [map, spec, lights, cloud].forEach(function (m) { m.ctx.putImageData(m.img, 0, 0); });

      earthMat.color.set(0xffffff);
      earthMat.map = canvasTex(map.c);
      earthMat.specularMap = canvasTex(spec.c);
      earthMat.emissive.set(0xffffff);
      earthMat.emissiveMap = canvasTex(lights.c);
      earthMat.emissiveIntensity = 0.95;
      earthMat.needsUpdate = true;

      cloudMat.map = canvasTex(cloud.c);
      cloudMat.opacity = 1;
      cloudMat.needsUpdate = true;

      if (reduce) renderer.render(scene, camera);
    }
    slice();
  }

  // real photo, only if the file exists (and the page is not opened as file://)
  function tryReal() {
    if (location.protocol === 'file:') { buildProcedural(); return; }
    var loader = new THREE.TextureLoader();
    loader.load('assets/images/earth.jpg', function (tex) {
      earthMat.color.set(0xffffff);
      earthMat.map = tex;
      earthMat.needsUpdate = true;
      loader.load('assets/images/earth_clouds.png', function (ct) {
        cloudMat.map = ct; cloudMat.opacity = 1; cloudMat.needsUpdate = true;
      }, undefined, function () {});
      if (reduce) renderer.render(scene, camera);
    }, undefined, buildProcedural);
  }
  tryReal();

  /* ---------- Size, position, mouse ---------- */

  var baseX = 0.5, baseY = -0.25, baseScale = 1, baseOpacity = 1;

  function fit() {
    var w = box.clientWidth;
    var h = box.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();

    if (w / h < 1) {              // phone: planet in the middle, smaller
      baseX = 0;    baseY = 0.4;   baseScale = 0.82; baseOpacity = 0.55;
    } else {                      // desktop: planet on the right
      baseX = 0.55; baseY = -0.3;  baseScale = 1;    baseOpacity = 1;
    }
    if (reduce) renderer.render(scene, camera);
  }
  addEventListener('resize', fit);
  fit();

  var tiltX = 0, tiltY = 0;
  addEventListener('pointermove', function (e) {
    tiltX = (e.clientX / innerWidth - 0.5) * 0.35;
    tiltY = (e.clientY / innerHeight - 0.5) * 0.25;
  });

  /* ---------- Animation loop ---------- */

  function frame() {
    // scroll: the Earth drifts up, shrinks and fades as you leave the hero
    var p = Math.min((window.scrollY || 0) / (innerHeight * 0.9), 1);
    box.style.opacity = baseOpacity * (1 - p);

    if (p < 1) {
      earth.rotation.y  += SPIN_SPEED * (1 + p * 4);
      clouds.rotation.y += CLOUD_SPEED * (1 + p * 4);

      system.position.set(baseX, baseY + p * 1.4, 0);
      system.scale.setScalar(baseScale * (1 - p * 0.25));
      system.rotation.y += (tiltX - system.rotation.y) * 0.04;
      system.rotation.x += (tiltY - system.rotation.x) * 0.04;

      renderer.render(scene, camera);
    }
    if (!reduce) requestAnimationFrame(frame);
  }
  if (reduce) renderer.render(scene, camera);
  else requestAnimationFrame(frame);
})();