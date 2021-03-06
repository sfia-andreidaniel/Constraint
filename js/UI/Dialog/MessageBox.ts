/**
 * Standard Dialog - Message Box - Informs, Warns, Alerts, or show an Error to the user
 *
 * **Usage**
 *
 *     UI_Dialog_MessageBox.create( 
 *          dialogText: string, 
 *          dialogTitle: string, 
 *          dialogType: EDialogBoxType, 
 *          dialogButtons: EDialogButtonTypes = null, 
 *          form: UI_Form = null 
 *     ).then( function( pressedButton: EDialogButtonTypes ) {
 *   	 	// The button is returned after the user presses on a button of the dialog box
 *     } );
 *
 * Sample UI_Dialog_MessageBox:
 *
 * * EDialogBoxType.MB_ERROR:
 *   
 *   ![ui-dialog-messagebox-mb-error](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Dialog_MessageBox-MB_ERROR.png "Error dialog box")
 *
 * * EDialogBoxType.MB_INFO:
 *   
 *   ![ui-dialog-messagebox-mb-info](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Dialog_MessageBox-MB_INFO.png "Information dialog box")
 *
 * * EDialogBoxType.MB_WARNING:
 *   
 *   ![ui-dialog-messagebox-mb-warning](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Dialog_MessageBox-MB_WARNING.png "Warning dialog box")
 *
 * * EDialogBoxType.MB_ALERT:
 *   
 *   ![ui-dialog-messagebox-mb-alert](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Dialog_MessageBox-MB_ALERT.png "Alert dialog box")
 */
class UI_Dialog_MessageBox extends UI_Form {


	/** 
	 * Tell the form to open only after the main resource Constraint
	 * is loaded
	 */
	public static __awaits__ = { "resource": [ "Constraint" ] };

	protected icon: UI_Icon;
	protected text: UI_Text;
	
	protected BTN_OK     : UI_Button;
	protected BTN_CANCEL : UI_Button;
	protected BTN_YES    : UI_Button;
	protected BTN_NO     : UI_Button;
	protected BTN_ABORT  : UI_Button;
	protected BTN_RETRY  : UI_Button;
	protected BTN_IGNORE : UI_Button;

	constructor( private _boxText    : string, 
		         private _boxCaption : string = null, 
		         private _boxType    : EDialogBoxType = EDialogBoxType.MB_INFO, 
		         private _boxButtons : EDialogButtonTypes[] = null 
	) {
		
		super();

		var i: number,
		    len: number;

		this.icon = new UI_Icon( this );
		this.text = new UI_Text( this );

		this.borderStyle = EBorderStyle.NONE;

		switch ( this._boxType ) {

			case EDialogBoxType.MB_INFO:
				
				if ( this._boxButtons === null ) {
					this._boxButtons = [ EDialogButtonTypes.BTN_OK ];
				}

				this.icon.resource = 'Constraint/mb_info/64x64';

				this.caption = this._boxCaption || 'Information';

				break;

			case EDialogBoxType.MB_WARNING:

				if ( this._boxButtons === null ) {
					this._boxButtons = [ EDialogButtonTypes.BTN_OK ];
				}

				this.icon.resource = 'Constraint/mb_warning/64x64';

				this.caption = this._boxCaption || 'Warning';

				break;

			case EDialogBoxType.MB_ALERT:
				
				if ( this._boxButtons === null ) {
					this._boxButtons = [ EDialogButtonTypes.BTN_YES, EDialogButtonTypes.BTN_NO ];
				}

				this.icon.resource = 'Constraint/mb_alert/64x64';

				this.caption = this._boxCaption || 'Alert';

				break;

			case EDialogBoxType.MB_ERROR:
				
				if ( this._boxButtons === null ) {
					this._boxButtons = [ EDialogButtonTypes.BTN_ABORT, EDialogButtonTypes.BTN_RETRY, EDialogButtonTypes.BTN_IGNORE ];
				}

				this.icon.resource = 'Constraint/mb_error/64x64';

				this.caption = this._boxCaption || 'Error';

				break;
		}

		len = this._boxButtons.length;

		for ( i=0; i<len; i++ ) {
			switch ( this._boxButtons[i] ) {
				case EDialogButtonTypes.BTN_OK:
					this.BTN_OK = this.BTN_OK || new UI_Button( this );
					this.BTN_OK.accelerators = 'enter';
					break;
				case EDialogButtonTypes.BTN_CANCEL:
					this.BTN_CANCEL = this.BTN_CANCEL || new UI_Button( this );
					this.BTN_CANCEL.accelerators = 'esc'
					break;
				case EDialogButtonTypes.BTN_YES:
					this.BTN_YES = this.BTN_YES || new UI_Button( this );
					this.BTN_YES.accelerators = 'enter';
					break;
				case EDialogButtonTypes.BTN_NO:
					this.BTN_NO = this.BTN_NO || new UI_Button( this );
					this.BTN_NO.accelerators = 'esc';
					break;
				case EDialogButtonTypes.BTN_ABORT:
					this.BTN_ABORT = this.BTN_ABORT || new UI_Button( this );
					this.BTN_ABORT.accelerators = 'alt a';
					break;
				case EDialogButtonTypes.BTN_RETRY:
					this.BTN_RETRY = this.BTN_RETRY || new UI_Button( this );
					this.BTN_RETRY.accelerators = 'alt r';
					break;
				case EDialogButtonTypes.BTN_IGNORE:
					this.BTN_IGNORE = this.BTN_IGNORE || new UI_Button( this );
					this.BTN_IGNORE.accelerators = 'alt i';
					break;
			}
		}

		this.onInitialize();

	}

