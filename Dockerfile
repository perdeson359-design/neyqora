FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0
ENV NEYQORA_SELF_HOSTED=1

EXPOSE 8787

CMD ["node", "server.mjs"]
