
/**
 * Server interop datatypes
 **/

/* global _ require */
var defsSchema = {
    "$id": "http://example.com/schemas/defs.json",
    "t": {
        "int": { "type": "integer" },
        "str": { "type": "string" },
        "str?": { "type": [null, "string"] },
        "int?": { "type": [null, "integer"] }
    }
};

let CorpusLockSchema = {
    "$id": "http://example.com/schemas/CorpusLockSchema.json",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "document": { "$ref": "defs.json#/t/int" },
        "holder": { "$ref": "defs.json#/t/int?" },
        "id": { "$ref": "defs.json#/t/int" },
        "lockPath": { "$ref": "defs.json#/t/str" },
        "status": { "$ref": "defs.json#/t/str" }
    }
};

let WorkflowRecordSchema = {
    "$id": "http://example.com/schemas/WorkflowRecordSchema.json",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "labelSchemas": { "$ref": "LabelSchemasSchema.json" },
        "targetPath": { "$ref": "defs.json#/t/str" },
        "workflow": { "$ref": "defs.json#/t/str" }
    }
};

let LockedWorkflowSchema = {
    "$id": "http://example.com/schemas/LockedWorkflowSchema.json",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "lockRecord": { "$ref": "CorpusLockSchema.json" },
        "workflowRecord": { "$ref": "WorkflowRecordSchema.json" }
    }
};


let LabelSchemaSchema = {
    "$id": "http://example.com/schemas/LabelSchemaSchema.json",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "label": { "$ref": "defs.json#/t/str" },
        "description": { "$ref": "defs.json#/t/str?" },
        "children": { "items":  { "$ref": "LabelSchemaSchema.json" } },
        "abbrev": { "items": { "$ref": "defs.json#/t/str?" } }
    }
};
let LabelSchemasSchema = {
    "$id": "http://example.com/schemas/LabelSchemasSchema.json",
    "type": "object",
    "additionalProperties": false,
    "properties": {
        "name": { "$ref": "defs.json#/t/str" },
        "schemas": { "items": { "$ref": "LabelSchemaSchema.json" } }
    }
};
let Ajv = require('ajv');

let ajv = new Ajv({
    schemas: [
        defsSchema,
        CorpusLockSchema,
        WorkflowRecordSchema,
        LockedWorkflowSchema,
        LabelSchemaSchema,
        LabelSchemasSchema
    ],
    allErrors: true
});


export function validateCorpusLock(data) {
    let validator = ajv.getSchema('http://example.com/schemas/CorpusLockSchema.json');
    return validateData(validator, data);
}


export function validateLockedWorkflow(data) {
    let validator = ajv.getSchema('http://example.com/schemas/LockedWorkflowSchema.json');
    return validateData(validator, data);
}

export function validateData(validator, data) {

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
