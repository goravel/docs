---
search: false
head:
  - - meta
    - name: robots
      content: noindex
---

# 编写文档

## 简介

本页面向编写或修改文档的贡献者和 AI 代理，说明如何写出开发者能够顺利跟着做的页面，并展示文档主题的每项功能：怎么写，以及渲染出来的效果。

本页的每个示例都只写了一次：代码块显示源码，下方的效果由同一份源码渲染而来。

使用 `pnpm docs:dev` 预览修改，提交 PR 前运行 `pnpm docs:build`。 存在失效链接时构建会失败。

## 好页面的标准

读者带着任务而来，希望尽快回到自己的代码中。 好的页面能帮他们做到这一点。

- **回答“我该如何做 X”。** 按读者想做的事情组织页面，而不是按包的内部结构组织。
- **可以直接粘贴。** 每个示例复制到新项目中都能运行。
- **便于浏览。** 读者通过大纲找到章节，通过方法索引找到方法，不必从头读起。
- **内容真实。** 每个方法、选项和配置项在当前框架中都真实存在。
- **令人熟悉。** Goravel 遵循 Laravel 的风格。 使用 Laravel 开发者熟悉的名称，并说明 Goravel 的不同之处。

按读者接触的顺序排列章节：简介、安装或配置、常见任务、较少见的任务、扩展、测试。

## 编写章节

一个章节只讲一个任务，请按以下顺序编写。

1. **用标题说明任务。** 写“在限定时间内存储数据”，而不是“Put”。 读者搜索的是他们想做的事。 每个方法一小节的参考类页面是例外，此时标题就是方法名。
2. **用一句话写出方法名**，并使用行内代码。 它告诉读者在示例中关注什么，同时把方法注册到页面的方法索引中。
3. **一个完整的示例**，以文件路径开头。
4. **返回什么，可能出什么错**，当读者可能感到意外时说明。
5. **只在需要时使用提示块。** 一个可能让读者耗费一小时的坑，应该放进 warning。 大多数章节不需要提示块。

保持章节简短。 如果一个章节需要两个以上的示例，它其实是两个任务。

````md demo
### 在限定时间内存储数据

你可以使用 `Put` 方法在指定时间内存储数据：

```go
// app/http/controllers/user_controller.go
package controllers

import (
	"time"

	"github.com/goravel/framework/contracts/http"

	"goravel/app/facades"
)

func (r *UserController) Show(ctx http.Context) http.Response {
	err := facades.Cache().Put("user", "Goravel", 5*time.Minute)
	if err != nil {
		return ctx.Response().Status(500).String(err.Error())
	}

	return ctx.Response().Success().String("cached")
}
```

::: warning 零表示永久
时长为 `0` 时，数据将永不过期。
:::
````

## 编写示例

示例是文档中人们真正会用到的部分。

- **保持完整。** 代码块以文件路径注释开头，然后是包名、导入以及调用所在的函数。 只有当上下文已经说明代码位置时，才适合只写一到三行的片段，例如单行配置。
- **对照框架进行核对。** 打开 `goravel/framework` 中的契约，确认方法名、参数和返回值。 调用了不存在的方法的示例，比没有示例更糟糕。
- **处理错误。** 像真实代码那样写出 `if err != nil`，而不是用 `_` 忽略。
- **使用真实的名称。** 使用 `user`、`order`、`invoice`，不要用 `foo`、`bar` 或 `test`。
- **展示结果**，当结果不明显时，写在最后一行的注释中，或写在示例下方的 `text` 代码块中。
- **artisan 命令写作 `go run . artisan`。** `./artisan` 脚本无法在 Windows 上运行。
- **Shell 注释以 `#` 开头。** 复制按钮会复制整个代码块，`//` 开头的行会导致命令执行失败。
- **一个代码块只表达一件事。** 两种替代写法请放进代码组，不要写成一个中间夹着注释的长代码块。
- **始终标明语言。** 没有标明语言的代码块不会高亮。 可使用 `go`、`shell`、`json`、`yaml`、`sql`、`dockerfile`、`html`、`php`、`diff`，目录树和纯文本输出使用 `text`。

