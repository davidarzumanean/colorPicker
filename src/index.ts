import { ColorPicker } from './colorPicker';
import { Canvas } from './Canvas';

const magnifierCanvas = document.getElementById("magnifier-canvas") as HTMLCanvasElement;
const pickerBtn = document.getElementById('pickColorButton') as HTMLButtonElement;
const zoomFactorSelect = document.getElementById('zoomFactor') as HTMLSelectElement;
const magnifierContainer = document.getElementById("magnifierContainer") as HTMLDivElement;

const canvas = new Canvas('colorPickerCanvas', 'assets/bg.jpg');
if (canvas.isInitialized) {
    new ColorPicker(<HTMLCanvasElement>canvas.canvas, <CanvasRenderingContext2D>canvas.context, canvas.expanded, magnifierContainer, magnifierCanvas, pickerBtn, zoomFactorSelect);
}
