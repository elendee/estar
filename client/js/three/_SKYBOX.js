import env from '../../env.js'
import GLOBAL from '../../GLOBAL.js'

import { 
	MeshBasicMaterial, 
	BackSide, 
	BoxBufferGeometry,
	// CubeGeometry, 
	TextureLoader,
	Mesh,
} from '/three-patch/build/three.module.js'





const box_path = '/resource/textures/skybox/'

const box_variation = 'skybox1/'

// const directions  = ['ft', 'bk', 'up', 'dn', 'rt', 'lt']

let skyGeometry = new BoxBufferGeometry( 
	GLOBAL.RENDER.SKY_WIDTH, 
	GLOBAL.RENDER.SKY_WIDTH, 
	GLOBAL.RENDER.SKY_WIDTH 
)	
let materialArray = new Array(6)

const loader = new TextureLoader()

const single = true

if( single ){
	// single texture
	let single_tex
	loader.load('/resource/textures/skybox/starfield.jpg', tex => {

		single_tex = tex

		const single_mat = new MeshBasicMaterial({
			map: single_tex,
			side: BackSide,
			fog: false
		})
		for(let i = 0; i < 6; i++ ){
			materialArray[i] = single_mat
		}
	})
	
}else{

	// or full skybox texture
	for(let i = 0; i < 6; i++ ){
		// loader.load( '/resource/textures/skybox/starfield.jpg', function(tex){
		loader.load( box_path + box_variation + [i+1] + '.jpg', tex => {
			materialArray[i] =  new MeshBasicMaterial({
				map: tex,
				side: BackSide,
				fog: false
			})		
		} )
	}

}

	
const skyBox = new Mesh( skyGeometry, materialArray )
skyBox.userData.type = 'skybox'



if( env.EXPOSE ) window.SKYBOX = skyBox


export default skyBox
