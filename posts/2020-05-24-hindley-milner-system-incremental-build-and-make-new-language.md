---
title: "Hindley-Milner type system: Incrementally build way & Make new language in Racket"
categories:
  - cs
tags:
  - plt
  - hindley milner
  - racket
---

Hindley-Milner (HM) type system is a classical type system for lambda calculus with parametric polymorphism. Its most notable property is it can infer most types of a given program, **without type annotations**! However, this feature sounds cool but not work well in practice XD, since people need annotation to hint ourselves when reading. I pick this system as a topic is because the HM type system probably is the easiest completeness system with parametric polymorphism. It's a good start for understanding other more complex type systems, and it's important for gradual typing. But before we dig too deep into those ideas, let's start to understand HM, the point of this article.

### Why?

In earlier days Lisp didn't have a type system, as time pass, people start to want to(or need to) express program more precisely since cooperation and robustness. Then people start working for their needs. To express a `list`, introduce **parametric polymorphism**. **parametric polymorphism** sounds scared but doesn't, let's view an example:

```racket
(: list-length (All (A) (-> (Listof A) Integer)))
```

This syntax bind `list-length` to a type `(All (A) (-> (List A) Integer))`, or we would write `list-length : (All (A) (-> (List A) Integer))`(you can see **Racket** use prefix operator, very Lisp style, not surprise XD). The syntax is not the most important thing, but it shows a very common thing in many different languages, to help you get what is **parametric polymorphism**. Now imagine, every time call `list-length`, must provide `A` as an argument: `(list-length Number lst)`. People would get tired and say: I hate the static type system, it seems no surprise. That's the reason for type inference. With type inference, if `lst : (Listof Number)`, `A` is `Number`, get type without type! The idea is so frustrating and makes people crazy to think about: Can we have a system, get all the type without type? The result is the HM type system.

#### Why Polymorphism

In [simply typed lambda calculus (STLC)](/blog/2020/03/08/cs/note-stlc/), asking **e : T** make sense because we already give `e` a type `K`, check `T` is `K` is all we need. All type in STLC is a `T` or `T -> T` and `T` will not from another type. This feature, however, makes inconvenience when writing a program, for example:

```racket
(define id
  (lambda (x) x))
```

Identity function can work well with any type, but now we have to provide infinite versions for it:

```racket
(: id-str (-> str str))
(define id-str (lambda (x) x))
(: id-int (-> int int))
(define id-int (lambda (x) x))
(: id-bool (-> bool bool))
(define id-bool (lambda (x) x))
(: id-int-to-int (-> (-> int int) (-> int int)))
(define id-int-to-int (lambda (x) x))
```

If I don't want it and still want types, then use polymorphism is the solution:

```racket
(: id (All (A) (-> A A)))
(define id
  (lambda (x) x))
```

I hope I convince you that, take your time to understand its detail of this system is valuable :).

### Setup a project

This section helps you get a project would be modified in the following part:

```shell
raco pkg new hindley-milner
cd hindley-milner
raco pkg install --auto
```

### Syntax Overview

I would show a small enough language can cooperate with HM type system and big enough to convince you this is useful, detail would not be the point, put them at here is just want to help you keep going with the following content.

- Definition of language(create `lang.rkt`):

```racket
#lang typed/racket

(provide expr expr:int expr:bool expr:string expr:list expr:variable expr:lambda expr:application expr:let)

(struct expr [] #:transparent)
(struct expr:int expr [(v : Integer)] #:transparent)
(struct expr:bool expr [(v : Boolean)] #:transparent)
(struct expr:string expr [(v : String)] #:transparent)
(struct expr:list expr [(elems : (Listof expr))] #:transparent)
(struct expr:variable expr [(name : String)] #:transparent)
(struct expr:lambda expr
  [(param : (Listof String))
   (body : expr)]
  #:transparent)
(struct expr:application expr
  [(func : expr)
   (args : (Listof expr))]
  #:transparent)
(struct expr:let expr
  [(bindings : (Listof (Pair String expr)))
   (expr : expr)]
  #:transparent)
```

- Definition of types(create `typ.rkt`)

