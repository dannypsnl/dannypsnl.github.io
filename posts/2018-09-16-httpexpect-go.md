---
title: "Use httpexpect to test server"
categories:
  - cs
tags:
  - http
  - testing
  - networking
  - golang
---

Use builtin functionality to test a Go server is a panicful experience.
The problem is because we have to handle too many error and get so much thing we aren't always need.

Of course, we will create a abstraction to reduce this panic.
But if we already have a mature solution? That is [httpexpect](https://github.com/gavv/httpexpect)

We have two options about import:

- `import "github.com/gavv/httpexpect.v1"`
- `import "github.com/gavv/httpexpect"`

The different is `v1` is stable branch, another is `master` branch on github.

I suggest pick stable one for company project, but it's fine to use `master` branch at side project.

`httpexpect` works pretty good with `httptest`. A simple example:

```go
type fakeHandler struct {
}

func (h *fakeHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "Hello")
}

func TestIt(t *testing.T) {
	handler := &fakeHandler{}
	server := httptest.NewServer(handler)
	defer server.Close()

	e := httpexpect.New(t, server.URL)

	e.GET("/").
		Expect().
		Status(http.StatusOK).
		Body().Equal("Hello")
}
```

How about add form value?

```go
e.PATCH("/test/patch").WithFormField("value", "patch").
	Expect().Status(http.StatusOK).
	Body().Equal("patch")
```

JSON response?

```go
e.POST("/post").
	Expect().Status(http.StatusOK).
	ContentType("application/json", "").
	JSON().Equal(expected)
```

Query?

```go
e.GET("/user").WithQuery("name", "Danny").
	Expect().Status(http.StatusOK).
```

Hope you would feel happy with this little introduction.
