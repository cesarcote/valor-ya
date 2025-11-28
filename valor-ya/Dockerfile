### STAGE 1:COMPILATION ###
FROM node:20-alpine AS build-step

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app
# RUN npm run build:prod
RUN npm run build:dev

### STAGE 2:RUN ###
FROM nginx:1.17.1-alpine

# Copy the build output to replace the default nginx contents.
# Note: @angular/build:application outputs to dist/valor-ya/browser
COPY --from=build-step /app/dist/valor-ya/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
