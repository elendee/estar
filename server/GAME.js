const env = require('./.env.js')
const log = require('./log.js')
const lib = require('./lib.js')
// const DB = require('./db.js')
// const User = require('./models/User.js')



class Game {

	constructor( init ){
		init = init || {}
		this.opening = false
	}

	async init(){

		// ...

	}

}


const game = new Game()



module.exports = game