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
		focusRing: Utils.dom.create('div', 'focusring'),
		// placeholder for the file label
		label: Utils.dom.create('div', 'label'),
		// placeholder for the speed button caption
		bLabel: Utils.dom.create('div', 'blabel')
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

			if ( this._transport ) {

				(function(me: UI_Upload) {
					
					me._transport.on('log', function(...args: any[]) {
						console.log('LOG: ', JSON.stringify(args));
					});

					me._transport.on('error', function(reason: string) {
						me.fire('error', reason);
					});

					me._transport.on('upload', function(f: File) {

						console.log('dbg: uploda: ', f);

						if ( me._files ) {
							
							for (var i = 0, len = me._files.length; i < len; i++ ) {
								if ( me._files[i].name == f.name && me._files[i].size == f.size ) {
									me._files.splice(i, 1);
									break;
								}
							}
							
							if ( me._files.length == 0 ) {
								me._files = null;
							}

						}

						me._dom.caption.textContent =
							me._files
								? me._files.length == 1
									? me._files[0].name
									: String(me._files.length) + ' files'
								: '';

						me.fire('upload', f);

					});

					me._transport.on('progress', function(f: File, percent: number ) {
						console.log('progress: ', f.name, percent);
						me.fire('progress', f, percent);
					});

				})(this);
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
			this._dom.bLabel.textContent = caption;
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
		
		this._root.appendChild(this._dom.label);
		this._dom.label.appendChild(this._dom.caption);
		
		this._dom.speed.appendChild(this._dom.bLabel);

		this._dom.bLabel.textContent = this._caption;

		this._root.appendChild(this._dom.speed);
		this._root.appendChild(this._dom.focusRing);

		(function(me: UI_Upload) {

			me.onDOMEvent(me._dom.file, EEventType.CHANGE, function(e: Utils_Event_Generic) {

				var files: File[] = me._dom.file.files ? Array.prototype.slice.call( me._dom.file.files, 0 ) : [];

				me._files = files && files.length ? files : null;

				console.log('set files: ', me._files);

				me._dom.caption.textContent = me._files
					? me._files.length == 1
						? me._files[0].name
						: String(me._files.length) + ' files'
					: '';

				if ( !me.disabled && !me.active ) {
					me.active = true;
				}

				me.fire('change');

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

			me.on('change', function() {
				if ( me.disabled ) {
					return;
				}

				if ( !me._transport ) {
					return;
				}

				if ( me._files ) {
					for (var i = 0, len = me._files.length; i < len; i++ ) {
						me._transport.upload(me._files[i]);
					}
				}

			});

		})(this);
	}

	public get files(): File[] {
		return this._files;
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
