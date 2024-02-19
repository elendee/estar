import env from '../env.js'
import GLOBAL from '../GLOBAL.js'

import SCENE from './SCENE.js'
import RENDERER from './RENDERER.js'

import { 

	// MeshBasicMaterial, 
	// BackSide, 
	// BoxBufferGeometry,
	// // CubeGeometry, 
	// TextureLoader,
	// Mesh,

	// hdr
    ACESFilmicToneMapping,
    // UnsignedByteType,
	// LinearFilter,
	PMREMGenerator,
	CubeTextureLoader,
	sRGBEncoding,

} from '/three-patch/build/three.module.js'

// import { HDRCubeTextureLoader } from '/inc/HDRCubeTextureLoader.js';




const init_skybox = async( skybox_url ) => {

	if( 0 && env.LOCAL ){
		console.log('local skip skybox')
		return true
	}

	if( env.HDR_SKYBOX ){
		RENDERER.physicallyCorrectLights = true
		RENDERER.toneMapping = ACESFilmicToneMapping;		
	}

	const hdrImgUrls = GLOBAL.SKYBOXES[ skybox_url ]

	let hdrCubeRenderTarget

	let pmremGenerator

	if( env.HDR_SKYBOX ){
		pmremGenerator = new PMREMGenerator( RENDERER ); 
		pmremGenerator.compileCubemapShader();
	}

	const cubeMap = await new Promise(( resolve, reject ) => {
		const cubeMap = new CubeTextureLoader()
		.setPath('/resource/textures/skybox/' + skybox_url + '/' ) 
		.load( hdrImgUrls, () => {

			if( env.HDR_SKYBOX ){

				hdrCubeRenderTarget = pmremGenerator.fromCubemap( cubeMap );

				cubeMap.encoding = sRGBEncoding;

				SCENE.environment = hdrCubeRenderTarget.texture
				
			}

			resolve( cubeMap )

		})
	})

	SCENE.background = cubeMap;

}


export {
	init_skybox,
}
