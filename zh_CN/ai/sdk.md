# AI SDK

[[toc]]

## 简介

AI SDK 为 Goravel 应用提供了一个统一的 API 来与 AI 供应商交互。它引入了 `AI` 门面、有状态对话、Agent 类、供应商/模型选项、提示附件、流式响应、图像生成、音频生成和语音转录。

核心 AI 模块负责管理对话和供应商解析。供应商实现需要单独安装，例如 `goravel/openai`、`goravel/anthropic` 和 `goravel/gemini`。

## 安装

### 安装 AI 门面

通过 `package:install` 命令安装 AI 门面和核心服务提供者：

```shell
./artisan package:install AI
```

这将使 `facades.AI()` 可用，并注册 `make:agent` 和 `make:tool` Artisan 命令。

### 安装供应商

在向 Agent 发出提示之前，请安装至少一个供应商包：

```shell
./artisan package:install github.com/goravel/openai
./artisan package:install github.com/goravel/anthropic
./artisan package:install github.com/goravel/gemini
```

每个供应商包都会注册自己的服务提供者并更新 `config/ai.go`，使 `ai.providers.<name>.via` 通过该包的门面进行解析。

### 供应商配置

供应商安装程序会自动更新 `config/ai.go`。例如，`goravel/openai` 会添加一个类似于以下的 OpenAI 供应商配置：

```go
package config

import (
    "github.com/goravel/framework/contracts/ai"
    openaifacades "github.com/goravel/openai/facades"
    "goravel/app/facades"
)

func init() {
    config := facades.Config()
    config.Add("ai", map[string]any{
        "default": "openai",
        "providers": map[string]any{
            "openai": map[string]any{
                "key": config.Env("OPENAI_API_KEY", ""),
                "failover": map[string][]string{
                    "context_length_exceeded": {
                        "maximum context length",
                        "/(?i)context.*length/",
                    },
                },
                "url": config.Env("OPENAI_BASE_URL", ""),
                "via": func() (ai.Provider, error) {
                    return openaifacades.OpenAI("openai")
                },
                "models": map[string]any{
                    "text": map[string]any{
                        "default": "",
                        "max_tokens": 0,
                    },
                    "audio": map[string]any{
                        "default": "",
                    },
                    "transcription": map[string]any{
                        "default": "",
                    },
                    "image": map[string]any{
                        "default": "",
                    },
                },
            },
        },
    })
}
```

然后将供应商凭据添加到 `.env` 文件中：

```ini
OPENAI_API_KEY=
OPENAI_BASE_URL=
```

`OPENAI_BASE_URL` 是可选的。当需要通过代理或与 OpenAI 兼容的端点路由请求时使用它。如果模型默认值为空，则供应商包使用自己的默认模型。设置 `models.text.max_tokens` 可以限制生成文本的 token 数量；设为 `0` 则使用供应商的默认值。

`failover` 映射是可选的。供应商包可以使用它将供应商特定的错误消息映射到故障转移原因。纯字符串使用子串匹配，以斜杠分隔的字符串使用 Go 正则表达式。

## 创建 Agent

Agent 定义了应发送给供应商的系统指令和任何初始对话上下文。

你可以通过 Artisan 生成一个 Agent：

```shell
./artisan make:agent SupportAgent
./artisan make:agent user/SupportAgent
```

生成的文件位于 `app/ai/agents` 目录下，包含所需的方法：

```go
package agents

import "github.com/goravel/framework/contracts/ai"

type SupportAgent struct {
}

func (r *SupportAgent) Instructions() string {
    return "You are a concise support assistant for a Goravel application."
}

func (r *SupportAgent) Messages() []ai.Message {
    return []ai.Message{
        {Role: ai.RoleAssistant, Content: "Ask clarifying questions when needed."},
    }
}

func (r *SupportAgent) Middleware() []ai.Middleware {
    return nil
}

func (r *SupportAgent) Tools() []ai.Tool {
    return nil
}
```

`Instructions` 作为系统提示词。`Messages` 返回将被复制到每个新对话中的初始对话历史。`Middleware` 返回应用于每个新对话的默认提示中间件。`Tools` 返回模型可以调用的可调用工具。

## 提示

