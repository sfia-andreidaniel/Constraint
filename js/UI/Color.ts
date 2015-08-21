class UI_Color {

	public static names = {
		"aliceblue": "#f0f8ff",
		"antiquewhite": "#faebd7",
		"aqua": "#00ffff",
		"aquamarine": "#7fffd4",
		"azure": "#f0ffff",
		"beige": "#f5f5dc",
		"bisque": "#ffe4c4",
		"black": "#000000",
		"blanchedalmond": "#ffebcd",
		"blue": "#0000ff",
		"blueviolet": "#8a2be2",
		"brown": "#a52a2a",
		"burlywood": "#deb887",
		"cadetblue": "#5f9ea0",
		"chartreuse": "#7fff00",
		"chocolate": "#d2691e",
		"coral": "#ff7f50",
		"cornflowerblue": "#6495ed",
		"cornsilk": "#fff8dc",
		"crimson": "#dc143c",
		"cyan": "#00ffff",
		"darkblue": "#00008b",
		"darkcyan": "#008b8b",
		"darkgoldenrod": "#b8860b",
		"darkgray": "#a9a9a9",
		"darkgreen": "#006400",
		"darkkhaki": "#bdb76b",
		"darkmagenta": "#8b008b",
		"darkolivegreen": "#556b2f",
		"darkorange": "#ff8c00",
		"darkorchid": "#9932cc",
		"darkred": "#8b0000",
		"darksalmon": "#e9967a",
		"darkseagreen": "#8fbc8f",
		"darkslateblue": "#483d8b",
		"darkslategray": "#2f4f4f",
		"darkturquoise": "#00ced1",
		"darkviolet": "#9400d3",
		"deeppink": "#ff1493",
		"deepskyblue": "#00bfff",
		"dimgray": "#696969",
		"dodgerblue": "#1e90ff",
		"firebrick": "#b22222",
		"floralwhite": "#fffaf0",
		"forestgreen": "#228b22",
		"fuchsia": "#ff00ff",
		"gainsboro": "#dcdcdc",
		"ghostwhite": "#f8f8ff",
		"gold": "#ffd700",
		"goldenrod": "#daa520",
		"gray": "#808080",
		"green": "#008000",
		"greenyellow": "#adff2f",
		"honeydew": "#f0fff0",
		"hotpink": "#ff69b4",
		"indianred  ": "#cd5c5c",
		"indigo   ": "#4b0082",
		"ivory": "#fffff0",
		"khaki": "#f0e68c",
		"lavender": "#e6e6fa",
		"lavenderblush": "#fff0f5",
		"lawngreen": "#7cfc00",
		"lemonchiffon": "#fffacd",
		"lightblue": "#add8e6",
		"lightcoral": "#f08080",
		"lightcyan": "#e0ffff",
		"lightgoldenrodyellow": "#fafad2",
		"lightgray": "#d3d3d3",
		"lightgreen": "#90ee90",
		"lightpink": "#ffb6c1",
		"lightsalmon": "#ffa07a",
		"lightseagreen": "#20b2aa",
		"lightskyblue": "#87cefa",
		"lightslategray": "#778899",
		"lightsteelblue": "#b0c4de",
		"lightyellow": "#ffffe0",
		"lime": "#00ff00",
		"limegreen": "#32cd32",
		"linen": "#faf0e6",
		"magenta": "#ff00ff",
		"maroon": "#800000",
		"mediumaquamarine": "#66cdaa",
		"mediumblue": "#0000cd",
		"mediumorchid": "#ba55d3",
		"mediumpurple": "#9370db",
		"mediumseagreen": "#3cb371",
		"mediumslateblue": "#7b68ee",
		"mediumspringgreen": "#00fa9a",
		"mediumturquoise": "#48d1cc",
		"mediumvioletred": "#c71585",
		"midnightblue": "#191970",
		"mintcream": "#f5fffa",
		"mistyrose": "#ffe4e1",
		"moccasin": "#ffe4b5",
		"navajowhite": "#ffdead",
		"navy": "#000080",
		"oldlace": "#fdf5e6",
		"olive": "#808000",
		"olivedrab": "#6b8e23",
		"orange": "#ffa500",
		"orangered": "#ff4500",
		"orchid": "#da70d6",
		"palegoldenrod": "#eee8aa",
		"palegreen": "#98fb98",
		"paleturquoise": "#afeeee",
		"palevioletred": "#db7093",
		"papayawhip": "#ffefd5",
		"peachpuff": "#ffdab9",
		"peru": "#cd853f",
		"pink": "#ffc0cb",
		"plum": "#dda0dd",
		"powderblue": "#b0e0e6",
		"purple": "#800080",
		"rebeccapurple": "#663399",
		"red": "#ff0000",
		"rosybrown": "#bc8f8f",
		"royalblue": "#4169e1",
		"saddlebrown": "#8b4513",
		"salmon": "#fa8072",
		"sandybrown": "#f4a460",
		"seagreen": "#2e8b57",
		"seashell": "#fff5ee",
		"sienna": "#a0522d",
		"silver": "#c0c0c0",
		"skyblue": "#87ceeb",
		"slateblue": "#6a5acd",
		"slategray": "#708090",
		"snow": "#fffafa",
		"springgreen": "#00ff7f",
		"steelblue": "#4682b4",
		"tan": "#d2b48c",
		"teal": "#008080",
		"thistle": "#d8bfd8",
		"tomato": "#ff6347",
		"turquoise": "#40e0d0",
		"violet": "#ee82ee",
		"wheat": "#f5deb3",
		"white": "#ffffff",
		"whitesmoke": "#f5f5f5",
		"yellow": "#ffff00",
		"yellowgreen": "#9acd32"
	};

	private _hue: number = 0;
	private _light: number = 0;
	private _saturation: number = 0;

	constructor( 
		private _red: number, 
	    private _green: number, 
	    private _blue: number, 
	    private _alpha: number = 1
	) {
		
		if ( _red < 0 || _red > 255 ) {
			throw new SyntaxError( 'Bad color: red index out of bounds' );
		}

		if ( _green < 0 || _green > 255 ) {
			throw new SyntaxError( 'Bad color: green index out of bounds' );
		}

		if ( _blue < 0 || _blue > 255 ) {
			throw new SyntaxError( 'Bad color: blue index out of bounds' );
		}

		if ( _alpha < 0 || _alpha > 1 ) {
			throw new SyntaxError( 'Bad color: alpha index out of bounds (got: ' + _alpha + ', need 0..1)' );
		}

		this._maintainHLS();
	}

	private _maintainHLS() {
		var r: number = this._red / 255,
		    g: number = this._green / 255,
		    b: number = this._blue / 255,
		    max: number = Math.max( r,g,b ),
		    min: number = Math.min( r,g,b ),
		    h: number,
		    s: number,
		    l: number = ( max + min ) / 2,
		    d: number;

		if ( max == min ) {
			h = s = 0;
		} else {
			d = max - min;
			s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min );
			switch ( max ) {
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}

		this._hue = h;
		this._light = l;
		this._saturation = s;
	}

	private static _hue2rgb_( p: number, q: number, t: number ): number {
        if(t < 0) t += 1;
        if(t > 1) t -= 1;
        if(t < 1/6) return p + (q - p) * 6 * t;
        if(t < 1/2) return q;
        if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
	}

	private _maintainRGB() {
		var r: number,
		    g: number,
		    b: number,
		    h: number = this._hue,
		    s: number = this._saturation,
		    l: number = this._light,
		    q: number,
		    p: number;
		if ( s == 0 ) {
			r = g = b = l;
		} else {
			q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			p = 2 * l - q;
			r = UI_Color._hue2rgb_(p, q, h + 1/3);
			g = UI_Color._hue2rgb_(p, q, h);
			b = UI_Color._hue2rgb_(p, q, h - 1/3);
		}
		this._red = Math.round(r * 255);
		this._green=Math.round(g * 255);
		this._blue= Math.round(b * 255);
	}

	public toString( withAlpha: boolean = false ): string {
		
		if ( withAlpha === null ) {

			if ( this._alpha == 1 ) {
				return this.toString( false );
			} else {
				return this.toString( true );
			}

		} else {

			return withAlpha
				? 'rgba(' + this._red + ',' + this._green + ',' + this._blue + ',' + this._alpha.toFixed(2).replace(/\.00/,'') + ')'
				: 'rgb(' + this._red + ',' + this._green + ',' + this._blue + ')';

		}
	}

	public toLiteral(): string {
		return this.toString();
	}

	public static create( str: string ): UI_Color {

		var matches: string[];

		str = str.toLowerCase();

		// first checi if is a color by name.
		if ( UI_Color.names[ str ] ) {
			str = UI_Color.names[ str ];
		}

		if ( /^\#[a-f\d]{3}$/.test( str ) ) {
			str = '#' + str[1] + str[1] + str[2] + str[2] + str[3] + str[3] + 'ff';
		} else
		if ( /^\#[a-f\d]{6}$/.test( str ) ) {
			str = str + 'ff';
		}

		switch ( true ) {
			case ( matches = /^\#[\da-f]{8}$/.exec( str ) ) ? true : false:
				return new UI_Color( parseInt( str[1] + str[2], 16 ), parseInt( str[3] + str[4], 16 ), parseInt( str[5] + str[6], 16 ), parseInt(str[7] + str[8], 16 ) / 255 );
				break;

			case ( matches = /^rgb\(([\d]+)\,([\d]+)\,([\d]+)\)$/.exec( str ) ) ? true : false:
				return new UI_Color( parseInt( matches[1] ), parseInt( matches[2] ), parseInt( matches[3] ) );
				break;

			case ( matches = /^rgba\(([\d]+)\,([\d]+)\,([\d]+)\,([\d\.]+)\)$/.exec(str) ) ? true : false:
				return new UI_Color( parseInt( matches[1] ), parseInt( matches[2] ), parseInt( matches[3] ), parseFloat( matches[4] ) );
				break;

			default:
				throw SyntaxError( 'Illegal color notation' );
				break;
		}
	}

	get red(): number {
		return this._red;
	}

	get green(): number {
		return this._green;
	}

	get blue(): number {
		return this._blue;
	}

	get alpha(): number {
		return this._alpha;
	}

	set red( v: number ) {
		v = ~~v;
		v = v < 0 ? 0 : ( v > 255 ? 255 : v);
		this._red = v;
		this._maintainHLS();
	}

	set green( v: number ) {
		v = ~~v;
		v = v < 0 ? 0 : ( v > 255 ? 255 : v);
		this._green = v;
		this._maintainHLS();
	}

	set blue( v: number ) {
		v = ~~v;
		v = v < 0 ? 0 : ( v > 255 ? 255 : v);
		this._blue = v;
		this._maintainHLS();
	}

	set alpha( v: number ) {
		v = parseFloat( String( v ) ) || 0;
		v = v < 0 ? 0 : ( v > 1 ? 1 : v);
		this._alpha = v;
	}

	get hue(): number {
		return this._hue;
	}

	set hue( hue: number ) {
		hue = parseFloat( String( hue ) ) || 0;
		hue = hue < 0 ? 0 : ( hue > 1 ? 1 : hue );
		this._hue = hue;
		this._maintainRGB();
	}

	get light(): number {
		return this._light;
	}

	set light( light: number ) {
		light = parseFloat( String( light ) ) || 0;
		light = light < 0 ? 0 : ( light > 1 ? 1 : light );
		this._light = light;
		this._maintainRGB();
	}

	get saturation(): number {
		return this._saturation;
	}

	set saturation( saturation: number ) {
		saturation = parseFloat( String( saturation ) ) || 0;
		saturation = saturation < 0 ? 0 : ( saturation > 1 ? 1 : saturation );
		this._saturation = saturation;
		this._maintainRGB();
	}

}

function rgb( red: number, green: number, blue: number ): string {
	return 'rgb(' + ~~red + ',' + ~~green + ',' + ~~blue + ')';
}

function rgba( red: number, green: number, blue: number, alpha: number ): string {
	return 'rgba(' + ~~red + ',' + ~~green + ',' + ~~blue + ',' + alpha.toFixed(2) + ')';
}