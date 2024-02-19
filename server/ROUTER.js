import BROKER from './EventBroker.js'
import log from './log.js'


function heartbeat(){
	// DO NOT convert to arrow function or else your sockets will silently dis-connect ( no "this" )
	this.isAlive = Date.now()
	// log('flag', 'h eartbea t')
}



const bind_user = async( socket ) => { // , CHAT

	// handle sessions without http requests
	if( !socket?.request?.session?.USER ){
		// await bind_purgatory( socket )
		return log('flag', 'error binding user; no user')
	}

	let packet, USER

	USER = socket?.request?.session?.USER

	USER._socket = socket

	socket.bad_packets = 0

	socket.on('pong', heartbeat )

	socket.isAlive = true

	socket.on('message',  ( data ) => {

		try{ 

			packet = JSON.parse( data )

			switch( packet.type ){

				case 'ping':
					BROKER.publish('SOCKET_SEND', {
						socket,
						type: 'pong',
					})
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


const send = event => {

	try{

		const {
			socket,
			type,
			data,
		} = event

		const now = Date.now()

		socket.send( JSON.stringify({
			type,
			ts: now,
			data: data || {},
		}))

	}catch( err ){
		log('flag', 'bad socket send: ', event )
	}

}

const disconnect = event => {

	log('wss', 'manual socket disconnect')

	const {
		socket,
	} = event

	socket.terminate()

}


BROKER.subscribe('SOCKET_SEND', send )
BROKER.subscribe('SOCKET_DISCONNECT', disconnect )

export {
	bind_user,
}