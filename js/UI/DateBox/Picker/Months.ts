class UI_DateBox_Picker_Menu_Months extends UI_DateBox_Picker_Menu {
	
	constructor( placement: IWindow, protected owner: UI_DateBox_Picker ) {
		super(placement, owner);
	}

	protected _initialize() {
		this._buttons = [];
		
		var i: number,
			len: number,
			oHeight: number = ~~( ( this._overlay.height - 2 ) / 12 ),
			button: UI_Canvas_Button;

		for (i = 1, len = 12; i <= len; i++ ) {
			this._buttons.push( button = new UI_Canvas_Button({
				x: 1,
				y: 1 + ( i - 1 )  * oHeight,
				width: this._overlay.width - 2,
				height: oHeight
			}, this._overlay.ctx) );

			button.borderWidth = 1;
			button.backgroundHoverColor = UI_DateBox_Picker._theme.day.ofSelected.backgroundColor;
			button.caption = Utils.date.monthName(i, false);
			button.font = UI_DateBox_Picker._theme.font.font;

			button.hover = this.owner.displayedMonth == i - 1;
		}

		super._initialize();

		this._overlay.render();
	}

	protected onButtonClick() {
		var buttonIndex: number = this.hoverButtonIndex;
		if ( buttonIndex !== null ) {
			this.owner.displayedMonth = buttonIndex;
			this.close();
		}
	}

}