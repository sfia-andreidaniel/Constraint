SHELL := /bin/bash

build:: clean
	tsc main.ts --target es5 --out main.js
	tsc "C:\\inetpub\\wwwroot\\Constraint\\js\\postcompiler.ts" --target es5 --out postcompiler.js
	node postcompiler.js main.js "C:\\inetpub\\wwwroot\\Constraint\\css\\constraint.ui" --nostub
	rm postcompiler.js

clean::
	rm -f main.js js/*.js