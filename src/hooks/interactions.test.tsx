import { act, renderHook } from '@testing-library/react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import { GridElement } from 'types';
import { WATCH_ELEMENTS_HEIGHT_DELAY, WATCH_ELEMENTS_NOT_ORGANIZED_DELAY } from '@/consts';
import { createWrapper, ref } from '../../test/gridContext';
import { state as panZoomState, resetPanZoomMock } from '../../test/panzoomMock';
import useApi from './useApi';
import useDragSafetyNet from './useDragSafetyNet';
import useOnAfterResize from './useOnAfterResize';
import useOnClick from './useOnClick';
import useOnElementMouseUp from './useOnElementMouseUp';
import useOnElementsChange from './useOnElementsChange';
import useOrganizeElements from './useOrganizeElements';
import useRefreshOrganizeElements from './useRefreshOrganizeElements';
import useWatchElementsHeight from './useWatchElementsHeight';

const el = (props: Partial<GridElement>): GridElement => ({
  x: 0, y: 0, w: 1, h: 1, render: () => null, ...props,
} as GridElement);

const createEvent = () => ({
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
});

const registerInPanZoom = (
  id: string | number,
  position: { x: number, y: number },
  rect: { width: number, height: number } = { width: 100, height: 50 },
) => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  node.getBoundingClientRect = () => rect as DOMRect;
  panZoomState.elements[id] = { node: { current: node }, position };
  return node;
};

