# Compile

[[toc]]

## Regular compilation

```
go build .
```

## Static compilation

The package by regular compilation also needs to rely on the support of the deployment environment, the statically compiled files can be freely put to run on the specified platform without environment configuration.

```
go build --ldflags "-extldflags -static" -o main .
```

## Cross compile

Compilation is differentiated by platform, you need to select a matching compilation method according to the deployment situation.

```
// Compile Linux environment
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build .

// Compile Windows environment
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .

// Compile Mac environment
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build .
```

## Docker

Goravel has a default `Dockerfile` and `docker-compose.yml` file, you can use it directly, note that `APP_HOST` should be `0.0.0.0` at this time.

```
docker build .
```

### Docker Compose

You can also quickly start the service with the following command:

```
docker-compose build
docker-compose up
```

> Note: If you need external access, you need to change APP_HOST to 0.0.0.0

## Reduce package size

Commenting out the unused `ServiceProvider` in `ServiceProviders` will effectively reduce the packaging volume.

<CommentService/>