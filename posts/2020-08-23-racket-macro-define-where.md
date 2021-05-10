---
title: "[racket macro] define/where"
categories:
  - cs
tags:
  - racket
  - metaprogramming
  - macro
---

In **Racket**, we know using form(`...` represents ignore)

```racket
(define (helper)
  ...)
(define (procedure)
  (helper)
  ...)
```

is better than form

```racket
(define (procedure)
  (define (helper)
    ...)
  (helper)
  ...)
```

However, the benefit of defining helper in target procedure can be see. An example is the `where` syntax from Haskell:

```haskell
procedure :: IO ()
procedure = do
  helper
  ...
  where helper :: IO ()
        helper = ...
```

Can we support this in **Racket**? Yes! And it won't take a lot of time to make one.

I named the macro `define/where`, which supporting two kinds of form

```racket
(define/where x y
  (where ([y 1])))
```

and

```racket
(define/where (procedure)
  (helper)
  ...
  (where ([helper (λ () ...)])))
```

### Macro

To define a macro, we can use `define-syntax` since in this case, we have a leading name for macro(`define/where`). Two forms can be handle like this:

```racket
(define-syntax define/where
  (syntax-rules ()
    [(_ name:id e) #f]
    [(_ (name:id p* ...) stmt* ...) #f]))
```

This is enough to handle: `(define/where x y)` and `(define/where (x a b c) (+ a b c))`. Notice that we follow the syntax limitation from `define`, an identifier binding can have only one expression. Now we need to handle where clause:

```racket
(define-syntax define/where
  (syntax-rules ()
    [(_ name:id e
        (where
         ([x*:id e*] ...))) #f]
    [(_ (name:id p* ...) stmt* ...
        (where
         ([x*:id e*] ...))) #f]))
```

This is whole syntax wrapper, but we need to generate code then can say macro would work:

```racket
(define-syntax define/where
  (syntax-rules ()
    [(_ name:id e
        (where
         ([x*:id e*] ...)))
     (define name:id
       (letrec ([x*:id e*] ...)
         e))]
    [(_ (name:id p* ...) stmt* ...
        (where
         ([x*:id e*] ...)))
     (define (name:id p* ...)
       (letrec ([x*:id e*] ...)
         stmt* ...))]))
```

`letrec` is very nice in this task, then `define/where` is just a `define` with `letrec` but reverse the declaration order! Thanks for your read and have a nice day!
