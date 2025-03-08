---
title: Dependent Pattern matching
date: 2025-03-08
tags:
  - cs
  - agda
  - pattern matching
---

<details>
  <summary>misc</summary>

```agda
{-# OPTIONS --cubical #-}
module agda.so where
open import Cubical.Foundations.Prelude
open import Cubical.Data.Bool
```

</details>

```agda
data So : Bool → Type where
  oh : So true
  ho : So false
```

```agda
xxx : {b : Bool} → So b → Bool
xxx {b} oh = b -- b is true here
xxx {b} ho = b -- b is false here
```
