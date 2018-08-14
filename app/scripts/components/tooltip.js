'use strict';
import React from 'react';
import { connect } from 'react-redux';
import c from 'classnames';
import { get } from 'object-path';
import { pct, party, year, districtName, districtId } from '../util/format';

const tooltipWidth = {
  sm: 200,
  lg: 260
};

class Tooltip extends React.Component {
  getSize () {
    return this.props.appWidth < 640 ? 'sm' : 'lg';
  }

  getDirection () {
    return this.props.appWidth / 2 - this.props.mouse.x > 0 ? 'right' : 'left';
  }

  getInlineStyle () {
    const { mouse } = this.props;
    const display = mouse.event !== 'mousemove' ? 'none' : 'block';

    // short circuit if there's no tooltip to show
    if (display === 'none') {
      return { display };
    }

    const direction = this.getDirection();
    const size = this.getSize();
    const left = direction === 'right' ? mouse.x : mouse.x - tooltipWidth[size];
    const top = mouse.y;
    const width = tooltipWidth[size] + 'px';
    return { display, left, top, width };
  }

  renderHistorical (historical) {
    if (!Array.isArray(historical) || !historical.length) {
      return <p>Historical data not available.</p>;
    }
    return (
      <React.Fragment>
        <div className='hist__cont'>
          <h6 className='hist__label hist__label--district'>Past results</h6>
          <h6 className='hist__label hist__label--percent'>Vote %</h6>
        </div>
        {historical.map((d, i) => (
          <p className={'hist__cont hist__cont--' + i} key={d.year}>
            <span className='hist__item hist__item--first'>
              <span className={c('hist__winner', {
                'hist__winner--rep': d.party.toLowerCase() === 'r',
                'hist__winner--dem': d.party.toLowerCase() === 'd'
              })}>{d.winner} ({party(d.party)}) {year(d.year)}</span>
            </span>
            <span className='hist__item'>{pct(d.vote)}</span>
          </p>
        ))}
      </React.Fragment>
    );
  }

  render () {
    const style = this.getInlineStyle();
    if (style.display === 'none') {
      return null;
    }

    const d = get(this.props, 'focused.properties');
    if (!d) {
      return null;
    }

    const classNames = c(
      'tooltip__cont',
      'tooltip__cont__' + this.getDirection(),
      'tooltip__cont__' + this.getSize()
    );
    const id = districtId(d.stateFips, d.fips);
    const historical = get(this.props.historical, id);
    return (
      <figure style={style} className={classNames}>
        <div className='tooltip__sect'>
          <h3 className='tooltip__title'>{districtName(d.stateFips, d.fips)}</h3>
        </div>
        <div className='tooltip__sect tooltip__sect--divider'>
          {this.renderHistorical(historical)}
        </div>
      </figure>
    );
  }
}

const selector = (state) => ({
  appWidth: state.app.width,
  mouse: state.mouse,
  focused: state.geo.focused,
  historical: state.historical.districts
});
export default connect(selector, null)(Tooltip);