---
title: "Design of Redux-go v2"
categories:
  - cs
tags:
  - golang
  - redux
---

Redux is a single flow state manager. I porting it from JS to Go at last year.

But there had one thing make me can't familiar with it, that is type of state!

In Redux, we have store combined by many reducers. Then we dispatch action into store to updating our state. That means our state could be anything.

In JS, we have a reducer like:

```javascript
const counter = (state = 0, action) => {
    switch action.type {
    case "INC":
        return state + action.payload
    case "DEC":
        return state - action.payload
    default:
        return state
    }
}
```

It's look good, because we don't have type limit at here. In Redux-go v1, we have:

```go
func counter(state interface{}, action action.Action) interface{} {
    if state == nil {
        return 0
    }
    switch action.Type {
    case "INC":
        return state.(int) + action.Args["payload"].(int)
    case "DEC":
        return state.(int) - action.Args["payload"].(int)
    default:
        return state
    }
}
```

Look at those assertion, of course it's safe because you should know which type are you using. But just so ugly.

So I decide to change this. In v2, we have:

```go
func counter(state int, payload int) int {
    return state + payload
}
```

Wait, what!!!?

So I have to explain the magic behind it.

First is how to got user wanted type of state. The answer is `reflect` package.

But how? Let's dig in `v2/store` function: `New`.

```go
func New(reducers ...interface{}) *Store
```

As you see, we have to accept any type been a reducer at parameters part.

Then let's see type: `Store`(only core part)

```go
type Store struct {
    reducers []reflect.Value
    state    map[uintptr]reflect.Value
}
```

Yp, we store the reflect result that type is `reflect.Value`.

But why? Because if we store `interface{}`, we have to call `reflect.ValueOf` each time we want to call it! That will become too slow.

And `state` will have an exlpanation later.

So in the `New` body.

```go
func New(reducers ...interface{}) *Store {
    // malloc a new store and point to it
    newStore := &Store{
        reducers: make([]reflect.Value, 0),
        state:    make(map[uintptr]reflect.Value),
    }
    // range all reducers, of course
    for _, reducer := range reducers {
        r := reflect.ValueOf(reducer)
        checkReducer(r)
        // Stop for while
    }
}
```

Ok, what is `checkReducer`? Let's take a look now!

```go
func checkReducer(r reflect.Value) {
    // Ex. nil
    if r.Kind() == reflect.Invalid {
        panic("It's an invalid value")
    }

    // reducer :: (state, action) -> state

    // Missing state or action
    // Ex. func counter(s int) int
    if r.Type().NumIn() != 2 {
        panic("reducer should have state & action two parameter, not thing more")
    }
    // Return mutiple result, Redux won't know how to do with this
    // Ex. func counter(s int, p int) (int, error)
    if r.Type().NumOut() != 1 {
        panic("reducer should return state only")
    }
    // Return's type is not input type, Redux don't know how would you like to handle this
    // Ex. func counter(s int, p int) string
    if r.Type().In(0) != r.Type().Out(0) {
        panic("reducer should own state with the same type at anytime, if you want have variant value, please using interface")
    }
}
```

Now back to `New`

```go
// ...
for _, reducer := range reducers {
    // ...
    checkReducer(r)
    newStore.reducers = append(newStore.reducers, r)

    newStore.state[r.Pointer()] = r.Call(
        []reflect.Value{
            reflect.Zero(r.Type().In(0)),
            reflect.Zero(r.Type().In(1)),
        },
    )[0]
}
return newStore
// ...
```

So that's how `state` work, using a address of reducer mapping it's state.

`reflect.Value.Call` this method allow you invoke a `reflect.Value` from a function.

It's parameter types required by signature. It always return several `refelct.Value`, but because we just very sure we only reutrn one thing, so we can just extract index 0.

Then is `state`, why I choose to using pointer but not function name this time?

Thinking about this:

```go
// pkg a
func Reducer(s int, p int) int
// pkg b
func Reducer(s int, p int) int
// pkg main
func main() {
    store := store.New(a.Reducer, b.Reducer)
}
```

Which one should we pick? Of course we can trying to left package name make it can be identified.

But next is the really hard:

```go
func main() {
    counter := func(s int, p int) int { return s + p }
    store := store.New(counter)
}
```

If you think counter name is counter, that is totally wrong, it's name is **func1**.

So, I decide using function itself to get mapping state. That is new API: `StateOf`

```go
func (s *Store) StateOf(reducer interface{}) interface{} {
    place := reflect.Valueof(reducer).Pointer()
    return s.state[place].Interface()
}
```

The point is `reflect.Value.Interface`, this method return the value it owns.

The reason we return `interface{}` at here is because, we have no way to convert to user wanted type, and user is always know what them get actually, just for convience we let user can use any type for their state, so they don't need to do `state.(int)` these assertion.

Now, you just work like this:

```go
func main() {
    counter := func(s int, payload int) int {
        return s + payload
    }
    store := store.New(counter)
    store.Dispatch(10)
    store.Dispatch(100)
    store.Dispatch(-30)
    fmt.Printf("%d\n", store.StateOf(counter)) // expected: 80
}
```

These are biggest break through for v2, thanks for read
