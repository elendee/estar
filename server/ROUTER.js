import BROKER from './EventBroker.js'



const bind_user = async( socket ) => { // , CHAT

	// handle sessions without http requests
	if( !socket?.request?.session?.USER ){
		// await bind_purgatory( socket )
		return log('flag', 'error binding user; no user')
	}

	let packet, USER

	USER = socket?.request?.session?.USER

	// log('flag', 'BIND: proceeding')

	socket.request.session.USER = USER = new User( USER )

	socket.on('pong', heartbeat )

	socket.isAlive = true

	socket.on('message',  ( data ) => {

		try{ 

			packet = lib.sanitize_packet( JSON.parse( data ) )

			// USER = socket.request.session.USER

			// packet logger:
			// if( packet.type !== 'ping' ){
			// 	log('flag', 'packet log:', packet )
			// }

			switch( packet.type ){

				case 'ping':
					socket.send( JSON.stringify({ type: 'pong' }))
					break;

				default:
					log('flag', 'unknown packet type', packet )
					break;

			}

		}catch( err ){

			log('flag', 'packet err', err )

		}

	})

	socket.on('close', e => {
		log('wss', 'socket close: native ws event:', Object.keys( e ) )
		BROKER.publish('SOCKET_DISCONNECT', {
			socket: socket,
		})
	})

}