import { render } from '@testing-library/react';
import React from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';

import { GridElement } from 'types';

vi.mock('@sasza/react-panzoom', () => import('../test/panzoomMock'));

const { state: panZoomState, resetPanZoomMock } = await import('../test/panzoomMock');
const ElementWrapper = (await import('./Element')).default;

const el = (props: Partial<GridElement>): GridElement => ({
  x: 0,
  y: 0,
  w: 1,
  h: 1,
  render: (element) => <span>{`content-${element.id}`}</span>,
  ...props,
} as GridElement);

const measureElementHeight = (element: GridElement) => (
  element.h === 'auto' ? 2 : element.h as number
);

const defaultProps = {
  elementsNodes: {} as Record<string | number, HTMLDivElement>,
  rowHeight: 20,
  colWidth: 50 as number | 'auto',
  gapHorizontal: 10,
  gapVertical: 10,
  paddingLeft: 5,
  measureElementHeight,
};

const renderElement = (props: Record<string, unknown> = {}) => {
  const element = (props.element as GridElement) || el({ id: 'a' });
  return render(
    <ElementWrapper
      id={element.id}
      element={element}
      {...defaultProps}
      {...props as never}
    />,
  );
};

beforeEach(() => {
  resetPanZoomMock();
  defaultProps.elementsNodes = {};
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ElementWrapper', () => {
  it('positions and sizes the element from its cell', () => {
    renderElement({ element: el({ id: 'a', x: 2, y: 3, w: 2, h: 2 }) });

    const props = panZoomState.elementProps.a;
    expect(props.x).toBe(2 * 50 + 2 * 10 + 5);
    expect(props.y).toBe(3 * 20 + 3 * 10);
    expect(props.width).toBe(50 * 2 + 10);
    expect(props.height).toBe((20 + 10) * 2 - 10);
    expect(props.resizedMinWidth).toBe(50);
    expect(props.resizedMinHeight).toBe(30);
  });

  it('falls back to a width of one cell', () => {
    renderElement({ element: el({ id: 'a', w: undefined }) });
    expect(panZoomState.elementProps.a.width).toBe(50);
  });

  it('leaves the sizes open while the column width is unknown', () => {
    renderElement({ colWidth: 'auto' });

    expect(panZoomState.elementProps.a.width).toBeUndefined();
    expect(panZoomState.elementProps.a.resizedMinWidth).toBeUndefined();
  });

  it('registers its node and cleans it up on unmount', () => {
    const { unmount } = renderElement();

    expect(defaultProps.elementsNodes.a).toBeInstanceOf(HTMLDivElement);

    unmount();
    expect(defaultProps.elementsNodes.a).toBeUndefined();
  });

  it('renders the element content', () => {
    const { getByText } = renderElement();
    expect(getByText('content-a')).toBeTruthy();
  });

  it('throws when the element has no render function', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderElement({ element: el({ id: 'a', render: undefined }) }))
      .toThrow('No render() for element');
    consoleError.mockRestore();
  });

  it('stretches the inner wrapper by default and stops on demand', () => {
    const inner = (container: HTMLElement) => container.querySelector(
      '[data-testid="element-a"] > div > div',
    ) as HTMLDivElement;

    expect(inner(renderElement().container).style.height).toBe('100%');
    expect(inner(renderElement({ fullHeight: false }).container).style.height).toBe('');
  });

  it('leaves the height open for an auto element', () => {
    const { container } = renderElement({ element: el({ id: 'a', h: 'auto' }) });
    const inner = container.querySelector('[data-testid="element-a"] > div') as HTMLDivElement;
    expect(inner.style.height).toBe('');
  });

  it('applies the given opacity', () => {
    const { container } = renderElement({ opacity: '0.1' });
    const inner = container.querySelector('[data-testid="element-a"] > div') as HTMLDivElement;
    expect(inner.style.opacity).toBe('0.1');
  });

  it('drops the interaction handlers for a disabled element', () => {
    const handlers = { onClick: vi.fn(), onContextMenu: vi.fn(), onMouseUp: vi.fn() };

    renderElement({ ...handlers });
    expect(panZoomState.elementProps.a.onClick).toBe(handlers.onClick);

    renderElement({ ...handlers, disabled: true });
    expect(panZoomState.elementProps.a.onClick).toBeUndefined();
    expect(panZoomState.elementProps.a.onContextMenu).toBeUndefined();
    expect(panZoomState.elementProps.a.onMouseUp).toBeUndefined();
  });

  it('forwards the resizing options of the element', () => {
    renderElement({
      element: el({
        id: 'a', resizable: false, resizableVertical: true, draggableSelector: '.handle',
      }),
      elementResizerWidth: 12,
    });

    const props = panZoomState.elementProps.a;
    expect(props.resizable).toBe(false);
    expect(props.resizableVertical).toBe(true);
    expect(props.draggableSelector).toBe('.handle');
    expect(props.resizerWidth).toBe(12);
  });

  it('defaults resizable to true and resizableVertical to false', () => {
    renderElement();
    expect(panZoomState.elementProps.a.resizable).toBe(true);
    expect(panZoomState.elementProps.a.resizableVertical).toBe(false);
  });

  describe('as a shadow', () => {
    it('copies the content of the original element', () => {
      const original = document.createElement('div');
      original.innerHTML = '<span>copied</span>';

      const { getByTestId } = renderElement({
        id: 'dest-a',
        isShadow: true,
        elementsNodes: { a: original },
      });

      expect(getByTestId('element-dest-a').textContent).toContain('copied');
    });

    it('renders empty when the original element is not there', () => {
      const { getByTestId } = renderElement({ id: 'dest-a', isShadow: true });
      expect(getByTestId('element-dest-a').textContent).toBe('');
    });

    it('does not remove the node of the original element on unmount', () => {
      const original = document.createElement('div');
      const elementsNodes = { a: original };

      const { unmount } = renderElement({ id: 'dest-a', isShadow: true, elementsNodes });
      unmount();

      expect(elementsNodes.a).toBe(original);
    });
  });

  describe('memoization', () => {
    const rerenderWith = (props: Record<string, unknown>, nextProps: Record<string, unknown>) => {
      const element = (props.element as GridElement) || el({ id: 'a' });
      const nextElement = (nextProps.element as GridElement) || element;

      const { rerender } = render(
        <ElementWrapper
          id={element.id}
          element={element}
          {...defaultProps}
          {...props as never}
        />,
      );

      const propsBefore = panZoomState.elementProps.a;

      rerender(
        <ElementWrapper
          id={nextElement.id}
          element={nextElement}
          {...defaultProps}
          {...nextProps as never}
        />,
      );

      return panZoomState.elementProps.a !== propsBefore;
    };

    it('skips the re-render when nothing relevant changed', () => {
      const element = el({ id: 'a' });
      expect(rerenderWith({ element }, { element })).toBe(false);
    });

    it('re-renders when a wrapper prop changed', () => {
      expect(rerenderWith({}, { opacity: '0.5' })).toBe(true);
    });

    it('re-renders when an element prop changed', () => {
      expect(rerenderWith(
        { element: el({ id: 'a', x: 0 }) },
        { element: el({ id: 'a', x: 2 }) },
      )).toBe(true);
    });
  });
});
