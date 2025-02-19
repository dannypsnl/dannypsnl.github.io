---
title: De Bruijn indices
date: 2025-02-14
tags:
  - cs
  - agda
  - lambda calculus
---

<details>
  <summary>misc</summary>

<pre class="Agda"><a id="139" class="Symbol">{-#</a> <a id="143" class="Keyword">OPTIONS</a> <a id="151" class="Pragma">--cubical</a> <a id="161" class="Symbol">#-}</a>
<a id="165" class="Keyword">module</a> <a id="172" href="agda.dbi.html" class="Module">agda.dbi</a> <a id="181" class="Keyword">where</a>
<a id="187" class="Keyword">open</a> <a id="192" class="Keyword">import</a> <a id="199" href="Cubical.Foundations.Prelude.html" class="Module">Cubical.Foundations.Prelude</a>
<a id="227" class="Keyword">open</a> <a id="232" class="Keyword">import</a> <a id="239" href="Cubical.Data.Nat.html" class="Module">Cubical.Data.Nat</a>
</pre>
</details>

<pre class="Agda"><a id="281" class="Keyword">data</a> <a id="Term"></a><a id="286" href="agda.dbi.html#286" class="Datatype">Term</a> <a id="291" class="Symbol">:</a> <a id="293" href="Agda.Primitive.html#388" class="Primitive">Set</a> <a id="297" class="Keyword">where</a>
  <a id="Term.var"></a><a id="305" href="agda.dbi.html#305" class="InductiveConstructor">var</a> <a id="309" class="Symbol">:</a> <a id="311" href="Agda.Builtin.Nat.html#203" class="Datatype">ℕ</a> <a id="313" class="Symbol">→</a> <a id="315" href="agda.dbi.html#286" class="Datatype">Term</a>
  <a id="Term.lam"></a><a id="322" href="agda.dbi.html#322" class="InductiveConstructor">lam</a> <a id="326" class="Symbol">:</a> <a id="328" href="agda.dbi.html#286" class="Datatype">Term</a> <a id="333" class="Symbol">→</a> <a id="335" href="agda.dbi.html#286" class="Datatype">Term</a>
  <a id="Term.app"></a><a id="342" href="agda.dbi.html#342" class="InductiveConstructor">app</a> <a id="346" class="Symbol">:</a> <a id="348" href="agda.dbi.html#286" class="Datatype">Term</a> <a id="353" class="Symbol">→</a> <a id="355" href="agda.dbi.html#286" class="Datatype">Term</a> <a id="360" class="Symbol">→</a> <a id="362" href="agda.dbi.html#286" class="Datatype">Term</a>

<a id="example₁"></a><a id="368" href="agda.dbi.html#368" class="Function">example₁</a> <a id="377" class="Symbol">:</a> <a id="379" href="agda.dbi.html#286" class="Datatype">Term</a>
<a id="384" href="agda.dbi.html#368" class="Function">example₁</a> <a id="393" class="Symbol">=</a> <a id="395" href="agda.dbi.html#322" class="InductiveConstructor">lam</a> <a id="399" class="Comment">{-x-}</a> <a id="405" class="Symbol">(</a><a id="406" href="agda.dbi.html#322" class="InductiveConstructor">lam</a> <a id="410" class="Comment">{-y-}</a> <a id="416" class="Symbol">(</a><a id="417" href="agda.dbi.html#342" class="InductiveConstructor">app</a> <a id="421" class="Symbol">(</a><a id="422" href="agda.dbi.html#305" class="InductiveConstructor">var</a> <a id="426" class="Comment">{-x-}</a> <a id="432" class="Number">1</a><a id="433" class="Symbol">)</a> <a id="435" class="Symbol">(</a><a id="436" href="agda.dbi.html#305" class="InductiveConstructor">var</a> <a id="440" class="Comment">{-y-}</a> <a id="446" class="Number">0</a><a id="447" class="Symbol">)))</a>
</pre>