---
title: "NOTE: C++ optional"
categories:
  - cs
tags:
  - note
  - cpp
  - language
---

Optional type `std::optional<T>` was introduced since C++17, we could include header `<optional>` to have it. I supply a few examples to explain this good abstraction.

A little step:

```cpp
std::optional<int> i{1};
if (i) {
  std::cout << i.value() << std::endl;
}
```

This example shows how to check `optional` exist or not, and how to extract value from `optional`.

```cpp
std::optional<int> i{std::nullopt};
std::cout << i.value_or(10) << std::endl;
```

This example shows if we know the fall back value, we can provide it and skip checking `optional`. There was still something missing that quite important, for example, we shouldn't use `value_or`, but more expressive helpers:

```hs
Prelude> fmap (+10) (Just 4) :: Maybe Int
Just 14
Prelude> (*) <$> (Just 4) <*> (Just 5)
Just 20
```

So that we use function than just a value, furthermore I also would like to see there had something like `unwrap()`, C++ provided **Exception**, I thought there had no reason to prevent this way.
