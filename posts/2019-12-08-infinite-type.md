---
title: "Infinite Type"
categories:
  - cs
tags:
  - plt
  - language
---

Infinite type sounds not good since we have no idea how much space would it take. Consider this:

```hs
Prelude> let x = Nothing
Prelude> let x = Just x

<interactive>:2:9: error:
    • Occurs check: cannot construct the infinite type: a ~ Maybe a
    • In the expression: Just x
      In an equation for ‘x’: x = Just x
    • Relevant bindings include x :: a (bound at <interactive>:2:5)
```

At here, the type of `x` was `Maybe a` after the first command; into the second command, it became `Maybe Maybe Maybe <... infinite Maybe>` so we would never know when can we construct the type. So semantic checker or type checker would invent a rule call occurs check. In this case, `x` has a type `Maybe a` at the first step, into the second step it tries to construct a new type `Maybe Maybe a` and unify `Maybe a` with `Maybe Maybe a`, that means found an infinite type definition and it would reject such program.

But thought again, do we really didn't want infinite type? Or we are only didn't want the infinite construction? I thought the answer is we are trying to prevent infinite construction which we have no idea how big it's.

So let's dig into mud with curiosity, consider the following program(syntax is pesudo language):

```
class Option[T]
// <: represents inherit/subtype
// and I'm comment
class Some[T](value: T) <: Option[T]
// ? explicit tell compiler it's a fresh free variable type
class None <: Option[?]
```

We can to pattern matching for everytime we want to do operations on `Option[T]`, like:

```
foo(x: Option[int], y: Option[int]): Option[int] {
  match (x, y) {
    (Some(lv), Some(rv)) => return Some(lv + rv)
    _ => return None
  }
}
```

It's really annoying and makes us upset. So we invent infinite definition. Wait! You say we cannot measure how big the infinite type was! Yes, but what we are going to do is have an infinite definition for any construction, but we still only allow the finite construction.

I know that's confusing, so we start a trivial example, at the previous example we have to repackage the result of the operation back into `Option[T]`, we want to directly do operations on `Option[T]`, first take a look at the abstraction of additional:

```
// +(int, int): int means int implements trait Add
trait Add {
  +(self, self): self;
}
class int <: Add {
  +(int, int): int;
}
```

To make `Option[T] + Option[T]` be possible, we need to make `Option[T]` implements `Add`, so first is we need the ability to reimplement a more special version than `Option[T]` for `Add`, this is because we don't want to change `Option[T]` definition all the time, and this is extendable by users' `trait`. And a more important reason is if `T` is not a subtype of `Add`, which means it's not addable, `Option[T]` should not be able addable either. So consider this definition:

```
class Option[T <: Add] <: Add {
  +(x: Option[T], y: Option[T]): Option[T] {
    match (x, y) {
      (Some(lv), Some(rv)) => return Some(lv + rv)
      None => None
    }
  }
}
```

Notice why I say it's an infinite definition, this definition says `Option[T]` is a subtype of `Add` and only if `T` is a subtype of `Add`. Then consider this: `Option[Option[Option[T <: Add]]]`, it this type is a subtype of `Add`?

1. `T` is a subtype of `Add`
2. `Option[T]` is a subtype of `Add` because `T` is a subtype of `Add`
3. replace `Option[T]` with `T2` and back to step 1

Now we know, for any `Option[Option[...]]` type, if final `T` is a subtype of `Add`, it's a subtype of `Add`, and we can do the add-operation on it. So whatever user constructs how many of `Option`, we can use the same definition.

Of course, adding such a feature would be hard, where can we extend a type definition? How can we make sure users use it correctly? How to handle semantic conflict(e.g. several type-extend definitions implement the same `trait`)? But I still thought it's quite interesting and worth to write something about this. Thanks for the read.
