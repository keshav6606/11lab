# Base Node.js image
FROM node:20-bullseye-slim

# Install ffmpeg for audio processing
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production || npm install --production

# Copy application files
COPY . .

# Create audio directories
RUN mkdir -p output uploads

# Set environment
ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["node", "server.js"]
