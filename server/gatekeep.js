const env = require('./.env.js')
const auth = require('./auth.js')
const User = require('./models/User.js')
const log = require('./log.js')
const lib = require('./lib.js')
const render = require('../client/e_html.js')
const color = require('./color.js')



const routes = {
	GET: {
		logged: [
			'account', 
		],
	}, 	
	POST: {
		logged: [
			'get_account',
		],
	}
}


let bare_path, ip

module.exports = function(req, res, next) {

	if( req.path.match(/\/resource/) || req.path.match(/\/client/) ){

		next()

	}else{

		ip = ( req.headers['x-forwarded-for'] || req.connection.remoteAddress || '' ).split(',')[0].trim()

		bare_path = req.path.replace(/\//g, '')

		log('gatekeep', format({
			ip: ip,
			method: req.method,
			path: req.path,
			email: req.session.USER ? req.session.USER._email : '',
		}), ip, req.path )

		if( !routes[ req.method ] ){

			next()

		}else{

			// -- required logged in routes:
			if( routes[ req.method ].logged.includes( bare_path ) ){ 

				// - not logged
				if( !lib.is_logged( req ) ){ 

					if( req.method === 'GET' ){
						return res.send( render('redirect', req, '' ))
					}else{
						return res.json({
							success: false,
							msg: 'must be logged in',
						})
					}

				// - logged in 
				}else{ 

					log('flag', 'need to handle confirmed state here....')

					if( !req.session.USER._confirmed ){
						return res.send( render('redirect', req, 'await_confirm' ) )
					}
					next()
				}

			// -- requires admin routes
			}else if( env.PRODUCTION && req.path.match(/admin/i) && !lib.is_admin( req ) ){ // admin block ...

				return res.send( render('redirect', req, '' ) )

			// -- normal routes
			}else {  

				// log('flag', 'mysterious but fine route: ', req.path )
				next()

			}

		}

	}


}


function format( data ){
	return ` ${ color('orange', data.ip ) } ${ color_method( data.method, data.path ) } ${ data._email ? color('magenta', data._email ) : 'none' }`

}


function color_method( method, data ){
	return color( ( method === 'POST' ? 'lblue' : 'blue' ), data )
}

