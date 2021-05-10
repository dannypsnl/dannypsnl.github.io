---
title: "Sort by interface in Go"
categories:
  - cs
tags:
  - golang
---

Sort is an operation very often to use.
Although a `quick-sort` isn't too long. We still don't want to create it again and again.
It also don't have the value to copy it.

Good news is standard package `sort` provide a lots of sort function.
Unlike most language do, it's no association with type or data structure.
Function `sort.Sort` do not have any expected to it's target.
It use `sort.Interface` to detect how to work.

```go
package sort

type Interface {
    Len() int
    Less(i, j int) bool // i, j is index of element
    Swap(i, j int)
}
```

Let's start it.

<script src="https://gist.github.com/dannypsnl/1f4a59834aae245d3a9bc1613a26650b.js"></script>

Let me explain it.

- `Len` mean size of the target
- `Less` provide a common way to compare two elements in target
- `Swap` provide a common way to swap two elements

It just a concept. So let's dig into golang implementation.

```go
package sort
// 上省５００行...
func Sort(data Interface) {
  	n := data.Len()
  	quickSort(data, 0, n, maxDepth(n))
}
// 下略５００行...
// ps. No real 500
```

`Sort` is easier than my imagine. Awesome!

From this, we know have to go into `quicksort`.

```go
package sort
// 上省５００行...
func quickSort(data Interface, a, b, maxDepth int) {
  	for b-a > 12 { // Use ShellSort for slices <= 12 elements
  		if maxDepth == 0 {
  			heapSort(data, a, b)
  			return
  		}
  		maxDepth--
  		mlo, mhi := doPivot(data, a, b)
  		if mlo-a < b-mhi {
  			quickSort(data, a, mlo, maxDepth)
  			a = mhi
  		} else {
  			quickSort(data, mhi, b, maxDepth)
  			b = mlo
  		}
  	}
  	if b-a > 1 {
  		// Do ShellSort pass with gap 6
  		// It could be written in this simplified form cause b-a <= 12
  		for i := a + 6; i < b; i++ {
  			if data.Less(i, i-6) {
  				data.Swap(i, i-6)
  			}
  		}
  		insertionSort(data, a, b)
  	}
}
// 下略５００行...
```

`maxDepth` detect the size should use heap sort or not.

The more you should go to read algorithm. But you can get the unusual theory from Go's design of `sort` package.

Thank for read.

### References:

#### [The Go programming language](http://www.gopl.io/)

- Author: Alan A. A. Donovan & Brian W. Kernighan
- ISBN: 978-986-476-133-3
