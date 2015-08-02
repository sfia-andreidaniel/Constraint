/** An UI_Resource has two purposes:
 *  1. To keep a singleton of images the applications need,
 *  2. To automatically build sprite-based css style nodes, in
 *     order to applications benefit from css elements with
 *     different sizes and states.
 */

/// <reference path="../es6-promise.d.ts" />

class UI_Resource extends UI_Event {

	public 		name: string = null;
	public 		files: UI_Resource_File[] = [];
	
	public  	stage: HTMLCanvasElement = document.createElement( 'canvas' );
	public      stageX: HTMLCanvasElement = document.createElement( 'canvas' );
	public      stageY: HTMLCanvasElement = document.createElement( 'canvas' );
	
	protected   cssUpdater: UI_Throttler;
	protected   styleNode: HTMLStyleElement;

	constructor( resourceName: string ) {
	    super();
	    this.name = resourceName;

	    ( function( me ) {
	    	me.cssUpdater = new UI_Throttler( function() {
	    		me.updateCSS();
	    	}, 300 );
	    } )( this );

	    this.styleNode = document.createElement( 'style' );
	    this.styleNode.setAttribute('data-resource-name', this.name );

	    this._setupEvents_();
	}

	get ready(): boolean {

		for ( var i=0, len = this.files.length; i<len; i++ ) {
			if ( this.files[i].ready == false ) {
				return false;
			}
		}

		return true;

	}

	public ensureFile( fileName: string, buffer: string ): UI_Resource_File {
		for ( var i=0, len = this.files.length; i<len; i++ ) {
			if ( this.files[i].name == fileName ) {
				return this.files[i];
			}
		}

		var result: UI_Resource_File = new UI_Resource_File( this, fileName, buffer );

		this.files.push( result );

		return result;
	}

	// whenever a file version is added, a request-css update is made to the resource
	// collection.
	//
	// however, this costs a lot in terms of CPU, so we're throttling it.
	public requestCSSUpdate() {
		this.cssUpdater.run();
	}

