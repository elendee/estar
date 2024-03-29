import log from '../server/log.js'
import env from '../server/.env.js'
import PRIVATE from '../server/data/PRIVATE.js'
import PUBLIC from '../server/data/PUBLIC.js'


const style = type => {
	return `<link rel='stylesheet' href='/css/${ type }.css'>`
}

const script = type => {
	return `<script type='module' src='/js/auth/init_${ type }.js' defer></script>`
}

const scripts = {
	perlin: `<script src='/inc/perlin.js'></script>`
}


// const build_meta = () => 
// 	const fonts = `
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@100;300;500&display=swap" rel="stylesheet">`
const meta = `
<title>${ env.SITE_TITLE }</title>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1">
<meta name="Description" content=" ${ env.SITE_DESC }">
<meta property="og:url" content="${ env.SITE_URL }">
<meta property="og:title" content="${ env.SITE_TITLE }">
<meta property="og:description" content="${ env.SITE_META_DESC }"> 
<meta property="og:image" content="${ env.SITE_IMAGE }"/>
<link rel='icon' href='/resource/media/favicon.ico'/>`
// ${ env.PRODUCTION ? fonts : '' }

const import_maps = {
	three: `
<script type="importmap">
{
    "imports": {
        "three": "/node_modules/three/build/three.module.js",
		"three/addons/": "/node_modules/three/examples/jsm/"
    }
}
</script>`,
}

const global_data = () => {
	return `<div id='global-data'>${ JSON.stringify( PUBLIC ) }</div>`
}

// one time menu init
let header_string = `
<ul>
	<li class='menu-item'>
		<a href='/'>home</a>
	</li>`
for( const type in PRIVATE.PAGES ){
	const item = PRIVATE.PAGES[ type ]
	if( item.menu ){
		header_string += `
		<li class='menu-item'>
			<a href='/${ type }'>${ item.menu }</a>
		</li>`
	}
}
header_string += '</ul>'

const build_header = ( type, request, title ) => {
	return `
	<header id='header'>
		<div id='toggle'>
			menu
		</div>
		<nav id='menu'>
			${ header_string }
		</nav>
	</header>`
}

const css = type => {
	return `<link rel='stylesheet' href='/css/${ type }.css'>`
}

const build_footer = ( request ) => {
	return `<div id='footer'></div>`
}

const popups = `
<div id='alert-contain'>
</div>
`

const render = ( type, request, data ) => {

	// log('flag', 'RENDERINGLLLLLL')

	let css_includes = css('base')
	let script_includes = ``

	switch( type ){
	case 'index':

		// script_includes

		return `
		<html>
			<head>
				${ meta }
				${ css_includes }
				${ script_includes }
			</head>
			<body class='${ type }'>
				${ popups }
				${ global_data() }
				${ build_header( type, request, env.SITE_TITLE ) }
				${ build_footer( request ) }
				woohoo
			</body>
		</html>`

	case 'redirect':
		script_includes += script( type )
		return `
		<html>
			<head>
				${ meta }
				${ css_includes }
				${ script_includes }
			</head>
			<body class='${ type }'>
				${ popups }
				${ global_data() }
				${ build_header( type, request, env.SITE_TITLE ) }
				<div id='content'>
					This page uses javascript to redirect you to: <a href='${ data.redirect }'>${ data.name }</a>.  It seems you have javascript disabled, so you can click the link instead.
				</div>
				<div id='redirect' data-to='${ data.redirect }'></div>
				${ build_footer( request ) }
			</body>
		</html>`

	case 'asdf':
		css_includes += css( type )
		script_includes += script( type ) + scripts.perlin
		log('flag', 'WOWOWOWWOWOOWW', script_includes )
		return `
		<html>
			<head>
				${ meta }
				${ css_includes }
				${ import_maps.three }
				${ script_includes }
			</head>
			<body class='${ type }'>
				${ popups }
				${ global_data() }
				${ build_header( type, request, env.SITE_TITLE ) }
				${ build_footer( request ) }
			</body>
		</html>`

	default: 

		if( !Object.keys( PRIVATE.PAGES ).includes( type ) ){
			return `
			<html>
				<head>
					${ meta }
					${ css_includes }
					${ script_includes }
				</head>
				<body class='404'>
					${ popups }
					${ global_data() }
					${ build_header( '404', request, env.SITE_TITLE ) }

					<div id='content'>
						${ env.SITE_TITLE } 404
					</div>

					${ build_footer( request ) }
				</body>
			</html>`
		}

		script_includes += script( type )
		css_includes += css( type )

		return `
		<html>
			<head>
				${ meta }
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

	}

}


export default render