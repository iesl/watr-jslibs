
/**
 * Server interop datatypes
 **/

/* global _ require */

let Ajv = require('ajv');

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
        additionalProperties: false,
        properties: {
        },
        required: []
    };
    return o;
}

function rec(n, props) {
    // let {req, opt} = props;
    let reqs = {
        properties: props,
        required: _.keys(props)
    };
    return Object.assign(defaultObj(n), reqs);
}


let Int = { "type": "integer" };
let IntOrNull = { "type": ["integer", 'null'] };

let Str = { "type": "string" };
let StrOrNull = { "type": ["string", 'null'] };

let Ref = (n) => { return { "$ref": `${n}Schema.json` }; };
let ArrayOf = (t) => { return { "items": t }; };


function createSchemas(schemaArray) {
    return new Ajv({
        schemas: schemaArray,
        allErrors: true
    });
}

let ajv = createSchemas([

    rec('CorpusLock', {
        document : Int,
        holder   : IntOrNull,
        id       : Int,
        lockPath : Str,
        status   : Str
    }),

    rec('WorkflowRecord', {
        labelSchemas : Ref('LabelSchemas'),
        targetPath   : Str,
        workflow     : Str
    }),

    rec('LockedWorkflow', {
        lockRecord     : Ref("CorpusLock"),
        workflowRecord : Ref("WorkflowRecord")
    }),

    rec('LabelSchema', {
        label       : Str,
        description : StrOrNull,
        children    : ArrayOf(Ref("LabelSchema")),
        abbrev      : ArrayOf(StrOrNull)
    }),

    rec('LabelSchemas', {
        name: Str,
        schemas: ArrayOf( Ref('LabelSchema') )
    }),

    rec('Annotation', {
        id        : Int,
        document  : Int,
        owner     : IntOrNull,
        annotPath : StrOrNull,
        created   : Int,
        body      : StrOrNull
    })

]);



export function allValid(sname) {
    return function(data) {
        _.each(data, isValid(sname));
        return data;
    };
}

export function isValid(sname) {
    let validator = ajv.getSchema(schemaName(sname));
    if (validator == undefined) {
        let schemas = _.map(
            _.filter(_.keys(ajv._schemas), k => /watrworks.net/.test(k)),
            shortSchemaName
        );
        console.log('Schema name', sname, 'not found.');
        console.log('Available schemas: ', schemas);
    }
    return function(data) {
        return validateData(validator, data);
    };
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
