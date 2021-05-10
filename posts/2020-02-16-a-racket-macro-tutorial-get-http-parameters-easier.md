---
title: "A Racket macro tutorial -- get HTTP parameters easier"
image: ../images/racket/sierpinski-racket-example.png
categories:
  - cs
tags:
  - racket
  - metaprogramming
  - macro
---

A few days ago, I post this [answer](https://dev.to/dannypsnl/comment/ldl8) to respond to a question about Racket's web framework. When researching on which frameworks could be used. I found no frameworks make get values from HTTP request easier. So I start to design a macro, which based on [routy](github.com/Junker/routy) and an assuming function `http-form/get`, as following shows:

```racket
(get "/user/:name"
  (lambda ((name route) (age form))
    (format "Hello, ~a. Your age is ~a." name age)))
```

Let me explain this stuff. `get` is a macro name, it's going to take a string as route and a "lambda" as a request handler. `((name route) (age form))` means there has a parameter `name` is taken from `route` and a parameter `age` is taken from `form`. And `(format "Hello, ~a. Your age is ~a." name age)` is the body of the handler function.

Everything looks good! But we have no idea how to make it, not yet ;). So I'm going to show you how to build up this macro step by step, as a tutorial.

First, we have to ensure the target. I don't want to work with original Racket HTTP lib because I never try it, so I pick [routy](github.com/Junker/routy) as a routing solution. A [routy](github.com/Junker/routy) equivalent solution would look like:

```racket
(routy/get "/user/:name"
  (lambda (req params)
    (format "Hello, ~a. Your age is ~a." (request/param params 'name) (http-form/get req "age"))))
```

> WARNING: There has no function named `http-form/get`, but let's assume we have such program to focus on the topic of the article: **macro**

Now we can notice that there was no `name`, `age` in `lambda` now. But have to get it by using `request/param` and `http-form/get`. But there also has the same pattern, the route! To build up macro, we need the following code at the top of the file `macro.rkt` first:

```racket
#lang racket

(require (for-syntax racket/base racket/syntax syntax/parse))
```

Then we get our first macro definition:

```racket
(define-syntax (get stx)
  (syntax-parse stx
    [(get route:str)
      #'(quote
        (routy/get route
          (lambda (req params)
            'body)))]))

(get "/user/:name")
; output: '(routy/get "/user/:name" (lambda (req params) 'body))
```

Let's take a look at each line, first, we have `define-syntax`, which is like `define` but define a macro. It contains two parts, **name** and `syntax-parse`. The name part was `(get stx)`, so the macro called `get`, with a syntax object `stx`. The `syntax-parse` part was:

```racket
(syntax-parse stx
  [(get route:str)
    #'(quote
      (routy/get route
        (lambda (req params)
          'body)))])
```

The `syntax-parse` part works on the syntax object, so it's arguments are a syntax object and patterns! Yes, patterns! It's ok to have multiple patterns like this:

```racket
(define-syntax (multiple-patterns? stx)
  (syntax-parse stx
    [(multiple-patterns? s:str) #'(quote ok-str)]
    [(multiple-patterns? s:id) #'(quote ok-id)]))

(multiple-patterns? "")
; output: 'ok-str
(multiple-patterns? a)
; output: 'ok-id
```

Now we want to add handler into `get`, to reduce the complexity, we introduce another feature: `define-syntax-class`. The code would become:

```racket
(define-syntax (get stx)
  (define-syntax-class handler-lambda
    #:literals (lambda)
    (pattern (lambda (arg*:id ...) clause ...)
      #:with
      application
      #'((lambda (arg* ...)
           clause ...)
         arg* ...)))

  (syntax-parse stx
    [(get route:str handler:handler-lambda)
      #'(quote
        (routy/get route
          (lambda (req params)
            handler.application)))]))
```

First we compare `syntax-parse` block, we add `handler:handler-lambda` and `handler.application` here:

```racket
(syntax-parse stx
  [(get route:str handler:handler-lambda)
    #'(quote
      (routy/get route
        (lambda (req params)
          handler.application)))]))
```

This is how we use a `define-syntax-class` in a higher-level syntax. `handler:handler-lambda` just like `route:str`, the only differences are their pattern. `route:str` always expected a string, `handler:handler-lambda` always expected a `handler-lambda`. And notice that `handler:handler-lambda` would be the same as `a:handler-lambda`, just have to use `a` to refer to that object. But better give it a related name.

