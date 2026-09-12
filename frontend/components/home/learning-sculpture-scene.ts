import * as THREE from "three";

const TAU = Math.PI * 2;

export interface LearningSculptureScene {
  render: (progress: number) => void;
  resize: (width: number, height: number) => void;
  dispose: () => void;
}

/** A flattened, gently tapered torus, with rounded edges that catch the light. */
function createBandGeometry(radius: number, width: number, seed: number) {
  const segments = 192;
  const sides = 16;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let segment = 0; segment <= segments; segment += 1) {
    const angle = (segment / segments) * TAU;
    const taper = 0.82 + 0.18 * Math.sin(angle * 2 + seed);
    const twist = 0.2 * Math.sin(angle * 2 + seed);
    const centerRadius = radius + 0.018 * Math.sin(angle * 3 + seed);

    for (let side = 0; side <= sides; side += 1) {
      const edge = (side / sides) * TAU;
      const across = Math.cos(edge) * width * taper;
      const depth = Math.sin(edge) * 0.034;
      const radial = across * Math.cos(twist) - depth * Math.sin(twist);
      const axial = across * Math.sin(twist) + depth * Math.cos(twist);

      positions.push(
        (centerRadius + radial) * Math.cos(angle),
        (centerRadius + radial) * Math.sin(angle),
        axial,
      );
      uvs.push(segment / segments, side / sides);

      if (segment < segments && side < sides) {
        const a = segment * (sides + 1) + side;
        const b = a + sides + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  // UV coordinates need duplicate seam vertices; lighting should still see one
  // continuous surface. Average the corresponding normals on both closed axes.
  const normals = geometry.getAttribute("normal");
  const normal = new THREE.Vector3();
  const mergeNormals = (vertices: number[]) => {
    normal.set(0, 0, 0);
    for (const vertex of vertices) {
      normal.x += normals.getX(vertex);
      normal.y += normals.getY(vertex);
      normal.z += normals.getZ(vertex);
    }
    normal.normalize();
    for (const vertex of vertices) {
      normals.setXYZ(vertex, normal.x, normal.y, normal.z);
    }
  };
  const lastRow = segments * (sides + 1);
  mergeNormals([0, sides, lastRow, lastRow + sides]);
  for (let side = 1; side < sides; side += 1) {
    mergeNormals([side, lastRow + side]);
  }
  for (let segment = 1; segment < segments; segment += 1) {
    const row = segment * (sides + 1);
    mergeNormals([row, row + sides]);
  }
  normals.needsUpdate = true;
  geometry.computeBoundingSphere();
  return geometry;
}

/** Local studio softboxes give the metal reflections without external assets. */
function createStudioTexture() {
  const surface = document.createElement("canvas");
  surface.width = 1024;
  surface.height = 512;
  const context = surface.getContext("2d");
  if (!context)
    throw new Error("The sculpture environment could not initialize.");

  const backdrop = context.createLinearGradient(0, 0, 0, surface.height);
  backdrop.addColorStop(0, "#fefbf1");
  backdrop.addColorStop(0.38, "#dfddd4");
  backdrop.addColorStop(0.52, "#706e64");
  backdrop.addColorStop(0.66, "#b8b1a0");
  backdrop.addColorStop(1, "#f4eee0");
  context.fillStyle = backdrop;
  context.fillRect(0, 0, surface.width, surface.height);

  const panels = [
    { x: 120, y: 165, radius: 155, color: "255, 255, 253" },
    { x: 700, y: 215, radius: 135, color: "255, 252, 240" },
    { x: 970, y: 110, radius: 115, color: "255, 255, 255" },
  ];

  for (const panel of panels) {
    const light = context.createRadialGradient(
      panel.x,
      panel.y,
      0,
      panel.x,
      panel.y,
      panel.radius,
    );
    light.addColorStop(0, `rgba(${panel.color}, 1)`);
    light.addColorStop(0.6, `rgba(${panel.color}, 0.95)`);
    light.addColorStop(1, `rgba(${panel.color}, 0)`);
    context.fillStyle = light;
    context.fillRect(0, 0, surface.width, surface.height);
  }

  const texture = new THREE.CanvasTexture(surface);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * The caller owns the animation clock and visibility lifecycle. Rendering is
 * deterministic: progress 0 and 1 produce the same pose, with no internal RAF.
 */
export function createLearningSculpture(
  canvas: HTMLCanvasElement,
): LearningSculptureScene {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
  });
  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  let studioTexture: THREE.CanvasTexture | undefined;
  let environment: THREE.WebGLRenderTarget | undefined;
  let pmrem: THREE.PMREMGenerator | undefined;
  let key: THREE.DirectionalLight | undefined;
  let disposed = false;

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((material) => material.dispose());
    studioTexture?.dispose();
    environment?.dispose();
    pmrem?.dispose();
    key?.shadow.map?.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };

  try {
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -2.15,
      2.15,
      2.35,
      -2.35,
      0.1,
      30,
    );
    camera.position.set(0, 0.12, 9);
    camera.lookAt(0, 0, 0);

    studioTexture = createStudioTexture();
    pmrem = new THREE.PMREMGenerator(renderer);
    environment = pmrem.fromEquirectangular(studioTexture);
    scene.environment = environment.texture;
    studioTexture.dispose();
    studioTexture = undefined;
    pmrem.dispose();
    pmrem = undefined;

    scene.add(new THREE.HemisphereLight(0xfffcf1, 0x9d8a64, 1.65));
    key = new THREE.DirectionalLight(0xfff7df, 3.3);
    key.position.set(-3, 5, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(512, 512);
    key.shadow.camera.left = -2.2;
    key.shadow.camera.right = 2.2;
    key.shadow.camera.top = 2.2;
    key.shadow.camera.bottom = -2.2;
    key.shadow.camera.near = 0.5;
    key.shadow.camera.far = 16;
    key.shadow.normalBias = 0.035;
    scene.add(key);

    const fill = new THREE.DirectionalLight(0xffffff, 1.65);
    fill.position.set(4, 0, 5);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffdc9b, 2.8);
    rim.position.set(1, 3, -4);
    scene.add(rim);

    const sculpture = new THREE.Group();
    scene.add(sculpture);

    const bands = [
      { radius: 1.52, width: 0.14, color: 0xcaa260 },
      { radius: 1.2, width: 0.115, color: 0xb98d42 },
      { radius: 0.89, width: 0.09, color: 0xd5b577 },
    ].map(({ radius, width, color }, index) => {
      const geometry = createBandGeometry(radius, width, index * 1.7);
      geometries.push(geometry);
      const material = new THREE.MeshPhysicalMaterial({
        color,
        metalness: 0.96,
        roughness: 0.24,
        clearcoat: 0.35,
        clearcoatRoughness: 0.2,
        envMapIntensity: 1.6,
        anisotropy: 0.35,
      });
      materials.push(material);
      const mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      sculpture.add(mesh);
      return mesh;
    });

    const coreGeometry = new THREE.SphereGeometry(0.285, 48, 32);
    geometries.push(coreGeometry);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfff5d7,
      metalness: 0.17,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.06,
      iridescence: 0.12,
      iridescenceIOR: 1.25,
      iridescenceThicknessRange: [90, 160],
      envMapIntensity: 1.8,
      emissive: 0xe8ba64,
      emissiveIntensity: 0.13,
    });
    materials.push(coreMaterial);
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    core.receiveShadow = true;
    sculpture.add(core);

    let lastWidth = 0;
    let lastHeight = 0;
    let lastPixelRatio = 0;
    let lastProgress = 0;

    const render = (progress: number) => {
      if (disposed) return;
      lastProgress = Number.isFinite(progress) ? progress : 0;
      const phase = (((lastProgress % 1) + 1) % 1) * TAU;
      sculpture.rotation.set(
        0.12 + Math.sin(phase) * 0.14,
        phase,
        -0.23 + Math.sin(phase) * 0.1,
      );
      sculpture.position.y = 0.025 + Math.sin(phase) * 0.045;
      bands[0].rotation.set(
        0.65 + Math.sin(phase) * 0.14,
        -0.4 + Math.cos(phase) * 0.12,
        0.26,
      );
      bands[1].rotation.set(
        -0.78 + Math.cos(phase) * 0.16,
        0.75 + Math.sin(phase) * 0.22,
        -0.45 + Math.sin(phase) * 0.1,
      );
      bands[2].rotation.set(
        1.1 + Math.sin(phase) * 0.18,
        -0.65 + Math.cos(phase) * 0.18,
        0.65,
      );
      core.scale.setScalar(1 + Math.sin(phase) * 0.035);
      renderer.render(scene, camera);
    };

    const resize = (width: number, height: number) => {
      if (disposed || !Number.isFinite(width) || !Number.isFinite(height))
        return;
      const nextWidth = Math.max(1, Math.round(width));
      const nextHeight = Math.max(1, Math.round(height));
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      if (
        lastWidth === nextWidth &&
        lastHeight === nextHeight &&
        lastPixelRatio === pixelRatio
      ) {
        return;
      }
      lastWidth = nextWidth;
      lastHeight = nextHeight;
      lastPixelRatio = pixelRatio;
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(nextWidth, nextHeight, false);
      const aspect = nextWidth / nextHeight;
      const halfWidth = Math.max(2.02, 2.22 * aspect);
      const halfHeight = halfWidth / aspect;
      camera.left = -halfWidth;
      camera.right = halfWidth;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      render(lastProgress);
    };

    return { render, resize, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
