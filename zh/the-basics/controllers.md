# 控制器

[[toc]]

## 介绍

为了代替在单独路由中以闭包形式定义所有的请求处理逻辑，可以使用控制器来进行整合。控制器被存放在 `app/http/controllers` 目录中。

## 定义控制器

下面是一个基础控制器类的例子：

```
package controllers

import (
	"github.com/gin-gonic/gin"

	"github.com/goravel/framework/facades"
)

type UserController struct {
	//Dependent services
}

func NewUserController() *UserController {
	return &UserController{
		//Inject services
	}
}

func (r *UserController) Show(ctx *gin.Context) {
	c.JSON(200, gin.H{
		"Hello": "Goravel",
	})
}
```

路由可以这样定义：

```
package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/goravel/framework/facades"

	"goravel/app/http/controllers"
)

func Web() {
	userController := controllers.NewUserController()
	facades.Route.GET("/user", userController.Show)
}
```