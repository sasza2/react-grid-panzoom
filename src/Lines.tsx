import React, { useEffect } from 'react';

import { GridElement, Position } from 'types';
import { useGrid } from './hooks/useGrid';
import useCalculateCellPositionByPixels from './hooks/useCalculateCellPositionByPixels';
import useMeasureElementHeight from './hooks/useMeasureElementHeight';
import { createMap } from './helpers/organizeGridElements/createMap';
import { startingElementsWithoutSelected } from './helpers/organizeGridElements/startingElementsWithoutSelected';
import { ElementWrapped } from './helpers/organizeGridElements/types';
import calculatePixelsByCellPosition from './helpers/calculatePixelsByCellPosition';
import { isLengthAuto } from './helpers/isLengthAuto';
import getInternalRows from './helpers/getInternalRows';

export const LINES_CONTAINER = 'react-panzoom-lines';

const drawTextInLine = (lineDiv: HTMLDivElement, value: number) => {
  if (value > 0) {
    lineDiv.innerHTML = `&nbsp;${value}`;
    lineDiv.style.display = null;
  } else {
    lineDiv.innerHTML = '';
    lineDiv.style.display = 'none';
  }
};

const createLine = (container: HTMLDivElement, direction: string) => {
  const line = document.createElement('div');
  line.classList.add('react-grid-panzoom-line');
  line.classList.add(`react-grid-panzoom-line--${direction}`);
  container.appendChild(line);
  return line;
};

const clearLine = (line: HTMLDivElement) => {
  line.removeAttribute('style');
};

const createBottomLine = (container: HTMLDivElement) => createLine(container, 'bottom');

const createTopLine = (container: HTMLDivElement) => createLine(container, 'top');

const createRightLine = (container: HTMLDivElement) => createLine(container, 'right');

const createLeftLine = (container: HTMLDivElement) => createLine(container, 'left');

const bottomCollisions = (
  column: number,
  columnsWidth: number,
  row: number,
  rows: number,
  map: Record<string, ElementWrapped>,
) => {
  const collisionsMap: Record<string, { element: GridElement, x: number }> = {};
  for (let c = column; c < column + columnsWidth; c++) {
    for (let r = row; r < rows; r++) {
      const element = map[`${c}_${r}`];
      if (!element) continue;

      collisionsMap[element.element.id] = { element: element.element, x: c };
      break;
    }
  }
  return Object.values(collisionsMap);
};

const topCollisions = (
  column: number,
  columnsWidth: number,
  row: number,
  map: Record<string, ElementWrapped>,
) => {
  const collisionsMap: Record<string, { element: GridElement, x: number }> = {};
  for (let c = column; c < column + columnsWidth; c++) {
    for (let r = row; r >= 0; r--) {
      const element = map[`${c}_${r}`];
      if (!element) continue;

      collisionsMap[element.element.id] = { element: element.element, x: c };
      break;
    }
  }
  return Object.values(collisionsMap);
};

const rightCollisions = (
  column: number,
  columns: number,
  row: number,
  rowsHeight: number,
  map: Record<string, ElementWrapped>,
) => {
  const collisionsMap: Record<string, { element: GridElement, y: number }> = {};
  for (let r = row; r < row + rowsHeight; r++) {
    for (let c = column; c < columns; c++) {
      const element = map[`${c}_${r}`];
      if (!element) continue;

      collisionsMap[element.element.id] = { element: element.element, y: r };
      break;
    }
  }
  return Object.values(collisionsMap);
};

const leftCollisions = (
  column: number,
  row: number,
  rowsHeight: number,
  map: Record<string, ElementWrapped>,
) => {
  const collisionsMap: Record<string, { element: GridElement, y: number }> = {};
  for (let r = row; r < row + rowsHeight; r++) {
    for (let c = column; c >= 0; c--) {
      const element = map[`${c}_${r}`];
      if (!element) continue;

      collisionsMap[element.element.id] = { element: element.element, y: r };
      break;
    }
  }
  return Object.values(collisionsMap);
};

type LinesContainerProps = {
  disabled?: boolean,
  disabledMove?: boolean,
}

export const LinesContainer: React.FC<LinesContainerProps> = ({
  disabled,
  disabledMove,
}) => {
  if (disabled || disabledMove) return null;
  return (<div data-id={LINES_CONTAINER} className="react-grid-panzoom-lines-container" />);
};

