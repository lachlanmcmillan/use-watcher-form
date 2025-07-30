import classes from './simple.module.css';
import { RerenderIndicator } from '../../components/RerenderIndicator/RerenderIndicator';
import { DisplayRow } from '../../components/DisplayRow/DisplayRow';
import { useWatcherForm } from '../../../src/useWatcherForm';
import { useField } from '../../../src/useField';
import { WatcherFormProvider } from '../../../src/WatcherFormProvider';

/**
 * SimpleExample - Demonstrates basic state watching with useWatcherMap
 * Shows how to watch and update primitive state values at the root level
 * Includes examples of watching specific paths and listening for changes
 */

type State = {
  name: string;
  gender: 'male' | 'female' | null;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  isStudent?: boolean;
};

export function Simple() {
  const form = useWatcherForm<State>({
    initialValues: {
      name: '',
      gender: null,
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
    },
    validator: values => ({
      name: values.name ? undefined : 'Name is required',
      gender: values.gender ? undefined : 'Gender is required',
    }),
    onSubmit: async (values, changes) => {
      console.log(values, changes);
      return { success: true };
    },
  });

  return (
    <WatcherFormProvider form={form}>
      <div className={classes.exampleContainer}>
        <h2>Simple Example</h2>

        <p className={classes.description}>some description</p>

        <TextInput path="name" label="Name" required />
        <RadiosInput
          path="gender"
          label="Gender"
          required
          options={[
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
          ]}
        />
        <TextInput path="email" label="Email" required />
        <CheckboxInput path="isStudent" label="Student" />
      </div>

      <button
        type="button"
        className={classes.submitButton}
        onClick={() => form.submit()}
      >
        Submit
      </button>
    </WatcherFormProvider>
  );
}

const TextInput = ({
  path,
  label,
  required,
}: {
  path: string;
  label: string;
  required?: boolean;
}) => {
  const { error, key, ...props } = useField(path);

  return (
    <div className={classes.formInput}>
      <label className={classes.label}>
        {label}
        {required && <span className={classes.required}>*</span>}
      </label>
      <input
        {...props}
        key={key}
        className={classes.input}
        data-error={!!error}
      />
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

const CheckboxInput = ({ path, label }: { path: string; label: string }) => {
  const { error, key, ...props } = useField(path);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e.target.checked);
  };

  return (
    <div className={classes.formInput}>
      <label className={classes.label}>{label}</label>
      <input
        key={key}
        type="checkbox"
        {...props}
        onChange={onChange}
        data-error={!!error}
      />
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

const RadiosInput = ({
  path,
  label,
  options,
  required,
}: {
  path: string;
  label: string;
  required?: boolean;
  options: { label: string; value: string }[];
}) => {
  const { error, key, ...props } = useField(path);

  return (
    <div className={classes.formInput}>
      <label className={classes.label}>
        {label}
        {required && <span className={classes.required}>*</span>}
      </label>
      {options.map(option => (
        <label key={key}>
          {option.label}
          <input
            type="radio"
            {...props}
            name={props['data-path']}
            value={option.value}
            defaultChecked={props.defaultValue === option.value}
            data-error={!!error}
          />
        </label>
      ))}
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};