	public updateCSS() {

		//document.body.appendChild( this.stage );

		var computedWidth: number = 0,
		    computedHeight: number = 0,
		    i: number = 0,
		    len: number = 0,
		    top: number = 0,
		    left: number = 0,
		    versions: IResourceFileVersion[],
		    paintables: { left: number; top: number; width: number; height: number; file: UI_Resource_File; disabled: boolean; version: IResourceFileVersion }[] = [],
		    
		    stageWidth: number = 0,
		    stageHeight: number = 0,
		    ctx: CanvasRenderingContext2D,
		    imageData: ImageData,
		    disabled: boolean = false,

		    x: number, y: number, dx: number, dy: number, cx: number, cy: number,
		    r: number, g: number, b: number, a: number, avg: number, bi: number,

		    data: any,

		    sprite: string,

		    css: string[] = [];

		for ( i=0, len = this.files.length; i<len; i++ ) {
			if ( this.files[i].ready ) {
				( function( file ) {

					var i: number,
					    len: number,
					    maxRowHeight: number = 0;

					left = 0;
					versions = file.versions;
					

					for ( i=0, len = versions.length; i<len; i++ ) {

						if ( versions[i].repeatX || versions[i].repeatY ) {
							// doit later. Now we're painting non-repeatable elements
							continue;
						}

						maxRowHeight = Math.max( versions[i].height );

						paintables.push({
							left: left,
							top:  top,
							width: versions[i].width,
							height: versions[i].height,
							file: file,
							disabled: versions[i].disabled,
							version: versions[i]
						});

						if ( versions[i].disabled ) {
							disabled = true;
						}

						left += ( versions[i].width + 1 );

					}

					top += maxRowHeight + 1;

					stageHeight = top;
					stageWidth = Math.max( stageWidth, left );

				} )( this.files[i] );
			}
		}

		this.stage.width = stageWidth;
		this.stage.height= stageHeight;

		ctx = this.stage.getContext( '2d' );
		//ctx['imageSmoothingEnabled'] = false;

		ctx.clearRect( 0, 0, stageWidth, stageHeight );

		for ( i=0, len = paintables.length; i<len; i++ ) {
			ctx.drawImage( paintables[i].file.image, paintables[i].left, paintables[i].top, paintables[i].width, paintables[i].height );

		}

		if ( disabled ) {

			imageData = ctx.getImageData(0,0,stageWidth, stageHeight);
			data = imageData.data;

			for ( i=0, len = paintables.length; i<len; i++ ) {
				if ( paintables[i].disabled ) {
					x = paintables[i].left; y = paintables[i].top; dx = paintables[i].left + paintables[i].width - 1; dy = paintables[i].top + paintables[i].height - 1;
					for ( cx = x; cx <= dx; cx++ ) {
						for ( cy = y; cy <= dy; cy++ ) {
							bi = ( cx + cy * stageWidth ) * 4;
							r = data[ bi ]; g = data[ bi + 1 ]; b = data[ bi + 2 ]; a = data[ bi + 3 ];
							if ( a != 1 ) {avg = ( r + g + b ) / 3; if ( avg < 64 ) {avg = 64; } else if ( avg < 128 ) {avg = 128; } else avg = 192;
								data[ bi ] = data[ bi + 1 ] = data[ bi + 2 ] = avg;
							}
						}
					}
				}
			}

			ctx.putImageData( imageData, 0, 0 );

		}

		for ( i=0, len = paintables.length; i<len; i++ ) {
			
			paintables[i].version.window = {
				x: paintables[i].left,
				y: paintables[i].top,
				width: paintables[i].width,
				height: paintables[i].height
			};

		}

		sprite = this.stage.toDataURL();

		css.push( '.ui-resource.' + this.name + '{ background-image: url(' + sprite + '); background-repeat: no-repeat; background-position: 0px 0px; display: inline-block; padding: 0; margin: 0; }' );

		for ( i=0, len = paintables.length; i<len; i++ ) {
			css.push(
				'.ui-resource.' + this.name 
			  + '.' + paintables[i].file.name + '-' + paintables[i].width + 'x' + paintables[i].height 
			  + ( paintables[i].disabled ? '.disabled' : '' ) + ' {'
			  +	'width: ' + paintables[i].width + "px; height: " + paintables[i].height + "px;"
			  + 'background-position: -' + paintables[i].left + "px -" + paintables[i].top + "px;"
			  + '}'
			);
		}

		/* STEP 2. Render stage for x-repetables.
		 */
		paintables = [];
		stageWidth = 4;
		stageHeight = 0;
		disabled = false;
		top = 0;

		for ( i=0, len = this.files.length; i<len; i++ ) {
			if ( this.files[i].ready ) {
				( function( file ) {

					var i: number,
					    versions = file.versions,
					    len = versions.length;

					for ( i=0; i<len; i++ ) {
						if ( versions[i].repeatX ) {
							paintables.push( {
								left: 0,
								top: top,
								width: stageWidth,
								height: versions[i].height,
								file: file,
								disabled: versions[i].disabled,
								version: versions[i]
							} );

							top += ( versions[i].height + 1);

							stageHeight = top;

						}
					}

				} )( this.files[i] );
			}
		}

		// document.body.appendChild( this.stage );

		this.stageX.width = stageWidth;
		this.stageX.height = stageHeight;
		
		ctx = this.stageX.getContext('2d');
		//ctx['imageSmoothingEnabled'] = false;
		
		ctx.clearRect( 0, 0, stageWidth, stageHeight );

		for ( i=0, len = paintables.length; i<len; i++ ) {
			ctx.drawImage( paintables[i].file.image, paintables[i].left, paintables[i].top, paintables[i].width, paintables[i].height );
		}

		if ( disabled ) {

			imageData = ctx.getImageData(0,0,stageWidth, stageHeight);
			data = imageData.data;

			for ( i=0, len = paintables.length; i<len; i++ ) {
				if ( paintables[i].disabled ) {
					x = paintables[i].left; y = paintables[i].top; dx = paintables[i].left + paintables[i].width - 1; dy = paintables[i].top + paintables[i].height - 1;
					for ( cx = x; cx <= dx; cx++ ) {
						for ( cy = y; cy <= dy; cy++ ) {
							bi = ( cx + cy * stageWidth ) * 4;
							r = data[ bi ]; g = data[ bi + 1 ]; b = data[ bi + 2 ]; a = data[ bi + 3 ];
							if ( a != 1 ) {avg = ( r + g + b ) / 3; if ( avg < 64 ) {avg = 64; } else if ( avg < 128 ) {avg = 128; } else avg = 192;
								data[ bi ] = data[ bi + 1 ] = data[ bi + 2 ] = avg;
							}
						}
					}
				}
			}

			ctx.putImageData( imageData, 0, 0 );
		}

		sprite = this.stageX.toDataURL();

		for ( i=0, len = paintables.length; i<len; i++ ) {
			
			paintables[i].version.window = {
				x: paintables[i].left,
				y: paintables[i].top,
				width: paintables[i].width,
				height: paintables[i].height
			};

		}

		css.push( '.ui-resource.' + this.name + '.repeat-x { background-image: url(' + sprite + '); background-repeat: repeat-x; background-position: 0px 0px; display: inline-block; padding: 0; margin: 0; }' );

		for ( i=0, len = paintables.length; i<len; i++ ) {
			css.push(
				'.ui-resource.' + this.name + '.repeat-x'
			  + '.' + paintables[i].file.name + '-' + paintables[i].height 
			  + ( paintables[i].disabled ? '.disabled' : '' ) + ' {'
			  +	'height: ' + paintables[i].height + "px;"
			  + 'background-position: -' + paintables[i].left + "px -" + paintables[i].top + "px;"
			  + '}'
			);
		}

		/* STEP 3. Render stage for y-repetables.
		 */
		paintables = [];
		stageHeight = 4;
		stageWidth = 0;
		disabled = false;
		left = 0;

		for ( i=0, len = this.files.length; i<len; i++ ) {
			if ( this.files[i].ready ) {
				( function( file ) {

					var i: number,
					    versions = file.versions,
					    len = versions.length;

					for ( i=0; i<len; i++ ) {
						if ( versions[i].repeatY ) {
							paintables.push( {
								left: left,
								top: 0,
								width: versions[i].width,
								height: stageHeight,
								file: file,
								disabled: versions[i].disabled,
								version: versions[i]
							} );
							left += ( versions[i].width + 1);

							stageWidth = left;

						}
					}

				} )( this.files[i] );
			}
		}

		//document.body.appendChild( this.stage );

		this.stageY.width = stageWidth;
		this.stageY.height = stageHeight;
		
		ctx = this.stageY.getContext('2d');
		//ctx['imageSmoothingEnabled'] = false;

		ctx.clearRect( 0, 0, stageWidth, stageHeight );

		for ( i=0, len = paintables.length; i<len; i++ ) {
			ctx.drawImage( paintables[i].file.image, paintables[i].left, paintables[i].top, paintables[i].width, paintables[i].height );
		}

		if ( disabled ) {

			imageData = ctx.getImageData(0,0,stageWidth, stageHeight);
			data = imageData.data;

			for ( i=0, len = paintables.length; i<len; i++ ) {
				if ( paintables[i].disabled ) {
					x = paintables[i].left; y = paintables[i].top; dx = paintables[i].left + paintables[i].width - 1; dy = paintables[i].top + paintables[i].height - 1;
					for ( cx = x; cx <= dx; cx++ ) {
						for ( cy = y; cy <= dy; cy++ ) {
							bi = ( cx + cy * stageWidth ) * 4;
							r = data[ bi ]; g = data[ bi + 1 ]; b = data[ bi + 2 ]; a = data[ bi + 3 ];
							if ( a != 1 ) {avg = ( r + g + b ) / 3; if ( avg < 64 ) {avg = 64; } else if ( avg < 128 ) {avg = 128; } else avg = 192;
								data[ bi ] = data[ bi + 1 ] = data[ bi + 2 ] = avg;
							}
						}
					}
				}
			}

			ctx.putImageData( imageData, 0, 0 );
		}

		sprite = this.stageY.toDataURL();

		for ( i=0, len = paintables.length; i<len; i++ ) {
			
			paintables[i].version.window = {
				x: paintables[i].left,
				y: paintables[i].top,
				width: paintables[i].width,
				height: paintables[i].height
			};

		}

		css.push( '.ui-resource.' + this.name + '.repeat-y { background-image: url(' + sprite + '); background-repeat: repeat-y; background-position: 0px 0px; display: inline-block; padding: 0; margin: 0; }' );

		for ( i=0, len = paintables.length; i<len; i++ ) {
			css.push(
				'.ui-resource.' + this.name + '.repeat-y'
			  + '.' + paintables[i].file.name + '-' + paintables[i].width 
			  + ( paintables[i].disabled ? '.disabled' : '' ) + ' {'
			  +	'width: ' + paintables[i].width + "px;"
			  + 'background-position: -' + paintables[i].left + "px -" + paintables[i].top + "px;"
			  + '}'
			);
		}

		paintables = [];
		sprite = '';

		this.styleNode.textContent = css.join( '\n' );

		if ( !this.styleNode.parentNode ) {
			document.getElementsByTagName('head')[0].appendChild( this.styleNode );
		}
	}

