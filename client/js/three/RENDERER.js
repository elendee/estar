// import GLOBAL from '../GLOBAL.js'
import env from '../env.js'
import {
	WebGLRenderer,
	sRGBEncoding,
	// PCFSoftShadowMap,
} from 'three'
import CAMERA from './CAMERA.js'
// import GLOBAL from '../../GLOBAL.js'


const ls_nuke = localStorage.getItem('scalene-nuke-res') ? true : false


const set_renderer = window.set_renderer = ( r, init ) => {
	// if( !init ) return false
	// console.log('set renderer: ', GLOBAL.RENDER.RES_KEY )
	const config_res = 1
	// GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ]

	r.setSize( 
		window.innerWidth / ( ls_nuke ? 8 : config_res ), 
		window.innerHeight / ( ls_nuke ? 8 : config_res ), 
		false 
	)
}

const renderer = new WebGLRenderer( { 
	antialias: true,
	alpha: true
})

renderer.outputEncoding = sRGBEncoding

renderer.setPixelRatio( window.devicePixelRatio )
set_renderer( renderer, true )


renderer.shadowMap.enabled = true
// renderer.shadowMap.type = PCFSoftShadowMap

renderer.domElement.id = 'sky-canvas'
renderer.domElement.tabindex = 1

renderer.onWindowResize = function(){

	CAMERA.aspect = window.innerWidth / window.innerHeight
	CAMERA.updateProjectionMatrix()

	set_renderer( renderer )

}

window.addEventListener( 'resize', renderer.onWindowResize, false )

if( env.EXPOSE ) window.RENDERER = renderer

document.body.append( renderer.domElement )

renderer.onWindowResize()

export default renderer
