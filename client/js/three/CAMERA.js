import env from '../env.js'

// import GLOBAL from '../GLOBAL.js'
import { 
	PerspectiveCamera,
	Group,
} from 'three'




const camera = new PerspectiveCamera( 
	30, 
	window.innerWidth / window.innerHeight, 
	1, 
	10000
	// GLOBAL.RENDER.VIEW 
)
// camera.position.set( 0, 300, -40 );

camera.yaw = {}

camera.fixture = new Group()

if( env.EXPOSE ){
	window.CAMERA = camera
}

// camera.up = new THREE.Vector3(0, 0, 1)

// controls.maxPolarAngle = Math.PI / 1.97;
// controls.maxPolarAngle = Math.PI / 2;

export default camera

