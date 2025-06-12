FROM node:20 AS build-stage

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

RUN npx puppeteer browsers install chrome

RUN npm run build

FROM node:20 AS prod-stage

WORKDIR /app

COPY --from=build-stage /root/.cache/puppeteer /root/.cache/puppeteer

COPY --from=build-stage /app /app

COPY assets /app/assets

RUN npm install --omit=dev

RUN apt-get update \
    && apt-get install -y ffmpeg curl \
    fonts-liberation libappindicator3-1 libasound2 \
    libatk-bridge2.0-0 libnspr4 libnss3 libxss1 \
    libxcomposite1 libxcursor1 libxdamage1 libxi6 \
    libxtst6 libgbm1 libgtk-3-0 xdg-utils \
    && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
    && chmod a+rx /usr/local/bin/yt-dlp \
    && rm -rf /var/lib/apt/lists/*

CMD ["node", "dist/main.js"]
