import * as THREE from 'three';

export class CustomGlowShader {
    static getMaterial(colorHex, size, intensity = 1.0) {
        const color = new THREE.Color(colorHex);
        
        return new THREE.ShaderMaterial({
            uniforms: {
                uColor: { value: color },
                uIntensity: { value: intensity },
                uSize: { value: size * window.devicePixelRatio },
                uOpacity: { value: 1.0 }
            },
            vertexShader: `
                uniform float uSize;
                attribute float phase;
                varying float vPhase;
                
                void main() {
                    vPhase = phase;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = uSize * (100.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uIntensity;
                uniform float uOpacity;
                varying float vPhase;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = smoothstep(0.5, 0.0, dist);
                    alpha = pow(alpha, 1.8);
                    
                    float core = smoothstep(0.15, 0.0, dist);
                    
                    vec3 finalColor = uColor * (alpha * uIntensity + core * 2.0);
                    
                    gl_FragColor = vec4(finalColor, alpha * uOpacity);
                }
            `,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
    }
}
