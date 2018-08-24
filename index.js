/* eslint-env commonjs */

'use strict';

var DatasaurBase = require('datasaur-base');

/**
 * @constructor
 */
var DatasaurIndexed = DatasaurBase.extend('DatasaurIndexed', {

    /**
     * @memberOf DatasaurIndexed#
     * @param y
     * @returns {*}
     */
    transposeY: function(y) {
        return this.index ? this.index[y] : y;
    },

    getRowIndex: function(y) {
        return this.next.getRowIndex(this.transposeY(y));
    },

    /**
     * @memberOf DatasaurIndexed#
     * @param y
     * @returns {object}
     */
    getRow: function(y) {
        return this.next.getRow(this.transposeY(y));
    },

    getRowMetadata: function(y, prototype) {
        return this.next.getRowMetadata(this.transposeY(y), prototype);
    },

    setRowMetadata: function(y, metadata) {
        return this.next.setRowMetadata(this.transposeY(y), metadata);
    },

    /**
     * @memberOf DatasaurIndexed#
     * @param x
     * @param y
     * @returns {*|Mixed}
     */
    getValue: function(x, y) {
        return this.next.getValue(x, this.transposeY(y));
    },

    /**
     * @memberOf DatasaurIndexed#
     * @param {number} x
     * @param {number} y
     * @param {*} value
     */
    setValue: function(x, y, value) {
        this.next.setValue(x, this.transposeY(y), value);
    },

    /**
     * @memberOf DatasaurIndexed#
     * @returns {Number|*}
     */
    getRowCount: function() {
        return this.index ? this.index.length : this.next.getRowCount();
    },

    /**
     * @memberOf DatasaurIndexed#
     * @param {number[]} [index]
     * @returns {undefined|number[]}
     */
    setIndex: function(index) {
        if (index === undefined) {
            delete this.index;
        } else {
            this.dispatchEvent(DatasaurIndexed.preindexEventString);
            this.index = index;
            this.dispatchEvent(DatasaurIndexed.postindexEventString);
        }
        return index;
    },

    /**
     * @memberOf DatasaurIndexed#
     * @returns {undefined|number[]}
     */
    clearIndex: function() {
        return this.setIndex(undefined);
    },

    /**
     * @memberOf DatasaurIndexed#
     * @param {filterPredicate} [predicate]
     * @returns {undefined|number[]}
     */
    buildIndex: function(predicate) {
        if (predicate) {
            delete this.index; // free up memory before building a new index

            for (var y = 0, next = this.next, Y = next.getRowCount(), index = []; y < Y; y++) {
                if (predicate.call(next, y)) {
                    index.push(y);
                }
            }

            if (index.length === Y) {
                index = undefined;
            }
        }

        return this.setIndex(index);
    }
});

DatasaurIndexed.preindexEventString = 'fin-hypergrid-data-prereindex';
DatasaurIndexed.postindexEventString = 'fin-hypergrid-data-postreindex';

/** @typedef {function} filterPredicate
 * @summary Applies filter to given row.
 * @this {Datasaur}
 * @param {number} y - Index of row in data source (`this.datasaur`).
 * @returns {boolean} Row qualifies (passes through filter).
 */

/**
 * Used by the sorters, such as `DatasaurSorter`
 * @param {object} dataRow
 * @param {string} columnName
 * @returns {*}
 */
DatasaurIndexed.valOrFunc = function(dataRow, columnName, calculator) {
    var result;
    if (dataRow) {
        result = dataRow[columnName];
        calculator = (typeof result)[0] === 'f' && result || calculator;
        if (calculator) {
            result = calculator(dataRow, columnName);
        }
    }
    return result;
};

DatasaurIndexed.version = '3.0.0';

module.exports = DatasaurIndexed;
