
/**
 * Server interop datatypes
 **/

/* global require */

import * as _ from 'lodash';
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

    rec('PageRegion', {
        page: {
            stableId: Str,
            pageNum : Int
        },
        bbox: {
            left   : Int,
            top    : Int,
            width  : Int,
            height : Int
        }
    }),

    rec('Location', {
        Zone: {
            regions: ArrayOf( Ref('PageRegion') )
        }
    }),

    rec('Zone', {
        name: Str,
        schemas: ArrayOf( Ref('LabelSchema') )
    }),

    rec('Annotation', {
        id        : Int,
        document  : Int,
        owner     : IntOrNull,
        annotPath : StrOrNull,
        created   : Int,
        label     : Str,
        location  : Ref('Location'),
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

// class Assignment {
//     constructor (zonelock) {
//         // this.workflow = workflow;
//         this.zonelock = zonelock;
//         // this.zone = zone;
//     }
//     // constructor (workflow, zonelock, zone) {
//     //     this.workflow = workflow;
//     //     this.zonelock = zonelock;
//     //     this.zone = zone;
//     // }
// }

// export function assignmentsFromJson(jsonReps) {
//     return _.map(jsonReps, js=> {
//         let {document, holder, id, lockPath, status} = js;
//         // let y = zonelockFromJson(assignmentJson.zonelock);
//         // let z = zoneFromJson(assignmentJson.zone);
//         // y.assignee = assignmentJson.assignee;
//         return js;
//     });
// }

// class Workflow {
//     constructor (slug, description, targetLabel, curatedLabels) {
//         this.slug          = slug;
//         this.description   = description;
//         this.targetLabel   = targetLabel;
//         this.curatedLabels = curatedLabels;
//     }

// }

// export function workflowFromJson(jsonRep) {
//     return new Workflow(
//         jsonRep.workflow,
//         jsonRep.description,
//         jsonRep.targetLabel,
//         jsonRep.curatedLabels
//     );
// }


// class Zone {
//     constructor (zoneId, label, order, regions, glyphDefs) {
//         this.zoneId = zoneId;
//         this.label = label;
//         this.order = order;
//         this.regions = regions;
//         this.glyphDefs = glyphDefs;
//     }

// }

// class PageRegion {
//     constructor (regionId, stableId, bbox, pageId, pageNum, zoneId) {
//         this.regionId = regionId;
//         this.stableId = stableId;
//         this.bbox = bbox;
//         this.pageId = pageId;
//         this.pageNum = pageNum;
//         this.zoneId = zoneId;
//     }
// }


// export function zoneFromJson(jsonRep) {
//     let glyphDefs = null;
//     if (jsonRep.glyphDefs !== null) {
//         glyphDefs = JSON.parse(jsonRep.glyphDefs);
//     }
//     return new Zone(
//         jsonRep.id,
//         jsonRep.label,
//         jsonRep.order,
//         _.map(jsonRep.regions, (r) => pageRegionFromJson(r, jsonRep.id)),
//         glyphDefs
//     );

// }

// export function pageRegionFromJson(jsonRep, zoneId) {
//     return new PageRegion(
//         jsonRep.regionId,
//         jsonRep.page.stableId,
//         coords.mk.fromLtwhFloatReps(jsonRep.bbox),
//         jsonRep.page.pageId,
//         jsonRep.page.pageNum,
//         zoneId
//     );

// }
