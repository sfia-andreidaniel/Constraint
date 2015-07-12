SHELL := /bin/bash

build:: clean
	tsc js/main.ts --target es5 --out main.js
	tsc js/compiler.ts --target es5 --out compiler.js

clean::
	rm -f main.js js/*.js