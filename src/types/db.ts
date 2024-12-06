import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type system_config = {
    id: string;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    key: string;
    value: string;
};
export type user = {
    id: string;
    created_at: Generated<string>;
    updated_at: Generated<string>;
    name: string;
    pwd: string;
};
export type DB = {
    system_config: system_config;
    user: user;
};