使用 `facades.AI().Agent` 为某个 Agent 创建对话，然后调用 `Prompt`：

```go
conversation, err := facades.AI().Agent(&agents.SupportAgent{})
if err != nil {
    return err
}

response, err := conversation.Prompt("How do I create a controller?")
if err != nil {
    return err
}

fmt.Println(response.Text())
```

响应暴露生成文本、用量元数据以及供应商可能返回的任何工具调用：

```go
text := response.Text()
usage := response.Usage()
toolCalls := response.ToolCalls()

fmt.Println(text)
fmt.Println(usage.Input(), usage.Output(), usage.Total())
fmt.Println(toolCalls)
```

使用 `Then` 在响应解析后运行回调：

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.AgentResponse) {
    facades.Log().Info(response.Text())
})
```

你可以为单个对话覆盖已配置的供应商或模型：

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("openai"),
    frameworkai.WithModel("gpt-5.4"),
)
```

向 `WithProvider` 传入多个供应商名称可创建有序的故障转移链。只有当当前供应商返回故障转移错误时，Goravel 才会尝试下一个供应商：

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("openai", "anthropic"),
)
```

如果请求需要使用特定的 Go 上下文，请在创建对话之前调用 `WithContext`：

```go
conversation, err := facades.AI().WithContext(ctx).Agent(&agents.SupportAgent{})
```

## 对话历史

对话在内存中存储运行时消息。在成功调用 `Prompt` 之后，Goravel 会将用户输入和助手响应追加到对话历史中：

```go
conversation, err := facades.AI().Agent(&agents.SupportAgent{})
if err != nil {
    return err
}

_, err = conversation.Prompt("Hello")
if err != nil {
    return err
}

messages := conversation.Messages()
```

使用 `Reset` 丢弃运行时消息并恢复 Agent 返回的初始消息：

```go
conversation.Reset()
```

## 附件

附件允许你在单次 `Prompt` 或 `Stream` 调用中发送请求范围内的文档和图像。Goravel 从常见来源延迟解析附件，不会在对话历史中持久化二进制内容。

附件示例使用以下导入：

```go
import (
    "fmt"

    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/ai/document"
    "github.com/goravel/framework/ai/image"
)
```

使用 `WithAttachments` 附加文件：

```go
response, err := conversation.Prompt("Summarize these files", frameworkai.WithAttachments(
    document.FromPath("storage/app/reports/quarterly.pdf"),
    image.FromPath("storage/app/charts/revenue.png", image.WithMimeType("image/png")),
))
if err != nil {
    return err
}

fmt.Println(response.Text())
```

辅助包可以从 `github.com/goravel/framework/ai/document` 和 `github.com/goravel/framework/ai/image` 获取。同样的构造函数也可以在根包 `github.com/goravel/framework/ai` 中作为 `DocumentFromPath`、`ImageFromPath` 等相关辅助函数使用。

支持的附件来源：

| 来源 | 文档辅助函数 | 图像辅助函数 |
| --- | --- | --- |
| 字节 | `document.FromByte` | `image.FromByte` |
| 字符串 | `document.FromString` | - |
| Base64 | `document.FromBase64` | `image.FromBase64` |
| Reader | `document.FromReader` | `image.FromReader` |
| 本地路径 | `document.FromPath` | `image.FromPath` |
| 存储 | `document.FromStorage` | `image.FromStorage` |
| URL | `document.FromURL` | `image.FromURL` |
| 上传文件 | `document.FromUpload` | `image.FromUpload` |
| 供应商文件 ID | `document.FromID` | `image.FromID` |

使用 `WithMimeType` 覆盖检测到的 MIME 类型。当附件需要从非默认文件系统磁盘读取时，结合 `FromStorage` 使用 `WithDisk`：

```go
attachment := document.FromStorage(
    "reports/monthly.pdf",
    document.WithDisk("s3"),
    document.WithMimeType("application/pdf"),
)
```

使用 `WithTitle` 为附件设置显示标题。这在从字符串或字节切片创建附件时特别有用，因为没有自然的文件名：

```go
attachment := frameworkai.DocumentFromString(
    "The alpha release ships on July 1, 2026.",
    frameworkai.WithMimeType("text/plain"),
    frameworkai.WithTitle("Release Schedule"),
)
```

当附件从自然来源（路径、URL、存储或上传）解析时，解析出的文件名会覆盖标题。在希望使用描述性标签而非自动检测的名称时，使用 `WithTitle`。该选项在所有附件构造函数上都可用，包括 `document.WithTitle` 和 `image.WithTitle`。

`Stream` 接受相同的附件选项：

```go
stream, err := conversation.Stream("Describe this chart", frameworkai.WithAttachments(
    image.FromPath("storage/app/charts/revenue.png"),
))
```

### 上传附件

如果供应商支持文件上传，可以调用附件的 `Put` 方法上传它，并获取供应商管理的文件句柄：

```go
file, err := document.FromPath("storage/app/reports/quarterly.pdf").Put(
    ctx,
    frameworkai.WithProvider("openai"),
)
if err != nil {
    return err
}

