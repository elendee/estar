import env from '../env.js'
// import GLOBAL from '../GLOBAL.js'
import { 
	Scene, 
	Color, 
	FogExp2, 
	AxesHelper 
} from 'three'


const scene = new Scene()

if( env.EXPOSE ) window.SCENE = scene

scene.background = new Color( 0x223344 )
// scene.fog = new FogExp2( 0x000000, .00003 )

// if( env.AXES ){
// 	let axesHelper = new AxesHelper( 5 )
// 	scene.add( axesHelper )
// }

export default scene

