---
title: "A wrong question: Is a Square a Rectangle?"
date: "Mon Nov 16 17:52:00 CST 2020"
categories:
  - cs
tags:
  - plt
  - java
  - liskov
---

Overview

1. what is Subtyping?
2. what is Liskov Substitution Principle?
3. what's the problem?
4. how to solve this mistake of type system

### What is Subtyping?

A common misunderstanding is OOP must have **subtyping** and **generic** at the same time, but they are independent features, **generic** is just a type-level function with takes a type, generates a type. **Subtyping** is a relationship between type, when we say `A <: B`, which means `A` is a subtype of `B`. In Java, we use concrete syntax `extends` or `implements`.

### What is Liskov Substitution Principle(LSP)?

**LSP** said

> if S is a subtype of T, then objects of type T in a program may be replaced with objects of type S without altering the program

### What's the problem

Square is a special Rectangle where all four sides are equal in length. Thus we might write down:

```java
public class Rectangle {
    double x, y;
    Rectangle(double initX, double initY) { x = initX; y = initY; }

    public void setX(double x) { this.x = x; }
    public void setY(double y) { this.y = y; }
}

class Square extends Rectangle {
    Square(double initX, double initY) throws SquareException {
        super(initX, initY);
        if (initX != initY) {
            throw new SquareException(initX, initY);
        }
    }
}
```

Ok, so we can have following program:

```java
Square s = new Square(2, 2);
Rectangle r = s;
r.setX(10);
```

Oops, `s` is not a square anymore, this correctly follows **LSP** but incorrect generally.

### Solution

Here is a solution: refinement type. By using refinement type, we can claim `type Square = Rectangle when (x = y)`. Then problem solved, when programming if we can't proof `x = y` this predicate then compiler won't think that is a `Square` but a `Rectangle`. Since `Square` is a `Rectangle`, method in `Rectangle` still can be using by `Square`, thus we didn't lose our power. However, program like `s.setX(v)`, would need to prove `v = y`, to prove it is a `Square`. Here we have two choices:

1. change `s` type to `Rectangle`, the problem of this solution is if we write `r = s; r.setX(v)`, compiler might not work for this(this is also why I'm designing [controllable-refinement](https://github.com/dannypsnl/controllable-refinement)), mutable semantic always needs more effort.
2. throw compile error that `Square` constraint was broke by the statement.

Choose one and work with it, that's all, have a nice day.
