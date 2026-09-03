import type { ReactNode } from 'react';
import { WatcherFormProvider } from '../src/WatcherFormProvider';
import { useWatcherFormCtx } from '../src/WatcherFormCtx';
import { useWatcherForm } from '../src/useWatcherForm';

function GenericForm<T extends Record<string, any>>({
  children,
  initialValues,
}: {
  children?: ReactNode;
  initialValues: Partial<T>;
}) {
  const form = useWatcherForm<T>({ initialValues });

  return <WatcherFormProvider form={form}>{children}</WatcherFormProvider>;
}

type FormValues = {
  name: string;
  address: {
    city: string;
  };
};

function TypedForm() {
  const form = useWatcherForm<FormValues>({
    initialValues: { name: 'Ada' },
  });

  form.setFieldValue('name', 'Grace');
  form.setFieldValue('address.city', 'Melbourne');

  // @ts-expect-error Invalid top-level fields must remain rejected.
  form.setFieldValue('email', 'ada@example.com');
  // @ts-expect-error Invalid nested fields must remain rejected.
  form.setFieldValue('address.country', 'Australia');

  return <WatcherFormProvider form={form}>fields</WatcherFormProvider>;
}

function TypedConsumer() {
  const form = useWatcherFormCtx<FormValues>();

  form.validateField('address.city');
  // @ts-expect-error Context consumers must retain type-safe paths.
  form.validateField('address.country');

  return null;
}

void GenericForm;
void TypedForm;
void TypedConsumer;
