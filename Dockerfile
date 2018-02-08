FROM lambci/lambda:build-nodejs6.10

WORKDIR /src

COPY package.json /src
COPY /src /src

RUN npm install --production
