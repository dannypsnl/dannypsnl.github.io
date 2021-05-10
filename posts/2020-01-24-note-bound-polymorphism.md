---
title: "NOTE: bounded polymorphism"
categories:
  - cs
tags:
  - note
  - plt
  - language
  - haskell
last_modified_at: 2020-01-24T03:37:01+08:00
---

Bounded polymorphism refers to existential quantifiers($$\exists$$), restricted to range over types of bound type. To understand it only needs a few examples. Let's start! Take a look at the following program:

```hs
numSort :: Num a => [a] -> [a]
```

`Num a` is how we represent the bounded polymorphism in **Haskell**, the definition of `Num` was `class Num b where`(Hoogle shows `a`, just prevent to confuse reader don't familiar with **Haskell**) could read as **a type `b` is an instance of class `Num`**.

So `numSort` takes `[a]` only if `a` is an instance of `Num`. Now we could run down:

```hs
numSort [1, 2, 3] :: [Int]
numSort [1.1, 2, 3] :: [Double]
```

This is really a powerful feature(and you don't need to use **Haskell** for this, **Java** also has this feature), consider the old way to do `List<A>` to `List<B>`, and unfortunately solution was to copy each element in the list.
