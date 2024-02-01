const env = require('./.env.js')
const bcrypt = require('bcryptjs')
const date = require('./date.js')
const log = require('./log.js')
const lib = require('./lib.js')
const mail = require('./mail.js')
const DB = require('./db.js')
const User = require('./models/User.js')


const SALT_ROUNDS = 10









const compare_pw = ( password, hash_pw ) => {

	return new Promise((resolve, reject) => {

		bcrypt.compare( password, hash_pw )
		.then( bcrypt_boolean => {
			if( bcrypt_boolean ){
				resolve(true)
			}else{
				resolve(false)
			}
		}).catch( err => {
			log('flag', 'bcrypt error: ', err )
			resolve(false)
		})

	})

}






const login_user = async( request ) => {

	const pool = DB.getPool()

	const email = request.body.email.toLowerCase().trim()
	const password = request.body.password.trim()

	const sql1 = 'SELECT * FROM users WHERE email=? LIMIT 1'
	const res1 = await pool.queryPromise( sql1, request.body.email )
	if( res1.error || !res1.results ){
		if( res1.error ) log('flag', 'user lookup err: ', res1.error )
		return lib.return_fail( res1.error, 'error looking up user')
	}

	if( !res1.results.length ) return lib.return_fail('no users found for: ' + email, 'no users found')

	const hash_pw = res1.results[0].password

	const user = new User( res1.results[0] )

	if( !user || !hash_pw ) return lib.return_fail( 'no email found for : ' + email,  'no user found')

	const res2 = await compare_pw( password, hash_pw )
	if( !res2 ) return lib.return_fail( 'invalid pw : ' + email, 'invalid password')

	request.session.USER = user

	return {
		success: true,
		admin: lib.is_admin( request ),
	}

}





const send_confirm = async( email, caller ) => {


	log('flag', 'send confirm caller: ', caller )

	if( !lib.is_valid_email( email )) return lib.return_fail( 'invalid email: ' + email, 'error sending reset' )

	const code = lib.random_hex( 6 )
	const now = Date.now()

	const pool = DB.getPool()
	const sql = 'UPDATE users SET reset_time=?, confirm_code=? WHERE email=?'
	const res = await pool.queryPromise( sql, [ now, code, email ])
	if( res.error ) return lib.return_fail( res.error, 'failed to send reset')
	if( !res.affectedRows === 1 ) return lib.return_fail( { msg: 'invalid send_confirm: ', res: res }, 'failed to send reset' )

	const body_html = 'confirm account:<br><br>head back to <a href="' + env.URL + '/await_confirm?e=' + email + '" target="_blank">eccentricity.online</a> and use this one time code to confirm:<br><br>' + code
	const body_text = lib.render_user_data( body_html, {
		line_breaks: true,
		strip_html: true,
	})

	const mailOptions = {
		from: env.MAIL.SENDER,
		to: email,
		subject: 'Eccentricity Confirmation Code',
		html: body_html,
		text: body_text,
	}

	// await 
	mail.sendmail( mailOptions )

	return { success: true }

}






