console.log( 'store tree tests' );

var stringsbase = [
	'abigail', 'Absolute', 'AnOTher',
	'bear', 'Beer', 'Biggyu',
	'cArol', 'carol', 'Console', 'clipBoard',
	'dan', 'DAnemarca', 'Diacrytics',
	'eiffel', 'Epiphany', 'elogy',
	'fOruM', 'Free', 'Freeze',
	'garlic', 'Green', 'GOD', 'GAscone',
	'hey', 'HY', 'Haleluyah',
	'i', 'I', 'it', 'IT', 'India',
	'John', 'jigga', 'Jelly', 'Jelly bean',
	'Kernel', 'kind', 'kerosen',
	'lilly', 'Lucy', 'like', 'lovE',
	'mom', 'Mother', 'Mike', 'moon',
	'Nepfew', 'Ner0', 'nero', 'noun',
	'Opera', 'old', 'Once upon',
	'parrot', 'PArrot', 'Pascal', 'Picassa', 'poo',
	'quintilla', 'quilt',
	'rex', 'Robbin', 'RammSTEIN',
	'sex', 'SEXy', 'Soar', 'Song',
	'Tel', 'tel', 'texT', 'text',
	'undo', 'Undone', 'Unification',
	'volume', 'Vol', 'vibration', 'vibe',
	'will', 'Will Smith',
	'Xenia', 'xenophobic',
	'Yolanda', 'Y\'alll',
	'zoo', 'Zulu', 'zIMBAbwe',
	'0asd', '323aasdasd', '123123', '@#123123'
], numstrings = stringsbase.length;

function randomstring() {
	return stringsbase[ ~~( Math.random() * numstrings ) ];
}

console.log( 'creating a store tree' );
var tree = new Store2_Tree( 'id', 'parent', 'isLeaf' );

tree.sorter = [ { "name": "name", "type": "istring", "asc": true } ];

tree.on( 'change', function() {
	console.log( 'changed' );
} );
tree.on( 'death', function( nodeId ) {
	console.log( 'node #' + nodeId + ' died.' );
} );

console.time('inserting');

console.log( 'inserting 100.000 nodes in the store' );
var item;

for ( var i=0; i<100; i++ ) {
	item = { "id": i + 1, "parent": ~~(Math.random() * i ) || null, "name": randomstring() };
	
	if ( item.parent && tree.getElementById( item.parent ).isLeaf ) {
		item.parent = null;
	}

	tree.insert( item );
	//console.log( JSON.stringify( item, undefined, 4 ) );
}

console.timeEnd( 'inserting' );

function repeat( s, times ) {
	var result = '';
	for ( var i=0; i<times; i++ ) {
		result += s;
	}
	return result;
}

function dump( node ) {
	console.log( node.depth, repeat( '    ', node.depth )  + node.id  + ' => ' + node.get('name') );
	if ( node.length ) {
		for ( var i=0, len = Math.min( node.length, 10 ); i<len; i++ ) {
			dump( node.childNodes[i] );
		}
		if ( i < node.length ) {
			console.log( repeat( '    ', node.depth + 1 ) + ' + ' + ( node.length - i ) + ' children' );
		}
	}
}

function debug() {
	for ( var i=0, len = Math.min( 10, tree.length ); i<len; i++ ) {
		dump( tree.itemAt(i) );
	}
	if ( i < tree.length ) {
		console.log( '    ', ' + ' + (tree.length - 1) + ' children' );
	}
}

debug();