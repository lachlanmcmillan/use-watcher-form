import { WatcherForm } from './useWatcherForm';
import { WatcherFormCtx } from './WatcherFormCtx';
import { WatcherFormDebugger } from './WatcherFormDebugger';

export const WatcherFormProvider = ({
  form,
  children,
}: {
  form: WatcherForm<any>;
  children: React.ReactNode;
}) => {
  // the formKey allows us to force rerender the entire form upon calling
  // form.reset()
  const formKey = form.formKey.useState();
  return (
    <WatcherFormCtx.Provider value={form} key={formKey}>
      {form.debug && <WatcherFormDebugger />}
      {children}
    </WatcherFormCtx.Provider>
  );
};
