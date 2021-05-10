---
title: "gRPC proxy: approach & pain"
categories:
  - cs
tags:
  - gRPC
---

A few weeks ago, we re-discuss the config setup issue; we found generating a new, valid config is too hard for anyone.
You must remember all the field, what we need at this time, some duplicate, some would change by the environment,
all the stuff became a setting nightmare!

So we start an epic to simplify the config definition and generation; one of these tasks was to create a CLI for config control.
And we have to let customer could upload or download their configs by this CLI tool
. We have some gRPC services for internal exchanging configs, so we want to reuse them,
and we have an api-gateway for security filtering the connection already, so we also want to base on it
. Then I start my researching about gRPC proxy server.

The thing we found was: [https://github.com/mwitkow/grpc-proxy](https://github.com/mwitkow/grpc-proxy).
It's a proxy base on gRPC stream. And it's easy to set up. That's the main reason we pick it. A prototype didn't take a long time:

```go
server := grpc.NewServer(
    grpc.CustomCodec(proxy.Codec()),
    grpc.UnknownServiceHandler(proxy.TransparentHandler(director)))

func director(ctx context.Context, fullMethodName string) (context.Context, *grpc.ClientConn, error) {
  // ignore implementation of dispatching to different service part
  // I would mention it later
}
```

And I found the gRPC server is `http.Server`, sounds great!

```
func AddRoutes(group *gin.RouterGroup) {
    group.POST("/", func(c *gin.Context) {
        server.ServeHTTP(c.Writer, c.Request)
    })
}

// main
g := handler.Group("/grpc")
AddRoutes(g)
```

Everything looks great; we send the request to our `domain/grpc` as our gRPC endpoint.
But that won't work! gRPC basing on HTTP/2, and the request path of the gRPC request is `/packageName.ServiceName/RPCName`,
and it's hardcode in generated `*.pb.go` files. Means we can't change the path of it to `/grpc` endpoint,
and we also can't add this subpath into the domain argument of `grpc.Dial` this function, of course,
we could add some hacks to changing the path, and it's workable. But that's impossible to ask every user to do that.
And emit gRPC as wildcard path in `gin` is very hard to correct it, although it could be(since gRPC path format is quite not normal,
that's have meager rate we created some paths like that), so we buy another domain for the gRPC endpoint.

Now, the code would be:

```go
// We were switching the emit group by domains
// this is part of the grpc domain
g := handler.Group("/")
AddRoutes(g)

func AddRoutes(group *gin.RouterGroup) {
    // we won't use that wildcard path directly but still have to write it down for path matching
    group.POST("/*path", func(c *gin.Context) {
        server.ServeHTTP(c.Writer, c.Request)
    })
}
```

Now let's back to the dispatching request part, in `director`, we have `fullMethodName`,
which is the gRPC request path, we could use it as our target recognize:

```go
func director(ctx context.Context, fullMethodName string) (context.Context, *grpc.ClientConn, error) {
    // we use config to expose the services and store in a map
    // here is just a pseudo code, but got the idea is enough
    target, exist := services[fullMethodName]
    if !exist {
        return ctx, nil, fmt.Errorf("no service found for %s", fullMethodName)
    }
    clientConn, err := grpc.DialContext(
        ctx,
        target,
        grpc.WithCodec(grpcproxy.Codec()),
        // ignore TLS part, but that's very easy to get it from official guide
    )
    return ctx, clientConn, err
}
```

The article is short; we also found a lot of problems with this task, hope you can even get some fun with this,
just like us, pain but joy, peace.
