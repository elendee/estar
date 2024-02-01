import env from '../server/.env.js'


const style = type => {
	return `<link rel='stylesheet' href='/css/${ type }.css'>`
}

const script = type => {
	return `<script type='module' defer='defer' src='/js/${ type }.js'>`
}


const build_meta = () => {

// 	const fonts = `
// <link rel="preconnect" href="https://fonts.googleapis.com">
// <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
// <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@100;300;500&display=swap" rel="stylesheet">`

	return `
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

}

const global_data = () => {
	return ``
}

const build_header = ( type, request, title ) => {
	return ``
}

const build_footer = ( request ) => {
	return ``
}

const popups = ``

const render = ( type, request, data ) => {

	// log('flag', 'RENDERINGLLLLLL')

	const css_includes = ``
	const script_includes = ``

	switch( type ){
	case 'index':
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
	default: 
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
	}

}


export default render