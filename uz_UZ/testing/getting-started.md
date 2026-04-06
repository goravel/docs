# Boshlash

[[toc]]

## Kirish

Goravelning testlash funksiyasi Golangning rasmiy test komponentiga tayanadi, birlik testlarini kengaytirib, integratsion testlarni qo‘llab-quvvatlaydi va ilova mustahkamligini oshiradi.

## Muhit

### Maxsus Muhit Fayli

Standart bo‘yicha, testlash paytida konfiguratsiya ma’lumotlarini kiritish uchun ildiz katalogidagi `.env` fayli ishlatiladi. Agar turli paketlar uchun turli `.env` fayllaridan foydalanmoqchi bo‘lsangiz, paket katalogida `.env` faylini yaratishingiz mumkin va test avval bu faylni o‘qiydi.

```
- /app
- /config
- ...
- /test
  - /feature
    - .env
    - user_test.go
- .env
```

Bundan tashqari, loyihangizning ildizida `.env.testing` faylini yaratishingiz mumkin. Bu fayl `go test` buyrug‘ini `--env` opsiyasi bilan ishga tushirganda `.env` fayli o‘rniga ishlatiladi, eslatma, bu opsiya test katalogini kuzatishi kerak, masalan:

```shell
go test ./... --env=.env.testing
go test ./... -e=.env.testing
```

### `TestCase` Strukturasi

Goravelda `TestCase` Strukturasi mavjud va bu Struktura kelajakda qulay test usullarini taqdim etadi, bundan tashqari, bir xil faylda `init` usuli mavjud, bu usul testni ishga tushirishdan oldin Goravel ilovasini ro‘yxatdan o‘tkazishni yo‘naltiradi. Siz testdan oldin bajarilishi kerak bo‘lgan har qanday zarur mantiqni ushbu usulga kiritishingiz mumkin.

## Testlarni Yaratish

Yangi test holatini yaratish uchun `make:test` Artisan buyrug‘idan foydalaning:

```shell
./artisan make:test feature/UserTest
```

Bizning test holatlarimiz standart bo‘yicha [stretchr/testify](https://github.com/stretchr/testify) paketining `suite` funksiyasidan foydalanib yozilgan. Bu funksiya bizga testdan oldingi, testdan keyingi, kichik test va tasdiqlash kabi narsalarni sozlash imkonini beradi, bu esa yaxshi tashkil etilgan test holatlariga olib keladi. Qo‘shimcha ma’lumot uchun iltimos, rasmiy hujjatlarga murojaat qiling.

```go
package feature

import (
  "testing"

  "github.com/stretchr/testify/suite"

  "goravel/tests"
)

type ExampleTestSuite struct {
  suite.Suite
  tests.TestCase
}

func TestExampleTestSuite(t *testing.T) {
  suite.Run(t, new(ExampleTestSuite))
}

// SetupTest will run before each test in the suite.
func (s *ExampleTestSuite) SetupTest() {
}

// TearDownTest will run after each test in the suite.
func (s *ExampleTestSuite) TearDownTest() {
}

func (s *ExampleTestSuite) TestIndex() {
  s.True(true)
}
```

## Ma'lumotlar Bazasi Testi

Goravel model zavodlari va Seeders ilova modeli uchun test ma'lumotlar bazasi yozuvlarini osonlik bilan yaratishi mumkin.

### Zavodlar

Agar siz testlar o‘tkazayotgan bo‘lsangiz, testni ishga tushirishdan oldin ma'lumotlar bazangizga ba’zi yozuvlar qo‘shish kerak bo‘lishi mumkin. Test ma’lumotlarini yaratish uchun har bir ustunning qiymatlarini qo‘lda kiritishingiz shart emas. Goravel bilan siz [zavodlar](../orm/factories.md) orqali modellaringiz uchun standart atributlarni o‘rnatishingiz mumkin.

```go
var user models.User
err := facades.Orm().Factory().Create(&user)
```

### Seederlarni Ishga Tushirish

Agar xususiyat testi davomida ma'lumotlar bazangizni to‘ldirish uchun [ma'lumotlar bazasi seeders](../database/seeding.md) dan foydalanmoqchi bo‘lsangiz, `Seed` usulini chaqirishingiz mumkin. Standart bo‘yicha, `Seed` usuli `DatabaseSeeder` ni bajaradi, bu esa boshqa barcha seederlaringizni bajarishi kerak. Yoki, `Seed` usuliga aniq bir seeder strukturasini o‘tkazishingiz mumkin:

```go
package feature

import (
	"testing"

	"github.com/stretchr/testify/suite"

	"goravel/database/seeders"
	"goravel/tests"
)

type ExampleTestSuite struct {
	suite.Suite
	tests.TestCase
}

func TestExampleTestSuite(t *testing.T) {
	suite.Run(t, new(ExampleTestSuite))
}

// SetupTest will run before each test in the suite.
func (s *ExampleTestSuite) SetupTest() {
}

// TearDownTest will run after each test in the suite.
func (s *ExampleTestSuite) TearDownTest() {
}

func (s *ExampleTestSuite) TestIndex() {
  // Run the DatabaseSeeder...
	s.Seed()

  // Run multiple specific seeders...
	s.Seed(&seeders.UserSeeder{}, &seeders.PhotoSeeder{})
}
```

### Docker-dan Foydalanish

