# Migrations

[[toc]]

## Introduction

When multiple people collaborate to develop applications, if there is no unified specification for the synchronization database structure to ensure that everyone's local data is consistent, it will be a disaster. Database migration is to solve this problem. The database structure is version controlled to ensure the consistency of the database structure of all developers.

## Create Migrations

Use the `make:migration` command to create the migration:

```go
go run . artisan make:migration create_users_table
```

This command will generate migration files in the `database/migrations` directory. All migration files start with a timestamp. Goravel will use the timestamp as the execution order of the migration files. All migration files are `.sql` files, and you can customize the table structure using SQL statements.

The migration command will generate two migration files at the same time: `***.up.sql` and `***.down.sql`, respectively corresponding to execution and rollback. 

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

```
^create_(\w+)_table$
^create_(\w+)$
```

Using `add_avatar_to_users_table` will automatically generate a structure for adding fields to the `users` table:

```sql
ALTER TABLE users ADD column varchar(255) COMMENT '';
```

The realization principle is to match according to the regularity:

```
_(to|from|in)_(\w+)_table$
_(to|from|in)_(\w+)$
```

When the above conditions are not matched, the framework will generate an empty migration file.
