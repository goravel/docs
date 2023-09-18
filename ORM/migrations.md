# Migrations

[[toc]]

## Introduction

When multiple people collaborate to develop applications, it's crucial to have a standardized database structure for synchronization. Without this, there could be chaos as everyone's individual data won't match up. Database migration is the solution to this problem. The database structure is version-controlled to ensure the consistency of the database structure of all developers.

## Create Migrations

Use the `make:migration` command to create the migration:

```shell
go run . artisan make:migration create_users_table
```

This command will generate migration files in the `database/migrations` directory. Each migration file will begin with a timestamp, which Goravel will use to determine the execution order of the migration files. All migration files are in `.sql` format, and you can customize the table structure using SQL statements.

The migration command will generate two migration files simultaneously: `***.up.sql` for execution and `***.down.sql` for rollback. 

## Run Migrations

To run all of your outstanding migrations, execute the `migrate` Artisan command:

```shell
go run . artisan migrate
```

If you would like to see which migrations have run thus far, you may use the `migrate:status` Artisan command:

```shell
go run . artisan migrate:status
```

## Rolling Back Migrations

To roll back the latest migration, use the `rollback` Artisan command. This command rolls back the last "batch" of migrations, which may include multiple migration files:

```shell
go run . artisan migrate:rollback
```

You may roll back a limited number of migrations by providing the `step` option to the `rollback` command. For example, the following command will roll back the last five migrations:

```shell
go run . artisan migrate:rollback --step=5
```

The `migrate:reset` command will roll back all of your application's migrations:

```shell
go run . artisan migrate:reset
```

### Roll Back & Migrate Using A Single Command

The `migrate:refresh` command will roll back all of your migrations and then execute the `migrate` command. This command effectively re-creates your entire database:

```shell
go run . artisan migrate:refresh
```

You may roll back and re-migrate a limited number of migrations by providing the `step` option to the `refresh` command. For example, the following command will roll back and re-migrate the last five migrations:

```shell
go run . artisan migrate:refresh --step=5
```

### Drop All Tables & Migrate

The `migrate:fresh` command will drop all tables from the database and then execute the `migrate` command:

```shell
go run . artisan migrate:fresh
```

## Quickly Create

Using `create_users_table` will automatically generate a table containing the infrastructure of `users`:

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

The realization principle is to match according to the regularity:

```shell
^create_(\w+)_table$
^create_(\w+)$
```

Using `add_avatar_to_users_table` will automatically generate a structure for adding fields to the `users` table:

```sql
ALTER TABLE users ADD column varchar(255) COMMENT '';
-- ALTER TABLE users ADD `avatar` varchar(255) NOT NULL DEFAULT '' AFTER `id` COMMENT 'avatar';
```

The realization principle is to match according to the regularity:

```
_(to|from|in)_(\w+)_table$
_(to|from|in)_(\w+)$
```

When the above conditions are not matched, the framework will generate an empty migration file.

<CommentService/>