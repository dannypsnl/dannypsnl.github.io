---
title: "Reflection on Working effectively with legacy code --- chapter 6 to 10"
categories:
  - cs
tags:
  - programming
  - testing
---

At [part I](/blog/2019/11/24/cs/reflection-on-working-effectively-with-legacy-code-part-one/) we basically understand why we need to test, how to test legacy code and what tools can we use. Chapter 6 to 10 mentions more practicing issues that would face in real jobs.

First, we quickly overview all content:

- Chapter 6: I Don’t Have Much Time and I Have to Change It
- Chapter 7: It Takes Forever to Make a Change
- Chapter 8: How Do I Add a Feature?
- Chapter 9: I Can’t Get This Class into a Test Harness
- Chapter 10: I Can’t Run This Method in a Test Harness

### Chapter 6: I Don’t Have Much Time and I Have to Change It

The author describes a common question about testing, many people thought the time spent on the test might not be needed by the job on hand, because the deadline is coming. In my opinion, people's concern makes sense, just has a problem that they also don't do the test when they got time. I agree that when customers want to see the result immediately send a patch for them is important, this is not about technology, this is a business problem. But "good" testing helps the team in the future when they modify related code, and the best thing is we only have to write them once, they can run many times, that worth it. Ok, back to the situation, we must provide code change in three hours. In this case, the author provides a few tricks that allows us to add a test with quick fix:

1. New method: It's hard to test existed code. But at least we can test those new.
2. New class: When we can't create an instance of the original class in the deadline limit, we can create a new class and use it in the original class, then we can add a test for the new class safety. Here the author also mentions many people can't accept that create a new class just for this purpose, however, we probably can get a new concern for the design and improve the code, which gives us more than just testing.
3. Wrap method: rename your target method; create a new method using the target method's original name; call the target method in a new method and the new feature code we add. For example:

   ```rust
   fn foo(&self) {
       // foo_code
   }
   // refactor to
   fn foo(&self) {
       do_foo();
       new_feature_code();
   }
   fn do_foo(&self) {
       // foo_code
   }
   ```

4. Wrap class: Well, I can't see what's different with the wrap method and this. Just extract in a different way. BTW, you might like to call it decorator if you love design patterns.

### Chapter 7: It Takes Forever to Make a Change

There are many reasons make a lengthy modification:

1. understanding code: The only point at here was if you can't understand your codebase well, reference chapter 16,17
2. lag time: This is caused by bad toolchain. For example, compile spend 30 minutes. No laugh, that happens in many codebases like LLVM, Linux. In fact, the last time I compile the whole LLVM 8.0 takes 4 hours on my laptop. So we actually need an independent script to test certain components.
3. Remove dependency: Some classes have too many dependencies let we can't remove them in an acceptable time. In this case, we better do not try to test all of them at once.
4. Build dependency: Remove the build dependency to improve build time, but I mostly use Go, Rust, I have no idea with this. I think who use Java or C++ would need this.

### Chapter 8: How Do I Add a Feature?

Facing legacy code, one of the most important considerations was the most code didn't have tests. Even worse, we can't simply put the test in. So most teams would fall back to the technologies described in chapter 6. Sure we can use them to add more code into legacy code but that's with danger. First, when using sprouting and wrapping we didn't do explicit change code, so we can't say the design was improved! Repeated code is another danger factor. If new code(with test) and old code have duplicate, and we didn't try to merge them, then the old code would never get tested. Furthermore, we could scare and don't want to touch the legacy code anymore since code didn't become better.

Facing the problem is better than escape. Here the author shows some TDD examples if you don't know what is TDD, take a look at [https://technologyconversations.com/2013/12/20/test-driven-development-tdd-example-walkthrough/](https://technologyconversations.com/2013/12/20/test-driven-development-tdd-example-walkthrough/)

The important thing here was **programming by difference**.

#### programming by difference

In Object-Oriented language, this means **inherit**. Consider a case, we have a class: `ast::Integer`. It has a method: `add`, and now we want to distinguish `int32` and `int64`. We can found that create new interface of function that effect signature would be crazy heavy jobs if we already use `Integer` everywhere. So one way we can try was **inherit**.

```cpp
class Integer {
  Integer add(Integer);
  bool is_int32();
  bool is_int64();
  Integer add(Integer, Integer);
  Integer sub(Integer, Integer);
  Integer mul(Integer, Integer);
  Integer div(Integer, Integer);
};

class Int32 : Integer {
  bool is_int32() { return true; }
  bool is_int64() { return false; }
};
class Int64 : Integer {
  bool is_int32() { return false; }
  bool is_int64() { return true; }
};
```

