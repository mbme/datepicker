'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (React, ReactDOM, moment) {
  var PropTypes = React.PropTypes;

  /**
   * Various helpers.
   */
  var Utils = {

    /**
     * Get absolute position of top left corner of the element.
     * @param {DOMElement} element
     * @returns {{x, y}} element coordinates
     */

    getElementPos: function getElementPos(element) {
      return {
        x: element.offsetLeft - element.scrollLeft + element.clientLeft,
        y: element.offsetTop - element.scrollTop + element.clientTop
      };
    },

    /**
     * Get list of values of object properties.
     * @param {object} object object to use
     * @returns {Array} list of values
     */
    objectValues: function objectValues() {
      var object = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return Object.keys(object).map(function (key) {
        return object[key];
      });
    },

    /**
     * Group cells into rows.
     * @param {Array} cells list of table cells
     * @param {number} rowSize number of elements in a row
     * @returns {Array} list of table rows
     */
    groupIntoRows: function groupIntoRows(cells, rowSize) {
      var rows = [];
      var rowsCount = cells.length / rowSize;

      for (var row = 0; row < rowsCount; row += 1) {
        var firstRowElPos = row * rowSize;
        rows.push(React.createElement(
          'tr',
          { key: row },
          cells.slice(firstRowElPos, firstRowElPos + rowSize)
        ));
      }

      return rows;
    }
  };

  /**
   * Available datepicker states.
   */
  var ViewType = {
    MONTH: 'month',
    YEAR: 'year',
    YEAR_RANGE: 'year-range'
  };

  /**
   * Top bar of the datepicker with left/right arrows and label in the middle.
   */
  var TopBar = React.createClass({
    displayName: 'TopBar',

    propTypes: {
      label: PropTypes.string,
      onClickLeft: PropTypes.func,
      onClickRight: PropTypes.func,
      onClickCenter: PropTypes.func
    },

    render: function render() {
      var _props = this.props;
      var label = _props.label;
      var onClickLeft = _props.onClickLeft;
      var onClickRight = _props.onClickRight;
      var onClickCenter = _props.onClickCenter;

      return React.createElement(
        'div',
        { className: 'Picker-top' },
        React.createElement(
          'div',
          { className: 'Picker-top-left', onClick: onClickLeft },
          '<'
        ),
        React.createElement(
          'div',
          { className: 'Picker-top-center', onClick: onClickCenter },
          label
        ),
        React.createElement(
          'div',
          { className: 'Picker-top-right', onClick: onClickRight },
          '>'
        )
      );
    }
  });

  /**
   * Bottom bar of the datepicker with "Today" button.
   */
  var BottomBar = React.createClass({
    displayName: 'BottomBar',

    propTypes: {
      onClick: PropTypes.func
    },

    render: function render() {
      return React.createElement(
        'div',
        { className: 'Picker-bottom', onClick: this.props.onClick },
        'Today'
      );
    }
  });

  /**
   * One of possible datepicker states.
   * Allows to select day in a month and switch months back and forth.
   */
  var MonthView = React.createClass({
    displayName: 'MonthView',

    propTypes: {
      selectedDate: PropTypes.instanceOf(moment),
      year: PropTypes.number.isRequired,
      month: PropTypes.number.isRequired,
      onClickTopLabel: PropTypes.func,
      onSelected: PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
      var _props2 = this.props;
      var year = _props2.year;
      var month = _props2.month;

      return {
        range: moment({ year: year, month: month })
      };
    },
    componentWillReceiveProps: function componentWillReceiveProps(_ref) {
      var year = _ref.year;
      var month = _ref.month;

      this.setState({
        range: moment({ year: year, month: month })
      });
    },
    nextRange: function nextRange() {
      this.setState({
        range: moment(this.state.range).add(1, 'months')
      });
    },
    prevRange: function prevRange() {
      this.setState({
        range: moment(this.state.range).subtract(1, 'months')
      });
    },
    showToday: function showToday() {
      this.setState({
        range: moment().startOf('month')
      });
    },
    onClick: function onClick(_ref2) {
      var target = _ref2.target;

      if (target.nodeName === 'TD') {
        var year = +target.getAttribute('data-year');
        var month = +target.getAttribute('data-month');
        var date = +target.getAttribute('data-date');
        this.props.onSelected(year, month, date);
      }
    },
    generateWeekItems: function generateWeekItems(date, currentMonth) {
      var selectedDate = this.props.selectedDate;

      var items = [];

      var startOfWeek = moment(date).startOf('week');
      var today = moment();

      for (var i = 0; i < 7; i += 1) {
        var day = moment(startOfWeek).add(i, 'days');

        var classes = [];
        if (day.month() === currentMonth) {
          classes.push('is-current-month');
        }

        // highlight selected day
        // check year, month and day
        if (selectedDate && day.isSame(selectedDate, 'day')) {
          classes.push('is-selected');
        }

        // highlight current date
        // check year, month and day
        if (day.isSame(today, 'day')) {
          classes.push('is-today');
        }

        // align numbers with optional nbsp
        var dayStr = day.date().toString();
        if (dayStr.length === 1) {
          dayStr = '&nbsp;' + dayStr;
        }

        items.push(React.createElement('td', { key: day.date(),
          className: classes.join(' '),
          'data-year': day.year(),
          'data-month': day.month(),
          'data-date': day.date(),
          dangerouslySetInnerHTML: { __html: dayStr } }));
      }

      return items;
    },
    generateTable: function generateTable(range) {
      var rows = [];

      var week = moment(range);
      for (var i = 0; i < 6; i += 1) {
        rows.push(React.createElement(
          'tr',
          { key: week.week() },
          this.generateWeekItems(week, range.month())
        ));
        week.add(1, 'weeks');
      }

      return React.createElement(
        'table',
        { onClick: this.onClick },
        React.createElement(
          'thead',
          null,
          React.createElement(
            'tr',
            null,
            moment.weekdaysShort().map(function (day) {
              return React.createElement(
                'th',
                { key: day },
                day
              );
            })
          )
        ),
        React.createElement(
          'tbody',
          null,
          rows
        )
      );
    },
    render: function render() {
      var range = this.state.range;

      return React.createElement(
        'div',
        { className: 'Picker Picker-month' },
        React.createElement(TopBar, { label: range.format('MMMM YYYY'),
          onClickLeft: this.prevRange,
          onClickCenter: this.props.onClickTopLabel,
          onClickRight: this.nextRange }),
        this.generateTable(range),
        React.createElement(BottomBar, { onClick: this.showToday })
      );
    }
  });

  /**
   * One of possible datepicker states.
   * Allows to select month in a year and switch years back and forth.
   */
  var YearView = React.createClass({
    displayName: 'YearView',

    propTypes: {
      selectedDate: PropTypes.instanceOf(moment),
      year: PropTypes.number.isRequired,
      onClickTopLabel: PropTypes.func,
      onSelected: PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
      var year = this.props.year;

      return { year: year };
    },
    nextRange: function nextRange() {
      this.setState({
        year: this.state.year += 1
      });
    },
    prevRange: function prevRange() {
      this.setState({
        year: this.state.year -= 1
      });
    },
    showToday: function showToday() {
      this.setState({
        year: moment().year()
      });
    },
    onClick: function onClick(_ref3) {
      var target = _ref3.target;

      if (target.nodeName === 'TD') {
        var year = +target.getAttribute('data-year');
        var month = +target.getAttribute('data-month');
        this.props.onSelected(year, month);
      }
    },
    generateTable: function generateTable() {
      var selectedDate = this.props.selectedDate;
      var year = this.state.year;

      var today = moment();

      var cells = [];
      for (var month = 0; month < 12; month += 1) {
        var day = moment({ year: year, month: month });

        var classes = [];

        // highlight selected month
        // check year and month
        if (selectedDate && day.isSame(selectedDate, 'month')) {
          classes.push('is-selected');
        }

        // highlight current month
        // check year and month
        if (day.isSame(today, 'month')) {
          classes.push('is-today');
        }

        var label = day.format('MMM');
        cells.push(React.createElement(
          'td',
          { key: label,
            'data-year': year,
            'data-month': month,
            className: classes.join(' ') },
          label
        ));
      }

      return React.createElement(
        'table',
        { onClick: this.onClick },
        React.createElement(
          'tbody',
          null,
          Utils.groupIntoRows(cells, 3)
        )
      );
    },
    render: function render() {
      return React.createElement(
        'div',
        { className: 'Picker Picker-year' },
        React.createElement(TopBar, { label: this.state.year.toString(),
          onClickLeft: this.prevRange,
          onClickCenter: this.props.onClickTopLabel,
          onClickRight: this.nextRange }),
        this.generateTable(),
        React.createElement(BottomBar, { onClick: this.showToday })
      );
    }
  });

  /**
   * Number of visible years for YearRangeView.
   */
  var YEARS_RANGE = 16;

  /**
   * One of possible datepicker states.
   * Allows to select year from years range.
   */
  var YearRangeView = React.createClass({
    displayName: 'YearRangeView',

    propTypes: {
      selectedDate: PropTypes.instanceOf(moment),
      year: PropTypes.number.isRequired,
      onClickTopLabel: PropTypes.func,
      onSelected: PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
      var year = this.props.year;

      return {
        rangeStart: year - 8
      };
    },
    nextRange: function nextRange() {
      this.setState({
        rangeStart: this.state.rangeStart += YEARS_RANGE
      });
    },
    prevRange: function prevRange() {
      this.setState({
        rangeStart: this.state.rangeStart -= YEARS_RANGE
      });
    },
    showToday: function showToday() {
      this.setState({
        rangeStart: moment().year() - 8
      });
    },
    onClick: function onClick(_ref4) {
      var target = _ref4.target;

      if (target.nodeName === 'TD') {
        var year = +target.getAttribute('data-year');
        this.props.onSelected(year);
      }
    },
    generateTable: function generateTable() {
      var selectedDate = this.props.selectedDate;
      var rangeStart = this.state.rangeStart;

      var currentYear = moment().year();

      var cells = [];
      for (var i = 0; i < YEARS_RANGE; i += 1) {
        var year = rangeStart + i;

        var classes = [];

        // highlight selected year
        if (selectedDate && selectedDate.year() === year) {
          classes.push('is-selected');
        }

        // highlight current year
        if (currentYear === year) {
          classes.push('is-today');
        }

        cells.push(React.createElement(
          'td',
          { key: year,
            'data-year': year,
            className: classes.join(' ') },
          year
        ));
      }

      return React.createElement(
        'table',
        { onClick: this.onClick },
        React.createElement(
          'tbody',
          null,
          Utils.groupIntoRows(cells, 4)
        )
      );
    },
    render: function render() {
      var rangeStart = this.state.rangeStart;

      var topLabel = rangeStart + ' - ' + (rangeStart + YEARS_RANGE - 1);
      return React.createElement(
        'div',
        { className: 'Picker Picker-yearrange' },
        React.createElement(TopBar, { label: topLabel,
          onClickLeft: this.prevRange,
          onClickCenter: this.props.onClickTopLabel,
          onClickRight: this.nextRange }),
        this.generateTable(),
        React.createElement(BottomBar, { onClick: this.showToday })
      );
    }
  });

  /**
   * Datepicker component.
   * Can be in one of ViewType states and switches them if required.
   */
  var Picker = React.createClass({
    displayName: 'Picker',

    propTypes: {
      selectedDate: PropTypes.instanceOf(moment),
      view: PropTypes.oneOf(Utils.objectValues(ViewType)),
      onDateSelected: PropTypes.func.isRequired
    },

    getInitialState: function getInitialState() {
      var _props3 = this.props;
      var selectedDate = _props3.selectedDate;
      var _props3$view = _props3.view;
      var view = _props3$view === undefined ? ViewType.MONTH : _props3$view;

      var now = moment();
      return {
        view: view,
        selectedDate: selectedDate,
        year: now.year(),
        month: now.month()
      };
    },
    componentWillReceiveProps: function componentWillReceiveProps(_ref5) {
      var selectedDate = _ref5.selectedDate;
      var _ref5$view = _ref5.view;
      var view = _ref5$view === undefined ? this.state.view : _ref5$view;
      var _state = this.state;
      var year = _state.year;
      var month = _state.month;

      if (selectedDate) {
        year = selectedDate.year();
        month = selectedDate.month();
      }

      this.setState({
        view: view,
        selectedDate: selectedDate,
        year: year,
        month: month
      });
    },
    goToYearView: function goToYearView() {
      this.setState({ view: ViewType.YEAR });
    },
    goToYearRangeView: function goToYearRangeView() {
      this.setState({ view: ViewType.YEAR_RANGE });
    },
    goToMonthView: function goToMonthView() {
      this.setState({ view: ViewType.MONTH });
    },
    onDateSelected: function onDateSelected(year, month, date) {
      var selectedDate = moment({ year: year, month: month, date: date });
      this.setState({ selectedDate: selectedDate, year: year, month: month });
      this.props.onDateSelected(selectedDate);
    },
    onYearAndMonthSelected: function onYearAndMonthSelected(year, month) {
      this.setState({ year: year, month: month });
      this.goToMonthView();
    },
    onYearSelected: function onYearSelected(year) {
      this.setState({ year: year });
      this.goToYearView();
    },
    render: function render() {
      var _state2 = this.state;
      var view = _state2.view;
      var selectedDate = _state2.selectedDate;
      var year = _state2.year;
      var month = _state2.month;

      if (view === ViewType.MONTH) {
        return React.createElement(MonthView, { selectedDate: selectedDate,
          year: year,
          month: month,
          onClickTopLabel: this.goToYearView,
          onSelected: this.onDateSelected });
      }

      if (view === ViewType.YEAR) {
        return React.createElement(YearView, { selectedDate: selectedDate,
          year: year,
          onClickTopLabel: this.goToYearRangeView,
          onSelected: this.onYearAndMonthSelected });
      }

      // ViewType.YEAR_RANGE
      return React.createElement(YearRangeView, { selectedDate: selectedDate,
        year: year,
        onClickTopLabel: this.goToMonthView,
        onSelected: this.onYearSelected });
    }
  });

  /**
   * Manages wrapper element with absolute positioning and renders Picker component inside it.
   */

  var Datepicker = function () {
    /**
     * @param {DOMElement} el text input field for datepicker
     * @param {Function} onDateSelected callback to execute when user select date
     */

    function Datepicker(el, onDateSelected) {
      _classCallCheck(this, Datepicker);

      this.el = el;
      this.isVisible = false;
      this.onDateSelected = onDateSelected;

      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('Datepicker-wrapper');
      document.body.appendChild(this.wrapper);
    }

    /**
     * Show datepicker under text input.
     * @param {Moment} [selectedDate] currently selected date
     */

    _createClass(Datepicker, [{
      key: 'show',
      value: function show(selectedDate) {
        if (this.isVisible) {
          return;
        }

        ReactDOM.render(React.createElement(Picker, { selectedDate: selectedDate,
          view: ViewType.MONTH,
          onDateSelected: this.onDateSelected }), this.wrapper);

        this.isVisible = true;
        this.updatePosition();

        this.wrapper.classList.add('is-visible');
      }

      /**
       * Hide datepicker.
       */

    }, {
      key: 'hide',
      value: function hide() {
        this.wrapper.classList.remove('is-visible');
        this.isVisible = false;
      }

      /**
       * Update datepicker position to be directly under text input.
       */

    }, {
      key: 'updatePosition',
      value: function updatePosition() {
        var _Utils$getElementPos = Utils.getElementPos(this.el);

        var x = _Utils$getElementPos.x;
        var y = _Utils$getElementPos.y;

        var elHeight = this.el.offsetHeight;
        this.wrapper.style.top = y + elHeight + 'px';
        this.wrapper.style.left = x + 'px';
      }

      /**
       * Close and remove datepicker.
       */

    }, {
      key: 'close',
      value: function close() {
        ReactDOM.unmountComponentAtNode(this.wrapper);
        this.wrapper.parentNode.removeChild(this.wrapper);
      }
    }]);

    return Datepicker;
  }();

  window.Picker = {
    Datepicker: Datepicker,

    /**
     * Create Datepicker for text input and show it on focus.
     * @param {DOMElement} el text input
     * @returns {Datepicker}
     */
    install: function install(el) {
      var _ref6 = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var _ref6$format = _ref6.format;
      var format = _ref6$format === undefined ? 'MMMM D YYYY' : _ref6$format;

      var picker = new Datepicker(el, function (date) {
        el.value = date.format(format); // eslint-disable-line no-param-reassign
      });

      // prevent manual editing
      el.addEventListener('keydown', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
      });

      function clickHandler(evt) {
        // hide picker if clicked on anything outside of it
        if (!picker.wrapper.contains(evt.target)) {
          picker.hide();
          window.removeEventListener('click', clickHandler);
        }
      }

      // show picker when input is focused
      el.addEventListener('click', function (evt) {
        var date = moment(el.value, format);
        picker.show(date.isValid() ? date : undefined);
        window.addEventListener('click', clickHandler, true);

        // stop propagation to not to trigger clickHandler
        evt.stopPropagation();
      });

      // update picker position on resize
      window.addEventListener('resize', function () {
        if (picker.isVisible) {
          picker.updatePosition();
        }
      });

      return picker;
    }
  };
})(window.React, window.ReactDOM, window.moment);
