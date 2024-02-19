import BROKER from './EventBroker.js'
import SCENE from './three/SCENE.js'
import CAMERA from './three/CAMERA.js'
import RENDERER from './three/RENDERER.js'



class Game {
	constructor( init ){
		init = init || {}
		this.PLAYERS = {}
	}

	init_user( user ){
		const {
			slug,
			handle,
			color,
		} = user

		if( this.PLAYERS[ slug ] ) return console.error('redundant player init', user )

		this.PLAYERS[ slug ] = user

	}

}

// init
const game = new Game()




// events

const init_user = event => {
	const {
		data,
	} = event
	const {
		user,
	} = data
	game.init_user( user )
}



BROKER.subscribe('INIT_USER', init_user )

export default game