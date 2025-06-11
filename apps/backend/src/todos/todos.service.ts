import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Todo, TodoDocument } from './schemas/todo.schema';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { FindTodosDto } from './dto/find-todos.dto';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<TodoDocument>,
  ) {}

  async create(createTodoDto: CreateTodoDto, user: User) {
    const normalizedDate = this.normalizeDate(createTodoDto.date);
    console.log('Create Todo - Normalized Date:', normalizedDate);
    
    const todo = await this.todoModel.create({
      ...createTodoDto,
      userId: user._id,
      date: normalizedDate,
    });
    return this.transformTodo(todo);
  }

  async findTodoCountsByDate(user: User, findTodosDto: FindTodosDto) {
    const { year = new Date().getFullYear(), month } = findTodosDto;
    
    let startDate = new Date(year, month ? month - 1 : 0, 1);
    let endDate = new Date(year, month ? month : 12, 0);

    if (findTodosDto.date) {
      const normalizedDate = this.normalizeDate(findTodosDto.date);
      console.log('Find Todos - Query Date:', normalizedDate);
      
      const todos = await this.todoModel.find({
        userId: user._id,
        date: normalizedDate
      });
      console.log('Find Todos - Found Todos:', todos);

      const counts = todos.length > 0 ? [{
        _id: normalizedDate,
        count: todos.length,
        completed: todos.filter(t => t.completed).length,
        incomplete: todos.filter(t => !t.completed).length
      }] : [];

      return counts.map(todo => ({
        date: todo._id,
        totalCount: todo.count,
        completedCount: todo.completed,
        incompleteCount: todo.incomplete
      }));
    }

    console.log('Find Todos - Date Range:', {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    });

    const todos = await this.todoModel.aggregate([
      {
        $match: {
          userId: user._id,
          date: {
            $gte: startDate.toISOString().split('T')[0],
            $lte: endDate.toISOString().split('T')[0],
          },
        },
      },
      {
        $group: {
          _id: "$date",
          count: { $sum: 1 },
          completed: {
            $sum: { $cond: ["$completed", 1, 0] }
          },
          incomplete: {
            $sum: { $cond: ["$completed", 0, 1] }
          }
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    console.log('Find Todos - Aggregation Result:', todos);

    return todos.map(todo => ({
      date: todo._id,
      totalCount: todo.count,
      completedCount: todo.completed,
      incompleteCount: todo.incomplete
    }));
  }

  async findTodosByDate(user: User, date: string) {
    const normalizedDate = this.normalizeDate(date);
    console.log('Find Todos By Date - Normalized Date:', normalizedDate);
    
    const todos = await this.todoModel.find({
      userId: user._id,
      date: normalizedDate,
    }).sort({ date: 1 });

    console.log('Find Todos By Date - Found Todos:', todos);
    return todos.map(todo => this.transformTodo(todo));
  }

  async update(id: string, updateTodoDto: UpdateTodoDto, user: User) {
    const updateData = { 
      title: updateTodoDto.title,
      description: updateTodoDto.description,
      completed: updateTodoDto.completed,
      date: updateTodoDto.date,
    };
    
    if (updateTodoDto.date) {
      const normalizedDate = this.normalizeDate(updateTodoDto.date);
      console.log('Update Todo - Normalized Date:', normalizedDate);
      updateData.date = normalizedDate;
    }

    const todo = await this.todoModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(user._id) },
      updateData,
      { upsert: true },
    );

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    console.log('Update Todo - Updated Todo:', todo);
    return this.transformTodo(todo);
  }

  async remove(id: string, user: User) {
    const todo = await this.todoModel.findOneAndDelete({
      _id: id,
      userId: user._id,
    });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }

    return this.transformTodo(todo);
  }

  private transformTodo(todo: TodoDocument) {
    const transformed = todo.toObject();
    transformed.id = transformed._id;
    delete transformed._id;
    delete transformed.__v;
    if (transformed.userId && typeof transformed.userId === 'string') {
      transformed.userId = new Types.ObjectId(transformed.userId);
    }
    return transformed;
  }

  private normalizeDate(date: string): string {
    const normalized = new Date(date).toISOString().split('T')[0];
    console.log('Normalizing Date:', { input: date, output: normalized });
    return normalized;
  }
} 