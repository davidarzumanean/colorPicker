export class ColorPicker {
    board: HTMLCanvasElement | null = null;
    boardCtx: CanvasRenderingContext2D | null = null;
    isBoardExpanded: boolean = false;
    magnifierCanvas: HTMLCanvasElement | null = null;
    magnifierCtx: CanvasRenderingContext2D | null = null;
    isPickerActive: boolean = false;
    _color: string | null = null;
    magnifier: HTMLElement | null = null;
    pickerBtn: HTMLButtonElement | null = null;

    magnifierSize = 100;
    zoomFactor = 2;
    gridSize = 9;

    constructor(board: HTMLCanvasElement, boardCtx: CanvasRenderingContext2D, isExpanded: boolean) {
        this.board = board;
        this.boardCtx = boardCtx;
        this.isBoardExpanded = isExpanded;
        this.initPicker();
        this.initPickerButton();
        this.initZoomFactor();
        this.initMagnifier = this.initMagnifier.bind(this)
        this.showMagnifier = this.showMagnifier.bind(this)
        this.toggleMagnifier = this.toggleMagnifier.bind(this)
        this.saveColorToClipboard = this.saveColorToClipboard.bind(this)
    }

    set color (color: string | null) {
        this._color = color;

        document.getElementById('current-color')!.innerText = this.color || "";
        document.getElementById('current-color')!.style.backgroundColor = this.color || "";
        document.getElementById('current-color')!.style.color = this.getContrastTextColor(this.color!) || "";
        document.getElementById('color-container')!.innerText = this.color || "";
    }

    get color () {
        return this._color;
    }

    initPicker() {
        this.magnifierCanvas = document.getElementById("magnifier-canvas") as HTMLCanvasElement;

        if (!this.magnifierCanvas) return;

        this.magnifierCtx = this.magnifierCanvas.getContext("2d", {willReadFrequently: true});
        this.magnifierCanvas.width = this.magnifierSize;
        this.magnifierCanvas.height = this.magnifierSize;
    }

    initPickerButton() {
        this.pickerBtn = document.getElementById('pickColorButton') as HTMLButtonElement;

        this.pickerBtn.addEventListener('click', () => {
            this.toggleMagnifier()
        });
    }

    initZoomFactor() {
        const zoomFactorSelect = document.getElementById('zoomFactor') as HTMLSelectElement;
        zoomFactorSelect.addEventListener('change', () => {
            this.zoomFactor = parseInt(zoomFactorSelect.value);
        });
    }

    toggleMagnifier() {
        if (!this.pickerBtn) return null;
        this.isPickerActive = !this.isPickerActive;

        if (this.isPickerActive) {
            this.initMagnifier();
            this.pickerBtn.style.fill = '#0D6EFD';
        } else {
            this.hideMagnifier();
            this.pickerBtn.style.removeProperty('fill');
        }
    }

    initMagnifier() {
        this.magnifier = document.getElementById("magnifier");

        this.board?.addEventListener("mousemove", this.showMagnifier);
        this.board?.addEventListener("mouseleave", this.hideMagnifier);
        this.board?.addEventListener("click", this.saveColorToClipboard);
    }

    showMagnifier(event: MouseEvent) {
        if (!this.board || !this.magnifier || !this.magnifierCanvas || !this.magnifierCtx) return;
        document.body.style.cursor = "none";

        const position = this.getMousePos(event);
        const {x, y} = position;

        this.color = this.pickColor(x, y);
        this.magnifier.style.borderColor = this.color;

        if (x >= 0 && x <= this.board.width && y >= 0 && y <= this.board.height) {
            const magnifierHalfSize = this.magnifierSize / 2;

            this.magnifier.style.left = `${event.clientX - magnifierHalfSize + window.scrollX}px`;
            this.magnifier.style.top = `${event.clientY - magnifierHalfSize + window.scrollY}px`;
            this.magnifier.style.display = "block";

            const sourceX = Math.max(0, x - magnifierHalfSize / this.getZoom());
            const sourceY = Math.max(0, y - magnifierHalfSize / this.getZoom());

            this.magnifierCtx.clearRect(0, 0, this.magnifierCanvas.width, this.magnifierCanvas.height);
            this.magnifierCtx.drawImage(this.board, sourceX, sourceY, this.magnifierCanvas.width / this.getZoom(), this.magnifierCanvas.height / this.getZoom(), 0, 0, this.magnifierCanvas.width, this.magnifierCanvas.height);

            this._drawMagnifierGrid();
        } else {
            this.hideMagnifier();
        }
    }

    hideMagnifier() {
        this.board?.removeEventListener("mousemove", this.showMagnifier);
        this.board?.removeEventListener("mouseleave", this.hideMagnifier);
        this.board?.removeEventListener("click", this.saveColorToClipboard);
        this.pickerBtn?.removeEventListener("click", this.toggleMagnifier);

        document.body.style.cursor = "default";
        if (this.magnifier) this.magnifier.style.display = "none";
    }

    saveColorToClipboard() {
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
        if (!this.board || this.isBoardExpanded) return this.zoomFactor;

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
        return "#" + ((1 << 24) | (pixelData[0] << 16) | (pixelData[1] << 8) | pixelData[2]).toString(16).slice(1);
    }

    getContrastTextColor(backgroundColor: string) {
        const hex = backgroundColor.replace("#", "");
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        return luminance > 0.5 ? "#000" : "#fff";
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
