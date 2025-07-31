import { useState } from 'react';
import classes from '../common.module.css';
import { DisplayRow } from '../../components/DisplayRow/DisplayRow';
import { useWatcherForm } from '../../../src/useWatcherForm';
import { useField } from '../../../src/useField';
import { WatcherFormProvider } from '../../../src/WatcherFormProvider';

/**
 * Nested Data Example - Demonstrates working with complex nested structures
 * - Nested objects (deep paths)
 * - Dynamic arrays
 * - Adding/removing array items
 * - Complex validation for nested data
 * - Conditional fields based on nested values
 */

type Address = {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
};

type PhoneNumber = {
  type: 'home' | 'work' | 'mobile';
  number: string;
  isPrimary: boolean;
};

type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
};

type UserProfileData = {
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    dateOfBirth: string;
    bio?: string;
  };
  addresses: Address[];
  phoneNumbers: PhoneNumber[];
  emergencyContacts: EmergencyContact[];
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      profileVisible: boolean;
      allowMessages: boolean;
    };
  };
  metadata: {
    accountType: 'basic' | 'premium' | 'enterprise';
    subscriptionEnd?: string;
    features: string[];
  };
};

const initialData: Partial<UserProfileData> = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    dateOfBirth: '',
    bio: '',
  },
  addresses: [
    {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      isDefault: true,
    }
  ],
  phoneNumbers: [
    {
      type: 'mobile',
      number: '',
      isPrimary: true,
    }
  ],
  emergencyContacts: [],
  preferences: {
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    privacy: {
      profileVisible: true,
      allowMessages: true,
    },
  },
  metadata: {
    accountType: 'basic',
    features: [],
  },
};

