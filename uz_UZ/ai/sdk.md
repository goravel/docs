# AI SDK

[[toc]]

## Kirish

AI SDK Goravel ilovalarida AI provayderlari bilan ishlash uchun yagona API ni taqdim etadi. U `AI` fasadini, holatli suhbatlarni, agent sinflarini, provayder/model variantlarini, prompt biriktirmalarini, streaming javoblarni, tasvir yaratish, audio yaratish va transkripsiyani taqdim etadi.

Asosiy AI moduli suhbatlar va provayderlarni aniqlashni boshqaradi. Provayder implementatsiyalari alohida o'rnatiladi, masalan `goravel/openai`, `goravel/anthropic` va `goravel/gemini`.

## O'rnatish

### AI fasadini o'rnating

AI fasadini va asosiy xizmat provayderini `package:install` buyrug'i bilan o'rnating:

```shell
./artisan package:install AI
```

Bu `facades.AI()` ni mavjud qiladi va `make:agent` va `make:tool` Artisan buyruqlarini ro'yxatdan o'tkazadi.

### Provayderlarni o'rnatish

Agentni so'roshdan oldin kamida bitta provayder paketini o'rnating:

```shell
./artisan package:install github.com/goravel/openai
./artisan package:install github.com/goravel/anthropic
./artisan package:install github.com/goravel/gemini
```

Har bir provayder paketi o'zining xizmat provayderini ro'yxatdan o'tkazadi va `config/ai.go` faylini yangilaydi, shunda `ai.providers.<name>.via` paket fasad orqali hal qilinadi.

### Provayder konfiguratsiyasi

Provayder o'rnatuvchilari `config/ai.go` faylini avtomatik ravishda yangilaydi. Masalan, `goravel/openai` OpenAI provayderini quyidagicha qo'shadi:

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

`OPENAI_BASE_URL` ixtiyoriy. Proksi orqali yoki OpenAI bilan mos keladigan so'nggi nuqtaga so'rovlarni yo'naltirishda undan foydalaning. Agar modelning standarti bo'sh bo'lsa, provayder paketi o'zining standart modelidan foydalanadi. Yaratilgan matn tokenlarini cheklash uchun `models.text.max_tokens` ni o'rnating; provayder standartidan foydalanish uchun uni `0` qilib qoldiring.

`failover` xaritasi ixtiyoriy. Provayder paketlari provayderga xos xato xabarlarini failover sabablariga xaritalash uchun undan foydalanishi mumkin. Oddiy satrlar substring moslashuvidan foydalanadi va slash bilan ajratilgan satrlar Go muntazam ifodalaridan foydalanadi.

## Agentlarni Yaratish

Agentlar tizim ko'rsatmalarini va provayderga yuborilishi kerak bo'lgan har qanday dastlabki suhbat kontekstini belgilaydi.

Artisan bilan agent yaratishingiz mumkin:

```shell
./artisan make:agent SupportAgent
./artisan make:agent user/SupportAgent
```

Yaratilgan fayl `app/ai/agents` ostiga joylashtiriladi va kerakli metodlarni o'z ichiga oladi.

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

`Instructions` tizim so'roviga aylanadi. `Messages` har bir yangi suhbatga ko'chirilgan dastlabki suhbat tarixini qaytaradi. `Middleware` har bir yangi suhbatga qo'llaniladigan standart so'rov o'rtadasturini qaytaradi. `Tools` model chaqirishi mumkin bo'lgan chaqiriladigan vositalarni qaytaradi.

## So'rov yuborish

Agent uchun suhbat yaratish uchun `facades.AI().Agent` dan foydalaning, so'ng `Prompt` ni chaqiring.

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

Javob matn, foydalanish metama'lumotlari va provayder tomonidan qaytarilgan har qanday vosita chaqiruvlarini ochib beradi:

```go
text := response.Text()
usage := response.Usage()
toolCalls := response.ToolCalls()

fmt.Println(text)
fmt.Println(usage.Input(), usage.Output(), usage.Total())
fmt.Println(toolCalls)
```

