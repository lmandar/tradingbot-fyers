FROM node:14.5

WORKDIR /user/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "nodemon", "index.js" ]