## 让每个方法都能被找到

介绍了六个或更多方法的页面，会在大纲下方显示 **方法** 列表，较长的页面还会显示筛选框。 读者通过它直接跳到某个方法，所以没有出现在列表中的方法，就是读者找不到的方法。 这个列表不需要手写。 下面的章节分别用页面支持的三种方式注册方法，它们共同生成了本页的列表。

写完页面后，请打开页面查看方法列表。 如果缺少某个方法，或列出了错误的名称，请在标题上声明。

### 在标题上声明

这是显式的方式，并且始终优先。 该属性在页面上不可见，不会改变锚点，并且原样复制到中文页面，因为方法名在所有语言中都相同。 带有 `methods` 的章节只会列出这些名称，`{methods=""}` 则什么都不列出。 它可以与固定锚点一起使用：`{#input methods="Input InputInt"}`。

````md demo
### 获取数据 {methods="Get GetString Pull"}

```go
value := facades.Cache().Get("user", "default")
name := facades.Cache().GetString("name")
token := facades.Cache().Pull("token")
```
````

### 在正文中写出方法名

没有该属性时，如果正文用行内代码写出了方法名，并且同一章节的代码调用了它，该方法就会被列出。 链接会定位到这句话。

````md demo
### 检查和删除数据

你可以使用 `Has` 方法检查数据是否存在，使用 `Forget` 方法删除一条数据，使用 `Flush` 方法删除全部数据：

```go
if facades.Cache().Has("user") {
	facades.Cache().Forget("user")
}

facades.Cache().Flush()
```
````

### 使用方法名作为标题

在每个方法一小节的参考类页面中，标题就是方法名：包含内部大写字母的名称（如 `WithSession`）、用 ` / ` 连接的多个名称、行内代码（如 `path.App()`），或者被本章节代码调用的单个单词。

````md demo
#### Forever

```go
facades.Cache().Forever("site", "goravel.dev")
```

#### Add

```go
stored := facades.Cache().Add("user", "Goravel", 5*time.Minute)
```
````

较长的页面也可以在开头放一个表格。 第一格是方法名、第二格链接到本页锚点的每一行都会被列出。

## 提示块

需要读者特别留意的内容请使用提示块。 不要用纯文本写 `注意：`、`提示：` 或 `警告：`。

| 你想要 | 使用 |
| ------ | ---- |
| 帮助读者做得更好 | `::: tip` |
| 补充读者可以跳过的背景 | `::: info` |
| 避免读者感到意外 | `::: warning` |
| 避免数据丢失或生产环境故障 | `::: danger` |
| 把很长的配置收起来 | `::: details 标题` |

````md demo
::: tip
一个捷径，或者读者正在做的事情的更好做法。
:::

::: info
读者可以跳过的背景信息。
:::

::: warning 零值会被忽略
类型后面的文字会成为标题。
:::

::: danger
会导致数据丢失或生产环境故障的内容。
:::

::: details 查看完整配置
折叠的内容，读者需要时再展开。
:::
````

## 代码块

### 文件名标题

当第一行只是一条包含文件路径的注释时，它会成为代码块的标题。 `//`、`#` 和 `--` 注释都适用。 使用了行高亮的代码块会保留这行注释。

````md demo
```go
// config/cache.go
"default": "memory",
```
````

### 行高亮和单词高亮

````md demo
```go{2}
func Boot() {
	facades.Route().Run()
}
```

```go /taskController/
facades.Route().Get("/tasks", taskController.Index)
```
````

### 变更、警告和错误

在行尾的注释中写入标记。 `// [!code focus]` 会模糊其他所有行，直到读者将鼠标悬停在代码块上。 如需展示整个文件修改前后的对比，请使用 `diff` 语言。

