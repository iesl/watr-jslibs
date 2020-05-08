import 'chai/register-should';
import { prettyPrint } from 'commons';
import { openDatabase, Database } from './db';
import { Url } from './db-tables';

describe('OpenReview Database', () => {

  // beforeEach(() => {});
  // afterEach(() => {})
  // afterAll(() => {})


  async function createEmptyDB(): Promise<Database> {
    const db = await openDatabase('db.tmp.sqlite');
    await db.unsafeResetDatabase();
    return db;
  }


  it.only('smokescreen', async (done) => {
    const db = await createEmptyDB();
    await db.runTransaction(async (db, transaction) => {
      const newEntry = await Url.create({
        url: 'blah:/blah/blah'
      }, { transaction });
      const theUrl = newEntry.url;

      prettyPrint({ theUrl });
    });


    await db.run(async () => {
      return Url.findAll()
        .then((urls) => {
          const plainUrls = urls.map(a => a.get({ plain: true }));
          prettyPrint({ plainUrls });
        });
    });


    done();
  });


  it('create an order with initial order-items', async (done) => {
    // shouldn't create an orderentry without an order
    // await withDBTransaction(async (db, transaction) => {
    //   const opts = { transaction };

    //   await .OrderEntry.create(opts)
    //     .then(orderEntry => {
    //       return orderEntry;
    //     }) ;

    //   await Table.OrderEntry.findAll()
    //     .then(all => {
    //       const asObj = all.map(a => a.get({ plain: true }));
    //       prettyPrint({ asObj });
    //     })
    //     .then(done)
    // })
  });

  // it('reset database', async (done) => {});
  // it('create an empty order', async (done) => {});
  // it('update an order with a new item', async (done) => {});
  // it('track whether an order is complete', async (done) => {});

});
