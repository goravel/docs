# AI SDK

[[toc]]

## Introduction

The AI SDK provides a unified API for interacting with AI providers in Goravel applications. It introduces an `AI` facade, stateful conversations, agent classes, provider/model options, prompt attachments, streaming responses, image generation, audio generation, and transcription.

The core AI module manages conversations and provider resolution. Provider implementations are installed separately, such as `goravel/openai`, `goravel/anthropic`, and `goravel/gemini`.

## Installation

### Install AI Facade

Install the AI facade and core service provider with the `package:install` command:

```shell
./artisan package:install ai
```

This makes `facades.AI()` available and registers the `make:agent` Artisan command.

### Install Providers

Install at least one provider package before prompting an agent:

```shell
./artisan package:install github.com/goravel/openai
./artisan package:install github.com/goravel/anthropic
./artisan package:install github.com/goravel/gemini
```

Each provider package registers its own service provider and updates `config/ai.go` so `ai.providers.<name>.via` resolves through the package facade.

### Provider Configuration

The provider installers update `config/ai.go` automatically. For example, `goravel/openai` adds an OpenAI provider similar to this:

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

Then add the provider credentials to `.env`:

```ini
OPENAI_API_KEY=
OPENAI_BASE_URL=
```

`OPENAI_BASE_URL` is optional. Use it when routing requests through a proxy or an OpenAI-compatible endpoint. If a model default is empty, the provider package uses its own default model. Set `models.text.max_tokens` to limit generated text tokens; leave it as `0` to use the provider default.

## Creating Agents

Agents define the system instructions and any initial conversation context that should be sent to the provider.

You can generate an agent with Artisan:

```shell
./artisan make:agent SupportAgent
./artisan make:agent user/SupportAgent
```

The generated file is placed under `app/agents` and contains the required methods:

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

`Instructions` becomes the system prompt. `Messages` returns the initial conversation history copied into each new conversation. `Middleware` returns the default prompt middleware applied to each new conversation. `Tools` returns the callable tools the model may invoke.

## Prompting

Use `facades.AI().Agent` to create a conversation for an agent, then call `Prompt`:

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

The response exposes generated text, usage metadata, and any tool calls returned by the provider:

```go
text := response.Text()
usage := response.Usage()
toolCalls := response.ToolCalls()

fmt.Println(text)
fmt.Println(usage.Input(), usage.Output(), usage.Total())
fmt.Println(toolCalls)
```

Use `Then` to run a callback after a response is resolved:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.AgentResponse) {
    facades.Log().Info(response.Text())
})
```

You can override the configured provider or model for a single conversation:

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("openai"),
    frameworkai.WithModel("gpt-5.4"),
)
```

If the request should use a specific Go context, call `WithContext` before creating the conversation:

```go
conversation, err := facades.AI().WithContext(ctx).Agent(&agents.SupportAgent{})
```

## Conversation History

A conversation stores runtime messages in memory. After a successful `Prompt`, Goravel appends the user input and assistant response to the conversation history:

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

Use `Reset` to discard runtime messages and restore the initial messages returned by the agent:

```go
conversation.Reset()
```

## Attachments

Attachments let you send request-scoped documents and images with a single `Prompt` or `Stream` call. Goravel resolves attachments lazily from common sources and does not persist the binary content in conversation history.

The attachment examples use these imports:

```go
import (
    "fmt"

    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/ai/document"
    "github.com/goravel/framework/ai/image"
)
```

Attach files with `WithAttachments`:

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

The helper packages are available from `github.com/goravel/framework/ai/document` and `github.com/goravel/framework/ai/image`. The same constructors are also available from the root `github.com/goravel/framework/ai` package as `DocumentFromPath`, `ImageFromPath`, and related helpers.

Supported attachment sources:

| Source | Document Helper | Image Helper |
| --- | --- | --- |
| Bytes | `document.FromByte` | `image.FromByte` |
| String | `document.FromString` | - |
| Base64 | `document.FromBase64` | `image.FromBase64` |
| Reader | `document.FromReader` | `image.FromReader` |
| Local path | `document.FromPath` | `image.FromPath` |
| Storage | `document.FromStorage` | `image.FromStorage` |
| URL | `document.FromURL` | `image.FromURL` |
| Uploaded file | `document.FromUpload` | `image.FromUpload` |
| Provider file ID | `document.FromID` | `image.FromID` |

Use `WithMimeType` to override the detected MIME type. Use `WithDisk` with `FromStorage` when the attachment should be read from a non-default filesystem disk:

```go
attachment := document.FromStorage(
    "reports/monthly.pdf",
    document.WithDisk("s3"),
    document.WithMimeType("application/pdf"),
)
```