````md demo
```go
facades.Log().Debug("removed") // [!code --]
facades.Log().Info("added")    // [!code ++]
facades.Log().Warn("careful")  // [!code warning]
facades.Log().Error("bad")     // [!code error]
```
````

### 代码组

同一步骤有多种形式时使用代码组，例如两种驱动或两种操作系统。 标签会成为选项卡，文件名或常见工具名会自动显示图标。

````md demo
::: code-group

```go [main.go]
package main

func main() {}
```

```shell [run]
go run .
```

:::
````

### 单行命令

所有代码块默认显示行号。 单行命令可以关闭行号。

````md demo
```shell:no-line-numbers
go run . artisan key:generate
```
````

## 表格和行内元素

表格的第一列请保持简短，因为它不会在名称中间换行。 包含超宽表格的页面可以在 frontmatter 中使用 `aside: false` 隐藏大纲。

````md demo
| Facade | 用途 | 起始版本 |
| ------ | ---- | -------- |
| `AI` | 代理和工具 | <Badge type="tip" text="v1.18" /> |
| `Telemetry` | 追踪、指标和日志 | <Badge type="tip" text="v1.18" /> |

按 <kbd>Ctrl</kbd> + <kbd>K</kbd> 打开搜索。

- [x] 已完成的步骤
- [ ] 未完成的步骤

| 功能 | Laravel | Goravel |
| ---- | ------- | ------- |
| Grpc | <Brand laravel no /> 未内置 | <Brand goravel /> `facades.Grpc()` |
````

徽章的类型可以是 `info`、`tip`、`warning` 或 `danger`。

## 用词

- 用“你”称呼读者，使用现在时：“`Get` 方法返回该数据。”
- 句子保持简短，一句话只表达一个意思。
- 去掉“只需”“简单地”“轻松地”和“显然”。 如果真的显而易见，读者就不会来看文档了。
- 同一页面中，一个事物只用一个词。 不要对同一个东西交替使用“驱动”“存储”和“适配器”。
- 方法、文件、配置项、命令和值的名称使用行内代码。
- 不要写会过时的数字，例如有多少个 facades、驱动或 star。
- 说明它做什么，而不是它有多好：写“最多同时运行十个进程”，不要写“强大的并发引擎”。

## 两种语言

- 每个页面在 `en/` 和 `zh_CN/` 中都存在，标题及其顺序、代码块保持一致。 请在同一个 PR 中修改两种语言。
- 翻译正文。 代码、方法名、文件路径、配置项和 `methods` 属性保持原样。
- 使用指向 `.md` 文件的相对路径链接页面，例如 `../architecture-concepts/facades.md#安装-卸载-facades`。
- 锚点是标题转为小写、空格替换为连字符后的结果。 中文页面使用中文锚点，不要把英文锚点复制到中文页面。 如果标题以后可能改名，请为它指定固定的锚点：`### 更新字段 {#update-columns}`。
- 新页面需要同时加入 `.vitepress/config/en.ts` 和 `.vitepress/config/zh_CN.ts` 的侧边栏。

## 浅色与深色

使用顶部栏的按钮切换主题，并在两种主题下检查你的页面。

- 不要在页面中直接写颜色值。 原始 HTML 请使用主题变量：文字用 `var(--g-ink)`，次要文字用 `var(--g-grey)`，分隔线用 `var(--g-line)`，强调色用 `var(--g-cyan)`，代码背景用 `var(--g-code)`。
- 图片请使用透明背景，并确保在深色背景上依然清晰，或者为图片提供自己的纯色背景。

## 提交 PR 之前

- [ ] `pnpm docs:build` 构建通过
- [ ] 每个章节的标题说明了任务，第一句话写出了方法名
- [ ] 每个示例都完整，以文件路径开头，并且使用框架中真实存在的方法
- [ ] 每个代码块都标明了语言，shell 注释使用 `#`
- [ ] 页面上的方法列表包含了本页介绍的每个方法
- [ ] 中英文页面的标题和代码块一致，中文页面使用中文锚点
- [ ] 你已在浅色和深色两种主题下查看过页面
