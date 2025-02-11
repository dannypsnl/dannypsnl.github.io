---
title: cetz can work
tags:
  - math
  - tool
---

$$
#import "@preview/cetz:0.3.2"

#cetz.canvas({
  import cetz.draw: *

  grid((0,0), (4,4), help-lines: true)

fill(black)
stroke(none)
let n = 16
for i in range(0, n+1) {
  circle(((2,2), i / 8, i * 22.5deg, (3,2)), radius: 2pt)
}
})
$$
