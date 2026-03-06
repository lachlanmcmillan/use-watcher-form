# use-watcher-form

A React form library built on `use-watcher-map`. Inputs are **uncontrolled by default** — typing does not trigger rerenders. Reactivity is opt-in via watcher subscriptions.

## Key Mental Model

- **`getPath("field")`** = read value, no rerender subscription
- **`usePath("field")`** = read value + subscribe to rerenders
- **`getState()`** / **`useState()`** = same pattern for entire state object
- The **`key` prop** pattern forces React to remount uncontrolled inputs when values change programmatically:
  ```tsx
  const { error, key, ...props } = useField("email");
  return <input key={key} {...props} />;
  ```

## Architecture

```
useWatcherForm()        → creates form instance with WatcherMap containers
WatcherFormProvider     → React context provider, wraps children
useWatcherFormCtx()     → access form from context (any descendant)
useField(path)          → uncontrolled field helper (defaultValue + key)
useControlledField(path)→ controlled field helper (value, rerenders on change)
```

### Watcher containers on the form object:
| Property       | Type                          | Purpose                          |
|---------------|-------------------------------|----------------------------------|
| `values`      | `WatcherMap<Partial<T>>`      | Current form values              |
| `changes`     | `WatcherMap<Partial<T>>`      | Only the changed fields          |
| `errors`      | `WatcherMap<PRecordErrors<T>>`| Validation errors per field      |
| `keys`        | `WatcherMap<PRecord<T, number>>`| Rerender keys per field        |
| `touched`     | `WatcherMap<PRecord<T, boolean>>`| Which fields have been focused |
| `isSubmitting` | `WatcherPrimitive<boolean>`  | Submission in progress           |
| `formKey`     | `WatcherPrimitive<number>`    | Incremented on reset w/ forceRender |

## File Map

- `src/useWatcherForm.tsx` — main hook, form logic, WatcherForm/WatcherFormProps interfaces
- `src/useField.tsx` — `useField` and `useControlledField` hooks
- `src/WatcherFormProvider.tsx` — context provider component
- `src/WatcherFormCtx.tsx` — React context and `useWatcherFormCtx` hook
- `src/types.ts` — `PRecord`, `PRecordErrors`, `ValidationResult` types
- `src/WatcherFormDebugger.tsx` — debug overlay (ctrl+/)
- `src/index.ts` — public exports

## Commands

```bash
bun test          # run tests
bun run build     # build to dist/
bun run dev       # dev server (example app)
bun run format    # prettier
```
