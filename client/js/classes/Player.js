import env from '../env.js'
import * as lib from '../lib.js'
import {
    BoxGeometry,
	Group,
    MeshPhongMaterial,
    Mesh,
    // Vector2,
    Vector3,
} from 'three'
import { 
	GLTFLoader,
} from 'three/addons/loaders/GLTFLoader.js';
import SceneObject from './SceneObject.js'


class Player extends SceneObject {
	constructor( init ){
		super( init )
		init = init || {}
		for( const key in init ){
			this[ key ] = init[ key ]
		}
		this.type = 'player'
		this.mode = 'walking'
		this.has_pre = false
		this._pre_position = new Vector3()

	}

	async construct_model(){
		const loader = new GLTFLoader()
		this.player_model = await new Promise((resolve, reject ) => {
			const model_url = env.MODEL_DIR + '/' + this.model_url
			loader.load( model_url, ( gltf ) => {
				resolve( gltf.scene )
			})
		})
		this.wiremesh = lib.extract_wiremesh( this.player_model, '#aaaaff', .05 )
	}

	player_construction(){
		const group = new Group()
		const arms = []
		for( let i = 0; i < 2; i++ ){
			const geo = new BoxGeometry(1,1,1)
			const mat = new MeshPhongMaterial({
				color: 'red',
			})
			arms[i] = new Mesh( geo, mat )
			arms[i].position.x = -1 + ( i * 2 )
			group.add( arms[i] )
		}
		this.ship_model = group
	}

	_custom_update( delta_seconds ){

		// follow cam
		if( this.has_pre && this._pre_position ){
			const diff = this._pre_position.subVectors( this.BOX.position, this._pre_position )
			CAMERA.position.add( diff )
		}
		this._pre_position.copy( this.BOX.position )
		this.has_pre = true

	}

}


export default Player