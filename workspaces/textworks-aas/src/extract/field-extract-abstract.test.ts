import "chai/register-should";

import _ from "lodash";
import {
  AbstractPipeline,
  findAbstractV2,
} from "~/extract/field-extract-abstract";
import fs from "fs-extra";
import path from "path";

import { prettyPrint } from "commons";
import { stripMargin } from "./field-extract-utils";

describe("Abstract Field Extraction", () => {
  const testDirPath = './test/resources/htmls';

  it("should use jquery-like queries to pick out abstracts", () => {
    const htmlFiles = [
      'download-dfa01ecc.html',
      // 'nospace.html'
    ]
    _.each(htmlFiles, f => {
      const htmlFile = path.resolve(testDirPath, f);
      const htmlFileContent = fs.readFileSync(htmlFile).toString();
      const fields = _.map(AbstractPipeline, pf => {
        return pf([], htmlFileContent);
      }).filter(f => f.value);

      prettyPrint({ fields });

      // expect(fields.length).toBe(1);
      // const field = fields[0];
      // expect(field.value).toBeDefined;
      // expect(field.value).toMatch(/^TrueAbstract/);
    })
  });

  it("should pick out .hlFld coded abstracts", () => {
    const htmlFile = path.resolve(testDirPath, 'nospace.html');
    const htmlFileContent = fs.readFileSync(htmlFile).toString();
    const fields = _.map(AbstractPipeline, pf => {
      return pf([], htmlFileContent);
    }).filter(f => f.value);

    // prettyPrint({ fields });

    expect(fields.length).toBe(1);
    const field = fields[0];
    expect(field.value).toBeDefined;
    expect(field.value).toMatch(/^TrueAbstract/);
  });

  it("should find metadata content", () => {
    const metadata = `{
"authors":[{"name":"Simon J.D. Prince","affiliation":"University College London"}],
"pdfUrl":"/stamp/stamp.jsp?tp=&arnumber=4459336","openUrlFullLink":"//sfxhosted.exlibrisgroup.com/umass?url_ver","formulaStrippedArticleTitle":"Tied Factor Analysis for Face Recognition across Large Pose Differences",
"title":"Tied Factor Analysis for Face Recognition across Large Pose Differences",
"abstract":"TrueAbstract: Face recognition algorithms perform very unreliably when the pose of the probe face is different "
}`;
    const meta = _.join(_.split(metadata, "\n"), "");
    const block = `
| html lang='en-US'
|   body
|     script[script] type='text/javascript'
|       | var global = {};
|       |   global.document.metadata=${meta}
|       |
|       |   global.document.userLoggedIn=true;
`;
    const lines = stripMargin(block.split("\n"));
    const fields = findAbstractV2(lines);
    expect(fields.value).toBeDefined;
    expect(fields.value).toMatch(/^TrueAbstract/);
  });

  it("should pick out abstracts #3", () => {

    const block =
      `
|div .content
|  h1
|    | Robotics: Science and Systems VIII
|  h3
|    | Walking and running on yielding and fluidizing ground
|  i
|    | Feifei Qian, Tingnan Zhang, chen Li, Aaron Hoover, Pierangelo Masarati, Paul Birkmeyer, Andrew Pullin, Ronald Fearing, Dan Goldman
|  br
|  p
|    b
|      | Abstract:
|  p style='text-align: justify;'
|    | TrueAbstract: We study the detailed locomotor mechanics of a small, lightweight  robot (DynaRoACH, 10 cm, 25 g) which can move on a granular substrate of closely packed 3 mm diameter glass particles at speeds up to 50 cm/s (5 body leng
|  p
|    b
|      | Download:
|    a href='p44.pdf' onclick='_gaq.push(['_trackEvent','rss08/p44.pdf','PDF',this.href]);' target='_blank'
|      img src='../icon-pdf.png' border='0'
|  p
|    b
`
    const lines = stripMargin(block.split("\n"));

    const fields = _.map(AbstractPipeline, pf => {
      return pf(lines, "");
    }).filter(f => f.value);

    prettyPrint({ fields });
    expect(fields.length).toBe(1);
    const field = fields[0];
    expect(field.value).toBeDefined;
    expect(field.value).toMatch(/^TrueAbstract/);
  });


  it("should pick out abstracts #3", () => {
    const block = `
html lang='en-US' xml:lang='en-US' xmlns='http://www.w3.org/1999/xhtml'
  head
    title
      | Cryptology ePrint Archive: Report 2018/820 - Privacy Loss Classes: The Central Limit Theorem in Differential Privacy
    link href='mailto:eprint-admin%40iacr.org' rev='made'
    meta @viewport content='initial-scale=1, width=device-width'
    meta content='text/html; charset=utf-8' http-equiv='Content-Type'
  body bgcolor='white'
    h2
      | Cryptology ePrint Archive: Report 2018/820
    p
    p
      script[script] src='/javascript/mathjax-2.6.1/MathJax.js?config=TeX-AMS-MML_HTMLorMML' type='text/javascript'
        | MathJax.Hub.Config({
        | extensions: ["tex2jax.js","TeX/AMSmath.js","TeX/AMSsymbols.js"],
        | jax: ["input/TeX", "output/HTML-CSS"],
        | tex2jax: {
        | inlineMath: [ ['$','$'], ["\\(","\\)"] ],
        | displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
        | },
        | "HTML-CSS": { availableFonts: ["TeX"] }
        | });
      b
        | Privacy  Loss  Classes:  The  Central  Limit  Theorem  in  Differential  Privacy
    p
      i
        | David  Sommer   and  Sebastian  Meiser   and  Esfandiar  Mohammadi
    p
      b
        | Abstract:
      | TrueAbstract: Quantifying  the  privacy  loss  of  a  privacy-preserving  mechanism  on  potentially  sensitive  data  is  a  complex   and  well-researched  topic;  the  de-facto  standard  for  privacy  measures  are $\\varepsilon$-differential  privacy (DP)   and  its  versatile  relaxation $(\\varepsilon,\\delta)$-approximate  differential  privacy (ADP).  Recently,  novel  variants  of (A)DP  focused  on  giving  tighter  privacy  bounds  under  continual  observation.   In  this  paper  we  unify  many  previous  works  via  the  \\emph{privacy  loss  distribution} (PLD)  of  a  mechanism.  We  show  that  for  non-adaptive  mechanisms,  the  privacy  loss  under  sequential  composition  undergoes  a  convolution   and  will  converge  to  a  Gauss  distribution (the  central  limit  theorem  for  DP).  We  derive  several  relevant  insights:  we  can  now  characterize  mechanisms  by  their  \\emph{privacy  loss  class},  i.e.,  by  the  Gauss  distribution  to  which  their  PLD  converges,  which  allows  us  to  give  novel  ADP  bounds  for  mechanisms  based  on  their  privacy  loss  class;  we  derive  \\emph{exact}  analytical  guarantees  for  the  approximate  randomized  response  mechanism   and  an  \\emph{exact}  analytical   and  closed  formula  for  the  Gauss  mechanism,  that,  given $\\varepsilon$,  calculates $\\delta$,  s.t.,  the  mechanism  is $(\\varepsilon,  \\delta)$-ADP (not  an  over-approximating  bound).
    p
      b
        | Category / Keywords:
      | foundations / differential privacy, privacy loss
`;

    const lines = block.split("\n");

    const fields = _.map(AbstractPipeline, pf => {
      return pf(lines, "");
    }).filter(f => f.value);

    prettyPrint({ fields });
    expect(fields.length).toBe(1);
    const field = fields[0];
    expect(field.value).toBeDefined;
    expect(field.value).toMatch(/^TrueAbstract/);
  });

  it("should pick out abstracts #4", () => {
    const block = `
html .pb-page data-request-id='3b7bbeb3-cd25-4eda-93e0-82cfd9aae72d' lang='en'
  head data-pb-dropzone='head'
    meta @citation_journal_title content='Journal of Computational Chemistry'
    meta @epdf_available content='false'
    meta @Description content='The chalcogen bond has been acknowledged as an influential noncovalent interaction (NCI) between an electron‐deficient chalcogen (donor) and a Lewis base (acceptor). This work explores the main fea...'
    title
      | Characterization of chalcogen bonding interactions via an in‐depth conceptual quantum chemical analysis - De Vleeschouwer - 2018 - Journal of Computational Chemistry - Wiley Online Library
    link href='/pb-assets/css/dr-overrides-1552321492860.css' rel='stylesheet' type='text/css'
    comment
      ## link rel="stylesheet" type="text/css" href="/pb-assets/css/temporary-1525702334993.css"
    style[style]
      | /* PERICLES-7186: distorted cover images */
      | .journal-info-container .cover-image__image img {
      |     min-height: unset;
      | }
    script[script] src='//assets.adobedtm.com/6e626c9ec247e474f6b98eb15a79a185cf7e26a5/satelliteLib-c1ac050bbdc647f13a62578e71f0d817f8a6cbb5.js'
    comment
      ## KRUX Implementation
  body .pb-ui
    div #pb-page-content
      div data-pb-dropzone='main' data-pb-dropzone-name='Main'
        div data-widget-def='pageBody' data-widget-id='72100436-7a82-49fc-933b-c6c9d8c42914'
          main #main-content tabindex='-1'
            comment
              ## begin pagefulltext
            div
              div data-pb-dropzone='main'
                section data-widget-def='ux3-layout-widget' data-widget-id='0f7bccba-8328-4dbd-a1fa-e84c526dd9ab'
                  div .container
                    div .row
                      div .
                        div
                          article data-details='/action/ajaxShowPubInfo?widgetId=5cf4c79f-0ae9-4dc5-96ce-77f62de7ada9&ajax=true&doi=10.1002%2Fjcc.25099&pbContext=%3Bissue%3Aissue%3Adoi%5C%3A10.1002%2Fjcc.v39.10%3Bcsubtype%3Astring%3ASpecial%3Bpage%3Astring%3AArticle%2FChapter+View%3Bctype%3Astring%3AJournal+Content%3Bwebsite%3Awebsite%3Apericles%3Barticle%3Aarticle%3Adoi%5C%3A10.1002%2Fjcc.25099%3Bjournal%3Ajournal%3A1096987x%3Bwgroup%3Astring%3APublication+Websites%3BpageGroup%3Astring%3APublication+Pages%3BsubPage%3Astring%3AFull+Text%3BrequestedJournal%3Ajournal%3A1096987x&accordionHeadingWrapper=h2&showSubjects=true&taxonomiesCodes=enter+your+taxonomy+codes+here&displayCitedByLink=true&displayAlmetricDropzone=true&taxonomyUri=publication-features&topicUri=hide-issue-metadata' data-figures='/action/ajaxShowFigures?widgetId=5cf4c79f-0ae9-4dc5-96ce-77f62de7ada9&ajax=true&doi=10.1002%2Fjcc.25099&pbContext=%3Bissue%3Aissue%3Adoi%5C%3A10.1002%2Fjcc.v39.10%3Bcsubtype%3Astring%3ASpecial%3Bpage%3Astring%3AArticle%2FChapter+View%3Bctype%3Astring%3AJournal+Content%3Bwebsite%3Awebsite%3Apericles%3Barticle%3Aarticle%3Adoi%5C%3A10.1002%2Fjcc.25099%3Bjournal%3Ajournal%3A1096987x%3Bwgroup%3Astring%3APublication+Websites%3BpageGroup%3Astring%3APublication+Pages%3BsubPage%3Astring%3AFull+Text%3BrequestedJournal%3Ajournal%3A1096987x&accordionHeadingWrapper=h2' data-mathjax='https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-AMS-MML_HTMLorMML' data-references='/action/ajaxShowEnhancedAbstract?widgetId=5cf4c79f-0ae9-4dc5-96ce-77f62de7ada9&ajax=true&doi=10.1002%2Fjcc.25099&pbContext=%3Bissue%3Aissue%3Adoi%5C%3A10.1002%2Fjcc.v39.10%3Bcsubtype%3Astring%3ASpecial%3Bpage%3Astring%3AArticle%2FChapter+View%3Bctype%3Astring%3AJournal+Content%3Bwebsite%3Awebsite%3Apericles%3Barticle%3Aarticle%3Adoi%5C%3A10.1002%2Fjcc.25099%3Bjournal%3Ajournal%3A1096987x%3Bwgroup%3Astring%3APublication+Websites%3BpageGroup%3Astring%3APublication+Pages%3BsubPage%3Astring%3AFull+Text%3BrequestedJournal%3Ajournal%3A1096987x&accordionHeadingWrapper=h2' data-related='/action/ajaxShowRecommended?widgetId=5cf4c79f-0ae9-4dc5-96ce-77f62de7ada9&ajax=true&doi=10.1002%2Fjcc.25099&pbContext=%3Bissue%3Aissue%3Adoi%5C%3A10.1002%2Fjcc.v39.10%3Bcsubtype%3Astring%3ASpecial%3Bpage%3Astring%3AArticle%2FChapter+View%3Bctype%3Astring%3AJournal+Content%3Bwebsite%3Awebsite%3Apericles%3Barticle%3Aarticle%3Adoi%5C%3A10.1002%2Fjcc.25099%3Bjournal%3Ajournal%3A1096987x%3Bwgroup%3Astring%3APublication+Websites%3BpageGroup%3Astring%3APublication+Pages%3BsubPage%3Astring%3AFull+Text%3BrequestedJournal%3Ajournal%3A1096987x&accordionHeadingWrapper=h2&showSubjects=true&taxonomiesCodes=enter+your+taxonomy+codes+here&displayCitedByLink=true&displayAlmetricDropzone=true&taxonomyUri=publication-features&topicUri=hide-issue-metadata'
                            div
                              div #article__content tabindex='-1'
                                div .article-citation
                                  div .citation
                                    div .pb-dropzone data-pb-dropzone='publicaitonContent-series-title'
                                    div
                                      span .primary-heading
                                        span .primary-heading
                                          | Full Paper
                                    h1 .citation__title
                                      | Characterization of chalcogen bonding interactions via an in‐depth conceptual quantum chemical analysis
                                div .
                                  article
                                    section #section-1-en data-lang='en' lang='en'
                                      h2 #d15895030
                                        | Abstract
                                      div
                                        p
                                          | TrueAbstract: The chalcogen bond has been acknowledged as an influential noncovalent interaction (NCI) between an electron‐deficient chalcogen (donor) and a Lewis base (acceptor). This work explores the main features of chalcogen bonding through a large‐scale computational study on a series of donors and acceptors spanning a wide range in strength and character of this type of bond: (benzo)chalcogenadiazoles (with Ch=Te/Se/S) versus halides and neutral Lewis bases with O, N, and C as donor atoms. We start from Pearson's hard and soft acids and bases (HSAB) principle, where the hard nature of the chalcogen bond is quantified through the molecular electrostatic potential and the soft nature through the Fukui function. The σ‐holes are more pronounced when going down in the periodic table and their directionality matches the structural orientation of donors and acceptors in the complexes. The Fukui functions point toward an n→σ*‐type interaction. The initial conjectures are further scrutinized using quantum mechanical methods, mostly relating to the systems' electron density. A Ziegler–Rauk energy decomposition analysis shows that electrostatics plays a distinctly larger role for the soft halides than for the hard, uncharged acceptors, associated with the softness matching within the HSAB principle. The natural orbital for chemical valence analysis confirms the n→σ* electron donation mechanism. Finally, the electron density and local density energy at the bond critical point in the quantum theory of atoms in molecules study and the position of the spikes in the reduced density gradient versus density plot in the NCI theory situate the chalcogen bond in the same range as strong hydrogen bonds. © 2017 Wiley Periodicals, Inc.
                                    div .pb-dropzone data-pb-dropzone='below-abstract-group'
                                      comment
                                        ## Empty dropzone
                                    section
                                      section #jcc25099-sec-0001 .article-section__content
                                        h2 #jcc25099-sec-0001-title
                                          | Introduction
                                        p
                                          | Noncovalent interactions (NCIs) play a significant role in different subfields of chemistry, outstanding examples being their hard‐to‐overestimate importance in supramolecular chemistry and the chemistry of living matter (For a state‐of‐the‐art series of papers see Ref. [
                                          span
                                            a #jcc25099-bib-0001R href='#jcc25099-bib-0001' aria-label='Reference 1 - Chem. Rev.' data-tab='pane-pcw-references'
                                              | 1
                                          | ]). Their recognition has been growing steadily in recent years and to quote Schneider “with courageous simplification one might assert that the chemistry of the last century was largely the chemistry of the covalent bonding, whereas that of the present century is more likely to be the chemistry of noncovalent bonding.”
                                        p
                                          | The fundamental ingredients of a halogen bond and a hydrogen bond are similar: the interactions can be formally looked on as a donor–acceptor interaction A
`;

    const lines = block.split("\n");

    const fields = _.map(AbstractPipeline, pf => {
      return pf(lines, "");
    }).filter(f => f.value);

    expect(fields.length).toBe(1);
    const field = fields[0];
    expect(field.value).toBeDefined;
    expect(field.value).toMatch(/^TrueAbstract/);

  });

});

