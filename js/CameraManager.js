import * as THREE from 'three';

export class CameraManager {
  constructor(camera) {
    this.camera = camera;
    this.distance = 11.5;
    this.height = 6.4;
    this.lookAhead = 6.4;
    this.smoothing = 0.012;

    this.baseFov = 58;
    this.boostFov = 74;
    this.fovPunch = 0;
    this.roll = 0;

    this.shakeIntensity = 0;
    this.currentPosition = new THREE.Vector3(0, 10, 14);
    this.currentLookAt = new THREE.Vector3(0, 0, 0);
    this._targetPos = new THREE.Vector3();
    this._targetLook = new THREE.Vector3();
    this._finalPos = new THREE.Vector3();
    this.initialized = false;
  }

  update(headPos, headYaw, headYOffset, isBoosting, turnDelta, delta) {
    this._targetPos.set(
      headPos.x - Math.sin(headYaw) * this.distance,
      0.5 + headYOffset + this.height,
      headPos.z - Math.cos(headYaw) * this.distance
    );
    this._targetLook.set(
      headPos.x + Math.sin(headYaw) * this.lookAhead,
      0.5 + headYOffset + 0.45,
      headPos.z + Math.cos(headYaw) * this.lookAhead
    );

    if (!this.initialized) {
      this.currentPosition.copy(this._targetPos);
      this.currentLookAt.copy(this._targetLook);
      this.initialized = true;
    }

    const posAlpha = 1.0 - Math.pow(this.smoothing, delta);
    const lookAlpha = 1.0 - Math.pow(this.smoothing * 0.45, delta);
    this.currentPosition.lerp(this._targetPos, posAlpha);
    this.currentLookAt.lerp(this._targetLook, lookAlpha);

    this._finalPos.copy(this.currentPosition);
    if (this.shakeIntensity > 0.01) {
      this._finalPos.x += (Math.random() - 0.5) * this.shakeIntensity * 2;
      this._finalPos.y += (Math.random() - 0.5) * this.shakeIntensity * 1.4;
      this._finalPos.z += (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity *= Math.pow(0.012, delta);
      if (this.shakeIntensity < 0.01) this.shakeIntensity = 0;
    }

    this.camera.position.copy(this._finalPos);
    this.camera.lookAt(this.currentLookAt);

    const targetRoll = THREE.MathUtils.clamp(-turnDelta * 0.045, -0.18, 0.18);
    this.roll += (targetRoll - this.roll) * Math.min(1, delta * 7);
    this.camera.rotateZ(this.roll);

    this.fovPunch = Math.max(0, this.fovPunch - delta * 28);
    const targetFov = (isBoosting ? this.boostFov : this.baseFov) + this.fovPunch;
    const fovAlpha = 1.0 - Math.pow(0.04, delta);
    this.camera.fov += (targetFov - this.camera.fov) * fovAlpha;
    this.camera.updateProjectionMatrix();
  }

  punch(amount = 6) {
    this.fovPunch = Math.max(this.fovPunch, amount);
  }

  reset() {
    this.initialized = false;
    this.shakeIntensity = 0;
    this.fovPunch = 0;
    this.roll = 0;
  }

  triggerShake(intensity = 0.5) {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
  }
}
