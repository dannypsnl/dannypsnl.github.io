---
title: tensor algebra
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

1. $v, w in cal(T)(V)$ 作為向量，$v + w$ 會按 component 相加；每個 component 是 tensor 會轉發加法給 vector component，因此會繼承 vector space 的屬性
2. $times.circle$ 的部分是因為 tensor product 只是把更多 vectors 放入，因此與結合順序無關

# natural contraction

$$
tr : cal(T)^r_s (V) -> cal(T)^(r-1)_(s-1) (V)
$$

定義為

$$
tr(v_1 times.circle dots.h.c times.circle v_r times.circle u^1 times.circle dots.h.c times.circle u^s)
:= angle.l u^1, v_1 angle.r tr(v_2 times.circle dots.h.c times.circle v_r times.circle u^2 times.circle dots.h.c times.circle u^s)
$$
