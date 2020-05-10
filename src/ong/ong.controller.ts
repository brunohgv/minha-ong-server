import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { OngService } from './ong.service';
import { OngDTO } from './ong.dto';

@Controller('ongs')
export class OngController {
  constructor(private ongService: OngService) {}

  @Get()
  getAllOngs() {
    return this.ongService.getAll();
  }

  @Get(':id')
  getOng(@Param('id') id: string) {
    return this.ongService.getById(id);
  }

  @Post()
  createOng(@Body() data: OngDTO) {
    return this.ongService.create(data);
  }

  @Put(':id')
  updateOng(@Param('id') id: string, @Body() data: Partial<OngDTO>) {
    return this.ongService.update(id, data);
  }

  @Delete(':id')
  deleteOng(@Param('id') id: string) {
    return this.ongService.delete(id);
  }
}
