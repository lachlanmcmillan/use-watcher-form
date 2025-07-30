import { createContext, useContext } from "react";
import { WatcherForm } from "./useWatcherForm";

// NOTE. the provider must be created in a separate file to the context
// or vite hot-module-replacement will break
export let WatcherFormCtx = createContext<any>(null);

export const useWatcherFormCtx = <
  T extends Record<string, any>
>(): WatcherForm<T> => useContext(WatcherFormCtx);
