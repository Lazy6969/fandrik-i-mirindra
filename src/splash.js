// Page d'ouverture : une illustration en fond, légèrement animée (arbres qui ondulent, personnages qui rebondissent,
// héros qui marche, titre qui flotte avec un reflet), avec la barre de progression et le bouton par-dessus.
// L'image se dépose dans  src/assets/splash.png  (ou .jpg / .webp). Sans image, un fond dégradé et le titre animé en HTML servent de repli.
import * as THREE from 'three';

const found = import.meta.glob('./assets/splash.*', { eager: true, query: '?url', import: 'default' });
const IMG_URL = Object.values(found)[0] || null;
export const hasSplashImage = !!IMG_URL;

const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const FRAG = `
precision highp float;
uniform sampler2D map; uniform float uTime; uniform float uScreen; uniform float uImg; uniform float uHas; uniform float uBoxA;
varying vec2 vUv;
float sm(float a, float b, float x) { return smoothstep(a, b, x); }
void main() {
  if (uHas < -0.5) { gl_FragColor = vec4(0.16, 0.26, 0.12, 1.0); return; }   // image en cours de chargement
  if (uHas < 0.5) {                                              // repli sans image : dégradé ciel -> herbe
    vec3 sky = mix(vec3(1.0, 0.86, 0.6), vec3(0.35, 0.65, 0.95), sm(0.45, 1.0, vUv.y));
    vec3 grass = mix(vec3(0.28, 0.55, 0.2), vec3(0.5, 0.75, 0.3), sm(0.0, 0.45, vUv.y));
    gl_FragColor = vec4(mix(grass, sky, sm(0.38, 0.5, vUv.y)), 1.0);
    return;
  }
  float k = uScreen / uImg;                                      // > 1 : écran plus large que l'image
  // k >= 1 : l'image remplit tout l'écran (léger étirement horizontal + recadrage haut/bas) ; sinon (portrait) elle est entière
  vec2 ip = (k >= 1.0) ? vec2(vUv.x, 0.5 + (vUv.y - 0.5) * uBoxA / uScreen) : vec2(vUv.x, (vUv.y - 0.5) / k + 0.5);
  vec3 col;
  if (ip.x < 0.0 || ip.x > 1.0 || ip.y < 0.0 || ip.y > 1.0) {   // marges : la même image, agrandie et très floue
    vec2 bp = (k >= 1.0) ? vec2(vUv.x, 0.5 + (vUv.y - 0.5) / k) : vec2(0.5 + (vUv.x - 0.5) * k, vUv.y);
    col = texture2D(map, clamp(bp, 0.0, 1.0), 6.0).rgb * 0.62;
  } else {
    vec2 p = vec2(ip.x, 1.0 - ip.y);                             // p.y vers le bas
    vec2 q = p; float t = uTime;
    // arbres de gauche et de droite : ondulation qui augmente vers la cime
    float h = 1.0 - sm(0.0, 0.56, p.y);
    float mL = (1.0 - sm(0.26, 0.34, p.x)) * (1.0 - sm(0.50, 0.60, p.y));
    float mR = sm(0.70, 0.78, p.x) * (1.0 - sm(0.50, 0.60, p.y));
    float tm = mL + mR;
    q.x += tm * (sin(t * 1.1 + p.y * 5.0 + p.x * 3.0) * 0.006 * h * h + sin(t * 2.7 + p.y * 28.0 + p.x * 9.0) * 0.0009 * h);
    // nuages : lente dérive
    q.x += (1.0 - tm) * (1.0 - sm(0.12, 0.30, p.y)) * sin(t * 0.3 + p.y * 4.0) * 0.0015;
    // rangée de petits personnages : chacun rebondit depuis ses pieds, avec sa propre phase
    float band = sm(0.47, 0.50, p.y) * (1.0 - sm(0.665, 0.69, p.y));
    float hero = sm(0.375, 0.405, p.x) * (1.0 - sm(0.60, 0.63, p.x));
    float cm = band * (1.0 - hero);
    float feet = clamp((0.672 - p.y) / 0.17, 0.0, 1.0);
    q.y += cm * feet * sin(t * 3.3 + p.x * 40.0) * 0.0042;
    q.x += cm * feet * sin(t * 2.4 + p.x * 23.0) * 0.0016;
    // personnage central : il marche (balancement + rebond)
    float hm = hero * sm(0.30, 0.34, p.y) * (1.0 - sm(0.70, 0.74, p.y));
    float hf = clamp((0.72 - p.y) / 0.40, 0.0, 1.0);
    q.y += hm * hf * sin(t * 4.4) * 0.007;
    q.x += hm * hf * sin(t * 2.2) * 0.005;
    // titre : il flotte doucement
    float tt = sm(0.20, 0.26, p.x) * (1.0 - sm(0.76, 0.82, p.x)) * sm(0.02, 0.06, p.y) * (1.0 - sm(0.29, 0.33, p.y));
    q.y += tt * sin(t * 1.6 + p.x * 3.0) * 0.0022;
    // plantes du premier plan
    float fl = (1.0 - sm(0.20, 0.28, p.x)) + sm(0.74, 0.82, p.x);
    q.x += fl * sm(0.70, 0.78, p.y) * sin(t * 1.7 + p.y * 9.0 + p.x * 5.0) * 0.0035 * ((p.y - 0.7) / 0.3);
    col = texture2D(map, vec2(clamp(q.x, 0.0, 1.0), 1.0 - clamp(q.y, 0.0, 1.0))).rgb;
    // reflet qui balaie le titre
    float d = abs((p.x + p.y * 0.6) - (fract(t * 0.22) * 2.2 - 0.3));
    col += col * tt * (1.0 - sm(0.0, 0.05, d)) * 0.4;
  }
  gl_FragColor = vec4(col, 1.0);
}`;

