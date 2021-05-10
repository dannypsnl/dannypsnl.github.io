---
title: "Reflection on Working effectively with legacy code --- Part I"
categories:
  - cs
tags:
  - programming
  - testing
---

Preface author defines: what is legacy code? The code which lack of tests.

Keep going on, at chapter 1 author compares reasons we update the code.

1. New Feature
2. Fix Bug
3. Refactor
4. Optimize

|                | Feature | Bug | Refactor | Optimize |
| -------------- | ------- | --- | -------- | -------- |
| structure      | O       | O   | O        |          |
| new feature    | O       |     |          |          |
| old feature    |         | O   |          |          |
| resource usage |         |     |          | O        |

And when changing code, most of the features are we don't want to change.

![](../src/images/working-effectively-with-legacy-code/figure1.png)

Question: How can we sure features are working as usual?

Chapter 2 answers the question: Working with the response, the idea was to use tests as software vise.

And not just has responses, we want them to reply as soon as possible. So unit tests should more than QA tests.

But we would have a problem that legacy code needs a test to ensure safety change, however, add test need to change legacy code.

Chapter 3, we finally start with the technology we need, ideally, we can test any class without code change. That's why that's ideal. We have to change the code. But first is when? The author says there are two reasons:

1. get value: when we can't get the result of the computation
2. separate: when we can't execute some code independently

And here, the author mentions the first technology: fake collaborators.

The example from the book is not quite important, anyway, we mock some components with side effects to remove side effects. We can extend a fake object to a mock object. For example:

```java
Stdout mockStdout = new MockStdout();
mockStdout.setExpectation("println", "hello, world");
TestTarget testTarget = new TestTarget(mockStdout);
testTarget.sayHello();
```

In the test, we says that `println` would be called with argument `"hello, world"`.

Chapter 4: Seam model

Seam: a special point that we can change its behavior without change that code.

For example, a global function was called in a method:

```cpp
class Foo {
  void wow() {
    // ...
    global_function();
    // ...
  }
};
```

We can override it:

```cpp
class Foo {
  virutal void global_function();
};

void Foo::global_function() {
  ::global_function();
}
```

And create a subclass of `Foo` then override `global_function()`

```cpp
class TestFoo : public Foo {
  virutal void global_function() {}
};
```

Now, we disable side effects from `global_function`.

In fact, the author mentions several different ways for the seam, but anyway I think everyone can find out how to do this in the language they are using.

Chapter 5 is for tools

- refactoring tool: IDE is super good for this purpose
- mock object framework
- unit test tool: JUnit, CppUnit ...
- integration test: FIT, Fitnesse ...

Now part one ended, to be honest, most of the thing was I already know, in fact, I suggest people skip this part when reading this book. Because this book published in 2005, a lot of thing was outdated, especially those about tools. And I think most people already know we need to write tests. In fact, I think the problem currently was we don't know how to write a good test. But I can promise that the second part was interesting X).
