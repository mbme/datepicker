/* global React, ReactDOM */
(function () {
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
      return {
        topLabel: 'September 2015'
      };
    },

    nextRange () {

    },

    prevRange () {

    },

    render () {
      let { topLabel } = this.state;

      return (
        <div className="Picker-calendar Picker-month">
          <TopBar label={topLabel}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          some month data
        </div>
      );
    }
  });

  const YearView = React.createClass({
    displayName: 'YearView',

    getInitialState () {
      return {
        topLabel: '2015'
      };
    },

    nextRange () {

    },

    prevRange () {

    },

    render () {
      let { topLabel } = this.state;

      return (
        <div className="Picker-calendar Picker-year">
          <TopBar label={topLabel}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          some year data
        </div>
      );
    }
  });

  const YearRangeView = React.createClass({
    displayName: 'YearRangeView',

    getInitialState () {
      return {
        topLabel: '2000 - 2015'
      };
    },

    nextRange () {

    },

    prevRange () {

    },

    render () {
      let { topLabel } = this.state;

      return (
        <div className="Picker-calendar Picker-yearrange">
          <TopBar label={topLabel}
                  onClickLeft={this.prevRange}
                  onClickCenter={this.props.onClickTopLabel}
                  onClickRight={this.nextRange} />
          some year range data
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
        viewType: ViewType.MONTH
      };
    },

    nextView (viewType) {
      this.setState({ viewType });
    },

    render () {
      let { viewType } = this.state;

      let view;
      if (viewType === ViewType.MONTH) {
        view = <MonthView onClickTopLabel={this.nextView.bind(this, ViewType.YEAR)} />;
      } else if (viewType === ViewType.YEAR) {
        view = <YearView onClickTopLabel={this.nextView.bind(this, ViewType.YEAR_RANGE)} />;
      } else { // ViewType.YEAR_RANGE
        view = <YearRangeView onClickTopLabel={this.nextView.bind(this, ViewType.MONTH)} />;
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
})();
