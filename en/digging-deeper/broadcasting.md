# Broadcasting

[[toc]]

## Introduction

Goravel's broadcasting allows you to push realtime, live-updating data to your frontend over WebSockets. Instead of the client polling the server for changes, your backend broadcasts events to named channels, and subscribed clients receive them instantly.

The core concepts are simple: clients connect to channels on the frontend, while your Goravel application broadcasts events to these channels on the backend.

## Installation

The broadcasting facade is not installed by default. Install it with the `package:install` command:

```shell
./artisan package:install Broadcast
```

This creates `config/broadcasting.go` and registers the `broadcasting.ServiceProvider` in `bootstrap/providers.go`.

### Supported Drivers

| Driver   | Description                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `pusher` | Broadcasts to any [Pusher](https://pusher.com/channels) protocol compatible server, such as [Soketi](https://docs.soketi.app/) |
| `log`    | Writes broadcasts to the log, useful for local development                                                                     |
| `null`   | Discards all broadcasts, useful for testing                                                                                    |

## Configuration

The default connection is set by the `BROADCAST_CONNECTION` environment variable:

```go
"default": config.Env("BROADCAST_CONNECTION", "log"),
```

To use the `pusher` driver, configure your credentials in the `.env` file:

```ini
BROADCAST_CONNECTION=pusher
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_APP_KEY="your-pusher-app-key"
PUSHER_APP_SECRET="your-pusher-secret"
PUSHER_HOST=
PUSHER_PORT=443
PUSHER_SCHEME="https"
PUSHER_APP_CLUSTER="mt1"
```

## Defining Broadcast Events

Implement the `ShouldBroadcast` contract from `contracts/broadcasting` on your event struct. It requires four methods:

- `BroadcastOn() []string` — the channel names to broadcast on.
- `BroadcastAs() string` — the event name.
- `BroadcastWith() map[string]any` — the event payload.
- `BroadcastWhen() bool` — whether the event should be broadcast.

```go
package events

import (
  "strconv"

  "github.com/goravel/framework/broadcasting"
)

type OrderShipped struct {
  OrderID int
}

func (e *OrderShipped) BroadcastOn() []string {
  return []string{
    broadcasting.PrivateChannel("orders." + strconv.Itoa(e.OrderID)),
  }
}

func (e *OrderShipped) BroadcastAs() string {
  return "order.shipped"
}

func (e *OrderShipped) BroadcastWith() map[string]any {
  return map[string]any{"order": map[string]any{"id": e.OrderID}}
}

func (e *OrderShipped) BroadcastWhen() bool {
  return true
}
```

`BroadcastOn` returns the channel names to broadcast to, built with the `PublicChannel`, `PrivateChannel`, and `PresenceChannel` helpers. Each helper returns a plain `string` channel name:

| Helper            | Returns (`string`) | Description                                  |
| ----------------- | ------------------ | -------------------------------------------- |
| `PublicChannel`   | `orders`           | Anyone can subscribe                         |
| `PrivateChannel`  | `private-orders`   | Requires authentication and authorization    |
| `PresenceChannel` | `presence-orders`  | Like private, plus exposes who is subscribed |

### Optional Contracts

Implement these optional contracts to customize how events are broadcast:

| Contract                             | Method                               | Purpose                                                                                                              |
| ------------------------------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `ShouldBroadcastNow`                 | `BroadcastNow() bool`                | Broadcast synchronously instead of via the queue                                                                     |
| `ShouldBroadcastWithQueue`           | `BroadcastQueue() string`            | The queue name to use                                                                                                |
| `ShouldBroadcastWithQueueConnection` | `BroadcastQueueConnection() string`  | The queue connection to use                                                                                          |
| `ShouldBroadcastWithConnections`     | `BroadcastConnections() []string`    | The broadcast connections to use                                                                                     |
| `ShouldBroadcastWithDelay`           | `BroadcastDelay() time.Time`         | Delay the broadcast until a given time                                                                               |
| `ShouldBroadcastWithTimeout`         | `BroadcastTimeout() time.Duration`   | Bound how long a broadcast may take                                                                                  |
| `ShouldBroadcastWithTries`           | `BroadcastTries() int`               | The maximum number of attempts for the queued broadcast; `0` (or not implementing the contract) means single-shot    |
| `ShouldBroadcastWithBackoff`         | `BroadcastBackoff() []time.Duration` | The delay before each retry attempt, in order; the last value repeats. Only effective together with `BroadcastTries` |

```go
func (e *OrderShipped) BroadcastNow() bool {
  return true
}

func (e *OrderShipped) BroadcastQueue() string {
  return "broadcasts"
}

// Retry the queued broadcast up to 3 attempts, waiting 10s then 30s
// between attempts (the last backoff value repeats for later attempts).
func (e *OrderShipped) BroadcastTries() int {
  return 3
}

func (e *OrderShipped) BroadcastBackoff() []time.Duration {
  return []time.Duration{10 * time.Second, 30 * time.Second}
}
```

By default, broadcasts are dispatched as [queued jobs](queues.md), so make sure a queue worker is running. Implementing `ShouldBroadcastNow` skips the queue.

## Authorizing Channels

Private and presence channels require authorization. Goravel automatically registers the `/broadcasting/auth` route (configured in the `auth` section of `config/broadcasting.go`) to handle authorization requests.

Register authorization callbacks in `routes/channels.go` with `facades.Broadcast().Channel()`. The callback receives the authenticated user ID and any `{param}` wildcards from the channel name, and returns `(authorized, userInfo)`:

```go
package routes

import (
  "context"

  "goravel/app/facades"
)

func Channels() {
  facades.Broadcast().Channel("orders.{orderId}", func(ctx context.Context, userID any, channelName string, params map[string]string) (bool, any) {
    return userID != nil && params["orderId"] != "", nil
  })
}
```

The second return value is the user info broadcast to other subscribers, and is used by presence channels.

Call `Channels()` during the application bootstrap:

```go
func Boot() contractsfoundation.Application {
  return foundation.Setup().
    WithRouting(func() {
      // ...
      routes.Channels()
    }).
    // ...
}
```

### Channel Classes

For many channels, extract authorization into a class using the `make:channel` command:

```shell
./artisan make:channel OrderChannel
```

This generates a `ChannelAuthFunc` in `app/broadcasting`:

```go
package broadcasting

import (
  "context"

  "github.com/goravel/framework/contracts/broadcasting"
)

func OrderChannel(ctx context.Context, userID any, channelName string, params map[string]string) (bool, any) {
  return false, nil
}

var _ broadcasting.ChannelAuthFunc = OrderChannel
```

Register it in `routes/channels.go`:

```go
facades.Broadcast().Channel("orders.{orderId}", appbroadcasting.OrderChannel)
```

## Dispatching Events

Dispatch an event with `facades.Broadcast().Dispatch()`. The event is broadcast if it implements `ShouldBroadcast`:

```go
package controllers

import (
  "context"

  "github.com/goravel/framework/contracts/http"

  "goravel/app/events"
  "goravel/app/facades"
)

func (c *OrderController) Ship(ctx http.Context) http.Response {
  err := facades.Broadcast().Dispatch(context.Background(), &events.OrderShipped{
    OrderID: 1,
  })
  if err != nil {
    return ctx.Response().String(http.StatusInternalServerError, err.Error())
  }

  return ctx.Response().Success().Json(http.Json{"message": "shipped"})
}
```

## Receiving Broadcasts

Since Goravel's broadcast drivers speak the [Pusher protocol](https://pusher.com/docs/channels/library_auth_reference/pusher-websockets-protocol/), you can receive broadcasts with [Laravel Echo](#laravel-echo) or with a raw WebSocket client.

### Laravel Echo

Install [Laravel Echo](https://github.com/laravel/echo), which wraps the Pusher protocol and works with any Pusher compatible server:

```shell
npm install laravel-echo pusher-js
```

```js
import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

window.Pusher = Pusher

window.Echo = new Echo({
  broadcaster: 'pusher',
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  wsHost: import.meta.env.VITE_PUSHER_HOST,
  wsPort: import.meta.env.VITE_PUSHER_PORT,
  forceTLS: false
})
```

Subscribe to a channel and listen for events:

```js
Echo.channel(`orders.${orderId}`).listen('.order.shipped', (e) => {
  console.log(e.order)
})
```

Note the leading `.` in `.order.shipped`: it tells Echo to use the name from `BroadcastAs` as-is instead of prepending a namespace.

To leave a channel, use `leave`:

```js
Echo.leave(`orders.${orderId}`)
```

### Raw WebSocket

If you don't want to use Echo, you can connect directly with any Pusher protocol WebSocket client. The following examples use the browser's native `WebSocket` API.

#### Connecting

Connect to `/app/{key}`. The connection URL uses your Pusher `key` and the WebSocket host from your broadcasting configuration:

```js
const ws = new WebSocket(
  'ws://127.0.0.1:6001/app/test-key?protocol=7&client=js&version=7.0.0'
)

let socketId = ''

ws.onmessage = (evt) => {
  const msg = JSON.parse(evt.data)

  // Save the socket ID from the connection handshake, it is required for
  // authorizing private and presence channels.
  if (msg.event === 'pusher:connection_established') {
    socketId = JSON.parse(msg.data).socket_id
  }

  // Handle your application's broadcast events.
  if (msg.event === 'order.shipped') {
    console.log(JSON.parse(msg.data))
  }
}
```

#### Subscribing to Public Channels

Send a `pusher:subscribe` message with the channel name. No authorization is needed:

```js
ws.send(
  JSON.stringify({
    event: 'pusher:subscribe',
    data: { channel: 'orders.1' }
  })
)
```

#### Subscribing to Private Channels

Private and presence channels require authorization. First obtain a token from the `/broadcasting/auth` endpoint, posting your `socket_id` and `channel_name`. The request must be authenticated as the current user:

```js
const resp = await fetch('/broadcasting/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    Authorization: jwtToken
  },
  body: `socket_id=${encodeURIComponent(socketId)}&channel_name=${encodeURIComponent(channelName)}`
})

const { auth, channel_data } = await resp.json()
```

Then subscribe with the returned token (and `channel_data` for presence channels):

```js
ws.send(
  JSON.stringify({
    event: 'pusher:subscribe',
    data: {
      channel: channelName,
      auth,
      ...(channel_data ? { channel_data } : {})
    }
  })
)
```

## Presence Channels

Presence channels are private channels that also expose who is subscribed, which makes collaborative features like "who is viewing this page" easy to build.

Authorize presence channels and return the user info to broadcast to other subscribers:

```go
func Channels() {
  facades.Broadcast().Channel("team.{teamId}", func(ctx context.Context, userID any, channelName string, params map[string]string) (bool, any) {
    if userID == nil || params["teamId"] == "" {
      return false, nil
    }

    return true, map[string]any{"id": userID, "name": "Alice"}
  })
}
```

Broadcast to a presence channel by returning a `PresenceChannel` from `BroadcastOn`:

```go
func (e *TeamCreated) BroadcastOn() []string {
  return []string{
    broadcasting.PresenceChannel("team." + strconv.Itoa(e.TeamID)),
  }
}
```

Join a presence channel with Echo's `join` method:

```js
Echo.join(`team.${teamId}`)
  .here((users) => {
    console.log(users)
  })
  .joining((user) => {
    console.log(user.name)
  })
  .leaving((user) => {
    console.log(user.name)
  })
```

With a raw WebSocket client, members are reported through the `pusher_internal:member_added` and `pusher_internal:member_removed` events, and the initial member list arrives in the `pusher_internal:subscription_succeeded` message:

```js
ws.onmessage = (evt) => {
  const msg = JSON.parse(evt.data)
  const data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data

  if (msg.event === 'pusher_internal:subscription_succeeded') {
    console.log('Members:', data.presence.ids)
  }
  if (msg.event === 'pusher_internal:member_added') {
    console.log('Joined:', data.user_info)
  }
  if (msg.event === 'pusher_internal:member_removed') {
    console.log('Left:', data.user_id)
  }
}
```
