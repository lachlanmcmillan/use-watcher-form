# Patterns & Recipes

Copy-pasteable code patterns for common form scenarios with `use-watcher-form`.

## Basic Setup

Every form follows the same structure:

```tsx
import {
  useWatcherForm,
  useField,
  useControlledField,
  WatcherFormProvider,
  useWatcherFormCtx,
} from 'use-watcher-form';

type MyForm = {
  name: string;
  email: string;
};

function MyPage() {
  const form = useWatcherForm<MyForm>({
    initialValues: { name: '', email: '' },
    onSubmit: async (values, changes) => {
      // handle submit
    },
  });

  return (
    <WatcherFormProvider form={form}>
      {/* field components go here */}
    </WatcherFormProvider>
  );
}
```

## Text / Email Input

```tsx
function TextField({ path, label }: { path: string; label: string }) {
  const { error, key, ...props } = useField(path);
  return (
    <div>
      <label>{label}</label>
      <input key={key} {...props} type="text" />
      {error && <span>{error}</span>}
    </div>
  );
}

// Usage: <TextField path="name" label="Full Name" />
```

## Number Input

The default `onChange` extracts `e.target.value` (a string). For numbers, wrap it:

```tsx
function NumberField({ path, label }: { path: string; label: string }) {
  const { error, key, ...props } = useField(path);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(Number(e.target.value) || 0);
  };
  return (
    <div>
      <label>{label}</label>
      <input key={key} {...props} type="number" onChange={onChange} />
      {error && <span>{error}</span>}
    </div>
  );
}
```

## Checkbox

Checkboxes use `e.target.checked`, not `e.target.value`:

```tsx
function CheckboxField({ path, label }: { path: string; label: string }) {
  const { error, key, ...props } = useField(path);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(e.target.checked);
  };
  return (
    <label>
      <input key={key} type="checkbox" {...props} onChange={onChange} />
      {label}
      {error && <span>{error}</span>}
    </label>
  );
}
```

## Select Dropdown

```tsx
function SelectField({
  path,
  label,
  options,
}: {
  path: string;
  label: string;
  options: { label: string; value: string }[];
}) {
  const { error, key, ...props } = useField(path);
  return (
    <div>
      <label>{label}</label>
      <select key={key} {...props}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span>{error}</span>}
    </div>
  );
}
```

## Radio Group

```tsx
function RadioGroup({
  path,
  label,
  options,
}: {
  path: string;
  label: string;
  options: { label: string; value: string }[];
}) {
  const { error, key, ...props } = useField(path);
  return (
    <fieldset>
      <legend>{label}</legend>
      {options.map((opt) => (
        <label key={opt.value}>
          <input
            type="radio"
            {...props}
            key={key}
            name={path}
            value={opt.value}
            defaultChecked={props.defaultValue === opt.value}
          />
          {opt.label}
        </label>
      ))}
      {error && <span>{error}</span>}
    </fieldset>
  );
}
```

## Textarea

```tsx
function TextareaField({ path, label }: { path: string; label: string }) {
  const { error, key, ...props } = useField(path);
  return (
    <div>
      <label>{label}</label>
      <textarea key={key} {...props} rows={4} />
      {error && <span>{error}</span>}
    </div>
  );
}
```

## Nested Object Paths

Use dot notation for nested data:

```tsx
type FormData = {
  address: {
    street: string;
    city: string;
  };
};

// In your JSX:
<TextField path="address.street" label="Street" />
<TextField path="address.city" label="City" />
```

## Dynamic Arrays

```tsx
type FormData = {
  items: { name: string; qty: number }[];
};

function ItemsList() {
  const form = useWatcherFormCtx<FormData>();
  const items = form.values.usePath('items') || [];

  const addItem = () => {
    form.setFieldValue('items', [...items, { name: '', qty: 0 }]);
  };

  const removeItem = (index: number) => {
    form.setFieldValue(
      'items',
      items.filter((_: any, i: number) => i !== index)
    );
  };

  return (
    <div>
      {items.map((_: any, i: number) => (
        <div key={i}>
          <TextField path={`items.${i}.name`} label={`Item ${i + 1}`} />
          <NumberField path={`items.${i}.qty`} label="Qty" />
          <button type="button" onClick={() => removeItem(i)}>Remove</button>
        </div>
      ))}
      <button type="button" onClick={addItem}>Add Item</button>
    </div>
  );
}
```

## Controlled vs Uncontrolled Field

Use `useControlledField` when you need the component to rerender on every value change (e.g., showing a live preview or conditional UI):

