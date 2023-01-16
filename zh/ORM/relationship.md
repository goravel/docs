# 模型关联

[[toc]]

## 介绍

数据库表通常相互关联。例如，一篇博客文章可能有许多评论，或者一个订单对应一个下单用户。Orm 让这些关联的管理和使用变得简单，并支持多种常用的关联类型：

- [一对一](#一对一)
- [一对多](#一对多)
- [多对多](#多对多)

## 定义关联

### 一对一

一对一是最基本的数据库关系。 例如，一个 `User` 模型可能与一个 `Phone` 模型相关联。为了定义这个关联关系，我们要在 `User` 模型中定义一个 `Phone`：

```go
type User struct {
	orm.Model
	orm.SoftDeletes
	Name    string
	Phone   *Phone
}

type Phone struct {
	orm.Model
	UserID   uint
	Name     string
}
```

`Orm` 基于父模型（`User`）的名称来确定关联模型（`Phone`）的外键名称。在本例中，会自动假定 `Phone` 模型有一个 `user_id` 的外键。如果你想重写这个约定，可以为 `Phone` 字段添加 `foreignKey` Tag：

```go
type User struct {
	orm.Model
	orm.SoftDeletes
	Name    string
	Phone   *Phone `gorm:"foreignKey:UserName"`
}

type Phone struct {
	orm.Model
	UserName string
	Name     string
}
```

另外，`Orm` 假设外键的值是与父模型的主键（Primary Key）相同的。换句话说，`Orm` 将会通过 `Phone` 记录的 `user_id` 列中查找与用户表的 `id` 列相匹配的值。如果你希望使用自定义的主键值，可以为 `Phone` 字段添加 `references` Tag：

```go
type User struct {
	orm.Model
	orm.SoftDeletes
	Name    string
	Phone   *Phone `gorm:"foreignKey:UserName;references:name"`
}

type Phone struct {
	orm.Model
	UserName string
	Name     string
}
```

#### 定义反向关联

我们已经能从 `User` 模型访问到 `Phone` 模型了。接下来，让我们再在 `Phone` 模型上定义一个关联，它能让我们访问到拥有该电话的用户。我们可以在 `Phone` 模型中定义一个 `User`：

```go
type User struct {
	orm.Model
	orm.SoftDeletes
	Name    string
}

type Phone struct {
	orm.Model
	UserID   uint
	Name     string
  User     *User
}
```

`Orm` 通过关联字段（`User`）的名称并使用 `_id` 作为后缀名来确定外键名称。因此，在本例中，Orm 会假设 `Phone` 模型有一个 `user_id` 字段。但是，如果 `Phone` 模型的外键不是 user_id，这时你可以给 belongsTo 方法的第二个参数传递一个自定义键名：
