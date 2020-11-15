---
title: "程式設計思考（一）核心領域"
image: ../images/racket/racket-logo.jpg
categories:
  - cs
tags:
  - programming
  - beginner
  - racket
---

這是一篇重看 2017 年發的系列文 (這裡是第一篇 [routedan.blogspot.com/2017/02/atm-ps.html](https://routedan.blogspot.com/2017/02/atm-ps.html)) 之後決定重寫的文章

之所以決定重來，是因為以現在我的角度來看，當初寫得太過 Java Spec，並且設計流程相當的缺乏建構領域模型的概念

針對第一點，我決定用 Scheme 作為開發語言，來讓讀者理解程式語言並非重點所在，深入學習語言的特殊技巧確實有用，但卻與程式設計的核心無關 (當然，這並不是說無視語言擁有的抽象機制寫程式是好事)

Scheme 是相當小巧的語言，小巧到我可以寫個 [直譯器](https://github.com/dannypsnl/little-scheme) 來執行 (不過這裡我還是用 Racket，畢竟要做完全部的功能實在太麻煩了)

對第二個問題我決定先從建立概念的領域語言開始這次的設計 (雖說借鑒 Domain Driven Design 但不會完全用一樣的描述方式，是說他有規定一定要怎麼做嗎？)

那麼，在開始之前我們必須學習一點必要的 Scheme，首先，Scheme 有一個稍稍特別的語法叫 S Expression，基本上就是一個長 `(a b c)` 這樣的玩意兒

那麼 S Expression 是怎麼運用的呢？我們可以用實際案例來理解：

```racket
(+ 1 2 3) ; 6
;;; 注意 'x 等同 (quote x) 在 scheme 中程式碼即資料 (同像性)
'(1 2 3) ; (1 2 3)
(cons 1 '(2 3)) ; (1 2 3)
(car '[1 2 3]) ; 1，順帶一提 [] 等同 ()
(cdr '(1 2 3)) ; (2 3)
```

可以看到跟常見的中序語法 (`1 + 2` 這種) 不同之處在於函數被放到了最前面

接著我們看定義新的變數的方式

```racket
;;; 1
(define x 1)
;;; 2
(define (add x y) (+ x y))
;;; 3
(define add (lambda (x y) (+ x y)))
```

第一種會定義一個變數，第二與第三的意思其實是一樣的，只是直接綁定一個函數給名稱(第三個)，或是用了語法糖(第二個)

沒錯，我們所需要的先導知識就只有這樣，其餘的部分會在用到的時候再提

現在讓我們進入設計的部分，首先我們要為 ATM 這個存在建立模型，這個模型會影響很長一段時間內我們對這個問題的看法，進而影響實作的方式(極度糟糕的設計甚至可以讓你根本寫不出想要的結果)

思考一下，ATM 外在的行為是什麼？我們可以提款(withdraw)、存款(deposit)、查詢餘額(check balances)、查詢紀錄(query record)，而這些行為都是在操作交易紀錄，可以總結為以下的規則：

1. withdraw/deposit 增加交易紀錄
2. check balances 會使用交易紀錄計算出自己需要的結果 (餘額)
3. query record 列出所有交易紀錄

現在讓我們先寫下三個定義，放進 `app.rkt` 中 (前置提醒，所有的檔案都要在第一行聲明 `#lang racket`，因為 Racket 實際上支援數種語言的變體)

```racket
#lang racket

(define withdraw 'empty)
(define deposit 'empty)
(define check-balances 'empty)
(define query-record 'empty)
```

這些函式還沒有用處，它們必須操作某種狀態才能夠產生效果，而在這裡我們給予它們的目標就是交易紀錄(list of transaction)

```racket
#lang racket

(define list-of-transaction ‘())
(define (withdraw money)
  [set! list-of-transaction (cons (cons 'withdraw money) list-of-transaction)])
(define (deposit money)
  [set! list-of-transaction (cons (cons 'deposit money) list-of-transaction)])
(define (check-balances)
  [let (
    [sum (lambda (left right)
      (cond
        [(equal? (car left) 'withdraw) (- right (cdr left))]
        [(equal? (car left) 'deposit) (+ right (cdr left))]
        ; 遇到不在意的 transaction 我們就跳過
        [else right]
      ))
    ]
  )
  (foldr sum 0 list-of-transaction)])
(define (query-record)
; 直接印出 list-of-transaction
[pretty-print list-of-transaction])
```

在 `check-balances` 裡面我們突然用了好幾個新的概念，但在解釋細節之前，讓我們看看這些函式用起來的感覺如何

```racket
(deposit 30000)
(withdraw 1000)
(withdraw 2000)
(query-record)
;;; result: '((withdraw . 2000) (withdraw . 1000) (deposit . 30000))
(pretty-print (check-balances))
;;; result: 27000
```

這一段程式碼相當直觀的展示了我們做了什麼操作，這樣的形式非常適合拿來寫測試，這也是為什麼我要從最核心的概念開始這個教學

現在我們可以回到 `check-balances` 了，我們一共採用了 3 個前面沒提到的東西 (真的要說其實只有兩個，這個等下就會知道)

1. let binding
2. cond
3. foldr

我們從 let binding 開始談起，(let (‘binding…) ‘expression…)， … 表示一至多個，binding 由 (‘name ‘init-expression) 組成，而我們其實可以把它視為 lambda 的變換，下面展示這種變換：

```racket
(let [(x 1)] x)
;;; 等於
((lambda (x) x) 1)
```

當然，這個語法之所以存在就是因為這個變換並不好寫的關係，所以不要沒事改成 lambda 的寫法 (不過這就是為什麼其實只有兩個新東西)

`cond` 是 Scheme 的條件式之一，它接收一些 clause，回傳第一個成功的 clause 的結果，每個 clause 都由 ('predicate ‘expression…) 組成，注意在 Scheme 裡，多個表達式存在於一個地方的時候回傳值是最後一個表達式的值，換句話說如果中間表達式不具副作用(side effect)那就是沒有意義的程式：

```racket
(let () 1 2)
;;; result: 2
;;; 永遠都沒有 1 的事
```

`foldr` 是一個從後面往前 `fold` 的函式，它接收一個雙參數函式跟初始值以及要折疊的 list，可以從 `sum` 的定義裡看出 `right` 代表我們當前的折疊結果(初始值是第二個參數)，而 `left` 是當前要處理的元素

那麼我們也將進入第二階段：測試 了

現在我們有一組 ATM 的核心功能，但我們在可預見的未來內就會對它們進行修改 (因為全域變數的存在，事實上如果可以的話，我建議在程式內不要試圖去操作全域變數)，也因此我們必須要開始編寫簡單的測試來保證程式的關鍵功能沒有被破壞

現在建立一個 `test.rkt` 裡面放入

```racket
#lang racket

(require "app.rkt")
```

一執行了 `test.rkt` 就會發現這有問題，我們會得到主程式運行的結果，然而這絕非我們預期的測試所需要的行為，所以我們要拆分 `app.rkt` 成兩個檔案 `app.rkt`與 `atm.rkt`

在 `app.rkt` 中我們只留下：

```racket
#lang racket

(require "atm.rkt")

(deposit 30000)
(withdraw 1000)
(withdraw 2000)
(query-record)
(write (check-balances))
```

在 `atm.rkt` 中必須加入下面的程式來 export 這些函數 (不要忘記 `#lang racket` 喔)

```racket
(provide withdraw)
(provide deposit)
(provide check-balances)
(provide query-record)
```

作為運行範例，並且理所當然的 `test.rkt` 改為引入 `atm.rkt`

接著我們要建立一個簡單的測試框架作為接下來測試所使用的工具

```racket
(require "atm.rkt")
(define list-of-test-failure '())
(define (assert-eq actual expect)
  (if (equal? actual expect)
    (void)
    [set! list-of-test-failure [cons (list 'not-equal 'actual actual 'expect expect) list-of-test-failure]]))

;;; first test
(deposit 3000)
(assert-eq (check-balances) 3000)

(if (null? list-of-test-failure)
  'test-pass
  list-of-test-failure)
```

我們做了一個簡單的回報錯誤框架 (感謝 Scheme 簡短的語法，只要 8 行就有這麼不錯的效果)，現在讓我們加入第二個測試

```racket
(deposit 3000)
(withdraw 2000)
(assert-eq (check-balances) 1000)
```

很不幸的是這次我們會得到：`((not-equal actual 4000 expect 1000))`

這是為什麼呢？因為我們的核心函式總是修改同一個全域的紀錄，這使得每次的測試之間其實都不是獨立的；然而當我們閱讀測試的時候，必然不希望每次都需要閱讀大量的前後文才能正確的理解結果；因此我們必須要修改核心的函式

p.s. 事實上如果真實世界的測試寫成這樣也不可能讀得完，也無法修改。最後成為所有人的惡夢，因為這個測試總是失敗，也沒辦法修復，最後剩下不改相關的程式的結局

所以這裡要引入一個新的結構 `struct` 用來暫存我們的狀態

```racket
(provide tran)
(struct tran ([list #:auto #:mutable])
  #:auto-value '()
  #:transparent)
;;; 並修改操作函數
(define (withdraw tr money)
  [set-tran-list! tr (cons (cons 'withdraw money) (tran-list tr))])
(define (deposit tr money)
  [set-tran-list! tr (cons (cons 'deposit money) (tran-list tr))])
(define (check-balances tr)
  [let (
    [sum (lambda (left right)
      (cond
        [(equal? (car left) 'withdraw) (- right (cdr left))]
        [(equal? (car left) 'deposit) (+ right (cdr left))]
        ; 遇到不在意的 transaction 我們就跳過
        [else right]
      ))
    ]
  )
  (foldr sum 0 (tran-list tr))])
(define (query-record tr)
  [pretty-print (tran-list tr)])
```

現在我們的 `test.rkt` 變成

```racket
(let [(tr (tran))]
  (deposit tr 3000)
  (assert-eq (check-balances tr) 3000))
```

我們藉由引入一個變數去除了共用全域變數的衝突

p.s. 注意 `app.rkt` 也要一起修改，這裡就不多費口舌

`p.s. set-tran-list!` 跟 `tran-list` 都是由 Racket 替我們生成的函數，有興趣看細節的可以看：[docs.racket-lang.org/reference/define-struct.html](https://docs.racket-lang.org/reference/define-struct.html) 這裡我就不介紹了

[下一篇](/blog/2020/04/25/cs/abstraction-of-programming-design-2-user-interface/)會加入使用者操作的部分，see you next time

參考：

- [docs.racket-lang.org](https://docs.racket-lang.org/)