`go test` dan foydalanganda, bir nechta paketlar parallel ravishda testlanadi. Natijada, mahalliy ma'lumotlar bazasi yoki keshdagi test holatida ma'lumotlar bazasi yoki keshlarni yangilash boshqa parallel test holatlariga ta’sir qilishi mumkin. Buni hal qilish uchun Goravel Docker asosidagi testlarni taklif qiladi. Docker bilan, ma'lumotlar bazasi yoki keshlash tasviri yaratilishi va turli paketlar orasida mustaqil ravishda ishlatilishi mumkin.

> Windows tizimi uchun Docker tasvirining cheklangan qo‘llab-quvvatlanishi tufayli, hozirda Docker testi faqat Windows bo‘lmagan muhitlarda ishga tushirilishi mumkin.

#### Docker-ni Ishlatish

Siz tasvir yaratish uchun `Database` yoki `Cache` usulidan foydalanishingiz mumkin yoki ushbu usulga ulanish nomini o‘tkazishingiz mumkin:

```go
database, err := facades.Testing().Docker().Database()
database, err := facades.Testing().Docker().Database("postgres")

cache, err := facades.Testing().Docker().Cache()
cache, err := facades.Testing().Docker().Cache("redis")
```

Shuningdek, siz tasvirni sozlash uchun `Image` usulidan foydalanishingiz mumkin:

```go
import contractstesting "github.com/goravel/framework/contracts/testing"

image, err := facades.Testing().Docker().Image(contractstesting.Image{
  Repository: "mysql",
  Tag:        "5.7",
  Env: []string{
    "MYSQL_ROOT_PASSWORD=123123",
    "MYSQL_DATABASE=goravel",
  },
  ExposedPorts: []string{"3306"},
})
```

#### Tasvirni Yaratish

Tasvir ishga tushirilgandan so‘ng, tasvirni yaratish uchun `Build` usulidan foydalanishingiz mumkin:

```go
err := database.Build()
err := cache.Build()
```

Bu vaqtda siz `docker ps` buyrug‘i yordamida tasvir tizimda allaqachon ishlayotganini ko‘rishingiz mumkin va `Config` usuli orqali ma'lumotlar bazasining konfiguratsiya ma’lumotlarini olishingiz mumkin, bu ulanishni sozlashni osonlashtiradi:

```go
config := database.Config()
config := cache.Config()
```

#### Seederlarni Ishga Tushirish

Agar testlash davomida ma'lumotlar bazasini to‘ldirish uchun [seeder](../database/seeding.md) dan foydalanmoqchi bo‘lsangiz, `Seed` usulini chaqirishingiz mumkin. Standart bo‘yicha, `Seed` usuli `DatabaseSeeder` ni bajaradi, bu esa boshqa barcha seederlaringizni bajarishi kerak. Yoki, `Seed` usuliga aniq bir seeder strukturasini o‘tkazishingiz mumkin:

```go
err := database.Seed()
err := database.Seed(&seeders.UserSeeder{})
```

#### Ma'lumotlar Bazasi yoki Keshlashni Yangilash

Bir xil paketdagi test holatlari ketma-ket bajarilganligi sababli, bitta test holati ishlagandan keyin ma'lumotlar bazasi yoki keshlashni yangilash salbiy ta’sir ko‘rsatmaydi, biz `Fresh` usulidan foydalanishimiz mumkin:

```go
err := database.Fresh()
err := cache.Fresh()
```

Ma'lumotlar bazasi uchun, shuningdek, `RefreshDatabase` usulidan foydalanishingiz mumkin:

```go
package feature

import (
	"testing"

	"github.com/stretchr/testify/suite"

	"goravel/tests"
)

type ExampleTestSuite struct {
	suite.Suite
	tests.TestCase
}

func TestExampleTestSuite(t *testing.T) {
	suite.Run(t, new(ExampleTestSuite))
}

// SetupTest will run before each test in the suite.
func (s *ExampleTestSuite) SetupTest() {
  s.RefreshDatabase()
}

// TearDownTest will run after each test in the suite.
func (s *ExampleTestSuite) TearDownTest() {
}

func (s *ExampleTestSuite) TestIndex() {
}
```

#### Tasvirni O‘chirish

Kichik paketdagi test holatlari bajarilgandan so‘ng, tasvir bir soat ichida avtomatik ravishda o‘chiriladi, shuningdek, tasvirni qo‘lda o‘chirish uchun `Shutdown` usulidan foydalanishingiz mumkin.

```go
err := database.Shutdown()
```

#### Misol

Biz kichik paketda `TestMain` usulini yaratishimiz va test holatining oldingi mantiqini qo‘shishimiz mumkin:

```go
// tests/feature/main_test.go
package feature

import (
  "fmt"
  "os"
  "testing"

  "goravel/app/facades"
  "goravel/database/seeders"
)

func TestMain(m *testing.M) {
  database, err := facades.Testing().Docker().Database()
  if err != nil {
    panic(err)
  }

  if err := database.Build(); err != nil {
    panic(err)
  }
  if err := database.Ready(); err != nil {
    panic(err)
  }
  if err := database.Migrate(); err != nil {
    panic(err)
  }

  if err := facades.App().Restart(); err != nil {
    panic(err)
  }

  // Execute test cases
  exit := m.Run()

  // Uninstall the image after all test cases have been run
  if err := database.Shutdown(); err != nil {
    panic(err)
  }

  os.Exit(exit)
}
```

> TestMain usulining ko‘proq qo‘llanilishi uchun [Rasmiy Hujjat](https://pkg.go.dev/testing#hdr-Main) ga qarang.
