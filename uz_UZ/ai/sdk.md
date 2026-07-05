# AI SDK

[[toc]]

## Kirish

AI SDK Goravel ilovalarida AI provayderlari bilan o'zaro aloqa qilish uchun yagona API taqdim etadi. U `AI` fasadini, holatli suhbatlarni, agent klasslarini, provayder/model opsiyalarini, ilovalarni, oqimli javoblarni, rasm yaratishni, audio yaratishni va transkripsiyani o'z ichiga oladi.

Asosiy AI moduli suhbatlar va provayderlarni hal qilishni boshqaradi. Provayder ilovalari alohida o'rnatiladi, masalan `goravel/openai`, `goravel/anthropic` va `goravel/gemini`.

## O'rnatish

### AI Fasadini O'rnatish

AI fasadini va asosiy xizmat ko'rsatuvchi provayderni `package:install` buyrug'i bilan o'rnating:

```shell
./artisan package:install AI
```

Bu `facades.AI()` ni mavjud qiladi va `make:agent` hamda `make:tool` Artisan buyruqlarini ro'yxatdan o'tkazadi.

### Provayderlarni O'rnatish

Agentga so'rov yuborishdan oldin kamida bitta provayder paketini o'rnating:

```shell
./artisan package:install github.com/goravel/openai
./artisan package:install github.com/goravel/anthropic
./artisan package:install github.com/goravel/gemini
```

Har bir provayder paketi o'zining xizmat ko'rsatuvchi provayderini ro'yxatdan o'tkazadi va `config/ai.go` ni yangilaydi, shunda `ai.providers.<name>.via` paket fasadi orqali hal qilinadi.

### Provayder Konfiguratsiyasi

Provayder o'rnatuvchilari `config/ai.go` ni avtomatik yangilaydi. Masalan, `goravel/openai` quyidagiga o'xshash OpenAI provayderini qo'shadi:

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

Keyin provayder hisob ma'lumotlarini `.env` ga qo'shing:

```ini
OPENAI_API_KEY=
OPENAI_BASE_URL=
```

`OPENAI_BASE_URL` ixtiyoriy. So'rovlarni proksi yoki OpenAI-mos keluvchi endpoint orqali yo'naltirishda foydalaning. Agar model standarti bo'sh bo'lsa, provayder paketi o'zining standart modelidan foydalanadi. Yaratilgan matn tokenlarini cheklash uchun `models.text.max_tokens` ni o'rnating; provayder standartidan foydalanish uchun `0` qoldiring.

`failover` xaritasi ixtiyoriy. Provayder paketlari undan provayderga xos xato xabarlarini failover sabablari bilan bog'lash uchun foydalanishi mumkin. Oddiy matnlar substring moslashuvidan foydalanadi, slash bilan ajratilgan matnlar esa Go muntazam ifodalaridan foydalanadi.

## Agentlarni Yaratish

Agentlar provayderga yuborilishi kerak bo'lgan tizim ko'rsatmalari va har qanday boshlang'ich suhbat kontekstini belgilaydi.

Artisan yordamida agent yaratishingiz mumkin:

```shell
./artisan make:agent SupportAgent
./artisan make:agent user/SupportAgent
```

Yaratilgan fayl `app/ai/agents` ga joylashtiriladi va quyidagi metodlarni o'z ichiga oladi:

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

`Instructions` tizim so'rovi bo'ladi. `Messages` har bir yangi suhbatga nusxalanadigan boshlang'ich suhbat tarixini qaytaradi. `Middleware` har bir yangi suhbatga qo'llaniladigan standart so'rov middleware'ini qaytaradi. `Tools` model chaqirishi mumkin bo'lgan chaqiriladigan vositalarni qaytaradi.

## So'rov Yuborish

Agent uchun suhbat yaratish uchun `facades.AI().Agent` dan foydalaning, keyin `Prompt` ni chaqiring:

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

Javob yaratilgan matnni, foydalanish metama'lumotlarini va provayder tomonidan qaytarilgan har qanday vosita chaqiruvlarini taqdim etadi:

```go
text := response.Text()
usage := response.Usage()
toolCalls := response.ToolCalls()

fmt.Println(text)
fmt.Println(usage.Input(), usage.Output(), usage.Total())
fmt.Println(toolCalls)
```

