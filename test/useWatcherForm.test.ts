import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useWatcherForm } from '../src/useWatcherForm';

const initialValues = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  age: 30,
  isAdmin: false,
};

beforeEach(() => {
  mock.restore();
});

test('initialize with the default state', () => {
  const { result } = renderHook(() => useWatcherForm({ initialValues }));
  expect(result.current.values.getState()).toEqual(initialValues);
});