---
title: "正確實作 substitution 有多難"
categories:
  - cs
tags:
  - plt
  - utlc
---

lambda calculus 有所謂的 substitution，具體來說就是 `((lambda (x) x) y)` 會變成 `y`，但正確實作這個行為到底有多麻煩呢?為什麼我寫這篇廢文: 因為我寫錯了...

一切都由簡單的 macro 開始搞，`utlc` 的目標是簡化 term:

```racket
(define (utlc t)
  (match t
    [`(λ (,x) ,m)
     `(λ (,x) ,m)]
    [`(,f ,a)
     `(,f ,a)]
    [`,e `,e]))
```

我們什麼都沒做，只是單純把拿到的東西都傳回去，接著來思考一下簡化要做什麼，對 `λ` 和 application 而言，分別是最小化 body 和執行 substitution(如果可以):

```racket
(define (utlc t)
  (match t
    [`(λ (,x) ,m)
     `(λ (,x) ,(utlc m))]
    [`(,f ,a)
     (match (utlc f)
       [`(λ (,x) ,m)
        (utlc (subst m x a))]
       [f1
        `(,f1 ,a)])]
    [`,e `,e]))
```

接著就必須寫 substitution(`subst`):

```racket
(define (subst t x s)
  t)
```

總之先什麼也不做，思考一下對 variable 來說 substitution 是什麼:

substitute variable v: if v is x, return s, else return v，根據這些已經能寫出來了:

```racket
(define (subst t x s)
  (match t
    [`,e
     (if (equal? `,e `,x)
         s
         e)]))
```

那對 application 呢?就繼續下去而已:

```racket
(define (subst t x s)
  (match t
    [`(,e1 ,e2)
     `(,(subst e1 x s) ,(subst e2 x s))]
; ...
```

lambda 就是問題的根源，先想想簡單的辦法: 對 lambda 而言，substitution 就是替換其 body:

```racket
(define (subst t x s)
  (match t
    [`(λ (,i) ,b)
     `(λ (,i)
        ,(subst b x s))]
; ...
```

想法基本正確，但不足以應付一個 edge case: `((λ (x) (λ (x) x)) y)`，目前的實作回傳: `(λ (x) y)`，但內層變數應該覆蓋外層，結果應該要是 `(λ (x) x)`。顯然需要檢查 lambda 的參數是不是跟要被替換的變數一樣:

```racket
(define (subst t x s)
  (match t
    [`(λ (,i) ,b)
     (cond
       [(equal? `,i `,x) `,t]
       [#t
        `(λ (,i)
        ,(subst b x s))])]
; ...
```

現在再試一次應該就可以會變成 `(λ (x) x)` 了。然而事情還沒完，執行一下這個 `((λ (y) (λ (x) (y x))) x)`，結果是: `(λ (x) (x x))`，但此 `x` 非彼 `x` 啊 www。所以對 lambda 而言還有一個檢查就是如果替換後的名稱跟參數一樣，就需要把 body 裡面的參數全都改名:

```racket
(define (subst t x s)
  (match t
    [`(λ (,i) ,b)
     (cond
       [(equal? `,i `,x) `,t]
       [(equal? `,i `,s)
        (define fi (gensym `,i))
        (define fb (subst b i fi))
        `(λ (,fi) ,(subst fb x s))]
; ...
```

再執行看看就會變成 `(λ (x24403) (x x24403))` 之類的，因為 `gensym` 每次產出都不一定一樣，這樣就大功告成了。現在來思考為什麼只是換個名字會這麼困難，這是因為換名必須不造成語意改變，但 lambda 又沒有辦法限制內外層變數名稱，所以才需要這麼多檢查。想像一下任何一個常見的程式語言引入變數的方式都比 lambda calculus 更加的多，而每個都需要一個一個這樣檢查。我是覺得有點難啦 xd，這就是為什麼需要 [De Brujin index](/blog/2020/05/16/cs/de-bruijn-index/) 這樣的東西。其實只是想發點什麼但論文又還沒看完 xd，那發一下實作的東西好了?
