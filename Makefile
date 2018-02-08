.PHONY: all build start dist clean

IMAGE_NAME=iris:latest

all: package

build:
	docker build -t ${IMAGE_NAME} .

dist:
	docker run --rm -it -v ${PWD}:/src ${IMAGE_NAME} \
	    zip -FS -q -r dist/iris.zip *
	sls package -v

clean:
	#rm -r node_modules
	docker rmi --force ${IMAGE_NAME}