fmt.Println(file.ID())
```

不支持上传的供应商会返回明确的错误。OpenAI 供应商支持上传，并使用 Responses API 进行提示、流式传输、工具调用和附件处理。

你可以通过 ID 附加一个供应商管理的文件，而无需再次上传：

```go
file := document.FromID("file-abc123")

response, err := conversation.Prompt("Summarize this file", frameworkai.WithAttachments(file))
if err != nil {
    return err
}
```

使用 `Get` 从供应商解析文件元数据或内容，使用 `Delete` 删除供应商管理的文件：

```go
file := document.FromID("file-abc123")

resolved, err := file.Get(ctx, frameworkai.WithProvider("openai"))
if err != nil {
    return err
}

content, err := resolved.Content(ctx)
if err != nil {
    return err
}

fmt.Println(resolved.ID(), resolved.MimeType(), len(content))

err = file.Delete(ctx, frameworkai.WithProvider("openai"))
```

使用 `image.FromID` 处理供应商管理的图像文件。

## 图像生成

使用 `facades.AI().Image` 从提示词生成图像：

```go
import (
    "fmt"

    frameworkai "github.com/goravel/framework/ai"
    "goravel/app/facades"
)

response, err := facades.AI().Image("A friendly gopher writing Goravel docs").
    Square().
    Quality(frameworkai.ImageQualityHigh).
    Generate()
if err != nil {
    return err
}

content, err := response.Content()
if err != nil {
    return err
}

fmt.Println(response.MimeType(), len(content))
```

你可以在流式图像请求上设置供应商和模型：

```go
response, err := facades.AI().Image("A launch banner for Goravel v1.18").
    Provider("openai").
    Model("gpt-image-2").
    Landscape().
    Generate()
```

在编辑现有图像时使用图像附件：

```go
import (
    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/ai/image"
    "goravel/app/facades"
)

response, err := facades.AI().Image("Turn this chart into a watercolor illustration").
    Attachments(image.FromPath("storage/app/charts/revenue.png", image.WithMimeType("image/png"))).
    Quality(frameworkai.ImageQualityMedium).
    Generate()
```

生成的图像响应暴露字节、MIME 类型、用量元数据、存储辅助函数以及 `Then` 回调：

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.ImageResponse) {
    facades.Log().Info(response.MimeType())
})
```

将生成的图像直接存储到已配置的文件系统：

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("images/gopher.png", "public")
```

你也可以一步完成生成和存储：

```go
path, err := facades.AI().Image("A Goravel mascot").
    Portrait().
    StoreAs("images/mascot.png", "public")
```

## 音频生成

使用 `facades.AI().Audio` 从文本生成语音：

```go
import (
    "fmt"
    "time"

    "goravel/app/facades"
)

response, err := facades.AI().Audio("Welcome to Goravel").
    Provider("openai").
    Model("gpt-4o-mini-tts").
    Male().
    Instructions("Speak slowly and warmly.").
    Timeout(30 * time.Second).
    Generate()
if err != nil {
    return err
}

content, err := response.Content()
if err != nil {
    return err
}

fmt.Println(response.MimeType(), len(content))
```

使用 `Female` 获取默认女声，`Male` 获取默认男声，或使用 `Voice` 指定供应商特定的语音：

```go
response, err := facades.AI().Audio("Your report is ready.").
    Voice("alloy").
    Generate()
