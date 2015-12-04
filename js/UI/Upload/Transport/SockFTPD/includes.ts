enum ESockFTPDConnectionState {
	CLOSED,
	OPENED
}

interface ISockFTPDFileBase64 {
	name: string;
	type: string;
	size: number;
	bytes: Uint8Array;
}

enum ESockFTPDTransferType {
	UPLOAD,
	DOWNLOAD
}

interface ISockFTPDTransferDetails {
	type: ESockFTPDTransferType;
	id: number;
	name: string;
	size: number;
}

interface ISockFTPDProgressDetails {
	type: ESockFTPDTransferType;

	totalFilesLeft: number;
	totalBytesLeft: number;

	currentFile?: string;
	currentTransferSize?: number;
	currentTransferred?: number;
	currentProgress?: number;
}

interface ISockFTPDAuthDetails {
	ok: boolean;
	user: string;
	error?: string;
}

interface ISockFTPDUploadDetails {
	name: string;
	size: number;
	type: string;
	id: number;
	ok: boolean;
	url?: string;
	error?: string;
}

enum ESockFTPDFSItem {
	FILE,
	FOLDER
}

interface ISockFTPDFSEntry {

	name: string; // the name of the item
	type: ESockFTPDFSItem; // the type of the item
	mime: string; // mime-type of the item
	
	url?: string; // if the item has an url for accessing
	size?: number; // if the user has a size
	thumb?: string; // if the user has a thumbnail url

}