const register_user = async( request ) => {
	
	if( !request.session.USER._id ){ // should always be the case if routing correctly

		const pool = DB.getPool()

		const email = request.body.email.toLowerCase().trim()
		const pw = request.body.password.trim()

		let invalid = false
		if( !lib.is_valid_email( email )){
			invalid = 'invalid email'
		}else if( !lib.is_valid_password( pw )){
			invalid = 'invalid password'
		}
		if( invalid ){
			return {
				success: false,
				msg: invalid
			}
		}

		let salt = bcrypt.genSaltSync( SALT_ROUNDS )
		let hash = bcrypt.hashSync( pw, salt )

		const code = lib.random_hex( 6 )

		const sql1 = 'INSERT INTO `users` (`email`, `password`, `confirmed`, `confirm_code`, `alpha_tester`) VALUES ( ?, ?, false, ?, 1 )'

		const res1 = await pool.queryPromise( sql1, [ email, hash, code ] )

		if( res1.error || !res1.results || typeof res1.results.insertId !== 'number' ){
			let msg
			if( res1.error && res1.error.code === 'ER_DUP_ENTRY' ){
				msg = 'duplicate email found'
			}else if( res1.error || !res1.results ){
				log('flag', 'err user insert: ', res1.error )
				msg = 'error creating user'
			}
			return {
				success: false,
				msg: msg
			}
		}

		const sql2 = 'SELECT * FROM users WHERE id=?'
		const res2 = await pool.queryPromise( sql2, [ res1.results.insertId ])
		if( res2.error || !res2.results || !res2.results.length ) return lib.return_fail( res2.error, 'unable to save')

		request.session.USER = new User( res2.results[0] )

		await send_confirm( request.session.USER._email, 'CC' )

		return{
			success: true,
		}

	}else{

		log('flag', 'bad register attempt: ', request.session.USER, request.body )

		return {
			success: false,
			msg: 'user already logged in'
		}

	}

}









const logout = async( request ) => {

	let msg = 'user saved'

	if( request.session.USER.save && request.session.USER._id ){

		const r = await request.session.USER.save() // auto stamps
		if( !r || !r.success )  log('flag', 'error saving user during logout (proceeding) ', r )

	}else{

		msg = 'no user found to logout'

	}

	request.session.destroy()

	return {
		success: true,
		msg: msg
	}

}


const confirm_account = async( request ) => {

	if( !lib.is_valid_email( request.body.email ) || typeof request.body.confirm_code !== 'string' ){
		return lib.return_fail( 'invalid confirm: ' + JSON.stringify( request.body ), 'invalid attempt' )
	}

	const pool = DB.getPool()
	const sql = 'SELECT * FROM users WHERE email=? AND confirm_code=?'
	const res = await pool.queryPromise( sql, [ request.body.email.trim(), request.body.confirm_code ] )
	if( res.error ) return lib.return_fail( res.error, 'failed to confirm')
	if( !res.results.length ) return lib.return_fail( 'invalid confirm: ' + request.body.email, 'failed to confirm')

	const last_reset = res.results[0].reset_time
	const time_since_reset = Date.now() - Number( last_reset )
	const allow_window = 1000 * 60 * 60 * 24 
	if( !last_reset || time_since_reset > allow_window ){
		return lib.return_fail( 'too long elapsed since reset ' + time_since_reset, 'reset code expired (24 hours), request a new one' )
	}

	const user = request.session.USER = new User( res.results[0] )

	user._confirmed = 1 
	user._confirm_code = null

	await user.save()

	return { success: true }

}



const reset_pass = async( request ) => {

	if( !lib.is_valid_password( request.body.pw )  ){
		return lib.return_fail( 'invalid reset: ' + JSON.stringify( request.body ), 'invalid attempt' )
	}

	const salt = bcrypt.genSaltSync( SALT_ROUNDS )
	const hash = bcrypt.hashSync( request.body.pw, salt )

	const pool = DB.getPool()
	const sql = 'UPDATE users SET password=? WHERE id=?'
	const res = await pool.queryPromise( sql, [ hash, request.session.USER._id ] )
	if( res.error ) return lib.return_fail( res.error, 'failed to reset')

	request.session.USER._password = hash

	return { success: true }

}



const get_account = async( request ) => {

	const pool = DB.getPool()
	const sql = 'SELECT * FROM users WHERE id=?'
	const res = await pool.queryPromise( sql, request.session.USER._id )
	if( res.error ) return lib.return_fail( res.error, 'error getting account data')

	return {
		success: true,
		user: res.results ? new User( res.results[0] ).publish('_perks') : undefined,
	}

}


module.exports = {
	register_user,
	// select_user,
	login_user,
	logout,
	confirm_account,
	send_confirm,
	reset_pass,
	get_account,
}








