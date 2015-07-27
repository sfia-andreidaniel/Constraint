/* The canvas context mapper makes a virtual "window" on a 2d canvas context,
   limiting the drawing inside the window region.

   Everything drawn outside the window region is clipped.

*/

class UI_Canvas_ContextMapper {

	constructor( private ctx: CanvasRenderingContext2D, private size: IWindow ) {
	}

	get left(): number {
		return this.size.x;
	}

	get top(): number {
		return this.size.y;
	}

	get width(): number {
		return this.size.width;
	}

	get height(): number {
		return this.size.height;
	}

	set left( distance: number ) {
		this.size.x = ~~distance;
	}

	set top( distance: number ) {
		this.size.y = ~~distance;
	}

	set width( distance: number ) {
		this.size.width = ~~distance;
	}

	set height( distance: number ) {
		this.size.height = ~~distance;
	}

	// before anything is painted on the window, this method must be called
	public beginPaint() {
		this.ctx.save();
		this.ctx.beginPath();
		this.ctx.rect( this.size.x, this.size.y, this.size.width, this.size.height );
		this.ctx.clip();
	}

	// before ending the paint sequence, this method must be called.
	public endPaint() {
		this.ctx.restore();
	}

	// returns TRUE if a point in the main screen is contained by this window.
	public containsAbsolutePoint( x: number, y: number ): boolean {
		return x >= this.size.x && x <= this.size.x + this.size.width - 1 && y >= this.size.y && y <= this.size.y + this.size.height - 1;
	}

	/* CANVAS API METHODS AND PROPERTIES ARE IMPLEMENTED ON UI_Canvas_ContextMapper
	   All the methods that require coordinates, are translated to local window coordinates 
	*/

	get imageSmoothingEnabled(): boolean {
		return this.ctx['imageSmoothingEnabled'];
	}

	set imageSmoothingEnabled( on: boolean ) {
		this.ctx['imageSmoothingEnabled'] = !!on;
	}

	public clearRect( x: number, y: number, width: number, height: number ) {
		this.ctx.clearRect( this.size.x + x, this.size.y + y, width, height );
	}

	public fillRect( x: number, y: number, width: number, height: number ) {
		this.ctx.fillRect( this.size.x + x, this.size.y + y, width, height );
	}

	public strokeRect( x: number, y: number, width: number, height: number ) {
		this.ctx.strokeRect( this.size.x + x, this.size.y + y, width, height );
	}

	public fillText( ...args: any[] ) {
		args[1] += this.size.x;
		args[2] += this.size.y;
		this.ctx.fillText.apply( this.ctx, args );
	}

	public strokeText( text: string, x: number, y: number, maxWidth?: number ) {
		this.ctx.strokeText( text, this.size.x + x, this.size.y + y, maxWidth );
	}

	get lineWidth(): number {
		return this.ctx.lineWidth;
	}

	set lineWidth( width: number ) {
		this.ctx.lineWidth = width;
	}

	get lineCap(): string {
		return this.ctx.lineCap;
	}

	set lineCap( cap: string ) {
		this.ctx.lineCap = cap;
	}

	get lineJoin(): string {
		return this.ctx.lineJoin;
	}

	set lineJoin( join: string ) {
		this.ctx.lineJoin = join;
	}

	get miterLimit(): number {
		return this.ctx.miterLimit;
	}

	set miterLimit( limit: number ) {
		this.ctx.miterLimit = limit;
	}

	get lineDash(): any {
		return this.ctx.getLineDash();
	}

	set lineDash( dash: any ) {
		this.ctx.setLineDash( dash );
	}

	get lineDashOffset( ): number {
		return this.ctx.lineDashOffset;
	}

	set lineDashOffset( offset: number ) {
		this.ctx.lineDashOffset = offset;
	}

	get font(): string {
		return this.ctx.font;
	}

	set font( font: string ) {
		this.ctx.font = font;
	}

	get textAlign(): string {
		return this.ctx.textAlign;
	}

	set textAlign( align: string ) {
		this.ctx.textAlign = align;
	}

	get textBaseline(): string {
		return this.ctx.textBaseline;
	}

