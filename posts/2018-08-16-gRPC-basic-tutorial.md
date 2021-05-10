---
title: "gRPC quick start in Go"
categories:
  - cs
tags:
  - networking
  - gRPC
  - golang
---

What is RPC? RPC means "remote procedure call". The concept is call remote function as local function.

Then gRPC? It is a framework that help you create RPC.

Traditional RPC has some problem make it hard to use. For example, how do you know, what type of message you get?

Usually, we use JSON or others format. But marshal & unmarshal quickly became a big issue.
Because as time goes on, we don't actually know which service use which field, thus we can't reduce anything.

And server & client will get more further more far for same reason.

These all, won't be an issue in gRPC.

In gRPC, you define a `*.proto` file for your service.

At here, we will create one named `UserService`

```protobuf
syntax = "proto3";

package user;

service UserService {
  rpc GetUser (Empty) returns (User) {}
}

// define message type
message Empty {}
message User {
  string name = 1;
  int32 age = 2;
}
```

To generate code, I usually use `go generate ./...`

So let's have a file `gen.go`, just leave a comment about what command you want to execute.

```go
//go:generate sh -c "protoc -I./user --go_out=plugins=grpc:./user ./user/*.proto"
```

Implement service:

```go
import "path/to/grpc_generated/user"

type UserService struct{}

func (us *UserService) GetUser(ctx context.Context, u *user.Empty) (*user.User, error) {
    return &user.UserName{
        Name: "Danny",
		Age:  21,
    }, nil
}
```

Create server:

```go
import (
	"net"
	"path/to/grpc_generated/user"
	"google.golang.org/grpc"
)

func main() {
	l, err := net.Listen("tcp", ":50051")
	// handle err
	server := grpc.NewServer()

	service := user.UserServiceServer(&UserService{})
	user.RegisterUserServiceServer(server, service)

	err = server.Serve(l)
	// handle err
}
```

Final is our client:

```go
import (
	"fmt"
	"net"
	"path/to/grpc_generated/user"
	"google.golang.org/grpc"
)

func main() {
	conn, err := grpc.Dial("localhost:50051", grpc.WithInsercure())
	// handle err
	defer conn.Close()
	client := user.NewUserServiceClient(conn)
	u, err := client.GetUser(context.Background(), &user.Empty{})
	// handle err
	fmt.Printf("Name: %s, Age: %d", u.Name, u.Age)
}
```

After that, run `go generate ./...` from project root dir.

Then `go run server.go`, open another terminal, `go run client.go`

I usually won't commit generated code(unless commit it is make sense), so I usually will write `*.pb.go` in file `.gitignore`

More info:

- [grpc.io](https://grpc.io/)
