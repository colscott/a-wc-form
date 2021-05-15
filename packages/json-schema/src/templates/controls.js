import { html, render } from "lit-html/lit-html.js";
import { ifDefined } from "lit-html/directives/if-defined.js";
import {
  getSchemaValue,
  getValue
} from "a-wc-form-binder/src/lib/json-pointer.js";
import { controlBinder, getName } from "a-wc-form-binder";
import { setComponentTemplate } from "a-wc-form-layout";

/** @typedef {import('../lib/models.js').JsonSchema} JsonSchema */
/** @typedef {import('lit-element').TemplateResult} TemplateResult */

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {boolean} if the schema field is required
 */
function isRequired(schema, ref) {
  const innerProperties = ref.substr(0, ref.lastIndexOf("/"));
  /** @type {import("../lib/models").JsonSchema} */
  const parentSchema = getSchemaValue(schema, innerProperties, true);
  const property = ref.substr(ref.lastIndexOf("/") + 1);
  return (
    parentSchema.required != null &&
    parentSchema.required.indexOf(property) > -1
  );
}

const typeMapping = {
  boolean: "checkbox",
  number: "number",
  integer: "number",
  string: "text"
};

const formatMapping = {
  "date-time": "datetime-local",
  date: "date",
  time: "time",
  email: "email"
};

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 */
function controlTemplate(schema, ref) {
  /** @type {import("../lib/models").JsonSchema} */
  const currentSchema = getSchemaValue(schema, ref);

  return html`
    ${currentSchema.title
      ? html`
          <label for=${ref} title=${ifDefined(currentSchema.description)}
            >${currentSchema.title}</label
          >
        `
      : html``}
    <input
      type="${currentSchema.type === "string"
        ? formatMapping[currentSchema.format] || "text"
        : typeMapping[currentSchema.type]}"
      name="${ref}"
      aria-label=${ifDefined(currentSchema.title)}
      aria-description=${ifDefined(currentSchema.description)}
      minlength="${ifDefined(currentSchema.minLength)}"
      maxlength="${ifDefined(currentSchema.maxLength)}"
      min="${ifDefined(
        currentSchema.minimum || currentSchema.exclusiveMinimum
      )}"
      aria-valuemin=${ifDefined(
        currentSchema.minimum || currentSchema.exclusiveMinimum
      )}
      max="${ifDefined(
        currentSchema.maximum || currentSchema.exclusiveMaximum
      )}"
      aria-valuemax=${ifDefined(
        currentSchema.maximum || currentSchema.exclusiveMaximum
      )}
      step="${ifDefined(currentSchema.multipleOf)}"
      ?required=${isRequired(currentSchema, ref)}
      aria-required="${!!currentSchema.required}"
      pattern=${ifDefined(currentSchema.pattern)}
      title="${ifDefined(currentSchema.description)}"
      aria-readonly="${ifDefined(currentSchema.readOnly)}"
      ?readonly=${currentSchema.readOnly === true}
    />
  `;
}

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {TemplateResult}
 */
function arrayTemplate(schema, ref) {
  // TODO this needs to be moved to a binder becasue it needs data reference
  /** @type {import("../lib/models").JsonSchema} */
  const currentSchema = getSchemaValue(schema, ref);
  const { minItems, maxItems, uniqueItems, items } = currentSchema;

  if (typeof items === "boolean") {
    return null;
  }

  // object of number - infinite array - iterate data output vertical
  // object of object - infinite array
  // Array of object - finite array - iterate data same time output vertical with each object in a horizontal row (grid)
  // Array of Array?? - finite array - iterate uiSchema and data same time output horizontal
  if (items instanceof Array) {
    // Tuple
    // items: [{type: number},{type: number}]
    return html`
      <div>
        ${items
          .filter(item => typeof item !== "boolean")
          .map((item, i) =>
            controlTemplate(/** @type {JsonSchema} */ (item), `${ref}/${i}`)
          )}
      </div>
    `;
  }
  // List
  // items: { type: object }
  // items: { type: number|string|boolean }
  const itemLength =
    "properties" in items ? Object.keys(items.properties).length : 1;
  return html`
    <div
      form-json-schema-list
      name=${ref}
      .schema=${schema}
      minItems=${ifDefined(minItems)}
      maxItems=${ifDefined(maxItems)}
      uniqueItems=${ifDefined(uniqueItems)}
      style="display: grid; grid-template-columns: repeat(${itemLength}, max-content)"
    ></div>
  `;
}

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {TemplateResult}
 */
