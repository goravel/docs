# Request Lifecycle

[[toc]]

## Introduction

The `main.go` file serves as the entry point for all requests in the Goravel application. It utilizes the
`bootstrap.Boot()` function to initialize the framework.

Then a Goravel instance is created by `app := foundation.NewApplication()` in `bootstrap/app.go`.

After this, use `app.Boot()` to load the [Service Provider](providers) registered, and `config.Boot()` to
load the configuration files under the config directory.

Finally, start the HTTP server by using  `facades.Route().Run(facades.Config().GetString("app.host"))` in `main.go`.
