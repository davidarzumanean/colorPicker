import {getMagnifierImageYPos} from "./utils";
import {defaultConfig, IConfig} from "./config";

export class Magnifier {
    private readonly board: HTMLCanvasElement;
    private readonly magnifierCanvas: HTMLCanvasElement;
    private magnifierContainer: HTMLDivElement;
    private magnifierCtx: CanvasRenderingContext2D | null = null;
    private readonly config: IConfig;

    constructor(
        magnifierCanvas: HTMLCanvasElement,
        magnifierContainer: HTMLDivElement,
        board: HTMLCanvasElement,
        config: Partial<IConfig> = {}
    ) {
        this.magnifierCanvas = magnifierCanvas;
        this.magnifierContainer = magnifierContainer;
        this.board = board;

        this.config = {
            ...config,
            ...defaultConfig,
        }

        this.init();
    }

    private init(): void {
        this.magnifierCtx = this.magnifierCanvas.getContext("2d", {willReadFrequently: true});

        if (!this.magnifierCtx) {
            throw new Error("Failed to create the magnifier canvas context.");
        }

        this.magnifierCanvas.width = this.config.magnifier.size;
        this.magnifierCanvas.height = this.config.magnifier.size;
    }

    public render(mouseRelativeX: number, mouseRelativeY: number, clientX: number, clientY: number, zoomFactor: number, color: string): void {
        if (!this.magnifierCtx) return;

        let sourceX = Math.max(0, mouseRelativeX - this.config.magnifier.size / 2 / this.getZoomRatio(zoomFactor));
        let sourceY = Math.max(0, mouseRelativeY - this.config.magnifier.size / 2 / this.getZoomRatio(zoomFactor));

        document.body.style.cursor = "none";
        const magnifierHalfSize = this.config.magnifier.size / 2;

        this.magnifierContainer.style.borderColor = color;
        this.magnifierContainer.style.left = `${clientX - magnifierHalfSize + window.scrollX}px`;
        this.magnifierContainer.style.top = `${clientY - magnifierHalfSize + window.scrollY}px`;
        this.magnifierContainer.style.display = "block";

        this.magnifierCtx.clearRect(0, 0, this.config.magnifier.size, this.config.magnifier.size);
        this.magnifierCtx.drawImage(
            this.board,
            sourceX,
            sourceY,
            this.config.magnifier.size / this.getZoomRatio(zoomFactor),
            this.config.magnifier.size / this.getZoomRatio(zoomFactor),
            0,
            getMagnifierImageYPos(clientY, magnifierHalfSize, zoomFactor, this.config.headerHeight),
            this.config.magnifier.size,
            this.config.magnifier.size
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
                Math.abs(i + this.config.magnifier.gridSize + lineWidth - this.config.magnifier.size / 2) <= this.config.magnifier.gridSize / 2 &&
                Math.abs(j + this.config.magnifier.gridSize + lineWidth - this.config.magnifier.size / 2) <= this.config.magnifier.gridSize / 2
            );
        }

        for (let i = 0; i < this.magnifierCanvas.width; i += this.config.magnifier.gridSize) {
            for (let j = 0; j < this.magnifierCanvas.height; j += this.config.magnifier.gridSize) {
                this.magnifierCtx.lineWidth = 0.3;

                if (isCentralGrid(i, j, this.magnifierCtx.lineWidth)) {
                    this.magnifierCtx.lineWidth = 1;
                    this.magnifierCtx.strokeStyle = this.config.magnifier.centralGridColor;
                } else {
                    this.magnifierCtx.strokeStyle = this.config.magnifier.gridColor;
                }

                this.magnifierCtx.strokeRect(i, j, this.config.magnifier.gridSize, this.config.magnifier.gridSize);
            }
        }
    }
}
