// native
import os from 'os'
import express, { response } from 'express'
import http, { request } from 'http'
import fs from 'fs'

// env
import env from './server/.env.js'
import log from './server/log.js'
import DB from './server/db.js'

// NPM
import session from 'express-session'
import mysql_session from 'express-mysql-session'

// app layer
import lib from './server/lib.js'
import gatekeep from './server/gatekeep.js'
import render from './client/e_html.js'
import auth from './server/auth.js'
import wss from './server/WSS.js'
import User from './server/models/User.js'
import GAME from './server/GAME.js'




const WSS = wss()
const host = os.hostname






const hydrate_user = ( req, res, next ) => {
	req.session.USER = new User( req.session?.USER )
	next()
}

function heartbeat(){
	// DO NOT convert to arrow function or else your sockets will silently disconnect ( no "this" )
	this.isAlive = Date.now()
}




// init

;( async() => {


	// db init
	const pool = await new Promise( resolve => {
		DB.initPool(( err, pool ) => {
			if( err ) return console.error( 'no db: ', err )
			resolve( pool )
		})
	})

	// log('flag', 'valid?', Object.keys( pool ))

	// session inits
	// initialize store class
	const MySQLStore = mysql_session( session )
	// connect to the session db
	const session_pool = await new Promise( resolve => {
		DB.initSessionPool(( err, sess_pool ) => {
			if( err ) return console.error( err )
			resolve( sess_pool )
		})
	})
	// combine the store class with the connection (pool)
	const sessionStore = new MySQLStore({ 
		// options
	}, session_pool )

	// express init
	const exp = new express()
	const server = http.createServer( exp )

	// express + session, using our new Store
	exp.use(session({
		key: env.MYSQL_SESSION.KEY,
		secret: env.MYSQL_SESSION.SECRET,
		store: sessionStore,
		resave: false,
		saveUninitialized: false,
	}))



	// 	secret: env.REDIS.SECRET,
	// 	name: env.REDIS.NAME,
	// 	resave: false,
	// 	saveUninitialized: true,
	// 	cookie: { 
	// 		secure: false,
	// 		maxAge: 1000 * 60 * 60 * 24 * 31 * 2,
	// 	}, // Note that the cookie-parser module is no longer needed
	// 	store: STORE

	// {
	// 	key: 'session_cookie_name',
	// 	secret: 'session_cookie_secret',
	// 	store: sessionStore,
	// 	resave: false,
	// 	saveUninitialized: false
	// }



	server.listen( env.PORT, function() {
		log( 'boot', `\x1b[33m
***eStar*** 
***********
:: PORT: ${ env.PORT } 
:: hostname: ${ host } 
:: ROOT: ${ env.ROOT } 
:: now: ${ new Date().toLocaleString() } 
\x1b[0m`) 
	})

	server.on('upgrade', function( request, socket, head ){

		log('flag', 'upgrade')

		// redis_session
		mysql_session( request, {}, () => {
		// lru_session( request, {}, () => {

			log('wss', 'session parsed')

			WSS.handleUpgrade( request, socket, head, function( ws ) {
				WSS.emit('connection', ws, request )
			})
		})
	})

	WSS.on('connection', async( socket, req ) => {

		log('wss', 'connection: ', identify( req.session.USER ) )

		log('debug', 'INHERITED request coin: ', req.session.USER && req.session.USER._PILOT ? req.session.USER._PILOT._coin : false  )

		socket.request = req

		socket.isAlive = socket.isAlive || true

		socket.bad_packets = 0

		socket.on('pong', heartbeat )

		if( WSS.clients.size > env.MAX_PILOTS ) {
			return return_fail_socket( socket, 'sorry, game is at capacity')
		}

		// init 

		if( !GAME.pulse ) await GAME.init()
					
		const res = await GAME.init_user( socket )

		if( !res?.success ){
			log('flag', 'init fail', res )
			socket.send( JSON.stringify({
				type: 'hal',
				msg_type: 'error',
				msg: 'error intializing',
				time: 10 * 1000
			}))
		}

	})





	// get redis db key
	// let rmap
	// try{
	// 	rmap = JSON.parse( await fs.readFileSync( env.REDIS.MAP_URI ) )
	// }catch( err ){
	// 	log('flag', err )	
	// 	return
	// }



	// const redis_client = redis.createClient({
	// 	legacyMode: true,
	// })
	// const rc = await 
	// redis_client.connect()
	// .catch( err => {
	// 	log('flag', err )
	// })

	// log('boot', 'redis connected (' + env.REDIS.NAME + ')' )

	// connect to correct redis db key
	// await new Promise(( resolve, reject ) => {
	// 	log('boot', 'selecting REDIS_MAP: ', rmap.estar )
	// 	redis_client.select( rmap.estar, ( err, res ) => {
	// 		log('flag', 'returned select')
	// 		if( err ){
	// 			log('flag', 'err select', err )
	// 			return reject( err )
	// 		}
	// 		log('flag', 'without error')
	// 		resolve()
	// 	})
	// })




	// const STORE = new ConnectRedisStore({ 
	// 	host: env.REDIS.HOST, 
	// 	port: env.REDIS.PORT, //env.PORT, 
	// 	client: redis_client, 
	// 	ttl: env.REDIS.TTL,
	// 	// prefix: 'estar:', // ?
	// })

	/*
		session lifetime = Math.min( session store TTL , express cookie maxAge )
	*/

	// const redis_express_session = session({
	// 	secret: env.REDIS.SECRET,
	// 	name: env.REDIS.NAME,
	// 	resave: false,
	// 	saveUninitialized: true,
	// 	cookie: { 
	// 		secure: false,
	// 		maxAge: 1000 * 60 * 60 * 24 * 31 * 2,
	// 	}, // Note that the cookie-parser module is no longer needed
	// 	store: STORE
	// })







	if( env.LOCAL ){
		exp.use('/css', express.static( './client/css' )) // __dirname + 
		exp.use('/js', express.static( './client/js' )) // __dirname + 
		exp.use('/fs', express.static( './fs' )) // __dirname + 
		exp.use('/resource', express.static( './resource' )) // __dirname + 
		exp.use('/node_modules/three', express.static( './node_modules/three' )) // __dirname + 
	}

	/*
	exp.use( (req, res, next) => {
		if (req.originalUrl.startsWith('/stripe')) {
			next()
		} else {
			express.json()(req, res, next)
		}
	})
	*/

	// exp.use( redis_express_session )
	exp.use( hydrate_user )
	exp.use( gatekeep )




	// routing
	exp.get('/', (request, response) => {
		log('flag', 'handling /')
		response.send( render( 'index', request ) )
		log('flag', 'sent response /')
	})

	exp.get('/logout', ( request, response ) => {
		request.session.destroy()
		response.send( render('redirect', request, '' ))
	})

	exp.get('/robots.txt', (request, response) => {
		response.sendFile( 'robots.txt', { root: './' } )
	})

	exp.get('*', (request, response) => {
		const bare_path = request.path.replace(/\//g, '')
		// log('flag',' sending to..', bare_path )
		response.send( render( bare_path, request, {} ))
	})

	// ^^ GET
	// -------
	// vv POST

	/*
	exp.post('/BLORBLE', (request, response) => {
		MODULE.action(request)
			.then( res => {
				response.json(res)
			})
			.catch((err) => {
				log('flag', 'error logging in: ', err )
				response.json({
					success: false,
					msg: 'error logging in'
				})
			})
	})
	*/



	/*
	// stripe pre fetch
	exp.post("/create-payment-intent", (req, res) => {

		ecc_stripe.handle_intent( req, res )
		.catch( err => {
			log('flag', err )
		})

	})

	// stripe webhook
	// exp.post('/webhook', (request, response) => { // bodyParser.raw({type: 'application/json'})
	exp.post('/stripe_webhook', express.raw({ type: 'application/json' }), ( request, response ) => { 

		ecc_stripe.handle_webhook( request, response )

	})
	*/



})(); // async init
