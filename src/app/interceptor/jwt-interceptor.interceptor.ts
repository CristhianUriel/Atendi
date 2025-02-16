import { HttpInterceptorFn } from '@angular/common/http';
import { AuthServiceService } from '../services/auth-service.service';
export const jwtInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req);
};
