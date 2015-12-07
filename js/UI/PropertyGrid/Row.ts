/**
 * UI_PropertyGrid internal class, representing a generic input row.
 */
class UI_PropertyGrid_Row extends UI_Event {
	
	protected _name: string = '';
	protected _caption: string = '';
	protected _grid: UI_PropertyGrid;
	protected _parent: UI_PropertyGrid_Row_Group;
	protected _selected: boolean;
	protected _input: UI;
	protected _disabled: boolean = false;


	constructor( groupConfig: IPropertyGroupNested, grid: UI_PropertyGrid, parent: UI_PropertyGrid_Row_Group ) {
		super();

		this._name = groupConfig.name;
		this._caption = groupConfig.caption;
		this._grid = grid;
		this._parent = parent;
		
		if ( typeof groupConfig.disabled != 'undefined' ) {
			this._disabled = !!groupConfig.disabled;
		}
	}

	get name(): string {
		return this._name;
	}

	get caption(): string {
		return this._caption;
	}

	get fullNotation(): string {
		if ( this._parent ) {
			return this._parent.fullNotation + '.' + this._name;
		} else {
			return this._name;
		}
	}

	set caption( caption: string ) {
		caption = String( caption ) || '';
		if ( caption != this._caption ) {
			this._caption = caption;
			this._grid.render();
		}
	}

	get visible(): boolean {
		if ( !this._parent ) {
			return true; // root properties are always visible
		} else {
			return this._parent.expanded && this._parent.visible;
		}
	}

	get selected(): boolean {
		return !!this._selected;
	}

	set selected( on: boolean ) {
		this._selected = !!on;
		this._grid.render();
	}

	get children(): UI_PropertyGrid_Row[] {
		return null;
	}

	get length(): number {
		return 0;
	}

	get depth(): number {
		if ( this._parent ) {
			return this._parent.depth + 1;
		} else {
			return 0;
		}
	}

	get disabled(): boolean {
		
		if ( this._disabled ) {
		
			return true;
		
		} else {
		
			if ( this._parent ) {
				return this._parent.disabled;
			} else {
				return false;
			}
		}
	}

	set disabled( on: boolean ) {
		
		on = !!on;
		
		if ( on != this._disabled ) {
		
			this._disabled = on;
			
			if ( this._input ) {
				this.editMode = false;
			}

			if ( !!this.children ) {
				this.fire( 'disabled', this.disabled );
			}

			this._grid.render();
		}
	}

	public paintAt( x: number, y: number, height: number, isDisabled: boolean, isActive: boolean, splitWidth: number, isScrollbarX: boolean, isScrollbarY: boolean, ctx: UI_Canvas_ContextMapper ) {

		var padding: number = ( this.depth ) * UI_PropertyGrid._theme.defaults.depthUnitWidth,
		    expanderPadding: number = ~~!!this.length * UI_PropertyGrid._theme.defaults.depthUnitWidth;

		ctx.strokeStyle = isDisabled ? UI_PropertyGrid._theme.border.disabled : UI_PropertyGrid._theme.border.enabled;
		
		if ( splitWidth > padding ) {
			ctx.strokeRect( x + padding + .5, y + .5, ctx.width - padding, height );
		} else {
			ctx.strokeRect( splitWidth + .5, y + .5, ctx.width - splitWidth, height );
		}

		if ( padding ) {
			ctx.fillStyle = UI_Canvas._theme.background.disabled;
			ctx.fillRect( x, y + .5, Math.min( padding, splitWidth ), height - .5 );
		}

		ctx.strokeStyle = isDisabled ? UI_PropertyGrid._theme.border.disabled : UI_PropertyGrid._theme.border.enabled;
		ctx.moveTo( splitWidth, y );
		ctx.lineTo( splitWidth, y + height );
		ctx.stroke();

		if ( this._selected ) {
			
			ctx.fillStyle = isDisabled
				? UI_PropertyGrid._theme.option.background.disabled
				: (	isActive 
					? UI_PropertyGrid._theme.option.background.selected
					: UI_PropertyGrid._theme.option.background.selectedInactive
				);

			if ( splitWidth > padding ) 
				ctx.fillRect( x + padding + 1, y + 1.5, splitWidth - padding - 2, height - 2 );
			
			if ( !!this.children ) {
				ctx.fillRect( splitWidth + 1, y + 1.5, ctx.width - splitWidth - 2, height - 2 );
			}

			ctx.fillStyle = isActive
				? UI_Canvas._theme.font.color.selectedEnabled
				: ( isDisabled ? UI_Canvas._theme.font.color.selectedDisabled : UI_Canvas._theme.font.color.selectedInactive );

		} else {
			
			ctx.fillStyle = isDisabled
				? UI_Canvas._theme.font.color.disabled
				: UI_Canvas._theme.font.color.normal;

		}

		if ( expanderPadding && ( splitWidth > padding + expanderPadding + 15 ) ) {
			
			UI_Resource.createSprite(
				UI_PropertyGrid._theme.expander[ (<any>this).expanded ? 'expanded' : 'collapsed' ]
			).paintWin( ctx, x + padding + ~~( expanderPadding / 2 ) - 10, ~~( y + height / 2 - 10 ) );

		}

		if ( splitWidth > padding + expanderPadding + 15 ) {
			ctx.fillText( ctx.dotDotDot( this._caption, splitWidth - padding - expanderPadding - 4 ), x + padding + expanderPadding + 2, y + ~~( height / 2 ) );
		}

		if ( isDisabled ) {
			ctx.fillStyle = UI_Canvas._theme.font.color.disabled;
		}

	}

	get editMode(): boolean {
		return !!this._input;
	}

	set editMode( on: boolean ) {
		
		var result: UI;
		
		on = !!on;
		
		if ( on != this.editMode ) {
			
			this._grid.disposeEditor();

			if ( !on ) {
				
				if ( this._input && this._input['active'] ) {
					this._grid['active'] = true;
				}

				if ( this._input )
					this._input.remove();

			} else {

				result = this.disabled ? undefined : this.createEditor();

				this._input = result;

				this._grid.paint();

				if ( this._input ) {
					this._input['active'] = true;
				}
			}
		}
	}

	get isHandlingUpDown(): boolean {
		return false;
	}

	protected createEditor(): UI {
		return null;
	}


}