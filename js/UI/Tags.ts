/**
 * The UI_Tags class allows the user to input a list of keywords or tags, in an easy way. The control
 * supports auto completion, checkboxes, and case insensitive input mode.
 *
 * Sample UI_Tags control:
 *
 * ![ui-tags](https://github.com/sfia-andreidaniel/Constraint/raw/master/media/UI_Tags.png "UI_Tags")
 */

class UI_Tags extends UI_Canvas implements IFocusable, IInput {

	/**
	 * Control theme
	 */
	public static _theme = {
		defaults: {
			width: $I.number('UI.UI_Tags/defaults.width'),
			height: $I.number('UI.UI_Tags/defaults.height')
		},
		font: {
			font: $I.number('UI.UI_Tags/font.size') + 'px \'' + $I.string('UI.UI_Tags/font.family') + '\'',
			color: $I.string('UI.UI_Tags/font.color.normal'),
			selectedColor: $I.string('UI.UI_Tags/font.color.selected')
		},
		tag: {
			height: $I.number('UI.UI_Tags/tag.height'),
			margin: $I.number('UI.UI_Tags/tag.margin'),
			background: {
				disabled: $I.string('UI.UI_Tags/tag.background.disabled'),
				normal: $I.string('UI.UI_Tags/tag.background.normal'),
				selected: $I.string('UI.UI_Tags/tag.background.selected'),
				inactive: $I.string('UI.UI_Tags/tag.background.selectedInactive')
			},
			color: {
				disabled: $I.string('UI.UI_Tags/tag.color.disabled'),
				normal: $I.string('UI.UI_Tags/tag.color.normal'),
				selected: $I.string('UI.UI_Tags/tag.color.selected'),
				inactive: $I.string('UI.UI_Tags/tag.color.selectedInactive')
			}
		},
		background: {
			enabled: $I.string('UI.UI_Tags/background.enabled'),
			disabled: $I.string('UI.UI_Tags/background.disabled'),
			inactive: $I.string('UI.UI_Tags/background.inactive')
		},
		icons: {
			checkbox_on: $I.string('UI.UI_Tags/icons.checkbox_on'),
			checkbox_off: $I.string('UI.UI_Tags/icons.checkbox_off'),
			checkbox_any: $I.string('UI.UI_Tags/icons.checkbox_any'),
			close: $I.string('UI.UI_Tags/icons.close'),
			edit: $I.string('UI.UI_Tags/icons.edit'),
			expander: $I.string('UI.UI_Tags/icons.expander')
		},
		option: {
			height: $I.number('UI.UI_Tags/option.height')
		}
	};

	/**
	 * Whether the user can input a new "tag", or if the user can only choose
	 * from the list of tags specified in the "strings" property.
	 */
	public strictMode: boolean = false;

	/**
	 * The list of auto-suggestion tags.
	 */
	protected _strings: string[] = [];

	/**
	 * The list of tags
	 */
	protected _values: UI_Tags_Tag[] = [];

	/**
	 * IFocusable required property
	 */
 	public active: boolean; // the active is overrided by the MFocusable mixin

	/**
	 * IFocusable required property
	 */
	public wantTabs: boolean = false;

	/**
	 * IFocusable required property
	 */
	public tabIndex: number = 0;

	/**
	 * IFocusable required property
	 */
	public includeInFocus: boolean = true;

	/**
	 * The keyboard shortcut for creating a new tag.
	 */

	public tagSeparator: string = ',';

	/**
	 * IFocusable required property
	 */
	public accelerators: string;

	/**
	 * Yes, the UI_Tags input has a placeholder too.
	 */
	protected _placeholder: string = '';

	/**
	 * Whether the values of the tags are case sensitive or not. If the values of the
	 * tags are case sensitive, the helper listBox that apears when typing inside of a
	 * tag takes in consideration this setting
	 */
	public caseSensitive: boolean = false;

	/**
	 * Computed list with suggested strings built when the listbox opens.
	 */
	protected _suggestedStrings: string[] = [];

	/**
	 * The initial string that is used ( the needle ) that is used when computing the suggested strings
	 */
	protected _suggestedNeedle: string = '';

