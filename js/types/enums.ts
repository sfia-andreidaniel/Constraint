/**
 * The EAlignment enumeration is used mostly by the UI_Anchor class, in
 * order to be able to reference edges of another elements in a layout.
 *
 * Example: You have two buttons, Button 1, and Button 2, and you want
 * to place Button 2 on the RIGHT edge of the button 1, at 50 pixels,
 * you would state that:
 *
 * Button2.left = Button1 RIGHT 50;
 *
 */
enum EAlignment {
	TOP,
	LEFT,	
	RIGHT,	
	BOTTOM,
	CENTER,
	HALF
}

/**
 * The EFormState enumeration defines the state that a UI_Form can
 * have. An UI_Form can be at a time only in one of these states.
 */
enum EFormState {
	NORMAL,
	MINIMIZED,
	MAXIMIZED,
	FULLSCREEN,
	CLOSED
}

/** 
 * The EBorderStyle enumeration defines weather an UI_Form should
 * render it's titlebar (NORMAL) or not (NONE).
 *
 */ 
enum EBorderStyle {
	NORMAL,
	NONE
}


/**
 * An UI_Form can be defined as a "desktop" root form (e.g. is visible)
 * in the taskbar, or a subform (MDI), meaning that it is a child of
 * another form ( for example a "search text" dialog is a MDI form).
 */
enum EFormStyle {
	FORM,      // Allows the form to be resized.
	MDI        // MDI doesn't allow the form to be resized.
}

/**
 * The EFormPlacement defines how an UI_Form should be placed on the screen:
 * * AUTO - the user can "move" the form by dragging
 * * CENTER - the form stays always in the center of the "desktop", and the user
 *   is not able to move it.
 */
enum EFormPlacement {
	AUTO,      // managed by UI_DialogManager
	CENTER,    // centered, not moveable
	DESIGNED   // fixed, when opening it's origina left and right coordinates are set on the desktop
}

/**
 * Types of animations a form can execute
 */
enum EFormAnimation {
	SHAKE,
	BLINK
}

/**
 * The EResize type defines a type of resizing operation:
 * * N - North
 * * S - South
 * * ... and so on
 */
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

/**
 * The EFileSyncMode defines how a file should be opened ( under node or browser via ajax )
 * * SYNC: the file is opened in sync mode. Any operation is disabled until the file is opened
 * * ASYNC: the file is opened in async mode. All other operations of js are working (PREFERRED)
 *
 * The class FS_File uses this enumeration.
 *
 */
enum EFileSyncMode {
	SYNC,
	ASYNC
}

/**
 * An UI_MenuItem can render a checkbox or a radio box, you can use this type to state that.
 *
 *
 */
enum EMenuItemInputType {
	NONE,
	RADIO,
	CHECKBOX
}

/**
 * An UI_Column has a "type", which is needed to tell the column how to render it's values
 * and how to edit them.
 *
 * These types are implemented at this point.
 *
 */
enum EColumnType {
	ROW_NUMBER,
	INT,
	FLOAT,
	STRING,
	BOOLEAN,
	TREE,
	BYTES,
	DATE
}

/**
 * Defines the sort state of a UI_Column, or a sort direction in a sort function.
 *
 */
enum ESortState {
	NONE,
	ASC,
	DESC
}

/**
 * When "walking" a Store, you can pass one of this value to the Traverser,
 * in order to instruct it to stop, stop recursivity, or to pass the current
 * item to it's aggregator function.
 */

enum ETraverseSignal {
	CONTINUE,
	STOP,
	STOP_RECURSIVE,
	AGGREGATE
}

/**
 * Date components. Used for parsing dates.
 *
 */
 enum EDatePart {
 	DAY,
 	MONTH,
 	YEAR,
 	HOUR,
 	MINUTE,
 	SECOND,
 	UNIX_TIMESTAMP,
 	MILLISECONDS
 }

 /**
  * String padding enumerator ( where to place the pad when using Utils.string.pad )
  */
enum EStrPadding {
	LEFT, // Pad string to the left
	RIGHT,// Pad string to the right
	BOTH  // Pad string to both sizes
}

/**
 * Defines how a Canvas Context Mapper should treat / render it's scrollbars,
 * in case it's logical size exceeds it's physical size
 */
enum EClientScrollbarOverflow {
	HIDDEN,
	AUTO,
	ALWAYS
}

/**
 * Defines how to address coordinates inside of a Canvas Context Mapper: Logical or absolute
 */

enum ECanvasPaintMode {
	ABSOLUTE,
	LOGICAL
}

/**
 * Defines reasons a date can be invalid
 */
enum EInvalidDate {
	NONE,
	DATE_ERROR,
	DATE_TOO_BIG,
	DATE_TOO_SMALL
}

/**
 * Orientation enumerator
 */
enum EOrientation {
	HORIZONTAL,
	VERTICAL
}

/**
 * Standard Dialogs. Message box types
 */
enum EDialogBoxType {
	MB_INFO,
	MB_WARNING,
	MB_ALERT,
	MB_ERROR
}

/**
 * Standard Dialog Button types
 */
enum EDialogButtonTypes {
	BTN_OK,
	BTN_CANCEL,
	BTN_YES,
	BTN_NO,
	BTN_ABORT,
	BTN_RETRY,
	BTN_IGNORE
}

/**
 * Possible DOM events
 */
enum EEventType {
	
	MOUSE_DOWN,
	MOUSE_UP,
	MOUSE_MOVE,
	MOUSE_WHEEL,
	MOUSE_OVER,
	MOUSE_OUT,
	SCROLL,
	CLICK,
	DBLCLICK,

	KEY_UP,
	KEY_DOWN,
	KEY_PRESS,

	FOCUS,
	BLUR,
	INPUT,
	RESIZE,
	LOAD,
	ERROR,
	CHANGE

}

/**
 * Layout types.
 */
enum ELayoutType {
	NONE,
	LEFT_TO_RIGHT,
	TOP_TO_BOTTOM
}

/**
 * File upload transport types
 */
enum EFileUploadTransportType {
	SOCKFTPD
}