import env from './.env.js'
import log from './log.js'
import lib from './lib.js'
import DB from './db.js'
import ROUTER from './ROUTER.js'
// import User from './models/User.js'



class Game {

	constructor( init ){
		init = init || {}
		this.opening = false

		this._ZONES = {}
		this._PLAYERS = {}
	}

	async init(){

		// ...
		const pool = DB.getPool()
		let sql, res
		sql = `SELECT * FROM zones WHERE 1`
		res = await pool.queryPromise( sql )
		for( const r of res.results || [] ){
			const zone = new Zone( r )
			this._ZONES[ zone.uuid ] = zone
		}

	}

	async init_user( socket, request ){
		const user = request?.session?.USER
		if( !user ) throw new Error('invalid user to init')

		await ROUTER.bind_user( socket )

	}

}


const game = new Game()



export default  game