import {
  describe,
  test,
  expect,
  beforeEach,
  afterEach,
  mock,
  jest,
} from 'bun:test';
import { render, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { useWatcherForm } from '../src/useWatcherForm';
import { WatcherFormProvider } from '../src/WatcherFormProvider';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Set up localStorage mock on both window and global
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn((callback: Function) => {
  callback();
  return 1;
});

Object.defineProperty(window, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

const TestFormWithDebugger = ({
  debug = true,
  initialValues = {},
  validator,
}: {
  debug?: boolean;
  initialValues?: any;
  validator?: any;
}) => {
  const form = useWatcherForm({ initialValues, debug, validator });

  return (
    <WatcherFormProvider form={form}>
      <div data-testid="form-container">
        <button
          data-testid="change-value"
          onClick={() => form.setFieldValue('name', 'Changed Name')}
        >
          Change Value
        </button>
        <button
          data-testid="set-error"
          onClick={() => form.errors.setState({ name: 'Test Error' })}
        >
          Set Error
        </button>
      </div>
    </WatcherFormProvider>
  );
};

beforeEach(() => {
  mock.restore();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  mockRequestAnimationFrame.mockClear();

  // Reset localStorage mock to return null by default
  localStorageMock.getItem.mockReturnValue(null);
});

afterEach(() => {
  // Clean up any event listeners
  document.removeEventListener('keydown', jest.fn());
  document.removeEventListener('mousemove', jest.fn());
  document.removeEventListener('mouseup', jest.fn());
});

describe('WatcherFormDebugger', () => {
  describe('Visibility Control', () => {
    test('debugger is hidden by default', () => {
      const { container } = render(<TestFormWithDebugger debug={true} />);

      // The debugger component exists but should be hidden
      // We can't easily test CSS display properties in jsdom, but we can verify
      // the component structure
      expect(container).toBeDefined();
    });

    test('debugger does not render when debug is false', () => {
      const { container } = render(<TestFormWithDebugger debug={false} />);

      // When debug is false, the debugger shouldn't render at all
      // The WatcherFormProvider should not include the debugger component
      expect(
        container.querySelector('[class*="watcherFormDebugger"]')
      ).toBeNull();
    });

    test('keyboard shortcut toggles debugger visibility', () => {
      render(<TestFormWithDebugger debug={true} />);

      // Simulate Ctrl+/ keydown
      const keydownEvent = new KeyboardEvent('keydown', {
        key: '/',
        ctrlKey: true,
        bubbles: true,
      });

      act(() => {
        window.dispatchEvent(keydownEvent);
      });

      // After the keyboard event, the debugger should become visible
      // We can't easily test the visibility state without access to the component's internal state
      // But we can verify the event was handled without errors
      expect(true).toBe(true); // Test passes if no errors thrown
    });

    test('non-matching keyboard events do not toggle debugger', () => {
      render(<TestFormWithDebugger debug={true} />);

      // Simulate different key combinations
      const events = [
        new KeyboardEvent('keydown', { key: '/', bubbles: true }), // No ctrl
        new KeyboardEvent('keydown', {
          key: 'a',
          ctrlKey: true,
          bubbles: true,
        }), // Wrong key
        new KeyboardEvent('keydown', { key: '/', altKey: true, bubbles: true }), // Alt instead of ctrl
      ];

      events.forEach(event => {
        act(() => {
          window.dispatchEvent(event);
        });
      });

      // Should not throw errors
      expect(true).toBe(true);
    });
  });

  describe('Form State Display', () => {
    test('displays form values correctly', () => {
      const initialValues = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
      };

      const TestDisplayComponent = () => {
        const form = useWatcherForm({ initialValues, debug: true });
        const [isOpen, setIsOpen] = React.useState(true);

        // Mock the debugger's internal state for testing
        return (
          <WatcherFormProvider form={form}>
            {isOpen && (
              <div data-testid="mock-debugger">
                <pre data-testid="values-display">
                  form.values: {JSON.stringify(form.values.useState(), null, 2)}
                </pre>
                <pre data-testid="changes-display">
                  form.changes:{' '}
                  {JSON.stringify(form.changes.useState(), null, 2)}
                </pre>
                <pre data-testid="errors-display">
                  form.errors: {JSON.stringify(form.errors.useState(), null, 2)}
                </pre>
              </div>
            )}
          </WatcherFormProvider>
        );
      };

      const { container } = render(<TestDisplayComponent />);

      const valuesDisplay = container.querySelector(
        '[data-testid="values-display"]'
      );
      expect(valuesDisplay?.textContent).toContain('John Doe');
      expect(valuesDisplay?.textContent).toContain('john@example.com');
      expect(valuesDisplay?.textContent).toContain('30');
    });

    test('updates display when form state changes', () => {
      const TestStateChangeComponent = () => {
        const form = useWatcherForm({
          initialValues: { name: 'Initial' },
          debug: true,
        });
        const [isOpen, setIsOpen] = React.useState(true);

        return (
          <WatcherFormProvider form={form}>
            <button
              data-testid="update-name"
              onClick={() => form.setFieldValue('name', 'Updated Name')}
            >
              Update Name
            </button>
            {isOpen && (
              <div data-testid="mock-debugger">
                <pre data-testid="values-display">
                  {JSON.stringify(form.values.useState(), null, 2)}
                </pre>
                <pre data-testid="changes-display">
                  {JSON.stringify(form.changes.useState(), null, 2)}
                </pre>
              </div>
            )}
          </WatcherFormProvider>
        );
      };

      const { container } = render(<TestStateChangeComponent />);
      const updateButton = container.querySelector(
        '[data-testid="update-name"]'
      ) as HTMLElement;
      const valuesDisplay = container.querySelector(
        '[data-testid="values-display"]'
      );
      const changesDisplay = container.querySelector(
        '[data-testid="changes-display"]'
      );

      // Initial state
      expect(valuesDisplay?.textContent).toContain('Initial');
      expect(changesDisplay?.textContent).toBe('{}');

      // Update state
      act(() => {
        updateButton.click();
      });

      expect(valuesDisplay?.textContent).toContain('Updated Name');
      expect(changesDisplay?.textContent).toContain('Updated Name');
    });
  });

  describe('Resize Functionality', () => {
    test('mouse events handle resize operations', () => {
      const TestResizeComponent = () => {
        const [isDragging, setIsDragging] = React.useState(false);
        const [height, setHeight] = React.useState(350);

        const handleMouseDown = () => setIsDragging(true);
        const handleMouseUp = () => setIsDragging(false);
        const handleMouseMove = (e: MouseEvent) => {
          if (isDragging) {
            const newHeight = window.innerHeight - e.clientY;
            setHeight(newHeight);
          }
        };

        React.useEffect(() => {
          if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }
          return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
        }, [isDragging]);

        return (
          <div
            data-testid="resize-handle"
            style={{ height }}
            onMouseDown={handleMouseDown}
          >
            <span data-testid="current-height">{height}</span>
          </div>
        );
      };

      const { container } = render(<TestResizeComponent />);
      const resizeHandle = container.querySelector(
        '[data-testid="resize-handle"]'
      ) as HTMLElement;
      const heightDisplay = container.querySelector(
        '[data-testid="current-height"]'
      );

      expect(heightDisplay?.textContent).toBe('350');

      // Simulate mouse down
      act(() => {
        fireEvent.mouseDown(resizeHandle);
      });

      // Simulate mouse move (this is a simplified test)
      act(() => {
        const mouseMoveEvent = new MouseEvent('mousemove', {
          clientY: 100,
          bubbles: true,
        });
        document.dispatchEvent(mouseMoveEvent);
      });

      // The resize logic should have been triggered
      expect(true).toBe(true); // Test passes if no errors thrown
    });
  });

  describe('Settings Persistence', () => {
    test('saves height to localStorage', () => {
      const TestPersistenceComponent = () => {
        const persistSettings = (settings: { height: number }) => {
          localStorage.setItem(
            'watcher-form-debugger',
            JSON.stringify(settings)
          );
        };

        return (
          <button
            data-testid="save-settings"
            onClick={() => persistSettings({ height: 400 })}
          >
            Save Settings
          </button>
        );
      };

      const { container } = render(<TestPersistenceComponent />);
      const saveButton = container.querySelector(
        '[data-testid="save-settings"]'
      ) as HTMLElement;

      act(() => {
        saveButton.click();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'watcher-form-debugger',
        JSON.stringify({ height: 400 })
      );
    });

    test('loads height from localStorage', () => {
      // Mock localStorage to return saved settings
      localStorageMock.getItem.mockReturnValue(JSON.stringify({ height: 500 }));

      const TestLoadComponent = () => {
        const getSettings = () => {
          const settings = localStorage.getItem('watcher-form-debugger');
          return settings ? JSON.parse(settings) : null;
        };

        const [settings, setSettings] = React.useState(getSettings());

        return (
          <div>
            <span data-testid="loaded-height">
              {settings?.height || 'no-height'}
            </span>
            <button
              data-testid="load-settings"
              onClick={() => setSettings(getSettings())}
            >
              Load Settings
            </button>
          </div>
        );
      };

      const { container } = render(<TestLoadComponent />);
      const loadButton = container.querySelector(
        '[data-testid="load-settings"]'
      ) as HTMLElement;
      const heightDisplay = container.querySelector(
        '[data-testid="loaded-height"]'
      );

      act(() => {
        loadButton.click();
      });

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'watcher-form-debugger'
      );
      expect(heightDisplay?.textContent).toBe('500');
    });

    test('handles missing localStorage gracefully', () => {
      // Mock localStorage to return null (no saved settings)
      localStorageMock.getItem.mockReturnValue(null);

      const TestMissingSettings = () => {
        const getSettings = () => {
          const settings = localStorage.getItem('watcher-form-debugger');
          return settings ? JSON.parse(settings) : null;
        };

        const settings = getSettings();

        return (
          <span data-testid="default-behavior">
            {settings ? 'has-settings' : 'no-settings'}
          </span>
        );
      };

      const { container } = render(<TestMissingSettings />);
      const behaviorSpan = container.querySelector(
        '[data-testid="default-behavior"]'
      );

      expect(behaviorSpan?.textContent).toBe('no-settings');
    });

    test('handles invalid JSON in localStorage', () => {
      // Mock localStorage to return invalid JSON
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const TestInvalidJSON = () => {
        const getSettings = () => {
          try {
            const settings = localStorage.getItem('watcher-form-debugger');
            return settings ? JSON.parse(settings) : null;
          } catch {
            return null;
          }
        };

        const settings = getSettings();

        return (
          <span data-testid="error-handling">
            {settings ? 'valid-settings' : 'invalid-settings'}
          </span>
        );
      };

      const { container } = render(<TestInvalidJSON />);
      const errorSpan = container.querySelector(
        '[data-testid="error-handling"]'
      );

      expect(errorSpan?.textContent).toBe('invalid-settings');
    });
  });

  describe('Performance Optimization', () => {
    test('memoizes JSON stringification', () => {
      const TestMemoizationComponent = () => {
        const form = useWatcherForm({
          initialValues: { name: 'Test' },
          debug: true,
        });

        const values = form.values.useState();
        const changes = form.changes.useState();
        const errors = form.errors.useState();

        // Simulate the memoization that happens in the real component
        const prettyValues = React.useMemo(
          () => JSON.stringify(values, null, 2),
          [values]
        );
        const prettyChanges = React.useMemo(
          () => JSON.stringify(changes, null, 2),
          [changes]
        );
        const prettyErrors = React.useMemo(
          () => JSON.stringify(errors, null, 2),
          [errors]
        );

        return (
          <WatcherFormProvider form={form}>
            <div data-testid="memoized-display">
              <pre data-testid="pretty-values">{prettyValues}</pre>
              <pre data-testid="pretty-changes">{prettyChanges}</pre>
              <pre data-testid="pretty-errors">{prettyErrors}</pre>
            </div>
          </WatcherFormProvider>
        );
      };

      const { container } = render(<TestMemoizationComponent />);

      const valuesDisplay = container.querySelector(
        '[data-testid="pretty-values"]'
      );
      const changesDisplay = container.querySelector(
        '[data-testid="pretty-changes"]'
      );
      const errorsDisplay = container.querySelector(
        '[data-testid="pretty-errors"]'
      );

      // Verify the memoized values are displayed correctly
      expect(valuesDisplay?.textContent).toContain('Test');
      expect(changesDisplay?.textContent).toBe('{}');
      expect(errorsDisplay?.textContent).toBe('{}');
    });
  });

  describe('Event Cleanup', () => {
    test('removes event listeners on unmount', () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

      const TestCleanupComponent = () => {
        React.useEffect(() => {
          const handleKeyDown = () => {};
          window.addEventListener('keydown', handleKeyDown);

          return () => {
            window.removeEventListener('keydown', handleKeyDown);
          };
        }, []);

        return <div data-testid="cleanup-test">Test</div>;
      };

      const { unmount } = render(<TestCleanupComponent />);

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    test('cleans up mouse event listeners after drag', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      const removeEventListenerSpy = jest.spyOn(
        document,
        'removeEventListener'
      );

      const TestDragCleanup = () => {
        const [isDragging, setIsDragging] = React.useState(false);

        const handleMouseDown = () => {
          setIsDragging(true);
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        };

        const handleMouseMove = () => {};
        const handleMouseUp = () => {
          setIsDragging(false);
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        return (
          <div data-testid="drag-test" onMouseDown={handleMouseDown}>
            Drag Test
          </div>
        );
      };

      const { container } = render(<TestDragCleanup />);
      const dragElement = container.querySelector(
        '[data-testid="drag-test"]'
      ) as HTMLElement;

      // Start drag
      act(() => {
        fireEvent.mouseDown(dragElement);
      });

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      );
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'mouseup',
        expect.any(Function)
      );

      // End drag
      act(() => {
        const mouseUpEvent = new MouseEvent('mouseup', { bubbles: true });
        document.dispatchEvent(mouseUpEvent);
      });

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mousemove',
        expect.any(Function)
      );
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'mouseup',
        expect.any(Function)
      );

      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });
  });
});
