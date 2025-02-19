---
title: fletcher for string diagram
date: 2025-02-11
tags:
  - math
  - tool
---

```typst
#import "@preview/fletcher:0.5.4" as fletcher: diagram, node, edge

#diagram(cell-size: 15mm, $
	G edge(f, ->) edge("d", pi, ->>) & im(f) \
	G slash ker(f) edge("ur", tilde(f), "hook-->")
$)
```

$$
#import "@preview/fletcher:0.5.4" as fletcher: diagram, node, edge

#diagram(cell-size: 15mm, $
	G edge(f, ->) edge("d", pi, ->>) & im(f) \
	G slash ker(f) edge("ur", tilde(f), "hook-->")
$)
$$