	public _setupEvents_() {
		( function( me ) {

			me.on( 'load', function( file: UI_Resource_File ) {
				//console.log( 'loaded: ' + me.name + '/' + file.name );
				
				if ( me.ready ) {
					UI_Resource.onResourceLoaded( me );
				}

			} );

			me.on( 'error', function( file: UI_Resource_File ) {
	
				console.warn( 'error: ' + me.name + '/' + file.name );
				
				if ( me.ready ) {
					UI_Resource.onResourceLoaded( me );
				}
				
				
			} );

		} )( this );
	}


	public static resources : UI_Resource[] = [];
	public static files 	: any = {};

	public static addResourceFile( resourceName: string, fileURI: string ) {

		if ( !Global.isBrowser )
			return;

		UI_Resource.onResourceQueue( resourceName );

		FS_File.openAsync( fileURI ).then( function( fileData: string ) {
			UI_Resource.addResource( fileData, resourceName );
		} )['catch']( function( err: string ) {
			UI_Resource.onResourceFailed( resourceName );
			console.error( 'Failed to load resource: ' + resourceName + ': ' + err );
		} );

	}

	public static publishFileVersion( path: string, file: UI_Resource_File, version: IResourceFileVersion ) {
		UI_Resource.files[ path ] =
			UI_Resource.files[ path ] || {
				"file": file,
				"version": version
			};
	}

