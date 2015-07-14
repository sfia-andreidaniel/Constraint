SHELL := /bin/bash

build:: clean
	tsc js/main.ts --target es5 --out main.js
	tsc js/compiler.ts --target es5 --out compiler.js
	tsc js/postcompiler.ts --target es5 --out postcompiler.js
	node ./postcompiler.js main.js
	rm -f ./postcompiler.js

clean::
	rm -f main.js js/*.js