/// <reference path="./SockFTPD/includes.ts" />

class UI_Upload_Transport_SockFTPD extends UI_Upload_Transport {

	protected static $id: number = 0;

	protected _host              : string = '127.0.0.1';
	protected _port              : number = 8181;
	protected _user              : string = 'anonymous';
	protected _password          : string = '';

	protected _autoAuth          : boolean = true;
	protected _reconnectTimeout  : number  = 60;
	protected _autoConnect       : boolean = true;
	protected _autoDisconnect    : boolean = true;

	public    authenticated: boolean = false;
	private   socket: WebSocket = null;
	public 	  state: ESockFTPDConnectionState = ESockFTPDConnectionState.CLOSED;
	private   lastState: ESockFTPDConnectionState = null;
	private   outQueue: any[] = [];
	private   cmdQueue: UI_Upload_Transport_SockFTPD_Command[] = [];
	private   checkDrain: boolean = false;
	private   packetSchedulerThreadId: number = null;
	private   connectionAwarenessThreadId: number = null;
	private   offlineAwareSeconds: number = 0;
	private   neverAttemptedToConnect: boolean = true;
	private   closedByMe: boolean = false;

	public toString(): string {
		return 'sockftpd://' + this._host + ':' + this._port + '/?autoAuth=' + ~~this._autoAuth + '&reconnectTimeout=' + ~~this._reconnectTimeout + '&autoConnect=' + ~~this._autoConnect + '&autoDisconnect=' + ~~this._autoDisconnect;
	}

	constructor( url: string ) {
		super(url);
		this._type = EFileUploadTransportType.SOCKFTPD;
		this._initTransport_();

		this.authenticated = false;

		(function(me: UI_Upload_Transport_SockFTPD) {
			
			me.on('drain', function() {
				var chunk: any;

				if (me.outQueue.length && me.state == ESockFTPDConnectionState.OPENED) {

					chunk = me.outQueue.shift();

					try {

						me.socket.send(chunk);


						if (me.outQueue.length == 0 && me.socket.bufferedAmount == 0) {
							me.ondrain();
						}


					} catch (E) {
						me.state = ESockFTPDConnectionState.CLOSED;
						me.fire('state-changed');
					}
				}
			});

			me.on('state-changed', function() {

				me.onstatechanged();

			});

		})(this);
	}

	public get who(): string {
		return this._user || '';
	}

	public connect(): UI_Upload_Transport_SockFTPD {

		this.neverAttemptedToConnect = false;
		this.offlineAwareSeconds = 0;
		this.closedByMe = false;

		if (this._reconnectTimeout > 0) {
			this.connectionAwareness = true;
		}

		if (this.socket) {

			// won't reconnect if we're allready connected
			if (this.state == ESockFTPDConnectionState.OPENED && this.socket.readyState == WebSocket.OPEN) {
				return this;
			}

			// won't connect if we're allready attempting to connect
			if (this.socket.readyState == (WebSocket.CONNECTING || 0)) {
				return this;
			}

			delete this.socket;

		}

		this.socket = new WebSocket('ws://' + this._host + ':' + this._port + '/sockftp', 'sockftp');

		(function(me) {

			me.socket.addEventListener('open', function(evt) {
				if (me.state != ESockFTPDConnectionState.OPENED) {
					me.state = ESockFTPDConnectionState.OPENED;
					me.fire('open');
					me.fire('state-changed');
				}
			}, false);

			me.socket.addEventListener('close', function(evt) {
				if (me.state == ESockFTPDConnectionState.OPENED) {
					me.state = ESockFTPDConnectionState.CLOSED;
					me.fire('close');
					me.fire('state-changed');
				}
			}, false);

			me.socket.addEventListener('error', function(evt) {
				if (me.state == ESockFTPDConnectionState.OPENED) {
					me.state = ESockFTPDConnectionState.CLOSED;
					me.fire('error');
					me.fire('state-changed');
				}
			}, false);

			me.socket.addEventListener('message', function(evt) {
				me.dispatch(evt);
			}, false);

		})(this);

		return this;

	}

	public disconnect(): UI_Upload_Transport_SockFTPD {
		this.closedByMe = true;

		if (this.socket) {
			if (this.socket.readyState == WebSocket.CLOSING ) {
				return this;
			}
			if (this.socket.readyState == WebSocket.CLOSED ) {
				return this;
			}
			this.socket.close();
		}

		return this;
	}

