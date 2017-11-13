.PHONY: all image package dist clean

all: package

image:
	docker build --tag amazonlinux:nodejs .

package: image
	docker run --rm --volume ${PWD}/lambda:/build amazonlinux:nodejs npm install --production

dist: package
	zip -FS -q -r dist/iris.zip lambda
	serverless package

clean:
	rm -r lambda/node_modules
	docker rmi --force amazonlinux:nodejs