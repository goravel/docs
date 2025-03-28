# HTTP Client

[[toc]]

## Introduction

In software development, there are many instances when you need to call an API to fetch data—
whether it's connecting to a microservice or accessing a third-party API. In such cases, 
Goravel offers an easy-to-use, expressive, and minimalist API built on the standard `net/http` library, 
all designed to enhance the developer experience.

## Configuration

Goravel's HTTP client is built on top of the `net/http.Client` for making HTTP requests. If you need to tweak its internal settings, 
just update the `client` property in the `config/http.go` file. 
Here are the available configuration options:
- `base_url`:  Sets the root URL for relative paths. Automatically prefixes requests that don't start with `http://` or `https://`.
- `timeout`(`DEFAULT`: `30s`): Global timeout duration for complete request lifecycle (connection + any redirects + reading the response body). A Timeout of zero means no timeout.
- `max_idle_conns`: Maximum number of idle (keep-alive) connections across all hosts. Zero means no limit.
- `max_idle_conns_per_host`: Maximum idle (keep-alive) connections to keep per-host
- `max_conns_per_host`: Limits the total number of connections per host, including connections in the dialing, active, and idle states. Zero means no limit.
- `idle_conn_timeout`:  Maximum amount of the time of an idle (keep-alive) connection will remain idle before closing itself.
```go
"client": map[string]any{
    "base_url":                config.GetString("HTTP_CLIENT_BASE_URL"),  // "https://api.example.com"
    "timeout":                 config.GetDuration("HTTP_CLIENT_TIMEOUT"), // 30 * time.Second
    "max_idle_conns":          config.GetInt("HTTP_CLIENT_MAX_IDLE_CONNS"), // 100
    "max_idle_conns_per_host": config.GetInt("HTTP_CLIENT_MAX_IDLE_CONNS_PER_HOST"), // 10
    "max_conns_per_host":      config.GetInt("HTTP_CLIENT_MAX_CONN_PER_HOST"), // 0
    "idle_conn_timeout":       config.GetDuration("HTTP_CLIENT_IDLE_CONN_TIMEOUT"), // 90 * time.Second
}
```