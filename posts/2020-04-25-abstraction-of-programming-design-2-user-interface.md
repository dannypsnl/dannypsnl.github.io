---
title: "程式設計思考（二）操作介面"
image: ../images/racket/racket-logo.jpg
categories:
  - cs
tags:
  - programming
  - beginner
  - racket
---

在[上一篇](/blog/2019/11/09/cs/abstraction-of-programming-design/)教學裡我們只花費了心思在如何建立核心概念的程式上，然而寫好地程式碼沒有讓人操作的介面也就只是一團垃圾而已，這次我們就來看看怎麼樣逐步開發操作用的介面吧！ **Racket** 本身就提供了相當方便的內建 GUI，而這次我們就是要使用這些 API，首先我們來打造單一帳戶的操作介面

### 宣告式語言 racket/gui

```racket{numberLines: true}
#lang racket/gui

(require "atm.rkt")

(require racket/class)

; Account window
(define account-window
  (new frame%
       [label "Account"]
       [width 400]
       [height 300]))

(define money-input
  (new text-field%
       [parent account-window]
       [label "amount:"]))
(define withdraw-btn
  (new button%
       [parent account-window]
       [label "withdraw"]))
(define deposit-btn
  (new button%
       [parent account-window]
       [label "deposit"]))
(define check-balances-btn
  (new button%
       [parent account-window]
       [label "check balances"]))
(define query-record-btn
  (new button%
       [parent account-window]
       [label "all records"]))

(send account-window show #t)
```

接著執行 `racket app.rkt` 就可以看到我們的 Account 操作介面了，現在所有的按鈕都還沒有綁定要做什麼，所以我們先來看看到底上面這些程式都是拿來做什麼的吧！

`#lang racket/gui` 這點或許會讓人有點迷惑，但這整篇文章都可以不必考慮它到底是怎麼做到的，只需要知道這會讓我們執行的語言變成一個叫做 `racket/gui` 的擴展語言，這是為了下面的 `frame%`, `text-field%` 等等 GUI 相關的程式宣告的。**Racket** 的 GUI 框架設計相當直覺，每個 `new` 宣告都對應了 **是什麼元件** 以及 **有哪些屬性**，例如 `account-window` 就是一個 frame、高 300、寬 400，以此類推。其中比較特殊的屬性只有 `parent`，這是用在該宣告要附屬在哪個宣告底下時使用的，除此之外幾乎都只需要實際執行就能看出程式碼的用途！

### 資料與操作

但一個只能顯示畫面的程式不能算是操作介面(廢話 XD)，所以我們接下來要導入資料跟動作才能讓這個介面有操作意義

```racket{numberLines: 7}
(define test-users-transcations
  (make-hash '()))
(hash-set! test-users-transcations
           "danny" (tran))
(define current-user 'no-one)
```

以及在 `(send account-window show #t)` 之前把 `current-user` 改成存在的帳號，這裡只有 `danny` 這個帳號而已：

```racket{numberLines: 40}
(set! current-user "danny")
(send account-window show #t)
```

這就算是完成了我們需要的資料部分，但有些東西需要說明一下： `make-hash` 會建立一個可以對應資料到資料的 **map**，例如這裏我們用 `hash-set!` 插入了 `"danny"` 到一個帳戶的 **map**，那麼之後就可以用 `"danny"` 這個 **key** 不斷的存取同一個帳戶。

接著我們打造需要的操作

```racket{numberLines: 13}
(define (show-balances a e)
  [message-box "Balance"
               (format "balance: ~a"
                       (check-balances (hash-ref test-users-transcations current-user)))
               account-window
               '(no-icon ok)])
(define money-input
  (new text-field%
       [parent account-window]
       [label "amount:"]))
(define (affect-balance action)
  (λ (a e)
    (let ([tran (hash-ref test-users-transcations current-user)]
             [amount (send money-input get-value)])
      (action tran (string->number amount))
      (show-balances a e))))
```

p.s. 注意到 `money-input` 我們已經宣告過了，只是 **Racket** 要 `define` 之後才能使用變數，`affect-balance` 用到 `money-input` 而我要顯示它們的位置關係才會再顯示一次

這裏 `show-balances` 做的事情非常簡單，根據 `current-user` 從 `test-users-transcations` 裡找出對應的帳戶接著呼叫 `atm.rkt` 裡的 `check-balances`。並用 `message-box` 顯示在畫面上。而 `affect-balance` 就比較複雜了點，首先要注意到它接收了一個叫做 `action` 的參數然後才是一個 `λ`(就是 `lambda` 的希臘文，在 **Racket** 裡可以互相替換) 函數，而這個 `λ` 函數會根據 `action` 跟 `money-input` 的輸入值(用 `(send money-input get-value)` 取得，注意要把字串轉成數字 `string->number`)對帳戶產生影響接著用 `show-balances` 顯示餘額。