`Then` dan javob hal qilingandan so'ng callbackni ishga tushirish uchun foydalaning:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.AgentResponse) {
    facades.Log().Info(response.Text())
})
```

Siz bitta suhbat uchun sozlangan provayder yoki modelni bekor qilishingiz mumkin:

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("openai"),
    frameworkai.WithModel("gpt-5.4"),
)
```

Buyurtma qilingan nosozlikni bartaraf etish zanjirini yaratish uchun `WithProvider` ga qo'shimcha provayder nomlarini o'tkazing. Goravel keyingi provayderni faqat joriy provayder failover xatolik qaytarsa sinab ko'radi:

```go
conversation, err := facades.AI().Agent(
    &agents.SupportAgent{},
    frameworkai.WithProvider("openai", "anthropic"),
)
```

Agar so'rov ma'lum bir Go kontekstidan foydalanishi kerak bo'lsa, suhbatni yaratishdan oldin `WithContext` ni chaqiring:

```go
conversation, err := facades.AI().WithContext(ctx).Agent(&agents.SupportAgent{})
```

## Suhbat tarixi

Suhbat ish vaqti xabarlarini xotirada saqlaydi. Muvaffaqiyatli `Prompt` dan so'ng, Goravel foydalanuvchi kiritmasini va yordamchi javobini suhbat tarixiga qo'shadi:

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

Ish vaqti xabarlarini bekor qilish va agent tomonidan qaytarilgan boshlang'ich xabarlarni tiklash uchun `Reset` dan foydalaning:

```go
conversation.Reset()
```

## Qo‘shimchalar

Qo‘shimchalar sizga bitta `Prompt` yoki `Stream` chaqiruvi bilan so‘rov doirasidagi hujjatlar va rasmlarni yuborish imkonini beradi. Goravel qo‘shimchalarni umumiy manbalardan kechiktirib (lazy) hal qiladi va ikkilik kontentni suhbat tarixida saqlamaydi.

Qo‘shimchalar misollari quyidagi importlardan foydalanadi:

```go
import (
    "fmt"

    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/ai/document"
    "github.com/goravel/framework/ai/image"
)
```

Fayllarni `WithAttachments` bilan qo‘shing:

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

Qo'llab-quvvatlanadigan biriktiruvchi manbalar:

| Manba             | Hujjat yordamchisi     | Rasm yordamchisi    |
| ----------------- | ---------------------- | ------------------- |
| Bayt              | `document.FromByte`    | `image.FromByte`    |
| String            | `document.FromString`  | -                   |
| Base64            | `document.FromBase64`  | `image.FromBase64`  |
| Reader            | `document.FromReader`  | `image.FromReader`  |
| Mahalliy yo'l     | `document.FromPath`    | `image.FromPath`    |
| Saqlash           | `document.FromStorage` | `image.FromStorage` |
| URL               | `document.FromURL`     | `image.FromURL`     |
| Yuklangan fayl    | `document.FromUpload`  | `image.FromUpload`  |
| Provayder fayl ID | `document.FromID`      | `image.FromID`      |

Aniqlangan MIME turini bekor qilish uchun `WithMimeType` dan foydalaning. Ilova standart bo'lmagan fayl tizimi diskidan o'qilishi kerak bo'lganda `WithDisk` va `FromStorage` dan foydalaning:

```go
attachment := document.FromStorage(
    "reports/monthly.pdf",
    document.WithDisk("s3"),
    document.WithMimeType("application/pdf"),
)
```

Ilova uchun displey sarlavhasini o'rnatish uchun `WithTitle` dan foydalaning. Bu, ayniqsa, satrlar yoki bayt bo'laklaridan ilova yaratishda foydalidir, bunda tabiiy fayl nomi mavjud emas:

```go
attachment := frameworkai.DocumentFromString(
    "The alpha release ships on July 1, 2026.",
    frameworkai.WithMimeType("text/plain"),
    frameworkai.WithTitle("Release Schedule"),
)
```

