import * as THREE from 'three';

const FACES = [
    { // Right (+X)
        dir: [1, 0, 0],
        corners: [
            [1, -1, 1], [1, -1, -1], [1, 1, -1],
            [1, -1, 1], [1, 1, -1], [1, 1, 1]
        ]
    },
    { // Left (-X)
        dir: [-1, 0, 0],
        corners: [
            [-1, -1, -1], [-1, -1, 1], [-1, 1, 1],
            [-1, -1, -1], [-1, 1, 1], [-1, 1, -1]
        ]
    },
    { // Top (+Y)
        dir: [0, 1, 0],
        corners: [
            [-1, 1, 1], [1, 1, 1], [1, 1, -1],
            [-1, 1, 1], [1, 1, -1], [-1, 1, -1]
        ]
    },
    { // Bottom (-Y)
        dir: [0, -1, 0],
        corners: [
            [-1, -1, -1], [1, -1, -1], [1, -1, 1],
            [-1, -1, -1], [1, -1, 1], [-1, -1, 1]
        ]
    },
    { // Front (+Z)
        dir: [0, 0, 1],
        corners: [
            [-1, -1, 1], [1, -1, 1], [1, 1, 1],
            [-1, -1, 1], [1, 1, 1], [-1, 1, 1]
        ]
    },
    { // Back (-Z)
        dir: [0, 0, -1],
        corners: [
            [1, -1, -1], [-1, -1, -1], [-1, 1, -1],
            [1, -1, -1], [-1, 1, -1], [1, 1, -1]
        ]
    }
];

export class VoxelMesher {
    /**
     * Builds a single Mesh from a collection of voxel coordinates and colors.
     * @param {Array<{x, y, z, color}>} voxels 
     * @param {number} voxelSize 
     * @param {Object} materialParams 
     * @returns {THREE.Mesh}
     */
    static build(voxels, voxelSize = 0.1, materialParams = {}) {
        const map = new Map();
        for (const v of voxels) {
            map.set(`${v.x},${v.y},${v.z}`, v.color);
        }

        const positions = [];
        const normals = [];
        const colors = [];

        const hs = voxelSize / 2;
        const colorObj = new THREE.Color();

        for (const v of voxels) {
            const { x, y, z, color } = v;
            colorObj.setHex(color);

            const cx = x * voxelSize;
            const cy = y * voxelSize;
            const cz = z * voxelSize;

            for (const face of FACES) {
                const nx = x + face.dir[0];
                const ny = y + face.dir[1];
                const nz = z + face.dir[2];

                if (!map.has(`${nx},${ny},${nz}`)) {
                    let shade = 1.0;
                    if (face.dir[1] === 1) shade = 1.12;
                    else if (face.dir[1] === -1) shade = 0.52;
                    else if (face.dir[2] === 1) shade = 0.92;
                    else if (face.dir[2] === -1) shade = 0.78;
                    else if (face.dir[0] === 1) shade = 0.88;
                    else shade = 0.72;

                    const r = Math.min(1, colorObj.r * shade);
                    const g = Math.min(1, colorObj.g * shade);
                    const b = Math.min(1, colorObj.b * shade);

                    for (const corner of face.corners) {
                        positions.push(
                            cx + corner[0] * hs,
                            cy + corner[1] * hs,
                            cz + corner[2] * hs
                        );
                        normals.push(face.dir[0], face.dir[1], face.dir[2]);
                        colors.push(r, g, b);
                    }
                }
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        const material = new THREE.MeshStandardMaterial({
            vertexColors: true,
            roughness: 0.55,
            metalness: 0.18,
            envMapIntensity: 0.85,
            ...materialParams
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        return mesh;
    }

    /**
     * Helper to build a sphere-like shape out of voxels
     */
    static buildSphere(radius, baseColor) {
        const voxels = [];
        const rSq = radius * radius;
        for (let x = -radius; x <= radius; x++) {
            for (let y = -radius; y <= radius; y++) {
                for (let z = -radius; z <= radius; z++) {
                    if (x*x + y*y + z*z <= rSq) {
                        voxels.push({ x, y, z, color: baseColor });
                    }
                }
            }
        }
        return voxels;
    }
}