	/** Send raw data. To not be used directly by the programmer.
	 *  
	 *  Trows E_INVALID_STATE exception if connection is not available in the
	 *  moment of the sending.
	 */
	public send(data: any) {
		if (this.state == ESockFTPDConnectionState.OPENED) {

			if (this.outQueue.length == 0 && this.socket.bufferedAmount == 0) {
				this.socket.send(data);
			} else {
				this.outQueue.push(data);
			}

			this.checkDrain = this.packetScheduler = true;

		} else {
			throw new Error("E_INVALID_STATE");
		}
	}

	/**
	 * runs the next command in the batch
	 */
	public next() {

		this.cmdQueue.shift();

		if (this.state == ESockFTPDConnectionState.OPENED) {

			if (this.cmdQueue.length) {
				this.cmdQueue[0].init();
			} else {

				// if the queue becomes empty, and settings.autoDisconnect IS TRUE, we disconnect gracefully
				if (this._autoDisconnect) {
					this.disconnect();
					this.neverAttemptedToConnect = true;
				}
			}
		}
	}

	private addCommand(command: UI_Upload_Transport_SockFTPD_Command, atFirst: Boolean = false) {

		if (!atFirst) {
			this.cmdQueue.push(command);
		} else {
			this.cmdQueue.unshift(command);
		}

		if (this._autoConnect && this.neverAttemptedToConnect) {
			this.connect();
		}

		if (this.state == ESockFTPDConnectionState.OPENED) {
			if (this.cmdQueue.length == 1 || (this.cmdQueue.length && !this.cmdQueue[0].isRunning)) {
				this.cmdQueue[0].init();
			}
		}

	}

	get packetScheduler(): boolean {
		return this.packetSchedulerThreadId != null;
	}

	set packetScheduler(on: boolean) {
		on = !!on;
		if (on != this.packetScheduler) {
			if (on) {
				(function(me) {
					me.packetSchedulerThreadId = window.setInterval(function() {
						me.packetSchedulerThread()
					}, 30);
				})(this);
			} else {
				window.clearInterval(this.packetSchedulerThreadId);
				this.packetSchedulerThreadId = null;
			}
		}
	}

	private packetSchedulerThread() {

		if (this.checkDrain && this.state == ESockFTPDConnectionState.OPENED && this.packetSchedulerThreadId !== null) {

			if (this.outQueue.length == 0 && this.socket.bufferedAmount == 0) {

				this.checkDrain = false;
				this.packetScheduler = false;
				this.ondrain();

			} else
				if (this.outQueue.length && this.socket.bufferedAmount == 0) {
					this.fire('drain');
				}
		}
	}

	get connectionAwareness(): boolean {
		return this.connectionAwarenessThreadId != null;
	}

	set connectionAwareness(on: boolean) {

		on = !!on;

		if (on != this.connectionAwareness) {

			this.offlineAwareSeconds = 0;

			if (on) {
				(function(me) {
					me.connectionAwarenessThreadId = window.setInterval(function() {
						me.connectionAwarenessThread();
					}, 1000);
				})(this);
			} else {
				window.clearInterval(this.connectionAwarenessThreadId);
				this.connectionAwarenessThreadId = null;
			}
		}
	}

	private connectionAwarenessThread() {

		if (this._reconnectTimeout > 0 && this.state == ESockFTPDConnectionState.CLOSED && this.connectionAwarenessThreadId !== null) {

			this.offlineAwareSeconds++;

			if (this.offlineAwareSeconds > this._reconnectTimeout) {

				this.connect();

			} else {

				this.log('reconnecting in: ' + (this._reconnectTimeout - this.offlineAwareSeconds) + ' seconds');

			}

		} else {

			this.offlineAwareSeconds = 0;

		}

	}

	public issueCommandId(): number {
		return ++UI_Upload_Transport_SockFTPD.$id;
	}

	public log(...args: any[]) {
		args.unshift('log');
		this.fire('log', args);
	}

	public error(...args: any[]) {
		args.unshift('error');
		this.fire('log', args);
	}

	public warn(...args: any[]) {
		args.unshift('warn');
		this.fire('log', args);
	}

