class Container extends UI_Event {
	
	protected _keys: any = {};

	constructor() {
		super();
	}

	public get( id: string ): ( ...args: any[] ) => Thenable<Container_Model> {
		id = String(id || '') || '';
		
		if ( !id ) {
			throw new Error('Invalid argument!');
		}

		if ( typeof this._keys[id] != 'undefined' ) {
			return this._keys[id];
		} else {
			throw new Error("This container does not provide a '" + id + "'" );
		}
	}

	public has( id: string ): boolean {
		id = String(id || '') || '';
		return id != '' && typeof this._keys[id] != 'undefined';
	}

	public set( id: string, value: any ) {
		id = String(id || '') || '';

		if ( !id ) {
			throw new Error('Invalid argument!');
		}

		this._keys[id] = value;
	}

	public unset( id: string ) {
		id = String(id || '') || '';

		if ( typeof this._keys[ id ] != 'undefined' ) {
			delete this._keys[id];
			return true;
		} else {
			return false;
		}
	}


}