/**
 * Standard Dialog - Color Box - Enables the user to select a color.
 *
 * **Usage**
 *
 *     UI_Dialog_ColorBox.create( form: UI_Form ).then( function( color: UI_Color ) {
 *   	 	// color is NULL if the user clicked on the Cancel button, or a valid UI_Color
 *     } );
 *
 * Sample UI_Dialog_ColorBox:
 *
 * ![ui-dialog-colorbox](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Dialog_ColorBox.png "UI_Dialog_ColorBox")
 */
class UI_Dialog_ColorBox extends UI_Form {

	public static recentColors: string[] = [
		'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 
		'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)', 'rgb(255,255,255)'
	];
	public static recentColorIndex: number = 0;

	public hsl: UI_Color_HSLCanvas;
	public pal: UI_Color_HSLPalette;
	public lum: UI_VerticalSlider;

	public labelRed: UI_Label;
	public labelGreen: UI_Label;
	public labelBlue: UI_Label;

	public labelHue: UI_Label;
	public labelSat: UI_Label;
	public labelLum: UI_Label;

	public labelBasicColors: UI_Label;
	public labelRecentColors: UI_Label;
	public labelSolidColor: UI_Label;

	public iRed: UI_Spinner;
	public iGreen: UI_Spinner;
	public iBlue: UI_Spinner;

	public iHue: UI_Spinner;
	public iLum: UI_Spinner;
	public iSat: UI_Spinner;

	public basicColors: UI_Color_List;
	public recentColors: UI_Color_List;

	public addBasic: UI_Button;
	public btnOk: UI_Button;
	public btnCancel: UI_Button;

	public sample: UI_Color_Sample;

	protected _recentColorIndex: number = 0;

	constructor() {
		super();

		this.onInitialize();
	}

