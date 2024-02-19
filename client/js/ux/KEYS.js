import env from '../env.js'
import BINDS from './BINDS.js'
import BROKER from '../EventBroker.js'
import STATE from '../STATE.js'






let global_handled = false

let state

let unknown = {
	keyup: 0,
	keydown: 0,
}





const handle_keydown = ( e ) => {

	global_handled = false

	switch( e.keyCode ){
		case 17: // ctrl
			STATE.ctrl_down = true
			break;
		case 16: // shift
			STATE.shift_down = true
			break;
		// any global handlers here
		default: break;
	}

	state = STATE.get()

	if( !global_handled ){

		if( !state ){ // sky

			switch( e.keyCode ){

			case BINDS.global.chat:
				BROKER.publish('CHAT_FOCUS')
				break;

			case BINDS.sky.roll.ccw:
				BROKER.publish('MOVE_KEY', {
					type: 'roll_ccw',
					state: true,
				})
				break;a

			case BINDS.sky.roll.cw:
				BROKER.publish('MOVE_KEY', {
					type: 'roll_cw',
					state: true,
				})
				break;

			// case BINDS.sky.roll_cam.ccw:
			// 	BROKER.publish('MOVE_KEY', {
			// 		type: 'roll_cam_ccw',
			// 		state: true,
			// 	})
			// 	break;a

			// case BINDS.sky.roll_cam.cw:
			// 	BROKER.publish('MOVE_KEY', {
			// 		type: 'roll_cam_cw',
			// 		state: true,
			// 	})
			// 	break;

			case BINDS.sky.strafe.left: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafe_left',
					state: true,
				})
				break;

			case BINDS.sky.strafe.right:
				BROKER.publish('MOVE_KEY', {
					type: 'strafe_right',
					state: true,
				})
				break;

			case BINDS.sky.thrust.forward: 
				BROKER.publish('MOVE_KEY', {
					type: 'thrust_forward',
					state: true,
				})
				break;

			case BINDS.sky.thrust.back:
				BROKER.publish('MOVE_KEY', {
					type: 'thrust_back',
					state: true,
				})
				break;

			case BINDS.sky.yaw.port: 
				BROKER.publish('MOVE_KEY', {
					type: 'yaw_port',
					state: true,
				})
				break;

			case BINDS.sky.yaw.starboard: 
				BROKER.publish('MOVE_KEY', {
					type: 'yaw_starboard',
					state: true,
				})
				break;

			case BINDS.sky.pitch.up: 
				BROKER.publish('MOVE_KEY', {
					type: 'pitch_up',
					state: true,
				})
				break;

			case BINDS.sky.pitch.down: 
				BROKER.publish('MOVE_KEY', {
					type: 'pitch_down',
					state: true,
				})
				break;

			case BINDS.sky.super:
				STATE.super_key = true
				break;

			default: 

				break

			}//switch

		}else if( state === 'chat' ){

			switch( e.keyCode ){

				case BINDS.chat.send:
					BROKER.publish('CHAT_SEND')
					global_handled = true
					break;

				default: break;
			}

		}else if( state === 'modal' ){

			// 

		}else if( state == 'taxi' ){

			// nada

		}else{ 

			unknown.keydown++
			if( unknown.keydown % 10 === 0 ) console.log('unknown keydown state: ', state )

		}

	}

}









