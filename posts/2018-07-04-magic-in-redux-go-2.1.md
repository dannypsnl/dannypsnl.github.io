---
title: "Magic in redux-go v2.1: package rematch"
categories:
  - cs
tags:
  - golang
  - redux
---

A few days ago, I release the redux-go v2.1

The purpose is: create reducer & action then manage relationships between them is pretty hard!

Let's getting start from basic v2 store

```go
// package reducer
func Counter(state int, action string) int {
    switch action {
    case "INCREASE":
        return state + 1
    case "DECREASE":
        return state + 1
    default:
        return state
    }
}

// func main
store := store.New(reducer.Counter)
store.Dispatch("INCREASE")
store.StateOf(reducer.Counter)
```

When you got 30 reducers, each contains 3 actions, how to manage this complex?

In the traditional way, we follow a restrict naming rule.

For example:

```go
// package reducer/counter
const (
    Increase = "REDUCER_COUNTER_INCREASE"
    Decrease = "REDUCER_COUNTER_DECREASE"
)

// package reducer
func Counter(state int, action string) int

// func main
store := store.New(reducer.Counter)
store.Dispatch(counter.Increase)
store.StateOf(reducer.Counter)
```

How to spread these actions is not important, the point is we manage them by handcraft! And handcraft cause unstable!

That's why we need package Rematch.

It creates a more native way to manage your reducer-action relationship.

```go
// package reducer/todo
var Reducer *todoModel

func init() {
    Reducer = &todoModel{
        State: make([]Todo, 0),
    }
}

type Todo struct {
    Title string
    Done bool
}

type Model []Todo

type todoModel struct {
    rematch.Reducer
    State Model
}

func (todo *todoModel) AddTodo(state Model, title string) Model {
    return append(state, Todo{Title: title})
}
```

Now when we using it, the relationship became pretty obviously

```go
// func main
store := store.New(todo.Reducer)
addTodo := todo.Reducer.Action(todo.Reducer.AddTodo)

store.Dispatch(addTodo.With("first todo"))
store.Dispatch(addTodo.With("second todo"))

store.StateOf(todo.Reducer)
```

It takes more code but also more restrictive than the manual way to create it.

Now, let's take a look at what made these happened.

First, we start from `store.New`(base on v2.1.1)

```go
// package store
func New(reducers ...interface{}) *Store {
    newStore := &Store{
        reducers: make(map[uintptr]reflect.Value),
        state:    make(map[uintptr]reflect.Value),
    }
    // later
}
```

The first difference is `Store.reducers` because, with `rematch`, reducer's address can't mapping to state, I will explain it later.

```go
// func store.New
for _, reducer := range reducers {
    r := reflect.ValueOf(reducer)
    checkReducer(r)

    if _, ok := newStore.state[r.Pointer()]; ok {
        panic("You can't put duplicated reducer into the same store!")
    }

    actualReducer, initState := getReducerAndInitState(r)

    newStore.reducers[r.Pointer()] = actualReducer
    newStore.state[r.Pointer()] = initState
}
return newStore
```

We still checking reducer, let's view it

```go
// func checkReducer, adding part
if r.Kind() == reflect.Ptr {
    v := reflect.Indirect(r) // dereference from ptr
    if v.FieldByName("State").Kind() == reflect.Invalid {
        panic("Reducer structure must contains field[State]")
    }
}
```

We add checking `Kind` is `Ptr`, because of `rematch.Reducer` sends a pointer of it into the store!

If we can't find field `State`, we say the reducer is invalid and panic(this is a protocol really missing, but only the writer has to worry about, the user only need to know they have to create this field). So we can promise we don't have to check these at the following flow.

Then we check the state already exist or not in the store. If the answer is yes, we panic it.

Final, we have to get initial state and actual reducer, why it called `actual reducer`? Because we can't really execute a structure! The reducer will execute in progress is another thing. It created by package rematch. So let's dig into `getReducerAndInitState` this function to understanding how it works and why we have to change the type of `Store.reducers`.

```go
// func getReducerAndInitState
if r.Kind() == reflect.Ptr {
    v := reflect.Indirect(r) // dereference from ptr
    return r.MethodByName("InsideReducer").
        Call([]reflect.Value{r})[0],
        v.FieldByName("State")
}
return r, r.Call(
    []reflect.Value{
    // We just use their zero value for initialize
        reflect.Zero(r.Type().In(0)), // In index 0 is state
        reflect.Zero(r.Type().In(1)), // In index 1 is action
    },
    )[0] // 0 at here is because checkReducer promise that we will only receive one return
```

