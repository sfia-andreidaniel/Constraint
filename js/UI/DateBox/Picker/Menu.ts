/**
 * This is a part of the UI_DateBox control, which is used to represent a menu
 * from which the user can pick a month or a year, inside the calendar that is
 * rendered below the date input control.
 *
 * This class is not intended to be used explicitly by the programmer.
 */
 class UI_DateBox_Picker_Menu extends UI_Event {
	
	protected _overlay: UI_Screen_Window;
	protected _buttons: UI_Canvas_Button[];
	protected _closeCallback: () => void;

	constructor( placement: IWindow, protected owner: UI_DateBox_Picker ) {
		super();
		
		this._overlay = UI_Screen.get.createWindow(
			placement.x, placement.y,
			placement.width, placement.height
		);

		this._initialize();

		this._overlay.render();
	}

	protected render() {

		var ctx = this._overlay.ctx;

		ctx.beginPaint();

		ctx.fillStyle = UI_DateBox_Picker._theme.backgroundColor;
		ctx.fillRect(0,0, ctx.width, ctx.height);
		ctx.strokeStyle = UI_DateBox_Picker._theme.borderColor;
		ctx.lineWidth = 1;
		ctx.strokeRect(.5,.5,ctx.width-.5,ctx.height-.5);

		if (this._buttons) {

			var i: number,
				len: number;

			for (i = 0, len = this._buttons.length; i < len; i++) {
				this._buttons[i].render();
			}

		}

		ctx.endPaint();
	}

	public close() {

		this.owner.fire('close-menu');

		this._overlay.close();

		if ( this._closeCallback ) {
			UI_Screen.get.off( 'mousedown', this._closeCallback );
			this._closeCallback = undefined;
		}

	}

	protected get hoverButtonIndex(): number {
		var i: number,
			len: number;

		if ( this._buttons ) {
			for (i = 0, len = this._buttons.length; i < len; i++ ) {
				if ( this._buttons[i].hover ){
					return i;
				}
			}
			return null;
		} else {
			return null;
		}
	}

	protected select( amount: number ) {

		if ( !this._buttons ) {
			return;
		}

		var buttonIndex: number = this.hoverButtonIndex;

		if ( buttonIndex === null ) {
			switch ( amount ) {
				case -1:
					buttonIndex = this._buttons.length - 1;
					break;
				case 1:
					buttonIndex = 0;
					break;
			}
		} else {
			buttonIndex += amount;
			if ( buttonIndex >= this._buttons.length ) {
				buttonIndex = 0;
			} else
			if  (buttonIndex == -1 ) {
				buttonIndex = this._buttons.length - 1;
			}
		}

		this._buttons[buttonIndex].hover = true;
		this._overlay.render();
	}

	protected onButtonClick() {

	}

	protected _initialize() {
		(function(me) {
			
			me._overlay.on('render', function() { 
				me.render(); 
			});

			me._closeCallback = function() {
				me.close();
			}

			UI_Screen.get.on('mousedown', me._closeCallback );


			me._overlay.ctx.on('hover-button', function( button: UI_Canvas_Button ) {
				var i: number,
					len: number;
				for (i = 0, len = me._buttons.length; i < len; i++ ) {
					me._buttons[i].hover = me._buttons[i] == button;
				}
			});

			me._overlay.on('mousemove', function(x: number, y: number, button: number ) {
				if (me._buttons) {

					var found: boolean = false,
						i: number,
						len: number;

					for (i = 0, len = me._buttons.length; i < len; i++) {
						if (me._buttons[i].containsRelativePoint(x, y)) {
							if (!me._buttons[i].hover) {
								me._buttons[i].hover = true;
								me._overlay.render();
							}
							found = true;
							break;
						}
					}

					if (!found) {
						me._overlay.ctx.fire('hover-button', null);
						me._overlay.render();
					}
				}
			});

			me._overlay.on('click', function(x: number, y: number, button: number ) {
				if (me._buttons && button == 1) {

					var found: boolean = false,
						i: number,
						len: number;

					for (i = 0, len = me._buttons.length; i < len; i++) {
						if (me._buttons[i].containsRelativePoint(x, y)) {
							me.onButtonClick();
							break;
						}
					}

				}
			});

			me._overlay.on('keydown', function(ev: Utils_Event_Keyboard) {
				var code = ev.code;
				switch ( code ) {
					case Utils.keyboard.KB_UP:
						me.select(-1);
						ev.handled = true;
						break;
					case Utils.keyboard.KB_DOWN:
						me.select(1);
						ev.handled = true;
						break;
					case Utils.keyboard.KB_LEFT:
					case Utils.keyboard.KB_RIGHT:
						me.close();
						me.owner._overlay.fire('keydown', ev);
						break;
					case Utils.keyboard.KB_ENTER:
						me.onButtonClick();
						ev.handled = true;
						break;
					case Utils.keyboard.KB_ESC:
						me.close();
						ev.handled = true;
						break;
				}
			});

		})(this);
	}
}