beforeEach(() => {
  resetPanZoomMock();
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('useOnClick', () => {
  const setup = (overrides = {}) => {
    const grid = document.createElement('div');
    document.body.appendChild(grid);
    const node = document.createElement('div');
    node.className = 'react-panzoom-element--id-a';
    grid.appendChild(node);

    return createWrapper({
      elements: [el({ id: 'a' }), el({ id: 'disabled', disabled: true })],
      gridRef: ref(grid),
      ...overrides,
    });
  };

  it('ignores an unknown element', () => {
    const { wrapper, value } = setup();
    const { result } = renderHook(() => useOnClick(), { wrapper });
    const e = createEvent();

    act(() => result.current({ e, id: 'missing' } as never));

    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(value.setSelectedElements).not.toHaveBeenCalled();
  });

  it('ignores a disabled element', () => {
    const { wrapper, value } = setup();
    const { result } = renderHook(() => useOnClick(), { wrapper });
    const e = createEvent();

    act(() => result.current({ e, id: 'disabled' } as never));

    expect(e.preventDefault).not.toHaveBeenCalled();
    expect(value.setSelectedElements).not.toHaveBeenCalled();
  });

  it('grabs the element when nothing stops the click', () => {
    const onElementClick = vi.fn();
    const { wrapper, value } = setup({ onElementClick });
    const { result } = renderHook(() => useOnClick(), { wrapper });
    const e = createEvent();
    const stop = vi.fn();

    act(() => result.current({ e, id: 'a', stop } as never));

    expect(e.preventDefault).toHaveBeenCalled();
    expect(e.stopPropagation).toHaveBeenCalled();
    expect(onElementClick).toHaveBeenCalledWith(value.elements[0], expect.anything());
    expect(stop).not.toHaveBeenCalled();
    expect(value.setSelectedElements).toHaveBeenCalled();
  });

  it('does not grab the element when the consumer stops the click', () => {
    const onElementClick = vi.fn((_element, { stop }) => stop());
    const { wrapper, value } = setup({ onElementClick });
    const { result } = renderHook(() => useOnClick(), { wrapper });
    const stop = vi.fn();

    act(() => result.current({ e: createEvent(), id: 'a', stop } as never));

    expect(stop).toHaveBeenCalled();
    expect(value.setSelectedElements).not.toHaveBeenCalled();
  });

  it('works without an onElementClick handler', () => {
    const { wrapper, value } = setup();
    const { result } = renderHook(() => useOnClick(), { wrapper });

    act(() => result.current({ e: createEvent(), id: 'a', stop: vi.fn() } as never));

    expect(value.setSelectedElements).toHaveBeenCalled();
  });
});

describe('useOnElementMouseUp', () => {
  const setup = (overrides = {}) => {
    const target = document.createElement('div');
    return {
      target,
      ...createWrapper({
        elementRef: ref(target),
        elements: [el({ id: 'a', x: 1, y: 1 })],
        currentElements: ref([el({ id: 'a', x: 2, y: 2 })]),
        selectedElements: [el({ id: 'a', x: 2, y: 2 })],
        ...overrides,
      }),
    };
  };

  it('commits the drag and clears the transient state', () => {
    registerInPanZoom('a', { x: 0, y: 0 });
    const flush = vi.fn();
    const { wrapper, value, target } = setup({
      flushElementsChangeRef: ref(flush),
      dragActiveRef: ref(true),
    });

    const { result } = renderHook(() => useOnElementMouseUp(), { wrapper });
    const e = createEvent();

    act(() => result.current({ e } as never));

    expect(e.preventDefault).toHaveBeenCalled();
    expect(flush).toHaveBeenCalled();
    expect(value.dragActiveRef.current).toBe(false);
    expect(panZoomState.updateElementPositionSilentCalls).toHaveLength(1);
    expect(value.setElements).toHaveBeenCalledWith([expect.anything()], { type: 'user' });
    expect(value.currentElements.current).toStrictEqual([]);
    expect(value.setSelectedElements).toHaveBeenCalledWith([]);
    expect(value.elementsHeightRef.current).toStrictEqual({});
    expect(target.style.transition).toBe('all 0.3s');
  });

  it('reverts to the committed elements on a collision', () => {
    registerInPanZoom('a', { x: 0, y: 0 });
    const { wrapper, value } = setup({ hasCollision: ref(true) });

    const { result } = renderHook(() => useOnElementMouseUp(), { wrapper });
    act(() => result.current({ e: createEvent() } as never));

    expect(value.setElements).not.toHaveBeenCalled();
    expect(value.hasCollision.current).toBe(false);
    expect(panZoomState.updateElementPositionSilentCalls).toHaveLength(1);
  });

  it('works without a pending throttled change', () => {
    registerInPanZoom('a', { x: 0, y: 0 });
    const { wrapper, value } = setup({ flushElementsChangeRef: ref(null) });

    const { result } = renderHook(() => useOnElementMouseUp(), { wrapper });
    act(() => result.current({ e: createEvent() } as never));

    expect(value.setElements).toHaveBeenCalled();
  });
});

describe('useOnAfterResize', () => {
  const setup = (elements: GridElement[], overrides = {}) => createWrapper({
    cols: 4,
    colWidth: 50,
    gapHorizontal: 10,
    gapVertical: 10,
    paddingLeft: 0,
    rowHeight: 20,
    rows: 10,
    elements,
    ...overrides,
  });

  it('resizes the element and re-organizes the grid', () => {
    const node = registerInPanZoom('a', { x: 0, y: 0 }, { width: 110, height: 50 });
    const elements = [el({ id: 'a', x: 0, y: 0 })];
    const { wrapper, value } = setup(elements);

    const { result } = renderHook(() => useOnAfterResize(), { wrapper });
    act(() => result.current({ id: 'a' } as never));

    const [nextElements, options] = (value.setElements as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(options).toStrictEqual({ type: 'user' });
    expect(nextElements[0].w).toBe(2);
    expect(nextElements[0].h).toBe(2);
    expect(node.style.width).toBe('110px');
    expect(node.style.height).toBe('50px');
    expect(node.style.transition).toBe('0.3s all');
    expect(value.setSelectedElements).toHaveBeenCalledWith([]);
    expect(value.elementsHeightRef.current).toStrictEqual({});
  });

  it('leaves the other elements untouched', () => {
    registerInPanZoom('a', { x: 0, y: 0 }, { width: 110, height: 50 });
    const other = el({ id: 'other', x: 3, y: 6 });
    const { wrapper, value } = setup([el({ id: 'a', x: 0, y: 0 }), other]);

    const { result } = renderHook(() => useOnAfterResize(), { wrapper });
    act(() => result.current({ id: 'a' } as never));

    const [nextElements] = (value.setElements as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(nextElements.find((item: GridElement) => item.id === 'other')).toStrictEqual(other);
  });

  it('never shrinks an element below one cell', () => {
    registerInPanZoom('a', { x: 0, y: 0 }, { width: 1, height: 1 });
    const { wrapper, value } = setup([el({ id: 'a', x: 0, y: 0 })]);

    const { result } = renderHook(() => useOnAfterResize(), { wrapper });
    act(() => result.current({ id: 'a' } as never));

    const [nextElements] = (value.setElements as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(nextElements[0].w).toBe(1);
    expect(nextElements[0].h).toBe(1);
  });

  it('keeps an auto height untouched', () => {
    const node = registerInPanZoom('a', { x: 0, y: 0 }, { width: 110, height: 50 });
    const { wrapper, value } = setup([el({ id: 'a', x: 0, y: 0, h: 'auto' })]);

    const { result } = renderHook(() => useOnAfterResize(), { wrapper });
    act(() => result.current({ id: 'a' } as never));

    const [nextElements] = (value.setElements as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(nextElements[0].h).toBe('auto');
    expect(node.style.height).toBe('');
  });

  it('does not set a width while the column width is unknown', () => {
    const node = registerInPanZoom('a', { x: 0, y: 0 }, { width: 110, height: 50 });
    const { wrapper } = setup([el({ id: 'a', x: 0, y: 0 })], { colWidth: 'auto' });

    const { result } = renderHook(() => useOnAfterResize(), { wrapper });
    act(() => result.current({ id: 'a' } as never));

    expect(node.style.width).toBe('');
  });

  it('reverts to the original element when the resize does not fit', () => {
    registerInPanZoom('a', { x: 0, y: 0 }, { width: 110, height: 50 });
    const original = el({ id: 'a', x: 0, y: 0 });
    const { wrapper, value } = setup([original], {
      organizeGridElements: () => [],
    });

    const { result } = renderHook(() => useOnAfterResize(), { wrapper });
    act(() => result.current({ id: 'a' } as never));

    expect(value.setElements).not.toHaveBeenCalled();
    expect(panZoomState.updateElementPositionSilentCalls).toStrictEqual([['a', { x: 0, y: 0 }]]);
  });

  it('scales the measured size by the current zoom', () => {
    registerInPanZoom('a', { x: 0, y: 0 }, { width: 220, height: 100 });
    panZoomState.zoom = 2;
    const { wrapper, value } = setup([el({ id: 'a', x: 0, y: 0 })]);

    const { result } = renderHook(() => useOnAfterResize(), { wrapper });
    act(() => result.current({ id: 'a' } as never));

    const [nextElements] = (value.setElements as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(nextElements[0].w).toBe(2);
    expect(nextElements[0].h).toBe(2);
  });
});

describe('useOrganizeElements', () => {
  it('snaps every element back onto the grid and commits the result', () => {
    registerInPanZoom('a', { x: 61, y: 31 });
    const elements = [el({ id: 'a', x: 0, y: 0 }), el({ id: 'notInPanZoom', x: 3, y: 3 })];
    const { wrapper, value } = createWrapper({ elements });

    const { result } = renderHook(() => useOrganizeElements(), { wrapper });

    let nextElements: GridElement[];
    act(() => { nextElements = result.current(); });

    expect(elements[0].x).toBe(1);
    expect(elements[0].y).toBe(1);
    expect(panZoomState.updateElementPositionSilentCalls).toStrictEqual([['a', { x: 60, y: 30 }]]);
    expect(value.setElements).toHaveBeenCalledWith(nextElements, { type: 'programmatic' });
    expect(value.hasCollision.current).toBe(false);
  });

  it('adds the requested bottom margin when measuring', () => {
    const organizeGridElements = vi.fn(({ startingElements }) => startingElements);
    const element = el({ id: 'a', x: 0, y: 0, h: 2 });
    const { wrapper } = createWrapper({ elements: [element], organizeGridElements });

    const { result } = renderHook(() => useOrganizeElements(), { wrapper });
    act(() => { result.current([], { marginBottomAtElements: { a: 3 } }); });

    const { measureElementHeight } = organizeGridElements.mock.calls[0][0];
    expect(measureElementHeight(element)).toBe(5);
  });

  it('reports a collision and keeps the current elements', () => {
    const elements = [el({ id: 'a' })];
    const { wrapper, value } = createWrapper({
      elements,
      organizeGridElements: () => [],
    });

    const { result } = renderHook(() => useOrganizeElements(), { wrapper });

    let returned: GridElement[];
    act(() => { returned = result.current(); });

    expect(returned).toBe(elements);
    expect(value.hasCollision.current).toBe(true);
    expect(value.setElements).not.toHaveBeenCalled();
  });
});

describe('useOnElementsChange', () => {
  const setup = (overrides = {}) => createWrapper({
    colWidth: 50,
    gapHorizontal: 10,
    gapVertical: 10,
    paddingLeft: 0,
    rowHeight: 20,
    cols: 4,
    rows: 10,
    elements: [el({ id: 'a', x: 0, y: 0 })],
    currentElements: ref([el({ id: 'a', x: 0, y: 0 })]),
    ...overrides,
  });

  it('throttles the updates and only runs the last one', () => {
    vi.useFakeTimers();
    registerInPanZoom('a', { x: 0, y: 0 });
    const dragged = el({ id: 'a', x: 0, y: 0 });
    const { wrapper, value } = setup({ currentElements: ref([dragged]) });

    const { result } = renderHook(() => useOnElementsChange(), { wrapper });

    act(() => {
      result.current({ a: { x: 60, y: 30 } });
      result.current({ a: { x: 120, y: 60 } });
    });

    expect(value.dragActiveRef.current).toBe(true);
    expect(dragged.x).toBe(0);

    act(() => { vi.advanceTimersByTime(250); });

    // only the last of the throttled positions was applied
    expect(dragged.x).toBe(2);
    expect(dragged.y).toBe(2);
    expect(value.hasCollision.current).toBe(false);
  });

  it('ignores positions of elements it does not track', () => {
    vi.useFakeTimers();
    registerInPanZoom('a', { x: 500, y: 500 });
    const dragged = el({ id: 'a', x: 0, y: 0 });
    const { wrapper } = setup({ currentElements: ref([dragged]) });

    const { result } = renderHook(() => useOnElementsChange(), { wrapper });
    act(() => { result.current({ other: { x: 500, y: 500 } }); });
    act(() => { vi.advanceTimersByTime(250); });

    expect(dragged.x).toBe(0);
    // 'a' carries no incoming position, so panzoom snaps it back onto its cell
    expect(panZoomState.updateElementPositionSilentCalls).toStrictEqual([['a', { x: 0, y: 0 }]]);
  });

  it('flags a collision and leaves the current elements untouched', () => {
    vi.useFakeTimers();
    registerInPanZoom('a', { x: 0, y: 0 });
    const currentElements = ref([el({ id: 'a', x: 0, y: 0 })]);
    const { wrapper, value } = setup({
      currentElements,
      organizeGridElements: () => [],
    });

    const { result } = renderHook(() => useOnElementsChange(), { wrapper });
    act(() => { result.current({ a: { x: 60, y: 30 } }); });
    act(() => { vi.advanceTimersByTime(250); });

    expect(value.hasCollision.current).toBe(true);
    expect(value.currentElements.current).toBe(currentElements.current);
  });

  it('flushes the pending change from the live panzoom positions', () => {
    vi.useFakeTimers();
    registerInPanZoom('a', { x: 120, y: 60 });
    const dragged = el({ id: 'a', x: 0, y: 0 });
    const { wrapper, value } = setup({ currentElements: ref([dragged]) });

    const { result } = renderHook(() => useOnElementsChange(), { wrapper });
    act(() => { result.current({ a: { x: 0, y: 0 } }); });

    act(() => { value.flushElementsChangeRef.current(); });

    // the live panzoom position wins over the throttled snapshot
    expect(dragged.x).toBe(2);
    expect(dragged.y).toBe(2);

    // the throttled callback was cancelled, so nothing overwrites it later
    dragged.x = 9;
    act(() => { vi.advanceTimersByTime(500); });
    expect(dragged.x).toBe(9);
  });

  it('does nothing on flush when panzoom is not ready', () => {
    const { wrapper, value } = setup({ panZoomRef: ref(null) });

    renderHook(() => useOnElementsChange(), { wrapper });
    expect(() => value.flushElementsChangeRef.current()).not.toThrow();
  });
});

describe('useDragSafetyNet', () => {
  const rafSync = () => vi.spyOn(window, 'requestAnimationFrame')
    .mockImplementation((cb) => { cb(0); return 0; });

  it('does nothing when no drag is active', () => {
    rafSync();
    const { wrapper, value } = createWrapper({ dragActiveRef: ref(false) });
    renderHook(() => useDragSafetyNet(), { wrapper });

    act(() => { window.dispatchEvent(new Event('pointerup')); });

    expect(value.setSelectedElements).not.toHaveBeenCalled();
  });

  it('reverts a drag that never committed', () => {
    rafSync();
    registerInPanZoom('a', { x: 999, y: 999 });
    const flush = vi.fn();
    const { wrapper, value } = createWrapper({
      dragActiveRef: ref(true),
      flushElementsChangeRef: ref(flush),
      elements: [el({ id: 'a', x: 0, y: 0 })],
      currentElements: ref([el({ id: 'a' })]),
      elementsHeightRef: ref({ a: 2 }),
      hasCollision: ref(true),
    });

    renderHook(() => useDragSafetyNet(), { wrapper });
    act(() => { window.dispatchEvent(new Event('pointerup')); });

    expect(flush).toHaveBeenCalled();
    expect(panZoomState.updateElementPositionSilentCalls).toStrictEqual([['a', { x: 0, y: 0 }]]);
    expect(value.currentElements.current).toStrictEqual([]);
    expect(value.elementsHeightRef.current).toStrictEqual({});
    expect(value.hasCollision.current).toBe(false);
    expect(value.dragActiveRef.current).toBe(false);
    expect(value.setSelectedElements).toHaveBeenCalledWith([]);
  });

  it('reverts without a pending throttled change', () => {
    rafSync();
    registerInPanZoom('a', { x: 999, y: 999 });
    const { wrapper, value } = createWrapper({
      dragActiveRef: ref(true),
      flushElementsChangeRef: ref(null),
      elements: [el({ id: 'a', x: 0, y: 0 })],
    });

    renderHook(() => useDragSafetyNet(), { wrapper });
    act(() => { window.dispatchEvent(new Event('pointerup')); });

    expect(value.dragActiveRef.current).toBe(false);
  });

  it('removes its listener on unmount', () => {
    rafSync();
    const { wrapper, value } = createWrapper({ dragActiveRef: ref(true) });
    const { unmount } = renderHook(() => useDragSafetyNet(), { wrapper });

    unmount();
    act(() => { window.dispatchEvent(new Event('pointerup')); });

    expect(value.setSelectedElements).not.toHaveBeenCalled();
  });
});

describe('useRefreshOrganizeElements', () => {
  const setup = (overrides = {}) => {
    registerInPanZoom('a', { x: 0, y: 0 });
    return createWrapper({
      autoOrganizeElements: true,
      elements: [el({ id: 'a', x: 0, y: 0 })],
      ...overrides,
    });
  };

  it('organizes the elements after the delay', () => {
    vi.useFakeTimers();
    const { wrapper, value } = setup();

    renderHook(() => useRefreshOrganizeElements(), { wrapper });
    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_NOT_ORGANIZED_DELAY); });

    expect(value.setElements).toHaveBeenCalledTimes(1);
  });

  it('does not run twice for an unchanged checksum', () => {
    vi.useFakeTimers();
    const { wrapper, value } = setup();

    const { rerender } = renderHook(() => useRefreshOrganizeElements(), { wrapper });
    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_NOT_ORGANIZED_DELAY); });

    rerender();
    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_NOT_ORGANIZED_DELAY); });

    expect(value.setElements).toHaveBeenCalledTimes(1);
  });

  it('is disabled without autoOrganizeElements', () => {
    vi.useFakeTimers();
    const { wrapper, value } = setup({ autoOrganizeElements: false });

    renderHook(() => useRefreshOrganizeElements(), { wrapper });
    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_NOT_ORGANIZED_DELAY); });

    expect(value.setElements).not.toHaveBeenCalled();
  });

  it('waits while an element is selected', () => {
    vi.useFakeTimers();
    const { wrapper, value } = setup({ selectedElements: [el({ id: 'a' })] });

    renderHook(() => useRefreshOrganizeElements(), { wrapper });
    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_NOT_ORGANIZED_DELAY); });

    expect(value.setElements).not.toHaveBeenCalled();
  });

  it('cancels the pending run on unmount', () => {
    vi.useFakeTimers();
    const { wrapper, value } = setup();

    const { unmount } = renderHook(() => useRefreshOrganizeElements(), { wrapper });
    unmount();
    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_NOT_ORGANIZED_DELAY); });

    expect(value.setElements).not.toHaveBeenCalled();
  });
});

