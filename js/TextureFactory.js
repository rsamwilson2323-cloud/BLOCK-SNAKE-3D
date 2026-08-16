import * as THREE from 'three';

export class TextureFactory {
    static _createTexture(drawFn, size = 16) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        drawFn(ctx, size, size);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        return texture;
    }

    static grassTop() {
        return this._createTexture((ctx, w, h) => {
            ctx.fillStyle = '#4e7a2c';
            ctx.fillRect(0, 0, w, h);
            const palette = ['#5b8c31', '#74a443', '#3d6920', '#6b9a38', '#4a7c28', '#89b354'];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.55) {
                        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
            ctx.fillStyle = '#2f5418';
            for (let i = 0; i < 18; i++) {
                ctx.fillRect(Math.floor(Math.random() * w), Math.floor(Math.random() * h), 1, 2);
            }
        }, 32);
    }

    static grassSide() {
        return this._createTexture((ctx, w, h) => {
            // Dirt base
            ctx.fillStyle = '#866043';
            ctx.fillRect(0, 4, w, h - 4);
            const dirtPalette = ['#6b4b32', '#553a25', '#9b7151'];
            for (let y = 4; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.35) {
                        ctx.fillStyle = dirtPalette[Math.floor(Math.random() * dirtPalette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
            
            // Grass top
            ctx.fillStyle = '#5b8c31';
            ctx.fillRect(0, 0, w, 4);
            const grassPalette = ['#74a443', '#4a7c28'];
            for (let y = 0; y < 4; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.35) {
                        ctx.fillStyle = grassPalette[Math.floor(Math.random() * grassPalette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
            
            // Hanging grass
            for (let x = 0; x < w; x++) {
                if (Math.random() < 0.5) {
                    const length = Math.floor(Math.random() * 3) + 1;
                    for (let y = 4; y < 4 + length; y++) {
                        ctx.fillStyle = grassPalette[Math.floor(Math.random() * grassPalette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        });
    }

    static dirt() {
        return this._createTexture((ctx, w, h) => {
            ctx.fillStyle = '#866043';
            ctx.fillRect(0, 0, w, h);
            const palette = ['#6b4b32', '#553a25', '#9b7151'];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.35) {
                        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        });
    }

    static stone() {
        return this._createTexture((ctx, w, h) => {
            ctx.fillStyle = '#6e6e72';
            ctx.fillRect(0, 0, w, h);
            const palette = ['#8a8a90', '#5a5a60', '#78787e', '#4a4a50', '#9a9aa0'];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.45) {
                        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
            ctx.fillStyle = '#3a3a40';
            ctx.fillRect(0, 0, w, 1);
            ctx.fillRect(0, h - 1, w, 1);
            ctx.fillRect(0, 0, 1, h);
            ctx.fillRect(w - 1, 0, 1, h);
            ctx.fillStyle = '#b0b0b6';
            ctx.fillRect(1, 1, w - 3, 1);
        }, 32);
    }

    static wood() {
        return this._createTexture((ctx, w, h) => {
            ctx.fillStyle = '#8B6F4E';
            ctx.fillRect(0, 0, w, h);
            const noise = ['#7a5f3e', '#9b7f5e'];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.30) {
                        ctx.fillStyle = noise[Math.floor(Math.random() * noise.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
            // Horizontal grain lines
            ctx.fillStyle = '#6b5030';
            for (let y = 0; y < h; y += 3 + Math.floor(Math.random() * 2)) {
                ctx.fillRect(0, y, w, 1);
            }
        });
    }

    static leaves() {
        return this._createTexture((ctx, w, h) => {
            ctx.fillStyle = '#3a7a1f';
            ctx.fillRect(0, 0, w, h);
            const palette = ['#4a8a2f', '#2a6a10', '#5a9e37'];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.45) {
                        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        });
    }

    static snakeBody(isPrimary = true) {
        return this._createTexture((ctx, w, h) => {
            // 1px border
            ctx.fillStyle = '#1a5c32';
            ctx.fillRect(0, 0, w, h);
            
            // Inner fill
            ctx.fillStyle = isPrimary ? '#2ecc71' : '#27ae60';
            ctx.fillRect(1, 1, w - 2, h - 2);

            // Alternating checker pattern
            ctx.fillStyle = isPrimary ? '#27ae60' : '#2ecc71';
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    if ((x + y) % 2 === 0) {
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }

            // Scale highlights
            ctx.fillStyle = '#82e0aa';
            ctx.fillRect(2, 2, 3, 3);
            ctx.fillRect(9, 9, 3, 3);
        });
    }

    static snakeHeadFront() {
        return this._createTexture((ctx, w, h) => {
            // 1px border
            ctx.fillStyle = '#1a5c32';
            ctx.fillRect(0, 0, w, h);
            
            // Inner fill
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(1, 1, w - 2, h - 2);

            // Left eye
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(3, 4, 4, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(5, 5, 2, 2);

            // Right eye
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(9, 4, 4, 4);
            ctx.fillStyle = '#000000';
            ctx.fillRect(11, 5, 2, 2);

            // Nostrils
            ctx.fillStyle = '#145a32';
            ctx.fillRect(5, 11, 2, 2);
            ctx.fillRect(9, 11, 2, 2);

            // Mouth line
            ctx.fillRect(4, 13, 8, 1);
        });
    }

    static snakeHeadTop() {
        return this._createTexture((ctx, w, h) => {
            // 1px border
            ctx.fillStyle = '#1a5c32';
            ctx.fillRect(0, 0, w, h);
            
            // Fill
            ctx.fillStyle = '#25a25a';
            ctx.fillRect(1, 1, w - 2, h - 2);

            // Diamond pattern in center
            ctx.fillStyle = '#2ecc71';
            const cx = Math.floor(w/2) - 1;
            const cy = Math.floor(h/2) - 1;
            for (let i = -2; i <= 2; i++) {
                const width = 2 - Math.abs(i);
                for (let j = -width; j <= width; j++) {
                    ctx.fillRect(cx + 1 + j, cy + 1 + i, 1, 1);
                }
            }
        });
    }

    static snakeHeadSide() {
        return this._createTexture((ctx, w, h) => {
            // 1px border
            ctx.fillStyle = '#1a5c32';
            ctx.fillRect(0, 0, w, h);
            
            // Fill
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(1, 1, w - 2, h - 2);

            // Jaw line
            ctx.fillStyle = '#1e8c50';
            ctx.fillRect(1, h - 4, w - 2, 3);
        });
    }

    static apple() {
        return this._createTexture((ctx, w, h) => {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(0, 0, w, h);
            
            const palette = ['#c0392b', '#ff6b6b'];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.3) {
                        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }

            // Green stem
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(7, 0, 2, 1);
            
            // Green leaf
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(9, 0, 1, 1);
            ctx.fillRect(10, 1, 1, 1);
        });
    }

    static goldenApple() {
        return this._createTexture((ctx, w, h) => {
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(0, 0, w, h);
            
            const palette = ['#d4ac0d', '#f9e154'];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.3) {
                        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }

            // Sparkle pixels
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(Math.floor(Math.random() * w), Math.floor(Math.random() * h), 1, 1);
            }

            // Green stem
            ctx.fillStyle = '#27ae60';
            ctx.fillRect(7, 0, 2, 1);
            
            // Green leaf
            ctx.fillStyle = '#2ecc71';
            ctx.fillRect(9, 0, 1, 1);
            ctx.fillRect(10, 1, 1, 1);
        });
    }

    static mushroom() {
        return this._createTexture((ctx, w, h) => {
            // Background empty
            ctx.clearRect(0, 0, w, h);
            
            // Bottom half: cream stem
            ctx.fillStyle = '#f5e6cc';
            ctx.fillRect(6, 8, 4, 8);

            // Top half: red
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(2, 2, 12, 6);
            ctx.fillRect(3, 1, 10, 1);
            ctx.fillRect(4, 0, 8, 1);

            // White spots
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(3, 2, 2, 2);
            ctx.fillRect(7, 1, 2, 2);
            ctx.fillRect(11, 3, 2, 2);
        });
    }

    static diamond() {
        return this._createTexture((ctx, w, h) => {
            ctx.fillStyle = '#00d2d3';
            ctx.fillRect(0, 0, w, h);
            
            const palette = ['#01a3a4', '#55efc4'];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.3) {
                        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }

            // Center highlight
            ctx.fillStyle = '#dfe6e9';
            ctx.fillRect(7, 7, 2, 2);
        });
    }

    static lava() {
        return this._createTexture((ctx, w, h) => {
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(0, 0, w, h);
            
            const palette = ['#ff6b6b', '#d63031', '#fdcb6e', '#e17055'];
            for (let y = 0; y < h; y++) {
                for (let x = 0; x < w; x++) {
                    if (Math.random() < 0.6) {
                        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
        });
    }
}

export default TextureFactory;
