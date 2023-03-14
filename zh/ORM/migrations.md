# 数据库迁移

[[toc]]

## 简介

当多人协作开发应用程序时，如果同步数据库结构没有一个统一的规范，以保证所有人的本地数据都是一致的，那将是灾难。数据库迁移就是为了解决这个问题，将数据库的结构进行版本控制，以保证所有开发人员的数据库结构的一致性。

## 生成迁移

使用 `make:migration` 命令来创建迁移：

```
go run . artisan make:migration create_users_table
```

该命令会在 `database/migrations` 目录下生成迁移文件，所有迁移文件都以一个时间戳为开头，Goravel 将以此作为迁移文件的执行顺序。所有的迁移文件都是 `.sql` 文件，你可以使用 SQL 语句自定义表结构。

迁移命令会同时生成两个迁移文件：`***.up.sql`、`***.down.sql`，分别对应执行、回滚。

## 运行迁移

```
go run . artisan migrate
```

## 快捷生成

使用 `create_users_table` 将会自动生成包含 `users` 基础结构的表：

```sql
CREATE TABLE users (
  id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  created_at datetime(3) DEFAULT NULL,
  updated_at datetime(3) DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_users_created_at (created_at),
  KEY idx_users_updated_at (updated_at)
) ENGINE = InnoDB AUTO_INCREMENT = 1 DEFAULT CHARSET = DummyDatabaseCharset;
```

实现原理是根据正则进行匹配：

```
^create_(\w+)_table$
^create_(\w+)$
```

使用 `add_avatar_to_users_table` 将会自动生成向 `users` 表增加字段的结构：

```sql
ALTER TABLE users ADD column varchar(255) COMMENT '';
```

实现原理是根据正则进行匹配：

```
_(to|from|in)_(\w+)_table$
_(to|from|in)_(\w+)$
```

未匹配到上述情况时，框架会生成一个空的迁移文件。
