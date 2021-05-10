---
title: "Haskell quick start"
image: ../images/haskell/haskell.png
categories:
  - cs
tags:
  - haskell
  - beginner
  - plt
  - language
---

**Haskell** resource is a little bit outdated and if you take a look at [https://www.haskell.org/documentation/](https://www.haskell.org/documentation/) you would found there are several tutorials, make choose one be a hard thing. So I decide to make a simple quick start to record how I start with **Haskell**.

Before we typing any code, we have to install **Haskell**, please take a look at [https://www.haskell.org/downloads/](https://www.haskell.org/downloads/).

### Binding

Let's start from a hello world example:

```hs
main :: IO ()
main = do
  putStrLn "Hello, World!"
```

We call it `helloworld.hs`, now run `runhaskell helloworld.hs`, should get: `Hello, World!` as an output on the screen.

We can find `main` appears twice. We call the first one as type binding, the second one as binding. Type binding shows the type of `main`, binding shows what would `main` do. At here `IO` is a kind of special type, its called **Monad**, and we are not going to explain it but can see that the body of `main` has a notation `do`, under `do` notation would be a special syntax that helps us create a DSL for certain domain, here is `IO`.

Keep going we add read into our program:

```hs
import           System.IO

main :: IO ()
main = do
  who <- getLine
  putStrLn ("Hello, " ++ who)
```

`getLine` would read the text you typed until a newline in as a string. Here we see a new symbol `<-`, it might weird at the beginning that it means `=` in `do` notation(we actually can use `let who =` replace `<-`). What `<-` do is make a `Monad a` be `a`. Then we can use it at the next function. `("Hello, " ++ who)` is required, since **Haskell** doesn't use `function_name(parameter*)` this form, distinguish the argument belongs to which function call can be quite complex even undecidable and to make our brain work easier better add `()` for all function call, and tend to use temporary variables for the argument to explain code better.

Now, you probably already found **Haskell** does not use `{}` for block body. In **Haskell**, indent has meaning. For example:

```hs
import           System.Environment
import           System.IO

main :: IO ()
main = do
  args <- getArgs
  case args of
    [] -> putStrLn "no arg"
    [one] -> putStrLn "one arg"
    rest ->
      case rest of
        [one, two] -> putStrLn "two args"
        _          -> putStrLn "many args"
```

We use `getArgs` from `System.Environment` and **case of** syntax. Can see how indent makes the **case** syntax became different blocks. Of course, I would say better do not have too many indents, its quite easy to confuse yourself.

p.s. I didn't explain list patterns in matching, I hope the output is clean enough to understand those list patterns.

Now let's back to type binding and binding, so why we have to write them twice? In fact, we can ignore type binding:

```hs
main = do
  putStrLn "Hello, World!"
```

I really don't like this idea, at the beginning it sounds like a good idea: Let compiler inferences and tells us what is the type of binding. This is a trap when the compiler does inference, it has to rely on the using case to guess the type of binding. We have a trivial example:

```hs
id x = x
```

When we do function call by `id 1`, `x` might be `Int`, when we call it by `id "wow"`, `x` might be `String`. Now imagine a bigger function and the type of it was always changing since we didn't give it a type, can anyone work with it quite happy? I don't think so. So make sure you give it a good type. In fact, the semantic checker would warn those global level binding which didn't with type binding. Well, we can't ignore any type of bindings? I think that's ok in `where` clause. In **Haskell** `where` clause can put some helpers which we don't want other functions to use it.

```hs
foo = bar
  where
    bar = 1
```

In `where` we can put many private bindings, and since they are usually short and easy to understand, without type binding might be ok, but if you found without type binding they would be hard to understand, then please still give it a type.

### Type

Now, we need to define some new types. In **Haskell**, we usually use `data` keyword to create a new type. `data` syntax is quite complex, we can take a look at few examples to understand it.

The first example creates a `Bool`

```hs
data Bool = True | False
```

To use it: `False`, `True`. We call `True` and `False` as constructors of `Bool`. You can see that `|` separate different constructors. This is called **algebra data type**. In fact, constructors can with arguments.

```hs
data Position = MakePosition Double Double
```

We can use like: `MakePosition 1.0 0.0`

When we do pattern matching on the type made by `data`, we can use their constructors:

```hs
case bool of
  True -> -- ...
  False -> -- ...
-- or
case pos of
  MakePosition x y -> -- ...
```

p.s. `--` is the comment in **Haskell**

Well, `MakePosition` makes a new question: Can we use `pos` in the branch of `MakePosition`? Yes, by `@` pattern, we can get the constructors:

```hs
case pos of
  p1@MakePosition x y -> -- ...
```

It seems useless because `pos` is `p1` in case. But it's very helpful when `Position` has several constructors. A nice thing is **Haskell** would do **exhaustiveness checking** to make sure all variants of constructors were covered by your pattern matching.

Keep move forward, sometimes we would like to create a type and some operations that can be reused by different type-arguments. It called type parameters. You probably already found that in **Haskell** all of the types were started with upper case. That's because the start of the lower case was reserved for the type parameter.

The first example is `Maybe`:

```hs
data Maybe a =
  Just a
  | Nothing
```

What is `Maybe` for? In **Haskell**, we do not have the bottom type. What's the bottom type? In **Java**, every object can be `null`, `null` can be seen as a value of bottom type. The bottom type represents a subtype of any type, so its value can be the value of any type. Of course, `null` in **Java** is not so correctly means a bottom type since the primitive type work under another system, but it's good enough to make we keep going.

So we actually need a type to represent `nothing`, that is `Maybe`, `Maybe` has two constructors, for has value: `Just a` and no value: `Nothing`. But doing operations on `Maybe` is annoying, if without `Control.Applicative`. We can see how it work with `Applicative`:

```hs
import Control.Applicative

(+) <$> Just 2 <*> Just 3
-- Just 5
(*) <$> Just 2 <*> Just 3
-- Just 6
(+) <$> Just 2 <*> Nothing
-- Nothing
```

You can understand `Applicative` like this: `+` takes two parameters, `<$>` means we start to give it arguments, use `<*>` join more arguments if there is more than one argument.

There has a structure-like syntax for constructors:

```hs
data Position = MakePosition {
  getX :: Double
  , getY :: Double
  }
```

An unfortunate problem is `getX` and `getY` is not in the global environment, so if now we add:

```hs
data Wow = MakeWow {
  getX :: Double
  , getY :: Double
  }
```

The compiler would complain about there are redefined symbols.

### Conclusion

I hope you already learn a little thing that enough to start programming with **Haskell**. There still have many features were not mentioned in the article. Originally as [golang quick start](/blog/2018/09/23/cs/golang-quick-start/), I want to show all major features in **Haskell**, but it probably would be really hard. Explain **Monad** might need an alone article. And **high-order function** and **Kind** also quite not suitable in an article prepared for **beginner**. Understand `fold`, `map` and **recursive** also be out of the topic of the article, so I would write the others for them. Thanks for the read.
