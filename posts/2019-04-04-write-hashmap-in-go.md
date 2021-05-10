---
title: "Write a hashmap in Go"
categories:
  - cs
tags:
  - data-structure
  - golang
---

> Just a note

Hash map is a data structure that helps you associate a key type to a value type. For example, a string map to the boolean value.

I choose an easy way to create one, that's an array to a list. The type definition was:

```go
type Node struct {
    key   string
    value interface{}
}

type HashMap struct {
    size    int
    buckets [][]Node
}
```

`buckets` stores a list of list of `Node`, `Node` is a key/value pair.
The principle of this implementation is the hash function would uniform the index of the bucket, the reason for the bucket is a list is because if we have the same hash for a different key, then we append the new `Node` into the same bucket or update if it exists in the bucket, that's why we have to store the key/value pair.

`size` is the length of buckets, but we aren't going to count it every time, so we store it in the structure.

### Jenkins Hash

reference: [https://en.wikipedia.org/wiki/Jenkins_hash_function](https://en.wikipedia.org/wiki/Jenkins_hash_function)

```go
// uint32 at here is very important,
// since Go using int to index slice([]T),
// at 64-bits system uint would be uint64 and would overflow while
// we convert hash value to int(would be int64 in this context).
// So we pick uint32 for 64-bits system(my test environment)
func JenkinsHash(key string) uint32 {
    var h uint32
    for _, c := range key {
        h += uint32(c)
        h += (h << 10)
        h ^= (h >> 6)
    }
    h += (h << 3)
    h ^= (h >> 11)
    h += (h << 15)
    return h
}
```

> could try to extend the definition, using others type than string for hashing

### Get and Set

```go
// getIndex is a help function for Get and Set
func (h *HashMap) getIndex(k string) int {
    return int(JenkinsHash(k)) % h.size
}

func (h *HashMap) Get(k string) interface{} {
    index := h.getIndex(k)
    bucket := h.buckets[index]
    // linear searching the node in bucket,
    // because the bucket should be a small list,
    // so it should not take too long time.
    // This is why hash function and size of buckets does important
    for _, node := range bucket {
        if node.key == k {
            return node.value
        }
    }
    return nil
}

func (h *HashMap) Set(k string, v interface{}) {
    index := h.getIndex(k)
    bucket := h.buckets[index]
    for i := range bucket {
        n := &bucket[i]
        if n.key == k { // existed node
            n.value = v
            // early return while updated
            return
        }
    }
    // append into bucket
    h.buckets[index] = append(h.buckets[index], Node{key: k, value: v})
}
```
