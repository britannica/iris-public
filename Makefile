.PHONY: all build start dist clean

IMAGE_NAME=iris:latest

all: package

build:
	docker build -t ${IMAGE_NAME} .

start:
	docker run --rm -it -v ${PWD}:/app -p 3000:3000 ${IMAGE_NAME}

dist: package
	cd src && zip -FS -q -r ../dist/iris.zip *
	sls package -v

clean:
	rm -r node_modules
	docker rmi --force ${IMAGE_NAME}