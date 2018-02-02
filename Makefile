.PHONY: all image package dist clean

all: package

image:
	docker build --tag amazonlinux:nodejs .

package: image
	docker run --rm --volume ${PWD}/src:/build amazonlinux:nodejs npm install --production

dist: clean_modules package
	cd src && zip -FS -q -r ../dist/iris.zip *
	sls package -v

clean_modules:
	rm -r src/node_modules

clean: clean_modules
	docker rmi --force amazonlinux:nodejs