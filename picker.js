"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function (React, ReactDOM, moment) {
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
    }
  };

  /**
   * Top bar of the datepicker with left/right arrows and label in the middle.
   */
  var TopBar = React.createClass({
    displayName: 'TopBar',

    render: function render() {
      var _props = this.props;
      var label = _props.label;
      var onClickLeft = _props.onClickLeft;
      var onClickRight = _props.onClickRight;
      var onClickCenter = _props.onClickCenter;

      return React.createElement(
        "div",
        { className: "Picker-top" },
        React.createElement(
          "div",
          { className: "Picker-top-left", onClick: onClickLeft },
          "<"
        ),
        React.createElement(
          "div",
          { className: "Picker-top-center", onClick: onClickCenter },
          label
        ),
        React.createElement(
          "div",
          { className: "Picker-top-right", onClick: onClickRight },
          ">"
        )
      );
    }
  });

  /**
   * Bottom bar of the datepicker with "Today" button.
   */
  var BottomBar = React.createClass({
    displayName: 'BottomBar',

    render: function render() {
      return React.createElement(
        "div",
        { className: "Picker-bottom", onClick: this.props.onClick },
        "Today"
      );
    }
  });

  /**
   * One of possible datepicker states.
   * Allows to select day in a month and switch months back and forth.
   */
  var MonthView = React.createClass({
    displayName: 'MonthView',

    getInitialState: function getInitialState() {
      var selectedDate = this.props.selectedDate;

      return {
        range: moment({
          year: selectedDate.year(),
          month: selectedDate.month()
        })
      };
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
      var now = moment();
      this.setState({
        range: moment({
          year: now.year(),
          month: now.month()
        })
      });
    },
    generateWeekItems: function generateWeekItems(date, currentMonth) {
      var _props2 = this.props;
      var selectedDate = _props2.selectedDate;
      var onDateSelected = _props2.onDateSelected;

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
        if (day.isSame(selectedDate, 'day')) {
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

        items.push(React.createElement("td", { key: day.date(),
          className: classes.join(' '),
          onClick: onDateSelected.bind(null, day),
          dangerouslySetInnerHTML: { __html: dayStr } }));
      }

      return items;
    },
    generateTable: function generateTable(range) {
      var rows = [];

      var week = moment(range);
      for (var i = 0; i < 6; i += 1) {
        rows.push(React.createElement(
          "tr",
          { key: week.week() },
          this.generateWeekItems(week, range.month())
        ));
        week.add(1, 'weeks');
      }

      return React.createElement(
        "table",
        null,
        React.createElement(
          "thead",
          null,
          React.createElement(
            "tr",
            null,
            moment.weekdaysShort().map(function (day) {
              return React.createElement(
                "th",
                { key: day },
                day
              );
            })
          )
        ),
        React.createElement(
          "tbody",
          null,
          rows
        )
      );
    },
    render: function render() {
      var range = this.state.range;

      return React.createElement(
        "div",
        { className: "Picker Picker-month" },
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

    getInitialState: function getInitialState() {
      return {
        year: this.props.selectedDate.year()
      };
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
    generateTable: function generateTable() {
      var _props3 = this.props;
      var selectedDate = _props3.selectedDate;
      var onDateSelected = _props3.onDateSelected;
      var year = this.state.year;

      var today = moment();

      var cells = [];
      for (var i = 0; i < 12; i += 1) {
        var day = moment({
          year: year,
          month: i,
          date: selectedDate.date()
        });
        // ensure that we're not overflowing max date in month
        if (!day.isValid()) {
          day = moment({ year: year, month: i }).endOf('month');
        }

        var classes = [];

        // highlight selected month
        // check year and month
        if (day.isSame(selectedDate, 'month')) {
          classes.push('is-selected');
        }

        // highlight current month
        // check year and month
        if (day.isSame(today, 'month')) {
          classes.push('is-today');
        }

        var label = day.format('MMM');
        cells.push(React.createElement(
          "td",
          { key: label,
            className: classes.join(' '),
            onClick: onDateSelected.bind(null, day) },
          label
        ));
      }

      var rows = [];
      for (var i = 0; i < 12; i += 3) {
        rows.push(React.createElement(
          "tr",
          { key: i },
          cells[i],
          cells[i + 1],
          cells[i + 2]
        ));
      }

      return React.createElement(
        "table",
        null,
        React.createElement(
          "tbody",
          null,
          rows
        )
      );
    },
    render: function render() {
      return React.createElement(
        "div",
        { className: "Picker Picker-year" },
        React.createElement(TopBar, { label: this.state.year,
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

    getInitialState: function getInitialState() {
      return {
        rangeStart: this.props.selectedDate.year() - 8
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
    generateTable: function generateTable() {
      var _props4 = this.props;
      var selectedDate = _props4.selectedDate;
      var onDateSelected = _props4.onDateSelected;
      var rangeStart = this.state.rangeStart;

      var today = moment();

      var cells = [];
      for (var i = 0; i < YEARS_RANGE; i += 1) {
        var day = moment({
          year: rangeStart + i,
          month: selectedDate.month(),
          date: selectedDate.date()
        });

        // ensure that we're not overflowing max date in month
        if (!day.isValid()) {
          day = moment({
            year: rangeStart + i,
            month: selectedDate.month()
          }).endOf('month');
        }

        var classes = [];

        // highlight selected year
        // check year
        if (day.isSame(selectedDate, 'year')) {
          classes.push('is-selected');
        }

        // highlight current year
        // check year
        if (day.isSame(today, 'year')) {
          classes.push('is-today');
        }

        cells.push(React.createElement(
          "td",
          { key: day.year(),
            className: classes.join(' '),
            onClick: onDateSelected.bind(null, day) },
          day.year()
        ));
      }

      var rows = [];
      for (var i = 0; i < YEARS_RANGE; i += 4) {
        rows.push(React.createElement(
          "tr",
          { key: i },
          cells[i],
          cells[i + 1],
          cells[i + 2],
          cells[i + 3]
        ));
      }

      return React.createElement(
        "table",
        null,
        React.createElement(
          "tbody",
          null,
          rows
        )
      );
    },
    render: function render() {
      var rangeStart = this.state.rangeStart;

      var topLabel = rangeStart + " - " + (rangeStart + YEARS_RANGE - 1);
      return React.createElement(
        "div",
        { className: "Picker Picker-yearrange" },
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
   * Available datepicker states.
   */
  var ViewType = {
    MONTH: 'month',
    YEAR: 'year',
    YEAR_RANGE: 'year-range'
  };

  /**
   * Datepicker component.
   * Can be in one of ViewType states and switches them if required.
   */
  var Picker = React.createClass({
    displayName: 'Picker',

    getInitialState: function getInitialState() {
      return {
        viewType: ViewType.MONTH,
        selectedDate: moment()
      };
    },
    nextView: function nextView(viewType) {
      this.setState({ viewType: viewType });
    },
    goToYearView: function goToYearView() {
      this.nextView(ViewType.YEAR);
    },
    goToYearRangeView: function goToYearRangeView() {
      this.nextView(ViewType.YEAR_RANGE);
    },
    goToMonthView: function goToMonthView() {
      this.nextView(ViewType.MONTH);
    },
    onDateSelected: function onDateSelected(selectedDate) {
      this.setState({ selectedDate: selectedDate });
      this.props.onDateSelected(selectedDate);
    },
    onYearSelected: function onYearSelected(selectedDate) {
      this.onDateSelected(selectedDate);
      this.goToMonthView();
    },
    onYearFromRangeSelected: function onYearFromRangeSelected(selectedDate) {
      this.onDateSelected(selectedDate);
      this.goToYearView();
    },
    render: function render() {
      var _state = this.state;
      var viewType = _state.viewType;
      var selectedDate = _state.selectedDate;

      var view = undefined;
      if (viewType === ViewType.MONTH) {
        view = React.createElement(MonthView, { selectedDate: selectedDate,
          onClickTopLabel: this.goToYearView,
          onDateSelected: this.onDateSelected });
      } else if (viewType === ViewType.YEAR) {
        view = React.createElement(YearView, { selectedDate: selectedDate,
          onClickTopLabel: this.goToYearRangeView,
          onDateSelected: this.onYearSelected });
      } else {
        // ViewType.YEAR_RANGE
        view = React.createElement(YearRangeView, { selectedDate: selectedDate,
          onClickTopLabel: this.goToMonthView,
          onDateSelected: this.onYearFromRangeSelected });
      }

      return view;
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

      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('Datepicker-wrapper');
      document.body.appendChild(this.wrapper);

      ReactDOM.render(React.createElement(Picker, { onDateSelected: onDateSelected }), this.wrapper);
    }

    /**
     * Show datepicker under text input.
     */

    _createClass(Datepicker, [{
      key: "show",
      value: function show() {
        if (this.isVisible) {
          return;
        }
        this.isVisible = true;
        this.updatePosition();

        this.wrapper.classList.add('is-visible');
      }

      /**
       * Hide datepicker.
       */

    }, {
      key: "hide",
      value: function hide() {
        this.wrapper.classList.remove('is-visible');
        this.isVisible = false;
      }

      /**
       * Update datepicker position to be directly under text input.
       */

    }, {
      key: "updatePosition",
      value: function updatePosition() {
        var _Utils$getElementPos = Utils.getElementPos(this.el);

        var x = _Utils$getElementPos.x;
        var y = _Utils$getElementPos.y;

        var elHeight = this.el.offsetHeight;
        this.wrapper.style.top = y + elHeight + "px";
        this.wrapper.style.left = x + "px";
      }

      /**
       * Close and remove datepicker.
       */

    }, {
      key: "close",
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
      var picker = new Datepicker(el, function (date) {
        el.value = date.format('MMMM D YYYY'); // eslint-disable-line no-param-reassign
      });

      // prevent editing
      el.addEventListener('keypress', function (evt) {
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
        picker.show();
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
