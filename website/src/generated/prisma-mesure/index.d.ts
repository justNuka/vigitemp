
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
 * Model ts_compteur_idtable
 * 
 */
export type ts_compteur_idtable = $Result.DefaultSelection<Prisma.$ts_compteur_idtablePayload>
/**
 * Model ts_graphique
 * 
 */
export type ts_graphique = $Result.DefaultSelection<Prisma.$ts_graphiquePayload>
/**
 * Model ts_journal
 * 
 */
export type ts_journal = $Result.DefaultSelection<Prisma.$ts_journalPayload>
/**
 * Model ts_journal_code
 * 
 */
export type ts_journal_code = $Result.DefaultSelection<Prisma.$ts_journal_codePayload>
/**
 * Model ts_journalhisto
 * 
 */
export type ts_journalhisto = $Result.DefaultSelection<Prisma.$ts_journalhistoPayload>
/**
 * Model ts_logmesures
 * 
 */
export type ts_logmesures = $Result.DefaultSelection<Prisma.$ts_logmesuresPayload>
/**
 * Model ts_mesure
 * 
 */
export type ts_mesure = $Result.DefaultSelection<Prisma.$ts_mesurePayload>
/**
 * Model ts_mesurecalibrage
 * 
 */
export type ts_mesurecalibrage = $Result.DefaultSelection<Prisma.$ts_mesurecalibragePayload>
/**
 * Model ts_mesurecalibrageetalon
 * 
 */
export type ts_mesurecalibrageetalon = $Result.DefaultSelection<Prisma.$ts_mesurecalibrageetalonPayload>
/**
 * Model ts_mesureetalon
 * 
 */
export type ts_mesureetalon = $Result.DefaultSelection<Prisma.$ts_mesureetalonPayload>
/**
 * Model ts_mesureetalonnage
 * 
 */
export type ts_mesureetalonnage = $Result.DefaultSelection<Prisma.$ts_mesureetalonnagePayload>
/**
 * Model ts_mesurehisto
 * 
 */
export type ts_mesurehisto = $Result.DefaultSelection<Prisma.$ts_mesurehistoPayload>
/**
 * Model ts_mesuretest
 * 
 */
export type ts_mesuretest = $Result.DefaultSelection<Prisma.$ts_mesuretestPayload>
/**
 * Model ts_mesuretestetalon
 * 
 */
export type ts_mesuretestetalon = $Result.DefaultSelection<Prisma.$ts_mesuretestetalonPayload>
/**
 * Model ts_modedegrade
 * 
 */
export type ts_modedegrade = $Result.DefaultSelection<Prisma.$ts_modedegradePayload>
/**
 * Model ts_parametre
 * 
 */
export type ts_parametre = $Result.DefaultSelection<Prisma.$ts_parametrePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Ts_compteur_idtables
 * const ts_compteur_idtables = await prisma.ts_compteur_idtable.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
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
   * // Fetch zero or more Ts_compteur_idtables
   * const ts_compteur_idtables = await prisma.ts_compteur_idtable.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
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
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
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
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
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
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
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
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.ts_compteur_idtable`: Exposes CRUD operations for the **ts_compteur_idtable** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_compteur_idtables
    * const ts_compteur_idtables = await prisma.ts_compteur_idtable.findMany()
    * ```
    */
  get ts_compteur_idtable(): Prisma.ts_compteur_idtableDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_graphique`: Exposes CRUD operations for the **ts_graphique** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_graphiques
    * const ts_graphiques = await prisma.ts_graphique.findMany()
    * ```
    */
  get ts_graphique(): Prisma.ts_graphiqueDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_journal`: Exposes CRUD operations for the **ts_journal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_journals
    * const ts_journals = await prisma.ts_journal.findMany()
    * ```
    */
  get ts_journal(): Prisma.ts_journalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_journal_code`: Exposes CRUD operations for the **ts_journal_code** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_journal_codes
    * const ts_journal_codes = await prisma.ts_journal_code.findMany()
    * ```
    */
  get ts_journal_code(): Prisma.ts_journal_codeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_journalhisto`: Exposes CRUD operations for the **ts_journalhisto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_journalhistos
    * const ts_journalhistos = await prisma.ts_journalhisto.findMany()
    * ```
    */
  get ts_journalhisto(): Prisma.ts_journalhistoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_logmesures`: Exposes CRUD operations for the **ts_logmesures** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_logmesures
    * const ts_logmesures = await prisma.ts_logmesures.findMany()
    * ```
    */
  get ts_logmesures(): Prisma.ts_logmesuresDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_mesure`: Exposes CRUD operations for the **ts_mesure** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_mesures
    * const ts_mesures = await prisma.ts_mesure.findMany()
    * ```
    */
  get ts_mesure(): Prisma.ts_mesureDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_mesurecalibrage`: Exposes CRUD operations for the **ts_mesurecalibrage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_mesurecalibrages
    * const ts_mesurecalibrages = await prisma.ts_mesurecalibrage.findMany()
    * ```
    */
  get ts_mesurecalibrage(): Prisma.ts_mesurecalibrageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_mesurecalibrageetalon`: Exposes CRUD operations for the **ts_mesurecalibrageetalon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_mesurecalibrageetalons
    * const ts_mesurecalibrageetalons = await prisma.ts_mesurecalibrageetalon.findMany()
    * ```
    */
  get ts_mesurecalibrageetalon(): Prisma.ts_mesurecalibrageetalonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_mesureetalon`: Exposes CRUD operations for the **ts_mesureetalon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_mesureetalons
    * const ts_mesureetalons = await prisma.ts_mesureetalon.findMany()
    * ```
    */
  get ts_mesureetalon(): Prisma.ts_mesureetalonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_mesureetalonnage`: Exposes CRUD operations for the **ts_mesureetalonnage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_mesureetalonnages
    * const ts_mesureetalonnages = await prisma.ts_mesureetalonnage.findMany()
    * ```
    */
  get ts_mesureetalonnage(): Prisma.ts_mesureetalonnageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_mesurehisto`: Exposes CRUD operations for the **ts_mesurehisto** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_mesurehistos
    * const ts_mesurehistos = await prisma.ts_mesurehisto.findMany()
    * ```
    */
  get ts_mesurehisto(): Prisma.ts_mesurehistoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_mesuretest`: Exposes CRUD operations for the **ts_mesuretest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_mesuretests
    * const ts_mesuretests = await prisma.ts_mesuretest.findMany()
    * ```
    */
  get ts_mesuretest(): Prisma.ts_mesuretestDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_mesuretestetalon`: Exposes CRUD operations for the **ts_mesuretestetalon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_mesuretestetalons
    * const ts_mesuretestetalons = await prisma.ts_mesuretestetalon.findMany()
    * ```
    */
  get ts_mesuretestetalon(): Prisma.ts_mesuretestetalonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_modedegrade`: Exposes CRUD operations for the **ts_modedegrade** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_modedegrades
    * const ts_modedegrades = await prisma.ts_modedegrade.findMany()
    * ```
    */
  get ts_modedegrade(): Prisma.ts_modedegradeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.ts_parametre`: Exposes CRUD operations for the **ts_parametre** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Ts_parametres
    * const ts_parametres = await prisma.ts_parametre.findMany()
    * ```
    */
  get ts_parametre(): Prisma.ts_parametreDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 7.0.1
   * Query Engine version: f09f2815f091dbba658cdcd2264306d88bb5bda6
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
    ts_compteur_idtable: 'ts_compteur_idtable',
    ts_graphique: 'ts_graphique',
    ts_journal: 'ts_journal',
    ts_journal_code: 'ts_journal_code',
    ts_journalhisto: 'ts_journalhisto',
    ts_logmesures: 'ts_logmesures',
    ts_mesure: 'ts_mesure',
    ts_mesurecalibrage: 'ts_mesurecalibrage',
    ts_mesurecalibrageetalon: 'ts_mesurecalibrageetalon',
    ts_mesureetalon: 'ts_mesureetalon',
    ts_mesureetalonnage: 'ts_mesureetalonnage',
    ts_mesurehisto: 'ts_mesurehisto',
    ts_mesuretest: 'ts_mesuretest',
    ts_mesuretestetalon: 'ts_mesuretestetalon',
    ts_modedegrade: 'ts_modedegrade',
    ts_parametre: 'ts_parametre'
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
      modelProps: "ts_compteur_idtable" | "ts_graphique" | "ts_journal" | "ts_journal_code" | "ts_journalhisto" | "ts_logmesures" | "ts_mesure" | "ts_mesurecalibrage" | "ts_mesurecalibrageetalon" | "ts_mesureetalon" | "ts_mesureetalonnage" | "ts_mesurehisto" | "ts_mesuretest" | "ts_mesuretestetalon" | "ts_modedegrade" | "ts_parametre"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ts_compteur_idtable: {
        payload: Prisma.$ts_compteur_idtablePayload<ExtArgs>
        fields: Prisma.ts_compteur_idtableFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_compteur_idtableFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_compteur_idtablePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_compteur_idtableFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_compteur_idtablePayload>
          }
          findFirst: {
            args: Prisma.ts_compteur_idtableFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_compteur_idtablePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_compteur_idtableFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_compteur_idtablePayload>
          }
          findMany: {
            args: Prisma.ts_compteur_idtableFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_compteur_idtablePayload>[]
          }
          create: {
            args: Prisma.ts_compteur_idtableCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_compteur_idtablePayload>
          }
          createMany: {
            args: Prisma.ts_compteur_idtableCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_compteur_idtableDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_compteur_idtablePayload>
          }
          update: {
            args: Prisma.ts_compteur_idtableUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_compteur_idtablePayload>
          }
          deleteMany: {
            args: Prisma.ts_compteur_idtableDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_compteur_idtableUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_compteur_idtableUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_compteur_idtablePayload>
          }
          aggregate: {
            args: Prisma.Ts_compteur_idtableAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_compteur_idtable>
          }
          groupBy: {
            args: Prisma.ts_compteur_idtableGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_compteur_idtableGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_compteur_idtableCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_compteur_idtableCountAggregateOutputType> | number
          }
        }
      }
      ts_graphique: {
        payload: Prisma.$ts_graphiquePayload<ExtArgs>
        fields: Prisma.ts_graphiqueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_graphiqueFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_graphiquePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_graphiqueFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_graphiquePayload>
          }
          findFirst: {
            args: Prisma.ts_graphiqueFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_graphiquePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_graphiqueFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_graphiquePayload>
          }
          findMany: {
            args: Prisma.ts_graphiqueFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_graphiquePayload>[]
          }
          create: {
            args: Prisma.ts_graphiqueCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_graphiquePayload>
          }
          createMany: {
            args: Prisma.ts_graphiqueCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_graphiqueDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_graphiquePayload>
          }
          update: {
            args: Prisma.ts_graphiqueUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_graphiquePayload>
          }
          deleteMany: {
            args: Prisma.ts_graphiqueDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_graphiqueUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_graphiqueUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_graphiquePayload>
          }
          aggregate: {
            args: Prisma.Ts_graphiqueAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_graphique>
          }
          groupBy: {
            args: Prisma.ts_graphiqueGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_graphiqueGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_graphiqueCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_graphiqueCountAggregateOutputType> | number
          }
        }
      }
      ts_journal: {
        payload: Prisma.$ts_journalPayload<ExtArgs>
        fields: Prisma.ts_journalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_journalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_journalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalPayload>
          }
          findFirst: {
            args: Prisma.ts_journalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_journalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalPayload>
          }
          findMany: {
            args: Prisma.ts_journalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalPayload>[]
          }
          create: {
            args: Prisma.ts_journalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalPayload>
          }
          createMany: {
            args: Prisma.ts_journalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_journalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalPayload>
          }
          update: {
            args: Prisma.ts_journalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalPayload>
          }
          deleteMany: {
            args: Prisma.ts_journalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_journalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_journalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalPayload>
          }
          aggregate: {
            args: Prisma.Ts_journalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_journal>
          }
          groupBy: {
            args: Prisma.ts_journalGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_journalGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_journalCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_journalCountAggregateOutputType> | number
          }
        }
      }
      ts_journal_code: {
        payload: Prisma.$ts_journal_codePayload<ExtArgs>
        fields: Prisma.ts_journal_codeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_journal_codeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journal_codePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_journal_codeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journal_codePayload>
          }
          findFirst: {
            args: Prisma.ts_journal_codeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journal_codePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_journal_codeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journal_codePayload>
          }
          findMany: {
            args: Prisma.ts_journal_codeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journal_codePayload>[]
          }
          create: {
            args: Prisma.ts_journal_codeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journal_codePayload>
          }
          createMany: {
            args: Prisma.ts_journal_codeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_journal_codeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journal_codePayload>
          }
          update: {
            args: Prisma.ts_journal_codeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journal_codePayload>
          }
          deleteMany: {
            args: Prisma.ts_journal_codeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_journal_codeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_journal_codeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journal_codePayload>
          }
          aggregate: {
            args: Prisma.Ts_journal_codeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_journal_code>
          }
          groupBy: {
            args: Prisma.ts_journal_codeGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_journal_codeGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_journal_codeCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_journal_codeCountAggregateOutputType> | number
          }
        }
      }
      ts_journalhisto: {
        payload: Prisma.$ts_journalhistoPayload<ExtArgs>
        fields: Prisma.ts_journalhistoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_journalhistoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalhistoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_journalhistoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalhistoPayload>
          }
          findFirst: {
            args: Prisma.ts_journalhistoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalhistoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_journalhistoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalhistoPayload>
          }
          findMany: {
            args: Prisma.ts_journalhistoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalhistoPayload>[]
          }
          create: {
            args: Prisma.ts_journalhistoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalhistoPayload>
          }
          createMany: {
            args: Prisma.ts_journalhistoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_journalhistoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalhistoPayload>
          }
          update: {
            args: Prisma.ts_journalhistoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalhistoPayload>
          }
          deleteMany: {
            args: Prisma.ts_journalhistoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_journalhistoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_journalhistoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_journalhistoPayload>
          }
          aggregate: {
            args: Prisma.Ts_journalhistoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_journalhisto>
          }
          groupBy: {
            args: Prisma.ts_journalhistoGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_journalhistoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_journalhistoCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_journalhistoCountAggregateOutputType> | number
          }
        }
      }
      ts_logmesures: {
        payload: Prisma.$ts_logmesuresPayload<ExtArgs>
        fields: Prisma.ts_logmesuresFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_logmesuresFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_logmesuresPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_logmesuresFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_logmesuresPayload>
          }
          findFirst: {
            args: Prisma.ts_logmesuresFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_logmesuresPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_logmesuresFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_logmesuresPayload>
          }
          findMany: {
            args: Prisma.ts_logmesuresFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_logmesuresPayload>[]
          }
          create: {
            args: Prisma.ts_logmesuresCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_logmesuresPayload>
          }
          createMany: {
            args: Prisma.ts_logmesuresCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_logmesuresDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_logmesuresPayload>
          }
          update: {
            args: Prisma.ts_logmesuresUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_logmesuresPayload>
          }
          deleteMany: {
            args: Prisma.ts_logmesuresDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_logmesuresUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_logmesuresUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_logmesuresPayload>
          }
          aggregate: {
            args: Prisma.Ts_logmesuresAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_logmesures>
          }
          groupBy: {
            args: Prisma.ts_logmesuresGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_logmesuresGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_logmesuresCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_logmesuresCountAggregateOutputType> | number
          }
        }
      }
      ts_mesure: {
        payload: Prisma.$ts_mesurePayload<ExtArgs>
        fields: Prisma.ts_mesureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_mesureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_mesureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurePayload>
          }
          findFirst: {
            args: Prisma.ts_mesureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_mesureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurePayload>
          }
          findMany: {
            args: Prisma.ts_mesureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurePayload>[]
          }
          create: {
            args: Prisma.ts_mesureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurePayload>
          }
          createMany: {
            args: Prisma.ts_mesureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_mesureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurePayload>
          }
          update: {
            args: Prisma.ts_mesureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurePayload>
          }
          deleteMany: {
            args: Prisma.ts_mesureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_mesureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_mesureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurePayload>
          }
          aggregate: {
            args: Prisma.Ts_mesureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_mesure>
          }
          groupBy: {
            args: Prisma.ts_mesureGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesureGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_mesureCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesureCountAggregateOutputType> | number
          }
        }
      }
      ts_mesurecalibrage: {
        payload: Prisma.$ts_mesurecalibragePayload<ExtArgs>
        fields: Prisma.ts_mesurecalibrageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_mesurecalibrageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibragePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_mesurecalibrageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibragePayload>
          }
          findFirst: {
            args: Prisma.ts_mesurecalibrageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibragePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_mesurecalibrageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibragePayload>
          }
          findMany: {
            args: Prisma.ts_mesurecalibrageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibragePayload>[]
          }
          create: {
            args: Prisma.ts_mesurecalibrageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibragePayload>
          }
          createMany: {
            args: Prisma.ts_mesurecalibrageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_mesurecalibrageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibragePayload>
          }
          update: {
            args: Prisma.ts_mesurecalibrageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibragePayload>
          }
          deleteMany: {
            args: Prisma.ts_mesurecalibrageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_mesurecalibrageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_mesurecalibrageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibragePayload>
          }
          aggregate: {
            args: Prisma.Ts_mesurecalibrageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_mesurecalibrage>
          }
          groupBy: {
            args: Prisma.ts_mesurecalibrageGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesurecalibrageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_mesurecalibrageCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesurecalibrageCountAggregateOutputType> | number
          }
        }
      }
      ts_mesurecalibrageetalon: {
        payload: Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>
        fields: Prisma.ts_mesurecalibrageetalonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_mesurecalibrageetalonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibrageetalonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_mesurecalibrageetalonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibrageetalonPayload>
          }
          findFirst: {
            args: Prisma.ts_mesurecalibrageetalonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibrageetalonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_mesurecalibrageetalonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibrageetalonPayload>
          }
          findMany: {
            args: Prisma.ts_mesurecalibrageetalonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibrageetalonPayload>[]
          }
          create: {
            args: Prisma.ts_mesurecalibrageetalonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibrageetalonPayload>
          }
          createMany: {
            args: Prisma.ts_mesurecalibrageetalonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_mesurecalibrageetalonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibrageetalonPayload>
          }
          update: {
            args: Prisma.ts_mesurecalibrageetalonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibrageetalonPayload>
          }
          deleteMany: {
            args: Prisma.ts_mesurecalibrageetalonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_mesurecalibrageetalonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_mesurecalibrageetalonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurecalibrageetalonPayload>
          }
          aggregate: {
            args: Prisma.Ts_mesurecalibrageetalonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_mesurecalibrageetalon>
          }
          groupBy: {
            args: Prisma.ts_mesurecalibrageetalonGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesurecalibrageetalonGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_mesurecalibrageetalonCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesurecalibrageetalonCountAggregateOutputType> | number
          }
        }
      }
      ts_mesureetalon: {
        payload: Prisma.$ts_mesureetalonPayload<ExtArgs>
        fields: Prisma.ts_mesureetalonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_mesureetalonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_mesureetalonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonPayload>
          }
          findFirst: {
            args: Prisma.ts_mesureetalonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_mesureetalonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonPayload>
          }
          findMany: {
            args: Prisma.ts_mesureetalonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonPayload>[]
          }
          create: {
            args: Prisma.ts_mesureetalonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonPayload>
          }
          createMany: {
            args: Prisma.ts_mesureetalonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_mesureetalonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonPayload>
          }
          update: {
            args: Prisma.ts_mesureetalonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonPayload>
          }
          deleteMany: {
            args: Prisma.ts_mesureetalonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_mesureetalonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_mesureetalonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonPayload>
          }
          aggregate: {
            args: Prisma.Ts_mesureetalonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_mesureetalon>
          }
          groupBy: {
            args: Prisma.ts_mesureetalonGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesureetalonGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_mesureetalonCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesureetalonCountAggregateOutputType> | number
          }
        }
      }
      ts_mesureetalonnage: {
        payload: Prisma.$ts_mesureetalonnagePayload<ExtArgs>
        fields: Prisma.ts_mesureetalonnageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_mesureetalonnageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonnagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_mesureetalonnageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonnagePayload>
          }
          findFirst: {
            args: Prisma.ts_mesureetalonnageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonnagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_mesureetalonnageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonnagePayload>
          }
          findMany: {
            args: Prisma.ts_mesureetalonnageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonnagePayload>[]
          }
          create: {
            args: Prisma.ts_mesureetalonnageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonnagePayload>
          }
          createMany: {
            args: Prisma.ts_mesureetalonnageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_mesureetalonnageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonnagePayload>
          }
          update: {
            args: Prisma.ts_mesureetalonnageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonnagePayload>
          }
          deleteMany: {
            args: Prisma.ts_mesureetalonnageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_mesureetalonnageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_mesureetalonnageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesureetalonnagePayload>
          }
          aggregate: {
            args: Prisma.Ts_mesureetalonnageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_mesureetalonnage>
          }
          groupBy: {
            args: Prisma.ts_mesureetalonnageGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesureetalonnageGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_mesureetalonnageCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesureetalonnageCountAggregateOutputType> | number
          }
        }
      }
      ts_mesurehisto: {
        payload: Prisma.$ts_mesurehistoPayload<ExtArgs>
        fields: Prisma.ts_mesurehistoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_mesurehistoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurehistoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_mesurehistoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurehistoPayload>
          }
          findFirst: {
            args: Prisma.ts_mesurehistoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurehistoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_mesurehistoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurehistoPayload>
          }
          findMany: {
            args: Prisma.ts_mesurehistoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurehistoPayload>[]
          }
          create: {
            args: Prisma.ts_mesurehistoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurehistoPayload>
          }
          createMany: {
            args: Prisma.ts_mesurehistoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_mesurehistoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurehistoPayload>
          }
          update: {
            args: Prisma.ts_mesurehistoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurehistoPayload>
          }
          deleteMany: {
            args: Prisma.ts_mesurehistoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_mesurehistoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_mesurehistoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesurehistoPayload>
          }
          aggregate: {
            args: Prisma.Ts_mesurehistoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_mesurehisto>
          }
          groupBy: {
            args: Prisma.ts_mesurehistoGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesurehistoGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_mesurehistoCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesurehistoCountAggregateOutputType> | number
          }
        }
      }
      ts_mesuretest: {
        payload: Prisma.$ts_mesuretestPayload<ExtArgs>
        fields: Prisma.ts_mesuretestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_mesuretestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_mesuretestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestPayload>
          }
          findFirst: {
            args: Prisma.ts_mesuretestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_mesuretestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestPayload>
          }
          findMany: {
            args: Prisma.ts_mesuretestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestPayload>[]
          }
          create: {
            args: Prisma.ts_mesuretestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestPayload>
          }
          createMany: {
            args: Prisma.ts_mesuretestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_mesuretestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestPayload>
          }
          update: {
            args: Prisma.ts_mesuretestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestPayload>
          }
          deleteMany: {
            args: Prisma.ts_mesuretestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_mesuretestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_mesuretestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestPayload>
          }
          aggregate: {
            args: Prisma.Ts_mesuretestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_mesuretest>
          }
          groupBy: {
            args: Prisma.ts_mesuretestGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesuretestGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_mesuretestCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesuretestCountAggregateOutputType> | number
          }
        }
      }
      ts_mesuretestetalon: {
        payload: Prisma.$ts_mesuretestetalonPayload<ExtArgs>
        fields: Prisma.ts_mesuretestetalonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_mesuretestetalonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestetalonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_mesuretestetalonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestetalonPayload>
          }
          findFirst: {
            args: Prisma.ts_mesuretestetalonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestetalonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_mesuretestetalonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestetalonPayload>
          }
          findMany: {
            args: Prisma.ts_mesuretestetalonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestetalonPayload>[]
          }
          create: {
            args: Prisma.ts_mesuretestetalonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestetalonPayload>
          }
          createMany: {
            args: Prisma.ts_mesuretestetalonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_mesuretestetalonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestetalonPayload>
          }
          update: {
            args: Prisma.ts_mesuretestetalonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestetalonPayload>
          }
          deleteMany: {
            args: Prisma.ts_mesuretestetalonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_mesuretestetalonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_mesuretestetalonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_mesuretestetalonPayload>
          }
          aggregate: {
            args: Prisma.Ts_mesuretestetalonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_mesuretestetalon>
          }
          groupBy: {
            args: Prisma.ts_mesuretestetalonGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesuretestetalonGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_mesuretestetalonCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_mesuretestetalonCountAggregateOutputType> | number
          }
        }
      }
      ts_modedegrade: {
        payload: Prisma.$ts_modedegradePayload<ExtArgs>
        fields: Prisma.ts_modedegradeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_modedegradeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_modedegradePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_modedegradeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_modedegradePayload>
          }
          findFirst: {
            args: Prisma.ts_modedegradeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_modedegradePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_modedegradeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_modedegradePayload>
          }
          findMany: {
            args: Prisma.ts_modedegradeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_modedegradePayload>[]
          }
          create: {
            args: Prisma.ts_modedegradeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_modedegradePayload>
          }
          createMany: {
            args: Prisma.ts_modedegradeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_modedegradeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_modedegradePayload>
          }
          update: {
            args: Prisma.ts_modedegradeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_modedegradePayload>
          }
          deleteMany: {
            args: Prisma.ts_modedegradeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_modedegradeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_modedegradeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_modedegradePayload>
          }
          aggregate: {
            args: Prisma.Ts_modedegradeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_modedegrade>
          }
          groupBy: {
            args: Prisma.ts_modedegradeGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_modedegradeGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_modedegradeCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_modedegradeCountAggregateOutputType> | number
          }
        }
      }
      ts_parametre: {
        payload: Prisma.$ts_parametrePayload<ExtArgs>
        fields: Prisma.ts_parametreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ts_parametreFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_parametrePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ts_parametreFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_parametrePayload>
          }
          findFirst: {
            args: Prisma.ts_parametreFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_parametrePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ts_parametreFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_parametrePayload>
          }
          findMany: {
            args: Prisma.ts_parametreFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_parametrePayload>[]
          }
          create: {
            args: Prisma.ts_parametreCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_parametrePayload>
          }
          createMany: {
            args: Prisma.ts_parametreCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.ts_parametreDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_parametrePayload>
          }
          update: {
            args: Prisma.ts_parametreUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_parametrePayload>
          }
          deleteMany: {
            args: Prisma.ts_parametreDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ts_parametreUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ts_parametreUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ts_parametrePayload>
          }
          aggregate: {
            args: Prisma.Ts_parametreAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTs_parametre>
          }
          groupBy: {
            args: Prisma.ts_parametreGroupByArgs<ExtArgs>
            result: $Utils.Optional<Ts_parametreGroupByOutputType>[]
          }
          count: {
            args: Prisma.ts_parametreCountArgs<ExtArgs>
            result: $Utils.Optional<Ts_parametreCountAggregateOutputType> | number
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
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
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
  }
  export type GlobalOmitConfig = {
    ts_compteur_idtable?: ts_compteur_idtableOmit
    ts_graphique?: ts_graphiqueOmit
    ts_journal?: ts_journalOmit
    ts_journal_code?: ts_journal_codeOmit
    ts_journalhisto?: ts_journalhistoOmit
    ts_logmesures?: ts_logmesuresOmit
    ts_mesure?: ts_mesureOmit
    ts_mesurecalibrage?: ts_mesurecalibrageOmit
    ts_mesurecalibrageetalon?: ts_mesurecalibrageetalonOmit
    ts_mesureetalon?: ts_mesureetalonOmit
    ts_mesureetalonnage?: ts_mesureetalonnageOmit
    ts_mesurehisto?: ts_mesurehistoOmit
    ts_mesuretest?: ts_mesuretestOmit
    ts_mesuretestetalon?: ts_mesuretestetalonOmit
    ts_modedegrade?: ts_modedegradeOmit
    ts_parametre?: ts_parametreOmit
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
   * Models
   */

  /**
   * Model ts_compteur_idtable
   */

  export type AggregateTs_compteur_idtable = {
    _count: Ts_compteur_idtableCountAggregateOutputType | null
    _avg: Ts_compteur_idtableAvgAggregateOutputType | null
    _sum: Ts_compteur_idtableSumAggregateOutputType | null
    _min: Ts_compteur_idtableMinAggregateOutputType | null
    _max: Ts_compteur_idtableMaxAggregateOutputType | null
  }

  export type Ts_compteur_idtableAvgAggregateOutputType = {
    IdServeurBDD: number | null
    CompteurID: number | null
  }

  export type Ts_compteur_idtableSumAggregateOutputType = {
    IdServeurBDD: number | null
    CompteurID: number | null
  }

  export type Ts_compteur_idtableMinAggregateOutputType = {
    IdServeurBDD: number | null
    NomTable: string | null
    CompteurID: number | null
  }

  export type Ts_compteur_idtableMaxAggregateOutputType = {
    IdServeurBDD: number | null
    NomTable: string | null
    CompteurID: number | null
  }

  export type Ts_compteur_idtableCountAggregateOutputType = {
    IdServeurBDD: number
    NomTable: number
    CompteurID: number
    _all: number
  }


  export type Ts_compteur_idtableAvgAggregateInputType = {
    IdServeurBDD?: true
    CompteurID?: true
  }

  export type Ts_compteur_idtableSumAggregateInputType = {
    IdServeurBDD?: true
    CompteurID?: true
  }

  export type Ts_compteur_idtableMinAggregateInputType = {
    IdServeurBDD?: true
    NomTable?: true
    CompteurID?: true
  }

  export type Ts_compteur_idtableMaxAggregateInputType = {
    IdServeurBDD?: true
    NomTable?: true
    CompteurID?: true
  }

  export type Ts_compteur_idtableCountAggregateInputType = {
    IdServeurBDD?: true
    NomTable?: true
    CompteurID?: true
    _all?: true
  }

  export type Ts_compteur_idtableAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_compteur_idtable to aggregate.
     */
    where?: ts_compteur_idtableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_compteur_idtables to fetch.
     */
    orderBy?: ts_compteur_idtableOrderByWithRelationInput | ts_compteur_idtableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_compteur_idtableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_compteur_idtables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_compteur_idtables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_compteur_idtables
    **/
    _count?: true | Ts_compteur_idtableCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_compteur_idtableAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_compteur_idtableSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_compteur_idtableMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_compteur_idtableMaxAggregateInputType
  }

  export type GetTs_compteur_idtableAggregateType<T extends Ts_compteur_idtableAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_compteur_idtable]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_compteur_idtable[P]>
      : GetScalarType<T[P], AggregateTs_compteur_idtable[P]>
  }




  export type ts_compteur_idtableGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_compteur_idtableWhereInput
    orderBy?: ts_compteur_idtableOrderByWithAggregationInput | ts_compteur_idtableOrderByWithAggregationInput[]
    by: Ts_compteur_idtableScalarFieldEnum[] | Ts_compteur_idtableScalarFieldEnum
    having?: ts_compteur_idtableScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_compteur_idtableCountAggregateInputType | true
    _avg?: Ts_compteur_idtableAvgAggregateInputType
    _sum?: Ts_compteur_idtableSumAggregateInputType
    _min?: Ts_compteur_idtableMinAggregateInputType
    _max?: Ts_compteur_idtableMaxAggregateInputType
  }

  export type Ts_compteur_idtableGroupByOutputType = {
    IdServeurBDD: number
    NomTable: string
    CompteurID: number
    _count: Ts_compteur_idtableCountAggregateOutputType | null
    _avg: Ts_compteur_idtableAvgAggregateOutputType | null
    _sum: Ts_compteur_idtableSumAggregateOutputType | null
    _min: Ts_compteur_idtableMinAggregateOutputType | null
    _max: Ts_compteur_idtableMaxAggregateOutputType | null
  }

  type GetTs_compteur_idtableGroupByPayload<T extends ts_compteur_idtableGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_compteur_idtableGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_compteur_idtableGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_compteur_idtableGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_compteur_idtableGroupByOutputType[P]>
        }
      >
    >


  export type ts_compteur_idtableSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    NomTable?: boolean
    CompteurID?: boolean
  }, ExtArgs["result"]["ts_compteur_idtable"]>



  export type ts_compteur_idtableSelectScalar = {
    IdServeurBDD?: boolean
    NomTable?: boolean
    CompteurID?: boolean
  }

  export type ts_compteur_idtableOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "NomTable" | "CompteurID", ExtArgs["result"]["ts_compteur_idtable"]>

  export type $ts_compteur_idtablePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_compteur_idtable"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      NomTable: string
      CompteurID: number
    }, ExtArgs["result"]["ts_compteur_idtable"]>
    composites: {}
  }

  type ts_compteur_idtableGetPayload<S extends boolean | null | undefined | ts_compteur_idtableDefaultArgs> = $Result.GetResult<Prisma.$ts_compteur_idtablePayload, S>

  type ts_compteur_idtableCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_compteur_idtableFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_compteur_idtableCountAggregateInputType | true
    }

  export interface ts_compteur_idtableDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_compteur_idtable'], meta: { name: 'ts_compteur_idtable' } }
    /**
     * Find zero or one Ts_compteur_idtable that matches the filter.
     * @param {ts_compteur_idtableFindUniqueArgs} args - Arguments to find a Ts_compteur_idtable
     * @example
     * // Get one Ts_compteur_idtable
     * const ts_compteur_idtable = await prisma.ts_compteur_idtable.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_compteur_idtableFindUniqueArgs>(args: SelectSubset<T, ts_compteur_idtableFindUniqueArgs<ExtArgs>>): Prisma__ts_compteur_idtableClient<$Result.GetResult<Prisma.$ts_compteur_idtablePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_compteur_idtable that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_compteur_idtableFindUniqueOrThrowArgs} args - Arguments to find a Ts_compteur_idtable
     * @example
     * // Get one Ts_compteur_idtable
     * const ts_compteur_idtable = await prisma.ts_compteur_idtable.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_compteur_idtableFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_compteur_idtableFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_compteur_idtableClient<$Result.GetResult<Prisma.$ts_compteur_idtablePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_compteur_idtable that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_compteur_idtableFindFirstArgs} args - Arguments to find a Ts_compteur_idtable
     * @example
     * // Get one Ts_compteur_idtable
     * const ts_compteur_idtable = await prisma.ts_compteur_idtable.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_compteur_idtableFindFirstArgs>(args?: SelectSubset<T, ts_compteur_idtableFindFirstArgs<ExtArgs>>): Prisma__ts_compteur_idtableClient<$Result.GetResult<Prisma.$ts_compteur_idtablePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_compteur_idtable that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_compteur_idtableFindFirstOrThrowArgs} args - Arguments to find a Ts_compteur_idtable
     * @example
     * // Get one Ts_compteur_idtable
     * const ts_compteur_idtable = await prisma.ts_compteur_idtable.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_compteur_idtableFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_compteur_idtableFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_compteur_idtableClient<$Result.GetResult<Prisma.$ts_compteur_idtablePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_compteur_idtables that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_compteur_idtableFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_compteur_idtables
     * const ts_compteur_idtables = await prisma.ts_compteur_idtable.findMany()
     * 
     * // Get first 10 Ts_compteur_idtables
     * const ts_compteur_idtables = await prisma.ts_compteur_idtable.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_compteur_idtableWithIdServeurBDDOnly = await prisma.ts_compteur_idtable.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_compteur_idtableFindManyArgs>(args?: SelectSubset<T, ts_compteur_idtableFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_compteur_idtablePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_compteur_idtable.
     * @param {ts_compteur_idtableCreateArgs} args - Arguments to create a Ts_compteur_idtable.
     * @example
     * // Create one Ts_compteur_idtable
     * const Ts_compteur_idtable = await prisma.ts_compteur_idtable.create({
     *   data: {
     *     // ... data to create a Ts_compteur_idtable
     *   }
     * })
     * 
     */
    create<T extends ts_compteur_idtableCreateArgs>(args: SelectSubset<T, ts_compteur_idtableCreateArgs<ExtArgs>>): Prisma__ts_compteur_idtableClient<$Result.GetResult<Prisma.$ts_compteur_idtablePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_compteur_idtables.
     * @param {ts_compteur_idtableCreateManyArgs} args - Arguments to create many Ts_compteur_idtables.
     * @example
     * // Create many Ts_compteur_idtables
     * const ts_compteur_idtable = await prisma.ts_compteur_idtable.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_compteur_idtableCreateManyArgs>(args?: SelectSubset<T, ts_compteur_idtableCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_compteur_idtable.
     * @param {ts_compteur_idtableDeleteArgs} args - Arguments to delete one Ts_compteur_idtable.
     * @example
     * // Delete one Ts_compteur_idtable
     * const Ts_compteur_idtable = await prisma.ts_compteur_idtable.delete({
     *   where: {
     *     // ... filter to delete one Ts_compteur_idtable
     *   }
     * })
     * 
     */
    delete<T extends ts_compteur_idtableDeleteArgs>(args: SelectSubset<T, ts_compteur_idtableDeleteArgs<ExtArgs>>): Prisma__ts_compteur_idtableClient<$Result.GetResult<Prisma.$ts_compteur_idtablePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_compteur_idtable.
     * @param {ts_compteur_idtableUpdateArgs} args - Arguments to update one Ts_compteur_idtable.
     * @example
     * // Update one Ts_compteur_idtable
     * const ts_compteur_idtable = await prisma.ts_compteur_idtable.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_compteur_idtableUpdateArgs>(args: SelectSubset<T, ts_compteur_idtableUpdateArgs<ExtArgs>>): Prisma__ts_compteur_idtableClient<$Result.GetResult<Prisma.$ts_compteur_idtablePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_compteur_idtables.
     * @param {ts_compteur_idtableDeleteManyArgs} args - Arguments to filter Ts_compteur_idtables to delete.
     * @example
     * // Delete a few Ts_compteur_idtables
     * const { count } = await prisma.ts_compteur_idtable.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_compteur_idtableDeleteManyArgs>(args?: SelectSubset<T, ts_compteur_idtableDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_compteur_idtables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_compteur_idtableUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_compteur_idtables
     * const ts_compteur_idtable = await prisma.ts_compteur_idtable.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_compteur_idtableUpdateManyArgs>(args: SelectSubset<T, ts_compteur_idtableUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_compteur_idtable.
     * @param {ts_compteur_idtableUpsertArgs} args - Arguments to update or create a Ts_compteur_idtable.
     * @example
     * // Update or create a Ts_compteur_idtable
     * const ts_compteur_idtable = await prisma.ts_compteur_idtable.upsert({
     *   create: {
     *     // ... data to create a Ts_compteur_idtable
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_compteur_idtable we want to update
     *   }
     * })
     */
    upsert<T extends ts_compteur_idtableUpsertArgs>(args: SelectSubset<T, ts_compteur_idtableUpsertArgs<ExtArgs>>): Prisma__ts_compteur_idtableClient<$Result.GetResult<Prisma.$ts_compteur_idtablePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_compteur_idtables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_compteur_idtableCountArgs} args - Arguments to filter Ts_compteur_idtables to count.
     * @example
     * // Count the number of Ts_compteur_idtables
     * const count = await prisma.ts_compteur_idtable.count({
     *   where: {
     *     // ... the filter for the Ts_compteur_idtables we want to count
     *   }
     * })
    **/
    count<T extends ts_compteur_idtableCountArgs>(
      args?: Subset<T, ts_compteur_idtableCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_compteur_idtableCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_compteur_idtable.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_compteur_idtableAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_compteur_idtableAggregateArgs>(args: Subset<T, Ts_compteur_idtableAggregateArgs>): Prisma.PrismaPromise<GetTs_compteur_idtableAggregateType<T>>

    /**
     * Group by Ts_compteur_idtable.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_compteur_idtableGroupByArgs} args - Group by arguments.
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
      T extends ts_compteur_idtableGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_compteur_idtableGroupByArgs['orderBy'] }
        : { orderBy?: ts_compteur_idtableGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_compteur_idtableGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_compteur_idtableGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_compteur_idtable model
   */
  readonly fields: ts_compteur_idtableFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_compteur_idtable.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_compteur_idtableClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_compteur_idtable model
   */
  interface ts_compteur_idtableFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_compteur_idtable", 'Int'>
    readonly NomTable: FieldRef<"ts_compteur_idtable", 'String'>
    readonly CompteurID: FieldRef<"ts_compteur_idtable", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ts_compteur_idtable findUnique
   */
  export type ts_compteur_idtableFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
    /**
     * Filter, which ts_compteur_idtable to fetch.
     */
    where: ts_compteur_idtableWhereUniqueInput
  }

  /**
   * ts_compteur_idtable findUniqueOrThrow
   */
  export type ts_compteur_idtableFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
    /**
     * Filter, which ts_compteur_idtable to fetch.
     */
    where: ts_compteur_idtableWhereUniqueInput
  }

  /**
   * ts_compteur_idtable findFirst
   */
  export type ts_compteur_idtableFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
    /**
     * Filter, which ts_compteur_idtable to fetch.
     */
    where?: ts_compteur_idtableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_compteur_idtables to fetch.
     */
    orderBy?: ts_compteur_idtableOrderByWithRelationInput | ts_compteur_idtableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_compteur_idtables.
     */
    cursor?: ts_compteur_idtableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_compteur_idtables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_compteur_idtables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_compteur_idtables.
     */
    distinct?: Ts_compteur_idtableScalarFieldEnum | Ts_compteur_idtableScalarFieldEnum[]
  }

  /**
   * ts_compteur_idtable findFirstOrThrow
   */
  export type ts_compteur_idtableFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
    /**
     * Filter, which ts_compteur_idtable to fetch.
     */
    where?: ts_compteur_idtableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_compteur_idtables to fetch.
     */
    orderBy?: ts_compteur_idtableOrderByWithRelationInput | ts_compteur_idtableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_compteur_idtables.
     */
    cursor?: ts_compteur_idtableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_compteur_idtables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_compteur_idtables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_compteur_idtables.
     */
    distinct?: Ts_compteur_idtableScalarFieldEnum | Ts_compteur_idtableScalarFieldEnum[]
  }

  /**
   * ts_compteur_idtable findMany
   */
  export type ts_compteur_idtableFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
    /**
     * Filter, which ts_compteur_idtables to fetch.
     */
    where?: ts_compteur_idtableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_compteur_idtables to fetch.
     */
    orderBy?: ts_compteur_idtableOrderByWithRelationInput | ts_compteur_idtableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_compteur_idtables.
     */
    cursor?: ts_compteur_idtableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_compteur_idtables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_compteur_idtables.
     */
    skip?: number
    distinct?: Ts_compteur_idtableScalarFieldEnum | Ts_compteur_idtableScalarFieldEnum[]
  }

  /**
   * ts_compteur_idtable create
   */
  export type ts_compteur_idtableCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_compteur_idtable.
     */
    data: XOR<ts_compteur_idtableCreateInput, ts_compteur_idtableUncheckedCreateInput>
  }

  /**
   * ts_compteur_idtable createMany
   */
  export type ts_compteur_idtableCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_compteur_idtables.
     */
    data: ts_compteur_idtableCreateManyInput | ts_compteur_idtableCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_compteur_idtable update
   */
  export type ts_compteur_idtableUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_compteur_idtable.
     */
    data: XOR<ts_compteur_idtableUpdateInput, ts_compteur_idtableUncheckedUpdateInput>
    /**
     * Choose, which ts_compteur_idtable to update.
     */
    where: ts_compteur_idtableWhereUniqueInput
  }

  /**
   * ts_compteur_idtable updateMany
   */
  export type ts_compteur_idtableUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_compteur_idtables.
     */
    data: XOR<ts_compteur_idtableUpdateManyMutationInput, ts_compteur_idtableUncheckedUpdateManyInput>
    /**
     * Filter which ts_compteur_idtables to update
     */
    where?: ts_compteur_idtableWhereInput
    /**
     * Limit how many ts_compteur_idtables to update.
     */
    limit?: number
  }

  /**
   * ts_compteur_idtable upsert
   */
  export type ts_compteur_idtableUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_compteur_idtable to update in case it exists.
     */
    where: ts_compteur_idtableWhereUniqueInput
    /**
     * In case the ts_compteur_idtable found by the `where` argument doesn't exist, create a new ts_compteur_idtable with this data.
     */
    create: XOR<ts_compteur_idtableCreateInput, ts_compteur_idtableUncheckedCreateInput>
    /**
     * In case the ts_compteur_idtable was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_compteur_idtableUpdateInput, ts_compteur_idtableUncheckedUpdateInput>
  }

  /**
   * ts_compteur_idtable delete
   */
  export type ts_compteur_idtableDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
    /**
     * Filter which ts_compteur_idtable to delete.
     */
    where: ts_compteur_idtableWhereUniqueInput
  }

  /**
   * ts_compteur_idtable deleteMany
   */
  export type ts_compteur_idtableDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_compteur_idtables to delete
     */
    where?: ts_compteur_idtableWhereInput
    /**
     * Limit how many ts_compteur_idtables to delete.
     */
    limit?: number
  }

  /**
   * ts_compteur_idtable without action
   */
  export type ts_compteur_idtableDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_compteur_idtable
     */
    select?: ts_compteur_idtableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_compteur_idtable
     */
    omit?: ts_compteur_idtableOmit<ExtArgs> | null
  }


  /**
   * Model ts_graphique
   */

  export type AggregateTs_graphique = {
    _count: Ts_graphiqueCountAggregateOutputType | null
    _avg: Ts_graphiqueAvgAggregateOutputType | null
    _sum: Ts_graphiqueSumAggregateOutputType | null
    _min: Ts_graphiqueMinAggregateOutputType | null
    _max: Ts_graphiqueMaxAggregateOutputType | null
  }

  export type Ts_graphiqueAvgAggregateOutputType = {
    IdGraphique: number | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Etat_Alarme: number | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
  }

  export type Ts_graphiqueSumAggregateOutputType = {
    IdGraphique: number | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Etat_Alarme: number | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
  }

  export type Ts_graphiqueMinAggregateOutputType = {
    IdGraphique: number | null
    DateHeureMesure: Date | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    SondeNumeroSerie: string | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Etat_Alarme: number | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
  }

  export type Ts_graphiqueMaxAggregateOutputType = {
    IdGraphique: number | null
    DateHeureMesure: Date | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    SondeNumeroSerie: string | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Etat_Alarme: number | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
  }

  export type Ts_graphiqueCountAggregateOutputType = {
    IdGraphique: number
    DateHeureMesure: number
    Valeur: number
    Resistance: number
    Nb_decimal: number
    Consigne: number
    Consigne_Sup: number
    Consigne_Inf: number
    Unite: number
    SondeNumeroSerie: number
    IdLieu: number
    ValeurNull: number
    Frequence: number
    Etat_Alarme: number
    Consigne_Inf_PreAlarme: number
    Consigne_Sup_PreAlarme: number
    _all: number
  }


  export type Ts_graphiqueAvgAggregateInputType = {
    IdGraphique?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
  }

  export type Ts_graphiqueSumAggregateInputType = {
    IdGraphique?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
  }

  export type Ts_graphiqueMinAggregateInputType = {
    IdGraphique?: true
    DateHeureMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    SondeNumeroSerie?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
  }

  export type Ts_graphiqueMaxAggregateInputType = {
    IdGraphique?: true
    DateHeureMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    SondeNumeroSerie?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
  }

  export type Ts_graphiqueCountAggregateInputType = {
    IdGraphique?: true
    DateHeureMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    SondeNumeroSerie?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    _all?: true
  }

  export type Ts_graphiqueAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_graphique to aggregate.
     */
    where?: ts_graphiqueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_graphiques to fetch.
     */
    orderBy?: ts_graphiqueOrderByWithRelationInput | ts_graphiqueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_graphiqueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_graphiques from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_graphiques.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_graphiques
    **/
    _count?: true | Ts_graphiqueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_graphiqueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_graphiqueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_graphiqueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_graphiqueMaxAggregateInputType
  }

  export type GetTs_graphiqueAggregateType<T extends Ts_graphiqueAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_graphique]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_graphique[P]>
      : GetScalarType<T[P], AggregateTs_graphique[P]>
  }




  export type ts_graphiqueGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_graphiqueWhereInput
    orderBy?: ts_graphiqueOrderByWithAggregationInput | ts_graphiqueOrderByWithAggregationInput[]
    by: Ts_graphiqueScalarFieldEnum[] | Ts_graphiqueScalarFieldEnum
    having?: ts_graphiqueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_graphiqueCountAggregateInputType | true
    _avg?: Ts_graphiqueAvgAggregateInputType
    _sum?: Ts_graphiqueSumAggregateInputType
    _min?: Ts_graphiqueMinAggregateInputType
    _max?: Ts_graphiqueMaxAggregateInputType
  }

  export type Ts_graphiqueGroupByOutputType = {
    IdGraphique: number
    DateHeureMesure: Date
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    SondeNumeroSerie: string | null
    IdLieu: number
    ValeurNull: number
    Frequence: number | null
    Etat_Alarme: number
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    _count: Ts_graphiqueCountAggregateOutputType | null
    _avg: Ts_graphiqueAvgAggregateOutputType | null
    _sum: Ts_graphiqueSumAggregateOutputType | null
    _min: Ts_graphiqueMinAggregateOutputType | null
    _max: Ts_graphiqueMaxAggregateOutputType | null
  }

  type GetTs_graphiqueGroupByPayload<T extends ts_graphiqueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_graphiqueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_graphiqueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_graphiqueGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_graphiqueGroupByOutputType[P]>
        }
      >
    >


  export type ts_graphiqueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdGraphique?: boolean
    DateHeureMesure?: boolean
    Valeur?: boolean
    Resistance?: boolean
    Nb_decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    SondeNumeroSerie?: boolean
    IdLieu?: boolean
    ValeurNull?: boolean
    Frequence?: boolean
    Etat_Alarme?: boolean
    Consigne_Inf_PreAlarme?: boolean
    Consigne_Sup_PreAlarme?: boolean
  }, ExtArgs["result"]["ts_graphique"]>



  export type ts_graphiqueSelectScalar = {
    IdGraphique?: boolean
    DateHeureMesure?: boolean
    Valeur?: boolean
    Resistance?: boolean
    Nb_decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    SondeNumeroSerie?: boolean
    IdLieu?: boolean
    ValeurNull?: boolean
    Frequence?: boolean
    Etat_Alarme?: boolean
    Consigne_Inf_PreAlarme?: boolean
    Consigne_Sup_PreAlarme?: boolean
  }

  export type ts_graphiqueOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdGraphique" | "DateHeureMesure" | "Valeur" | "Resistance" | "Nb_decimal" | "Consigne" | "Consigne_Sup" | "Consigne_Inf" | "Unite" | "SondeNumeroSerie" | "IdLieu" | "ValeurNull" | "Frequence" | "Etat_Alarme" | "Consigne_Inf_PreAlarme" | "Consigne_Sup_PreAlarme", ExtArgs["result"]["ts_graphique"]>

  export type $ts_graphiquePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_graphique"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdGraphique: number
      DateHeureMesure: Date
      Valeur: number | null
      Resistance: number | null
      Nb_decimal: number | null
      Consigne: number | null
      Consigne_Sup: number | null
      Consigne_Inf: number | null
      Unite: string | null
      SondeNumeroSerie: string | null
      IdLieu: number
      ValeurNull: number
      Frequence: number | null
      Etat_Alarme: number
      Consigne_Inf_PreAlarme: number | null
      Consigne_Sup_PreAlarme: number | null
    }, ExtArgs["result"]["ts_graphique"]>
    composites: {}
  }

  type ts_graphiqueGetPayload<S extends boolean | null | undefined | ts_graphiqueDefaultArgs> = $Result.GetResult<Prisma.$ts_graphiquePayload, S>

  type ts_graphiqueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_graphiqueFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_graphiqueCountAggregateInputType | true
    }

  export interface ts_graphiqueDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_graphique'], meta: { name: 'ts_graphique' } }
    /**
     * Find zero or one Ts_graphique that matches the filter.
     * @param {ts_graphiqueFindUniqueArgs} args - Arguments to find a Ts_graphique
     * @example
     * // Get one Ts_graphique
     * const ts_graphique = await prisma.ts_graphique.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_graphiqueFindUniqueArgs>(args: SelectSubset<T, ts_graphiqueFindUniqueArgs<ExtArgs>>): Prisma__ts_graphiqueClient<$Result.GetResult<Prisma.$ts_graphiquePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_graphique that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_graphiqueFindUniqueOrThrowArgs} args - Arguments to find a Ts_graphique
     * @example
     * // Get one Ts_graphique
     * const ts_graphique = await prisma.ts_graphique.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_graphiqueFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_graphiqueFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_graphiqueClient<$Result.GetResult<Prisma.$ts_graphiquePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_graphique that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_graphiqueFindFirstArgs} args - Arguments to find a Ts_graphique
     * @example
     * // Get one Ts_graphique
     * const ts_graphique = await prisma.ts_graphique.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_graphiqueFindFirstArgs>(args?: SelectSubset<T, ts_graphiqueFindFirstArgs<ExtArgs>>): Prisma__ts_graphiqueClient<$Result.GetResult<Prisma.$ts_graphiquePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_graphique that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_graphiqueFindFirstOrThrowArgs} args - Arguments to find a Ts_graphique
     * @example
     * // Get one Ts_graphique
     * const ts_graphique = await prisma.ts_graphique.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_graphiqueFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_graphiqueFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_graphiqueClient<$Result.GetResult<Prisma.$ts_graphiquePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_graphiques that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_graphiqueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_graphiques
     * const ts_graphiques = await prisma.ts_graphique.findMany()
     * 
     * // Get first 10 Ts_graphiques
     * const ts_graphiques = await prisma.ts_graphique.findMany({ take: 10 })
     * 
     * // Only select the `IdGraphique`
     * const ts_graphiqueWithIdGraphiqueOnly = await prisma.ts_graphique.findMany({ select: { IdGraphique: true } })
     * 
     */
    findMany<T extends ts_graphiqueFindManyArgs>(args?: SelectSubset<T, ts_graphiqueFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_graphiquePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_graphique.
     * @param {ts_graphiqueCreateArgs} args - Arguments to create a Ts_graphique.
     * @example
     * // Create one Ts_graphique
     * const Ts_graphique = await prisma.ts_graphique.create({
     *   data: {
     *     // ... data to create a Ts_graphique
     *   }
     * })
     * 
     */
    create<T extends ts_graphiqueCreateArgs>(args: SelectSubset<T, ts_graphiqueCreateArgs<ExtArgs>>): Prisma__ts_graphiqueClient<$Result.GetResult<Prisma.$ts_graphiquePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_graphiques.
     * @param {ts_graphiqueCreateManyArgs} args - Arguments to create many Ts_graphiques.
     * @example
     * // Create many Ts_graphiques
     * const ts_graphique = await prisma.ts_graphique.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_graphiqueCreateManyArgs>(args?: SelectSubset<T, ts_graphiqueCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_graphique.
     * @param {ts_graphiqueDeleteArgs} args - Arguments to delete one Ts_graphique.
     * @example
     * // Delete one Ts_graphique
     * const Ts_graphique = await prisma.ts_graphique.delete({
     *   where: {
     *     // ... filter to delete one Ts_graphique
     *   }
     * })
     * 
     */
    delete<T extends ts_graphiqueDeleteArgs>(args: SelectSubset<T, ts_graphiqueDeleteArgs<ExtArgs>>): Prisma__ts_graphiqueClient<$Result.GetResult<Prisma.$ts_graphiquePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_graphique.
     * @param {ts_graphiqueUpdateArgs} args - Arguments to update one Ts_graphique.
     * @example
     * // Update one Ts_graphique
     * const ts_graphique = await prisma.ts_graphique.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_graphiqueUpdateArgs>(args: SelectSubset<T, ts_graphiqueUpdateArgs<ExtArgs>>): Prisma__ts_graphiqueClient<$Result.GetResult<Prisma.$ts_graphiquePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_graphiques.
     * @param {ts_graphiqueDeleteManyArgs} args - Arguments to filter Ts_graphiques to delete.
     * @example
     * // Delete a few Ts_graphiques
     * const { count } = await prisma.ts_graphique.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_graphiqueDeleteManyArgs>(args?: SelectSubset<T, ts_graphiqueDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_graphiques.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_graphiqueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_graphiques
     * const ts_graphique = await prisma.ts_graphique.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_graphiqueUpdateManyArgs>(args: SelectSubset<T, ts_graphiqueUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_graphique.
     * @param {ts_graphiqueUpsertArgs} args - Arguments to update or create a Ts_graphique.
     * @example
     * // Update or create a Ts_graphique
     * const ts_graphique = await prisma.ts_graphique.upsert({
     *   create: {
     *     // ... data to create a Ts_graphique
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_graphique we want to update
     *   }
     * })
     */
    upsert<T extends ts_graphiqueUpsertArgs>(args: SelectSubset<T, ts_graphiqueUpsertArgs<ExtArgs>>): Prisma__ts_graphiqueClient<$Result.GetResult<Prisma.$ts_graphiquePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_graphiques.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_graphiqueCountArgs} args - Arguments to filter Ts_graphiques to count.
     * @example
     * // Count the number of Ts_graphiques
     * const count = await prisma.ts_graphique.count({
     *   where: {
     *     // ... the filter for the Ts_graphiques we want to count
     *   }
     * })
    **/
    count<T extends ts_graphiqueCountArgs>(
      args?: Subset<T, ts_graphiqueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_graphiqueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_graphique.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_graphiqueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_graphiqueAggregateArgs>(args: Subset<T, Ts_graphiqueAggregateArgs>): Prisma.PrismaPromise<GetTs_graphiqueAggregateType<T>>

    /**
     * Group by Ts_graphique.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_graphiqueGroupByArgs} args - Group by arguments.
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
      T extends ts_graphiqueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_graphiqueGroupByArgs['orderBy'] }
        : { orderBy?: ts_graphiqueGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_graphiqueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_graphiqueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_graphique model
   */
  readonly fields: ts_graphiqueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_graphique.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_graphiqueClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_graphique model
   */
  interface ts_graphiqueFieldRefs {
    readonly IdGraphique: FieldRef<"ts_graphique", 'Int'>
    readonly DateHeureMesure: FieldRef<"ts_graphique", 'DateTime'>
    readonly Valeur: FieldRef<"ts_graphique", 'Float'>
    readonly Resistance: FieldRef<"ts_graphique", 'Float'>
    readonly Nb_decimal: FieldRef<"ts_graphique", 'Int'>
    readonly Consigne: FieldRef<"ts_graphique", 'Float'>
    readonly Consigne_Sup: FieldRef<"ts_graphique", 'Float'>
    readonly Consigne_Inf: FieldRef<"ts_graphique", 'Float'>
    readonly Unite: FieldRef<"ts_graphique", 'String'>
    readonly SondeNumeroSerie: FieldRef<"ts_graphique", 'String'>
    readonly IdLieu: FieldRef<"ts_graphique", 'Int'>
    readonly ValeurNull: FieldRef<"ts_graphique", 'Int'>
    readonly Frequence: FieldRef<"ts_graphique", 'Int'>
    readonly Etat_Alarme: FieldRef<"ts_graphique", 'Int'>
    readonly Consigne_Inf_PreAlarme: FieldRef<"ts_graphique", 'Float'>
    readonly Consigne_Sup_PreAlarme: FieldRef<"ts_graphique", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * ts_graphique findUnique
   */
  export type ts_graphiqueFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which ts_graphique to fetch.
     */
    where: ts_graphiqueWhereUniqueInput
  }

  /**
   * ts_graphique findUniqueOrThrow
   */
  export type ts_graphiqueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which ts_graphique to fetch.
     */
    where: ts_graphiqueWhereUniqueInput
  }

  /**
   * ts_graphique findFirst
   */
  export type ts_graphiqueFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which ts_graphique to fetch.
     */
    where?: ts_graphiqueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_graphiques to fetch.
     */
    orderBy?: ts_graphiqueOrderByWithRelationInput | ts_graphiqueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_graphiques.
     */
    cursor?: ts_graphiqueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_graphiques from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_graphiques.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_graphiques.
     */
    distinct?: Ts_graphiqueScalarFieldEnum | Ts_graphiqueScalarFieldEnum[]
  }

  /**
   * ts_graphique findFirstOrThrow
   */
  export type ts_graphiqueFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which ts_graphique to fetch.
     */
    where?: ts_graphiqueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_graphiques to fetch.
     */
    orderBy?: ts_graphiqueOrderByWithRelationInput | ts_graphiqueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_graphiques.
     */
    cursor?: ts_graphiqueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_graphiques from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_graphiques.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_graphiques.
     */
    distinct?: Ts_graphiqueScalarFieldEnum | Ts_graphiqueScalarFieldEnum[]
  }

  /**
   * ts_graphique findMany
   */
  export type ts_graphiqueFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which ts_graphiques to fetch.
     */
    where?: ts_graphiqueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_graphiques to fetch.
     */
    orderBy?: ts_graphiqueOrderByWithRelationInput | ts_graphiqueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_graphiques.
     */
    cursor?: ts_graphiqueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_graphiques from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_graphiques.
     */
    skip?: number
    distinct?: Ts_graphiqueScalarFieldEnum | Ts_graphiqueScalarFieldEnum[]
  }

  /**
   * ts_graphique create
   */
  export type ts_graphiqueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_graphique.
     */
    data: XOR<ts_graphiqueCreateInput, ts_graphiqueUncheckedCreateInput>
  }

  /**
   * ts_graphique createMany
   */
  export type ts_graphiqueCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_graphiques.
     */
    data: ts_graphiqueCreateManyInput | ts_graphiqueCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_graphique update
   */
  export type ts_graphiqueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_graphique.
     */
    data: XOR<ts_graphiqueUpdateInput, ts_graphiqueUncheckedUpdateInput>
    /**
     * Choose, which ts_graphique to update.
     */
    where: ts_graphiqueWhereUniqueInput
  }

  /**
   * ts_graphique updateMany
   */
  export type ts_graphiqueUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_graphiques.
     */
    data: XOR<ts_graphiqueUpdateManyMutationInput, ts_graphiqueUncheckedUpdateManyInput>
    /**
     * Filter which ts_graphiques to update
     */
    where?: ts_graphiqueWhereInput
    /**
     * Limit how many ts_graphiques to update.
     */
    limit?: number
  }

  /**
   * ts_graphique upsert
   */
  export type ts_graphiqueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_graphique to update in case it exists.
     */
    where: ts_graphiqueWhereUniqueInput
    /**
     * In case the ts_graphique found by the `where` argument doesn't exist, create a new ts_graphique with this data.
     */
    create: XOR<ts_graphiqueCreateInput, ts_graphiqueUncheckedCreateInput>
    /**
     * In case the ts_graphique was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_graphiqueUpdateInput, ts_graphiqueUncheckedUpdateInput>
  }

  /**
   * ts_graphique delete
   */
  export type ts_graphiqueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
    /**
     * Filter which ts_graphique to delete.
     */
    where: ts_graphiqueWhereUniqueInput
  }

  /**
   * ts_graphique deleteMany
   */
  export type ts_graphiqueDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_graphiques to delete
     */
    where?: ts_graphiqueWhereInput
    /**
     * Limit how many ts_graphiques to delete.
     */
    limit?: number
  }

  /**
   * ts_graphique without action
   */
  export type ts_graphiqueDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_graphique
     */
    select?: ts_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_graphique
     */
    omit?: ts_graphiqueOmit<ExtArgs> | null
  }


  /**
   * Model ts_journal
   */

  export type AggregateTs_journal = {
    _count: Ts_journalCountAggregateOutputType | null
    _avg: Ts_journalAvgAggregateOutputType | null
    _sum: Ts_journalSumAggregateOutputType | null
    _min: Ts_journalMinAggregateOutputType | null
    _max: Ts_journalMaxAggregateOutputType | null
  }

  export type Ts_journalAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdJournal: number | null
    IdLieu: number | null
  }

  export type Ts_journalSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdJournal: number | null
    IdLieu: number | null
  }

  export type Ts_journalMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdJournal: number | null
    CodeJournal: string | null
    Commentaire: string | null
    NomUtilisateur: string | null
    ProfilUtilisateur: string | null
    DateHeureJournal: Date | null
    IdLieu: number | null
    CommentaireUtilisateur: string | null
  }

  export type Ts_journalMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdJournal: number | null
    CodeJournal: string | null
    Commentaire: string | null
    NomUtilisateur: string | null
    ProfilUtilisateur: string | null
    DateHeureJournal: Date | null
    IdLieu: number | null
    CommentaireUtilisateur: string | null
  }

  export type Ts_journalCountAggregateOutputType = {
    IdServeurBDD: number
    IdJournal: number
    CodeJournal: number
    Commentaire: number
    NomUtilisateur: number
    ProfilUtilisateur: number
    DateHeureJournal: number
    IdLieu: number
    CommentaireUtilisateur: number
    _all: number
  }


  export type Ts_journalAvgAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    IdLieu?: true
  }

  export type Ts_journalSumAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    IdLieu?: true
  }

  export type Ts_journalMinAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    CodeJournal?: true
    Commentaire?: true
    NomUtilisateur?: true
    ProfilUtilisateur?: true
    DateHeureJournal?: true
    IdLieu?: true
    CommentaireUtilisateur?: true
  }

  export type Ts_journalMaxAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    CodeJournal?: true
    Commentaire?: true
    NomUtilisateur?: true
    ProfilUtilisateur?: true
    DateHeureJournal?: true
    IdLieu?: true
    CommentaireUtilisateur?: true
  }

  export type Ts_journalCountAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    CodeJournal?: true
    Commentaire?: true
    NomUtilisateur?: true
    ProfilUtilisateur?: true
    DateHeureJournal?: true
    IdLieu?: true
    CommentaireUtilisateur?: true
    _all?: true
  }

  export type Ts_journalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_journal to aggregate.
     */
    where?: ts_journalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journals to fetch.
     */
    orderBy?: ts_journalOrderByWithRelationInput | ts_journalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_journalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_journals
    **/
    _count?: true | Ts_journalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_journalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_journalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_journalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_journalMaxAggregateInputType
  }

  export type GetTs_journalAggregateType<T extends Ts_journalAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_journal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_journal[P]>
      : GetScalarType<T[P], AggregateTs_journal[P]>
  }




  export type ts_journalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_journalWhereInput
    orderBy?: ts_journalOrderByWithAggregationInput | ts_journalOrderByWithAggregationInput[]
    by: Ts_journalScalarFieldEnum[] | Ts_journalScalarFieldEnum
    having?: ts_journalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_journalCountAggregateInputType | true
    _avg?: Ts_journalAvgAggregateInputType
    _sum?: Ts_journalSumAggregateInputType
    _min?: Ts_journalMinAggregateInputType
    _max?: Ts_journalMaxAggregateInputType
  }

  export type Ts_journalGroupByOutputType = {
    IdServeurBDD: number
    IdJournal: number
    CodeJournal: string | null
    Commentaire: string | null
    NomUtilisateur: string | null
    ProfilUtilisateur: string | null
    DateHeureJournal: Date | null
    IdLieu: number | null
    CommentaireUtilisateur: string | null
    _count: Ts_journalCountAggregateOutputType | null
    _avg: Ts_journalAvgAggregateOutputType | null
    _sum: Ts_journalSumAggregateOutputType | null
    _min: Ts_journalMinAggregateOutputType | null
    _max: Ts_journalMaxAggregateOutputType | null
  }

  type GetTs_journalGroupByPayload<T extends ts_journalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_journalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_journalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_journalGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_journalGroupByOutputType[P]>
        }
      >
    >


  export type ts_journalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdJournal?: boolean
    CodeJournal?: boolean
    Commentaire?: boolean
    NomUtilisateur?: boolean
    ProfilUtilisateur?: boolean
    DateHeureJournal?: boolean
    IdLieu?: boolean
    CommentaireUtilisateur?: boolean
  }, ExtArgs["result"]["ts_journal"]>



  export type ts_journalSelectScalar = {
    IdServeurBDD?: boolean
    IdJournal?: boolean
    CodeJournal?: boolean
    Commentaire?: boolean
    NomUtilisateur?: boolean
    ProfilUtilisateur?: boolean
    DateHeureJournal?: boolean
    IdLieu?: boolean
    CommentaireUtilisateur?: boolean
  }

  export type ts_journalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdJournal" | "CodeJournal" | "Commentaire" | "NomUtilisateur" | "ProfilUtilisateur" | "DateHeureJournal" | "IdLieu" | "CommentaireUtilisateur", ExtArgs["result"]["ts_journal"]>

  export type $ts_journalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_journal"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdJournal: number
      CodeJournal: string | null
      Commentaire: string | null
      NomUtilisateur: string | null
      ProfilUtilisateur: string | null
      DateHeureJournal: Date | null
      IdLieu: number | null
      CommentaireUtilisateur: string | null
    }, ExtArgs["result"]["ts_journal"]>
    composites: {}
  }

  type ts_journalGetPayload<S extends boolean | null | undefined | ts_journalDefaultArgs> = $Result.GetResult<Prisma.$ts_journalPayload, S>

  type ts_journalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_journalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_journalCountAggregateInputType | true
    }

  export interface ts_journalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_journal'], meta: { name: 'ts_journal' } }
    /**
     * Find zero or one Ts_journal that matches the filter.
     * @param {ts_journalFindUniqueArgs} args - Arguments to find a Ts_journal
     * @example
     * // Get one Ts_journal
     * const ts_journal = await prisma.ts_journal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_journalFindUniqueArgs>(args: SelectSubset<T, ts_journalFindUniqueArgs<ExtArgs>>): Prisma__ts_journalClient<$Result.GetResult<Prisma.$ts_journalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_journal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_journalFindUniqueOrThrowArgs} args - Arguments to find a Ts_journal
     * @example
     * // Get one Ts_journal
     * const ts_journal = await prisma.ts_journal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_journalFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_journalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_journalClient<$Result.GetResult<Prisma.$ts_journalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_journal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalFindFirstArgs} args - Arguments to find a Ts_journal
     * @example
     * // Get one Ts_journal
     * const ts_journal = await prisma.ts_journal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_journalFindFirstArgs>(args?: SelectSubset<T, ts_journalFindFirstArgs<ExtArgs>>): Prisma__ts_journalClient<$Result.GetResult<Prisma.$ts_journalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_journal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalFindFirstOrThrowArgs} args - Arguments to find a Ts_journal
     * @example
     * // Get one Ts_journal
     * const ts_journal = await prisma.ts_journal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_journalFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_journalFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_journalClient<$Result.GetResult<Prisma.$ts_journalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_journals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_journals
     * const ts_journals = await prisma.ts_journal.findMany()
     * 
     * // Get first 10 Ts_journals
     * const ts_journals = await prisma.ts_journal.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_journalWithIdServeurBDDOnly = await prisma.ts_journal.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_journalFindManyArgs>(args?: SelectSubset<T, ts_journalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_journalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_journal.
     * @param {ts_journalCreateArgs} args - Arguments to create a Ts_journal.
     * @example
     * // Create one Ts_journal
     * const Ts_journal = await prisma.ts_journal.create({
     *   data: {
     *     // ... data to create a Ts_journal
     *   }
     * })
     * 
     */
    create<T extends ts_journalCreateArgs>(args: SelectSubset<T, ts_journalCreateArgs<ExtArgs>>): Prisma__ts_journalClient<$Result.GetResult<Prisma.$ts_journalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_journals.
     * @param {ts_journalCreateManyArgs} args - Arguments to create many Ts_journals.
     * @example
     * // Create many Ts_journals
     * const ts_journal = await prisma.ts_journal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_journalCreateManyArgs>(args?: SelectSubset<T, ts_journalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_journal.
     * @param {ts_journalDeleteArgs} args - Arguments to delete one Ts_journal.
     * @example
     * // Delete one Ts_journal
     * const Ts_journal = await prisma.ts_journal.delete({
     *   where: {
     *     // ... filter to delete one Ts_journal
     *   }
     * })
     * 
     */
    delete<T extends ts_journalDeleteArgs>(args: SelectSubset<T, ts_journalDeleteArgs<ExtArgs>>): Prisma__ts_journalClient<$Result.GetResult<Prisma.$ts_journalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_journal.
     * @param {ts_journalUpdateArgs} args - Arguments to update one Ts_journal.
     * @example
     * // Update one Ts_journal
     * const ts_journal = await prisma.ts_journal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_journalUpdateArgs>(args: SelectSubset<T, ts_journalUpdateArgs<ExtArgs>>): Prisma__ts_journalClient<$Result.GetResult<Prisma.$ts_journalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_journals.
     * @param {ts_journalDeleteManyArgs} args - Arguments to filter Ts_journals to delete.
     * @example
     * // Delete a few Ts_journals
     * const { count } = await prisma.ts_journal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_journalDeleteManyArgs>(args?: SelectSubset<T, ts_journalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_journals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_journals
     * const ts_journal = await prisma.ts_journal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_journalUpdateManyArgs>(args: SelectSubset<T, ts_journalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_journal.
     * @param {ts_journalUpsertArgs} args - Arguments to update or create a Ts_journal.
     * @example
     * // Update or create a Ts_journal
     * const ts_journal = await prisma.ts_journal.upsert({
     *   create: {
     *     // ... data to create a Ts_journal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_journal we want to update
     *   }
     * })
     */
    upsert<T extends ts_journalUpsertArgs>(args: SelectSubset<T, ts_journalUpsertArgs<ExtArgs>>): Prisma__ts_journalClient<$Result.GetResult<Prisma.$ts_journalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_journals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalCountArgs} args - Arguments to filter Ts_journals to count.
     * @example
     * // Count the number of Ts_journals
     * const count = await prisma.ts_journal.count({
     *   where: {
     *     // ... the filter for the Ts_journals we want to count
     *   }
     * })
    **/
    count<T extends ts_journalCountArgs>(
      args?: Subset<T, ts_journalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_journalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_journal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_journalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_journalAggregateArgs>(args: Subset<T, Ts_journalAggregateArgs>): Prisma.PrismaPromise<GetTs_journalAggregateType<T>>

    /**
     * Group by Ts_journal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalGroupByArgs} args - Group by arguments.
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
      T extends ts_journalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_journalGroupByArgs['orderBy'] }
        : { orderBy?: ts_journalGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_journalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_journalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_journal model
   */
  readonly fields: ts_journalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_journal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_journalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_journal model
   */
  interface ts_journalFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_journal", 'Int'>
    readonly IdJournal: FieldRef<"ts_journal", 'Int'>
    readonly CodeJournal: FieldRef<"ts_journal", 'String'>
    readonly Commentaire: FieldRef<"ts_journal", 'String'>
    readonly NomUtilisateur: FieldRef<"ts_journal", 'String'>
    readonly ProfilUtilisateur: FieldRef<"ts_journal", 'String'>
    readonly DateHeureJournal: FieldRef<"ts_journal", 'DateTime'>
    readonly IdLieu: FieldRef<"ts_journal", 'Int'>
    readonly CommentaireUtilisateur: FieldRef<"ts_journal", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ts_journal findUnique
   */
  export type ts_journalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
    /**
     * Filter, which ts_journal to fetch.
     */
    where: ts_journalWhereUniqueInput
  }

  /**
   * ts_journal findUniqueOrThrow
   */
  export type ts_journalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
    /**
     * Filter, which ts_journal to fetch.
     */
    where: ts_journalWhereUniqueInput
  }

  /**
   * ts_journal findFirst
   */
  export type ts_journalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
    /**
     * Filter, which ts_journal to fetch.
     */
    where?: ts_journalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journals to fetch.
     */
    orderBy?: ts_journalOrderByWithRelationInput | ts_journalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_journals.
     */
    cursor?: ts_journalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_journals.
     */
    distinct?: Ts_journalScalarFieldEnum | Ts_journalScalarFieldEnum[]
  }

  /**
   * ts_journal findFirstOrThrow
   */
  export type ts_journalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
    /**
     * Filter, which ts_journal to fetch.
     */
    where?: ts_journalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journals to fetch.
     */
    orderBy?: ts_journalOrderByWithRelationInput | ts_journalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_journals.
     */
    cursor?: ts_journalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_journals.
     */
    distinct?: Ts_journalScalarFieldEnum | Ts_journalScalarFieldEnum[]
  }

  /**
   * ts_journal findMany
   */
  export type ts_journalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
    /**
     * Filter, which ts_journals to fetch.
     */
    where?: ts_journalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journals to fetch.
     */
    orderBy?: ts_journalOrderByWithRelationInput | ts_journalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_journals.
     */
    cursor?: ts_journalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journals.
     */
    skip?: number
    distinct?: Ts_journalScalarFieldEnum | Ts_journalScalarFieldEnum[]
  }

  /**
   * ts_journal create
   */
  export type ts_journalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_journal.
     */
    data?: XOR<ts_journalCreateInput, ts_journalUncheckedCreateInput>
  }

  /**
   * ts_journal createMany
   */
  export type ts_journalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_journals.
     */
    data: ts_journalCreateManyInput | ts_journalCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_journal update
   */
  export type ts_journalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_journal.
     */
    data: XOR<ts_journalUpdateInput, ts_journalUncheckedUpdateInput>
    /**
     * Choose, which ts_journal to update.
     */
    where: ts_journalWhereUniqueInput
  }

  /**
   * ts_journal updateMany
   */
  export type ts_journalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_journals.
     */
    data: XOR<ts_journalUpdateManyMutationInput, ts_journalUncheckedUpdateManyInput>
    /**
     * Filter which ts_journals to update
     */
    where?: ts_journalWhereInput
    /**
     * Limit how many ts_journals to update.
     */
    limit?: number
  }

  /**
   * ts_journal upsert
   */
  export type ts_journalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_journal to update in case it exists.
     */
    where: ts_journalWhereUniqueInput
    /**
     * In case the ts_journal found by the `where` argument doesn't exist, create a new ts_journal with this data.
     */
    create: XOR<ts_journalCreateInput, ts_journalUncheckedCreateInput>
    /**
     * In case the ts_journal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_journalUpdateInput, ts_journalUncheckedUpdateInput>
  }

  /**
   * ts_journal delete
   */
  export type ts_journalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
    /**
     * Filter which ts_journal to delete.
     */
    where: ts_journalWhereUniqueInput
  }

  /**
   * ts_journal deleteMany
   */
  export type ts_journalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_journals to delete
     */
    where?: ts_journalWhereInput
    /**
     * Limit how many ts_journals to delete.
     */
    limit?: number
  }

  /**
   * ts_journal without action
   */
  export type ts_journalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal
     */
    select?: ts_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal
     */
    omit?: ts_journalOmit<ExtArgs> | null
  }


  /**
   * Model ts_journal_code
   */

  export type AggregateTs_journal_code = {
    _count: Ts_journal_codeCountAggregateOutputType | null
    _min: Ts_journal_codeMinAggregateOutputType | null
    _max: Ts_journal_codeMaxAggregateOutputType | null
  }

  export type Ts_journal_codeMinAggregateOutputType = {
    CodeJournal: string | null
    Commentaire: string | null
  }

  export type Ts_journal_codeMaxAggregateOutputType = {
    CodeJournal: string | null
    Commentaire: string | null
  }

  export type Ts_journal_codeCountAggregateOutputType = {
    CodeJournal: number
    Commentaire: number
    _all: number
  }


  export type Ts_journal_codeMinAggregateInputType = {
    CodeJournal?: true
    Commentaire?: true
  }

  export type Ts_journal_codeMaxAggregateInputType = {
    CodeJournal?: true
    Commentaire?: true
  }

  export type Ts_journal_codeCountAggregateInputType = {
    CodeJournal?: true
    Commentaire?: true
    _all?: true
  }

  export type Ts_journal_codeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_journal_code to aggregate.
     */
    where?: ts_journal_codeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journal_codes to fetch.
     */
    orderBy?: ts_journal_codeOrderByWithRelationInput | ts_journal_codeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_journal_codeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journal_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journal_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_journal_codes
    **/
    _count?: true | Ts_journal_codeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_journal_codeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_journal_codeMaxAggregateInputType
  }

  export type GetTs_journal_codeAggregateType<T extends Ts_journal_codeAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_journal_code]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_journal_code[P]>
      : GetScalarType<T[P], AggregateTs_journal_code[P]>
  }




  export type ts_journal_codeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_journal_codeWhereInput
    orderBy?: ts_journal_codeOrderByWithAggregationInput | ts_journal_codeOrderByWithAggregationInput[]
    by: Ts_journal_codeScalarFieldEnum[] | Ts_journal_codeScalarFieldEnum
    having?: ts_journal_codeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_journal_codeCountAggregateInputType | true
    _min?: Ts_journal_codeMinAggregateInputType
    _max?: Ts_journal_codeMaxAggregateInputType
  }

  export type Ts_journal_codeGroupByOutputType = {
    CodeJournal: string
    Commentaire: string | null
    _count: Ts_journal_codeCountAggregateOutputType | null
    _min: Ts_journal_codeMinAggregateOutputType | null
    _max: Ts_journal_codeMaxAggregateOutputType | null
  }

  type GetTs_journal_codeGroupByPayload<T extends ts_journal_codeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_journal_codeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_journal_codeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_journal_codeGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_journal_codeGroupByOutputType[P]>
        }
      >
    >


  export type ts_journal_codeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    CodeJournal?: boolean
    Commentaire?: boolean
  }, ExtArgs["result"]["ts_journal_code"]>



  export type ts_journal_codeSelectScalar = {
    CodeJournal?: boolean
    Commentaire?: boolean
  }

  export type ts_journal_codeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"CodeJournal" | "Commentaire", ExtArgs["result"]["ts_journal_code"]>

  export type $ts_journal_codePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_journal_code"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      CodeJournal: string
      Commentaire: string | null
    }, ExtArgs["result"]["ts_journal_code"]>
    composites: {}
  }

  type ts_journal_codeGetPayload<S extends boolean | null | undefined | ts_journal_codeDefaultArgs> = $Result.GetResult<Prisma.$ts_journal_codePayload, S>

  type ts_journal_codeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_journal_codeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_journal_codeCountAggregateInputType | true
    }

  export interface ts_journal_codeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_journal_code'], meta: { name: 'ts_journal_code' } }
    /**
     * Find zero or one Ts_journal_code that matches the filter.
     * @param {ts_journal_codeFindUniqueArgs} args - Arguments to find a Ts_journal_code
     * @example
     * // Get one Ts_journal_code
     * const ts_journal_code = await prisma.ts_journal_code.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_journal_codeFindUniqueArgs>(args: SelectSubset<T, ts_journal_codeFindUniqueArgs<ExtArgs>>): Prisma__ts_journal_codeClient<$Result.GetResult<Prisma.$ts_journal_codePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_journal_code that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_journal_codeFindUniqueOrThrowArgs} args - Arguments to find a Ts_journal_code
     * @example
     * // Get one Ts_journal_code
     * const ts_journal_code = await prisma.ts_journal_code.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_journal_codeFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_journal_codeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_journal_codeClient<$Result.GetResult<Prisma.$ts_journal_codePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_journal_code that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journal_codeFindFirstArgs} args - Arguments to find a Ts_journal_code
     * @example
     * // Get one Ts_journal_code
     * const ts_journal_code = await prisma.ts_journal_code.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_journal_codeFindFirstArgs>(args?: SelectSubset<T, ts_journal_codeFindFirstArgs<ExtArgs>>): Prisma__ts_journal_codeClient<$Result.GetResult<Prisma.$ts_journal_codePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_journal_code that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journal_codeFindFirstOrThrowArgs} args - Arguments to find a Ts_journal_code
     * @example
     * // Get one Ts_journal_code
     * const ts_journal_code = await prisma.ts_journal_code.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_journal_codeFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_journal_codeFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_journal_codeClient<$Result.GetResult<Prisma.$ts_journal_codePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_journal_codes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journal_codeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_journal_codes
     * const ts_journal_codes = await prisma.ts_journal_code.findMany()
     * 
     * // Get first 10 Ts_journal_codes
     * const ts_journal_codes = await prisma.ts_journal_code.findMany({ take: 10 })
     * 
     * // Only select the `CodeJournal`
     * const ts_journal_codeWithCodeJournalOnly = await prisma.ts_journal_code.findMany({ select: { CodeJournal: true } })
     * 
     */
    findMany<T extends ts_journal_codeFindManyArgs>(args?: SelectSubset<T, ts_journal_codeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_journal_codePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_journal_code.
     * @param {ts_journal_codeCreateArgs} args - Arguments to create a Ts_journal_code.
     * @example
     * // Create one Ts_journal_code
     * const Ts_journal_code = await prisma.ts_journal_code.create({
     *   data: {
     *     // ... data to create a Ts_journal_code
     *   }
     * })
     * 
     */
    create<T extends ts_journal_codeCreateArgs>(args: SelectSubset<T, ts_journal_codeCreateArgs<ExtArgs>>): Prisma__ts_journal_codeClient<$Result.GetResult<Prisma.$ts_journal_codePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_journal_codes.
     * @param {ts_journal_codeCreateManyArgs} args - Arguments to create many Ts_journal_codes.
     * @example
     * // Create many Ts_journal_codes
     * const ts_journal_code = await prisma.ts_journal_code.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_journal_codeCreateManyArgs>(args?: SelectSubset<T, ts_journal_codeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_journal_code.
     * @param {ts_journal_codeDeleteArgs} args - Arguments to delete one Ts_journal_code.
     * @example
     * // Delete one Ts_journal_code
     * const Ts_journal_code = await prisma.ts_journal_code.delete({
     *   where: {
     *     // ... filter to delete one Ts_journal_code
     *   }
     * })
     * 
     */
    delete<T extends ts_journal_codeDeleteArgs>(args: SelectSubset<T, ts_journal_codeDeleteArgs<ExtArgs>>): Prisma__ts_journal_codeClient<$Result.GetResult<Prisma.$ts_journal_codePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_journal_code.
     * @param {ts_journal_codeUpdateArgs} args - Arguments to update one Ts_journal_code.
     * @example
     * // Update one Ts_journal_code
     * const ts_journal_code = await prisma.ts_journal_code.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_journal_codeUpdateArgs>(args: SelectSubset<T, ts_journal_codeUpdateArgs<ExtArgs>>): Prisma__ts_journal_codeClient<$Result.GetResult<Prisma.$ts_journal_codePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_journal_codes.
     * @param {ts_journal_codeDeleteManyArgs} args - Arguments to filter Ts_journal_codes to delete.
     * @example
     * // Delete a few Ts_journal_codes
     * const { count } = await prisma.ts_journal_code.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_journal_codeDeleteManyArgs>(args?: SelectSubset<T, ts_journal_codeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_journal_codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journal_codeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_journal_codes
     * const ts_journal_code = await prisma.ts_journal_code.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_journal_codeUpdateManyArgs>(args: SelectSubset<T, ts_journal_codeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_journal_code.
     * @param {ts_journal_codeUpsertArgs} args - Arguments to update or create a Ts_journal_code.
     * @example
     * // Update or create a Ts_journal_code
     * const ts_journal_code = await prisma.ts_journal_code.upsert({
     *   create: {
     *     // ... data to create a Ts_journal_code
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_journal_code we want to update
     *   }
     * })
     */
    upsert<T extends ts_journal_codeUpsertArgs>(args: SelectSubset<T, ts_journal_codeUpsertArgs<ExtArgs>>): Prisma__ts_journal_codeClient<$Result.GetResult<Prisma.$ts_journal_codePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_journal_codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journal_codeCountArgs} args - Arguments to filter Ts_journal_codes to count.
     * @example
     * // Count the number of Ts_journal_codes
     * const count = await prisma.ts_journal_code.count({
     *   where: {
     *     // ... the filter for the Ts_journal_codes we want to count
     *   }
     * })
    **/
    count<T extends ts_journal_codeCountArgs>(
      args?: Subset<T, ts_journal_codeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_journal_codeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_journal_code.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_journal_codeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_journal_codeAggregateArgs>(args: Subset<T, Ts_journal_codeAggregateArgs>): Prisma.PrismaPromise<GetTs_journal_codeAggregateType<T>>

    /**
     * Group by Ts_journal_code.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journal_codeGroupByArgs} args - Group by arguments.
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
      T extends ts_journal_codeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_journal_codeGroupByArgs['orderBy'] }
        : { orderBy?: ts_journal_codeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_journal_codeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_journal_codeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_journal_code model
   */
  readonly fields: ts_journal_codeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_journal_code.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_journal_codeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_journal_code model
   */
  interface ts_journal_codeFieldRefs {
    readonly CodeJournal: FieldRef<"ts_journal_code", 'String'>
    readonly Commentaire: FieldRef<"ts_journal_code", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ts_journal_code findUnique
   */
  export type ts_journal_codeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which ts_journal_code to fetch.
     */
    where: ts_journal_codeWhereUniqueInput
  }

  /**
   * ts_journal_code findUniqueOrThrow
   */
  export type ts_journal_codeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which ts_journal_code to fetch.
     */
    where: ts_journal_codeWhereUniqueInput
  }

  /**
   * ts_journal_code findFirst
   */
  export type ts_journal_codeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which ts_journal_code to fetch.
     */
    where?: ts_journal_codeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journal_codes to fetch.
     */
    orderBy?: ts_journal_codeOrderByWithRelationInput | ts_journal_codeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_journal_codes.
     */
    cursor?: ts_journal_codeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journal_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journal_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_journal_codes.
     */
    distinct?: Ts_journal_codeScalarFieldEnum | Ts_journal_codeScalarFieldEnum[]
  }

  /**
   * ts_journal_code findFirstOrThrow
   */
  export type ts_journal_codeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which ts_journal_code to fetch.
     */
    where?: ts_journal_codeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journal_codes to fetch.
     */
    orderBy?: ts_journal_codeOrderByWithRelationInput | ts_journal_codeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_journal_codes.
     */
    cursor?: ts_journal_codeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journal_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journal_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_journal_codes.
     */
    distinct?: Ts_journal_codeScalarFieldEnum | Ts_journal_codeScalarFieldEnum[]
  }

  /**
   * ts_journal_code findMany
   */
  export type ts_journal_codeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which ts_journal_codes to fetch.
     */
    where?: ts_journal_codeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journal_codes to fetch.
     */
    orderBy?: ts_journal_codeOrderByWithRelationInput | ts_journal_codeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_journal_codes.
     */
    cursor?: ts_journal_codeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journal_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journal_codes.
     */
    skip?: number
    distinct?: Ts_journal_codeScalarFieldEnum | Ts_journal_codeScalarFieldEnum[]
  }

  /**
   * ts_journal_code create
   */
  export type ts_journal_codeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_journal_code.
     */
    data: XOR<ts_journal_codeCreateInput, ts_journal_codeUncheckedCreateInput>
  }

  /**
   * ts_journal_code createMany
   */
  export type ts_journal_codeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_journal_codes.
     */
    data: ts_journal_codeCreateManyInput | ts_journal_codeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_journal_code update
   */
  export type ts_journal_codeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_journal_code.
     */
    data: XOR<ts_journal_codeUpdateInput, ts_journal_codeUncheckedUpdateInput>
    /**
     * Choose, which ts_journal_code to update.
     */
    where: ts_journal_codeWhereUniqueInput
  }

  /**
   * ts_journal_code updateMany
   */
  export type ts_journal_codeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_journal_codes.
     */
    data: XOR<ts_journal_codeUpdateManyMutationInput, ts_journal_codeUncheckedUpdateManyInput>
    /**
     * Filter which ts_journal_codes to update
     */
    where?: ts_journal_codeWhereInput
    /**
     * Limit how many ts_journal_codes to update.
     */
    limit?: number
  }

  /**
   * ts_journal_code upsert
   */
  export type ts_journal_codeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_journal_code to update in case it exists.
     */
    where: ts_journal_codeWhereUniqueInput
    /**
     * In case the ts_journal_code found by the `where` argument doesn't exist, create a new ts_journal_code with this data.
     */
    create: XOR<ts_journal_codeCreateInput, ts_journal_codeUncheckedCreateInput>
    /**
     * In case the ts_journal_code was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_journal_codeUpdateInput, ts_journal_codeUncheckedUpdateInput>
  }

  /**
   * ts_journal_code delete
   */
  export type ts_journal_codeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
    /**
     * Filter which ts_journal_code to delete.
     */
    where: ts_journal_codeWhereUniqueInput
  }

  /**
   * ts_journal_code deleteMany
   */
  export type ts_journal_codeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_journal_codes to delete
     */
    where?: ts_journal_codeWhereInput
    /**
     * Limit how many ts_journal_codes to delete.
     */
    limit?: number
  }

  /**
   * ts_journal_code without action
   */
  export type ts_journal_codeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journal_code
     */
    select?: ts_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journal_code
     */
    omit?: ts_journal_codeOmit<ExtArgs> | null
  }


  /**
   * Model ts_journalhisto
   */

  export type AggregateTs_journalhisto = {
    _count: Ts_journalhistoCountAggregateOutputType | null
    _avg: Ts_journalhistoAvgAggregateOutputType | null
    _sum: Ts_journalhistoSumAggregateOutputType | null
    _min: Ts_journalhistoMinAggregateOutputType | null
    _max: Ts_journalhistoMaxAggregateOutputType | null
  }

  export type Ts_journalhistoAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdJournal: number | null
    IdLieu: number | null
  }

  export type Ts_journalhistoSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdJournal: number | null
    IdLieu: number | null
  }

  export type Ts_journalhistoMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdJournal: number | null
    CodeJournal: string | null
    Commentaire: string | null
    NomUtilisateur: string | null
    ProfilUtilisateur: string | null
    DateHeureJournal: Date | null
    IdLieu: number | null
    CommentaireUtilisateur: string | null
  }

  export type Ts_journalhistoMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdJournal: number | null
    CodeJournal: string | null
    Commentaire: string | null
    NomUtilisateur: string | null
    ProfilUtilisateur: string | null
    DateHeureJournal: Date | null
    IdLieu: number | null
    CommentaireUtilisateur: string | null
  }

  export type Ts_journalhistoCountAggregateOutputType = {
    IdServeurBDD: number
    IdJournal: number
    CodeJournal: number
    Commentaire: number
    NomUtilisateur: number
    ProfilUtilisateur: number
    DateHeureJournal: number
    IdLieu: number
    CommentaireUtilisateur: number
    _all: number
  }


  export type Ts_journalhistoAvgAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    IdLieu?: true
  }

  export type Ts_journalhistoSumAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    IdLieu?: true
  }

  export type Ts_journalhistoMinAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    CodeJournal?: true
    Commentaire?: true
    NomUtilisateur?: true
    ProfilUtilisateur?: true
    DateHeureJournal?: true
    IdLieu?: true
    CommentaireUtilisateur?: true
  }

  export type Ts_journalhistoMaxAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    CodeJournal?: true
    Commentaire?: true
    NomUtilisateur?: true
    ProfilUtilisateur?: true
    DateHeureJournal?: true
    IdLieu?: true
    CommentaireUtilisateur?: true
  }

  export type Ts_journalhistoCountAggregateInputType = {
    IdServeurBDD?: true
    IdJournal?: true
    CodeJournal?: true
    Commentaire?: true
    NomUtilisateur?: true
    ProfilUtilisateur?: true
    DateHeureJournal?: true
    IdLieu?: true
    CommentaireUtilisateur?: true
    _all?: true
  }

  export type Ts_journalhistoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_journalhisto to aggregate.
     */
    where?: ts_journalhistoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journalhistos to fetch.
     */
    orderBy?: ts_journalhistoOrderByWithRelationInput | ts_journalhistoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_journalhistoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journalhistos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journalhistos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_journalhistos
    **/
    _count?: true | Ts_journalhistoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_journalhistoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_journalhistoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_journalhistoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_journalhistoMaxAggregateInputType
  }

  export type GetTs_journalhistoAggregateType<T extends Ts_journalhistoAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_journalhisto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_journalhisto[P]>
      : GetScalarType<T[P], AggregateTs_journalhisto[P]>
  }




  export type ts_journalhistoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_journalhistoWhereInput
    orderBy?: ts_journalhistoOrderByWithAggregationInput | ts_journalhistoOrderByWithAggregationInput[]
    by: Ts_journalhistoScalarFieldEnum[] | Ts_journalhistoScalarFieldEnum
    having?: ts_journalhistoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_journalhistoCountAggregateInputType | true
    _avg?: Ts_journalhistoAvgAggregateInputType
    _sum?: Ts_journalhistoSumAggregateInputType
    _min?: Ts_journalhistoMinAggregateInputType
    _max?: Ts_journalhistoMaxAggregateInputType
  }

  export type Ts_journalhistoGroupByOutputType = {
    IdServeurBDD: number
    IdJournal: number
    CodeJournal: string | null
    Commentaire: string | null
    NomUtilisateur: string | null
    ProfilUtilisateur: string | null
    DateHeureJournal: Date | null
    IdLieu: number | null
    CommentaireUtilisateur: string | null
    _count: Ts_journalhistoCountAggregateOutputType | null
    _avg: Ts_journalhistoAvgAggregateOutputType | null
    _sum: Ts_journalhistoSumAggregateOutputType | null
    _min: Ts_journalhistoMinAggregateOutputType | null
    _max: Ts_journalhistoMaxAggregateOutputType | null
  }

  type GetTs_journalhistoGroupByPayload<T extends ts_journalhistoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_journalhistoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_journalhistoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_journalhistoGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_journalhistoGroupByOutputType[P]>
        }
      >
    >


  export type ts_journalhistoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdJournal?: boolean
    CodeJournal?: boolean
    Commentaire?: boolean
    NomUtilisateur?: boolean
    ProfilUtilisateur?: boolean
    DateHeureJournal?: boolean
    IdLieu?: boolean
    CommentaireUtilisateur?: boolean
  }, ExtArgs["result"]["ts_journalhisto"]>



  export type ts_journalhistoSelectScalar = {
    IdServeurBDD?: boolean
    IdJournal?: boolean
    CodeJournal?: boolean
    Commentaire?: boolean
    NomUtilisateur?: boolean
    ProfilUtilisateur?: boolean
    DateHeureJournal?: boolean
    IdLieu?: boolean
    CommentaireUtilisateur?: boolean
  }

  export type ts_journalhistoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdJournal" | "CodeJournal" | "Commentaire" | "NomUtilisateur" | "ProfilUtilisateur" | "DateHeureJournal" | "IdLieu" | "CommentaireUtilisateur", ExtArgs["result"]["ts_journalhisto"]>

  export type $ts_journalhistoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_journalhisto"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdJournal: number
      CodeJournal: string | null
      Commentaire: string | null
      NomUtilisateur: string | null
      ProfilUtilisateur: string | null
      DateHeureJournal: Date | null
      IdLieu: number | null
      CommentaireUtilisateur: string | null
    }, ExtArgs["result"]["ts_journalhisto"]>
    composites: {}
  }

  type ts_journalhistoGetPayload<S extends boolean | null | undefined | ts_journalhistoDefaultArgs> = $Result.GetResult<Prisma.$ts_journalhistoPayload, S>

  type ts_journalhistoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_journalhistoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_journalhistoCountAggregateInputType | true
    }

  export interface ts_journalhistoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_journalhisto'], meta: { name: 'ts_journalhisto' } }
    /**
     * Find zero or one Ts_journalhisto that matches the filter.
     * @param {ts_journalhistoFindUniqueArgs} args - Arguments to find a Ts_journalhisto
     * @example
     * // Get one Ts_journalhisto
     * const ts_journalhisto = await prisma.ts_journalhisto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_journalhistoFindUniqueArgs>(args: SelectSubset<T, ts_journalhistoFindUniqueArgs<ExtArgs>>): Prisma__ts_journalhistoClient<$Result.GetResult<Prisma.$ts_journalhistoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_journalhisto that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_journalhistoFindUniqueOrThrowArgs} args - Arguments to find a Ts_journalhisto
     * @example
     * // Get one Ts_journalhisto
     * const ts_journalhisto = await prisma.ts_journalhisto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_journalhistoFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_journalhistoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_journalhistoClient<$Result.GetResult<Prisma.$ts_journalhistoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_journalhisto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalhistoFindFirstArgs} args - Arguments to find a Ts_journalhisto
     * @example
     * // Get one Ts_journalhisto
     * const ts_journalhisto = await prisma.ts_journalhisto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_journalhistoFindFirstArgs>(args?: SelectSubset<T, ts_journalhistoFindFirstArgs<ExtArgs>>): Prisma__ts_journalhistoClient<$Result.GetResult<Prisma.$ts_journalhistoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_journalhisto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalhistoFindFirstOrThrowArgs} args - Arguments to find a Ts_journalhisto
     * @example
     * // Get one Ts_journalhisto
     * const ts_journalhisto = await prisma.ts_journalhisto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_journalhistoFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_journalhistoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_journalhistoClient<$Result.GetResult<Prisma.$ts_journalhistoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_journalhistos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalhistoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_journalhistos
     * const ts_journalhistos = await prisma.ts_journalhisto.findMany()
     * 
     * // Get first 10 Ts_journalhistos
     * const ts_journalhistos = await prisma.ts_journalhisto.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_journalhistoWithIdServeurBDDOnly = await prisma.ts_journalhisto.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_journalhistoFindManyArgs>(args?: SelectSubset<T, ts_journalhistoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_journalhistoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_journalhisto.
     * @param {ts_journalhistoCreateArgs} args - Arguments to create a Ts_journalhisto.
     * @example
     * // Create one Ts_journalhisto
     * const Ts_journalhisto = await prisma.ts_journalhisto.create({
     *   data: {
     *     // ... data to create a Ts_journalhisto
     *   }
     * })
     * 
     */
    create<T extends ts_journalhistoCreateArgs>(args: SelectSubset<T, ts_journalhistoCreateArgs<ExtArgs>>): Prisma__ts_journalhistoClient<$Result.GetResult<Prisma.$ts_journalhistoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_journalhistos.
     * @param {ts_journalhistoCreateManyArgs} args - Arguments to create many Ts_journalhistos.
     * @example
     * // Create many Ts_journalhistos
     * const ts_journalhisto = await prisma.ts_journalhisto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_journalhistoCreateManyArgs>(args?: SelectSubset<T, ts_journalhistoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_journalhisto.
     * @param {ts_journalhistoDeleteArgs} args - Arguments to delete one Ts_journalhisto.
     * @example
     * // Delete one Ts_journalhisto
     * const Ts_journalhisto = await prisma.ts_journalhisto.delete({
     *   where: {
     *     // ... filter to delete one Ts_journalhisto
     *   }
     * })
     * 
     */
    delete<T extends ts_journalhistoDeleteArgs>(args: SelectSubset<T, ts_journalhistoDeleteArgs<ExtArgs>>): Prisma__ts_journalhistoClient<$Result.GetResult<Prisma.$ts_journalhistoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_journalhisto.
     * @param {ts_journalhistoUpdateArgs} args - Arguments to update one Ts_journalhisto.
     * @example
     * // Update one Ts_journalhisto
     * const ts_journalhisto = await prisma.ts_journalhisto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_journalhistoUpdateArgs>(args: SelectSubset<T, ts_journalhistoUpdateArgs<ExtArgs>>): Prisma__ts_journalhistoClient<$Result.GetResult<Prisma.$ts_journalhistoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_journalhistos.
     * @param {ts_journalhistoDeleteManyArgs} args - Arguments to filter Ts_journalhistos to delete.
     * @example
     * // Delete a few Ts_journalhistos
     * const { count } = await prisma.ts_journalhisto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_journalhistoDeleteManyArgs>(args?: SelectSubset<T, ts_journalhistoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_journalhistos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalhistoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_journalhistos
     * const ts_journalhisto = await prisma.ts_journalhisto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_journalhistoUpdateManyArgs>(args: SelectSubset<T, ts_journalhistoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_journalhisto.
     * @param {ts_journalhistoUpsertArgs} args - Arguments to update or create a Ts_journalhisto.
     * @example
     * // Update or create a Ts_journalhisto
     * const ts_journalhisto = await prisma.ts_journalhisto.upsert({
     *   create: {
     *     // ... data to create a Ts_journalhisto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_journalhisto we want to update
     *   }
     * })
     */
    upsert<T extends ts_journalhistoUpsertArgs>(args: SelectSubset<T, ts_journalhistoUpsertArgs<ExtArgs>>): Prisma__ts_journalhistoClient<$Result.GetResult<Prisma.$ts_journalhistoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_journalhistos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalhistoCountArgs} args - Arguments to filter Ts_journalhistos to count.
     * @example
     * // Count the number of Ts_journalhistos
     * const count = await prisma.ts_journalhisto.count({
     *   where: {
     *     // ... the filter for the Ts_journalhistos we want to count
     *   }
     * })
    **/
    count<T extends ts_journalhistoCountArgs>(
      args?: Subset<T, ts_journalhistoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_journalhistoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_journalhisto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_journalhistoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_journalhistoAggregateArgs>(args: Subset<T, Ts_journalhistoAggregateArgs>): Prisma.PrismaPromise<GetTs_journalhistoAggregateType<T>>

    /**
     * Group by Ts_journalhisto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_journalhistoGroupByArgs} args - Group by arguments.
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
      T extends ts_journalhistoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_journalhistoGroupByArgs['orderBy'] }
        : { orderBy?: ts_journalhistoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_journalhistoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_journalhistoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_journalhisto model
   */
  readonly fields: ts_journalhistoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_journalhisto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_journalhistoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_journalhisto model
   */
  interface ts_journalhistoFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_journalhisto", 'Int'>
    readonly IdJournal: FieldRef<"ts_journalhisto", 'Int'>
    readonly CodeJournal: FieldRef<"ts_journalhisto", 'String'>
    readonly Commentaire: FieldRef<"ts_journalhisto", 'String'>
    readonly NomUtilisateur: FieldRef<"ts_journalhisto", 'String'>
    readonly ProfilUtilisateur: FieldRef<"ts_journalhisto", 'String'>
    readonly DateHeureJournal: FieldRef<"ts_journalhisto", 'DateTime'>
    readonly IdLieu: FieldRef<"ts_journalhisto", 'Int'>
    readonly CommentaireUtilisateur: FieldRef<"ts_journalhisto", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ts_journalhisto findUnique
   */
  export type ts_journalhistoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_journalhisto to fetch.
     */
    where: ts_journalhistoWhereUniqueInput
  }

  /**
   * ts_journalhisto findUniqueOrThrow
   */
  export type ts_journalhistoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_journalhisto to fetch.
     */
    where: ts_journalhistoWhereUniqueInput
  }

  /**
   * ts_journalhisto findFirst
   */
  export type ts_journalhistoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_journalhisto to fetch.
     */
    where?: ts_journalhistoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journalhistos to fetch.
     */
    orderBy?: ts_journalhistoOrderByWithRelationInput | ts_journalhistoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_journalhistos.
     */
    cursor?: ts_journalhistoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journalhistos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journalhistos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_journalhistos.
     */
    distinct?: Ts_journalhistoScalarFieldEnum | Ts_journalhistoScalarFieldEnum[]
  }

  /**
   * ts_journalhisto findFirstOrThrow
   */
  export type ts_journalhistoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_journalhisto to fetch.
     */
    where?: ts_journalhistoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journalhistos to fetch.
     */
    orderBy?: ts_journalhistoOrderByWithRelationInput | ts_journalhistoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_journalhistos.
     */
    cursor?: ts_journalhistoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journalhistos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journalhistos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_journalhistos.
     */
    distinct?: Ts_journalhistoScalarFieldEnum | Ts_journalhistoScalarFieldEnum[]
  }

  /**
   * ts_journalhisto findMany
   */
  export type ts_journalhistoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_journalhistos to fetch.
     */
    where?: ts_journalhistoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_journalhistos to fetch.
     */
    orderBy?: ts_journalhistoOrderByWithRelationInput | ts_journalhistoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_journalhistos.
     */
    cursor?: ts_journalhistoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_journalhistos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_journalhistos.
     */
    skip?: number
    distinct?: Ts_journalhistoScalarFieldEnum | Ts_journalhistoScalarFieldEnum[]
  }

  /**
   * ts_journalhisto create
   */
  export type ts_journalhistoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_journalhisto.
     */
    data?: XOR<ts_journalhistoCreateInput, ts_journalhistoUncheckedCreateInput>
  }

  /**
   * ts_journalhisto createMany
   */
  export type ts_journalhistoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_journalhistos.
     */
    data: ts_journalhistoCreateManyInput | ts_journalhistoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_journalhisto update
   */
  export type ts_journalhistoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_journalhisto.
     */
    data: XOR<ts_journalhistoUpdateInput, ts_journalhistoUncheckedUpdateInput>
    /**
     * Choose, which ts_journalhisto to update.
     */
    where: ts_journalhistoWhereUniqueInput
  }

  /**
   * ts_journalhisto updateMany
   */
  export type ts_journalhistoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_journalhistos.
     */
    data: XOR<ts_journalhistoUpdateManyMutationInput, ts_journalhistoUncheckedUpdateManyInput>
    /**
     * Filter which ts_journalhistos to update
     */
    where?: ts_journalhistoWhereInput
    /**
     * Limit how many ts_journalhistos to update.
     */
    limit?: number
  }

  /**
   * ts_journalhisto upsert
   */
  export type ts_journalhistoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_journalhisto to update in case it exists.
     */
    where: ts_journalhistoWhereUniqueInput
    /**
     * In case the ts_journalhisto found by the `where` argument doesn't exist, create a new ts_journalhisto with this data.
     */
    create: XOR<ts_journalhistoCreateInput, ts_journalhistoUncheckedCreateInput>
    /**
     * In case the ts_journalhisto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_journalhistoUpdateInput, ts_journalhistoUncheckedUpdateInput>
  }

  /**
   * ts_journalhisto delete
   */
  export type ts_journalhistoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
    /**
     * Filter which ts_journalhisto to delete.
     */
    where: ts_journalhistoWhereUniqueInput
  }

  /**
   * ts_journalhisto deleteMany
   */
  export type ts_journalhistoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_journalhistos to delete
     */
    where?: ts_journalhistoWhereInput
    /**
     * Limit how many ts_journalhistos to delete.
     */
    limit?: number
  }

  /**
   * ts_journalhisto without action
   */
  export type ts_journalhistoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_journalhisto
     */
    select?: ts_journalhistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_journalhisto
     */
    omit?: ts_journalhistoOmit<ExtArgs> | null
  }


  /**
   * Model ts_logmesures
   */

  export type AggregateTs_logmesures = {
    _count: Ts_logmesuresCountAggregateOutputType | null
    _avg: Ts_logmesuresAvgAggregateOutputType | null
    _sum: Ts_logmesuresSumAggregateOutputType | null
    _min: Ts_logmesuresMinAggregateOutputType | null
    _max: Ts_logmesuresMaxAggregateOutputType | null
  }

  export type Ts_logmesuresAvgAggregateOutputType = {
    IdLogMesures: number | null
    IdReception: number | null
    Valeur: number | null
    bEstHorsConsignes: number | null
    bEstEnAlarme: number | null
    bMarqueur: number | null
  }

  export type Ts_logmesuresSumAggregateOutputType = {
    IdLogMesures: number | null
    IdReception: number | null
    Valeur: number | null
    bEstHorsConsignes: number | null
    bEstEnAlarme: number | null
    bMarqueur: number | null
  }

  export type Ts_logmesuresMinAggregateOutputType = {
    IdLogMesures: number | null
    IdReception: number | null
    DateHeureMesure: Date | null
    Valeur: number | null
    bEstHorsConsignes: number | null
    bEstEnAlarme: number | null
    bMarqueur: number | null
    Details: string | null
  }

  export type Ts_logmesuresMaxAggregateOutputType = {
    IdLogMesures: number | null
    IdReception: number | null
    DateHeureMesure: Date | null
    Valeur: number | null
    bEstHorsConsignes: number | null
    bEstEnAlarme: number | null
    bMarqueur: number | null
    Details: string | null
  }

  export type Ts_logmesuresCountAggregateOutputType = {
    IdLogMesures: number
    IdReception: number
    DateHeureMesure: number
    Valeur: number
    bEstHorsConsignes: number
    bEstEnAlarme: number
    bMarqueur: number
    Details: number
    _all: number
  }


  export type Ts_logmesuresAvgAggregateInputType = {
    IdLogMesures?: true
    IdReception?: true
    Valeur?: true
    bEstHorsConsignes?: true
    bEstEnAlarme?: true
    bMarqueur?: true
  }

  export type Ts_logmesuresSumAggregateInputType = {
    IdLogMesures?: true
    IdReception?: true
    Valeur?: true
    bEstHorsConsignes?: true
    bEstEnAlarme?: true
    bMarqueur?: true
  }

  export type Ts_logmesuresMinAggregateInputType = {
    IdLogMesures?: true
    IdReception?: true
    DateHeureMesure?: true
    Valeur?: true
    bEstHorsConsignes?: true
    bEstEnAlarme?: true
    bMarqueur?: true
    Details?: true
  }

  export type Ts_logmesuresMaxAggregateInputType = {
    IdLogMesures?: true
    IdReception?: true
    DateHeureMesure?: true
    Valeur?: true
    bEstHorsConsignes?: true
    bEstEnAlarme?: true
    bMarqueur?: true
    Details?: true
  }

  export type Ts_logmesuresCountAggregateInputType = {
    IdLogMesures?: true
    IdReception?: true
    DateHeureMesure?: true
    Valeur?: true
    bEstHorsConsignes?: true
    bEstEnAlarme?: true
    bMarqueur?: true
    Details?: true
    _all?: true
  }

  export type Ts_logmesuresAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_logmesures to aggregate.
     */
    where?: ts_logmesuresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_logmesures to fetch.
     */
    orderBy?: ts_logmesuresOrderByWithRelationInput | ts_logmesuresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_logmesuresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_logmesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_logmesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_logmesures
    **/
    _count?: true | Ts_logmesuresCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_logmesuresAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_logmesuresSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_logmesuresMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_logmesuresMaxAggregateInputType
  }

  export type GetTs_logmesuresAggregateType<T extends Ts_logmesuresAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_logmesures]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_logmesures[P]>
      : GetScalarType<T[P], AggregateTs_logmesures[P]>
  }




  export type ts_logmesuresGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_logmesuresWhereInput
    orderBy?: ts_logmesuresOrderByWithAggregationInput | ts_logmesuresOrderByWithAggregationInput[]
    by: Ts_logmesuresScalarFieldEnum[] | Ts_logmesuresScalarFieldEnum
    having?: ts_logmesuresScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_logmesuresCountAggregateInputType | true
    _avg?: Ts_logmesuresAvgAggregateInputType
    _sum?: Ts_logmesuresSumAggregateInputType
    _min?: Ts_logmesuresMinAggregateInputType
    _max?: Ts_logmesuresMaxAggregateInputType
  }

  export type Ts_logmesuresGroupByOutputType = {
    IdLogMesures: number
    IdReception: number | null
    DateHeureMesure: Date
    Valeur: number | null
    bEstHorsConsignes: number | null
    bEstEnAlarme: number | null
    bMarqueur: number | null
    Details: string | null
    _count: Ts_logmesuresCountAggregateOutputType | null
    _avg: Ts_logmesuresAvgAggregateOutputType | null
    _sum: Ts_logmesuresSumAggregateOutputType | null
    _min: Ts_logmesuresMinAggregateOutputType | null
    _max: Ts_logmesuresMaxAggregateOutputType | null
  }

  type GetTs_logmesuresGroupByPayload<T extends ts_logmesuresGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_logmesuresGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_logmesuresGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_logmesuresGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_logmesuresGroupByOutputType[P]>
        }
      >
    >


  export type ts_logmesuresSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdLogMesures?: boolean
    IdReception?: boolean
    DateHeureMesure?: boolean
    Valeur?: boolean
    bEstHorsConsignes?: boolean
    bEstEnAlarme?: boolean
    bMarqueur?: boolean
    Details?: boolean
  }, ExtArgs["result"]["ts_logmesures"]>



  export type ts_logmesuresSelectScalar = {
    IdLogMesures?: boolean
    IdReception?: boolean
    DateHeureMesure?: boolean
    Valeur?: boolean
    bEstHorsConsignes?: boolean
    bEstEnAlarme?: boolean
    bMarqueur?: boolean
    Details?: boolean
  }

  export type ts_logmesuresOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdLogMesures" | "IdReception" | "DateHeureMesure" | "Valeur" | "bEstHorsConsignes" | "bEstEnAlarme" | "bMarqueur" | "Details", ExtArgs["result"]["ts_logmesures"]>

  export type $ts_logmesuresPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_logmesures"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdLogMesures: number
      IdReception: number | null
      DateHeureMesure: Date
      Valeur: number | null
      bEstHorsConsignes: number | null
      bEstEnAlarme: number | null
      bMarqueur: number | null
      Details: string | null
    }, ExtArgs["result"]["ts_logmesures"]>
    composites: {}
  }

  type ts_logmesuresGetPayload<S extends boolean | null | undefined | ts_logmesuresDefaultArgs> = $Result.GetResult<Prisma.$ts_logmesuresPayload, S>

  type ts_logmesuresCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_logmesuresFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_logmesuresCountAggregateInputType | true
    }

  export interface ts_logmesuresDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_logmesures'], meta: { name: 'ts_logmesures' } }
    /**
     * Find zero or one Ts_logmesures that matches the filter.
     * @param {ts_logmesuresFindUniqueArgs} args - Arguments to find a Ts_logmesures
     * @example
     * // Get one Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_logmesuresFindUniqueArgs>(args: SelectSubset<T, ts_logmesuresFindUniqueArgs<ExtArgs>>): Prisma__ts_logmesuresClient<$Result.GetResult<Prisma.$ts_logmesuresPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_logmesures that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_logmesuresFindUniqueOrThrowArgs} args - Arguments to find a Ts_logmesures
     * @example
     * // Get one Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_logmesuresFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_logmesuresFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_logmesuresClient<$Result.GetResult<Prisma.$ts_logmesuresPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_logmesures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_logmesuresFindFirstArgs} args - Arguments to find a Ts_logmesures
     * @example
     * // Get one Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_logmesuresFindFirstArgs>(args?: SelectSubset<T, ts_logmesuresFindFirstArgs<ExtArgs>>): Prisma__ts_logmesuresClient<$Result.GetResult<Prisma.$ts_logmesuresPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_logmesures that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_logmesuresFindFirstOrThrowArgs} args - Arguments to find a Ts_logmesures
     * @example
     * // Get one Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_logmesuresFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_logmesuresFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_logmesuresClient<$Result.GetResult<Prisma.$ts_logmesuresPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_logmesures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_logmesuresFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.findMany()
     * 
     * // Get first 10 Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.findMany({ take: 10 })
     * 
     * // Only select the `IdLogMesures`
     * const ts_logmesuresWithIdLogMesuresOnly = await prisma.ts_logmesures.findMany({ select: { IdLogMesures: true } })
     * 
     */
    findMany<T extends ts_logmesuresFindManyArgs>(args?: SelectSubset<T, ts_logmesuresFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_logmesuresPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_logmesures.
     * @param {ts_logmesuresCreateArgs} args - Arguments to create a Ts_logmesures.
     * @example
     * // Create one Ts_logmesures
     * const Ts_logmesures = await prisma.ts_logmesures.create({
     *   data: {
     *     // ... data to create a Ts_logmesures
     *   }
     * })
     * 
     */
    create<T extends ts_logmesuresCreateArgs>(args: SelectSubset<T, ts_logmesuresCreateArgs<ExtArgs>>): Prisma__ts_logmesuresClient<$Result.GetResult<Prisma.$ts_logmesuresPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_logmesures.
     * @param {ts_logmesuresCreateManyArgs} args - Arguments to create many Ts_logmesures.
     * @example
     * // Create many Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_logmesuresCreateManyArgs>(args?: SelectSubset<T, ts_logmesuresCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_logmesures.
     * @param {ts_logmesuresDeleteArgs} args - Arguments to delete one Ts_logmesures.
     * @example
     * // Delete one Ts_logmesures
     * const Ts_logmesures = await prisma.ts_logmesures.delete({
     *   where: {
     *     // ... filter to delete one Ts_logmesures
     *   }
     * })
     * 
     */
    delete<T extends ts_logmesuresDeleteArgs>(args: SelectSubset<T, ts_logmesuresDeleteArgs<ExtArgs>>): Prisma__ts_logmesuresClient<$Result.GetResult<Prisma.$ts_logmesuresPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_logmesures.
     * @param {ts_logmesuresUpdateArgs} args - Arguments to update one Ts_logmesures.
     * @example
     * // Update one Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_logmesuresUpdateArgs>(args: SelectSubset<T, ts_logmesuresUpdateArgs<ExtArgs>>): Prisma__ts_logmesuresClient<$Result.GetResult<Prisma.$ts_logmesuresPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_logmesures.
     * @param {ts_logmesuresDeleteManyArgs} args - Arguments to filter Ts_logmesures to delete.
     * @example
     * // Delete a few Ts_logmesures
     * const { count } = await prisma.ts_logmesures.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_logmesuresDeleteManyArgs>(args?: SelectSubset<T, ts_logmesuresDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_logmesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_logmesuresUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_logmesuresUpdateManyArgs>(args: SelectSubset<T, ts_logmesuresUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_logmesures.
     * @param {ts_logmesuresUpsertArgs} args - Arguments to update or create a Ts_logmesures.
     * @example
     * // Update or create a Ts_logmesures
     * const ts_logmesures = await prisma.ts_logmesures.upsert({
     *   create: {
     *     // ... data to create a Ts_logmesures
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_logmesures we want to update
     *   }
     * })
     */
    upsert<T extends ts_logmesuresUpsertArgs>(args: SelectSubset<T, ts_logmesuresUpsertArgs<ExtArgs>>): Prisma__ts_logmesuresClient<$Result.GetResult<Prisma.$ts_logmesuresPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_logmesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_logmesuresCountArgs} args - Arguments to filter Ts_logmesures to count.
     * @example
     * // Count the number of Ts_logmesures
     * const count = await prisma.ts_logmesures.count({
     *   where: {
     *     // ... the filter for the Ts_logmesures we want to count
     *   }
     * })
    **/
    count<T extends ts_logmesuresCountArgs>(
      args?: Subset<T, ts_logmesuresCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_logmesuresCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_logmesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_logmesuresAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_logmesuresAggregateArgs>(args: Subset<T, Ts_logmesuresAggregateArgs>): Prisma.PrismaPromise<GetTs_logmesuresAggregateType<T>>

    /**
     * Group by Ts_logmesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_logmesuresGroupByArgs} args - Group by arguments.
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
      T extends ts_logmesuresGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_logmesuresGroupByArgs['orderBy'] }
        : { orderBy?: ts_logmesuresGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_logmesuresGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_logmesuresGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_logmesures model
   */
  readonly fields: ts_logmesuresFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_logmesures.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_logmesuresClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_logmesures model
   */
  interface ts_logmesuresFieldRefs {
    readonly IdLogMesures: FieldRef<"ts_logmesures", 'Int'>
    readonly IdReception: FieldRef<"ts_logmesures", 'Int'>
    readonly DateHeureMesure: FieldRef<"ts_logmesures", 'DateTime'>
    readonly Valeur: FieldRef<"ts_logmesures", 'Float'>
    readonly bEstHorsConsignes: FieldRef<"ts_logmesures", 'Int'>
    readonly bEstEnAlarme: FieldRef<"ts_logmesures", 'Int'>
    readonly bMarqueur: FieldRef<"ts_logmesures", 'Int'>
    readonly Details: FieldRef<"ts_logmesures", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ts_logmesures findUnique
   */
  export type ts_logmesuresFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
    /**
     * Filter, which ts_logmesures to fetch.
     */
    where: ts_logmesuresWhereUniqueInput
  }

  /**
   * ts_logmesures findUniqueOrThrow
   */
  export type ts_logmesuresFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
    /**
     * Filter, which ts_logmesures to fetch.
     */
    where: ts_logmesuresWhereUniqueInput
  }

  /**
   * ts_logmesures findFirst
   */
  export type ts_logmesuresFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
    /**
     * Filter, which ts_logmesures to fetch.
     */
    where?: ts_logmesuresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_logmesures to fetch.
     */
    orderBy?: ts_logmesuresOrderByWithRelationInput | ts_logmesuresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_logmesures.
     */
    cursor?: ts_logmesuresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_logmesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_logmesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_logmesures.
     */
    distinct?: Ts_logmesuresScalarFieldEnum | Ts_logmesuresScalarFieldEnum[]
  }

  /**
   * ts_logmesures findFirstOrThrow
   */
  export type ts_logmesuresFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
    /**
     * Filter, which ts_logmesures to fetch.
     */
    where?: ts_logmesuresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_logmesures to fetch.
     */
    orderBy?: ts_logmesuresOrderByWithRelationInput | ts_logmesuresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_logmesures.
     */
    cursor?: ts_logmesuresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_logmesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_logmesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_logmesures.
     */
    distinct?: Ts_logmesuresScalarFieldEnum | Ts_logmesuresScalarFieldEnum[]
  }

  /**
   * ts_logmesures findMany
   */
  export type ts_logmesuresFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
    /**
     * Filter, which ts_logmesures to fetch.
     */
    where?: ts_logmesuresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_logmesures to fetch.
     */
    orderBy?: ts_logmesuresOrderByWithRelationInput | ts_logmesuresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_logmesures.
     */
    cursor?: ts_logmesuresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_logmesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_logmesures.
     */
    skip?: number
    distinct?: Ts_logmesuresScalarFieldEnum | Ts_logmesuresScalarFieldEnum[]
  }

  /**
   * ts_logmesures create
   */
  export type ts_logmesuresCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_logmesures.
     */
    data?: XOR<ts_logmesuresCreateInput, ts_logmesuresUncheckedCreateInput>
  }

  /**
   * ts_logmesures createMany
   */
  export type ts_logmesuresCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_logmesures.
     */
    data: ts_logmesuresCreateManyInput | ts_logmesuresCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_logmesures update
   */
  export type ts_logmesuresUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_logmesures.
     */
    data: XOR<ts_logmesuresUpdateInput, ts_logmesuresUncheckedUpdateInput>
    /**
     * Choose, which ts_logmesures to update.
     */
    where: ts_logmesuresWhereUniqueInput
  }

  /**
   * ts_logmesures updateMany
   */
  export type ts_logmesuresUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_logmesures.
     */
    data: XOR<ts_logmesuresUpdateManyMutationInput, ts_logmesuresUncheckedUpdateManyInput>
    /**
     * Filter which ts_logmesures to update
     */
    where?: ts_logmesuresWhereInput
    /**
     * Limit how many ts_logmesures to update.
     */
    limit?: number
  }

  /**
   * ts_logmesures upsert
   */
  export type ts_logmesuresUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_logmesures to update in case it exists.
     */
    where: ts_logmesuresWhereUniqueInput
    /**
     * In case the ts_logmesures found by the `where` argument doesn't exist, create a new ts_logmesures with this data.
     */
    create: XOR<ts_logmesuresCreateInput, ts_logmesuresUncheckedCreateInput>
    /**
     * In case the ts_logmesures was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_logmesuresUpdateInput, ts_logmesuresUncheckedUpdateInput>
  }

  /**
   * ts_logmesures delete
   */
  export type ts_logmesuresDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
    /**
     * Filter which ts_logmesures to delete.
     */
    where: ts_logmesuresWhereUniqueInput
  }

  /**
   * ts_logmesures deleteMany
   */
  export type ts_logmesuresDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_logmesures to delete
     */
    where?: ts_logmesuresWhereInput
    /**
     * Limit how many ts_logmesures to delete.
     */
    limit?: number
  }

  /**
   * ts_logmesures without action
   */
  export type ts_logmesuresDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_logmesures
     */
    select?: ts_logmesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_logmesures
     */
    omit?: ts_logmesuresOmit<ExtArgs> | null
  }


  /**
   * Model ts_mesure
   */

  export type AggregateTs_mesure = {
    _count: Ts_mesureCountAggregateOutputType | null
    _avg: Ts_mesureAvgAggregateOutputType | null
    _sum: Ts_mesureSumAggregateOutputType | null
    _min: Ts_mesureMinAggregateOutputType | null
    _max: Ts_mesureMaxAggregateOutputType | null
  }

  export type Ts_mesureAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesure: number | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
  }

  export type Ts_mesureSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesure: number | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
  }

  export type Ts_mesureMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesure: number | null
    DateHeureMesure: Date | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    SondeNumeroSerie: string | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Etat_Alarme: boolean | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
  }

  export type Ts_mesureMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesure: number | null
    DateHeureMesure: Date | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    SondeNumeroSerie: string | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Etat_Alarme: boolean | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
  }

  export type Ts_mesureCountAggregateOutputType = {
    IdServeurBDD: number
    IdMesure: number
    DateHeureMesure: number
    Valeur: number
    Resistance: number
    Nb_decimal: number
    Consigne: number
    Consigne_Sup: number
    Consigne_Inf: number
    Unite: number
    SondeNumeroSerie: number
    IdLieu: number
    ValeurNull: number
    Frequence: number
    Etat_Alarme: number
    Consigne_Inf_PreAlarme: number
    Consigne_Sup_PreAlarme: number
    Moyenne: number
    _all: number
  }


  export type Ts_mesureAvgAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
  }

  export type Ts_mesureSumAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
  }

  export type Ts_mesureMinAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    DateHeureMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    SondeNumeroSerie?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
  }

  export type Ts_mesureMaxAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    DateHeureMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    SondeNumeroSerie?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
  }

  export type Ts_mesureCountAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    DateHeureMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    SondeNumeroSerie?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
    _all?: true
  }

  export type Ts_mesureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesure to aggregate.
     */
    where?: ts_mesureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesures to fetch.
     */
    orderBy?: ts_mesureOrderByWithRelationInput | ts_mesureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_mesureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_mesures
    **/
    _count?: true | Ts_mesureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_mesureAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_mesureSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_mesureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_mesureMaxAggregateInputType
  }

  export type GetTs_mesureAggregateType<T extends Ts_mesureAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_mesure]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_mesure[P]>
      : GetScalarType<T[P], AggregateTs_mesure[P]>
  }




  export type ts_mesureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_mesureWhereInput
    orderBy?: ts_mesureOrderByWithAggregationInput | ts_mesureOrderByWithAggregationInput[]
    by: Ts_mesureScalarFieldEnum[] | Ts_mesureScalarFieldEnum
    having?: ts_mesureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_mesureCountAggregateInputType | true
    _avg?: Ts_mesureAvgAggregateInputType
    _sum?: Ts_mesureSumAggregateInputType
    _min?: Ts_mesureMinAggregateInputType
    _max?: Ts_mesureMaxAggregateInputType
  }

  export type Ts_mesureGroupByOutputType = {
    IdServeurBDD: number
    IdMesure: number
    DateHeureMesure: Date
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    SondeNumeroSerie: string | null
    IdLieu: number
    ValeurNull: number
    Frequence: number | null
    Etat_Alarme: boolean | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
    _count: Ts_mesureCountAggregateOutputType | null
    _avg: Ts_mesureAvgAggregateOutputType | null
    _sum: Ts_mesureSumAggregateOutputType | null
    _min: Ts_mesureMinAggregateOutputType | null
    _max: Ts_mesureMaxAggregateOutputType | null
  }

  type GetTs_mesureGroupByPayload<T extends ts_mesureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_mesureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_mesureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_mesureGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_mesureGroupByOutputType[P]>
        }
      >
    >


  export type ts_mesureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdMesure?: boolean
    DateHeureMesure?: boolean
    Valeur?: boolean
    Resistance?: boolean
    Nb_decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    SondeNumeroSerie?: boolean
    IdLieu?: boolean
    ValeurNull?: boolean
    Frequence?: boolean
    Etat_Alarme?: boolean
    Consigne_Inf_PreAlarme?: boolean
    Consigne_Sup_PreAlarme?: boolean
    Moyenne?: boolean
  }, ExtArgs["result"]["ts_mesure"]>



  export type ts_mesureSelectScalar = {
    IdServeurBDD?: boolean
    IdMesure?: boolean
    DateHeureMesure?: boolean
    Valeur?: boolean
    Resistance?: boolean
    Nb_decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    SondeNumeroSerie?: boolean
    IdLieu?: boolean
    ValeurNull?: boolean
    Frequence?: boolean
    Etat_Alarme?: boolean
    Consigne_Inf_PreAlarme?: boolean
    Consigne_Sup_PreAlarme?: boolean
    Moyenne?: boolean
  }

  export type ts_mesureOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdMesure" | "DateHeureMesure" | "Valeur" | "Resistance" | "Nb_decimal" | "Consigne" | "Consigne_Sup" | "Consigne_Inf" | "Unite" | "SondeNumeroSerie" | "IdLieu" | "ValeurNull" | "Frequence" | "Etat_Alarme" | "Consigne_Inf_PreAlarme" | "Consigne_Sup_PreAlarme" | "Moyenne", ExtArgs["result"]["ts_mesure"]>

  export type $ts_mesurePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_mesure"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdMesure: number
      DateHeureMesure: Date
      Valeur: number | null
      Resistance: number | null
      Nb_decimal: number | null
      Consigne: number | null
      Consigne_Sup: number | null
      Consigne_Inf: number | null
      Unite: string | null
      SondeNumeroSerie: string | null
      IdLieu: number
      ValeurNull: number
      Frequence: number | null
      Etat_Alarme: boolean | null
      Consigne_Inf_PreAlarme: number | null
      Consigne_Sup_PreAlarme: number | null
      Moyenne: number | null
    }, ExtArgs["result"]["ts_mesure"]>
    composites: {}
  }

  type ts_mesureGetPayload<S extends boolean | null | undefined | ts_mesureDefaultArgs> = $Result.GetResult<Prisma.$ts_mesurePayload, S>

  type ts_mesureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_mesureFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_mesureCountAggregateInputType | true
    }

  export interface ts_mesureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_mesure'], meta: { name: 'ts_mesure' } }
    /**
     * Find zero or one Ts_mesure that matches the filter.
     * @param {ts_mesureFindUniqueArgs} args - Arguments to find a Ts_mesure
     * @example
     * // Get one Ts_mesure
     * const ts_mesure = await prisma.ts_mesure.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_mesureFindUniqueArgs>(args: SelectSubset<T, ts_mesureFindUniqueArgs<ExtArgs>>): Prisma__ts_mesureClient<$Result.GetResult<Prisma.$ts_mesurePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_mesure that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_mesureFindUniqueOrThrowArgs} args - Arguments to find a Ts_mesure
     * @example
     * // Get one Ts_mesure
     * const ts_mesure = await prisma.ts_mesure.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_mesureFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_mesureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_mesureClient<$Result.GetResult<Prisma.$ts_mesurePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesure that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureFindFirstArgs} args - Arguments to find a Ts_mesure
     * @example
     * // Get one Ts_mesure
     * const ts_mesure = await prisma.ts_mesure.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_mesureFindFirstArgs>(args?: SelectSubset<T, ts_mesureFindFirstArgs<ExtArgs>>): Prisma__ts_mesureClient<$Result.GetResult<Prisma.$ts_mesurePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesure that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureFindFirstOrThrowArgs} args - Arguments to find a Ts_mesure
     * @example
     * // Get one Ts_mesure
     * const ts_mesure = await prisma.ts_mesure.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_mesureFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_mesureFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_mesureClient<$Result.GetResult<Prisma.$ts_mesurePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_mesures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_mesures
     * const ts_mesures = await prisma.ts_mesure.findMany()
     * 
     * // Get first 10 Ts_mesures
     * const ts_mesures = await prisma.ts_mesure.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_mesureWithIdServeurBDDOnly = await prisma.ts_mesure.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_mesureFindManyArgs>(args?: SelectSubset<T, ts_mesureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_mesurePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_mesure.
     * @param {ts_mesureCreateArgs} args - Arguments to create a Ts_mesure.
     * @example
     * // Create one Ts_mesure
     * const Ts_mesure = await prisma.ts_mesure.create({
     *   data: {
     *     // ... data to create a Ts_mesure
     *   }
     * })
     * 
     */
    create<T extends ts_mesureCreateArgs>(args: SelectSubset<T, ts_mesureCreateArgs<ExtArgs>>): Prisma__ts_mesureClient<$Result.GetResult<Prisma.$ts_mesurePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_mesures.
     * @param {ts_mesureCreateManyArgs} args - Arguments to create many Ts_mesures.
     * @example
     * // Create many Ts_mesures
     * const ts_mesure = await prisma.ts_mesure.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_mesureCreateManyArgs>(args?: SelectSubset<T, ts_mesureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_mesure.
     * @param {ts_mesureDeleteArgs} args - Arguments to delete one Ts_mesure.
     * @example
     * // Delete one Ts_mesure
     * const Ts_mesure = await prisma.ts_mesure.delete({
     *   where: {
     *     // ... filter to delete one Ts_mesure
     *   }
     * })
     * 
     */
    delete<T extends ts_mesureDeleteArgs>(args: SelectSubset<T, ts_mesureDeleteArgs<ExtArgs>>): Prisma__ts_mesureClient<$Result.GetResult<Prisma.$ts_mesurePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_mesure.
     * @param {ts_mesureUpdateArgs} args - Arguments to update one Ts_mesure.
     * @example
     * // Update one Ts_mesure
     * const ts_mesure = await prisma.ts_mesure.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_mesureUpdateArgs>(args: SelectSubset<T, ts_mesureUpdateArgs<ExtArgs>>): Prisma__ts_mesureClient<$Result.GetResult<Prisma.$ts_mesurePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_mesures.
     * @param {ts_mesureDeleteManyArgs} args - Arguments to filter Ts_mesures to delete.
     * @example
     * // Delete a few Ts_mesures
     * const { count } = await prisma.ts_mesure.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_mesureDeleteManyArgs>(args?: SelectSubset<T, ts_mesureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_mesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_mesures
     * const ts_mesure = await prisma.ts_mesure.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_mesureUpdateManyArgs>(args: SelectSubset<T, ts_mesureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_mesure.
     * @param {ts_mesureUpsertArgs} args - Arguments to update or create a Ts_mesure.
     * @example
     * // Update or create a Ts_mesure
     * const ts_mesure = await prisma.ts_mesure.upsert({
     *   create: {
     *     // ... data to create a Ts_mesure
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_mesure we want to update
     *   }
     * })
     */
    upsert<T extends ts_mesureUpsertArgs>(args: SelectSubset<T, ts_mesureUpsertArgs<ExtArgs>>): Prisma__ts_mesureClient<$Result.GetResult<Prisma.$ts_mesurePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_mesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureCountArgs} args - Arguments to filter Ts_mesures to count.
     * @example
     * // Count the number of Ts_mesures
     * const count = await prisma.ts_mesure.count({
     *   where: {
     *     // ... the filter for the Ts_mesures we want to count
     *   }
     * })
    **/
    count<T extends ts_mesureCountArgs>(
      args?: Subset<T, ts_mesureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_mesureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_mesure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_mesureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_mesureAggregateArgs>(args: Subset<T, Ts_mesureAggregateArgs>): Prisma.PrismaPromise<GetTs_mesureAggregateType<T>>

    /**
     * Group by Ts_mesure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureGroupByArgs} args - Group by arguments.
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
      T extends ts_mesureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_mesureGroupByArgs['orderBy'] }
        : { orderBy?: ts_mesureGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_mesureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_mesureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_mesure model
   */
  readonly fields: ts_mesureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_mesure.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_mesureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_mesure model
   */
  interface ts_mesureFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_mesure", 'Int'>
    readonly IdMesure: FieldRef<"ts_mesure", 'Int'>
    readonly DateHeureMesure: FieldRef<"ts_mesure", 'DateTime'>
    readonly Valeur: FieldRef<"ts_mesure", 'Float'>
    readonly Resistance: FieldRef<"ts_mesure", 'Float'>
    readonly Nb_decimal: FieldRef<"ts_mesure", 'Int'>
    readonly Consigne: FieldRef<"ts_mesure", 'Float'>
    readonly Consigne_Sup: FieldRef<"ts_mesure", 'Float'>
    readonly Consigne_Inf: FieldRef<"ts_mesure", 'Float'>
    readonly Unite: FieldRef<"ts_mesure", 'String'>
    readonly SondeNumeroSerie: FieldRef<"ts_mesure", 'String'>
    readonly IdLieu: FieldRef<"ts_mesure", 'Int'>
    readonly ValeurNull: FieldRef<"ts_mesure", 'Int'>
    readonly Frequence: FieldRef<"ts_mesure", 'Int'>
    readonly Etat_Alarme: FieldRef<"ts_mesure", 'Boolean'>
    readonly Consigne_Inf_PreAlarme: FieldRef<"ts_mesure", 'Float'>
    readonly Consigne_Sup_PreAlarme: FieldRef<"ts_mesure", 'Float'>
    readonly Moyenne: FieldRef<"ts_mesure", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * ts_mesure findUnique
   */
  export type ts_mesureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesure to fetch.
     */
    where: ts_mesureWhereUniqueInput
  }

  /**
   * ts_mesure findUniqueOrThrow
   */
  export type ts_mesureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesure to fetch.
     */
    where: ts_mesureWhereUniqueInput
  }

  /**
   * ts_mesure findFirst
   */
  export type ts_mesureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesure to fetch.
     */
    where?: ts_mesureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesures to fetch.
     */
    orderBy?: ts_mesureOrderByWithRelationInput | ts_mesureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesures.
     */
    cursor?: ts_mesureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesures.
     */
    distinct?: Ts_mesureScalarFieldEnum | Ts_mesureScalarFieldEnum[]
  }

  /**
   * ts_mesure findFirstOrThrow
   */
  export type ts_mesureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesure to fetch.
     */
    where?: ts_mesureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesures to fetch.
     */
    orderBy?: ts_mesureOrderByWithRelationInput | ts_mesureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesures.
     */
    cursor?: ts_mesureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesures.
     */
    distinct?: Ts_mesureScalarFieldEnum | Ts_mesureScalarFieldEnum[]
  }

  /**
   * ts_mesure findMany
   */
  export type ts_mesureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesures to fetch.
     */
    where?: ts_mesureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesures to fetch.
     */
    orderBy?: ts_mesureOrderByWithRelationInput | ts_mesureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_mesures.
     */
    cursor?: ts_mesureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesures.
     */
    skip?: number
    distinct?: Ts_mesureScalarFieldEnum | Ts_mesureScalarFieldEnum[]
  }

  /**
   * ts_mesure create
   */
  export type ts_mesureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_mesure.
     */
    data?: XOR<ts_mesureCreateInput, ts_mesureUncheckedCreateInput>
  }

  /**
   * ts_mesure createMany
   */
  export type ts_mesureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_mesures.
     */
    data: ts_mesureCreateManyInput | ts_mesureCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_mesure update
   */
  export type ts_mesureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_mesure.
     */
    data: XOR<ts_mesureUpdateInput, ts_mesureUncheckedUpdateInput>
    /**
     * Choose, which ts_mesure to update.
     */
    where: ts_mesureWhereUniqueInput
  }

  /**
   * ts_mesure updateMany
   */
  export type ts_mesureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_mesures.
     */
    data: XOR<ts_mesureUpdateManyMutationInput, ts_mesureUncheckedUpdateManyInput>
    /**
     * Filter which ts_mesures to update
     */
    where?: ts_mesureWhereInput
    /**
     * Limit how many ts_mesures to update.
     */
    limit?: number
  }

  /**
   * ts_mesure upsert
   */
  export type ts_mesureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_mesure to update in case it exists.
     */
    where: ts_mesureWhereUniqueInput
    /**
     * In case the ts_mesure found by the `where` argument doesn't exist, create a new ts_mesure with this data.
     */
    create: XOR<ts_mesureCreateInput, ts_mesureUncheckedCreateInput>
    /**
     * In case the ts_mesure was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_mesureUpdateInput, ts_mesureUncheckedUpdateInput>
  }

  /**
   * ts_mesure delete
   */
  export type ts_mesureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
    /**
     * Filter which ts_mesure to delete.
     */
    where: ts_mesureWhereUniqueInput
  }

  /**
   * ts_mesure deleteMany
   */
  export type ts_mesureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesures to delete
     */
    where?: ts_mesureWhereInput
    /**
     * Limit how many ts_mesures to delete.
     */
    limit?: number
  }

  /**
   * ts_mesure without action
   */
  export type ts_mesureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesure
     */
    select?: ts_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesure
     */
    omit?: ts_mesureOmit<ExtArgs> | null
  }


  /**
   * Model ts_mesurecalibrage
   */

  export type AggregateTs_mesurecalibrage = {
    _count: Ts_mesurecalibrageCountAggregateOutputType | null
    _avg: Ts_mesurecalibrageAvgAggregateOutputType | null
    _sum: Ts_mesurecalibrageSumAggregateOutputType | null
    _min: Ts_mesurecalibrageMinAggregateOutputType | null
    _max: Ts_mesurecalibrageMaxAggregateOutputType | null
  }

  export type Ts_mesurecalibrageAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureCalibrage: number | null
    ValeurNull: number | null
  }

  export type Ts_mesurecalibrageSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureCalibrage: number | null
    ValeurNull: number | null
  }

  export type Ts_mesurecalibrageMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureCalibrage: number | null
    Valeur: string | null
    Resistance: string | null
    SondeNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
  }

  export type Ts_mesurecalibrageMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureCalibrage: number | null
    Valeur: string | null
    Resistance: string | null
    SondeNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
  }

  export type Ts_mesurecalibrageCountAggregateOutputType = {
    IdServeurBDD: number
    IdMesureCalibrage: number
    Valeur: number
    Resistance: number
    SondeNumeroSerie: number
    ValeurNull: number
    DateHeure: number
    _all: number
  }


  export type Ts_mesurecalibrageAvgAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrage?: true
    ValeurNull?: true
  }

  export type Ts_mesurecalibrageSumAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrage?: true
    ValeurNull?: true
  }

  export type Ts_mesurecalibrageMinAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrage?: true
    Valeur?: true
    Resistance?: true
    SondeNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
  }

  export type Ts_mesurecalibrageMaxAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrage?: true
    Valeur?: true
    Resistance?: true
    SondeNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
  }

  export type Ts_mesurecalibrageCountAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrage?: true
    Valeur?: true
    Resistance?: true
    SondeNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    _all?: true
  }

  export type Ts_mesurecalibrageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesurecalibrage to aggregate.
     */
    where?: ts_mesurecalibrageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurecalibrages to fetch.
     */
    orderBy?: ts_mesurecalibrageOrderByWithRelationInput | ts_mesurecalibrageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_mesurecalibrageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurecalibrages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurecalibrages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_mesurecalibrages
    **/
    _count?: true | Ts_mesurecalibrageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_mesurecalibrageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_mesurecalibrageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_mesurecalibrageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_mesurecalibrageMaxAggregateInputType
  }

  export type GetTs_mesurecalibrageAggregateType<T extends Ts_mesurecalibrageAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_mesurecalibrage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_mesurecalibrage[P]>
      : GetScalarType<T[P], AggregateTs_mesurecalibrage[P]>
  }




  export type ts_mesurecalibrageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_mesurecalibrageWhereInput
    orderBy?: ts_mesurecalibrageOrderByWithAggregationInput | ts_mesurecalibrageOrderByWithAggregationInput[]
    by: Ts_mesurecalibrageScalarFieldEnum[] | Ts_mesurecalibrageScalarFieldEnum
    having?: ts_mesurecalibrageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_mesurecalibrageCountAggregateInputType | true
    _avg?: Ts_mesurecalibrageAvgAggregateInputType
    _sum?: Ts_mesurecalibrageSumAggregateInputType
    _min?: Ts_mesurecalibrageMinAggregateInputType
    _max?: Ts_mesurecalibrageMaxAggregateInputType
  }

  export type Ts_mesurecalibrageGroupByOutputType = {
    IdServeurBDD: number
    IdMesureCalibrage: number
    Valeur: string
    Resistance: string
    SondeNumeroSerie: string
    ValeurNull: number
    DateHeure: Date
    _count: Ts_mesurecalibrageCountAggregateOutputType | null
    _avg: Ts_mesurecalibrageAvgAggregateOutputType | null
    _sum: Ts_mesurecalibrageSumAggregateOutputType | null
    _min: Ts_mesurecalibrageMinAggregateOutputType | null
    _max: Ts_mesurecalibrageMaxAggregateOutputType | null
  }

  type GetTs_mesurecalibrageGroupByPayload<T extends ts_mesurecalibrageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_mesurecalibrageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_mesurecalibrageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_mesurecalibrageGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_mesurecalibrageGroupByOutputType[P]>
        }
      >
    >


  export type ts_mesurecalibrageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdMesureCalibrage?: boolean
    Valeur?: boolean
    Resistance?: boolean
    SondeNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
  }, ExtArgs["result"]["ts_mesurecalibrage"]>



  export type ts_mesurecalibrageSelectScalar = {
    IdServeurBDD?: boolean
    IdMesureCalibrage?: boolean
    Valeur?: boolean
    Resistance?: boolean
    SondeNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
  }

  export type ts_mesurecalibrageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdMesureCalibrage" | "Valeur" | "Resistance" | "SondeNumeroSerie" | "ValeurNull" | "DateHeure", ExtArgs["result"]["ts_mesurecalibrage"]>

  export type $ts_mesurecalibragePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_mesurecalibrage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdMesureCalibrage: number
      Valeur: string
      Resistance: string
      SondeNumeroSerie: string
      ValeurNull: number
      DateHeure: Date
    }, ExtArgs["result"]["ts_mesurecalibrage"]>
    composites: {}
  }

  type ts_mesurecalibrageGetPayload<S extends boolean | null | undefined | ts_mesurecalibrageDefaultArgs> = $Result.GetResult<Prisma.$ts_mesurecalibragePayload, S>

  type ts_mesurecalibrageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_mesurecalibrageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_mesurecalibrageCountAggregateInputType | true
    }

  export interface ts_mesurecalibrageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_mesurecalibrage'], meta: { name: 'ts_mesurecalibrage' } }
    /**
     * Find zero or one Ts_mesurecalibrage that matches the filter.
     * @param {ts_mesurecalibrageFindUniqueArgs} args - Arguments to find a Ts_mesurecalibrage
     * @example
     * // Get one Ts_mesurecalibrage
     * const ts_mesurecalibrage = await prisma.ts_mesurecalibrage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_mesurecalibrageFindUniqueArgs>(args: SelectSubset<T, ts_mesurecalibrageFindUniqueArgs<ExtArgs>>): Prisma__ts_mesurecalibrageClient<$Result.GetResult<Prisma.$ts_mesurecalibragePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_mesurecalibrage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_mesurecalibrageFindUniqueOrThrowArgs} args - Arguments to find a Ts_mesurecalibrage
     * @example
     * // Get one Ts_mesurecalibrage
     * const ts_mesurecalibrage = await prisma.ts_mesurecalibrage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_mesurecalibrageFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_mesurecalibrageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_mesurecalibrageClient<$Result.GetResult<Prisma.$ts_mesurecalibragePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesurecalibrage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageFindFirstArgs} args - Arguments to find a Ts_mesurecalibrage
     * @example
     * // Get one Ts_mesurecalibrage
     * const ts_mesurecalibrage = await prisma.ts_mesurecalibrage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_mesurecalibrageFindFirstArgs>(args?: SelectSubset<T, ts_mesurecalibrageFindFirstArgs<ExtArgs>>): Prisma__ts_mesurecalibrageClient<$Result.GetResult<Prisma.$ts_mesurecalibragePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesurecalibrage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageFindFirstOrThrowArgs} args - Arguments to find a Ts_mesurecalibrage
     * @example
     * // Get one Ts_mesurecalibrage
     * const ts_mesurecalibrage = await prisma.ts_mesurecalibrage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_mesurecalibrageFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_mesurecalibrageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_mesurecalibrageClient<$Result.GetResult<Prisma.$ts_mesurecalibragePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_mesurecalibrages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_mesurecalibrages
     * const ts_mesurecalibrages = await prisma.ts_mesurecalibrage.findMany()
     * 
     * // Get first 10 Ts_mesurecalibrages
     * const ts_mesurecalibrages = await prisma.ts_mesurecalibrage.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_mesurecalibrageWithIdServeurBDDOnly = await prisma.ts_mesurecalibrage.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_mesurecalibrageFindManyArgs>(args?: SelectSubset<T, ts_mesurecalibrageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_mesurecalibragePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_mesurecalibrage.
     * @param {ts_mesurecalibrageCreateArgs} args - Arguments to create a Ts_mesurecalibrage.
     * @example
     * // Create one Ts_mesurecalibrage
     * const Ts_mesurecalibrage = await prisma.ts_mesurecalibrage.create({
     *   data: {
     *     // ... data to create a Ts_mesurecalibrage
     *   }
     * })
     * 
     */
    create<T extends ts_mesurecalibrageCreateArgs>(args: SelectSubset<T, ts_mesurecalibrageCreateArgs<ExtArgs>>): Prisma__ts_mesurecalibrageClient<$Result.GetResult<Prisma.$ts_mesurecalibragePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_mesurecalibrages.
     * @param {ts_mesurecalibrageCreateManyArgs} args - Arguments to create many Ts_mesurecalibrages.
     * @example
     * // Create many Ts_mesurecalibrages
     * const ts_mesurecalibrage = await prisma.ts_mesurecalibrage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_mesurecalibrageCreateManyArgs>(args?: SelectSubset<T, ts_mesurecalibrageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_mesurecalibrage.
     * @param {ts_mesurecalibrageDeleteArgs} args - Arguments to delete one Ts_mesurecalibrage.
     * @example
     * // Delete one Ts_mesurecalibrage
     * const Ts_mesurecalibrage = await prisma.ts_mesurecalibrage.delete({
     *   where: {
     *     // ... filter to delete one Ts_mesurecalibrage
     *   }
     * })
     * 
     */
    delete<T extends ts_mesurecalibrageDeleteArgs>(args: SelectSubset<T, ts_mesurecalibrageDeleteArgs<ExtArgs>>): Prisma__ts_mesurecalibrageClient<$Result.GetResult<Prisma.$ts_mesurecalibragePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_mesurecalibrage.
     * @param {ts_mesurecalibrageUpdateArgs} args - Arguments to update one Ts_mesurecalibrage.
     * @example
     * // Update one Ts_mesurecalibrage
     * const ts_mesurecalibrage = await prisma.ts_mesurecalibrage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_mesurecalibrageUpdateArgs>(args: SelectSubset<T, ts_mesurecalibrageUpdateArgs<ExtArgs>>): Prisma__ts_mesurecalibrageClient<$Result.GetResult<Prisma.$ts_mesurecalibragePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_mesurecalibrages.
     * @param {ts_mesurecalibrageDeleteManyArgs} args - Arguments to filter Ts_mesurecalibrages to delete.
     * @example
     * // Delete a few Ts_mesurecalibrages
     * const { count } = await prisma.ts_mesurecalibrage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_mesurecalibrageDeleteManyArgs>(args?: SelectSubset<T, ts_mesurecalibrageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_mesurecalibrages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_mesurecalibrages
     * const ts_mesurecalibrage = await prisma.ts_mesurecalibrage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_mesurecalibrageUpdateManyArgs>(args: SelectSubset<T, ts_mesurecalibrageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_mesurecalibrage.
     * @param {ts_mesurecalibrageUpsertArgs} args - Arguments to update or create a Ts_mesurecalibrage.
     * @example
     * // Update or create a Ts_mesurecalibrage
     * const ts_mesurecalibrage = await prisma.ts_mesurecalibrage.upsert({
     *   create: {
     *     // ... data to create a Ts_mesurecalibrage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_mesurecalibrage we want to update
     *   }
     * })
     */
    upsert<T extends ts_mesurecalibrageUpsertArgs>(args: SelectSubset<T, ts_mesurecalibrageUpsertArgs<ExtArgs>>): Prisma__ts_mesurecalibrageClient<$Result.GetResult<Prisma.$ts_mesurecalibragePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_mesurecalibrages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageCountArgs} args - Arguments to filter Ts_mesurecalibrages to count.
     * @example
     * // Count the number of Ts_mesurecalibrages
     * const count = await prisma.ts_mesurecalibrage.count({
     *   where: {
     *     // ... the filter for the Ts_mesurecalibrages we want to count
     *   }
     * })
    **/
    count<T extends ts_mesurecalibrageCountArgs>(
      args?: Subset<T, ts_mesurecalibrageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_mesurecalibrageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_mesurecalibrage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_mesurecalibrageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_mesurecalibrageAggregateArgs>(args: Subset<T, Ts_mesurecalibrageAggregateArgs>): Prisma.PrismaPromise<GetTs_mesurecalibrageAggregateType<T>>

    /**
     * Group by Ts_mesurecalibrage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageGroupByArgs} args - Group by arguments.
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
      T extends ts_mesurecalibrageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_mesurecalibrageGroupByArgs['orderBy'] }
        : { orderBy?: ts_mesurecalibrageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_mesurecalibrageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_mesurecalibrageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_mesurecalibrage model
   */
  readonly fields: ts_mesurecalibrageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_mesurecalibrage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_mesurecalibrageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_mesurecalibrage model
   */
  interface ts_mesurecalibrageFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_mesurecalibrage", 'Int'>
    readonly IdMesureCalibrage: FieldRef<"ts_mesurecalibrage", 'Int'>
    readonly Valeur: FieldRef<"ts_mesurecalibrage", 'String'>
    readonly Resistance: FieldRef<"ts_mesurecalibrage", 'String'>
    readonly SondeNumeroSerie: FieldRef<"ts_mesurecalibrage", 'String'>
    readonly ValeurNull: FieldRef<"ts_mesurecalibrage", 'Int'>
    readonly DateHeure: FieldRef<"ts_mesurecalibrage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ts_mesurecalibrage findUnique
   */
  export type ts_mesurecalibrageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrage to fetch.
     */
    where: ts_mesurecalibrageWhereUniqueInput
  }

  /**
   * ts_mesurecalibrage findUniqueOrThrow
   */
  export type ts_mesurecalibrageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrage to fetch.
     */
    where: ts_mesurecalibrageWhereUniqueInput
  }

  /**
   * ts_mesurecalibrage findFirst
   */
  export type ts_mesurecalibrageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrage to fetch.
     */
    where?: ts_mesurecalibrageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurecalibrages to fetch.
     */
    orderBy?: ts_mesurecalibrageOrderByWithRelationInput | ts_mesurecalibrageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesurecalibrages.
     */
    cursor?: ts_mesurecalibrageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurecalibrages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurecalibrages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesurecalibrages.
     */
    distinct?: Ts_mesurecalibrageScalarFieldEnum | Ts_mesurecalibrageScalarFieldEnum[]
  }

  /**
   * ts_mesurecalibrage findFirstOrThrow
   */
  export type ts_mesurecalibrageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrage to fetch.
     */
    where?: ts_mesurecalibrageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurecalibrages to fetch.
     */
    orderBy?: ts_mesurecalibrageOrderByWithRelationInput | ts_mesurecalibrageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesurecalibrages.
     */
    cursor?: ts_mesurecalibrageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurecalibrages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurecalibrages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesurecalibrages.
     */
    distinct?: Ts_mesurecalibrageScalarFieldEnum | Ts_mesurecalibrageScalarFieldEnum[]
  }

  /**
   * ts_mesurecalibrage findMany
   */
  export type ts_mesurecalibrageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrages to fetch.
     */
    where?: ts_mesurecalibrageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurecalibrages to fetch.
     */
    orderBy?: ts_mesurecalibrageOrderByWithRelationInput | ts_mesurecalibrageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_mesurecalibrages.
     */
    cursor?: ts_mesurecalibrageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurecalibrages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurecalibrages.
     */
    skip?: number
    distinct?: Ts_mesurecalibrageScalarFieldEnum | Ts_mesurecalibrageScalarFieldEnum[]
  }

  /**
   * ts_mesurecalibrage create
   */
  export type ts_mesurecalibrageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_mesurecalibrage.
     */
    data: XOR<ts_mesurecalibrageCreateInput, ts_mesurecalibrageUncheckedCreateInput>
  }

  /**
   * ts_mesurecalibrage createMany
   */
  export type ts_mesurecalibrageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_mesurecalibrages.
     */
    data: ts_mesurecalibrageCreateManyInput | ts_mesurecalibrageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_mesurecalibrage update
   */
  export type ts_mesurecalibrageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_mesurecalibrage.
     */
    data: XOR<ts_mesurecalibrageUpdateInput, ts_mesurecalibrageUncheckedUpdateInput>
    /**
     * Choose, which ts_mesurecalibrage to update.
     */
    where: ts_mesurecalibrageWhereUniqueInput
  }

  /**
   * ts_mesurecalibrage updateMany
   */
  export type ts_mesurecalibrageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_mesurecalibrages.
     */
    data: XOR<ts_mesurecalibrageUpdateManyMutationInput, ts_mesurecalibrageUncheckedUpdateManyInput>
    /**
     * Filter which ts_mesurecalibrages to update
     */
    where?: ts_mesurecalibrageWhereInput
    /**
     * Limit how many ts_mesurecalibrages to update.
     */
    limit?: number
  }

  /**
   * ts_mesurecalibrage upsert
   */
  export type ts_mesurecalibrageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_mesurecalibrage to update in case it exists.
     */
    where: ts_mesurecalibrageWhereUniqueInput
    /**
     * In case the ts_mesurecalibrage found by the `where` argument doesn't exist, create a new ts_mesurecalibrage with this data.
     */
    create: XOR<ts_mesurecalibrageCreateInput, ts_mesurecalibrageUncheckedCreateInput>
    /**
     * In case the ts_mesurecalibrage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_mesurecalibrageUpdateInput, ts_mesurecalibrageUncheckedUpdateInput>
  }

  /**
   * ts_mesurecalibrage delete
   */
  export type ts_mesurecalibrageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
    /**
     * Filter which ts_mesurecalibrage to delete.
     */
    where: ts_mesurecalibrageWhereUniqueInput
  }

  /**
   * ts_mesurecalibrage deleteMany
   */
  export type ts_mesurecalibrageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesurecalibrages to delete
     */
    where?: ts_mesurecalibrageWhereInput
    /**
     * Limit how many ts_mesurecalibrages to delete.
     */
    limit?: number
  }

  /**
   * ts_mesurecalibrage without action
   */
  export type ts_mesurecalibrageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrage
     */
    select?: ts_mesurecalibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrage
     */
    omit?: ts_mesurecalibrageOmit<ExtArgs> | null
  }


  /**
   * Model ts_mesurecalibrageetalon
   */

  export type AggregateTs_mesurecalibrageetalon = {
    _count: Ts_mesurecalibrageetalonCountAggregateOutputType | null
    _avg: Ts_mesurecalibrageetalonAvgAggregateOutputType | null
    _sum: Ts_mesurecalibrageetalonSumAggregateOutputType | null
    _min: Ts_mesurecalibrageetalonMinAggregateOutputType | null
    _max: Ts_mesurecalibrageetalonMaxAggregateOutputType | null
  }

  export type Ts_mesurecalibrageetalonAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureCalibrageEtalon: number | null
    ValeurNull: number | null
  }

  export type Ts_mesurecalibrageetalonSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureCalibrageEtalon: number | null
    ValeurNull: number | null
  }

  export type Ts_mesurecalibrageetalonMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureCalibrageEtalon: number | null
    Valeur: string | null
    Resistance: string | null
    EtalonNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
  }

  export type Ts_mesurecalibrageetalonMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureCalibrageEtalon: number | null
    Valeur: string | null
    Resistance: string | null
    EtalonNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
  }

  export type Ts_mesurecalibrageetalonCountAggregateOutputType = {
    IdServeurBDD: number
    IdMesureCalibrageEtalon: number
    Valeur: number
    Resistance: number
    EtalonNumeroSerie: number
    ValeurNull: number
    DateHeure: number
    _all: number
  }


  export type Ts_mesurecalibrageetalonAvgAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrageEtalon?: true
    ValeurNull?: true
  }

  export type Ts_mesurecalibrageetalonSumAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrageEtalon?: true
    ValeurNull?: true
  }

  export type Ts_mesurecalibrageetalonMinAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrageEtalon?: true
    Valeur?: true
    Resistance?: true
    EtalonNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
  }

  export type Ts_mesurecalibrageetalonMaxAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrageEtalon?: true
    Valeur?: true
    Resistance?: true
    EtalonNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
  }

  export type Ts_mesurecalibrageetalonCountAggregateInputType = {
    IdServeurBDD?: true
    IdMesureCalibrageEtalon?: true
    Valeur?: true
    Resistance?: true
    EtalonNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    _all?: true
  }

  export type Ts_mesurecalibrageetalonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesurecalibrageetalon to aggregate.
     */
    where?: ts_mesurecalibrageetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurecalibrageetalons to fetch.
     */
    orderBy?: ts_mesurecalibrageetalonOrderByWithRelationInput | ts_mesurecalibrageetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_mesurecalibrageetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurecalibrageetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurecalibrageetalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_mesurecalibrageetalons
    **/
    _count?: true | Ts_mesurecalibrageetalonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_mesurecalibrageetalonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_mesurecalibrageetalonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_mesurecalibrageetalonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_mesurecalibrageetalonMaxAggregateInputType
  }

  export type GetTs_mesurecalibrageetalonAggregateType<T extends Ts_mesurecalibrageetalonAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_mesurecalibrageetalon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_mesurecalibrageetalon[P]>
      : GetScalarType<T[P], AggregateTs_mesurecalibrageetalon[P]>
  }




  export type ts_mesurecalibrageetalonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_mesurecalibrageetalonWhereInput
    orderBy?: ts_mesurecalibrageetalonOrderByWithAggregationInput | ts_mesurecalibrageetalonOrderByWithAggregationInput[]
    by: Ts_mesurecalibrageetalonScalarFieldEnum[] | Ts_mesurecalibrageetalonScalarFieldEnum
    having?: ts_mesurecalibrageetalonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_mesurecalibrageetalonCountAggregateInputType | true
    _avg?: Ts_mesurecalibrageetalonAvgAggregateInputType
    _sum?: Ts_mesurecalibrageetalonSumAggregateInputType
    _min?: Ts_mesurecalibrageetalonMinAggregateInputType
    _max?: Ts_mesurecalibrageetalonMaxAggregateInputType
  }

  export type Ts_mesurecalibrageetalonGroupByOutputType = {
    IdServeurBDD: number
    IdMesureCalibrageEtalon: number
    Valeur: string
    Resistance: string
    EtalonNumeroSerie: string
    ValeurNull: number
    DateHeure: Date
    _count: Ts_mesurecalibrageetalonCountAggregateOutputType | null
    _avg: Ts_mesurecalibrageetalonAvgAggregateOutputType | null
    _sum: Ts_mesurecalibrageetalonSumAggregateOutputType | null
    _min: Ts_mesurecalibrageetalonMinAggregateOutputType | null
    _max: Ts_mesurecalibrageetalonMaxAggregateOutputType | null
  }

  type GetTs_mesurecalibrageetalonGroupByPayload<T extends ts_mesurecalibrageetalonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_mesurecalibrageetalonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_mesurecalibrageetalonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_mesurecalibrageetalonGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_mesurecalibrageetalonGroupByOutputType[P]>
        }
      >
    >


  export type ts_mesurecalibrageetalonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdMesureCalibrageEtalon?: boolean
    Valeur?: boolean
    Resistance?: boolean
    EtalonNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
  }, ExtArgs["result"]["ts_mesurecalibrageetalon"]>



  export type ts_mesurecalibrageetalonSelectScalar = {
    IdServeurBDD?: boolean
    IdMesureCalibrageEtalon?: boolean
    Valeur?: boolean
    Resistance?: boolean
    EtalonNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
  }

  export type ts_mesurecalibrageetalonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdMesureCalibrageEtalon" | "Valeur" | "Resistance" | "EtalonNumeroSerie" | "ValeurNull" | "DateHeure", ExtArgs["result"]["ts_mesurecalibrageetalon"]>

  export type $ts_mesurecalibrageetalonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_mesurecalibrageetalon"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdMesureCalibrageEtalon: number
      Valeur: string
      Resistance: string
      EtalonNumeroSerie: string
      ValeurNull: number
      DateHeure: Date
    }, ExtArgs["result"]["ts_mesurecalibrageetalon"]>
    composites: {}
  }

  type ts_mesurecalibrageetalonGetPayload<S extends boolean | null | undefined | ts_mesurecalibrageetalonDefaultArgs> = $Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload, S>

  type ts_mesurecalibrageetalonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_mesurecalibrageetalonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_mesurecalibrageetalonCountAggregateInputType | true
    }

  export interface ts_mesurecalibrageetalonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_mesurecalibrageetalon'], meta: { name: 'ts_mesurecalibrageetalon' } }
    /**
     * Find zero or one Ts_mesurecalibrageetalon that matches the filter.
     * @param {ts_mesurecalibrageetalonFindUniqueArgs} args - Arguments to find a Ts_mesurecalibrageetalon
     * @example
     * // Get one Ts_mesurecalibrageetalon
     * const ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_mesurecalibrageetalonFindUniqueArgs>(args: SelectSubset<T, ts_mesurecalibrageetalonFindUniqueArgs<ExtArgs>>): Prisma__ts_mesurecalibrageetalonClient<$Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_mesurecalibrageetalon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_mesurecalibrageetalonFindUniqueOrThrowArgs} args - Arguments to find a Ts_mesurecalibrageetalon
     * @example
     * // Get one Ts_mesurecalibrageetalon
     * const ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_mesurecalibrageetalonFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_mesurecalibrageetalonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_mesurecalibrageetalonClient<$Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesurecalibrageetalon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageetalonFindFirstArgs} args - Arguments to find a Ts_mesurecalibrageetalon
     * @example
     * // Get one Ts_mesurecalibrageetalon
     * const ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_mesurecalibrageetalonFindFirstArgs>(args?: SelectSubset<T, ts_mesurecalibrageetalonFindFirstArgs<ExtArgs>>): Prisma__ts_mesurecalibrageetalonClient<$Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesurecalibrageetalon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageetalonFindFirstOrThrowArgs} args - Arguments to find a Ts_mesurecalibrageetalon
     * @example
     * // Get one Ts_mesurecalibrageetalon
     * const ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_mesurecalibrageetalonFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_mesurecalibrageetalonFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_mesurecalibrageetalonClient<$Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_mesurecalibrageetalons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageetalonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_mesurecalibrageetalons
     * const ts_mesurecalibrageetalons = await prisma.ts_mesurecalibrageetalon.findMany()
     * 
     * // Get first 10 Ts_mesurecalibrageetalons
     * const ts_mesurecalibrageetalons = await prisma.ts_mesurecalibrageetalon.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_mesurecalibrageetalonWithIdServeurBDDOnly = await prisma.ts_mesurecalibrageetalon.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_mesurecalibrageetalonFindManyArgs>(args?: SelectSubset<T, ts_mesurecalibrageetalonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_mesurecalibrageetalon.
     * @param {ts_mesurecalibrageetalonCreateArgs} args - Arguments to create a Ts_mesurecalibrageetalon.
     * @example
     * // Create one Ts_mesurecalibrageetalon
     * const Ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.create({
     *   data: {
     *     // ... data to create a Ts_mesurecalibrageetalon
     *   }
     * })
     * 
     */
    create<T extends ts_mesurecalibrageetalonCreateArgs>(args: SelectSubset<T, ts_mesurecalibrageetalonCreateArgs<ExtArgs>>): Prisma__ts_mesurecalibrageetalonClient<$Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_mesurecalibrageetalons.
     * @param {ts_mesurecalibrageetalonCreateManyArgs} args - Arguments to create many Ts_mesurecalibrageetalons.
     * @example
     * // Create many Ts_mesurecalibrageetalons
     * const ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_mesurecalibrageetalonCreateManyArgs>(args?: SelectSubset<T, ts_mesurecalibrageetalonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_mesurecalibrageetalon.
     * @param {ts_mesurecalibrageetalonDeleteArgs} args - Arguments to delete one Ts_mesurecalibrageetalon.
     * @example
     * // Delete one Ts_mesurecalibrageetalon
     * const Ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.delete({
     *   where: {
     *     // ... filter to delete one Ts_mesurecalibrageetalon
     *   }
     * })
     * 
     */
    delete<T extends ts_mesurecalibrageetalonDeleteArgs>(args: SelectSubset<T, ts_mesurecalibrageetalonDeleteArgs<ExtArgs>>): Prisma__ts_mesurecalibrageetalonClient<$Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_mesurecalibrageetalon.
     * @param {ts_mesurecalibrageetalonUpdateArgs} args - Arguments to update one Ts_mesurecalibrageetalon.
     * @example
     * // Update one Ts_mesurecalibrageetalon
     * const ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_mesurecalibrageetalonUpdateArgs>(args: SelectSubset<T, ts_mesurecalibrageetalonUpdateArgs<ExtArgs>>): Prisma__ts_mesurecalibrageetalonClient<$Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_mesurecalibrageetalons.
     * @param {ts_mesurecalibrageetalonDeleteManyArgs} args - Arguments to filter Ts_mesurecalibrageetalons to delete.
     * @example
     * // Delete a few Ts_mesurecalibrageetalons
     * const { count } = await prisma.ts_mesurecalibrageetalon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_mesurecalibrageetalonDeleteManyArgs>(args?: SelectSubset<T, ts_mesurecalibrageetalonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_mesurecalibrageetalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageetalonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_mesurecalibrageetalons
     * const ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_mesurecalibrageetalonUpdateManyArgs>(args: SelectSubset<T, ts_mesurecalibrageetalonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_mesurecalibrageetalon.
     * @param {ts_mesurecalibrageetalonUpsertArgs} args - Arguments to update or create a Ts_mesurecalibrageetalon.
     * @example
     * // Update or create a Ts_mesurecalibrageetalon
     * const ts_mesurecalibrageetalon = await prisma.ts_mesurecalibrageetalon.upsert({
     *   create: {
     *     // ... data to create a Ts_mesurecalibrageetalon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_mesurecalibrageetalon we want to update
     *   }
     * })
     */
    upsert<T extends ts_mesurecalibrageetalonUpsertArgs>(args: SelectSubset<T, ts_mesurecalibrageetalonUpsertArgs<ExtArgs>>): Prisma__ts_mesurecalibrageetalonClient<$Result.GetResult<Prisma.$ts_mesurecalibrageetalonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_mesurecalibrageetalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageetalonCountArgs} args - Arguments to filter Ts_mesurecalibrageetalons to count.
     * @example
     * // Count the number of Ts_mesurecalibrageetalons
     * const count = await prisma.ts_mesurecalibrageetalon.count({
     *   where: {
     *     // ... the filter for the Ts_mesurecalibrageetalons we want to count
     *   }
     * })
    **/
    count<T extends ts_mesurecalibrageetalonCountArgs>(
      args?: Subset<T, ts_mesurecalibrageetalonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_mesurecalibrageetalonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_mesurecalibrageetalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_mesurecalibrageetalonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_mesurecalibrageetalonAggregateArgs>(args: Subset<T, Ts_mesurecalibrageetalonAggregateArgs>): Prisma.PrismaPromise<GetTs_mesurecalibrageetalonAggregateType<T>>

    /**
     * Group by Ts_mesurecalibrageetalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurecalibrageetalonGroupByArgs} args - Group by arguments.
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
      T extends ts_mesurecalibrageetalonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_mesurecalibrageetalonGroupByArgs['orderBy'] }
        : { orderBy?: ts_mesurecalibrageetalonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_mesurecalibrageetalonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_mesurecalibrageetalonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_mesurecalibrageetalon model
   */
  readonly fields: ts_mesurecalibrageetalonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_mesurecalibrageetalon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_mesurecalibrageetalonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_mesurecalibrageetalon model
   */
  interface ts_mesurecalibrageetalonFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_mesurecalibrageetalon", 'Int'>
    readonly IdMesureCalibrageEtalon: FieldRef<"ts_mesurecalibrageetalon", 'Int'>
    readonly Valeur: FieldRef<"ts_mesurecalibrageetalon", 'String'>
    readonly Resistance: FieldRef<"ts_mesurecalibrageetalon", 'String'>
    readonly EtalonNumeroSerie: FieldRef<"ts_mesurecalibrageetalon", 'String'>
    readonly ValeurNull: FieldRef<"ts_mesurecalibrageetalon", 'Int'>
    readonly DateHeure: FieldRef<"ts_mesurecalibrageetalon", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ts_mesurecalibrageetalon findUnique
   */
  export type ts_mesurecalibrageetalonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrageetalon to fetch.
     */
    where: ts_mesurecalibrageetalonWhereUniqueInput
  }

  /**
   * ts_mesurecalibrageetalon findUniqueOrThrow
   */
  export type ts_mesurecalibrageetalonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrageetalon to fetch.
     */
    where: ts_mesurecalibrageetalonWhereUniqueInput
  }

  /**
   * ts_mesurecalibrageetalon findFirst
   */
  export type ts_mesurecalibrageetalonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrageetalon to fetch.
     */
    where?: ts_mesurecalibrageetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurecalibrageetalons to fetch.
     */
    orderBy?: ts_mesurecalibrageetalonOrderByWithRelationInput | ts_mesurecalibrageetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesurecalibrageetalons.
     */
    cursor?: ts_mesurecalibrageetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurecalibrageetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurecalibrageetalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesurecalibrageetalons.
     */
    distinct?: Ts_mesurecalibrageetalonScalarFieldEnum | Ts_mesurecalibrageetalonScalarFieldEnum[]
  }

  /**
   * ts_mesurecalibrageetalon findFirstOrThrow
   */
  export type ts_mesurecalibrageetalonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrageetalon to fetch.
     */
    where?: ts_mesurecalibrageetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurecalibrageetalons to fetch.
     */
    orderBy?: ts_mesurecalibrageetalonOrderByWithRelationInput | ts_mesurecalibrageetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesurecalibrageetalons.
     */
    cursor?: ts_mesurecalibrageetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurecalibrageetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurecalibrageetalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesurecalibrageetalons.
     */
    distinct?: Ts_mesurecalibrageetalonScalarFieldEnum | Ts_mesurecalibrageetalonScalarFieldEnum[]
  }

  /**
   * ts_mesurecalibrageetalon findMany
   */
  export type ts_mesurecalibrageetalonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurecalibrageetalons to fetch.
     */
    where?: ts_mesurecalibrageetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurecalibrageetalons to fetch.
     */
    orderBy?: ts_mesurecalibrageetalonOrderByWithRelationInput | ts_mesurecalibrageetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_mesurecalibrageetalons.
     */
    cursor?: ts_mesurecalibrageetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurecalibrageetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurecalibrageetalons.
     */
    skip?: number
    distinct?: Ts_mesurecalibrageetalonScalarFieldEnum | Ts_mesurecalibrageetalonScalarFieldEnum[]
  }

  /**
   * ts_mesurecalibrageetalon create
   */
  export type ts_mesurecalibrageetalonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_mesurecalibrageetalon.
     */
    data: XOR<ts_mesurecalibrageetalonCreateInput, ts_mesurecalibrageetalonUncheckedCreateInput>
  }

  /**
   * ts_mesurecalibrageetalon createMany
   */
  export type ts_mesurecalibrageetalonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_mesurecalibrageetalons.
     */
    data: ts_mesurecalibrageetalonCreateManyInput | ts_mesurecalibrageetalonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_mesurecalibrageetalon update
   */
  export type ts_mesurecalibrageetalonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_mesurecalibrageetalon.
     */
    data: XOR<ts_mesurecalibrageetalonUpdateInput, ts_mesurecalibrageetalonUncheckedUpdateInput>
    /**
     * Choose, which ts_mesurecalibrageetalon to update.
     */
    where: ts_mesurecalibrageetalonWhereUniqueInput
  }

  /**
   * ts_mesurecalibrageetalon updateMany
   */
  export type ts_mesurecalibrageetalonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_mesurecalibrageetalons.
     */
    data: XOR<ts_mesurecalibrageetalonUpdateManyMutationInput, ts_mesurecalibrageetalonUncheckedUpdateManyInput>
    /**
     * Filter which ts_mesurecalibrageetalons to update
     */
    where?: ts_mesurecalibrageetalonWhereInput
    /**
     * Limit how many ts_mesurecalibrageetalons to update.
     */
    limit?: number
  }

  /**
   * ts_mesurecalibrageetalon upsert
   */
  export type ts_mesurecalibrageetalonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_mesurecalibrageetalon to update in case it exists.
     */
    where: ts_mesurecalibrageetalonWhereUniqueInput
    /**
     * In case the ts_mesurecalibrageetalon found by the `where` argument doesn't exist, create a new ts_mesurecalibrageetalon with this data.
     */
    create: XOR<ts_mesurecalibrageetalonCreateInput, ts_mesurecalibrageetalonUncheckedCreateInput>
    /**
     * In case the ts_mesurecalibrageetalon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_mesurecalibrageetalonUpdateInput, ts_mesurecalibrageetalonUncheckedUpdateInput>
  }

  /**
   * ts_mesurecalibrageetalon delete
   */
  export type ts_mesurecalibrageetalonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
    /**
     * Filter which ts_mesurecalibrageetalon to delete.
     */
    where: ts_mesurecalibrageetalonWhereUniqueInput
  }

  /**
   * ts_mesurecalibrageetalon deleteMany
   */
  export type ts_mesurecalibrageetalonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesurecalibrageetalons to delete
     */
    where?: ts_mesurecalibrageetalonWhereInput
    /**
     * Limit how many ts_mesurecalibrageetalons to delete.
     */
    limit?: number
  }

  /**
   * ts_mesurecalibrageetalon without action
   */
  export type ts_mesurecalibrageetalonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurecalibrageetalon
     */
    select?: ts_mesurecalibrageetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurecalibrageetalon
     */
    omit?: ts_mesurecalibrageetalonOmit<ExtArgs> | null
  }


  /**
   * Model ts_mesureetalon
   */

  export type AggregateTs_mesureetalon = {
    _count: Ts_mesureetalonCountAggregateOutputType | null
    _avg: Ts_mesureetalonAvgAggregateOutputType | null
    _sum: Ts_mesureetalonSumAggregateOutputType | null
    _min: Ts_mesureetalonMinAggregateOutputType | null
    _max: Ts_mesureetalonMaxAggregateOutputType | null
  }

  export type Ts_mesureetalonAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureEtalon: number | null
    Resistance: number | null
    ValeurNull: number | null
  }

  export type Ts_mesureetalonSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureEtalon: number | null
    Resistance: number | null
    ValeurNull: number | null
  }

  export type Ts_mesureetalonMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureEtalon: number | null
    Resistance: number | null
    EtalonNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
    Message_Erreur: string | null
  }

  export type Ts_mesureetalonMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureEtalon: number | null
    Resistance: number | null
    EtalonNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
    Message_Erreur: string | null
  }

  export type Ts_mesureetalonCountAggregateOutputType = {
    IdServeurBDD: number
    IdMesureEtalon: number
    Resistance: number
    EtalonNumeroSerie: number
    ValeurNull: number
    DateHeure: number
    Message_Erreur: number
    _all: number
  }


  export type Ts_mesureetalonAvgAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalon?: true
    Resistance?: true
    ValeurNull?: true
  }

  export type Ts_mesureetalonSumAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalon?: true
    Resistance?: true
    ValeurNull?: true
  }

  export type Ts_mesureetalonMinAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalon?: true
    Resistance?: true
    EtalonNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    Message_Erreur?: true
  }

  export type Ts_mesureetalonMaxAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalon?: true
    Resistance?: true
    EtalonNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    Message_Erreur?: true
  }

  export type Ts_mesureetalonCountAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalon?: true
    Resistance?: true
    EtalonNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    Message_Erreur?: true
    _all?: true
  }

  export type Ts_mesureetalonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesureetalon to aggregate.
     */
    where?: ts_mesureetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesureetalons to fetch.
     */
    orderBy?: ts_mesureetalonOrderByWithRelationInput | ts_mesureetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_mesureetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesureetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesureetalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_mesureetalons
    **/
    _count?: true | Ts_mesureetalonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_mesureetalonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_mesureetalonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_mesureetalonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_mesureetalonMaxAggregateInputType
  }

  export type GetTs_mesureetalonAggregateType<T extends Ts_mesureetalonAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_mesureetalon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_mesureetalon[P]>
      : GetScalarType<T[P], AggregateTs_mesureetalon[P]>
  }




  export type ts_mesureetalonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_mesureetalonWhereInput
    orderBy?: ts_mesureetalonOrderByWithAggregationInput | ts_mesureetalonOrderByWithAggregationInput[]
    by: Ts_mesureetalonScalarFieldEnum[] | Ts_mesureetalonScalarFieldEnum
    having?: ts_mesureetalonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_mesureetalonCountAggregateInputType | true
    _avg?: Ts_mesureetalonAvgAggregateInputType
    _sum?: Ts_mesureetalonSumAggregateInputType
    _min?: Ts_mesureetalonMinAggregateInputType
    _max?: Ts_mesureetalonMaxAggregateInputType
  }

  export type Ts_mesureetalonGroupByOutputType = {
    IdServeurBDD: number
    IdMesureEtalon: number
    Resistance: number
    EtalonNumeroSerie: string
    ValeurNull: number
    DateHeure: Date
    Message_Erreur: string
    _count: Ts_mesureetalonCountAggregateOutputType | null
    _avg: Ts_mesureetalonAvgAggregateOutputType | null
    _sum: Ts_mesureetalonSumAggregateOutputType | null
    _min: Ts_mesureetalonMinAggregateOutputType | null
    _max: Ts_mesureetalonMaxAggregateOutputType | null
  }

  type GetTs_mesureetalonGroupByPayload<T extends ts_mesureetalonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_mesureetalonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_mesureetalonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_mesureetalonGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_mesureetalonGroupByOutputType[P]>
        }
      >
    >


  export type ts_mesureetalonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdMesureEtalon?: boolean
    Resistance?: boolean
    EtalonNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
    Message_Erreur?: boolean
  }, ExtArgs["result"]["ts_mesureetalon"]>



  export type ts_mesureetalonSelectScalar = {
    IdServeurBDD?: boolean
    IdMesureEtalon?: boolean
    Resistance?: boolean
    EtalonNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
    Message_Erreur?: boolean
  }

  export type ts_mesureetalonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdMesureEtalon" | "Resistance" | "EtalonNumeroSerie" | "ValeurNull" | "DateHeure" | "Message_Erreur", ExtArgs["result"]["ts_mesureetalon"]>

  export type $ts_mesureetalonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_mesureetalon"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdMesureEtalon: number
      Resistance: number
      EtalonNumeroSerie: string
      ValeurNull: number
      DateHeure: Date
      Message_Erreur: string
    }, ExtArgs["result"]["ts_mesureetalon"]>
    composites: {}
  }

  type ts_mesureetalonGetPayload<S extends boolean | null | undefined | ts_mesureetalonDefaultArgs> = $Result.GetResult<Prisma.$ts_mesureetalonPayload, S>

  type ts_mesureetalonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_mesureetalonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_mesureetalonCountAggregateInputType | true
    }

  export interface ts_mesureetalonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_mesureetalon'], meta: { name: 'ts_mesureetalon' } }
    /**
     * Find zero or one Ts_mesureetalon that matches the filter.
     * @param {ts_mesureetalonFindUniqueArgs} args - Arguments to find a Ts_mesureetalon
     * @example
     * // Get one Ts_mesureetalon
     * const ts_mesureetalon = await prisma.ts_mesureetalon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_mesureetalonFindUniqueArgs>(args: SelectSubset<T, ts_mesureetalonFindUniqueArgs<ExtArgs>>): Prisma__ts_mesureetalonClient<$Result.GetResult<Prisma.$ts_mesureetalonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_mesureetalon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_mesureetalonFindUniqueOrThrowArgs} args - Arguments to find a Ts_mesureetalon
     * @example
     * // Get one Ts_mesureetalon
     * const ts_mesureetalon = await prisma.ts_mesureetalon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_mesureetalonFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_mesureetalonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_mesureetalonClient<$Result.GetResult<Prisma.$ts_mesureetalonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesureetalon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonFindFirstArgs} args - Arguments to find a Ts_mesureetalon
     * @example
     * // Get one Ts_mesureetalon
     * const ts_mesureetalon = await prisma.ts_mesureetalon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_mesureetalonFindFirstArgs>(args?: SelectSubset<T, ts_mesureetalonFindFirstArgs<ExtArgs>>): Prisma__ts_mesureetalonClient<$Result.GetResult<Prisma.$ts_mesureetalonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesureetalon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonFindFirstOrThrowArgs} args - Arguments to find a Ts_mesureetalon
     * @example
     * // Get one Ts_mesureetalon
     * const ts_mesureetalon = await prisma.ts_mesureetalon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_mesureetalonFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_mesureetalonFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_mesureetalonClient<$Result.GetResult<Prisma.$ts_mesureetalonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_mesureetalons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_mesureetalons
     * const ts_mesureetalons = await prisma.ts_mesureetalon.findMany()
     * 
     * // Get first 10 Ts_mesureetalons
     * const ts_mesureetalons = await prisma.ts_mesureetalon.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_mesureetalonWithIdServeurBDDOnly = await prisma.ts_mesureetalon.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_mesureetalonFindManyArgs>(args?: SelectSubset<T, ts_mesureetalonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_mesureetalonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_mesureetalon.
     * @param {ts_mesureetalonCreateArgs} args - Arguments to create a Ts_mesureetalon.
     * @example
     * // Create one Ts_mesureetalon
     * const Ts_mesureetalon = await prisma.ts_mesureetalon.create({
     *   data: {
     *     // ... data to create a Ts_mesureetalon
     *   }
     * })
     * 
     */
    create<T extends ts_mesureetalonCreateArgs>(args: SelectSubset<T, ts_mesureetalonCreateArgs<ExtArgs>>): Prisma__ts_mesureetalonClient<$Result.GetResult<Prisma.$ts_mesureetalonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_mesureetalons.
     * @param {ts_mesureetalonCreateManyArgs} args - Arguments to create many Ts_mesureetalons.
     * @example
     * // Create many Ts_mesureetalons
     * const ts_mesureetalon = await prisma.ts_mesureetalon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_mesureetalonCreateManyArgs>(args?: SelectSubset<T, ts_mesureetalonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_mesureetalon.
     * @param {ts_mesureetalonDeleteArgs} args - Arguments to delete one Ts_mesureetalon.
     * @example
     * // Delete one Ts_mesureetalon
     * const Ts_mesureetalon = await prisma.ts_mesureetalon.delete({
     *   where: {
     *     // ... filter to delete one Ts_mesureetalon
     *   }
     * })
     * 
     */
    delete<T extends ts_mesureetalonDeleteArgs>(args: SelectSubset<T, ts_mesureetalonDeleteArgs<ExtArgs>>): Prisma__ts_mesureetalonClient<$Result.GetResult<Prisma.$ts_mesureetalonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_mesureetalon.
     * @param {ts_mesureetalonUpdateArgs} args - Arguments to update one Ts_mesureetalon.
     * @example
     * // Update one Ts_mesureetalon
     * const ts_mesureetalon = await prisma.ts_mesureetalon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_mesureetalonUpdateArgs>(args: SelectSubset<T, ts_mesureetalonUpdateArgs<ExtArgs>>): Prisma__ts_mesureetalonClient<$Result.GetResult<Prisma.$ts_mesureetalonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_mesureetalons.
     * @param {ts_mesureetalonDeleteManyArgs} args - Arguments to filter Ts_mesureetalons to delete.
     * @example
     * // Delete a few Ts_mesureetalons
     * const { count } = await prisma.ts_mesureetalon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_mesureetalonDeleteManyArgs>(args?: SelectSubset<T, ts_mesureetalonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_mesureetalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_mesureetalons
     * const ts_mesureetalon = await prisma.ts_mesureetalon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_mesureetalonUpdateManyArgs>(args: SelectSubset<T, ts_mesureetalonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_mesureetalon.
     * @param {ts_mesureetalonUpsertArgs} args - Arguments to update or create a Ts_mesureetalon.
     * @example
     * // Update or create a Ts_mesureetalon
     * const ts_mesureetalon = await prisma.ts_mesureetalon.upsert({
     *   create: {
     *     // ... data to create a Ts_mesureetalon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_mesureetalon we want to update
     *   }
     * })
     */
    upsert<T extends ts_mesureetalonUpsertArgs>(args: SelectSubset<T, ts_mesureetalonUpsertArgs<ExtArgs>>): Prisma__ts_mesureetalonClient<$Result.GetResult<Prisma.$ts_mesureetalonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_mesureetalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonCountArgs} args - Arguments to filter Ts_mesureetalons to count.
     * @example
     * // Count the number of Ts_mesureetalons
     * const count = await prisma.ts_mesureetalon.count({
     *   where: {
     *     // ... the filter for the Ts_mesureetalons we want to count
     *   }
     * })
    **/
    count<T extends ts_mesureetalonCountArgs>(
      args?: Subset<T, ts_mesureetalonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_mesureetalonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_mesureetalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_mesureetalonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_mesureetalonAggregateArgs>(args: Subset<T, Ts_mesureetalonAggregateArgs>): Prisma.PrismaPromise<GetTs_mesureetalonAggregateType<T>>

    /**
     * Group by Ts_mesureetalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonGroupByArgs} args - Group by arguments.
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
      T extends ts_mesureetalonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_mesureetalonGroupByArgs['orderBy'] }
        : { orderBy?: ts_mesureetalonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_mesureetalonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_mesureetalonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_mesureetalon model
   */
  readonly fields: ts_mesureetalonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_mesureetalon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_mesureetalonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_mesureetalon model
   */
  interface ts_mesureetalonFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_mesureetalon", 'Int'>
    readonly IdMesureEtalon: FieldRef<"ts_mesureetalon", 'Int'>
    readonly Resistance: FieldRef<"ts_mesureetalon", 'Float'>
    readonly EtalonNumeroSerie: FieldRef<"ts_mesureetalon", 'String'>
    readonly ValeurNull: FieldRef<"ts_mesureetalon", 'Int'>
    readonly DateHeure: FieldRef<"ts_mesureetalon", 'DateTime'>
    readonly Message_Erreur: FieldRef<"ts_mesureetalon", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ts_mesureetalon findUnique
   */
  export type ts_mesureetalonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalon to fetch.
     */
    where: ts_mesureetalonWhereUniqueInput
  }

  /**
   * ts_mesureetalon findUniqueOrThrow
   */
  export type ts_mesureetalonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalon to fetch.
     */
    where: ts_mesureetalonWhereUniqueInput
  }

  /**
   * ts_mesureetalon findFirst
   */
  export type ts_mesureetalonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalon to fetch.
     */
    where?: ts_mesureetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesureetalons to fetch.
     */
    orderBy?: ts_mesureetalonOrderByWithRelationInput | ts_mesureetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesureetalons.
     */
    cursor?: ts_mesureetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesureetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesureetalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesureetalons.
     */
    distinct?: Ts_mesureetalonScalarFieldEnum | Ts_mesureetalonScalarFieldEnum[]
  }

  /**
   * ts_mesureetalon findFirstOrThrow
   */
  export type ts_mesureetalonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalon to fetch.
     */
    where?: ts_mesureetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesureetalons to fetch.
     */
    orderBy?: ts_mesureetalonOrderByWithRelationInput | ts_mesureetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesureetalons.
     */
    cursor?: ts_mesureetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesureetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesureetalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesureetalons.
     */
    distinct?: Ts_mesureetalonScalarFieldEnum | Ts_mesureetalonScalarFieldEnum[]
  }

  /**
   * ts_mesureetalon findMany
   */
  export type ts_mesureetalonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalons to fetch.
     */
    where?: ts_mesureetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesureetalons to fetch.
     */
    orderBy?: ts_mesureetalonOrderByWithRelationInput | ts_mesureetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_mesureetalons.
     */
    cursor?: ts_mesureetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesureetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesureetalons.
     */
    skip?: number
    distinct?: Ts_mesureetalonScalarFieldEnum | Ts_mesureetalonScalarFieldEnum[]
  }

  /**
   * ts_mesureetalon create
   */
  export type ts_mesureetalonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_mesureetalon.
     */
    data: XOR<ts_mesureetalonCreateInput, ts_mesureetalonUncheckedCreateInput>
  }

  /**
   * ts_mesureetalon createMany
   */
  export type ts_mesureetalonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_mesureetalons.
     */
    data: ts_mesureetalonCreateManyInput | ts_mesureetalonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_mesureetalon update
   */
  export type ts_mesureetalonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_mesureetalon.
     */
    data: XOR<ts_mesureetalonUpdateInput, ts_mesureetalonUncheckedUpdateInput>
    /**
     * Choose, which ts_mesureetalon to update.
     */
    where: ts_mesureetalonWhereUniqueInput
  }

  /**
   * ts_mesureetalon updateMany
   */
  export type ts_mesureetalonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_mesureetalons.
     */
    data: XOR<ts_mesureetalonUpdateManyMutationInput, ts_mesureetalonUncheckedUpdateManyInput>
    /**
     * Filter which ts_mesureetalons to update
     */
    where?: ts_mesureetalonWhereInput
    /**
     * Limit how many ts_mesureetalons to update.
     */
    limit?: number
  }

  /**
   * ts_mesureetalon upsert
   */
  export type ts_mesureetalonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_mesureetalon to update in case it exists.
     */
    where: ts_mesureetalonWhereUniqueInput
    /**
     * In case the ts_mesureetalon found by the `where` argument doesn't exist, create a new ts_mesureetalon with this data.
     */
    create: XOR<ts_mesureetalonCreateInput, ts_mesureetalonUncheckedCreateInput>
    /**
     * In case the ts_mesureetalon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_mesureetalonUpdateInput, ts_mesureetalonUncheckedUpdateInput>
  }

  /**
   * ts_mesureetalon delete
   */
  export type ts_mesureetalonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
    /**
     * Filter which ts_mesureetalon to delete.
     */
    where: ts_mesureetalonWhereUniqueInput
  }

  /**
   * ts_mesureetalon deleteMany
   */
  export type ts_mesureetalonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesureetalons to delete
     */
    where?: ts_mesureetalonWhereInput
    /**
     * Limit how many ts_mesureetalons to delete.
     */
    limit?: number
  }

  /**
   * ts_mesureetalon without action
   */
  export type ts_mesureetalonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalon
     */
    select?: ts_mesureetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalon
     */
    omit?: ts_mesureetalonOmit<ExtArgs> | null
  }


  /**
   * Model ts_mesureetalonnage
   */

  export type AggregateTs_mesureetalonnage = {
    _count: Ts_mesureetalonnageCountAggregateOutputType | null
    _avg: Ts_mesureetalonnageAvgAggregateOutputType | null
    _sum: Ts_mesureetalonnageSumAggregateOutputType | null
    _min: Ts_mesureetalonnageMinAggregateOutputType | null
    _max: Ts_mesureetalonnageMaxAggregateOutputType | null
  }

  export type Ts_mesureetalonnageAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureEtalonnage: number | null
    NumeroOrdre: number | null
  }

  export type Ts_mesureetalonnageSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureEtalonnage: number | null
    NumeroOrdre: number | null
  }

  export type Ts_mesureetalonnageMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureEtalonnage: number | null
    SondeNumeroserie: string | null
    NumeroOrdre: number | null
    MesureSonde: string | null
    MesureEtalon: string | null
    DateHeure: Date | null
  }

  export type Ts_mesureetalonnageMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureEtalonnage: number | null
    SondeNumeroserie: string | null
    NumeroOrdre: number | null
    MesureSonde: string | null
    MesureEtalon: string | null
    DateHeure: Date | null
  }

  export type Ts_mesureetalonnageCountAggregateOutputType = {
    IdServeurBDD: number
    IdMesureEtalonnage: number
    SondeNumeroserie: number
    NumeroOrdre: number
    MesureSonde: number
    MesureEtalon: number
    DateHeure: number
    _all: number
  }


  export type Ts_mesureetalonnageAvgAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalonnage?: true
    NumeroOrdre?: true
  }

  export type Ts_mesureetalonnageSumAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalonnage?: true
    NumeroOrdre?: true
  }

  export type Ts_mesureetalonnageMinAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalonnage?: true
    SondeNumeroserie?: true
    NumeroOrdre?: true
    MesureSonde?: true
    MesureEtalon?: true
    DateHeure?: true
  }

  export type Ts_mesureetalonnageMaxAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalonnage?: true
    SondeNumeroserie?: true
    NumeroOrdre?: true
    MesureSonde?: true
    MesureEtalon?: true
    DateHeure?: true
  }

  export type Ts_mesureetalonnageCountAggregateInputType = {
    IdServeurBDD?: true
    IdMesureEtalonnage?: true
    SondeNumeroserie?: true
    NumeroOrdre?: true
    MesureSonde?: true
    MesureEtalon?: true
    DateHeure?: true
    _all?: true
  }

  export type Ts_mesureetalonnageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesureetalonnage to aggregate.
     */
    where?: ts_mesureetalonnageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesureetalonnages to fetch.
     */
    orderBy?: ts_mesureetalonnageOrderByWithRelationInput | ts_mesureetalonnageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_mesureetalonnageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesureetalonnages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesureetalonnages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_mesureetalonnages
    **/
    _count?: true | Ts_mesureetalonnageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_mesureetalonnageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_mesureetalonnageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_mesureetalonnageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_mesureetalonnageMaxAggregateInputType
  }

  export type GetTs_mesureetalonnageAggregateType<T extends Ts_mesureetalonnageAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_mesureetalonnage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_mesureetalonnage[P]>
      : GetScalarType<T[P], AggregateTs_mesureetalonnage[P]>
  }




  export type ts_mesureetalonnageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_mesureetalonnageWhereInput
    orderBy?: ts_mesureetalonnageOrderByWithAggregationInput | ts_mesureetalonnageOrderByWithAggregationInput[]
    by: Ts_mesureetalonnageScalarFieldEnum[] | Ts_mesureetalonnageScalarFieldEnum
    having?: ts_mesureetalonnageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_mesureetalonnageCountAggregateInputType | true
    _avg?: Ts_mesureetalonnageAvgAggregateInputType
    _sum?: Ts_mesureetalonnageSumAggregateInputType
    _min?: Ts_mesureetalonnageMinAggregateInputType
    _max?: Ts_mesureetalonnageMaxAggregateInputType
  }

  export type Ts_mesureetalonnageGroupByOutputType = {
    IdServeurBDD: number
    IdMesureEtalonnage: number
    SondeNumeroserie: string | null
    NumeroOrdre: number | null
    MesureSonde: string | null
    MesureEtalon: string | null
    DateHeure: Date | null
    _count: Ts_mesureetalonnageCountAggregateOutputType | null
    _avg: Ts_mesureetalonnageAvgAggregateOutputType | null
    _sum: Ts_mesureetalonnageSumAggregateOutputType | null
    _min: Ts_mesureetalonnageMinAggregateOutputType | null
    _max: Ts_mesureetalonnageMaxAggregateOutputType | null
  }

  type GetTs_mesureetalonnageGroupByPayload<T extends ts_mesureetalonnageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_mesureetalonnageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_mesureetalonnageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_mesureetalonnageGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_mesureetalonnageGroupByOutputType[P]>
        }
      >
    >


  export type ts_mesureetalonnageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdMesureEtalonnage?: boolean
    SondeNumeroserie?: boolean
    NumeroOrdre?: boolean
    MesureSonde?: boolean
    MesureEtalon?: boolean
    DateHeure?: boolean
  }, ExtArgs["result"]["ts_mesureetalonnage"]>



  export type ts_mesureetalonnageSelectScalar = {
    IdServeurBDD?: boolean
    IdMesureEtalonnage?: boolean
    SondeNumeroserie?: boolean
    NumeroOrdre?: boolean
    MesureSonde?: boolean
    MesureEtalon?: boolean
    DateHeure?: boolean
  }

  export type ts_mesureetalonnageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdMesureEtalonnage" | "SondeNumeroserie" | "NumeroOrdre" | "MesureSonde" | "MesureEtalon" | "DateHeure", ExtArgs["result"]["ts_mesureetalonnage"]>

  export type $ts_mesureetalonnagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_mesureetalonnage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdMesureEtalonnage: number
      SondeNumeroserie: string | null
      NumeroOrdre: number | null
      MesureSonde: string | null
      MesureEtalon: string | null
      DateHeure: Date | null
    }, ExtArgs["result"]["ts_mesureetalonnage"]>
    composites: {}
  }

  type ts_mesureetalonnageGetPayload<S extends boolean | null | undefined | ts_mesureetalonnageDefaultArgs> = $Result.GetResult<Prisma.$ts_mesureetalonnagePayload, S>

  type ts_mesureetalonnageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_mesureetalonnageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_mesureetalonnageCountAggregateInputType | true
    }

  export interface ts_mesureetalonnageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_mesureetalonnage'], meta: { name: 'ts_mesureetalonnage' } }
    /**
     * Find zero or one Ts_mesureetalonnage that matches the filter.
     * @param {ts_mesureetalonnageFindUniqueArgs} args - Arguments to find a Ts_mesureetalonnage
     * @example
     * // Get one Ts_mesureetalonnage
     * const ts_mesureetalonnage = await prisma.ts_mesureetalonnage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_mesureetalonnageFindUniqueArgs>(args: SelectSubset<T, ts_mesureetalonnageFindUniqueArgs<ExtArgs>>): Prisma__ts_mesureetalonnageClient<$Result.GetResult<Prisma.$ts_mesureetalonnagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_mesureetalonnage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_mesureetalonnageFindUniqueOrThrowArgs} args - Arguments to find a Ts_mesureetalonnage
     * @example
     * // Get one Ts_mesureetalonnage
     * const ts_mesureetalonnage = await prisma.ts_mesureetalonnage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_mesureetalonnageFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_mesureetalonnageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_mesureetalonnageClient<$Result.GetResult<Prisma.$ts_mesureetalonnagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesureetalonnage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonnageFindFirstArgs} args - Arguments to find a Ts_mesureetalonnage
     * @example
     * // Get one Ts_mesureetalonnage
     * const ts_mesureetalonnage = await prisma.ts_mesureetalonnage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_mesureetalonnageFindFirstArgs>(args?: SelectSubset<T, ts_mesureetalonnageFindFirstArgs<ExtArgs>>): Prisma__ts_mesureetalonnageClient<$Result.GetResult<Prisma.$ts_mesureetalonnagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesureetalonnage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonnageFindFirstOrThrowArgs} args - Arguments to find a Ts_mesureetalonnage
     * @example
     * // Get one Ts_mesureetalonnage
     * const ts_mesureetalonnage = await prisma.ts_mesureetalonnage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_mesureetalonnageFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_mesureetalonnageFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_mesureetalonnageClient<$Result.GetResult<Prisma.$ts_mesureetalonnagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_mesureetalonnages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonnageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_mesureetalonnages
     * const ts_mesureetalonnages = await prisma.ts_mesureetalonnage.findMany()
     * 
     * // Get first 10 Ts_mesureetalonnages
     * const ts_mesureetalonnages = await prisma.ts_mesureetalonnage.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_mesureetalonnageWithIdServeurBDDOnly = await prisma.ts_mesureetalonnage.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_mesureetalonnageFindManyArgs>(args?: SelectSubset<T, ts_mesureetalonnageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_mesureetalonnagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_mesureetalonnage.
     * @param {ts_mesureetalonnageCreateArgs} args - Arguments to create a Ts_mesureetalonnage.
     * @example
     * // Create one Ts_mesureetalonnage
     * const Ts_mesureetalonnage = await prisma.ts_mesureetalonnage.create({
     *   data: {
     *     // ... data to create a Ts_mesureetalonnage
     *   }
     * })
     * 
     */
    create<T extends ts_mesureetalonnageCreateArgs>(args: SelectSubset<T, ts_mesureetalonnageCreateArgs<ExtArgs>>): Prisma__ts_mesureetalonnageClient<$Result.GetResult<Prisma.$ts_mesureetalonnagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_mesureetalonnages.
     * @param {ts_mesureetalonnageCreateManyArgs} args - Arguments to create many Ts_mesureetalonnages.
     * @example
     * // Create many Ts_mesureetalonnages
     * const ts_mesureetalonnage = await prisma.ts_mesureetalonnage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_mesureetalonnageCreateManyArgs>(args?: SelectSubset<T, ts_mesureetalonnageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_mesureetalonnage.
     * @param {ts_mesureetalonnageDeleteArgs} args - Arguments to delete one Ts_mesureetalonnage.
     * @example
     * // Delete one Ts_mesureetalonnage
     * const Ts_mesureetalonnage = await prisma.ts_mesureetalonnage.delete({
     *   where: {
     *     // ... filter to delete one Ts_mesureetalonnage
     *   }
     * })
     * 
     */
    delete<T extends ts_mesureetalonnageDeleteArgs>(args: SelectSubset<T, ts_mesureetalonnageDeleteArgs<ExtArgs>>): Prisma__ts_mesureetalonnageClient<$Result.GetResult<Prisma.$ts_mesureetalonnagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_mesureetalonnage.
     * @param {ts_mesureetalonnageUpdateArgs} args - Arguments to update one Ts_mesureetalonnage.
     * @example
     * // Update one Ts_mesureetalonnage
     * const ts_mesureetalonnage = await prisma.ts_mesureetalonnage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_mesureetalonnageUpdateArgs>(args: SelectSubset<T, ts_mesureetalonnageUpdateArgs<ExtArgs>>): Prisma__ts_mesureetalonnageClient<$Result.GetResult<Prisma.$ts_mesureetalonnagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_mesureetalonnages.
     * @param {ts_mesureetalonnageDeleteManyArgs} args - Arguments to filter Ts_mesureetalonnages to delete.
     * @example
     * // Delete a few Ts_mesureetalonnages
     * const { count } = await prisma.ts_mesureetalonnage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_mesureetalonnageDeleteManyArgs>(args?: SelectSubset<T, ts_mesureetalonnageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_mesureetalonnages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonnageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_mesureetalonnages
     * const ts_mesureetalonnage = await prisma.ts_mesureetalonnage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_mesureetalonnageUpdateManyArgs>(args: SelectSubset<T, ts_mesureetalonnageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_mesureetalonnage.
     * @param {ts_mesureetalonnageUpsertArgs} args - Arguments to update or create a Ts_mesureetalonnage.
     * @example
     * // Update or create a Ts_mesureetalonnage
     * const ts_mesureetalonnage = await prisma.ts_mesureetalonnage.upsert({
     *   create: {
     *     // ... data to create a Ts_mesureetalonnage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_mesureetalonnage we want to update
     *   }
     * })
     */
    upsert<T extends ts_mesureetalonnageUpsertArgs>(args: SelectSubset<T, ts_mesureetalonnageUpsertArgs<ExtArgs>>): Prisma__ts_mesureetalonnageClient<$Result.GetResult<Prisma.$ts_mesureetalonnagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_mesureetalonnages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonnageCountArgs} args - Arguments to filter Ts_mesureetalonnages to count.
     * @example
     * // Count the number of Ts_mesureetalonnages
     * const count = await prisma.ts_mesureetalonnage.count({
     *   where: {
     *     // ... the filter for the Ts_mesureetalonnages we want to count
     *   }
     * })
    **/
    count<T extends ts_mesureetalonnageCountArgs>(
      args?: Subset<T, ts_mesureetalonnageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_mesureetalonnageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_mesureetalonnage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_mesureetalonnageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_mesureetalonnageAggregateArgs>(args: Subset<T, Ts_mesureetalonnageAggregateArgs>): Prisma.PrismaPromise<GetTs_mesureetalonnageAggregateType<T>>

    /**
     * Group by Ts_mesureetalonnage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesureetalonnageGroupByArgs} args - Group by arguments.
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
      T extends ts_mesureetalonnageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_mesureetalonnageGroupByArgs['orderBy'] }
        : { orderBy?: ts_mesureetalonnageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_mesureetalonnageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_mesureetalonnageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_mesureetalonnage model
   */
  readonly fields: ts_mesureetalonnageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_mesureetalonnage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_mesureetalonnageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_mesureetalonnage model
   */
  interface ts_mesureetalonnageFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_mesureetalonnage", 'Int'>
    readonly IdMesureEtalonnage: FieldRef<"ts_mesureetalonnage", 'Int'>
    readonly SondeNumeroserie: FieldRef<"ts_mesureetalonnage", 'String'>
    readonly NumeroOrdre: FieldRef<"ts_mesureetalonnage", 'Int'>
    readonly MesureSonde: FieldRef<"ts_mesureetalonnage", 'String'>
    readonly MesureEtalon: FieldRef<"ts_mesureetalonnage", 'String'>
    readonly DateHeure: FieldRef<"ts_mesureetalonnage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ts_mesureetalonnage findUnique
   */
  export type ts_mesureetalonnageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalonnage to fetch.
     */
    where: ts_mesureetalonnageWhereUniqueInput
  }

  /**
   * ts_mesureetalonnage findUniqueOrThrow
   */
  export type ts_mesureetalonnageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalonnage to fetch.
     */
    where: ts_mesureetalonnageWhereUniqueInput
  }

  /**
   * ts_mesureetalonnage findFirst
   */
  export type ts_mesureetalonnageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalonnage to fetch.
     */
    where?: ts_mesureetalonnageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesureetalonnages to fetch.
     */
    orderBy?: ts_mesureetalonnageOrderByWithRelationInput | ts_mesureetalonnageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesureetalonnages.
     */
    cursor?: ts_mesureetalonnageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesureetalonnages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesureetalonnages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesureetalonnages.
     */
    distinct?: Ts_mesureetalonnageScalarFieldEnum | Ts_mesureetalonnageScalarFieldEnum[]
  }

  /**
   * ts_mesureetalonnage findFirstOrThrow
   */
  export type ts_mesureetalonnageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalonnage to fetch.
     */
    where?: ts_mesureetalonnageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesureetalonnages to fetch.
     */
    orderBy?: ts_mesureetalonnageOrderByWithRelationInput | ts_mesureetalonnageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesureetalonnages.
     */
    cursor?: ts_mesureetalonnageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesureetalonnages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesureetalonnages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesureetalonnages.
     */
    distinct?: Ts_mesureetalonnageScalarFieldEnum | Ts_mesureetalonnageScalarFieldEnum[]
  }

  /**
   * ts_mesureetalonnage findMany
   */
  export type ts_mesureetalonnageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesureetalonnages to fetch.
     */
    where?: ts_mesureetalonnageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesureetalonnages to fetch.
     */
    orderBy?: ts_mesureetalonnageOrderByWithRelationInput | ts_mesureetalonnageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_mesureetalonnages.
     */
    cursor?: ts_mesureetalonnageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesureetalonnages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesureetalonnages.
     */
    skip?: number
    distinct?: Ts_mesureetalonnageScalarFieldEnum | Ts_mesureetalonnageScalarFieldEnum[]
  }

  /**
   * ts_mesureetalonnage create
   */
  export type ts_mesureetalonnageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_mesureetalonnage.
     */
    data?: XOR<ts_mesureetalonnageCreateInput, ts_mesureetalonnageUncheckedCreateInput>
  }

  /**
   * ts_mesureetalonnage createMany
   */
  export type ts_mesureetalonnageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_mesureetalonnages.
     */
    data: ts_mesureetalonnageCreateManyInput | ts_mesureetalonnageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_mesureetalonnage update
   */
  export type ts_mesureetalonnageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_mesureetalonnage.
     */
    data: XOR<ts_mesureetalonnageUpdateInput, ts_mesureetalonnageUncheckedUpdateInput>
    /**
     * Choose, which ts_mesureetalonnage to update.
     */
    where: ts_mesureetalonnageWhereUniqueInput
  }

  /**
   * ts_mesureetalonnage updateMany
   */
  export type ts_mesureetalonnageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_mesureetalonnages.
     */
    data: XOR<ts_mesureetalonnageUpdateManyMutationInput, ts_mesureetalonnageUncheckedUpdateManyInput>
    /**
     * Filter which ts_mesureetalonnages to update
     */
    where?: ts_mesureetalonnageWhereInput
    /**
     * Limit how many ts_mesureetalonnages to update.
     */
    limit?: number
  }

  /**
   * ts_mesureetalonnage upsert
   */
  export type ts_mesureetalonnageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_mesureetalonnage to update in case it exists.
     */
    where: ts_mesureetalonnageWhereUniqueInput
    /**
     * In case the ts_mesureetalonnage found by the `where` argument doesn't exist, create a new ts_mesureetalonnage with this data.
     */
    create: XOR<ts_mesureetalonnageCreateInput, ts_mesureetalonnageUncheckedCreateInput>
    /**
     * In case the ts_mesureetalonnage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_mesureetalonnageUpdateInput, ts_mesureetalonnageUncheckedUpdateInput>
  }

  /**
   * ts_mesureetalonnage delete
   */
  export type ts_mesureetalonnageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
    /**
     * Filter which ts_mesureetalonnage to delete.
     */
    where: ts_mesureetalonnageWhereUniqueInput
  }

  /**
   * ts_mesureetalonnage deleteMany
   */
  export type ts_mesureetalonnageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesureetalonnages to delete
     */
    where?: ts_mesureetalonnageWhereInput
    /**
     * Limit how many ts_mesureetalonnages to delete.
     */
    limit?: number
  }

  /**
   * ts_mesureetalonnage without action
   */
  export type ts_mesureetalonnageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesureetalonnage
     */
    select?: ts_mesureetalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesureetalonnage
     */
    omit?: ts_mesureetalonnageOmit<ExtArgs> | null
  }


  /**
   * Model ts_mesurehisto
   */

  export type AggregateTs_mesurehisto = {
    _count: Ts_mesurehistoCountAggregateOutputType | null
    _avg: Ts_mesurehistoAvgAggregateOutputType | null
    _sum: Ts_mesurehistoSumAggregateOutputType | null
    _min: Ts_mesurehistoMinAggregateOutputType | null
    _max: Ts_mesurehistoMaxAggregateOutputType | null
  }

  export type Ts_mesurehistoAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesure: number | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
  }

  export type Ts_mesurehistoSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesure: number | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
  }

  export type Ts_mesurehistoMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesure: number | null
    DateHeureMesure: Date | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    SondeNumeroSerie: string | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Etat_Alarme: boolean | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
  }

  export type Ts_mesurehistoMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesure: number | null
    DateHeureMesure: Date | null
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    SondeNumeroSerie: string | null
    IdLieu: number | null
    ValeurNull: number | null
    Frequence: number | null
    Etat_Alarme: boolean | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
  }

  export type Ts_mesurehistoCountAggregateOutputType = {
    IdServeurBDD: number
    IdMesure: number
    DateHeureMesure: number
    Valeur: number
    Resistance: number
    Nb_decimal: number
    Consigne: number
    Consigne_Sup: number
    Consigne_Inf: number
    Unite: number
    SondeNumeroSerie: number
    IdLieu: number
    ValeurNull: number
    Frequence: number
    Etat_Alarme: number
    Consigne_Inf_PreAlarme: number
    Consigne_Sup_PreAlarme: number
    Moyenne: number
    _all: number
  }


  export type Ts_mesurehistoAvgAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
  }

  export type Ts_mesurehistoSumAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
  }

  export type Ts_mesurehistoMinAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    DateHeureMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    SondeNumeroSerie?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
  }

  export type Ts_mesurehistoMaxAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    DateHeureMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    SondeNumeroSerie?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
  }

  export type Ts_mesurehistoCountAggregateInputType = {
    IdServeurBDD?: true
    IdMesure?: true
    DateHeureMesure?: true
    Valeur?: true
    Resistance?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    SondeNumeroSerie?: true
    IdLieu?: true
    ValeurNull?: true
    Frequence?: true
    Etat_Alarme?: true
    Consigne_Inf_PreAlarme?: true
    Consigne_Sup_PreAlarme?: true
    Moyenne?: true
    _all?: true
  }

  export type Ts_mesurehistoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesurehisto to aggregate.
     */
    where?: ts_mesurehistoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurehistos to fetch.
     */
    orderBy?: ts_mesurehistoOrderByWithRelationInput | ts_mesurehistoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_mesurehistoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurehistos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurehistos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_mesurehistos
    **/
    _count?: true | Ts_mesurehistoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_mesurehistoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_mesurehistoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_mesurehistoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_mesurehistoMaxAggregateInputType
  }

  export type GetTs_mesurehistoAggregateType<T extends Ts_mesurehistoAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_mesurehisto]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_mesurehisto[P]>
      : GetScalarType<T[P], AggregateTs_mesurehisto[P]>
  }




  export type ts_mesurehistoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_mesurehistoWhereInput
    orderBy?: ts_mesurehistoOrderByWithAggregationInput | ts_mesurehistoOrderByWithAggregationInput[]
    by: Ts_mesurehistoScalarFieldEnum[] | Ts_mesurehistoScalarFieldEnum
    having?: ts_mesurehistoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_mesurehistoCountAggregateInputType | true
    _avg?: Ts_mesurehistoAvgAggregateInputType
    _sum?: Ts_mesurehistoSumAggregateInputType
    _min?: Ts_mesurehistoMinAggregateInputType
    _max?: Ts_mesurehistoMaxAggregateInputType
  }

  export type Ts_mesurehistoGroupByOutputType = {
    IdServeurBDD: number
    IdMesure: number
    DateHeureMesure: Date
    Valeur: number | null
    Resistance: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    SondeNumeroSerie: string | null
    IdLieu: number
    ValeurNull: number
    Frequence: number | null
    Etat_Alarme: boolean | null
    Consigne_Inf_PreAlarme: number | null
    Consigne_Sup_PreAlarme: number | null
    Moyenne: number | null
    _count: Ts_mesurehistoCountAggregateOutputType | null
    _avg: Ts_mesurehistoAvgAggregateOutputType | null
    _sum: Ts_mesurehistoSumAggregateOutputType | null
    _min: Ts_mesurehistoMinAggregateOutputType | null
    _max: Ts_mesurehistoMaxAggregateOutputType | null
  }

  type GetTs_mesurehistoGroupByPayload<T extends ts_mesurehistoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_mesurehistoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_mesurehistoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_mesurehistoGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_mesurehistoGroupByOutputType[P]>
        }
      >
    >


  export type ts_mesurehistoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdMesure?: boolean
    DateHeureMesure?: boolean
    Valeur?: boolean
    Resistance?: boolean
    Nb_decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    SondeNumeroSerie?: boolean
    IdLieu?: boolean
    ValeurNull?: boolean
    Frequence?: boolean
    Etat_Alarme?: boolean
    Consigne_Inf_PreAlarme?: boolean
    Consigne_Sup_PreAlarme?: boolean
    Moyenne?: boolean
  }, ExtArgs["result"]["ts_mesurehisto"]>



  export type ts_mesurehistoSelectScalar = {
    IdServeurBDD?: boolean
    IdMesure?: boolean
    DateHeureMesure?: boolean
    Valeur?: boolean
    Resistance?: boolean
    Nb_decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    SondeNumeroSerie?: boolean
    IdLieu?: boolean
    ValeurNull?: boolean
    Frequence?: boolean
    Etat_Alarme?: boolean
    Consigne_Inf_PreAlarme?: boolean
    Consigne_Sup_PreAlarme?: boolean
    Moyenne?: boolean
  }

  export type ts_mesurehistoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdMesure" | "DateHeureMesure" | "Valeur" | "Resistance" | "Nb_decimal" | "Consigne" | "Consigne_Sup" | "Consigne_Inf" | "Unite" | "SondeNumeroSerie" | "IdLieu" | "ValeurNull" | "Frequence" | "Etat_Alarme" | "Consigne_Inf_PreAlarme" | "Consigne_Sup_PreAlarme" | "Moyenne", ExtArgs["result"]["ts_mesurehisto"]>

  export type $ts_mesurehistoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_mesurehisto"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdMesure: number
      DateHeureMesure: Date
      Valeur: number | null
      Resistance: number | null
      Nb_decimal: number | null
      Consigne: number | null
      Consigne_Sup: number | null
      Consigne_Inf: number | null
      Unite: string | null
      SondeNumeroSerie: string | null
      IdLieu: number
      ValeurNull: number
      Frequence: number | null
      Etat_Alarme: boolean | null
      Consigne_Inf_PreAlarme: number | null
      Consigne_Sup_PreAlarme: number | null
      Moyenne: number | null
    }, ExtArgs["result"]["ts_mesurehisto"]>
    composites: {}
  }

  type ts_mesurehistoGetPayload<S extends boolean | null | undefined | ts_mesurehistoDefaultArgs> = $Result.GetResult<Prisma.$ts_mesurehistoPayload, S>

  type ts_mesurehistoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_mesurehistoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_mesurehistoCountAggregateInputType | true
    }

  export interface ts_mesurehistoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_mesurehisto'], meta: { name: 'ts_mesurehisto' } }
    /**
     * Find zero or one Ts_mesurehisto that matches the filter.
     * @param {ts_mesurehistoFindUniqueArgs} args - Arguments to find a Ts_mesurehisto
     * @example
     * // Get one Ts_mesurehisto
     * const ts_mesurehisto = await prisma.ts_mesurehisto.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_mesurehistoFindUniqueArgs>(args: SelectSubset<T, ts_mesurehistoFindUniqueArgs<ExtArgs>>): Prisma__ts_mesurehistoClient<$Result.GetResult<Prisma.$ts_mesurehistoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_mesurehisto that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_mesurehistoFindUniqueOrThrowArgs} args - Arguments to find a Ts_mesurehisto
     * @example
     * // Get one Ts_mesurehisto
     * const ts_mesurehisto = await prisma.ts_mesurehisto.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_mesurehistoFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_mesurehistoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_mesurehistoClient<$Result.GetResult<Prisma.$ts_mesurehistoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesurehisto that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurehistoFindFirstArgs} args - Arguments to find a Ts_mesurehisto
     * @example
     * // Get one Ts_mesurehisto
     * const ts_mesurehisto = await prisma.ts_mesurehisto.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_mesurehistoFindFirstArgs>(args?: SelectSubset<T, ts_mesurehistoFindFirstArgs<ExtArgs>>): Prisma__ts_mesurehistoClient<$Result.GetResult<Prisma.$ts_mesurehistoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesurehisto that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurehistoFindFirstOrThrowArgs} args - Arguments to find a Ts_mesurehisto
     * @example
     * // Get one Ts_mesurehisto
     * const ts_mesurehisto = await prisma.ts_mesurehisto.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_mesurehistoFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_mesurehistoFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_mesurehistoClient<$Result.GetResult<Prisma.$ts_mesurehistoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_mesurehistos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurehistoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_mesurehistos
     * const ts_mesurehistos = await prisma.ts_mesurehisto.findMany()
     * 
     * // Get first 10 Ts_mesurehistos
     * const ts_mesurehistos = await prisma.ts_mesurehisto.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_mesurehistoWithIdServeurBDDOnly = await prisma.ts_mesurehisto.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_mesurehistoFindManyArgs>(args?: SelectSubset<T, ts_mesurehistoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_mesurehistoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_mesurehisto.
     * @param {ts_mesurehistoCreateArgs} args - Arguments to create a Ts_mesurehisto.
     * @example
     * // Create one Ts_mesurehisto
     * const Ts_mesurehisto = await prisma.ts_mesurehisto.create({
     *   data: {
     *     // ... data to create a Ts_mesurehisto
     *   }
     * })
     * 
     */
    create<T extends ts_mesurehistoCreateArgs>(args: SelectSubset<T, ts_mesurehistoCreateArgs<ExtArgs>>): Prisma__ts_mesurehistoClient<$Result.GetResult<Prisma.$ts_mesurehistoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_mesurehistos.
     * @param {ts_mesurehistoCreateManyArgs} args - Arguments to create many Ts_mesurehistos.
     * @example
     * // Create many Ts_mesurehistos
     * const ts_mesurehisto = await prisma.ts_mesurehisto.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_mesurehistoCreateManyArgs>(args?: SelectSubset<T, ts_mesurehistoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_mesurehisto.
     * @param {ts_mesurehistoDeleteArgs} args - Arguments to delete one Ts_mesurehisto.
     * @example
     * // Delete one Ts_mesurehisto
     * const Ts_mesurehisto = await prisma.ts_mesurehisto.delete({
     *   where: {
     *     // ... filter to delete one Ts_mesurehisto
     *   }
     * })
     * 
     */
    delete<T extends ts_mesurehistoDeleteArgs>(args: SelectSubset<T, ts_mesurehistoDeleteArgs<ExtArgs>>): Prisma__ts_mesurehistoClient<$Result.GetResult<Prisma.$ts_mesurehistoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_mesurehisto.
     * @param {ts_mesurehistoUpdateArgs} args - Arguments to update one Ts_mesurehisto.
     * @example
     * // Update one Ts_mesurehisto
     * const ts_mesurehisto = await prisma.ts_mesurehisto.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_mesurehistoUpdateArgs>(args: SelectSubset<T, ts_mesurehistoUpdateArgs<ExtArgs>>): Prisma__ts_mesurehistoClient<$Result.GetResult<Prisma.$ts_mesurehistoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_mesurehistos.
     * @param {ts_mesurehistoDeleteManyArgs} args - Arguments to filter Ts_mesurehistos to delete.
     * @example
     * // Delete a few Ts_mesurehistos
     * const { count } = await prisma.ts_mesurehisto.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_mesurehistoDeleteManyArgs>(args?: SelectSubset<T, ts_mesurehistoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_mesurehistos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurehistoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_mesurehistos
     * const ts_mesurehisto = await prisma.ts_mesurehisto.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_mesurehistoUpdateManyArgs>(args: SelectSubset<T, ts_mesurehistoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_mesurehisto.
     * @param {ts_mesurehistoUpsertArgs} args - Arguments to update or create a Ts_mesurehisto.
     * @example
     * // Update or create a Ts_mesurehisto
     * const ts_mesurehisto = await prisma.ts_mesurehisto.upsert({
     *   create: {
     *     // ... data to create a Ts_mesurehisto
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_mesurehisto we want to update
     *   }
     * })
     */
    upsert<T extends ts_mesurehistoUpsertArgs>(args: SelectSubset<T, ts_mesurehistoUpsertArgs<ExtArgs>>): Prisma__ts_mesurehistoClient<$Result.GetResult<Prisma.$ts_mesurehistoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_mesurehistos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurehistoCountArgs} args - Arguments to filter Ts_mesurehistos to count.
     * @example
     * // Count the number of Ts_mesurehistos
     * const count = await prisma.ts_mesurehisto.count({
     *   where: {
     *     // ... the filter for the Ts_mesurehistos we want to count
     *   }
     * })
    **/
    count<T extends ts_mesurehistoCountArgs>(
      args?: Subset<T, ts_mesurehistoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_mesurehistoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_mesurehisto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_mesurehistoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_mesurehistoAggregateArgs>(args: Subset<T, Ts_mesurehistoAggregateArgs>): Prisma.PrismaPromise<GetTs_mesurehistoAggregateType<T>>

    /**
     * Group by Ts_mesurehisto.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesurehistoGroupByArgs} args - Group by arguments.
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
      T extends ts_mesurehistoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_mesurehistoGroupByArgs['orderBy'] }
        : { orderBy?: ts_mesurehistoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_mesurehistoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_mesurehistoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_mesurehisto model
   */
  readonly fields: ts_mesurehistoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_mesurehisto.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_mesurehistoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_mesurehisto model
   */
  interface ts_mesurehistoFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_mesurehisto", 'Int'>
    readonly IdMesure: FieldRef<"ts_mesurehisto", 'Int'>
    readonly DateHeureMesure: FieldRef<"ts_mesurehisto", 'DateTime'>
    readonly Valeur: FieldRef<"ts_mesurehisto", 'Float'>
    readonly Resistance: FieldRef<"ts_mesurehisto", 'Float'>
    readonly Nb_decimal: FieldRef<"ts_mesurehisto", 'Int'>
    readonly Consigne: FieldRef<"ts_mesurehisto", 'Float'>
    readonly Consigne_Sup: FieldRef<"ts_mesurehisto", 'Float'>
    readonly Consigne_Inf: FieldRef<"ts_mesurehisto", 'Float'>
    readonly Unite: FieldRef<"ts_mesurehisto", 'String'>
    readonly SondeNumeroSerie: FieldRef<"ts_mesurehisto", 'String'>
    readonly IdLieu: FieldRef<"ts_mesurehisto", 'Int'>
    readonly ValeurNull: FieldRef<"ts_mesurehisto", 'Int'>
    readonly Frequence: FieldRef<"ts_mesurehisto", 'Int'>
    readonly Etat_Alarme: FieldRef<"ts_mesurehisto", 'Boolean'>
    readonly Consigne_Inf_PreAlarme: FieldRef<"ts_mesurehisto", 'Float'>
    readonly Consigne_Sup_PreAlarme: FieldRef<"ts_mesurehisto", 'Float'>
    readonly Moyenne: FieldRef<"ts_mesurehisto", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * ts_mesurehisto findUnique
   */
  export type ts_mesurehistoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurehisto to fetch.
     */
    where: ts_mesurehistoWhereUniqueInput
  }

  /**
   * ts_mesurehisto findUniqueOrThrow
   */
  export type ts_mesurehistoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurehisto to fetch.
     */
    where: ts_mesurehistoWhereUniqueInput
  }

  /**
   * ts_mesurehisto findFirst
   */
  export type ts_mesurehistoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurehisto to fetch.
     */
    where?: ts_mesurehistoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurehistos to fetch.
     */
    orderBy?: ts_mesurehistoOrderByWithRelationInput | ts_mesurehistoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesurehistos.
     */
    cursor?: ts_mesurehistoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurehistos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurehistos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesurehistos.
     */
    distinct?: Ts_mesurehistoScalarFieldEnum | Ts_mesurehistoScalarFieldEnum[]
  }

  /**
   * ts_mesurehisto findFirstOrThrow
   */
  export type ts_mesurehistoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurehisto to fetch.
     */
    where?: ts_mesurehistoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurehistos to fetch.
     */
    orderBy?: ts_mesurehistoOrderByWithRelationInput | ts_mesurehistoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesurehistos.
     */
    cursor?: ts_mesurehistoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurehistos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurehistos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesurehistos.
     */
    distinct?: Ts_mesurehistoScalarFieldEnum | Ts_mesurehistoScalarFieldEnum[]
  }

  /**
   * ts_mesurehisto findMany
   */
  export type ts_mesurehistoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesurehistos to fetch.
     */
    where?: ts_mesurehistoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesurehistos to fetch.
     */
    orderBy?: ts_mesurehistoOrderByWithRelationInput | ts_mesurehistoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_mesurehistos.
     */
    cursor?: ts_mesurehistoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesurehistos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesurehistos.
     */
    skip?: number
    distinct?: Ts_mesurehistoScalarFieldEnum | Ts_mesurehistoScalarFieldEnum[]
  }

  /**
   * ts_mesurehisto create
   */
  export type ts_mesurehistoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_mesurehisto.
     */
    data?: XOR<ts_mesurehistoCreateInput, ts_mesurehistoUncheckedCreateInput>
  }

  /**
   * ts_mesurehisto createMany
   */
  export type ts_mesurehistoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_mesurehistos.
     */
    data: ts_mesurehistoCreateManyInput | ts_mesurehistoCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_mesurehisto update
   */
  export type ts_mesurehistoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_mesurehisto.
     */
    data: XOR<ts_mesurehistoUpdateInput, ts_mesurehistoUncheckedUpdateInput>
    /**
     * Choose, which ts_mesurehisto to update.
     */
    where: ts_mesurehistoWhereUniqueInput
  }

  /**
   * ts_mesurehisto updateMany
   */
  export type ts_mesurehistoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_mesurehistos.
     */
    data: XOR<ts_mesurehistoUpdateManyMutationInput, ts_mesurehistoUncheckedUpdateManyInput>
    /**
     * Filter which ts_mesurehistos to update
     */
    where?: ts_mesurehistoWhereInput
    /**
     * Limit how many ts_mesurehistos to update.
     */
    limit?: number
  }

  /**
   * ts_mesurehisto upsert
   */
  export type ts_mesurehistoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_mesurehisto to update in case it exists.
     */
    where: ts_mesurehistoWhereUniqueInput
    /**
     * In case the ts_mesurehisto found by the `where` argument doesn't exist, create a new ts_mesurehisto with this data.
     */
    create: XOR<ts_mesurehistoCreateInput, ts_mesurehistoUncheckedCreateInput>
    /**
     * In case the ts_mesurehisto was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_mesurehistoUpdateInput, ts_mesurehistoUncheckedUpdateInput>
  }

  /**
   * ts_mesurehisto delete
   */
  export type ts_mesurehistoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
    /**
     * Filter which ts_mesurehisto to delete.
     */
    where: ts_mesurehistoWhereUniqueInput
  }

  /**
   * ts_mesurehisto deleteMany
   */
  export type ts_mesurehistoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesurehistos to delete
     */
    where?: ts_mesurehistoWhereInput
    /**
     * Limit how many ts_mesurehistos to delete.
     */
    limit?: number
  }

  /**
   * ts_mesurehisto without action
   */
  export type ts_mesurehistoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesurehisto
     */
    select?: ts_mesurehistoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesurehisto
     */
    omit?: ts_mesurehistoOmit<ExtArgs> | null
  }


  /**
   * Model ts_mesuretest
   */

  export type AggregateTs_mesuretest = {
    _count: Ts_mesuretestCountAggregateOutputType | null
    _avg: Ts_mesuretestAvgAggregateOutputType | null
    _sum: Ts_mesuretestSumAggregateOutputType | null
    _min: Ts_mesuretestMinAggregateOutputType | null
    _max: Ts_mesuretestMaxAggregateOutputType | null
  }

  export type Ts_mesuretestAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureTest: number | null
    Resistance: number | null
    ValeurNull: number | null
    NombreTotal: number | null
    NombreRecu: number | null
  }

  export type Ts_mesuretestSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureTest: number | null
    Resistance: number | null
    ValeurNull: number | null
    NombreTotal: number | null
    NombreRecu: number | null
  }

  export type Ts_mesuretestMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureTest: number | null
    Resistance: number | null
    SondeNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
    NombreTotal: number | null
    NombreRecu: number | null
  }

  export type Ts_mesuretestMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureTest: number | null
    Resistance: number | null
    SondeNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
    NombreTotal: number | null
    NombreRecu: number | null
  }

  export type Ts_mesuretestCountAggregateOutputType = {
    IdServeurBDD: number
    IdMesureTest: number
    Resistance: number
    SondeNumeroSerie: number
    ValeurNull: number
    DateHeure: number
    NombreTotal: number
    NombreRecu: number
    _all: number
  }


  export type Ts_mesuretestAvgAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTest?: true
    Resistance?: true
    ValeurNull?: true
    NombreTotal?: true
    NombreRecu?: true
  }

  export type Ts_mesuretestSumAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTest?: true
    Resistance?: true
    ValeurNull?: true
    NombreTotal?: true
    NombreRecu?: true
  }

  export type Ts_mesuretestMinAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTest?: true
    Resistance?: true
    SondeNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    NombreTotal?: true
    NombreRecu?: true
  }

  export type Ts_mesuretestMaxAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTest?: true
    Resistance?: true
    SondeNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    NombreTotal?: true
    NombreRecu?: true
  }

  export type Ts_mesuretestCountAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTest?: true
    Resistance?: true
    SondeNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    NombreTotal?: true
    NombreRecu?: true
    _all?: true
  }

  export type Ts_mesuretestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesuretest to aggregate.
     */
    where?: ts_mesuretestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesuretests to fetch.
     */
    orderBy?: ts_mesuretestOrderByWithRelationInput | ts_mesuretestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_mesuretestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesuretests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesuretests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_mesuretests
    **/
    _count?: true | Ts_mesuretestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_mesuretestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_mesuretestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_mesuretestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_mesuretestMaxAggregateInputType
  }

  export type GetTs_mesuretestAggregateType<T extends Ts_mesuretestAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_mesuretest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_mesuretest[P]>
      : GetScalarType<T[P], AggregateTs_mesuretest[P]>
  }




  export type ts_mesuretestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_mesuretestWhereInput
    orderBy?: ts_mesuretestOrderByWithAggregationInput | ts_mesuretestOrderByWithAggregationInput[]
    by: Ts_mesuretestScalarFieldEnum[] | Ts_mesuretestScalarFieldEnum
    having?: ts_mesuretestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_mesuretestCountAggregateInputType | true
    _avg?: Ts_mesuretestAvgAggregateInputType
    _sum?: Ts_mesuretestSumAggregateInputType
    _min?: Ts_mesuretestMinAggregateInputType
    _max?: Ts_mesuretestMaxAggregateInputType
  }

  export type Ts_mesuretestGroupByOutputType = {
    IdServeurBDD: number
    IdMesureTest: number
    Resistance: number
    SondeNumeroSerie: string
    ValeurNull: number
    DateHeure: Date
    NombreTotal: number
    NombreRecu: number
    _count: Ts_mesuretestCountAggregateOutputType | null
    _avg: Ts_mesuretestAvgAggregateOutputType | null
    _sum: Ts_mesuretestSumAggregateOutputType | null
    _min: Ts_mesuretestMinAggregateOutputType | null
    _max: Ts_mesuretestMaxAggregateOutputType | null
  }

  type GetTs_mesuretestGroupByPayload<T extends ts_mesuretestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_mesuretestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_mesuretestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_mesuretestGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_mesuretestGroupByOutputType[P]>
        }
      >
    >


  export type ts_mesuretestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdMesureTest?: boolean
    Resistance?: boolean
    SondeNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
    NombreTotal?: boolean
    NombreRecu?: boolean
  }, ExtArgs["result"]["ts_mesuretest"]>



  export type ts_mesuretestSelectScalar = {
    IdServeurBDD?: boolean
    IdMesureTest?: boolean
    Resistance?: boolean
    SondeNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
    NombreTotal?: boolean
    NombreRecu?: boolean
  }

  export type ts_mesuretestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdMesureTest" | "Resistance" | "SondeNumeroSerie" | "ValeurNull" | "DateHeure" | "NombreTotal" | "NombreRecu", ExtArgs["result"]["ts_mesuretest"]>

  export type $ts_mesuretestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_mesuretest"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdMesureTest: number
      Resistance: number
      SondeNumeroSerie: string
      ValeurNull: number
      DateHeure: Date
      NombreTotal: number
      NombreRecu: number
    }, ExtArgs["result"]["ts_mesuretest"]>
    composites: {}
  }

  type ts_mesuretestGetPayload<S extends boolean | null | undefined | ts_mesuretestDefaultArgs> = $Result.GetResult<Prisma.$ts_mesuretestPayload, S>

  type ts_mesuretestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_mesuretestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_mesuretestCountAggregateInputType | true
    }

  export interface ts_mesuretestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_mesuretest'], meta: { name: 'ts_mesuretest' } }
    /**
     * Find zero or one Ts_mesuretest that matches the filter.
     * @param {ts_mesuretestFindUniqueArgs} args - Arguments to find a Ts_mesuretest
     * @example
     * // Get one Ts_mesuretest
     * const ts_mesuretest = await prisma.ts_mesuretest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_mesuretestFindUniqueArgs>(args: SelectSubset<T, ts_mesuretestFindUniqueArgs<ExtArgs>>): Prisma__ts_mesuretestClient<$Result.GetResult<Prisma.$ts_mesuretestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_mesuretest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_mesuretestFindUniqueOrThrowArgs} args - Arguments to find a Ts_mesuretest
     * @example
     * // Get one Ts_mesuretest
     * const ts_mesuretest = await prisma.ts_mesuretest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_mesuretestFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_mesuretestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_mesuretestClient<$Result.GetResult<Prisma.$ts_mesuretestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesuretest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestFindFirstArgs} args - Arguments to find a Ts_mesuretest
     * @example
     * // Get one Ts_mesuretest
     * const ts_mesuretest = await prisma.ts_mesuretest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_mesuretestFindFirstArgs>(args?: SelectSubset<T, ts_mesuretestFindFirstArgs<ExtArgs>>): Prisma__ts_mesuretestClient<$Result.GetResult<Prisma.$ts_mesuretestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesuretest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestFindFirstOrThrowArgs} args - Arguments to find a Ts_mesuretest
     * @example
     * // Get one Ts_mesuretest
     * const ts_mesuretest = await prisma.ts_mesuretest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_mesuretestFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_mesuretestFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_mesuretestClient<$Result.GetResult<Prisma.$ts_mesuretestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_mesuretests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_mesuretests
     * const ts_mesuretests = await prisma.ts_mesuretest.findMany()
     * 
     * // Get first 10 Ts_mesuretests
     * const ts_mesuretests = await prisma.ts_mesuretest.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_mesuretestWithIdServeurBDDOnly = await prisma.ts_mesuretest.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_mesuretestFindManyArgs>(args?: SelectSubset<T, ts_mesuretestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_mesuretestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_mesuretest.
     * @param {ts_mesuretestCreateArgs} args - Arguments to create a Ts_mesuretest.
     * @example
     * // Create one Ts_mesuretest
     * const Ts_mesuretest = await prisma.ts_mesuretest.create({
     *   data: {
     *     // ... data to create a Ts_mesuretest
     *   }
     * })
     * 
     */
    create<T extends ts_mesuretestCreateArgs>(args: SelectSubset<T, ts_mesuretestCreateArgs<ExtArgs>>): Prisma__ts_mesuretestClient<$Result.GetResult<Prisma.$ts_mesuretestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_mesuretests.
     * @param {ts_mesuretestCreateManyArgs} args - Arguments to create many Ts_mesuretests.
     * @example
     * // Create many Ts_mesuretests
     * const ts_mesuretest = await prisma.ts_mesuretest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_mesuretestCreateManyArgs>(args?: SelectSubset<T, ts_mesuretestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_mesuretest.
     * @param {ts_mesuretestDeleteArgs} args - Arguments to delete one Ts_mesuretest.
     * @example
     * // Delete one Ts_mesuretest
     * const Ts_mesuretest = await prisma.ts_mesuretest.delete({
     *   where: {
     *     // ... filter to delete one Ts_mesuretest
     *   }
     * })
     * 
     */
    delete<T extends ts_mesuretestDeleteArgs>(args: SelectSubset<T, ts_mesuretestDeleteArgs<ExtArgs>>): Prisma__ts_mesuretestClient<$Result.GetResult<Prisma.$ts_mesuretestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_mesuretest.
     * @param {ts_mesuretestUpdateArgs} args - Arguments to update one Ts_mesuretest.
     * @example
     * // Update one Ts_mesuretest
     * const ts_mesuretest = await prisma.ts_mesuretest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_mesuretestUpdateArgs>(args: SelectSubset<T, ts_mesuretestUpdateArgs<ExtArgs>>): Prisma__ts_mesuretestClient<$Result.GetResult<Prisma.$ts_mesuretestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_mesuretests.
     * @param {ts_mesuretestDeleteManyArgs} args - Arguments to filter Ts_mesuretests to delete.
     * @example
     * // Delete a few Ts_mesuretests
     * const { count } = await prisma.ts_mesuretest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_mesuretestDeleteManyArgs>(args?: SelectSubset<T, ts_mesuretestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_mesuretests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_mesuretests
     * const ts_mesuretest = await prisma.ts_mesuretest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_mesuretestUpdateManyArgs>(args: SelectSubset<T, ts_mesuretestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_mesuretest.
     * @param {ts_mesuretestUpsertArgs} args - Arguments to update or create a Ts_mesuretest.
     * @example
     * // Update or create a Ts_mesuretest
     * const ts_mesuretest = await prisma.ts_mesuretest.upsert({
     *   create: {
     *     // ... data to create a Ts_mesuretest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_mesuretest we want to update
     *   }
     * })
     */
    upsert<T extends ts_mesuretestUpsertArgs>(args: SelectSubset<T, ts_mesuretestUpsertArgs<ExtArgs>>): Prisma__ts_mesuretestClient<$Result.GetResult<Prisma.$ts_mesuretestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_mesuretests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestCountArgs} args - Arguments to filter Ts_mesuretests to count.
     * @example
     * // Count the number of Ts_mesuretests
     * const count = await prisma.ts_mesuretest.count({
     *   where: {
     *     // ... the filter for the Ts_mesuretests we want to count
     *   }
     * })
    **/
    count<T extends ts_mesuretestCountArgs>(
      args?: Subset<T, ts_mesuretestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_mesuretestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_mesuretest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_mesuretestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_mesuretestAggregateArgs>(args: Subset<T, Ts_mesuretestAggregateArgs>): Prisma.PrismaPromise<GetTs_mesuretestAggregateType<T>>

    /**
     * Group by Ts_mesuretest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestGroupByArgs} args - Group by arguments.
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
      T extends ts_mesuretestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_mesuretestGroupByArgs['orderBy'] }
        : { orderBy?: ts_mesuretestGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_mesuretestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_mesuretestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_mesuretest model
   */
  readonly fields: ts_mesuretestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_mesuretest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_mesuretestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_mesuretest model
   */
  interface ts_mesuretestFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_mesuretest", 'Int'>
    readonly IdMesureTest: FieldRef<"ts_mesuretest", 'Int'>
    readonly Resistance: FieldRef<"ts_mesuretest", 'Float'>
    readonly SondeNumeroSerie: FieldRef<"ts_mesuretest", 'String'>
    readonly ValeurNull: FieldRef<"ts_mesuretest", 'Int'>
    readonly DateHeure: FieldRef<"ts_mesuretest", 'DateTime'>
    readonly NombreTotal: FieldRef<"ts_mesuretest", 'Int'>
    readonly NombreRecu: FieldRef<"ts_mesuretest", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ts_mesuretest findUnique
   */
  export type ts_mesuretestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretest to fetch.
     */
    where: ts_mesuretestWhereUniqueInput
  }

  /**
   * ts_mesuretest findUniqueOrThrow
   */
  export type ts_mesuretestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretest to fetch.
     */
    where: ts_mesuretestWhereUniqueInput
  }

  /**
   * ts_mesuretest findFirst
   */
  export type ts_mesuretestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretest to fetch.
     */
    where?: ts_mesuretestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesuretests to fetch.
     */
    orderBy?: ts_mesuretestOrderByWithRelationInput | ts_mesuretestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesuretests.
     */
    cursor?: ts_mesuretestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesuretests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesuretests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesuretests.
     */
    distinct?: Ts_mesuretestScalarFieldEnum | Ts_mesuretestScalarFieldEnum[]
  }

  /**
   * ts_mesuretest findFirstOrThrow
   */
  export type ts_mesuretestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretest to fetch.
     */
    where?: ts_mesuretestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesuretests to fetch.
     */
    orderBy?: ts_mesuretestOrderByWithRelationInput | ts_mesuretestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesuretests.
     */
    cursor?: ts_mesuretestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesuretests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesuretests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesuretests.
     */
    distinct?: Ts_mesuretestScalarFieldEnum | Ts_mesuretestScalarFieldEnum[]
  }

  /**
   * ts_mesuretest findMany
   */
  export type ts_mesuretestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretests to fetch.
     */
    where?: ts_mesuretestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesuretests to fetch.
     */
    orderBy?: ts_mesuretestOrderByWithRelationInput | ts_mesuretestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_mesuretests.
     */
    cursor?: ts_mesuretestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesuretests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesuretests.
     */
    skip?: number
    distinct?: Ts_mesuretestScalarFieldEnum | Ts_mesuretestScalarFieldEnum[]
  }

  /**
   * ts_mesuretest create
   */
  export type ts_mesuretestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_mesuretest.
     */
    data: XOR<ts_mesuretestCreateInput, ts_mesuretestUncheckedCreateInput>
  }

  /**
   * ts_mesuretest createMany
   */
  export type ts_mesuretestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_mesuretests.
     */
    data: ts_mesuretestCreateManyInput | ts_mesuretestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_mesuretest update
   */
  export type ts_mesuretestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_mesuretest.
     */
    data: XOR<ts_mesuretestUpdateInput, ts_mesuretestUncheckedUpdateInput>
    /**
     * Choose, which ts_mesuretest to update.
     */
    where: ts_mesuretestWhereUniqueInput
  }

  /**
   * ts_mesuretest updateMany
   */
  export type ts_mesuretestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_mesuretests.
     */
    data: XOR<ts_mesuretestUpdateManyMutationInput, ts_mesuretestUncheckedUpdateManyInput>
    /**
     * Filter which ts_mesuretests to update
     */
    where?: ts_mesuretestWhereInput
    /**
     * Limit how many ts_mesuretests to update.
     */
    limit?: number
  }

  /**
   * ts_mesuretest upsert
   */
  export type ts_mesuretestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_mesuretest to update in case it exists.
     */
    where: ts_mesuretestWhereUniqueInput
    /**
     * In case the ts_mesuretest found by the `where` argument doesn't exist, create a new ts_mesuretest with this data.
     */
    create: XOR<ts_mesuretestCreateInput, ts_mesuretestUncheckedCreateInput>
    /**
     * In case the ts_mesuretest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_mesuretestUpdateInput, ts_mesuretestUncheckedUpdateInput>
  }

  /**
   * ts_mesuretest delete
   */
  export type ts_mesuretestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
    /**
     * Filter which ts_mesuretest to delete.
     */
    where: ts_mesuretestWhereUniqueInput
  }

  /**
   * ts_mesuretest deleteMany
   */
  export type ts_mesuretestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesuretests to delete
     */
    where?: ts_mesuretestWhereInput
    /**
     * Limit how many ts_mesuretests to delete.
     */
    limit?: number
  }

  /**
   * ts_mesuretest without action
   */
  export type ts_mesuretestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretest
     */
    select?: ts_mesuretestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretest
     */
    omit?: ts_mesuretestOmit<ExtArgs> | null
  }


  /**
   * Model ts_mesuretestetalon
   */

  export type AggregateTs_mesuretestetalon = {
    _count: Ts_mesuretestetalonCountAggregateOutputType | null
    _avg: Ts_mesuretestetalonAvgAggregateOutputType | null
    _sum: Ts_mesuretestetalonSumAggregateOutputType | null
    _min: Ts_mesuretestetalonMinAggregateOutputType | null
    _max: Ts_mesuretestetalonMaxAggregateOutputType | null
  }

  export type Ts_mesuretestetalonAvgAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureTestEtalon: number | null
    Resistance: number | null
    ValeurNull: number | null
    NombreTotal: number | null
    NombreRecu: number | null
  }

  export type Ts_mesuretestetalonSumAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureTestEtalon: number | null
    Resistance: number | null
    ValeurNull: number | null
    NombreTotal: number | null
    NombreRecu: number | null
  }

  export type Ts_mesuretestetalonMinAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureTestEtalon: number | null
    Resistance: number | null
    EtalonNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
    NombreTotal: number | null
    NombreRecu: number | null
  }

  export type Ts_mesuretestetalonMaxAggregateOutputType = {
    IdServeurBDD: number | null
    IdMesureTestEtalon: number | null
    Resistance: number | null
    EtalonNumeroSerie: string | null
    ValeurNull: number | null
    DateHeure: Date | null
    NombreTotal: number | null
    NombreRecu: number | null
  }

  export type Ts_mesuretestetalonCountAggregateOutputType = {
    IdServeurBDD: number
    IdMesureTestEtalon: number
    Resistance: number
    EtalonNumeroSerie: number
    ValeurNull: number
    DateHeure: number
    NombreTotal: number
    NombreRecu: number
    _all: number
  }


  export type Ts_mesuretestetalonAvgAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTestEtalon?: true
    Resistance?: true
    ValeurNull?: true
    NombreTotal?: true
    NombreRecu?: true
  }

  export type Ts_mesuretestetalonSumAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTestEtalon?: true
    Resistance?: true
    ValeurNull?: true
    NombreTotal?: true
    NombreRecu?: true
  }

  export type Ts_mesuretestetalonMinAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTestEtalon?: true
    Resistance?: true
    EtalonNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    NombreTotal?: true
    NombreRecu?: true
  }

  export type Ts_mesuretestetalonMaxAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTestEtalon?: true
    Resistance?: true
    EtalonNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    NombreTotal?: true
    NombreRecu?: true
  }

  export type Ts_mesuretestetalonCountAggregateInputType = {
    IdServeurBDD?: true
    IdMesureTestEtalon?: true
    Resistance?: true
    EtalonNumeroSerie?: true
    ValeurNull?: true
    DateHeure?: true
    NombreTotal?: true
    NombreRecu?: true
    _all?: true
  }

  export type Ts_mesuretestetalonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesuretestetalon to aggregate.
     */
    where?: ts_mesuretestetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesuretestetalons to fetch.
     */
    orderBy?: ts_mesuretestetalonOrderByWithRelationInput | ts_mesuretestetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_mesuretestetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesuretestetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesuretestetalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_mesuretestetalons
    **/
    _count?: true | Ts_mesuretestetalonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_mesuretestetalonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_mesuretestetalonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_mesuretestetalonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_mesuretestetalonMaxAggregateInputType
  }

  export type GetTs_mesuretestetalonAggregateType<T extends Ts_mesuretestetalonAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_mesuretestetalon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_mesuretestetalon[P]>
      : GetScalarType<T[P], AggregateTs_mesuretestetalon[P]>
  }




  export type ts_mesuretestetalonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_mesuretestetalonWhereInput
    orderBy?: ts_mesuretestetalonOrderByWithAggregationInput | ts_mesuretestetalonOrderByWithAggregationInput[]
    by: Ts_mesuretestetalonScalarFieldEnum[] | Ts_mesuretestetalonScalarFieldEnum
    having?: ts_mesuretestetalonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_mesuretestetalonCountAggregateInputType | true
    _avg?: Ts_mesuretestetalonAvgAggregateInputType
    _sum?: Ts_mesuretestetalonSumAggregateInputType
    _min?: Ts_mesuretestetalonMinAggregateInputType
    _max?: Ts_mesuretestetalonMaxAggregateInputType
  }

  export type Ts_mesuretestetalonGroupByOutputType = {
    IdServeurBDD: number
    IdMesureTestEtalon: number
    Resistance: number
    EtalonNumeroSerie: string
    ValeurNull: number
    DateHeure: Date
    NombreTotal: number
    NombreRecu: number
    _count: Ts_mesuretestetalonCountAggregateOutputType | null
    _avg: Ts_mesuretestetalonAvgAggregateOutputType | null
    _sum: Ts_mesuretestetalonSumAggregateOutputType | null
    _min: Ts_mesuretestetalonMinAggregateOutputType | null
    _max: Ts_mesuretestetalonMaxAggregateOutputType | null
  }

  type GetTs_mesuretestetalonGroupByPayload<T extends ts_mesuretestetalonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_mesuretestetalonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_mesuretestetalonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_mesuretestetalonGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_mesuretestetalonGroupByOutputType[P]>
        }
      >
    >


  export type ts_mesuretestetalonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdServeurBDD?: boolean
    IdMesureTestEtalon?: boolean
    Resistance?: boolean
    EtalonNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
    NombreTotal?: boolean
    NombreRecu?: boolean
  }, ExtArgs["result"]["ts_mesuretestetalon"]>



  export type ts_mesuretestetalonSelectScalar = {
    IdServeurBDD?: boolean
    IdMesureTestEtalon?: boolean
    Resistance?: boolean
    EtalonNumeroSerie?: boolean
    ValeurNull?: boolean
    DateHeure?: boolean
    NombreTotal?: boolean
    NombreRecu?: boolean
  }

  export type ts_mesuretestetalonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdServeurBDD" | "IdMesureTestEtalon" | "Resistance" | "EtalonNumeroSerie" | "ValeurNull" | "DateHeure" | "NombreTotal" | "NombreRecu", ExtArgs["result"]["ts_mesuretestetalon"]>

  export type $ts_mesuretestetalonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_mesuretestetalon"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdServeurBDD: number
      IdMesureTestEtalon: number
      Resistance: number
      EtalonNumeroSerie: string
      ValeurNull: number
      DateHeure: Date
      NombreTotal: number
      NombreRecu: number
    }, ExtArgs["result"]["ts_mesuretestetalon"]>
    composites: {}
  }

  type ts_mesuretestetalonGetPayload<S extends boolean | null | undefined | ts_mesuretestetalonDefaultArgs> = $Result.GetResult<Prisma.$ts_mesuretestetalonPayload, S>

  type ts_mesuretestetalonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_mesuretestetalonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_mesuretestetalonCountAggregateInputType | true
    }

  export interface ts_mesuretestetalonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_mesuretestetalon'], meta: { name: 'ts_mesuretestetalon' } }
    /**
     * Find zero or one Ts_mesuretestetalon that matches the filter.
     * @param {ts_mesuretestetalonFindUniqueArgs} args - Arguments to find a Ts_mesuretestetalon
     * @example
     * // Get one Ts_mesuretestetalon
     * const ts_mesuretestetalon = await prisma.ts_mesuretestetalon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_mesuretestetalonFindUniqueArgs>(args: SelectSubset<T, ts_mesuretestetalonFindUniqueArgs<ExtArgs>>): Prisma__ts_mesuretestetalonClient<$Result.GetResult<Prisma.$ts_mesuretestetalonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_mesuretestetalon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_mesuretestetalonFindUniqueOrThrowArgs} args - Arguments to find a Ts_mesuretestetalon
     * @example
     * // Get one Ts_mesuretestetalon
     * const ts_mesuretestetalon = await prisma.ts_mesuretestetalon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_mesuretestetalonFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_mesuretestetalonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_mesuretestetalonClient<$Result.GetResult<Prisma.$ts_mesuretestetalonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesuretestetalon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestetalonFindFirstArgs} args - Arguments to find a Ts_mesuretestetalon
     * @example
     * // Get one Ts_mesuretestetalon
     * const ts_mesuretestetalon = await prisma.ts_mesuretestetalon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_mesuretestetalonFindFirstArgs>(args?: SelectSubset<T, ts_mesuretestetalonFindFirstArgs<ExtArgs>>): Prisma__ts_mesuretestetalonClient<$Result.GetResult<Prisma.$ts_mesuretestetalonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_mesuretestetalon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestetalonFindFirstOrThrowArgs} args - Arguments to find a Ts_mesuretestetalon
     * @example
     * // Get one Ts_mesuretestetalon
     * const ts_mesuretestetalon = await prisma.ts_mesuretestetalon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_mesuretestetalonFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_mesuretestetalonFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_mesuretestetalonClient<$Result.GetResult<Prisma.$ts_mesuretestetalonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_mesuretestetalons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestetalonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_mesuretestetalons
     * const ts_mesuretestetalons = await prisma.ts_mesuretestetalon.findMany()
     * 
     * // Get first 10 Ts_mesuretestetalons
     * const ts_mesuretestetalons = await prisma.ts_mesuretestetalon.findMany({ take: 10 })
     * 
     * // Only select the `IdServeurBDD`
     * const ts_mesuretestetalonWithIdServeurBDDOnly = await prisma.ts_mesuretestetalon.findMany({ select: { IdServeurBDD: true } })
     * 
     */
    findMany<T extends ts_mesuretestetalonFindManyArgs>(args?: SelectSubset<T, ts_mesuretestetalonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_mesuretestetalonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_mesuretestetalon.
     * @param {ts_mesuretestetalonCreateArgs} args - Arguments to create a Ts_mesuretestetalon.
     * @example
     * // Create one Ts_mesuretestetalon
     * const Ts_mesuretestetalon = await prisma.ts_mesuretestetalon.create({
     *   data: {
     *     // ... data to create a Ts_mesuretestetalon
     *   }
     * })
     * 
     */
    create<T extends ts_mesuretestetalonCreateArgs>(args: SelectSubset<T, ts_mesuretestetalonCreateArgs<ExtArgs>>): Prisma__ts_mesuretestetalonClient<$Result.GetResult<Prisma.$ts_mesuretestetalonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_mesuretestetalons.
     * @param {ts_mesuretestetalonCreateManyArgs} args - Arguments to create many Ts_mesuretestetalons.
     * @example
     * // Create many Ts_mesuretestetalons
     * const ts_mesuretestetalon = await prisma.ts_mesuretestetalon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_mesuretestetalonCreateManyArgs>(args?: SelectSubset<T, ts_mesuretestetalonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_mesuretestetalon.
     * @param {ts_mesuretestetalonDeleteArgs} args - Arguments to delete one Ts_mesuretestetalon.
     * @example
     * // Delete one Ts_mesuretestetalon
     * const Ts_mesuretestetalon = await prisma.ts_mesuretestetalon.delete({
     *   where: {
     *     // ... filter to delete one Ts_mesuretestetalon
     *   }
     * })
     * 
     */
    delete<T extends ts_mesuretestetalonDeleteArgs>(args: SelectSubset<T, ts_mesuretestetalonDeleteArgs<ExtArgs>>): Prisma__ts_mesuretestetalonClient<$Result.GetResult<Prisma.$ts_mesuretestetalonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_mesuretestetalon.
     * @param {ts_mesuretestetalonUpdateArgs} args - Arguments to update one Ts_mesuretestetalon.
     * @example
     * // Update one Ts_mesuretestetalon
     * const ts_mesuretestetalon = await prisma.ts_mesuretestetalon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_mesuretestetalonUpdateArgs>(args: SelectSubset<T, ts_mesuretestetalonUpdateArgs<ExtArgs>>): Prisma__ts_mesuretestetalonClient<$Result.GetResult<Prisma.$ts_mesuretestetalonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_mesuretestetalons.
     * @param {ts_mesuretestetalonDeleteManyArgs} args - Arguments to filter Ts_mesuretestetalons to delete.
     * @example
     * // Delete a few Ts_mesuretestetalons
     * const { count } = await prisma.ts_mesuretestetalon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_mesuretestetalonDeleteManyArgs>(args?: SelectSubset<T, ts_mesuretestetalonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_mesuretestetalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestetalonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_mesuretestetalons
     * const ts_mesuretestetalon = await prisma.ts_mesuretestetalon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_mesuretestetalonUpdateManyArgs>(args: SelectSubset<T, ts_mesuretestetalonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_mesuretestetalon.
     * @param {ts_mesuretestetalonUpsertArgs} args - Arguments to update or create a Ts_mesuretestetalon.
     * @example
     * // Update or create a Ts_mesuretestetalon
     * const ts_mesuretestetalon = await prisma.ts_mesuretestetalon.upsert({
     *   create: {
     *     // ... data to create a Ts_mesuretestetalon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_mesuretestetalon we want to update
     *   }
     * })
     */
    upsert<T extends ts_mesuretestetalonUpsertArgs>(args: SelectSubset<T, ts_mesuretestetalonUpsertArgs<ExtArgs>>): Prisma__ts_mesuretestetalonClient<$Result.GetResult<Prisma.$ts_mesuretestetalonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_mesuretestetalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestetalonCountArgs} args - Arguments to filter Ts_mesuretestetalons to count.
     * @example
     * // Count the number of Ts_mesuretestetalons
     * const count = await prisma.ts_mesuretestetalon.count({
     *   where: {
     *     // ... the filter for the Ts_mesuretestetalons we want to count
     *   }
     * })
    **/
    count<T extends ts_mesuretestetalonCountArgs>(
      args?: Subset<T, ts_mesuretestetalonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_mesuretestetalonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_mesuretestetalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_mesuretestetalonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_mesuretestetalonAggregateArgs>(args: Subset<T, Ts_mesuretestetalonAggregateArgs>): Prisma.PrismaPromise<GetTs_mesuretestetalonAggregateType<T>>

    /**
     * Group by Ts_mesuretestetalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_mesuretestetalonGroupByArgs} args - Group by arguments.
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
      T extends ts_mesuretestetalonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_mesuretestetalonGroupByArgs['orderBy'] }
        : { orderBy?: ts_mesuretestetalonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_mesuretestetalonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_mesuretestetalonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_mesuretestetalon model
   */
  readonly fields: ts_mesuretestetalonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_mesuretestetalon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_mesuretestetalonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_mesuretestetalon model
   */
  interface ts_mesuretestetalonFieldRefs {
    readonly IdServeurBDD: FieldRef<"ts_mesuretestetalon", 'Int'>
    readonly IdMesureTestEtalon: FieldRef<"ts_mesuretestetalon", 'Int'>
    readonly Resistance: FieldRef<"ts_mesuretestetalon", 'Float'>
    readonly EtalonNumeroSerie: FieldRef<"ts_mesuretestetalon", 'String'>
    readonly ValeurNull: FieldRef<"ts_mesuretestetalon", 'Int'>
    readonly DateHeure: FieldRef<"ts_mesuretestetalon", 'DateTime'>
    readonly NombreTotal: FieldRef<"ts_mesuretestetalon", 'Int'>
    readonly NombreRecu: FieldRef<"ts_mesuretestetalon", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ts_mesuretestetalon findUnique
   */
  export type ts_mesuretestetalonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretestetalon to fetch.
     */
    where: ts_mesuretestetalonWhereUniqueInput
  }

  /**
   * ts_mesuretestetalon findUniqueOrThrow
   */
  export type ts_mesuretestetalonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretestetalon to fetch.
     */
    where: ts_mesuretestetalonWhereUniqueInput
  }

  /**
   * ts_mesuretestetalon findFirst
   */
  export type ts_mesuretestetalonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretestetalon to fetch.
     */
    where?: ts_mesuretestetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesuretestetalons to fetch.
     */
    orderBy?: ts_mesuretestetalonOrderByWithRelationInput | ts_mesuretestetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesuretestetalons.
     */
    cursor?: ts_mesuretestetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesuretestetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesuretestetalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesuretestetalons.
     */
    distinct?: Ts_mesuretestetalonScalarFieldEnum | Ts_mesuretestetalonScalarFieldEnum[]
  }

  /**
   * ts_mesuretestetalon findFirstOrThrow
   */
  export type ts_mesuretestetalonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretestetalon to fetch.
     */
    where?: ts_mesuretestetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesuretestetalons to fetch.
     */
    orderBy?: ts_mesuretestetalonOrderByWithRelationInput | ts_mesuretestetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_mesuretestetalons.
     */
    cursor?: ts_mesuretestetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesuretestetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesuretestetalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_mesuretestetalons.
     */
    distinct?: Ts_mesuretestetalonScalarFieldEnum | Ts_mesuretestetalonScalarFieldEnum[]
  }

  /**
   * ts_mesuretestetalon findMany
   */
  export type ts_mesuretestetalonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
    /**
     * Filter, which ts_mesuretestetalons to fetch.
     */
    where?: ts_mesuretestetalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_mesuretestetalons to fetch.
     */
    orderBy?: ts_mesuretestetalonOrderByWithRelationInput | ts_mesuretestetalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_mesuretestetalons.
     */
    cursor?: ts_mesuretestetalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_mesuretestetalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_mesuretestetalons.
     */
    skip?: number
    distinct?: Ts_mesuretestetalonScalarFieldEnum | Ts_mesuretestetalonScalarFieldEnum[]
  }

  /**
   * ts_mesuretestetalon create
   */
  export type ts_mesuretestetalonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_mesuretestetalon.
     */
    data: XOR<ts_mesuretestetalonCreateInput, ts_mesuretestetalonUncheckedCreateInput>
  }

  /**
   * ts_mesuretestetalon createMany
   */
  export type ts_mesuretestetalonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_mesuretestetalons.
     */
    data: ts_mesuretestetalonCreateManyInput | ts_mesuretestetalonCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_mesuretestetalon update
   */
  export type ts_mesuretestetalonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_mesuretestetalon.
     */
    data: XOR<ts_mesuretestetalonUpdateInput, ts_mesuretestetalonUncheckedUpdateInput>
    /**
     * Choose, which ts_mesuretestetalon to update.
     */
    where: ts_mesuretestetalonWhereUniqueInput
  }

  /**
   * ts_mesuretestetalon updateMany
   */
  export type ts_mesuretestetalonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_mesuretestetalons.
     */
    data: XOR<ts_mesuretestetalonUpdateManyMutationInput, ts_mesuretestetalonUncheckedUpdateManyInput>
    /**
     * Filter which ts_mesuretestetalons to update
     */
    where?: ts_mesuretestetalonWhereInput
    /**
     * Limit how many ts_mesuretestetalons to update.
     */
    limit?: number
  }

  /**
   * ts_mesuretestetalon upsert
   */
  export type ts_mesuretestetalonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_mesuretestetalon to update in case it exists.
     */
    where: ts_mesuretestetalonWhereUniqueInput
    /**
     * In case the ts_mesuretestetalon found by the `where` argument doesn't exist, create a new ts_mesuretestetalon with this data.
     */
    create: XOR<ts_mesuretestetalonCreateInput, ts_mesuretestetalonUncheckedCreateInput>
    /**
     * In case the ts_mesuretestetalon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_mesuretestetalonUpdateInput, ts_mesuretestetalonUncheckedUpdateInput>
  }

  /**
   * ts_mesuretestetalon delete
   */
  export type ts_mesuretestetalonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
    /**
     * Filter which ts_mesuretestetalon to delete.
     */
    where: ts_mesuretestetalonWhereUniqueInput
  }

  /**
   * ts_mesuretestetalon deleteMany
   */
  export type ts_mesuretestetalonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_mesuretestetalons to delete
     */
    where?: ts_mesuretestetalonWhereInput
    /**
     * Limit how many ts_mesuretestetalons to delete.
     */
    limit?: number
  }

  /**
   * ts_mesuretestetalon without action
   */
  export type ts_mesuretestetalonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_mesuretestetalon
     */
    select?: ts_mesuretestetalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_mesuretestetalon
     */
    omit?: ts_mesuretestetalonOmit<ExtArgs> | null
  }


  /**
   * Model ts_modedegrade
   */

  export type AggregateTs_modedegrade = {
    _count: Ts_modedegradeCountAggregateOutputType | null
    _avg: Ts_modedegradeAvgAggregateOutputType | null
    _sum: Ts_modedegradeSumAggregateOutputType | null
    _min: Ts_modedegradeMinAggregateOutputType | null
    _max: Ts_modedegradeMaxAggregateOutputType | null
  }

  export type Ts_modedegradeAvgAggregateOutputType = {
    IdModeDegrade: number | null
    IdUtilisateur: number | null
  }

  export type Ts_modedegradeSumAggregateOutputType = {
    IdModeDegrade: number | null
    IdUtilisateur: number | null
  }

  export type Ts_modedegradeMinAggregateOutputType = {
    IdModeDegrade: number | null
    IdUtilisateur: number | null
    DateHeureCreation: Date | null
    RequeteSQL: string | null
    RequeteArchivee: boolean | null
    DateHeureArchive: Date | null
  }

  export type Ts_modedegradeMaxAggregateOutputType = {
    IdModeDegrade: number | null
    IdUtilisateur: number | null
    DateHeureCreation: Date | null
    RequeteSQL: string | null
    RequeteArchivee: boolean | null
    DateHeureArchive: Date | null
  }

  export type Ts_modedegradeCountAggregateOutputType = {
    IdModeDegrade: number
    IdUtilisateur: number
    DateHeureCreation: number
    RequeteSQL: number
    RequeteArchivee: number
    DateHeureArchive: number
    _all: number
  }


  export type Ts_modedegradeAvgAggregateInputType = {
    IdModeDegrade?: true
    IdUtilisateur?: true
  }

  export type Ts_modedegradeSumAggregateInputType = {
    IdModeDegrade?: true
    IdUtilisateur?: true
  }

  export type Ts_modedegradeMinAggregateInputType = {
    IdModeDegrade?: true
    IdUtilisateur?: true
    DateHeureCreation?: true
    RequeteSQL?: true
    RequeteArchivee?: true
    DateHeureArchive?: true
  }

  export type Ts_modedegradeMaxAggregateInputType = {
    IdModeDegrade?: true
    IdUtilisateur?: true
    DateHeureCreation?: true
    RequeteSQL?: true
    RequeteArchivee?: true
    DateHeureArchive?: true
  }

  export type Ts_modedegradeCountAggregateInputType = {
    IdModeDegrade?: true
    IdUtilisateur?: true
    DateHeureCreation?: true
    RequeteSQL?: true
    RequeteArchivee?: true
    DateHeureArchive?: true
    _all?: true
  }

  export type Ts_modedegradeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_modedegrade to aggregate.
     */
    where?: ts_modedegradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_modedegrades to fetch.
     */
    orderBy?: ts_modedegradeOrderByWithRelationInput | ts_modedegradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_modedegradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_modedegrades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_modedegrades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_modedegrades
    **/
    _count?: true | Ts_modedegradeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Ts_modedegradeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Ts_modedegradeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_modedegradeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_modedegradeMaxAggregateInputType
  }

  export type GetTs_modedegradeAggregateType<T extends Ts_modedegradeAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_modedegrade]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_modedegrade[P]>
      : GetScalarType<T[P], AggregateTs_modedegrade[P]>
  }




  export type ts_modedegradeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_modedegradeWhereInput
    orderBy?: ts_modedegradeOrderByWithAggregationInput | ts_modedegradeOrderByWithAggregationInput[]
    by: Ts_modedegradeScalarFieldEnum[] | Ts_modedegradeScalarFieldEnum
    having?: ts_modedegradeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_modedegradeCountAggregateInputType | true
    _avg?: Ts_modedegradeAvgAggregateInputType
    _sum?: Ts_modedegradeSumAggregateInputType
    _min?: Ts_modedegradeMinAggregateInputType
    _max?: Ts_modedegradeMaxAggregateInputType
  }

  export type Ts_modedegradeGroupByOutputType = {
    IdModeDegrade: number
    IdUtilisateur: number | null
    DateHeureCreation: Date | null
    RequeteSQL: string | null
    RequeteArchivee: boolean
    DateHeureArchive: Date | null
    _count: Ts_modedegradeCountAggregateOutputType | null
    _avg: Ts_modedegradeAvgAggregateOutputType | null
    _sum: Ts_modedegradeSumAggregateOutputType | null
    _min: Ts_modedegradeMinAggregateOutputType | null
    _max: Ts_modedegradeMaxAggregateOutputType | null
  }

  type GetTs_modedegradeGroupByPayload<T extends ts_modedegradeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_modedegradeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_modedegradeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_modedegradeGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_modedegradeGroupByOutputType[P]>
        }
      >
    >


  export type ts_modedegradeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    IdModeDegrade?: boolean
    IdUtilisateur?: boolean
    DateHeureCreation?: boolean
    RequeteSQL?: boolean
    RequeteArchivee?: boolean
    DateHeureArchive?: boolean
  }, ExtArgs["result"]["ts_modedegrade"]>



  export type ts_modedegradeSelectScalar = {
    IdModeDegrade?: boolean
    IdUtilisateur?: boolean
    DateHeureCreation?: boolean
    RequeteSQL?: boolean
    RequeteArchivee?: boolean
    DateHeureArchive?: boolean
  }

  export type ts_modedegradeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"IdModeDegrade" | "IdUtilisateur" | "DateHeureCreation" | "RequeteSQL" | "RequeteArchivee" | "DateHeureArchive", ExtArgs["result"]["ts_modedegrade"]>

  export type $ts_modedegradePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_modedegrade"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      IdModeDegrade: number
      IdUtilisateur: number | null
      DateHeureCreation: Date | null
      RequeteSQL: string | null
      RequeteArchivee: boolean
      DateHeureArchive: Date | null
    }, ExtArgs["result"]["ts_modedegrade"]>
    composites: {}
  }

  type ts_modedegradeGetPayload<S extends boolean | null | undefined | ts_modedegradeDefaultArgs> = $Result.GetResult<Prisma.$ts_modedegradePayload, S>

  type ts_modedegradeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_modedegradeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_modedegradeCountAggregateInputType | true
    }

  export interface ts_modedegradeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_modedegrade'], meta: { name: 'ts_modedegrade' } }
    /**
     * Find zero or one Ts_modedegrade that matches the filter.
     * @param {ts_modedegradeFindUniqueArgs} args - Arguments to find a Ts_modedegrade
     * @example
     * // Get one Ts_modedegrade
     * const ts_modedegrade = await prisma.ts_modedegrade.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_modedegradeFindUniqueArgs>(args: SelectSubset<T, ts_modedegradeFindUniqueArgs<ExtArgs>>): Prisma__ts_modedegradeClient<$Result.GetResult<Prisma.$ts_modedegradePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_modedegrade that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_modedegradeFindUniqueOrThrowArgs} args - Arguments to find a Ts_modedegrade
     * @example
     * // Get one Ts_modedegrade
     * const ts_modedegrade = await prisma.ts_modedegrade.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_modedegradeFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_modedegradeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_modedegradeClient<$Result.GetResult<Prisma.$ts_modedegradePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_modedegrade that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_modedegradeFindFirstArgs} args - Arguments to find a Ts_modedegrade
     * @example
     * // Get one Ts_modedegrade
     * const ts_modedegrade = await prisma.ts_modedegrade.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_modedegradeFindFirstArgs>(args?: SelectSubset<T, ts_modedegradeFindFirstArgs<ExtArgs>>): Prisma__ts_modedegradeClient<$Result.GetResult<Prisma.$ts_modedegradePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_modedegrade that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_modedegradeFindFirstOrThrowArgs} args - Arguments to find a Ts_modedegrade
     * @example
     * // Get one Ts_modedegrade
     * const ts_modedegrade = await prisma.ts_modedegrade.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_modedegradeFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_modedegradeFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_modedegradeClient<$Result.GetResult<Prisma.$ts_modedegradePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_modedegrades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_modedegradeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_modedegrades
     * const ts_modedegrades = await prisma.ts_modedegrade.findMany()
     * 
     * // Get first 10 Ts_modedegrades
     * const ts_modedegrades = await prisma.ts_modedegrade.findMany({ take: 10 })
     * 
     * // Only select the `IdModeDegrade`
     * const ts_modedegradeWithIdModeDegradeOnly = await prisma.ts_modedegrade.findMany({ select: { IdModeDegrade: true } })
     * 
     */
    findMany<T extends ts_modedegradeFindManyArgs>(args?: SelectSubset<T, ts_modedegradeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_modedegradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_modedegrade.
     * @param {ts_modedegradeCreateArgs} args - Arguments to create a Ts_modedegrade.
     * @example
     * // Create one Ts_modedegrade
     * const Ts_modedegrade = await prisma.ts_modedegrade.create({
     *   data: {
     *     // ... data to create a Ts_modedegrade
     *   }
     * })
     * 
     */
    create<T extends ts_modedegradeCreateArgs>(args: SelectSubset<T, ts_modedegradeCreateArgs<ExtArgs>>): Prisma__ts_modedegradeClient<$Result.GetResult<Prisma.$ts_modedegradePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_modedegrades.
     * @param {ts_modedegradeCreateManyArgs} args - Arguments to create many Ts_modedegrades.
     * @example
     * // Create many Ts_modedegrades
     * const ts_modedegrade = await prisma.ts_modedegrade.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_modedegradeCreateManyArgs>(args?: SelectSubset<T, ts_modedegradeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_modedegrade.
     * @param {ts_modedegradeDeleteArgs} args - Arguments to delete one Ts_modedegrade.
     * @example
     * // Delete one Ts_modedegrade
     * const Ts_modedegrade = await prisma.ts_modedegrade.delete({
     *   where: {
     *     // ... filter to delete one Ts_modedegrade
     *   }
     * })
     * 
     */
    delete<T extends ts_modedegradeDeleteArgs>(args: SelectSubset<T, ts_modedegradeDeleteArgs<ExtArgs>>): Prisma__ts_modedegradeClient<$Result.GetResult<Prisma.$ts_modedegradePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_modedegrade.
     * @param {ts_modedegradeUpdateArgs} args - Arguments to update one Ts_modedegrade.
     * @example
     * // Update one Ts_modedegrade
     * const ts_modedegrade = await prisma.ts_modedegrade.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_modedegradeUpdateArgs>(args: SelectSubset<T, ts_modedegradeUpdateArgs<ExtArgs>>): Prisma__ts_modedegradeClient<$Result.GetResult<Prisma.$ts_modedegradePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_modedegrades.
     * @param {ts_modedegradeDeleteManyArgs} args - Arguments to filter Ts_modedegrades to delete.
     * @example
     * // Delete a few Ts_modedegrades
     * const { count } = await prisma.ts_modedegrade.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_modedegradeDeleteManyArgs>(args?: SelectSubset<T, ts_modedegradeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_modedegrades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_modedegradeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_modedegrades
     * const ts_modedegrade = await prisma.ts_modedegrade.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_modedegradeUpdateManyArgs>(args: SelectSubset<T, ts_modedegradeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_modedegrade.
     * @param {ts_modedegradeUpsertArgs} args - Arguments to update or create a Ts_modedegrade.
     * @example
     * // Update or create a Ts_modedegrade
     * const ts_modedegrade = await prisma.ts_modedegrade.upsert({
     *   create: {
     *     // ... data to create a Ts_modedegrade
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_modedegrade we want to update
     *   }
     * })
     */
    upsert<T extends ts_modedegradeUpsertArgs>(args: SelectSubset<T, ts_modedegradeUpsertArgs<ExtArgs>>): Prisma__ts_modedegradeClient<$Result.GetResult<Prisma.$ts_modedegradePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_modedegrades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_modedegradeCountArgs} args - Arguments to filter Ts_modedegrades to count.
     * @example
     * // Count the number of Ts_modedegrades
     * const count = await prisma.ts_modedegrade.count({
     *   where: {
     *     // ... the filter for the Ts_modedegrades we want to count
     *   }
     * })
    **/
    count<T extends ts_modedegradeCountArgs>(
      args?: Subset<T, ts_modedegradeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_modedegradeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_modedegrade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_modedegradeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_modedegradeAggregateArgs>(args: Subset<T, Ts_modedegradeAggregateArgs>): Prisma.PrismaPromise<GetTs_modedegradeAggregateType<T>>

    /**
     * Group by Ts_modedegrade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_modedegradeGroupByArgs} args - Group by arguments.
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
      T extends ts_modedegradeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_modedegradeGroupByArgs['orderBy'] }
        : { orderBy?: ts_modedegradeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_modedegradeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_modedegradeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_modedegrade model
   */
  readonly fields: ts_modedegradeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_modedegrade.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_modedegradeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_modedegrade model
   */
  interface ts_modedegradeFieldRefs {
    readonly IdModeDegrade: FieldRef<"ts_modedegrade", 'Int'>
    readonly IdUtilisateur: FieldRef<"ts_modedegrade", 'Int'>
    readonly DateHeureCreation: FieldRef<"ts_modedegrade", 'DateTime'>
    readonly RequeteSQL: FieldRef<"ts_modedegrade", 'String'>
    readonly RequeteArchivee: FieldRef<"ts_modedegrade", 'Boolean'>
    readonly DateHeureArchive: FieldRef<"ts_modedegrade", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ts_modedegrade findUnique
   */
  export type ts_modedegradeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
    /**
     * Filter, which ts_modedegrade to fetch.
     */
    where: ts_modedegradeWhereUniqueInput
  }

  /**
   * ts_modedegrade findUniqueOrThrow
   */
  export type ts_modedegradeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
    /**
     * Filter, which ts_modedegrade to fetch.
     */
    where: ts_modedegradeWhereUniqueInput
  }

  /**
   * ts_modedegrade findFirst
   */
  export type ts_modedegradeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
    /**
     * Filter, which ts_modedegrade to fetch.
     */
    where?: ts_modedegradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_modedegrades to fetch.
     */
    orderBy?: ts_modedegradeOrderByWithRelationInput | ts_modedegradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_modedegrades.
     */
    cursor?: ts_modedegradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_modedegrades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_modedegrades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_modedegrades.
     */
    distinct?: Ts_modedegradeScalarFieldEnum | Ts_modedegradeScalarFieldEnum[]
  }

  /**
   * ts_modedegrade findFirstOrThrow
   */
  export type ts_modedegradeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
    /**
     * Filter, which ts_modedegrade to fetch.
     */
    where?: ts_modedegradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_modedegrades to fetch.
     */
    orderBy?: ts_modedegradeOrderByWithRelationInput | ts_modedegradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_modedegrades.
     */
    cursor?: ts_modedegradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_modedegrades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_modedegrades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_modedegrades.
     */
    distinct?: Ts_modedegradeScalarFieldEnum | Ts_modedegradeScalarFieldEnum[]
  }

  /**
   * ts_modedegrade findMany
   */
  export type ts_modedegradeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
    /**
     * Filter, which ts_modedegrades to fetch.
     */
    where?: ts_modedegradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_modedegrades to fetch.
     */
    orderBy?: ts_modedegradeOrderByWithRelationInput | ts_modedegradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_modedegrades.
     */
    cursor?: ts_modedegradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_modedegrades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_modedegrades.
     */
    skip?: number
    distinct?: Ts_modedegradeScalarFieldEnum | Ts_modedegradeScalarFieldEnum[]
  }

  /**
   * ts_modedegrade create
   */
  export type ts_modedegradeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_modedegrade.
     */
    data?: XOR<ts_modedegradeCreateInput, ts_modedegradeUncheckedCreateInput>
  }

  /**
   * ts_modedegrade createMany
   */
  export type ts_modedegradeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_modedegrades.
     */
    data: ts_modedegradeCreateManyInput | ts_modedegradeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_modedegrade update
   */
  export type ts_modedegradeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_modedegrade.
     */
    data: XOR<ts_modedegradeUpdateInput, ts_modedegradeUncheckedUpdateInput>
    /**
     * Choose, which ts_modedegrade to update.
     */
    where: ts_modedegradeWhereUniqueInput
  }

  /**
   * ts_modedegrade updateMany
   */
  export type ts_modedegradeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_modedegrades.
     */
    data: XOR<ts_modedegradeUpdateManyMutationInput, ts_modedegradeUncheckedUpdateManyInput>
    /**
     * Filter which ts_modedegrades to update
     */
    where?: ts_modedegradeWhereInput
    /**
     * Limit how many ts_modedegrades to update.
     */
    limit?: number
  }

  /**
   * ts_modedegrade upsert
   */
  export type ts_modedegradeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_modedegrade to update in case it exists.
     */
    where: ts_modedegradeWhereUniqueInput
    /**
     * In case the ts_modedegrade found by the `where` argument doesn't exist, create a new ts_modedegrade with this data.
     */
    create: XOR<ts_modedegradeCreateInput, ts_modedegradeUncheckedCreateInput>
    /**
     * In case the ts_modedegrade was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_modedegradeUpdateInput, ts_modedegradeUncheckedUpdateInput>
  }

  /**
   * ts_modedegrade delete
   */
  export type ts_modedegradeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
    /**
     * Filter which ts_modedegrade to delete.
     */
    where: ts_modedegradeWhereUniqueInput
  }

  /**
   * ts_modedegrade deleteMany
   */
  export type ts_modedegradeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_modedegrades to delete
     */
    where?: ts_modedegradeWhereInput
    /**
     * Limit how many ts_modedegrades to delete.
     */
    limit?: number
  }

  /**
   * ts_modedegrade without action
   */
  export type ts_modedegradeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_modedegrade
     */
    select?: ts_modedegradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_modedegrade
     */
    omit?: ts_modedegradeOmit<ExtArgs> | null
  }


  /**
   * Model ts_parametre
   */

  export type AggregateTs_parametre = {
    _count: Ts_parametreCountAggregateOutputType | null
    _min: Ts_parametreMinAggregateOutputType | null
    _max: Ts_parametreMaxAggregateOutputType | null
  }

  export type Ts_parametreMinAggregateOutputType = {
    CleParametre: string | null
    ValeurParametre: string | null
    GroupeParametre: string | null
    CommentaireParametre: string | null
  }

  export type Ts_parametreMaxAggregateOutputType = {
    CleParametre: string | null
    ValeurParametre: string | null
    GroupeParametre: string | null
    CommentaireParametre: string | null
  }

  export type Ts_parametreCountAggregateOutputType = {
    CleParametre: number
    ValeurParametre: number
    GroupeParametre: number
    CommentaireParametre: number
    _all: number
  }


  export type Ts_parametreMinAggregateInputType = {
    CleParametre?: true
    ValeurParametre?: true
    GroupeParametre?: true
    CommentaireParametre?: true
  }

  export type Ts_parametreMaxAggregateInputType = {
    CleParametre?: true
    ValeurParametre?: true
    GroupeParametre?: true
    CommentaireParametre?: true
  }

  export type Ts_parametreCountAggregateInputType = {
    CleParametre?: true
    ValeurParametre?: true
    GroupeParametre?: true
    CommentaireParametre?: true
    _all?: true
  }

  export type Ts_parametreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_parametre to aggregate.
     */
    where?: ts_parametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_parametres to fetch.
     */
    orderBy?: ts_parametreOrderByWithRelationInput | ts_parametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ts_parametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ts_parametres
    **/
    _count?: true | Ts_parametreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Ts_parametreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Ts_parametreMaxAggregateInputType
  }

  export type GetTs_parametreAggregateType<T extends Ts_parametreAggregateArgs> = {
        [P in keyof T & keyof AggregateTs_parametre]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTs_parametre[P]>
      : GetScalarType<T[P], AggregateTs_parametre[P]>
  }




  export type ts_parametreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ts_parametreWhereInput
    orderBy?: ts_parametreOrderByWithAggregationInput | ts_parametreOrderByWithAggregationInput[]
    by: Ts_parametreScalarFieldEnum[] | Ts_parametreScalarFieldEnum
    having?: ts_parametreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Ts_parametreCountAggregateInputType | true
    _min?: Ts_parametreMinAggregateInputType
    _max?: Ts_parametreMaxAggregateInputType
  }

  export type Ts_parametreGroupByOutputType = {
    CleParametre: string
    ValeurParametre: string | null
    GroupeParametre: string | null
    CommentaireParametre: string | null
    _count: Ts_parametreCountAggregateOutputType | null
    _min: Ts_parametreMinAggregateOutputType | null
    _max: Ts_parametreMaxAggregateOutputType | null
  }

  type GetTs_parametreGroupByPayload<T extends ts_parametreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Ts_parametreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Ts_parametreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Ts_parametreGroupByOutputType[P]>
            : GetScalarType<T[P], Ts_parametreGroupByOutputType[P]>
        }
      >
    >


  export type ts_parametreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    CleParametre?: boolean
    ValeurParametre?: boolean
    GroupeParametre?: boolean
    CommentaireParametre?: boolean
  }, ExtArgs["result"]["ts_parametre"]>



  export type ts_parametreSelectScalar = {
    CleParametre?: boolean
    ValeurParametre?: boolean
    GroupeParametre?: boolean
    CommentaireParametre?: boolean
  }

  export type ts_parametreOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"CleParametre" | "ValeurParametre" | "GroupeParametre" | "CommentaireParametre", ExtArgs["result"]["ts_parametre"]>

  export type $ts_parametrePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ts_parametre"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      CleParametre: string
      ValeurParametre: string | null
      GroupeParametre: string | null
      CommentaireParametre: string | null
    }, ExtArgs["result"]["ts_parametre"]>
    composites: {}
  }

  type ts_parametreGetPayload<S extends boolean | null | undefined | ts_parametreDefaultArgs> = $Result.GetResult<Prisma.$ts_parametrePayload, S>

  type ts_parametreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ts_parametreFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Ts_parametreCountAggregateInputType | true
    }

  export interface ts_parametreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ts_parametre'], meta: { name: 'ts_parametre' } }
    /**
     * Find zero or one Ts_parametre that matches the filter.
     * @param {ts_parametreFindUniqueArgs} args - Arguments to find a Ts_parametre
     * @example
     * // Get one Ts_parametre
     * const ts_parametre = await prisma.ts_parametre.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ts_parametreFindUniqueArgs>(args: SelectSubset<T, ts_parametreFindUniqueArgs<ExtArgs>>): Prisma__ts_parametreClient<$Result.GetResult<Prisma.$ts_parametrePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ts_parametre that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ts_parametreFindUniqueOrThrowArgs} args - Arguments to find a Ts_parametre
     * @example
     * // Get one Ts_parametre
     * const ts_parametre = await prisma.ts_parametre.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ts_parametreFindUniqueOrThrowArgs>(args: SelectSubset<T, ts_parametreFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ts_parametreClient<$Result.GetResult<Prisma.$ts_parametrePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_parametre that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_parametreFindFirstArgs} args - Arguments to find a Ts_parametre
     * @example
     * // Get one Ts_parametre
     * const ts_parametre = await prisma.ts_parametre.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ts_parametreFindFirstArgs>(args?: SelectSubset<T, ts_parametreFindFirstArgs<ExtArgs>>): Prisma__ts_parametreClient<$Result.GetResult<Prisma.$ts_parametrePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ts_parametre that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_parametreFindFirstOrThrowArgs} args - Arguments to find a Ts_parametre
     * @example
     * // Get one Ts_parametre
     * const ts_parametre = await prisma.ts_parametre.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ts_parametreFindFirstOrThrowArgs>(args?: SelectSubset<T, ts_parametreFindFirstOrThrowArgs<ExtArgs>>): Prisma__ts_parametreClient<$Result.GetResult<Prisma.$ts_parametrePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Ts_parametres that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_parametreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Ts_parametres
     * const ts_parametres = await prisma.ts_parametre.findMany()
     * 
     * // Get first 10 Ts_parametres
     * const ts_parametres = await prisma.ts_parametre.findMany({ take: 10 })
     * 
     * // Only select the `CleParametre`
     * const ts_parametreWithCleParametreOnly = await prisma.ts_parametre.findMany({ select: { CleParametre: true } })
     * 
     */
    findMany<T extends ts_parametreFindManyArgs>(args?: SelectSubset<T, ts_parametreFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ts_parametrePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ts_parametre.
     * @param {ts_parametreCreateArgs} args - Arguments to create a Ts_parametre.
     * @example
     * // Create one Ts_parametre
     * const Ts_parametre = await prisma.ts_parametre.create({
     *   data: {
     *     // ... data to create a Ts_parametre
     *   }
     * })
     * 
     */
    create<T extends ts_parametreCreateArgs>(args: SelectSubset<T, ts_parametreCreateArgs<ExtArgs>>): Prisma__ts_parametreClient<$Result.GetResult<Prisma.$ts_parametrePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Ts_parametres.
     * @param {ts_parametreCreateManyArgs} args - Arguments to create many Ts_parametres.
     * @example
     * // Create many Ts_parametres
     * const ts_parametre = await prisma.ts_parametre.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ts_parametreCreateManyArgs>(args?: SelectSubset<T, ts_parametreCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Ts_parametre.
     * @param {ts_parametreDeleteArgs} args - Arguments to delete one Ts_parametre.
     * @example
     * // Delete one Ts_parametre
     * const Ts_parametre = await prisma.ts_parametre.delete({
     *   where: {
     *     // ... filter to delete one Ts_parametre
     *   }
     * })
     * 
     */
    delete<T extends ts_parametreDeleteArgs>(args: SelectSubset<T, ts_parametreDeleteArgs<ExtArgs>>): Prisma__ts_parametreClient<$Result.GetResult<Prisma.$ts_parametrePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ts_parametre.
     * @param {ts_parametreUpdateArgs} args - Arguments to update one Ts_parametre.
     * @example
     * // Update one Ts_parametre
     * const ts_parametre = await prisma.ts_parametre.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ts_parametreUpdateArgs>(args: SelectSubset<T, ts_parametreUpdateArgs<ExtArgs>>): Prisma__ts_parametreClient<$Result.GetResult<Prisma.$ts_parametrePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Ts_parametres.
     * @param {ts_parametreDeleteManyArgs} args - Arguments to filter Ts_parametres to delete.
     * @example
     * // Delete a few Ts_parametres
     * const { count } = await prisma.ts_parametre.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ts_parametreDeleteManyArgs>(args?: SelectSubset<T, ts_parametreDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Ts_parametres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_parametreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Ts_parametres
     * const ts_parametre = await prisma.ts_parametre.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ts_parametreUpdateManyArgs>(args: SelectSubset<T, ts_parametreUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Ts_parametre.
     * @param {ts_parametreUpsertArgs} args - Arguments to update or create a Ts_parametre.
     * @example
     * // Update or create a Ts_parametre
     * const ts_parametre = await prisma.ts_parametre.upsert({
     *   create: {
     *     // ... data to create a Ts_parametre
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ts_parametre we want to update
     *   }
     * })
     */
    upsert<T extends ts_parametreUpsertArgs>(args: SelectSubset<T, ts_parametreUpsertArgs<ExtArgs>>): Prisma__ts_parametreClient<$Result.GetResult<Prisma.$ts_parametrePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Ts_parametres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_parametreCountArgs} args - Arguments to filter Ts_parametres to count.
     * @example
     * // Count the number of Ts_parametres
     * const count = await prisma.ts_parametre.count({
     *   where: {
     *     // ... the filter for the Ts_parametres we want to count
     *   }
     * })
    **/
    count<T extends ts_parametreCountArgs>(
      args?: Subset<T, ts_parametreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Ts_parametreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ts_parametre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Ts_parametreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Ts_parametreAggregateArgs>(args: Subset<T, Ts_parametreAggregateArgs>): Prisma.PrismaPromise<GetTs_parametreAggregateType<T>>

    /**
     * Group by Ts_parametre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ts_parametreGroupByArgs} args - Group by arguments.
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
      T extends ts_parametreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ts_parametreGroupByArgs['orderBy'] }
        : { orderBy?: ts_parametreGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ts_parametreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTs_parametreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ts_parametre model
   */
  readonly fields: ts_parametreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ts_parametre.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ts_parametreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
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
   * Fields of the ts_parametre model
   */
  interface ts_parametreFieldRefs {
    readonly CleParametre: FieldRef<"ts_parametre", 'String'>
    readonly ValeurParametre: FieldRef<"ts_parametre", 'String'>
    readonly GroupeParametre: FieldRef<"ts_parametre", 'String'>
    readonly CommentaireParametre: FieldRef<"ts_parametre", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ts_parametre findUnique
   */
  export type ts_parametreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
    /**
     * Filter, which ts_parametre to fetch.
     */
    where: ts_parametreWhereUniqueInput
  }

  /**
   * ts_parametre findUniqueOrThrow
   */
  export type ts_parametreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
    /**
     * Filter, which ts_parametre to fetch.
     */
    where: ts_parametreWhereUniqueInput
  }

  /**
   * ts_parametre findFirst
   */
  export type ts_parametreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
    /**
     * Filter, which ts_parametre to fetch.
     */
    where?: ts_parametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_parametres to fetch.
     */
    orderBy?: ts_parametreOrderByWithRelationInput | ts_parametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_parametres.
     */
    cursor?: ts_parametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_parametres.
     */
    distinct?: Ts_parametreScalarFieldEnum | Ts_parametreScalarFieldEnum[]
  }

  /**
   * ts_parametre findFirstOrThrow
   */
  export type ts_parametreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
    /**
     * Filter, which ts_parametre to fetch.
     */
    where?: ts_parametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_parametres to fetch.
     */
    orderBy?: ts_parametreOrderByWithRelationInput | ts_parametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ts_parametres.
     */
    cursor?: ts_parametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ts_parametres.
     */
    distinct?: Ts_parametreScalarFieldEnum | Ts_parametreScalarFieldEnum[]
  }

  /**
   * ts_parametre findMany
   */
  export type ts_parametreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
    /**
     * Filter, which ts_parametres to fetch.
     */
    where?: ts_parametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ts_parametres to fetch.
     */
    orderBy?: ts_parametreOrderByWithRelationInput | ts_parametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ts_parametres.
     */
    cursor?: ts_parametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ts_parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ts_parametres.
     */
    skip?: number
    distinct?: Ts_parametreScalarFieldEnum | Ts_parametreScalarFieldEnum[]
  }

  /**
   * ts_parametre create
   */
  export type ts_parametreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
    /**
     * The data needed to create a ts_parametre.
     */
    data?: XOR<ts_parametreCreateInput, ts_parametreUncheckedCreateInput>
  }

  /**
   * ts_parametre createMany
   */
  export type ts_parametreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ts_parametres.
     */
    data: ts_parametreCreateManyInput | ts_parametreCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ts_parametre update
   */
  export type ts_parametreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
    /**
     * The data needed to update a ts_parametre.
     */
    data: XOR<ts_parametreUpdateInput, ts_parametreUncheckedUpdateInput>
    /**
     * Choose, which ts_parametre to update.
     */
    where: ts_parametreWhereUniqueInput
  }

  /**
   * ts_parametre updateMany
   */
  export type ts_parametreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ts_parametres.
     */
    data: XOR<ts_parametreUpdateManyMutationInput, ts_parametreUncheckedUpdateManyInput>
    /**
     * Filter which ts_parametres to update
     */
    where?: ts_parametreWhereInput
    /**
     * Limit how many ts_parametres to update.
     */
    limit?: number
  }

  /**
   * ts_parametre upsert
   */
  export type ts_parametreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
    /**
     * The filter to search for the ts_parametre to update in case it exists.
     */
    where: ts_parametreWhereUniqueInput
    /**
     * In case the ts_parametre found by the `where` argument doesn't exist, create a new ts_parametre with this data.
     */
    create: XOR<ts_parametreCreateInput, ts_parametreUncheckedCreateInput>
    /**
     * In case the ts_parametre was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ts_parametreUpdateInput, ts_parametreUncheckedUpdateInput>
  }

  /**
   * ts_parametre delete
   */
  export type ts_parametreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
    /**
     * Filter which ts_parametre to delete.
     */
    where: ts_parametreWhereUniqueInput
  }

  /**
   * ts_parametre deleteMany
   */
  export type ts_parametreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ts_parametres to delete
     */
    where?: ts_parametreWhereInput
    /**
     * Limit how many ts_parametres to delete.
     */
    limit?: number
  }

  /**
   * ts_parametre without action
   */
  export type ts_parametreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ts_parametre
     */
    select?: ts_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ts_parametre
     */
    omit?: ts_parametreOmit<ExtArgs> | null
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


  export const Ts_compteur_idtableScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    NomTable: 'NomTable',
    CompteurID: 'CompteurID'
  };

  export type Ts_compteur_idtableScalarFieldEnum = (typeof Ts_compteur_idtableScalarFieldEnum)[keyof typeof Ts_compteur_idtableScalarFieldEnum]


  export const Ts_graphiqueScalarFieldEnum: {
    IdGraphique: 'IdGraphique',
    DateHeureMesure: 'DateHeureMesure',
    Valeur: 'Valeur',
    Resistance: 'Resistance',
    Nb_decimal: 'Nb_decimal',
    Consigne: 'Consigne',
    Consigne_Sup: 'Consigne_Sup',
    Consigne_Inf: 'Consigne_Inf',
    Unite: 'Unite',
    SondeNumeroSerie: 'SondeNumeroSerie',
    IdLieu: 'IdLieu',
    ValeurNull: 'ValeurNull',
    Frequence: 'Frequence',
    Etat_Alarme: 'Etat_Alarme',
    Consigne_Inf_PreAlarme: 'Consigne_Inf_PreAlarme',
    Consigne_Sup_PreAlarme: 'Consigne_Sup_PreAlarme'
  };

  export type Ts_graphiqueScalarFieldEnum = (typeof Ts_graphiqueScalarFieldEnum)[keyof typeof Ts_graphiqueScalarFieldEnum]


  export const Ts_journalScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdJournal: 'IdJournal',
    CodeJournal: 'CodeJournal',
    Commentaire: 'Commentaire',
    NomUtilisateur: 'NomUtilisateur',
    ProfilUtilisateur: 'ProfilUtilisateur',
    DateHeureJournal: 'DateHeureJournal',
    IdLieu: 'IdLieu',
    CommentaireUtilisateur: 'CommentaireUtilisateur'
  };

  export type Ts_journalScalarFieldEnum = (typeof Ts_journalScalarFieldEnum)[keyof typeof Ts_journalScalarFieldEnum]


  export const Ts_journal_codeScalarFieldEnum: {
    CodeJournal: 'CodeJournal',
    Commentaire: 'Commentaire'
  };

  export type Ts_journal_codeScalarFieldEnum = (typeof Ts_journal_codeScalarFieldEnum)[keyof typeof Ts_journal_codeScalarFieldEnum]


  export const Ts_journalhistoScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdJournal: 'IdJournal',
    CodeJournal: 'CodeJournal',
    Commentaire: 'Commentaire',
    NomUtilisateur: 'NomUtilisateur',
    ProfilUtilisateur: 'ProfilUtilisateur',
    DateHeureJournal: 'DateHeureJournal',
    IdLieu: 'IdLieu',
    CommentaireUtilisateur: 'CommentaireUtilisateur'
  };

  export type Ts_journalhistoScalarFieldEnum = (typeof Ts_journalhistoScalarFieldEnum)[keyof typeof Ts_journalhistoScalarFieldEnum]


  export const Ts_logmesuresScalarFieldEnum: {
    IdLogMesures: 'IdLogMesures',
    IdReception: 'IdReception',
    DateHeureMesure: 'DateHeureMesure',
    Valeur: 'Valeur',
    bEstHorsConsignes: 'bEstHorsConsignes',
    bEstEnAlarme: 'bEstEnAlarme',
    bMarqueur: 'bMarqueur',
    Details: 'Details'
  };

  export type Ts_logmesuresScalarFieldEnum = (typeof Ts_logmesuresScalarFieldEnum)[keyof typeof Ts_logmesuresScalarFieldEnum]


  export const Ts_mesureScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdMesure: 'IdMesure',
    DateHeureMesure: 'DateHeureMesure',
    Valeur: 'Valeur',
    Resistance: 'Resistance',
    Nb_decimal: 'Nb_decimal',
    Consigne: 'Consigne',
    Consigne_Sup: 'Consigne_Sup',
    Consigne_Inf: 'Consigne_Inf',
    Unite: 'Unite',
    SondeNumeroSerie: 'SondeNumeroSerie',
    IdLieu: 'IdLieu',
    ValeurNull: 'ValeurNull',
    Frequence: 'Frequence',
    Etat_Alarme: 'Etat_Alarme',
    Consigne_Inf_PreAlarme: 'Consigne_Inf_PreAlarme',
    Consigne_Sup_PreAlarme: 'Consigne_Sup_PreAlarme',
    Moyenne: 'Moyenne'
  };

  export type Ts_mesureScalarFieldEnum = (typeof Ts_mesureScalarFieldEnum)[keyof typeof Ts_mesureScalarFieldEnum]


  export const Ts_mesurecalibrageScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdMesureCalibrage: 'IdMesureCalibrage',
    Valeur: 'Valeur',
    Resistance: 'Resistance',
    SondeNumeroSerie: 'SondeNumeroSerie',
    ValeurNull: 'ValeurNull',
    DateHeure: 'DateHeure'
  };

  export type Ts_mesurecalibrageScalarFieldEnum = (typeof Ts_mesurecalibrageScalarFieldEnum)[keyof typeof Ts_mesurecalibrageScalarFieldEnum]


  export const Ts_mesurecalibrageetalonScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdMesureCalibrageEtalon: 'IdMesureCalibrageEtalon',
    Valeur: 'Valeur',
    Resistance: 'Resistance',
    EtalonNumeroSerie: 'EtalonNumeroSerie',
    ValeurNull: 'ValeurNull',
    DateHeure: 'DateHeure'
  };

  export type Ts_mesurecalibrageetalonScalarFieldEnum = (typeof Ts_mesurecalibrageetalonScalarFieldEnum)[keyof typeof Ts_mesurecalibrageetalonScalarFieldEnum]


  export const Ts_mesureetalonScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdMesureEtalon: 'IdMesureEtalon',
    Resistance: 'Resistance',
    EtalonNumeroSerie: 'EtalonNumeroSerie',
    ValeurNull: 'ValeurNull',
    DateHeure: 'DateHeure',
    Message_Erreur: 'Message_Erreur'
  };

  export type Ts_mesureetalonScalarFieldEnum = (typeof Ts_mesureetalonScalarFieldEnum)[keyof typeof Ts_mesureetalonScalarFieldEnum]


  export const Ts_mesureetalonnageScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdMesureEtalonnage: 'IdMesureEtalonnage',
    SondeNumeroserie: 'SondeNumeroserie',
    NumeroOrdre: 'NumeroOrdre',
    MesureSonde: 'MesureSonde',
    MesureEtalon: 'MesureEtalon',
    DateHeure: 'DateHeure'
  };

  export type Ts_mesureetalonnageScalarFieldEnum = (typeof Ts_mesureetalonnageScalarFieldEnum)[keyof typeof Ts_mesureetalonnageScalarFieldEnum]


  export const Ts_mesurehistoScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdMesure: 'IdMesure',
    DateHeureMesure: 'DateHeureMesure',
    Valeur: 'Valeur',
    Resistance: 'Resistance',
    Nb_decimal: 'Nb_decimal',
    Consigne: 'Consigne',
    Consigne_Sup: 'Consigne_Sup',
    Consigne_Inf: 'Consigne_Inf',
    Unite: 'Unite',
    SondeNumeroSerie: 'SondeNumeroSerie',
    IdLieu: 'IdLieu',
    ValeurNull: 'ValeurNull',
    Frequence: 'Frequence',
    Etat_Alarme: 'Etat_Alarme',
    Consigne_Inf_PreAlarme: 'Consigne_Inf_PreAlarme',
    Consigne_Sup_PreAlarme: 'Consigne_Sup_PreAlarme',
    Moyenne: 'Moyenne'
  };

  export type Ts_mesurehistoScalarFieldEnum = (typeof Ts_mesurehistoScalarFieldEnum)[keyof typeof Ts_mesurehistoScalarFieldEnum]


  export const Ts_mesuretestScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdMesureTest: 'IdMesureTest',
    Resistance: 'Resistance',
    SondeNumeroSerie: 'SondeNumeroSerie',
    ValeurNull: 'ValeurNull',
    DateHeure: 'DateHeure',
    NombreTotal: 'NombreTotal',
    NombreRecu: 'NombreRecu'
  };

  export type Ts_mesuretestScalarFieldEnum = (typeof Ts_mesuretestScalarFieldEnum)[keyof typeof Ts_mesuretestScalarFieldEnum]


  export const Ts_mesuretestetalonScalarFieldEnum: {
    IdServeurBDD: 'IdServeurBDD',
    IdMesureTestEtalon: 'IdMesureTestEtalon',
    Resistance: 'Resistance',
    EtalonNumeroSerie: 'EtalonNumeroSerie',
    ValeurNull: 'ValeurNull',
    DateHeure: 'DateHeure',
    NombreTotal: 'NombreTotal',
    NombreRecu: 'NombreRecu'
  };

  export type Ts_mesuretestetalonScalarFieldEnum = (typeof Ts_mesuretestetalonScalarFieldEnum)[keyof typeof Ts_mesuretestetalonScalarFieldEnum]


  export const Ts_modedegradeScalarFieldEnum: {
    IdModeDegrade: 'IdModeDegrade',
    IdUtilisateur: 'IdUtilisateur',
    DateHeureCreation: 'DateHeureCreation',
    RequeteSQL: 'RequeteSQL',
    RequeteArchivee: 'RequeteArchivee',
    DateHeureArchive: 'DateHeureArchive'
  };

  export type Ts_modedegradeScalarFieldEnum = (typeof Ts_modedegradeScalarFieldEnum)[keyof typeof Ts_modedegradeScalarFieldEnum]


  export const Ts_parametreScalarFieldEnum: {
    CleParametre: 'CleParametre',
    ValeurParametre: 'ValeurParametre',
    GroupeParametre: 'GroupeParametre',
    CommentaireParametre: 'CommentaireParametre'
  };

  export type Ts_parametreScalarFieldEnum = (typeof Ts_parametreScalarFieldEnum)[keyof typeof Ts_parametreScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const ts_compteur_idtableOrderByRelevanceFieldEnum: {
    NomTable: 'NomTable'
  };

  export type ts_compteur_idtableOrderByRelevanceFieldEnum = (typeof ts_compteur_idtableOrderByRelevanceFieldEnum)[keyof typeof ts_compteur_idtableOrderByRelevanceFieldEnum]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const ts_graphiqueOrderByRelevanceFieldEnum: {
    Unite: 'Unite',
    SondeNumeroSerie: 'SondeNumeroSerie'
  };

  export type ts_graphiqueOrderByRelevanceFieldEnum = (typeof ts_graphiqueOrderByRelevanceFieldEnum)[keyof typeof ts_graphiqueOrderByRelevanceFieldEnum]


  export const ts_journalOrderByRelevanceFieldEnum: {
    CodeJournal: 'CodeJournal',
    Commentaire: 'Commentaire',
    NomUtilisateur: 'NomUtilisateur',
    ProfilUtilisateur: 'ProfilUtilisateur',
    CommentaireUtilisateur: 'CommentaireUtilisateur'
  };

  export type ts_journalOrderByRelevanceFieldEnum = (typeof ts_journalOrderByRelevanceFieldEnum)[keyof typeof ts_journalOrderByRelevanceFieldEnum]


  export const ts_journal_codeOrderByRelevanceFieldEnum: {
    CodeJournal: 'CodeJournal',
    Commentaire: 'Commentaire'
  };

  export type ts_journal_codeOrderByRelevanceFieldEnum = (typeof ts_journal_codeOrderByRelevanceFieldEnum)[keyof typeof ts_journal_codeOrderByRelevanceFieldEnum]


  export const ts_journalhistoOrderByRelevanceFieldEnum: {
    CodeJournal: 'CodeJournal',
    Commentaire: 'Commentaire',
    NomUtilisateur: 'NomUtilisateur',
    ProfilUtilisateur: 'ProfilUtilisateur',
    CommentaireUtilisateur: 'CommentaireUtilisateur'
  };

  export type ts_journalhistoOrderByRelevanceFieldEnum = (typeof ts_journalhistoOrderByRelevanceFieldEnum)[keyof typeof ts_journalhistoOrderByRelevanceFieldEnum]


  export const ts_logmesuresOrderByRelevanceFieldEnum: {
    Details: 'Details'
  };

  export type ts_logmesuresOrderByRelevanceFieldEnum = (typeof ts_logmesuresOrderByRelevanceFieldEnum)[keyof typeof ts_logmesuresOrderByRelevanceFieldEnum]


  export const ts_mesureOrderByRelevanceFieldEnum: {
    Unite: 'Unite',
    SondeNumeroSerie: 'SondeNumeroSerie'
  };

  export type ts_mesureOrderByRelevanceFieldEnum = (typeof ts_mesureOrderByRelevanceFieldEnum)[keyof typeof ts_mesureOrderByRelevanceFieldEnum]


  export const ts_mesurecalibrageOrderByRelevanceFieldEnum: {
    Valeur: 'Valeur',
    Resistance: 'Resistance',
    SondeNumeroSerie: 'SondeNumeroSerie'
  };

  export type ts_mesurecalibrageOrderByRelevanceFieldEnum = (typeof ts_mesurecalibrageOrderByRelevanceFieldEnum)[keyof typeof ts_mesurecalibrageOrderByRelevanceFieldEnum]


  export const ts_mesurecalibrageetalonOrderByRelevanceFieldEnum: {
    Valeur: 'Valeur',
    Resistance: 'Resistance',
    EtalonNumeroSerie: 'EtalonNumeroSerie'
  };

  export type ts_mesurecalibrageetalonOrderByRelevanceFieldEnum = (typeof ts_mesurecalibrageetalonOrderByRelevanceFieldEnum)[keyof typeof ts_mesurecalibrageetalonOrderByRelevanceFieldEnum]


  export const ts_mesureetalonOrderByRelevanceFieldEnum: {
    EtalonNumeroSerie: 'EtalonNumeroSerie',
    Message_Erreur: 'Message_Erreur'
  };

  export type ts_mesureetalonOrderByRelevanceFieldEnum = (typeof ts_mesureetalonOrderByRelevanceFieldEnum)[keyof typeof ts_mesureetalonOrderByRelevanceFieldEnum]


  export const ts_mesureetalonnageOrderByRelevanceFieldEnum: {
    SondeNumeroserie: 'SondeNumeroserie',
    MesureSonde: 'MesureSonde',
    MesureEtalon: 'MesureEtalon'
  };

  export type ts_mesureetalonnageOrderByRelevanceFieldEnum = (typeof ts_mesureetalonnageOrderByRelevanceFieldEnum)[keyof typeof ts_mesureetalonnageOrderByRelevanceFieldEnum]


  export const ts_mesurehistoOrderByRelevanceFieldEnum: {
    Unite: 'Unite',
    SondeNumeroSerie: 'SondeNumeroSerie'
  };

  export type ts_mesurehistoOrderByRelevanceFieldEnum = (typeof ts_mesurehistoOrderByRelevanceFieldEnum)[keyof typeof ts_mesurehistoOrderByRelevanceFieldEnum]


  export const ts_mesuretestOrderByRelevanceFieldEnum: {
    SondeNumeroSerie: 'SondeNumeroSerie'
  };

  export type ts_mesuretestOrderByRelevanceFieldEnum = (typeof ts_mesuretestOrderByRelevanceFieldEnum)[keyof typeof ts_mesuretestOrderByRelevanceFieldEnum]


  export const ts_mesuretestetalonOrderByRelevanceFieldEnum: {
    EtalonNumeroSerie: 'EtalonNumeroSerie'
  };

  export type ts_mesuretestetalonOrderByRelevanceFieldEnum = (typeof ts_mesuretestetalonOrderByRelevanceFieldEnum)[keyof typeof ts_mesuretestetalonOrderByRelevanceFieldEnum]


  export const ts_modedegradeOrderByRelevanceFieldEnum: {
    RequeteSQL: 'RequeteSQL'
  };

  export type ts_modedegradeOrderByRelevanceFieldEnum = (typeof ts_modedegradeOrderByRelevanceFieldEnum)[keyof typeof ts_modedegradeOrderByRelevanceFieldEnum]


  export const ts_parametreOrderByRelevanceFieldEnum: {
    CleParametre: 'CleParametre',
    ValeurParametre: 'ValeurParametre',
    GroupeParametre: 'GroupeParametre',
    CommentaireParametre: 'CommentaireParametre'
  };

  export type ts_parametreOrderByRelevanceFieldEnum = (typeof ts_parametreOrderByRelevanceFieldEnum)[keyof typeof ts_parametreOrderByRelevanceFieldEnum]


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
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    
  /**
   * Deep Input Types
   */


  export type ts_compteur_idtableWhereInput = {
    AND?: ts_compteur_idtableWhereInput | ts_compteur_idtableWhereInput[]
    OR?: ts_compteur_idtableWhereInput[]
    NOT?: ts_compteur_idtableWhereInput | ts_compteur_idtableWhereInput[]
    IdServeurBDD?: IntFilter<"ts_compteur_idtable"> | number
    NomTable?: StringFilter<"ts_compteur_idtable"> | string
    CompteurID?: IntFilter<"ts_compteur_idtable"> | number
  }

  export type ts_compteur_idtableOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    NomTable?: SortOrder
    CompteurID?: SortOrder
    _relevance?: ts_compteur_idtableOrderByRelevanceInput
  }

  export type ts_compteur_idtableWhereUniqueInput = Prisma.AtLeast<{
    IdServeurBDD_NomTable?: ts_compteur_idtableIdServeurBDDNomTableCompoundUniqueInput
    AND?: ts_compteur_idtableWhereInput | ts_compteur_idtableWhereInput[]
    OR?: ts_compteur_idtableWhereInput[]
    NOT?: ts_compteur_idtableWhereInput | ts_compteur_idtableWhereInput[]
    IdServeurBDD?: IntFilter<"ts_compteur_idtable"> | number
    NomTable?: StringFilter<"ts_compteur_idtable"> | string
    CompteurID?: IntFilter<"ts_compteur_idtable"> | number
  }, "IdServeurBDD_NomTable">

  export type ts_compteur_idtableOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    NomTable?: SortOrder
    CompteurID?: SortOrder
    _count?: ts_compteur_idtableCountOrderByAggregateInput
    _avg?: ts_compteur_idtableAvgOrderByAggregateInput
    _max?: ts_compteur_idtableMaxOrderByAggregateInput
    _min?: ts_compteur_idtableMinOrderByAggregateInput
    _sum?: ts_compteur_idtableSumOrderByAggregateInput
  }

  export type ts_compteur_idtableScalarWhereWithAggregatesInput = {
    AND?: ts_compteur_idtableScalarWhereWithAggregatesInput | ts_compteur_idtableScalarWhereWithAggregatesInput[]
    OR?: ts_compteur_idtableScalarWhereWithAggregatesInput[]
    NOT?: ts_compteur_idtableScalarWhereWithAggregatesInput | ts_compteur_idtableScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_compteur_idtable"> | number
    NomTable?: StringWithAggregatesFilter<"ts_compteur_idtable"> | string
    CompteurID?: IntWithAggregatesFilter<"ts_compteur_idtable"> | number
  }

  export type ts_graphiqueWhereInput = {
    AND?: ts_graphiqueWhereInput | ts_graphiqueWhereInput[]
    OR?: ts_graphiqueWhereInput[]
    NOT?: ts_graphiqueWhereInput | ts_graphiqueWhereInput[]
    IdGraphique?: IntFilter<"ts_graphique"> | number
    DateHeureMesure?: DateTimeFilter<"ts_graphique"> | Date | string
    Valeur?: FloatNullableFilter<"ts_graphique"> | number | null
    Resistance?: FloatNullableFilter<"ts_graphique"> | number | null
    Nb_decimal?: IntNullableFilter<"ts_graphique"> | number | null
    Consigne?: FloatNullableFilter<"ts_graphique"> | number | null
    Consigne_Sup?: FloatNullableFilter<"ts_graphique"> | number | null
    Consigne_Inf?: FloatNullableFilter<"ts_graphique"> | number | null
    Unite?: StringNullableFilter<"ts_graphique"> | string | null
    SondeNumeroSerie?: StringNullableFilter<"ts_graphique"> | string | null
    IdLieu?: IntFilter<"ts_graphique"> | number
    ValeurNull?: IntFilter<"ts_graphique"> | number
    Frequence?: IntNullableFilter<"ts_graphique"> | number | null
    Etat_Alarme?: IntFilter<"ts_graphique"> | number
    Consigne_Inf_PreAlarme?: FloatNullableFilter<"ts_graphique"> | number | null
    Consigne_Sup_PreAlarme?: FloatNullableFilter<"ts_graphique"> | number | null
  }

  export type ts_graphiqueOrderByWithRelationInput = {
    IdGraphique?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Resistance?: SortOrderInput | SortOrder
    Nb_decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    SondeNumeroSerie?: SortOrderInput | SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrderInput | SortOrder
    Consigne_Sup_PreAlarme?: SortOrderInput | SortOrder
    _relevance?: ts_graphiqueOrderByRelevanceInput
  }

  export type ts_graphiqueWhereUniqueInput = Prisma.AtLeast<{
    IdGraphique_DateHeureMesure_IdLieu_ValeurNull_Etat_Alarme?: ts_graphiqueIdGraphiqueDateHeureMesureIdLieuValeurNullEtat_AlarmeCompoundUniqueInput
    AND?: ts_graphiqueWhereInput | ts_graphiqueWhereInput[]
    OR?: ts_graphiqueWhereInput[]
    NOT?: ts_graphiqueWhereInput | ts_graphiqueWhereInput[]
    IdGraphique?: IntFilter<"ts_graphique"> | number
    DateHeureMesure?: DateTimeFilter<"ts_graphique"> | Date | string
    Valeur?: FloatNullableFilter<"ts_graphique"> | number | null
    Resistance?: FloatNullableFilter<"ts_graphique"> | number | null
    Nb_decimal?: IntNullableFilter<"ts_graphique"> | number | null
    Consigne?: FloatNullableFilter<"ts_graphique"> | number | null
    Consigne_Sup?: FloatNullableFilter<"ts_graphique"> | number | null
    Consigne_Inf?: FloatNullableFilter<"ts_graphique"> | number | null
    Unite?: StringNullableFilter<"ts_graphique"> | string | null
    SondeNumeroSerie?: StringNullableFilter<"ts_graphique"> | string | null
    IdLieu?: IntFilter<"ts_graphique"> | number
    ValeurNull?: IntFilter<"ts_graphique"> | number
    Frequence?: IntNullableFilter<"ts_graphique"> | number | null
    Etat_Alarme?: IntFilter<"ts_graphique"> | number
    Consigne_Inf_PreAlarme?: FloatNullableFilter<"ts_graphique"> | number | null
    Consigne_Sup_PreAlarme?: FloatNullableFilter<"ts_graphique"> | number | null
  }, "IdGraphique_DateHeureMesure_IdLieu_ValeurNull_Etat_Alarme">

  export type ts_graphiqueOrderByWithAggregationInput = {
    IdGraphique?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Resistance?: SortOrderInput | SortOrder
    Nb_decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    SondeNumeroSerie?: SortOrderInput | SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrderInput | SortOrder
    Consigne_Sup_PreAlarme?: SortOrderInput | SortOrder
    _count?: ts_graphiqueCountOrderByAggregateInput
    _avg?: ts_graphiqueAvgOrderByAggregateInput
    _max?: ts_graphiqueMaxOrderByAggregateInput
    _min?: ts_graphiqueMinOrderByAggregateInput
    _sum?: ts_graphiqueSumOrderByAggregateInput
  }

  export type ts_graphiqueScalarWhereWithAggregatesInput = {
    AND?: ts_graphiqueScalarWhereWithAggregatesInput | ts_graphiqueScalarWhereWithAggregatesInput[]
    OR?: ts_graphiqueScalarWhereWithAggregatesInput[]
    NOT?: ts_graphiqueScalarWhereWithAggregatesInput | ts_graphiqueScalarWhereWithAggregatesInput[]
    IdGraphique?: IntWithAggregatesFilter<"ts_graphique"> | number
    DateHeureMesure?: DateTimeWithAggregatesFilter<"ts_graphique"> | Date | string
    Valeur?: FloatNullableWithAggregatesFilter<"ts_graphique"> | number | null
    Resistance?: FloatNullableWithAggregatesFilter<"ts_graphique"> | number | null
    Nb_decimal?: IntNullableWithAggregatesFilter<"ts_graphique"> | number | null
    Consigne?: FloatNullableWithAggregatesFilter<"ts_graphique"> | number | null
    Consigne_Sup?: FloatNullableWithAggregatesFilter<"ts_graphique"> | number | null
    Consigne_Inf?: FloatNullableWithAggregatesFilter<"ts_graphique"> | number | null
    Unite?: StringNullableWithAggregatesFilter<"ts_graphique"> | string | null
    SondeNumeroSerie?: StringNullableWithAggregatesFilter<"ts_graphique"> | string | null
    IdLieu?: IntWithAggregatesFilter<"ts_graphique"> | number
    ValeurNull?: IntWithAggregatesFilter<"ts_graphique"> | number
    Frequence?: IntNullableWithAggregatesFilter<"ts_graphique"> | number | null
    Etat_Alarme?: IntWithAggregatesFilter<"ts_graphique"> | number
    Consigne_Inf_PreAlarme?: FloatNullableWithAggregatesFilter<"ts_graphique"> | number | null
    Consigne_Sup_PreAlarme?: FloatNullableWithAggregatesFilter<"ts_graphique"> | number | null
  }

  export type ts_journalWhereInput = {
    AND?: ts_journalWhereInput | ts_journalWhereInput[]
    OR?: ts_journalWhereInput[]
    NOT?: ts_journalWhereInput | ts_journalWhereInput[]
    IdServeurBDD?: IntFilter<"ts_journal"> | number
    IdJournal?: IntFilter<"ts_journal"> | number
    CodeJournal?: StringNullableFilter<"ts_journal"> | string | null
    Commentaire?: StringNullableFilter<"ts_journal"> | string | null
    NomUtilisateur?: StringNullableFilter<"ts_journal"> | string | null
    ProfilUtilisateur?: StringNullableFilter<"ts_journal"> | string | null
    DateHeureJournal?: DateTimeNullableFilter<"ts_journal"> | Date | string | null
    IdLieu?: IntNullableFilter<"ts_journal"> | number | null
    CommentaireUtilisateur?: StringNullableFilter<"ts_journal"> | string | null
  }

  export type ts_journalOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrderInput | SortOrder
    Commentaire?: SortOrderInput | SortOrder
    NomUtilisateur?: SortOrderInput | SortOrder
    ProfilUtilisateur?: SortOrderInput | SortOrder
    DateHeureJournal?: SortOrderInput | SortOrder
    IdLieu?: SortOrderInput | SortOrder
    CommentaireUtilisateur?: SortOrderInput | SortOrder
    _relevance?: ts_journalOrderByRelevanceInput
  }

  export type ts_journalWhereUniqueInput = Prisma.AtLeast<{
    IdServeurBDD_IdJournal?: ts_journalIdServeurBDDIdJournalCompoundUniqueInput
    AND?: ts_journalWhereInput | ts_journalWhereInput[]
    OR?: ts_journalWhereInput[]
    NOT?: ts_journalWhereInput | ts_journalWhereInput[]
    IdServeurBDD?: IntFilter<"ts_journal"> | number
    IdJournal?: IntFilter<"ts_journal"> | number
    CodeJournal?: StringNullableFilter<"ts_journal"> | string | null
    Commentaire?: StringNullableFilter<"ts_journal"> | string | null
    NomUtilisateur?: StringNullableFilter<"ts_journal"> | string | null
    ProfilUtilisateur?: StringNullableFilter<"ts_journal"> | string | null
    DateHeureJournal?: DateTimeNullableFilter<"ts_journal"> | Date | string | null
    IdLieu?: IntNullableFilter<"ts_journal"> | number | null
    CommentaireUtilisateur?: StringNullableFilter<"ts_journal"> | string | null
  }, "IdServeurBDD_IdJournal">

  export type ts_journalOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrderInput | SortOrder
    Commentaire?: SortOrderInput | SortOrder
    NomUtilisateur?: SortOrderInput | SortOrder
    ProfilUtilisateur?: SortOrderInput | SortOrder
    DateHeureJournal?: SortOrderInput | SortOrder
    IdLieu?: SortOrderInput | SortOrder
    CommentaireUtilisateur?: SortOrderInput | SortOrder
    _count?: ts_journalCountOrderByAggregateInput
    _avg?: ts_journalAvgOrderByAggregateInput
    _max?: ts_journalMaxOrderByAggregateInput
    _min?: ts_journalMinOrderByAggregateInput
    _sum?: ts_journalSumOrderByAggregateInput
  }

  export type ts_journalScalarWhereWithAggregatesInput = {
    AND?: ts_journalScalarWhereWithAggregatesInput | ts_journalScalarWhereWithAggregatesInput[]
    OR?: ts_journalScalarWhereWithAggregatesInput[]
    NOT?: ts_journalScalarWhereWithAggregatesInput | ts_journalScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_journal"> | number
    IdJournal?: IntWithAggregatesFilter<"ts_journal"> | number
    CodeJournal?: StringNullableWithAggregatesFilter<"ts_journal"> | string | null
    Commentaire?: StringNullableWithAggregatesFilter<"ts_journal"> | string | null
    NomUtilisateur?: StringNullableWithAggregatesFilter<"ts_journal"> | string | null
    ProfilUtilisateur?: StringNullableWithAggregatesFilter<"ts_journal"> | string | null
    DateHeureJournal?: DateTimeNullableWithAggregatesFilter<"ts_journal"> | Date | string | null
    IdLieu?: IntNullableWithAggregatesFilter<"ts_journal"> | number | null
    CommentaireUtilisateur?: StringNullableWithAggregatesFilter<"ts_journal"> | string | null
  }

  export type ts_journal_codeWhereInput = {
    AND?: ts_journal_codeWhereInput | ts_journal_codeWhereInput[]
    OR?: ts_journal_codeWhereInput[]
    NOT?: ts_journal_codeWhereInput | ts_journal_codeWhereInput[]
    CodeJournal?: StringFilter<"ts_journal_code"> | string
    Commentaire?: StringNullableFilter<"ts_journal_code"> | string | null
  }

  export type ts_journal_codeOrderByWithRelationInput = {
    CodeJournal?: SortOrder
    Commentaire?: SortOrderInput | SortOrder
    _relevance?: ts_journal_codeOrderByRelevanceInput
  }

  export type ts_journal_codeWhereUniqueInput = Prisma.AtLeast<{
    CodeJournal?: string
    AND?: ts_journal_codeWhereInput | ts_journal_codeWhereInput[]
    OR?: ts_journal_codeWhereInput[]
    NOT?: ts_journal_codeWhereInput | ts_journal_codeWhereInput[]
    Commentaire?: StringNullableFilter<"ts_journal_code"> | string | null
  }, "CodeJournal">

  export type ts_journal_codeOrderByWithAggregationInput = {
    CodeJournal?: SortOrder
    Commentaire?: SortOrderInput | SortOrder
    _count?: ts_journal_codeCountOrderByAggregateInput
    _max?: ts_journal_codeMaxOrderByAggregateInput
    _min?: ts_journal_codeMinOrderByAggregateInput
  }

  export type ts_journal_codeScalarWhereWithAggregatesInput = {
    AND?: ts_journal_codeScalarWhereWithAggregatesInput | ts_journal_codeScalarWhereWithAggregatesInput[]
    OR?: ts_journal_codeScalarWhereWithAggregatesInput[]
    NOT?: ts_journal_codeScalarWhereWithAggregatesInput | ts_journal_codeScalarWhereWithAggregatesInput[]
    CodeJournal?: StringWithAggregatesFilter<"ts_journal_code"> | string
    Commentaire?: StringNullableWithAggregatesFilter<"ts_journal_code"> | string | null
  }

  export type ts_journalhistoWhereInput = {
    AND?: ts_journalhistoWhereInput | ts_journalhistoWhereInput[]
    OR?: ts_journalhistoWhereInput[]
    NOT?: ts_journalhistoWhereInput | ts_journalhistoWhereInput[]
    IdServeurBDD?: IntFilter<"ts_journalhisto"> | number
    IdJournal?: IntFilter<"ts_journalhisto"> | number
    CodeJournal?: StringNullableFilter<"ts_journalhisto"> | string | null
    Commentaire?: StringNullableFilter<"ts_journalhisto"> | string | null
    NomUtilisateur?: StringNullableFilter<"ts_journalhisto"> | string | null
    ProfilUtilisateur?: StringNullableFilter<"ts_journalhisto"> | string | null
    DateHeureJournal?: DateTimeNullableFilter<"ts_journalhisto"> | Date | string | null
    IdLieu?: IntNullableFilter<"ts_journalhisto"> | number | null
    CommentaireUtilisateur?: StringNullableFilter<"ts_journalhisto"> | string | null
  }

  export type ts_journalhistoOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrderInput | SortOrder
    Commentaire?: SortOrderInput | SortOrder
    NomUtilisateur?: SortOrderInput | SortOrder
    ProfilUtilisateur?: SortOrderInput | SortOrder
    DateHeureJournal?: SortOrderInput | SortOrder
    IdLieu?: SortOrderInput | SortOrder
    CommentaireUtilisateur?: SortOrderInput | SortOrder
    _relevance?: ts_journalhistoOrderByRelevanceInput
  }

  export type ts_journalhistoWhereUniqueInput = Prisma.AtLeast<{
    IdServeurBDD_IdJournal?: ts_journalhistoIdServeurBDDIdJournalCompoundUniqueInput
    AND?: ts_journalhistoWhereInput | ts_journalhistoWhereInput[]
    OR?: ts_journalhistoWhereInput[]
    NOT?: ts_journalhistoWhereInput | ts_journalhistoWhereInput[]
    IdServeurBDD?: IntFilter<"ts_journalhisto"> | number
    IdJournal?: IntFilter<"ts_journalhisto"> | number
    CodeJournal?: StringNullableFilter<"ts_journalhisto"> | string | null
    Commentaire?: StringNullableFilter<"ts_journalhisto"> | string | null
    NomUtilisateur?: StringNullableFilter<"ts_journalhisto"> | string | null
    ProfilUtilisateur?: StringNullableFilter<"ts_journalhisto"> | string | null
    DateHeureJournal?: DateTimeNullableFilter<"ts_journalhisto"> | Date | string | null
    IdLieu?: IntNullableFilter<"ts_journalhisto"> | number | null
    CommentaireUtilisateur?: StringNullableFilter<"ts_journalhisto"> | string | null
  }, "IdServeurBDD_IdJournal">

  export type ts_journalhistoOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrderInput | SortOrder
    Commentaire?: SortOrderInput | SortOrder
    NomUtilisateur?: SortOrderInput | SortOrder
    ProfilUtilisateur?: SortOrderInput | SortOrder
    DateHeureJournal?: SortOrderInput | SortOrder
    IdLieu?: SortOrderInput | SortOrder
    CommentaireUtilisateur?: SortOrderInput | SortOrder
    _count?: ts_journalhistoCountOrderByAggregateInput
    _avg?: ts_journalhistoAvgOrderByAggregateInput
    _max?: ts_journalhistoMaxOrderByAggregateInput
    _min?: ts_journalhistoMinOrderByAggregateInput
    _sum?: ts_journalhistoSumOrderByAggregateInput
  }

  export type ts_journalhistoScalarWhereWithAggregatesInput = {
    AND?: ts_journalhistoScalarWhereWithAggregatesInput | ts_journalhistoScalarWhereWithAggregatesInput[]
    OR?: ts_journalhistoScalarWhereWithAggregatesInput[]
    NOT?: ts_journalhistoScalarWhereWithAggregatesInput | ts_journalhistoScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_journalhisto"> | number
    IdJournal?: IntWithAggregatesFilter<"ts_journalhisto"> | number
    CodeJournal?: StringNullableWithAggregatesFilter<"ts_journalhisto"> | string | null
    Commentaire?: StringNullableWithAggregatesFilter<"ts_journalhisto"> | string | null
    NomUtilisateur?: StringNullableWithAggregatesFilter<"ts_journalhisto"> | string | null
    ProfilUtilisateur?: StringNullableWithAggregatesFilter<"ts_journalhisto"> | string | null
    DateHeureJournal?: DateTimeNullableWithAggregatesFilter<"ts_journalhisto"> | Date | string | null
    IdLieu?: IntNullableWithAggregatesFilter<"ts_journalhisto"> | number | null
    CommentaireUtilisateur?: StringNullableWithAggregatesFilter<"ts_journalhisto"> | string | null
  }

  export type ts_logmesuresWhereInput = {
    AND?: ts_logmesuresWhereInput | ts_logmesuresWhereInput[]
    OR?: ts_logmesuresWhereInput[]
    NOT?: ts_logmesuresWhereInput | ts_logmesuresWhereInput[]
    IdLogMesures?: IntFilter<"ts_logmesures"> | number
    IdReception?: IntNullableFilter<"ts_logmesures"> | number | null
    DateHeureMesure?: DateTimeFilter<"ts_logmesures"> | Date | string
    Valeur?: FloatNullableFilter<"ts_logmesures"> | number | null
    bEstHorsConsignes?: IntNullableFilter<"ts_logmesures"> | number | null
    bEstEnAlarme?: IntNullableFilter<"ts_logmesures"> | number | null
    bMarqueur?: IntNullableFilter<"ts_logmesures"> | number | null
    Details?: StringNullableFilter<"ts_logmesures"> | string | null
  }

  export type ts_logmesuresOrderByWithRelationInput = {
    IdLogMesures?: SortOrder
    IdReception?: SortOrderInput | SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    bEstHorsConsignes?: SortOrderInput | SortOrder
    bEstEnAlarme?: SortOrderInput | SortOrder
    bMarqueur?: SortOrderInput | SortOrder
    Details?: SortOrderInput | SortOrder
    _relevance?: ts_logmesuresOrderByRelevanceInput
  }

  export type ts_logmesuresWhereUniqueInput = Prisma.AtLeast<{
    IdLogMesures?: number
    AND?: ts_logmesuresWhereInput | ts_logmesuresWhereInput[]
    OR?: ts_logmesuresWhereInput[]
    NOT?: ts_logmesuresWhereInput | ts_logmesuresWhereInput[]
    IdReception?: IntNullableFilter<"ts_logmesures"> | number | null
    DateHeureMesure?: DateTimeFilter<"ts_logmesures"> | Date | string
    Valeur?: FloatNullableFilter<"ts_logmesures"> | number | null
    bEstHorsConsignes?: IntNullableFilter<"ts_logmesures"> | number | null
    bEstEnAlarme?: IntNullableFilter<"ts_logmesures"> | number | null
    bMarqueur?: IntNullableFilter<"ts_logmesures"> | number | null
    Details?: StringNullableFilter<"ts_logmesures"> | string | null
  }, "IdLogMesures">

  export type ts_logmesuresOrderByWithAggregationInput = {
    IdLogMesures?: SortOrder
    IdReception?: SortOrderInput | SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    bEstHorsConsignes?: SortOrderInput | SortOrder
    bEstEnAlarme?: SortOrderInput | SortOrder
    bMarqueur?: SortOrderInput | SortOrder
    Details?: SortOrderInput | SortOrder
    _count?: ts_logmesuresCountOrderByAggregateInput
    _avg?: ts_logmesuresAvgOrderByAggregateInput
    _max?: ts_logmesuresMaxOrderByAggregateInput
    _min?: ts_logmesuresMinOrderByAggregateInput
    _sum?: ts_logmesuresSumOrderByAggregateInput
  }

  export type ts_logmesuresScalarWhereWithAggregatesInput = {
    AND?: ts_logmesuresScalarWhereWithAggregatesInput | ts_logmesuresScalarWhereWithAggregatesInput[]
    OR?: ts_logmesuresScalarWhereWithAggregatesInput[]
    NOT?: ts_logmesuresScalarWhereWithAggregatesInput | ts_logmesuresScalarWhereWithAggregatesInput[]
    IdLogMesures?: IntWithAggregatesFilter<"ts_logmesures"> | number
    IdReception?: IntNullableWithAggregatesFilter<"ts_logmesures"> | number | null
    DateHeureMesure?: DateTimeWithAggregatesFilter<"ts_logmesures"> | Date | string
    Valeur?: FloatNullableWithAggregatesFilter<"ts_logmesures"> | number | null
    bEstHorsConsignes?: IntNullableWithAggregatesFilter<"ts_logmesures"> | number | null
    bEstEnAlarme?: IntNullableWithAggregatesFilter<"ts_logmesures"> | number | null
    bMarqueur?: IntNullableWithAggregatesFilter<"ts_logmesures"> | number | null
    Details?: StringNullableWithAggregatesFilter<"ts_logmesures"> | string | null
  }

  export type ts_mesureWhereInput = {
    AND?: ts_mesureWhereInput | ts_mesureWhereInput[]
    OR?: ts_mesureWhereInput[]
    NOT?: ts_mesureWhereInput | ts_mesureWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesure"> | number
    IdMesure?: IntFilter<"ts_mesure"> | number
    DateHeureMesure?: DateTimeFilter<"ts_mesure"> | Date | string
    Valeur?: FloatNullableFilter<"ts_mesure"> | number | null
    Resistance?: FloatNullableFilter<"ts_mesure"> | number | null
    Nb_decimal?: IntNullableFilter<"ts_mesure"> | number | null
    Consigne?: FloatNullableFilter<"ts_mesure"> | number | null
    Consigne_Sup?: FloatNullableFilter<"ts_mesure"> | number | null
    Consigne_Inf?: FloatNullableFilter<"ts_mesure"> | number | null
    Unite?: StringNullableFilter<"ts_mesure"> | string | null
    SondeNumeroSerie?: StringNullableFilter<"ts_mesure"> | string | null
    IdLieu?: IntFilter<"ts_mesure"> | number
    ValeurNull?: IntFilter<"ts_mesure"> | number
    Frequence?: IntNullableFilter<"ts_mesure"> | number | null
    Etat_Alarme?: BoolNullableFilter<"ts_mesure"> | boolean | null
    Consigne_Inf_PreAlarme?: FloatNullableFilter<"ts_mesure"> | number | null
    Consigne_Sup_PreAlarme?: FloatNullableFilter<"ts_mesure"> | number | null
    Moyenne?: FloatNullableFilter<"ts_mesure"> | number | null
  }

  export type ts_mesureOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Resistance?: SortOrderInput | SortOrder
    Nb_decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    SondeNumeroSerie?: SortOrderInput | SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Etat_Alarme?: SortOrderInput | SortOrder
    Consigne_Inf_PreAlarme?: SortOrderInput | SortOrder
    Consigne_Sup_PreAlarme?: SortOrderInput | SortOrder
    Moyenne?: SortOrderInput | SortOrder
    _relevance?: ts_mesureOrderByRelevanceInput
  }

  export type ts_mesureWhereUniqueInput = Prisma.AtLeast<{
    IdServeurBDD_IdMesure_DateHeureMesure_IdLieu_ValeurNull?: ts_mesureIdServeurBDDIdMesureDateHeureMesureIdLieuValeurNullCompoundUniqueInput
    AND?: ts_mesureWhereInput | ts_mesureWhereInput[]
    OR?: ts_mesureWhereInput[]
    NOT?: ts_mesureWhereInput | ts_mesureWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesure"> | number
    IdMesure?: IntFilter<"ts_mesure"> | number
    DateHeureMesure?: DateTimeFilter<"ts_mesure"> | Date | string
    Valeur?: FloatNullableFilter<"ts_mesure"> | number | null
    Resistance?: FloatNullableFilter<"ts_mesure"> | number | null
    Nb_decimal?: IntNullableFilter<"ts_mesure"> | number | null
    Consigne?: FloatNullableFilter<"ts_mesure"> | number | null
    Consigne_Sup?: FloatNullableFilter<"ts_mesure"> | number | null
    Consigne_Inf?: FloatNullableFilter<"ts_mesure"> | number | null
    Unite?: StringNullableFilter<"ts_mesure"> | string | null
    SondeNumeroSerie?: StringNullableFilter<"ts_mesure"> | string | null
    IdLieu?: IntFilter<"ts_mesure"> | number
    ValeurNull?: IntFilter<"ts_mesure"> | number
    Frequence?: IntNullableFilter<"ts_mesure"> | number | null
    Etat_Alarme?: BoolNullableFilter<"ts_mesure"> | boolean | null
    Consigne_Inf_PreAlarme?: FloatNullableFilter<"ts_mesure"> | number | null
    Consigne_Sup_PreAlarme?: FloatNullableFilter<"ts_mesure"> | number | null
    Moyenne?: FloatNullableFilter<"ts_mesure"> | number | null
  }, "IdServeurBDD_IdMesure_DateHeureMesure_IdLieu_ValeurNull">

  export type ts_mesureOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Resistance?: SortOrderInput | SortOrder
    Nb_decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    SondeNumeroSerie?: SortOrderInput | SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Etat_Alarme?: SortOrderInput | SortOrder
    Consigne_Inf_PreAlarme?: SortOrderInput | SortOrder
    Consigne_Sup_PreAlarme?: SortOrderInput | SortOrder
    Moyenne?: SortOrderInput | SortOrder
    _count?: ts_mesureCountOrderByAggregateInput
    _avg?: ts_mesureAvgOrderByAggregateInput
    _max?: ts_mesureMaxOrderByAggregateInput
    _min?: ts_mesureMinOrderByAggregateInput
    _sum?: ts_mesureSumOrderByAggregateInput
  }

  export type ts_mesureScalarWhereWithAggregatesInput = {
    AND?: ts_mesureScalarWhereWithAggregatesInput | ts_mesureScalarWhereWithAggregatesInput[]
    OR?: ts_mesureScalarWhereWithAggregatesInput[]
    NOT?: ts_mesureScalarWhereWithAggregatesInput | ts_mesureScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_mesure"> | number
    IdMesure?: IntWithAggregatesFilter<"ts_mesure"> | number
    DateHeureMesure?: DateTimeWithAggregatesFilter<"ts_mesure"> | Date | string
    Valeur?: FloatNullableWithAggregatesFilter<"ts_mesure"> | number | null
    Resistance?: FloatNullableWithAggregatesFilter<"ts_mesure"> | number | null
    Nb_decimal?: IntNullableWithAggregatesFilter<"ts_mesure"> | number | null
    Consigne?: FloatNullableWithAggregatesFilter<"ts_mesure"> | number | null
    Consigne_Sup?: FloatNullableWithAggregatesFilter<"ts_mesure"> | number | null
    Consigne_Inf?: FloatNullableWithAggregatesFilter<"ts_mesure"> | number | null
    Unite?: StringNullableWithAggregatesFilter<"ts_mesure"> | string | null
    SondeNumeroSerie?: StringNullableWithAggregatesFilter<"ts_mesure"> | string | null
    IdLieu?: IntWithAggregatesFilter<"ts_mesure"> | number
    ValeurNull?: IntWithAggregatesFilter<"ts_mesure"> | number
    Frequence?: IntNullableWithAggregatesFilter<"ts_mesure"> | number | null
    Etat_Alarme?: BoolNullableWithAggregatesFilter<"ts_mesure"> | boolean | null
    Consigne_Inf_PreAlarme?: FloatNullableWithAggregatesFilter<"ts_mesure"> | number | null
    Consigne_Sup_PreAlarme?: FloatNullableWithAggregatesFilter<"ts_mesure"> | number | null
    Moyenne?: FloatNullableWithAggregatesFilter<"ts_mesure"> | number | null
  }

  export type ts_mesurecalibrageWhereInput = {
    AND?: ts_mesurecalibrageWhereInput | ts_mesurecalibrageWhereInput[]
    OR?: ts_mesurecalibrageWhereInput[]
    NOT?: ts_mesurecalibrageWhereInput | ts_mesurecalibrageWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesurecalibrage"> | number
    IdMesureCalibrage?: IntFilter<"ts_mesurecalibrage"> | number
    Valeur?: StringFilter<"ts_mesurecalibrage"> | string
    Resistance?: StringFilter<"ts_mesurecalibrage"> | string
    SondeNumeroSerie?: StringFilter<"ts_mesurecalibrage"> | string
    ValeurNull?: IntFilter<"ts_mesurecalibrage"> | number
    DateHeure?: DateTimeFilter<"ts_mesurecalibrage"> | Date | string
  }

  export type ts_mesurecalibrageOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrage?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    _relevance?: ts_mesurecalibrageOrderByRelevanceInput
  }

  export type ts_mesurecalibrageWhereUniqueInput = Prisma.AtLeast<{
    IdServeurBDD_IdMesureCalibrage?: ts_mesurecalibrageIdServeurBDDIdMesureCalibrageCompoundUniqueInput
    AND?: ts_mesurecalibrageWhereInput | ts_mesurecalibrageWhereInput[]
    OR?: ts_mesurecalibrageWhereInput[]
    NOT?: ts_mesurecalibrageWhereInput | ts_mesurecalibrageWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesurecalibrage"> | number
    IdMesureCalibrage?: IntFilter<"ts_mesurecalibrage"> | number
    Valeur?: StringFilter<"ts_mesurecalibrage"> | string
    Resistance?: StringFilter<"ts_mesurecalibrage"> | string
    SondeNumeroSerie?: StringFilter<"ts_mesurecalibrage"> | string
    ValeurNull?: IntFilter<"ts_mesurecalibrage"> | number
    DateHeure?: DateTimeFilter<"ts_mesurecalibrage"> | Date | string
  }, "IdServeurBDD_IdMesureCalibrage">

  export type ts_mesurecalibrageOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrage?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    _count?: ts_mesurecalibrageCountOrderByAggregateInput
    _avg?: ts_mesurecalibrageAvgOrderByAggregateInput
    _max?: ts_mesurecalibrageMaxOrderByAggregateInput
    _min?: ts_mesurecalibrageMinOrderByAggregateInput
    _sum?: ts_mesurecalibrageSumOrderByAggregateInput
  }

  export type ts_mesurecalibrageScalarWhereWithAggregatesInput = {
    AND?: ts_mesurecalibrageScalarWhereWithAggregatesInput | ts_mesurecalibrageScalarWhereWithAggregatesInput[]
    OR?: ts_mesurecalibrageScalarWhereWithAggregatesInput[]
    NOT?: ts_mesurecalibrageScalarWhereWithAggregatesInput | ts_mesurecalibrageScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_mesurecalibrage"> | number
    IdMesureCalibrage?: IntWithAggregatesFilter<"ts_mesurecalibrage"> | number
    Valeur?: StringWithAggregatesFilter<"ts_mesurecalibrage"> | string
    Resistance?: StringWithAggregatesFilter<"ts_mesurecalibrage"> | string
    SondeNumeroSerie?: StringWithAggregatesFilter<"ts_mesurecalibrage"> | string
    ValeurNull?: IntWithAggregatesFilter<"ts_mesurecalibrage"> | number
    DateHeure?: DateTimeWithAggregatesFilter<"ts_mesurecalibrage"> | Date | string
  }

  export type ts_mesurecalibrageetalonWhereInput = {
    AND?: ts_mesurecalibrageetalonWhereInput | ts_mesurecalibrageetalonWhereInput[]
    OR?: ts_mesurecalibrageetalonWhereInput[]
    NOT?: ts_mesurecalibrageetalonWhereInput | ts_mesurecalibrageetalonWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesurecalibrageetalon"> | number
    IdMesureCalibrageEtalon?: IntFilter<"ts_mesurecalibrageetalon"> | number
    Valeur?: StringFilter<"ts_mesurecalibrageetalon"> | string
    Resistance?: StringFilter<"ts_mesurecalibrageetalon"> | string
    EtalonNumeroSerie?: StringFilter<"ts_mesurecalibrageetalon"> | string
    ValeurNull?: IntFilter<"ts_mesurecalibrageetalon"> | number
    DateHeure?: DateTimeFilter<"ts_mesurecalibrageetalon"> | Date | string
  }

  export type ts_mesurecalibrageetalonOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrageEtalon?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    _relevance?: ts_mesurecalibrageetalonOrderByRelevanceInput
  }

  export type ts_mesurecalibrageetalonWhereUniqueInput = Prisma.AtLeast<{
    IdServeurBDD_IdMesureCalibrageEtalon?: ts_mesurecalibrageetalonIdServeurBDDIdMesureCalibrageEtalonCompoundUniqueInput
    AND?: ts_mesurecalibrageetalonWhereInput | ts_mesurecalibrageetalonWhereInput[]
    OR?: ts_mesurecalibrageetalonWhereInput[]
    NOT?: ts_mesurecalibrageetalonWhereInput | ts_mesurecalibrageetalonWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesurecalibrageetalon"> | number
    IdMesureCalibrageEtalon?: IntFilter<"ts_mesurecalibrageetalon"> | number
    Valeur?: StringFilter<"ts_mesurecalibrageetalon"> | string
    Resistance?: StringFilter<"ts_mesurecalibrageetalon"> | string
    EtalonNumeroSerie?: StringFilter<"ts_mesurecalibrageetalon"> | string
    ValeurNull?: IntFilter<"ts_mesurecalibrageetalon"> | number
    DateHeure?: DateTimeFilter<"ts_mesurecalibrageetalon"> | Date | string
  }, "IdServeurBDD_IdMesureCalibrageEtalon">

  export type ts_mesurecalibrageetalonOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrageEtalon?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    _count?: ts_mesurecalibrageetalonCountOrderByAggregateInput
    _avg?: ts_mesurecalibrageetalonAvgOrderByAggregateInput
    _max?: ts_mesurecalibrageetalonMaxOrderByAggregateInput
    _min?: ts_mesurecalibrageetalonMinOrderByAggregateInput
    _sum?: ts_mesurecalibrageetalonSumOrderByAggregateInput
  }

  export type ts_mesurecalibrageetalonScalarWhereWithAggregatesInput = {
    AND?: ts_mesurecalibrageetalonScalarWhereWithAggregatesInput | ts_mesurecalibrageetalonScalarWhereWithAggregatesInput[]
    OR?: ts_mesurecalibrageetalonScalarWhereWithAggregatesInput[]
    NOT?: ts_mesurecalibrageetalonScalarWhereWithAggregatesInput | ts_mesurecalibrageetalonScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_mesurecalibrageetalon"> | number
    IdMesureCalibrageEtalon?: IntWithAggregatesFilter<"ts_mesurecalibrageetalon"> | number
    Valeur?: StringWithAggregatesFilter<"ts_mesurecalibrageetalon"> | string
    Resistance?: StringWithAggregatesFilter<"ts_mesurecalibrageetalon"> | string
    EtalonNumeroSerie?: StringWithAggregatesFilter<"ts_mesurecalibrageetalon"> | string
    ValeurNull?: IntWithAggregatesFilter<"ts_mesurecalibrageetalon"> | number
    DateHeure?: DateTimeWithAggregatesFilter<"ts_mesurecalibrageetalon"> | Date | string
  }

  export type ts_mesureetalonWhereInput = {
    AND?: ts_mesureetalonWhereInput | ts_mesureetalonWhereInput[]
    OR?: ts_mesureetalonWhereInput[]
    NOT?: ts_mesureetalonWhereInput | ts_mesureetalonWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesureetalon"> | number
    IdMesureEtalon?: IntFilter<"ts_mesureetalon"> | number
    Resistance?: FloatFilter<"ts_mesureetalon"> | number
    EtalonNumeroSerie?: StringFilter<"ts_mesureetalon"> | string
    ValeurNull?: IntFilter<"ts_mesureetalon"> | number
    DateHeure?: DateTimeFilter<"ts_mesureetalon"> | Date | string
    Message_Erreur?: StringFilter<"ts_mesureetalon"> | string
  }

  export type ts_mesureetalonOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    Message_Erreur?: SortOrder
    _relevance?: ts_mesureetalonOrderByRelevanceInput
  }

  export type ts_mesureetalonWhereUniqueInput = Prisma.AtLeast<{
    IdServeurBDD_IdMesureEtalon?: ts_mesureetalonIdServeurBDDIdMesureEtalonCompoundUniqueInput
    AND?: ts_mesureetalonWhereInput | ts_mesureetalonWhereInput[]
    OR?: ts_mesureetalonWhereInput[]
    NOT?: ts_mesureetalonWhereInput | ts_mesureetalonWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesureetalon"> | number
    IdMesureEtalon?: IntFilter<"ts_mesureetalon"> | number
    Resistance?: FloatFilter<"ts_mesureetalon"> | number
    EtalonNumeroSerie?: StringFilter<"ts_mesureetalon"> | string
    ValeurNull?: IntFilter<"ts_mesureetalon"> | number
    DateHeure?: DateTimeFilter<"ts_mesureetalon"> | Date | string
    Message_Erreur?: StringFilter<"ts_mesureetalon"> | string
  }, "IdServeurBDD_IdMesureEtalon">

  export type ts_mesureetalonOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    Message_Erreur?: SortOrder
    _count?: ts_mesureetalonCountOrderByAggregateInput
    _avg?: ts_mesureetalonAvgOrderByAggregateInput
    _max?: ts_mesureetalonMaxOrderByAggregateInput
    _min?: ts_mesureetalonMinOrderByAggregateInput
    _sum?: ts_mesureetalonSumOrderByAggregateInput
  }

  export type ts_mesureetalonScalarWhereWithAggregatesInput = {
    AND?: ts_mesureetalonScalarWhereWithAggregatesInput | ts_mesureetalonScalarWhereWithAggregatesInput[]
    OR?: ts_mesureetalonScalarWhereWithAggregatesInput[]
    NOT?: ts_mesureetalonScalarWhereWithAggregatesInput | ts_mesureetalonScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_mesureetalon"> | number
    IdMesureEtalon?: IntWithAggregatesFilter<"ts_mesureetalon"> | number
    Resistance?: FloatWithAggregatesFilter<"ts_mesureetalon"> | number
    EtalonNumeroSerie?: StringWithAggregatesFilter<"ts_mesureetalon"> | string
    ValeurNull?: IntWithAggregatesFilter<"ts_mesureetalon"> | number
    DateHeure?: DateTimeWithAggregatesFilter<"ts_mesureetalon"> | Date | string
    Message_Erreur?: StringWithAggregatesFilter<"ts_mesureetalon"> | string
  }

  export type ts_mesureetalonnageWhereInput = {
    AND?: ts_mesureetalonnageWhereInput | ts_mesureetalonnageWhereInput[]
    OR?: ts_mesureetalonnageWhereInput[]
    NOT?: ts_mesureetalonnageWhereInput | ts_mesureetalonnageWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesureetalonnage"> | number
    IdMesureEtalonnage?: IntFilter<"ts_mesureetalonnage"> | number
    SondeNumeroserie?: StringNullableFilter<"ts_mesureetalonnage"> | string | null
    NumeroOrdre?: IntNullableFilter<"ts_mesureetalonnage"> | number | null
    MesureSonde?: StringNullableFilter<"ts_mesureetalonnage"> | string | null
    MesureEtalon?: StringNullableFilter<"ts_mesureetalonnage"> | string | null
    DateHeure?: DateTimeNullableFilter<"ts_mesureetalonnage"> | Date | string | null
  }

  export type ts_mesureetalonnageOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalonnage?: SortOrder
    SondeNumeroserie?: SortOrderInput | SortOrder
    NumeroOrdre?: SortOrderInput | SortOrder
    MesureSonde?: SortOrderInput | SortOrder
    MesureEtalon?: SortOrderInput | SortOrder
    DateHeure?: SortOrderInput | SortOrder
    _relevance?: ts_mesureetalonnageOrderByRelevanceInput
  }

  export type ts_mesureetalonnageWhereUniqueInput = Prisma.AtLeast<{
    IdServeurBDD_IdMesureEtalonnage?: ts_mesureetalonnageIdServeurBDDIdMesureEtalonnageCompoundUniqueInput
    AND?: ts_mesureetalonnageWhereInput | ts_mesureetalonnageWhereInput[]
    OR?: ts_mesureetalonnageWhereInput[]
    NOT?: ts_mesureetalonnageWhereInput | ts_mesureetalonnageWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesureetalonnage"> | number
    IdMesureEtalonnage?: IntFilter<"ts_mesureetalonnage"> | number
    SondeNumeroserie?: StringNullableFilter<"ts_mesureetalonnage"> | string | null
    NumeroOrdre?: IntNullableFilter<"ts_mesureetalonnage"> | number | null
    MesureSonde?: StringNullableFilter<"ts_mesureetalonnage"> | string | null
    MesureEtalon?: StringNullableFilter<"ts_mesureetalonnage"> | string | null
    DateHeure?: DateTimeNullableFilter<"ts_mesureetalonnage"> | Date | string | null
  }, "IdServeurBDD_IdMesureEtalonnage">

  export type ts_mesureetalonnageOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalonnage?: SortOrder
    SondeNumeroserie?: SortOrderInput | SortOrder
    NumeroOrdre?: SortOrderInput | SortOrder
    MesureSonde?: SortOrderInput | SortOrder
    MesureEtalon?: SortOrderInput | SortOrder
    DateHeure?: SortOrderInput | SortOrder
    _count?: ts_mesureetalonnageCountOrderByAggregateInput
    _avg?: ts_mesureetalonnageAvgOrderByAggregateInput
    _max?: ts_mesureetalonnageMaxOrderByAggregateInput
    _min?: ts_mesureetalonnageMinOrderByAggregateInput
    _sum?: ts_mesureetalonnageSumOrderByAggregateInput
  }

  export type ts_mesureetalonnageScalarWhereWithAggregatesInput = {
    AND?: ts_mesureetalonnageScalarWhereWithAggregatesInput | ts_mesureetalonnageScalarWhereWithAggregatesInput[]
    OR?: ts_mesureetalonnageScalarWhereWithAggregatesInput[]
    NOT?: ts_mesureetalonnageScalarWhereWithAggregatesInput | ts_mesureetalonnageScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_mesureetalonnage"> | number
    IdMesureEtalonnage?: IntWithAggregatesFilter<"ts_mesureetalonnage"> | number
    SondeNumeroserie?: StringNullableWithAggregatesFilter<"ts_mesureetalonnage"> | string | null
    NumeroOrdre?: IntNullableWithAggregatesFilter<"ts_mesureetalonnage"> | number | null
    MesureSonde?: StringNullableWithAggregatesFilter<"ts_mesureetalonnage"> | string | null
    MesureEtalon?: StringNullableWithAggregatesFilter<"ts_mesureetalonnage"> | string | null
    DateHeure?: DateTimeNullableWithAggregatesFilter<"ts_mesureetalonnage"> | Date | string | null
  }

  export type ts_mesurehistoWhereInput = {
    AND?: ts_mesurehistoWhereInput | ts_mesurehistoWhereInput[]
    OR?: ts_mesurehistoWhereInput[]
    NOT?: ts_mesurehistoWhereInput | ts_mesurehistoWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesurehisto"> | number
    IdMesure?: IntFilter<"ts_mesurehisto"> | number
    DateHeureMesure?: DateTimeFilter<"ts_mesurehisto"> | Date | string
    Valeur?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Resistance?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Nb_decimal?: IntNullableFilter<"ts_mesurehisto"> | number | null
    Consigne?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Consigne_Sup?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Consigne_Inf?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Unite?: StringNullableFilter<"ts_mesurehisto"> | string | null
    SondeNumeroSerie?: StringNullableFilter<"ts_mesurehisto"> | string | null
    IdLieu?: IntFilter<"ts_mesurehisto"> | number
    ValeurNull?: IntFilter<"ts_mesurehisto"> | number
    Frequence?: IntNullableFilter<"ts_mesurehisto"> | number | null
    Etat_Alarme?: BoolNullableFilter<"ts_mesurehisto"> | boolean | null
    Consigne_Inf_PreAlarme?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Consigne_Sup_PreAlarme?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Moyenne?: FloatNullableFilter<"ts_mesurehisto"> | number | null
  }

  export type ts_mesurehistoOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Resistance?: SortOrderInput | SortOrder
    Nb_decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    SondeNumeroSerie?: SortOrderInput | SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Etat_Alarme?: SortOrderInput | SortOrder
    Consigne_Inf_PreAlarme?: SortOrderInput | SortOrder
    Consigne_Sup_PreAlarme?: SortOrderInput | SortOrder
    Moyenne?: SortOrderInput | SortOrder
    _relevance?: ts_mesurehistoOrderByRelevanceInput
  }

  export type ts_mesurehistoWhereUniqueInput = Prisma.AtLeast<{
    IdServeurBDD_IdMesure_DateHeureMesure_IdLieu_ValeurNull?: ts_mesurehistoIdServeurBDDIdMesureDateHeureMesureIdLieuValeurNullCompoundUniqueInput
    AND?: ts_mesurehistoWhereInput | ts_mesurehistoWhereInput[]
    OR?: ts_mesurehistoWhereInput[]
    NOT?: ts_mesurehistoWhereInput | ts_mesurehistoWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesurehisto"> | number
    IdMesure?: IntFilter<"ts_mesurehisto"> | number
    DateHeureMesure?: DateTimeFilter<"ts_mesurehisto"> | Date | string
    Valeur?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Resistance?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Nb_decimal?: IntNullableFilter<"ts_mesurehisto"> | number | null
    Consigne?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Consigne_Sup?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Consigne_Inf?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Unite?: StringNullableFilter<"ts_mesurehisto"> | string | null
    SondeNumeroSerie?: StringNullableFilter<"ts_mesurehisto"> | string | null
    IdLieu?: IntFilter<"ts_mesurehisto"> | number
    ValeurNull?: IntFilter<"ts_mesurehisto"> | number
    Frequence?: IntNullableFilter<"ts_mesurehisto"> | number | null
    Etat_Alarme?: BoolNullableFilter<"ts_mesurehisto"> | boolean | null
    Consigne_Inf_PreAlarme?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Consigne_Sup_PreAlarme?: FloatNullableFilter<"ts_mesurehisto"> | number | null
    Moyenne?: FloatNullableFilter<"ts_mesurehisto"> | number | null
  }, "IdServeurBDD_IdMesure_DateHeureMesure_IdLieu_ValeurNull">

  export type ts_mesurehistoOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Resistance?: SortOrderInput | SortOrder
    Nb_decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    SondeNumeroSerie?: SortOrderInput | SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Etat_Alarme?: SortOrderInput | SortOrder
    Consigne_Inf_PreAlarme?: SortOrderInput | SortOrder
    Consigne_Sup_PreAlarme?: SortOrderInput | SortOrder
    Moyenne?: SortOrderInput | SortOrder
    _count?: ts_mesurehistoCountOrderByAggregateInput
    _avg?: ts_mesurehistoAvgOrderByAggregateInput
    _max?: ts_mesurehistoMaxOrderByAggregateInput
    _min?: ts_mesurehistoMinOrderByAggregateInput
    _sum?: ts_mesurehistoSumOrderByAggregateInput
  }

  export type ts_mesurehistoScalarWhereWithAggregatesInput = {
    AND?: ts_mesurehistoScalarWhereWithAggregatesInput | ts_mesurehistoScalarWhereWithAggregatesInput[]
    OR?: ts_mesurehistoScalarWhereWithAggregatesInput[]
    NOT?: ts_mesurehistoScalarWhereWithAggregatesInput | ts_mesurehistoScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_mesurehisto"> | number
    IdMesure?: IntWithAggregatesFilter<"ts_mesurehisto"> | number
    DateHeureMesure?: DateTimeWithAggregatesFilter<"ts_mesurehisto"> | Date | string
    Valeur?: FloatNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
    Resistance?: FloatNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
    Nb_decimal?: IntNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
    Consigne?: FloatNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
    Consigne_Sup?: FloatNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
    Consigne_Inf?: FloatNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
    Unite?: StringNullableWithAggregatesFilter<"ts_mesurehisto"> | string | null
    SondeNumeroSerie?: StringNullableWithAggregatesFilter<"ts_mesurehisto"> | string | null
    IdLieu?: IntWithAggregatesFilter<"ts_mesurehisto"> | number
    ValeurNull?: IntWithAggregatesFilter<"ts_mesurehisto"> | number
    Frequence?: IntNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
    Etat_Alarme?: BoolNullableWithAggregatesFilter<"ts_mesurehisto"> | boolean | null
    Consigne_Inf_PreAlarme?: FloatNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
    Consigne_Sup_PreAlarme?: FloatNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
    Moyenne?: FloatNullableWithAggregatesFilter<"ts_mesurehisto"> | number | null
  }

  export type ts_mesuretestWhereInput = {
    AND?: ts_mesuretestWhereInput | ts_mesuretestWhereInput[]
    OR?: ts_mesuretestWhereInput[]
    NOT?: ts_mesuretestWhereInput | ts_mesuretestWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesuretest"> | number
    IdMesureTest?: IntFilter<"ts_mesuretest"> | number
    Resistance?: FloatFilter<"ts_mesuretest"> | number
    SondeNumeroSerie?: StringFilter<"ts_mesuretest"> | string
    ValeurNull?: IntFilter<"ts_mesuretest"> | number
    DateHeure?: DateTimeFilter<"ts_mesuretest"> | Date | string
    NombreTotal?: IntFilter<"ts_mesuretest"> | number
    NombreRecu?: IntFilter<"ts_mesuretest"> | number
  }

  export type ts_mesuretestOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdMesureTest?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
    _relevance?: ts_mesuretestOrderByRelevanceInput
  }

  export type ts_mesuretestWhereUniqueInput = Prisma.AtLeast<{
    SondeNumeroSerie?: string
    IdServeurBDD_IdMesureTest?: ts_mesuretestIdServeurBDDIdMesureTestCompoundUniqueInput
    AND?: ts_mesuretestWhereInput | ts_mesuretestWhereInput[]
    OR?: ts_mesuretestWhereInput[]
    NOT?: ts_mesuretestWhereInput | ts_mesuretestWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesuretest"> | number
    IdMesureTest?: IntFilter<"ts_mesuretest"> | number
    Resistance?: FloatFilter<"ts_mesuretest"> | number
    ValeurNull?: IntFilter<"ts_mesuretest"> | number
    DateHeure?: DateTimeFilter<"ts_mesuretest"> | Date | string
    NombreTotal?: IntFilter<"ts_mesuretest"> | number
    NombreRecu?: IntFilter<"ts_mesuretest"> | number
  }, "IdServeurBDD_IdMesureTest" | "SondeNumeroSerie">

  export type ts_mesuretestOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdMesureTest?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
    _count?: ts_mesuretestCountOrderByAggregateInput
    _avg?: ts_mesuretestAvgOrderByAggregateInput
    _max?: ts_mesuretestMaxOrderByAggregateInput
    _min?: ts_mesuretestMinOrderByAggregateInput
    _sum?: ts_mesuretestSumOrderByAggregateInput
  }

  export type ts_mesuretestScalarWhereWithAggregatesInput = {
    AND?: ts_mesuretestScalarWhereWithAggregatesInput | ts_mesuretestScalarWhereWithAggregatesInput[]
    OR?: ts_mesuretestScalarWhereWithAggregatesInput[]
    NOT?: ts_mesuretestScalarWhereWithAggregatesInput | ts_mesuretestScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_mesuretest"> | number
    IdMesureTest?: IntWithAggregatesFilter<"ts_mesuretest"> | number
    Resistance?: FloatWithAggregatesFilter<"ts_mesuretest"> | number
    SondeNumeroSerie?: StringWithAggregatesFilter<"ts_mesuretest"> | string
    ValeurNull?: IntWithAggregatesFilter<"ts_mesuretest"> | number
    DateHeure?: DateTimeWithAggregatesFilter<"ts_mesuretest"> | Date | string
    NombreTotal?: IntWithAggregatesFilter<"ts_mesuretest"> | number
    NombreRecu?: IntWithAggregatesFilter<"ts_mesuretest"> | number
  }

  export type ts_mesuretestetalonWhereInput = {
    AND?: ts_mesuretestetalonWhereInput | ts_mesuretestetalonWhereInput[]
    OR?: ts_mesuretestetalonWhereInput[]
    NOT?: ts_mesuretestetalonWhereInput | ts_mesuretestetalonWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesuretestetalon"> | number
    IdMesureTestEtalon?: IntFilter<"ts_mesuretestetalon"> | number
    Resistance?: FloatFilter<"ts_mesuretestetalon"> | number
    EtalonNumeroSerie?: StringFilter<"ts_mesuretestetalon"> | string
    ValeurNull?: IntFilter<"ts_mesuretestetalon"> | number
    DateHeure?: DateTimeFilter<"ts_mesuretestetalon"> | Date | string
    NombreTotal?: IntFilter<"ts_mesuretestetalon"> | number
    NombreRecu?: IntFilter<"ts_mesuretestetalon"> | number
  }

  export type ts_mesuretestetalonOrderByWithRelationInput = {
    IdServeurBDD?: SortOrder
    IdMesureTestEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
    _relevance?: ts_mesuretestetalonOrderByRelevanceInput
  }

  export type ts_mesuretestetalonWhereUniqueInput = Prisma.AtLeast<{
    EtalonNumeroSerie?: string
    IdServeurBDD_IdMesureTestEtalon?: ts_mesuretestetalonIdServeurBDDIdMesureTestEtalonCompoundUniqueInput
    AND?: ts_mesuretestetalonWhereInput | ts_mesuretestetalonWhereInput[]
    OR?: ts_mesuretestetalonWhereInput[]
    NOT?: ts_mesuretestetalonWhereInput | ts_mesuretestetalonWhereInput[]
    IdServeurBDD?: IntFilter<"ts_mesuretestetalon"> | number
    IdMesureTestEtalon?: IntFilter<"ts_mesuretestetalon"> | number
    Resistance?: FloatFilter<"ts_mesuretestetalon"> | number
    ValeurNull?: IntFilter<"ts_mesuretestetalon"> | number
    DateHeure?: DateTimeFilter<"ts_mesuretestetalon"> | Date | string
    NombreTotal?: IntFilter<"ts_mesuretestetalon"> | number
    NombreRecu?: IntFilter<"ts_mesuretestetalon"> | number
  }, "IdServeurBDD_IdMesureTestEtalon" | "EtalonNumeroSerie">

  export type ts_mesuretestetalonOrderByWithAggregationInput = {
    IdServeurBDD?: SortOrder
    IdMesureTestEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
    _count?: ts_mesuretestetalonCountOrderByAggregateInput
    _avg?: ts_mesuretestetalonAvgOrderByAggregateInput
    _max?: ts_mesuretestetalonMaxOrderByAggregateInput
    _min?: ts_mesuretestetalonMinOrderByAggregateInput
    _sum?: ts_mesuretestetalonSumOrderByAggregateInput
  }

  export type ts_mesuretestetalonScalarWhereWithAggregatesInput = {
    AND?: ts_mesuretestetalonScalarWhereWithAggregatesInput | ts_mesuretestetalonScalarWhereWithAggregatesInput[]
    OR?: ts_mesuretestetalonScalarWhereWithAggregatesInput[]
    NOT?: ts_mesuretestetalonScalarWhereWithAggregatesInput | ts_mesuretestetalonScalarWhereWithAggregatesInput[]
    IdServeurBDD?: IntWithAggregatesFilter<"ts_mesuretestetalon"> | number
    IdMesureTestEtalon?: IntWithAggregatesFilter<"ts_mesuretestetalon"> | number
    Resistance?: FloatWithAggregatesFilter<"ts_mesuretestetalon"> | number
    EtalonNumeroSerie?: StringWithAggregatesFilter<"ts_mesuretestetalon"> | string
    ValeurNull?: IntWithAggregatesFilter<"ts_mesuretestetalon"> | number
    DateHeure?: DateTimeWithAggregatesFilter<"ts_mesuretestetalon"> | Date | string
    NombreTotal?: IntWithAggregatesFilter<"ts_mesuretestetalon"> | number
    NombreRecu?: IntWithAggregatesFilter<"ts_mesuretestetalon"> | number
  }

  export type ts_modedegradeWhereInput = {
    AND?: ts_modedegradeWhereInput | ts_modedegradeWhereInput[]
    OR?: ts_modedegradeWhereInput[]
    NOT?: ts_modedegradeWhereInput | ts_modedegradeWhereInput[]
    IdModeDegrade?: IntFilter<"ts_modedegrade"> | number
    IdUtilisateur?: IntNullableFilter<"ts_modedegrade"> | number | null
    DateHeureCreation?: DateTimeNullableFilter<"ts_modedegrade"> | Date | string | null
    RequeteSQL?: StringNullableFilter<"ts_modedegrade"> | string | null
    RequeteArchivee?: BoolFilter<"ts_modedegrade"> | boolean
    DateHeureArchive?: DateTimeNullableFilter<"ts_modedegrade"> | Date | string | null
  }

  export type ts_modedegradeOrderByWithRelationInput = {
    IdModeDegrade?: SortOrder
    IdUtilisateur?: SortOrderInput | SortOrder
    DateHeureCreation?: SortOrderInput | SortOrder
    RequeteSQL?: SortOrderInput | SortOrder
    RequeteArchivee?: SortOrder
    DateHeureArchive?: SortOrderInput | SortOrder
    _relevance?: ts_modedegradeOrderByRelevanceInput
  }

  export type ts_modedegradeWhereUniqueInput = Prisma.AtLeast<{
    IdModeDegrade?: number
    AND?: ts_modedegradeWhereInput | ts_modedegradeWhereInput[]
    OR?: ts_modedegradeWhereInput[]
    NOT?: ts_modedegradeWhereInput | ts_modedegradeWhereInput[]
    IdUtilisateur?: IntNullableFilter<"ts_modedegrade"> | number | null
    DateHeureCreation?: DateTimeNullableFilter<"ts_modedegrade"> | Date | string | null
    RequeteSQL?: StringNullableFilter<"ts_modedegrade"> | string | null
    RequeteArchivee?: BoolFilter<"ts_modedegrade"> | boolean
    DateHeureArchive?: DateTimeNullableFilter<"ts_modedegrade"> | Date | string | null
  }, "IdModeDegrade">

  export type ts_modedegradeOrderByWithAggregationInput = {
    IdModeDegrade?: SortOrder
    IdUtilisateur?: SortOrderInput | SortOrder
    DateHeureCreation?: SortOrderInput | SortOrder
    RequeteSQL?: SortOrderInput | SortOrder
    RequeteArchivee?: SortOrder
    DateHeureArchive?: SortOrderInput | SortOrder
    _count?: ts_modedegradeCountOrderByAggregateInput
    _avg?: ts_modedegradeAvgOrderByAggregateInput
    _max?: ts_modedegradeMaxOrderByAggregateInput
    _min?: ts_modedegradeMinOrderByAggregateInput
    _sum?: ts_modedegradeSumOrderByAggregateInput
  }

  export type ts_modedegradeScalarWhereWithAggregatesInput = {
    AND?: ts_modedegradeScalarWhereWithAggregatesInput | ts_modedegradeScalarWhereWithAggregatesInput[]
    OR?: ts_modedegradeScalarWhereWithAggregatesInput[]
    NOT?: ts_modedegradeScalarWhereWithAggregatesInput | ts_modedegradeScalarWhereWithAggregatesInput[]
    IdModeDegrade?: IntWithAggregatesFilter<"ts_modedegrade"> | number
    IdUtilisateur?: IntNullableWithAggregatesFilter<"ts_modedegrade"> | number | null
    DateHeureCreation?: DateTimeNullableWithAggregatesFilter<"ts_modedegrade"> | Date | string | null
    RequeteSQL?: StringNullableWithAggregatesFilter<"ts_modedegrade"> | string | null
    RequeteArchivee?: BoolWithAggregatesFilter<"ts_modedegrade"> | boolean
    DateHeureArchive?: DateTimeNullableWithAggregatesFilter<"ts_modedegrade"> | Date | string | null
  }

  export type ts_parametreWhereInput = {
    AND?: ts_parametreWhereInput | ts_parametreWhereInput[]
    OR?: ts_parametreWhereInput[]
    NOT?: ts_parametreWhereInput | ts_parametreWhereInput[]
    CleParametre?: StringFilter<"ts_parametre"> | string
    ValeurParametre?: StringNullableFilter<"ts_parametre"> | string | null
    GroupeParametre?: StringNullableFilter<"ts_parametre"> | string | null
    CommentaireParametre?: StringNullableFilter<"ts_parametre"> | string | null
  }

  export type ts_parametreOrderByWithRelationInput = {
    CleParametre?: SortOrder
    ValeurParametre?: SortOrderInput | SortOrder
    GroupeParametre?: SortOrderInput | SortOrder
    CommentaireParametre?: SortOrderInput | SortOrder
    _relevance?: ts_parametreOrderByRelevanceInput
  }

  export type ts_parametreWhereUniqueInput = Prisma.AtLeast<{
    CleParametre?: string
    AND?: ts_parametreWhereInput | ts_parametreWhereInput[]
    OR?: ts_parametreWhereInput[]
    NOT?: ts_parametreWhereInput | ts_parametreWhereInput[]
    ValeurParametre?: StringNullableFilter<"ts_parametre"> | string | null
    GroupeParametre?: StringNullableFilter<"ts_parametre"> | string | null
    CommentaireParametre?: StringNullableFilter<"ts_parametre"> | string | null
  }, "CleParametre">

  export type ts_parametreOrderByWithAggregationInput = {
    CleParametre?: SortOrder
    ValeurParametre?: SortOrderInput | SortOrder
    GroupeParametre?: SortOrderInput | SortOrder
    CommentaireParametre?: SortOrderInput | SortOrder
    _count?: ts_parametreCountOrderByAggregateInput
    _max?: ts_parametreMaxOrderByAggregateInput
    _min?: ts_parametreMinOrderByAggregateInput
  }

  export type ts_parametreScalarWhereWithAggregatesInput = {
    AND?: ts_parametreScalarWhereWithAggregatesInput | ts_parametreScalarWhereWithAggregatesInput[]
    OR?: ts_parametreScalarWhereWithAggregatesInput[]
    NOT?: ts_parametreScalarWhereWithAggregatesInput | ts_parametreScalarWhereWithAggregatesInput[]
    CleParametre?: StringWithAggregatesFilter<"ts_parametre"> | string
    ValeurParametre?: StringNullableWithAggregatesFilter<"ts_parametre"> | string | null
    GroupeParametre?: StringNullableWithAggregatesFilter<"ts_parametre"> | string | null
    CommentaireParametre?: StringNullableWithAggregatesFilter<"ts_parametre"> | string | null
  }

  export type ts_compteur_idtableCreateInput = {
    IdServeurBDD: number
    NomTable?: string
    CompteurID: number
  }

  export type ts_compteur_idtableUncheckedCreateInput = {
    IdServeurBDD: number
    NomTable?: string
    CompteurID: number
  }

  export type ts_compteur_idtableUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    NomTable?: StringFieldUpdateOperationsInput | string
    CompteurID?: IntFieldUpdateOperationsInput | number
  }

  export type ts_compteur_idtableUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    NomTable?: StringFieldUpdateOperationsInput | string
    CompteurID?: IntFieldUpdateOperationsInput | number
  }

  export type ts_compteur_idtableCreateManyInput = {
    IdServeurBDD: number
    NomTable?: string
    CompteurID: number
  }

  export type ts_compteur_idtableUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    NomTable?: StringFieldUpdateOperationsInput | string
    CompteurID?: IntFieldUpdateOperationsInput | number
  }

  export type ts_compteur_idtableUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    NomTable?: StringFieldUpdateOperationsInput | string
    CompteurID?: IntFieldUpdateOperationsInput | number
  }

  export type ts_graphiqueCreateInput = {
    IdGraphique?: number
    DateHeureMesure?: Date | string
    Valeur?: number | null
    Resistance?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    SondeNumeroSerie?: string | null
    IdLieu: number
    ValeurNull?: number
    Frequence?: number | null
    Etat_Alarme?: number
    Consigne_Inf_PreAlarme?: number | null
    Consigne_Sup_PreAlarme?: number | null
  }

  export type ts_graphiqueUncheckedCreateInput = {
    IdGraphique?: number
    DateHeureMesure?: Date | string
    Valeur?: number | null
    Resistance?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    SondeNumeroSerie?: string | null
    IdLieu: number
    ValeurNull?: number
    Frequence?: number | null
    Etat_Alarme?: number
    Consigne_Inf_PreAlarme?: number | null
    Consigne_Sup_PreAlarme?: number | null
  }

  export type ts_graphiqueUpdateInput = {
    IdGraphique?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: IntFieldUpdateOperationsInput | number
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_graphiqueUncheckedUpdateInput = {
    IdGraphique?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: IntFieldUpdateOperationsInput | number
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_graphiqueCreateManyInput = {
    IdGraphique?: number
    DateHeureMesure?: Date | string
    Valeur?: number | null
    Resistance?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    SondeNumeroSerie?: string | null
    IdLieu: number
    ValeurNull?: number
    Frequence?: number | null
    Etat_Alarme?: number
    Consigne_Inf_PreAlarme?: number | null
    Consigne_Sup_PreAlarme?: number | null
  }

  export type ts_graphiqueUpdateManyMutationInput = {
    IdGraphique?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: IntFieldUpdateOperationsInput | number
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_graphiqueUncheckedUpdateManyInput = {
    IdGraphique?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: IntFieldUpdateOperationsInput | number
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_journalCreateInput = {
    IdServeurBDD?: number
    IdJournal?: number
    CodeJournal?: string | null
    Commentaire?: string | null
    NomUtilisateur?: string | null
    ProfilUtilisateur?: string | null
    DateHeureJournal?: Date | string | null
    IdLieu?: number | null
    CommentaireUtilisateur?: string | null
  }

  export type ts_journalUncheckedCreateInput = {
    IdServeurBDD?: number
    IdJournal?: number
    CodeJournal?: string | null
    Commentaire?: string | null
    NomUtilisateur?: string | null
    ProfilUtilisateur?: string | null
    DateHeureJournal?: Date | string | null
    IdLieu?: number | null
    CommentaireUtilisateur?: string | null
  }

  export type ts_journalUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdJournal?: IntFieldUpdateOperationsInput | number
    CodeJournal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    NomUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    ProfilUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeureJournal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    IdLieu?: NullableIntFieldUpdateOperationsInput | number | null
    CommentaireUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journalUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdJournal?: IntFieldUpdateOperationsInput | number
    CodeJournal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    NomUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    ProfilUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeureJournal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    IdLieu?: NullableIntFieldUpdateOperationsInput | number | null
    CommentaireUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journalCreateManyInput = {
    IdServeurBDD?: number
    IdJournal?: number
    CodeJournal?: string | null
    Commentaire?: string | null
    NomUtilisateur?: string | null
    ProfilUtilisateur?: string | null
    DateHeureJournal?: Date | string | null
    IdLieu?: number | null
    CommentaireUtilisateur?: string | null
  }

  export type ts_journalUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdJournal?: IntFieldUpdateOperationsInput | number
    CodeJournal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    NomUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    ProfilUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeureJournal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    IdLieu?: NullableIntFieldUpdateOperationsInput | number | null
    CommentaireUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journalUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdJournal?: IntFieldUpdateOperationsInput | number
    CodeJournal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    NomUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    ProfilUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeureJournal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    IdLieu?: NullableIntFieldUpdateOperationsInput | number | null
    CommentaireUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journal_codeCreateInput = {
    CodeJournal: string
    Commentaire?: string | null
  }

  export type ts_journal_codeUncheckedCreateInput = {
    CodeJournal: string
    Commentaire?: string | null
  }

  export type ts_journal_codeUpdateInput = {
    CodeJournal?: StringFieldUpdateOperationsInput | string
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journal_codeUncheckedUpdateInput = {
    CodeJournal?: StringFieldUpdateOperationsInput | string
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journal_codeCreateManyInput = {
    CodeJournal: string
    Commentaire?: string | null
  }

  export type ts_journal_codeUpdateManyMutationInput = {
    CodeJournal?: StringFieldUpdateOperationsInput | string
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journal_codeUncheckedUpdateManyInput = {
    CodeJournal?: StringFieldUpdateOperationsInput | string
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journalhistoCreateInput = {
    IdServeurBDD?: number
    IdJournal?: number
    CodeJournal?: string | null
    Commentaire?: string | null
    NomUtilisateur?: string | null
    ProfilUtilisateur?: string | null
    DateHeureJournal?: Date | string | null
    IdLieu?: number | null
    CommentaireUtilisateur?: string | null
  }

  export type ts_journalhistoUncheckedCreateInput = {
    IdServeurBDD?: number
    IdJournal?: number
    CodeJournal?: string | null
    Commentaire?: string | null
    NomUtilisateur?: string | null
    ProfilUtilisateur?: string | null
    DateHeureJournal?: Date | string | null
    IdLieu?: number | null
    CommentaireUtilisateur?: string | null
  }

  export type ts_journalhistoUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdJournal?: IntFieldUpdateOperationsInput | number
    CodeJournal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    NomUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    ProfilUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeureJournal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    IdLieu?: NullableIntFieldUpdateOperationsInput | number | null
    CommentaireUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journalhistoUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdJournal?: IntFieldUpdateOperationsInput | number
    CodeJournal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    NomUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    ProfilUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeureJournal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    IdLieu?: NullableIntFieldUpdateOperationsInput | number | null
    CommentaireUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journalhistoCreateManyInput = {
    IdServeurBDD?: number
    IdJournal?: number
    CodeJournal?: string | null
    Commentaire?: string | null
    NomUtilisateur?: string | null
    ProfilUtilisateur?: string | null
    DateHeureJournal?: Date | string | null
    IdLieu?: number | null
    CommentaireUtilisateur?: string | null
  }

  export type ts_journalhistoUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdJournal?: IntFieldUpdateOperationsInput | number
    CodeJournal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    NomUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    ProfilUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeureJournal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    IdLieu?: NullableIntFieldUpdateOperationsInput | number | null
    CommentaireUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_journalhistoUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdJournal?: IntFieldUpdateOperationsInput | number
    CodeJournal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    NomUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    ProfilUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeureJournal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    IdLieu?: NullableIntFieldUpdateOperationsInput | number | null
    CommentaireUtilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_logmesuresCreateInput = {
    IdReception?: number | null
    DateHeureMesure?: Date | string
    Valeur?: number | null
    bEstHorsConsignes?: number | null
    bEstEnAlarme?: number | null
    bMarqueur?: number | null
    Details?: string | null
  }

  export type ts_logmesuresUncheckedCreateInput = {
    IdLogMesures?: number
    IdReception?: number | null
    DateHeureMesure?: Date | string
    Valeur?: number | null
    bEstHorsConsignes?: number | null
    bEstEnAlarme?: number | null
    bMarqueur?: number | null
    Details?: string | null
  }

  export type ts_logmesuresUpdateInput = {
    IdReception?: NullableIntFieldUpdateOperationsInput | number | null
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    bEstHorsConsignes?: NullableIntFieldUpdateOperationsInput | number | null
    bEstEnAlarme?: NullableIntFieldUpdateOperationsInput | number | null
    bMarqueur?: NullableIntFieldUpdateOperationsInput | number | null
    Details?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_logmesuresUncheckedUpdateInput = {
    IdLogMesures?: IntFieldUpdateOperationsInput | number
    IdReception?: NullableIntFieldUpdateOperationsInput | number | null
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    bEstHorsConsignes?: NullableIntFieldUpdateOperationsInput | number | null
    bEstEnAlarme?: NullableIntFieldUpdateOperationsInput | number | null
    bMarqueur?: NullableIntFieldUpdateOperationsInput | number | null
    Details?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_logmesuresCreateManyInput = {
    IdLogMesures?: number
    IdReception?: number | null
    DateHeureMesure?: Date | string
    Valeur?: number | null
    bEstHorsConsignes?: number | null
    bEstEnAlarme?: number | null
    bMarqueur?: number | null
    Details?: string | null
  }

  export type ts_logmesuresUpdateManyMutationInput = {
    IdReception?: NullableIntFieldUpdateOperationsInput | number | null
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    bEstHorsConsignes?: NullableIntFieldUpdateOperationsInput | number | null
    bEstEnAlarme?: NullableIntFieldUpdateOperationsInput | number | null
    bMarqueur?: NullableIntFieldUpdateOperationsInput | number | null
    Details?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_logmesuresUncheckedUpdateManyInput = {
    IdLogMesures?: IntFieldUpdateOperationsInput | number
    IdReception?: NullableIntFieldUpdateOperationsInput | number | null
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    bEstHorsConsignes?: NullableIntFieldUpdateOperationsInput | number | null
    bEstEnAlarme?: NullableIntFieldUpdateOperationsInput | number | null
    bMarqueur?: NullableIntFieldUpdateOperationsInput | number | null
    Details?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_mesureCreateInput = {
    IdServeurBDD?: number
    IdMesure?: number
    DateHeureMesure?: Date | string
    Valeur?: number | null
    Resistance?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    SondeNumeroSerie?: string | null
    IdLieu?: number
    ValeurNull?: number
    Frequence?: number | null
    Etat_Alarme?: boolean | null
    Consigne_Inf_PreAlarme?: number | null
    Consigne_Sup_PreAlarme?: number | null
    Moyenne?: number | null
  }

  export type ts_mesureUncheckedCreateInput = {
    IdServeurBDD?: number
    IdMesure?: number
    DateHeureMesure?: Date | string
    Valeur?: number | null
    Resistance?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    SondeNumeroSerie?: string | null
    IdLieu?: number
    ValeurNull?: number
    Frequence?: number | null
    Etat_Alarme?: boolean | null
    Consigne_Inf_PreAlarme?: number | null
    Consigne_Sup_PreAlarme?: number | null
    Moyenne?: number | null
  }

  export type ts_mesureUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesure?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_mesureUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesure?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_mesureCreateManyInput = {
    IdServeurBDD?: number
    IdMesure?: number
    DateHeureMesure?: Date | string
    Valeur?: number | null
    Resistance?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    SondeNumeroSerie?: string | null
    IdLieu?: number
    ValeurNull?: number
    Frequence?: number | null
    Etat_Alarme?: boolean | null
    Consigne_Inf_PreAlarme?: number | null
    Consigne_Sup_PreAlarme?: number | null
    Moyenne?: number | null
  }

  export type ts_mesureUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesure?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_mesureUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesure?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_mesurecalibrageCreateInput = {
    IdServeurBDD?: number
    IdMesureCalibrage?: number
    Valeur?: string
    Resistance?: string
    SondeNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
  }

  export type ts_mesurecalibrageUncheckedCreateInput = {
    IdServeurBDD?: number
    IdMesureCalibrage?: number
    Valeur?: string
    Resistance?: string
    SondeNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
  }

  export type ts_mesurecalibrageUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureCalibrage?: IntFieldUpdateOperationsInput | number
    Valeur?: StringFieldUpdateOperationsInput | string
    Resistance?: StringFieldUpdateOperationsInput | string
    SondeNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ts_mesurecalibrageUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureCalibrage?: IntFieldUpdateOperationsInput | number
    Valeur?: StringFieldUpdateOperationsInput | string
    Resistance?: StringFieldUpdateOperationsInput | string
    SondeNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ts_mesurecalibrageCreateManyInput = {
    IdServeurBDD?: number
    IdMesureCalibrage?: number
    Valeur?: string
    Resistance?: string
    SondeNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
  }

  export type ts_mesurecalibrageUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureCalibrage?: IntFieldUpdateOperationsInput | number
    Valeur?: StringFieldUpdateOperationsInput | string
    Resistance?: StringFieldUpdateOperationsInput | string
    SondeNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ts_mesurecalibrageUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureCalibrage?: IntFieldUpdateOperationsInput | number
    Valeur?: StringFieldUpdateOperationsInput | string
    Resistance?: StringFieldUpdateOperationsInput | string
    SondeNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ts_mesurecalibrageetalonCreateInput = {
    IdServeurBDD?: number
    IdMesureCalibrageEtalon?: number
    Valeur?: string
    Resistance?: string
    EtalonNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
  }

  export type ts_mesurecalibrageetalonUncheckedCreateInput = {
    IdServeurBDD?: number
    IdMesureCalibrageEtalon?: number
    Valeur?: string
    Resistance?: string
    EtalonNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
  }

  export type ts_mesurecalibrageetalonUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureCalibrageEtalon?: IntFieldUpdateOperationsInput | number
    Valeur?: StringFieldUpdateOperationsInput | string
    Resistance?: StringFieldUpdateOperationsInput | string
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ts_mesurecalibrageetalonUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureCalibrageEtalon?: IntFieldUpdateOperationsInput | number
    Valeur?: StringFieldUpdateOperationsInput | string
    Resistance?: StringFieldUpdateOperationsInput | string
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ts_mesurecalibrageetalonCreateManyInput = {
    IdServeurBDD?: number
    IdMesureCalibrageEtalon?: number
    Valeur?: string
    Resistance?: string
    EtalonNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
  }

  export type ts_mesurecalibrageetalonUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureCalibrageEtalon?: IntFieldUpdateOperationsInput | number
    Valeur?: StringFieldUpdateOperationsInput | string
    Resistance?: StringFieldUpdateOperationsInput | string
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ts_mesurecalibrageetalonUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureCalibrageEtalon?: IntFieldUpdateOperationsInput | number
    Valeur?: StringFieldUpdateOperationsInput | string
    Resistance?: StringFieldUpdateOperationsInput | string
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ts_mesureetalonCreateInput = {
    IdServeurBDD?: number
    IdMesureEtalon?: number
    Resistance: number
    EtalonNumeroSerie?: string
    ValeurNull: number
    DateHeure: Date | string
    Message_Erreur?: string
  }

  export type ts_mesureetalonUncheckedCreateInput = {
    IdServeurBDD?: number
    IdMesureEtalon?: number
    Resistance: number
    EtalonNumeroSerie?: string
    ValeurNull: number
    DateHeure: Date | string
    Message_Erreur?: string
  }

  export type ts_mesureetalonUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureEtalon?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    Message_Erreur?: StringFieldUpdateOperationsInput | string
  }

  export type ts_mesureetalonUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureEtalon?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    Message_Erreur?: StringFieldUpdateOperationsInput | string
  }

  export type ts_mesureetalonCreateManyInput = {
    IdServeurBDD?: number
    IdMesureEtalon?: number
    Resistance: number
    EtalonNumeroSerie?: string
    ValeurNull: number
    DateHeure: Date | string
    Message_Erreur?: string
  }

  export type ts_mesureetalonUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureEtalon?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    Message_Erreur?: StringFieldUpdateOperationsInput | string
  }

  export type ts_mesureetalonUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureEtalon?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    Message_Erreur?: StringFieldUpdateOperationsInput | string
  }

  export type ts_mesureetalonnageCreateInput = {
    IdServeurBDD?: number
    IdMesureEtalonnage?: number
    SondeNumeroserie?: string | null
    NumeroOrdre?: number | null
    MesureSonde?: string | null
    MesureEtalon?: string | null
    DateHeure?: Date | string | null
  }

  export type ts_mesureetalonnageUncheckedCreateInput = {
    IdServeurBDD?: number
    IdMesureEtalonnage?: number
    SondeNumeroserie?: string | null
    NumeroOrdre?: number | null
    MesureSonde?: string | null
    MesureEtalon?: string | null
    DateHeure?: Date | string | null
  }

  export type ts_mesureetalonnageUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureEtalonnage?: IntFieldUpdateOperationsInput | number
    SondeNumeroserie?: NullableStringFieldUpdateOperationsInput | string | null
    NumeroOrdre?: NullableIntFieldUpdateOperationsInput | number | null
    MesureSonde?: NullableStringFieldUpdateOperationsInput | string | null
    MesureEtalon?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeure?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ts_mesureetalonnageUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureEtalonnage?: IntFieldUpdateOperationsInput | number
    SondeNumeroserie?: NullableStringFieldUpdateOperationsInput | string | null
    NumeroOrdre?: NullableIntFieldUpdateOperationsInput | number | null
    MesureSonde?: NullableStringFieldUpdateOperationsInput | string | null
    MesureEtalon?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeure?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ts_mesureetalonnageCreateManyInput = {
    IdServeurBDD?: number
    IdMesureEtalonnage?: number
    SondeNumeroserie?: string | null
    NumeroOrdre?: number | null
    MesureSonde?: string | null
    MesureEtalon?: string | null
    DateHeure?: Date | string | null
  }

  export type ts_mesureetalonnageUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureEtalonnage?: IntFieldUpdateOperationsInput | number
    SondeNumeroserie?: NullableStringFieldUpdateOperationsInput | string | null
    NumeroOrdre?: NullableIntFieldUpdateOperationsInput | number | null
    MesureSonde?: NullableStringFieldUpdateOperationsInput | string | null
    MesureEtalon?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeure?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ts_mesureetalonnageUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureEtalonnage?: IntFieldUpdateOperationsInput | number
    SondeNumeroserie?: NullableStringFieldUpdateOperationsInput | string | null
    NumeroOrdre?: NullableIntFieldUpdateOperationsInput | number | null
    MesureSonde?: NullableStringFieldUpdateOperationsInput | string | null
    MesureEtalon?: NullableStringFieldUpdateOperationsInput | string | null
    DateHeure?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ts_mesurehistoCreateInput = {
    IdServeurBDD?: number
    IdMesure?: number
    DateHeureMesure?: Date | string
    Valeur?: number | null
    Resistance?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    SondeNumeroSerie?: string | null
    IdLieu?: number
    ValeurNull?: number
    Frequence?: number | null
    Etat_Alarme?: boolean | null
    Consigne_Inf_PreAlarme?: number | null
    Consigne_Sup_PreAlarme?: number | null
    Moyenne?: number | null
  }

  export type ts_mesurehistoUncheckedCreateInput = {
    IdServeurBDD?: number
    IdMesure?: number
    DateHeureMesure?: Date | string
    Valeur?: number | null
    Resistance?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    SondeNumeroSerie?: string | null
    IdLieu?: number
    ValeurNull?: number
    Frequence?: number | null
    Etat_Alarme?: boolean | null
    Consigne_Inf_PreAlarme?: number | null
    Consigne_Sup_PreAlarme?: number | null
    Moyenne?: number | null
  }

  export type ts_mesurehistoUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesure?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_mesurehistoUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesure?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_mesurehistoCreateManyInput = {
    IdServeurBDD?: number
    IdMesure?: number
    DateHeureMesure?: Date | string
    Valeur?: number | null
    Resistance?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    SondeNumeroSerie?: string | null
    IdLieu?: number
    ValeurNull?: number
    Frequence?: number | null
    Etat_Alarme?: boolean | null
    Consigne_Inf_PreAlarme?: number | null
    Consigne_Sup_PreAlarme?: number | null
    Moyenne?: number | null
  }

  export type ts_mesurehistoUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesure?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_mesurehistoUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesure?: IntFieldUpdateOperationsInput | number
    DateHeureMesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Resistance?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    SondeNumeroSerie?: NullableStringFieldUpdateOperationsInput | string | null
    IdLieu?: IntFieldUpdateOperationsInput | number
    ValeurNull?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Etat_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_PreAlarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type ts_mesuretestCreateInput = {
    IdServeurBDD?: number
    IdMesureTest?: number
    Resistance: number
    SondeNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
    NombreTotal?: number
    NombreRecu?: number
  }

  export type ts_mesuretestUncheckedCreateInput = {
    IdServeurBDD?: number
    IdMesureTest?: number
    Resistance: number
    SondeNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
    NombreTotal?: number
    NombreRecu?: number
  }

  export type ts_mesuretestUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureTest?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    SondeNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    NombreTotal?: IntFieldUpdateOperationsInput | number
    NombreRecu?: IntFieldUpdateOperationsInput | number
  }

  export type ts_mesuretestUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureTest?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    SondeNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    NombreTotal?: IntFieldUpdateOperationsInput | number
    NombreRecu?: IntFieldUpdateOperationsInput | number
  }

  export type ts_mesuretestCreateManyInput = {
    IdServeurBDD?: number
    IdMesureTest?: number
    Resistance: number
    SondeNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
    NombreTotal?: number
    NombreRecu?: number
  }

  export type ts_mesuretestUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureTest?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    SondeNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    NombreTotal?: IntFieldUpdateOperationsInput | number
    NombreRecu?: IntFieldUpdateOperationsInput | number
  }

  export type ts_mesuretestUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureTest?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    SondeNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    NombreTotal?: IntFieldUpdateOperationsInput | number
    NombreRecu?: IntFieldUpdateOperationsInput | number
  }

  export type ts_mesuretestetalonCreateInput = {
    IdServeurBDD?: number
    IdMesureTestEtalon?: number
    Resistance: number
    EtalonNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
    NombreTotal?: number
    NombreRecu?: number
  }

  export type ts_mesuretestetalonUncheckedCreateInput = {
    IdServeurBDD?: number
    IdMesureTestEtalon?: number
    Resistance: number
    EtalonNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
    NombreTotal?: number
    NombreRecu?: number
  }

  export type ts_mesuretestetalonUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureTestEtalon?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    NombreTotal?: IntFieldUpdateOperationsInput | number
    NombreRecu?: IntFieldUpdateOperationsInput | number
  }

  export type ts_mesuretestetalonUncheckedUpdateInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureTestEtalon?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    NombreTotal?: IntFieldUpdateOperationsInput | number
    NombreRecu?: IntFieldUpdateOperationsInput | number
  }

  export type ts_mesuretestetalonCreateManyInput = {
    IdServeurBDD?: number
    IdMesureTestEtalon?: number
    Resistance: number
    EtalonNumeroSerie?: string
    ValeurNull: number
    DateHeure?: Date | string
    NombreTotal?: number
    NombreRecu?: number
  }

  export type ts_mesuretestetalonUpdateManyMutationInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureTestEtalon?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    NombreTotal?: IntFieldUpdateOperationsInput | number
    NombreRecu?: IntFieldUpdateOperationsInput | number
  }

  export type ts_mesuretestetalonUncheckedUpdateManyInput = {
    IdServeurBDD?: IntFieldUpdateOperationsInput | number
    IdMesureTestEtalon?: IntFieldUpdateOperationsInput | number
    Resistance?: FloatFieldUpdateOperationsInput | number
    EtalonNumeroSerie?: StringFieldUpdateOperationsInput | string
    ValeurNull?: IntFieldUpdateOperationsInput | number
    DateHeure?: DateTimeFieldUpdateOperationsInput | Date | string
    NombreTotal?: IntFieldUpdateOperationsInput | number
    NombreRecu?: IntFieldUpdateOperationsInput | number
  }

  export type ts_modedegradeCreateInput = {
    IdModeDegrade?: number
    IdUtilisateur?: number | null
    DateHeureCreation?: Date | string | null
    RequeteSQL?: string | null
    RequeteArchivee?: boolean
    DateHeureArchive?: Date | string | null
  }

  export type ts_modedegradeUncheckedCreateInput = {
    IdModeDegrade?: number
    IdUtilisateur?: number | null
    DateHeureCreation?: Date | string | null
    RequeteSQL?: string | null
    RequeteArchivee?: boolean
    DateHeureArchive?: Date | string | null
  }

  export type ts_modedegradeUpdateInput = {
    IdModeDegrade?: IntFieldUpdateOperationsInput | number
    IdUtilisateur?: NullableIntFieldUpdateOperationsInput | number | null
    DateHeureCreation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    RequeteSQL?: NullableStringFieldUpdateOperationsInput | string | null
    RequeteArchivee?: BoolFieldUpdateOperationsInput | boolean
    DateHeureArchive?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ts_modedegradeUncheckedUpdateInput = {
    IdModeDegrade?: IntFieldUpdateOperationsInput | number
    IdUtilisateur?: NullableIntFieldUpdateOperationsInput | number | null
    DateHeureCreation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    RequeteSQL?: NullableStringFieldUpdateOperationsInput | string | null
    RequeteArchivee?: BoolFieldUpdateOperationsInput | boolean
    DateHeureArchive?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ts_modedegradeCreateManyInput = {
    IdModeDegrade?: number
    IdUtilisateur?: number | null
    DateHeureCreation?: Date | string | null
    RequeteSQL?: string | null
    RequeteArchivee?: boolean
    DateHeureArchive?: Date | string | null
  }

  export type ts_modedegradeUpdateManyMutationInput = {
    IdModeDegrade?: IntFieldUpdateOperationsInput | number
    IdUtilisateur?: NullableIntFieldUpdateOperationsInput | number | null
    DateHeureCreation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    RequeteSQL?: NullableStringFieldUpdateOperationsInput | string | null
    RequeteArchivee?: BoolFieldUpdateOperationsInput | boolean
    DateHeureArchive?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ts_modedegradeUncheckedUpdateManyInput = {
    IdModeDegrade?: IntFieldUpdateOperationsInput | number
    IdUtilisateur?: NullableIntFieldUpdateOperationsInput | number | null
    DateHeureCreation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    RequeteSQL?: NullableStringFieldUpdateOperationsInput | string | null
    RequeteArchivee?: BoolFieldUpdateOperationsInput | boolean
    DateHeureArchive?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type ts_parametreCreateInput = {
    CleParametre?: string
    ValeurParametre?: string | null
    GroupeParametre?: string | null
    CommentaireParametre?: string | null
  }

  export type ts_parametreUncheckedCreateInput = {
    CleParametre?: string
    ValeurParametre?: string | null
    GroupeParametre?: string | null
    CommentaireParametre?: string | null
  }

  export type ts_parametreUpdateInput = {
    CleParametre?: StringFieldUpdateOperationsInput | string
    ValeurParametre?: NullableStringFieldUpdateOperationsInput | string | null
    GroupeParametre?: NullableStringFieldUpdateOperationsInput | string | null
    CommentaireParametre?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_parametreUncheckedUpdateInput = {
    CleParametre?: StringFieldUpdateOperationsInput | string
    ValeurParametre?: NullableStringFieldUpdateOperationsInput | string | null
    GroupeParametre?: NullableStringFieldUpdateOperationsInput | string | null
    CommentaireParametre?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_parametreCreateManyInput = {
    CleParametre?: string
    ValeurParametre?: string | null
    GroupeParametre?: string | null
    CommentaireParametre?: string | null
  }

  export type ts_parametreUpdateManyMutationInput = {
    CleParametre?: StringFieldUpdateOperationsInput | string
    ValeurParametre?: NullableStringFieldUpdateOperationsInput | string | null
    GroupeParametre?: NullableStringFieldUpdateOperationsInput | string | null
    CommentaireParametre?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ts_parametreUncheckedUpdateManyInput = {
    CleParametre?: StringFieldUpdateOperationsInput | string
    ValeurParametre?: NullableStringFieldUpdateOperationsInput | string | null
    GroupeParametre?: NullableStringFieldUpdateOperationsInput | string | null
    CommentaireParametre?: NullableStringFieldUpdateOperationsInput | string | null
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

  export type ts_compteur_idtableOrderByRelevanceInput = {
    fields: ts_compteur_idtableOrderByRelevanceFieldEnum | ts_compteur_idtableOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_compteur_idtableIdServeurBDDNomTableCompoundUniqueInput = {
    IdServeurBDD: number
    NomTable: string
  }

  export type ts_compteur_idtableCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    NomTable?: SortOrder
    CompteurID?: SortOrder
  }

  export type ts_compteur_idtableAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    CompteurID?: SortOrder
  }

  export type ts_compteur_idtableMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    NomTable?: SortOrder
    CompteurID?: SortOrder
  }

  export type ts_compteur_idtableMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    NomTable?: SortOrder
    CompteurID?: SortOrder
  }

  export type ts_compteur_idtableSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    CompteurID?: SortOrder
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

  export type FloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
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

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ts_graphiqueOrderByRelevanceInput = {
    fields: ts_graphiqueOrderByRelevanceFieldEnum | ts_graphiqueOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_graphiqueIdGraphiqueDateHeureMesureIdLieuValeurNullEtat_AlarmeCompoundUniqueInput = {
    IdGraphique: number
    DateHeureMesure: Date | string
    IdLieu: number
    ValeurNull: number
    Etat_Alarme: number
  }

  export type ts_graphiqueCountOrderByAggregateInput = {
    IdGraphique?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    SondeNumeroSerie?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
  }

  export type ts_graphiqueAvgOrderByAggregateInput = {
    IdGraphique?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
  }

  export type ts_graphiqueMaxOrderByAggregateInput = {
    IdGraphique?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    SondeNumeroSerie?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
  }

  export type ts_graphiqueMinOrderByAggregateInput = {
    IdGraphique?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    SondeNumeroSerie?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
  }

  export type ts_graphiqueSumOrderByAggregateInput = {
    IdGraphique?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
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

  export type FloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
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

  export type ts_journalOrderByRelevanceInput = {
    fields: ts_journalOrderByRelevanceFieldEnum | ts_journalOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_journalIdServeurBDDIdJournalCompoundUniqueInput = {
    IdServeurBDD: number
    IdJournal: number
  }

  export type ts_journalCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrder
    Commentaire?: SortOrder
    NomUtilisateur?: SortOrder
    ProfilUtilisateur?: SortOrder
    DateHeureJournal?: SortOrder
    IdLieu?: SortOrder
    CommentaireUtilisateur?: SortOrder
  }

  export type ts_journalAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    IdLieu?: SortOrder
  }

  export type ts_journalMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrder
    Commentaire?: SortOrder
    NomUtilisateur?: SortOrder
    ProfilUtilisateur?: SortOrder
    DateHeureJournal?: SortOrder
    IdLieu?: SortOrder
    CommentaireUtilisateur?: SortOrder
  }

  export type ts_journalMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrder
    Commentaire?: SortOrder
    NomUtilisateur?: SortOrder
    ProfilUtilisateur?: SortOrder
    DateHeureJournal?: SortOrder
    IdLieu?: SortOrder
    CommentaireUtilisateur?: SortOrder
  }

  export type ts_journalSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    IdLieu?: SortOrder
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

  export type ts_journal_codeOrderByRelevanceInput = {
    fields: ts_journal_codeOrderByRelevanceFieldEnum | ts_journal_codeOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_journal_codeCountOrderByAggregateInput = {
    CodeJournal?: SortOrder
    Commentaire?: SortOrder
  }

  export type ts_journal_codeMaxOrderByAggregateInput = {
    CodeJournal?: SortOrder
    Commentaire?: SortOrder
  }

  export type ts_journal_codeMinOrderByAggregateInput = {
    CodeJournal?: SortOrder
    Commentaire?: SortOrder
  }

  export type ts_journalhistoOrderByRelevanceInput = {
    fields: ts_journalhistoOrderByRelevanceFieldEnum | ts_journalhistoOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_journalhistoIdServeurBDDIdJournalCompoundUniqueInput = {
    IdServeurBDD: number
    IdJournal: number
  }

  export type ts_journalhistoCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrder
    Commentaire?: SortOrder
    NomUtilisateur?: SortOrder
    ProfilUtilisateur?: SortOrder
    DateHeureJournal?: SortOrder
    IdLieu?: SortOrder
    CommentaireUtilisateur?: SortOrder
  }

  export type ts_journalhistoAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    IdLieu?: SortOrder
  }

  export type ts_journalhistoMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrder
    Commentaire?: SortOrder
    NomUtilisateur?: SortOrder
    ProfilUtilisateur?: SortOrder
    DateHeureJournal?: SortOrder
    IdLieu?: SortOrder
    CommentaireUtilisateur?: SortOrder
  }

  export type ts_journalhistoMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    CodeJournal?: SortOrder
    Commentaire?: SortOrder
    NomUtilisateur?: SortOrder
    ProfilUtilisateur?: SortOrder
    DateHeureJournal?: SortOrder
    IdLieu?: SortOrder
    CommentaireUtilisateur?: SortOrder
  }

  export type ts_journalhistoSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdJournal?: SortOrder
    IdLieu?: SortOrder
  }

  export type ts_logmesuresOrderByRelevanceInput = {
    fields: ts_logmesuresOrderByRelevanceFieldEnum | ts_logmesuresOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_logmesuresCountOrderByAggregateInput = {
    IdLogMesures?: SortOrder
    IdReception?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    bEstHorsConsignes?: SortOrder
    bEstEnAlarme?: SortOrder
    bMarqueur?: SortOrder
    Details?: SortOrder
  }

  export type ts_logmesuresAvgOrderByAggregateInput = {
    IdLogMesures?: SortOrder
    IdReception?: SortOrder
    Valeur?: SortOrder
    bEstHorsConsignes?: SortOrder
    bEstEnAlarme?: SortOrder
    bMarqueur?: SortOrder
  }

  export type ts_logmesuresMaxOrderByAggregateInput = {
    IdLogMesures?: SortOrder
    IdReception?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    bEstHorsConsignes?: SortOrder
    bEstEnAlarme?: SortOrder
    bMarqueur?: SortOrder
    Details?: SortOrder
  }

  export type ts_logmesuresMinOrderByAggregateInput = {
    IdLogMesures?: SortOrder
    IdReception?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    bEstHorsConsignes?: SortOrder
    bEstEnAlarme?: SortOrder
    bMarqueur?: SortOrder
    Details?: SortOrder
  }

  export type ts_logmesuresSumOrderByAggregateInput = {
    IdLogMesures?: SortOrder
    IdReception?: SortOrder
    Valeur?: SortOrder
    bEstHorsConsignes?: SortOrder
    bEstEnAlarme?: SortOrder
    bMarqueur?: SortOrder
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type ts_mesureOrderByRelevanceInput = {
    fields: ts_mesureOrderByRelevanceFieldEnum | ts_mesureOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_mesureIdServeurBDDIdMesureDateHeureMesureIdLieuValeurNullCompoundUniqueInput = {
    IdServeurBDD: number
    IdMesure: number
    DateHeureMesure: Date | string
    IdLieu: number
    ValeurNull: number
  }

  export type ts_mesureCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    SondeNumeroSerie?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type ts_mesureAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type ts_mesureMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    SondeNumeroSerie?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type ts_mesureMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    SondeNumeroSerie?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type ts_mesureSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type ts_mesurecalibrageOrderByRelevanceInput = {
    fields: ts_mesurecalibrageOrderByRelevanceFieldEnum | ts_mesurecalibrageOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_mesurecalibrageIdServeurBDDIdMesureCalibrageCompoundUniqueInput = {
    IdServeurBDD: number
    IdMesureCalibrage: number
  }

  export type ts_mesurecalibrageCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrage?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
  }

  export type ts_mesurecalibrageAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrage?: SortOrder
    ValeurNull?: SortOrder
  }

  export type ts_mesurecalibrageMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrage?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
  }

  export type ts_mesurecalibrageMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrage?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
  }

  export type ts_mesurecalibrageSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrage?: SortOrder
    ValeurNull?: SortOrder
  }

  export type ts_mesurecalibrageetalonOrderByRelevanceInput = {
    fields: ts_mesurecalibrageetalonOrderByRelevanceFieldEnum | ts_mesurecalibrageetalonOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_mesurecalibrageetalonIdServeurBDDIdMesureCalibrageEtalonCompoundUniqueInput = {
    IdServeurBDD: number
    IdMesureCalibrageEtalon: number
  }

  export type ts_mesurecalibrageetalonCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrageEtalon?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
  }

  export type ts_mesurecalibrageetalonAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrageEtalon?: SortOrder
    ValeurNull?: SortOrder
  }

  export type ts_mesurecalibrageetalonMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrageEtalon?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
  }

  export type ts_mesurecalibrageetalonMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrageEtalon?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
  }

  export type ts_mesurecalibrageetalonSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureCalibrageEtalon?: SortOrder
    ValeurNull?: SortOrder
  }

  export type FloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type ts_mesureetalonOrderByRelevanceInput = {
    fields: ts_mesureetalonOrderByRelevanceFieldEnum | ts_mesureetalonOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_mesureetalonIdServeurBDDIdMesureEtalonCompoundUniqueInput = {
    IdServeurBDD: number
    IdMesureEtalon: number
  }

  export type ts_mesureetalonCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    Message_Erreur?: SortOrder
  }

  export type ts_mesureetalonAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalon?: SortOrder
    Resistance?: SortOrder
    ValeurNull?: SortOrder
  }

  export type ts_mesureetalonMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    Message_Erreur?: SortOrder
  }

  export type ts_mesureetalonMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    Message_Erreur?: SortOrder
  }

  export type ts_mesureetalonSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalon?: SortOrder
    Resistance?: SortOrder
    ValeurNull?: SortOrder
  }

  export type FloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type ts_mesureetalonnageOrderByRelevanceInput = {
    fields: ts_mesureetalonnageOrderByRelevanceFieldEnum | ts_mesureetalonnageOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_mesureetalonnageIdServeurBDDIdMesureEtalonnageCompoundUniqueInput = {
    IdServeurBDD: number
    IdMesureEtalonnage: number
  }

  export type ts_mesureetalonnageCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalonnage?: SortOrder
    SondeNumeroserie?: SortOrder
    NumeroOrdre?: SortOrder
    MesureSonde?: SortOrder
    MesureEtalon?: SortOrder
    DateHeure?: SortOrder
  }

  export type ts_mesureetalonnageAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalonnage?: SortOrder
    NumeroOrdre?: SortOrder
  }

  export type ts_mesureetalonnageMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalonnage?: SortOrder
    SondeNumeroserie?: SortOrder
    NumeroOrdre?: SortOrder
    MesureSonde?: SortOrder
    MesureEtalon?: SortOrder
    DateHeure?: SortOrder
  }

  export type ts_mesureetalonnageMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalonnage?: SortOrder
    SondeNumeroserie?: SortOrder
    NumeroOrdre?: SortOrder
    MesureSonde?: SortOrder
    MesureEtalon?: SortOrder
    DateHeure?: SortOrder
  }

  export type ts_mesureetalonnageSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureEtalonnage?: SortOrder
    NumeroOrdre?: SortOrder
  }

  export type ts_mesurehistoOrderByRelevanceInput = {
    fields: ts_mesurehistoOrderByRelevanceFieldEnum | ts_mesurehistoOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_mesurehistoIdServeurBDDIdMesureDateHeureMesureIdLieuValeurNullCompoundUniqueInput = {
    IdServeurBDD: number
    IdMesure: number
    DateHeureMesure: Date | string
    IdLieu: number
    ValeurNull: number
  }

  export type ts_mesurehistoCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    SondeNumeroSerie?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type ts_mesurehistoAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type ts_mesurehistoMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    SondeNumeroSerie?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type ts_mesurehistoMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    DateHeureMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    SondeNumeroSerie?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Etat_Alarme?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type ts_mesurehistoSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesure?: SortOrder
    Valeur?: SortOrder
    Resistance?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    IdLieu?: SortOrder
    ValeurNull?: SortOrder
    Frequence?: SortOrder
    Consigne_Inf_PreAlarme?: SortOrder
    Consigne_Sup_PreAlarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type ts_mesuretestOrderByRelevanceInput = {
    fields: ts_mesuretestOrderByRelevanceFieldEnum | ts_mesuretestOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_mesuretestIdServeurBDDIdMesureTestCompoundUniqueInput = {
    IdServeurBDD: number
    IdMesureTest: number
  }

  export type ts_mesuretestCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTest?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type ts_mesuretestAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTest?: SortOrder
    Resistance?: SortOrder
    ValeurNull?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type ts_mesuretestMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTest?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type ts_mesuretestMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTest?: SortOrder
    Resistance?: SortOrder
    SondeNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type ts_mesuretestSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTest?: SortOrder
    Resistance?: SortOrder
    ValeurNull?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type ts_mesuretestetalonOrderByRelevanceInput = {
    fields: ts_mesuretestetalonOrderByRelevanceFieldEnum | ts_mesuretestetalonOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_mesuretestetalonIdServeurBDDIdMesureTestEtalonCompoundUniqueInput = {
    IdServeurBDD: number
    IdMesureTestEtalon: number
  }

  export type ts_mesuretestetalonCountOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTestEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type ts_mesuretestetalonAvgOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTestEtalon?: SortOrder
    Resistance?: SortOrder
    ValeurNull?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type ts_mesuretestetalonMaxOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTestEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type ts_mesuretestetalonMinOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTestEtalon?: SortOrder
    Resistance?: SortOrder
    EtalonNumeroSerie?: SortOrder
    ValeurNull?: SortOrder
    DateHeure?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type ts_mesuretestetalonSumOrderByAggregateInput = {
    IdServeurBDD?: SortOrder
    IdMesureTestEtalon?: SortOrder
    Resistance?: SortOrder
    ValeurNull?: SortOrder
    NombreTotal?: SortOrder
    NombreRecu?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type ts_modedegradeOrderByRelevanceInput = {
    fields: ts_modedegradeOrderByRelevanceFieldEnum | ts_modedegradeOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_modedegradeCountOrderByAggregateInput = {
    IdModeDegrade?: SortOrder
    IdUtilisateur?: SortOrder
    DateHeureCreation?: SortOrder
    RequeteSQL?: SortOrder
    RequeteArchivee?: SortOrder
    DateHeureArchive?: SortOrder
  }

  export type ts_modedegradeAvgOrderByAggregateInput = {
    IdModeDegrade?: SortOrder
    IdUtilisateur?: SortOrder
  }

  export type ts_modedegradeMaxOrderByAggregateInput = {
    IdModeDegrade?: SortOrder
    IdUtilisateur?: SortOrder
    DateHeureCreation?: SortOrder
    RequeteSQL?: SortOrder
    RequeteArchivee?: SortOrder
    DateHeureArchive?: SortOrder
  }

  export type ts_modedegradeMinOrderByAggregateInput = {
    IdModeDegrade?: SortOrder
    IdUtilisateur?: SortOrder
    DateHeureCreation?: SortOrder
    RequeteSQL?: SortOrder
    RequeteArchivee?: SortOrder
    DateHeureArchive?: SortOrder
  }

  export type ts_modedegradeSumOrderByAggregateInput = {
    IdModeDegrade?: SortOrder
    IdUtilisateur?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ts_parametreOrderByRelevanceInput = {
    fields: ts_parametreOrderByRelevanceFieldEnum | ts_parametreOrderByRelevanceFieldEnum[]
    sort: SortOrder
    search: string
  }

  export type ts_parametreCountOrderByAggregateInput = {
    CleParametre?: SortOrder
    ValeurParametre?: SortOrder
    GroupeParametre?: SortOrder
    CommentaireParametre?: SortOrder
  }

  export type ts_parametreMaxOrderByAggregateInput = {
    CleParametre?: SortOrder
    ValeurParametre?: SortOrder
    GroupeParametre?: SortOrder
    CommentaireParametre?: SortOrder
  }

  export type ts_parametreMinOrderByAggregateInput = {
    CleParametre?: SortOrder
    ValeurParametre?: SortOrder
    GroupeParametre?: SortOrder
    CommentaireParametre?: SortOrder
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableFloatFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
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

  export type NestedFloatNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | null
    notIn?: number[] | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedFloatNullableFilter<$PrismaModel>
    _min?: NestedFloatNullableFilter<$PrismaModel>
    _max?: NestedFloatNullableFilter<$PrismaModel>
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

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedFloatWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[]
    notIn?: number[]
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedFloatFilter<$PrismaModel>
    _min?: NestedFloatFilter<$PrismaModel>
    _max?: NestedFloatFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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