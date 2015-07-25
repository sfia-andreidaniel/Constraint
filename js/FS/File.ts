/// <reference path="../node.d.ts" />
/// <reference path="../UI/Event.ts" />
/// <reference path="../Global.ts" />
/// <reference path="../es6-promise.d.ts" />

class FS_File extends UI_Event {

	private _contents: string = null;

	protected _path: string = null;
	protected _sync: EFileSyncMode = EFileSyncMode.SYNC;
	protected _error: any = null;

	constructor( path: string, mode: EFileSyncMode = EFileSyncMode.SYNC ) {
		super();

		this._path = path;
		this._sync = mode;

		( function( me ) {
			me.on( 'error', function( reason ) {
				me._error = reason;
			} );
		} )( this );
	}

	public open(): FS_File {
		if ( Global.isBrowser ) {
			this.openFileAjax();
		} else {
			this.openFileNode();
		}

		return this;
	}

	get promise(): Thenable<string> {
		if ( this._sync == EFileSyncMode.SYNC || this._contents !== null || this._error !== null ) {
			if ( this._contents !== null ) {
				return Promise.resolve( this._contents );
			} else {
				return Promise.reject( this._error );
			}
		} else {
			return ( function( me ) {

				var result = new Promise( function( fullfill, reject ) {
					
					me.on( 'load', function( ) {
						fullfill( me._contents );
					} );
					
					me.on( 'error', function( reason ) {
						reject( reason );
					} );

				} );

				return result;

			} )( this );
		}
	}

	private openFileAjax() {
		
		var client: XMLHttpRequest = new XMLHttpRequest();

		( function( me ) {

		    client.onload = function() {
		    	if ( this.status == 200 ) {
		    		me._contents = String( this.response );
		    		me.fire( 'load' );
		    	} else {
		    		me.fire( 'error', me._error = new Error( "Failed to open file: " + this._path + ": Invlaid HTTP status code: " + this.status ) );
		    	}
		    }

		    client.onerror = function() {
		    	me.fire( 'error', me._error = new Error( "Failed to open file: " + this._path + ": " + this.statusText ) );
		    }

		} )( this );

		if ( this._sync == EFileSyncMode.SYNC ) {
			client.open( 'GET', this._path, false );
		} else {
			client.open( 'GET', this._path );
		}

		client.send(null);

		if ( this._sync == EFileSyncMode.SYNC ) {

			if ( client.status === 200 ) {
				this._contents = String( client.responseText );
				this.fire( 'load' );
			} else {
				this.fire( 'error', this._error = new Error( "Failed to open file: " + this._path + ": " + client.statusText ) );
			}

		}

	}

	private openFileNode() {

		var fs = require( 'fs' );

		if ( this._sync == EFileSyncMode.SYNC ) {

			if ( !fs.existsSync( this._path ) ) {
				this.fire( 'error', this._error = new Error( "File " + this._path + " doesn't exist" ) );
			}

			var tmp: any;

			try {

				tmp = fs.readFileSync( this._path );
				this._contents = String( tmp || '' ) ;
				this.fire( 'load' );

			} catch (e) {

				this.fire( 'error', this._error = new Error( "Failed to open file: " + this._path ) );

			}

		} else {

			this.fire( 'error', this._error = new Error( 'Async is not implemented in nodejs' ) );

			throw new Error( 'Async file open mode is not implemented under nodejs.' );

		}

	}

	get contents(): string {
		return this._contents;
	}

	public static create( fromPath: string, sync: boolean = true ): FS_File {
		return new FS_File( fromPath, sync ? EFileSyncMode.SYNC : EFileSyncMode.ASYNC );
	}

	public static openAsync( fromPath: string ): Thenable<string> {
		return new FS_File( fromPath, EFileSyncMode.ASYNC ).open().promise;
	}

}