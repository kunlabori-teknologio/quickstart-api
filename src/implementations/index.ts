import {AuthToken} from './auth/auth.implementation';
import {HttpImplementation} from './http/http.implementation';

const Http = new HttpImplementation()
const JwtToken = new AuthToken()

export {Http, JwtToken};
