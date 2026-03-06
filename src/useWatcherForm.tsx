import { useCallback, useEffect } from 'react';
import {
  PathOf,
  WatcherMap,
  WatcherPrimitive,
  getDeepPath,
  useWatcher,
  useWatcherMap,
} from 'use-watcher-map';
import type { PRecord, PRecordErrors, ValidationResult } from './types';

export interface WatcherFormProps<T extends Record<string, any>> {
  /** Initial values for the form. Can be a partial object. */
  initialValues: Partial<T>;

  /**
   * Synchronous validation function. Return an object keyed by field name
   * with string error messages. Use `undefined` or `null` for valid fields.
   * Supports nested objects matching your data shape.
   *
   * @example
   * validator: (values) => ({
   *   name: values.name ? undefined : 'Name is required',
   *   email: /\S+@\S+/.test(values.email ?? '') ? undefined : 'Invalid email',
   *   address: {
   *     street: values.address?.street ? undefined : 'Street is required',
   *   },
   * })
   */
  validator?: (values: Partial<T>) => PRecordErrors<T>;

  /**
   * Enable the debug overlay (toggle with Ctrl+/).
   * Shows live form values, changes, and errors.
   * @default true
   */
  debug?: boolean;

  /**
   * Whether to reset the form when the `initialValues` prop changes (by reference).
   * - `'No'` — never reset (default)
   * - `'Always'` — always reset to the new initial values
   * - `'OnlyIfClean'` — reset only if no fields have been changed
   * @default 'No'
   */
  resetOnInitialValuesChange?: 'No' | 'Always' | 'OnlyIfClean';

  /** Called when `submit()` is blocked by validation errors. */
  onValidationErrors?: (errors: ValidationResult) => void;

  /**
   * Async submit handler. Called after successful validation.
   * Receives all current values and only the changed fields.
   *
   * @example
   * onSubmit: async (values, changes) => {
   *   await api.updateUser(values);
   *   return { success: true };
   * }
   */
  onSubmit?: (values: Partial<T>, changes: Partial<T>) => Promise<any>;
}

/**
 * By default all inputs are "uncontrolled", meaning that they don't rerender
 * on input.
 */
export interface WatcherForm<T extends Record<string, any>> {
  /**
   * Current form values. A reactive WatcherMap container.
   * - `values.getPath("field")` — read value (no rerender)
   * - `values.usePath("field")` — read value + subscribe (triggers rerender)
   * - `values.getState()` — get all values (no rerender)
   * - `values.useState()` — get all values + subscribe
   * - `values.setPath("field", value)` — set a value
   * - Supports dot notation: `values.getPath("address.street")`
   */
  values: WatcherMap<Partial<T>>;

  /**
   * Only the fields that have been modified since initialization or last reset.
   * Same WatcherMap API as `values`.
   */
  changes: WatcherMap<Partial<T>>;

  /**
   * Validation error messages per field. Values are strings (error message),
   * `undefined`/`null` (no error), or nested objects for nested fields.
   * Same WatcherMap API as `values`.
   */
  errors: WatcherMap<PRecordErrors<T>>;

  /**
   * Rerender counters per field. Incremented when a field value changes
   * programmatically. Used as the React `key` prop on uncontrolled inputs
   * to force remount with updated `defaultValue`.
   */
  keys: WatcherMap<PRecord<T, number>>;

  /**
   * Tracks which fields have received focus (via onFocus).
   * Same WatcherMap API as `values`.
   */
  touched: WatcherMap<PRecord<T, boolean>>;

  /**
   * Whether an async submission is in progress.
   * - `isSubmitting.getState()` — read without subscribing
   * - `isSubmitting.useState()` — read + subscribe to rerenders
   * - `isSubmitting.setState(bool)` — set manually
   */
  isSubmitting: WatcherPrimitive<boolean>;

  /**
   * Incremented when `reset({ forceRender: true })` is called.
   * Used as the React `key` on WatcherFormProvider to force full form remount.
   */
  formKey: WatcherPrimitive<number>;

