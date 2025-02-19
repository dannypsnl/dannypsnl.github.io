---
title: De Bruijn indices
date: 2025-02-14
tags:
  - cs
  - agda
  - lambda calculus
---

<details>
  <summary>misc</summary>

```agda
{-# OPTIONS --cubical #-}
module agda.dbi where
open import Cubical.Foundations.Prelude
open import Cubical.Data.Nat
```

</details>

```agda
data Term : Set where
  var : ℕ → Term
  lam : Term → Term
  app : Term → Term → Term

example₁ : Term
example₁ = lam {-x-} (lam {-y-} (app (var {-x-} 1) (var {-y-} 0)))
```
