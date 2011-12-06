default: newstyle

newstyle:
	cp ../dist/x3dom.js x3dom.bak
	cd ..; python manage.py --build; python manage.py --docs; cd -
	ln -s ../dist/x3dom.js x3dom.js
