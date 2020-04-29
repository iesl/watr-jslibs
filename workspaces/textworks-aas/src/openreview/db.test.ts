import 'chai/register-should';
import { prettyPrint } from 'commons';
import { openDB, initTables, Table } from './db';

describe('OpenReview Database', () => {

  // beforeEach(() => {});
  // afterEach(() => {})
  // afterAll(() => {})

  beforeEach(async () => {
    const sql = await openDB(undefined);
    initTables(sql);
    await sql.sync();
  });


  it('smokescreen', async (done) => {
    const newEntry = await Table.Url.create({
      url: 'blah:/blah/blah'
    });

    const theUrl = newEntry.url;
    prettyPrint({ theUrl });

    done();
  });


  it.only('should create a request order with entries', async (done) => {
    // shouldn't create an orderentry without an order
    await Table.OrderEntry.create()
      .then(orderEntry => {
        return orderEntry;
      }) ;

    await Table.OrderEntry.findAll()
      .then(all => {
        const asObj = all.map(a => a.get({ plain: true }));
        prettyPrint({ asObj });
      })
      .then(done)
  });

});
