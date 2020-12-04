import _ from 'lodash'
import { Transcript, Label, Range } from './transcript'
import { isIsomorphic } from '~/lib/utils'

describe('Transcript/Stanza IO', () => {

  it('should I/O Stanzas', () => {
    // const example0 = {
    //   name: 'body',
    //   kind: 'text:lines',
    //   id: '1',
    //   lines: [
    //     {
    //       text: 'see ^{[1]}.',
    //       glyphs: [1, 2, 3, 4, '^{', 5, 6, 7, '}', 8],
    //       labels: [
    //         { name: 'Link', range: [{ unit: 'text:char', at: { span: [6, 3] } }] },
    //       ]
    //     },
    //   ]
    // };
    const stanza21 = {
      id: '21',
      kind: 'text:lines',
      labels: [
        { name: 'BodyText' },
        { name: 'Feature:SuperSubLayout' },
        { name: 'Feature:JoinedText' },
      ],
      content: [
        { text: 'H_{2}O^{+}', glyphs: [11, '_{', 12, '}', 13, '^{', 14, '}'] },
      ]
    };

  });

  it('should I/O Transcript', () => {
    const example = {
      documentId: 'doc-25-id',
      pages: [{
        page: 1,
        bounds: [0, 0, 100, 200],
        text: [
          'H2O I+',
          'ffi',
        ],
        glyphs: [
          [[19, 94, 9, 10], [20, 94, 9, 10], [21, 94, 9, 10], [22, 94, 9, 10], [23, 94, 9, 10], [24, 94, 9, 10]]
        ],
        fonts: [
          [['font-id3', [0, 3]], ['font-id2', [4, 1]], ['font-id0', [5, 1]]]
        ]
      }, {
        page: 2,
        bounds: [0, 0, 10, 20],
        glyphs: [
          ['b', [19, 94, 9, 10]],
          [' ', [19, 94, 9, 10]]
        ]
      }],
      stanzas: [
        {
          kind: 'body',
          id: '1',
          lines: [{ text: 'a ', glyphs: [0, 1] }]
        },
        {
          unit: 'text:line',
          id: '1',
          units: [
            { text: 'a ', glyphs: [0, 1] }
          ]
        }
      ],
      labels: [
        { name: 'HasReferences', range: [{ unit: 'page', at: { page: 10 } }] }
      ]
    }

    expect(isIsomorphic(Transcript, example, true)).toBe(true)
  })
})
