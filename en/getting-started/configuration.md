## Introduction

All configuration files of the Goravel framework are stored in the `config` directory. You can view specific instructions and configure flexibly according to project needs.

## Environment Configuration

Running applications in different environments usually requires different configurations. For example, you may want to turn on the Debug mode locally, but you don't need it in the production environment.

Therefore, the framework provides the `.env.example` file in the root directory. You need to copy this file and rename it to `.env` before you start development, and modify the configuration items in the `.env` file according to your project needs.

Note that the `.env` file should not be added to version control, because when multiple people collaborate, different developers may use different configurations, and different deployment environment configurations are different.
In addition, if an intruder gains access to your code repository, there will be a risk of exposing sensitive configuration. If you want to add a new configuration item, you can add it to the `.env.example` file to synchronize the configuration of all developers.

## Environment Variable Types

Support：string、int、bool、empty

## Retrieve Environment Configuration

Use the following method to obtain the configuration items in the `.env` file:

```
// The first parameter is the configuration key, and the second parameter is the default value
facades.Config.Env("APP_NAME", "goravel")
```

## Access Configuration Calues

You can easily use the global `facades.Config` function anywhere in the application to access the configuration values in the `config` directory. The access to the configuration value can use the "." syntax. You can also specify a default value, if the configuration option does not exist, the default value is returned:

```
// Get the configuration of the string type
facades.Config.GetString("app.name", "goravel")

// Get the configuration of the int type
facades.Config.GetInt("app.int", 1)

// Get the configuration of the bool type
facades.Config.GetBool("app.debug", true)
```
