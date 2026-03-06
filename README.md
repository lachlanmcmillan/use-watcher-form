# use-watcher-form

A high-performance React form library where inputs are **uncontrolled by default** — typing never causes rerenders. Built on [`use-watcher-map`](https://github.com/lachlanmcmillan/use-watcher-map), it uses a watcher-based reactivity system that lets you subscribe to exactly the data you need.

## Live Examples

[View interactive examples](https://lachlanmcmillan.github.io/use-watcher-form/)

## Install

```bash
npm install use-watcher-form use-watcher-map
```

Requires React 18+ and `use-watcher-map` v5+.

## Quick Start

```tsx
import { useWatcherForm, useField, WatcherFormProvider } from 'use-watcher-form';

type ContactForm = {
  name: string;
  email: string;
};

function ContactPage() {
  const form = useWatcherForm<ContactForm>({
    initialValues: { name: '', email: '' },
    validator: (values) => ({
      name: values.name ? undefined : 'Name is required',
      email: values.email && /\S+@\S+\.\S+/.test(values.email)
        ? undefined
        : 'Valid email is required',
    }),
    onSubmit: async (values, changes) => {
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
  });

  return (
    <WatcherFormProvider form={form}>
      <NameField />
      <EmailField />
      <button type="button" onClick={() => form.submit()}>Submit</button>
    </WatcherFormProvider>
  );
}

function NameField() {
  const { error, key, ...props } = useField('name');
  return (
    <div>
      <input key={key} {...props} type="text" />
      {error && <span>{error}</span>}
    </div>
  );
}

function EmailField() {
  const { error, key, ...props } = useField('email');
  return (
    <div>
      <input key={key} {...props} type="email" />
      {error && <span>{error}</span>}
    </div>
  );
}
```

## Core Concepts

### Uncontrolled by Default

Unlike most form libraries, `use-watcher-form` uses **uncontrolled inputs**. The `useField` hook returns `defaultValue` (not `value`), so React doesn't rerender the component on every keystroke. This gives you native input performance with zero overhead.

### The `key` Prop Pattern

When you programmatically change a value (e.g., via `setFieldValue` or `reset`), uncontrolled inputs won't update their DOM automatically. The `key` prop solves this — it increments whenever the value changes externally, forcing React to remount the input with the new `defaultValue`.

```tsx
const { error, key, ...props } = useField('email');
return <input key={key} {...props} />;
```

**Always spread `key` onto your input element.**

### Watchers: `getPath` vs `usePath`

Every form container (`values`, `errors`, `changes`, `touched`, `keys`) is a `WatcherMap`. You have two ways to read data:

- **`getPath("field")`** — Read without subscribing. The component won't rerender when this value changes. Use this in event handlers and callbacks.
- **`usePath("field")`** — Read and subscribe. The component rerenders when this value changes. Use this in render logic.

The same pattern applies to `getState()` / `useState()` for reading the entire object.

### Context

Wrap your form in `WatcherFormProvider` to make it available to descendant components via `useWatcherFormCtx()`:

```tsx
<WatcherFormProvider form={form}>
  <MyFields />
</WatcherFormProvider>

// In any descendant:
const form = useWatcherFormCtx();
const allValues = form.values.useState();
```

## API Reference

### `useWatcherForm<T>(props): WatcherForm<T>`

The main hook that creates a form instance.

#### `WatcherFormProps<T>`

| Prop | Type | Description |
|------|------|-------------|
| `initialValues` | `Partial<T>` | Initial form values |
| `validator` | `(values: Partial<T>) => PRecordErrors<T>` | Synchronous validation function. Return an object keyed by field name with string error messages, or `undefined`/`null` for valid fields. Supports nested objects matching your data shape. |
| `onSubmit` | `(values: Partial<T>, changes: Partial<T>) => Promise<any>` | Submit handler. Receives all values and only the changed fields. |
| `onValidationErrors` | `(errors: ValidationResult) => void` | Called when submission is blocked by validation errors. |
| `resetOnInitialValuesChange` | `'No' \| 'Always' \| 'OnlyIfClean'` | Whether to reset when `initialValues` prop changes. Default: `'No'`. `'OnlyIfClean'` resets only if no fields have been changed. |
| `debug` | `boolean` | Enable the debug overlay (toggle with Ctrl+/). Default: `true`. |

#### `WatcherForm<T>` — Return Value

**Watcher Containers:**

| Property | Type | Description |
|----------|------|-------------|
| `values` | `WatcherMap<Partial<T>>` | Current form values. Methods: `getPath(path)`, `usePath(path)`, `getState()`, `useState()`, `setPath(path, value)`, `clearPath(path)`, `setState(data)`, `watchState(fn)`, `watchPath(path, fn)`, `batch(fn)` |
| `changes` | `WatcherMap<Partial<T>>` | Only fields that have been modified since init/reset |
| `errors` | `WatcherMap<PRecordErrors<T>>` | Validation error messages per field |
| `keys` | `WatcherMap<PRecord<T, number>>` | Rerender counters per field (used by the `key` prop pattern) |
| `touched` | `WatcherMap<PRecord<T, boolean>>` | Fields that have received focus |
| `isSubmitting` | `WatcherPrimitive<boolean>` | `true` during async submission. Methods: `getState()`, `useState()`, `setState(data)`, `watchState(fn)` |
| `formKey` | `WatcherPrimitive<number>` | Incremented on `reset({ forceRender: true })` |

**Actions:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `submit` | `(e?: any) => Promise<any>` | Validates, then calls `onSubmit`. Prevents duplicate submissions. Calls `e.preventDefault()` if passed an event. |
| `reset` | `(opts?: { newValues?, forceRender? }) => void` | Reset to initial values (or `newValues`). Pass `forceRender: true` to remount uncontrolled inputs. |
| `setFieldValue` | `(path, value, opts?) => void` | Set a single field. Options: `skipValidation`, `skipIncrementKey`, `skipChanges`. |
| `setFieldValues` | `(entries: [path, value][]) => void` | Set multiple fields in a batch. |
| `validateField` | `(path) => string \| undefined` | Validate one field, update errors, return the error. |
| `validateAll` | `() => { errors?, hasErrors }` | Validate all fields. |
| `incrementKey` | `(path) => void` | Force rerender of a specific field. |
| `getInputEventHandlers` | `(path) => { onChange, onFocus, onBlur }` | Get event handlers for a field (used internally by `useField`). |

**Helpers:**

| Property | Type | Description |
|----------|------|-------------|
| `debug` | `boolean` | Whether debug mode is enabled |
| `initialValues` | `Partial<T>` | The initial values snapshot |

---

### `useField(path): Field`

Returns props for an **uncontrolled** input. Must be used inside a `WatcherFormProvider`.

```tsx
const { error, key, ...inputProps } = useField('email');
return <input key={key} {...inputProps} type="email" />;
```

**Returns:**

| Property | Type | Description |
|----------|------|-------------|
| `key` | `number \| undefined` | Spread as `key` on the input to force remount on external changes |
| `error` | `ValidationResult` | Error message for this field (subscribes to changes) |
| `defaultValue` | `any` | Initial value (read once, no subscription) |
| `onChange` | `(e: any) => void` | Change handler — extracts `e.target.value` automatically |
| `onFocus` | `() => void` | Marks field as touched |
| `onBlur` | `() => void` | Triggers validation |
| `data-path` | `string` | The field path (for debugging) |

---

### `useControlledField(path): ControlledField`

Returns props for a **controlled** input. The component rerenders when the value changes.

```tsx
const { error, key, ...inputProps } = useControlledField('status');
return <select key={key} {...inputProps}>{/* options */}</select>;
```

Same as `useField` but returns `value` instead of `defaultValue`.

---

### `WatcherFormProvider`

React context provider component.

```tsx
<WatcherFormProvider form={form}>
  {children}
</WatcherFormProvider>
```

Props: `form: WatcherForm<any>`, `children: React.ReactNode`.

Renders the debug overlay when `form.debug` is `true`.

---

### `useWatcherFormCtx<T>(): WatcherForm<T>`

Access the form instance from context within a `WatcherFormProvider`.

```tsx
const form = useWatcherFormCtx<MyFormData>();
const email = form.values.usePath('email');
```

---

### `WatcherFormDebugger`

Debug overlay component rendered automatically by `WatcherFormProvider` when `debug: true`. Toggle with **Ctrl+/**. Shows live values, changes, and errors.

## WatcherMap Methods

Each watcher container (`values`, `errors`, `changes`, `touched`, `keys`) is a `WatcherMap<T>` with these methods:

| Method | Description |
|--------|-------------|
| `getPath(path)` | Read value at dot-notation path. No rerender subscription. |
| `usePath(path)` | Read value at path + subscribe to rerenders. |
| `getState()` | Read entire state object. No rerender subscription. |
| `useState()` | Read entire state + subscribe to rerenders. |
| `setPath(path, value)` | Set value at path. Notifies subscribers. |
| `clearPath(path, removeEmpty?)` | Delete value at path. If `removeEmpty` is true, cleans up empty parent objects. |
| `setState(data)` | Replace entire state. Notifies subscribers. |
| `watchState(fn)` | Call `fn` when state changes (runs in `useEffect`). |
| `watchPath(path, fn)` | Call `fn` when value at path changes. |
| `batch(fn)` | Make multiple updates, notify subscribers once at the end. |

`WatcherPrimitive<T>` (used by `isSubmitting`, `formKey`) has: `getState()`, `useState()`, `setState(data)`, `watchState(fn)`.

All paths use **dot notation**: `"address.street"`, `"items.0.name"`.

## License

MIT
