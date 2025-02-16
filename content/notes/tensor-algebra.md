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

# Basis of tensor

假設有維度 $2$ 的空間 $V$ ，可以假設它有兩個 basis $e_1, e_2$

$$
v = v^1 e_1 + v^2 e_2 \
w = w^1 e_1 + w^2 e_2
$$

也就是說

$$
vec(v^1, v^2) times.circle vec(w^1, w^2)
= vec(v^1 w^1, v^1 w^2, v^2 w^1, v^2 w^2)
$$

可以被視為

$$
v^1 w^1 e_1 times.circle e_1
+ v^1 w^2 e_1 times.circle e_2
+ v^2 w^1 e_2 times.circle e_1
+ v^2 w^2 e_2 times.circle e_2
$$

在 https://www.math3ma.com/blog/the-tensor-product-demystified 中有很好的圖示化

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
