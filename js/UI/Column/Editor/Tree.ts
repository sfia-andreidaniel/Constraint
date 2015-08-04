class UI_Column_Editor_Tree extends UI_Column_Editor {

	/**
	 * Returns the "left" position of the editor, in pixels.
	 */
	get leftPosition(): number {
		return this._column
			? this._column.left.distance + (
				this._rowIndex != -1
					? ( ( <Store_Node>this._column.itemAt( this._rowIndex ) ).connectors.length + 1 ) * this._column.grid.rowHeight
					: 0
			)
			: 0;
	}

	get width(): number {
		return ( this._column ? this._column.width : 0 ) - (
				this._rowIndex != -1
					? ( ( <Store_Node>this._column.itemAt( this._rowIndex ) ).connectors.length + 1 ) * this._column.grid.rowHeight
					: 0
			) - 2 * UI_Column_Editor._theme.border.width
	}

}