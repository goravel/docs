# AI SDK

[[toc]]

## 介绍

AI SDK 提供了统一的 API，用于在 Goravel 应用程序中与 AI 提供商交互。 它引入了 `AI` facade、有状态对话、agent、提供商/模型选项、附件、流式响应、图像生成、音频生成和转录。

AI 模块管理对话和解析提供商。 提供商支持独立安装，例如 `goravel/openai`、`goravel/anthropic` 和 `goravel/gemini`。

## 安装

### 安装 AI Facade

使用 `package:install` 命令安装 AI Facde 和核心服务提供商：

```shell
./artisan package:install AI
```

这样 `facades.AI()` 就可以正常使用了，并注册了 `make:agent` 和 `make:tool` Artisan 命令。

### 安装 Providers

在使用前，至少安装一个提供商：

```shell
./artisan package:install github.com/goravel/openai
./artisan package:install github.com/goravel/anthropic
./artisan package:install github.com/goravel/gemini
```

每个提供商注册自己的 service provider 并添加配置到 `config/ai.go`，并通过 `ai.providers.<name>.via` 解析。

### 提供商配置

安装程序自动更新 `config/ai.go`。 例如，`goravel/openai` 添加了一个类似以下的 OpenAI 提供商：

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

然后将提供商密钥添加到 `.env`：

```ini
OPENAI_API_KEY=
OPENAI_BASE_URL=
```

`OPENAI_BASE_URL` 是可选的。 当通过代理或兼容 OpenAI 的端点请求时使用。 如果模型默认值为空，则提供商使用自己的默认模型。 `models.text.max_tokens` 可以控制最大 tokens 限制；保留为 `0` 则使用提供商默认值。

可选 `failover` ， 提供商可以使用它将特定于提供商的错误消息映射到故障转移。 普通字符串使用子字符串匹配，也可以使用 Go 正则表达式。

## 创建 Agents

Agents 可以定义系统指令以及应发送给提供商的任何初始对话上下文。

你可以使用 Artisan 命令生成 Agents：

```shell
./artisan make:agent SupportAgent
./artisan make:agent user/SupportAgent
```

生成的文件位于 `app/ai/agents` 目录下：

```go
package agents

import "github.com/goravel/framework/contracts/ai"

type SupportAgent struct {
}

func (r *SupportAgent) Instructions() string {
    return "你是Goravel应用的简洁支持助手。"
}

func (r *SupportAgent) Messages() []ai.Message {
    return []ai.Message{
        {Role: ai.RoleAssistant, Content: "必要时提出澄清问题。"},
    }
}

func (r *SupportAgent) Middleware() []ai.Middleware {
    return nil
}

func (r *SupportAgent) Tools() []ai.Tool {
    return nil
}
```

`Instructions` 是系统提示词。 `Messages` 为初始对话历史，该历史被复制到每个新对话中。 `Middleware` 返回应用于每个对话的中间件。 `Tools` 返回模型可以调用的工具。

## Prompting

使用 `facades.AI().Agent` 为 Agents 创建对话，然后调用 `Prompt`：

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

响应包括提供商返回的文本、元数据和工具调用：

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

你可以覆盖单次对话的提供商或模型：

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("openai"),
    frameworkai.WithModel("gpt-5.4"),
)
```

将额外的提供商名称传递给 `WithProvider` 以创建有序的故障转移链。 Goravel 仅在当前提供程序返回故障转移错误时尝试下一个提供商：

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("openai", "anthropic"),
)
```

如果请求使用特定的上下文，请在创建对话之前调用 `WithContext`：

```go
conversation, err := facades.AI().WithContext(ctx).Agent(&agents.SupportAgent{})
```

## 对话历史

Conversation 在内存中存储运行时消息， 在成功执行 `Prompt` 后，Goravel 会将用户输入和助手响应追加到对话历史中：

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

使用 `Reset` 丢弃运行时消息并恢复代理返回的初始消息：

```go
conversation.Reset()
```

## 附件

