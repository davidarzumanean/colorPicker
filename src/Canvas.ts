export class Canvas {
    private readonly _canvas: HTMLCanvasElement;
    private readonly ctx: CanvasRenderingContext2D | null = null;
    private isExpanded: boolean = false;
    private readonly toggleExpandBtnContainer: HTMLDivElement;

    constructor(canvasId: string, src: string) {
        this._canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d", {willReadFrequently: true});
        this.toggleExpandBtnContainer = document.getElementById('expandCompressCanvas') as HTMLDivElement;
        this.initCanvas(src);
        this.initCanvasExpandCompress();
    }

    private initCanvas(src: string) {

        this.canvas.width = 6000;
        this.canvas.height = 4000;

        const image = new Image();
        image.src = src;
        image.onload = () => {
            this.ctx?.drawImage(image, 0, 0);
        };
    }

    public destroy(): void {
        this.toggleExpandBtnContainer.removeEventListener('click', this.handleExpandClick);
    }

    public get canvas() {
        return this._canvas;
    }

    public get isInitialized(): boolean {
        return !!(this.canvas && this.ctx);
    }

    private initCanvasExpandCompress() {
        this.toggleExpandBtnContainer.addEventListener('click', this.handleExpandClick);
    }

    private handleExpandClick = (): void => {
        this.isExpanded = !this.isExpanded;

        if (this.isExpanded) {
            this.canvas?.style.removeProperty('max-width');
        } else {
            this.canvas!.style.maxWidth = '100%';
        }

        const buttons: NodeListOf<HTMLElementTagNameMap["button"]> = this.toggleExpandBtnContainer.querySelectorAll('button');
        buttons.forEach((btn: HTMLButtonElement) => {
            btn.classList.toggle('hide');
        })
    }
}
