# 请求周期

[[toc]]

## 简介

了解其工作原理会让任何工具在现实世界中使用起来更加直观。 这份文档旨在为您提供一个清晰的高层次视角，了解Goravel的工作原理。 不要担心一开始不能完全理解每个术语——只需大致了解事物是如何工作的，随着你继续探索其余文档，你的专业知识将会增长。

## 生命周期概览

1. `main.go` 是应用程序的入口点，它会调用 `bootstrap.Boot()` 函数来初始化框架，并使用 `app.Wait()` 来保持应用程序运行。

2. `bootstrap.Boot()`函数会通过调用`foundation.Setup()`来初始化一个新的Goravel应用实例，你可以在这里通过`With*`函数设置服务提供者、路由以及其他设置，如迁移、调度等。 最后，调用`Create()`方法来启动应用程序。

3. 在`Create()`方法中，它会首先加载配置，然后注册所有服务提供程序和其他设置。 最后，启动所有服务提供者，返回应用实例。

4. 应用创建后，在此阶段通常可以使用所有 facades，但请注意，你的自定义代码应放置在 `main.go` 文件中的 `app.Start()` 之前。 或者，你可以将代码添加到 `bootstrap/app.go` 文件中的 `WithCallback` 函数中，以确保代码在应用创建后执行。 运行 `app.Start()` 时，如果配置了 HTTP 或 gRPC 服务器，它们将自动启动。

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
