import { ColorPicker } from './colorPicker';
import { Canvas } from './Canvas';

const canvas = new Canvas('colorPickerCanvas', 'assets/bg.jpg');
if (canvas.isInitialized) {
    new ColorPicker(<HTMLCanvasElement>canvas.canvas, <CanvasRenderingContext2D>canvas.context, canvas.expanded);
}