附件允许您通过单个 `Prompt` 或 `Stream` 调用发送请求范围内的文档和图像。 Goravel 从常见源延迟解析附件，并且不会在对话历史中持久化二进制内容。

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

辅助包来自 `github.com/goravel/framework/ai/document` 和 `github.com/goravel/framework/ai/image`。 相同的构造函数也可从根包 `github.com/goravel/framework/ai` 中获得，如 `DocumentFromPath`、`ImageFromPath` 及相关辅助函数。

支持的附件来源：

| 来源      | 文档助手                   | 图像助手                |
| ------- | ---------------------- | ------------------- |
| 字节      | `document.FromByte`    | `image.FromByte`    |
| 字符串     | `document.FromString`  | -                   |
| Base64  | `document.FromBase64`  | `image.FromBase64`  |
| Reader  | `document.FromReader`  | `image.FromReader`  |
| 本地路径    | `document.FromPath`    | `image.FromPath`    |
| 存储      | `document.FromStorage` | `image.FromStorage` |
| URL     | `document.FromURL`     | `image.FromURL`     |
| 上传的文件   | `document.FromUpload`  | `image.FromUpload`  |
| 提供者文件ID | `document.FromID`      | `image.FromID`      |

使用 `WithMimeType` 覆盖检测到的 MIME 类型。 当附件应从非默认文件系统磁盘读取时，将 `WithDisk` 与 `FromStorage` 结合使用：

```go
attachment := document.FromStorage(
    "reports/monthly.pdf",
    document.WithDisk("s3"),
    document.WithMimeType("application/pdf"),
)
```

使用 `WithTitle` 设置附件的显示标题。 从字符串或字节切片创建附件时，这尤其有用，因为此时没有自然文件名：

```go
attachment := frameworkai.DocumentFromString(
    "The alpha release ships on July 1, 2026.",
    frameworkai.WithMimeType("text/plain"),
    frameworkai.WithTitle("Release Schedule"),
)
```

当附件从自然来源（路径、URL、存储或上传）解析时，解析出的文件名会覆盖标题。 在附件上使用`WithTitle`，当你想要一个描述性标签而不是自动检测的名称时。 该选项适用于所有附件构造器，包括`document.WithTitle`和`image.WithTitle`。

`Stream`接受相同的附件选项：

```go
stream, err := conversation.Stream("Describe this chart", frameworkai.WithAttachments(
    image.FromPath("storage/app/charts/revenue.png"),
))
```

### 上传附件

如果提供商支持文件上传，则在附件上调用`Put`以上传它并获取提供商管理的文件句柄：

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

不提供上传支持的提供商将返回一个明确的错误。 OpenAI 提供商支持上传，并使用 Responses API 进行提示、流式处理、工具调用和附件。

你可以通过 ID 附加提供商管理的文件，而无需再次上传：

```go
file := document.FromID("file-abc123")

response, err := conversation.Prompt("Summarize this file", frameworkai.WithAttachments(file))
if err != nil {
    return err
}
```

使用 `Get` 从提供者获取文件元数据或内容，并使用 `Delete` 移除提供者管理的文件：

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

使用 `image.FromID` 处理提供者管理的图像文件。

## 图像生成

使用 `facades.AI().Image` 根据提示生成图像：

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

您可以在流畅的图像请求上设置提供程序和模型：

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

生成的图像响应暴露了字节、MIME类型、使用元数据、存储帮助程序以及`Then`回调：

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.ImageResponse) {
    facades.Log().Info(response.MimeType())
})
```

直接将生成的图像存储到配置的文件系统中：

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("images/gopher.png", "public")
```

您还可以一步生成并存储：

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

response, err := facades.AI().Audio("欢迎使用 Goravel").
    Provider("openai").
    Model("gpt-4o-mini-tts").
    Male().
    Instructions("请缓慢而温暖地说话。").
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

使用 `Female` 表示默认女声，`Male` 表示默认男声，或者 `Voice` 表示特定提供商的语音：

```go
response, err := facades.AI().Audio("你的报告已准备好。").
    Voice("alloy").
    Generate()
```

