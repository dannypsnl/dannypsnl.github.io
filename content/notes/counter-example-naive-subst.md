---
title: Can Naive substitution work if all variables has different name?
---

First counter example

$$
(lambda x. lambda y. x) y = lambda y. y
$$

but this is an open term, right `y` is a free variable.

# counter example without free variable

From: https://hachyderm.io/@LordQuaggan/113894693329581835

$$
(lambda f. f f) (lambda x. lambda y. x y) \
= (lambda x. lambda y. x y) (lambda x. lambda y. x y) \
= lambda y. ((lambda x. lambda y. x y) y) \
= lambda y. (lambda y. y y)
$$

- 注意到 `y` 分別要參照最外的與最內的

# advanced question: can binding as sets of scopes solve this problem?

Yes, but this is slower than usual algorithm.

- program: https://gist.github.com/dannypsnl/8d5ff9bec6db4e7f8cf6bff3849451e7
