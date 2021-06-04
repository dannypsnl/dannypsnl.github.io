---
title: "Racket: Lexer and Parser"
date: "Fri Jun  4 03:29:45 UTC 2021"
categories:
  - cs
tags:
  - compiler
  - parser
  - lexer
  - racket
---

This article ports lexer from [Go implementation](/blog/2017/07/08/cs/lexer-explains/) and ports parser from [Rust implementation](https://github.com/dannypsnl/elz/blob/master/src/parser/mod.rs) to Racket.

### Lexer

First, we need some structures that record metadata for us.

```racket
(struct pos (line column) #:transparent)

(struct lexer
  (name
   input ; list char
   state
   ; for report position as format: (line, column)
   line column
   ; lexing helpers
   offset start
   tokens)
  #:mutable
  #:transparent)

(struct token (typ val pos) #:transparent)
```

Then we need some helpers to handle some char utilities.

```racket
(define (alpha-numeric? c)
  (and (char? c)
       (or (char-ci=? c #\_)
           (char-alphabetic? c)
           (char-numeric? c))))

(define (end-of-line? c)
  (match c
    [#\newline #t]
    [else #f]))
```

Core is state-function, which using function as state to run up a state machine.

```racket
(define (run lexer)
  (when (lexer-state lexer)
    (set-lexer-state! lexer
                      ((lexer-state lexer) lexer))
    (run lexer)))
```

Some utilities about update input char flow and metadata.

```racket
(define (next l)
  (set-lexer-offset! l (add1 (lexer-offset l)))
  (set-lexer-column! l (add1 (lexer-column l)))
  (define c (peek-char (lexer-input l)
                       (- (lexer-offset l) (lexer-start l))))
  (if (eof-object? c)
      c
      (when (end-of-line? c)
        (set-lexer-line! l (add1 (lexer-line l)))
        (set-lexer-column! l 0))))

(define (peek l) (peek-char (lexer-input l)
                            (- (lexer-offset l) (lexer-start l))))

(define (ignore l)
  (read-string (- (lexer-offset l) (lexer-start l))
               (lexer-input l))
  (set-lexer-start! l (lexer-offset l)))

(define (new-item l ty value)
  (channel-put (lexer-tokens l) (token ty value (pos (lexer-line l) (lexer-column l)))))

(define (emit l ty)
  (define value
    (read-string (- (lexer-offset l) (lexer-start l))
                 (lexer-input l)))
  (match value
    [(? eof-object?) (new-item l 'EOF value)]
    ["true" (new-item l 'true value)]
    ["false" (new-item l 'false value)]
    ["and" (new-item l 'and value)]
    ["or" (new-item l 'or value)]
    [else (new-item l ty value)])
  (set-lexer-start! l (lexer-offset l)))

(define (accept? l valid)
  (cond
    [(and (char? (peek l))
          (string-contains? valid (string (peek l))))
     (next l)
     #t]
    [else #f]))

(define (accept-run l valid)
  (let loop ([c (peek l)])
    (when (and (char? c) (string-contains? valid (string c)))
      (next l)
      (loop (peek l)))))

(define (scan-number? l)
  (define digits "0123456789")
  (when (and (accept? l "0") (accept? l "xX"))
    (set! digits "0123456789abcdefABCDEF"))
  (accept-run l digits)
  (when (accept? l ".")
    (accept-run l digits))
  (when (accept? l "eE")
    (accept? l "+-")
    (accept-run l "0123456789"))
  ; Next thing mustn't be alphanumeric.
  (cond
    [(alpha-numeric? (peek l))
     (next l)
     #f]
    [else #t]))
```

Our state functions.

```racket
(define (lex-white-space l)
  (let loop ([c (peek l)])
    (when (and (not (eof-object? c))
               (or (char-whitespace? c)
                   (end-of-line? c)))
      (next l)
      (loop (peek l))))
  (ignore l)

  (match (peek l)
    [(? eof-object?) (emit l 'EOF)
                     #f]
    [#\+ (next l)
         (emit l 'add)
         lex-white-space]
    [#\- (next l)
         (emit l 'sub)
         lex-white-space]
    [#\* (next l)
         (emit l 'mul)
         lex-white-space]
    [#\/ (next l)
         (emit l 'div)
         lex-white-space]
    [#\^ (next l)
         (emit l '^)
         lex-white-space]
    [#\= (next l)
         (emit l 'eq)
         lex-white-space]
    [(? char-numeric?) lex-number]
    [(? alpha-numeric?) lex-identifier]
    [c (error 'unknown "don't know what to do with: `~a`" c)]))

(define (lex-identifier l)
  (let loop ([c (peek l)])
    (when (alpha-numeric? c)
      (next l)
      (loop (peek l))))

  (emit l 'identifier)
  lex-white-space)

(define (lex-number l)
  (when (not (scan-number? l))
    (error 'bad-number-syntax "bad number syntax: `~a`"
           (peek-string (- (lexer-offset l) (lexer-start l))
                        0 (lexer-input l))))
  (emit l 'number)
  lex-white-space)
```

Finally, put them together.

```racket
(define (lex name input-port)
  (define l (lexer name
                   input-port
                   ; state
                   lex-white-space
                   ; line column
                   1 0
                   ; start offset
                   0 0
                   (make-channel)))
  (thread (λ () (run l)))
  l)
```

### Parser

Utilities

```racket
(struct parser (name lexer tokens offset)
  #:mutable
  #:transparent)

(define (parse name input)
  (define lexer (lex name input))
  (define p (parser name lexer (vector) 0))
  (parse-expr p #f 1))

(define (peek p [n 0])
  (get-token p (+ (parser-offset p) n)))
(define (take p)
  (define origin (parser-offset p))
  (set-parser-offset! p (add1 origin))
  (get-token p origin))
(define (consume p . wants)
  (predict p wants))
(define (predict p . wants)
  (for ([i (length wants)]
        [want wants])
    (define tok (peek p i))
    (unless (eq? (token-typ tok) want)
      (error 'unexpected-token "want ~a, got ~a" want (token-typ tok)))))

(define (get-token p fixed-offset)
  (when (vector-empty? (parser-tokens p))
    (increase-token-stream p))
  (define tokens (parser-tokens p))
  (if (>= fixed-offset (vector-length tokens))
      (let ([last-token (vector-ref tokens (sub1 (vector-length tokens)))])
        (case (token-typ last-token)
          [(EOF) last-token]
          [else (increase-token-stream p)
                (get-token p fixed-offset)]))
      (vector-ref tokens fixed-offset)))
(define (increase-token-stream p)
  (define l (parser-lexer p))
  (define new-last-token (channel-get (lexer-tokens l)))
  (set-parser-tokens! p
                      (vector-append (parser-tokens p) (vector new-last-token))))
```

Operators utilities.

```racket
(define (right-assoc? token)
  (case (token-typ token)
    [(^) #t]
    [else #f]))
(define (precedence token)
  (define op** '((eq)
                 (and or)
                 (add sub)
                 (mul div ^)))
  (define m (make-hash))
  (for ([i (length op**)]
        [op* op**])
    (for ([op op*])
      (hash-set! m op (+ 2 i))))
  (hash-ref m (token-typ token) 0))
```

Ast

```racket
(struct expr () #:transparent)
(struct binary expr (op left right) #:transparent)
```

Parsers

```racket
(define (parse-expr p left-hand-side previous-primary)
  (define lhs (if left-hand-side
                  left-hand-side
                  (parse-unary p)))

  (let loop ([lookahead (peek p)])
    (when (>= (precedence lookahead) previous-primary)
      (define operator lookahead)
      (take p)
      (define rhs (parse-unary p))
      (set! lookahead (peek p))
      (let loop ()
        (when (or (> (precedence lookahead) (precedence operator))
                  (and (right-assoc? lookahead)
                       (= (precedence lookahead) (precedence operator))))
          (set! rhs (parse-expr p rhs (precedence lookahead)))
          (set! lookahead (peek p))
          (loop)))
      (set! lhs (binary (token-typ operator)
                        lhs rhs))
      (loop lookahead)))

  lhs)

(define (parse-unary p)
  (define tok (peek p))
  (case (token-typ tok)
    [(number) (take p)
              (string->number (token-val tok))]
    [(true) (take p)
            'true]
    [(false) (take p)
             'false]
    [(identifier) (take p)
                  (token-val tok)]
    [else (error 'unknown "~a" tok)]))
```
