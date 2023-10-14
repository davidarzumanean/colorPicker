export class Canvas {
    _canvas: HTMLCanvasElement | null = null;
    ctx: CanvasRenderingContext2D | null = null;
    isExpanded: boolean = false;

    constructor(canvasId: string, src: string) {
        this.initCanvas(canvasId, src);
        this.initCanvasExpandCompress();
    }

    initCanvas(canvasId: string, src: string) {
        this._canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        if (!this.canvas) return;

        this.ctx = this.canvas.getContext("2d", {willReadFrequently: true});
        this.canvas.width = 6000;
        this.canvas.height = 4000;

        const image = new Image();
        image.src = src;
        image.onload = () => {
            this.ctx?.drawImage(image, 0, 0);
        };
    }

    get canvas() {
        return this._canvas;
    }

    get context() {
        return this.ctx;
    }

    get isInitialized(): boolean {
        return !!(this.canvas && this.context);
    }

    get expanded(): boolean {
        return this.isExpanded;
    }

    initCanvasExpandCompress() {
        const toggleExpand: HTMLDivElement = document.getElementById('expandCompressCanvas') as HTMLDivElement;
        toggleExpand.addEventListener('click', () => {
            this.isExpanded = !this.isExpanded;

            if (this.isExpanded) {
                this.canvas?.style.removeProperty('max-width');
            } else {
                this.canvas!.style.maxWidth = '100%';
            }

            const buttons = toggleExpand.querySelectorAll('.button');
            buttons.forEach(btn => {
                btn.classList.toggle('hide');
            })
        });
    }
}
