class Frontend_Popup extends UI_Event {
	
	public static instances: Frontend_Popup[] = [];
	
	public static coolDown: number = 60;

	protected _root: HTMLDivElement;
	protected _hash: string = null;
	protected _closed: boolean = false;
	protected _targetURL: string = '';
	protected _target: string = '';
	protected _width: number = 0;
	protected _height: number = 0;
	protected _renderWidth: number = null;
	protected _renderHeight: number = null;
	protected _placement: string = null;

	protected _scale: number = 1;

	protected _physicalWidth: number = 0;
	protected _physicalHeight: number = 0;

	protected _timer: number = null;

	protected _dom : any = {
		img: null,
		body: null,
		close: null
	};


	protected static _css: string = [
		'html, body                              { min-width: 100%; min-height: 100%; padding: 0; margin: 0; width: 100%; height: 100%; }',
		'.frontend.popup                      { position: fixed; padding: 0; margin: 0; z-index: 100000; }',
		'.frontend.popup > div                { position: relative; width: 100%; height: 100%; }',
		'.frontend.popup > div > img          { display: block; position: absolute; margin: 0; padding: 0; border-width: 0px; cursor: pointer; left: 0px; top: 0px; right: 0px; bottom: 0px; width: 100%; height: 100%; }',
		'.frontend.popup > div > .close       { position: absolute; z-index: 10; width: 50px; height: 30px; right: 0px; top: 0px; display: block; background-color: rgba(0,0,0,.3); background-repeat: no-repeat; background-position: 50% 50%; background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wsLDBcx0irPggAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAASUlEQVQY042QQQ6AQAwCh/3/n8eTSV0xLqeGEgIEEEANBUkEWDvRRABrOs3HvNVE/XSckdZONNFD+IfzMi14K5h7x5bz5XhS5gLl5DENSHlXpAAAAABJRU5ErkJggg=="); }',
		'.frontend.popup:hover > div > .close { background-color: rgba(0,0,0,1); background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wsLDBgVabE3nAAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAAUUlEQVQY05WQQQqAMAwEJwXR/3/WqofxYFFqK9Q5bjbsJqHKRdBHgARwbPkW3qYyAxXVPa8Wuhofg2Yxnop11DQvVe/EKKPRv47pmRpzjD78BKDZy1c/Rj2yAAAAAElFTkSuQmCC"); }',
		'.frontend.popup.top-left             { left: 10px; top: 10px; }',
		'.frontend.popup.top-right            { right: 10px; top: 10px; }',
		'.frontend.popup.bottom-left          { left: 10px; bottom: 10px; }',
		'.frontend.popup.bottom-right         { right: 10px; bottom: 10px; }'
	].join('\n');
	
	protected static _cssAppended: boolean = false;

	/**
	 * @imageSrc: the source which will be used for the image
	 * @url:      the url which will be opened when the user clicks on the popup
	 * @cssClass: adds additional CSS classes to the popup, in order to allow skinning on target website
	 * @target:   the "tab" which will be used to open the popup. _self: same tab, "_blank": new tab, etc.
	 * @once:     whether the popup, after it's closed, won't be displayed again (TRUE), or if the popup will be displayed each time (FALSE)
	 * @timer:    takes effect only if @once is true. the number in seconds after which the popup will be automatically visible again.
	 * @width:    override the width in pixels of the popup
	 * @height:   override the height in pixels of the popup
	 */

	constructor( 
		imageSrc: string, 
		url: string,
		cssClass: string = '',
		target: string = '_self',
		once: boolean = true,
		timer: number = null,
		width: number = null,
		height: number = null
	) {
		super();
		
		this._hash  = Hash_Crc32.compute( imageSrc + ';' + url + ';' + ( once ? '1' : '0' ) + ';' + target ).toString(32);
		this._targetURL = String(url || '');
		this._target = String(target || '');
		this._placement = 'bottom-left';

		if ( once )
			this._timer = timer || null;

		this._closed = (Frontend.storage.cookie.get('frpop') || '').split(',').indexOf(this._hash) > -1;

		if ( this._closed && this.isExpired() ) {
			this.resetTimer();
			this._closed = false;
		}
		
		if (this._closed) {
			return;
		}

		this._dom.img = Utils_Dom.create('img');

		this._renderWidth = Math.abs( width || 0 ) || null;
		this._renderHeight = Math.abs(height || 0) || null;

		(function(me) {
			me._dom.img.onload = function() {
				me._width = me._dom.img.width;
				me._height = me._dom.img.height;
				
				if ( Frontend_Popup.isCoolDown ) {
					return;
				}

				me.show();
			}

			me._dom.img.onclick = function() {
				me.open();
			}
		})(this);
		
		if (!Frontend_Popup.isCoolDown)
			this._dom.img.src = imageSrc;

	}

