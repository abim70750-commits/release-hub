FROM node:24-bookworm-slim
WORKDIR /app
COPY . .
ENV NODE_ENV=production
ENV DB_PATH=/data/release-hub.db
RUN mkdir -p /data
EXPOSE 3000
CMD ["node", "--disable-warning=ExperimentalWarning", "server.js"]
