---
title: "Reflection in Go: create a stack[T]"
categories:
  - cs
tags:
  - golang
  - reflection
---

Do you know what can Go's package `reflect` do?

Whatever you had use it or not. Understanding it is not a bad thing.

A well known thing is Go don't have generic, I'm not going to tell you we have generic, I'm going to tell you some basic trick to have the result like generic.

Real world example: [elz-lang/collection/stack](https://github.com/elz-lang/elz-go-backup/tree/master/collection/stack/stack.go)

Elz is a language I'm developing, but that's not the point. Point is this collection/stack using the trick I'm going to talk about.

Take a look on the type `Stack`

```go
type Stack struct {
	stack  []interface{}
	limitT *reflect.Type
}
```

`limitT` is a `*reflect.Type`, the reason that it's a pointer to `reflect.Type` rather than `reflect.Type` is because of we may do not spec it.

We add the `Stack<T>` by invoke `WithT`.

```go
func (s *Stack) WithT(v interface{}) *Stack {
	t := reflect.TypeOf(v).Elem()
	s.limitT = &t
	return s
}
```

Why is `reflect.TypeOf(v).Elem()`? Because we can't really get an instance that type is an interface! Instead of that, we can get a type is pointer to an interface!

We have a common idiom is using `(*SomeInterface)(nil)` to get pointer to interface instance.

Now we know that user code can be

```go
type AST interface {
    Gen() llvm.Value
}

// main
s := stack.New().WithT((*AST)(nil))
```

After we do that, user can't push a value do not implement `AST`.

So, how we do that? We do a check at `Push`

```go
func (s *Stack) Push(element interface{}) {
	if s.limitT != nil {
		if !reflect.TypeOf(element).Implements(*s.limitT) {
			panic(fmt.Sprintf("element must implement type: %s", *s.limitT))
		}
	}
	s.stack = append(s.stack, element)
}
```

If `limitT` is not `nil`, means we do not limit the type, just keep going on.

But if we limit the type, we check that `element` implements `limitT` or not.

If not, we panic the process.

Now we have a stack can promise type safe at runtime.
