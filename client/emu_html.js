
// const cache = '?v=108'
const log = require('../server/log.js')
const lib = require('../server/lib.js')
const env = require('../server/.env.js')
const SVGS = require('../server/SVGS.js')


const PUBLIC = require('../server/data/PUBLIC.js')




const build_meta = () => {

	const fonts = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@100;300;500&display=swap" rel="stylesheet">`

	return `
	<title>${ env.SITE_TITLE }</title>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">
	<meta name="Description" content=" ${ env.SITE_DESC }">
	<meta property="og:url" content="${ env.SITE_URL }">
	<meta property="og:title" content="${ env.SITE_TITLE }">
	<meta property="og:description" content="${ env.SITE_META_DESC }"> 
	<meta property="og:image" content="${ env.SITE_IMAGE }"/>
	${ env.PRODUCTION ? fonts : '' }
	<link rel='icon' href='/resource/media/favicon.ico'/>`

}

const build_footer = request => {
	if( !lib.is_logged( request )){
		return `<div id='footer'></div>`
	}
	return `
	<div id='footer'>
		<div class='data-embed' id='data-user'>
			${ JSON.stringify( request.session.USER.publish('_email') ) }
		</div>
	</div>`
}


const popups = `
<div id='dev'></div>
<div id='alert-contain'></div>`

const global_data = () => { return `<div id="global-data">${ JSON.stringify( PUBLIC ) }</div>` }


const pages = [
	'crypto',
	'truthengine',
	'clock',
	'chess',
	'chains',
	'meshes',
	'graphs',
	'weather',
	'rebot',
	// 'board',
]

const scripts = {

	// auth
	index: `<script type='module' defer='defer' src='/js/auth/init_index.js?v=108'></script>`,
	auth: `<script type='module' defer='defer' src='/js/auth/init_auth.js?v=108'></script>`,
	account: `<script type='module' defer='defer' src='/js/auth/init_account.js?v=108'></script>`,
	contacts: `<script type='module' defer='defer' src='/js/auth/init_contacts.js?v=108'></script>`,
	admin: `<script type='module' defer='defer' src='/js/auth/init_admin.js?v=108'></script>`,
	board: `<script type='module' defer='defer' src='/js/pages/init_board.js?v=108'></script>`,
	await_confirm: `<script type='module' defer='defer' src='/js/auth/init_await-confirm.js?v=108'></script>`,
	send_confirm: `<script type='module' defer='defer' src='/js/auth/init_send-confirm.js?v=108'></script>`,
	redirect: `<script type='module' defer='defer' src='/js/auth/init_redirect.js?v=108'></script>`,
	roadmaps: `<script type='module' defer='defer' src='/js/auth/init_roadmaps.js?v=108'></script>`,
	roadmap: `<script type='module' defer='defer' src='/js/auth/init_roadmap.js?v=108'></script>`,
	error: `<script type='module' defer='defer' src='/js/auth/init_error.js?v=108'></script>`,
	'404': `<script type='module' defer='defer' src='/js/auth/init_404.js?v=108'></script>`,
	// chain: `<script type='module' defer='defer' src='/js/auth/init_chain.js?v=108'></script>`,
	mesh: `<script type='module' defer='defer' src='/js/auth/init_mesh.js?v=108'></script>`,
	// misc
	fabric: `<script src='/inc/fabric.min.js'></script>`,
	sortable: `<script src='/inc/sortable.js'></script>`,
	//howler: `<script src='/resource/inc/howler/howler.min.js'></script>`,
	//howler_spatial: `<script src='/resource/inc/howler/howler.spatial.min.js'></script>`,

}


