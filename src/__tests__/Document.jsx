import React from 'react';
import { mount } from 'enzyme';

import { Document } from '../entry.noworker';

import file from './_pdf.buffer';

/* eslint-disable comma-dangle */

describe('Document', () => {
  it('renders "No PDF file specified." when given nothing', () => {
    const component = mount(
      <Document />
    );

    const noData = component.find('.ReactPDF__NoData');

    expect(noData.text()).toBe('No PDF file specified.');
  });

  it('renders custom no data message when given nothing', () => {
    const component = mount(
      <Document noData="Nothing here" />
    );

    const noData = component.find('.ReactPDF__NoData');

    expect(noData.text()).toBe('Nothing here');
  });

  it('loads a file via data URI properly', () => {
    const onSourceSuccess = jest.fn();
    const onLoadSuccess = jest.fn();

    const dataURI = `data:application/pdf;base64,${file.toString('base64')}`;

    mount(
      <Document
        file={dataURI}
        onLoadSuccess={onLoadSuccess}
        onSourceSuccess={onSourceSuccess}
      />
    );

    expect(onSourceSuccess).toHaveBeenCalled();
    expect(onLoadSuccess).toHaveBeenCalled();
  });

  /*
  it('loads a file via data URI properly (param object)', () => {
    const component = mount(
      <Document file={file} />
    );
  });

  it('loads a file via ArrayBuffer properly', () => {
    const component = mount(
      <Document file={file} />
    );
  });

  it('loads a file via Blob properly', () => {
    const component = mount(
      <Document file={file} />
    );
  });


  it('loads a file via File properly', () => {
    const component = mount(
      <Document file={file} />
    );
  });
  */
});
