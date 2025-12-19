/**
 * @template {Element} [TElement=Element]
 * @template [TValue=unknown]
 * @typedef {import('./binder-registry').Binder<TElement, TValue>} Binder<TElement, TValue>
 */

/** @type {Binder<HTMLInputElement, string>} */
export const textInputBinder = {
  controlSelector: 'input, textarea',
  initializeEvents: (control, onChange, onTouch) => {
    control.addEventListener('change', e => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        onChange(e.target.value);
      }
    });
    control.addEventListener('blur', () => onTouch());
  },
  writeValue: (control, value) => {
    control.value = (value || '').toString();
  },
  reportValidity: (control, validationResult) => {
    if (typeof control.setCustomValidity === 'function') {
      const invalid = validationResult.find(r => r.valid === false);
      if (invalid) {
        if (invalid.message) {
          control.setCustomValidity(invalid.message);
        }
      } else {
        control.setCustomValidity('');
      }
    }
  },
};

/** @type {Binder<HTMLInputElement, number>} */
export const numberInputBinder = {
  controlSelector: 'input[type=number]',
  initializeEvents: (control, onChange) =>
    control.addEventListener('change', e => {
      if (e.target instanceof HTMLInputElement) {
        onChange(+e.target.value);
      }
    }),
  writeValue: (control, value) => {
    if (control instanceof HTMLInputElement) {
      control.value = (value || '').toString();
    }
  },
  reportValidity: (control, validationResult) => {
    if (typeof control.setCustomValidity === 'function') {
      const invalid = validationResult.find(r => r.valid === false);
      if (invalid) {
        if (invalid.message) {
          control.setCustomValidity(invalid.message);
        }
      } else {
        control.setCustomValidity('');
      }
    }
  },
};

/** @type {Binder<HTMLInputElement, boolean>} */
export const checkboxInputBinder = {
  controlSelector: "input[type='checkbox']",
  initializeEvents: (control, onChange) =>
    control.addEventListener('change', e => {
      if (e.target instanceof HTMLInputElement) {
        onChange(e.target.checked);
      }
    }),
  writeValue: (control, value) => {
    if (control instanceof HTMLInputElement) {
      control.checked = !!value;
    }
  },
  reportValidity: (control, validationResult) => {
    if (typeof control.setCustomValidity === 'function') {
      const invalid = validationResult.find(r => r.valid === false);
      if (invalid) {
        if (invalid.message) {
          control.setCustomValidity(invalid.message);
        }
      } else {
        control.setCustomValidity('');
      }
    }
  },
};

/** @type {Binder<HTMLSelectElement, string>} */
export const selectBinder = {
  controlSelector: 'select',
  initializeEvents: (control, onChange) =>
    control.addEventListener('change', e => {
      if (e.target instanceof HTMLSelectElement) {
        const value = Array.from(e.target.selectedOptions)
          .map(i => i.value)
          .join(',');
        onChange(value);
      }
    }),
  writeValue: (control, value) => {
    if (control instanceof HTMLSelectElement) {
      control.value = (value || '').toString();
    }
  },
  reportValidity: (control, validationResult) => {
    if (typeof control.setCustomValidity === 'function') {
      const invalid = validationResult.find(r => r.valid === false);
      if (invalid) {
        if (invalid.message) {
          control.setCustomValidity(invalid.message);
        }
      } else {
        control.setCustomValidity('');
      }
    }
  },
};
