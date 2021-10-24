FROM node:17

#APP dir
WORKDIR /usr/src/app

COPY package*.json ./

RUN yarn install

COPY . .

EXPOSE 8000
CMD [ "node","src/index.js" ]

