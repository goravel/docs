# Request Lifecycle

[[toc]]

## Introduction

Using any tool in the real world feels more intuitive when you know how it works. This document aims to give you a clear, high-level look at how Goravel functions. Don’t worry if you don’t get every term right away—just aim for a basic sense of how things work, and your expertise will grow as you explore the rest of the docs.

## Lifecycle Overview

1. The `main.go` is the entry point of the application, it will call the `bootstrap.Boot()` function to initialize the framework, and use `app.Wait()` to keep the application running.

2. The `bootstrap.Boot()` function will initialize a new Goravel application instance by calling `foundation.Setup()`, you can set service providers, routes, and other settings like migrations, schedules via `With*` functions here. Finally, call the `Create()` method to boot the application.

3. In the `Create()` method, it will first load configuration, then register all service providers and other settings. Finally, boot all service providers, return the application instance.

4. After the application is created, you can normally use all facades in this stage, but remember that your customize code should be placed before `app.Start()` in the `main.go` file. Or you can add your code into the `WithCallback` function in the `bootstrap/app.go` file to make sure your code is executed after the application is created. When running `app.Start()`, the http or grpc server will be started automatically if you have configured them.

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithConfig(config.Boot).
    WithCallback(func() {
      // Your custom code here, all facades are available here.
    }).
    Create()
}
```
