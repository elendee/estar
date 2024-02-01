// test
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
const bodyParser = require('body-parser')
const session = require('express-session')

// const MemoryStore = require('memorystore')(session)

const redis = require('redis')
const redisClient = redis.createClient({ legacyMode: true })
const redisStore = require('connect-redis')(session)

// app layer
const {
	identify,
	return_fail_socket,
	return_fail,
	random_name,
	hal,
	is_logged,
} = require('./server/lib.js')
const gatekeep = require('./server/gatekeep.js')
const render = require('./client/e_html.js')
const auth = require('./server/auth.js')
const WSS = require('./server/WSS.js')()
const GAME = require('./server/GAME.js')
const SOCKETS = require('./server/SOCKETS.js')

// const STORE = new MemoryStore({
// 	checkPeriod: 1000 * 60 * 60 * 24 * 2// prune expired entries every 24h
// })
const API = require('./server/API.js')

const admin = require('./server/admin.js')
const ecc_stripe = require('./server/ecc_stripe.js')







// init

;( async() => {


	// CACHED SESSIONS
	// const lru_session = session({
	// 	cookie: { 
	// 		maxAge: 1000 * 60 * 60 * 24 * 31,
	// 	}, // 14 day
	// 	resave: false,
	// 	saveUninitialized: true,
	// 	store: STORE,
	// 	secret: env.SECRET
	// })

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

	const res = await redisClient.connect()

	log('boot', 'redis connected (' + env.REDIS.NAME + ')' )

	// connect to correct redis db key
	await new Promise(( resolve, reject ) => {
		log('boot', 'REDIS_MAP: ', rmap.ecc )
		redisClient.select( rmap.ecc, ( err, res ) => {
			if( err ){
				reject( err )
				return
			}
			resolve()
		})
	})

	const STORE = new redisStore({ 
		host: env.REDIS.HOST, 
		port: env.REDIS.PORT, //env.PORT, 
		client: redisClient, 
		ttl: env.REDIS.TTL,
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

	exp.use( redis_session )




	if( env.LOCAL ){
		exp.use('/css', express.static( './client/css' )) // __dirname + 
		exp.use('/js', express.static( './client/js' )) // __dirname + 
		exp.use('/fs', express.static( './fs' )) // __dirname + 
		exp.use('/resource', express.static( './resource' )) // __dirname + 
		exp.use('/three-patch', express.static( './three-patch' )) // __dirname + 
		exp.use('/node_modules/three', express.static( './node_modules/three' )) // __dirname + 
		exp.use('/node_modules/stats.js', express.static( './node_modules/stats.js' )) // __dirname + 
		exp.use('/node_modules/@paypal', express.static( '/node_modules/@paypal' )) // __dirname + 
		exp.use('/geometries', express.static( './geometries' )) // __dirname + 
	}

	exp.use( (req, res, next) => {
		if (req.originalUrl.startsWith('/stripe')) {
			next()
		} else {
			express.json()(req, res, next)
		}
	})


	// exp.use( lru_session )

	exp.use( gatekeep )





	// routing
	exp.get('/', function(request, response) {
		response.send( render( 'index', request ) )
	})

	exp.get('/login*', ( request, response) => {
		response.send( render( 'login', request ) )	
	})

	exp.get('/register*', ( request, response) => {
		response.send( render( 'register', request ) )	
	})

	exp.get('/credits', ( request, response) => {
		response.send( render( 'credit', request ) )
	})

	exp.get('/hangar*', ( request, response) => {
		response.send( render( 'hangar', request ) )
	})

	exp.get('/system*', ( request, response) => {
		response.send( render( 'system', request ))
	})

	exp.get('/license*', ( request, response) => {
		response.send( render( 'license', request ))
	})

	exp.get('/admin*', ( request, response) => {
		response.send( render( 'admin', request ))
	})

	exp.get('/account*', ( request, response) => {
		response.send( render( 'account', request ))
	})

	exp.get('/pilot*', ( request, response) => {
		response.send( render( 'pilot', request ))
	})

	exp.get('/gsgp_endpoint', ( request, response) => {
		response.json({
			name: 'Ecc',
			active_players: Object.keys( SOCKETS ).length,
			leaderboards: {
				test: {
					bob: 10,
					sue: 11,
				}
			}
		})
	})

	exp.get('/get/*', ( request, response ) => {
		API.get( request, response )
		.catch( err => {
			log('flag', 'err handle get', err )
		})
	})

	exp.get('/await_confirm', ( request, response ) => {
		response.send( render('await_confirm', request ))
	})

	exp.get('/send_confirm', ( request, response ) => {
		response.send( render('send_confirm', request ))
	})

	exp.get('/logout', ( request, response ) => {
		request.session.destroy()
		response.send( render('redirect', request, '' ))
	})

	// exp.get('/char-dev', ( request, response ) => {
	// 	response.send( render('char_dev', request ))
	// })

	exp.get('/robots.txt', function(request, response){
		response.sendFile('/resource/robots.txt', { root: './' } )
		log('routing', 'bot')
	})






	exp.get('/fetch_pilots', function( request, response ){

		if( request.session.USER.fetch_pilots ){

			request.session.USER.fetch_pilots()
				.then(function( res ){
					response.json( res )
				})
				.catch(function( err ){
					log('flag', 'err fetching pilots: ', err )
					response.json({
						success: false,
						err: 'error fetching pilots'
					})
				})

		}else{

			log('flag', 'user should be instantiated already: ', request.session.USER )
			response.json({
				success: false,
				err: 'failed to fetch pilots, try logging out and in again'
			})

		}

	})




	// ^^ GET
	// -------
	// vv POST





	exp.post('/fetch_system', ( request, response ) => {

		query.find_session_system( request )
			.then( res => {
				response.json( res )
			})
			.catch( err => { 
				log( 'flag', 'err fetching system', err ) 
				response.json({
					success: false,
					msg: 'failed to fetch system'
				})
			})

	})

	exp.post('/login', (request, response) => {
		auth.login_user(request)
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

	exp.post('/register', ( request, response ) => {
		auth.register_user( request )
			.then(  res => {
				response.json( res )
			})
			.catch((err) => {
				log('flag', 'error registering', err )
				response.json({
					success: false,
					msg: 'error registering'
				})
			})
	})


	exp.post('/set_pilot', ( request, response ) => {
		request.session.USER.set_pilot( request )
			.then( res => {
				response.json( res )
			})
			.catch(( err ) => {
				log('flag', 'error choosing pilot', err )
				response.json({
					success: false,
					msg: 'error choosing pilot'
				})
			})
	})

	exp.post('/create_pilot', ( request, response ) => {
		request.session.USER.create_pilot( request )
			.then( res => {
				response.json( res )
			})
			.catch(( err ) => {
				log('flag', 'error creating pilot: ', err )
				response.json({
					success: false,
					msg: msg
				})
			})
	})

	exp.post('/delete_pilot', ( request, response ) => {
		GAME.delete_pilot( request )
		.then( res => {
			response.json( res )
		})
		.catch(( err ) => {
			log('flag', 'error delete_pilot post: ', err )
			response.json({
				success: false,
				msg: 'error deleting pilot',
			})
		})
	})

	exp.post('/confirm_account', ( request, response ) => {
		auth.confirm_account( request )
			.then( res => {
				response.json( res )
			})
			.catch(( err ) => {
				log('flag', 'error confirm_account: ', err )
				response.json({
					success: false,
					msg: msg
				})
			})
	})

	exp.post('/send_confirm', ( request, response ) => {
		auth.send_confirm( request.body.email, 'DD' )
			.then( res => {
				response.json( res )
			})
			.catch(( err ) => {
				log('flag', 'error send_confirm: ', err )
				response.json({
					success: false,
					msg: msg
				})
			})
	})

	exp.post('/reset_pass', ( request, response ) => {
		auth.reset_pass( request )
			.then( res => {
				response.json( res )
			})
			.catch(( err ) => {
				log('flag', 'error reset_pass: ', err )
				response.json({
					success: false,
					msg: msg
				})
			})
	})

	exp.post('/admin', ( request, response ) => {
		admin( request )
		.then( res => {
			response.json( res )
		})
		.catch(( err ) => {
			log('flag', 'error admin post: ', err )
			response.json({
				success: false,
				msg: 'error running admin action',
			})
		})
	})

	exp.post('/get_account', ( request, response ) => {
		auth.get_account( request )
		.then( res => {
			response.json( res )
		})
		.catch(( err ) => {
			log('flag', 'error get_account post: ', err )
			response.json({
				success: false,
				msg: 'error getting account data',
			})
		})
	})

	exp.post('/update_station', ( request, response ) => {
		GAME.update_station( request )
		.then( res => {
			response.json( res )
		})
		.catch(( err ) => {
			log('flag', 'error update_station post: ', err )
			response.json({
				success: false,
				msg: 'error updating station',
			})
		})
	})

	exp.post('/update_faction', ( request, response ) => {
		GAME.update_faction( request )
		.then( res => {
			response.json( res )
		})
		.catch( err  => {
			log('flag', 'error update_faction post: ', err )
			response.json({
				success: false,
				msg: 'error updating faction',
			})
		})
	})


	// exp.post('/get_sentient_parts', ( request, response ) => {
	// 	GAME.get_sentient_parts()
	// 	.then( res => {
	// 		response.json( res )
	// 	})
	// 	.catch( err  => {
	// 		log('flag', 'error update_faction post: ', err )
	// 		response.json({
	// 			success: false,
	// 			msg: 'error updating sentients parts',
	// 		})
	// 	})
	// })

	// exp.post('/load_sentient', ( request, response ) => {
	// 	GAME.load_sentient( request )
	// 	.then( res => {
	// 		response.json( res )
	// 	})
	// 	.catch( err  => {
	// 		log('flag', 'error load_sentient post: ', err )
	// 		response.json({
	// 			success: false,
	// 			msg: 'error loading sentient',
	// 		})
	// 	})
	// })

	// exp.post('/game_action', ( request, response ) => {
	// 	GAME.game_action( request )
	// 	.then( res => {
	// 		response.json( res )
	// 	})
	// 	.catch( err  => { // will never happen with try/catch
	// 		log('flag', 'error game action: ', err )
	// 		response.json({
	// 			success: false,
	// 			msg: 'error in attempting request',
	// 		})
	// 	})
	// })

	// exp.post('/payment', function( request, response ){
	// 	payments( request )
	// 	.then(function( res ){
	// 		response.json( res )
	// 	})
	// 	.catch(function( err ){
	// 		log('flag', 'error payment post: ', err )
	// 		response.json({
	// 			success: false,
	// 			msg: 'error saving item',
	// 		})
	// 	})
	// })




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

	// exp.post('/paypal-transaction-complete', ( request, response ) => {
	// 	ecc_paypal( request, response )
	// 	.catch( err => {
	// 		log('flag', 'err paypal: ', err )
	// 	})
	// })







	exp.post('*', function(request, response){
		log('flag', 'POST 404: ' + request.url)
		if(request.url.match(/\.html$/)){
			response.status(404).sendFile('/client/html/404.html', { root : '../' })    
		}else{
			response.end()
		}
	})

	exp.get('*', function(request, response){
		response.status( 404 ).send( render('404', request) )
		// response.status(404).sendFile('/client/html/404.html', { root : '../'})    
	})









	function heartbeat(){
		// DO NOT convert to arrow function or else your sockets will silently disconnect ( no "this" )
		this.isAlive = Date.now()
	}



	DB.initPool(( err, pool ) => {

		if( err ) return console.error( 'no db: ', err )
		
		server.listen( env.PORT, function() {
			log( 'boot', `\x1b[33m
	'######::'#####:::'#####::'######:
	 ##....:'##.. ##:'##.. ##: ##....:
	 ######: ##:::::: ##:::::: #####::
	 ##::::: ##:: ##: ##:: ##: ##:::::
	 ######:. #####::. #####:: ######:
	.......::.....::::.....:::.......:
	:: ${ host }
	:: ${ env.PUBLIC_ROOT } :${ env.PORT }
	:: ${ new Date().toString() }
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

		WSS.on('connection', function connection( socket, req ) {

			log('wss', 'connection: ', identify( req.session.USER ) )

			log('debug', 'INHERITED request coin: ', req.session.USER && req.session.USER._PILOT ? req.session.USER._PILOT._coin : false  )

			socket.request = req

			socket.isAlive = socket.isAlive || true

			socket.bad_packets = 0

			socket.on('pong', heartbeat )

			if( WSS.clients.size > env.MAX_PILOTS ) {
				return return_fail_socket( socket, 'sorry, game is at capacity')
			}

			if( !GAME.pulse ) {

				if( GAME.opening ){ // extremely unlikely
				
					socket.send(JSON.stringify({
						type: 'error',
						msg: 'tried to join during server start - wait a couple seconds'
					}))

				}else{

					GAME.opening = true

					GAME.init_async_elements()
					.then( res => {
				
						GAME.opening = false
				
						GAME.init_sync_elements()

						GAME.init_user( socket )
						.then( res => {
							if( !res || !res.success ){
								log('flag', 'init fail', res )
								hal( socket, 'error', res.msg || 'failed to initialize')
							}
						})
						.catch( err => {
							socket.send(JSON.stringify({ type: 'error', msg: 'error initializing user'}))
							log('flag', 'err init user:', err  )
						})
				
					})
					.catch( err => {
						log('flag', 'err opening GAME: ', err )
					})

				}

			}else{

				GAME.init_user( socket ).catch( err => { 
					socket.send(JSON.stringify({ type: 'error', msg: 'failed to initialize user'}))
					log('flag', 'init_user err: ', err )
				})

			}

		})

	})

})(); // async init
