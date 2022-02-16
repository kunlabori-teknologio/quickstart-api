import {GoogleOAuthImplementation} from './google-oauth.implementation';
import {HttpImplementation} from './http.implementation';
import {JwtTokenImplementation} from './jwt-token.implementation';
import {ProfileFromAPIImplementation} from './profile-from-api.implementation';
import {SendNodemailerMailImplementation} from './send-nodemailer-mail.implementation';

const Http = new HttpImplementation()
const JwtToken = new JwtTokenImplementation()
const SendNodemailerMail = new SendNodemailerMailImplementation()
const ProfileFromAPI = new ProfileFromAPIImplementation()
const GoogleOAuth = new GoogleOAuthImplementation()

export {
  Http,
  JwtToken,
  SendNodemailerMail,
  ProfileFromAPI,
  GoogleOAuth,
};
