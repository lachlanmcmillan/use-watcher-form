import { useCallback } from "react";
import { useWatcherFormCtx } from "./WatcherFormCtx";

export const useField = (path: string) => {
  const form = useWatcherFormCtx();

  if (!form) {
    throw new Error("useField must be used within a WatcherFormContext");
  }

  const key = form.keys.usePath(path);
  const error = form.errors.usePath(path);
  const defaultValue = form.values.getPath(path);

  /**
   * You can pass a value, or an event.
   */
  const onChange = useCallback((e: any) => {
    const newValue =
      typeof e === "object" && e !== null && "target" in e
        ? e.target.value
        : e;

    const prevHasError = !!form.errors.getPath(path);
    form.setFieldValue(path, newValue, {
      skipIncrementKey: true,
      skipValidation: !prevHasError,
    });
  }, [path]);

  const onFocus = useCallback(() => form.touched.setPath(path, true), [path]);

  const onBlur = useCallback(() => form.validateField(path), [path]);

  return {
    key,
    error,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    "data-path": path,
  };
};