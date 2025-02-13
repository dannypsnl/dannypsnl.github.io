---
title: De Bruijn indices
tags:
  - cs
  - agda
  - lambda calculus
---

<details>
  <summary>misc</summary>

<pre class="Agda"><a id="122" class="Symbol">{-#</a> <a id="126" class="Keyword">OPTIONS</a> <a id="134" class="Pragma">--cubical</a> <a id="144" class="Symbol">#-}</a>
<a id="148" class="Keyword">module</a> <a id="155" href="agda.dbi.html" class="Module">agda.dbi</a> <a id="164" class="Keyword">where</a>
<a id="170" class="Keyword">open</a> <a id="175" class="Keyword">import</a> <a id="182" href="Cubical.Foundations.Prelude.html" class="Module">Cubical.Foundations.Prelude</a>
<a id="210" class="Keyword">open</a> <a id="215" class="Keyword">import</a> <a id="222" href="Cubical.Data.Nat.html" class="Module">Cubical.Data.Nat</a>
</pre>
</details>

<pre class="Agda"><a id="264" class="Keyword">data</a> <a id="Term"></a><a id="269" href="agda.dbi.html#269" class="Datatype">Term</a> <a id="274" class="Symbol">:</a> <a id="276" href="Agda.Primitive.html#388" class="Primitive">Set</a> <a id="280" class="Keyword">where</a>
  <a id="Term.var"></a><a id="288" href="agda.dbi.html#288" class="InductiveConstructor">var</a> <a id="292" class="Symbol">:</a> <a id="294" href="Agda.Builtin.Nat.html#203" class="Datatype">ℕ</a> <a id="296" class="Symbol">→</a> <a id="298" href="agda.dbi.html#269" class="Datatype">Term</a>
  <a id="Term.lam"></a><a id="305" href="agda.dbi.html#305" class="InductiveConstructor">lam</a> <a id="309" class="Symbol">:</a> <a id="311" href="agda.dbi.html#269" class="Datatype">Term</a> <a id="316" class="Symbol">→</a> <a id="318" href="agda.dbi.html#269" class="Datatype">Term</a>
  <a id="Term.app"></a><a id="325" href="agda.dbi.html#325" class="InductiveConstructor">app</a> <a id="329" class="Symbol">:</a> <a id="331" href="agda.dbi.html#269" class="Datatype">Term</a> <a id="336" class="Symbol">→</a> <a id="338" href="agda.dbi.html#269" class="Datatype">Term</a> <a id="343" class="Symbol">→</a> <a id="345" href="agda.dbi.html#269" class="Datatype">Term</a>

<a id="example₁"></a><a id="351" href="agda.dbi.html#351" class="Function">example₁</a> <a id="360" class="Symbol">:</a> <a id="362" href="agda.dbi.html#269" class="Datatype">Term</a>
<a id="367" href="agda.dbi.html#351" class="Function">example₁</a> <a id="376" class="Symbol">=</a> <a id="378" href="agda.dbi.html#305" class="InductiveConstructor">lam</a> <a id="382" class="Comment">{-x-}</a> <a id="388" class="Symbol">(</a><a id="389" href="agda.dbi.html#305" class="InductiveConstructor">lam</a> <a id="393" class="Comment">{-y-}</a> <a id="399" class="Symbol">(</a><a id="400" href="agda.dbi.html#325" class="InductiveConstructor">app</a> <a id="404" class="Symbol">(</a><a id="405" href="agda.dbi.html#288" class="InductiveConstructor">var</a> <a id="409" class="Comment">{-x-}</a> <a id="415" class="Number">1</a><a id="416" class="Symbol">)</a> <a id="418" class="Symbol">(</a><a id="419" href="agda.dbi.html#288" class="InductiveConstructor">var</a> <a id="423" class="Comment">{-y-}</a> <a id="429" class="Number">0</a><a id="430" class="Symbol">)))</a>
</pre>