音频响应暴露了字节、MIME 类型、使用元数据、存储助手和 `Then` 回调：

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.AudioResponse) {
    facades.Log().Info(response.MimeType())
})
```

将生成的音频直接存储在配置的文件系统上：

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("audio/welcome.mp3", "public")
```

您也可以一步生成并存储：

```go
path, err := facades.AI().Audio("Welcome to Goravel").
    Female().
    StoreAs("audio/welcome.mp3", "public")
```

## 转录

使用 `facades.AI().Transcription` 将音频文件转换为文本。 输入必须实现 `ai.StorableFile`，以便您可以重复使用文档附件或任何公开 `FileName`、`MimeType` 和 `Content` 的自定义文件类型：

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

当提供者返回时间戳或说话者标签时，使用 `Segments`：

```go
for _, segment := range response.Segments() {
    fmt.Println(segment.Speaker, segment.Start, segment.End, segment.Text)
}
```

转录响应暴露转录文本、可选分段、使用元数据和 `Then` 回调：

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.TranscriptionResponse) {
    facades.Log().Info(response.Text())
})
```

## HTTP 中间件

提示中间件在请求到达提供者之前拦截它们。 中间件可以修改提示、调用下一个中间件/提供者、通过直接返回响应来短路提供者调用，或在最终响应可用后注册回调。

中间件示例使用这些导入：

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

中间件实现了 `ai.Middleware` 契约：

```go
type TrimPromptMiddleware struct {
}

func (r *TrimPromptMiddleware) Handle(ctx context.Context, prompt ai.AgentPrompt, next ai.Next) (ai.AgentResponse, error) {
    prompt.Input = strings.TrimSpace(prompt.Input)

    return next(ctx, prompt)
}
```

您还可以使用 `Then` 对最终响应进行后处理：

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

要每次使用代理时都应用中间件，请从代理的 `Middleware` 方法中返回它：

```go
func (r *SupportAgent) Middleware() []ai.Middleware {
    return []ai.Middleware{
        &TrimPromptMiddleware{},
        &LogResponseMiddleware{},
    }
}
```

Agent 中间件在通过 `WithMiddleware` 传递的中间件之前运行。 相同的中间件管道由 `Prompt` 和 `Stream` 使用，因此诸如提示增强、对话记忆、防护和响应日志记录等横切行为可以集中在一处。

## 工具

工具允许智能体向模型公开可调用的能力。 工具具有唯一的名称、描述、JSON Schema 参数定义以及返回工具结果（字符串）的 `Execute` 方法。

您可以使用 Artisan 生成工具：

```shell
./artisan make:tool WeatherTool
./artisan make:tool user/WeatherTool
```

生成的文件放置在 `app/ai/tools` 下。 嵌套名称会创建子目录，`--force` 或 `-f` 会覆盖现有工具文件。

```go
package tools

import "context"

type WeatherTool struct {
}

func (r *WeatherTool) Name() string {
    return "weather_tool"
}

func (r *WeatherTool) Description() string {
    return "工具的说明。"
}

func (r *WeatherTool) Parameters() map[string]any {
    return nil
}

func (r *WeatherTool) Execute(ctx context.Context, args map[string]any) (string, error) {
    return "", nil
}
```

生成工具后，更新 `Description`、`Parameters` 和 `Execute` 以暴露所需的功能：

```go
type WeatherTool struct {
}

func (r *WeatherTool) Name() string {
    return "get_weather"
}

