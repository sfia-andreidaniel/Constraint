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



	protected _owner: UI_DateBox;
	protected _width : number;
	protected _height : number;

	/**
	 * We're painting this control directly on the Screen canvas overlay.
	 */
	protected _overlay: UI_Screen_Window;
	protected _closeCallback: () => void;

	protected _paintables: UI_Canvas_Button[] = [];
	protected _buttons   : UI_Canvas_Button[] = [];
	protected _days      : UI_Canvas_Button[] = [];

	/** current selected date */
	protected _currentDate: Date;
	protected _today: Date = new Date();

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
		
		// decrement through the date until the day of week is 0 (sunday).
		while ( d.getDay() != 0 ) {
			d.setDate(d.getDate() - 1);
		}
		
		// setup buttons.
		for (i = 0, len = 42; i < len; i++ ) {
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

			d.setDate(d.getDate() + 1);
		}
	}

	public close() {
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
					len: number;

				for (i = 0, len = me._buttons.length; i < len; i++ ) {
					if ( me._buttons[i].containsRelativePoint( x, y ) && !me._buttons[i].hover ) {
						me._buttons[i].hover = true;
						me._overlay.render();
						console.log('set hover: ', me._buttons[i].caption);
						return;
					}
				}
			});

			me._overlay.on( 'keydown', function( ev ) {

				var code: number = ev.keyCode || ev.charCode;

				switch ( code ) {
					
					case Utils.keyboard.KB_ENTER:
						me.applyDate();
						me.close();
						break;
					
					case Utils.keyboard.KB_ESC:
						me.close();
						break;

					case Utils.keyboard.KB_UP:
					case Utils.keyboard.KB_DOWN:
					case Utils.keyboard.KB_LEFT:
					case Utils.keyboard.KB_RIGHT:
						break;

					case Utils.keyboard.KB_SPACE:
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
			    y: number;

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

			me._overlay.render();

		} )( this );

	}

}