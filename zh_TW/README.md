<div align="center">

<img src="/logo.png" width="300" alt="Logo">

[![Doc](https://pkg.go.dev/badge/github.com/goravel/framework)](https://pkg.go.dev/github.com/goravel/framework)
[![Go](https://img.shields.io/github/go-mod/go-version/goravel/framework)](https://go.dev/)
[![Release](https://img.shields.io/github/release/goravel/framework.svg)](https://github.com/goravel/framework/releases)
[![Test](https://github.com/goravel/framework/actions/workflows/test.yml/badge.svg)](https://github.com/goravel/framework/actions)
[![Report Card](https://goreportcard.com/badge/github.com/goravel/framework)](https://goreportcard.com/report/github.com/goravel/framework)
[![Codecov](https://codecov.io/gh/goravel/framework/branch/master/graph/badge.svg)](https://codecov.io/gh/goravel/framework)
![License](https://img.shields.io/github/license/goravel/framework)

</div>

English | [中文](/zh_TW/README.md)

## 關於 Goravel

Goravel is a full-featured, scalable web application framework that provides a starting scaffold to help Gophers quickly build their applications.

The framework style is consistent with [Laravel](https://laravel.com/), so PHP developers don’t need to learn a new framework and can still enjoy playing around with Golang, in tribute to Laravel!

We welcome stars, PRs, and issues!

## 文檔

在線文檔 [https://www.goravel.dev](https://www.goravel.dev)

示例 [https://github.com/goravel/example](https://github.com/goravel/example)

> To optimize the documentation, please submit a PR to the documentation
> repository [https://github.com/goravel/docs](https://github.com/goravel/docs)

## Main Features

| Module Name                                                                            | Description                                                          |
| -------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| [Artisan Console](https://www.goravel.dev/digging-deeper/artisan-console.html)         | CLI command-line interface for application management and automation |
| [Authentication](https://www.goravel.dev/security/authentication.html)                 | User identity verification with JWT and Session drivers              |
| [Authorization](https://www.goravel.dev/security/authorization.html)                   | Permission-based access control using policies and gates             |
| [Cache](https://www.goravel.dev/digging-deeper/cache.html)                             | Store and retrieve data using memory, Redis, or custom drivers       |
| [Carbon](https://www.goravel.dev/digging-deeper/helpers.html)                          | Helper functions for date and time manipulation                      |
| [Config](https://www.goravel.dev/getting-started/configuration.html)                   | Application configuration management from files and environment      |
| [Crypt](https://www.goravel.dev/security/encryption.html)                              | Secure data encryption and decryption utilities                      |
| [DB](https://www.goravel.dev/database/getting-started.html)                            | Database query builder                                               |
| [Event](https://www.goravel.dev/digging-deeper/event.html)                             | Application event dispatching and listening system                   |
| [Factory](https://www.goravel.dev/orm/factories.html)                                  | Generate fake model data for testing purposes                        |
| [FileStorage](https://www.goravel.dev/digging-deeper/filesystem.html)                  | File upload, download, and storage across multiple drivers           |
| [Grpc](https://www.goravel.dev/the-basics/grpc.html)                                   | High-performance gRPC server and client implementation               |
| [Hash](https://www.goravel.dev/security/hashing.html)                                  | Secure password hashing                                              |
| [Http](https://www.goravel.dev/the-basics/routing.html)                                | HTTP routing, controllers, and middleware management                 |
| [Http Client](https://www.goravel.dev/digging-deeper/http-client.html)                 | Make HTTP requests to external APIs and services                     |
| [Localization](https://www.goravel.dev/digging-deeper/localization.html)               | Multi-language translation and locale management                     |
| [Logger](https://www.goravel.dev/the-basics/logging.html)                              | Application logging to files, console, or external services          |
| [Mail](https://www.goravel.dev/digging-deeper/mail.html)                               | Send emails via SMTP or queue-based delivery                         |
| [Mock](https://www.goravel.dev/testing/mock.html)                                      | Create test mocks for facades and dependencies                       |
| [Migrate](https://www.goravel.dev/database/migrations.html)                            | Version control for database schema changes                          |
| [Orm](https://www.goravel.dev/orm/getting-started.html)                                | Elegant Orm implementation for database operations                   |
| [Package Development](https://www.goravel.dev/digging-deeper/package-development.html) | Build reusable packages to extend framework functionality            |
| [Process](https://www.goravel.dev/digging-deeper/process.html)                         | An expressive and elegant API around Go's standard `os/exec` package |
| [Queue](https://www.goravel.dev/digging-deeper/queues.html)                            | Defer time-consuming tasks to background job processing              |
| [Seeder](https://www.goravel.dev/database/seeding.html)                                | Populate database tables with test or initial data                   |
| [Session](https://www.goravel.dev/the-basics/session.html)                             | Manage user session data across HTTP requests                        |
| [Task Scheduling](https://www.goravel.dev/digging-deeper/task-scheduling.html)         | Schedule recurring tasks using cron-like expressions                 |
| [Testing](https://www.goravel.dev/testing/getting-started.html)                        | HTTP testing, mocking, and assertion utilities                       |
| [Validation](https://www.goravel.dev/the-basics/validation.html)                       | Validate incoming request data using rules                           |
| [View](https://www.goravel.dev/the-basics/views.html)                                  | Template rendering engine for HTML responses                         |

## Compare With Laravel

[For Detail](https://www.goravel.dev/prologue/compare-with-laravel.html)

## 路線圖

[詳情]((https://github.com/goravel/goravel/issues?q=is%3Aissue+is%3Aopen)

## 優秀擴展包

[For Detail](https://www.goravel.dev/getting-started/packages.html)

## 貢獻者

這個項目的存在要歸功於所有做出貢獻的人。 參與貢獻請查看[貢獻指南](getting-started/contributions.md)。 To contribute, please consult the [Contribution Guide](prologue/contributions.md).

<a href="https://github.com/hwbrzzl" target="_blank"><img src="https://avatars.githubusercontent.com/u/24771476?v=4" width="48" height="48"></a> <a href="https://github.com/DevHaoZi" target="_blank"><img src="https://avatars.githubusercontent.com/u/115467771?v=4" width="48" height="48"></a> <a href="https://github.com/kkumar-gcc" target="_blank"><img src="https://avatars.githubusercontent.com/u/84431594?v=4" width="48" height="48"></a> <a href="https://github.com/almas-x" target="_blank"><img src="https://avatars.githubusercontent.com/u/9382335?v=4" width="48" height="48"></a> <a href="https://github.com/merouanekhalili" target="_blank"><img src="https://avatars.githubusercontent.com/u/1122628?v=4" width="48" height="48"></a> <a href="https://github.com/hongyukeji" target="_blank"><img src="https://avatars.githubusercontent.com/u/23145983?v=4" width="48" height="48"></a> <a href="https://github.com/sidshrivastav" target="_blank"><img src="https://avatars.githubusercontent.com/u/28773690?v=4" width="48" height="48"></a> <a href="https://github.com/Juneezee" target="_blank"><img src="https://avatars.githubusercontent.com/u/20135478?v=4" width="48" height="48"></a> <a href="https://github.com/dragoonchang" target="_blank"><img src="https://avatars.githubusercontent.com/u/1432336?v=4" width="48" height="48"></a> <a href="https://github.com/dhanusaputra" target="_blank"><img src="https://avatars.githubusercontent.com/u/35093673?v=4" width="48" height="48"></a> <a href="https://github.com/mauri870" target="_blank"><img src="https://avatars.githubusercontent.com/u/10168637?v=4" width="48" height="48"></a> <a href="https://github.com/Marian0" target="_blank"><img src="https://avatars.githubusercontent.com/u/624592?v=4" width="48" height="48"></a> <a href="https://github.com/ahmed3mar" target="_blank"><img src="https://avatars.githubusercontent.com/u/12982325?v=4" width="48" height="48"></a> <a href="https://github.com/flc1125" target="_blank"><img src="https://avatars.githubusercontent.com/u/14297703?v=4" width="48" height="48"></a> <a href="https://github.com/zzpwestlife" target="_blank"><img src="https://avatars.githubusercontent.com/u/12382180?v=4" width="48" height="48"></a> <a href="https://github.com/juantarrel" target="_blank"><img src="https://avatars.githubusercontent.com/u/7213379?v=4" width="48" height="48"></a> <a href="https://github.com/Kamandlou" target="_blank"><img src="https://avatars.githubusercontent.com/u/77993374?v=4" width="48" height="48"></a> <a href="https://github.com/livghit" target="_blank"><img src="https://avatars.githubusercontent.com/u/108449432?v=4" width="48" height="48"></a> <a href="https://github.com/jeff87218" target="_blank"><img src="https://avatars.githubusercontent.com/u/29706585?v=4" width="48" height="48"></a> <a href="https://github.com/shayan-yousefi" target="_blank"><img src="https://avatars.githubusercontent.com/u/19957980?v=4" width="48" height="48"></a> <a href="https://github.com/zxdstyle" target="_blank"><img src="https://avatars.githubusercontent.com/u/38398954?v=4" width="48" height="48"></a> <a href="https://github.com/milwad-dev" target="_blank"><img src="https://avatars.githubusercontent.com/u/98118400?v=4" width="48" height="48"></a> <a href="https://github.com/mdanialr" target="_blank"><img src="https://avatars.githubusercontent.com/u/48054961?v=4" width="48" height="48"></a> <a href="https://github.com/KlassnayaAfrodita" target="_blank"><img src="https://avatars.githubusercontent.com/u/113383200?v=4" width="48" height="48"></a> <a href="https://github.com/YlanzinhoY" target="_blank"><img src="https://avatars.githubusercontent.com/u/102574758?v=4" width="48" height="48"></a> <a href="https://github.com/gouguoyin" target="_blank"><img src="https://avatars.githubusercontent.com/u/13517412?v=4" width="48" height="48"></a> <a href="https://github.com/dzham" target="_blank"><img src="https://avatars.githubusercontent.com/u/10853451?v=4" width="48" height="48"></a> <a href="https://github.com/praem90" target="_blank"><img src="https://avatars.githubusercontent.com/u/6235720?v=4" width="48" height="48"></a> <a href="https://github.com/vendion" target="_blank"><img src="https://avatars.githubusercontent.com/u/145018?v=4" width="48" height="48"></a> <a href="https://github.com/tzsk" target="_blank"><img src="https://avatars.githubusercontent.com/u/13273787?v=4" width="48" height="48"></a> <a href="https://github.com/ycb1986" target="_blank"><img src="https://avatars.githubusercontent.com/u/12908032?v=4" width="48" height="48"></a> <a href="https://github.com/BadJacky" target="_blank"><img src="https://avatars.githubusercontent.com/u/113529280?v=4" width="48" height="48"></a> <a href="https://github.com/NiteshSingh17" target="_blank"><img src="https://avatars.githubusercontent.com/u/79739154?v=4" width="48" height="48"></a> <a href="https://github.com/alfanzain" target="_blank"><img src="https://avatars.githubusercontent.com/u/4216529?v=4" width="48" height="48"></a> <a href="https://github.com/oprudkyi" target="_blank"><img src="https://avatars.githubusercontent.com/u/3018472?v=4" width="48" height="48"></a> <a href="https://github.com/zoryamba" target="_blank"><img src="https://avatars.githubusercontent.com/u/21248500?v=4" width="48" height="48"></a> <a href="https://github.com/oguzhankrcb" target="_blank"><img src="https://avatars.githubusercontent.com/u/7572058?v=4" width="48" height="48"></a> <a href="https://github.com/ChisThanh" target="_blank"><img src="https://avatars.githubusercontent.com/u/93512710?v=4" width="48" height="48"></a>

## 贊助商

更好的項目開發離不開您的支持，請通過 [Open Collective](https://opencollective.com/goravel) 獎勵我們。

<p align="left"><img src="/reward.png" width="200"></p>

## 分組

歡迎更多在 Discord 的討論。

[https://discord.gg/cFc5csczzS](https://discord.gg/cFc5csczzS)

## 許可證

Goravel 框架是根據 [MIT 許可證](https://opensource.org/licenses/MIT) 開源軟件。
