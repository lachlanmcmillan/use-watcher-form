import { describe, test, expect, mock, beforeEach, jest } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useWatcherForm } from '../src/useWatcherForm';
import type { PRecordErrors } from '../src/types';

const initialValues = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
  isAdmin: false,
  address: {
    street: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    zip: '12345',
  },
};

type TestFormData = typeof initialValues;

beforeEach(() => {
  mock.restore();
});

describe('useWatcherForm', () => {
  describe('Initialization', () => {
    test('initialize with the default state', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));
      expect(result.current.values.getState()).toEqual(initialValues);
    });

    test('initializes with empty object when no initial values provided', () => {
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues: {} })
      );
      expect(result.current.values.getState()).toEqual({});
    });

    test('initializes with partial initial values', () => {
      const partialValues = { name: 'Test User' };
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues: partialValues })
      );
      expect(result.current.values.getState()).toEqual(partialValues);
    });

    test('initializes with debug enabled by default', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));
      expect(result.current.debug).toBe(true);
    });

    test('initializes with debug disabled when specified', () => {
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, debug: false })
      );
      expect(result.current.debug).toBe(false);
    });

    test('initializes with correct default states for all watchers', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      expect(result.current.changes.getState()).toEqual({});
      expect(result.current.errors.getState()).toEqual({});
      expect(result.current.touched.getState()).toEqual({});
      expect(result.current.keys.getState()).toEqual({});
      expect(result.current.isSubmitting.getState()).toBe(false);
      expect(result.current.formKey.getState()).toBe(0);
    });
  });

  describe('setFieldValue', () => {
    test('updates values and changes', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.setFieldValue('name', 'Jane Doe');
      });

      expect(result.current.values.getState()).toEqual({
        ...initialValues,
        name: 'Jane Doe',
      });
      expect(result.current.changes.getState()).toEqual({
        name: 'Jane Doe',
      });
    });

    test('updates nested field values using dot notation', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.setFieldValue('address.street', '456 Oak Ave');
      });

      expect(result.current.values.getPath('address.street')).toBe(
        '456 Oak Ave'
      );
      expect(result.current.changes.getPath('address.street')).toBe(
        '456 Oak Ave'
      );
    });

    test('increments key by default', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.setFieldValue('name', 'Jane Doe');
      });

      expect(result.current.keys.getPath('name')).toBe(1);
    });

    test('skips key increment when specified', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.setFieldValue('name', 'Jane Doe', {
          skipIncrementKey: true,
        });
      });

      expect(result.current.keys.getPath('name')).toBeUndefined();
    });

    test('validates field by default', () => {
      const validator = jest.fn().mockReturnValue({ name: 'Name is required' });
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, validator })
      );

      act(() => {
        result.current.setFieldValue('name', '');
      });

      expect(validator).toHaveBeenCalled();
      expect(result.current.errors.getPath('name')).toBe('Name is required');
    });

    test('skips validation when specified', () => {
      const validator = jest.fn().mockReturnValue({ name: 'Name is required' });
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, validator })
      );

      act(() => {
        result.current.setFieldValue('name', '', { skipValidation: true });
      });

      expect(validator).not.toHaveBeenCalled();
      expect(result.current.errors.getPath('name')).toBeUndefined();
    });
  });

  describe('setFieldValues', () => {
    test('sets multiple field values', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.setFieldValues([
          ['name', 'Jane Smith'],
          ['email', 'jane@example.com'],
          ['age', 25],
        ]);
      });

      expect(result.current.values.getState()).toEqual({
        ...initialValues,
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
      });
      expect(result.current.changes.getState()).toEqual({
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
      });
    });

    test('increments keys for all updated fields', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.setFieldValues([
          ['name', 'Jane Smith'],
          ['email', 'jane@example.com'],
        ]);
      });

      expect(result.current.keys.getPath('name')).toBe(1);
      expect(result.current.keys.getPath('email')).toBe(1);
    });
  });

  describe('validateField', () => {
    test('validates single field and returns error', () => {
      const validator = jest.fn((values: Partial<TestFormData>) => ({
        name: values.name ? undefined : 'Name is required',
      }));
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, validator })
      );

      let fieldError: string | undefined;
      act(() => {
        fieldError = result.current.validateField('name');
      });

      expect(fieldError).toBeUndefined();
      expect(result.current.errors.getPath('name')).toBeUndefined();
    });

    test('validates single field with error', () => {
      const validator = jest.fn((values: Partial<TestFormData>) => ({
        name: values.name ? undefined : 'Name is required',
      }));
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues: {}, validator })
      );

      let fieldError: string | undefined;
      act(() => {
        fieldError = result.current.validateField('name');
      });

      expect(fieldError).toBe('Name is required');
      expect(result.current.errors.getPath('name')).toBe('Name is required');
    });

    test('validates single field with a deep path', () => {
      const validator = jest.fn((values: Partial<TestFormData>) => {
        if (!('address' in values)) {
          return {
            address: 'address is required',
          };
        }
        if (!('street' in values?.address!)) {
          return {
            address: {
              street: 'address.street is required',
            },
          };
        }
        if (typeof values.address !== 'string') {
          return {
            address: {
              street: 'address.street value is invalid',
            },
          };
        }
        return {};
      });
      const { result } = renderHook(() =>
        useWatcherForm({
          initialValues: {
            address: {
              street: 999 as any,
            } as any,
          },
          validator,
        })
      );

      let fieldError: string | undefined;
      act(() => {
        fieldError = result.current.validateField('address.street');
      });

      expect(fieldError).toBe('address.street value is invalid');
      expect(result.current.errors.getPath('address.street' as any)).toBe(
        'address.street value is invalid'
      );
    });

    test('clears error when field becomes valid', () => {
      const validator = jest.fn((values: Partial<TestFormData>) => ({
        name: values.name ? undefined : 'Name is required',
      }));
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues: {}, validator })
      );

      // First set an error
      act(() => {
        result.current.validateField('name');
      });
      expect(result.current.errors.getPath('name')).toBe('Name is required');

      // Then set a valid value
      act(() => {
        result.current.setFieldValue('name', 'Valid Name');
      });
      expect(result.current.errors.getPath('name')).toBeUndefined();
    });

    test('handles missing validator function', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      let fieldError: string | undefined;
      act(() => {
        fieldError = result.current.validateField('name');
      });

      expect(fieldError).toBeUndefined();
    });
  });

  describe('validateAll', () => {
    test('validates all fields with no errors', () => {
      const validator = jest.fn(() => ({}));
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, validator })
      );

      let validationResult: any;
      act(() => {
        validationResult = result.current.validateAll();
      });

      expect(validationResult.hasErrors).toBe(false);
      expect(validationResult.errors).toEqual({});
    });

    test('validates all fields with errors', () => {
      const validationErrors = {
        name: 'Name is required',
        email: 'Invalid email format',
      };
      const validator = jest.fn(() => validationErrors);
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, validator })
      );

      let validationResult: any;
      act(() => {
        validationResult = result.current.validateAll();
      });

      expect(validationResult.hasErrors).toBe(true);
      expect(validationResult.errors).toEqual(validationErrors);
      expect(result.current.errors.getState()).toEqual(validationErrors);
    });

    test('handles missing validator function', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      let validationResult: any;
      act(() => {
        validationResult = result.current.validateAll();
      });

      expect(validationResult.hasErrors).toBe(false);
      expect(validationResult.errors).toBeUndefined();
    });

    test('correctly identifies hasErrors with mixed valid/invalid fields', () => {
      const validationErrors = {
        name: undefined, // valid
        email: 'Invalid email format', // invalid
        age: null, // valid (null is considered no error)
      };
      const validator = jest.fn(() => validationErrors);
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, validator })
      );

      let validationResult: any;
      act(() => {
        validationResult = result.current.validateAll();
      });

      expect(validationResult.hasErrors).toBe(true);
    });
  });

  describe('submit', () => {
    test('successful submission with valid form', async () => {
      const onSubmit = jest.fn().mockResolvedValue({ success: true });
      const { result } = renderHook(() =>
        useWatcherForm({
          initialValues,
          onSubmit,
          validator: () => ({}), // no errors
        })
      );

      let submitResult: any;
      await act(async () => {
        submitResult = await result.current.submit();
      });

      expect(onSubmit).toHaveBeenCalledWith(initialValues, {});
      expect(submitResult).toEqual({ success: true });
      expect(result.current.isSubmitting.getState()).toBe(false);
    });

    test('prevents submission when already submitting', async () => {
      const onSubmit = jest
        .fn()
        .mockImplementation(
          () => new Promise(resolve => setTimeout(resolve, 100))
        );
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, onSubmit })
      );

      // Start first submission
      act(() => {
        result.current.submit();
      });

      expect(result.current.isSubmitting.getState()).toBe(true);

      // Try second submission
      let secondResult: any;
      await act(async () => {
        secondResult = await result.current.submit();
      });

      expect(secondResult).toBeUndefined();
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    test('handles validation errors during submission', async () => {
      const onValidationErrors = jest.fn();
      const validationErrors = { name: 'Name is required' };
      const validator = jest.fn(() => validationErrors);
      const onSubmit = jest.fn();

      const { result } = renderHook(() =>
        useWatcherForm({
          initialValues: {},
          onSubmit,
          validator,
          onValidationErrors,
        })
      );

      await act(async () => {
        await result.current.submit();
      });

      expect(onValidationErrors).toHaveBeenCalledWith(validationErrors);
      expect(onSubmit).not.toHaveBeenCalled();
    });

    test('handles missing onSubmit function', async () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      let submitResult: any;
      await act(async () => {
        submitResult = await result.current.submit();
      });

      expect(submitResult).toBeUndefined();
    });

    test('updates isSubmitting state correctly', async () => {
      const onSubmit = jest.fn().mockResolvedValue({ success: true });
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, onSubmit })
      );

      expect(result.current.isSubmitting.getState()).toBe(false);

      await act(async () => {
        const submitPromise = result.current.submit();
        expect(result.current.isSubmitting.getState()).toBe(true);
        await submitPromise;
      });

      expect(result.current.isSubmitting.getState()).toBe(false);
    });

    test('calls onSubmit with current values and changes', async () => {
      const onSubmit = jest.fn().mockResolvedValue({ success: true });
      const { result } = renderHook(() =>
        useWatcherForm({ initialValues, onSubmit })
      );

      // Make some changes
      act(() => {
        result.current.setFieldValue('name', 'Changed Name');
        result.current.setFieldValue('email', 'changed@example.com');
      });

      await act(async () => {
        await result.current.submit();
      });

      expect(onSubmit).toHaveBeenCalledWith(
        {
          ...initialValues,
          name: 'Changed Name',
          email: 'changed@example.com',
        },
        { name: 'Changed Name', email: 'changed@example.com' }
      );
    });
  });

  describe('reset', () => {
    test('resets to initial values', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      // Make some changes
      act(() => {
        result.current.setFieldValue('name', 'Changed Name');
        result.current.setFieldValue('email', 'changed@example.com');
      });

      // Verify changes exist
      expect(result.current.changes.getState()).toEqual({
        name: 'Changed Name',
        email: 'changed@example.com',
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.values.getState()).toEqual(initialValues);
      expect(result.current.changes.getState()).toEqual({});
      expect(result.current.errors.getState()).toEqual({});
      expect(result.current.touched.getState()).toEqual({});
    });

    test('resets with new values', () => {
      const newValues = { name: 'New Name', email: 'new@example.com' };
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.reset({ newValues });
      });

      expect(result.current.values.getState()).toEqual(newValues);
      expect(result.current.changes.getState()).toEqual({});
    });

    test('forces re-render when specified', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));
      const initialFormKey = result.current.formKey.getState();

      act(() => {
        result.current.reset({ forceRender: true });
      });

      expect(result.current.formKey.getState()).toBe(initialFormKey + 1);
    });

    test('clears all watcher states', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      // Set up some state
      act(() => {
        result.current.setFieldValue('name', 'Changed Name');
        result.current.errors.setState({ name: 'Some error' });
        result.current.touched.setState({ name: true });
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.changes.getState()).toEqual({});
      expect(result.current.errors.getState()).toEqual({});
      expect(result.current.touched.getState()).toEqual({});
    });
  });

  describe('incrementKey', () => {
    test('increments key for existing path', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      // Set initial key
      act(() => {
        result.current.incrementKey('name');
      });
      expect(result.current.keys.getPath('name')).toBe(1);

      // Increment again
      act(() => {
        result.current.incrementKey('name');
      });
      expect(result.current.keys.getPath('name')).toBe(2);
    });

    test('creates new key for non-existing path', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.incrementKey('newField' as any);
      });

      expect(result.current.keys.getPath('newField' as any)).toBe(1);
    });

    test('handles nested paths', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.incrementKey('address.street' as any);
      });

      expect(result.current.keys.getPath('address.street' as any)).toBe(1);
    });
  });

  describe('resetOnInitialValuesChange', () => {
    test('does not reset when set to "No"', () => {
      const { result, rerender } = renderHook(
        ({ values }) =>
          useWatcherForm({
            initialValues: values,
            resetOnInitialValuesChange: 'No',
          }),
        { initialProps: { values: initialValues } }
      );

      // Make changes
      act(() => {
        result.current.setFieldValue('name', 'Changed Name');
      });

      // Change initial values
      rerender({ values: { ...initialValues, name: 'Different Name' } });

      // Should not reset
      expect(result.current.values.getPath('name')).toBe('Changed Name');
      expect(result.current.changes.getState()).toEqual({
        name: 'Changed Name',
      });
    });

    test('always resets when set to "Always"', () => {
      const { result, rerender } = renderHook(
        ({ values }) =>
          useWatcherForm({
            initialValues: values,
            resetOnInitialValuesChange: 'Always',
          }),
        { initialProps: { values: initialValues } }
      );

      // Make changes
      act(() => {
        result.current.setFieldValue('name', 'Changed Name');
      });

      const newInitialValues = { ...initialValues, name: 'Different Name' };

      // Change initial values
      rerender({ values: newInitialValues });

      // Should reset to new values
      expect(result.current.values.getState()).toEqual(newInitialValues);
      expect(result.current.changes.getState()).toEqual({});
    });

    test('resets only if clean when set to "OnlyIfClean"', () => {
      const { result, rerender } = renderHook(
        ({ values }) =>
          useWatcherForm({
            initialValues: values,
            resetOnInitialValuesChange: 'OnlyIfClean',
          }),
        { initialProps: { values: initialValues } }
      );

      const newInitialValues = { ...initialValues, name: 'Different Name' };

      // Test when form is clean (no changes)
      rerender({ values: newInitialValues });
      expect(result.current.values.getState()).toEqual(newInitialValues);

      // Make changes
      act(() => {
        result.current.setFieldValue('email', 'changed@example.com');
      });

      const anotherNewValues = { ...initialValues, name: 'Another Name' };

      // Change initial values again - should not reset because form is dirty
      rerender({ values: anotherNewValues });
      expect(result.current.values.getPath('name')).toBe('Different Name'); // Should keep previous value
      expect(result.current.changes.getState()).toEqual({
        email: 'changed@example.com',
      });
    });
  });

  describe('Form state properties', () => {
    test('exposes correct initial values', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));
      expect(result.current.initialValues).toEqual(initialValues);
    });

    test('maintains initial values after changes', () => {
      const { result } = renderHook(() => useWatcherForm({ initialValues }));

      act(() => {
        result.current.setFieldValue('name', 'Changed Name');
      });

      expect(result.current.initialValues).toEqual(initialValues);
    });

    test('exposes debug flag correctly', () => {
      const { result: resultWithDebug } = renderHook(() =>
        useWatcherForm({ initialValues, debug: true })
      );
      expect(resultWithDebug.current.debug).toBe(true);

      const { result: resultWithoutDebug } = renderHook(() =>
        useWatcherForm({ initialValues, debug: false })
      );
      expect(resultWithoutDebug.current.debug).toBe(false);
    });
  });
});