const styles = {

	// auth
	index: `<link rel='stylesheet' href='/css/splash.css?v=108'>`,
	base: `<link rel='stylesheet' href='/css/base.css?v=108'>`,
	auth: `<link rel='stylesheet' href='/css/auth.css?v=108'>`,
	account: `<link rel='stylesheet' href='/css/account.css?v=108'>`,
	board: `<link rel='stylesheet' href='/css/board.css?v=108'>`,
	spreadsheets: `<link rel='stylesheet' href='/css/spreadsheets.css?v=108'>`,
	contacts: `<link rel='stylesheet' href='/css/contacts.css?v=108'>`,
	admin: `<link rel='stylesheet' href='/css/admin.css?v=108'>`,
	modal: `<link rel='stylesheet' href='/css/modal.css?v=108'>`,
	roadmaps: `<link rel='stylesheet' href='/css/roadmaps.css?v=108'>`,
	roadmap: `<link rel='stylesheet' href='/css/roadmap.css?v=108'>`,
	sortable: `<link rel='stylesheet' href='/css/sortable.css?v=108'>`,
	// chain: `<link rel='stylesheet' href='/css/chain.css?v=108'>`,
	mesh: `<link rel='stylesheet' href='/css/mesh.css?v=108'>`,
	stripe_all: `<link rel='stylesheet' href='/css/stripe_all.css?v=108'>`,

	// pages
	page: `<link rel='stylesheet' href='/css/page.css?v=108'>`,

}


const logo = `
<a href='/' id='logo'>
	<img src='/resource/media/logo.png'>
</a>`

const logged_links = `
<div class='drop-down'>
	<div class='drop-toggle'>account</div>
	<div class='drop-down'>
		<div class='auth-link'>
			<a href='/account'>account</a>
		</div>
		<div class='auth-link'>
			<a href='/contacts'>contacts</a>
		</div>
		<div id='logout' class='auth-link'>
			<a href='/logout'>logout</a>
		</div>
	</div>
</div>`

const main_links = `
<div class='drop-down'>
	<div class='drop-toggle svg-icon-wrap'>
		${ SVGS.tools }
	</div>
	<div class='drop-down'>

		<div class='public-link linktype-utility'>
			<a href='/board'>boards</a>
		</div>
		<div class='public-link linktype-utility'>
			<a href='/roadmaps'>roadmaps</a>
		</div>
		<div class='public-link linktype-tool hidden'>
			<a href='/page/clock'>clock</a>
		</div>
		<div class='public-link linktype-tool hidden'>
			<a href='/page/weather'>weather</a>
		</div>
		<div class='public-link linktype-finance hidden'>
			<a href='/page/crypto'>crypto tickers</a>
		</div>
		<div class='public-link linktype-chess hidden'>
			<a href='/page/chess'>chess timer</a>
		</div>
	</div>
</div>
`
// <div class='drop-down'>
// 	<div class='drop-toggle'>organization</div>
// 	<div class='drop-down'>
// 		<div class='public-link'>
// 			<a href='/board'>boards</a>
// 		</div>
// 		<div class='public-link'>
// 			<a href='/page/clock'>clock</a>
// 		</div>
// 	</div>
// </div>




const admin_links = request => { 
	if( lib.is_admin( request ) ){
		return `
	<div id='admin-link' class='auth-link'>
		<a href='/admin'>admin</a>
	</div>
	`
	}
	return ''
}

const unlogged_links = `
<div class='drop-down'>
	<div class='drop-toggle'>
		login
	</div>
	<div class='drop-down'>
		<div class='auth-link'>
			<a href='/login'>login</a>
		</div>
		<div class='auth-link'>
			<a href='/register'>register</a>
		</div>
	</div>
</div>
`


const build_header = function( type, request, header ){

	if( header == 'crypto' ) header = 'Emu Trader'

	return `
	<div id='header' data-auth='${ !!lib.is_logged( request ) }' data-admin='${ !!lib.is_admin( request ) }'>
		${ logo }
		<div id='mobile-toggle'>menu</div>
		<div id='links'>
			${ lib.is_logged( request ) ? admin_links( request ) : '' }
			<div id='dark-mode' class='svg-icon-wrap'>
				${ SVGS.dark_mode }
			</div>
			${ main_links }
			${ lib.is_logged( request ) ? logged_links : unlogged_links }
		</div>
	</div>`

}



const page_title = type => {
	return `<h3 class='page-title'>${ type }</h3>`
}



