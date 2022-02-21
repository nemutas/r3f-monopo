import React, { VFC } from 'react';
import * as THREE from 'three';
import { Icosahedron } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { noise31 } from '../modules/glsl';
import { GUIController } from '../modules/gui';
import { backgroundSphereState } from '../modules/store';

export const BackgroundSphere: VFC = () => {
	const gui = GUIController.instance.setFolder('Background')
	gui.addNumericSlider(backgroundSphereState, 'patternScale', 0.01, 1, 0.01, 'Pattern Scale')
	gui.addNumericSlider(backgroundSphereState, 'patternBias1', 0, 1, 0.01, 'Pattern Bias1')
	gui.addNumericSlider(backgroundSphereState, 'patternBias2', 0, 1, 0.01, 'Pattern Bias2')
	gui.addColor(backgroundSphereState, 'firstColor', undefined, 'First Color')
	gui.addColor(backgroundSphereState, 'secondColor', undefined, 'Second Color')
	gui.addColor(backgroundSphereState, 'accentColor', undefined, 'Accent Color')

	const shader: THREE.Shader = {
		uniforms: {
			u_time: { value: 0 },
			u_patternScale: { value: backgroundSphereState.patternScale },
			u_patternBias1: { value: backgroundSphereState.patternBias1 },
			u_patternBias2: { value: backgroundSphereState.patternBias2 },
			u_firstColor: { value: new THREE.Color(backgroundSphereState.firstColor) },
			u_secondColor: { value: new THREE.Color(backgroundSphereState.secondColor) },
			u_accentColor: { value: new THREE.Color(backgroundSphereState.accentColor) }
		},
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	}

	useFrame(() => {
		shader.uniforms.u_time.value += 0.01
		shader.uniforms.u_patternScale.value = backgroundSphereState.patternScale
		shader.uniforms.u_patternBias1.value = backgroundSphereState.patternBias1
		shader.uniforms.u_patternBias2.value = backgroundSphereState.patternBias2
		shader.uniforms.u_firstColor.value.set(backgroundSphereState.firstColor)
		shader.uniforms.u_secondColor.value.set(backgroundSphereState.secondColor)
		shader.uniforms.u_accentColor.value.set(backgroundSphereState.accentColor)
	})

	return (
		<Icosahedron args={[1.5, 20]}>
			<shaderMaterial args={[shader]} side={THREE.DoubleSide} />
		</Icosahedron>
	)
}

// ========================================================
// shader

const vertexShader = `
varying vec3 v_pos;

void main() {
  v_pos = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`

const fragmentShader = `
uniform float u_time;
uniform float u_patternScale;
uniform float u_patternBias1;
uniform float u_patternBias2;
uniform vec3 u_firstColor;
uniform vec3 u_secondColor;
uniform vec3 u_accentColor;
varying vec3 v_pos;

${noise31}

float lines(vec2 uv, float offset) {
  float val = abs(0.5 * (sin(uv.x * 30.0) + offset * 2.0));
  return smoothstep(0.0, 0.5 + offset * 0.5, val);
}

mat2 rotate2D(float angle) {
  return mat2(
    cos(angle), -sin(angle),
    sin(angle), cos(angle)
  );
}

void main() {
  float n = noise31(v_pos + u_time);

  vec2 baseUV = rotate2D(n) * v_pos.xy * u_patternScale;
  float basePattern = lines(baseUV, u_patternBias1);
  float secondPattern = lines(baseUV, u_patternBias2);

  vec3 baseColor = mix(u_secondColor, u_firstColor, basePattern);
  vec3 secondBaseColor = mix(baseColor, u_accentColor, secondPattern);

  gl_FragColor = vec4(secondBaseColor, 1.0);
}
`
