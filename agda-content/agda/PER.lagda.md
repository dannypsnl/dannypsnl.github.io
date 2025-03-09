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
  a ℓ : Level
```

</details>

```agda
record PartialEquivalenceRel {A : Set a} (_~_ : Rel A ℓ) : Set (a ⊔ ℓ) where
  constructor PER
  field
    sym : {a b : A} → a ~ b → b ~ a
    trans : {a b c : A} → a ~ b → b ~ c → a ~ c

QuasiReflexive : (A : Set a) (_~_ : Rel A ℓ) → Set (a ⊔ ℓ)
QuasiReflexive A _~_ = ∀ {x y : A} → (x ~ y) → (x ~ x) × (y ~ y)

quasi-reflexive : {A : Set a} {x y : A} {_~_ : Rel A ℓ} →
  PartialEquivalenceRel _~_ → QuasiReflexive A _~_
quasi-reflexive per x~y = (trans x~y (sym x~y)) , (trans (sym x~y) x~y)
  where open PartialEquivalenceRel per
```
