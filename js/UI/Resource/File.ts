class UI_Resource_File extends UI_Event {

	protected _versions: 	IResourceFileVersion[] 	= [];
	protected _disabled: 	boolean 				= false;

	protected _width: 		number 					= 0;
	protected _height: 		number 					= 0;
	protected _loaded: 		boolean 				= false;
	protected _error: 		boolean 				= false;

	protected _img: 		HTMLImageElement;

	constructor( 

	public    owner:      	UI_Resource, 
	public    name:       	string, 
	          
	private   base64Data: 	string

	) {
	
		super();
	
		this._img = new Image();

		( function( me ) {
			me._img.onload = function() {
				me._width = me._img.width;
				me._height= me._img.height;
				me._loaded = true;
				me.fire( 'load' );
			};

			me._img.onerror = function() {
				me._error = true;
				me.fire( 'error loading image: ' + me.owner.name + '/' + me.name );
			}

			me.on( 'load', function() {
				me.owner.fire( 'load', me );
			} );

			me.on( 'error', function() {
				me.owner.fire( 'error', me );
			} );

			me.on( 'change', function() {
				me.owner.requestCSSUpdate();
			} );

		} )( this );

		this._img.src = this.base64Data;
	}

	get loaded(): boolean {
		return this._loaded;
	}

	get error(): boolean {
		return this._error;
	}

	get ready(): boolean {
		return this._loaded || this._error;
	}

	get image(): HTMLImageElement {
		return this._img;
	}

	// weather a "disabled" version of the file is generated.
	// this has nothing to do with the fact that the file is disabled 
	// in some other way or not.
	get disabled(): boolean {
		return this._disabled;
	}

	// when a resource file has it's disabled flag set to TRUE, it can
	// never go back to false again.
	set disabled( disabled: boolean ) {

		disabled = !!disabled;

		if ( disabled != this._disabled && this._disabled === false ) {
			this._disabled = true;
			// Make the rest of the versions also disabled.
			var add: IResourceFileVersion[] = [],
			    i: number = 0,
			    len: number = this._versions.length,
			    version: IResourceFileVersion;
			
			for ( i=0; i<len; i++ ) {
				version = {};
				version['disabled'] = true;
				version['width'] = this._versions[i].width;
				version['height'] = this._versions[i].height;
				version['repeatX'] = this._versions[i].repeatX;
				version['repeatY'] = this._versions[i].repeatY;
				add.push( version );
			}

			for ( i=0; i<len; i++ ) {
				this.addVersion( add[i] );
			}
		}
	}

	get versions(): IResourceFileVersion[] {
		return this._versions;
	}

	public versionExists( v: IResourceFileVersion ) {
		for ( var i=0, len = this._versions.length; i<len; i++ ) {
			if ( this._versions[i].width === v.width &&
				 this._versions[i].height=== v.height &&
				 this._versions[i].repeatX === v.repeatX &&
				 this._versions[i].repeatY === v.repeatY &&
				 this._versions[i].disabled === v.disabled ) {
				return true;
			}
		}
		return false;
	}

	public addVersion( version: IResourceFileVersion ) {
		this._versions.push( version );

		switch ( true ) {
			case !version.repeatX && !version.repeatY:
				UI_Resource.publishFileVersion(
					this.owner.name + '/' + this.name + '/' + version.width + 'x' + version.height + ( version.disabled ? '-disabled' : '' ),
					this,
					version
				);
				break;
			case version.repeatX:
				UI_Resource.publishFileVersion(
					this.owner.name + '/' + this.name + '/' + version.height + '-x' + ( version.disabled ? '-disabled' : '' ),
					this,
					version
				);
				break;
			case version.repeatY:
				UI_Resource.publishFileVersion(
					this.owner.name + '/' + this.name + '/' + version.width + '-y' + ( version.disabled ? '-disabled' : '' ),
					this,
					version
				);
				break;
		}

		this.fire( 'change' );
	}

	// @syntax:
	// <w>x<h>
	// <size>:x
	// <size>:y
	public addVersionFromString( version: string ) {
		var matches: string[],
		    width: number = null,
		    height: number = null,
		    repeatX: boolean = false,
		    repeatY: boolean = false,
		    data: IResourceFileVersion;
		
		switch ( true ) {
			case !!( matches = /^([\d]+)x([\d]+)$/.exec( version ) ):
				width = ~~matches[1];
				height = ~~matches[1];
				break;
			case !!( matches = /^([\d]+)\:(x|y)$/.exec( version ) ):
				if ( matches[2] == 'x' ) {
					height = ~~matches[1];
					repeatX = true;
				} else {
					width = ~~matches[1];
					repeatY = true;
				}
				break;
			default:
				throw new Error( 'Invalid resource file version initialization string: ' + JSON.stringify( version ) );
		}

		data = {
			width: width,
			height: height,
			repeatX: repeatX,
			repeatY: repeatY,
			disabled: false
		};

		if ( !this.versionExists( data ) ) {
			this.addVersion( data );
		}

		if ( this._disabled ) {

			data = {
				width: width,
				height: height,
				repeatX: repeatX,
				repeatY: repeatY,
				disabled: true
			};

			if ( !this.versionExists( data ) ) {
				this.addVersion( data );
			}

		}

	}

}