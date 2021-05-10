---
title: "ANTLR v4--introduction"
categories:
  - cs
tags:
  - antlr4
---

今天我想介紹一個強大有趣的工具--ANTLR

這個工具根據我們定義的文法產生處理原始碼的 parser，當然不只是處理程式語言，你也可以用來處理其他資料

## 安裝

```bash
cd /usr/local/lib
sudo curl -O http://www.antlr.org/download/antlr-4.7-complete.jar
export CLASSPATH=".:/usr/local/lib/antlr-4.7-complete.jar:$CLASSPATH"
alias antlr4='java -jar /usr/local/lib/antlr-4.7-complete.jar'
alias grun='java org.antlr.v4.gui.TestRig'
```

之後會用到的通常是`antlr4`這支程式

因為它用來產生 parser

## 開始

我們需要建立一個檔案叫`xxx.g4`，而裡頭的 grammar 就必須是`grammar xxx;`

舉例來說`JSON.g4`就會是

```antlr4
grammar JSON;
```

接下來我們談`ANLTR`的語法還有它如何運作

首先如果你接觸過`v3`以前的`antlr`，那麼你一定知道`embbed action`

不過這個版本的`antlr`並不需要全都使用`embbed action`來實現程式邏輯

反之它加入了`xxxBaseListener`來處理大部分的翻譯過程

你也可以選擇`Visitor`來實作，但是`visitor`需要顯式的調用`Context`，並不適合大型複雜的文法

`Listener`則能應付絕大多數的情況，它的`API`都是`enterXxx`跟`exitXxx`的格式，名稱相當直觀

## 約定

ANTLR 要求`Token`使用大寫英文字母開頭，`grammar`則使用小寫

例如:

```antlr4
NUM : [0-9]+ ;
ID : [a-z]+ ;

stat : ID '=' expr
    | expr
    ;

expr : NUM
    | ID
    ;
```

`ID`跟`NUM`都是`token`，`stat`跟`expr`則是文法規則

`|` 表示不同的可能

`;` 表示規則結束

可以看到如果我們想要辨別符號，必須用`''`包起來，除了符號，關鍵字也要這樣處理，像這樣

```antlr4
Class : 'class' ;
```

`+` 表示一個或無限多個

`*` 表示沒有或無限多個

`?` 表示有或沒有

定義`ID`跟`NUM`時，我都使用了正規表達式來處理，這是為了方便而放入的功能

你也可以選擇

```antlr4
NUM : ('0' .. '9')+ ;
```

這種寫法

最後就是產生`parser`

```bash
antlr4 -Dlanguage=Cpp JSON.g4
```

`-Dlanguage` 指定產生什麼語言的`parser`

這裡是`C++`

如果不指定，那麼預設是`Java`

目前支援`Java`, `C#`, `Python2|3`, `JavaScript`, `Go`, `C++`, `Swift`

儘管選擇你習慣的那個

為什麼要學 Antlr?

事實上編譯技術在很多地方都有用途

例如`Firefox`團隊為了加速`JavaScript` `eval`函式的執行速率，在編譯到`eval`時會進行預處理，讓`JavaScript`真的執行到這邊時已經少了許多工作

簡單一些的應用可能有：編寫`DSL`簡化開發工作

例如新增網路服務`API`，如果用特製的語言將工作進行簡化

```nim
routes:
    get "/":
        resp Page1
```

那麼我們實際上需要負擔的工作量就大幅縮小了吧！

而且亦便於未來的維護工作，而`DSL`最棒的要點就在於，我們往往無須實現完整的通用語言

比如我們可以在回傳的區塊回到`Java`語言

```nim
routes:
    get "/":
        @java {
            // ... Your java code
        }
```

這樣我們就不需要實現太過麻煩的東西

而一樣能享受`DSL`的方便度
