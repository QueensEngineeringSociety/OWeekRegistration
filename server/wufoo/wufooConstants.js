exports.operators = {
    contains: 'Contains',
    notContain: 'Does_not_contain',
    startWith: 'Begin_with',
    endWith: 'Ends_with',
    lessThan: 'Is_less_than',
    greaterThan: 'Is_greater_than',
    on: 'Is_on',
    before: 'Is_before',
    after: 'Is_after',
    notEqual: 'Is_not_equal_to',
    equal: 'Is_equal_to',
    notNull: 'Is_not_NULL'
};

//converts an english description of the field to the Field ID in wufoo
exports.fields = {
    name: 'Field1',
    allergies: 'Field6'
};

//AND or OR for filters, has preamble so just tag on con.and or con.or to uri
exports.grouping = {
    and: '&match=AND',
    or: '&match=OR'
};