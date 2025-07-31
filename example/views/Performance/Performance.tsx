import { useState, useRef, useCallback } from 'react';
import classes from '../common.module.css';
import { DisplayRow } from '../../components/DisplayRow/DisplayRow';
import { RerenderIndicator } from '../../components/RerenderIndicator/RerenderIndicator';
import { useWatcherForm } from '../../../src/useWatcherForm';
import { useField } from '../../../src/useField';
import { WatcherFormProvider } from '../../../src/WatcherFormProvider';

/**
 * Performance Example - Demonstrates the uncontrolled nature and performance benefits
 * - Uncontrolled inputs (no re-renders on typing)
 * - Selective re-rendering
 * - Performance comparison with controlled forms
 * - Large form handling
 * - Render counting and optimization
 */

type LargeFormData = {
  [key: string]: any;
  settings: {
    theme: string;
    language: string;
    notifications: boolean;
  };
};

// Generate a large form structure
const generateLargeForm = (size: number): Partial<LargeFormData> => {
  const form: any = {
    settings: {
      theme: 'light',
      language: 'en',
      notifications: true,
    },
  };

  // Add many fields to test performance
  for (let i = 0; i < size; i++) {
    form[`field${i}`] = '';
    form[`number${i}`] = 0;
    form[`checkbox${i}`] = false;
  }

  return form;
};

export function Performance() {
  const [formSize, setFormSize] = useState(50);
  const [showControlled, setShowControlled] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);
  
  const updateTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  const largeFormData = generateLargeForm(formSize);

  const form = useWatcherForm<LargeFormData>({
    initialValues: largeFormData,
    validator: values => {
      const errors: any = {};
      
      // Add some validation to test performance impact
      Object.keys(values).forEach(key => {
        if (key.startsWith('field') && typeof values[key] === 'string') {
          if (values[key].length > 0 && values[key].length < 3) {
            errors[key] = 'Must be at least 3 characters';
          }
        }
      });

      return errors;
    },
    onSubmit: async (values, changes) => {
      const start = performance.now();
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const end = performance.now();
      alert(`Form submitted in ${(end - start).toFixed(2)}ms\n\nChanged fields: ${Object.keys(changes).length}\nTotal fields: ${Object.keys(values).length}`);
      
      return { success: true };
    },
  });

  const performanceTest = useCallback(() => {
    const start = performance.now();
    
    // Update multiple fields at once
    const updates: [string, any][] = [];
    for (let i = 0; i < 10; i++) {
      updates.push([`field${i}`, `test${Date.now()}`]);
    }
    
    form.setFieldValues(updates);
    
    const end = performance.now();
    setLastUpdateTime(end - start);
  }, [form]);

  const stressTest = useCallback(() => {
    const start = performance.now();
    
    // Rapidly update many fields
    for (let i = 0; i < 100; i++) {
      form.setFieldValue(`field${i % formSize}`, `stress${i}`);
    }
    
    const end = performance.now();
    updateTimeRef.current = end - start;
    setLastUpdateTime(end - start);
  }, [form, formSize]);

  const isSubmitting = form.isSubmitting.useState();
  const formValues = form.values.useState();
  const formChanges = form.changes.useState();

  return (
    <WatcherFormProvider form={form}>
      <div className={classes.exampleContainer}>
        <h2>Performance & Uncontrolled Behavior</h2>
        <p className={classes.description}>
          Demonstrates the performance benefits of uncontrolled forms and selective re-rendering.
        </p>

        {/* Performance Controls */}
        <div className={classes.performanceControls}>
          <div className={classes.controlGroup}>
            <label>Form Size:</label>
            <select 
              value={formSize} 
              onChange={(e) => setFormSize(Number(e.target.value))}
            >
              <option value={10}>10 fields</option>
              <option value={50}>50 fields</option>
              <option value={100}>100 fields</option>
              <option value={500}>500 fields</option>
            </select>
          </div>

          <div className={classes.controlGroup}>
            <label>
              <input 
                type="checkbox" 
                checked={showControlled}
                onChange={(e) => setShowControlled(e.target.checked)}
              />
              Show Controlled Comparison
            </label>
          </div>

          <div className={classes.performanceActions}>
            <button onClick={performanceTest} className={classes.testButton}>
              Batch Update Test
            </button>
            <button onClick={stressTest} className={classes.testButton}>
              Stress Test
            </button>
            <span className={classes.performanceResult}>
              {lastUpdateTime > 0 && `Last update: ${lastUpdateTime.toFixed(2)}ms`}
            </span>
          </div>
        </div>

        {/* Render Indicators */}
        <div className={classes.renderSection}>
          <h3>Render Behavior</h3>
          <div className={classes.renderGrid}>
            <div className={classes.renderBox}>
              <h4>Form Component</h4>
              <RerenderIndicator />
              <p>This shows when the form component re-renders</p>
            </div>
            
            <div className={classes.renderBox}>
              <h4>Settings Section</h4>
              <SettingsSection />
              <p>Only re-renders when settings change</p>
            </div>

            <div className={classes.renderBox}>
              <h4>Counter Section</h4>
              <CounterSection />
              <p>Independent component state</p>
            </div>
          </div>
        </div>

        {/* Sample Fields for Testing */}
        <div className={classes.sampleFields}>
          <h3>Sample Fields (Type to see uncontrolled behavior)</h3>
          <p className={classes.hint}>
            Notice: Typing in these fields doesn't cause re-renders of other components
          </p>
          
          <div className={classes.formGrid}>
            <UncontrolledInput path="field0" label="Test Field 1" />
            <UncontrolledInput path="field1" label="Test Field 2" />
            <UncontrolledInput path="field2" label="Test Field 3" />
            <UncontrolledInput path="number0" label="Number Field" type="number" />
            
            {showControlled && (
              <>
                <ControlledInput path="field3" label="Controlled Field 1" />
                <ControlledInput path="field4" label="Controlled Field 2" />
              </>
            )}
          </div>
        </div>

        {/* Large Form Section */}
        <div className={classes.largeFormSection}>
          <h3>Large Form Performance ({formSize} fields)</h3>
          <div className={classes.fieldGrid}>
            {Array.from({ length: Math.min(formSize, 20) }, (_, i) => (
              <UncontrolledInput 
                key={i}
                path={`field${i}`} 
                label={`Field ${i + 1}`} 
              />
            ))}
            {formSize > 20 && (
              <div className={classes.fieldCount}>
                ... and {formSize - 20} more fields
              </div>
            )}
          </div>
        </div>

        <div className={classes.formActions}>
          <button
            type="button"
            className={classes.submitButton}
            onClick={() => form.submit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : `Submit ${formSize} Fields`}
          </button>

          <button
            type="button"
            className={classes.resetButton}
            onClick={() => form.reset({ forceRender: true })}
            disabled={isSubmitting}
          >
            Reset All
          </button>
        </div>

        {/* Performance Metrics */}
        <div className={classes.metricsSection}>
          <DisplayRow title="Performance Metrics">
            <div className={classes.metrics}>
              <div>Total Fields: {Object.keys(formValues).length}</div>
              <div>Changed Fields: {Object.keys(formChanges).length}</div>
              <div>Last Update Time: {lastUpdateTime.toFixed(2)}ms</div>
              <div>Form Size: {JSON.stringify(formValues).length} bytes</div>
            </div>
          </DisplayRow>

          <DisplayRow title="Changed Fields Only">
            <pre>{JSON.stringify(formChanges, null, 2)}</pre>
          </DisplayRow>
        </div>
      </div>
    </WatcherFormProvider>
  );
}