	/**
	 * The index of the helper listbox rendered on the screen overlay.
	 */
	protected _selectedIndex: number = -1;

	/**
	 * The helper overlay rendered on UI_Screen, which helps the user to select a suggested string.
	 */
	protected _overlay: UI_Screen_Window = null;

	/**
	 * The previous change serialized value (in json)
	 */
	protected _previousChangeValue: string = null;

	private _acceptsUserInput: boolean = true;

	/**
	 * Creates a new UI_Tags control
	 */
	constructor( owner: UI ) {
		super(owner, ['IFocusable']);
		Utils.dom.addClass( this._root, 'UI_Tags');
		this._width = UI_Tags._theme.defaults.width;
		this._height = UI_Tags._theme.defaults.height;
	}

	/**
	 * Returns the value of the control, as a string array, or NULL if no tag is present.
	 *
	 * **If the control is case insensitive, all values are converted to lowercase**.
	 *
	 * All duplicates are removed.
	 */
	get value(): any[] {

		var result: string[],
			i: number,
			len: number,
			pushValue: string;
		
		for (i = 0, len = this._values.length; i < len; i++ ) {
			pushValue = !!this._values[i].value ? ( this.caseSensitive ? this._values[i].value : this._values[i].value.toLowerCase() ): null;
			if ( pushValue !== null ) {
				if ( result ) {
					if ( result.indexOf( pushValue ) == -1 ) {
						result.push(pushValue);
					}
				} else {
					result = [pushValue];
				}
			}
		}

		return result || null;
	}

	/**
	 * Sets the tags (keywords) of the control.
	 *
	 * @param value can be null, or an array of mixed elements of type string, or interface
	 * of type { "label": string; triState?: boolean; checked?: boolean || null; sticky?: boolean; }
	 *
	 * If a tag is sticky, no user-input value can be typed via keyboard, and the "delete" sign
	 * on the right of the text of the tag is disabled (meaning no tag deletion can be made).
	 *
	 */
	set value( value: any[] ) {
		
		value = value || null;

		this._values.splice(0, this._values.length );

		var i: number,
			len: number,
			newTag: UI_Tags_Tag;

		for (i = 0, len = this._values.length; i < len; i++ ) {
			this._values[i].owner = undefined;
		}

		this._values.splice(0, this._values.length );


		if ( value ) {

			for (i = 0, len = value.length; i < len; i++ ) {
				
				(function(tag: any, me: UI_Tags) {

					switch ( true ) {
						
						case typeof tag == 'string':
							if (tag) {
								me._values.push(new UI_Tags_Tag(me, tag));
							}
							break;
						
						case tag instanceof UI_Tags_Tag:
							(<UI_Tags_Tag>tag).owner = me;
							me._values.push(<UI_Tags_Tag>tag);
							break;

						case (tag instanceof Object) && ( typeof tag.label == 'string' ):
							
							newTag = new UI_Tags_Tag(me, tag.label);
							
							if (typeof tag.triState != 'undefined' ) {
								newTag.triState = !!tag.triState;
							}

							if (typeof tag.checked != 'undefined') {
								newTag.checked = <boolean>tag.checked;
							}

							if ( typeof tag.sticky != 'undefined' ) {
								newTag.sticky = !!tag.sticky;
							}

							me._values.push(newTag);

							break;

						default:
							break;
					}

				})(value[i], this );
			}
		}

		this.render();
	}

	/**
	 * Returns the full serialization of the tags control. This is usefull if you want
	 * to clone the tags with their settings to another UI_Tags control (via .value setter).
	 */
	get serialize(): any {
		
		var result: any = [];
		
		for (var i = 0, len = this._values.length; i < len; i++ ) {
			result.push(this._values[i].serialize);
		}

		return result.length ? result : null;
	}

	/**
	 * When no tags are present, the placeholder string is rendered inside the control.
	 */
	get placeholder(): string {
		return this._placeholder;
	}

	set placeholder( placeholder: string ) {
		placeholder = String(placeholder || '') || '';
		if ( placeholder != this._placeholder ) {
			this._placeholder = placeholder;
			if ( this._values.length == 0 ) {
				this.render();
			}
		}
	}