The same, Kind is Ptr means it's `rematch.Reducer`.

Remember `actualReducer, initState := getReducerAndInitState(r)` this line, we got `(reducer, state)` pair.

Now, when we receive a `rematch.Reducer`, `reducer` produce by `InsideReducer`, where is it? We do not see it at any user's code, right? Because it's defined at package `rematch`, export it is because reflection can only take exported member!

Else it's original reducer(a normal function apply reducer required), we won't talk about it again, you can refer to [design-of-redux-go-v2](/blog/2018/05/17/cs/design-of-redux-go-v2/) to getting more information.

Back to InsideReducer

```go
// package rematch
func (r Reducer) InsideReducer(v interface{}) func(interface{}, *action) interface{} {
    r.ms = r.methods(v)
    return func(state interface{}, action *action) interface{} {
        return r.ms[action.reducerName()].Call(
            []reflect.Value{
                reflect.ValueOf(state),
                reflect.ValueOf(action.payload()),
            },
        )[0].Interface()
    }
}
```

As you can see, it returns a normal reducer finally, then you can find it very depends on `r.methods`. What is that? Let's view its definition.

```go
// package rematch
func (r Reducer) methods(v interface{}) map[string]reflect.Value {
    rv := reflect.ValueOf(v)
    rt := reflect.TypeOf(v)
    methods := make(map[string]reflect.Value)
    for i := 1; i < rt.NumMethod(); i++ {
        m := rt.Method(i) // rt.Method.Func return func with first argument as receiver
        mt := m.Type
        if mt.NumIn() == 3 &&
            mt.NumOut() == 1 &&
            mt.In(1) == mt.Out(0) {
            // rv.Method return func with now receiver
            methods[m.Name] = rv.Method(i)
        }
    }
    return methods
}
```

`methods` get user-defined rematcher(back to `InsideReducer` & `getReducerAndInitState`, you will find this passing flow), overviewing every method, if anything looks like an inside reducer, put it into method map.

Now you could have several confused points.

1. why using `m.Name`, not address
2. why using `mt.In(1)`, not `mt.In(0)`
3. why `NumIn()` should be 3

First question's answer is, instance to method & type to method has the different address! It's not hard to understand when you know that there has no `user-type` in final machine code. We will create a table(or other things, not important) to represent `user-type`. But we can get the same name(type info will store it).

Second's answer and third's are same, reflection type of structure's method `Method` return an underlying function of method.

For example, we have a type `K`, `K` has a method `foo()`, there has no `K.foo()` in this world, we have `foo(*K)` actually, and that's what `rt.Method(i)` gave you!

Finally, let's take a look at `action`. The last puzzle of this crazy tutorial.

```go
// package rematch
type action struct {
    funcName string
    with     interface{}
}
```

This is how it looks like. We store method's name & payload named as `with`.

We used `Action` to create our action

```go
// package rematch
func (r Reducer) Action(method interface{}) *action {
    return &action{
        funcName: getReducerName(method),
    }
}
```

Now, we believing `getReducerName` work correctly first, and mention it later.

As your expected, `With` just set up the payload.

```go
// package rematch
func (a *action) With(payload interface{}) *action {
    a.with = payload
    return a
}
```

`reducerName` & `payload` used in `InsideReducer`, them don't need to explain, just return the thing that action kept.

```go
// package rematch
func (a action) reducerName() string {
    return a.funcName
}

func (a action) payload() interface{} {
    return a.with
}
```

`getReducerName` is the fuzziest thing, but just like we had mentioned, a method is a function that first parameter is its receiver!

```go
// package rematch
func getReducerName(r interface{}) string {
    fullName := runtime.FuncForPC(reflect.ValueOf(r).Pointer()).Name()
    // fullName's format is `package.function_name`
    // we don't want package part.
    // package is full path(GOPATH/src/package_part) to it
    // len-3 is because a method contains suffix `-fm`
    return fullName[strings.LastIndexByte(fullName, '.')+1 : len(fullName)-3]
}
```

But why is `len(fullName)-3`? The reason is that you can have `Foo` & `Foo(*K)` at the same time! The solution Go pick is suffixed all method by `-fm`!

Now you know why we cut it. Because of the type of method.Name does not have this suffix, we want to map them, so we have to follow their rules.

With these change, now we can work with a native relationship between reducer & action! And a nice sleep I guess?
