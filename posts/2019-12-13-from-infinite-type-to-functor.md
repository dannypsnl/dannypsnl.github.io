---
title: "From Infinite Type to Functor"
categories:
  - cs
tags:
  - plt
  - functor
  - language
  - haskell
---

At [infinite type](/blog/2019/12/08/cs/infinite-type/) I mention a way(recursive abstract data type) to make we use `Option[T]` just like `T`. However, such modeling is not enough. Consider the following example(with the same pseudo syntax takes from [infinite type](/blog/2019/12/08/cs/infinite-type/)):

```
class Foo {
  bar(): Bar;
}
```

Now we want to use `Option[Foo]` as `Foo`. In a normal use case, we have:

```
foo: Foo = Foo();
bar: Bar = foo.bar();
```

Once we put `Foo` into the box, it became:

```
foo: Option[Foo] = Some(Foo());
// we say use Option[Foo] as Foo, so foo.bar should be supported just like it's existed under Option[Foo]
bar: Bar = foo.bar();
```

It seems easy at first look, but consider this case:

```
foo: Option[Foo] = None;
bar: Bar = foo.bar();
```

What should we do? Terminate program is definitely not what we want, our purpose is reducing the unneeded check(let's say before we surely use the data to show something to UI is not need to check), not create a fragile software. And if we want `foo.bar()` crash the program at here we even don't have to model `Option`, just introduce bottom type just like the language that allows null object. So what is our purpose? Is to make `foo.bar()` automatically returns `Option[Bar]`.

Now, let's think about how to make it. Consider this:

```
class Foo {
  bar(): Bar;
}
class Option[Foo] <: Foo {
  bar(): Bar {
    // implementation
  }
}
```

This model is bad, first, it cannot let `Bar` became `Option[Bar]`; second, it causes an interesting problem: `Option[Foo]` is a subtype of `Foo` which means the following code is valid:

```
foo: Foo = Some(Foo());
```

However, how do we sure `Foo` is `Option[Foo]` or `Foo` now? In fact, now we make an infinite definition of the type which has a size(such type takes real memory to store), which means we cannot make this kind of type. This is the reason why we have a function called `fmap` in **Haskell**!

Take a look at the type of `fmap`:

```hs
fmap :: (a -> b) -> f a -> fb
```

For the `Maybe` type, we create:

```hs
fmap :: (a -> b) -> Maybe a -> Maybe b
fmap f (Just a) = Just (f a)
-- We can do nothing with Nothing
fmap _ Nothing = Nothing
```

For List: `[a]` we create:

```hs
fmap :: (a -> b) -> [a] -> [b]
-- yep, for list, fmap is map
fmap = map
```

Ok, so we create such a program for all the box type(such type provide common wrapping for others type)? No!

In **Haskell**, it actually defines a `class`(**Haskell** `class` is very different with **Java** one) for this situation, called `Functor`:

```hs
class Functor f where
  fmap :: (a -> b) -> f a -> f b

instance Functor [] where
  fmap = map
instance Functor Maybe where
  fmap f (Just a) = Just (f a)
  fmap _ Nothing = Nothing
```

We also can create `instance Functor (a, b)`, like:

```hs
-- `(,) a b` is `(a, b)`, you can find Haskell treats binary operator as a function takes two parameters everywhere(if I'm wrong, tell me)
instance Functor ((,) a) where
  fmap f (x, y) = (x, f y)

fmap (+1) (2, 5)
-- (2, 6)
fmap (+1) (3, 5)
-- (3, 6)
fmap (+2) (3, 5)
-- (3, 7)
```

In this case, `f a` <=> `f` is `(,) a`, `a` is `b`.

Now, let's make a mind blow up. I say that binary operator in **Haskell** is all modeling like a function, so `a -> b` is `(->) a b`, in fact, I thought people who familiar with **Lisp** would not feel it weird.

According to `(a -> b) -> f a -> f b`, first, to make symbol would not conflict, we use: `(b -> c) -> f b -> f c`. Then use `(->) a` to replace `f`: `(b -> c) -> ((->) a b) -> ((->) a c)`, then normalize it: `(b -> c) -> (a -> b) -> (a -> c)`. Those knows **Haskell** now should jump and say: Compose! Yes, let's see the definition:

```hs
instance Functor ((->) a) where
  fmap f fa = f . fa
```

I hope you have enough fun with **Functor** X).

Let's back to the problem: How to use `Option[Foo]` as `Foo`?

```
trait Functor[a] {
  // let's assuming we have a syntax like this which would require `self` is a type that takes one type parameter and export the type binding to `f` and `a`(and `a` would cause a unification here, since `Functor` have one also, so `a` already bound, `self` has to satisfy it).
  f[a] = self;
  fmap[b](self, (a): b): f[b];
}

class Option[T] <: Functor[T] {
  fmap[b](self: Option[T], func: (T): b): Option[b] {
    match self {
      Some(v) => {
        return func(v);
      }
      None => {
        return None;
      }
    }
  }
}
```

To use it, we cannot keep the totally same code anymore:

```
foo: Option[Foo] = Some(Foo());
bar: Option[Bar] = foo.fmap[Bar](foo.bar);
```

Now we make an object-syntax-oriented version's **Functor**. You can see the definition is a little bit... ok, very hard to read. But if we really want such extendability(unify box types), then probably is worth it. I haven't mentioned category theory, **Applicative**(finally!) and other things in **Haskell** or other languages. Hopefully, I can complete them in the future, and in the end thanks for your read.