	// handles a message from the server.
	public dispatch(evt: Event) {
		var data: any,
			i: number,
			len: number;

		if (evt) {

			switch (evt.type) {

				case 'message':

					try {

						data = JSON.parse(evt['data']);

					} catch (e) {

						data = null;

					}

					if (data == null) {
						// Failed to parse packet from server!
						this.socket.close();
						return;

					}

					if (data.id) {
						
						// route the packet to the command with id data.id
						for (i = 0, len = this.cmdQueue.length; i < len; i++) {
							if (this.cmdQueue[i].commandID == data.id) {
								this.cmdQueue[i].onMessage(data);
								break;
							}
						}

						// command is not found, ignore packet

					} else {

						if (this.cmdQueue[0]) {
							this.cmdQueue[0].onMessage(data);
						}

					}

					break;

				default:
					// binary message? from server? nope! we don't accept yet binary messages from server.
					this.socket.close();
					this.warn('Warning: Got binary message from server. Not implemented at this point');
					break;
			}

		}

	}

	public ls(
		path: string,
		success: (files: ISockFTPDFSEntry[]) => void = null,
		error: (reason: string) => void = null
	): void {

		this.addCommand(new UI_Upload_Transport_SockFTPD_Command_Ls(
			this,
			path,
			success,
			error
		));

	}

	public upload( f: File ) {
		if ( f ) {
			this.put(f);
		}
	}

	public put(
		f: File,
		success: () => void = null,
		error: (reason: string) => void = null,
		progress: (percent: number, name: string) => void = null

	): ISockFTPDUploadDetails {

		var command: UI_Upload_Transport_SockFTPD_Command_Put,
			details: ISockFTPDTransferDetails;

		(function(me) {

			command = new UI_Upload_Transport_SockFTPD_Command_Put(
				me,
				f,
				success || function() {
					// note that "this" In the context of the callback is the command itself.
					me.log('PUT "' + this.fname + '": OK.');
					me.fire('upload', f );
				},
				error || function(reason: string) {
					// note that "this" in the context of the callback is the command itself.
					me.error('PUT "' + this.fname + '": ERROR: ' + (reason || 'Unknown upload error'));
					me.fire('error', f, reason || 'Unknown upload error');
				},
				progress || function(percent: number, name: string) {
					// note that "this" in the context of the callback is the command itself
					me.log('PUT "' + this.fname + '": ' + percent + '%');
					me.fire('progress', f, percent );
				}
			);

			me.addCommand(
				command
			);

		})(this);

		details = {
			"id": command.commandID,
			"type": ESockFTPDTransferType.UPLOAD,
			"name": command.fname,
			"size": command.length
		};

		// also fire a transferinit event
		try {

			this.fire('transferinit', details);

		} catch (E) {

		}

		return {
			"name": command.fname,
			"size": command.length,
			"type": command.type,
			"id": command.commandID,
			"ok": true
		};

	}

	public putBase64Uri(
		uri: string,
		success: () => void = null,
		error: (reason: string) => void = null,
		progress: (percent: number, name: string) => void = null

	): ISockFTPDUploadDetails {

		var matches: any,
			file: ISockFTPDFileBase64 = {
				"name": "",
				"size": 0,
				"type": "application/octet-stream",
				"bytes": null
			},
			raw: any,
			rawLength: number = 0,
			i: number = 0;

		if (!(matches = /^data\:(.*);base64,/.exec(uri))) {
			throw new Error("PUT.base64: invalid url. Ignoring.");
		}

		file.type = matches[1];
		raw = atob(uri.split(';base64,')[1] || '');
		rawLength = raw.length;
		file.bytes = new Uint8Array(new ArrayBuffer(rawLength));
		file.size = rawLength;

		for (i = 0; i < rawLength; i++) {
			file.bytes[i] = raw.charCodeAt(i);
		}

		switch (true) {
			case /^image\/png$/i.test(file.type):
				file.name = 'picture.png';
				break;
			case /^image\/(jpg|jpeg)$/i.test(file.type):
				file.name = 'picture.jpg';
				break;
			case /^image\/gif$/i.test(file.type):
				file.name = 'image.gif';
				break;
			default:
				file.name = ''; // will show warning on putbase64.ts : 57
				break;
		}


		var command: UI_Upload_Transport_SockFTPD_Command_PutBase64,
			details: ISockFTPDTransferDetails;

		(function(me) {

			command = new UI_Upload_Transport_SockFTPD_Command_PutBase64(
				me,
				file,
				success || function() {
					// note that "this" In the context of the callback is the command itself.
					me.log('PUT "' + this.fname + '": OK.');
				},
				error || function(reason: string) {
					// note that "this" in the context of the callback is the command itself.
					me.error('PUT "' + this.fname + '": ERROR: ' + (reason || 'Unknown upload error'));
				},
				progress || function(percent: number, name: string) {
					// note that "this" in the context of the callback is the command itself
					me.log('PUT "' + this.fname + '": ' + percent + '%');
				}
			);

			me.addCommand(
				command
			);

		})(this);

		details = {
			"id": command.commandID,
			"type": ESockFTPDTransferType.UPLOAD,
			"name": command.fname,
			"size": command.length
		};

		// also fire a transferinit event
		try {

			this.fire('transferinit', details);

		} catch (E) {

		}

		return {
			"name": command.fname,
			"size": command.length,
			"type": command.type,
			"id": command.commandID,
			"ok": true
		};

	}

