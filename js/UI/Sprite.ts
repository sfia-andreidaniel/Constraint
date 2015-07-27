class UI_Sprite extends UI_Event {
	
	constructor( private file: UI_Resource_File, private version: IResourceFileVersion, private _path: string ) {
		super();
	}

	get cssClasses(): string {
		switch ( true ) {
			case !this.version.repeatX && !this.version.repeatY:
				return 'ui-resource ' 
					+ this.file.owner.name + ' ' 
					+ this.file.name + '-' + this.version.width + 'x' + this.version.height + 
					( this.version.disabled ? ' disabled' : '' );
				break;
			case this.version.repeatX:
				return 'ui-resource '
					+ this.file.owner.name + ' '
					+ 'repeat-x '
					+ this.file.name + '-' + this.version.height;
				break;
			case this.version.repeatY:
				return 'ui-resource '
					+ this.file.owner.name + ' '
					+ 'repeat-y '
					+ this.file.name + '-' + this.version.width;
				break;
		}
	}

	// Returns the "enabled" version of this sprite
	get enabled(): UI_Sprite {
		if ( this.version.disabled ) {
			return UI_Resource.createSprite( this._path.replace( /\-disabled$/, '' ) );
		} else {
			return this;
		}
	}

	// Returns the "disabled" version of this sprite
	get disabled(): UI_Sprite {
		if ( !this.version.disabled ) {
			return UI_Resource.createSprite( this._path + '-disabled' );
		} else {
			return this;
		}
	}

	get path(): string {
		return this._path;
	}

	public paintWin( win: UI_Canvas_ContextMapper, x: number, y: number ) {
		if ( this.version.window ) {
			switch ( true ) {
				case !this.version.repeatX && !this.version.repeatY:
					win.drawImage(
						this.file.owner.stage,
						this.version.window.x,
						this.version.window.y,
						this.version.window.width,
						this.version.window.height,
						x,
						y,
						this.version.window.width,
						this.version.window.height
					);
					break;
				case this.version.repeatX:
					win.drawImage(
						this.file.owner.stageX,
						this.version.window.x,
						this.version.window.y,
						this.version.window.width,
						this.version.window.height,
						x,
						y,
						this.version.window.width,
						this.version.window.height
					);
					break;
				case this.version.repeatY:
					win.drawImage(
						this.file.owner.stageY,
						this.version.window.x,
						this.version.window.y,
						this.version.window.width,
						this.version.window.height,
						x,
						y,
						this.version.window.width,
						this.version.window.height
					);
					break;
			}
		}
	}

	public paintCtx( ctx: CanvasRenderingContext2D, x: number, y: number ) {
		if ( this.version.window ) {
			switch ( true ) {
				case !this.version.repeatX && !this.version.repeatY:
					ctx.drawImage(
						this.file.owner.stage,
						this.version.window.x,
						this.version.window.y,
						this.version.window.width,
						this.version.window.height,
						x,
						y,
						this.version.window.width,
						this.version.window.height
					);
					break;
				case this.version.repeatX:
					ctx.drawImage(
						this.file.owner.stageX,
						this.version.window.x,
						this.version.window.y,
						this.version.window.width,
						this.version.window.height,
						x,
						y,
						this.version.window.width,
						this.version.window.height
					);
					break;
				case this.version.repeatY:
					ctx.drawImage(
						this.file.owner.stageY,
						this.version.window.x,
						this.version.window.y,
						this.version.window.width,
						this.version.window.height,
						x,
						y,
						this.version.window.width,
						this.version.window.height
					);
					break;
			}
		}
	}
}