export function NestedData() {
  const form = useWatcherForm<UserProfileData>({
    initialValues: initialData,
    validator: values => {
      const errors: any = {};

      // Personal info validation
      if (!values.personalInfo?.firstName) {
        errors.personalInfo = { firstName: 'First name is required' };
      }
      if (!values.personalInfo?.lastName) {
        if (!errors.personalInfo) errors.personalInfo = {};
        errors.personalInfo.lastName = 'Last name is required';
      }
      if (!values.personalInfo?.email) {
        if (!errors.personalInfo) errors.personalInfo = {};
        errors.personalInfo.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.personalInfo.email)) {
        if (!errors.personalInfo) errors.personalInfo = {};
        errors.personalInfo.email = 'Invalid email format';
      }

      // Address validation
      if (values.addresses) {
        const addressErrors: any[] = [];
        values.addresses.forEach((address, index) => {
          const addrError: any = {};
          if (!address.street) addrError.street = 'Street is required';
          if (!address.city) addrError.city = 'City is required';
          if (!address.zipCode) addrError.zipCode = 'Zip code is required';
          
          if (Object.keys(addrError).length > 0) {
            addressErrors[index] = addrError;
          }
        });
        if (addressErrors.length > 0) {
          errors.addresses = addressErrors;
        }
      }

      // Phone number validation
      if (values.phoneNumbers) {
        const phoneErrors: any[] = [];
        values.phoneNumbers.forEach((phone, index) => {
          if (!phone.number) {
            phoneErrors[index] = { number: 'Phone number is required' };
          }
        });
        if (phoneErrors.length > 0) {
          errors.phoneNumbers = phoneErrors;
        }
      }

      // Emergency contacts validation
      if (values.emergencyContacts) {
        const contactErrors: any[] = [];
        values.emergencyContacts.forEach((contact, index) => {
          const contactError: any = {};
          if (!contact.name) contactError.name = 'Name is required';
          if (!contact.phone) contactError.phone = 'Phone is required';
          if (!contact.relationship) contactError.relationship = 'Relationship is required';
          
          if (Object.keys(contactError).length > 0) {
            contactErrors[index] = contactError;
          }
        });
        if (contactErrors.length > 0) {
          errors.emergencyContacts = contactErrors;
        }
      }

      // Premium account validation
      if (values.metadata?.accountType === 'premium' && !values.metadata?.subscriptionEnd) {
        if (!errors.metadata) errors.metadata = {};
        errors.metadata.subscriptionEnd = 'Subscription end date is required for premium accounts';
      }

      return errors;
    },
    onSubmit: async (values, changes) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert(`Profile updated!\n\nChanges: ${JSON.stringify(changes, null, 2)}`);
      return { success: true };
    },
  });

  const addresses = form.values.usePath('addresses') || [];
  const phoneNumbers = form.values.usePath('phoneNumbers') || [];
  const emergencyContacts = form.values.usePath('emergencyContacts') || [];
  const accountType = form.values.usePath('metadata.accountType');
  const isSubmitting = form.isSubmitting.useState();

  // Array manipulation helpers
  const addAddress = () => {
    const newAddress: Address = {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US',
      isDefault: false,
    };
    form.setFieldValue('addresses', [...addresses, newAddress]);
  };

  const removeAddress = (index: number) => {
    const newAddresses = addresses.filter((_: any, i: number) => i !== index);
    form.setFieldValue('addresses', newAddresses);
  };

  const addPhoneNumber = () => {
    const newPhone: PhoneNumber = {
      type: 'mobile',
      number: '',
      isPrimary: false,
    };
    form.setFieldValue('phoneNumbers', [...phoneNumbers, newPhone]);
  };

  const removePhoneNumber = (index: number) => {
    const newPhones = phoneNumbers.filter((_: any, i: number) => i !== index);
    form.setFieldValue('phoneNumbers', newPhones);
  };

  const addEmergencyContact = () => {
    const newContact: EmergencyContact = {
      name: '',
      relationship: '',
      phone: '',
      email: '',
    };
    form.setFieldValue('emergencyContacts', [...emergencyContacts, newContact]);
  };

  const removeEmergencyContact = (index: number) => {
    const newContacts = emergencyContacts.filter((_: any, i: number) => i !== index);
    form.setFieldValue('emergencyContacts', newContacts);
  };

  return (
    <WatcherFormProvider form={form}>
      <div className={classes.exampleContainer}>
        <h2>Nested Data Structures</h2>
        <p className={classes.description}>
          Working with complex nested objects, dynamic arrays, and deep field paths.
        </p>

        {/* Personal Information Section */}
        <section className={classes.formSection}>
          <h3>Personal Information</h3>
          <div className={classes.formGrid}>
            <TextInput path="personalInfo.firstName" label="First Name" required />
            <TextInput path="personalInfo.lastName" label="Last Name" required />
            <TextInput path="personalInfo.email" label="Email" type="email" required />
            <TextInput path="personalInfo.dateOfBirth" label="Date of Birth" type="date" />
            <TextareaInput path="personalInfo.bio" label="Bio" />
          </div>
        </section>

        {/* Addresses Section */}
        <section className={classes.formSection}>
          <div className={classes.sectionHeader}>
            <h3>Addresses</h3>
            <button type="button" onClick={addAddress} className={classes.addButton}>
              Add Address
            </button>
          </div>

          {addresses.map((_: any, index: number) => (
            <div key={index} className={classes.arrayItem}>
              <div className={classes.arrayItemHeader}>
                <h4>Address {index + 1}</h4>
                <button 
                  type="button" 
                  onClick={() => removeAddress(index)}
                  className={classes.removeButton}
                  disabled={addresses.length === 1}
                >
                  Remove
                </button>
              </div>
              
              <div className={classes.formGrid}>
                <TextInput path={`addresses.${index}.street`} label="Street" required />
                <TextInput path={`addresses.${index}.city`} label="City" required />
                <TextInput path={`addresses.${index}.state`} label="State" />
                <TextInput path={`addresses.${index}.zipCode`} label="Zip Code" required />
                <SelectInput 
                  path={`addresses.${index}.country`} 
                  label="Country"
                  options={[
                    { label: 'United States', value: 'US' },
                    { label: 'Canada', value: 'CA' },
                    { label: 'United Kingdom', value: 'UK' },
                  ]}
                />
                <CheckboxInput path={`addresses.${index}.isDefault`} label="Default Address" />
              </div>
            </div>
          ))}
        </section>

        {/* Phone Numbers Section */}
        <section className={classes.formSection}>
          <div className={classes.sectionHeader}>
            <h3>Phone Numbers</h3>
            <button type="button" onClick={addPhoneNumber} className={classes.addButton}>
              Add Phone
            </button>
          </div>

          {phoneNumbers.map((_: any, index: number) => (
            <div key={index} className={classes.arrayItem}>
              <div className={classes.arrayItemHeader}>
                <h4>Phone {index + 1}</h4>
                <button 
                  type="button" 
                  onClick={() => removePhoneNumber(index)}
                  className={classes.removeButton}
                  disabled={phoneNumbers.length === 1}
                >
                  Remove
                </button>
              </div>
              
              <div className={classes.formGrid}>
                <SelectInput 
                  path={`phoneNumbers.${index}.type`} 
                  label="Type"
                  options={[
                    { label: 'Mobile', value: 'mobile' },
                    { label: 'Home', value: 'home' },
                    { label: 'Work', value: 'work' },
                  ]}
                />
                <TextInput path={`phoneNumbers.${index}.number`} label="Phone Number" required />
                <CheckboxInput path={`phoneNumbers.${index}.isPrimary`} label="Primary Number" />
              </div>
            </div>
          ))}
        </section>

        {/* Emergency Contacts Section */}
        <section className={classes.formSection}>
          <div className={classes.sectionHeader}>
            <h3>Emergency Contacts</h3>
            <button type="button" onClick={addEmergencyContact} className={classes.addButton}>
              Add Contact
            </button>
          </div>

          {emergencyContacts.length === 0 && (
            <p className={classes.emptyState}>No emergency contacts added yet.</p>
          )}

          {emergencyContacts.map((_: any, index: number) => (
            <div key={index} className={classes.arrayItem}>
              <div className={classes.arrayItemHeader}>
                <h4>Emergency Contact {index + 1}</h4>
                <button 
                  type="button" 
                  onClick={() => removeEmergencyContact(index)}
                  className={classes.removeButton}
                >
                  Remove
                </button>
              </div>
              
              <div className={classes.formGrid}>
                <TextInput path={`emergencyContacts.${index}.name`} label="Name" required />
                <TextInput path={`emergencyContacts.${index}.relationship`} label="Relationship" required />
                <TextInput path={`emergencyContacts.${index}.phone`} label="Phone" required />
                <TextInput path={`emergencyContacts.${index}.email`} label="Email" type="email" />
              </div>
            </div>
          ))}
        </section>

        {/* Preferences Section */}
        <section className={classes.formSection}>
          <h3>Preferences</h3>
          
          <div className={classes.subsection}>
            <h4>Notifications</h4>
            <div className={classes.checkboxGroup}>
              <CheckboxInput path="preferences.notifications.email" label="Email Notifications" />
              <CheckboxInput path="preferences.notifications.sms" label="SMS Notifications" />
              <CheckboxInput path="preferences.notifications.push" label="Push Notifications" />
            </div>
          </div>

          <div className={classes.subsection}>
            <h4>Privacy</h4>
            <div className={classes.checkboxGroup}>
              <CheckboxInput path="preferences.privacy.profileVisible" label="Profile Visible to Others" />
              <CheckboxInput path="preferences.privacy.allowMessages" label="Allow Direct Messages" />
            </div>
          </div>
        </section>

        {/* Account Metadata Section */}
        <section className={classes.formSection}>
          <h3>Account Settings</h3>
          <div className={classes.formGrid}>
            <SelectInput 
              path="metadata.accountType" 
              label="Account Type"
              options={[
                { label: 'Basic', value: 'basic' },
                { label: 'Premium', value: 'premium' },
                { label: 'Enterprise', value: 'enterprise' },
              ]}
            />
            
            {accountType === 'premium' && (
              <TextInput 
                path="metadata.subscriptionEnd" 
                label="Subscription End Date" 
                type="date"
                required 
              />
            )}
            
            <MultiSelectInput 
              path="metadata.features" 
              label="Enabled Features"
              options={[
                'advanced-analytics',
                'priority-support',
                'custom-branding',
                'api-access',
                'bulk-operations',
              ]}
            />
          </div>
        </section>

        <div className={classes.formActions}>
          <button
            type="button"
            className={classes.submitButton}
            onClick={() => form.submit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving Profile...' : 'Save Profile'}
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

        <DisplayRow title="Form Structure">
          <pre>{JSON.stringify(form.values.useState(), null, 2)}</pre>
        </DisplayRow>
      </div>
    </WatcherFormProvider>
  );
}

// Multi-select component for features
const MultiSelectInput = ({
  path,
  label,
  options,
}: {
  path: string;
  label: string;
  options: string[];
}) => {
  const { error, key, ...props } = useField(path);
  const selectedFeatures = (props.defaultValue as string[]) || [];

  const toggleFeature = (feature: string) => {
    const newFeatures = selectedFeatures.includes(feature)
      ? selectedFeatures.filter(f => f !== feature)
      : [...selectedFeatures, feature];
    
    props.onChange?.(newFeatures);
  };

  return (
    <div className={classes.formInput}>
      <label className={classes.label}>{label}</label>
      <div className={classes.multiSelect}>
        {options.map(option => (
          <label key={option} className={classes.checkboxLabel}>
            <input
              type="checkbox"
              checked={selectedFeatures.includes(option)}
              onChange={() => toggleFeature(option)}
            />
            {option.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
        ))}
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