---
title: "Some thinking from Elixir X Ruby Conf"
categories:
  - cs
tags:
  - elixir
---

Hi everyone, I am Danny.

Although title contains Ruby, but I won't talk too much on it. Because I did not learn it.

This conf is my first conf. I learn something at here and I will write down in following text.

First impress talk is using Elixir & Kafka write a server can handle 200 millions user communication on it.

Speaker is a Japanese, so I can't understand his English a lot. But his paper show how does he compare different machine & different tech stack, so that's fine.

Second is about chosing style! Speaker show some web library/framework in Ruby/Elixir/Erlang and compare the style between them. He says: Style is about chosing.

Then a speaker talk how RDoc work, it's useful for me because I am implementing a programming language and hope it can become a language can using in real development.

p.s. RDoc is Ruby doc generator.

Then MJIT is the next thing I am impressed. It's about JIT implementation in Ruby.

Final is Jose(Elixir writer. e is not that one, but I don't know how to type it from my labtop, so sorry for him)'s talk.

Of course he introducing Elixir for us. But not syntax level, but about design issue: Why we need immutable? Why is actor(Erlang concurrency model)?

Then he show a new way testing. Test the concept.

We know test.

For example:

```elixir
defmodule ExampleTest do
  use ExUnit.Case
  doctest Example

  test "one plus one is two" do
    assert 1 + 1 == 2
  end
end
```

But can we really test anything? How many tests we need?

Take a look

```elixir
defmodule StringContainsTest do
  use ExUnit.Case

  test "abc contains ab" do
    assert String.contains? "abc", "bc"
  end
end
```

What about ("erhonbkd", "")? ("", "")?

If we test?

```elixir
defmodule StringContainsTest do
  use ExUnit.Case

  @spec a :: string()
  @spec b :: string()
  test "a <> b should contain a & b" do
    s = a <> b
    assert String.contains? s, a
    assert String.contains? s, b
  end
end
```

Then just let compiler generating all the edge case you hard to cover.

This the end.

And let me talk something, from Jose's speech, I think more.

If we can using the user's input, testing more thing?

For example, each time user have using `String.contains?`.

We use all string them used to generate test for `String.contains?`

If it broke. User can find the bug for us!!!

See you next time.
