import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import { GridElement } from 'types';
import { createNode, createWrapper, ref } from '../../test/gridContext';
import { state as panZoomState, resetPanZoomMock } from '../../test/panzoomMock';
import measureElementHeightInit from '../measureElementHeightInit';
import { useGrid } from './useGrid';
import useApiLoaded from './useApiLoaded';
import useCalculateCellPositionByPixels from './useCalculateCellPositionByPixels';
import { useElementsChecksum } from './useElementsChecksum';
import useGrabElement from './useGrabElement';
import useInitElements from './useInitElements';
import useInternalWidth from './useInternalWidth';
import useIsMousePressed from './useIsMousePressed';
import useMeasureElementHeight from './useMeasureElementHeight';
import useMemoRef from './useMemoRef';
import useOnContainerZoomChange from './useOnContainerZoomChange';
import { useSortedElements } from './useSortedElements';
import useUpdateWithPanZoomApi from './useUpdateWithPanZoomApi';

const el = (props: Partial<GridElement>): GridElement => ({
  x: 0, y: 0, w: 1, h: 1, render: () => null, ...props,
} as GridElement);

beforeEach(() => {
  resetPanZoomMock();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useGrid', () => {
  it('returns an empty context by default', () => {
    const { result } = renderHook(() => useGrid());
    expect(result.current).toStrictEqual({});
  });

  it('returns the provided context', () => {
    const { wrapper, value } = createWrapper({ cols: 8 });
    const { result } = renderHook(() => useGrid(), { wrapper });
    expect(result.current).toBe(value);
    expect(result.current.cols).toBe(8);
  });
});

describe('useMemoRef', () => {
  it('keeps a stable identity while always calling the latest callback', () => {
    const first = vi.fn(() => 'first');
    const second = vi.fn(() => 'second');

    const { result, rerender } = renderHook(
      ({ cb }) => useMemoRef(cb),
      { initialProps: { cb: first as () => string } },
    );

    const memo = result.current;
    expect(memo()).toBe('first');

    rerender({ cb: second as () => string });

    expect(result.current).toBe(memo);
    expect(memo()).toBe('second');
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it('does nothing once the callback is gone', () => {
    const { result } = renderHook(() => useMemoRef(undefined as unknown as () => void));
    expect(result.current()).toBeUndefined();
  });
});

describe('useSortedElements', () => {
  it('returns the elements sorted by id', () => {
    const a = el({ id: 'b' });
    const b = el({ id: 'a' });
    const { wrapper } = createWrapper({ elements: [a, b] });

    const { result } = renderHook(() => useSortedElements(), { wrapper });
    expect(result.current).toStrictEqual([b, a]);
  });
});

describe('useOnContainerZoomChange', () => {
  it('clears the cached element heights', () => {
    const elementsHeightRef = ref({ a: 3 });
    const { wrapper } = createWrapper({ elementsHeightRef });

    const { result } = renderHook(() => useOnContainerZoomChange(), { wrapper });
    act(() => result.current());

    expect(elementsHeightRef.current).toStrictEqual({});
  });
});

describe('useIsMousePressed', () => {
  it('follows the pointer down/up events', () => {
    const { result, unmount } = renderHook(() => useIsMousePressed());
    expect(result.current).toBe(false);

    act(() => { window.dispatchEvent(new Event('pointerdown')); });
    expect(result.current).toBe(true);

    act(() => { window.dispatchEvent(new Event('pointerup')); });
    expect(result.current).toBe(false);

    unmount();
    act(() => { window.dispatchEvent(new Event('pointerdown')); });
    expect(result.current).toBe(false);
  });
});

describe('useApiLoaded', () => {
  it('is true as soon as the panzoom api is available', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useApiLoaded(), { wrapper });
    expect(result.current).toBe(true);
  });

  it('polls until the panzoom api shows up, then stops', () => {
    vi.useFakeTimers();
    const panZoomRef = ref(null);
    const { wrapper } = createWrapper({ panZoomRef });

    const { result, unmount } = renderHook(() => useApiLoaded(), { wrapper });
    expect(result.current).toBe(false);

    act(() => { vi.advanceTimersByTime(20); });
    expect(result.current).toBe(false);

    panZoomRef.current = {} as never;
    act(() => { vi.advanceTimersByTime(20); });
    expect(result.current).toBe(true);

    // the effect bails out early once loaded, so no interval is left behind
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe(true);

    unmount();
  });
});

