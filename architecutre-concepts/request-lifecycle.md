# Request Lifecycle

[[toc]]

## Introduction

All request entries of the Goravel application are the `main.go` file, which use the `bootstrap.Boot()` to boot the framework to load.

Then create a Goravel instance by `app := foundation.Application{}` in the `bootstrap/app.go` script.

Use `app.Boot()` to load the [Service Provider](service-providers.md) registered, and use `config.Boot()` to load the configuration file under the config directory.

Finally, use `facades.Route().Run(facades.Config().GetString("app.host"))` in the `main.go` file to start the HTTP server.

<CommentService/>