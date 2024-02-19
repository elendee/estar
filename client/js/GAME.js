import BROKER from './EventBroker.js'
import SCENE from './three/SCENE.js'
import CAMERA from './three/CAMERA.js'
import GLOBAL from './GLOBAL.js'
import RENDERER from './three/RENDERER.js'
import * as LIGHT from './three/LIGHT.js'
import STATE from './STATE.js'
// import animate from './three/animate.js'
import Player from './classes/Player.js'
import OceanPoint from './classes/OceanPoint.js'
import {
	composeAnimate,
} from './three/ComposerSelectiveBloom.js'
import {
	Vector3,
} from 'three'
import KEYS from './ux/KEYS.js'
import * as lib from './lib.js'
import CONTROLS from './ux/CONTROLS.js'











const NOISE_RANGE = GLOBAL.OCEAN_SCALAR





let then, now, delta, delta_seconds = 0 

const animate = () => {

	now = performance.now()

	delta = now - then

	delta_seconds = delta / 1000

	then = now 

	// for( const uuid in ASTEROIDS ){
	// 	ASTEROIDS[ uuid ].update( delta_seconds )
	// }

	if( !STATE.animating ){
		return console.log('animation off')
	}

	// if( game.player1.BOX ){
	// 	game.player1.BOX.position.copy( PLAYER.GROUP.position )
	// 	game.player1.BOX.position.y += PLAYER.head_height
	// }

	game.update( delta_seconds )

	CONTROLS.update()

	requestAnimationFrame( animate )

	// RENDERER.render( SCENE, CAMERA )
	composeAnimate()

}


const animate_start = event => {
	STATE.animating = true
	animate()
}










class Game {

	constructor( init ){
		init = init || {}
		this.PLAYERS = {}
		this.player1 = false
		this.ocean = false
		this.ocean_size = 10
	}

	init_user( zone_data, user_data ){
		const {
			slug,
			handle,
			color,
		} = user_data

		if( this.PLAYERS[ slug ] ) return console.error('redundant player init', user_data )

		// init player data / obj
		this.PLAYERS[ slug ] = new Player( user_data )
		this.player1 = this.PLAYERS[ slug ]
		this.player1.player1 = true

		// init threejs objs
		this.player1.construct_model()
		.then( res => {
			SCENE.add( this.player1.BOX )
			// this.player1.BOX.add( CAMERA )
			this.player1.BOX.add( this.player1.wiremesh )

			CONTROLS.target = this.player1.BOX.position

			CAMERA.position.y = 15
			CAMERA.position.z = 20
			CAMERA.lookAt( this.player1.BOX.position )
		})

	}

	touch_ocean(){

		if( this.ocean ) return this.ocean

		this.ocean = []

		for( let x = 0; x < this.ocean_size; x++ ){
			this.ocean[x] = []
			for( let y = 0; y < this.ocean_size; y++ ){
				this.ocean[x][y] = []
				for( let z = 0; z < this.ocean_size; z++ ){
					this.ocean[x][y][z] = []
				}
			}
		}

		for( let x = 0; x < this.ocean_size; x++ ){
			for( let y = 0; y < this.ocean_size; y++ ){
				for( let z = 0; z < this.ocean_size; z++ ){
					let op;
					this.ocean[x][y][z] = op = new OceanPoint({
						x,
						y,
						z,
					})
					op.wiremesh = lib.extract_wiremesh( op.mesh, '#ffffff', .1 )
					op.wiremesh.scale.multiplyScalar( 5 )
					SCENE.add( op.wiremesh ) // op.mesh
					op.wiremesh.position.set( 
						x * GLOBAL.OCEAN_SCALAR, 
						y * GLOBAL.OCEAN_SCALAR, 
						z * GLOBAL.OCEAN_SCALAR
					)
				}
			}
		}
	}

	handle_ocean( data ){
		const {
			level
		} = data

		this.touch_ocean()

		noise.seed( level )

		for( let x = 0; x < this.ocean.length; x++ ){
			for( let y = 0; y < this.ocean[x].length; y++ ){
				for( let z = 0; z < this.ocean[x].length; z++ ){

					const value = noise.simplex3( x / 100, y / 100, z / 100 )

					const x_pos = x * GLOBAL.OCEAN_SCALAR
					const y_pos = ( y * GLOBAL.OCEAN_SCALAR ) + ( ( -NOISE_RANGE / 2 ) + ( value * NOISE_RANGE ) )
					const z_pos = z * GLOBAL.OCEAN_SCALAR

					this.ocean[x][y][z].float_point = new Vector3( x_pos,  y_pos, z_pos )

					// if( !x && !y && !z ){
					// 	console.log('sample point: ', this.ocean[x][y][z] )
					// }
					// if( value ) debugger
				}
			}
		}

	}

	update( delta_seconds ){
		if( this.ocean ){
			// ocean waves
			for( let x = 0; x < this.ocean_size; x++ ){
				for( let y = 0; y < this.ocean_size; y++ ){
					for( let z = 0; z < this.ocean_size; z++ ){
						this.ocean[x][y][z].update( delta_seconds )
					}
				}
			}			
		}

		if( this.player1 ){
			this.player1.update( delta_seconds )
		}

	}

}

















// events

const init_user = event => {
	const {
		data,
	} = event
	const {
		zone,
		user,
	} = data
	game.init_user( zone, user )
}

const handle_ocean = event => {
	const { data } = event
	game.handle_ocean( data )
}

const move_key = event => {
	if( !game.player1 ) return;
	game.player1.handle_move( event )
}



BROKER.subscribe('INIT_USER', init_user )
BROKER.subscribe('UPDATE_OCEAN', handle_ocean )
BROKER.subscribe('ANIMATE_START', animate_start )
BROKER.subscribe('MOVE_KEY', move_key )









// init
const game = new Game()

KEYS.init()

SCENE.add( CAMERA )
SCENE.add( LIGHT.hemispherical )
BROKER.publish('ANIMATE_START')








export default game