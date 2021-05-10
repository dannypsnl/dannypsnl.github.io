---
title: "NOTE: Lambda Cube"
categories:
  - cs
tags:
  - note
  - plt
  - lambda cube
---

First we have UTLC(untyped lambda calculus) to STLC(simply typed lambda calculus), by adding arrow type($\to$): $\lambda x:Nat.x$

### Lambda cube

Lambda cube starts from STLC.

#### STLC -> $\lambda 2$

Terms depend on Types: $\lambda (a : *).\lambda (x:a).x$

#### $\lambda 2$ -> $\lambda \omega$

Types depend on Types: $\lambda (a : *).a \to a$

#### $\lambda 2$ -> $\lambda \Pi$ ($\Pi$ type)

Types depend on Terms: $\Pi (x : a).M$

#### COC(calculus of construction)

Mix $\Pi$ and $\lambda$, type is term.

COC = $\lambda 2$ + $\lambda \omega$ + $\lambda \Pi$

#### CIC(calculus of inductive construction)

Introduce Inductive, e.g. `data Nat = zero | suc Nat`

CIC = COC + Inductive
