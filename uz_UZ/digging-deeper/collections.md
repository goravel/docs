# Collections

[[toc]]

## Introduction

Goravel provides a fluent collection API through the `github.com/goravel/framework/support/collect` package. Collections make it convenient to filter, transform, aggregate, and inspect slice data with chainable methods.

The package provides two collection types:

- `Collection`: an eager collection that works with data already loaded into memory.
- `LazyCollection`: a lazy collection that evaluates pipelines only when a terminal method is called.

```go
import "github.com/goravel/framework/support/collect"
```

## Creating Collections

Use `collect.New` to create a collection from variadic arguments:

```go
numbers := collect.New(1, 2, 3, 4, 5)
```

Use `collect.Of` to create a collection from an existing slice:

```go
items := []string{"apple", "banana", "cherry"}
fruits := collect.Of(items)
```

You may retrieve all underlying items with `All`:

```go
fruits.All() // []string{"apple", "banana", "cherry"}
```

## Basic Operations

Collections provide common methods for reading and modifying items:

```go
numbers := collect.New(1, 2, 3, 4, 5)

numbers.Count()      // 5
numbers.IsEmpty()    // false
numbers.IsNotEmpty() // true
*numbers.First()     // 1
*numbers.Last()      // 5
numbers.Contains(3)  // true
numbers.Search(4)    // 3
```

Some methods mutate the current collection and return it for chaining:

```go
numbers.Push(6).Prepend(0)
numbers.All() // []int{0, 1, 2, 3, 4, 5, 6}
```

Mutating methods include `Push`, `Prepend`, `Pop`, `Pull`, `Shift`, `Unshift`, `Forget`, `Put`, `Splice`, and `Transform`. Methods such as `Push`, `Prepend`, `Forget`, `Put`, and `Transform` return the current collection, while methods such as `Pop`, `Pull`, `Shift`, and `Splice` return the removed item or items.

## Filtering And Mapping

Use `Filter` and `Reject` to keep or remove items by callback:

```go
numbers := collect.New(1, 2, 3, 4, 5, 6)

evens := numbers.Filter(func(n int, _ int) bool {
    return n%2 == 0
})

evens.All() // []int{2, 4, 6}
```

Use `Map` to transform each item. The `Map` method returns `*collect.Collection[any]` because the callback can return any type:

```go
labels := numbers.Map(func(n int, i int) any {
    return fmt.Sprintf("item_%d_%d", i, n)
})

labels.All() // []any{"item_0_1", "item_1_2", ...}
```

Other transformation helpers include `FlatMap`, `MapInto`, `MapSpread`, `MapToDictionary`, `MapToGroups`, and `MapWithKeys`.

Use `Unique`, `UniqueBy`, and `Duplicates` to work with repeated values. The `Duplicates` method returns each duplicated value once:

```go
numbers := collect.New(1, 2, 2, 3, 3, 3)

numbers.Unique().All()     // []int{1, 2, 3}
numbers.Duplicates().All() // []int{2, 3}
```

## Working With Structs

The `Where` method supports callback filtering and Laravel-style field comparisons.

```go
type User struct {
    ID        int
    Name      string
    Age       int
    Country   string
    Balance   float64
    DeletedAt *time.Time
}

users := collect.Of([]User{
    {ID: 1, Name: "Alice", Age: 25, Country: "FR", Balance: 150},
    {ID: 2, Name: "Bob", Age: 30, Country: "US", Balance: 80},
    {ID: 3, Name: "Charlie", Age: 25, Country: "FR", Balance: 200},
})

frenchUsers := users.Where("Country", "FR")
youngUsers := users.Where("Age", "=", 25)
numericAgeUsers := users.Where("Age", "=", "25")
richUsers := users.Where("Balance", ">", 100)
adultUsers := users.Where(func(user User) bool {
    return user.Age >= 18
})
```

Supported comparison operators are `=`, `==`, `!=`, `>`, `>=`, `<`, `<=`, `like`, and `not like`. Equality comparisons support simple mixed numeric values, so an integer field can match a numeric string such as `"25"`.

You may also use field-specific helpers:

```go
activeUsers := users.WhereNull("DeletedAt")
deletedUsers := users.WhereNotNull("DeletedAt")
selectedUsers := users.WhereIn("Country", []any{"FR", "US"})
otherUsers := users.WhereNotIn("Country", []any{"FR"})
names := users.Pluck("Name")
```

## Aggregates

Collection aggregate helpers calculate values from the items:

```go
numbers := collect.New(1, 2, 3, 4, 5)

numbers.Sum(func(n int) float64 { return float64(n) }) // 15
numbers.Avg(func(n int) float64 { return float64(n) }) // 3
numbers.Min(func(n int) float64 { return float64(n) }) // 1
numbers.Max(func(n int) float64 { return float64(n) }) // 5
```

Use `Reduce` when you need to build a single value from the collection:

```go
total := numbers.Reduce(func(acc any, n int, _ int) any {
    return acc.(int) + n
}, 0)
```

## Sorting And Slicing

Collections include helpers for ordering and slicing data:

