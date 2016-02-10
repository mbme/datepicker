(function (React, ReactDOM, moment) {
  const PropTypes = React.PropTypes;

  /**
   * Various helpers.
   */
  const Utils = {

    /**
     * Get absolute position of top left corner of the element.
     * @param {DOMElement} element
     * @returns {{x, y}} element coordinates
     */
    getElementPos (element) {
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
    objectValues (object = {}) {
      return Object.keys(object).map(key => object[key]);
    },

    /**
     * Group cells into rows.
     * @param {Array} cells list of table cells
     * @param {number} rowSize number of elements in a row
     * @returns {Array} list of table rows
     */
    groupIntoRows (cells, rowSize) {
      let rows = [];
      let rowsCount = cells.length / rowSize;

      for (let row = 0; row < rowsCount; row += 1) {
        let firstRowElPos = row * rowSize;
        rows.push(
          <tr key={row}>
            {cells.slice(firstRowElPos, firstRowElPos + rowSize)}
          </tr>
        );
      }

      return rows;
    }
  };

  /**
   * Available datepicker states.
   */
  const ViewType = {
    MONTH:      'month',
    YEAR:       'year',
    YEAR_RANGE: 'year-range'
  };

  /**
   * Top bar of the datepicker with left/right arrows and label in the middle.
   */
  const TopBar = React.createClass({
    displayName: 'TopBar',

    propTypes: {
      label:         PropTypes.string,
      onClickLeft:   PropTypes.func,
      onClickRight:  PropTypes.func,
      onClickCenter: PropTypes.func
    },

    render () {
      let {
        label,
        onClickLeft,
        onClickRight,
        onClickCenter
      } = this.props;

      return (
        <div className="Picker-top">
          <div className="Picker-top-left" onClick={onClickLeft}>
            &lt;
          </div>
          <div className="Picker-top-center" onClick={onClickCenter}>
            {label}
          </div>
          <div className="Picker-top-right" onClick={onClickRight}>
            &gt;
          </div>
        </div>
      );
    }
  });

  /**
   * Bottom bar of the datepicker with "Today" button.
   */
  const BottomBar = React.createClass({
    displayName: 'BottomBar',

    propTypes: {
      onClick: PropTypes.func
    },

    render () {
      return (
        <div className="Picker-bottom" onClick={this.props.onClick}>
          Today
        </div>
      );
    }
  });

  /**
   * One of possible datepicker states.
   * Allows to select day in a month and switch months back and forth.
   */
  const MonthView = React.createClass({
    displayName: 'MonthView',

    propTypes: {
      selectedDate:    PropTypes.instanceOf(moment),
      year:            PropTypes.number.isRequired,
      month:           PropTypes.number.isRequired,
      onClickTopLabel: PropTypes.func,
      onSelected:      PropTypes.func.isRequired
    },

    getInitialState () {
      let { year, month } = this.props;

      return {
        range: moment({ year, month })
      };
    },

    componentWillReceiveProps ({ year, month }) {
      this.setState({
        range: moment({ year, month })
      });
    },

    nextRange () {
      this.setState({
        range: moment(this.state.range).add(1, 'months')
      });
    },

    prevRange () {
      this.setState({
        range: moment(this.state.range).subtract(1, 'months')
      });
    },

    showToday () {
      this.setState({
        range: moment().startOf('month')
      });
    },

    onClick ({ target }) {
      if (target.nodeName === 'TD') {
        let year = +target.getAttribute('data-year');
        let month = +target.getAttribute('data-month');
        let date = +target.getAttribute('data-date');
        this.props.onSelected(year, month, date);
      }
    },

    generateWeekItems (date, currentMonth) {
      let { selectedDate } = this.props;

      let items = [];

      let startOfWeek = moment(date).startOf('week');
      let today = moment();

      for (let i = 0; i < 7; i += 1) {
        let day = moment(startOfWeek).add(i, 'days');

        let classes = [];
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
        let dayStr = day.date().toString();
        if (dayStr.length === 1) {
          dayStr = '&nbsp;' + dayStr;
        }

        items.push(
          <td key={day.date()}
              className={classes.join(' ')}
              data-year={day.year()}
              data-month={day.month()}
              data-date={day.date()}
              dangerouslySetInnerHTML={{ __html: dayStr }} >
          </td>
        );
      }

      return items;
    },

    generateTable (range) {
      let rows = [];

      let week = moment(range);
      for (let i = 0; i < 6; i += 1) {
        rows.push(<tr key={week.week()}>{this.generateWeekItems(week, range.month())}</tr>);
        week.add(1, 'weeks');
      }

      return (
        <table onClick={this.onClick}>
          <thead>
            <tr>
              {moment.weekdaysShort().map(day => <th key={day}>{day}</th>)}
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      );
    },

    render () {
      let { range } = this.state;

      return (
        <div className="Picker Picker-month">
          <TopBar label={range.format('MMMM YYYY')}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          {this.generateTable(range)}
          <BottomBar onClick={this.showToday} />
        </div>
      );
    }
  });

  /**
   * One of possible datepicker states.
   * Allows to select month in a year and switch years back and forth.
   */
  const YearView = React.createClass({
    displayName: 'YearView',

    propTypes: {
      selectedDate:    PropTypes.instanceOf(moment),
      year:            PropTypes.number.isRequired,
      onClickTopLabel: PropTypes.func,
      onSelected:      PropTypes.func.isRequired
    },

    getInitialState () {
      let { year } = this.props;

      return { year };
    },

    nextRange () {
      this.setState({
        year: this.state.year += 1
      });
    },

    prevRange () {
      this.setState({
        year: this.state.year -= 1
      });
    },

    showToday () {
      this.setState({
        year: moment().year()
      });
    },

    onClick ({ target }) {
      if (target.nodeName === 'TD') {
        let year = +target.getAttribute('data-year');
        let month = +target.getAttribute('data-month');
        this.props.onSelected(year, month);
      }
    },

    generateTable () {
      let { selectedDate } = this.props;
      let { year } = this.state;

      let today = moment();

      let cells = [];
      for (let month = 0; month < 12; month += 1) {
        let day = moment({ year, month });

        let classes = [];

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

        let label = day.format('MMM');
        cells.push(
          <td key={label}
              data-year={year}
              data-month={month}
              className={classes.join(' ')} >
            {label}
          </td>
        );
      }

      return (
        <table onClick={this.onClick}>
          <tbody>{Utils.groupIntoRows(cells, 3)}</tbody>
        </table>
      );
    },

    render () {
      return (
        <div className="Picker Picker-year">
          <TopBar label={this.state.year.toString()}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          {this.generateTable()}
          <BottomBar onClick={this.showToday} />
        </div>
      );
    }
  });

  /**
   * Number of visible years for YearRangeView.
   */
  const YEARS_RANGE = 16;

  /**
   * One of possible datepicker states.
   * Allows to select year from years range.
   */
  const YearRangeView = React.createClass({
    displayName: 'YearRangeView',

    propTypes: {
      selectedDate:    PropTypes.instanceOf(moment),
      year:            PropTypes.number.isRequired,
      onClickTopLabel: PropTypes.func,
      onSelected:      PropTypes.func.isRequired
    },

    getInitialState () {
      let { year } = this.props;

      return {
        rangeStart: year - 8
      };
    },

    nextRange () {
      this.setState({
        rangeStart: this.state.rangeStart += YEARS_RANGE
      });
    },

    prevRange () {
      this.setState({
        rangeStart: this.state.rangeStart -= YEARS_RANGE
      });
    },

    showToday () {
      this.setState({
        rangeStart: moment().year() - 8
      });
    },

    onClick ({ target }) {
      if (target.nodeName === 'TD') {
        let year = +target.getAttribute('data-year');
        this.props.onSelected(year);
      }
    },

    generateTable () {
      let { selectedDate } = this.props;
      let { rangeStart } = this.state;

      let currentYear = moment().year();

      let cells = [];
      for (let i = 0; i < YEARS_RANGE; i += 1) {
        let year = rangeStart + i;

        let classes = [];

        // highlight selected year
        if (selectedDate && selectedDate.year() === year) {
          classes.push('is-selected');
        }

        // highlight current year
        if (currentYear === year) {
          classes.push('is-today');
        }

        cells.push(
          <td key={year}
              data-year={year}
              className={classes.join(' ')} >
            {year}
          </td>
        );
      }

      return (
        <table onClick={this.onClick}>
          <tbody>{Utils.groupIntoRows(cells, 4)}</tbody>
        </table>
      );
    },

    render () {
      let { rangeStart } = this.state;

      let topLabel = `${rangeStart} - ${rangeStart + YEARS_RANGE - 1}`;
      return (
        <div className="Picker Picker-yearrange">
          <TopBar label={topLabel}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          {this.generateTable()}
          <BottomBar onClick={this.showToday} />
        </div>
      );
    }
  });

  /**
   * Datepicker component.
   * Can be in one of ViewType states and switches them if required.
   */
  const Picker = React.createClass({
    displayName: 'Picker',

    propTypes: {
      selectedDate:   PropTypes.instanceOf(moment),
      view:           PropTypes.oneOf(Utils.objectValues(ViewType)),
      onDateSelected: PropTypes.func.isRequired
    },

    getInitialState () {
      let { selectedDate, view = ViewType.MONTH } = this.props;
      let now = moment();
      return {
        view,
        selectedDate,
        year: now.year(),
        month: now.month()
      };
    },

    componentWillReceiveProps ({ selectedDate, view = this.state.view }) {
      let { year, month } = this.state;

      if (selectedDate) {
        year = selectedDate.year();
        month = selectedDate.month();
      }

      this.setState({
        view,
        selectedDate,
        year,
        month
      });
    },

    goToYearView () {
      this.setState({ view: ViewType.YEAR });
    },

    goToYearRangeView () {
      this.setState({ view: ViewType.YEAR_RANGE });
    },

    goToMonthView () {
      this.setState({ view: ViewType.MONTH });
    },

    onDateSelected (year, month, date) {
      let selectedDate = moment({ year, month, date });
      this.setState({ selectedDate, year, month });
      this.props.onDateSelected(selectedDate);
    },

    onYearAndMonthSelected (year, month) {
      this.setState({ year, month });
      this.goToMonthView();
    },

    onYearSelected (year) {
      this.setState({ year });
      this.goToYearView();
    },

    render () {
      let { view, selectedDate, year, month } = this.state;

      if (view === ViewType.MONTH) {
        return (
          <MonthView selectedDate={selectedDate}
                     year={year}
                     month={month}
                     onClickTopLabel={this.goToYearView}
                     onSelected={this.onDateSelected} />
        );
      }

      if (view === ViewType.YEAR) {
        return (
          <YearView selectedDate={selectedDate}
                    year={year}
                    onClickTopLabel={this.goToYearRangeView}
                    onSelected={this.onYearAndMonthSelected} />
        );
      }

      // ViewType.YEAR_RANGE
      return (
        <YearRangeView selectedDate={selectedDate}
                       year={year}
                       onClickTopLabel={this.goToMonthView}
                       onSelected={this.onYearSelected} />
      );
    }
  });

  /**
   * Manages wrapper element with absolute positioning and renders Picker component inside it.
   */
  class Datepicker {
    /**
     * @param {DOMElement} el text input field for datepicker
     * @param {Function} onDateSelected callback to execute when user select date
     */
    constructor (el, onDateSelected) {
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
    show (selectedDate) {
      if (this.isVisible) {
        return;
      }

      ReactDOM.render(
        <Picker selectedDate={selectedDate}
                view={ViewType.MONTH}
                onDateSelected={this.onDateSelected} />,
        this.wrapper
      );

      this.isVisible = true;
      this.updatePosition();

      this.wrapper.classList.add('is-visible');
    }

    /**
     * Hide datepicker.
     */
    hide () {
      this.wrapper.classList.remove('is-visible');
      this.isVisible = false;
    }

    /**
     * Update datepicker position to be directly under text input.
     */
    updatePosition () {
      let { x, y } = Utils.getElementPos(this.el);
      let elHeight = this.el.offsetHeight;
      this.wrapper.style.top = `${y + elHeight}px`;
      this.wrapper.style.left = `${x}px`;
    }

    /**
     * Close and remove datepicker.
     */
    close () {
      ReactDOM.unmountComponentAtNode(this.wrapper);
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }

  window.Picker = {
    Datepicker,

    /**
     * Create Datepicker for text input and show it on focus.
     * @param {DOMElement} el text input
     * @returns {Datepicker}
     */
    install (el, { format = 'MMMM D YYYY' } = {}) {
      let picker = new Datepicker(el, function (date) {
        el.value = date.format(format); // eslint-disable-line no-param-reassign
      });

      // prevent manual editing
      el.addEventListener('keydown', function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
      });

      function clickHandler (evt) {
        // hide picker if clicked on anything outside of it
        if (!picker.wrapper.contains(evt.target)) {
          picker.hide();
          window.removeEventListener('click', clickHandler);
        }
      }

      // show picker when input is focused
      el.addEventListener('click', function (evt) {
        let date = moment(el.value, format);
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
