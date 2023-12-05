#!/bin/sh

echo "Waiting for neo4j..."

while ! nc -z $DATABASE_HOST $DATABASE_PORT; do
  sleep 0.1
done

echo "neo4j started"


exec "$@"