	protected show() {
		
		if ( !this._dom.img ) {
			return;
		}

		if ( Frontend_Popup.instances.indexOf( this ) == -1 ) {
			Frontend_Popup.instances.push(this);
		}

		this._root = this._root || (function() { 
			var result: HTMLDivElement = Utils_Dom.create('div', 'frontend popup bottom-left'); 
			return result;
		})();
		
		this._dom.close = this._dom.close || (function( me ) { 
			var result: HTMLDivElement = Utils_Dom.create('div', 'close');
			
			result.onclick = function() {
				me.close();
			};
			
			return result;
		})( this );
		
		this._dom.body = this._dom.body || Utils_Dom.create('div', 'body');

		this._root.appendChild(this._dom.body);
		this._dom.body.appendChild(this._dom.img);
		
		this._dom.body.appendChild(this._dom.close);

		if ( !Frontend_Popup._cssAppended ) {
			(function() {
				var st = Utils_Dom.create('style');
				st.id = 'frontend-popup-css-default-style';
				st.textContent = Frontend_Popup._css;
				document.getElementsByTagName('head')[0].appendChild(st);
			})();
			Frontend_Popup._cssAppended = true;
		}

		this.scaleToFitViewport();

		document.body.appendChild(this._root);
	}

	private scale() {

		var aspectRatio: number = this._width / this._height;

		if ( this._renderHeight === null && this._renderWidth === null ) {
			this._root.style.width = ( this._physicalWidth = ~~( this._width * this._scale ) ) + "px";
			this._root.style.height = ( this._physicalHeight = ~~( this._height * this._scale ) ) + "px";
			return;
		} else
		if ( this._renderWidth !== null && this._renderHeight === null ) {
			this._root.style.width = (this._physicalWidth = ~~( this._renderWidth * this._scale )) + "px";
			this._root.style.height = (this._physicalHeight = ~~( this._renderWidth / aspectRatio * this._scale )) + "px";
		} else
		if ( this._renderWidth === null && this._renderHeight !== null ) {
			this._root.style.height = (this._physicalHeight = ~~(this._renderHeight * this._scale)) + "px";
			this._root.style.width = (this._physicalWidth = ~~(this._renderHeight * aspectRatio * this._scale)) + "px";
		} else {
			this._root.style.width = (this._physicalWidth = this._renderWidth) + "px";
			this._root.style.height = (this._physicalHeight = this._renderHeight) + "px";
		}
	}

	protected open() {
		if ( this._targetURL ) {
			window.open( this._targetURL, this._target || '_self' );
		}
	}

	protected close() {

		if (Frontend_Popup.instances.indexOf(this) > -1) {
			Frontend_Popup.instances.splice(
				Frontend_Popup.instances.indexOf(this), 1
			);
		}

		if ( this._root && this._root.parentNode ) {
			
			this._root.parentNode.removeChild(this._root);
			
			// set cookie
			var cookie: string = Frontend.storage.cookie.get('frpop') || '',
				i: number,
				cookies: string[] = cookie.split(','),
				len: number,
				found: boolean;

			if ( cookie ) {
				cookies.push(this._hash);
			} else {
				cookies[0] = this._hash;
			}

			Frontend.storage.cookie.set('frpop', cookies.join(','));

			if ( this._timer !== null ) {
				
				// setup timer to reset cookie.
				cookie = Frontend.storage.cookie.get('frpopt') || '';
				cookies = cookie.split(',');

				if ( cookie ) {
					found = false;
					for (i = 0, len = cookies.length; i < len; i++ ) {
						if ( cookies[i].substr( 0, this._hash.length + 1 ) == ( this._hash + ':' ) ) {
							cookies[i] = this._hash + ':' + ( parseInt( (Date.now() / 1000).toFixed(0) ) + this._timer );
							found = true;
							break;
						}
					}

					if ( !found ) {
						cookies.push(this._hash + ':' + ( parseInt( (Date.now() / 1000).toFixed(0) ) + this._timer ) );
					}

				} else {
					cookies[0] = this._hash + ':' + ( parseInt( (Date.now() / 1000).toFixed(0) ) + this._timer );
				}

				Frontend.storage.cookie.set('frpopt', cookies.join(','));

			}

			// setup cooldown
			if ( Frontend_Popup.coolDown > 0 ) {
				Frontend.storage.cookie.set('frpopc', String( (parseInt((Date.now() / 1000).toFixed(0)) + Frontend_Popup.coolDown) ) );
			}

			this._closed = true;
		}
	}

