import * as THREE from 'three';

export class DayNightCycle {
    constructor(scene, sunLight, fillLight, extras = {}) {
        this.scene = scene;
        this.sunLight = sunLight;
        this.fillLight = fillLight;
        this.hemiLight = extras.hemiLight || null;
        this.ambientLight = extras.ambientLight || null;
        this.skyMat = extras.skyMat || null;
        this.sunMesh = extras.sunMesh || null;
        this.moonMesh = extras.moonMesh || null;

        this.cycleDuration = 140;
        this.timeOfDay = 0.22;
        this.sunHeight = 40;
        this.nightAmount = 0;

        this.moonLight = new THREE.DirectionalLight(0x8AA4C8, 0.0);
        this.moonLight.castShadow = false;
        this.scene.add(this.moonLight);
        this.scene.add(this.moonLight.target);

        this.skyDawn = new THREE.Color(0xFF8C42);
        this.skyDay = new THREE.Color(0x4FA9E8);
        this.skyDusk = new THREE.Color(0xC45C78);
        this.skyNight = new THREE.Color(0x070B19);

        this.horizonDawn = new THREE.Color(0xFFC38A);
        this.horizonDay = new THREE.Color(0xC9E7FF);
        this.horizonDusk = new THREE.Color(0xFF8F5C);
        this.horizonNight = new THREE.Color(0x1A2744);

        this.sunDawn = new THREE.Color(0xFFB373);
        this.sunDay = new THREE.Color(0xFFF0D4);
        this.sunDusk = new THREE.Color(0xFF5E36);
        this.sunNight = new THREE.Color(0x221100);

        this.currentSkyColor = new THREE.Color();
        this._horizon = new THREE.Color();
        this._bottom = new THREE.Color();
        this._skyCol = new THREE.Color();
        this._sunCol = new THREE.Color();

        this.setupStars();
    }

    setupStars() {
        const count = 280;
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count * 3; i += 3) {
            pos[i] = (Math.random() - 0.5) * 350;
            pos[i + 1] = 50 + Math.random() * 80;
            pos[i + 2] = (Math.random() - 0.5) * 350;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        this.starMaterial = new THREE.PointsMaterial({
            color: 0xE8F1FF,
            size: 1.35,
            transparent: true,
            opacity: 0.0,
            depthWrite: false,
            sizeAttenuation: true
        });
        this.starField = new THREE.Points(geo, this.starMaterial);
        this.scene.add(this.starField);
    }

