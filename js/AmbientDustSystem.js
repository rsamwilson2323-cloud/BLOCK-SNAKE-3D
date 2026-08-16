import * as THREE from 'three';

export class AmbientDustSystem {
    constructor(scene) {
        this.scene = scene;
        this.time = 0;
        this.cursor = 0;
        this.count = 120;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(this.count * 3);
        const phases = new Float32Array(this.count);
        for (let i = 0; i < this.count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 80;
            pos[i * 3 + 1] = Math.random() * 18;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
            phases[i] = Math.random() * Math.PI * 2;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        geo.setAttribute('phase', new THREE.BufferAttribute(phases, 1));
        this.material = new THREE.PointsMaterial({
            color: 0xFFF6D8,
            size: 0.14,
            transparent: true,
            opacity: 0.22,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        this.particles = new THREE.Points(geo, this.material);
        this.scene.add(this.particles);
    }

    update(delta, cameraPosition) {
        this.time += delta;
        const positions = this.particles.geometry.attributes.position.array;
        const phases = this.particles.geometry.attributes.phase.array;
        const slice = Math.ceil(this.count / 2);
        for (let n = 0; n < slice; n++) {
            const i = (this.cursor + n) % this.count;
            const idx = i * 3;
            positions[idx + 1] -= delta * 0.28;
            positions[idx] += Math.cos(this.time * 0.2 + phases[i]) * 0.01;
            positions[idx + 2] += Math.sin(this.time * 0.2 + phases[i]) * 0.01;
            if (positions[idx + 1] < 0) {
                positions[idx + 1] = 16 + Math.random() * 6;
                if (cameraPosition) {
                    positions[idx] = cameraPosition.x + (Math.random() - 0.5) * 70;
                    positions[idx + 2] = cameraPosition.z + (Math.random() - 0.5) * 70;
                }
            }
        }
        this.cursor = (this.cursor + slice) % this.count;
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}
