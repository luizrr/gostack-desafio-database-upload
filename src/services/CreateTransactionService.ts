import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Sorry! Insufficient funds');
    }

    let trasactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });

    if (!trasactionCategory) {
      trasactionCategory = categoryRepository.create({
        title: category,
      });

      await categoryRepository.save(trasactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: trasactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
