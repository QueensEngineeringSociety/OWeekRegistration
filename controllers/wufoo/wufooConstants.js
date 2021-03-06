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
    pronouns: 'Field137',
    accessibilityConcerns: 'Field108',
    primer: 'Field110',
    emergName: 'Field123',
    emergNumber: 'Field124',
    payStatus: 'Status',
    payOnline: 'Field129',
    payMail: 'Field133',
    payPerson: 'Field134',
    comment: 'comment'
};

exports.groupFields = {
    name: 'Field1',
    netid: 'Field3',
    phoneNumber: 'Field4',
    under18: 'Field105',
    foodRestrictions: 'Field106',
    medicalConcerns: 'Field107',
    pronouns: 'Field137',
    accessibilityConcerns: 'Field108',
    primer: 'Field110',
    emergName: 'Field123',
    emergNumber: 'Field124'
};

exports.getAccessibleFields = function (isAdmin) {
    return isAdmin ? exports.allFields : exports.generalFields;
};

exports.headings = {
    name: 'Name',
    netid: 'NetID',
    phoneNumber: 'Phone Number',
    under18: 'Under 18?',
    foodRestrictions: 'Food Restrictions',
    medicalConcerns: 'Medical Issues',
    pronouns: 'Pronouns',
    accessibilityConcerns: 'Accessibility Issues',
    primer: 'Require Accessibility Primer',
    emergName: 'Emergency Contact Name',
    emergNumber: 'Emergency Contact Number',
    payStatus: 'Payment Status',
    paymentMethod: "Payment Method",
    comment: 'Comments'
};

//fields that any user can see
exports.generalFields = {
    name: 'Field1',
    netid: 'Field3',
    phoneNumber: 'Field4',
    under18: 'Field105',
    emergName: 'Field123',
    emergNumber: 'Field124',
    payStatus: 'Status',
    payOnline: 'Field129',
    payMail: 'Field133',
    payPerson: 'Field134',
    comment: 'comment'
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