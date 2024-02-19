import env from '../.env.js'
import log from '../log.js'
import lib from '../lib.js'
import DB from '../db.js'
import Model from '../models/Model.js'
import BROKER from '../EventBroker.js'



const PULSE_TIME = ( env.LOCAL ? 2 : 10 ) * 1000

class Zone extends Model {
	constructor( init ){
		super( init )
		init = init || {}
		this.uuid = lib.validate_string( init.uuid, undefined )
		this.name = lib.validate_string( init.name, undefined )

		// instantiated
		this._PLAYERS = {}

	}

	async init(){
		if( !this._pulse ){
			this._pulse = setInterval(() => {
				log('zone', 'pulse')
				if( !Object.keys( this._PLAYERS ).length ){
					BROKER.publish('ZONE_CLOSE', {
						uuid: this.uuid,
					})
				}
			}, PULSE_TIME )
		}
	}


	close(){
		for( const uuid in this._PLAYERS ){
			BROKER.publish('SOCKET_DISCONNECT', {
				socket: this._PLAYERS[uuid]._socket,
			})
		}
	}

	async save(){

		const update_fields = [
			'name',
			'uuid',
		]

		const update_vals = [ 
			this.name,
			this.uuid,
		]

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

}


export default Zone