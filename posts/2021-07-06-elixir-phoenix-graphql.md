---
title: "Elixir, Phoenix, and GraphQL(Absinthe)"
date: "Tue Jul  6 00:44:39 UTC 2021"
categories:
  - cs
tags:
  - elixir
  - graphql
  - absinthe
  - phoenix
---

Long time ago, I play Elixir and write down an [article](/blog/2018/03/31/cs/phoenix-run-and-up/) about [Phoenix](https://phoenixframework.org/). Time has passed, now I'm really working with Elixir XD. Today, I want to show how to set up a [GraphQL](https://graphql.org/) server with Elixir/Phoenix stack, we will need a library called [Absinthe](https://github.com/absinthe-graphql/absinthe). This article requires you already to know how to create Phoenix project, now, let's start.

After you have a Phoenix project, we need to add dependencies in `mix.exs` first:

```elixir
defp deps do
  [
    # ...
    # GraphQL
    {:absinthe, "~> 1.4"},
    {:absinthe_plug, "~> 1.4"}
  ]
end
```

Then run `mix deps.get`. Before we create GraphQL schema, we need some data to interact with, you can run `mix phx.gen.context Log Events events event_type:string message:string payload:text` to get a model then run `mix ecto.migrate` to set up Database.

### Query

Imagine the schema:

```graphql
{
  events {
    id
    event_type
    message
    payload
    inserted_at
    updated_at
  }
}
```

We will create `lib/xxx_web/schema/event.ex` with the following content:

```elixir
defmodule XxxWeb.Schema.DataTypes do
  use Absinthe.Schema.Notation

  object :event do
    field :id, :id
    field :event_type, :string
    field :message, :string
    field :payload, :string
  end
end
```

then create `lib/xxx_web/schema.ex` with the following content:

```elixir
defmodule XxxWeb.Schema do
  use Absinthe.Schema

  import_types XxxWeb.Schema.DataTypes

  query do
    @desc "Get a list of events"
    field :events, list_of(:event) do
      resolve fn _parent, _args, _resolution ->
        {:ok, Xxx.Log.list_events()}
      end
    end
  end
end
```

In the project `xxx`, there will have a file `lib/xxx_web/router.ex`, now we have to modify it, delete the following code:

```elixir
  scope "/" do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end
```

then add the following:

```elixir
  scope "/api" do
    pipe_through :api

    forward "/graphiql", Absinthe.Plug.GraphiQL, schema: XxxWeb.Schema
  end
```

Finally, we can test it out, run `iex mix -S phx.server` to start the server. Now, connect to `http://localhost:4000/api/graphiql` with the browser, it will show a GraphQL playground you can play with it.

### Mutation

We would like to create some data, how to do this? We still modify `lib/xxx_web/schema.ex`

```elixir
defmodule XxxWeb.Schema do
  # ...
  mutation do
    @desc "Create a new event"
    field :create_event, :string do
      arg(:event_type, non_null(:string))
      arg(:message, :string)
      arg(:payload, :string)

      resolve fn _parent, params, _resolution ->
        case Xxx.Log.create_event(params) do
          {:ok, _} -> {:ok, "event created"}
          {:error, changeset} -> {:error, inspect(changeset.errors)}
        end
      end
    end
  end
end
```

Now you can use the following mutation to create an event:

```graphql
mutation {
  createEvent(event_type: "Test", message: "Hello")
}
```

### Summary

Now we know how to create queries and mutation with Absinthe, we don't cover how to add middleware, how to write unit test for our code. You will be able to get more information about those uncovered in [document of Absinthe](https://hexdocs.pm/absinthe/overview.html), have a nice day.
