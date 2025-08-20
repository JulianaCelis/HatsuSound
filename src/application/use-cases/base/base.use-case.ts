import { Result } from '@/domain/ports';

export abstract class BaseUseCase<Request, Response, Error> {
  abstract execute(request: Request): Promise<Result<Response, Error>>;
}
