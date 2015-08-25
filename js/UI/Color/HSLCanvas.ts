class UI_Color_HSLCanvas extends UI_Canvas implements IFocusable {
	
	public    active: boolean; // the active is overrided by the MFocusable mixin
	public    wantTabs: boolean = false;
	public    tabIndex: number = 0;
	public    includeInFocus: boolean = true;
	public    accelerators: string;

	private _hue: number = 0;
	private _sat: number = 0;

	constructor( owner: UI ) {
		super( owner, [ 'IFocusable' ] );
	}

	public render() {
		
		var ctx = this.globalContext,
		    width = this.viewportWidth,
		    height = this.viewportHeight,
		    hueStep = parseFloat( ( 1 / width ).toFixed( 6 ) ),
		    satStep = parseFloat( ( 1 / height ).toFixed( 6 ) ),
		    light = 0.5,
		    hue = 0,
		    sat = 1,
		    imageData = ctx.createImageData( width, height ),
		    i: number,
		    j: number,
		    rgb: IRGBPixel,
		    index: number = 0,
		    hueX: number = 0,
		    hueY: number = 0;


		for ( j=0; j<height; j++ ) {

			hue = 0;

			for ( i=0; i<width; i++ ) {

				hue += hueStep;

				rgb = UI_Color.HSL2RGB( hue, sat, light );

				imageData.data[ index ] = rgb.r;
				imageData.data[ index + 1 ] = rgb.g;
				imageData.data[ index + 2 ] = rgb.b;
				imageData.data[ index + 3 ] = 255;

				index += 4;

			}

			sat -= satStep;

		}

		ctx.putImageData( imageData, 0, 0 );

		ctx.fillStyle = 'black';

		hueX = this._hue == 0 ? 0 : width  / ( 240 / this._hue );
		hueY = this._sat == 0 ? 0 : height / ( 240 / this._sat );

		hueY = height - hueY;

		ctx.fillRect( hueX - 1, hueY - 12, 2, 10 );
		ctx.fillRect( hueX - 1, hueY + 2,  2, 10 );
		ctx.fillRect( hueX - 12, hueY - 1, 10, 2 );
		ctx.fillRect( hueX + 1, hueY - 1, 10, 2 );
	}

	get hue(): number {
		return this._hue;
	}

	set hue( hue: number ) {
		hue = ~~hue;
		hue = hue < 0 ? 0 : ( hue > 240 ? 240 : hue );
		if ( hue != this._hue ) {
			this._hue = hue;
			this.render();
		}
	}

	get sat(): number {
		return this._sat;
	}

	set sat( sat: number ) {
		sat = ~~sat;
		sat = sat < 0 ? 0 : ( sat > 240 ? 240 : sat );
		if ( sat != this._sat ) {
			this._sat = sat;
			this.render();
		}
	}

	protected _setupEvents_() {
		super._setupEvents_();

		( function( me ) {

			var dragging: boolean = false;

			function endDrag( ev ) {
				document.body.removeEventListener( 'mouseup', endDrag, true );
				dragging = false;
			}

			me.on( 'mousemove', function( point: IPoint ) {

				if ( !dragging || me.disabled ) {
					return;
				}

				var width: number = me.viewportWidth,
				    height: number = me.viewportHeight;

				me.hue = 240 * ( point.x / width );
				me.sat = 240 * ( ( height - point.y ) / height );

				me.fire( 'change' );

			} );

			me.on( 'mousedown', function( point: IPoint, which: number ) {
				
				if ( me.disabled || which != 1 ) {
					return;
				}

				dragging = true;

				document.body.addEventListener( 'mouseup', endDrag );

			} );

			me.on( 'keydown', function( ev ) {

				if ( me.disabled ){
					return;
				}

				var code = ev.keyCode || ev.charCode;

				switch ( code ) {

					case Utils.keyboard.KB_LEFT:
						me.hue -= ev.ctrlKey ? 1 : 10;
						me.fire( 'change' );
						break;

					case Utils.keyboard.KB_RIGHT:
						me.hue += ev.ctrlKey ? 1 : 10;
						me.fire( 'change' );
						break;

					case Utils.keyboard.KB_DOWN:
						me.sat -= ev.ctrlKey ? 1 : 10;
						me.fire( 'change' );
						break;

					case Utils.keyboard.KB_UP:
						me.sat += ev.ctrlKey ? 1 : 10;
						me.fire( 'change' );
						break;

				}

			} );

		} )( this );

	}

}

Mixin.extend( 'UI_Color_HSLCanvas', 'MFocusable' );