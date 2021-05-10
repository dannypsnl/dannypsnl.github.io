---
title: "NOTE: class member initialization order in C++"
categories:
  - cs
tags:
  - note
  - cpp
  - class member
  - initialization
  - language
---

There are some trap when using **class** in C++. One of them is the initialization order of members. This can be annoying, therefore, I want to record this: **Declare order would affect initialization order for C++ class members**. For example:

```cpp
class Foo {
public:
    int i;
    int j = 1;
    Foo(): i{j} {}
};
```

can lead to an unexpected result, `i` would be `0` if you create a `Foo` instance. From reader view, `j` already initialized with value `1`, however, `j` wasn't initialized yet! It is hard to find out, but we only need a small change to fix it:

```cpp
class Foo {
public:
    int j = 1;
    int i;
    Foo(): i{j} {}
};
```

This is unfortunate but happened. I hope this can help to figure out what happened faster next time XD.

Reference to [cppreference.com](https://en.cppreference.com/w/cpp/language/initializer_list) for more information:

> The order of member initializers in the list is irrelevant: the actual order of initialization is as follows:
>
> 1. If the constructor is for the most-derived class, virtual base classes are initialized in the order in which they appear in depth-first left-to-right traversal of the base class declarations (left-to-right refers to the appearance in base-specifier lists)
> 2. Then, direct base classes are initialized in left-to-right order as they appear in this class's base-specifier list
> 3. Then, non-static data members are initialized in order of declaration in the class definition.
> 4. Finally, the body of the constructor is executed