	/**
	 * Returns the total number of tags in the input.
	 */
	get length(): number {
		return this._values.length;
	}

	/**
	 * Returns / Sets the strings for the auto-complete feature.
	 */
	get strings(): string[] {
		return this._strings;
	}

	set strings( strings: string[] ) {
		strings = strings || null;
		
		this._strings.splice(0, this._strings.length);

		var i: number,
			len: number;

		if ( strings ) {

			for (i = 0, len = strings.length; i < len; i++ ) {
				if ( strings[i] ) {
					this._strings.push(strings[i]);
				}
			}

			this._strings.sort(function(a, b) {
				var aa = a.toLowerCase(),
					bb = b.toLowerCase();
				return aa == bb
					? 0
					: (aa < bb ? 1 : -1);
			});
		}

	}

	/**
	 * Returns a matrix of tags, disposed on rows, automatically computed
	 * by the tags widths.
	 */
	protected get paintableTags(): UI_Tags_Tag[][] {
		
		this.globalContext.font = UI_Tags._theme.font.font;

		var result: UI_Tags_Tag[][] = [],
			line: UI_Tags_Tag[] = [],
			numLines = 1,
			currentLineWidth: number = UI_Tags._theme.tag.margin,
			tagWidth: number = 0,
			i: number,
			len: number,
			width: number = this.clientRect.width - UI_Tags._theme.tag.margin;

		for (i = 0, len = this._values.length; i < len; i++ ) {

			tagWidth = this._values[i].width;

			if ( tagWidth + currentLineWidth <= width || line.length == 0 ) {
				line.push(this._values[i]);
				currentLineWidth += ( tagWidth + UI_Tags._theme.tag.margin );
			} else {
				currentLineWidth = ( tagWidth + 2 * UI_Tags._theme.tag.margin );
				result.push(line);
				line = [ this._values[i] ];
			}
		}

		if ( line.length ) {
			result.push(line);
		}

		return result;

	}

	/**
	 * Control rendering routine on it's canvas.
	 */
	public render() {

		var isDisabled: boolean = this.disabled,
		    isActive: boolean = this.active && ( this.form ? this.form.active : false ),
			bgColor: string,
			ctx: UI_Canvas_ContextMapper = this.defaultContext,
			tagLines = this.paintableTags,
			numLines = tagLines.length,
			currentLine = 0,
			lineX: number = ~~(UI_Tags._theme.tag.margin / 2) - this.scrollLeft,
			lineY: number = ~~(UI_Tags._theme.tag.margin / 2) - this.scrollTop, 
			i: number,
			len: number,

			itemBGColor: string,
			itemColor: string,
			clientWidth: number = this.clientRect.width,
			clientHeight: number = this.clientRect.height;

		ctx.beginPaint();


		if (clientWidth > 100 && clientHeight > UI_Tags._theme.tag.height ) {

			bgColor =this.disabled
				? UI_Tags._theme.background.disabled
				: (this.active ? UI_Tags._theme.background.enabled : UI_Tags._theme.background.inactive);

			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, ctx.width, ctx.height);

			ctx.font = UI_Tags._theme.font.font;
			ctx.textBaseline = "middle";
			
			if ( this._values.length == 0 ) {
				if (this._placeholder) {
					ctx.textAlign = 'left';
					ctx.fillStyle = UI_Tags._theme.tag.color.disabled;
					ctx.fillText(ctx.dotDotDot(this._placeholder, this.clientRect.width - 4), 2, 10);
				}
				return;
			}

			ctx.textAlign = 'right';

			this.logicalHeight = numLines * (UI_Tags._theme.tag.height + UI_Tags._theme.tag.margin);

			while (currentLine < numLines) {

				for (i = 0, len = tagLines[currentLine].length; i < len; i++) {

					itemBGColor = isDisabled
						? null
						: isActive && tagLines[currentLine][i].selected ? UI_Tags._theme.tag.background.selected : null;

					itemColor = isDisabled
						? UI_Tags._theme.tag.color.disabled
						: isActive && tagLines[currentLine][i].selected ? UI_Tags._theme.tag.color.selected : UI_Tags._theme.tag.color.normal;

					lineX += UI_Tags._theme.tag.margin + tagLines[currentLine][i].paintAt(lineX, lineY, itemBGColor, itemColor, ctx );
				}

				lineY += (UI_Tags._theme.tag.margin + UI_Tags._theme.tag.height);
				currentLine++;
				lineX = ~~(UI_Tags._theme.tag.margin / 2);

			}

			this._acceptsUserInput = true;

		} else {

			bgColor = this.disabled
				? UI_Tags._theme.background.disabled
				: this.form.active ? UI_Tags._theme.tag.background.selected : UI_Tags._theme.tag.background.inactive;

			ctx.fillStyle = bgColor;
			ctx.fillRect(0, 0, ctx.width, ctx.height);

			ctx.font = UI_Tags._theme.font.font;
			ctx.textBaseline = "middle";

			this.logicalHeight = clientHeight;

			ctx.textAlign = 'left';

			ctx.fillStyle = isDisabled
				? UI_Tags._theme.tag.color.disabled
				: this.form.active ? UI_Tags._theme.tag.color.normal : UI_Tags._theme.tag.color.inactive;

			ctx.fillText( ctx.dotDotDot( (<string[]>( this.value || [] )).join(', '), clientWidth - 44 ), 24, 14 );

			UI_Resource.createSprite(UI_Tags._theme.icons.edit + ( this.disabled || !isActive ? '-disabled' : '' ) ) 
				.paintWin(ctx, 2, 2 );

			// Paint an expander sign
			UI_Resource.createSprite(UI_Tags._theme.icons.expander + (this.disabled ? '-disabled' : ''))
				.paintWin(ctx, clientWidth - 22, 2);

			this._acceptsUserInput = false;

		}

