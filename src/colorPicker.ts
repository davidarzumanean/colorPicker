import {getColorFromPixelData, getContrastTextColor, getMagnifierImageYPos} from "./utils";

export class ColorPicker {
    board: HTMLCanvasElement;
    boardCtx: CanvasRenderingContext2D;
    isBoardExpanded: boolean = false;
    magnifierCanvas: HTMLCanvasElement;
    magnifierCtx: CanvasRenderingContext2D | null = null;
    isPickerActive: boolean = false;
    _color: string | null = null;
    magnifier: HTMLElement | null = null;
    pickerBtn: HTMLButtonElement;
    zoomFactorSelect: HTMLSelectElement;

    magnifierSize = 100;
    zoomFactor = 2;
    gridSize = 9;

    constructor(
        board: HTMLCanvasElement,
        boardCtx: CanvasRenderingContext2D,
        isExpanded: boolean,
        magnifierContainer: HTMLDivElement,
        magnifierCanvas: HTMLCanvasElement,
        pickerBtn: HTMLButtonElement,
        zoomFactorSelect: HTMLSelectElement
    ) {
        this.board = board;
        this.boardCtx = boardCtx;
        this.isBoardExpanded = isExpanded;
        this.magnifier = magnifierContainer;
        this.magnifierCanvas = magnifierCanvas;
        this.pickerBtn = pickerBtn;
        this.zoomFactorSelect = zoomFactorSelect;

        this.initPicker();
        this.initPickerButton();
        this.initZoomFactor();
    }

    destroy() {
        this.board.removeEventListener("mousemove", this.showMagnifier);
        this.board.removeEventListener("mouseleave", this.hideMagnifier);
        this.board.removeEventListener("click", this.saveColorToClipboard);
        this.pickerBtn.removeEventListener("click", this.toggleMagnifier);
        this.zoomFactorSelect?.removeEventListener('change', this.handleZoomChangeListener);
    }

    set color (color: string | null) {
        this._color = color;
        this.updateColorView();
    }

    get color () {
        return this._color;
    }

    initPicker() {
        this.magnifierCanvas = document.getElementById("magnifier-canvas") as HTMLCanvasElement;

        try {
            this.magnifierCtx = this.magnifierCanvas.getContext("2d", { willReadFrequently: true });
            if (!this.magnifierCtx) {
                throw new Error("Failed to create the magnifier canvas context.");
            }
            this.magnifierCanvas.width = this.magnifierSize;
            this.magnifierCanvas.height = this.magnifierSize;
        } catch (error) {
            console.error("Error initializing magnifier canvas:", error);
        }
    }

    initPickerButton() {
        this.pickerBtn.addEventListener('click', this.toggleMagnifier);
    }

    initZoomFactor() {
        this.zoomFactorSelect.addEventListener('change', this.handleZoomChangeListener);
    }

    handleZoomChangeListener = (): void => {
        this.zoomFactor = parseInt(this.zoomFactorSelect.value);
    }

    toggleMagnifier = () => {
        this.isPickerActive = !this.isPickerActive;

        if (this.isPickerActive) {
            this.initMagnifier();
            this.pickerBtn.style.fill = '#0D6EFD';
        } else {
            this.hideMagnifier();
            this.pickerBtn.style.removeProperty('fill');
        }
    }

    initMagnifier = (): void => {
        this.board.addEventListener("mousemove", this.showMagnifier);
        this.board.addEventListener("mouseleave", this.hideMagnifier);
        this.board.addEventListener("click", this.saveColorToClipboard);
    }

    showMagnifier = (e: MouseEvent): void => {
        if (!this.magnifier || !this.magnifierCtx) return;
        document.body.style.cursor = "none";

        const position = this.getMousePos(e);
        const {x, y} = position;

        this.color = this.pickColor(x, y);
        this.magnifier.style.borderColor = this.color;

        if (x >= 0 && x <= this.board.width && y >= 0 && y <= this.board.height) {
            const magnifierHalfSize = this.magnifierSize / 2;

            this.magnifier.style.left = `${e.clientX - magnifierHalfSize + window.scrollX}px`;
            this.magnifier.style.top = `${e.clientY - magnifierHalfSize + window.scrollY}px`;
            this.magnifier.style.display = "block";

            let sourceX = Math.max(0, x - magnifierHalfSize / this.getZoom());
            let sourceY = Math.max(0, y - magnifierHalfSize / this.getZoom());

            this.magnifierCtx.clearRect(0, 0, this.magnifierSize, this.magnifierSize );
            this.magnifierCtx.drawImage(
                this.board,
                sourceX,
                sourceY,
                this.magnifierSize / this.getZoom(),
                this.magnifierSize / this.getZoom(),
                0,
                getMagnifierImageYPos(e, magnifierHalfSize),
                this.magnifierSize,
                this.magnifierSize
            );

            this._drawMagnifierGrid();
        } else {
            this.hideMagnifier();
        }
    }

    hideMagnifier = () => {
        if (!this.isPickerActive) {
            this.board.removeEventListener("mousemove", this.showMagnifier);
            this.board.removeEventListener("mouseleave", this.hideMagnifier);
            this.board.removeEventListener("click", this.saveColorToClipboard);
        }
        document.body.style.cursor = "default";
        if (this.magnifier) this.magnifier.style.display = "none";
    }

    saveColorToClipboard = (): void => {
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

    getZoom() {
        const ratio = this.board?.offsetWidth / this.board?.width || 1;

        return this.zoomFactor * ratio
    }

    getMousePos(e: MouseEvent): { x: number, y: number } {
        if (!this.board) return {x: 0, y: 0};

        const rect = this.board.getBoundingClientRect();
        const ratioWidth = this.board.offsetWidth / this.board.width;
        const ratioHeight = this.board.offsetHeight / this.board.height;

        return {
            x: (e.clientX - rect.left) / ratioWidth,
            y: (e.clientY - rect.top) / ratioHeight
        };
    }

    pickColor(x: number, y: number) {
        if (!this.boardCtx) return 'transparent';

        const pixelData = this.boardCtx.getImageData(x, y, 1, 1).data;
        return getColorFromPixelData(pixelData);
    }

    updateColorView() {
        if (!this.color) return;
        const currentColor = document.getElementById('current-color')!;

        currentColor.innerText = this.color;
        currentColor.style.backgroundColor = this.color;
        currentColor.style.color = getContrastTextColor(this.color);
        document.getElementById('color-container')!.innerText = this.color;
    }

    _drawMagnifierGrid() {
        if (!this.magnifierCanvas || !this.magnifierCtx) return null;

        const isCentralGrid = (i: number, j: number, lineWidth: number, magnifierSize: number) => {
            return Math.abs(i  + this.gridSize + lineWidth - magnifierSize / 2) <= this.gridSize / 2 &&
                Math.abs(j + this.gridSize + lineWidth - magnifierSize / 2) <= this.gridSize / 2;
        }

        for (let i = 0; i < this.magnifierCanvas.width; i += this.gridSize) {
            for (let j = 0; j < this.magnifierCanvas.height; j += this.gridSize) {
                this.magnifierCtx.lineWidth = 0.3;

                if (isCentralGrid(i, j, this.magnifierCtx.lineWidth, this.magnifierSize)) {
                    this.magnifierCtx.lineWidth = 1;
                    this.magnifierCtx.strokeStyle = "#fff";
                } else {
                    this.magnifierCtx.strokeStyle = "#808080";
                }

                this.magnifierCtx.strokeRect(i, j, this.gridSize, this.gridSize);
            }
        }
    }
}