	set textBaseline( baseLine: string ) {
		this.ctx.textBaseline = baseLine;
	}

	/*
	get direction(): string {
		return this.ctx.direction;
	}

	set direction( dir: string ) {
		this.ctx.direction = dir;
	}
	*/

	get fillStyle(): string {
		return this.ctx.fillStyle;
	}

	set fillStyle( fillStyle: string ) {
		this.ctx.fillStyle = fillStyle;
	}

	get strokeStyle(): string {
		return this.ctx.strokeStyle;
	}

	set strokeStyle( strokeStyle: string ) {
		this.ctx.strokeStyle = strokeStyle;
	}

	get shadowBlur(): number {
		return this.ctx.shadowBlur;
	}

	set shadowBlur( shadowBlur: number ) {
		this.ctx.shadowBlur = shadowBlur;
	}

	get shadowColor( ): string {
		return this.ctx.shadowColor;
	}

	set shadowColor( shadowColor: string ) {
		this.ctx.shadowColor = shadowColor;
	}

	get shadowOffsetX(): number {
		return this.ctx.shadowOffsetX;
	}

	set shadowOffsetX( shadowOffsetX: number ) {
		this.ctx.shadowOffsetX = shadowOffsetX;
	}

	get shadowOffsetY(): number {
		return this.ctx.shadowOffsetY;
	}

	set shadowOffsetY( shadowOffsetY: number ) {
		this.ctx.shadowOffsetY = shadowOffsetY;
	}

	public beginPath() {
		this.ctx.beginPath();
	}

	public closePath() {
		this.ctx.closePath();
	}

	public moveTo( x: number, y: number ) {
		this.ctx.moveTo( this.size.x + x, this.size.y + y );
	}

	public lineTo( x: number, y: number ) {
		this.ctx.lineTo( this.size.x + x, this.size.y + y );
	}

	public arc( x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean ) {
		this.ctx.arc( this.size.x + x, this.size.y + y, radius, startAngle, endAngle, anticlockwise );
	}

	public arcTo( x1: number, y1: number, x2: number, y2: number, radius: number ) {
		this.ctx.arcTo( this.size.x + x1, this.size.y + y1, this.size.x + x2, this.size.y + y2, radius );
	}

	public rect( x, y, width, height ) {
		this.ctx.rect( this.size.x + x, this.size.y + y, width, height );
	}

	public fill( ...args: any[] ) {
		this.ctx.fill.apply( this.ctx, args );
	}

	public stroke( ...args: any[] ) {
		this.ctx.stroke.apply( this.ctx, args );
	}

	get globalAlpha(): number {
		return this.ctx.globalAlpha;
	}

	set globalAlpha( alpha: number ) {
		this.ctx.globalAlpha = alpha;
	}

	get globalCompositeOperation(): string {
		return this.ctx.globalCompositeOperation;
	}

	set globalCompositeOperation( mode: string ) {
		this.ctx.globalCompositeOperation = mode;
	}

	public drawImage( ...args: any[] ) {
		switch ( args.length ) {
			case 3:
				this.ctx.drawImage( args[0], this.size.x + args[1], this.size.y + args[2] );
				break;
			case 5:
				this.ctx.drawImage( args[0], this.size.x + args[1], this.size.y + args[2], args[3], args[4] );
				break;
			case 9:
				this.ctx.drawImage( args[0], args[1], args[2], args[3], args[4], this.size.x + args[5], this.size.y + args[6], args[7], args[8] );
				break;
			default:
				throw new Error( 'Invalid arguments' );
				break;
		}
	}

	public createImageData( ...args: any[] ): ImageData {
		return this.ctx.createImageData.apply( this.ctx, args );
	}

	public getImageData( sx: number, sy: number, sw: number, sh: number ): ImageData {
		return this.ctx.getImageData( this.size.x + sx, this.size.y + sy, sw, sh );
	}

	public putImageData( ...args: any[] ) {
		args[1] += this.size.x;
		args[2] += this.size.y;
		this.ctx.putImageData.apply( this.ctx, args );
	}

	public save() {
		this.ctx.save();
	}

	public restore() {
		this.ctx.restore();
	}

}