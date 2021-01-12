import _ from 'lodash'
import { Transcript  } from './transcript'
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
    // expect(isIsomorphic(Transcript, example, true)).toBe(true)
  })
})
