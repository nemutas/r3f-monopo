import { Geometries } from './store';

export type GeometryType = typeof Geometries[number]

export type GeometryAnimationState = {
	current: GeometryType
	next: () => GeometryType
	prev: () => GeometryType
	enabledAniamtion: boolean
}
