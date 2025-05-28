FROM node:alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install --global serve
COPY ./ ./
RUN npm run build


FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
