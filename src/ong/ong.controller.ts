import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
} from '@nestjs/common';
import { OngService } from './ong.service';
import { OngDTO } from './ong.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';

@Controller('api/ongs')
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
  @UsePipes(new ValidationPipe())
  createOng(@Body() data: OngDTO) {
    return this.ongService.create(data);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  updateOng(@Param('id') id: string, @Body() data: Partial<OngDTO>) {
    return this.ongService.update(id, data);
  }

  @Delete(':id')
  deleteOng(@Param('id') id: string) {
    return this.ongService.delete(id);
  }
}
