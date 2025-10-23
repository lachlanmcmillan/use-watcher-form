import { beforeAll, afterAll } from 'bun:test';
import { JSDOM } from 'jsdom';

// Set up a fake DOM environment for testing
beforeAll(() => {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost/',
    pretendToBeVisual: true,
  });

  // Make DOM elements global
  global.window = dom.window as unknown as Window & typeof globalThis;
  global.document = dom.window.document;
  global.navigator = dom.window.navigator;
  global.getComputedStyle = dom.window.getComputedStyle;
  
  // Set up localStorage from JSDOM by default
  global.localStorage = dom.window.localStorage;
  
  // Add missing DOM event constructors
  global.KeyboardEvent = dom.window.KeyboardEvent;
  global.MouseEvent = dom.window.MouseEvent;
  global.Event = dom.window.Event;
  global.CustomEvent = dom.window.CustomEvent;
  global.FocusEvent = dom.window.FocusEvent;
  global.InputEvent = dom.window.InputEvent;
  
  // Add other missing DOM APIs
  global.HTMLElement = dom.window.HTMLElement;
  global.Element = dom.window.Element;
  global.Node = dom.window.Node;
  global.Range = dom.window.Range;
  global.Selection = dom.window.Selection;
});

// Clean up after all tests
afterAll(() => {
  // @ts-ignore
  delete global.window;
  // @ts-ignore
  delete global.document;
  // @ts-ignore
  delete global.navigator;
  // @ts-ignore
  delete global.getComputedStyle;
  // @ts-ignore
  delete global.localStorage;
  // @ts-ignore
  delete global.KeyboardEvent;
  // @ts-ignore
  delete global.MouseEvent;
  // @ts-ignore
  delete global.Event;
  // @ts-ignore
  delete global.CustomEvent;
  // @ts-ignore
  delete global.FocusEvent;
  // @ts-ignore
  delete global.InputEvent;
  // @ts-ignore
  delete global.HTMLElement;
  // @ts-ignore
  delete global.Element;
  // @ts-ignore
  delete global.Node;
  // @ts-ignore
  delete global.Range;
  // @ts-ignore
  delete global.Selection;
});
