/* ============================================
   Muhammad Ahmed — Portfolio JavaScript
   main.js
   ============================================ */

/* ─────────────────────────────────────
   HAMBURGER / MOBILE NAV
───────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

function closeMobileNav() {
  mobileNav.classList.remove('open');
  hamburger.classList.remove('open');
  document.body.style.overflow = '';
}


/* ─────────────────────────────────────
   CUSTOM CURSOR (desktop only)
───────────────────────────────────── */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
  });

  (function animCursor() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
    ring.style.transform   = `translate(${rx - 18}px, ${ry - 18}px)`;
    requestAnimationFrame(animCursor);
  })();
}


/* ─────────────────────────────────────
   BACKGROUND PARTICLE FIELD (Three.js)
   Black & Cyan theme
───────────────────────────────────── */
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 3;

  /* Particle cloud */
  const geo = new THREE.BufferGeometry();
  const COUNT = 1800;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i++) pos[i] = (Math.random() - 0.5) * 22;
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat = new THREE.PointsMaterial({
    color: 0x00ffe7,
    size: 0.018,
    transparent: true,
    opacity: 0.25,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  /* Floating wireframe shapes — cyan & dim cyan */
  const shapes = [];
  const geos = [
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.TetrahedronGeometry(0.28, 0),
    new THREE.IcosahedronGeometry(0.22, 0),
  ];
  const colors = [0x00ffe7, 0x00b8a6, 0x008f82];

  for (let i = 0; i < 10; i++) {
    const g = geos[i % 3];
    const m = new THREE.MeshBasicMaterial({
      color: colors[i % 3],
      wireframe: true,
      transparent: true,
      opacity: 0.1 + (i % 3) * 0.03,
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 8 - 2
    );
    mesh.userData = {
      rx: (Math.random() - 0.5) * 0.008,
      ry: (Math.random() - 0.5) * 0.010,
      floatSpeed:  Math.random() * 0.0008 + 0.0003,
      floatOffset: Math.random() * Math.PI * 2,
    };
    shapes.push(mesh);
    scene.add(mesh);
  }

  /* Subtle grid plane */
  const gridHelper = new THREE.GridHelper(40, 40, 0x003330, 0x001a18);
  gridHelper.position.z = -8;
  gridHelper.rotation.x = Math.PI / 2;
  scene.add(gridHelper);

  /* Mouse parallax */
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.008;

    points.rotation.y += 0.0001;
    points.rotation.x += 0.00005;

    camera.position.x += (mouseX * 0.25 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 0.18 - camera.position.y) * 0.02;

    shapes.forEach(s => {
      s.rotation.x += s.userData.rx;
      s.rotation.y += s.userData.ry;
      s.position.y += Math.sin(t + s.userData.floatOffset) * s.userData.floatSpeed;
    });

    renderer.render(scene, camera);
  }
  animate();
})();


