---
title: "How trait with lifetime can be a trouble and how to fix it"
categories:
  - cs
tags:
  - rust
  - rust lifetime
---

In my case, I have a trait called `Resource` for deserialize from bytes. Now I want to reuse a struct called `List` for others `Resource` so I write done:

```rust
struct List<T> {
    // ignore others field
    items: Vec<T>,
}

impl<T: Resource> Resource for List<T> {
    fn from_str(s: &str) -> Result<List<T>> {
        let list: List<T> = serde_json::from_str(s)?;
        Ok(list);
    }
}
```

Because `serde_json::from_str` requires `impl Deserialize` so we have to modify the code:

```rust
impl<T: Resource + Deserialize> Resource for List<T> {
    fn from_str(s: &str) -> Result<List<T>> {
        let list: List<T> = serde_json::from_str(s)?;
        Ok(list);
    }
}
```

It looks work but not. The problem is `Deserialize` actually is `Deserialize<'de>`, when we use the trait in the declaration we have to satisfy all type parameters of course includes lifetime. Ok, so we write:

```rust
impl<'a, T: Resource + Deserialize<'a>> Resource for List<T> {
    fn from_str(s: &'a str) -> Result<List<T>> {
        let list: List<T> = serde_json::from_str(s)?;
        Ok(list);
    }
}
```

It looks good and works for most cases actually, however, in my code I hiding the whole get data and deserialize in a function, whatever it's, would cause a problem.

```rust
fn get_list_via_fetching_data<'a, T: Deserialize<'a>>() -> Result<List<T>> {
    let data = fetch(); // in my case is kubernetes api server but that's fine
    List::<T>::from_str(data)
}
```

Ok, you would find `data` is not live long enough for `'a`, why? Since anyway `'a` would be an outside lifetime and of course, live longer than anything in the function. What can we do for this case? We have to reverse the relationship between others `Resource` and `List`, rather than see `List` as kind of `Resource`, we add a function `fn from_str_to_list(s: &str) -> Result<List<Self>>;` for trait `Resource`. Since in my case `Resource` impl `Sized` and `List` also has a detected size after applying a `Sized T` so `List<Self>` is `Sized`. Now we can have the function `get_list_via_fetching_data`.

Of course, for the most normal case I think we don't need this one, and if at future `'_` lifetime introduced the problem could be resolved(but I'm not sure that is for this problem actually so just a guess).

Thanks for reading and see you next time.
