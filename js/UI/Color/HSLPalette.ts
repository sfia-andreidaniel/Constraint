class UI_Color_HSLPalette extends UI_Canvas {
	
	private _hue: number = 0;
	private _sat: number = 0;

	constructor( owner: UI ) {
		super( owner );
	}

	public render() {
		
		var ctx = this.globalContext,
		    width = this.viewportWidth,
		    height = this.viewportHeight,
		    light = 1,
		    imageData = ctx.createImageData( width, height ),
		    i: number,
		    j: number,
		    rgb: IRGBPixel,
		    index: number = 0,
		    hueX: number = 0,
		    hueY: number = 0;


		for ( j=0; j<height; j++ ) {

			light = parseFloat( ( ( height - j ) / height ).toPrecision(5) );

			rgb = UI_Color.HSL2RGB( this._hue == 0 ? 0 : this._hue / 240, this._sat == 0 ? 0 : this._sat / 240, light );

			for ( i=0; i<width; i++ ) {

				imageData.data[ index ] = rgb.r;
				imageData.data[ index + 1 ] = rgb.g;
				imageData.data[ index + 2 ] = rgb.b;
				imageData.data[ index + 3 ] = 255;

				index += 4;

			}

		}

		ctx.putImageData( imageData, 0, 0 );

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

}
