const env = require('./.env.js')
const log = require('./log.js')

const validator = require('email-validator')
const p_validator = require('password-validator')

const PRIVATE = require('./data/PRIVATE.js')

const { 
	Object3D, 
	Vector3,
	Quaternion,
} = require('three')



const schema = new p_validator()
const name_schema = new p_validator()


 
// Add properties to it
schema
	.is().min(6)                                    // Minimum length 8
	.is().max(30)                                   // Maximum length 100
	// .has().uppercase()                           // Must have uppercase letters
	// .has().lowercase()                           // Must have lowercase letters
	// .has().digits()                              // Must have digits
	.has().not().spaces()                           // Should not have spaces
	.is().not().oneOf(['password', 'Passw0rd', 'Password123'])


name_schema
	.is().min(3)
	.is().max(25)
	.has().not().spaces()
	.has().not().digits()




Object3D.prototype.lookAwayFrom = function( target ){
	const v = new Vector3()
    v.subVectors( this.position, target.position ).add( this.position )
    source.lookAt( v )
}

const static_chars = ['≢', '≒', '≓', '≎', '∿', '⦕', '⦖', '⦚', '⨌', ' ']

const random_hex = ( len ) => {

	//	let r = '#' + Math.floor( Math.random() * 16777215 ).toString(16)
	let s = ''
	
	for( let i = 0; i < len; i++){
		s += Math.floor( Math.random() * 16 ).toString( 16 )
	}
	
	return s

}



const is_valid_email  = ( email ) => {

	return validator.validate( email )

}

const is_valid_password = ( password ) => {

	if( password.match(/^null$/i) ){
		log('flag', 'cant use null as pw')
		return false
	}

	return schema.validate( password + '' )

}









const is_valid_name = ( name ) => {

	let valid = true

	if( !name ) valid = false

	if( typeof( name ) !== 'string' || name.length > PRIVATE.name_length ) return false // yes skip the log here, could be huge

	if( name.match(/^null$/i) ) valid = false

	if( !name_schema.validate( name + '' ) ) valid = false

	if ( !/^([a-zA-Z]|\'|-)*$/g.test( name ) ) valid = false

	if( !valid ) {
		log('flag', 'name regex failed: ', name )
		return false
	}

	return true

}


function validate_number( ...vals ){

	for( const num of vals ){
		if( typeof num === 'number' || ( num && typeof Number( num ) === 'number' ) ) return Number( num )
	}
	return vals[ vals.length - 1 ]

}



function validate_date( ...vals ){

	let test
	for( const val of vals ){
		test = new Date( val )
		if( !test.toString().match(/invalid/i) ) return new Date( val )
	}
	return vals[ vals.length - 1 ]

}



function validate_string( ...vals ){

	for( const str of vals ){
		if( typeof( str ) === 'string' ) return str
	}
	return vals[ vals.length - 1 ]

}



const random_entry = source => {

	if( Array.isArray( source )){
		if( source.length === 1 ) return source[0]
		if( source.length === 2 ) return source[ Math.random() > .5 ? 1 : 0 ] // because Floor( random() ) is biased low
		return source[ random_range( 0, source.length - 1, true ) ]
	}else if( source && typeof source === 'object'){
		return source[ random_entry( Object.keys( source ) ) ]
	}
	return ''
}



const random_range = ( low, high, int ) => {

	if( low >= high ) return low

	return int ? Math.floor( low + ( Math.random() * ( ( high - low ) + 1 ) ) ) : low + ( Math.random() * ( high - low ) )

}


const random_rgb = ( low, high ) => {

	return 'rgb(' + random_range( low, high, true ) + ', ' + random_range( low, high, true ) + ', ' + random_range( low, high, true ) + ')'

}

const identify = obj => {
	return obj?.name || obj?.uuid?.substr(0, 6) || '-'
}

const floor_vector = vec3 => {
	vec3.x = Math.floor( vec3.x )
	vec3.y = Math.floor( vec3.y )
	vec3.z = Math.floor( vec3.z )
	return vec3
}


const return_fail = ( private_err, public_err ) => {
	log('flag', 'return_fail: ', private_err, public_err )
	return {
		success: false,
		msg: public_err,
	}
}

const return_false = err => {
	log('flag', 'return_false: ', err )
	return false
}

const return_fail_socket = ( socket, msg, time, private_msg ) => {

	if( !socket ) return

	if( typeof private_msg === 'string' ) log('flag', 'return socket err: ', private_msg )

	socket.send(JSON.stringify({
		type: 'hal',
		msg_type: 'error',
		msg: msg,
		time: time,
	}))
	return false

}


const is_admin = request => {
	const admins = env.ADMINS || []
	if( request.session.USER && admins.includes( request.session.USER._email )) return true
	return false
}

const is_logged = request => {
	return request.session.USER && request.session.USER._id && request.session.USER._email
}


const render_user_data = ( msg, params ) => {

	if( typeof msg !== 'string' )  return msg

	params = params || {}

	let res = msg

	if( params.line_breaks ) res = res.replace(/\<br\/?\>/g, '\n')

	if( params.strip_html ) res = res.replace(/(<([^>]+)>)/gi, '')

	if( params.encode ) res = encodeURIComponent( res ) // or encodeURI for less strict encoding

	return res

}




const to_alphanum = ( value ) => { // , loose
	if( typeof value !== 'string' ) return ''
	// if( loose ){
	// 	return value.replace(/([^a-zA-Z0-9 _-|.|\n|!])/g, '')
	// }else{
	return value.replace(/([^a-zA-Z0-9 _-])/g, '')
	// }
}



const sleep = async( seconds ) => {
	await new Promise(( resolve, reject ) => {
		setTimeout(() => {
			resolve()
		}, typeof seconds === 'number' ? seconds * 1000 : 1000 )
	})
}


const capitalize = word => {
	if( typeof( word ) !== 'string' ) return false
	if( !word ) return word
	let v = word.substr( 1 )
	word = word[0].toUpperCase() + v
	return word
}



function scry( x, old_min, old_max, new_min, new_max ){

	const first_ratio = ( x - old_min ) / ( old_max - old_min )
	const result = ( first_ratio * ( new_max - new_min ) ) + new_min
	return result
}



const vowels = ['a', 'e', 'i', 'o', 'u']

const make_debounce = ( fn, time, immediate ) => {// , ...args
    let buffer
    return (...args) => {
        if( !buffer && immediate ) fn(...args)
        clearTimeout( buffer )
        buffer = setTimeout(() => {
            fn(...args)
            buffer = false
        }, time )
    }
}




module.exports = {
	static_chars,
	// parse_reputations,
	random_hex,
	random_entry,
	random_range,
	is_valid_name,
	is_valid_email,
	is_valid_password,
	// getBaseLog,
	validate_number,
	validate_string,
	validate_date,
	identify,
	floor_vector,
	return_fail,
	return_fail_socket,
	return_false,
	is_admin,
	is_logged,
	render_user_data,
	to_alphanum,
	random_rgb,
	sleep,
	scry,

	capitalize,

	vowels,

	make_debounce,

}