Now we can mix `int32` and `int64` with the original signature.

In this case **inherit** actually not bad. But at the most time, we shouldn't **inherit** and override a concrete method, in the book also describes how overriding a concrete method became a tragedy. So make sure every time we do that, we are ready to remove them as soon as possible.

### Chapter 9: I Can’t Get This Class into a Test Harness

Well, if create an instance of a class is always easy, then the book would be shorter. Unfortunately, that was not true. We usually face four problems:

1. Cannot create the instance of the class
2. When the test dependent on the class it cannot build
3. The constructor has a side effect
4. The constructor has some important jobs and we want to test them

Create a class instance can be annoying, for example:

```
class Foo(a: A, b: B, c: C)
class A(b: B, g: G)
class B(e: E, f: F)
class C(h: H, j: J, z: Z)
```

To remove these dependencies we have to change a lot of code, and what if we can't remove them? A good idea was we can fake them. So, let's take a look at a simple example:

```go
type ConcreteCNI struct {
  // ...
}
func (c *ConcreteCNI) AddPod(podName string, limit *resource.Limit) error {
  // ...
}

func NewCluster(cni *ConcreteCNI) *Cluster {
  // ...
}
```

If we want to test `Cluster`, that can be hard in current implementation, because we have no chances to use any no side effect `CNI`. So we have to add **seam**, by using `interface` we can insert fake objects as `CNI`.

```go
type CNI interface {
  AddPod(podName string, limit *resource.Limit) error
}

func NewCluster(cni CNI) *Cluster {
  // ...
}

// NewCluster(&ConcreteCNI{})
// NewCluster(&FakeCNI{})
```

Now we can test `Cluster`. And if we found the testing target do not need `*ConcreteCNI`? Actually, we can use `NewCluster(nil)` in the test, just remember to simple or generalize the type used in constructor.

I think examples here do not really need to read all of them. In fact, all of them are doing the same thing:

1. remove dependencies
2. make dependencies generalize
3. remove global dependencies

The key here is including dependencies, this happened in languages like: `C`, `C++`...

If we are lucky guys, the following test should work:

```cpp
#include <TestFramework>
#include "Foo.hpp"

TEST(create, Foo) {
  Foo foo{};
}
```

However, I don't why some people didn't like to include all the headers needed by the library. BUT IT ALWAYS HAPPENED.

And in the end, the author mentions a case that if our interface almost one to one with a concrete class(no include fake for test one) is not a good design. BTW, Kubernetes has that one-to-one design. But that's because of the technology for solving this case isn't there in Go: **inherit**.

Subtyping the original one as the fake object is the technology here.

### Chapter 10: I Can’t Run This Method in a Test Harness

This chapter has no big difference with the previous one. We might face:

1. Accessibility issue, e.g.: private method
2. arguments of methods are hard to construct
3. side effect
4. We might need to test by the object used by functions.

To solve the accessibility issue, first, we should consider is can we test it by some public methods? If we could then it's worth to do that, because a public method is how we use that code in the production codebase. This can help us reduce work, avoiding has to find a way to test with the private method. But sometimes we cannot make a private method became public. Here are two reasons:

1. Clients didn't need it
2. If the client code uses that method, it would against or affect the result of other methods in the class.

For the first one, we can just make it public, if clients won't use it they won't use it.

For the second one, we can extract it from the original class to a new class. Now it became public, and the design was improved. And remember do not try to use something like **reflection** to treat compiler and your eyes. It just hides the problem, not facing it.

Sometimes, we would face the problem made by languages, for example: `sealed class`, `final class`, no generic type. For `sealed` or `final`, the solution is quite a direct, wrapping it, if you have some code use class `sealed class Foo` which does not allow you inherit it. Make a new class:

```scala
class MyFoo {
  val f = new Foo()
}
```

That's all.

And sometimes, we have methods with signature: `(A, B, C): void`, the method returns nothing to us. Unfortunately, mainstream languages nowadays didn't make a feature correct, we should know the difference between **procedure** and **function**. Let's say **procedure** has side effect and **function** doesn't. Then we can test **function** without fear. And the most interesting thing is now we are trying to add an effect system back into languages. But we still can try to follow the rule: returns `void` for side effect function and no side effect in other. Remember safety is the most important when doing these changes.

After we add the tests, we can make the production code better.