/* ─────────────────────────────────────
   3D CARD CAROUSEL (Three.js)
   Black & Cyan theme
───────────────────────────────────── */
(function initCardScene() {
  const canvas = document.getElementById('card-canvas');

  /* Wait for layout paint so clientWidth/Height are real */
  function getSize() {
    return { W: canvas.clientWidth, H: canvas.clientHeight };
  }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  let { W, H } = getSize();
  renderer.setSize(W, H);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 1.2, 7);
  camera.lookAt(0, 0, 0);

  /* Lighting — cyan accent */
  scene.add(new THREE.AmbientLight(0x001a18, 0.8));

  const cyanLight = new THREE.DirectionalLight(0x00ffe7, 1.0);
  cyanLight.position.set(4, 8, 5);
  cyanLight.castShadow = true;
  scene.add(cyanLight);

  const cyanPoint = new THREE.PointLight(0x00ffe7, 2.5, 22);
  cyanPoint.position.set(-5, 2, 4);
  scene.add(cyanPoint);

  const rimLight = new THREE.PointLight(0x004d44, 1.5, 18);
  rimLight.position.set(0, -4, 5);
  scene.add(rimLight);

  /* Ground */
  const groundGeo = new THREE.PlaneGeometry(22, 22);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1 });
  const ground    = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.6;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(22, 32, 0x003330, 0x001a18);
  grid.position.y = -1.59;
  scene.add(grid);

  /* Card data — all cyan palette */
  const cardData = [
    { label: 'CS Student',     color: 0x00ffe7, emissive: 0x00ffe7 },
    { label: 'SZABIST Karachi',color: 0x00c9b6, emissive: 0x00c9b6 },
    { label: 'BSCS · 4A',     color: 0x00ffe7, emissive: 0x00ffe7 },
    { label: 'Builder',        color: 0x00b8a6, emissive: 0x00b8a6 },
    { label: 'R.N 2412115',   color: 0x00ffe7, emissive: 0x00ffe7 },
  ];

  const cards = [];
  cardData.forEach((data, i) => {
    const group = new THREE.Group();
    const angle  = (i / cardData.length) * Math.PI * 2;
    const radius = 2.8;

    group.position.set(
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius - 1
    );

    /* Card body */
    const cardMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.7, 1.0, 0.06),
      new THREE.MeshStandardMaterial({ color: 0x040d0d, roughness: 0.15, metalness: 0.8 })
    );
    cardMesh.castShadow = true;
    group.add(cardMesh);

    /* Cyan top edge */
    const edgeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.71, 0.04, 0.07),
      new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.emissive,
        emissiveIntensity: 0.8,
      })
    );
    edgeMesh.position.y = 0.48;
    group.add(edgeMesh);

    /* Cyan bottom edge */
    const edgeB = edgeMesh.clone();
    edgeB.position.y = -0.48;
    edgeB.material = edgeMesh.material.clone();
    edgeB.material.emissiveIntensity = 0.3;
    group.add(edgeB);

    /* Glow aura */
    const glowMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshStandardMaterial({
        color: data.color,
        emissive: data.emissive,
        emissiveIntensity: 0.1,
        transparent: true,
        opacity: 0.12,
      })
    );
    glowMesh.position.z = -0.35;
    group.add(glowMesh);

    group.rotation.y = -angle + Math.PI;
    group.userData = {
      angle,
      floatOffset: i * 1.3,
      origY: 0,
    };

    cards.push(group);
    scene.add(group);
  });

  /* Central icosahedron — cyan metallic */
  const icoGeo = new THREE.IcosahedronGeometry(0.72, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0x003330,
    emissive: 0x00ffe7,
    emissiveIntensity: 0.25,
    roughness: 0.05,
    metalness: 1.0,
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  icoMesh.castShadow = true;
  scene.add(icoMesh);

  /* Wireframe overlay */
  const wireMesh = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.74, 1),
    new THREE.MeshBasicMaterial({ color: 0x00ffe7, wireframe: true, transparent: true, opacity: 0.2 })
  );
  scene.add(wireMesh);

  /* ── Drag interaction ── */
  let targetRotY  = 0;
  let currentRotY = 0;
  let isDragging  = false;
  let lastX       = 0;

  canvas.addEventListener('mousedown',  e => { isDragging = true; lastX = e.clientX; });
  window.addEventListener('mouseup',    ()  => { isDragging = false; });
  canvas.addEventListener('mousemove',  e => {
    if (!isDragging) return;
    targetRotY += (e.clientX - lastX) * 0.01;
    lastX = e.clientX;
  });

  canvas.addEventListener('touchstart', e => { isDragging = true; lastX = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend',   ()  => { isDragging = false; });
  canvas.addEventListener('touchmove',  e => {
    if (!isDragging) return;
    targetRotY += (e.touches[0].clientX - lastX) * 0.01;
    lastX = e.touches[0].clientX;
  }, { passive: true });

  /* ── Resize ── */
  window.addEventListener('resize', () => {
    const { W, H } = getSize();
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });

  /* ── Animation loop ── */
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;

    currentRotY += (targetRotY - currentRotY) * 0.05;
    if (!isDragging) targetRotY += 0.004;

    cards.forEach((group, i) => {
      const floatY = Math.sin(t + group.userData.floatOffset) * 0.14;
      group.position.y = group.userData.origY + floatY;
      group.rotation.x = Math.sin(t * 0.4 + i) * 0.04;

      const angle = group.userData.angle + currentRotY;
      group.position.x = Math.cos(angle) * 2.8;
      group.position.z = Math.sin(angle) * 2.8 - 1;
      group.rotation.y = -angle + Math.PI;
    });

    icoMesh.rotation.x = t * 0.35;
    icoMesh.rotation.y = t * 0.55;
    wireMesh.rotation.x = t * 0.35;
    wireMesh.rotation.y = t * 0.55;

    /* Orbit cyan point light */
    cyanPoint.position.x = Math.sin(t * 0.45) * 6;
    cyanPoint.position.z = Math.cos(t * 0.45) * 6;

    renderer.render(scene, camera);
  }
  animate();
})();


/* ─────────────────────────────────────
   SCROLL REVEAL
───────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity  = '1';
      e.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card, .project-card').forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s';
  revealObserver.observe(el);
});
