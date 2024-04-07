import React, {
  useCallback, memo, useEffect, useMemo, useState,
} from 'react';
import { Element } from '@sasza/react-panzoom';

import { GridElement, MeasureElementHeight, Pixels } from 'types';
import calculatePixelsByCellPosition from './helpers/calculatePixelsByCellPosition';
import { isLengthAuto } from './helpers/isLengthAuto';
import { LinesContainer } from './Lines';

export type ElementProps = Parameters<typeof Element>[0]

type ElementWrapperProps = {
  id: string | number,
  element: GridElement,
  elementsNodes: Record<string | number, HTMLDivElement>,
  elementResizerWidth?: number,
  rowHeight: Pixels,
  onStartResizing?: ElementProps['onStartResizing'],
  onAfterResize?: ElementProps['onAfterResize'],
  onClick?: ElementProps['onClick'],
  onContextMenu?: ElementProps['onContextMenu'],
  onMouseUp?: ElementProps['onMouseUp'],
  colWidth: Pixels | 'auto',
  fullHeight?: boolean,
  opacity?: string,
  disabled?: boolean,
  disabledMove?: boolean,
  paddingLeft?: number,
  gapHorizontal?: number,
  gapVertical?: number,
  measureElementHeight: MeasureElementHeight,
  isShadow?: boolean,
}

const ElementWrapper: React.FC<ElementWrapperProps> = ({
  id,
  element,
  elementsNodes,
  elementResizerWidth,
  fullHeight = true,
  rowHeight,
  onStartResizing,
  onAfterResize,
  onClick,
  onContextMenu,
  onMouseUp,
  colWidth,
  opacity = '1',
  disabled,
  disabledMove,
  paddingLeft = 0,
  gapHorizontal = 0,
  gapVertical = 0,
  measureElementHeight,
  isShadow,
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!loaded) return;

    if (!isShadow) {
      return () => {
        delete elementsNodes[element.id];
      };
    }
  }, [isShadow, loaded]);

  const renderElement = useMemo(() => {
    if (isShadow) return null;
    if (!element.render) throw new Error('No render() for element');
    return element.render(element);
  }, [isShadow, element.render]);

  const onInit = useCallback((node: HTMLDivElement) => {
    if (!node) return;

    setLoaded(true);

    if (isShadow) {
      node.innerHTML = '';

      const container = elementsNodes[element.id];
      if (!container) return;

      const copy = container.cloneNode(true);
      copy.childNodes.forEach((child) => {
        node.appendChild(child);
      });
    } else {
      elementsNodes[element.id] = node;
    }
  }, []);

  const { x, y } = calculatePixelsByCellPosition(element, {
    rowHeight,
    gapVertical,
    gapHorizontal,
    paddingLeft,
    colWidth,
  });

  const w = element.w || 1;

  const style: React.CSSProperties = {
    opacity,
    pointerEvents: 'all',
    width: '100%',
    height: isLengthAuto(element.h) ? undefined : '100%',
  };

  return (
    <Element
      id={id}
      className={isShadow ? 'react-panzoom-element-is-shadow' : undefined}
      family={element.family}
      x={x}
      y={y}
      onStartResizing={onStartResizing}
      onAfterResize={onAfterResize}
      onClick={disabled ? undefined : onClick}
      onContextMenu={disabled ? undefined : onContextMenu}
      onMouseUp={disabled ? undefined : onMouseUp}
      disabled={disabled}
      disabledMove={disabledMove}
      draggableSelector={element.draggableSelector}
      resizable={element.resizable !== false}
      resizedMinWidth={isLengthAuto(colWidth) ? undefined : colWidth}
      resizerWidth={elementResizerWidth}
      width={isLengthAuto(colWidth) ? undefined : colWidth * w + gapHorizontal * (w - 1)}
      height={(rowHeight + gapVertical) * measureElementHeight(element) - gapVertical}
    >
      <div style={style} ref={onInit}>
        <div style={{ pointerEvents: 'none', height: fullHeight ? '100%' : undefined }}>
          <LinesContainer disabled={disabled} disabledMove={disabledMove} />
          {renderElement}
          <div className="react-grid-panzoom-element-selection" />
        </div>
      </div>
    </Element>
  );
};

const propsToCompare = [
  'id', 'rowHeight', 'onAfterResize', 'onClick', 'onMouseUp', 'onContextMenu',
  'colWidth', 'fullHeight', 'opacity', 'disabled', 'disabledMove', 'paddingLeft',
  'gapHorizontal', 'gapVertical', 'measureElementHeight', 'isShadow',
] as Array<keyof ElementWrapperProps>;

const elementPropsToCompare = [
  'id', 'family', 'fullHeight', 'x', 'y', 'w', 'h', 'render', 'resizable', 'disabled', 'disabledMove', 'draggableSelector',
] as Array<keyof ElementWrapperProps['element']>;

const areEqual = <T, >(a: T, b: T, keys: Array<keyof T>) => {
  for (const propName of keys) { // eslint-disable-line
    const k = propName;
    if (a[k] !== b[k]) return false;
  }
  return true;
};

export default memo(ElementWrapper, (prev, next) => {
  if (!areEqual(prev, next, propsToCompare)) return false;
  if (!areEqual(prev.element, next.element, elementPropsToCompare)) return false;
  return true;
});
