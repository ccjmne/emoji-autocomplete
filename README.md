# emoji-autocomplete

A Chrome extension allowing you to actually type Emoji directly into any `<textarea />` without lifting your hands from your keyboard.

Comes with a lot of customisation options like:
- preferred skin tone
- initiating character sequence
- specific website enabling/disabling (with associated shortcuts) and more.

## Development setup

To start watchers that live-rebuild the extension under the `build` directory as you work:

```shell-script
> npm install && bower install
> npm start
```

Or, alternatively, simply build it once using `gulp dev build`.

## Production build

To generate a minified build:

```shell-script
> gulp build
```
