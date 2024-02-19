import log from '../log.js'
import lib from '../lib.js'
import DB from '../db.js'


class Zone extends Modal {
	constructor( init ){
		super( init )
		init = init || {}
		this.uuid = lib.validate_string( init.uuid, undefined )
		this.name = lib.validate_string( init.name, undefined )

	}

	async save(){

		const update_fields = [
			'name',
			'uuid',
		]

		const update_vals = [ 
			this.name,
			this.uuid,
		]

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

}


export default Zone