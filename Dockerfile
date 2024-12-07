ARG NODE_VERSION=22.11.0
ARG DOMAIN=example.com
################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-alpine AS base

# Set the working directory to /app
WORKDIR /app

# Copy the package.json over in the intermedate "build" image
COPY ./package.json ./
COPY ./package-lock.json ./

# Install the dependencies
# Clean install because we want to install the exact versions
RUN npm install

# Copy the source code into the build image
COPY ./ ./

# Build the project
RUN npm run build

# Pull the same Node image and use it as the final (production image)
FROM base AS production

# Set the working directory to /app
WORKDIR /app

# Only copy the results from the build over to the final image
# We do this to keep the final image as small as possible
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/server ./server
COPY --from=base /app/dist ./dist
COPY --from=base /app/package.json ./package.json

RUN ls -l

# Expose port 3000 (default port)
EXPOSE 3000

# Start the application
CMD [ "npm", "run", "serve"]
