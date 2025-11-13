# CHANGELOG

## 1.4.0

- Add the `skipChanges` option to setFieldValue.
- Fix function/type/JSDoc comments not being included in typescript types.

## 1.3.1

- Fix validateField when the fieldname was a nested path, 
  eg. valdiateField('a.b.c')

## 1.3.0

- update to use-watcher-map v5.0.0

## 1.2.0

- Add useControlledField hook
- Move the event handler functions into form.getInputEventHandlers

## 1.1.3

- Fix browser form submission when useWatcherForm is used in conjunction
  with a <form> element.

## 1.1.2

- Fix debugger rendering issues by moving it within a portal
- Fix peerDependencies

## 1.1.1

- Fix not-rerendering on initial values change

## 1.1.0

- Add type and comments to useField

## 1.0.1

- Fix the exports

## 1.0.0

- Initial Release
