---
layout: post
title: "Error is Value"
categories: golang errors
tags:
  - golang
  - errors
---

I think most of Gopher had read [error-handling-and-go](https://blog.golang.org/error-handling-and-go)

Has anyone had watched [Go Lift](https://www.youtube.com/watch?v=1B71SL6Y0kA)?

Let's getting start from **Go Lift**!

The point of **Go Lift** is: Error is Value.

Of course, we know this fact. But do you really understand what that means?

In **Go Lift**, **John Cinnamond** mentions a trick about wrapping the error by command executor.

For example, we create a connection to `server:6666` by TCP.

```go
conn := net.Dial("tcp", "server:6666")
```

Can we? Ah..., No!

Correct code is

```go
conn, err := net.Dial("tcp", "server:6666")
if err != nil {
    panic(err)
}
```

Then we writing something to the connection.

```go
nBtye := conn.Write([]byte{`command`})
```

We want that, but the real code is

```go
nBtye, err := conn.Write([]byte{`command`})
if err != nil {
    panic(err)
}
// using nByte
```

Next, we read something from `server:6666`, so we create a reader.

```go
reader := bufio.NewReader(conn)
response := reader.ReadString('\n')
```

No! We have to handle the error.

```go
response, err := reader.ReadString('\n')
if err != nil {
    panic(err)
}
// using response
```

But the thing hasn't ended yet if we have to rewrite the command if response tells us the command fail?

If we are working for a server, we can't just panic?

So **Go Lift** has a solution:

```go
func newSafeConn(network, host string) *safeConn {
    conn, err := net.Dail(network, host)
    return &safeConn{
        err: err,
        conn: conn, // It's fine even conn is nil
    }
}

type safeConn struct {
    err error

    conn net.Conn
}

func (conn *safeConn) Write(bs []byte) {
    if conn.err != nil {
    // if contains error, do nothing
        return
    }
    _, err := conn.Write(bs)
    conn.err = err // update error
}

func (conn *safeConn) ReadString(delim byte) string {
    if conn.err != nil {
        return ""
    }
    reader := bufio.NewReader(conn.conn)
    response, err := reader.ReadString("\n")
    conn.err = err
    return response
}
```

Then usage will become

```go
conn := newSafeConn("tcp", "server:6666")
conn.Write([]byte{`command`})
response := conn.ReadString('\n')

if conn.err != nil {
    panic(conn.err)
}
// else, do following logic
```

But can we do much more than this?

Yes! We can have an error wrapper for executing the task.

```go
type ErrorWrapper struct {
    err error
}

func (wrapper *ErrorWrapper) Then(task func() error) *ErrorWrapper {
    if wrapper.err == nil {
        wrapper.err = task()
    }
    return wrapper
}
```

Then you can put anything you want into it.

```go
w := &ErrorWrapper{err: nil}
var conn net.Conn
w.Then(func() error {
    conn, err := net.Dial("tcp", "server:6666")
    return err
}).Then(func() error {
    _, err := conn.Write([]byte{`command`})
})
```

Wait! But we need to send the connection to next task without an outer scope variable. But how to?

Now let's get into `reflect` magic.

```go
type ErrorWrapper struct {
    err         error
    prevReturns []reflect.Value
}

func NewErrorWrapper(vs ...interface{}) *ErrorWrapper {
    args := make([]reflect.Value, 0)
    for _, v := range vs {
        args = append(args, reflect.ValueOf(v))
    }
    return &ErrorWrapper{
        err:         nil,
        prevReturns: args,
    }
}

func (w *ErrorWrapper) Then(task interface{}) *ErrorWrapper {
    rTask := reflect.TypeOf(task)
    if rTask.NumOut() < 1 {
        panic("at least return error at the end")
    }
    if w.err == nil {
        lenOfReturn := rTask.NumOut()
        vTask := reflect.ValueOf(task)
        res := vTask.Call(w.prevReturns)
        if res[lenOfReturn-1].Interface() != nil {
            w.err = res[lenOfReturn-1].Interface().(error)
        }
        w.prevReturns = res[:lenOfReturn-1]
    }
    return w
}

func (w *ErrorWrapper) Final(catch func(error)) {
    if w.err != nil {
        catch(w.err)
    }
}
```

Now, we coding like

```go
w := NewErrorWrapper("tcp", "server:6666")

w.Then(func(network, host string) (net.Conn, error) {
    conn, err := net.Dail(network, host)
    return conn, err
}).Then(func(conn net.Conn) error {
    _, err := conn.Write([]byte{`command`})
    return err
}).Final(func(e error) {
    panic(e)
})
```
