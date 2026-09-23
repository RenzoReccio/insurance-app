import Hapi from '@hapi/hapi';
import { EndorseRequestDto } from '../entities';
import { EndorsementTranslatorService } from '../services/endorse-translator.service';

export class EndorseController {
  constructor(private readonly translatorService: EndorsementTranslatorService) {}

  translate = async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    const payload = request.payload as EndorseRequestDto;
    const result = await this.translatorService.translate(payload);
    return h.response(result).code(200);
  };
}
