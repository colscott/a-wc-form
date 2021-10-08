export const textBinder = {
  controlSelector: 'mwc-textfield, mwc-textarea',
  initializeEvents: (control, onChange) =>
    control.addEventListener('change', (e) => {
      switch (e.target.type) {
        case 'number':
          onChange(+e.target.value);
          break;
        default:
          onChange(e.target.value);
      }
    }),
  writeValue: (control, value) => {
    control.value = value;
  },
};

export const booleanBinder = {
  controlSelector: 'mwc-checkbox, mwc-switch',
  initializeEvents: (control, onChange) => control.addEventListener('change', (e) => onChange(e.target.checked)),
  writeValue: (control, value) => {
    control.checked = value;
  },
};

export const radioBinder = {
  controlSelector: 'mwc-radio',
  initializeEvents: (control, onChange) => control.addEventListener('change', (e) => onChange(e.target.value)),
  writeValue: (control, value) => {
    control.checked = value.toString() === control.value.toString();
  },
};

export const sliderBinder = {
  controlSelector: 'mwc-slider',
  initializeEvents: (control, onChange) => control.addEventListener('change', (e) => onChange(e.detail.value)),
  writeValue: (control, value) => {
    control.value = value;
  },
};

export const selectBinder = {
  controlSelector: 'mwc-select',
  initializeEvents: (control, onChange) =>
    control.addEventListener('selected', (e) => {
      /** @type {Array<import('@material/mwc-list/mwc-list-item').ListItem>} */
      const items = e.target.multi ? e.target.selected : [e.target.selected];
      const value = items
        .filter((i) => !!i)
        .map((i) => i.value)
        .join(',');
      onChange(value);
    }),
  writeValue: (control, value) => {
    control.value = value;
  },
};