/**
 * Prépare la page d'ouverture. pump() exécute les tâches de chargement pendant un court budget de temps
 * (l'image continue de s'animer). onProgress(p, fini) reçoit la progression réelle.
 */
export function createSplash(renderer, { tasks = [], onProgress = () => {}, onImage = () => {}, onLayout = () => {}, minMs = 5000 } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = { map: { value: null }, uTime: { value: 0 }, uScreen: { value: 2 }, uImg: { value: 1.4653 }, uHas: { value: IMG_URL ? -1 : 0 }, uBoxA: { value: 1.4653 } };
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false }));
  quad.frustumCulled = false; scene.add(quad);

  let imageReady = !IMG_URL;
  if (IMG_URL) {
    new THREE.TextureLoader().load(IMG_URL, (tex) => {
      tex.colorSpace = THREE.NoColorSpace;                       // couleurs d'origine, sans conversion
      tex.generateMipmaps = true; tex.minFilter = THREE.LinearMipmapLinearFilter; tex.magFilter = THREE.LinearFilter; tex.anisotropy = 4;
      uniforms.map.value = tex; uniforms.uHas.value = 1;
      uniforms.uImg.value = tex.image.width / tex.image.height;
      resize(uniforms.uScreen.value);
      imageReady = true;
    }, undefined, () => { imageReady = true; });                  // image illisible : on garde le repli
  }

  const queue = [{ w: 3, fn: () => {} }, ...tasks];               // 1re tâche : attente de l'image
  const total = queue.reduce((s, t) => s + t.w, 0);
  let done = 0, idx = 0, finished = false, shown = 0, last = performance.now();
  const start = performance.now();
  function resize(asp) {
    uniforms.uScreen.value = asp;
    const k = asp / uniforms.uImg.value;
    const A = k >= 1 ? Math.min(asp, uniforms.uImg.value * Math.pow(k, 0.85)) : uniforms.uImg.value;
    uniforms.uBoxA.value = A; onLayout(A, k >= 1);
  }

  return {
    scene, camera,
    pump(budgetMs = 10) {
      if (shown >= 1) return true;
      const t0 = performance.now();
      while (!finished && idx < queue.length) {
        if (idx === 0 && !imageReady) break;
        const it = queue[idx++]; it.fn(); done += it.w;
        if (performance.now() - t0 >= budgetMs) break;
      }
      if (idx >= queue.length && imageReady) finished = true;
      // la barre avance à la vitesse réelle du chargement, mais ne remplit pas avant minMs (5 s)
      const real = finished ? 1 : done / total;
      const timed = Math.min(1, (performance.now() - start) / minMs);
      shown = Math.max(shown, Math.min(real, timed));
      onProgress(Math.max(0.01, shown), shown >= 1);
      return shown >= 1;
    },
    resize,
    update(t) { uniforms.uTime.value = t; },
  };
}