describe('useWatchElementsHeight', () => {
  const setupNode = (id: string, height: number) => {
    const parent = document.createElement('div');
    const node = document.createElement('div');
    parent.appendChild(node);
    document.body.appendChild(parent);
    node.getBoundingClientRect = () => ({ height }) as DOMRect;
    return { id, node, parent };
  };

  it('keeps the wrapper height of auto elements in sync', () => {
    vi.useFakeTimers();
    const { node, parent } = setupNode('a', 40);

    const { wrapper } = createWrapper({
      elements: [
        el({ id: 'a', h: 'auto' }),
        el({ id: 'fixed', h: 2 }),
        el({ id: 'noNode', h: 'auto' }),
      ],
      elementsNodes: ref({ a: node }),
      gapVertical: 10,
      rowHeight: 20,
    });

    renderHook(() => useWatchElementsHeight(), { wrapper });
    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_HEIGHT_DELAY); });

    expect(parent.style.height).toBe('50px'); // 2 rows: 2 * 30 - 10
  });

  it('skips an element whose node has no parent', () => {
    vi.useFakeTimers();
    const orphan = document.createElement('div');
    orphan.getBoundingClientRect = () => ({ height: 40 }) as DOMRect;

    const { wrapper } = createWrapper({
      elements: [el({ id: 'a', h: 'auto' })],
      elementsNodes: ref({ a: orphan }),
    });

    renderHook(() => useWatchElementsHeight(), { wrapper });
    expect(() => act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_HEIGHT_DELAY); })).not.toThrow();
  });

  it('reports the measured heights only when they change', () => {
    vi.useFakeTimers();
    const { node } = setupNode('a', 40);
    const onElementsMeasureUpdate = vi.fn();

    const { wrapper } = createWrapper({
      elements: [el({ id: 'a', h: 'auto' })],
      elementsNodes: ref({ a: node }),
      onElementsMeasureUpdateRef: ref(onElementsMeasureUpdate),
      gapVertical: 10,
      rowHeight: 20,
    });

    const { unmount } = renderHook(() => useWatchElementsHeight(), { wrapper });

    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_HEIGHT_DELAY); });
    expect(onElementsMeasureUpdate).toHaveBeenCalledWith({ a: 2 });

    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_HEIGHT_DELAY); });
    expect(onElementsMeasureUpdate).toHaveBeenCalledTimes(1);

    node.getBoundingClientRect = () => ({ height: 100 }) as DOMRect;
    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_HEIGHT_DELAY); });
    expect(onElementsMeasureUpdate).toHaveBeenLastCalledWith({ a: 5 });

    unmount();
    act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_HEIGHT_DELAY); });
    expect(onElementsMeasureUpdate).toHaveBeenCalledTimes(2);
  });

  it('does nothing without an onElementsMeasureUpdate handler', () => {
    vi.useFakeTimers();
    const { wrapper } = createWrapper({
      elements: [el({ id: 'a', h: 2 })],
      onElementsMeasureUpdateRef: ref(undefined),
    });

    renderHook(() => useWatchElementsHeight(), { wrapper });
    expect(() => act(() => { vi.advanceTimersByTime(WATCH_ELEMENTS_HEIGHT_DELAY); })).not.toThrow();
  });
});

