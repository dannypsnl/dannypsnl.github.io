---
title: "Testing in Go"
categories:
  - cs
tags:
  - golang
  - testing
  - debug
---

Just list some testing way in Go.

Basically we use `testing` this built-in lib to testing

To start your first test with Go is an easy task.

Example(we would test the following function under directory `add`)

```go
package add

func Add(x, y int) int { return x + y }
```

1. create a file contains suffix `_test`, it would be a test file, e.g. `add_test.go`
2. create a function in test file has prefix `Test`, use `t *testing.T` as it's parameter

   ```go
   package add

   import "testing"
   func TestAdd(t *testing.T) {
   	if Add(1, 2) != 3 {
   		t.Errorf("Add(1, 2) should be 3 but: %d", Add(1, 2))
   	}
   }
   ```

3. type `go test` & execute it in terminal

Ok, now we got a test, if you see the error message then must something wrong about your implementation of `Add`

> p.s. Usually we won't use `go test` but `go test ./...` because we would have a lots of package under a project, `./...` would find out every sub directory(those can be a go package) & run test

We have `func (*testing.T) Run(subTestName string, subTest func(t *testing.T))` this function, we can use it to create a new sub test.

```go
func TestCarFactory(t *testing.T) {
	factory := car.NewFactory()
	t.Run("Toyota", func(t *testing.T) {
		toyota := factory.Build(car.Toyota)
		// test toyota
	})
	t.Run("Mazda", func(t *testing.T) {
		mazda := factory.Build(car.Mazda)
		// test mazda
	})
}
```

Basically you can see sub test means we want to reuse same context for different tests,
or like me, just use it represents the test structure.

A practical problem is sometime we extract a test helper out of the test function.

For example:

```go
func assertNoError(t *testing.T, err error) {
	if err != nil {
		t.Errorf("assert no error but: %s", err)
	}
}
```

You will find all error say it happened at `t.Errorf` that line, but not the error actual happened place!

To solve this problem, you have to add `t.Helper()` this function call, according document:

> Helper marks the calling function as a test helper function. When printing file and line information, that function will be skipped. Helper may be called simultaneously from multiple goroutines.

I recommend [https://github.com/stretchr/testify](https://github.com/stretchr/testify) for assertion, **Don't Reinvent The Wheel!**(Some thing I always violate it)

And [https://github.com/gavv/httpexpect](https://github.com/gavv/httpexpect) is an awesome lib for web API testing.

A nice fact is, Go also help you create benchmark easy.

Still in test file, but use `Benchmark` as prefix of test.

```go
func BenchmarkAdd(b *testing.B) {
	for i := 0; i < b.N; i++ {
		Add(1, 2)
	}
}
```

To run benchmark needs argument `-bench`, it would like `go test -bench .`

Output:

```
goos: darwin
goarch: amd64
pkg: test
BenchmarkAdd-4          2000000000               0.61 ns/op
PASS
ok      test    1.285s
```

As `t.Run`, you can have `b.Run` in benchmark.

To get the nice analysis of program, you can use `go test -bench . -cpuprofile cpu.out -memprofile mem.out` to generate some profiles

Then use `go tool pprof -http=127.0.0.1:5000 cpu.out` to see the result on browser(if you are familiar with CLI mode, you can remove `-http` flag)

You can see something like:

```
----------------------------------------------------------+-------------
                                            1130ms   100% |   testing.(*B).launch /usr/local/Cellar/go/1.11.2/libexec/src/testing/benchmark.go:290
         0     0%   100%     1130ms 98.26%                | testing.(*B).runN /usr/local/Cellar/go/1.11.2/libexec/src/testing/benchmark.go:141
                                            1130ms   100% |   test.BenchmarkAdd /Users/dannypsnl/code/go/src/test/add_test.go:8
----------------------------------------------------------+-------------
```

At here example is too easy so nothing to show, in a real world code it would be pretty useful to know the hot point of the program.

> p.s. At profile example, `-bench` can't be omit, because we want something run a lots of time to detect it's real performance.

If you want to get the performance under real usage, you can import pprof into program:

```go
import (
	_ "net/http/pprof"
)
```

If your program is not a HTTP server, then you have to start one like:

```go
go func() {
	log.Println(http.ListenAndServe("0.0.0.0:6060", nil))
}()
```

The reason of `0.0.0.0` can reference to [https://stackoverflow.com/questions/20778771/what-is-the-difference-between-0-0-0-0-127-0-0-1-and-localhost](https://stackoverflow.com/questions/20778771/what-is-the-difference-between-0-0-0-0-127-0-0-1-and-localhost)

After these, you can run your program up then see your profile like `go tool pprof http://127.0.0.1:6060/debug/pprof/profile`

To get more info, you can reference:

- [https://golang.org/pkg/testing](https://golang.org/pkg/testing)
- [https://golang.org/pkg/net/http/pprof](https://golang.org/pkg/net/http/pprof)

Thanks for reading
