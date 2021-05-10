---
title: "Make googletest-like test framework from scratch"
categories:
  - cs
tags:
  - metaprogramming
  - cpp
---

Back to 2016, I learned [googletest](https://github.com/google/googletest) how improving my C++ project. From that, I always want to know how it.

Let's take a look at some basic example of it.

```cpp
TEST(Arithmetic, Integer) {
  ASSERT_EQ(1 + 2, 3);
}
```

I think that's pretty easy to understanding for anyone ever wrote a unit test.

In the googletest context, you would get a lot of `TEST` there like:

```cpp
TEST(Suit1, test1) {
  // ...
}
TEST(Suit1, test2) {
  // ...
}

TEST(Suit2, test1) {
  // ...
}
TEST(Suit2, test2) {
  // ...
}
```

Back to our article, think about it, why the compiler does not complain `TEST` be redefined so many times, and never specify the type of parameters(and the return type)?

Answer: Because that is not a function.

Then the question became: what it that?

The answer is clear, it's a C macro! Only the macro can behave like a function call format `TEST(Suit, Test)`.

As everyone knows, C macro just expands codes inside of it. So the question changed again and now it's: What kind of codes can be valid after expanded with a code block at the global level?

The answer to this also it easy: a function(or a method implementation because we're using C++).

After so many words, let's start coding! Create a file `unittest.hpp`, code:

```cpp
#ifndef UNITTEST
#define UNITTEST

#define TEST(suit, test)

#endif
```

So we can have a `main.cpp` with code:

```
#include "./unittest.hpp"

TEST(Arithmetic, Integer)
```

Then compile: `g++ main.cpp`, this should fine now.

Then we add a code block:

```
TEST(Arithmetic, Integer) {}
```

Oops!

```
$ g++ main.cpp
main.cpp:3:27: error: expected unqualified-id
TEST(Arithmetic, Integer) {}
                          ^
1 error generated.
```

Let's fix it. In your `unittest.hpp`, typed:

```
#define TEST(suit, test) void foo()
```

This time, compiler very happy without any complains. So we have to go to the next step: How to executing these tests automatically?

To do that, we must have a place that stores(or reference to) our tests. So we create a global variable.

```cpp
#include <functional> // for std::function
#include <vector> // for std::vector

std::vector<std::function<void()>> all_test;
```

And add an insertion call in macro `TEST`:

```cpp
#define TEST(suit, test)                                                       \
  void foo();                                                                  \
  all_test.push_back(foo);                                                     \
  void foo()
```

```
$ g++ -std=c++11 main.cpp
main.cpp:3:1: error: unknown type name 'all_test'
TEST(Arithmetic, Integer) {}
^
././unittest.hpp:11:3: note: expanded from macro 'TEST'
  all_test.push_back(foo);                                                     \
  ^
main.cpp:3:1: error: cannot use dot operator on a type
././unittest.hpp:11:11: note: expanded from macro 'TEST'
  all_test.push_back(foo);                                                     \
          ^
2 errors generated.
```

But it won't work, let's see what happened here. The error message is about compiler expects there is a type `all_test` but didn't, then it complains a type name can't contain `.`.

To bypass the error and get expected insertion call we need some interesting trick. It's all about C++ constructor promised to be called while the structure is created.

```cpp
struct unittest_insert {
  unittest_insert(std::function<void()> &&f);
};

unittest_insert::unittest_insert(std::function<void()> &&f) {
  all_test.push_back(f);
}

#define TEST(suit, test)                                                       \
  void foo();                                                                  \
  unittest_insert ut{foo};                                                     \
  void foo()
```

Now, let's add some print statement into our test and implements run all tests to prove what have we done is workable. The content of `main.cpp`:

```cpp
#include <iostream>

#include "./unittest.hpp"

TEST(Arithmetic, Integer) {
  std::cout << "test "
            << "test" << std::endl;
}

int main() {
  run_all_tests();
  return 0;
}
```

Implementation of `run_all_tests`:

```cpp
void run_all_tests() {
  for (auto test : all_test) {
    test();
  }
}
```

Now we knew how to run tests. We need to know how to determine a fail.
That's why we need assertion macros. Here is an example of testing:

```cpp
TEST(Arithmetic, Integer) { ASSERT_EQ(1, 1); }
```

Then see how `ASSERT_EQ` be made.

```cpp
#define ASSERT_EQ(le, re)                                                      \
  if (le != re) {                                                              \
    throw "assert equal failed";                                               \
  }
```

`g++ -std=c++11 main.cpp` and run, where interesting thing is what if you write `ASSERT_EQ(1, 2)` that you would get a runtime error says:

```
libc++abi.dylib: terminating with uncaught exception of type char const*
[1]    35777 abort      ./a.out
```

But before going to improving our error reporting, we should think about a problem: Can we create the second one test? The answer is **NO**.

You can have a try then get a list of redefinition errors from the compiler. To solve the problem we need to get some help from the macro.

```cpp
#define TEST(suit, test)                                                       \
  void utf_suit##test();                                                       \
  unittest_insert ut_suit##test{utf_suit##test};                               \
  void utf_suit##test()
```

`##`, the magic from the macro, you can get more helps from [https://stackoverflow.com/questions/4364971/and-in-macros](https://stackoverflow.com/questions/4364971/and-in-macros)

Now, we won't get the error from expanding the macro twice. And could get a chance to stop and think about the error reporting design.

At now, we just `throw` a `char const *`, and we didn't catch the exception, so we would receive a `terminating with uncaught exception` error. That caused two problems:

- The test won't keep going caused users won't know how many tests failed actually.
- And users don't know what exception been throw actually.

To solve the problem, what the thing we should do is catch the exception, report and keep going on. Here is the code:

```cpp
#include <exception>

void run_all_tests() {
  for (auto test : all_test) {
    try {
      test();
      std::cout << "test pass" << std::endl;
    } catch (char const *e) {
      std::cerr << e << std::endl;
    } catch (std::exception &e) {
      std::cerr << e.what() << std::endl;
    } catch (...) {
      std::cerr << "test failed: unknown exception" << std::endl;
    }
  }
}
```

Now it would report test passed or not, it looks nice as a proof of concept.

Now counting what do we learn from these?

- How to generate a function from the macro
- How to handle the exception

And here have some exercises you can do.

- improve the error reporting, not just say assertion failed, also show the expression why isn't equal(hint: custom exception)
- how to avoid user access the generated function?(hint: try generating class)
- can we report the coverage? (hint: `llvm-cov` or similar things)
- what if the input expression is not comparable?
