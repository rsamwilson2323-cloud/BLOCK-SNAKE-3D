import * as THREE from 'three';

export class VoxelCloudSystem {
    constructor(scene) {
        this.scene = scene;
        this.clouds = [];
        this.buildInstancedClouds();
    }

    buildInstancedClouds() {
        const cloudMatLow = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            transparent: true,
            opacity: 0.85
        });

        const cloudMatHigh = new THREE.MeshLambertMaterial({
            color: 0xEEF5FF,
            transparent: true,
            opacity: 0.50
        });

        const cubeGeo = new THREE.BoxGeometry(2, 2, 2);
        const flatGeo = new THREE.BoxGeometry(4, 1, 3);

        // Low Clouds
        const numLowClusters = 12;
        const lowClusterBlocks = [];
        for (let i = 0; i < numLowClusters; i++) {
            const numBlocks = 6;
            const cx = (Math.random() - 0.5) * 280;
            const cy = 42 + Math.random() * 8;
            const cz = (Math.random() - 0.5) * 280;
            const speed = 2.0 + Math.random() * 1.5;

            const blockOffsets = [];
            for (let b = 0; b < numBlocks; b++) {
                blockOffsets.push([
                    Math.floor((Math.random() - 0.5) * 4) * 2,
                    Math.floor(Math.random() * 2) * 1.5,
                    Math.floor((Math.random() - 0.5) * 4) * 2
                ]);
            }
            this.clouds.push({ x: cx, y: cy, z: cz, speed, bounds: 180, offsets: blockOffsets, type: 'low' });
        }

        // High Clouds
        const numHighClusters = 8;
        for (let i = 0; i < numHighClusters; i++) {
            const numBlocks = 6;
            const cx = (Math.random() - 0.5) * 320;
            const cy = 72 + Math.random() * 8;
            const cz = (Math.random() - 0.5) * 320;
            const speed = 1.0 + Math.random() * 0.8;

            const blockOffsets = [];
            for (let b = 0; b < numBlocks; b++) {
                blockOffsets.push([
                    (b - numBlocks / 2) * 3.5,
                    0,
                    (Math.random() - 0.5) * 4
                ]);
            }
            this.clouds.push({ x: cx, y: cy, z: cz, speed, bounds: 220, offsets: blockOffsets, type: 'high' });
        }

        // Build Instanced Meshes
        const totalLowBlocks = numLowClusters * 6;
        const totalHighBlocks = numHighClusters * 6;

        this.lowInstancedMesh = new THREE.InstancedMesh(cubeGeo, cloudMatLow, totalLowBlocks);
        this.highInstancedMesh = new THREE.InstancedMesh(flatGeo, cloudMatHigh, totalHighBlocks);

        this.lowInstancedMesh.frustumCulled = true;
        this.highInstancedMesh.frustumCulled = true;
        this.scene.add(this.lowInstancedMesh);
        this.scene.add(this.highInstancedMesh);

        this.dummy = new THREE.Object3D();
        this.updateInstanceMatrices();
    }

    updateInstanceMatrices() {
        let lowIdx = 0;
        let highIdx = 0;

        for (const cloud of this.clouds) {
            if (cloud.type === 'low') {
                for (const [ox, oy, oz] of cloud.offsets) {
                    this.dummy.position.set(cloud.x + ox, cloud.y + oy, cloud.z + oz);
                    this.dummy.updateMatrix();
                    this.lowInstancedMesh.setMatrixAt(lowIdx++, this.dummy.matrix);
                }
            } else {
                for (const [ox, oy, oz] of cloud.offsets) {
                    this.dummy.position.set(cloud.x + ox, cloud.y + oy, cloud.z + oz);
                    this.dummy.updateMatrix();
                    this.highInstancedMesh.setMatrixAt(highIdx++, this.dummy.matrix);
                }
            }
        }

        this.lowInstancedMesh.instanceMatrix.needsUpdate = true;
        this.highInstancedMesh.instanceMatrix.needsUpdate = true;
    }

    update(delta) {
        for (const cloud of this.clouds) {
            cloud.x += cloud.speed * delta;
            if (cloud.x > cloud.bounds) {
                cloud.x = -cloud.bounds;
            }
        }
        this.updateInstanceMatrices();
    }
}