Ilova tabiiy manbadan (yo'l, URL, saqlash yoki yuklash) olinganda, hal qilingan fayl nomi sarlavhani bekor qiladi. `WithTitle` dan avtomatik aniqlangan nom o'rniga tavsiflovchi yorliq kerak bo'lgan biriktirmalarda foydalaning. Ushbu parametr barcha biriktirma konstruktorlarida mavjud, jumladan `document.WithTitle` va `image.WithTitle`.

`Stream` bir xil biriktirma parametrini qabul qiladi:

```go
stream, err := conversation.Stream("Describe this chart", frameworkai.WithAttachments(
    image.FromPath("storage/app/charts/revenue.png"),
))
```

### Biriktirmalarni yuklash

Agar provayder fayl yuklashni qo'llab-quvvatlasa, uni yuklash va provayder tomonidan boshqariladigan fayl tutqichini olish uchun biriktirmada `Put` ni chaqiring.

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

Yuklashni qo'llab-quvvatlamaydigan provayderlar aniq xato qaytaradi. OpenAI provayderi yuklashni qo'llab-quvvatlaydi va so'rovlar, striming, vosita chaqiruvlari va biriktirmalar uchun Responses API dan foydalanadi.

Provayder tomonidan boshqariladigan faylni qayta yuklamasdan, ID bo'yicha biriktirishingiz mumkin:

```go
file := document.FromID("file-abc123")

response, err := conversation.Prompt("Ushbu faylni xulosa qiling", frameworkai.WithAttachments(file))
if err != nil {
    return err
}
```

Fayl metamaʼlumotlarini yoki mazmunini provayderdan olish uchun `Get` dan foydalaning va provayder tomonidan boshqariladigan faylni o'chirish uchun `Delete` dan foydalaning:

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

## Rasm yaratish

Rasmlarni so'rov bo'yicha yaratish uchun `facades.AI().Image` dan foydalaning:

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

Fluent image requestda provider va modelni o'rnatishingiz mumkin:

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

Yaratilgan rasm javobi baytlar, MIME turi, foydalanish metama'lumotlari, saqlash yordamchilari va `Then` qayta chaqiruvini ochib beradi:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.ImageResponse) {
    facades.Log().Info(response.MimeType())
})
```

Yaratilgan tasvirlarni to'g'ridan-to'g'ri sozlangan fayl tizimiga saqlang:

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("images/gopher.png", "public")
```

Shuningdek, bir qadamda yaratib va saqlashingiz mumkin:

```go
path, err := facades.AI().Image("A Goravel mascot").
    Portrait().
    StoreAs("images/mascot.png", "public")
```

## Audio yaratish

Matndan nutq yaratish uchun `facades.AI().Audio` dan foydalaning:

```go
import (
    "fmt"
    "time"

    "goravel/app/facades"
)

response, err := facades.AI().Audio("Goravelga xush kelibsiz").
    Provider("openai").
    Model("gpt-4o-mini-tts").
    Male().
    Instructions("Sekin va iliq gapiring.").
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

Ayol ovozi uchun `Female`, erkak ovozi uchun `Male`, yoki provayderga xos ovoz uchun `Voice` dan foydalaning:

```go
response, err := facades.AI().Audio("Hisobotingiz tayyor.").
    Voice("alloy").
    Generate()
```

Audio javoblar bayt, MIME turi, foydalanish meta-maʼlumotlari, saqlash yordamchilari va `Then` qayta chaqiruvini taqdim etadi:

```go
import (
    "github.com/goravel/framework/contracts/ai"
    "goravel/app/facades"
)

response.Then(func(response ai.AudioResponse) {
    facades.Log().Info(response.MimeType())
})
```

Yaratilgan audioni to'g'ridan-to'g'ri sozlangan fayl tizimiga saqlang:

```go
path, err := response.Store("public")
if err != nil {
    return err
}

