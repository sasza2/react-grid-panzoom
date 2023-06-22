import React, { memo } from 'react';

import Style from './Style';

const Styles = () => (
  <Style>
    {`
      @keyframes react-panzoom-element-animation {
        0% { outline: solid 2px rgba(0, 0, 0, 0.05); }
        50% { outline: solid 2px rgba(0, 0, 0, 0.15); }
        100% { outline: solid 2px rgba(0, 0, 0, 0.05); }
      }
      .react-panzoom--element-moving .react-panzoom-element:not(.react-panzoom-element--disabled) {
        outline-offset: -2px;
        outline: solid 2px rgba(0, 0, 0, 0.1);
      }
      .react-panzoom--element-moving .react-panzoom-element-is-shadow {
        z-index: 1;
        outline: none;
      }
      .react-grid-panzoom .react-panzoom-element:hover {
        outline-offset: -2px;
        animation: react-panzoom-element-animation 1s infinite;
      }
      .react-grid-panzoom .react-panzoom--element-moving .react-panzoom-element,
      .react-grid-panzoom .react-panzoom--element-resizing .react-panzoom-element,
      .react-grid-panzoom .react-panzoom--element-moving .react-panzoom-element:hover,
      .react-grid-panzoom .react-panzoom--element-resizing .react-panzoom-element:hover {
        outline-offset: -1px;
        outline: solid 1px rgba(0, 0, 0, 0.1);
        animation: none;
      }
      .react-grid-panzoom .react-panzoom--element-moving .react-panzoom-element.react-panzoom-element--disabled,
      .react-grid-panzoom .react-panzoom--element-resizing .react-panzoom-element.react-panzoom-element--disabled {
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
      }
      .react-grid-panzoom-lines-container .react-grid-panzoom-line--left {
        text-align: right;
      }
    `}
  </Style>
);

export default memo(Styles);
