import { useState } from 'react';
import classes from '../common.module.css';
import { DisplayRow } from '../../components/DisplayRow/DisplayRow';
import { useWatcherForm } from '../../../src/useWatcherForm';
import { useField } from '../../../src/useField';
import { WatcherFormProvider } from '../../../src/WatcherFormProvider';

/**
 * Form State Management Example - Demonstrates form lifecycle and state management
 * - Form reset with different strategies
 * - Initial values change handling
 * - Form state tracking (dirty, pristine, touched)
 * - Manual form manipulation
 * - Conditional fields based on form state
 */

type ProductFormData = {
  name: string;
  description: string;
  price: number;
  category: string;
  inStock: boolean;
  tags: string[];
  publishDate?: string;
  featured: boolean;
};

const categories = [
  { label: 'Select category...', value: '' },
  { label: 'Electronics', value: 'electronics' },
  { label: 'Clothing', value: 'clothing' },
  { label: 'Books', value: 'books' },
  { label: 'Home & Garden', value: 'home' },
];

const defaultProduct: Partial<ProductFormData> = {
  name: '',
  description: '',
  price: 0,
  category: '',
  inStock: true,
  tags: [],
  featured: false,
};

const sampleProducts: Partial<ProductFormData>[] = [
  {
    name: 'Wireless Headphones',
    description: 'High-quality wireless headphones with noise cancellation',
    price: 199.99,
    category: 'electronics',
    inStock: true,
    tags: ['audio', 'wireless', 'premium'],
    featured: true,
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Comfortable 100% cotton t-shirt in various colors',
    price: 24.99,
    category: 'clothing',
    inStock: false,
    tags: ['clothing', 'cotton', 'casual'],
    featured: false,
  },
];

