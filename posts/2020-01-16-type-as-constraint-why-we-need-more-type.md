---
title: "Type as Constraint: Why we need more type?"
categories:
  - cs
tags:
  - plt
  - language
---

For me, programming was about how to map my mind to the world; from this view, it probably shows why I tend to use statically typed language. A strong model could ensure more people won't misunderstand our purpose. This article was going to show some strategy to promise the thing works in our mind won't be broken by others accident.

Now consider a situation, we had a list of something and we just sort it and we want to do binary-search with it. A subtle problem was we were hard to ensure the list was sorted. In the language such as Python or C, we had to promise this by ourselves. So we insert `assert(sorted(list))` into our program like this:

```python
def binary_search(lst):
    assert sorted(lst)
    # ...
```

p.s. [More assertion in Python](https://www.programiz.com/python-programming/assert-statement), I'm not a Python master. I have to say.

And then we feel the program became slower. Because we were so smart, we distinguish debug and release environment, there were no assertions in release mode. Now everything runs good, right? Well, if you wrote some programs with verified data, that's ok. But what if the `lst` came from the user input? It probably would break, or let's be honest, it would break. So remove checking from there shouldn't happen. But many languages cannot ensure it, we have to take responsibility.

With wrapping, we can make it a little bit better. We can do this:

```go
func Sort(lst []interface{}) SortedList {
	// sorting
	return SortedList{lst: lst}
}

type SortedList struct {
	lst []interface{}
}

func BinarySearch(lst SortedList) interface{} {
	// you know, just ignore how we get the element
	return element
}

func main() {
	lst := []interface{}{1}
	sortedLst := Sort(lst)
	_ = BinarySearch(sortedLst)
}
```

But this is a weak promise, anyone can just use `SortedList{lst: lst}` to break it, but better than no promise and already easier to find out in code review.

The problem was this is not just easy to break, but it also didn't promise enough information for us. What if we modify the list before we use `BinarySearch`? This promise required some human work to check it. Now we want a more improved version. A promise that cannot be violated and doesn't need human work to check the mechanism. As usual, I would use pseudo-code(to get more information, ref to [my another article](/blog/2019/12/08/cs/infinite-type/)):

```
sort[T: comparable](list: List[T]): Output
where
  Output = List[T] // type alias
  Output <: sorted // now we know the result type was a subtype of `sorted`
{
  // sorting
}

binary_search[T: comparable](list: List[T] <: sorted): T {
  // do something and get the answer
  return element;
}
```

and then we can use them like:

```
sorted_list: List[int] = sort(list);
_: int = binary_search(sorted_list); // `_` explicitly ignore value
```

The most important thing is when we do operations that do not fit trait `sorted` the program work as usual but the compiler won't think the value was `sorted` anymore, e.g.

```
sorted_list: List[int] = sort(list);
sorted_list.push(3); // add element
_: int = binary_search(sorted_list);
```

Now it won't get compiled, because the type mismatching, we can do `push` on `List[int]`, but after that `sorted_list` won't belong to `sorted` trait anymore. Do you probably think why not make another type? Because although we, of course, can do that, it would be bad modeling in another case, when we just sort a list and later keep doing something on it and don't care about it's sorted or not til next sort, create another type would let we must keep converting type manually, which violate our spirit! Now back, `sorted` trait modeled the situation very well, we only have to give tag, the compiler checks the rest. We still have checking, we have to ensure the part need to do `binary_search` get `List[T] <: sorted`, but this is better than adding assertion everywhere. I hope you have a nice day and thanks for the read.