```

音频响应暴露字节、MIME 类型、用量元数据、存储辅助函数以及 `Then` 回调：

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.AudioResponse) {
    facades.Log().Info(response.MimeType())
})
```

将生成的音频直接存储到已配置的文件系统：

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("audio/welcome.mp3", "public")
```

你也可以一步完成生成和存储：

```go
path, err := facades.AI().Audio("Welcome to Goravel").
    Female().
    StoreAs("audio/welcome.mp3", "public")
```

## 语音转录

使用 `facades.AI().Transcription` 将音频文件转换为文本。输入必须实现 `ai.StorableFile`，因此你可以复用文档附件或任何暴露 `FileName`、`MimeType` 和 `Content` 的自定义文件类型：

```go
import (
    "fmt"
    "time"

    "github.com/goravel/framework/ai/document"
    "goravel/app/facades"
)

response, err := facades.AI().Transcription(document.FromPath("storage/app/audio/meeting.mp3")).
    Provider("openai").
    Model("gpt-4o-mini-transcribe").
    Language("en").
    Diarize().
    Timeout(30 * time.Second).
    Generate()
if err != nil {
    return err
}

fmt.Println(response.Text())
```

当供应商返回时间戳或说话人标签时，使用 `Segments`：

```go
for _, segment := range response.Segments() {
    fmt.Println(segment.Speaker, segment.Start, segment.End, segment.Text)
}
```

转录响应暴露转录文本、可选片段、用量元数据以及 `Then` 回调：

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.TranscriptionResponse) {
    facades.Log().Info(response.Text())
})
```

## 中间件

提示中间件在请求到达供应商之前拦截它们。中间件可以修改提示词、调用下一个中间件/供应商、通过直接返回响应来短路供应商调用，或者注册在最终响应可用后执行的回调。

中间件示例使用以下导入：

```go
import (
    "context"
    "strings"

    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/ai/agents"
    "goravel/app/facades"
)
```

中间件实现 `ai.Middleware` 契约：

```go
type TrimPromptMiddleware struct {
}

func (r *TrimPromptMiddleware) Handle(ctx context.Context, prompt ai.AgentPrompt, next ai.Next) (ai.AgentResponse, error) {
    prompt.Input = strings.TrimSpace(prompt.Input)

    return next(ctx, prompt)
}
```

你也可以使用 `Then` 对最终响应进行后处理：

```go
type LogResponseMiddleware struct {
}

func (r *LogResponseMiddleware) Handle(ctx context.Context, prompt ai.AgentPrompt, next ai.Next) (ai.AgentResponse, error) {
    response, err := next(ctx, prompt)
    if err != nil {
        return nil, err
    }

    return response.Then(func(response ai.AgentResponse) {
        facades.Log().Info(response.Text())
    }), nil
}
```

使用 `WithMiddleware` 将中间件应用于单个对话：

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithMiddleware(&TrimPromptMiddleware{}),
)
```

要在每次使用 Agent 时都应用中间件，从 Agent 的 `Middleware` 方法返回它：

```go
func (r *SupportAgent) Middleware() []ai.Middleware {
    return []ai.Middleware{
        &TrimPromptMiddleware{},
        &LogResponseMiddleware{},
    }
}
```

Agent 中间件在通过 `WithMiddleware` 传入的中间件之前运行。相同的中间件管道同时用于 `Prompt` 和 `Stream`，因此提示词增强、对话记忆、守卫和响应日志等横切行为可以集中管理。

## 工具

工具允许 Agent 向模型暴露可调用的能力。一个工具有唯一的名称、描述、JSON Schema 参数定义以及一个返回工具结果字符串的 `Execute` 方法。

你可以通过 Artisan 生成一个工具：

```shell
./artisan make:tool WeatherTool
./artisan make:tool user/WeatherTool
```

生成的文件位于 `app/ai/tools` 目录下。嵌套名称会创建子目录，`--force` 或 `-f` 可以覆盖现有工具文件。

```go
package tools

import "context"

type WeatherTool struct {
}

func (r *WeatherTool) Name() string {
    return "weather_tool"
}

func (r *WeatherTool) Description() string {
    return "A description of the tool."
}