path, err = response.StoreAs("audio/welcome.mp3", "public")
```

Siz shuningdek, bir bosqichda yaratishingiz va saqlashingiz mumkin:

```go
path, err := facades.AI().Audio("Goravelga xush kelibsiz").
    Female().
    StoreAs("audio/welcome.mp3", "public")
```

## Transkripsiya

`facades.AI().Transcription` dan audio fayllarni matnga o‘tkazish uchun foydalaning. Kirish `ai.StorableFile` interfeysini amalga oshirishi kerak, shuning uchun siz hujjat qo‘shimchalarini yoki `FileName`, `MimeType` va `Content` maydonlarini ochib beradigan har qanday maxsus fayl turini qayta ishlatishingiz mumkin:

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

`Segments` dan foydalaning, agar provider vaqt tamg'alari yoki so'zlovchi yorliqlarini qaytarsa:

```go
for _, segment := range response.Segments() {
    fmt.Println(segment.Speaker, segment.Start, segment.End, segment.Text)
}
```

Transkripsiya javoblari transkript matni, ixtiyoriy segmentlar, foydalanish metama'lumotlari va `Then` chaqiruviga ega:

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

Prompt middleware so'rovlarni provayderga yetib borishidan oldin ushlab turadi. Middleware promptni o'zgartirishi, keyingi middleware/provayderni chaqirishi, to'g'ridan-to'g'ri javob qaytarish orqali provayder chaqiruvini qisqa tutashtirishi yoki yakuniy javob mavjud bo'lgandan keyin ishlaydigan qayta chaqiruvlarni ro'yxatdan o'tkazishi mumkin.

Middleware misollari ushbu importlardan foydalanadi:

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

Siz yakuniy javobni `Then` bilan qayta ishlashingiz mumkin:

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

`WithMiddleware` yordamida bitta suhbatga middleware qo'llang:

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

Agent middleware `WithMiddleware` bilan uzatilgan middleware dan oldin ishlaydi. Xuddi shu middleware quvuri `Prompt` va `Stream` tomonidan ishlatiladi, shuning uchun prompt boyitish, suhbat xotirasi, himoya va javob loglash kabi cross-cutting xatti-harakatlar bir joyda joylashishi mumkin.

## Asboblar

Asboblar agentga modelga chaqiriladigan imkoniyatlarni taqdim etishga imkon beradi. Asbob noyob nomga, tavsifga, JSON Schema parametr ta'rifiga va natijani satr sifatida qaytaradigan `Execute` metodiga ega.

Asbobni Artisan yordamida yaratishingiz mumkin:

```shell
./artisan make:tool WeatherTool
./artisan make:tool user/WeatherTool
```

Yaratilgan fayl `app/ai/tools` katalogiga joylashtiriladi. Ichki nomlar subkataloglarni yaratadi va `--force` yoki `-f` mavjud asbob faylini qayta yozadi.

```go
package tools

import "context"

type WeatherTool struct {
}

func (r *WeatherTool) Name() string {
    return "weather_tool"
}

func (r *WeatherTool) Description() string {
    return "Asbobning tavsifi."
}

func (r *WeatherTool) Parameters() map[string]any {
    return nil
}

func (r *WeatherTool) Execute(ctx context.Context, args map[string]any) (string, error) {
    return "", nil
}
```

Asbobni yaratgandan so'ng, ochmoqchi bo'lgan imkoniyat uchun `Description`, `Parameters`, va `Execute` ni yangilang:

```go
type WeatherTool struct {
}

func (r *WeatherTool) Name() string {
    return "get_weather"
}

