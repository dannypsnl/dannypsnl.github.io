---
title: "lexer 原理解釋"
categories:
  - cs
tags:
  - compiler
  - lexer
  - golang
---

因為 Elz 實在是一個遠超我一開始的預想的語言(最開始只是想了解編譯器，乾脆就開始設計新語言了)

打造花了我很多心思，Elz 採用先從原始碼中取得詞素，再分析詞素的設計

這樣一來兩邊都可以降低實作的複雜度

分成`lexer`與`parser`兩大主軸工作之後，考慮到效能，我沒有採用 lex 這種吸引人的作法(其實一開始是有試過，最重要的問題是我覺得學那個好麻煩 XD)

而是手刻這個部分，其中最重要的設計就是利用`Golang`的共時技巧，讓`parser`可以不用等待`lexer`的完成

這個技術的完成第一是寫出一個函數，建立一個`lexer`實體，接著用`goroutine`啟動`(*lexer) run()`這個函數，最後這個函數回傳這個`lexer`實體

run 之中放著 State Function 迴圈

什麼是 State Function? 它就是一個型別函數，不過它所指的函數回傳自己這個型別以作為狀態變遷的依據

`stateFn`定義如下:

```go
type stateFn func(*Lexer) stateFn
```

什麼叫狀態變遷? 這樣有什麼好處?

讓我們回顧 Lexer 的原理，它接收一個字元串流，根據讀到的字元進行不同的操作，以得到詞素串流

所以不同的字元就是那個狀態啦!

而傳統的做法都像下面那樣

```c
void LexAll(int state) {
  switch(state) {
  case number:
    LexNumber();
  case alphabra:
    LexIdentifier();
  // ...
  }
}
```

重複不斷的程式碼，而且我們一直在呼叫函數

那何不傳回我們想執行的下一個函式?

這就是 State Function 所想要表達的意思

```go
func lexWhiteSpace(l *Lexer) stateFn {
    for r := l.next(); isSpace(r) || r=='\n'; l.next() {
        r = l.peek()
    }
    l.backup() // break mount's rune is not a space
    l.ignore() // because no emit, we need ignore will mount's pos runes

    switch r := l.next(); {
    case r == EOF:
        l.emit(ItemEOF)
        return nil
        // ...
    case r == '=':
        return lexEqualOp // =, ==
    case r == ':':
        l.emit(ItemColon)
        return lexWhiteSpace
    case r == '"' || r == '`' || r == '\'':
        return lexString // "string literal", `string literal`
    case '0' <= r && r <= '9':
        return lexNumber // 12323, 2.344
    case isAlphaNumeric(r):
        return lexIdentifiers // car, car_build
    default:
        panic(fmt.Sprintf("Don't know how to do with: %q", r))
    }
}
```

這是作為初始狀態的狀態函數內部實作(省略沒有辦法幫助你理解它的部分)

再看`lexNumber`

```go
func lexNumber(l *Lexer) stateFn {
    firstDot := true
    for r := l.next(); ( '0' <= r && r <= '9' ) || r == '.'; r = l.next() {
        if r == '.' {
            if firstDot {
                firstDot = false
            } else {
                break
            }
        }
    }
    l.backup()

    l.emit(ItemNumber)
    return lexWhiteSpace
}
```

發現了嗎? 只要回傳初始狀態函數

由於我們不斷執行下一個狀態函數，所以我們就回到初始狀態了，而且不需要初始狀態碼跟初始狀態用的函數兩個東西來完成它

這時我們就要回到 run 的實現了

看看它有多麼的簡單

```go
func (l *Lexer) run() {
    for l.state = lexWhiteSpace; l.state != nil; {
        l.state = l.state(l)
    }
    close(l.items)
}
得到一個狀態函數參考，然後執行狀態函數，就這麼簡單

// l.state是一個stateFn
```

我改用Ｃ＋＋實作了，不過這篇的技術還是很有趣，所以就留下來吧！

ps. 2017/12/29. 我現在還是用 Go，只是先用 antlr 產生 parser(開發速度)
