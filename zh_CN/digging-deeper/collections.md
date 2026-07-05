# 集合

[[toc]]

## 简介

Goravel 通过 `github.com/goravel/framework/support/collect` 包提供了流畅的集合 API。集合可以方便地使用链式方法来过滤、转换、聚合和检查切片数据。

该包提供了两种集合类型：

- `Collection`：一个即时集合，用于处理已加载到内存中的数据。
- `LazyCollection`：一个延迟集合，仅在调用终端方法时才执行管道。

```go
import "github.com/goravel/framework/support/collect"
```

## 创建集合

使用 `collect.New` 从可变参数创建集合：

```go
numbers := collect.New(1, 2, 3, 4, 5)
```

使用 `collect.Of` 从现有切片创建集合：

```go
items := []string{"apple", "banana", "cherry"}
fruits := collect.Of(items)
```

你可以通过 `All` 获取所有底层元素：

```go
fruits.All() // []string{"apple", "banana", "cherry"}
```

## 基本操作

集合提供了读取和修改元素的常用方法：

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

一些方法会修改当前集合并返回它以支持链式调用：

```go
numbers.Push(6).Prepend(0)
numbers.All() // []int{0, 1, 2, 3, 4, 5, 6}
```

可变方法包括 `Push`、`Prepend`、`Pop`、`Pull`、`Shift`、`Unshift`、`Forget`、`Put`、`Splice` 和 `Transform`。`Push`、`Prepend`、`Forget`、`Put` 和 `Transform` 等方法返回当前集合，而 `Pop`、`Pull`、`Shift` 和 `Splice` 等方法返回被移除的元素。

## 过滤和映射

使用 `Filter` 和 `Reject` 通过回调保留或移除元素：

```go
numbers := collect.New(1, 2, 3, 4, 5, 6)

evens := numbers.Filter(func(n int, _ int) bool {
    return n%2 == 0
})

evens.All() // []int{2, 4, 6}
```

使用 `Map` 转换每个元素。`Map` 方法返回 `*collect.Collection[any]`，因为回调可以返回任何类型：

```go
labels := numbers.Map(func(n int, i int) any {
    return fmt.Sprintf("item_%d_%d", i, n)
})

labels.All() // []any{"item_0_1", "item_1_2", ...}
```

其他转换辅助函数包括 `FlatMap`、`MapInto`、`MapSpread`、`MapToDictionary`、`MapToGroups` 和 `MapWithKeys`。

使用 `Unique`、`UniqueBy` 和 `Duplicates` 处理重复值。`Duplicates` 方法每个重复值只返回一次：

```go
numbers := collect.New(1, 2, 2, 3, 3, 3)

numbers.Unique().All()     // []int{1, 2, 3}
numbers.Duplicates().All() // []int{2, 3}
```

## 处理结构体

`Where` 方法支持回调过滤和 Laravel 风格的字段比较。

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

支持的比较运算符有 `=`、`==`、`!=`、`>`、`>=`、`<`、`<=`、`like` 和 `not like`。相等比较支持简单的混合数值，因此整数字段可以匹配数字字符串，如 `"25"`。

你也可以使用特定字段的辅助函数：

```go
activeUsers := users.WhereNull("DeletedAt")
deletedUsers := users.WhereNotNull("DeletedAt")
selectedUsers := users.WhereIn("Country", []any{"FR", "US"})
otherUsers := users.WhereNotIn("Country", []any{"FR"})
names := users.Pluck("Name")
```

## 聚合

集合聚合辅助函数从元素中计算值：

```go
numbers := collect.New(1, 2, 3, 4, 5)

numbers.Sum(func(n int) float64 { return float64(n) }) // 15
numbers.Avg(func(n int) float64 { return float64(n) }) // 3
numbers.Min(func(n int) float64 { return float64(n) }) // 1
numbers.Max(func(n int) float64 { return float64(n) }) // 5
```

当你需要从集合构建单一值时，使用 `Reduce`：

```go
total := numbers.Reduce(func(acc any, n int, _ int) any {
    return acc.(int) + n
}, 0)
```

## 排序和切片

集合包含用于排序和切片数据的辅助函数：

```go
numbers := collect.New(5, 1, 4, 2, 3)

numbers.Sort(func(a, b int) bool { return a < b }).All() // []int{1, 2, 3, 4, 5}
numbers.Reverse().All()                                  // []int{3, 2, 4, 1, 5}
numbers.Take(3).All()                                    // []int{5, 1, 4}
numbers.Skip(2).All()                                    // []int{4, 2, 3}
numbers.Slice(2).All()                                   // []int{4, 2, 3}
numbers.Chunk(2)                                         // [][]int{{5, 1}, {4, 2}, {3}}
```