// Uncontrolled input - doesn't cause re-renders
const UncontrolledInput = ({
  path,
  label,
  type = 'text',
}: {
  path: string;
  label: string;
  type?: string;
}) => {
  const { error, key, ...props } = useField(path);

  return (
    <div className={classes.formInput}>
      <label className={classes.label}>
        {label}
        <RerenderIndicator size="small" />
      </label>
      <input
        {...props}
        key={key}
        type={type}
        className={classes.input}
        data-error={!!error}
        placeholder="Type here (uncontrolled)"
      />
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

// Controlled input for comparison - causes re-renders
const ControlledInput = ({
  path,
  label,
}: {
  path: string;
  label: string;
}) => {
  const { error, key, ...props } = useField(path);
  const currentValue = props.defaultValue || '';

  return (
    <div className={classes.formInput}>
      <label className={classes.label}>
        {label} (Controlled)
        <RerenderIndicator size="small" />
      </label>
      <input
        key={key}
        type="text"
        value={currentValue}
        onChange={props.onChange}
        onFocus={props.onFocus}
        onBlur={props.onBlur}
        className={classes.input}
        data-error={!!error}
        placeholder="Type here (controlled)"
        data-path={props['data-path']}
      />
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

// Settings section that only re-renders when settings change
const SettingsSection = () => {
  const form = useWatcherForm({
    initialValues: { count: 0 },
  });
  
  const themeField = useField('settings.theme');
  const languageField = useField('settings.language');
  const notificationsField = useField('settings.notifications');

  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    notificationsField.onChange?.(e.target.checked);
  };

  return (
    <div className={classes.settingsSection}>
      <RerenderIndicator />
      
      <div className={classes.settingItem}>
        <label>Theme:</label>
        <select {...themeField}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className={classes.settingItem}>
        <label>Language:</label>
        <select {...languageField}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>
      </div>

      <div className={classes.settingItem}>
        <label>
          <input 
            type="checkbox" 
            {...notificationsField}
            onChange={handleNotificationChange}
          />
          Notifications
        </label>
      </div>
    </div>
  );
};

// Independent counter to show isolation
const CounterSection = () => {
  const [count, setCount] = useState(0);

  return (
    <div className={classes.counterSection}>
      <RerenderIndicator />
      <h4>Independent Counter: {count}</h4>
      <div className={classes.counterControls}>
        <button onClick={() => setCount(c => c - 1)}>-</button>
        <button onClick={() => setCount(c => c + 1)}>+</button>
        <button onClick={() => setCount(0)}>Reset</button>
      </div>
      <p>This counter re-renders independently of the form</p>
    </div>
  );
};