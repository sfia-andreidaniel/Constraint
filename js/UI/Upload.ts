class UI_Upload extends UI implements IFocusable {
	
	public static _theme = {
		defaultWidth: $I.number('UI.UI_Upload/defaultWidth'),
		defaultHeight: $I.number('UI.UI_Upload/defaultHeight')
	};

	protected _dom = {
		file: Utils.dom.create('input'),
		// placeholder where the file name will be shown
		caption: Utils.dom.create('div', 'caption'),
		// the speed button (browse)
		speed: Utils.dom.create('div', 'speed'),
		// the dotted focusring
		focusRing: Utils.dom.create('div', 'focusring')
	};

	//FILE UPLOAD PROPERTIES

	protected _transport: UI_Upload_Transport = null;

	// whether the input allows multiple files or not
	protected _multiple: boolean = false;

	// the caption of the speed button
	protected _caption: string = 'Browse';

	// the file name that is displayed to the user
	protected _fileName: string = '';

	// the files collection
	protected _files: File[] = null;

	public active: boolean; // the active is overrided by the MFocusable mixin
	public wantTabs: boolean = false;
	public tabIndex: number = 0;
	public includeInFocus: boolean = true;
	public accelerators: string;

	constructor( owner: UI ) {
		super(owner, ['IFocusable'], Utils.dom.create('div', 'ui UI_Upload'));

		if (this._width == 0)
			this.width = UI_Upload._theme.defaultWidth;

		if (this._height == 0)
			this.height = UI_Upload._theme.defaultHeight;

		this._initDom_();
	}

	public get transportType(): EFileUploadTransportType {
		return this._transport
			? this._transport.type
			: null;
	}

	public get transport( ): string {
		return this._transport
			? this._transport.toString()
			: null;
	}

	public set transport( url: string ) {
		url = String(url || '') || null;
		
		if ( url != this.transport ) {
			
			if ( url === null ) {
				if ( this._transport ) {
					this._transport.free();
				}
				this._transport = null;
			} else {
				this._transport = UI_Upload_Transport.create(url);
			}

			this.fire('transportChanged');
		}
	}

	public get multiple(): boolean {
		return this._multiple;
	}

	public set multiple( multiple: boolean ) {
		multiple = !!multiple;
		if ( multiple != this._multiple ) {
			this._multiple = multiple;
			switch ( multiple ) {
				case true:
					this._dom.file.setAttribute('multiple', 'multiple');
					break;
				case false:
					this._dom.file.removeAttribute('multiple');
					break;
			}
		}
	}

	public get caption(): string {
		return this._caption;
	}

	public set caption( caption: string ) {
		caption = String(caption || '') || 'Browse';
		if ( caption != this._caption ) {
			this._caption = caption;
			this._dom.speed.textContent = caption;
		}
	}

	protected get fileName(): string {
		return this._fileName;
	}

	protected set fileName( name: string ) {
		name = String(name || '') || '';
		if ( name != this._fileName ) {
			this._fileName = name;
			this._dom.caption.textContent = name;
		}
	}

	protected _initDom_() {
		this._dom.file.setAttribute('type', 'file');
		this._root.appendChild(this._dom.file);
		this._root.appendChild(this._dom.caption);
		this._dom.speed.textContent = this._caption;
		this._root.appendChild(this._dom.speed);
		this._root.appendChild(this._dom.focusRing);

		(function(me: UI_Upload) {

			me.onDOMEvent(me._dom.file, EEventType.CHANGE, function(e: Utils_Event_Generic) {

				var files: File[] = me._dom.file.files ? Array.prototype.slice.call( me._dom.file.files, 0 ) : [];

				me._files = files && files.length ? files : null;

				me._dom.caption.textContent = me._files
					? me._files.length == 1
						? me._files[0].name
						: String(me._files.length) + ' files'
					: '';

				if ( !me.disabled && !me.active ) {
					me.active = true;
				}

			}, false);

			me.on('focus', function() {
				if (!me.disabled) {
					setTimeout(function() {
						me._dom.file.focus();
					}, 1);
				}
			});

			me.on('blur', function() {
				me._dom.file.blur();
			});

			me.onDOMEvent(me._dom.file, EEventType.FOCUS, function(ev: Utils_Event_Generic) {
				if (me.form.activeElement != me) {
					me.active = true;
				}
			}, true);

			me.onDOMEvent(me._dom.file, EEventType.BLUR, function(ev: Utils_Event_Generic) {
				if (me.form.activeElement == me) {
					me.active = false;
				}
			}, true);

			me.onDOMEvent(me._dom.file, EEventType.MOUSE_DOWN, function(ev: Utils_Event_Mouse) {
				ev.stopPropagation();
			}, true);

			me.on('disabled', function(on: boolean) {
				me._dom.file.disabled = on;
			});

		})(this);
	}

}

Mixin.extend('UI_Upload', 'MFocusable');

Constraint.registerClass({
	"name": "UI_Upload",
	"extends": "UI",
	"properties": [
		{
			"name": "transport",
			"type": "string"
		},
		{
			"name": "caption",
			"type": "string"
		},
		{
			"name": "multiple",
			"type": "boolean"
		}
	]
});
