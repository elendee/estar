import env from './env.js'


// const alert_contain = document.createElement('div')
// alert_contain.id = 'alert-contain'
// document.body.appendChild( alert_contain )

const alert_contain = document.querySelector('#alert-contain')

// const ele = document.createElement('style')
// ele.innerHTML = style
// document.head.appendChild( ele )



const hal = ( type, msg, time ) => {

	if( type === 'dev' && env.PRODUCTION ) return

	if( !type ) type = 'standard'

	const alert_wrapper = document.createElement('div')
	alert_wrapper.classList.add('ui-fader' )

	const alert_msg = document.createElement('div')
	alert_msg.classList.add('alert-msg', 'type-' + type ) 
	alert_msg.innerHTML = `
	<div class='alert-icon'>
		<div></div>
	</div>${ msg }`

	const close = document.createElement('div')
	close.innerHTML = '&times;'
	close.classList.add('alert-close')
	
	alert_contain.appendChild( alert_wrapper )
	alert_wrapper.appendChild( alert_msg )
	alert_msg.appendChild( close )

	close.onclick = function(){
		alert_wrapper.style.opacity = 0
		setTimeout(function(){
			alert_wrapper.remove()
		}, 500)
	}

	if( time ){
		setTimeout(function(){
			alert_wrapper.style.opacity = 0
			setTimeout(function(){
				alert_wrapper.remove()
			}, 500)
		}, time)
	}
	
}


if( env.EXPOSE ) window.hal = hal

export default hal
