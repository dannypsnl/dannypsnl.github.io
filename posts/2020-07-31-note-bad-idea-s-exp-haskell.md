---
title: "NOTE: Bad Idea, put Haskell in S expression?"
categories:
  - cs
tags:
  - note
  - language
  - racket
  - haskell
---

Just record a bad idea www.

```racket
(data Point
  ; constructor-name type*
  [Point Int Int]
  (deriving (Eq, Ord)))
(data List (a)
  [nil]
  [cons a (List a)])
(cons 1 nil) ; infer get a=Int

(= absolute (n)
   (case (< n 0)
     [#t (- n)]
     [#f n]))
(= f (+ x y)
   (where
    (= x 1)
    (= y 2)))
(:: fib (Integer -> Integer))
(= fib (0) 1)
(= fib (1) 1)
(= fib (n)
   (+ (fib (- n 1))
      (fib (- n 2))))
```

The major challenge would be `=` can be repeated. Therefore, have to record each binding and convert to a pattern matching.
