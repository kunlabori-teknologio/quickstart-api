import {BindingScope, injectable, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {PersonRepository, UserRepository} from '../repositories';
import {CompanyRepository} from './../repositories/company.repository';
import {UserService} from './user.service';

const fetch = require('node-fetch');

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    /**
     * Repositories
     */
    @repository(UserRepository)
    private userRepository: UserRepository,
    @repository(PersonRepository)
    private personRepository: PersonRepository,
    @repository(CompanyRepository)
    private companyRepository: CompanyRepository,
    /**
     * Services
     */
    @service(UserService)
    private userService: UserService,
  ) { }
  // /**
  //  * Google oAuth config
  //  */
  // googleOAuth2Client = new google.auth.OAuth2(
  //   process.env.GOOGLE_CLIENT_ID,
  //   process.env.GOOGLE_CLIENT_SECRET,
  //   `${process.env.SERVER_ROOT_URI}:${process.env.PORT}/auth/google`
  // );
  // /**
  //  * Get google login page url
  //  * @returns google login page url
  //  */
  // public async getGoogleAuthURL(): Promise<string> {
  //   try {
  //     const url = this.googleOAuth2Client.generateAuthUrl({
  //       access_type: "offline",
  //       scope:
  //         [
  //           "https://www.googleapis.com/auth/userinfo.profile",
  //           "https://www.googleapis.com/auth/userinfo.email",
  //         ],
  //       state: `redirectUri=${process.env.GOOGLE_LOGIN_REDIRECT_URI}`,
  //     });
  //     return url;
  //   } catch (err) {
  //     throw new Error(serverMessages['auth']['getGoogleUrl'][localeMessage]);
  //   }
  // }
  // /**
  //  * Get google user
  //  * @param code string
  //  * @param response Response
  //  * @returns SSO user interface
  //  */
  // private async getGoogleUser(
  //   {code, response}: {code: string, response: Response}
  // ): Promise<ISsoUser | undefined> {
  //   try {
  //     const {tokens} = await this.googleOAuth2Client.getToken(code);
  //     this.googleOAuth2Client.setCredentials(tokens);
  //     let oauth2 = google.oauth2({version: 'v2', auth: this.googleOAuth2Client});
  //     const googleUser = await oauth2.userinfo.v2.me.get();
  //     return new SSOUserDto({dataFromSSO: googleUser.data as IUserFromGoogle, sso: 'google' as ssoEnum});
  //   } catch (err) {
  //     internalServerError({response, message: serverMessages['auth']['getGoogleUser'][localeMessage]});
  //   }
  // }
  // /**
  //  * User login
  //  * @param code sso code
  //  * @returns
  //  */
  // public async login(
  //   {code, response}: {code: string, response: Response}
  // ): Promise<IRegistryCheck | undefined> {
  //   /**
  //    * Get google user
  //    */
  //   const ssoUser = await this.getGoogleUser({code, response});
  //   /**
  //    * Check if the user is already registered
  //    */
  //   const user = await this.userService.getUserWithPermissions({
  //     condition: {where: {googleId: ssoUser?.googleId}},
  //     projectId: process.env.PROJECT_ID!,
  //   });
  //   if (user) {
  //     return {
  //       user,
  //       authToken: jwt.sign({
  //         id: user?._id, projectId: process.env.PROJECT_ID!
  //       }, process.env.PROJECT_SECRET!, {expiresIn: '5m'})
  //     }
  //   } else {
  //     notFoundError({
  //       response,
  //       message: serverMessages['auth']['unregisteredUser'][localeMessage],
  //       data: {
  //         signupToken: jwt.sign({
  //           googleId: ssoUser?.googleId, appleId: null,
  //           email: ssoUser?.email, projectId: process.env.PROJECT_ID!
  //         }, process.env.PROJECT_SECRET!, {expiresIn: '5m'})
  //       }
  //     });
  //   }
  // }
  // /**
  //  * Create profile
  //  * @param userType user types enum
  //  * @param uniqueId string
  //  * @param additionalInfo additional info instance
  //  * @returns
  //  */
  // private async createProfile(
  //   {userType, uniqueId, additionalInfo}:
  //     {userType: userTypes, uniqueId: string, additionalInfo?: AdditionalInfoModel}
  // ): Promise<Person | Company> {
  //   /**
  //    * Get data from CPF/CNPJ API
  //    */
  //   let apiResponse = await fetch(`${process.env.API_CPF_CNPJ}/${userType === 'person' ? 2 : 6}/${uniqueId.replace(/\D/g, "")}`);
  //   apiResponse = apiResponse.json();
  //   if (!apiResponse.status) throw new Error(serverMessages['auth']['uniqueIdNotFound'][localeMessage]);
  //   const dataFromApi: IPersonFromAPI | ICompanyFromAPI = await apiResponse;
  //   /**
  //    * Create profile
  //    */
  //   const profileDTO: PersonDTO | CompanyDTO =
  //     userType === 'person' ?
  //       new PersonDTO({dataFromApi: dataFromApi as IPersonFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel}) :
  //       new CompanyDTO({dataFromApi: dataFromApi as ICompanyFromAPI, additionalInfo: additionalInfo as AdditionalInfoModel});
  //   const profileCreated = await this[`${userType}Repository`].create({...profileDTO});
  //   return profileCreated;
  // }
  // /**
  //  * Create user
  //  * @param authToken string
  //  * @param uniqueId string
  //  * @param birthday date
  //  * @param country string
  //  * @param additionalInfo AdditionalInfo instance
  //  * @param response Response http instance
  //  * @returns
  //  */
  // public async createUser(
  //   {authToken, uniqueId, birthday, country, additionalInfo, response}:
  //     {authToken: string, uniqueId: string, birthday: Date, country: string, additionalInfo?: AdditionalInfoModel, response: Response}
  // ): Promise<IRegistryCheck | void> {
  //   uniqueId = uniqueId.replace(/[^a-zA-Z0-9]/g, '');
  //   /**
  //    * Decode token
  //    */
  //   return jwt.verify(authToken, process.env.PROJECT_SECRET!, async (err, tokenDecoded) => {
  //     if (err) unauthorizedError({response});
  //     /**
  //      * Get user type (person or company)
  //      */
  //     const userType = getUserType({uniqueId, country});
  //     /**
  //      * Get or create a profile
  //      */
  //     const profile =
  //       await this[`${userType}Repository`].findOne({where: {uniqueId: uniqueId}}) ??
  //       await this.createProfile({userType, uniqueId, additionalInfo});
  //     /**
  //      * Check birthday
  //      */
  //     const datesCompare: boolean = compareDates(profile.birthday, birthday);
  //     if (!datesCompare) throw new Error(serverMessages['auth']['birthdayIncorrect'][localeMessage]);
  //     /**
  //      * Check if profile has already added in some user
  //      */
  //     const userWithSameProfile = await this.userRepository.findOne({
  //       include: [{
  //         relation: `${userType}`,
  //         scope: {where: {uniqueId}}
  //       }]
  //     });
  //     if (userWithSameProfile) throw new Error(`${serverMessages['auth']['uniqueIdInUse'][localeMessage]} ${hideEmailString(userWithSameProfile.email as string)}`);
  //     /**
  //      * Create user
  //      */
  //     const user = await this.userRepository.create({
  //       googleId: tokenDecoded?.googleId,
  //       appleId: tokenDecoded?.appleId,
  //       email: tokenDecoded?.email,
  //     });
  //     /**
  //      * Relate user to profile and update additional info
  //      */
  //     await this[`${userType}Repository`].updateById(profile._id as string,
  //       {
  //         ...(additionalInfo ? (additionalInfo as AdditionalInfoModel)[`${userType}Info`] : {}),
  //         userId: user?._id as string,
  //       }
  //     );
  //     /**
  //      * Get user info and create new auth token
  //      */
  //     const userCreated = await this.userService.getUserWithPermissions({
  //       condition: {where: {_id: user?._id as string}},
  //       projectId: tokenDecoded?.projectId,
  //     });
  //     const newAuthToken = jwt.sign({id: user._id, projectId: tokenDecoded?.projectId}, process.env.PROJECT_SECRET!, {expiresIn: '5m'});
  //     return {authToken: newAuthToken, user: userCreated!};
  //   });
  // }
  // /**
  //  * Refresh token
  //  * @param authToken
  //  * @returns
  //  */
  // public async refreshToken(authToken: string): Promise<string> {
  //   /**
  //    * Decode token
  //    */
  //   const decoded = jwt.decode(authToken) as JwtPayload;
  //   /**
  //    * Generate new token
  //    */
  //   const token = jwt.sign({
  //     id: decoded.id,
  //     projectId: decoded.projectId,
  //   }, process.env.PROJECT_SECRET!, {expiresIn: '5m'});
  //   return token;
  // }
}
