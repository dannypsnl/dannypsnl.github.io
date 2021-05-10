---
title: "The best practice of Singleton in Golang"
categories:
  - cs
tags:
  - golang
  - DesignPattern
---

## How to implement singleton in Go?

It's really a problem at there. And worth to think about it.

### Start

Let's consider how to create a singleton?
We need a reference can't be change by anyone at all the time except initialize.

It's possible in Go? Yes, package level reference.

```go
var s *singleton
```

What's next? It have to be initialize before using. Basic implementation you can easier thought out is

```go
func GetInstance() *singleton {
    if s == nil {
        s = &singleton{} // for clean, nothing at here
    }
    return s
}
```

Seems perfect, but buggy actually. Why?

Because the check can facing the race condition when using a lot goroutine access our singleton.

Now we know the problem, how to solve it?

We have two choices. One is `init` God function, another is `sync.Once` let only do once all the time.
Let's start from first solution.

```go
func init() {
    s = &singleton{}
}

func GetInstance() *singleton {
    return s
}
```

Why this will work? Because `init` must be execute after anything trying to using anything in a package.
So here `s` will be initialize before this package be using. And the race condition won't exist by Go's guarantee.

Second way is `sync.Once`.

```go
var once sync.Once

func GetInstance() *singleton {
    once.Do(func() {
        s = &singleton{}
    })
    return s
}
```

Because `sync.Once` will do one time at all process. So it will be a safety way to initialize the singleton
