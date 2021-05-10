---
title: "Go quick start"
image: ../images/golang/gopher.png
categories:
  - cs
tags:
  - golang
---

I am going to show you enough knowledge to getting start with Go. Are you ready?

## Variables

In Go, we have `const`, `var` & short declaration & definition.

In top scope of Go program(out of function)

```go
const C = "constant"
var   V = "var"
```

We can use a lazy way to do this when we have a lots variables(p.s. `var` work as `const`)

```go
const (
	C  = 1
	C1 = 2
	C2 = 3
)
```

In `func`(Go's function keyword), we can have `const`, `var` & short.

```go
func main() {
	a := 0 // short
	var b = 1
	const c = 2
}
```

Important thing about short format is it can only have `variableName := value`, not thing more

We also can have type after variable name, e.g. `var a int = 1`.
But we usually don't do this.

An important concept is we can't have any variable is unused in Go.
They will cause compile error.

## Function

We use `func` to start a function definition.

```go
func foo() {}
```

Format of function define is: `func funcName(parameterList) returnType { body }`

That's hard to use description to show you how it work, so let's look an example.

```go
func add(lv, rv int) int {
	return lv + rv
}
// Use
a := add(1, 2)
// a == 3
```

As you can see, we can omit type if parameter has the same type, we use last one as rest type.

An important thing is we can return several type at one function.

```go
func Lookup(name string) (age int, error) {
	age, ok := aMap[name]
	if !ok {
		return 0, fmt.Errorf("do not have this user: %s", name)
	}
	return age, nil
}
```

And here shows an interesting code: `age int`, yes, we can give return value a name.
So that we can assgin value to it & show what it is.

## Structure

Use a real world example might be better. So here we create a type for user

```go
type User struct {
	Name string
	Age  int
}
```

So, maybe you already start to think OOP, but not, Go is not an OOP language, why? Let me show you.

```go
func (u *User) SetName(newName string) {
	u.Name = newName
}

func (u User) GetName() string {
	return u.Name
}
```

This is how we create `user.Method()` in Go. Focus on `receiver`(we call `u *User` this part receiver).
In `GetName`, if you try to modify `u.Name`, yes, it works, but won't affect the `Name` of the object you use to call `GetName`.

Then why `SetName` can do that successful? Because it use **pointer receiver**! So now I can tell you, that is just a syntax sugar like:

```c
char* user_get_name(struct user u) {
  return u.name;
}
// In use
struct user *u = &(struct user) {
  .name = "Danny",
  .age  = 21
};
char* name = user_get_name(*u);
```

## Collection

We all know Go do not have generic, but some times generic is useful, so that's why there has some built-in collection can work with
different type in Go.

- map
- array/slice

The map would like:

```go
m := map[string]int {
	"Danny": 21,
	"Ben":   40,
}
```

Format is `map[type]type`, you can pick any type at there.

Array & Slice is very similar but different, and that is not my point so I won't talk about that.
The format is `[]type`, as map, you can change type part.

## Interface

Interface is a very important part in Go. Because this model helps us work without inherit system like `Java` or `C++`.

Interface looks like:

```go
type Stringer interface {
	String() string
}
```

We just left a function type at there. Wait, how to use it?
No worries, any types own a function `String() string` is type `Stringer`.

That's how it works. So, we even can do this:

```go
type UserDatas map[string]int // map of name to age
func (udatas UserDatas) String() string {
	// ignore
}
```

## Goroutine & Channel

In Go, we use goroutine & channel control our concurrency system.

What is goroutine? goroutine is a routine running some task & be managed by Go runtime.
How to create one?

```go
go func() {
	fmt.Println("Hi")
}()
```

We use keyword `go` with a function call to start one. Who destory it? Go runtime.
So that's why we don't need to worry about it's resource.

But how we get the data after it complete the task?
That's why we have **channel**.

```go
// main
result := make(chan int)
go func() {
	for i:=0; i<10; i++ {
		result <- i*2 // write into channel
	}
}()
// range over channel
for elem := range result {
	fmt.Println(elem)
}
```

The flow like:

```
main
 | \
 |  | for 0..9, result <- i*2
 | / f1 done
 |
 | read from channel
 |
main done
```

The range over channel & write into channel is conceptly run at the same time.
This is how concurrency looks like in Go.

## main

In Go, an executable required two things.

- In package `main`
- `func main()`

The simplest file is:

```go
package main

func main() {}
```

## package

Finally, we talk about package.
In Go, package just some files in the same directory with the same package name.
Then we use environment variable `GOPATH` to search it.

So how import looks like?

```go
import "github.com/dannypsnl/rocket"
```

At here, we import the package under `$GOPATH/src/github.com/dannypsnl/rocket`.
Of course, we don't have one at there, so now we can execute a command:
`go get ./...`.
The command will trying to solve dependency we need. So it will download `github.com/dannypsnl/rocket` into your \$GOPATH

This is the quick start of Go. Thanks for reading, byebye.
