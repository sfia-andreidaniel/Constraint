class UI_Upload_Transport extends UI_Event {

	protected _type: EFileUploadTransportType = null;
	protected _url: string;

	constructor( url: string ) {
		super();
		this._url = url;
	}

	public get type(): EFileUploadTransportType {
		return this._type;
	}

	public static create( transportURL: string ): UI_Upload_Transport {
		
		transportURL = String(transportURL || '') || null;

		if ( !transportURL ) {
			throw new Error('Invalid argument. transportURL must be a non-empty string');
		}

		var path: IUrlStruc = Utils.path.parseURL(transportURL);

		if ( !path ) {
			throw new Error('Failed to parse transport URL: ' + JSON.stringify(transportURL));
		}

		switch ( path.protocol ) {
			case 'sockftpd':
				return new UI_Upload_Transport_SockFTPD(transportURL);
				break;
			default:
				throw new Error('Unknown transport scheme "' + path.protocol + '"');
				break;
		}

	}

	public toString(): string {
		return 'transport://';
	}

}