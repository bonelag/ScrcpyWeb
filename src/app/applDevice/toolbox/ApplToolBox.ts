import { ToolBox } from '../../toolbox/ToolBox';
import SvgImage from '../../ui/SvgImage';
import { BasePlayer } from '../../player/BasePlayer';
import { ToolBoxButton } from '../../toolbox/ToolBoxButton';
import { ToolBoxElement } from '../../toolbox/ToolBoxElement';
import { ToolBoxCheckbox } from '../../toolbox/ToolBoxCheckbox';
import { WdaProxyClient } from '../client/WdaProxyClient';

const BUTTONS = [
    {
        title: 'Home',
        name: 'home',
        icon: SvgImage.Icon.HOME,
    },
];

export interface StreamClient {
    getDeviceName(): string;
}

export class ApplToolBox extends ToolBox {
    protected constructor(list: ToolBoxElement<any>[]) {
        super(list);
    }

    public static createToolBox(
        udid: string,
        player: BasePlayer,
        client: StreamClient,
        wdaConnection: WdaProxyClient,
        moreBox?: HTMLElement,
    ): ApplToolBox {
        const playerName = player.getName();
        const list = BUTTONS.slice();
        let toolboxElement: HTMLElement;
        const positionMoreBox = (): void => {
            if (!moreBox || !toolboxElement) {
                return;
            }
            const hidden = getComputedStyle(moreBox).display === 'none';
            if (hidden) {
                return;
            }
            const parentRect = moreBox.parentElement?.getBoundingClientRect();
            const holderRect = toolboxElement.getBoundingClientRect();
            if (!parentRect) {
                return;
            }
            const left = holderRect.right - parentRect.left + 8;
            const top = holderRect.top - parentRect.top;
            const maxLeft = Math.max(parentRect.width - moreBox.offsetWidth - 8, 0);
            const maxTop = Math.max(parentRect.height - moreBox.offsetHeight - 8, 0);
            moreBox.style.left = `${Math.min(Math.max(left, 8), maxLeft)}px`;
            moreBox.style.top = `${Math.min(Math.max(top, 8), maxTop)}px`;
        };
        const handler = <K extends keyof HTMLElementEventMap, T extends HTMLElement>(
            _: K,
            element: ToolBoxElement<T>,
        ) => {
            if (!element.optional?.name) {
                return;
            }
            const { name } = element.optional;
            wdaConnection.pressButton(name);
        };
        const elements: ToolBoxElement<any>[] = list.map((item) => {
            const button = new ToolBoxButton(item.title, item.icon, {
                name: item.name,
            });
            button.addEventListener('click', handler);
            return button;
        });
        if (player.supportsScreenshot) {
            const screenshot = new ToolBoxButton('Take screenshot', SvgImage.Icon.CAMERA);
            screenshot.addEventListener('click', () => {
                player.createScreenshot(client.getDeviceName());
            });
            elements.push(screenshot);
        }

        if (moreBox) {
            const more = new ToolBoxCheckbox('More', SvgImage.Icon.MORE, `show_more_${udid}_${playerName}`);
            more.addEventListener('click', (_, el) => {
                const element = el.getElement();
                if (element.checked) {
                    moreBox.style.display = 'block';
                    positionMoreBox();
                } else {
                    moreBox.style.display = 'none';
                }
            });
            elements.unshift(more);
        }
        const applToolBox = new ApplToolBox(elements);
        toolboxElement = applToolBox.getHolderElement();
        applToolBox.setOnMove(positionMoreBox);
        return applToolBox;
    }
}