	public onInitialize() {
		
		this.hsl = new UI_Color_HSLCanvas( this );
		this.hsl.right = 50;
		this.hsl.top = 20;
		this.hsl.width = 180;
		this.hsl.height = 190;
	
		this.lum = new UI_VerticalSlider( this );
		this.lum.right = 28;
		this.lum.top = 20;
		this.lum.height = 192;
		this.lum.width = 20;
		this.lum.min = 0;
		this.lum.max = 240;
		this.lum.steps = 240;

		this.pal = new UI_Color_HSLPalette( this );
		this.pal.right = 10;
		this.pal.top = 20;
		this.pal.width = 15;
		this.pal.height = 190;

		this.labelRed = new UI_Label( this );
		this.labelRed.caption = 'Red';
		this.labelRed.top  = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "hsl", "distance": 20 } );
		this.labelRed.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 0 });

		this.labelGreen = new UI_Label( this );
		this.labelGreen.caption = 'Green';
		this.labelGreen.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelRed", "distance": 10 } );
		this.labelGreen.left= UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT, "target": "hsl", "distance": 0 } );

		this.labelBlue = new UI_Label( this );
		this.labelBlue.caption = 'Blue';
		this.labelBlue.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelGreen", "distance": 10 } );
		this.labelBlue.left= UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT, "target": "hsl", "distance": 0 } );

		this.labelHue = new UI_Label( this );
		this.labelHue.caption = 'Hue';
		this.labelHue.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "hsl", "distance": 20 } );
		this.labelHue.left = UI_Anchor_Literal.create( {"alignment": EAlignment.LEFT, "target": "hsl", "distance": 120 } );

		this.labelSat = new UI_Label( this );
		this.labelSat.caption = 'Sat';
		this.labelSat.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelHue", "distance": 10 } );
		this.labelSat.left = UI_Anchor_Literal.create( {"alignment": EAlignment.LEFT, "target": "hsl", "distance": 120 } );

		this.labelLum = new UI_Label( this );
		this.labelLum.caption = 'Lum';
		this.labelLum.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelSat", "distance": 10 } );
		this.labelLum.left = UI_Anchor_Literal.create( {"alignment": EAlignment.LEFT, "target": "hsl", "distance": 120 } );

		this.iRed = new UI_Spinner( this );
		this.iRed.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "hsl", "distance": 15 } );
		this.iRed.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 45 } );
		this.iRed.width = 55;
		this.iRed.min = 0;
		this.iRed.max = 255;

		this.iGreen = new UI_Spinner( this );
		this.iGreen.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "iRed", "distance": 8 } );
		this.iGreen.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 45 } );
		this.iGreen.width = 55;
		this.iGreen.min = 0;
		this.iGreen.max = 255;

		this.iBlue = new UI_Spinner( this );
		this.iBlue.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "iGreen", "distance": 8 } );
		this.iBlue.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 45 } );
		this.iBlue.width = 55;
		this.iBlue.min = 0;
		this.iBlue.max = 255;

		this.iHue = new UI_Spinner( this );
		this.iHue.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "hsl", "distance": 15 } );
		this.iHue.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 160 } );
		this.iHue.width = 55;
		this.iHue.min = 0;
		this.iHue.max = 240;

		this.iSat = new UI_Spinner( this );
		this.iSat.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "iHue", "distance": 8 } );
		this.iSat.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 160 } );
		this.iSat.width = 55;
		this.iSat.min = 0;
		this.iSat.max = 240;

		this.iLum = new UI_Spinner( this );
		this.iLum.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "iSat", "distance": 8 } );
		this.iLum.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 160 } );
		this.iLum.width = 55;
		this.iLum.min = 0;
		this.iLum.max = 240;

		this.iRed.value = 0;
		this.iGreen.value = 0;
		this.iBlue.value = 0;

		this.labelBasicColors = new UI_Label( this );
		this.labelBasicColors.caption = 'Basic colors';
		this.labelBasicColors.left = 20;
		this.labelBasicColors.top = 20;

		this.labelRecentColors = new UI_Label( this );
		this.labelRecentColors.caption = 'Recent colors';
		this.labelRecentColors.left = 20;
		this.labelRecentColors.top = 175;

		this.basicColors = new UI_Color_List( this );
		this.basicColors.left = 20;
		this.basicColors.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelBasicColors", "distance": 0 } );
		this.basicColors.bottom = UI_Anchor_Literal.create( { "alignment": EAlignment.TOP, "target": "labelRecentColors", "distance": 10 } );
		this.basicColors.right = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT, "target": "hsl", "distance": 20 } );
		this.basicColors.colors = [ 
			'rgb(255,128,128)', 'rgb(255,255,128)', 'rgb(128,255,128)', 'rgb(0,255,128)',   'rgb(128,255,255)', 'rgb(0,128,255)',   'rgb(255,128,192)', 'rgb(255,128,255)',
			'rgb(255,0,0)',     'rgb(255,255,0)',   'rgb(128,255,0)',   'rgb(0,255,64)',    'rgb(0,255,255)',   'rgb(0,128,192)',   'rgb(128,128,192)', 'rgb(255,0,255)',
			'rgb(0,80,90)',     'rgb(255,128,64)',  'rgb(0,255,0)',     'rgb(0,128,128)',   'rgb(0,64,128)',    'rgb(128,128,255)', 'rgb(128,0,64)',    'rgb(255,0,128)',
			'rgb(128,0,0)',     'rgb(255,128,0)',   'rgb(0,128,0)',     'rgb(0,128,64)',    'rgb(0,0,255)',     'rgb(0,0,160)',     'rgb(128,0,128)',   'rgb(128,0,255)',
			'rgb(64,0,0)',      'rgb(128,64,0)',    'rgb(0,64,0)',      'rgb(0,64,64)',     'rgb(0,0,128)',     'rgb(0,0,64)',      'rgb(64,0,64)',     'rgb(64,0,128)',
			'rgb(0,0,0)',       'rgb(128,128,0)',   'rgb(128,128,64)',  'rgb(128,128,128)', 'rgb(64,128,128)',  'rgb(192,192,192)', 'rgb(64,0,64)',     'rgb(255,255,255)'
		];

		this.basicColors.colorBoxWidth = 20;
		this.basicColors.colorBoxHeight = 12;
		this.basicColors.colorBoxMargin = 8;

		this.recentColors = new UI_Color_List( this );
		this.recentColors.left = 20;
		this.recentColors.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelRecentColors", "distance": 0 } );
		this.recentColors.right = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT, "target": "hsl", "distance": 20 } );
		this.recentColors.height = 50;

		this._recentColorIndex = UI_Dialog_ColorBox.recentColorIndex;
		this.recentColors.colors = UI_Dialog_ColorBox.recentColors;

		this.recentColors.colorBoxWidth = 20;
		this.recentColors.colorBoxHeight = 12;
		this.recentColors.colorBoxMargin = 8;

		this.labelSolidColor = new UI_Label( this );
		this.labelSolidColor.left = 20;
		this.labelSolidColor.right = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT, "target": "hsl", "distance": 20 } );
		this.labelSolidColor.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "recentColors", "distance": 0 } );
		this.labelSolidColor.caption = 'Solid color';

		this.addBasic = new UI_Button( this );
		this.addBasic.right = UI_Anchor_Literal.create( { "alignment": EAlignment.RIGHT, "target": "pal", "distance": 0 });
		this.addBasic.bottom = 20;
		this.addBasic.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT, "target": "hsl", "distance": 0 } );
		this.addBasic.caption = '<< Add to Recent Colors';

		this.btnOk = new UI_Button( this );
		this.btnOk.bottom = 20;
		this.btnOk.left = 20;
		this.btnOk.width = 50;
		this.btnOk.accelerators = 'enter';
		this.btnOk.caption = 'Ok';

		this.sample = new UI_Color_Sample( this );
		this.sample.left = 20;
		this.sample.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelSolidColor", "distance": 10 } );
		this.sample.width = 50;
		this.sample.bottom = UI_Anchor_Literal.create( { "alignment": EAlignment.TOP, "target": "btnOk", "distance": 20 } );

		this.btnCancel = new UI_Button( this );
		this.btnCancel.bottom = 20;
		this.btnCancel.left = UI_Anchor_Literal.create( { "alignment": EAlignment.RIGHT, "target": "btnOk", "distance": 20 } );
		this.btnCancel.width = 80;
		this.btnCancel.accelerators = 'esc';
		this.btnCancel.caption = 'Cancel';

		this.width = 500;
		this.height= 380;
		this.caption = 'Pick a color';
		this.formStyle = EFormStyle.MDI;
		this.borderStyle = EBorderStyle.NONE;
		this.placement = EFormPlacement.CENTER;

		this.maintainHLS();

		( function( me ) {

			me.addBasic.on( 'click', function() {
				me.saveCurrentColor();
			} );

			me.hsl.on( 'change', function() {
				me.iHue.value = me.pal.hue = me.hsl.hue;
				me.iSat.value = me.pal.sat = me.hsl.sat;
				me.maintainRGB();
			} );

			me.iHue.on( 'change', function() {
				me.hsl.hue = me.pal.hue = me.iHue.value;
				me.maintainRGB();
			} );

			me.iSat.on( 'change', function() {
				me.hsl.sat = me.pal.sat = me.iSat.value;
				me.maintainRGB();
			} );

			me.iLum.on( 'change', function() {
				me.lum.step = 240 - me.iLum.value;
				me.maintainRGB();
			} );

			me.lum.on( 'change', function() {
				me.iLum.value = 240 - me.lum.value;
				me.maintainRGB();
			} );

			me.basicColors.on( 'change', function() {
				var val: IRGBPixel = UI_Color.create( this.value ).toPixel;

				me.iRed.value = val.r;
				me.iGreen.value = val.g;
				me.iBlue.value = val.b;

				me.maintainHLS();
			} );

			me.recentColors.on( 'change', function() {
				var val: IRGBPixel =UI_Color.create( this.value ).toPixel;

				me.iRed.value = val.r;
				me.iGreen.value = val.g;
				me.iBlue.value = val.b;

				me.maintainHLS();
			} );

			me.iRed.on( 'change', function() {
				me.maintainHLS();
			} );

			me.iGreen.on( 'change', function() {
				me.maintainHLS();
			} );

			me.iBlue.on( 'change', function() {
				me.maintainHLS();
			} );

			me.btnOk.on( 'click', function() {
				me.fire( 'message', UI_Color.create( "rgb(" + me.iRed.value + ',' + me.iGreen.value + ',' + me.iBlue.value +')' ) );
				me.close();
			} );

			me.btnCancel.on( 'click', function() {
				me.close();
			} );

			me.on( 'close', function() {
				me.fire( 'message', null );
			} );

			me.on( 'open', function() {
				me.basicColors.active = true;
			} );


		} )( this );

	}

	private maintainRGB() {

		var color: IRGBPixel = UI_Color.HSL2RGB( ~~this.iHue.value / 240, ~~this.iSat.value / 240, ~~this.iLum.value / 240 );

		this.iRed.value = color.r;
		this.iGreen.value = color.g;
		this.iBlue.value = color.b;

		this.sample.color = 'rgb(' + ~~this.iRed.value + ',' + ~~this.iGreen.value + ',' + ~~this.iBlue.value + ')';
	}

	private maintainHLS() {

		var color: UI_Color = new UI_Color( ~~this.iRed.value, ~~this.iGreen.value, ~~this.iBlue.value );

		this.sample.color = color.toString();

		this.iHue.value =
		this.hsl.hue =
		this.pal.hue = ~~( color.hue * 240 );

		this.iLum.value = ~~( color.light * 240 );
		this.lum.value = 240 - this.iLum.value;

		this.iSat.value =
		this.hsl.sat =
		this.pal.sat = ~~( color.saturation * 240 );

	}

	private saveCurrentColor() {

		this.recentColors.set( this._recentColorIndex, 'rgb(' + ~~this.iRed.value + ',' + ~~this.iGreen.value + ',' + ~~this.iBlue.value + ')' );
		
		UI_Dialog_ColorBox.recentColors[ this._recentColorIndex ] = this.recentColors.get( this._recentColorIndex );

		this._recentColorIndex++;

		if ( this._recentColorIndex == 16 ) {
			this._recentColorIndex = 0;
		}

		UI_Dialog_ColorBox.recentColorIndex = this._recentColorIndex;

	}

	public static create( asMDIInForm: UI_Form = null, initialColor: UI_Color = null ): Thenable<UI_Color> {		

		var box = new UI_Dialog_ColorBox();

		if ( initialColor ) {
			box.iRed.value = initialColor.red;
			box.iGreen.value = initialColor.green;
			box.iBlue.value = initialColor.blue;
			box.maintainHLS();
		}

		return new Promise( function( accept, reject ) {

			if ( asMDIInForm ) {

				box.modal = true;

				box.mdiParent = asMDIInForm;

				box.on( 'close', function() {
					box.mdiParent = null;
				} );

			}
			
			box.open().then( function( box ) {

				box.on( 'message', function( color: UI_Color ) {
					accept( color );
				} );

			} );
		});


	}

}