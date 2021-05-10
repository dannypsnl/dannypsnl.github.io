---
title: "subtle racket macro"
date: "Thu Jan  7 07:38:58 UTC 2021"
categories:
  - cs
tags:
  - racket
  - macro
  - experience
---

Racket macro is a powerful and great tool to create a new syntax form for existing language. Most of the time it just works as expected, but sometimes we would meet some subtle bugs from it. I would explain a certain case of this situation, then tell the possible solution we could apply, and how to detect problems when we meet such a weird sample.
The story starts from another dependent-type language I recently build, I usually avoid infix syntax in racket language, but this time infix syntax is better so I pick it. To claim a variable binding with type I use `:`.

```racket
a : Nat
```

To bind a value with a variable I use `=`.

```racket
a = zero
```

Here is the minimal reproducable sample.

```racket
(define (foo stx)
  (syntax-case stx (=)
    [(name = expr)
     `(,(syntax-e #'name) = ,(syntax-e #'expr))]))

(foo #'(a = 1))
```

This produces correct stuff locally, the reason why I didn't find the bug at first, but when providing module language we usually would put something like the following code.

```racket
(provide (except-out (all-from-out racket) #%module-begin #%top-interaction)
         (rename-out [module-begin #%module-begin]
                     [top-interaction #%top-interaction]))

(define-syntax (module-begin stx)
  ...)
(define-syntax (top-interaction stx)
  ...)
(module reader syntax/module-reader
  typical)
```

The above program overwrites `#%module-begin` and `#%top-interaction` to help module language works for file(a module) and REPL(interaction). For convenience, all from racket usually re-export, so we can have `provide`, `require`, and everything we still would like to have. However, `a = zero` failed since `=` is defined in `racket/base`, we can imagine that syntax-case is trying to pattern matched `#<procedure:=>` with `=`. The simplest solution is `(except-out (all-from-out racket) #%module-begin #%top-interaction =)` let `=` is just another symbol, this works and apply for now, but I'm going to dig more solution here.
Back to our reproduce sample, and add a variant `foo`.

```racket
(define (foo-p stx)
  (syntax-parse stx
    #:literals (=)
    [(name = expr)
     `(,(syntax-e #'name) = ,(syntax-e #'expr))]))

(foo-p #'(a = 1))
```

This one also work as expected, and even worked for external one, but this cannot apply in my case. Because another form for building inductive type, I need `data` keyword, let's change program a little bit.

```racket
(define (foo-p stx)
  (syntax-parse stx
    #:literals (= data)
    [(name = expr)
     `(,(syntax-e #'name) = ,(syntax-e #'expr))]))
```

This time, it failed with the following message:

```
syntax-parse: literal is unbound in phase 0 (phase 0 relative to the enclosing module) in: data
```

Annoying, but we can fix it in simple way, by change `#:literals` to `#:datum-literals`.

```racket
(define (foo-p stx)
  (syntax-parse stx
    #:datum-literals (= data)
    [(name = expr)
     `(,(syntax-e #'name) = ,(syntax-e #'expr))]))
```

Unfortunately, this one also not the best solution. The best one provided by [shhyou](https://github.com/shhyou), creates a dummy syntax and using `#:literals`.

```racket
(provide data)

(define-syntax (data stx) (raise-syntax-error 'dummy))

(define (foo-p stx)
  (syntax-parse stx
    #:literals (= data)
	[(data name)
     `(data ,(syntax-e #'name))]
    [(name = expr)
     `(,(syntax-e #'name) = ,(syntax-e #'expr))]))
```

In this situation, `(foo-p #'(data Nat))` can point to dummy syntax definition part! This would be really helpful to help users of module language realize where the form from! Though this solution would be quite complicated once we break the program down into several files so I didn't take it for now. Thanks for reading such a long-long and boring post XD, have a nice day, and hope you get some ideas for next time you provide a module language in Racket.
