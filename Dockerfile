# Args for FROM directives
ARG NODE_VER=10

#
# ---- Base Node image ----
FROM node:${NODE_VER} AS base
# The node:8 npm (v 5.6) has some issues, update it to latest
RUN npm install -g npm
# create and set working directory owned by non-root user; set that user
WORKDIR /app
RUN chown node:node /app
USER node

#
# ---- Dependencies ----
FROM base AS dependencies
# copy the app project file
COPY --chown=node:node package.json .
# install node packages
RUN npm install --only=production
# copy production node_modules aside
RUN cp -R node_modules prod_node_modules
# install ALL node_modules, including 'devDependencies'
RUN npm install

#
# ---- Build ----
# run compile, link, minimize...
FROM dependencies AS build
# copy app sources
COPY --chown=node:node . .
RUN npm run build:prod

#
# ---- Test ----
# run linters, setup and tests
#  see https://codefresh.io/docker-tutorial/node_docker_multistage/
#  when ready to add this stage (if test stage fails, image build fails)
#FROM dependencies AS test
#COPY . .
#RUN  npm run lint && npm run setup && npm run test

#
# ---- Release ----
FROM base AS release
LABEL Description="This image runs the riff-rtc server which customizes the chat page w/ config and lti login info"
# This is the production image, set NODE_ENV to reflect that
ENV NODE_ENV=production
# copy production node_modules
COPY --from=build --chown=node:node /app/prod_node_modules ./node_modules/
# copy app project file, build artifacts and configuration files
COPY --from=build --chown=node:node /app/config ./config/
COPY --from=build --chown=node:node /app/package.json /app/server.js ./
COPY --from=build --chown=node:node /app/build/index.html ./build/
# allow the port used to be specified, default to 3001
ARG PORT=3001
ENV PORT=$PORT
# expose port
EXPOSE $PORT
# allow all referenced environment variables to be overridden
ARG FIREBASE_CONFIG
ARG DATASERVER_EMAIL
ARG DATASERVER_PASSWORD
ARG SESSION_SECRET
ARG CONSUMER_KEY
ARG CONSUMER_SECRET
# Set the environment variables w/ values passed in
ENV FIREBASE_CONFIG=$FIREBASE_CONFIG \
    DATASERVER_EMAIL=$DATASERVER_EMAIL \
    DATASERVER_PASSWORD=$DATASERVER_PASSWORD \
    SESSION_SECRET=$SESSION_SECRET \
    CONSUMER_KEY=$CONSUMER_KEY \
    CONSUMER_SECRET=$CONSUMER_SECRET
# define command to start the riff-rtc server
CMD ["npm", "start"]