  // actions

  /**
   * Trigger the submission process.
   *
   * Validate the form, trigger the submit handler, call onSubmitSuccess or onSubmitError.
   */
  submit: (e?: any) => Promise<any>;

  /**
   * Reset the form to the initial values, or to new values if provided.
   *
   * Note. because the useWatcherForm is uncontrolled, calling reset will not
   * trigger a re-render of the form. If you need a re-render, then call
   * the reset function with the forceRender option set to true.
   */
  reset: (opts?: { newValues?: Partial<T>; forceRender?: boolean }) => void;

  /**
   * Manually set the value of a field.
   */
  setFieldValue: (
    path: PathOf<Partial<T>>,
    value: any,
    opts?: {
      skipValidation?: boolean;
      skipIncrementKey?: boolean;
      skipChanges?: boolean;
    }
  ) => void;

  /**
   * Set the values of multiple fields at once
   *
   * eg.
   * setFieldValues(['firstName', 'John'], ['lastName', 'Smith'])
   */
  setFieldValues: (newValues: [path: PathOf<Partial<T>>, value: any][]) => void;

  /**
   * Validate a single field.
   *
   * Sets the errors object, and also returns the error.
   * @note - the path can be segmented eg. a.b.c
   */
  validateField: (path: PathOf<Partial<T>>) => string | undefined;

  /**
   * Validate all fields, and set the errors watcher.
   * @returns Object with validation errors and a hasErrors flag.
   */
  validateAll: () => {
    errors?: PRecordErrors<T>;
    hasErrors: boolean;
  };

  /**
   * Force a rerender of a field by incrementing an internal key.
   */
  incrementKey: (path: PathOf<PRecord<T, number>>) => void;

  // helpers
  debug: boolean;
  initialValues: Partial<T>;

