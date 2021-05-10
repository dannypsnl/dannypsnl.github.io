---
title: "NOTE: lambda 2"
categories:
  - cs
tags:
  - note
  - plt
  - lambda 2
---

### $\lambda 2$ (Second order typed lambda calculus)

Consider **identity function**:

$$
\lambda x : nat.x
\\
\lambda x : bool.x
\\
\lambda x : (nat \to bool).x
$$

There are many **identity function**s, one per type, but their definitions are all looked same. Therefore, we want to use same way to build it, here we go:

$$
\lambda \alpha : \star . \lambda x : \alpha . x
$$

$\star$ denotes a type of all types, since $\lambda \alpha : \star . \lambda x : \alpha . x$ is a term, we called it **terms depending on types**. This is second order $\lambda$-abstraction(or type-abstraction).

### Rules

- second order abstraction rule:

  $$
  \frac{
    \Gamma, \alpha : \star \vdash M : A
  }{
    \Gamma \vdash \lambda \alpha : \star.M : \Pi \alpha : \star . A
  }
  $$

- second order application rule:

  $$
  \frac{
    \Gamma \vdash M : \Pi \alpha : \star.A \;\;\; \Gamma \vdash B : \star
  }{
    \Gamma \vdash M B : A[a := B]
  }
  $$