		ctx.endPaint();

	}

	/**
	 * Returns or sets the active tag.
	 */
	get activeTag(): UI_Tags_Tag {
		for (var i = 0, len = this._values.length; i < len; i++ ) {
			if ( this._values[i]['_selected'] ) {
				return this._values[i];
			}
		}
		return null;
	}

	set activeTag( tag: UI_Tags_Tag ) {
		for (var i = 0, len = this._values.length; i < len; i++ ) {
			this._values[i].selected = this._values[i] == tag;
		}
		this.render();
	}

	/**
	 * Removes the tag located at index tagIndex.
	 */
	public removeTag( tagIndex: number ) {
		
		if ( this._values[ tagIndex ] ) {
			this._values.splice(tagIndex, 1);
			this.expanded = false;
			this.activeTag = this._values[tagIndex] || this._values[tagIndex - 1] || null;
		}


	}

	/**
	 * Scrolls the control viewport if needed, in order to make visible the tag tag.
	 */
	public scrollTagInViewport( tag: UI_Tags_Tag ) {
		
		if ( !tag ) {
			return;
		}

		var viewportHeight = this.viewportHeight,
			tagTop = tag.paintWin.y - this.scrollTop,
			tagBottom = tagTop + UI_Tags._theme.tag.height;


		if ( tagTop < 0 ) {
			this.scrollTop += tagTop;
		} else
		if ( tagBottom > viewportHeight ) {
			this.scrollTop += ( tagBottom - viewportHeight );
		}

	}

	/**
	 * Computes the list of suggestions based on a value in an existing tag. Basically,
	 * filters the this._strings in order to the list of strings which contains the substring
	 * fromValue.
	 */
	public computeSuggestedStrings( fromValue: string, targetTag: UI_Tags_Tag = null ) {

		try {

			var item: string,
				i: number,
				len: number = this._strings.length,
				needle: string = String(fromValue || '');

			if (!len) {
				return;
			}

			if (!this.caseSensitive) {
				needle = needle.toLowerCase();
			}

			this._suggestedStrings.splice(0, this._suggestedStrings.length);
			this._suggestedNeedle = String(fromValue || '');

			for (i = 0; i < len; i++) {

				item = this.caseSensitive ? this._strings[i] : this._strings[i].toLowerCase();

				if (item.indexOf(needle) > -1) {
					this._suggestedStrings.push(this._strings[i]);
				}

			}

			this._selectedIndex = -1;

			this.expanded = targetTag || true;

		} catch ( e ) {

			alert('error');

		}

	}

	/**
	 * Gets or sets the expanded state of the control. When the control is expanded,
	 * the auto-suggestion helper pops in the screen overlay.
	 */
	protected get expanded(): any {
		return !!this._overlay;
	}

	protected set expanded( value: any ) {
		
		value = value || false;

		switch ( true ) {
			case value instanceof UI_Tags_Tag:
				this._open(value);
				break;
			case !!value:
				this._open();
				break;
			default:
				this._close();
				break;
		}

	}

	/**
	 * Closes the auto-suggestion overlay.
	 */
	protected _close() {
		if (this._overlay) {
			this._overlay.close();
			this._overlay = null;
		}
	}

	/**
	 * if the control is in an expanded state, this function scrolls the selected option
	 * if needed in order to make it visible
	 */
	protected scrollIntoIndex( index: number ) {
		
		if (!this._overlay) {
			return;
		}

		if (index <= 0) {
			this._overlay.scrollTop = 0;
		} else {
			var optionLogicalY1 = (index) * UI_Tags._theme.option.height,
				optionLogicalY2 = (index + 1) * UI_Tags._theme.option.height;

			if (optionLogicalY1 < this._overlay.scrollTop) {
				this._overlay.scrollTop = optionLogicalY1;
			} else
				if (optionLogicalY2 > this._overlay.scrollTop + this._overlay.clientHeight) {
					this._overlay.scrollTop = optionLogicalY2 - this._overlay.clientHeight;
				}
		}

	}

	/**
	 * overlay auto-suggesions rendering routine.
	 */
	protected _renderOverlay() {

		if (!this._overlay) {
			return;
		}

		var ctx: UI_Canvas_ContextMapper = this._overlay.ctx,
			optWidth: number,
			optStart: number,
			optLength: number,
			optEnd: number,
			yTop: number,
			i: number,
			scrollTop: number = ctx.scrollTop,
			logicalHeight: number = ctx.logicalHeight,
			length: number = this._suggestedStrings.length;

		ctx.beginPaint();

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, ctx.width, ctx.height);

		// paint options.
		optWidth = ctx.clientWidth;

		optStart = ~~(scrollTop / UI_Tags._theme.option.height);
		optLength = ~~(ctx.height / UI_Tags._theme.option.height) + UI_Tags._theme.option.height * ~~!!(ctx.height % UI_Tags._theme.option.height);
		optEnd = optStart + optLength;
		optEnd = optEnd >= length ? length - 1 : optEnd;

		yTop = -(scrollTop % UI_Tags._theme.option.height);

		ctx.font = UI_Tags._theme.font.font;
		ctx.textBaseline = "middle";

		for (i = optStart; i <= optEnd; i++) {

			if (i == this._selectedIndex) {
				ctx.fillStyle = UI_Tags._theme.tag.background.selected;
				ctx.fillRect(0, yTop, optWidth, UI_Tags._theme.option.height);
			}

			ctx.fillStyle = UI_Tags._theme.font[i == this._selectedIndex ? 'selectedColor' : 'color'];

			//ctx.fillText(ctx.dotDotDot(this._suggestedStrings[i], optWidth - 4), 2, yTop + ~~(UI_ComboBox._theme.option.height / 2));
			ctx.fillTextSearchBoldedStyle(this._suggestedStrings[i], this._suggestedNeedle, false, 2, yTop + ~~(UI_Tags._theme.option.height / 2));

			yTop += UI_Tags._theme.option.height;
		}

		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.rect(0, 0, ctx.width, ctx.height - 1);
		ctx.stroke();

		ctx.endPaint();
	}

	/**
	 * Sets the string value of the current focused tag.
	 */
	protected setActiveTagValue( value: string ) {
		var activeTag = this.activeTag;
		if ( activeTag ) {
			activeTag.value = value;
		}
	}

	/**
	 * Fires a change event if the this.value property reflects changes after
	 * previously "change" fired event.
	 */
	protected fireChangeIfNeeded() {
		var value: string = JSON.stringify(this.value);
		if ( value != this._previousChangeValue) {
			this._previousChangeValue = value;
			if ( !this.disabled ) {
				this.fire('change');
			}
		}
	}

	/**
	 * Opens the auto-suggestions overlay.
	 */
	protected _open( targetKeyword: UI_Tags_Tag = null ) {

		if ( this._overlay ) {
			this._close();
		}

		var numRows: number = this._suggestedStrings.length,
			overlayHeight: number = Math.min(10, numRows) * UI_Tags._theme.option.height + 2,
			logicalHeight: number = numRows * UI_Tags._theme.option.height + 2,
			
			rect: any = this._root.getBoundingClientRect(),
			placement: IWindow;

		if ( !numRows ) {
			return;
		}

		// make the ClientRect writable. It seems it's properties does not have setters.
		rect = {
			bottom: rect.bottom,
			height: rect.height,
			left: rect.left,
			right: rect.right,
			top: rect.top,
			width: rect.width
		};

		if ( targetKeyword ) {


			rect.width = targetKeyword.paintWin.width;
			rect.height = targetKeyword.paintWin.height;
			rect.left += targetKeyword.paintWin.x - this.scrollLeft;
			rect.top += targetKeyword.paintWin.y - this.scrollTop;

		} else {

			rect.top += 2;
			rect.left += 2;
			rect.width = Math.max(rect.width - 4, 150);
			rect.height = 1;

		}

		if ( rect.width < 150 ) {
			rect.width = 150;
		}

		placement = UI_Screen.get.getBestPlacementDropDownStyle({
			x: rect.left,
			y: rect.top,
			width: rect.width,
			height: rect.height
		}, {
			"width": Math.min( this.clientRect.width, rect.width ),
			"height": overlayHeight
		}, 1);

		this._overlay = UI_Screen.get.createWindow(
			placement.x, placement.y,
			Math.max( placement.width, 150 ), placement.height,
			null,
			numRows * UI_Tags._theme.option.height
		);

		this._overlay.overflowY = EClientScrollbarOverflow.AUTO;

		(function(me: UI_Tags) {

			me._overlay.on( 'render', function() {
				me._renderOverlay();
			});

			me._overlay.on('mousemove', function(x: number, y: number) {

				var newSelectedIndex: number = ~~(y / UI_Tags._theme.option.height);

				if (newSelectedIndex >= numRows) {
					newSelectedIndex = numRows - 1;
				}

				if (newSelectedIndex != me._selectedIndex) {
					me._selectedIndex = newSelectedIndex;
					UI_Screen.get.render();
				}

			});

			me._overlay.on('click', function(x: number, y: number) {

				var newSelectedIndex: number = ~~(y / UI_Tags._theme.option.height);

				if (newSelectedIndex >= numRows) {
					return;
				}

				me._selectedIndex = newSelectedIndex;

				me.setActiveTagValue( me._suggestedStrings[me._selectedIndex] );

				me.expanded = false;

				me.fireChangeIfNeeded();

			});

			me._overlay.on('scroll', function(wheelX, wheelY) {

				if (wheelY != 0) {
					me._overlay.scrollTop += wheelY;
					UI_Screen.get.render();
				}

			});

			me._overlay.on('keydown', function(key: Utils_Event_Keyboard) {
				me.fire('keydown', key);
			});

			var onScreenClick = function(evt: Utils_Event_Mouse) {
				if ([<HTMLElement>me._root].indexOf(evt.target) > -1) {
					return;
				}

				UI_Screen.get.off('mousedown', onScreenClick);
				me.expanded = false;
			}

			UI_Screen.get.on('mousedown', onScreenClick);

		})(this);

		this.scrollIntoIndex(this._selectedIndex);

		UI_Screen.get.render();
	}

	/**
	 * If the control is displayed as a select ( it's widht is less than 100 px ), opens
	 * a MDI Child helper dialog in order to make editing of the control possible.
	 */
	private editExternally() {
		
		var me = this;

		UI_Dialog_TagBox.create(this.serialize, this.strings, this.form).then(function(values: any) {
			
			if ( values !== false ) {
				me.value = values;
				me.fireChangeIfNeeded();
			}

		});

	}

	/**
	 * Setups control events.
	 */
	protected _setupEvents_() {
		
		super._setupEvents_();

		(function(me: UI_Tags) {

			me.on('disabled', function( on: boolean ) {
				me._close();
				me.render();
			});

			me.on('scroll-y', function() {
				me.render();
			});

			me.on('focus', function() {
				me.render();

				setTimeout(function() {
					if ( me.activeTag === null && me._values.length ) {
						me.activeTag = me._values[me._values.length - 1];
					}
				}, 10);
			});

			me.on('blur', function() {
				me._close();
				this.render();
			});

			me.on('form-focus', function() {
				this.render();
			});

			me.on('form-blur', function() {
				me._close();
				this.render();
			});

			me.on('select-tag', function(tag: UI_Tags_Tag) {
				for (var i = 0, len = this._values.length; i < len; i++ ) {
					if ( this._values[i] != tag ) {
						this._values[i].selected = false;
					}
				}
				this.render();
				me.scrollTagInViewport(tag);
				me._suggestedNeedle = String(tag.value || '');
			});

			me.on( 'mousedown', function( point: IPoint, which: number ) {
				
				if ( me.disabled || which != 1 || !me._acceptsUserInput ) {
					return;
				}

				for (var i = 0, len = this._values.length; i < len; i++ ) {
					if ( this._values[i].containsPoint( point ) > 0 ) {
						this._values[i].selected = true;
						return;
					}
				}

			});

			me.on('click', function(point: IPoint, which: number) {

				if ( !me._acceptsUserInput && !me.disabled ) {
					me.editExternally();
					return;
				}

				if ( me.disabled || which != 1 ) {
					return;
				}

				var result: number;

				for (var i = 0, len = this._values.length; i < len; i++ ) {
					if ( result = this._values[i].containsPoint( point ) ) {
						this._values[i].selected = true;
					}
					
					switch ( true ) {
					 // contains point, but the point is located inside the close sign area
						case result == 2:
							me.removeTag(i);
							return;
							break;

						case result == 1 && this._values[i].sticky:
						case result == 3:
							
							switch ( this._values[i].checked ) {

								case null:
									this._values[i].checked = true;
									break;

								case true:
									this._values[i].checked = false;
									break;

								case false:
									if ( this._values[i].triState ) {
										this._values[i].checked = null;
									} else {
										this._values[i].checked = true;
									}
									break;

							}

							me.render();

							return;
							break;
					
					}
				}
			});

			me.on('keydown', function(key: Utils_Event_Keyboard) {

				if ( me.disabled || key.altKey || key.ctrlKey ) {
					return;
				}

				if ( !me._acceptsUserInput && [ Utils.keyboard.KB_SPACE, Utils.keyboard.KB_F4, Utils.keyboard.KB_ENTER ].indexOf( key.code ) > -1 ) {
					me.editExternally();
					key.preventDefault();
					key.stopPropagation();
					key.handled = true;
					return;
				}

				var selectedIndex: number = -1,
					activeTag: UI_Tags_Tag = null,
					i: number,
					len: number,
					overlayNavigated: boolean = false;

				for (i = 0, len = this._values.length; i < len; i++ ) {
					if ( this._values[i].selected ) {
						selectedIndex = i;
						activeTag = this._values[i];
					}
				}

				switch ( key.code ) {

					case Utils.keyboard.KB_LEFT:

						if ( selectedIndex == -1 && len > 0 ) {
							me.activeTag = me._values[0];
						} else 
						if ( selectedIndex > 0 && len > 0 ) {
							me.activeTag = me._values[selectedIndex - 1];
						}

						if ( me.expanded ) {
							me.expanded = false;
						}
						
						break;

					case Utils.keyboard.KB_RIGHT:

						if ( selectedIndex == -1 && len > 0 ) {
							me.activeTag = me._values[len - 1];
						} else
						if ( selectedIndex < len - 1 && len > 0 ) {
							me.activeTag = me._values[selectedIndex + 1];
						}

						if ( me.expanded ) {
							me.expanded = false;
						}
						
						break;

					case Utils.keyboard.KB_HOME:

						if ( len > 0 ) {
							me.activeTag = me._values[0];

							if ( me.expanded ) {
								me.expanded = false;
							}
						
						}

						break;

					case Utils.keyboard.KB_END:

						if ( len > 0 ) {

							if ( me.expanded ) {
								me.expanded = false;
							}
						
							me.activeTag = me._values[len - 1];
						}

						break;

					case Utils.keyboard.KB_UP:

						if (me.expanded && me._suggestedStrings && me._suggestedStrings.length) {

							if ( me._selectedIndex == -1 ) {
								me._selectedIndex = me._suggestedStrings.length - 1;
							} else {
								me._selectedIndex--;
								if ( me._selectedIndex < 0 ) {
									me._selectedIndex = me._suggestedStrings.length - 1;
								}
							}
							overlayNavigated = true;
						}

						break;

					case Utils.keyboard.KB_DOWN:

						if (me.expanded && me._suggestedStrings && me._suggestedStrings.length) {

							if ( me._selectedIndex == -1 ) {
								me._selectedIndex = 0;
							} else {
								me._selectedIndex++;
								if ( me._selectedIndex >= me._suggestedStrings.length ) {
									me._selectedIndex = 0;
								}
							}
							overlayNavigated = true;
						} else {
							
							if ( !me.expanded && activeTag ) {
								me.expanded = activeTag;
							}

						}

						break;

					case Utils.keyboard.KB_F4:
						
						if ( !me.expanded ) {
							if (activeTag) {
								me.computeSuggestedStrings(activeTag.value || '', activeTag);
							}
						}

						break;

					case Utils.keyboard.KB_ESC:
						if ( me.expanded ) {
							me.setActiveTagValue( me._suggestedNeedle );
							me.expanded = false;
						}
						break;

					case Utils.keyboard.KB_ENTER:
						if ( me.expanded && me._selectedIndex != -1 ) {
							me.expanded = false;
							me.fireChangeIfNeeded();
						}
						break;

					case Utils.keyboard.KB_SHIFT:
						break;

					default:
						
						if (key.keyName == this.tagSeparator) {

							if ( activeTag ) {

								if ( activeTag.value ) {

									if (this._values[selectedIndex + 1] && !this._values[selectedIndex + 1].value) {

										if ( this.expanded ) {
											this.expanded = false;
										}

										this.activeTag = this._values[selectedIndex + 1];
									} else {

										if ( this.expanded ) {
											this.expanded = false;
										}

										this._values.splice(selectedIndex + 1, 0, activeTag = new UI_Tags_Tag(this, null));

										this.activeTag = activeTag;
									}

								}
							}

						} else {

							if (!key.ctrlKey && !key.altKey && activeTag) {
								activeTag.dispatchKeyboardEvent(key, selectedIndex);
							} else {

								activeTag = this._values[0] || null;

								if (!activeTag && key.keyName.length == 1) {
									this._values.push(activeTag = new UI_Tags_Tag(this, null));
								}

								if (activeTag) {
									this.activeTag = activeTag;

									activeTag.dispatchKeyboardEvent(key, 0);
								}
							}
						}
						break;

				}

				if ( overlayNavigated ) {
					me.setActiveTagValue(me._suggestedStrings[me._selectedIndex]);
					me.scrollIntoIndex(me._selectedIndex);
					UI_Screen.get.render();
					me.fireChangeIfNeeded();
				}

			});

		})(this);

	}

	/**
	 * Returns the raw list of the tags objects of the control.
	 */
	get tags(): UI_Tags_Tag[] {
		return this._values;
	}

}

Mixin.extend('UI_Tags', 'MFocusable');

Constraint.registerClass({
	"name": "UI_Tags",
	"extends": "UI_Canvas",
	"properties": [
		{
			"name": "value",
			"type": "string[]"
		},
		{
			"name": "strings",
			"type": "string[]"
		},
		{
			"name": "active",
			"type": "boolean"
		},
		{
			"name": "wantTabs",
			"type": "boolean"
		},
		{
			"name": "tabIndex",
			"type": "number"
		},
		{
			"name": "includeInFocus",
			"type": "boolean"
		},
		{
			"name": "accelerators",
			"type": "string"
		}
	]
});