	public static createSprite( spritePath: string ): UI_Sprite {
		if ( UI_Resource.files[ spritePath ] ) {
			return <UI_Sprite>UI_Resource.files[ spritePath ].sprite ||
			( UI_Resource.files[ spritePath ].sprite = new UI_Sprite(
				UI_Resource.files[ spritePath ].file,
				UI_Resource.files[ spritePath ].version,
				spritePath
			) )
		} else {
			return new UI_Sprite_Null(spritePath);
		}
	}

	public static addResource( buffer: string, resourceName: string ) {
		var files = buffer.split( '\n\n' ),
		    i: number = 0,
		    len: number = files.length,
		    j: number,
		    k: number,
		    matches: string[],
		    versions: string[] = [],
		    disabled: boolean = false,
		    fname: string,
		    resource: UI_Resource = null,
		    file: UI_Resource_File;

		// Add resource if not found, use existing resource if already existing
		for ( i=0, len = UI_Resource.resources.length; i<len; i++ ) {
			if ( UI_Resource.resources[i].name == resourceName ) {
				resource = UI_Resource.resources[i];
				break;
			}
		}

		if ( resource === null ) {
			resource = new UI_Resource( resourceName );
			UI_Resource.resources.push( resource );
		}

		for ( i=0, len = files.length; i<len; i++ ) {
			if ( !files[i] ) {
				continue;
			}

			matches = files[i].split( ' ' );

			if ( matches.length < 2 ) {
				UI_Resource.onResourceFailed( resourceName );
				throw new Error( 'Corrupted resource: ' + resourceName );
			}

			disabled = false;
			fname = matches[0];

			file = resource.ensureFile( matches[0], matches[ matches.length - 1 ] );

			matches.shift();
			matches.pop();

			if ( matches.indexOf( 'disabled' ) > -1 ) {
				file.disabled = true;
				matches.splice( matches.indexOf( 'disabled' ), 1 );
			}

			if ( matches.length ) {
				versions = JSON.parse( matches[0] );
				for ( j=0, k = versions.length; j<k; j++ ) {
					file.addVersionFromString( versions[j] );
				}
			}

		}
		
	}