```go
numbers := collect.New(5, 1, 4, 2, 3)

numbers.Sort(func(a, b int) bool { return a < b }).All() // []int{1, 2, 3, 4, 5}
numbers.Reverse().All()                                  // []int{3, 2, 4, 1, 5}
numbers.Take(3).All()                                    // []int{5, 1, 4}
numbers.Skip(2).All()                                    // []int{4, 2, 3}
numbers.Slice(2).All()                                   // []int{4, 2, 3}
numbers.Chunk(2)                                         // [][]int{{5, 1}, {4, 2}, {3}}
```

Use `Splice` when you need to remove or insert items in place. It mutates the current collection and returns the removed items. A negative `deleteCount` is treated as `0`, so it inserts without removing existing items:

```go
letters := collect.New("a", "b", "c", "d")

removed := letters.Splice(1, 2, "x")
removed.All() // []string{"b", "c"}
letters.All() // []string{"a", "x", "d"}

inserted := letters.Splice(1, -1, "y")
inserted.All() // []string{}
letters.All()  // []string{"a", "y", "x", "d"}
```

For structs, use `SortBy` or `SortByDesc` with a key function:

```go
sortedUsers := users.SortBy(func(user User) string {
    return user.Name
})
```

## Conditional Operations

Use `When` and `Unless` to conditionally apply transformations while keeping a fluent chain:

```go
result := collect.New(1, 2, 3, 4, 5).
    When(true, func(c *collect.Collection[int]) *collect.Collection[int] {
        return c.Filter(func(n int, _ int) bool { return n > 2 })
    }).
    Unless(false, func(c *collect.Collection[int]) *collect.Collection[int] {
        return c.Take(2)
    })

result.All() // []int{3, 4}
```

Use `Tap` to run side effects without breaking the chain:

```go
numbers.Tap(func(c *collect.Collection[int]) {
    fmt.Println("Processing", c.Count(), "items")
})
```

## Lazy Collections

Lazy collections are useful for large datasets or generated values because intermediate operations are not executed until a terminal method or helper, such as `All`, `Count`, `First`, `Collect`, `Sum`, or `LazyReduce`, is called.

Create lazy collections from slices, ranges, generators, functions, repeated values, or channels:

```go
lazy := collect.LazyOf([]int{1, 2, 3, 4, 5})
lazy = collect.LazyNew(1, 2, 3, 4, 5)

rangeItems := collect.LazyRange(1, 1000000)
generated := collect.LazyGenerate(func(i int) int {
    return i * 2
}, 100)
repeated := collect.LazyRepeat("Goravel", 3)
```

Chain lazy operations and consume only the items you need:

```go
result := collect.LazyRange(1, 1000000).
    Filter(func(n int, _ int) bool { return n%100 == 0 }).
    Take(5).
    All()

result // []int{100, 200, 300, 400, 500}
```

Lazy collections handle early-exit operations safely for finite channel producers. Methods such as `First`, `FirstWhere`, `Contains`, `Every`, `IsEmpty`, `Take`, and `TakeWhile` drain remaining input when they stop early.

Use `Collect` to convert a lazy collection into an eager collection:

```go
eager := collect.LazyRange(1, 10).Collect()
```

When mapping a lazy collection to another concrete type, use the generic `LazyMap` helper:

```go
numbers := collect.LazyOf([]string{"1", "2", "3"})

ints := collect.LazyMap(numbers, func(value string, _ int) int {
    n, _ := strconv.Atoi(value)
    return n
})

ints.All() // []int{1, 2, 3}
```

## Method Overview

Common eager collection methods include:

| Category  | Methods                                                                                                                               |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Create    | `New`, `Of`                                                                                                                           |
| Read      | `All`, `Count`, `First`, `Last`, `Get`, `Has`, `Contains`, `ContainsStrict`, `DoesntContain`, `Search`, `SearchBy`, `Random`          |
| Transform | `Map`, `FlatMap`, `MapInto`, `MapSpread`, `Transform`, `Reverse`, `Shuffle`, `Concat`, `Collapse`, `Unique`, `UniqueBy`, `Duplicates` |
| Filter    | `Filter`, `Reject`, `Where`, `WhereIn`, `WhereNotIn`, `WhereNull`, `WhereNotNull`                                                     |
| Aggregate | `Sum`, `Avg`, `Min`, `Max`, `Median`, `Mode`, `Reduce`, `CountBy`                                                                     |
| Slice     | `Chunk`, `Slice`, `Take`, `Skip`, `Split`, `ForPage`, `Splice`                                                                        |
| Utility   | `Clone`, `Tap`, `Pipe`, `ToJson`, `Join`, `KeyBy`, `Pluck`, `Zip`                                                                     |

Common lazy collection methods include:

| Category | Methods                                                                                                                                                  |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Create   | `LazyNew`, `LazyOf`, `LazyRange`, `LazyGenerate`, `LazyFromFunc`, `LazyFromChannel`, `LazyRepeat`                                                        |
| Pipeline | `Filter`, `Reject`, `Map`, `FlatMap`, `Where`, `WhereIn`, `WhereNotIn`, `Take`, `Skip`, `TakeWhile`, `SkipWhile`, `Unique`, `UniqueBy`, `Sort`           |
| Terminal | `All`, `Count`, `First`, `FirstWhere`, `Last`, `Contains`, `Every`, `IsEmpty`, `IsNotEmpty`, `Collect`, `Sum`, `Avg`, `Min`, `Max`, `ToJson`, `Iterator` |
| Generic  | `LazyMap`, `LazyReduce`                                                                                                                                  |
