/* ============================================
   Muhammad Ahmed — Portfolio JavaScript
   Theme: Black & Cyan | Responsive
   ============================================ */

/* ── Hamburger / Mobile Nav ── */
const hamburger  = document.getElementById('hamburger');
const mobileNav  = document.getElementById('mobileNav');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileNav.classList.toggle('open');
  document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
});

function closeMobileNav() {
  hamburger.classList.remove('open');
  mobileNav.classList.remove('open');
  document.body.style.overflow = '';
}

/* Close on escape key */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileNav();
});


/* ── Custom Cursor (desktop only) ── */
const cursor = document.getElementById('cursor');
const ring   = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

function animCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
  ring.style.transform   = `translate(${rx - 18}px, ${ry - 18}px)`;
  requestAnimationFrame(animCursor);
}
animCursor();


/* ── Background Particle Field ── */
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 3;

  /* Particle cloud */
  const geo   = new THREE.BufferGeometry();
  const count = 2000;
  const pos   = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 20;
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  const mat    = new THREE.PointsMaterial({ color: 0x00ffe7, size: 0.018, transparent: true, opacity: 0.35 });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  /* Floating wireframe shapes */
  const shapes    = [];
  const shapeGeos = [
    new THREE.OctahedronGeometry(0.28, 0),
    new THREE.TetrahedronGeometry(0.28, 0),
    new THREE.IcosahedronGeometry(0.22, 0),
  ];

  for (let i = 0; i < 8; i++) {
    const g = shapeGeos[i % 3];
    const m = new THREE.MeshBasicMaterial({
      color:       i % 2 === 0 ? 0x00ffe7 : 0x00b8a6,
      wireframe:   true,
      transparent: true,
      opacity:     0.1
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6 - 2
    );
    mesh.userData = {
      rx:          Math.random() * 0.005,
      ry:          Math.random() * 0.007,
      floatSpeed:  Math.random() * 0.001 + 0.0005,
      floatOffset: Math.random() * Math.PI * 2
    };
    shapes.push(mesh);
    scene.add(mesh);
  }

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
    t += 0.01;
    points.rotation.y += 0.0002;
    points.rotation.x += 0.0001;
    camera.position.x += (mouseX * 0.3 - camera.position.x) * 0.02;
    camera.position.y += (mouseY * 0.2 - camera.position.y) * 0.02;
    shapes.forEach(s => {
      s.rotation.x += s.userData.rx;
      s.rotation.y += s.userData.ry;
      s.position.y += Math.sin(t + s.userData.floatOffset) * s.userData.floatSpeed;
    });
    renderer.render(scene, camera);
  }
  animate();
})();


