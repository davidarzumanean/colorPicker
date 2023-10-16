import { getMagnifierImageYPos } from "./utils";

export class Magnifier {
    private readonly board: HTMLCanvasElement;
    private readonly magnifierCanvas: HTMLCanvasElement;
    private magnifierContainer: HTMLDivElement;
    private magnifierCtx: CanvasRenderingContext2D | null = null;
    private readonly magnifierSize: number;
    private readonly gridSize: number;

    constructor(magnifierCanvas: HTMLCanvasElement, magnifierContainer: HTMLDivElement, board: HTMLCanvasElement, magnifierSize: number, gridSize: number) {
        this.magnifierCanvas = magnifierCanvas;
        this.magnifierContainer = magnifierContainer;
        this.board = board;
        this.magnifierSize = magnifierSize;
        this.gridSize = gridSize;

        this.init();
    }

    private init(): void {
        this.magnifierCtx = this.magnifierCanvas.getContext("2d", { willReadFrequently: true });

        if (!this.magnifierCtx) {
            throw new Error("Failed to create the magnifier canvas context.");
        }

        this.magnifierCanvas.width = this.magnifierSize;
        this.magnifierCanvas.height = this.magnifierSize;
    }

    public render(mouseRelativeX: number, mouseRelativeY: number, clientX: number, clientY: number, zoomFactor: number, color: string): void {
        if (!this.magnifierCtx) return;

        let sourceX = Math.max(0, mouseRelativeX - this.magnifierSize / 2 / this.getZoomRatio(zoomFactor));
        let sourceY = Math.max(0, mouseRelativeY - this.magnifierSize / 2 / this.getZoomRatio(zoomFactor));

        document.body.style.cursor = "none";
        const magnifierHalfSize = this.magnifierSize / 2;

        this.magnifierContainer.style.borderColor = color;
        this.magnifierContainer.style.left = `${clientX - magnifierHalfSize + window.scrollX}px`;
        this.magnifierContainer.style.top = `${clientY - magnifierHalfSize + window.scrollY}px`;
        this.magnifierContainer.style.display = "block";

        this.magnifierCtx.clearRect(0, 0, this.magnifierSize, this.magnifierSize);
        this.magnifierCtx.drawImage(
            this.board,
            sourceX,
            sourceY,
            this.magnifierSize / this.getZoomRatio(zoomFactor),
            this.magnifierSize / this.getZoomRatio(zoomFactor),
            0,
            getMagnifierImageYPos(clientY, magnifierHalfSize, zoomFactor),
            this.magnifierSize,
            this.magnifierSize
        );

        this.drawMagnifierGrid();
    }

    public hide(): void {
        document.body.style.cursor = "default";
        this.magnifierContainer.style.display = "none";
    }

    private getZoomRatio(zoomFactor: number): number {
        const ratio = this.board?.offsetWidth / this.board?.width || 1;

        return zoomFactor * ratio;
    }

    private drawMagnifierGrid(): void {
        if (!this.magnifierCanvas || !this.magnifierCtx) return;

        const isCentralGrid = (i: number, j: number, lineWidth: number) => {
            return (
                Math.abs(i + this.gridSize + lineWidth - this.magnifierSize / 2) <= this.gridSize / 2 &&
                Math.abs(j + this.gridSize + lineWidth - this.magnifierSize / 2) <= this.gridSize / 2
            );
        }

        for (let i = 0; i < this.magnifierCanvas.width; i += this.gridSize) {
            for (let j = 0; j < this.magnifierCanvas.height; j += this.gridSize) {
                this.magnifierCtx.lineWidth = 0.3;

                if (isCentralGrid(i, j, this.magnifierCtx.lineWidth)) {
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
