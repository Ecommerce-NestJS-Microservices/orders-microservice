# Orders Microservice

```
docker compose up -d
```

## Develpment steps

1. Clone proyect
2. Create a file `.env` based in file `.env.template`
3. Start up database with `docker compose up -d`
4. Start Server NATS
```
docker run -d --name nats-server -p 4222:4222 -p 6222:6222 -p 8222:8222 nats
```
5. Start proyect with `npm run start:dev`
