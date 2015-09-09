class UI_Dialog_TagBox extends UI_Form {

	/** 
	 * Tell the form to open only after the main resource Constraint
	 * is loaded
	 */
	public static __awaits__ = { "resource": [ "Constraint" ] };

	protected Icon: UI_Icon;
	public    Tags: UI_Tags;
	protected BtnOK: UI_Button;
	protected BtnCancel: UI_Button;

	constructor( tagValues: any, tagStrings: string[] ) {
		super();

		this.Icon = new UI_Icon(this);
		this.Tags = new UI_Tags(this);
		this.BtnOK = new UI_Button(this);
		this.BtnCancel = new UI_Button(this);

		this.borderStyle = EBorderStyle.NONE;
		this.caption = 'Edit tags';

		this.Tags.value = tagValues;
		this.Tags.strings = tagStrings;

		this.onInitialize();
	}

	protected onInitialize() {

		this.Icon.width = 20;
		this.Icon.height = 20;
		this.Icon.resource = UI_Tags._theme.icons.edit;
		this.Icon.left = 20;
		this.Icon.top = 20;

		this.BtnOK.caption = 'Ok';
		this.BtnOK.bottom = 20;
		this.BtnOK.left = 60;
		this.BtnOK.width = 50;
		// this.BtnOK.accelerators = 'enter';

		this.BtnCancel.caption = 'Cancel';
		this.BtnCancel.left = UI_Anchor_Literal.create({ "alignment": EAlignment.RIGHT, "target": "BtnOK", "distance": 20 });
		this.BtnCancel.width = 70;
		this.BtnCancel.bottom = 20;
		// this.BtnCancel.accelerators = 'esc';

		this.Tags.left = 60;
		this.Tags.top = 20;
		this.Tags.right = 20;
		this.Tags.bottom = UI_Anchor_Literal.create({ "alignment": EAlignment.TOP, "target": "BtnOK", "distance": 20 });

		this.width = 400;
		this.height = 300;

		this.placement = EFormPlacement.CENTER;

		(function(self: UI_Dialog_TagBox) {

			self.BtnOK.on('click', function() {
				self.fire('message', true);
			});

			self.BtnCancel.on('click', function() {
				self.fire('message', false);
			});

		})(this);

	}

	public static create( values: any = null, strings: string[] = [], asMDIInForm: UI_Form = null ): Thenable<any> {
		var box: UI_Dialog_TagBox = new UI_Dialog_TagBox( values, strings);
		
		return new Promise(function(accept, reject) {

			box.on('message', function( message: boolean ) {
				if ( message ) {
					accept(box.Tags.serialize);
				} else {
					accept(false);
				}
				box.close();
				box.free();
			})

			if ( asMDIInForm ) {
				box.modal = true;
		
				box.formStyle = EFormStyle.MDI;

				box.mdiParent = asMDIInForm;
				box.on('close', function() {
					box.mdiParent = null;
				});
			}

			box.open().then(function() {
				box.Tags.active = true;
			});

		});
	}

}