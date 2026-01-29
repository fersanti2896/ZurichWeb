import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import { NgxsModule } from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';

import { AppComponent } from './app.component';
import { AppInitializerService } from './shared/services/app-initializer.service';
import { AppRoutingModule } from './app-routing.module';
import { LayoutPageComponent } from './dashboard/pages/layout-page/layout-page.component';
import { SharedModule } from './shared/shared.module';
import { TokenInterceptor } from './shared/services/token.interceptor';

import { AuthState } from './shared/state/auth.state';

@NgModule({
  declarations: [AppComponent, LayoutPageComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedModule,
    RouterModule,

    NgxsModule.forRoot([AuthState], {
      developmentMode: true,
    }),
    NgxsReduxDevtoolsPluginModule.forRoot(),
  ],
  providers: [
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),

    {
      provide: APP_INITIALIZER,
      useFactory: (appInit: AppInitializerService) => () => appInit.initializeApp(),
      deps: [AppInitializerService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
