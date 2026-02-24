import { ToolBoxElement } from './ToolBoxElement';

export class ToolBox {
    private readonly holder: HTMLElement;
    private onMove?: (holder: HTMLElement) => void;
    private readonly controls: HTMLElement[] = [];
    private collapsed = false;
    private lastTap = 0;

    constructor(list: ToolBoxElement<any>[]) {
        this.holder = document.createElement('div');
        this.holder.classList.add('control-buttons-list', 'control-wrapper');
        this.holder.style.left = '12px';
        this.holder.style.top = '12px';

        this.holder.appendChild(this.createDragHandle());
        list.forEach((item) => {
            item.getAllElements().forEach((el) => {
                this.controls.push(el);
                this.holder.appendChild(el);
            });
        });
    }

    public getHolderElement(): HTMLElement {
        return this.holder;
    }

    public setOnMove(listener: (holder: HTMLElement) => void): void {
        this.onMove = listener;
    }

    private createDragHandle(): HTMLButtonElement {
        const handle = document.createElement('button');
        handle.classList.add('control-button', 'drag-handle');
        handle.title = 'Move menu';
        handle.textContent = '◙';
        handle.style.touchAction = 'none';
        this.holder.style.touchAction = 'none';

        const toggleCollapse = (): void => {
            this.setCollapsed(!this.collapsed);
        };

        const onPointerDown = (ev: PointerEvent): void => {
            if (!this.holder.parentElement) {
                return;
            }
            ev.preventDefault();
            const startLeft = this.holder.offsetLeft;
            const startTop = this.holder.offsetTop;
            const startX = ev.clientX;
            const startY = ev.clientY;

            const onPointerMove = (moveEv: PointerEvent): void => {
                const nextLeft = startLeft + (moveEv.clientX - startX);
                const nextTop = startTop + (moveEv.clientY - startY);
                this.updatePosition(nextLeft, nextTop);
            };

            const stopDragging = (endEv: PointerEvent): void => {
                handle.releasePointerCapture(endEv.pointerId);
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', stopDragging);
                window.removeEventListener('pointercancel', stopDragging);
            };

            handle.setPointerCapture(ev.pointerId);
            window.addEventListener('pointermove', onPointerMove, { passive: false });
            window.addEventListener('pointerup', stopDragging);
            window.addEventListener('pointercancel', stopDragging);
        };

        handle.addEventListener('dblclick', (ev) => {
            ev.preventDefault();
            toggleCollapse();
        });

        handle.addEventListener('pointerup', (ev) => {
            if (ev.pointerType === 'touch' || ev.pointerType === 'pen') {
                const now = ev.timeStamp;
                if (now - this.lastTap < 300) {
                    toggleCollapse();
                    this.lastTap = 0;
                } else {
                    this.lastTap = now;
                }
            }
        });

        handle.addEventListener('pointerdown', onPointerDown);
        return handle;
    }

    private setCollapsed(collapsed: boolean): void {
        this.collapsed = collapsed;
        this.holder.classList.toggle('collapsed', collapsed);
        this.controls.forEach((el) => {
            el.style.display = collapsed ? 'none' : '';
        });
        if (this.onMove) {
            this.onMove(this.holder);
        }
    }

    private updatePosition(left: number, top: number): void {
        const parentRect = this.holder.parentElement?.getBoundingClientRect();
        if (!parentRect) {
            return;
        }
        const maxLeft = Math.max(parentRect.width - this.holder.offsetWidth - 8, 0);
        const maxTop = Math.max(parentRect.height - this.holder.offsetHeight - 8, 0);
        const clampedLeft = Math.min(Math.max(left, 8), maxLeft);
        const clampedTop = Math.min(Math.max(top, 8), maxTop);
        this.holder.style.left = `${clampedLeft}px`;
        this.holder.style.top = `${clampedTop}px`;
        if (this.onMove) {
            this.onMove(this.holder);
        }
    }
}