Javob hal qilingandan keyin callback ishga tushirish uchun `Then` dan foydalaning:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.AgentResponse) {
    facades.Log().Info(response.Text())
})
```

Bitta suhbat uchun sozlangan provayder yoki modelni bekor qilishingiz mumkin:

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("openai"),
    frameworkai.WithModel("gpt-5.4"),
)
```

Tartibli failover zanjirini yaratish uchun `WithProvider` ga qo'shimcha provayder nomlarini uzating. Goravel keyingi provayderni faqat joriy provayder failover xatosini qaytarganda sinab ko'radi:

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("openai", "anthropic"),
)
```

Agar so'rov maxsus Go kontekstidan foydalanishi kerak bo'lsa, suhbat yaratishdan oldin `WithContext` ni chaqiring:

```go
conversation, err := facades.AI().WithContext(ctx).Agent(&agents.SupportAgent{})
```

## Suhbat Tarixi

Suhbat ish vaqtidagi xabarlarni xotirada saqlaydi. Muvaffaqiyatli `Prompt` dan so'ng, Goravel foydalanuvchi kiritmasi va yordamchi javobini suhbat tarixiga qo'shadi:

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

Ish vaqtidagi xabarlarni o'chirish va agent tomonidan qaytarilgan boshlang'ich xabarlarni tiklash uchun `Reset` dan foydalaning:

```go
conversation.Reset()
```

## Ilovalar

Ilovalar bitta `Prompt` yoki `Stream` chaqiruvi bilan so'rovga oid hujjatlar va rasmlarni yuborish imkonini beradi. Goravel ilovalarni umumiy manbalardan dangasa hal qiladi va ikkilik tarkibni suhbat tarixida saqlamaydi.

Ilova misollari quyidagi importlardan foydalanadi:

```go
import (
    "fmt"

    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/ai/document"
    "github.com/goravel/framework/ai/image"
)
```

`WithAttachments` bilan fayllarni qo'shing:

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

Yordamchi paketlar `github.com/goravel/framework/ai/document` va `github.com/goravel/framework/ai/image` dan mavjud. Xuddi shu konstruktorlar `github.com/goravel/framework/ai` asosiy paketidan `DocumentFromPath`, `ImageFromPath` va tegishli yordamchilar sifatida ham mavjud.

Qo'llab-quvvatlanadigan ilova manbalari:

| Manba | Hujjat Yordamchisi | Rasm Yordamchisi |
| --- | --- | --- |
| Baytlar | `document.FromByte` | `image.FromByte` |
| Matn | `document.FromString` | - |
| Base64 | `document.FromBase64` | `image.FromBase64` |
| Reader | `document.FromReader` | `image.FromReader` |
| Mahalliy yo'l | `document.FromPath` | `image.FromPath` |
| Saqlash | `document.FromStorage` | `image.FromStorage` |
| URL | `document.FromURL` | `image.FromURL` |
| Yuklangan fayl | `document.FromUpload` | `image.FromUpload` |
| Provayder fayl ID si | `document.FromID` | `image.FromID` |

Aniqlangan MIME turini bekor qilish uchun `WithMimeType` dan foydalaning. Ilova standart bo'lmagan fayl tizimi diskidan o'qilishi kerak bo'lsa, `FromStorage` bilan `WithDisk` dan foydalaning:

```go
attachment := document.FromStorage(
    "reports/monthly.pdf",
    document.WithDisk("s3"),
    document.WithMimeType("application/pdf"),
)
```

Ilova uchun ko'rsatiladigan sarlavhani o'rnatish uchun `WithTitle` dan foydalaning. Bu, ayniqsa, tabiiy fayl nomi bo'lmagan matn yoki bayt kesimlaridan ilovalar yaratishda foydalidir:

```go
attachment := frameworkai.DocumentFromString(
    "The alpha release ships on July 1, 2026.",
    frameworkai.WithMimeType("text/plain"),
    frameworkai.WithTitle("Release Schedule"),
)
```

Ilova tabiiy manbadan (yo'l, URL, saqlash yoki yuklash) hal qilinganda, hal qilingan fayl nomi sarlavhani bekor qiladi. Avtomatik aniqlangan nom o'rniga tavsiflovchi yorliq kerak bo'lgan ilovalarda `WithTitle` dan foydalaning. Opsiya barcha ilova konstruktorlarida mavjud, jumladan `document.WithTitle` va `image.WithTitle`.

`Stream` bir xil ilova opsiyasini qabul qiladi:

```go
stream, err := conversation.Stream("Describe this chart", frameworkai.WithAttachments(
    image.FromPath("storage/app/charts/revenue.png"),
))
```

### Ilovalarni Yuklash

Agar provayder fayl yuklashni qo'llab-quvvatlasa, uni yuklash va provayder tomonidan boshqariladigan fayl dastagini olish uchun ilovada `Put` ni chaqiring:

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

Yuklashni qo'llab-quvvatlamaydigan provayderlar aniq xatoni qaytaradi. OpenAI provayderi yuklashni qo'llab-quvvatlaydi va so'rovlar, oqim, vosita chaqiruvi va ilovalar uchun Responses API dan foydalanadi.

Provayder tomonidan boshqariladigan faylni qayta yuklamasdan ID orqali qo'shishingiz mumkin:

```go
file := document.FromID("file-abc123")

