---
title: "NOTE: What is lambda calculus"
categories:
  - cs
tags:
  - note
  - plt
  - utlc
---

What is lambda-calculus? Or, more specific, what is untyped/pure lambda-calculus? To answer this, I wrote the note for myself. Lambda-calculus was a formal system invented by Alonzo Church in the 1920s, and we can enrich it in a variety of ways, for example, adding special concrete syntax like numbers, tuples, records, etc. Such extensions eventually lead to languages like ML, Haskell, or Scheme.

For easy functionality, we usually would do it directly, like `+1` is quite simple for most people, but for those complex operations(or had special meaning like math formula), repeat them would be an annoying job. So we created procedural/functional abstraction. For example: `square(x) = x^2`.

The syntax of lambda-calculus comprises just three sorts of terms, the following syntax use BNF[1] form:

```bnf
term ::=                                              terms
  x                                                variable
  λx.term                                       abstraction
  term term                                     application
```

A variable `x` by itself is a term; an abstraction of a variable `x` from a term `t1`, written `λx.t1`, is a term; an application of a term `t1` to another term `t2`, written as `t1 t2`, is a term.

### $$\beta$$-reduction

If an expression of the form `(λx. M) N` is a term, then we can rewrite it to `M[x := N]`, i.e. The expression `M` in which every `x` has been replaced with `N`. We call this process $$\beta$$-reduction[2] of `(λx. M) N` to `M[x := N]`. For example `(λx. (x + 1)) 2`(assume that we add numbers into lambda-calculus), where `M` is `x + 1` and `N` is `2`, `(x+1)[x := 2]` would produce `2 + 1` as the result. BTW, we also use

$$
(\lambda x.M)N \longrightarrow [x \to N]M
$$

this form.

### Currying(in honor of Haskell Curry)

The behavior of a function of two or more arguments can be simulated by converting it into a composite of functions of a single argument was called Currying[3]. For example `λ(x y). M` can write `λx. (λy. M)`.

### Church Booleans

Definition:

$$
true := \lambda t. \lambda f. t\\
false := \lambda t. \lambda f. f
$$

How to use it, first we define a `and` function.

$$
and := \lambda a. \lambda b. a\;b\;a
$$

Then apply with arguments:

$$
and\;true\;true \to (\lambda t. \lambda f. t) \equiv true\\
and\;true\;false \to (\lambda t. \lambda f. f) \equiv false
$$

`or` and `not` function:

$$
or := \lambda a. \lambda b. a\;a\;b\\
not := \lambda a. a\;false\;true
$$

We even can create `ifThenElse`:

$$
ifThenElse := \lambda a. \lambda b. \lambda c. a\;b\;c
$$

### Church Numerals

Represent Numbers by lambda-calculus is only slightly more intricate than Booleans. First, we define successor function(called `suc`) and some numbers:

$$
suc := \lambda n. \lambda s. \lambda z. s\;(n\;s\;z)\\
n_0 := \lambda s. \lambda z. z\\
n_1 := \lambda s. \lambda z. s\;z\\
n_2 := \lambda s. \lambda z. s\;(s\;z)\\
n_3 := \lambda s. \lambda z. s\;(s\;(s\;z))
$$

Once we got the idea that `suc 0` is the construction of `1` and `suc suc 0` is the construction of `2`. We know the construction of church numbers was `s` and `suc` was trying to take `n`(previous number) to construct the next number `suc n`, we keep `λs.λz` as common prefix and add `s` into body, `n s z` consume the previous `λs.λz` part.

Then we can define the `add` and `times` function for them:

$$
add := \lambda m. \lambda n. \lambda s. \lambda z. m\;s\;(n\;s\;z) \\
|\; add := \lambda m. \lambda n. m\;suc\;n
$$

`add` takes two arguments: `m` and `n`, but we keep `λs.λz` as usual to make it been a number, then we can demonstrate it:

$$
add\; n_0\; n_1\\
\to \lambda s. \lambda z. n_0\;s\;(n_1\;s\;z\\
\to \lambda s. \lambda z. n_0\;s\;((\lambda s. \lambda z. s\;z)\;s\;z)\\
\to \lambda s. \lambda z. n_0\;s\;(s\;z)\\
\to \lambda s. \lambda z. (\lambda s. \lambda z. z)\;s\;(s\;z)\\
\to \lambda s. \lambda z. s\;z \equiv n_1
$$

`mult` can define as:

$$
mult := \lambda m. \lambda n. \lambda f.m\; (n\; f) \\
| \; mult := λm.λn.m\; (add\; n)\; 0
$$

### Evaluation Rules ($$t \to t'$$)

$$
\frac{t_1 \to t_1'}{t_1\; t_2 \to t_1'\; t_2} \;\;\;\; {E-APP1}\\
\frac{t_2 \to t_2'}{v_1\;t_2 \to v_1\;t_2'} \;\;\;\; {E-APP2}\\
(\lambda x.t_{12})\; v_2 \longrightarrow [x \to v_2]t_{12} \;\;\;\; {E-APPABS}\\
$$

### References

1. BNF(Backus–Naur form) [https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form](https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form)
2. $$\beta$$-reduction [https://en.wikipedia.org/wiki/Beta_normal_form](https://en.wikipedia.org/wiki/Beta_normal_form)
3. Currying [https://en.wikipedia.org/wiki/Currying](https://en.wikipedia.org/wiki/Currying)

#### [Types and Programming Languages](https://www.cis.upenn.edu/~bcpierce/tapl/)

- Author: Benjamin C. Pierce
- ISBN: 0-262-16209-1

#### [Types Theory and Formal Proof: An Introduction](https://www.cambridge.org/tw/academic/subjects/computer-science/programming-languages-and-applied-logic/type-theory-and-formal-proof-introduction?format=AR&isbn=9781316056349)

- Author: Rob Nederpelt & Herman Geuvers
- ISBN: 9781316056349
