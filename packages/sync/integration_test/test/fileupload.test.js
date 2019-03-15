import { File } from 'file-api'
import { createClient } from '../../dist';
import { TestStore } from '../utils/testStore';
import { ToggleableNetworkStatus } from '../utils/network';
import server from '../utils/server';
import {
  UPLOADS,
  UPLOAD_FILE
} from '../utils/graphql.queries';

const newNetworkStatus = (online = true) => {
  const networkStatus = new ToggleableNetworkStatus();
  networkStatus.setOnline(online);
  return networkStatus;
};

const newClient = async (clientOptions = {}) => {
  const config = {
    httpUrl: "http://localhost:4000/graphql",
    wsUrl: "ws://localhost:4000/graphql",
    ...clientOptions,
    fileUpload: true
  };

  return await createClient(config);
};

describe('File upload', function () {

  this.timeout(2000);

  let client, networkStatus, store;

  before('start server', async function () {
    await server.start();
  });

  after('stop server', async function() {
    await server.stop();
  });

  beforeEach('reset server', async function () {
    await server.reset();
  });

  beforeEach('create client', async function () {
    networkStatus = newNetworkStatus();
    store = new TestStore();
    client = await newClient({ networkStatus, storage: store });
  });

  async function fileUpload(file) {
    
    console.log(file);
    const res = await client.mutate({
      mutation: UPLOAD_FILE,
      variables: { file }
    });
    console.log(res);
  }

  describe('uploading of text file', function () {

    it('should succeed', async function () {
      let file = new File("./fixtures/test.txt")

      await fileUpload(file);

      const response = await client.query({
        query: UPLOADS
      });

      expect(response.data.uploads).to.exist;
    });

  });

});
