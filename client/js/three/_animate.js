import {
	composeAnimate,
} from './ComposerSelectiveBloom.js'
// import GLOBAL from '../GLOBAL.js'
import STATE from '../STATE.js'



let then, now, delta, delta_seconds = 0 



const animate = () => {

	now = performance.now()

	delta = now - then

	delta_seconds = delta / 1000

	then = now 

	for( const uuid in ASTEROIDS ){
		ASTEROIDS[ uuid ].update( delta_seconds )
	}

	if( !STATE.animating ){
		return console.log('animation off')
	}

	requestAnimationFrame( animate )

	// RENDERER.render( SCENE, CAMERA )
	composeAnimate()

}



// const environment_update = delta_seconds => {

// 	SUN.ele.position.set( 
// 		SHIP.box.position.x + GLOBAL.RENDER.SUN_DIST,
// 		SHIP.box.position.y + GLOBAL.RENDER.SUN_DIST,
// 		SHIP.box.position.z + GLOBAL.RENDER.SUN_DIST,
// 	)

// }




export default animate