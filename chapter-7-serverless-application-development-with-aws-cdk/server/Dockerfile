FROM node:lts-alpine@sha256:9a2db0008b592cfde1b98aa8972a8051ccb80bb51dde8b06c3a2e3762794e89c

RUN apk add dumb-init

WORKDIR /

COPY --chown=node:node . .

RUN npm install

RUN npm run build

EXPOSE 80

USER node

ENTRYPOINT ["dumb-init", "--"]

CMD ["npm", "run", "forever"]
