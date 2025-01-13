FROM nginx:alpine

# Installation des dépendances
RUN apk add --no-cache openssl

# Création du répertoire SSL et configuration des permissions
RUN mkdir -p /etc/nginx/ssl && \
    chown -R nginx:nginx /etc/nginx/ssl && \
    chmod -R 600 /etc/nginx/ssl

# Génération des certificats SSL auto-signés
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/cert.key -out /etc/nginx/ssl/cert.pem \
    -subj "/CN=localhost" && \
    chmod 600 /etc/nginx/ssl/cert.key /etc/nginx/ssl/cert.pem

# Copie de la configuration NGINX
COPY nginx.conf /etc/nginx/nginx.conf

# Exposition des ports
EXPOSE 80 443

# Commande par défaut
CMD ["nginx", "-g", "daemon off;"] 