const Lines: React.FC = () => {
  const {
    cols,
    colWidth,
    currentElements,
    elementsNodes,
    gapHorizontal,
    gapVertical,
    internalWidth,
    panZoomRef,
    paddingLeft,
    paddingRight,
    rowHeight,
    rows,
    selectedElements,
  } = useGrid();

  const calculateCellPositionByPixels = useCalculateCellPositionByPixels();
  const measureElementHeight = useMeasureElementHeight();

  const firstSelectedElementId = selectedElements[0]?.id;

  useEffect(() => {
    if (isLengthAuto(colWidth) || isLengthAuto(internalWidth) || !firstSelectedElementId) return;

    const elementNode = elementsNodes.current[firstSelectedElementId];
    if (!elementNode) return;

    const linesContainer: HTMLDivElement = elementNode.querySelector(`[data-id="${LINES_CONTAINER}"]`);
    if (!linesContainer) return;

    let gridElement: GridElement = null;
    let elementHeight: number = null;
    let map: Record<string, ElementWrapped> = null;

    const topLine = createTopLine(linesContainer);
    const leftLine = createLeftLine(linesContainer);
    const rightLine = createRightLine(linesContainer);

    const usedLines: Map<string | number, boolean> = new Map();
    const lines: Record<string | number, HTMLDivElement> = {};

    const clearLines = () => {
      Object.keys(lines).forEach((elementId) => {
        if (!usedLines.has(elementId)) {
          const lineDivElement = lines[elementId];
          delete lines[elementId];
          if (lineDivElement.parentNode) {
            lineDivElement.parentNode.removeChild(lineDivElement);
          }
        }
      });
    };

    const drawBottomLines = (elementPosition: Position) => {
      const gridElementPosition = calculateCellPositionByPixels(
        elementPosition.x,
        elementPosition.y,
      );

      bottomCollisions(
        gridElementPosition.x,
        gridElement.w,
        gridElementPosition.y,
        getInternalRows({
          elements: currentElements.current,
          measureElementHeight,
          rows,
        }),
        map,
      ).forEach((elementOnBottom) => {
        let line = lines[elementOnBottom.element.id];
        if (!line) {
          line = createBottomLine(linesContainer);
          lines[elementOnBottom.element.id] = line;
        }

        const collisionElementBottom = calculatePixelsByCellPosition(elementOnBottom.element, {
          gapHorizontal, gapVertical, paddingLeft, colWidth, rowHeight,
        });
        const currentElementBottom = elementPosition.y;

        const heightInRows = measureElementHeight(gridElement);
        const heightInPx = heightInRows * rowHeight + (heightInRows - 1) * gapVertical;
        const left = (elementOnBottom.x - gridElementPosition.x + 1) * colWidth - colWidth / 2;
        const bottomHeight = collisionElementBottom.y - currentElementBottom;

        clearLine(line);
        line.style.top = `${heightInPx}px`;
        line.style.height = `${bottomHeight - heightInPx}px`;
        line.style.left = `${left}px`;

        const rowsHeight = elementOnBottom.element.y
          - (gridElementPosition.y + measureElementHeight(gridElement));
        drawTextInLine(line, rowsHeight);

        usedLines.set(`${elementOnBottom.element.id}`, true);
      });
    };

    const drawTopLines = (elementPosition: Position) => {
      const gridElementPosition = calculateCellPositionByPixels(
        elementPosition.x,
        elementPosition.y,
      );

      topCollisions(
        gridElementPosition.x,
        gridElement.w,
        gridElementPosition.y,
        map,
      ).forEach((elementOnTop) => {
        let line = lines[elementOnTop.element.id];
        if (!line) {
          line = createTopLine(linesContainer);
          lines[elementOnTop.element.id] = line;
        }

        const collisionElementTop = calculatePixelsByCellPosition(elementOnTop.element, {
          gapHorizontal, gapVertical, paddingLeft, colWidth, rowHeight,
        });
        const currentElementTop = elementPosition.y;

        const topHeight = currentElementTop
          - (collisionElementTop.y + measureElementHeight(elementOnTop.element) * rowHeight);

        const left = (elementOnTop.x - gridElementPosition.x + 1) * colWidth - colWidth / 2;

        clearLine(line);
        line.style.top = `-${topHeight}px`;
        line.style.height = `${topHeight}px`;
        line.style.left = `${left}px`;

        const rowsHeight = gridElementPosition.y
          - (elementOnTop.element.y + measureElementHeight(elementOnTop.element));
        drawTextInLine(line, rowsHeight);

        usedLines.set(`${elementOnTop.element.id}`, true);
      });
    };

    const drawRightLines = (elementPosition: Position) => {
      const gridElementPosition = calculateCellPositionByPixels(
        elementPosition.x,
        elementPosition.y,
      );

      rightCollisions(
        gridElementPosition.x,
        cols,
        gridElementPosition.y,
        elementHeight,
        map,
      ).forEach((elementOnRight) => {
        let line = lines[elementOnRight.element.id];
        if (!line) {
          line = createRightLine(linesContainer);
          lines[elementOnRight.element.id] = line;
        }

        const collisionElementRight = calculatePixelsByCellPosition(elementOnRight.element, {
          gapHorizontal, gapVertical, paddingLeft, colWidth, rowHeight,
        });
        const currentElementRight = elementPosition.x + gridElement.w * colWidth;

        const rightWidth = collisionElementRight.x - currentElementRight;

        const top = (elementOnRight.y - gridElementPosition.y + 1) * rowHeight - rowHeight / 2;

        clearLine(line);
        line.style.right = `-${rightWidth}px`;
        line.style.width = `${rightWidth}px`;
        line.style.top = `${top}px`;

        const colsWidth = elementOnRight.element.x - (gridElementPosition.x + gridElement.w);
        drawTextInLine(line, colsWidth);

        usedLines.set(`${elementOnRight.element.id}`, true);
      });
    };

    const drawLeftLines = (elementPosition: Position) => {
      const gridElementPosition = calculateCellPositionByPixels(
        elementPosition.x,
        elementPosition.y,
      );

      leftCollisions(
        gridElementPosition.x,
        gridElementPosition.y,
        elementHeight,
        map,
      ).forEach((elementOnleft) => {
        let line = lines[elementOnleft.element.id];
        if (!line) {
          line = createLeftLine(linesContainer);
          lines[elementOnleft.element.id] = line;
        }

        const collisionElementLeft = calculatePixelsByCellPosition(elementOnleft.element, {
          gapHorizontal, gapVertical, paddingLeft, colWidth, rowHeight,
        });
        const currentElementLeft = elementPosition.x;

        const leftWidth = currentElementLeft
          - (collisionElementLeft.x + elementOnleft.element.w * colWidth);

        const top = (elementOnleft.y - gridElementPosition.y + 1) * rowHeight - rowHeight / 2;

        clearLine(line);
        line.style.left = `-${leftWidth}px`;
        line.style.width = `${leftWidth}px`;
        line.style.top = `${top}px`;

        const colsWidth = gridElementPosition.x
          - (elementOnleft.element.x + elementOnleft.element.w);
        drawTextInLine(line, colsWidth);

        usedLines.set(`${elementOnleft.element.id}`, true);
      });
    };

    const drawLines = (elementPosition: Position) => {
      usedLines.clear();
      drawBottomLines(elementPosition);
      drawTopLines(elementPosition);
      drawLeftLines(elementPosition);
      drawRightLines(elementPosition);
      clearLines();
    };

    const timer = setInterval(() => {
      const elementsInMove = panZoomRef.current.getElements();
      const elementDetails = elementsInMove[firstSelectedElementId];
      if (!elementDetails) return;

      gridElement = currentElements.current.find((item) => item.id === firstSelectedElementId) || null;
      elementHeight = measureElementHeight(gridElement);

      map = createMap(
        startingElementsWithoutSelected(currentElements.current, selectedElements),
        measureElementHeight,
      );

      const elementPosition = elementDetails.position;
      const gridElementPosition = calculateCellPositionByPixels(
        elementPosition.x,
        elementPosition.y,
      );

      clearLine(topLine);
      topLine.style.top = `-${elementPosition.y}px`;
      topLine.style.height = `${elementPosition.y}px`;
      drawTextInLine(topLine, gridElementPosition.y);

      const leftWidth = elementPosition.x - paddingLeft;

      clearLine(leftLine);
      leftLine.style.left = `-${leftWidth}px`;
      leftLine.style.width = `${leftWidth}px`;
      drawTextInLine(leftLine, gridElementPosition.x);

      const rightWidth = internalWidth - paddingRight - elementPosition.x
        - gridElement.w * colWidth;

      clearLine(rightLine);
      rightLine.style.right = `-${rightWidth}px`;
      rightLine.style.width = `${rightWidth}px`;
      drawTextInLine(rightLine, cols - (gridElementPosition.x + gridElement.w));

      drawLines(elementPosition);
    }, 100);

    return () => {
      clearInterval(timer);
      linesContainer.removeChild(topLine);
      linesContainer.removeChild(leftLine);
      linesContainer.removeChild(rightLine);

      usedLines.clear();
      clearLines();
    };
  }, [colWidth, firstSelectedElementId, internalWidth]);

  return null;
};

export default Lines;
