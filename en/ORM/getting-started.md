## Introduction

Goravel routing module can use `facades.DB` to operate, `facades.DB` is an instance of well-known ORM framework [go-gorm/gorm](https://github.com/go-gorm/gorm), the usage method is exactly the same as that of `go-gorm/gorm`.

Each data table corresponds to a "model" for interaction, and the model files are stored in the `app/models` folder.

Before starting, please configure the database link information in the `.env` file and confirm the default configuration of `config/database.go`.

## Model Definition

You can create a custom model based on the model file `app/models/user.go` that comes with the framework. In the `app/models/user.go` file, `struct` has nested two frameworks, `orm.Model` and `orm.SoftDeletes`, which have their own structures. They respectively define `id, created_at // creation time, updated_at //update time` and `deleted_at //soft delete` can be used directly.

## Model Convention

1. The model is named with a big hump;
2. Use the plural form of the model "snake naming" as the table name;

## Query
```
facades.DB.First(&user, 10)
// SELECT * FROM users WHERE id = 10;

facades.DB.First(&user, "10")
// SELECT * FROM users WHERE id = 10;

facades.DB.Find(&users, []int{1,2,3})
// SELECT * FROM users WHERE id IN (1,2,3);
```

## Create
```
user := User{Name: "Jinzhu", Age: 18, Birthday: time.Now()}
result := facades.DB.Create(&user)
```

## Update
```
facades.DB.First(&user)
user.Name = "jinzhu 2"
user.Age = 100
facades.DB.Save(&user)
// UPDATE users SET name='jinzhu 2', age=100, birthday='2016-01-01', updated_at = '2013-11-17 21:34:10' WHERE id=111

facades.DB.Model(&User{}).Where("active = ?", true).Update("name", "hello")
// UPDATE users SET name='hello', updated_at='2013-11-17 21:34:10' WHERE active=true;

db.Model(&user).Updates(User{Name: "hello", Age: 18, Active: false})
// UPDATE users SET name='hello', age=18, updated_at = '2013-11-17 21:34:10' WHERE id = 111;
```

## Delete
```
db.Delete(&email)
// DELETE from emails where id = 10;

db.Where("name = ?", "jinzhu").Delete(&email)
// DELETE from emails where id = 10 AND name = "jinzhu";

db.Delete(&User{}, 10)
// DELETE FROM users WHERE id = 10;
```

## More

See [go-gorm/gorm](https://github.com/go-gorm/gorm)  