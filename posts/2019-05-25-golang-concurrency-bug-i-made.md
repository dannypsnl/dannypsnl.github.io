---
title: "The Go concurrency bug I made"
categories:
  - cs
tags:
  - golang
  - concurrency
  - workrecord
---

There is a saying:

> I never had a slice of bread particularly large and wide that did not fall upon the floor and always on the buttered side

Even I already work with Go for almost 3 years, I still made these stupid bugs.
But learning from errors is why we are professional enigneer.
So I'm going to list the bug I made, and show how to avoid it.

### 1 select with generator

```go
func events() <-chan int {
    ch := make(chan int)
    go func() {
        for {
            ch <- 1
        }
    }()
    return ch
}

func main() {
    for {
        select {
        case i := <- events():
            println("i=", i)
        }
    }
}
```

We using a common generator pattern here, and `select` also is quite normal case, the problem at here is select would call `events` not just once!
This loop would create new channel for every `case` statement! And leaving infinite go-routine that nobody care!

To avoid the problem, you have to using `range`:

```go
func main() {
    for i := range events() {
        // ...
    }
}
```

But if you want to stop this looping, which means you still need to use `select`, then store the channel to other place is required.
There are many ways to do that:

- In structure:

  ```go
  type eventGenerator struct {
      eventCh chan int
      ctx     context.Context
      cancel  context.CancelFunc
  }

  func NewEventGenerator(ctx context.Context) *eventGenerator {
      // better to get context from others place, even this is a most up level controller
      // because you can use `context.Background()` as argument if this is the most up level one
      ctx, cancel := context.WithCancel(ctx)
      return &eventGenerator{
          // don't forget to `make` a channel,
          // if you skip it, Go won't give you any warning
          // And anything you try to send to it would be ignored!
          // No Warning!
          eventCh: make(chan int),
          ctx: ctx,
          cancel: cancel,
      }
  }

  func (e *eventGenerator) Start() {
      go func() {
          defer close(e.eventCh)
          for {
              select {
              case _, closed := <- e.ctx.Done():
                  if closed {
                      return
                  }
              default:
                  e.eventCh <- 1
              }
          }
      }()
  }
  func (e *eventGenerator) Events() <-chan int { return e.eventCh }
  func (e *eventGenerator) Close() { e.cancel() }
  ```

  Now you can write `case <-eg.Events():` as you want after calling `eg.Start()` and stop it by `eg.Close()`

- generator with outside channel
  ```go
  func genEvents(ch chan int) {
      go func() {
          for {
              ch <- 1
          }
      }()
  }
  func main() {
      d := time.Now().Add(50 * time.Millisecond)
      ctx, cancel := context.WithDeadline(ctx, d)
      defer cancel()
      ch := make(chan int)
      genEvents(ch)
      for {
          select {
          case i := <-ch:
              println("i=", i)
          case <-ctx.Done():
              println("main:", ctx.Err().Error())
              close(ch)
              return
          }
      }
  }
  ```

### 2 misuse context.Done()

Let's assuming there is a `epoll` like function call `recv()`, you would get something from it and deal with it, but it's not based on channel,
which means you can't use it as `case` of `select`, how to deal with it?

```go
func handlingRecv(ctx context.Context) <-chan interface{} {
    ch := make(chan interface{})
    go func() {
    defer close(ch)
        for {
            data := recv()
            var v interface{}
            err := json.Unmarshal(data, v)
            // ignore error handing
            ch <- v

            select {
            case _, closed := <-ctx.Done():
                return
            }
        }
    }()
    return ch
}
```

Code looks good? No, in fact the `select` would be blocked until this context be canceled,
which means you can only get one message from `recv()`, and no warning, looks like a **NICE** networking problem,
but it's a bug of code actually.

This bug is easy to fix, in fact, easier than previous one a lot.

```go
select {
case _, closed := <-ctx.Done():
    return
default:
    // move job to here
}
```

So easy, we just based on the fact, if no case in, it would do `default` block work

### Conculsion

The bug show here might be is not hard to solve, but since everything could go wrong would go wrong,
I still wrote it done and if it's helpful that would be so great. Thanks for read.
