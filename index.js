// native
const host = require('os').hostname()
const express = require('express')
const http = require('http')
const fs = require('fs')

// env
const env = require('./server/.env.js')
const log = require('./server/log.js')
const DB = require('./server/db.js')

// NPM
// const bodyParser = require('body-parser')
const session = require('express-session')

const redis = require('redis')
const redisClient = redis.createClient({ legacyMode: true }) // { legacyMode: true }
const RedisStore = require('connect-redis').default


// app layer
const lib = require('./server/lib.js')
const gatekeep = require('./server/gatekeep.js')
const render = require('./client/e_html.js')
const auth = require('./server/auth.js')
const WSS = require('./server/WSS.js')()
const User = require('./server/models/User.js')
const GAME = require('./server/GAME.js')









const hydrate_user = ( req, res, next ) => {
	req.session.USER = new User( req.session?.USER )
	next()
}



// init

;( async() => {

	// get redis db key
	let rmap
	try{
		rmap = JSON.parse( await fs.readFileSync( env.REDIS.MAP_URI ) )
	}catch( err ){
		log('flag', err )	
		return
	}



	const exp = new express()

	const server = http.createServer( exp )

	const rc = await redisClient.connect()

	log('boot', 'redis connected (' + env.REDIS.NAME + ')' )

	// connect to correct redis db key
	await new Promise(( resolve, reject ) => {
		log('boot', 'selecting REDIS_MAP: ', rmap.estar )
		redisClient.select( rmap.estar, ( err, res ) => {
			// log('flag', 'wahttttt')
			if( err ){
				log('flag', 'err select', err )
				return reject( err )
			}
			// log('flag', 'okkkkkk')
			resolve()
		})
	})




	const STORE = new RedisStore({ 
		host: env.REDIS.HOST, 
		port: env.REDIS.PORT, //env.PORT, 
		client: redisClient, 
		ttl: env.REDIS.TTL,
		prefix: 'estar:', // ?
	})

	/*
		session lifetime = Math.min( session store TTL , express cookie maxAge )
	*/

	const redis_session = session({
		secret: env.REDIS.SECRET,
		name: env.REDIS.NAME,
		resave: false,
		saveUninitialized: true,
		cookie: { 
			secure: false,
			maxAge: 1000 * 60 * 60 * 24 * 31 * 2,
		}, // Note that the cookie-parser module is no longer needed
		store: STORE
	})







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

	exp.use( redis_session )
	exp.use( hydrate_user )
	exp.use( gatekeep )




	// routing
	exp.get('/', (request, response) => {
		log('flag', 'WHATTATAT')
		response.send( render( 'index', request ) )
		log('flag', 'WHATTATAT 21')
	})

	exp.get('/logout', ( request, response ) => {
		request.session.destroy()
		response.send( render('redirect', request, '' ))
	})

	exp.get('/robots.txt', (request, response) => {
		response.sendFile('/resource/robots.txt', { root: './' } )
		log('routing', 'bot')
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












	function heartbeat(){
		// DO NOT convert to arrow function or else your sockets will silently disconnect ( no "this" )
		this.isAlive = Date.now()
	}



	DB.initPool(( err, pool ) => {

		if( err ) return console.error( 'no db: ', err )
		
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

			redis_session( request, {}, () => {
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

	})

})(); // async init
