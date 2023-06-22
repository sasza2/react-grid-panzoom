# react-grid-panzoom
React component for grid layout with pan and zoom.

!["Preview"](docs/preview.gif "Example preview")

# Demo
https://codesandbox.io/p/sandbox/hardcore-leavitt-mv3wrg
<br />

# Installation
```npm install react-grid-panzoom```

# Properties

| Name | | Default | Description |
| --- | --- | --- | --- |
| boundary | bool | false | possibility to move grid outside container 
| disabledMove | bool | false | disable moving grid
| disabledScrollHorizontal | bool | false | disable scrolling grid horizontally
| disabledScrollVertical | bool | false | disable scrolling grid vertically
| disabledZoom | bool | false | disable zooming grid
elements[] | array | [] | grid elements
elements[].id | string / id | | id of element
elements[].family | string | id of elements family
elements[].fullHeight | bool | false | ...
elements[].x | number | | x position of element in grid
elements[].y | number | | y position of element in grid
elements[].w | number | | width of element in grid
elements[].h | number | | 'auto' | height of element in grid. 'auto' if it should automatically calculate how many rows element takes space in grid (rounded up)
element[].render | func | render function for element
element[].resizable | bool | true | is element resizable
element[].disabled | bool | false | is element disabled
element[].draggableSelector | string | | allow to drag element only if click is inside matching selector
elementResizerWidth | number | 15 | width of resizer element
helpLine | bool | true | display help lines in grid. helpful on grid with multiple columns/rows
ref: Ref | | assign lib API to ref
rowHeight | number | | Height of each row
cols | number | number of columns
rows | number | 'auto' | | number of rows in grid, 'auto' if it should automatically expand grid
setElements | func | | set elements in grid
gapHorizontal | number | | gap between rows in grid
gapVertical | number | gap between columns in grid
onContainerChange | func | | event on move/zoom grid
onContainerContextMenu | func | | event on open context menu
onElementClick | func | | event on element click
onElementContextMenu | func | | event on right click of element (context menu)
onElementsMeasureUpdate | func | | event on recalculate elements height (helpful when there are elements with 'auto' height)
organizeGridElements | func | | function for organizing elements in grid
paddingLeft | number | | grid padding left
paddingRight | number | | grid padding right
width | number | | grid width