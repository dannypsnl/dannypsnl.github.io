---
title: 繼承的問題
tags:
  - cs
  - oop
---

繼承的問題就在如果 `B : A` 且 `B` 實體被指定給 `A` 變數的時候，應該要發生什麼？有些實作會要求方法只不過是跟實體的通訊，所以要用 `B` 宣告的內容回應。有些實作如 C++ 就會選 `A` 的方法

```cpp
class I
{
public:
  virtual ~I() {}
  virtual void invoke() = 0;
};

class A : public I
{
public:
  A() : XXX{10} {}
  virtual int getXXX() { return this->XXX; }
  void invoke() override { cout << "A " << this->getXXX() << endl; }

private:
  int XXX;
};
class B : public A
{
public:
  B() : XXX{20} {}
  int getXXX() override { return this->XXX; }
  void invoke() override { cout << "B " << this->getXXX() << endl; }

private:
  int XXX;
};

int main()
{
  B b{};
  A a = b;
  a.invoke();
  cout << a.getXXX() << endl;
  cout << b.getXXX() << endl;
}
```

只有在其中一方是純粹的 interface 的時候這是明確的，否則沒有合適的選項。
