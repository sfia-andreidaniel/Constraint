/**
 * This is a part of the UI_DateBox control, which is used to represent calendar
 * below the date control.
 *
 * This class is not intended to be used explicitly by the programmer.
 */

 class UI_DateBox_Picker extends UI_Event {

	public static _theme = {
		backgroundColor:          $I.string('UI.UI_DateBox/picker.backgroundColor'),
		borderColor:              $I.string('UI.UI_DateBox/picker.borderColor'),
		padding:                  $I.number('UI.UI_DateBox/picker.padding'),

		header: {
			height:               $I.number('UI.UI_DateBox/picker.header.height'),
			backgroundColor:      $I.string('UI.UI_DateBox/picker.header.backgroundColor'),
			borderColor:          $I.string('UI.UI_DateBox/picker.header.borderColor'),
			
			monthButton: {
				width:            $I.number('UI.UI_DateBox/picker.header.monthButton.width')
			},

			yearButton: {
				width:            $I.number('UI.UI_DateBox/picker.header.yearButton.width' )
			},

			monthNavigator: {
				
				width:            $I.number('UI.UI_DateBox/picker.header.monthNavigator.width' ),

				prevMonth: {
					width:        $I.number('UI.UI_DateBox/picker.header.monthNavigator.prevMonth.width'),
					height:       $I.number('UI.UI_DateBox/picker.header.monthNavigator.prevMonth.height'),
					sprite:       $I.string('UI.UI_DateBox/picker.header.monthNavigator.prevMonth.sprite')
				},

				thisMonth: {
					width:        $I.number('UI.UI_DateBox/picker.header.monthNavigator.thisMonth.width'),
					height:       $I.number('UI.UI_DateBox/picker.header.monthNavigator.thisMonth.height'),
					sprite:       $I.string('UI.UI_DateBox/picker.header.monthNavigator.thisMonth.sprite')
				},

				nextMonth: {
					width:        $I.number('UI.UI_DateBox/picker.header.monthNavigator.nextMonth.width'),
					height:       $I.number('UI.UI_DateBox/picker.header.monthNavigator.nextMonth.height'),
					sprite:       $I.string('UI.UI_DateBox/picker.header.monthNavigator.nextMonth.sprite')
				}

			},

			font: {
				font:             'bold ' + $I.number('UI.UI_DateBox/picker.font.size') + 'px ' + $I.number('UI.UI_DateBox/picker.font.family'),
				color:            $I.string('UI.UI_DateBox/picker.font.color')
			}
		},

		font: {
			font:                 $I.number('UI.UI_DateBox/picker.font.size') + 'px ' + $I.number('UI.UI_DateBox/picker.font.family'),
			color:                $I.string('UI.UI_DateBox/picker.font.color')
		},

		day: {
			width:                $I.number('UI.UI_DateBox/picker.day.width'),
			height:               $I.number('UI.UI_DateBox/picker.day.height'),

			disabledDateColor:    $I.string('UI.UI_DateBox/picker.day.disabledDateColor'),

			header: {
				backgroundColor:  $I.string('UI.UI_DateBox/picker.day.header.backgroundColor'),
				color:            $I.string('UI.UI_DateBox/picker.day.header.color'),
				borderColor:      $I.string('UI.UI_DateBox/picker.day.header.borderColor'),
				hoverBorderColor: $I.string('UI.UI_DateBox/picker.day.header.hoverBorderColor')
			},

			ofOtherMonth: {
				backgroundColor:  $I.string('UI.UI_DateBox/picker.day.ofOtherMonth.backgroundColor'),
				color:            $I.string('UI.UI_DateBox/picker.day.ofOtherMonth.color'),
				borderColor:      $I.string('UI.UI_DateBox/picker.day.ofOtherMonth.borderColor'),
				hoverBorderColor: $I.string('UI.UI_DateBox/picker.day.ofOtherMonth.hoverBorderColor')
			},

			ofThisMonth: {
				backgroundColor:  $I.string('UI.UI_DateBox/picker.day.ofThisMonth.backgroundColor'),
				color:            $I.string('UI.UI_DateBox/picker.day.ofThisMonth.color'),
				borderColor:      $I.string('UI.UI_DateBox/picker.day.ofThisMonth.borderColor'),
				hoverBorderColor: $I.string('UI.UI_DateBox/picker.day.ofThisMonth.hoverBorderColor')
			},

			ofToday: {
				backgroundColor:  $I.string('UI.UI_DateBox/picker.day.ofToday.backgroundColor'),
				color:            $I.string('UI.UI_DateBox/picker.day.ofToday.color'),
				borderColor:      $I.string('UI.UI_DateBox/picker.day.ofToday.borderColor'),
				hoverBorderColor: $I.string('UI.UI_DateBox/picker.day.ofToday.hoverBorderColor')
			},

			ofSelected: {
				backgroundColor:  $I.string('UI.UI_DateBox/picker.day.ofSelected.backgroundColor'),
				color:            $I.string('UI.UI_DateBox/picker.day.ofSelected.color'),
				borderColor:      $I.string('UI.UI_DateBox/picker.day.ofSelected.borderColor'),
				hoverBorderColor: $I.string('UI.UI_DateBox/picker.day.ofSelected.hoverBorderColor')
			}
		}
	};

	/**
	 * Returns the Picker width, computed by it's theme
	 */
	public static get themeWidth(): number {
		return UI_DateBox_Picker._theme.padding * 2 + 2 + 7 * UI_DateBox_Picker._theme.day.width;
	}

	/**
	 * Returns the Picker height, computed by it's theme
	 */
	public static get themeHeight(): number {
		return UI_DateBox_Picker._theme.padding * 2 + 2 +
			   // 1 row for header
			   UI_DateBox_Picker._theme.header.height +
			   // 7 rows of type day
			   7 * UI_DateBox_Picker._theme.day.height;
	}



	protected _owner: 			UI_DateBox;
	protected _width: 			number;
	protected _height:	 		number;

	/**
	 * We're painting this control directly on the Screen canvas overlay.
	 */
	protected _overlay: 		UI_Screen_Window;
	protected _menu:            UI_DateBox_Picker_Menu;

	protected _closeCallback: 	() => void;

	protected _paintables: 		UI_Canvas_Button[] = [];
	
	protected _buttons: 		UI_Canvas_Button[] = [];

	protected _days: 			UI_Canvas_Button[] = [];

	protected _monthButton: 	UI_Canvas_Button;
	protected _yearButton: 		UI_Canvas_Button;

	protected _prevMonthButton: UI_Canvas_Button;
	protected _thisMonthButton: UI_Canvas_Button;
	protected _nextMonthButton: UI_Canvas_Button;

	/** current selected date */
	protected _currentDate: 	Date;
	protected _today: 			Date = new Date();

	protected _minDateTs: 		number;
	protected _maxDateTs: 		number;

	/** the page we're rendering at a time */
	protected _currentPage = {
		month: null,
		year: null
	};

	constructor( owner: UI_DateBox ) {
		super();

		var placement: IWindow,
		    rect: ClientRect = owner._root.getBoundingClientRect();
		
		this._owner = owner;

		this._minDateTs = this._owner.minDate === null
			? null
			: this._owner.minDate.getTime();
		this._maxDateTs = this._owner.maxDate === null
			? null
			: this._owner.maxDate.getTime();

		this._width = UI_DateBox_Picker.themeWidth;
		this._height= UI_DateBox_Picker.themeHeight;

		placement = UI_Screen.get.getBestPlacementDropDownStyle( {
				x: rect.left,
				y: rect.top,
				width: this._width,
				height: rect.height
			}, {
				width: this._width,
				height: this._height
			});

		this._overlay = UI_Screen.get.createWindow( 
			placement.x, placement.y, 
			placement.width, placement.height
		);

		this._currentDate = new Date();

		// Initialize the date from the datebox control.
		this._currentDate.setFullYear(owner.getDatePart(EDatePart.YEAR));
		this._currentDate.setMonth( owner.getDatePart(EDatePart.MONTH));
		this._currentDate.setDate(owner.getDatePart(EDatePart.DAY));

		this._currentPage.month = this._currentDate.getMonth();
		this._currentPage.year = this._currentDate.getFullYear();

		this._setup_();

		this.computeCurrentMonth();
	}

	protected render() {
		var ctx = this._overlay.ctx;
		ctx.beginPaint();

		ctx.fillStyle = UI_DateBox_Picker._theme.backgroundColor;
		ctx.fillRect(0,0, ctx.width, ctx.height);
		ctx.strokeStyle = UI_DateBox_Picker._theme.borderColor;
		ctx.lineWidth = 1;
		ctx.strokeRect(.5,.5,ctx.width-.5,ctx.height-.5);

		for ( var i=0, len = this._paintables.length; i<len; i++ ) {
			this._paintables[i].render();
		}

		ctx.endPaint();
	}

	protected computeCurrentMonth() {
		var d: Date = new Date(),
		    i: number,
		    len: number,
		    month: number,
		    year: number,
		    day: number;

		d.setFullYear(this._currentPage.year);
		d.setMonth(this._currentPage.month);
		d.setDate(1);
		
		this._monthButton.caption = Utils.date.monthName( d.getMonth() + 1, false );
		this._yearButton.caption = String(d.getFullYear());

		// decrement through the date until the day of week is 0 (sunday).
		while ( d.getDay() != 0 ) {
			d.setDate(d.getDate() - 1);
		}
		
		// setup buttons.
		for (i = 0, len = 42; i < len; i++ ) {

			this._buttons[i].color =
			((this._minDateTs !== null && this._minDateTs > d.getTime()) ||
				(this._maxDateTs !== null && this._maxDateTs < d.getTime()))
				? UI_DateBox_Picker._theme.day.disabledDateColor
				: UI_DateBox_Picker._theme.day.ofToday.color;

			month = d.getMonth();
			year = d.getFullYear();
			day = d.getDate();
			
			if (month == this._currentDate.getMonth() && year == this._currentDate.getFullYear() && day == this._currentDate.getDate()) {
				this._days[i].active = true;
			} else {
				this._days[i].active = false
			}

			if (month == this._today.getMonth() && year == this._today.getFullYear() && day == this._today.getDate()) {

				this._days[i].backgroundColor = UI_DateBox_Picker._theme.day.ofToday.backgroundColor;
				this._days[i].borderColor = UI_DateBox_Picker._theme.day.ofToday.borderColor;
				this._days[i].borderHoverColor = UI_DateBox_Picker._theme.day.ofSelected.hoverBorderColor;

			} else {

				if (month == this._currentPage.month && year == this._currentPage.year) {

					this._days[i].backgroundColor = UI_DateBox_Picker._theme.day.ofThisMonth.backgroundColor;
					this._days[i].borderColor = UI_DateBox_Picker._theme.day.ofThisMonth.borderColor;
					this._days[i].borderHoverColor = UI_DateBox_Picker._theme.day.ofSelected.hoverBorderColor;

				} else {

					this._days[i].backgroundColor = UI_DateBox_Picker._theme.day.ofOtherMonth.backgroundColor;
					this._days[i].borderColor = UI_DateBox_Picker._theme.day.ofOtherMonth.borderColor;
					this._days[i].borderHoverColor = UI_DateBox_Picker._theme.day.ofSelected.hoverBorderColor;

				}

			}


			this._buttons[i].caption = String(day);
			this._buttons[i].value = d.getTime();

			d.setDate(d.getDate() + 1);
		}
	}

	public close() {

		if ( this._menu ) {
			this._menu.close();
		}

		this._overlay.close();
		this._owner.fire('overlay-closed');

		if ( this._closeCallback ) {
			UI_Screen.get.off( 'mousedown', this._closeCallback );
			this._closeCallback = undefined;
		}
	}

	protected addPaintable( button: UI_Canvas_Button ): UI_Canvas_Button {
		this._paintables.push( button );
		return button;
	}

	protected addButton( button: UI_Canvas_Button ): UI_Canvas_Button {
		this._paintables.push( button );
		this._buttons.push( button );
		return button;
	}

	public applyDate() {

		if ( this._minDateTs !== null && this._currentDate.getTime() < this._minDateTs ) {
			return;
		}

		if ( this._maxDateTs !== null && this._currentDate.getTime() > this._maxDateTs ) {
			return;
		}

		var day: number = this._currentDate.getDate(),
			month: number = this._currentDate.getMonth() + 1,
			year: number = this._currentDate.getFullYear();

		this._owner.setDatePart(EDatePart.DAY, day);
		this._owner.setDatePart(EDatePart.MONTH, month);
		this._owner.setDatePart(EDatePart.YEAR, year);

		this.close();

	}

	protected _setup_() {

		( function( me ) {

			me._overlay.on( 'render', function() {
				me.render();
			} );

			me._closeCallback = function() {
				me.close();
			};

			me._overlay.ctx.on('hover-button', function( button: UI_Canvas_Button ) {
				var i: number,
					len: number;
				for (i = 0, len = me._buttons.length; i < len; i++ ) {
					me._buttons[i].hover = me._buttons[i] == button;
				}
			});

			me._overlay.ctx.on('activate-button', function( button: UI_Canvas_Button ) {
				var i: number,
					len: number;
				for (i = 0, len = me._buttons.length; i < len; i++ ) {
					me._buttons[i].active = me._buttons[i] == button;
				}
			});

			me._overlay.on('mousemove', function( x: number, y: number, button: number ) {
				
				var i: number,
					len: number,
					found: boolean = false;

				for (i = 0, len = me._buttons.length; i < len; i++ ) {
					if ( me._buttons[i].containsRelativePoint( x, y ) ) {
						if (!me._buttons[i].hover) {
							me._buttons[i].hover = true;
							me._overlay.render();
						}
						found = true;
						break;
					}
				}

				if ( !found ) {
					me._overlay.ctx.fire('hover-button', null);
					me._overlay.render();
				}

			});

			me._overlay.on('click', function(x: number, y: number, button: number) {

				var i: number,
					len: number;

				for (i = 0, len = me._buttons.length; i < len; i++ ) {
					if ( me._buttons[i].containsRelativePoint( x, y ) ) {
						me.onButtonClick(me._buttons[i], i);
						break;

					}
				}

			});

			me.on('close-menu', function() {
				me._menu = undefined;
				me._yearButton.borderColor = null;
				me._monthButton.borderColor = null;
				if ( me._overlay )
				me._overlay.render();
			});

			me._overlay.on( 'keydown', function( ev ) {

				var code: number = ev.keyCode || ev.charCode;

				switch ( code ) {
					
					case Utils.keyboard.KB_ESC:
						me.close();
						break;

					case Utils.keyboard.KB_UP:
						me.onUpArrow();
						break;
					case Utils.keyboard.KB_DOWN:
						me.onDownArrow();
						break;
					case Utils.keyboard.KB_LEFT:
						me.onLeftArrow();
						break;
					case Utils.keyboard.KB_RIGHT:
						me.onRightArrow();
						break;

					case Utils.keyboard.KB_ENTER:
					case Utils.keyboard.KB_SPACE:
						me.onButtonVirtualClick();
						break;

					default:
						me._owner.fire( 'keydown', ev );
						break;

				}

			} );

			UI_Screen.get.on('mousedown', me._closeCallback );

			// ADD HEADER
			var btn   : UI_Canvas_Button,
			    header: UI_Canvas_Button,
			    i: number,
			    len: number,
			    j: number,
			    n: number,
			    x: number,
			    y: number,
			    monthNavWidth: number = ~~( UI_DateBox_Picker._theme.header.monthNavigator.width / 3 );

			me.addPaintable( header = new UI_Canvas_Button({
				x: UI_DateBox_Picker._theme.padding + 1,
				y: UI_DateBox_Picker._theme.padding + 1,
				width: me._width - 2 * UI_DateBox_Picker._theme.padding - 3,
				height: UI_DateBox_Picker._theme.header.height
			}, me._overlay.ctx ) );

			header.backgroundColor = UI_DateBox_Picker._theme.header.backgroundColor;
			header.borderColor     = UI_DateBox_Picker._theme.header.borderColor;
			header.borderWidth     = 1;

			x = header.left;
			y = header.top + header.height + 1;

			// Add week day names
			for ( i=0; i<7; i++ ) {
				btn = new UI_Canvas_Button({
					x: x,
					y: y,
					width: UI_DateBox_Picker._theme.day.width,
					height: UI_DateBox_Picker._theme.day.height
				}, me._overlay.ctx );

				btn.font = UI_DateBox_Picker._theme.font.font;
				btn.color = UI_DateBox_Picker._theme.day.header.color;
				btn.backgroundColor = UI_DateBox_Picker._theme.day.header.backgroundColor;
				btn.caption = Utils.date.dayName( i, true );

				me.addPaintable( btn );

				x += UI_DateBox_Picker._theme.day.width;
			}

			// Add month days
			y += UI_DateBox_Picker._theme.day.height;
			x = header.left;
			n = 0;

			for ( i=0; i<6; i++ ) {
				for ( j=0; j<7; j++ ) {
					
					btn = new UI_Canvas_Button({
						x: x,
						y: y,
						width: UI_DateBox_Picker._theme.day.width,
						height: UI_DateBox_Picker._theme.day.height
					}, me._overlay.ctx );

					btn.font  = UI_DateBox_Picker._theme.font.font;
					btn.caption = String( ++n );
					btn.borderWidth = 1;
					btn.color = UI_DateBox_Picker._theme.day.ofThisMonth.color;

					btn.borderActiveColor = UI_DateBox_Picker._theme.day.ofSelected.borderColor;
					btn.backgroundActiveColor = UI_DateBox_Picker._theme.day.ofSelected.backgroundColor;
					btn.activeColor = UI_DateBox_Picker._theme.day.ofSelected.color;

					me.addButton( btn );
					me._days.push( btn );

					x += UI_DateBox_Picker._theme.day.width;
				}
				x = header.left;
				y += UI_DateBox_Picker._theme.day.height;
			}

			// Add the month button
			me.addButton(me._monthButton = new UI_Canvas_Button({
				x: x = UI_DateBox_Picker._theme.padding + 1,
				y: UI_DateBox_Picker._theme.padding + 2,
				width: UI_DateBox_Picker._theme.header.monthButton.width,
				height: UI_DateBox_Picker._theme.header.height - 2,
			}, me._overlay.ctx ));

			me._monthButton.font = UI_DateBox_Picker._theme.font.font;
			me._monthButton.borderWidth = 1;
			me._monthButton.borderHoverColor = 'black';

			me._monthButton.caption = 'Month';

			// Add the year button
			me.addButton(me._yearButton = new UI_Canvas_Button({
				x: x = UI_DateBox_Picker._theme.padding + 2 + UI_DateBox_Picker._theme.header.monthButton.width,
				y: UI_DateBox_Picker._theme.padding + 2,
				width: UI_DateBox_Picker._theme.header.yearButton.width,
				height: UI_DateBox_Picker._theme.header.height - 2
			}, me._overlay.ctx));

			me._yearButton.font = UI_DateBox_Picker._theme.font.font;
			me._yearButton.borderWidth = 1;
			me._yearButton.borderHoverColor = 'black';

			me._yearButton.caption = 'Year';

			// Add the previous month button
			me.addButton(me._prevMonthButton = new UI_Canvas_Button({
				x: x = x + UI_DateBox_Picker._theme.header.yearButton.width,
				y: UI_DateBox_Picker._theme.padding + 2,
				width: monthNavWidth,
				height: UI_DateBox_Picker._theme.header.height - 2
			}, me._overlay.ctx));

			me._prevMonthButton.borderWidth = 1;
			me._prevMonthButton.borderHoverColor = 'black';
			me._prevMonthButton.icon = UI_DateBox_Picker._theme.header.monthNavigator.prevMonth;

			// Add the current month button
			me.addButton(me._thisMonthButton = new UI_Canvas_Button({
				x: x = x + monthNavWidth + 1,
				y: UI_DateBox_Picker._theme.padding + 2,
				width: monthNavWidth,
				height: UI_DateBox_Picker._theme.header.height - 2
			}, me._overlay.ctx));

			me._thisMonthButton.borderWidth = 1;
			me._thisMonthButton.borderHoverColor = 'black';
			me._thisMonthButton.icon = UI_DateBox_Picker._theme.header.monthNavigator.thisMonth;

			// Add the next month button
			me.addButton(me._nextMonthButton = new UI_Canvas_Button({
				x: x = x + monthNavWidth + 1,
				y: UI_DateBox_Picker._theme.padding + 2,
				width: monthNavWidth,
				height: UI_DateBox_Picker._theme.header.height - 2
			}, me._overlay.ctx));

			me._nextMonthButton.borderWidth = 1;
			me._nextMonthButton.borderHoverColor = 'black';
			me._nextMonthButton.icon = UI_DateBox_Picker._theme.header.monthNavigator.nextMonth;
			
			me._overlay.render();

		} )( this );

	}

	protected onButtonClick( button: UI_Canvas_Button, buttonIndex: number ) {
		if ( buttonIndex === null ) {
			return;
		}

		if ( buttonIndex < 42 ) {
			// user clicked on a day button
			this.menu = null;
			this._currentDate.setTime(this._buttons[buttonIndex].value);
			this.applyDate();

		} else {
			switch ( button ) {
				case this._monthButton:
					this.menu = this.menu == 'months'
						? null
						: 'months';
					break;
				case this._yearButton:
					this.menu = this.menu == 'years'
						? null
						: 'years';
					break;
				case this._prevMonthButton:
					this.menu = null;
					this.scrollMonth(-1);
					break;
				case this._thisMonthButton:
					this.menu = null;
					this.scrollMonth(null);
					break;
				case this._nextMonthButton:
					this.menu = null;
					this.scrollMonth(1);
					break;
			}
		}
	}

	protected get hoveredButton(): { button: UI_Canvas_Button; index: number; } {
		var i: number,
			len: number = this._buttons.length;

		for (i = 0; i < len; i++ ) {
			if ( this._buttons[i].hover ) {
				return { button: this._buttons[i], index: i };
			}
		}
		return null;
	}

	protected onUpArrow() {
		var hover = this.hoveredButton;

		if ( hover === null ) {
			this._buttons[35].hover = true;
		} else {
			if ( hover.index < 42 ) {
				if ( hover.index > 6 ) {
					this._buttons[hover.index - 7].hover = true;
				} else {
					switch ( hover.index ) {
						case 0: case 1: case 2: 
							this._buttons[42].hover = true;
							break;
						case 3: case 4:
							this._buttons[43].hover = true;
							break;
						case 5:
							this._buttons[44].hover = true;
							break;
						case 6:
							this._buttons[46].hover = true;
							break;
					}
				}
			} else {
				switch ( hover.index ) {
					case 42:
						this._buttons[35].hover = true;
						break;
					case 43:
						this._buttons[38].hover = true;
						break;
					case 44: case 45:
						this._buttons[40].hover = true;
						break;
					case 46:
						this._buttons[41].hover = true;
						break;
				}
			}
		}

		this._overlay.render();

	}

	protected onDownArrow() {
		var hover = this.hoveredButton;

		if ( hover === null ) {
			this._buttons[42].hover = true;
		} else {
			if ( hover.index < 42 ) {
				if ( hover.index < 35 ) {
					this._buttons[hover.index + 7].hover = true;
				} else {
					switch ( hover.index ) {
						case 35: case 36: case 37:
							this._buttons[42].hover = true;
							break;
						case 38: case 39:
							this._buttons[43].hover = true;
							break;
						case 40:
							this._buttons[44].hover = true;
							break;
						case 41:
							this._buttons[46].hover = true;
							break;
					}
				}
			} else {
				switch ( hover.index ) {
					case 42:
						this._buttons[0].hover = true;
						break;
					case 43:
						this._buttons[3].hover = true;
						break;
					case 44:
					case 45:
						this._buttons[5].hover = true;
						break;
					case 46:
						this._buttons[6].hover = true;
						break;
				}
			}
		}

		this._overlay.render();
	}

	protected onLeftArrow() {
		var hover = this.hoveredButton;

		if ( hover === null ) {
			this._buttons[42].hover = true;
		} else {
			if ( hover.index == 0 ) {
				hover.index = 46;
			} else {
				hover.index--;
			}
			this._buttons[hover.index].hover = true;
		}

		this._overlay.render();
	}

	protected onRightArrow() {
		var hover = this.hoveredButton;

		if ( hover === null ) {
			this._buttons[42].hover = true;
		} else {
			if ( hover.index == 46 ) {
				hover.index = 0;
			} else {
				hover.index++;
			}
			this._buttons[hover.index].hover = true;
		}

		this._overlay.render();
	}

	protected onButtonVirtualClick() {
		var hover = this.hoveredButton;

		if ( hover ) {
			this.onButtonClick(hover.button, hover.index);
		}
	}

	protected scrollMonth( amount: number ) {
		if (amount != null) {
			this._currentPage.month += amount;
			if (this._currentPage.month < 0) {
				this._currentPage.month = 11;
				this._currentPage.year--;
			} else
				if (this._currentPage.month > 11) {
					this._currentPage.month = 0;
					this._currentPage.year++;
				}
		} else {
			var d = new Date();
			this._currentPage.month = d.getMonth();
			this._currentPage.year = d.getFullYear();
		}
		this.computeCurrentMonth();
		this._overlay.render();
	}

	get menu(): string {
		if ( !this._menu ) {
			return null;
		} else {
			return this._menu instanceof UI_DateBox_Picker_Menu_Months
				? 'months'
				: 'years';
		}
	}

	set menu( type: string ) {
		type = String(type || '') || null;
		
		var menu: string = this.menu,
		    placement: IWindow,
		    placementMenu: IWindow,
		    size: IRect;
		
		if ( type != menu ) {
			
			if ( menu ) {
				this._menu.close();
				this._menu = undefined;
			}

			this._monthButton.borderColor = null;
			this._yearButton.borderColor = null;

			switch ( type ) {
				case 'months':

					placement = {
						x: this._overlay.left + this._monthButton.left,
						y: this._overlay.top  + this._monthButton.top,
						width: this._monthButton.width,
						height: this._monthButton.height
					};

					size = {
						width: this._monthButton.width,
						height: 12 * 20 + 2
					};

					placementMenu = UI_Screen.get.getBestPlacementDropDownStyle(placement, size);

					this._menu = new UI_DateBox_Picker_Menu_Months(placementMenu, this);

					this._monthButton.borderColor = 'black';

					this._overlay.render();

					break;
				case 'years':

					placement = {
						x: this._overlay.left + this._yearButton.left,
						y: this._overlay.top + this._yearButton.top,
						width: this._yearButton.width,
						height: this._yearButton.height
					};

					size = {
						width: this._yearButton.width,
						height: 10 * 20 + 2
					};

					placementMenu = UI_Screen.get.getBestPlacementDropDownStyle(placement, size);

					this._menu = new UI_DateBox_Picker_Menu_Years(placementMenu, this);

					this._yearButton.borderColor = 'black';

					this._overlay.render();

					break;

				default:
					return;
					break;
			}

		}
	}

	get displayedMonth(): number {
		return this._currentPage.month;
	}

	set displayedMonth( month: number ) {
		this._currentPage.month = ~~month;
		this.computeCurrentMonth();
		this._overlay.render();
	}

	get displayedYear(): number {
		return this._currentPage.year;
	}

	set displayedYear( year: number ) {
		this._currentPage.year = ~~year;
		this.computeCurrentMonth();
		this._overlay.render();
	}

}