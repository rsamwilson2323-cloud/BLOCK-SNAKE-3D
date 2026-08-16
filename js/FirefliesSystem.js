import * as THREE from 'three';

export class FirefliesSystem {
    constructor(scene) {
        this.scene = scene;
        this.time = 0;
        this.enabled = true;
        this.count = 36;
        this.dummy = new THREE.Object3D();
        this._cam = new THREE.Vector3();

        const voxelGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
        this.material = new THREE.MeshBasicMaterial({
            color: 0xD4FF4A,
            transparent: true,
            opacity: 1,
            toneMapped: false
        });

        this.instancedMesh = new THREE.InstancedMesh(voxelGeo, this.material, this.count);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.instancedMesh.frustumCulled = false;
        this.scene.add(this.instancedMesh);

        this.positions = new Float32Array(this.count * 3);
        this.phases = new Float32Array(this.count);
        this.home = new Float32Array(this.count * 3);

        for (let i = 0; i < this.count; i++) {
            const x = (Math.random() - 0.5) * 120;
            const y = 0.6 + Math.random() * 3.2;
            const z = (Math.random() - 0.5) * 120;
            this.positions[i * 3] = x;
            this.positions[i * 3 + 1] = y;
            this.positions[i * 3 + 2] = z;
            this.home[i * 3] = x;
            this.home[i * 3 + 1] = y;
            this.home[i * 3 + 2] = z;
            this.phases[i] = Math.random() * Math.PI * 2;
            this.dummy.position.set(x, y, z);
            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
        }
        this.instancedMesh.instanceMatrix.needsUpdate = true;

        this.lights = [];
        this.maxLights = 5;
        for (let i = 0; i < this.maxLights; i++) {
            const light = new THREE.PointLight(0xC6FF4E, 0, 16, 2);
            light.castShadow = false;
            light.visible = false;
            this.scene.add(light);
            this.lights.push(light);
        }

        this.washLight = new THREE.PointLight(0x9EEA4A, 0, 28, 1.8);
        this.washLight.castShadow = false;
        this.scene.add(this.washLight);
        this.activeLights = 5;
        this.nightAmount = 0;
    }

    setEnabled(on) {
        this.enabled = on;
        this.instancedMesh.visible = on;
        if (!on) this.setLightCount(0);
    }

    setLightCount(n) {
        this.activeLights = Math.max(0, Math.min(this.maxLights, n));
        for (let i = 0; i < this.lights.length; i++) {
            this.lights[i].visible = this.enabled && i < this.activeLights && this.nightAmount > 0.05;
        }
        this.washLight.visible = this.enabled && this.activeLights > 0;
    }

    update(delta, timeOfDay, cameraPosition) {
        if (!this.enabled) {
            this.instancedMesh.visible = false;
            this.washLight.intensity = 0;
            for (const light of this.lights) light.intensity = 0;
            return;
        }

        this.time += delta;
        let target = 0;
        if (timeOfDay > 0.42 && timeOfDay < 0.82) {
            target = THREE.MathUtils.mapLinear(timeOfDay, 0.42, 0.58, 0, 1);
        } else if (timeOfDay >= 0.82 || timeOfDay < 0.08) {
            target = 1;
        } else if (timeOfDay >= 0.08 && timeOfDay < 0.28) {
            target = THREE.MathUtils.mapLinear(timeOfDay, 0.08, 0.28, 1, 0);
        }
        this.nightAmount = THREE.MathUtils.clamp(target, 0, 1);

        const pulse = 0.72 + Math.sin(this.time * 2.1) * 0.28;
        const glow = this.nightAmount * pulse;
        this.material.opacity = THREE.MathUtils.lerp(this.material.opacity, Math.max(0.04, glow), delta * 3);
        this.instancedMesh.visible = this.nightAmount > 0.03;

        const cx = cameraPosition ? cameraPosition.x : 0;
        const cy = cameraPosition ? cameraPosition.y : 4;
        const cz = cameraPosition ? cameraPosition.z : 0;

        const nearest = [];
        let washX = 0;
        let washY = 0;
        let washZ = 0;
        let washN = 0;

        if (this.instancedMesh.visible) {
            for (let i = 0; i < this.count; i++) {
                const idx = i * 3;
                const attract = this.nightAmount * 0.55;
                this.positions[idx] += (this.home[idx] - this.positions[idx]) * delta * 0.15;
                this.positions[idx + 2] += (this.home[idx + 2] - this.positions[idx + 2]) * delta * 0.15;
                this.positions[idx] += (cx - this.positions[idx]) * delta * 0.22 * attract;
                this.positions[idx + 2] += (cz - this.positions[idx + 2]) * delta * 0.22 * attract;
                this.positions[idx] += Math.cos(this.time * 0.7 + this.phases[i]) * delta * 1.4;
                this.positions[idx + 2] += Math.sin(this.time * 0.55 + this.phases[i] * 1.3) * delta * 1.4;
                this.positions[idx + 1] += Math.sin(this.time * 1.4 + this.phases[i]) * delta * 0.9;
                this.positions[idx + 1] = THREE.MathUtils.clamp(this.positions[idx + 1], 0.35, 5.2);

                this.dummy.position.set(this.positions[idx], this.positions[idx + 1], this.positions[idx + 2]);
                const s = 0.7 + 0.55 * (0.5 + 0.5 * Math.sin(this.time * 6 + this.phases[i]));
                this.dummy.scale.setScalar(s);
                this.dummy.updateMatrix();
                this.instancedMesh.setMatrixAt(i, this.dummy.matrix);

                const dx = this.positions[idx] - cx;
                const dz = this.positions[idx + 2] - cz;
                const distSq = dx * dx + dz * dz;
                nearest.push({ i, distSq });
                if (distSq < 900) {
                    washX += this.positions[idx];
                    washY += this.positions[idx + 1];
                    washZ += this.positions[idx + 2];
                    washN++;
                }
            }
            this.instancedMesh.instanceMatrix.needsUpdate = true;
        }

        nearest.sort((a, b) => a.distSq - b.distSq);
        const lit = this.nightAmount > 0.05 ? this.activeLights : 0;
        for (let i = 0; i < this.lights.length; i++) {
            const light = this.lights[i];
            if (i >= lit || !nearest[i]) {
                light.intensity = 0;
                light.visible = false;
                continue;
            }
            const idx = nearest[i].i * 3;
            light.visible = true;
            light.position.set(this.positions[idx], this.positions[idx + 1] + 0.15, this.positions[idx + 2]);
            const flicker = 0.75 + 0.25 * Math.sin(this.time * 8 + this.phases[nearest[i].i]);
            light.intensity = 1.6 * this.nightAmount * flicker;
            light.distance = 15;
        }

        if (washN > 0 && lit > 0) {
            this.washLight.visible = true;
            this.washLight.position.set(washX / washN, 1.4, washZ / washN);
            this.washLight.intensity = 1.1 * this.nightAmount;
        } else {
            this.washLight.intensity = 0;
            this.washLight.visible = false;
        }
    }
}
