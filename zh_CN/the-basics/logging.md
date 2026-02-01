# 日志

[[toc]]

## 简介

为了了解应用程序的运行状况，Goravel 提供了强大的日志模块，可以通过 `facades.Log()` 将日志消息、系统错误记录到文件或其他通道。

## 配置

在 `config/logging.go` 中进行所有自定义配置，允许配置不同的日志通道。

`Goravel` 默认使用 `stack` 通道记录日志，`stack` 允许日志转发到多个通道中。

`single` 和 `daily` 驱动中的 `print` 配置可以控制日志输出到控制台。

## 可用的通道驱动

| 名称       | 描述       |
| -------- | -------- |
| `stack`  | 允许使用多个通道 |
| `single` | 单日志文件    |
| `daily`  | 每天一个日志文件 |
| `custom` | 自定义驱动    |

### 注入 Context

```go
facades.Log().WithContext(ctx)
```

## 写日志消息

```go
facades.Log().Debug(message)
facades.Log().Debugf(message, args)
facades.Log().Info(message)
facades.Log().Infof(message, args)
facades.Log().Warning(message)
facades.Log().Warningf(message, args)
facades.Log().Error(message)
facades.Log().Errorf(message, args)
facades.Log().Fatal(message)
facades.Log().Fatalf(message, args)
facades.Log().Panic(message)
facades.Log().Panicf(message, args)
```

### 写入特定通道

有时，你可能希望将消息记录到应用程序默认频道以外的频道：

```go
facades.Log().Channel("single").Info(message)
```

如果你想同时写入多个通道，可以使用 `Stack` 方法：

```go
facades.Log().Stack([]string{"single", "slack"}).Info(message)
```

## 链式方法

Goravel 提供有便捷的链式方式，方便在日志中插入更多有用信息：

```go
facades.Log().User("John").Debug(message)
```

| Method    | Action       |
| --------- | ------------ |
| Code      | 设置日志代码。      |
| Hint      | 设置提示，方便调试。   |
| In        | 设置日志相关的分类。   |
| Owner     | 设置日志归属人。     |
| Request   | 记录 Request。  |
| Response  | 记录 Response。 |
| Tags      | 为日志添加标签。     |
| User      | 记录触发日志的用户。   |
| With      | 为日志附加数据。     |
| WithTrace | 为日志附加堆栈信息。   |

## 创建自定义通道

如果你想定义一个完全自定义的驱动，可以在 `config/logging.go` 配置文件中指定 `custom` 驱动类型。
然后包含 `via` 选项，实现 `framework\contracts\log\Logger` 接口：

```go
// config/logging.go
"custom": map[string]interface{}{
    "driver": "custom",
    "via":    &CustomLogger{},
},
```

### 编写驱动

实现 `github.com/goravel/framework/contracts/log/Logger` 接口。

```go
// framework/contracts/log/Logger
package log

type Logger interface {
  // 在此处传递通道配置路径
  Handle(channel string) (Handler, error)
}
```

你可以参考 daily 和 single 日志驱动程序的实现：

- [Daily](https://github.com/goravel/framework/blob/master/log/logger/daily.go)
- [Single](https://github.com/goravel/framework/blob/master/log/logger/single.go)
