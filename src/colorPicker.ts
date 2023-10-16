import {getColorFromPixelData, getContrastTextColor} from "./utils";
import {Magnifier} from "./Magnifier";

export class ColorPicker {
    private readonly board: HTMLCanvasElement;
    private readonly boardCtx: CanvasRenderingContext2D;
    private isPickerActive: boolean = false;
    private _color: string | null = null;
    private readonly pickerBtn: HTMLButtonElement;
    private readonly zoomFactorSelect: HTMLSelectElement;
    private readonly magnifierInstance: Magnifier;

    magnifierSize = 100;
    zoomFactor = 2;
    gridSize = 9;

    constructor(
        board: HTMLCanvasElement,
        boardCtx: CanvasRenderingContext2D,
        magnifierContainer: HTMLDivElement,
        magnifierCanvas: HTMLCanvasElement,
        pickerBtn: HTMLButtonElement,
        zoomFactorSelect: HTMLSelectElement
    ) {
        this.board = board;
        this.boardCtx = boardCtx;
        this.pickerBtn = pickerBtn;
        this.zoomFactorSelect = zoomFactorSelect;

        this.initPickerButton();
        this.initZoomFactorSelect();
        this.initInteractionShortcuts();

        this.magnifierInstance = new Magnifier(magnifierCanvas, magnifierContainer, this.board, this.magnifierSize, this.gridSize);
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
            this.pickerBtn.style.fill = '#0D6EFD';
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

                const successMsg = document.getElementById('copySuccessMsg');
                successMsg?.classList.remove('hide');
                setTimeout(() => {
                    successMsg?.classList.add('hide');
                }, 2000);
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
        const currentColor = document.getElementById('current-color')!;

        currentColor.innerText = this.color;
        currentColor.style.backgroundColor = this.color;
        currentColor.style.color = getContrastTextColor(this.color);
        document.getElementById('color-container')!.innerText = this.color;
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
            if (event.key === "+" || event.key === "=" && this.zoomFactor < 5) {
                this.zoomFactor += 1;
            } else if (event.key === "-"  && this.zoomFactor > 1) {
                this.zoomFactor -= 1;
            }

            this.zoomFactorSelect.value = this.zoomFactor.toString();
        }
    }
}
