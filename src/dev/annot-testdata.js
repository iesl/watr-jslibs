
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
                     "bbox" : {"left" : 10000, "top" : 10000, "width" : 8000, "height" : 4000}}
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

            let annot = Object.assign({}, annotTemplate, {
                id: id,
                location : {
                    Zone : {
                        regions : [
                            {page : {stableId : "doc#0", pageNum : pageNum},
                             bbox : {left : (3000*(annotNum+2)), top : (6000*(annotNum+3)), width : 10000, height : 3000}}
                        ]
                    }
                }
            });
            return annot;
        });
    });

    return annots;
}
