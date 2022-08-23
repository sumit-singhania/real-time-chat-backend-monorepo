import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
// import {MySequence} from './sequence';
import * as dotenv from 'dotenv';
import * as dotenvExt from 'dotenv-extended';
export {ApplicationConfig};
import {CoreComponent, ServiceSequence} from '@sourceloop/core';
import {AuthenticationComponent} from 'loopback4-authentication';
import {
AuthorizationBindings,
AuthorizationComponent,
} from 'loopback4-authorization';
import {
BearerVerifierBindings,
BearerVerifierComponent,
BearerVerifierConfig,
BearerVerifierType,
} from '@sourceloop/core';

export class AuthTestApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  
  constructor(options: ApplicationConfig = {}) {
    const port = 3000;
dotenv.config();
dotenvExt.load({
  schema: '.env.example',
  errorOnMissing: true,
  includeProcessEnv: true,
});
options.rest = options.rest ?? {};
options.rest.basePath = process.env.BASE_PATH ?? '';
options.rest.port = +(process.env.PORT ?? port);
options.rest.host = process.env.HOST;
options.rest.openApiSpec = {
  endpointMapping: {
    [`${options.rest.basePath}/openapi.json`]: {
      version: '3.0.0',
      format: 'json',
    },
  },
};
    super(options);

    // Set up the custom sequence
    // this.sequence(MySequence);
    this.sequence(ServiceSequence);
    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);
    this.component(CoreComponent);
    this.component(AuthenticationComponent);
 // Add bearer verifier component
 this.bind(BearerVerifierBindings.Config).to({
  authServiceUrl: '',
  type: BearerVerifierType.service,
} as BearerVerifierConfig);
this.component(BearerVerifierComponent);

// Add authorization component
this.bind(AuthorizationBindings.CONFIG).to({
  allowAlwaysPaths: ['/explorer', '/openapi.json'],
});
this.component(AuthorizationComponent);
    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
