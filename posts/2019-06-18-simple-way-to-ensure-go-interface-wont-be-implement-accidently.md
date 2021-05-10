---
title: "A simple way to ensure interface won't be implemented accidently"
categories:
  - cs
tags:
  - golang
---

Sample code is quite easy:

```go
type Car interface {
	impl() Car
	Move()
}

type Animal interface {
	impl() Animal
	Walk()
}
```

Now, let’s create a structure type:

```go
type Duck struct {
	Animal
}
```

Now, if you add `func (d *Duck) Move()`, you won’t be a car accidently! What if you want to embed two interfaces?

```go
type Duck struct {
	Car
	Animal
}
```

The compiler would refuse the code since: `Duck.impl is ambiguous`, you can’t have two methods with the same name in Go definition. So we can use this to create something just like `impl Trait for Type` in Rust, although this is a workaround,but anyway I work with Go so I have to find out how to ensure this when we need it.

If you want to know what if we want something just take type has `Move()` method? Then just define:

```go
type Movable interface {
	Move()
}
```

The point is correctly reduce the concept in interface, and do not create interface has general name, unless you know what are you doing,but if you need a workaround, this is.

Since Go can’t write: `func foo(bar A + B + C)`, `A`, `B`, `C` are `interface`, so I suggest write:

```go
func foo(bar interface{
	A
	B
	C
})
```

> NOTE: newline is required, because Go compiler is stupid. You might want define a private interface for this function only.

Sad thing is we can’t use `A | B | C`, have to do runtime assertion for this.

One more bad thing is because you embedded the interface, Go won’t check you provide the implementation of methods or not, you have to do this manually.
