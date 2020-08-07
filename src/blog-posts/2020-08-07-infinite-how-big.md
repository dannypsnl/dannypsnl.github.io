---
title: "Infinite, how big?"
categories:
  - math
tags:
  - cantor
  - infinite
  - set theory
---

Counting is a useful skill, we count in many places, money, cars, weight. We develop awesome ways to count number by hands, if we mark thumb as t, index as i, middle as m, ring as r, little as l, then in Taiwan people counting as the following mapping:

```
fist -> 0
i -> 1
im -> 2
imr -> 3
imrl -> 4
timrl -> 5
tl -> 6
ti -> 7
tim -> 8
timr -> 9
```

With another hand represents `10 x n`, where `n` following the same rules, we can count to 100(two fists as 100). However, this is quite limited, and even we have much more finite fingers, still has numbers that cannot be count like this way. For example, the amount of all integer($\mathbb{Z}$), the interesting part is, although the amount of integer is infinite, does there have bigger infinite? First, we create a way to formal $\mathbb{Z}$:

1. `z` belongs to $\mathbb{Z}$
2. `s n` belongs to $\mathbb{Z}$ if `n` belongs to $\mathbb{Z}$
3. `s n` and `s m` are the same, iff `n` and `m` are the same
4. `s n` won't be `z` anyway

Now we know how to find out next $\mathbb{Z}$, `\all n.(s n)` belongs to $\mathbb{Z}$. We call this countable infinite. The second step, we need to define how to compare infinite, idea was simple: we don't need to know 5(or 6) to know our hands have the same amount of finger! We mapping them, therefore, let us mapping numbers, we get an amazing result from this:

```
1 -> 2
3 -> 4
5 -> 6
7 -> 8
9 -> 10
...
```

We say `even` and `odd` numbers are the same sets, but you probably already know that? The power of this idea just start!

```
1 -> 2
2 -> 4
3 -> 6
4 -> 8
5 -> 10
...
```

We know this is true because we can find out `value` by `2 x key`. However, `odd` belongs to $\mathbb{Z}$, shouldn't a subset of the set smaller than the set? In fact, this is one of the important features of an infinite, a subset of an infinite set was able to map to the set. We also know $\mathbb{Q}$ can mapping to $\mathbb{Z}$:

```
1/1
1/2 2/1
1/3 2/3 3/2 3/1
1/4 2/4 3/4 4/3 4/2 4/1
1/5 2/5 3/5 4/5 5/4 5/3 5/2 5/1
...
```

p.s. Here I only show how to find out next $\mathbb{Q}$ rather than mapping.

We might think, $\mathbb{R}$ can mapping to $\mathbb{Z}$, however, that's wrong. We can prove it by contradiction.

1. $\mathbb{R}$ can mapping to $\mathbb{R}' \doteq \{r \in \mathbb{R} \; | \; 0 \le r \le 1\}$, imagine a line has length 1, now make it became a half-circle, from the center of the circle we can let any point mapping to an infinite line.
2. Assuming there has a mapping from $\mathbb{Z}$ to $\mathbb{R}'$
   ```
   1 -> 0.1237453523532583259...
   2 -> 0.1283782164573269472...
   3 -> 0.2475938174817483213...
   4 -> 0.9123643892890978652...
   5 -> 0.6728314270987186278...
   ...
   ```
3. Every $r \in \mathbb{R}'$ can be represented as $0.a_{11} a_{12} a_{13} a_{14} ...$, $a_{ij}$ means a $j$th digit of the $i$th number in the mapping.
4. There must a number $n \in \mathbb{R}'$ can be constructed from mapping, by selecting a digit that different than $a_{ii}$ for every digit of $n$.
5. For all index $i$, we cannot say $n$ has that index, because the $i$th digit of $n$ must different than $a_{ii}$.
6. Now we have evidence shows $n$ not in mapping but in $\mathbb{R}'$, which meaning such mapping won't be exhausted forever(we for sure can add $n$ into mapping to create a new one, however, the new one would have the same problem). Q.E.D.

We call set like $\mathbb{R}$ uncountable. In fact, all points on a flat create the same set as $\mathbb{R}$. Proof also straightforward, extract any point of a line, its digits at odd and even index create two new $\mathbb{R}$, and must in a flat. Hope now you know more about infinite, have a nice day and see you next time.