当你需要原地删除或插入元素时，使用 `Splice`。它会修改当前集合并返回被移除的元素。负数的 `deleteCount` 会被视为 `0`，因此它可以在不移除现有元素的情况下进行插入：

```go
letters := collect.New("a", "b", "c", "d")

removed := letters.Splice(1, 2, "x")
removed.All() // []string{"b", "c"}
letters.All() // []string{"a", "x", "d"}

inserted := letters.Splice(1, -1, "y")
inserted.All() // []string{}
letters.All()  // []string{"a", "y", "x", "d"}
```

对于结构体，使用 `SortBy` 或 `SortByDesc` 配合键函数：

```go
sortedUsers := users.SortBy(func(user User) string {
    return user.Name
})
```

## 条件操作

使用 `When` 和 `Unless` 有条件地应用转换，同时保持流畅的链式调用：

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

使用 `Tap` 在不破坏链式调用的情况下执行副作用：

```go
numbers.Tap(func(c *collect.Collection[int]) {
    fmt.Println("Processing", c.Count(), "items")
})
```

## 延迟集合

延迟集合适用于大数据集或生成的值，因为中间操作直到调用终端方法或辅助函数（如 `All`、`Count`、`First`、`Collect`、`Sum` 或 `LazyReduce`）时才会执行。

从切片、范围、生成器、函数、重复值或通道创建延迟集合：

```go
lazy := collect.LazyOf([]int{1, 2, 3, 4, 5})
lazy = collect.LazyNew(1, 2, 3, 4, 5)

rangeItems := collect.LazyRange(1, 1000000)
generated := collect.LazyGenerate(func(i int) int {
    return i * 2
}, 100)
repeated := collect.LazyRepeat("Goravel", 3)
```

链式延迟操作，只消费你需要的元素：

```go
result := collect.LazyRange(1, 1000000).
    Filter(func(n int, _ int) bool { return n%100 == 0 }).
    Take(5).
    All()

result // []int{100, 200, 300, 400, 500}
```

延迟集合可以安全地处理有限通道生产者的提前退出操作。`First`、`FirstWhere`、`Contains`、`Every`、`IsEmpty`、`Take` 和 `TakeWhile` 等方法在提前停止时会排空剩余的输入。

使用 `Collect` 将延迟集合转换为即时集合：

```go
eager := collect.LazyRange(1, 10).Collect()
```

当将延迟集合映射到另一个具体类型时，使用泛型 `LazyMap` 辅助函数：

```go
numbers := collect.LazyOf([]string{"1", "2", "3"})

ints := collect.LazyMap(numbers, func(value string, _ int) int {
    n, _ := strconv.Atoi(value)
    return n
})

ints.All() // []int{1, 2, 3}
```

## 方法概览

常用的即时集合方法包括：

| 分类 | 方法 |
| --- | --- |
| 创建 | `New`、`Of` |
| 读取 | `All`、`Count`、`First`、`Last`、`Get`、`Has`、`Contains`、`ContainsStrict`、`DoesntContain`、`Search`、`SearchBy`、`Random` |
| 转换 | `Map`、`FlatMap`、`MapInto`、`MapSpread`、`Transform`、`Reverse`、`Shuffle`、`Concat`、`Collapse`、`Unique`、`UniqueBy`、`Duplicates` |
| 过滤 | `Filter`、`Reject`、`Where`、`WhereIn`、`WhereNotIn`、`WhereNull`、`WhereNotNull` |
| 聚合 | `Sum`、`Avg`、`Min`、`Max`、`Median`、`Mode`、`Reduce`、`CountBy` |
| 切片 | `Chunk`、`Slice`、`Take`、`Skip`、`Split`、`ForPage`、`Splice` |
| 工具 | `Clone`、`Tap`、`Pipe`、`ToJson`、`Join`、`KeyBy`、`Pluck`、`Zip` |

常用的延迟集合方法包括：

| 分类 | 方法 |
| --- | --- |
| 创建 | `LazyNew`、`LazyOf`、`LazyRange`、`LazyGenerate`、`LazyFromFunc`、`LazyFromChannel`、`LazyRepeat` |
| 管道 | `Filter`、`Reject`、`Map`、`FlatMap`、`Where`、`WhereIn`、`WhereNotIn`、`Take`、`Skip`、`TakeWhile`、`SkipWhile`、`Unique`、`UniqueBy`、`Sort` |
| 终端 | `All`、`Count`、`First`、`FirstWhere`、`Last`、`Contains`、`Every`、`IsEmpty`、`IsNotEmpty`、`Collect`、`Sum`、`Avg`、`Min`、`Max`、`ToJson`、`Iterator` |
| 泛型 | `LazyMap`、`LazyReduce` |
