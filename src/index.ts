import { ColorPicker } from './colorPicker';
import { Canvas } from './Canvas';
import {defaultConfig} from "./config";

const magnifierCanvas = document.getElementById("magnifierCanvas") as HTMLCanvasElement;
const pickerBtn = document.getElementById('pickColorButton') as HTMLButtonElement;
const zoomFactorSelect = document.getElementById('zoomFactor') as HTMLSelectElement;
const magnifierContainer = document.getElementById("magnifierContainer") as HTMLDivElement;

const canvas = new Canvas('colorPickerCanvas', 'assets/bg.jpg');
if (canvas.isInitialized) {
    new ColorPicker({
        elements: {
            board: canvas.canvas,
            magnifierContainer,
            magnifierCanvas,
            pickerBtn,
            zoomFactorSelect,
        },
        events: {
            onColorPickSuccess: () => {
                const successMsg = document.getElementById('copySuccessMsg');
                successMsg?.classList.remove('hide');
                setTimeout(() => {
                    successMsg?.classList.add('hide');
                }, 2000);
            }
        },
    });
}
