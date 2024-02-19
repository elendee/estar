import env from './env.js'

const data = document.getElementById('global-data')

let g = {}

if( data ){
	try{
		const d = JSON.parse( data.innerHTML )
		for( const key in d ){
			g[ key ]= d[ key ]
		}
	}catch( err ){
		console.error( err )
	}
}

if( env.EXPOSE ) window.GLOBAL = g

export default g