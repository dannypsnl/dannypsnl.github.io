---
title: Subtype
tags:
  - agda
---

<details>
  <summary>misc</summary>

```agda
{-# OPTIONS --cubical #-}
module agda.subtype where
open import Agda.Primitive
open import Cubical.Foundations.Prelude
```

</details>

```
record Subtype {ℓ ℓ'} {A : Type ℓ} (P : A → Type ℓ') : Type (ℓ ⊔ ℓ') where
  field
    a : A
    prop : P a
```

# Example

```
open import Cubical.Data.Nat
open import Cubical.Data.Nat.Order

m : Subtype (λ (x : ℕ) → 1 ≤ x)
m = record { a = 10; prop = suc-≤-suc zero-≤ }
```
