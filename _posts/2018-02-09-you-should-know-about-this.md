---
layout: post
title: "You should know about `this`"
categories: javascript
tags:
  - javascript
---

`this` scope rule is one of hardest problem in JS. Let's start it.

```js
function print() {
  console.log(this.data)
}
let obj = {
  data: "This is obj",
  print
}
obj.print() // Output: This is obj
// It's good. But if we send print to other place?

let printClone = obj.print;
printClone(); // Which `this` at here? You have to see `this` of this place then you will know
// Ok, let me tell you true, you don't know where does the function be send, so you also can't know which this at there.
// The behavior is totally can not be prediction.
```

Ok! Now we know the true: `this` is dynamic. But! We still need to send us function to other place, right? We have to understanding print get the this at `obj.print()` this expression, not at `let obj = { ... }` part. Why this is important? Because a lots of novice of JS will write something like this.

```js
// ignore, we are in obj definition
print: print.bind(this),
// ignore
```

`bind` is the next thing we will discuss, the point is the this of `= { ... }`, whatever is type in, there is only `{}`,
a null object at there! So you will get a null object out of your expected. What does bind do? Let me show it for you.

```js
let printClone = print.bind(obj) // Or obj.print, understanding a truth: function has no relation with any object before we bind(and some other operation) it.
printClone() // `this` at here is `obj`
// Output: This is obj
```

`bind` return a new function, combine by a function with a object, use object to be new function's `this`.

But we of course want to define function with it's user. How to do that?

```js
function NewCar() {
  let self = {
    name: 'Tasla',
    price: 100000
  }
  return {
    print() { console.log(self) },
  }
}
let car = NewCar()
car.print() // Output: { name: "Tasla", price: 100000 }
let printClone = car.print
printClone() // Output: { name: "Tasla", price: 100000 }
```

Very interesting, right? Because we use closure at here. We reference the `self` in `NewCar`.
The most important part came, every time you call `NewCar` for a new object. The `self` is different.
This is the one of the greatest trick in ES3/5, seems this rule is so complex, why don't use closure to avoid it.
In ES3/5, this trick is good enough.

In ES6, we have `class`, but what does it real mean?

```javascript
function Car() {
  this.name = "Tasla"
  this.price = 100000
  this.dump = function() {
    console.log(this)
  }
}
var car = new Car()
car.dump()
var clone = car.dump
clone() // Of course, error
```

`Car` call constructor in ES5, because we can use `new` ask JS `this` reference to the object we create.<br>
But as you see, the function inside still have dynamic `this`.<br>
Don't worry about that, because what I want to say is keyword `class` work as same as constructor!<br>
How we fix it in ES5?

```javascript
function Car() {
  // ... ignore
  this.dump = function() {
    console.log(this)
  }.bind(this)
}
```

Which trick we use at here? First, if we use keyword `new`, `this` is the object we created.<br>
So we `bind` target really is that one we expected & wanted!<br>
But this way had some problem, the most important part is hiding ability.<br>
In previous solution, we can hide the attributes of `object` in `closure`.<br>
And that is the ability we lose at constructor & `class`.<br>

How to implement the pattern by `class`?<br>
We have to understand what is `class` first.<br>

```javascript
class Car {
  constructor() {
    this.name = "Tasla"
    this.price = 100000
    this.dump = this.dump.bind(this)
  }
  dump() {
    console.log(this)
  }
}
```

These code as same as previous solution. So now we know, `class` is just a syntax sugar.<br>
`class` also can not binding correct `this` for you. You must write done `bind` at constructor.<br>
That is too ridicules, if some one forgive to bind the function(point! I still call it function,
JS class still not behavior as method as other language), the program will fall into dark.<br>
So, how to avoid the problem, the answer is arrow function, arrow function still is a function.<br>
But traditional function have a this by execute environment or `bind` one.<br>
Then arrow function have a this at it's declared place!<br>
And we go back to `class`, `class` provide `this` at body part!<br>

```javascript
class Xxx {
  // this at here is instance of Xxx!
}
```

So we can write these:

```javascript
class Car {
  constuctor() {
    this.name = "Tasla"
    this.price = 100000
  }
  dump = () => {
    console.log(this)
  }
}
```

As your expected, dump always `bind` with instance of Car.<br>
!!! `dump = ...` in a class definition is esNext(stage3) standard, you can always use babel plugin `babel-preset-stage-0` to follow latest standard.

### References:

#### [You don't know JS](https://github.com/getify/You-Dont-Know-JS)
- Author: Kyle Simpson
- ISBN: 978-986-476-049-7
