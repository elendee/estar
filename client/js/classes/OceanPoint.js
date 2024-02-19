import {
	BoxGeometry,
	MeshStandardMaterial,
	Mesh,
	Group,
    // Vector2,
    Vector3,
} from 'three'

const geo = new BoxGeometry( 1, 1, 1)
const mat = new MeshStandardMaterial({
	// color: 'yellow',
	color: 'white',
})


class OceanPoint {
	constructor( init ){
		init = init || {}
		this.x = init.x
		this.y = init.y
		this.z = init.z

		this.mesh = new Mesh( geo, mat )
		this.float_point = new Vector3()

	}

	update( delta_seconds ){
		// this.mesh.position.lerp( this.float_point, delta_seconds * .1 )
		this.wiremesh.position.lerp( this.float_point, delta_seconds * .1 )
	}

}


export default OceanPoint