# a-wc-form-binders-mwc

Material Web Component binders for [form-binder](https://github.com/colscott/a-wc-form/tree/master/packages/binder)

```cmd
npm i -save a-wc-form-binders-mwc
```

## Usage

```js
import { binderRegistry } from "a-wc-form-binder";

// import Material Web Component control binders
import { binders } 'a-wc-form-binders-mwc';

// add the binders
binderRegistry.add(...Object.values(binders));

```

See [form-binder](https://github.com/colscott/a-wc-form/tree/master/packages/binder) for more information.

Form layout templates (for use with [a-wc-form-layout](https://github.com/colscott/a-wc-form/tree/master/packages/layout)) are included and registered when you import form binder material

```js
import 'a-wc-form-binders-mwc';
```

For styling and customizing the Material Web Component see the [mwc documentation](https://github.com/material-components/material-components-web-components)