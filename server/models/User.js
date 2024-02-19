import lib from '../lib.js'
import Model from './Model.js'


class User extends Model {
	constructor( init ){
		super( init )
		this._email = lib.validate_string( init.email, init._email , undefined )
		this.slug = lib.validate_string( init.slug , undefined )
		this.handle = lib.validate_string( init.handle , undefined )
		this.color = lib.validate_string( init.color , undefined )
		this._password = lib.validate_string( init.password, init._password , undefined )
		this._confirmed = lib.validate_string( init.confirmed, init._confirmed , undefined )
		this._reset_time = lib.validate_string( init._reset_time, init.reset_time , undefined )
		this.stripe_id_dev = lib.validate_string( init._stripe_id_dev, init.stripe_id_dev , undefined )
		this.stripe_id_live = lib.validate_string( init._stripe_id_live, init.stripe_id_live , undefined )
		this._notes_private = lib.validate_string( init._notes_private, init.notes_private , undefined )
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
		]

		const res = await DB.update( this, update_fields, update_vals )

		return res

	}

}

export default  User