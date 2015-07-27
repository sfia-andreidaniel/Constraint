enum EAlignment {
	TOP,
	LEFT,
	RIGHT,
	BOTTOM,
	CENTER
}

// A Form can be in these 5 states
enum EFormState {
	NORMAL,
	MINIMIZED,
	MAXIMIZED,
	FULLSCREEN,
	CLOSED
}

// A Form can have either EBorderStyle.NORMAL, meaning that
// it's titlebar is displayed, either none meaning it has no titlebar at all.
enum EBorderStyle {
	NORMAL,
	NONE
}

// resizable or not?
enum EFormStyle {
	FORM,      // Allows the form to be resized.
	MDI        // MDI doesn't allow the form to be resized.
}

// moveable or not?
enum EFormPlacement {
	AUTO,      // moveable
	CENTER     // centered, not moveable
}

// type of resizing
enum EResizeType {
	N,
	S,
	W,
	E,
	NW,
	NE,
	SW,
	SE,
	NONE
}

// File open modes.
enum EFileSyncMode {
	SYNC,
	ASYNC
}

// MenuItems input types
enum EMenuItemInputType {
	NONE,
	RADIO,
	CHECKBOX
}

enum EColumnType {
	INT,
	FLOAT,
	STRING,
	BOOLEAN,
	DATE,
	TREE
}