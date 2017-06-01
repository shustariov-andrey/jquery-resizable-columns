/**
 * jquery-resizable-columns - Resizable table columns for jQuery
 * @date Thu Jun 01 2017 16:37:39 GMT+0300 (FLE Daylight Time)
 * @version v0.2.3
 * @link http://dobtco.github.io/jquery-resizable-columns/
 * @license MIT
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _constants = require('./constants');

$.fn.resizableColumns = function (optionsOrMethod) {
	for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
		args[_key - 1] = arguments[_key];
	}

	return this.each(function () {
		var $table = $(this);

		var api = $table.data(_constants.DATA_API);
		if (!api) {
			api = new _class2['default']($table, optionsOrMethod);
			$table.data(_constants.DATA_API, api);
		} else if (typeof optionsOrMethod === 'string') {
			var _api;

			return (_api = api)[optionsOrMethod].apply(_api, args);
		}
	});
};

$.resizableColumns = _class2['default'];

},{"./class":2,"./constants":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _constants = require('./constants');

/**
Takes a <table /> element and makes it's columns resizable across both
mobile and desktop clients.

@class ResizableColumns
@param $table {jQuery} jQuery-wrapped <table> element to make resizable
@param options {Object} Configuration object
**/

var ResizableColumns = (function () {
	function ResizableColumns($table, options) {
		_classCallCheck(this, ResizableColumns);

		this.ns = '.rc' + this.count++;

		this.options = $.extend({}, ResizableColumns.defaults, options);

		this.$window = $(window);
		this.$ownerDocument = $($table[0].ownerDocument);
		this.$table = $table;

		this.refreshHeaders();
		this.restoreColumnWidths();
		this.syncHandleWidths();

		this.bindEvents(this.$window, 'resize', this.syncHandleWidths.bind(this));

		if (this.options.start) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_START, this.options.start);
		}
		if (this.options.resize) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE, this.options.resize);
		}
		if (this.options.stop) {
			this.bindEvents(this.$table, _constants.EVENT_RESIZE_STOP, this.options.stop);
		}
	}

	/**
 Refreshes the headers associated with this instances <table/> element and
 generates handles for them. Also assigns percentage widths.
 
 @method refreshHeaders
 **/

	_createClass(ResizableColumns, [{
		key: 'refreshHeaders',
		value: function refreshHeaders() {
			// Allow the selector to be both a regular selctor string as well as
			// a dynamic callback
			var selector = this.options.selector;
			if (typeof selector === 'function') {
				selector = selector.call(this, this.$table);
			}

			// Select all table headers
			this.$tableHeaders = this.$table.find(selector);

			// Assign percentage widths first, then create drag handles
			this.assignPercentageWidths();
			this.createHandles();
		}

		/**
  Creates dummy handle elements for all table header columns
  
  @method createHandles
  **/
	}, {
		key: 'createHandles',
		value: function createHandles() {
			var _this = this;

			var ref = this.$handleContainer;
			if (ref != null) {
				ref.remove();
			}

			this.$handleContainer = $('<div class=\'' + _constants.CLASS_HANDLE_CONTAINER + '\' />');
			this.$table.before(this.$handleContainer);

			this.$tableHeaders.each(function (i, el) {
				var $current = _this.$tableHeaders.eq(i);
				var $next = _this.$tableHeaders.eq(i + 1);

				if ($next.length === 0 || $current.is(_constants.SELECTOR_UNRESIZABLE) || $next.is(_constants.SELECTOR_UNRESIZABLE)) {
					return;
				}

				var $handle = $('<div class=\'' + _constants.CLASS_HANDLE + '\' />').data(_constants.DATA_TH, $(el)).appendTo(_this.$handleContainer);
			});

			this.bindEvents(this.$handleContainer, ['mousedown', 'touchstart'], '.' + _constants.CLASS_HANDLE, this.onPointerDown.bind(this));
		}

		/**
  Assigns a percentage width to all columns based on their current pixel width(s)
  
  @method assignPercentageWidths
  **/
	}, {
		key: 'assignPercentageWidths',
		value: function assignPercentageWidths() {
			var _this2 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);
				_this2.setWidth($el[0], $el.outerWidth() / _this2.$table.width() * 100);
			});
		}

		/**
  
  
  @method syncHandleWidths
  **/
	}, {
		key: 'syncHandleWidths',
		value: function syncHandleWidths() {
			var _this3 = this;

			var $container = this.$handleContainer;

			$container.width(this.$table.width());

			$container.find('.' + _constants.CLASS_HANDLE).each(function (_, el) {
				var $el = $(el);

				var height = _this3.options.resizeFromBody ? _this3.$table.height() : _this3.$table.find('thead').height();

				var left = $el.data(_constants.DATA_TH).outerWidth() + ($el.data(_constants.DATA_TH).offset().left - _this3.$handleContainer.offset().left);

				$el.css({ left: left, height: height });
			});
		}

		/**
  Persists the column widths in localStorage
  
  @method saveColumnWidths
  **/
	}, {
		key: 'saveColumnWidths',
		value: function saveColumnWidths() {
			var _this4 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this4.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					_this4.options.store.set(_this4.generateColumnId($el), _this4.parseWidth(el));
				}
			});
		}

		/**
  Retrieves and sets the column widths from localStorage
  
  @method restoreColumnWidths
  **/
	}, {
		key: 'restoreColumnWidths',
		value: function restoreColumnWidths() {
			var _this5 = this;

			this.$tableHeaders.each(function (_, el) {
				var $el = $(el);

				if (_this5.options.store && !$el.is(_constants.SELECTOR_UNRESIZABLE)) {
					var width = _this5.options.store.get(_this5.generateColumnId($el));

					if (width != null) {
						_this5.setWidth(el, width);
					}
				}
			});
		}

		/**
  Pointer/mouse down handler
  
  @method onPointerDown
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerDown',
		value: function onPointerDown(event) {

			// If a previous operation is defined, we missed the last mouseup.
			// Probably gobbled up by user mousing out the window then releasing.
			// We'll simulate a pointerup here prior to it
			if (this.operation) {
				this.onPointerUp(event);
			}

			// Ignore non-resizable columns
			var $currentGrip = $(event.currentTarget);
			if ($currentGrip.is(_constants.SELECTOR_UNRESIZABLE)) {
				return;
			}

			var gripIndex = $currentGrip.index();
			var $leftColumn = this.$tableHeaders.eq(gripIndex).not(_constants.SELECTOR_UNRESIZABLE);
			var $rightColumn = this.$tableHeaders.eq(gripIndex + 1).not(_constants.SELECTOR_UNRESIZABLE);

			var leftWidth = this.parseWidth($leftColumn[0]);
			var rightWidth = this.parseWidth($rightColumn[0]);

			this.operation = {
				$leftColumn: $leftColumn, $rightColumn: $rightColumn, $currentGrip: $currentGrip,

				startX: this.getPointerX(event),

				widths: {
					left: leftWidth,
					right: rightWidth
				},
				newWidths: {
					left: leftWidth,
					right: rightWidth
				}
			};

			this.bindEvents(this.$ownerDocument, ['mousemove', 'touchmove'], this.onPointerMove.bind(this));
			this.bindEvents(this.$ownerDocument, ['mouseup', 'touchend'], this.onPointerUp.bind(this));

			this.$handleContainer.add(this.$table).addClass(_constants.CLASS_TABLE_RESIZING);

			$leftColumn.add($rightColumn).add($currentGrip).addClass(_constants.CLASS_COLUMN_RESIZING);

			this.triggerEvent(_constants.EVENT_RESIZE_START, [$leftColumn, $rightColumn, leftWidth, rightWidth], event);

			event.preventDefault();
		}

		/**
  Pointer/mouse movement handler
  
  @method onPointerMove
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerMove',
		value: function onPointerMove(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			// Determine the delta change between start and new mouse position, as a percentage of the table width
			var difference = (this.getPointerX(event) - op.startX) / this.$table.width() * 100;
			if (difference === 0) {
				return;
			}

			var leftColumn = op.$leftColumn[0];
			var rightColumn = op.$rightColumn[0];
			var widthLeft = undefined,
			    widthRight = undefined;

			if (difference > 0) {
				widthLeft = this.constrainWidth(op.widths.left + (op.widths.right - op.newWidths.right));
				widthRight = this.constrainWidth(op.widths.right - difference);
			} else if (difference < 0) {
				widthLeft = this.constrainWidth(op.widths.left + difference);
				widthRight = this.constrainWidth(op.widths.right + (op.widths.left - op.newWidths.left));
			}

			if (leftColumn) {
				this.setWidth(leftColumn, widthLeft);
			}
			if (rightColumn) {
				this.setWidth(rightColumn, widthRight);
			}

			op.newWidths.left = widthLeft;
			op.newWidths.right = widthRight;

			return this.triggerEvent(_constants.EVENT_RESIZE, [op.$leftColumn, op.$rightColumn, widthLeft, widthRight], event);
		}

		/**
  Pointer/mouse release handler
  
  @method onPointerUp
  @param event {Object} Event object associated with the interaction
  **/
	}, {
		key: 'onPointerUp',
		value: function onPointerUp(event) {
			var op = this.operation;
			if (!this.operation) {
				return;
			}

			this.unbindEvents(this.$ownerDocument, ['mouseup', 'touchend', 'mousemove', 'touchmove']);

			this.$handleContainer.add(this.$table).removeClass(_constants.CLASS_TABLE_RESIZING);

			op.$leftColumn.add(op.$rightColumn).add(op.$currentGrip).removeClass(_constants.CLASS_COLUMN_RESIZING);

			this.syncHandleWidths();
			this.saveColumnWidths();

			this.operation = null;

			return this.triggerEvent(_constants.EVENT_RESIZE_STOP, [op.$leftColumn, op.$rightColumn, op.newWidths.left, op.newWidths.right], event);
		}

		/**
  Removes all event listeners, data, and added DOM elements. Takes
  the <table/> element back to how it was, and returns it
  
  @method destroy
  @return {jQuery} Original jQuery-wrapped <table> element
  **/
	}, {
		key: 'destroy',
		value: function destroy() {
			var $table = this.$table;
			var $handles = this.$handleContainer.find('.' + _constants.CLASS_HANDLE);

			this.unbindEvents(this.$window.add(this.$ownerDocument).add(this.$table).add($handles));

			$handles.removeData(_constants.DATA_TH);
			$table.removeData(_constants.DATA_API);

			this.$handleContainer.remove();
			this.$handleContainer = null;
			this.$tableHeaders = null;
			this.$table = null;

			return $table;
		}

		/**
  Binds given events for this instance to the given target DOMElement
  
  @private
  @method bindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to bind events to
  @param events {String|Array} Event name (or array of) to bind
  @param selectorOrCallback {String|Function} Selector string or callback
  @param [callback] {Function} Callback method
  **/
	}, {
		key: 'bindEvents',
		value: function bindEvents($target, events, selectorOrCallback, callback) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else {
				events = events.join(this.ns + ' ') + this.ns;
			}

			if (arguments.length > 3) {
				$target.on(events, selectorOrCallback, callback);
			} else {
				$target.on(events, selectorOrCallback);
			}
		}

		/**
  Unbinds events specific to this instance from the given target DOMElement
  
  @private
  @method unbindEvents
  @param target {jQuery} jQuery-wrapped DOMElement to unbind events from
  @param events {String|Array} Event name (or array of) to unbind
  **/
	}, {
		key: 'unbindEvents',
		value: function unbindEvents($target, events) {
			if (typeof events === 'string') {
				events = events + this.ns;
			} else if (events != null) {
				events = events.join(this.ns + ' ') + this.ns;
			} else {
				events = this.ns;
			}

			$target.off(events);
		}

		/**
  Triggers an event on the <table/> element for a given type with given
  arguments, also setting and allowing access to the originalEvent if
  given. Returns the result of the triggered event.
  
  @private
  @method triggerEvent
  @param type {String} Event name
  @param args {Array} Array of arguments to pass through
  @param [originalEvent] If given, is set on the event object
  @return {Mixed} Result of the event trigger action
  **/
	}, {
		key: 'triggerEvent',
		value: function triggerEvent(type, args, originalEvent) {
			var event = $.Event(type);
			if (event.originalEvent) {
				event.originalEvent = $.extend({}, originalEvent);
			}

			return this.$table.trigger(event, [this].concat(args || []));
		}

		/**
  Calculates a unique column ID for a given column DOMElement
  
  @private
  @method generateColumnId
  @param $el {jQuery} jQuery-wrapped column element
  @return {String} Column ID
  **/
	}, {
		key: 'generateColumnId',
		value: function generateColumnId($el) {
			return this.$table.data(_constants.DATA_COLUMNS_ID) + '-' + $el.data(_constants.DATA_COLUMN_ID);
		}

		/**
  Parses a given DOMElement's width into a float
  
  @private
  @method parseWidth
  @param element {DOMElement} Element to get width of
  @return {Number} Element's width as a float
  **/
	}, {
		key: 'parseWidth',
		value: function parseWidth(element) {
			return element ? parseFloat(element.style.width.replace('%', '')) : 0;
		}

		/**
  Sets the percentage width of a given DOMElement
  
  @private
  @method setWidth
  @param element {DOMElement} Element to set width on
  @param width {Number} Width, as a percentage, to set
  **/
	}, {
		key: 'setWidth',
		value: function setWidth(element, width) {
			width = width.toFixed(2);
			width = width > 0 ? width : 0;
			element.style.width = width + '%';
		}

		/**
  Constrains a given width to the minimum and maximum ranges defined in
  the `minWidth` and `maxWidth` configuration options, respectively.
  
  @private
  @method constrainWidth
  @param width {Number} Width to constrain
  @return {Number} Constrained width
  **/
	}, {
		key: 'constrainWidth',
		value: function constrainWidth(width) {
			if (this.options.minWidth != undefined) {
				width = Math.max(this.options.minWidth, width);
			}

			if (this.options.maxWidth != undefined) {
				width = Math.min(this.options.maxWidth, width);
			}

			return width;
		}

		/**
  Given a particular Event object, retrieves the current pointer offset along
  the horizontal direction. Accounts for both regular mouse clicks as well as
  pointer-like systems (mobiles, tablets etc.)
  
  @private
  @method getPointerX
  @param event {Object} Event object associated with the interaction
  @return {Number} Horizontal pointer offset
  **/
	}, {
		key: 'getPointerX',
		value: function getPointerX(event) {
			if (event.type.indexOf('touch') === 0) {
				return (event.originalEvent.touches[0] || event.originalEvent.changedTouches[0]).pageX;
			}
			return event.pageX;
		}
	}]);

	return ResizableColumns;
})();

exports['default'] = ResizableColumns;

ResizableColumns.defaults = {
	selector: function selector($table) {
		if ($table.find('thead').length) {
			return _constants.SELECTOR_TH;
		}

		return _constants.SELECTOR_TD;
	},
	store: window.store,
	syncHandlers: true,
	resizeFromBody: true,
	maxWidth: null,
	minWidth: 0.01
};

ResizableColumns.count = 0;
module.exports = exports['default'];

},{"./constants":3}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
var DATA_API = 'resizableColumns';
exports.DATA_API = DATA_API;
var DATA_COLUMNS_ID = 'resizable-columns-id';
exports.DATA_COLUMNS_ID = DATA_COLUMNS_ID;
var DATA_COLUMN_ID = 'resizable-column-id';
exports.DATA_COLUMN_ID = DATA_COLUMN_ID;
var DATA_TH = 'th';

exports.DATA_TH = DATA_TH;
var CLASS_TABLE_RESIZING = 'rc-table-resizing';
exports.CLASS_TABLE_RESIZING = CLASS_TABLE_RESIZING;
var CLASS_COLUMN_RESIZING = 'rc-column-resizing';
exports.CLASS_COLUMN_RESIZING = CLASS_COLUMN_RESIZING;
var CLASS_HANDLE = 'rc-handle';
exports.CLASS_HANDLE = CLASS_HANDLE;
var CLASS_HANDLE_CONTAINER = 'rc-handle-container';

exports.CLASS_HANDLE_CONTAINER = CLASS_HANDLE_CONTAINER;
var EVENT_RESIZE_START = 'column:resize:start';
exports.EVENT_RESIZE_START = EVENT_RESIZE_START;
var EVENT_RESIZE = 'column:resize';
exports.EVENT_RESIZE = EVENT_RESIZE;
var EVENT_RESIZE_STOP = 'column:resize:stop';

exports.EVENT_RESIZE_STOP = EVENT_RESIZE_STOP;
var SELECTOR_TH = 'tr:first > th:visible';
exports.SELECTOR_TH = SELECTOR_TH;
var SELECTOR_TD = 'tr:first > td:visible';
exports.SELECTOR_TD = SELECTOR_TD;
var SELECTOR_UNRESIZABLE = '[data-noresize]';
exports.SELECTOR_UNRESIZABLE = SELECTOR_UNRESIZABLE;

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _class = require('./class');

var _class2 = _interopRequireDefault(_class);

var _adapter = require('./adapter');

var _adapter2 = _interopRequireDefault(_adapter);

