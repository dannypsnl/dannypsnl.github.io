---
title: "Create a WaitGroup by yourself"
categories:
  - cs
tags:
  - golang
  - concurrency
---

If you had wrote any concurrency code in Go.
I think you could seems `sync.WaitGroup` before.
And today point is focus on create a wait group by channel trick.

How?

First you need a channel without buffer.

```go
func main() {
    wait := make(chan struct{})
}
```

Then get something from it so if there has no value in `wait`, process keep going.
But if just trying to get something from a empty channel. You will get block and cause deadlock.
Then go will panic it. So we have to change the code a little bit but also be more extendable for next iteration.

```go
// ...
n := 0
wait := make(chan struct{})

for i := 0; i < n; i++ {
    <-wait
}
// ...
```

Now let's create works loop.

```go
import (
    "time"
)
// ...
n := 10000
wait := make(chan struct{})

for i := 0; i < n; i++ {
    time.Sleep(time.Microsecond)
    wait <- struct{}{}
}

for i := 0; i < n; i++ {
    <-wait
}
// ...
```

ps. These code has a little bug(you can try to find it, or read the answer at the end)

Now we can see it work. The reason of these code can work is because size n is our expected amount of workers.
After each worker done their jobs. They will send something(here is `struct{}{}`, but exactly is doesn't matter thing) into our `wait` channel.
We only read `n` things from `wait`.

So after `n` things be read. We won't be block any more even `wait` got new thing. Else we have to waiting `wait`.

Whole code dependent on this fact.
Having these knowledge, we can create ours `WaitGroup` now.

<script src="https://gist.github.com/dannypsnl/da6eee69239111ef025a6f00bf73faaf.js"></script>

As you can see, we use a type wrapping all the thing we need.(It's a basic idiom, so I don't want to say why)

Then method `Add` is preparing for `n` we talk before. Adding these thing in dynamic way.

Next `Done` do the thing as we manually do in previous code.

And `Wait` is read amount of things equal final `n`.

The end let's say what happened in previous code. You should closing the `channel` always.
So the code will be:

```go
// ...
wait := make(chan interface{})
defer close(wait)
// ...
```

Maybe you will feel confusing about this part. The reason is `channel` won't be collect by GC automatic(if it can, it will be another hell). So always closing it is important.

ps. In productive code, please still using the `sync.WaitGroup`, I do a test, `sync.WaitGroup` is 25% faster than the version you see at here.

### References:

#### [The Go programming language](http://www.gopl.io/)

- Author: Alan A. A. Donovan & Brian W. Kernighan
- ISBN: 978-986-476-133-3

#### [Concurrency in Go](http://shop.oreilly.com/product/0636920046189.do)

- Author: Katherine Cox-Buday
- ISBN: 978-1-491-94119-5
