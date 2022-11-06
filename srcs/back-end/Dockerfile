FROM node:lts-alpine

#add back-end source code

WORKDIR "/back-end"

ADD . . 

#install dependencies

RUN npm i

#build

RUN npm run build

#serve
# ENTRYPOINT npm run start:prod
ENTRYPOINT npm run start:prod