describe('useInternalWidth', () => {
  it('uses the explicit width', () => {
    const { result, rerender } = renderHook(
      ({ width }) => useInternalWidth(width, ref<HTMLDivElement>(null)),
      { initialProps: { width: 300 } },
    );
    expect(result.current).toBe(300);

    rerender({ width: 500 });
    expect(result.current).toBe(500);
  });

  it('stays "auto" without a width and without a node', () => {
    const { result } = renderHook(() => useInternalWidth(0, ref<HTMLDivElement>(null)));
    expect(result.current).toBe('auto');
  });

  it('measures the node and follows window resizes', () => {
    const node = createNode(40, 123);
    const gridRef = ref(node);

    const { result, unmount } = renderHook(() => useInternalWidth(0, gridRef));
    expect(result.current).toBe(123);

    node.getBoundingClientRect = () => ({ width: 456 }) as DOMRect;
    act(() => { window.dispatchEvent(new Event('resize')); });
    expect(result.current).toBe(456);

    unmount();
    node.getBoundingClientRect = () => ({ width: 999 }) as DOMRect;
    act(() => { window.dispatchEvent(new Event('resize')); });
    expect(result.current).toBe(456);
  });
});

describe('useInitElements', () => {
  it('does nothing when every element is complete', () => {
    const setElements = vi.fn();
    const { wrapper } = createWrapper({
      elements: [el({ id: 'a', w: 1, h: 1 })],
      setElements,
    });

    renderHook(() => useInitElements(), { wrapper });
    expect(setElements).not.toHaveBeenCalled();
  });

  it('fills in missing ids and sizes exactly once', () => {
    const setElements = vi.fn();
    const known = el({ id: 'known', w: 2, h: 3 });
    const { wrapper } = createWrapper({
      elements: [
        { x: 0, y: 0, render: () => null } as GridElement,
        known,
      ],
      setElements,
    });

    const { rerender } = renderHook(() => useInitElements(), { wrapper });

    expect(setElements).toHaveBeenCalledTimes(1);
    const [nextElements, options] = setElements.mock.calls[0];
    expect(options).toStrictEqual({ type: 'programmatic' });
    expect(nextElements[0].id).toBeTruthy();
    expect(nextElements[0].w).toBe(1);
    expect(nextElements[0].h).toBe(1);
    expect(nextElements[1]).toBe(known);

    rerender();
    expect(setElements).toHaveBeenCalledTimes(1);
  });
});

describe('measureElementHeightInit / useMeasureElementHeight', () => {
  it('returns the fixed height of the element', () => {
    expect(measureElementHeightInit(ref(null), el({ id: 'a', h: 4 }), {}, 20)).toBe(4);
  });

  it('falls back to one row for a zero height', () => {
    expect(measureElementHeightInit(ref(null), el({ id: 'a', h: 0 }), {}, 20)).toBe(1);
  });

  it('returns one row when the panzoom api is not ready', () => {
    expect(measureElementHeightInit(ref(null), el({ id: 'a', h: 'auto' }), {}, 20)).toBe(1);
  });

  it('returns one row when the element has no node', () => {
    expect(measureElementHeightInit(
      ref({ getZoom: () => 1 }) as never,
      el({ id: 'a', h: 'auto' }),
      {},
      20,
    )).toBe(1);
  });

  it('measures an auto element against the zoom level', () => {
    const node = createNode(90);
    expect(measureElementHeightInit(
      ref({ getZoom: () => 2 }) as never,
      el({ id: 'a', h: 'auto' }),
      { a: node },
      20,
    )).toBe(3); // 90px / zoom 2 = 45px -> 3 rows of 20px
  });

  it('falls back to one row for an empty node', () => {
    const node = createNode(0);
    expect(measureElementHeightInit(
      ref({ getZoom: () => 1 }) as never,
      el({ id: 'a', h: 'auto' }),
      { a: node },
      20,
    )).toBe(1);
  });

  it('caches the measured height', () => {
    const element = el({ id: 'a', h: 'auto' });
    const node = createNode(40);
    const elementsHeightRef = ref<Record<string, number>>({});
    const { wrapper } = createWrapper({
      elements: [element],
      elementsHeightRef,
      elementsNodes: ref({ a: node }),
      rowHeight: 20,
    });

    const { result } = renderHook(() => useMeasureElementHeight(), { wrapper });

    expect(result.current(element)).toBe(2);
    expect(elementsHeightRef.current).toStrictEqual({ a: 2 });

    elementsHeightRef.current.a = 7;
    expect(result.current(element)).toBe(7);
  });
});

describe('useElementsChecksum', () => {
  it('builds a checksum out of the sorted elements and their heights', () => {
    const { wrapper } = createWrapper({
      elements: [el({ id: 'b', h: 2 }), el({ id: 'a', h: 1 })],
    });

    const { result } = renderHook(() => useElementsChecksum(), { wrapper });
    expect(result.current).toBe('--a-1--b-2');
  });
});