```racket
#lang typed/racket

(provide typ typ:builtin)

(struct typ [] #:transparent)
(struct typ:builtin typ
  [(name : String)]
  #:transparent)
```

I will not explain them immediately, but let our incrementally steps show the story, let's start the journey.

### Part I: Incrementally build up inference

Then we learn how to incrementally build up the HM type system without memorizing all rules. It also shows how to get ideas behind rules, not just remember a snapshot!

#### Monomorphism stuff

**Monomorphism**, which means obviously and decidable, and it would be a good start. Here, code can explain it better(create `semantic.rkt`):

```racket
#lang typed/racket

(provide type/infer)

(require "lang.rkt"
         "typ.rkt")

(: type/infer (-> expr typ))
(define (type/infer exp)
  (match exp
    ([expr:int _] (typ:builtin "int"))
    ([expr:bool _] (typ:builtin "bool"))
    ([expr:string _] (typ:builtin "string"))))
```

You can see why I say they are obviously even you never use **static type**, because this type is builtin in most language, inference their types is just by definition. `1` is `int`, `#t` is `bool`, `"hello"` is `string`. However, there has a common **builtin** type is not monomorphism, for example: `list`.

#### List

The inference list type is not that easy, because it's a type depends on the type, what's that mean? It means we say: `list A` is a type when `A` is a type, so must have a type `A` to have type `list A`, this called type depends on the type. This means, if we want to inference type of list, we also need to inference the type of its element and check rest elements following the same type. An edge case is somehow, some lists do not contain any element, in such case we still need a type, so we give it a placeholder of the type usually called **free type variable(freevar)**. Finally, returns a type `list` with its type of argument. You can try to build it by yourself, but you would find there is something missing and became a wall stop you. The first thing we need to do, is extending our type definition to fit **a type with type parameter** this abstraction(modify `typ.rkt`):

```racket
(struct typ:freevar typ
  [(index : Integer)]
  #:transparent)
(struct typ:constructor typ
  [(name : String)
   (arg : (Listof typ))]
  #:transparent)
(: typ:builtin (-> String typ:constructor))
(define (typ:builtin name)
  (typ:constructor name '()))
```

Now `typ:builtin` is just a special case of `typ:constructor`, and we introduce the placeholder: `typ:freevar`. The second thing need to prepare is **Context**(modify `semantic.rkt`, put them before `type/infer`), which maintaining the state of `freevar` counting:

```racket
(struct Context
  [(freevar-counter : Integer)]
  #:transparent
  #:mutable)
(: Context/new (-> Context))
(define (Context/new)
  (Context 0))
(: Context/new-freevar! (-> Context typ))
(define (Context/new-freevar! ctx)
  (let ([cur-count (Context-freevar-counter ctx)])
    (set-Context-freevar-counter! ctx (+ 1 (Context-freevar-counter ctx)))
    (typ:freevar cur-count #f)))
```

Then we can start adding inference of `expr:list`:

```racket
(: unify (-> typ typ Void))
(define (unify t1 t2)
  (match (cons t1 t2)
    ([cons (typ:constructor a al) (typ:constructor b bl)]
     #:when (string=? a b)
     (for-each (λ ((ae : typ) (be : typ))
                 (unify ae be))
               al bl))
    (_ (raise (format "cannot unify type ~a and ~a" t1 t2)))))

; ->* is a special type, which means `->* list-of-required-parameters list-of-optional-parameters return-type`
(: type/infer (->* (expr) (Context) typ))
(define (type/infer exp)
  (match exp
    ; ignore
    ([expr:string _] (typ:builtin "string"))
    ([expr:list elems]
     (typ:constructor "list"
                      (list (if (empty? elems)
                        (Context/new-freevar! ctx)
                        ; use first element type as type of all elements
                        (let ([elem-typ (type/infer (car elems))]) ; (car (list 1 2 3)) is 1
                          ; check all elements follow first element type
                          (for-each (λ ([elem : expr]) (unify elem-typ (type/infer elem)))
                            (cdr elems)) ; (cdr (list 1 2 3)) is (list 2 3)
                          elem-typ)))))))
```

