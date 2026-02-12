type RunOptimisticMutationArgs<TResult, TRollback> = {
  applyOptimistic: () => TRollback
  request: () => Promise<TResult>
  commit?: (result: TResult) => void | Promise<void>
  rollback?: (rollback: TRollback, error: unknown) => void
  shouldRollback?: (error: unknown) => boolean
  onError?: (error: unknown) => void
  rethrow?: boolean
}

export const runOptimisticMutation: {
  <TResult, TRollback>(args: RunOptimisticMutationArgs<TResult, TRollback> & { rethrow?: true }): Promise<TResult>
  <TResult, TRollback>(args: RunOptimisticMutationArgs<TResult, TRollback> & { rethrow: false }): Promise<TResult | undefined>
} = async <TResult, TRollback>({
  applyOptimistic,
  request,
  commit,
  rollback,
  shouldRollback,
  onError,
  rethrow = true,
}: RunOptimisticMutationArgs<TResult, TRollback>) => {
  const rollbackValue = applyOptimistic()
  try {
    const result = await request()
    await commit?.(result)
    return result
  } catch (error) {
    onError?.(error)
    if (rollback && (!shouldRollback || shouldRollback(error))) rollback(rollbackValue, error)
    if (rethrow) throw error
    return undefined
  }
}

