import React from 'react';
import { createPortal } from 'react-dom';

import { useWatcherFormCtx } from './WatcherFormCtx';
import classes from './watcherFormDebugger.module.css';

const DEFAULT_HEIGHT = 350;

export const WatcherFormDebugger = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  // watch for the shortcut "ctrl + /" to show the debugger
  const handleKeyDown = React.useCallback((e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === '/') {
      setIsOpen(prev => !prev);
    }
  }, []);

  // listen for the <ctrl> + </> key combo
  React.useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) {
    return null;
  }

  return <WatcherFormDebuggerInner />;
};

export const WatcherFormDebuggerInner = () => {
  const form = useWatcherFormCtx();
  const changes = form.changes.useState();
  const errors = form.errors.useState();
  const values = form.values.useState();

  const isDragging = React.useRef(false);

  // keep reference to the Affix element so we can mutate its height style directly
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // keep track of the latest height while dragging so we can commit once on mouseup
  const latestHeight = React.useRef<number>(
    getSettings()?.height ?? DEFAULT_HEIGHT
  );

  const handleMouseUp = React.useCallback(() => {
    // persist the last height value to the settings store
    persistSettings({ height: latestHeight.current });

    isDragging.current = false;

    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    // calculate the new height based on cursor position
    const height = window.innerHeight - e.clientY;
    latestHeight.current = height;

    // mutate style in the next animation frame for smoother updates
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.style.height = `${height}px`;
      }
    });
  }, []);

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault(); // prevent text selection during drag

    if (!isDragging.current) {
      isDragging.current = true;
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }, []);

  // memoise heavy JSON stringifications so they don't rerun on height-only updates
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

  return createPortal(
    <div
      className={classes.watcherFormDebugger}
      ref={containerRef}
      style={{ height: latestHeight.current }}
    >
      <div className={classes.handle} onMouseDown={handleMouseDown} />
      <div className={classes.group}>
        <div className={classes.box}>
          <pre className={classes.scrollArea}>form.values: {prettyValues}</pre>
        </div>
        <div className={classes.box}>
          <pre className={classes.scrollArea}>
            form.changes: {prettyChanges}
          </pre>
        </div>
        <div className={classes.box}>
          <pre className={classes.scrollArea}>form.errors: {prettyErrors}</pre>
        </div>
      </div>
    </div>,
    document.body
  );
};

const SETTINGS_KEY = 'watcher-form-debugger';

const persistSettings = (settings: { height: number }) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const getSettings = () => {
  const settings = localStorage.getItem(SETTINGS_KEY);
  return settings ? JSON.parse(settings) : null;
};
