---
title: "Algebra data type vs Class"
categories:
  - cs
tags:
  - plt
  - scala
  - haskell
---

I have a long time thought that algebra data type(ADT) is must need.

In `Haskell`, ADT looks like this:

```hs
data Term =
  Variable String
  | Lambda String Term
  | Application Term Term
```

And let's see how to do the same thing in `Scala`.

```scala
sealed class Term
case class Variable(name: String) extends Term
case class Lambda(name: String, body: Term) extends Term
case class Application(func: Term, arg: Term) extends Term
```

Both of them are used to represent the `Term` of lambda calculus.

They look the same. I can't say that is wrong, but two syntaxes actually have different: extendability.

Let's say when we use these `Term` to do static analysis. When we report an error, we usually want to show where does the error happens, so we have to update our `Term` definition, in `Haskell`, it's annoying.

```hs
data Term =
  Variable Location String
  | Lambda Location String Term
  | Application Location Term Term
# and when matching
case term of
  Variable loc name -> # ...
  Lambda loc parameter body -> # ...
  # ...
```

If you already use it everywhere, you would get crazy. Since you have to update every pattern-matching related to `Term`.

Oh, we can prevent this. But must do this from the beginning:

```hs
data Term =
  Term {location :: Location,
        value :: TermValue}
data TermValue =
  Variable String
  | Lambda String Term
  | Application Term Term
```

Otherwise when you want to change it later, good luck.

But in `Scala`, things different.

```scala
sealed class Term {
  val location: Location = new Location
}
case class Variable(name: String) extends Term
case class Lambda(name: String, body: Term) extends Term
case class Application(func: Term, arg: Term) extends Term
```

I'm not trying to show a full workable version(that anyway would be complex in any language). But showing that `class` help us to add a new field so easily. And proof that `class` can totally replace algebra data type.