func (r *WeatherTool) Description() string {
    return "返回指定城市的当前天气。"
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

    return fmt.Sprintf("晴朗，25°C，%s", city), nil
}
```

导入你的应用的 tools 包，例如 `goravel/app/ai/tools`，然后在你的代理的 `Tools` 方法中返回该工具：

```go
func (r *SupportAgent) Tools() []ai.Tool {
    return []ai.Tool{
        &tools.WeatherTool{},
    }
}
```

当模型在 `Prompt` 期间请求工具调用时，Goravel 执行该工具，将工具结果追加到对话中，并重新提示模型，直到模型返回最终文本响应：

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

Goravel 限制工具调用循环，以防止模型无限期请求工具。

## 自定义生成器路径

默认情况下，`make:agent` 写入到 `app/ai/agents`，`make:tool` 写入到 `app/ai/tools`。 您可以使用 `WithPaths` 在 `bootstrap/app.go` 中自定义这些路径：

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

## 流式

使用 `Stream` 来获取提供商生成的令牌增量：

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

流式传输支持与 `Prompt` 相同的对话选项、中间件管道和工具调用循环。 当模型请求工具时，流会发出 `StreamEventTypeToolCall` 事件，Goravel 执行工具，然后流继续获取最终的模型响应。 流仅在成功完成后才将用户输入、工具调用、工具结果和最终助手文本追加到对话历史记录中。

### 完成回调

使用 `Then` 在流完成且最终响应可用后运行逻辑：

```go
stream.Then(func(response ai.AgentResponse) {
    facades.Log().Info(response.Text())
})
```

### HTTP 流式传输

`HTTPResponse` 将流转换为服务器发送事件（SSE）响应。 这在控制器和路由中很有用：

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

默认情况下，Goravel 使用 `Content-Type: text/event-stream` 渲染 SSE 事件。 您可以自定义状态码或事件渲染器：

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

## 提供商

### 第一方提供商

Goravel 提供以下第一方 AI 提供商包：

| 提供商       | 包                                                         | 安装命令                                                     |
| --------- | --------------------------------------------------------- | -------------------------------------------------------- |
| OpenAI    | [goravel/openai](https://github.com/goravel/openai)       | `./artisan package:install github.com/goravel/openai`    |
| Anthropic | [goravel/anthropic](https://github.com/goravel/anthropic) | `./artisan package:install github.com/goravel/anthropic` |
| Gemini    | [goravel/gemini](https://github.com/goravel/gemini)       | `./artisan package:install github.com/goravel/gemini`    |

提供者包实现AI提供者契约，可能支持不同的功能。 请查看提供者包的README以了解支持的功能和配置详情。

OpenAI提供者使用Responses API进行提示、流式传输、工具调用和附件处理。 它还支持图像生成、图像编辑、音频生成、转录、媒体存储助手和提供者管理的文件。

### 提供者故障转移

当使用 `WithProvider("primary", "backup")` 配置提供者链时，Goravel 仅对实现 `ai.FailoverError` 的错误重试下一个提供者。 如果链中的每个提供者都因故障转移错误而失败，则返回最后一个错误。 流式响应可以在输出开始前进行故障转移；输出开始后，流返回当前提供者错误而不是切换提供者。

配置 `ai.providers.openai.failover` 以添加 OpenAI 特定的错误消息映射：

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

每个 `failover` 键是 `FailoverError.Reason()` 返回的原因。 空的原因或模式将被忽略。 无效的正则表达式在解析提供者时会返回错误。

### 自定义提供者

您可以按照与 `goravel/openai`、`goravel/anthropic` 或 `goravel/gemini` 相同的结构构建自定义提供者：实现 AI 提供者合约，注册服务提供者，公开一个解析提供者的外观，然后在 `config/ai.go` 中进行配置。

提供者解析器接受一个 `ai.Provider` 实例或一个 `func() (ai.Provider, error)`，位于提供者的 `via` 配置中。

```go
"providers": map[string]any{
    "custom": map[string]any{
        "via": func() (ai.Provider, error) {
            return &CustomProvider{}, nil
        },
    },
},
```

提供者必须同时实现 `Prompt` 和 `Stream`：

```go
import (
    "context"

    "github.com/goravel/framework/contracts/ai"
)

type CustomProvider struct {
}

func (r *CustomProvider) Prompt(ctx context.Context, prompt ai.AgentPrompt) (ai.AgentResponse, error) {
    // 在调用支持文档或图像的提供程序时，使用 prompt.Attachments。
    // 在调用支持工具调用的提供程序时，使用 prompt.Tools。
    // 使用 prompt.ProviderState 在工具调用循环之间保持特定于提供程序的状态。
    return nil, nil
}

