FROM amd64/node:lts

WORKDIR /

COPY . .

RUN npm install && npm run build

EXPOSE 80

ENTRYPOINT ["npm", "run", "start"]