  /**
   * Get the event handlers for an input field, onChange, onBlur, onFocus.
   */
  getInputEventHandlers: (path: PathOf<Partial<T>>) => {
    onChange: (e: any) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

export const useWatcherForm = <T extends Record<string, any>>({
  debug = true,
  initialValues = {} as T,
  onSubmit,
  onValidationErrors,
  resetOnInitialValuesChange = 'No',
  validator,
}: WatcherFormProps<T>): WatcherForm<T> => {
  const changes = useWatcherMap<Partial<T>>({});
  const errors = useWatcherMap<PRecordErrors<T>>({});
  const keys = useWatcherMap<PRecord<T, number>>({});
  const touched = useWatcherMap<PRecord<T, boolean>>({});
  const values = useWatcherMap<Partial<T>>(initialValues);
  const formKey = useWatcher(0);
  const isSubmitting = useWatcher(false);
  const initialValuesCopy = useWatcher<Partial<T>>(initialValues);

  const reset = useCallback(
    (opts?: { newValues?: Partial<T>; forceRender?: boolean }) => {
      changes.setState({});
      errors.setState({});
      touched.setState({});
      if (opts?.newValues) {
        values.setState(opts.newValues);
        initialValuesCopy.setState(opts.newValues);
      } else {
        values.setState(initialValuesCopy.getState());
      }
      // force a re-render of the entire form
      if (opts?.forceRender) {
        formKey.setState(formKey.getState() + 1);
      }
    },
    [initialValues]
  );

  const validateAll = useCallback((): {
    errors?: PRecordErrors<T>;
    hasErrors: boolean;
  } => {
    if (!validator) {
      return {
        hasErrors: false,
      };
    }

    // the validate function should return an object with the errors as strings
    // eg. { customerId: "Customer is required" }
    const validationResult = validator?.(values.getState());
    // only count truthy values
    const hasErrors =
      !!validationResult &&
      Object.keys(validationResult).filter(
        key => validationResult[key as keyof typeof validationResult]
      ).length > 0;

    errors.setState(validationResult ?? {});

    return {
      errors: validationResult,
      hasErrors,
    };
  }, [validator, values]);

  const validateField = useCallback(
    (path: string): string | undefined => {
      const fullResult = validator?.(values.getState());
      const fieldResult = getDeepPath(fullResult, path.split('.'));
      if (fieldResult) {
        errors.setPath(path as any, fieldResult);
      } else {
        // remove any errors for this field
        errors.clearPath(path as any, true);
      }
      return fieldResult;
    },
    [validator]
  );

  const submit = useCallback(
    async (e?: any) => {
      // prevent the browser making it's own POST request
      e?.preventDefault?.();

      if (isSubmitting.getState()) return;

      if (!onSubmit) return;

      // validate the form
      const result = validateAll();
      if (result.hasErrors) {
        onValidationErrors?.(result.errors);
        return;
      }

      const valuesData = values.getState();
      const changesData = changes.getState();

      isSubmitting.setState(true);

      // errors should be caught in the submit function and returned
      // as a result type
      const response = await onSubmit(valuesData, changesData);

      isSubmitting.setState(false);

      return response;
    },
    [onSubmit]
  );

  const incrementKey = useCallback(
    (path: string) => {
      const current = keys.getPath(path as PathOf<PRecord<T, number>>);
      if (!current) {
        keys.setPath(path as any, 1);
      } else {
        keys.setPath(path as any, current + 1);
      }
    },
    [keys]
  );

  const setFieldValue = useCallback(
    (
      path: string,
      value: any,
      opts?: {
        /** don't validate the field after setting */
        skipValidation?: boolean;
        /** don't increment the key to re-render the component */
        skipIncrementKey?: boolean;
        /** don't add the value to the changes object */
        skipChanges?: boolean;
      }
    ) => {
      values.setPath(path as PathOf<Partial<T>>, value);
      if (!opts?.skipChanges)
        changes.setPath(path as PathOf<Partial<T>>, value);
      if (!opts?.skipValidation) validateField(path);
      if (!opts?.skipIncrementKey) incrementKey(path as any);
    },
    []
  );

  const setFieldValues = useCallback(
    (newValues: [path: string, value: any][]) => {
      changes.batch(() => {
        for (const item of newValues) {
          changes.setPath(item[0] as any, item[1]);
        }
      });
      values.batch(() => {
        for (const item of newValues) {
          values.setPath(item[0] as any, item[1]);
        }
      });
      // increment all of the associated keys
      for (const item of newValues) {
        incrementKey(item[0] as any);
      }
    },
    []
  );

  const getInputEventHandlers = useCallback(
    (path: string) => ({
      onChange: (e: any) => {
        const newValue =
          typeof e === 'object' && e !== null && 'target' in e
            ? e.target.value
            : e;

        // only revalidate the field onChange if the input is already in an error
        // state, otherwise validate onBlur.
        const prevHasError = !!errors.getPath(path as any);
        setFieldValue(path, newValue, {
          skipIncrementKey: true,
          skipValidation: !prevHasError,
        });
      },
      onFocus: () => touched.setPath(path as any, true),
      onBlur: () => validateField(path),
    }),
    []
  );

  useEffect(() => {
    // compare references
    if (initialValues !== values.getState()) {
      if (resetOnInitialValuesChange === 'Always') {
        reset({ newValues: initialValues, forceRender: true });
      }
      if (resetOnInitialValuesChange === 'OnlyIfClean') {
        const isClean = Object.keys(changes.getState()).length === 0;
        if (isClean) {
          reset({ newValues: initialValues, forceRender: true });
        }
      }
    }
  }, [initialValues]);

  return {
    // watchers
    values,
    errors,
    touched,
    changes,
    isSubmitting,
    keys,
    formKey,
    // actions
    submit,
    reset,
    incrementKey,
    setFieldValue,
    setFieldValues,
    validateAll,
    validateField,
    // helpers
    debug,
    initialValues: initialValuesCopy.getState(),
    getInputEventHandlers,
  } satisfies WatcherForm<T>;
};
