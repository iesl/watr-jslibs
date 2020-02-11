import "chai/register-should";

import _ from "lodash";
// import * as fex from '~/extract/field-extract-abstract';
import {
  AbstractPipeline,
  findAbstractV2,
} from "~/extract/field-extract-abstract";
import {prettyPrint} from "~/util/pretty-print";
import {stripMargin} from "./field-extract-utils";
// import {makeCssTreeNormalForm} from "./reshape-html";
// import {stripMargin} from "~/extract/field-extract-utils";
// import {Field} from "./field-extract";

describe("Abstract Field Extraction", () => {
  it("should pick out .hlFld coded abstracts", () => {
    const block = `

 div .article__body
   comment
     ## abstract content
   div .hlFld-Abstract
     div
       div .colored-block__title
         h2 #d1375649e1
           | ABSTRACT
       p
         | Service descriptions allow designers to document, understand, and use services, creating new useful and complex services with aggregated business value. Unlike RPC-based services, REST characteristics require a different approach to service description. W
         i
           | Resource Linking Language (ReLL)
         | that introduces the concepts of media types, resource types, and link types as first class citizens for a service description. A proof of concept, a crawler called
         i
           | RESTler
         | that crawls RESTful services based on ReLL descriptions, is also presented.
`;
    const lines = block.split("\n");

    // const field = fex.findAbstractV4(lines)
    const fields = _.map(AbstractPipeline, pf => {
      return pf(lines, "");
    }).filter(f => f.value);

    prettyPrint({fields});
    // expect(field.value).toBeDefined();
    // expect(field.value).toMatch('Service descriptions');
  });
  it.only("should find metadata content", () => {
    const metadata = `{
"authors":[{"name":"Simon J.D. Prince","affiliation":"University College London"}],
"pdfUrl":"/stamp/stamp.jsp?tp=&arnumber=4459336","openUrlFullLink":"//sfxhosted.exlibrisgroup.com/umass?url_ver","formulaStrippedArticleTitle":"Tied Factor Analysis for Face Recognition across Large Pose Differences",
"sections":{"abstract":"true","authors":"true","figures":"true","multimedia":"false","references":"true","citedby":"true","keywords":"true","definitions":"false","algorithm":"false","supplements":"false","footnotes":"false","disclaimer":"false","metrics":"true"},
"keywords":[{"type":"IEEE Keywords","kwd":["Face recognition"]}],
"title":"Tied Factor Analysis for Face Recognition across Large Pose Differences",
"abstract":"Face recognition algorithms perform very unreliably when the pose of the probe face is different ",
"pubLink":"/xpl/RecentIssue.jsp?punumber=34"
}`;
    const meta = _.join(_.split(metadata, "\n"), "");
    const block = `
| html lang='en-US'
|   head
|     meta @Description content=''
|   body
|     script[script] type='text/javascript'
|       | var global = {};
|       |   global.document.metadata=${meta}
|       |
|       |   global.document.userLoggedIn=true;
`;
    const lines = stripMargin(block.split("\n"));
    const fields = findAbstractV2(lines);
    prettyPrint({fields});
  });

  //   it("should pick out div > h3.label coded abstracts", () => {
  //     const block = `
  //   div
  //     h3 .label
  //       | Abstract
  //     p
  //       | By exploiting unlabeled data

  // `;
  //     const lines = block.split('\n');

  //     const field = fex.findAbstractV5(lines)
  //     expect(field.value).toBeDefined();
  //     expect(field.value).toMatch('By exploiting');

  //     // prettyPrint({ field });

  //   });

  //   it("should pick out div > h3.label coded abstracts", () => {
  //     const html = `
  // |    <body>
  // |        <div id="content">
  // |            <div id="topBar">
  // |            </div>
  // |
  // |            <div id="title">On Heterogeneous Machine Learning Ensembles for Wind Power Prediction</div>
  // |            <div id="author"><em>Justin Heinermann, Oliver Kramer</em></div>
  // |
  // |            <blockquote>
  // |            </blockquote>
  // |
  // |            <div id="abstract">
  // |                <h4>Abstract</h4>
  // |                <br>
  // |                <div>For a sustainable integration of wind power into the electricity ..
  // |                    <br>
  // |                </div>
  // |
  // |                <div id="paperSubject">
  // |                    <h4>Keywords</h4>
  // |                    <br>
  // |                    <div>heterogeneous machine learning prediction</div>
  // |                    <br>
  // |                </div>
  // |
  // |
  // |                <div id="paper">
  // |                    Full Text:
  // |                    <a href="https://aaai.org/ocs/index.php/WS/AAAIW15/paper/view/10081/10174" class="action" target="_parent">PDF</a>
  // |                </div>
  // |
  // |            </div>
  // |        </div>
  // |    </body>
  // `.split('\n');

  //     const cssNormalForm = makeCssTreeNormalForm(stripMargin(html).join('\n'));
  //     const fields = [
  //       fex.findAbstractV1(cssNormalForm),
  //       fex.findAbstractV2(cssNormalForm),
  //       fex.findAbstractV3(cssNormalForm),
  //       fex.findAbstractV4(cssNormalForm),
  //       fex.findAbstractV5(cssNormalForm),
  //       fex.findAbstractV6(cssNormalForm),
  //     ];
  //     // const abstractFields = fields.filter(f => f.value);

  //     // prettyPrint({ fields });
  //   });

  // it("should not crash on err html", () => {
  //   fex.extractAbstract('../../abs-example-v8.html')
  //   // fex.extractAbstract('../../var1.html')
  // });
});
