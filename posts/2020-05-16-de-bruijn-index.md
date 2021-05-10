---
title: "De Bruijn index: why and how"
categories:
  - cs
tags:
  - plt
  - de bruijn index
  - racket
---

At the beginning of learning PLT, everyone would likely be confused by some program that didn't have a variable! Will, I mean they didn't use `String`, `Text` or something like that to define a variable. A direct mapping definition of lambda calculus(we would use **LC** as the short name in the following context, and if you unfamiliar with **LC**, you can read [this article](/blog/2020/01/01/cs/note-what-is-lambda-calculus/) first) usually looks like this:

```racket
#lang typed/racket

(struct term [] #:transparent)
(struct term:var term [(name : String)] #:transparent)
(struct term:lambda term [(x : String) (m : term)] #:transparent)
(struct term:application term [(t1 : term) (t2 : term)] #:transparent)
```

But what we may find some definitions look like this:

```racket
#lang typed/racket

(struct bterm [] #:transparent)
(struct bterm:var bterm [(v : Integer)] #:transparent)
(struct bterm:lambda bterm [(m : bterm)] #:transparent)
(struct bterm:application bterm [(t1 : bterm) (t2 : bterm)] #:transparent)
```

There has two significant different:

1. variable is an `Integer`.
2. lambda does not contain `x`(which means parameter in high-level languages' concept).

This is De Bruijn index(we would use **DBI** as short name in the following context), we can write it out, for example, **id** function `λx.x` can be rewritten with `λ0`, Y combinator `λf.(λx.f (x x)) (λx.f (x x))` can be rewritten with `λ(λ0 (1 1))(λ0 (1 1))`, but why? To understand **DBI**, we need to know what was the problem in **LC**.

### $\alpha$-conversion

Usually, two **id** functions considered the same function. However, if we encode **LC** as the first definition written in **racket**, we would get into trouble: We may say `λx.x` is not the same function as `λy.y`, when they are the same. To solve this problem, we developed a conversion called **$\alpha$-conversion**(or **$\alpha$-renaming**), which renaming `λx.x` and `λy.y` to `λa.a`(`a` is an abstraction variable, we can use any, any character to replace it) let's say. Looks good, any problem else? Emm...yes, as we know, the real world never make thing easier, but that also means a challenge is coming, and we all love the challenge! When a `λy.λx.x` be renamed to `λa.λa.a` is fine, because of every programmer work with variable-shadowing for a long-long time. However, there has a possible dangerous conversion is the renamed variable existed! For example, `λx.λa.x` should not simply be rewritten with `λa.λa.a`, because later when we rename `a`, we would get `λa.λb.b`, oops. `λx.λa.x` definitely is not `λa.λb.b`. To correct **$\alpha$-conversion** is really hard, that's the main reason we introducing the De Bruijn index.

### De Bruijn Index

We already seem some examples, but why it resolves the problem we mentioned in the previous section? We need to know those rules used by the conversion process:

1. remember the level of `λ`, every time we found a `λ` when converting recursively, it should increase(or decrease, it depends on index order) this level value.
2. when found a `λ`, replace it's `x` by variable using the De Bruijn index form, the value of the index is the current level.

Let's manually do this conversion:

```
λx.λy.λz.z
-> λλy.λz.z // x = cur_level = 0, cur_level+1
-> λλλz.z   // y = cur_level = 1, cur_level+1
-> λλλ2 // z = cur_level = 2
```

Notice that since new form of abstraction(a.k.a lambda) only needs `M` part(a.k.a. body). Another important thing is some De Bruijn index use reverse order than we show at here, so would be `λλλ0`, not `λλλ2`.

#### Implementation

Now, it's time for the program:

```racket
(: convert (->* [term] [(Immutable-HashTable String Integer)] bterm))
(define (convert t [rename-to (make-immutable-hash '())])
  (match t
    ;; get index from environment
    ([term:var name] (bterm:var (hash-ref rename-to name)))
    ([term:lambda p b]
     (bterm:lambda
      (convert b
               ;; bind parameter name to an index
               (hash-set rename-to p (hash-count rename-to)))))
    ([term:application t1 t2]
     (bterm:application
      (convert t1 rename-to)
      (convert t2 rename-to)))))
```

`->*` is a type constructor in **Racket** for **optional** parameters, should be read like `(->* normal-parameter-types optional-parameter-types return-type)`. I use optional parameters to help users don't need to remember they must provide an empty hash table. A tricky thing is I didn't record level, at least, not directly. Here I use an immutable hash table to remember level, since how many variables should be renamed exactly is level value. Then variable only need to replace its name with the index.

Congratulation, now you know everything about **DBI**!? No, not yet, there still one thing you need to know.

### $\beta$-reduction

$\beta$-reduction? You might think how can such basic things make things go wrong. However, a naive implementation of $\beta$-reduction can break structural equivalence of **DBI** form, which can make an annoying bug in those systems based on **LC**. The problem is lack-lifting. For example, a normal implementation of $\beta$-reduction would simply make `λ(λλ2 0)` become `λλ2`. However, the same form directly converted from `λx.λz.z` would become `λλ1`, and `λλ2` will be considered as different value as `λλ1` since `1` is not `2`. We can introduce another renaming for these, but if we can fix it in $\beta$-reduction, why need another phase?

#### Implementation

```racket{numberLines: true}
(: beta-reduction (->* [bterm] [Integer (Immutable-HashTable Integer bterm)] bterm))
(define (beta-reduction t [de-bruijn-level 0] [subst (make-immutable-hash '())])
  (match t
    ([bterm:var i]
     (hash-ref subst i (λ () t)))
    ([bterm:lambda body]
     (bterm:lambda (beta-reduction body (+ 1 de-bruijn-level) subst)))
    ([bterm:application t1 t2]
     (match t1
       ([bterm:lambda body]
        (let ([reduced-term (beta-reduction body (+ 1 de-bruijn-level)
                                            (hash-set subst de-bruijn-level t2))])
          ;;; dbi lifting by replace reduced-term (+ 1 dbi) with (var dbi)
          (beta-reduction reduced-term de-bruijn-level
                          (hash-set subst (+ 1 de-bruijn-level) (bterm:var de-bruijn-level)))))
       (_ (raise "cannot do application on non-lambda term"))))))
```

We have to record level independently since it has no relation with the substitution map this time. For variables, all need to do is apply substitution map to get value, if not, use origin form as a result. For the lambda, increase level is the only thing. For application, it's complicated. We need to be more careful with it. It contains three major parts:

1. check `t1` is an abstraction(a.k.a lambda), line 9 and 16
2. do $\beta$-reduction by add stuff into substitution map, line 11 to 12
3. **DBI** lifting (for example, `λλ2` should become `λλ1`), line 14 to 15

### Conclusion

**DBI** is a quite useful technology when implementing complicated AST conversion. It's not just easier to avoid rename conflicting, but also a less memory required form for implementations. I hope you enjoy the article and have a nice day, if this even really helps you in a real task, would be awesome!
