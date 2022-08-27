[![npm version](https://badge.fury.io/js/@mahaljs%2Frouter.svg)](https://badge.fury.io/js/mahal-router)
[![TEST](https://github.com/ujjwalguptaofficial/mahal-router/actions/workflows/test.yml/badge.svg)](https://github.com/ujjwalguptaofficial/mahal-router/actions/workflows/test.yml)

# mahal-router

Official router plugin for [Mahal framework](https://github.com/ujjwalguptaofficial/mahal)

# Install

```
npm i @mahaljs/router
```

# Setup

```
import { Timer, Mahal } from "mahal";
import Root from "./components/root.mahal";
import { RouterPlugin, Router } from "@mahaljs/router";
import { routes } from "./routes";

const router = new Router(routes, {
    mode: "history"
});

const app = new Mahal(Root, '#app');
// add router as plugin
app.extend.plugin(RouterPlugin, router);

app.create();

```

# Docs

https://mahaljs.com/docs/router/

