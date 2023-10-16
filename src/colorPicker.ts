import {getColorFromPixelData, getContrastTextColor} from "./utils";
import {Magnifier} from "./Magnifier";
import {defaultConfig, IConfig} from "./config";

interface IColorPickerProps {
    elements: {
        board: HTMLCanvasElement;
        magnifierContainer: HTMLDivElement;
        magnifierCanvas: HTMLCanvasElement;
        pickerBtn: HTMLButtonElement;
        zoomFactorSelect: HTMLSelectElement;
    },
    events?: {
        onColorPickSuccess: () => void;
    },
    config?: Partial<IConfig>;
}

export class ColorPicker {
    private readonly board: HTMLCanvasElement;
    private readonly boardCtx: CanvasRenderingContext2D;
    private isPickerActive: boolean = false;
    private _color: string | null = null;
    private readonly pickerBtn: HTMLButtonElement;
    private readonly zoomFactorSelect: HTMLSelectElement;
    private readonly magnifierInstance: Magnifier;
    private readonly config: IConfig = defaultConfig;
    private _zoomFactor: number = this.config.magnifier.defaultZoomFactor;
    private events: IColorPickerProps['events'];
    private mousePosition: { x: number, y: number, clientX: number, clientY: number } = {x: 0, y: 0, clientX: 0, clientY: 0};

    constructor(
        {
            elements,
            events,
            config,
        } : IColorPickerProps
    ) {
        this.board = elements.board;
        this.boardCtx = this.board.getContext("2d", {willReadFrequently: true})!;
        this.pickerBtn = elements.pickerBtn;
        this.zoomFactorSelect = elements.zoomFactorSelect;

        this.initPickerButton();
        this.initZoomFactorSelect();
        this.initInteractionShortcuts();

        this.config = {
            ...config,
            ...defaultConfig,
        }
        this.events = events;

        this.zoomFactor = this.config.magnifier.defaultZoomFactor;
        this.magnifierInstance = new Magnifier(elements.magnifierCanvas, elements.magnifierContainer, this.board, this.config);
    }

    set zoomFactor(value: number) {
        this._zoomFactor = value;
        if (this.magnifierInstance) {
            this.magnifierInstance.render(this.mousePosition.x, this.mousePosition.y, this.mousePosition.clientX, this.mousePosition.clientY, this.zoomFactor, this.color!);
        }
    }

    get zoomFactor() {
        return this._zoomFactor;
    }

    public destroy() {
        this.board.removeEventListener("mousemove", this.showMagnifier);
        this.board.removeEventListener("mouseleave", this.hideMagnifier);
        this.board.removeEventListener("click", this.saveColorToClipboard);
        this.pickerBtn.removeEventListener("click", this.toggleMagnifier);
        this.zoomFactorSelect.removeEventListener('change', this.handleZoomChangeListener);
        this.destroyInteractionShortcuts();
    }

    private set color (color: string | null) {
        this._color = color;
        this.updateColorView();
    }

    private get color () {
        return this._color;
    }

    private initPickerButton(): void {
        this.pickerBtn.addEventListener('click', this.toggleMagnifier);
    }

    private initZoomFactorSelect(): void {
        this.zoomFactorSelect.addEventListener('change', this.handleZoomChangeListener);
    }

    private handleZoomChangeListener = (): void => {
        this.zoomFactor = parseInt(this.zoomFactorSelect.value);
    }

    private toggleMagnifier = (): void => {
        this.isPickerActive = !this.isPickerActive;

        if (this.isPickerActive) {
            this.initMagnifier();
            this.pickerBtn.style.fill = this.config.activeButtonColor;
        } else {
            this.hideMagnifier();
            this.pickerBtn.style.removeProperty('fill');
        }
    }

    private initMagnifier = (): void => {
        this.board.addEventListener("mousemove", this.showMagnifier);
        this.board.addEventListener("mouseleave", this.hideMagnifier);
        this.board.addEventListener("click", this.saveColorToClipboard);
    }

