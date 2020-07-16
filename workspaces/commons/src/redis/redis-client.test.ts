import "chai";

import _ from "lodash";
import { prettyPrint } from '~/util/pretty-print';
import { getAsyncRedisClient } from './redis-client';

describe("Redis client tests", () => {

  it("should do async-ified set/get ", async (done) => {
    const rclient = await getAsyncRedisClient();
    await rclient.set('mykey', 'my-value')
      .then(() => {
        console.log('okay!');
      }).catch((error) => {
        console.log('Error', error);
      });

    await rclient.get('mykey')
      .then((value) => {
        console.log('got', value);
      }).catch((error) => {
        console.log('Error', error);
      });

    return rclient.quit()
      .then(() => done());
  });

  it.only("should do pub/sub", async (done) => {
    const rclient = await getAsyncRedisClient();
    const subClient = await getAsyncRedisClient();

    const subRet = await subClient.subscribe("topic.foo");
    await subClient.subscribe("exit");
    prettyPrint({ subRet });
    const pubRet = await rclient.publish("topic.foo", "foo.msg");
    prettyPrint({ pubRet });

    subClient.client.on("message", (channel, message) => {
      console.log('got message', channel, message);
    });

    rclient.publish('exit', 'quit');

    subClient.client.on("message", (channel, message) => {
      if (channel === 'exit' && message === 'quit')
      rclient.quit()
        .then(() => subClient.quit())
        .then(() => done());
    });
  });

});
