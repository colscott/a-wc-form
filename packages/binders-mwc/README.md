# a-wc-form-binder material web component binders

```cmd
npm i -save a-wc-form-binder-material
```

Form binders

```js
import { controlBinder as binder } from "a-wc-form-binder";

// import Material Web Component control binders
import { controlBinder as binders } 'a-wc-form-binder-material';

// add the binders
binder.add(...Object.values(binders));

```

Form layout templates are included and registered when you import form binder material

```js
import 'a-wc-form-binder-material';
```

For styling and customizing the Material Web Component see the [mwc documentation](https://github.com/material-components/material-components-web-components)