function stringTemplate(schema, ref) {
  /** @type {import("../lib/models").JsonSchema} schema to generate uiSchema for */
  const currentSchema = getSchemaValue(schema, ref);
  if (currentSchema.enum != null) {
    return enumTemplate(schema, ref);
  }
  return controlTemplate(schema, ref);
}

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {TemplateResult}
 */
function enumTemplate(schema, ref) {
  /** @type {import("../lib/models").JsonSchema} schema to generate uiSchema for */
  const currentSchema = getSchemaValue(schema, ref);
  return html`
    <select name="${ref}">
      ${currentSchema.enum.map(
        e =>
          html`
            <option value="${e}">${e}</option>
          `
      )}
    </select>
  `;
}

/**
 * @param {import("../lib/models").JsonSchema} schema to generate uiSchema for
 * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
 * @returns {TemplateResult}
 */
function objectTemplate(schema, ref) {
  /** @type {import("../lib/models").JsonSchema} schema to generate uiSchema for */
  const currentSchema = getSchemaValue(schema, ref);
  return html`
    ${Object.entries(currentSchema.properties).map(entry =>
      jsonSchemaTemplate({
        schema,
        component: {
          properties: {
            ref: `${ref}/${entry[0]}`,
            type: "text"
          },
          template: "Control"
        }
      })
    )}
  `;
}

const listBinder = {
  controlSelector: "[form-json-schema-list]",
  initializeEvents: () => {},
  writeValue: (arrayElem, data) => {
    const { schema } = arrayElem;
    const ref = getName(arrayElem);
    /** @type {JsonSchema} */
    const currentSchema = getSchemaValue(schema, ref);
    const { items } = currentSchema;
    if (typeof items !== "boolean" && items instanceof Array === false) {
      render(
        html`
          ${("properties" in items &&
            Object.entries(/** @type {JsonSchema} */ (items).properties)
              .filter(item => typeof item[1] !== "boolean")
              .map(
                /** @param {JsonSchema} item */ item =>
                  html`
                    <span
                      >${("title" in item[1] && item[1].title) || item[0]}</span
                    >
                  `
              )) ||
            html``}
          ${Object.entries(data).map((dataItem, i) =>
            items.type === "object"
              ? objectTemplate(schema, `${ref}/${i}`)
              : jsonTypeMapping[items.type](schema, `${ref}/${i}`)
          )}
        `,
        arrayElem
      );
    }
  }
};

controlBinder.add(listBinder);

/** @type {{[key: string]: (JsonSchema, string) => TemplateResult}} */
export const jsonTypeMapping = {
  string: stringTemplate,
  integer: controlTemplate,
  number: controlTemplate,
  object: objectTemplate,
  array: arrayTemplate,
  boolean: controlTemplate
};

/**
 * @param {import("../lib/models.js").SchemaLayoutContext<import("a-wc-form-layout/src/lib/models").Control>} context
 * @returns {TemplateResult}
 */
function jsonSchemaTemplate(context) {
  return html`
    <json-schema-control
      ref=${context.component.properties.ref}
    ></json-schema-control>
  `;
  // const { ref } = context.component.properties;
  // const { schema } = context;
  // /** @type {import("../lib/models").JsonSchema} schema to generate uiSchema for */
  // const currentSchema = getSchemaValue(schema, ref);
  // return jsonTypeMapping[currentSchema.type](schema, ref);
}

setComponentTemplate("JsonSchemaControl", jsonSchemaTemplate);
