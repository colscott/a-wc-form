/** @typedef {import('./binder-registry').Binder} Binder */

/** @type {Binder} */
export const textInputBinder = {
  controlSelector: 'input, textarea',
  initializeEvents: (control, onChange, onTouch) => {
    control.addEventListener('change', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        onChange(e.target.value);
      }
    });
    control.addEventListener('blur', () => onTouch());
  },
  writeValue: /** @param {HTMLInputElement} control */ (control, value) => {
    control.value = (value || '').toString();
  },
};

/** @type {Binder} */
export const numberInputBinder = {
  controlSelector: 'input[type=number]',
  initializeEvents: (control, onChange) =>
    control.addEventListener('change', (e) => {
      if (e.target instanceof HTMLInputElement) {
        onChange(+e.target.value);
      }
    }),
  writeValue: (control, value) => {
    if (control instanceof HTMLInputElement) {
      control.value = (value || '').toString();
    }
  },
};

/** @type {Binder} */
export const checkboxInputBinder = {
  controlSelector: "input[type='checkbox']",
  initializeEvents: (control, onChange) =>
    control.addEventListener('change', (e) => {
      if (e.target instanceof HTMLInputElement) {
        onChange(e.target.checked);
      }
    }),
  writeValue: (control, value) => {
    if (control instanceof HTMLInputElement) {
      control.checked = !!value;
    }
  },
};

/** @type {Binder} */
export const selectBinder = {
  controlSelector: 'select',
  initializeEvents: (control, onChange) =>
    control.addEventListener('change', (e) => {
      if (e.target instanceof HTMLSelectElement) {
        const value = Array.from(e.target.selectedOptions)
          .map((i) => i.value)
          .join(',');
        onChange(value);
      }
    }),
  writeValue: (control, value) => {
    if (control instanceof HTMLSelectElement) {
      control.value = (value || '').toString();
    }
  },
};
