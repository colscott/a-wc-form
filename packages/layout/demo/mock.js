export const layout = {
  template: 'VerticalLayout',
  label: 'Person',
  properties: {
    components: [
      {
        template: 'HorizontalLayout',
        properties: {
          label: 'Personal (Horizontal Layout)',
          components: [
            {
              // String input
              template: 'Control',
              properties: {
                ref: '#/name', // JSON pointer to data backing this control
                type: 'text', // Input type
                label: 'First Name (Text Control)', // Input label
                description: 'Please enter your name', // Input description
                minLength: 3, // min text length
                maxLength: 30, // max text length
                pattern: '^[a-z|A-Z]+$', // Regex validation pattern
              },
            },
            {
              // Number input
              template: 'Control',
              properties: {
                ref: '#/personalData/age',
                type: 'number',
                label: 'Age (Number Control)',
                min: 18, // min value
                max: 150, // max value
                step: 1, // incremental step size
                required: true, // mark this control as required
              },
            },
            {
              // Date input
              template: 'Control',
              properties: {
                ref: '#/birthDate',
                type: 'date',
                label: 'Date of Birth (Date Control)',
              },
            },
            {
              // Boolean input
              template: 'Control',
              properties: {
                ref: '#/student',
                type: 'checkbox',
                label: 'Student (Boolean Control)',
              },
            },
          ],
        },
      },
      {
        template: 'HorizontalLayout',
        properties: {
          label: 'Personal (Horizontal Control)',
          components: [
            {
              // Select
              template: 'Control',
              properties: {
                ref: '#/occupation',
                label: 'Occupation (Enum Control)',
                possibleValues: [
                  'Accountant',
                  'Engineer',
                  'Freelancer',
                  'Journalism',
                  'Physician',
                  'Student',
                  'Teacher',
                  'Other',
                ],
              },
            },
          ],
        },
      },
      {
        // Array objects
        template: 'GridLayout',
        properties: {
          ref: '#/comments',
          label: 'Comments (Array<Object>)',
          components: [
            // components to use for each object entry in the Array
            {
              template: 'Control',
              properties: {
                type: 'date',
                label: 'Date',
                ref: 'date',
              },
            },
            {
              template: 'Control',
              properties: {
                type: 'text',
                label: 'Message',
                ref: 'message',
              },
            },
          ],
        },
      },
      {
        // Array primitives
        template: 'ArrayLayout',
        properties: {
          label: 'Telephone numbers (Array<Primitive>)',
          ref: '#/telephoneNumbers',
          component: {
            // The component to use for each entry
            template: 'Control',
            properties: {
              type: 'text',
              label: 'Tel #',
              pattern: '\\d{3}-\\d{3}-\\d{4}',
            },
          },
        },
      },
      {
        // Tuple
        template: 'HorizontalLayout',
        properties: {
          label: 'Address (Tuple)',
          components: [
            {
              template: 'Control',
              properties: {
                ref: '#/address/0',
                label: 'Unit',
                type: 'number',
              },
            },
            {
              template: 'Control',
              properties: {
                ref: '#/address/1',
                type: 'text',
                label: 'Street',
              },
            },
            {
              template: 'Control',
              properties: {
                ref: '#/address/2',
                label: 'Type',
                possibleValues: ['Street', 'Avenue', 'Boulevard'],
              },
            },
            {
              template: 'Control',
              properties: {
                ref: '#/address/3',
                label: 'Direction',
                possibleValues: ['NW', 'NE', 'SW', 'SE'],
              },
            },
          ],
        },
      },
    ],
  },
};