	private onHTMLPaste(element: any /* HTMLElement */): void {

		var i = 0,
			len = 0,
			items = [],
			src = '';

		for (i = 0, items = element.querySelectorAll('img') || [], len = items.length; i < len; i++) {

			src = items[i].src;

			if (/^data\:image\//.test(src)) {
				this.putBase64Uri(src);
			}

		}

		element.innerHTML = '';

	}

	private onNativePaste(evt: any /* Clipboard generated Event */) {

		var files, i, len, f, clipData, syFile;

		clipData = evt.clipboardData || evt.dataTransfer || window['clipboardData'] || null;

		syFile = false;

		if (clipData && clipData.files && clipData.files.length) {

			for (i = 0, files = clipData.files, len = files.length; i < len; i++) {
				this.put(files[i]);
				syFile = true;
			}

		}

		if (clipData && clipData.items && clipData.items.length && !syFile) {

			for (i = 0, files = clipData.items, len = files.length; i < len; i++) {
				if (files[i].kind && files[i].kind == 'file') {
					f = files[i].getAsFile();
					this.put(f);
				}
			}

		}

	}

	private rememberBinding(bindings, src, name, callback, phase) {

		bindings.records.push({
			"to": src || null,
			"cb": callback,
			"name": name,
			"phase": phase || false
		});

		return callback;

	}

