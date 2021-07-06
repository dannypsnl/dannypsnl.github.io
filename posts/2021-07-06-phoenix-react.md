---
title: "Phoenix and React"
date: "Tue Jul  6 15:08:18 UTC 2021"
categories:
  - cs
tags:
  - elixir
  - phoenix
  - react
---

Phoenix is a great framework, but sometimes we don't want to use frontend framework like React. In this article, you will learn how to use them together. First, we create a project with the following commands.

```shell
mix phx.new withrreact --no-ecto
cd withreact/assets
npm i react react-dom @babel/preset-react remount
```

Edit `withreact/assets/.babelrc`

```
{
    "presets": [
        "@babel/preset-env",
        "@babel/preset-react"
    ]
}
```

Create `withreact/assets/js/src/app.js`

```js
import React from "react"
import { define } from "remount"

const Test = () => <h1> Hello World </h1>

define({ "x-app": Test })
```

Edit `withreact/assets/js/app.js`

```js
import "../css/app.scss"

import "phoenix_html"

import "./src/app.js"
```

Finally, replace all in `withreact/lib/withreact_web/templates/page/index.html.eex` with the following content

```html
<x-app></x-app>
```

Now, we can develop with React and Phoenix together.
