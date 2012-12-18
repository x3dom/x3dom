default: newstyle

newstyle:
	cd .. && python manage.py --build
	cp ../dist/x3dom-full.js ../example/x3dom.js
	cp ../dist/x3dom.css ../example/x3dom.css

clean:
	@rm -rf ../dist/x3dom*.js
