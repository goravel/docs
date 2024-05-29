# Socket[详情](https://github.com/hulutech-web/goravel-socket)
### 介绍
goravel的websocket扩展包,方便在goravel项目中集成，扩展提供了方便的websocket常用功能，包含注册systemId,绑定clientId,分组，发送消息到指定分组，发送消息给客户端等，消息中的业务数据开发者按需添加即可；
### 使用说明
### 1、在goravel项目中的config目录下的app.go文件中的providers数组中添加
```go
import Socket "goravel/packages/socket"
```
在providers数组中添加
```go
	&Socket.ServiceProvider{},
```
### 2、在goravel项目中的router目录下的web.go文件中添加
```go
import 	"goravel/packages/socket/servers"
func Web() {
websocketHandler := &servers.Controller{}
facades.Route().Get("/ws", websocketHandler.Run)
go servers.Manager.Start()
}
```
### 3、访问路径/ws
#### 业务流程
1、注册大区，systemId,不能重复，随机值，需缓存   

2、连接ws,需要携带systemId头信息，连接成功后返回clientId，缓存至本地（这个时候会出现：xxx上线了，xxx下线了），每上线一个人将该人的clientId存入本地缓存，方便随时根据client进行发送消息  

3、绑定客户端到分组（房间），对战双方都需要绑定，其他业务逻辑自行研究

### 4、集成操作
#### 4.1、创建一个包
```go
go run . artisan make:package socket
```
#### 4.2、使用包
将扩展覆盖到扩展包中  

#### 4.3、路由说明，将操作交给前端，通过http方式调用socket提供的api进行与客户端通信，routers/routers.go,路由中间件自行添加，本例中使用了jwt中间件
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

    router.Post("/register", registerController.Run) //注册大区
    router.Post("/send_to_client", sendToClientController.Run) //发送消息给指定的客户端
    router.Post("/send_to_clients", sendToClientsController.Run) //发送消息给指定的客户端(多个客户端)
    router.Post("/send_to_group", sendToGroupController.Run) //发送消息给指定的分组
    router.Post("/bind_to_group", bindToGroupController.Run) //绑定客户端到分组
    router.Post("/get_online_list", getOnlinelistController.Run) //获取在线列表
    router.Post("/close_client", closeClientController.Run) //关闭客户端
    router.Post("/get_all_groups", getAllGroupHandler.Run) //获取所有分组
	})
```
#### 4.4、代码编写说明(数据结构)
##### 4.4.1、注册大区
```go
type inputData struct {
SystemId string `json:"systemId" form:"systemId" validate:"required"`
}
```
##### 4.4.2、绑定分组
```go
type inputData struct {
	ClientId  string `json:"clientId" validate:"required"`
	GroupName string `json:"groupName" validate:"required"`
	UserId    string `json:"userId"`
	Extend    string `json:"extend"` // 拓展字段，方便业务存储数据
}
```
##### 4.4.3、获取分组
```go
type inputData struct {
    ClientId string `json:"clientId" validate:"required"`
    UserId   string `json:"userId"`
    Extend   string `json:"extend"` // 拓展字段，方便业务存储数据
}
```
##### 4.4.4、获取在线用户列表
```go
type inputData struct {
	GroupName string      `json:"groupName" validate:"required"`
	Code      int         `json:"code"`
	Msg       string      `json:"msg"`
	Data      interface{} `json:"data"`
}

```
##### 4.4.5、发送消息给指定的客户端
```go
type inputData struct {
	ClientId   string `json:"clientId" validate:"required"`
	SendUserId string `json:"sendUserId"`
	Code       int    `json:"code"`
	Msg        string `json:"msg"`
	Data       string `json:"data"`
}
```
##### 4.4.6、发送消息给指定的多个客户端
```go
type inputData struct {
	ClientIds  []string `json:"clientIds" validate:"required"`
	SendUserId string   `json:"sendUserId"`
	Code       int      `json:"code"`
	Msg        string   `json:"msg"`
	Data       string   `json:"data"`
}
```
##### 4.4.7、发送消息给指定的分组
```go
type inputData struct {
	SendUserId string `json:"sendUserId"`
	GroupName  string `json:"groupName" validate:"required"`
	Code       int    `json:"code"`
	Msg        string `json:"msg"`
	Data       string `json:"data"`
}
```
##### 4.4.8、关闭客户端
```go
type inputData struct {
	ClientId string `json:"clientId" validate:"required"`
}
```
### 5、使用场景
聊天室、对战游戏、直播间、在线教育、在线会议、在线答题、在线考试、在线投票、在线抢答、在线抽奖、在线问卷、在线调查、在线评选、在线选举、在线投票等实时通信场景。
### 6、版权说明
代码中包含其他作者的代码，其包含的代码版权归原作者所有，如有侵权，请联系作者删除