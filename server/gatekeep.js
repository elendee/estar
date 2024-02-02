import env from './.env.js'
import auth from './auth.js'
import User from './models/User.js'
import log from './log.js'
import lib from './lib.js'
import render from '../client/e_html.js'
import color from './color.js'



const routes = {
	GET: {
		logged: [
			'account', 
			'admin',
		],
	},
}


let bare_path, ip

const gatekeep = (req, res, next) => {

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

		}else if( routes[ req.method ].logged.includes( bare_path ) ){ 

			// - not logged
			if( !lib.is_logged( req ) ){ 

				if( req.method.match(/get$/i) ){
					return res.send( render('redirect', req, {
						redirect: '/',
						name: 'home'
					}))
				}else{
					return lib.res_fail( res, 'blocked unlogged', 'must be logged in')
				}

			// - logged in 
			}else{ 

				log('flag', 'need to handle confirmed state here....')

				if( !req.session.USER._confirmed ){
					return res.send( render('redirect', req, {
						redirect: '/await_confirm',
						name: 'await confirm',
					}))
				}
				next()
			}

		// -- requires admin routes
		}else if( env.PRODUCTION && req.path.match(/admin/i) && !lib.is_admin( req ) ){ // admin block ...

			return res.send( render('redirect', req, {
				redirect: '/',
				name: 'home',
			}))

		// -- normal routes
		}else {  

			// log('flag', 'mysterious but fine route: ', req.path )
			next()

		}

	}

}




function format( data ){
	return ` ${ color('orange', data.ip ) } ${ color_method( data.method, data.path ) } ${ data._email ? color('magenta', data._email ) : 'none' }`

}


function color_method( method, data ){
	return color( ( method === 'POST' ? 'lblue' : 'blue' ), data )
}


export default gatekeep
