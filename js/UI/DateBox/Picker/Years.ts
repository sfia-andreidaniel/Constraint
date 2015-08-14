class UI_DateBox_Picker_Menu_Years extends UI_DateBox_Picker_Menu {
	
	private _year: number;

	constructor( placement: IWindow, protected owner: UI_DateBox_Picker ) {
		super(placement, owner);
	}

	protected _initialize() {

		this._year = this.owner.displayedYear;

		var button: UI_Canvas_Button,
			buttonHeight: number = ~~((this._overlay.height - 22) / 10),
			top: number = 11,
			i: number;

		this._buttons = [];

		this._buttons.push(button = new UI_Canvas_Button({
			x: 1,
			y: 1,
			width: this._overlay.width - 2,
			height: 10
		}, this._overlay.ctx));

		button.icon = {
			width: 10,
			height: 5,
			sprite: 'Constraint/menuitem_scroll_prev/10x5'
		};
		button.borderHoverColor = 'black';
		button.borderWidth = 1;

		for (i = 0; i < 10; i++ ) {
			this._buttons.push(button = new UI_Canvas_Button({
				x: 1,
				y: top,
				width: this._overlay.width - 2,
				height: buttonHeight
			}, this._overlay.ctx));

			button.font = UI_DateBox_Picker._theme.font.font;
			button.backgroundHoverColor = UI_DateBox_Picker._theme.day.ofSelected.backgroundColor;

			top += buttonHeight;
		}

		this.updateButtons();

		this._buttons.push(button = new UI_Canvas_Button({
			x: 1,
			y: this._overlay.height - 11,
			width: this._overlay.width - 2,
			height: 10
		}, this._overlay.ctx));



		button.icon = {
			width: 10,
			height: 5,
			sprite: 'Constraint/menuitem_scroll_next/10x5'
		};
		button.borderHoverColor = 'black';
		button.borderWidth = 1;

		super._initialize();

		this._overlay.render();
	}

	private updateButtons() {
		for (var i = 0; i < 10; i++ ) {
			this._buttons[i + 1].caption = String( this._year - 5 + i );
			this._buttons[i + 1].value = this._year - 5 + i;
		}
		this._overlay.render();
	}

	protected onButtonClick() {
		var buttonIndex: number = this.hoverButtonIndex;
		if ( buttonIndex !== null ) {

			switch ( buttonIndex ) {
				case 0: // ignore these two
					if (this._year > 10) {
						this._year -= 10;
						this.updateButtons();
					}
					break;
				case 11:
					if (this._year < 3000) {
						this._year += 10;
						this.updateButtons();
					}
					break;
				default:
					this.owner.displayedYear = this._buttons[buttonIndex].value;
					this.close();
					break;
			}
		}
	}
}