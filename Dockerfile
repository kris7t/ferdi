# Note: Before running this file, you should have already cloned the git repo + submodules on the host machine. This is used when actively developing on your local machine, but you want to build for a different architecture

FROM docker.io/library/node:14.17.6-buster as builder

ENV PATH="/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin:/usr/local/lib:/usr/include:/usr/share"

ARG DEBIAN_FRONTEND=noninteractive
# Note: This is added for building on ARM machines
ARG USE_SYSTEM_FPM=true
# Note: Added to bypass the error with missing git repo information for the 'preval-build-info' module
ARG PREVAL_BUILD_INFO_PLACEHOLDERS=true

RUN apt-get update -y \
  && apt-get install --no-install-recommends -y rpm ruby gem \
  && gem install fpm --no-ri --no-rdoc --no-document

WORKDIR /usr/src/ferdi

RUN npm i -g pnpm@6.14.7 \
  && npm i -g node-gyp@8.1.0 \
  && npm i -g lerna@4.0.0

COPY . .

# Note: Ideally this needs to be done before the COPY step - BUT moving this here resolves the issue with `preval-build-info-cli` not being found
RUN npx lerna bootstrap

WORKDIR /usr/src/ferdi/recipes

RUN pnpm i \
  && pnpm run package

WORKDIR /usr/src/ferdi

RUN npm run build

# --------------------------------------------------------------------------------------------

FROM docker.io/library/busybox:latest

WORKDIR /ferdi

COPY --from=builder /usr/src/ferdi/out/* /ferdi/

VOLUME [ "/ferdi-out" ]