    private showMagnifier = (e: MouseEvent): void => {
        const position = this.getMousePos(e);
        const {x, y} = position;
        this.color = this.pickColor(x, y);

        this.mousePosition = {
            x,
            y,
            clientX: e.clientX,
            clientY: e.clientY,
        }

        if (x >= 0 && x <= this.board.width && y >= 0 && y <= this.board.height) {
            this.magnifierInstance.render(x, y, e.clientX, e.clientY, this.zoomFactor, this.color);
        } else {
            this.hideMagnifier();
        }
    }

    private hideMagnifier = (): void => {
        if (!this.isPickerActive) {
            this.board.removeEventListener("mousemove", this.showMagnifier);
            this.board.removeEventListener("mouseleave", this.hideMagnifier);
            this.board.removeEventListener("click", this.saveColorToClipboard);
        }
        this.magnifierInstance.hide();
    }

    private saveColorToClipboard = (): void => {
        if (this.isPickerActive && this.color) {
            navigator.clipboard.writeText(this.color).then(() => {
                this.toggleMagnifier();

                this.events?.onColorPickSuccess();
            });
        }
    }

    private getMousePos(e: MouseEvent): { x: number, y: number } {
        if (!this.board) return {x: 0, y: 0};

        const rect = this.board.getBoundingClientRect();
        const ratioWidth = this.board.offsetWidth / this.board.width;
        const ratioHeight = this.board.offsetHeight / this.board.height;

        return {
            x: (e.clientX - rect.left) / ratioWidth,
            y: (e.clientY - rect.top) / ratioHeight
        };
    }

    private pickColor(x: number, y: number): string {
        if (!this.boardCtx) return 'transparent';

        const pixelData = this.boardCtx.getImageData(x, y, 1, 1).data;
        return getColorFromPixelData(pixelData);
    }

    private updateColorView(): void {
        if (!this.color) return;
        const activeColor: HTMLDivElement = document.querySelector(this.config.activeColorSelector)!;

        activeColor.innerText = this.color;
        activeColor.style.backgroundColor = this.color;
        activeColor.style.color = getContrastTextColor(this.color);
        (document.querySelector(this.config.magnifier.colorBoxSelector) as HTMLSpanElement)!.innerText = this.color;
    }

    private initInteractionShortcuts(): void {
        this.initToggleMagnifierOnDblCLick();
        this.initHandleKeyPress();
    }

    private destroyInteractionShortcuts(): void {
        this.board.removeEventListener('dblclick', this.toggleMagnifier);
        document.removeEventListener("keydown", this.handleEscapeKeyPress);
    }

    private initToggleMagnifierOnDblCLick(): void {
        if (!this.isPickerActive) {
            this.board.addEventListener('dblclick', this.toggleMagnifier);
        }
    }

    private initHandleKeyPress(): void {
        document.addEventListener("keydown", this.handleKeyDown);
    }

    private handleKeyDown = (event: KeyboardEvent): void => {
        this.handleEscapeKeyPress(event);
        this.handleZoomFactorChangeShortcut(event);
    }

    private handleEscapeKeyPress = (event: KeyboardEvent): void => {
        if (event.key === "Escape" && this.isPickerActive) {
            this.toggleMagnifier();
        }
    }

    private handleZoomFactorChangeShortcut = (event: KeyboardEvent): void => {
        if ((event.ctrlKey || event.metaKey) && (event.key === "+" || event.key === "=" || event.key === "-")) {
            event.preventDefault();
            if (event.key === "+" || event.key === "=" && this.zoomFactor < this.config.magnifier.maxZoomFactor) {
                this.zoomFactor += 1;
            } else if (event.key === "-"  && this.zoomFactor > this.config.magnifier.minZoomFactor) {
                this.zoomFactor -= 1;
            }

            this.zoomFactorSelect.value = this.zoomFactor.toString();
        }
    }
}
