
import * as _ from 'lodash';

export function annotData() {
    let annotTemplate = {
        "id" : 2,
        "document" : 1,
        "owner" : null,
        "annotPath" : null,
        "created" : 1520626895815,
        "label" : "Math",
        "location" : {
            "Zone" : {
                "regions" : [
                    {"page" : {"stableId" : "doc#0", "pageNum" : 0},
                     "bbox" : [10000, 10000, 8000, 4000]}
                ]
            }
        },
        "body" : {
            "TextGrid" : {
                textGridDef : ""
            }

        }
    };
    let annotTemplate2 = {
        "id" : 2,
        "document" : 1,
        "owner" : 98,
        "annotPath" : 'A.B.C',
        "created" : 1520626895815,
        "label" : "Math",
        "location" : {
            "Zone" : {
                "regions" : [
                    {"page" : {"stableId" : "doc#0", "pageNum" : 0},
                     "bbox" : [10000, 10000, 8000, 4000]}
                ]
            }
        },
        "body" : null
    };

    let numPages = 4;
    let annotsPerPage = 6;
    let annots = _.flatMap(_.range(0, numPages), pageNum => {
        return _.map(_.range(0, annotsPerPage), annotNum => {
            let id = (pageNum * annotsPerPage) + annotNum;
            let template = annotTemplate;
            if (annotNum % 2 === 0) {
                template = annotTemplate2;
            }

            let annot = Object.assign({}, template, {
                id: id,
                location : {
                    Zone : {
                        regions : [
                            {page : {stableId : "doc#0", pageNum : pageNum},
                             bbox : [(3000*(annotNum+2)), (6000*(annotNum+3)), 10000, 3000]}
                        ]
                    }
                }
            });
            return annot;
        });
    });

    return annots;
}
