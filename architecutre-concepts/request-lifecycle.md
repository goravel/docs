# Request Lifecycle

[[toc]]

## Introduction

Use any tool in your life, if you understandd its working principle, you will be handy, and the same is true for application development. This document will give you a clearer understanding of the working principle of Goravevl.

## Lifecycle Overview

All request entries of the Goravel application are the `main.go` file, which use the `bootstrap.Boot()` to boot the frame to load.

Then create a Goravel instance `app := foundation.Application{}` in the `bootstrap/app.go` script.

Then use `app.Boot()` to load the [Service Proiders](serice-providers.md) registered in the bootloader framework, and use `config.Boot()` to load the configuration file under the config directory.

Finally, use `facades.Route.Run(facades.Config.GetString("app.host"))` in the `main.go` file to start the HTTP server.