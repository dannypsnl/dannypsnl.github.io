---
title: "delimited/undelimited continuation"
date: "Sat Mar 13 13:50:55 UTC 2021"
categories:
  - cs
tags:
  - racket
  - continuation
  - delimited continuation
  - undelimited continuation
---

Continuation is the **future** of the program, for example

```racket
(+ 3 2
  (* 5
     (+ 6 1)
     8))
```

What is the continuation of `(+ 6 1)`? We can get the result by replacing `(+ 6 1)` with a hole:

```racket
(+ 3 2
  (* 5
     ?hole
     8))
```

By encoding continuation with the lambda, continuation of `(+ 6 1)` is:

```racket
(lambda (x)
  (+ 3 2
    (* 5
       x
       8)))
```

We can check it by `let/cc`

```racket
(+ 3 2
   (* 5
      (let/cc k
        (k (+ 6 1)))
      8))
```

`k` is the continuation, original result is `285`, you may guess new result will be `11405` since `(+ 3 2 (* 5 285 8))`
is `11405`. But, actually the new result is still `285`, because I do not tell all the true. Continuation is not

```racket
(lambda (x)
  (+ 3 2
    (* 5
       x
       8)))
```

but

```racket
(lambda (x)
  (exit
   (+ 3 2
    (* 5
       x
       8))))
```

This is because end the program also was the **future** of program. Thus, we have `(+ 3 2 (* 5 (exit 285) 8))` that is `285`, not `(+ 3 2 (* 5 285 8)) = 11405`. We call such continuation: undelimited continuation.

### Delimited continuation

So what is delimited continuation? By default, abort locates at the most out scope, delimited continuation means we can assign others location. To do so, we need some helper(the following code cannot work in racket, but just pseudo code):

```racket
(+ 3 2
  (abort-here
    (* 5 x 8)))
```

Then the continuation would be:

```racket
(lambda (x)
  (exit
    (* 5 x 8)))
```

### Conclusion

That's it, continuation can be parted to delimited and undelimited, now you know that :).
