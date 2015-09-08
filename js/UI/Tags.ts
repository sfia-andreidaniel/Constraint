/**
 * The UI_Tags class allows the user to input a list of keywords or tags, in an easy way.
 */

class UI_Tags extends UI_Canvas implements IFocusable, IInput {

	public static _theme = {
		defaults: {
			width: $I.number('UI.UI_Tags/defaults.width'),
			height: $I.number('UI.UI_Tags/defaults.height')
		},
		font: {
			font: $I.number('UI.UI_Tags/font.size') + 'px \'' + $I.string('UI.UI_Tags/font.family') + '\''
		},
		tag: {
			height: $I.number('UI.UI_Tags/tag.height'),
			margin: $I.number('UI.UI_Tags/tag.margin'),
			background: {
				disabled: $I.string('UI.UI_Tags/tag.background.disabled'),
				normal: $I.string('UI.UI_Tags/tag.background.normal'),
				selected: $I.string('UI.UI_Tags/tag.background.selected')
			},
			color: {
				disabled: $I.string('UI.UI_Tags/tag.color.disabled'),
				normal: $I.string('UI.UI_Tags/tag.color.normal'),
				selected: $I.string('UI.UI_Tags/tag.color.selected')
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
			close: $I.string('UI.UI_Tags/icons.close')
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
 	public    active: boolean; // the active is overrided by the MFocusable mixin

	/**
	 * IFocusable required property
	 */
	public    wantTabs: boolean = false;

	/**
	 * IFocusable required property
	 */
	public    tabIndex: number = 0;

	/**
	 * IFocusable required property
	 */
	public    includeInFocus: boolean = true;

	/**
	 * The keyboard shortcut for creating a new tag.
	 */

	public tagSeparator: string = ',';

	/**
	 * IFocusable required property
	 */
	public    accelerators: string;


	constructor( owner: UI ) {
		super(owner, ['IFocusable']);
		Utils.dom.addClass( this._root, 'UI_Tags');
		this._width = UI_Tags._theme.defaults.width;
		this._height = UI_Tags._theme.defaults.height;
	}

	get value(): any[] {

		var result: string[],
			i: number,
			len: number;
		
		for (i = 0, len = this._values.length; i < len; i++ ) {
			if ( !result ) {
				if (this._values[i].value) {
					result = [];
					result.push(this._values[i].value);
				}
			} else {
				if (this._values[i].value);
				result.push(this._values[i].value);
			}
		}

		return result || null;
	}

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
							
							if (typeof tag.checked != 'undefined') {
								newTag.checked = <boolean>tag.checked;
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
	 * Returns the total number of tags in the input.
	 */
	get length(): number {
		return this._values.length;
	}

	get strings(): string[] {
		return this._strings;
	}

	get neededLines(): number {
		
		this.globalContext.font = UI_Tags._theme.font.font;

		var numLines = 1,
			currentLineWidth: number = 0,
			tagWidth: number = 0,
			i: number,
			len: number = this._values.length,
			width: number = this.clientRect.width - 25;

		for (i = 0; i < len; i++ ) {
			tagWidth = this._values[i].width;
			if ( tagWidth + currentLineWidth <= width ) {
				currentLineWidth += tagWidth + UI_Tags._theme.tag.margin;
			} else {
				currentLineWidth = tagWidth + UI_Tags._theme.tag.margin;
				numLines++;
			}
		}

		return numLines;

	}

	get paintableTags(): UI_Tags_Tag[][] {
		
		this.globalContext.font = UI_Tags._theme.font.font;

		var result: UI_Tags_Tag[][] = [],
			line: UI_Tags_Tag[] = [],
			numLines = 1,
			currentLineWidth: number = UI_Tags._theme.tag.margin,
			tagWidth: number = 0,
			i: number,
			len: number,
			width: number = this.clientRect.width - 25;

		for (i = 0, len = this._values.length; i < len; i++ ) {

			tagWidth = this._values[i].width;

			if ( tagWidth + currentLineWidth <= width ) {
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
		}

	}

	public render() {

		var isDisabled: boolean = this.disabled,
		    isActive: boolean = this.active && ( this.form ? this.form.active : false ),
			bgColor: string = this.disabled
			    ? UI_Tags._theme.background.disabled
			    : (this.active ? UI_Tags._theme.background.enabled : UI_Tags._theme.background.inactive),
			ctx: UI_Canvas_ContextMapper = this.defaultContext,
			tagLines = this.paintableTags,
			numLines = tagLines.length,
			currentLine = numLines - 1,
			lineX: number = ~~(UI_Tags._theme.tag.margin / 2),
			lineY: number = Math.min( ~~( ( this.clientRect.height + UI_Tags._theme.tag.margin ) / ( UI_Tags._theme.tag.height + UI_Tags._theme.tag.margin ) ), numLines ) 
				* ( UI_Tags._theme.tag.margin + UI_Tags._theme.tag.height ) - ~~( UI_Tags._theme.tag.margin / 2 ),
			i: number,
			len: number,

			itemBGColor: string,
			itemColor: string;

		if ( lineY < UI_Tags._theme.tag.margin + ~~( UI_Tags._theme.tag.height / 2 ) ) {
			lineY = UI_Tags._theme.tag.margin + ~~( UI_Tags._theme.tag.height / 2 );
		}

		ctx.beginPaint();

		ctx.fillStyle = bgColor;
		ctx.fillRect(0, 0, ctx.width, ctx.height);

		ctx.font = UI_Tags._theme.font.font;
		ctx.textAlign = 'right';
		ctx.textBaseline = "middle";

		while ( currentLine >= 0 && lineY > 0 ) {

			for (i = 0, len = tagLines[currentLine].length; i < len; i++ ) {

				itemBGColor = isDisabled
					? null
					: isActive && tagLines[currentLine][i].selected ? UI_Tags._theme.tag.background.selected : null;

				itemColor = isDisabled
					? UI_Tags._theme.tag.color.disabled
					: isActive && tagLines[currentLine][i].selected ? UI_Tags._theme.tag.color.selected : UI_Tags._theme.tag.color.normal;

				lineX += UI_Tags._theme.tag.margin + tagLines[currentLine][i].paintAt(lineX, lineY - ~~( UI_Tags._theme.tag.margin / 2 ) - UI_Tags._theme.tag.height, itemBGColor, itemColor, ctx);
			}

			lineY -= (UI_Tags._theme.tag.margin + UI_Tags._theme.tag.height);
			currentLine--;
			lineX = ~~(UI_Tags._theme.tag.margin / 2);

		}

		ctx.endPaint();

	}

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

	public removeTag( tagIndex: number ) {
		
		if ( this._values[ tagIndex ] ) {
			this._values.splice(tagIndex, 1);
			this.activeTag = this._values[tagIndex] || this._values[tagIndex - 1] || null;
		}

	}

	protected _setupEvents_() {
		
		super._setupEvents_();

		(function(me: UI_Tags) {

			me.on('disabled', function( on: boolean ) {
				this.render();
			});

			me.on('focus', function() {
				this.render();

				setTimeout(function() {
					if ( me.activeTag === null && me._values.length ) {
						me.activeTag = me._values[me._values.length - 1];
					}
				}, 10);
			});

			me.on('blur', function() {
				this.render();
			});

			me.on('form-focus', function() {
				console.log('form-focus');
				this.render();
			});

			me.on('form-blur', function() {
				console.log('form-blur');
				this.render();
			});

			me.on('select-tag', function(tag: UI_Tags_Tag) {
				for (var i = 0, len = this._values.length; i < len; i++ ) {
					if ( this._values[i] != tag ) {
						this._values[i].selected = false;
					}
				}
				this.render();
			});

			me.on( 'mousedown', function( point: IPoint, which: number ) {
				
				if ( me.disabled || which != 1 ) {
					return;
				}

				for (var i = 0, len = this._values.length; i < len; i++ ) {
					if ( this._values[i].containsPoint( point ) ) {
						this._values[i].selected = true;
						return;
					}
				}

			});

			me.on('keydown', function(key: Utils_Event_Keyboard) {

				if ( me.disabled ) {
					return;
				}

				var selectedIndex: number = -1,
					activeTag: UI_Tags_Tag = null,
					i: number,
					len: number;

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
						
						break;

					case Utils.keyboard.KB_RIGHT:

						if ( selectedIndex == -1 && len > 0 ) {
							me.activeTag = me._values[len - 1];
						} else
						if ( selectedIndex < len - 1 && len > 0 ) {
							me.activeTag = me._values[selectedIndex + 1];
						}

						break;

					case Utils.keyboard.KB_HOME:

						if ( len > 0 ) {
							me.activeTag = me._values[0];
						}

						break;

					case Utils.keyboard.KB_END:

						if ( len > 0 ) {
							me.activeTag = me._values[len - 1];
						}

						break;

					default:
						
						if (key.keyName == this.tagSeparator) {

							if ( activeTag ) {

								if ( activeTag.value ) {

									if (this._values[selectedIndex + 1] && !this._values[selectedIndex + 1].value) {
										this.activeTag = this._values[selectedIndex + 1];
									} else {

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

			});

		})(this);

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