func (r *WeatherTool) Description() string {
    return "Shahar uchun joriy ob-havoni qaytaradi."
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

    return fmt.Sprintf("Quyoshli, %s da 25 C", city), nil
}
```

Ilovangizning vositalar paketini import qiling, masalan `goravel/app/ai/tools`, so'ngra agentingizning `Tools` usulidan vositani qaytaring:

```go
func (r *SupportAgent) Tools() []ai.Tool {
    return []ai.Tool{
        &tools.WeatherTool{},
    }
}
```

Model `Prompt` vaqtida asbob chaqiruvini so'raganda, Goravel asbobni bajaradi, asbob natijasini suhbatga qo'shadi va model yakuniy matn javobini qaytarmaguncha uni qayta so'raydi:

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

Goravel asbob chaqiruvi siklni cheklaydi, modelning cheksiz asbob so'rashiga yo'l qo'ymaslik uchun.

## Maxsus Generator Yo'llari

Odatiy bo'lib, `make:agent` `app/ai/agents` ga va `make:tool` `app/ai/tools` ga yozadi. Siz bu yo'llarni `bootstrap/app.go` da `WithPaths` bilan sozlashingiz mumkin:

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

## Oqimli

Agar siz token deltalarni ishlab chiqaruvchi tomonidan yaratilgan holda olishni istasangiz, `Stream` dan foydalaning:

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

Streaming `Prompt` kabi bir xil suhbat variantlari, middleware quvur liniyasi va vosita chaqiruv tsiklini qo'llab-quvvatlaydi. Model vositalarni so'raganda, stream `StreamEventTypeToolCall` hodisasini chiqaradi, Goravel vositalarni bajaradi va stream yakuniy model javobi bilan davom etadi. Oqim foydalanuvchi kiritishi, vosita chaqiruvlari, vosita natijalari va yakuniy yordamchi matnini suhbat tarixiga faqat oqim muvaffaqiyatli tugagandan so'ng qo'shadi.

### Tugatish Chaqueruvi

Oqim tugagandan va yakuniy javob mavjud bo'lgandan keyin mantiqni ishga tushirish uchun `Then` dan foydalaning:

```go
stream.Then(func(response ai.AgentResponse) {
    facades.Log().Info(response.Text())
})
```

### HTTP Oqimi

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

Odatiy bo'lib, Goravel SSE hodisalarini `Content-Type: text/event-stream` bilan render qiladi. Siz holat kodi yoki hodisa rendererini moslashtirishingiz mumkin:

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

### Birinchi tomon provayderlari

Goravel quyidagi birinchi tomon AI provayder paketlarini taqdim etadi:

| Provayder | Paket                                                     | O'rnatish buyrug'i                                              |
| --------- | --------------------------------------------------------- | --------------------------------------------------------------- |
| OpenAI    | [goravel/openai](https://github.com/goravel/openai)       | `./artisan to'plami: github.com/goravel/openai ni o'rnating`    |
| Anthropic | [goravel/anthropic](https://github.com/goravel/anthropic) | `./artisan to'plami: github.com/goravel/anthropic ni o'rnating` |
| Gemini    | [goravel/gemini](https://github.com/goravel/gemini)       | `./artisan to'plami: github.com/goravel/gemini ni o'rnating`    |

Provayder paketlari AI provayder shartnomalarini amalga oshiradi va turli imkoniyatlarni qo'llab-quvvatlashi mumkin. Provayder paketining README faylidan qo'llab-quvvatlanadigan xususiyatlar va konfiguratsiya tafsilotlarini tekshiring.

OpenAI provayderi so'rovlar, streaming, vosita chaqiruvi va qo'shimchalar uchun Responses API dan foydalanadi. Shuningdek, u tasvir yaratish, tasvirni tahrirlash, audio yaratish, transkripsiya, media saqlash yordamchilari va provayder tomonidan boshqariladigan fayllarni qo'llab-quvvatlaydi.

### Provayderning uzilish holatiga o'tishi

Agar provayder zanjiri `WithProvider("primary", "backup")` bilan sozlangan bo'lsa, Goravel faqat `ai.FailoverError` ni amalga oshiradigan xatolar uchun keyingi provayderga qayta urinadi. Agar zanjirdagi har bir provayder uzilish xatosi bilan muvaffaqiyatsizlikka uchrasa, oxirgi xato qaytariladi. Oqimli javoblar chiqish boshlanishidan oldin uzilishga o'tishi mumkin; chiqish boshlangandan so'ng, oqim provayderlarni almashtirish o'rniga joriy provayder xatosini qaytaradi.

`ai.providers.openai.failover` ni OpenAI-ga xos xato xabarlari xaritalashlarini qo'shish uchun sozlang:

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

Har bir `failover` kaliti `FailoverError.Reason()` tomonidan qaytarilgan sababdir. Bo'sh sabablar yoki naqshlar e'tiborga olinmaydi. Noto'g'ri muntazam ifodalar provayderni hal qilishda xatolik qaytaradi.

### Maxsus Provayderlar

Siz xuddi `goravel/openai`, `goravel/anthropic` yoki `goravel/gemini` kabi tuzilishga amal qilgan holda maxsus provayder yaratishingiz mumkin: AI provayder shartnomalarini amalga oshiring, xizmat provayderini ro'yxatdan o'tkazing, provayderni hal qiladigan fasadni oching, keyin uni `config/ai.go` da sozlang.

Provayder hal qiluvchi provayderning `via` konfiguratsiyasida `ai.Provider` namunasi yoki `func() (ai.Provider, error)` ni qabul qiladi.

```go
"providers": map[string]any{
    "custom": map[string]any{
        "via": func() (ai.Provider, error) {
            return &CustomProvider{}, nil
        },
    },
},
```

Provayder ham `Prompt`, ham `Stream` ni amalga oshirishi kerak:

```go
import (
    "context"

    "github.com/goravel/framework/contracts/ai"
)

