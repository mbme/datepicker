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

    generateWeekItems (date, currentMonth) {
      let { selectedDate, onDateSelected } = this.props;

      let items = [];

      let startOfWeek = moment(date).startOf('week');

      for (let i = 0; i < 7; i += 1) {
        let day = moment(startOfWeek).add(i, 'days');

        let classes = [];
        if (day.month() === currentMonth) {
          classes.push('is-current-month');
        }

        // check year, month and day
        if (day.isSame(selectedDate, 'day')) {
          classes.push('is-selected');
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
        <div className="Picker-calendar Picker-month">
          <TopBar label={range.format('MMMM YYYY')}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          {this.generateTable(range)}
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

    generateTable () {
      let { selectedDate, onDateSelected } = this.props;
      let { year } = this.state;

      let cells = [];
      for (let i = 0; i < 12; i += 1) {
        let day = moment({
          year,
          month: i,
          date: selectedDate.date()
        });

        let classes = [];

        // check year and month
        if (day.isSame(selectedDate, 'month')) {
          classes.push('is-selected');
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
        <div className="Picker-calendar Picker-year">
          <TopBar label={this.state.year}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          {this.generateTable()}
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

    generateTable () {
      let { selectedDate, onDateSelected } = this.props;
      let { rangeStart } = this.state;

      let cells = [];
      for (let i = 0; i < YEARS_RANGE; i += 1) {
        let day = moment({
          year: rangeStart + i,
          month: selectedDate.month(),
          date: selectedDate.date()
        });

        let classes = [];

        // check year
        if (day.isSame(selectedDate, 'year')) {
          classes.push('is-selected');
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
        <div className="Picker-calendar Picker-yearrange">
          <TopBar label={topLabel}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          {this.generateTable()}
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

    onDateSelected (selectedDate) {
      this.setState({ selectedDate });
    },

    render () {
      let { viewType, selectedDate } = this.state;

      let view;
      if (viewType === ViewType.MONTH) {
        view = (
          <MonthView selectedDate={selectedDate}
                     onClickTopLabel={this.nextView.bind(this, ViewType.YEAR)}
                     onDateSelected={this.onDateSelected} />
        );
      } else if (viewType === ViewType.YEAR) {
        view = (
          <YearView selectedDate={selectedDate}
                    onClickTopLabel={this.nextView.bind(this, ViewType.YEAR_RANGE)}
                    onDateSelected={this.onDateSelected} />
        );
      } else { // ViewType.YEAR_RANGE
        view = (
          <YearRangeView selectedDate={selectedDate}
                         onClickTopLabel={this.nextView.bind(this, ViewType.MONTH)}
                         onDateSelected={this.onDateSelected} />
        );
      }

      return (
        <div className="Picker">
          {view}
          <div className="Picker-bottom">Today</div>
        </div>
      );
    }
  });

  function getElementPos (element) {
    return {
      x: element.offsetLeft - element.scrollLeft + element.clientLeft,
      y: element.offsetTop - element.scrollTop + element.clientTop
    };
  }

  class Datepicker {
    constructor (el) {
      this.el = el;

      this.wrapper = document.createElement('div');
      this.wrapper.classList.add('Datepicker-wrapper');
      document.body.appendChild(this.wrapper);

      ReactDOM.render(
        <Picker />,
        this.wrapper
      );
    }

    show () {
      let { x, y } = getElementPos(this.el);
      let elHeight = this.el.offsetHeight;
      this.wrapper.style.top = `${y + elHeight}px`;
      this.wrapper.style.left = `${x}px`;

      this.wrapper.classList.add('is-visible');
    }

    hide () {

    }

    close () {

    }
  }

  window.Picker = {
    install (el) {
      let picker = new Datepicker(el);
      picker.show();
      /* el.addEventListener('click', ::picker.show); */
      return picker;
    }
  };
})(window.React, window.ReactDOM, window.moment);