const handle_keyup = ( e ) => {

	global_handled = false

	state = STATE.get()

	// console.log( 'keyup: ', state, e.keyCode ) // keylog

	switch( e.keyCode ){
		case BINDS.global.close:
			BROKER.publish('STEP_CLOSE', { esc: true })
			global_handled = true
			break;
		case 17: // ctrl
			STATE.ctrl_down = false
			break;
		case 16: // shift
			STATE.shift_down = false
			break;
		// any global handlers here

		default: break;
	}

	if( !global_handled ){

		if( !state ){

			switch(e.keyCode){

			// it fires after chat send / blur if here, put keydown
			// case BINDS.global.chat:
			// 	BROKER.publish('CHAT_FOCUS')
			// 	break;

			case BINDS.global.chat_alt:
				BROKER.publish('CHAT_FOCUS_ALT')
				break;

			case BINDS.sky.thrust.forward:
				BROKER.publish('MOVE_KEY', { // all the cosmetics
					type: 'thrust_forward',
					state: false,
				})
				break

			case BINDS.sky.thrust.back:
				BROKER.publish('MOVE_KEY', {
					type: 'thrust_back',
					state: false,
				})
				break

			case BINDS.sky.yaw.port:
				BROKER.publish('MOVE_KEY', {
					type: 'yaw_port',
					state: false,
				})
				break

			case BINDS.sky.yaw.starboard:
				BROKER.publish('MOVE_KEY', {
					type: 'yaw_starboard',
					state: false,
				})
				break

			case BINDS.sky.pitch.up:
				BROKER.publish('MOVE_KEY', {
					type: 'pitch_up',
					state: false,
				})
				break

			case BINDS.sky.pitch.down:
				BROKER.publish('MOVE_KEY', {
					type: 'pitch_down',
					state: false,
				})
				break

			case BINDS.sky.strafe.left: 
				BROKER.publish('MOVE_KEY', {
					type: 'strafe_left',
					state: false,
				})
				break;

			case BINDS.sky.strafe.right:
				BROKER.publish('MOVE_KEY', {
					type: 'strafe_right',
					state: false,
				})
				break;

			// case BINDS.sky.roll_cam.ccw:
			// 	BROKER.publish('MOVE_KEY', {
			// 		type: 'roll_cam_ccw',
			// 		state: false,
			// 	})
			// 	break;

			// case BINDS.sky.roll_cam.cw:
			// 	BROKER.publish('MOVE_KEY', {
			// 		type: 'roll_cam_cw',
			// 		state: false,
			// 	})
			// 	break;
			
			case BINDS.sky.roll.ccw:
				BROKER.publish('MOVE_KEY', {
					type: 'roll_ccw',
					state: false,
				})
				break

			case BINDS.sky.roll.cw:
				BROKER.publish('MOVE_KEY', {
					type: 'roll_cw',
					state: false,
				})
				break

			// case BINDS.sky.actions.one:
			// 	BROKER.publish('ACTION_BAR', {
			// 		index: 0,
			// 		// state: 0,
			// 	})
			// 	break;

			// case BINDS.sky.actions.two:
			// 	BROKER.publish('ACTION_BAR', {
			// 		index: 1,
			// 		// state: 0,
			// 	})
			// 	break;

			// case BINDS.sky.actions.three:
			// 	BROKER.publish('ACTION_BAR', {
			// 		index: 2,
			// 		// state: 0,
			// 	})
			// 	break;

			// case BINDS.sky.actions.four:
			// 	BROKER.publish('ACTION_BAR', {
			// 		index: 3,
			// 		// state: 0,
			// 	})
			// 	break;

			case BINDS.sky.reset_camera:
				BROKER.publish('MOUSE_UNPAN')
				break;

			case BINDS.sky.targeting.find: 
				BROKER.publish('TARGET_CLOSEST', { find: true })
				break;

			case BINDS.sky.targeting.ships:
				BROKER.publish('TARGET_CLOSEST', { ship: true })
				break;

			case BINDS.sky.hotkeys.pilot:
				BROKER.publish('MODAL_OPEN_PILOT', 'player1') 
				break;

			case BINDS.sky.hotkeys.navigation:
				BROKER.publish('MODAL_OPEN_NAV')
				break;

			case BINDS.sky.hotkeys.ship:
				BROKER.publish('MODAL_OPEN_ENTROPIC', 'player1')
				break;

			// case BINDS.sky.hotkeys.target:
			// 	BROKER.publish('MODAL_OPEN_TARGET')
			// 	break;

			// case BINDS.sky.hyperjump:
			// 	BROKER.publish('SYSTEM_REQUEST_JUMP')
			// 	break;

			// case BINDS.sky.super:
			// 	STATE.super_key = false
			// 	break;

			// case BINDS.chat.hail:
			// 	BROKER.publish('TARGET_HAIL')
			// 	break;

			// case BINDS.chat.party:
			// 	BROKER.publish('TARGET_PARTY')
			// 	break;

			default: 
				break
			}

		}else if( state === 'chat' ){

			//

		}else if( state == 'taxi' ){

			// nada

		}else if( state === 'modal' ){

			switch( e.keyCode ){

			case BINDS.global.chat:
				BROKER.publish('CHAT_FOCUS')
				break;

			case BINDS.sky.hotkeys.navigation:
				BROKER.publish('MODAL_CLOSE_NAV')
				break;

			default: break;

			}

			// 

		}else{

			unknown.keyup++
			if( unknown.keyup % 10 === 0 ) console.log('unknown keyup state: ', state )

		}

	}

}







const keys = {
	init: () => {
		document.addEventListener('keyup', handle_keyup )
		document.addEventListener('keydown', handle_keydown )		
	}
}





if( env.EXPOSE ) window.KEYS = keys

export default keys