func (r *CustomProvider) Stream(ctx context.Context, prompt ai.AgentPrompt) (ai.StreamableAgentResponse, error) {
    // 当模型请求工具时，在最终的流式响应中返回工具调用。
    return nil, nil
}
```

代理响应实现应使用 `Text` 公开生成的文本，使用 `Usage` 公开使用元数据，使用 `ToolCalls` 公开请求的工具调用，并使用 `Then` 公开完成回调。 对于流式处理，在发出 `StreamEventTypeToolCall` 事件时，填充 `StreamEvent.ToolCalls`。

自定义提供程序可以返回 `frameworkai.NewFailoverError` 以处理提供程序特定的可重试错误：

```go
import (
    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/contracts/ai"
)

return nil, frameworkai.NewFailoverError("custom", ai.FailoverReason("rate_limited"), err)
```

它们还可以使用 `frameworkai.NewFailoverRules` 编译已配置的 `failover` 规则，并在返回之前包装匹配的错误：

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

支持图像生成的提供程序应实现 `ImageProvider`：

```go
func (r *CustomProvider) Image(ctx context.Context, prompt ai.ImagePrompt) (ai.ImageResponse, error) {
    // 使用 prompt.Prompt、prompt.Model、prompt.Size、prompt.Quality、prompt.Attachments 和 prompt.Timeout。
    return nil, nil
}
```

图像响应应通过 `Content` 暴露生成的字节，通过 `MimeType` 暴露 MIME 类型，通过 `Usage` 暴露使用元数据，通过 `Store` / `StoreAs` 暴露存储辅助函数，并通过 `Then` 暴露完成回调。

支持音频生成的提供程序应实现 `AudioProvider`：

```go
func (r *CustomProvider) Audio(ctx context.Context, prompt ai.AudioPrompt) (ai.AudioResponse, error) {
    // 使用 prompt.Prompt、prompt.Model、prompt.Voice、prompt.Instructions 和 prompt.Timeout。
    return nil, nil
}
```

音频响应应通过 `Content` 暴露生成的字节，通过 `MimeType` 暴露 MIME 类型，通过 `Usage` 暴露使用元数据，通过 `Store` / `StoreAs` 暴露存储辅助函数，并通过 `Then` 暴露完成回调。

支持语音转文本的提供者应实现 `TranscriptionProvider`：

```go
func (r *CustomProvider) Transcription(ctx context.Context, prompt ai.TranscriptionPrompt) (ai.TranscriptionResponse, error) {
    // 使用 prompt.File、prompt.Model、prompt.Language、prompt.Diarize 和 prompt.Timeout。
    return nil, nil
}
```

转录响应应通过 `Text` 公开转录文本，通过 `Segments` 公开可选的时间戳或说话者片段，通过 `Usage` 公开使用元数据，以及通过 `Then` 公开完成回调。

支持附件上传的提供者还应实现 `FileProvider`：

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

然后按对话选择它：

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("custom"),
)
```

## AI 智能体开发技能

`goravel-lite` 脚手架自带一个 `.agents/skills/goravel-development/SKILL.md` 技能文件，用于教会 AI 编码智能体（Cursor、Copilot、Codex 等） 如何与 Goravel 项目协作。 该技能涵盖项目结构、外观、路由、ORM、测试约定和 Artisan 脚手架命令。

当 AI 智能体读取此技能时，它已了解：

- 如何引导 Goravel 项目并使用 `package:install` 添加外观。
- 外观模式、使用 `testify` 套件进行测试以及模拟辅助工具。
- Artisan `make:*` 生成器，用于控制器、中间件、模型、迁移等。
- 在哪里找到契约接口、参考实现和文档。

### 自定义

你可以通过创建 `.agents/skills/goravel-development/CUSTOM.md` 来扩展内置技能，添加项目特定规则。 AI代理将自动读取并应用这两个文件。 添加项目特有的约定，例如首选的导入别名、领域特定的命名或自定义目录布局。

该技能与 `goravel-lite` 脚手架一起版本化，并在升级框架时更新。 升级后，审查技能文件以了解新约定，并根据需要合并你的 `CUSTOM.md` 规则。
