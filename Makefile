SHELL := /bin/bash

build:: clean
	tsc js/main.ts --target es5 --out main.js
	tsc js/parser.ts --target es5 --out constraint.js

clean::
	rm -f main.js js/*.js