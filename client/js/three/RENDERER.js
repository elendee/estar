import GLOBAL from '../GLOBAL.js'
import env from '../env.js'
import {
	WebGLRenderer,
	sRGBEncoding,
	// PCFSoftShadowMap,
} from 'three'
import CAMERA from './CAMERA.js'


const ls_nuke = localStorage.getItem('scalene-nuke-res') ? true : false

const saved_res = localStorage.getItem('estar-settings-res-key')

GLOBAL.CURRENT_RES = GLOBAL.RESOLUTIONS[ saved_res || GLOBAL.RES_DEFAULT ]

const set_renderer = window.set_renderer = ( r, init ) => {
	// if( !init ) return false
	// console.log('set renderer: ', GLOBAL.RENDER.RES_KEY )
	// GLOBAL.RENDER.RESOLUTIONS[ GLOBAL.RENDER.RES_KEY ]

	r.setSize( 
		window.innerWidth / ( ls_nuke ? 8 : GLOBAL.CURRENT_RES ), 
		window.innerHeight / ( ls_nuke ? 8 : GLOBAL.CURRENT_RES ), 
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
