# Socket[For Detail](https://github.com/hulutech-web/goravel-socket)

## Introduction
Socket is a websocket extension package for Goravel, facilitating integration into Goravel projects. The extension provides convenient websocket functionalities commonly used in Goravel projects, including registering system IDs, binding client IDs, grouping, sending messages to specific groups, sending messages to clients, etc. Developers can add business data to messages as needed.

## Usage Instructions
### 1. Add to Providers Array in the `config/app.go` File in the Goravel Project
```go
import Socket "goravel/packages/socket"
```
``` go
&Socket.ServiceProvider{},
```
### 2. Add to web.go File in the router Directory in the Goravel Project
```go
import 	"goravel/packages/socket/servers"
func Web() {
    websocketHandler := &servers.Controller{}
    facades.Route().Get("/ws", websocketHandler.Run)
    go servers.Manager.Start()
}
```
### 3. Access the Path /ws
Business Flow
Register a region, system ID, which must be unique and a random value. It needs to be cached.  
Connect to the WebSocket. You need to carry the system ID header information. Upon successful connection, it returns a client ID, which is cached locally. At this point, messages like "xxx is online" or "xxx is offline" might appear. Store the client ID of each online person in the local cache for easy message sending based on the client.  
Bind clients to groups (rooms). Both sides of the battle need to be bound. Other business logics need to be researched.  
### 4. Integration Steps
#### 4.1. Create a Package
```go
go run . artisan make:package socket
```
#### 4.2. Use the Package
Overwrite the extension to the package.
#### 4.3. Route Explanation
Delegate operations to the frontend. Use HTTP to call the APIs provided by the socket for communication with the client. In routers/routers.go, add middleware as needed. In this example, JWT middleware is used.
```go
facades.Route().Prefix("/api").Middleware(middleware.Jwt()).Group(func(router route.Router) {
    registerController := register.NewRegisterController()
    sendToClientController := send2client.NewRegisterController()
    sendToClientsController := send2clients.NewSend2ClientsController()
    sendToGroupController := send2group.NewSend2GroupController()
    bindToGroupController := bind2group.NewBind2GroupController()
    getOnlinelistController := getonlinelist.NewGetOnlineController()
    closeClientController := closeclient.NewCloseClientController()
    getAllGroupHandler := getallgroup.NewGetAllGroupController()

    router.Post("/register", registerController.Run) // Register a region
    router.Post("/send_to_client", sendToClientController.Run) // Send a message to a specific client
    router.Post("/send_to_clients", sendToClientsController.Run) // Send a message to specific clients (multiple clients)
    router.Post("/send_to_group", sendToGroupController.Run) // Send a message to a specific group
    router.Post("/bind_to_group", bindToGroupController.Run) // Bind a client to a group
    router.Post("/get_online_list", getOnlinelistController.Run) // Get online user list
    router.Post("/close_client", closeClientController.Run) // Close a client
    router.Post("/get_all_groups", getAllGroupHandler.Run) // Get all groups
})

```

#### 4.4. Code Writing Explanation (Data Structures)
##### 4.4.1. Register a Region
```go
type inputData struct {
    SystemId string `json:"systemId" form:"systemId" validate:"required"`
}
```
##### 4.4.2. Bind to Group
```go
type inputData struct {
    ClientId  string `json:"clientId" validate:"required"`
    GroupName string `json:"groupName" validate:"required"`
    UserId    string `json:"userId"`
    Extend    string `json:"extend"` // Additional field for storing business data
}
```
##### 4.4.3. Get Group
```go
type inputData struct {
    ClientId string `json:"clientId" validate:"required"`
    UserId   string `json:"userId"`
    Extend   string `json:"extend"` // Additional field for storing business data
}
```
##### 4.4.4. Get Online User List
```go
type inputData struct {
    ClientId string `json:"clientId" validate:"required"`
    UserId   string `json:"userId"`
    Extend   string `json:"extend"` // Additional field for storing business data
}

```
##### 4.4.5. Send Message to a Specific Client
```go
type inputData struct {
    ClientId   string `json:"clientId" validate:"required"`
    SendUserId string `json:"sendUserId"`
    Code       int    `json:"code"`
    Msg        string `json:"msg"`
    Data       string `json:"data"`
}

```
##### 4.4.6. Send Message to Specific Clients
```go
type inputData struct {
    ClientIds  []string `json:"clientIds" validate:"required"`
    SendUserId string   `json:"sendUserId"`
    Code       int      `json:"code"`
    Msg        string   `json:"msg"`
    Data       string   `json:"data"`
}

```
##### 4.4.7. Send Message to a Specific Group
```go
type inputData struct {
    SendUserId string `json:"sendUserId"`
    GroupName  string `json:"groupName" validate:"required"`
    Code       int    `json:"code"`
    Msg        string `json:"msg"`
    Data       string `json:"data"`
}
```
##### 4.4.8. Close a Client
```go
type inputData struct {
    ClientId string `json:"clientId" validate:"required"`
}
```
### Use Cases
Real-time communication scenarios such as chat rooms, multiplayer games, live streaming rooms, online education, online meetings, online quizzes, online exams, online voting, live Q&A sessions, online surveys, online polls, online elections, etc.
### Copyright
The code contains code from other authors, and the copyright of the included code belongs to the original authors. If there is any infringement, please contact the author for deletion.