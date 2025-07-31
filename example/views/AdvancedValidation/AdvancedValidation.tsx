import { useState } from 'react';
import classes from '../common.module.css';
import { DisplayRow } from '../../components/DisplayRow/DisplayRow';
import { useWatcherForm } from '../../../src/useWatcherForm';
import { useField } from '../../../src/useField';
import { WatcherFormProvider } from '../../../src/WatcherFormProvider';

/**
 * Advanced Validation Example - Demonstrates complex validation scenarios
 * - Field-level validation
 * - Cross-field validation
 * - Async validation simulation
 * - Conditional validation
 * - Custom error handling
 */

type UserFormData = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  age: number;
  terms: boolean;
  newsletter: boolean;
  referralCode?: string;
};

// Simulate async validation
const validateUsername = async (username: string): Promise<string | undefined> => {
  if (!username) return 'Username is required';
  if (username.length < 3) return 'Username must be at least 3 characters';
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const existingUsers = ['admin', 'test', 'user123'];
  if (existingUsers.includes(username.toLowerCase())) {
    return 'Username already taken';
  }
  
  return undefined;
};

export function AdvancedValidation() {
  const [isValidatingUsername, setIsValidatingUsername] = useState(false);

  const form = useWatcherForm<UserFormData>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      age: 0,
      terms: false,
      newsletter: false,
      referralCode: '',
    },
    validator: values => {
      const errors: any = {};

      // Email validation
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Invalid email format';
      }

      // Password validation
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(values.password)) {
        errors.password = 'Password must contain uppercase, lowercase, and number';
      }

      // Confirm password validation (cross-field)
      if (!values.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      // Age validation
      if (!values.age) {
        errors.age = 'Age is required';
      } else if (values.age < 13) {
        errors.age = 'Must be at least 13 years old';
      } else if (values.age > 120) {
        errors.age = 'Please enter a valid age';
      }

      // Terms validation
      if (!values.terms) {
        errors.terms = 'You must accept the terms and conditions';
      }

      // Conditional validation - referral code only if newsletter is checked
      if (values.newsletter && values.referralCode) {
        if (values.referralCode.length < 5) {
          errors.referralCode = 'Referral code must be at least 5 characters';
        }
      }

      return errors;
    },
    onSubmit: async (values, changes) => {
      // Simulate submission delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`User registered successfully!\n\nData: ${JSON.stringify(values, null, 2)}`);
      return { success: true };
    },
    onValidationErrors: (errors) => {
      console.log('Validation errors:', errors);
    },
  });

  const newsletterValue = form.values.usePath('newsletter');
  const isSubmitting = form.isSubmitting.useState();
  const errors = form.errors.useState();

  // Handle async username validation
  const handleUsernameBlur = async () => {
    const username = form.values.getPath('username');
    if (!username) return;

    setIsValidatingUsername(true);
    const error = await validateUsername(username);
    
    if (error) {
      form.errors.setPath('username', error);
    } else {
      form.errors.clearPath('username', true);
    }
    
    setIsValidatingUsername(false);
  };

  return (
    <WatcherFormProvider form={form}>
      <div className={classes.exampleContainer}>
        <h2>Advanced Validation</h2>
        <p className={classes.description}>
          Complex validation scenarios including cross-field validation, async validation, 
          and conditional validation rules.
        </p>

        <div className={classes.formGrid}>
          <UsernameField 
            onBlur={handleUsernameBlur}
            isValidating={isValidatingUsername}
          />
          
          <TextInput path="email" label="Email" type="email" required />
          
          <PasswordField path="password" label="Password" required />
          
          <TextInput 
            path="confirmPassword" 
            label="Confirm Password" 
            type="password" 
            required 
          />
          
          <NumberInput path="age" label="Age" required />
          
          <CheckboxInput path="terms" label="I accept the terms and conditions" required />
          
          <CheckboxInput path="newsletter" label="Subscribe to newsletter" />
          
          {newsletterValue && (
            <TextInput 
              path="referralCode" 
              label="Referral Code (Optional)" 
              placeholder="Enter referral code"
            />
          )}
        </div>

        <div className={classes.formActions}>
          <button
            type="button"
            className={classes.submitButton}
            onClick={() => form.submit()}
            disabled={isSubmitting || isValidatingUsername}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <button
            type="button"
            className={classes.resetButton}
            onClick={() => form.reset({ forceRender: true })}
            disabled={isSubmitting}
          >
            Reset Form
          </button>
        </div>

        <DisplayRow title="Validation Errors">
          <pre>{JSON.stringify(errors, null, 2)}</pre>
        </DisplayRow>

        <DisplayRow title="Form Values">
          <pre>{JSON.stringify(form.values.useState(), null, 2)}</pre>
        </DisplayRow>
      </div>
    </WatcherFormProvider>
  );
}

// Custom username field with async validation
const UsernameField = ({ 
  onBlur, 
  isValidating 
}: { 
  onBlur: () => void;
  isValidating: boolean;
}) => {
  const { error, key, ...props } = useField('username');

  return (
    <div className={classes.formInput}>
      <label className={classes.label}>
        Username <span className={classes.required}>*</span>
        {isValidating && <span className={classes.validating}> (checking...)</span>}
      </label>
      <input
        {...props}
        key={key}
        type="text"
        className={classes.input}
        onBlur={onBlur}
        data-error={!!error}
        disabled={isValidating}
      />
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

// Password field with strength indicator
const PasswordField = ({
  path,
  label,
  required,
}: {
  path: string;
  label: string;
  required?: boolean;
}) => {
  const { error, key, ...props } = useField(path);
  const password = props.defaultValue || '';

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, text: '' };
    
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z\d]/.test(pwd)) score++;

    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { strength: score, text: levels[score] || '' };
  };

  const strength = getPasswordStrength(password);

  return (
    <div className={classes.formInput}>
      <label className={classes.label}>
        {label}
        {required && <span className={classes.required}>*</span>}
      </label>
      <input
        {...props}
        key={key}
        type="password"
        className={classes.input}
        data-error={!!error}
      />
      {password && (
        <div className={classes.passwordStrength}>
          <div className={`${classes.strengthBar} ${classes[`strength${strength.strength}`]}`} />
          <span className={classes.strengthText}>{strength.text}</span>
        </div>
      )}
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

// Reusable components (simplified versions from Simple.tsx)
const TextInput = ({
  path,
  label,
  type = 'text',
  required,
  placeholder,
}: {
  path: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
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
        type={type}
        placeholder={placeholder}
        className={classes.input}
        data-error={!!error}
      />
      {error && <p className={classes.error}>{error}</p>}
    </div>
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
  );
};

const CheckboxInput = ({ 
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
    props.onChange?.(e.target.checked);
  };

  return (
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
        {required && <span className={classes.required}>*</span>}
      </label>
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};