import { useCallback } from 'react';
import { useWatcherFormCtx } from './WatcherFormCtx';

export interface Field {
  /** the key is used to force rerenders */
  key: string;
  /** the error message for the field, technically */
  error?: string | null;
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

export const useField = (path: string): Field => {
  const form = useWatcherFormCtx();

  if (!form) {
    throw new Error('useField must be used within a WatcherFormContext');
  }

  // subscribe to these paths, if they change then the parent component will
  // rerender
  const key = form.keys.usePath(path);
  const error = form.errors.usePath(path);
  // changeing the value will not cause a rerender (getPath vs usePath)
  const defaultValue = form.values.getPath(path);

  const onChange = useCallback(
    (e: any) => {
      const newValue =
        typeof e === 'object' && e !== null && 'target' in e
          ? e.target.value
          : e;

      // only revalidate the field onChange if the input is already in an error 
      // state, otherwise validate onBlur.
      const prevHasError = !!form.errors.getPath(path);
      form.setFieldValue(path, newValue, {
        skipIncrementKey: true,
        skipValidation: !prevHasError,
      });
    },
    [path]
  );

  const onFocus = useCallback(() => form.touched.setPath(path, true), [path]);

  const onBlur = useCallback(() => form.validateField(path), [path]);

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
