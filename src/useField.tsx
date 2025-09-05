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
 * A simple helper for setting up a form field
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
 * A controlled field will render when the form value changes
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
