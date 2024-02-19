import {
	composeAnimate,
} from './ComposerSelectiveBloom.js'
import BROKER from '../EventBroker.js'
// import GLOBAL from '../GLOBAL.js'
import STATE from '../STATE.js'
import GAME from '../GAME.js'



let then, now, delta, delta_seconds = 0 



const animate = () => {

	now = performance.now()

	delta = now - then

	delta_seconds = delta / 1000

	then = now 

	// for( const uuid in ASTEROIDS ){
	// 	ASTEROIDS[ uuid ].update( delta_seconds )
	// }
	GAME.update( delta_seconds )

	if( !STATE.animating ){
		return console.log('animation off')
	}

	requestAnimationFrame( animate )

	// RENDERER.render( SCENE, CAMERA )
	composeAnimate()

}


const animate_start = event => {
	STATE.animating = true
	animate()
}


// const environment_update = delta_seconds => {

// 	SUN.ele.position.set( 
// 		SHIP.box.position.x + GLOBAL.RENDER.SUN_DIST,
// 		SHIP.box.position.y + GLOBAL.RENDER.SUN_DIST,
// 		SHIP.box.position.z + GLOBAL.RENDER.SUN_DIST,
// 	)

// }


BROKER.subscribe('ANIMATE_START', animate_start )


export default animate