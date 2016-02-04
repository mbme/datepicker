/* global React, ReactDOM */
(function () {
  const MonthView = React.createClass({
    displayName: 'MonthView',

    render () {
      return (
        <div className="Picker-calendar Picker-month">
          some month data
        </div>
      );
    }
  });
  const YearView = React.createClass({
    displayName: 'YearView',

    render () {
      return (
        <div className="Picker-calendar Picker-year">
          some year data
        </div>
      );
    }
  });
  const YearRangeView = React.createClass({
    displayName: 'YearRangeView',

    render () {
      return (
        <div className="Picker-calendar Picker-yearrange">
          some year range data
        </div>
      );
    }
  });

  const Picker = React.createClass({
    displayName: 'Picker',

    getInitialState () {
      return {
        viewType: 'month'
      };
    },

    render () {
      let { viewType } = this.state;

      let view;
      if (viewType === 'month') {
        view = <MonthView />;
      } else if (viewType === 'year') {
        view = <YearView />;
      } else {
        view = <YearRangeView />;
      }

      return (
        <div className="Picker">
          <div className="Picker-top">September 2015</div>
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
