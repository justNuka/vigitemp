
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model t_conversation
 * 
 */
export type t_conversation = $Result.DefaultSelection<Prisma.$t_conversationPayload>
/**
 * Model t_conversation_participant
 * 
 */
export type t_conversation_participant = $Result.DefaultSelection<Prisma.$t_conversation_participantPayload>
/**
 * Model t_message
 * 
 */
export type t_message = $Result.DefaultSelection<Prisma.$t_messagePayload>
/**
 * Model t_message_attachment
 * 
 */
export type t_message_attachment = $Result.DefaultSelection<Prisma.$t_message_attachmentPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more T_conversations
 * const t_conversations = await prisma.t_conversation.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more T_conversations
   * const t_conversations = await prisma.t_conversation.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/orm/prisma-client/queries/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.t_conversation`: Exposes CRUD operations for the **t_conversation** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more T_conversations
    * const t_conversations = await prisma.t_conversation.findMany()
    * ```
    */
  get t_conversation(): Prisma.t_conversationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.t_conversation_participant`: Exposes CRUD operations for the **t_conversation_participant** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more T_conversation_participants
    * const t_conversation_participants = await prisma.t_conversation_participant.findMany()
    * ```
    */
  get t_conversation_participant(): Prisma.t_conversation_participantDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.t_message`: Exposes CRUD operations for the **t_message** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more T_messages
    * const t_messages = await prisma.t_message.findMany()
    * ```
    */
  get t_message(): Prisma.t_messageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.t_message_attachment`: Exposes CRUD operations for the **t_message_attachment** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more T_message_attachments
    * const t_message_attachments = await prisma.t_message_attachment.findMany()
    * ```
    */
  get t_message_attachment(): Prisma.t_message_attachmentDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.4.1
   * Query Engine version: 55ae170b1ced7fc6ed07a15f110549408c501bb3
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    t_conversation: 't_conversation',
    t_conversation_participant: 't_conversation_participant',
    t_message: 't_message',
    t_message_attachment: 't_message_attachment'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "t_conversation" | "t_conversation_participant" | "t_message" | "t_message_attachment"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      t_conversation: {
        payload: Prisma.$t_conversationPayload<ExtArgs>
        fields: Prisma.t_conversationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.t_conversationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.t_conversationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversationPayload>
          }
          findFirst: {
            args: Prisma.t_conversationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.t_conversationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversationPayload>
          }
          findMany: {
            args: Prisma.t_conversationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversationPayload>[]
          }
          create: {
            args: Prisma.t_conversationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversationPayload>
          }
          createMany: {
            args: Prisma.t_conversationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.t_conversationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversationPayload>
          }
          update: {
            args: Prisma.t_conversationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversationPayload>
          }
          deleteMany: {
            args: Prisma.t_conversationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.t_conversationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.t_conversationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversationPayload>
          }
          aggregate: {
            args: Prisma.T_conversationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateT_conversation>
          }
          groupBy: {
            args: Prisma.t_conversationGroupByArgs<ExtArgs>
            result: $Utils.Optional<T_conversationGroupByOutputType>[]
          }
          count: {
            args: Prisma.t_conversationCountArgs<ExtArgs>
            result: $Utils.Optional<T_conversationCountAggregateOutputType> | number
          }
        }
      }
      t_conversation_participant: {
        payload: Prisma.$t_conversation_participantPayload<ExtArgs>
        fields: Prisma.t_conversation_participantFieldRefs
        operations: {
          findUnique: {
            args: Prisma.t_conversation_participantFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversation_participantPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.t_conversation_participantFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversation_participantPayload>
          }
          findFirst: {
            args: Prisma.t_conversation_participantFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversation_participantPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.t_conversation_participantFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversation_participantPayload>
          }
          findMany: {
            args: Prisma.t_conversation_participantFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversation_participantPayload>[]
          }
          create: {
            args: Prisma.t_conversation_participantCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversation_participantPayload>
          }
          createMany: {
            args: Prisma.t_conversation_participantCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.t_conversation_participantDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversation_participantPayload>
          }
          update: {
            args: Prisma.t_conversation_participantUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversation_participantPayload>
          }
          deleteMany: {
            args: Prisma.t_conversation_participantDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.t_conversation_participantUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.t_conversation_participantUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_conversation_participantPayload>
          }
          aggregate: {
            args: Prisma.T_conversation_participantAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateT_conversation_participant>
          }
          groupBy: {
            args: Prisma.t_conversation_participantGroupByArgs<ExtArgs>
            result: $Utils.Optional<T_conversation_participantGroupByOutputType>[]
          }
          count: {
            args: Prisma.t_conversation_participantCountArgs<ExtArgs>
            result: $Utils.Optional<T_conversation_participantCountAggregateOutputType> | number
          }
        }
      }
      t_message: {
        payload: Prisma.$t_messagePayload<ExtArgs>
        fields: Prisma.t_messageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.t_messageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_messagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.t_messageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_messagePayload>
          }
          findFirst: {
            args: Prisma.t_messageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_messagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.t_messageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_messagePayload>
          }
          findMany: {
            args: Prisma.t_messageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_messagePayload>[]
          }
          create: {
            args: Prisma.t_messageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_messagePayload>
          }
          createMany: {
            args: Prisma.t_messageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.t_messageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_messagePayload>
          }
          update: {
            args: Prisma.t_messageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_messagePayload>
          }
          deleteMany: {
            args: Prisma.t_messageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.t_messageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.t_messageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_messagePayload>
          }
          aggregate: {
            args: Prisma.T_messageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateT_message>
          }
          groupBy: {
            args: Prisma.t_messageGroupByArgs<ExtArgs>
            result: $Utils.Optional<T_messageGroupByOutputType>[]
          }
          count: {
            args: Prisma.t_messageCountArgs<ExtArgs>
            result: $Utils.Optional<T_messageCountAggregateOutputType> | number
          }
        }
      }
      t_message_attachment: {
        payload: Prisma.$t_message_attachmentPayload<ExtArgs>
        fields: Prisma.t_message_attachmentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.t_message_attachmentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_message_attachmentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.t_message_attachmentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_message_attachmentPayload>
          }
          findFirst: {
            args: Prisma.t_message_attachmentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_message_attachmentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.t_message_attachmentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_message_attachmentPayload>
          }
          findMany: {
            args: Prisma.t_message_attachmentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_message_attachmentPayload>[]
          }
          create: {
            args: Prisma.t_message_attachmentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_message_attachmentPayload>
          }
          createMany: {
            args: Prisma.t_message_attachmentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.t_message_attachmentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_message_attachmentPayload>
          }
          update: {
            args: Prisma.t_message_attachmentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_message_attachmentPayload>
          }
          deleteMany: {
            args: Prisma.t_message_attachmentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.t_message_attachmentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.t_message_attachmentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$t_message_attachmentPayload>
          }
          aggregate: {
            args: Prisma.T_message_attachmentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateT_message_attachment>
          }
          groupBy: {
            args: Prisma.t_message_attachmentGroupByArgs<ExtArgs>
            result: $Utils.Optional<T_message_attachmentGroupByOutputType>[]
          }
          count: {
            args: Prisma.t_message_attachmentCountArgs<ExtArgs>
            result: $Utils.Optional<T_message_attachmentCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    t_conversation?: t_conversationOmit
    t_conversation_participant?: t_conversation_participantOmit
    t_message?: t_messageOmit
    t_message_attachment?: t_message_attachmentOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type T_conversationCountOutputType
   */

  export type T_conversationCountOutputType = {
    participants: number
    messages: number
  }

  export type T_conversationCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    participants?: boolean | T_conversationCountOutputTypeCountParticipantsArgs
    messages?: boolean | T_conversationCountOutputTypeCountMessagesArgs
  }

  // Custom InputTypes
  /**
   * T_conversationCountOutputType without action
   */
  export type T_conversationCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the T_conversationCountOutputType
     */
    select?: T_conversationCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * T_conversationCountOutputType without action
   */
  export type T_conversationCountOutputTypeCountParticipantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: t_conversation_participantWhereInput
  }

  /**
   * T_conversationCountOutputType without action
   */
  export type T_conversationCountOutputTypeCountMessagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: t_messageWhereInput
  }


  /**
   * Count Type T_messageCountOutputType
   */

  export type T_messageCountOutputType = {
    attachments: number
  }

  export type T_messageCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attachments?: boolean | T_messageCountOutputTypeCountAttachmentsArgs
  }

  // Custom InputTypes
  /**
   * T_messageCountOutputType without action
   */
  export type T_messageCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the T_messageCountOutputType
     */
    select?: T_messageCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * T_messageCountOutputType without action
   */
  export type T_messageCountOutputTypeCountAttachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: t_message_attachmentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model t_conversation
   */

  export type AggregateT_conversation = {
    _count: T_conversationCountAggregateOutputType | null
    _avg: T_conversationAvgAggregateOutputType | null
    _sum: T_conversationSumAggregateOutputType | null
    _min: T_conversationMinAggregateOutputType | null
    _max: T_conversationMaxAggregateOutputType | null
  }

  export type T_conversationAvgAggregateOutputType = {
    Id_Conversation: number | null
  }

  export type T_conversationSumAggregateOutputType = {
    Id_Conversation: number | null
  }

  export type T_conversationMinAggregateOutputType = {
    Id_Conversation: number | null
    Type: string | null
    Titre: string | null
    DM_Key: string | null
    Date_Creation: Date | null
  }

  export type T_conversationMaxAggregateOutputType = {
    Id_Conversation: number | null
    Type: string | null
    Titre: string | null
    DM_Key: string | null
    Date_Creation: Date | null
  }

  export type T_conversationCountAggregateOutputType = {
    Id_Conversation: number
    Type: number
    Titre: number
    DM_Key: number
    Date_Creation: number
    _all: number
  }


  export type T_conversationAvgAggregateInputType = {
    Id_Conversation?: true
  }

  export type T_conversationSumAggregateInputType = {
    Id_Conversation?: true
  }

  export type T_conversationMinAggregateInputType = {
    Id_Conversation?: true
    Type?: true
    Titre?: true
    DM_Key?: true
    Date_Creation?: true
  }

  export type T_conversationMaxAggregateInputType = {
    Id_Conversation?: true
    Type?: true
    Titre?: true
    DM_Key?: true
    Date_Creation?: true
  }

  export type T_conversationCountAggregateInputType = {
    Id_Conversation?: true
    Type?: true
    Titre?: true
    DM_Key?: true
    Date_Creation?: true
    _all?: true
  }

  export type T_conversationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which t_conversation to aggregate.
     */
    where?: t_conversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_conversations to fetch.
     */
    orderBy?: t_conversationOrderByWithRelationInput | t_conversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: t_conversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned t_conversations
    **/
    _count?: true | T_conversationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: T_conversationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: T_conversationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: T_conversationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: T_conversationMaxAggregateInputType
  }

  export type GetT_conversationAggregateType<T extends T_conversationAggregateArgs> = {
        [P in keyof T & keyof AggregateT_conversation]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateT_conversation[P]>
      : GetScalarType<T[P], AggregateT_conversation[P]>
  }




  export type t_conversationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: t_conversationWhereInput
    orderBy?: t_conversationOrderByWithAggregationInput | t_conversationOrderByWithAggregationInput[]
    by: T_conversationScalarFieldEnum[] | T_conversationScalarFieldEnum
    having?: t_conversationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: T_conversationCountAggregateInputType | true
    _avg?: T_conversationAvgAggregateInputType
    _sum?: T_conversationSumAggregateInputType
    _min?: T_conversationMinAggregateInputType
    _max?: T_conversationMaxAggregateInputType
  }

  export type T_conversationGroupByOutputType = {
    Id_Conversation: number
    Type: string
    Titre: string | null
    DM_Key: string | null
    Date_Creation: Date
    _count: T_conversationCountAggregateOutputType | null
    _avg: T_conversationAvgAggregateOutputType | null
    _sum: T_conversationSumAggregateOutputType | null
    _min: T_conversationMinAggregateOutputType | null
    _max: T_conversationMaxAggregateOutputType | null
  }

  type GetT_conversationGroupByPayload<T extends t_conversationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<T_conversationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof T_conversationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], T_conversationGroupByOutputType[P]>
            : GetScalarType<T[P], T_conversationGroupByOutputType[P]>
        }
      >
    >


  export type t_conversationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Conversation?: boolean
    Type?: boolean
    Titre?: boolean
    DM_Key?: boolean
    Date_Creation?: boolean
    participants?: boolean | t_conversation$participantsArgs<ExtArgs>
    messages?: boolean | t_conversation$messagesArgs<ExtArgs>
    _count?: boolean | T_conversationCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["t_conversation"]>



  export type t_conversationSelectScalar = {
    Id_Conversation?: boolean
    Type?: boolean
    Titre?: boolean
    DM_Key?: boolean
    Date_Creation?: boolean
  }

  export type t_conversationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Conversation" | "Type" | "Titre" | "DM_Key" | "Date_Creation", ExtArgs["result"]["t_conversation"]>
  export type t_conversationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    participants?: boolean | t_conversation$participantsArgs<ExtArgs>
    messages?: boolean | t_conversation$messagesArgs<ExtArgs>
    _count?: boolean | T_conversationCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $t_conversationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "t_conversation"
    objects: {
      participants: Prisma.$t_conversation_participantPayload<ExtArgs>[]
      messages: Prisma.$t_messagePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      Id_Conversation: number
      Type: string
      Titre: string | null
      DM_Key: string | null
      Date_Creation: Date
    }, ExtArgs["result"]["t_conversation"]>
    composites: {}
  }

  type t_conversationGetPayload<S extends boolean | null | undefined | t_conversationDefaultArgs> = $Result.GetResult<Prisma.$t_conversationPayload, S>

  type t_conversationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<t_conversationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: T_conversationCountAggregateInputType | true
    }

  export interface t_conversationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['t_conversation'], meta: { name: 't_conversation' } }
    /**
     * Find zero or one T_conversation that matches the filter.
     * @param {t_conversationFindUniqueArgs} args - Arguments to find a T_conversation
     * @example
     * // Get one T_conversation
     * const t_conversation = await prisma.t_conversation.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends t_conversationFindUniqueArgs>(args: SelectSubset<T, t_conversationFindUniqueArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one T_conversation that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {t_conversationFindUniqueOrThrowArgs} args - Arguments to find a T_conversation
     * @example
     * // Get one T_conversation
     * const t_conversation = await prisma.t_conversation.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends t_conversationFindUniqueOrThrowArgs>(args: SelectSubset<T, t_conversationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first T_conversation that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversationFindFirstArgs} args - Arguments to find a T_conversation
     * @example
     * // Get one T_conversation
     * const t_conversation = await prisma.t_conversation.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends t_conversationFindFirstArgs>(args?: SelectSubset<T, t_conversationFindFirstArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first T_conversation that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversationFindFirstOrThrowArgs} args - Arguments to find a T_conversation
     * @example
     * // Get one T_conversation
     * const t_conversation = await prisma.t_conversation.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends t_conversationFindFirstOrThrowArgs>(args?: SelectSubset<T, t_conversationFindFirstOrThrowArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more T_conversations that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all T_conversations
     * const t_conversations = await prisma.t_conversation.findMany()
     * 
     * // Get first 10 T_conversations
     * const t_conversations = await prisma.t_conversation.findMany({ take: 10 })
     * 
     * // Only select the `Id_Conversation`
     * const t_conversationWithId_ConversationOnly = await prisma.t_conversation.findMany({ select: { Id_Conversation: true } })
     * 
     */
    findMany<T extends t_conversationFindManyArgs>(args?: SelectSubset<T, t_conversationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a T_conversation.
     * @param {t_conversationCreateArgs} args - Arguments to create a T_conversation.
     * @example
     * // Create one T_conversation
     * const T_conversation = await prisma.t_conversation.create({
     *   data: {
     *     // ... data to create a T_conversation
     *   }
     * })
     * 
     */
    create<T extends t_conversationCreateArgs>(args: SelectSubset<T, t_conversationCreateArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many T_conversations.
     * @param {t_conversationCreateManyArgs} args - Arguments to create many T_conversations.
     * @example
     * // Create many T_conversations
     * const t_conversation = await prisma.t_conversation.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends t_conversationCreateManyArgs>(args?: SelectSubset<T, t_conversationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a T_conversation.
     * @param {t_conversationDeleteArgs} args - Arguments to delete one T_conversation.
     * @example
     * // Delete one T_conversation
     * const T_conversation = await prisma.t_conversation.delete({
     *   where: {
     *     // ... filter to delete one T_conversation
     *   }
     * })
     * 
     */
    delete<T extends t_conversationDeleteArgs>(args: SelectSubset<T, t_conversationDeleteArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one T_conversation.
     * @param {t_conversationUpdateArgs} args - Arguments to update one T_conversation.
     * @example
     * // Update one T_conversation
     * const t_conversation = await prisma.t_conversation.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends t_conversationUpdateArgs>(args: SelectSubset<T, t_conversationUpdateArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more T_conversations.
     * @param {t_conversationDeleteManyArgs} args - Arguments to filter T_conversations to delete.
     * @example
     * // Delete a few T_conversations
     * const { count } = await prisma.t_conversation.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends t_conversationDeleteManyArgs>(args?: SelectSubset<T, t_conversationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more T_conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many T_conversations
     * const t_conversation = await prisma.t_conversation.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends t_conversationUpdateManyArgs>(args: SelectSubset<T, t_conversationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one T_conversation.
     * @param {t_conversationUpsertArgs} args - Arguments to update or create a T_conversation.
     * @example
     * // Update or create a T_conversation
     * const t_conversation = await prisma.t_conversation.upsert({
     *   create: {
     *     // ... data to create a T_conversation
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the T_conversation we want to update
     *   }
     * })
     */
    upsert<T extends t_conversationUpsertArgs>(args: SelectSubset<T, t_conversationUpsertArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of T_conversations.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversationCountArgs} args - Arguments to filter T_conversations to count.
     * @example
     * // Count the number of T_conversations
     * const count = await prisma.t_conversation.count({
     *   where: {
     *     // ... the filter for the T_conversations we want to count
     *   }
     * })
    **/
    count<T extends t_conversationCountArgs>(
      args?: Subset<T, t_conversationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], T_conversationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a T_conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {T_conversationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends T_conversationAggregateArgs>(args: Subset<T, T_conversationAggregateArgs>): Prisma.PrismaPromise<GetT_conversationAggregateType<T>>

    /**
     * Group by T_conversation.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversationGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends t_conversationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: t_conversationGroupByArgs['orderBy'] }
        : { orderBy?: t_conversationGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, t_conversationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetT_conversationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the t_conversation model
   */
  readonly fields: t_conversationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for t_conversation.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__t_conversationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    participants<T extends t_conversation$participantsArgs<ExtArgs> = {}>(args?: Subset<T, t_conversation$participantsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    messages<T extends t_conversation$messagesArgs<ExtArgs> = {}>(args?: Subset<T, t_conversation$messagesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the t_conversation model
   */
  interface t_conversationFieldRefs {
    readonly Id_Conversation: FieldRef<"t_conversation", 'Int'>
    readonly Type: FieldRef<"t_conversation", 'String'>
    readonly Titre: FieldRef<"t_conversation", 'String'>
    readonly DM_Key: FieldRef<"t_conversation", 'String'>
    readonly Date_Creation: FieldRef<"t_conversation", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * t_conversation findUnique
   */
  export type t_conversationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
    /**
     * Filter, which t_conversation to fetch.
     */
    where: t_conversationWhereUniqueInput
  }

  /**
   * t_conversation findUniqueOrThrow
   */
  export type t_conversationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
    /**
     * Filter, which t_conversation to fetch.
     */
    where: t_conversationWhereUniqueInput
  }

  /**
   * t_conversation findFirst
   */
  export type t_conversationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
    /**
     * Filter, which t_conversation to fetch.
     */
    where?: t_conversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_conversations to fetch.
     */
    orderBy?: t_conversationOrderByWithRelationInput | t_conversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for t_conversations.
     */
    cursor?: t_conversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of t_conversations.
     */
    distinct?: T_conversationScalarFieldEnum | T_conversationScalarFieldEnum[]
  }

  /**
   * t_conversation findFirstOrThrow
   */
  export type t_conversationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
    /**
     * Filter, which t_conversation to fetch.
     */
    where?: t_conversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_conversations to fetch.
     */
    orderBy?: t_conversationOrderByWithRelationInput | t_conversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for t_conversations.
     */
    cursor?: t_conversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_conversations.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of t_conversations.
     */
    distinct?: T_conversationScalarFieldEnum | T_conversationScalarFieldEnum[]
  }

  /**
   * t_conversation findMany
   */
  export type t_conversationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
    /**
     * Filter, which t_conversations to fetch.
     */
    where?: t_conversationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_conversations to fetch.
     */
    orderBy?: t_conversationOrderByWithRelationInput | t_conversationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing t_conversations.
     */
    cursor?: t_conversationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_conversations from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_conversations.
     */
    skip?: number
    distinct?: T_conversationScalarFieldEnum | T_conversationScalarFieldEnum[]
  }

  /**
   * t_conversation create
   */
  export type t_conversationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
    /**
     * The data needed to create a t_conversation.
     */
    data: XOR<t_conversationCreateInput, t_conversationUncheckedCreateInput>
  }

  /**
   * t_conversation createMany
   */
  export type t_conversationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many t_conversations.
     */
    data: t_conversationCreateManyInput | t_conversationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * t_conversation update
   */
  export type t_conversationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
    /**
     * The data needed to update a t_conversation.
     */
    data: XOR<t_conversationUpdateInput, t_conversationUncheckedUpdateInput>
    /**
     * Choose, which t_conversation to update.
     */
    where: t_conversationWhereUniqueInput
  }

  /**
   * t_conversation updateMany
   */
  export type t_conversationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update t_conversations.
     */
    data: XOR<t_conversationUpdateManyMutationInput, t_conversationUncheckedUpdateManyInput>
    /**
     * Filter which t_conversations to update
     */
    where?: t_conversationWhereInput
    /**
     * Limit how many t_conversations to update.
     */
    limit?: number
  }

  /**
   * t_conversation upsert
   */
  export type t_conversationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
    /**
     * The filter to search for the t_conversation to update in case it exists.
     */
    where: t_conversationWhereUniqueInput
    /**
     * In case the t_conversation found by the `where` argument doesn't exist, create a new t_conversation with this data.
     */
    create: XOR<t_conversationCreateInput, t_conversationUncheckedCreateInput>
    /**
     * In case the t_conversation was found with the provided `where` argument, update it with this data.
     */
    update: XOR<t_conversationUpdateInput, t_conversationUncheckedUpdateInput>
  }

  /**
   * t_conversation delete
   */
  export type t_conversationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
    /**
     * Filter which t_conversation to delete.
     */
    where: t_conversationWhereUniqueInput
  }

  /**
   * t_conversation deleteMany
   */
  export type t_conversationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which t_conversations to delete
     */
    where?: t_conversationWhereInput
    /**
     * Limit how many t_conversations to delete.
     */
    limit?: number
  }

  /**
   * t_conversation.participants
   */
  export type t_conversation$participantsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    where?: t_conversation_participantWhereInput
    orderBy?: t_conversation_participantOrderByWithRelationInput | t_conversation_participantOrderByWithRelationInput[]
    cursor?: t_conversation_participantWhereUniqueInput
    take?: number
    skip?: number
    distinct?: T_conversation_participantScalarFieldEnum | T_conversation_participantScalarFieldEnum[]
  }

  /**
   * t_conversation.messages
   */
  export type t_conversation$messagesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    where?: t_messageWhereInput
    orderBy?: t_messageOrderByWithRelationInput | t_messageOrderByWithRelationInput[]
    cursor?: t_messageWhereUniqueInput
    take?: number
    skip?: number
    distinct?: T_messageScalarFieldEnum | T_messageScalarFieldEnum[]
  }

  /**
   * t_conversation without action
   */
  export type t_conversationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation
     */
    select?: t_conversationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation
     */
    omit?: t_conversationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversationInclude<ExtArgs> | null
  }


  /**
   * Model t_conversation_participant
   */

  export type AggregateT_conversation_participant = {
    _count: T_conversation_participantCountAggregateOutputType | null
    _avg: T_conversation_participantAvgAggregateOutputType | null
    _sum: T_conversation_participantSumAggregateOutputType | null
    _min: T_conversation_participantMinAggregateOutputType | null
    _max: T_conversation_participantMaxAggregateOutputType | null
  }

  export type T_conversation_participantAvgAggregateOutputType = {
    Id_Participant: number | null
    Id_Conversation: number | null
    Id_Utilisateur: number | null
    Last_Read_Msg_Id: number | null
  }

  export type T_conversation_participantSumAggregateOutputType = {
    Id_Participant: number | null
    Id_Conversation: number | null
    Id_Utilisateur: number | null
    Last_Read_Msg_Id: number | null
  }

  export type T_conversation_participantMinAggregateOutputType = {
    Id_Participant: number | null
    Id_Conversation: number | null
    Id_Utilisateur: number | null
    Last_Read_Msg_Id: number | null
    Date_Ajout: Date | null
  }

  export type T_conversation_participantMaxAggregateOutputType = {
    Id_Participant: number | null
    Id_Conversation: number | null
    Id_Utilisateur: number | null
    Last_Read_Msg_Id: number | null
    Date_Ajout: Date | null
  }

  export type T_conversation_participantCountAggregateOutputType = {
    Id_Participant: number
    Id_Conversation: number
    Id_Utilisateur: number
    Last_Read_Msg_Id: number
    Date_Ajout: number
    _all: number
  }


  export type T_conversation_participantAvgAggregateInputType = {
    Id_Participant?: true
    Id_Conversation?: true
    Id_Utilisateur?: true
    Last_Read_Msg_Id?: true
  }

  export type T_conversation_participantSumAggregateInputType = {
    Id_Participant?: true
    Id_Conversation?: true
    Id_Utilisateur?: true
    Last_Read_Msg_Id?: true
  }

  export type T_conversation_participantMinAggregateInputType = {
    Id_Participant?: true
    Id_Conversation?: true
    Id_Utilisateur?: true
    Last_Read_Msg_Id?: true
    Date_Ajout?: true
  }

  export type T_conversation_participantMaxAggregateInputType = {
    Id_Participant?: true
    Id_Conversation?: true
    Id_Utilisateur?: true
    Last_Read_Msg_Id?: true
    Date_Ajout?: true
  }

  export type T_conversation_participantCountAggregateInputType = {
    Id_Participant?: true
    Id_Conversation?: true
    Id_Utilisateur?: true
    Last_Read_Msg_Id?: true
    Date_Ajout?: true
    _all?: true
  }

  export type T_conversation_participantAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which t_conversation_participant to aggregate.
     */
    where?: t_conversation_participantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_conversation_participants to fetch.
     */
    orderBy?: t_conversation_participantOrderByWithRelationInput | t_conversation_participantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: t_conversation_participantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_conversation_participants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_conversation_participants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned t_conversation_participants
    **/
    _count?: true | T_conversation_participantCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: T_conversation_participantAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: T_conversation_participantSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: T_conversation_participantMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: T_conversation_participantMaxAggregateInputType
  }

  export type GetT_conversation_participantAggregateType<T extends T_conversation_participantAggregateArgs> = {
        [P in keyof T & keyof AggregateT_conversation_participant]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateT_conversation_participant[P]>
      : GetScalarType<T[P], AggregateT_conversation_participant[P]>
  }




  export type t_conversation_participantGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: t_conversation_participantWhereInput
    orderBy?: t_conversation_participantOrderByWithAggregationInput | t_conversation_participantOrderByWithAggregationInput[]
    by: T_conversation_participantScalarFieldEnum[] | T_conversation_participantScalarFieldEnum
    having?: t_conversation_participantScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: T_conversation_participantCountAggregateInputType | true
    _avg?: T_conversation_participantAvgAggregateInputType
    _sum?: T_conversation_participantSumAggregateInputType
    _min?: T_conversation_participantMinAggregateInputType
    _max?: T_conversation_participantMaxAggregateInputType
  }

  export type T_conversation_participantGroupByOutputType = {
    Id_Participant: number
    Id_Conversation: number
    Id_Utilisateur: number
    Last_Read_Msg_Id: number | null
    Date_Ajout: Date
    _count: T_conversation_participantCountAggregateOutputType | null
    _avg: T_conversation_participantAvgAggregateOutputType | null
    _sum: T_conversation_participantSumAggregateOutputType | null
    _min: T_conversation_participantMinAggregateOutputType | null
    _max: T_conversation_participantMaxAggregateOutputType | null
  }

  type GetT_conversation_participantGroupByPayload<T extends t_conversation_participantGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<T_conversation_participantGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof T_conversation_participantGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], T_conversation_participantGroupByOutputType[P]>
            : GetScalarType<T[P], T_conversation_participantGroupByOutputType[P]>
        }
      >
    >


  export type t_conversation_participantSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Participant?: boolean
    Id_Conversation?: boolean
    Id_Utilisateur?: boolean
    Last_Read_Msg_Id?: boolean
    Date_Ajout?: boolean
    conversation?: boolean | t_conversationDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["t_conversation_participant"]>



  export type t_conversation_participantSelectScalar = {
    Id_Participant?: boolean
    Id_Conversation?: boolean
    Id_Utilisateur?: boolean
    Last_Read_Msg_Id?: boolean
    Date_Ajout?: boolean
  }

  export type t_conversation_participantOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Participant" | "Id_Conversation" | "Id_Utilisateur" | "Last_Read_Msg_Id" | "Date_Ajout", ExtArgs["result"]["t_conversation_participant"]>
  export type t_conversation_participantInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | t_conversationDefaultArgs<ExtArgs>
  }

  export type $t_conversation_participantPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "t_conversation_participant"
    objects: {
      conversation: Prisma.$t_conversationPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      Id_Participant: number
      Id_Conversation: number
      Id_Utilisateur: number
      Last_Read_Msg_Id: number | null
      Date_Ajout: Date
    }, ExtArgs["result"]["t_conversation_participant"]>
    composites: {}
  }

  type t_conversation_participantGetPayload<S extends boolean | null | undefined | t_conversation_participantDefaultArgs> = $Result.GetResult<Prisma.$t_conversation_participantPayload, S>

  type t_conversation_participantCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<t_conversation_participantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: T_conversation_participantCountAggregateInputType | true
    }

  export interface t_conversation_participantDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['t_conversation_participant'], meta: { name: 't_conversation_participant' } }
    /**
     * Find zero or one T_conversation_participant that matches the filter.
     * @param {t_conversation_participantFindUniqueArgs} args - Arguments to find a T_conversation_participant
     * @example
     * // Get one T_conversation_participant
     * const t_conversation_participant = await prisma.t_conversation_participant.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends t_conversation_participantFindUniqueArgs>(args: SelectSubset<T, t_conversation_participantFindUniqueArgs<ExtArgs>>): Prisma__t_conversation_participantClient<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one T_conversation_participant that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {t_conversation_participantFindUniqueOrThrowArgs} args - Arguments to find a T_conversation_participant
     * @example
     * // Get one T_conversation_participant
     * const t_conversation_participant = await prisma.t_conversation_participant.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends t_conversation_participantFindUniqueOrThrowArgs>(args: SelectSubset<T, t_conversation_participantFindUniqueOrThrowArgs<ExtArgs>>): Prisma__t_conversation_participantClient<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first T_conversation_participant that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversation_participantFindFirstArgs} args - Arguments to find a T_conversation_participant
     * @example
     * // Get one T_conversation_participant
     * const t_conversation_participant = await prisma.t_conversation_participant.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends t_conversation_participantFindFirstArgs>(args?: SelectSubset<T, t_conversation_participantFindFirstArgs<ExtArgs>>): Prisma__t_conversation_participantClient<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first T_conversation_participant that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversation_participantFindFirstOrThrowArgs} args - Arguments to find a T_conversation_participant
     * @example
     * // Get one T_conversation_participant
     * const t_conversation_participant = await prisma.t_conversation_participant.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends t_conversation_participantFindFirstOrThrowArgs>(args?: SelectSubset<T, t_conversation_participantFindFirstOrThrowArgs<ExtArgs>>): Prisma__t_conversation_participantClient<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more T_conversation_participants that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversation_participantFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all T_conversation_participants
     * const t_conversation_participants = await prisma.t_conversation_participant.findMany()
     * 
     * // Get first 10 T_conversation_participants
     * const t_conversation_participants = await prisma.t_conversation_participant.findMany({ take: 10 })
     * 
     * // Only select the `Id_Participant`
     * const t_conversation_participantWithId_ParticipantOnly = await prisma.t_conversation_participant.findMany({ select: { Id_Participant: true } })
     * 
     */
    findMany<T extends t_conversation_participantFindManyArgs>(args?: SelectSubset<T, t_conversation_participantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a T_conversation_participant.
     * @param {t_conversation_participantCreateArgs} args - Arguments to create a T_conversation_participant.
     * @example
     * // Create one T_conversation_participant
     * const T_conversation_participant = await prisma.t_conversation_participant.create({
     *   data: {
     *     // ... data to create a T_conversation_participant
     *   }
     * })
     * 
     */
    create<T extends t_conversation_participantCreateArgs>(args: SelectSubset<T, t_conversation_participantCreateArgs<ExtArgs>>): Prisma__t_conversation_participantClient<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many T_conversation_participants.
     * @param {t_conversation_participantCreateManyArgs} args - Arguments to create many T_conversation_participants.
     * @example
     * // Create many T_conversation_participants
     * const t_conversation_participant = await prisma.t_conversation_participant.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends t_conversation_participantCreateManyArgs>(args?: SelectSubset<T, t_conversation_participantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a T_conversation_participant.
     * @param {t_conversation_participantDeleteArgs} args - Arguments to delete one T_conversation_participant.
     * @example
     * // Delete one T_conversation_participant
     * const T_conversation_participant = await prisma.t_conversation_participant.delete({
     *   where: {
     *     // ... filter to delete one T_conversation_participant
     *   }
     * })
     * 
     */
    delete<T extends t_conversation_participantDeleteArgs>(args: SelectSubset<T, t_conversation_participantDeleteArgs<ExtArgs>>): Prisma__t_conversation_participantClient<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one T_conversation_participant.
     * @param {t_conversation_participantUpdateArgs} args - Arguments to update one T_conversation_participant.
     * @example
     * // Update one T_conversation_participant
     * const t_conversation_participant = await prisma.t_conversation_participant.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends t_conversation_participantUpdateArgs>(args: SelectSubset<T, t_conversation_participantUpdateArgs<ExtArgs>>): Prisma__t_conversation_participantClient<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more T_conversation_participants.
     * @param {t_conversation_participantDeleteManyArgs} args - Arguments to filter T_conversation_participants to delete.
     * @example
     * // Delete a few T_conversation_participants
     * const { count } = await prisma.t_conversation_participant.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends t_conversation_participantDeleteManyArgs>(args?: SelectSubset<T, t_conversation_participantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more T_conversation_participants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversation_participantUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many T_conversation_participants
     * const t_conversation_participant = await prisma.t_conversation_participant.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends t_conversation_participantUpdateManyArgs>(args: SelectSubset<T, t_conversation_participantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one T_conversation_participant.
     * @param {t_conversation_participantUpsertArgs} args - Arguments to update or create a T_conversation_participant.
     * @example
     * // Update or create a T_conversation_participant
     * const t_conversation_participant = await prisma.t_conversation_participant.upsert({
     *   create: {
     *     // ... data to create a T_conversation_participant
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the T_conversation_participant we want to update
     *   }
     * })
     */
    upsert<T extends t_conversation_participantUpsertArgs>(args: SelectSubset<T, t_conversation_participantUpsertArgs<ExtArgs>>): Prisma__t_conversation_participantClient<$Result.GetResult<Prisma.$t_conversation_participantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of T_conversation_participants.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversation_participantCountArgs} args - Arguments to filter T_conversation_participants to count.
     * @example
     * // Count the number of T_conversation_participants
     * const count = await prisma.t_conversation_participant.count({
     *   where: {
     *     // ... the filter for the T_conversation_participants we want to count
     *   }
     * })
    **/
    count<T extends t_conversation_participantCountArgs>(
      args?: Subset<T, t_conversation_participantCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], T_conversation_participantCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a T_conversation_participant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {T_conversation_participantAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends T_conversation_participantAggregateArgs>(args: Subset<T, T_conversation_participantAggregateArgs>): Prisma.PrismaPromise<GetT_conversation_participantAggregateType<T>>

    /**
     * Group by T_conversation_participant.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_conversation_participantGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends t_conversation_participantGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: t_conversation_participantGroupByArgs['orderBy'] }
        : { orderBy?: t_conversation_participantGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, t_conversation_participantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetT_conversation_participantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the t_conversation_participant model
   */
  readonly fields: t_conversation_participantFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for t_conversation_participant.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__t_conversation_participantClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    conversation<T extends t_conversationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, t_conversationDefaultArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the t_conversation_participant model
   */
  interface t_conversation_participantFieldRefs {
    readonly Id_Participant: FieldRef<"t_conversation_participant", 'Int'>
    readonly Id_Conversation: FieldRef<"t_conversation_participant", 'Int'>
    readonly Id_Utilisateur: FieldRef<"t_conversation_participant", 'Int'>
    readonly Last_Read_Msg_Id: FieldRef<"t_conversation_participant", 'Int'>
    readonly Date_Ajout: FieldRef<"t_conversation_participant", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * t_conversation_participant findUnique
   */
  export type t_conversation_participantFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    /**
     * Filter, which t_conversation_participant to fetch.
     */
    where: t_conversation_participantWhereUniqueInput
  }

  /**
   * t_conversation_participant findUniqueOrThrow
   */
  export type t_conversation_participantFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    /**
     * Filter, which t_conversation_participant to fetch.
     */
    where: t_conversation_participantWhereUniqueInput
  }

  /**
   * t_conversation_participant findFirst
   */
  export type t_conversation_participantFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    /**
     * Filter, which t_conversation_participant to fetch.
     */
    where?: t_conversation_participantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_conversation_participants to fetch.
     */
    orderBy?: t_conversation_participantOrderByWithRelationInput | t_conversation_participantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for t_conversation_participants.
     */
    cursor?: t_conversation_participantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_conversation_participants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_conversation_participants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of t_conversation_participants.
     */
    distinct?: T_conversation_participantScalarFieldEnum | T_conversation_participantScalarFieldEnum[]
  }

  /**
   * t_conversation_participant findFirstOrThrow
   */
  export type t_conversation_participantFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    /**
     * Filter, which t_conversation_participant to fetch.
     */
    where?: t_conversation_participantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_conversation_participants to fetch.
     */
    orderBy?: t_conversation_participantOrderByWithRelationInput | t_conversation_participantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for t_conversation_participants.
     */
    cursor?: t_conversation_participantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_conversation_participants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_conversation_participants.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of t_conversation_participants.
     */
    distinct?: T_conversation_participantScalarFieldEnum | T_conversation_participantScalarFieldEnum[]
  }

  /**
   * t_conversation_participant findMany
   */
  export type t_conversation_participantFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    /**
     * Filter, which t_conversation_participants to fetch.
     */
    where?: t_conversation_participantWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_conversation_participants to fetch.
     */
    orderBy?: t_conversation_participantOrderByWithRelationInput | t_conversation_participantOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing t_conversation_participants.
     */
    cursor?: t_conversation_participantWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_conversation_participants from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_conversation_participants.
     */
    skip?: number
    distinct?: T_conversation_participantScalarFieldEnum | T_conversation_participantScalarFieldEnum[]
  }

  /**
   * t_conversation_participant create
   */
  export type t_conversation_participantCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    /**
     * The data needed to create a t_conversation_participant.
     */
    data: XOR<t_conversation_participantCreateInput, t_conversation_participantUncheckedCreateInput>
  }

  /**
   * t_conversation_participant createMany
   */
  export type t_conversation_participantCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many t_conversation_participants.
     */
    data: t_conversation_participantCreateManyInput | t_conversation_participantCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * t_conversation_participant update
   */
  export type t_conversation_participantUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    /**
     * The data needed to update a t_conversation_participant.
     */
    data: XOR<t_conversation_participantUpdateInput, t_conversation_participantUncheckedUpdateInput>
    /**
     * Choose, which t_conversation_participant to update.
     */
    where: t_conversation_participantWhereUniqueInput
  }

  /**
   * t_conversation_participant updateMany
   */
  export type t_conversation_participantUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update t_conversation_participants.
     */
    data: XOR<t_conversation_participantUpdateManyMutationInput, t_conversation_participantUncheckedUpdateManyInput>
    /**
     * Filter which t_conversation_participants to update
     */
    where?: t_conversation_participantWhereInput
    /**
     * Limit how many t_conversation_participants to update.
     */
    limit?: number
  }

  /**
   * t_conversation_participant upsert
   */
  export type t_conversation_participantUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    /**
     * The filter to search for the t_conversation_participant to update in case it exists.
     */
    where: t_conversation_participantWhereUniqueInput
    /**
     * In case the t_conversation_participant found by the `where` argument doesn't exist, create a new t_conversation_participant with this data.
     */
    create: XOR<t_conversation_participantCreateInput, t_conversation_participantUncheckedCreateInput>
    /**
     * In case the t_conversation_participant was found with the provided `where` argument, update it with this data.
     */
    update: XOR<t_conversation_participantUpdateInput, t_conversation_participantUncheckedUpdateInput>
  }

  /**
   * t_conversation_participant delete
   */
  export type t_conversation_participantDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
    /**
     * Filter which t_conversation_participant to delete.
     */
    where: t_conversation_participantWhereUniqueInput
  }

  /**
   * t_conversation_participant deleteMany
   */
  export type t_conversation_participantDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which t_conversation_participants to delete
     */
    where?: t_conversation_participantWhereInput
    /**
     * Limit how many t_conversation_participants to delete.
     */
    limit?: number
  }

  /**
   * t_conversation_participant without action
   */
  export type t_conversation_participantDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_conversation_participant
     */
    select?: t_conversation_participantSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_conversation_participant
     */
    omit?: t_conversation_participantOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_conversation_participantInclude<ExtArgs> | null
  }


  /**
   * Model t_message
   */

  export type AggregateT_message = {
    _count: T_messageCountAggregateOutputType | null
    _avg: T_messageAvgAggregateOutputType | null
    _sum: T_messageSumAggregateOutputType | null
    _min: T_messageMinAggregateOutputType | null
    _max: T_messageMaxAggregateOutputType | null
  }

  export type T_messageAvgAggregateOutputType = {
    Id_Message: number | null
    Id_Conversation: number | null
    Sender_Id: number | null
  }

  export type T_messageSumAggregateOutputType = {
    Id_Message: number | null
    Id_Conversation: number | null
    Sender_Id: number | null
  }

  export type T_messageMinAggregateOutputType = {
    Id_Message: number | null
    Id_Conversation: number | null
    Sender_Id: number | null
    Contenu: string | null
    Date_Creation: Date | null
    Date_Modification: Date | null
    Date_Suppression: Date | null
  }

  export type T_messageMaxAggregateOutputType = {
    Id_Message: number | null
    Id_Conversation: number | null
    Sender_Id: number | null
    Contenu: string | null
    Date_Creation: Date | null
    Date_Modification: Date | null
    Date_Suppression: Date | null
  }

  export type T_messageCountAggregateOutputType = {
    Id_Message: number
    Id_Conversation: number
    Sender_Id: number
    Contenu: number
    Date_Creation: number
    Date_Modification: number
    Date_Suppression: number
    _all: number
  }


  export type T_messageAvgAggregateInputType = {
    Id_Message?: true
    Id_Conversation?: true
    Sender_Id?: true
  }

  export type T_messageSumAggregateInputType = {
    Id_Message?: true
    Id_Conversation?: true
    Sender_Id?: true
  }

  export type T_messageMinAggregateInputType = {
    Id_Message?: true
    Id_Conversation?: true
    Sender_Id?: true
    Contenu?: true
    Date_Creation?: true
    Date_Modification?: true
    Date_Suppression?: true
  }

  export type T_messageMaxAggregateInputType = {
    Id_Message?: true
    Id_Conversation?: true
    Sender_Id?: true
    Contenu?: true
    Date_Creation?: true
    Date_Modification?: true
    Date_Suppression?: true
  }

  export type T_messageCountAggregateInputType = {
    Id_Message?: true
    Id_Conversation?: true
    Sender_Id?: true
    Contenu?: true
    Date_Creation?: true
    Date_Modification?: true
    Date_Suppression?: true
    _all?: true
  }

  export type T_messageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which t_message to aggregate.
     */
    where?: t_messageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_messages to fetch.
     */
    orderBy?: t_messageOrderByWithRelationInput | t_messageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: t_messageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned t_messages
    **/
    _count?: true | T_messageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: T_messageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: T_messageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: T_messageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: T_messageMaxAggregateInputType
  }

  export type GetT_messageAggregateType<T extends T_messageAggregateArgs> = {
        [P in keyof T & keyof AggregateT_message]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateT_message[P]>
      : GetScalarType<T[P], AggregateT_message[P]>
  }




  export type t_messageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: t_messageWhereInput
    orderBy?: t_messageOrderByWithAggregationInput | t_messageOrderByWithAggregationInput[]
    by: T_messageScalarFieldEnum[] | T_messageScalarFieldEnum
    having?: t_messageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: T_messageCountAggregateInputType | true
    _avg?: T_messageAvgAggregateInputType
    _sum?: T_messageSumAggregateInputType
    _min?: T_messageMinAggregateInputType
    _max?: T_messageMaxAggregateInputType
  }

  export type T_messageGroupByOutputType = {
    Id_Message: number
    Id_Conversation: number
    Sender_Id: number
    Contenu: string
    Date_Creation: Date
    Date_Modification: Date | null
    Date_Suppression: Date | null
    _count: T_messageCountAggregateOutputType | null
    _avg: T_messageAvgAggregateOutputType | null
    _sum: T_messageSumAggregateOutputType | null
    _min: T_messageMinAggregateOutputType | null
    _max: T_messageMaxAggregateOutputType | null
  }

  type GetT_messageGroupByPayload<T extends t_messageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<T_messageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof T_messageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], T_messageGroupByOutputType[P]>
            : GetScalarType<T[P], T_messageGroupByOutputType[P]>
        }
      >
    >


  export type t_messageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Message?: boolean
    Id_Conversation?: boolean
    Sender_Id?: boolean
    Contenu?: boolean
    Date_Creation?: boolean
    Date_Modification?: boolean
    Date_Suppression?: boolean
    conversation?: boolean | t_conversationDefaultArgs<ExtArgs>
    attachments?: boolean | t_message$attachmentsArgs<ExtArgs>
    _count?: boolean | T_messageCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["t_message"]>



  export type t_messageSelectScalar = {
    Id_Message?: boolean
    Id_Conversation?: boolean
    Sender_Id?: boolean
    Contenu?: boolean
    Date_Creation?: boolean
    Date_Modification?: boolean
    Date_Suppression?: boolean
  }

  export type t_messageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Message" | "Id_Conversation" | "Sender_Id" | "Contenu" | "Date_Creation" | "Date_Modification" | "Date_Suppression", ExtArgs["result"]["t_message"]>
  export type t_messageInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    conversation?: boolean | t_conversationDefaultArgs<ExtArgs>
    attachments?: boolean | t_message$attachmentsArgs<ExtArgs>
    _count?: boolean | T_messageCountOutputTypeDefaultArgs<ExtArgs>
  }

  export type $t_messagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "t_message"
    objects: {
      conversation: Prisma.$t_conversationPayload<ExtArgs>
      attachments: Prisma.$t_message_attachmentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      Id_Message: number
      Id_Conversation: number
      Sender_Id: number
      Contenu: string
      Date_Creation: Date
      Date_Modification: Date | null
      Date_Suppression: Date | null
    }, ExtArgs["result"]["t_message"]>
    composites: {}
  }

  type t_messageGetPayload<S extends boolean | null | undefined | t_messageDefaultArgs> = $Result.GetResult<Prisma.$t_messagePayload, S>

  type t_messageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<t_messageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: T_messageCountAggregateInputType | true
    }

  export interface t_messageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['t_message'], meta: { name: 't_message' } }
    /**
     * Find zero or one T_message that matches the filter.
     * @param {t_messageFindUniqueArgs} args - Arguments to find a T_message
     * @example
     * // Get one T_message
     * const t_message = await prisma.t_message.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends t_messageFindUniqueArgs>(args: SelectSubset<T, t_messageFindUniqueArgs<ExtArgs>>): Prisma__t_messageClient<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one T_message that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {t_messageFindUniqueOrThrowArgs} args - Arguments to find a T_message
     * @example
     * // Get one T_message
     * const t_message = await prisma.t_message.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends t_messageFindUniqueOrThrowArgs>(args: SelectSubset<T, t_messageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__t_messageClient<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first T_message that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_messageFindFirstArgs} args - Arguments to find a T_message
     * @example
     * // Get one T_message
     * const t_message = await prisma.t_message.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends t_messageFindFirstArgs>(args?: SelectSubset<T, t_messageFindFirstArgs<ExtArgs>>): Prisma__t_messageClient<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first T_message that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_messageFindFirstOrThrowArgs} args - Arguments to find a T_message
     * @example
     * // Get one T_message
     * const t_message = await prisma.t_message.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends t_messageFindFirstOrThrowArgs>(args?: SelectSubset<T, t_messageFindFirstOrThrowArgs<ExtArgs>>): Prisma__t_messageClient<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more T_messages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_messageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all T_messages
     * const t_messages = await prisma.t_message.findMany()
     * 
     * // Get first 10 T_messages
     * const t_messages = await prisma.t_message.findMany({ take: 10 })
     * 
     * // Only select the `Id_Message`
     * const t_messageWithId_MessageOnly = await prisma.t_message.findMany({ select: { Id_Message: true } })
     * 
     */
    findMany<T extends t_messageFindManyArgs>(args?: SelectSubset<T, t_messageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a T_message.
     * @param {t_messageCreateArgs} args - Arguments to create a T_message.
     * @example
     * // Create one T_message
     * const T_message = await prisma.t_message.create({
     *   data: {
     *     // ... data to create a T_message
     *   }
     * })
     * 
     */
    create<T extends t_messageCreateArgs>(args: SelectSubset<T, t_messageCreateArgs<ExtArgs>>): Prisma__t_messageClient<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many T_messages.
     * @param {t_messageCreateManyArgs} args - Arguments to create many T_messages.
     * @example
     * // Create many T_messages
     * const t_message = await prisma.t_message.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends t_messageCreateManyArgs>(args?: SelectSubset<T, t_messageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a T_message.
     * @param {t_messageDeleteArgs} args - Arguments to delete one T_message.
     * @example
     * // Delete one T_message
     * const T_message = await prisma.t_message.delete({
     *   where: {
     *     // ... filter to delete one T_message
     *   }
     * })
     * 
     */
    delete<T extends t_messageDeleteArgs>(args: SelectSubset<T, t_messageDeleteArgs<ExtArgs>>): Prisma__t_messageClient<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one T_message.
     * @param {t_messageUpdateArgs} args - Arguments to update one T_message.
     * @example
     * // Update one T_message
     * const t_message = await prisma.t_message.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends t_messageUpdateArgs>(args: SelectSubset<T, t_messageUpdateArgs<ExtArgs>>): Prisma__t_messageClient<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more T_messages.
     * @param {t_messageDeleteManyArgs} args - Arguments to filter T_messages to delete.
     * @example
     * // Delete a few T_messages
     * const { count } = await prisma.t_message.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends t_messageDeleteManyArgs>(args?: SelectSubset<T, t_messageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more T_messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_messageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many T_messages
     * const t_message = await prisma.t_message.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends t_messageUpdateManyArgs>(args: SelectSubset<T, t_messageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one T_message.
     * @param {t_messageUpsertArgs} args - Arguments to update or create a T_message.
     * @example
     * // Update or create a T_message
     * const t_message = await prisma.t_message.upsert({
     *   create: {
     *     // ... data to create a T_message
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the T_message we want to update
     *   }
     * })
     */
    upsert<T extends t_messageUpsertArgs>(args: SelectSubset<T, t_messageUpsertArgs<ExtArgs>>): Prisma__t_messageClient<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of T_messages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_messageCountArgs} args - Arguments to filter T_messages to count.
     * @example
     * // Count the number of T_messages
     * const count = await prisma.t_message.count({
     *   where: {
     *     // ... the filter for the T_messages we want to count
     *   }
     * })
    **/
    count<T extends t_messageCountArgs>(
      args?: Subset<T, t_messageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], T_messageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a T_message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {T_messageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends T_messageAggregateArgs>(args: Subset<T, T_messageAggregateArgs>): Prisma.PrismaPromise<GetT_messageAggregateType<T>>

    /**
     * Group by T_message.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_messageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends t_messageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: t_messageGroupByArgs['orderBy'] }
        : { orderBy?: t_messageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, t_messageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetT_messageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the t_message model
   */
  readonly fields: t_messageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for t_message.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__t_messageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    conversation<T extends t_conversationDefaultArgs<ExtArgs> = {}>(args?: Subset<T, t_conversationDefaultArgs<ExtArgs>>): Prisma__t_conversationClient<$Result.GetResult<Prisma.$t_conversationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    attachments<T extends t_message$attachmentsArgs<ExtArgs> = {}>(args?: Subset<T, t_message$attachmentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the t_message model
   */
  interface t_messageFieldRefs {
    readonly Id_Message: FieldRef<"t_message", 'Int'>
    readonly Id_Conversation: FieldRef<"t_message", 'Int'>
    readonly Sender_Id: FieldRef<"t_message", 'Int'>
    readonly Contenu: FieldRef<"t_message", 'String'>
    readonly Date_Creation: FieldRef<"t_message", 'DateTime'>
    readonly Date_Modification: FieldRef<"t_message", 'DateTime'>
    readonly Date_Suppression: FieldRef<"t_message", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * t_message findUnique
   */
  export type t_messageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    /**
     * Filter, which t_message to fetch.
     */
    where: t_messageWhereUniqueInput
  }

  /**
   * t_message findUniqueOrThrow
   */
  export type t_messageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    /**
     * Filter, which t_message to fetch.
     */
    where: t_messageWhereUniqueInput
  }

  /**
   * t_message findFirst
   */
  export type t_messageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    /**
     * Filter, which t_message to fetch.
     */
    where?: t_messageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_messages to fetch.
     */
    orderBy?: t_messageOrderByWithRelationInput | t_messageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for t_messages.
     */
    cursor?: t_messageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of t_messages.
     */
    distinct?: T_messageScalarFieldEnum | T_messageScalarFieldEnum[]
  }

  /**
   * t_message findFirstOrThrow
   */
  export type t_messageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    /**
     * Filter, which t_message to fetch.
     */
    where?: t_messageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_messages to fetch.
     */
    orderBy?: t_messageOrderByWithRelationInput | t_messageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for t_messages.
     */
    cursor?: t_messageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_messages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of t_messages.
     */
    distinct?: T_messageScalarFieldEnum | T_messageScalarFieldEnum[]
  }

  /**
   * t_message findMany
   */
  export type t_messageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    /**
     * Filter, which t_messages to fetch.
     */
    where?: t_messageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_messages to fetch.
     */
    orderBy?: t_messageOrderByWithRelationInput | t_messageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing t_messages.
     */
    cursor?: t_messageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_messages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_messages.
     */
    skip?: number
    distinct?: T_messageScalarFieldEnum | T_messageScalarFieldEnum[]
  }

  /**
   * t_message create
   */
  export type t_messageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    /**
     * The data needed to create a t_message.
     */
    data: XOR<t_messageCreateInput, t_messageUncheckedCreateInput>
  }

  /**
   * t_message createMany
   */
  export type t_messageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many t_messages.
     */
    data: t_messageCreateManyInput | t_messageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * t_message update
   */
  export type t_messageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    /**
     * The data needed to update a t_message.
     */
    data: XOR<t_messageUpdateInput, t_messageUncheckedUpdateInput>
    /**
     * Choose, which t_message to update.
     */
    where: t_messageWhereUniqueInput
  }

  /**
   * t_message updateMany
   */
  export type t_messageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update t_messages.
     */
    data: XOR<t_messageUpdateManyMutationInput, t_messageUncheckedUpdateManyInput>
    /**
     * Filter which t_messages to update
     */
    where?: t_messageWhereInput
    /**
     * Limit how many t_messages to update.
     */
    limit?: number
  }

  /**
   * t_message upsert
   */
  export type t_messageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    /**
     * The filter to search for the t_message to update in case it exists.
     */
    where: t_messageWhereUniqueInput
    /**
     * In case the t_message found by the `where` argument doesn't exist, create a new t_message with this data.
     */
    create: XOR<t_messageCreateInput, t_messageUncheckedCreateInput>
    /**
     * In case the t_message was found with the provided `where` argument, update it with this data.
     */
    update: XOR<t_messageUpdateInput, t_messageUncheckedUpdateInput>
  }

  /**
   * t_message delete
   */
  export type t_messageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
    /**
     * Filter which t_message to delete.
     */
    where: t_messageWhereUniqueInput
  }

  /**
   * t_message deleteMany
   */
  export type t_messageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which t_messages to delete
     */
    where?: t_messageWhereInput
    /**
     * Limit how many t_messages to delete.
     */
    limit?: number
  }

  /**
   * t_message.attachments
   */
  export type t_message$attachmentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    where?: t_message_attachmentWhereInput
    orderBy?: t_message_attachmentOrderByWithRelationInput | t_message_attachmentOrderByWithRelationInput[]
    cursor?: t_message_attachmentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: T_message_attachmentScalarFieldEnum | T_message_attachmentScalarFieldEnum[]
  }

  /**
   * t_message without action
   */
  export type t_messageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message
     */
    select?: t_messageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message
     */
    omit?: t_messageOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_messageInclude<ExtArgs> | null
  }


  /**
   * Model t_message_attachment
   */

  export type AggregateT_message_attachment = {
    _count: T_message_attachmentCountAggregateOutputType | null
    _avg: T_message_attachmentAvgAggregateOutputType | null
    _sum: T_message_attachmentSumAggregateOutputType | null
    _min: T_message_attachmentMinAggregateOutputType | null
    _max: T_message_attachmentMaxAggregateOutputType | null
  }

  export type T_message_attachmentAvgAggregateOutputType = {
    Id_Attachment: number | null
    Id_Message: number | null
    File_Size: number | null
  }

  export type T_message_attachmentSumAggregateOutputType = {
    Id_Attachment: number | null
    Id_Message: number | null
    File_Size: number | null
  }

  export type T_message_attachmentMinAggregateOutputType = {
    Id_Attachment: number | null
    Id_Message: number | null
    File_Name: string | null
    File_Path: string | null
    File_Size: number | null
    Mime_Type: string | null
    Date_Upload: Date | null
  }

  export type T_message_attachmentMaxAggregateOutputType = {
    Id_Attachment: number | null
    Id_Message: number | null
    File_Name: string | null
    File_Path: string | null
    File_Size: number | null
    Mime_Type: string | null
    Date_Upload: Date | null
  }

  export type T_message_attachmentCountAggregateOutputType = {
    Id_Attachment: number
    Id_Message: number
    File_Name: number
    File_Path: number
    File_Size: number
    Mime_Type: number
    Date_Upload: number
    _all: number
  }


  export type T_message_attachmentAvgAggregateInputType = {
    Id_Attachment?: true
    Id_Message?: true
    File_Size?: true
  }

  export type T_message_attachmentSumAggregateInputType = {
    Id_Attachment?: true
    Id_Message?: true
    File_Size?: true
  }

  export type T_message_attachmentMinAggregateInputType = {
    Id_Attachment?: true
    Id_Message?: true
    File_Name?: true
    File_Path?: true
    File_Size?: true
    Mime_Type?: true
    Date_Upload?: true
  }

  export type T_message_attachmentMaxAggregateInputType = {
    Id_Attachment?: true
    Id_Message?: true
    File_Name?: true
    File_Path?: true
    File_Size?: true
    Mime_Type?: true
    Date_Upload?: true
  }

  export type T_message_attachmentCountAggregateInputType = {
    Id_Attachment?: true
    Id_Message?: true
    File_Name?: true
    File_Path?: true
    File_Size?: true
    Mime_Type?: true
    Date_Upload?: true
    _all?: true
  }

  export type T_message_attachmentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which t_message_attachment to aggregate.
     */
    where?: t_message_attachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_message_attachments to fetch.
     */
    orderBy?: t_message_attachmentOrderByWithRelationInput | t_message_attachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: t_message_attachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_message_attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_message_attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned t_message_attachments
    **/
    _count?: true | T_message_attachmentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: T_message_attachmentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: T_message_attachmentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: T_message_attachmentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: T_message_attachmentMaxAggregateInputType
  }

  export type GetT_message_attachmentAggregateType<T extends T_message_attachmentAggregateArgs> = {
        [P in keyof T & keyof AggregateT_message_attachment]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateT_message_attachment[P]>
      : GetScalarType<T[P], AggregateT_message_attachment[P]>
  }




  export type t_message_attachmentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: t_message_attachmentWhereInput
    orderBy?: t_message_attachmentOrderByWithAggregationInput | t_message_attachmentOrderByWithAggregationInput[]
    by: T_message_attachmentScalarFieldEnum[] | T_message_attachmentScalarFieldEnum
    having?: t_message_attachmentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: T_message_attachmentCountAggregateInputType | true
    _avg?: T_message_attachmentAvgAggregateInputType
    _sum?: T_message_attachmentSumAggregateInputType
    _min?: T_message_attachmentMinAggregateInputType
    _max?: T_message_attachmentMaxAggregateInputType
  }

  export type T_message_attachmentGroupByOutputType = {
    Id_Attachment: number
    Id_Message: number
    File_Name: string
    File_Path: string
    File_Size: number
    Mime_Type: string
    Date_Upload: Date
    _count: T_message_attachmentCountAggregateOutputType | null
    _avg: T_message_attachmentAvgAggregateOutputType | null
    _sum: T_message_attachmentSumAggregateOutputType | null
    _min: T_message_attachmentMinAggregateOutputType | null
    _max: T_message_attachmentMaxAggregateOutputType | null
  }

  type GetT_message_attachmentGroupByPayload<T extends t_message_attachmentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<T_message_attachmentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof T_message_attachmentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], T_message_attachmentGroupByOutputType[P]>
            : GetScalarType<T[P], T_message_attachmentGroupByOutputType[P]>
        }
      >
    >


  export type t_message_attachmentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Attachment?: boolean
    Id_Message?: boolean
    File_Name?: boolean
    File_Path?: boolean
    File_Size?: boolean
    Mime_Type?: boolean
    Date_Upload?: boolean
    message?: boolean | t_messageDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["t_message_attachment"]>



  export type t_message_attachmentSelectScalar = {
    Id_Attachment?: boolean
    Id_Message?: boolean
    File_Name?: boolean
    File_Path?: boolean
    File_Size?: boolean
    Mime_Type?: boolean
    Date_Upload?: boolean
  }

  export type t_message_attachmentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Attachment" | "Id_Message" | "File_Name" | "File_Path" | "File_Size" | "Mime_Type" | "Date_Upload", ExtArgs["result"]["t_message_attachment"]>
  export type t_message_attachmentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    message?: boolean | t_messageDefaultArgs<ExtArgs>
  }

  export type $t_message_attachmentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "t_message_attachment"
    objects: {
      message: Prisma.$t_messagePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      Id_Attachment: number
      Id_Message: number
      File_Name: string
      File_Path: string
      File_Size: number
      Mime_Type: string
      Date_Upload: Date
    }, ExtArgs["result"]["t_message_attachment"]>
    composites: {}
  }

  type t_message_attachmentGetPayload<S extends boolean | null | undefined | t_message_attachmentDefaultArgs> = $Result.GetResult<Prisma.$t_message_attachmentPayload, S>

  type t_message_attachmentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<t_message_attachmentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: T_message_attachmentCountAggregateInputType | true
    }

  export interface t_message_attachmentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['t_message_attachment'], meta: { name: 't_message_attachment' } }
    /**
     * Find zero or one T_message_attachment that matches the filter.
     * @param {t_message_attachmentFindUniqueArgs} args - Arguments to find a T_message_attachment
     * @example
     * // Get one T_message_attachment
     * const t_message_attachment = await prisma.t_message_attachment.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends t_message_attachmentFindUniqueArgs>(args: SelectSubset<T, t_message_attachmentFindUniqueArgs<ExtArgs>>): Prisma__t_message_attachmentClient<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one T_message_attachment that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {t_message_attachmentFindUniqueOrThrowArgs} args - Arguments to find a T_message_attachment
     * @example
     * // Get one T_message_attachment
     * const t_message_attachment = await prisma.t_message_attachment.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends t_message_attachmentFindUniqueOrThrowArgs>(args: SelectSubset<T, t_message_attachmentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__t_message_attachmentClient<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first T_message_attachment that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_message_attachmentFindFirstArgs} args - Arguments to find a T_message_attachment
     * @example
     * // Get one T_message_attachment
     * const t_message_attachment = await prisma.t_message_attachment.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends t_message_attachmentFindFirstArgs>(args?: SelectSubset<T, t_message_attachmentFindFirstArgs<ExtArgs>>): Prisma__t_message_attachmentClient<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first T_message_attachment that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_message_attachmentFindFirstOrThrowArgs} args - Arguments to find a T_message_attachment
     * @example
     * // Get one T_message_attachment
     * const t_message_attachment = await prisma.t_message_attachment.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends t_message_attachmentFindFirstOrThrowArgs>(args?: SelectSubset<T, t_message_attachmentFindFirstOrThrowArgs<ExtArgs>>): Prisma__t_message_attachmentClient<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more T_message_attachments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_message_attachmentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all T_message_attachments
     * const t_message_attachments = await prisma.t_message_attachment.findMany()
     * 
     * // Get first 10 T_message_attachments
     * const t_message_attachments = await prisma.t_message_attachment.findMany({ take: 10 })
     * 
     * // Only select the `Id_Attachment`
     * const t_message_attachmentWithId_AttachmentOnly = await prisma.t_message_attachment.findMany({ select: { Id_Attachment: true } })
     * 
     */
    findMany<T extends t_message_attachmentFindManyArgs>(args?: SelectSubset<T, t_message_attachmentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a T_message_attachment.
     * @param {t_message_attachmentCreateArgs} args - Arguments to create a T_message_attachment.
     * @example
     * // Create one T_message_attachment
     * const T_message_attachment = await prisma.t_message_attachment.create({
     *   data: {
     *     // ... data to create a T_message_attachment
     *   }
     * })
     * 
     */
    create<T extends t_message_attachmentCreateArgs>(args: SelectSubset<T, t_message_attachmentCreateArgs<ExtArgs>>): Prisma__t_message_attachmentClient<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many T_message_attachments.
     * @param {t_message_attachmentCreateManyArgs} args - Arguments to create many T_message_attachments.
     * @example
     * // Create many T_message_attachments
     * const t_message_attachment = await prisma.t_message_attachment.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends t_message_attachmentCreateManyArgs>(args?: SelectSubset<T, t_message_attachmentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a T_message_attachment.
     * @param {t_message_attachmentDeleteArgs} args - Arguments to delete one T_message_attachment.
     * @example
     * // Delete one T_message_attachment
     * const T_message_attachment = await prisma.t_message_attachment.delete({
     *   where: {
     *     // ... filter to delete one T_message_attachment
     *   }
     * })
     * 
     */
    delete<T extends t_message_attachmentDeleteArgs>(args: SelectSubset<T, t_message_attachmentDeleteArgs<ExtArgs>>): Prisma__t_message_attachmentClient<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one T_message_attachment.
     * @param {t_message_attachmentUpdateArgs} args - Arguments to update one T_message_attachment.
     * @example
     * // Update one T_message_attachment
     * const t_message_attachment = await prisma.t_message_attachment.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends t_message_attachmentUpdateArgs>(args: SelectSubset<T, t_message_attachmentUpdateArgs<ExtArgs>>): Prisma__t_message_attachmentClient<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more T_message_attachments.
     * @param {t_message_attachmentDeleteManyArgs} args - Arguments to filter T_message_attachments to delete.
     * @example
     * // Delete a few T_message_attachments
     * const { count } = await prisma.t_message_attachment.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends t_message_attachmentDeleteManyArgs>(args?: SelectSubset<T, t_message_attachmentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more T_message_attachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_message_attachmentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many T_message_attachments
     * const t_message_attachment = await prisma.t_message_attachment.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends t_message_attachmentUpdateManyArgs>(args: SelectSubset<T, t_message_attachmentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one T_message_attachment.
     * @param {t_message_attachmentUpsertArgs} args - Arguments to update or create a T_message_attachment.
     * @example
     * // Update or create a T_message_attachment
     * const t_message_attachment = await prisma.t_message_attachment.upsert({
     *   create: {
     *     // ... data to create a T_message_attachment
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the T_message_attachment we want to update
     *   }
     * })
     */
    upsert<T extends t_message_attachmentUpsertArgs>(args: SelectSubset<T, t_message_attachmentUpsertArgs<ExtArgs>>): Prisma__t_message_attachmentClient<$Result.GetResult<Prisma.$t_message_attachmentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of T_message_attachments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_message_attachmentCountArgs} args - Arguments to filter T_message_attachments to count.
     * @example
     * // Count the number of T_message_attachments
     * const count = await prisma.t_message_attachment.count({
     *   where: {
     *     // ... the filter for the T_message_attachments we want to count
     *   }
     * })
    **/
    count<T extends t_message_attachmentCountArgs>(
      args?: Subset<T, t_message_attachmentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], T_message_attachmentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a T_message_attachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {T_message_attachmentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends T_message_attachmentAggregateArgs>(args: Subset<T, T_message_attachmentAggregateArgs>): Prisma.PrismaPromise<GetT_message_attachmentAggregateType<T>>

    /**
     * Group by T_message_attachment.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {t_message_attachmentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends t_message_attachmentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: t_message_attachmentGroupByArgs['orderBy'] }
        : { orderBy?: t_message_attachmentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, t_message_attachmentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetT_message_attachmentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the t_message_attachment model
   */
  readonly fields: t_message_attachmentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for t_message_attachment.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__t_message_attachmentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    message<T extends t_messageDefaultArgs<ExtArgs> = {}>(args?: Subset<T, t_messageDefaultArgs<ExtArgs>>): Prisma__t_messageClient<$Result.GetResult<Prisma.$t_messagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the t_message_attachment model
   */
  interface t_message_attachmentFieldRefs {
    readonly Id_Attachment: FieldRef<"t_message_attachment", 'Int'>
    readonly Id_Message: FieldRef<"t_message_attachment", 'Int'>
    readonly File_Name: FieldRef<"t_message_attachment", 'String'>
    readonly File_Path: FieldRef<"t_message_attachment", 'String'>
    readonly File_Size: FieldRef<"t_message_attachment", 'Int'>
    readonly Mime_Type: FieldRef<"t_message_attachment", 'String'>
    readonly Date_Upload: FieldRef<"t_message_attachment", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * t_message_attachment findUnique
   */
  export type t_message_attachmentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    /**
     * Filter, which t_message_attachment to fetch.
     */
    where: t_message_attachmentWhereUniqueInput
  }

  /**
   * t_message_attachment findUniqueOrThrow
   */
  export type t_message_attachmentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    /**
     * Filter, which t_message_attachment to fetch.
     */
    where: t_message_attachmentWhereUniqueInput
  }

  /**
   * t_message_attachment findFirst
   */
  export type t_message_attachmentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    /**
     * Filter, which t_message_attachment to fetch.
     */
    where?: t_message_attachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_message_attachments to fetch.
     */
    orderBy?: t_message_attachmentOrderByWithRelationInput | t_message_attachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for t_message_attachments.
     */
    cursor?: t_message_attachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_message_attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_message_attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of t_message_attachments.
     */
    distinct?: T_message_attachmentScalarFieldEnum | T_message_attachmentScalarFieldEnum[]
  }

  /**
   * t_message_attachment findFirstOrThrow
   */
  export type t_message_attachmentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    /**
     * Filter, which t_message_attachment to fetch.
     */
    where?: t_message_attachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_message_attachments to fetch.
     */
    orderBy?: t_message_attachmentOrderByWithRelationInput | t_message_attachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for t_message_attachments.
     */
    cursor?: t_message_attachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_message_attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_message_attachments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of t_message_attachments.
     */
    distinct?: T_message_attachmentScalarFieldEnum | T_message_attachmentScalarFieldEnum[]
  }

  /**
   * t_message_attachment findMany
   */
  export type t_message_attachmentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    /**
     * Filter, which t_message_attachments to fetch.
     */
    where?: t_message_attachmentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of t_message_attachments to fetch.
     */
    orderBy?: t_message_attachmentOrderByWithRelationInput | t_message_attachmentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing t_message_attachments.
     */
    cursor?: t_message_attachmentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` t_message_attachments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` t_message_attachments.
     */
    skip?: number
    distinct?: T_message_attachmentScalarFieldEnum | T_message_attachmentScalarFieldEnum[]
  }

  /**
   * t_message_attachment create
   */
  export type t_message_attachmentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    /**
     * The data needed to create a t_message_attachment.
     */
    data: XOR<t_message_attachmentCreateInput, t_message_attachmentUncheckedCreateInput>
  }

  /**
   * t_message_attachment createMany
   */
  export type t_message_attachmentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many t_message_attachments.
     */
    data: t_message_attachmentCreateManyInput | t_message_attachmentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * t_message_attachment update
   */
  export type t_message_attachmentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    /**
     * The data needed to update a t_message_attachment.
     */
    data: XOR<t_message_attachmentUpdateInput, t_message_attachmentUncheckedUpdateInput>
    /**
     * Choose, which t_message_attachment to update.
     */
    where: t_message_attachmentWhereUniqueInput
  }

  /**
   * t_message_attachment updateMany
   */
  export type t_message_attachmentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update t_message_attachments.
     */
    data: XOR<t_message_attachmentUpdateManyMutationInput, t_message_attachmentUncheckedUpdateManyInput>
    /**
     * Filter which t_message_attachments to update
     */
    where?: t_message_attachmentWhereInput
    /**
     * Limit how many t_message_attachments to update.
     */
    limit?: number
  }

  /**
   * t_message_attachment upsert
   */
  export type t_message_attachmentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    /**
     * The filter to search for the t_message_attachment to update in case it exists.
     */
    where: t_message_attachmentWhereUniqueInput
    /**
     * In case the t_message_attachment found by the `where` argument doesn't exist, create a new t_message_attachment with this data.
     */
    create: XOR<t_message_attachmentCreateInput, t_message_attachmentUncheckedCreateInput>
    /**
     * In case the t_message_attachment was found with the provided `where` argument, update it with this data.
     */
    update: XOR<t_message_attachmentUpdateInput, t_message_attachmentUncheckedUpdateInput>
  }

  /**
   * t_message_attachment delete
   */
  export type t_message_attachmentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
    /**
     * Filter which t_message_attachment to delete.
     */
    where: t_message_attachmentWhereUniqueInput
  }

  /**
   * t_message_attachment deleteMany
   */
  export type t_message_attachmentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which t_message_attachments to delete
     */
    where?: t_message_attachmentWhereInput
    /**
     * Limit how many t_message_attachments to delete.
     */
    limit?: number
  }

  /**
   * t_message_attachment without action
   */
  export type t_message_attachmentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the t_message_attachment
     */
    select?: t_message_attachmentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the t_message_attachment
     */
    omit?: t_message_attachmentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: t_message_attachmentInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const T_conversationScalarFieldEnum: {
    Id_Conversation: 'Id_Conversation',
    Type: 'Type',
    Titre: 'Titre',
    DM_Key: 'DM_Key',
    Date_Creation: 'Date_Creation'
  };

  export type T_conversationScalarFieldEnum = (typeof T_conversationScalarFieldEnum)[keyof typeof T_conversationScalarFieldEnum]


  export const T_conversation_participantScalarFieldEnum: {
    Id_Participant: 'Id_Participant',
    Id_Conversation: 'Id_Conversation',
    Id_Utilisateur: 'Id_Utilisateur',
    Last_Read_Msg_Id: 'Last_Read_Msg_Id',
    Date_Ajout: 'Date_Ajout'
  };

  export type T_conversation_participantScalarFieldEnum = (typeof T_conversation_participantScalarFieldEnum)[keyof typeof T_conversation_participantScalarFieldEnum]


  export const T_messageScalarFieldEnum: {
    Id_Message: 'Id_Message',
    Id_Conversation: 'Id_Conversation',
    Sender_Id: 'Sender_Id',
    Contenu: 'Contenu',
    Date_Creation: 'Date_Creation',
    Date_Modification: 'Date_Modification',
    Date_Suppression: 'Date_Suppression'
  };

  export type T_messageScalarFieldEnum = (typeof T_messageScalarFieldEnum)[keyof typeof T_messageScalarFieldEnum]


  export const T_message_attachmentScalarFieldEnum: {
    Id_Attachment: 'Id_Attachment',
    Id_Message: 'Id_Message',
    File_Name: 'File_Name',
    File_Path: 'File_Path',
    File_Size: 'File_Size',
    Mime_Type: 'Mime_Type',
    Date_Upload: 'Date_Upload'
  };

  export type T_message_attachmentScalarFieldEnum = (typeof T_message_attachmentScalarFieldEnum)[keyof typeof T_message_attachmentScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const t_conversationOrderByRelevanceFieldEnum: {
    Type: 'Type',
    Titre: 'Titre',
    DM_Key: 'DM_Key'
  };

  export type t_conversationOrderByRelevanceFieldEnum = (typeof t_conversationOrderByRelevanceFieldEnum)[keyof typeof t_conversationOrderByRelevanceFieldEnum]


  export const t_messageOrderByRelevanceFieldEnum: {
    Contenu: 'Contenu'
  };

  export type t_messageOrderByRelevanceFieldEnum = (typeof t_messageOrderByRelevanceFieldEnum)[keyof typeof t_messageOrderByRelevanceFieldEnum]


  export const t_message_attachmentOrderByRelevanceFieldEnum: {
    File_Name: 'File_Name',
    File_Path: 'File_Path',
    Mime_Type: 'Mime_Type'
  };

  export type t_message_attachmentOrderByRelevanceFieldEnum = (typeof t_message_attachmentOrderByRelevanceFieldEnum)[keyof typeof t_message_attachmentOrderByRelevanceFieldEnum]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    
  /**
   * Deep Input Types
   */


  export type t_conversationWhereInput = {
    AND?: t_conversationWhereInput | t_conversationWhereInput[]
    OR?: t_conversationWhereInput[]
    NOT?: t_conversationWhereInput | t_conversationWhereInput[]
    Id_Conversation?: IntFilter<"t_conversation"> | number
    Type?: StringFilter<"t_conversation"> | string
    Titre?: StringNullableFilter<"t_conversation"> | string | null
    DM_Key?: StringNullableFilter<"t_conversation"> | string | null
    Date_Creation?: DateTimeFilter<"t_conversation"> | Date | string
    participants?: T_conversation_participantListRelationFilter
    messages?: T_messageListRelationFilter
  }

  export type t_conversationOrderByWithRelationInput = {
    Id_Conversation?: SortOrder
    Type?: SortOrder
    Titre?: SortOrderInput | SortOrder
    DM_Key?: SortOrderInput | SortOrder
    Date_Creation?: SortOrder
    participants?: t_conversation_participantOrderByRelationAggregateInput
    messages?: t_messageOrderByRelationAggregateInput
    _relevance?: t_conversationOrderByRelevanceInput
  }

  export type t_conversationWhereUniqueInput = Prisma.AtLeast<{
    Id_Conversation?: number
    DM_Key?: string
    AND?: t_conversationWhereInput | t_conversationWhereInput[]
    OR?: t_conversationWhereInput[]
    NOT?: t_conversationWhereInput | t_conversationWhereInput[]
    Type?: StringFilter<"t_conversation"> | string
    Titre?: StringNullableFilter<"t_conversation"> | string | null
    Date_Creation?: DateTimeFilter<"t_conversation"> | Date | string
    participants?: T_conversation_participantListRelationFilter
    messages?: T_messageListRelationFilter
  }, "Id_Conversation" | "DM_Key">

  export type t_conversationOrderByWithAggregationInput = {
    Id_Conversation?: SortOrder
    Type?: SortOrder
    Titre?: SortOrderInput | SortOrder
    DM_Key?: SortOrderInput | SortOrder
    Date_Creation?: SortOrder
    _count?: t_conversationCountOrderByAggregateInput
    _avg?: t_conversationAvgOrderByAggregateInput
    _max?: t_conversationMaxOrderByAggregateInput
    _min?: t_conversationMinOrderByAggregateInput
    _sum?: t_conversationSumOrderByAggregateInput
  }

  export type t_conversationScalarWhereWithAggregatesInput = {
    AND?: t_conversationScalarWhereWithAggregatesInput | t_conversationScalarWhereWithAggregatesInput[]
    OR?: t_conversationScalarWhereWithAggregatesInput[]
    NOT?: t_conversationScalarWhereWithAggregatesInput | t_conversationScalarWhereWithAggregatesInput[]
    Id_Conversation?: IntWithAggregatesFilter<"t_conversation"> | number
    Type?: StringWithAggregatesFilter<"t_conversation"> | string
    Titre?: StringNullableWithAggregatesFilter<"t_conversation"> | string | null
    DM_Key?: StringNullableWithAggregatesFilter<"t_conversation"> | string | null
    Date_Creation?: DateTimeWithAggregatesFilter<"t_conversation"> | Date | string
  }

  export type t_conversation_participantWhereInput = {
    AND?: t_conversation_participantWhereInput | t_conversation_participantWhereInput[]
    OR?: t_conversation_participantWhereInput[]
    NOT?: t_conversation_participantWhereInput | t_conversation_participantWhereInput[]
    Id_Participant?: IntFilter<"t_conversation_participant"> | number
    Id_Conversation?: IntFilter<"t_conversation_participant"> | number
    Id_Utilisateur?: IntFilter<"t_conversation_participant"> | number
    Last_Read_Msg_Id?: IntNullableFilter<"t_conversation_participant"> | number | null
    Date_Ajout?: DateTimeFilter<"t_conversation_participant"> | Date | string
    conversation?: XOR<T_conversationScalarRelationFilter, t_conversationWhereInput>
  }

  export type t_conversation_participantOrderByWithRelationInput = {
    Id_Participant?: SortOrder
    Id_Conversation?: SortOrder
    Id_Utilisateur?: SortOrder
    Last_Read_Msg_Id?: SortOrderInput | SortOrder
    Date_Ajout?: SortOrder
    conversation?: t_conversationOrderByWithRelationInput
  }

  export type t_conversation_participantWhereUniqueInput = Prisma.AtLeast<{
    Id_Participant?: number
    Id_Conversation_Id_Utilisateur?: t_conversation_participantId_ConversationId_UtilisateurCompoundUniqueInput
    AND?: t_conversation_participantWhereInput | t_conversation_participantWhereInput[]
    OR?: t_conversation_participantWhereInput[]
    NOT?: t_conversation_participantWhereInput | t_conversation_participantWhereInput[]
    Id_Conversation?: IntFilter<"t_conversation_participant"> | number
    Id_Utilisateur?: IntFilter<"t_conversation_participant"> | number
    Last_Read_Msg_Id?: IntNullableFilter<"t_conversation_participant"> | number | null
    Date_Ajout?: DateTimeFilter<"t_conversation_participant"> | Date | string
    conversation?: XOR<T_conversationScalarRelationFilter, t_conversationWhereInput>
  }, "Id_Participant" | "Id_Conversation_Id_Utilisateur">

  export type t_conversation_participantOrderByWithAggregationInput = {
    Id_Participant?: SortOrder
    Id_Conversation?: SortOrder
    Id_Utilisateur?: SortOrder
    Last_Read_Msg_Id?: SortOrderInput | SortOrder
    Date_Ajout?: SortOrder
    _count?: t_conversation_participantCountOrderByAggregateInput
    _avg?: t_conversation_participantAvgOrderByAggregateInput
    _max?: t_conversation_participantMaxOrderByAggregateInput
    _min?: t_conversation_participantMinOrderByAggregateInput
    _sum?: t_conversation_participantSumOrderByAggregateInput
  }

  export type t_conversation_participantScalarWhereWithAggregatesInput = {
    AND?: t_conversation_participantScalarWhereWithAggregatesInput | t_conversation_participantScalarWhereWithAggregatesInput[]
    OR?: t_conversation_participantScalarWhereWithAggregatesInput[]
    NOT?: t_conversation_participantScalarWhereWithAggregatesInput | t_conversation_participantScalarWhereWithAggregatesInput[]
    Id_Participant?: IntWithAggregatesFilter<"t_conversation_participant"> | number
    Id_Conversation?: IntWithAggregatesFilter<"t_conversation_participant"> | number
    Id_Utilisateur?: IntWithAggregatesFilter<"t_conversation_participant"> | number
    Last_Read_Msg_Id?: IntNullableWithAggregatesFilter<"t_conversation_participant"> | number | null
    Date_Ajout?: DateTimeWithAggregatesFilter<"t_conversation_participant"> | Date | string
  }

  export type t_messageWhereInput = {
    AND?: t_messageWhereInput | t_messageWhereInput[]
    OR?: t_messageWhereInput[]
    NOT?: t_messageWhereInput | t_messageWhereInput[]
    Id_Message?: IntFilter<"t_message"> | number
    Id_Conversation?: IntFilter<"t_message"> | number
    Sender_Id?: IntFilter<"t_message"> | number
    Contenu?: StringFilter<"t_message"> | string
    Date_Creation?: DateTimeFilter<"t_message"> | Date | string
    Date_Modification?: DateTimeNullableFilter<"t_message"> | Date | string | null
    Date_Suppression?: DateTimeNullableFilter<"t_message"> | Date | string | null
    conversation?: XOR<T_conversationScalarRelationFilter, t_conversationWhereInput>
    attachments?: T_message_attachmentListRelationFilter
  }

  export type t_messageOrderByWithRelationInput = {
    Id_Message?: SortOrder
    Id_Conversation?: SortOrder
    Sender_Id?: SortOrder
    Contenu?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrderInput | SortOrder
    Date_Suppression?: SortOrderInput | SortOrder
    conversation?: t_conversationOrderByWithRelationInput
    attachments?: t_message_attachmentOrderByRelationAggregateInput
    _relevance?: t_messageOrderByRelevanceInput
  }

  export type t_messageWhereUniqueInput = Prisma.AtLeast<{
    Id_Message?: number
    AND?: t_messageWhereInput | t_messageWhereInput[]
    OR?: t_messageWhereInput[]
    NOT?: t_messageWhereInput | t_messageWhereInput[]
    Id_Conversation?: IntFilter<"t_message"> | number
    Sender_Id?: IntFilter<"t_message"> | number
    Contenu?: StringFilter<"t_message"> | string
    Date_Creation?: DateTimeFilter<"t_message"> | Date | string
    Date_Modification?: DateTimeNullableFilter<"t_message"> | Date | string | null
    Date_Suppression?: DateTimeNullableFilter<"t_message"> | Date | string | null
    conversation?: XOR<T_conversationScalarRelationFilter, t_conversationWhereInput>
    attachments?: T_message_attachmentListRelationFilter
  }, "Id_Message">

  export type t_messageOrderByWithAggregationInput = {
    Id_Message?: SortOrder
    Id_Conversation?: SortOrder
    Sender_Id?: SortOrder
    Contenu?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrderInput | SortOrder
    Date_Suppression?: SortOrderInput | SortOrder
    _count?: t_messageCountOrderByAggregateInput
    _avg?: t_messageAvgOrderByAggregateInput
    _max?: t_messageMaxOrderByAggregateInput
    _min?: t_messageMinOrderByAggregateInput
    _sum?: t_messageSumOrderByAggregateInput
  }

  export type t_messageScalarWhereWithAggregatesInput = {
    AND?: t_messageScalarWhereWithAggregatesInput | t_messageScalarWhereWithAggregatesInput[]
    OR?: t_messageScalarWhereWithAggregatesInput[]
    NOT?: t_messageScalarWhereWithAggregatesInput | t_messageScalarWhereWithAggregatesInput[]
    Id_Message?: IntWithAggregatesFilter<"t_message"> | number
    Id_Conversation?: IntWithAggregatesFilter<"t_message"> | number
    Sender_Id?: IntWithAggregatesFilter<"t_message"> | number
    Contenu?: StringWithAggregatesFilter<"t_message"> | string
    Date_Creation?: DateTimeWithAggregatesFilter<"t_message"> | Date | string
    Date_Modification?: DateTimeNullableWithAggregatesFilter<"t_message"> | Date | string | null
    Date_Suppression?: DateTimeNullableWithAggregatesFilter<"t_message"> | Date | string | null
  }

  export type t_message_attachmentWhereInput = {
    AND?: t_message_attachmentWhereInput | t_message_attachmentWhereInput[]
    OR?: t_message_attachmentWhereInput[]
    NOT?: t_message_attachmentWhereInput | t_message_attachmentWhereInput[]
    Id_Attachment?: IntFilter<"t_message_attachment"> | number
    Id_Message?: IntFilter<"t_message_attachment"> | number
    File_Name?: StringFilter<"t_message_attachment"> | string
    File_Path?: StringFilter<"t_message_attachment"> | string
    File_Size?: IntFilter<"t_message_attachment"> | number
    Mime_Type?: StringFilter<"t_message_attachment"> | string
    Date_Upload?: DateTimeFilter<"t_message_attachment"> | Date | string
    message?: XOR<T_messageScalarRelationFilter, t_messageWhereInput>
  }

  export type t_message_attachmentOrderByWithRelationInput = {
    Id_Attachment?: SortOrder
    Id_Message?: SortOrder
    File_Name?: SortOrder
    File_Path?: SortOrder
    File_Size?: SortOrder
    Mime_Type?: SortOrder
    Date_Upload?: SortOrder
    message?: t_messageOrderByWithRelationInput
    _relevance?: t_message_attachmentOrderByRelevanceInput
  }

  export type t_message_attachmentWhereUniqueInput = Prisma.AtLeast<{
    Id_Attachment?: number
    AND?: t_message_attachmentWhereInput | t_message_attachmentWhereInput[]
    OR?: t_message_attachmentWhereInput[]
    NOT?: t_message_attachmentWhereInput | t_message_attachmentWhereInput[]
    Id_Message?: IntFilter<"t_message_attachment"> | number
    File_Name?: StringFilter<"t_message_attachment"> | string
    File_Path?: StringFilter<"t_message_attachment"> | string
    File_Size?: IntFilter<"t_message_attachment"> | number
    Mime_Type?: StringFilter<"t_message_attachment"> | string
    Date_Upload?: DateTimeFilter<"t_message_attachment"> | Date | string
    message?: XOR<T_messageScalarRelationFilter, t_messageWhereInput>
  }, "Id_Attachment">

  export type t_message_attachmentOrderByWithAggregationInput = {
    Id_Attachment?: SortOrder
    Id_Message?: SortOrder
    File_Name?: SortOrder
    File_Path?: SortOrder
    File_Size?: SortOrder
    Mime_Type?: SortOrder
    Date_Upload?: SortOrder
    _count?: t_message_attachmentCountOrderByAggregateInput
    _avg?: t_message_attachmentAvgOrderByAggregateInput
    _max?: t_message_attachmentMaxOrderByAggregateInput
    _min?: t_message_attachmentMinOrderByAggregateInput
    _sum?: t_message_attachmentSumOrderByAggregateInput
  }

  export type t_message_attachmentScalarWhereWithAggregatesInput = {
    AND?: t_message_attachmentScalarWhereWithAggregatesInput | t_message_attachmentScalarWhereWithAggregatesInput[]
    OR?: t_message_attachmentScalarWhereWithAggregatesInput[]
    NOT?: t_message_attachmentScalarWhereWithAggregatesInput | t_message_attachmentScalarWhereWithAggregatesInput[]
    Id_Attachment?: IntWithAggregatesFilter<"t_message_attachment"> | number
    Id_Message?: IntWithAggregatesFilter<"t_message_attachment"> | number
    File_Name?: StringWithAggregatesFilter<"t_message_attachment"> | string
    File_Path?: StringWithAggregatesFilter<"t_message_attachment"> | string
    File_Size?: IntWithAggregatesFilter<"t_message_attachment"> | number
    Mime_Type?: StringWithAggregatesFilter<"t_message_attachment"> | string
    Date_Upload?: DateTimeWithAggregatesFilter<"t_message_attachment"> | Date | string
  }

  export type t_conversationCreateInput = {
    Type: string
    Titre?: string | null
    DM_Key?: string | null
    Date_Creation?: Date | string
    participants?: t_conversation_participantCreateNestedManyWithoutConversationInput
    messages?: t_messageCreateNestedManyWithoutConversationInput
  }

  export type t_conversationUncheckedCreateInput = {
    Id_Conversation?: number
    Type: string
    Titre?: string | null
    DM_Key?: string | null
    Date_Creation?: Date | string
    participants?: t_conversation_participantUncheckedCreateNestedManyWithoutConversationInput
    messages?: t_messageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type t_conversationUpdateInput = {
    Type?: StringFieldUpdateOperationsInput | string
    Titre?: NullableStringFieldUpdateOperationsInput | string | null
    DM_Key?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    participants?: t_conversation_participantUpdateManyWithoutConversationNestedInput
    messages?: t_messageUpdateManyWithoutConversationNestedInput
  }

  export type t_conversationUncheckedUpdateInput = {
    Id_Conversation?: IntFieldUpdateOperationsInput | number
    Type?: StringFieldUpdateOperationsInput | string
    Titre?: NullableStringFieldUpdateOperationsInput | string | null
    DM_Key?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    participants?: t_conversation_participantUncheckedUpdateManyWithoutConversationNestedInput
    messages?: t_messageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type t_conversationCreateManyInput = {
    Id_Conversation?: number
    Type: string
    Titre?: string | null
    DM_Key?: string | null
    Date_Creation?: Date | string
  }

  export type t_conversationUpdateManyMutationInput = {
    Type?: StringFieldUpdateOperationsInput | string
    Titre?: NullableStringFieldUpdateOperationsInput | string | null
    DM_Key?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_conversationUncheckedUpdateManyInput = {
    Id_Conversation?: IntFieldUpdateOperationsInput | number
    Type?: StringFieldUpdateOperationsInput | string
    Titre?: NullableStringFieldUpdateOperationsInput | string | null
    DM_Key?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_conversation_participantCreateInput = {
    Id_Utilisateur: number
    Last_Read_Msg_Id?: number | null
    Date_Ajout?: Date | string
    conversation: t_conversationCreateNestedOneWithoutParticipantsInput
  }

  export type t_conversation_participantUncheckedCreateInput = {
    Id_Participant?: number
    Id_Conversation: number
    Id_Utilisateur: number
    Last_Read_Msg_Id?: number | null
    Date_Ajout?: Date | string
  }

  export type t_conversation_participantUpdateInput = {
    Id_Utilisateur?: IntFieldUpdateOperationsInput | number
    Last_Read_Msg_Id?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Ajout?: DateTimeFieldUpdateOperationsInput | Date | string
    conversation?: t_conversationUpdateOneRequiredWithoutParticipantsNestedInput
  }

  export type t_conversation_participantUncheckedUpdateInput = {
    Id_Participant?: IntFieldUpdateOperationsInput | number
    Id_Conversation?: IntFieldUpdateOperationsInput | number
    Id_Utilisateur?: IntFieldUpdateOperationsInput | number
    Last_Read_Msg_Id?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Ajout?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_conversation_participantCreateManyInput = {
    Id_Participant?: number
    Id_Conversation: number
    Id_Utilisateur: number
    Last_Read_Msg_Id?: number | null
    Date_Ajout?: Date | string
  }

  export type t_conversation_participantUpdateManyMutationInput = {
    Id_Utilisateur?: IntFieldUpdateOperationsInput | number
    Last_Read_Msg_Id?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Ajout?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_conversation_participantUncheckedUpdateManyInput = {
    Id_Participant?: IntFieldUpdateOperationsInput | number
    Id_Conversation?: IntFieldUpdateOperationsInput | number
    Id_Utilisateur?: IntFieldUpdateOperationsInput | number
    Last_Read_Msg_Id?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Ajout?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_messageCreateInput = {
    Sender_Id: number
    Contenu: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
    Date_Suppression?: Date | string | null
    conversation: t_conversationCreateNestedOneWithoutMessagesInput
    attachments?: t_message_attachmentCreateNestedManyWithoutMessageInput
  }

  export type t_messageUncheckedCreateInput = {
    Id_Message?: number
    Id_Conversation: number
    Sender_Id: number
    Contenu: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
    Date_Suppression?: Date | string | null
    attachments?: t_message_attachmentUncheckedCreateNestedManyWithoutMessageInput
  }

  export type t_messageUpdateInput = {
    Sender_Id?: IntFieldUpdateOperationsInput | number
    Contenu?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Date_Suppression?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    conversation?: t_conversationUpdateOneRequiredWithoutMessagesNestedInput
    attachments?: t_message_attachmentUpdateManyWithoutMessageNestedInput
  }

  export type t_messageUncheckedUpdateInput = {
    Id_Message?: IntFieldUpdateOperationsInput | number
    Id_Conversation?: IntFieldUpdateOperationsInput | number
    Sender_Id?: IntFieldUpdateOperationsInput | number
    Contenu?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Date_Suppression?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachments?: t_message_attachmentUncheckedUpdateManyWithoutMessageNestedInput
  }

  export type t_messageCreateManyInput = {
    Id_Message?: number
    Id_Conversation: number
    Sender_Id: number
    Contenu: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
    Date_Suppression?: Date | string | null
  }

  export type t_messageUpdateManyMutationInput = {
    Sender_Id?: IntFieldUpdateOperationsInput | number
    Contenu?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Date_Suppression?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type t_messageUncheckedUpdateManyInput = {
    Id_Message?: IntFieldUpdateOperationsInput | number
    Id_Conversation?: IntFieldUpdateOperationsInput | number
    Sender_Id?: IntFieldUpdateOperationsInput | number
    Contenu?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Date_Suppression?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type t_message_attachmentCreateInput = {
    File_Name: string
    File_Path: string
    File_Size: number
    Mime_Type: string
    Date_Upload?: Date | string
    message: t_messageCreateNestedOneWithoutAttachmentsInput
  }

  export type t_message_attachmentUncheckedCreateInput = {
    Id_Attachment?: number
    Id_Message: number
    File_Name: string
    File_Path: string
    File_Size: number
    Mime_Type: string
    Date_Upload?: Date | string
  }

  export type t_message_attachmentUpdateInput = {
    File_Name?: StringFieldUpdateOperationsInput | string
    File_Path?: StringFieldUpdateOperationsInput | string
    File_Size?: IntFieldUpdateOperationsInput | number
    Mime_Type?: StringFieldUpdateOperationsInput | string
    Date_Upload?: DateTimeFieldUpdateOperationsInput | Date | string
    message?: t_messageUpdateOneRequiredWithoutAttachmentsNestedInput
  }

  export type t_message_attachmentUncheckedUpdateInput = {
    Id_Attachment?: IntFieldUpdateOperationsInput | number
    Id_Message?: IntFieldUpdateOperationsInput | number
    File_Name?: StringFieldUpdateOperationsInput | string
    File_Path?: StringFieldUpdateOperationsInput | string
    File_Size?: IntFieldUpdateOperationsInput | number
    Mime_Type?: StringFieldUpdateOperationsInput | string
    Date_Upload?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_message_attachmentCreateManyInput = {
    Id_Attachment?: number
    Id_Message: number
    File_Name: string
    File_Path: string
    File_Size: number
    Mime_Type: string
    Date_Upload?: Date | string
  }

  export type t_message_attachmentUpdateManyMutationInput = {
    File_Name?: StringFieldUpdateOperationsInput | string
    File_Path?: StringFieldUpdateOperationsInput | string
    File_Size?: IntFieldUpdateOperationsInput | number
    Mime_Type?: StringFieldUpdateOperationsInput | string
    Date_Upload?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_message_attachmentUncheckedUpdateManyInput = {
    Id_Attachment?: IntFieldUpdateOperationsInput | number
    Id_Message?: IntFieldUpdateOperationsInput | number
    File_Name?: StringFieldUpdateOperationsInput | string
    File_Path?: StringFieldUpdateOperationsInput | string
    File_Size?: IntFieldUpdateOperationsInput | number
    Mime_Type?: StringFieldUpdateOperationsInput | string
    Date_Upload?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type T_conversation_participantListRelationFilter = {
    every?: t_conversation_participantWhereInput
    some?: t_conversation_participantWhereInput
    none?: t_conversation_participantWhereInput
  }

  export type T_messageListRelationFilter = {
    every?: t_messageWhereInput
    some?: t_messageWhereInput
    none?: t_messageWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type t_conversation_participantOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type t_messageOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type t_conversationOrderByRelevanceInput = {
    fields: t_conversationOrderByRelevanceFieldEnum | t_conversationOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type t_conversationCountOrderByAggregateInput = {
    Id_Conversation?: SortOrder
    Type?: SortOrder
    Titre?: SortOrder
    DM_Key?: SortOrder
    Date_Creation?: SortOrder
  }

  export type t_conversationAvgOrderByAggregateInput = {
    Id_Conversation?: SortOrder
  }

  export type t_conversationMaxOrderByAggregateInput = {
    Id_Conversation?: SortOrder
    Type?: SortOrder
    Titre?: SortOrder
    DM_Key?: SortOrder
    Date_Creation?: SortOrder
  }

  export type t_conversationMinOrderByAggregateInput = {
    Id_Conversation?: SortOrder
    Type?: SortOrder
    Titre?: SortOrder
    DM_Key?: SortOrder
    Date_Creation?: SortOrder
  }

  export type t_conversationSumOrderByAggregateInput = {
    Id_Conversation?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type T_conversationScalarRelationFilter = {
    is?: t_conversationWhereInput
    isNot?: t_conversationWhereInput
  }

  export type t_conversation_participantId_ConversationId_UtilisateurCompoundUniqueInput = {
    Id_Conversation: number
    Id_Utilisateur: number
  }

  export type t_conversation_participantCountOrderByAggregateInput = {
    Id_Participant?: SortOrder
    Id_Conversation?: SortOrder
    Id_Utilisateur?: SortOrder
    Last_Read_Msg_Id?: SortOrder
    Date_Ajout?: SortOrder
  }

  export type t_conversation_participantAvgOrderByAggregateInput = {
    Id_Participant?: SortOrder
    Id_Conversation?: SortOrder
    Id_Utilisateur?: SortOrder
    Last_Read_Msg_Id?: SortOrder
  }

  export type t_conversation_participantMaxOrderByAggregateInput = {
    Id_Participant?: SortOrder
    Id_Conversation?: SortOrder
    Id_Utilisateur?: SortOrder
    Last_Read_Msg_Id?: SortOrder
    Date_Ajout?: SortOrder
  }

  export type t_conversation_participantMinOrderByAggregateInput = {
    Id_Participant?: SortOrder
    Id_Conversation?: SortOrder
    Id_Utilisateur?: SortOrder
    Last_Read_Msg_Id?: SortOrder
    Date_Ajout?: SortOrder
  }

  export type t_conversation_participantSumOrderByAggregateInput = {
    Id_Participant?: SortOrder
    Id_Conversation?: SortOrder
    Id_Utilisateur?: SortOrder
    Last_Read_Msg_Id?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type T_message_attachmentListRelationFilter = {
    every?: t_message_attachmentWhereInput
    some?: t_message_attachmentWhereInput
    none?: t_message_attachmentWhereInput
  }

  export type t_message_attachmentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type t_messageOrderByRelevanceInput = {
    fields: t_messageOrderByRelevanceFieldEnum | t_messageOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type t_messageCountOrderByAggregateInput = {
    Id_Message?: SortOrder
    Id_Conversation?: SortOrder
    Sender_Id?: SortOrder
    Contenu?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrder
    Date_Suppression?: SortOrder
  }

  export type t_messageAvgOrderByAggregateInput = {
    Id_Message?: SortOrder
    Id_Conversation?: SortOrder
    Sender_Id?: SortOrder
  }

  export type t_messageMaxOrderByAggregateInput = {
    Id_Message?: SortOrder
    Id_Conversation?: SortOrder
    Sender_Id?: SortOrder
    Contenu?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrder
    Date_Suppression?: SortOrder
  }

  export type t_messageMinOrderByAggregateInput = {
    Id_Message?: SortOrder
    Id_Conversation?: SortOrder
    Sender_Id?: SortOrder
    Contenu?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrder
    Date_Suppression?: SortOrder
  }

  export type t_messageSumOrderByAggregateInput = {
    Id_Message?: SortOrder
    Id_Conversation?: SortOrder
    Sender_Id?: SortOrder
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type T_messageScalarRelationFilter = {
    is?: t_messageWhereInput
    isNot?: t_messageWhereInput
  }

  export type t_message_attachmentOrderByRelevanceInput = {
    fields: t_message_attachmentOrderByRelevanceFieldEnum | t_message_attachmentOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type t_message_attachmentCountOrderByAggregateInput = {
    Id_Attachment?: SortOrder
    Id_Message?: SortOrder
    File_Name?: SortOrder
    File_Path?: SortOrder
    File_Size?: SortOrder
    Mime_Type?: SortOrder
    Date_Upload?: SortOrder
  }

  export type t_message_attachmentAvgOrderByAggregateInput = {
    Id_Attachment?: SortOrder
    Id_Message?: SortOrder
    File_Size?: SortOrder
  }

  export type t_message_attachmentMaxOrderByAggregateInput = {
    Id_Attachment?: SortOrder
    Id_Message?: SortOrder
    File_Name?: SortOrder
    File_Path?: SortOrder
    File_Size?: SortOrder
    Mime_Type?: SortOrder
    Date_Upload?: SortOrder
  }

  export type t_message_attachmentMinOrderByAggregateInput = {
    Id_Attachment?: SortOrder
    Id_Message?: SortOrder
    File_Name?: SortOrder
    File_Path?: SortOrder
    File_Size?: SortOrder
    Mime_Type?: SortOrder
    Date_Upload?: SortOrder
  }

  export type t_message_attachmentSumOrderByAggregateInput = {
    Id_Attachment?: SortOrder
    Id_Message?: SortOrder
    File_Size?: SortOrder
  }

  export type t_conversation_participantCreateNestedManyWithoutConversationInput = {
    create?: XOR<t_conversation_participantCreateWithoutConversationInput, t_conversation_participantUncheckedCreateWithoutConversationInput> | t_conversation_participantCreateWithoutConversationInput[] | t_conversation_participantUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: t_conversation_participantCreateOrConnectWithoutConversationInput | t_conversation_participantCreateOrConnectWithoutConversationInput[]
    createMany?: t_conversation_participantCreateManyConversationInputEnvelope
    connect?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
  }

  export type t_messageCreateNestedManyWithoutConversationInput = {
    create?: XOR<t_messageCreateWithoutConversationInput, t_messageUncheckedCreateWithoutConversationInput> | t_messageCreateWithoutConversationInput[] | t_messageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: t_messageCreateOrConnectWithoutConversationInput | t_messageCreateOrConnectWithoutConversationInput[]
    createMany?: t_messageCreateManyConversationInputEnvelope
    connect?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
  }

  export type t_conversation_participantUncheckedCreateNestedManyWithoutConversationInput = {
    create?: XOR<t_conversation_participantCreateWithoutConversationInput, t_conversation_participantUncheckedCreateWithoutConversationInput> | t_conversation_participantCreateWithoutConversationInput[] | t_conversation_participantUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: t_conversation_participantCreateOrConnectWithoutConversationInput | t_conversation_participantCreateOrConnectWithoutConversationInput[]
    createMany?: t_conversation_participantCreateManyConversationInputEnvelope
    connect?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
  }

  export type t_messageUncheckedCreateNestedManyWithoutConversationInput = {
    create?: XOR<t_messageCreateWithoutConversationInput, t_messageUncheckedCreateWithoutConversationInput> | t_messageCreateWithoutConversationInput[] | t_messageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: t_messageCreateOrConnectWithoutConversationInput | t_messageCreateOrConnectWithoutConversationInput[]
    createMany?: t_messageCreateManyConversationInputEnvelope
    connect?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type t_conversation_participantUpdateManyWithoutConversationNestedInput = {
    create?: XOR<t_conversation_participantCreateWithoutConversationInput, t_conversation_participantUncheckedCreateWithoutConversationInput> | t_conversation_participantCreateWithoutConversationInput[] | t_conversation_participantUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: t_conversation_participantCreateOrConnectWithoutConversationInput | t_conversation_participantCreateOrConnectWithoutConversationInput[]
    upsert?: t_conversation_participantUpsertWithWhereUniqueWithoutConversationInput | t_conversation_participantUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: t_conversation_participantCreateManyConversationInputEnvelope
    set?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
    disconnect?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
    delete?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
    connect?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
    update?: t_conversation_participantUpdateWithWhereUniqueWithoutConversationInput | t_conversation_participantUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: t_conversation_participantUpdateManyWithWhereWithoutConversationInput | t_conversation_participantUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: t_conversation_participantScalarWhereInput | t_conversation_participantScalarWhereInput[]
  }

  export type t_messageUpdateManyWithoutConversationNestedInput = {
    create?: XOR<t_messageCreateWithoutConversationInput, t_messageUncheckedCreateWithoutConversationInput> | t_messageCreateWithoutConversationInput[] | t_messageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: t_messageCreateOrConnectWithoutConversationInput | t_messageCreateOrConnectWithoutConversationInput[]
    upsert?: t_messageUpsertWithWhereUniqueWithoutConversationInput | t_messageUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: t_messageCreateManyConversationInputEnvelope
    set?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
    disconnect?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
    delete?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
    connect?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
    update?: t_messageUpdateWithWhereUniqueWithoutConversationInput | t_messageUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: t_messageUpdateManyWithWhereWithoutConversationInput | t_messageUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: t_messageScalarWhereInput | t_messageScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type t_conversation_participantUncheckedUpdateManyWithoutConversationNestedInput = {
    create?: XOR<t_conversation_participantCreateWithoutConversationInput, t_conversation_participantUncheckedCreateWithoutConversationInput> | t_conversation_participantCreateWithoutConversationInput[] | t_conversation_participantUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: t_conversation_participantCreateOrConnectWithoutConversationInput | t_conversation_participantCreateOrConnectWithoutConversationInput[]
    upsert?: t_conversation_participantUpsertWithWhereUniqueWithoutConversationInput | t_conversation_participantUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: t_conversation_participantCreateManyConversationInputEnvelope
    set?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
    disconnect?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
    delete?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
    connect?: t_conversation_participantWhereUniqueInput | t_conversation_participantWhereUniqueInput[]
    update?: t_conversation_participantUpdateWithWhereUniqueWithoutConversationInput | t_conversation_participantUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: t_conversation_participantUpdateManyWithWhereWithoutConversationInput | t_conversation_participantUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: t_conversation_participantScalarWhereInput | t_conversation_participantScalarWhereInput[]
  }

  export type t_messageUncheckedUpdateManyWithoutConversationNestedInput = {
    create?: XOR<t_messageCreateWithoutConversationInput, t_messageUncheckedCreateWithoutConversationInput> | t_messageCreateWithoutConversationInput[] | t_messageUncheckedCreateWithoutConversationInput[]
    connectOrCreate?: t_messageCreateOrConnectWithoutConversationInput | t_messageCreateOrConnectWithoutConversationInput[]
    upsert?: t_messageUpsertWithWhereUniqueWithoutConversationInput | t_messageUpsertWithWhereUniqueWithoutConversationInput[]
    createMany?: t_messageCreateManyConversationInputEnvelope
    set?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
    disconnect?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
    delete?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
    connect?: t_messageWhereUniqueInput | t_messageWhereUniqueInput[]
    update?: t_messageUpdateWithWhereUniqueWithoutConversationInput | t_messageUpdateWithWhereUniqueWithoutConversationInput[]
    updateMany?: t_messageUpdateManyWithWhereWithoutConversationInput | t_messageUpdateManyWithWhereWithoutConversationInput[]
    deleteMany?: t_messageScalarWhereInput | t_messageScalarWhereInput[]
  }

  export type t_conversationCreateNestedOneWithoutParticipantsInput = {
    create?: XOR<t_conversationCreateWithoutParticipantsInput, t_conversationUncheckedCreateWithoutParticipantsInput>
    connectOrCreate?: t_conversationCreateOrConnectWithoutParticipantsInput
    connect?: t_conversationWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type t_conversationUpdateOneRequiredWithoutParticipantsNestedInput = {
    create?: XOR<t_conversationCreateWithoutParticipantsInput, t_conversationUncheckedCreateWithoutParticipantsInput>
    connectOrCreate?: t_conversationCreateOrConnectWithoutParticipantsInput
    upsert?: t_conversationUpsertWithoutParticipantsInput
    connect?: t_conversationWhereUniqueInput
    update?: XOR<XOR<t_conversationUpdateToOneWithWhereWithoutParticipantsInput, t_conversationUpdateWithoutParticipantsInput>, t_conversationUncheckedUpdateWithoutParticipantsInput>
  }

  export type t_conversationCreateNestedOneWithoutMessagesInput = {
    create?: XOR<t_conversationCreateWithoutMessagesInput, t_conversationUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: t_conversationCreateOrConnectWithoutMessagesInput
    connect?: t_conversationWhereUniqueInput
  }

  export type t_message_attachmentCreateNestedManyWithoutMessageInput = {
    create?: XOR<t_message_attachmentCreateWithoutMessageInput, t_message_attachmentUncheckedCreateWithoutMessageInput> | t_message_attachmentCreateWithoutMessageInput[] | t_message_attachmentUncheckedCreateWithoutMessageInput[]
    connectOrCreate?: t_message_attachmentCreateOrConnectWithoutMessageInput | t_message_attachmentCreateOrConnectWithoutMessageInput[]
    createMany?: t_message_attachmentCreateManyMessageInputEnvelope
    connect?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
  }

  export type t_message_attachmentUncheckedCreateNestedManyWithoutMessageInput = {
    create?: XOR<t_message_attachmentCreateWithoutMessageInput, t_message_attachmentUncheckedCreateWithoutMessageInput> | t_message_attachmentCreateWithoutMessageInput[] | t_message_attachmentUncheckedCreateWithoutMessageInput[]
    connectOrCreate?: t_message_attachmentCreateOrConnectWithoutMessageInput | t_message_attachmentCreateOrConnectWithoutMessageInput[]
    createMany?: t_message_attachmentCreateManyMessageInputEnvelope
    connect?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type t_conversationUpdateOneRequiredWithoutMessagesNestedInput = {
    create?: XOR<t_conversationCreateWithoutMessagesInput, t_conversationUncheckedCreateWithoutMessagesInput>
    connectOrCreate?: t_conversationCreateOrConnectWithoutMessagesInput
    upsert?: t_conversationUpsertWithoutMessagesInput
    connect?: t_conversationWhereUniqueInput
    update?: XOR<XOR<t_conversationUpdateToOneWithWhereWithoutMessagesInput, t_conversationUpdateWithoutMessagesInput>, t_conversationUncheckedUpdateWithoutMessagesInput>
  }

  export type t_message_attachmentUpdateManyWithoutMessageNestedInput = {
    create?: XOR<t_message_attachmentCreateWithoutMessageInput, t_message_attachmentUncheckedCreateWithoutMessageInput> | t_message_attachmentCreateWithoutMessageInput[] | t_message_attachmentUncheckedCreateWithoutMessageInput[]
    connectOrCreate?: t_message_attachmentCreateOrConnectWithoutMessageInput | t_message_attachmentCreateOrConnectWithoutMessageInput[]
    upsert?: t_message_attachmentUpsertWithWhereUniqueWithoutMessageInput | t_message_attachmentUpsertWithWhereUniqueWithoutMessageInput[]
    createMany?: t_message_attachmentCreateManyMessageInputEnvelope
    set?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
    disconnect?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
    delete?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
    connect?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
    update?: t_message_attachmentUpdateWithWhereUniqueWithoutMessageInput | t_message_attachmentUpdateWithWhereUniqueWithoutMessageInput[]
    updateMany?: t_message_attachmentUpdateManyWithWhereWithoutMessageInput | t_message_attachmentUpdateManyWithWhereWithoutMessageInput[]
    deleteMany?: t_message_attachmentScalarWhereInput | t_message_attachmentScalarWhereInput[]
  }

  export type t_message_attachmentUncheckedUpdateManyWithoutMessageNestedInput = {
    create?: XOR<t_message_attachmentCreateWithoutMessageInput, t_message_attachmentUncheckedCreateWithoutMessageInput> | t_message_attachmentCreateWithoutMessageInput[] | t_message_attachmentUncheckedCreateWithoutMessageInput[]
    connectOrCreate?: t_message_attachmentCreateOrConnectWithoutMessageInput | t_message_attachmentCreateOrConnectWithoutMessageInput[]
    upsert?: t_message_attachmentUpsertWithWhereUniqueWithoutMessageInput | t_message_attachmentUpsertWithWhereUniqueWithoutMessageInput[]
    createMany?: t_message_attachmentCreateManyMessageInputEnvelope
    set?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
    disconnect?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
    delete?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
    connect?: t_message_attachmentWhereUniqueInput | t_message_attachmentWhereUniqueInput[]
    update?: t_message_attachmentUpdateWithWhereUniqueWithoutMessageInput | t_message_attachmentUpdateWithWhereUniqueWithoutMessageInput[]
    updateMany?: t_message_attachmentUpdateManyWithWhereWithoutMessageInput | t_message_attachmentUpdateManyWithWhereWithoutMessageInput[]
    deleteMany?: t_message_attachmentScalarWhereInput | t_message_attachmentScalarWhereInput[]
  }

  export type t_messageCreateNestedOneWithoutAttachmentsInput = {
    create?: XOR<t_messageCreateWithoutAttachmentsInput, t_messageUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: t_messageCreateOrConnectWithoutAttachmentsInput
    connect?: t_messageWhereUniqueInput
  }

  export type t_messageUpdateOneRequiredWithoutAttachmentsNestedInput = {
    create?: XOR<t_messageCreateWithoutAttachmentsInput, t_messageUncheckedCreateWithoutAttachmentsInput>
    connectOrCreate?: t_messageCreateOrConnectWithoutAttachmentsInput
    upsert?: t_messageUpsertWithoutAttachmentsInput
    connect?: t_messageWhereUniqueInput
    update?: XOR<XOR<t_messageUpdateToOneWithWhereWithoutAttachmentsInput, t_messageUpdateWithoutAttachmentsInput>, t_messageUncheckedUpdateWithoutAttachmentsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[]
    notIn?: string[]
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | null
    notIn?: string[] | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    search?: string
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[]
    notIn?: Date[] | string[]
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | null
    notIn?: Date[] | string[] | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type t_conversation_participantCreateWithoutConversationInput = {
    Id_Utilisateur: number
    Last_Read_Msg_Id?: number | null
    Date_Ajout?: Date | string
  }

  export type t_conversation_participantUncheckedCreateWithoutConversationInput = {
    Id_Participant?: number
    Id_Utilisateur: number
    Last_Read_Msg_Id?: number | null
    Date_Ajout?: Date | string
  }

  export type t_conversation_participantCreateOrConnectWithoutConversationInput = {
    where: t_conversation_participantWhereUniqueInput
    create: XOR<t_conversation_participantCreateWithoutConversationInput, t_conversation_participantUncheckedCreateWithoutConversationInput>
  }

  export type t_conversation_participantCreateManyConversationInputEnvelope = {
    data: t_conversation_participantCreateManyConversationInput | t_conversation_participantCreateManyConversationInput[]
    skipDuplicates?: boolean
  }

  export type t_messageCreateWithoutConversationInput = {
    Sender_Id: number
    Contenu: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
    Date_Suppression?: Date | string | null
    attachments?: t_message_attachmentCreateNestedManyWithoutMessageInput
  }

  export type t_messageUncheckedCreateWithoutConversationInput = {
    Id_Message?: number
    Sender_Id: number
    Contenu: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
    Date_Suppression?: Date | string | null
    attachments?: t_message_attachmentUncheckedCreateNestedManyWithoutMessageInput
  }

  export type t_messageCreateOrConnectWithoutConversationInput = {
    where: t_messageWhereUniqueInput
    create: XOR<t_messageCreateWithoutConversationInput, t_messageUncheckedCreateWithoutConversationInput>
  }

  export type t_messageCreateManyConversationInputEnvelope = {
    data: t_messageCreateManyConversationInput | t_messageCreateManyConversationInput[]
    skipDuplicates?: boolean
  }

  export type t_conversation_participantUpsertWithWhereUniqueWithoutConversationInput = {
    where: t_conversation_participantWhereUniqueInput
    update: XOR<t_conversation_participantUpdateWithoutConversationInput, t_conversation_participantUncheckedUpdateWithoutConversationInput>
    create: XOR<t_conversation_participantCreateWithoutConversationInput, t_conversation_participantUncheckedCreateWithoutConversationInput>
  }

  export type t_conversation_participantUpdateWithWhereUniqueWithoutConversationInput = {
    where: t_conversation_participantWhereUniqueInput
    data: XOR<t_conversation_participantUpdateWithoutConversationInput, t_conversation_participantUncheckedUpdateWithoutConversationInput>
  }

  export type t_conversation_participantUpdateManyWithWhereWithoutConversationInput = {
    where: t_conversation_participantScalarWhereInput
    data: XOR<t_conversation_participantUpdateManyMutationInput, t_conversation_participantUncheckedUpdateManyWithoutConversationInput>
  }

  export type t_conversation_participantScalarWhereInput = {
    AND?: t_conversation_participantScalarWhereInput | t_conversation_participantScalarWhereInput[]
    OR?: t_conversation_participantScalarWhereInput[]
    NOT?: t_conversation_participantScalarWhereInput | t_conversation_participantScalarWhereInput[]
    Id_Participant?: IntFilter<"t_conversation_participant"> | number
    Id_Conversation?: IntFilter<"t_conversation_participant"> | number
    Id_Utilisateur?: IntFilter<"t_conversation_participant"> | number
    Last_Read_Msg_Id?: IntNullableFilter<"t_conversation_participant"> | number | null
    Date_Ajout?: DateTimeFilter<"t_conversation_participant"> | Date | string
  }

  export type t_messageUpsertWithWhereUniqueWithoutConversationInput = {
    where: t_messageWhereUniqueInput
    update: XOR<t_messageUpdateWithoutConversationInput, t_messageUncheckedUpdateWithoutConversationInput>
    create: XOR<t_messageCreateWithoutConversationInput, t_messageUncheckedCreateWithoutConversationInput>
  }

  export type t_messageUpdateWithWhereUniqueWithoutConversationInput = {
    where: t_messageWhereUniqueInput
    data: XOR<t_messageUpdateWithoutConversationInput, t_messageUncheckedUpdateWithoutConversationInput>
  }

  export type t_messageUpdateManyWithWhereWithoutConversationInput = {
    where: t_messageScalarWhereInput
    data: XOR<t_messageUpdateManyMutationInput, t_messageUncheckedUpdateManyWithoutConversationInput>
  }

  export type t_messageScalarWhereInput = {
    AND?: t_messageScalarWhereInput | t_messageScalarWhereInput[]
    OR?: t_messageScalarWhereInput[]
    NOT?: t_messageScalarWhereInput | t_messageScalarWhereInput[]
    Id_Message?: IntFilter<"t_message"> | number
    Id_Conversation?: IntFilter<"t_message"> | number
    Sender_Id?: IntFilter<"t_message"> | number
    Contenu?: StringFilter<"t_message"> | string
    Date_Creation?: DateTimeFilter<"t_message"> | Date | string
    Date_Modification?: DateTimeNullableFilter<"t_message"> | Date | string | null
    Date_Suppression?: DateTimeNullableFilter<"t_message"> | Date | string | null
  }

  export type t_conversationCreateWithoutParticipantsInput = {
    Type: string
    Titre?: string | null
    DM_Key?: string | null
    Date_Creation?: Date | string
    messages?: t_messageCreateNestedManyWithoutConversationInput
  }

  export type t_conversationUncheckedCreateWithoutParticipantsInput = {
    Id_Conversation?: number
    Type: string
    Titre?: string | null
    DM_Key?: string | null
    Date_Creation?: Date | string
    messages?: t_messageUncheckedCreateNestedManyWithoutConversationInput
  }

  export type t_conversationCreateOrConnectWithoutParticipantsInput = {
    where: t_conversationWhereUniqueInput
    create: XOR<t_conversationCreateWithoutParticipantsInput, t_conversationUncheckedCreateWithoutParticipantsInput>
  }

  export type t_conversationUpsertWithoutParticipantsInput = {
    update: XOR<t_conversationUpdateWithoutParticipantsInput, t_conversationUncheckedUpdateWithoutParticipantsInput>
    create: XOR<t_conversationCreateWithoutParticipantsInput, t_conversationUncheckedCreateWithoutParticipantsInput>
    where?: t_conversationWhereInput
  }

  export type t_conversationUpdateToOneWithWhereWithoutParticipantsInput = {
    where?: t_conversationWhereInput
    data: XOR<t_conversationUpdateWithoutParticipantsInput, t_conversationUncheckedUpdateWithoutParticipantsInput>
  }

  export type t_conversationUpdateWithoutParticipantsInput = {
    Type?: StringFieldUpdateOperationsInput | string
    Titre?: NullableStringFieldUpdateOperationsInput | string | null
    DM_Key?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: t_messageUpdateManyWithoutConversationNestedInput
  }

  export type t_conversationUncheckedUpdateWithoutParticipantsInput = {
    Id_Conversation?: IntFieldUpdateOperationsInput | number
    Type?: StringFieldUpdateOperationsInput | string
    Titre?: NullableStringFieldUpdateOperationsInput | string | null
    DM_Key?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    messages?: t_messageUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type t_conversationCreateWithoutMessagesInput = {
    Type: string
    Titre?: string | null
    DM_Key?: string | null
    Date_Creation?: Date | string
    participants?: t_conversation_participantCreateNestedManyWithoutConversationInput
  }

  export type t_conversationUncheckedCreateWithoutMessagesInput = {
    Id_Conversation?: number
    Type: string
    Titre?: string | null
    DM_Key?: string | null
    Date_Creation?: Date | string
    participants?: t_conversation_participantUncheckedCreateNestedManyWithoutConversationInput
  }

  export type t_conversationCreateOrConnectWithoutMessagesInput = {
    where: t_conversationWhereUniqueInput
    create: XOR<t_conversationCreateWithoutMessagesInput, t_conversationUncheckedCreateWithoutMessagesInput>
  }

  export type t_message_attachmentCreateWithoutMessageInput = {
    File_Name: string
    File_Path: string
    File_Size: number
    Mime_Type: string
    Date_Upload?: Date | string
  }

  export type t_message_attachmentUncheckedCreateWithoutMessageInput = {
    Id_Attachment?: number
    File_Name: string
    File_Path: string
    File_Size: number
    Mime_Type: string
    Date_Upload?: Date | string
  }

  export type t_message_attachmentCreateOrConnectWithoutMessageInput = {
    where: t_message_attachmentWhereUniqueInput
    create: XOR<t_message_attachmentCreateWithoutMessageInput, t_message_attachmentUncheckedCreateWithoutMessageInput>
  }

  export type t_message_attachmentCreateManyMessageInputEnvelope = {
    data: t_message_attachmentCreateManyMessageInput | t_message_attachmentCreateManyMessageInput[]
    skipDuplicates?: boolean
  }

  export type t_conversationUpsertWithoutMessagesInput = {
    update: XOR<t_conversationUpdateWithoutMessagesInput, t_conversationUncheckedUpdateWithoutMessagesInput>
    create: XOR<t_conversationCreateWithoutMessagesInput, t_conversationUncheckedCreateWithoutMessagesInput>
    where?: t_conversationWhereInput
  }

  export type t_conversationUpdateToOneWithWhereWithoutMessagesInput = {
    where?: t_conversationWhereInput
    data: XOR<t_conversationUpdateWithoutMessagesInput, t_conversationUncheckedUpdateWithoutMessagesInput>
  }

  export type t_conversationUpdateWithoutMessagesInput = {
    Type?: StringFieldUpdateOperationsInput | string
    Titre?: NullableStringFieldUpdateOperationsInput | string | null
    DM_Key?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    participants?: t_conversation_participantUpdateManyWithoutConversationNestedInput
  }

  export type t_conversationUncheckedUpdateWithoutMessagesInput = {
    Id_Conversation?: IntFieldUpdateOperationsInput | number
    Type?: StringFieldUpdateOperationsInput | string
    Titre?: NullableStringFieldUpdateOperationsInput | string | null
    DM_Key?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    participants?: t_conversation_participantUncheckedUpdateManyWithoutConversationNestedInput
  }

  export type t_message_attachmentUpsertWithWhereUniqueWithoutMessageInput = {
    where: t_message_attachmentWhereUniqueInput
    update: XOR<t_message_attachmentUpdateWithoutMessageInput, t_message_attachmentUncheckedUpdateWithoutMessageInput>
    create: XOR<t_message_attachmentCreateWithoutMessageInput, t_message_attachmentUncheckedCreateWithoutMessageInput>
  }

  export type t_message_attachmentUpdateWithWhereUniqueWithoutMessageInput = {
    where: t_message_attachmentWhereUniqueInput
    data: XOR<t_message_attachmentUpdateWithoutMessageInput, t_message_attachmentUncheckedUpdateWithoutMessageInput>
  }

  export type t_message_attachmentUpdateManyWithWhereWithoutMessageInput = {
    where: t_message_attachmentScalarWhereInput
    data: XOR<t_message_attachmentUpdateManyMutationInput, t_message_attachmentUncheckedUpdateManyWithoutMessageInput>
  }

  export type t_message_attachmentScalarWhereInput = {
    AND?: t_message_attachmentScalarWhereInput | t_message_attachmentScalarWhereInput[]
    OR?: t_message_attachmentScalarWhereInput[]
    NOT?: t_message_attachmentScalarWhereInput | t_message_attachmentScalarWhereInput[]
    Id_Attachment?: IntFilter<"t_message_attachment"> | number
    Id_Message?: IntFilter<"t_message_attachment"> | number
    File_Name?: StringFilter<"t_message_attachment"> | string
    File_Path?: StringFilter<"t_message_attachment"> | string
    File_Size?: IntFilter<"t_message_attachment"> | number
    Mime_Type?: StringFilter<"t_message_attachment"> | string
    Date_Upload?: DateTimeFilter<"t_message_attachment"> | Date | string
  }

  export type t_messageCreateWithoutAttachmentsInput = {
    Sender_Id: number
    Contenu: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
    Date_Suppression?: Date | string | null
    conversation: t_conversationCreateNestedOneWithoutMessagesInput
  }

  export type t_messageUncheckedCreateWithoutAttachmentsInput = {
    Id_Message?: number
    Id_Conversation: number
    Sender_Id: number
    Contenu: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
    Date_Suppression?: Date | string | null
  }

  export type t_messageCreateOrConnectWithoutAttachmentsInput = {
    where: t_messageWhereUniqueInput
    create: XOR<t_messageCreateWithoutAttachmentsInput, t_messageUncheckedCreateWithoutAttachmentsInput>
  }

  export type t_messageUpsertWithoutAttachmentsInput = {
    update: XOR<t_messageUpdateWithoutAttachmentsInput, t_messageUncheckedUpdateWithoutAttachmentsInput>
    create: XOR<t_messageCreateWithoutAttachmentsInput, t_messageUncheckedCreateWithoutAttachmentsInput>
    where?: t_messageWhereInput
  }

  export type t_messageUpdateToOneWithWhereWithoutAttachmentsInput = {
    where?: t_messageWhereInput
    data: XOR<t_messageUpdateWithoutAttachmentsInput, t_messageUncheckedUpdateWithoutAttachmentsInput>
  }

  export type t_messageUpdateWithoutAttachmentsInput = {
    Sender_Id?: IntFieldUpdateOperationsInput | number
    Contenu?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Date_Suppression?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    conversation?: t_conversationUpdateOneRequiredWithoutMessagesNestedInput
  }

  export type t_messageUncheckedUpdateWithoutAttachmentsInput = {
    Id_Message?: IntFieldUpdateOperationsInput | number
    Id_Conversation?: IntFieldUpdateOperationsInput | number
    Sender_Id?: IntFieldUpdateOperationsInput | number
    Contenu?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Date_Suppression?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type t_conversation_participantCreateManyConversationInput = {
    Id_Participant?: number
    Id_Utilisateur: number
    Last_Read_Msg_Id?: number | null
    Date_Ajout?: Date | string
  }

  export type t_messageCreateManyConversationInput = {
    Id_Message?: number
    Sender_Id: number
    Contenu: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
    Date_Suppression?: Date | string | null
  }

  export type t_conversation_participantUpdateWithoutConversationInput = {
    Id_Utilisateur?: IntFieldUpdateOperationsInput | number
    Last_Read_Msg_Id?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Ajout?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_conversation_participantUncheckedUpdateWithoutConversationInput = {
    Id_Participant?: IntFieldUpdateOperationsInput | number
    Id_Utilisateur?: IntFieldUpdateOperationsInput | number
    Last_Read_Msg_Id?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Ajout?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_conversation_participantUncheckedUpdateManyWithoutConversationInput = {
    Id_Participant?: IntFieldUpdateOperationsInput | number
    Id_Utilisateur?: IntFieldUpdateOperationsInput | number
    Last_Read_Msg_Id?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Ajout?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_messageUpdateWithoutConversationInput = {
    Sender_Id?: IntFieldUpdateOperationsInput | number
    Contenu?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Date_Suppression?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachments?: t_message_attachmentUpdateManyWithoutMessageNestedInput
  }

  export type t_messageUncheckedUpdateWithoutConversationInput = {
    Id_Message?: IntFieldUpdateOperationsInput | number
    Sender_Id?: IntFieldUpdateOperationsInput | number
    Contenu?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Date_Suppression?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    attachments?: t_message_attachmentUncheckedUpdateManyWithoutMessageNestedInput
  }

  export type t_messageUncheckedUpdateManyWithoutConversationInput = {
    Id_Message?: IntFieldUpdateOperationsInput | number
    Sender_Id?: IntFieldUpdateOperationsInput | number
    Contenu?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Date_Suppression?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type t_message_attachmentCreateManyMessageInput = {
    Id_Attachment?: number
    File_Name: string
    File_Path: string
    File_Size: number
    Mime_Type: string
    Date_Upload?: Date | string
  }

  export type t_message_attachmentUpdateWithoutMessageInput = {
    File_Name?: StringFieldUpdateOperationsInput | string
    File_Path?: StringFieldUpdateOperationsInput | string
    File_Size?: IntFieldUpdateOperationsInput | number
    Mime_Type?: StringFieldUpdateOperationsInput | string
    Date_Upload?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_message_attachmentUncheckedUpdateWithoutMessageInput = {
    Id_Attachment?: IntFieldUpdateOperationsInput | number
    File_Name?: StringFieldUpdateOperationsInput | string
    File_Path?: StringFieldUpdateOperationsInput | string
    File_Size?: IntFieldUpdateOperationsInput | number
    Mime_Type?: StringFieldUpdateOperationsInput | string
    Date_Upload?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type t_message_attachmentUncheckedUpdateManyWithoutMessageInput = {
    Id_Attachment?: IntFieldUpdateOperationsInput | number
    File_Name?: StringFieldUpdateOperationsInput | string
    File_Path?: StringFieldUpdateOperationsInput | string
    File_Size?: IntFieldUpdateOperationsInput | number
    Mime_Type?: StringFieldUpdateOperationsInput | string
    Date_Upload?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}