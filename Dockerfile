FROM lambci/lambda:build-nodejs6.10

COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]
