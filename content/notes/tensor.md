---
title: (consolidated) tensor
date: 2025-02-18
tags:
  - math
---

刻意將底下的 multilinear map 排成 $underbrace(V^* times ... times V^*, r-"times") times underbrace(V times ... times V, s-"times") -> W$ 形式的 $T^r_"  s" (V ; W)$ tensor

這也可以寫成 $V times.circle dots.h.c times.circle V times.circle V^* times.circle dots.h.c times.circle V^*$，注意 $V$ 可接受 $V^*$ 為參數，所以跟上面正好相反。

# (consolidated) product

舉例來說

$$
T^1_"  1" (V; W) times.circle T^1_"  1" (V; W) -> T^2_"  2" (V; W)
$$

定義為

$$
(S times T)(a_1, a_2, v_1, v_2) := S(a_1, v_1)T(a_2, v_2)
$$

# 普通 tensor

普通的 tensor 記號如 $T^"1 1"_"  2" (V; W)$，是使用排版來表示 $V^* times V times V times V^* -> W$。通用的情況可以直覺的想出這些表示法想表示的位置

1. 當 $V$ 是有限維度（manifold 的使用場景通常如此）時，變換成 consolidated form 並不會有任何問題
2. 但當 $V$ 是無限維度時，就有同構不成立的可能。

# Basis of tensor space

用案例來看更容易理解，假設有維度 $2$ 的空間 $V$ ，可以假設它有兩個 basis $e_1, e_2$

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

或是視為矩陣

$$
mat(
  v^1 w^1, v^1 w^2;
  v^2 w^1, v^2 w^2;
)
$$

兩個表示法的轉換叫做 reshape，在 https://www.math3ma.com/blog/the-tensor-product-demystified 中有很好的圖示化
