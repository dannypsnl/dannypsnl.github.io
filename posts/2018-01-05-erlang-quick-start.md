---
title: "Erlang Quick Start"
categories:
  - cs
tags:
  - erlang
---

那麼今天就來介紹說很久但是一直沒有寫的 Erlang 吧!

Erlang 是一隻很有趣的語言，它絕對跟你看過的主流語言有巨大的差異，無論是語法上還是思想上皆是如此

首先我們需要安裝環境，請參考官方的 Downloads

接著我們就從 erl 開始吧

```bash
$ erl
```

輸入指令啟動 Erlang 的互動環境

你可以先嘗試輸入

```erlang
1> X=0.
0
2> X=1.
** exception error: no match of right hand side value 1
```

為什麼會出現例外呢？因為 Erlang 不準改變變數之值，Erlang 將`X=0.`這樣的述句稱為綁定，而變數一但綁定就不能再次綁定，所以 X 將永遠為 0，請不要害怕這會成為問題

事實上，在共時編程中，這樣的結果是令人安心的，競態問題將大幅減少，你將得到的是助益

那麼我們來看更加細節的部份，首先變數名稱並不是能隨意命名的，在 Erlang 中，只有大寫開頭的名稱會被當成變數名稱，因為小寫被原子(atom)佔去了(小寫開頭即為原子，後面再解釋何為原子)

綁定只有一次，.是一個述句的結束

接著我們來看更多的案例

```erlang
3> X + 20.
20
```

就是個加法

```erlang
4> 0 = X.
0
5> 1 = X.
** exception error: no match of right hand side value 0
```

和剛才稍有不同，不過你可以從這個案例看出為什麼叫做綁定，因為這是雙向的，=會比較兩邊是否相同，如果左值尚未被綁定就會進行綁定行為

```erlang
8> X = 1-1.
0
```

這裡有更有趣的案例，你可以更清楚的了解到=的行為

```erlang
9> 4/2.
2.0
10> 3/2.
1.5
11> 1/3.
0.3333333333333333
```

這裡可以看到 Erlang 對數字型別的自動轉換，運算在 Erlang 中相當輕鬆，Erlang 已處理了最麻煩的部份

```erlang
17> hello.
hello
```

原子之值即自己

```erlang
18> O = {0, 0}.
{0,0}
```

元組(tuple)可以想成匿名的 C 結構

由於神奇的模式綁定(其實就是=的規則)，我們可以寫出如

```erlang
19> Me = {person, {name, "Danny"}, {height, 160}, {sex, male}}.
{person,{name,"Danny"},{height,160},{sex,male}}
20> {person, {name, MyName}, _ , _} = Me.
{person,{name,"Danny"},{height,160},{sex,male}}
21> MyName.
"Danny"
```

這樣複雜的對應式，\_匹配任意值但是我們不 care 那是什麼，可以看到我們透過綁定取得 MyName，話說我是不是寫太矮了(咦)

這裡也展示 Erlang 常用的技巧，利用 atom 標記欄位

需要注意的是如果右值具有不存在的參考，Erlang 會說明此參考尚未繫結(unbound)

```erlang
22> C = A.
* 1: variable 'A' is unbound
```

就像這樣

列表(list)

```erlang
24> A = [1, 2, 3].
[1,2,3]
25> [F, _, _] = A.
[1,2,3]
26> F.
1
```

可以看到列表與結構皆能做模式比對

差別在於這個案例

```erlang
30> [H|T] = A.
[1,2,3]
31> H.
1
32> T.
[2,3]
```

你可以透過特殊的語法比對出 Head 與 Tail，熟悉函數式編程的同學應該已經興奮不已了吧，大概啦

這個特性讓 list 能夠被迭代，而 tuple 不能

接著我們來談字串

```erlang
35> Name = "Hello".
"Hello"
36> Name.
"Hello"
```

看起來與你過去所學無異，但其實 Erlang 是用數字列表代表字串的，所以你可以

```erlang
37> [83, 117, 114, 112, 114, 105, 115, 101].
"Surprise"
```

這真的很 Surprise

但是如果列表無法組成字串，就只是普通的列表，算是 Erlang 中最難搞的陷阱之一

最後教你怎麼退出`erl`

輸入`q().`

```erlang
38> q().
ok
39>
```

像這樣，這會頓一下才退出

你也可以按`<C-c>`，輸入`a`，按`<Enter> (a)bort`

```erlang
1>
BREAK: (a)bort (c)ontinue (p)roc info (i)nfo (l)oaded
       (v)ersion (k)ill (D)b-tables (d)istribution
a
```

像這樣

按`<C-g>`，輸入`q`，按`<Enter>`

```erlang
1>
User switch command
 --> q
```

像這樣

輸入`halt().`

```erlang
1> halt().
```

像這樣，這會馬上退出

下一篇介紹模組好了，我到底欠幾個下一篇了 QQ

### References:

#### [Programming Erlang: 2ed](https://pragprog.com/book/jaerlang2/programming-erlang)

- Author: Joe Armstrong
- ISBN: 978-1-93778-553-6
