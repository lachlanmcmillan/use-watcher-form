import type { WatcherForm } from './useWatcherForm';
import { WatcherFormCtx } from './WatcherFormCtx';
import { WatcherFormDebugger } from './WatcherFormDebugger';

export function WatcherFormProvider<T extends Record<string, any>>({
  form,
  children,
}: {
  form: WatcherForm<T>;
  children: React.ReactNode;
}) {
  // the formKey allows us to force rerender the entire form upon calling
  // form.reset()
  const formKey = form.formKey.useState();
  return (
    <WatcherFormCtx.Provider value={form} key={formKey}>
      {form.debug && <WatcherFormDebugger />}
      {children}
    </WatcherFormCtx.Provider>
  );
}
