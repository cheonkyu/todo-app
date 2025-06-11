import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { TodosService } from './todos.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { FindTodosDto } from './dto/find-todos.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../common/decorators/get-user.decorator';
import { User } from '../auth/schemas/user.schema';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(@Body() createTodoDto: CreateTodoDto, @GetUser() user: User) {
    return this.todosService.create(createTodoDto, user);
  }

  @Get()
  findTodoCountsByDate(@GetUser() user: User, @Query() findTodosDto: FindTodosDto) {
    return this.todosService.findTodoCountsByDate(user, findTodosDto);
  }

  @Get('date/:date')
  findTodosByDate(
    @GetUser() user: User,
    @Param('date') date: string,
  ) {
    return this.todosService.findTodosByDate(user, date);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @GetUser() user: User,
  ) {
    return this.todosService.update(id, updateTodoDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.todosService.remove(id, user);
  }
} 