/* ── 3D Interactive Card Carousel ── */
(function initCardScene() {
  const canvas = document.getElementById('card-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  function getSize() {
    return { W: canvas.clientWidth, H: canvas.clientHeight };
  }

  let { W, H } = getSize();
  renderer.setSize(W, H);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 1.5, 7);
  camera.lookAt(0, 0, 0);

  /* Lighting */
  scene.add(new THREE.AmbientLight(0xffffff, 0.25));

  const dirLight = new THREE.DirectionalLight(0x00ffe7, 1.4);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const cyanLight = new THREE.PointLight(0x00ffe7, 2.5, 20);
  cyanLight.position.set(-5, 2, 3);
  scene.add(cyanLight);

  const rimLight = new THREE.PointLight(0x00b8a6, 0.8, 15);
  rimLight.position.set(0, -3, 5);
  scene.add(rimLight);

  /* Ground */
  const groundGeo = new THREE.PlaneGeometry(20, 20);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 1 });
  const ground    = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.receiveShadow = true;
  scene.add(ground);

  const gridHelper = new THREE.GridHelper(20, 30, 0x002020, 0x001818);
  gridHelper.position.y = -1.49;
  scene.add(gridHelper);

  /* Floating cards */
  const cards    = [];
  const cardData = [
    { color: 0x00ffe7 },
    { color: 0x00b8a6 },
    { color: 0x00ffe7 },
    { color: 0x00d4c0 },
    { color: 0x00ffe7 },
  ];

  cardData.forEach((data, i) => {
    const group = new THREE.Group();
    const angle  = (i / cardData.length) * Math.PI * 2;
    const radius = 2.8;
    group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 1);

    /* Card body */
    const cardGeo = new THREE.BoxGeometry(1.6, 1, 0.06);
    const cardMat = new THREE.MeshStandardMaterial({ color: 0x080c0c, roughness: 0.15, metalness: 0.8 });
    const card    = new THREE.Mesh(cardGeo, cardMat);
    card.castShadow = true;
    group.add(card);

    /* Cyan accent edge */
    const edgeGeo = new THREE.BoxGeometry(1.61, 0.04, 0.068);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: data.color, emissive: data.color, emissiveIntensity: 0.9
    });
    const edge    = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = 0.48;
    group.add(edge);

    /* Glow sphere */
    const glowGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMat = new THREE.MeshStandardMaterial({
      color: data.color, emissive: data.color, emissiveIntensity: 0.1,
      transparent: true, opacity: 0.1
    });
    const glow    = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -0.3;
    group.add(glow);

    group.rotation.y  = -angle + Math.PI;
    group.userData    = { angle, floatOffset: i * 1.2, origY: group.position.y };
    cards.push(group);
    scene.add(group);
  });

  /* Central icosahedron */
  const centerGeo  = new THREE.IcosahedronGeometry(0.7, 1);
  const centerMat  = new THREE.MeshStandardMaterial({
    color: 0x00ffe7, emissive: 0x00ffe7, emissiveIntensity: 0.2,
    roughness: 0.05, metalness: 0.95
  });
  const centerMesh = new THREE.Mesh(centerGeo, centerMat);
  centerMesh.castShadow = true;
  scene.add(centerMesh);

  const wireGeo  = new THREE.IcosahedronGeometry(0.73, 1);
  const wireMat  = new THREE.MeshBasicMaterial({ color: 0x00ffe7, wireframe: true, transparent: true, opacity: 0.2 });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireMesh);

  /* Drag interaction */
  let targetRotY = 0, currentRotY = 0;
  let isDragging = false, lastX = 0;

  canvas.addEventListener('mousedown',  e => { isDragging = true;  lastX = e.clientX; });
  window.addEventListener('mouseup',    () => { isDragging = false; });
  canvas.addEventListener('mousemove',  e => {
    if (isDragging) { targetRotY += (e.clientX - lastX) * 0.01; lastX = e.clientX; }
  });

  canvas.addEventListener('touchstart', e => { isDragging = true;  lastX = e.touches[0].clientX; }, { passive: true });
  window.addEventListener('touchend',   () => { isDragging = false; });
  canvas.addEventListener('touchmove',  e => {
    if (isDragging) { targetRotY += (e.touches[0].clientX - lastX) * 0.01; lastX = e.touches[0].clientX; }
  }, { passive: true });

  window.addEventListener('resize', () => {
    const { W, H } = getSize();
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });

  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.01;
    currentRotY += (targetRotY - currentRotY) * 0.05;
    if (!isDragging) targetRotY += 0.004;

    cards.forEach((group, i) => {
      group.position.y  = group.userData.origY + Math.sin(t + group.userData.floatOffset) * 0.15;
      group.rotation.x  = Math.sin(t * 0.5 + i) * 0.05;
      const angle       = group.userData.angle + currentRotY;
      group.position.x  = Math.cos(angle) * 2.8;
      group.position.z  = Math.sin(angle) * 2.8 - 1;
      group.rotation.y  = -angle + Math.PI;
    });

    centerMesh.rotation.x = t * 0.4;
    centerMesh.rotation.y = t * 0.6;
    wireMesh.rotation.x   = t * 0.4;
    wireMesh.rotation.y   = t * 0.6;

    cyanLight.position.x = Math.sin(t * 0.5) * 6;
    cyanLight.position.z = Math.cos(t * 0.5) * 6;

    renderer.render(scene, camera);
  }
  animate();
})();


/* ── Scroll Reveal ── */
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
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease, background 0.3s, border-color 0.3s, box-shadow 0.3s';
  revealObserver.observe(el);
});
