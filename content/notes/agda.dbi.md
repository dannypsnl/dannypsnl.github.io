---
title: De Bruijn indices
tags:
  - agda
  - lambda calculus
---

<details>
  <summary>misc</summary>

<pre class="Agda"><a id="115" class="Symbol">{-#</a> <a id="119" class="Keyword">OPTIONS</a> <a id="127" class="Pragma">--cubical</a> <a id="137" class="Symbol">#-}</a>
<a id="141" class="Keyword">module</a> <a id="148" href="agda.dbi.html" class="Module">agda.dbi</a> <a id="157" class="Keyword">where</a>
<a id="163" class="Keyword">open</a> <a id="168" class="Keyword">import</a> <a id="175" href="Cubical.Foundations.Prelude.html" class="Module">Cubical.Foundations.Prelude</a>
<a id="203" class="Keyword">open</a> <a id="208" class="Keyword">import</a> <a id="215" href="Cubical.Data.Nat.html" class="Module">Cubical.Data.Nat</a>
</pre>
</details>

<pre class="Agda"><a id="257" class="Keyword">data</a> <a id="Term"></a><a id="262" href="agda.dbi.html#262" class="Datatype">Term</a> <a id="267" class="Symbol">:</a> <a id="269" href="Agda.Primitive.html#388" class="Primitive">Set</a> <a id="273" class="Keyword">where</a>
  <a id="Term.var"></a><a id="281" href="agda.dbi.html#281" class="InductiveConstructor">var</a> <a id="285" class="Symbol">:</a> <a id="287" href="Agda.Builtin.Nat.html#203" class="Datatype">ℕ</a> <a id="289" class="Symbol">→</a> <a id="291" href="agda.dbi.html#262" class="Datatype">Term</a>
  <a id="Term.lam"></a><a id="298" href="agda.dbi.html#298" class="InductiveConstructor">lam</a> <a id="302" class="Symbol">:</a> <a id="304" href="agda.dbi.html#262" class="Datatype">Term</a> <a id="309" class="Symbol">→</a> <a id="311" href="agda.dbi.html#262" class="Datatype">Term</a>
  <a id="Term.app"></a><a id="318" href="agda.dbi.html#318" class="InductiveConstructor">app</a> <a id="322" class="Symbol">:</a> <a id="324" href="agda.dbi.html#262" class="Datatype">Term</a> <a id="329" class="Symbol">→</a> <a id="331" href="agda.dbi.html#262" class="Datatype">Term</a> <a id="336" class="Symbol">→</a> <a id="338" href="agda.dbi.html#262" class="Datatype">Term</a>

<a id="example₁"></a><a id="344" href="agda.dbi.html#344" class="Function">example₁</a> <a id="353" class="Symbol">:</a> <a id="355" href="agda.dbi.html#262" class="Datatype">Term</a>
<a id="360" href="agda.dbi.html#344" class="Function">example₁</a> <a id="369" class="Symbol">=</a> <a id="371" href="agda.dbi.html#298" class="InductiveConstructor">lam</a> <a id="375" class="Comment">{-x-}</a> <a id="381" class="Symbol">(</a><a id="382" href="agda.dbi.html#298" class="InductiveConstructor">lam</a> <a id="386" class="Comment">{-y-}</a> <a id="392" class="Symbol">(</a><a id="393" href="agda.dbi.html#318" class="InductiveConstructor">app</a> <a id="397" class="Symbol">(</a><a id="398" href="agda.dbi.html#281" class="InductiveConstructor">var</a> <a id="402" class="Comment">{-x-}</a> <a id="408" class="Number">1</a><a id="409" class="Symbol">)</a> <a id="411" class="Symbol">(</a><a id="412" href="agda.dbi.html#281" class="InductiveConstructor">var</a> <a id="416" class="Comment">{-y-}</a> <a id="422" class="Number">0</a><a id="423" class="Symbol">)))</a>
</pre>