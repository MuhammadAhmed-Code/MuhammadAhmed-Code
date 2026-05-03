/* ============================================
   Muhammad Ahmed — Portfolio JavaScript
   main.js
   ============================================ */

/* ── Custom Cursor ── */
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});

function animCursor() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  cursor.style.transform = `translate(${mx - 6}px, ${my - 6}px)`;
  ring.style.transform = `translate(${rx - 20}px, ${ry - 20}px)`;
  requestAnimationFrame(animCursor);
}
animCursor();


/* ── Background Particle Field (Three.js) ── */
(function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 3;

  // Particle cloud
  const geo = new THREE.BufferGeometry();
  const count = 2000;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 20;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0x334466,
    size: 0.025,
    transparent: true,
    opacity: 0.6
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Floating wireframe shapes
  const shapes = [];
  const shapeGeos = [
    new THREE.OctahedronGeometry(0.3, 0),
    new THREE.TetrahedronGeometry(0.3, 0),
    new THREE.IcosahedronGeometry(0.25, 0),
  ];

  for (let i = 0; i < 8; i++) {
    const g = shapeGeos[i % 3];
    const m = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0xff4d1c : 0x1c6fff,
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 10,
      (Math.random() - 0.5) * 6 - 2
    );
    mesh.userData = {
      rx: Math.random() * 0.005,
      ry: Math.random() * 0.007,
      floatSpeed: Math.random() * 0.001 + 0.0005,
      floatOffset: Math.random() * Math.PI * 2
    };
    shapes.push(mesh);
    scene.add(mesh);
  }

  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
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


/* ── 3D Interactive Card Carousel (Three.js) ── */
(function initCardScene() {
  const canvas = document.getElementById('card-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  const W = canvas.clientWidth;
  const H = canvas.clientHeight;
  renderer.setSize(W, H);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.set(0, 1.5, 7);
  camera.lookAt(0, 0, 0);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xff4d1c, 1.2);
  dirLight.position.set(5, 8, 5);
  dirLight.castShadow = true;
  scene.add(dirLight);

  const blueLight = new THREE.PointLight(0x1c6fff, 2, 20);
  blueLight.position.set(-5, 2, 3);
  scene.add(blueLight);

  const rimLight = new THREE.PointLight(0xffffff, 0.5, 15);
  rimLight.position.set(0, -3, 5);
  scene.add(rimLight);

  // Ground plane
  const groundGeo = new THREE.PlaneGeometry(20, 20);
  const groundMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0f, roughness: 1 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.5;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid on ground
  const gridHelper = new THREE.GridHelper(20, 30, 0x1a1a2e, 0x1a1a2e);
  gridHelper.position.y = -1.49;
  scene.add(gridHelper);

  // Card data
  const cardData = [
    { label: 'CS\nStudent',     color: 0xff4d1c },
    { label: 'SZABIST\nKarachi', color: 0x1c6fff },
    { label: 'BSCS\n4A',        color: 0x00d4aa },
    { label: 'Builder\n& Coder', color: 0xf5c518 },
    { label: 'R.N\n2412115',    color: 0xff4d1c },
  ];

  // Build floating cards
  const cards = [];
  cardData.forEach((data, i) => {
    const group = new THREE.Group();
    const angle = (i / cardData.length) * Math.PI * 2;
    const radius = 2.8;
    group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius - 1);

    // Card body
    const cardGeo = new THREE.BoxGeometry(1.6, 1, 0.06);
    const cardMat = new THREE.MeshStandardMaterial({
      color: 0x111122,
      roughness: 0.2,
      metalness: 0.7,
    });
    const card = new THREE.Mesh(cardGeo, cardMat);
    card.castShadow = true;
    group.add(card);

    // Accent top edge
    const edgeGeo = new THREE.BoxGeometry(1.61, 0.04, 0.065);
    const edgeMat = new THREE.MeshStandardMaterial({
      color: data.color,
      emissive: data.color,
      emissiveIntensity: 0.6
    });
    const edge = new THREE.Mesh(edgeGeo, edgeMat);
    edge.position.y = 0.48;
    group.add(edge);

    // Glow sphere
    const glowGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const glowMat = new THREE.MeshStandardMaterial({
      color: data.color,
      emissive: data.color,
      emissiveIntensity: 0.15,
      transparent: true,
      opacity: 0.15
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -0.3;
    group.add(glow);

    group.rotation.y = -angle + Math.PI;
    group.userData = {
      angle,
      floatOffset: i * 1.2,
      origY: group.position.y,
      color: data.color
    };

    cards.push(group);
    scene.add(group);
  });

  // Central icosahedron
  const centerGeo = new THREE.IcosahedronGeometry(0.7, 1);
  const centerMat = new THREE.MeshStandardMaterial({
    color: 0xff4d1c,
    emissive: 0xff4d1c,
    emissiveIntensity: 0.15,
    roughness: 0.1,
    metalness: 0.9,
  });
  const centerMesh = new THREE.Mesh(centerGeo, centerMat);
  centerMesh.castShadow = true;
  scene.add(centerMesh);

  const wireGeo = new THREE.IcosahedronGeometry(0.72, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xff4d1c,
    wireframe: true,
    transparent: true,
    opacity: 0.25
  });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireMesh);

  // Drag interaction
  let targetRotY = 0, currentRotY = 0;
  let isDragging = false, lastX = 0;

  canvas.addEventListener('mousedown', e => { isDragging = true; lastX = e.clientX; });
  window.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mousemove', e => {
    if (isDragging) {
      targetRotY += (e.clientX - lastX) * 0.01;
      lastX = e.clientX;
    }
  });

  // Touch support
  canvas.addEventListener('touchstart', e => { isDragging = true; lastX = e.touches[0].clientX; });
  window.addEventListener('touchend', () => { isDragging = false; });
  canvas.addEventListener('touchmove', e => {
    if (isDragging) {
      targetRotY += (e.touches[0].clientX - lastX) * 0.01;
      lastX = e.touches[0].clientX;
    }
  });

  // Resize
  window.addEventListener('resize', () => {
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
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
      const floatY = Math.sin(t + group.userData.floatOffset) * 0.15;
      group.position.y = group.userData.origY + floatY;
      group.rotation.x = Math.sin(t * 0.5 + i) * 0.05;

      const angle = group.userData.angle + currentRotY;
      group.position.x = Math.cos(angle) * 2.8;
      group.position.z = Math.sin(angle) * 2.8 - 1;
      group.rotation.y = -angle + Math.PI;
    });

    centerMesh.rotation.x = t * 0.4;
    centerMesh.rotation.y = t * 0.6;
    wireMesh.rotation.x = t * 0.4;
    wireMesh.rotation.y = t * 0.6;

    blueLight.position.x = Math.sin(t * 0.5) * 6;
    blueLight.position.z = Math.cos(t * 0.5) * 6;

    renderer.render(scene, camera);
  }
  animate();
})();


/* ── Scroll Reveal ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.skill-card, .project-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.6s ease, transform 0.3s, background 0.3s, border-color 0.3s';
  observer.observe(el);
});
