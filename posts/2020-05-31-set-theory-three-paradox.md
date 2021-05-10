---
title: "NOTE: 樸素集合論三大悖論"
categories:
  - math
tags:
  - note
  - set theory
  - paradox
  - type theory
---

樸素集合論([Naive set theory](https://en.wikipedia.org/wiki/Naive_set_theory))只有兩條公理：

- 外延公理(axiom of extensionality)：給定兩集合 $A, B$，若 $\forall x, x \in A, x \in B$，$A = B$
- 概括公理(axiom of unrestricted comprehension)：對任何描述 $x$ 的 $\varphi (x)$，存在集合 $S$ 使 $a \in S$ 若且唯若 $\varphi (a)$ 成立

> a 若且唯若 b： 命題 a b 只能同時成立或同時不成立時用「若且唯若」

概括公理使我們可以以描述的方式構造集合，例如「$x$ 是人」，對應到人類這個集合。或是更小的集合「$x$ 是活人」。但這個公理也因此成為引發悖論的源頭(paradox)。

1. [羅素悖論(Russell's paradox)](https://en.wikipedia.org/wiki/Russell%27s_paradox)：定義集合 $Ru = \{x : x \notin x\}$，即所有不包含自己的集合 $x$。但問題就在 $Ru$ 也是集合，假設 $Ru$ 包含自己，那麼集合的定義就不正確；然而若 $Ru$ 不包含自己，那 $Ru$ 就沒有包含到**所有**不包含自己的集合。所以引發矛盾：$Ru$ 必須包含又不包含自己。這就是羅素悖論。
2. [康托悖論(Cantor's paradox)](https://en.wikipedia.org/wiki/Cantor%27s_paradox)：根據康托定理，任何集合 $S$ 的[冪集(Power set)](https://en.wikipedia.org/wiki/Power_set) ${\mathcal{P}}(S)$之基數(cardinal number)都比 $S$ 的基數大。但集合 $V = \{x : x = x\}$，即所有集合的集合(任何集合 $x$ 都跟自己相等)，其冪集中所有元素都和 $V$ 元素一一對應，與康托定理矛盾。
3. [布拉利-科提悖論(Burali-Forti paradox)](https://en.wikipedia.org/wiki/Burali-Forti_paradox)：令 $\Omega$ 為所有[序數(Von Neumann ordinal number)](https://en.wikipedia.org/wiki/Ordinal_number#Von_Neumann_definition_of_ordinals)之集合。對所有 $x \in \Omega$ 及所有 $y \in x$，$y \in \Omega$，因為序數只含有序數為元素，此為序數之定義。那麼 $\Omega$ 自身應該也是序數，換句話說 $\Omega \in \Omega$，然而序數元素小於其集合，對序數 $x, y$ 而言 $y \in x$ 就是 $y < x$，也就是說 $\Omega < \Omega$，但序數沒辦法小於自己，這裡就引入了矛盾命題 $\Omega < \Omega \land \neg (\Omega < \Omega)$。

這三個悖論都源於概括公理使得涉及自我描述的集合存在，而公理化集合論的目的就在於限制公理以避免矛盾，如 [ZFC](https://en.wikipedia.org/wiki/Zermelo%E2%80%93Fraenkel_set_theory) 等成果。甚至更進一步利用矛盾進行歸謬証明來證明某些集合不存在。另外 type theory 中的 inductive, coinductive 等構造主義的存在也必須設法證明自己不存在自我指涉，或是存在自我指涉但保證自身的 totality，例如 coinductive 的 guardedness 性。[MLTT](https://en.wikipedia.org/wiki/Intuitionistic_type_theory) 中的階層宇宙就涉及了怎麼避免集合對集合的指涉，因為含有 n 集合的集合必須是 n+1 的集合，但之前 ice1000 大大指出了用 coinductive 構造而成的階層宇宙必須額外再避開 coinductive 造成的自我參照導致階層推導不確定。希望最近可以把 miniTT 看完？今天都在發廢文 xd。
