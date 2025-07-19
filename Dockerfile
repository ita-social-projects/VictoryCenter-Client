FROM node:20 AS build
WORKDIR /app
COPY package*.json /app/
RUN npm install
RUN npm install --global serve
COPY ./ ./
ENV REACT_APP_BACKEND_URL="http://backend.historycode.online/"
RUN npm run build


FROM nginxinc/nginx-unprivileged  
COPY --from=build /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
ENV REACT_APP_BACKEND_URL="http://backend.historycode.online/"
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