Currently, `unify` just check two constructors has the same name, and keep `unify` their parameters if has. In other cases, throw an exception.

#### Variable

A variable would have a type, or it binds with a type. Anyway, that means we can infer the type of variable, but we need a place to store this information. Therefore, a new abstraction introduced **Environment**(modify `semantic.rkt`, put code before `Context`):

```racket
(struct Env
  [(parent : (Option Env))
   (type-env : (Mutable-HashTable String typ))]
  #:transparent
  #:mutable)
(: Env/new (->* () ((Option Env)) Env))
(define (Env/new [parent #f])
  (Env parent (make-hash '())))
;;; Env/lookup take variable name such as `x` to get a type from env
(: Env/lookup (-> Env String typ))
(define (Env/lookup env var-name)
  (: lookup-parent (-> typ))
  (define lookup-parent (λ ()
                          (: parent (Option Env))
                          (define parent (Env-parent env))
                          (if parent
                              ; dispatch to parent if we have one
                              (Env/lookup parent var-name)
                              ; really fail if we have no parent environment
                              (raise (format "no variable named: `~a`" var-name)))))
  ; try to get value from table
  (let ([typ-env : (Mutable-HashTable String typ) (Env-type-env env)])
    (hash-ref typ-env var-name
              ; if fail, handler would take
              lookup-parent)))
```

then add a new field into `Context`:

```racket
(struct Context
  [(freevar-counter : Integer)
   (type-env : Env)]
  #:transparent
  #:mutable)
(: Context/new (-> Context))
(define (Context/new)
  (Context 0 (Env/new)))
```

Now we can get the variable type from `Context`:

```racket
(: type/infer (->* (expr) (Context) typ))
    ; ignore
    ([expr:variable name] (Env/lookup (Context-type-env ctx) name))
```

Wait, we use variable then must somewhere we define it, where is it? Therefore, the next section is lambda, lambda would introduce new variables into the environment.

#### Lambda

