import {IHttpDocumentation, IHttpResponseToClient} from '../interfaces/http.interface';
import {HttpLb4DocImplementation} from './http-lb4-doc.implementation';
import {HttpLb4ResponseImplementation} from './http-lb4-response.implementation';

const HttpDocumentation: IHttpDocumentation = new HttpLb4DocImplementation()
const HttpResponseToClient: IHttpResponseToClient = new HttpLb4ResponseImplementation()

export {
  HttpDocumentation,
  HttpResponseToClient,
};
