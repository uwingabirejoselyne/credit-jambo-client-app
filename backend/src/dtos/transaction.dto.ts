import { ITransaction, TransactionType, TransactionStatus } from '../models/transaction.model';

/**
 * DTO for deposit request
 */
export interface DepositDto {
  amount: number;
  description?: string;
}

/**
 * DTO for withdrawal request
 */
export interface WithdrawDto {
  amount: number;
  description?: string;
}

/**
 * DTO for transaction response (sanitized)
 */
export interface TransactionResponseDto {
  id: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  status: TransactionStatus;
  reference: string;
  createdAt: string;
  completedAt?: string;
}

/**
 * DTO for transaction history query params
 */
export interface TransactionHistoryQueryDto {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  startDate?: string;
  endDate?: string;
}

/**
 * DTO for transaction history response
 */
export interface TransactionHistoryResponseDto {
  transactions: TransactionResponseDto[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTransactions: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * DTO for transaction summary
 */
export interface TransactionSummaryDto {
  totalDeposits: number;
  totalWithdrawals: number;
  transactionCount: number;
  lastTransaction?: TransactionResponseDto;
}

/**
 * Transform transaction model to response DTO
 */
export class TransactionDtoMapper {
  static toResponseDto(transaction: ITransaction): TransactionResponseDto {
    return {
      id: (transaction._id as any).toString(),
      type: transaction.type,
      amount: transaction.amount,
      balanceBefore: transaction.balanceBefore,
      balanceAfter: transaction.balanceAfter,
      description: transaction.description,
      status: transaction.status,
      reference: transaction.reference,
      createdAt: transaction.createdAt.toISOString(),
      completedAt: transaction.completedAt?.toISOString(),
    };
  }

  static toResponseDtoArray(transactions: ITransaction[]): TransactionResponseDto[] {
    return transactions.map(this.toResponseDto);
  }

  static toHistoryResponseDto(
    transactions: ITransaction[],
    page: number,
    limit: number,
    totalCount: number
  ): TransactionHistoryResponseDto {
    const totalPages = Math.ceil(totalCount / limit);

    return {
      transactions: this.toResponseDtoArray(transactions),
      pagination: {
        currentPage: page,
        totalPages,
        totalTransactions: totalCount,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
