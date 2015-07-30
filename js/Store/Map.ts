class Store_Map {
	
	private _keys: any;
	private _size: any;

	constructor() {
		this.clear();
	}

	public clear() {
		this._size = 0;
		this._keys = Object.create(null);
	}

	public has( key: any ) {
		return typeof this._keys[ key ] != 'undefined';
	}

	public get( key: any ): any {
		return this._keys[ key ];
	}

	public set( key: any, value: any ) {
		if ( !this.has( key ) ) {
			this._size++;
		}
		this._keys[ String(key) ] = value;
	}

	public delete( key: any ) {
		if ( this.has( key ) ) {
			this._size--;
			delete this._keys[ key ];
		}
	}

	get size(): number {
		return this._size;
	}

}