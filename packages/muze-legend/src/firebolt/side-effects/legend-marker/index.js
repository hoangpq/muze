import { GenericSideEffect } from '@chartshq/muze-firebolt';
import { makeElement, getSymbol, selectElement } from 'muze-utils';
import { Marker } from '../../../enums/side-effects';
import { CLASSPREFIX, HORIZONTAL } from '../../../enums/constants';
import { LEGEND_MARKER_PROPS } from '../../../legend/defaults';
import './styles.scss';

const SYMBOL_PADDING = (Math.sqrt(3) * 3);
const AXIS_STROKE = 1;

const createTextCell = (className, labelManagerRef, cells) => {
    const { TextCell } = cells;
    const cell = new TextCell(
        {
            type: 'text',
            className: `${className}-text`
        }, {
            labelManager: labelManagerRef()
        }).config({ maxLines: 1 });
    cell._minTickDiff = { height: 0, width: 0 };

    return cell;
};

const getRelativePosition = (canvas, legendContainer) => ({
    top: legendContainer.getBoundingClientRect().top - canvas.getBoundingClientRect().top,
    left: legendContainer.getBoundingClientRect().left - canvas.getBoundingClientRect().left
});
export default class LegendMarker extends GenericSideEffect {
    constructor (...params) {
        super(...params);
        this._markerElement = null;
        this._legendmarkerTextContainer = null;
    }

    static formalName () {
        return Marker;
    }

      /**
     * It returns the default configuration needed by legend-marker.
     * @return {Object} Default configuration of the legend-marker.
     */
    static defaultConfig () {
        return {
            className: 'legend-marker',
            classPrefix: CLASSPREFIX,
            size: LEGEND_MARKER_PROPS.size,
            shape: LEGEND_MARKER_PROPS.shape
        };
    }

    apply (selectionSet, payload) {
        const className = `${this.config().classPrefix}-${this.config().className}`;
        if (payload.criteria && payload.criteria.length === 2) {
            const physicalAction = function () {
            // Register physical action on marker gere
            };
            const firebolt = this.firebolt;
            const labelManager = firebolt.context.labelManager;
            const context = firebolt.context;
            const config = this.config();
            const axis = context.axis().source();

            const range = payload.criteria[0] ? axis.getScaleValue(payload.criteria[1]) : 0;

            const legendGradContainer = context.getDrawingContext().svgContainer;

            const { top, left } = getRelativePosition(context._canvasMount, legendGradContainer.node());
            const { oriTextHeight, oriTextWidth } = labelManager().getSmartText(payload.criteria[1]);

            let x;
            let y;
            let rotateAngle;
            const lableConfig = {
                top: 0,
                left: 0
            };

            debugger;
            const { size, shape } = config;
            if (context.config().align === HORIZONTAL) {
                x = range - (Math.sqrt(size / SYMBOL_PADDING)) + AXIS_STROKE;
                y = 5;
                rotateAngle = LEGEND_MARKER_PROPS.ROTATE_HORIZONTAL;
                lableConfig.top = top + y - 20;
                lableConfig.left = x + left - (oriTextWidth / 2);
            } else {
                y = range + Math.sqrt(size / (2 * SYMBOL_PADDING)) - AXIS_STROKE;
                x = 5;
                rotateAngle = LEGEND_MARKER_PROPS.ROTATE_VERTICAL;
                lableConfig.top = top + y - 17 + (oriTextHeight / 2);
                lableConfig.left = x + left - oriTextWidth - 3;
            }

            const legendmarkerGroup = makeElement(legendGradContainer,
                                                'g',
                                                [1],
                                                `${config.classPrefix}-${config.className}-group`);

            if (!this._markerElement) {
                this._markerElement = makeElement(legendmarkerGroup,
                                    'path', [{ value: null }], className, { enter: physicalAction });
            }

            if (!this._legendmarkerTextContainer) {
                this._legendmarkerTextContainer = makeElement(
                                                    context._canvasMount,
                                                    'div',
                                                    [1],
                                                    `${className}-text-container`);
                this._legendmarkerText = makeElement(
                                                    this._legendmarkerTextContainer,
                                                    'div',
                                                    [1],
                                                    `${className}-text`);
            }
            this._textElement = createTextCell(className, labelManager, context._cells);
            this._markerElement
                    .data([{ value: payload.criteria }])
                    .attr('transform', `translate(${x},${y}) rotate(${rotateAngle})`)
                    .attr('d', getSymbol(shape).size(size * size)())
                    .classed(`${className}-show`, true)
                    .classed(`${className}-hide`, false);

            this._textElement.source(payload.criteria[1]);
            this._textElement.render(this._legendmarkerText.node());
            this._legendmarkerText.attr('style', `top: ${lableConfig.top}px; left:${lableConfig.left}px`)
                                     .classed(`${className}-show`, true)
                                     .classed(`${className}-hide`, false);
        } else {
            this._markerElement
                .data([{ value: null }])
                .classed(`${className}-show`, false)
                .classed(`${className}-hide`, true);
            this._legendmarkerText
                .classed(`${className}-show`, false)
                .classed(`${className}-hide`, true);
        }
    }

}
