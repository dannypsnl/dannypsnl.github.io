---
title: Dependent Pattern matching
date: 2025-03-08
tags:
  - cs
  - agda
  - pattern matching
---

<details>
  <summary>misc</summary>

<pre class="Agda"><a id="149" class="Symbol">{-#</a> <a id="153" class="Keyword">OPTIONS</a> <a id="161" class="Pragma">--cubical</a> <a id="171" class="Symbol">#-}</a>
<a id="175" class="Keyword">module</a> <a id="182" href="agda.so.html" class="Module">agda.so</a> <a id="190" class="Keyword">where</a>
<a id="196" class="Keyword">open</a> <a id="201" class="Keyword">import</a> <a id="208" href="Cubical.Foundations.Prelude.html" class="Module">Cubical.Foundations.Prelude</a>
<a id="236" class="Keyword">open</a> <a id="241" class="Keyword">import</a> <a id="248" href="Cubical.Data.Bool.html" class="Module">Cubical.Data.Bool</a>
</pre>
</details>

<pre class="Agda"><a id="291" class="Keyword">data</a> <a id="So"></a><a id="296" href="agda.so.html#296" class="Datatype">So</a> <a id="299" class="Symbol">:</a> <a id="301" href="Agda.Builtin.Bool.html#173" class="Datatype">Bool</a> <a id="306" class="Symbol">→</a> <a id="308" href="Agda.Primitive.html#388" class="Primitive">Type</a> <a id="313" class="Keyword">where</a>
  <a id="So.oh"></a><a id="321" href="agda.so.html#321" class="InductiveConstructor">oh</a> <a id="324" class="Symbol">:</a> <a id="326" href="agda.so.html#296" class="Datatype">So</a> <a id="329" href="Agda.Builtin.Bool.html#198" class="InductiveConstructor">true</a>
  <a id="So.ho"></a><a id="336" href="agda.so.html#336" class="InductiveConstructor">ho</a> <a id="339" class="Symbol">:</a> <a id="341" href="agda.so.html#296" class="Datatype">So</a> <a id="344" href="Agda.Builtin.Bool.html#192" class="InductiveConstructor">false</a>
</pre>
<pre class="Agda"><a id="xxx"></a><a id="363" href="agda.so.html#363" class="Function">xxx</a> <a id="367" class="Symbol">:</a> <a id="369" class="Symbol">{</a><a id="370" href="agda.so.html#370" class="Bound">b</a> <a id="372" class="Symbol">:</a> <a id="374" href="Agda.Builtin.Bool.html#173" class="Datatype">Bool</a><a id="378" class="Symbol">}</a> <a id="380" class="Symbol">→</a> <a id="382" href="agda.so.html#296" class="Datatype">So</a> <a id="385" href="agda.so.html#370" class="Bound">b</a> <a id="387" class="Symbol">→</a> <a id="389" href="Agda.Builtin.Bool.html#173" class="Datatype">Bool</a>
<a id="394" href="agda.so.html#363" class="Function">xxx</a> <a id="398" class="Symbol">{</a><a id="399" href="agda.so.html#399" class="Bound">b</a><a id="400" class="Symbol">}</a> <a id="402" href="agda.so.html#321" class="InductiveConstructor">oh</a> <a id="405" class="Symbol">=</a> <a id="407" href="agda.so.html#399" class="Bound">b</a> <a id="409" class="Comment">-- b is true here</a>
<a id="427" href="agda.so.html#363" class="Function">xxx</a> <a id="431" class="Symbol">{</a><a id="432" href="agda.so.html#432" class="Bound">b</a><a id="433" class="Symbol">}</a> <a id="435" href="agda.so.html#336" class="InductiveConstructor">ho</a> <a id="438" class="Symbol">=</a> <a id="440" href="agda.so.html#432" class="Bound">b</a> <a id="442" class="Comment">-- b is false here</a>
</pre>