Things are getting more complex, get really to understand what we need to do? Lambda in the HM system well not have type annotation for parameters, it causes the same problem just like what `list` gives us. This means we need to bind a `freevar` with parameters as variables into a **new environment**. At here, since the multiple parameters are valid in this language, I introduce type `pair` to abstraction on this rather than extend type definition. Then, we use this new environment to infer the type of body, and produce arrow type(If you don't understand arrow type, I suggest you read [STLC](/blog/2020/03/08/cs/note-stlc/) for explanation) via the inferred result. Now, it's time for some program:

##### Bind variable

```racket
(: Env/bind-var (-> Env String typ Void))
(define (Env/bind-var env var-name typ)
  (let ([env (Env-type-env env)])
    (if (hash-has-key? env var-name)
        (raise (format "redefined: `~a`" var-name))
        (hash-set! env var-name typ))))
```

##### Infer

```racket
(: type/infer (->* (expr) (Context) typ))
    ; ignore
    ([expr:lambda params body]
     ; params use new freevars as their type
     (letrec ([λ-env : Env (Env/new (Context-type-env ctx))]
           [param-types (typ:constructor
                         "pair"
                         (map (λ ([param-name : String])
                                (let ([r (Context/new-freevar! ctx)])
                                  (Env/bind-var λ-env param-name r)
                                  r)) params))])
       (set-Context-type-env! ctx λ-env)
       (define body-typ (type/infer body ctx))
       (typ:arrow param-types body-typ)))
```

> WARN: notice since I always invoke `type/infer` without context in outside, `type-env` no need to set back to the original one. However, if you extend this language with `define` such sharing `Context`, then set environment back is required, else your local bindings would affect the outer scope.

Lambda seems powerful, and let can be translated to lambda, right? Unfortunately, it's correct in the computation view, but incorrect in the inference view. For example:

```racket
((λ (id) (id 1)) (λ (a) a))
```

It gets an identity function and applies to `1`, it seems like it should get `int`. However, we would get a `freevar`. Because no one requires `id` start infer its type since we have no idea when would lambda apply to something, if remove `(λ (a) a)` and application form outside of `(λ (id) (id 1))`, we cannot ensure the type of `(id 1)`. That's what let polymorphism going to solve.

#### Let polymorphism

Let polymorphism is the key expression in the HM type system, which ensures inference is decidable. The problem in the previous section can be fixed if using `let`:

```racket
(let ([id (λ (a) a)])
  (id 1))
```

Because `let` would infer the type of `id` immediately. Then the problem would be eliminated. So the only different part between `let` and `lambda`, is `let` bind its variable with inferred type, not `freevar`:

```racket
(: type/infer (->* (expr) (Context) typ))
    ; ignore
    ([expr:let bindings exp]
     (letrec ([let-env : Env (Env/new (Context-type-env ctx))]
              [bind-to-context (λ ([bind : (Pairof String expr)])
                                 (match bind
                                   ([cons name init]
                                    (Env/bind-var let-env name (type/infer init ctx)))))])
       (map bind-to-context bindings)
       (set-Context-type-env! ctx let-env)
       (type/infer exp ctx)))
```

Finally, we came to infer the last expression: `expr:application`.

#### Application

Infer `application` needs to do a few checks:

1. For application `(func args ...)`, infer the type of `func`.
2. Check type of `func` is a arrow type: `A -> B`.
3. Assume return type is a `freevar`.
4. Unify `A -> B` with `(typeof (args ...)) -> freevar`.
5. return `freevar` as infer result.

With the explanation, we can start coding:

```racket
(: type/infer (->* (expr) (Context) typ))
    ; ignore
    ([expr:application fn args]
     (let ([fn-typ (type/infer fn ctx)]
           [args-typ (map (λ ((arg : expr)) (type/infer arg ctx)) args)]
           [fresh (Context/new-freevar! ctx)])
       (unify fn-typ (typ:arrow (typ:constructor "pair" args-typ) fresh))
       fresh))
  ; don't forget to close parenthesis!
  ))
```

We almost complete, but we have new jobs in `unify` to do since application might unify `freevar` and arrow type now.

##### Unify freevar

```racket
(: unify (-> typ typ Void))
(define (unify t1 t2)
  (match (cons t1 t2)
    ; ignore
    ([cons (typ:arrow p1 r1) (typ:arrow p2 r2)]
     (unify p1 p2)
     (unify r1 r2))
    ;;; freevar type is only important thing in `unify` function
    ((and
      [cons _ (typ:freevar _ _)]
      [cons t v])
     (if (or (eqv? v t) (not (occurs v t)))
         (subst! v t)
         (void))
     (void))
    ([cons (typ:freevar _ _) t2] (unify t2 t1))
    ; ignore
    ))
```

Unify arrow type is simple, in fact, we can totally replace `typ:arrow` with `typ:constructor` XD. In fact, all type constructors can be `unify` in the same way. `freevar` brings a new thing: `occurs`, what's `occurs`?

##### Occurs check

Occurs check make unification fail when unify `V` and `T`, `T` contains `V`. If we didn't do this check, `unify` would lead to unsound inference, for example:

```racket
(= ?0 (list ?0))
```

What would `?0` be? It would cause an infinite loop at there: `(list (list (list ...)))`. Therefore, we need to check if `V` occurs in `T`:

```racket
(: occurs (-> typ typ Boolean))
(define (occurs v t)
  (match (cons v t)
    ; same freevar means `v` occurs in `t`, then should be rejected
    ([cons v (typ:freevar _ _)] (eqv? v t))
    ; arrow and constructor both just keep check on type parameters
    ([cons v (typ:arrow t1 t2)] (or (occurs v t1) (occurs v t2)))
    ([cons v (typ:constructor _ type-params)]
     (foldl (λ ([t : typ] [pre-bool : Boolean])
              (or pre-bool (occurs v t)))
            #f
            type-params))
    ; rest is fine
    (_ false)))
```

Now, the whole inference part done, if you want to know how to build a new language in Racket then keep going, or you can close the tab now XD.

### Part Two: Make new language in Racket

After we build up a type system, we definitely want to see it work as a language, and make a new language in Racket is crazy easy! Let's start the second part.

#### Pretty Print

First, to improve readability, we need pretty-print function(create `pretty-print.rkt`):

```racket
#lang typed/racket

(require "typ.rkt")

(provide pretty-print-typ)

(: pretty-print-typ (-> typ String))
(define (pretty-print-typ t)
  (match t
    ([typ:freevar idx subst]
     (if subst
         (pretty-print-typ subst)
         (format "?~a" idx)))
    ([typ:constructor name typ-args]
     (if (empty? typ-args)
         (format "~a" name)
         (let ([j (string-join (map
                                (λ ([typ-arg : typ])
                                  (pretty-print-typ typ-arg))
                                typ-args) " ")])
           (if (string=? name "pair")
               (format "(~a)" j)
               (format "(~a ~a)" name j)))))
    ([typ:arrow from to]
     (format "~a -> ~a" (pretty-print-typ from)
             (pretty-print-typ to)))))
```

and we modify the `unify` function in `semantic.rkt`:

```racket
(_ (raise (format "cannot unify type ~a and ~a" (pretty-print-typ t1) (pretty-print-typ t2))))
```

For example: `(typ:arrow (typ:constructor "int" '()) (typ:constructor "int" '()))` would be `int -> int`, very good.

#### Macro for module language

Then we start handling macros in Racket, to handle the whole module, we need to overwrite `#%module-begin`(modify `main.rkt`):

```racket
#lang racket

(require (for-syntax syntax/parse)
         racket/syntax
         syntax/stx)
(require "lang.rkt"
         "semantic.rkt"
         "pretty-print.rkt")

(provide (except-out (all-from-out racket) #%module-begin)
         (rename-out [module-begin #%module-begin]))

(define-syntax-rule (module-begin EXPR ...)
  (#%module-begin
   (define all-form (list (parse EXPR) ...))
   (for-each (λ (form)
               (displayln form)
               (printf "type:- ~a~n" (pretty-print-typ (type/infer form))))
             all-form)))
```

We haven't defined `parse`, here shows how to get all forms in the module and handling them by `for-each`, then is `parse` part:

```racket
(define-syntax (parse stx)
  (define-syntax-class bind
    (pattern (bind-name:id bind-expr)
             #:with bind
             #'(cons (symbol->string 'bind-name) (parse bind-expr))))
  (syntax-parse stx
    (`[(~literal let) (binding*:bind ...) body]
     #'(expr:let (list binding*.bind ...) (parse body)))
    (`[(~literal λ) (ps* ...) body] #'(expr:lambda (list (symbol->string 'ps*) ...) (parse body)))
    (`[(~literal quote) (elem* ...)] #'(expr:list (list (parse elem*) ...)))
    (`[f arg* ...] #'(expr:application (parse f) (list (parse arg*) ...)))
    (`v:id #'(expr:variable (symbol->string 'v)))
    (`s:string #'(expr:string (#%datum . s)))
    (`b:boolean #'(expr:bool (#%datum . b)))
    (`i:exact-integer #'(expr:int (#%datum . i)))))
;;; module-begin
```

Just mapping **S expression** to expression defined in `lang.rkt`.

##### Module reader

Define a `module reader`:

```racket
(module reader syntax/module-reader
  hindley-milner)
```

With these, you can use `#lang hindley-milner` as new Racket program:

```racket
#lang hindley-milner

(let ([a 1]
      [b (λ (x) x)])
  (b a))
```

Run it can see program prints expressions' structure and type.

##### REPL

The final thing to do, that's REPL supporting, we need to overwrite `#%top-interaction` to make it:

```racket
(provide (except-out (all-from-out racket) #%module-begin #%top-interaction)
         (rename-out [module-begin #%module-begin]
                     [top-interaction #%top-interaction]))

(define-syntax-rule (top-interaction . exp)
  (pretty-print-typ (type/infer (parse exp))))
```

It gives a type after pretty print for input in REPL. Finally, we complete this journey.

### Conclusion

I hope detailed implementation and examples show why we need the HM system, and how to make one, and where we would need it. I would be glad to hear you get help from this article. Have a nice day, and it's time for cookies!

p.s. This is probably the second-longest article I made XD.
