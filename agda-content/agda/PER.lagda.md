---
title: Partial Equivalence Relations
date: 2025-03-09
tags:
  - agda
---

<details>
  <summary>misc</summary>

```agda
module agda.PER where
open import Level
open import Data.Product
open import Relation.Binary.Core

variable
  ℓ : Level
```

</details>

```agda
record PartialEquivalenceRel {A : Set} (_~_ : Rel A ℓ) : Set ℓ where
  constructor PER
  field
    sym : {a b : A} → a ~ b → b ~ a
    trans : {a b c : A} → a ~ b → b ~ c → a ~ c

quasi-reflexive : {A : Set} {x y : A} {_~_ : Rel A ℓ} →
  PartialEquivalenceRel _~_ → x ~ y → (x ~ x) × (y ~ y)
quasi-reflexive per x~y =
  let (PER sym trans) = per
  in ( trans x~y (sym x~y) , trans (sym x~y) x~y )
```
