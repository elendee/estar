import {
	Raycaster,
} from '/three-patch/build/three.module.js'
import CAMERA from './CAMERA.js'

import env from '../env.js'

const raycaster = new Raycaster(); 
raycaster.camera = CAMERA

if( !env.LOCAL ) document.getElementById('dev').remove()//.style.display = 'none'

export default raycaster