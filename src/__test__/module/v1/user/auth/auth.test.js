import app from "~/index";
import request from 'supertest';
import path from "path";
import BaseModel from "~/models/BaseModel";
import { LocalStorage } from "node-localstorage";


var localStorage = new LocalStorage(path.join(process.cwd(), 'src/__test__/localStorage')),
   apiHeader = JSON.parse(localStorage.getItem('apiHeader'));


describe('Auth test cases', () => {

   /*********************************************************************/

   // Test cases for salon/v1/signup api
   test('test endpoint salon/v1/signup when any header missing or entered wrong', async () => {
      const response = await request(app).post('/salon/v1/signup').set({}),
      resBody = response.body;
      expect(resBody.code).toBe(100);
   });

});