---
title: "Weird behavior in Go: encoding/gob"
categories:
  - cs
tags:
  - gob
  - golang
  - workrecord
---

Consider the following program:

```go
type AState uint8

const (
	S1 AState = iota
	S2
	S3
)
```

This is quite usual in Go. But we want to make it more expressive. So we have:

```go
func (s *AState) ToS1() { *s = S1 }
func (s *AState) ToS2() { *s = S2 }
func (s *AState) ToS3() { *s = S3 }
```

p.s. Replace `ToS1` and others functions with meaningful names since it's a real case in the product, I don't want to show them directly.

Now consider a structure:

```go
type Foo struct {
	AState *AState
}
```

With decoding:

```go
	foo := NewFoo()
	var buf bytes.Buffer
	enc := gob.NewEncoder(&buf)
	_ = enc.Encode(foo)
	unmarshalFoo := &Foo{}
	decBuf := bytes.NewBuffer(buf.Bytes())
	dec := gob.NewDecoder(decBuf)
	dec.Decode(unmarshalFoo)
```

Guess what, the field `AState` has `nil` value. This is out of expected. A least, I thought it should be a pointer to `S1` as what `"encoding/json"` does.

We have two ways to solve this.

First, remove the pointer from the field type.

```go
type Foo struct {
	AState AState
}
```

Or we can use `iota + 1`

```go
const (
	S1 AState = iota + 1
        // ...
)
```