response, err := conversation.Prompt("Summarize this file", frameworkai.WithAttachments(file))
if err != nil {
    return err
}
```

Provayderdan fayl metama'lumotlarini yoki tarkibini olish uchun `Get` dan, provayder tomonidan boshqariladigan faylni o'chirish uchun `Delete` dan foydalaning:

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

Provayder tomonidan boshqariladigan rasm fayllari uchun `image.FromID` dan foydalaning.

## Rasm Yaratish

So'rovdan rasm yaratish uchun `facades.AI().Image` dan foydalaning:

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

Fluent rasm so'rovida provayder va modelni o'rnatishingiz mumkin:

```go
response, err := facades.AI().Image("A launch banner for Goravel v1.18").
    Provider("openai").
    Model("gpt-image-2").
    Landscape().
    Generate()
```

Mavjud rasmlarni tahrirlashda rasm ilovalaridan foydalaning:

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

Yaratilgan rasm javobi baytlar, MIME turi, foydalanish metama'lumotlari, saqlash yordamchilari va `Then` callback-ni taqdim etadi:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.ImageResponse) {
    facades.Log().Info(response.MimeType())
})
```

Yaratilgan rasmlarni to'g'ridan-to'g'ri sozlangan fayl tizimida saqlang:

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("images/gopher.png", "public")
```

Shuningdek, bir qadamda yaratish va saqlash mumkin:

```go
path, err := facades.AI().Image("A Goravel mascot").
    Portrait().
    StoreAs("images/mascot.png", "public")
```

## Audio Yaratish

Matndan nutq yaratish uchun `facades.AI().Audio` dan foydalaning:

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

Standart ayol ovozi uchun `Female`, standart erkak ovozi uchun `Male` yoki provayderga xos ovoz uchun `Voice` dan foydalaning:

```go
response, err := facades.AI().Audio("Your report is ready.").
    Voice("alloy").
    Generate()
```

Audio javoblar baytlar, MIME turi, foydalanish metama'lumotlari, saqlash yordamchilari va `Then` callback-ni taqdim etadi:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.AudioResponse) {
    facades.Log().Info(response.MimeType())
})
```

Yaratilgan audioni to'g'ridan-to'g'ri sozlangan fayl tizimida saqlang:

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("audio/welcome.mp3", "public")
```

Shuningdek, bir qadamda yaratish va saqlash mumkin:

```go
path, err := facades.AI().Audio("Welcome to Goravel").
    Female().
    StoreAs("audio/welcome.mp3", "public")
```

## Transkripsiya

Audio fayllarni matnga aylantirish uchun `facades.AI().Transcription` dan foydalaning. Kirish `ai.StorableFile` ni amalga oshirishi kerak, shuning uchun siz hujjat ilovalarini yoki `FileName`, `MimeType` va `Content` ni taqdim etadigan har qanday maxsus fayl turini qayta ishlatishingiz mumkin:

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

Provayder vaqt belgilari yoki spiker yorliqlarini qaytarganda `Segments` dan foydalaning:

```go
for _, segment := range response.Segments() {
    fmt.Println(segment.Speaker, segment.Start, segment.End, segment.Text)
}
```

Transkripsiya javoblari transkript matni, ixtiyoriy segmentlar, foydalanish metama'lumotlari va `Then` callback-ni taqdim etadi:

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

So'rov middleware'i provayderga yetib borishdan oldin so'rovlarni ushlab qoladi. Middleware so'rovni o'zgartirishi, keyingi middleware/provayderni chaqirishi, to'g'ridan-to'g'ri javob qaytarish orqali provayder chaqiruvini qisqa tutashtirishi yoki yakuniy javob mavjud bo'lgandan keyin ishga tushadigan callback-larni ro'yxatdan o'tkazishi mumkin.

Middleware misollari quyidagi importlardan foydalanadi:

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

Middleware `ai.Middleware` shartnomasini amalga oshiradi:

```go
type TrimPromptMiddleware struct {
}