func (r *WeatherTool) Parameters() map[string]any {
    return nil
}

func (r *WeatherTool) Execute(ctx context.Context, args map[string]any) (string, error) {
    return "", nil
}
```

生成工具后，更新 `Description`、`Parameters` 和 `Execute` 以实现你想要暴露的能力：

```go
type WeatherTool struct {
}

func (r *WeatherTool) Name() string {
    return "get_weather"
}

func (r *WeatherTool) Description() string {
    return "Returns the current weather for a city."
}

func (r *WeatherTool) Parameters() map[string]any {
    return map[string]any{
        "type": "object",
        "properties": map[string]any{
            "city": map[string]any{
                "type": "string",
            },
        },
        "required": []string{"city"},
    }
}

func (r *WeatherTool) Execute(ctx context.Context, args map[string]any) (string, error) {
    city, _ := args["city"].(string)

    return fmt.Sprintf("Sunny, 25 C in %s", city), nil
}
```

导入你应用的工具包，如 `goravel/app/ai/tools`，然后从 Agent 的 `Tools` 方法返回该工具：

```go
func (r *SupportAgent) Tools() []ai.Tool {
    return []ai.Tool{
        &tools.WeatherTool{},
    }
}
```

当模型在 `Prompt` 期间请求工具调用时，Goravel 会执行该工具，将工具结果追加到对话中，并重新提示模型，直到模型返回最终文本响应：

```go
conversation, err := facades.AI().Agent(&agents.SupportAgent{})
if err != nil {
    return err
}

response, err := conversation.Prompt("What's the weather in London?")
if err != nil {
    return err
}

fmt.Println(response.Text())
```

Goravel 限制工具调用循环次数，防止模型无限请求工具。

## 自定义生成器路径

默认情况下，`make:agent` 写入 `app/ai/agents`，`make:tool` 写入 `app/ai/tools`。你可以在 `bootstrap/app.go` 中使用 `WithPaths` 自定义这些路径：

```go
package bootstrap

import (
    "github.com/goravel/framework/contracts/foundation/configuration"
    "github.com/goravel/framework/foundation"
)

var App = foundation.Setup().
    WithPaths(func(paths configuration.Paths) {
        paths.Agents("internal/ai/agents")
        paths.Tools("internal/ai/tools")
    }).
    Create()
```

## 流式响应

当你需要供应商产生的 token 增量时，使用 `Stream`：

```go
stream, err := conversation.Stream("Write a short release note.")
if err != nil {
    return err
}

