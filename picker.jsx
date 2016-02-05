(function (React, ReactDOM, moment) {
  const TopBar = React.createClass({
    displayName: 'TopBar',

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

  const BottomBar = React.createClass({
    displayName: 'BottomBar',

    render () {
      return (
        <div className="Picker-bottom" onClick={this.props.onClick}>
          Today
        </div>
      );
    }
  });

  const MonthView = React.createClass({
    displayName: 'MonthView',

    getInitialState () {
      let { selectedDate } = this.props;
      return {
        range: moment({
          year: selectedDate.year(),
          month: selectedDate.month()
        })
      };
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
        range: moment()
      });
    },

    generateWeekItems (date, currentMonth) {
      let { selectedDate, onDateSelected } = this.props;

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
        if (day.isSame(selectedDate, 'day')) {
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
              onClick={onDateSelected.bind(null, day)}
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
        <table>
          <thead>
            <tr>
              {moment.weekdaysShort().map(
                 day => <th key={day}>{day}</th>
               )}
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

  const YearView = React.createClass({
    displayName: 'YearView',

    getInitialState () {
      return {
        year: this.props.selectedDate.year()
      };
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

    generateTable () {
      let { selectedDate, onDateSelected } = this.props;
      let { year } = this.state;

      let today = moment();

      let cells = [];
      for (let i = 0; i < 12; i += 1) {
        let day = moment({
          year,
          month: i,
          date: selectedDate.date()
        });

        let classes = [];

        // highlight selected month
        // check year and month
        if (day.isSame(selectedDate, 'month')) {
          classes.push('is-selected');
        }

        // highlight current month
        // check year and month
        if (day.isSame(today, 'day')) {
          classes.push('is-today');
        }

        let label = day.format('MMM');
        cells.push(
          <td key={label}
              className={classes.join(' ')}
              onClick={onDateSelected.bind(null, day)}>
            {label}
          </td>
        );
      }

      let rows = [];
      for (let i = 0; i < 12; i += 3) {
        rows.push(
          <tr key={i}>
            {cells[i]}
            {cells[i + 1]}
            {cells[i + 2]}
          </tr>
        );
      }

      return (
        <table>
          <tbody>{rows}</tbody>
        </table>
      );
    },

    render () {
      return (
        <div className="Picker Picker-year">
          <TopBar label={this.state.year}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          {this.generateTable()}
          <BottomBar onClick={this.showToday} />
        </div>
      );
    }
  });

  const YEARS_RANGE = 16;
  const YearRangeView = React.createClass({
    displayName: 'YearRangeView',

    getInitialState () {
      return {
        rangeStart: this.props.selectedDate.year() - 8
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

    generateTable () {
      let { selectedDate, onDateSelected } = this.props;
      let { rangeStart } = this.state;

      let today = moment();

      let cells = [];
      for (let i = 0; i < YEARS_RANGE; i += 1) {
        let day = moment({
          year: rangeStart + i,
          month: selectedDate.month(),
          date: selectedDate.date()
        });

        let classes = [];

        // highlight selected year
        // check year
        if (day.isSame(selectedDate, 'year')) {
          classes.push('is-selected');
        }

        // highlight current year
        // check year
        if (day.isSame(today, 'day')) {
          classes.push('is-today');
        }

        cells.push(
          <td key={day.year()}
              className={classes.join(' ')}
              onClick={onDateSelected.bind(null, day)}>
            {day.year()}
          </td>
        );
      }

      let rows = [];
      for (let i = 0; i < YEARS_RANGE; i += 4) {
        rows.push(
          <tr key={i}>
            {cells[i]}
            {cells[i + 1]}
            {cells[i + 2]}
            {cells[i + 3]}
          </tr>
        );
      }

      return (
        <table>
          <tbody>{rows}</tbody>
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

  const ViewType = {
    MONTH: 'month',
    YEAR: 'year',
    YEAR_RANGE: 'year-range'
  };

  const Picker = React.createClass({
    displayName: 'Picker',

    getInitialState () {
      return {
        viewType: ViewType.MONTH,
        selectedDate: moment()
      };
    },

    nextView (viewType) {
      this.setState({ viewType });
    },

    goToYearView () {
      this.nextView(ViewType.YEAR);
    },

    goToYearRangeView () {
      this.nextView(ViewType.YEAR_RANGE);
    },

    goToMonthView () {
      this.nextView(ViewType.MONTH);
    },

    onDateSelected (selectedDate) {
      this.setState({ selectedDate });
      this.props.onDateSelected(selectedDate);
    },

    onYearSelected (selectedDate) {
      this.onDateSelected(selectedDate);
      this.goToMonthView();
    },

    onYearFromRangeSelected (selectedDate) {
      this.onDateSelected(selectedDate);
      this.goToYearView();
    },

    render () {
      let { viewType, selectedDate } = this.state;

      let view;
      if (viewType === ViewType.MONTH) {
        view = (
          <MonthView selectedDate={selectedDate}
                     onClickTopLabel={this.goToYearView}
                     onDateSelected={this.onDateSelected} />
        );
      } else if (viewType === ViewType.YEAR) {
        view = (
          <YearView selectedDate={selectedDate}
                    onClickTopLabel={this.goToYearRangeView}
                    onDateSelected={this.onYearSelected} />
        );
      } else { // ViewType.YEAR_RANGE
        view = (
          <YearRangeView selectedDate={selectedDate}
                         onClickTopLabel={this.goToMonthView}
                         onDateSelected={this.onYearFromRangeSelected} />
        );
      }

      return view;
    }
  });

  function getElementPos (element) {
    return {
      x: element.offsetLeft - element.scrollLeft + element.clientLeft,
      y: element.offsetTop - element.scrollTop + element.clientTop
    };
  }

  class Datepicker {
    constructor (el, onDateSelected) {
      this.el = el;
      this.isVisible = false;

      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('Datepicker-wrapper');
      document.body.appendChild(this.wrapper);

      ReactDOM.render(
        <Picker onDateSelected={onDateSelected}/>,
        this.wrapper
      );
    }

    show () {
      if (this.isVisible) {
        return;
      }
      this.isVisible = true;
      this.updatePosition();

      this.wrapper.classList.add('is-visible');
    }

    hide () {
      this.wrapper.classList.remove('is-visible');
      this.isVisible = false;
    }

    updatePosition () {
      let { x, y } = getElementPos(this.el);
      let elHeight = this.el.offsetHeight;
      this.wrapper.style.top = `${y + elHeight}px`;
      this.wrapper.style.left = `${x}px`;
    }

    close () {
      ReactDOM.unmountComponentAtNode(this.wrapper);
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }

  window.Picker = {
    Datepicker,

    install (el) {
      let picker = new Datepicker(el, function (date) {
        el.value = date.format('MMMM D YYYY'); // eslint-disable-line no-param-reassign
      });

      // prevent editing
      el.addEventListener('keypress', function (evt) {
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
        picker.show();
        window.addEventListener('click', clickHandler);

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
