import React, { useCallback } from 'react';
import {
  WatcherMapReturn,
  WatcherReturn,
  getDeepPath,
  useWatcher,
  useWatcherMap,
} from 'use-watcher-map';
import type { PRecord, PRecordErrors, ValidationResult } from './types';

export interface WatcherFormProps<T extends Record<string, any>> {
  initialValues: Partial<T>;
  validator?: (values: Partial<T>) => PRecordErrors<T>;
  // enables the form helper when ctrl+/ keys are pressed
  debug?: boolean;
  // @todo rename this
  resetOnInitialValuesChange?: 'No' | 'Always' | 'OnlyIfClean';

  //
  onValidationErrors?: (errors: ValidationResult) => void;
  onSubmit?: (values: Partial<T>, changes: Partial<T>) => Promise<any>;
}

export interface WatcherForm<T extends Record<string, any>> {
  // watchers
  values: WatcherMapReturn<Partial<T>>;
  changes: WatcherMapReturn<Partial<T>>;
  errors: WatcherMapReturn<PRecordErrors<T>>;
  keys: WatcherMapReturn<PRecord<T, number>>;
  touched: WatcherMapReturn<PRecord<T, boolean>>;
  isSubmitting: WatcherReturn<boolean>;
  formKey: WatcherReturn<number>;

  // actions
  submit: () => void;
  reset: (opts?: { newValues?: Partial<T>; forceRender?: boolean }) => void;
  setFieldValue: (
    path: string,
    value: any,
    opts?: { skipValidation?: boolean; skipIncrementKey?: boolean }
  ) => void;
  setFieldValues: (newValues: [path: string, value: any][]) => void;
  validateField: (path: string) => string | undefined;
  validateAll: () => {
    errors?: PRecordErrors<T>;
    hasErrors: boolean;
  };
  incrementKey: (path: string) => void;
  // helpers
  debug: boolean;
  initialValues: Partial<T>;
  getInputEventHandlers: (path: string) => {
    onChange: (e: any) => void;
    onFocus: () => void;
    onBlur: () => void;
  };
}

/**
 * By default all inputs are "uncontrolled", meaning that they don't rerender
 * on input.
 */
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

  /**
   * Reset the form to the initial values, or to new values if provided
   *
   * Note. because the useWatcherForm is uncontrolled, calling reset will not
   * trigger a re-render of the form. If you need a re-render, then call
   * the reset function with the forceRender option set to true.
   */
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

  /**
   * validate all fields, and set the errors watcher
   */
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
      Object.keys(validationResult).filter(key => validationResult[key])
        .length > 0;

    errors.setState(validationResult ?? {});

    return {
      errors: validationResult,
      hasErrors,
    };
  }, [validator, values]);

  /**
   * Validate a single field.
   *
   * Sets the errors object, and also returns the error
   */
  const validateField = useCallback(
    (path: string): string | undefined => {
      const fullResult = validator?.({
        [path]: values.getPath(path),
      } as Partial<T>);
      const fieldResult = getDeepPath(fullResult, path.split('.'));
      if (fieldResult) {
        errors.setPath(path, fieldResult);
      } else {
        // remove any errors for this field
        errors.clearPath(path, true);
      }
      return fieldResult;
    },
    [validator]
  );

  /**
   * Trigger the submission process
   *
   * Validate the form, trigger the submit handler, call onSubmitSuccess
   * or onSubmitError
   */
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
      const current = keys.getPath(path);
      if (!current) {
        keys.setPath(path, 1);
      } else {
        keys.setPath(path, current + 1);
      }
    },
    [keys]
  );

  /**
   * Manually set the value of a field
   */
  const setFieldValue = useCallback(
    (
      path: string,
      value: any,
      opts?: { skipValidation?: boolean; skipIncrementKey?: boolean }
    ) => {
      changes.setPath(path, value);
      values.setPath(path, value);
      if (!opts?.skipValidation) validateField(path);
      // increment the key to re-render the component
      if (!opts?.skipIncrementKey) incrementKey(path);
    },
    []
  );

  /**
   * Set the values of multiple fields at once
   *
   * eg.
   * setFieldValues(['firstName', 'John'], ['lastName', 'Smith'])
   */
  const setFieldValues = useCallback(
    (newValues: [path: string, value: any][]) => {
      changes.batch(() => {
        for (const item of newValues) {
          changes.setPath(item[0], item[1]);
        }
      });
      values.batch(() => {
        for (const item of newValues) {
          values.setPath(item[0], item[1]);
        }
      });
      // increment all of the associated keys
      for (const item of newValues) {
        incrementKey(item[0]);
      }
    },
    []
  );

  /**
   * Get the event handlers for an input field, onChange, onBlur, onFocus
   */
  const getInputEventHandlers = useCallback(
    (path: string) => ({
      onChange: (e: any) => {
        const newValue =
          typeof e === 'object' && e !== null && 'target' in e
            ? e.target.value
            : e;

        // only revalidate the field onChange if the input is already in an error
        // state, otherwise validate onBlur.
        const prevHasError = !!errors.getPath(path);
        setFieldValue(path, newValue, {
          skipIncrementKey: true,
          skipValidation: !prevHasError,
        });
      },
      onFocus: () => touched.setPath(path, true),
      onBlur: () => validateField(path),
    }),
    []
  );

  /**
   * Update the form when initial values is changed
   */
  React.useEffect(() => {
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
  };
};
