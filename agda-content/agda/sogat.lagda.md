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
open import Cubical.Foundations.Prelude hiding (Sub)
```

</details>

NOTE about https://drops.dagstuhl.de/storage/00lipics/lipics-vol299-fscd2024/LIPIcs.FSCD.2024.10/LIPIcs.FSCD.2024.10.pdf

| representation                                          | ability                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| BNF-style (AST)                                         | store exactly the syntax                                          |
| well-scoped syntax tree                                 | $lambda x.x$ has no different from $lambda y.y$ now               |
| intrinsic (well-typed) terms                            | non well-typed terms are not expressable in such a representation |
| well-typed, quotiented by the conversion relation (GAT) |                                                                   |
| SOGAT                                                   |                                                                   |

# Schönfinkel's combinator calculus (Algebraic Theories)

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


    Kβ : {A B : Ty} → {u : Tm A} {f : Tm B} → K · u · f ≡ u
    Sβ : {A B C : Ty}
      → {f : Tm (A ⇒ B ⇒ C)}
      → {g : Tm (A ⇒ B)}
      → {u : Tm A}
      → S · f · g · u ≡ f · u · (g · u)
```

# Lambda calculus (Second-Order algebraic theories)

```agda
record LC : Type₁ where
  infixl 10 _·_

  field
    Tm : Type

    lam : (Tm → Tm) → Tm
    _·_ : Tm → Tm → Tm

    β : {f : Tm → Tm} {u : Tm} → lam f · u ≡ f u
```

# Lambda calculus (first-order GAT)

```agda
record FLC : Type₁ where
  field
    Con : Type
    Sub : Con → Con → Type

    _∘_ : {Δ Γ Θ : Con} → Sub Δ Γ → Sub Θ Δ → Sub Θ Γ
    ∘-ass : {A B C D : Con} {γ : Sub C D} {δ : Sub B C} {θ : Sub A B}
      → (γ ∘ δ) ∘ θ ≡ γ ∘ (δ ∘ θ)
    id : {Γ : Con} → Sub Γ Γ
    id-left : {A B : Con} {γ : Sub A B} → id ∘ γ ≡ γ
    id-right : {A B : Con} {γ : Sub A B} → γ ∘ id ≡ γ

    -- terminal
    ◇ : Con
    ε : {Γ : Con} → Sub Γ ◇
    ◇η : {Γ : Con} → (σ : Sub Γ ◇) → σ ≡ ε

    Tm : Con → Set
    _[_] : {Γ Δ : Con} → Tm Γ → Sub Δ Γ → Tm Δ
    -- TODO:
    -- [∘] : {Θ Γ Δ : Con} {t : Tm Θ} {γ : Sub Δ Γ} {δ : Sub Γ Θ} → t [ γ ∘ δ ] ≡ t [ γ ] [ δ ]
```