//     // |   div .article__body
//     // |     comment
//     // |       ## abstract content
//     // |     div .hlFld-Abstract
//     // |       div
//     // |         div .colored-block__title
//     // |           h2 #d2985811e1
//     // |             | ABSTRACT
//     // |         div .left-side-image
//     // |           img .key-image src='/cms/attachment/fea4e252-79b2-46c7-bb85-01fec3e28750/3375627.3375832.key.jpg'
//     // |         div
//     // |           p
//     // |             | TrueAbstract The ethical concept of fairness has recently been applied in machine learning (ML) settings to describe a wide range of constraints and objectives. When considering the relevance of ethical concepts to
//     const block = `
// | html lang='en-US'
// |   head
// |   body
// |     div .article__body
// |       comment
// |         ## abstract content
// |       div .hlFld-Abstract
// |         div
// |           div .colored-block__title
// |             h2 #d1375649e1
// |               | ABSTRACT
// |           p
// |             | TrueAbstract: Service descriptions allow designers to document, understand, and use services, creating new useful and complex services with aggregated business value. Unlike RPC-based services, REST characteristics require a different approach to service description. W
// |             i
// |               | Resource Linking Language (ReLL)
// |             | that introduces the concepts of media types, resource types, and link types as first class citizens for a service description. A proof of concept, a crawler called
// |             i
// |               | RESTler
// |             | that crawls RESTful services based on ReLL descriptions, is also presented.
// `;
