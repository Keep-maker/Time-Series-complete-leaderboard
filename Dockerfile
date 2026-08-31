# syntax=docker/dockerfile:1

# Use an official Node runtime as the base image
FROM node:22-slim

# Set the working directory inside the container
WORKDIR /workspace

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install dependencies (package-lock.json may be slightly out of sync, so use npm install)
RUN npm install

# Copy the rest of the application source
COPY . .

# Build a production bundle. Running the Vite dev server previously meant the
# first visitor paid for on-demand compilation of ~130 dev modules (30-60s),
# during which React had not hydrated and all buttons were dead. `vite build`
# pre-compiles everything into a handful of static assets instead.
RUN npm run build

# The preview server listens on 8080 (overridden from the 127.0.0.1:8081 the
# workspace's preview script pins; CLI flags take precedence over the config)
EXPOSE 8080

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]