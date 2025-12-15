import { Injectable, inject } from "@angular/core";
import { Observable, of } from "rxjs";
import { ReCaptchaV3Service } from "ng-recaptcha";
import { currentEnvironment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class RecaptchaGatewayService {
  private readonly recaptchaV3Service = inject(ReCaptchaV3Service);

  execute(action: string): Observable<string> {
    if (!currentEnvironment.recaptcha.enabled) {
      return of("");
    }
    return this.recaptchaV3Service.execute(action);
  }
}
