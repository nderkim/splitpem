# splitpem

Search string for PEM and return in array.

```js
const splitpem = require('@nderkim/splitpem');
```

```js
const pem = await promisify(fs.readFile)(path, 'utf8');
const certs = splitpem(pem);
```

```
splitpem :: string -> Array<string>
```