最後我們把函數註冊上各個按鈕：

```racket{numberLines: 29}
(define withdraw-btn
  (new button%
       [parent account-window]
       [label "withdraw"]
       [callback (affect-balance withdraw)]))
(define deposit-btn
  (new button%
       [parent account-window]
       [label "deposit"]
       [callback (affect-balance deposit)]))
(define check-balances-btn
  (new button%
       [parent account-window]
       [label "check balances"]
       [callback show-balances]))
(define query-record-btn
  (new button%
       [parent account-window]
       [label "all records"]
       [callback (λ (a e)
                   (let ([tran (hash-ref test-users-transcations current-user)])
                     [message-box "All Records"
                                  (format "records: ~a" (query-record tran))
                                  account-window
                                  '(no-icon ok)]))]))
```

要綁定函數要用 `callback` 這個屬性，而它預期這個函數接收兩個參數，這也是為甚麼要有 `a` `e` 這兩個好像沒在用的參數(其實是 `button` 跟 `event`，但這裡沒用到所以隨便寫)。對於 `withdraw-btn` 跟 `deposit-btn` 來說，`callback` 就是 `affect-balance` 配上要用的 `action`(這就是為什麼要回傳一個函數，這也叫做 closure，指的是內部的函數會帶著原本給它的綁定環境) 得到的函數。對 `check-balances-btn` 來說可以直接用 `show-balances`。而 `query-record-btn` 是唯一直接寫成 `λ` 的，因為沒有其他人會用到這個函數，它做的其實就是調用 `atm.rkt` 裡的 `query-record` 得到全部操作紀錄然後印出，但要記得去改 `atm.rkt`：

```diff
- (define (query-record tr)
-   (pretty-print (tran-list tr)))
+ (define (query-record tr)
+   (tran-list tr))
```

原本的設計是印出紀錄，現在則是簡單的回傳。

### 登入帳號

最後我們想加上的功能是一個能夠處理多帳號的介面：

```racket{numberLines: 7}
(define test-users
  (make-hash '()))
(hash-set! test-users
           "danny" "1234")
```

這段程式編碼了使用者名稱到密碼的 **map**。接著我們把測試的 `account-window` 程式刪除：

```diff
- (set! current-user "danny")
- (send account-window show #t)
```

放入以下主程式：

```racket{numberLines: 66}
; Main window
(define window
  (new frame%
       [label "ATM"]
       [width 400]
       [height 300]))

(define username-input
  (new text-field%
       [parent window]
       [label "username:"]))
(define password-input
  (new text-field%
       [parent window]
       [label "password:"]))

(define (login a e)
  (letrec ([username (send username-input get-value)]
           [passwd (send password-input get-value)]
           [expected-passwd
            (hash-ref! test-users username 'no-account)])
    (cond
      [(equal? expected-passwd passwd)
       (set! current-user username)
       (send account-window show #t)]
      [#t message-box "Error" "No this user or incorrect password" window '(no-icon ok)])))
(define login-button
  (new button%
       [parent window]
       [label "login"]
       [callback login]))

; Display GUI
(send window show #t)
```

大部分的程式都不用再解說，新的功能只有 `login` 這支函數，而它做的事也只有取得帳號跟密碼並跟資料中的資訊比對而已，如果成功就設定 `current-user` 並開啟 `acount-window`，否則跳出錯誤提示。最後把這個功能跟 `login-button` 綁定就完成了！而 `letrec` 是一個特殊的綁定宣告，它允許綁定互相參考，而這裏正好有這個需要，可以到我以前寫的 [scheme interpreter](https://github.com/dannypsnl/little-scheme/issues/15) 的 issue 找更多的資訊。

### 結論

這個教學重點擺在如何設計一個可用的程式，也因此跳過了很多細節部分，要進一步掌握寫程式這回事需要更多的努力，但我希望這個系列已經讓你知道如何抽象一個繁複的問題。因此我提出一些可能的改善方向給這個小專案作為給讀者的練習 XD：

- 處理餘額不足的情況
- 改用其他資料儲存方式，現有的變數儲存方案在 ATM 需要分配到不同地區時會出現資料同步的困難，也有程式一結束就不能儲存資料的問題，而我們很難預放程式的意外停止(如斷電、意外錯誤等)
- 建立新帳號的功能(有管理員權限才能操作？)

希望這些練習能夠幫助你更進一步理解程式修改的過程，最後感謝你的閱讀，see you。

參考：

- [docs.racket-lang.org](https://docs.racket-lang.org/)
