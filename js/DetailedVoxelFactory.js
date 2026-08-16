import * as THREE from 'three';
import { TextureFactory } from './TextureFactory.js';
import { VoxelMesher } from './VoxelMesher.js';

export class DetailedVoxelFactory {
    // === 3D APPLE MODEL ===
    static createDetailedApple() {
        const voxels = [];
        const colorRed = 0xFF3333;
        const colorStem = 0x5C3A21;
        const colorLeaf = 0x4A8A2F;

        for (let x = -3; x <= 3; x++) {
            for (let y = -3; y <= 3; y++) {
                for (let z = -3; z <= 3; z++) {
                    if (x*x + y*y + z*z <= 12) {
                        voxels.push({ x, y: y + 3, z, color: colorRed });
                    }
                }
            }
        }
        voxels.push({ x: 0, y: 7, z: 0, color: colorStem });
        voxels.push({ x: 0, y: 8, z: 0, color: colorStem });
        voxels.push({ x: 1, y: 7, z: 0, color: colorLeaf });
        voxels.push({ x: 2, y: 7, z: 0, color: colorLeaf });

        const mesh = VoxelMesher.build(voxels, 0.1, { roughness: 0.2, metalness: 0.1 });
        mesh.position.y = 0.05; // Slightly lift above ground

        const group = new THREE.Group();
        group.add(mesh);
        return group;
    }

