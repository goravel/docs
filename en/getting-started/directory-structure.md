# Directory Structure

[[toc]]

## Introduction

The default file structure can make you better start project advancement, and you can also add new folders freely, but do not modify the default folders.

## Root Directory

### `app` Directory

`app` contains the core code of the program. Almost all the logic in the program will be in this folder.

### `bootstrap` Directory

The `bootstrap` directory contains the framework startup file `app.go`.

### `config` Directory

The `config` directory contains all configuration files of the application. It is best to browse through these files and familiarize yourself with all the available options.

### `database` Directory

The `database` directory contains database migration files.

### `public` Directory

The `public` directory contains some static resources, such as images, certificates, etc.

### `resources` Directory

The `resources` directory contains your [views](../the-basics/views.md) as well as your raw, un-compiled assets such as CSS or JavaScript.

### `routes` Directory

The `routes` directory contains all the route definitions of the application.

### `storage` Directory

The `storage` directory contains the `logs` directory, and the `logs` directory contains the application log files.

### `tests` Directory

The `tests` directory contains your automated tests.

## `app` Directory

### `console` Directory

The `console` directory contains all the custom `Artisan` commands of the application, and the console boot file `kernel.go`, which can be registered in this file [Task Scheduling](../digging-deeper/task-scheduling.md)

### `http` Directory

The `http` directory contains controllers, middleware, etc., and almost all requests that enter the application via the Web are processed here.

### `grpc` Directory

The `grpc` directory contains controllers, middleware, etc., and almost all requests that enter the application via the Grpc are processed here.

### `models` Directory

The `models` directory contains all data models.

### `providers` Directory

The `providers` directory contains all [Service Providers](../architecture-concepts/service-providers.md) in the program. The service provider guides the application to respond to incoming requests by binding services, registering for events, or performing any other tasks.
