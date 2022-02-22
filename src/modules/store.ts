import { proxy } from 'valtio';
import { GeometryAnimationState } from './types';

export const loadState = proxy({ completed: false })

export const backgroundSphereState = {
	patternScale: 0.1,
	patternBias1: 0.5,
	patternBias2: 0.1,
	firstColor: '#789e71',
	secondColor: '#e09442',
	accentColor: '#000'
}

export const innerGeometryState = {
	refractionRatio: 1.02,
	fresnelBias: 0.1,
	fresnelScale: 2,
	fresnelPower: 1
}

export const geometryAnimationState: GeometryAnimationState = {
	current: 'Sphere',
	next: () => {
		const currentIndex = Geometries.findIndex(geo => geo === geometryAnimationState.current)
		const nextIndex = currentIndex < Geometries.length - 1 ? currentIndex + 1 : 0
		return Geometries[nextIndex]
	},
	prev: () => {
		const currentIndex = Geometries.findIndex(geo => geo === geometryAnimationState.current)
		const prevIndex = currentIndex > 0 ? currentIndex - 1 : Geometries.length - 1
		return Geometries[prevIndex]
	},
	enabledAniamtion: false
}

export const Geometries = ['Sphere', 'Torus', 'Teapot', 'Rabbit'] as const