`Stream` accepts the same attachment option:

```go
stream, err := conversation.Stream("Describe this chart", frameworkai.WithAttachments(
    image.FromPath("storage/app/charts/revenue.png"),
))
```

### Uploading Attachments

If a provider supports file uploads, call `Put` on an attachment to upload it and receive a provider-managed file handle:

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

Providers that do not support uploads return an explicit error. The OpenAI provider supports uploads and uses the Responses API for prompts, streaming, tool calling, and attachments.

You may attach a provider-managed file by ID without uploading it again:

```go
file := document.FromID("file-abc123")

response, err := conversation.Prompt("Summarize this file", frameworkai.WithAttachments(file))
if err != nil {
    return err
}
```

Use `Get` to resolve file metadata or content from the provider, and `Delete` to remove the provider-managed file:

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

Use `image.FromID` for provider-managed image files.

## Image Generation

Use `facades.AI().Image` to generate images from a prompt:

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

You may set the provider and model on the fluent image request:

```go
response, err := facades.AI().Image("A launch banner for Goravel v1.18").
    Provider("openai").
    Model("gpt-image-2").
    Landscape().
    Generate()
```

Use image attachments when editing existing images:

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

The generated image response exposes bytes, MIME type, usage metadata, storage helpers, and a `Then` callback:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.ImageResponse) {
    facades.Log().Info(response.MimeType())
})
```

Store generated images directly on the configured filesystem:

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("images/gopher.png", "public")
```

You may also generate and store in one step:

```go
path, err := facades.AI().Image("A Goravel mascot").
    Portrait().
    StoreAs("images/mascot.png", "public")
```

## Audio Generation

Use `facades.AI().Audio` to generate speech from text:

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

Use `Female` for the default female voice, `Male` for the default male voice, or `Voice` for a provider-specific voice:

```go
response, err := facades.AI().Audio("Your report is ready.").
    Voice("alloy").
    Generate()
```

Audio responses expose bytes, MIME type, usage metadata, storage helpers, and a `Then` callback:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.AudioResponse) {
    facades.Log().Info(response.MimeType())
})
```

Store generated audio directly on the configured filesystem:

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("audio/welcome.mp3", "public")
```

You may also generate and store in one step:

```go
path, err := facades.AI().Audio("Welcome to Goravel").
    Female().
    StoreAs("audio/welcome.mp3", "public")
```

## Transcription

Use `facades.AI().Transcription` to convert audio files to text. The input must implement `ai.StorableFile`, so you can reuse document attachments or any custom file type that exposes `FileName`, `MimeType`, and `Content`:

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

Use `Segments` when the provider returns timestamps or speaker labels:

```go
for _, segment := range response.Segments() {
    fmt.Println(segment.Speaker, segment.Start, segment.End, segment.Text)
}
```

Transcription responses expose transcript text, optional segments, usage metadata, and a `Then` callback:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.TranscriptionResponse) {
    facades.Log().Info(response.Text())
})
```

## Middleware

Prompt middleware intercepts requests before they reach the provider. Middleware can mutate the prompt, call the next middleware/provider, short-circuit the provider call by returning a response directly, or register callbacks that run after the final response is available.

The middleware examples use these imports:

```go
import (
    "context"
    "strings"

    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/agents"
    "goravel/app/facades"
)
```

Middleware implements the `ai.Middleware` contract:

```go
type TrimPromptMiddleware struct {
}

func (r *TrimPromptMiddleware) Handle(ctx context.Context, prompt ai.AgentPrompt, next ai.Next) (ai.AgentResponse, error) {
    prompt.Input = strings.TrimSpace(prompt.Input)

    return next(ctx, prompt)
}
```

You may also post-process the final response with `Then`:

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

Apply middleware to a single conversation with `WithMiddleware`:

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithMiddleware(&TrimPromptMiddleware{}),
)
```

To apply middleware every time an agent is used, return it from the agent's `Middleware` method:

```go
func (r *SupportAgent) Middleware() []ai.Middleware {
    return []ai.Middleware{
        &TrimPromptMiddleware{},
        &LogResponseMiddleware{},
    }
}
```

Agent middleware runs before middleware passed with `WithMiddleware`. The same middleware pipeline is used by both `Prompt` and `Stream`, so cross-cutting behavior such as prompt enrichment, conversation memory, guards, and response logging can live in one place.

## Tools

Tools allow an agent to expose callable capabilities to the model. A tool has a unique name, a description, a JSON Schema parameter definition, and an `Execute` method that returns the tool result as a string.

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

Return the tool from your agent's `Tools` method:

