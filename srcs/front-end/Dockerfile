FROM node:lts-alpine

#add front-end source code

WORKDIR "/front-end"

ADD . . 

#install dependencies

RUN npm i

#build

RUN npm run build

RUN npm install -g serve


#serve
ENTRYPOINT serve -s build -l 3001