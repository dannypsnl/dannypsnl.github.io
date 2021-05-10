---
title: "How to getting start with Rust"
categories:
  - cs
tags:
  - rust
---

Rust is a strange language.

Let's start!

## Moving

First point is move semantic.

```rust
fn main() {
    let s = "hello".to_string();
    let t = s;
    let u = s;
}
```

What do you expect? `t` & `u` is `s`? No!

`rustc` says:

```
error[E0382]: use of moved value: `s`
 --> main.rs:4:9
  |
3 |     let t = s;
  |         - value moved here
4 |     let u = s;
  |         ^ value used here after move
  |
  = note: move occurs because `s` has type `std::string::String`, which does not implement the `Copy` trait
```

These error tell you why you got a fail.

In Rust, you should expect default behavior of assign is moving!

### Copy

And you can expect if any type implement the `Copy` trait, will be copied.

That's why these code will work:

```rust
let s = 1;
let t = s;
let u = s;
```

Implement the `Copy` trait can use `derive` notation in Rust.

```rust
#[derive(Clone, Copy)]
struct Foo {
    number: i32
}
```

Notice that `Clone` is required.

But a type implement `Copy` can't have a field do not implement `Copy`!!!

So following code will fail.

```rust
#[derive(Clone, Copy)]
struct Foo {
    label: String
}
```

Error message:

```
error[E0204]: the trait `Copy` may not be implemented for this type
 --> main.rs:1:17
  |
1 | #[derive(Clone, Copy)]
  |                 ^^^^
2 | struct Foo {
3 |     number: String,
  |     -------------- this field does not implement `Copy`
```

## Mutable

In Rust, mutable and immutable is very different.

```rust
let s = "one ".to_string();
s.push_str("two ");
```

Error report:

```
error[E0596]: cannot borrow immutable local variable `s` as mutable
 --> main.rs:3:5
  |
2 |     let s = "one ".to_string();
  |         - consider changing this to `mut s`
3 |     s.push_str("two ");
  |     ^ cannot borrow mutably
```

Because `String::push_str` borrow `&mut self`, it can't be used by an immutable `String`.

## Reference

We already seen `String`, it's called **owning pointer**, others are `Vec`, `Box`, etc.

But these pointer will move data. Sometime, we don't need to moving data, but also don't want to copy it.

It's reference showtime!

Rust's reference has some points.

1. explicitly using thing it point to

```rust
let a = 1;
let r = &a;
assert!(*r == 1);
```

2. mutable reference to mutable ownership

```rust
let mut num = 15;
let r = &mut num;
*r += 10;
assert!(*r == 25);
```

3. references are never null
4. you can't borrow a value will outlive when you still alive

```rust
let r;
{
    let x = 1;
    r = &x;
}
```

Error message:

```
error[E0597]: `x` does not live long enough
 --> main.rs:5:14
  |
5 |         r = &x;
  |              ^ borrowed value does not live long enough
6 |     }
  |     - `x` dropped here while still borrowed
7 | }
  | - borrowed value needs to live until here
```

The problem is `r` can be access after `x` already be dropped!
That mean a dangling pointer. Rust disallowed it.

## Conclusion

I think these are the most hard part when you're beginner of Rust.

Because Rust chooses a new way to handle it's memory, move default, checking live-time, sharing data by reference.

Understanding these things is most important to get familiar with Rust.

Hope you like it & can get some help from this.

### References:

#### [Programming Rust](http://shop.oreilly.com/product/0636920040385.do)

- Author: Jim Blandy & Jason Orendorff
- ISBN: 978-1-491-92728-1
