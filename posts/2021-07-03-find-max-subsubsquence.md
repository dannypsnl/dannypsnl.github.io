---
title: "find max subsequence"
date: "Sat Jul  3 07:23:30 UTC 2021"
categories:
  - cs
tags:
  - algorithm
  - racket
---

```racket
#lang racket/base

(define (max-subsquence lst)
  (define maxsofar 0)
  (define maxendinghere 0)
  (define maxelement -inf.0)
  (for ([e lst])
    (set! maxelement (max maxelement e))
    (set! maxendinghere (max (+ maxendinghere e) 0))
    (displayln (list maxendinghere maxsofar))
    (set! maxsofar (max maxsofar maxendinghere)))
  (if (= maxsofar 0)
      maxelement
      maxsofar))
```
