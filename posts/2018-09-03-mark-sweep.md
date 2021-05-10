---
title: "Mark Sweep GC"
categories:
  - cs
tags:
  - gc
---

Mark-Sweep is a classic GC algorithm, it's combined with two parts, `mark` and `sweep`.

Mark pseudo code would like:

```
mark(root):
    if !root.is_marked:
        root.is_marked = true
    for obj in root.knowns:
        mark(obj)
```

And Sweep pseudo code would like:

```
sweep(heap):
    for obj in heap:
        if obj.is_marked:
            obj.is_marked = false
        else:
            release(obj)
```

Let's use some graphs to show it(`->` means known):

Start:

```
root -> obj1 -> obj2
         |
          \-> obj3
```

If we run `collection`(mark-sweep), then since each object is reachable from `root`, so no one would be released.

After running a function, `obj1` don't need `obj3` anymore, so it became:

```
root -> obj1 -> obj2

obj3
```

Now when we run `collection`, `obj3` is unreachable from `root`, so it won't be marked! When running to `sweep`, it will be dropped.
