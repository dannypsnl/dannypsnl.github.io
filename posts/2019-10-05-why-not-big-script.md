---
title: "Why not a big script"
categories:
  - cs
tags:
  - shell
---

I believe no one likes a big script, and I don’t like it either.

A big script means a buggy script.

A big script can cause no one can understand it.

For example, a command `apt-get install x` stands for what? When it in a thousand lines script?

Last time I see the code is for a build process at 500+ lines later.

Why happened? In any programming language, put a variable close to its usage is a vital thing. WHY WE DONT DO THAT IN THE SCRIPT?

And sometimes, remove somethings from a script is hard. Sorry, I'm lying; that's always hard.

Because we even do not know why that code exists.

Okay, I know we can write comments. However, every month, I can find something already outdated in our script. Although we cared about that content is outdated or not. But it still happened.

So we can't remove them so comfortable.

A script leads to a complex combination of commands. Everyone write complicated command chain. I think everyone knows; the code can't show the whole line on the screen; it is hard to read. When it with a complex text converting trick, damn.

We already know a big script is: not understandable, hard to debug, can't read.

Well, what can we do?

BEST: We do not write a big script!

But, if already there?

We have to try to reduce it. Replace the shell script with any other mainstream languages is a good idea because they have a better design than the shell script. Trying to use an excellent cross-platform build system and always invoke it is also one way, and they usually have a nice DSL or Python :).

### Conclusion

- Don't write a big script
- If already have one, try to use others tool to replace it
