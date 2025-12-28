/**
 * WebGL Renderer
 *
 * Renders the game world using WebGL 2.
 * - Presence as soft circular gradient with clarity falloff
 * - World fields as continuous color gradients
 * - Muted, low-saturation palette
 */

const VERTEX_SHADER = `#version 300 es
in vec2 a_position;
out vec2 v_uv;

void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 fragColor;

// Presence uniforms
uniform vec2 u_presenceCenter;   // Normalized (0-1)
uniform float u_presenceRadius;  // Normalized
uniform float u_clarity;         // Global clarity (0-1)
uniform float u_time;            // Time for subtle animation

// Aspect ratio correction
uniform float u_aspectRatio;

// Color palette (muted, low-saturation)
const vec3 COLOR_BACKGROUND = vec3(0.08, 0.09, 0.11);
const vec3 COLOR_PRESENCE_CORE = vec3(0.35, 0.38, 0.42);
const vec3 COLOR_PRESENCE_EDGE = vec3(0.18, 0.20, 0.24);
const vec3 COLOR_CLARITY = vec3(0.45, 0.50, 0.55);
const vec3 COLOR_RISK = vec3(0.45, 0.28, 0.25);        // Warm
const vec3 COLOR_OPPORTUNITY = vec3(0.25, 0.35, 0.42); // Cool

// Noise function for organic feel
float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
        value += amplitude * noise(p);
        p *= 2.0;
        amplitude *= 0.5;
    }
    return value;
}

void main() {
    // Aspect-corrected UV
    vec2 uv = v_uv;
    vec2 correctedUV = vec2(uv.x * u_aspectRatio, uv.y);
    vec2 correctedCenter = vec2(u_presenceCenter.x * u_aspectRatio, u_presenceCenter.y);

    // Distance from presence center
    float dist = distance(correctedUV, correctedCenter);

    // Organic edge distortion
    float angle = atan(uv.y - u_presenceCenter.y, uv.x - u_presenceCenter.x);
    float edgeNoise = fbm(vec2(angle * 3.0, u_time * 0.2)) * 0.15;
    float organicRadius = u_presenceRadius * (1.0 + edgeNoise);

    // Presence falloff (soft edge)
    float presenceFalloff = smoothstep(organicRadius, organicRadius * 0.3, dist);

    // Clarity gradient (highest at center, decays outward)
    float clarityGradient = presenceFalloff * u_clarity;

    // Subtle pulsing
    float pulse = sin(u_time * 0.8) * 0.03 + 1.0;
    clarityGradient *= pulse;

    // Risk indication (increases toward edges when overextended)
    float riskZone = smoothstep(organicRadius * 0.6, organicRadius, dist);
    riskZone *= (1.0 - u_clarity) * 0.5;  // More visible when clarity is low

    // Opportunity hints (subtle gradients in mid-range)
    float opportunityZone = smoothstep(organicRadius * 0.3, organicRadius * 0.6, dist)
                          * smoothstep(organicRadius, organicRadius * 0.6, dist);

    // Background with subtle noise
    vec2 noiseCoord = uv * 8.0 + vec2(u_time * 0.05);
    float bgNoise = fbm(noiseCoord) * 0.03;
    vec3 background = COLOR_BACKGROUND + bgNoise;

    // Presence color
    vec3 presenceColor = mix(COLOR_PRESENCE_EDGE, COLOR_PRESENCE_CORE, presenceFalloff);
    presenceColor = mix(presenceColor, COLOR_CLARITY, clarityGradient * 0.4);

    // Apply risk tint
    presenceColor = mix(presenceColor, COLOR_RISK, riskZone);

    // Apply opportunity tint
    presenceColor = mix(presenceColor, COLOR_OPPORTUNITY, opportunityZone * 0.2 * u_clarity);

    // Combine
    vec3 finalColor = mix(background, presenceColor, presenceFalloff);

    // Uncertainty blur simulation (reduce contrast when clarity is low)
    float uncertainty = 1.0 - u_clarity;
    finalColor = mix(finalColor, vec3(0.15), uncertainty * 0.3 * (1.0 - presenceFalloff));

    // Output
    fragColor = vec4(finalColor, 1.0);
}
`;

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2', {
            alpha: false,
            antialias: true,
            powerPreference: 'high-performance'
        });

        if (!this.gl) {
            throw new Error('WebGL 2 not supported');
        }

        this._initShaders();
        this._initGeometry();
        this._resize();

        window.addEventListener('resize', () => this._resize());
    }

    _initShaders() {
        const gl = this.gl;

        // Compile shaders
        const vs = this._compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = this._compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);

        // Create program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vs);
        gl.attachShader(this.program, fs);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw new Error('Shader program failed to link: ' + gl.getProgramInfoLog(this.program));
        }

        // Get uniform locations
        this.uniforms = {
            presenceCenter: gl.getUniformLocation(this.program, 'u_presenceCenter'),
            presenceRadius: gl.getUniformLocation(this.program, 'u_presenceRadius'),
            clarity: gl.getUniformLocation(this.program, 'u_clarity'),
            time: gl.getUniformLocation(this.program, 'u_time'),
            aspectRatio: gl.getUniformLocation(this.program, 'u_aspectRatio')
        };

        // Get attribute location
        this.positionAttrib = gl.getAttribLocation(this.program, 'a_position');
    }

    _compileShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compilation failed: ' + info);
        }

        return shader;
    }

    _initGeometry() {
        const gl = this.gl;

        // Full-screen quad
        const positions = new Float32Array([
            -1, -1,
             1, -1,
            -1,  1,
             1,  1
        ]);

        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        gl.enableVertexAttribArray(this.positionAttrib);
        gl.vertexAttribPointer(this.positionAttrib, 2, gl.FLOAT, false, 0, 0);

        gl.bindVertexArray(null);
    }

    _resize() {
        const dpr = window.devicePixelRatio || 1;
        const width = this.canvas.clientWidth * dpr;
        const height = this.canvas.clientHeight * dpr;

        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.gl.viewport(0, 0, width, height);
        }

        this.aspectRatio = width / height;
    }

    /**
     * Render the game state
     * @param {Object} state - Game state containing presence, clarity, time
     */
    render(state) {
        const gl = this.gl;

        gl.clearColor(0.08, 0.09, 0.11, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(this.program);
        gl.bindVertexArray(this.vao);

        // Set uniforms
        gl.uniform2f(this.uniforms.presenceCenter, state.presence.x, state.presence.y);
        gl.uniform1f(this.uniforms.presenceRadius, state.presence.radius);
        gl.uniform1f(this.uniforms.clarity, state.clarity);
        gl.uniform1f(this.uniforms.time, state.time);
        gl.uniform1f(this.uniforms.aspectRatio, this.aspectRatio);

        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindVertexArray(null);
    }

    /**
     * Get canvas dimensions for input coordinate conversion
     */
    getDimensions() {
        return {
            width: this.canvas.clientWidth,
            height: this.canvas.clientHeight
        };
    }
}
