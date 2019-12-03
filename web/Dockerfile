# base image
FROM node:12.2.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY . /app
RUN npm install --silent
RUN npm install --global --unsafe-perm serve
RUN npm run build

# start app
CMD ["serve", "-s", "-l", "3000", "build"]