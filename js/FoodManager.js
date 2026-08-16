import * as THREE from 'three';
import { DetailedVoxelFactory } from './DetailedVoxelFactory.js';

export class FoodManager {
    constructor(scene) {
        this.scene = scene;
        this.items = [];
        this.arenaRadius = 70;

        // Particle Pool for zero GC stutters
        this.particlePool = [];
        this.activeParticles = [];
        this.setupParticlePool();
    }

    setupParticlePool() {
        const pGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
        const pMat = new THREE.MeshStandardMaterial({ 
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 1.5,
            roughness: 0.1,
            metalness: 0.2
        });
        
        for (let i = 0; i < 40; i++) {
            const mesh = new THREE.Mesh(pGeo, pMat.clone());
            mesh.visible = false;
            mesh.matrixAutoUpdate = true;
            this.scene.add(mesh);
            this.particlePool.push({
                mesh: mesh,
                velocity: new THREE.Vector3(),
                life: 0,
                active: false
            });
        }
    }

    spawnItem(type, customPos = null) {
        let modelGroup;
        let pColor;

        switch (type) {
            case 'core':
                modelGroup = DetailedVoxelFactory.createDetailedApple();
                pColor = 0xFF3333;
                break;
            case 'overclock':
                modelGroup = DetailedVoxelFactory.createDetailedGoldenApple();
                pColor = 0xFFD700;
                break;
            case 'emp':
                modelGroup = DetailedVoxelFactory.createDetailedMushroom();
                pColor = 0xE74C3C;
                break;
            case 'shield':
                modelGroup = DetailedVoxelFactory.createDetailedDiamond();
                pColor = 0x00FFFF;
                break;
            default:
                modelGroup = DetailedVoxelFactory.createDetailedApple();
                pColor = 0xFF3333;
        }

        if (customPos) {
            modelGroup.position.copy(customPos);
        } else {
            const pos = this.findSpawnPosition();
            modelGroup.position.copy(pos);
        }
        modelGroup.position.y = 0.4;

        this.scene.add(modelGroup);
        
        this.items.push({
            group: modelGroup,
            type: type,
            baseY: 0.4,
            phase: Math.random() * Math.PI * 2,
            color: pColor
        });
    }

    setContext(getSnakePos, getBlockers) {
        this.getSnakePos = getSnakePos;
        this.getBlockers = getBlockers;
    }

    isClear(x, z, minItemDist = 10) {
        if (Math.hypot(x, z) < 14) return false;
        const snake = this.getSnakePos ? this.getSnakePos() : null;
        if (snake && Math.hypot(x - snake.x, z - snake.z) < 12) return false;
        const blockers = this.getBlockers ? this.getBlockers() : [];
        for (const b of blockers) {
            if (Math.hypot(x - b.x, z - b.z) < 8) return false;
        }
        for (const item of this.items) {
            if (Math.hypot(x - item.group.position.x, z - item.group.position.z) < minItemDist) return false;
        }
        return true;
    }

    findSpawnPosition() {
        for (let attempt = 0; attempt < 32; attempt++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 16 + Math.random() * (this.arenaRadius - 22);
            const x = Math.cos(angle) * dist;
            const z = Math.sin(angle) * dist;
            if (this.isClear(x, z)) return new THREE.Vector3(x, 0.4, z);
        }
        const angle = Math.random() * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 28, 0.4, Math.sin(angle) * 28);
    }

    update(time, delta) {
        // Update items animation
        for (const item of this.items) {
            item.group.rotation.y += delta * 1.5;
            item.group.position.y = item.baseY + Math.sin(time * 2.5 + item.phase) * 0.15;

            if (item.type === 'overclock' && item.group.userData.sparkles) {
                item.group.userData.sparkles.forEach((sp, i) => {
                    const angle = time * 3 + i * (Math.PI / 2);
                    sp.position.set(Math.cos(angle) * 0.55, 0.35 + Math.sin(time * 4 + i) * 0.15, Math.sin(angle) * 0.55);
                });
            } else if (item.type === 'shield' && item.group.userData.core) {
                item.group.userData.core.rotation.y += delta * 2.0;
                item.group.userData.core.rotation.x += delta * 1.5;
            }
        }

        // Update active particles from pool
        for (const p of this.particlePool) {
            if (!p.active) continue;

            p.life -= delta;
            if (p.life <= 0) {
                p.active = false;
                p.mesh.visible = false;
            } else {
                p.mesh.position.addScaledVector(p.velocity, delta);
                const scale = Math.max(0.01, p.life / 0.5);
                p.mesh.scale.set(scale, scale, scale);
                p.mesh.rotation.x += delta * 3;
                p.mesh.rotation.y += delta * 3;
            }
        }
    }

    checkPickups(headPos, headYOffset) {
        const pickupRadius = 1.6;
        
        for (let i = this.items.length - 1; i >= 0; i--) {
            const item = this.items[i];
            const dist = new THREE.Vector2(headPos.x - item.group.position.x, headPos.z - item.group.position.z).length();
            
            if (dist < pickupRadius && Math.abs(headYOffset - item.baseY) < 2.0) {
                const type = item.type;
                this.createPickupBurst(item.group.position, item.color);
                
                this.scene.remove(item.group);
                this.items.splice(i, 1);
                
                return type;
            }
        }
        return null;
    }

    createPickupBurst(pos, color) {
        let spawned = 0;
        for (const p of this.particlePool) {
            if (p.active) continue;

            p.active = true;
            p.life = 0.5;
            p.mesh.visible = true;
            p.mesh.material.color.setHex(color);
            p.mesh.position.copy(pos);
            p.mesh.scale.set(1, 1, 1);
            p.velocity.set(
                (Math.random() - 0.5) * 10,
                Math.random() * 5 + 2,
                (Math.random() - 0.5) * 10
            );

            spawned++;
            if (spawned >= 12) break;
        }
    }

    spawnInitial(appleCount = 5) {
        this.clearAll();
        const n = Math.max(4, Math.min(8, appleCount));
        for (let i = 0; i < n; i++) this.spawnItem('core');
        this.spawnRandomPowerUp();
    }

    countType(type) {
        return this.items.filter((item) => item.type === type).length;
    }

    ensureAppleCount(count) {
        while (this.countType('core') < count) this.spawnItem('core');
    }

    spawnRandomPowerUp() {
        if (this.items.filter((i) => i.type !== 'core').length >= 2) return;
        const roll = Math.random();
        let type = 'overclock';
        if (roll < 0.38) type = 'shield';
        else if (roll < 0.58) type = 'emp';
        this.spawnItem(type);
    }

    clearAll() {
        for (const item of this.items) {
            this.scene.remove(item.group);
        }
        this.items = [];

        for (const p of this.particlePool) {
            p.active = false;
            p.mesh.visible = false;
        }
    }
}
