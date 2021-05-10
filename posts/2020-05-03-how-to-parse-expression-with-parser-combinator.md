---
title: "How to parse expression with the parser combinator"
categories:
  - cs
tags:
  - compiler
  - parser
  - racket
---

Writing parser is a boring and massive job, therefore, people create many ways like parser generators to reduce costs. One of them called parser combinator, parser combinator solves two problems: 1. didn't massive as the hand-crafted parser, 2. didn't impossible to debug like parser generator. Well, it sounds perfect, doesn't it? A parser combinator is great, but one thing could be a problem: precedence descent parser. Unlike parser generator usually provided builtin supporting for operators' precedence. Parser combinator usually only provided basic support for sequence and selective parsing. You probably already heard about [operator precedence parser](https://en.wikipedia.org/wiki/Operator-precedence_parser), let's first take a look at its pseudo code(provided by Wiki):

```
parse_expression()
    return parse_expression_1(parse_primary(), 0)
parse_expression_1(lhs, min_precedence)
    lookahead := peek next token
    while lookahead is a binary operator whose precedence is >= min_precedence
        op := lookahead
        advance to next token
        rhs := parse_primary ()
        lookahead := peek next token
        while lookahead is a binary operator whose precedence is greater
                 than op's, or a right-associative operator
                 whose precedence is equal to op's
            rhs := parse_expression_1 (rhs, lookahead's precedence)
            lookahead := peek next token
        lhs := the result of applying op with operands lhs and rhs
    return lhs
```

Unfortunately, this is not suitable to port on to a parser based on combinator, because figure out how to introduce state monad into parser monad is a complex job, but that would not be a problem since we have a more intuitive solution which starts from avoiding the left recursion. If you have ever taken a compiler class and it, unfortunately, spend most of the time on parsing, then you may be heard [left recursion](https://en.wikipedia.org/wiki/Left_recursion):

$$
A \rightarrow A \alpha
$$

Where $\alpha$ is any sequence of terminal and non-terminal symbols. For example:

$$
Expression \rightarrow Expression + Term
$$

A naive implementation would loop on `expression()` forever. For example:

```racket
#lang racket

(define (expression)
  (expression)
  ; in Racket, a char `k` express as `#\k`
  (match #\+)
  (term))
```

To solve this problem, first, we break down syntax:

$$
Factor \rightarrow Integer \\
MultipleExpr \rightarrow Factor \; * \; Factor \\
AdditionExpr \rightarrow MultipleExpr \; + \; MultipleExpr
$$

Then we map them to parser combinators:

```racket
#lang racket

(require data/monad data/applicative)
(require megaparsack megaparsack/text)

(define lexeme/p
  ;;; lexeme would take at least one space or do nothing
  (do (or/p (many+/p space/p) void/p)
    (pure (λ () 'lexeme))))

(define (op/p op-list)
  (or/p (one-of/p op-list)
        void/p))
(define factor/p
  (do [expr <- integer/p]
    (lexeme/p)
    (pure expr)))
(define (binary/p high-level/p op-list)
  (do [e <- high-level/p]
    ; `es` parse operator then high-level unit, for example, `* 1`.
    ; therefore, this parser would stop when the operator is not expected(aka. operator is in op-list)
    ; rely on this fact we can leave this loop
    [es <- (many/p (do [op <- (op/p op-list)]
                     (lexeme/p)
                     [e <- high-level/p]
                     (pure (list op e))))]
    (pure (foldl
           (λ (op+rhs lhs)
             (match op+rhs
               [(list op rhs)
                (list op lhs rhs)]))
           e es))))
(define mul:div/p
  (binary/p factor/p '(#\* #\/)))
(define add:sub/p
  (binary/p mul:div/p '(#\+ #\-)))
(define expr/p add:sub/p)
```

Let's check its result: `(parse-string expr/p "1 + 2 * 3 / 4 - 5")` generate: `(success '(#\- (#\+ 1 (#\/ (#\* 2 3) 4)) 5))` just as expected. Seems like `expr/p` is our target, but it still is a little massive, doesn't it? We have to modify the definition of each small parser once we need to insert more infix operators. To avoid this, finally going to the purpose of this article, we need an automatic way to do this for us. Observing the definition of parsers, there has a pattern: every infix operator layer can be a `(binary/p high-level/p op-list)`. Using this fact we can create a recursive function:

```racket
(define (table/p base/p list-of-op-list)
  (if (empty? list-of-op-list)
      base/p
      (table/p (binary/p base/p (car list-of-op-list))
               (cdr list-of-op-list))))
(define expr/p
  (table/p factor/p
           '((#\* #\/)
             (#\+ #\-))))
```

The function takes a high-level parser and rest list of operator list. Use the head(`car` in Racket) of the list of operator list to create a layer parser via `binary/p`. If the list of operator list hasn't been empty, create more layers via `table/p`. Now we can handle infinite infix operators! Now, is time to take a break and have fun, have a nice day!
