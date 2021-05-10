---
title: "Reflection on Working effectively with legacy code --- chapter 11 to 19"
categories:
  - cs
tags:
  - programming
  - testing
---

At [ch6-10](/blog/2019/12/07/cs/reflection-on-working-effectively-with-legacy-code-ch-6-10/) we know why adding test is so hard, and how to get over it. As usual, we overview what is going to be mentioned in this article:

- Chapter 11: I Need to Make a Change. What Methods Should I Test?
- Chapter 12: I Need to Make Many Changes in One Area. Do I Have to Break Dependencies for All the Classes Involved?
- Chapter 13: I Need to Make a Change, but I Don’t Know What Tests to Write
- Chapter 14: Dependencies on Libraries Are Killing Me
- Chapter 15: My Application Is All API Calls
- Chapter 16: I Don’t Understand the Code Well Enough to Change It
- Chapter 17: My Application Has No Structure
- Chapter 18: My Test Code Is in the Way
- Chapter 19: My Project Is Not Object Oriented. How Do I Make Safe - Changes?

### Chapter 11: I Need to Make a Change. What Methods Should I Test?

We have a simple answer: Test all!

Well, this won't work. We know this won't work, and know why: Those code without test show the reason. So not kidding, which part should be tested first is a thing. To solve this problem, we need to find out the data would be affected and know how to watch them, once we know these we can start implements our test, something a little bit shit thing was inherit would make the situation more complicated than we saw. And some features like concurrency can make this more annoying, yes, I'm talking to you, Go. A common problem was we return a channel to make it more flexible and can combine with other channels, but this also means to trace the data flow would also need to track the value of the channel. Better use `const` as possible, so later everyone can stop guessing the variable would be changed or not. Here the author also gives an example that C++ can use the keyword `mutable` to break `const` semantic which is a bad idea in language design, so remember the real world always sucks.

Good software would help us no need to guess some impossible paths and focus on our target, so try to make the program had rules that can be followed, whatever it's implicit or explicit. When tracking the codebase we would draw some effect graph, try to make it simpler, this usually makes program easier to understand.

### Chapter 12: I Need to Make Many Changes in One Area. Do I Have to Break Dependencies for All the Classes Involved?

The answer is simple, you have no time, so first test the outer part, with time pass we would find codebase was getting easier to test, then we add unit test into it. Just remember don't make it became integration test.

### Chapter 13: I Need to Make a Change, but I Don’t Know What Tests to Write

Write characterization test(I called it feature test), the idea was: feature earn money, we pretty sure we need money, so we pretty sure we have to keep those features.

Use the fuzzy tester to make function broke, this is so useful and feels good. Write tests to fail the code. Find out invariant and verify it.

Ensure the test covers the part we modify, and get away from the language those do implicit type convert(at least should add linter or semantic checker can point out these problems), else, for example, we might use `int` type to get a `double` value, and didn't know why the result was so wrong.

### Chapter 14: Dependencies on Libraries Are Killing Me

Don't rely on libraries! No, I'm not saying don't use them, but don't depend on it! A library would change interface anyway, if not today then would be tomorrow, even standard library of a language wasn't stable actually, see this: [https://github.com/golang-migrate/migrate/issues/264](https://github.com/golang-migrate/migrate/issues/264). So? So we should wrap the library in part of our project concept, then even the library did break changes, we won't get a huge impact because it was isolated in a small part.

### Chapter 15: My Application Is All API Calls

Well, read chapter 14 again?

### Chapter 16: I Don’t Understand the Code Well Enough to Change It

1. Draw some sketches
2. Markup program by responsibility
3. Extract out functions
4. See what happened after your changes
5. Do some refactoring(don't commit them, just try to know how to modify this codebase)
6. Remove unused code(you know what, Git is the reason we can remove the code and don't afraid we forgot them)

### Chapter 17: My Application Has No Structure

Try to explain the system to each other, the software would get more complex with time, so the thing we can do was keep taking care of our program and understand it. When we are trying to explain a thing, we would enforce ourselves to restructure the thing, make it more accurate and more simple. Don't afraid of changing design, we should follow the truth, not follow the outdated design.

### Chapter 18: My Test Code Is in the Way

This would be a super annoying thing for Java or C/C++ since we have to manually maintain build script to exclude testing code. Keep good naming rules would make this situation better.

### Chapter 19: My Project Is Not Object Oriented. How Do I Make Safe - Changes?

I would say the problem was multi-dispatching, not non-OOP, we obviously know how to test type class in Haskell. So the problem was only in a few procedural languages(count by those we are using) like **C**, **Fortran** or **COBOL**. We cannot override function very easy(still can, like using **C** macro or some pointer trick), better add test first since refactoring procedural program was not as easy as other high-level abstraction(so sure, procedural programming in **Java** won't better than any **C** program). And I have no idea about why the author thinking everything was OOP, totally as useless as saying everything was a Turing machine. But, sure, different programming paradigms can use in any programming language, we can do FP, OOP in **C** as we like.
