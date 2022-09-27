# Compile

[[toc]]

## Regular compilation

```
go build .
```

## Static compilation

The package after regular compilation also needs to rely on the support of the deployment environment, and the statically compiled files can be arbitrarily put to run on the specified platform, without the need for running environment configuration.
```
go build --ldflags "-extldflags -static" -o main .
```

## Cross compile

Compilation is differentiated by platform, and you need to select a matching compilation method according to the deployment situation.
```
// Compile Linux environment
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build .

// Compile Windows environment
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build .

// Compile Mac environment
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build .
```
