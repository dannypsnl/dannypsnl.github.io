---
title: Subtype
date: 2025-02-19
tags:
  - agda
---

<details>
  <summary>misc</summary>

<pre class="Agda"><a id="102" class="Symbol">{-#</a> <a id="106" class="Keyword">OPTIONS</a> <a id="114" class="Pragma">--cubical</a> <a id="124" class="Symbol">#-}</a>
<a id="128" class="Keyword">module</a> <a id="135" href="agda.subtype.html" class="Module">agda.subtype</a> <a id="148" class="Keyword">where</a>
<a id="154" class="Keyword">open</a> <a id="159" class="Keyword">import</a> <a id="166" href="Agda.Primitive.html" class="Module">Agda.Primitive</a>
<a id="181" class="Keyword">open</a> <a id="186" class="Keyword">import</a> <a id="193" href="Cubical.Foundations.Prelude.html" class="Module">Cubical.Foundations.Prelude</a>
</pre>
</details>

<pre class="Agda"><a id="242" class="Keyword">record</a> <a id="Subtype"></a><a id="249" href="agda.subtype.html#249" class="Record">Subtype</a> <a id="257" class="Symbol">{</a><a id="258" href="agda.subtype.html#258" class="Bound">ℓ</a> <a id="260" href="agda.subtype.html#260" class="Bound">ℓ&#39;</a><a id="262" class="Symbol">}</a> <a id="264" class="Symbol">{</a><a id="265" href="agda.subtype.html#265" class="Bound">A</a> <a id="267" class="Symbol">:</a> <a id="269" href="Agda.Primitive.html#388" class="Primitive">Type</a> <a id="274" href="agda.subtype.html#258" class="Bound">ℓ</a><a id="275" class="Symbol">}</a> <a id="277" class="Symbol">(</a><a id="278" href="agda.subtype.html#278" class="Bound">P</a> <a id="280" class="Symbol">:</a> <a id="282" href="agda.subtype.html#265" class="Bound">A</a> <a id="284" class="Symbol">→</a> <a id="286" href="Agda.Primitive.html#388" class="Primitive">Type</a> <a id="291" href="agda.subtype.html#260" class="Bound">ℓ&#39;</a><a id="293" class="Symbol">)</a> <a id="295" class="Symbol">:</a> <a id="297" href="Agda.Primitive.html#388" class="Primitive">Type</a> <a id="302" class="Symbol">(</a><a id="303" href="agda.subtype.html#258" class="Bound">ℓ</a> <a id="305" href="Agda.Primitive.html#961" class="Primitive Operator">⊔</a> <a id="307" href="agda.subtype.html#260" class="Bound">ℓ&#39;</a><a id="309" class="Symbol">)</a> <a id="311" class="Keyword">where</a>
  <a id="319" class="Keyword">field</a>
    <a id="Subtype.a"></a><a id="329" href="agda.subtype.html#329" class="Field">a</a> <a id="331" class="Symbol">:</a> <a id="333" href="agda.subtype.html#265" class="Bound">A</a>
    <a id="Subtype.prop"></a><a id="339" href="agda.subtype.html#339" class="Field">prop</a> <a id="344" class="Symbol">:</a> <a id="346" href="agda.subtype.html#278" class="Bound">P</a> <a id="348" href="agda.subtype.html#329" class="Field">a</a>
</pre>
# Example

<pre class="Agda"><a id="370" class="Keyword">open</a> <a id="375" class="Keyword">import</a> <a id="382" href="Cubical.Data.Nat.html" class="Module">Cubical.Data.Nat</a>
<a id="399" class="Keyword">open</a> <a id="404" class="Keyword">import</a> <a id="411" href="Cubical.Data.Nat.Order.html" class="Module">Cubical.Data.Nat.Order</a>

<a id="m"></a><a id="435" href="agda.subtype.html#435" class="Function">m</a> <a id="437" class="Symbol">:</a> <a id="439" href="agda.subtype.html#249" class="Record">Subtype</a> <a id="447" class="Symbol">(λ</a> <a id="450" class="Symbol">(</a><a id="451" href="agda.subtype.html#451" class="Bound">x</a> <a id="453" class="Symbol">:</a> <a id="455" href="Agda.Builtin.Nat.html#203" class="Datatype">ℕ</a><a id="456" class="Symbol">)</a> <a id="458" class="Symbol">→</a> <a id="460" class="Number">1</a> <a id="462" href="Cubical.Data.Nat.Order.html#518" class="Function Operator">≤</a> <a id="464" href="agda.subtype.html#451" class="Bound">x</a><a id="465" class="Symbol">)</a>
<a id="467" href="agda.subtype.html#435" class="Function">m</a> <a id="469" class="Symbol">=</a> <a id="471" class="Keyword">record</a> <a id="478" class="Symbol">{</a> <a id="480" href="agda.subtype.html#329" class="Field">a</a> <a id="482" class="Symbol">=</a> <a id="484" class="Number">10</a><a id="486" class="Symbol">;</a> <a id="488" href="agda.subtype.html#339" class="Field">prop</a> <a id="493" class="Symbol">=</a> <a id="495" href="Cubical.Data.Nat.Order.html#1124" class="Function">suc-≤-suc</a> <a id="505" href="Cubical.Data.Nat.Order.html#1082" class="Function">zero-≤</a> <a id="512" class="Symbol">}</a>
</pre>