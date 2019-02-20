const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Color = require('../../util/color');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');
const StageLayering = require('../../engine/stage-layering');


/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MjAiCmhlaWdodD0iNDIwIiBzdHJva2U9IiMwMDAiIGZpbGw9Im5vbmUiPgo8cGF0aCBzdHJva2Utd2lkdGg9IjI2IgpkPSJNMjA5LDE1YTE5NSwxOTUgMCAxLDAgMiwweiIvPgo8cGF0aCBzdHJva2Utd2lkdGg9IjE4IgpkPSJtMjEwLDE1djM5MG0xOTUtMTk1SDE1TTU5LDkwYTI2MCwyNjAgMCAwLDAgMzAyLDAgbTAsMjQwIGEyNjAsMjYwIDAgMCwwLTMwMiwwTTE5NSwyMGEyNTAsMjUwIDAgMCwwIDAsMzgyIG0zMCwwIGEyNTAsMjUwIDAgMCwwIDAtMzgyIi8+Cjwvc3ZnPg==';

/**
 * Svg representing an empty map layer
 * @type {string}
 */
// eslint-disable-next-line max-len
const emptyMapSVG = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><title>Scratch-Geo Map</title></svg>`;


/**
 * Host for the Geo-related blocks in Scratch 3.0
 * @param {Runtime} runtime - the runtime instantiating this block package.
 * @constructor
 */
class Scratch3GeoBlocks {
    constructor (runtime) {
        /**
         * The runtime instantiating this block package.
         * @type {Runtime}
         */
        this.runtime = runtime;

        /**
         * The ID of the renderer Skin corresponding to the pen layer.
         * @type {int}
         * @private
         */
        this._mapSkinId = -1;
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        return {
            id: 'geo',
            name: formatMessage({
                id: 'geo.categoryName',
                default: 'Geo',
                description: 'Label for the geo extension category'
            }),
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'clearmap',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'geo.clearmap',
                        default: 'erase map',
                        description: 'erase the map'
                    })
                },
                {
                    opcode: 'drawmap',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'geo.drawmap',
                        default: 'draw map',
                        description: 'draw the map'
                    })
                }
            ],
            menus: {

            }
        };
    }

    /**
     * Retrieve the ID of the renderer "Skin" corresponding to the map layer. If
     * the map Skin doesn't yet exist, create it.
     * @returns {int} the Skin ID of the map layer, or -1 on failure.
     * @private
     */
    _getMapLayerID () {
        if (this._mapSkinId < 0 && this.runtime.renderer) {
            this._mapSkinId = this.runtime.renderer.createSVGSkin(emptyMapSVG);
            this._mapDrawableId = this.runtime.renderer.createDrawable(StageLayering.PEN_LAYER);
            this.runtime.renderer.updateDrawableProperties(this._mapDrawableId, {skinId: this._mapSkinId});
        }
        return this._mapSkinId;
    }

    /**
     * The geo "drawmap" block draws the selected map".
     */
    drawmap() {
      const mapSkinId = this._getMapLayerID();
      if (mapSkinId >= 0) {
        const svgData = `<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><title>pen-icon</title><g stroke="#575E75" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M8.753 34.602l-4.25 1.78 1.783-4.237c1.218-2.892 2.907-5.423 5.03-7.538L31.066 4.93c.846-.842 2.65-.41 4.032.967 1.38 1.375 1.816 3.173.97 4.015L16.318 29.59c-2.123 2.116-4.664 3.8-7.565 5.012" fill="#FFF"/><path d="M29.41 6.11s-4.45-2.378-8.202 5.772c-1.734 3.766-4.35 1.546-4.35 1.546"/><path d="M36.42 8.825c0 .463-.14.873-.432 1.164l-9.335 9.3c.282-.29.41-.668.41-1.12 0-.874-.507-1.963-1.406-2.868-1.362-1.358-3.147-1.8-4.002-.99L30.99 5.01c.844-.84 2.65-.41 4.035.96.898.904 1.396 1.982 1.396 2.855M10.515 33.774c-.573.302-1.157.57-1.764.83L4.5 36.382l1.786-4.235c.258-.604.53-1.186.833-1.757.69.183 1.448.625 2.108 1.282.66.658 1.102 1.412 1.287 2.102" fill="#4C97FF"/><path d="M36.498 8.748c0 .464-.14.874-.433 1.165l-19.742 19.68c-2.13 2.11-4.673 3.793-7.572 5.01L4.5 36.38l.974-2.316 1.925-.808c2.898-1.218 5.44-2.9 7.57-5.01l19.743-19.68c.292-.292.432-.702.432-1.165 0-.646-.27-1.4-.78-2.122.25.172.5.377.737.614.898.905 1.396 1.983 1.396 2.856" fill="#575E75" opacity=".15"/><path d="M18.45 12.83c0 .5-.404.905-.904.905s-.905-.405-.905-.904c0-.5.407-.903.906-.903.5 0 .904.404.904.904z" fill="#575E75"/></g></svg>`;
        this.runtime.renderer.updateSVGSkin(mapSkinId, svgData);
        this.runtime.requestRedraw();
      }
    }

    /**
     * The geo "clearmap" block clears the map layer's contents.
     */
    clearmap () {
        const mapSkinId = this._getMapLayerID();
        if (mapSkinId >= 0) {
            this.runtime.renderer.updateSVGSkin(mapSkinId, emptyMapSVG);
            this.runtime.requestRedraw();
        }
    }
}

module.exports = Scratch3GeoBlocks;