	protected onInitialize() {

		var prevButton: string = null,
		    width: number = 0;

		this.icon.left = 20;
		this.icon.top  = 20;
		this.icon.width = 64;
		this.icon.height= 64;

		this.text.caption = this._boxText || '';

		this.text.top = 20;
		this.text.right = 20;
		this.text.left = UI_Anchor_Literal.create({ "alignment": EAlignment.RIGHT, "target": "icon", "distance": 20 });

		if ( this.BTN_IGNORE ) {
			this.BTN_IGNORE.caption = 'Ignore';
			this.BTN_IGNORE.bottom  = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": null, "distance": 20 } );
			this.BTN_IGNORE.right   = UI_Anchor_Literal.create( { "alignment": EAlignment.RIGHT,  "target": prevButton, "distance": 20 } );
			this.BTN_IGNORE.width   = 60;
			width += ( this.BTN_IGNORE.width + 20 );
			prevButton = 'BTN_IGNORE';
		}

		if ( this.BTN_RETRY ) {
			this.BTN_RETRY.caption  = 'Retry';
			this.BTN_RETRY.bottom   = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": null, "distance": 20 } );
			this.BTN_RETRY.right    = UI_Anchor_Literal.create( { "alignment": prevButton ? EAlignment.LEFT : EAlignment.RIGHT, "target": prevButton, "distance": 20 } );
			this.BTN_RETRY.width    = 50;
			width += ( this.BTN_RETRY.width + 20 );
			prevButton = 'BTN_RETRY';
		}

		if ( this.BTN_ABORT ) {
			this.BTN_ABORT.caption = 'Abort';
			this.BTN_ABORT.bottom  = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": null, "distance": 20 } );
			this.BTN_ABORT.right   = UI_Anchor_Literal.create( { "alignment": prevButton ? EAlignment.LEFT : EAlignment.RIGHT, "target": prevButton, "distance": 20 } );
			this.BTN_ABORT.width   = 50;
			width += ( this.BTN_ABORT.width + 20 );
			prevButton = 'BTN_ABORT';
		}

		if ( this.BTN_CANCEL ) {
			this.BTN_CANCEL.caption = 'Cancel';
			this.BTN_CANCEL.bottom  = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": null, "distance": 20 });
			this.BTN_CANCEL.right   = UI_Anchor_Literal.create( { "alignment": prevButton ? EAlignment.LEFT : EAlignment.RIGHT, "target": prevButton, "distance": 20 } );
			this.BTN_CANCEL.width   = 50;
			width += ( this.BTN_CANCEL.width + 20 );
			prevButton = 'BTN_CANCEL';
		}

		if ( this.BTN_NO ) {
			this.BTN_NO.caption     = 'No';
			this.BTN_NO.bottom      = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": null, "distance": 20 });
			this.BTN_NO.right       = UI_Anchor_Literal.create( { "alignment": prevButton ? EAlignment.LEFT : EAlignment.RIGHT, "target": prevButton, "distance": 20 } );
			this.BTN_NO.width       = 40;
			width += ( this.BTN_NO.width + 20 );
			prevButton = 'BTN_NO';
		}

		if ( this.BTN_OK ) {
			this.BTN_OK.caption     = 'Ok';
			this.BTN_OK.bottom      = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": null, "distance": 20 } );
			this.BTN_OK.right       = UI_Anchor_Literal.create( { "alignment": prevButton ? EAlignment.LEFT : EAlignment.RIGHT, "target": prevButton, "distance": 20 } );
			this.BTN_OK.width       = 40;
			width += ( this.BTN_OK.width + 20 );
			prevButton = 'BTN_OK';
		}

		if ( this.BTN_YES ) {
			this.BTN_YES.caption    = 'Yes';
			this.BTN_YES.bottom     = UI_Anchor_Literal.create( { "alignment": EAlignment.BOTTOM, "target": null, "distance": 20 } );
			this.BTN_YES.right      = UI_Anchor_Literal.create( { "alignment": prevButton ? EAlignment.LEFT : EAlignment.RIGHT, "target": prevButton, "distance": 20 } );
			this.BTN_YES.width      = 40;
			width += ( this.BTN_YES.width + 20 );
			prevButton = 'BTN_YES';
		}

		if ( width < 400 ) {
			width = 400;
		}

		this.placement = EFormPlacement.CENTER;
		this.formStyle = EFormStyle.MDI;
		this.width = width;
		this.height= 200;

		( function( self ) {

			if ( self.BTN_OK ) {
				self.BTN_OK.on( 'click', function() {
					self.fire( 'message', EDialogButtonTypes.BTN_OK );
				} );
			}

			if ( self.BTN_CANCEL ) {
				self.BTN_CANCEL.on( 'click', function() {
					self.fire( 'message', EDialogButtonTypes.BTN_CANCEL );
				} );
			}

			if ( self.BTN_YES ) {
				self.BTN_YES.on('click', function() {
					self.fire( 'message', EDialogButtonTypes.BTN_YES );
				});
			}

			if ( self.BTN_NO ) {
				self.BTN_NO.on( 'click', function() {
					self.fire( 'message', EDialogButtonTypes.BTN_NO );
				} );
			}

			if ( self.BTN_ABORT ) {
				self.BTN_ABORT.on('click', function() {
					self.fire( 'message', EDialogButtonTypes.BTN_ABORT );
				} );
			}

			if ( self.BTN_RETRY ) {
				self.BTN_RETRY.on( 'click', function() {
					self.fire( 'message', EDialogButtonTypes.BTN_RETRY );
				} );
			}

			if ( self.BTN_IGNORE ) {
				self.BTN_IGNORE.on('click', function() {
					self.fire( 'message', EDialogButtonTypes.BTN_IGNORE );
				} );
			}

			self.on( 'open', function() {
				try {
					( self.BTN_OK || self.BTN_CANCEL || self.BTN_YES || self.BTN_NO || self.BTN_ABORT || self.BTN_RETRY || self.BTN_IGNORE ).active = true;
				} catch( e ) {}
			} );

		} )( this );

	}

	public static create( text: string, caption: string = null, type: EDialogBoxType = EDialogBoxType.MB_INFO, buttons: EDialogButtonTypes[] = null, asMDIInForm: UI_Form = null ): Thenable<EDialogButtonTypes> {

		var box = new UI_Dialog_MessageBox( text, caption, type, buttons );

		return new Promise( function( accept, reject ) {

			box.on( 'message', function( message: EDialogButtonTypes ) {
				accept( message );
				box.close();
			});

			if ( asMDIInForm ) {

				box.modal = true;

				box.mdiParent = asMDIInForm;

				box.on( 'close', function() {
					box.mdiParent = null;
				} );

			}
			
			box.open().then( function( box ) {

				var height: number = box.text.textHeight;
				
				if ( height > 300 )
					height = 300;


				box.text.height = height;

				if ( height < 64 ) {
					box.text.top = UI_Anchor_Literal.create( { "alignment": EAlignment.CENTER, "target": "icon" } );
				} else {
					box.icon.top = UI_Anchor_Literal.create( { "alignment": EAlignment.CENTER, "target": "text" } );
				}


				box.height = ( height < 100 ? 100 : height ) + 50;

			} );
		});

	}

}