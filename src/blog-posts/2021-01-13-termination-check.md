---
title: "termination checking(終止檢查)"
date: "Wed Jan 13 06:08:05 UTC 2021"
categories:
  - cs
tags:
  - plt
  - termination check
  - sized type
---

在 dependent type 裡面，我們可以寫下如

```racket
(data Nat
      [zero : Nat]
      [suc : (Nat -> Nat)])
(data Bool
      [true : Bool]
      [false : Bool])

(define (Nat-or-Bool [x : Bool]) : Type
  (match x
    [true => Nat]
    [false => Bool]))
```

這樣的函數，`(Nat-or-Bool true)` 展開得到 `Nat`、`(Nat-or-Bool false)` 展開得到 `Bool`。而我們可以把它用在定義裡面，因此以下程式是合法的

```racket
(define a : (Nat-or-Bool true) 1)
(define b : (Nat-or-Bool false) true)
```

因為 type checker 會展開得到型別之後才進行型別檢查。然而既然可以在型別層面執行一段計算，我們就不得不考慮以下定義的可能性

```racket
(define (endless [x : Nat]) : Type
  (match x
    [0 => Nat]
    [(suc ,n) => (endless (suc n))]))
```

這個函數不會終止，因此 type check 也將永不停息！而我們無法證明這個計算究竟是會無止盡的跑下去還是只是需要等很久而已。這是不可接受的情況，因此我們必須引入 termination check，這個檢查應該保證我們寫得出來的函數都只能是會終止的函數。

遞迴是我們主要的關注點，即我們需要檢查每次函數可能呼叫自己時都至少得到一個「更小」的參數，這是什麼意思呢？讓我們看一段程式來理解

```racket
(define (+ [n m : Nat]) : Nat
  (match {n m}
    [zero ,m => m]
    [(suc ,n1) ,m => (suc (+ n1 m))]))
```

每次 `+` 的呼叫點，`n` 都被拆解成更小的 `n1`，因此我們可以理解到它最終必然會變成 `zero` 從而停止。然而我們要怎麼計算出 `n1` 小於 `n` 呢？其中一種做法是所謂的 sized type，回到 `Nat` 的定義

```racket
(data Nat
      [zero : Nat]
      [suc : (Nat -> Nat)])
```

`Nat` 和 `(Nat -> Nat)` 已經足夠解釋計算規則了，但這次我們要重新解釋 `zero` 和 `suc` 的型別規則，以明白大小的判斷是如何完成的。在新的規則裡面，型別 `Nat` 多了一個 `{i}` 表示其 **size**，其他都沒有變化，得到以下的新的計算規則

1. `zero : forall i. Nat{i+1}`
2. `suc : forall i. Nat{i} -> Nat{i+1}`

**size** 不會寫進語法中，因為可以通過自動推導得到，而未定的 **size** 可以替換成 free variable。**size** 可以簡單視為「整數」，回到檢查的觀點，現在我們可以重新看待 `+` 函數

```racket
(define (+ [n m : Nat{i}]) : Nat{j}
  (match {n m}
    [zero ,m => m]
    [(suc ,n1{i-1}) ,m => (suc (+ n1 m))]))
```

`zero` 的分支可以不用管，因為右手邊並沒有遞迴呼叫。現在 `(suc (+ n1 m))` 可以檢查到現有的 argument 的大小是 `(list i i)`，而新的參數是 `(list i-1 i)`，其中 `i-1 < i` 證明了終止性。對所有 `match` 的分支都檢查一次就可以達成目的了。這樣的技術甚至可以處理更複雜的遞迴，如 Ackermann

```racket
(define (ack [n m : Nat]) : Nat
  (match {n m}
    [zero ,m => (suc m)]
    [(suc ,n) zero => (ack n (suc zero))]
    [(suc ,n) (suc ,m) => (ack n (ack (suc n) m))])))
```

我們條列每條的情況

1. 沒有遞迴不管
2. `(list i i)` 變成 `(list i-1 i+1)`
3. 兩個遞迴
   1. `(list i i)` 變成 `(list i-1 ?j)`
   2. 和 `(list i i)` 變成 `(list i+1 i-1)`

上述的方法處理了大多數的遞迴程式，但還需要考慮呼叫其他函數的情況，這具有相當的複雜性。一般來說我們會附上呼叫鍊不得逆轉，即

1. A 呼叫 B
2. B 呼叫 A

一次只能存在一邊，否則就會有未知的遞迴沒有檢查到，依賴此假設可以不檢查呼叫其他函數的表達式。但還需要再補上一個條件，即遞迴時的參數不得為呼叫另一個函數，試想就知道我們不可能通過此函數含有的資訊保證另一個函數結果的 **size** 符合「小於」的結果。

然而我們有時候真的想使用互相遞歸的函數定義

```racket
(define (odd? [n : Nat]) : Bool
  (match n
    [zero => false]
    [(suc ,k) => (even? k)]))
(define (even? [n : Nat]) : Bool
  (match n
    [zero => true]
    [(suc ,k) => (odd? k)]))
```

為了得知這個互相依賴的關係，我們通常會提供 `mutual` 關鍵字，在此區塊內的函數可以

1. 互相呼叫
2. 呼叫視為遞迴並檢查終止性

到此已經大致涵蓋了 dependent type 語言如何保證能夠求出結果避免不合理的型別被定義出來，除了終止性以外還有如 strictly positive、totality 需要檢查，期望我以後可以補充完整這些資訊 XD。
