import ui from '../ui.js'


console.log('redirect')


// decl

const redirect = document.getElementById('redirect')
const to = redirect.getAttribute('data-to')



// init
if( to ){
	location.assign( to )
}