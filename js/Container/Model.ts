class Container_Model extends UI_Event {

	constructor( protected saveHandler: string, protected data: IIdentifiable = { "id": null } ) {
		super();

		if ( typeof this.data.id == 'undefined' ) {
			this.data.id = null;
		}
	}

	public set( key: string, value: any ) {
		key = String(key || '');
		
		if ( key == '' ) {
			throw new Error('Bad model setter key. Use a non-empty string please!');
		}

		// once the ID of the key is set, we disallow changing it.
		if ( key == 'id' ) {
			if ( this.data.id !== null ) {
				throw new Error('The id property of a model is imutable');
			}
		}

		this.data[key] = value;

		this.fire('set', key, value);
	}

	public get(key: string, defaultValue: any = null ): any {
		
		var result: any;

		key = String(key || '');

		if ( key == '' ) {
			throw new Error('Bad model getter key. Use a non-empty string please!');
		}

		result = typeof this.data.hasOwnProperty(key)
			? this.data[key]
			: defaultValue;

		this.fire('get', key);

		return result;
	}

	public keys(): string[] {
		var out: string[] = [],
			key: string;

		for ( key in this.data ) {
			if ( this.data.hasOwnProperty(key) ) {
				out.push(key);
			}
		}

		return out;
	}

	public save(): Thenable<any> {
		
		this.fire('before-save');

		return (function(self: Container_Model) {
			
			return new Promise(function(accept, reject) {
				Utils.ajax.post(self.saveHandler, {
					"data": JSON.stringify( self.data ),
					"operation": self.data.id === null
						? "insert"
						: "update"
				}).then( function(pongObject: any /* <IIdentifiable>" */) {
					
					var key: string;

					if ( !pongObject ) {
						throw new Error('Server did not returned the updated model back');
					}

					if ( typeof pongObject.id == 'undefined' ) {
						throw new Error('Server did not returned a "id" property in the pong object!');
					}

					for ( key in pongObject ) {
						if ( pongObject.hasOwnProperty && pongObject.hasOwnProperty( key ) ) {
							self.data[key] = pongObject[key];
						}
					}

					setTimeout(function() {
						self.fire('save');
					}, 1);

					accept(self.data);

				})['catch'](function(err) {
					reject(err);
				});
			});

			

		})(this);
	}
}