export function FormStateManagement() {
  const [currentProduct, setCurrentProduct] = useState(0);
  const [resetStrategy, setResetStrategy] = useState<'No' | 'Always' | 'OnlyIfClean'>('OnlyIfClean');

  const form = useWatcherForm<ProductFormData>({
    initialValues: sampleProducts[currentProduct] || defaultProduct,
    resetOnInitialValuesChange: resetStrategy,
    validator: values => ({
      name: values.name ? undefined : 'Product name is required',
      description: values.description && values.description.length < 10 
        ? 'Description must be at least 10 characters' 
        : undefined,
      price: values.price > 0 ? undefined : 'Price must be greater than 0',
      category: values.category ? undefined : 'Please select a category',
      publishDate: values.featured && !values.publishDate 
        ? 'Featured products must have a publish date' 
        : undefined,
    }),
    onSubmit: async (values, changes) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert(`Product saved!\n\nFull Data: ${JSON.stringify(values, null, 2)}\n\nChanges Only: ${JSON.stringify(changes, null, 2)}`);
      return { success: true };
    },
  });

  const values = form.values.useState();
  const changes = form.changes.useState();
  const errors = form.errors.useState();
  const touched = form.touched.useState();
  const isSubmitting = form.isSubmitting.useState();

  const isDirty = Object.keys(changes).length > 0;
  const hasErrors = Object.keys(errors).filter(key => errors[key]).length > 0;
  const touchedFields = Object.keys(touched).filter(key => touched[key]);

  // Handle product switching
  const switchProduct = (index: number) => {
    if (isDirty) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to switch products?');
      if (!confirmed) return;
    }
    setCurrentProduct(index);
  };

  // Manual form manipulation examples
  const handleQuickActions = () => {
    // Set multiple values at once
    form.setFieldValues([
      ['name', 'Quick Product'],
      ['price', 99.99],
      ['category', 'electronics'],
    ]);
  };

  const handleMarkAsFeatured = () => {
    form.setFieldValue('featured', true);
    if (!values.publishDate) {
      form.setFieldValue('publishDate', new Date().toISOString().split('T')[0]);
    }
  };

  const handleValidateAll = () => {
    const result = form.validateAll();
    alert(`Validation result:\nHas errors: ${result.hasErrors}\nErrors: ${JSON.stringify(result.errors, null, 2)}`);
  };

  return (
    <WatcherFormProvider form={form}>
      <div className={classes.exampleContainer}>
        <h2>Form State Management</h2>
        <p className={classes.description}>
          Demonstrates form lifecycle, state tracking, reset strategies, and manual form manipulation.
        </p>

        {/* Product Selector */}
        <div className={classes.toolbar}>
          <div className={classes.toolbarSection}>
            <label>Sample Products:</label>
            <button 
              onClick={() => switchProduct(0)}
              className={currentProduct === 0 ? classes.active : ''}
            >
              Headphones
            </button>
            <button 
              onClick={() => switchProduct(1)}
              className={currentProduct === 1 ? classes.active : ''}
            >
              T-Shirt
            </button>
            <button onClick={() => switchProduct(-1)}>
              New Product
            </button>
          </div>

          <div className={classes.toolbarSection}>
            <label>Reset Strategy:</label>
            <select 
              value={resetStrategy} 
              onChange={(e) => setResetStrategy(e.target.value as any)}
            >
              <option value="No">No Auto-Reset</option>
              <option value="Always">Always Reset</option>
              <option value="OnlyIfClean">Only If Clean</option>
            </select>
          </div>
        </div>

        {/* Form State Indicators */}
        <div className={classes.stateIndicators}>
          <span className={`${classes.indicator} ${isDirty ? classes.dirty : classes.clean}`}>
            {isDirty ? '● Modified' : '● Pristine'}
          </span>
          <span className={`${classes.indicator} ${hasErrors ? classes.error : classes.valid}`}>
            {hasErrors ? '● Has Errors' : '● Valid'}
          </span>
          <span className={classes.indicator}>
            Touched: {touchedFields.length} fields
          </span>
        </div>

        {/* Quick Actions */}
        <div className={classes.quickActions}>
          <button onClick={handleQuickActions} className={classes.actionButton}>
            Quick Fill
          </button>
          <button onClick={handleMarkAsFeatured} className={classes.actionButton}>
            Mark as Featured
          </button>
          <button onClick={handleValidateAll} className={classes.actionButton}>
            Validate All
          </button>
          <button 
            onClick={() => form.reset({ forceRender: true })} 
            className={classes.actionButton}
          >
            Reset Form
          </button>
        </div>

        {/* Form Fields */}
        <div className={classes.formGrid}>
          <TextInput path="name" label="Product Name" required />
          
          <TextareaInput path="description" label="Description" />
          
          <NumberInput path="price" label="Price ($)" required />
          
          <SelectInput 
            path="category" 
            label="Category" 
            options={categories}
            required 
          />
          
          <CheckboxInput path="inStock" label="In Stock" />
          
          <CheckboxInput path="featured" label="Featured Product" />
          
          {values.featured && (
            <TextInput 
              path="publishDate" 
              label="Publish Date" 
              type="date"
              required 
            />
          )}
          
          <TagsInput path="tags" label="Tags" />
        </div>

        <div className={classes.formActions}>
          <button
            type="button"
            className={classes.submitButton}
            onClick={() => form.submit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </button>

          <button
            type="button"
            className={classes.resetButton}
            onClick={() => form.reset({ 
              newValues: sampleProducts[currentProduct] || defaultProduct,
              forceRender: true 
            })}
            disabled={isSubmitting}
          >
            Revert Changes
          </button>
        </div>

        <div className={classes.stateDisplay}>
          <DisplayRow title="Form Values">
            <pre>{JSON.stringify(values, null, 2)}</pre>
          </DisplayRow>

          <DisplayRow title="Changes from Initial">
            <pre>{JSON.stringify(changes, null, 2)}</pre>
          </DisplayRow>

          <DisplayRow title="Touched Fields">
            <pre>{JSON.stringify(touched, null, 2)}</pre>
          </DisplayRow>

          <DisplayRow title="Validation Errors">
            <pre>{JSON.stringify(errors, null, 2)}</pre>
          </DisplayRow>
        </div>
      </div>
    </WatcherFormProvider>
  );
}

// Custom Tags Input Component
const TagsInput = ({ path, label }: { path: string; label: string }) => {
  const { error, key, ...props } = useField(path);
  const [inputValue, setInputValue] = useState('');
  
  const tags = (props.defaultValue as string[]) || [];

  const addTag = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      props.onChange?.([...tags, inputValue.trim()]);
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    props.onChange?.(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className={classes.formInput}>
      <label className={classes.label}>{label}</label>
      
      <div className={classes.tagsContainer}>
        {tags.map(tag => (
          <span key={tag} className={classes.tag}>
            {tag}
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className={classes.tagRemove}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      
      <div className={classes.tagInput}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a tag and press Enter"
          className={classes.input}
        />
        <button 
          type="button" 
          onClick={addTag}
          className={classes.addButton}
        >
          Add
        </button>
      </div>
      
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};

// Reusable input components
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
  );
};

const TextareaInput = ({
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
      <textarea
        {...props}
        key={key}
        className={classes.textarea}
        rows={3}
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
        step="0.01"
        className={classes.input}
        onChange={onChange}
        data-error={!!error}
      />
      {error && <p className={classes.error}>{error}</p>}
    </div>
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
  );
};

const CheckboxInput = ({ 
  path, 
  label 
}: { 
  path: string; 
  label: string; 
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
      </label>
      {error && <p className={classes.error}>{error}</p>}
    </div>
  );
};