```go
func (r *SupportAgent) Tools() []ai.Tool {
    return []ai.Tool{
        &WeatherTool{},
    }
}
```

When the model requests a tool call during `Prompt`, Goravel executes the tool, appends the tool result to the conversation, and re-prompts the model until it returns a final text response:

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

Goravel limits the tool-call loop to prevent a model from requesting tools indefinitely.

## Streaming

Use `Stream` when you want token deltas as they are produced by the provider:

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

Streaming supports the same conversation options, middleware pipeline, and tool-call loop as `Prompt`. When the model requests tools, the stream emits a `StreamEventTypeToolCall` event, Goravel executes the tools, and the stream continues with the final model response. The stream appends the user input, tool calls, tool results, and final assistant text to the conversation history only after the stream completes successfully.

### Completion Callback

Use `Then` to run logic after the stream has completed and the final response is available:

```go
stream.Then(func(response ai.AgentResponse) {
    facades.Log().Info(response.Text())
})
```

### HTTP Streaming

`HTTPResponse` converts a stream into a Server-Sent Events response. This is useful in controllers and routes:

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

By default, Goravel renders SSE events with `Content-Type: text/event-stream`. You may customize the status code or event renderer:

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

## Providers

### First-party Providers

Goravel provides these first-party AI provider packages:

| Provider | Package | Install Command |
| --- | --- | --- |
| OpenAI | [goravel/openai](https://github.com/goravel/openai) | `./artisan package:install github.com/goravel/openai` |
| Anthropic | [goravel/anthropic](https://github.com/goravel/anthropic) | `./artisan package:install github.com/goravel/anthropic` |
| Gemini | [goravel/gemini](https://github.com/goravel/gemini) | `./artisan package:install github.com/goravel/gemini` |

Provider packages implement the AI provider contracts and may support different capabilities. Check the provider package README for supported features and configuration details.

The OpenAI provider uses the Responses API for prompts, streaming, tool calling, and attachments. It also supports image generation, image edits, audio generation, transcription, media storage helpers, and provider-managed files.

### Custom Providers

You may build a custom provider by following the same structure as `goravel/openai`, `goravel/anthropic`, or `goravel/gemini`: implement the AI provider contracts, register a service provider, expose a facade that resolves the provider, then configure it in `config/ai.go`.

The provider resolver accepts either an `ai.Provider` instance or a `func() (ai.Provider, error)` in the provider's `via` configuration.

```go
"providers": map[string]any{
    "custom": map[string]any{
        "via": func() (ai.Provider, error) {
            return &CustomProvider{}, nil
        },
    },
},
```

A provider must implement both `Prompt` and `Stream`:

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

The agent response implementation should expose generated text with `Text`, usage metadata with `Usage`, requested tool invocations with `ToolCalls`, and completion callbacks with `Then`. For streaming, populate `StreamEvent.ToolCalls` when emitting `StreamEventTypeToolCall` events.

Providers that support image generation should implement `ImageProvider`:

```go
func (r *CustomProvider) Image(ctx context.Context, prompt ai.ImagePrompt) (ai.ImageResponse, error) {
    // Use prompt.Prompt, prompt.Model, prompt.Size, prompt.Quality, prompt.Attachments, and prompt.Timeout.
    return nil, nil
}
```

An image response should expose generated bytes with `Content`, the MIME type with `MimeType`, usage metadata with `Usage`, storage helpers with `Store` / `StoreAs`, and completion callbacks with `Then`.

Providers that support audio generation should implement `AudioProvider`:

```go
func (r *CustomProvider) Audio(ctx context.Context, prompt ai.AudioPrompt) (ai.AudioResponse, error) {
    // Use prompt.Prompt, prompt.Model, prompt.Voice, prompt.Instructions, and prompt.Timeout.
    return nil, nil
}
```

An audio response should expose generated bytes with `Content`, the MIME type with `MimeType`, usage metadata with `Usage`, storage helpers with `Store` / `StoreAs`, and completion callbacks with `Then`.

Providers that support speech-to-text should implement `TranscriptionProvider`:

```go
func (r *CustomProvider) Transcription(ctx context.Context, prompt ai.TranscriptionPrompt) (ai.TranscriptionResponse, error) {
    // Use prompt.File, prompt.Model, prompt.Language, prompt.Diarize, and prompt.Timeout.
    return nil, nil
}
```

A transcription response should expose transcript text with `Text`, optional timestamp or speaker segments with `Segments`, usage metadata with `Usage`, and completion callbacks with `Then`.

Providers that support attachment uploads should also implement `FileProvider`:

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

Then select it per conversation:

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("custom"),
)
```
