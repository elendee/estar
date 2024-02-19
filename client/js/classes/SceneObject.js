import {
// 	Mesh,
	Group,
// 	// WireframeGeometry,
// 	// LineSegments,
} from 'three'



class SceneObject {
	constructor( init ){
		init = init || {}

		this.movement = init.movement || {
			x: 0,
			y: 0,
			z: 0,
			spin: 0,
		}

		this.BOX = init.BOX || new Group()

		this.speed = 10

		this.mode = 'walking'

	}

	handle_move( event ){

		const {
			type,
			state,
		} = event

		switch( type ){

		case 'strafe_left':
			this.movement.x = state ? -1 : 0
			break;
		case 'strafe_right':
			this.movement.x = state ? 1 : 0
			break;d
		case 'thrust_forward':
			this.movement.z = state ? -1 : 0
			break;
		case 'thrust_back':
			this.movement.z = state ? 1 : 0
			break;
		case 'roll_cw':
			this.movement.spin = state ? 1 : 0
			break;
		case 'roll_ccw':
			this.movement.spin = state ? -1 : 0
			break;
		default:
			return console.error('unhandled move key', event )
		}

	}

	update( delta_seconds ){

		switch( this.mode ){

		case 'flying':
			if( this.movement.x ){
				this.BOX.position.x += ( this.speed * delta_seconds ) * this.movement.x
			}
			break;

		case 'walking':
			if( this.movement.x ){
				this.BOX.position.x += ( this.speed * delta_seconds ) * this.movement.x
			}
			if( this.movement.z ){
				this.BOX.position.z += ( this.speed * delta_seconds ) * this.movement.z
			}
			break;

		default: 
			return console.error('unknown SceneObject mode', this.mode )
		}

		if( this._custom_update ) this._custom_update( delta_seconds )

	}

}


export default SceneObject