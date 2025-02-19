---
title: tensor algebra
date: 2025-02-17
tags:
  - math
---

> [!note]
> 記號上這篇用 $cal(T)^r_s$ 取代 $T^r_s$

一但考慮所有 [tensor](tensor) 的 direct sum，就構成了 tensor algebra

$$
cal(T)(V) := plus.circle.big_(r,s) cal(T)^r_s (V)
$$

# $(cal(T)(V), +, times.circle)$ 構成 associative algebra

1. 藉由 reshape tensor matrix 為 vector，可以看出加法確實是 associative 的
2. $times.circle$ 因為 tensor product 只是把更多 vectors 放入，因此與結合先後順序無關

# natural contraction

$$
tr : cal(T)^r_s (V) -> cal(T)^(r-1)_(s-1) (V)
$$

定義為

$$
tr(v_1 times.circle dots.h.c times.circle v_r times.circle u^1 times.circle dots.h.c times.circle u^s)
:= angle.l u^1, v_1 angle.r tr(v_2 times.circle dots.h.c times.circle v_r times.circle u^2 times.circle dots.h.c times.circle u^s)
$$