	// binds the uploader to a div, textarea, input[type=text] or a div, so that
	// any time the file changes, or a paste event occurs, or a drag'n drop occurs,
	// the file is uploaded to the server
	public bindTo(item): UI_Upload_Transport_SockFTPD {

		if (!item) {
			return this;
		}

		var isPastableNative = (item.nodeName.toLowerCase() == 'input' && item.type == 'text') || (item.nodeName.toLowerCase() == 'textarea'),
			UA_Type = ( function(){
				
				if (Browser_Detector.meetsRequirements('* * * chrome *') == '')
					return 'webkit';
				
				if (Browser_Detector.meetsRequirements('* * * opera *' ) == '' )
					return 'o';
				
				if (Browser_Detector.meetsRequirements('* * * msie *' ) == '' )
					return 'ms';
				
				if (Browser_Detector.meetsRequirements('* * * edge *') == '')
					return 'ms';
				
				if (Browser_Detector.meetsRequirements('* * * firefox *') == '')
					return 'moz';
				
				return 'unknown';


			})(),
			target = null,

			bindings = {
				"target": target,
				"records": []
			},

			self = this;



		item.tabIndex = 0;

		if (item.nodeName.toLowerCase() == 'input' && item.type.toLowerCase() == 'file') {

			item.addEventListener('focus', this.rememberBinding(bindings, null, 'focus', function() {
				item.setAttribute('dragover', '');
			}, true), true);

			item.addEventListener('blur', this.rememberBinding(bindings, null, 'blur', function() {
				item.removeAttribute('dragover');
			}, true), true);

			item.addEventListener('change', this.rememberBinding(bindings, null, 'change', function(evt) {
				for (var i = 0, files = item.files || [], len = files.length; i < len; i++) {
					self.put(files[i]);
				}
			}, true), true);

		} else {

			if (!isPastableNative) {

				if (UA_Type != 'webkit' && UA_Type != 'o') {
					// on webkit the "paste" event is triggered even if the item is not contenteditable.

					try {

						if (!item.appendChild) {
							throw "E_NOT_APPENDABLE";
						}

						target = document.createElement('div');
						target.className = 'clipboard-trap';
						target.contentEditable = true;

						target.style.cssText = 'opacity: 0; -webkit-opacity: 0;	-moz-opacity: 0; -ms-opacity: 0; -o-opacity: 0;	left: 0px; top: 0px; right: 0px; bottom: 0px; position: absolute; z-index: -1; overflow: hidden;';

						bindings.target = target;

						item.style.position = 'relative';
						item.appendChild(target);

					} catch (E) {
						target = null;
					}

				}


				if (target) {

					if (UA_Type == 'moz' || UA_Type == 'ms') {

						target.addEventListener('paste', this.rememberBinding(bindings, 'target', 'paste', function(evt) {
							if (UA_Type == 'moz')
								setTimeout(function() { self.onHTMLPaste(target); }, 100);
							else {
								evt.preventDefault();
								evt.stopPropagation();
								self.onNativePaste(evt);
							}
						}, true), true);

						item.addEventListener('keydown', this.rememberBinding(bindings, null, 'keydown', function(evt) {
							if (evt.ctrlKey && evt.keyCode == 86) {
								target.focus();
							} else {
								if (document.activeElement != item)
									item.focus();
							}
						}, true), true);

					} else {

						item.addEventListener('paste', this.rememberBinding(bindings, null, 'paste', function(evt) {
							evt.preventDefault();
							evt.stopPropagation();
							self.onNativePaste(evt);
						}, true), true);

					}

					target.addEventListener('focus', this.rememberBinding(bindings, 'target', 'focus', function() {
						item.setAttribute('dragover', '');
					}, true), true);

					target.addEventListener('blur', this.rememberBinding(bindings, 'target', 'blur', function() {
						item.removeAttribute('dragover');
					}, true), true);


				} else {

					item.addEventListener('paste', this.rememberBinding(bindings, null, 'paste', function(evt) {
						evt.preventDefault();
						evt.stopPropagation();
						self.onNativePaste(evt);
					}, true), true);

				}

			}

			item.addEventListener('focus', this.rememberBinding(bindings, null, 'focus', function() {
				item.setAttribute('dragover', '');
			}, true), true);

			item.addEventListener('blur', this.rememberBinding(bindings, null, 'blur', function() {
				item.removeAttribute('dragover');
			}, true), true);

			item.addEventListener('dragenter', this.rememberBinding(bindings, null, 'dragenter', function(evt) {
				item.setAttribute('dragover', '');
				evt.preventDefault();
			}, true), true);

			item.addEventListener('dragover', this.rememberBinding(bindings, null, 'dragover', function(evt) {
				item.setAttribute('dragover', '');
				evt.preventDefault();
			}, true), true);

			item.addEventListener('dragleave', this.rememberBinding(bindings, null, 'dragleave', function(evt) {
				item.removeAttribute('dragover');
				evt.preventDefault();
			}, true), true);

			item.addEventListener('drop', this.rememberBinding(bindings, null, 'drop', function(evt) {
				evt.preventDefault();
				evt.stopPropagation();
				item.removeAttribute('dragover');
				self.onNativePaste(evt);
			}, true), true);

		}

		item.bindings = bindings;

		return this;

	}

	public unbindFrom(element: any) {

		if (element && element.bindings) {

			element.removeAttribute('dragover');

			if (element.bindings.records) {

				for (var i = 0, len = element.bindings.records.length; i < len; i++) {

					(element.bindings.records[i].to == 'target'
						? element.bindings.target
						: element
					).removeEventListener(
						element.bindings.records[i].name,
						element.bindings.records[i].cb,
						element.bindings.records[i].phase
						);

					element.bindings.records[i] = null;

				}

				delete element.bindings.records;


			}

			if (element.bindings.target) {
				if (element.bindings.target.parentNode) {
					element.bindings.target.parentNode.removeChild(element.bindings.target);
				}
				element.bindings.target = null;
				delete element.bindings.target;
			}

			delete element.bindings;
		}

	}

	public login(user: string, password: string, success: () => void, error: (reason: string) => void) {

		this._user = user || 'anonymous';
		this._password = password || '';

		this.addCommand(new UI_Upload_Transport_SockFTPD_Command_Login(this, this._user, this._password, success, error), true);

	}

	// called each time we don't have data in the send buffer
	protected ondrain() {
		
		// forward the drain event to the current running command if any.
		// this is to ensure a smooth sending, but without interruptions in the main app thread

		var i: number,
			len: number;

		for (i = 0, len = this.cmdQueue.length; i < len; i++) {
			if (this.cmdQueue[i].isRunning) {
				this.cmdQueue[i].ondrain();
			}
		}

	}

