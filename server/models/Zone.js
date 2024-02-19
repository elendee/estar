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
		this._intervals = {
			waves: false,
			sweep: false,
		}

	}

	async _bring_online( game ){

		if( !game ) log('flag', `must provide Game to zone.bring online`)

		// sweep
		if( !this._intervals.sweep ){
			this._intervals.sweep = setInterval(() => {
				log('zone', 'pulse')
				if( !Object.keys( this._PLAYERS ).length ){
					BROKER.publish('ZONE_CLOSE', {
						uuid: this.uuid,
					})
				}
			}, PULSE_TIME )
		}

		// waves
		if( !this._intervals.waves ){
			this._intervals.waves = setInterval(() => {
				this.ocean_level = Math.random()
				// lib.random_hex( 12 )
				this.broadcast({
					type: 'ocean',
					data: {
						level: this.ocean_level,
					}
				})
			}, ( env.WAVE_FREQUENCY || 10 ) * 1000 )
		}

		game._ZONES[ this.uuid ] = this

	}


	join_user( user ){
		user._last_zone = this.uuid
		this._PLAYERS[ user.slug ] = user
	}


	broadcast( packet, ignore_slug ){
		for( const slug in this._PLAYERS ){
			if( ignore_slug === slug ) continue
			const socket = this._PLAYERS[slug]._socket
			if( !socket ){
				log('flag','player missing socket', slug )
				continue
			}
			BROKER.publish('SOCKET_SEND', {
				socket,
				...packet,
			})
		}
	}


	close(){
		// sweep players
		for( const slug in this._PLAYERS ){
			BROKER.publish('SOCKET_DISCONNECT', {
				socket: this._PLAYERS[slug]._socket,
			})
		}
		// intervals
		for( const type in this._intervals ){
			clearInterval( this._intervals[ type ] )
			delete this._intervals[ type ]
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