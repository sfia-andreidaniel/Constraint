class UI_Sprite_Null extends UI_Sprite {
	constructor( path: string ) {
		super(null,null,path);
	}

	get cssClasses(): string {
		return '';
	}

	get enabled(): UI_Sprite {
		return this;
	}

	get disabled(): UI_Sprite {
		return this;
	}

	get path(): string {
		return this._path;
	}

	public paintWin( win: UI_Canvas_ContextMapper, x: number, y: number ) {

	}

	public paintCtx( ctx: CanvasRenderingContext2D, x: number, y: number ) {

	}
}