	protected onstatechanged() {

		if (this.lastState == this.state)
			return;

		this.lastState = this.state;

		this.authenticated = false;

		if (this.state == ESockFTPDConnectionState.OPENED) {

			if (this._autoAuth && this._user) {

				// send a login command
				(function(me: UI_Upload_Transport_SockFTPD) {

					me.login(me._user, me._password || '', function() {

						me.authenticated = true;

						me.log('Authentication OK');

					}, function(reason: string) {

						me.state = ESockFTPDConnectionState.CLOSED;

						me.error('Authentication FAILED: ' + (reason || 'Unknown reason'));

						me.onstatechanged();

					});

				})(this);

			}

			this.warn("Client[" + this._host + ":" + this._port + "] -> UP");

			this.fire('connect');

			this.connectionAwareness = false;

		} else {

			// When the client GETS DOWN ONLY:

			this.packetScheduler = false;

			// kill all active commands
			for (var i = 0, len = this.cmdQueue.length; i < len; i++) {
				// send the kill signal
				this.cmdQueue[i].kill();
			}

			while (this.cmdQueue.length > 0) {
				this.cmdQueue.shift();
			}

			// close the socket if not closed

			if (this.socket.readyState == 0 || this.socket.readyState == 1) {
				this.warn('Closing socket');
				this.socket.close();
			}

			this.warn("Client[" + this._host + ":" + this._port + "] -> DOWN");

			this.fire('disconnect');

			if (!this.closedByMe) {
				this.connectionAwareness = true;
			}

		}

	}

	public getProgressDetails(type: ESockFTPDTransferType): ISockFTPDProgressDetails {

		var i: number,
			len: number,
			result: ISockFTPDProgressDetails = {
				"type": type,
				"totalFilesLeft": 0,
				"totalBytesLeft": 0
			};

		for (i = 0, len = this.cmdQueue.length; i < len; i++) {

			if (this.cmdQueue[i].transferType == type) {


				switch (type) {


					case ESockFTPDTransferType.UPLOAD:

						result.totalFilesLeft++;
						result.totalBytesLeft += ((<UI_Upload_Transport_SockFTPD_Command_Put>this.cmdQueue[i]).length - (<UI_Upload_Transport_SockFTPD_Command_Put>this.cmdQueue[i]).sent);

						if ((<UI_Upload_Transport_SockFTPD_Command_Put>this.cmdQueue[i]).isRunning) {

							result.currentFile = (<UI_Upload_Transport_SockFTPD_Command_Put>this.cmdQueue[i]).fname;
							result.currentTransferSize = (<UI_Upload_Transport_SockFTPD_Command_Put>this.cmdQueue[i]).length;
							result.currentTransferred = (<UI_Upload_Transport_SockFTPD_Command_Put>this.cmdQueue[i]).sent;
							result.currentProgress = (<UI_Upload_Transport_SockFTPD_Command_Put>this.cmdQueue[i]).percent;

						}

						break;

					case ESockFTPDTransferType.DOWNLOAD:
						break;

				}

			}

		}

		return result;

	} 

	public _initTransport_() {
		var info: IUrlStruc = Utils.path.parseURL(this._url);

		if ( !info ) {
			throw new Error('Bad sockFTPD transport URL ' + JSON.stringify( this._url ) );
		}

		if ( info.protocol != 'sockftpd' ) {
			throw new Error('Bad sockFTPD transport scheme. Required "sockftpd"');
		}

		if ( info.host ) {
			this._host = info.host;
		}

		if ( info.port ) {
			this._port = info.port;
		}

		if ( info.user ) {
			this._user = info.user;
		}

		if ( info.password ) {
			this._password = info.password;
		}

		var queryArg: string;

		if ( info.query ) {
			for ( queryArg in info.query ) {
				if ( info.query.hasOwnProperty( queryArg ) ) {
					
					switch ( queryArg ) {
						case 'autoAuth':
							this._autoAuth = !!~~info.query[queryArg];
							break;

						case 'reconnectTimeout':
							this._reconnectTimeout = ~~info.query[queryArg];
							break;

						case 'autoConnect':
							this._autoConnect = !!~~info.query[queryArg];
							break;

						case 'autoDisconnect':
							this._autoDisconnect = !!~~info.query[queryArg];
							break;

						default:
							throw new Error('Bad SockFTPD transport query argument: ' + queryArg);
							break;
					}
				}
			}
		}
	}
}