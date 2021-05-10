---
title: "How to find mk fixed point"
categories:
  - cs
tags:
  - plt
  - utlc
  - fixed point
---

This article is about how to get a fixed point in lambda calculus(utlc) system, if you didn't familiar with it, you can read [NOTE: what is lambda calculus](/blog/2020/01/01/cs/note-what-is-lambda-calculus/) to get started. What's a fixed point? When a function $f(x)$ has $x$ can make $f(x) = x$ then we say $x$ is the fixed point of $f$. Now we can get started to derive one.

In lambda calculus, Peano's number can be represented as:

1. z: $\lambda s . \lambda z . z$
2. s z: $\lambda s . \lambda z . s \; z$
3. s s z: $\lambda s . \lambda z . s \; (s \; z)$

Then **s**(successor) can be found.

$$
s \doteq \lambda n . \lambda s . \lambda z . s \; (n \; s \; z)
$$

With **s**, we can define **add**, idea is simple: find number $n$ successor of $m$.

$$
add \doteq \lambda n . \lambda m . m \; (s \; n)
$$

We can check a number is zero or not(assume true/false already defined) and predecessor.

$$
iszero \doteq \lambda n . n \; (\lambda x . false) \; true \\
predecessor \doteq \lambda n . \lambda s . \lambda z . second \; (n \; (wrap \; f) <true, x>) \\
wrap f \doteq \lambda p . <false, if \; (first \; p) \; (second \; p) \; (f \; (second \; p))>
$$

p.s. <a, b> represents a pair, first is a, and second is b. Assuming `first` and `second` already bound.

With these, we can define `mult`

$$
mult \doteq \lambda n . \lambda m . if \; (iszero \; n) \; 0 \; (add \; m \; (mult \; (predecessor \; n) \; m))
$$

However, lambda didn't have a name(all $\doteq$ was name tag for human only, not allowed in lambda calculus), so we cannot refer to `mult` in `mult`! But we can have a proper version.

$$
mkmult \doteq \lambda n . \lambda m . if \; (iszero \; n) \; 0 \; (add \; m \; ((t \; t) \; (predecessor \; n) \; m))
$$

How to use this?

$$
mult \doteq (mkmult \; mkmult)
$$

The key was a recursively expanded definition for `mult`. `t t` always take a `mkmult` and make more `mkmult`. Thus, can we generalize this?

$$
mk \doteq \lambda t . t (mk \; t)
$$

Oops, but wait, we can repeat the pattern.

$$
mkmk \doteq \lambda k . \lambda t . t \; ((k \; k) \; t)
$$

Then we have `mk`, for sure.

$$
mk \doteq (mkmk \; mkmk)
$$

With `mk` we can have `mult` in a different way.

$$
mkmult' \doteq \lambda n . \lambda m . if \; (iszero \; n) \; 0 \; (add \; m \; (t \; (predecessor \; n) \; m)) \\
mult \doteq (mk \; mkmult')
$$

`mk` can find out the fixed point of any function. Which means `M (mk M) = (mk M)`. `mk` is not the only fixed point, the most famous fixed point is Y combinator, but I'm not going to talk about it here. In the end, thanks for the read and have a nice day.
