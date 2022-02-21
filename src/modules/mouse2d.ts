import * as THREE from 'three';

export class Mouse2D {
	private _mouse = new THREE.Vector2(0, 0)

	constructor(private _clientWidth = window.innerWidth, private _clientHeight = window.innerHeight) {
		window.addEventListener('mousemove', this._handleMousemove)
	}

	private _handleMousemove = (e: MouseEvent) => {
		this._mouse.set(e.clientX, e.clientY)
	}

	get NormalizedPosition() {
		const nx = this._mouse.x / this._clientWidth
		const ny = 1 - this._mouse.y / this._clientHeight
		return new THREE.Vector2(nx, ny)
	}

	updateClientDimension = (width: number, height: number) => {
		this._clientWidth = width
		this._clientHeight = height
	}

	dispose = () => {
		window.removeEventListener('mousemove', this._handleMousemove)
	}
}
