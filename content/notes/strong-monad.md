---
title: strong monad
date: 2025-02-25
tags:
  - cs
  - plt
---

The multiplication $mu : M compose M -> M$ of a monad $M : cal(C) -> cal(C)$ allows one to compose $f : A -> M B$ and $g : B -> M C$ via

$$
#import "@preview/fletcher:0.5.4" as fletcher: diagram, node, edge

#diagram(cell-size: 15mm, $
  A edge(f, ->) & M B edge(M g, ->) & M (M C) edge(mu C, ->) & M C
$)
$$

However, if includes context in, then the target to compose are

1. $f : Gamma times A -> M B$
1. $g : Gamma times B -> M C$

we need a natural transformation

$$
s_(Gamma,B) : Gamma times M B -> M (Gamma times B)
$$

with which the composite

$$
#import "@preview/fletcher:0.5.4" as fletcher: diagram, node, edge

#diagram(cell-size: 15mm, $
  Gamma times A edge((pi_1, f), ->)
  & Gamma times M B edge(s_(Gamma,B), ->)
  & M (Gamma times B) edge(M g, ->)
  & M (M C) edge(mu C, ->) & M C
$)
$$

To make the composition associative and pure computation $(eta_A dot.c pi_2) : Gamma times A -> M A$ an identity, $s$ must satisfy certain coherence condition [1].

[1]: https://dylanm.org/strength.pdf
