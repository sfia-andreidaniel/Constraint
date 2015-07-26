SHELL := /bin/bash

build:: clean
	tsc js/main.ts --target es5 --out main.js
	tsc js/compiler.ts --target es5 --out compiler.js
	tsc js/postcompiler.ts --target es5 --out postcompiler.js
	node ./postcompiler.js main.js
	cp css/constraint.css css/main.css
	node ./postcompiler.js css/main.css
	rm -f ./postcompiler.js

resources::
	constraint --src:resources.ui --http-include-path:resources --make

demo:: build
	constraint --src:demo.ui --http-include-path:demo --make

clean::
	rm -f *.js js/*.js demo/*.js demo/*.res css/main.css
