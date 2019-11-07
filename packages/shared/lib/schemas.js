/**
 * Server interop datatypes
 **/

/* global require */
// import * as _ from 'lodash';
// let Ajv = require('ajv');
// function schemaName(n) {
//     return `http://watrworks.net/schemas/${n}Schema.json`;
// }
// function shortSchemaName(url) {
//     let prefix = `http://watrworks.net/schemas/`;
//     let postfix = `Schema.json`;
//     let n1 = url.slice(prefix.length);
//     let n2 = n1.slice(0, n1.length-postfix.length);
//     return n2;
// }
// function defaultObj(n) {
//     let o = {
//         '$id': schemaName(n),
//         'type': 'object',
//         additionalProperties: false,
//         properties: {
//         },
//         required: []
//     };
//     return o;
// }
// function recprops(props) {
//     let reqs = {
//         properties: props,
//         required: _.keys(props)
//     };
//     return Object.assign(defaultObj(''), reqs);
// }
// function rec(name, props) {
//     let reqs = {
//         properties: props,
//         required: _.keys(props)
//     };
//     return Object.assign(defaultObj(name), reqs);
// }
// let Ref = (n) => { return { "$ref": `${n}Schema.json` }; };
// let ArrayOf = (t) => { return { "items": t }; };
// let NullOr = (t) => {
//     return {
//         'type':['object', 'null'],
//         'oneOf':[
//             t,
//             {'type':'null'}
//         ]
//     };
// };
// let Int = { "type": "integer" };
// let IntOrNull = { "type": ["integer", 'null'] };
// let Str = { "type": "string" };
// let StrOrNull =  { "type": ["string", 'null'] };
// let TextGridOrNull = NullOr(Ref('Body'));
// function createSchemas(schemaArray) {
//     return new Ajv({
//         schemas: schemaArray,
//         allErrors: true
//     });
// }
// let ajv = createSchemas([
//     rec('Body', {
//         'TextGrid' : Ref('TextGrid')
//     }),
//     rec('TextGrid', {
//         textGridDef: StrOrNull
//     }),
//     rec('CorpusLock', {
//         document : Int,
//         holder   : IntOrNull,
//         id       : Int,
//         lockPath : Str,
//         status   : Str
//     }),
//     rec('WorkflowRecord', {
//         labelSchemas : Ref('LabelSchemas'),
//         targetPath   : Str,
//         workflow     : Str
//     }),
//     rec('LockedWorkflow', {
//         lockRecord     : Ref("CorpusLock"),
//         workflowRecord : Ref("WorkflowRecord")
//     }),
//     rec('LabelSchema', {
//         label       : Str,
//         description : StrOrNull,
//         children    : ArrayOf(Ref("LabelSchema")),
//         abbrev      : ArrayOf(StrOrNull)
//     }),
//     rec('LabelSchemas', {
//         name: Str,
//         schemas: ArrayOf( Ref('LabelSchema') )
//     }),
//     rec('PageRegion', {
//         page: {
//             stableId: Str,
//             pageNum : Int
//         },
//         bbox: ArrayOf( [Int, Int, Int, Int] )
//     }),
//     rec('Location', {
//         Zone: recprops({
//             regions: ArrayOf( Ref('PageRegion') )
//         })
//     }),
//     rec('Zone', {
//         name: Str,
//         schemas: ArrayOf( Ref('LabelSchema') )
//     }),
//     rec('Annotation', {
//         id        : Int,
//         document  : Int,
//         owner     : IntOrNull,
//         annotPath : StrOrNull,
//         created   : Int,
//         label     : Str,
//         location  : Ref('Location'),
//         body      : TextGridOrNull
//     }),
//     // rec('TraceLogBody', {
//     // }),
//     // rec('TraceLogs', {
//     //     page: Str,
//     //     logType: Str,
//     //     body: ArrayOf( )
//     // }),
// ]);
// export function allValid(sname) {
//     return function(data) {
//         _.each(data, isValid(sname));
//         return data;
//     };
// }
// export function isValid(sname) {
//     let validator = ajv.getSchema(schemaName(sname));
//     if (validator === undefined) {
//         let schemas = _.map(
//             _.filter(_.keys(ajv._schemas), k => /watrworks.net/.test(k)),
//             shortSchemaName
//         );
//         console.log('Schema name', sname, 'not found.');
//         console.log('Available schemas: ', schemas);
//         throw Error("Json Schema Validation Error");
//     }
//     return function(data) {
//         return validateData(validator, data);
//     };
// }
// function validateData(validator, data) {
//     let valid = validator(data);
//     if (!valid) {
//         console.log('Error validating', data);
//         _.each(validator.errors, e => {
//             console.log('  >> ', e.keyword, e.dataPath, e.message, e.params);
//         });
//         throw Error("Json Schema Validation Error");
//     }
//     return data;
// }
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zY2hlbWFzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOzs7O0FBSUE7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFHQTtBQUNBO0FBRUE7QUFFQTtBQUVBO0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiXG4vKipcbiAqIFNlcnZlciBpbnRlcm9wIGRhdGF0eXBlc1xuICoqL1xuXG4vKiBnbG9iYWwgcmVxdWlyZSAqL1xuXG4vLyBpbXBvcnQgKiBhcyBfIGZyb20gJ2xvZGFzaCc7XG4vLyBsZXQgQWp2ID0gcmVxdWlyZSgnYWp2Jyk7XG5cbi8vIGZ1bmN0aW9uIHNjaGVtYU5hbWUobikge1xuLy8gICAgIHJldHVybiBgaHR0cDovL3dhdHJ3b3Jrcy5uZXQvc2NoZW1hcy8ke259U2NoZW1hLmpzb25gO1xuLy8gfVxuXG4vLyBmdW5jdGlvbiBzaG9ydFNjaGVtYU5hbWUodXJsKSB7XG4vLyAgICAgbGV0IHByZWZpeCA9IGBodHRwOi8vd2F0cndvcmtzLm5ldC9zY2hlbWFzL2A7XG4vLyAgICAgbGV0IHBvc3RmaXggPSBgU2NoZW1hLmpzb25gO1xuLy8gICAgIGxldCBuMSA9IHVybC5zbGljZShwcmVmaXgubGVuZ3RoKTtcbi8vICAgICBsZXQgbjIgPSBuMS5zbGljZSgwLCBuMS5sZW5ndGgtcG9zdGZpeC5sZW5ndGgpO1xuLy8gICAgIHJldHVybiBuMjtcbi8vIH1cblxuLy8gZnVuY3Rpb24gZGVmYXVsdE9iaihuKSB7XG4vLyAgICAgbGV0IG8gPSB7XG4vLyAgICAgICAgICckaWQnOiBzY2hlbWFOYW1lKG4pLFxuLy8gICAgICAgICAndHlwZSc6ICdvYmplY3QnLFxuLy8gICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4vLyAgICAgICAgIHByb3BlcnRpZXM6IHtcbi8vICAgICAgICAgfSxcbi8vICAgICAgICAgcmVxdWlyZWQ6IFtdXG4vLyAgICAgfTtcbi8vICAgICByZXR1cm4gbztcbi8vIH1cblxuLy8gZnVuY3Rpb24gcmVjcHJvcHMocHJvcHMpIHtcbi8vICAgICBsZXQgcmVxcyA9IHtcbi8vICAgICAgICAgcHJvcGVydGllczogcHJvcHMsXG4vLyAgICAgICAgIHJlcXVpcmVkOiBfLmtleXMocHJvcHMpXG4vLyAgICAgfTtcbi8vICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihkZWZhdWx0T2JqKCcnKSwgcmVxcyk7XG4vLyB9XG5cbi8vIGZ1bmN0aW9uIHJlYyhuYW1lLCBwcm9wcykge1xuLy8gICAgIGxldCByZXFzID0ge1xuLy8gICAgICAgICBwcm9wZXJ0aWVzOiBwcm9wcyxcbi8vICAgICAgICAgcmVxdWlyZWQ6IF8ua2V5cyhwcm9wcylcbi8vICAgICB9O1xuLy8gICAgIHJldHVybiBPYmplY3QuYXNzaWduKGRlZmF1bHRPYmoobmFtZSksIHJlcXMpO1xuLy8gfVxuXG4vLyBsZXQgUmVmID0gKG4pID0+IHsgcmV0dXJuIHsgXCIkcmVmXCI6IGAke259U2NoZW1hLmpzb25gIH07IH07XG4vLyBsZXQgQXJyYXlPZiA9ICh0KSA9PiB7IHJldHVybiB7IFwiaXRlbXNcIjogdCB9OyB9O1xuLy8gbGV0IE51bGxPciA9ICh0KSA9PiB7XG4vLyAgICAgcmV0dXJuIHtcbi8vICAgICAgICAgJ3R5cGUnOlsnb2JqZWN0JywgJ251bGwnXSxcbi8vICAgICAgICAgJ29uZU9mJzpbXG4vLyAgICAgICAgICAgICB0LFxuLy8gICAgICAgICAgICAgeyd0eXBlJzonbnVsbCd9XG4vLyAgICAgICAgIF1cbi8vICAgICB9O1xuLy8gfTtcblxuXG4vLyBsZXQgSW50ID0geyBcInR5cGVcIjogXCJpbnRlZ2VyXCIgfTtcbi8vIGxldCBJbnRPck51bGwgPSB7IFwidHlwZVwiOiBbXCJpbnRlZ2VyXCIsICdudWxsJ10gfTtcblxuLy8gbGV0IFN0ciA9IHsgXCJ0eXBlXCI6IFwic3RyaW5nXCIgfTtcblxuLy8gbGV0IFN0ck9yTnVsbCA9ICB7IFwidHlwZVwiOiBbXCJzdHJpbmdcIiwgJ251bGwnXSB9O1xuXG4vLyBsZXQgVGV4dEdyaWRPck51bGwgPSBOdWxsT3IoUmVmKCdCb2R5JykpO1xuXG5cbi8vIGZ1bmN0aW9uIGNyZWF0ZVNjaGVtYXMoc2NoZW1hQXJyYXkpIHtcbi8vICAgICByZXR1cm4gbmV3IEFqdih7XG4vLyAgICAgICAgIHNjaGVtYXM6IHNjaGVtYUFycmF5LFxuLy8gICAgICAgICBhbGxFcnJvcnM6IHRydWVcbi8vICAgICB9KTtcbi8vIH1cblxuLy8gbGV0IGFqdiA9IGNyZWF0ZVNjaGVtYXMoW1xuXG4vLyAgICAgcmVjKCdCb2R5Jywge1xuLy8gICAgICAgICAnVGV4dEdyaWQnIDogUmVmKCdUZXh0R3JpZCcpXG4vLyAgICAgfSksXG5cbi8vICAgICByZWMoJ1RleHRHcmlkJywge1xuLy8gICAgICAgICB0ZXh0R3JpZERlZjogU3RyT3JOdWxsXG4vLyAgICAgfSksXG5cbi8vICAgICByZWMoJ0NvcnB1c0xvY2snLCB7XG4vLyAgICAgICAgIGRvY3VtZW50IDogSW50LFxuLy8gICAgICAgICBob2xkZXIgICA6IEludE9yTnVsbCxcbi8vICAgICAgICAgaWQgICAgICAgOiBJbnQsXG4vLyAgICAgICAgIGxvY2tQYXRoIDogU3RyLFxuLy8gICAgICAgICBzdGF0dXMgICA6IFN0clxuLy8gICAgIH0pLFxuXG4vLyAgICAgcmVjKCdXb3JrZmxvd1JlY29yZCcsIHtcbi8vICAgICAgICAgbGFiZWxTY2hlbWFzIDogUmVmKCdMYWJlbFNjaGVtYXMnKSxcbi8vICAgICAgICAgdGFyZ2V0UGF0aCAgIDogU3RyLFxuLy8gICAgICAgICB3b3JrZmxvdyAgICAgOiBTdHJcbi8vICAgICB9KSxcblxuLy8gICAgIHJlYygnTG9ja2VkV29ya2Zsb3cnLCB7XG4vLyAgICAgICAgIGxvY2tSZWNvcmQgICAgIDogUmVmKFwiQ29ycHVzTG9ja1wiKSxcbi8vICAgICAgICAgd29ya2Zsb3dSZWNvcmQgOiBSZWYoXCJXb3JrZmxvd1JlY29yZFwiKVxuLy8gICAgIH0pLFxuXG4vLyAgICAgcmVjKCdMYWJlbFNjaGVtYScsIHtcbi8vICAgICAgICAgbGFiZWwgICAgICAgOiBTdHIsXG4vLyAgICAgICAgIGRlc2NyaXB0aW9uIDogU3RyT3JOdWxsLFxuLy8gICAgICAgICBjaGlsZHJlbiAgICA6IEFycmF5T2YoUmVmKFwiTGFiZWxTY2hlbWFcIikpLFxuLy8gICAgICAgICBhYmJyZXYgICAgICA6IEFycmF5T2YoU3RyT3JOdWxsKVxuLy8gICAgIH0pLFxuXG4vLyAgICAgcmVjKCdMYWJlbFNjaGVtYXMnLCB7XG4vLyAgICAgICAgIG5hbWU6IFN0cixcbi8vICAgICAgICAgc2NoZW1hczogQXJyYXlPZiggUmVmKCdMYWJlbFNjaGVtYScpIClcbi8vICAgICB9KSxcblxuLy8gICAgIHJlYygnUGFnZVJlZ2lvbicsIHtcbi8vICAgICAgICAgcGFnZToge1xuLy8gICAgICAgICAgICAgc3RhYmxlSWQ6IFN0cixcbi8vICAgICAgICAgICAgIHBhZ2VOdW0gOiBJbnRcbi8vICAgICAgICAgfSxcbi8vICAgICAgICAgYmJveDogQXJyYXlPZiggW0ludCwgSW50LCBJbnQsIEludF0gKVxuLy8gICAgIH0pLFxuXG4vLyAgICAgcmVjKCdMb2NhdGlvbicsIHtcbi8vICAgICAgICAgWm9uZTogcmVjcHJvcHMoe1xuLy8gICAgICAgICAgICAgcmVnaW9uczogQXJyYXlPZiggUmVmKCdQYWdlUmVnaW9uJykgKVxuLy8gICAgICAgICB9KVxuLy8gICAgIH0pLFxuXG4vLyAgICAgcmVjKCdab25lJywge1xuLy8gICAgICAgICBuYW1lOiBTdHIsXG4vLyAgICAgICAgIHNjaGVtYXM6IEFycmF5T2YoIFJlZignTGFiZWxTY2hlbWEnKSApXG4vLyAgICAgfSksXG5cbi8vICAgICByZWMoJ0Fubm90YXRpb24nLCB7XG4vLyAgICAgICAgIGlkICAgICAgICA6IEludCxcbi8vICAgICAgICAgZG9jdW1lbnQgIDogSW50LFxuLy8gICAgICAgICBvd25lciAgICAgOiBJbnRPck51bGwsXG4vLyAgICAgICAgIGFubm90UGF0aCA6IFN0ck9yTnVsbCxcbi8vICAgICAgICAgY3JlYXRlZCAgIDogSW50LFxuLy8gICAgICAgICBsYWJlbCAgICAgOiBTdHIsXG4vLyAgICAgICAgIGxvY2F0aW9uICA6IFJlZignTG9jYXRpb24nKSxcbi8vICAgICAgICAgYm9keSAgICAgIDogVGV4dEdyaWRPck51bGxcbi8vICAgICB9KSxcblxuLy8gICAgIC8vIHJlYygnVHJhY2VMb2dCb2R5Jywge1xuLy8gICAgIC8vIH0pLFxuLy8gICAgIC8vIHJlYygnVHJhY2VMb2dzJywge1xuLy8gICAgIC8vICAgICBwYWdlOiBTdHIsXG4vLyAgICAgLy8gICAgIGxvZ1R5cGU6IFN0cixcbi8vICAgICAvLyAgICAgYm9keTogQXJyYXlPZiggKVxuLy8gICAgIC8vIH0pLFxuXG4vLyBdKTtcblxuXG5cbi8vIGV4cG9ydCBmdW5jdGlvbiBhbGxWYWxpZChzbmFtZSkge1xuLy8gICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4vLyAgICAgICAgIF8uZWFjaChkYXRhLCBpc1ZhbGlkKHNuYW1lKSk7XG4vLyAgICAgICAgIHJldHVybiBkYXRhO1xuLy8gICAgIH07XG4vLyB9XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiBpc1ZhbGlkKHNuYW1lKSB7XG4vLyAgICAgbGV0IHZhbGlkYXRvciA9IGFqdi5nZXRTY2hlbWEoc2NoZW1hTmFtZShzbmFtZSkpO1xuLy8gICAgIGlmICh2YWxpZGF0b3IgPT09IHVuZGVmaW5lZCkge1xuLy8gICAgICAgICBsZXQgc2NoZW1hcyA9IF8ubWFwKFxuLy8gICAgICAgICAgICAgXy5maWx0ZXIoXy5rZXlzKGFqdi5fc2NoZW1hcyksIGsgPT4gL3dhdHJ3b3Jrcy5uZXQvLnRlc3QoaykpLFxuLy8gICAgICAgICAgICAgc2hvcnRTY2hlbWFOYW1lXG4vLyAgICAgICAgICk7XG4vLyAgICAgICAgIGNvbnNvbGUubG9nKCdTY2hlbWEgbmFtZScsIHNuYW1lLCAnbm90IGZvdW5kLicpO1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnQXZhaWxhYmxlIHNjaGVtYXM6ICcsIHNjaGVtYXMpO1xuLy8gICAgICAgICB0aHJvdyBFcnJvcihcIkpzb24gU2NoZW1hIFZhbGlkYXRpb24gRXJyb3JcIik7XG4vLyAgICAgfVxuLy8gICAgIHJldHVybiBmdW5jdGlvbihkYXRhKSB7XG4vLyAgICAgICAgIHJldHVybiB2YWxpZGF0ZURhdGEodmFsaWRhdG9yLCBkYXRhKTtcbi8vICAgICB9O1xuLy8gfVxuXG4vLyBmdW5jdGlvbiB2YWxpZGF0ZURhdGEodmFsaWRhdG9yLCBkYXRhKSB7XG4vLyAgICAgbGV0IHZhbGlkID0gdmFsaWRhdG9yKGRhdGEpO1xuXG4vLyAgICAgaWYgKCF2YWxpZCkge1xuLy8gICAgICAgICBjb25zb2xlLmxvZygnRXJyb3IgdmFsaWRhdGluZycsIGRhdGEpO1xuLy8gICAgICAgICBfLmVhY2godmFsaWRhdG9yLmVycm9ycywgZSA9PiB7XG4vLyAgICAgICAgICAgICBjb25zb2xlLmxvZygnICA+PiAnLCBlLmtleXdvcmQsIGUuZGF0YVBhdGgsIGUubWVzc2FnZSwgZS5wYXJhbXMpO1xuLy8gICAgICAgICB9KTtcbi8vICAgICAgICAgdGhyb3cgRXJyb3IoXCJKc29uIFNjaGVtYSBWYWxpZGF0aW9uIEVycm9yXCIpO1xuLy8gICAgIH1cbi8vICAgICByZXR1cm4gZGF0YTtcbi8vIH1cbiJdfQ==