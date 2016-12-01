FROM node:wheezy
LABEL name "gb-server"

RUN apt-get update && apt-get install -y libcairo2-dev libjpeg8-dev \
    libpango1.0-dev libgif-dev build-essential g++ && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN npm install --production

COPY . /usr/src/app

EXPOSE 3000

CMD npm start