    update(delta, cameraPosition) {
        this.timeOfDay = (this.timeOfDay + delta / this.cycleDuration) % 1.0;
        const angle = this.timeOfDay * Math.PI * 2;
        const radius = 110;
        const cx = cameraPosition ? cameraPosition.x : 0;
        const cz = cameraPosition ? cameraPosition.z : 0;

        const sunX = cx + Math.sin(angle) * radius;
        const sunY = Math.cos(angle) * radius;
        const sunZ = cz + 30;
        this.sunHeight = sunY;
        this.sunLight.position.set(sunX, sunY, sunZ);
        this.sunLight.target.position.set(cx, 0, cz);

        const moonX = cx - Math.sin(angle) * radius;
        const moonY = -Math.cos(angle) * radius;
        const moonZ = cz - 30;
        this.moonLight.position.set(moonX, moonY, moonZ);
        this.moonLight.target.position.set(cx, 0, cz);

        const skyCol = this._skyCol;
        const sunCol = this._sunCol;
        let sunIntensity = 0;
        let moonIntensity = 0;
        let fillIntensity = 0.4;
        let starOpacity = 0;

        if (this.timeOfDay < 0.25) {
            const t = this.timeOfDay / 0.25;
            skyCol.copy(this.skyDawn).lerp(this.skyDay, t);
            sunCol.copy(this.sunDawn).lerp(this.sunDay, t);
            sunIntensity = THREE.MathUtils.lerp(0.5, 1.65, t);
            moonIntensity = 0;
            fillIntensity = THREE.MathUtils.lerp(0.2, 0.45, t);
            starOpacity = THREE.MathUtils.lerp(0.8, 0, Math.min(1, t * 2));
            this.nightAmount = THREE.MathUtils.lerp(0.55, 0, t);
        } else if (this.timeOfDay < 0.50) {
            const t = (this.timeOfDay - 0.25) / 0.25;
            skyCol.copy(this.skyDay).lerp(this.skyDusk, t);
            sunCol.copy(this.sunDay).lerp(this.sunDusk, t);
            sunIntensity = THREE.MathUtils.lerp(1.65, 0.55, t);
            moonIntensity = THREE.MathUtils.lerp(0, 0.25, t);
            fillIntensity = THREE.MathUtils.lerp(0.45, 0.22, t);
            starOpacity = THREE.MathUtils.lerp(0, 0.5, t);
            this.nightAmount = THREE.MathUtils.lerp(0, 0.45, t);
        } else if (this.timeOfDay < 0.75) {
            const t = (this.timeOfDay - 0.50) / 0.25;
            skyCol.copy(this.skyDusk).lerp(this.skyNight, t);
            sunCol.copy(this.sunDusk).lerp(this.sunNight, t);
            sunIntensity = THREE.MathUtils.lerp(0.55, 0.0, t);
            moonIntensity = THREE.MathUtils.lerp(0.25, 0.85, t);
            fillIntensity = THREE.MathUtils.lerp(0.22, 0.12, t);
            starOpacity = THREE.MathUtils.lerp(0.5, 1.0, t);
            this.nightAmount = THREE.MathUtils.lerp(0.45, 1, t);
        } else {
            const t = (this.timeOfDay - 0.75) / 0.25;
            skyCol.copy(this.skyNight).lerp(this.skyDawn, t);
            sunCol.copy(this.sunNight).lerp(this.sunDawn, t);
            sunIntensity = THREE.MathUtils.lerp(0.0, 0.5, t);
            moonIntensity = THREE.MathUtils.lerp(0.85, 0.0, t);
            fillIntensity = THREE.MathUtils.lerp(0.12, 0.2, t);
            starOpacity = THREE.MathUtils.lerp(1.0, 0.8, t);
            this.nightAmount = THREE.MathUtils.lerp(1, 0.55, t);
        }

        this.scene.background = skyCol;
        this.currentSkyColor.copy(skyCol);
        if (this.scene.fog) {
            this.scene.fog.color.copy(skyCol);
            this.scene.fog.near = THREE.MathUtils.lerp(52, 26, this.nightAmount);
            this.scene.fog.far = THREE.MathUtils.lerp(172, 118, this.nightAmount);
        }

        this.sunLight.color.copy(sunCol);
        this.sunLight.intensity = Math.max(0, sunIntensity);
        this.sunLight.castShadow = sunY > 10 && this.sunLight.intensity > 0.15;
        this.moonLight.intensity = Math.max(0, moonIntensity);
        if (this.fillLight) this.fillLight.intensity = fillIntensity;
        if (this.ambientLight) {
            this.ambientLight.intensity = THREE.MathUtils.lerp(0.06, 0.24, sunIntensity / 1.65);
        }
        if (this.hemiLight) {
            this.hemiLight.intensity = THREE.MathUtils.lerp(0.18, 0.66, sunIntensity / 1.65);
            this.hemiLight.color.copy(skyCol);
            this.hemiLight.groundColor.set(this.nightAmount > 0.5 ? 0x142018 : 0x3d5a28);
        }

        if (this.skyMat) {
            if (this.timeOfDay < 0.25) {
                const t = this.timeOfDay / 0.25;
                this._horizon.copy(this.horizonDawn).lerp(this.horizonDay, t);
                this._bottom.copy(this.horizonDawn).lerp(this.horizonDay, t * 0.6);
            } else if (this.timeOfDay < 0.50) {
                const t = (this.timeOfDay - 0.25) / 0.25;
                this._horizon.copy(this.horizonDay).lerp(this.horizonDusk, t);
                this._bottom.copy(this.horizonDay).lerp(this.horizonDusk, t);
            } else if (this.timeOfDay < 0.75) {
                const t = (this.timeOfDay - 0.50) / 0.25;
                this._horizon.copy(this.horizonDusk).lerp(this.horizonNight, t);
                this._bottom.copy(this.horizonDusk).lerp(this.horizonNight, t);
            } else {
                const t = (this.timeOfDay - 0.75) / 0.25;
                this._horizon.copy(this.horizonNight).lerp(this.horizonDawn, t);
                this._bottom.copy(this.horizonNight).lerp(this.horizonDawn, t);
            }
            this.skyMat.uniforms.topColor.value.copy(skyCol);
            this.skyMat.uniforms.horizonColor.value.copy(this._horizon);
            this.skyMat.uniforms.bottomColor.value.copy(this._bottom);
        }

        if (this.sunMesh) {
            this.sunMesh.position.copy(this.sunLight.position);
            this.sunMesh.visible = sunY > -8;
            this.sunMesh.material.color.copy(sunCol).multiplyScalar(1.35);
        }
        if (this.moonMesh) {
            this.moonMesh.position.copy(this.moonLight.position);
            this.moonMesh.visible = moonY > -6;
        }

        this.starMaterial.opacity = Math.max(0, Math.min(1, starOpacity));
        if (this.starField && cameraPosition) this.starField.position.set(cx, 0, cz);
    }
}
