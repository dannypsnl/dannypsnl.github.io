---
title: "Binary Encoding of Integer"
categories:
  - cs
tags:
  - fundamental
---

$$\mathbb{Z}$$ contains positive and negative numbers, but nowdays Computer system based on binary. There only have `0` and `1` can be used. A simple solution is: **put signed symbol at the most significant bit**. For example, use 8 bits can represent:

$$
-(2^7 - 1) = -127, -126, -125, … -0, +0, …, +125, +126, +(2^7 - 1) = +127
$$

This is an intuitive way. Therefore, early days computers applied it.

But this way(called **Sign magnitude**) has two big problems:

1. waste a place: +0 and -0 are different in this system
2. have to detect signed or not and use different ways to do an operation like addition

### One's complement

To solve the second problem with the calculation complex, engineers introduce **one's complement**. For example, a number: $$-43_{10}$$ is $$100101011_2$$, the one's complement of it is $$111010100_2$$(keep the most significant bit and reverse the rest of bits). It still only works for $$-127_{10} ... 127_{10}$$ with 8 bits, didn't solve the first problem obviously, why we say it solves the second one? Because we can replace special digital electronics with two subtractions:

$$
0010 - 0001 \equiv 0010 + (0011 - 0001) + (0001 - 0100)
$$

Then we convert negative number to one's complement, and remember end-around carry(the bit over most significant bit should be add back), then get:

$$
0010 + 0011 + 1110 + 0001 + 1011
\\
\to 0101 + 1110 + 0001 + 1011
\\
\to 10011 + 0001 + 1011
\\
\to 10100 + 1011
\\
\to 1[1111]
\\
\to 1111 + 0001
\\
\to 1[0000]
\\
\to 0000 + 0001
\\
\equiv 0001
$$

Or $$1110 + 0010$$ would get $$1[0000] \to 0001$$

##### Benefit

- no need to check signed bit
- reverse bits can use addition on subtraction

##### Problem

- need a special unit for end-around carry
- there still have two zero representations

### Two's complement

##### Modular Arithmetic

If we have an integer use 3 bits to represent, then $$7 + 1 \equiv 0(mod \; 8)$$ because of the overflow.

If we have k bits for an integer, then we can generalize to $$A + B \equiv C(mod \; 2^k)$$.

##### Abelian group

For additive, we have to implement an Abelian group: an **Identity** element and every element has an **Inverse** element that adds them would get the **Identity** element.

Now consider how can our 3-bits integer fit rules of Abelian group? If `[000]` represents `0`, it's identity in our group. Assuming `[001]` is `1`, how to know the representation of `-1`? It's easy to get `[111]` this answer because we know `[111] + [001] = 1[000]`, overflow would be dropped. And it cannot be any number except `-1`, else we cannot find others inverse element of `1`. With this, we can keep finding an inverse for `2`(`[010]`) is `[110]` and so on.

On the other hand, it still simple: `-1` is the biggest negative number in 3-bits encoding. Follows unsigned order, `[111] > [110]`, then don't need another way to compare numbers.

##### Properties

Now we can see we map all possible combinations of bits to an exact number. Solve the first problem in previous solutions.

Even more, the subtractive of signed integer is additive of unsigned number: `010 + 101` can be `2 + 5` or `2 + (-3)`. Therefore:

$$
A + \neg A = 2^k - 1
\\
\to A + (\neg A + 1) = 2^k(mod \; 2^k)
\\
\to -A := \neg A + 1
$$

Now we know we don't need subtractive, it can be replaced with one's complement plus one.

Back to group, one's complement would waste place about encoding is a thing must happen, because in 3-bits encoding it maps `[111]` and `[000]`. In two's complement the axis of symmetry pass through `[000]`, therefore, we won't get repetitive representations of zero.

Extend this `[001]` maps to `[111]` in two's complement, maps to `[110]` in one's complement. Therefore, one's complement plus one would be two's complement.
