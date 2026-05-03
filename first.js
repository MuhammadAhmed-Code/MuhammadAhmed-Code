(function () {
  'use strict';

  document.getElementById('y').textContent = new Date().getFullYear();

  /* ── Mobile nav ── */
  var ham = document.querySelector('.hamburger');
  var mob = document.getElementById('mobile-nav');
  var mobileLinks = mob.querySelectorAll('a');

  function setMenu(open) {
    ham.classList.toggle('open', open);
    mob.classList.toggle('open', open);
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
    mob.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  ham.addEventListener('click', function () {
    setMenu(!mob.classList.contains('open'));
  });
  mobileLinks.forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });

  /* ── Cursor (fine pointers only) ── */
  var cursor = document.getElementById('cursor');
  var ring = document.getElementById('cursor-ring');
  var mx = 0, my = 0, rx = 0, ry = 0;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  if (finePointer && cursor && ring) {
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      cursor.style.transform = 'translate(' + (mx - 5) + 'px,' + (my - 5) + 'px)';
    });
    function loopRing() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = 'translate(' + (rx - 20) + 'px,' + (ry - 20) + 'px)';
      requestAnimationFrame(loopRing);
    }
    loopRing();
    document.querySelectorAll('a, button, .skill-card, .project-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { ring.classList.add('hover'); });
      el.addEventListener('mouseleave', function () { ring.classList.remove('hover'); });
    });
  }

  /* ── Hero tilt ── */
  var heroInner = document.getElementById('hero-inner');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (heroInner && finePointer && !reduceMotion) {
    document.addEventListener('mousemove', function (e) {
      var cx = window.innerWidth / 2;
      var cy = window.innerHeight / 2;
      var dx = (e.clientX - cx) / cx;
      var dy = (e.clientY - cy) / cy;
      heroInner.style.transform = 'rotateY(' + (dx * 6).toFixed(2) + 'deg) rotateX(' + (-dy * 4).toFixed(2) + 'deg)';
    });
    document.addEventListener('mouseleave', function () {
      heroInner.style.transform = '';
    });
  }

  /* ── Scroll reveal ── */
  if (!reduceMotion) {
    var reveals = document.querySelectorAll('.reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in-view');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ── Background canvas: depth grid + sparks ── */
  var bg = document.getElementById('bg-canvas');
  if (bg && !reduceMotion) {
    var bctx = bg.getContext('2d');
    var stars = [];
    var nStars = Math.min(120, Math.floor(window.innerWidth / 12));

    function resizeBg() {
      bg.width = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2);
      bg.height = window.innerHeight * Math.min(window.devicePixelRatio || 1, 2);
      bg.style.width = window.innerWidth + 'px';
      bg.style.height = window.innerHeight + 'px';
    }
    resizeBg();
    for (var i = 0; i < nStars; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        z: Math.random(),
        s: Math.random() * 2 + 0.5,
        v: Math.random() * 0.15 + 0.02
      });
    }

    var t0 = performance.now();
    function drawBg(now) {
      var t = (now - t0) * 0.001;
      var w = bg.width, h = bg.height;
      bctx.fillStyle = '#000000';
      bctx.fillRect(0, 0, w, h);
      bctx.strokeStyle = 'rgba(0, 255, 231, 0.04)';
      var step = 48 * (window.devicePixelRatio || 1);
      var off = (t * 18) % step;
      bctx.beginPath();
      for (var gx = -step + off; gx < w + step; gx += step) {
        bctx.moveTo(gx, 0); bctx.lineTo(gx, h);
      }
      for (var gy = -step + off * 0.7; gy < h + step; gy += step) {
        bctx.moveTo(0, gy); bctx.lineTo(w, gy);
      }
      bctx.stroke();

      for (var j = 0; j < stars.length; j++) {
        var st = stars[j];
        st.y += st.v * 0.00035;
        if (st.y > 1) st.y = 0;
        var px = st.x * w;
        var py = (st.y % 1) * h;
        var alpha = 0.15 + st.z * 0.55;
        bctx.fillStyle = 'rgba(0, 255, 231, ' + alpha + ')';
        bctx.beginPath();
        bctx.arc(px, py, st.s * (window.devicePixelRatio || 1), 0, Math.PI * 2);
        bctx.fill();
      }
      requestAnimationFrame(drawBg);
    }
    requestAnimationFrame(drawBg);
    window.addEventListener('resize', resizeBg);
  }

  /* ── Three.js centerpiece ── */
  var canvas = document.getElementById('card-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  if (renderer.outputColorSpace !== undefined) {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
  }
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x020608, 0.055);

  var camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
  camera.position.set(0, 0.4, 9.2);

  var main = new THREE.Group();
  scene.add(main);

  var cyan = 0x00ffe7;
  var magenta = 0xff2bd6;
  var violet = 0x7c3aed;

  var knotGeo = new THREE.TorusKnotGeometry(1.05, 0.32, 180, 16, 2, 3);
  var knotMat = new THREE.MeshStandardMaterial({
    color: 0x061016,
    metalness: 0.9,
    roughness: 0.18,
    emissive: new THREE.Color(cyan),
    emissiveIntensity: 0.35
  });
  var knot = new THREE.Mesh(knotGeo, knotMat);
  main.add(knot);

  var wire = new THREE.Mesh(
    knotGeo,
    new THREE.MeshBasicMaterial({ color: cyan, wireframe: true, transparent: true, opacity: 0.12 })
  );
  wire.scale.setScalar(1.02);
  main.add(wire);

  var icoGeo = new THREE.IcosahedronGeometry(0.22, 0);
  var shardGroup = new THREE.Group();
  for (var s = 0; s < 14; s++) {
    var mat = new THREE.MeshStandardMaterial({
      color: s % 2 ? violet : 0x0a1518,
      metalness: 0.85,
      roughness: 0.25,
      emissive: new THREE.Color(s % 3 === 0 ? magenta : cyan),
      emissiveIntensity: 0.45
    });
    var mesh = new THREE.Mesh(icoGeo, mat);
    var a = (s / 14) * Math.PI * 2;
    var r = 2.35 + (s % 3) * 0.15;
    mesh.position.set(Math.cos(a) * r, Math.sin(a * 2.1) * 0.5, Math.sin(a) * r);
    mesh.userData.phase = s * 0.7;
    shardGroup.add(mesh);
  }
  main.add(shardGroup);

  var ringGeo = new THREE.TorusGeometry(3.1, 0.02, 12, 100);
  var ringMat = new THREE.MeshBasicMaterial({ color: cyan, transparent: true, opacity: 0.35 });
  var ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 2.35;
  main.add(ringMesh);

  var ring2 = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: magenta, transparent: true, opacity: 0.2 }));
  ring2.scale.setScalar(1.12);
  ring2.rotation.x = Math.PI / 2.1;
  ring2.rotation.z = 0.4;
  main.add(ring2);

  scene.add(new THREE.AmbientLight(0x1a3035, 0.6));
  var p1 = new THREE.PointLight(cyan, 2.2, 20, 2);
  p1.position.set(3, 2, 4);
  scene.add(p1);
  var p2 = new THREE.PointLight(magenta, 1.8, 18, 2);
  p2.position.set(-3.5, -1, 3);
  scene.add(p2);
  var p3 = new THREE.PointLight(violet, 1.2, 16, 2);
  p3.position.set(0, 3.5, -2);
  scene.add(p3);

  var clock = new THREE.Clock();
  var targetRotY = 0;
  var targetRotX = 0;
  var dragging = false;
  var lx = 0, ly = 0;

  if (finePointer) {
    canvas.addEventListener('pointerdown', function (e) {
      dragging = true;
      lx = e.clientX; ly = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointerup', function (e) {
      dragging = false;
      try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lx;
      var dy = e.clientY - ly;
      lx = e.clientX; ly = e.clientY;
      targetRotY += dx * 0.005;
      targetRotX += dy * 0.003;
      targetRotX = Math.max(-0.65, Math.min(0.65, targetRotX));
    });
  }

  function resize3d() {
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(1, rect.width);
    var h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize3d();
  window.addEventListener('resize', resize3d);

  var scrollY = 0;
  window.addEventListener('scroll', function () {
    scrollY = window.scrollY || 0;
  }, { passive: true });

  function animate() {
    requestAnimationFrame(animate);
    if (reduceMotion) {
      renderer.render(scene, camera);
      return;
    }
    var t = clock.getElapsedTime();
    var ease = 1;

    main.rotation.y += (targetRotY - main.rotation.y) * 0.06 * ease;
    main.rotation.x += (targetRotX - main.rotation.x) * 0.06 * ease;
    if (!dragging && ease) {
      targetRotY += 0.0018;
    }

    knot.rotation.x = t * 0.31;
    knot.rotation.y = t * 0.22;
    wire.rotation.copy(knot.rotation);

    shardGroup.rotation.y = t * 0.15;
    shardGroup.children.forEach(function (ch, idx) {
      ch.position.y += Math.sin(t * 1.4 + ch.userData.phase) * 0.0012;
      ch.rotation.x = t * 0.5 + idx;
      ch.rotation.z = t * 0.35;
    });

    ringMesh.rotation.z = t * 0.08;
    ring2.rotation.z = -t * 0.06 + 0.4;

    var scrollBoost = Math.min(1, scrollY / 1400);
    camera.position.z = 9.2 - scrollBoost * 1.4;
    p1.position.x = 3 + Math.sin(t * 0.7) * 1.2;
    p1.position.z = 4 + Math.cos(t * 0.5) * 0.8;
    p2.position.x = -3.5 + Math.cos(t * 0.55) * 1.1;
    p3.position.y = 3.5 + Math.sin(t * 0.9) * 0.6;

    knotMat.emissiveIntensity = 0.28 + scrollBoost * 0.35;

    renderer.render(scene, camera);
  }
  animate();
})();
