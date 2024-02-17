import hal from './hal.js'
import env from './env.js'



class MessageBroker {

	constructor(){

		this.subscribers = {}

		if( env.EXPOSE ) window.EVENTS = {}

	}

	publish( event, data ){

		if( !this.subscribers[ event ] ){
			return hal('dev', 'event no sub: ' + event, 1000 )
		}

		if( 0 && env.LOCAL && !env.LOG_BROKER_EXCLUDES.includes( event ) ){
			if( event !== 'SOCKET_SEND' || !env.LOG_WS_SEND_EXCLUDES.includes( data.type ) ){
				console.log( event, data )
			}
		}

	    this.subscribers[ event ].forEach( subscriberCallback => subscriberCallback( data ) )

	}

	subscribe( event, callback ){

		if( !this.subscribers[event] ){
			this.subscribers[event] = []
			if( env.EXPOSE ) window.EVENTS[ event ] = true
		}
	    
	    this.subscribers[event].push( callback )

	}

}

const broker = new MessageBroker()

if( env.EXPOSE ) window.BROKER = broker

export default broker