    // === 3D GOLDEN APPLE MODEL ===
    static createDetailedGoldenApple() {
        const voxels = [];
        const colorGold = 0xFFD700;
        const colorStem = 0x5C3A21;
        const colorLeaf = 0x4A8A2F;

        for (let x = -3; x <= 3; x++) {
            for (let y = -3; y <= 3; y++) {
                for (let z = -3; z <= 3; z++) {
                    if (x*x + y*y + z*z <= 12) {
                        voxels.push({ x, y: y + 3, z, color: colorGold });
                    }
                }
            }
        }
        voxels.push({ x: 0, y: 7, z: 0, color: colorStem });
        voxels.push({ x: 0, y: 8, z: 0, color: colorStem });
        voxels.push({ x: 1, y: 7, z: 0, color: colorLeaf });
        voxels.push({ x: 2, y: 7, z: 0, color: colorLeaf });

        const mesh = VoxelMesher.build(voxels, 0.1, { roughness: 0.1, metalness: 0.8 });
        mesh.position.y = 0.05;

        const group = new THREE.Group();
        group.add(mesh);

        const sparkles = [];
        const sparkleGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        const sparkleMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 2.0 });
        for (let i = 0; i < 4; i++) {
            const sp = new THREE.Mesh(sparkleGeo, sparkleMat);
            group.add(sp);
            sparkles.push(sp);
        }

        group.userData = { sparkles };
        return group;
    }

    // === 3D MUSHROOM MODEL ===
    static createDetailedMushroom() {
        const voxels = [];
        const colorStem = 0xF5E6CC;
        const colorCap = 0xE74C3C;
        const colorSpot = 0xFFFFFF;

        // Stem
        for (let x = -1; x <= 1; x++) {
            for (let y = 0; y <= 3; y++) {
                for (let z = -1; z <= 1; z++) {
                    if (x*x + z*z <= 2) {
                        voxels.push({ x, y, z, color: colorStem });
                    }
                }
            }
        }
        // Cap
        for (let x = -4; x <= 4; x++) {
            for (let y = 4; y <= 6; y++) {
                for (let z = -4; z <= 4; z++) {
                    if (x*x + z*z <= 16 && (y < 6 || x*x + z*z <= 8)) {
                        let isSpot = false;
                        if (y === 6 && (Math.abs(x) === 1 && Math.abs(z) === 1)) isSpot = true;
                        if (y === 5 && (Math.abs(x) === 3 && Math.abs(z) === 0)) isSpot = true;
                        if (y === 5 && (Math.abs(x) === 0 && Math.abs(z) === 3)) isSpot = true;
                        
                        voxels.push({ x, y, z, color: isSpot ? colorSpot : colorCap });
                    }
                }
            }
        }

        const mesh = VoxelMesher.build(voxels, 0.1, { roughness: 0.9, metalness: 0 });
        const group = new THREE.Group();
        group.add(mesh);
        return group;
    }

    // === 3D DIAMOND CRYSTAL MODEL ===
    static createDetailedDiamond() {
        const voxels = [];
        const colorDiamond = 0x00FFFF;

        for (let x = -3; x <= 3; x++) {
            for (let y = -4; y <= 4; y++) {
                for (let z = -3; z <= 3; z++) {
                    if (Math.abs(x) + Math.abs(y/1.5) + Math.abs(z) <= 3) {
                        voxels.push({ x, y: y + 4, z, color: colorDiamond });
                    }
                }
            }
        }

        const mesh = VoxelMesher.build(voxels, 0.1, { 
            roughness: 0.1, 
            metalness: 0.7, 
            emissive: 0x008888, 
            emissiveIntensity: 0.5 
        });
        mesh.position.y = 0.4;
        
        const group = new THREE.Group();
        group.add(mesh);

        const frameGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const glowMat = new THREE.MeshStandardMaterial({ color: 0x70FFFF, emissive: 0x70FFFF, emissiveIntensity: 2.0, transparent: true, opacity: 0.8 });
        const frameSubCubes = [];
        const offsets = [
            [-0.45, 0.45, 0], [0.45, 0.45, 0], [0, 0.45, -0.45], [0, 0.45, 0.45]
        ];
        offsets.forEach(([fx, fy, fz]) => {
            const sub = new THREE.Mesh(frameGeo, glowMat);
            sub.position.set(fx, fy, fz);
            group.add(sub);
            frameSubCubes.push(sub);
        });

        group.userData = { core: mesh, frameSubCubes };
        return group;
    }

    // === 3D GRASS TUFTS & FLOWERS ===
    static createGrassTuft() {
        const group = new THREE.Group();
        const grassMat = new THREE.MeshLambertMaterial({ color: 0x5B8C31 });
        const bladeGeo = new THREE.BoxGeometry(0.08, 0.35, 0.08);

        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const blade = new THREE.Mesh(bladeGeo, grassMat);
            blade.position.set(
                (Math.random() - 0.5) * 0.3,
                0.175,
                (Math.random() - 0.5) * 0.3
            );
            blade.rotation.y = Math.random() * Math.PI;
            blade.rotation.z = (Math.random() - 0.5) * 0.3;
            group.add(blade);
        }
        return group;
    }

    static createFlower(type = 'red') {
        const group = new THREE.Group();
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x3D6920 });
        const centerMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });

        // Stem
        const stem = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), stemMat);
        stem.position.y = 0.175;
        group.add(stem);

        // Center
        const center = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.12), centerMat);
        center.position.y = 0.38;
        group.add(center);

        const petalGeo = new THREE.BoxGeometry(0.12, 0.05, 0.12);
        const redMat = new THREE.MeshLambertMaterial({ color: 0xFF2222 });
        const yellowMat = new THREE.MeshLambertMaterial({ color: 0xFFDD00 });
        const petalMat = type === 'red' ? redMat : yellowMat;
        
        const offsets = [[-0.08, 0, 0], [0.08, 0, 0], [0, 0, -0.08], [0, 0, 0.08]];
        offsets.forEach(([px, py, pz]) => {
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.position.set(px, 0.45, pz);
            group.add(petal);
        });

        return group;
    }

    // === OBSTACLES ===
    static createCrateObstacle() {
        const group = new THREE.Group();
        const woodTex = TextureFactory.wood();
        const woodMat = new THREE.MeshLambertMaterial({ map: woodTex, color: 0x8b5a2b });
        const ironMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
        
        // Main Box
        const boxGeom = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        const box = new THREE.Mesh(boxGeom, woodMat);
        box.position.y = 0.9;
        box.castShadow = true;
        box.receiveShadow = true;
        group.add(box);
        
        // Iron Bands (Sub-voxels)
        const bandGeom = new THREE.BoxGeometry(1.82, 0.15, 1.82);
        for(let i=0; i<3; i++) {
            const band = new THREE.Mesh(bandGeom, ironMat);
            band.position.y = 0.2 + (i * 0.7);
            group.add(band);
        }
        
        return group;
    }

    static createStonePillar() {
        const group = new THREE.Group();
        const stoneTex = TextureFactory.stone();
        const stoneMat = new THREE.MeshLambertMaterial({ map: stoneTex, color: 0x888888 });
        const mossMat = new THREE.MeshLambertMaterial({ color: 0x3D6920 });
        
        const heightBlocks = 3 + Math.floor(Math.random() * 3);
        const blockGeom = new THREE.BoxGeometry(1.8, 1.8, 1.8);
        
        for (let i = 0; i < heightBlocks; i++) {
            const block = new THREE.Mesh(blockGeom, stoneMat);
            block.position.set((Math.random()-0.5)*0.1, 0.9 + i * 1.8, (Math.random()-0.5)*0.1);
            block.rotation.y = (Math.random()-0.5) * 0.1;
            block.castShadow = true;
            block.receiveShadow = true;
            group.add(block);
            
            // Random moss
            if(Math.random() > 0.6) {
                const moss = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.3, 1.85), mossMat);
                moss.position.copy(block.position);
                moss.position.y -= 0.6;
                group.add(moss);
            }
        }
        return group;
    }

    static createSpikeTrap() {
        const group = new THREE.Group();
        const stoneTex = TextureFactory.stone();
        const stoneMat = new THREE.MeshLambertMaterial({ map: stoneTex, color: 0x555555 });
        const lavaTex = TextureFactory.lava();
        const lavaMat = new THREE.MeshBasicMaterial({ map: lavaTex, color: 0xff6600 });
        const spikeMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.8, roughness: 0.2 });
        
        // Base structure (long moat)
        const base = new THREE.Mesh(new THREE.BoxGeometry(8, 0.4, 2), stoneMat);
        base.position.y = 0.2;
        base.receiveShadow = true;
        group.add(base);
        
        // Lava strip
        const lava = new THREE.Mesh(new THREE.BoxGeometry(7.6, 0.45, 1.6), lavaMat);
        lava.position.y = 0.2;
        group.add(lava);
        
        // Spikes
        const numSpikes = 6;
        for (let i = 0; i < numSpikes; i++) {
            // Build spike from small stacked blocks to keep voxel style
            const spikeGroup = new THREE.Group();
            for(let level=0; level<4; level++) {
                const s = 0.5 - (level * 0.1);
                const block = new THREE.Mesh(new THREE.BoxGeometry(s, 0.4, s), spikeMat);
                block.position.y = 0.4 + (level * 0.4);
                block.castShadow = true;
                spikeGroup.add(block);
            }
            spikeGroup.position.set(-3 + i*1.2, 0, 0);
            group.add(spikeGroup);
        }
        
        return group;
    }
}
