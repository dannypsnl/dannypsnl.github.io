---
title: "Second-Order Generalised Algebraic Theories: Signatures and First-Order Semantics"
date: 2025-02-22
tags:
  - agda
---

<details>
  <summary>misc</summary>

```agda
{-# OPTIONS --cubical #-}
module agda.sogat where
open import Agda.Primitive
open import Cubical.Foundations.Prelude hiding (Sub; _,_)
open import Cubical.Foundations.Equiv
```

</details>

NOTE about https://drops.dagstuhl.de/storage/00lipics/lipics-vol299-fscd2024/LIPIcs.FSCD.2024.10/LIPIcs.FSCD.2024.10.pdf

| representation                                          | ability                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| BNF-style (AST)                                         | store written syntax                                              |
| well-scoped syntax tree                                 | $lambda x.x$ has no different from $lambda y.y$ here              |
| [intrinsic](agda.intrinsical) (well-typed) terms        | non well-typed terms are not expressable in such a representation |
| well-typed, quotiented by the conversion relation (GAT) | see below                                                         |
| SOGAT                                                   | see below                                                         |

# Schönfinkel's combinator calculus (Algebraic Theories)

An algebraic theory is a set, with some operations, and equations.

```agda
record CC : Type₁ where
  infixl 10 _·_

  field
    Tm : Type

    _·_ : Tm → Tm → Tm

    K : Tm
    S : Tm

    Kβ : {u f : Tm} → K · u · f ≡ u
    Sβ : {f g u : Tm} → S · f · g · u ≡ f · u · (g · u)
```

# Typed combinator calculus (Generalised Algebraic Theories)

GATs allow sorts indexed by other sorts. In this particular example, we have

1. A sort of types
1. For each type, a seperate sort of terms of that type

```agda
record TCC : Type₁ where
  infixl 10 _·_
  infixr 5 _⇒_

  field
    Ty : Type
    Tm : Ty → Type

    ι : Ty
    _⇒_ : Ty → Ty → Ty

    _·_ : {A B : Ty} → Tm (A ⇒ B) → Tm A → Tm B

    K : {A B : Ty} → Tm (A ⇒ B ⇒ A)
    S : {A B C : Ty} → Tm ((A ⇒ B ⇒ C) ⇒ (A ⇒ B) ⇒ A ⇒ C)


    Kβ : {A B : Ty} {u : Tm A} {f : Tm B} → K · u · f ≡ u
    Sβ : {A B C : Ty}
      {f : Tm (A ⇒ B ⇒ C)}
      {g : Tm (A ⇒ B)}
      {u : Tm A}
      → S · f · g · u ≡ f · u · (g · u)
```

# Lambda calculus

## Second-Order algebraic theories (SOAT)

> `lam` is not first-order (not strictly positive), hence this is not an algebraic theory

```agda
record LC : Type₁ where
  infixl 10 _·_

  field
    Tm : Type

    lam : (Tm → Tm) → Tm
    _·_ : Tm → Tm → Tm

    β : {f : Tm → Tm} {u : Tm} → lam f · u ≡ f u
```

The point is: a second-order model is clear

1. a set
2. a binary operation
3. a second-order function with the type of `lam` satisfying the equation `β`

But the homomorphism between second-order models `M` to `N` is not.
The old way is, translate a SOAT to first-order GAT:

1. add contexts
2. add substitutions
3. index `Tm` and all operations by contexts

and then `lam` becomes a first order function taking a term in an extended context as input.

## first-order GAT

From SOAT we can derive a GAT.

```agda
record FLC : Type₁ where
  infixl 10 _,_
  infixl 12 _[_]
  infixl 11 _·_

  field
    Con : Type
    Sub : Con → Con → Type

    _∘_ : {Δ Γ Θ : Con} → Sub Δ Γ → Sub Θ Δ → Sub Θ Γ
    assoc : {A B C D : Con} {γ : Sub C D} {δ : Sub B C} {θ : Sub A B}
      → (γ ∘ δ) ∘ θ ≡ γ ∘ (δ ∘ θ)
    id : {Γ : Con} → Sub Γ Γ
    id-left : {A B : Con} {γ : Sub A B} → id ∘ γ ≡ γ
    id-right : {A B : Con} {γ : Sub A B} → γ ∘ id ≡ γ

    -- empty context: zero
    ◇ : Con
    ε : {Γ : Con} → Sub Γ ◇
    -- terminal
    ◇η : {Γ : Con} → (σ : Sub Γ ◇) → σ ≡ ε

    Tm : Con → Set
    _[_] : {Γ Δ : Con} → Tm Γ → Sub Δ Γ → Tm Δ
    [id] : {Γ : Con} {t : Tm Γ} → t [ id ] ≡ t
    [∘] : {Θ Γ Δ : Con} {t : Tm Γ} {γ : Sub Δ Γ} {δ : Sub Θ Δ} → t [ γ ∘ δ ] ≡ t [ γ ] [ δ ]

    -- context extension: successor
    _▹ : Con → Con
    _,_ : {Δ Γ : Con} → Sub Δ Γ → Tm Δ → Sub Δ (Γ ▹)

    -- variables are definable as De Bruijn indices:
    -- 0 = q
    -- 1 = q[p]
    -- 2 = q[p][p], and so on
    p : {Γ : Con} → Sub (Γ ▹) Γ
    q : {Γ : Con} → Tm (Γ ▹)

    ▹β₁ : {Δ Γ : Con} {γ : Sub Δ Γ} {t : Tm Δ}
      → p ∘ (γ , t) ≡ γ
    ▹β₂ : {Δ Γ : Con} {γ : Sub Δ Γ} {t : Tm Δ}
      → q [ γ , t ] ≡ t
    ▹η : {Δ Γ : Con} {σ : Sub Δ (Γ ▹)}
      → σ ≡ (p ∘ σ , q [ σ ])

    lam : {Γ : Con} → Tm (Γ ▹) → Tm Γ
    lam[] : {Δ Γ : Con} {γ : Sub Δ Γ} {t : Tm (Γ ▹)}
      → (lam t)[ γ ] ≡ lam (t [ γ ∘ p , q ])

    _·_ : {Γ : Con} → Tm Γ → Tm Γ → Tm Γ
    ·[] : {Δ Γ : Con} {γ : Sub Δ Γ} {t u : Tm Γ} → (t · u)[ γ ] ≡ t [ γ ] · (u [ γ ])

    β : {Δ Γ : Con} {γ : Sub Δ Γ} {t : Tm (Γ ▹)} {u : Tm Γ}
      → lam t · u ≡ t [ id , u ]
```

# Lambda calculus (second-order GAT)

```agda
record STLC : Type₁ where
  field
    Ty : Type
    _⇒_ : Ty → Ty → Ty

    Tm : Ty → Type

    lam : {A B : Ty} → (Tm A → Tm B) → Tm (A ⇒ B)
    _·_ : {A B : Ty} → Tm (A ⇒ B) → (Tm A → Tm B)

    stlc-cong : {A B : Ty}
      → Tm (A ⇒ B) ≃ (Tm A → Tm B)
```
