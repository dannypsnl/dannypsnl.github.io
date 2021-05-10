---
title: "Reflection on Working effectively with legacy code --- chapter 20 to 23"
categories:
  - cs
tags:
  - programming
  - testing
---

- Chapter 20: This Class Is Too Big and I Don’t Want It to Get Any Bigger
- Chapter 21: I’m Changing the Same Code All Over the Place
- Chapter 22: I Need to Change a Monster Method and I Can’t Write Tests for It
- Chapter 23: How Do I Know That I’m Not Breaking Anything?

### Chapter 20: This Class Is Too Big and I Don’t Want It to Get Any Bigger

Everyone knows we have to break down the big class(or we sometimes called them: God-class) into the smaller component. But how to do was the problem. The author pointed out an important fact that encapsulation is useful, but only when we do it correctly! Hiding a not related concept into a component won't be a good encapsulation. So the way already clear, we should break down a God-class by responsibility, SRP is the key point. We would extract out the new component by SRP, but a trap here was Facade-class was not a class anti-SRP.

A few steps could be followed:

- Grouping methods: Grouping them by responsibility
- Private methods: Too many private helpers could be a signal to extract a new class.
- Find out some hard-code part: Can we make them more flexible?
- Try using one sentence to describe the responsibility of the class: If we cannot, why?

These processes won't be done at once, but we still can see the program was getting better.

### Chapter 21: I’m Changing the Same Code All Over the Place

Extract out the duplicate part as a new function, the order was not really important, we should decide it by case. The only trap was interface API, sometimes we really want to rewrite the interface API, I would say it depends on the situation, for internal API change it would be fine, but when we exported it then it would affect users so need more consideration.

### Chapter 22: I Need to Change a Monster Method and I Can’t Write Tests for It

As a God-class, God-method also needed to break down. But this one is even annoying because local variables and indent make it harder to read and maintain. The only way was refactoring it more carefully. But noticed the NASA-style long function was not a kind of bad function, it's created for making the same level abstraction stay at the same place which is reasonable.

### Chapter 23: How Do I Know That I’m Not Breaking Anything?

This chapter was some suggestions for working.

1. Do one thing at once
2. Keep the signature of function when copying it
3. Rely on complier, but remember there are few ways can foolish the compiler, e.g. In inherited-class remove an override function might still be compiled but not working correctly anymore

### The end

Chapter 24 are trying to tell us the codebase would get better, well, I don't know, probably was time to change a job? :)

Chapter 25 are the collection of the dependency-breaking techniques so just ignore them at here.

With this reflection, I understand more about how to keep improving the codebase rather than drop them into the trash. Realize life is not perfect but we still have to move forward.
