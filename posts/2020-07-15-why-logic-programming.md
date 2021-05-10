---
title: "Why Logic Programming?"
categories:
  - cs
tags:
  - logic programming
  - racket
  - rosette
  - datalog
---

Why? Always a good question, to understand logic programming, need to realize what we gain from it. Normally, if we want to solve a computational problem, we make a sequential command to get an answer. For example, what is Fibonacci's number at `3`? We can have a racket program for this:

```racket
#lang racket

(define (fib n)
  (match n
    [0 1]
    [1 1]
    [n (+ (fib (- n 1))
          (fib (- n 2)))]))

(fib 3)
```

However, some questions aren't that easy to be resolved since need some synthesis, but we can take a look at how to resolve the Fibonacci problem via logic programming(use `Datalog`):

```racket
#lang datalog

(racket/base).

fib(0, 0).
fib(1, 1).

fib(N, F) :- N != 1,
            N != 0,
            N1 :- -(N, 1),
            N2 :- -(N, 2),
            fib(N1, F1),
            fib(N2, F2),
            F :- +(F1, F2).

fib(3, F)?
```

In Fibonacci this example they actually the same thing, but if I ask: g(x) is under f(x) follows the Big-O definition.

> C : Real($\gt 0$), N : Integer($\ge 0$), $\forall n \ge N, \exists C, g(N) < C \cdot f(N)$

Does that still easy to answer? Solve this problem in Racket is really hard, but simple in `Rosette`:

```racket
#lang rosette/safe
(define-symbolic C N integer?)

(define (O f g)
  (solve
   (begin (assert (>= N 0))
          (assert (positive? C))
          (assert (< (g N)
                     (* C (f N)))))))
```

Can see all need to do is point out constraints. The only problem is we cannot use `C : Real` this definition since `Real` is not constructible. However, the power of logic programming already shows there. Hope you also like it ^\_^.