	/**
	 * Resets the timer from the cookie
	 */
	private resetTimer() {
		var cookie: string = Frontend.storage.cookie.get('frpopt') || '',
			i: number,
			cookies: string[] = cookie.split(','),
			len: number,
			found: boolean = false;

		if ( cookie ) {
			for (i = 0, len = cookies.length; i < len; i++ ) {
				if ( cookies[i].substr(0, this._hash.length + 1 ) == this._hash + ':' ) {
					found = true;
					cookies.splice(i, 1);
					break;
				}
			}
		}

		if ( found ) {
			if ( cookies.length ) {
				Frontend.storage.cookie.set('frpopt', cookies.join(','));
			} else {
				Frontend.storage.cookie.remove('frpopt');
			}

			this.reset();
		}

	}

	private isExpired(): boolean {
		var cookie: string = Frontend.storage.cookie.get('frpopt') || '',
			i: number,
			cookies: string[] = cookie.split(','),
			len: number,
			found: boolean = false,
			now: number = parseInt( ( Date.now() / 1000 ).toFixed(0) ),
			expireDate: number;

		if ( cookie ) {
			for (i = 0, len = cookies.length; i < len; i++) {
				if (cookies[i].substr(0, this._hash.length + 1) == this._hash + ':') {
					
					expireDate = parseInt( cookies[i].substr(this._hash.length + 1) );

					//console.log(now, expireDate, parseInt( cookies[i].substr(this._hash.length + 1) ) );

					if ( now > expireDate ) {
						return true;
					}
				}
			}
		}

		return false;
	}

	protected reset() {
		var cookie: string = Frontend.storage.cookie.get('frpop') || '',
			cookies: string[] = cookie.split(',');

		if ( cookies.indexOf( this._hash ) > -1 ) {
			cookies.splice(cookies.indexOf(this._hash), 1);
			Frontend.storage.cookie.set('frpop', cookies.join(','));
		}
	}

	public get width(): number {
		return this._renderWidth || null;
	}

	public set width( w: number ) {
		w = ~~w;
		
		if (w < 1 )
			w = null;
		
		if ( w === this._renderWidth ) {
			return;
		}

		this._renderWidth = w;
		this.scale();
	}

	public get height(): number {
		return this._renderHeight || null;
	}

	public set height( h: number ) {
		h = ~~h;
		
		if (h < 1)
			h = null;
		
		if ( h === this._renderHeight ) {
			return;
		}
		
		this._renderHeight = h;
		this.scale();
	}

	public get designedWidth(): number {
		return this._width;
	}

	public get designedHeight(): number {
		return this._height;
	}

	public get placement(): string {
		switch ( this._placement ) {
			case 'top-right':
			case 'bottom-left':
			case 'bottom-right':
				return this._placement;
				break;
			default:
				return 'top-left';
				break;
		}
	}

	public set placement( placement: string ) {
		switch ( placement ) {
			case 'top-left':
			case 'top-right':
			case 'bottom-left':
			case 'bottom-right':
				this._placement = placement;
				Utils_Dom.removeClasses(this._root, ['top-left', 'top-right', 'bottom-left', 'bottom-right']);
				Utils_Dom.addClass(this._root, this._placement);
				break;
		}
	}

	private fit( width: number, height: number ): boolean {
		return this._physicalWidth <= width - 10 &&
			this._physicalHeight <= height - 10;
	}

	private zoom( scale: number ) {
		this._scale = scale;
		this.scale();
	}

	public scaleToFitViewport() {

		var viewportWidth = ~~document.body.clientWidth,
			viewportHeight = ~~document.body.clientHeight,
			scale = 1,
			step = 0.001;

		if ( viewportWidth == 0 || viewportHeight == 0 ) {
			return;
		}

		this.zoom(scale);

		while ( !this.fit( viewportWidth, viewportHeight ) && scale > step ) {
			scale -= step;
			this.zoom(scale);
		}

	}

	public static get isCoolDown(): boolean {
		var coolDownCookie: string = Frontend.storage.cookie.get('frpopc'),
			now: number = parseInt((Date.now() / 1000).toFixed(0));
		
		if ( coolDownCookie ) {
			
			// has cookie set, but no cooldown
			if ( !Frontend_Popup.coolDown ) {
				// remove cookie
				Frontend.storage.cookie.remove('fropc');
				return false;
			}
			
			// has cookie set, cooldown passed
			if ( now - parseInt( coolDownCookie ) > 0 ) {
				Frontend.storage.cookie.remove('fropc');
				return false;
			}

			return true;
		} else {
			return false;
		}
	}

}

(function() {

	Frontend.on('load', function() {

		window.addEventListener('resize', function( e: Event ) {

			var i: number,
				len: number = Frontend_Popup.instances.length;

			for (i = 0; i < len; i++ ) {
				Frontend_Popup.instances[i].scaleToFitViewport();
			}

		});

	});

})();