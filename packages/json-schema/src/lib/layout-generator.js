// import { getValue } from "a-wc-form-binder/src/lib/json-pointer";

// /**
//  * @param {import("./models").JsonSchema} schema to generate uiSchema for
//  * @param {string} [startRef='#'] JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
//  * @returns {import("a-wc-form-layout/src/lib/models").Component} for the schema passed in
//  */
// export function getLayout(schema, startRef) {
//   return schema2Layout[schema.type](schema, startRef || "#");
// }

// /**
//  * @param {import("./models").JsonSchema} schema to generate uiSchema for
//  * @param {string} ref JSON pointer string to use as a starting point. Use if we are generating uiSchema for only a part of the schema.
//  * @returns {boolean} if the schema field is required
//  */
// function isRequired(schema, ref) {
//   const innerProperties = ref.substr(0, ref.lastIndexOf("/"));
//   /** @type {import("./models").JsonSchema} */
//   const parentSchema = getValue(schema, innerProperties);
//   const property = ref.substr(ref.lastIndexOf("/") + 1);
//   return (
//     parentSchema.required != null &&
//     parentSchema.required.indexOf(property) > -1
//   );
// }

// /**
//  * @param {import("./models").JsonSchema} schema
//  * @param {string} ref JSON pointer
//  * @returns {import("a-wc-form-layout/src/lib/models").Control}
//  */
// const booleanControl = (schema, ref) => ({
//   template: "Control",
//   properties: {
//     ref,
//     type: "checkbox",
//     description: schema.description,
//     label: schema.title,
//     readOnly: schema.readOnly,
//     validation: {
//       required: isRequired(schema, ref)
//     }
//   }
// });

// /**
//  * @param {import("./models").JsonSchema} schema
//  * @param {string} ref JSON pointer
//  * @returns {import("a-wc-form-layout/src/lib/models").Control}
//  */
// const integerControl = (schema, ref) => ({
//   template: "Control",
//   properties: {
//     ref,
//     type: "number",
//     description: schema.description,
//     label: schema.title,
//     readOnly: schema.readOnly,
//     validation: {
//       required: isRequired(schema, ref),
//       min: schema.minimum || schema.exclusiveMinimum,
//       max: schema.maximum || schema.exclusiveMaximum,
//       step: 1
//     }
//   }
// });

// /**
//  * @param {import("./models").JsonSchema} schema
//  * @param {string} ref JSON pointer
//  * @returns {import("a-wc-form-layout/src/lib/models").Control}
//  */
// const numberControl = (schema, ref) => ({
//   template: "Control",
//   properties: {
//     ref,
//     type: "number",
//     description: schema.description,
//     label: schema.title,
//     readOnly: schema.readOnly,
//     validation: {
//       required: isRequired(schema, ref),
//       min: schema.minimum || schema.exclusiveMinimum,
//       max: schema.maximum || schema.exclusiveMaximum
//     }
//   }
// });

// /**
//  * @param {import("./models").JsonSchema} schema
//  * @param {string} ref JSON pointer
//  * @returns {import("a-wc-form-layout/src/lib/models").Control}
//  */
// const stringControl = (schema, ref) => ({
//   template: "Control",
//   properties: {
//     ref,
//     type: "text",
//     description: schema.description,
//     label: schema.title,
//     readOnly: schema.readOnly,
//     validation: {
//       required: isRequired(schema, ref),
//       minLength: schema.minLength,
//       maxLength: schema.maxLength,
//       pattern: schema.pattern
//     }
//   }
// });

// /**
//  * @param {import("./models").JsonSchema} schema
//  * @param {string} ref JSON pointer
//  * @returns {import("a-wc-form-layout/src/lib/models").Control}
//  */
// const arrayControl = (schema, ref) => {
//   const { minItems, maxItems, uniqueItems, items } = schema;

//   if (typeof items === "boolean") {
//     return null;
//   }

//   const itemDataArray = getValue(context.data, currentUiSchema.ref);

//   /** @type {Array<TemplateResult>} */
//   const components = [];
//   // TODO abstract the array iteration logic away from the HTML mark-up so that it can be reused.

//   // object of number - infinite array - iterate data output vertical
//   // object of object - infinite array
//   // Array of object - finite array - iterate data same time output vertical with each obect in a horizontal row (grid)
//   // Array of Array?? - finite array - iterate uiSchema and data same time output horizontal
//   if (items instanceof Array) {
//     // items: [{type: number},{type: number}]
//     itemDataArray.forEach((dataItem, i) => {
//       const item = items[i];
//       if (typeof item !== "boolean") {
//         const uiSchema = getLayout(item, `${ref}/items/${i}`);
//       }
//     });
//   } else {
//     // items: { type: object }
//     // items: { type: number }
//     itemDataArray.forEach((dataItem, i) => {
//       const uiSchema = getLayout(items, `${ref}/items/${i}`);
//       templates.push(
//         getTemplate({
//           ...context,
//           currentData: dataItem,
//           currentUiSchema: uiSchema
//         })
//       );
//     });
//   }
//   return templates;
// };

// const schema2Layout = {
//   boolean: booleanControl,
//   integer: (schema, ref) => ({
//     type: "Control",
//     ref
//   }),
//   number: (schema, ref) => ({
//     type: "Control",
//     ref
//   }),
//   string: (schema, ref) => ({
//     type: "Control",
//     ref
//   }),
//   array: (schema, ref) => ({
//     type: "Control",
//     ref
//   }),
//   object: (schema, ref) => {
//     const innerScope = ref;
//     const arrayItemIndex = ref.match(/\/(\d+)$/);
//     return {
//       type:
//         arrayItemIndex && arrayItemIndex[1]
//           ? "HorizontalLayout"
//           : "VerticalLayput",
//       elements: Object.entries(schema.properties).map(entry =>
//         schema2Layout[entry[1].type](entry[1], `${innerScope}/${entry[0]}`)
//       )
//     };
//   }
// };

// /**
//  * Generates JSON schema from plain data
//  * @param {Object} data to generate the JSONSchema for
//  * @returns {import("./models").JsonSchema}
//  */
// export function getSchema(data) {
//   return obj2Schema[typeof data](data);
// }

// const obj2Schema = {
//   boolean: data => ({ type: "boolean" }),
//   number: data => ({ type: "number" }),
//   string: data => ({ type: "string" }),
//   array: data => {
//     const schema = {
//       type: "array",
//       items: data.length ? getSchema(data[0]) : { type: "string" }
//     };
//     return schema;
//   },
//   object: data => {
//     if (data instanceof Array) {
//       return obj2Schema.array(data);
//     }

//     const schema = {
//       type: "object",
//       properties: {}
//     };
//     Object.entries(data).forEach(entry => {
//       schema.properties[entry[0]] = getSchema(entry[1]);
//     });
//     return schema;
//   }
// };
