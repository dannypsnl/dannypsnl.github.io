---
title: "Example of diffeomorphism: rotation map"
date: 2025-10-12
tags:
  - math
---

$$
&r_theta : S^2 -> S^2 \
&r_theta (x, y, z) = (x cos theta - y sin theta, x sin theta + y cos theta, z)
$$

is a diffeomorphism.

- It’s obviously that for $x,y,z$ component functions are differentiable, hence $r_theta$ is smooth

- Also, notice $z$ didn’t change so we can ignore it.

Because $r_theta$ is a rotation by z-axis, we check that $r_(-theta) compose r_theta(x,y,z) = (x,y,z)$

$$
(x cos theta - y sin theta) cos(-theta)
-
(x sin theta + y cos theta) sin(-theta)
\ =
(x cos theta - y sin theta) cos(theta) -(x sin theta + y cos theta) sin(-theta)
\ =
(x cos theta - y sin theta) cos(theta) +(x sin theta + y cos theta) sin(theta)
\ =
x(sin^2 theta + cos^2 theta) = x
$$

and

$$
(x cos theta - y sin theta) sin(-theta) +(x sin theta + y cos theta) cos(-theta)
\ =
(-x cos theta + y sin theta) sin(theta) +(x sin theta + y cos theta) cos(theta)
\ =
y(sin^2 theta + cos^2 theta) = y
$$

hence the inverse map $r_theta^(-1) = r_(-theta)$, and $r_(-theta)$ is also smooth, $r_theta$ is a diffeomorphism.
