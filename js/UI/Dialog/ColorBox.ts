class UI_Dialog_ColorBox extends UI_Form {

	public hsl: UI_Color_HSLCanvas;
	public pal: UI_Color_HSLPalette;
	public lum: UI_VerticalSlider;

	public labelRed: UI_Label;
	public labelGreen: UI_Label;
	public labelBlue: UI_Label;

	public labelHue: UI_Label;
	public labelSat: UI_Label;
	public labelLum: UI_Label;

	public iRed: UI_Spinner;
	public iGreen: UI_Spinner;
	public iBlue: UI_Spinner;

	public iHue: UI_Spinner;
	public iLum: UI_Spinner;
	public iSat: UI_Spinner;

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
		this.labelGreen.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelRed", "distance": 20 } );
		this.labelGreen.left= UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT, "target": "hsl", "distance": 0 } );

		this.labelBlue = new UI_Label( this );
		this.labelBlue.caption = 'Blue';
		this.labelBlue.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelGreen", "distance": 20 } );
		this.labelBlue.left= UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT, "target": "hsl", "distance": 0 } );

		this.labelHue = new UI_Label( this );
		this.labelHue.caption = 'Hue';
		this.labelHue.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "hsl", "distance": 20 } );
		this.labelHue.left = UI_Anchor_Literal.create( {"alignment": EAlignment.LEFT, "target": "hsl", "distance": 120 } );

		this.labelSat = new UI_Label( this );
		this.labelSat.caption = 'Sat';
		this.labelSat.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelHue", "distance": 20 } );
		this.labelSat.left = UI_Anchor_Literal.create( {"alignment": EAlignment.LEFT, "target": "hsl", "distance": 120 } );

		this.labelLum = new UI_Label( this );
		this.labelLum.caption = 'Lum';
		this.labelLum.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "labelSat", "distance": 20 } );
		this.labelLum.left = UI_Anchor_Literal.create( {"alignment": EAlignment.LEFT, "target": "hsl", "distance": 120 } );

		this.iRed = new UI_Spinner( this );
		this.iRed.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "hsl", "distance": 15 } );
		this.iRed.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 45 } );
		this.iRed.width = 55;
		this.iRed.min = 0;
		this.iRed.max = 255;

		this.iGreen = new UI_Spinner( this );
		this.iGreen.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "iRed", "distance": 17 } );
		this.iGreen.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 45 } );
		this.iGreen.width = 55;
		this.iGreen.min = 0;
		this.iGreen.max = 255;

		this.iBlue = new UI_Spinner( this );
		this.iBlue.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "iGreen", "distance": 17 } );
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
		this.iSat.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "iHue", "distance": 17 } );
		this.iSat.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 160 } );
		this.iSat.width = 55;
		this.iSat.min = 0;
		this.iSat.max = 240;

		this.iLum = new UI_Spinner( this );
		this.iLum.top = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": "iSat", "distance": 17 } );
		this.iLum.left = UI_Anchor_Literal.create( { "alignment": EAlignment.LEFT,   "target": "hsl", "distance": 160 } );
		this.iLum.width = 55;
		this.iLum.min = 0;
		this.iLum.max = 240;

		this.iLum.value = 120;
		this.iHue.value = 120;
		this.iSat.value = 120;

		this.maintainRGB();

		this.width = 500;
		this.height= 350;
		this.caption = 'Pick a color';
		this.formStyle = EFormStyle.MDI;
		this.borderStyle = EBorderStyle.NONE;
		this.placement = EFormPlacement.CENTER;

		( function( me ) {

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
			} );

		} )( this );

	}

	private maintainRGB() {

		var color: IRGBPixel = UI_Color.HSL2RGB( ~~this.iHue.value / 240, ~~this.iSat.value / 240, ~~this.iLum.value / 240 );

		this.iRed.value = color.r;
		this.iGreen.value = color.g;
		this.iBlue.value = color.b;
	}

	public static create( asMDIInForm: UI_Form = null ): Thenable<IRGBPixel> {		

		var box = new UI_Dialog_ColorBox();

		window[ 'color' ] = box;

		return new Promise( function( accept, reject ) {

			if ( asMDIInForm ) {

				box.modal = true;

				box.mdiParent = asMDIInForm;

				box.on( 'close', function() {
					box.mdiParent = null;
				} );

			}
			
			box.open().then( function( box ) {

				accept( null );

			} );
		});


	}

}