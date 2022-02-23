import gsap from 'gsap';
import React, { useCallback, useMemo, useRef, VFC } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { cnoise31 } from '../modules/glsl';
import { GUIController } from '../modules/gui';
import { geometryAnimationState, innerGeometryState } from '../modules/store';
import { getPublicPath } from '../modules/utils';

export const InnerGeometries: VFC = () => {
	// add controller
	const gui = GUIController.instance.setFolder('Geometry')
	gui.addNumericSlider(innerGeometryState, 'refractionRatio', 0.5, 2, 0.01, 'Refraction Ratio')
	gui.addNumericSlider(innerGeometryState, 'fresnelBias', 0, 1, 0.01, 'Fresnel Bias')
	gui.addNumericSlider(innerGeometryState, 'fresnelScale', 0, 5, 0.01, 'Fresnel Scale')
	gui.addNumericSlider(innerGeometryState, 'fresnelPower', 0, 5, 0.01, 'Fresnel Power')

	// create refs
	const parentRef = useRef<THREE.Group>(null)

	const refs = {
		Sphere: useRef<THREE.Group>(null),
		Torus: useRef<THREE.Group>(null),
		Teapot: useRef<THREE.Group>(null),
		Rabbit: useRef<THREE.Group>(null)
	}

	// create geometries
	const sphereGeometry = new THREE.IcosahedronGeometry(0.4, 20)
	const torusGeometry = new THREE.TorusGeometry(0.4, 0.1, 50, 100)

	const teapot = useGLTF(getPublicPath('/assets/models/Teapot.glb'))
	const teapotGeometry = (teapot.nodes.Teapot as THREE.Mesh).geometry

	const rabbit = useGLTF(getPublicPath('/assets/models/Stanford_Bunny.glb'))
	const rabbitGeometry = (rabbit.nodes.Rabbit as THREE.Mesh).geometry

	// create animation
	const animation = useCallback(() => {
		const currentMesh = refs[geometryAnimationState.current]
		const nextMesh = refs[geometryAnimationState.next()]

		nextMesh.current!.visible = true

		const tl = gsap.timeline({
			onComplete: () => {
				geometryAnimationState.current = geometryAnimationState.next()
				currentMesh.current!.visible = false
			}
		})
		tl.to(currentMesh.current!.scale, { x: 0, y: 0, z: 0, duration: 0.5, ease: 'power4.out' })
		tl.to(nextMesh.current!.scale, { x: 1, y: 1, z: 1, duration: 1, ease: 'elastic.out(1, 0.3)' }, '< 0.2')
	}, [])

	// frame loop
	const vec3 = new THREE.Vector3()
	useFrame(({ mouse, viewport }) => {
		// aniamtion
		if (geometryAnimationState.enabledAniamtion) {
			animation()
			geometryAnimationState.enabledAniamtion = false
		}

		// mouse motion
		const x = (mouse.x * viewport.width) / 2
		const y = (mouse.y * viewport.height) / 2
		vec3.lerp(new THREE.Vector3(x, y, 1), 0.2)
		parentRef.current!.lookAt(vec3)
	})

	return (
		<group ref={parentRef}>
			<group ref={refs.Sphere}>
				<InnerGeometry geometry={sphereGeometry} />
			</group>
			<group ref={refs.Torus} visible={false} scale={0}>
				<InnerGeometry geometry={torusGeometry} />
			</group>
			<group ref={refs.Teapot} visible={false} scale={0}>
				<InnerGeometry geometry={teapotGeometry} />
			</group>
			<group ref={refs.Rabbit} visible={false} scale={0}>
				<InnerGeometry geometry={rabbitGeometry} />
			</group>
		</group>
	)
}

// ========================================================
type InnerGeometryProps = {
	geometry: THREE.BufferGeometry
	scale?: number
	position?: [number, number, number]
}

const InnerGeometry: VFC<InnerGeometryProps> = props => {
	const { geometry, scale = 1, position = [0, 0, 0] } = props

	const meshRef = useRef<THREE.Mesh>(null)

	const { cubeRenderTarget, cubeCamera } = useMemo(() => {
		// create cube render target
		const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
			format: THREE.RGBAFormat,
			generateMipmaps: true,
			minFilter: THREE.LinearMipMapLinearFilter,
			encoding: THREE.sRGBEncoding
		})
		// create cube camera
		const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget)
		return { cubeRenderTarget, cubeCamera }
	}, [])

	const shader: THREE.Shader = {
		uniforms: {
			tCube: { value: null },
			u_RefractionRatio: { value: innerGeometryState.refractionRatio },
			u_FresnelBias: { value: innerGeometryState.fresnelBias },
			u_FresnelScale: { value: innerGeometryState.fresnelScale },
			u_FresnelPower: { value: innerGeometryState.fresnelPower },
			u_time: { value: 0 }
		},
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	}

	useFrame(({ gl, scene }) => {
		meshRef.current!.visible = false
		cubeCamera.update(gl, scene)
		meshRef.current!.visible = true
		shader.uniforms.tCube.value = cubeRenderTarget.texture

		shader.uniforms.u_RefractionRatio.value = innerGeometryState.refractionRatio
		shader.uniforms.u_FresnelBias.value = innerGeometryState.fresnelBias
		shader.uniforms.u_FresnelScale.value = innerGeometryState.fresnelScale
		shader.uniforms.u_FresnelPower.value = innerGeometryState.fresnelPower
		shader.uniforms.u_time.value += 0.01
	})

	return (
		<mesh ref={meshRef} geometry={geometry} position={position} scale={scale}>
			<shaderMaterial args={[shader]} side={THREE.DoubleSide} />
		</mesh>
	)
}

// ========================================================
// shader

const vertexShader = `
uniform float u_RefractionRatio;
uniform float u_FresnelBias;
uniform float u_FresnelScale;
uniform float u_FresnelPower;
uniform float u_time;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

${cnoise31}

float noise(vec3 n) {
  return cnoise31(n * 2.0 + u_time) * 0.05;
}

void main() {
  vec3 pos = position;
  vec3 norm = normal;

  pos += noise(pos);
  norm += noise(norm);

  vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
  vec4 worldPosition = modelMatrix * vec4( pos, 1.0 );

  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * norm );

  vec3 I = worldPosition.xyz - (cameraPosition + 0.001);

  vReflect = reflect( I, worldNormal );
  vRefract[0] = refract( normalize( I ), worldNormal, u_RefractionRatio );
  vRefract[1] = refract( normalize( I ), worldNormal, u_RefractionRatio * 0.99 );
  vRefract[2] = refract( normalize( I ), worldNormal, u_RefractionRatio * 0.98 );
  vReflectionFactor = u_FresnelBias + u_FresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), u_FresnelPower );

  gl_Position = projectionMatrix * mvPosition;
}
`

const fragmentShader = `
uniform samplerCube tCube;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

void main() {
  vec4 reflectedColor = textureCube( tCube, vec3( -vReflect.x, vReflect.yz ) );
  vec4 refractedColor = vec4( 1.0 );

  refractedColor.r = textureCube( tCube, vec3( -vRefract[0].x, vRefract[0].yz ) ).r;
  refractedColor.g = textureCube( tCube, vec3( -vRefract[1].x, vRefract[1].yz ) ).g;
  refractedColor.b = textureCube( tCube, vec3( -vRefract[2].x, vRefract[2].yz ) ).b;

  gl_FragColor = mix( refractedColor, reflectedColor, clamp( vReflectionFactor, 0.0, 1.0 ) );
}
`
