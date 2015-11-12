SHELL := /bin/bash

build:: clean
	tsc main.ts --target es5 --out main.js
	tsc "/srv/www/websites/adds.admin.rcs-rds.ro/htdocs/vendor/Constraint/js/postcompiler.ts" --target es5 --out postcompiler.js
	node postcompiler.js main.js "/srv/www/websites/adds.admin.rcs-rds.ro/htdocs/vendor/Constraint/css/constraint.ui" --nostub
	rm postcompiler.js

clean::
	rm -f main.js js/*.js