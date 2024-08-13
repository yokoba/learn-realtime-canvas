# jCanvas Real-Time Drawing Sample

This repository contains a sample project demonstrating real-time drawing on an HTML canvas using the [jCanvas](https://projects.calebevans.me/jcanvas/) library. The project showcases how to manage canvas elements, handle drag events, and efficiently redraw the canvas without performance degradation.

## Features

-   **Real-Time Dragging**: Move the entire canvas with mouse drag.
-   **Dynamic Resizing**: Automatically adjusts canvas size when the browser window is resized.
-   **Optimized Redrawing**: Ensures smooth performance by limiting the frequency of redraws during dragging.

## Getting Started

### Prerequisites

To run this project, you need to include jQuery and jCanvas in your HTML file:

```html
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jcanvas/21.0.1/jcanvas.min.js"></script>
```

# Installation

1. Clone the repository:

    ```bash
    https://github.com/yokoba/learn-realtime-canvas.git
    cd learn-realtime-canvas
    ```

# Usage

This example demonstrates how to:

-   **Drag the Canvas**: Click and hold the left mouse button to drag the entire canvas.
-   **Resize the Window**: Resize the browser window to see the canvas adjust its size dynamically.
-   **Add New Shapes**: New shapes can be added dynamically after a delay, which will also move along with the canvas when dragged.

# Code Highlights

-   **Handling Drag Events**: The code uses mouse events (`mousedown`, `mousemove`, and `mouseup`) to handle the dragging of the canvas.
-   **Debouncing Redraws**: A debounce mechanism ensures that redraws do not occur too frequently during dragging, improving performance.
-   **Layer Management**: The `Symbols` class manages the drawing layers, preventing duplicate layer names and ensuring the correct draw order.
