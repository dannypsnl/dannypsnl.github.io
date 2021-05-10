---
title: "NOTE: Coq tactics"
categories:
  - cs
tags:
  - note
  - plt
  - coq
  - tactics
---

Quickly note some Coq.

```coq
Theorem plus_0_n : forall n:nat, 0 + n = n.
Proof.
  intros n. simpl. reflexivity.
Qed.
```

- `intros` introduces variable from environment, here introduce bound `n` from `forall`.
- `simpl` would try to reduce both sides of equation, in case `0 + n` should become `n`
- `reflexivity` check `n = n` which is true, put `Qed` in the end.

```coq
Theorem plus_id : forall n m:nat,
  (* -> constructs a function type, means implies *)
  m = n ->
  n + n = m + m.
Proof.
  (* introduce n m from forall first *)
  intros n m.
  (* introduce m = n as H*)
  intros H.
  (* rewrite n + n = m + m with m = n, got n + n = m + m *)
  rewrite -> H.
  reflexivity.
Qed.
```

`rewrite` do substitution, without it we would get `Unable to unify "m + m" with "n + n".`.

```coq
Theorem negb_involutive : forall b : bool,
  negb (negb b) = b.
Proof.
  intros b. destruct b [] eqn : B.
  (* b = true *)
  - reflexivity.
  (* b = false *)
  - reflexivity.
Qed.
```

`destruct` makes subgoals, in this case `bool` constructors `true` and `false` has no arguments, therefore use `[]` since no identifiers has to bind. In fact, we can totally remove it: `destruct b eqn : B.`. `eqn` gives `destruct` equation a name, also can omit: `destruct b.`. We can make it even simpler: `intros [].` and remove `destruct`. `-` handles subgoals.

```coq
Theorem andb_commutative : forall b c, andb b c = andb c b.
Proof.
  intros [] [].
  - reflexivity.
  - reflexivity.
  - reflexivity.
  - reflexivity.
Qed
```

This case shows how to handle combinations: `true true`, `true false`, `false true`, `false false`. To make `destruct` deeper, can use `--`, `---` and so on:

```coq
Theorem andb_commutative : forall b c, andb b c = andb c b.
Proof.
  intros b c. destruct b.
  - destruct c.
    -- reflexivity.
    -- reflexivity.
  - destruct c.
    -- reflexivity.
    -- reflexivity.
Qed.
```

To prove `n + 0`, at first we might think it's easy.

```coq
Theorem plus_n_0 : forall n : nat, n = n + 0.
Proof.
  intros [| n']. (* n = 0 | S n'*)
  - reflexivity.
  - reflexivity.
Qed
```

We get two subgoals:

- `n = 0`, `reflexivity` is enough here.
- `n = S n'`, but we have no idea what `n'` is, to prove it requires proving `plus_n_0` first! First we might think we can `destruct n'`, but `n` can be infinite, we run out of ideas. Unless we have `induction`.

```coq
Theorem plus_n_0 : forall n : nat, n = n + 0.
Proof.
  induction n as [| n' IHn'].
  - reflexivity.
  (* n = S n'
     (n' + 0 = n') = IHn' *)
  - simpl. rewrite <- IHn'. reflexivity.
Qed
```

As we learn at before, prove `P(0)`, suppose `P(n)` is true then check `P(S n)` works.

```coq
Theorem mult_0_plus' : forall n m : nat,
  (0 + n) * m = n * m.
Proof.
  intros n m.
  assert (H : 0 + n = n). { reflexivity. }
  rewrite -> H.
  reflexivity.
Qed.
```

`assert` proves a sub theorem, here is `0 + n = n`, `{ reflexivity. }` is the proof of the sub theorem. Later we `rewrite` equation: `(0 + n) * m = n * m` with `0 + n = n`, then get `n * m = n * m`, finally, use `reflexivity`.
