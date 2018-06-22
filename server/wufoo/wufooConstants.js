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
    equals: 'Is_equal_to',
    notNull: 'Is_not_NULL'
};

//converts an english description of the field to the Field ID in wufoo
//this object has all fields
exports.allFields = {
    name: 'Field1',
    netid: 'Field3',
    phoneNumber: 'Field4',
    under18: 'Field105',
    foodRestrictions: 'Field106',
    medicalConcerns: 'Field107',
    accessibilityConcerns: 'Field108',
    primer: 'Field110',
    emergName: 'Field123',
    emergNumber: 'Field124',
    payOnline: 'Field129',
    payMail: 'Field133',
    payPerson: 'Field134'
};

exports.headings = {
    name: 'Name',
    netid: 'NetID',
    phoneNumber: 'Phone Number',
    under18: 'Under 18?',
    foodRestrictions: 'Food Restrictions',
    medicalConcerns: 'Medical Issues',
    accessibilityConcerns: 'Accessibility Issues',
    primer: 'Require Accessibility Primer',
    emergName: 'Emergency Contact Name',
    emergNumber: 'Emergency Contact Number',
    payment: "Payment Method"
};

//fields that any user can see
exports.generalFields = {
    name: 'Field1',
    netid: 'Field3',
    phoneNumber: 'Field4',
    under18: 'Field105',
    emergName: 'Field123',
    emergNumber: 'Field124',
    payOnline: 'Field129',
    payMail: 'Field133',
    payPerson: 'Field134'
};

//AND or OR for filters, has preamble so just tag on con.and or con.or to uri
exports.grouping = {
    and: '&match=AND',
    or: '&match=OR'
};

exports.sort = {
    asc: 'ASC',
    desc: 'DESC'
};