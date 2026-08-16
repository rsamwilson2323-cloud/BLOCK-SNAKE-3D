import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';
import { TextureFactory } from './TextureFactory.js';
import { DayNightCycle } from './DayNightCycle.js';
import { VoxelCloudSystem } from './VoxelCloudSystem.js';
import { FirefliesSystem } from './FirefliesSystem.js';
import { AmbientDustSystem } from './AmbientDustSystem.js';

export class Engine {
    constructor(container) {
        this.container = container;
        this.wallBlocks = [];
        this.quality = 'ULTRA';

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x4FA9E8);
        this.scene.fog = new THREE.Fog(0x4FA9E8, 48, 168);

        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            stencil: false
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.12;
        this.container.appendChild(this.renderer.domElement);

        this.camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.4, 280);

        this.setupLighting();
        this.setupSky();
        this.dayNightCycle = new DayNightCycle(this.scene, this.sunLight, this.fillLight, {
            hemiLight: this.hemiLight,
            ambientLight: this.ambientLight,
            skyMat: this.skyMat,
            sunMesh: this.sunMesh,
            moonMesh: this.moonMesh
        });

        this.fireflies = new FirefliesSystem(this.scene);
        this.setupEnvironment();
        this.voxelClouds = new VoxelCloudSystem(this.scene);
        this.ambientDust = new AmbientDustSystem(this.scene);
        this.setupSpeedStreaks();
        this.setupEnvironmentMap();
        this.setupComposer();

        const preferMed = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900;
        this.setQuality(preferMed ? 'MED' : 'ULTRA');

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    setupLighting() {
        this.hemiLight = new THREE.HemisphereLight(0x9ecfff, 0x3d5a28, 0.62);
        this.scene.add(this.hemiLight);

        this.ambientLight = new THREE.AmbientLight(0xE8DCC8, 0.22);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xFFF0D4, 1.7);
        this.sunLight.position.set(45, 65, 25);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.set(1024, 1024);
        this.sunLight.shadow.camera.near = 4;
        this.sunLight.shadow.camera.far = 170;
        this.sunLight.shadow.camera.left = -42;
        this.sunLight.shadow.camera.right = 42;
        this.sunLight.shadow.camera.top = 42;
        this.sunLight.shadow.camera.bottom = -42;
        this.sunLight.shadow.bias = -0.00035;
        this.sunLight.shadow.normalBias = 0.04;
        this.sunLight.shadow.radius = 2.2;
        this.scene.add(this.sunLight);
        this.scene.add(this.sunLight.target);

        this.fillLight = new THREE.DirectionalLight(0x8FBBF0, 0.28);
        this.fillLight.position.set(-40, 30, -20);
        this.scene.add(this.fillLight);
    }

    setupSky() {
        const skyGeo = new THREE.SphereGeometry(220, 24, 16);
        this.skyMat = new THREE.ShaderMaterial({
            uniforms: {
                topColor: { value: new THREE.Color(0x2E86C1) },
                horizonColor: { value: new THREE.Color(0xAED6F1) },
                bottomColor: { value: new THREE.Color(0xF5CBA7) },
                offset: { value: 12.0 },
                exponent: { value: 0.55 }
            },
            vertexShader: `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 topColor;
                uniform vec3 horizonColor;
                uniform vec3 bottomColor;
                uniform float offset;
                uniform float exponent;
                varying vec3 vWorldPosition;
                void main() {
                    float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
                    float t = max(pow(max(h, 0.0), exponent), 0.0);
                    vec3 col = mix(horizonColor, topColor, t);
                    col = mix(bottomColor, col, smoothstep(-0.15, 0.12, h));
                    gl_FragColor = vec4(col, 1.0);
                }
            `,
            side: THREE.BackSide,
            depthWrite: false,
            fog: false
        });
        this.skyDome = new THREE.Mesh(skyGeo, this.skyMat);
        this.skyDome.frustumCulled = false;
        this.scene.add(this.skyDome);

        this.sunMesh = new THREE.Mesh(
            new THREE.SphereGeometry(7.5, 16, 12),
            new THREE.MeshBasicMaterial({ color: 0xFFE7A8, fog: false, toneMapped: false })
        );
        this.scene.add(this.sunMesh);

        this.moonMesh = new THREE.Mesh(
            new THREE.SphereGeometry(5.2, 12, 10),
            new THREE.MeshBasicMaterial({ color: 0xD6E6FF, fog: false, toneMapped: false })
        );
        this.scene.add(this.moonMesh);

        const glowGeo = new THREE.SphereGeometry(14, 12, 8);
        this.sunGlow = new THREE.Mesh(
            glowGeo,
            new THREE.MeshBasicMaterial({
                color: 0xFFD27A,
                transparent: true,
                opacity: 0.18,
                fog: false,
                toneMapped: false,
                depthWrite: false
            })
        );
        this.scene.add(this.sunGlow);
    }

    setupEnvironmentMap() {
        this.envData = new Uint8Array(8 * 8 * 4);
        this.envTexture = new THREE.DataTexture(this.envData, 8, 8, THREE.RGBAFormat);
        this.envTexture.colorSpace = THREE.SRGBColorSpace;
        this.envTexture.mapping = THREE.EquirectangularReflectionMapping;
        this.envTexture.needsUpdate = true;
        this.scene.environment = this.envTexture;
        this.scene.environmentIntensity = 0.55;
    }

    setupComposer() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(new RenderPass(this.scene, this.camera));

        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(width, height), 0.28, 0.55, 0.78);
        this.composer.addPass(this.bloomPass);

        this.composer.addPass(new OutputPass());

        this.fxaaPass = new ShaderPass(FXAAShader);
        this.fxaaPass.material.uniforms.resolution.value.set(1 / width, 1 / height);
        this.composer.addPass(this.fxaaPass);
    }

    setupSpeedStreaks() {
        this.speedStreakGroup = new THREE.Group();
        this.speedStreaks = [];
        const lineGeo = new THREE.BoxGeometry(0.06, 0.06, 4.2);
        const lineMat = new THREE.MeshBasicMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.55,
            toneMapped: false
        });

        for (let i = 0; i < 28; i++) {
            const streak = new THREE.Mesh(lineGeo, lineMat);
            streak.position.set((Math.random() - 0.5) * 26, (Math.random() - 0.5) * 16, (Math.random() - 0.5) * 36);
            this.speedStreakGroup.add(streak);
            this.speedStreaks.push({ mesh: streak, speed: 48 + Math.random() * 28 });
        }
        this.speedStreakGroup.visible = false;
        this.scene.add(this.speedStreakGroup);
    }

    setupEnvironment() {
        const borderGeo = new THREE.PlaneGeometry(170, 170);
        const borderMat = new THREE.MeshLambertMaterial({ color: 0x2A1C12 });
        const borderPlane = new THREE.Mesh(borderGeo, borderMat);
        borderPlane.rotation.x = -Math.PI / 2;
        borderPlane.position.y = -0.08;
        borderPlane.receiveShadow = true;
        borderPlane.matrixAutoUpdate = false;
        borderPlane.updateMatrix();
        this.scene.add(borderPlane);

        const floorGeo = new THREE.PlaneGeometry(156, 156, 1, 1);
        const grassTex = TextureFactory.grassTop();
        grassTex.wrapS = THREE.RepeatWrapping;
        grassTex.wrapT = THREE.RepeatWrapping;
        grassTex.repeat.set(64, 64);
        this.floorMat = new THREE.MeshStandardMaterial({
            map: grassTex,
            roughness: 0.92,
            metalness: 0.02,
            envMapIntensity: 0.2
        });
        const floor = new THREE.Mesh(floorGeo, this.floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.matrixAutoUpdate = false;
        floor.updateMatrix();
        this.scene.add(floor);

        this.buildInstancedGroundDetails();
        this.buildWalls();
        this.buildTrees();
        this.buildHills();
    }

    buildInstancedGroundDetails() {
        const dummy = new THREE.Object3D();

        const bladeGeo = new THREE.BoxGeometry(0.07, 0.42, 0.07);
        const grassMat = new THREE.MeshLambertMaterial({ color: 0x5B8C31 });
        const numTufts = 90;
        const bladesPerTuft = 4;
        const tuftMesh = new THREE.InstancedMesh(bladeGeo, grassMat, numTufts * bladesPerTuft);
        tuftMesh.castShadow = false;
        let bIdx = 0;
        for (let i = 0; i < numTufts; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 6 + Math.random() * 68;
            const tx = Math.cos(angle) * dist;
            const tz = Math.sin(angle) * dist;
            for (let b = 0; b < bladesPerTuft; b++) {
                dummy.position.set(tx + (Math.random() - 0.5) * 0.32, 0.21, tz + (Math.random() - 0.5) * 0.32);
                dummy.rotation.set((Math.random() - 0.5) * 0.25, Math.random() * Math.PI, (Math.random() - 0.5) * 0.35);
                dummy.updateMatrix();
                tuftMesh.setMatrixAt(bIdx++, dummy.matrix);
            }
        }
        tuftMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(tuftMesh);

        const stemGeo = new THREE.BoxGeometry(0.06, 0.38, 0.06);
        const petalGeo = new THREE.BoxGeometry(0.11, 0.11, 0.11);
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x3D6920 });
        const redPetalMat = new THREE.MeshLambertMaterial({ color: 0xE74C3C });
        const yellowPetalMat = new THREE.MeshLambertMaterial({ color: 0xF4D03F });
        const numFlowers = 42;
        const stemMesh = new THREE.InstancedMesh(stemGeo, stemMat, numFlowers);
        const redPetalMesh = new THREE.InstancedMesh(petalGeo, redPetalMat, numFlowers * 4);
        const yellowPetalMesh = new THREE.InstancedMesh(petalGeo, yellowPetalMat, numFlowers * 4);
        let redPIdx = 0;
        let yellowPIdx = 0;
        for (let i = 0; i < numFlowers; i++) {
            const isRed = Math.random() < 0.5;
            const angle = Math.random() * Math.PI * 2;
            const dist = 8 + Math.random() * 64;
            const fx = Math.cos(angle) * dist;
            const fz = Math.sin(angle) * dist;
            dummy.position.set(fx, 0.19, fz);
            dummy.rotation.set(0, 0, 0);
            dummy.updateMatrix();
            stemMesh.setMatrixAt(i, dummy.matrix);
            const offsets = [[-0.1, 0.4, 0], [0.1, 0.4, 0], [0, 0.4, -0.1], [0, 0.4, 0.1]];
            offsets.forEach(([px, py, pz]) => {
                dummy.position.set(fx + px, py, fz + pz);
                dummy.updateMatrix();
                if (isRed) redPetalMesh.setMatrixAt(redPIdx++, dummy.matrix);
                else yellowPetalMesh.setMatrixAt(yellowPIdx++, dummy.matrix);
            });
        }
        stemMesh.instanceMatrix.needsUpdate = true;
        redPetalMesh.instanceMatrix.needsUpdate = true;
        yellowPetalMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(stemMesh, redPetalMesh, yellowPetalMesh);

        const pebbleGeo = new THREE.BoxGeometry(0.14, 0.09, 0.14);
        const pebbleMat = new THREE.MeshStandardMaterial({ color: 0x8A8A88, roughness: 0.95, metalness: 0.08 });
        const pebbleMesh = new THREE.InstancedMesh(pebbleGeo, pebbleMat, 180);
        pebbleMesh.receiveShadow = true;
        for (let i = 0; i < 180; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 72;
            dummy.position.set(Math.cos(angle) * dist, 0.045, Math.sin(angle) * dist);
            dummy.rotation.set(0, Math.random() * Math.PI, 0);
            const scale = 0.45 + Math.random() * 0.9;
            dummy.scale.set(scale, scale * 0.7, scale);
            dummy.updateMatrix();
            pebbleMesh.setMatrixAt(i, dummy.matrix);
        }
        pebbleMesh.instanceMatrix.needsUpdate = true;
        this.scene.add(pebbleMesh);
    }

    buildWalls() {
        const radius = 78;
        const stoneTex = TextureFactory.stone();
        const stoneMat = new THREE.MeshStandardMaterial({
            map: stoneTex,
            roughness: 0.88,
            metalness: 0.06,
            envMapIntensity: 0.25
        });
        const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
        const positions = [];
        for (let i = -radius; i <= radius; i += 2) {
            positions.push([i, 1, radius], [i, 3, radius], [i, 1, -radius], [i, 3, -radius]);
            if (i > -radius && i < radius) {
                positions.push([radius, 1, i], [radius, 3, i], [-radius, 1, i], [-radius, 3, i]);
            }
        }
        [[-radius, radius], [radius, radius], [-radius, -radius], [radius, -radius]].forEach(([cx, cz]) => {
            positions.push([cx, 5, cz], [cx, 7, cz]);
        });

        const wallMesh = new THREE.InstancedMesh(cubeGeo, stoneMat, positions.length);
        wallMesh.castShadow = true;
        wallMesh.receiveShadow = true;
        const dummy = new THREE.Object3D();
        const color = new THREE.Color();
        wallMesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(positions.length * 3), 3);
        positions.forEach(([x, y, z], idx) => {
            dummy.position.set(x, y, z);
            dummy.updateMatrix();
            wallMesh.setMatrixAt(idx, dummy.matrix);
            const shade = 0.82 + Math.random() * 0.22;
            color.setRGB(shade, shade, shade * 0.98);
            wallMesh.setColorAt(idx, color);
            this.wallBlocks.push(new THREE.Vector3(x, y, z));
        });
        wallMesh.instanceMatrix.needsUpdate = true;
        if (wallMesh.instanceColor) wallMesh.instanceColor.needsUpdate = true;
        this.scene.add(wallMesh);
    }

    buildTrees() {
        const woodTex = TextureFactory.wood();
        const leavesTex = TextureFactory.leaves();
        const woodMat = new THREE.MeshLambertMaterial({ map: woodTex });
        const leavesMat = new THREE.MeshLambertMaterial({ map: leavesTex });
        const birchBarkMat = new THREE.MeshLambertMaterial({ color: 0xEEEEEE });
        const birchLeavesMat = new THREE.MeshLambertMaterial({ map: leavesTex, color: 0x99FF66 });
        const trunkGeo = new THREE.BoxGeometry(1.5, 2, 1.5);
        const leafGeo = new THREE.BoxGeometry(2, 2, 2);

        const oakTrunks = [];
        const birchTrunks = [];
        const oakLeaves = [];
        const birchLeaves = [];
        const numTrees = 22;

        for (let i = 0; i < numTrees; i++) {
            const isBirch = Math.random() < 0.32;
            const angle = (i / numTrees) * Math.PI * 2 + (Math.random() - 0.5) * 0.35;
            const dist = 86 + Math.random() * 22;
            const tx = Math.cos(angle) * dist;
            const tz = Math.sin(angle) * dist;
            const trunkHeight = 3 + Math.floor(Math.random() * 2);
            const trunkArr = isBirch ? birchTrunks : oakTrunks;
            const leafArr = isBirch ? birchLeaves : oakLeaves;
            for (let j = 0; j < trunkHeight; j++) trunkArr.push([tx, 1 + j * 2, tz]);
            const leafBaseY = 1 + trunkHeight * 2;
            for (let lx = -2; lx <= 2; lx += 2) {
                for (let lz = -2; lz <= 2; lz += 2) {
                    if (Math.abs(lx) === 2 && Math.abs(lz) === 2 && Math.random() < 0.4) continue;
                    leafArr.push([tx + lx, leafBaseY, tz + lz]);
                }
            }
            for (let lx = -1; lx <= 1; lx += 2) {
                for (let lz = -1; lz <= 1; lz += 2) {
                    leafArr.push([tx + lx, leafBaseY + 2, tz + lz]);
                }
            }
        }

        const addInstanced = (geo, mat, list, shadows = true) => {
            if (!list.length) return;
            const mesh = new THREE.InstancedMesh(geo, mat, list.length);
            mesh.castShadow = shadows;
            mesh.receiveShadow = shadows;
            const dummy = new THREE.Object3D();
            list.forEach(([x, y, z], i) => {
                dummy.position.set(x, y, z);
                dummy.updateMatrix();
                mesh.setMatrixAt(i, dummy.matrix);
            });
            mesh.instanceMatrix.needsUpdate = true;
            mesh.matrixAutoUpdate = false;
            mesh.updateMatrix();
            this.scene.add(mesh);
        };

        addInstanced(trunkGeo, woodMat, oakTrunks);
        addInstanced(trunkGeo, birchBarkMat, birchTrunks);
        addInstanced(leafGeo, leavesMat, oakLeaves);
        addInstanced(leafGeo, birchLeavesMat, birchLeaves);
    }

    buildHills() {
        const hillGeo = new THREE.BoxGeometry(22, 1, 22);
        const hillMat = new THREE.MeshLambertMaterial({ color: 0x2A4A34 });
        const count = 16;
        const hills = new THREE.InstancedMesh(hillGeo, hillMat, count);
        const dummy = new THREE.Object3D();
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const dist = 124 + (i % 3) * 6;
            const h = 9 + (i % 5) * 3.2;
            dummy.position.set(Math.cos(angle) * dist, h * 0.5 - 1.2, Math.sin(angle) * dist);
            dummy.scale.set(1.1 + (i % 4) * 0.15, h, 1.1 + ((i + 2) % 4) * 0.15);
            dummy.rotation.y = angle;
            dummy.updateMatrix();
            hills.setMatrixAt(i, dummy.matrix);
        }
        hills.instanceMatrix.needsUpdate = true;
        hills.castShadow = false;
        hills.receiveShadow = false;
        this.scene.add(hills);
    }

    setQuality(level) {
        this.quality = level;
        const width = window.innerWidth;
        const height = window.innerHeight;
        let dpr = 1;
        let shadowSize = 512;
        let shadows = true;
        let bloom = 0.18;
        let bloomOn = true;
        let exposure = 1.08;

        if (level === 'LOW') {
            dpr = 1;
            shadows = false;
            bloomOn = false;
            bloom = 0;
            exposure = 1.05;
        } else if (level === 'MED') {
            dpr = Math.min(window.devicePixelRatio || 1, 1.25);
            shadowSize = 1024;
            bloom = 0.22;
            exposure = 1.1;
        } else {
            dpr = Math.min(window.devicePixelRatio || 1, 1.6);
            shadowSize = 2048;
            bloom = 0.32;
            exposure = 1.14;
        }

        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(width, height);
        this.renderer.shadowMap.enabled = shadows;
        this.renderer.toneMappingExposure = exposure;
        this.sunLight.castShadow = shadows;
        if (shadows) this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);

        if (this.bloomPass) {
            this.bloomPass.enabled = bloomOn;
            this.bloomPass.strength = bloom;
        }
        if (this.composer) {
            this.composer.setPixelRatio(dpr);
            this.composer.setSize(width, height);
        }
        if (this.fxaaPass) {
            this.fxaaPass.material.uniforms.resolution.value.set(1 / (width * dpr), 1 / (height * dpr));
        }
        if (this.fireflies) {
            this.fireflies.setEnabled(level !== 'LOW');
            this.fireflies.setLightCount(level === 'ULTRA' ? 5 : level === 'MED' ? 3 : 0);
        }
        this._envFrame = 0;
        this._cloudFrame = 0;
        window.GLOW_ENABLED = bloomOn;
    }

    setBloom(enabled) {
        if (this.bloomPass) this.bloomPass.enabled = enabled && this.quality !== 'LOW';
        window.GLOW_ENABLED = !!enabled;
    }

    update(time, delta, isBoosting = false) {
        if (this.skyDome && this.camera) {
            this.skyDome.position.copy(this.camera.position);
        }
        if (this.sunGlow && this.sunMesh) {
            this.sunGlow.position.copy(this.sunMesh.position);
            this.sunGlow.visible = this.sunMesh.visible;
        }
        if (this.voxelClouds?.lowInstancedMesh && this.dayNightCycle) {
            const c = this.dayNightCycle.currentSkyColor;
            this.voxelClouds.lowInstancedMesh.material.color.setRGB(
                Math.min(1, c.r * 0.35 + 0.72),
                Math.min(1, c.g * 0.35 + 0.74),
                Math.min(1, c.b * 0.35 + 0.78)
            );
        }

        if (this.dayNightCycle) {
            const camPos = this.camera ? this.camera.position : null;
            this.dayNightCycle.update(delta, camPos);
            if (this.quality === 'LOW') this.sunLight.castShadow = false;

            const night = this.dayNightCycle.nightAmount || 0;
            if (this.bloomPass && this.bloomPass.enabled) {
                const base = this.quality === 'ULTRA' ? 0.32 : 0.22;
                this.bloomPass.strength = base + night * 0.18;
            }
            this.renderer.toneMappingExposure = (this.quality === 'LOW' ? 1.05 : 1.1) + night * 0.08;

            this._envFrame = (this._envFrame || 0) + 1;
            if (this.envTexture && this.envData && this._envFrame % 4 === 0) {
                const c = this.dayNightCycle.currentSkyColor;
                const r = Math.floor(c.r * 255);
                const g = Math.floor(c.g * 255);
                const b = Math.floor(c.b * 255);
                for (let i = 0; i < this.envData.length; i += 4) {
                    const band = (i / 4) < 32 ? 1.15 : 0.75;
                    this.envData[i] = Math.min(255, r * band);
                    this.envData[i + 1] = Math.min(255, g * band);
                    this.envData[i + 2] = Math.min(255, b * band);
                    this.envData[i + 3] = 255;
                }
                this.envTexture.needsUpdate = true;
            }
        }

        this._cloudFrame = (this._cloudFrame || 0) + 1;
        if (this.voxelClouds && this._cloudFrame % 2 === 0) this.voxelClouds.update(delta * 2);

        if (this.fireflies && this.dayNightCycle) {
            this.fireflies.update(delta, this.dayNightCycle.timeOfDay, this.camera.position);
        }
        if (this.ambientDust) this.ambientDust.update(delta, this.camera.position);

        if (this.speedStreakGroup && this.camera) {
            this.speedStreakGroup.visible = isBoosting;
            if (isBoosting) {
                this.speedStreakGroup.position.copy(this.camera.position);
                this.speedStreakGroup.rotation.copy(this.camera.rotation);
                for (const streak of this.speedStreaks) {
                    streak.mesh.position.z += streak.speed * delta;
                    if (streak.mesh.position.z > 20) {
                        streak.mesh.position.z = -30 - Math.random() * 20;
                        streak.mesh.position.x = (Math.random() - 0.5) * 30;
                        streak.mesh.position.y = (Math.random() - 0.5) * 16;
                    }
                }
            }
        }
    }

    render() {
        this.composer.render();
    }

    onWindowResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.setQuality(this.quality);
    }
}
