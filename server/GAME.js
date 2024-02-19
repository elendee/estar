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
	}


	async init(){

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
				const zone = new Zone( r )
				this._ZONES[ zone.uuid ] = zone
				zone.init()
				.catch( err => {
					log('flag',' err init zone', err )
				})
			}
		}

	}


	async init_user( socket ){
		let user = socket?.request?.session?.USER
		if( !user ) throw new Error('invalid user to init')

		user = new User( user )

		await ROUTER.bind_user( socket )

		BROKER.publish('SOCKET_SEND', {
			socket,
			type: 'init_user',
			data: {
				user: user.publish()
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