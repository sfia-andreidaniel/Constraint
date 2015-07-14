SHELL := /bin/bash

build:: clean
	tsc js/main.ts --target es5 --out main.js
	tsc js/compiler.ts --target es5 --out compiler.js
	tsc js/postcompiler.ts --target es5 --out postcompiler.js
	node ./postcompiler.js main.js
	cp css/constraint.css css/main.css
	node ./postcompiler.js css/main.css
	rm -f ./postcompiler.js

clean::
	rm -f *.js js/*.js demo/*.js css/main.css
