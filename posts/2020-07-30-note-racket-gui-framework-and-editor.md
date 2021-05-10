---
title: "NOTE: Racket GUI framework and editor component"
categories:
  - cs
tags:
  - note
  - racket
  - racket/gui
  - gui
  - framework
  - editor
---

[framework](https://docs.racket-lang.org/framework/index.html) based on [racket/gui](https://docs.racket-lang.org/gui/) and provides some helpful components. This note is about `editor`, more precisely [racket:text%](https://docs.racket-lang.org/framework/Racket.html#%28def._%28%28lib._framework%2Fmain..rkt%29._racket~3atext~25%29%29).

Whole GUI system based on a class hierarchy, therefore, let's inherit `racket:text%`:

```racket
(define editor%
  (class racket:text%
    (init)
    (super-new)))
```

### Keyboard Event

Override `on-char` can get [key-event%](https://docs.racket-lang.org/gui/key-event_.html):

```racket
(define editor%
  (class racket:text%
    (init)
    (super-new)
    (define/override (on-char e)
      (cond
        [(and (send e get-meta-down)
              (eq? (send e get-key-code) #\c))
         'copy-selected-text?]
        [(and (send e get-meta-down)
              (eq? (send e get-key-code) #\s))
         'save-to-file?]
        [else (super on-char e)]))))
```

An interesting thing was `send key-event% get-x` or `send key-event% get-y` won't get cursor position, but mouse position.

### Mouse Event

Override `on-local-event` can get [mouse-event%](https://docs.racket-lang.org/gui/mouse-event_.html):

```racket
(define editor%
  (class racket:text%
    (init)
    (super-new)
    (define/override (on-local-event e)
      (cond
        [(and (send e get-meta-down)
              (send e button-down?))
         'jump-to-definition?]
        [else (super on-local-event e)]))))
```
