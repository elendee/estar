import env from './.env.js'
import log from './log.js'
import lib from './lib.js'
import DB from './db.js'
import * as ROUTER from './ROUTER.js'
import BROKER from './EventBroker.js'
import Zone from './models/Zone.js'
import User from './models/User.js'




const PULSE_TIME = ( env.LOCAL ? 3 : 10 ) * 1000

class Game {

	constructor( init ){
		init = init || {}

		// instantiated
		this._ZONES = {}
		this._START_ZONE = false
	}


	async init(){

		if( !env.STARTING_ZONE ) return log("flag", 'env starting zone required')

		if( !this._pulse ){

			log('game', 'init game pulse')

			// check zones are active
			this._pulse = setInterval(() => {
				log('game', 'pulse')
				if( !Object.keys( this._ZONES ).length ){
					this.close()
				}
			}, PULSE_TIME )
		}

		if( !Object.keys( this._ZONES ).length ){

			log('game', 'init game zones')

			// bring starter zone online
			const pool = DB.getPool()
			let sql, res
			sql = `SELECT * FROM zones WHERE id=?`
			res = await pool.queryPromise( sql, env.STARTING_ZONE )
			for( const r of res.results || [] ){
				const zone = this._START_ZONE = new Zone( r )
				zone._bring_online( this )
				.catch( err => {
					log('flag',' err init zone', err )
				})
			}
		}

	}


	async touch_zone( uuid ){
		if( typeof uuid !== 'string' ) return log('flag', 'zone must have uuid')
		if( this._ZONES[ uuid ] ) return this._ZONES[ uuid ]
		const pool = DB.getPool()
		let sql, res
		sql = `SELECT * FROM zones WHERE uuid=?`
		res = await pool.queryPromise( sql, uuid )
		if( !res.results?.length ) return log('flag', `failed to find zone: ${ uuid }`)
		const zone = new Zone( res.results[0] )
		return zone
	}


	async init_user( socket ){
		let user = socket?.request?.session?.USER
		if( !user ) throw new Error('invalid user to init')

		await ROUTER.bind_user( socket )

		user = new User( user )
	
		let zone
		if( user._last_zone ){
			zone = await this.touch_zone( user._last_zone )
			await zone._bring_online( this )
		}else{
			zone = this._START_ZONE
		}

		zone.join_user( user )

		BROKER.publish('SOCKET_SEND', {
			socket,
			type: 'init_user',
			data: {
				user: user.publish(),
				zone: zone.publish(),
			}
		})

		return {
			success: true,
		}

	}


	close(){
		clearInterval( this._pulse )
		delete this._pulse 
		log('game', 'closed game')
	}


}


const game = new Game()



const close_zone = event => {
	const {
		uuid,
	} = event

	const zone = game._ZONES[ uuid ]
	if( !zone ) return log('flag', 'no zone to close: ', uuid )

	clearInterval( zone._pulse )
	delete game._ZONES[ uuid ]

	log('game', 'closed zone: ', uuid )
}



BROKER.subscribe('ZONE_CLOSE', close_zone )

export default  game