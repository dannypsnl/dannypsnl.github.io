---
title: "Introduction of LLDB"
categories:
  - cs
tags:
  - tool
  - debugger
  - lldb
---

Seriously, I'm not a big fan of the debugger since I never have a try at before. But this time I take a few hours to work with it and the experience is amazed. The debugger provides a way to peeking all stuff inside the program by different input, and this way is almost perfer for debugging something you don't have any idea. But on the other hands, we should create a sufficient example to determine the problem which is not so easy.

Anyway, to have another tool in the toolbox is nice, so let's start to see how LLDB work with `C`.

The first step is to create a small program. p.s. Formatted by `clang-format`

```c
// main.c
#include <stdio.h>

int main(int argc, char **argv) {
  if (argc < 1)
    return 1;
  printf("hello, %s\n", argv[1]);
  int print_me = 10;
  printf("print me: %d\n", print_me);
  return 0;
}
```

In the program, we leave a variable `print_me` just to show how to use `display` hook.

Then we compile it, the point here is you should make sure the compiler provides the debug information, the command is: `clang -g main.c`, it would generate an executable `a.out` and a directory `a.out.dSYM` which include the debug information, and now we can start our debugger!

Type: `lldb` and enter.

Now we are in the interactive environment of **LLDB**.

The first step is creating a target. Type and enter `target create a.out`, and type `target list` to ensure you just create a target. You can create multiple targets at the same time and use `target select <target-index>` to change the target you're going to debug.

The next step is to set a breakpoint, breakpoint means while you run the target executable, the location it would stop to let you observed the state of the process. Let's set our first breakpoint to know how it works. Type `b main` and enter. Then run `breakpoint list` to ensure you create a breakpoint. Now, type `run Danny` to see what happened, in my computer, it shows:

```
(lldb) run Danny
Process 63370 launched: '/Users/dannypsnl/workspace/dannypsnl/lldb/a.out' (x86_64)
Process 63370 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x0000000100000f16 a.out`main(argc=2, argv=0x00007ffeefbff138) at main.c:4
   1    #include <stdio.h>
   2
   3    int main(int argc, char **argv) {
-> 4      if (argc < 1)
   5        return 1;
   6      printf("hello, %s\n", argv[1]);
   7      int print_me = 10;
Target 0: (a.out) stopped.
```

The process stops at the entry of the main function. LLDB allows you to dump frame to know the state of the process, the command is `fr v`, it's a short command of `frame variable`, you would see:

```
(lldb) frame variable
(int) argc = 2
(char **) argv = 0x00007ffeefbff138
(int) print_me = 0
```

And you also could show a certain variable, for example:

```
(lldb) print argc
(int) $0 = 2
```

But if you want to know the value of a variable by different inputs, type `print` to get it seems not so good, for this situation, you could use `display` to replace it, `display` just work as `print`, but it would be triggered automatically so you don't have to afraid you forgot to show some information. By the way, `print` supports high-level expression, e.g.:

```
(lldb) print argv[1]
(char *) $9 = 0x00007ffeefbff358 "Danny"
```

Now, we know a lot about how to get the state of the process, but don't forget we still at the first breakpoint, we need to know how to move to forward. The commands for this are `step` and `continue`, the difference between them was `step` would move one instruction(as small as possible), and `continue` would move to next breakpoint. And the shortcut of them are `s` and `c`, you can have a try to feel the difference.

About breakpoint, we have more ways to set a breakpoint, we use function name to set one, we also can use the location to set one, e.g.

```
(lldb) breakpoint set -l 7
```

This would add a breakpoint at line 7, and we can use `breakpoint delete <breakpoint-index>` to remove them.

To get more information, you should take a look at [https://lldb.llvm.org/tutorial.html](https://lldb.llvm.org/tutorial.html), thanks for reading.
