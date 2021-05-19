import { css } from "lit-element";

export const structureCss = css`
  form-binder,
  form-layout {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--form-pad, 8px);
  }

  .vertical-layout {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: var(--form-pad, 8px);
  }

  .horizontal-layout {
    display: flex;
    align-items: center;
    gap: var(--form-pad, 8px);
  }

  [form-layout-grid] {
    display: grid;
    grid-template-columns: repeat(var(--form-grid-columns), max-content);
    grid-gap: var(--form-pad, 8px);
    align-items: center;
  }

  [form-layout-array] {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--form-pad, 8px);
  }
`;

export const validationCss = css`
  :invalid {
    border: 1px solid var(--form-invalid-color, red);
  }
`;

export const titleCss = css`
  .vertical-title,
  .horizontal-title,
  .grid-title,
  .array-title {
    font-size: 1.2rem;
  }

  .grid-header {
    font-size: 1.1rem;
  }
`;

export const allCss = [structureCss, validationCss, titleCss];
