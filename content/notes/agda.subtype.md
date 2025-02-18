---
title: Subtype
tags:
  - agda
---

<details>
  <summary>misc</summary>

<pre class="Agda"><a id="85" class="Symbol">{-#</a> <a id="89" class="Keyword">OPTIONS</a> <a id="97" class="Pragma">--cubical</a> <a id="107" class="Symbol">#-}</a>
<a id="111" class="Keyword">module</a> <a id="118" href="agda.subtype.html" class="Module">agda.subtype</a> <a id="131" class="Keyword">where</a>
<a id="137" class="Keyword">open</a> <a id="142" class="Keyword">import</a> <a id="149" href="Agda.Primitive.html" class="Module">Agda.Primitive</a>
<a id="164" class="Keyword">open</a> <a id="169" class="Keyword">import</a> <a id="176" href="Cubical.Foundations.Prelude.html" class="Module">Cubical.Foundations.Prelude</a>
</pre>
</details>

<pre class="Agda"><a id="225" class="Keyword">record</a> <a id="Subtype"></a><a id="232" href="agda.subtype.html#232" class="Record">Subtype</a> <a id="240" class="Symbol">{</a><a id="241" href="agda.subtype.html#241" class="Bound">ℓ</a> <a id="243" href="agda.subtype.html#243" class="Bound">ℓ&#39;</a><a id="245" class="Symbol">}</a> <a id="247" class="Symbol">{</a><a id="248" href="agda.subtype.html#248" class="Bound">A</a> <a id="250" class="Symbol">:</a> <a id="252" href="Agda.Primitive.html#388" class="Primitive">Type</a> <a id="257" href="agda.subtype.html#241" class="Bound">ℓ</a><a id="258" class="Symbol">}</a> <a id="260" class="Symbol">(</a><a id="261" href="agda.subtype.html#261" class="Bound">P</a> <a id="263" class="Symbol">:</a> <a id="265" href="agda.subtype.html#248" class="Bound">A</a> <a id="267" class="Symbol">→</a> <a id="269" href="Agda.Primitive.html#388" class="Primitive">Type</a> <a id="274" href="agda.subtype.html#243" class="Bound">ℓ&#39;</a><a id="276" class="Symbol">)</a> <a id="278" class="Symbol">:</a> <a id="280" href="Agda.Primitive.html#388" class="Primitive">Type</a> <a id="285" class="Symbol">(</a><a id="286" href="agda.subtype.html#241" class="Bound">ℓ</a> <a id="288" href="Agda.Primitive.html#961" class="Primitive Operator">⊔</a> <a id="290" href="agda.subtype.html#243" class="Bound">ℓ&#39;</a><a id="292" class="Symbol">)</a> <a id="294" class="Keyword">where</a>
  <a id="302" class="Keyword">field</a>
    <a id="Subtype.a"></a><a id="312" href="agda.subtype.html#312" class="Field">a</a> <a id="314" class="Symbol">:</a> <a id="316" href="agda.subtype.html#248" class="Bound">A</a>
    <a id="Subtype.prop"></a><a id="322" href="agda.subtype.html#322" class="Field">prop</a> <a id="327" class="Symbol">:</a> <a id="329" href="agda.subtype.html#261" class="Bound">P</a> <a id="331" href="agda.subtype.html#312" class="Field">a</a>
</pre>
# Example

<pre class="Agda"><a id="353" class="Keyword">open</a> <a id="358" class="Keyword">import</a> <a id="365" href="Cubical.Data.Nat.html" class="Module">Cubical.Data.Nat</a>
<a id="382" class="Keyword">open</a> <a id="387" class="Keyword">import</a> <a id="394" href="Cubical.Data.Nat.Order.html" class="Module">Cubical.Data.Nat.Order</a>

<a id="m"></a><a id="418" href="agda.subtype.html#418" class="Function">m</a> <a id="420" class="Symbol">:</a> <a id="422" href="agda.subtype.html#232" class="Record">Subtype</a> <a id="430" class="Symbol">(λ</a> <a id="433" class="Symbol">(</a><a id="434" href="agda.subtype.html#434" class="Bound">x</a> <a id="436" class="Symbol">:</a> <a id="438" href="Agda.Builtin.Nat.html#203" class="Datatype">ℕ</a><a id="439" class="Symbol">)</a> <a id="441" class="Symbol">→</a> <a id="443" class="Number">1</a> <a id="445" href="Cubical.Data.Nat.Order.html#518" class="Function Operator">≤</a> <a id="447" href="agda.subtype.html#434" class="Bound">x</a><a id="448" class="Symbol">)</a>
<a id="450" href="agda.subtype.html#418" class="Function">m</a> <a id="452" class="Symbol">=</a> <a id="454" class="Keyword">record</a> <a id="461" class="Symbol">{</a> <a id="463" href="agda.subtype.html#312" class="Field">a</a> <a id="465" class="Symbol">=</a> <a id="467" class="Number">10</a><a id="469" class="Symbol">;</a> <a id="471" href="agda.subtype.html#322" class="Field">prop</a> <a id="476" class="Symbol">=</a> <a id="478" href="Cubical.Data.Nat.Order.html#1124" class="Function">suc-≤-suc</a> <a id="488" href="Cubical.Data.Nat.Order.html#1082" class="Function">zero-≤</a> <a id="495" class="Symbol">}</a>
</pre>