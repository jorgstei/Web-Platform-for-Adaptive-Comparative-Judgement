FROM node:latest
WORKDIR /project
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update
RUN apt install nodejs git -y
COPY ./ ./client
WORKDIR /project/client
RUN npm install
RUN npm run build
ENTRYPOINT [ "npm", "run", "prod" ]
