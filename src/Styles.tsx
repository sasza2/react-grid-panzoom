import React, { memo } from 'react';

import Style from './Style';

const ACTION_MOVING = '.react-panzoom--element-moving .react-panzoom--element-moving-in';
const ACTION_RESIZING = '.react-panzoom--element-resizing .react-panzoom--element-resizing-in';
const ELEMENT_NOT_DISABLED = '.react-panzoom-element:not(.react-panzoom-element--disabled)';

const Styles = () => (
  <Style>
    {`
      @keyframes react-panzoom-element-animation {
        0% { outline: solid 4px rgba(0, 0, 0, 0.05); }
        50% { outline: solid 4px rgba(0, 0, 0, 0.15); }
        100% { outline: solid 4px rgba(0, 0, 0, 0.05); }
      }
      .react-grid-panzoom .react-panzoom__in {
        overflow: visible !important;
      }
      ${ACTION_MOVING} ${ELEMENT_NOT_DISABLED} .react-grid-panzoom-element-selection,
      ${ACTION_RESIZING} ${ELEMENT_NOT_DISABLED} .react-grid-panzoom-element-selection {
        outline-offset: -2px;
        outline: solid 4px rgba(0, 0, 0, 0.1);
      }
      ${ACTION_MOVING} .react-panzoom-element-is-shadow {
        z-index: 1;
      }
      ${ACTION_MOVING} .react-panzoom-element-is-shadow .react-grid-panzoom-element-selection {
        outline: none;
      }
      .react-grid-panzoom ${ELEMENT_NOT_DISABLED}:hover .react-grid-panzoom-element-selection {
        outline-offset: -2px;
        animation: react-panzoom-element-animation 1s infinite;
      }
      .react-grid-panzoom .react-panzoom--element-moving-in .react-panzoom--element-moving .react-panzoom-element .react-grid-panzoom-element-selection,
      .react-grid-panzoom .react-panzoom--element-resizing-in .react-panzoom--element-resizing .react-panzoom-element .react-grid-panzoom-element-selection,
      .react-grid-panzoom .react-panzoom--element-moving-in .react-panzoom--element-moving ${ELEMENT_NOT_DISABLED}:hover .react-grid-panzoom-element-selection,
      .react-grid-panzoom .react-panzoom--element-resizing-in .react-panzoom--element-resizing .${ELEMENT_NOT_DISABLED}:hover .react-grid-panzoom-element-selection {
        outline-offset: -1px;
        outline: solid 2px rgba(0, 0, 0, 0.1);
        animation: none;
      }
      .react-grid-panzoom .react-panzoom--element-moving-in .react-panzoom--element-moving .react-panzoom-element.react-panzoom-element--disabled .react-grid-panzoom-element-selection,
      .react-grid-panzoom .react-panzoom--element-resizing-in .react-panzoom--element-resizing .react-panzoom-element.react-panzoom-element--disabled .react-grid-panzoom-element-selection {
        outline: none;
      }
      .react-grid-panzoom .react-panzoom-element {
        transition: transform 0.3s;
      }
      .react-grid-panzoom .react-panzoom-element--resizing {
        transition: none !important;
      }
      .react-grid-panzoom-lines-container {
        position: absolute;
        width: 100%;
      }
      .react-grid-panzoom-lines-container .react-grid-panzoom-line {
        position: absolute;
        background-color: #555;
        opacity: 0.5;
        height: 2px;
        width: 2px;
      }
      .react-grid-panzoom-lines-container .react-grid-panzoom-line--top {
        display: flex;
        align-items: flex-end;
      }
      .react-grid-panzoom-lines-container .react-grid-panzoom-line--left {
        text-align: right;
      }
      .react-grid-panzoom-element-selection {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
      }
    `}
  </Style>
);

export default memo(Styles);
