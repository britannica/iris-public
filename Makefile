.PHONY: all image package dist clean

all: package

image:
	docker build --tag amazonlinux:nodejs .

package: image
	docker run --rm --volume ${PWD}/src:/build amazonlinux:nodejs npm install --production

dist: package
	cd src && zip -FS -q -r ../dist/iris.zip *
	sls package -v

clean:
	rm -r lambda/node_modules
	docker rmi --force amazonlinux:nodejs