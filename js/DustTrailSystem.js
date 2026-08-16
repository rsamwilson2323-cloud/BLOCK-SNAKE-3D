import * as THREE from 'three';

export class DustTrailSystem {
    constructor(scene) {
        this.scene = scene;
        this.pool = 40;
        this.particles = [];
        this.active = false;
        this.emitAcc = 0;
        this.activeCount = 0;
        this.dummy = new THREE.Object3D();
        this._dir = new THREE.Vector3();

        const geom = new THREE.BoxGeometry(0.28, 0.28, 0.28);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xd8c9a8,
            transparent: true,
            opacity: 0.45,
            depthWrite: false
        });
        this.instancedMesh = new THREE.InstancedMesh(geom, mat, this.pool);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.scene.add(this.instancedMesh);

        this.dummy.position.set(0, -100, 0);
        this.dummy.updateMatrix();
        for (let i = 0; i < this.pool; i++) {
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
            this.particles.push({
                active: false,
                life: 0,
                pos: new THREE.Vector3(),
                vel: new THREE.Vector3()
            });
        }
        this.instancedMesh.instanceMatrix.needsUpdate = true;
        this.currentIndex = 0;
    }

    emit(position, yaw) {
        if (!this.active) return;
        const p = this.particles[this.currentIndex];
        p.active = true;
        p.life = 0.7;
        p.pos.copy(position);
        p.pos.x += (Math.random() - 0.5) * 0.7;
        p.pos.y += Math.random() * 0.35;
        p.pos.z += (Math.random() - 0.5) * 0.7;
        this._dir.set(-Math.sin(yaw), 0.4 + Math.random() * 0.6, -Math.cos(yaw));
        p.vel.copy(this._dir).multiplyScalar(2.4);
        this.currentIndex = (this.currentIndex + 1) % this.pool;
        this.activeCount++;
    }

    update(delta) {
        if (this.activeCount <= 0 && !this.active) return;
        this.activeCount = 0;
        for (let i = 0; i < this.pool; i++) {
            const p = this.particles[i];
            if (!p.active) continue;
            p.life -= delta * 1.8;
            if (p.life <= 0) {
                p.active = false;
                this.dummy.position.set(0, -100, 0);
                this.dummy.scale.setScalar(1);
                this.dummy.updateMatrix();
                this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
                continue;
            }
            this.activeCount++;
            p.pos.addScaledVector(p.vel, delta);
            this.dummy.position.copy(p.pos);
            this.dummy.scale.setScalar(p.life * 1.6);
            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.instancedMesh.instanceMatrix.needsUpdate = true;
    }
}