type CustomProvider struct {
}

func (r *CustomProvider) Prompt(ctx context.Context, prompt ai.AgentPrompt) (ai.AgentResponse, error) {
    // Hujjatlar yoki rasmlarni qo'llab-quvvatlovchi provayderlarni chaqirishda prompt.Attachments dan foydalaning.
    // Asboblarni chaqirishni qo'llab-quvvatlovchi provayderlarni chaqirishda prompt.Tools dan foydalaning.
    // Asbob chaqiruvlari davomida provayderga xos holatni saqlash uchun prompt.ProviderState dan foydalaning.
    return nil, nil
}

func (r *CustomProvider) Stream(ctx context.Context, prompt ai.AgentPrompt) (ai.StreamableAgentResponse, error) {
    // Model asboblarni so'raganda, yakuniy oqim javobida asbob chaqiruvlarini qaytaring.
    return nil, nil
}
```

Agent javobining implementatsiyasi `Text` bilan yaratilgan matnni, `Usage` bilan foydalanish metama'lumotlarini, `ToolCalls` bilan so'ralgan asbob chaqiruvlarini va `Then` bilan tugallash callbacklarini ochiq qilishi kerak. Oqim uchun, `StreamEventTypeToolCall` hodisalarini chiqarishda `StreamEvent.ToolCalls` ni to'ldiring.

Maxsus provayderlar provayderga xos qayta urinish mumkin bo'lgan xatolar uchun `frameworkai.NewFailoverError` ni qaytarishi mumkin:

```go
import (
    frameworkai "github.com/goravel/framework/ai"
    "github.com/goravel/framework/contracts/ai"
)

