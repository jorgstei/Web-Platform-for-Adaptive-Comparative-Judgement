docker-compose rm -f
docker-compose build acj-analyse
docker-compose build --parallel --force-rm acj-backend acj-frontend acj-db
docker-compose up -d
