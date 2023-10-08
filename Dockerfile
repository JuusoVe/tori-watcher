FROM mcr.microsoft.com/playwright:v1.38.0-jammy

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

EXPOSE 8080

CMD [ "npm", "start" ]