import env from '../.env.js'
import lib from '../lib.js'
import Model from './Model.js'


class User extends Model {
	constructor( init ){
		super( init )
		init = init || {}
		this._email = lib.validate_string( init.email, init._email , undefined )
		this._password = lib.validate_string( init.password, init._password , undefined )
		this.slug = lib.validate_string( init.slug , `u_${ lib.random_hex(6) }` )
		this.handle = lib.validate_string( init.handle, this.slug )
		this.color = lib.validate_string( init.color, '555599' )
		this._confirmed = lib.validate_string( init.confirmed, init._confirmed , undefined )
		this._reset_time = lib.validate_string( init._reset_time, init.reset_time , undefined )
		this.stripe_id_dev = lib.validate_string( init._stripe_id_dev, init.stripe_id_dev , undefined )
		this.stripe_id_live = lib.validate_string( init._stripe_id_live, init.stripe_id_live , undefined )
		this._notes_private = lib.validate_string( init._notes_private, init.notes_private , undefined )
		this._last_zone = lib.validate_string( init._last_zone, init.last_zone, undefined )

		this.model_url = lib.validate_string( init.model_url, env.DEFAULT_MODEL )

		// instantiated
		this._socket = init._socket

	}

	async save(){

		if( !this.slug ) throw new Error('attempting to save invalid user')

		const update_fields = [
			'email',
			'slug',
			'handle',
			'color',
			'password',
			'confirmed',
			'reset_time',
			'stripe_id_dev',
			'stripe_id_live',
			'notes_private',
			'last_zone',
		]

		const update_vals = [ 
			this._email,
			this.slug,
			this.handle,
			this.color,
			this._password,
			this._confirmed,
			this._reset_time,
			this._stripe_id_dev,
			this._stripe_id_live,
			this._notes_private,
			this._last_zone,
		]

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

}

export default  User