Then dig into `define-syntax-class`:

```racket
(define-syntax-class handler-lambda
  #:literals (lambda)
  (pattern (lambda (arg*:id ...) clause* ...)
    #:with
    application
    #'((lambda (arg* ...)
        clause* ...)
        arg* ...)))
```

`define-syntax-class` allows us add some `stxclass-option`, for example: `#:literals (lambda)` marked `lambda` is not a pattern variable, but a literal pattern. The body of `define-syntax-class` is a pattern, which takes a pattern and some `pattern-directive`. The most important `pattern-directive` was `#:with`, which stores how to transform this pattern, it takes a `syntax-pattern` and an `expr`, as you already saw, this is usage: `handler.application`.

The interesting part was `...` in the pattern, it means zero to many patterns. A little tip makes such variables with a suffix `*` like `arg*` and `clause*` at here.

Now take a look at usage:

```racket
(get "/user/:name"
  (lambda (name age)
    (format "Hello, ~a. Your age is ~a." name age)))
; output: '(routy/get "/user/:name" (lambda (req params) ((lambda (name age) (format "Hello, ~a. Your age is ~a." name age)) name age)))
```

There are some issues leave now, since we have to distinguish `route` and `form`, current pattern of `handler-lambda` is not enough. The `handler-lambda.application` also incomplete, we need

```racket
(lambda (req params)
  (format "Hello, ~a. Your age is ~a."
          (request/param params 'name)
          (http-form/get req "age")))
```

but get

```racket
(lambda (req params)
  ((lambda (name age)
    (format "Hello, ~a. Your age is ~a."
            name
            age)) name age))
```

right now.

To decompose the abstraction, we need another `define-syntax-class`.

```racket
(define-syntax-class argument
    (pattern (arg:id (~literal route))
      #:with get-it #'[arg (request/param params 'arg)])
    (pattern (arg:id (~literal form))
      #:with get-it #'[arg (http-form/get req (symbol->string 'arg))]))

(define-syntax-class handler-lambda
  #:literals (lambda)
  (pattern (lambda (arg*:argument ...) clause* ...)
    #:with
    application
    #'(let (arg*.get-it ...)
         clause* ...)))
```

There are two changes, replace `lambda` with `let` in `handler-lambda.application`(it's more readable), and use `argument` syntax type instead of `id`.

`argument` has two patterns, `arg:id (~literal route)` and `arg:id (~literal form)` to match `(x route)` and `(x form)`. Notice that `#:literals (x)` and `(~literal x)` has the same ability, just pick a fit one. `symbol->string` converts an atom to a string, here is an example:

```racket
(symbol->string 'x)
; output: "x"
```

Let's take a look at usage:

```racket
(get "/user/:name"
  (lambda ((name route) (age form))
    (format "Hello, ~a. Your age is ~a." name age)))
; output: '(routy/get "/user/:name" (lambda (req params) (let ((name (request/param params 'name)) (age (http-form/get req (symbol->string 'age)))) (format "Hello, ~a. Your age is ~a." name age))))
```

Manually pretty output:

```racket
'(routy/get "/user/:name"
  (lambda (req params)
    (let ((name (request/param params 'name))
          (age (http-form/get req (symbol->string 'age))))
      (format "Hello, ~a. Your age is ~a." name age))))
```

### Summary

With make up this tutorial, I learn a lot of macro tips in Racket that I don't know before. I hope you also enjoy this, also hope you can use everything you learn from here to create your helpful macro. Have a nice day.

### End up, all code

```racket
#lang racket

(require (for-syntax racket/base racket/syntax syntax/parse))

(define-syntax (get stx)
  (define-syntax-class argument
    (pattern (arg:id (~literal route))
      #:with get-it #'[arg (request/param params 'arg)])
    (pattern (arg:id (~literal form))
      #:with get-it #'[arg (http-form/get req (symbol->string 'arg))]))

  (define-syntax-class handler-lambda
    #:literals (lambda)
    (pattern (lambda (arg*:argument ...) clause* ...)
      #:with
      application
      #'(let (arg*.get-it ...)
           clause* ...)))

  (syntax-parse stx
    [(get route:str handler:handler-lambda)
      #'(quote
        (routy/get route
          (lambda (req params)
            handler.application)))]))

(get "/user/:name"
  (lambda ((name route) (age form))
    (format "Hello, ~a. Your age is ~a." name age)))
```
