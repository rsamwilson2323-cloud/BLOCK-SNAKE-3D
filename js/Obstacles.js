import * as THREE from 'three';
import { DetailedVoxelFactory } from './DetailedVoxelFactory.js';

export class Obstacles {
    constructor(scene) {
        this.scene = scene;
        this.pillars = [];
        this.lasers = [];
        this.arenaRadius = 70;
    }

    setupSectorObstacles(sector = 1) {
        this.clearAll();

        const numPillars = Math.min(10, 1 + sector);
        const minOrigin = 18;
        const minPair = 12;
        const placed = [];

        const placeAway = () => {
            for (let attempt = 0; attempt < 25; attempt++) {
                const angle = Math.random() * Math.PI * 2;
                const dist = minOrigin + Math.random() * 40;
                const x = Math.cos(angle) * dist;
                const z = Math.sin(angle) * dist;
                if (placed.every((p) => Math.hypot(p.x - x, p.z - z) >= minPair)) {
                    placed.push({ x, z });
                    return { x, z };
                }
            }
            const angle = Math.random() * Math.PI * 2;
            return { x: Math.cos(angle) * 30, z: Math.sin(angle) * 30 };
        };

        for (let i = 0; i < numPillars; i++) {
            const { x, z } = placeAway();
            const isCrate = Math.random() > 0.45;
            const pillarGroup = isCrate
                ? DetailedVoxelFactory.createCrateObstacle()
                : DetailedVoxelFactory.createStonePillar();
            pillarGroup.position.set(x, 0, z);
            this.scene.add(pillarGroup);
            this.pillars.push({
                group: pillarGroup,
                meshes: [pillarGroup],
                radius: isCrate ? 1.15 : 1.2,
                jumpable: isCrate,
                clearHeight: 1.35,
                kind: isCrate ? 'crate' : 'pillar',
                pos: new THREE.Vector3(x, 0, z)
            });
        }

        if (sector >= 2) {
            const numLasers = Math.min(4, sector - 1);
            for (let i = 0; i < numLasers; i++) {
                const { x, z } = placeAway();
                const group = DetailedVoxelFactory.createSpikeTrap();
                group.position.set(x, 0, z);
                group.rotation.y = Math.random() * Math.PI;
                this.scene.add(group);
                this.lasers.push({
                    group,
                    length: 8,
                    pos: new THREE.Vector3(x, 0, z)
                });
            }
        }
    }

    getBlockerPositions() {
        const pts = [];
        for (const p of this.pillars) pts.push(p.pos);
        for (const l of this.lasers) pts.push(l.pos);
        return pts;
    }

    checkCollisions(headPos, headYOffset) {
        for (const pillar of this.pillars) {
            if (pillar.jumpable && headYOffset > pillar.clearHeight) continue;
            const dist = Math.hypot(headPos.x - pillar.pos.x, headPos.z - pillar.pos.z);
            if (dist < pillar.radius + 0.45) return pillar.kind;
        }

        for (const laser of this.lasers) {
            laser.group.updateMatrixWorld();
            const worldHeadPos = new THREE.Vector3(headPos.x, headYOffset, headPos.z);
            const localPos = worldHeadPos.clone();
            laser.group.worldToLocal(localPos);

            if (Math.abs(localPos.x) > 3.4 && Math.abs(localPos.x) < 4.6) {
                if (Math.abs(localPos.z) < 0.9 && localPos.y < 3.5) return 'laser';
            }
            if (Math.abs(localPos.x) <= 3.8) {
                if (Math.abs(localPos.z) < 0.65 && localPos.y < 1.7) return 'laser';
            }
        }
        return null;
    }

    update(time, delta) {
        for (const laser of this.lasers) {
            laser.group.rotation.y += 0.25 * delta;
        }
    }

    clearAll() {
        const disposeObject = (obj) => {
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) {
                    obj.material.forEach(m => m.dispose());
                } else {
                    obj.material.dispose();
                }
            }
            if (obj.children) {
                obj.children.forEach(child => disposeObject(child));
            }
        };

        for (const pillar of this.pillars) {
            this.scene.remove(pillar.group);
            disposeObject(pillar.group);
        }
        this.pillars = [];
        
        for (const laser of this.lasers) {
            this.scene.remove(laser.group);
            disposeObject(laser.group);
        }
        this.lasers = [];
    }
}
