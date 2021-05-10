---
title: "C++ thread 基礎"
date: 2017-06-26
categories:
  - cs
tags:
  - cpp
  - thread
---

使用標準庫的 thread 非常容易

```cpp
#include <thread>
#include <iostream>

using std::cout;

void hello() {
    cout << "hello" << '\n';
}

int main()
{
    std::thread t(hello);
    t.join();
}
```

1.引入`thread`標頭檔

2.宣告函式

3.建構一個`thread`物件

4.用`join`讓`main`等待它完成

很好，程式應該會運作，可是我們想要知道如何傳入參數，對吧!

```cpp
void hello(int i) {
    cout << "hello, " << i << '\n';
}
```

所以函數的宣告式自然要改

但是我們不能直接寫

```cpp
std::thread t(hello(2));
```

因為這不會傳入函數，而是傳函數的結果，那不是我們需要的東西

正確的寫法是

```cpp
std::thread t(hello, 2);
```

可以輕鬆的從這個實作(Mingw 版本)中看出參數怎麼傳進去的

```cpp
template<class Function, class... Args>
explicit thread(Function&& f, Args&&... args)
{
    typedef decltype(std::bind(f, args...)) Call;
    Call* call = new Call(std::bind(f, args...));
    mHandle = (HANDLE)_beginthreadex(NULL, 0, threadfunc<Call>,
        (LPVOID)call, 0, (unsigned*)&(mThreadId.mId));
    if (mHandle == _STD_THREAD_INVALID_HANDLE)
    {
        int errnum = errno;
        delete call;
        throw std::system_error(errnum, std::generic_category());
    }
}
```

事實上，我們不只能傳入函數給 Thread，我們可以傳任何可呼叫(callable)物件進去

用法非常簡單，就是定義一個具有 operator()的 class，然後用這個 class 產生物件

```cpp
class Ya {
public:
    void operator()() const {
        cout << "Ya" << '\n';
    }
};
```

就像這樣

```cpp
std::thread t( Ya() );
```

我們用原本的寫法，卻發現編譯失敗，原來是因為這個寫法被編譯器當作函式宣告，而不是一個物件定義

好吧!怎麼處理?

第一種作法:加上括號

```cpp
std::thread t( (Ya()) );
```

第二種作法:用大括號初始運算子

```cpp
std::thread t{ Ya() };
```

第二種作法自然必較好，因為符合新的標準(用大括號是官方推薦寫法)，而且很直觀

第一種作法則讓人難以理解為什麼這樣就可以

再介紹一種作法

```cpp
std::thread t3([] {
    cout << "lambda" << '\n';
});
```

利用`lambda`運算式，不過就算是用`lambda`我也認為應該用大括號運算子，畢竟，沒什麼道理不用擺明用來初始化的大括號(我是說，除了那個該死的`auto array`狀況，還有字串字面值是`const char *`)

那麼`join`呢?

`thread`物件一旦建立，啟動執行緒，你就要明確的決定要

1.等待執行緒結束(`join`)

2.讓它自己旁邊玩沙(`deatch`)

如果沒有在 thread 物件被清除之前決定，那程式就會終止

因為

```cpp
~thread()
{
    if (joinable())
        std::terminate();
}
```

解構子會呼叫`std::terminate()`讓程式掛掉(如果沒有改變可連結狀態)

```cpp
bool joinable() const {return mHandle != _STD_THREAD_INVALID_HANDLE;}
```

這是`joinable`的實作，因為名稱取的很好，所以可以看出只要 thread 狀態沒有被合法的處理(上面兩個狀況，`join`與`detach`)，就會回傳`true`，在適當的時候引發`terminate`

所以即使發生例外，也要確保執行緒成功被決定要怎樣處理

從這裡應該很容易看出來，`thread`物件可不是`thread`本身，而是持有者，所以千萬不要搞混它們的意義

要讓程式掛掉真的很容易

```cpp
std::thread t( hello, i );
```

不決定的結果就是程式`panic`

例外!!!

沒錯，什麼程式遇不到例外，執行緒程式也不例外，前面我們提到，如果沒有決定如何處理`thread`物件，程式就會掛掉

很好，那麼遇到例外時怎麼辦?

第一種辦法很土，不過反正能解決問題就是了

```cpp
std::thread t(hello);
try {
    // ...
} catch (int err) {
    t.join();
}
t.join();
```

看，就是寫兩次而已，這真的很糟糕

因為我們很可能會忘記寫某一個`join`，然後沒看到，或是當下看不出來，最後 trace bug 還看到`terminate`然後想----我為什麼會呼叫 terminate?恩，因為你沒有呼叫，最後憤怒的找到 thread 函式庫

第二種辦法是 RAII

```cpp
class Thread_guard {
    std::thread t;
public:
    explicit Thread_guard(std::thread& t_)
        : t{t_}
    {}
    ~Thread_guard() {
        if (t.joinable()) { t.join(); }
    }
}
```

現在我們把`thread`放進去就好了，值得一提的是，這種物件最好移除複製建構子和複製指派運算子

```cpp
Thread_guard(Thread_guard const&) = delete;
Thread_guard& operator=(Thread_guard const&) = delete;
```

因為兩種操作對這個物件而言都異常危險，我們將無法預測會發生什麼事

宣告為 delete 之後，試圖做上述操作都會直接被編譯器擋下

用法非常明確

```cpp
std::thread t{func}
Thread_guard tg{t}

// do something ...
```

這樣一來，只要離開資源，tg 的解構式被啟動，就會決定怎麼處理 thread 物件(這仰賴 c++對解構的保證)

最後，注意`cout`其實不能那樣用，你可以試試使用迴圈讓執行緒印更多東西，然後你會發現文字會不按順序的亂印，這是正常的，因為它們交錯的使用`cout`，而沒有一個資源管理的方式

最簡單的方式就是上鎖，當然也有對這類行為不太介意的程式，例如共享的資源是唯讀的
