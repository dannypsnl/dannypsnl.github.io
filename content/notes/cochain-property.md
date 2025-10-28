---
title: cochain 性質
date: 2025-10-28
tags:
  - math
  - differential geometry
---

驗證 $dif compose dif = 0$。令 $omega = alpha^I dif x^I$ 為一 $k$-form，可知

$$
dif(dif omega)
=
dif((diff alpha^I)/(diff x^j) dif x^j and dif x^I)
=
(diff^2 alpha^I)/(diff x^k diff x^j) dif x^k and dif x^j and dif x^I
$$

由於

$$
(diff^2 alpha^I)/(diff x^k diff x^j)
=
(diff^2 alpha^I)/(diff x^j diff x^k)
$$

令

$$
C := (diff^2 alpha^I)/(diff x^k diff x^j)
$$

則有

$$
dif(dif omega)
=
C dif x^j and dif x^k and dif x^I
+ C dif x^k and dif x^j and dif x^I
=
C dif x^j and dif x^k and dif x^I
- C dif x^j and dif x^k and dif x^I
= (C - C) dif x^j and dif x^k and dif x^I
= 0
$$
