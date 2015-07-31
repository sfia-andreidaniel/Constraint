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

console.log('store2tests');
console.log( 'creating store...');
var store = new Store2('id');

console.log( 'setting a sorter on the store: ' );
store.sorter = [ { "name": "name", "type": "istring", "asc": false }, { "name": "lastName", "type": "string", "asc": true } ];

var data = [];
console.log( 'adding 100.000 objects...' );
console.time('adding 100.000');
store.lock(true);
for ( var i=0, len = 100000; i<len; i++ ) {
	store.insert({ "id": i + 1, "name": randomstring(), "lastName": randomstring() });
}
store.unlock(true);
console.timeEnd( 'adding 100.000' );
console.log( 'store length: ', store.length );

console.log( 'listing first 20 rows' );
console.groupCollapsed('listing');
for ( var i=0; i<20; i++ ) {
	console.log( i, store.itemAt(i).id, store.itemAt(i).get('name'), store.itemAt(i).get('lastName') )
}
console.groupEnd('listing');

try {
	store.insert({"id": 3});
	console.error( 'trying to violate the id constraint: FAILED (no error)' );
} catch (e) {
	console.log( 'trying to violate the id constraint: TEST PASSED: ', e );
}

try {
	store.lock(true);
	store.itemAt(0).set('name', 'Tooo' );
} catch (e) {
	console.log( 'trying to violate the write lock constraint: PASSED: ', e );
	store.unlock(true);
}

try {
	store.lock(false);
	store.itemAt(0).get('name');
	console.log( 'reading while the store is locked for read only: PASSED' );
	store.unlock( false );
} catch (e) {
	console.error( 'trying to read while the store is read only: FAILED: ', e );
}

var numchanges = 0;
function onstorechange() {
	console.log( 'change' );
	numchanges++;
}

store.on('change', onstorechange );
/*
console.log( 'inserting another 100.000 items while the store is not locked ( should be slower, because we\'re inserting with a sorter function on the store )...');

console.time( 'adding 100.000 in non-lock mode' );

for ( var i = 100001; i < 200000; i++ ) {
	store.insert({ "id": i, "name": randomstring(), "lastName": randomstring() });
}

console.timeEnd( 'adding 100.000 in non-lock mode' );

*/

//store.off( 'change', onstorechange );

console.log( 'done. Fired the "change" event for ' + numchanges + ' times.' );

console.log( 'listing first 20 rows' );
console.groupCollapsed('listing');
for ( var i=0; i<20; i++ ) {
	console.log( i, store.itemAt(i).id, store.itemAt(i).get('name'), store.itemAt(i).get('lastName') )
}
console.groupEnd('listing');

console.log( 'doing 10 random modifications, while the sorter is active @10ms delay between each modification' );

console.time('10 modifications...' );
var lastFailedindex = 0;

(new RSVP.Promise( function( resolve, reject ) {

	var numChanges = 0;

	function changeRandom() {

		lastFailedindex = ~~( Math.random() * store.length );

		store.itemAt( lastFailedindex ).set( 'name', randomstring() );
		numChanges++;
		if ( numChanges < 10 ) {
			setTimeout( changeRandom, 10 );
		} else { resolve( numchanges ) }
	}

	setTimeout( changeRandom, 10 );

} ) ).then( function( changes ) {

	console.log( 'done doing 10 random modifications. the change event has been fired ', changes, ' times' );
	console.timeEnd( '10 modifications...' );


} ).catch( function( err ) {
	console.log( 'failed doing 10 random modifications. @ index: ', lastFailedindex );
	console.timeEnd( '10 modifications...' );
} );