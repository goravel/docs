# 响应

[[toc]]

## 介绍

响应模块可以使用 `facades.Response` 进行操作。

## 可用方法

| 名称                                                   | 描述                    |
| ------------------------------------------------------ | ----------------------- |
| `Success(ctx *gin.Context, data interface{})`          | 返回状态码为 200 的响应 |
| `Custom(ctx *gin.Context, data interface{}, code int)` | 返回自定义状态码的响应  |
