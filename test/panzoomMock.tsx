/* eslint-disable */
import React, {
  forwardRef, useEffect, useImperativeHandle, useRef,
} from 'react';

type PanZoomElement = {
  node: { current: HTMLDivElement },
  position: { x: number, y: number },
}

type MockState = {
  zoom: number,
  elements: Record<string, PanZoomElement>,
  containerProps: Record<string, any>,
  elementProps: Record<string, any>,
  grabElementCalls: Array<[string | number, unknown]>,
  updateElementPositionSilentCalls: Array<[string | number, { x: number, y: number }]>,
}

export const state: MockState = {
  zoom: 1,
  elements: {},
  containerProps: {},
  elementProps: {},
  grabElementCalls: [],
  updateElementPositionSilentCalls: [],
};

export const resetPanZoomMock = () => {
  state.zoom = 1;
  state.elements = {};
  state.containerProps = {};
  state.elementProps = {};
  state.grabElementCalls = [];
  state.updateElementPositionSilentCalls = [];
};

export const createPanZoomApi = () => ({
  getZoom: () => state.zoom,
  getElements: () => state.elements,
  grabElement: (id: string | number, position?: unknown) => {
    state.grabElementCalls.push([id, position]);
  },
  updateElementPositionSilent: (id: string | number, position: { x: number, y: number }) => {
    state.updateElementPositionSilentCalls.push([id, position]);
    if (state.elements[id]) state.elements[id].position = position;
  },
});

const PanZoom = forwardRef<unknown, any>((props, ref) => {
  state.containerProps = props;

  useImperativeHandle(ref, createPanZoomApi, []);

  return <div data-testid="panzoom">{props.children}</div>;
});

PanZoom.displayName = 'PanZoomMock';

export const Element = (props: any) => {
  const nodeRef = useRef<HTMLDivElement>(null);
  state.elementProps[props.id] = props;

  useEffect(() => {
    state.elements[props.id] = {
      node: nodeRef,
      position: { x: props.x, y: props.y },
    };
    return () => {
      delete state.elements[props.id];
      delete state.elementProps[props.id];
    };
  }, [props.id]);

  useEffect(() => {
    if (state.elements[props.id]) {
      state.elements[props.id].position = { x: props.x, y: props.y };
    }
  }, [props.x, props.y]);

  const className = [
    'react-panzoom-element',
    `react-panzoom-element--id-${props.id}`,
    props.disabled ? 'react-panzoom-element--disabled' : '',
    props.className || '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={nodeRef}
      className={className}
      data-testid={`element-${props.id}`}
      style={{ width: props.width, height: props.height }}
    >
      {props.children}
    </div>
  );
};

export const PanZoomWithCover = PanZoom;

export default PanZoom;
