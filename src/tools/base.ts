export interface ToolResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export abstract class BaseTool<TInput, TOutput> {
  abstract name: string;
  abstract execute(input: TInput): Promise<ToolResult<TOutput>>;
}
