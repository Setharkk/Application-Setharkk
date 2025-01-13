FROM alpine:3.18.4

# Installation des dépendances, création des répertoires et configuration du script
RUN apk add --no-cache \
    bash \
    coreutils \
    curl \
    mongodb-tools \
    redis && \
    mkdir -p /backup/mongodb \
    /backup/redis \
    /backup/elasticsearch

COPY backup.sh /backup.sh
RUN chmod +x /backup.sh

# Point d'entrée
ENTRYPOINT ["/backup.sh"] 