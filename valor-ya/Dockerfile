### STAGE 1:COMPILATION ###
FROM node:20-alpine AS build-step

RUN mkdir -p /app
WORKDIR /app

COPY package.json pnpm-lock.yaml /app/

# Use pnpm (repo uses pnpm-lock.yaml). This avoids npm peer-deps resolution failures (ERESOLVE).
RUN corepack enable && pnpm install --frozen-lockfile

COPY . /app
# RUN npm run build:prod
RUN pnpm run build:dev

### STAGE 2:RUN ###
FROM nginx:1.17.1-alpine

# Copy the build output to replace the default nginx contents.
# Note: @angular/build:application outputs to dist/valor-ya/browser
COPY --from=build-step /app/dist/valor-ya/browser /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
