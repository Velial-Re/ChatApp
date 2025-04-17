FROM node:alpine AS development
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
CMD ["yarn", "dev"]

FROM node:alpine AS build
WORKDIR /app
COPY package*.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build

FROM node:alpine
WORKDIR /app
COPY --from=build /app/dist /app/dist
COPY package*.json yarn.lock ./
RUN yarn install --production
RUN yarn global add serve
CMD ["serve", "-s", "dist", "-l", "5000"]
