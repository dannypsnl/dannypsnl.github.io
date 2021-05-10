---
title: "NOTE: Algebra Structure"
categories:
  - math
tags:
  - note
  - algebra structure
  - magma
  - semigroup
  - monoid
  - group
---

- Magma: A set equipped with a single binary operation that must be closed by definition.

  Definition: a set $M$ matched with an operation $*$. magma or closure axiom: $\forall a, b \in M \implies a * b \in M$

- Semigroup: Magma + associativity

  $\forall a, b, c \in M, (a * b) * c \iff a * (b * c)$

- Monoid: Semigroup + identity

  $\exists e \in M, \forall a \in M, a * e = e * a = a$

- Group: Monoid + invertibility

  $\forall a \in M, \exists b \in M, a * b = b * a = e$
