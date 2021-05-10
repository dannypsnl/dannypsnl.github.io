---
title: "llvm Go bindings"
categories:
  - cs
tags:
  - llvm
  - golang
---

Use command<br>
`$ go get -d llvm.org/llvm/bindings/go/llvm`<br>
to get llvm project
Then<br>
`$ cd $GOPATH/src/llvm.org/llvm/bindings/go/llvm`  
Then  
`$ mkdir workdir && cd workdir && mkdir llvm_build`  
Then go back to dir go/llvm  
`$ ./build.sh -DCMAKE_BUILD_TYPE=Release`  
I had installed Ninja, then build script use it to build system.
I am not sure if you didn't install it, can compile or not.(Maybe will invoke make)

After those steps.
You can create a main.go
package main

```go
import (
    "fmt"
    "llvm.org/llvm/bindings/go/llvm"
)

func main() {
    m := llvm.NewModule("hello")
    fmt.Println(m)
}
```

Then go run the main file.
You will see some LLVM IR
It contains module information.
Thanks for see.
