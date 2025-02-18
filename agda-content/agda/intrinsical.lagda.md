---
title: Intrinsically typed term
tags:
  - agda
---

<details>
  <summary>misc</summary>

```agda
{-# OPTIONS --cubical #-}
module agda.intrinsical where
open import Agda.Primitive
open import Cubical.Foundations.Prelude
open import Cubical.Data.List
```

</details>

```
data Ty : Type where
  bool : Ty
  _⇒_ : Ty → Ty → Ty

variable S T : Ty

Ctx = List Ty
_,,_ : Ctx → Ty → Ctx
Γ ,, T = T ∷ Γ
infix 10 _,,_

variable Γ : Ctx
```

# Intrinsically-scoped de Brujin indices

```
data _∋_ : Ctx → Ty → Type where
  zero : Γ ,, T ∋ T
  suc : Γ ∋ T → Γ ,, S ∋ T
infix 5 _∋_

variable x : Γ ∋ T
```

# Intrinsically-typed terms

```
data _⊢_ : Ctx → Ty → Type where
  true false : Γ ⊢ bool
  var : Γ ∋ T → Γ ⊢ T
  lam_ : Γ ,, S ⊢ T → Γ ⊢ S ⇒ T
  _·_ : Γ ⊢ S ⇒ T → Γ ⊢ S → Γ ⊢ T
  if_then_else_ : Γ ⊢ bool → Γ ⊢ T → Γ ⊢ T → Γ ⊢ T
infix 9 _⊢_
```
