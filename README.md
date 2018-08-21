An indexed record _Datasaur_ module.

The `datasaur-indexed` data source provides a means to map the original set of rows, resulting in a subset of particular rows in a particular order.

### Instantiation

`datasaur-indexed` sits on top of a static datasource. For example:
 ```js
 var Source = require('datasaur-local'); // v3.0.0 or higher
 var Indexer = require('datasaur-indexed'); // this version must be >= that of datasaur-local
 var dataModel = new Indexer(new Source);
 ```

### Custom Properties

`datasaur-indexed` introduces a custom `index` property and some helper methods described in the next section.

#### `index`

The `index` property, when defined, is an integer array that maps the `y` value (row index provided to other method calls) to specific rows in the original set of rows.
This property is all that is needed to effectively "index" (reorder, filter, and/or alias) the data.

Given the following set of rows (shown here in JSON syntax):
```json
[
  { "name": "Sam", "gender": "M" },
  { "name": "Al", "gender": "F" },
  { "name": "Max", "gender": "M" },
  { "name": "Jo", "gender": "F" }
]
```

To filter the data:
```js
dataModel.index = [0, 2] // rows where second column is 'M'
```
To order the data:
```js
dataModel.index = [1, 3, 2, 0] // alpha ascending by first column
```
To alias all rows:
```js
dataModel.index = [0, 0, 1, 1, 2, 2, 3, 3]
```
To remove the index and revert to the original set of rows:
```js
dataModel.index = undefined
```

While the above approach works, it is wholly inadequate, however, as a generalized solution for filtering and sorting.
See [`buildIndex`](#dataModel-buildIndex-predicate) and [_Generalized sorting_](#generalized-sorting) below for better solutions.

### Custom methods
#### `dataModel.setIndex(index)` _(instance method)_
Using the `dataModel.setIndex([...])` method, rather than assigning directly to `dataModel.index`, will dispatch the pre- and post-index data events back to the applicaiton (see [_Event strings_](#event-strings) below).
`dataModel.buildIndex` and `dataModel.sort` both call `dataModel.setIndex`.
Calling without an argument is the same as calling `dataModel.clearIndex`.

#### `dataModel.clearIndex()` _(instance method)_
Undefines the `index` (by calling `setIndex(undefined)`).

#### `dataModel.buildIndex(predicate)` _(instance method)_

Builds a new index and calls `dataModel.setIndex` on it:
```js
dataModel.buildIndex(predicate);
```
where `predicate` returns truthy for desired rows, for example:
```js
function predicate(y) {
    return this.getValue(1, y) === 'M'; // rows where second column is 'M'
}
```
Calling without a predicate is the same as calling `dataModel.clearIndex()`.

#### `DatasaurIndexed.valOrFunc` _(static method)_
Note that the above example predicate would fail on a computed cell or column.
To properly handle such data, you can use `DatasaurIndexed.valOrFunc` instead of calling `this.getValue`:
```js
function predicate(y) {
    return DatasaurIndexed.valOrFunc(this.getRow(y), 'gender', this.schema.gender.calculator)  === 'M'; // rows where second column is 'M'
}
```


### Event strings
The event string definitions have the following defaults:
```js
DatasaurIndexed.preindexEventString = 'fin-hypergrid-data-prereindex';
DatasaurIndexed.postindexEventString = 'fin-hypergrid-data-postreindex';
```

### Generalized sorting

For generalized single-column sorting, use [`datasaur-simple-sort`](https://github.com/fin-hypergrid/datasaur-simple-sort), which sits on top of `datasaur-indexed`:
```js
var Sorter = require('datasaur-simple-sort');
var dataModel = new Sorter(new Indexer(new Source));
dataModel.sort(0); // alpha ascending by first column
```
As noted in `datasaur-simple-sort`'s README, it fails on computed cells and columns.

Sorting by multiple columns, each of which may be ascending or descending, is somewhat more complicated,
essentially involving dynamically adding a `Sorter` stage for each column to be sorted.
See [`datasaur-filter`](simple-sort) which does something like that,
but forces `Array.prototype.sort` to do a [stable sort](https://en.wikipedia.org/wiki/Category:Stable_sorts)
(which is is not naturally inclined to do), and properly handles computed cells and columns.
_Note: As of this writing `datasaur-filter` has not yet been updated to v3.0.0._
