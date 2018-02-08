.PHONY: all image package dist clean

IMAGE_NAME=amazonlinux:iris

all: package

build:
	docker build --tag ${IMAGE_NAME} .

start:
	docker run --rm -v ${PWD}:/app -p 3000:3000 ${IMAGE_NAME}

dist: package
	cd src && zip -FS -q -r ../dist/iris.zip *
	sls package -v

clean:
	rm -r node_modules
	docker rmi --force ${IMAGE_NAME}