describe('useCalculateCellPositionByPixels', () => {
  it('returns x: 0 while the column width is unknown', () => {
    const { wrapper } = createWrapper({ colWidth: 'auto' });
    const { result } = renderHook(() => useCalculateCellPositionByPixels(), { wrapper });

    expect(result.current(500, 60)).toStrictEqual({ x: 0, y: 2 });
  });

  it('clamps the column to the grid', () => {
    const { wrapper } = createWrapper({
      cols: 4, colWidth: 50, gapHorizontal: 10, gapVertical: 10, rowHeight: 20, paddingLeft: 0,
    });
    const { result } = renderHook(() => useCalculateCellPositionByPixels(), { wrapper });

    expect(result.current(-500, 0).x).toBe(0);
    expect(result.current(5000, 0).x).toBe(3);
    expect(result.current(0, -500).y).toBe(0);
  });
});

describe('useUpdateWithPanZoomApi', () => {
  it('does nothing for an element panzoom does not know', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateWithPanZoomApi(), { wrapper });

    result.current(el({ id: 'missing' }));
    expect(panZoomState.updateElementPositionSilentCalls).toStrictEqual([]);
  });

  it('does nothing when the element already sits at the target position', () => {
    panZoomState.elements.a = { node: ref(null), position: { x: 0, y: 0 } } as never;
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateWithPanZoomApi(), { wrapper });

    result.current(el({ id: 'a', x: 0, y: 0 }));
    expect(panZoomState.updateElementPositionSilentCalls).toStrictEqual([]);
  });

  it('moves the element to its cell position', () => {
    panZoomState.elements.a = { node: ref(null), position: { x: 0, y: 0 } } as never;
    const { wrapper } = createWrapper({
      colWidth: 50, gapHorizontal: 10, gapVertical: 10, paddingLeft: 5, rowHeight: 20,
    });
    const { result } = renderHook(() => useUpdateWithPanZoomApi(), { wrapper });

    result.current(el({ id: 'a', x: 1, y: 2 }));
    expect(panZoomState.updateElementPositionSilentCalls).toStrictEqual([
      ['a', { x: 65, y: 60 }],
    ]);
  });
});

describe('useGrabElement', () => {
  const renderGrid = (elements: GridElement[]) => {
    const grid = document.createElement('div');
    document.body.appendChild(grid);
    elements.forEach((element) => {
      const node = document.createElement('div');
      node.className = `react-panzoom-element--id-${element.id}`;
      grid.appendChild(node);
    });

    return createWrapper({
      elements,
      gridRef: ref(grid),
      currentElements: ref([]),
      elementRef: ref(null),
      setSelectedElements: vi.fn(),
    });
  };

  it('does nothing when the element is not rendered', () => {
    const { wrapper, value } = renderGrid([]);
    const { result } = renderHook(() => useGrabElement(), { wrapper });

    result.current('missing');
    expect(value.setSelectedElements).not.toHaveBeenCalled();
  });

  it('copies the elements, selects the family and releases on a button-less move', () => {
    const a = el({ id: 'a', family: 'group' });
    const b = el({ id: 'b', family: 'group' });
    const c = el({ id: 'c' });
    const { wrapper, value } = renderGrid([a, b, c]);

    const { result } = renderHook(() => useGrabElement(), { wrapper });
    result.current('a', 'group');

    expect(value.currentElements.current).toStrictEqual([a, b, c]);
    expect(value.currentElements.current[0]).not.toBe(a);
    expect(value.setSelectedElements).toHaveBeenCalledWith([
      value.currentElements.current[0],
      value.currentElements.current[1],
    ]);
    expect(value.elementRef.current.style.transition).toBe('none');

    // a move with a button still held down keeps the selection
    const withButton = new Event('pointermove') as PointerEvent;
    Object.defineProperty(withButton, 'buttons', { value: 1 });
    window.dispatchEvent(withButton);
    expect(value.setSelectedElements).toHaveBeenCalledTimes(1);

    const released = new Event('pointermove') as PointerEvent;
    Object.defineProperty(released, 'buttons', { value: 0 });
    window.dispatchEvent(released);

    expect(value.setSelectedElements).toHaveBeenLastCalledWith([]);
    expect(value.elementRef.current.style.transition).toBe('0.3s all');

    // the listener removed itself
    window.dispatchEvent(released);
    expect(value.setSelectedElements).toHaveBeenCalledTimes(2);
  });
});

describe('the grid context is readable from a rendered tree', () => {
  it('exposes the context to children', () => {
    const { wrapper } = createWrapper({ cols: 3 });
    const Child = () => <span>{useGrid().cols}</span>;
    const { container } = render(<Child />, { wrapper });
    expect(container.textContent).toBe('3');
  });
});
