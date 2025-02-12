---
title: (consolidated) tensor
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

普通的 tensor 記號如 $T^"1 1"_"  2" (V; W)$，是使用排版來表示 $V^* times V times V times V^* -> W$。通用的情況可以直覺的反射這些位置的差異，在 $V$ 是有限維度（manifold 的使用場景通常如此）時，變換成 consolidated form 並不會有任何問題，但在無限維度中，就有同構不成立的可能。