err = stream.Each(func(event ai.StreamEvent) error {
    switch event.Type {
    case ai.StreamEventTypeTextDelta:
        fmt.Print(event.Delta)
    case ai.StreamEventTypeToolCall:
        for _, toolCall := range event.ToolCalls {
            fmt.Println("calling tool:", toolCall.Name)
        }
    case ai.StreamEventTypeDone:
        if event.Usage != nil {
            fmt.Println(event.Usage.Total())
        }
    case ai.StreamEventTypeError:
        return errors.New(event.Error)
    }

    return nil
})
```

流式响应支持与 `Prompt` 相同的对话选项、中间件管道和工具调用循环。当模型请求工具时，流会发出 `StreamEventTypeToolCall` 事件，Goravel 执行工具，然后流继续返回最终模型响应。只有在流成功完成后，流才会将用户输入、工具调用、工具结果和最终助手文本追加到对话历史中。

### 完成回调

使用 `Then` 在流完成且最终响应可用后运行逻辑：

```go
stream.Then(func(response ai.AgentResponse) {
    facades.Log().Info(response.Text())
})
```

### HTTP 流式传输

`HTTPResponse` 将流转换为 Server-Sent Events 响应。这在控制器和路由中很有用：

```go
func Chat(ctx http.Context) http.Response {
    conversation, err := facades.AI().WithContext(ctx).Agent(&agents.SupportAgent{})
    if err != nil {
        return ctx.Response().String(500, err.Error())
    }

    stream, err := conversation.Stream(ctx.Request().Input("message"))
    if err != nil {
        return ctx.Response().String(500, err.Error())
    }

    return stream.HTTPResponse(ctx)
}
```

默认情况下，Goravel 以 `Content-Type: text/event-stream` 渲染 SSE 事件。你可以自定义状态码或事件渲染器：

```go
return stream.HTTPResponse(
    ctx,
    frameworkai.WithStreamCode(200),
    frameworkai.WithStreamRender(func(w http.StreamWriter, event ai.StreamEvent) error {
        if _, err := w.WriteString(event.Delta); err != nil {
            return err
        }

        return w.Flush()
    }),
)
```

## 供应商

### 官方供应商

Goravel 提供以下官方 AI 供应商包：

| 供应商 | 包 | 安装命令 |
| --- | --- | --- |
| OpenAI | [goravel/openai](https://github.com/goravel/openai) | `./artisan package:install github.com/goravel/openai` |
| Anthropic | [goravel/anthropic](https://github.com/goravel/anthropic) | `./artisan package:install github.com/goravel/anthropic` |
| Gemini | [goravel/gemini](https://github.com/goravel/gemini) | `./artisan package:install github.com/goravel/gemini` |

供应商包实现了 AI 供应商契约，并可能支持不同的能力。请查阅供应商包的 README 了解支持的功能和配置详情。

OpenAI 供应商使用 Responses API 进行提示、流式传输、工具调用和附件处理。它还支持图像生成、图像编辑、音频生成、转录、媒体存储辅助函数以及供应商管理的文件。

### 供应商故障转移

当通过 `WithProvider("primary", "backup")` 配置供应商链时，Goravel 仅对实现了 `ai.FailoverError` 的错误重试下一个供应商。如果链中的所有供应商都因为故障转移错误而失败，则返回最后一个错误。流式响应可以在输出开始前进行故障转移；输出开始后，流返回当前供应商的错误，而不是切换供应商。

配置 `ai.providers.openai.failover` 可添加 OpenAI 特定的错误消息映射：

```go
"openai": map[string]any{
    "key": config.Env("OPENAI_API_KEY", ""),
    "failover": map[string][]string{
        "context_length_exceeded": {
            "maximum context length",
            "/(?i)context.*length/",
        },
    },
    "via": func() (ai.Provider, error) {
        return openaifacades.OpenAI("openai")
    },
},
```

每个 `failover` 键是由 `FailoverError.Reason()` 返回的原因。空原因或空匹配模式将被忽略。无效的正则表达式在解析供应商时返回错误。

### 自定义供应商

你可以按照 `goravel/openai`、`goravel/anthropic` 或 `goravel/gemini` 的相同结构构建自定义供应商：实现 AI 供应商契约，注册服务提供者，暴露一个解析供应商的门面，然后在 `config/ai.go` 中配置它。

供应商解析器接受 `ai.Provider` 实例或供应商 `via` 配置中的 `func() (ai.Provider, error)`。

```go
"providers": map[string]any{
    "custom": map[string]any{
        "via": func() (ai.Provider, error) {
            return &CustomProvider{}, nil
        },
    },
},
```

供应商必须实现 `Prompt` 和 `Stream`：

```go
import (
    "context"

    "github.com/goravel/framework/contracts/ai"
)

type CustomProvider struct {
}

func (r *CustomProvider) Prompt(ctx context.Context, prompt ai.AgentPrompt) (ai.AgentResponse, error) {
    // Use prompt.Attachments when calling providers that support documents or images.
    // Use prompt.Tools when calling providers that support tool calling.
    // Use prompt.ProviderState to keep provider-specific state across tool-call loops.
    return nil, nil
}

func (r *CustomProvider) Stream(ctx context.Context, prompt ai.AgentPrompt) (ai.StreamableAgentResponse, error) {
    // Return tool calls on the final streamed response when the model requests tools.
    return nil, nil
}
```

Agent 响应实现应通过 `Text` 暴露生成文本，通过 `Usage` 暴露用量元数据，通过 `ToolCalls` 暴露请求的工具调用，通过 `Then` 暴露完成回调。对于流式传输，在发出 `StreamEventTypeToolCall` 事件时填充 `StreamEvent.ToolCalls`。

自定义供应商可以为供应商特定的可重试错误返回 `frameworkai.NewFailoverError`：

```go
import (
    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/contracts/ai"
)

