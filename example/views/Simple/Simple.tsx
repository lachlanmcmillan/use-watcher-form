import classes from '../common.module.css';
import { DisplayRow } from '../../components/DisplayRow/DisplayRow';
import { useWatcherForm } from '../../../src/useWatcherForm';
import { useField } from '../../../src/useField';
import { WatcherFormProvider } from '../../../src/WatcherFormProvider';
import { useWatcherFormCtx } from '../../../src';
import { RerenderIndicator } from '../../components/RerenderIndicator/RerenderIndicator';

/**
 * Simple Forms Example - Demonstrates basic form functionality
 * - Basic field types (text, email, select, checkbox, radio)
 * - Simple validation
 * - Form submission
 * - Error display
 */

type SimpleFormData = {
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  country: string;
  newsletter: boolean;
  gender: 'male' | 'female' | 'other' | '';
};

export function Simple() {
  const form = useWatcherForm<SimpleFormData>({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      age: 0,
      country: '',
      newsletter: false,
      gender: '',
    },
    validator: values => ({
      firstName: values.firstName ? undefined : 'First name is required',
      lastName: values.lastName ? undefined : 'Last name is required',
      email: values.email
        ? /\S+@\S+\.\S+/.test(values.email)
          ? undefined
          : 'Invalid email format'
        : 'Email is required',
      age: values.age && values.age >= 18 ? undefined : 'Must be 18 or older',
      country: values.country ? undefined : 'Please select a country',
    }),
    onSubmit: async (values, changes) => {
      alert(
        `Form submitted!\n\nValues: ${JSON.stringify(values, null, 2)}\n\nChanges: ${JSON.stringify(changes, null, 2)}`
      );
      return { success: true };
    },
  });

  return (
    <WatcherFormProvider form={form}>
      <div className={classes.exampleContainer}>
        <h2>Simple Forms</h2>
        <p className={classes.description}>
          Basic form with different field types, validation, and submission
          handling.
        </p>

        <div className={classes.formGrid}>
          <TextInput path="firstName" label="First Name" required />
          <TextInput path="lastName" label="Last Name" required />
          <TextInput path="email" label="Email" type="email" required />
          <NumberInput path="age" label="Age" required />

          <SelectInput
            path="country"
            label="Country"
            required
            options={[
              { label: 'Select a country...', value: '' },
              { label: 'United States', value: 'us' },
              { label: 'Canada', value: 'ca' },
              { label: 'United Kingdom', value: 'uk' },
              { label: 'Australia', value: 'au' },
              { label: 'Germany', value: 'de' },
            ]}
          />

          <RadioGroup
            path="gender"
            label="Gender"
            options={[
              { label: 'Male', value: 'male' },
              { label: 'Female', value: 'female' },
              { label: 'Other', value: 'other' },
            ]}
          />

          <CheckboxInput path="newsletter" label="Subscribe to newsletter" />
        </div>

        <div className={classes.formActions}>
          <SubmitButton />
          <ResetButton />
          <ChangesIndicator />
        </div>

        <FormValuesDisplay />
        <FormErrorsDisplay />
      </div>
    </WatcherFormProvider>
  );
}

// Reusable form input components
const TextInput = ({
  path,
  label,
  type = 'text',
  required,
}: {
  path: string;
  label: string;
  type?: string;
  required?: boolean;
}) => {
  const { error, key, ...props } = useField(path);

  return (
    <RerenderIndicator>
      <div className={classes.formInput}>
        <label className={classes.label}>
          {label}
          {required && <span className={classes.required}>*</span>}
        </label>
        <input
          {...props}
          key={key}
          type={type}
          className={classes.input}
          data-error={!!error}
        />
        {error && <p className={classes.error}>{error}</p>}
      </div>
    </RerenderIndicator>
  );
};

const NumberInput = ({
  path,
  label,
  required,
}: {
  path: string;
  label: string;
  required?: boolean;
}) => {
  const { error, key, ...props } = useField(path);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(Number(e.target.value) || 0);
  };

  return (
    <RerenderIndicator>
      <div className={classes.formInput}>
        <label className={classes.label}>
          {label}
          {required && <span className={classes.required}>*</span>}
        </label>
        <input
          {...props}
          key={key}
          type="number"
          className={classes.input}
          onChange={onChange}
          data-error={!!error}
        />
        {error && <p className={classes.error}>{error}</p>}
      </div>
    </RerenderIndicator>
  );
};

const SelectInput = ({
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
    <RerenderIndicator>
      <div className={classes.formInput}>
        <label className={classes.label}>
          {label}
          {required && <span className={classes.required}>*</span>}
        </label>
        <select
          {...props}
          key={key}
          className={classes.input}
          data-error={!!error}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className={classes.error}>{error}</p>}
      </div>
    </RerenderIndicator>
  );
};

const CheckboxInput = ({ path, label }: { path: string; label: string }) => {
  const { error, key, ...props } = useField(path);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange?.(e.target.checked);
  };

  return (
    <RerenderIndicator>
      <div className={classes.formInput}>
        <label className={classes.checkboxLabel}>
          <input
            key={key}
            type="checkbox"
            {...props}
            onChange={onChange}
            data-error={!!error}
          />
          {label}
        </label>
        {error && <p className={classes.error}>{error}</p>}
      </div>
    </RerenderIndicator>
  );
};

const RadioGroup = ({
  path,
  label,
  options,
}: {
  path: string;
  label: string;
  options: { label: string; value: string }[];
}) => {
  const { error, key, ...props } = useField(path);

  return (
    <RerenderIndicator>
      <div className={classes.formInput}>
        <fieldset className={classes.radioFieldset}>
          <legend className={classes.label}>{label}</legend>
          {options.map(option => (
            <label key={option.value} className={classes.radioLabel}>
              <input
                type="radio"
                {...props}
                key={key}
                name={props['data-path']}
                value={option.value}
                defaultChecked={props.defaultValue === option.value}
                data-error={!!error}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        {error && <p className={classes.error}>{error}</p>}
      </div>
    </RerenderIndicator>
  );
};

const SubmitButton = () => {
  const form = useWatcherFormCtx();
  const isSubmitting = form.isSubmitting.useState();
  return (
    <RerenderIndicator>
      <button
        type="button"
        className={classes.submitButton}
        onClick={() => form.submit()}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Form'}
      </button>
    </RerenderIndicator>
  );
};

const ResetButton = () => {
  const form = useWatcherFormCtx();
  const isSubmitting = form.isSubmitting.useState();
  return (
    <RerenderIndicator>
      <button
        type="button"
        className={classes.resetButton}
        onClick={() => form.reset({ forceRender: true })}
        disabled={isSubmitting}
      >
        Reset Form
      </button>
    </RerenderIndicator>
  );
};

const ChangesIndicator = () => {
  const form = useWatcherFormCtx();
  const changes = form.changes.useState();
  const hasChanges = Object.keys(changes).length > 0;
  return (
    <RerenderIndicator>
      <span className={classes.status}>
        {hasChanges ? '• Form has changes' : '• No changes'}
      </span>
    </RerenderIndicator>
  );
};

const FormValuesDisplay = () => {
  const form = useWatcherFormCtx();
  const values = form.values.useState();
  return (
    <DisplayRow label="Form Values">
      <pre>{JSON.stringify(values, null, 2)}</pre>
    </DisplayRow>
  );
};

const FormErrorsDisplay = () => {
  const form = useWatcherFormCtx();
  const errors = form.errors.useState();
  return (
    <DisplayRow label="Form Errors">
      <pre>{JSON.stringify(errors, null, 2)}</pre>
    </DisplayRow>
  );
};
