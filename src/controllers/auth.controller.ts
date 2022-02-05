import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  get,
  getModelSchemaRef,
  OperationVisibility,
  param,
  post,
  Request, requestBody, response, Response,
  RestBindings,
  visibility
} from '@loopback/rest';
import {HttpClass} from '../classes/http.class';
import {AdditionalInfoModel, Signup} from '../models/signup.model';
import {User} from '../models/user.model';
import {AuthService} from '../services';
import {theDatesMatch} from '../utils/date-manipulation-functions';
import {getUserType} from '../utils/general-functions';
import {hideEmailString} from '../utils/string-manipulation-functions';
import {CompanyRepository} from './../repositories/company.repository';
import {PersonRepository} from './../repositories/person.repository';
import {UserRepository} from './../repositories/user.repository';
import {localeMessage, serverMessages} from './../utils/server-messages';

export class AuthController {

  private httpClass

  constructor(
    @inject(RestBindings.Http.REQUEST) private request: Request,
    @inject(RestBindings.Http.RESPONSE) private response: Response,

    @service(AuthService) private authService: AuthService,

    @repository(PersonRepository) private personRepository: PersonRepository,
    @repository(CompanyRepository) private companyRepository: CompanyRepository,
    @repository(UserRepository) private userRepository: UserRepository,
  ) {
    this.httpClass = new HttpClass({response: this.response})
  }

  @get('auth/google-signin')
  @response(200, {description: 'Redirect to Google login page'})
  async redirectToGoogleLoginPage(): Promise<void> {
    try {
      const url = await this.authService.getGoogleLoginPageURL()
      this.response.redirect(url)
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['auth']['getGoogleUrl'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @visibility(OperationVisibility.UNDOCUMENTED)
  @get('auth/google')
  async handleGoogleCodeAndReturnToken(
    @param.query.string('code') code: string,
  ): Promise<void> {
    try {
      const googleUser = await this.authService.getGoogleUser(code)
      const token = this.authService.createGoogleLoginToken(googleUser)
      this.response.redirect(`${process.env.CLIENT_URI}?token=${token}`)
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['auth']['getGoogleUser'][localeMessage],
        logMessage: err.message
      })
    }
  }

  @get('auth/login')
  @response(200, {
    description: 'Auth token',
    properties: {
      message: {type: 'string'},
      statusCode: {type: 'number'},
      data: {
        properties: {
          authToken: {type: 'string'},
          authRefreshToken: {type: 'string'},
          userData: getModelSchemaRef(User, {includeRelations: true}),
        }
      }
    }
  })
  async login(): Promise<void> {
    try {
      const payload = this.httpClass.verifyToken(this.request.headers.authorization!, process.env.PROJECT_SECRET!)
      const tokenAndUser = await this.authService.login(payload)
      this.httpClass.okResponse({
        data: tokenAndUser,
        message: serverMessages['auth'][tokenAndUser?.authToken ? 'loginSuccess' : 'unregisteredUser'][localeMessage],
        statusCode: tokenAndUser?.authToken ? 200 : 601
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({logMessage: err.message})
    }
  }

  @post('auth/signup')
  @response(200, {
    description: 'User registered',
    properties: new HttpClass().findOneSchema(User, true)
  })
  async signup(
    @requestBody({content: new HttpClass().requestSchema(Signup)}) data: any,
  ): Promise<void> {
    try {
      const payload = this.httpClass.verifyToken(this.request.headers.authorization!, process.env.PROJECT_SECRET!)

      const userType = getUserType(data)

      const profile =
        await this[`${userType}Repository`].findOne({where: {uniqueId: data.uniqueId}}) ??
        await this.authService.createProfile({userType, ...data});

      if (!theDatesMatch(profile.birthday, data.birthday))
        throw new Error(serverMessages['auth']['birthdayIncorrect'][localeMessage])

      if (profile.userId) {
        const userWithSameProfile = await this.userRepository.findOne({where: {_id: profile.userId}})
        if (userWithSameProfile) throw new Error(`${serverMessages['auth']['uniqueIdInUse'][localeMessage]} ${hideEmailString(userWithSameProfile.email as string)}`)
      }

      const newUser = await this.userRepository.create({
        googleId: payload?.googleId,
        appleId: payload?.appleId,
        email: payload?.email,
      })

      await this[`${userType}Repository`].updateById(profile._id as string,
        {
          ...(data.additionalInfo ? (data.additionalInfo as AdditionalInfoModel)[`${userType}Info`] : {}),
          userId: newUser?._id as string,
        }
      )

      const userWithProfile = await this.userRepository.findById(newUser?._id, {include: ['person', 'company']})

      this.httpClass.okResponse({
        message: serverMessages['auth']['signupSuccess'][localeMessage],
        data: userWithProfile
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: err.message,
        logMessage: err.message,
      })
    }
  }

  @get('auth/refresh-token')
  @response(200, {
    description: 'Auth token',
    properties: {
      message: {type: 'string'},
      statusCode: {type: 'number'},
      data: {
        properties: {
          authToken: {type: 'string'},
          authRefreshToken: {type: 'string'},
        }
      }
    }
  })
  async refreshToken(): Promise<void> {
    try {
      const payload = this.httpClass.verifyToken(this.request.headers.authorization!, process.env.PROJECT_SECRET!)
      const authToken = await this.authService.refreshToken(payload?.id);
      this.httpClass.okResponse({
        data: authToken,
        message: serverMessages['auth']['refreshTokenSuccess'][localeMessage]
      })
    } catch (err) {
      this.httpClass.badRequestErrorResponse({
        message: serverMessages['auth']['refreshTokenError'][localeMessage],
        logMessage: err.message,
      })
    }
  }
}