exports['default'] = _class2['default'];
module.exports = exports['default'];

},{"./adapter":1,"./class":2}]},{},[4])

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYWRhcHRlci5qcyIsInNyYy9jbGFzcy5qcyIsInNyYy9jb25zdGFudHMuanMiLCJzcmMvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7O3FCQ0E2QixTQUFTOzs7O3lCQUNmLGFBQWE7O0FBRXBDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0JBQWdCLEdBQUcsVUFBUyxlQUFlLEVBQVc7bUNBQU4sSUFBSTtBQUFKLE1BQUk7OztBQUN4RCxRQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBVztBQUMzQixNQUFJLE1BQU0sR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRXJCLE1BQUksR0FBRyxHQUFHLE1BQU0sQ0FBQyxJQUFJLHFCQUFVLENBQUM7QUFDaEMsTUFBSSxDQUFDLEdBQUcsRUFBRTtBQUNULE1BQUcsR0FBRyx1QkFBcUIsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQ3BELFNBQU0sQ0FBQyxJQUFJLHNCQUFXLEdBQUcsQ0FBQyxDQUFDO0dBQzNCLE1BRUksSUFBSSxPQUFPLGVBQWUsS0FBSyxRQUFRLEVBQUU7OztBQUM3QyxVQUFPLFFBQUEsR0FBRyxFQUFDLGVBQWUsT0FBQyxPQUFJLElBQUksQ0FBQyxDQUFDO0dBQ3JDO0VBQ0QsQ0FBQyxDQUFDO0NBQ0gsQ0FBQzs7QUFFRixDQUFDLENBQUMsZ0JBQWdCLHFCQUFtQixDQUFDOzs7Ozs7Ozs7Ozs7O3lCQ0hqQyxhQUFhOzs7Ozs7Ozs7OztJQVVHLGdCQUFnQjtBQUN6QixVQURTLGdCQUFnQixDQUN4QixNQUFNLEVBQUUsT0FBTyxFQUFFO3dCQURULGdCQUFnQjs7QUFFbkMsTUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDOztBQUUvQixNQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLGdC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QU0sRUFBRTtBQUMxQixNQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxFQUFFO0FBQy9CLGlDQUFtQjtHQUNuQjs7QUFFRCxnQ0FBbUI7RUFDbkI7QUFDRCxNQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUs7QUFDbkIsYUFBWSxFQUFFLElBQUk7QUFDbEIsZUFBYyxFQUFFLElBQUk7QUFDcEIsU0FBUSxFQUFFLElBQUk7QUFDZCxTQUFRLEVBQUUsSUFBSTtDQUNkLENBQUM7O0FBRUYsZ0JBQWdCLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQzs7Ozs7Ozs7O0FDbGdCcEIsSUFBTSxRQUFRLEdBQUcsa0JBQWtCLENBQUM7O0FBQ3BDLElBQU0sZUFBZSxHQUFHLHNCQUFzQixDQUFDOztBQUMvQyxJQUFNLGNBQWMsR0FBRyxxQkFBcUIsQ0FBQzs7QUFDN0MsSUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDOzs7QUFFckIsSUFBTSxvQkFBb0IsR0FBRyxtQkFBbUIsQ0FBQzs7QUFDakQsSUFBTSxxQkFBcUIsR0FBRyxvQkFBb0IsQ0FBQzs7QUFDbkQsSUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDOztBQUNqQyxJQUFNLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDOzs7QUFFckQsSUFBTSxrQkFBa0IsR0FBRyxxQkFBcUIsQ0FBQzs7QUFDakQsSUFBTSxZQUFZLEdBQUcsZUFBZSxDQUFDOztBQUNyQyxJQUFNLGlCQUFpQixHQUFHLG9CQUFvQixDQUFDOzs7QUFFL0MsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7O0FBQzVDLElBQU0sV0FBVyxHQUFHLHVCQUF1QixDQUFDOztBQUM1QyxJQUFNLG9CQUFvQixvQkFBb0IsQ0FBQzs7Ozs7Ozs7Ozs7O3FCQ2hCekIsU0FBUzs7Ozt1QkFDbEIsV0FBVyIsImZpbGUiOiJqcXVlcnkucmVzaXphYmxlQ29sdW1ucy5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IFJlc2l6YWJsZUNvbHVtbnMgZnJvbSAnLi9jbGFzcyc7XHJcbmltcG9ydCB7REFUQV9BUEl9IGZyb20gJy4vY29uc3RhbnRzJztcclxuXHJcbiQuZm4ucmVzaXphYmxlQ29sdW1ucyA9IGZ1bmN0aW9uKG9wdGlvbnNPck1ldGhvZCwgLi4uYXJncykge1xyXG5cdHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRsZXQgJHRhYmxlID0gJCh0aGlzKTtcclxuXHJcblx0XHRsZXQgYXBpID0gJHRhYmxlLmRhdGEoREFUQV9BUEkpO1xyXG5cdFx0aWYgKCFhcGkpIHtcclxuXHRcdFx0YXBpID0gbmV3IFJlc2l6YWJsZUNvbHVtbnMoJHRhYmxlLCBvcHRpb25zT3JNZXRob2QpO1xyXG5cdFx0XHQkdGFibGUuZGF0YShEQVRBX0FQSSwgYXBpKTtcclxuXHRcdH1cclxuXHJcblx0XHRlbHNlIGlmICh0eXBlb2Ygb3B0aW9uc09yTWV0aG9kID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRyZXR1cm4gYXBpW29wdGlvbnNPck1ldGhvZF0oLi4uYXJncyk7XHJcblx0XHR9XHJcblx0fSk7XHJcbn07XHJcblxyXG4kLnJlc2l6YWJsZUNvbHVtbnMgPSBSZXNpemFibGVDb2x1bW5zO1xyXG4iLCJpbXBvcnQge1xyXG5cdERBVEFfQVBJLFxyXG5cdERBVEFfQ09MVU1OU19JRCxcclxuXHREQVRBX0NPTFVNTl9JRCxcclxuXHREQVRBX1RILFxyXG5cdENMQVNTX1RBQkxFX1JFU0laSU5HLFxyXG5cdENMQVNTX0NPTFVNTl9SRVNJWklORyxcclxuXHRDTEFTU19IQU5ETEUsXHJcblx0Q0xBU1NfSEFORExFX0NPTlRBSU5FUixcclxuXHRFVkVOVF9SRVNJWkVfU1RBUlQsXHJcblx0RVZFTlRfUkVTSVpFLFxyXG5cdEVWRU5UX1JFU0laRV9TVE9QLFxyXG5cdFNFTEVDVE9SX1RILFxyXG5cdFNFTEVDVE9SX1RELFxyXG5cdFNFTEVDVE9SX1VOUkVTSVpBQkxFXHJcbn1cclxuZnJvbSAnLi9jb25zdGFudHMnO1xyXG5cclxuLyoqXHJcblRha2VzIGEgPHRhYmxlIC8+IGVsZW1lbnQgYW5kIG1ha2VzIGl0J3MgY29sdW1ucyByZXNpemFibGUgYWNyb3NzIGJvdGhcclxubW9iaWxlIGFuZCBkZXNrdG9wIGNsaWVudHMuXHJcblxyXG5AY2xhc3MgUmVzaXphYmxlQ29sdW1uc1xyXG5AcGFyYW0gJHRhYmxlIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudCB0byBtYWtlIHJlc2l6YWJsZVxyXG5AcGFyYW0gb3B0aW9ucyB7T2JqZWN0fSBDb25maWd1cmF0aW9uIG9iamVjdFxyXG4qKi9cclxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVzaXphYmxlQ29sdW1ucyB7XHJcblx0Y29uc3RydWN0b3IoJHRhYmxlLCBvcHRpb25zKSB7XHJcblx0XHR0aGlzLm5zID0gJy5yYycgKyB0aGlzLmNvdW50Kys7XHJcblxyXG5cdFx0dGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMsIG9wdGlvbnMpO1xyXG5cclxuXHRcdHRoaXMuJHdpbmRvdyA9ICQod2luZG93KTtcclxuXHRcdHRoaXMuJG93bmVyRG9jdW1lbnQgPSAkKCR0YWJsZVswXS5vd25lckRvY3VtZW50KTtcclxuXHRcdHRoaXMuJHRhYmxlID0gJHRhYmxlO1xyXG5cclxuXHRcdHRoaXMucmVmcmVzaEhlYWRlcnMoKTtcclxuXHRcdHRoaXMucmVzdG9yZUNvbHVtbldpZHRocygpO1xyXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XHJcblxyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHdpbmRvdywgJ3Jlc2l6ZScsIHRoaXMuc3luY0hhbmRsZVdpZHRocy5iaW5kKHRoaXMpKTtcclxuXHJcblx0XHRpZiAodGhpcy5vcHRpb25zLnN0YXJ0KSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUQVJULCB0aGlzLm9wdGlvbnMuc3RhcnQpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5yZXNpemUpIHtcclxuXHRcdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJHRhYmxlLCBFVkVOVF9SRVNJWkUsIHRoaXMub3B0aW9ucy5yZXNpemUpO1xyXG5cdFx0fVxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9wKSB7XHJcblx0XHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiR0YWJsZSwgRVZFTlRfUkVTSVpFX1NUT1AsIHRoaXMub3B0aW9ucy5zdG9wKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJlZnJlc2hlcyB0aGUgaGVhZGVycyBhc3NvY2lhdGVkIHdpdGggdGhpcyBpbnN0YW5jZXMgPHRhYmxlLz4gZWxlbWVudCBhbmRcclxuXHRnZW5lcmF0ZXMgaGFuZGxlcyBmb3IgdGhlbS4gQWxzbyBhc3NpZ25zIHBlcmNlbnRhZ2Ugd2lkdGhzLlxyXG5cclxuXHRAbWV0aG9kIHJlZnJlc2hIZWFkZXJzXHJcblx0KiovXHJcblx0cmVmcmVzaEhlYWRlcnMoKSB7XHJcblx0XHQvLyBBbGxvdyB0aGUgc2VsZWN0b3IgdG8gYmUgYm90aCBhIHJlZ3VsYXIgc2VsY3RvciBzdHJpbmcgYXMgd2VsbCBhc1xyXG5cdFx0Ly8gYSBkeW5hbWljIGNhbGxiYWNrXHJcblx0XHRsZXQgc2VsZWN0b3IgPSB0aGlzLm9wdGlvbnMuc2VsZWN0b3I7XHJcblx0XHRpZih0eXBlb2Ygc2VsZWN0b3IgPT09ICdmdW5jdGlvbicpIHtcclxuXHRcdFx0c2VsZWN0b3IgPSBzZWxlY3Rvci5jYWxsKHRoaXMsIHRoaXMuJHRhYmxlKTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBTZWxlY3QgYWxsIHRhYmxlIGhlYWRlcnNcclxuXHRcdHRoaXMuJHRhYmxlSGVhZGVycyA9IHRoaXMuJHRhYmxlLmZpbmQoc2VsZWN0b3IpO1xyXG5cclxuXHRcdC8vIEFzc2lnbiBwZXJjZW50YWdlIHdpZHRocyBmaXJzdCwgdGhlbiBjcmVhdGUgZHJhZyBoYW5kbGVzXHJcblx0XHR0aGlzLmFzc2lnblBlcmNlbnRhZ2VXaWR0aHMoKTtcclxuXHRcdHRoaXMuY3JlYXRlSGFuZGxlcygpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q3JlYXRlcyBkdW1teSBoYW5kbGUgZWxlbWVudHMgZm9yIGFsbCB0YWJsZSBoZWFkZXIgY29sdW1uc1xyXG5cclxuXHRAbWV0aG9kIGNyZWF0ZUhhbmRsZXNcclxuXHQqKi9cclxuXHRjcmVhdGVIYW5kbGVzKCkge1xyXG5cdFx0bGV0IHJlZiA9IHRoaXMuJGhhbmRsZUNvbnRhaW5lcjtcclxuXHRcdGlmIChyZWYgIT0gbnVsbCkge1xyXG5cdFx0XHRyZWYucmVtb3ZlKCk7XHJcblx0XHR9XHJcblxyXG5cdFx0dGhpcy4kaGFuZGxlQ29udGFpbmVyID0gJChgPGRpdiBjbGFzcz0nJHtDTEFTU19IQU5ETEVfQ09OVEFJTkVSfScgLz5gKVxyXG5cdFx0dGhpcy4kdGFibGUuYmVmb3JlKHRoaXMuJGhhbmRsZUNvbnRhaW5lcik7XHJcblxyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKGksIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkY3VycmVudCA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShpKTtcclxuXHRcdFx0bGV0ICRuZXh0ID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGkgKyAxKTtcclxuXHJcblx0XHRcdGlmICgkbmV4dC5sZW5ndGggPT09IDAgfHwgJGN1cnJlbnQuaXMoU0VMRUNUT1JfVU5SRVNJWkFCTEUpIHx8ICRuZXh0LmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdHJldHVybjtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0bGV0ICRoYW5kbGUgPSAkKGA8ZGl2IGNsYXNzPScke0NMQVNTX0hBTkRMRX0nIC8+YClcclxuXHRcdFx0XHQuZGF0YShEQVRBX1RILCAkKGVsKSlcclxuXHRcdFx0XHQuYXBwZW5kVG8odGhpcy4kaGFuZGxlQ29udGFpbmVyKTtcclxuXHRcdH0pO1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRoYW5kbGVDb250YWluZXIsIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXSwgJy4nK0NMQVNTX0hBTkRMRSwgdGhpcy5vblBvaW50ZXJEb3duLmJpbmQodGhpcykpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QXNzaWducyBhIHBlcmNlbnRhZ2Ugd2lkdGggdG8gYWxsIGNvbHVtbnMgYmFzZWQgb24gdGhlaXIgY3VycmVudCBwaXhlbCB3aWR0aChzKVxyXG5cclxuXHRAbWV0aG9kIGFzc2lnblBlcmNlbnRhZ2VXaWR0aHNcclxuXHQqKi9cclxuXHRhc3NpZ25QZXJjZW50YWdlV2lkdGhzKCkge1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHRcdFx0dGhpcy5zZXRXaWR0aCgkZWxbMF0sICRlbC5vdXRlcldpZHRoKCkgLyB0aGlzLiR0YWJsZS53aWR0aCgpICogMTAwKTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblxyXG5cclxuXHRAbWV0aG9kIHN5bmNIYW5kbGVXaWR0aHNcclxuXHQqKi9cclxuXHRzeW5jSGFuZGxlV2lkdGhzKCkge1xyXG5cdFx0bGV0ICRjb250YWluZXIgPSB0aGlzLiRoYW5kbGVDb250YWluZXJcclxuXHJcblx0XHQkY29udGFpbmVyLndpZHRoKHRoaXMuJHRhYmxlLndpZHRoKCkpO1xyXG5cclxuXHRcdCRjb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKS5lYWNoKChfLCBlbCkgPT4ge1xyXG5cdFx0XHRsZXQgJGVsID0gJChlbCk7XHJcblxyXG5cdFx0XHRsZXQgaGVpZ2h0ID0gdGhpcy5vcHRpb25zLnJlc2l6ZUZyb21Cb2R5ID9cclxuXHRcdFx0XHR0aGlzLiR0YWJsZS5oZWlnaHQoKSA6XHJcblx0XHRcdFx0dGhpcy4kdGFibGUuZmluZCgndGhlYWQnKS5oZWlnaHQoKTtcclxuXHJcblx0XHRcdGxldCBsZWZ0ID0gJGVsLmRhdGEoREFUQV9USCkub3V0ZXJXaWR0aCgpICsgKFxyXG5cdFx0XHRcdCRlbC5kYXRhKERBVEFfVEgpLm9mZnNldCgpLmxlZnQgLSB0aGlzLiRoYW5kbGVDb250YWluZXIub2Zmc2V0KCkubGVmdFxyXG5cdFx0XHQpO1xyXG5cclxuXHRcdFx0JGVsLmNzcyh7IGxlZnQsIGhlaWdodCB9KTtcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UGVyc2lzdHMgdGhlIGNvbHVtbiB3aWR0aHMgaW4gbG9jYWxTdG9yYWdlXHJcblxyXG5cdEBtZXRob2Qgc2F2ZUNvbHVtbldpZHRoc1xyXG5cdCoqL1xyXG5cdHNhdmVDb2x1bW5XaWR0aHMoKSB7XHJcblx0XHR0aGlzLiR0YWJsZUhlYWRlcnMuZWFjaCgoXywgZWwpID0+IHtcclxuXHRcdFx0bGV0ICRlbCA9ICQoZWwpO1xyXG5cclxuXHRcdFx0aWYgKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdHRoaXMub3B0aW9ucy5zdG9yZS5zZXQoXHJcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKSxcclxuXHRcdFx0XHRcdHRoaXMucGFyc2VXaWR0aChlbClcclxuXHRcdFx0XHQpO1xyXG5cdFx0XHR9XHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFJldHJpZXZlcyBhbmQgc2V0cyB0aGUgY29sdW1uIHdpZHRocyBmcm9tIGxvY2FsU3RvcmFnZVxyXG5cclxuXHRAbWV0aG9kIHJlc3RvcmVDb2x1bW5XaWR0aHNcclxuXHQqKi9cclxuXHRyZXN0b3JlQ29sdW1uV2lkdGhzKCkge1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzLmVhY2goKF8sIGVsKSA9PiB7XHJcblx0XHRcdGxldCAkZWwgPSAkKGVsKTtcclxuXHJcblx0XHRcdGlmKHRoaXMub3B0aW9ucy5zdG9yZSAmJiAhJGVsLmlzKFNFTEVDVE9SX1VOUkVTSVpBQkxFKSkge1xyXG5cdFx0XHRcdGxldCB3aWR0aCA9IHRoaXMub3B0aW9ucy5zdG9yZS5nZXQoXHJcblx0XHRcdFx0XHR0aGlzLmdlbmVyYXRlQ29sdW1uSWQoJGVsKVxyXG5cdFx0XHRcdCk7XHJcblxyXG5cdFx0XHRcdGlmKHdpZHRoICE9IG51bGwpIHtcclxuXHRcdFx0XHRcdHRoaXMuc2V0V2lkdGgoZWwsIHdpZHRoKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBkb3duIGhhbmRsZXJcclxuXHJcblx0QG1ldGhvZCBvblBvaW50ZXJEb3duXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyRG93bihldmVudCkge1xyXG5cclxuXHRcdC8vIElmIGEgcHJldmlvdXMgb3BlcmF0aW9uIGlzIGRlZmluZWQsIHdlIG1pc3NlZCB0aGUgbGFzdCBtb3VzZXVwLlxyXG5cdFx0Ly8gUHJvYmFibHkgZ29iYmxlZCB1cCBieSB1c2VyIG1vdXNpbmcgb3V0IHRoZSB3aW5kb3cgdGhlbiByZWxlYXNpbmcuXHJcblx0XHQvLyBXZSdsbCBzaW11bGF0ZSBhIHBvaW50ZXJ1cCBoZXJlIHByaW9yIHRvIGl0XHJcblx0XHRpZih0aGlzLm9wZXJhdGlvbikge1xyXG5cdFx0XHR0aGlzLm9uUG9pbnRlclVwKGV2ZW50KTtcclxuXHRcdH1cclxuXHJcblx0XHQvLyBJZ25vcmUgbm9uLXJlc2l6YWJsZSBjb2x1bW5zXHJcblx0XHRsZXQgJGN1cnJlbnRHcmlwID0gJChldmVudC5jdXJyZW50VGFyZ2V0KTtcclxuXHRcdGlmKCRjdXJyZW50R3JpcC5pcyhTRUxFQ1RPUl9VTlJFU0laQUJMRSkpIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBncmlwSW5kZXggPSAkY3VycmVudEdyaXAuaW5kZXgoKTtcclxuXHRcdGxldCAkbGVmdENvbHVtbiA9IHRoaXMuJHRhYmxlSGVhZGVycy5lcShncmlwSW5kZXgpLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSk7XHJcblx0XHRsZXQgJHJpZ2h0Q29sdW1uID0gdGhpcy4kdGFibGVIZWFkZXJzLmVxKGdyaXBJbmRleCArIDEpLm5vdChTRUxFQ1RPUl9VTlJFU0laQUJMRSk7XHJcblxyXG5cdFx0bGV0IGxlZnRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkbGVmdENvbHVtblswXSk7XHJcblx0XHRsZXQgcmlnaHRXaWR0aCA9IHRoaXMucGFyc2VXaWR0aCgkcmlnaHRDb2x1bW5bMF0pO1xyXG5cclxuXHRcdHRoaXMub3BlcmF0aW9uID0ge1xyXG5cdFx0XHQkbGVmdENvbHVtbiwgJHJpZ2h0Q29sdW1uLCAkY3VycmVudEdyaXAsXHJcblxyXG5cdFx0XHRzdGFydFg6IHRoaXMuZ2V0UG9pbnRlclgoZXZlbnQpLFxyXG5cclxuXHRcdFx0d2lkdGhzOiB7XHJcblx0XHRcdFx0bGVmdDogbGVmdFdpZHRoLFxyXG5cdFx0XHRcdHJpZ2h0OiByaWdodFdpZHRoXHJcblx0XHRcdH0sXHJcblx0XHRcdG5ld1dpZHRoczoge1xyXG5cdFx0XHRcdGxlZnQ6IGxlZnRXaWR0aCxcclxuXHRcdFx0XHRyaWdodDogcmlnaHRXaWR0aFxyXG5cdFx0XHR9XHJcblx0XHR9O1xyXG5cclxuXHRcdHRoaXMuYmluZEV2ZW50cyh0aGlzLiRvd25lckRvY3VtZW50LCBbJ21vdXNlbW92ZScsICd0b3VjaG1vdmUnXSwgdGhpcy5vblBvaW50ZXJNb3ZlLmJpbmQodGhpcykpO1xyXG5cdFx0dGhpcy5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCddLCB0aGlzLm9uUG9pbnRlclVwLmJpbmQodGhpcykpO1xyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHQuYWRkQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xyXG5cclxuXHRcdCRsZWZ0Q29sdW1uXHJcblx0XHRcdC5hZGQoJHJpZ2h0Q29sdW1uKVxyXG5cdFx0XHQuYWRkKCRjdXJyZW50R3JpcClcclxuXHRcdFx0LmFkZENsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XHJcblxyXG5cdFx0dGhpcy50cmlnZ2VyRXZlbnQoRVZFTlRfUkVTSVpFX1NUQVJULCBbXHJcblx0XHRcdCRsZWZ0Q29sdW1uLCAkcmlnaHRDb2x1bW4sXHJcblx0XHRcdGxlZnRXaWR0aCwgcmlnaHRXaWR0aFxyXG5cdFx0XSxcclxuXHRcdGV2ZW50KTtcclxuXHJcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0UG9pbnRlci9tb3VzZSBtb3ZlbWVudCBoYW5kbGVyXHJcblxyXG5cdEBtZXRob2Qgb25Qb2ludGVyTW92ZVxyXG5cdEBwYXJhbSBldmVudCB7T2JqZWN0fSBFdmVudCBvYmplY3QgYXNzb2NpYXRlZCB3aXRoIHRoZSBpbnRlcmFjdGlvblxyXG5cdCoqL1xyXG5cdG9uUG9pbnRlck1vdmUoZXZlbnQpIHtcclxuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xyXG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdC8vIERldGVybWluZSB0aGUgZGVsdGEgY2hhbmdlIGJldHdlZW4gc3RhcnQgYW5kIG5ldyBtb3VzZSBwb3NpdGlvbiwgYXMgYSBwZXJjZW50YWdlIG9mIHRoZSB0YWJsZSB3aWR0aFxyXG5cdFx0bGV0IGRpZmZlcmVuY2UgPSAodGhpcy5nZXRQb2ludGVyWChldmVudCkgLSBvcC5zdGFydFgpIC8gdGhpcy4kdGFibGUud2lkdGgoKSAqIDEwMDtcclxuXHRcdGlmKGRpZmZlcmVuY2UgPT09IDApIHtcclxuXHRcdFx0cmV0dXJuO1xyXG5cdFx0fVxyXG5cclxuXHRcdGxldCBsZWZ0Q29sdW1uID0gb3AuJGxlZnRDb2x1bW5bMF07XHJcblx0XHRsZXQgcmlnaHRDb2x1bW4gPSBvcC4kcmlnaHRDb2x1bW5bMF07XHJcblx0XHRsZXQgd2lkdGhMZWZ0LCB3aWR0aFJpZ2h0O1xyXG5cclxuXHRcdGlmKGRpZmZlcmVuY2UgPiAwKSB7XHJcblx0XHRcdHdpZHRoTGVmdCA9IHRoaXMuY29uc3RyYWluV2lkdGgob3Aud2lkdGhzLmxlZnQgKyAob3Aud2lkdGhzLnJpZ2h0IC0gb3AubmV3V2lkdGhzLnJpZ2h0KSk7XHJcblx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLndpZHRocy5yaWdodCAtIGRpZmZlcmVuY2UpO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihkaWZmZXJlbmNlIDwgMCkge1xyXG5cdFx0XHR3aWR0aExlZnQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLndpZHRocy5sZWZ0ICsgZGlmZmVyZW5jZSk7XHJcblx0XHRcdHdpZHRoUmlnaHQgPSB0aGlzLmNvbnN0cmFpbldpZHRoKG9wLndpZHRocy5yaWdodCArIChvcC53aWR0aHMubGVmdCAtIG9wLm5ld1dpZHRocy5sZWZ0KSk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYobGVmdENvbHVtbikge1xyXG5cdFx0XHR0aGlzLnNldFdpZHRoKGxlZnRDb2x1bW4sIHdpZHRoTGVmdCk7XHJcblx0XHR9XHJcblx0XHRpZihyaWdodENvbHVtbikge1xyXG5cdFx0XHR0aGlzLnNldFdpZHRoKHJpZ2h0Q29sdW1uLCB3aWR0aFJpZ2h0KTtcclxuXHRcdH1cclxuXHJcblx0XHRvcC5uZXdXaWR0aHMubGVmdCA9IHdpZHRoTGVmdDtcclxuXHRcdG9wLm5ld1dpZHRocy5yaWdodCA9IHdpZHRoUmlnaHQ7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRSwgW1xyXG5cdFx0XHRvcC4kbGVmdENvbHVtbiwgb3AuJHJpZ2h0Q29sdW1uLFxyXG5cdFx0XHR3aWR0aExlZnQsIHdpZHRoUmlnaHRcclxuXHRcdF0sXHJcblx0XHRldmVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRQb2ludGVyL21vdXNlIHJlbGVhc2UgaGFuZGxlclxyXG5cclxuXHRAbWV0aG9kIG9uUG9pbnRlclVwXHJcblx0QHBhcmFtIGV2ZW50IHtPYmplY3R9IEV2ZW50IG9iamVjdCBhc3NvY2lhdGVkIHdpdGggdGhlIGludGVyYWN0aW9uXHJcblx0KiovXHJcblx0b25Qb2ludGVyVXAoZXZlbnQpIHtcclxuXHRcdGxldCBvcCA9IHRoaXMub3BlcmF0aW9uO1xyXG5cdFx0aWYoIXRoaXMub3BlcmF0aW9uKSB7IHJldHVybjsgfVxyXG5cclxuXHRcdHRoaXMudW5iaW5kRXZlbnRzKHRoaXMuJG93bmVyRG9jdW1lbnQsIFsnbW91c2V1cCcsICd0b3VjaGVuZCcsICdtb3VzZW1vdmUnLCAndG91Y2htb3ZlJ10pO1xyXG5cclxuXHRcdHRoaXMuJGhhbmRsZUNvbnRhaW5lclxyXG5cdFx0XHQuYWRkKHRoaXMuJHRhYmxlKVxyXG5cdFx0XHQucmVtb3ZlQ2xhc3MoQ0xBU1NfVEFCTEVfUkVTSVpJTkcpO1xyXG5cclxuXHRcdG9wLiRsZWZ0Q29sdW1uXHJcblx0XHRcdC5hZGQob3AuJHJpZ2h0Q29sdW1uKVxyXG5cdFx0XHQuYWRkKG9wLiRjdXJyZW50R3JpcClcclxuXHRcdFx0LnJlbW92ZUNsYXNzKENMQVNTX0NPTFVNTl9SRVNJWklORyk7XHJcblxyXG5cdFx0dGhpcy5zeW5jSGFuZGxlV2lkdGhzKCk7XHJcblx0XHR0aGlzLnNhdmVDb2x1bW5XaWR0aHMoKTtcclxuXHJcblx0XHR0aGlzLm9wZXJhdGlvbiA9IG51bGw7XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMudHJpZ2dlckV2ZW50KEVWRU5UX1JFU0laRV9TVE9QLCBbXHJcblx0XHRcdG9wLiRsZWZ0Q29sdW1uLCBvcC4kcmlnaHRDb2x1bW4sXHJcblx0XHRcdG9wLm5ld1dpZHRocy5sZWZ0LCBvcC5uZXdXaWR0aHMucmlnaHRcclxuXHRcdF0sXHJcblx0XHRldmVudCk7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRSZW1vdmVzIGFsbCBldmVudCBsaXN0ZW5lcnMsIGRhdGEsIGFuZCBhZGRlZCBET00gZWxlbWVudHMuIFRha2VzXHJcblx0dGhlIDx0YWJsZS8+IGVsZW1lbnQgYmFjayB0byBob3cgaXQgd2FzLCBhbmQgcmV0dXJucyBpdFxyXG5cclxuXHRAbWV0aG9kIGRlc3Ryb3lcclxuXHRAcmV0dXJuIHtqUXVlcnl9IE9yaWdpbmFsIGpRdWVyeS13cmFwcGVkIDx0YWJsZT4gZWxlbWVudFxyXG5cdCoqL1xyXG5cdGRlc3Ryb3koKSB7XHJcblx0XHRsZXQgJHRhYmxlID0gdGhpcy4kdGFibGU7XHJcblx0XHRsZXQgJGhhbmRsZXMgPSB0aGlzLiRoYW5kbGVDb250YWluZXIuZmluZCgnLicrQ0xBU1NfSEFORExFKTtcclxuXHJcblx0XHR0aGlzLnVuYmluZEV2ZW50cyhcclxuXHRcdFx0dGhpcy4kd2luZG93XHJcblx0XHRcdFx0LmFkZCh0aGlzLiRvd25lckRvY3VtZW50KVxyXG5cdFx0XHRcdC5hZGQodGhpcy4kdGFibGUpXHJcblx0XHRcdFx0LmFkZCgkaGFuZGxlcylcclxuXHRcdCk7XHJcblxyXG5cdFx0JGhhbmRsZXMucmVtb3ZlRGF0YShEQVRBX1RIKTtcclxuXHRcdCR0YWJsZS5yZW1vdmVEYXRhKERBVEFfQVBJKTtcclxuXHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIucmVtb3ZlKCk7XHJcblx0XHR0aGlzLiRoYW5kbGVDb250YWluZXIgPSBudWxsO1xyXG5cdFx0dGhpcy4kdGFibGVIZWFkZXJzID0gbnVsbDtcclxuXHRcdHRoaXMuJHRhYmxlID0gbnVsbDtcclxuXHJcblx0XHRyZXR1cm4gJHRhYmxlO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0QmluZHMgZ2l2ZW4gZXZlbnRzIGZvciB0aGlzIGluc3RhbmNlIHRvIHRoZSBnaXZlbiB0YXJnZXQgRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgYmluZEV2ZW50c1xyXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byBiaW5kIGV2ZW50cyB0b1xyXG5cdEBwYXJhbSBldmVudHMge1N0cmluZ3xBcnJheX0gRXZlbnQgbmFtZSAob3IgYXJyYXkgb2YpIHRvIGJpbmRcclxuXHRAcGFyYW0gc2VsZWN0b3JPckNhbGxiYWNrIHtTdHJpbmd8RnVuY3Rpb259IFNlbGVjdG9yIHN0cmluZyBvciBjYWxsYmFja1xyXG5cdEBwYXJhbSBbY2FsbGJhY2tdIHtGdW5jdGlvbn0gQ2FsbGJhY2sgbWV0aG9kXHJcblx0KiovXHJcblx0YmluZEV2ZW50cygkdGFyZ2V0LCBldmVudHMsIHNlbGVjdG9yT3JDYWxsYmFjaywgY2FsbGJhY2spIHtcclxuXHRcdGlmKHR5cGVvZiBldmVudHMgPT09ICdzdHJpbmcnKSB7XHJcblx0XHRcdGV2ZW50cyA9IGV2ZW50cyArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZXZlbnRzID0gZXZlbnRzLmpvaW4odGhpcy5ucyArICcgJykgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cclxuXHRcdGlmKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XHJcblx0XHRcdCR0YXJnZXQub24oZXZlbnRzLCBzZWxlY3Rvck9yQ2FsbGJhY2ssIGNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHRcdGVsc2Uge1xyXG5cdFx0XHQkdGFyZ2V0Lm9uKGV2ZW50cywgc2VsZWN0b3JPckNhbGxiYWNrKTtcclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFVuYmluZHMgZXZlbnRzIHNwZWNpZmljIHRvIHRoaXMgaW5zdGFuY2UgZnJvbSB0aGUgZ2l2ZW4gdGFyZ2V0IERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHVuYmluZEV2ZW50c1xyXG5cdEBwYXJhbSB0YXJnZXQge2pRdWVyeX0galF1ZXJ5LXdyYXBwZWQgRE9NRWxlbWVudCB0byB1bmJpbmQgZXZlbnRzIGZyb21cclxuXHRAcGFyYW0gZXZlbnRzIHtTdHJpbmd8QXJyYXl9IEV2ZW50IG5hbWUgKG9yIGFycmF5IG9mKSB0byB1bmJpbmRcclxuXHQqKi9cclxuXHR1bmJpbmRFdmVudHMoJHRhcmdldCwgZXZlbnRzKSB7XHJcblx0XHRpZih0eXBlb2YgZXZlbnRzID09PSAnc3RyaW5nJykge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMgKyB0aGlzLm5zO1xyXG5cdFx0fVxyXG5cdFx0ZWxzZSBpZihldmVudHMgIT0gbnVsbCkge1xyXG5cdFx0XHRldmVudHMgPSBldmVudHMuam9pbih0aGlzLm5zICsgJyAnKSArIHRoaXMubnM7XHJcblx0XHR9XHJcblx0XHRlbHNlIHtcclxuXHRcdFx0ZXZlbnRzID0gdGhpcy5ucztcclxuXHRcdH1cclxuXHJcblx0XHQkdGFyZ2V0Lm9mZihldmVudHMpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0VHJpZ2dlcnMgYW4gZXZlbnQgb24gdGhlIDx0YWJsZS8+IGVsZW1lbnQgZm9yIGEgZ2l2ZW4gdHlwZSB3aXRoIGdpdmVuXHJcblx0YXJndW1lbnRzLCBhbHNvIHNldHRpbmcgYW5kIGFsbG93aW5nIGFjY2VzcyB0byB0aGUgb3JpZ2luYWxFdmVudCBpZlxyXG5cdGdpdmVuLiBSZXR1cm5zIHRoZSByZXN1bHQgb2YgdGhlIHRyaWdnZXJlZCBldmVudC5cclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHRyaWdnZXJFdmVudFxyXG5cdEBwYXJhbSB0eXBlIHtTdHJpbmd9IEV2ZW50IG5hbWVcclxuXHRAcGFyYW0gYXJncyB7QXJyYXl9IEFycmF5IG9mIGFyZ3VtZW50cyB0byBwYXNzIHRocm91Z2hcclxuXHRAcGFyYW0gW29yaWdpbmFsRXZlbnRdIElmIGdpdmVuLCBpcyBzZXQgb24gdGhlIGV2ZW50IG9iamVjdFxyXG5cdEByZXR1cm4ge01peGVkfSBSZXN1bHQgb2YgdGhlIGV2ZW50IHRyaWdnZXIgYWN0aW9uXHJcblx0KiovXHJcblx0dHJpZ2dlckV2ZW50KHR5cGUsIGFyZ3MsIG9yaWdpbmFsRXZlbnQpIHtcclxuXHRcdGxldCBldmVudCA9ICQuRXZlbnQodHlwZSk7XHJcblx0XHRpZihldmVudC5vcmlnaW5hbEV2ZW50KSB7XHJcblx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQgPSAkLmV4dGVuZCh7fSwgb3JpZ2luYWxFdmVudCk7XHJcblx0XHR9XHJcblxyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLnRyaWdnZXIoZXZlbnQsIFt0aGlzXS5jb25jYXQoYXJncyB8fCBbXSkpO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q2FsY3VsYXRlcyBhIHVuaXF1ZSBjb2x1bW4gSUQgZm9yIGEgZ2l2ZW4gY29sdW1uIERPTUVsZW1lbnRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIGdlbmVyYXRlQ29sdW1uSWRcclxuXHRAcGFyYW0gJGVsIHtqUXVlcnl9IGpRdWVyeS13cmFwcGVkIGNvbHVtbiBlbGVtZW50XHJcblx0QHJldHVybiB7U3RyaW5nfSBDb2x1bW4gSURcclxuXHQqKi9cclxuXHRnZW5lcmF0ZUNvbHVtbklkKCRlbCkge1xyXG5cdFx0cmV0dXJuIHRoaXMuJHRhYmxlLmRhdGEoREFUQV9DT0xVTU5TX0lEKSArICctJyArICRlbC5kYXRhKERBVEFfQ09MVU1OX0lEKTtcclxuXHR9XHJcblxyXG5cdC8qKlxyXG5cdFBhcnNlcyBhIGdpdmVuIERPTUVsZW1lbnQncyB3aWR0aCBpbnRvIGEgZmxvYXRcclxuXHJcblx0QHByaXZhdGVcclxuXHRAbWV0aG9kIHBhcnNlV2lkdGhcclxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBnZXQgd2lkdGggb2ZcclxuXHRAcmV0dXJuIHtOdW1iZXJ9IEVsZW1lbnQncyB3aWR0aCBhcyBhIGZsb2F0XHJcblx0KiovXHJcblx0cGFyc2VXaWR0aChlbGVtZW50KSB7XHJcblx0XHRyZXR1cm4gZWxlbWVudCA/IHBhcnNlRmxvYXQoZWxlbWVudC5zdHlsZS53aWR0aC5yZXBsYWNlKCclJywgJycpKSA6IDA7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRTZXRzIHRoZSBwZXJjZW50YWdlIHdpZHRoIG9mIGEgZ2l2ZW4gRE9NRWxlbWVudFxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2Qgc2V0V2lkdGhcclxuXHRAcGFyYW0gZWxlbWVudCB7RE9NRWxlbWVudH0gRWxlbWVudCB0byBzZXQgd2lkdGggb25cclxuXHRAcGFyYW0gd2lkdGgge051bWJlcn0gV2lkdGgsIGFzIGEgcGVyY2VudGFnZSwgdG8gc2V0XHJcblx0KiovXHJcblx0c2V0V2lkdGgoZWxlbWVudCwgd2lkdGgpIHtcclxuXHRcdHdpZHRoID0gd2lkdGgudG9GaXhlZCgyKTtcclxuXHRcdHdpZHRoID0gd2lkdGggPiAwID8gd2lkdGggOiAwO1xyXG5cdFx0ZWxlbWVudC5zdHlsZS53aWR0aCA9IHdpZHRoICsgJyUnO1xyXG5cdH1cclxuXHJcblx0LyoqXHJcblx0Q29uc3RyYWlucyBhIGdpdmVuIHdpZHRoIHRvIHRoZSBtaW5pbXVtIGFuZCBtYXhpbXVtIHJhbmdlcyBkZWZpbmVkIGluXHJcblx0dGhlIGBtaW5XaWR0aGAgYW5kIGBtYXhXaWR0aGAgY29uZmlndXJhdGlvbiBvcHRpb25zLCByZXNwZWN0aXZlbHkuXHJcblxyXG5cdEBwcml2YXRlXHJcblx0QG1ldGhvZCBjb25zdHJhaW5XaWR0aFxyXG5cdEBwYXJhbSB3aWR0aCB7TnVtYmVyfSBXaWR0aCB0byBjb25zdHJhaW5cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IENvbnN0cmFpbmVkIHdpZHRoXHJcblx0KiovXHJcblx0Y29uc3RyYWluV2lkdGgod2lkdGgpIHtcclxuXHRcdGlmICh0aGlzLm9wdGlvbnMubWluV2lkdGggIT0gdW5kZWZpbmVkKSB7XHJcblx0XHRcdHdpZHRoID0gTWF0aC5tYXgodGhpcy5vcHRpb25zLm1pbldpZHRoLCB3aWR0aCk7XHJcblx0XHR9XHJcblxyXG5cdFx0aWYgKHRoaXMub3B0aW9ucy5tYXhXaWR0aCAhPSB1bmRlZmluZWQpIHtcclxuXHRcdFx0d2lkdGggPSBNYXRoLm1pbih0aGlzLm9wdGlvbnMubWF4V2lkdGgsIHdpZHRoKTtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gd2lkdGg7XHJcblx0fVxyXG5cclxuXHQvKipcclxuXHRHaXZlbiBhIHBhcnRpY3VsYXIgRXZlbnQgb2JqZWN0LCByZXRyaWV2ZXMgdGhlIGN1cnJlbnQgcG9pbnRlciBvZmZzZXQgYWxvbmdcclxuXHR0aGUgaG9yaXpvbnRhbCBkaXJlY3Rpb24uIEFjY291bnRzIGZvciBib3RoIHJlZ3VsYXIgbW91c2UgY2xpY2tzIGFzIHdlbGwgYXNcclxuXHRwb2ludGVyLWxpa2Ugc3lzdGVtcyAobW9iaWxlcywgdGFibGV0cyBldGMuKVxyXG5cclxuXHRAcHJpdmF0ZVxyXG5cdEBtZXRob2QgZ2V0UG9pbnRlclhcclxuXHRAcGFyYW0gZXZlbnQge09iamVjdH0gRXZlbnQgb2JqZWN0IGFzc29jaWF0ZWQgd2l0aCB0aGUgaW50ZXJhY3Rpb25cclxuXHRAcmV0dXJuIHtOdW1iZXJ9IEhvcml6b250YWwgcG9pbnRlciBvZmZzZXRcclxuXHQqKi9cclxuXHRnZXRQb2ludGVyWChldmVudCkge1xyXG5cdFx0aWYgKGV2ZW50LnR5cGUuaW5kZXhPZigndG91Y2gnKSA9PT0gMCkge1xyXG5cdFx0XHRyZXR1cm4gKGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1swXSB8fCBldmVudC5vcmlnaW5hbEV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdKS5wYWdlWDtcclxuXHRcdH1cclxuXHRcdHJldHVybiBldmVudC5wYWdlWDtcclxuXHR9XHJcbn1cclxuXHJcblJlc2l6YWJsZUNvbHVtbnMuZGVmYXVsdHMgPSB7XHJcblx0c2VsZWN0b3I6IGZ1bmN0aW9uKCR0YWJsZSkge1xyXG5cdFx0aWYoJHRhYmxlLmZpbmQoJ3RoZWFkJykubGVuZ3RoKSB7XHJcblx0XHRcdHJldHVybiBTRUxFQ1RPUl9USDtcclxuXHRcdH1cclxuXHJcblx0XHRyZXR1cm4gU0VMRUNUT1JfVEQ7XHJcblx0fSxcclxuXHRzdG9yZTogd2luZG93LnN0b3JlLFxyXG5cdHN5bmNIYW5kbGVyczogdHJ1ZSxcclxuXHRyZXNpemVGcm9tQm9keTogdHJ1ZSxcclxuXHRtYXhXaWR0aDogbnVsbCxcclxuXHRtaW5XaWR0aDogMC4wMVxyXG59O1xyXG5cclxuUmVzaXphYmxlQ29sdW1ucy5jb3VudCA9IDA7XHJcbiIsImV4cG9ydCBjb25zdCBEQVRBX0FQSSA9ICdyZXNpemFibGVDb2x1bW5zJztcclxuZXhwb3J0IGNvbnN0IERBVEFfQ09MVU1OU19JRCA9ICdyZXNpemFibGUtY29sdW1ucy1pZCc7XHJcbmV4cG9ydCBjb25zdCBEQVRBX0NPTFVNTl9JRCA9ICdyZXNpemFibGUtY29sdW1uLWlkJztcclxuZXhwb3J0IGNvbnN0IERBVEFfVEggPSAndGgnO1xyXG5cclxuZXhwb3J0IGNvbnN0IENMQVNTX1RBQkxFX1JFU0laSU5HID0gJ3JjLXRhYmxlLXJlc2l6aW5nJztcclxuZXhwb3J0IGNvbnN0IENMQVNTX0NPTFVNTl9SRVNJWklORyA9ICdyYy1jb2x1bW4tcmVzaXppbmcnO1xyXG5leHBvcnQgY29uc3QgQ0xBU1NfSEFORExFID0gJ3JjLWhhbmRsZSc7XHJcbmV4cG9ydCBjb25zdCBDTEFTU19IQU5ETEVfQ09OVEFJTkVSID0gJ3JjLWhhbmRsZS1jb250YWluZXInO1xyXG5cclxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRV9TVEFSVCA9ICdjb2x1bW46cmVzaXplOnN0YXJ0JztcclxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRSA9ICdjb2x1bW46cmVzaXplJztcclxuZXhwb3J0IGNvbnN0IEVWRU5UX1JFU0laRV9TVE9QID0gJ2NvbHVtbjpyZXNpemU6c3RvcCc7XHJcblxyXG5leHBvcnQgY29uc3QgU0VMRUNUT1JfVEggPSAndHI6Zmlyc3QgPiB0aDp2aXNpYmxlJztcclxuZXhwb3J0IGNvbnN0IFNFTEVDVE9SX1REID0gJ3RyOmZpcnN0ID4gdGQ6dmlzaWJsZSc7XHJcbmV4cG9ydCBjb25zdCBTRUxFQ1RPUl9VTlJFU0laQUJMRSA9IGBbZGF0YS1ub3Jlc2l6ZV1gO1xyXG4iLCJpbXBvcnQgUmVzaXphYmxlQ29sdW1ucyBmcm9tICcuL2NsYXNzJztcclxuaW1wb3J0IGFkYXB0ZXIgZnJvbSAnLi9hZGFwdGVyJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IFJlc2l6YWJsZUNvbHVtbnM7Il0sInByZUV4aXN0aW5nQ29tbWVudCI6Ii8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTlpY205M2MyVnlMWEJoWTJzdlgzQnlaV3gxWkdVdWFuTWlMQ0pET2k5VmMyVnljeTlCYm1SeVpYY3ZVSEp2YW1WamRITXZhbkYxWlhKNUxYSmxjMmw2WVdKc1pTMWpiMngxYlc1ekwzTnlZeTloWkdGd2RHVnlMbXB6SWl3aVF6b3ZWWE5sY25NdlFXNWtjbVYzTDFCeWIycGxZM1J6TDJweGRXVnllUzF5WlhOcGVtRmliR1V0WTI5c2RXMXVjeTl6Y21NdlkyeGhjM011YW5NaUxDSkRPaTlWYzJWeWN5OUJibVJ5WlhjdlVISnZhbVZqZEhNdmFuRjFaWEo1TFhKbGMybDZZV0pzWlMxamIyeDFiVzV6TDNOeVl5OWpiMjV6ZEdGdWRITXVhbk1pTENKRE9pOVZjMlZ5Y3k5QmJtUnlaWGN2VUhKdmFtVmpkSE12YW5GMVpYSjVMWEpsYzJsNllXSnNaUzFqYjJ4MWJXNXpMM055WXk5cGJtUmxlQzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pUVVGQlFUczdPenM3Y1VKRFFUWkNMRk5CUVZNN096czdlVUpCUTJZc1lVRkJZVHM3UVVGRmNFTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhuUWtGQlowSXNSMEZCUnl4VlFVRlRMR1ZCUVdVc1JVRkJWenR0UTBGQlRpeEpRVUZKTzBGQlFVb3NUVUZCU1RzN08wRkJRM2hFTEZGQlFVOHNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhaUVVGWE8wRkJRek5DTEUxQlFVa3NUVUZCVFN4SFFVRkhMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6czdRVUZGY2tJc1RVRkJTU3hIUVVGSExFZEJRVWNzVFVGQlRTeERRVUZETEVsQlFVa3NjVUpCUVZVc1EwRkJRenRCUVVOb1F5eE5RVUZKTEVOQlFVTXNSMEZCUnl4RlFVRkZPMEZCUTFRc1RVRkJSeXhIUVVGSExIVkNRVUZ4UWl4TlFVRk5MRVZCUVVVc1pVRkJaU3hEUVVGRExFTkJRVU03UVVGRGNFUXNVMEZCVFN4RFFVRkRMRWxCUVVrc2MwSkJRVmNzUjBGQlJ5eERRVUZETEVOQlFVTTdSMEZETTBJc1RVRkZTU3hKUVVGSkxFOUJRVThzWlVGQlpTeExRVUZMTEZGQlFWRXNSVUZCUlRzN08wRkJRemRETEZWQlFVOHNVVUZCUVN4SFFVRkhMRVZCUVVNc1pVRkJaU3hQUVVGRExFOUJRVWtzU1VGQlNTeERRVUZETEVOQlFVTTdSMEZEY2tNN1JVRkRSQ3hEUVVGRExFTkJRVU03UTBGRFNDeERRVUZET3p0QlFVVkdMRU5CUVVNc1EwRkJReXhuUWtGQlowSXNjVUpCUVcxQ0xFTkJRVU03T3pzN096czdPenM3T3pzN2VVSkRTR3BETEdGQlFXRTdPenM3T3pzN096czdPMGxCVlVjc1owSkJRV2RDTzBGQlEzcENMRlZCUkZNc1owSkJRV2RDTEVOQlEzaENMRTFCUVUwc1JVRkJSU3hQUVVGUExFVkJRVVU3ZDBKQlJGUXNaMEpCUVdkQ096dEJRVVZ1UXl4TlFVRkpMRU5CUVVNc1JVRkJSU3hIUVVGSExFdEJRVXNzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4RlFVRkZMRU5CUVVNN08wRkJSUzlDTEUxQlFVa3NRMEZCUXl4UFFVRlBMRWRCUVVjc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZGTEVWQlFVVXNaMEpCUVdkQ0xFTkJRVU1zVVVGQlVTeEZRVUZGTEU5QlFVOHNRMEZCUXl4RFFVRkRPenRCUVVWb1JTeE5RVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEJRVU42UWl4TlFVRkpMRU5CUVVNc1kwRkJZeXhIUVVGSExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU03UVVGRGFrUXNUVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJSeXhOUVVGTkxFTkJRVU03TzBGQlJYSkNMRTFCUVVrc1EwRkJReXhqUVVGakxFVkJRVVVzUTBGQlF6dEJRVU4wUWl4TlFVRkpMRU5CUVVNc2JVSkJRVzFDTEVWQlFVVXNRMEZCUXp0QlFVTXpRaXhOUVVGSkxFTkJRVU1zWjBKQlFXZENMRVZCUVVVc1EwRkJRenM3UVVGRmVFSXNUVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZGQlFWRXNSVUZCUlN4SlFVRkpMRU5CUVVNc1owSkJRV2RDTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03TzBGQlJURkZMRTFCUVVrc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVWQlFVVTdRVUZEZGtJc1QwRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4cFEwRkJjMElzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRIUVVOeVJUdEJRVU5FTEUxQlFVa3NTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhOUVVGTkxFVkJRVVU3UVVGRGVFSXNUMEZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTd3lRa0ZCWjBJc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXp0SFFVTm9SVHRCUVVORUxFMUJRVWtzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4SlFVRkpMRVZCUVVVN1FVRkRkRUlzVDBGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3huUTBGQmNVSXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dEhRVU51UlR0RlFVTkVPenM3T3pzN096czdZMEY2UW0xQ0xHZENRVUZuUWpzN1UwRnBRM1JDTERCQ1FVRkhPenM3UVVGSGFFSXNUMEZCU1N4UlFVRlJMRWRCUVVjc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTTdRVUZEY2tNc1QwRkJSeXhQUVVGUExGRkJRVkVzUzBGQlN5eFZRVUZWTEVWQlFVVTdRVUZEYkVNc1dVRkJVU3hIUVVGSExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dEpRVU0xUXpzN08wRkJSMFFzVDBGQlNTeERRVUZETEdGQlFXRXNSMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXpzN08wRkJSMmhFTEU5QlFVa3NRMEZCUXl4elFrRkJjMElzUlVGQlJTeERRVUZETzBGQlF6bENMRTlCUVVrc1EwRkJReXhoUVVGaExFVkJRVVVzUTBGQlF6dEhRVU55UWpzN096czdPenM3TzFOQlQxa3NlVUpCUVVjN096dEJRVU5tTEU5QlFVa3NSMEZCUnl4SFFVRkhMRWxCUVVrc1EwRkJReXhuUWtGQlowSXNRMEZCUXp0QlFVTm9ReXhQUVVGSkxFZEJRVWNzU1VGQlNTeEpRVUZKTEVWQlFVVTdRVUZEYUVJc1QwRkJSeXhEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETzBsQlEySTdPMEZCUlVRc1QwRkJTU3hEUVVGRExHZENRVUZuUWl4SFFVRkhMRU5CUVVNc0swUkJRVFpETEVOQlFVRTdRVUZEZEVVc1QwRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMR2RDUVVGblFpeERRVUZETEVOQlFVTTdPMEZCUlRGRExFOUJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVVNc1EwRkJReXhGUVVGRkxFVkJRVVVzUlVGQlN6dEJRVU5zUXl4UlFVRkpMRkZCUVZFc1IwRkJSeXhOUVVGTExHRkJRV0VzUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1FVRkRlRU1zVVVGQlNTeExRVUZMTEVkQlFVY3NUVUZCU3l4aFFVRmhMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTXNRMEZCUXpzN1FVRkZla01zVVVGQlNTeExRVUZMTEVOQlFVTXNUVUZCVFN4TFFVRkxMRU5CUVVNc1NVRkJTU3hSUVVGUkxFTkJRVU1zUlVGQlJTeHBRMEZCYzBJc1NVRkJTU3hMUVVGTExFTkJRVU1zUlVGQlJTeHBRMEZCYzBJc1JVRkJSVHRCUVVNNVJpeFpRVUZQTzB0QlExQTdPMEZCUlVRc1VVRkJTU3hQUVVGUExFZEJRVWNzUTBGQlF5eHhSRUZCYlVNc1EwRkRhRVFzU1VGQlNTeHhRa0ZCVlN4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGRGNFSXNVVUZCVVN4RFFVRkRMRTFCUVVzc1owSkJRV2RDTEVOQlFVTXNRMEZCUXp0SlFVTnNReXhEUVVGRExFTkJRVU03TzBGQlJVZ3NUMEZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRVZCUVVVc1EwRkJReXhYUVVGWExFVkJRVVVzV1VGQldTeERRVUZETEVWQlFVVXNSMEZCUnl3d1FrRkJZU3hGUVVGRkxFbEJRVWtzUTBGQlF5eGhRVUZoTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03UjBGRGNrZzdPenM3T3pzN096dFRRVTl4UWl4clEwRkJSenM3TzBGQlEzaENMRTlCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zU1VGQlNTeERRVUZETEZWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVVc1JVRkJTenRCUVVOc1F5eFJRVUZKTEVkQlFVY3NSMEZCUnl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFTkJRVU03UVVGRGFFSXNWMEZCU3l4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVY3NRMEZCUXl4VlFVRlZMRVZCUVVVc1IwRkJSeXhQUVVGTExFMUJRVTBzUTBGQlF5eExRVUZMTEVWQlFVVXNSMEZCUnl4SFFVRkhMRU5CUVVNc1EwRkJRenRKUVVOd1JTeERRVUZETEVOQlFVTTdSMEZEU0RzN096czdPenM3TzFOQlQyVXNORUpCUVVjN096dEJRVU5zUWl4UFFVRkpMRlZCUVZVc1IwRkJSeXhKUVVGSkxFTkJRVU1zWjBKQlFXZENMRU5CUVVFN08wRkJSWFJETEdGQlFWVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXl4RFFVRkRPenRCUVVWMFF5eGhRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc01FSkJRV0VzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4VlFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFVkJRVXM3UVVGRGFrUXNVVUZCU1N4SFFVRkhMRWRCUVVjc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZET3p0QlFVVm9RaXhSUVVGSkxFMUJRVTBzUjBGQlJ5eFBRVUZMTEU5QlFVOHNRMEZCUXl4alFVRmpMRWRCUTNaRExFOUJRVXNzVFVGQlRTeERRVUZETEUxQlFVMHNSVUZCUlN4SFFVTndRaXhQUVVGTExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU03TzBGQlJYQkRMRkZCUVVrc1NVRkJTU3hIUVVGSExFZEJRVWNzUTBGQlF5eEpRVUZKTEc5Q1FVRlRMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFbEJRM2hETEVkQlFVY3NRMEZCUXl4SlFVRkpMRzlDUVVGVExFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNTVUZCU1N4SFFVRkhMRTlCUVVzc1owSkJRV2RDTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1NVRkJTU3hEUVVGQkxFRkJRM0pGTEVOQlFVTTdPMEZCUlVZc1QwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCU2l4SlFVRkpMRVZCUVVVc1RVRkJUU3hGUVVGT0xFMUJRVTBzUlVGQlJTeERRVUZETEVOQlFVTTdTVUZETVVJc1EwRkJReXhEUVVGRE8wZEJRMGc3T3pzN096czdPenRUUVU5bExEUkNRVUZIT3pzN1FVRkRiRUlzVDBGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeEZRVUZMTzBGQlEyeERMRkZCUVVrc1IwRkJSeXhIUVVGSExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXpzN1FVRkZhRUlzVVVGQlNTeFBRVUZMTEU5QlFVOHNRMEZCUXl4TFFVRkxMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJTeHBRMEZCYzBJc1JVRkJSVHRCUVVONFJDeFpRVUZMTEU5QlFVOHNRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJSeXhEUVVOeVFpeFBRVUZMTEdkQ1FVRm5RaXhEUVVGRExFZEJRVWNzUTBGQlF5eEZRVU14UWl4UFFVRkxMRlZCUVZVc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGRGJrSXNRMEZCUXp0TFFVTkdPMGxCUTBRc1EwRkJReXhEUVVGRE8wZEJRMGc3T3pzN096czdPenRUUVU5clFpd3JRa0ZCUnpzN08wRkJRM0pDTEU5QlFVa3NRMEZCUXl4aFFVRmhMRU5CUVVNc1NVRkJTU3hEUVVGRExGVkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVVXNSVUZCU3p0QlFVTnNReXhSUVVGSkxFZEJRVWNzUjBGQlJ5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNN08wRkJSV2hDTEZGQlFVY3NUMEZCU3l4UFFVRlBMRU5CUVVNc1MwRkJTeXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVWQlFVVXNhVU5CUVhOQ0xFVkJRVVU3UVVGRGRrUXNVMEZCU1N4TFFVRkxMRWRCUVVjc1QwRkJTeXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZEYWtNc1QwRkJTeXhuUWtGQlowSXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkRNVUlzUTBGQlF6czdRVUZGUml4VFFVRkhMRXRCUVVzc1NVRkJTU3hKUVVGSkxFVkJRVVU3UVVGRGFrSXNZVUZCU3l4UlFVRlJMRU5CUVVNc1JVRkJSU3hGUVVGRkxFdEJRVXNzUTBGQlF5eERRVUZETzAxQlEzcENPMHRCUTBRN1NVRkRSQ3hEUVVGRExFTkJRVU03UjBGRFNEczdPenM3T3pzN096dFRRVkZaTEhWQ1FVRkRMRXRCUVVzc1JVRkJSVHM3T3pzN1FVRkxjRUlzVDBGQlJ5eEpRVUZKTEVOQlFVTXNVMEZCVXl4RlFVRkZPMEZCUTJ4Q0xGRkJRVWtzUTBGQlF5eFhRVUZYTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNN1NVRkRlRUk3T3p0QlFVZEVMRTlCUVVrc1dVRkJXU3hIUVVGSExFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNN1FVRkRNVU1zVDBGQlJ5eFpRVUZaTEVOQlFVTXNSVUZCUlN4cFEwRkJjMElzUlVGQlJUdEJRVU42UXl4WFFVRlBPMGxCUTFBN08wRkJSVVFzVDBGQlNTeFRRVUZUTEVkQlFVY3NXVUZCV1N4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRE8wRkJRM0pETEU5QlFVa3NWMEZCVnl4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zUlVGQlJTeERRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRWRCUVVjc2FVTkJRWE5DTEVOQlFVTTdRVUZETjBVc1QwRkJTU3haUVVGWkxFZEJRVWNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1UwRkJVeXhIUVVGSExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NhVU5CUVhOQ0xFTkJRVU03TzBGQlJXeEdMRTlCUVVrc1UwRkJVeXhIUVVGSExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU03UVVGRGFFUXNUMEZCU1N4VlFVRlZMRWRCUVVjc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eFpRVUZaTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenM3UVVGRmJFUXNUMEZCU1N4RFFVRkRMRk5CUVZNc1IwRkJSenRCUVVOb1FpeGxRVUZYTEVWQlFWZ3NWMEZCVnl4RlFVRkZMRmxCUVZrc1JVRkJXaXhaUVVGWkxFVkJRVVVzV1VGQldTeEZRVUZhTEZsQlFWazdPMEZCUlhaRExGVkJRVTBzUlVGQlJTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRXRCUVVzc1EwRkJRenM3UVVGRkwwSXNWVUZCVFN4RlFVRkZPMEZCUTFBc1UwRkJTU3hGUVVGRkxGTkJRVk03UVVGRFppeFZRVUZMTEVWQlFVVXNWVUZCVlR0TFFVTnFRanRCUVVORUxHRkJRVk1zUlVGQlJUdEJRVU5XTEZOQlFVa3NSVUZCUlN4VFFVRlRPMEZCUTJZc1ZVRkJTeXhGUVVGRkxGVkJRVlU3UzBGRGFrSTdTVUZEUkN4RFFVRkRPenRCUVVWR0xFOUJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRExGZEJRVmNzUlVGQlJTeFhRVUZYTEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTJoSExFOUJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNTVUZCU1N4RFFVRkRMR05CUVdNc1JVRkJSU3hEUVVGRExGTkJRVk1zUlVGQlJTeFZRVUZWTEVOQlFVTXNSVUZCUlN4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRPenRCUVVVelJpeFBRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFTkJRMjVDTEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hEUVVGRExFTkJRMmhDTEZGQlFWRXNhVU5CUVhOQ0xFTkJRVU03TzBGQlJXcERMR05CUVZjc1EwRkRWQ3hIUVVGSExFTkJRVU1zV1VGQldTeERRVUZETEVOQlEycENMRWRCUVVjc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGRGFrSXNVVUZCVVN4clEwRkJkVUlzUTBGQlF6czdRVUZGYkVNc1QwRkJTU3hEUVVGRExGbEJRVmtzWjBOQlFYRkNMRU5CUTNKRExGZEJRVmNzUlVGQlJTeFpRVUZaTEVWQlEzcENMRk5CUVZNc1JVRkJSU3hWUVVGVkxFTkJRM0pDTEVWQlEwUXNTMEZCU3l4RFFVRkRMRU5CUVVNN08wRkJSVkFzVVVGQlN5eERRVUZETEdOQlFXTXNSVUZCUlN4RFFVRkRPMGRCUTNaQ096czdPenM3T3pzN08xTkJVVmtzZFVKQlFVTXNTMEZCU3l4RlFVRkZPMEZCUTNCQ0xFOUJRVWtzUlVGQlJTeEhRVUZITEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNN1FVRkRlRUlzVDBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRVZCUVVVN1FVRkJSU3hYUVVGUE8wbEJRVVU3T3p0QlFVY3ZRaXhQUVVGSkxGVkJRVlVzUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4WFFVRlhMRU5CUVVNc1MwRkJTeXhEUVVGRExFZEJRVWNzUlVGQlJTeERRVUZETEUxQlFVMHNRMEZCUVN4SFFVRkpMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU1zUzBGQlN5eEZRVUZGTEVkQlFVY3NSMEZCUnl4RFFVRkRPMEZCUTI1R0xFOUJRVWNzVlVGQlZTeExRVUZMTEVOQlFVTXNSVUZCUlR0QlFVTndRaXhYUVVGUE8wbEJRMUE3TzBGQlJVUXNUMEZCU1N4VlFVRlZMRWRCUVVjc1JVRkJSU3hEUVVGRExGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0QlFVTnVReXhQUVVGSkxGZEJRVmNzUjBGQlJ5eEZRVUZGTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wRkJRM0pETEU5QlFVa3NVMEZCVXl4WlFVRkJPMDlCUVVVc1ZVRkJWU3haUVVGQkxFTkJRVU03TzBGQlJURkNMRTlCUVVjc1ZVRkJWU3hIUVVGSExFTkJRVU1zUlVGQlJUdEJRVU5zUWl4aFFVRlRMRWRCUVVjc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1NVRkJTU3hGUVVGRkxFTkJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NSMEZCUnl4RlFVRkZMRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUTBGQlFTeEJRVUZETEVOQlFVTXNRMEZCUXp0QlFVTjZSaXhqUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzUjBGQlJ5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTXZSQ3hOUVVOSkxFbEJRVWNzVlVGQlZTeEhRVUZITEVOQlFVTXNSVUZCUlR0QlFVTjJRaXhoUVVGVExFZEJRVWNzU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzUjBGQlJ5eFZRVUZWTEVOQlFVTXNRMEZCUXp0QlFVTTNSQ3hqUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzU1VGQlNTeEZRVUZGTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1IwRkJSeXhGUVVGRkxFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NRMEZCUVN4QlFVRkRMRU5CUVVNc1EwRkJRenRKUVVONlJqczdRVUZGUkN4UFFVRkhMRlZCUVZVc1JVRkJSVHRCUVVOa0xGRkJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNWVUZCVlN4RlFVRkZMRk5CUVZNc1EwRkJReXhEUVVGRE8wbEJRM0pETzBGQlEwUXNUMEZCUnl4WFFVRlhMRVZCUVVVN1FVRkRaaXhSUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEZkQlFWY3NSVUZCUlN4VlFVRlZMRU5CUVVNc1EwRkJRenRKUVVOMlF6czdRVUZGUkN4TFFVRkZMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUjBGQlJ5eFRRVUZUTEVOQlFVTTdRVUZET1VJc1MwRkJSU3hEUVVGRExGTkJRVk1zUTBGQlF5eExRVUZMTEVkQlFVY3NWVUZCVlN4RFFVRkRPenRCUVVWb1F5eFZRVUZQTEVsQlFVa3NRMEZCUXl4WlFVRlpMREJDUVVGbExFTkJRM1JETEVWQlFVVXNRMEZCUXl4WFFVRlhMRVZCUVVVc1JVRkJSU3hEUVVGRExGbEJRVmtzUlVGREwwSXNVMEZCVXl4RlFVRkZMRlZCUVZVc1EwRkRja0lzUlVGRFJDeExRVUZMTEVOQlFVTXNRMEZCUXp0SFFVTlFPenM3T3pzN096czdPMU5CVVZVc2NVSkJRVU1zUzBGQlN5eEZRVUZGTzBGQlEyeENMRTlCUVVrc1JVRkJSU3hIUVVGSExFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTTdRVUZEZUVJc1QwRkJSeXhEUVVGRExFbEJRVWtzUTBGQlF5eFRRVUZUTEVWQlFVVTdRVUZCUlN4WFFVRlBPMGxCUVVVN08wRkJSUzlDTEU5QlFVa3NRMEZCUXl4WlFVRlpMRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUlVGQlJTeERRVUZETEZOQlFWTXNSVUZCUlN4VlFVRlZMRVZCUVVVc1YwRkJWeXhGUVVGRkxGZEJRVmNzUTBGQlF5eERRVUZETEVOQlFVTTdPMEZCUlRGR0xFOUJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkRia0lzUjBGQlJ5eERRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkRhRUlzVjBGQlZ5eHBRMEZCYzBJc1EwRkJRenM3UVVGRmNFTXNTMEZCUlN4RFFVRkRMRmRCUVZjc1EwRkRXaXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVTndRaXhIUVVGSExFTkJRVU1zUlVGQlJTeERRVUZETEZsQlFWa3NRMEZCUXl4RFFVTndRaXhYUVVGWExHdERRVUYxUWl4RFFVRkRPenRCUVVWeVF5eFBRVUZKTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzUTBGQlF6dEJRVU40UWl4UFFVRkpMRU5CUVVNc1owSkJRV2RDTEVWQlFVVXNRMEZCUXpzN1FVRkZlRUlzVDBGQlNTeERRVUZETEZOQlFWTXNSMEZCUnl4SlFVRkpMRU5CUVVNN08wRkJSWFJDTEZWQlFVOHNTVUZCU1N4RFFVRkRMRmxCUVZrc0swSkJRVzlDTEVOQlF6TkRMRVZCUVVVc1EwRkJReXhYUVVGWExFVkJRVVVzUlVGQlJTeERRVUZETEZsQlFWa3NSVUZETDBJc1JVRkJSU3hEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEVWQlFVVXNSVUZCUlN4RFFVRkRMRk5CUVZNc1EwRkJReXhMUVVGTExFTkJRM0pETEVWQlEwUXNTMEZCU3l4RFFVRkRMRU5CUVVNN1IwRkRVRHM3T3pzN096czdPenM3VTBGVFRTeHRRa0ZCUnp0QlFVTlVMRTlCUVVrc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTTdRVUZEZWtJc1QwRkJTU3hSUVVGUkxFZEJRVWNzU1VGQlNTeERRVUZETEdkQ1FVRm5RaXhEUVVGRExFbEJRVWtzUTBGQlF5eEhRVUZITERCQ1FVRmhMRU5CUVVNc1EwRkJRenM3UVVGRk5VUXNUMEZCU1N4RFFVRkRMRmxCUVZrc1EwRkRhRUlzU1VGQlNTeERRVUZETEU5QlFVOHNRMEZEVml4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExHTkJRV01zUTBGQlF5eERRVU40UWl4SFFVRkhMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eERRVU5vUWl4SFFVRkhMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRMllzUTBGQlF6czdRVUZGUml4WFFVRlJMRU5CUVVNc1ZVRkJWU3h2UWtGQlV5eERRVUZETzBGQlF6ZENMRk5CUVUwc1EwRkJReXhWUVVGVkxIRkNRVUZWTEVOQlFVTTdPMEZCUlRWQ0xFOUJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhOUVVGTkxFVkJRVVVzUTBGQlF6dEJRVU12UWl4UFFVRkpMRU5CUVVNc1owSkJRV2RDTEVkQlFVY3NTVUZCU1N4RFFVRkRPMEZCUXpkQ0xFOUJRVWtzUTBGQlF5eGhRVUZoTEVkQlFVY3NTVUZCU1N4RFFVRkRPMEZCUXpGQ0xFOUJRVWtzUTBGQlF5eE5RVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRPenRCUVVWdVFpeFZRVUZQTEUxQlFVMHNRMEZCUXp0SFFVTmtPenM3T3pzN096czdPenM3T3p0VFFWbFRMRzlDUVVGRExFOUJRVThzUlVGQlJTeE5RVUZOTEVWQlFVVXNhMEpCUVd0Q0xFVkJRVVVzVVVGQlVTeEZRVUZGTzBGQlEzcEVMRTlCUVVjc1QwRkJUeXhOUVVGTkxFdEJRVXNzVVVGQlVTeEZRVUZGTzBGQlF6bENMRlZCUVUwc1IwRkJSeXhOUVVGTkxFZEJRVWNzU1VGQlNTeERRVUZETEVWQlFVVXNRMEZCUXp0SlFVTXhRaXhOUVVOSk8wRkJRMG9zVlVGQlRTeEhRVUZITEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUjBGQlJ5eEhRVUZITEVOQlFVTXNSMEZCUnl4SlFVRkpMRU5CUVVNc1JVRkJSU3hEUVVGRE8wbEJRemxET3p0QlFVVkVMRTlCUVVjc1UwRkJVeXhEUVVGRExFMUJRVTBzUjBGQlJ5eERRVUZETEVWQlFVVTdRVUZEZUVJc1YwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF5eE5RVUZOTEVWQlFVVXNhMEpCUVd0Q0xFVkJRVVVzVVVGQlVTeERRVUZETEVOQlFVTTdTVUZEYWtRc1RVRkRTVHRCUVVOS0xGZEJRVThzUTBGQlF5eEZRVUZGTEVOQlFVTXNUVUZCVFN4RlFVRkZMR3RDUVVGclFpeERRVUZETEVOQlFVTTdTVUZEZGtNN1IwRkRSRHM3T3pzN096czdPenM3TzFOQlZWY3NjMEpCUVVNc1QwRkJUeXhGUVVGRkxFMUJRVTBzUlVGQlJUdEJRVU0zUWl4UFFVRkhMRTlCUVU4c1RVRkJUU3hMUVVGTExGRkJRVkVzUlVGQlJUdEJRVU01UWl4VlFVRk5MRWRCUVVjc1RVRkJUU3hIUVVGSExFbEJRVWtzUTBGQlF5eEZRVUZGTEVOQlFVTTdTVUZETVVJc1RVRkRTU3hKUVVGSExFMUJRVTBzU1VGQlNTeEpRVUZKTEVWQlFVVTdRVUZEZGtJc1ZVRkJUU3hIUVVGSExFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1IwRkJSeXhIUVVGSExFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNSVUZCUlN4RFFVRkRPMGxCUXpsRExFMUJRMGs3UVVGRFNpeFZRVUZOTEVkQlFVY3NTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJRenRKUVVOcVFqczdRVUZGUkN4VlFVRlBMRU5CUVVNc1IwRkJSeXhEUVVGRExFMUJRVTBzUTBGQlF5eERRVUZETzBkQlEzQkNPenM3T3pzN096czdPenM3T3pzN08xTkJZMWNzYzBKQlFVTXNTVUZCU1N4RlFVRkZMRWxCUVVrc1JVRkJSU3hoUVVGaExFVkJRVVU3UVVGRGRrTXNUMEZCU1N4TFFVRkxMRWRCUVVjc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXp0QlFVTXhRaXhQUVVGSExFdEJRVXNzUTBGQlF5eGhRVUZoTEVWQlFVVTdRVUZEZGtJc1UwRkJTeXhEUVVGRExHRkJRV0VzUjBGQlJ5eERRVUZETEVOQlFVTXNUVUZCVFN4RFFVRkRMRVZCUVVVc1JVRkJSU3hoUVVGaExFTkJRVU1zUTBGQlF6dEpRVU5zUkRzN1FVRkZSQ3hWUVVGUExFbEJRVWtzUTBGQlF5eE5RVUZOTEVOQlFVTXNUMEZCVHl4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRWxCUVVrc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF6dEhRVU0zUkRzN096czdPenM3T3pzN08xTkJWV1VzTUVKQlFVTXNSMEZCUnl4RlFVRkZPMEZCUTNKQ0xGVkJRVThzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRFJDUVVGcFFpeEhRVUZITEVkQlFVY3NSMEZCUnl4SFFVRkhMRU5CUVVNc1NVRkJTU3d5UWtGQlowSXNRMEZCUXp0SFFVTXhSVHM3T3pzN096czdPenM3TzFOQlZWTXNiMEpCUVVNc1QwRkJUeXhGUVVGRk8wRkJRMjVDTEZWQlFVOHNUMEZCVHl4SFFVRkhMRlZCUVZVc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1IwRkJSeXhGUVVGRkxFVkJRVVVzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMGRCUTNSRk96czdPenM3T3pzN096czdVMEZWVHl4clFrRkJReXhQUVVGUExFVkJRVVVzUzBGQlN5eEZRVUZGTzBGQlEzaENMRkZCUVVzc1IwRkJSeXhMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRPMEZCUTNwQ0xGRkJRVXNzUjBGQlJ5eExRVUZMTEVkQlFVY3NRMEZCUXl4SFFVRkhMRXRCUVVzc1IwRkJSeXhEUVVGRExFTkJRVU03UVVGRE9VSXNWVUZCVHl4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGTExFZEJRVWNzUzBGQlN5eEhRVUZITEVkQlFVY3NRMEZCUXp0SFFVTnNRenM3T3pzN096czdPenM3T3p0VFFWZGhMSGRDUVVGRExFdEJRVXNzUlVGQlJUdEJRVU55UWl4UFFVRkpMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zVVVGQlVTeEpRVUZKTEZOQlFWTXNSVUZCUlR0QlFVTjJReXhUUVVGTExFZEJRVWNzU1VGQlNTeERRVUZETEVkQlFVY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExGRkJRVkVzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0SlFVTXZRenM3UVVGRlJDeFBRVUZKTEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1VVRkJVU3hKUVVGSkxGTkJRVk1zUlVGQlJUdEJRVU4yUXl4VFFVRkxMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1JVRkJSU3hMUVVGTExFTkJRVU1zUTBGQlF6dEpRVU12UXpzN1FVRkZSQ3hWUVVGUExFdEJRVXNzUTBGQlF6dEhRVU5pT3pzN096czdPenM3T3pzN096dFRRVmxWTEhGQ1FVRkRMRXRCUVVzc1JVRkJSVHRCUVVOc1FpeFBRVUZKTEV0QlFVc3NRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFOUJRVThzUTBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUlR0QlFVTjBReXhYUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEdGQlFXRXNRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFbEJRVWtzUzBGQlN5eERRVUZETEdGQlFXRXNRMEZCUXl4alFVRmpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUVzUTBGQlJTeExRVUZMTEVOQlFVTTdTVUZEZGtZN1FVRkRSQ3hWUVVGUExFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTTdSMEZEYmtJN096dFJRWFJrYlVJc1owSkJRV2RDT3pzN2NVSkJRV2hDTEdkQ1FVRm5RanM3UVVGNVpISkRMR2RDUVVGblFpeERRVUZETEZGQlFWRXNSMEZCUnp0QlFVTXpRaXhUUVVGUkxFVkJRVVVzYTBKQlFWTXNUVUZCVFN4RlFVRkZPMEZCUXpGQ0xFMUJRVWNzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVVU3UVVGREwwSXNhVU5CUVcxQ08wZEJRMjVDT3p0QlFVVkVMR2REUVVGdFFqdEZRVU51UWp0QlFVTkVMRTFCUVVzc1JVRkJSU3hOUVVGTkxFTkJRVU1zUzBGQlN6dEJRVU51UWl4aFFVRlpMRVZCUVVVc1NVRkJTVHRCUVVOc1FpeGxRVUZqTEVWQlFVVXNTVUZCU1R0QlFVTndRaXhUUVVGUkxFVkJRVVVzU1VGQlNUdEJRVU5rTEZOQlFWRXNSVUZCUlN4SlFVRkpPME5CUTJRc1EwRkJRenM3UVVGRlJpeG5Ra0ZCWjBJc1EwRkJReXhMUVVGTExFZEJRVWNzUTBGQlF5eERRVUZET3pzN096czdPenM3UVVOc1owSndRaXhKUVVGTkxGRkJRVkVzUjBGQlJ5eHJRa0ZCYTBJc1EwRkJRenM3UVVGRGNFTXNTVUZCVFN4bFFVRmxMRWRCUVVjc2MwSkJRWE5DTEVOQlFVTTdPMEZCUXk5RExFbEJRVTBzWTBGQll5eEhRVUZITEhGQ1FVRnhRaXhEUVVGRE96dEJRVU0zUXl4SlFVRk5MRTlCUVU4c1IwRkJSeXhKUVVGSkxFTkJRVU03T3p0QlFVVnlRaXhKUVVGTkxHOUNRVUZ2UWl4SFFVRkhMRzFDUVVGdFFpeERRVUZET3p0QlFVTnFSQ3hKUVVGTkxIRkNRVUZ4UWl4SFFVRkhMRzlDUVVGdlFpeERRVUZET3p0QlFVTnVSQ3hKUVVGTkxGbEJRVmtzUjBGQlJ5eFhRVUZYTEVOQlFVTTdPMEZCUTJwRExFbEJRVTBzYzBKQlFYTkNMRWRCUVVjc2NVSkJRWEZDTEVOQlFVTTdPenRCUVVWeVJDeEpRVUZOTEd0Q1FVRnJRaXhIUVVGSExIRkNRVUZ4UWl4RFFVRkRPenRCUVVOcVJDeEpRVUZOTEZsQlFWa3NSMEZCUnl4bFFVRmxMRU5CUVVNN08wRkJRM0pETEVsQlFVMHNhVUpCUVdsQ0xFZEJRVWNzYjBKQlFXOUNMRU5CUVVNN096dEJRVVV2UXl4SlFVRk5MRmRCUVZjc1IwRkJSeXgxUWtGQmRVSXNRMEZCUXpzN1FVRkROVU1zU1VGQlRTeFhRVUZYTEVkQlFVY3NkVUpCUVhWQ0xFTkJRVU03TzBGQlF6VkRMRWxCUVUwc2IwSkJRVzlDTEc5Q1FVRnZRaXhEUVVGRE96czdPenM3T3pzN096czdjVUpEYUVKNlFpeFRRVUZUT3pzN08zVkNRVU5zUWl4WFFVRlhJaXdpWm1sc1pTSTZJbWRsYm1WeVlYUmxaQzVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lJb1puVnVZM1JwYjI0Z1pTaDBMRzRzY2lsN1puVnVZM1JwYjI0Z2N5aHZMSFVwZTJsbUtDRnVXMjlkS1h0cFppZ2hkRnR2WFNsN2RtRnlJR0U5ZEhsd1pXOW1JSEpsY1hWcGNtVTlQVndpWm5WdVkzUnBiMjVjSWlZbWNtVnhkV2x5WlR0cFppZ2hkU1ltWVNseVpYUjFjbTRnWVNodkxDRXdLVHRwWmlocEtYSmxkSFZ5YmlCcEtHOHNJVEFwTzNaaGNpQm1QVzVsZHlCRmNuSnZjaWhjSWtOaGJtNXZkQ0JtYVc1a0lHMXZaSFZzWlNBblhDSXJieXRjSWlkY0lpazdkR2h5YjNjZ1ppNWpiMlJsUFZ3aVRVOUVWVXhGWDA1UFZGOUdUMVZPUkZ3aUxHWjlkbUZ5SUd3OWJsdHZYVDE3Wlhod2IzSjBjenA3ZlgwN2RGdHZYVnN3WFM1allXeHNLR3d1Wlhod2IzSjBjeXhtZFc1amRHbHZiaWhsS1h0MllYSWdiajEwVzI5ZFd6RmRXMlZkTzNKbGRIVnliaUJ6S0c0L2JqcGxLWDBzYkN4c0xtVjRjRzl5ZEhNc1pTeDBMRzRzY2lsOWNtVjBkWEp1SUc1YmIxMHVaWGh3YjNKMGMzMTJZWElnYVQxMGVYQmxiMllnY21WeGRXbHlaVDA5WENKbWRXNWpkR2x2Ymx3aUppWnlaWEYxYVhKbE8yWnZjaWgyWVhJZ2J6MHdPMjg4Y2k1c1pXNW5kR2c3YnlzcktYTW9jbHR2WFNrN2NtVjBkWEp1SUhOOUtTSXNJbWx0Y0c5eWRDQlNaWE5wZW1GaWJHVkRiMngxYlc1eklHWnliMjBnSnk0dlkyeGhjM01uTzF4eVhHNXBiWEJ2Y25RZ2UwUkJWRUZmUVZCSmZTQm1jbTl0SUNjdUwyTnZibk4wWVc1MGN5YzdYSEpjYmx4eVhHNGtMbVp1TG5KbGMybDZZV0pzWlVOdmJIVnRibk1nUFNCbWRXNWpkR2x2YmlodmNIUnBiMjV6VDNKTlpYUm9iMlFzSUM0dUxtRnlaM01wSUh0Y2NseHVYSFJ5WlhSMWNtNGdkR2hwY3k1bFlXTm9LR1oxYm1OMGFXOXVLQ2tnZTF4eVhHNWNkRngwYkdWMElDUjBZV0pzWlNBOUlDUW9kR2hwY3lrN1hISmNibHh5WEc1Y2RGeDBiR1YwSUdGd2FTQTlJQ1IwWVdKc1pTNWtZWFJoS0VSQlZFRmZRVkJKS1R0Y2NseHVYSFJjZEdsbUlDZ2hZWEJwS1NCN1hISmNibHgwWEhSY2RHRndhU0E5SUc1bGR5QlNaWE5wZW1GaWJHVkRiMngxYlc1ektDUjBZV0pzWlN3Z2IzQjBhVzl1YzA5eVRXVjBhRzlrS1R0Y2NseHVYSFJjZEZ4MEpIUmhZbXhsTG1SaGRHRW9SRUZVUVY5QlVFa3NJR0Z3YVNrN1hISmNibHgwWEhSOVhISmNibHh5WEc1Y2RGeDBaV3h6WlNCcFppQW9kSGx3Wlc5bUlHOXdkR2x2Ym5OUGNrMWxkR2h2WkNBOVBUMGdKM04wY21sdVp5Y3BJSHRjY2x4dVhIUmNkRngwY21WMGRYSnVJR0Z3YVZ0dmNIUnBiMjV6VDNKTlpYUm9iMlJkS0M0dUxtRnlaM01wTzF4eVhHNWNkRngwZlZ4eVhHNWNkSDBwTzF4eVhHNTlPMXh5WEc1Y2NseHVKQzV5WlhOcGVtRmliR1ZEYjJ4MWJXNXpJRDBnVW1WemFYcGhZbXhsUTI5c2RXMXVjenRjY2x4dUlpd2lhVzF3YjNKMElIdGNjbHh1WEhSRVFWUkJYMEZRU1N4Y2NseHVYSFJFUVZSQlgwTlBURlZOVGxOZlNVUXNYSEpjYmx4MFJFRlVRVjlEVDB4VlRVNWZTVVFzWEhKY2JseDBSRUZVUVY5VVNDeGNjbHh1WEhSRFRFRlRVMTlVUVVKTVJWOVNSVk5KV2tsT1J5eGNjbHh1WEhSRFRFRlRVMTlEVDB4VlRVNWZVa1ZUU1ZwSlRrY3NYSEpjYmx4MFEweEJVMU5mU0VGT1JFeEZMRnh5WEc1Y2RFTk1RVk5UWDBoQlRrUk1SVjlEVDA1VVFVbE9SVklzWEhKY2JseDBSVlpGVGxSZlVrVlRTVnBGWDFOVVFWSlVMRnh5WEc1Y2RFVldSVTVVWDFKRlUwbGFSU3hjY2x4dVhIUkZWa1ZPVkY5U1JWTkpXa1ZmVTFSUFVDeGNjbHh1WEhSVFJVeEZRMVJQVWw5VVNDeGNjbHh1WEhSVFJVeEZRMVJQVWw5VVJDeGNjbHh1WEhSVFJVeEZRMVJQVWw5VlRsSkZVMGxhUVVKTVJWeHlYRzU5WEhKY2JtWnliMjBnSnk0dlkyOXVjM1JoYm5Sekp6dGNjbHh1WEhKY2JpOHFLbHh5WEc1VVlXdGxjeUJoSUR4MFlXSnNaU0F2UGlCbGJHVnRaVzUwSUdGdVpDQnRZV3RsY3lCcGRDZHpJR052YkhWdGJuTWdjbVZ6YVhwaFlteGxJR0ZqY205emN5QmliM1JvWEhKY2JtMXZZbWxzWlNCaGJtUWdaR1Z6YTNSdmNDQmpiR2xsYm5SekxseHlYRzVjY2x4dVFHTnNZWE56SUZKbGMybDZZV0pzWlVOdmJIVnRibk5jY2x4dVFIQmhjbUZ0SUNSMFlXSnNaU0I3YWxGMVpYSjVmU0JxVVhWbGNua3RkM0poY0hCbFpDQThkR0ZpYkdVK0lHVnNaVzFsYm5RZ2RHOGdiV0ZyWlNCeVpYTnBlbUZpYkdWY2NseHVRSEJoY21GdElHOXdkR2x2Ym5NZ2UwOWlhbVZqZEgwZ1EyOXVabWxuZFhKaGRHbHZiaUJ2WW1wbFkzUmNjbHh1S2lvdlhISmNibVY0Y0c5eWRDQmtaV1poZFd4MElHTnNZWE56SUZKbGMybDZZV0pzWlVOdmJIVnRibk1nZTF4eVhHNWNkR052Ym5OMGNuVmpkRzl5S0NSMFlXSnNaU3dnYjNCMGFXOXVjeWtnZTF4eVhHNWNkRngwZEdocGN5NXVjeUE5SUNjdWNtTW5JQ3NnZEdocGN5NWpiM1Z1ZENzck8xeHlYRzVjY2x4dVhIUmNkSFJvYVhNdWIzQjBhVzl1Y3lBOUlDUXVaWGgwWlc1a0tIdDlMQ0JTWlhOcGVtRmliR1ZEYjJ4MWJXNXpMbVJsWm1GMWJIUnpMQ0J2Y0hScGIyNXpLVHRjY2x4dVhISmNibHgwWEhSMGFHbHpMaVIzYVc1a2IzY2dQU0FrS0hkcGJtUnZkeWs3WEhKY2JseDBYSFIwYUdsekxpUnZkMjVsY2tSdlkzVnRaVzUwSUQwZ0pDZ2tkR0ZpYkdWYk1GMHViM2R1WlhKRWIyTjFiV1Z1ZENrN1hISmNibHgwWEhSMGFHbHpMaVIwWVdKc1pTQTlJQ1IwWVdKc1pUdGNjbHh1WEhKY2JseDBYSFIwYUdsekxuSmxabkpsYzJoSVpXRmtaWEp6S0NrN1hISmNibHgwWEhSMGFHbHpMbkpsYzNSdmNtVkRiMngxYlc1WGFXUjBhSE1vS1R0Y2NseHVYSFJjZEhSb2FYTXVjM2x1WTBoaGJtUnNaVmRwWkhSb2N5Z3BPMXh5WEc1Y2NseHVYSFJjZEhSb2FYTXVZbWx1WkVWMlpXNTBjeWgwYUdsekxpUjNhVzVrYjNjc0lDZHlaWE5wZW1VbkxDQjBhR2x6TG5ONWJtTklZVzVrYkdWWGFXUjBhSE11WW1sdVpDaDBhR2x6S1NrN1hISmNibHh5WEc1Y2RGeDBhV1lnS0hSb2FYTXViM0IwYVc5dWN5NXpkR0Z5ZENrZ2UxeHlYRzVjZEZ4MFhIUjBhR2x6TG1KcGJtUkZkbVZ1ZEhNb2RHaHBjeTRrZEdGaWJHVXNJRVZXUlU1VVgxSkZVMGxhUlY5VFZFRlNWQ3dnZEdocGN5NXZjSFJwYjI1ekxuTjBZWEowS1R0Y2NseHVYSFJjZEgxY2NseHVYSFJjZEdsbUlDaDBhR2x6TG05d2RHbHZibk11Y21WemFYcGxLU0I3WEhKY2JseDBYSFJjZEhSb2FYTXVZbWx1WkVWMlpXNTBjeWgwYUdsekxpUjBZV0pzWlN3Z1JWWkZUbFJmVWtWVFNWcEZMQ0IwYUdsekxtOXdkR2x2Ym5NdWNtVnphWHBsS1R0Y2NseHVYSFJjZEgxY2NseHVYSFJjZEdsbUlDaDBhR2x6TG05d2RHbHZibk11YzNSdmNDa2dlMXh5WEc1Y2RGeDBYSFIwYUdsekxtSnBibVJGZG1WdWRITW9kR2hwY3k0a2RHRmliR1VzSUVWV1JVNVVYMUpGVTBsYVJWOVRWRTlRTENCMGFHbHpMbTl3ZEdsdmJuTXVjM1J2Y0NrN1hISmNibHgwWEhSOVhISmNibHgwZlZ4eVhHNWNjbHh1WEhRdktpcGNjbHh1WEhSU1pXWnlaWE5vWlhNZ2RHaGxJR2hsWVdSbGNuTWdZWE56YjJOcFlYUmxaQ0IzYVhSb0lIUm9hWE1nYVc1emRHRnVZMlZ6SUR4MFlXSnNaUzgrSUdWc1pXMWxiblFnWVc1a1hISmNibHgwWjJWdVpYSmhkR1Z6SUdoaGJtUnNaWE1nWm05eUlIUm9aVzB1SUVGc2MyOGdZWE56YVdkdWN5QndaWEpqWlc1MFlXZGxJSGRwWkhSb2N5NWNjbHh1WEhKY2JseDBRRzFsZEdodlpDQnlaV1p5WlhOb1NHVmhaR1Z5YzF4eVhHNWNkQ29xTDF4eVhHNWNkSEpsWm5KbGMyaElaV0ZrWlhKektDa2dlMXh5WEc1Y2RGeDBMeThnUVd4c2IzY2dkR2hsSUhObGJHVmpkRzl5SUhSdklHSmxJR0p2ZEdnZ1lTQnlaV2QxYkdGeUlITmxiR04wYjNJZ2MzUnlhVzVuSUdGeklIZGxiR3dnWVhOY2NseHVYSFJjZEM4dklHRWdaSGx1WVcxcFl5QmpZV3hzWW1GamExeHlYRzVjZEZ4MGJHVjBJSE5sYkdWamRHOXlJRDBnZEdocGN5NXZjSFJwYjI1ekxuTmxiR1ZqZEc5eU8xeHlYRzVjZEZ4MGFXWW9kSGx3Wlc5bUlITmxiR1ZqZEc5eUlEMDlQU0FuWm5WdVkzUnBiMjRuS1NCN1hISmNibHgwWEhSY2RITmxiR1ZqZEc5eUlEMGdjMlZzWldOMGIzSXVZMkZzYkNoMGFHbHpMQ0IwYUdsekxpUjBZV0pzWlNrN1hISmNibHgwWEhSOVhISmNibHh5WEc1Y2RGeDBMeThnVTJWc1pXTjBJR0ZzYkNCMFlXSnNaU0JvWldGa1pYSnpYSEpjYmx4MFhIUjBhR2x6TGlSMFlXSnNaVWhsWVdSbGNuTWdQU0IwYUdsekxpUjBZV0pzWlM1bWFXNWtLSE5sYkdWamRHOXlLVHRjY2x4dVhISmNibHgwWEhRdkx5QkJjM05wWjI0Z2NHVnlZMlZ1ZEdGblpTQjNhV1IwYUhNZ1ptbHljM1FzSUhSb1pXNGdZM0psWVhSbElHUnlZV2NnYUdGdVpHeGxjMXh5WEc1Y2RGeDBkR2hwY3k1aGMzTnBaMjVRWlhKalpXNTBZV2RsVjJsa2RHaHpLQ2s3WEhKY2JseDBYSFIwYUdsekxtTnlaV0YwWlVoaGJtUnNaWE1vS1R0Y2NseHVYSFI5WEhKY2JseHlYRzVjZEM4cUtseHlYRzVjZEVOeVpXRjBaWE1nWkhWdGJYa2dhR0Z1Wkd4bElHVnNaVzFsYm5SeklHWnZjaUJoYkd3Z2RHRmliR1VnYUdWaFpHVnlJR052YkhWdGJuTmNjbHh1WEhKY2JseDBRRzFsZEdodlpDQmpjbVZoZEdWSVlXNWtiR1Z6WEhKY2JseDBLaW92WEhKY2JseDBZM0psWVhSbFNHRnVaR3hsY3lncElIdGNjbHh1WEhSY2RHeGxkQ0J5WldZZ1BTQjBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWEk3WEhKY2JseDBYSFJwWmlBb2NtVm1JQ0U5SUc1MWJHd3BJSHRjY2x4dVhIUmNkRngwY21WbUxuSmxiVzkyWlNncE8xeHlYRzVjZEZ4MGZWeHlYRzVjY2x4dVhIUmNkSFJvYVhNdUpHaGhibVJzWlVOdmJuUmhhVzVsY2lBOUlDUW9ZRHhrYVhZZ1kyeGhjM005SnlSN1EweEJVMU5mU0VGT1JFeEZYME5QVGxSQlNVNUZVbjBuSUM4K1lDbGNjbHh1WEhSY2RIUm9hWE11SkhSaFlteGxMbUpsWm05eVpTaDBhR2x6TGlSb1lXNWtiR1ZEYjI1MFlXbHVaWElwTzF4eVhHNWNjbHh1WEhSY2RIUm9hWE11SkhSaFlteGxTR1ZoWkdWeWN5NWxZV05vS0NocExDQmxiQ2tnUFQ0Z2UxeHlYRzVjZEZ4MFhIUnNaWFFnSkdOMWNuSmxiblFnUFNCMGFHbHpMaVIwWVdKc1pVaGxZV1JsY25NdVpYRW9hU2s3WEhKY2JseDBYSFJjZEd4bGRDQWtibVY0ZENBOUlIUm9hWE11SkhSaFlteGxTR1ZoWkdWeWN5NWxjU2hwSUNzZ01TazdYSEpjYmx4eVhHNWNkRngwWEhScFppQW9KRzVsZUhRdWJHVnVaM1JvSUQwOVBTQXdJSHg4SUNSamRYSnlaVzUwTG1sektGTkZURVZEVkU5U1gxVk9Va1ZUU1ZwQlFreEZLU0I4ZkNBa2JtVjRkQzVwY3loVFJVeEZRMVJQVWw5VlRsSkZVMGxhUVVKTVJTa3BJSHRjY2x4dVhIUmNkRngwWEhSeVpYUjFjbTQ3WEhKY2JseDBYSFJjZEgxY2NseHVYSEpjYmx4MFhIUmNkR3hsZENBa2FHRnVaR3hsSUQwZ0pDaGdQR1JwZGlCamJHRnpjejBuSkh0RFRFRlRVMTlJUVU1RVRFVjlKeUF2UG1BcFhISmNibHgwWEhSY2RGeDBMbVJoZEdFb1JFRlVRVjlVU0N3Z0pDaGxiQ2twWEhKY2JseDBYSFJjZEZ4MExtRndjR1Z1WkZSdktIUm9hWE11SkdoaGJtUnNaVU52Ym5SaGFXNWxjaWs3WEhKY2JseDBYSFI5S1R0Y2NseHVYSEpjYmx4MFhIUjBhR2x6TG1KcGJtUkZkbVZ1ZEhNb2RHaHBjeTRrYUdGdVpHeGxRMjl1ZEdGcGJtVnlMQ0JiSjIxdmRYTmxaRzkzYmljc0lDZDBiM1ZqYUhOMFlYSjBKMTBzSUNjdUp5dERURUZUVTE5SVFVNUVURVVzSUhSb2FYTXViMjVRYjJsdWRHVnlSRzkzYmk1aWFXNWtLSFJvYVhNcEtUdGNjbHh1WEhSOVhISmNibHh5WEc1Y2RDOHFLbHh5WEc1Y2RFRnpjMmxuYm5NZ1lTQndaWEpqWlc1MFlXZGxJSGRwWkhSb0lIUnZJR0ZzYkNCamIyeDFiVzV6SUdKaGMyVmtJRzl1SUhSb1pXbHlJR04xY25KbGJuUWdjR2w0Wld3Z2QybGtkR2dvY3lsY2NseHVYSEpjYmx4MFFHMWxkR2h2WkNCaGMzTnBaMjVRWlhKalpXNTBZV2RsVjJsa2RHaHpYSEpjYmx4MEtpb3ZYSEpjYmx4MFlYTnphV2R1VUdWeVkyVnVkR0ZuWlZkcFpIUm9jeWdwSUh0Y2NseHVYSFJjZEhSb2FYTXVKSFJoWW14bFNHVmhaR1Z5Y3k1bFlXTm9LQ2hmTENCbGJDa2dQVDRnZTF4eVhHNWNkRngwWEhSc1pYUWdKR1ZzSUQwZ0pDaGxiQ2s3WEhKY2JseDBYSFJjZEhSb2FYTXVjMlYwVjJsa2RHZ29KR1ZzV3pCZExDQWtaV3d1YjNWMFpYSlhhV1IwYUNncElDOGdkR2hwY3k0a2RHRmliR1V1ZDJsa2RHZ29LU0FxSURFd01DazdYSEpjYmx4MFhIUjlLVHRjY2x4dVhIUjlYSEpjYmx4eVhHNWNkQzhxS2x4eVhHNWNjbHh1WEhKY2JseDBRRzFsZEdodlpDQnplVzVqU0dGdVpHeGxWMmxrZEdoelhISmNibHgwS2lvdlhISmNibHgwYzNsdVkwaGhibVJzWlZkcFpIUm9jeWdwSUh0Y2NseHVYSFJjZEd4bGRDQWtZMjl1ZEdGcGJtVnlJRDBnZEdocGN5NGthR0Z1Wkd4bFEyOXVkR0ZwYm1WeVhISmNibHh5WEc1Y2RGeDBKR052Ym5SaGFXNWxjaTUzYVdSMGFDaDBhR2x6TGlSMFlXSnNaUzUzYVdSMGFDZ3BLVHRjY2x4dVhISmNibHgwWEhRa1kyOXVkR0ZwYm1WeUxtWnBibVFvSnk0bkswTk1RVk5UWDBoQlRrUk1SU2t1WldGamFDZ29YeXdnWld3cElEMCtJSHRjY2x4dVhIUmNkRngwYkdWMElDUmxiQ0E5SUNRb1pXd3BPMXh5WEc1Y2NseHVYSFJjZEZ4MGJHVjBJR2hsYVdkb2RDQTlJSFJvYVhNdWIzQjBhVzl1Y3k1eVpYTnBlbVZHY205dFFtOWtlU0EvWEhKY2JseDBYSFJjZEZ4MGRHaHBjeTRrZEdGaWJHVXVhR1ZwWjJoMEtDa2dPbHh5WEc1Y2RGeDBYSFJjZEhSb2FYTXVKSFJoWW14bExtWnBibVFvSjNSb1pXRmtKeWt1YUdWcFoyaDBLQ2s3WEhKY2JseHlYRzVjZEZ4MFhIUnNaWFFnYkdWbWRDQTlJQ1JsYkM1a1lYUmhLRVJCVkVGZlZFZ3BMbTkxZEdWeVYybGtkR2dvS1NBcklDaGNjbHh1WEhSY2RGeDBYSFFrWld3dVpHRjBZU2hFUVZSQlgxUklLUzV2Wm1aelpYUW9LUzVzWldaMElDMGdkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5TG05bVpuTmxkQ2dwTG14bFpuUmNjbHh1WEhSY2RGeDBLVHRjY2x4dVhISmNibHgwWEhSY2RDUmxiQzVqYzNNb2V5QnNaV1owTENCb1pXbG5hSFFnZlNrN1hISmNibHgwWEhSOUtUdGNjbHh1WEhSOVhISmNibHh5WEc1Y2RDOHFLbHh5WEc1Y2RGQmxjbk5wYzNSeklIUm9aU0JqYjJ4MWJXNGdkMmxrZEdoeklHbHVJR3h2WTJGc1UzUnZjbUZuWlZ4eVhHNWNjbHh1WEhSQWJXVjBhRzlrSUhOaGRtVkRiMngxYlc1WGFXUjBhSE5jY2x4dVhIUXFLaTljY2x4dVhIUnpZWFpsUTI5c2RXMXVWMmxrZEdoektDa2dlMXh5WEc1Y2RGeDBkR2hwY3k0a2RHRmliR1ZJWldGa1pYSnpMbVZoWTJnb0tGOHNJR1ZzS1NBOVBpQjdYSEpjYmx4MFhIUmNkR3hsZENBa1pXd2dQU0FrS0dWc0tUdGNjbHh1WEhKY2JseDBYSFJjZEdsbUlDaDBhR2x6TG05d2RHbHZibk11YzNSdmNtVWdKaVlnSVNSbGJDNXBjeWhUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrcElIdGNjbHh1WEhSY2RGeDBYSFIwYUdsekxtOXdkR2x2Ym5NdWMzUnZjbVV1YzJWMEtGeHlYRzVjZEZ4MFhIUmNkRngwZEdocGN5NW5aVzVsY21GMFpVTnZiSFZ0Ymtsa0tDUmxiQ2tzWEhKY2JseDBYSFJjZEZ4MFhIUjBhR2x6TG5CaGNuTmxWMmxrZEdnb1pXd3BYSEpjYmx4MFhIUmNkRngwS1R0Y2NseHVYSFJjZEZ4MGZWeHlYRzVjZEZ4MGZTazdYSEpjYmx4MGZWeHlYRzVjY2x4dVhIUXZLaXBjY2x4dVhIUlNaWFJ5YVdWMlpYTWdZVzVrSUhObGRITWdkR2hsSUdOdmJIVnRiaUIzYVdSMGFITWdabkp2YlNCc2IyTmhiRk4wYjNKaFoyVmNjbHh1WEhKY2JseDBRRzFsZEdodlpDQnlaWE4wYjNKbFEyOXNkVzF1VjJsa2RHaHpYSEpjYmx4MEtpb3ZYSEpjYmx4MGNtVnpkRzl5WlVOdmJIVnRibGRwWkhSb2N5Z3BJSHRjY2x4dVhIUmNkSFJvYVhNdUpIUmhZbXhsU0dWaFpHVnljeTVsWVdOb0tDaGZMQ0JsYkNrZ1BUNGdlMXh5WEc1Y2RGeDBYSFJzWlhRZ0pHVnNJRDBnSkNobGJDazdYSEpjYmx4eVhHNWNkRngwWEhScFppaDBhR2x6TG05d2RHbHZibk11YzNSdmNtVWdKaVlnSVNSbGJDNXBjeWhUUlV4RlExUlBVbDlWVGxKRlUwbGFRVUpNUlNrcElIdGNjbHh1WEhSY2RGeDBYSFJzWlhRZ2QybGtkR2dnUFNCMGFHbHpMbTl3ZEdsdmJuTXVjM1J2Y21VdVoyVjBLRnh5WEc1Y2RGeDBYSFJjZEZ4MGRHaHBjeTVuWlc1bGNtRjBaVU52YkhWdGJrbGtLQ1JsYkNsY2NseHVYSFJjZEZ4MFhIUXBPMXh5WEc1Y2NseHVYSFJjZEZ4MFhIUnBaaWgzYVdSMGFDQWhQU0J1ZFd4c0tTQjdYSEpjYmx4MFhIUmNkRngwWEhSMGFHbHpMbk5sZEZkcFpIUm9LR1ZzTENCM2FXUjBhQ2s3WEhKY2JseDBYSFJjZEZ4MGZWeHlYRzVjZEZ4MFhIUjlYSEpjYmx4MFhIUjlLVHRjY2x4dVhIUjlYSEpjYmx4eVhHNWNkQzhxS2x4eVhHNWNkRkJ2YVc1MFpYSXZiVzkxYzJVZ1pHOTNiaUJvWVc1a2JHVnlYSEpjYmx4eVhHNWNkRUJ0WlhSb2IyUWdiMjVRYjJsdWRHVnlSRzkzYmx4eVhHNWNkRUJ3WVhKaGJTQmxkbVZ1ZENCN1QySnFaV04wZlNCRmRtVnVkQ0J2WW1wbFkzUWdZWE56YjJOcFlYUmxaQ0IzYVhSb0lIUm9aU0JwYm5SbGNtRmpkR2x2Ymx4eVhHNWNkQ29xTDF4eVhHNWNkRzl1VUc5cGJuUmxja1J2ZDI0b1pYWmxiblFwSUh0Y2NseHVYSEpjYmx4MFhIUXZMeUJKWmlCaElIQnlaWFpwYjNWeklHOXdaWEpoZEdsdmJpQnBjeUJrWldacGJtVmtMQ0IzWlNCdGFYTnpaV1FnZEdobElHeGhjM1FnYlc5MWMyVjFjQzVjY2x4dVhIUmNkQzh2SUZCeWIySmhZbXg1SUdkdlltSnNaV1FnZFhBZ1lua2dkWE5sY2lCdGIzVnphVzVuSUc5MWRDQjBhR1VnZDJsdVpHOTNJSFJvWlc0Z2NtVnNaV0Z6YVc1bkxseHlYRzVjZEZ4MEx5OGdWMlVuYkd3Z2MybHRkV3hoZEdVZ1lTQndiMmx1ZEdWeWRYQWdhR1Z5WlNCd2NtbHZjaUIwYnlCcGRGeHlYRzVjZEZ4MGFXWW9kR2hwY3k1dmNHVnlZWFJwYjI0cElIdGNjbHh1WEhSY2RGeDBkR2hwY3k1dmJsQnZhVzUwWlhKVmNDaGxkbVZ1ZENrN1hISmNibHgwWEhSOVhISmNibHh5WEc1Y2RGeDBMeThnU1dkdWIzSmxJRzV2YmkxeVpYTnBlbUZpYkdVZ1kyOXNkVzF1YzF4eVhHNWNkRngwYkdWMElDUmpkWEp5Wlc1MFIzSnBjQ0E5SUNRb1pYWmxiblF1WTNWeWNtVnVkRlJoY21kbGRDazdYSEpjYmx4MFhIUnBaaWdrWTNWeWNtVnVkRWR5YVhBdWFYTW9VMFZNUlVOVVQxSmZWVTVTUlZOSldrRkNURVVwS1NCN1hISmNibHgwWEhSY2RISmxkSFZ5Ymp0Y2NseHVYSFJjZEgxY2NseHVYSEpjYmx4MFhIUnNaWFFnWjNKcGNFbHVaR1Y0SUQwZ0pHTjFjbkpsYm5SSGNtbHdMbWx1WkdWNEtDazdYSEpjYmx4MFhIUnNaWFFnSkd4bFpuUkRiMngxYlc0Z1BTQjBhR2x6TGlSMFlXSnNaVWhsWVdSbGNuTXVaWEVvWjNKcGNFbHVaR1Y0S1M1dWIzUW9VMFZNUlVOVVQxSmZWVTVTUlZOSldrRkNURVVwTzF4eVhHNWNkRngwYkdWMElDUnlhV2RvZEVOdmJIVnRiaUE5SUhSb2FYTXVKSFJoWW14bFNHVmhaR1Z5Y3k1bGNTaG5jbWx3U1c1a1pYZ2dLeUF4S1M1dWIzUW9VMFZNUlVOVVQxSmZWVTVTUlZOSldrRkNURVVwTzF4eVhHNWNjbHh1WEhSY2RHeGxkQ0JzWldaMFYybGtkR2dnUFNCMGFHbHpMbkJoY25ObFYybGtkR2dvSkd4bFpuUkRiMngxYlc1Yk1GMHBPMXh5WEc1Y2RGeDBiR1YwSUhKcFoyaDBWMmxrZEdnZ1BTQjBhR2x6TG5CaGNuTmxWMmxrZEdnb0pISnBaMmgwUTI5c2RXMXVXekJkS1R0Y2NseHVYSEpjYmx4MFhIUjBhR2x6TG05d1pYSmhkR2x2YmlBOUlIdGNjbHh1WEhSY2RGeDBKR3hsWm5SRGIyeDFiVzRzSUNSeWFXZG9kRU52YkhWdGJpd2dKR04xY25KbGJuUkhjbWx3TEZ4eVhHNWNjbHh1WEhSY2RGeDBjM1JoY25SWU9pQjBhR2x6TG1kbGRGQnZhVzUwWlhKWUtHVjJaVzUwS1N4Y2NseHVYSEpjYmx4MFhIUmNkSGRwWkhSb2N6b2dlMXh5WEc1Y2RGeDBYSFJjZEd4bFpuUTZJR3hsWm5SWGFXUjBhQ3hjY2x4dVhIUmNkRngwWEhSeWFXZG9kRG9nY21sbmFIUlhhV1IwYUZ4eVhHNWNkRngwWEhSOUxGeHlYRzVjZEZ4MFhIUnVaWGRYYVdSMGFITTZJSHRjY2x4dVhIUmNkRngwWEhSc1pXWjBPaUJzWldaMFYybGtkR2dzWEhKY2JseDBYSFJjZEZ4MGNtbG5hSFE2SUhKcFoyaDBWMmxrZEdoY2NseHVYSFJjZEZ4MGZWeHlYRzVjZEZ4MGZUdGNjbHh1WEhKY2JseDBYSFIwYUdsekxtSnBibVJGZG1WdWRITW9kR2hwY3k0a2IzZHVaWEpFYjJOMWJXVnVkQ3dnV3lkdGIzVnpaVzF2ZG1VbkxDQW5kRzkxWTJodGIzWmxKMTBzSUhSb2FYTXViMjVRYjJsdWRHVnlUVzkyWlM1aWFXNWtLSFJvYVhNcEtUdGNjbHh1WEhSY2RIUm9hWE11WW1sdVpFVjJaVzUwY3loMGFHbHpMaVJ2ZDI1bGNrUnZZM1Z0Wlc1MExDQmJKMjF2ZFhObGRYQW5MQ0FuZEc5MVkyaGxibVFuWFN3Z2RHaHBjeTV2YmxCdmFXNTBaWEpWY0M1aWFXNWtLSFJvYVhNcEtUdGNjbHh1WEhKY2JseDBYSFIwYUdsekxpUm9ZVzVrYkdWRGIyNTBZV2x1WlhKY2NseHVYSFJjZEZ4MExtRmtaQ2gwYUdsekxpUjBZV0pzWlNsY2NseHVYSFJjZEZ4MExtRmtaRU5zWVhOektFTk1RVk5UWDFSQlFreEZYMUpGVTBsYVNVNUhLVHRjY2x4dVhISmNibHgwWEhRa2JHVm1kRU52YkhWdGJseHlYRzVjZEZ4MFhIUXVZV1JrS0NSeWFXZG9kRU52YkhWdGJpbGNjbHh1WEhSY2RGeDBMbUZrWkNna1kzVnljbVZ1ZEVkeWFYQXBYSEpjYmx4MFhIUmNkQzVoWkdSRGJHRnpjeWhEVEVGVFUxOURUMHhWVFU1ZlVrVlRTVnBKVGtjcE8xeHlYRzVjY2x4dVhIUmNkSFJvYVhNdWRISnBaMmRsY2tWMlpXNTBLRVZXUlU1VVgxSkZVMGxhUlY5VFZFRlNWQ3dnVzF4eVhHNWNkRngwWEhRa2JHVm1kRU52YkhWdGJpd2dKSEpwWjJoMFEyOXNkVzF1TEZ4eVhHNWNkRngwWEhSc1pXWjBWMmxrZEdnc0lISnBaMmgwVjJsa2RHaGNjbHh1WEhSY2RGMHNYSEpjYmx4MFhIUmxkbVZ1ZENrN1hISmNibHh5WEc1Y2RGeDBaWFpsYm5RdWNISmxkbVZ1ZEVSbFptRjFiSFFvS1R0Y2NseHVYSFI5WEhKY2JseHlYRzVjZEM4cUtseHlYRzVjZEZCdmFXNTBaWEl2Ylc5MWMyVWdiVzkyWlcxbGJuUWdhR0Z1Wkd4bGNseHlYRzVjY2x4dVhIUkFiV1YwYUc5a0lHOXVVRzlwYm5SbGNrMXZkbVZjY2x4dVhIUkFjR0Z5WVcwZ1pYWmxiblFnZTA5aWFtVmpkSDBnUlhabGJuUWdiMkpxWldOMElHRnpjMjlqYVdGMFpXUWdkMmwwYUNCMGFHVWdhVzUwWlhKaFkzUnBiMjVjY2x4dVhIUXFLaTljY2x4dVhIUnZibEJ2YVc1MFpYSk5iM1psS0dWMlpXNTBLU0I3WEhKY2JseDBYSFJzWlhRZ2IzQWdQU0IwYUdsekxtOXdaWEpoZEdsdmJqdGNjbHh1WEhSY2RHbG1LQ0YwYUdsekxtOXdaWEpoZEdsdmJpa2dleUJ5WlhSMWNtNDdJSDFjY2x4dVhISmNibHgwWEhRdkx5QkVaWFJsY20xcGJtVWdkR2hsSUdSbGJIUmhJR05vWVc1blpTQmlaWFIzWldWdUlITjBZWEowSUdGdVpDQnVaWGNnYlc5MWMyVWdjRzl6YVhScGIyNHNJR0Z6SUdFZ2NHVnlZMlZ1ZEdGblpTQnZaaUIwYUdVZ2RHRmliR1VnZDJsa2RHaGNjbHh1WEhSY2RHeGxkQ0JrYVdabVpYSmxibU5sSUQwZ0tIUm9hWE11WjJWMFVHOXBiblJsY2xnb1pYWmxiblFwSUMwZ2IzQXVjM1JoY25SWUtTQXZJSFJvYVhNdUpIUmhZbXhsTG5kcFpIUm9LQ2tnS2lBeE1EQTdYSEpjYmx4MFhIUnBaaWhrYVdabVpYSmxibU5sSUQwOVBTQXdLU0I3WEhKY2JseDBYSFJjZEhKbGRIVnlianRjY2x4dVhIUmNkSDFjY2x4dVhISmNibHgwWEhSc1pYUWdiR1ZtZEVOdmJIVnRiaUE5SUc5d0xpUnNaV1owUTI5c2RXMXVXekJkTzF4eVhHNWNkRngwYkdWMElISnBaMmgwUTI5c2RXMXVJRDBnYjNBdUpISnBaMmgwUTI5c2RXMXVXekJkTzF4eVhHNWNkRngwYkdWMElIZHBaSFJvVEdWbWRDd2dkMmxrZEdoU2FXZG9kRHRjY2x4dVhISmNibHgwWEhScFppaGthV1ptWlhKbGJtTmxJRDRnTUNrZ2UxeHlYRzVjZEZ4MFhIUjNhV1IwYUV4bFpuUWdQU0IwYUdsekxtTnZibk4wY21GcGJsZHBaSFJvS0c5d0xuZHBaSFJvY3k1c1pXWjBJQ3NnS0c5d0xuZHBaSFJvY3k1eWFXZG9kQ0F0SUc5d0xtNWxkMWRwWkhSb2N5NXlhV2RvZENrcE8xeHlYRzVjZEZ4MFhIUjNhV1IwYUZKcFoyaDBJRDBnZEdocGN5NWpiMjV6ZEhKaGFXNVhhV1IwYUNodmNDNTNhV1IwYUhNdWNtbG5hSFFnTFNCa2FXWm1aWEpsYm1ObEtUdGNjbHh1WEhSY2RIMWNjbHh1WEhSY2RHVnNjMlVnYVdZb1pHbG1abVZ5Wlc1alpTQThJREFwSUh0Y2NseHVYSFJjZEZ4MGQybGtkR2hNWldaMElEMGdkR2hwY3k1amIyNXpkSEpoYVc1WGFXUjBhQ2h2Y0M1M2FXUjBhSE11YkdWbWRDQXJJR1JwWm1abGNtVnVZMlVwTzF4eVhHNWNkRngwWEhSM2FXUjBhRkpwWjJoMElEMGdkR2hwY3k1amIyNXpkSEpoYVc1WGFXUjBhQ2h2Y0M1M2FXUjBhSE11Y21sbmFIUWdLeUFvYjNBdWQybGtkR2h6TG14bFpuUWdMU0J2Y0M1dVpYZFhhV1IwYUhNdWJHVm1kQ2twTzF4eVhHNWNkRngwZlZ4eVhHNWNjbHh1WEhSY2RHbG1LR3hsWm5SRGIyeDFiVzRwSUh0Y2NseHVYSFJjZEZ4MGRHaHBjeTV6WlhSWGFXUjBhQ2hzWldaMFEyOXNkVzF1TENCM2FXUjBhRXhsWm5RcE8xeHlYRzVjZEZ4MGZWeHlYRzVjZEZ4MGFXWW9jbWxuYUhSRGIyeDFiVzRwSUh0Y2NseHVYSFJjZEZ4MGRHaHBjeTV6WlhSWGFXUjBhQ2h5YVdkb2RFTnZiSFZ0Yml3Z2QybGtkR2hTYVdkb2RDazdYSEpjYmx4MFhIUjlYSEpjYmx4eVhHNWNkRngwYjNBdWJtVjNWMmxrZEdoekxteGxablFnUFNCM2FXUjBhRXhsWm5RN1hISmNibHgwWEhSdmNDNXVaWGRYYVdSMGFITXVjbWxuYUhRZ1BTQjNhV1IwYUZKcFoyaDBPMXh5WEc1Y2NseHVYSFJjZEhKbGRIVnliaUIwYUdsekxuUnlhV2RuWlhKRmRtVnVkQ2hGVmtWT1ZGOVNSVk5KV2tVc0lGdGNjbHh1WEhSY2RGeDBiM0F1Skd4bFpuUkRiMngxYlc0c0lHOXdMaVJ5YVdkb2RFTnZiSFZ0Yml4Y2NseHVYSFJjZEZ4MGQybGtkR2hNWldaMExDQjNhV1IwYUZKcFoyaDBYSEpjYmx4MFhIUmRMRnh5WEc1Y2RGeDBaWFpsYm5RcE8xeHlYRzVjZEgxY2NseHVYSEpjYmx4MEx5b3FYSEpjYmx4MFVHOXBiblJsY2k5dGIzVnpaU0J5Wld4bFlYTmxJR2hoYm1Sc1pYSmNjbHh1WEhKY2JseDBRRzFsZEdodlpDQnZibEJ2YVc1MFpYSlZjRnh5WEc1Y2RFQndZWEpoYlNCbGRtVnVkQ0I3VDJKcVpXTjBmU0JGZG1WdWRDQnZZbXBsWTNRZ1lYTnpiMk5wWVhSbFpDQjNhWFJvSUhSb1pTQnBiblJsY21GamRHbHZibHh5WEc1Y2RDb3FMMXh5WEc1Y2RHOXVVRzlwYm5SbGNsVndLR1YyWlc1MEtTQjdYSEpjYmx4MFhIUnNaWFFnYjNBZ1BTQjBhR2x6TG05d1pYSmhkR2x2Ymp0Y2NseHVYSFJjZEdsbUtDRjBhR2x6TG05d1pYSmhkR2x2YmlrZ2V5QnlaWFIxY200N0lIMWNjbHh1WEhKY2JseDBYSFIwYUdsekxuVnVZbWx1WkVWMlpXNTBjeWgwYUdsekxpUnZkMjVsY2tSdlkzVnRaVzUwTENCYkoyMXZkWE5sZFhBbkxDQW5kRzkxWTJobGJtUW5MQ0FuYlc5MWMyVnRiM1psSnl3Z0ozUnZkV05vYlc5MlpTZGRLVHRjY2x4dVhISmNibHgwWEhSMGFHbHpMaVJvWVc1a2JHVkRiMjUwWVdsdVpYSmNjbHh1WEhSY2RGeDBMbUZrWkNoMGFHbHpMaVIwWVdKc1pTbGNjbHh1WEhSY2RGeDBMbkpsYlc5MlpVTnNZWE56S0VOTVFWTlRYMVJCUWt4RlgxSkZVMGxhU1U1SEtUdGNjbHh1WEhKY2JseDBYSFJ2Y0M0a2JHVm1kRU52YkhWdGJseHlYRzVjZEZ4MFhIUXVZV1JrS0c5d0xpUnlhV2RvZEVOdmJIVnRiaWxjY2x4dVhIUmNkRngwTG1Ga1pDaHZjQzRrWTNWeWNtVnVkRWR5YVhBcFhISmNibHgwWEhSY2RDNXlaVzF2ZG1WRGJHRnpjeWhEVEVGVFUxOURUMHhWVFU1ZlVrVlRTVnBKVGtjcE8xeHlYRzVjY2x4dVhIUmNkSFJvYVhNdWMzbHVZMGhoYm1Sc1pWZHBaSFJvY3lncE8xeHlYRzVjZEZ4MGRHaHBjeTV6WVhabFEyOXNkVzF1VjJsa2RHaHpLQ2s3WEhKY2JseHlYRzVjZEZ4MGRHaHBjeTV2Y0dWeVlYUnBiMjRnUFNCdWRXeHNPMXh5WEc1Y2NseHVYSFJjZEhKbGRIVnliaUIwYUdsekxuUnlhV2RuWlhKRmRtVnVkQ2hGVmtWT1ZGOVNSVk5KV2tWZlUxUlBVQ3dnVzF4eVhHNWNkRngwWEhSdmNDNGtiR1ZtZEVOdmJIVnRiaXdnYjNBdUpISnBaMmgwUTI5c2RXMXVMRnh5WEc1Y2RGeDBYSFJ2Y0M1dVpYZFhhV1IwYUhNdWJHVm1kQ3dnYjNBdWJtVjNWMmxrZEdoekxuSnBaMmgwWEhKY2JseDBYSFJkTEZ4eVhHNWNkRngwWlhabGJuUXBPMXh5WEc1Y2RIMWNjbHh1WEhKY2JseDBMeW9xWEhKY2JseDBVbVZ0YjNabGN5QmhiR3dnWlhabGJuUWdiR2x6ZEdWdVpYSnpMQ0JrWVhSaExDQmhibVFnWVdSa1pXUWdSRTlOSUdWc1pXMWxiblJ6TGlCVVlXdGxjMXh5WEc1Y2RIUm9aU0E4ZEdGaWJHVXZQaUJsYkdWdFpXNTBJR0poWTJzZ2RHOGdhRzkzSUdsMElIZGhjeXdnWVc1a0lISmxkSFZ5Ym5NZ2FYUmNjbHh1WEhKY2JseDBRRzFsZEdodlpDQmtaWE4wY205NVhISmNibHgwUUhKbGRIVnliaUI3YWxGMVpYSjVmU0JQY21sbmFXNWhiQ0JxVVhWbGNua3RkM0poY0hCbFpDQThkR0ZpYkdVK0lHVnNaVzFsYm5SY2NseHVYSFFxS2k5Y2NseHVYSFJrWlhOMGNtOTVLQ2tnZTF4eVhHNWNkRngwYkdWMElDUjBZV0pzWlNBOUlIUm9hWE11SkhSaFlteGxPMXh5WEc1Y2RGeDBiR1YwSUNSb1lXNWtiR1Z6SUQwZ2RHaHBjeTRrYUdGdVpHeGxRMjl1ZEdGcGJtVnlMbVpwYm1Rb0p5NG5LME5NUVZOVFgwaEJUa1JNUlNrN1hISmNibHh5WEc1Y2RGeDBkR2hwY3k1MWJtSnBibVJGZG1WdWRITW9YSEpjYmx4MFhIUmNkSFJvYVhNdUpIZHBibVJ2ZDF4eVhHNWNkRngwWEhSY2RDNWhaR1FvZEdocGN5NGtiM2R1WlhKRWIyTjFiV1Z1ZENsY2NseHVYSFJjZEZ4MFhIUXVZV1JrS0hSb2FYTXVKSFJoWW14bEtWeHlYRzVjZEZ4MFhIUmNkQzVoWkdRb0pHaGhibVJzWlhNcFhISmNibHgwWEhRcE8xeHlYRzVjY2x4dVhIUmNkQ1JvWVc1a2JHVnpMbkpsYlc5MlpVUmhkR0VvUkVGVVFWOVVTQ2s3WEhKY2JseDBYSFFrZEdGaWJHVXVjbVZ0YjNabFJHRjBZU2hFUVZSQlgwRlFTU2s3WEhKY2JseHlYRzVjZEZ4MGRHaHBjeTRrYUdGdVpHeGxRMjl1ZEdGcGJtVnlMbkpsYlc5MlpTZ3BPMXh5WEc1Y2RGeDBkR2hwY3k0a2FHRnVaR3hsUTI5dWRHRnBibVZ5SUQwZ2JuVnNiRHRjY2x4dVhIUmNkSFJvYVhNdUpIUmhZbXhsU0dWaFpHVnljeUE5SUc1MWJHdzdYSEpjYmx4MFhIUjBhR2x6TGlSMFlXSnNaU0E5SUc1MWJHdzdYSEpjYmx4eVhHNWNkRngwY21WMGRYSnVJQ1IwWVdKc1pUdGNjbHh1WEhSOVhISmNibHh5WEc1Y2RDOHFLbHh5WEc1Y2RFSnBibVJ6SUdkcGRtVnVJR1YyWlc1MGN5Qm1iM0lnZEdocGN5QnBibk4wWVc1alpTQjBieUIwYUdVZ1oybDJaVzRnZEdGeVoyVjBJRVJQVFVWc1pXMWxiblJjY2x4dVhISmNibHgwUUhCeWFYWmhkR1ZjY2x4dVhIUkFiV1YwYUc5a0lHSnBibVJGZG1WdWRITmNjbHh1WEhSQWNHRnlZVzBnZEdGeVoyVjBJSHRxVVhWbGNubDlJR3BSZFdWeWVTMTNjbUZ3Y0dWa0lFUlBUVVZzWlcxbGJuUWdkRzhnWW1sdVpDQmxkbVZ1ZEhNZ2RHOWNjbHh1WEhSQWNHRnlZVzBnWlhabGJuUnpJSHRUZEhKcGJtZDhRWEp5WVhsOUlFVjJaVzUwSUc1aGJXVWdLRzl5SUdGeWNtRjVJRzltS1NCMGJ5QmlhVzVrWEhKY2JseDBRSEJoY21GdElITmxiR1ZqZEc5eVQzSkRZV3hzWW1GamF5QjdVM1J5YVc1bmZFWjFibU4wYVc5dWZTQlRaV3hsWTNSdmNpQnpkSEpwYm1jZ2IzSWdZMkZzYkdKaFkydGNjbHh1WEhSQWNHRnlZVzBnVzJOaGJHeGlZV05yWFNCN1JuVnVZM1JwYjI1OUlFTmhiR3hpWVdOcklHMWxkR2h2WkZ4eVhHNWNkQ29xTDF4eVhHNWNkR0pwYm1SRmRtVnVkSE1vSkhSaGNtZGxkQ3dnWlhabGJuUnpMQ0J6Wld4bFkzUnZjazl5UTJGc2JHSmhZMnNzSUdOaGJHeGlZV05yS1NCN1hISmNibHgwWEhScFppaDBlWEJsYjJZZ1pYWmxiblJ6SUQwOVBTQW5jM1J5YVc1bkp5a2dlMXh5WEc1Y2RGeDBYSFJsZG1WdWRITWdQU0JsZG1WdWRITWdLeUIwYUdsekxtNXpPMXh5WEc1Y2RGeDBmVnh5WEc1Y2RGeDBaV3h6WlNCN1hISmNibHgwWEhSY2RHVjJaVzUwY3lBOUlHVjJaVzUwY3k1cWIybHVLSFJvYVhNdWJuTWdLeUFuSUNjcElDc2dkR2hwY3k1dWN6dGNjbHh1WEhSY2RIMWNjbHh1WEhKY2JseDBYSFJwWmloaGNtZDFiV1Z1ZEhNdWJHVnVaM1JvSUQ0Z015a2dlMXh5WEc1Y2RGeDBYSFFrZEdGeVoyVjBMbTl1S0dWMlpXNTBjeXdnYzJWc1pXTjBiM0pQY2tOaGJHeGlZV05yTENCallXeHNZbUZqYXlrN1hISmNibHgwWEhSOVhISmNibHgwWEhSbGJITmxJSHRjY2x4dVhIUmNkRngwSkhSaGNtZGxkQzV2YmlobGRtVnVkSE1zSUhObGJHVmpkRzl5VDNKRFlXeHNZbUZqYXlrN1hISmNibHgwWEhSOVhISmNibHgwZlZ4eVhHNWNjbHh1WEhRdktpcGNjbHh1WEhSVmJtSnBibVJ6SUdWMlpXNTBjeUJ6Y0dWamFXWnBZeUIwYnlCMGFHbHpJR2x1YzNSaGJtTmxJR1p5YjIwZ2RHaGxJR2RwZG1WdUlIUmhjbWRsZENCRVQwMUZiR1Z0Wlc1MFhISmNibHh5WEc1Y2RFQndjbWwyWVhSbFhISmNibHgwUUcxbGRHaHZaQ0IxYm1KcGJtUkZkbVZ1ZEhOY2NseHVYSFJBY0dGeVlXMGdkR0Z5WjJWMElIdHFVWFZsY25sOUlHcFJkV1Z5ZVMxM2NtRndjR1ZrSUVSUFRVVnNaVzFsYm5RZ2RHOGdkVzVpYVc1a0lHVjJaVzUwY3lCbWNtOXRYSEpjYmx4MFFIQmhjbUZ0SUdWMlpXNTBjeUI3VTNSeWFXNW5mRUZ5Y21GNWZTQkZkbVZ1ZENCdVlXMWxJQ2h2Y2lCaGNuSmhlU0J2WmlrZ2RHOGdkVzVpYVc1a1hISmNibHgwS2lvdlhISmNibHgwZFc1aWFXNWtSWFpsYm5SektDUjBZWEpuWlhRc0lHVjJaVzUwY3lrZ2UxeHlYRzVjZEZ4MGFXWW9kSGx3Wlc5bUlHVjJaVzUwY3lBOVBUMGdKM04wY21sdVp5Y3BJSHRjY2x4dVhIUmNkRngwWlhabGJuUnpJRDBnWlhabGJuUnpJQ3NnZEdocGN5NXVjenRjY2x4dVhIUmNkSDFjY2x4dVhIUmNkR1ZzYzJVZ2FXWW9aWFpsYm5SeklDRTlJRzUxYkd3cElIdGNjbHh1WEhSY2RGeDBaWFpsYm5SeklEMGdaWFpsYm5SekxtcHZhVzRvZEdocGN5NXVjeUFySUNjZ0p5a2dLeUIwYUdsekxtNXpPMXh5WEc1Y2RGeDBmVnh5WEc1Y2RGeDBaV3h6WlNCN1hISmNibHgwWEhSY2RHVjJaVzUwY3lBOUlIUm9hWE11Ym5NN1hISmNibHgwWEhSOVhISmNibHh5WEc1Y2RGeDBKSFJoY21kbGRDNXZabVlvWlhabGJuUnpLVHRjY2x4dVhIUjlYSEpjYmx4eVhHNWNkQzhxS2x4eVhHNWNkRlJ5YVdkblpYSnpJR0Z1SUdWMlpXNTBJRzl1SUhSb1pTQThkR0ZpYkdVdlBpQmxiR1Z0Wlc1MElHWnZjaUJoSUdkcGRtVnVJSFI1Y0dVZ2QybDBhQ0JuYVhabGJseHlYRzVjZEdGeVozVnRaVzUwY3l3Z1lXeHpieUJ6WlhSMGFXNW5JR0Z1WkNCaGJHeHZkMmx1WnlCaFkyTmxjM01nZEc4Z2RHaGxJRzl5YVdkcGJtRnNSWFpsYm5RZ2FXWmNjbHh1WEhSbmFYWmxiaTRnVW1WMGRYSnVjeUIwYUdVZ2NtVnpkV3gwSUc5bUlIUm9aU0IwY21sbloyVnlaV1FnWlhabGJuUXVYSEpjYmx4eVhHNWNkRUJ3Y21sMllYUmxYSEpjYmx4MFFHMWxkR2h2WkNCMGNtbG5aMlZ5UlhabGJuUmNjbHh1WEhSQWNHRnlZVzBnZEhsd1pTQjdVM1J5YVc1bmZTQkZkbVZ1ZENCdVlXMWxYSEpjYmx4MFFIQmhjbUZ0SUdGeVozTWdlMEZ5Y21GNWZTQkJjbkpoZVNCdlppQmhjbWQxYldWdWRITWdkRzhnY0dGemN5QjBhSEp2ZFdkb1hISmNibHgwUUhCaGNtRnRJRnR2Y21sbmFXNWhiRVYyWlc1MFhTQkpaaUJuYVhabGJpd2dhWE1nYzJWMElHOXVJSFJvWlNCbGRtVnVkQ0J2WW1wbFkzUmNjbHh1WEhSQWNtVjBkWEp1SUh0TmFYaGxaSDBnVW1WemRXeDBJRzltSUhSb1pTQmxkbVZ1ZENCMGNtbG5aMlZ5SUdGamRHbHZibHh5WEc1Y2RDb3FMMXh5WEc1Y2RIUnlhV2RuWlhKRmRtVnVkQ2gwZVhCbExDQmhjbWR6TENCdmNtbG5hVzVoYkVWMlpXNTBLU0I3WEhKY2JseDBYSFJzWlhRZ1pYWmxiblFnUFNBa0xrVjJaVzUwS0hSNWNHVXBPMXh5WEc1Y2RGeDBhV1lvWlhabGJuUXViM0pwWjJsdVlXeEZkbVZ1ZENrZ2UxeHlYRzVjZEZ4MFhIUmxkbVZ1ZEM1dmNtbG5hVzVoYkVWMlpXNTBJRDBnSkM1bGVIUmxibVFvZTMwc0lHOXlhV2RwYm1Gc1JYWmxiblFwTzF4eVhHNWNkRngwZlZ4eVhHNWNjbHh1WEhSY2RISmxkSFZ5YmlCMGFHbHpMaVIwWVdKc1pTNTBjbWxuWjJWeUtHVjJaVzUwTENCYmRHaHBjMTB1WTI5dVkyRjBLR0Z5WjNNZ2ZId2dXMTBwS1R0Y2NseHVYSFI5WEhKY2JseHlYRzVjZEM4cUtseHlYRzVjZEVOaGJHTjFiR0YwWlhNZ1lTQjFibWx4ZFdVZ1kyOXNkVzF1SUVsRUlHWnZjaUJoSUdkcGRtVnVJR052YkhWdGJpQkVUMDFGYkdWdFpXNTBYSEpjYmx4eVhHNWNkRUJ3Y21sMllYUmxYSEpjYmx4MFFHMWxkR2h2WkNCblpXNWxjbUYwWlVOdmJIVnRia2xrWEhKY2JseDBRSEJoY21GdElDUmxiQ0I3YWxGMVpYSjVmU0JxVVhWbGNua3RkM0poY0hCbFpDQmpiMngxYlc0Z1pXeGxiV1Z1ZEZ4eVhHNWNkRUJ5WlhSMWNtNGdlMU4wY21sdVozMGdRMjlzZFcxdUlFbEVYSEpjYmx4MEtpb3ZYSEpjYmx4MFoyVnVaWEpoZEdWRGIyeDFiVzVKWkNna1pXd3BJSHRjY2x4dVhIUmNkSEpsZEhWeWJpQjBhR2x6TGlSMFlXSnNaUzVrWVhSaEtFUkJWRUZmUTA5TVZVMU9VMTlKUkNrZ0t5QW5MU2NnS3lBa1pXd3VaR0YwWVNoRVFWUkJYME5QVEZWTlRsOUpSQ2s3WEhKY2JseDBmVnh5WEc1Y2NseHVYSFF2S2lwY2NseHVYSFJRWVhKelpYTWdZU0JuYVhabGJpQkVUMDFGYkdWdFpXNTBKM01nZDJsa2RHZ2dhVzUwYnlCaElHWnNiMkYwWEhKY2JseHlYRzVjZEVCd2NtbDJZWFJsWEhKY2JseDBRRzFsZEdodlpDQndZWEp6WlZkcFpIUm9YSEpjYmx4MFFIQmhjbUZ0SUdWc1pXMWxiblFnZTBSUFRVVnNaVzFsYm5SOUlFVnNaVzFsYm5RZ2RHOGdaMlYwSUhkcFpIUm9JRzltWEhKY2JseDBRSEpsZEhWeWJpQjdUblZ0WW1WeWZTQkZiR1Z0Wlc1MEozTWdkMmxrZEdnZ1lYTWdZU0JtYkc5aGRGeHlYRzVjZENvcUwxeHlYRzVjZEhCaGNuTmxWMmxrZEdnb1pXeGxiV1Z1ZENrZ2UxeHlYRzVjZEZ4MGNtVjBkWEp1SUdWc1pXMWxiblFnUHlCd1lYSnpaVVpzYjJGMEtHVnNaVzFsYm5RdWMzUjViR1V1ZDJsa2RHZ3VjbVZ3YkdGalpTZ25KU2NzSUNjbktTa2dPaUF3TzF4eVhHNWNkSDFjY2x4dVhISmNibHgwTHlvcVhISmNibHgwVTJWMGN5QjBhR1VnY0dWeVkyVnVkR0ZuWlNCM2FXUjBhQ0J2WmlCaElHZHBkbVZ1SUVSUFRVVnNaVzFsYm5SY2NseHVYSEpjYmx4MFFIQnlhWFpoZEdWY2NseHVYSFJBYldWMGFHOWtJSE5sZEZkcFpIUm9YSEpjYmx4MFFIQmhjbUZ0SUdWc1pXMWxiblFnZTBSUFRVVnNaVzFsYm5SOUlFVnNaVzFsYm5RZ2RHOGdjMlYwSUhkcFpIUm9JRzl1WEhKY2JseDBRSEJoY21GdElIZHBaSFJvSUh0T2RXMWlaWEo5SUZkcFpIUm9MQ0JoY3lCaElIQmxjbU5sYm5SaFoyVXNJSFJ2SUhObGRGeHlYRzVjZENvcUwxeHlYRzVjZEhObGRGZHBaSFJvS0dWc1pXMWxiblFzSUhkcFpIUm9LU0I3WEhKY2JseDBYSFIzYVdSMGFDQTlJSGRwWkhSb0xuUnZSbWw0WldRb01pazdYSEpjYmx4MFhIUjNhV1IwYUNBOUlIZHBaSFJvSUQ0Z01DQS9JSGRwWkhSb0lEb2dNRHRjY2x4dVhIUmNkR1ZzWlcxbGJuUXVjM1I1YkdVdWQybGtkR2dnUFNCM2FXUjBhQ0FySUNjbEp6dGNjbHh1WEhSOVhISmNibHh5WEc1Y2RDOHFLbHh5WEc1Y2RFTnZibk4wY21GcGJuTWdZU0JuYVhabGJpQjNhV1IwYUNCMGJ5QjBhR1VnYldsdWFXMTFiU0JoYm1RZ2JXRjRhVzExYlNCeVlXNW5aWE1nWkdWbWFXNWxaQ0JwYmx4eVhHNWNkSFJvWlNCZ2JXbHVWMmxrZEdoZ0lHRnVaQ0JnYldGNFYybGtkR2hnSUdOdmJtWnBaM1Z5WVhScGIyNGdiM0IwYVc5dWN5d2djbVZ6Y0dWamRHbDJaV3g1TGx4eVhHNWNjbHh1WEhSQWNISnBkbUYwWlZ4eVhHNWNkRUJ0WlhSb2IyUWdZMjl1YzNSeVlXbHVWMmxrZEdoY2NseHVYSFJBY0dGeVlXMGdkMmxrZEdnZ2UwNTFiV0psY24wZ1YybGtkR2dnZEc4Z1kyOXVjM1J5WVdsdVhISmNibHgwUUhKbGRIVnliaUI3VG5WdFltVnlmU0JEYjI1emRISmhhVzVsWkNCM2FXUjBhRnh5WEc1Y2RDb3FMMXh5WEc1Y2RHTnZibk4wY21GcGJsZHBaSFJvS0hkcFpIUm9LU0I3WEhKY2JseDBYSFJwWmlBb2RHaHBjeTV2Y0hScGIyNXpMbTFwYmxkcFpIUm9JQ0U5SUhWdVpHVm1hVzVsWkNrZ2UxeHlYRzVjZEZ4MFhIUjNhV1IwYUNBOUlFMWhkR2d1YldGNEtIUm9hWE11YjNCMGFXOXVjeTV0YVc1WGFXUjBhQ3dnZDJsa2RHZ3BPMXh5WEc1Y2RGeDBmVnh5WEc1Y2NseHVYSFJjZEdsbUlDaDBhR2x6TG05d2RHbHZibk11YldGNFYybGtkR2dnSVQwZ2RXNWtaV1pwYm1Wa0tTQjdYSEpjYmx4MFhIUmNkSGRwWkhSb0lEMGdUV0YwYUM1dGFXNG9kR2hwY3k1dmNIUnBiMjV6TG0xaGVGZHBaSFJvTENCM2FXUjBhQ2s3WEhKY2JseDBYSFI5WEhKY2JseHlYRzVjZEZ4MGNtVjBkWEp1SUhkcFpIUm9PMXh5WEc1Y2RIMWNjbHh1WEhKY2JseDBMeW9xWEhKY2JseDBSMmwyWlc0Z1lTQndZWEowYVdOMWJHRnlJRVYyWlc1MElHOWlhbVZqZEN3Z2NtVjBjbWxsZG1WeklIUm9aU0JqZFhKeVpXNTBJSEJ2YVc1MFpYSWdiMlptYzJWMElHRnNiMjVuWEhKY2JseDBkR2hsSUdodmNtbDZiMjUwWVd3Z1pHbHlaV04wYVc5dUxpQkJZMk52ZFc1MGN5Qm1iM0lnWW05MGFDQnlaV2QxYkdGeUlHMXZkWE5sSUdOc2FXTnJjeUJoY3lCM1pXeHNJR0Z6WEhKY2JseDBjRzlwYm5SbGNpMXNhV3RsSUhONWMzUmxiWE1nS0cxdlltbHNaWE1zSUhSaFlteGxkSE1nWlhSakxpbGNjbHh1WEhKY2JseDBRSEJ5YVhaaGRHVmNjbHh1WEhSQWJXVjBhRzlrSUdkbGRGQnZhVzUwWlhKWVhISmNibHgwUUhCaGNtRnRJR1YyWlc1MElIdFBZbXBsWTNSOUlFVjJaVzUwSUc5aWFtVmpkQ0JoYzNOdlkybGhkR1ZrSUhkcGRHZ2dkR2hsSUdsdWRHVnlZV04wYVc5dVhISmNibHgwUUhKbGRIVnliaUI3VG5WdFltVnlmU0JJYjNKcGVtOXVkR0ZzSUhCdmFXNTBaWElnYjJabWMyVjBYSEpjYmx4MEtpb3ZYSEpjYmx4MFoyVjBVRzlwYm5SbGNsZ29aWFpsYm5RcElIdGNjbHh1WEhSY2RHbG1JQ2hsZG1WdWRDNTBlWEJsTG1sdVpHVjRUMllvSjNSdmRXTm9KeWtnUFQwOUlEQXBJSHRjY2x4dVhIUmNkRngwY21WMGRYSnVJQ2hsZG1WdWRDNXZjbWxuYVc1aGJFVjJaVzUwTG5SdmRXTm9aWE5iTUYwZ2ZId2daWFpsYm5RdWIzSnBaMmx1WVd4RmRtVnVkQzVqYUdGdVoyVmtWRzkxWTJobGMxc3dYU2t1Y0dGblpWZzdYSEpjYmx4MFhIUjlYSEpjYmx4MFhIUnlaWFIxY200Z1pYWmxiblF1Y0dGblpWZzdYSEpjYmx4MGZWeHlYRzU5WEhKY2JseHlYRzVTWlhOcGVtRmliR1ZEYjJ4MWJXNXpMbVJsWm1GMWJIUnpJRDBnZTF4eVhHNWNkSE5sYkdWamRHOXlPaUJtZFc1amRHbHZiaWdrZEdGaWJHVXBJSHRjY2x4dVhIUmNkR2xtS0NSMFlXSnNaUzVtYVc1a0tDZDBhR1ZoWkNjcExteGxibWQwYUNrZ2UxeHlYRzVjZEZ4MFhIUnlaWFIxY200Z1UwVk1SVU5VVDFKZlZFZzdYSEpjYmx4MFhIUjlYSEpjYmx4eVhHNWNkRngwY21WMGRYSnVJRk5GVEVWRFZFOVNYMVJFTzF4eVhHNWNkSDBzWEhKY2JseDBjM1J2Y21VNklIZHBibVJ2ZHk1emRHOXlaU3hjY2x4dVhIUnplVzVqU0dGdVpHeGxjbk02SUhSeWRXVXNYSEpjYmx4MGNtVnphWHBsUm5KdmJVSnZaSGs2SUhSeWRXVXNYSEpjYmx4MGJXRjRWMmxrZEdnNklHNTFiR3dzWEhKY2JseDBiV2x1VjJsa2RHZzZJREF1TURGY2NseHVmVHRjY2x4dVhISmNibEpsYzJsNllXSnNaVU52YkhWdGJuTXVZMjkxYm5RZ1BTQXdPMXh5WEc0aUxDSmxlSEJ2Y25RZ1kyOXVjM1FnUkVGVVFWOUJVRWtnUFNBbmNtVnphWHBoWW14bFEyOXNkVzF1Y3ljN1hISmNibVY0Y0c5eWRDQmpiMjV6ZENCRVFWUkJYME5QVEZWTlRsTmZTVVFnUFNBbmNtVnphWHBoWW14bExXTnZiSFZ0Ym5NdGFXUW5PMXh5WEc1bGVIQnZjblFnWTI5dWMzUWdSRUZVUVY5RFQweFZUVTVmU1VRZ1BTQW5jbVZ6YVhwaFlteGxMV052YkhWdGJpMXBaQ2M3WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JFUVZSQlgxUklJRDBnSjNSb0p6dGNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JEVEVGVFUxOVVRVUpNUlY5U1JWTkpXa2xPUnlBOUlDZHlZeTEwWVdKc1pTMXlaWE5wZW1sdVp5YzdYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQkRURUZUVTE5RFQweFZUVTVmVWtWVFNWcEpUa2NnUFNBbmNtTXRZMjlzZFcxdUxYSmxjMmw2YVc1bkp6dGNjbHh1Wlhod2IzSjBJR052Ym5OMElFTk1RVk5UWDBoQlRrUk1SU0E5SUNkeVl5MW9ZVzVrYkdVbk8xeHlYRzVsZUhCdmNuUWdZMjl1YzNRZ1EweEJVMU5mU0VGT1JFeEZYME5QVGxSQlNVNUZVaUE5SUNkeVl5MW9ZVzVrYkdVdFkyOXVkR0ZwYm1WeUp6dGNjbHh1WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JGVmtWT1ZGOVNSVk5KV2tWZlUxUkJVbFFnUFNBblkyOXNkVzF1T25KbGMybDZaVHB6ZEdGeWRDYzdYSEpjYm1WNGNHOXlkQ0JqYjI1emRDQkZWa1ZPVkY5U1JWTkpXa1VnUFNBblkyOXNkVzF1T25KbGMybDZaU2M3WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JGVmtWT1ZGOVNSVk5KV2tWZlUxUlBVQ0E5SUNkamIyeDFiVzQ2Y21WemFYcGxPbk4wYjNBbk8xeHlYRzVjY2x4dVpYaHdiM0owSUdOdmJuTjBJRk5GVEVWRFZFOVNYMVJJSUQwZ0ozUnlPbVpwY25OMElENGdkR2c2ZG1semFXSnNaU2M3WEhKY2JtVjRjRzl5ZENCamIyNXpkQ0JUUlV4RlExUlBVbDlVUkNBOUlDZDBjanBtYVhKemRDQStJSFJrT25acGMybGliR1VuTzF4eVhHNWxlSEJ2Y25RZ1kyOXVjM1FnVTBWTVJVTlVUMUpmVlU1U1JWTkpXa0ZDVEVVZ1BTQmdXMlJoZEdFdGJtOXlaWE5wZW1WZFlEdGNjbHh1SWl3aWFXMXdiM0owSUZKbGMybDZZV0pzWlVOdmJIVnRibk1nWm5KdmJTQW5MaTlqYkdGemN5YzdYSEpjYm1sdGNHOXlkQ0JoWkdGd2RHVnlJR1p5YjIwZ0p5NHZZV1JoY0hSbGNpYzdYSEpjYmx4eVhHNWxlSEJ2Y25RZ1pHVm1ZWFZzZENCU1pYTnBlbUZpYkdWRGIyeDFiVzV6T3lKZGZRPT0ifQ==
