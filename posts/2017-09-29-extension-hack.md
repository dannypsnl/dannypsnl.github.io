---
title: "Extension hack"
categories:
  - cs
tags:
  - swift
  - extension
---

好吧，上一篇說了這麼多，其實幾乎就只是把屬性定義在類別外罷了，沒什麼啊

這樣並沒有比`class`強到哪裡

所以，讓我們來看看`extension hacks`吧！

## hack 1:

> extension from a temporary protocol

```swift
protocol MenuItem {}
extension label : MenuItem {}
extension button : MenuItem {}

var list = [MenuItem]()
list.append(label("Hello"))
list.append(button("Click me", event))
```

哇，這下我們可以用`List<MenuItem>`來存放我們所想要存放的型別了，只要將你想要存放的型別`extension`一下`MenuItem`這個協定，就是這麼簡單

注意這個機制有幾個問題，第一是如果你想要呼叫某個屬於 label 的方法，你將會得到沒有此方法的編譯期錯誤

那，有辦法解決嗎？

有！首先我們要知道為什麼會這樣，如果你曾經在`shell`中嘗試過印出`type(of: xxx)`

那麼你一定知道型別後面都接有一個位元組，這個位元組，其實就是實際上型別在執行期的樣子啦！因此在執行期中，為了確保最大的安全度，編譯器常用最小介面原則，選擇概念最寬廣的那個型別

那麼編譯器要怎麼知道你是要呼叫子型別的方法還是父型別的呢？

在 C++我們可以用`->`運算子以及指標，確保我們直接存取實體，而且我們不需要聲明子型別是什麼，因為編譯器有在記

不過產生的問題就是，有時候你並不知道到底有沒有這個方法(當然，新的 IDE 與工具們提供了這些，但是我們常常還是編譯下去之後才知道)，進而需要搜尋你用了哪個子型別

而在 Swift，我們用`(instance as! Type).method()`使用子型別的方法，缺點是那個括號跟不甚明瞭的語意，而且我們為了確保安全，還要多做一個
`if instacne is Type`的檢查

回到`Swift`

第一種作法是直接在`MenuItem`上定義一個方法作為統一的介面，任何型別擴展`MenuItem`時，就實作該方法

第二種作法是我們將`MenuItem`轉換成原本的型別

這種作法有個小問題：

問題在於，我們知道`label`是一種`MenuItem`，但是你怎麼知道，某個`MenuItem`是`label`?

所以我們需要對它進行危險的轉換

```swift
MenuItem() as! label // as! 意思是將左邊的值當成右邊的型別來使用，而且這是危險的
```

> ps. 這只是示意，不能運作

而這對工作上非常不合用，也很難凸顯我們想要做什麼

所以我寫了一個轉換函式

```swift
func convert<F, T>(from: F, to: T) -> T {
    if from is T {
        return from as! T
    } else {
        return to
    }
}
```

> ps. 請不要真的用這個函數做事，這只是為了先避開複雜議題(例外處理)才這樣寫的

於是我們可以用

```swift
let res = convert(from: MenuItem(), to: label())
```

取得一個轉換結果，在這裡因為我們失敗時`(from不是一種T)`就回傳`to`

我們沒辦法知道是成功抑或失敗，因此我們應該對此有所區別

```swift
func downCast<F, T>(from: F, to: T) -> T? {
    if from is T {
        return from as? T
    } else {
       return nil
    }
}
```

這是第二版的轉換函數，我用`downCast`是要說明我們在做危險的向下轉型(上面的`convert`則是說明它是通用的轉換)

同時這次失敗將回傳`nil`

因此使用上使用者將需要多負擔一個`!`來解包

```swift
let res = downCast(from: num, to: Double())
print(res!)
```

藉由`nil`，這個版本保證我們通常能知道有沒有轉型失敗(不過回傳`nil`雖然侵入性小，卻也把檢查責任丟給客戶端，而且不能應付本來就是`nil`的實體)

同時，我認為大部分時候，我們不應該用第一種作法，除非你真的很確定你只是需要這個方法

為什麼說第二種作法比較好呢？因為我們經常性面對的問題通常與 App 開發有關

因此需要確切型別的機會比較高，而且第二種作法的侵入性低，未來要對介面進行改變也比較容易，同時 Swift 可還有傳統的介面繼承啊！如果真的需要某個方法提供行為，應該用繼承的方式，直接定義在 class 宣告上

在呼叫轉換函數時，可以看到

```swift
convert(from: xxx, to: label())
```

`to`接收一個實體，我稱之為`Target Type instance`，只要忽略它的括號，我們就能取得還不錯的可讀性，可喜可賀可喜可賀！

## hack 2:

> default subset of protocol

如果我們想要做一個新的協定，同時不希望使用者還要浪費時間定義哪些可以符合協定

我們可以利用`extension`

```swift
protocol Format {}
extension Double : Format {}
extension Int : Format {}
```

這個 hack 跟上一個 hack 有 87%像，讓他們有差別的地方在於所求不一樣

hack 2 專注於提供一組符合協定的預設型別集合

相較於 hack 2，hack 1 只在乎如何讓自訂的型別放進一個泛型容器之中，以及我們怎麼安全的拿出來

hack 2 的重點是讓某個你提供的`protocol`具有已經具現化的可使用型別集合

所以我這裡舉了`Format`作為例子，假設你提供了一個`Format protocol`給你的`Logger`函式庫，`Format protocol`要求使用者實作`format`方法，那麼提供一些實作給常用的型別讓人瞻仰你的厲害，不是啦！是讓別人能夠享受某些成果，那麼這個程式庫方能永恆啊！