return nil, frameworkai.NewFailoverError("custom", ai.FailoverReason("rate_limited"), err)
```

Ular, shuningdek, `frameworkai.NewFailoverRules` bilan sozlangan `failover` qoidalarini kompilyatsiya qilishlari va mos keladigan xatolarni qaytarishdan oldin ularni o'rashlari mumkin:

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

Rasm yaratishni qo'llab-quvvatlovchi provayderlar `ImageProvider` ni amalga oshirishi kerak:

```go
func (r *CustomProvider) Image(ctx context.Context, prompt ai.ImagePrompt) (ai.ImageResponse, error) {
    // prompt.Prompt, prompt.Model, prompt.Size, prompt.Quality, prompt.Attachments va prompt.Timeout dan foydalaning.
    return nil, nil
}
```

Rasm javobi yaratilgan baytlarni `Content` bilan, MIME turini `MimeType` bilan, foydalanish metama'lumotlarini `Usage` bilan, saqlash yordamchilarini `Store` / `StoreAs` bilan va tugallash chaqiruvlarini `Then` bilan ko'rsatishi kerak.

Audio yaratishni qo'llab-quvvatlovchi provayderlar `AudioProvider` ni amalga oshirishi kerak:

```go
func (r *CustomProvider) Audio(ctx context.Context, prompt ai.AudioPrompt) (ai.AudioResponse, error) {
    // prompt.Prompt, prompt.Model, prompt.Voice, prompt.Instructions va prompt.Timeout dan foydalaning.
    return nil, nil
}
```

Audio javobi yaratilgan baytlarni `Content` bilan, MIME turini `MimeType` bilan, foydalanish metama'lumotlarini `Usage` bilan, saqlash yordamchilarini `Store` / `StoreAs` bilan va tugallash chaqiruvlarini `Then` bilan ko'rsatishi kerak.

Nutqni matnga aylantirishni qo'llab-quvvatlovchi provayderlar `TranscriptionProvider` ni amalga oshirishi kerak:

```go
func (r *CustomProvider) Transcription(ctx context.Context, prompt ai.TranscriptionPrompt) (ai.TranscriptionResponse, error) {
    // prompt.File, prompt.Model, prompt.Language, prompt.Diarize va prompt.Timeout dan foydalaning.
    return nil, nil
}
```

Transkripsiya javobi matnni `Text` bilan, ixtiyoriy vaqt tamg'asi yoki ma'ruzachi segmentlarini `Segments` bilan, foydalanish metama'lumotlarini `Usage` bilan va tugallanish chaqiruvlarini `Then` bilan ochib berishi kerak.

Ilovalarni yuklashni qo'llab-quvvatlovchi provayderlar `FileProvider` ni ham amalga oshirishi kerak:

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

## AI Agentni rivojlantirish mahorati

`goravel-lite` skafoldi AI kodlash agentlariga (Cursor, Copilot, Codex va boshqalar) o'rgatuvchi `.agents/skills/goravel-development/SKILL.md` mahorat faylini o'z ichiga oladi. Goravel loyihalari bilan qanday ishlashni. Mahorat loyiha tuzilmasini, fasadlarni, marshrutlashni, ORMni, testlash konvensiyalarini va Artisan skafolding buyruqlarini o'z ichiga oladi.

AI agent bu mahoratni o'qiganda, u allaqachon biladi:

- Goravel loyihasini boshlash va fasadlarni qo'shish uchun `package:install` dan foydalanish.
- Fasad naqshi, `testify` to'plamlari bilan testlash va mock yordamchilari.
- Kontrollerlar, middleware, modellar, migratsiyalar va boshqalar uchun Artisan `make:*` generatorlari.
- Kontrakt interfeyslari, referent amalga oshirishlar va hujjatlarni qayerdan topish.

### Moslashtirish

Siz o‘rnatilgan ko‘nikmani loyihaga xos qoidalar bilan kengaytirishingiz mumkin, `.agents/skills/goravel-development/CUSTOM.md` faylini yaratib. AI agentlari ikkala faylni avtomatik ravishda o‘qiydi va qo‘llaydi. Loyihangizga xos konventsiyalarni qo‘shing, masalan, afzal ko‘rilgan import aliaslari, domenga xos nomlash yoki maxsus katalog tuzilmalari.

Ko‘nikma `goravel-lite` skafoldi bilan birga versiyalanadi va ramkani yangilaganingizda yangilanadi. Yangilashdan so‘ng, ko‘nikma faylini yangi konventsiyalar uchun ko‘rib chiqing va kerak bo‘lganda `CUSTOM.md` qoidalarini birlashtiring.
