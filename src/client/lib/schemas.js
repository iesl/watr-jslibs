
/**
 * Server interop datatypes
 **/

/* global _ require */

function schemaName(n) {
    return `http://watrworks.net/schemas/${n}Schema.json`;
}
function shortSchemaName(url) {
    let prefix = `http://watrworks.net/schemas/`;
    let postfix = `Schema.json`;
    let n1 = url.slice(prefix.length);
    let n2 = n1.slice(0, n1.length-postfix.length);
    return n2;
}

function defaultObj(n) {
    let o = {
        '$id': schemaName(n),
        'type': 'object',
        'additionalProperties': false,
        'properties': {
        }
    };
    return o;
}


let IntT = { "type": "integer" };
let IntOrNullT = { "type": ["integer", 'null'] };

let StrT = { "type": "string" };
let StrOrNullT = { "type": ["string", 'null'] };

let Ref = (n) => { return { "$ref": `${n}Schema.json` }; };


let CorpusLockSchema = Object.assign(defaultObj('CorpusLock'), {
    properties: {
        document : IntT,
        holder   : IntOrNullT,
        id       : IntT,
        lockPath : StrT,
        status   : StrT
    }
});


let WorkflowRecordSchema = Object.assign(defaultObj('WorkflowRecord'), {
    properties: {
        labelSchemas : Ref('LabelSchemas'),
        targetPath   : StrT,
        workflow     : StrT
    }
});

let LockedWorkflowSchema = Object.assign(defaultObj('LockedWorkflow'), {
    properties: {
        lockRecord     : Ref("CorpusLock"),
        workflowRecord : Ref("WorkflowRecord")
    }
});

let LabelSchemaSchema = Object.assign(defaultObj('LabelSchema'), {
    properties: {
        label       : StrT,
        description : StrOrNullT,
        children    : { items: Ref("LabelSchema") },
        abbrev      : { items: StrOrNullT }
    }
});

let LabelSchemasSchema = Object.assign(defaultObj('LabelSchemas'), {
    properties: {
        name: StrT,
        schemas: { items: Ref('LabelSchema') }
    }
});

let Ajv = require('ajv');

let ajv = new Ajv({
    schemas: [
        CorpusLockSchema,
        WorkflowRecordSchema,
        LockedWorkflowSchema,
        LabelSchemaSchema,
        LabelSchemasSchema
    ],
    allErrors: true
});


export function isValid(sname, data) {
    let validator = ajv.getSchema(schemaName(sname));
    if (validator == undefined) {
        let schemas = _.map(
            _.filter(_.keys(ajv._schemas), k => /watrworks.net/.test(k)),
            shortSchemaName
        );
        console.log('Schema name', sname, 'not found', 'available', schemas);
    }
    return validateData(validator, data);
}

function validateData(validator, data) {

    let valid = validator(data);

    if (!valid) {
        console.log('Error validating', data);
        _.each(validator.errors, e => {
            console.log('  >> ', e.keyword, e.dataPath, e.message, e.params);
        });
        throw Error("Json Schema Validation Error");
    }
    return data;
}