describe('useApi', () => {
  const setup = () => {
    const forwardRef = ref(null);
    const node = registerInPanZoom('a', { x: 0, y: 0 }, { width: 100, height: 40 });
    const parent = document.createElement('div');
    parent.appendChild(node);
    parent.getBoundingClientRect = () => ({ height: 60 }) as DOMRect;

    const { wrapper, value } = createWrapper({
      forwardRef,
      elements: [el({ id: 'a', x: 0, y: 0, h: 2 })],
      elementsNodes: ref({ a: node }),
      gapVertical: 10,
      rowHeight: 20,
    });

    renderHook(() => useApi(), { wrapper });

    return { api: forwardRef.current as never, value, node };
  };

  it('exposes calculateCellPositionByPixels', () => {
    const { api } = setup();
    expect(api.calculateCellPositionByPixels(0, 0)).toStrictEqual({ x: 0, y: 0 });
  });

  it('exposes the lowest element bottom', () => {
    const { api } = setup();
    expect(api.getLowestElementBottomInPixels()).toBe(2 * 30 - 10);
  });

  it('exposes the panzoom api', () => {
    const { api, value } = setup();
    expect(api.getPanZoom()).toBe(value.panZoomRef.current);
  });

  it('grabs an element through panzoom', () => {
    vi.useFakeTimers();
    const { api } = setup();

    act(() => { api.grabElement('a', { x: 1, y: 2 }); });
    expect(panZoomState.grabElementCalls).toStrictEqual([['a', { x: 1, y: 2 }]]);

    expect(() => act(() => { vi.advanceTimersByTime(0); })).not.toThrow();
  });

  it('measures a single element and returns null for an unknown one', () => {
    const { api } = setup();
    expect(api.measureElementHeight('a')).toBe(2);
    expect(api.measureElementHeight('missing')).toBeNull();
  });

  it('measures every element', () => {
    const { api } = setup();
    expect(api.measureElementsHeight()).toStrictEqual({ a: 2 });
  });

  it('exposes organizeElements', () => {
    const { api, value } = setup();
    act(() => { api.organizeElements(); });
    expect(value.setElements).toHaveBeenCalled();
  });

  it('reports the padding below each element', () => {
    const { api } = setup();
    expect(api.getElementsPaddingBottom()).toStrictEqual({ a: 20 });
  });
});
