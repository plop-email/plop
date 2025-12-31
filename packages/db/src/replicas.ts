import type { ExtractTablesWithRelations } from "drizzle-orm";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import type { TablesRelationalConfig } from "drizzle-orm/relations";

type BasePgDatabase = PgDatabase<
  PgQueryResultHKT,
  Record<string, unknown>,
  TablesRelationalConfig
>;

export type ReplicatedDatabase<Q extends BasePgDatabase> = Q & {
  executeOnReplica: Q["execute"];
  transactionOnReplica: Q["transaction"];
  usePrimaryOnly: () => ReplicatedDatabase<Q>;
};

export const withReplicas = <
  HKT extends PgQueryResultHKT,
  TFullSchema extends Record<string, unknown>,
  TSchema extends TablesRelationalConfig,
  Q extends PgDatabase<
    HKT,
    TFullSchema,
    TSchema extends Record<string, unknown>
      ? ExtractTablesWithRelations<TFullSchema>
      : TSchema
  >,
>(
  primary: Q,
  replicas: [Q, ...Q[]],
  getReplica: (replicas: Q[]) => Q = () =>
    replicas[Math.floor(Math.random() * replicas.length)]!,
): ReplicatedDatabase<Q> => {
  const createDatabase = (usePrimary = false): ReplicatedDatabase<Q> => {
    const getDbForRead = () => (usePrimary ? primary : getReplica(replicas));

    const select = ((...args: unknown[]) =>
      (getDbForRead().select as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["select"];
    const selectDistinct = ((...args: unknown[]) =>
      (getDbForRead().selectDistinct as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["selectDistinct"];
    const selectDistinctOn = ((...args: unknown[]) =>
      (getDbForRead().selectDistinctOn as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["selectDistinctOn"];
    const $count = ((...args: unknown[]) =>
      (getDbForRead().$count as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["$count"];
    const _with = ((...args: unknown[]) =>
      (getDbForRead().with as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["with"];
    const $with = ((...args: unknown[]) =>
      (getDbForRead().$with as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["$with"];

    const executeOnReplica = ((...args: unknown[]) =>
      (getDbForRead().execute as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["execute"];
    const transactionOnReplica = ((...args: unknown[]) =>
      (getDbForRead().transaction as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["transaction"];

    const update = ((...args: unknown[]) =>
      (primary.update as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["update"];
    const insert = ((...args: unknown[]) =>
      (primary.insert as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["insert"];
    const $delete = ((...args: unknown[]) =>
      (primary.delete as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["delete"];
    const execute = ((...args: unknown[]) =>
      (primary.execute as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["execute"];
    const transaction = ((...args: unknown[]) =>
      (primary.transaction as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["transaction"];
    const refreshMaterializedView = ((...args: unknown[]) =>
      (primary.refreshMaterializedView as (...args: unknown[]) => unknown)(
        ...args,
      )) as Q["refreshMaterializedView"];

    const usePrimaryOnly = (): ReplicatedDatabase<Q> => createDatabase(true);

    return {
      ...primary,
      update,
      insert,
      delete: $delete,
      execute,
      transaction,
      executeOnReplica,
      transactionOnReplica,
      refreshMaterializedView,
      $primary: primary,
      usePrimaryOnly,
      select,
      selectDistinct,
      selectDistinctOn,
      $count,
      $with,
      with: _with,
      get query() {
        return getDbForRead().query;
      },
    };
  };

  return createDatabase(false);
};
