import env from './env.js'
import hal from './hal.js'
import BROKER from './EventBroker.js'
// import Spinner from './ui/Spinner.js'

// import SYSTEM from './SYSTEM.js'

// const spinner = new Spinner({
// 	src: '/resource/media/spinner.gif',
// })

// SYSTEM() // no oop init

let bound = 0
let packet, SOCKET 


// const key = localStorage.getItem('EVENT-WATCH-KEY')

// if( key === env.EVENT_WATCH_KEY ) begin_watch()

const init = () => {

	// spinner.show()

	SOCKET = new WebSocket( env.WS_URL )

	SOCKET.onopen = function( event ){

		// spinner.hide()

		console.log('connected ws' )

	}


	SOCKET.onmessage = function( msg ){

		try{

			packet = JSON.parse( msg.data )

			console.log('packet: ', packet )
			if( !packet.type || !packet.data || !packet.ts ){
				console.log('dev- bad packet', packet)
				return
			}

			if( 0 && env.LOCAL && !env.LOG_WS_RECEIVE_EXCLUDES.includes( packet.type ) ) console.log( packet )

			if( bound !== 1 && packet.type !== 'init_entry' ){
				if( bound === 0 ){
					bound = 'limbo'
					if( packet.msg && packet.msg.match(/failed to find/)){
						hal('error', packet.msg, 5000)
					}
					if( packet.type === 'hal' ){
						hal( packet.msg_type, packet.msg, packet.time )
					}
					console.log('user not yet intialized.. packet: ', packet )
				}else{
					// limbo, nothing
				}
				return false
			}

			if( key === env.EVENT_WATCH_KEY ) event_watch( packet )

			switch( packet.type ){

				case 'init_entry':
					BROKER.publish('SYSTEM_INIT', packet )
					bound = 1
					break;

				case 'hal':
					hal( packet.data.msg_type, packet.data.msg, packet.data.time || 5 * 1000 )
					break;

				case 'move':
					BROKER.publish('SYSTEM_HANDLE_MOVE', packet )
					break;
			
				default: 
					console.log('unhandled packet type', packet.type )
				break
			}

		}catch(e){

			SOCKET.bad_messages++
			if( SOCKET.bad_messages > 100 ) {
				console.log('100+ faulty socket messages', msg )
				SOCKET.bad_messages = 0
			}
			console.log('packet handler fail msg: ', msg.data )
			console.log('packet handler fail err: ', e )
			return false	

		}

	}

	SOCKET.onerror = function( data ){
		console.error( data )
		hal('error', 'server error')
	}

	SOCKET.onclose = function( event ){
		console.log('socket close: ', event )
		hal('error', 'connection closed')
	}

}


let send_packet

const send = event => {

	send_packet = event 

	if( SOCKET.readyState === 1 ) SOCKET.send( JSON.stringify( send_packet ))

}

BROKER.subscribe('SOCKET_SEND', send )


export default {
	init,
}