	public static queuedResources: string[] = [];
	public static loadedResources: string[] = [];
	public static failedResources: string[] = [];
	public static subscribers: { requirements: string[]; accept: any; reject: any }[] = [];

	public static onResourceQueue( resourceName: string ) {
		if ( UI_Resource.queuedResources.indexOf( resourceName ) > -1 ) {
			UI_Resource.queuedResources.push( resourceName );
		}

		if ( UI_Resource.failedResources.indexOf( resourceName ) > -1 ) {
			UI_Resource.failedResources.splice( UI_Resource.failedResources.indexOf( resourceName ) );
		}
	}

	public static onResourceStatusChanged( ) {

		var name: string,
		    subscriber: { requirements: string[]; accept: any; reject: any } = null,
		    loaded: number = 0;

		for ( var len = UI_Resource.subscribers.length - 1, i=len; i >= 0; i-- ) {
			
			subscriber = UI_Resource.subscribers[i];

			for ( var j=0, n = subscriber.requirements.length; j<n; j++ ) {
				
				name = subscriber.requirements[ j ];

				// If anything in the error loop, reject.
				if ( UI_Resource.failedResources.indexOf( name ) > -1 ) {

					console.log( 'UI_RES failed: ' + name );

					// mark for deletion
					UI_Resource.subscribers.splice( i, 1 );

					subscriber.reject( new Error( 'Failed to load resource: ' + name ) );

					break;

				} else 

				if ( UI_Resource.queuedResources.indexOf( name ) > -1 ) {
					// still loading
					break;
				}

				else

				if ( UI_Resource.loadedResources.indexOf( name ) > -1 ) {
					loaded++;
				}

			}

			if ( loaded == n ) {
				UI_Resource.subscribers.splice( i, 1 );
				subscriber.accept( true );
			}

		}
	}

	public static onResourceLoaded( resource: UI_Resource ) {

		resource.updateCSS();

		if ( UI_Resource.queuedResources.indexOf( resource.name ) > -1 ) {
			UI_Resource.queuedResources.splice( UI_Resource.queuedResources.indexOf( resource.name ), 1 );
		}

		if ( UI_Resource.loadedResources.indexOf( resource.name ) == -1 ) {
			UI_Resource.loadedResources.push( resource.name );
			UI_Resource.onResourceStatusChanged();
		}

	}

	public static onResourceFailed( resourceName: string ) {

		if ( UI_Resource.queuedResources.indexOf( resourceName ) > -1 ) {
			UI_Resource.queuedResources.splice( UI_Resource.queuedResources.indexOf( resourceName ), 1 );
		}

		if ( UI_Resource.failedResources.indexOf( resourceName ) == -1 ) {
			UI_Resource.failedResources.push( resourceName );
			UI_Resource.onResourceStatusChanged();
		}

	}

	public static require( resources: string[] ): Thenable<boolean> {
			
			var result: Thenable<boolean>;

			result = new Promise( function( accept, reject ) {
				UI_Resource.subscribers.push( { requirements: resources, accept: accept, reject: reject } );
			} );

			UI_Resource.onResourceStatusChanged();

			return result;
	}

}

Constraint.registerClass( {
	"name": "UI_Resource",
	"properties": [
		{
			"name": "string",
			"type": "string"
		}
	]
} );
