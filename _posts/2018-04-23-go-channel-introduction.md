---
layout: post
title: "Go Channels 入門" 
categories: golang concurrency
tags:
  - golang
  - concurrency
---

> 閱讀此篇之前，我假設讀者已具備`Go`和部分CS常識

說起`Go`的`channel`，要從[CSP](http://www.usingcsp.com/cspbook.pdf)(Communicating Sequential Process)模型說起

在電腦科學中，CSP是一種形式語言，描述非同步系統中各種[interaction](https://en.wikipedia.org/wiki/Interaction)的模式

而interaction則指影響兩個以上物件的動作(action)

細節無須深入，只是讓讀者了解技術的起源

現在我們從一個簡單的案例開始說明Concurrency為什麼困難，而高階的抽象技術又解決了什麼難題

```go
func main() {
    i := 0
    go func() {
        i++
    }()
    if i == 1 {
       fmt.Println("你給我翻譯翻譯，什麼他媽的是他媽的驚喜")
    }
}
```

> p.s. 省略一些引入

這支程式通常是不會有問題的，也就是說子彈可能飛不起來，但是這只是通常，而Concurrency之所以難搞，問題恰恰出在他平常沒有問題

以上面的程式為例，我測試過大約1000次只會出現3次的驚喜，而不確定的行為給除錯帶來了巨大的麻煩，更不幸的是，現實世界中的錯誤往往並沒有這麼顯而易見

現在假設我們想讓子彈飛，有幾種技術可以達到，讓我們從最糟糕的方式開始解決這個問題，有趣的是這也是同步問題的演進史
，可見程式思想總是一貫的以簡單為上，致使一直以來的思考都有相似之處

- 首先上場的是：等

不錯，既然go func把i++放到未來執行，那麼我們只要等到它執行完畢也自然就能夠得到驚喜了吧！

Code:

```go
// ...
i := 0
go func() {
    i++
}()
time.Sleep(1000 * time.Millsecond)
if i == 1 {
    // ...
}
// ...
```

然而眼尖的讀者應該已經發現這個解法暗藏陷阱了吧

這個解法之所以不行，是因為它依然沒有可確定的行為，我們只是假設等個一秒‘應該’就有驚喜了吧

而這個假設通常可行，這基本上是雪上加霜，偶發的錯誤將被埋藏入程式的更深處

而且我們不可能總是能等一秒，然而降低時間將會造成正確率下降，而且我們希望能夠在執行完畢時就得知這個好消息，這些原因導致這個解法不可行

那麼怎樣才是正確而可被信任的程式呢？這就要談到 Go 的基本共時抽象 `channel`

請看這段程式

```go
func main() {
    done := make(chan struct{})
    i := 0
    go func() { 
        i++
        close(done)
    }()
    <- done
    if i == 1 {
        // Always happen now
    }
}
```

`channel` 究竟是什麼？為什麼可以達成我們前面討論的難題？

而這正是這篇文章的重點，`channel` 是 Go 的一種共時抽象，首先要明白 go 讓程式到哪了

go 關鍵字會啟動一個 goroutine 處理這些程序，而至此我們將失去知道這些程序執行順序的能力

而 `channel` 正是在 Go 中讓這些共時程序溝通的唯一方式

讓我們用對話來說明這個概念，想像 `channel` 是一台電話，而各個程序你可以想成是一個人

當 `make(chan $type)` 時，是架起電話線

能不能夠取得這個 `channel` 和你能不能接到電話是同樣的意思

而我們可以對電話講話，唯一不一樣的是 `channel` 是台允許時序不一樣的電話，對方可以在你講完話之後幾十年再來聽這段對話

而 `close($channel)` 就是拆掉電話線，線路斷掉大家自然就無法使用這支電話了

特別重要的是，即便 `channel` 已死，有事燒紙，你還是能聽到它剩下的訊息紀錄，當然它已無法再寫入(不然是關心酸的喔)

而對電話講話就是 `$channel <- $data` ，聽取則是 `<- $channel`，聽取是一個運算式，你可以承接它的值

正如我們的行為，當你預期有電話內容的時候，是不是會繼續等待訊息呢。所以如果聽取一個 `channel` 而沒有內容時，這個 goroutine 將會卡死在這裡，靜待有緣人

等等，那一直都沒有訊息呢？這種情況被 Go 視為 bug，編譯器不會讓你編譯成功的

那麼當電話被拆除而且紀錄都被聽完了之後呢？你自然就不會再繼續聽這個已經沒用的東西了，所以這時候會停止等待，於是就解鎖

這時再重看上面的程式是不是豁然開朗了呢？

因為我們有一個初始化好的頻道(channel)，接著啟動 goroutine，接著試圖讀取 channel done，這讓 main 必須開始等待，直到我們剛剛分出去的 goroutine 執行到 `close(done)` 時，main 赫然發覺受騙上當，這個電話被切了，接著確定(它大概做事非常謹慎)已經沒有任何訊息留存，就憤而摔機，結束它的等待，那麼接下來 if 可以讀到預期的結果也就不太意外了(但是驚喜)

那麼到這裡我們整理一下 `channel` 的行為

operation | channel state | result
----------|---------------|--------
Read      | nil | Block
          | open and not empty | Value
          | open and empty | Block
          | Closed | default value, false
          | Write Only | Compilation Error
Write     | nil | Block
          | Open and full | Block
          | Open and not full | Write Value
          | Closed | panic
          | Receive Only | Compilation Error
close     | nil | panic
          | Open and not empty | closed channel, can read until it's drained
          | Open and empty | closed channel, read false
          | Closed | panic
          | Receive Only | Compilation Error

你會發現一個有趣的地方，`channel` 有所謂的 full !?沒錯，`channel` 可以設定長度給它，通常我們可以利用這個特性限制一次可執行任務的數量 etc

這篇文章就到這邊，下次我再介紹各式各樣的 `channel` 技巧，完成各種共時運行模式，歡迎留言提出建議或是詢問，謝謝觀看

### References

#### [CSP book](http://www.usingcsp.com/cspbook.pdf)

#### [CSP wiki](https://en.wikipedia.org/wiki/Communicating_sequential_processes)
