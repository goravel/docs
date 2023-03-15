# Service Providers

[[toc]]

## Introduction

The most important thing in the kernel boot operation is to load the `Service Provider`. All `Service Provider` under the application are configured in the `providers` array in the `config/app.go` file.

First, the kernel will call the `Register` methods of all service providers. After all service providers have been registered, the kernel will call the `Boot` methods of all `Service Provider` again.

The `Service Provider` is the key in the life cycle of Goravel. They enables the framework to contain various components, such as routing, database, queue, cache, etc.
 
You can also customize your own provider, it can be stored under `app/providers` and registered in the `providers` array in `config/app.go`.

The framework defaults a blank service provider `app/providers/app_service_provider.go`, you can add some simple boot logic here. In large projects, you can create new service providers to gain finer granular control.

<CommentService/>