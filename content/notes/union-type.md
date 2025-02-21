---
title: The problem of union type
date: 2025-02-21
tags:
  - cs
---

Below typed/racket program will produce `'flo`

```racket
(define-type K (U Number Float))
(define n : K 1.2)

(cond
  [(flonum? n) 'flo]
  [(number? n) 'num])
```

but if I change the order of clauses?

```
(cond
  [(number? n) 'num]
  [(flonum? n) 'flo])
```

The result now is `'num`. The problem is the type $A union.plus B$ in this way rely on not tagged but type of value to distinguish it has $A$ or $B$ here.
