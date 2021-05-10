---
title: "Unit sphere is convex"
date: "Wed Mar 10 09:15:16 UTC 2021"
categories:
  - math
tags:
  - linear combination
  - unit sphere
  - convex
---

When we say "A is convex", means for any two points in $A$, the line in $A$(each point on the line in $A$).

To prove the title "Is the unit sphere convex?", we need to prove for any two vectors $X$, $Y$

1. their length $\le 1$
2. their linear combination $\le 1$

First, their linear combination belongs to unit sphere $S$, when $t \in [0, 1]$ and such linear combination is $(1 - t)X + tY$.

By triangle inequality principle, we know

$$
|| (1 - t)X + tY || \le |1-t| ||X|| + |t| ||Y||
$$

By $||X||, ||Y|| \le 1$, we know

$$
|1-t| ||X|| + |t| ||Y|| \le |1-t| + |t| = 1
$$

Thus,

$$
|| (1 - t)X + tY || \le 1
$$

Proved.
