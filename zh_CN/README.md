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

[English](../README.md) | 中文

## 关于 Goravel

Goravel 是一个功能齐全、可扩展的 Web 应用程序框架，提供了一个起始脚手架，帮助 Gophers 快速构建他们的应用程序。

该框架的风格与 [Laravel](https://laravel.com/) 保持一致，因此 PHP 开发者无需学习新的框架，仍可享受使用 Golang 的乐趣，以此致敬 Laravel！

欢迎 Star、PR 和 Issues！

## 文档

在线文档 [https://www.goravel.dev/zh_CN](https://www.goravel.dev/zh_CN)

示例 [https://github.com/goravel/example](https://github.com/goravel/example)

> 优化文档，请提交 PR 至文档仓库 [https://github.com/goravel/docs](https://github.com/goravel/docs)

## 主要特性

| 模块名称                                                                           | 描述                             |
| ------------------------------------------------------------------------------ | ------------------------------ |
| [Artisan 命令行](https://www.goravel.dev/digging-deeper/artisan-console.html)     | 用于应用程序管理和自动化的 CLI 命令行界面        |
| [用户认证](https://www.goravel.dev/security/authentication.html)                   | 使用 JWT 和 Session 驱动进行用户身份验证    |
| [用户授权](https://www.goravel.dev/security/authorization.html)                    | 基于权限的访问控制，使用策略和门               |
| [缓存](https://www.goravel.dev/digging-deeper/cache.html)                        | 使用内存、Redis 或自定义驱动存储和检索数据       |
| [Carbon](https://www.goravel.dev/digging-deeper/helpers.html)                  | 用于日期和时间操作的辅助函数                 |
| [自定义配置](https://www.goravel.dev/getting-started/configuration.html)            | 从文件和环境中管理应用程序配置                |
| [Crypt](https://www.goravel.dev/security/encryption.html)                      | 安全的数据加密和解密工具                   |
| [DB](https://www.goravel.dev/database/getting-started.html)                    | 数据库查询构建器                       |
| [事件系统](https://www.goravel.dev/digging-deeper/event.html)                      | 应用程序事件分发和监听系统                  |
| [Factory](https://www.goravel.dev/orm/factories.html)                          | 为测试目的生成虚假模型数据                  |
| [文件存储](https://www.goravel.dev/digging-deeper/filesystem.html)                 | 跨多个驱动的文件上传、下载和存储               |
| [Grpc](https://www.goravel.dev/the-basics/grpc.html)                           | 高性能 gRPC 服务器和客户端实现             |
| [Hash](https://www.goravel.dev/security/hashing.html)                          | 安全的密码哈希                        |
| [HTTP 服务](https://www.goravel.dev/the-basics/routing.html)                     | HTTP 路由、控制器和中间件管理              |
| [Http Client](https://www.goravel.dev/digging-deeper/http-client.html)         | 向外部 API 和服务发送 HTTP 请求          |
| [本地化](https://www.goravel.dev/digging-deeper/localization.html)                | 多语言翻译和区域设置管理                   |
| [日志](https://www.goravel.dev/the-basics/logging.html)                          | 应用程序日志记录到文件、控制台或外部服务           |
| [邮件](https://www.goravel.dev/digging-deeper/mail.html)                         | 通过 SMTP 或基于队列的投递发送电子邮件         |
| [Mock](https://www.goravel.dev/testing/mock.html)                              | 为门面和依赖项创建测试模拟                  |
| [数据库迁移](/zh_CNhttps://www.goravel.dev/database/migrations.html)                | 数据库模式变更的版本控制                   |
| [数据库 ORM](/zh_CNhttps://www.goravel.dev/orm/getting-started.html)              | 优雅的 ORM 实现，用于数据库操作             |
| [扩展包开发](/zh_CNhttps://www.goravel.dev/digging-deeper/package-development.html) | 构建可复用的扩展包以增强框架功能               |
| [进程](https://www.goravel.dev/digging-deeper/process.html)                      | 围绕 Go 标准 `os/exec` 包的表达性优雅 API |
| [队列](/zh_CNhttps://www.goravel.dev/digging-deeper/queues.html)                 | 将耗时任务推迟到后台作业处理                 |
| [数据填充](https://www.goravel.dev/database/seeding.html)                          | 用测试或初始数据填充数据库表                 |
| [Session](/zh_CNhttps://www.goravel.dev/the-basics/session.html)               | 跨 HTTP 请求管理用户会话数据              |
| [任务调度](/zh_CNhttps://www.goravel.dev/digging-deeper/task-scheduling.html)      | 使用类 cron 表达式调度重复任务             |
| [测试](/zh_CNhttps://www.goravel.dev/testing/getting-started.html)               | HTTP 测试、模拟和断言工具                |
| [表单验证](/zh_CNhttps://www.goravel.dev/the-basics/validation.html)               | 使用规则验证传入的请求数据                  |
| [视图](https://www.goravel.dev/the-basics/views.html)                            | 用于 HTML 响应的模板渲染引擎              |

## 与 Laravel 对比

[详见文件](https://www.goravel.dev/prologue/compare-with-laravel.html)

## 路线图

[For Detail](https://github.com/goravel/goravel/issues?q=is%3Aissue+is%3Aopen)

## 优秀扩展包

[详见文件](https://www.goravel.dev/getting-started/packages.html)

## Contributors

这个项目的存在要归功于所有做出贡献的人。 参与贡献请查看[贡献指南](prologue/contributions.md)。

<a href="https://github.com/hwbrzzl" target="_blank"><img src="https://avatars.githubusercontent.com/u/24771476?v=4" width="48" height="48"></a> <a href="https://github.com/DevHaoZi" target="_blank"><img src="https://avatars.githubusercontent.com/u/115467771?v=4" width="48" height="48"></a> <a href="https://github.com/kkumar-gcc" target="_blank"><img src="https://avatars.githubusercontent.com/u/84431594?v=4" width="48" height="48"></a> <a href="https://github.com/almas-x" target="_blank"><img src="https://avatars.githubusercontent.com/u/9382335?v=4" width="48" height="48"></a> <a href="https://github.com/merouanekhalili" target="_blank"><img src="https://avatars.githubusercontent.com/u/1122628?v=4" width="48" height="48"></a> <a href="https://github.com/hongyukeji" target="_blank"><img src="https://avatars.githubusercontent.com/u/23145983?v=4" width="48" height="48"></a> <a href="https://github.com/sidshrivastav" target="_blank"><img src="https://avatars.githubusercontent.com/u/28773690?v=4" width="48" height="48"></a> <a href="https://github.com/Juneezee" target="_blank"><img src="https://avatars.githubusercontent.com/u/20135478?v=4" width="48" height="48"></a> <a href="https://github.com/dragoonchang" target="_blank"><img src="https://avatars.githubusercontent.com/u/1432336?v=4" width="48" height="48"></a> <a href="https://github.com/dhanusaputra" target="_blank"><img src="https://avatars.githubusercontent.com/u/35093673?v=4" width="48" height="48"></a> <a href="https://github.com/mauri870" target="_blank"><img src="https://avatars.githubusercontent.com/u/10168637?v=4" width="48" height="48"></a> <a href="https://github.com/Marian0" target="_blank"><img src="https://avatars.githubusercontent.com/u/624592?v=4" width="48" height="48"></a> <a href="https://github.com/ahmed3mar" target="_blank"><img src="https://avatars.githubusercontent.com/u/12982325?v=4" width="48" height="48"></a> <a href="https://github.com/flc1125" target="_blank"><img src="https://avatars.githubusercontent.com/u/14297703?v=4" width="48" height="48"></a> <a href="https://github.com/zzpwestlife" target="_blank"><img src="https://avatars.githubusercontent.com/u/12382180?v=4" width="48" height="48"></a> <a href="https://github.com/juantarrel" target="_blank"><img src="https://avatars.githubusercontent.com/u/7213379?v=4" width="48" height="48"></a> <a href="https://github.com/Kamandlou" target="_blank"><img src="https://avatars.githubusercontent.com/u/77993374?v=4" width="48" height="48"></a> <a href="https://github.com/livghit" target="_blank"><img src="https://avatars.githubusercontent.com/u/108449432?v=4" width="48" height="48"></a> <a href="https://github.com/jeff87218" target="_blank"><img src="https://avatars.githubusercontent.com/u/29706585?v=4" width="48" height="48"></a> <a href="https://github.com/shayan-yousefi" target="_blank"><img src="https://avatars.githubusercontent.com/u/19957980?v=4" width="48" height="48"></a> <a href="https://github.com/zxdstyle" target="_blank"><img src="https://avatars.githubusercontent.com/u/38398954?v=4" width="48" height="48"></a> <a href="https://github.com/milwad-dev" target="_blank"><img src="https://avatars.githubusercontent.com/u/98118400?v=4" width="48" height="48"></a> <a href="https://github.com/mdanialr" target="_blank"><img src="https://avatars.githubusercontent.com/u/48054961?v=4" width="48" height="48"></a> <a href="https://github.com/KlassnayaAfrodita" target="_blank"><img src="https://avatars.githubusercontent.com/u/113383200?v=4" width="48" height="48"></a> <a href="https://github.com/YlanzinhoY" target="_blank"><img src="https://avatars.githubusercontent.com/u/102574758?v=4" width="48" height="48"></a> <a href="https://github.com/gouguoyin" target="_blank"><img src="https://avatars.githubusercontent.com/u/13517412?v=4" width="48" height="48"></a> <a href="https://github.com/dzham" target="_blank"><img src="https://avatars.githubusercontent.com/u/10853451?v=4" width="48" height="48"></a> <a href="https://github.com/praem90" target="_blank"><img src="https://avatars.githubusercontent.com/u/6235720?v=4" width="48" height="48"></a> <a href="https://github.com/vendion" target="_blank"><img src="https://avatars.githubusercontent.com/u/145018?v=4" width="48" height="48"></a> <a href="https://github.com/tzsk" target="_blank"><img src="https://avatars.githubusercontent.com/u/13273787?v=4" width="48" height="48"></a> <a href="https://github.com/ycb1986" target="_blank"><img src="https://avatars.githubusercontent.com/u/12908032?v=4" width="48" height="48"></a> <a href="https://github.com/BadJacky" target="_blank"><img src="https://avatars.githubusercontent.com/u/113529280?v=4" width="48" height="48"></a> <a href="https://github.com/NiteshSingh17" target="_blank"><img src="https://avatars.githubusercontent.com/u/79739154?v=4" width="48" height="48"></a> <a href="https://github.com/alfanzain" target="_blank"><img src="https://avatars.githubusercontent.com/u/4216529?v=4" width="48" height="48"></a> <a href="https://github.com/oprudkyi" target="_blank"><img src="https://avatars.githubusercontent.com/u/3018472?v=4" width="48" height="48"></a> <a href="https://github.com/zoryamba" target="_blank"><img src="https://avatars.githubusercontent.com/u/21248500?v=4" width="48" height="48"></a> <a href="https://github.com/oguzhankrcb" target="_blank"><img src="https://avatars.githubusercontent.com/u/7572058?v=4" width="48" height="48"></a> <a href="https://github.com/ChisThanh" target="_blank"><img src="https://avatars.githubusercontent.com/u/93512710?v=4" width="48" height="48"></a>

## 打赏

开源项目的发展离不开你的支持，感谢微信打赏。

<p align="left"><img src="/reward.png" width="200"></p>

## 群组

微信入群，请备注 Goravel。

<p align="left"><img src="/wechat.jpg" width="200"></p>

## 开源许可

Goravel 框架是在 [MIT 许可](https://opensource.org/licenses/MIT) 下的开源软件。
