.PHONY: all image package dist clean

DOCKER_IMAGE=iris:build

all: package

image:
	docker build --tag ${DOCKER_IMAGE} .

package: image
	docker run --rm --volume ${PWD}/src:/build ${DOCKER_IMAGE} npm install --production

dist: clean_modules package
	cd src && zip -FS -q -r ../dist/iris.zip *
	sls package -v

clean_modules:
	rm -rf src/node_modules

clean: clean_modules
	docker rmi --force ${DOCKER_IMAGE}