FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY default.conf /etc/nginx/conf.d/default.conf

RUN mkdir -p /etc/nginx/ssl
RUN mkdir -p /var/cache/nginx

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"] 