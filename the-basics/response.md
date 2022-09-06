## Introduction

Response module can be operated by `facades.Response`.

## Methods

| Name                                                   | Description                        |
| ------------------------------------------------------ | ---------------------------------- |
| `Success(ctx *gin.Context, data interface{})`          | Return a response with 200 code    |
| `Custom(ctx *gin.Context, data interface{}, code int)` | Return a response with custom code |
