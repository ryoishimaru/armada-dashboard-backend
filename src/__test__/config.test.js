// This test file will only be use for initial config.
import path from "path";
import { LocalStorage } from "node-localstorage";
const container = require('~/dependency'),
      DateTimeUtil = container.resolve("DateTimeUtil"),
      currentTime = DateTimeUtil.getCurrentTimeObjForDB();

    



describe('Initial test configuration', () => {
    test('setting-up test configuration', () => {
        // constructor function to create a storage directory inside our project for test cases.
        var localStorage = new LocalStorage(path.join(__dirname, 'localStorage'));
        // Setting localStorage Item.
        localStorage.setItem('apiHeader', JSON.stringify(
            {
                'device-id': '12345',
                'device-type': '1',
                'device-token': 'abcxyz',
                'api-key': 'm2E7FFKm3v8e!xCxj|6RAC87lMA2wOFXt8i3HX&klH}?{556dc1kwyllokWzqeKw&kH}?{j7UuFXn55BE508zy7gEHNMx',
                'access-token': ''
            }
        ));
    })
});
