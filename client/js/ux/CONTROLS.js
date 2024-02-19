import {
	OrbitControls,
} from 'three/addons/controls/OrbitControls.js'
import {
	Vector3,
	Group,
} from 'three'
import CAMERA from '../three/CAMERA.js'
import RENDERER from '../three/RENDERER.js'
import BROKER from '../EventBroker.js'


// window.ORBIT = OrbitControls

// const init = ( target ) => {
// const controls = new OrbitControls( CAMERA, RENDERER.domElement )
// window.FOLLOW_BOX = new Group()
const controls = new OrbitControls( CAMERA, RENDERER.domElement )
controls.target = new Vector3()
controls.enablePan = false
controls.minDistance = 2

controls.enableDamping = true
controls.dampingFactor = 0.37


const enable = event => {
	controls.enabled = true
}
const disable = event => {
	controls.enabled = false
	// controls.removeAllPointers()
}


// }

// const controls = {
// 	update: () => {
// 		//
// 	}
// }

BROKER.subscribe('CONTROLS_ENABLE', enable )
BROKER.subscribe('CONTROLS_DISABLE', disable )

export default controls 