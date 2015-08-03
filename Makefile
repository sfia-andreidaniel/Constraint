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
	rm -rf ./resources
	mogrify -format png -background none vendor/self/*.svg
	mogrify -format png -background none vendor/gnome/*.svg
	constraint --src:resources.ui --http-include-path:resources

demo:: build
	constraint --src:demo.ui --http-include-path:demo --make

dts_install:
	npm install -g dts-generator

dts:
	dts-generator --name Constraint --baseDir . --out Constraint.d.ts js/main-self.ts

doc_install:
	npm install -g typedoc

doc:
	rm -rf docs
	typedoc --name Constraint  --theme default --readme README.md --target es5 --mode file --out ./docs ./js/main.ts

clean::
	rm -f *.js js/*.js demo/*.js demo/*.res css/main.css Constraint.d.ts
