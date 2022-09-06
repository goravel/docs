## Introduction

The most important thing in the kernel boot operation is to load the `Servier Providers`. All `Servier Providers` under the application are configured in the `providers` slice in the `config/app.go` file.

First, the kernel will first call the `Register` methods of all service providers. After all service providers have been registered, the kernel will call the `Boot` methods of all `Servier Providers` again.

The `Servier Providers` is the key in the life cycle of Goravel. The `Servier Providers` enables the framework to contain various components, such as routing, database, queue, cache, etc.
 
You can also customize your own provider, which can be stored under `app/providers` and registered in the `providers` slice in `config/app.go`.

The framework defaults to a blank service provider `app/providers/app_service_provider.go`, you can add some simple boot logic here. In large projects, you can create new service providers to gain finer granular control.