/// <reference path="node.d.ts" />
/// <reference path="UI_Event.ts" />

class FS_File extends UI_Event {

	private _contents: string = null;

	protected _path: string = null;
	protected _sync: EFileSyncMode = EFileSyncMode.SYNC;

	constructor( path: string, mode: EFileSyncMode = EFileSyncMode.SYNC ) {
		super();

		this._path = path;
		this._sync = mode;
	}

	public open(): FS_File {
		if ( typeof window != 'undefined' ) {
			this.openFileAjax();
		} else {
			this.openFileNode();
		}

		return this;
	}

	private openFileAjax() {
		throw Error( 'FS_File: Not implemented reading file as ajax' );
	}

	private openFileNode() {

		var fs = require( 'fs' );

		if ( this._sync == EFileSyncMode.SYNC ) {

			if ( !fs.existsSync( this._path ) ) {
				this.fire( 'error', "File " + this._path + " doesn't exist" );
			}

			var tmp: any;

			try {

				tmp = fs.readFileSync( this._path );
				this._contents = String( tmp || '' ) ;
				this.fire( 'load' );

			} catch (e) {

				this.fire( 'error', "Failed to open file: " + this._path );

			}

		} else {

			throw Error( 'Async file open mode is not implemented under nodejs.' );

		}

	}

	get contents(): string {
		return this._contents;
	}

	public static create( fromPath: string, sync: boolean = true ): FS_File {
		return new FS_File( fromPath, sync ? EFileSyncMode.SYNC : EFileSyncMode.ASYNC );
	}

}