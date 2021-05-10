---
title: "Type driven development in C++"
categories:
  - cs
tags:
  - cpp
---

Let's start from some code. And seems will be only code in this article.

```cpp
// Compile: clang++ main.cc
#include <iostream>

template <int x, int y> class Matrix {
  // We don't care how to implement at here
public:
  std::string print() { return std::string("Matrix"); }
};

template <int x, int y> Matrix<x, y> Add(Matrix<x, y> a, Matrix<x, y> b) {
  return a; // Just help compile can run it.
}

int main() {
  std::cout << Add(Matrix<2, 2>(), Matrix<2, 2>()).print() << std::endl;
  // This line never pass, interesting part.
  std::cout << Add(Matrix<3, 2>(), Matrix<2, 3>()).print() << std::endl;
}
```

Ok, some code be there, why I want to talk about these code?
Few weeks ago, I study `Idris` and it's core concept: Type-Driven-Development.
But what is TDD(T is Not test at here)?

Matrix can show this concept clearly. Because we need some meta to make sure we are adding correctness Matrix together.
We don't want something like `[0 0] + [1 0 3]` can work, because Matrix can't be that.
So what will we do at first? Every programmer will check it(I thought, hope I am correct). And most of them will check it at: runtime. But runtime checking is danger. If I could, I always trying compile-time checking, because the chance that can be find out by editor is very big, almost 100%. But how to do that?

In C++, template help we checking at compile-time.
And almost no other language can template integer as template parameter. In Java, we have generic only. And a lot language only have generic too.
But maybe some people can't understand `Idris`, so let's use `C++`.

The point is: when we need Matrix add. Only those Matrix with correct X, Y can add together.
With template check, second Add always can't pass compile.
Hope you already got the point of TDD.
That is define type for certain usage, you can get the help from Type System.
It can limit error into a narrow part.
Thanks for read.
