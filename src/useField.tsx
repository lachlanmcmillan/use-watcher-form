import { ValidationResult } from './types';
import { useWatcherFormCtx } from './WatcherFormCtx';

export interface Field {
  /** the key is used to force rerenders */
  key: number | undefined;
  /** the error message for the field, technically */
  error?: ValidationResult;
  /** the default value for the field */
  defaultValue: any;
  /** the onChange handler for the field */
  onChange: (e: any) => void;
  /** the onFocus handler for the field */
  onFocus: () => void;
  /** the onBlur handler for the field */
  onBlur: () => void;
  /** data-path is provided for debugging, it is not used programatically */
  'data-path': string;
}

/**
 * Returns props for an **uncontrolled** form input. The component only rerenders
 * when the field's `key` or `error` changes — not on every keystroke.
 *
 * Must be used inside a `WatcherFormProvider`.
 *
 * **Important:** Always spread `key` onto the input element. This forces React to
 * remount the input when the value changes programmatically (e.g., via `setFieldValue`
 * or `reset`), ensuring the uncontrolled input picks up the new `defaultValue`.
 *
 * @param path - Dot-notation path to the field (e.g., `"email"`, `"address.street"`, `"items.0.name"`)
 * @returns Field props to spread onto an input element
 *
 * @example
 * function EmailField() {
 *   const { error, key, ...inputProps } = useField("email");
 *   return (
 *     <div>
 *       <input key={key} {...inputProps} type="email" />
 *       {error && <span>{error}</span>}
 *     </div>
 *   );
 * }
 *
 * @example
 * // Checkbox (use e.target.checked, not e.target.value):
 * function CheckboxField() {
 *   const { error, key, ...props } = useField("newsletter");
 *   const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     props.onChange(e.target.checked);
 *   };
 *   return <input key={key} type="checkbox" {...props} onChange={onChange} />;
 * }
 */
export const useField = (path: string): Field => {
  const form = useWatcherFormCtx();
  if (!form) {
    throw new Error('useField must be used within a WatcherFormContext');
  }

  // changing the value will not cause a render (getPath vs usePath)
  const defaultValue = form.values.getPath(path);

  // subscribe to these paths, if they change then the parent component will
  // render
  const key = form.keys.usePath(path);
  const error = form.errors.usePath(path);

  const { onChange, onFocus, onBlur } = form.getInputEventHandlers(path);

  return {
    key,
    error,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    'data-path': path,
  };
};

export interface ControlledField extends Omit<Field, 'defaultValue'> {
  value: any;
}

/**
 * Returns props for a **controlled** form input. Unlike `useField`, the component
 * rerenders whenever the field's value changes, making it suitable for inputs
 * that need to reflect live state (e.g., conditional UI based on a select value).
 *
 * Returns `value` instead of `defaultValue`.
 *
 * Must be used inside a `WatcherFormProvider`.
 *
 * @param path - Dot-notation path to the field (e.g., `"status"`, `"preferences.theme"`)
 * @returns ControlledField props to spread onto an input element
 *
 * @example
 * function StatusField() {
 *   const { error, key, ...props } = useControlledField("status");
 *   return (
 *     <div>
 *       <select key={key} {...props}>
 *         <option value="draft">Draft</option>
 *         <option value="published">Published</option>
 *       </select>
 *       {props.value === "published" && <p>Will be visible to everyone.</p>}
 *     </div>
 *   );
 * }
 */
export const useControlledField = (path: string): ControlledField => {
  const form = useWatcherFormCtx();
  if (!form) {
    throw new Error('useField must be used within a WatcherFormContext');
  }

  // subscribe to these paths, if they change then the parent component will
  // render
  const value = form.values.usePath(path);
  const key = form.keys.usePath(path);
  const error = form.errors.usePath(path);

  const { onChange, onFocus, onBlur } = form.getInputEventHandlers(path);

  return {
    key,
    error,
    value,
    onChange,
    onFocus,
    onBlur,
    'data-path': path,
  };
};