module.exports = function render( type, request, data ){

	try{
	
		let css_includes = styles.base
		let script_includes = ''

		switch( type ){

		case 'index':

			css_includes += styles.auth + styles.index + styles.modal
			script_includes += scripts.index //+ scripts.howler

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ popups }
					${ global_data() }
					${ build_header( type, request, env.SITE_TITLE ) }
					${ build_footer( request ) }
				</body>
			</html>`

		case 'portal':

			css_includes += styles.auth + styles.modal + styles.stripe_all
			script_includes += scripts.auth //+ scripts.howler

			return `
			<html>
				<head>
					${ build_meta()}
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ popups }
					${ global_data() }
					${ build_header( type, request, 'login' )}
					<div id='content'>

						<h3>customer portal</h3>

						<form action="/create-portal-session" method="POST">
					    	<input type="hidden" id="session-id" name="session_id" value="${ data?.session_id }" />
					    	<button id="checkout-and-portal-button" type="submit">Manage your billing information</button>
					    </form>

					</div>
					${ build_footer( request ) }
				</body>
			</html>`



		case 'login':
	   		// <input class='button' type="submit" value="Login" />

			css_includes += styles.auth + styles.modal
			script_includes += scripts.auth //+ scripts.howler

			return `
			<html>
				<head>
					${ build_meta()}
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ popups }
					${ global_data() }
					${ build_header( type, request, 'login' )}
					<div id='content'>

						<div id='login-form' class='auth-form'> 
					        
						    <input class='input' id='email' type="text" placeholder="email"/>
					   		<input class='input' id='password' type="password" placeholder="password"/>
					   		<br>
					   		<div class='button'>Login</div>
					   		<br>
					   		<!-- 
					   		<div id='oauth-providers'>
						   		<div id='github' class='button'>
						   			github
						   		</div>
						   		<br>
						   		<div id='google' class='button'>
						   			google
						   		</div>
						   		<br>
						   	</div>
						   	-->
					   		<div id='forgot'>
					   			<a href='/send_confirm'>
					   				forgot password
					   			</a>
					   		</div>
					    </div>

					</div>
					${ build_footer( request ) }
				</body>
			</html>`


		case 'register':
			// <input class='button' type='submit' value='Register'>

			css_includes += styles.auth + styles.modal
			script_includes += scripts.auth//  + scripts.howler

			return `
			<html>
				<head>
					${ build_meta()}
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ popups }
					${ global_data() }
					${ build_header( type, request, 'register' )}
					<div id='content'>

						<div id='register-form' class='auth-form'>
							<input class='input' type='email' id='email' placeholder="email">
							<input class='input' type='password' id='password' placeholder="password">
							<input class='input' type='password' id='password2' placeholder="password again">
							<div class='button'>Register</div>
						</div>
					
					</div>
					${ build_footer( request ) }
				</body>
			</html>`


		case 'contacts':

			css_includes += styles.auth + styles.contacts + styles.modal  + styles.spreadsheets
			script_includes += scripts.contacts // + scripts.howler

			return `

				<html>

					<head>
						${ build_meta()}
						${ css_includes }
						${ script_includes }
					</head>

					<body class='${ type } emu-contain'>
						${ popups }
						${ global_data() }
						${ build_header( type, request, 'contacts' )}

						<div id='contacts' class='emu-constrain'>

							<div class='button'>add contact</div>

							<input type='text' id='search-bar' class='emu-input' placeholder='type to search'>

							<form id='contactform' class='hidden'>

								<label for='email'>email</label>
								<input class='emu-input' type='email' name='email'>

								<label for='fname'>first name</label>
								<input class='emu-input' type='text' name='fname'>

								<label for='lname'>last name</label>
								<input class='emu-input' type='text' name='lname'>

								<label for='addr1'>address 1</label>
								<input class='emu-input' type='text' name='addr1'>

								<label for='addr2'>address 2</label>
								<input class='emu-input' type='text' name='addr2'>

								<label for='addr3'>address 3</label>
								<input class='emu-input' type='text' name='addr3'>

								<label for='phone'>phone</label>
								<input class='emu-input' type='text' name='phone'>

								<label for='birthdate'>birthdate</label>
								<input class='emu-input' type='text' name='birthdate'>

								<label for='notes'>notes</label>
								<textarea class='emu-input' name='notes'></textarea>

								<br>
								<input type='submit' class='button' value='submit'>

							</form>

							<h3>Contacts:</h3>
							<div class='contact-content'></div>

						</div>

						${ build_footer( request ) }
					</body>

				</html>`


		case 'account':

			css_includes += styles.auth + styles.account + styles.modal
			script_includes += scripts.account // + scripts.howler

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ build_header( type, request, 'account' ) }
					${ popups }
					${ global_data() }
					<div id='content' class='emu-contain'>
						${ page_title( type ) }
						<div id='user-wrap' class='emu-constrain'>
							<!-- emu details here -->
						</div>
						<div id='hosting-wrap' class='emu-constrain'>
							<div id='portal-wrap'>
								<h3>billing info</h3>
								<h4 id='billing-expl'>(for hosting accounts)</h4>
								<!-- stripe portal -->
							</div>
							<div id='active-wrap'>
								<h3>your active subscriptions</h3>

								<!-- active stripe subs -->
							</div>
							<div id='inventory-wrap'>
								<h3>emu hosting options</h3>
								<!-- store inventory -->
							</div>
						</div>
					</div>
					${ build_footer( request ) }
				</body>
			</html>`


		case 'roadmaps': // ( all )

			css_includes += styles.auth + styles.roadmaps + styles.modal
			script_includes += scripts.roadmaps

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ build_header( type, request, 'roadmaps' )}
					${ popups }
					${ global_data() }
					<div id='content'>
					</div>
					<div class='data-embed' id='svg-lock'>${ SVGS.lock_closed }</div>
					<div class='data-embed' id='svg-unlock'>${ SVGS.lock_open }</div>
					<div class='data-embed' id='svg-eye-open'>${ SVGS.eye_open }</div>
					<div class='data-embed' id='svg-eye-closed'>${ SVGS.eye_closed }</div>
					${ build_footer( request ) }
				</body>
			</html>
			`

		case 'roadmap': // ( single )

			css_includes += styles.auth + styles.roadmap + styles.modal + styles.sortable
			script_includes += scripts.roadmap + scripts.sortable

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ build_header( type, request, 'roadmap' )}
					${ popups }
					${ global_data() }
					<div id='content'>
					</div>
					<div class='data-embed' id='svg-gear'>${ SVGS.gear }</div>
					<div class='data-embed' id='svg-lock'>${ SVGS.lock_closed }</div>
					<div class='data-embed' id='svg-unlock'>${ SVGS.lock_open }</div>
					<div class='data-embed' id='svg-eye-open'>${ SVGS.eye_open }</div>
					<div class='data-embed' id='svg-eye-closed'>${ SVGS.eye_closed }</div>
					${ build_footer( request ) }
				</body>
			</html>
			`
		// <ul id='map-milestones' class='data-embed'>
			// ${ data.roadmap?.milestones /* remember it is already a string.. */ }
		// </ul>


		case 'await_confirm':

			css_includes += styles.auth 
			script_includes += scripts.await_confirm //+ scripts.howler

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ build_header( type, request, 'await confirm' )}
					${ popups }
					${ global_data() }
					<div id='content'>
					</div>
					${ build_footer( request ) }
				</body>
			</html>
			`


		case 'admin':

			css_includes += styles.auth + styles.admin + styles.modal
			script_includes += scripts.admin //  + scripts.howler

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ build_header( type, request, 'admin' )}
					${ popups }
					${ global_data() }
					<div id='content' class='emu-contain'>
						${ page_title( type )}
						<div id='admin-views'>
							<!-- all js in here -->
						</div>
						<div id='admin-content' class='emu-constrain'>
						</div>
					</div>
					${ build_footer( request ) }
				</body>
			</html>
			`
		
		case 'confirm':

			css_includes += styles.auth
			script_includes += scripts.howler

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>

					${ popups }
					${ global_data() }
					${ build_header( type, request, 'confirm' )}

					<h4>email confirm</h4>
					${ build_footer( request ) }
				</body>
			</html>`

		case 'board':
			css_includes += styles.board + styles.modal
			script_includes += scripts.board
			// '<script type="module" src="/js/pages/init_' + type + '.js?v=108" defer="defer"></script>'

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ build_header( type, request, '???' )}
					${ popups }
					${ global_data() }
					<div class='emu-contain'>
						<div id='content' class='emu-constrain'>
							

						</div>
					</div>
					${ build_footer( request ) }
				</body>
			</html>
			`

		// case 'mesh':

		// 	css_includes += styles.page + styles.modal + styles.mesh
		// 	script_includes += scripts.mesh + scripts.fabric

		// 	const mesh = data

		// 	return `
		// 	<html>
		// 		<head>
		// 			${ build_meta() }
		// 			${ css_includes }
		// 			${ script_includes }
		// 		</head>
		// 		<body class='${ type } ${ mesh.can_edit( request ) ? 'can-edit' : '' }'>
		// 			${ build_header( type, request, data ) }
		// 			${ popups }
		// 			${ global_data() }

		// 			<div class='emu-contain'>
		// 				<div id='content' class='emu-constrain'>

		// 				</div>
		// 			</div>
		// 			<div id='loaders'>
		// 				<img data-icon_slug='eye.png' id='icon-eye'>
		// 				<img data-icon_slug='pencil.png' id='icon-pencil'>
		// 				<img data-icon_slug='plus.png'>
		// 				<img data-icon_slug='minus.png'>
		// 				<img data-icon_slug='eye.png'>
		// 			</div>
		// 		</body>
		// 	</html>
		// 	`

		// case 'chain':

		// 	css_includes += styles.page + styles.modal + styles.chain
		// 	script_includes += scripts.chain + scripts.fabric

		// 	const chain = data

		// 	return `
		// 	<html>
		// 		<head>
		// 			${ build_meta() }
		// 			${ css_includes }
		// 			${ script_includes }
		// 		</head>
		// 		<body class='${ type } ${ chain.can_edit( request ) ? 'can-edit' : '' }'>
		// 			${ build_header( type, request, data ) }
		// 			${ popups }
		// 			${ global_data() }
		// 			<div class='emu-contain'>
		// 				<div id='content' class='emu-constrain'>

		// 				</div>
		// 			</div>
		// 		</body>
		// 	</html>
		// 	`
	// ${ chain.output_html() }
	// <div id='response-area'>
	// </div>


	// pages

		case 'page':

			// handle board page exception
			let page = request.params.page
			
			// resume normal /page/* handling
			if( pages.includes( page ) ){

				css_includes += styles.page + styles.modal

				css_includes += `<link rel='stylesheet' href='/css/page_${ page }.css?v=108'/>`
				script_includes +='<script type="module" src="/js/pages/init_' + page + '.js?v=108" defer="defer"></script>'
				const p = request.params.page
				if( p === 'crypto' ){ // || p === 'chains' || p === 'meshes'
					script_includes += scripts.fabric
				}

				return `
				<html>
					<head>
						${ build_meta() }
						${ css_includes }
						${ script_includes }
					</head>
					<body class='${ type }'>
						${ build_header( type, request, page )}
						${ popups }
						${ global_data() }
						<div class='emu-contain'>
							<div id='content' class='emu-constrain row'>
								<div class='public-boards column'>
									<h3>public boards</h3>
								</div>
								<div class='account-boards column column-4'>
									<h3>account boards</h3>
								</div>
							</div>
						</div>
						${ build_footer( request ) }
					</body>
				</html>
				`
			}else{

				log('flag', 'invalid page request: ', page )
				return render( '404', request )

			}

	// error handling


		case 'redirect':

			script_includes += scripts.redirect

			return `
			<html>
				<head>
					${ script_includes }
				</head>
				<body class='${ type }'>
					<div id='redirect' data-redirect='${ data }'></div>
					${ build_footer( request ) }
				</body>
			</html>`

		case 'error':

			script_includes += scripts.error
			css_includes += styles.page + styles.modal

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ build_header( type, request, {} )}
					${ popups }
					${ global_data() }
					<div id='content'>
						${ typeof data === 'string' ? data : 'There was an error fulfilling this request' }
					</div>
					${ build_footer( request ) }
				</body>
			</html>
			`

		case '404':

			css_includes += styles.auth
			script_includes += scripts['404']

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ popups }
					${ global_data() }
					${ build_header( type, request, '404' )}
					<div id='content'>
						<div class='fourohfour'>
							nothing to see here - check your URL<br>
							<a href='/'>click here</a> to return to base
						</div>
					</div>
					${ build_footer( request ) }
					</body>
					</html>
				`
		default:

			css_includes += styles.auth
			// script_includes += scripts.howler

			return `
			<html>
				<head>
					${ build_meta() }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='${ type }'>
					${ popups }
					${ global_data() }
					${ build_header( type, request, '404' )}
					<div id='content'>
						<div class='fourohfour'>
							nothing to be found here - check your URL<br>
							<a href='/'>click here</a> to return to base
						</div>
					</div>
					${ build_footer( request ) }
					</body>
					</html>
				`

		}

	}catch( err ){
		log('flag', 'render err: ', err )
		return '<div>error rendering page</div>'
	}

}



