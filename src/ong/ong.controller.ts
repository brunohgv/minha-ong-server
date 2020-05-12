import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { OngService } from './ong.service';
import { OngDTO } from './ong.dto';
import { ValidationPipe } from 'src/shared/validation.pipe';
import { AuthGuard } from 'src/shared/auth.guart';
import { User } from 'src/user/user.decorator';

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
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  createOng(@User('id') userId: string, @Body() data: OngDTO) {
    return this.ongService.create(userId, data);
  }

  @Put(':id')
  @UseGuards(new AuthGuard())
  @UsePipes(new ValidationPipe())
  updateOng(
    @User('id') userId: string,
    @Param('id') id: string,
    @Body() data: Partial<OngDTO>,
  ) {
    return this.ongService.update(userId, id, data);
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  deleteOng(@User('id') userId: string, @Param('id') id: string) {
    return this.ongService.delete(userId, id);
  }
}