```tsx
function StatusField() {
  // Rerenders when "status" changes
  const { error, key, ...props } = useControlledField('status');
  return (
    <div>
      <select key={key} {...props}>
        <option value="draft">Draft</option>
        <option value="published">Published</option>
      </select>
      {props.value === 'published' && <p>This will be visible to everyone.</p>}
    </div>
  );
}
```

With `useField`, the component does **not** rerender on change — use it for standard inputs.

## Programmatic Field Manipulation

```tsx
function AutoFillButton() {
  const form = useWatcherFormCtx();

  const autoFill = () => {
    // Set one field
    form.setFieldValue('country', 'US');

    // Set multiple fields in a batch
    form.setFieldValues([
      ['city', 'New York'],
      ['state', 'NY'],
      ['zip', '10001'],
    ]);
  };

  return <button type="button" onClick={autoFill}>Auto-fill Address</button>;
}
```

### setFieldValue Options

```tsx
// Set value without triggering validation
form.setFieldValue('field', value, { skipValidation: true });

// Set value without incrementing the key (won't force rerender)
form.setFieldValue('field', value, { skipIncrementKey: true });

// Set value without tracking it in changes
form.setFieldValue('field', value, { skipChanges: true });
```

## Form Reset

```tsx
function ResetButton() {
  const form = useWatcherFormCtx();
  return (
    <button
      type="button"
      onClick={() => form.reset({ forceRender: true })}
    >
      Reset
    </button>
  );
}

// Reset to new values:
form.reset({ newValues: { name: 'Default' }, forceRender: true });

// Reset without rerendering (rare — only if you handle DOM updates yourself):
form.reset();
```

## Validation

### Basic Validator

```tsx
const form = useWatcherForm<MyForm>({
  initialValues: { name: '', email: '' },
  validator: (values) => ({
    name: values.name ? undefined : 'Name is required',
    email: values.email && /\S+@\S+\.\S+/.test(values.email)
      ? undefined
      : 'Valid email required',
  }),
});
```

### Nested Validation Errors

Return errors matching your data shape:

```tsx
validator: (values) => {
  const errors: any = {};
  if (!values.address?.street) {
    errors.address = { street: 'Street is required' };
  }
  return errors;
},
```

### Cross-Field Validation

```tsx
validator: (values) => ({
  confirmPassword:
    values.password !== values.confirmPassword
      ? 'Passwords do not match'
      : undefined,
}),
```

### Async Validation

Run async validation manually (e.g., on blur) and set errors directly:

```tsx
const handleUsernameBlur = async () => {
  const username = form.values.getPath('username');
  const error = await checkUsernameAvailable(username);
  if (error) {
    form.errors.setPath('username', error);
  } else {
    form.errors.clearPath('username', true);
  }
};
```

### Manual Validation

```tsx
// Validate a single field
const error = form.validateField('email');

// Validate all fields
const { hasErrors, errors } = form.validateAll();
```

## Context Usage with WatcherFormProvider

Split your form into small components. Only the components that subscribe (via `usePath` / `useState`) will rerender:

```tsx
function MyForm() {
  const form = useWatcherForm<FormData>({ initialValues: { ... } });
  return (
    <WatcherFormProvider form={form}>
      <NameSection />
      <AddressSection />
      <SubmitButton />
    </WatcherFormProvider>
  );
}

// Each section is isolated — changing "name" won't rerender AddressSection
function NameSection() {
  return <TextField path="name" label="Name" />;
}

function SubmitButton() {
  const form = useWatcherFormCtx();
  const isSubmitting = form.isSubmitting.useState();
  return (
    <button onClick={() => form.submit()} disabled={isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save'}
    </button>
  );
}
```

## Watching Values Reactively

```tsx
function PricePreview() {
  const form = useWatcherFormCtx();
  // Subscribe to just the fields you need
  const price = form.values.usePath('price');
  const qty = form.values.usePath('quantity');
  return <p>Total: ${(price || 0) * (qty || 0)}</p>;
}
```

## Reading Values Without Subscribing

Use `getPath` / `getState` in event handlers — no rerender cost:

```tsx
function ExportButton() {
  const form = useWatcherFormCtx();
  const handleExport = () => {
    const allValues = form.values.getState(); // no subscription
    downloadAsJSON(allValues);
  };
  return <button onClick={handleExport}>Export</button>;
}
```

## Dirty Checking

```tsx
function DirtyIndicator() {
  const form = useWatcherFormCtx();
  const changes = form.changes.useState();
  const isDirty = Object.keys(changes).length > 0;
  return isDirty ? <span>Unsaved changes</span> : null;
}
```
