---
title: "From Functor to Applicative"
categories:
  - cs
tags:
  - plt
  - applicative
  - language
  - haskell
---

Last time we introduce [Functor](/blog/2019/12/13/cs/from-infinite-type-to-functor/), a [Functor](/blog/2019/12/13/cs/from-infinite-type-to-functor/)
is a container which provide a function can help another function operating the [Functor](/blog/2019/12/13/cs/from-infinite-type-to-functor/).
This function has a name `fmap` in **Haskell**. Therefore, a function take a type `a` as parameter(`a -> b`) can be lifted by `fmap`
to handle `M a`, if `M` provided a `fmap`. For example, `Maybe` is a `Functor`, `(+1)` has the type `Int -> Int`, `fmap (+1) (Just 10)`
get a result: `Just 11`.

### Limitation of Functor

Oh, [Functor](/blog/2019/12/13/cs/from-infinite-type-to-functor/) seems so powerful, but programming is simple, life is hard!
In the real world, a common situation is there has many `M` have to handle. For example:

```hs{numberLines: true}
replicateMaybe :: Maybe Int -> Maybe a -> Maybe [a]
replicateMaybe (Just len) (Just a) = Just $ replicate n a
replicateMaybe _ Nothing = Nothing
replicateMaybe Nothing _ = Nothing
```

Can see that we fall back to pattern matching, line 3 and 4 exclude no input.
We can make it easier by extract out this pattern:

```hs
liftMaybe2 :: (a -> b -> c) -> Maybe a -> Maybe b -> Maybe c
liftMaybe2 f (Just a) (Just b) = Just $ f a b
liftMaybe2 _ _ _ = Nothing
```

Now `liftMaybe2 repliacte a b` can work just as expected. Sounds great? How about lift `a -> b -> c -> d` to `M a -> M b -> M c -> M d`.
How about make a lift to another `M`, e.g. `List`? `liftList`? It seems like boilerplate code, right?

Now we have two problems:

1. `liftMaybe_n` problem, how to handle `liftMaybe` for all `n`.
2. `liftM` problem, how to handle `lift` for different `M`.

Indeed, let's dig into `fmap` again. Every function with type `a -> b` become `M a -> M b`, therefore, `a -> b -> c` would be
`M a -> M (b -> c)`. The key point is how to make `M (b -> c)` applied `b`.

```hs
applyMaybe :: Maybe (a -> b) -> Maybe a -> Maybe b
applyMaybe (Just f) (Just a) = Just $ f a
applyMaybe _ _ = Nothing
```

Now take a look at how magic happened:

```hs
sum :: Int -> Int -> Int -> Int
sum a b c = a + b + c

(fmap sum $ Just 1) `applyMaybe` Just 2 `applyMaybe` Just 3
-- Just 6
```

We solve `liftMaybe_n` problem! The only problem is it only works for `Maybe`, to solve the problem, it's the time of **class**.

### Applicative can help!

```hs{numberLines: true}
class Functor f => Applicative f where
  pure :: a -> f a
  (<*>) :: f (a -> b) -> f a -> f b
```

`<*>` is the general version of `applyMaybe`.
`pure` could raise a variable into the calculation in `Applicative`, we also call this **minimum context**.

#### Special helper `<$>`

`<$>` has definition as below:

```hs{numberLines: true}
(<$>) :: Functor f => (a -> b) -> f a -> f b
(<$>) = fmap
```

It just an alias of `fmap` to help infix syntax:

```hs
(+) <$> Just 1 <*> Just 2
-- Just 3
replicate <$> Just 3 <*> Just 'x'
-- Just "xxx"
replicate <$> [1, 2, 3] <*> ['x', 'y', 'z']
-- ["x", "y", "z", "xx", "yy", "zz", "xxx", "yyy", "zzz"]
```

### Conclusion

I hope this article really help you understand why we need **Applicative**. Next time would **Monad** or **monoid**,
thanks for your read and have a good day!
