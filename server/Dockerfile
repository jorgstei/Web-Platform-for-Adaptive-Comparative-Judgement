FROM node:latest
WORKDIR /project
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt install nodejs git -y
COPY . ./server
WORKDIR /project/server
RUN npm i
ENTRYPOINT [ "npm", "start" ]