func (r *TrimPromptMiddleware) Handle(ctx context.Context, prompt ai.AgentPrompt, next ai.Next) (ai.AgentResponse, error) {
    prompt.Input = strings.TrimSpace(prompt.Input)

    return next(ctx, prompt)
}
```

Shuningdek, yakuniy javobni `Then` bilan qayta ishlashingiz mumkin:

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

`WithMiddleware` bilan bitta suhbatga middleware qo'llang:

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithMiddleware(&TrimPromptMiddleware{}),
)
```

Agent har safar ishlatilganda middleware qo'llash uchun uni agentning `Middleware` metodidan qaytaring:

```go
func (r *SupportAgent) Middleware() []ai.Middleware {
    return []ai.Middleware{
        &TrimPromptMiddleware{},
        &LogResponseMiddleware{},
    }
}
```

Agent middleware'i `WithMiddleware` bilan uzatilgan middleware'dan oldin ishlaydi. Xuddi shu middleware quvuri `Prompt` va `Stream` tomonidan ishlatiladi, shuning uchun so'rov boyitish, suhbat xotirasi, qo'riqchilar va javob loglari kabi kesishuvchi xatti-harakatlar bir joyda yashashi mumkin.

## Vositalar

Vositalar agentga modelga chaqiriladigan imkoniyatlarni taqdim etish imkonini beradi. Vosita noyob nomga, tavsifga, JSON Schema parametr ta'rifiga va vosita natijasini matn sifatida qaytaradigan `Execute` metodiga ega.

Artisan bilan vosita yaratishingiz mumkin:

```shell
./artisan make:tool WeatherTool
./artisan make:tool user/WeatherTool
```

Yaratilgan fayl `app/ai/tools` ga joylashtiriladi. Ichma-ich nomlar pastki papkalarni yaratadi va `--force` yoki `-f` mavjud vosita faylini qayta yozadi.

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

Vositani yaratgandan so'ng, taqdim qilmoqchi bo'lgan imkoniyat uchun `Description`, `Parameters` va `Execute` ni yangilang:

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

Ilovangizning vositalar paketini import qiling, masalan `goravel/app/ai/tools`, keyin vositani agentingizning `Tools` metodidan qaytaring:

```go
func (r *SupportAgent) Tools() []ai.Tool {
    return []ai.Tool{
        &tools.WeatherTool{},
    }
}
```

Model `Prompt` davomida vosita chaqiruvini so'raganda, Goravel vositani bajaradi, vosita natijasini suhbatga qo'shadi va model yakuniy matn javobini qaytarmaguncha qayta so'rov yuboradi:

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

Goravel modelning cheksiz vosita so'rashini oldini olish uchun vosita chaqiruv sikli chegarasiga ega.

## Maxsus Generator Yo'llari

Standart bo'yicha, `make:agent` `app/ai/agents` ga va `make:tool` `app/ai/tools` ga yozadi. Siz bu yo'llarni `bootstrap/app.go` da `WithPaths` bilan sozlashingiz mumkin:

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

## Oqim

Provayder tomonidan ishlab chiqarilgan token deltalarini olmoqchi bo'lsangiz `Stream` dan foydalaning:

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

Oqim `Prompt` bilan bir xil suhbat opsiyalarini, middleware quvurini va vosita chaqiruv siklini qo'llab-quvvatlaydi. Model vositalarni so'raganda, oqim `StreamEventTypeToolCall` hodisasini chiqaradi, Goravel vositalarni bajaradi va oqim yakuniy model javobi bilan davom etadi. Oqim foydalanuvchi kiritmasi, vosita chaqiruvlari, vosita natijalari va yakuniy yordamchi matnini faqat oqim muvaffaqiyatli yakunlangandan keyin suhbat tarixiga qo'shadi.

### Yakunlash Callback

Oqim tugagandan va yakuniy javob mavjud bo'lgandan keyin mantiqni ishga tushirish uchun `Then` dan foydalaning:

```go
stream.Then(func(response ai.AgentResponse) {
    facades.Log().Info(response.Text())
})
```

### HTTP Oqim