return nil, frameworkai.NewFailoverError("custom", ai.FailoverReason("rate_limited"), err)
```

它们还可以使用 `frameworkai.NewFailoverRules` 编译配置的 `failover` 规则，并在返回之前包装匹配的错误：

```go
rules, err := frameworkai.NewFailoverRules("custom", providerConfig.Failover)
if err != nil {
    return nil, err
}

response, err := r.callProvider(ctx, prompt)
if err != nil {
    return nil, rules.Wrap("custom", err)
}

return response, nil
```

支持图像生成的供应商应实现 `ImageProvider`：

```go
func (r *CustomProvider) Image(ctx context.Context, prompt ai.ImagePrompt) (ai.ImageResponse, error) {
    // Use prompt.Prompt, prompt.Model, prompt.Size, prompt.Quality, prompt.Attachments, and prompt.Timeout.
    return nil, nil
}
```

图像响应应通过 `Content` 暴露生成的字节，通过 `MimeType` 暴露 MIME 类型，通过 `Usage` 暴露用量元数据，通过 `Store` / `StoreAs` 暴露存储辅助函数，通过 `Then` 暴露完成回调。

支持音频生成的供应商应实现 `AudioProvider`：

```go
func (r *CustomProvider) Audio(ctx context.Context, prompt ai.AudioPrompt) (ai.AudioResponse, error) {
    // Use prompt.Prompt, prompt.Model, prompt.Voice, prompt.Instructions, and prompt.Timeout.
    return nil, nil
}
```

音频响应应通过 `Content` 暴露生成的字节，通过 `MimeType` 暴露 MIME 类型，通过 `Usage` 暴露用量元数据，通过 `Store` / `StoreAs` 暴露存储辅助函数，通过 `Then` 暴露完成回调。

支持语音转文本的供应商应实现 `TranscriptionProvider`：

```go
func (r *CustomProvider) Transcription(ctx context.Context, prompt ai.TranscriptionPrompt) (ai.TranscriptionResponse, error) {
    // Use prompt.File, prompt.Model, prompt.Language, prompt.Diarize, and prompt.Timeout.
    return nil, nil
}
```

转录响应应通过 `Text` 暴露转录文本，通过 `Segments` 暴露可选的时间戳或说话人片段，通过 `Usage` 暴露用量元数据，通过 `Then` 暴露完成回调。

支持附件上传的供应商还应实现 `FileProvider`：

```go
import (
    "context"

    "github.com/goravel/framework/contracts/ai"
)

func (r *CustomProvider) PutFile(ctx context.Context, file ai.StorableFile) (ai.FileResponse, error) {
    content, err := file.Content(ctx)
    if err != nil {
        return nil, err
    }

    _ = content
    _ = file.FileName()
    _ = file.MimeType()

    return nil, nil
}

func (r *CustomProvider) GetFile(ctx context.Context, id string) (ai.FileResponse, error) {
    return nil, nil
}

func (r *CustomProvider) DeleteFile(ctx context.Context, id string) error {
    return nil
}
```

然后在每次对话中选择它：

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("custom"),
)
```

## AI Agent 开发技能

`goravel-lite` 脚手架附带一个 `.agents/skills/goravel-development/SKILL.md` 技能文件，教 AI 编程助手（Cursor、Copilot、Codex 等）如何使用 Goravel 项目。该技能涵盖项目结构、门面模式、路由、ORM、测试约定和 Artisan 脚手架命令。

当 AI 助手读取此技能时，它已经知道：

- 如何初始化 Goravel 项目并使用 `package:install` 添加门面。
- 门面模式、使用 `testify` 套件进行测试以及模拟辅助函数。
- Artisan `make:*` 生成器用于控制器、中间件、模型、迁移等。
- 在哪里找到契约接口、参考实现和文档。

### 自定义

你可以通过创建 `.agents/skills/goravel-development/CUSTOM.md` 来使用项目特定的规则扩展内置技能。AI 助手将自动读取并应用这两个文件。添加项目独有的约定，如首选的导入别名、特定领域的命名或自定义目录布局。

该技能随 `goravel-lite` 脚手架一起版本化，并在你升级框架时更新。升级后，请检查技能文件中的新约定，并根据需要合并你的 `CUSTOM.md` 规则。