`HTTPResponse` oqimni Server-Sent Events javobiga aylantiradi. Bu kontrollerlar va marshrutlarda foydalidir:

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

Standart bo'yicha, Goravel SSE hodisalarini `Content-Type: text/event-stream` bilan chiqaradi. Status kodini yoki hodisa rendererini sozlashingiz mumkin:

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

## Provayderlar

### Birinchi tomon Provayderlari

Goravel quyidagi birinchi tomon AI provayder paketlarini taqdim etadi:

| Provayder | Paket | O'rnatish Buyrug'i |
| --- | --- | --- |
| OpenAI | [goravel/openai](https://github.com/goravel/openai) | `./artisan package:install github.com/goravel/openai` |
| Anthropic | [goravel/anthropic](https://github.com/goravel/anthropic) | `./artisan package:install github.com/goravel/anthropic` |
| Gemini | [goravel/gemini](https://github.com/goravel/gemini) | `./artisan package:install github.com/goravel/gemini` |

Provayder paketlari AI provayder shartnomalarini amalga oshiradi va turli imkoniyatlarni qo'llab-quvvatlashi mumkin. Qo'llab-quvvatlanadigan xususiyatlar va konfiguratsiya tafsilotlari uchun provayder paketi README ni tekshiring.

OpenAI provayderi so'rovlar, oqim, vosita chaqiruvi va ilovalar uchun Responses API dan foydalanadi. Shuningdek, u rasm yaratish, rasm tahrirlash, audio yaratish, transkripsiya, media saqlash yordamchilari va provayder tomonidan boshqariladigan fayllarni qo'llab-quvvatlaydi.

### Provayder Failover

Provayder zanjiri `WithProvider("primary", "backup")` bilan sozlanganda, Goravel faqat `ai.FailoverError` ni amalga oshiradigan xatolar uchun keyingi provayderni qayta sinab ko'radi. Agar zanjirdagi har bir provayder failover xatosi bilan muvaffaqiyatsiz bo'lsa, oxirgi xato qaytariladi. Oqim javoblari chiqish boshlanishidan oldin failover qilishi mumkin; chiqish boshlangandan keyin, oqim provayderlarni almashtirish o'rniga joriy provayder xatosini qaytaradi.

OpenAI-ga xos xato xabarlarini xaritalash uchun `ai.providers.openai.failover` ni sozlang:

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

Har bir `failover` kaliti `FailoverError.Reason()` tomonidan qaytariladigan sababdir. Bo'sh sabablar yoki patternlar e'tiborga olinmaydi. Noto'g'ri muntazam ifodalar provayderni hal qilishda xatoni qaytaradi.

### Maxsus Provayderlar

Siz `goravel/openai`, `goravel/anthropic` yoki `goravel/gemini` bilan bir xil tuzilmaga rioya qilgan holda maxsus provayder yaratishingiz mumkin: AI provayder shartnomalarini amalga oshiring, xizmat ko'rsatuvchi provayderni ro'yxatdan o'tkazing, provayderni hal qiladigan fasadni taqdim eting, keyin uni `config/ai.go` da sozlang.

Provayder hal qiluvchisi provayderning `via` konfiguratsiyasida `ai.Provider` instansiyasini yoki `func() (ai.Provider, error)` ni qabul qiladi.

```go
"providers": map[string]any{
    "custom": map[string]any{
        "via": func() (ai.Provider, error) {
            return &CustomProvider{}, nil
        },
    },
},
```

Provayder `Prompt` va `Stream` ni amalga oshirishi kerak:

```go
import (
    "context"

    "github.com/goravel/framework/contracts/ai"
)

type CustomProvider struct {
}

func (r *CustomProvider) Prompt(ctx context.Context, prompt ai.AgentPrompt) (ai.AgentResponse, error) {
    return nil, nil
}

func (r *CustomProvider) Stream(ctx context.Context, prompt ai.AgentPrompt) (ai.StreamableAgentResponse, error) {
    return nil, nil
}
```

Agent javob ilovasi `Text` bilan yaratilgan matnni, `Usage` bilan foydalanish metama'lumotlarini, `ToolCalls` bilan so'ralgan vosita chaqiruvlarini va `Then` bilan yakunlash callback-larini taqdim etishi kerak. Oqim uchun, `StreamEventTypeToolCall` hodisalarini chiqarishda `StreamEvent.ToolCalls` ni to'ldiring.

Maxsus provayderlar provayderga xos qayta uriniladigan xatolar uchun `frameworkai.NewFailoverError` ni qaytarishi mumkin:

```go
import (
    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/contracts/ai"
)

return nil, frameworkai.NewFailoverError("custom", ai.FailoverReason("rate_limited"), err)
```

Ular shuningdek, `frameworkai.NewFailoverRules` bilan sozlangan `failover` qoidalarini kompilyatsiya qilishi va mos keluvchi xatolarni qaytarishdan oldin ularni o'rashi mumkin:

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

Rasm yaratishni qo'llab-quvvatlaydigan provayderlar `ImageProvider` ni amalga oshirishi kerak:

```go
func (r *CustomProvider) Image(ctx context.Context, prompt ai.ImagePrompt) (ai.ImageResponse, error) {
    return nil, nil
}
```

Rasm javobi `Content` bilan yaratilgan baytlarni, `MimeType` bilan MIME turini, `Usage` bilan foydalanish metama'lumotlarini, `Store` / `StoreAs` bilan saqlash yordamchilarini va `Then` bilan yakunlash callback-larini taqdim etishi kerak.

Audio yaratishni qo'llab-quvvatlaydigan provayderlar `AudioProvider` ni amalga oshirishi kerak:

```go
func (r *CustomProvider) Audio(ctx context.Context, prompt ai.AudioPrompt) (ai.AudioResponse, error) {
    return nil, nil
}
```

Audio javobi `Content` bilan yaratilgan baytlarni, `MimeType` bilan MIME turini, `Usage` bilan foydalanish metama'lumotlarini, `Store` / `StoreAs` bilan saqlash yordamchilarini va `Then` bilan yakunlash callback-larini taqdim etishi kerak.

Nutqdan-matnga o'tkazishni qo'llab-quvvatlaydigan provayderlar `TranscriptionProvider` ni amalga oshirishi kerak:

```go
func (r *CustomProvider) Transcription(ctx context.Context, prompt ai.TranscriptionPrompt) (ai.TranscriptionResponse, error) {
    return nil, nil
}
```

Transkripsiya javobi `Text` bilan transkript matnini, `Segments` bilan ixtiyoriy vaqt belgisi yoki spiker segmentlarini, `Usage` bilan foydalanish metama'lumotlarini va `Then` bilan yakunlash callback-larini taqdim etishi kerak.

Ilova yuklashni qo'llab-quvvatlaydigan provayderlar `FileProvider` ni ham amalga oshirishi kerak:

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

Keyin uni har bir suhbat uchun tanlang:

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("custom"),
)
```

## AI Agent Rivojlantirish Ko'nikmasi

`goravel-lite` scaffold AI kodlash agentlariga (Cursor, Copilot, Codex va boshq.) Goravel loyihalari bilan ishlashni o'rgatadigan `.agents/skills/goravel-development/SKILL.md` ko'nikma faylini yetkazib beradi. Ko'nikma loyiha tuzilishi, fasadlar, marshrutlash, ORM, testlash konvensiyalari va Artisan scaffold buyruqlarini qamrab oladi.

AI agent bu ko'nikmani o'qiganda, u allaqachon biladi:

- Goravel loyihasini qanday yaratish va fasadlarni qo'shish uchun `package:install` dan foydalanish.
- Fasad patterni, `testify` suite'lari bilan testlash va mock yordamchilari.
- Kontrollerlar, middleware, modellar, migratsiyalar va boshqalar uchun Artisan `make:*` generatorlari.
- Shartnoma interfeyslari, mos yozuvlar ilovalari va hujjatlarni qayerdan topish.

### Moslashtirish

Siz `.agents/skills/goravel-development/CUSTOM.md` yaratish orqali o'rnatilgan ko'nikmani loyihaga xos qoidalar bilan kengaytirishingiz mumkin. AI agentlar ikkala faylni avtomatik o'qiydi va qo'llaydi. Loyihangizga xos konvensiyalarni qo'shing, masalan, afzal ko'rilgan import taxalluslari, domenga xos nomlash yoki maxsus papka tuzilmalari.

Ko'nikma `goravel-lite` scaffold bilan birga versiyalanadi va freymvorkni yangilaganingizda yangilanadi. Yangilagandan so'ng, ko'nikma faylini yangi konvensiyalar uchun ko'rib chiqing va kerak bo'lganda `CUSTOM.md` qoidalaringizni birlashtiring.
