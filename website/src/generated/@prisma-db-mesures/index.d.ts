
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
 * Model tm_graphique
 * 
 */
export type tm_graphique = $Result.DefaultSelection<Prisma.$tm_graphiquePayload>
/**
 * Model tm_journal
 * 
 */
export type tm_journal = $Result.DefaultSelection<Prisma.$tm_journalPayload>
/**
 * Model tm_journal_code
 * 
 */
export type tm_journal_code = $Result.DefaultSelection<Prisma.$tm_journal_codePayload>
/**
 * Model tm_compteur_id_table
 * 
 */
export type tm_compteur_id_table = $Result.DefaultSelection<Prisma.$tm_compteur_id_tablePayload>
/**
 * Model tm_mesures
 * 
 */
export type tm_mesures = $Result.DefaultSelection<Prisma.$tm_mesuresPayload>
/**
 * Model tm_mesures_gso
 * 
 */
export type tm_mesures_gso = $Result.DefaultSelection<Prisma.$tm_mesures_gsoPayload>
/**
 * Model tm_journal_histo
 * 
 */
export type tm_journal_histo = $Result.DefaultSelection<Prisma.$tm_journal_histoPayload>
/**
 * Model tm_mesure_calibrage
 * 
 */
export type tm_mesure_calibrage = $Result.DefaultSelection<Prisma.$tm_mesure_calibragePayload>
/**
 * Model tm_mesure_calibrage_etalon
 * 
 */
export type tm_mesure_calibrage_etalon = $Result.DefaultSelection<Prisma.$tm_mesure_calibrage_etalonPayload>
/**
 * Model tm_mesure_etalon
 * Mesures brutes remontees par un etalon (reference etalon).
 */
export type tm_mesure_etalon = $Result.DefaultSelection<Prisma.$tm_mesure_etalonPayload>
/**
 * Model tm_mesure_etalonnage
 * Mesures de campagne d'etalonnage d'une sonde (sonde etalonnee vs etalon).
 */
export type tm_mesure_etalonnage = $Result.DefaultSelection<Prisma.$tm_mesure_etalonnagePayload>
/**
 * Model tm_mesures_histo
 * 
 */
export type tm_mesures_histo = $Result.DefaultSelection<Prisma.$tm_mesures_histoPayload>
/**
 * Model tm_mesures_test
 * 
 */
export type tm_mesures_test = $Result.DefaultSelection<Prisma.$tm_mesures_testPayload>
/**
 * Model tm_mesures_test_etalon
 * 
 */
export type tm_mesures_test_etalon = $Result.DefaultSelection<Prisma.$tm_mesures_test_etalonPayload>
/**
 * Model tm_mode_degrade
 * 
 */
export type tm_mode_degrade = $Result.DefaultSelection<Prisma.$tm_mode_degradePayload>
/**
 * Model tm_parametre
 * 
 */
export type tm_parametre = $Result.DefaultSelection<Prisma.$tm_parametrePayload>
/**
 * Model tm_vigilog_mesure
 * 
 */
export type tm_vigilog_mesure = $Result.DefaultSelection<Prisma.$tm_vigilog_mesurePayload>
/**
 * Model tm_journal_commentaire_libre
 * 
 */
export type tm_journal_commentaire_libre = $Result.DefaultSelection<Prisma.$tm_journal_commentaire_librePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient({
 *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
 * })
 * // Fetch zero or more Tm_graphiques
 * const tm_graphiques = await prisma.tm_graphique.findMany()
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
   * const prisma = new PrismaClient({
   *   adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL })
   * })
   * // Fetch zero or more Tm_graphiques
   * const tm_graphiques = await prisma.tm_graphique.findMany()
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
   * `prisma.tm_graphique`: Exposes CRUD operations for the **tm_graphique** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_graphiques
    * const tm_graphiques = await prisma.tm_graphique.findMany()
    * ```
    */
  get tm_graphique(): Prisma.tm_graphiqueDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_journal`: Exposes CRUD operations for the **tm_journal** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_journals
    * const tm_journals = await prisma.tm_journal.findMany()
    * ```
    */
  get tm_journal(): Prisma.tm_journalDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_journal_code`: Exposes CRUD operations for the **tm_journal_code** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_journal_codes
    * const tm_journal_codes = await prisma.tm_journal_code.findMany()
    * ```
    */
  get tm_journal_code(): Prisma.tm_journal_codeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_compteur_id_table`: Exposes CRUD operations for the **tm_compteur_id_table** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_compteur_id_tables
    * const tm_compteur_id_tables = await prisma.tm_compteur_id_table.findMany()
    * ```
    */
  get tm_compteur_id_table(): Prisma.tm_compteur_id_tableDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mesures`: Exposes CRUD operations for the **tm_mesures** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mesures
    * const tm_mesures = await prisma.tm_mesures.findMany()
    * ```
    */
  get tm_mesures(): Prisma.tm_mesuresDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mesures_gso`: Exposes CRUD operations for the **tm_mesures_gso** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mesures_gsos
    * const tm_mesures_gsos = await prisma.tm_mesures_gso.findMany()
    * ```
    */
  get tm_mesures_gso(): Prisma.tm_mesures_gsoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_journal_histo`: Exposes CRUD operations for the **tm_journal_histo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_journal_histos
    * const tm_journal_histos = await prisma.tm_journal_histo.findMany()
    * ```
    */
  get tm_journal_histo(): Prisma.tm_journal_histoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mesure_calibrage`: Exposes CRUD operations for the **tm_mesure_calibrage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mesure_calibrages
    * const tm_mesure_calibrages = await prisma.tm_mesure_calibrage.findMany()
    * ```
    */
  get tm_mesure_calibrage(): Prisma.tm_mesure_calibrageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mesure_calibrage_etalon`: Exposes CRUD operations for the **tm_mesure_calibrage_etalon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mesure_calibrage_etalons
    * const tm_mesure_calibrage_etalons = await prisma.tm_mesure_calibrage_etalon.findMany()
    * ```
    */
  get tm_mesure_calibrage_etalon(): Prisma.tm_mesure_calibrage_etalonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mesure_etalon`: Exposes CRUD operations for the **tm_mesure_etalon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mesure_etalons
    * const tm_mesure_etalons = await prisma.tm_mesure_etalon.findMany()
    * ```
    */
  get tm_mesure_etalon(): Prisma.tm_mesure_etalonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mesure_etalonnage`: Exposes CRUD operations for the **tm_mesure_etalonnage** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mesure_etalonnages
    * const tm_mesure_etalonnages = await prisma.tm_mesure_etalonnage.findMany()
    * ```
    */
  get tm_mesure_etalonnage(): Prisma.tm_mesure_etalonnageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mesures_histo`: Exposes CRUD operations for the **tm_mesures_histo** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mesures_histos
    * const tm_mesures_histos = await prisma.tm_mesures_histo.findMany()
    * ```
    */
  get tm_mesures_histo(): Prisma.tm_mesures_histoDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mesures_test`: Exposes CRUD operations for the **tm_mesures_test** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mesures_tests
    * const tm_mesures_tests = await prisma.tm_mesures_test.findMany()
    * ```
    */
  get tm_mesures_test(): Prisma.tm_mesures_testDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mesures_test_etalon`: Exposes CRUD operations for the **tm_mesures_test_etalon** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mesures_test_etalons
    * const tm_mesures_test_etalons = await prisma.tm_mesures_test_etalon.findMany()
    * ```
    */
  get tm_mesures_test_etalon(): Prisma.tm_mesures_test_etalonDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_mode_degrade`: Exposes CRUD operations for the **tm_mode_degrade** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_mode_degrades
    * const tm_mode_degrades = await prisma.tm_mode_degrade.findMany()
    * ```
    */
  get tm_mode_degrade(): Prisma.tm_mode_degradeDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_parametre`: Exposes CRUD operations for the **tm_parametre** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_parametres
    * const tm_parametres = await prisma.tm_parametre.findMany()
    * ```
    */
  get tm_parametre(): Prisma.tm_parametreDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_vigilog_mesure`: Exposes CRUD operations for the **tm_vigilog_mesure** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_vigilog_mesures
    * const tm_vigilog_mesures = await prisma.tm_vigilog_mesure.findMany()
    * ```
    */
  get tm_vigilog_mesure(): Prisma.tm_vigilog_mesureDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.tm_journal_commentaire_libre`: Exposes CRUD operations for the **tm_journal_commentaire_libre** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tm_journal_commentaire_libres
    * const tm_journal_commentaire_libres = await prisma.tm_journal_commentaire_libre.findMany()
    * ```
    */
  get tm_journal_commentaire_libre(): Prisma.tm_journal_commentaire_libreDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 7.7.0
   * Query Engine version: 75cbdc1eb7150937890ad5465d861175c6624711
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
    tm_graphique: 'tm_graphique',
    tm_journal: 'tm_journal',
    tm_journal_code: 'tm_journal_code',
    tm_compteur_id_table: 'tm_compteur_id_table',
    tm_mesures: 'tm_mesures',
    tm_mesures_gso: 'tm_mesures_gso',
    tm_journal_histo: 'tm_journal_histo',
    tm_mesure_calibrage: 'tm_mesure_calibrage',
    tm_mesure_calibrage_etalon: 'tm_mesure_calibrage_etalon',
    tm_mesure_etalon: 'tm_mesure_etalon',
    tm_mesure_etalonnage: 'tm_mesure_etalonnage',
    tm_mesures_histo: 'tm_mesures_histo',
    tm_mesures_test: 'tm_mesures_test',
    tm_mesures_test_etalon: 'tm_mesures_test_etalon',
    tm_mode_degrade: 'tm_mode_degrade',
    tm_parametre: 'tm_parametre',
    tm_vigilog_mesure: 'tm_vigilog_mesure',
    tm_journal_commentaire_libre: 'tm_journal_commentaire_libre'
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
      modelProps: "tm_graphique" | "tm_journal" | "tm_journal_code" | "tm_compteur_id_table" | "tm_mesures" | "tm_mesures_gso" | "tm_journal_histo" | "tm_mesure_calibrage" | "tm_mesure_calibrage_etalon" | "tm_mesure_etalon" | "tm_mesure_etalonnage" | "tm_mesures_histo" | "tm_mesures_test" | "tm_mesures_test_etalon" | "tm_mode_degrade" | "tm_parametre" | "tm_vigilog_mesure" | "tm_journal_commentaire_libre"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      tm_graphique: {
        payload: Prisma.$tm_graphiquePayload<ExtArgs>
        fields: Prisma.tm_graphiqueFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_graphiqueFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_graphiquePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_graphiqueFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_graphiquePayload>
          }
          findFirst: {
            args: Prisma.tm_graphiqueFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_graphiquePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_graphiqueFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_graphiquePayload>
          }
          findMany: {
            args: Prisma.tm_graphiqueFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_graphiquePayload>[]
          }
          create: {
            args: Prisma.tm_graphiqueCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_graphiquePayload>
          }
          createMany: {
            args: Prisma.tm_graphiqueCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_graphiqueDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_graphiquePayload>
          }
          update: {
            args: Prisma.tm_graphiqueUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_graphiquePayload>
          }
          deleteMany: {
            args: Prisma.tm_graphiqueDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_graphiqueUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_graphiqueUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_graphiquePayload>
          }
          aggregate: {
            args: Prisma.Tm_graphiqueAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_graphique>
          }
          groupBy: {
            args: Prisma.tm_graphiqueGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_graphiqueGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_graphiqueCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_graphiqueCountAggregateOutputType> | number
          }
        }
      }
      tm_journal: {
        payload: Prisma.$tm_journalPayload<ExtArgs>
        fields: Prisma.tm_journalFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_journalFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journalPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_journalFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journalPayload>
          }
          findFirst: {
            args: Prisma.tm_journalFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journalPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_journalFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journalPayload>
          }
          findMany: {
            args: Prisma.tm_journalFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journalPayload>[]
          }
          create: {
            args: Prisma.tm_journalCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journalPayload>
          }
          createMany: {
            args: Prisma.tm_journalCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_journalDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journalPayload>
          }
          update: {
            args: Prisma.tm_journalUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journalPayload>
          }
          deleteMany: {
            args: Prisma.tm_journalDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_journalUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_journalUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journalPayload>
          }
          aggregate: {
            args: Prisma.Tm_journalAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_journal>
          }
          groupBy: {
            args: Prisma.tm_journalGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_journalGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_journalCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_journalCountAggregateOutputType> | number
          }
        }
      }
      tm_journal_code: {
        payload: Prisma.$tm_journal_codePayload<ExtArgs>
        fields: Prisma.tm_journal_codeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_journal_codeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_codePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_journal_codeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_codePayload>
          }
          findFirst: {
            args: Prisma.tm_journal_codeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_codePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_journal_codeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_codePayload>
          }
          findMany: {
            args: Prisma.tm_journal_codeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_codePayload>[]
          }
          create: {
            args: Prisma.tm_journal_codeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_codePayload>
          }
          createMany: {
            args: Prisma.tm_journal_codeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_journal_codeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_codePayload>
          }
          update: {
            args: Prisma.tm_journal_codeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_codePayload>
          }
          deleteMany: {
            args: Prisma.tm_journal_codeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_journal_codeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_journal_codeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_codePayload>
          }
          aggregate: {
            args: Prisma.Tm_journal_codeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_journal_code>
          }
          groupBy: {
            args: Prisma.tm_journal_codeGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_journal_codeGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_journal_codeCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_journal_codeCountAggregateOutputType> | number
          }
        }
      }
      tm_compteur_id_table: {
        payload: Prisma.$tm_compteur_id_tablePayload<ExtArgs>
        fields: Prisma.tm_compteur_id_tableFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_compteur_id_tableFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_compteur_id_tablePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_compteur_id_tableFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_compteur_id_tablePayload>
          }
          findFirst: {
            args: Prisma.tm_compteur_id_tableFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_compteur_id_tablePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_compteur_id_tableFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_compteur_id_tablePayload>
          }
          findMany: {
            args: Prisma.tm_compteur_id_tableFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_compteur_id_tablePayload>[]
          }
          create: {
            args: Prisma.tm_compteur_id_tableCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_compteur_id_tablePayload>
          }
          createMany: {
            args: Prisma.tm_compteur_id_tableCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_compteur_id_tableDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_compteur_id_tablePayload>
          }
          update: {
            args: Prisma.tm_compteur_id_tableUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_compteur_id_tablePayload>
          }
          deleteMany: {
            args: Prisma.tm_compteur_id_tableDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_compteur_id_tableUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_compteur_id_tableUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_compteur_id_tablePayload>
          }
          aggregate: {
            args: Prisma.Tm_compteur_id_tableAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_compteur_id_table>
          }
          groupBy: {
            args: Prisma.tm_compteur_id_tableGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_compteur_id_tableGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_compteur_id_tableCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_compteur_id_tableCountAggregateOutputType> | number
          }
        }
      }
      tm_mesures: {
        payload: Prisma.$tm_mesuresPayload<ExtArgs>
        fields: Prisma.tm_mesuresFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mesuresFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesuresPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mesuresFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesuresPayload>
          }
          findFirst: {
            args: Prisma.tm_mesuresFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesuresPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mesuresFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesuresPayload>
          }
          findMany: {
            args: Prisma.tm_mesuresFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesuresPayload>[]
          }
          create: {
            args: Prisma.tm_mesuresCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesuresPayload>
          }
          createMany: {
            args: Prisma.tm_mesuresCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mesuresDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesuresPayload>
          }
          update: {
            args: Prisma.tm_mesuresUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesuresPayload>
          }
          deleteMany: {
            args: Prisma.tm_mesuresDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mesuresUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mesuresUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesuresPayload>
          }
          aggregate: {
            args: Prisma.Tm_mesuresAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mesures>
          }
          groupBy: {
            args: Prisma.tm_mesuresGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesuresGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mesuresCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesuresCountAggregateOutputType> | number
          }
        }
      }
      tm_mesures_gso: {
        payload: Prisma.$tm_mesures_gsoPayload<ExtArgs>
        fields: Prisma.tm_mesures_gsoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mesures_gsoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_gsoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mesures_gsoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_gsoPayload>
          }
          findFirst: {
            args: Prisma.tm_mesures_gsoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_gsoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mesures_gsoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_gsoPayload>
          }
          findMany: {
            args: Prisma.tm_mesures_gsoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_gsoPayload>[]
          }
          create: {
            args: Prisma.tm_mesures_gsoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_gsoPayload>
          }
          createMany: {
            args: Prisma.tm_mesures_gsoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mesures_gsoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_gsoPayload>
          }
          update: {
            args: Prisma.tm_mesures_gsoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_gsoPayload>
          }
          deleteMany: {
            args: Prisma.tm_mesures_gsoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mesures_gsoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mesures_gsoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_gsoPayload>
          }
          aggregate: {
            args: Prisma.Tm_mesures_gsoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mesures_gso>
          }
          groupBy: {
            args: Prisma.tm_mesures_gsoGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesures_gsoGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mesures_gsoCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesures_gsoCountAggregateOutputType> | number
          }
        }
      }
      tm_journal_histo: {
        payload: Prisma.$tm_journal_histoPayload<ExtArgs>
        fields: Prisma.tm_journal_histoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_journal_histoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_histoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_journal_histoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_histoPayload>
          }
          findFirst: {
            args: Prisma.tm_journal_histoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_histoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_journal_histoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_histoPayload>
          }
          findMany: {
            args: Prisma.tm_journal_histoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_histoPayload>[]
          }
          create: {
            args: Prisma.tm_journal_histoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_histoPayload>
          }
          createMany: {
            args: Prisma.tm_journal_histoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_journal_histoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_histoPayload>
          }
          update: {
            args: Prisma.tm_journal_histoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_histoPayload>
          }
          deleteMany: {
            args: Prisma.tm_journal_histoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_journal_histoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_journal_histoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_histoPayload>
          }
          aggregate: {
            args: Prisma.Tm_journal_histoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_journal_histo>
          }
          groupBy: {
            args: Prisma.tm_journal_histoGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_journal_histoGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_journal_histoCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_journal_histoCountAggregateOutputType> | number
          }
        }
      }
      tm_mesure_calibrage: {
        payload: Prisma.$tm_mesure_calibragePayload<ExtArgs>
        fields: Prisma.tm_mesure_calibrageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mesure_calibrageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibragePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mesure_calibrageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibragePayload>
          }
          findFirst: {
            args: Prisma.tm_mesure_calibrageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibragePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mesure_calibrageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibragePayload>
          }
          findMany: {
            args: Prisma.tm_mesure_calibrageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibragePayload>[]
          }
          create: {
            args: Prisma.tm_mesure_calibrageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibragePayload>
          }
          createMany: {
            args: Prisma.tm_mesure_calibrageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mesure_calibrageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibragePayload>
          }
          update: {
            args: Prisma.tm_mesure_calibrageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibragePayload>
          }
          deleteMany: {
            args: Prisma.tm_mesure_calibrageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mesure_calibrageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mesure_calibrageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibragePayload>
          }
          aggregate: {
            args: Prisma.Tm_mesure_calibrageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mesure_calibrage>
          }
          groupBy: {
            args: Prisma.tm_mesure_calibrageGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesure_calibrageGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mesure_calibrageCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesure_calibrageCountAggregateOutputType> | number
          }
        }
      }
      tm_mesure_calibrage_etalon: {
        payload: Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>
        fields: Prisma.tm_mesure_calibrage_etalonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mesure_calibrage_etalonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibrage_etalonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mesure_calibrage_etalonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibrage_etalonPayload>
          }
          findFirst: {
            args: Prisma.tm_mesure_calibrage_etalonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibrage_etalonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mesure_calibrage_etalonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibrage_etalonPayload>
          }
          findMany: {
            args: Prisma.tm_mesure_calibrage_etalonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibrage_etalonPayload>[]
          }
          create: {
            args: Prisma.tm_mesure_calibrage_etalonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibrage_etalonPayload>
          }
          createMany: {
            args: Prisma.tm_mesure_calibrage_etalonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mesure_calibrage_etalonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibrage_etalonPayload>
          }
          update: {
            args: Prisma.tm_mesure_calibrage_etalonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibrage_etalonPayload>
          }
          deleteMany: {
            args: Prisma.tm_mesure_calibrage_etalonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mesure_calibrage_etalonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mesure_calibrage_etalonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_calibrage_etalonPayload>
          }
          aggregate: {
            args: Prisma.Tm_mesure_calibrage_etalonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mesure_calibrage_etalon>
          }
          groupBy: {
            args: Prisma.tm_mesure_calibrage_etalonGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesure_calibrage_etalonGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mesure_calibrage_etalonCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesure_calibrage_etalonCountAggregateOutputType> | number
          }
        }
      }
      tm_mesure_etalon: {
        payload: Prisma.$tm_mesure_etalonPayload<ExtArgs>
        fields: Prisma.tm_mesure_etalonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mesure_etalonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mesure_etalonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonPayload>
          }
          findFirst: {
            args: Prisma.tm_mesure_etalonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mesure_etalonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonPayload>
          }
          findMany: {
            args: Prisma.tm_mesure_etalonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonPayload>[]
          }
          create: {
            args: Prisma.tm_mesure_etalonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonPayload>
          }
          createMany: {
            args: Prisma.tm_mesure_etalonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mesure_etalonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonPayload>
          }
          update: {
            args: Prisma.tm_mesure_etalonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonPayload>
          }
          deleteMany: {
            args: Prisma.tm_mesure_etalonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mesure_etalonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mesure_etalonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonPayload>
          }
          aggregate: {
            args: Prisma.Tm_mesure_etalonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mesure_etalon>
          }
          groupBy: {
            args: Prisma.tm_mesure_etalonGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesure_etalonGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mesure_etalonCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesure_etalonCountAggregateOutputType> | number
          }
        }
      }
      tm_mesure_etalonnage: {
        payload: Prisma.$tm_mesure_etalonnagePayload<ExtArgs>
        fields: Prisma.tm_mesure_etalonnageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mesure_etalonnageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonnagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mesure_etalonnageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonnagePayload>
          }
          findFirst: {
            args: Prisma.tm_mesure_etalonnageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonnagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mesure_etalonnageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonnagePayload>
          }
          findMany: {
            args: Prisma.tm_mesure_etalonnageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonnagePayload>[]
          }
          create: {
            args: Prisma.tm_mesure_etalonnageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonnagePayload>
          }
          createMany: {
            args: Prisma.tm_mesure_etalonnageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mesure_etalonnageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonnagePayload>
          }
          update: {
            args: Prisma.tm_mesure_etalonnageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonnagePayload>
          }
          deleteMany: {
            args: Prisma.tm_mesure_etalonnageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mesure_etalonnageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mesure_etalonnageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesure_etalonnagePayload>
          }
          aggregate: {
            args: Prisma.Tm_mesure_etalonnageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mesure_etalonnage>
          }
          groupBy: {
            args: Prisma.tm_mesure_etalonnageGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesure_etalonnageGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mesure_etalonnageCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesure_etalonnageCountAggregateOutputType> | number
          }
        }
      }
      tm_mesures_histo: {
        payload: Prisma.$tm_mesures_histoPayload<ExtArgs>
        fields: Prisma.tm_mesures_histoFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mesures_histoFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_histoPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mesures_histoFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_histoPayload>
          }
          findFirst: {
            args: Prisma.tm_mesures_histoFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_histoPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mesures_histoFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_histoPayload>
          }
          findMany: {
            args: Prisma.tm_mesures_histoFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_histoPayload>[]
          }
          create: {
            args: Prisma.tm_mesures_histoCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_histoPayload>
          }
          createMany: {
            args: Prisma.tm_mesures_histoCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mesures_histoDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_histoPayload>
          }
          update: {
            args: Prisma.tm_mesures_histoUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_histoPayload>
          }
          deleteMany: {
            args: Prisma.tm_mesures_histoDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mesures_histoUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mesures_histoUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_histoPayload>
          }
          aggregate: {
            args: Prisma.Tm_mesures_histoAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mesures_histo>
          }
          groupBy: {
            args: Prisma.tm_mesures_histoGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesures_histoGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mesures_histoCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesures_histoCountAggregateOutputType> | number
          }
        }
      }
      tm_mesures_test: {
        payload: Prisma.$tm_mesures_testPayload<ExtArgs>
        fields: Prisma.tm_mesures_testFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mesures_testFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_testPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mesures_testFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_testPayload>
          }
          findFirst: {
            args: Prisma.tm_mesures_testFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_testPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mesures_testFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_testPayload>
          }
          findMany: {
            args: Prisma.tm_mesures_testFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_testPayload>[]
          }
          create: {
            args: Prisma.tm_mesures_testCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_testPayload>
          }
          createMany: {
            args: Prisma.tm_mesures_testCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mesures_testDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_testPayload>
          }
          update: {
            args: Prisma.tm_mesures_testUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_testPayload>
          }
          deleteMany: {
            args: Prisma.tm_mesures_testDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mesures_testUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mesures_testUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_testPayload>
          }
          aggregate: {
            args: Prisma.Tm_mesures_testAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mesures_test>
          }
          groupBy: {
            args: Prisma.tm_mesures_testGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesures_testGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mesures_testCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesures_testCountAggregateOutputType> | number
          }
        }
      }
      tm_mesures_test_etalon: {
        payload: Prisma.$tm_mesures_test_etalonPayload<ExtArgs>
        fields: Prisma.tm_mesures_test_etalonFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mesures_test_etalonFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_test_etalonPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mesures_test_etalonFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_test_etalonPayload>
          }
          findFirst: {
            args: Prisma.tm_mesures_test_etalonFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_test_etalonPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mesures_test_etalonFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_test_etalonPayload>
          }
          findMany: {
            args: Prisma.tm_mesures_test_etalonFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_test_etalonPayload>[]
          }
          create: {
            args: Prisma.tm_mesures_test_etalonCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_test_etalonPayload>
          }
          createMany: {
            args: Prisma.tm_mesures_test_etalonCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mesures_test_etalonDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_test_etalonPayload>
          }
          update: {
            args: Prisma.tm_mesures_test_etalonUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_test_etalonPayload>
          }
          deleteMany: {
            args: Prisma.tm_mesures_test_etalonDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mesures_test_etalonUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mesures_test_etalonUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mesures_test_etalonPayload>
          }
          aggregate: {
            args: Prisma.Tm_mesures_test_etalonAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mesures_test_etalon>
          }
          groupBy: {
            args: Prisma.tm_mesures_test_etalonGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesures_test_etalonGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mesures_test_etalonCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mesures_test_etalonCountAggregateOutputType> | number
          }
        }
      }
      tm_mode_degrade: {
        payload: Prisma.$tm_mode_degradePayload<ExtArgs>
        fields: Prisma.tm_mode_degradeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_mode_degradeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mode_degradePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_mode_degradeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mode_degradePayload>
          }
          findFirst: {
            args: Prisma.tm_mode_degradeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mode_degradePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_mode_degradeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mode_degradePayload>
          }
          findMany: {
            args: Prisma.tm_mode_degradeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mode_degradePayload>[]
          }
          create: {
            args: Prisma.tm_mode_degradeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mode_degradePayload>
          }
          createMany: {
            args: Prisma.tm_mode_degradeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_mode_degradeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mode_degradePayload>
          }
          update: {
            args: Prisma.tm_mode_degradeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mode_degradePayload>
          }
          deleteMany: {
            args: Prisma.tm_mode_degradeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_mode_degradeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_mode_degradeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_mode_degradePayload>
          }
          aggregate: {
            args: Prisma.Tm_mode_degradeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_mode_degrade>
          }
          groupBy: {
            args: Prisma.tm_mode_degradeGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_mode_degradeGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_mode_degradeCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_mode_degradeCountAggregateOutputType> | number
          }
        }
      }
      tm_parametre: {
        payload: Prisma.$tm_parametrePayload<ExtArgs>
        fields: Prisma.tm_parametreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_parametreFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_parametrePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_parametreFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_parametrePayload>
          }
          findFirst: {
            args: Prisma.tm_parametreFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_parametrePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_parametreFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_parametrePayload>
          }
          findMany: {
            args: Prisma.tm_parametreFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_parametrePayload>[]
          }
          create: {
            args: Prisma.tm_parametreCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_parametrePayload>
          }
          createMany: {
            args: Prisma.tm_parametreCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_parametreDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_parametrePayload>
          }
          update: {
            args: Prisma.tm_parametreUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_parametrePayload>
          }
          deleteMany: {
            args: Prisma.tm_parametreDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_parametreUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_parametreUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_parametrePayload>
          }
          aggregate: {
            args: Prisma.Tm_parametreAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_parametre>
          }
          groupBy: {
            args: Prisma.tm_parametreGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_parametreGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_parametreCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_parametreCountAggregateOutputType> | number
          }
        }
      }
      tm_vigilog_mesure: {
        payload: Prisma.$tm_vigilog_mesurePayload<ExtArgs>
        fields: Prisma.tm_vigilog_mesureFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_vigilog_mesureFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_vigilog_mesurePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_vigilog_mesureFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_vigilog_mesurePayload>
          }
          findFirst: {
            args: Prisma.tm_vigilog_mesureFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_vigilog_mesurePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_vigilog_mesureFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_vigilog_mesurePayload>
          }
          findMany: {
            args: Prisma.tm_vigilog_mesureFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_vigilog_mesurePayload>[]
          }
          create: {
            args: Prisma.tm_vigilog_mesureCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_vigilog_mesurePayload>
          }
          createMany: {
            args: Prisma.tm_vigilog_mesureCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_vigilog_mesureDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_vigilog_mesurePayload>
          }
          update: {
            args: Prisma.tm_vigilog_mesureUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_vigilog_mesurePayload>
          }
          deleteMany: {
            args: Prisma.tm_vigilog_mesureDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_vigilog_mesureUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_vigilog_mesureUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_vigilog_mesurePayload>
          }
          aggregate: {
            args: Prisma.Tm_vigilog_mesureAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_vigilog_mesure>
          }
          groupBy: {
            args: Prisma.tm_vigilog_mesureGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_vigilog_mesureGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_vigilog_mesureCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_vigilog_mesureCountAggregateOutputType> | number
          }
        }
      }
      tm_journal_commentaire_libre: {
        payload: Prisma.$tm_journal_commentaire_librePayload<ExtArgs>
        fields: Prisma.tm_journal_commentaire_libreFieldRefs
        operations: {
          findUnique: {
            args: Prisma.tm_journal_commentaire_libreFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_commentaire_librePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.tm_journal_commentaire_libreFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_commentaire_librePayload>
          }
          findFirst: {
            args: Prisma.tm_journal_commentaire_libreFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_commentaire_librePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.tm_journal_commentaire_libreFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_commentaire_librePayload>
          }
          findMany: {
            args: Prisma.tm_journal_commentaire_libreFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_commentaire_librePayload>[]
          }
          create: {
            args: Prisma.tm_journal_commentaire_libreCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_commentaire_librePayload>
          }
          createMany: {
            args: Prisma.tm_journal_commentaire_libreCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.tm_journal_commentaire_libreDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_commentaire_librePayload>
          }
          update: {
            args: Prisma.tm_journal_commentaire_libreUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_commentaire_librePayload>
          }
          deleteMany: {
            args: Prisma.tm_journal_commentaire_libreDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.tm_journal_commentaire_libreUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.tm_journal_commentaire_libreUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$tm_journal_commentaire_librePayload>
          }
          aggregate: {
            args: Prisma.Tm_journal_commentaire_libreAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTm_journal_commentaire_libre>
          }
          groupBy: {
            args: Prisma.tm_journal_commentaire_libreGroupByArgs<ExtArgs>
            result: $Utils.Optional<Tm_journal_commentaire_libreGroupByOutputType>[]
          }
          count: {
            args: Prisma.tm_journal_commentaire_libreCountArgs<ExtArgs>
            result: $Utils.Optional<Tm_journal_commentaire_libreCountAggregateOutputType> | number
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
    tm_graphique?: tm_graphiqueOmit
    tm_journal?: tm_journalOmit
    tm_journal_code?: tm_journal_codeOmit
    tm_compteur_id_table?: tm_compteur_id_tableOmit
    tm_mesures?: tm_mesuresOmit
    tm_mesures_gso?: tm_mesures_gsoOmit
    tm_journal_histo?: tm_journal_histoOmit
    tm_mesure_calibrage?: tm_mesure_calibrageOmit
    tm_mesure_calibrage_etalon?: tm_mesure_calibrage_etalonOmit
    tm_mesure_etalon?: tm_mesure_etalonOmit
    tm_mesure_etalonnage?: tm_mesure_etalonnageOmit
    tm_mesures_histo?: tm_mesures_histoOmit
    tm_mesures_test?: tm_mesures_testOmit
    tm_mesures_test_etalon?: tm_mesures_test_etalonOmit
    tm_mode_degrade?: tm_mode_degradeOmit
    tm_parametre?: tm_parametreOmit
    tm_vigilog_mesure?: tm_vigilog_mesureOmit
    tm_journal_commentaire_libre?: tm_journal_commentaire_libreOmit
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
   * Model tm_graphique
   */

  export type AggregateTm_graphique = {
    _count: Tm_graphiqueCountAggregateOutputType | null
    _avg: Tm_graphiqueAvgAggregateOutputType | null
    _sum: Tm_graphiqueSumAggregateOutputType | null
    _min: Tm_graphiqueMinAggregateOutputType | null
    _max: Tm_graphiqueMaxAggregateOutputType | null
  }

  export type Tm_graphiqueAvgAggregateOutputType = {
    Id_Graphique: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Id_Sonde: number | null
    Id_Lieu: number | null
    Frequence: number | null
    Est_Etat_Alarme: number | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
  }

  export type Tm_graphiqueSumAggregateOutputType = {
    Id_Graphique: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Id_Sonde: number | null
    Id_Lieu: number | null
    Frequence: number | null
    Est_Etat_Alarme: number | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
  }

  export type Tm_graphiqueMinAggregateOutputType = {
    Id_Graphique: number | null
    Date_Heure_Mesure: Date | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    Sonde_Numero_Serie: string | null
    Adresse_Sonde: string | null
    Id_Sonde: number | null
    Id_Lieu: number | null
    Est_Valeur_Null: boolean | null
    Frequence: number | null
    Est_Etat_Alarme: number | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
  }

  export type Tm_graphiqueMaxAggregateOutputType = {
    Id_Graphique: number | null
    Date_Heure_Mesure: Date | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    Sonde_Numero_Serie: string | null
    Adresse_Sonde: string | null
    Id_Sonde: number | null
    Id_Lieu: number | null
    Est_Valeur_Null: boolean | null
    Frequence: number | null
    Est_Etat_Alarme: number | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
  }

  export type Tm_graphiqueCountAggregateOutputType = {
    Id_Graphique: number
    Date_Heure_Mesure: number
    Valeur: number
    Valeur_Brute: number
    Nb_Decimal: number
    Consigne: number
    Consigne_Sup: number
    Consigne_Inf: number
    Unite: number
    Sonde_Numero_Serie: number
    Adresse_Sonde: number
    Id_Sonde: number
    Id_Lieu: number
    Est_Valeur_Null: number
    Frequence: number
    Est_Etat_Alarme: number
    Consigne_Inf_Pre_Alarme: number
    Consigne_Sup_Pre_Alarme: number
    _all: number
  }


  export type Tm_graphiqueAvgAggregateInputType = {
    Id_Graphique?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Id_Sonde?: true
    Id_Lieu?: true
    Frequence?: true
    Est_Etat_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
  }

  export type Tm_graphiqueSumAggregateInputType = {
    Id_Graphique?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Id_Sonde?: true
    Id_Lieu?: true
    Frequence?: true
    Est_Etat_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
  }

  export type Tm_graphiqueMinAggregateInputType = {
    Id_Graphique?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    Sonde_Numero_Serie?: true
    Adresse_Sonde?: true
    Id_Sonde?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Est_Etat_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
  }

  export type Tm_graphiqueMaxAggregateInputType = {
    Id_Graphique?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    Sonde_Numero_Serie?: true
    Adresse_Sonde?: true
    Id_Sonde?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Est_Etat_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
  }

  export type Tm_graphiqueCountAggregateInputType = {
    Id_Graphique?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    Sonde_Numero_Serie?: true
    Adresse_Sonde?: true
    Id_Sonde?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Est_Etat_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    _all?: true
  }

  export type Tm_graphiqueAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_graphique to aggregate.
     */
    where?: tm_graphiqueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_graphiques to fetch.
     */
    orderBy?: tm_graphiqueOrderByWithRelationInput | tm_graphiqueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_graphiqueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_graphiques from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_graphiques.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_graphiques
    **/
    _count?: true | Tm_graphiqueCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_graphiqueAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_graphiqueSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_graphiqueMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_graphiqueMaxAggregateInputType
  }

  export type GetTm_graphiqueAggregateType<T extends Tm_graphiqueAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_graphique]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_graphique[P]>
      : GetScalarType<T[P], AggregateTm_graphique[P]>
  }




  export type tm_graphiqueGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_graphiqueWhereInput
    orderBy?: tm_graphiqueOrderByWithAggregationInput | tm_graphiqueOrderByWithAggregationInput[]
    by: Tm_graphiqueScalarFieldEnum[] | Tm_graphiqueScalarFieldEnum
    having?: tm_graphiqueScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_graphiqueCountAggregateInputType | true
    _avg?: Tm_graphiqueAvgAggregateInputType
    _sum?: Tm_graphiqueSumAggregateInputType
    _min?: Tm_graphiqueMinAggregateInputType
    _max?: Tm_graphiqueMaxAggregateInputType
  }

  export type Tm_graphiqueGroupByOutputType = {
    Id_Graphique: number
    Date_Heure_Mesure: Date
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    Sonde_Numero_Serie: string | null
    Adresse_Sonde: string | null
    Id_Sonde: number | null
    Id_Lieu: number
    Est_Valeur_Null: boolean
    Frequence: number | null
    Est_Etat_Alarme: number
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    _count: Tm_graphiqueCountAggregateOutputType | null
    _avg: Tm_graphiqueAvgAggregateOutputType | null
    _sum: Tm_graphiqueSumAggregateOutputType | null
    _min: Tm_graphiqueMinAggregateOutputType | null
    _max: Tm_graphiqueMaxAggregateOutputType | null
  }

  type GetTm_graphiqueGroupByPayload<T extends tm_graphiqueGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_graphiqueGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_graphiqueGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_graphiqueGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_graphiqueGroupByOutputType[P]>
        }
      >
    >


  export type tm_graphiqueSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Graphique?: boolean
    Date_Heure_Mesure?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Nb_Decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    Sonde_Numero_Serie?: boolean
    Adresse_Sonde?: boolean
    Id_Sonde?: boolean
    Id_Lieu?: boolean
    Est_Valeur_Null?: boolean
    Frequence?: boolean
    Est_Etat_Alarme?: boolean
    Consigne_Inf_Pre_Alarme?: boolean
    Consigne_Sup_Pre_Alarme?: boolean
  }, ExtArgs["result"]["tm_graphique"]>



  export type tm_graphiqueSelectScalar = {
    Id_Graphique?: boolean
    Date_Heure_Mesure?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Nb_Decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    Sonde_Numero_Serie?: boolean
    Adresse_Sonde?: boolean
    Id_Sonde?: boolean
    Id_Lieu?: boolean
    Est_Valeur_Null?: boolean
    Frequence?: boolean
    Est_Etat_Alarme?: boolean
    Consigne_Inf_Pre_Alarme?: boolean
    Consigne_Sup_Pre_Alarme?: boolean
  }

  export type tm_graphiqueOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Graphique" | "Date_Heure_Mesure" | "Valeur" | "Valeur_Brute" | "Nb_Decimal" | "Consigne" | "Consigne_Sup" | "Consigne_Inf" | "Unite" | "Sonde_Numero_Serie" | "Adresse_Sonde" | "Id_Sonde" | "Id_Lieu" | "Est_Valeur_Null" | "Frequence" | "Est_Etat_Alarme" | "Consigne_Inf_Pre_Alarme" | "Consigne_Sup_Pre_Alarme", ExtArgs["result"]["tm_graphique"]>

  export type $tm_graphiquePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_graphique"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Graphique: number
      Date_Heure_Mesure: Date
      Valeur: number | null
      Valeur_Brute: number | null
      Nb_Decimal: number | null
      Consigne: number | null
      Consigne_Sup: number | null
      Consigne_Inf: number | null
      Unite: string | null
      Sonde_Numero_Serie: string | null
      Adresse_Sonde: string | null
      Id_Sonde: number | null
      Id_Lieu: number
      Est_Valeur_Null: boolean
      Frequence: number | null
      Est_Etat_Alarme: number
      Consigne_Inf_Pre_Alarme: number | null
      Consigne_Sup_Pre_Alarme: number | null
    }, ExtArgs["result"]["tm_graphique"]>
    composites: {}
  }

  type tm_graphiqueGetPayload<S extends boolean | null | undefined | tm_graphiqueDefaultArgs> = $Result.GetResult<Prisma.$tm_graphiquePayload, S>

  type tm_graphiqueCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_graphiqueFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_graphiqueCountAggregateInputType | true
    }

  export interface tm_graphiqueDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_graphique'], meta: { name: 'tm_graphique' } }
    /**
     * Find zero or one Tm_graphique that matches the filter.
     * @param {tm_graphiqueFindUniqueArgs} args - Arguments to find a Tm_graphique
     * @example
     * // Get one Tm_graphique
     * const tm_graphique = await prisma.tm_graphique.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_graphiqueFindUniqueArgs>(args: SelectSubset<T, tm_graphiqueFindUniqueArgs<ExtArgs>>): Prisma__tm_graphiqueClient<$Result.GetResult<Prisma.$tm_graphiquePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_graphique that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_graphiqueFindUniqueOrThrowArgs} args - Arguments to find a Tm_graphique
     * @example
     * // Get one Tm_graphique
     * const tm_graphique = await prisma.tm_graphique.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_graphiqueFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_graphiqueFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_graphiqueClient<$Result.GetResult<Prisma.$tm_graphiquePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_graphique that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_graphiqueFindFirstArgs} args - Arguments to find a Tm_graphique
     * @example
     * // Get one Tm_graphique
     * const tm_graphique = await prisma.tm_graphique.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_graphiqueFindFirstArgs>(args?: SelectSubset<T, tm_graphiqueFindFirstArgs<ExtArgs>>): Prisma__tm_graphiqueClient<$Result.GetResult<Prisma.$tm_graphiquePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_graphique that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_graphiqueFindFirstOrThrowArgs} args - Arguments to find a Tm_graphique
     * @example
     * // Get one Tm_graphique
     * const tm_graphique = await prisma.tm_graphique.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_graphiqueFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_graphiqueFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_graphiqueClient<$Result.GetResult<Prisma.$tm_graphiquePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_graphiques that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_graphiqueFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_graphiques
     * const tm_graphiques = await prisma.tm_graphique.findMany()
     * 
     * // Get first 10 Tm_graphiques
     * const tm_graphiques = await prisma.tm_graphique.findMany({ take: 10 })
     * 
     * // Only select the `Id_Graphique`
     * const tm_graphiqueWithId_GraphiqueOnly = await prisma.tm_graphique.findMany({ select: { Id_Graphique: true } })
     * 
     */
    findMany<T extends tm_graphiqueFindManyArgs>(args?: SelectSubset<T, tm_graphiqueFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_graphiquePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_graphique.
     * @param {tm_graphiqueCreateArgs} args - Arguments to create a Tm_graphique.
     * @example
     * // Create one Tm_graphique
     * const Tm_graphique = await prisma.tm_graphique.create({
     *   data: {
     *     // ... data to create a Tm_graphique
     *   }
     * })
     * 
     */
    create<T extends tm_graphiqueCreateArgs>(args: SelectSubset<T, tm_graphiqueCreateArgs<ExtArgs>>): Prisma__tm_graphiqueClient<$Result.GetResult<Prisma.$tm_graphiquePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_graphiques.
     * @param {tm_graphiqueCreateManyArgs} args - Arguments to create many Tm_graphiques.
     * @example
     * // Create many Tm_graphiques
     * const tm_graphique = await prisma.tm_graphique.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_graphiqueCreateManyArgs>(args?: SelectSubset<T, tm_graphiqueCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_graphique.
     * @param {tm_graphiqueDeleteArgs} args - Arguments to delete one Tm_graphique.
     * @example
     * // Delete one Tm_graphique
     * const Tm_graphique = await prisma.tm_graphique.delete({
     *   where: {
     *     // ... filter to delete one Tm_graphique
     *   }
     * })
     * 
     */
    delete<T extends tm_graphiqueDeleteArgs>(args: SelectSubset<T, tm_graphiqueDeleteArgs<ExtArgs>>): Prisma__tm_graphiqueClient<$Result.GetResult<Prisma.$tm_graphiquePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_graphique.
     * @param {tm_graphiqueUpdateArgs} args - Arguments to update one Tm_graphique.
     * @example
     * // Update one Tm_graphique
     * const tm_graphique = await prisma.tm_graphique.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_graphiqueUpdateArgs>(args: SelectSubset<T, tm_graphiqueUpdateArgs<ExtArgs>>): Prisma__tm_graphiqueClient<$Result.GetResult<Prisma.$tm_graphiquePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_graphiques.
     * @param {tm_graphiqueDeleteManyArgs} args - Arguments to filter Tm_graphiques to delete.
     * @example
     * // Delete a few Tm_graphiques
     * const { count } = await prisma.tm_graphique.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_graphiqueDeleteManyArgs>(args?: SelectSubset<T, tm_graphiqueDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_graphiques.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_graphiqueUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_graphiques
     * const tm_graphique = await prisma.tm_graphique.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_graphiqueUpdateManyArgs>(args: SelectSubset<T, tm_graphiqueUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_graphique.
     * @param {tm_graphiqueUpsertArgs} args - Arguments to update or create a Tm_graphique.
     * @example
     * // Update or create a Tm_graphique
     * const tm_graphique = await prisma.tm_graphique.upsert({
     *   create: {
     *     // ... data to create a Tm_graphique
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_graphique we want to update
     *   }
     * })
     */
    upsert<T extends tm_graphiqueUpsertArgs>(args: SelectSubset<T, tm_graphiqueUpsertArgs<ExtArgs>>): Prisma__tm_graphiqueClient<$Result.GetResult<Prisma.$tm_graphiquePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_graphiques.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_graphiqueCountArgs} args - Arguments to filter Tm_graphiques to count.
     * @example
     * // Count the number of Tm_graphiques
     * const count = await prisma.tm_graphique.count({
     *   where: {
     *     // ... the filter for the Tm_graphiques we want to count
     *   }
     * })
    **/
    count<T extends tm_graphiqueCountArgs>(
      args?: Subset<T, tm_graphiqueCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_graphiqueCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_graphique.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_graphiqueAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_graphiqueAggregateArgs>(args: Subset<T, Tm_graphiqueAggregateArgs>): Prisma.PrismaPromise<GetTm_graphiqueAggregateType<T>>

    /**
     * Group by Tm_graphique.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_graphiqueGroupByArgs} args - Group by arguments.
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
      T extends tm_graphiqueGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_graphiqueGroupByArgs['orderBy'] }
        : { orderBy?: tm_graphiqueGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_graphiqueGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_graphiqueGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_graphique model
   */
  readonly fields: tm_graphiqueFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_graphique.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_graphiqueClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_graphique model
   */
  interface tm_graphiqueFieldRefs {
    readonly Id_Graphique: FieldRef<"tm_graphique", 'Int'>
    readonly Date_Heure_Mesure: FieldRef<"tm_graphique", 'DateTime'>
    readonly Valeur: FieldRef<"tm_graphique", 'Float'>
    readonly Valeur_Brute: FieldRef<"tm_graphique", 'Float'>
    readonly Nb_Decimal: FieldRef<"tm_graphique", 'Int'>
    readonly Consigne: FieldRef<"tm_graphique", 'Float'>
    readonly Consigne_Sup: FieldRef<"tm_graphique", 'Float'>
    readonly Consigne_Inf: FieldRef<"tm_graphique", 'Float'>
    readonly Unite: FieldRef<"tm_graphique", 'String'>
    readonly Sonde_Numero_Serie: FieldRef<"tm_graphique", 'String'>
    readonly Adresse_Sonde: FieldRef<"tm_graphique", 'String'>
    readonly Id_Sonde: FieldRef<"tm_graphique", 'Int'>
    readonly Id_Lieu: FieldRef<"tm_graphique", 'Int'>
    readonly Est_Valeur_Null: FieldRef<"tm_graphique", 'Boolean'>
    readonly Frequence: FieldRef<"tm_graphique", 'Int'>
    readonly Est_Etat_Alarme: FieldRef<"tm_graphique", 'Int'>
    readonly Consigne_Inf_Pre_Alarme: FieldRef<"tm_graphique", 'Float'>
    readonly Consigne_Sup_Pre_Alarme: FieldRef<"tm_graphique", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * tm_graphique findUnique
   */
  export type tm_graphiqueFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which tm_graphique to fetch.
     */
    where: tm_graphiqueWhereUniqueInput
  }

  /**
   * tm_graphique findUniqueOrThrow
   */
  export type tm_graphiqueFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which tm_graphique to fetch.
     */
    where: tm_graphiqueWhereUniqueInput
  }

  /**
   * tm_graphique findFirst
   */
  export type tm_graphiqueFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which tm_graphique to fetch.
     */
    where?: tm_graphiqueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_graphiques to fetch.
     */
    orderBy?: tm_graphiqueOrderByWithRelationInput | tm_graphiqueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_graphiques.
     */
    cursor?: tm_graphiqueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_graphiques from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_graphiques.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_graphiques.
     */
    distinct?: Tm_graphiqueScalarFieldEnum | Tm_graphiqueScalarFieldEnum[]
  }

  /**
   * tm_graphique findFirstOrThrow
   */
  export type tm_graphiqueFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which tm_graphique to fetch.
     */
    where?: tm_graphiqueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_graphiques to fetch.
     */
    orderBy?: tm_graphiqueOrderByWithRelationInput | tm_graphiqueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_graphiques.
     */
    cursor?: tm_graphiqueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_graphiques from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_graphiques.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_graphiques.
     */
    distinct?: Tm_graphiqueScalarFieldEnum | Tm_graphiqueScalarFieldEnum[]
  }

  /**
   * tm_graphique findMany
   */
  export type tm_graphiqueFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
    /**
     * Filter, which tm_graphiques to fetch.
     */
    where?: tm_graphiqueWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_graphiques to fetch.
     */
    orderBy?: tm_graphiqueOrderByWithRelationInput | tm_graphiqueOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_graphiques.
     */
    cursor?: tm_graphiqueWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_graphiques from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_graphiques.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_graphiques.
     */
    distinct?: Tm_graphiqueScalarFieldEnum | Tm_graphiqueScalarFieldEnum[]
  }

  /**
   * tm_graphique create
   */
  export type tm_graphiqueCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_graphique.
     */
    data: XOR<tm_graphiqueCreateInput, tm_graphiqueUncheckedCreateInput>
  }

  /**
   * tm_graphique createMany
   */
  export type tm_graphiqueCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_graphiques.
     */
    data: tm_graphiqueCreateManyInput | tm_graphiqueCreateManyInput[]
  }

  /**
   * tm_graphique update
   */
  export type tm_graphiqueUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_graphique.
     */
    data: XOR<tm_graphiqueUpdateInput, tm_graphiqueUncheckedUpdateInput>
    /**
     * Choose, which tm_graphique to update.
     */
    where: tm_graphiqueWhereUniqueInput
  }

  /**
   * tm_graphique updateMany
   */
  export type tm_graphiqueUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_graphiques.
     */
    data: XOR<tm_graphiqueUpdateManyMutationInput, tm_graphiqueUncheckedUpdateManyInput>
    /**
     * Filter which tm_graphiques to update
     */
    where?: tm_graphiqueWhereInput
    /**
     * Limit how many tm_graphiques to update.
     */
    limit?: number
  }

  /**
   * tm_graphique upsert
   */
  export type tm_graphiqueUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_graphique to update in case it exists.
     */
    where: tm_graphiqueWhereUniqueInput
    /**
     * In case the tm_graphique found by the `where` argument doesn't exist, create a new tm_graphique with this data.
     */
    create: XOR<tm_graphiqueCreateInput, tm_graphiqueUncheckedCreateInput>
    /**
     * In case the tm_graphique was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_graphiqueUpdateInput, tm_graphiqueUncheckedUpdateInput>
  }

  /**
   * tm_graphique delete
   */
  export type tm_graphiqueDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
    /**
     * Filter which tm_graphique to delete.
     */
    where: tm_graphiqueWhereUniqueInput
  }

  /**
   * tm_graphique deleteMany
   */
  export type tm_graphiqueDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_graphiques to delete
     */
    where?: tm_graphiqueWhereInput
    /**
     * Limit how many tm_graphiques to delete.
     */
    limit?: number
  }

  /**
   * tm_graphique without action
   */
  export type tm_graphiqueDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_graphique
     */
    select?: tm_graphiqueSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_graphique
     */
    omit?: tm_graphiqueOmit<ExtArgs> | null
  }


  /**
   * Model tm_journal
   */

  export type AggregateTm_journal = {
    _count: Tm_journalCountAggregateOutputType | null
    _avg: Tm_journalAvgAggregateOutputType | null
    _sum: Tm_journalSumAggregateOutputType | null
    _min: Tm_journalMinAggregateOutputType | null
    _max: Tm_journalMaxAggregateOutputType | null
  }

  export type Tm_journalAvgAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Id_Journal: number | null
    Id_Lieu: number | null
  }

  export type Tm_journalSumAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Id_Journal: number | null
    Id_Lieu: number | null
  }

  export type Tm_journalMinAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Id_Journal: number | null
    Code_Journal: string | null
    Commentaire: string | null
    Nom_Utilisateur: string | null
    Profil_Utilisateur: string | null
    Date_Heure_Journal: Date | null
    Id_Lieu: number | null
    Commentaire_Utilisateur: string | null
  }

  export type Tm_journalMaxAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Id_Journal: number | null
    Code_Journal: string | null
    Commentaire: string | null
    Nom_Utilisateur: string | null
    Profil_Utilisateur: string | null
    Date_Heure_Journal: Date | null
    Id_Lieu: number | null
    Commentaire_Utilisateur: string | null
  }

  export type Tm_journalCountAggregateOutputType = {
    Id_Serveur_BDD: number
    Id_Journal: number
    Code_Journal: number
    Commentaire: number
    Nom_Utilisateur: number
    Profil_Utilisateur: number
    Date_Heure_Journal: number
    Id_Lieu: number
    Commentaire_Utilisateur: number
    _all: number
  }


  export type Tm_journalAvgAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Id_Lieu?: true
  }

  export type Tm_journalSumAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Id_Lieu?: true
  }

  export type Tm_journalMinAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Code_Journal?: true
    Commentaire?: true
    Nom_Utilisateur?: true
    Profil_Utilisateur?: true
    Date_Heure_Journal?: true
    Id_Lieu?: true
    Commentaire_Utilisateur?: true
  }

  export type Tm_journalMaxAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Code_Journal?: true
    Commentaire?: true
    Nom_Utilisateur?: true
    Profil_Utilisateur?: true
    Date_Heure_Journal?: true
    Id_Lieu?: true
    Commentaire_Utilisateur?: true
  }

  export type Tm_journalCountAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Code_Journal?: true
    Commentaire?: true
    Nom_Utilisateur?: true
    Profil_Utilisateur?: true
    Date_Heure_Journal?: true
    Id_Lieu?: true
    Commentaire_Utilisateur?: true
    _all?: true
  }

  export type Tm_journalAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_journal to aggregate.
     */
    where?: tm_journalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journals to fetch.
     */
    orderBy?: tm_journalOrderByWithRelationInput | tm_journalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_journalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_journals
    **/
    _count?: true | Tm_journalCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_journalAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_journalSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_journalMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_journalMaxAggregateInputType
  }

  export type GetTm_journalAggregateType<T extends Tm_journalAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_journal]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_journal[P]>
      : GetScalarType<T[P], AggregateTm_journal[P]>
  }




  export type tm_journalGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_journalWhereInput
    orderBy?: tm_journalOrderByWithAggregationInput | tm_journalOrderByWithAggregationInput[]
    by: Tm_journalScalarFieldEnum[] | Tm_journalScalarFieldEnum
    having?: tm_journalScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_journalCountAggregateInputType | true
    _avg?: Tm_journalAvgAggregateInputType
    _sum?: Tm_journalSumAggregateInputType
    _min?: Tm_journalMinAggregateInputType
    _max?: Tm_journalMaxAggregateInputType
  }

  export type Tm_journalGroupByOutputType = {
    Id_Serveur_BDD: number
    Id_Journal: number
    Code_Journal: string | null
    Commentaire: string | null
    Nom_Utilisateur: string | null
    Profil_Utilisateur: string | null
    Date_Heure_Journal: Date | null
    Id_Lieu: number | null
    Commentaire_Utilisateur: string | null
    _count: Tm_journalCountAggregateOutputType | null
    _avg: Tm_journalAvgAggregateOutputType | null
    _sum: Tm_journalSumAggregateOutputType | null
    _min: Tm_journalMinAggregateOutputType | null
    _max: Tm_journalMaxAggregateOutputType | null
  }

  type GetTm_journalGroupByPayload<T extends tm_journalGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_journalGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_journalGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_journalGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_journalGroupByOutputType[P]>
        }
      >
    >


  export type tm_journalSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Serveur_BDD?: boolean
    Id_Journal?: boolean
    Code_Journal?: boolean
    Commentaire?: boolean
    Nom_Utilisateur?: boolean
    Profil_Utilisateur?: boolean
    Date_Heure_Journal?: boolean
    Id_Lieu?: boolean
    Commentaire_Utilisateur?: boolean
  }, ExtArgs["result"]["tm_journal"]>



  export type tm_journalSelectScalar = {
    Id_Serveur_BDD?: boolean
    Id_Journal?: boolean
    Code_Journal?: boolean
    Commentaire?: boolean
    Nom_Utilisateur?: boolean
    Profil_Utilisateur?: boolean
    Date_Heure_Journal?: boolean
    Id_Lieu?: boolean
    Commentaire_Utilisateur?: boolean
  }

  export type tm_journalOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Serveur_BDD" | "Id_Journal" | "Code_Journal" | "Commentaire" | "Nom_Utilisateur" | "Profil_Utilisateur" | "Date_Heure_Journal" | "Id_Lieu" | "Commentaire_Utilisateur", ExtArgs["result"]["tm_journal"]>

  export type $tm_journalPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_journal"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Serveur_BDD: number
      Id_Journal: number
      Code_Journal: string | null
      Commentaire: string | null
      Nom_Utilisateur: string | null
      Profil_Utilisateur: string | null
      Date_Heure_Journal: Date | null
      Id_Lieu: number | null
      Commentaire_Utilisateur: string | null
    }, ExtArgs["result"]["tm_journal"]>
    composites: {}
  }

  type tm_journalGetPayload<S extends boolean | null | undefined | tm_journalDefaultArgs> = $Result.GetResult<Prisma.$tm_journalPayload, S>

  type tm_journalCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_journalFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_journalCountAggregateInputType | true
    }

  export interface tm_journalDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_journal'], meta: { name: 'tm_journal' } }
    /**
     * Find zero or one Tm_journal that matches the filter.
     * @param {tm_journalFindUniqueArgs} args - Arguments to find a Tm_journal
     * @example
     * // Get one Tm_journal
     * const tm_journal = await prisma.tm_journal.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_journalFindUniqueArgs>(args: SelectSubset<T, tm_journalFindUniqueArgs<ExtArgs>>): Prisma__tm_journalClient<$Result.GetResult<Prisma.$tm_journalPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_journal that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_journalFindUniqueOrThrowArgs} args - Arguments to find a Tm_journal
     * @example
     * // Get one Tm_journal
     * const tm_journal = await prisma.tm_journal.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_journalFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_journalFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_journalClient<$Result.GetResult<Prisma.$tm_journalPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_journal that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journalFindFirstArgs} args - Arguments to find a Tm_journal
     * @example
     * // Get one Tm_journal
     * const tm_journal = await prisma.tm_journal.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_journalFindFirstArgs>(args?: SelectSubset<T, tm_journalFindFirstArgs<ExtArgs>>): Prisma__tm_journalClient<$Result.GetResult<Prisma.$tm_journalPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_journal that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journalFindFirstOrThrowArgs} args - Arguments to find a Tm_journal
     * @example
     * // Get one Tm_journal
     * const tm_journal = await prisma.tm_journal.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_journalFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_journalFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_journalClient<$Result.GetResult<Prisma.$tm_journalPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_journals that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journalFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_journals
     * const tm_journals = await prisma.tm_journal.findMany()
     * 
     * // Get first 10 Tm_journals
     * const tm_journals = await prisma.tm_journal.findMany({ take: 10 })
     * 
     * // Only select the `Id_Serveur_BDD`
     * const tm_journalWithId_Serveur_BDDOnly = await prisma.tm_journal.findMany({ select: { Id_Serveur_BDD: true } })
     * 
     */
    findMany<T extends tm_journalFindManyArgs>(args?: SelectSubset<T, tm_journalFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_journalPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_journal.
     * @param {tm_journalCreateArgs} args - Arguments to create a Tm_journal.
     * @example
     * // Create one Tm_journal
     * const Tm_journal = await prisma.tm_journal.create({
     *   data: {
     *     // ... data to create a Tm_journal
     *   }
     * })
     * 
     */
    create<T extends tm_journalCreateArgs>(args: SelectSubset<T, tm_journalCreateArgs<ExtArgs>>): Prisma__tm_journalClient<$Result.GetResult<Prisma.$tm_journalPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_journals.
     * @param {tm_journalCreateManyArgs} args - Arguments to create many Tm_journals.
     * @example
     * // Create many Tm_journals
     * const tm_journal = await prisma.tm_journal.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_journalCreateManyArgs>(args?: SelectSubset<T, tm_journalCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_journal.
     * @param {tm_journalDeleteArgs} args - Arguments to delete one Tm_journal.
     * @example
     * // Delete one Tm_journal
     * const Tm_journal = await prisma.tm_journal.delete({
     *   where: {
     *     // ... filter to delete one Tm_journal
     *   }
     * })
     * 
     */
    delete<T extends tm_journalDeleteArgs>(args: SelectSubset<T, tm_journalDeleteArgs<ExtArgs>>): Prisma__tm_journalClient<$Result.GetResult<Prisma.$tm_journalPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_journal.
     * @param {tm_journalUpdateArgs} args - Arguments to update one Tm_journal.
     * @example
     * // Update one Tm_journal
     * const tm_journal = await prisma.tm_journal.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_journalUpdateArgs>(args: SelectSubset<T, tm_journalUpdateArgs<ExtArgs>>): Prisma__tm_journalClient<$Result.GetResult<Prisma.$tm_journalPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_journals.
     * @param {tm_journalDeleteManyArgs} args - Arguments to filter Tm_journals to delete.
     * @example
     * // Delete a few Tm_journals
     * const { count } = await prisma.tm_journal.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_journalDeleteManyArgs>(args?: SelectSubset<T, tm_journalDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_journals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journalUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_journals
     * const tm_journal = await prisma.tm_journal.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_journalUpdateManyArgs>(args: SelectSubset<T, tm_journalUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_journal.
     * @param {tm_journalUpsertArgs} args - Arguments to update or create a Tm_journal.
     * @example
     * // Update or create a Tm_journal
     * const tm_journal = await prisma.tm_journal.upsert({
     *   create: {
     *     // ... data to create a Tm_journal
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_journal we want to update
     *   }
     * })
     */
    upsert<T extends tm_journalUpsertArgs>(args: SelectSubset<T, tm_journalUpsertArgs<ExtArgs>>): Prisma__tm_journalClient<$Result.GetResult<Prisma.$tm_journalPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_journals.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journalCountArgs} args - Arguments to filter Tm_journals to count.
     * @example
     * // Count the number of Tm_journals
     * const count = await prisma.tm_journal.count({
     *   where: {
     *     // ... the filter for the Tm_journals we want to count
     *   }
     * })
    **/
    count<T extends tm_journalCountArgs>(
      args?: Subset<T, tm_journalCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_journalCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_journal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_journalAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_journalAggregateArgs>(args: Subset<T, Tm_journalAggregateArgs>): Prisma.PrismaPromise<GetTm_journalAggregateType<T>>

    /**
     * Group by Tm_journal.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journalGroupByArgs} args - Group by arguments.
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
      T extends tm_journalGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_journalGroupByArgs['orderBy'] }
        : { orderBy?: tm_journalGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_journalGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_journalGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_journal model
   */
  readonly fields: tm_journalFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_journal.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_journalClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_journal model
   */
  interface tm_journalFieldRefs {
    readonly Id_Serveur_BDD: FieldRef<"tm_journal", 'Int'>
    readonly Id_Journal: FieldRef<"tm_journal", 'Int'>
    readonly Code_Journal: FieldRef<"tm_journal", 'String'>
    readonly Commentaire: FieldRef<"tm_journal", 'String'>
    readonly Nom_Utilisateur: FieldRef<"tm_journal", 'String'>
    readonly Profil_Utilisateur: FieldRef<"tm_journal", 'String'>
    readonly Date_Heure_Journal: FieldRef<"tm_journal", 'DateTime'>
    readonly Id_Lieu: FieldRef<"tm_journal", 'Int'>
    readonly Commentaire_Utilisateur: FieldRef<"tm_journal", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tm_journal findUnique
   */
  export type tm_journalFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal to fetch.
     */
    where: tm_journalWhereUniqueInput
  }

  /**
   * tm_journal findUniqueOrThrow
   */
  export type tm_journalFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal to fetch.
     */
    where: tm_journalWhereUniqueInput
  }

  /**
   * tm_journal findFirst
   */
  export type tm_journalFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal to fetch.
     */
    where?: tm_journalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journals to fetch.
     */
    orderBy?: tm_journalOrderByWithRelationInput | tm_journalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_journals.
     */
    cursor?: tm_journalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journals.
     */
    distinct?: Tm_journalScalarFieldEnum | Tm_journalScalarFieldEnum[]
  }

  /**
   * tm_journal findFirstOrThrow
   */
  export type tm_journalFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal to fetch.
     */
    where?: tm_journalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journals to fetch.
     */
    orderBy?: tm_journalOrderByWithRelationInput | tm_journalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_journals.
     */
    cursor?: tm_journalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journals.
     */
    distinct?: Tm_journalScalarFieldEnum | Tm_journalScalarFieldEnum[]
  }

  /**
   * tm_journal findMany
   */
  export type tm_journalFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
    /**
     * Filter, which tm_journals to fetch.
     */
    where?: tm_journalWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journals to fetch.
     */
    orderBy?: tm_journalOrderByWithRelationInput | tm_journalOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_journals.
     */
    cursor?: tm_journalWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journals from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journals.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journals.
     */
    distinct?: Tm_journalScalarFieldEnum | Tm_journalScalarFieldEnum[]
  }

  /**
   * tm_journal create
   */
  export type tm_journalCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_journal.
     */
    data: XOR<tm_journalCreateInput, tm_journalUncheckedCreateInput>
  }

  /**
   * tm_journal createMany
   */
  export type tm_journalCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_journals.
     */
    data: tm_journalCreateManyInput | tm_journalCreateManyInput[]
  }

  /**
   * tm_journal update
   */
  export type tm_journalUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_journal.
     */
    data: XOR<tm_journalUpdateInput, tm_journalUncheckedUpdateInput>
    /**
     * Choose, which tm_journal to update.
     */
    where: tm_journalWhereUniqueInput
  }

  /**
   * tm_journal updateMany
   */
  export type tm_journalUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_journals.
     */
    data: XOR<tm_journalUpdateManyMutationInput, tm_journalUncheckedUpdateManyInput>
    /**
     * Filter which tm_journals to update
     */
    where?: tm_journalWhereInput
    /**
     * Limit how many tm_journals to update.
     */
    limit?: number
  }

  /**
   * tm_journal upsert
   */
  export type tm_journalUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_journal to update in case it exists.
     */
    where: tm_journalWhereUniqueInput
    /**
     * In case the tm_journal found by the `where` argument doesn't exist, create a new tm_journal with this data.
     */
    create: XOR<tm_journalCreateInput, tm_journalUncheckedCreateInput>
    /**
     * In case the tm_journal was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_journalUpdateInput, tm_journalUncheckedUpdateInput>
  }

  /**
   * tm_journal delete
   */
  export type tm_journalDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
    /**
     * Filter which tm_journal to delete.
     */
    where: tm_journalWhereUniqueInput
  }

  /**
   * tm_journal deleteMany
   */
  export type tm_journalDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_journals to delete
     */
    where?: tm_journalWhereInput
    /**
     * Limit how many tm_journals to delete.
     */
    limit?: number
  }

  /**
   * tm_journal without action
   */
  export type tm_journalDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal
     */
    select?: tm_journalSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal
     */
    omit?: tm_journalOmit<ExtArgs> | null
  }


  /**
   * Model tm_journal_code
   */

  export type AggregateTm_journal_code = {
    _count: Tm_journal_codeCountAggregateOutputType | null
    _min: Tm_journal_codeMinAggregateOutputType | null
    _max: Tm_journal_codeMaxAggregateOutputType | null
  }

  export type Tm_journal_codeMinAggregateOutputType = {
    Code_Journal: string | null
    Commentaire: string | null
  }

  export type Tm_journal_codeMaxAggregateOutputType = {
    Code_Journal: string | null
    Commentaire: string | null
  }

  export type Tm_journal_codeCountAggregateOutputType = {
    Code_Journal: number
    Commentaire: number
    _all: number
  }


  export type Tm_journal_codeMinAggregateInputType = {
    Code_Journal?: true
    Commentaire?: true
  }

  export type Tm_journal_codeMaxAggregateInputType = {
    Code_Journal?: true
    Commentaire?: true
  }

  export type Tm_journal_codeCountAggregateInputType = {
    Code_Journal?: true
    Commentaire?: true
    _all?: true
  }

  export type Tm_journal_codeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_journal_code to aggregate.
     */
    where?: tm_journal_codeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_codes to fetch.
     */
    orderBy?: tm_journal_codeOrderByWithRelationInput | tm_journal_codeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_journal_codeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_journal_codes
    **/
    _count?: true | Tm_journal_codeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_journal_codeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_journal_codeMaxAggregateInputType
  }

  export type GetTm_journal_codeAggregateType<T extends Tm_journal_codeAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_journal_code]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_journal_code[P]>
      : GetScalarType<T[P], AggregateTm_journal_code[P]>
  }




  export type tm_journal_codeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_journal_codeWhereInput
    orderBy?: tm_journal_codeOrderByWithAggregationInput | tm_journal_codeOrderByWithAggregationInput[]
    by: Tm_journal_codeScalarFieldEnum[] | Tm_journal_codeScalarFieldEnum
    having?: tm_journal_codeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_journal_codeCountAggregateInputType | true
    _min?: Tm_journal_codeMinAggregateInputType
    _max?: Tm_journal_codeMaxAggregateInputType
  }

  export type Tm_journal_codeGroupByOutputType = {
    Code_Journal: string
    Commentaire: string | null
    _count: Tm_journal_codeCountAggregateOutputType | null
    _min: Tm_journal_codeMinAggregateOutputType | null
    _max: Tm_journal_codeMaxAggregateOutputType | null
  }

  type GetTm_journal_codeGroupByPayload<T extends tm_journal_codeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_journal_codeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_journal_codeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_journal_codeGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_journal_codeGroupByOutputType[P]>
        }
      >
    >


  export type tm_journal_codeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Code_Journal?: boolean
    Commentaire?: boolean
  }, ExtArgs["result"]["tm_journal_code"]>



  export type tm_journal_codeSelectScalar = {
    Code_Journal?: boolean
    Commentaire?: boolean
  }

  export type tm_journal_codeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Code_Journal" | "Commentaire", ExtArgs["result"]["tm_journal_code"]>

  export type $tm_journal_codePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_journal_code"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Code_Journal: string
      Commentaire: string | null
    }, ExtArgs["result"]["tm_journal_code"]>
    composites: {}
  }

  type tm_journal_codeGetPayload<S extends boolean | null | undefined | tm_journal_codeDefaultArgs> = $Result.GetResult<Prisma.$tm_journal_codePayload, S>

  type tm_journal_codeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_journal_codeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_journal_codeCountAggregateInputType | true
    }

  export interface tm_journal_codeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_journal_code'], meta: { name: 'tm_journal_code' } }
    /**
     * Find zero or one Tm_journal_code that matches the filter.
     * @param {tm_journal_codeFindUniqueArgs} args - Arguments to find a Tm_journal_code
     * @example
     * // Get one Tm_journal_code
     * const tm_journal_code = await prisma.tm_journal_code.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_journal_codeFindUniqueArgs>(args: SelectSubset<T, tm_journal_codeFindUniqueArgs<ExtArgs>>): Prisma__tm_journal_codeClient<$Result.GetResult<Prisma.$tm_journal_codePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_journal_code that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_journal_codeFindUniqueOrThrowArgs} args - Arguments to find a Tm_journal_code
     * @example
     * // Get one Tm_journal_code
     * const tm_journal_code = await prisma.tm_journal_code.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_journal_codeFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_journal_codeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_journal_codeClient<$Result.GetResult<Prisma.$tm_journal_codePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_journal_code that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_codeFindFirstArgs} args - Arguments to find a Tm_journal_code
     * @example
     * // Get one Tm_journal_code
     * const tm_journal_code = await prisma.tm_journal_code.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_journal_codeFindFirstArgs>(args?: SelectSubset<T, tm_journal_codeFindFirstArgs<ExtArgs>>): Prisma__tm_journal_codeClient<$Result.GetResult<Prisma.$tm_journal_codePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_journal_code that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_codeFindFirstOrThrowArgs} args - Arguments to find a Tm_journal_code
     * @example
     * // Get one Tm_journal_code
     * const tm_journal_code = await prisma.tm_journal_code.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_journal_codeFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_journal_codeFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_journal_codeClient<$Result.GetResult<Prisma.$tm_journal_codePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_journal_codes that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_codeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_journal_codes
     * const tm_journal_codes = await prisma.tm_journal_code.findMany()
     * 
     * // Get first 10 Tm_journal_codes
     * const tm_journal_codes = await prisma.tm_journal_code.findMany({ take: 10 })
     * 
     * // Only select the `Code_Journal`
     * const tm_journal_codeWithCode_JournalOnly = await prisma.tm_journal_code.findMany({ select: { Code_Journal: true } })
     * 
     */
    findMany<T extends tm_journal_codeFindManyArgs>(args?: SelectSubset<T, tm_journal_codeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_journal_codePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_journal_code.
     * @param {tm_journal_codeCreateArgs} args - Arguments to create a Tm_journal_code.
     * @example
     * // Create one Tm_journal_code
     * const Tm_journal_code = await prisma.tm_journal_code.create({
     *   data: {
     *     // ... data to create a Tm_journal_code
     *   }
     * })
     * 
     */
    create<T extends tm_journal_codeCreateArgs>(args: SelectSubset<T, tm_journal_codeCreateArgs<ExtArgs>>): Prisma__tm_journal_codeClient<$Result.GetResult<Prisma.$tm_journal_codePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_journal_codes.
     * @param {tm_journal_codeCreateManyArgs} args - Arguments to create many Tm_journal_codes.
     * @example
     * // Create many Tm_journal_codes
     * const tm_journal_code = await prisma.tm_journal_code.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_journal_codeCreateManyArgs>(args?: SelectSubset<T, tm_journal_codeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_journal_code.
     * @param {tm_journal_codeDeleteArgs} args - Arguments to delete one Tm_journal_code.
     * @example
     * // Delete one Tm_journal_code
     * const Tm_journal_code = await prisma.tm_journal_code.delete({
     *   where: {
     *     // ... filter to delete one Tm_journal_code
     *   }
     * })
     * 
     */
    delete<T extends tm_journal_codeDeleteArgs>(args: SelectSubset<T, tm_journal_codeDeleteArgs<ExtArgs>>): Prisma__tm_journal_codeClient<$Result.GetResult<Prisma.$tm_journal_codePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_journal_code.
     * @param {tm_journal_codeUpdateArgs} args - Arguments to update one Tm_journal_code.
     * @example
     * // Update one Tm_journal_code
     * const tm_journal_code = await prisma.tm_journal_code.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_journal_codeUpdateArgs>(args: SelectSubset<T, tm_journal_codeUpdateArgs<ExtArgs>>): Prisma__tm_journal_codeClient<$Result.GetResult<Prisma.$tm_journal_codePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_journal_codes.
     * @param {tm_journal_codeDeleteManyArgs} args - Arguments to filter Tm_journal_codes to delete.
     * @example
     * // Delete a few Tm_journal_codes
     * const { count } = await prisma.tm_journal_code.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_journal_codeDeleteManyArgs>(args?: SelectSubset<T, tm_journal_codeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_journal_codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_codeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_journal_codes
     * const tm_journal_code = await prisma.tm_journal_code.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_journal_codeUpdateManyArgs>(args: SelectSubset<T, tm_journal_codeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_journal_code.
     * @param {tm_journal_codeUpsertArgs} args - Arguments to update or create a Tm_journal_code.
     * @example
     * // Update or create a Tm_journal_code
     * const tm_journal_code = await prisma.tm_journal_code.upsert({
     *   create: {
     *     // ... data to create a Tm_journal_code
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_journal_code we want to update
     *   }
     * })
     */
    upsert<T extends tm_journal_codeUpsertArgs>(args: SelectSubset<T, tm_journal_codeUpsertArgs<ExtArgs>>): Prisma__tm_journal_codeClient<$Result.GetResult<Prisma.$tm_journal_codePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_journal_codes.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_codeCountArgs} args - Arguments to filter Tm_journal_codes to count.
     * @example
     * // Count the number of Tm_journal_codes
     * const count = await prisma.tm_journal_code.count({
     *   where: {
     *     // ... the filter for the Tm_journal_codes we want to count
     *   }
     * })
    **/
    count<T extends tm_journal_codeCountArgs>(
      args?: Subset<T, tm_journal_codeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_journal_codeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_journal_code.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_journal_codeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_journal_codeAggregateArgs>(args: Subset<T, Tm_journal_codeAggregateArgs>): Prisma.PrismaPromise<GetTm_journal_codeAggregateType<T>>

    /**
     * Group by Tm_journal_code.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_codeGroupByArgs} args - Group by arguments.
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
      T extends tm_journal_codeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_journal_codeGroupByArgs['orderBy'] }
        : { orderBy?: tm_journal_codeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_journal_codeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_journal_codeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_journal_code model
   */
  readonly fields: tm_journal_codeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_journal_code.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_journal_codeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_journal_code model
   */
  interface tm_journal_codeFieldRefs {
    readonly Code_Journal: FieldRef<"tm_journal_code", 'String'>
    readonly Commentaire: FieldRef<"tm_journal_code", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tm_journal_code findUnique
   */
  export type tm_journal_codeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_code to fetch.
     */
    where: tm_journal_codeWhereUniqueInput
  }

  /**
   * tm_journal_code findUniqueOrThrow
   */
  export type tm_journal_codeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_code to fetch.
     */
    where: tm_journal_codeWhereUniqueInput
  }

  /**
   * tm_journal_code findFirst
   */
  export type tm_journal_codeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_code to fetch.
     */
    where?: tm_journal_codeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_codes to fetch.
     */
    orderBy?: tm_journal_codeOrderByWithRelationInput | tm_journal_codeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_journal_codes.
     */
    cursor?: tm_journal_codeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journal_codes.
     */
    distinct?: Tm_journal_codeScalarFieldEnum | Tm_journal_codeScalarFieldEnum[]
  }

  /**
   * tm_journal_code findFirstOrThrow
   */
  export type tm_journal_codeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_code to fetch.
     */
    where?: tm_journal_codeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_codes to fetch.
     */
    orderBy?: tm_journal_codeOrderByWithRelationInput | tm_journal_codeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_journal_codes.
     */
    cursor?: tm_journal_codeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journal_codes.
     */
    distinct?: Tm_journal_codeScalarFieldEnum | Tm_journal_codeScalarFieldEnum[]
  }

  /**
   * tm_journal_code findMany
   */
  export type tm_journal_codeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_codes to fetch.
     */
    where?: tm_journal_codeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_codes to fetch.
     */
    orderBy?: tm_journal_codeOrderByWithRelationInput | tm_journal_codeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_journal_codes.
     */
    cursor?: tm_journal_codeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_codes from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_codes.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journal_codes.
     */
    distinct?: Tm_journal_codeScalarFieldEnum | Tm_journal_codeScalarFieldEnum[]
  }

  /**
   * tm_journal_code create
   */
  export type tm_journal_codeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_journal_code.
     */
    data: XOR<tm_journal_codeCreateInput, tm_journal_codeUncheckedCreateInput>
  }

  /**
   * tm_journal_code createMany
   */
  export type tm_journal_codeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_journal_codes.
     */
    data: tm_journal_codeCreateManyInput | tm_journal_codeCreateManyInput[]
  }

  /**
   * tm_journal_code update
   */
  export type tm_journal_codeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_journal_code.
     */
    data: XOR<tm_journal_codeUpdateInput, tm_journal_codeUncheckedUpdateInput>
    /**
     * Choose, which tm_journal_code to update.
     */
    where: tm_journal_codeWhereUniqueInput
  }

  /**
   * tm_journal_code updateMany
   */
  export type tm_journal_codeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_journal_codes.
     */
    data: XOR<tm_journal_codeUpdateManyMutationInput, tm_journal_codeUncheckedUpdateManyInput>
    /**
     * Filter which tm_journal_codes to update
     */
    where?: tm_journal_codeWhereInput
    /**
     * Limit how many tm_journal_codes to update.
     */
    limit?: number
  }

  /**
   * tm_journal_code upsert
   */
  export type tm_journal_codeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_journal_code to update in case it exists.
     */
    where: tm_journal_codeWhereUniqueInput
    /**
     * In case the tm_journal_code found by the `where` argument doesn't exist, create a new tm_journal_code with this data.
     */
    create: XOR<tm_journal_codeCreateInput, tm_journal_codeUncheckedCreateInput>
    /**
     * In case the tm_journal_code was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_journal_codeUpdateInput, tm_journal_codeUncheckedUpdateInput>
  }

  /**
   * tm_journal_code delete
   */
  export type tm_journal_codeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
    /**
     * Filter which tm_journal_code to delete.
     */
    where: tm_journal_codeWhereUniqueInput
  }

  /**
   * tm_journal_code deleteMany
   */
  export type tm_journal_codeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_journal_codes to delete
     */
    where?: tm_journal_codeWhereInput
    /**
     * Limit how many tm_journal_codes to delete.
     */
    limit?: number
  }

  /**
   * tm_journal_code without action
   */
  export type tm_journal_codeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_code
     */
    select?: tm_journal_codeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_code
     */
    omit?: tm_journal_codeOmit<ExtArgs> | null
  }


  /**
   * Model tm_compteur_id_table
   */

  export type AggregateTm_compteur_id_table = {
    _count: Tm_compteur_id_tableCountAggregateOutputType | null
    _avg: Tm_compteur_id_tableAvgAggregateOutputType | null
    _sum: Tm_compteur_id_tableSumAggregateOutputType | null
    _min: Tm_compteur_id_tableMinAggregateOutputType | null
    _max: Tm_compteur_id_tableMaxAggregateOutputType | null
  }

  export type Tm_compteur_id_tableAvgAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Compteur_Id: number | null
  }

  export type Tm_compteur_id_tableSumAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Compteur_Id: number | null
  }

  export type Tm_compteur_id_tableMinAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Nom_Table: string | null
    Compteur_Id: number | null
  }

  export type Tm_compteur_id_tableMaxAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Nom_Table: string | null
    Compteur_Id: number | null
  }

  export type Tm_compteur_id_tableCountAggregateOutputType = {
    Id_Serveur_BDD: number
    Nom_Table: number
    Compteur_Id: number
    _all: number
  }


  export type Tm_compteur_id_tableAvgAggregateInputType = {
    Id_Serveur_BDD?: true
    Compteur_Id?: true
  }

  export type Tm_compteur_id_tableSumAggregateInputType = {
    Id_Serveur_BDD?: true
    Compteur_Id?: true
  }

  export type Tm_compteur_id_tableMinAggregateInputType = {
    Id_Serveur_BDD?: true
    Nom_Table?: true
    Compteur_Id?: true
  }

  export type Tm_compteur_id_tableMaxAggregateInputType = {
    Id_Serveur_BDD?: true
    Nom_Table?: true
    Compteur_Id?: true
  }

  export type Tm_compteur_id_tableCountAggregateInputType = {
    Id_Serveur_BDD?: true
    Nom_Table?: true
    Compteur_Id?: true
    _all?: true
  }

  export type Tm_compteur_id_tableAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_compteur_id_table to aggregate.
     */
    where?: tm_compteur_id_tableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_compteur_id_tables to fetch.
     */
    orderBy?: tm_compteur_id_tableOrderByWithRelationInput | tm_compteur_id_tableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_compteur_id_tableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_compteur_id_tables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_compteur_id_tables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_compteur_id_tables
    **/
    _count?: true | Tm_compteur_id_tableCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_compteur_id_tableAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_compteur_id_tableSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_compteur_id_tableMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_compteur_id_tableMaxAggregateInputType
  }

  export type GetTm_compteur_id_tableAggregateType<T extends Tm_compteur_id_tableAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_compteur_id_table]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_compteur_id_table[P]>
      : GetScalarType<T[P], AggregateTm_compteur_id_table[P]>
  }




  export type tm_compteur_id_tableGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_compteur_id_tableWhereInput
    orderBy?: tm_compteur_id_tableOrderByWithAggregationInput | tm_compteur_id_tableOrderByWithAggregationInput[]
    by: Tm_compteur_id_tableScalarFieldEnum[] | Tm_compteur_id_tableScalarFieldEnum
    having?: tm_compteur_id_tableScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_compteur_id_tableCountAggregateInputType | true
    _avg?: Tm_compteur_id_tableAvgAggregateInputType
    _sum?: Tm_compteur_id_tableSumAggregateInputType
    _min?: Tm_compteur_id_tableMinAggregateInputType
    _max?: Tm_compteur_id_tableMaxAggregateInputType
  }

  export type Tm_compteur_id_tableGroupByOutputType = {
    Id_Serveur_BDD: number
    Nom_Table: string
    Compteur_Id: number | null
    _count: Tm_compteur_id_tableCountAggregateOutputType | null
    _avg: Tm_compteur_id_tableAvgAggregateOutputType | null
    _sum: Tm_compteur_id_tableSumAggregateOutputType | null
    _min: Tm_compteur_id_tableMinAggregateOutputType | null
    _max: Tm_compteur_id_tableMaxAggregateOutputType | null
  }

  type GetTm_compteur_id_tableGroupByPayload<T extends tm_compteur_id_tableGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_compteur_id_tableGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_compteur_id_tableGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_compteur_id_tableGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_compteur_id_tableGroupByOutputType[P]>
        }
      >
    >


  export type tm_compteur_id_tableSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Serveur_BDD?: boolean
    Nom_Table?: boolean
    Compteur_Id?: boolean
  }, ExtArgs["result"]["tm_compteur_id_table"]>



  export type tm_compteur_id_tableSelectScalar = {
    Id_Serveur_BDD?: boolean
    Nom_Table?: boolean
    Compteur_Id?: boolean
  }

  export type tm_compteur_id_tableOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Serveur_BDD" | "Nom_Table" | "Compteur_Id", ExtArgs["result"]["tm_compteur_id_table"]>

  export type $tm_compteur_id_tablePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_compteur_id_table"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Serveur_BDD: number
      Nom_Table: string
      Compteur_Id: number | null
    }, ExtArgs["result"]["tm_compteur_id_table"]>
    composites: {}
  }

  type tm_compteur_id_tableGetPayload<S extends boolean | null | undefined | tm_compteur_id_tableDefaultArgs> = $Result.GetResult<Prisma.$tm_compteur_id_tablePayload, S>

  type tm_compteur_id_tableCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_compteur_id_tableFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_compteur_id_tableCountAggregateInputType | true
    }

  export interface tm_compteur_id_tableDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_compteur_id_table'], meta: { name: 'tm_compteur_id_table' } }
    /**
     * Find zero or one Tm_compteur_id_table that matches the filter.
     * @param {tm_compteur_id_tableFindUniqueArgs} args - Arguments to find a Tm_compteur_id_table
     * @example
     * // Get one Tm_compteur_id_table
     * const tm_compteur_id_table = await prisma.tm_compteur_id_table.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_compteur_id_tableFindUniqueArgs>(args: SelectSubset<T, tm_compteur_id_tableFindUniqueArgs<ExtArgs>>): Prisma__tm_compteur_id_tableClient<$Result.GetResult<Prisma.$tm_compteur_id_tablePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_compteur_id_table that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_compteur_id_tableFindUniqueOrThrowArgs} args - Arguments to find a Tm_compteur_id_table
     * @example
     * // Get one Tm_compteur_id_table
     * const tm_compteur_id_table = await prisma.tm_compteur_id_table.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_compteur_id_tableFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_compteur_id_tableFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_compteur_id_tableClient<$Result.GetResult<Prisma.$tm_compteur_id_tablePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_compteur_id_table that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_compteur_id_tableFindFirstArgs} args - Arguments to find a Tm_compteur_id_table
     * @example
     * // Get one Tm_compteur_id_table
     * const tm_compteur_id_table = await prisma.tm_compteur_id_table.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_compteur_id_tableFindFirstArgs>(args?: SelectSubset<T, tm_compteur_id_tableFindFirstArgs<ExtArgs>>): Prisma__tm_compteur_id_tableClient<$Result.GetResult<Prisma.$tm_compteur_id_tablePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_compteur_id_table that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_compteur_id_tableFindFirstOrThrowArgs} args - Arguments to find a Tm_compteur_id_table
     * @example
     * // Get one Tm_compteur_id_table
     * const tm_compteur_id_table = await prisma.tm_compteur_id_table.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_compteur_id_tableFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_compteur_id_tableFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_compteur_id_tableClient<$Result.GetResult<Prisma.$tm_compteur_id_tablePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_compteur_id_tables that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_compteur_id_tableFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_compteur_id_tables
     * const tm_compteur_id_tables = await prisma.tm_compteur_id_table.findMany()
     * 
     * // Get first 10 Tm_compteur_id_tables
     * const tm_compteur_id_tables = await prisma.tm_compteur_id_table.findMany({ take: 10 })
     * 
     * // Only select the `Id_Serveur_BDD`
     * const tm_compteur_id_tableWithId_Serveur_BDDOnly = await prisma.tm_compteur_id_table.findMany({ select: { Id_Serveur_BDD: true } })
     * 
     */
    findMany<T extends tm_compteur_id_tableFindManyArgs>(args?: SelectSubset<T, tm_compteur_id_tableFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_compteur_id_tablePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_compteur_id_table.
     * @param {tm_compteur_id_tableCreateArgs} args - Arguments to create a Tm_compteur_id_table.
     * @example
     * // Create one Tm_compteur_id_table
     * const Tm_compteur_id_table = await prisma.tm_compteur_id_table.create({
     *   data: {
     *     // ... data to create a Tm_compteur_id_table
     *   }
     * })
     * 
     */
    create<T extends tm_compteur_id_tableCreateArgs>(args: SelectSubset<T, tm_compteur_id_tableCreateArgs<ExtArgs>>): Prisma__tm_compteur_id_tableClient<$Result.GetResult<Prisma.$tm_compteur_id_tablePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_compteur_id_tables.
     * @param {tm_compteur_id_tableCreateManyArgs} args - Arguments to create many Tm_compteur_id_tables.
     * @example
     * // Create many Tm_compteur_id_tables
     * const tm_compteur_id_table = await prisma.tm_compteur_id_table.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_compteur_id_tableCreateManyArgs>(args?: SelectSubset<T, tm_compteur_id_tableCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_compteur_id_table.
     * @param {tm_compteur_id_tableDeleteArgs} args - Arguments to delete one Tm_compteur_id_table.
     * @example
     * // Delete one Tm_compteur_id_table
     * const Tm_compteur_id_table = await prisma.tm_compteur_id_table.delete({
     *   where: {
     *     // ... filter to delete one Tm_compteur_id_table
     *   }
     * })
     * 
     */
    delete<T extends tm_compteur_id_tableDeleteArgs>(args: SelectSubset<T, tm_compteur_id_tableDeleteArgs<ExtArgs>>): Prisma__tm_compteur_id_tableClient<$Result.GetResult<Prisma.$tm_compteur_id_tablePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_compteur_id_table.
     * @param {tm_compteur_id_tableUpdateArgs} args - Arguments to update one Tm_compteur_id_table.
     * @example
     * // Update one Tm_compteur_id_table
     * const tm_compteur_id_table = await prisma.tm_compteur_id_table.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_compteur_id_tableUpdateArgs>(args: SelectSubset<T, tm_compteur_id_tableUpdateArgs<ExtArgs>>): Prisma__tm_compteur_id_tableClient<$Result.GetResult<Prisma.$tm_compteur_id_tablePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_compteur_id_tables.
     * @param {tm_compteur_id_tableDeleteManyArgs} args - Arguments to filter Tm_compteur_id_tables to delete.
     * @example
     * // Delete a few Tm_compteur_id_tables
     * const { count } = await prisma.tm_compteur_id_table.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_compteur_id_tableDeleteManyArgs>(args?: SelectSubset<T, tm_compteur_id_tableDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_compteur_id_tables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_compteur_id_tableUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_compteur_id_tables
     * const tm_compteur_id_table = await prisma.tm_compteur_id_table.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_compteur_id_tableUpdateManyArgs>(args: SelectSubset<T, tm_compteur_id_tableUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_compteur_id_table.
     * @param {tm_compteur_id_tableUpsertArgs} args - Arguments to update or create a Tm_compteur_id_table.
     * @example
     * // Update or create a Tm_compteur_id_table
     * const tm_compteur_id_table = await prisma.tm_compteur_id_table.upsert({
     *   create: {
     *     // ... data to create a Tm_compteur_id_table
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_compteur_id_table we want to update
     *   }
     * })
     */
    upsert<T extends tm_compteur_id_tableUpsertArgs>(args: SelectSubset<T, tm_compteur_id_tableUpsertArgs<ExtArgs>>): Prisma__tm_compteur_id_tableClient<$Result.GetResult<Prisma.$tm_compteur_id_tablePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_compteur_id_tables.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_compteur_id_tableCountArgs} args - Arguments to filter Tm_compteur_id_tables to count.
     * @example
     * // Count the number of Tm_compteur_id_tables
     * const count = await prisma.tm_compteur_id_table.count({
     *   where: {
     *     // ... the filter for the Tm_compteur_id_tables we want to count
     *   }
     * })
    **/
    count<T extends tm_compteur_id_tableCountArgs>(
      args?: Subset<T, tm_compteur_id_tableCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_compteur_id_tableCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_compteur_id_table.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_compteur_id_tableAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_compteur_id_tableAggregateArgs>(args: Subset<T, Tm_compteur_id_tableAggregateArgs>): Prisma.PrismaPromise<GetTm_compteur_id_tableAggregateType<T>>

    /**
     * Group by Tm_compteur_id_table.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_compteur_id_tableGroupByArgs} args - Group by arguments.
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
      T extends tm_compteur_id_tableGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_compteur_id_tableGroupByArgs['orderBy'] }
        : { orderBy?: tm_compteur_id_tableGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_compteur_id_tableGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_compteur_id_tableGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_compteur_id_table model
   */
  readonly fields: tm_compteur_id_tableFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_compteur_id_table.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_compteur_id_tableClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_compteur_id_table model
   */
  interface tm_compteur_id_tableFieldRefs {
    readonly Id_Serveur_BDD: FieldRef<"tm_compteur_id_table", 'Int'>
    readonly Nom_Table: FieldRef<"tm_compteur_id_table", 'String'>
    readonly Compteur_Id: FieldRef<"tm_compteur_id_table", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * tm_compteur_id_table findUnique
   */
  export type tm_compteur_id_tableFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
    /**
     * Filter, which tm_compteur_id_table to fetch.
     */
    where: tm_compteur_id_tableWhereUniqueInput
  }

  /**
   * tm_compteur_id_table findUniqueOrThrow
   */
  export type tm_compteur_id_tableFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
    /**
     * Filter, which tm_compteur_id_table to fetch.
     */
    where: tm_compteur_id_tableWhereUniqueInput
  }

  /**
   * tm_compteur_id_table findFirst
   */
  export type tm_compteur_id_tableFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
    /**
     * Filter, which tm_compteur_id_table to fetch.
     */
    where?: tm_compteur_id_tableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_compteur_id_tables to fetch.
     */
    orderBy?: tm_compteur_id_tableOrderByWithRelationInput | tm_compteur_id_tableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_compteur_id_tables.
     */
    cursor?: tm_compteur_id_tableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_compteur_id_tables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_compteur_id_tables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_compteur_id_tables.
     */
    distinct?: Tm_compteur_id_tableScalarFieldEnum | Tm_compteur_id_tableScalarFieldEnum[]
  }

  /**
   * tm_compteur_id_table findFirstOrThrow
   */
  export type tm_compteur_id_tableFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
    /**
     * Filter, which tm_compteur_id_table to fetch.
     */
    where?: tm_compteur_id_tableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_compteur_id_tables to fetch.
     */
    orderBy?: tm_compteur_id_tableOrderByWithRelationInput | tm_compteur_id_tableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_compteur_id_tables.
     */
    cursor?: tm_compteur_id_tableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_compteur_id_tables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_compteur_id_tables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_compteur_id_tables.
     */
    distinct?: Tm_compteur_id_tableScalarFieldEnum | Tm_compteur_id_tableScalarFieldEnum[]
  }

  /**
   * tm_compteur_id_table findMany
   */
  export type tm_compteur_id_tableFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
    /**
     * Filter, which tm_compteur_id_tables to fetch.
     */
    where?: tm_compteur_id_tableWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_compteur_id_tables to fetch.
     */
    orderBy?: tm_compteur_id_tableOrderByWithRelationInput | tm_compteur_id_tableOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_compteur_id_tables.
     */
    cursor?: tm_compteur_id_tableWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_compteur_id_tables from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_compteur_id_tables.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_compteur_id_tables.
     */
    distinct?: Tm_compteur_id_tableScalarFieldEnum | Tm_compteur_id_tableScalarFieldEnum[]
  }

  /**
   * tm_compteur_id_table create
   */
  export type tm_compteur_id_tableCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_compteur_id_table.
     */
    data: XOR<tm_compteur_id_tableCreateInput, tm_compteur_id_tableUncheckedCreateInput>
  }

  /**
   * tm_compteur_id_table createMany
   */
  export type tm_compteur_id_tableCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_compteur_id_tables.
     */
    data: tm_compteur_id_tableCreateManyInput | tm_compteur_id_tableCreateManyInput[]
  }

  /**
   * tm_compteur_id_table update
   */
  export type tm_compteur_id_tableUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_compteur_id_table.
     */
    data: XOR<tm_compteur_id_tableUpdateInput, tm_compteur_id_tableUncheckedUpdateInput>
    /**
     * Choose, which tm_compteur_id_table to update.
     */
    where: tm_compteur_id_tableWhereUniqueInput
  }

  /**
   * tm_compteur_id_table updateMany
   */
  export type tm_compteur_id_tableUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_compteur_id_tables.
     */
    data: XOR<tm_compteur_id_tableUpdateManyMutationInput, tm_compteur_id_tableUncheckedUpdateManyInput>
    /**
     * Filter which tm_compteur_id_tables to update
     */
    where?: tm_compteur_id_tableWhereInput
    /**
     * Limit how many tm_compteur_id_tables to update.
     */
    limit?: number
  }

  /**
   * tm_compteur_id_table upsert
   */
  export type tm_compteur_id_tableUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_compteur_id_table to update in case it exists.
     */
    where: tm_compteur_id_tableWhereUniqueInput
    /**
     * In case the tm_compteur_id_table found by the `where` argument doesn't exist, create a new tm_compteur_id_table with this data.
     */
    create: XOR<tm_compteur_id_tableCreateInput, tm_compteur_id_tableUncheckedCreateInput>
    /**
     * In case the tm_compteur_id_table was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_compteur_id_tableUpdateInput, tm_compteur_id_tableUncheckedUpdateInput>
  }

  /**
   * tm_compteur_id_table delete
   */
  export type tm_compteur_id_tableDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
    /**
     * Filter which tm_compteur_id_table to delete.
     */
    where: tm_compteur_id_tableWhereUniqueInput
  }

  /**
   * tm_compteur_id_table deleteMany
   */
  export type tm_compteur_id_tableDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_compteur_id_tables to delete
     */
    where?: tm_compteur_id_tableWhereInput
    /**
     * Limit how many tm_compteur_id_tables to delete.
     */
    limit?: number
  }

  /**
   * tm_compteur_id_table without action
   */
  export type tm_compteur_id_tableDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_compteur_id_table
     */
    select?: tm_compteur_id_tableSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_compteur_id_table
     */
    omit?: tm_compteur_id_tableOmit<ExtArgs> | null
  }


  /**
   * Model tm_mesures
   */

  export type AggregateTm_mesures = {
    _count: Tm_mesuresCountAggregateOutputType | null
    _avg: Tm_mesuresAvgAggregateOutputType | null
    _sum: Tm_mesuresSumAggregateOutputType | null
    _min: Tm_mesuresMinAggregateOutputType | null
    _max: Tm_mesuresMaxAggregateOutputType | null
  }

  export type Tm_mesuresAvgAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Id_Mesure: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Id_Lieu: number | null
    Est_Valeur_Null: number | null
    Frequence: number | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
  }

  export type Tm_mesuresSumAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Id_Mesure: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Id_Lieu: number | null
    Est_Valeur_Null: number | null
    Frequence: number | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
  }

  export type Tm_mesuresMinAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Id_Mesure: number | null
    Date_Heure_Mesure: Date | null
    Valeur: number | null
    Valeur_Brute: number | null
    Est_Valeur_Memoire: boolean | null
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    Sonde_Numero_Serie: string | null
    Adresse_Sonde: string | null
    Id_Lieu: number | null
    Est_Valeur_Null: number | null
    Frequence: number | null
    Est_Etat_Alarme: boolean | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
    Rssi: string | null
    Tension: string | null
  }

  export type Tm_mesuresMaxAggregateOutputType = {
    Id_Serveur_BDD: number | null
    Id_Mesure: number | null
    Date_Heure_Mesure: Date | null
    Valeur: number | null
    Valeur_Brute: number | null
    Est_Valeur_Memoire: boolean | null
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    Sonde_Numero_Serie: string | null
    Adresse_Sonde: string | null
    Id_Lieu: number | null
    Est_Valeur_Null: number | null
    Frequence: number | null
    Est_Etat_Alarme: boolean | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
    Rssi: string | null
    Tension: string | null
  }

  export type Tm_mesuresCountAggregateOutputType = {
    Id_Serveur_BDD: number
    Id_Mesure: number
    Date_Heure_Mesure: number
    Valeur: number
    Valeur_Brute: number
    Est_Valeur_Memoire: number
    Nb_Decimal: number
    Consigne: number
    Consigne_Sup: number
    Consigne_Inf: number
    Unite: number
    Sonde_Numero_Serie: number
    Adresse_Sonde: number
    Id_Lieu: number
    Est_Valeur_Null: number
    Frequence: number
    Est_Etat_Alarme: number
    Consigne_Inf_Pre_Alarme: number
    Consigne_Sup_Pre_Alarme: number
    Moyenne: number
    Rssi: number
    Tension: number
    _all: number
  }


  export type Tm_mesuresAvgAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
  }

  export type Tm_mesuresSumAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
  }

  export type Tm_mesuresMinAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Mesure?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Est_Valeur_Memoire?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    Sonde_Numero_Serie?: true
    Adresse_Sonde?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Est_Etat_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
    Rssi?: true
    Tension?: true
  }

  export type Tm_mesuresMaxAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Mesure?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Est_Valeur_Memoire?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    Sonde_Numero_Serie?: true
    Adresse_Sonde?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Est_Etat_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
    Rssi?: true
    Tension?: true
  }

  export type Tm_mesuresCountAggregateInputType = {
    Id_Serveur_BDD?: true
    Id_Mesure?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Est_Valeur_Memoire?: true
    Nb_Decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    Sonde_Numero_Serie?: true
    Adresse_Sonde?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Est_Etat_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
    Rssi?: true
    Tension?: true
    _all?: true
  }

  export type Tm_mesuresAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures to aggregate.
     */
    where?: tm_mesuresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures to fetch.
     */
    orderBy?: tm_mesuresOrderByWithRelationInput | tm_mesuresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mesuresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mesures
    **/
    _count?: true | Tm_mesuresCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mesuresAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mesuresSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mesuresMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mesuresMaxAggregateInputType
  }

  export type GetTm_mesuresAggregateType<T extends Tm_mesuresAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mesures]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mesures[P]>
      : GetScalarType<T[P], AggregateTm_mesures[P]>
  }




  export type tm_mesuresGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mesuresWhereInput
    orderBy?: tm_mesuresOrderByWithAggregationInput | tm_mesuresOrderByWithAggregationInput[]
    by: Tm_mesuresScalarFieldEnum[] | Tm_mesuresScalarFieldEnum
    having?: tm_mesuresScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mesuresCountAggregateInputType | true
    _avg?: Tm_mesuresAvgAggregateInputType
    _sum?: Tm_mesuresSumAggregateInputType
    _min?: Tm_mesuresMinAggregateInputType
    _max?: Tm_mesuresMaxAggregateInputType
  }

  export type Tm_mesuresGroupByOutputType = {
    Id_Serveur_BDD: number
    Id_Mesure: number
    Date_Heure_Mesure: Date
    Valeur: number | null
    Valeur_Brute: number | null
    Est_Valeur_Memoire: boolean
    Nb_Decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    Sonde_Numero_Serie: string | null
    Adresse_Sonde: string | null
    Id_Lieu: number
    Est_Valeur_Null: number
    Frequence: number | null
    Est_Etat_Alarme: boolean
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
    Rssi: string | null
    Tension: string | null
    _count: Tm_mesuresCountAggregateOutputType | null
    _avg: Tm_mesuresAvgAggregateOutputType | null
    _sum: Tm_mesuresSumAggregateOutputType | null
    _min: Tm_mesuresMinAggregateOutputType | null
    _max: Tm_mesuresMaxAggregateOutputType | null
  }

  type GetTm_mesuresGroupByPayload<T extends tm_mesuresGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mesuresGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mesuresGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mesuresGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mesuresGroupByOutputType[P]>
        }
      >
    >


  export type tm_mesuresSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Serveur_BDD?: boolean
    Id_Mesure?: boolean
    Date_Heure_Mesure?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Est_Valeur_Memoire?: boolean
    Nb_Decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    Sonde_Numero_Serie?: boolean
    Adresse_Sonde?: boolean
    Id_Lieu?: boolean
    Est_Valeur_Null?: boolean
    Frequence?: boolean
    Est_Etat_Alarme?: boolean
    Consigne_Inf_Pre_Alarme?: boolean
    Consigne_Sup_Pre_Alarme?: boolean
    Moyenne?: boolean
    Rssi?: boolean
    Tension?: boolean
  }, ExtArgs["result"]["tm_mesures"]>



  export type tm_mesuresSelectScalar = {
    Id_Serveur_BDD?: boolean
    Id_Mesure?: boolean
    Date_Heure_Mesure?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Est_Valeur_Memoire?: boolean
    Nb_Decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    Sonde_Numero_Serie?: boolean
    Adresse_Sonde?: boolean
    Id_Lieu?: boolean
    Est_Valeur_Null?: boolean
    Frequence?: boolean
    Est_Etat_Alarme?: boolean
    Consigne_Inf_Pre_Alarme?: boolean
    Consigne_Sup_Pre_Alarme?: boolean
    Moyenne?: boolean
    Rssi?: boolean
    Tension?: boolean
  }

  export type tm_mesuresOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Serveur_BDD" | "Id_Mesure" | "Date_Heure_Mesure" | "Valeur" | "Valeur_Brute" | "Est_Valeur_Memoire" | "Nb_Decimal" | "Consigne" | "Consigne_Sup" | "Consigne_Inf" | "Unite" | "Sonde_Numero_Serie" | "Adresse_Sonde" | "Id_Lieu" | "Est_Valeur_Null" | "Frequence" | "Est_Etat_Alarme" | "Consigne_Inf_Pre_Alarme" | "Consigne_Sup_Pre_Alarme" | "Moyenne" | "Rssi" | "Tension", ExtArgs["result"]["tm_mesures"]>

  export type $tm_mesuresPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mesures"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Serveur_BDD: number
      Id_Mesure: number
      Date_Heure_Mesure: Date
      Valeur: number | null
      Valeur_Brute: number | null
      Est_Valeur_Memoire: boolean
      Nb_Decimal: number | null
      Consigne: number | null
      Consigne_Sup: number | null
      Consigne_Inf: number | null
      Unite: string | null
      Sonde_Numero_Serie: string | null
      Adresse_Sonde: string | null
      Id_Lieu: number
      Est_Valeur_Null: number
      Frequence: number | null
      Est_Etat_Alarme: boolean
      Consigne_Inf_Pre_Alarme: number | null
      Consigne_Sup_Pre_Alarme: number | null
      Moyenne: number | null
      Rssi: string | null
      Tension: string | null
    }, ExtArgs["result"]["tm_mesures"]>
    composites: {}
  }

  type tm_mesuresGetPayload<S extends boolean | null | undefined | tm_mesuresDefaultArgs> = $Result.GetResult<Prisma.$tm_mesuresPayload, S>

  type tm_mesuresCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mesuresFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mesuresCountAggregateInputType | true
    }

  export interface tm_mesuresDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mesures'], meta: { name: 'tm_mesures' } }
    /**
     * Find zero or one Tm_mesures that matches the filter.
     * @param {tm_mesuresFindUniqueArgs} args - Arguments to find a Tm_mesures
     * @example
     * // Get one Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mesuresFindUniqueArgs>(args: SelectSubset<T, tm_mesuresFindUniqueArgs<ExtArgs>>): Prisma__tm_mesuresClient<$Result.GetResult<Prisma.$tm_mesuresPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mesures that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mesuresFindUniqueOrThrowArgs} args - Arguments to find a Tm_mesures
     * @example
     * // Get one Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mesuresFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mesuresFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mesuresClient<$Result.GetResult<Prisma.$tm_mesuresPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesuresFindFirstArgs} args - Arguments to find a Tm_mesures
     * @example
     * // Get one Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mesuresFindFirstArgs>(args?: SelectSubset<T, tm_mesuresFindFirstArgs<ExtArgs>>): Prisma__tm_mesuresClient<$Result.GetResult<Prisma.$tm_mesuresPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesuresFindFirstOrThrowArgs} args - Arguments to find a Tm_mesures
     * @example
     * // Get one Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mesuresFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mesuresFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mesuresClient<$Result.GetResult<Prisma.$tm_mesuresPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mesures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesuresFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.findMany()
     * 
     * // Get first 10 Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.findMany({ take: 10 })
     * 
     * // Only select the `Id_Serveur_BDD`
     * const tm_mesuresWithId_Serveur_BDDOnly = await prisma.tm_mesures.findMany({ select: { Id_Serveur_BDD: true } })
     * 
     */
    findMany<T extends tm_mesuresFindManyArgs>(args?: SelectSubset<T, tm_mesuresFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mesuresPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mesures.
     * @param {tm_mesuresCreateArgs} args - Arguments to create a Tm_mesures.
     * @example
     * // Create one Tm_mesures
     * const Tm_mesures = await prisma.tm_mesures.create({
     *   data: {
     *     // ... data to create a Tm_mesures
     *   }
     * })
     * 
     */
    create<T extends tm_mesuresCreateArgs>(args: SelectSubset<T, tm_mesuresCreateArgs<ExtArgs>>): Prisma__tm_mesuresClient<$Result.GetResult<Prisma.$tm_mesuresPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mesures.
     * @param {tm_mesuresCreateManyArgs} args - Arguments to create many Tm_mesures.
     * @example
     * // Create many Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mesuresCreateManyArgs>(args?: SelectSubset<T, tm_mesuresCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mesures.
     * @param {tm_mesuresDeleteArgs} args - Arguments to delete one Tm_mesures.
     * @example
     * // Delete one Tm_mesures
     * const Tm_mesures = await prisma.tm_mesures.delete({
     *   where: {
     *     // ... filter to delete one Tm_mesures
     *   }
     * })
     * 
     */
    delete<T extends tm_mesuresDeleteArgs>(args: SelectSubset<T, tm_mesuresDeleteArgs<ExtArgs>>): Prisma__tm_mesuresClient<$Result.GetResult<Prisma.$tm_mesuresPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mesures.
     * @param {tm_mesuresUpdateArgs} args - Arguments to update one Tm_mesures.
     * @example
     * // Update one Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mesuresUpdateArgs>(args: SelectSubset<T, tm_mesuresUpdateArgs<ExtArgs>>): Prisma__tm_mesuresClient<$Result.GetResult<Prisma.$tm_mesuresPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mesures.
     * @param {tm_mesuresDeleteManyArgs} args - Arguments to filter Tm_mesures to delete.
     * @example
     * // Delete a few Tm_mesures
     * const { count } = await prisma.tm_mesures.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mesuresDeleteManyArgs>(args?: SelectSubset<T, tm_mesuresDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesuresUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mesuresUpdateManyArgs>(args: SelectSubset<T, tm_mesuresUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mesures.
     * @param {tm_mesuresUpsertArgs} args - Arguments to update or create a Tm_mesures.
     * @example
     * // Update or create a Tm_mesures
     * const tm_mesures = await prisma.tm_mesures.upsert({
     *   create: {
     *     // ... data to create a Tm_mesures
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mesures we want to update
     *   }
     * })
     */
    upsert<T extends tm_mesuresUpsertArgs>(args: SelectSubset<T, tm_mesuresUpsertArgs<ExtArgs>>): Prisma__tm_mesuresClient<$Result.GetResult<Prisma.$tm_mesuresPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesuresCountArgs} args - Arguments to filter Tm_mesures to count.
     * @example
     * // Count the number of Tm_mesures
     * const count = await prisma.tm_mesures.count({
     *   where: {
     *     // ... the filter for the Tm_mesures we want to count
     *   }
     * })
    **/
    count<T extends tm_mesuresCountArgs>(
      args?: Subset<T, tm_mesuresCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mesuresCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mesuresAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mesuresAggregateArgs>(args: Subset<T, Tm_mesuresAggregateArgs>): Prisma.PrismaPromise<GetTm_mesuresAggregateType<T>>

    /**
     * Group by Tm_mesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesuresGroupByArgs} args - Group by arguments.
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
      T extends tm_mesuresGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mesuresGroupByArgs['orderBy'] }
        : { orderBy?: tm_mesuresGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mesuresGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mesuresGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mesures model
   */
  readonly fields: tm_mesuresFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mesures.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mesuresClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mesures model
   */
  interface tm_mesuresFieldRefs {
    readonly Id_Serveur_BDD: FieldRef<"tm_mesures", 'Int'>
    readonly Id_Mesure: FieldRef<"tm_mesures", 'Int'>
    readonly Date_Heure_Mesure: FieldRef<"tm_mesures", 'DateTime'>
    readonly Valeur: FieldRef<"tm_mesures", 'Float'>
    readonly Valeur_Brute: FieldRef<"tm_mesures", 'Float'>
    readonly Est_Valeur_Memoire: FieldRef<"tm_mesures", 'Boolean'>
    readonly Nb_Decimal: FieldRef<"tm_mesures", 'Int'>
    readonly Consigne: FieldRef<"tm_mesures", 'Float'>
    readonly Consigne_Sup: FieldRef<"tm_mesures", 'Float'>
    readonly Consigne_Inf: FieldRef<"tm_mesures", 'Float'>
    readonly Unite: FieldRef<"tm_mesures", 'String'>
    readonly Sonde_Numero_Serie: FieldRef<"tm_mesures", 'String'>
    readonly Adresse_Sonde: FieldRef<"tm_mesures", 'String'>
    readonly Id_Lieu: FieldRef<"tm_mesures", 'Int'>
    readonly Est_Valeur_Null: FieldRef<"tm_mesures", 'Int'>
    readonly Frequence: FieldRef<"tm_mesures", 'Int'>
    readonly Est_Etat_Alarme: FieldRef<"tm_mesures", 'Boolean'>
    readonly Consigne_Inf_Pre_Alarme: FieldRef<"tm_mesures", 'Float'>
    readonly Consigne_Sup_Pre_Alarme: FieldRef<"tm_mesures", 'Float'>
    readonly Moyenne: FieldRef<"tm_mesures", 'Float'>
    readonly Rssi: FieldRef<"tm_mesures", 'String'>
    readonly Tension: FieldRef<"tm_mesures", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tm_mesures findUnique
   */
  export type tm_mesuresFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures to fetch.
     */
    where: tm_mesuresWhereUniqueInput
  }

  /**
   * tm_mesures findUniqueOrThrow
   */
  export type tm_mesuresFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures to fetch.
     */
    where: tm_mesuresWhereUniqueInput
  }

  /**
   * tm_mesures findFirst
   */
  export type tm_mesuresFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures to fetch.
     */
    where?: tm_mesuresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures to fetch.
     */
    orderBy?: tm_mesuresOrderByWithRelationInput | tm_mesuresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures.
     */
    cursor?: tm_mesuresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures.
     */
    distinct?: Tm_mesuresScalarFieldEnum | Tm_mesuresScalarFieldEnum[]
  }

  /**
   * tm_mesures findFirstOrThrow
   */
  export type tm_mesuresFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures to fetch.
     */
    where?: tm_mesuresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures to fetch.
     */
    orderBy?: tm_mesuresOrderByWithRelationInput | tm_mesuresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures.
     */
    cursor?: tm_mesuresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures.
     */
    distinct?: Tm_mesuresScalarFieldEnum | Tm_mesuresScalarFieldEnum[]
  }

  /**
   * tm_mesures findMany
   */
  export type tm_mesuresFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures to fetch.
     */
    where?: tm_mesuresWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures to fetch.
     */
    orderBy?: tm_mesuresOrderByWithRelationInput | tm_mesuresOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mesures.
     */
    cursor?: tm_mesuresWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures.
     */
    distinct?: Tm_mesuresScalarFieldEnum | Tm_mesuresScalarFieldEnum[]
  }

  /**
   * tm_mesures create
   */
  export type tm_mesuresCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mesures.
     */
    data: XOR<tm_mesuresCreateInput, tm_mesuresUncheckedCreateInput>
  }

  /**
   * tm_mesures createMany
   */
  export type tm_mesuresCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mesures.
     */
    data: tm_mesuresCreateManyInput | tm_mesuresCreateManyInput[]
  }

  /**
   * tm_mesures update
   */
  export type tm_mesuresUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mesures.
     */
    data: XOR<tm_mesuresUpdateInput, tm_mesuresUncheckedUpdateInput>
    /**
     * Choose, which tm_mesures to update.
     */
    where: tm_mesuresWhereUniqueInput
  }

  /**
   * tm_mesures updateMany
   */
  export type tm_mesuresUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mesures.
     */
    data: XOR<tm_mesuresUpdateManyMutationInput, tm_mesuresUncheckedUpdateManyInput>
    /**
     * Filter which tm_mesures to update
     */
    where?: tm_mesuresWhereInput
    /**
     * Limit how many tm_mesures to update.
     */
    limit?: number
  }

  /**
   * tm_mesures upsert
   */
  export type tm_mesuresUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mesures to update in case it exists.
     */
    where: tm_mesuresWhereUniqueInput
    /**
     * In case the tm_mesures found by the `where` argument doesn't exist, create a new tm_mesures with this data.
     */
    create: XOR<tm_mesuresCreateInput, tm_mesuresUncheckedCreateInput>
    /**
     * In case the tm_mesures was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mesuresUpdateInput, tm_mesuresUncheckedUpdateInput>
  }

  /**
   * tm_mesures delete
   */
  export type tm_mesuresDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
    /**
     * Filter which tm_mesures to delete.
     */
    where: tm_mesuresWhereUniqueInput
  }

  /**
   * tm_mesures deleteMany
   */
  export type tm_mesuresDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures to delete
     */
    where?: tm_mesuresWhereInput
    /**
     * Limit how many tm_mesures to delete.
     */
    limit?: number
  }

  /**
   * tm_mesures without action
   */
  export type tm_mesuresDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures
     */
    select?: tm_mesuresSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures
     */
    omit?: tm_mesuresOmit<ExtArgs> | null
  }


  /**
   * Model tm_mesures_gso
   */

  export type AggregateTm_mesures_gso = {
    _count: Tm_mesures_gsoCountAggregateOutputType | null
    _avg: Tm_mesures_gsoAvgAggregateOutputType | null
    _sum: Tm_mesures_gsoSumAggregateOutputType | null
    _min: Tm_mesures_gsoMinAggregateOutputType | null
    _max: Tm_mesures_gsoMaxAggregateOutputType | null
  }

  export type Tm_mesures_gsoAvgAggregateOutputType = {
    Id_mesures_gso: number | null
    tep: number | null
  }

  export type Tm_mesures_gsoSumAggregateOutputType = {
    Id_mesures_gso: number | null
    tep: number | null
  }

  export type Tm_mesures_gsoMinAggregateOutputType = {
    Id_mesures_gso: number | null
    id_capteur: string | null
    tep: number | null
    unite: string | null
    date_mesure: Date | null
    rssi: string | null
    tension: string | null
  }

  export type Tm_mesures_gsoMaxAggregateOutputType = {
    Id_mesures_gso: number | null
    id_capteur: string | null
    tep: number | null
    unite: string | null
    date_mesure: Date | null
    rssi: string | null
    tension: string | null
  }

  export type Tm_mesures_gsoCountAggregateOutputType = {
    Id_mesures_gso: number
    id_capteur: number
    tep: number
    unite: number
    date_mesure: number
    rssi: number
    tension: number
    _all: number
  }


  export type Tm_mesures_gsoAvgAggregateInputType = {
    Id_mesures_gso?: true
    tep?: true
  }

  export type Tm_mesures_gsoSumAggregateInputType = {
    Id_mesures_gso?: true
    tep?: true
  }

  export type Tm_mesures_gsoMinAggregateInputType = {
    Id_mesures_gso?: true
    id_capteur?: true
    tep?: true
    unite?: true
    date_mesure?: true
    rssi?: true
    tension?: true
  }

  export type Tm_mesures_gsoMaxAggregateInputType = {
    Id_mesures_gso?: true
    id_capteur?: true
    tep?: true
    unite?: true
    date_mesure?: true
    rssi?: true
    tension?: true
  }

  export type Tm_mesures_gsoCountAggregateInputType = {
    Id_mesures_gso?: true
    id_capteur?: true
    tep?: true
    unite?: true
    date_mesure?: true
    rssi?: true
    tension?: true
    _all?: true
  }

  export type Tm_mesures_gsoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures_gso to aggregate.
     */
    where?: tm_mesures_gsoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_gsos to fetch.
     */
    orderBy?: tm_mesures_gsoOrderByWithRelationInput | tm_mesures_gsoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mesures_gsoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_gsos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_gsos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mesures_gsos
    **/
    _count?: true | Tm_mesures_gsoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mesures_gsoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mesures_gsoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mesures_gsoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mesures_gsoMaxAggregateInputType
  }

  export type GetTm_mesures_gsoAggregateType<T extends Tm_mesures_gsoAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mesures_gso]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mesures_gso[P]>
      : GetScalarType<T[P], AggregateTm_mesures_gso[P]>
  }




  export type tm_mesures_gsoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mesures_gsoWhereInput
    orderBy?: tm_mesures_gsoOrderByWithAggregationInput | tm_mesures_gsoOrderByWithAggregationInput[]
    by: Tm_mesures_gsoScalarFieldEnum[] | Tm_mesures_gsoScalarFieldEnum
    having?: tm_mesures_gsoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mesures_gsoCountAggregateInputType | true
    _avg?: Tm_mesures_gsoAvgAggregateInputType
    _sum?: Tm_mesures_gsoSumAggregateInputType
    _min?: Tm_mesures_gsoMinAggregateInputType
    _max?: Tm_mesures_gsoMaxAggregateInputType
  }

  export type Tm_mesures_gsoGroupByOutputType = {
    Id_mesures_gso: number
    id_capteur: string
    tep: number | null
    unite: string | null
    date_mesure: Date
    rssi: string | null
    tension: string | null
    _count: Tm_mesures_gsoCountAggregateOutputType | null
    _avg: Tm_mesures_gsoAvgAggregateOutputType | null
    _sum: Tm_mesures_gsoSumAggregateOutputType | null
    _min: Tm_mesures_gsoMinAggregateOutputType | null
    _max: Tm_mesures_gsoMaxAggregateOutputType | null
  }

  type GetTm_mesures_gsoGroupByPayload<T extends tm_mesures_gsoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mesures_gsoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mesures_gsoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mesures_gsoGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mesures_gsoGroupByOutputType[P]>
        }
      >
    >


  export type tm_mesures_gsoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_mesures_gso?: boolean
    id_capteur?: boolean
    tep?: boolean
    unite?: boolean
    date_mesure?: boolean
    rssi?: boolean
    tension?: boolean
  }, ExtArgs["result"]["tm_mesures_gso"]>



  export type tm_mesures_gsoSelectScalar = {
    Id_mesures_gso?: boolean
    id_capteur?: boolean
    tep?: boolean
    unite?: boolean
    date_mesure?: boolean
    rssi?: boolean
    tension?: boolean
  }

  export type tm_mesures_gsoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_mesures_gso" | "id_capteur" | "tep" | "unite" | "date_mesure" | "rssi" | "tension", ExtArgs["result"]["tm_mesures_gso"]>

  export type $tm_mesures_gsoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mesures_gso"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_mesures_gso: number
      id_capteur: string
      tep: number | null
      unite: string | null
      date_mesure: Date
      rssi: string | null
      tension: string | null
    }, ExtArgs["result"]["tm_mesures_gso"]>
    composites: {}
  }

  type tm_mesures_gsoGetPayload<S extends boolean | null | undefined | tm_mesures_gsoDefaultArgs> = $Result.GetResult<Prisma.$tm_mesures_gsoPayload, S>

  type tm_mesures_gsoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mesures_gsoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mesures_gsoCountAggregateInputType | true
    }

  export interface tm_mesures_gsoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mesures_gso'], meta: { name: 'tm_mesures_gso' } }
    /**
     * Find zero or one Tm_mesures_gso that matches the filter.
     * @param {tm_mesures_gsoFindUniqueArgs} args - Arguments to find a Tm_mesures_gso
     * @example
     * // Get one Tm_mesures_gso
     * const tm_mesures_gso = await prisma.tm_mesures_gso.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mesures_gsoFindUniqueArgs>(args: SelectSubset<T, tm_mesures_gsoFindUniqueArgs<ExtArgs>>): Prisma__tm_mesures_gsoClient<$Result.GetResult<Prisma.$tm_mesures_gsoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mesures_gso that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mesures_gsoFindUniqueOrThrowArgs} args - Arguments to find a Tm_mesures_gso
     * @example
     * // Get one Tm_mesures_gso
     * const tm_mesures_gso = await prisma.tm_mesures_gso.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mesures_gsoFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mesures_gsoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mesures_gsoClient<$Result.GetResult<Prisma.$tm_mesures_gsoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures_gso that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_gsoFindFirstArgs} args - Arguments to find a Tm_mesures_gso
     * @example
     * // Get one Tm_mesures_gso
     * const tm_mesures_gso = await prisma.tm_mesures_gso.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mesures_gsoFindFirstArgs>(args?: SelectSubset<T, tm_mesures_gsoFindFirstArgs<ExtArgs>>): Prisma__tm_mesures_gsoClient<$Result.GetResult<Prisma.$tm_mesures_gsoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures_gso that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_gsoFindFirstOrThrowArgs} args - Arguments to find a Tm_mesures_gso
     * @example
     * // Get one Tm_mesures_gso
     * const tm_mesures_gso = await prisma.tm_mesures_gso.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mesures_gsoFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mesures_gsoFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mesures_gsoClient<$Result.GetResult<Prisma.$tm_mesures_gsoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mesures_gsos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_gsoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mesures_gsos
     * const tm_mesures_gsos = await prisma.tm_mesures_gso.findMany()
     * 
     * // Get first 10 Tm_mesures_gsos
     * const tm_mesures_gsos = await prisma.tm_mesures_gso.findMany({ take: 10 })
     * 
     * // Only select the `Id_mesures_gso`
     * const tm_mesures_gsoWithId_mesures_gsoOnly = await prisma.tm_mesures_gso.findMany({ select: { Id_mesures_gso: true } })
     * 
     */
    findMany<T extends tm_mesures_gsoFindManyArgs>(args?: SelectSubset<T, tm_mesures_gsoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mesures_gsoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mesures_gso.
     * @param {tm_mesures_gsoCreateArgs} args - Arguments to create a Tm_mesures_gso.
     * @example
     * // Create one Tm_mesures_gso
     * const Tm_mesures_gso = await prisma.tm_mesures_gso.create({
     *   data: {
     *     // ... data to create a Tm_mesures_gso
     *   }
     * })
     * 
     */
    create<T extends tm_mesures_gsoCreateArgs>(args: SelectSubset<T, tm_mesures_gsoCreateArgs<ExtArgs>>): Prisma__tm_mesures_gsoClient<$Result.GetResult<Prisma.$tm_mesures_gsoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mesures_gsos.
     * @param {tm_mesures_gsoCreateManyArgs} args - Arguments to create many Tm_mesures_gsos.
     * @example
     * // Create many Tm_mesures_gsos
     * const tm_mesures_gso = await prisma.tm_mesures_gso.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mesures_gsoCreateManyArgs>(args?: SelectSubset<T, tm_mesures_gsoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mesures_gso.
     * @param {tm_mesures_gsoDeleteArgs} args - Arguments to delete one Tm_mesures_gso.
     * @example
     * // Delete one Tm_mesures_gso
     * const Tm_mesures_gso = await prisma.tm_mesures_gso.delete({
     *   where: {
     *     // ... filter to delete one Tm_mesures_gso
     *   }
     * })
     * 
     */
    delete<T extends tm_mesures_gsoDeleteArgs>(args: SelectSubset<T, tm_mesures_gsoDeleteArgs<ExtArgs>>): Prisma__tm_mesures_gsoClient<$Result.GetResult<Prisma.$tm_mesures_gsoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mesures_gso.
     * @param {tm_mesures_gsoUpdateArgs} args - Arguments to update one Tm_mesures_gso.
     * @example
     * // Update one Tm_mesures_gso
     * const tm_mesures_gso = await prisma.tm_mesures_gso.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mesures_gsoUpdateArgs>(args: SelectSubset<T, tm_mesures_gsoUpdateArgs<ExtArgs>>): Prisma__tm_mesures_gsoClient<$Result.GetResult<Prisma.$tm_mesures_gsoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mesures_gsos.
     * @param {tm_mesures_gsoDeleteManyArgs} args - Arguments to filter Tm_mesures_gsos to delete.
     * @example
     * // Delete a few Tm_mesures_gsos
     * const { count } = await prisma.tm_mesures_gso.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mesures_gsoDeleteManyArgs>(args?: SelectSubset<T, tm_mesures_gsoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mesures_gsos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_gsoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mesures_gsos
     * const tm_mesures_gso = await prisma.tm_mesures_gso.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mesures_gsoUpdateManyArgs>(args: SelectSubset<T, tm_mesures_gsoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mesures_gso.
     * @param {tm_mesures_gsoUpsertArgs} args - Arguments to update or create a Tm_mesures_gso.
     * @example
     * // Update or create a Tm_mesures_gso
     * const tm_mesures_gso = await prisma.tm_mesures_gso.upsert({
     *   create: {
     *     // ... data to create a Tm_mesures_gso
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mesures_gso we want to update
     *   }
     * })
     */
    upsert<T extends tm_mesures_gsoUpsertArgs>(args: SelectSubset<T, tm_mesures_gsoUpsertArgs<ExtArgs>>): Prisma__tm_mesures_gsoClient<$Result.GetResult<Prisma.$tm_mesures_gsoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mesures_gsos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_gsoCountArgs} args - Arguments to filter Tm_mesures_gsos to count.
     * @example
     * // Count the number of Tm_mesures_gsos
     * const count = await prisma.tm_mesures_gso.count({
     *   where: {
     *     // ... the filter for the Tm_mesures_gsos we want to count
     *   }
     * })
    **/
    count<T extends tm_mesures_gsoCountArgs>(
      args?: Subset<T, tm_mesures_gsoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mesures_gsoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mesures_gso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mesures_gsoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mesures_gsoAggregateArgs>(args: Subset<T, Tm_mesures_gsoAggregateArgs>): Prisma.PrismaPromise<GetTm_mesures_gsoAggregateType<T>>

    /**
     * Group by Tm_mesures_gso.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_gsoGroupByArgs} args - Group by arguments.
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
      T extends tm_mesures_gsoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mesures_gsoGroupByArgs['orderBy'] }
        : { orderBy?: tm_mesures_gsoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mesures_gsoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mesures_gsoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mesures_gso model
   */
  readonly fields: tm_mesures_gsoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mesures_gso.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mesures_gsoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mesures_gso model
   */
  interface tm_mesures_gsoFieldRefs {
    readonly Id_mesures_gso: FieldRef<"tm_mesures_gso", 'Int'>
    readonly id_capteur: FieldRef<"tm_mesures_gso", 'String'>
    readonly tep: FieldRef<"tm_mesures_gso", 'Float'>
    readonly unite: FieldRef<"tm_mesures_gso", 'String'>
    readonly date_mesure: FieldRef<"tm_mesures_gso", 'DateTime'>
    readonly rssi: FieldRef<"tm_mesures_gso", 'String'>
    readonly tension: FieldRef<"tm_mesures_gso", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tm_mesures_gso findUnique
   */
  export type tm_mesures_gsoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_gso to fetch.
     */
    where: tm_mesures_gsoWhereUniqueInput
  }

  /**
   * tm_mesures_gso findUniqueOrThrow
   */
  export type tm_mesures_gsoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_gso to fetch.
     */
    where: tm_mesures_gsoWhereUniqueInput
  }

  /**
   * tm_mesures_gso findFirst
   */
  export type tm_mesures_gsoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_gso to fetch.
     */
    where?: tm_mesures_gsoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_gsos to fetch.
     */
    orderBy?: tm_mesures_gsoOrderByWithRelationInput | tm_mesures_gsoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures_gsos.
     */
    cursor?: tm_mesures_gsoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_gsos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_gsos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_gsos.
     */
    distinct?: Tm_mesures_gsoScalarFieldEnum | Tm_mesures_gsoScalarFieldEnum[]
  }

  /**
   * tm_mesures_gso findFirstOrThrow
   */
  export type tm_mesures_gsoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_gso to fetch.
     */
    where?: tm_mesures_gsoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_gsos to fetch.
     */
    orderBy?: tm_mesures_gsoOrderByWithRelationInput | tm_mesures_gsoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures_gsos.
     */
    cursor?: tm_mesures_gsoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_gsos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_gsos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_gsos.
     */
    distinct?: Tm_mesures_gsoScalarFieldEnum | Tm_mesures_gsoScalarFieldEnum[]
  }

  /**
   * tm_mesures_gso findMany
   */
  export type tm_mesures_gsoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_gsos to fetch.
     */
    where?: tm_mesures_gsoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_gsos to fetch.
     */
    orderBy?: tm_mesures_gsoOrderByWithRelationInput | tm_mesures_gsoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mesures_gsos.
     */
    cursor?: tm_mesures_gsoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_gsos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_gsos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_gsos.
     */
    distinct?: Tm_mesures_gsoScalarFieldEnum | Tm_mesures_gsoScalarFieldEnum[]
  }

  /**
   * tm_mesures_gso create
   */
  export type tm_mesures_gsoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mesures_gso.
     */
    data: XOR<tm_mesures_gsoCreateInput, tm_mesures_gsoUncheckedCreateInput>
  }

  /**
   * tm_mesures_gso createMany
   */
  export type tm_mesures_gsoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mesures_gsos.
     */
    data: tm_mesures_gsoCreateManyInput | tm_mesures_gsoCreateManyInput[]
  }

  /**
   * tm_mesures_gso update
   */
  export type tm_mesures_gsoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mesures_gso.
     */
    data: XOR<tm_mesures_gsoUpdateInput, tm_mesures_gsoUncheckedUpdateInput>
    /**
     * Choose, which tm_mesures_gso to update.
     */
    where: tm_mesures_gsoWhereUniqueInput
  }

  /**
   * tm_mesures_gso updateMany
   */
  export type tm_mesures_gsoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mesures_gsos.
     */
    data: XOR<tm_mesures_gsoUpdateManyMutationInput, tm_mesures_gsoUncheckedUpdateManyInput>
    /**
     * Filter which tm_mesures_gsos to update
     */
    where?: tm_mesures_gsoWhereInput
    /**
     * Limit how many tm_mesures_gsos to update.
     */
    limit?: number
  }

  /**
   * tm_mesures_gso upsert
   */
  export type tm_mesures_gsoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mesures_gso to update in case it exists.
     */
    where: tm_mesures_gsoWhereUniqueInput
    /**
     * In case the tm_mesures_gso found by the `where` argument doesn't exist, create a new tm_mesures_gso with this data.
     */
    create: XOR<tm_mesures_gsoCreateInput, tm_mesures_gsoUncheckedCreateInput>
    /**
     * In case the tm_mesures_gso was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mesures_gsoUpdateInput, tm_mesures_gsoUncheckedUpdateInput>
  }

  /**
   * tm_mesures_gso delete
   */
  export type tm_mesures_gsoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
    /**
     * Filter which tm_mesures_gso to delete.
     */
    where: tm_mesures_gsoWhereUniqueInput
  }

  /**
   * tm_mesures_gso deleteMany
   */
  export type tm_mesures_gsoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures_gsos to delete
     */
    where?: tm_mesures_gsoWhereInput
    /**
     * Limit how many tm_mesures_gsos to delete.
     */
    limit?: number
  }

  /**
   * tm_mesures_gso without action
   */
  export type tm_mesures_gsoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_gso
     */
    select?: tm_mesures_gsoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_gso
     */
    omit?: tm_mesures_gsoOmit<ExtArgs> | null
  }


  /**
   * Model tm_journal_histo
   */

  export type AggregateTm_journal_histo = {
    _count: Tm_journal_histoCountAggregateOutputType | null
    _avg: Tm_journal_histoAvgAggregateOutputType | null
    _sum: Tm_journal_histoSumAggregateOutputType | null
    _min: Tm_journal_histoMinAggregateOutputType | null
    _max: Tm_journal_histoMaxAggregateOutputType | null
  }

  export type Tm_journal_histoAvgAggregateOutputType = {
    Id_Journal_Histo: number | null
    Id_Serveur_BDD: number | null
    Id_Journal: number | null
    Id_Lieu: number | null
  }

  export type Tm_journal_histoSumAggregateOutputType = {
    Id_Journal_Histo: number | null
    Id_Serveur_BDD: number | null
    Id_Journal: number | null
    Id_Lieu: number | null
  }

  export type Tm_journal_histoMinAggregateOutputType = {
    Id_Journal_Histo: number | null
    Id_Serveur_BDD: number | null
    Id_Journal: number | null
    Code_Journal: string | null
    Commentaire: string | null
    Nom_Utilisateur: string | null
    Profil_Utilisateur: string | null
    Date_Heure_Journal: Date | null
    Id_Lieu: number | null
    Commentaire_Utilisateur: string | null
  }

  export type Tm_journal_histoMaxAggregateOutputType = {
    Id_Journal_Histo: number | null
    Id_Serveur_BDD: number | null
    Id_Journal: number | null
    Code_Journal: string | null
    Commentaire: string | null
    Nom_Utilisateur: string | null
    Profil_Utilisateur: string | null
    Date_Heure_Journal: Date | null
    Id_Lieu: number | null
    Commentaire_Utilisateur: string | null
  }

  export type Tm_journal_histoCountAggregateOutputType = {
    Id_Journal_Histo: number
    Id_Serveur_BDD: number
    Id_Journal: number
    Code_Journal: number
    Commentaire: number
    Nom_Utilisateur: number
    Profil_Utilisateur: number
    Date_Heure_Journal: number
    Id_Lieu: number
    Commentaire_Utilisateur: number
    _all: number
  }


  export type Tm_journal_histoAvgAggregateInputType = {
    Id_Journal_Histo?: true
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Id_Lieu?: true
  }

  export type Tm_journal_histoSumAggregateInputType = {
    Id_Journal_Histo?: true
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Id_Lieu?: true
  }

  export type Tm_journal_histoMinAggregateInputType = {
    Id_Journal_Histo?: true
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Code_Journal?: true
    Commentaire?: true
    Nom_Utilisateur?: true
    Profil_Utilisateur?: true
    Date_Heure_Journal?: true
    Id_Lieu?: true
    Commentaire_Utilisateur?: true
  }

  export type Tm_journal_histoMaxAggregateInputType = {
    Id_Journal_Histo?: true
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Code_Journal?: true
    Commentaire?: true
    Nom_Utilisateur?: true
    Profil_Utilisateur?: true
    Date_Heure_Journal?: true
    Id_Lieu?: true
    Commentaire_Utilisateur?: true
  }

  export type Tm_journal_histoCountAggregateInputType = {
    Id_Journal_Histo?: true
    Id_Serveur_BDD?: true
    Id_Journal?: true
    Code_Journal?: true
    Commentaire?: true
    Nom_Utilisateur?: true
    Profil_Utilisateur?: true
    Date_Heure_Journal?: true
    Id_Lieu?: true
    Commentaire_Utilisateur?: true
    _all?: true
  }

  export type Tm_journal_histoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_journal_histo to aggregate.
     */
    where?: tm_journal_histoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_histos to fetch.
     */
    orderBy?: tm_journal_histoOrderByWithRelationInput | tm_journal_histoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_journal_histoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_histos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_histos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_journal_histos
    **/
    _count?: true | Tm_journal_histoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_journal_histoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_journal_histoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_journal_histoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_journal_histoMaxAggregateInputType
  }

  export type GetTm_journal_histoAggregateType<T extends Tm_journal_histoAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_journal_histo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_journal_histo[P]>
      : GetScalarType<T[P], AggregateTm_journal_histo[P]>
  }




  export type tm_journal_histoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_journal_histoWhereInput
    orderBy?: tm_journal_histoOrderByWithAggregationInput | tm_journal_histoOrderByWithAggregationInput[]
    by: Tm_journal_histoScalarFieldEnum[] | Tm_journal_histoScalarFieldEnum
    having?: tm_journal_histoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_journal_histoCountAggregateInputType | true
    _avg?: Tm_journal_histoAvgAggregateInputType
    _sum?: Tm_journal_histoSumAggregateInputType
    _min?: Tm_journal_histoMinAggregateInputType
    _max?: Tm_journal_histoMaxAggregateInputType
  }

  export type Tm_journal_histoGroupByOutputType = {
    Id_Journal_Histo: number
    Id_Serveur_BDD: number
    Id_Journal: number
    Code_Journal: string | null
    Commentaire: string | null
    Nom_Utilisateur: string | null
    Profil_Utilisateur: string | null
    Date_Heure_Journal: Date | null
    Id_Lieu: number | null
    Commentaire_Utilisateur: string | null
    _count: Tm_journal_histoCountAggregateOutputType | null
    _avg: Tm_journal_histoAvgAggregateOutputType | null
    _sum: Tm_journal_histoSumAggregateOutputType | null
    _min: Tm_journal_histoMinAggregateOutputType | null
    _max: Tm_journal_histoMaxAggregateOutputType | null
  }

  type GetTm_journal_histoGroupByPayload<T extends tm_journal_histoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_journal_histoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_journal_histoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_journal_histoGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_journal_histoGroupByOutputType[P]>
        }
      >
    >


  export type tm_journal_histoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Journal_Histo?: boolean
    Id_Serveur_BDD?: boolean
    Id_Journal?: boolean
    Code_Journal?: boolean
    Commentaire?: boolean
    Nom_Utilisateur?: boolean
    Profil_Utilisateur?: boolean
    Date_Heure_Journal?: boolean
    Id_Lieu?: boolean
    Commentaire_Utilisateur?: boolean
  }, ExtArgs["result"]["tm_journal_histo"]>



  export type tm_journal_histoSelectScalar = {
    Id_Journal_Histo?: boolean
    Id_Serveur_BDD?: boolean
    Id_Journal?: boolean
    Code_Journal?: boolean
    Commentaire?: boolean
    Nom_Utilisateur?: boolean
    Profil_Utilisateur?: boolean
    Date_Heure_Journal?: boolean
    Id_Lieu?: boolean
    Commentaire_Utilisateur?: boolean
  }

  export type tm_journal_histoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Journal_Histo" | "Id_Serveur_BDD" | "Id_Journal" | "Code_Journal" | "Commentaire" | "Nom_Utilisateur" | "Profil_Utilisateur" | "Date_Heure_Journal" | "Id_Lieu" | "Commentaire_Utilisateur", ExtArgs["result"]["tm_journal_histo"]>

  export type $tm_journal_histoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_journal_histo"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Journal_Histo: number
      Id_Serveur_BDD: number
      Id_Journal: number
      Code_Journal: string | null
      Commentaire: string | null
      Nom_Utilisateur: string | null
      Profil_Utilisateur: string | null
      Date_Heure_Journal: Date | null
      Id_Lieu: number | null
      Commentaire_Utilisateur: string | null
    }, ExtArgs["result"]["tm_journal_histo"]>
    composites: {}
  }

  type tm_journal_histoGetPayload<S extends boolean | null | undefined | tm_journal_histoDefaultArgs> = $Result.GetResult<Prisma.$tm_journal_histoPayload, S>

  type tm_journal_histoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_journal_histoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_journal_histoCountAggregateInputType | true
    }

  export interface tm_journal_histoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_journal_histo'], meta: { name: 'tm_journal_histo' } }
    /**
     * Find zero or one Tm_journal_histo that matches the filter.
     * @param {tm_journal_histoFindUniqueArgs} args - Arguments to find a Tm_journal_histo
     * @example
     * // Get one Tm_journal_histo
     * const tm_journal_histo = await prisma.tm_journal_histo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_journal_histoFindUniqueArgs>(args: SelectSubset<T, tm_journal_histoFindUniqueArgs<ExtArgs>>): Prisma__tm_journal_histoClient<$Result.GetResult<Prisma.$tm_journal_histoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_journal_histo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_journal_histoFindUniqueOrThrowArgs} args - Arguments to find a Tm_journal_histo
     * @example
     * // Get one Tm_journal_histo
     * const tm_journal_histo = await prisma.tm_journal_histo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_journal_histoFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_journal_histoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_journal_histoClient<$Result.GetResult<Prisma.$tm_journal_histoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_journal_histo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_histoFindFirstArgs} args - Arguments to find a Tm_journal_histo
     * @example
     * // Get one Tm_journal_histo
     * const tm_journal_histo = await prisma.tm_journal_histo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_journal_histoFindFirstArgs>(args?: SelectSubset<T, tm_journal_histoFindFirstArgs<ExtArgs>>): Prisma__tm_journal_histoClient<$Result.GetResult<Prisma.$tm_journal_histoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_journal_histo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_histoFindFirstOrThrowArgs} args - Arguments to find a Tm_journal_histo
     * @example
     * // Get one Tm_journal_histo
     * const tm_journal_histo = await prisma.tm_journal_histo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_journal_histoFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_journal_histoFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_journal_histoClient<$Result.GetResult<Prisma.$tm_journal_histoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_journal_histos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_histoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_journal_histos
     * const tm_journal_histos = await prisma.tm_journal_histo.findMany()
     * 
     * // Get first 10 Tm_journal_histos
     * const tm_journal_histos = await prisma.tm_journal_histo.findMany({ take: 10 })
     * 
     * // Only select the `Id_Journal_Histo`
     * const tm_journal_histoWithId_Journal_HistoOnly = await prisma.tm_journal_histo.findMany({ select: { Id_Journal_Histo: true } })
     * 
     */
    findMany<T extends tm_journal_histoFindManyArgs>(args?: SelectSubset<T, tm_journal_histoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_journal_histoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_journal_histo.
     * @param {tm_journal_histoCreateArgs} args - Arguments to create a Tm_journal_histo.
     * @example
     * // Create one Tm_journal_histo
     * const Tm_journal_histo = await prisma.tm_journal_histo.create({
     *   data: {
     *     // ... data to create a Tm_journal_histo
     *   }
     * })
     * 
     */
    create<T extends tm_journal_histoCreateArgs>(args: SelectSubset<T, tm_journal_histoCreateArgs<ExtArgs>>): Prisma__tm_journal_histoClient<$Result.GetResult<Prisma.$tm_journal_histoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_journal_histos.
     * @param {tm_journal_histoCreateManyArgs} args - Arguments to create many Tm_journal_histos.
     * @example
     * // Create many Tm_journal_histos
     * const tm_journal_histo = await prisma.tm_journal_histo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_journal_histoCreateManyArgs>(args?: SelectSubset<T, tm_journal_histoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_journal_histo.
     * @param {tm_journal_histoDeleteArgs} args - Arguments to delete one Tm_journal_histo.
     * @example
     * // Delete one Tm_journal_histo
     * const Tm_journal_histo = await prisma.tm_journal_histo.delete({
     *   where: {
     *     // ... filter to delete one Tm_journal_histo
     *   }
     * })
     * 
     */
    delete<T extends tm_journal_histoDeleteArgs>(args: SelectSubset<T, tm_journal_histoDeleteArgs<ExtArgs>>): Prisma__tm_journal_histoClient<$Result.GetResult<Prisma.$tm_journal_histoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_journal_histo.
     * @param {tm_journal_histoUpdateArgs} args - Arguments to update one Tm_journal_histo.
     * @example
     * // Update one Tm_journal_histo
     * const tm_journal_histo = await prisma.tm_journal_histo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_journal_histoUpdateArgs>(args: SelectSubset<T, tm_journal_histoUpdateArgs<ExtArgs>>): Prisma__tm_journal_histoClient<$Result.GetResult<Prisma.$tm_journal_histoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_journal_histos.
     * @param {tm_journal_histoDeleteManyArgs} args - Arguments to filter Tm_journal_histos to delete.
     * @example
     * // Delete a few Tm_journal_histos
     * const { count } = await prisma.tm_journal_histo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_journal_histoDeleteManyArgs>(args?: SelectSubset<T, tm_journal_histoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_journal_histos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_histoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_journal_histos
     * const tm_journal_histo = await prisma.tm_journal_histo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_journal_histoUpdateManyArgs>(args: SelectSubset<T, tm_journal_histoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_journal_histo.
     * @param {tm_journal_histoUpsertArgs} args - Arguments to update or create a Tm_journal_histo.
     * @example
     * // Update or create a Tm_journal_histo
     * const tm_journal_histo = await prisma.tm_journal_histo.upsert({
     *   create: {
     *     // ... data to create a Tm_journal_histo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_journal_histo we want to update
     *   }
     * })
     */
    upsert<T extends tm_journal_histoUpsertArgs>(args: SelectSubset<T, tm_journal_histoUpsertArgs<ExtArgs>>): Prisma__tm_journal_histoClient<$Result.GetResult<Prisma.$tm_journal_histoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_journal_histos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_histoCountArgs} args - Arguments to filter Tm_journal_histos to count.
     * @example
     * // Count the number of Tm_journal_histos
     * const count = await prisma.tm_journal_histo.count({
     *   where: {
     *     // ... the filter for the Tm_journal_histos we want to count
     *   }
     * })
    **/
    count<T extends tm_journal_histoCountArgs>(
      args?: Subset<T, tm_journal_histoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_journal_histoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_journal_histo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_journal_histoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_journal_histoAggregateArgs>(args: Subset<T, Tm_journal_histoAggregateArgs>): Prisma.PrismaPromise<GetTm_journal_histoAggregateType<T>>

    /**
     * Group by Tm_journal_histo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_histoGroupByArgs} args - Group by arguments.
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
      T extends tm_journal_histoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_journal_histoGroupByArgs['orderBy'] }
        : { orderBy?: tm_journal_histoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_journal_histoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_journal_histoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_journal_histo model
   */
  readonly fields: tm_journal_histoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_journal_histo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_journal_histoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_journal_histo model
   */
  interface tm_journal_histoFieldRefs {
    readonly Id_Journal_Histo: FieldRef<"tm_journal_histo", 'Int'>
    readonly Id_Serveur_BDD: FieldRef<"tm_journal_histo", 'Int'>
    readonly Id_Journal: FieldRef<"tm_journal_histo", 'Int'>
    readonly Code_Journal: FieldRef<"tm_journal_histo", 'String'>
    readonly Commentaire: FieldRef<"tm_journal_histo", 'String'>
    readonly Nom_Utilisateur: FieldRef<"tm_journal_histo", 'String'>
    readonly Profil_Utilisateur: FieldRef<"tm_journal_histo", 'String'>
    readonly Date_Heure_Journal: FieldRef<"tm_journal_histo", 'DateTime'>
    readonly Id_Lieu: FieldRef<"tm_journal_histo", 'Int'>
    readonly Commentaire_Utilisateur: FieldRef<"tm_journal_histo", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tm_journal_histo findUnique
   */
  export type tm_journal_histoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_histo to fetch.
     */
    where: tm_journal_histoWhereUniqueInput
  }

  /**
   * tm_journal_histo findUniqueOrThrow
   */
  export type tm_journal_histoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_histo to fetch.
     */
    where: tm_journal_histoWhereUniqueInput
  }

  /**
   * tm_journal_histo findFirst
   */
  export type tm_journal_histoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_histo to fetch.
     */
    where?: tm_journal_histoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_histos to fetch.
     */
    orderBy?: tm_journal_histoOrderByWithRelationInput | tm_journal_histoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_journal_histos.
     */
    cursor?: tm_journal_histoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_histos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_histos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journal_histos.
     */
    distinct?: Tm_journal_histoScalarFieldEnum | Tm_journal_histoScalarFieldEnum[]
  }

  /**
   * tm_journal_histo findFirstOrThrow
   */
  export type tm_journal_histoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_histo to fetch.
     */
    where?: tm_journal_histoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_histos to fetch.
     */
    orderBy?: tm_journal_histoOrderByWithRelationInput | tm_journal_histoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_journal_histos.
     */
    cursor?: tm_journal_histoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_histos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_histos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journal_histos.
     */
    distinct?: Tm_journal_histoScalarFieldEnum | Tm_journal_histoScalarFieldEnum[]
  }

  /**
   * tm_journal_histo findMany
   */
  export type tm_journal_histoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_histos to fetch.
     */
    where?: tm_journal_histoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_histos to fetch.
     */
    orderBy?: tm_journal_histoOrderByWithRelationInput | tm_journal_histoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_journal_histos.
     */
    cursor?: tm_journal_histoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_histos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_histos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journal_histos.
     */
    distinct?: Tm_journal_histoScalarFieldEnum | Tm_journal_histoScalarFieldEnum[]
  }

  /**
   * tm_journal_histo create
   */
  export type tm_journal_histoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_journal_histo.
     */
    data?: XOR<tm_journal_histoCreateInput, tm_journal_histoUncheckedCreateInput>
  }

  /**
   * tm_journal_histo createMany
   */
  export type tm_journal_histoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_journal_histos.
     */
    data: tm_journal_histoCreateManyInput | tm_journal_histoCreateManyInput[]
  }

  /**
   * tm_journal_histo update
   */
  export type tm_journal_histoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_journal_histo.
     */
    data: XOR<tm_journal_histoUpdateInput, tm_journal_histoUncheckedUpdateInput>
    /**
     * Choose, which tm_journal_histo to update.
     */
    where: tm_journal_histoWhereUniqueInput
  }

  /**
   * tm_journal_histo updateMany
   */
  export type tm_journal_histoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_journal_histos.
     */
    data: XOR<tm_journal_histoUpdateManyMutationInput, tm_journal_histoUncheckedUpdateManyInput>
    /**
     * Filter which tm_journal_histos to update
     */
    where?: tm_journal_histoWhereInput
    /**
     * Limit how many tm_journal_histos to update.
     */
    limit?: number
  }

  /**
   * tm_journal_histo upsert
   */
  export type tm_journal_histoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_journal_histo to update in case it exists.
     */
    where: tm_journal_histoWhereUniqueInput
    /**
     * In case the tm_journal_histo found by the `where` argument doesn't exist, create a new tm_journal_histo with this data.
     */
    create: XOR<tm_journal_histoCreateInput, tm_journal_histoUncheckedCreateInput>
    /**
     * In case the tm_journal_histo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_journal_histoUpdateInput, tm_journal_histoUncheckedUpdateInput>
  }

  /**
   * tm_journal_histo delete
   */
  export type tm_journal_histoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
    /**
     * Filter which tm_journal_histo to delete.
     */
    where: tm_journal_histoWhereUniqueInput
  }

  /**
   * tm_journal_histo deleteMany
   */
  export type tm_journal_histoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_journal_histos to delete
     */
    where?: tm_journal_histoWhereInput
    /**
     * Limit how many tm_journal_histos to delete.
     */
    limit?: number
  }

  /**
   * tm_journal_histo without action
   */
  export type tm_journal_histoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_histo
     */
    select?: tm_journal_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_histo
     */
    omit?: tm_journal_histoOmit<ExtArgs> | null
  }


  /**
   * Model tm_mesure_calibrage
   */

  export type AggregateTm_mesure_calibrage = {
    _count: Tm_mesure_calibrageCountAggregateOutputType | null
    _avg: Tm_mesure_calibrageAvgAggregateOutputType | null
    _sum: Tm_mesure_calibrageSumAggregateOutputType | null
    _min: Tm_mesure_calibrageMinAggregateOutputType | null
    _max: Tm_mesure_calibrageMaxAggregateOutputType | null
  }

  export type Tm_mesure_calibrageAvgAggregateOutputType = {
    Id_Mesure_Calibrage: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
  }

  export type Tm_mesure_calibrageSumAggregateOutputType = {
    Id_Mesure_Calibrage: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
  }

  export type Tm_mesure_calibrageMinAggregateOutputType = {
    Id_Mesure_Calibrage: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Sonde_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
  }

  export type Tm_mesure_calibrageMaxAggregateOutputType = {
    Id_Mesure_Calibrage: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Sonde_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
  }

  export type Tm_mesure_calibrageCountAggregateOutputType = {
    Id_Mesure_Calibrage: number
    Id_Serveur_BDD: number
    Valeur: number
    Valeur_Brute: number
    Sonde_Numero_Serie: number
    Est_Valeur_Null: number
    Date_Heure: number
    _all: number
  }


  export type Tm_mesure_calibrageAvgAggregateInputType = {
    Id_Mesure_Calibrage?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
  }

  export type Tm_mesure_calibrageSumAggregateInputType = {
    Id_Mesure_Calibrage?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
  }

  export type Tm_mesure_calibrageMinAggregateInputType = {
    Id_Mesure_Calibrage?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Sonde_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
  }

  export type Tm_mesure_calibrageMaxAggregateInputType = {
    Id_Mesure_Calibrage?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Sonde_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
  }

  export type Tm_mesure_calibrageCountAggregateInputType = {
    Id_Mesure_Calibrage?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Sonde_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    _all?: true
  }

  export type Tm_mesure_calibrageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesure_calibrage to aggregate.
     */
    where?: tm_mesure_calibrageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_calibrages to fetch.
     */
    orderBy?: tm_mesure_calibrageOrderByWithRelationInput | tm_mesure_calibrageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mesure_calibrageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_calibrages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_calibrages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mesure_calibrages
    **/
    _count?: true | Tm_mesure_calibrageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mesure_calibrageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mesure_calibrageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mesure_calibrageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mesure_calibrageMaxAggregateInputType
  }

  export type GetTm_mesure_calibrageAggregateType<T extends Tm_mesure_calibrageAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mesure_calibrage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mesure_calibrage[P]>
      : GetScalarType<T[P], AggregateTm_mesure_calibrage[P]>
  }




  export type tm_mesure_calibrageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mesure_calibrageWhereInput
    orderBy?: tm_mesure_calibrageOrderByWithAggregationInput | tm_mesure_calibrageOrderByWithAggregationInput[]
    by: Tm_mesure_calibrageScalarFieldEnum[] | Tm_mesure_calibrageScalarFieldEnum
    having?: tm_mesure_calibrageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mesure_calibrageCountAggregateInputType | true
    _avg?: Tm_mesure_calibrageAvgAggregateInputType
    _sum?: Tm_mesure_calibrageSumAggregateInputType
    _min?: Tm_mesure_calibrageMinAggregateInputType
    _max?: Tm_mesure_calibrageMaxAggregateInputType
  }

  export type Tm_mesure_calibrageGroupByOutputType = {
    Id_Mesure_Calibrage: number
    Id_Serveur_BDD: number
    Valeur: number
    Valeur_Brute: number
    Sonde_Numero_Serie: string
    Est_Valeur_Null: number
    Date_Heure: Date
    _count: Tm_mesure_calibrageCountAggregateOutputType | null
    _avg: Tm_mesure_calibrageAvgAggregateOutputType | null
    _sum: Tm_mesure_calibrageSumAggregateOutputType | null
    _min: Tm_mesure_calibrageMinAggregateOutputType | null
    _max: Tm_mesure_calibrageMaxAggregateOutputType | null
  }

  type GetTm_mesure_calibrageGroupByPayload<T extends tm_mesure_calibrageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mesure_calibrageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mesure_calibrageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mesure_calibrageGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mesure_calibrageGroupByOutputType[P]>
        }
      >
    >


  export type tm_mesure_calibrageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Mesure_Calibrage?: boolean
    Id_Serveur_BDD?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Sonde_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
  }, ExtArgs["result"]["tm_mesure_calibrage"]>



  export type tm_mesure_calibrageSelectScalar = {
    Id_Mesure_Calibrage?: boolean
    Id_Serveur_BDD?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Sonde_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
  }

  export type tm_mesure_calibrageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Mesure_Calibrage" | "Id_Serveur_BDD" | "Valeur" | "Valeur_Brute" | "Sonde_Numero_Serie" | "Est_Valeur_Null" | "Date_Heure", ExtArgs["result"]["tm_mesure_calibrage"]>

  export type $tm_mesure_calibragePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mesure_calibrage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Mesure_Calibrage: number
      Id_Serveur_BDD: number
      Valeur: number
      Valeur_Brute: number
      Sonde_Numero_Serie: string
      Est_Valeur_Null: number
      Date_Heure: Date
    }, ExtArgs["result"]["tm_mesure_calibrage"]>
    composites: {}
  }

  type tm_mesure_calibrageGetPayload<S extends boolean | null | undefined | tm_mesure_calibrageDefaultArgs> = $Result.GetResult<Prisma.$tm_mesure_calibragePayload, S>

  type tm_mesure_calibrageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mesure_calibrageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mesure_calibrageCountAggregateInputType | true
    }

  export interface tm_mesure_calibrageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mesure_calibrage'], meta: { name: 'tm_mesure_calibrage' } }
    /**
     * Find zero or one Tm_mesure_calibrage that matches the filter.
     * @param {tm_mesure_calibrageFindUniqueArgs} args - Arguments to find a Tm_mesure_calibrage
     * @example
     * // Get one Tm_mesure_calibrage
     * const tm_mesure_calibrage = await prisma.tm_mesure_calibrage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mesure_calibrageFindUniqueArgs>(args: SelectSubset<T, tm_mesure_calibrageFindUniqueArgs<ExtArgs>>): Prisma__tm_mesure_calibrageClient<$Result.GetResult<Prisma.$tm_mesure_calibragePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mesure_calibrage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mesure_calibrageFindUniqueOrThrowArgs} args - Arguments to find a Tm_mesure_calibrage
     * @example
     * // Get one Tm_mesure_calibrage
     * const tm_mesure_calibrage = await prisma.tm_mesure_calibrage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mesure_calibrageFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mesure_calibrageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mesure_calibrageClient<$Result.GetResult<Prisma.$tm_mesure_calibragePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesure_calibrage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrageFindFirstArgs} args - Arguments to find a Tm_mesure_calibrage
     * @example
     * // Get one Tm_mesure_calibrage
     * const tm_mesure_calibrage = await prisma.tm_mesure_calibrage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mesure_calibrageFindFirstArgs>(args?: SelectSubset<T, tm_mesure_calibrageFindFirstArgs<ExtArgs>>): Prisma__tm_mesure_calibrageClient<$Result.GetResult<Prisma.$tm_mesure_calibragePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesure_calibrage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrageFindFirstOrThrowArgs} args - Arguments to find a Tm_mesure_calibrage
     * @example
     * // Get one Tm_mesure_calibrage
     * const tm_mesure_calibrage = await prisma.tm_mesure_calibrage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mesure_calibrageFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mesure_calibrageFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mesure_calibrageClient<$Result.GetResult<Prisma.$tm_mesure_calibragePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mesure_calibrages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mesure_calibrages
     * const tm_mesure_calibrages = await prisma.tm_mesure_calibrage.findMany()
     * 
     * // Get first 10 Tm_mesure_calibrages
     * const tm_mesure_calibrages = await prisma.tm_mesure_calibrage.findMany({ take: 10 })
     * 
     * // Only select the `Id_Mesure_Calibrage`
     * const tm_mesure_calibrageWithId_Mesure_CalibrageOnly = await prisma.tm_mesure_calibrage.findMany({ select: { Id_Mesure_Calibrage: true } })
     * 
     */
    findMany<T extends tm_mesure_calibrageFindManyArgs>(args?: SelectSubset<T, tm_mesure_calibrageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mesure_calibragePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mesure_calibrage.
     * @param {tm_mesure_calibrageCreateArgs} args - Arguments to create a Tm_mesure_calibrage.
     * @example
     * // Create one Tm_mesure_calibrage
     * const Tm_mesure_calibrage = await prisma.tm_mesure_calibrage.create({
     *   data: {
     *     // ... data to create a Tm_mesure_calibrage
     *   }
     * })
     * 
     */
    create<T extends tm_mesure_calibrageCreateArgs>(args: SelectSubset<T, tm_mesure_calibrageCreateArgs<ExtArgs>>): Prisma__tm_mesure_calibrageClient<$Result.GetResult<Prisma.$tm_mesure_calibragePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mesure_calibrages.
     * @param {tm_mesure_calibrageCreateManyArgs} args - Arguments to create many Tm_mesure_calibrages.
     * @example
     * // Create many Tm_mesure_calibrages
     * const tm_mesure_calibrage = await prisma.tm_mesure_calibrage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mesure_calibrageCreateManyArgs>(args?: SelectSubset<T, tm_mesure_calibrageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mesure_calibrage.
     * @param {tm_mesure_calibrageDeleteArgs} args - Arguments to delete one Tm_mesure_calibrage.
     * @example
     * // Delete one Tm_mesure_calibrage
     * const Tm_mesure_calibrage = await prisma.tm_mesure_calibrage.delete({
     *   where: {
     *     // ... filter to delete one Tm_mesure_calibrage
     *   }
     * })
     * 
     */
    delete<T extends tm_mesure_calibrageDeleteArgs>(args: SelectSubset<T, tm_mesure_calibrageDeleteArgs<ExtArgs>>): Prisma__tm_mesure_calibrageClient<$Result.GetResult<Prisma.$tm_mesure_calibragePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mesure_calibrage.
     * @param {tm_mesure_calibrageUpdateArgs} args - Arguments to update one Tm_mesure_calibrage.
     * @example
     * // Update one Tm_mesure_calibrage
     * const tm_mesure_calibrage = await prisma.tm_mesure_calibrage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mesure_calibrageUpdateArgs>(args: SelectSubset<T, tm_mesure_calibrageUpdateArgs<ExtArgs>>): Prisma__tm_mesure_calibrageClient<$Result.GetResult<Prisma.$tm_mesure_calibragePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mesure_calibrages.
     * @param {tm_mesure_calibrageDeleteManyArgs} args - Arguments to filter Tm_mesure_calibrages to delete.
     * @example
     * // Delete a few Tm_mesure_calibrages
     * const { count } = await prisma.tm_mesure_calibrage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mesure_calibrageDeleteManyArgs>(args?: SelectSubset<T, tm_mesure_calibrageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mesure_calibrages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mesure_calibrages
     * const tm_mesure_calibrage = await prisma.tm_mesure_calibrage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mesure_calibrageUpdateManyArgs>(args: SelectSubset<T, tm_mesure_calibrageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mesure_calibrage.
     * @param {tm_mesure_calibrageUpsertArgs} args - Arguments to update or create a Tm_mesure_calibrage.
     * @example
     * // Update or create a Tm_mesure_calibrage
     * const tm_mesure_calibrage = await prisma.tm_mesure_calibrage.upsert({
     *   create: {
     *     // ... data to create a Tm_mesure_calibrage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mesure_calibrage we want to update
     *   }
     * })
     */
    upsert<T extends tm_mesure_calibrageUpsertArgs>(args: SelectSubset<T, tm_mesure_calibrageUpsertArgs<ExtArgs>>): Prisma__tm_mesure_calibrageClient<$Result.GetResult<Prisma.$tm_mesure_calibragePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mesure_calibrages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrageCountArgs} args - Arguments to filter Tm_mesure_calibrages to count.
     * @example
     * // Count the number of Tm_mesure_calibrages
     * const count = await prisma.tm_mesure_calibrage.count({
     *   where: {
     *     // ... the filter for the Tm_mesure_calibrages we want to count
     *   }
     * })
    **/
    count<T extends tm_mesure_calibrageCountArgs>(
      args?: Subset<T, tm_mesure_calibrageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mesure_calibrageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mesure_calibrage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mesure_calibrageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mesure_calibrageAggregateArgs>(args: Subset<T, Tm_mesure_calibrageAggregateArgs>): Prisma.PrismaPromise<GetTm_mesure_calibrageAggregateType<T>>

    /**
     * Group by Tm_mesure_calibrage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrageGroupByArgs} args - Group by arguments.
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
      T extends tm_mesure_calibrageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mesure_calibrageGroupByArgs['orderBy'] }
        : { orderBy?: tm_mesure_calibrageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mesure_calibrageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mesure_calibrageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mesure_calibrage model
   */
  readonly fields: tm_mesure_calibrageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mesure_calibrage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mesure_calibrageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mesure_calibrage model
   */
  interface tm_mesure_calibrageFieldRefs {
    readonly Id_Mesure_Calibrage: FieldRef<"tm_mesure_calibrage", 'Int'>
    readonly Id_Serveur_BDD: FieldRef<"tm_mesure_calibrage", 'Int'>
    readonly Valeur: FieldRef<"tm_mesure_calibrage", 'Float'>
    readonly Valeur_Brute: FieldRef<"tm_mesure_calibrage", 'Float'>
    readonly Sonde_Numero_Serie: FieldRef<"tm_mesure_calibrage", 'String'>
    readonly Est_Valeur_Null: FieldRef<"tm_mesure_calibrage", 'Int'>
    readonly Date_Heure: FieldRef<"tm_mesure_calibrage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tm_mesure_calibrage findUnique
   */
  export type tm_mesure_calibrageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrage to fetch.
     */
    where: tm_mesure_calibrageWhereUniqueInput
  }

  /**
   * tm_mesure_calibrage findUniqueOrThrow
   */
  export type tm_mesure_calibrageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrage to fetch.
     */
    where: tm_mesure_calibrageWhereUniqueInput
  }

  /**
   * tm_mesure_calibrage findFirst
   */
  export type tm_mesure_calibrageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrage to fetch.
     */
    where?: tm_mesure_calibrageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_calibrages to fetch.
     */
    orderBy?: tm_mesure_calibrageOrderByWithRelationInput | tm_mesure_calibrageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesure_calibrages.
     */
    cursor?: tm_mesure_calibrageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_calibrages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_calibrages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_calibrages.
     */
    distinct?: Tm_mesure_calibrageScalarFieldEnum | Tm_mesure_calibrageScalarFieldEnum[]
  }

  /**
   * tm_mesure_calibrage findFirstOrThrow
   */
  export type tm_mesure_calibrageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrage to fetch.
     */
    where?: tm_mesure_calibrageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_calibrages to fetch.
     */
    orderBy?: tm_mesure_calibrageOrderByWithRelationInput | tm_mesure_calibrageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesure_calibrages.
     */
    cursor?: tm_mesure_calibrageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_calibrages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_calibrages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_calibrages.
     */
    distinct?: Tm_mesure_calibrageScalarFieldEnum | Tm_mesure_calibrageScalarFieldEnum[]
  }

  /**
   * tm_mesure_calibrage findMany
   */
  export type tm_mesure_calibrageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrages to fetch.
     */
    where?: tm_mesure_calibrageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_calibrages to fetch.
     */
    orderBy?: tm_mesure_calibrageOrderByWithRelationInput | tm_mesure_calibrageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mesure_calibrages.
     */
    cursor?: tm_mesure_calibrageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_calibrages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_calibrages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_calibrages.
     */
    distinct?: Tm_mesure_calibrageScalarFieldEnum | Tm_mesure_calibrageScalarFieldEnum[]
  }

  /**
   * tm_mesure_calibrage create
   */
  export type tm_mesure_calibrageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mesure_calibrage.
     */
    data: XOR<tm_mesure_calibrageCreateInput, tm_mesure_calibrageUncheckedCreateInput>
  }

  /**
   * tm_mesure_calibrage createMany
   */
  export type tm_mesure_calibrageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mesure_calibrages.
     */
    data: tm_mesure_calibrageCreateManyInput | tm_mesure_calibrageCreateManyInput[]
  }

  /**
   * tm_mesure_calibrage update
   */
  export type tm_mesure_calibrageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mesure_calibrage.
     */
    data: XOR<tm_mesure_calibrageUpdateInput, tm_mesure_calibrageUncheckedUpdateInput>
    /**
     * Choose, which tm_mesure_calibrage to update.
     */
    where: tm_mesure_calibrageWhereUniqueInput
  }

  /**
   * tm_mesure_calibrage updateMany
   */
  export type tm_mesure_calibrageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mesure_calibrages.
     */
    data: XOR<tm_mesure_calibrageUpdateManyMutationInput, tm_mesure_calibrageUncheckedUpdateManyInput>
    /**
     * Filter which tm_mesure_calibrages to update
     */
    where?: tm_mesure_calibrageWhereInput
    /**
     * Limit how many tm_mesure_calibrages to update.
     */
    limit?: number
  }

  /**
   * tm_mesure_calibrage upsert
   */
  export type tm_mesure_calibrageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mesure_calibrage to update in case it exists.
     */
    where: tm_mesure_calibrageWhereUniqueInput
    /**
     * In case the tm_mesure_calibrage found by the `where` argument doesn't exist, create a new tm_mesure_calibrage with this data.
     */
    create: XOR<tm_mesure_calibrageCreateInput, tm_mesure_calibrageUncheckedCreateInput>
    /**
     * In case the tm_mesure_calibrage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mesure_calibrageUpdateInput, tm_mesure_calibrageUncheckedUpdateInput>
  }

  /**
   * tm_mesure_calibrage delete
   */
  export type tm_mesure_calibrageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
    /**
     * Filter which tm_mesure_calibrage to delete.
     */
    where: tm_mesure_calibrageWhereUniqueInput
  }

  /**
   * tm_mesure_calibrage deleteMany
   */
  export type tm_mesure_calibrageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesure_calibrages to delete
     */
    where?: tm_mesure_calibrageWhereInput
    /**
     * Limit how many tm_mesure_calibrages to delete.
     */
    limit?: number
  }

  /**
   * tm_mesure_calibrage without action
   */
  export type tm_mesure_calibrageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage
     */
    select?: tm_mesure_calibrageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage
     */
    omit?: tm_mesure_calibrageOmit<ExtArgs> | null
  }


  /**
   * Model tm_mesure_calibrage_etalon
   */

  export type AggregateTm_mesure_calibrage_etalon = {
    _count: Tm_mesure_calibrage_etalonCountAggregateOutputType | null
    _avg: Tm_mesure_calibrage_etalonAvgAggregateOutputType | null
    _sum: Tm_mesure_calibrage_etalonSumAggregateOutputType | null
    _min: Tm_mesure_calibrage_etalonMinAggregateOutputType | null
    _max: Tm_mesure_calibrage_etalonMaxAggregateOutputType | null
  }

  export type Tm_mesure_calibrage_etalonAvgAggregateOutputType = {
    Id_Mesure_Calibrage_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
  }

  export type Tm_mesure_calibrage_etalonSumAggregateOutputType = {
    Id_Mesure_Calibrage_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
  }

  export type Tm_mesure_calibrage_etalonMinAggregateOutputType = {
    Id_Mesure_Calibrage_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Etalon_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
  }

  export type Tm_mesure_calibrage_etalonMaxAggregateOutputType = {
    Id_Mesure_Calibrage_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Etalon_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
  }

  export type Tm_mesure_calibrage_etalonCountAggregateOutputType = {
    Id_Mesure_Calibrage_Etalon: number
    Id_Serveur_BDD: number
    Valeur: number
    Valeur_Brute: number
    Etalon_Numero_Serie: number
    Est_Valeur_Null: number
    Date_Heure: number
    _all: number
  }


  export type Tm_mesure_calibrage_etalonAvgAggregateInputType = {
    Id_Mesure_Calibrage_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
  }

  export type Tm_mesure_calibrage_etalonSumAggregateInputType = {
    Id_Mesure_Calibrage_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
  }

  export type Tm_mesure_calibrage_etalonMinAggregateInputType = {
    Id_Mesure_Calibrage_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Etalon_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
  }

  export type Tm_mesure_calibrage_etalonMaxAggregateInputType = {
    Id_Mesure_Calibrage_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Etalon_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
  }

  export type Tm_mesure_calibrage_etalonCountAggregateInputType = {
    Id_Mesure_Calibrage_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Etalon_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    _all?: true
  }

  export type Tm_mesure_calibrage_etalonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesure_calibrage_etalon to aggregate.
     */
    where?: tm_mesure_calibrage_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_calibrage_etalons to fetch.
     */
    orderBy?: tm_mesure_calibrage_etalonOrderByWithRelationInput | tm_mesure_calibrage_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mesure_calibrage_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_calibrage_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_calibrage_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mesure_calibrage_etalons
    **/
    _count?: true | Tm_mesure_calibrage_etalonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mesure_calibrage_etalonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mesure_calibrage_etalonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mesure_calibrage_etalonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mesure_calibrage_etalonMaxAggregateInputType
  }

  export type GetTm_mesure_calibrage_etalonAggregateType<T extends Tm_mesure_calibrage_etalonAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mesure_calibrage_etalon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mesure_calibrage_etalon[P]>
      : GetScalarType<T[P], AggregateTm_mesure_calibrage_etalon[P]>
  }




  export type tm_mesure_calibrage_etalonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mesure_calibrage_etalonWhereInput
    orderBy?: tm_mesure_calibrage_etalonOrderByWithAggregationInput | tm_mesure_calibrage_etalonOrderByWithAggregationInput[]
    by: Tm_mesure_calibrage_etalonScalarFieldEnum[] | Tm_mesure_calibrage_etalonScalarFieldEnum
    having?: tm_mesure_calibrage_etalonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mesure_calibrage_etalonCountAggregateInputType | true
    _avg?: Tm_mesure_calibrage_etalonAvgAggregateInputType
    _sum?: Tm_mesure_calibrage_etalonSumAggregateInputType
    _min?: Tm_mesure_calibrage_etalonMinAggregateInputType
    _max?: Tm_mesure_calibrage_etalonMaxAggregateInputType
  }

  export type Tm_mesure_calibrage_etalonGroupByOutputType = {
    Id_Mesure_Calibrage_Etalon: number
    Id_Serveur_BDD: number
    Valeur: number
    Valeur_Brute: number
    Etalon_Numero_Serie: string
    Est_Valeur_Null: number
    Date_Heure: Date
    _count: Tm_mesure_calibrage_etalonCountAggregateOutputType | null
    _avg: Tm_mesure_calibrage_etalonAvgAggregateOutputType | null
    _sum: Tm_mesure_calibrage_etalonSumAggregateOutputType | null
    _min: Tm_mesure_calibrage_etalonMinAggregateOutputType | null
    _max: Tm_mesure_calibrage_etalonMaxAggregateOutputType | null
  }

  type GetTm_mesure_calibrage_etalonGroupByPayload<T extends tm_mesure_calibrage_etalonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mesure_calibrage_etalonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mesure_calibrage_etalonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mesure_calibrage_etalonGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mesure_calibrage_etalonGroupByOutputType[P]>
        }
      >
    >


  export type tm_mesure_calibrage_etalonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Mesure_Calibrage_Etalon?: boolean
    Id_Serveur_BDD?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Etalon_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
  }, ExtArgs["result"]["tm_mesure_calibrage_etalon"]>



  export type tm_mesure_calibrage_etalonSelectScalar = {
    Id_Mesure_Calibrage_Etalon?: boolean
    Id_Serveur_BDD?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Etalon_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
  }

  export type tm_mesure_calibrage_etalonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Mesure_Calibrage_Etalon" | "Id_Serveur_BDD" | "Valeur" | "Valeur_Brute" | "Etalon_Numero_Serie" | "Est_Valeur_Null" | "Date_Heure", ExtArgs["result"]["tm_mesure_calibrage_etalon"]>

  export type $tm_mesure_calibrage_etalonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mesure_calibrage_etalon"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Mesure_Calibrage_Etalon: number
      Id_Serveur_BDD: number
      Valeur: number
      Valeur_Brute: number
      Etalon_Numero_Serie: string
      Est_Valeur_Null: number
      Date_Heure: Date
    }, ExtArgs["result"]["tm_mesure_calibrage_etalon"]>
    composites: {}
  }

  type tm_mesure_calibrage_etalonGetPayload<S extends boolean | null | undefined | tm_mesure_calibrage_etalonDefaultArgs> = $Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload, S>

  type tm_mesure_calibrage_etalonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mesure_calibrage_etalonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mesure_calibrage_etalonCountAggregateInputType | true
    }

  export interface tm_mesure_calibrage_etalonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mesure_calibrage_etalon'], meta: { name: 'tm_mesure_calibrage_etalon' } }
    /**
     * Find zero or one Tm_mesure_calibrage_etalon that matches the filter.
     * @param {tm_mesure_calibrage_etalonFindUniqueArgs} args - Arguments to find a Tm_mesure_calibrage_etalon
     * @example
     * // Get one Tm_mesure_calibrage_etalon
     * const tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mesure_calibrage_etalonFindUniqueArgs>(args: SelectSubset<T, tm_mesure_calibrage_etalonFindUniqueArgs<ExtArgs>>): Prisma__tm_mesure_calibrage_etalonClient<$Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mesure_calibrage_etalon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mesure_calibrage_etalonFindUniqueOrThrowArgs} args - Arguments to find a Tm_mesure_calibrage_etalon
     * @example
     * // Get one Tm_mesure_calibrage_etalon
     * const tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mesure_calibrage_etalonFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mesure_calibrage_etalonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mesure_calibrage_etalonClient<$Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesure_calibrage_etalon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrage_etalonFindFirstArgs} args - Arguments to find a Tm_mesure_calibrage_etalon
     * @example
     * // Get one Tm_mesure_calibrage_etalon
     * const tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mesure_calibrage_etalonFindFirstArgs>(args?: SelectSubset<T, tm_mesure_calibrage_etalonFindFirstArgs<ExtArgs>>): Prisma__tm_mesure_calibrage_etalonClient<$Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesure_calibrage_etalon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrage_etalonFindFirstOrThrowArgs} args - Arguments to find a Tm_mesure_calibrage_etalon
     * @example
     * // Get one Tm_mesure_calibrage_etalon
     * const tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mesure_calibrage_etalonFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mesure_calibrage_etalonFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mesure_calibrage_etalonClient<$Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mesure_calibrage_etalons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrage_etalonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mesure_calibrage_etalons
     * const tm_mesure_calibrage_etalons = await prisma.tm_mesure_calibrage_etalon.findMany()
     * 
     * // Get first 10 Tm_mesure_calibrage_etalons
     * const tm_mesure_calibrage_etalons = await prisma.tm_mesure_calibrage_etalon.findMany({ take: 10 })
     * 
     * // Only select the `Id_Mesure_Calibrage_Etalon`
     * const tm_mesure_calibrage_etalonWithId_Mesure_Calibrage_EtalonOnly = await prisma.tm_mesure_calibrage_etalon.findMany({ select: { Id_Mesure_Calibrage_Etalon: true } })
     * 
     */
    findMany<T extends tm_mesure_calibrage_etalonFindManyArgs>(args?: SelectSubset<T, tm_mesure_calibrage_etalonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mesure_calibrage_etalon.
     * @param {tm_mesure_calibrage_etalonCreateArgs} args - Arguments to create a Tm_mesure_calibrage_etalon.
     * @example
     * // Create one Tm_mesure_calibrage_etalon
     * const Tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.create({
     *   data: {
     *     // ... data to create a Tm_mesure_calibrage_etalon
     *   }
     * })
     * 
     */
    create<T extends tm_mesure_calibrage_etalonCreateArgs>(args: SelectSubset<T, tm_mesure_calibrage_etalonCreateArgs<ExtArgs>>): Prisma__tm_mesure_calibrage_etalonClient<$Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mesure_calibrage_etalons.
     * @param {tm_mesure_calibrage_etalonCreateManyArgs} args - Arguments to create many Tm_mesure_calibrage_etalons.
     * @example
     * // Create many Tm_mesure_calibrage_etalons
     * const tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mesure_calibrage_etalonCreateManyArgs>(args?: SelectSubset<T, tm_mesure_calibrage_etalonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mesure_calibrage_etalon.
     * @param {tm_mesure_calibrage_etalonDeleteArgs} args - Arguments to delete one Tm_mesure_calibrage_etalon.
     * @example
     * // Delete one Tm_mesure_calibrage_etalon
     * const Tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.delete({
     *   where: {
     *     // ... filter to delete one Tm_mesure_calibrage_etalon
     *   }
     * })
     * 
     */
    delete<T extends tm_mesure_calibrage_etalonDeleteArgs>(args: SelectSubset<T, tm_mesure_calibrage_etalonDeleteArgs<ExtArgs>>): Prisma__tm_mesure_calibrage_etalonClient<$Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mesure_calibrage_etalon.
     * @param {tm_mesure_calibrage_etalonUpdateArgs} args - Arguments to update one Tm_mesure_calibrage_etalon.
     * @example
     * // Update one Tm_mesure_calibrage_etalon
     * const tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mesure_calibrage_etalonUpdateArgs>(args: SelectSubset<T, tm_mesure_calibrage_etalonUpdateArgs<ExtArgs>>): Prisma__tm_mesure_calibrage_etalonClient<$Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mesure_calibrage_etalons.
     * @param {tm_mesure_calibrage_etalonDeleteManyArgs} args - Arguments to filter Tm_mesure_calibrage_etalons to delete.
     * @example
     * // Delete a few Tm_mesure_calibrage_etalons
     * const { count } = await prisma.tm_mesure_calibrage_etalon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mesure_calibrage_etalonDeleteManyArgs>(args?: SelectSubset<T, tm_mesure_calibrage_etalonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mesure_calibrage_etalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrage_etalonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mesure_calibrage_etalons
     * const tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mesure_calibrage_etalonUpdateManyArgs>(args: SelectSubset<T, tm_mesure_calibrage_etalonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mesure_calibrage_etalon.
     * @param {tm_mesure_calibrage_etalonUpsertArgs} args - Arguments to update or create a Tm_mesure_calibrage_etalon.
     * @example
     * // Update or create a Tm_mesure_calibrage_etalon
     * const tm_mesure_calibrage_etalon = await prisma.tm_mesure_calibrage_etalon.upsert({
     *   create: {
     *     // ... data to create a Tm_mesure_calibrage_etalon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mesure_calibrage_etalon we want to update
     *   }
     * })
     */
    upsert<T extends tm_mesure_calibrage_etalonUpsertArgs>(args: SelectSubset<T, tm_mesure_calibrage_etalonUpsertArgs<ExtArgs>>): Prisma__tm_mesure_calibrage_etalonClient<$Result.GetResult<Prisma.$tm_mesure_calibrage_etalonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mesure_calibrage_etalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrage_etalonCountArgs} args - Arguments to filter Tm_mesure_calibrage_etalons to count.
     * @example
     * // Count the number of Tm_mesure_calibrage_etalons
     * const count = await prisma.tm_mesure_calibrage_etalon.count({
     *   where: {
     *     // ... the filter for the Tm_mesure_calibrage_etalons we want to count
     *   }
     * })
    **/
    count<T extends tm_mesure_calibrage_etalonCountArgs>(
      args?: Subset<T, tm_mesure_calibrage_etalonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mesure_calibrage_etalonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mesure_calibrage_etalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mesure_calibrage_etalonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mesure_calibrage_etalonAggregateArgs>(args: Subset<T, Tm_mesure_calibrage_etalonAggregateArgs>): Prisma.PrismaPromise<GetTm_mesure_calibrage_etalonAggregateType<T>>

    /**
     * Group by Tm_mesure_calibrage_etalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_calibrage_etalonGroupByArgs} args - Group by arguments.
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
      T extends tm_mesure_calibrage_etalonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mesure_calibrage_etalonGroupByArgs['orderBy'] }
        : { orderBy?: tm_mesure_calibrage_etalonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mesure_calibrage_etalonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mesure_calibrage_etalonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mesure_calibrage_etalon model
   */
  readonly fields: tm_mesure_calibrage_etalonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mesure_calibrage_etalon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mesure_calibrage_etalonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mesure_calibrage_etalon model
   */
  interface tm_mesure_calibrage_etalonFieldRefs {
    readonly Id_Mesure_Calibrage_Etalon: FieldRef<"tm_mesure_calibrage_etalon", 'Int'>
    readonly Id_Serveur_BDD: FieldRef<"tm_mesure_calibrage_etalon", 'Int'>
    readonly Valeur: FieldRef<"tm_mesure_calibrage_etalon", 'Float'>
    readonly Valeur_Brute: FieldRef<"tm_mesure_calibrage_etalon", 'Float'>
    readonly Etalon_Numero_Serie: FieldRef<"tm_mesure_calibrage_etalon", 'String'>
    readonly Est_Valeur_Null: FieldRef<"tm_mesure_calibrage_etalon", 'Int'>
    readonly Date_Heure: FieldRef<"tm_mesure_calibrage_etalon", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tm_mesure_calibrage_etalon findUnique
   */
  export type tm_mesure_calibrage_etalonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrage_etalon to fetch.
     */
    where: tm_mesure_calibrage_etalonWhereUniqueInput
  }

  /**
   * tm_mesure_calibrage_etalon findUniqueOrThrow
   */
  export type tm_mesure_calibrage_etalonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrage_etalon to fetch.
     */
    where: tm_mesure_calibrage_etalonWhereUniqueInput
  }

  /**
   * tm_mesure_calibrage_etalon findFirst
   */
  export type tm_mesure_calibrage_etalonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrage_etalon to fetch.
     */
    where?: tm_mesure_calibrage_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_calibrage_etalons to fetch.
     */
    orderBy?: tm_mesure_calibrage_etalonOrderByWithRelationInput | tm_mesure_calibrage_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesure_calibrage_etalons.
     */
    cursor?: tm_mesure_calibrage_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_calibrage_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_calibrage_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_calibrage_etalons.
     */
    distinct?: Tm_mesure_calibrage_etalonScalarFieldEnum | Tm_mesure_calibrage_etalonScalarFieldEnum[]
  }

  /**
   * tm_mesure_calibrage_etalon findFirstOrThrow
   */
  export type tm_mesure_calibrage_etalonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrage_etalon to fetch.
     */
    where?: tm_mesure_calibrage_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_calibrage_etalons to fetch.
     */
    orderBy?: tm_mesure_calibrage_etalonOrderByWithRelationInput | tm_mesure_calibrage_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesure_calibrage_etalons.
     */
    cursor?: tm_mesure_calibrage_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_calibrage_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_calibrage_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_calibrage_etalons.
     */
    distinct?: Tm_mesure_calibrage_etalonScalarFieldEnum | Tm_mesure_calibrage_etalonScalarFieldEnum[]
  }

  /**
   * tm_mesure_calibrage_etalon findMany
   */
  export type tm_mesure_calibrage_etalonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_calibrage_etalons to fetch.
     */
    where?: tm_mesure_calibrage_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_calibrage_etalons to fetch.
     */
    orderBy?: tm_mesure_calibrage_etalonOrderByWithRelationInput | tm_mesure_calibrage_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mesure_calibrage_etalons.
     */
    cursor?: tm_mesure_calibrage_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_calibrage_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_calibrage_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_calibrage_etalons.
     */
    distinct?: Tm_mesure_calibrage_etalonScalarFieldEnum | Tm_mesure_calibrage_etalonScalarFieldEnum[]
  }

  /**
   * tm_mesure_calibrage_etalon create
   */
  export type tm_mesure_calibrage_etalonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mesure_calibrage_etalon.
     */
    data: XOR<tm_mesure_calibrage_etalonCreateInput, tm_mesure_calibrage_etalonUncheckedCreateInput>
  }

  /**
   * tm_mesure_calibrage_etalon createMany
   */
  export type tm_mesure_calibrage_etalonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mesure_calibrage_etalons.
     */
    data: tm_mesure_calibrage_etalonCreateManyInput | tm_mesure_calibrage_etalonCreateManyInput[]
  }

  /**
   * tm_mesure_calibrage_etalon update
   */
  export type tm_mesure_calibrage_etalonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mesure_calibrage_etalon.
     */
    data: XOR<tm_mesure_calibrage_etalonUpdateInput, tm_mesure_calibrage_etalonUncheckedUpdateInput>
    /**
     * Choose, which tm_mesure_calibrage_etalon to update.
     */
    where: tm_mesure_calibrage_etalonWhereUniqueInput
  }

  /**
   * tm_mesure_calibrage_etalon updateMany
   */
  export type tm_mesure_calibrage_etalonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mesure_calibrage_etalons.
     */
    data: XOR<tm_mesure_calibrage_etalonUpdateManyMutationInput, tm_mesure_calibrage_etalonUncheckedUpdateManyInput>
    /**
     * Filter which tm_mesure_calibrage_etalons to update
     */
    where?: tm_mesure_calibrage_etalonWhereInput
    /**
     * Limit how many tm_mesure_calibrage_etalons to update.
     */
    limit?: number
  }

  /**
   * tm_mesure_calibrage_etalon upsert
   */
  export type tm_mesure_calibrage_etalonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mesure_calibrage_etalon to update in case it exists.
     */
    where: tm_mesure_calibrage_etalonWhereUniqueInput
    /**
     * In case the tm_mesure_calibrage_etalon found by the `where` argument doesn't exist, create a new tm_mesure_calibrage_etalon with this data.
     */
    create: XOR<tm_mesure_calibrage_etalonCreateInput, tm_mesure_calibrage_etalonUncheckedCreateInput>
    /**
     * In case the tm_mesure_calibrage_etalon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mesure_calibrage_etalonUpdateInput, tm_mesure_calibrage_etalonUncheckedUpdateInput>
  }

  /**
   * tm_mesure_calibrage_etalon delete
   */
  export type tm_mesure_calibrage_etalonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
    /**
     * Filter which tm_mesure_calibrage_etalon to delete.
     */
    where: tm_mesure_calibrage_etalonWhereUniqueInput
  }

  /**
   * tm_mesure_calibrage_etalon deleteMany
   */
  export type tm_mesure_calibrage_etalonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesure_calibrage_etalons to delete
     */
    where?: tm_mesure_calibrage_etalonWhereInput
    /**
     * Limit how many tm_mesure_calibrage_etalons to delete.
     */
    limit?: number
  }

  /**
   * tm_mesure_calibrage_etalon without action
   */
  export type tm_mesure_calibrage_etalonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_calibrage_etalon
     */
    select?: tm_mesure_calibrage_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_calibrage_etalon
     */
    omit?: tm_mesure_calibrage_etalonOmit<ExtArgs> | null
  }


  /**
   * Model tm_mesure_etalon
   */

  export type AggregateTm_mesure_etalon = {
    _count: Tm_mesure_etalonCountAggregateOutputType | null
    _avg: Tm_mesure_etalonAvgAggregateOutputType | null
    _sum: Tm_mesure_etalonSumAggregateOutputType | null
    _min: Tm_mesure_etalonMinAggregateOutputType | null
    _max: Tm_mesure_etalonMaxAggregateOutputType | null
  }

  export type Tm_mesure_etalonAvgAggregateOutputType = {
    Id_Mesure_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
  }

  export type Tm_mesure_etalonSumAggregateOutputType = {
    Id_Mesure_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
  }

  export type Tm_mesure_etalonMinAggregateOutputType = {
    Id_Mesure_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Etalon_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
    Message_Erreur: string | null
  }

  export type Tm_mesure_etalonMaxAggregateOutputType = {
    Id_Mesure_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Etalon_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
    Message_Erreur: string | null
  }

  export type Tm_mesure_etalonCountAggregateOutputType = {
    Id_Mesure_Etalon: number
    Id_Serveur_BDD: number
    Valeur_Brute: number
    Etalon_Numero_Serie: number
    Est_Valeur_Null: number
    Date_Heure: number
    Message_Erreur: number
    _all: number
  }


  export type Tm_mesure_etalonAvgAggregateInputType = {
    Id_Mesure_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
  }

  export type Tm_mesure_etalonSumAggregateInputType = {
    Id_Mesure_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
  }

  export type Tm_mesure_etalonMinAggregateInputType = {
    Id_Mesure_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Etalon_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    Message_Erreur?: true
  }

  export type Tm_mesure_etalonMaxAggregateInputType = {
    Id_Mesure_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Etalon_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    Message_Erreur?: true
  }

  export type Tm_mesure_etalonCountAggregateInputType = {
    Id_Mesure_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Etalon_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    Message_Erreur?: true
    _all?: true
  }

  export type Tm_mesure_etalonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesure_etalon to aggregate.
     */
    where?: tm_mesure_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_etalons to fetch.
     */
    orderBy?: tm_mesure_etalonOrderByWithRelationInput | tm_mesure_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mesure_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mesure_etalons
    **/
    _count?: true | Tm_mesure_etalonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mesure_etalonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mesure_etalonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mesure_etalonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mesure_etalonMaxAggregateInputType
  }

  export type GetTm_mesure_etalonAggregateType<T extends Tm_mesure_etalonAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mesure_etalon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mesure_etalon[P]>
      : GetScalarType<T[P], AggregateTm_mesure_etalon[P]>
  }




  export type tm_mesure_etalonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mesure_etalonWhereInput
    orderBy?: tm_mesure_etalonOrderByWithAggregationInput | tm_mesure_etalonOrderByWithAggregationInput[]
    by: Tm_mesure_etalonScalarFieldEnum[] | Tm_mesure_etalonScalarFieldEnum
    having?: tm_mesure_etalonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mesure_etalonCountAggregateInputType | true
    _avg?: Tm_mesure_etalonAvgAggregateInputType
    _sum?: Tm_mesure_etalonSumAggregateInputType
    _min?: Tm_mesure_etalonMinAggregateInputType
    _max?: Tm_mesure_etalonMaxAggregateInputType
  }

  export type Tm_mesure_etalonGroupByOutputType = {
    Id_Mesure_Etalon: number
    Id_Serveur_BDD: number
    Valeur_Brute: number
    Etalon_Numero_Serie: string
    Est_Valeur_Null: number
    Date_Heure: Date
    Message_Erreur: string
    _count: Tm_mesure_etalonCountAggregateOutputType | null
    _avg: Tm_mesure_etalonAvgAggregateOutputType | null
    _sum: Tm_mesure_etalonSumAggregateOutputType | null
    _min: Tm_mesure_etalonMinAggregateOutputType | null
    _max: Tm_mesure_etalonMaxAggregateOutputType | null
  }

  type GetTm_mesure_etalonGroupByPayload<T extends tm_mesure_etalonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mesure_etalonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mesure_etalonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mesure_etalonGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mesure_etalonGroupByOutputType[P]>
        }
      >
    >


  export type tm_mesure_etalonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Mesure_Etalon?: boolean
    Id_Serveur_BDD?: boolean
    Valeur_Brute?: boolean
    Etalon_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
    Message_Erreur?: boolean
  }, ExtArgs["result"]["tm_mesure_etalon"]>



  export type tm_mesure_etalonSelectScalar = {
    Id_Mesure_Etalon?: boolean
    Id_Serveur_BDD?: boolean
    Valeur_Brute?: boolean
    Etalon_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
    Message_Erreur?: boolean
  }

  export type tm_mesure_etalonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Mesure_Etalon" | "Id_Serveur_BDD" | "Valeur_Brute" | "Etalon_Numero_Serie" | "Est_Valeur_Null" | "Date_Heure" | "Message_Erreur", ExtArgs["result"]["tm_mesure_etalon"]>

  export type $tm_mesure_etalonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mesure_etalon"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Mesure_Etalon: number
      Id_Serveur_BDD: number
      Valeur_Brute: number
      Etalon_Numero_Serie: string
      Est_Valeur_Null: number
      Date_Heure: Date
      Message_Erreur: string
    }, ExtArgs["result"]["tm_mesure_etalon"]>
    composites: {}
  }

  type tm_mesure_etalonGetPayload<S extends boolean | null | undefined | tm_mesure_etalonDefaultArgs> = $Result.GetResult<Prisma.$tm_mesure_etalonPayload, S>

  type tm_mesure_etalonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mesure_etalonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mesure_etalonCountAggregateInputType | true
    }

  export interface tm_mesure_etalonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mesure_etalon'], meta: { name: 'tm_mesure_etalon' } }
    /**
     * Find zero or one Tm_mesure_etalon that matches the filter.
     * @param {tm_mesure_etalonFindUniqueArgs} args - Arguments to find a Tm_mesure_etalon
     * @example
     * // Get one Tm_mesure_etalon
     * const tm_mesure_etalon = await prisma.tm_mesure_etalon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mesure_etalonFindUniqueArgs>(args: SelectSubset<T, tm_mesure_etalonFindUniqueArgs<ExtArgs>>): Prisma__tm_mesure_etalonClient<$Result.GetResult<Prisma.$tm_mesure_etalonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mesure_etalon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mesure_etalonFindUniqueOrThrowArgs} args - Arguments to find a Tm_mesure_etalon
     * @example
     * // Get one Tm_mesure_etalon
     * const tm_mesure_etalon = await prisma.tm_mesure_etalon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mesure_etalonFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mesure_etalonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mesure_etalonClient<$Result.GetResult<Prisma.$tm_mesure_etalonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesure_etalon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonFindFirstArgs} args - Arguments to find a Tm_mesure_etalon
     * @example
     * // Get one Tm_mesure_etalon
     * const tm_mesure_etalon = await prisma.tm_mesure_etalon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mesure_etalonFindFirstArgs>(args?: SelectSubset<T, tm_mesure_etalonFindFirstArgs<ExtArgs>>): Prisma__tm_mesure_etalonClient<$Result.GetResult<Prisma.$tm_mesure_etalonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesure_etalon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonFindFirstOrThrowArgs} args - Arguments to find a Tm_mesure_etalon
     * @example
     * // Get one Tm_mesure_etalon
     * const tm_mesure_etalon = await prisma.tm_mesure_etalon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mesure_etalonFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mesure_etalonFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mesure_etalonClient<$Result.GetResult<Prisma.$tm_mesure_etalonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mesure_etalons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mesure_etalons
     * const tm_mesure_etalons = await prisma.tm_mesure_etalon.findMany()
     * 
     * // Get first 10 Tm_mesure_etalons
     * const tm_mesure_etalons = await prisma.tm_mesure_etalon.findMany({ take: 10 })
     * 
     * // Only select the `Id_Mesure_Etalon`
     * const tm_mesure_etalonWithId_Mesure_EtalonOnly = await prisma.tm_mesure_etalon.findMany({ select: { Id_Mesure_Etalon: true } })
     * 
     */
    findMany<T extends tm_mesure_etalonFindManyArgs>(args?: SelectSubset<T, tm_mesure_etalonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mesure_etalonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mesure_etalon.
     * @param {tm_mesure_etalonCreateArgs} args - Arguments to create a Tm_mesure_etalon.
     * @example
     * // Create one Tm_mesure_etalon
     * const Tm_mesure_etalon = await prisma.tm_mesure_etalon.create({
     *   data: {
     *     // ... data to create a Tm_mesure_etalon
     *   }
     * })
     * 
     */
    create<T extends tm_mesure_etalonCreateArgs>(args: SelectSubset<T, tm_mesure_etalonCreateArgs<ExtArgs>>): Prisma__tm_mesure_etalonClient<$Result.GetResult<Prisma.$tm_mesure_etalonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mesure_etalons.
     * @param {tm_mesure_etalonCreateManyArgs} args - Arguments to create many Tm_mesure_etalons.
     * @example
     * // Create many Tm_mesure_etalons
     * const tm_mesure_etalon = await prisma.tm_mesure_etalon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mesure_etalonCreateManyArgs>(args?: SelectSubset<T, tm_mesure_etalonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mesure_etalon.
     * @param {tm_mesure_etalonDeleteArgs} args - Arguments to delete one Tm_mesure_etalon.
     * @example
     * // Delete one Tm_mesure_etalon
     * const Tm_mesure_etalon = await prisma.tm_mesure_etalon.delete({
     *   where: {
     *     // ... filter to delete one Tm_mesure_etalon
     *   }
     * })
     * 
     */
    delete<T extends tm_mesure_etalonDeleteArgs>(args: SelectSubset<T, tm_mesure_etalonDeleteArgs<ExtArgs>>): Prisma__tm_mesure_etalonClient<$Result.GetResult<Prisma.$tm_mesure_etalonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mesure_etalon.
     * @param {tm_mesure_etalonUpdateArgs} args - Arguments to update one Tm_mesure_etalon.
     * @example
     * // Update one Tm_mesure_etalon
     * const tm_mesure_etalon = await prisma.tm_mesure_etalon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mesure_etalonUpdateArgs>(args: SelectSubset<T, tm_mesure_etalonUpdateArgs<ExtArgs>>): Prisma__tm_mesure_etalonClient<$Result.GetResult<Prisma.$tm_mesure_etalonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mesure_etalons.
     * @param {tm_mesure_etalonDeleteManyArgs} args - Arguments to filter Tm_mesure_etalons to delete.
     * @example
     * // Delete a few Tm_mesure_etalons
     * const { count } = await prisma.tm_mesure_etalon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mesure_etalonDeleteManyArgs>(args?: SelectSubset<T, tm_mesure_etalonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mesure_etalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mesure_etalons
     * const tm_mesure_etalon = await prisma.tm_mesure_etalon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mesure_etalonUpdateManyArgs>(args: SelectSubset<T, tm_mesure_etalonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mesure_etalon.
     * @param {tm_mesure_etalonUpsertArgs} args - Arguments to update or create a Tm_mesure_etalon.
     * @example
     * // Update or create a Tm_mesure_etalon
     * const tm_mesure_etalon = await prisma.tm_mesure_etalon.upsert({
     *   create: {
     *     // ... data to create a Tm_mesure_etalon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mesure_etalon we want to update
     *   }
     * })
     */
    upsert<T extends tm_mesure_etalonUpsertArgs>(args: SelectSubset<T, tm_mesure_etalonUpsertArgs<ExtArgs>>): Prisma__tm_mesure_etalonClient<$Result.GetResult<Prisma.$tm_mesure_etalonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mesure_etalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonCountArgs} args - Arguments to filter Tm_mesure_etalons to count.
     * @example
     * // Count the number of Tm_mesure_etalons
     * const count = await prisma.tm_mesure_etalon.count({
     *   where: {
     *     // ... the filter for the Tm_mesure_etalons we want to count
     *   }
     * })
    **/
    count<T extends tm_mesure_etalonCountArgs>(
      args?: Subset<T, tm_mesure_etalonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mesure_etalonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mesure_etalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mesure_etalonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mesure_etalonAggregateArgs>(args: Subset<T, Tm_mesure_etalonAggregateArgs>): Prisma.PrismaPromise<GetTm_mesure_etalonAggregateType<T>>

    /**
     * Group by Tm_mesure_etalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonGroupByArgs} args - Group by arguments.
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
      T extends tm_mesure_etalonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mesure_etalonGroupByArgs['orderBy'] }
        : { orderBy?: tm_mesure_etalonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mesure_etalonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mesure_etalonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mesure_etalon model
   */
  readonly fields: tm_mesure_etalonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mesure_etalon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mesure_etalonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mesure_etalon model
   */
  interface tm_mesure_etalonFieldRefs {
    readonly Id_Mesure_Etalon: FieldRef<"tm_mesure_etalon", 'Int'>
    readonly Id_Serveur_BDD: FieldRef<"tm_mesure_etalon", 'Int'>
    readonly Valeur_Brute: FieldRef<"tm_mesure_etalon", 'Float'>
    readonly Etalon_Numero_Serie: FieldRef<"tm_mesure_etalon", 'String'>
    readonly Est_Valeur_Null: FieldRef<"tm_mesure_etalon", 'Int'>
    readonly Date_Heure: FieldRef<"tm_mesure_etalon", 'DateTime'>
    readonly Message_Erreur: FieldRef<"tm_mesure_etalon", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tm_mesure_etalon findUnique
   */
  export type tm_mesure_etalonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalon to fetch.
     */
    where: tm_mesure_etalonWhereUniqueInput
  }

  /**
   * tm_mesure_etalon findUniqueOrThrow
   */
  export type tm_mesure_etalonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalon to fetch.
     */
    where: tm_mesure_etalonWhereUniqueInput
  }

  /**
   * tm_mesure_etalon findFirst
   */
  export type tm_mesure_etalonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalon to fetch.
     */
    where?: tm_mesure_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_etalons to fetch.
     */
    orderBy?: tm_mesure_etalonOrderByWithRelationInput | tm_mesure_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesure_etalons.
     */
    cursor?: tm_mesure_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_etalons.
     */
    distinct?: Tm_mesure_etalonScalarFieldEnum | Tm_mesure_etalonScalarFieldEnum[]
  }

  /**
   * tm_mesure_etalon findFirstOrThrow
   */
  export type tm_mesure_etalonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalon to fetch.
     */
    where?: tm_mesure_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_etalons to fetch.
     */
    orderBy?: tm_mesure_etalonOrderByWithRelationInput | tm_mesure_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesure_etalons.
     */
    cursor?: tm_mesure_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_etalons.
     */
    distinct?: Tm_mesure_etalonScalarFieldEnum | Tm_mesure_etalonScalarFieldEnum[]
  }

  /**
   * tm_mesure_etalon findMany
   */
  export type tm_mesure_etalonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalons to fetch.
     */
    where?: tm_mesure_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_etalons to fetch.
     */
    orderBy?: tm_mesure_etalonOrderByWithRelationInput | tm_mesure_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mesure_etalons.
     */
    cursor?: tm_mesure_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_etalons.
     */
    distinct?: Tm_mesure_etalonScalarFieldEnum | Tm_mesure_etalonScalarFieldEnum[]
  }

  /**
   * tm_mesure_etalon create
   */
  export type tm_mesure_etalonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mesure_etalon.
     */
    data: XOR<tm_mesure_etalonCreateInput, tm_mesure_etalonUncheckedCreateInput>
  }

  /**
   * tm_mesure_etalon createMany
   */
  export type tm_mesure_etalonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mesure_etalons.
     */
    data: tm_mesure_etalonCreateManyInput | tm_mesure_etalonCreateManyInput[]
  }

  /**
   * tm_mesure_etalon update
   */
  export type tm_mesure_etalonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mesure_etalon.
     */
    data: XOR<tm_mesure_etalonUpdateInput, tm_mesure_etalonUncheckedUpdateInput>
    /**
     * Choose, which tm_mesure_etalon to update.
     */
    where: tm_mesure_etalonWhereUniqueInput
  }

  /**
   * tm_mesure_etalon updateMany
   */
  export type tm_mesure_etalonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mesure_etalons.
     */
    data: XOR<tm_mesure_etalonUpdateManyMutationInput, tm_mesure_etalonUncheckedUpdateManyInput>
    /**
     * Filter which tm_mesure_etalons to update
     */
    where?: tm_mesure_etalonWhereInput
    /**
     * Limit how many tm_mesure_etalons to update.
     */
    limit?: number
  }

  /**
   * tm_mesure_etalon upsert
   */
  export type tm_mesure_etalonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mesure_etalon to update in case it exists.
     */
    where: tm_mesure_etalonWhereUniqueInput
    /**
     * In case the tm_mesure_etalon found by the `where` argument doesn't exist, create a new tm_mesure_etalon with this data.
     */
    create: XOR<tm_mesure_etalonCreateInput, tm_mesure_etalonUncheckedCreateInput>
    /**
     * In case the tm_mesure_etalon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mesure_etalonUpdateInput, tm_mesure_etalonUncheckedUpdateInput>
  }

  /**
   * tm_mesure_etalon delete
   */
  export type tm_mesure_etalonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
    /**
     * Filter which tm_mesure_etalon to delete.
     */
    where: tm_mesure_etalonWhereUniqueInput
  }

  /**
   * tm_mesure_etalon deleteMany
   */
  export type tm_mesure_etalonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesure_etalons to delete
     */
    where?: tm_mesure_etalonWhereInput
    /**
     * Limit how many tm_mesure_etalons to delete.
     */
    limit?: number
  }

  /**
   * tm_mesure_etalon without action
   */
  export type tm_mesure_etalonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalon
     */
    select?: tm_mesure_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalon
     */
    omit?: tm_mesure_etalonOmit<ExtArgs> | null
  }


  /**
   * Model tm_mesure_etalonnage
   */

  export type AggregateTm_mesure_etalonnage = {
    _count: Tm_mesure_etalonnageCountAggregateOutputType | null
    _avg: Tm_mesure_etalonnageAvgAggregateOutputType | null
    _sum: Tm_mesure_etalonnageSumAggregateOutputType | null
    _min: Tm_mesure_etalonnageMinAggregateOutputType | null
    _max: Tm_mesure_etalonnageMaxAggregateOutputType | null
  }

  export type Tm_mesure_etalonnageAvgAggregateOutputType = {
    Id_Mesure_Etalonnage: number | null
    Id_Serveur_BDD: number | null
    Numero_Ordre: number | null
    Mesure_Sonde: number | null
    Mesure_Etalon: number | null
  }

  export type Tm_mesure_etalonnageSumAggregateOutputType = {
    Id_Mesure_Etalonnage: number | null
    Id_Serveur_BDD: number | null
    Numero_Ordre: number | null
    Mesure_Sonde: number | null
    Mesure_Etalon: number | null
  }

  export type Tm_mesure_etalonnageMinAggregateOutputType = {
    Id_Mesure_Etalonnage: number | null
    Id_Serveur_BDD: number | null
    Sonde_Numero_serie: string | null
    Numero_Ordre: number | null
    Mesure_Sonde: number | null
    Mesure_Etalon: number | null
    Date_Heure: Date | null
  }

  export type Tm_mesure_etalonnageMaxAggregateOutputType = {
    Id_Mesure_Etalonnage: number | null
    Id_Serveur_BDD: number | null
    Sonde_Numero_serie: string | null
    Numero_Ordre: number | null
    Mesure_Sonde: number | null
    Mesure_Etalon: number | null
    Date_Heure: Date | null
  }

  export type Tm_mesure_etalonnageCountAggregateOutputType = {
    Id_Mesure_Etalonnage: number
    Id_Serveur_BDD: number
    Sonde_Numero_serie: number
    Numero_Ordre: number
    Mesure_Sonde: number
    Mesure_Etalon: number
    Date_Heure: number
    _all: number
  }


  export type Tm_mesure_etalonnageAvgAggregateInputType = {
    Id_Mesure_Etalonnage?: true
    Id_Serveur_BDD?: true
    Numero_Ordre?: true
    Mesure_Sonde?: true
    Mesure_Etalon?: true
  }

  export type Tm_mesure_etalonnageSumAggregateInputType = {
    Id_Mesure_Etalonnage?: true
    Id_Serveur_BDD?: true
    Numero_Ordre?: true
    Mesure_Sonde?: true
    Mesure_Etalon?: true
  }

  export type Tm_mesure_etalonnageMinAggregateInputType = {
    Id_Mesure_Etalonnage?: true
    Id_Serveur_BDD?: true
    Sonde_Numero_serie?: true
    Numero_Ordre?: true
    Mesure_Sonde?: true
    Mesure_Etalon?: true
    Date_Heure?: true
  }

  export type Tm_mesure_etalonnageMaxAggregateInputType = {
    Id_Mesure_Etalonnage?: true
    Id_Serveur_BDD?: true
    Sonde_Numero_serie?: true
    Numero_Ordre?: true
    Mesure_Sonde?: true
    Mesure_Etalon?: true
    Date_Heure?: true
  }

  export type Tm_mesure_etalonnageCountAggregateInputType = {
    Id_Mesure_Etalonnage?: true
    Id_Serveur_BDD?: true
    Sonde_Numero_serie?: true
    Numero_Ordre?: true
    Mesure_Sonde?: true
    Mesure_Etalon?: true
    Date_Heure?: true
    _all?: true
  }

  export type Tm_mesure_etalonnageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesure_etalonnage to aggregate.
     */
    where?: tm_mesure_etalonnageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_etalonnages to fetch.
     */
    orderBy?: tm_mesure_etalonnageOrderByWithRelationInput | tm_mesure_etalonnageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mesure_etalonnageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_etalonnages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_etalonnages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mesure_etalonnages
    **/
    _count?: true | Tm_mesure_etalonnageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mesure_etalonnageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mesure_etalonnageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mesure_etalonnageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mesure_etalonnageMaxAggregateInputType
  }

  export type GetTm_mesure_etalonnageAggregateType<T extends Tm_mesure_etalonnageAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mesure_etalonnage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mesure_etalonnage[P]>
      : GetScalarType<T[P], AggregateTm_mesure_etalonnage[P]>
  }




  export type tm_mesure_etalonnageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mesure_etalonnageWhereInput
    orderBy?: tm_mesure_etalonnageOrderByWithAggregationInput | tm_mesure_etalonnageOrderByWithAggregationInput[]
    by: Tm_mesure_etalonnageScalarFieldEnum[] | Tm_mesure_etalonnageScalarFieldEnum
    having?: tm_mesure_etalonnageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mesure_etalonnageCountAggregateInputType | true
    _avg?: Tm_mesure_etalonnageAvgAggregateInputType
    _sum?: Tm_mesure_etalonnageSumAggregateInputType
    _min?: Tm_mesure_etalonnageMinAggregateInputType
    _max?: Tm_mesure_etalonnageMaxAggregateInputType
  }

  export type Tm_mesure_etalonnageGroupByOutputType = {
    Id_Mesure_Etalonnage: number
    Id_Serveur_BDD: number
    Sonde_Numero_serie: string | null
    Numero_Ordre: number | null
    Mesure_Sonde: number | null
    Mesure_Etalon: number | null
    Date_Heure: Date | null
    _count: Tm_mesure_etalonnageCountAggregateOutputType | null
    _avg: Tm_mesure_etalonnageAvgAggregateOutputType | null
    _sum: Tm_mesure_etalonnageSumAggregateOutputType | null
    _min: Tm_mesure_etalonnageMinAggregateOutputType | null
    _max: Tm_mesure_etalonnageMaxAggregateOutputType | null
  }

  type GetTm_mesure_etalonnageGroupByPayload<T extends tm_mesure_etalonnageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mesure_etalonnageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mesure_etalonnageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mesure_etalonnageGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mesure_etalonnageGroupByOutputType[P]>
        }
      >
    >


  export type tm_mesure_etalonnageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Mesure_Etalonnage?: boolean
    Id_Serveur_BDD?: boolean
    Sonde_Numero_serie?: boolean
    Numero_Ordre?: boolean
    Mesure_Sonde?: boolean
    Mesure_Etalon?: boolean
    Date_Heure?: boolean
  }, ExtArgs["result"]["tm_mesure_etalonnage"]>



  export type tm_mesure_etalonnageSelectScalar = {
    Id_Mesure_Etalonnage?: boolean
    Id_Serveur_BDD?: boolean
    Sonde_Numero_serie?: boolean
    Numero_Ordre?: boolean
    Mesure_Sonde?: boolean
    Mesure_Etalon?: boolean
    Date_Heure?: boolean
  }

  export type tm_mesure_etalonnageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Mesure_Etalonnage" | "Id_Serveur_BDD" | "Sonde_Numero_serie" | "Numero_Ordre" | "Mesure_Sonde" | "Mesure_Etalon" | "Date_Heure", ExtArgs["result"]["tm_mesure_etalonnage"]>

  export type $tm_mesure_etalonnagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mesure_etalonnage"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Mesure_Etalonnage: number
      Id_Serveur_BDD: number
      Sonde_Numero_serie: string | null
      Numero_Ordre: number | null
      Mesure_Sonde: number | null
      Mesure_Etalon: number | null
      Date_Heure: Date | null
    }, ExtArgs["result"]["tm_mesure_etalonnage"]>
    composites: {}
  }

  type tm_mesure_etalonnageGetPayload<S extends boolean | null | undefined | tm_mesure_etalonnageDefaultArgs> = $Result.GetResult<Prisma.$tm_mesure_etalonnagePayload, S>

  type tm_mesure_etalonnageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mesure_etalonnageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mesure_etalonnageCountAggregateInputType | true
    }

  export interface tm_mesure_etalonnageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mesure_etalonnage'], meta: { name: 'tm_mesure_etalonnage' } }
    /**
     * Find zero or one Tm_mesure_etalonnage that matches the filter.
     * @param {tm_mesure_etalonnageFindUniqueArgs} args - Arguments to find a Tm_mesure_etalonnage
     * @example
     * // Get one Tm_mesure_etalonnage
     * const tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mesure_etalonnageFindUniqueArgs>(args: SelectSubset<T, tm_mesure_etalonnageFindUniqueArgs<ExtArgs>>): Prisma__tm_mesure_etalonnageClient<$Result.GetResult<Prisma.$tm_mesure_etalonnagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mesure_etalonnage that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mesure_etalonnageFindUniqueOrThrowArgs} args - Arguments to find a Tm_mesure_etalonnage
     * @example
     * // Get one Tm_mesure_etalonnage
     * const tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mesure_etalonnageFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mesure_etalonnageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mesure_etalonnageClient<$Result.GetResult<Prisma.$tm_mesure_etalonnagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesure_etalonnage that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonnageFindFirstArgs} args - Arguments to find a Tm_mesure_etalonnage
     * @example
     * // Get one Tm_mesure_etalonnage
     * const tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mesure_etalonnageFindFirstArgs>(args?: SelectSubset<T, tm_mesure_etalonnageFindFirstArgs<ExtArgs>>): Prisma__tm_mesure_etalonnageClient<$Result.GetResult<Prisma.$tm_mesure_etalonnagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesure_etalonnage that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonnageFindFirstOrThrowArgs} args - Arguments to find a Tm_mesure_etalonnage
     * @example
     * // Get one Tm_mesure_etalonnage
     * const tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mesure_etalonnageFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mesure_etalonnageFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mesure_etalonnageClient<$Result.GetResult<Prisma.$tm_mesure_etalonnagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mesure_etalonnages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonnageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mesure_etalonnages
     * const tm_mesure_etalonnages = await prisma.tm_mesure_etalonnage.findMany()
     * 
     * // Get first 10 Tm_mesure_etalonnages
     * const tm_mesure_etalonnages = await prisma.tm_mesure_etalonnage.findMany({ take: 10 })
     * 
     * // Only select the `Id_Mesure_Etalonnage`
     * const tm_mesure_etalonnageWithId_Mesure_EtalonnageOnly = await prisma.tm_mesure_etalonnage.findMany({ select: { Id_Mesure_Etalonnage: true } })
     * 
     */
    findMany<T extends tm_mesure_etalonnageFindManyArgs>(args?: SelectSubset<T, tm_mesure_etalonnageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mesure_etalonnagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mesure_etalonnage.
     * @param {tm_mesure_etalonnageCreateArgs} args - Arguments to create a Tm_mesure_etalonnage.
     * @example
     * // Create one Tm_mesure_etalonnage
     * const Tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.create({
     *   data: {
     *     // ... data to create a Tm_mesure_etalonnage
     *   }
     * })
     * 
     */
    create<T extends tm_mesure_etalonnageCreateArgs>(args: SelectSubset<T, tm_mesure_etalonnageCreateArgs<ExtArgs>>): Prisma__tm_mesure_etalonnageClient<$Result.GetResult<Prisma.$tm_mesure_etalonnagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mesure_etalonnages.
     * @param {tm_mesure_etalonnageCreateManyArgs} args - Arguments to create many Tm_mesure_etalonnages.
     * @example
     * // Create many Tm_mesure_etalonnages
     * const tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mesure_etalonnageCreateManyArgs>(args?: SelectSubset<T, tm_mesure_etalonnageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mesure_etalonnage.
     * @param {tm_mesure_etalonnageDeleteArgs} args - Arguments to delete one Tm_mesure_etalonnage.
     * @example
     * // Delete one Tm_mesure_etalonnage
     * const Tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.delete({
     *   where: {
     *     // ... filter to delete one Tm_mesure_etalonnage
     *   }
     * })
     * 
     */
    delete<T extends tm_mesure_etalonnageDeleteArgs>(args: SelectSubset<T, tm_mesure_etalonnageDeleteArgs<ExtArgs>>): Prisma__tm_mesure_etalonnageClient<$Result.GetResult<Prisma.$tm_mesure_etalonnagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mesure_etalonnage.
     * @param {tm_mesure_etalonnageUpdateArgs} args - Arguments to update one Tm_mesure_etalonnage.
     * @example
     * // Update one Tm_mesure_etalonnage
     * const tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mesure_etalonnageUpdateArgs>(args: SelectSubset<T, tm_mesure_etalonnageUpdateArgs<ExtArgs>>): Prisma__tm_mesure_etalonnageClient<$Result.GetResult<Prisma.$tm_mesure_etalonnagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mesure_etalonnages.
     * @param {tm_mesure_etalonnageDeleteManyArgs} args - Arguments to filter Tm_mesure_etalonnages to delete.
     * @example
     * // Delete a few Tm_mesure_etalonnages
     * const { count } = await prisma.tm_mesure_etalonnage.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mesure_etalonnageDeleteManyArgs>(args?: SelectSubset<T, tm_mesure_etalonnageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mesure_etalonnages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonnageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mesure_etalonnages
     * const tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mesure_etalonnageUpdateManyArgs>(args: SelectSubset<T, tm_mesure_etalonnageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mesure_etalonnage.
     * @param {tm_mesure_etalonnageUpsertArgs} args - Arguments to update or create a Tm_mesure_etalonnage.
     * @example
     * // Update or create a Tm_mesure_etalonnage
     * const tm_mesure_etalonnage = await prisma.tm_mesure_etalonnage.upsert({
     *   create: {
     *     // ... data to create a Tm_mesure_etalonnage
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mesure_etalonnage we want to update
     *   }
     * })
     */
    upsert<T extends tm_mesure_etalonnageUpsertArgs>(args: SelectSubset<T, tm_mesure_etalonnageUpsertArgs<ExtArgs>>): Prisma__tm_mesure_etalonnageClient<$Result.GetResult<Prisma.$tm_mesure_etalonnagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mesure_etalonnages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonnageCountArgs} args - Arguments to filter Tm_mesure_etalonnages to count.
     * @example
     * // Count the number of Tm_mesure_etalonnages
     * const count = await prisma.tm_mesure_etalonnage.count({
     *   where: {
     *     // ... the filter for the Tm_mesure_etalonnages we want to count
     *   }
     * })
    **/
    count<T extends tm_mesure_etalonnageCountArgs>(
      args?: Subset<T, tm_mesure_etalonnageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mesure_etalonnageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mesure_etalonnage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mesure_etalonnageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mesure_etalonnageAggregateArgs>(args: Subset<T, Tm_mesure_etalonnageAggregateArgs>): Prisma.PrismaPromise<GetTm_mesure_etalonnageAggregateType<T>>

    /**
     * Group by Tm_mesure_etalonnage.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesure_etalonnageGroupByArgs} args - Group by arguments.
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
      T extends tm_mesure_etalonnageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mesure_etalonnageGroupByArgs['orderBy'] }
        : { orderBy?: tm_mesure_etalonnageGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mesure_etalonnageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mesure_etalonnageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mesure_etalonnage model
   */
  readonly fields: tm_mesure_etalonnageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mesure_etalonnage.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mesure_etalonnageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mesure_etalonnage model
   */
  interface tm_mesure_etalonnageFieldRefs {
    readonly Id_Mesure_Etalonnage: FieldRef<"tm_mesure_etalonnage", 'Int'>
    readonly Id_Serveur_BDD: FieldRef<"tm_mesure_etalonnage", 'Int'>
    readonly Sonde_Numero_serie: FieldRef<"tm_mesure_etalonnage", 'String'>
    readonly Numero_Ordre: FieldRef<"tm_mesure_etalonnage", 'Int'>
    readonly Mesure_Sonde: FieldRef<"tm_mesure_etalonnage", 'Float'>
    readonly Mesure_Etalon: FieldRef<"tm_mesure_etalonnage", 'Float'>
    readonly Date_Heure: FieldRef<"tm_mesure_etalonnage", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tm_mesure_etalonnage findUnique
   */
  export type tm_mesure_etalonnageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalonnage to fetch.
     */
    where: tm_mesure_etalonnageWhereUniqueInput
  }

  /**
   * tm_mesure_etalonnage findUniqueOrThrow
   */
  export type tm_mesure_etalonnageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalonnage to fetch.
     */
    where: tm_mesure_etalonnageWhereUniqueInput
  }

  /**
   * tm_mesure_etalonnage findFirst
   */
  export type tm_mesure_etalonnageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalonnage to fetch.
     */
    where?: tm_mesure_etalonnageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_etalonnages to fetch.
     */
    orderBy?: tm_mesure_etalonnageOrderByWithRelationInput | tm_mesure_etalonnageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesure_etalonnages.
     */
    cursor?: tm_mesure_etalonnageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_etalonnages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_etalonnages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_etalonnages.
     */
    distinct?: Tm_mesure_etalonnageScalarFieldEnum | Tm_mesure_etalonnageScalarFieldEnum[]
  }

  /**
   * tm_mesure_etalonnage findFirstOrThrow
   */
  export type tm_mesure_etalonnageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalonnage to fetch.
     */
    where?: tm_mesure_etalonnageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_etalonnages to fetch.
     */
    orderBy?: tm_mesure_etalonnageOrderByWithRelationInput | tm_mesure_etalonnageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesure_etalonnages.
     */
    cursor?: tm_mesure_etalonnageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_etalonnages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_etalonnages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_etalonnages.
     */
    distinct?: Tm_mesure_etalonnageScalarFieldEnum | Tm_mesure_etalonnageScalarFieldEnum[]
  }

  /**
   * tm_mesure_etalonnage findMany
   */
  export type tm_mesure_etalonnageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesure_etalonnages to fetch.
     */
    where?: tm_mesure_etalonnageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesure_etalonnages to fetch.
     */
    orderBy?: tm_mesure_etalonnageOrderByWithRelationInput | tm_mesure_etalonnageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mesure_etalonnages.
     */
    cursor?: tm_mesure_etalonnageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesure_etalonnages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesure_etalonnages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesure_etalonnages.
     */
    distinct?: Tm_mesure_etalonnageScalarFieldEnum | Tm_mesure_etalonnageScalarFieldEnum[]
  }

  /**
   * tm_mesure_etalonnage create
   */
  export type tm_mesure_etalonnageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mesure_etalonnage.
     */
    data?: XOR<tm_mesure_etalonnageCreateInput, tm_mesure_etalonnageUncheckedCreateInput>
  }

  /**
   * tm_mesure_etalonnage createMany
   */
  export type tm_mesure_etalonnageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mesure_etalonnages.
     */
    data: tm_mesure_etalonnageCreateManyInput | tm_mesure_etalonnageCreateManyInput[]
  }

  /**
   * tm_mesure_etalonnage update
   */
  export type tm_mesure_etalonnageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mesure_etalonnage.
     */
    data: XOR<tm_mesure_etalonnageUpdateInput, tm_mesure_etalonnageUncheckedUpdateInput>
    /**
     * Choose, which tm_mesure_etalonnage to update.
     */
    where: tm_mesure_etalonnageWhereUniqueInput
  }

  /**
   * tm_mesure_etalonnage updateMany
   */
  export type tm_mesure_etalonnageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mesure_etalonnages.
     */
    data: XOR<tm_mesure_etalonnageUpdateManyMutationInput, tm_mesure_etalonnageUncheckedUpdateManyInput>
    /**
     * Filter which tm_mesure_etalonnages to update
     */
    where?: tm_mesure_etalonnageWhereInput
    /**
     * Limit how many tm_mesure_etalonnages to update.
     */
    limit?: number
  }

  /**
   * tm_mesure_etalonnage upsert
   */
  export type tm_mesure_etalonnageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mesure_etalonnage to update in case it exists.
     */
    where: tm_mesure_etalonnageWhereUniqueInput
    /**
     * In case the tm_mesure_etalonnage found by the `where` argument doesn't exist, create a new tm_mesure_etalonnage with this data.
     */
    create: XOR<tm_mesure_etalonnageCreateInput, tm_mesure_etalonnageUncheckedCreateInput>
    /**
     * In case the tm_mesure_etalonnage was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mesure_etalonnageUpdateInput, tm_mesure_etalonnageUncheckedUpdateInput>
  }

  /**
   * tm_mesure_etalonnage delete
   */
  export type tm_mesure_etalonnageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
    /**
     * Filter which tm_mesure_etalonnage to delete.
     */
    where: tm_mesure_etalonnageWhereUniqueInput
  }

  /**
   * tm_mesure_etalonnage deleteMany
   */
  export type tm_mesure_etalonnageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesure_etalonnages to delete
     */
    where?: tm_mesure_etalonnageWhereInput
    /**
     * Limit how many tm_mesure_etalonnages to delete.
     */
    limit?: number
  }

  /**
   * tm_mesure_etalonnage without action
   */
  export type tm_mesure_etalonnageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesure_etalonnage
     */
    select?: tm_mesure_etalonnageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesure_etalonnage
     */
    omit?: tm_mesure_etalonnageOmit<ExtArgs> | null
  }


  /**
   * Model tm_mesures_histo
   */

  export type AggregateTm_mesures_histo = {
    _count: Tm_mesures_histoCountAggregateOutputType | null
    _avg: Tm_mesures_histoAvgAggregateOutputType | null
    _sum: Tm_mesures_histoSumAggregateOutputType | null
    _min: Tm_mesures_histoMinAggregateOutputType | null
    _max: Tm_mesures_histoMaxAggregateOutputType | null
  }

  export type Tm_mesures_histoAvgAggregateOutputType = {
    Id_Mesure: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Id_Lieu: number | null
    Est_Valeur_Null: number | null
    Frequence: number | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
  }

  export type Tm_mesures_histoSumAggregateOutputType = {
    Id_Mesure: number | null
    Id_Serveur_BDD: number | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Id_Lieu: number | null
    Est_Valeur_Null: number | null
    Frequence: number | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
  }

  export type Tm_mesures_histoMinAggregateOutputType = {
    Id_Mesure: number | null
    Id_Serveur_BDD: number | null
    Date_Heure_Mesure: Date | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    Sonde_Numero_Serie: string | null
    Id_Lieu: number | null
    Est_Valeur_Null: number | null
    Frequence: number | null
    Est_En_Alarme: boolean | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
  }

  export type Tm_mesures_histoMaxAggregateOutputType = {
    Id_Mesure: number | null
    Id_Serveur_BDD: number | null
    Date_Heure_Mesure: Date | null
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    Sonde_Numero_Serie: string | null
    Id_Lieu: number | null
    Est_Valeur_Null: number | null
    Frequence: number | null
    Est_En_Alarme: boolean | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
  }

  export type Tm_mesures_histoCountAggregateOutputType = {
    Id_Mesure: number
    Id_Serveur_BDD: number
    Date_Heure_Mesure: number
    Valeur: number
    Valeur_Brute: number
    Nb_decimal: number
    Consigne: number
    Consigne_Sup: number
    Consigne_Inf: number
    Unite: number
    Sonde_Numero_Serie: number
    Id_Lieu: number
    Est_Valeur_Null: number
    Frequence: number
    Est_En_Alarme: number
    Consigne_Inf_Pre_Alarme: number
    Consigne_Sup_Pre_Alarme: number
    Moyenne: number
    _all: number
  }


  export type Tm_mesures_histoAvgAggregateInputType = {
    Id_Mesure?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
  }

  export type Tm_mesures_histoSumAggregateInputType = {
    Id_Mesure?: true
    Id_Serveur_BDD?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
  }

  export type Tm_mesures_histoMinAggregateInputType = {
    Id_Mesure?: true
    Id_Serveur_BDD?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    Sonde_Numero_Serie?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Est_En_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
  }

  export type Tm_mesures_histoMaxAggregateInputType = {
    Id_Mesure?: true
    Id_Serveur_BDD?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    Sonde_Numero_Serie?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Est_En_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
  }

  export type Tm_mesures_histoCountAggregateInputType = {
    Id_Mesure?: true
    Id_Serveur_BDD?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Valeur_Brute?: true
    Nb_decimal?: true
    Consigne?: true
    Consigne_Sup?: true
    Consigne_Inf?: true
    Unite?: true
    Sonde_Numero_Serie?: true
    Id_Lieu?: true
    Est_Valeur_Null?: true
    Frequence?: true
    Est_En_Alarme?: true
    Consigne_Inf_Pre_Alarme?: true
    Consigne_Sup_Pre_Alarme?: true
    Moyenne?: true
    _all?: true
  }

  export type Tm_mesures_histoAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures_histo to aggregate.
     */
    where?: tm_mesures_histoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_histos to fetch.
     */
    orderBy?: tm_mesures_histoOrderByWithRelationInput | tm_mesures_histoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mesures_histoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_histos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_histos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mesures_histos
    **/
    _count?: true | Tm_mesures_histoCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mesures_histoAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mesures_histoSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mesures_histoMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mesures_histoMaxAggregateInputType
  }

  export type GetTm_mesures_histoAggregateType<T extends Tm_mesures_histoAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mesures_histo]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mesures_histo[P]>
      : GetScalarType<T[P], AggregateTm_mesures_histo[P]>
  }




  export type tm_mesures_histoGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mesures_histoWhereInput
    orderBy?: tm_mesures_histoOrderByWithAggregationInput | tm_mesures_histoOrderByWithAggregationInput[]
    by: Tm_mesures_histoScalarFieldEnum[] | Tm_mesures_histoScalarFieldEnum
    having?: tm_mesures_histoScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mesures_histoCountAggregateInputType | true
    _avg?: Tm_mesures_histoAvgAggregateInputType
    _sum?: Tm_mesures_histoSumAggregateInputType
    _min?: Tm_mesures_histoMinAggregateInputType
    _max?: Tm_mesures_histoMaxAggregateInputType
  }

  export type Tm_mesures_histoGroupByOutputType = {
    Id_Mesure: number
    Id_Serveur_BDD: number
    Date_Heure_Mesure: Date
    Valeur: number | null
    Valeur_Brute: number | null
    Nb_decimal: number | null
    Consigne: number | null
    Consigne_Sup: number | null
    Consigne_Inf: number | null
    Unite: string | null
    Sonde_Numero_Serie: string | null
    Id_Lieu: number
    Est_Valeur_Null: number
    Frequence: number | null
    Est_En_Alarme: boolean | null
    Consigne_Inf_Pre_Alarme: number | null
    Consigne_Sup_Pre_Alarme: number | null
    Moyenne: number | null
    _count: Tm_mesures_histoCountAggregateOutputType | null
    _avg: Tm_mesures_histoAvgAggregateOutputType | null
    _sum: Tm_mesures_histoSumAggregateOutputType | null
    _min: Tm_mesures_histoMinAggregateOutputType | null
    _max: Tm_mesures_histoMaxAggregateOutputType | null
  }

  type GetTm_mesures_histoGroupByPayload<T extends tm_mesures_histoGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mesures_histoGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mesures_histoGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mesures_histoGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mesures_histoGroupByOutputType[P]>
        }
      >
    >


  export type tm_mesures_histoSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Mesure?: boolean
    Id_Serveur_BDD?: boolean
    Date_Heure_Mesure?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Nb_decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    Sonde_Numero_Serie?: boolean
    Id_Lieu?: boolean
    Est_Valeur_Null?: boolean
    Frequence?: boolean
    Est_En_Alarme?: boolean
    Consigne_Inf_Pre_Alarme?: boolean
    Consigne_Sup_Pre_Alarme?: boolean
    Moyenne?: boolean
  }, ExtArgs["result"]["tm_mesures_histo"]>



  export type tm_mesures_histoSelectScalar = {
    Id_Mesure?: boolean
    Id_Serveur_BDD?: boolean
    Date_Heure_Mesure?: boolean
    Valeur?: boolean
    Valeur_Brute?: boolean
    Nb_decimal?: boolean
    Consigne?: boolean
    Consigne_Sup?: boolean
    Consigne_Inf?: boolean
    Unite?: boolean
    Sonde_Numero_Serie?: boolean
    Id_Lieu?: boolean
    Est_Valeur_Null?: boolean
    Frequence?: boolean
    Est_En_Alarme?: boolean
    Consigne_Inf_Pre_Alarme?: boolean
    Consigne_Sup_Pre_Alarme?: boolean
    Moyenne?: boolean
  }

  export type tm_mesures_histoOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Mesure" | "Id_Serveur_BDD" | "Date_Heure_Mesure" | "Valeur" | "Valeur_Brute" | "Nb_decimal" | "Consigne" | "Consigne_Sup" | "Consigne_Inf" | "Unite" | "Sonde_Numero_Serie" | "Id_Lieu" | "Est_Valeur_Null" | "Frequence" | "Est_En_Alarme" | "Consigne_Inf_Pre_Alarme" | "Consigne_Sup_Pre_Alarme" | "Moyenne", ExtArgs["result"]["tm_mesures_histo"]>

  export type $tm_mesures_histoPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mesures_histo"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Mesure: number
      Id_Serveur_BDD: number
      Date_Heure_Mesure: Date
      Valeur: number | null
      Valeur_Brute: number | null
      Nb_decimal: number | null
      Consigne: number | null
      Consigne_Sup: number | null
      Consigne_Inf: number | null
      Unite: string | null
      Sonde_Numero_Serie: string | null
      Id_Lieu: number
      Est_Valeur_Null: number
      Frequence: number | null
      Est_En_Alarme: boolean | null
      Consigne_Inf_Pre_Alarme: number | null
      Consigne_Sup_Pre_Alarme: number | null
      Moyenne: number | null
    }, ExtArgs["result"]["tm_mesures_histo"]>
    composites: {}
  }

  type tm_mesures_histoGetPayload<S extends boolean | null | undefined | tm_mesures_histoDefaultArgs> = $Result.GetResult<Prisma.$tm_mesures_histoPayload, S>

  type tm_mesures_histoCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mesures_histoFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mesures_histoCountAggregateInputType | true
    }

  export interface tm_mesures_histoDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mesures_histo'], meta: { name: 'tm_mesures_histo' } }
    /**
     * Find zero or one Tm_mesures_histo that matches the filter.
     * @param {tm_mesures_histoFindUniqueArgs} args - Arguments to find a Tm_mesures_histo
     * @example
     * // Get one Tm_mesures_histo
     * const tm_mesures_histo = await prisma.tm_mesures_histo.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mesures_histoFindUniqueArgs>(args: SelectSubset<T, tm_mesures_histoFindUniqueArgs<ExtArgs>>): Prisma__tm_mesures_histoClient<$Result.GetResult<Prisma.$tm_mesures_histoPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mesures_histo that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mesures_histoFindUniqueOrThrowArgs} args - Arguments to find a Tm_mesures_histo
     * @example
     * // Get one Tm_mesures_histo
     * const tm_mesures_histo = await prisma.tm_mesures_histo.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mesures_histoFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mesures_histoFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mesures_histoClient<$Result.GetResult<Prisma.$tm_mesures_histoPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures_histo that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_histoFindFirstArgs} args - Arguments to find a Tm_mesures_histo
     * @example
     * // Get one Tm_mesures_histo
     * const tm_mesures_histo = await prisma.tm_mesures_histo.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mesures_histoFindFirstArgs>(args?: SelectSubset<T, tm_mesures_histoFindFirstArgs<ExtArgs>>): Prisma__tm_mesures_histoClient<$Result.GetResult<Prisma.$tm_mesures_histoPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures_histo that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_histoFindFirstOrThrowArgs} args - Arguments to find a Tm_mesures_histo
     * @example
     * // Get one Tm_mesures_histo
     * const tm_mesures_histo = await prisma.tm_mesures_histo.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mesures_histoFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mesures_histoFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mesures_histoClient<$Result.GetResult<Prisma.$tm_mesures_histoPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mesures_histos that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_histoFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mesures_histos
     * const tm_mesures_histos = await prisma.tm_mesures_histo.findMany()
     * 
     * // Get first 10 Tm_mesures_histos
     * const tm_mesures_histos = await prisma.tm_mesures_histo.findMany({ take: 10 })
     * 
     * // Only select the `Id_Mesure`
     * const tm_mesures_histoWithId_MesureOnly = await prisma.tm_mesures_histo.findMany({ select: { Id_Mesure: true } })
     * 
     */
    findMany<T extends tm_mesures_histoFindManyArgs>(args?: SelectSubset<T, tm_mesures_histoFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mesures_histoPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mesures_histo.
     * @param {tm_mesures_histoCreateArgs} args - Arguments to create a Tm_mesures_histo.
     * @example
     * // Create one Tm_mesures_histo
     * const Tm_mesures_histo = await prisma.tm_mesures_histo.create({
     *   data: {
     *     // ... data to create a Tm_mesures_histo
     *   }
     * })
     * 
     */
    create<T extends tm_mesures_histoCreateArgs>(args: SelectSubset<T, tm_mesures_histoCreateArgs<ExtArgs>>): Prisma__tm_mesures_histoClient<$Result.GetResult<Prisma.$tm_mesures_histoPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mesures_histos.
     * @param {tm_mesures_histoCreateManyArgs} args - Arguments to create many Tm_mesures_histos.
     * @example
     * // Create many Tm_mesures_histos
     * const tm_mesures_histo = await prisma.tm_mesures_histo.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mesures_histoCreateManyArgs>(args?: SelectSubset<T, tm_mesures_histoCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mesures_histo.
     * @param {tm_mesures_histoDeleteArgs} args - Arguments to delete one Tm_mesures_histo.
     * @example
     * // Delete one Tm_mesures_histo
     * const Tm_mesures_histo = await prisma.tm_mesures_histo.delete({
     *   where: {
     *     // ... filter to delete one Tm_mesures_histo
     *   }
     * })
     * 
     */
    delete<T extends tm_mesures_histoDeleteArgs>(args: SelectSubset<T, tm_mesures_histoDeleteArgs<ExtArgs>>): Prisma__tm_mesures_histoClient<$Result.GetResult<Prisma.$tm_mesures_histoPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mesures_histo.
     * @param {tm_mesures_histoUpdateArgs} args - Arguments to update one Tm_mesures_histo.
     * @example
     * // Update one Tm_mesures_histo
     * const tm_mesures_histo = await prisma.tm_mesures_histo.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mesures_histoUpdateArgs>(args: SelectSubset<T, tm_mesures_histoUpdateArgs<ExtArgs>>): Prisma__tm_mesures_histoClient<$Result.GetResult<Prisma.$tm_mesures_histoPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mesures_histos.
     * @param {tm_mesures_histoDeleteManyArgs} args - Arguments to filter Tm_mesures_histos to delete.
     * @example
     * // Delete a few Tm_mesures_histos
     * const { count } = await prisma.tm_mesures_histo.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mesures_histoDeleteManyArgs>(args?: SelectSubset<T, tm_mesures_histoDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mesures_histos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_histoUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mesures_histos
     * const tm_mesures_histo = await prisma.tm_mesures_histo.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mesures_histoUpdateManyArgs>(args: SelectSubset<T, tm_mesures_histoUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mesures_histo.
     * @param {tm_mesures_histoUpsertArgs} args - Arguments to update or create a Tm_mesures_histo.
     * @example
     * // Update or create a Tm_mesures_histo
     * const tm_mesures_histo = await prisma.tm_mesures_histo.upsert({
     *   create: {
     *     // ... data to create a Tm_mesures_histo
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mesures_histo we want to update
     *   }
     * })
     */
    upsert<T extends tm_mesures_histoUpsertArgs>(args: SelectSubset<T, tm_mesures_histoUpsertArgs<ExtArgs>>): Prisma__tm_mesures_histoClient<$Result.GetResult<Prisma.$tm_mesures_histoPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mesures_histos.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_histoCountArgs} args - Arguments to filter Tm_mesures_histos to count.
     * @example
     * // Count the number of Tm_mesures_histos
     * const count = await prisma.tm_mesures_histo.count({
     *   where: {
     *     // ... the filter for the Tm_mesures_histos we want to count
     *   }
     * })
    **/
    count<T extends tm_mesures_histoCountArgs>(
      args?: Subset<T, tm_mesures_histoCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mesures_histoCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mesures_histo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mesures_histoAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mesures_histoAggregateArgs>(args: Subset<T, Tm_mesures_histoAggregateArgs>): Prisma.PrismaPromise<GetTm_mesures_histoAggregateType<T>>

    /**
     * Group by Tm_mesures_histo.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_histoGroupByArgs} args - Group by arguments.
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
      T extends tm_mesures_histoGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mesures_histoGroupByArgs['orderBy'] }
        : { orderBy?: tm_mesures_histoGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mesures_histoGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mesures_histoGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mesures_histo model
   */
  readonly fields: tm_mesures_histoFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mesures_histo.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mesures_histoClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mesures_histo model
   */
  interface tm_mesures_histoFieldRefs {
    readonly Id_Mesure: FieldRef<"tm_mesures_histo", 'Int'>
    readonly Id_Serveur_BDD: FieldRef<"tm_mesures_histo", 'Int'>
    readonly Date_Heure_Mesure: FieldRef<"tm_mesures_histo", 'DateTime'>
    readonly Valeur: FieldRef<"tm_mesures_histo", 'Float'>
    readonly Valeur_Brute: FieldRef<"tm_mesures_histo", 'Float'>
    readonly Nb_decimal: FieldRef<"tm_mesures_histo", 'Int'>
    readonly Consigne: FieldRef<"tm_mesures_histo", 'Float'>
    readonly Consigne_Sup: FieldRef<"tm_mesures_histo", 'Float'>
    readonly Consigne_Inf: FieldRef<"tm_mesures_histo", 'Float'>
    readonly Unite: FieldRef<"tm_mesures_histo", 'String'>
    readonly Sonde_Numero_Serie: FieldRef<"tm_mesures_histo", 'String'>
    readonly Id_Lieu: FieldRef<"tm_mesures_histo", 'Int'>
    readonly Est_Valeur_Null: FieldRef<"tm_mesures_histo", 'Int'>
    readonly Frequence: FieldRef<"tm_mesures_histo", 'Int'>
    readonly Est_En_Alarme: FieldRef<"tm_mesures_histo", 'Boolean'>
    readonly Consigne_Inf_Pre_Alarme: FieldRef<"tm_mesures_histo", 'Float'>
    readonly Consigne_Sup_Pre_Alarme: FieldRef<"tm_mesures_histo", 'Float'>
    readonly Moyenne: FieldRef<"tm_mesures_histo", 'Float'>
  }
    

  // Custom InputTypes
  /**
   * tm_mesures_histo findUnique
   */
  export type tm_mesures_histoFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_histo to fetch.
     */
    where: tm_mesures_histoWhereUniqueInput
  }

  /**
   * tm_mesures_histo findUniqueOrThrow
   */
  export type tm_mesures_histoFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_histo to fetch.
     */
    where: tm_mesures_histoWhereUniqueInput
  }

  /**
   * tm_mesures_histo findFirst
   */
  export type tm_mesures_histoFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_histo to fetch.
     */
    where?: tm_mesures_histoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_histos to fetch.
     */
    orderBy?: tm_mesures_histoOrderByWithRelationInput | tm_mesures_histoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures_histos.
     */
    cursor?: tm_mesures_histoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_histos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_histos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_histos.
     */
    distinct?: Tm_mesures_histoScalarFieldEnum | Tm_mesures_histoScalarFieldEnum[]
  }

  /**
   * tm_mesures_histo findFirstOrThrow
   */
  export type tm_mesures_histoFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_histo to fetch.
     */
    where?: tm_mesures_histoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_histos to fetch.
     */
    orderBy?: tm_mesures_histoOrderByWithRelationInput | tm_mesures_histoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures_histos.
     */
    cursor?: tm_mesures_histoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_histos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_histos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_histos.
     */
    distinct?: Tm_mesures_histoScalarFieldEnum | Tm_mesures_histoScalarFieldEnum[]
  }

  /**
   * tm_mesures_histo findMany
   */
  export type tm_mesures_histoFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_histos to fetch.
     */
    where?: tm_mesures_histoWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_histos to fetch.
     */
    orderBy?: tm_mesures_histoOrderByWithRelationInput | tm_mesures_histoOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mesures_histos.
     */
    cursor?: tm_mesures_histoWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_histos from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_histos.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_histos.
     */
    distinct?: Tm_mesures_histoScalarFieldEnum | Tm_mesures_histoScalarFieldEnum[]
  }

  /**
   * tm_mesures_histo create
   */
  export type tm_mesures_histoCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mesures_histo.
     */
    data?: XOR<tm_mesures_histoCreateInput, tm_mesures_histoUncheckedCreateInput>
  }

  /**
   * tm_mesures_histo createMany
   */
  export type tm_mesures_histoCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mesures_histos.
     */
    data: tm_mesures_histoCreateManyInput | tm_mesures_histoCreateManyInput[]
  }

  /**
   * tm_mesures_histo update
   */
  export type tm_mesures_histoUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mesures_histo.
     */
    data: XOR<tm_mesures_histoUpdateInput, tm_mesures_histoUncheckedUpdateInput>
    /**
     * Choose, which tm_mesures_histo to update.
     */
    where: tm_mesures_histoWhereUniqueInput
  }

  /**
   * tm_mesures_histo updateMany
   */
  export type tm_mesures_histoUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mesures_histos.
     */
    data: XOR<tm_mesures_histoUpdateManyMutationInput, tm_mesures_histoUncheckedUpdateManyInput>
    /**
     * Filter which tm_mesures_histos to update
     */
    where?: tm_mesures_histoWhereInput
    /**
     * Limit how many tm_mesures_histos to update.
     */
    limit?: number
  }

  /**
   * tm_mesures_histo upsert
   */
  export type tm_mesures_histoUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mesures_histo to update in case it exists.
     */
    where: tm_mesures_histoWhereUniqueInput
    /**
     * In case the tm_mesures_histo found by the `where` argument doesn't exist, create a new tm_mesures_histo with this data.
     */
    create: XOR<tm_mesures_histoCreateInput, tm_mesures_histoUncheckedCreateInput>
    /**
     * In case the tm_mesures_histo was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mesures_histoUpdateInput, tm_mesures_histoUncheckedUpdateInput>
  }

  /**
   * tm_mesures_histo delete
   */
  export type tm_mesures_histoDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
    /**
     * Filter which tm_mesures_histo to delete.
     */
    where: tm_mesures_histoWhereUniqueInput
  }

  /**
   * tm_mesures_histo deleteMany
   */
  export type tm_mesures_histoDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures_histos to delete
     */
    where?: tm_mesures_histoWhereInput
    /**
     * Limit how many tm_mesures_histos to delete.
     */
    limit?: number
  }

  /**
   * tm_mesures_histo without action
   */
  export type tm_mesures_histoDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_histo
     */
    select?: tm_mesures_histoSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_histo
     */
    omit?: tm_mesures_histoOmit<ExtArgs> | null
  }


  /**
   * Model tm_mesures_test
   */

  export type AggregateTm_mesures_test = {
    _count: Tm_mesures_testCountAggregateOutputType | null
    _avg: Tm_mesures_testAvgAggregateOutputType | null
    _sum: Tm_mesures_testSumAggregateOutputType | null
    _min: Tm_mesures_testMinAggregateOutputType | null
    _max: Tm_mesures_testMaxAggregateOutputType | null
  }

  export type Tm_mesures_testAvgAggregateOutputType = {
    Id_Mesure_Test: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
    Nombre_Total: number | null
    Nombre_Recu: number | null
  }

  export type Tm_mesures_testSumAggregateOutputType = {
    Id_Mesure_Test: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
    Nombre_Total: number | null
    Nombre_Recu: number | null
  }

  export type Tm_mesures_testMinAggregateOutputType = {
    Id_Mesure_Test: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Sonde_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
    Nombre_Total: number | null
    Nombre_Recu: number | null
  }

  export type Tm_mesures_testMaxAggregateOutputType = {
    Id_Mesure_Test: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Sonde_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
    Nombre_Total: number | null
    Nombre_Recu: number | null
  }

  export type Tm_mesures_testCountAggregateOutputType = {
    Id_Mesure_Test: number
    Id_Serveur_BDD: number
    Valeur_Brute: number
    Sonde_Numero_Serie: number
    Est_Valeur_Null: number
    Date_Heure: number
    Nombre_Total: number
    Nombre_Recu: number
    _all: number
  }


  export type Tm_mesures_testAvgAggregateInputType = {
    Id_Mesure_Test?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
    Nombre_Total?: true
    Nombre_Recu?: true
  }

  export type Tm_mesures_testSumAggregateInputType = {
    Id_Mesure_Test?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
    Nombre_Total?: true
    Nombre_Recu?: true
  }

  export type Tm_mesures_testMinAggregateInputType = {
    Id_Mesure_Test?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Sonde_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    Nombre_Total?: true
    Nombre_Recu?: true
  }

  export type Tm_mesures_testMaxAggregateInputType = {
    Id_Mesure_Test?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Sonde_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    Nombre_Total?: true
    Nombre_Recu?: true
  }

  export type Tm_mesures_testCountAggregateInputType = {
    Id_Mesure_Test?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Sonde_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    Nombre_Total?: true
    Nombre_Recu?: true
    _all?: true
  }

  export type Tm_mesures_testAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures_test to aggregate.
     */
    where?: tm_mesures_testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_tests to fetch.
     */
    orderBy?: tm_mesures_testOrderByWithRelationInput | tm_mesures_testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mesures_testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mesures_tests
    **/
    _count?: true | Tm_mesures_testCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mesures_testAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mesures_testSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mesures_testMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mesures_testMaxAggregateInputType
  }

  export type GetTm_mesures_testAggregateType<T extends Tm_mesures_testAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mesures_test]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mesures_test[P]>
      : GetScalarType<T[P], AggregateTm_mesures_test[P]>
  }




  export type tm_mesures_testGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mesures_testWhereInput
    orderBy?: tm_mesures_testOrderByWithAggregationInput | tm_mesures_testOrderByWithAggregationInput[]
    by: Tm_mesures_testScalarFieldEnum[] | Tm_mesures_testScalarFieldEnum
    having?: tm_mesures_testScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mesures_testCountAggregateInputType | true
    _avg?: Tm_mesures_testAvgAggregateInputType
    _sum?: Tm_mesures_testSumAggregateInputType
    _min?: Tm_mesures_testMinAggregateInputType
    _max?: Tm_mesures_testMaxAggregateInputType
  }

  export type Tm_mesures_testGroupByOutputType = {
    Id_Mesure_Test: number
    Id_Serveur_BDD: number
    Valeur_Brute: number
    Sonde_Numero_Serie: string
    Est_Valeur_Null: number
    Date_Heure: Date
    Nombre_Total: number
    Nombre_Recu: number
    _count: Tm_mesures_testCountAggregateOutputType | null
    _avg: Tm_mesures_testAvgAggregateOutputType | null
    _sum: Tm_mesures_testSumAggregateOutputType | null
    _min: Tm_mesures_testMinAggregateOutputType | null
    _max: Tm_mesures_testMaxAggregateOutputType | null
  }

  type GetTm_mesures_testGroupByPayload<T extends tm_mesures_testGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mesures_testGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mesures_testGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mesures_testGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mesures_testGroupByOutputType[P]>
        }
      >
    >


  export type tm_mesures_testSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Mesure_Test?: boolean
    Id_Serveur_BDD?: boolean
    Valeur_Brute?: boolean
    Sonde_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
    Nombre_Total?: boolean
    Nombre_Recu?: boolean
  }, ExtArgs["result"]["tm_mesures_test"]>



  export type tm_mesures_testSelectScalar = {
    Id_Mesure_Test?: boolean
    Id_Serveur_BDD?: boolean
    Valeur_Brute?: boolean
    Sonde_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
    Nombre_Total?: boolean
    Nombre_Recu?: boolean
  }

  export type tm_mesures_testOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Mesure_Test" | "Id_Serveur_BDD" | "Valeur_Brute" | "Sonde_Numero_Serie" | "Est_Valeur_Null" | "Date_Heure" | "Nombre_Total" | "Nombre_Recu", ExtArgs["result"]["tm_mesures_test"]>

  export type $tm_mesures_testPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mesures_test"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Mesure_Test: number
      Id_Serveur_BDD: number
      Valeur_Brute: number
      Sonde_Numero_Serie: string
      Est_Valeur_Null: number
      Date_Heure: Date
      Nombre_Total: number
      Nombre_Recu: number
    }, ExtArgs["result"]["tm_mesures_test"]>
    composites: {}
  }

  type tm_mesures_testGetPayload<S extends boolean | null | undefined | tm_mesures_testDefaultArgs> = $Result.GetResult<Prisma.$tm_mesures_testPayload, S>

  type tm_mesures_testCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mesures_testFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mesures_testCountAggregateInputType | true
    }

  export interface tm_mesures_testDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mesures_test'], meta: { name: 'tm_mesures_test' } }
    /**
     * Find zero or one Tm_mesures_test that matches the filter.
     * @param {tm_mesures_testFindUniqueArgs} args - Arguments to find a Tm_mesures_test
     * @example
     * // Get one Tm_mesures_test
     * const tm_mesures_test = await prisma.tm_mesures_test.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mesures_testFindUniqueArgs>(args: SelectSubset<T, tm_mesures_testFindUniqueArgs<ExtArgs>>): Prisma__tm_mesures_testClient<$Result.GetResult<Prisma.$tm_mesures_testPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mesures_test that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mesures_testFindUniqueOrThrowArgs} args - Arguments to find a Tm_mesures_test
     * @example
     * // Get one Tm_mesures_test
     * const tm_mesures_test = await prisma.tm_mesures_test.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mesures_testFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mesures_testFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mesures_testClient<$Result.GetResult<Prisma.$tm_mesures_testPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures_test that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_testFindFirstArgs} args - Arguments to find a Tm_mesures_test
     * @example
     * // Get one Tm_mesures_test
     * const tm_mesures_test = await prisma.tm_mesures_test.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mesures_testFindFirstArgs>(args?: SelectSubset<T, tm_mesures_testFindFirstArgs<ExtArgs>>): Prisma__tm_mesures_testClient<$Result.GetResult<Prisma.$tm_mesures_testPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures_test that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_testFindFirstOrThrowArgs} args - Arguments to find a Tm_mesures_test
     * @example
     * // Get one Tm_mesures_test
     * const tm_mesures_test = await prisma.tm_mesures_test.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mesures_testFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mesures_testFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mesures_testClient<$Result.GetResult<Prisma.$tm_mesures_testPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mesures_tests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_testFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mesures_tests
     * const tm_mesures_tests = await prisma.tm_mesures_test.findMany()
     * 
     * // Get first 10 Tm_mesures_tests
     * const tm_mesures_tests = await prisma.tm_mesures_test.findMany({ take: 10 })
     * 
     * // Only select the `Id_Mesure_Test`
     * const tm_mesures_testWithId_Mesure_TestOnly = await prisma.tm_mesures_test.findMany({ select: { Id_Mesure_Test: true } })
     * 
     */
    findMany<T extends tm_mesures_testFindManyArgs>(args?: SelectSubset<T, tm_mesures_testFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mesures_testPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mesures_test.
     * @param {tm_mesures_testCreateArgs} args - Arguments to create a Tm_mesures_test.
     * @example
     * // Create one Tm_mesures_test
     * const Tm_mesures_test = await prisma.tm_mesures_test.create({
     *   data: {
     *     // ... data to create a Tm_mesures_test
     *   }
     * })
     * 
     */
    create<T extends tm_mesures_testCreateArgs>(args: SelectSubset<T, tm_mesures_testCreateArgs<ExtArgs>>): Prisma__tm_mesures_testClient<$Result.GetResult<Prisma.$tm_mesures_testPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mesures_tests.
     * @param {tm_mesures_testCreateManyArgs} args - Arguments to create many Tm_mesures_tests.
     * @example
     * // Create many Tm_mesures_tests
     * const tm_mesures_test = await prisma.tm_mesures_test.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mesures_testCreateManyArgs>(args?: SelectSubset<T, tm_mesures_testCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mesures_test.
     * @param {tm_mesures_testDeleteArgs} args - Arguments to delete one Tm_mesures_test.
     * @example
     * // Delete one Tm_mesures_test
     * const Tm_mesures_test = await prisma.tm_mesures_test.delete({
     *   where: {
     *     // ... filter to delete one Tm_mesures_test
     *   }
     * })
     * 
     */
    delete<T extends tm_mesures_testDeleteArgs>(args: SelectSubset<T, tm_mesures_testDeleteArgs<ExtArgs>>): Prisma__tm_mesures_testClient<$Result.GetResult<Prisma.$tm_mesures_testPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mesures_test.
     * @param {tm_mesures_testUpdateArgs} args - Arguments to update one Tm_mesures_test.
     * @example
     * // Update one Tm_mesures_test
     * const tm_mesures_test = await prisma.tm_mesures_test.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mesures_testUpdateArgs>(args: SelectSubset<T, tm_mesures_testUpdateArgs<ExtArgs>>): Prisma__tm_mesures_testClient<$Result.GetResult<Prisma.$tm_mesures_testPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mesures_tests.
     * @param {tm_mesures_testDeleteManyArgs} args - Arguments to filter Tm_mesures_tests to delete.
     * @example
     * // Delete a few Tm_mesures_tests
     * const { count } = await prisma.tm_mesures_test.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mesures_testDeleteManyArgs>(args?: SelectSubset<T, tm_mesures_testDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mesures_tests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_testUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mesures_tests
     * const tm_mesures_test = await prisma.tm_mesures_test.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mesures_testUpdateManyArgs>(args: SelectSubset<T, tm_mesures_testUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mesures_test.
     * @param {tm_mesures_testUpsertArgs} args - Arguments to update or create a Tm_mesures_test.
     * @example
     * // Update or create a Tm_mesures_test
     * const tm_mesures_test = await prisma.tm_mesures_test.upsert({
     *   create: {
     *     // ... data to create a Tm_mesures_test
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mesures_test we want to update
     *   }
     * })
     */
    upsert<T extends tm_mesures_testUpsertArgs>(args: SelectSubset<T, tm_mesures_testUpsertArgs<ExtArgs>>): Prisma__tm_mesures_testClient<$Result.GetResult<Prisma.$tm_mesures_testPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mesures_tests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_testCountArgs} args - Arguments to filter Tm_mesures_tests to count.
     * @example
     * // Count the number of Tm_mesures_tests
     * const count = await prisma.tm_mesures_test.count({
     *   where: {
     *     // ... the filter for the Tm_mesures_tests we want to count
     *   }
     * })
    **/
    count<T extends tm_mesures_testCountArgs>(
      args?: Subset<T, tm_mesures_testCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mesures_testCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mesures_test.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mesures_testAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mesures_testAggregateArgs>(args: Subset<T, Tm_mesures_testAggregateArgs>): Prisma.PrismaPromise<GetTm_mesures_testAggregateType<T>>

    /**
     * Group by Tm_mesures_test.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_testGroupByArgs} args - Group by arguments.
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
      T extends tm_mesures_testGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mesures_testGroupByArgs['orderBy'] }
        : { orderBy?: tm_mesures_testGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mesures_testGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mesures_testGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mesures_test model
   */
  readonly fields: tm_mesures_testFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mesures_test.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mesures_testClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mesures_test model
   */
  interface tm_mesures_testFieldRefs {
    readonly Id_Mesure_Test: FieldRef<"tm_mesures_test", 'Int'>
    readonly Id_Serveur_BDD: FieldRef<"tm_mesures_test", 'Int'>
    readonly Valeur_Brute: FieldRef<"tm_mesures_test", 'Float'>
    readonly Sonde_Numero_Serie: FieldRef<"tm_mesures_test", 'String'>
    readonly Est_Valeur_Null: FieldRef<"tm_mesures_test", 'Int'>
    readonly Date_Heure: FieldRef<"tm_mesures_test", 'DateTime'>
    readonly Nombre_Total: FieldRef<"tm_mesures_test", 'Int'>
    readonly Nombre_Recu: FieldRef<"tm_mesures_test", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * tm_mesures_test findUnique
   */
  export type tm_mesures_testFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_test to fetch.
     */
    where: tm_mesures_testWhereUniqueInput
  }

  /**
   * tm_mesures_test findUniqueOrThrow
   */
  export type tm_mesures_testFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_test to fetch.
     */
    where: tm_mesures_testWhereUniqueInput
  }

  /**
   * tm_mesures_test findFirst
   */
  export type tm_mesures_testFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_test to fetch.
     */
    where?: tm_mesures_testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_tests to fetch.
     */
    orderBy?: tm_mesures_testOrderByWithRelationInput | tm_mesures_testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures_tests.
     */
    cursor?: tm_mesures_testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_tests.
     */
    distinct?: Tm_mesures_testScalarFieldEnum | Tm_mesures_testScalarFieldEnum[]
  }

  /**
   * tm_mesures_test findFirstOrThrow
   */
  export type tm_mesures_testFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_test to fetch.
     */
    where?: tm_mesures_testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_tests to fetch.
     */
    orderBy?: tm_mesures_testOrderByWithRelationInput | tm_mesures_testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures_tests.
     */
    cursor?: tm_mesures_testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_tests.
     */
    distinct?: Tm_mesures_testScalarFieldEnum | Tm_mesures_testScalarFieldEnum[]
  }

  /**
   * tm_mesures_test findMany
   */
  export type tm_mesures_testFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_tests to fetch.
     */
    where?: tm_mesures_testWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_tests to fetch.
     */
    orderBy?: tm_mesures_testOrderByWithRelationInput | tm_mesures_testOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mesures_tests.
     */
    cursor?: tm_mesures_testWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_tests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_tests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_tests.
     */
    distinct?: Tm_mesures_testScalarFieldEnum | Tm_mesures_testScalarFieldEnum[]
  }

  /**
   * tm_mesures_test create
   */
  export type tm_mesures_testCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mesures_test.
     */
    data: XOR<tm_mesures_testCreateInput, tm_mesures_testUncheckedCreateInput>
  }

  /**
   * tm_mesures_test createMany
   */
  export type tm_mesures_testCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mesures_tests.
     */
    data: tm_mesures_testCreateManyInput | tm_mesures_testCreateManyInput[]
  }

  /**
   * tm_mesures_test update
   */
  export type tm_mesures_testUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mesures_test.
     */
    data: XOR<tm_mesures_testUpdateInput, tm_mesures_testUncheckedUpdateInput>
    /**
     * Choose, which tm_mesures_test to update.
     */
    where: tm_mesures_testWhereUniqueInput
  }

  /**
   * tm_mesures_test updateMany
   */
  export type tm_mesures_testUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mesures_tests.
     */
    data: XOR<tm_mesures_testUpdateManyMutationInput, tm_mesures_testUncheckedUpdateManyInput>
    /**
     * Filter which tm_mesures_tests to update
     */
    where?: tm_mesures_testWhereInput
    /**
     * Limit how many tm_mesures_tests to update.
     */
    limit?: number
  }

  /**
   * tm_mesures_test upsert
   */
  export type tm_mesures_testUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mesures_test to update in case it exists.
     */
    where: tm_mesures_testWhereUniqueInput
    /**
     * In case the tm_mesures_test found by the `where` argument doesn't exist, create a new tm_mesures_test with this data.
     */
    create: XOR<tm_mesures_testCreateInput, tm_mesures_testUncheckedCreateInput>
    /**
     * In case the tm_mesures_test was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mesures_testUpdateInput, tm_mesures_testUncheckedUpdateInput>
  }

  /**
   * tm_mesures_test delete
   */
  export type tm_mesures_testDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
    /**
     * Filter which tm_mesures_test to delete.
     */
    where: tm_mesures_testWhereUniqueInput
  }

  /**
   * tm_mesures_test deleteMany
   */
  export type tm_mesures_testDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures_tests to delete
     */
    where?: tm_mesures_testWhereInput
    /**
     * Limit how many tm_mesures_tests to delete.
     */
    limit?: number
  }

  /**
   * tm_mesures_test without action
   */
  export type tm_mesures_testDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test
     */
    select?: tm_mesures_testSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test
     */
    omit?: tm_mesures_testOmit<ExtArgs> | null
  }


  /**
   * Model tm_mesures_test_etalon
   */

  export type AggregateTm_mesures_test_etalon = {
    _count: Tm_mesures_test_etalonCountAggregateOutputType | null
    _avg: Tm_mesures_test_etalonAvgAggregateOutputType | null
    _sum: Tm_mesures_test_etalonSumAggregateOutputType | null
    _min: Tm_mesures_test_etalonMinAggregateOutputType | null
    _max: Tm_mesures_test_etalonMaxAggregateOutputType | null
  }

  export type Tm_mesures_test_etalonAvgAggregateOutputType = {
    Id_Mesure_Test_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
    Nombre_Total: number | null
    Nombre_Recu: number | null
  }

  export type Tm_mesures_test_etalonSumAggregateOutputType = {
    Id_Mesure_Test_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Est_Valeur_Null: number | null
    Nombre_Total: number | null
    Nombre_Recu: number | null
  }

  export type Tm_mesures_test_etalonMinAggregateOutputType = {
    Id_Mesure_Test_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Etalon_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
    Nombre_Total: number | null
    Nombre_Recu: number | null
  }

  export type Tm_mesures_test_etalonMaxAggregateOutputType = {
    Id_Mesure_Test_Etalon: number | null
    Id_Serveur_BDD: number | null
    Valeur_Brute: number | null
    Etalon_Numero_Serie: string | null
    Est_Valeur_Null: number | null
    Date_Heure: Date | null
    Nombre_Total: number | null
    Nombre_Recu: number | null
  }

  export type Tm_mesures_test_etalonCountAggregateOutputType = {
    Id_Mesure_Test_Etalon: number
    Id_Serveur_BDD: number
    Valeur_Brute: number
    Etalon_Numero_Serie: number
    Est_Valeur_Null: number
    Date_Heure: number
    Nombre_Total: number
    Nombre_Recu: number
    _all: number
  }


  export type Tm_mesures_test_etalonAvgAggregateInputType = {
    Id_Mesure_Test_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
    Nombre_Total?: true
    Nombre_Recu?: true
  }

  export type Tm_mesures_test_etalonSumAggregateInputType = {
    Id_Mesure_Test_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Est_Valeur_Null?: true
    Nombre_Total?: true
    Nombre_Recu?: true
  }

  export type Tm_mesures_test_etalonMinAggregateInputType = {
    Id_Mesure_Test_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Etalon_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    Nombre_Total?: true
    Nombre_Recu?: true
  }

  export type Tm_mesures_test_etalonMaxAggregateInputType = {
    Id_Mesure_Test_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Etalon_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    Nombre_Total?: true
    Nombre_Recu?: true
  }

  export type Tm_mesures_test_etalonCountAggregateInputType = {
    Id_Mesure_Test_Etalon?: true
    Id_Serveur_BDD?: true
    Valeur_Brute?: true
    Etalon_Numero_Serie?: true
    Est_Valeur_Null?: true
    Date_Heure?: true
    Nombre_Total?: true
    Nombre_Recu?: true
    _all?: true
  }

  export type Tm_mesures_test_etalonAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures_test_etalon to aggregate.
     */
    where?: tm_mesures_test_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_test_etalons to fetch.
     */
    orderBy?: tm_mesures_test_etalonOrderByWithRelationInput | tm_mesures_test_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mesures_test_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_test_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_test_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mesures_test_etalons
    **/
    _count?: true | Tm_mesures_test_etalonCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mesures_test_etalonAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mesures_test_etalonSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mesures_test_etalonMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mesures_test_etalonMaxAggregateInputType
  }

  export type GetTm_mesures_test_etalonAggregateType<T extends Tm_mesures_test_etalonAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mesures_test_etalon]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mesures_test_etalon[P]>
      : GetScalarType<T[P], AggregateTm_mesures_test_etalon[P]>
  }




  export type tm_mesures_test_etalonGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mesures_test_etalonWhereInput
    orderBy?: tm_mesures_test_etalonOrderByWithAggregationInput | tm_mesures_test_etalonOrderByWithAggregationInput[]
    by: Tm_mesures_test_etalonScalarFieldEnum[] | Tm_mesures_test_etalonScalarFieldEnum
    having?: tm_mesures_test_etalonScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mesures_test_etalonCountAggregateInputType | true
    _avg?: Tm_mesures_test_etalonAvgAggregateInputType
    _sum?: Tm_mesures_test_etalonSumAggregateInputType
    _min?: Tm_mesures_test_etalonMinAggregateInputType
    _max?: Tm_mesures_test_etalonMaxAggregateInputType
  }

  export type Tm_mesures_test_etalonGroupByOutputType = {
    Id_Mesure_Test_Etalon: number
    Id_Serveur_BDD: number
    Valeur_Brute: number
    Etalon_Numero_Serie: string
    Est_Valeur_Null: number
    Date_Heure: Date
    Nombre_Total: number
    Nombre_Recu: number
    _count: Tm_mesures_test_etalonCountAggregateOutputType | null
    _avg: Tm_mesures_test_etalonAvgAggregateOutputType | null
    _sum: Tm_mesures_test_etalonSumAggregateOutputType | null
    _min: Tm_mesures_test_etalonMinAggregateOutputType | null
    _max: Tm_mesures_test_etalonMaxAggregateOutputType | null
  }

  type GetTm_mesures_test_etalonGroupByPayload<T extends tm_mesures_test_etalonGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mesures_test_etalonGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mesures_test_etalonGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mesures_test_etalonGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mesures_test_etalonGroupByOutputType[P]>
        }
      >
    >


  export type tm_mesures_test_etalonSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Mesure_Test_Etalon?: boolean
    Id_Serveur_BDD?: boolean
    Valeur_Brute?: boolean
    Etalon_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
    Nombre_Total?: boolean
    Nombre_Recu?: boolean
  }, ExtArgs["result"]["tm_mesures_test_etalon"]>



  export type tm_mesures_test_etalonSelectScalar = {
    Id_Mesure_Test_Etalon?: boolean
    Id_Serveur_BDD?: boolean
    Valeur_Brute?: boolean
    Etalon_Numero_Serie?: boolean
    Est_Valeur_Null?: boolean
    Date_Heure?: boolean
    Nombre_Total?: boolean
    Nombre_Recu?: boolean
  }

  export type tm_mesures_test_etalonOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Mesure_Test_Etalon" | "Id_Serveur_BDD" | "Valeur_Brute" | "Etalon_Numero_Serie" | "Est_Valeur_Null" | "Date_Heure" | "Nombre_Total" | "Nombre_Recu", ExtArgs["result"]["tm_mesures_test_etalon"]>

  export type $tm_mesures_test_etalonPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mesures_test_etalon"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Mesure_Test_Etalon: number
      Id_Serveur_BDD: number
      Valeur_Brute: number
      Etalon_Numero_Serie: string
      Est_Valeur_Null: number
      Date_Heure: Date
      Nombre_Total: number
      Nombre_Recu: number
    }, ExtArgs["result"]["tm_mesures_test_etalon"]>
    composites: {}
  }

  type tm_mesures_test_etalonGetPayload<S extends boolean | null | undefined | tm_mesures_test_etalonDefaultArgs> = $Result.GetResult<Prisma.$tm_mesures_test_etalonPayload, S>

  type tm_mesures_test_etalonCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mesures_test_etalonFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mesures_test_etalonCountAggregateInputType | true
    }

  export interface tm_mesures_test_etalonDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mesures_test_etalon'], meta: { name: 'tm_mesures_test_etalon' } }
    /**
     * Find zero or one Tm_mesures_test_etalon that matches the filter.
     * @param {tm_mesures_test_etalonFindUniqueArgs} args - Arguments to find a Tm_mesures_test_etalon
     * @example
     * // Get one Tm_mesures_test_etalon
     * const tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mesures_test_etalonFindUniqueArgs>(args: SelectSubset<T, tm_mesures_test_etalonFindUniqueArgs<ExtArgs>>): Prisma__tm_mesures_test_etalonClient<$Result.GetResult<Prisma.$tm_mesures_test_etalonPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mesures_test_etalon that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mesures_test_etalonFindUniqueOrThrowArgs} args - Arguments to find a Tm_mesures_test_etalon
     * @example
     * // Get one Tm_mesures_test_etalon
     * const tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mesures_test_etalonFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mesures_test_etalonFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mesures_test_etalonClient<$Result.GetResult<Prisma.$tm_mesures_test_etalonPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures_test_etalon that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_test_etalonFindFirstArgs} args - Arguments to find a Tm_mesures_test_etalon
     * @example
     * // Get one Tm_mesures_test_etalon
     * const tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mesures_test_etalonFindFirstArgs>(args?: SelectSubset<T, tm_mesures_test_etalonFindFirstArgs<ExtArgs>>): Prisma__tm_mesures_test_etalonClient<$Result.GetResult<Prisma.$tm_mesures_test_etalonPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mesures_test_etalon that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_test_etalonFindFirstOrThrowArgs} args - Arguments to find a Tm_mesures_test_etalon
     * @example
     * // Get one Tm_mesures_test_etalon
     * const tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mesures_test_etalonFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mesures_test_etalonFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mesures_test_etalonClient<$Result.GetResult<Prisma.$tm_mesures_test_etalonPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mesures_test_etalons that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_test_etalonFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mesures_test_etalons
     * const tm_mesures_test_etalons = await prisma.tm_mesures_test_etalon.findMany()
     * 
     * // Get first 10 Tm_mesures_test_etalons
     * const tm_mesures_test_etalons = await prisma.tm_mesures_test_etalon.findMany({ take: 10 })
     * 
     * // Only select the `Id_Mesure_Test_Etalon`
     * const tm_mesures_test_etalonWithId_Mesure_Test_EtalonOnly = await prisma.tm_mesures_test_etalon.findMany({ select: { Id_Mesure_Test_Etalon: true } })
     * 
     */
    findMany<T extends tm_mesures_test_etalonFindManyArgs>(args?: SelectSubset<T, tm_mesures_test_etalonFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mesures_test_etalonPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mesures_test_etalon.
     * @param {tm_mesures_test_etalonCreateArgs} args - Arguments to create a Tm_mesures_test_etalon.
     * @example
     * // Create one Tm_mesures_test_etalon
     * const Tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.create({
     *   data: {
     *     // ... data to create a Tm_mesures_test_etalon
     *   }
     * })
     * 
     */
    create<T extends tm_mesures_test_etalonCreateArgs>(args: SelectSubset<T, tm_mesures_test_etalonCreateArgs<ExtArgs>>): Prisma__tm_mesures_test_etalonClient<$Result.GetResult<Prisma.$tm_mesures_test_etalonPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mesures_test_etalons.
     * @param {tm_mesures_test_etalonCreateManyArgs} args - Arguments to create many Tm_mesures_test_etalons.
     * @example
     * // Create many Tm_mesures_test_etalons
     * const tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mesures_test_etalonCreateManyArgs>(args?: SelectSubset<T, tm_mesures_test_etalonCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mesures_test_etalon.
     * @param {tm_mesures_test_etalonDeleteArgs} args - Arguments to delete one Tm_mesures_test_etalon.
     * @example
     * // Delete one Tm_mesures_test_etalon
     * const Tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.delete({
     *   where: {
     *     // ... filter to delete one Tm_mesures_test_etalon
     *   }
     * })
     * 
     */
    delete<T extends tm_mesures_test_etalonDeleteArgs>(args: SelectSubset<T, tm_mesures_test_etalonDeleteArgs<ExtArgs>>): Prisma__tm_mesures_test_etalonClient<$Result.GetResult<Prisma.$tm_mesures_test_etalonPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mesures_test_etalon.
     * @param {tm_mesures_test_etalonUpdateArgs} args - Arguments to update one Tm_mesures_test_etalon.
     * @example
     * // Update one Tm_mesures_test_etalon
     * const tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mesures_test_etalonUpdateArgs>(args: SelectSubset<T, tm_mesures_test_etalonUpdateArgs<ExtArgs>>): Prisma__tm_mesures_test_etalonClient<$Result.GetResult<Prisma.$tm_mesures_test_etalonPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mesures_test_etalons.
     * @param {tm_mesures_test_etalonDeleteManyArgs} args - Arguments to filter Tm_mesures_test_etalons to delete.
     * @example
     * // Delete a few Tm_mesures_test_etalons
     * const { count } = await prisma.tm_mesures_test_etalon.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mesures_test_etalonDeleteManyArgs>(args?: SelectSubset<T, tm_mesures_test_etalonDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mesures_test_etalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_test_etalonUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mesures_test_etalons
     * const tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mesures_test_etalonUpdateManyArgs>(args: SelectSubset<T, tm_mesures_test_etalonUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mesures_test_etalon.
     * @param {tm_mesures_test_etalonUpsertArgs} args - Arguments to update or create a Tm_mesures_test_etalon.
     * @example
     * // Update or create a Tm_mesures_test_etalon
     * const tm_mesures_test_etalon = await prisma.tm_mesures_test_etalon.upsert({
     *   create: {
     *     // ... data to create a Tm_mesures_test_etalon
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mesures_test_etalon we want to update
     *   }
     * })
     */
    upsert<T extends tm_mesures_test_etalonUpsertArgs>(args: SelectSubset<T, tm_mesures_test_etalonUpsertArgs<ExtArgs>>): Prisma__tm_mesures_test_etalonClient<$Result.GetResult<Prisma.$tm_mesures_test_etalonPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mesures_test_etalons.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_test_etalonCountArgs} args - Arguments to filter Tm_mesures_test_etalons to count.
     * @example
     * // Count the number of Tm_mesures_test_etalons
     * const count = await prisma.tm_mesures_test_etalon.count({
     *   where: {
     *     // ... the filter for the Tm_mesures_test_etalons we want to count
     *   }
     * })
    **/
    count<T extends tm_mesures_test_etalonCountArgs>(
      args?: Subset<T, tm_mesures_test_etalonCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mesures_test_etalonCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mesures_test_etalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mesures_test_etalonAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mesures_test_etalonAggregateArgs>(args: Subset<T, Tm_mesures_test_etalonAggregateArgs>): Prisma.PrismaPromise<GetTm_mesures_test_etalonAggregateType<T>>

    /**
     * Group by Tm_mesures_test_etalon.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mesures_test_etalonGroupByArgs} args - Group by arguments.
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
      T extends tm_mesures_test_etalonGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mesures_test_etalonGroupByArgs['orderBy'] }
        : { orderBy?: tm_mesures_test_etalonGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mesures_test_etalonGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mesures_test_etalonGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mesures_test_etalon model
   */
  readonly fields: tm_mesures_test_etalonFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mesures_test_etalon.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mesures_test_etalonClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mesures_test_etalon model
   */
  interface tm_mesures_test_etalonFieldRefs {
    readonly Id_Mesure_Test_Etalon: FieldRef<"tm_mesures_test_etalon", 'Int'>
    readonly Id_Serveur_BDD: FieldRef<"tm_mesures_test_etalon", 'Int'>
    readonly Valeur_Brute: FieldRef<"tm_mesures_test_etalon", 'Float'>
    readonly Etalon_Numero_Serie: FieldRef<"tm_mesures_test_etalon", 'String'>
    readonly Est_Valeur_Null: FieldRef<"tm_mesures_test_etalon", 'Int'>
    readonly Date_Heure: FieldRef<"tm_mesures_test_etalon", 'DateTime'>
    readonly Nombre_Total: FieldRef<"tm_mesures_test_etalon", 'Int'>
    readonly Nombre_Recu: FieldRef<"tm_mesures_test_etalon", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * tm_mesures_test_etalon findUnique
   */
  export type tm_mesures_test_etalonFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_test_etalon to fetch.
     */
    where: tm_mesures_test_etalonWhereUniqueInput
  }

  /**
   * tm_mesures_test_etalon findUniqueOrThrow
   */
  export type tm_mesures_test_etalonFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_test_etalon to fetch.
     */
    where: tm_mesures_test_etalonWhereUniqueInput
  }

  /**
   * tm_mesures_test_etalon findFirst
   */
  export type tm_mesures_test_etalonFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_test_etalon to fetch.
     */
    where?: tm_mesures_test_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_test_etalons to fetch.
     */
    orderBy?: tm_mesures_test_etalonOrderByWithRelationInput | tm_mesures_test_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures_test_etalons.
     */
    cursor?: tm_mesures_test_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_test_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_test_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_test_etalons.
     */
    distinct?: Tm_mesures_test_etalonScalarFieldEnum | Tm_mesures_test_etalonScalarFieldEnum[]
  }

  /**
   * tm_mesures_test_etalon findFirstOrThrow
   */
  export type tm_mesures_test_etalonFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_test_etalon to fetch.
     */
    where?: tm_mesures_test_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_test_etalons to fetch.
     */
    orderBy?: tm_mesures_test_etalonOrderByWithRelationInput | tm_mesures_test_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mesures_test_etalons.
     */
    cursor?: tm_mesures_test_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_test_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_test_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_test_etalons.
     */
    distinct?: Tm_mesures_test_etalonScalarFieldEnum | Tm_mesures_test_etalonScalarFieldEnum[]
  }

  /**
   * tm_mesures_test_etalon findMany
   */
  export type tm_mesures_test_etalonFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
    /**
     * Filter, which tm_mesures_test_etalons to fetch.
     */
    where?: tm_mesures_test_etalonWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mesures_test_etalons to fetch.
     */
    orderBy?: tm_mesures_test_etalonOrderByWithRelationInput | tm_mesures_test_etalonOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mesures_test_etalons.
     */
    cursor?: tm_mesures_test_etalonWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mesures_test_etalons from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mesures_test_etalons.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mesures_test_etalons.
     */
    distinct?: Tm_mesures_test_etalonScalarFieldEnum | Tm_mesures_test_etalonScalarFieldEnum[]
  }

  /**
   * tm_mesures_test_etalon create
   */
  export type tm_mesures_test_etalonCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mesures_test_etalon.
     */
    data: XOR<tm_mesures_test_etalonCreateInput, tm_mesures_test_etalonUncheckedCreateInput>
  }

  /**
   * tm_mesures_test_etalon createMany
   */
  export type tm_mesures_test_etalonCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mesures_test_etalons.
     */
    data: tm_mesures_test_etalonCreateManyInput | tm_mesures_test_etalonCreateManyInput[]
  }

  /**
   * tm_mesures_test_etalon update
   */
  export type tm_mesures_test_etalonUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mesures_test_etalon.
     */
    data: XOR<tm_mesures_test_etalonUpdateInput, tm_mesures_test_etalonUncheckedUpdateInput>
    /**
     * Choose, which tm_mesures_test_etalon to update.
     */
    where: tm_mesures_test_etalonWhereUniqueInput
  }

  /**
   * tm_mesures_test_etalon updateMany
   */
  export type tm_mesures_test_etalonUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mesures_test_etalons.
     */
    data: XOR<tm_mesures_test_etalonUpdateManyMutationInput, tm_mesures_test_etalonUncheckedUpdateManyInput>
    /**
     * Filter which tm_mesures_test_etalons to update
     */
    where?: tm_mesures_test_etalonWhereInput
    /**
     * Limit how many tm_mesures_test_etalons to update.
     */
    limit?: number
  }

  /**
   * tm_mesures_test_etalon upsert
   */
  export type tm_mesures_test_etalonUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mesures_test_etalon to update in case it exists.
     */
    where: tm_mesures_test_etalonWhereUniqueInput
    /**
     * In case the tm_mesures_test_etalon found by the `where` argument doesn't exist, create a new tm_mesures_test_etalon with this data.
     */
    create: XOR<tm_mesures_test_etalonCreateInput, tm_mesures_test_etalonUncheckedCreateInput>
    /**
     * In case the tm_mesures_test_etalon was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mesures_test_etalonUpdateInput, tm_mesures_test_etalonUncheckedUpdateInput>
  }

  /**
   * tm_mesures_test_etalon delete
   */
  export type tm_mesures_test_etalonDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
    /**
     * Filter which tm_mesures_test_etalon to delete.
     */
    where: tm_mesures_test_etalonWhereUniqueInput
  }

  /**
   * tm_mesures_test_etalon deleteMany
   */
  export type tm_mesures_test_etalonDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mesures_test_etalons to delete
     */
    where?: tm_mesures_test_etalonWhereInput
    /**
     * Limit how many tm_mesures_test_etalons to delete.
     */
    limit?: number
  }

  /**
   * tm_mesures_test_etalon without action
   */
  export type tm_mesures_test_etalonDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mesures_test_etalon
     */
    select?: tm_mesures_test_etalonSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mesures_test_etalon
     */
    omit?: tm_mesures_test_etalonOmit<ExtArgs> | null
  }


  /**
   * Model tm_mode_degrade
   */

  export type AggregateTm_mode_degrade = {
    _count: Tm_mode_degradeCountAggregateOutputType | null
    _avg: Tm_mode_degradeAvgAggregateOutputType | null
    _sum: Tm_mode_degradeSumAggregateOutputType | null
    _min: Tm_mode_degradeMinAggregateOutputType | null
    _max: Tm_mode_degradeMaxAggregateOutputType | null
  }

  export type Tm_mode_degradeAvgAggregateOutputType = {
    Id_Mode_Degrade: number | null
    Id_Utilisateur: number | null
  }

  export type Tm_mode_degradeSumAggregateOutputType = {
    Id_Mode_Degrade: number | null
    Id_Utilisateur: number | null
  }

  export type Tm_mode_degradeMinAggregateOutputType = {
    Id_Mode_Degrade: number | null
    Id_Utilisateur: number | null
    Date_Heure_Creation: Date | null
    Requete_SQL: string | null
    Est_Archivee: boolean | null
    Date_Heure_Archive: Date | null
  }

  export type Tm_mode_degradeMaxAggregateOutputType = {
    Id_Mode_Degrade: number | null
    Id_Utilisateur: number | null
    Date_Heure_Creation: Date | null
    Requete_SQL: string | null
    Est_Archivee: boolean | null
    Date_Heure_Archive: Date | null
  }

  export type Tm_mode_degradeCountAggregateOutputType = {
    Id_Mode_Degrade: number
    Id_Utilisateur: number
    Date_Heure_Creation: number
    Requete_SQL: number
    Est_Archivee: number
    Date_Heure_Archive: number
    _all: number
  }


  export type Tm_mode_degradeAvgAggregateInputType = {
    Id_Mode_Degrade?: true
    Id_Utilisateur?: true
  }

  export type Tm_mode_degradeSumAggregateInputType = {
    Id_Mode_Degrade?: true
    Id_Utilisateur?: true
  }

  export type Tm_mode_degradeMinAggregateInputType = {
    Id_Mode_Degrade?: true
    Id_Utilisateur?: true
    Date_Heure_Creation?: true
    Requete_SQL?: true
    Est_Archivee?: true
    Date_Heure_Archive?: true
  }

  export type Tm_mode_degradeMaxAggregateInputType = {
    Id_Mode_Degrade?: true
    Id_Utilisateur?: true
    Date_Heure_Creation?: true
    Requete_SQL?: true
    Est_Archivee?: true
    Date_Heure_Archive?: true
  }

  export type Tm_mode_degradeCountAggregateInputType = {
    Id_Mode_Degrade?: true
    Id_Utilisateur?: true
    Date_Heure_Creation?: true
    Requete_SQL?: true
    Est_Archivee?: true
    Date_Heure_Archive?: true
    _all?: true
  }

  export type Tm_mode_degradeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mode_degrade to aggregate.
     */
    where?: tm_mode_degradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mode_degrades to fetch.
     */
    orderBy?: tm_mode_degradeOrderByWithRelationInput | tm_mode_degradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_mode_degradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mode_degrades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mode_degrades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_mode_degrades
    **/
    _count?: true | Tm_mode_degradeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_mode_degradeAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_mode_degradeSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_mode_degradeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_mode_degradeMaxAggregateInputType
  }

  export type GetTm_mode_degradeAggregateType<T extends Tm_mode_degradeAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_mode_degrade]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_mode_degrade[P]>
      : GetScalarType<T[P], AggregateTm_mode_degrade[P]>
  }




  export type tm_mode_degradeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_mode_degradeWhereInput
    orderBy?: tm_mode_degradeOrderByWithAggregationInput | tm_mode_degradeOrderByWithAggregationInput[]
    by: Tm_mode_degradeScalarFieldEnum[] | Tm_mode_degradeScalarFieldEnum
    having?: tm_mode_degradeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_mode_degradeCountAggregateInputType | true
    _avg?: Tm_mode_degradeAvgAggregateInputType
    _sum?: Tm_mode_degradeSumAggregateInputType
    _min?: Tm_mode_degradeMinAggregateInputType
    _max?: Tm_mode_degradeMaxAggregateInputType
  }

  export type Tm_mode_degradeGroupByOutputType = {
    Id_Mode_Degrade: number
    Id_Utilisateur: number | null
    Date_Heure_Creation: Date | null
    Requete_SQL: string | null
    Est_Archivee: boolean
    Date_Heure_Archive: Date | null
    _count: Tm_mode_degradeCountAggregateOutputType | null
    _avg: Tm_mode_degradeAvgAggregateOutputType | null
    _sum: Tm_mode_degradeSumAggregateOutputType | null
    _min: Tm_mode_degradeMinAggregateOutputType | null
    _max: Tm_mode_degradeMaxAggregateOutputType | null
  }

  type GetTm_mode_degradeGroupByPayload<T extends tm_mode_degradeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_mode_degradeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_mode_degradeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_mode_degradeGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_mode_degradeGroupByOutputType[P]>
        }
      >
    >


  export type tm_mode_degradeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Mode_Degrade?: boolean
    Id_Utilisateur?: boolean
    Date_Heure_Creation?: boolean
    Requete_SQL?: boolean
    Est_Archivee?: boolean
    Date_Heure_Archive?: boolean
  }, ExtArgs["result"]["tm_mode_degrade"]>



  export type tm_mode_degradeSelectScalar = {
    Id_Mode_Degrade?: boolean
    Id_Utilisateur?: boolean
    Date_Heure_Creation?: boolean
    Requete_SQL?: boolean
    Est_Archivee?: boolean
    Date_Heure_Archive?: boolean
  }

  export type tm_mode_degradeOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Mode_Degrade" | "Id_Utilisateur" | "Date_Heure_Creation" | "Requete_SQL" | "Est_Archivee" | "Date_Heure_Archive", ExtArgs["result"]["tm_mode_degrade"]>

  export type $tm_mode_degradePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_mode_degrade"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Mode_Degrade: number
      Id_Utilisateur: number | null
      Date_Heure_Creation: Date | null
      Requete_SQL: string | null
      Est_Archivee: boolean
      Date_Heure_Archive: Date | null
    }, ExtArgs["result"]["tm_mode_degrade"]>
    composites: {}
  }

  type tm_mode_degradeGetPayload<S extends boolean | null | undefined | tm_mode_degradeDefaultArgs> = $Result.GetResult<Prisma.$tm_mode_degradePayload, S>

  type tm_mode_degradeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_mode_degradeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_mode_degradeCountAggregateInputType | true
    }

  export interface tm_mode_degradeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_mode_degrade'], meta: { name: 'tm_mode_degrade' } }
    /**
     * Find zero or one Tm_mode_degrade that matches the filter.
     * @param {tm_mode_degradeFindUniqueArgs} args - Arguments to find a Tm_mode_degrade
     * @example
     * // Get one Tm_mode_degrade
     * const tm_mode_degrade = await prisma.tm_mode_degrade.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_mode_degradeFindUniqueArgs>(args: SelectSubset<T, tm_mode_degradeFindUniqueArgs<ExtArgs>>): Prisma__tm_mode_degradeClient<$Result.GetResult<Prisma.$tm_mode_degradePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_mode_degrade that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_mode_degradeFindUniqueOrThrowArgs} args - Arguments to find a Tm_mode_degrade
     * @example
     * // Get one Tm_mode_degrade
     * const tm_mode_degrade = await prisma.tm_mode_degrade.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_mode_degradeFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_mode_degradeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_mode_degradeClient<$Result.GetResult<Prisma.$tm_mode_degradePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mode_degrade that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mode_degradeFindFirstArgs} args - Arguments to find a Tm_mode_degrade
     * @example
     * // Get one Tm_mode_degrade
     * const tm_mode_degrade = await prisma.tm_mode_degrade.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_mode_degradeFindFirstArgs>(args?: SelectSubset<T, tm_mode_degradeFindFirstArgs<ExtArgs>>): Prisma__tm_mode_degradeClient<$Result.GetResult<Prisma.$tm_mode_degradePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_mode_degrade that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mode_degradeFindFirstOrThrowArgs} args - Arguments to find a Tm_mode_degrade
     * @example
     * // Get one Tm_mode_degrade
     * const tm_mode_degrade = await prisma.tm_mode_degrade.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_mode_degradeFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_mode_degradeFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_mode_degradeClient<$Result.GetResult<Prisma.$tm_mode_degradePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_mode_degrades that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mode_degradeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_mode_degrades
     * const tm_mode_degrades = await prisma.tm_mode_degrade.findMany()
     * 
     * // Get first 10 Tm_mode_degrades
     * const tm_mode_degrades = await prisma.tm_mode_degrade.findMany({ take: 10 })
     * 
     * // Only select the `Id_Mode_Degrade`
     * const tm_mode_degradeWithId_Mode_DegradeOnly = await prisma.tm_mode_degrade.findMany({ select: { Id_Mode_Degrade: true } })
     * 
     */
    findMany<T extends tm_mode_degradeFindManyArgs>(args?: SelectSubset<T, tm_mode_degradeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_mode_degradePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_mode_degrade.
     * @param {tm_mode_degradeCreateArgs} args - Arguments to create a Tm_mode_degrade.
     * @example
     * // Create one Tm_mode_degrade
     * const Tm_mode_degrade = await prisma.tm_mode_degrade.create({
     *   data: {
     *     // ... data to create a Tm_mode_degrade
     *   }
     * })
     * 
     */
    create<T extends tm_mode_degradeCreateArgs>(args: SelectSubset<T, tm_mode_degradeCreateArgs<ExtArgs>>): Prisma__tm_mode_degradeClient<$Result.GetResult<Prisma.$tm_mode_degradePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_mode_degrades.
     * @param {tm_mode_degradeCreateManyArgs} args - Arguments to create many Tm_mode_degrades.
     * @example
     * // Create many Tm_mode_degrades
     * const tm_mode_degrade = await prisma.tm_mode_degrade.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_mode_degradeCreateManyArgs>(args?: SelectSubset<T, tm_mode_degradeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_mode_degrade.
     * @param {tm_mode_degradeDeleteArgs} args - Arguments to delete one Tm_mode_degrade.
     * @example
     * // Delete one Tm_mode_degrade
     * const Tm_mode_degrade = await prisma.tm_mode_degrade.delete({
     *   where: {
     *     // ... filter to delete one Tm_mode_degrade
     *   }
     * })
     * 
     */
    delete<T extends tm_mode_degradeDeleteArgs>(args: SelectSubset<T, tm_mode_degradeDeleteArgs<ExtArgs>>): Prisma__tm_mode_degradeClient<$Result.GetResult<Prisma.$tm_mode_degradePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_mode_degrade.
     * @param {tm_mode_degradeUpdateArgs} args - Arguments to update one Tm_mode_degrade.
     * @example
     * // Update one Tm_mode_degrade
     * const tm_mode_degrade = await prisma.tm_mode_degrade.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_mode_degradeUpdateArgs>(args: SelectSubset<T, tm_mode_degradeUpdateArgs<ExtArgs>>): Prisma__tm_mode_degradeClient<$Result.GetResult<Prisma.$tm_mode_degradePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_mode_degrades.
     * @param {tm_mode_degradeDeleteManyArgs} args - Arguments to filter Tm_mode_degrades to delete.
     * @example
     * // Delete a few Tm_mode_degrades
     * const { count } = await prisma.tm_mode_degrade.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_mode_degradeDeleteManyArgs>(args?: SelectSubset<T, tm_mode_degradeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_mode_degrades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mode_degradeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_mode_degrades
     * const tm_mode_degrade = await prisma.tm_mode_degrade.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_mode_degradeUpdateManyArgs>(args: SelectSubset<T, tm_mode_degradeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_mode_degrade.
     * @param {tm_mode_degradeUpsertArgs} args - Arguments to update or create a Tm_mode_degrade.
     * @example
     * // Update or create a Tm_mode_degrade
     * const tm_mode_degrade = await prisma.tm_mode_degrade.upsert({
     *   create: {
     *     // ... data to create a Tm_mode_degrade
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_mode_degrade we want to update
     *   }
     * })
     */
    upsert<T extends tm_mode_degradeUpsertArgs>(args: SelectSubset<T, tm_mode_degradeUpsertArgs<ExtArgs>>): Prisma__tm_mode_degradeClient<$Result.GetResult<Prisma.$tm_mode_degradePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_mode_degrades.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mode_degradeCountArgs} args - Arguments to filter Tm_mode_degrades to count.
     * @example
     * // Count the number of Tm_mode_degrades
     * const count = await prisma.tm_mode_degrade.count({
     *   where: {
     *     // ... the filter for the Tm_mode_degrades we want to count
     *   }
     * })
    **/
    count<T extends tm_mode_degradeCountArgs>(
      args?: Subset<T, tm_mode_degradeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_mode_degradeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_mode_degrade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_mode_degradeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_mode_degradeAggregateArgs>(args: Subset<T, Tm_mode_degradeAggregateArgs>): Prisma.PrismaPromise<GetTm_mode_degradeAggregateType<T>>

    /**
     * Group by Tm_mode_degrade.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_mode_degradeGroupByArgs} args - Group by arguments.
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
      T extends tm_mode_degradeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_mode_degradeGroupByArgs['orderBy'] }
        : { orderBy?: tm_mode_degradeGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_mode_degradeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_mode_degradeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_mode_degrade model
   */
  readonly fields: tm_mode_degradeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_mode_degrade.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_mode_degradeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_mode_degrade model
   */
  interface tm_mode_degradeFieldRefs {
    readonly Id_Mode_Degrade: FieldRef<"tm_mode_degrade", 'Int'>
    readonly Id_Utilisateur: FieldRef<"tm_mode_degrade", 'Int'>
    readonly Date_Heure_Creation: FieldRef<"tm_mode_degrade", 'DateTime'>
    readonly Requete_SQL: FieldRef<"tm_mode_degrade", 'String'>
    readonly Est_Archivee: FieldRef<"tm_mode_degrade", 'Boolean'>
    readonly Date_Heure_Archive: FieldRef<"tm_mode_degrade", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tm_mode_degrade findUnique
   */
  export type tm_mode_degradeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
    /**
     * Filter, which tm_mode_degrade to fetch.
     */
    where: tm_mode_degradeWhereUniqueInput
  }

  /**
   * tm_mode_degrade findUniqueOrThrow
   */
  export type tm_mode_degradeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
    /**
     * Filter, which tm_mode_degrade to fetch.
     */
    where: tm_mode_degradeWhereUniqueInput
  }

  /**
   * tm_mode_degrade findFirst
   */
  export type tm_mode_degradeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
    /**
     * Filter, which tm_mode_degrade to fetch.
     */
    where?: tm_mode_degradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mode_degrades to fetch.
     */
    orderBy?: tm_mode_degradeOrderByWithRelationInput | tm_mode_degradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mode_degrades.
     */
    cursor?: tm_mode_degradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mode_degrades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mode_degrades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mode_degrades.
     */
    distinct?: Tm_mode_degradeScalarFieldEnum | Tm_mode_degradeScalarFieldEnum[]
  }

  /**
   * tm_mode_degrade findFirstOrThrow
   */
  export type tm_mode_degradeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
    /**
     * Filter, which tm_mode_degrade to fetch.
     */
    where?: tm_mode_degradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mode_degrades to fetch.
     */
    orderBy?: tm_mode_degradeOrderByWithRelationInput | tm_mode_degradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_mode_degrades.
     */
    cursor?: tm_mode_degradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mode_degrades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mode_degrades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mode_degrades.
     */
    distinct?: Tm_mode_degradeScalarFieldEnum | Tm_mode_degradeScalarFieldEnum[]
  }

  /**
   * tm_mode_degrade findMany
   */
  export type tm_mode_degradeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
    /**
     * Filter, which tm_mode_degrades to fetch.
     */
    where?: tm_mode_degradeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_mode_degrades to fetch.
     */
    orderBy?: tm_mode_degradeOrderByWithRelationInput | tm_mode_degradeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_mode_degrades.
     */
    cursor?: tm_mode_degradeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_mode_degrades from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_mode_degrades.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_mode_degrades.
     */
    distinct?: Tm_mode_degradeScalarFieldEnum | Tm_mode_degradeScalarFieldEnum[]
  }

  /**
   * tm_mode_degrade create
   */
  export type tm_mode_degradeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_mode_degrade.
     */
    data?: XOR<tm_mode_degradeCreateInput, tm_mode_degradeUncheckedCreateInput>
  }

  /**
   * tm_mode_degrade createMany
   */
  export type tm_mode_degradeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_mode_degrades.
     */
    data: tm_mode_degradeCreateManyInput | tm_mode_degradeCreateManyInput[]
  }

  /**
   * tm_mode_degrade update
   */
  export type tm_mode_degradeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_mode_degrade.
     */
    data: XOR<tm_mode_degradeUpdateInput, tm_mode_degradeUncheckedUpdateInput>
    /**
     * Choose, which tm_mode_degrade to update.
     */
    where: tm_mode_degradeWhereUniqueInput
  }

  /**
   * tm_mode_degrade updateMany
   */
  export type tm_mode_degradeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_mode_degrades.
     */
    data: XOR<tm_mode_degradeUpdateManyMutationInput, tm_mode_degradeUncheckedUpdateManyInput>
    /**
     * Filter which tm_mode_degrades to update
     */
    where?: tm_mode_degradeWhereInput
    /**
     * Limit how many tm_mode_degrades to update.
     */
    limit?: number
  }

  /**
   * tm_mode_degrade upsert
   */
  export type tm_mode_degradeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_mode_degrade to update in case it exists.
     */
    where: tm_mode_degradeWhereUniqueInput
    /**
     * In case the tm_mode_degrade found by the `where` argument doesn't exist, create a new tm_mode_degrade with this data.
     */
    create: XOR<tm_mode_degradeCreateInput, tm_mode_degradeUncheckedCreateInput>
    /**
     * In case the tm_mode_degrade was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_mode_degradeUpdateInput, tm_mode_degradeUncheckedUpdateInput>
  }

  /**
   * tm_mode_degrade delete
   */
  export type tm_mode_degradeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
    /**
     * Filter which tm_mode_degrade to delete.
     */
    where: tm_mode_degradeWhereUniqueInput
  }

  /**
   * tm_mode_degrade deleteMany
   */
  export type tm_mode_degradeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_mode_degrades to delete
     */
    where?: tm_mode_degradeWhereInput
    /**
     * Limit how many tm_mode_degrades to delete.
     */
    limit?: number
  }

  /**
   * tm_mode_degrade without action
   */
  export type tm_mode_degradeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_mode_degrade
     */
    select?: tm_mode_degradeSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_mode_degrade
     */
    omit?: tm_mode_degradeOmit<ExtArgs> | null
  }


  /**
   * Model tm_parametre
   */

  export type AggregateTm_parametre = {
    _count: Tm_parametreCountAggregateOutputType | null
    _avg: Tm_parametreAvgAggregateOutputType | null
    _sum: Tm_parametreSumAggregateOutputType | null
    _min: Tm_parametreMinAggregateOutputType | null
    _max: Tm_parametreMaxAggregateOutputType | null
  }

  export type Tm_parametreAvgAggregateOutputType = {
    Id_Parametre: number | null
  }

  export type Tm_parametreSumAggregateOutputType = {
    Id_Parametre: number | null
  }

  export type Tm_parametreMinAggregateOutputType = {
    Id_Parametre: number | null
    Cle_Parametre: string | null
    Valeur_Parametre: string | null
    Groupe_Parametre: string | null
    Commentaire_Parametre: string | null
  }

  export type Tm_parametreMaxAggregateOutputType = {
    Id_Parametre: number | null
    Cle_Parametre: string | null
    Valeur_Parametre: string | null
    Groupe_Parametre: string | null
    Commentaire_Parametre: string | null
  }

  export type Tm_parametreCountAggregateOutputType = {
    Id_Parametre: number
    Cle_Parametre: number
    Valeur_Parametre: number
    Groupe_Parametre: number
    Commentaire_Parametre: number
    _all: number
  }


  export type Tm_parametreAvgAggregateInputType = {
    Id_Parametre?: true
  }

  export type Tm_parametreSumAggregateInputType = {
    Id_Parametre?: true
  }

  export type Tm_parametreMinAggregateInputType = {
    Id_Parametre?: true
    Cle_Parametre?: true
    Valeur_Parametre?: true
    Groupe_Parametre?: true
    Commentaire_Parametre?: true
  }

  export type Tm_parametreMaxAggregateInputType = {
    Id_Parametre?: true
    Cle_Parametre?: true
    Valeur_Parametre?: true
    Groupe_Parametre?: true
    Commentaire_Parametre?: true
  }

  export type Tm_parametreCountAggregateInputType = {
    Id_Parametre?: true
    Cle_Parametre?: true
    Valeur_Parametre?: true
    Groupe_Parametre?: true
    Commentaire_Parametre?: true
    _all?: true
  }

  export type Tm_parametreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_parametre to aggregate.
     */
    where?: tm_parametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_parametres to fetch.
     */
    orderBy?: tm_parametreOrderByWithRelationInput | tm_parametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_parametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_parametres
    **/
    _count?: true | Tm_parametreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_parametreAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_parametreSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_parametreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_parametreMaxAggregateInputType
  }

  export type GetTm_parametreAggregateType<T extends Tm_parametreAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_parametre]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_parametre[P]>
      : GetScalarType<T[P], AggregateTm_parametre[P]>
  }




  export type tm_parametreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_parametreWhereInput
    orderBy?: tm_parametreOrderByWithAggregationInput | tm_parametreOrderByWithAggregationInput[]
    by: Tm_parametreScalarFieldEnum[] | Tm_parametreScalarFieldEnum
    having?: tm_parametreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_parametreCountAggregateInputType | true
    _avg?: Tm_parametreAvgAggregateInputType
    _sum?: Tm_parametreSumAggregateInputType
    _min?: Tm_parametreMinAggregateInputType
    _max?: Tm_parametreMaxAggregateInputType
  }

  export type Tm_parametreGroupByOutputType = {
    Id_Parametre: number
    Cle_Parametre: string
    Valeur_Parametre: string | null
    Groupe_Parametre: string | null
    Commentaire_Parametre: string | null
    _count: Tm_parametreCountAggregateOutputType | null
    _avg: Tm_parametreAvgAggregateOutputType | null
    _sum: Tm_parametreSumAggregateOutputType | null
    _min: Tm_parametreMinAggregateOutputType | null
    _max: Tm_parametreMaxAggregateOutputType | null
  }

  type GetTm_parametreGroupByPayload<T extends tm_parametreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_parametreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_parametreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_parametreGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_parametreGroupByOutputType[P]>
        }
      >
    >


  export type tm_parametreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Parametre?: boolean
    Cle_Parametre?: boolean
    Valeur_Parametre?: boolean
    Groupe_Parametre?: boolean
    Commentaire_Parametre?: boolean
  }, ExtArgs["result"]["tm_parametre"]>



  export type tm_parametreSelectScalar = {
    Id_Parametre?: boolean
    Cle_Parametre?: boolean
    Valeur_Parametre?: boolean
    Groupe_Parametre?: boolean
    Commentaire_Parametre?: boolean
  }

  export type tm_parametreOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Parametre" | "Cle_Parametre" | "Valeur_Parametre" | "Groupe_Parametre" | "Commentaire_Parametre", ExtArgs["result"]["tm_parametre"]>

  export type $tm_parametrePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_parametre"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Parametre: number
      Cle_Parametre: string
      Valeur_Parametre: string | null
      Groupe_Parametre: string | null
      Commentaire_Parametre: string | null
    }, ExtArgs["result"]["tm_parametre"]>
    composites: {}
  }

  type tm_parametreGetPayload<S extends boolean | null | undefined | tm_parametreDefaultArgs> = $Result.GetResult<Prisma.$tm_parametrePayload, S>

  type tm_parametreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_parametreFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_parametreCountAggregateInputType | true
    }

  export interface tm_parametreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_parametre'], meta: { name: 'tm_parametre' } }
    /**
     * Find zero or one Tm_parametre that matches the filter.
     * @param {tm_parametreFindUniqueArgs} args - Arguments to find a Tm_parametre
     * @example
     * // Get one Tm_parametre
     * const tm_parametre = await prisma.tm_parametre.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_parametreFindUniqueArgs>(args: SelectSubset<T, tm_parametreFindUniqueArgs<ExtArgs>>): Prisma__tm_parametreClient<$Result.GetResult<Prisma.$tm_parametrePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_parametre that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_parametreFindUniqueOrThrowArgs} args - Arguments to find a Tm_parametre
     * @example
     * // Get one Tm_parametre
     * const tm_parametre = await prisma.tm_parametre.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_parametreFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_parametreFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_parametreClient<$Result.GetResult<Prisma.$tm_parametrePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_parametre that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_parametreFindFirstArgs} args - Arguments to find a Tm_parametre
     * @example
     * // Get one Tm_parametre
     * const tm_parametre = await prisma.tm_parametre.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_parametreFindFirstArgs>(args?: SelectSubset<T, tm_parametreFindFirstArgs<ExtArgs>>): Prisma__tm_parametreClient<$Result.GetResult<Prisma.$tm_parametrePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_parametre that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_parametreFindFirstOrThrowArgs} args - Arguments to find a Tm_parametre
     * @example
     * // Get one Tm_parametre
     * const tm_parametre = await prisma.tm_parametre.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_parametreFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_parametreFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_parametreClient<$Result.GetResult<Prisma.$tm_parametrePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_parametres that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_parametreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_parametres
     * const tm_parametres = await prisma.tm_parametre.findMany()
     * 
     * // Get first 10 Tm_parametres
     * const tm_parametres = await prisma.tm_parametre.findMany({ take: 10 })
     * 
     * // Only select the `Id_Parametre`
     * const tm_parametreWithId_ParametreOnly = await prisma.tm_parametre.findMany({ select: { Id_Parametre: true } })
     * 
     */
    findMany<T extends tm_parametreFindManyArgs>(args?: SelectSubset<T, tm_parametreFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_parametrePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_parametre.
     * @param {tm_parametreCreateArgs} args - Arguments to create a Tm_parametre.
     * @example
     * // Create one Tm_parametre
     * const Tm_parametre = await prisma.tm_parametre.create({
     *   data: {
     *     // ... data to create a Tm_parametre
     *   }
     * })
     * 
     */
    create<T extends tm_parametreCreateArgs>(args: SelectSubset<T, tm_parametreCreateArgs<ExtArgs>>): Prisma__tm_parametreClient<$Result.GetResult<Prisma.$tm_parametrePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_parametres.
     * @param {tm_parametreCreateManyArgs} args - Arguments to create many Tm_parametres.
     * @example
     * // Create many Tm_parametres
     * const tm_parametre = await prisma.tm_parametre.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_parametreCreateManyArgs>(args?: SelectSubset<T, tm_parametreCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_parametre.
     * @param {tm_parametreDeleteArgs} args - Arguments to delete one Tm_parametre.
     * @example
     * // Delete one Tm_parametre
     * const Tm_parametre = await prisma.tm_parametre.delete({
     *   where: {
     *     // ... filter to delete one Tm_parametre
     *   }
     * })
     * 
     */
    delete<T extends tm_parametreDeleteArgs>(args: SelectSubset<T, tm_parametreDeleteArgs<ExtArgs>>): Prisma__tm_parametreClient<$Result.GetResult<Prisma.$tm_parametrePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_parametre.
     * @param {tm_parametreUpdateArgs} args - Arguments to update one Tm_parametre.
     * @example
     * // Update one Tm_parametre
     * const tm_parametre = await prisma.tm_parametre.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_parametreUpdateArgs>(args: SelectSubset<T, tm_parametreUpdateArgs<ExtArgs>>): Prisma__tm_parametreClient<$Result.GetResult<Prisma.$tm_parametrePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_parametres.
     * @param {tm_parametreDeleteManyArgs} args - Arguments to filter Tm_parametres to delete.
     * @example
     * // Delete a few Tm_parametres
     * const { count } = await prisma.tm_parametre.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_parametreDeleteManyArgs>(args?: SelectSubset<T, tm_parametreDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_parametres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_parametreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_parametres
     * const tm_parametre = await prisma.tm_parametre.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_parametreUpdateManyArgs>(args: SelectSubset<T, tm_parametreUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_parametre.
     * @param {tm_parametreUpsertArgs} args - Arguments to update or create a Tm_parametre.
     * @example
     * // Update or create a Tm_parametre
     * const tm_parametre = await prisma.tm_parametre.upsert({
     *   create: {
     *     // ... data to create a Tm_parametre
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_parametre we want to update
     *   }
     * })
     */
    upsert<T extends tm_parametreUpsertArgs>(args: SelectSubset<T, tm_parametreUpsertArgs<ExtArgs>>): Prisma__tm_parametreClient<$Result.GetResult<Prisma.$tm_parametrePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_parametres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_parametreCountArgs} args - Arguments to filter Tm_parametres to count.
     * @example
     * // Count the number of Tm_parametres
     * const count = await prisma.tm_parametre.count({
     *   where: {
     *     // ... the filter for the Tm_parametres we want to count
     *   }
     * })
    **/
    count<T extends tm_parametreCountArgs>(
      args?: Subset<T, tm_parametreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_parametreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_parametre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_parametreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_parametreAggregateArgs>(args: Subset<T, Tm_parametreAggregateArgs>): Prisma.PrismaPromise<GetTm_parametreAggregateType<T>>

    /**
     * Group by Tm_parametre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_parametreGroupByArgs} args - Group by arguments.
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
      T extends tm_parametreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_parametreGroupByArgs['orderBy'] }
        : { orderBy?: tm_parametreGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_parametreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_parametreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_parametre model
   */
  readonly fields: tm_parametreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_parametre.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_parametreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_parametre model
   */
  interface tm_parametreFieldRefs {
    readonly Id_Parametre: FieldRef<"tm_parametre", 'Int'>
    readonly Cle_Parametre: FieldRef<"tm_parametre", 'String'>
    readonly Valeur_Parametre: FieldRef<"tm_parametre", 'String'>
    readonly Groupe_Parametre: FieldRef<"tm_parametre", 'String'>
    readonly Commentaire_Parametre: FieldRef<"tm_parametre", 'String'>
  }
    

  // Custom InputTypes
  /**
   * tm_parametre findUnique
   */
  export type tm_parametreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
    /**
     * Filter, which tm_parametre to fetch.
     */
    where: tm_parametreWhereUniqueInput
  }

  /**
   * tm_parametre findUniqueOrThrow
   */
  export type tm_parametreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
    /**
     * Filter, which tm_parametre to fetch.
     */
    where: tm_parametreWhereUniqueInput
  }

  /**
   * tm_parametre findFirst
   */
  export type tm_parametreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
    /**
     * Filter, which tm_parametre to fetch.
     */
    where?: tm_parametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_parametres to fetch.
     */
    orderBy?: tm_parametreOrderByWithRelationInput | tm_parametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_parametres.
     */
    cursor?: tm_parametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_parametres.
     */
    distinct?: Tm_parametreScalarFieldEnum | Tm_parametreScalarFieldEnum[]
  }

  /**
   * tm_parametre findFirstOrThrow
   */
  export type tm_parametreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
    /**
     * Filter, which tm_parametre to fetch.
     */
    where?: tm_parametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_parametres to fetch.
     */
    orderBy?: tm_parametreOrderByWithRelationInput | tm_parametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_parametres.
     */
    cursor?: tm_parametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_parametres.
     */
    distinct?: Tm_parametreScalarFieldEnum | Tm_parametreScalarFieldEnum[]
  }

  /**
   * tm_parametre findMany
   */
  export type tm_parametreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
    /**
     * Filter, which tm_parametres to fetch.
     */
    where?: tm_parametreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_parametres to fetch.
     */
    orderBy?: tm_parametreOrderByWithRelationInput | tm_parametreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_parametres.
     */
    cursor?: tm_parametreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_parametres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_parametres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_parametres.
     */
    distinct?: Tm_parametreScalarFieldEnum | Tm_parametreScalarFieldEnum[]
  }

  /**
   * tm_parametre create
   */
  export type tm_parametreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_parametre.
     */
    data?: XOR<tm_parametreCreateInput, tm_parametreUncheckedCreateInput>
  }

  /**
   * tm_parametre createMany
   */
  export type tm_parametreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_parametres.
     */
    data: tm_parametreCreateManyInput | tm_parametreCreateManyInput[]
  }

  /**
   * tm_parametre update
   */
  export type tm_parametreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_parametre.
     */
    data: XOR<tm_parametreUpdateInput, tm_parametreUncheckedUpdateInput>
    /**
     * Choose, which tm_parametre to update.
     */
    where: tm_parametreWhereUniqueInput
  }

  /**
   * tm_parametre updateMany
   */
  export type tm_parametreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_parametres.
     */
    data: XOR<tm_parametreUpdateManyMutationInput, tm_parametreUncheckedUpdateManyInput>
    /**
     * Filter which tm_parametres to update
     */
    where?: tm_parametreWhereInput
    /**
     * Limit how many tm_parametres to update.
     */
    limit?: number
  }

  /**
   * tm_parametre upsert
   */
  export type tm_parametreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_parametre to update in case it exists.
     */
    where: tm_parametreWhereUniqueInput
    /**
     * In case the tm_parametre found by the `where` argument doesn't exist, create a new tm_parametre with this data.
     */
    create: XOR<tm_parametreCreateInput, tm_parametreUncheckedCreateInput>
    /**
     * In case the tm_parametre was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_parametreUpdateInput, tm_parametreUncheckedUpdateInput>
  }

  /**
   * tm_parametre delete
   */
  export type tm_parametreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
    /**
     * Filter which tm_parametre to delete.
     */
    where: tm_parametreWhereUniqueInput
  }

  /**
   * tm_parametre deleteMany
   */
  export type tm_parametreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_parametres to delete
     */
    where?: tm_parametreWhereInput
    /**
     * Limit how many tm_parametres to delete.
     */
    limit?: number
  }

  /**
   * tm_parametre without action
   */
  export type tm_parametreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_parametre
     */
    select?: tm_parametreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_parametre
     */
    omit?: tm_parametreOmit<ExtArgs> | null
  }


  /**
   * Model tm_vigilog_mesure
   */

  export type AggregateTm_vigilog_mesure = {
    _count: Tm_vigilog_mesureCountAggregateOutputType | null
    _avg: Tm_vigilog_mesureAvgAggregateOutputType | null
    _sum: Tm_vigilog_mesureSumAggregateOutputType | null
    _min: Tm_vigilog_mesureMinAggregateOutputType | null
    _max: Tm_vigilog_mesureMaxAggregateOutputType | null
  }

  export type Tm_vigilog_mesureAvgAggregateOutputType = {
    Id_VigiLog_Mesure: number | null
    Id_VigiLog_Tournee: number | null
    Numero_Ordre: number | null
    Valeur: Decimal | null
  }

  export type Tm_vigilog_mesureSumAggregateOutputType = {
    Id_VigiLog_Mesure: number | null
    Id_VigiLog_Tournee: number | null
    Numero_Ordre: number | null
    Valeur: Decimal | null
  }

  export type Tm_vigilog_mesureMinAggregateOutputType = {
    Id_VigiLog_Mesure: number | null
    Id_VigiLog_Tournee: number | null
    Numero_Ordre: number | null
    Date_Heure_Mesure: Date | null
    Valeur: Decimal | null
    Est_Hors_Limites: boolean | null
    Est_En_Alarme: boolean | null
    Est_Marqueur: boolean | null
    Details: string | null
    Date_Heure_Import: Date | null
  }

  export type Tm_vigilog_mesureMaxAggregateOutputType = {
    Id_VigiLog_Mesure: number | null
    Id_VigiLog_Tournee: number | null
    Numero_Ordre: number | null
    Date_Heure_Mesure: Date | null
    Valeur: Decimal | null
    Est_Hors_Limites: boolean | null
    Est_En_Alarme: boolean | null
    Est_Marqueur: boolean | null
    Details: string | null
    Date_Heure_Import: Date | null
  }

  export type Tm_vigilog_mesureCountAggregateOutputType = {
    Id_VigiLog_Mesure: number
    Id_VigiLog_Tournee: number
    Numero_Ordre: number
    Date_Heure_Mesure: number
    Valeur: number
    Est_Hors_Limites: number
    Est_En_Alarme: number
    Est_Marqueur: number
    Details: number
    Date_Heure_Import: number
    _all: number
  }


  export type Tm_vigilog_mesureAvgAggregateInputType = {
    Id_VigiLog_Mesure?: true
    Id_VigiLog_Tournee?: true
    Numero_Ordre?: true
    Valeur?: true
  }

  export type Tm_vigilog_mesureSumAggregateInputType = {
    Id_VigiLog_Mesure?: true
    Id_VigiLog_Tournee?: true
    Numero_Ordre?: true
    Valeur?: true
  }

  export type Tm_vigilog_mesureMinAggregateInputType = {
    Id_VigiLog_Mesure?: true
    Id_VigiLog_Tournee?: true
    Numero_Ordre?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Est_Hors_Limites?: true
    Est_En_Alarme?: true
    Est_Marqueur?: true
    Details?: true
    Date_Heure_Import?: true
  }

  export type Tm_vigilog_mesureMaxAggregateInputType = {
    Id_VigiLog_Mesure?: true
    Id_VigiLog_Tournee?: true
    Numero_Ordre?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Est_Hors_Limites?: true
    Est_En_Alarme?: true
    Est_Marqueur?: true
    Details?: true
    Date_Heure_Import?: true
  }

  export type Tm_vigilog_mesureCountAggregateInputType = {
    Id_VigiLog_Mesure?: true
    Id_VigiLog_Tournee?: true
    Numero_Ordre?: true
    Date_Heure_Mesure?: true
    Valeur?: true
    Est_Hors_Limites?: true
    Est_En_Alarme?: true
    Est_Marqueur?: true
    Details?: true
    Date_Heure_Import?: true
    _all?: true
  }

  export type Tm_vigilog_mesureAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_vigilog_mesure to aggregate.
     */
    where?: tm_vigilog_mesureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_vigilog_mesures to fetch.
     */
    orderBy?: tm_vigilog_mesureOrderByWithRelationInput | tm_vigilog_mesureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_vigilog_mesureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_vigilog_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_vigilog_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_vigilog_mesures
    **/
    _count?: true | Tm_vigilog_mesureCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_vigilog_mesureAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_vigilog_mesureSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_vigilog_mesureMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_vigilog_mesureMaxAggregateInputType
  }

  export type GetTm_vigilog_mesureAggregateType<T extends Tm_vigilog_mesureAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_vigilog_mesure]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_vigilog_mesure[P]>
      : GetScalarType<T[P], AggregateTm_vigilog_mesure[P]>
  }




  export type tm_vigilog_mesureGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_vigilog_mesureWhereInput
    orderBy?: tm_vigilog_mesureOrderByWithAggregationInput | tm_vigilog_mesureOrderByWithAggregationInput[]
    by: Tm_vigilog_mesureScalarFieldEnum[] | Tm_vigilog_mesureScalarFieldEnum
    having?: tm_vigilog_mesureScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_vigilog_mesureCountAggregateInputType | true
    _avg?: Tm_vigilog_mesureAvgAggregateInputType
    _sum?: Tm_vigilog_mesureSumAggregateInputType
    _min?: Tm_vigilog_mesureMinAggregateInputType
    _max?: Tm_vigilog_mesureMaxAggregateInputType
  }

  export type Tm_vigilog_mesureGroupByOutputType = {
    Id_VigiLog_Mesure: number
    Id_VigiLog_Tournee: number
    Numero_Ordre: number | null
    Date_Heure_Mesure: Date
    Valeur: Decimal | null
    Est_Hors_Limites: boolean
    Est_En_Alarme: boolean
    Est_Marqueur: boolean
    Details: string | null
    Date_Heure_Import: Date
    _count: Tm_vigilog_mesureCountAggregateOutputType | null
    _avg: Tm_vigilog_mesureAvgAggregateOutputType | null
    _sum: Tm_vigilog_mesureSumAggregateOutputType | null
    _min: Tm_vigilog_mesureMinAggregateOutputType | null
    _max: Tm_vigilog_mesureMaxAggregateOutputType | null
  }

  type GetTm_vigilog_mesureGroupByPayload<T extends tm_vigilog_mesureGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_vigilog_mesureGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_vigilog_mesureGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_vigilog_mesureGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_vigilog_mesureGroupByOutputType[P]>
        }
      >
    >


  export type tm_vigilog_mesureSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_VigiLog_Mesure?: boolean
    Id_VigiLog_Tournee?: boolean
    Numero_Ordre?: boolean
    Date_Heure_Mesure?: boolean
    Valeur?: boolean
    Est_Hors_Limites?: boolean
    Est_En_Alarme?: boolean
    Est_Marqueur?: boolean
    Details?: boolean
    Date_Heure_Import?: boolean
  }, ExtArgs["result"]["tm_vigilog_mesure"]>



  export type tm_vigilog_mesureSelectScalar = {
    Id_VigiLog_Mesure?: boolean
    Id_VigiLog_Tournee?: boolean
    Numero_Ordre?: boolean
    Date_Heure_Mesure?: boolean
    Valeur?: boolean
    Est_Hors_Limites?: boolean
    Est_En_Alarme?: boolean
    Est_Marqueur?: boolean
    Details?: boolean
    Date_Heure_Import?: boolean
  }

  export type tm_vigilog_mesureOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_VigiLog_Mesure" | "Id_VigiLog_Tournee" | "Numero_Ordre" | "Date_Heure_Mesure" | "Valeur" | "Est_Hors_Limites" | "Est_En_Alarme" | "Est_Marqueur" | "Details" | "Date_Heure_Import", ExtArgs["result"]["tm_vigilog_mesure"]>

  export type $tm_vigilog_mesurePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_vigilog_mesure"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_VigiLog_Mesure: number
      Id_VigiLog_Tournee: number
      Numero_Ordre: number | null
      Date_Heure_Mesure: Date
      Valeur: Prisma.Decimal | null
      Est_Hors_Limites: boolean
      Est_En_Alarme: boolean
      Est_Marqueur: boolean
      Details: string | null
      Date_Heure_Import: Date
    }, ExtArgs["result"]["tm_vigilog_mesure"]>
    composites: {}
  }

  type tm_vigilog_mesureGetPayload<S extends boolean | null | undefined | tm_vigilog_mesureDefaultArgs> = $Result.GetResult<Prisma.$tm_vigilog_mesurePayload, S>

  type tm_vigilog_mesureCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_vigilog_mesureFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_vigilog_mesureCountAggregateInputType | true
    }

  export interface tm_vigilog_mesureDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_vigilog_mesure'], meta: { name: 'tm_vigilog_mesure' } }
    /**
     * Find zero or one Tm_vigilog_mesure that matches the filter.
     * @param {tm_vigilog_mesureFindUniqueArgs} args - Arguments to find a Tm_vigilog_mesure
     * @example
     * // Get one Tm_vigilog_mesure
     * const tm_vigilog_mesure = await prisma.tm_vigilog_mesure.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_vigilog_mesureFindUniqueArgs>(args: SelectSubset<T, tm_vigilog_mesureFindUniqueArgs<ExtArgs>>): Prisma__tm_vigilog_mesureClient<$Result.GetResult<Prisma.$tm_vigilog_mesurePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_vigilog_mesure that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_vigilog_mesureFindUniqueOrThrowArgs} args - Arguments to find a Tm_vigilog_mesure
     * @example
     * // Get one Tm_vigilog_mesure
     * const tm_vigilog_mesure = await prisma.tm_vigilog_mesure.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_vigilog_mesureFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_vigilog_mesureFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_vigilog_mesureClient<$Result.GetResult<Prisma.$tm_vigilog_mesurePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_vigilog_mesure that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_vigilog_mesureFindFirstArgs} args - Arguments to find a Tm_vigilog_mesure
     * @example
     * // Get one Tm_vigilog_mesure
     * const tm_vigilog_mesure = await prisma.tm_vigilog_mesure.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_vigilog_mesureFindFirstArgs>(args?: SelectSubset<T, tm_vigilog_mesureFindFirstArgs<ExtArgs>>): Prisma__tm_vigilog_mesureClient<$Result.GetResult<Prisma.$tm_vigilog_mesurePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_vigilog_mesure that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_vigilog_mesureFindFirstOrThrowArgs} args - Arguments to find a Tm_vigilog_mesure
     * @example
     * // Get one Tm_vigilog_mesure
     * const tm_vigilog_mesure = await prisma.tm_vigilog_mesure.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_vigilog_mesureFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_vigilog_mesureFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_vigilog_mesureClient<$Result.GetResult<Prisma.$tm_vigilog_mesurePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_vigilog_mesures that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_vigilog_mesureFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_vigilog_mesures
     * const tm_vigilog_mesures = await prisma.tm_vigilog_mesure.findMany()
     * 
     * // Get first 10 Tm_vigilog_mesures
     * const tm_vigilog_mesures = await prisma.tm_vigilog_mesure.findMany({ take: 10 })
     * 
     * // Only select the `Id_VigiLog_Mesure`
     * const tm_vigilog_mesureWithId_VigiLog_MesureOnly = await prisma.tm_vigilog_mesure.findMany({ select: { Id_VigiLog_Mesure: true } })
     * 
     */
    findMany<T extends tm_vigilog_mesureFindManyArgs>(args?: SelectSubset<T, tm_vigilog_mesureFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_vigilog_mesurePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_vigilog_mesure.
     * @param {tm_vigilog_mesureCreateArgs} args - Arguments to create a Tm_vigilog_mesure.
     * @example
     * // Create one Tm_vigilog_mesure
     * const Tm_vigilog_mesure = await prisma.tm_vigilog_mesure.create({
     *   data: {
     *     // ... data to create a Tm_vigilog_mesure
     *   }
     * })
     * 
     */
    create<T extends tm_vigilog_mesureCreateArgs>(args: SelectSubset<T, tm_vigilog_mesureCreateArgs<ExtArgs>>): Prisma__tm_vigilog_mesureClient<$Result.GetResult<Prisma.$tm_vigilog_mesurePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_vigilog_mesures.
     * @param {tm_vigilog_mesureCreateManyArgs} args - Arguments to create many Tm_vigilog_mesures.
     * @example
     * // Create many Tm_vigilog_mesures
     * const tm_vigilog_mesure = await prisma.tm_vigilog_mesure.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_vigilog_mesureCreateManyArgs>(args?: SelectSubset<T, tm_vigilog_mesureCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_vigilog_mesure.
     * @param {tm_vigilog_mesureDeleteArgs} args - Arguments to delete one Tm_vigilog_mesure.
     * @example
     * // Delete one Tm_vigilog_mesure
     * const Tm_vigilog_mesure = await prisma.tm_vigilog_mesure.delete({
     *   where: {
     *     // ... filter to delete one Tm_vigilog_mesure
     *   }
     * })
     * 
     */
    delete<T extends tm_vigilog_mesureDeleteArgs>(args: SelectSubset<T, tm_vigilog_mesureDeleteArgs<ExtArgs>>): Prisma__tm_vigilog_mesureClient<$Result.GetResult<Prisma.$tm_vigilog_mesurePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_vigilog_mesure.
     * @param {tm_vigilog_mesureUpdateArgs} args - Arguments to update one Tm_vigilog_mesure.
     * @example
     * // Update one Tm_vigilog_mesure
     * const tm_vigilog_mesure = await prisma.tm_vigilog_mesure.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_vigilog_mesureUpdateArgs>(args: SelectSubset<T, tm_vigilog_mesureUpdateArgs<ExtArgs>>): Prisma__tm_vigilog_mesureClient<$Result.GetResult<Prisma.$tm_vigilog_mesurePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_vigilog_mesures.
     * @param {tm_vigilog_mesureDeleteManyArgs} args - Arguments to filter Tm_vigilog_mesures to delete.
     * @example
     * // Delete a few Tm_vigilog_mesures
     * const { count } = await prisma.tm_vigilog_mesure.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_vigilog_mesureDeleteManyArgs>(args?: SelectSubset<T, tm_vigilog_mesureDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_vigilog_mesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_vigilog_mesureUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_vigilog_mesures
     * const tm_vigilog_mesure = await prisma.tm_vigilog_mesure.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_vigilog_mesureUpdateManyArgs>(args: SelectSubset<T, tm_vigilog_mesureUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_vigilog_mesure.
     * @param {tm_vigilog_mesureUpsertArgs} args - Arguments to update or create a Tm_vigilog_mesure.
     * @example
     * // Update or create a Tm_vigilog_mesure
     * const tm_vigilog_mesure = await prisma.tm_vigilog_mesure.upsert({
     *   create: {
     *     // ... data to create a Tm_vigilog_mesure
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_vigilog_mesure we want to update
     *   }
     * })
     */
    upsert<T extends tm_vigilog_mesureUpsertArgs>(args: SelectSubset<T, tm_vigilog_mesureUpsertArgs<ExtArgs>>): Prisma__tm_vigilog_mesureClient<$Result.GetResult<Prisma.$tm_vigilog_mesurePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_vigilog_mesures.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_vigilog_mesureCountArgs} args - Arguments to filter Tm_vigilog_mesures to count.
     * @example
     * // Count the number of Tm_vigilog_mesures
     * const count = await prisma.tm_vigilog_mesure.count({
     *   where: {
     *     // ... the filter for the Tm_vigilog_mesures we want to count
     *   }
     * })
    **/
    count<T extends tm_vigilog_mesureCountArgs>(
      args?: Subset<T, tm_vigilog_mesureCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_vigilog_mesureCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_vigilog_mesure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_vigilog_mesureAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_vigilog_mesureAggregateArgs>(args: Subset<T, Tm_vigilog_mesureAggregateArgs>): Prisma.PrismaPromise<GetTm_vigilog_mesureAggregateType<T>>

    /**
     * Group by Tm_vigilog_mesure.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_vigilog_mesureGroupByArgs} args - Group by arguments.
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
      T extends tm_vigilog_mesureGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_vigilog_mesureGroupByArgs['orderBy'] }
        : { orderBy?: tm_vigilog_mesureGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_vigilog_mesureGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_vigilog_mesureGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_vigilog_mesure model
   */
  readonly fields: tm_vigilog_mesureFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_vigilog_mesure.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_vigilog_mesureClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_vigilog_mesure model
   */
  interface tm_vigilog_mesureFieldRefs {
    readonly Id_VigiLog_Mesure: FieldRef<"tm_vigilog_mesure", 'Int'>
    readonly Id_VigiLog_Tournee: FieldRef<"tm_vigilog_mesure", 'Int'>
    readonly Numero_Ordre: FieldRef<"tm_vigilog_mesure", 'Int'>
    readonly Date_Heure_Mesure: FieldRef<"tm_vigilog_mesure", 'DateTime'>
    readonly Valeur: FieldRef<"tm_vigilog_mesure", 'Decimal'>
    readonly Est_Hors_Limites: FieldRef<"tm_vigilog_mesure", 'Boolean'>
    readonly Est_En_Alarme: FieldRef<"tm_vigilog_mesure", 'Boolean'>
    readonly Est_Marqueur: FieldRef<"tm_vigilog_mesure", 'Boolean'>
    readonly Details: FieldRef<"tm_vigilog_mesure", 'String'>
    readonly Date_Heure_Import: FieldRef<"tm_vigilog_mesure", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tm_vigilog_mesure findUnique
   */
  export type tm_vigilog_mesureFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
    /**
     * Filter, which tm_vigilog_mesure to fetch.
     */
    where: tm_vigilog_mesureWhereUniqueInput
  }

  /**
   * tm_vigilog_mesure findUniqueOrThrow
   */
  export type tm_vigilog_mesureFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
    /**
     * Filter, which tm_vigilog_mesure to fetch.
     */
    where: tm_vigilog_mesureWhereUniqueInput
  }

  /**
   * tm_vigilog_mesure findFirst
   */
  export type tm_vigilog_mesureFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
    /**
     * Filter, which tm_vigilog_mesure to fetch.
     */
    where?: tm_vigilog_mesureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_vigilog_mesures to fetch.
     */
    orderBy?: tm_vigilog_mesureOrderByWithRelationInput | tm_vigilog_mesureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_vigilog_mesures.
     */
    cursor?: tm_vigilog_mesureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_vigilog_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_vigilog_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_vigilog_mesures.
     */
    distinct?: Tm_vigilog_mesureScalarFieldEnum | Tm_vigilog_mesureScalarFieldEnum[]
  }

  /**
   * tm_vigilog_mesure findFirstOrThrow
   */
  export type tm_vigilog_mesureFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
    /**
     * Filter, which tm_vigilog_mesure to fetch.
     */
    where?: tm_vigilog_mesureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_vigilog_mesures to fetch.
     */
    orderBy?: tm_vigilog_mesureOrderByWithRelationInput | tm_vigilog_mesureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_vigilog_mesures.
     */
    cursor?: tm_vigilog_mesureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_vigilog_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_vigilog_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_vigilog_mesures.
     */
    distinct?: Tm_vigilog_mesureScalarFieldEnum | Tm_vigilog_mesureScalarFieldEnum[]
  }

  /**
   * tm_vigilog_mesure findMany
   */
  export type tm_vigilog_mesureFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
    /**
     * Filter, which tm_vigilog_mesures to fetch.
     */
    where?: tm_vigilog_mesureWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_vigilog_mesures to fetch.
     */
    orderBy?: tm_vigilog_mesureOrderByWithRelationInput | tm_vigilog_mesureOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_vigilog_mesures.
     */
    cursor?: tm_vigilog_mesureWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_vigilog_mesures from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_vigilog_mesures.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_vigilog_mesures.
     */
    distinct?: Tm_vigilog_mesureScalarFieldEnum | Tm_vigilog_mesureScalarFieldEnum[]
  }

  /**
   * tm_vigilog_mesure create
   */
  export type tm_vigilog_mesureCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_vigilog_mesure.
     */
    data: XOR<tm_vigilog_mesureCreateInput, tm_vigilog_mesureUncheckedCreateInput>
  }

  /**
   * tm_vigilog_mesure createMany
   */
  export type tm_vigilog_mesureCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_vigilog_mesures.
     */
    data: tm_vigilog_mesureCreateManyInput | tm_vigilog_mesureCreateManyInput[]
  }

  /**
   * tm_vigilog_mesure update
   */
  export type tm_vigilog_mesureUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_vigilog_mesure.
     */
    data: XOR<tm_vigilog_mesureUpdateInput, tm_vigilog_mesureUncheckedUpdateInput>
    /**
     * Choose, which tm_vigilog_mesure to update.
     */
    where: tm_vigilog_mesureWhereUniqueInput
  }

  /**
   * tm_vigilog_mesure updateMany
   */
  export type tm_vigilog_mesureUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_vigilog_mesures.
     */
    data: XOR<tm_vigilog_mesureUpdateManyMutationInput, tm_vigilog_mesureUncheckedUpdateManyInput>
    /**
     * Filter which tm_vigilog_mesures to update
     */
    where?: tm_vigilog_mesureWhereInput
    /**
     * Limit how many tm_vigilog_mesures to update.
     */
    limit?: number
  }

  /**
   * tm_vigilog_mesure upsert
   */
  export type tm_vigilog_mesureUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_vigilog_mesure to update in case it exists.
     */
    where: tm_vigilog_mesureWhereUniqueInput
    /**
     * In case the tm_vigilog_mesure found by the `where` argument doesn't exist, create a new tm_vigilog_mesure with this data.
     */
    create: XOR<tm_vigilog_mesureCreateInput, tm_vigilog_mesureUncheckedCreateInput>
    /**
     * In case the tm_vigilog_mesure was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_vigilog_mesureUpdateInput, tm_vigilog_mesureUncheckedUpdateInput>
  }

  /**
   * tm_vigilog_mesure delete
   */
  export type tm_vigilog_mesureDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
    /**
     * Filter which tm_vigilog_mesure to delete.
     */
    where: tm_vigilog_mesureWhereUniqueInput
  }

  /**
   * tm_vigilog_mesure deleteMany
   */
  export type tm_vigilog_mesureDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_vigilog_mesures to delete
     */
    where?: tm_vigilog_mesureWhereInput
    /**
     * Limit how many tm_vigilog_mesures to delete.
     */
    limit?: number
  }

  /**
   * tm_vigilog_mesure without action
   */
  export type tm_vigilog_mesureDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_vigilog_mesure
     */
    select?: tm_vigilog_mesureSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_vigilog_mesure
     */
    omit?: tm_vigilog_mesureOmit<ExtArgs> | null
  }


  /**
   * Model tm_journal_commentaire_libre
   */

  export type AggregateTm_journal_commentaire_libre = {
    _count: Tm_journal_commentaire_libreCountAggregateOutputType | null
    _avg: Tm_journal_commentaire_libreAvgAggregateOutputType | null
    _sum: Tm_journal_commentaire_libreSumAggregateOutputType | null
    _min: Tm_journal_commentaire_libreMinAggregateOutputType | null
    _max: Tm_journal_commentaire_libreMaxAggregateOutputType | null
  }

  export type Tm_journal_commentaire_libreAvgAggregateOutputType = {
    Id_Commentaire_Journal: number | null
  }

  export type Tm_journal_commentaire_libreSumAggregateOutputType = {
    Id_Commentaire_Journal: number | null
  }

  export type Tm_journal_commentaire_libreMinAggregateOutputType = {
    Id_Commentaire_Journal: number | null
    Code_Journal: string | null
    Commentaire: string | null
    Date_Creation: Date | null
    Date_Modification: Date | null
  }

  export type Tm_journal_commentaire_libreMaxAggregateOutputType = {
    Id_Commentaire_Journal: number | null
    Code_Journal: string | null
    Commentaire: string | null
    Date_Creation: Date | null
    Date_Modification: Date | null
  }

  export type Tm_journal_commentaire_libreCountAggregateOutputType = {
    Id_Commentaire_Journal: number
    Code_Journal: number
    Commentaire: number
    Date_Creation: number
    Date_Modification: number
    _all: number
  }


  export type Tm_journal_commentaire_libreAvgAggregateInputType = {
    Id_Commentaire_Journal?: true
  }

  export type Tm_journal_commentaire_libreSumAggregateInputType = {
    Id_Commentaire_Journal?: true
  }

  export type Tm_journal_commentaire_libreMinAggregateInputType = {
    Id_Commentaire_Journal?: true
    Code_Journal?: true
    Commentaire?: true
    Date_Creation?: true
    Date_Modification?: true
  }

  export type Tm_journal_commentaire_libreMaxAggregateInputType = {
    Id_Commentaire_Journal?: true
    Code_Journal?: true
    Commentaire?: true
    Date_Creation?: true
    Date_Modification?: true
  }

  export type Tm_journal_commentaire_libreCountAggregateInputType = {
    Id_Commentaire_Journal?: true
    Code_Journal?: true
    Commentaire?: true
    Date_Creation?: true
    Date_Modification?: true
    _all?: true
  }

  export type Tm_journal_commentaire_libreAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_journal_commentaire_libre to aggregate.
     */
    where?: tm_journal_commentaire_libreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_commentaire_libres to fetch.
     */
    orderBy?: tm_journal_commentaire_libreOrderByWithRelationInput | tm_journal_commentaire_libreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: tm_journal_commentaire_libreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_commentaire_libres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_commentaire_libres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned tm_journal_commentaire_libres
    **/
    _count?: true | Tm_journal_commentaire_libreCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: Tm_journal_commentaire_libreAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: Tm_journal_commentaire_libreSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: Tm_journal_commentaire_libreMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: Tm_journal_commentaire_libreMaxAggregateInputType
  }

  export type GetTm_journal_commentaire_libreAggregateType<T extends Tm_journal_commentaire_libreAggregateArgs> = {
        [P in keyof T & keyof AggregateTm_journal_commentaire_libre]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTm_journal_commentaire_libre[P]>
      : GetScalarType<T[P], AggregateTm_journal_commentaire_libre[P]>
  }




  export type tm_journal_commentaire_libreGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: tm_journal_commentaire_libreWhereInput
    orderBy?: tm_journal_commentaire_libreOrderByWithAggregationInput | tm_journal_commentaire_libreOrderByWithAggregationInput[]
    by: Tm_journal_commentaire_libreScalarFieldEnum[] | Tm_journal_commentaire_libreScalarFieldEnum
    having?: tm_journal_commentaire_libreScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: Tm_journal_commentaire_libreCountAggregateInputType | true
    _avg?: Tm_journal_commentaire_libreAvgAggregateInputType
    _sum?: Tm_journal_commentaire_libreSumAggregateInputType
    _min?: Tm_journal_commentaire_libreMinAggregateInputType
    _max?: Tm_journal_commentaire_libreMaxAggregateInputType
  }

  export type Tm_journal_commentaire_libreGroupByOutputType = {
    Id_Commentaire_Journal: number
    Code_Journal: string
    Commentaire: string
    Date_Creation: Date
    Date_Modification: Date | null
    _count: Tm_journal_commentaire_libreCountAggregateOutputType | null
    _avg: Tm_journal_commentaire_libreAvgAggregateOutputType | null
    _sum: Tm_journal_commentaire_libreSumAggregateOutputType | null
    _min: Tm_journal_commentaire_libreMinAggregateOutputType | null
    _max: Tm_journal_commentaire_libreMaxAggregateOutputType | null
  }

  type GetTm_journal_commentaire_libreGroupByPayload<T extends tm_journal_commentaire_libreGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<Tm_journal_commentaire_libreGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof Tm_journal_commentaire_libreGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], Tm_journal_commentaire_libreGroupByOutputType[P]>
            : GetScalarType<T[P], Tm_journal_commentaire_libreGroupByOutputType[P]>
        }
      >
    >


  export type tm_journal_commentaire_libreSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    Id_Commentaire_Journal?: boolean
    Code_Journal?: boolean
    Commentaire?: boolean
    Date_Creation?: boolean
    Date_Modification?: boolean
  }, ExtArgs["result"]["tm_journal_commentaire_libre"]>



  export type tm_journal_commentaire_libreSelectScalar = {
    Id_Commentaire_Journal?: boolean
    Code_Journal?: boolean
    Commentaire?: boolean
    Date_Creation?: boolean
    Date_Modification?: boolean
  }

  export type tm_journal_commentaire_libreOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"Id_Commentaire_Journal" | "Code_Journal" | "Commentaire" | "Date_Creation" | "Date_Modification", ExtArgs["result"]["tm_journal_commentaire_libre"]>

  export type $tm_journal_commentaire_librePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "tm_journal_commentaire_libre"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      Id_Commentaire_Journal: number
      Code_Journal: string
      Commentaire: string
      Date_Creation: Date
      Date_Modification: Date | null
    }, ExtArgs["result"]["tm_journal_commentaire_libre"]>
    composites: {}
  }

  type tm_journal_commentaire_libreGetPayload<S extends boolean | null | undefined | tm_journal_commentaire_libreDefaultArgs> = $Result.GetResult<Prisma.$tm_journal_commentaire_librePayload, S>

  type tm_journal_commentaire_libreCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<tm_journal_commentaire_libreFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: Tm_journal_commentaire_libreCountAggregateInputType | true
    }

  export interface tm_journal_commentaire_libreDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['tm_journal_commentaire_libre'], meta: { name: 'tm_journal_commentaire_libre' } }
    /**
     * Find zero or one Tm_journal_commentaire_libre that matches the filter.
     * @param {tm_journal_commentaire_libreFindUniqueArgs} args - Arguments to find a Tm_journal_commentaire_libre
     * @example
     * // Get one Tm_journal_commentaire_libre
     * const tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends tm_journal_commentaire_libreFindUniqueArgs>(args: SelectSubset<T, tm_journal_commentaire_libreFindUniqueArgs<ExtArgs>>): Prisma__tm_journal_commentaire_libreClient<$Result.GetResult<Prisma.$tm_journal_commentaire_librePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Tm_journal_commentaire_libre that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {tm_journal_commentaire_libreFindUniqueOrThrowArgs} args - Arguments to find a Tm_journal_commentaire_libre
     * @example
     * // Get one Tm_journal_commentaire_libre
     * const tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends tm_journal_commentaire_libreFindUniqueOrThrowArgs>(args: SelectSubset<T, tm_journal_commentaire_libreFindUniqueOrThrowArgs<ExtArgs>>): Prisma__tm_journal_commentaire_libreClient<$Result.GetResult<Prisma.$tm_journal_commentaire_librePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_journal_commentaire_libre that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_commentaire_libreFindFirstArgs} args - Arguments to find a Tm_journal_commentaire_libre
     * @example
     * // Get one Tm_journal_commentaire_libre
     * const tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends tm_journal_commentaire_libreFindFirstArgs>(args?: SelectSubset<T, tm_journal_commentaire_libreFindFirstArgs<ExtArgs>>): Prisma__tm_journal_commentaire_libreClient<$Result.GetResult<Prisma.$tm_journal_commentaire_librePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Tm_journal_commentaire_libre that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_commentaire_libreFindFirstOrThrowArgs} args - Arguments to find a Tm_journal_commentaire_libre
     * @example
     * // Get one Tm_journal_commentaire_libre
     * const tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends tm_journal_commentaire_libreFindFirstOrThrowArgs>(args?: SelectSubset<T, tm_journal_commentaire_libreFindFirstOrThrowArgs<ExtArgs>>): Prisma__tm_journal_commentaire_libreClient<$Result.GetResult<Prisma.$tm_journal_commentaire_librePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Tm_journal_commentaire_libres that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_commentaire_libreFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tm_journal_commentaire_libres
     * const tm_journal_commentaire_libres = await prisma.tm_journal_commentaire_libre.findMany()
     * 
     * // Get first 10 Tm_journal_commentaire_libres
     * const tm_journal_commentaire_libres = await prisma.tm_journal_commentaire_libre.findMany({ take: 10 })
     * 
     * // Only select the `Id_Commentaire_Journal`
     * const tm_journal_commentaire_libreWithId_Commentaire_JournalOnly = await prisma.tm_journal_commentaire_libre.findMany({ select: { Id_Commentaire_Journal: true } })
     * 
     */
    findMany<T extends tm_journal_commentaire_libreFindManyArgs>(args?: SelectSubset<T, tm_journal_commentaire_libreFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$tm_journal_commentaire_librePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Tm_journal_commentaire_libre.
     * @param {tm_journal_commentaire_libreCreateArgs} args - Arguments to create a Tm_journal_commentaire_libre.
     * @example
     * // Create one Tm_journal_commentaire_libre
     * const Tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.create({
     *   data: {
     *     // ... data to create a Tm_journal_commentaire_libre
     *   }
     * })
     * 
     */
    create<T extends tm_journal_commentaire_libreCreateArgs>(args: SelectSubset<T, tm_journal_commentaire_libreCreateArgs<ExtArgs>>): Prisma__tm_journal_commentaire_libreClient<$Result.GetResult<Prisma.$tm_journal_commentaire_librePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Tm_journal_commentaire_libres.
     * @param {tm_journal_commentaire_libreCreateManyArgs} args - Arguments to create many Tm_journal_commentaire_libres.
     * @example
     * // Create many Tm_journal_commentaire_libres
     * const tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends tm_journal_commentaire_libreCreateManyArgs>(args?: SelectSubset<T, tm_journal_commentaire_libreCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a Tm_journal_commentaire_libre.
     * @param {tm_journal_commentaire_libreDeleteArgs} args - Arguments to delete one Tm_journal_commentaire_libre.
     * @example
     * // Delete one Tm_journal_commentaire_libre
     * const Tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.delete({
     *   where: {
     *     // ... filter to delete one Tm_journal_commentaire_libre
     *   }
     * })
     * 
     */
    delete<T extends tm_journal_commentaire_libreDeleteArgs>(args: SelectSubset<T, tm_journal_commentaire_libreDeleteArgs<ExtArgs>>): Prisma__tm_journal_commentaire_libreClient<$Result.GetResult<Prisma.$tm_journal_commentaire_librePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Tm_journal_commentaire_libre.
     * @param {tm_journal_commentaire_libreUpdateArgs} args - Arguments to update one Tm_journal_commentaire_libre.
     * @example
     * // Update one Tm_journal_commentaire_libre
     * const tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends tm_journal_commentaire_libreUpdateArgs>(args: SelectSubset<T, tm_journal_commentaire_libreUpdateArgs<ExtArgs>>): Prisma__tm_journal_commentaire_libreClient<$Result.GetResult<Prisma.$tm_journal_commentaire_librePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Tm_journal_commentaire_libres.
     * @param {tm_journal_commentaire_libreDeleteManyArgs} args - Arguments to filter Tm_journal_commentaire_libres to delete.
     * @example
     * // Delete a few Tm_journal_commentaire_libres
     * const { count } = await prisma.tm_journal_commentaire_libre.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends tm_journal_commentaire_libreDeleteManyArgs>(args?: SelectSubset<T, tm_journal_commentaire_libreDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tm_journal_commentaire_libres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_commentaire_libreUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tm_journal_commentaire_libres
     * const tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends tm_journal_commentaire_libreUpdateManyArgs>(args: SelectSubset<T, tm_journal_commentaire_libreUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Tm_journal_commentaire_libre.
     * @param {tm_journal_commentaire_libreUpsertArgs} args - Arguments to update or create a Tm_journal_commentaire_libre.
     * @example
     * // Update or create a Tm_journal_commentaire_libre
     * const tm_journal_commentaire_libre = await prisma.tm_journal_commentaire_libre.upsert({
     *   create: {
     *     // ... data to create a Tm_journal_commentaire_libre
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Tm_journal_commentaire_libre we want to update
     *   }
     * })
     */
    upsert<T extends tm_journal_commentaire_libreUpsertArgs>(args: SelectSubset<T, tm_journal_commentaire_libreUpsertArgs<ExtArgs>>): Prisma__tm_journal_commentaire_libreClient<$Result.GetResult<Prisma.$tm_journal_commentaire_librePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Tm_journal_commentaire_libres.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_commentaire_libreCountArgs} args - Arguments to filter Tm_journal_commentaire_libres to count.
     * @example
     * // Count the number of Tm_journal_commentaire_libres
     * const count = await prisma.tm_journal_commentaire_libre.count({
     *   where: {
     *     // ... the filter for the Tm_journal_commentaire_libres we want to count
     *   }
     * })
    **/
    count<T extends tm_journal_commentaire_libreCountArgs>(
      args?: Subset<T, tm_journal_commentaire_libreCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], Tm_journal_commentaire_libreCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Tm_journal_commentaire_libre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {Tm_journal_commentaire_libreAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends Tm_journal_commentaire_libreAggregateArgs>(args: Subset<T, Tm_journal_commentaire_libreAggregateArgs>): Prisma.PrismaPromise<GetTm_journal_commentaire_libreAggregateType<T>>

    /**
     * Group by Tm_journal_commentaire_libre.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {tm_journal_commentaire_libreGroupByArgs} args - Group by arguments.
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
      T extends tm_journal_commentaire_libreGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: tm_journal_commentaire_libreGroupByArgs['orderBy'] }
        : { orderBy?: tm_journal_commentaire_libreGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, tm_journal_commentaire_libreGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTm_journal_commentaire_libreGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the tm_journal_commentaire_libre model
   */
  readonly fields: tm_journal_commentaire_libreFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for tm_journal_commentaire_libre.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__tm_journal_commentaire_libreClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the tm_journal_commentaire_libre model
   */
  interface tm_journal_commentaire_libreFieldRefs {
    readonly Id_Commentaire_Journal: FieldRef<"tm_journal_commentaire_libre", 'Int'>
    readonly Code_Journal: FieldRef<"tm_journal_commentaire_libre", 'String'>
    readonly Commentaire: FieldRef<"tm_journal_commentaire_libre", 'String'>
    readonly Date_Creation: FieldRef<"tm_journal_commentaire_libre", 'DateTime'>
    readonly Date_Modification: FieldRef<"tm_journal_commentaire_libre", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * tm_journal_commentaire_libre findUnique
   */
  export type tm_journal_commentaire_libreFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_commentaire_libre to fetch.
     */
    where: tm_journal_commentaire_libreWhereUniqueInput
  }

  /**
   * tm_journal_commentaire_libre findUniqueOrThrow
   */
  export type tm_journal_commentaire_libreFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_commentaire_libre to fetch.
     */
    where: tm_journal_commentaire_libreWhereUniqueInput
  }

  /**
   * tm_journal_commentaire_libre findFirst
   */
  export type tm_journal_commentaire_libreFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_commentaire_libre to fetch.
     */
    where?: tm_journal_commentaire_libreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_commentaire_libres to fetch.
     */
    orderBy?: tm_journal_commentaire_libreOrderByWithRelationInput | tm_journal_commentaire_libreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_journal_commentaire_libres.
     */
    cursor?: tm_journal_commentaire_libreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_commentaire_libres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_commentaire_libres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journal_commentaire_libres.
     */
    distinct?: Tm_journal_commentaire_libreScalarFieldEnum | Tm_journal_commentaire_libreScalarFieldEnum[]
  }

  /**
   * tm_journal_commentaire_libre findFirstOrThrow
   */
  export type tm_journal_commentaire_libreFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_commentaire_libre to fetch.
     */
    where?: tm_journal_commentaire_libreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_commentaire_libres to fetch.
     */
    orderBy?: tm_journal_commentaire_libreOrderByWithRelationInput | tm_journal_commentaire_libreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for tm_journal_commentaire_libres.
     */
    cursor?: tm_journal_commentaire_libreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_commentaire_libres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_commentaire_libres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journal_commentaire_libres.
     */
    distinct?: Tm_journal_commentaire_libreScalarFieldEnum | Tm_journal_commentaire_libreScalarFieldEnum[]
  }

  /**
   * tm_journal_commentaire_libre findMany
   */
  export type tm_journal_commentaire_libreFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
    /**
     * Filter, which tm_journal_commentaire_libres to fetch.
     */
    where?: tm_journal_commentaire_libreWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of tm_journal_commentaire_libres to fetch.
     */
    orderBy?: tm_journal_commentaire_libreOrderByWithRelationInput | tm_journal_commentaire_libreOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing tm_journal_commentaire_libres.
     */
    cursor?: tm_journal_commentaire_libreWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` tm_journal_commentaire_libres from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` tm_journal_commentaire_libres.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of tm_journal_commentaire_libres.
     */
    distinct?: Tm_journal_commentaire_libreScalarFieldEnum | Tm_journal_commentaire_libreScalarFieldEnum[]
  }

  /**
   * tm_journal_commentaire_libre create
   */
  export type tm_journal_commentaire_libreCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
    /**
     * The data needed to create a tm_journal_commentaire_libre.
     */
    data: XOR<tm_journal_commentaire_libreCreateInput, tm_journal_commentaire_libreUncheckedCreateInput>
  }

  /**
   * tm_journal_commentaire_libre createMany
   */
  export type tm_journal_commentaire_libreCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many tm_journal_commentaire_libres.
     */
    data: tm_journal_commentaire_libreCreateManyInput | tm_journal_commentaire_libreCreateManyInput[]
  }

  /**
   * tm_journal_commentaire_libre update
   */
  export type tm_journal_commentaire_libreUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
    /**
     * The data needed to update a tm_journal_commentaire_libre.
     */
    data: XOR<tm_journal_commentaire_libreUpdateInput, tm_journal_commentaire_libreUncheckedUpdateInput>
    /**
     * Choose, which tm_journal_commentaire_libre to update.
     */
    where: tm_journal_commentaire_libreWhereUniqueInput
  }

  /**
   * tm_journal_commentaire_libre updateMany
   */
  export type tm_journal_commentaire_libreUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update tm_journal_commentaire_libres.
     */
    data: XOR<tm_journal_commentaire_libreUpdateManyMutationInput, tm_journal_commentaire_libreUncheckedUpdateManyInput>
    /**
     * Filter which tm_journal_commentaire_libres to update
     */
    where?: tm_journal_commentaire_libreWhereInput
    /**
     * Limit how many tm_journal_commentaire_libres to update.
     */
    limit?: number
  }

  /**
   * tm_journal_commentaire_libre upsert
   */
  export type tm_journal_commentaire_libreUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
    /**
     * The filter to search for the tm_journal_commentaire_libre to update in case it exists.
     */
    where: tm_journal_commentaire_libreWhereUniqueInput
    /**
     * In case the tm_journal_commentaire_libre found by the `where` argument doesn't exist, create a new tm_journal_commentaire_libre with this data.
     */
    create: XOR<tm_journal_commentaire_libreCreateInput, tm_journal_commentaire_libreUncheckedCreateInput>
    /**
     * In case the tm_journal_commentaire_libre was found with the provided `where` argument, update it with this data.
     */
    update: XOR<tm_journal_commentaire_libreUpdateInput, tm_journal_commentaire_libreUncheckedUpdateInput>
  }

  /**
   * tm_journal_commentaire_libre delete
   */
  export type tm_journal_commentaire_libreDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
    /**
     * Filter which tm_journal_commentaire_libre to delete.
     */
    where: tm_journal_commentaire_libreWhereUniqueInput
  }

  /**
   * tm_journal_commentaire_libre deleteMany
   */
  export type tm_journal_commentaire_libreDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which tm_journal_commentaire_libres to delete
     */
    where?: tm_journal_commentaire_libreWhereInput
    /**
     * Limit how many tm_journal_commentaire_libres to delete.
     */
    limit?: number
  }

  /**
   * tm_journal_commentaire_libre without action
   */
  export type tm_journal_commentaire_libreDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the tm_journal_commentaire_libre
     */
    select?: tm_journal_commentaire_libreSelect<ExtArgs> | null
    /**
     * Omit specific fields from the tm_journal_commentaire_libre
     */
    omit?: tm_journal_commentaire_libreOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable',
    Snapshot: 'Snapshot'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const Tm_graphiqueScalarFieldEnum: {
    Id_Graphique: 'Id_Graphique',
    Date_Heure_Mesure: 'Date_Heure_Mesure',
    Valeur: 'Valeur',
    Valeur_Brute: 'Valeur_Brute',
    Nb_Decimal: 'Nb_Decimal',
    Consigne: 'Consigne',
    Consigne_Sup: 'Consigne_Sup',
    Consigne_Inf: 'Consigne_Inf',
    Unite: 'Unite',
    Sonde_Numero_Serie: 'Sonde_Numero_Serie',
    Adresse_Sonde: 'Adresse_Sonde',
    Id_Sonde: 'Id_Sonde',
    Id_Lieu: 'Id_Lieu',
    Est_Valeur_Null: 'Est_Valeur_Null',
    Frequence: 'Frequence',
    Est_Etat_Alarme: 'Est_Etat_Alarme',
    Consigne_Inf_Pre_Alarme: 'Consigne_Inf_Pre_Alarme',
    Consigne_Sup_Pre_Alarme: 'Consigne_Sup_Pre_Alarme'
  };

  export type Tm_graphiqueScalarFieldEnum = (typeof Tm_graphiqueScalarFieldEnum)[keyof typeof Tm_graphiqueScalarFieldEnum]


  export const Tm_journalScalarFieldEnum: {
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Id_Journal: 'Id_Journal',
    Code_Journal: 'Code_Journal',
    Commentaire: 'Commentaire',
    Nom_Utilisateur: 'Nom_Utilisateur',
    Profil_Utilisateur: 'Profil_Utilisateur',
    Date_Heure_Journal: 'Date_Heure_Journal',
    Id_Lieu: 'Id_Lieu',
    Commentaire_Utilisateur: 'Commentaire_Utilisateur'
  };

  export type Tm_journalScalarFieldEnum = (typeof Tm_journalScalarFieldEnum)[keyof typeof Tm_journalScalarFieldEnum]


  export const Tm_journal_codeScalarFieldEnum: {
    Code_Journal: 'Code_Journal',
    Commentaire: 'Commentaire'
  };

  export type Tm_journal_codeScalarFieldEnum = (typeof Tm_journal_codeScalarFieldEnum)[keyof typeof Tm_journal_codeScalarFieldEnum]


  export const Tm_compteur_id_tableScalarFieldEnum: {
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Nom_Table: 'Nom_Table',
    Compteur_Id: 'Compteur_Id'
  };

  export type Tm_compteur_id_tableScalarFieldEnum = (typeof Tm_compteur_id_tableScalarFieldEnum)[keyof typeof Tm_compteur_id_tableScalarFieldEnum]


  export const Tm_mesuresScalarFieldEnum: {
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Id_Mesure: 'Id_Mesure',
    Date_Heure_Mesure: 'Date_Heure_Mesure',
    Valeur: 'Valeur',
    Valeur_Brute: 'Valeur_Brute',
    Est_Valeur_Memoire: 'Est_Valeur_Memoire',
    Nb_Decimal: 'Nb_Decimal',
    Consigne: 'Consigne',
    Consigne_Sup: 'Consigne_Sup',
    Consigne_Inf: 'Consigne_Inf',
    Unite: 'Unite',
    Sonde_Numero_Serie: 'Sonde_Numero_Serie',
    Adresse_Sonde: 'Adresse_Sonde',
    Id_Lieu: 'Id_Lieu',
    Est_Valeur_Null: 'Est_Valeur_Null',
    Frequence: 'Frequence',
    Est_Etat_Alarme: 'Est_Etat_Alarme',
    Consigne_Inf_Pre_Alarme: 'Consigne_Inf_Pre_Alarme',
    Consigne_Sup_Pre_Alarme: 'Consigne_Sup_Pre_Alarme',
    Moyenne: 'Moyenne',
    Rssi: 'Rssi',
    Tension: 'Tension'
  };

  export type Tm_mesuresScalarFieldEnum = (typeof Tm_mesuresScalarFieldEnum)[keyof typeof Tm_mesuresScalarFieldEnum]


  export const Tm_mesures_gsoScalarFieldEnum: {
    Id_mesures_gso: 'Id_mesures_gso',
    id_capteur: 'id_capteur',
    tep: 'tep',
    unite: 'unite',
    date_mesure: 'date_mesure',
    rssi: 'rssi',
    tension: 'tension'
  };

  export type Tm_mesures_gsoScalarFieldEnum = (typeof Tm_mesures_gsoScalarFieldEnum)[keyof typeof Tm_mesures_gsoScalarFieldEnum]


  export const Tm_journal_histoScalarFieldEnum: {
    Id_Journal_Histo: 'Id_Journal_Histo',
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Id_Journal: 'Id_Journal',
    Code_Journal: 'Code_Journal',
    Commentaire: 'Commentaire',
    Nom_Utilisateur: 'Nom_Utilisateur',
    Profil_Utilisateur: 'Profil_Utilisateur',
    Date_Heure_Journal: 'Date_Heure_Journal',
    Id_Lieu: 'Id_Lieu',
    Commentaire_Utilisateur: 'Commentaire_Utilisateur'
  };

  export type Tm_journal_histoScalarFieldEnum = (typeof Tm_journal_histoScalarFieldEnum)[keyof typeof Tm_journal_histoScalarFieldEnum]


  export const Tm_mesure_calibrageScalarFieldEnum: {
    Id_Mesure_Calibrage: 'Id_Mesure_Calibrage',
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Valeur: 'Valeur',
    Valeur_Brute: 'Valeur_Brute',
    Sonde_Numero_Serie: 'Sonde_Numero_Serie',
    Est_Valeur_Null: 'Est_Valeur_Null',
    Date_Heure: 'Date_Heure'
  };

  export type Tm_mesure_calibrageScalarFieldEnum = (typeof Tm_mesure_calibrageScalarFieldEnum)[keyof typeof Tm_mesure_calibrageScalarFieldEnum]


  export const Tm_mesure_calibrage_etalonScalarFieldEnum: {
    Id_Mesure_Calibrage_Etalon: 'Id_Mesure_Calibrage_Etalon',
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Valeur: 'Valeur',
    Valeur_Brute: 'Valeur_Brute',
    Etalon_Numero_Serie: 'Etalon_Numero_Serie',
    Est_Valeur_Null: 'Est_Valeur_Null',
    Date_Heure: 'Date_Heure'
  };

  export type Tm_mesure_calibrage_etalonScalarFieldEnum = (typeof Tm_mesure_calibrage_etalonScalarFieldEnum)[keyof typeof Tm_mesure_calibrage_etalonScalarFieldEnum]


  export const Tm_mesure_etalonScalarFieldEnum: {
    Id_Mesure_Etalon: 'Id_Mesure_Etalon',
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Valeur_Brute: 'Valeur_Brute',
    Etalon_Numero_Serie: 'Etalon_Numero_Serie',
    Est_Valeur_Null: 'Est_Valeur_Null',
    Date_Heure: 'Date_Heure',
    Message_Erreur: 'Message_Erreur'
  };

  export type Tm_mesure_etalonScalarFieldEnum = (typeof Tm_mesure_etalonScalarFieldEnum)[keyof typeof Tm_mesure_etalonScalarFieldEnum]


  export const Tm_mesure_etalonnageScalarFieldEnum: {
    Id_Mesure_Etalonnage: 'Id_Mesure_Etalonnage',
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Sonde_Numero_serie: 'Sonde_Numero_serie',
    Numero_Ordre: 'Numero_Ordre',
    Mesure_Sonde: 'Mesure_Sonde',
    Mesure_Etalon: 'Mesure_Etalon',
    Date_Heure: 'Date_Heure'
  };

  export type Tm_mesure_etalonnageScalarFieldEnum = (typeof Tm_mesure_etalonnageScalarFieldEnum)[keyof typeof Tm_mesure_etalonnageScalarFieldEnum]


  export const Tm_mesures_histoScalarFieldEnum: {
    Id_Mesure: 'Id_Mesure',
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Date_Heure_Mesure: 'Date_Heure_Mesure',
    Valeur: 'Valeur',
    Valeur_Brute: 'Valeur_Brute',
    Nb_decimal: 'Nb_decimal',
    Consigne: 'Consigne',
    Consigne_Sup: 'Consigne_Sup',
    Consigne_Inf: 'Consigne_Inf',
    Unite: 'Unite',
    Sonde_Numero_Serie: 'Sonde_Numero_Serie',
    Id_Lieu: 'Id_Lieu',
    Est_Valeur_Null: 'Est_Valeur_Null',
    Frequence: 'Frequence',
    Est_En_Alarme: 'Est_En_Alarme',
    Consigne_Inf_Pre_Alarme: 'Consigne_Inf_Pre_Alarme',
    Consigne_Sup_Pre_Alarme: 'Consigne_Sup_Pre_Alarme',
    Moyenne: 'Moyenne'
  };

  export type Tm_mesures_histoScalarFieldEnum = (typeof Tm_mesures_histoScalarFieldEnum)[keyof typeof Tm_mesures_histoScalarFieldEnum]


  export const Tm_mesures_testScalarFieldEnum: {
    Id_Mesure_Test: 'Id_Mesure_Test',
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Valeur_Brute: 'Valeur_Brute',
    Sonde_Numero_Serie: 'Sonde_Numero_Serie',
    Est_Valeur_Null: 'Est_Valeur_Null',
    Date_Heure: 'Date_Heure',
    Nombre_Total: 'Nombre_Total',
    Nombre_Recu: 'Nombre_Recu'
  };

  export type Tm_mesures_testScalarFieldEnum = (typeof Tm_mesures_testScalarFieldEnum)[keyof typeof Tm_mesures_testScalarFieldEnum]


  export const Tm_mesures_test_etalonScalarFieldEnum: {
    Id_Mesure_Test_Etalon: 'Id_Mesure_Test_Etalon',
    Id_Serveur_BDD: 'Id_Serveur_BDD',
    Valeur_Brute: 'Valeur_Brute',
    Etalon_Numero_Serie: 'Etalon_Numero_Serie',
    Est_Valeur_Null: 'Est_Valeur_Null',
    Date_Heure: 'Date_Heure',
    Nombre_Total: 'Nombre_Total',
    Nombre_Recu: 'Nombre_Recu'
  };

  export type Tm_mesures_test_etalonScalarFieldEnum = (typeof Tm_mesures_test_etalonScalarFieldEnum)[keyof typeof Tm_mesures_test_etalonScalarFieldEnum]


  export const Tm_mode_degradeScalarFieldEnum: {
    Id_Mode_Degrade: 'Id_Mode_Degrade',
    Id_Utilisateur: 'Id_Utilisateur',
    Date_Heure_Creation: 'Date_Heure_Creation',
    Requete_SQL: 'Requete_SQL',
    Est_Archivee: 'Est_Archivee',
    Date_Heure_Archive: 'Date_Heure_Archive'
  };

  export type Tm_mode_degradeScalarFieldEnum = (typeof Tm_mode_degradeScalarFieldEnum)[keyof typeof Tm_mode_degradeScalarFieldEnum]


  export const Tm_parametreScalarFieldEnum: {
    Id_Parametre: 'Id_Parametre',
    Cle_Parametre: 'Cle_Parametre',
    Valeur_Parametre: 'Valeur_Parametre',
    Groupe_Parametre: 'Groupe_Parametre',
    Commentaire_Parametre: 'Commentaire_Parametre'
  };

  export type Tm_parametreScalarFieldEnum = (typeof Tm_parametreScalarFieldEnum)[keyof typeof Tm_parametreScalarFieldEnum]


  export const Tm_vigilog_mesureScalarFieldEnum: {
    Id_VigiLog_Mesure: 'Id_VigiLog_Mesure',
    Id_VigiLog_Tournee: 'Id_VigiLog_Tournee',
    Numero_Ordre: 'Numero_Ordre',
    Date_Heure_Mesure: 'Date_Heure_Mesure',
    Valeur: 'Valeur',
    Est_Hors_Limites: 'Est_Hors_Limites',
    Est_En_Alarme: 'Est_En_Alarme',
    Est_Marqueur: 'Est_Marqueur',
    Details: 'Details',
    Date_Heure_Import: 'Date_Heure_Import'
  };

  export type Tm_vigilog_mesureScalarFieldEnum = (typeof Tm_vigilog_mesureScalarFieldEnum)[keyof typeof Tm_vigilog_mesureScalarFieldEnum]


  export const Tm_journal_commentaire_libreScalarFieldEnum: {
    Id_Commentaire_Journal: 'Id_Commentaire_Journal',
    Code_Journal: 'Code_Journal',
    Commentaire: 'Commentaire',
    Date_Creation: 'Date_Creation',
    Date_Modification: 'Date_Modification'
  };

  export type Tm_journal_commentaire_libreScalarFieldEnum = (typeof Tm_journal_commentaire_libreScalarFieldEnum)[keyof typeof Tm_journal_commentaire_libreScalarFieldEnum]


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


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    
  /**
   * Deep Input Types
   */


  export type tm_graphiqueWhereInput = {
    AND?: tm_graphiqueWhereInput | tm_graphiqueWhereInput[]
    OR?: tm_graphiqueWhereInput[]
    NOT?: tm_graphiqueWhereInput | tm_graphiqueWhereInput[]
    Id_Graphique?: IntFilter<"tm_graphique"> | number
    Date_Heure_Mesure?: DateTimeFilter<"tm_graphique"> | Date | string
    Valeur?: FloatNullableFilter<"tm_graphique"> | number | null
    Valeur_Brute?: FloatNullableFilter<"tm_graphique"> | number | null
    Nb_Decimal?: IntNullableFilter<"tm_graphique"> | number | null
    Consigne?: FloatNullableFilter<"tm_graphique"> | number | null
    Consigne_Sup?: FloatNullableFilter<"tm_graphique"> | number | null
    Consigne_Inf?: FloatNullableFilter<"tm_graphique"> | number | null
    Unite?: StringNullableFilter<"tm_graphique"> | string | null
    Sonde_Numero_Serie?: StringNullableFilter<"tm_graphique"> | string | null
    Adresse_Sonde?: StringNullableFilter<"tm_graphique"> | string | null
    Id_Sonde?: IntNullableFilter<"tm_graphique"> | number | null
    Id_Lieu?: IntFilter<"tm_graphique"> | number
    Est_Valeur_Null?: BoolFilter<"tm_graphique"> | boolean
    Frequence?: IntNullableFilter<"tm_graphique"> | number | null
    Est_Etat_Alarme?: IntFilter<"tm_graphique"> | number
    Consigne_Inf_Pre_Alarme?: FloatNullableFilter<"tm_graphique"> | number | null
    Consigne_Sup_Pre_Alarme?: FloatNullableFilter<"tm_graphique"> | number | null
  }

  export type tm_graphiqueOrderByWithRelationInput = {
    Id_Graphique?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Valeur_Brute?: SortOrderInput | SortOrder
    Nb_Decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    Sonde_Numero_Serie?: SortOrderInput | SortOrder
    Adresse_Sonde?: SortOrderInput | SortOrder
    Id_Sonde?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrderInput | SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrderInput | SortOrder
  }

  export type tm_graphiqueWhereUniqueInput = Prisma.AtLeast<{
    Id_Graphique_Date_Heure_Mesure_Id_Lieu_Est_Valeur_Null_Est_Etat_Alarme?: tm_graphiqueId_GraphiqueDate_Heure_MesureId_LieuEst_Valeur_NullEst_Etat_AlarmeCompoundUniqueInput
    AND?: tm_graphiqueWhereInput | tm_graphiqueWhereInput[]
    OR?: tm_graphiqueWhereInput[]
    NOT?: tm_graphiqueWhereInput | tm_graphiqueWhereInput[]
    Id_Graphique?: IntFilter<"tm_graphique"> | number
    Date_Heure_Mesure?: DateTimeFilter<"tm_graphique"> | Date | string
    Valeur?: FloatNullableFilter<"tm_graphique"> | number | null
    Valeur_Brute?: FloatNullableFilter<"tm_graphique"> | number | null
    Nb_Decimal?: IntNullableFilter<"tm_graphique"> | number | null
    Consigne?: FloatNullableFilter<"tm_graphique"> | number | null
    Consigne_Sup?: FloatNullableFilter<"tm_graphique"> | number | null
    Consigne_Inf?: FloatNullableFilter<"tm_graphique"> | number | null
    Unite?: StringNullableFilter<"tm_graphique"> | string | null
    Sonde_Numero_Serie?: StringNullableFilter<"tm_graphique"> | string | null
    Adresse_Sonde?: StringNullableFilter<"tm_graphique"> | string | null
    Id_Sonde?: IntNullableFilter<"tm_graphique"> | number | null
    Id_Lieu?: IntFilter<"tm_graphique"> | number
    Est_Valeur_Null?: BoolFilter<"tm_graphique"> | boolean
    Frequence?: IntNullableFilter<"tm_graphique"> | number | null
    Est_Etat_Alarme?: IntFilter<"tm_graphique"> | number
    Consigne_Inf_Pre_Alarme?: FloatNullableFilter<"tm_graphique"> | number | null
    Consigne_Sup_Pre_Alarme?: FloatNullableFilter<"tm_graphique"> | number | null
  }, "Id_Graphique_Date_Heure_Mesure_Id_Lieu_Est_Valeur_Null_Est_Etat_Alarme">

  export type tm_graphiqueOrderByWithAggregationInput = {
    Id_Graphique?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Valeur_Brute?: SortOrderInput | SortOrder
    Nb_Decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    Sonde_Numero_Serie?: SortOrderInput | SortOrder
    Adresse_Sonde?: SortOrderInput | SortOrder
    Id_Sonde?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrderInput | SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrderInput | SortOrder
    _count?: tm_graphiqueCountOrderByAggregateInput
    _avg?: tm_graphiqueAvgOrderByAggregateInput
    _max?: tm_graphiqueMaxOrderByAggregateInput
    _min?: tm_graphiqueMinOrderByAggregateInput
    _sum?: tm_graphiqueSumOrderByAggregateInput
  }

  export type tm_graphiqueScalarWhereWithAggregatesInput = {
    AND?: tm_graphiqueScalarWhereWithAggregatesInput | tm_graphiqueScalarWhereWithAggregatesInput[]
    OR?: tm_graphiqueScalarWhereWithAggregatesInput[]
    NOT?: tm_graphiqueScalarWhereWithAggregatesInput | tm_graphiqueScalarWhereWithAggregatesInput[]
    Id_Graphique?: IntWithAggregatesFilter<"tm_graphique"> | number
    Date_Heure_Mesure?: DateTimeWithAggregatesFilter<"tm_graphique"> | Date | string
    Valeur?: FloatNullableWithAggregatesFilter<"tm_graphique"> | number | null
    Valeur_Brute?: FloatNullableWithAggregatesFilter<"tm_graphique"> | number | null
    Nb_Decimal?: IntNullableWithAggregatesFilter<"tm_graphique"> | number | null
    Consigne?: FloatNullableWithAggregatesFilter<"tm_graphique"> | number | null
    Consigne_Sup?: FloatNullableWithAggregatesFilter<"tm_graphique"> | number | null
    Consigne_Inf?: FloatNullableWithAggregatesFilter<"tm_graphique"> | number | null
    Unite?: StringNullableWithAggregatesFilter<"tm_graphique"> | string | null
    Sonde_Numero_Serie?: StringNullableWithAggregatesFilter<"tm_graphique"> | string | null
    Adresse_Sonde?: StringNullableWithAggregatesFilter<"tm_graphique"> | string | null
    Id_Sonde?: IntNullableWithAggregatesFilter<"tm_graphique"> | number | null
    Id_Lieu?: IntWithAggregatesFilter<"tm_graphique"> | number
    Est_Valeur_Null?: BoolWithAggregatesFilter<"tm_graphique"> | boolean
    Frequence?: IntNullableWithAggregatesFilter<"tm_graphique"> | number | null
    Est_Etat_Alarme?: IntWithAggregatesFilter<"tm_graphique"> | number
    Consigne_Inf_Pre_Alarme?: FloatNullableWithAggregatesFilter<"tm_graphique"> | number | null
    Consigne_Sup_Pre_Alarme?: FloatNullableWithAggregatesFilter<"tm_graphique"> | number | null
  }

  export type tm_journalWhereInput = {
    AND?: tm_journalWhereInput | tm_journalWhereInput[]
    OR?: tm_journalWhereInput[]
    NOT?: tm_journalWhereInput | tm_journalWhereInput[]
    Id_Serveur_BDD?: IntFilter<"tm_journal"> | number
    Id_Journal?: IntFilter<"tm_journal"> | number
    Code_Journal?: StringNullableFilter<"tm_journal"> | string | null
    Commentaire?: StringNullableFilter<"tm_journal"> | string | null
    Nom_Utilisateur?: StringNullableFilter<"tm_journal"> | string | null
    Profil_Utilisateur?: StringNullableFilter<"tm_journal"> | string | null
    Date_Heure_Journal?: DateTimeNullableFilter<"tm_journal"> | Date | string | null
    Id_Lieu?: IntNullableFilter<"tm_journal"> | number | null
    Commentaire_Utilisateur?: StringNullableFilter<"tm_journal"> | string | null
  }

  export type tm_journalOrderByWithRelationInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrderInput | SortOrder
    Commentaire?: SortOrderInput | SortOrder
    Nom_Utilisateur?: SortOrderInput | SortOrder
    Profil_Utilisateur?: SortOrderInput | SortOrder
    Date_Heure_Journal?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrderInput | SortOrder
    Commentaire_Utilisateur?: SortOrderInput | SortOrder
  }

  export type tm_journalWhereUniqueInput = Prisma.AtLeast<{
    Id_Serveur_BDD_Id_Journal?: tm_journalId_Serveur_BDDId_JournalCompoundUniqueInput
    AND?: tm_journalWhereInput | tm_journalWhereInput[]
    OR?: tm_journalWhereInput[]
    NOT?: tm_journalWhereInput | tm_journalWhereInput[]
    Id_Serveur_BDD?: IntFilter<"tm_journal"> | number
    Id_Journal?: IntFilter<"tm_journal"> | number
    Code_Journal?: StringNullableFilter<"tm_journal"> | string | null
    Commentaire?: StringNullableFilter<"tm_journal"> | string | null
    Nom_Utilisateur?: StringNullableFilter<"tm_journal"> | string | null
    Profil_Utilisateur?: StringNullableFilter<"tm_journal"> | string | null
    Date_Heure_Journal?: DateTimeNullableFilter<"tm_journal"> | Date | string | null
    Id_Lieu?: IntNullableFilter<"tm_journal"> | number | null
    Commentaire_Utilisateur?: StringNullableFilter<"tm_journal"> | string | null
  }, "Id_Serveur_BDD_Id_Journal">

  export type tm_journalOrderByWithAggregationInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrderInput | SortOrder
    Commentaire?: SortOrderInput | SortOrder
    Nom_Utilisateur?: SortOrderInput | SortOrder
    Profil_Utilisateur?: SortOrderInput | SortOrder
    Date_Heure_Journal?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrderInput | SortOrder
    Commentaire_Utilisateur?: SortOrderInput | SortOrder
    _count?: tm_journalCountOrderByAggregateInput
    _avg?: tm_journalAvgOrderByAggregateInput
    _max?: tm_journalMaxOrderByAggregateInput
    _min?: tm_journalMinOrderByAggregateInput
    _sum?: tm_journalSumOrderByAggregateInput
  }

  export type tm_journalScalarWhereWithAggregatesInput = {
    AND?: tm_journalScalarWhereWithAggregatesInput | tm_journalScalarWhereWithAggregatesInput[]
    OR?: tm_journalScalarWhereWithAggregatesInput[]
    NOT?: tm_journalScalarWhereWithAggregatesInput | tm_journalScalarWhereWithAggregatesInput[]
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_journal"> | number
    Id_Journal?: IntWithAggregatesFilter<"tm_journal"> | number
    Code_Journal?: StringNullableWithAggregatesFilter<"tm_journal"> | string | null
    Commentaire?: StringNullableWithAggregatesFilter<"tm_journal"> | string | null
    Nom_Utilisateur?: StringNullableWithAggregatesFilter<"tm_journal"> | string | null
    Profil_Utilisateur?: StringNullableWithAggregatesFilter<"tm_journal"> | string | null
    Date_Heure_Journal?: DateTimeNullableWithAggregatesFilter<"tm_journal"> | Date | string | null
    Id_Lieu?: IntNullableWithAggregatesFilter<"tm_journal"> | number | null
    Commentaire_Utilisateur?: StringNullableWithAggregatesFilter<"tm_journal"> | string | null
  }

  export type tm_journal_codeWhereInput = {
    AND?: tm_journal_codeWhereInput | tm_journal_codeWhereInput[]
    OR?: tm_journal_codeWhereInput[]
    NOT?: tm_journal_codeWhereInput | tm_journal_codeWhereInput[]
    Code_Journal?: StringFilter<"tm_journal_code"> | string
    Commentaire?: StringNullableFilter<"tm_journal_code"> | string | null
  }

  export type tm_journal_codeOrderByWithRelationInput = {
    Code_Journal?: SortOrder
    Commentaire?: SortOrderInput | SortOrder
  }

  export type tm_journal_codeWhereUniqueInput = Prisma.AtLeast<{
    Code_Journal?: string
    AND?: tm_journal_codeWhereInput | tm_journal_codeWhereInput[]
    OR?: tm_journal_codeWhereInput[]
    NOT?: tm_journal_codeWhereInput | tm_journal_codeWhereInput[]
    Commentaire?: StringNullableFilter<"tm_journal_code"> | string | null
  }, "Code_Journal">

  export type tm_journal_codeOrderByWithAggregationInput = {
    Code_Journal?: SortOrder
    Commentaire?: SortOrderInput | SortOrder
    _count?: tm_journal_codeCountOrderByAggregateInput
    _max?: tm_journal_codeMaxOrderByAggregateInput
    _min?: tm_journal_codeMinOrderByAggregateInput
  }

  export type tm_journal_codeScalarWhereWithAggregatesInput = {
    AND?: tm_journal_codeScalarWhereWithAggregatesInput | tm_journal_codeScalarWhereWithAggregatesInput[]
    OR?: tm_journal_codeScalarWhereWithAggregatesInput[]
    NOT?: tm_journal_codeScalarWhereWithAggregatesInput | tm_journal_codeScalarWhereWithAggregatesInput[]
    Code_Journal?: StringWithAggregatesFilter<"tm_journal_code"> | string
    Commentaire?: StringNullableWithAggregatesFilter<"tm_journal_code"> | string | null
  }

  export type tm_compteur_id_tableWhereInput = {
    AND?: tm_compteur_id_tableWhereInput | tm_compteur_id_tableWhereInput[]
    OR?: tm_compteur_id_tableWhereInput[]
    NOT?: tm_compteur_id_tableWhereInput | tm_compteur_id_tableWhereInput[]
    Id_Serveur_BDD?: IntFilter<"tm_compteur_id_table"> | number
    Nom_Table?: StringFilter<"tm_compteur_id_table"> | string
    Compteur_Id?: IntNullableFilter<"tm_compteur_id_table"> | number | null
  }

  export type tm_compteur_id_tableOrderByWithRelationInput = {
    Id_Serveur_BDD?: SortOrder
    Nom_Table?: SortOrder
    Compteur_Id?: SortOrderInput | SortOrder
  }

  export type tm_compteur_id_tableWhereUniqueInput = Prisma.AtLeast<{
    Id_Serveur_BDD_Nom_Table?: tm_compteur_id_tableId_Serveur_BDDNom_TableCompoundUniqueInput
    AND?: tm_compteur_id_tableWhereInput | tm_compteur_id_tableWhereInput[]
    OR?: tm_compteur_id_tableWhereInput[]
    NOT?: tm_compteur_id_tableWhereInput | tm_compteur_id_tableWhereInput[]
    Id_Serveur_BDD?: IntFilter<"tm_compteur_id_table"> | number
    Nom_Table?: StringFilter<"tm_compteur_id_table"> | string
    Compteur_Id?: IntNullableFilter<"tm_compteur_id_table"> | number | null
  }, "Id_Serveur_BDD_Nom_Table">

  export type tm_compteur_id_tableOrderByWithAggregationInput = {
    Id_Serveur_BDD?: SortOrder
    Nom_Table?: SortOrder
    Compteur_Id?: SortOrderInput | SortOrder
    _count?: tm_compteur_id_tableCountOrderByAggregateInput
    _avg?: tm_compteur_id_tableAvgOrderByAggregateInput
    _max?: tm_compteur_id_tableMaxOrderByAggregateInput
    _min?: tm_compteur_id_tableMinOrderByAggregateInput
    _sum?: tm_compteur_id_tableSumOrderByAggregateInput
  }

  export type tm_compteur_id_tableScalarWhereWithAggregatesInput = {
    AND?: tm_compteur_id_tableScalarWhereWithAggregatesInput | tm_compteur_id_tableScalarWhereWithAggregatesInput[]
    OR?: tm_compteur_id_tableScalarWhereWithAggregatesInput[]
    NOT?: tm_compteur_id_tableScalarWhereWithAggregatesInput | tm_compteur_id_tableScalarWhereWithAggregatesInput[]
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_compteur_id_table"> | number
    Nom_Table?: StringWithAggregatesFilter<"tm_compteur_id_table"> | string
    Compteur_Id?: IntNullableWithAggregatesFilter<"tm_compteur_id_table"> | number | null
  }

  export type tm_mesuresWhereInput = {
    AND?: tm_mesuresWhereInput | tm_mesuresWhereInput[]
    OR?: tm_mesuresWhereInput[]
    NOT?: tm_mesuresWhereInput | tm_mesuresWhereInput[]
    Id_Serveur_BDD?: IntFilter<"tm_mesures"> | number
    Id_Mesure?: IntFilter<"tm_mesures"> | number
    Date_Heure_Mesure?: DateTimeFilter<"tm_mesures"> | Date | string
    Valeur?: FloatNullableFilter<"tm_mesures"> | number | null
    Valeur_Brute?: FloatNullableFilter<"tm_mesures"> | number | null
    Est_Valeur_Memoire?: BoolFilter<"tm_mesures"> | boolean
    Nb_Decimal?: IntNullableFilter<"tm_mesures"> | number | null
    Consigne?: FloatNullableFilter<"tm_mesures"> | number | null
    Consigne_Sup?: FloatNullableFilter<"tm_mesures"> | number | null
    Consigne_Inf?: FloatNullableFilter<"tm_mesures"> | number | null
    Unite?: StringNullableFilter<"tm_mesures"> | string | null
    Sonde_Numero_Serie?: StringNullableFilter<"tm_mesures"> | string | null
    Adresse_Sonde?: StringNullableFilter<"tm_mesures"> | string | null
    Id_Lieu?: IntFilter<"tm_mesures"> | number
    Est_Valeur_Null?: IntFilter<"tm_mesures"> | number
    Frequence?: IntNullableFilter<"tm_mesures"> | number | null
    Est_Etat_Alarme?: BoolFilter<"tm_mesures"> | boolean
    Consigne_Inf_Pre_Alarme?: FloatNullableFilter<"tm_mesures"> | number | null
    Consigne_Sup_Pre_Alarme?: FloatNullableFilter<"tm_mesures"> | number | null
    Moyenne?: FloatNullableFilter<"tm_mesures"> | number | null
    Rssi?: StringNullableFilter<"tm_mesures"> | string | null
    Tension?: StringNullableFilter<"tm_mesures"> | string | null
  }

  export type tm_mesuresOrderByWithRelationInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Mesure?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Valeur_Brute?: SortOrderInput | SortOrder
    Est_Valeur_Memoire?: SortOrder
    Nb_Decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    Sonde_Numero_Serie?: SortOrderInput | SortOrder
    Adresse_Sonde?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrderInput | SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrderInput | SortOrder
    Moyenne?: SortOrderInput | SortOrder
    Rssi?: SortOrderInput | SortOrder
    Tension?: SortOrderInput | SortOrder
  }

  export type tm_mesuresWhereUniqueInput = Prisma.AtLeast<{
    Id_Serveur_BDD_Id_Mesure_Date_Heure_Mesure_Id_Lieu_Est_Valeur_Null?: tm_mesuresId_Serveur_BDDId_MesureDate_Heure_MesureId_LieuEst_Valeur_NullCompoundUniqueInput
    AND?: tm_mesuresWhereInput | tm_mesuresWhereInput[]
    OR?: tm_mesuresWhereInput[]
    NOT?: tm_mesuresWhereInput | tm_mesuresWhereInput[]
    Id_Serveur_BDD?: IntFilter<"tm_mesures"> | number
    Id_Mesure?: IntFilter<"tm_mesures"> | number
    Date_Heure_Mesure?: DateTimeFilter<"tm_mesures"> | Date | string
    Valeur?: FloatNullableFilter<"tm_mesures"> | number | null
    Valeur_Brute?: FloatNullableFilter<"tm_mesures"> | number | null
    Est_Valeur_Memoire?: BoolFilter<"tm_mesures"> | boolean
    Nb_Decimal?: IntNullableFilter<"tm_mesures"> | number | null
    Consigne?: FloatNullableFilter<"tm_mesures"> | number | null
    Consigne_Sup?: FloatNullableFilter<"tm_mesures"> | number | null
    Consigne_Inf?: FloatNullableFilter<"tm_mesures"> | number | null
    Unite?: StringNullableFilter<"tm_mesures"> | string | null
    Sonde_Numero_Serie?: StringNullableFilter<"tm_mesures"> | string | null
    Adresse_Sonde?: StringNullableFilter<"tm_mesures"> | string | null
    Id_Lieu?: IntFilter<"tm_mesures"> | number
    Est_Valeur_Null?: IntFilter<"tm_mesures"> | number
    Frequence?: IntNullableFilter<"tm_mesures"> | number | null
    Est_Etat_Alarme?: BoolFilter<"tm_mesures"> | boolean
    Consigne_Inf_Pre_Alarme?: FloatNullableFilter<"tm_mesures"> | number | null
    Consigne_Sup_Pre_Alarme?: FloatNullableFilter<"tm_mesures"> | number | null
    Moyenne?: FloatNullableFilter<"tm_mesures"> | number | null
    Rssi?: StringNullableFilter<"tm_mesures"> | string | null
    Tension?: StringNullableFilter<"tm_mesures"> | string | null
  }, "Id_Serveur_BDD_Id_Mesure_Date_Heure_Mesure_Id_Lieu_Est_Valeur_Null">

  export type tm_mesuresOrderByWithAggregationInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Mesure?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Valeur_Brute?: SortOrderInput | SortOrder
    Est_Valeur_Memoire?: SortOrder
    Nb_Decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    Sonde_Numero_Serie?: SortOrderInput | SortOrder
    Adresse_Sonde?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrderInput | SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrderInput | SortOrder
    Moyenne?: SortOrderInput | SortOrder
    Rssi?: SortOrderInput | SortOrder
    Tension?: SortOrderInput | SortOrder
    _count?: tm_mesuresCountOrderByAggregateInput
    _avg?: tm_mesuresAvgOrderByAggregateInput
    _max?: tm_mesuresMaxOrderByAggregateInput
    _min?: tm_mesuresMinOrderByAggregateInput
    _sum?: tm_mesuresSumOrderByAggregateInput
  }

  export type tm_mesuresScalarWhereWithAggregatesInput = {
    AND?: tm_mesuresScalarWhereWithAggregatesInput | tm_mesuresScalarWhereWithAggregatesInput[]
    OR?: tm_mesuresScalarWhereWithAggregatesInput[]
    NOT?: tm_mesuresScalarWhereWithAggregatesInput | tm_mesuresScalarWhereWithAggregatesInput[]
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_mesures"> | number
    Id_Mesure?: IntWithAggregatesFilter<"tm_mesures"> | number
    Date_Heure_Mesure?: DateTimeWithAggregatesFilter<"tm_mesures"> | Date | string
    Valeur?: FloatNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Valeur_Brute?: FloatNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Est_Valeur_Memoire?: BoolWithAggregatesFilter<"tm_mesures"> | boolean
    Nb_Decimal?: IntNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Consigne?: FloatNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Consigne_Sup?: FloatNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Consigne_Inf?: FloatNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Unite?: StringNullableWithAggregatesFilter<"tm_mesures"> | string | null
    Sonde_Numero_Serie?: StringNullableWithAggregatesFilter<"tm_mesures"> | string | null
    Adresse_Sonde?: StringNullableWithAggregatesFilter<"tm_mesures"> | string | null
    Id_Lieu?: IntWithAggregatesFilter<"tm_mesures"> | number
    Est_Valeur_Null?: IntWithAggregatesFilter<"tm_mesures"> | number
    Frequence?: IntNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Est_Etat_Alarme?: BoolWithAggregatesFilter<"tm_mesures"> | boolean
    Consigne_Inf_Pre_Alarme?: FloatNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Consigne_Sup_Pre_Alarme?: FloatNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Moyenne?: FloatNullableWithAggregatesFilter<"tm_mesures"> | number | null
    Rssi?: StringNullableWithAggregatesFilter<"tm_mesures"> | string | null
    Tension?: StringNullableWithAggregatesFilter<"tm_mesures"> | string | null
  }

  export type tm_mesures_gsoWhereInput = {
    AND?: tm_mesures_gsoWhereInput | tm_mesures_gsoWhereInput[]
    OR?: tm_mesures_gsoWhereInput[]
    NOT?: tm_mesures_gsoWhereInput | tm_mesures_gsoWhereInput[]
    Id_mesures_gso?: IntFilter<"tm_mesures_gso"> | number
    id_capteur?: StringFilter<"tm_mesures_gso"> | string
    tep?: FloatNullableFilter<"tm_mesures_gso"> | number | null
    unite?: StringNullableFilter<"tm_mesures_gso"> | string | null
    date_mesure?: DateTimeFilter<"tm_mesures_gso"> | Date | string
    rssi?: StringNullableFilter<"tm_mesures_gso"> | string | null
    tension?: StringNullableFilter<"tm_mesures_gso"> | string | null
  }

  export type tm_mesures_gsoOrderByWithRelationInput = {
    Id_mesures_gso?: SortOrder
    id_capteur?: SortOrder
    tep?: SortOrderInput | SortOrder
    unite?: SortOrderInput | SortOrder
    date_mesure?: SortOrder
    rssi?: SortOrderInput | SortOrder
    tension?: SortOrderInput | SortOrder
  }

  export type tm_mesures_gsoWhereUniqueInput = Prisma.AtLeast<{
    id_capteur_date_mesure?: tm_mesures_gsoId_capteurDate_mesureCompoundUniqueInput
    AND?: tm_mesures_gsoWhereInput | tm_mesures_gsoWhereInput[]
    OR?: tm_mesures_gsoWhereInput[]
    NOT?: tm_mesures_gsoWhereInput | tm_mesures_gsoWhereInput[]
    Id_mesures_gso?: IntFilter<"tm_mesures_gso"> | number
    id_capteur?: StringFilter<"tm_mesures_gso"> | string
    tep?: FloatNullableFilter<"tm_mesures_gso"> | number | null
    unite?: StringNullableFilter<"tm_mesures_gso"> | string | null
    date_mesure?: DateTimeFilter<"tm_mesures_gso"> | Date | string
    rssi?: StringNullableFilter<"tm_mesures_gso"> | string | null
    tension?: StringNullableFilter<"tm_mesures_gso"> | string | null
  }, "id_capteur_date_mesure">

  export type tm_mesures_gsoOrderByWithAggregationInput = {
    Id_mesures_gso?: SortOrder
    id_capteur?: SortOrder
    tep?: SortOrderInput | SortOrder
    unite?: SortOrderInput | SortOrder
    date_mesure?: SortOrder
    rssi?: SortOrderInput | SortOrder
    tension?: SortOrderInput | SortOrder
    _count?: tm_mesures_gsoCountOrderByAggregateInput
    _avg?: tm_mesures_gsoAvgOrderByAggregateInput
    _max?: tm_mesures_gsoMaxOrderByAggregateInput
    _min?: tm_mesures_gsoMinOrderByAggregateInput
    _sum?: tm_mesures_gsoSumOrderByAggregateInput
  }

  export type tm_mesures_gsoScalarWhereWithAggregatesInput = {
    AND?: tm_mesures_gsoScalarWhereWithAggregatesInput | tm_mesures_gsoScalarWhereWithAggregatesInput[]
    OR?: tm_mesures_gsoScalarWhereWithAggregatesInput[]
    NOT?: tm_mesures_gsoScalarWhereWithAggregatesInput | tm_mesures_gsoScalarWhereWithAggregatesInput[]
    Id_mesures_gso?: IntWithAggregatesFilter<"tm_mesures_gso"> | number
    id_capteur?: StringWithAggregatesFilter<"tm_mesures_gso"> | string
    tep?: FloatNullableWithAggregatesFilter<"tm_mesures_gso"> | number | null
    unite?: StringNullableWithAggregatesFilter<"tm_mesures_gso"> | string | null
    date_mesure?: DateTimeWithAggregatesFilter<"tm_mesures_gso"> | Date | string
    rssi?: StringNullableWithAggregatesFilter<"tm_mesures_gso"> | string | null
    tension?: StringNullableWithAggregatesFilter<"tm_mesures_gso"> | string | null
  }

  export type tm_journal_histoWhereInput = {
    AND?: tm_journal_histoWhereInput | tm_journal_histoWhereInput[]
    OR?: tm_journal_histoWhereInput[]
    NOT?: tm_journal_histoWhereInput | tm_journal_histoWhereInput[]
    Id_Journal_Histo?: IntFilter<"tm_journal_histo"> | number
    Id_Serveur_BDD?: IntFilter<"tm_journal_histo"> | number
    Id_Journal?: IntFilter<"tm_journal_histo"> | number
    Code_Journal?: StringNullableFilter<"tm_journal_histo"> | string | null
    Commentaire?: StringNullableFilter<"tm_journal_histo"> | string | null
    Nom_Utilisateur?: StringNullableFilter<"tm_journal_histo"> | string | null
    Profil_Utilisateur?: StringNullableFilter<"tm_journal_histo"> | string | null
    Date_Heure_Journal?: DateTimeNullableFilter<"tm_journal_histo"> | Date | string | null
    Id_Lieu?: IntNullableFilter<"tm_journal_histo"> | number | null
    Commentaire_Utilisateur?: StringNullableFilter<"tm_journal_histo"> | string | null
  }

  export type tm_journal_histoOrderByWithRelationInput = {
    Id_Journal_Histo?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrderInput | SortOrder
    Commentaire?: SortOrderInput | SortOrder
    Nom_Utilisateur?: SortOrderInput | SortOrder
    Profil_Utilisateur?: SortOrderInput | SortOrder
    Date_Heure_Journal?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrderInput | SortOrder
    Commentaire_Utilisateur?: SortOrderInput | SortOrder
  }

  export type tm_journal_histoWhereUniqueInput = Prisma.AtLeast<{
    Id_Journal_Histo_Id_Serveur_BDD_Id_Journal?: tm_journal_histoId_Journal_HistoId_Serveur_BDDId_JournalCompoundUniqueInput
    AND?: tm_journal_histoWhereInput | tm_journal_histoWhereInput[]
    OR?: tm_journal_histoWhereInput[]
    NOT?: tm_journal_histoWhereInput | tm_journal_histoWhereInput[]
    Id_Journal_Histo?: IntFilter<"tm_journal_histo"> | number
    Id_Serveur_BDD?: IntFilter<"tm_journal_histo"> | number
    Id_Journal?: IntFilter<"tm_journal_histo"> | number
    Code_Journal?: StringNullableFilter<"tm_journal_histo"> | string | null
    Commentaire?: StringNullableFilter<"tm_journal_histo"> | string | null
    Nom_Utilisateur?: StringNullableFilter<"tm_journal_histo"> | string | null
    Profil_Utilisateur?: StringNullableFilter<"tm_journal_histo"> | string | null
    Date_Heure_Journal?: DateTimeNullableFilter<"tm_journal_histo"> | Date | string | null
    Id_Lieu?: IntNullableFilter<"tm_journal_histo"> | number | null
    Commentaire_Utilisateur?: StringNullableFilter<"tm_journal_histo"> | string | null
  }, "Id_Journal_Histo_Id_Serveur_BDD_Id_Journal">

  export type tm_journal_histoOrderByWithAggregationInput = {
    Id_Journal_Histo?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrderInput | SortOrder
    Commentaire?: SortOrderInput | SortOrder
    Nom_Utilisateur?: SortOrderInput | SortOrder
    Profil_Utilisateur?: SortOrderInput | SortOrder
    Date_Heure_Journal?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrderInput | SortOrder
    Commentaire_Utilisateur?: SortOrderInput | SortOrder
    _count?: tm_journal_histoCountOrderByAggregateInput
    _avg?: tm_journal_histoAvgOrderByAggregateInput
    _max?: tm_journal_histoMaxOrderByAggregateInput
    _min?: tm_journal_histoMinOrderByAggregateInput
    _sum?: tm_journal_histoSumOrderByAggregateInput
  }

  export type tm_journal_histoScalarWhereWithAggregatesInput = {
    AND?: tm_journal_histoScalarWhereWithAggregatesInput | tm_journal_histoScalarWhereWithAggregatesInput[]
    OR?: tm_journal_histoScalarWhereWithAggregatesInput[]
    NOT?: tm_journal_histoScalarWhereWithAggregatesInput | tm_journal_histoScalarWhereWithAggregatesInput[]
    Id_Journal_Histo?: IntWithAggregatesFilter<"tm_journal_histo"> | number
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_journal_histo"> | number
    Id_Journal?: IntWithAggregatesFilter<"tm_journal_histo"> | number
    Code_Journal?: StringNullableWithAggregatesFilter<"tm_journal_histo"> | string | null
    Commentaire?: StringNullableWithAggregatesFilter<"tm_journal_histo"> | string | null
    Nom_Utilisateur?: StringNullableWithAggregatesFilter<"tm_journal_histo"> | string | null
    Profil_Utilisateur?: StringNullableWithAggregatesFilter<"tm_journal_histo"> | string | null
    Date_Heure_Journal?: DateTimeNullableWithAggregatesFilter<"tm_journal_histo"> | Date | string | null
    Id_Lieu?: IntNullableWithAggregatesFilter<"tm_journal_histo"> | number | null
    Commentaire_Utilisateur?: StringNullableWithAggregatesFilter<"tm_journal_histo"> | string | null
  }

  export type tm_mesure_calibrageWhereInput = {
    AND?: tm_mesure_calibrageWhereInput | tm_mesure_calibrageWhereInput[]
    OR?: tm_mesure_calibrageWhereInput[]
    NOT?: tm_mesure_calibrageWhereInput | tm_mesure_calibrageWhereInput[]
    Id_Mesure_Calibrage?: IntFilter<"tm_mesure_calibrage"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesure_calibrage"> | number
    Valeur?: FloatFilter<"tm_mesure_calibrage"> | number
    Valeur_Brute?: FloatFilter<"tm_mesure_calibrage"> | number
    Sonde_Numero_Serie?: StringFilter<"tm_mesure_calibrage"> | string
    Est_Valeur_Null?: IntFilter<"tm_mesure_calibrage"> | number
    Date_Heure?: DateTimeFilter<"tm_mesure_calibrage"> | Date | string
  }

  export type tm_mesure_calibrageOrderByWithRelationInput = {
    Id_Mesure_Calibrage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_calibrageWhereUniqueInput = Prisma.AtLeast<{
    Id_Mesure_Calibrage_Id_Serveur_BDD?: tm_mesure_calibrageId_Mesure_CalibrageId_Serveur_BDDCompoundUniqueInput
    AND?: tm_mesure_calibrageWhereInput | tm_mesure_calibrageWhereInput[]
    OR?: tm_mesure_calibrageWhereInput[]
    NOT?: tm_mesure_calibrageWhereInput | tm_mesure_calibrageWhereInput[]
    Id_Mesure_Calibrage?: IntFilter<"tm_mesure_calibrage"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesure_calibrage"> | number
    Valeur?: FloatFilter<"tm_mesure_calibrage"> | number
    Valeur_Brute?: FloatFilter<"tm_mesure_calibrage"> | number
    Sonde_Numero_Serie?: StringFilter<"tm_mesure_calibrage"> | string
    Est_Valeur_Null?: IntFilter<"tm_mesure_calibrage"> | number
    Date_Heure?: DateTimeFilter<"tm_mesure_calibrage"> | Date | string
  }, "Id_Mesure_Calibrage_Id_Serveur_BDD">

  export type tm_mesure_calibrageOrderByWithAggregationInput = {
    Id_Mesure_Calibrage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    _count?: tm_mesure_calibrageCountOrderByAggregateInput
    _avg?: tm_mesure_calibrageAvgOrderByAggregateInput
    _max?: tm_mesure_calibrageMaxOrderByAggregateInput
    _min?: tm_mesure_calibrageMinOrderByAggregateInput
    _sum?: tm_mesure_calibrageSumOrderByAggregateInput
  }

  export type tm_mesure_calibrageScalarWhereWithAggregatesInput = {
    AND?: tm_mesure_calibrageScalarWhereWithAggregatesInput | tm_mesure_calibrageScalarWhereWithAggregatesInput[]
    OR?: tm_mesure_calibrageScalarWhereWithAggregatesInput[]
    NOT?: tm_mesure_calibrageScalarWhereWithAggregatesInput | tm_mesure_calibrageScalarWhereWithAggregatesInput[]
    Id_Mesure_Calibrage?: IntWithAggregatesFilter<"tm_mesure_calibrage"> | number
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_mesure_calibrage"> | number
    Valeur?: FloatWithAggregatesFilter<"tm_mesure_calibrage"> | number
    Valeur_Brute?: FloatWithAggregatesFilter<"tm_mesure_calibrage"> | number
    Sonde_Numero_Serie?: StringWithAggregatesFilter<"tm_mesure_calibrage"> | string
    Est_Valeur_Null?: IntWithAggregatesFilter<"tm_mesure_calibrage"> | number
    Date_Heure?: DateTimeWithAggregatesFilter<"tm_mesure_calibrage"> | Date | string
  }

  export type tm_mesure_calibrage_etalonWhereInput = {
    AND?: tm_mesure_calibrage_etalonWhereInput | tm_mesure_calibrage_etalonWhereInput[]
    OR?: tm_mesure_calibrage_etalonWhereInput[]
    NOT?: tm_mesure_calibrage_etalonWhereInput | tm_mesure_calibrage_etalonWhereInput[]
    Id_Mesure_Calibrage_Etalon?: IntFilter<"tm_mesure_calibrage_etalon"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesure_calibrage_etalon"> | number
    Valeur?: FloatFilter<"tm_mesure_calibrage_etalon"> | number
    Valeur_Brute?: FloatFilter<"tm_mesure_calibrage_etalon"> | number
    Etalon_Numero_Serie?: StringFilter<"tm_mesure_calibrage_etalon"> | string
    Est_Valeur_Null?: IntFilter<"tm_mesure_calibrage_etalon"> | number
    Date_Heure?: DateTimeFilter<"tm_mesure_calibrage_etalon"> | Date | string
  }

  export type tm_mesure_calibrage_etalonOrderByWithRelationInput = {
    Id_Mesure_Calibrage_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_calibrage_etalonWhereUniqueInput = Prisma.AtLeast<{
    Id_Mesure_Calibrage_Etalon_Id_Serveur_BDD?: tm_mesure_calibrage_etalonId_Mesure_Calibrage_EtalonId_Serveur_BDDCompoundUniqueInput
    AND?: tm_mesure_calibrage_etalonWhereInput | tm_mesure_calibrage_etalonWhereInput[]
    OR?: tm_mesure_calibrage_etalonWhereInput[]
    NOT?: tm_mesure_calibrage_etalonWhereInput | tm_mesure_calibrage_etalonWhereInput[]
    Id_Mesure_Calibrage_Etalon?: IntFilter<"tm_mesure_calibrage_etalon"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesure_calibrage_etalon"> | number
    Valeur?: FloatFilter<"tm_mesure_calibrage_etalon"> | number
    Valeur_Brute?: FloatFilter<"tm_mesure_calibrage_etalon"> | number
    Etalon_Numero_Serie?: StringFilter<"tm_mesure_calibrage_etalon"> | string
    Est_Valeur_Null?: IntFilter<"tm_mesure_calibrage_etalon"> | number
    Date_Heure?: DateTimeFilter<"tm_mesure_calibrage_etalon"> | Date | string
  }, "Id_Mesure_Calibrage_Etalon_Id_Serveur_BDD">

  export type tm_mesure_calibrage_etalonOrderByWithAggregationInput = {
    Id_Mesure_Calibrage_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    _count?: tm_mesure_calibrage_etalonCountOrderByAggregateInput
    _avg?: tm_mesure_calibrage_etalonAvgOrderByAggregateInput
    _max?: tm_mesure_calibrage_etalonMaxOrderByAggregateInput
    _min?: tm_mesure_calibrage_etalonMinOrderByAggregateInput
    _sum?: tm_mesure_calibrage_etalonSumOrderByAggregateInput
  }

  export type tm_mesure_calibrage_etalonScalarWhereWithAggregatesInput = {
    AND?: tm_mesure_calibrage_etalonScalarWhereWithAggregatesInput | tm_mesure_calibrage_etalonScalarWhereWithAggregatesInput[]
    OR?: tm_mesure_calibrage_etalonScalarWhereWithAggregatesInput[]
    NOT?: tm_mesure_calibrage_etalonScalarWhereWithAggregatesInput | tm_mesure_calibrage_etalonScalarWhereWithAggregatesInput[]
    Id_Mesure_Calibrage_Etalon?: IntWithAggregatesFilter<"tm_mesure_calibrage_etalon"> | number
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_mesure_calibrage_etalon"> | number
    Valeur?: FloatWithAggregatesFilter<"tm_mesure_calibrage_etalon"> | number
    Valeur_Brute?: FloatWithAggregatesFilter<"tm_mesure_calibrage_etalon"> | number
    Etalon_Numero_Serie?: StringWithAggregatesFilter<"tm_mesure_calibrage_etalon"> | string
    Est_Valeur_Null?: IntWithAggregatesFilter<"tm_mesure_calibrage_etalon"> | number
    Date_Heure?: DateTimeWithAggregatesFilter<"tm_mesure_calibrage_etalon"> | Date | string
  }

  export type tm_mesure_etalonWhereInput = {
    AND?: tm_mesure_etalonWhereInput | tm_mesure_etalonWhereInput[]
    OR?: tm_mesure_etalonWhereInput[]
    NOT?: tm_mesure_etalonWhereInput | tm_mesure_etalonWhereInput[]
    Id_Mesure_Etalon?: IntFilter<"tm_mesure_etalon"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesure_etalon"> | number
    Valeur_Brute?: FloatFilter<"tm_mesure_etalon"> | number
    Etalon_Numero_Serie?: StringFilter<"tm_mesure_etalon"> | string
    Est_Valeur_Null?: IntFilter<"tm_mesure_etalon"> | number
    Date_Heure?: DateTimeFilter<"tm_mesure_etalon"> | Date | string
    Message_Erreur?: StringFilter<"tm_mesure_etalon"> | string
  }

  export type tm_mesure_etalonOrderByWithRelationInput = {
    Id_Mesure_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Message_Erreur?: SortOrder
  }

  export type tm_mesure_etalonWhereUniqueInput = Prisma.AtLeast<{
    Id_Mesure_Etalon_Id_Serveur_BDD?: tm_mesure_etalonId_Mesure_EtalonId_Serveur_BDDCompoundUniqueInput
    AND?: tm_mesure_etalonWhereInput | tm_mesure_etalonWhereInput[]
    OR?: tm_mesure_etalonWhereInput[]
    NOT?: tm_mesure_etalonWhereInput | tm_mesure_etalonWhereInput[]
    Id_Mesure_Etalon?: IntFilter<"tm_mesure_etalon"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesure_etalon"> | number
    Valeur_Brute?: FloatFilter<"tm_mesure_etalon"> | number
    Etalon_Numero_Serie?: StringFilter<"tm_mesure_etalon"> | string
    Est_Valeur_Null?: IntFilter<"tm_mesure_etalon"> | number
    Date_Heure?: DateTimeFilter<"tm_mesure_etalon"> | Date | string
    Message_Erreur?: StringFilter<"tm_mesure_etalon"> | string
  }, "Id_Mesure_Etalon_Id_Serveur_BDD">

  export type tm_mesure_etalonOrderByWithAggregationInput = {
    Id_Mesure_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Message_Erreur?: SortOrder
    _count?: tm_mesure_etalonCountOrderByAggregateInput
    _avg?: tm_mesure_etalonAvgOrderByAggregateInput
    _max?: tm_mesure_etalonMaxOrderByAggregateInput
    _min?: tm_mesure_etalonMinOrderByAggregateInput
    _sum?: tm_mesure_etalonSumOrderByAggregateInput
  }

  export type tm_mesure_etalonScalarWhereWithAggregatesInput = {
    AND?: tm_mesure_etalonScalarWhereWithAggregatesInput | tm_mesure_etalonScalarWhereWithAggregatesInput[]
    OR?: tm_mesure_etalonScalarWhereWithAggregatesInput[]
    NOT?: tm_mesure_etalonScalarWhereWithAggregatesInput | tm_mesure_etalonScalarWhereWithAggregatesInput[]
    Id_Mesure_Etalon?: IntWithAggregatesFilter<"tm_mesure_etalon"> | number
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_mesure_etalon"> | number
    Valeur_Brute?: FloatWithAggregatesFilter<"tm_mesure_etalon"> | number
    Etalon_Numero_Serie?: StringWithAggregatesFilter<"tm_mesure_etalon"> | string
    Est_Valeur_Null?: IntWithAggregatesFilter<"tm_mesure_etalon"> | number
    Date_Heure?: DateTimeWithAggregatesFilter<"tm_mesure_etalon"> | Date | string
    Message_Erreur?: StringWithAggregatesFilter<"tm_mesure_etalon"> | string
  }

  export type tm_mesure_etalonnageWhereInput = {
    AND?: tm_mesure_etalonnageWhereInput | tm_mesure_etalonnageWhereInput[]
    OR?: tm_mesure_etalonnageWhereInput[]
    NOT?: tm_mesure_etalonnageWhereInput | tm_mesure_etalonnageWhereInput[]
    Id_Mesure_Etalonnage?: IntFilter<"tm_mesure_etalonnage"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesure_etalonnage"> | number
    Sonde_Numero_serie?: StringNullableFilter<"tm_mesure_etalonnage"> | string | null
    Numero_Ordre?: IntNullableFilter<"tm_mesure_etalonnage"> | number | null
    Mesure_Sonde?: FloatNullableFilter<"tm_mesure_etalonnage"> | number | null
    Mesure_Etalon?: FloatNullableFilter<"tm_mesure_etalonnage"> | number | null
    Date_Heure?: DateTimeNullableFilter<"tm_mesure_etalonnage"> | Date | string | null
  }

  export type tm_mesure_etalonnageOrderByWithRelationInput = {
    Id_Mesure_Etalonnage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Sonde_Numero_serie?: SortOrderInput | SortOrder
    Numero_Ordre?: SortOrderInput | SortOrder
    Mesure_Sonde?: SortOrderInput | SortOrder
    Mesure_Etalon?: SortOrderInput | SortOrder
    Date_Heure?: SortOrderInput | SortOrder
  }

  export type tm_mesure_etalonnageWhereUniqueInput = Prisma.AtLeast<{
    Id_Mesure_Etalonnage_Id_Serveur_BDD?: tm_mesure_etalonnageId_Mesure_EtalonnageId_Serveur_BDDCompoundUniqueInput
    AND?: tm_mesure_etalonnageWhereInput | tm_mesure_etalonnageWhereInput[]
    OR?: tm_mesure_etalonnageWhereInput[]
    NOT?: tm_mesure_etalonnageWhereInput | tm_mesure_etalonnageWhereInput[]
    Id_Mesure_Etalonnage?: IntFilter<"tm_mesure_etalonnage"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesure_etalonnage"> | number
    Sonde_Numero_serie?: StringNullableFilter<"tm_mesure_etalonnage"> | string | null
    Numero_Ordre?: IntNullableFilter<"tm_mesure_etalonnage"> | number | null
    Mesure_Sonde?: FloatNullableFilter<"tm_mesure_etalonnage"> | number | null
    Mesure_Etalon?: FloatNullableFilter<"tm_mesure_etalonnage"> | number | null
    Date_Heure?: DateTimeNullableFilter<"tm_mesure_etalonnage"> | Date | string | null
  }, "Id_Mesure_Etalonnage_Id_Serveur_BDD">

  export type tm_mesure_etalonnageOrderByWithAggregationInput = {
    Id_Mesure_Etalonnage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Sonde_Numero_serie?: SortOrderInput | SortOrder
    Numero_Ordre?: SortOrderInput | SortOrder
    Mesure_Sonde?: SortOrderInput | SortOrder
    Mesure_Etalon?: SortOrderInput | SortOrder
    Date_Heure?: SortOrderInput | SortOrder
    _count?: tm_mesure_etalonnageCountOrderByAggregateInput
    _avg?: tm_mesure_etalonnageAvgOrderByAggregateInput
    _max?: tm_mesure_etalonnageMaxOrderByAggregateInput
    _min?: tm_mesure_etalonnageMinOrderByAggregateInput
    _sum?: tm_mesure_etalonnageSumOrderByAggregateInput
  }

  export type tm_mesure_etalonnageScalarWhereWithAggregatesInput = {
    AND?: tm_mesure_etalonnageScalarWhereWithAggregatesInput | tm_mesure_etalonnageScalarWhereWithAggregatesInput[]
    OR?: tm_mesure_etalonnageScalarWhereWithAggregatesInput[]
    NOT?: tm_mesure_etalonnageScalarWhereWithAggregatesInput | tm_mesure_etalonnageScalarWhereWithAggregatesInput[]
    Id_Mesure_Etalonnage?: IntWithAggregatesFilter<"tm_mesure_etalonnage"> | number
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_mesure_etalonnage"> | number
    Sonde_Numero_serie?: StringNullableWithAggregatesFilter<"tm_mesure_etalonnage"> | string | null
    Numero_Ordre?: IntNullableWithAggregatesFilter<"tm_mesure_etalonnage"> | number | null
    Mesure_Sonde?: FloatNullableWithAggregatesFilter<"tm_mesure_etalonnage"> | number | null
    Mesure_Etalon?: FloatNullableWithAggregatesFilter<"tm_mesure_etalonnage"> | number | null
    Date_Heure?: DateTimeNullableWithAggregatesFilter<"tm_mesure_etalonnage"> | Date | string | null
  }

  export type tm_mesures_histoWhereInput = {
    AND?: tm_mesures_histoWhereInput | tm_mesures_histoWhereInput[]
    OR?: tm_mesures_histoWhereInput[]
    NOT?: tm_mesures_histoWhereInput | tm_mesures_histoWhereInput[]
    Id_Mesure?: IntFilter<"tm_mesures_histo"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesures_histo"> | number
    Date_Heure_Mesure?: DateTimeFilter<"tm_mesures_histo"> | Date | string
    Valeur?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Valeur_Brute?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Nb_decimal?: IntNullableFilter<"tm_mesures_histo"> | number | null
    Consigne?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Consigne_Sup?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Consigne_Inf?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Unite?: StringNullableFilter<"tm_mesures_histo"> | string | null
    Sonde_Numero_Serie?: StringNullableFilter<"tm_mesures_histo"> | string | null
    Id_Lieu?: IntFilter<"tm_mesures_histo"> | number
    Est_Valeur_Null?: IntFilter<"tm_mesures_histo"> | number
    Frequence?: IntNullableFilter<"tm_mesures_histo"> | number | null
    Est_En_Alarme?: BoolNullableFilter<"tm_mesures_histo"> | boolean | null
    Consigne_Inf_Pre_Alarme?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Consigne_Sup_Pre_Alarme?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Moyenne?: FloatNullableFilter<"tm_mesures_histo"> | number | null
  }

  export type tm_mesures_histoOrderByWithRelationInput = {
    Id_Mesure?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Valeur_Brute?: SortOrderInput | SortOrder
    Nb_decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    Sonde_Numero_Serie?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Est_En_Alarme?: SortOrderInput | SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrderInput | SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrderInput | SortOrder
    Moyenne?: SortOrderInput | SortOrder
  }

  export type tm_mesures_histoWhereUniqueInput = Prisma.AtLeast<{
    Id_Mesure_Id_Serveur_BDD_Date_Heure_Mesure_Id_Lieu_Est_Valeur_Null?: tm_mesures_histoId_MesureId_Serveur_BDDDate_Heure_MesureId_LieuEst_Valeur_NullCompoundUniqueInput
    AND?: tm_mesures_histoWhereInput | tm_mesures_histoWhereInput[]
    OR?: tm_mesures_histoWhereInput[]
    NOT?: tm_mesures_histoWhereInput | tm_mesures_histoWhereInput[]
    Id_Mesure?: IntFilter<"tm_mesures_histo"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesures_histo"> | number
    Date_Heure_Mesure?: DateTimeFilter<"tm_mesures_histo"> | Date | string
    Valeur?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Valeur_Brute?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Nb_decimal?: IntNullableFilter<"tm_mesures_histo"> | number | null
    Consigne?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Consigne_Sup?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Consigne_Inf?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Unite?: StringNullableFilter<"tm_mesures_histo"> | string | null
    Sonde_Numero_Serie?: StringNullableFilter<"tm_mesures_histo"> | string | null
    Id_Lieu?: IntFilter<"tm_mesures_histo"> | number
    Est_Valeur_Null?: IntFilter<"tm_mesures_histo"> | number
    Frequence?: IntNullableFilter<"tm_mesures_histo"> | number | null
    Est_En_Alarme?: BoolNullableFilter<"tm_mesures_histo"> | boolean | null
    Consigne_Inf_Pre_Alarme?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Consigne_Sup_Pre_Alarme?: FloatNullableFilter<"tm_mesures_histo"> | number | null
    Moyenne?: FloatNullableFilter<"tm_mesures_histo"> | number | null
  }, "Id_Mesure_Id_Serveur_BDD_Date_Heure_Mesure_Id_Lieu_Est_Valeur_Null">

  export type tm_mesures_histoOrderByWithAggregationInput = {
    Id_Mesure?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Valeur_Brute?: SortOrderInput | SortOrder
    Nb_decimal?: SortOrderInput | SortOrder
    Consigne?: SortOrderInput | SortOrder
    Consigne_Sup?: SortOrderInput | SortOrder
    Consigne_Inf?: SortOrderInput | SortOrder
    Unite?: SortOrderInput | SortOrder
    Sonde_Numero_Serie?: SortOrderInput | SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrderInput | SortOrder
    Est_En_Alarme?: SortOrderInput | SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrderInput | SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrderInput | SortOrder
    Moyenne?: SortOrderInput | SortOrder
    _count?: tm_mesures_histoCountOrderByAggregateInput
    _avg?: tm_mesures_histoAvgOrderByAggregateInput
    _max?: tm_mesures_histoMaxOrderByAggregateInput
    _min?: tm_mesures_histoMinOrderByAggregateInput
    _sum?: tm_mesures_histoSumOrderByAggregateInput
  }

  export type tm_mesures_histoScalarWhereWithAggregatesInput = {
    AND?: tm_mesures_histoScalarWhereWithAggregatesInput | tm_mesures_histoScalarWhereWithAggregatesInput[]
    OR?: tm_mesures_histoScalarWhereWithAggregatesInput[]
    NOT?: tm_mesures_histoScalarWhereWithAggregatesInput | tm_mesures_histoScalarWhereWithAggregatesInput[]
    Id_Mesure?: IntWithAggregatesFilter<"tm_mesures_histo"> | number
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_mesures_histo"> | number
    Date_Heure_Mesure?: DateTimeWithAggregatesFilter<"tm_mesures_histo"> | Date | string
    Valeur?: FloatNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
    Valeur_Brute?: FloatNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
    Nb_decimal?: IntNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
    Consigne?: FloatNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
    Consigne_Sup?: FloatNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
    Consigne_Inf?: FloatNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
    Unite?: StringNullableWithAggregatesFilter<"tm_mesures_histo"> | string | null
    Sonde_Numero_Serie?: StringNullableWithAggregatesFilter<"tm_mesures_histo"> | string | null
    Id_Lieu?: IntWithAggregatesFilter<"tm_mesures_histo"> | number
    Est_Valeur_Null?: IntWithAggregatesFilter<"tm_mesures_histo"> | number
    Frequence?: IntNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
    Est_En_Alarme?: BoolNullableWithAggregatesFilter<"tm_mesures_histo"> | boolean | null
    Consigne_Inf_Pre_Alarme?: FloatNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
    Consigne_Sup_Pre_Alarme?: FloatNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
    Moyenne?: FloatNullableWithAggregatesFilter<"tm_mesures_histo"> | number | null
  }

  export type tm_mesures_testWhereInput = {
    AND?: tm_mesures_testWhereInput | tm_mesures_testWhereInput[]
    OR?: tm_mesures_testWhereInput[]
    NOT?: tm_mesures_testWhereInput | tm_mesures_testWhereInput[]
    Id_Mesure_Test?: IntFilter<"tm_mesures_test"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesures_test"> | number
    Valeur_Brute?: FloatFilter<"tm_mesures_test"> | number
    Sonde_Numero_Serie?: StringFilter<"tm_mesures_test"> | string
    Est_Valeur_Null?: IntFilter<"tm_mesures_test"> | number
    Date_Heure?: DateTimeFilter<"tm_mesures_test"> | Date | string
    Nombre_Total?: IntFilter<"tm_mesures_test"> | number
    Nombre_Recu?: IntFilter<"tm_mesures_test"> | number
  }

  export type tm_mesures_testOrderByWithRelationInput = {
    Id_Mesure_Test?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_testWhereUniqueInput = Prisma.AtLeast<{
    Sonde_Numero_Serie?: string
    Id_Mesure_Test_Id_Serveur_BDD?: tm_mesures_testId_Mesure_TestId_Serveur_BDDCompoundUniqueInput
    AND?: tm_mesures_testWhereInput | tm_mesures_testWhereInput[]
    OR?: tm_mesures_testWhereInput[]
    NOT?: tm_mesures_testWhereInput | tm_mesures_testWhereInput[]
    Id_Mesure_Test?: IntFilter<"tm_mesures_test"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesures_test"> | number
    Valeur_Brute?: FloatFilter<"tm_mesures_test"> | number
    Est_Valeur_Null?: IntFilter<"tm_mesures_test"> | number
    Date_Heure?: DateTimeFilter<"tm_mesures_test"> | Date | string
    Nombre_Total?: IntFilter<"tm_mesures_test"> | number
    Nombre_Recu?: IntFilter<"tm_mesures_test"> | number
  }, "Id_Mesure_Test_Id_Serveur_BDD" | "Sonde_Numero_Serie">

  export type tm_mesures_testOrderByWithAggregationInput = {
    Id_Mesure_Test?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
    _count?: tm_mesures_testCountOrderByAggregateInput
    _avg?: tm_mesures_testAvgOrderByAggregateInput
    _max?: tm_mesures_testMaxOrderByAggregateInput
    _min?: tm_mesures_testMinOrderByAggregateInput
    _sum?: tm_mesures_testSumOrderByAggregateInput
  }

  export type tm_mesures_testScalarWhereWithAggregatesInput = {
    AND?: tm_mesures_testScalarWhereWithAggregatesInput | tm_mesures_testScalarWhereWithAggregatesInput[]
    OR?: tm_mesures_testScalarWhereWithAggregatesInput[]
    NOT?: tm_mesures_testScalarWhereWithAggregatesInput | tm_mesures_testScalarWhereWithAggregatesInput[]
    Id_Mesure_Test?: IntWithAggregatesFilter<"tm_mesures_test"> | number
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_mesures_test"> | number
    Valeur_Brute?: FloatWithAggregatesFilter<"tm_mesures_test"> | number
    Sonde_Numero_Serie?: StringWithAggregatesFilter<"tm_mesures_test"> | string
    Est_Valeur_Null?: IntWithAggregatesFilter<"tm_mesures_test"> | number
    Date_Heure?: DateTimeWithAggregatesFilter<"tm_mesures_test"> | Date | string
    Nombre_Total?: IntWithAggregatesFilter<"tm_mesures_test"> | number
    Nombre_Recu?: IntWithAggregatesFilter<"tm_mesures_test"> | number
  }

  export type tm_mesures_test_etalonWhereInput = {
    AND?: tm_mesures_test_etalonWhereInput | tm_mesures_test_etalonWhereInput[]
    OR?: tm_mesures_test_etalonWhereInput[]
    NOT?: tm_mesures_test_etalonWhereInput | tm_mesures_test_etalonWhereInput[]
    Id_Mesure_Test_Etalon?: IntFilter<"tm_mesures_test_etalon"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesures_test_etalon"> | number
    Valeur_Brute?: FloatFilter<"tm_mesures_test_etalon"> | number
    Etalon_Numero_Serie?: StringFilter<"tm_mesures_test_etalon"> | string
    Est_Valeur_Null?: IntFilter<"tm_mesures_test_etalon"> | number
    Date_Heure?: DateTimeFilter<"tm_mesures_test_etalon"> | Date | string
    Nombre_Total?: IntFilter<"tm_mesures_test_etalon"> | number
    Nombre_Recu?: IntFilter<"tm_mesures_test_etalon"> | number
  }

  export type tm_mesures_test_etalonOrderByWithRelationInput = {
    Id_Mesure_Test_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_test_etalonWhereUniqueInput = Prisma.AtLeast<{
    Etalon_Numero_Serie?: string
    Id_Mesure_Test_Etalon_Id_Serveur_BDD?: tm_mesures_test_etalonId_Mesure_Test_EtalonId_Serveur_BDDCompoundUniqueInput
    AND?: tm_mesures_test_etalonWhereInput | tm_mesures_test_etalonWhereInput[]
    OR?: tm_mesures_test_etalonWhereInput[]
    NOT?: tm_mesures_test_etalonWhereInput | tm_mesures_test_etalonWhereInput[]
    Id_Mesure_Test_Etalon?: IntFilter<"tm_mesures_test_etalon"> | number
    Id_Serveur_BDD?: IntFilter<"tm_mesures_test_etalon"> | number
    Valeur_Brute?: FloatFilter<"tm_mesures_test_etalon"> | number
    Est_Valeur_Null?: IntFilter<"tm_mesures_test_etalon"> | number
    Date_Heure?: DateTimeFilter<"tm_mesures_test_etalon"> | Date | string
    Nombre_Total?: IntFilter<"tm_mesures_test_etalon"> | number
    Nombre_Recu?: IntFilter<"tm_mesures_test_etalon"> | number
  }, "Id_Mesure_Test_Etalon_Id_Serveur_BDD" | "Etalon_Numero_Serie">

  export type tm_mesures_test_etalonOrderByWithAggregationInput = {
    Id_Mesure_Test_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
    _count?: tm_mesures_test_etalonCountOrderByAggregateInput
    _avg?: tm_mesures_test_etalonAvgOrderByAggregateInput
    _max?: tm_mesures_test_etalonMaxOrderByAggregateInput
    _min?: tm_mesures_test_etalonMinOrderByAggregateInput
    _sum?: tm_mesures_test_etalonSumOrderByAggregateInput
  }

  export type tm_mesures_test_etalonScalarWhereWithAggregatesInput = {
    AND?: tm_mesures_test_etalonScalarWhereWithAggregatesInput | tm_mesures_test_etalonScalarWhereWithAggregatesInput[]
    OR?: tm_mesures_test_etalonScalarWhereWithAggregatesInput[]
    NOT?: tm_mesures_test_etalonScalarWhereWithAggregatesInput | tm_mesures_test_etalonScalarWhereWithAggregatesInput[]
    Id_Mesure_Test_Etalon?: IntWithAggregatesFilter<"tm_mesures_test_etalon"> | number
    Id_Serveur_BDD?: IntWithAggregatesFilter<"tm_mesures_test_etalon"> | number
    Valeur_Brute?: FloatWithAggregatesFilter<"tm_mesures_test_etalon"> | number
    Etalon_Numero_Serie?: StringWithAggregatesFilter<"tm_mesures_test_etalon"> | string
    Est_Valeur_Null?: IntWithAggregatesFilter<"tm_mesures_test_etalon"> | number
    Date_Heure?: DateTimeWithAggregatesFilter<"tm_mesures_test_etalon"> | Date | string
    Nombre_Total?: IntWithAggregatesFilter<"tm_mesures_test_etalon"> | number
    Nombre_Recu?: IntWithAggregatesFilter<"tm_mesures_test_etalon"> | number
  }

  export type tm_mode_degradeWhereInput = {
    AND?: tm_mode_degradeWhereInput | tm_mode_degradeWhereInput[]
    OR?: tm_mode_degradeWhereInput[]
    NOT?: tm_mode_degradeWhereInput | tm_mode_degradeWhereInput[]
    Id_Mode_Degrade?: IntFilter<"tm_mode_degrade"> | number
    Id_Utilisateur?: IntNullableFilter<"tm_mode_degrade"> | number | null
    Date_Heure_Creation?: DateTimeNullableFilter<"tm_mode_degrade"> | Date | string | null
    Requete_SQL?: StringNullableFilter<"tm_mode_degrade"> | string | null
    Est_Archivee?: BoolFilter<"tm_mode_degrade"> | boolean
    Date_Heure_Archive?: DateTimeNullableFilter<"tm_mode_degrade"> | Date | string | null
  }

  export type tm_mode_degradeOrderByWithRelationInput = {
    Id_Mode_Degrade?: SortOrder
    Id_Utilisateur?: SortOrderInput | SortOrder
    Date_Heure_Creation?: SortOrderInput | SortOrder
    Requete_SQL?: SortOrderInput | SortOrder
    Est_Archivee?: SortOrder
    Date_Heure_Archive?: SortOrderInput | SortOrder
  }

  export type tm_mode_degradeWhereUniqueInput = Prisma.AtLeast<{
    Id_Mode_Degrade?: number
    AND?: tm_mode_degradeWhereInput | tm_mode_degradeWhereInput[]
    OR?: tm_mode_degradeWhereInput[]
    NOT?: tm_mode_degradeWhereInput | tm_mode_degradeWhereInput[]
    Id_Utilisateur?: IntNullableFilter<"tm_mode_degrade"> | number | null
    Date_Heure_Creation?: DateTimeNullableFilter<"tm_mode_degrade"> | Date | string | null
    Requete_SQL?: StringNullableFilter<"tm_mode_degrade"> | string | null
    Est_Archivee?: BoolFilter<"tm_mode_degrade"> | boolean
    Date_Heure_Archive?: DateTimeNullableFilter<"tm_mode_degrade"> | Date | string | null
  }, "Id_Mode_Degrade">

  export type tm_mode_degradeOrderByWithAggregationInput = {
    Id_Mode_Degrade?: SortOrder
    Id_Utilisateur?: SortOrderInput | SortOrder
    Date_Heure_Creation?: SortOrderInput | SortOrder
    Requete_SQL?: SortOrderInput | SortOrder
    Est_Archivee?: SortOrder
    Date_Heure_Archive?: SortOrderInput | SortOrder
    _count?: tm_mode_degradeCountOrderByAggregateInput
    _avg?: tm_mode_degradeAvgOrderByAggregateInput
    _max?: tm_mode_degradeMaxOrderByAggregateInput
    _min?: tm_mode_degradeMinOrderByAggregateInput
    _sum?: tm_mode_degradeSumOrderByAggregateInput
  }

  export type tm_mode_degradeScalarWhereWithAggregatesInput = {
    AND?: tm_mode_degradeScalarWhereWithAggregatesInput | tm_mode_degradeScalarWhereWithAggregatesInput[]
    OR?: tm_mode_degradeScalarWhereWithAggregatesInput[]
    NOT?: tm_mode_degradeScalarWhereWithAggregatesInput | tm_mode_degradeScalarWhereWithAggregatesInput[]
    Id_Mode_Degrade?: IntWithAggregatesFilter<"tm_mode_degrade"> | number
    Id_Utilisateur?: IntNullableWithAggregatesFilter<"tm_mode_degrade"> | number | null
    Date_Heure_Creation?: DateTimeNullableWithAggregatesFilter<"tm_mode_degrade"> | Date | string | null
    Requete_SQL?: StringNullableWithAggregatesFilter<"tm_mode_degrade"> | string | null
    Est_Archivee?: BoolWithAggregatesFilter<"tm_mode_degrade"> | boolean
    Date_Heure_Archive?: DateTimeNullableWithAggregatesFilter<"tm_mode_degrade"> | Date | string | null
  }

  export type tm_parametreWhereInput = {
    AND?: tm_parametreWhereInput | tm_parametreWhereInput[]
    OR?: tm_parametreWhereInput[]
    NOT?: tm_parametreWhereInput | tm_parametreWhereInput[]
    Id_Parametre?: IntFilter<"tm_parametre"> | number
    Cle_Parametre?: StringFilter<"tm_parametre"> | string
    Valeur_Parametre?: StringNullableFilter<"tm_parametre"> | string | null
    Groupe_Parametre?: StringNullableFilter<"tm_parametre"> | string | null
    Commentaire_Parametre?: StringNullableFilter<"tm_parametre"> | string | null
  }

  export type tm_parametreOrderByWithRelationInput = {
    Id_Parametre?: SortOrder
    Cle_Parametre?: SortOrder
    Valeur_Parametre?: SortOrderInput | SortOrder
    Groupe_Parametre?: SortOrderInput | SortOrder
    Commentaire_Parametre?: SortOrderInput | SortOrder
  }

  export type tm_parametreWhereUniqueInput = Prisma.AtLeast<{
    Id_Parametre_Cle_Parametre?: tm_parametreId_ParametreCle_ParametreCompoundUniqueInput
    AND?: tm_parametreWhereInput | tm_parametreWhereInput[]
    OR?: tm_parametreWhereInput[]
    NOT?: tm_parametreWhereInput | tm_parametreWhereInput[]
    Id_Parametre?: IntFilter<"tm_parametre"> | number
    Cle_Parametre?: StringFilter<"tm_parametre"> | string
    Valeur_Parametre?: StringNullableFilter<"tm_parametre"> | string | null
    Groupe_Parametre?: StringNullableFilter<"tm_parametre"> | string | null
    Commentaire_Parametre?: StringNullableFilter<"tm_parametre"> | string | null
  }, "Id_Parametre_Cle_Parametre">

  export type tm_parametreOrderByWithAggregationInput = {
    Id_Parametre?: SortOrder
    Cle_Parametre?: SortOrder
    Valeur_Parametre?: SortOrderInput | SortOrder
    Groupe_Parametre?: SortOrderInput | SortOrder
    Commentaire_Parametre?: SortOrderInput | SortOrder
    _count?: tm_parametreCountOrderByAggregateInput
    _avg?: tm_parametreAvgOrderByAggregateInput
    _max?: tm_parametreMaxOrderByAggregateInput
    _min?: tm_parametreMinOrderByAggregateInput
    _sum?: tm_parametreSumOrderByAggregateInput
  }

  export type tm_parametreScalarWhereWithAggregatesInput = {
    AND?: tm_parametreScalarWhereWithAggregatesInput | tm_parametreScalarWhereWithAggregatesInput[]
    OR?: tm_parametreScalarWhereWithAggregatesInput[]
    NOT?: tm_parametreScalarWhereWithAggregatesInput | tm_parametreScalarWhereWithAggregatesInput[]
    Id_Parametre?: IntWithAggregatesFilter<"tm_parametre"> | number
    Cle_Parametre?: StringWithAggregatesFilter<"tm_parametre"> | string
    Valeur_Parametre?: StringNullableWithAggregatesFilter<"tm_parametre"> | string | null
    Groupe_Parametre?: StringNullableWithAggregatesFilter<"tm_parametre"> | string | null
    Commentaire_Parametre?: StringNullableWithAggregatesFilter<"tm_parametre"> | string | null
  }

  export type tm_vigilog_mesureWhereInput = {
    AND?: tm_vigilog_mesureWhereInput | tm_vigilog_mesureWhereInput[]
    OR?: tm_vigilog_mesureWhereInput[]
    NOT?: tm_vigilog_mesureWhereInput | tm_vigilog_mesureWhereInput[]
    Id_VigiLog_Mesure?: IntFilter<"tm_vigilog_mesure"> | number
    Id_VigiLog_Tournee?: IntFilter<"tm_vigilog_mesure"> | number
    Numero_Ordre?: IntNullableFilter<"tm_vigilog_mesure"> | number | null
    Date_Heure_Mesure?: DateTimeFilter<"tm_vigilog_mesure"> | Date | string
    Valeur?: DecimalNullableFilter<"tm_vigilog_mesure"> | Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: BoolFilter<"tm_vigilog_mesure"> | boolean
    Est_En_Alarme?: BoolFilter<"tm_vigilog_mesure"> | boolean
    Est_Marqueur?: BoolFilter<"tm_vigilog_mesure"> | boolean
    Details?: StringNullableFilter<"tm_vigilog_mesure"> | string | null
    Date_Heure_Import?: DateTimeFilter<"tm_vigilog_mesure"> | Date | string
  }

  export type tm_vigilog_mesureOrderByWithRelationInput = {
    Id_VigiLog_Mesure?: SortOrder
    Id_VigiLog_Tournee?: SortOrder
    Numero_Ordre?: SortOrderInput | SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Est_Hors_Limites?: SortOrder
    Est_En_Alarme?: SortOrder
    Est_Marqueur?: SortOrder
    Details?: SortOrderInput | SortOrder
    Date_Heure_Import?: SortOrder
  }

  export type tm_vigilog_mesureWhereUniqueInput = Prisma.AtLeast<{
    Id_VigiLog_Mesure?: number
    Id_VigiLog_Tournee_Date_Heure_Mesure_Numero_Ordre?: tm_vigilog_mesureId_VigiLog_TourneeDate_Heure_MesureNumero_OrdreCompoundUniqueInput
    AND?: tm_vigilog_mesureWhereInput | tm_vigilog_mesureWhereInput[]
    OR?: tm_vigilog_mesureWhereInput[]
    NOT?: tm_vigilog_mesureWhereInput | tm_vigilog_mesureWhereInput[]
    Id_VigiLog_Tournee?: IntFilter<"tm_vigilog_mesure"> | number
    Numero_Ordre?: IntNullableFilter<"tm_vigilog_mesure"> | number | null
    Date_Heure_Mesure?: DateTimeFilter<"tm_vigilog_mesure"> | Date | string
    Valeur?: DecimalNullableFilter<"tm_vigilog_mesure"> | Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: BoolFilter<"tm_vigilog_mesure"> | boolean
    Est_En_Alarme?: BoolFilter<"tm_vigilog_mesure"> | boolean
    Est_Marqueur?: BoolFilter<"tm_vigilog_mesure"> | boolean
    Details?: StringNullableFilter<"tm_vigilog_mesure"> | string | null
    Date_Heure_Import?: DateTimeFilter<"tm_vigilog_mesure"> | Date | string
  }, "Id_VigiLog_Mesure" | "Id_VigiLog_Tournee_Date_Heure_Mesure_Numero_Ordre">

  export type tm_vigilog_mesureOrderByWithAggregationInput = {
    Id_VigiLog_Mesure?: SortOrder
    Id_VigiLog_Tournee?: SortOrder
    Numero_Ordre?: SortOrderInput | SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrderInput | SortOrder
    Est_Hors_Limites?: SortOrder
    Est_En_Alarme?: SortOrder
    Est_Marqueur?: SortOrder
    Details?: SortOrderInput | SortOrder
    Date_Heure_Import?: SortOrder
    _count?: tm_vigilog_mesureCountOrderByAggregateInput
    _avg?: tm_vigilog_mesureAvgOrderByAggregateInput
    _max?: tm_vigilog_mesureMaxOrderByAggregateInput
    _min?: tm_vigilog_mesureMinOrderByAggregateInput
    _sum?: tm_vigilog_mesureSumOrderByAggregateInput
  }

  export type tm_vigilog_mesureScalarWhereWithAggregatesInput = {
    AND?: tm_vigilog_mesureScalarWhereWithAggregatesInput | tm_vigilog_mesureScalarWhereWithAggregatesInput[]
    OR?: tm_vigilog_mesureScalarWhereWithAggregatesInput[]
    NOT?: tm_vigilog_mesureScalarWhereWithAggregatesInput | tm_vigilog_mesureScalarWhereWithAggregatesInput[]
    Id_VigiLog_Mesure?: IntWithAggregatesFilter<"tm_vigilog_mesure"> | number
    Id_VigiLog_Tournee?: IntWithAggregatesFilter<"tm_vigilog_mesure"> | number
    Numero_Ordre?: IntNullableWithAggregatesFilter<"tm_vigilog_mesure"> | number | null
    Date_Heure_Mesure?: DateTimeWithAggregatesFilter<"tm_vigilog_mesure"> | Date | string
    Valeur?: DecimalNullableWithAggregatesFilter<"tm_vigilog_mesure"> | Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: BoolWithAggregatesFilter<"tm_vigilog_mesure"> | boolean
    Est_En_Alarme?: BoolWithAggregatesFilter<"tm_vigilog_mesure"> | boolean
    Est_Marqueur?: BoolWithAggregatesFilter<"tm_vigilog_mesure"> | boolean
    Details?: StringNullableWithAggregatesFilter<"tm_vigilog_mesure"> | string | null
    Date_Heure_Import?: DateTimeWithAggregatesFilter<"tm_vigilog_mesure"> | Date | string
  }

  export type tm_journal_commentaire_libreWhereInput = {
    AND?: tm_journal_commentaire_libreWhereInput | tm_journal_commentaire_libreWhereInput[]
    OR?: tm_journal_commentaire_libreWhereInput[]
    NOT?: tm_journal_commentaire_libreWhereInput | tm_journal_commentaire_libreWhereInput[]
    Id_Commentaire_Journal?: IntFilter<"tm_journal_commentaire_libre"> | number
    Code_Journal?: StringFilter<"tm_journal_commentaire_libre"> | string
    Commentaire?: StringFilter<"tm_journal_commentaire_libre"> | string
    Date_Creation?: DateTimeFilter<"tm_journal_commentaire_libre"> | Date | string
    Date_Modification?: DateTimeNullableFilter<"tm_journal_commentaire_libre"> | Date | string | null
  }

  export type tm_journal_commentaire_libreOrderByWithRelationInput = {
    Id_Commentaire_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrderInput | SortOrder
  }

  export type tm_journal_commentaire_libreWhereUniqueInput = Prisma.AtLeast<{
    Id_Commentaire_Journal?: number
    AND?: tm_journal_commentaire_libreWhereInput | tm_journal_commentaire_libreWhereInput[]
    OR?: tm_journal_commentaire_libreWhereInput[]
    NOT?: tm_journal_commentaire_libreWhereInput | tm_journal_commentaire_libreWhereInput[]
    Code_Journal?: StringFilter<"tm_journal_commentaire_libre"> | string
    Commentaire?: StringFilter<"tm_journal_commentaire_libre"> | string
    Date_Creation?: DateTimeFilter<"tm_journal_commentaire_libre"> | Date | string
    Date_Modification?: DateTimeNullableFilter<"tm_journal_commentaire_libre"> | Date | string | null
  }, "Id_Commentaire_Journal">

  export type tm_journal_commentaire_libreOrderByWithAggregationInput = {
    Id_Commentaire_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrderInput | SortOrder
    _count?: tm_journal_commentaire_libreCountOrderByAggregateInput
    _avg?: tm_journal_commentaire_libreAvgOrderByAggregateInput
    _max?: tm_journal_commentaire_libreMaxOrderByAggregateInput
    _min?: tm_journal_commentaire_libreMinOrderByAggregateInput
    _sum?: tm_journal_commentaire_libreSumOrderByAggregateInput
  }

  export type tm_journal_commentaire_libreScalarWhereWithAggregatesInput = {
    AND?: tm_journal_commentaire_libreScalarWhereWithAggregatesInput | tm_journal_commentaire_libreScalarWhereWithAggregatesInput[]
    OR?: tm_journal_commentaire_libreScalarWhereWithAggregatesInput[]
    NOT?: tm_journal_commentaire_libreScalarWhereWithAggregatesInput | tm_journal_commentaire_libreScalarWhereWithAggregatesInput[]
    Id_Commentaire_Journal?: IntWithAggregatesFilter<"tm_journal_commentaire_libre"> | number
    Code_Journal?: StringWithAggregatesFilter<"tm_journal_commentaire_libre"> | string
    Commentaire?: StringWithAggregatesFilter<"tm_journal_commentaire_libre"> | string
    Date_Creation?: DateTimeWithAggregatesFilter<"tm_journal_commentaire_libre"> | Date | string
    Date_Modification?: DateTimeNullableWithAggregatesFilter<"tm_journal_commentaire_libre"> | Date | string | null
  }

  export type tm_graphiqueCreateInput = {
    Id_Graphique?: number
    Date_Heure_Mesure?: Date | string
    Valeur?: number | null
    Valeur_Brute?: number | null
    Nb_Decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    Sonde_Numero_Serie?: string | null
    Adresse_Sonde?: string | null
    Id_Sonde?: number | null
    Id_Lieu: number
    Est_Valeur_Null?: boolean
    Frequence?: number | null
    Est_Etat_Alarme?: number
    Consigne_Inf_Pre_Alarme?: number | null
    Consigne_Sup_Pre_Alarme?: number | null
  }

  export type tm_graphiqueUncheckedCreateInput = {
    Id_Graphique?: number
    Date_Heure_Mesure?: Date | string
    Valeur?: number | null
    Valeur_Brute?: number | null
    Nb_Decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    Sonde_Numero_Serie?: string | null
    Adresse_Sonde?: string | null
    Id_Sonde?: number | null
    Id_Lieu: number
    Est_Valeur_Null?: boolean
    Frequence?: number | null
    Est_Etat_Alarme?: number
    Consigne_Inf_Pre_Alarme?: number | null
    Consigne_Sup_Pre_Alarme?: number | null
  }

  export type tm_graphiqueUpdateInput = {
    Id_Graphique?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_Decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Adresse_Sonde?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Sonde?: NullableIntFieldUpdateOperationsInput | number | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: BoolFieldUpdateOperationsInput | boolean
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_Etat_Alarme?: IntFieldUpdateOperationsInput | number
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type tm_graphiqueUncheckedUpdateInput = {
    Id_Graphique?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_Decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Adresse_Sonde?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Sonde?: NullableIntFieldUpdateOperationsInput | number | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: BoolFieldUpdateOperationsInput | boolean
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_Etat_Alarme?: IntFieldUpdateOperationsInput | number
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type tm_graphiqueCreateManyInput = {
    Date_Heure_Mesure?: Date | string
    Valeur?: number | null
    Valeur_Brute?: number | null
    Nb_Decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    Sonde_Numero_Serie?: string | null
    Adresse_Sonde?: string | null
    Id_Sonde?: number | null
    Id_Lieu: number
    Est_Valeur_Null?: boolean
    Frequence?: number | null
    Est_Etat_Alarme?: number
    Consigne_Inf_Pre_Alarme?: number | null
    Consigne_Sup_Pre_Alarme?: number | null
  }

  export type tm_graphiqueUpdateManyMutationInput = {
    Id_Graphique?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_Decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Adresse_Sonde?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Sonde?: NullableIntFieldUpdateOperationsInput | number | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: BoolFieldUpdateOperationsInput | boolean
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_Etat_Alarme?: IntFieldUpdateOperationsInput | number
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type tm_graphiqueUncheckedUpdateManyInput = {
    Id_Graphique?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_Decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Adresse_Sonde?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Sonde?: NullableIntFieldUpdateOperationsInput | number | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: BoolFieldUpdateOperationsInput | boolean
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_Etat_Alarme?: IntFieldUpdateOperationsInput | number
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type tm_journalCreateInput = {
    Id_Serveur_BDD: number
    Id_Journal?: number
    Code_Journal?: string | null
    Commentaire?: string | null
    Nom_Utilisateur?: string | null
    Profil_Utilisateur?: string | null
    Date_Heure_Journal?: Date | string | null
    Id_Lieu?: number | null
    Commentaire_Utilisateur?: string | null
  }

  export type tm_journalUncheckedCreateInput = {
    Id_Serveur_BDD: number
    Id_Journal?: number
    Code_Journal?: string | null
    Commentaire?: string | null
    Nom_Utilisateur?: string | null
    Profil_Utilisateur?: string | null
    Date_Heure_Journal?: Date | string | null
    Id_Lieu?: number | null
    Commentaire_Utilisateur?: string | null
  }

  export type tm_journalUpdateInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    Nom_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Profil_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Journal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Id_Lieu?: NullableIntFieldUpdateOperationsInput | number | null
    Commentaire_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journalUncheckedUpdateInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    Nom_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Profil_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Journal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Id_Lieu?: NullableIntFieldUpdateOperationsInput | number | null
    Commentaire_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journalCreateManyInput = {
    Id_Serveur_BDD: number
    Code_Journal?: string | null
    Commentaire?: string | null
    Nom_Utilisateur?: string | null
    Profil_Utilisateur?: string | null
    Date_Heure_Journal?: Date | string | null
    Id_Lieu?: number | null
    Commentaire_Utilisateur?: string | null
  }

  export type tm_journalUpdateManyMutationInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    Nom_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Profil_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Journal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Id_Lieu?: NullableIntFieldUpdateOperationsInput | number | null
    Commentaire_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journalUncheckedUpdateManyInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    Nom_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Profil_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Journal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Id_Lieu?: NullableIntFieldUpdateOperationsInput | number | null
    Commentaire_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journal_codeCreateInput = {
    Code_Journal: string
    Commentaire?: string | null
  }

  export type tm_journal_codeUncheckedCreateInput = {
    Code_Journal: string
    Commentaire?: string | null
  }

  export type tm_journal_codeUpdateInput = {
    Code_Journal?: StringFieldUpdateOperationsInput | string
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journal_codeUncheckedUpdateInput = {
    Code_Journal?: StringFieldUpdateOperationsInput | string
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journal_codeCreateManyInput = {
    Code_Journal: string
    Commentaire?: string | null
  }

  export type tm_journal_codeUpdateManyMutationInput = {
    Code_Journal?: StringFieldUpdateOperationsInput | string
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journal_codeUncheckedUpdateManyInput = {
    Code_Journal?: StringFieldUpdateOperationsInput | string
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_compteur_id_tableCreateInput = {
    Id_Serveur_BDD: number
    Nom_Table: string
    Compteur_Id?: number | null
  }

  export type tm_compteur_id_tableUncheckedCreateInput = {
    Id_Serveur_BDD: number
    Nom_Table: string
    Compteur_Id?: number | null
  }

  export type tm_compteur_id_tableUpdateInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Nom_Table?: StringFieldUpdateOperationsInput | string
    Compteur_Id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type tm_compteur_id_tableUncheckedUpdateInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Nom_Table?: StringFieldUpdateOperationsInput | string
    Compteur_Id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type tm_compteur_id_tableCreateManyInput = {
    Id_Serveur_BDD: number
    Nom_Table: string
    Compteur_Id?: number | null
  }

  export type tm_compteur_id_tableUpdateManyMutationInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Nom_Table?: StringFieldUpdateOperationsInput | string
    Compteur_Id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type tm_compteur_id_tableUncheckedUpdateManyInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Nom_Table?: StringFieldUpdateOperationsInput | string
    Compteur_Id?: NullableIntFieldUpdateOperationsInput | number | null
  }

  export type tm_mesuresCreateInput = {
    Id_Serveur_BDD?: number
    Id_Mesure?: number
    Date_Heure_Mesure: Date | string
    Valeur?: number | null
    Valeur_Brute?: number | null
    Est_Valeur_Memoire?: boolean
    Nb_Decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    Sonde_Numero_Serie?: string | null
    Adresse_Sonde?: string | null
    Id_Lieu?: number
    Est_Valeur_Null?: number
    Frequence?: number | null
    Est_Etat_Alarme?: boolean
    Consigne_Inf_Pre_Alarme?: number | null
    Consigne_Sup_Pre_Alarme?: number | null
    Moyenne?: number | null
    Rssi?: string | null
    Tension?: string | null
  }

  export type tm_mesuresUncheckedCreateInput = {
    Id_Serveur_BDD?: number
    Id_Mesure?: number
    Date_Heure_Mesure: Date | string
    Valeur?: number | null
    Valeur_Brute?: number | null
    Est_Valeur_Memoire?: boolean
    Nb_Decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    Sonde_Numero_Serie?: string | null
    Adresse_Sonde?: string | null
    Id_Lieu?: number
    Est_Valeur_Null?: number
    Frequence?: number | null
    Est_Etat_Alarme?: boolean
    Consigne_Inf_Pre_Alarme?: number | null
    Consigne_Sup_Pre_Alarme?: number | null
    Moyenne?: number | null
    Rssi?: string | null
    Tension?: string | null
  }

  export type tm_mesuresUpdateInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Mesure?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Est_Valeur_Memoire?: BoolFieldUpdateOperationsInput | boolean
    Nb_Decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Adresse_Sonde?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_Etat_Alarme?: BoolFieldUpdateOperationsInput | boolean
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
    Rssi?: NullableStringFieldUpdateOperationsInput | string | null
    Tension?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_mesuresUncheckedUpdateInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Mesure?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Est_Valeur_Memoire?: BoolFieldUpdateOperationsInput | boolean
    Nb_Decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Adresse_Sonde?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_Etat_Alarme?: BoolFieldUpdateOperationsInput | boolean
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
    Rssi?: NullableStringFieldUpdateOperationsInput | string | null
    Tension?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_mesuresCreateManyInput = {
    Id_Serveur_BDD?: number
    Date_Heure_Mesure: Date | string
    Valeur?: number | null
    Valeur_Brute?: number | null
    Est_Valeur_Memoire?: boolean
    Nb_Decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    Sonde_Numero_Serie?: string | null
    Adresse_Sonde?: string | null
    Id_Lieu?: number
    Est_Valeur_Null?: number
    Frequence?: number | null
    Est_Etat_Alarme?: boolean
    Consigne_Inf_Pre_Alarme?: number | null
    Consigne_Sup_Pre_Alarme?: number | null
    Moyenne?: number | null
    Rssi?: string | null
    Tension?: string | null
  }

  export type tm_mesuresUpdateManyMutationInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Mesure?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Est_Valeur_Memoire?: BoolFieldUpdateOperationsInput | boolean
    Nb_Decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Adresse_Sonde?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_Etat_Alarme?: BoolFieldUpdateOperationsInput | boolean
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
    Rssi?: NullableStringFieldUpdateOperationsInput | string | null
    Tension?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_mesuresUncheckedUpdateManyInput = {
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Mesure?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Est_Valeur_Memoire?: BoolFieldUpdateOperationsInput | boolean
    Nb_Decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Adresse_Sonde?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_Etat_Alarme?: BoolFieldUpdateOperationsInput | boolean
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
    Rssi?: NullableStringFieldUpdateOperationsInput | string | null
    Tension?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_mesures_gsoCreateInput = {
    Id_mesures_gso?: number
    id_capteur?: string
    tep?: number | null
    unite?: string | null
    date_mesure: Date | string
    rssi?: string | null
    tension?: string | null
  }

  export type tm_mesures_gsoUncheckedCreateInput = {
    Id_mesures_gso?: number
    id_capteur?: string
    tep?: number | null
    unite?: string | null
    date_mesure: Date | string
    rssi?: string | null
    tension?: string | null
  }

  export type tm_mesures_gsoUpdateInput = {
    Id_mesures_gso?: IntFieldUpdateOperationsInput | number
    id_capteur?: StringFieldUpdateOperationsInput | string
    tep?: NullableFloatFieldUpdateOperationsInput | number | null
    unite?: NullableStringFieldUpdateOperationsInput | string | null
    date_mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    rssi?: NullableStringFieldUpdateOperationsInput | string | null
    tension?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_mesures_gsoUncheckedUpdateInput = {
    Id_mesures_gso?: IntFieldUpdateOperationsInput | number
    id_capteur?: StringFieldUpdateOperationsInput | string
    tep?: NullableFloatFieldUpdateOperationsInput | number | null
    unite?: NullableStringFieldUpdateOperationsInput | string | null
    date_mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    rssi?: NullableStringFieldUpdateOperationsInput | string | null
    tension?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_mesures_gsoCreateManyInput = {
    id_capteur?: string
    tep?: number | null
    unite?: string | null
    date_mesure: Date | string
    rssi?: string | null
    tension?: string | null
  }

  export type tm_mesures_gsoUpdateManyMutationInput = {
    Id_mesures_gso?: IntFieldUpdateOperationsInput | number
    id_capteur?: StringFieldUpdateOperationsInput | string
    tep?: NullableFloatFieldUpdateOperationsInput | number | null
    unite?: NullableStringFieldUpdateOperationsInput | string | null
    date_mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    rssi?: NullableStringFieldUpdateOperationsInput | string | null
    tension?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_mesures_gsoUncheckedUpdateManyInput = {
    Id_mesures_gso?: IntFieldUpdateOperationsInput | number
    id_capteur?: StringFieldUpdateOperationsInput | string
    tep?: NullableFloatFieldUpdateOperationsInput | number | null
    unite?: NullableStringFieldUpdateOperationsInput | string | null
    date_mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    rssi?: NullableStringFieldUpdateOperationsInput | string | null
    tension?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journal_histoCreateInput = {
    Id_Journal_Histo?: number
    Id_Serveur_BDD?: number
    Id_Journal?: number
    Code_Journal?: string | null
    Commentaire?: string | null
    Nom_Utilisateur?: string | null
    Profil_Utilisateur?: string | null
    Date_Heure_Journal?: Date | string | null
    Id_Lieu?: number | null
    Commentaire_Utilisateur?: string | null
  }

  export type tm_journal_histoUncheckedCreateInput = {
    Id_Journal_Histo?: number
    Id_Serveur_BDD?: number
    Id_Journal?: number
    Code_Journal?: string | null
    Commentaire?: string | null
    Nom_Utilisateur?: string | null
    Profil_Utilisateur?: string | null
    Date_Heure_Journal?: Date | string | null
    Id_Lieu?: number | null
    Commentaire_Utilisateur?: string | null
  }

  export type tm_journal_histoUpdateInput = {
    Id_Journal_Histo?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    Nom_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Profil_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Journal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Id_Lieu?: NullableIntFieldUpdateOperationsInput | number | null
    Commentaire_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journal_histoUncheckedUpdateInput = {
    Id_Journal_Histo?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    Nom_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Profil_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Journal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Id_Lieu?: NullableIntFieldUpdateOperationsInput | number | null
    Commentaire_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journal_histoCreateManyInput = {
    Id_Serveur_BDD?: number
    Id_Journal?: number
    Code_Journal?: string | null
    Commentaire?: string | null
    Nom_Utilisateur?: string | null
    Profil_Utilisateur?: string | null
    Date_Heure_Journal?: Date | string | null
    Id_Lieu?: number | null
    Commentaire_Utilisateur?: string | null
  }

  export type tm_journal_histoUpdateManyMutationInput = {
    Id_Journal_Histo?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    Nom_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Profil_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Journal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Id_Lieu?: NullableIntFieldUpdateOperationsInput | number | null
    Commentaire_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_journal_histoUncheckedUpdateManyInput = {
    Id_Journal_Histo?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Id_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire?: NullableStringFieldUpdateOperationsInput | string | null
    Nom_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Profil_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Journal?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Id_Lieu?: NullableIntFieldUpdateOperationsInput | number | null
    Commentaire_Utilisateur?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_mesure_calibrageCreateInput = {
    Id_Mesure_Calibrage?: number
    Id_Serveur_BDD?: number
    Valeur?: number
    Valeur_Brute?: number
    Sonde_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
  }

  export type tm_mesure_calibrageUncheckedCreateInput = {
    Id_Mesure_Calibrage?: number
    Id_Serveur_BDD?: number
    Valeur?: number
    Valeur_Brute?: number
    Sonde_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
  }

  export type tm_mesure_calibrageUpdateInput = {
    Id_Mesure_Calibrage?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur?: FloatFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Sonde_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_mesure_calibrageUncheckedUpdateInput = {
    Id_Mesure_Calibrage?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur?: FloatFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Sonde_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_mesure_calibrageCreateManyInput = {
    Id_Serveur_BDD?: number
    Valeur?: number
    Valeur_Brute?: number
    Sonde_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
  }

  export type tm_mesure_calibrageUpdateManyMutationInput = {
    Id_Mesure_Calibrage?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur?: FloatFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Sonde_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_mesure_calibrageUncheckedUpdateManyInput = {
    Id_Mesure_Calibrage?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur?: FloatFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Sonde_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_mesure_calibrage_etalonCreateInput = {
    Id_Mesure_Calibrage_Etalon?: number
    Id_Serveur_BDD?: number
    Valeur?: number
    Valeur_Brute?: number
    Etalon_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
  }

  export type tm_mesure_calibrage_etalonUncheckedCreateInput = {
    Id_Mesure_Calibrage_Etalon?: number
    Id_Serveur_BDD?: number
    Valeur?: number
    Valeur_Brute?: number
    Etalon_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
  }

  export type tm_mesure_calibrage_etalonUpdateInput = {
    Id_Mesure_Calibrage_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur?: FloatFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_mesure_calibrage_etalonUncheckedUpdateInput = {
    Id_Mesure_Calibrage_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur?: FloatFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_mesure_calibrage_etalonCreateManyInput = {
    Id_Serveur_BDD?: number
    Valeur?: number
    Valeur_Brute?: number
    Etalon_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
  }

  export type tm_mesure_calibrage_etalonUpdateManyMutationInput = {
    Id_Mesure_Calibrage_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur?: FloatFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_mesure_calibrage_etalonUncheckedUpdateManyInput = {
    Id_Mesure_Calibrage_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur?: FloatFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_mesure_etalonCreateInput = {
    Id_Mesure_Etalon?: number
    Id_Serveur_BDD?: number
    Valeur_Brute: number
    Etalon_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure: Date | string
    Message_Erreur?: string
  }

  export type tm_mesure_etalonUncheckedCreateInput = {
    Id_Mesure_Etalon?: number
    Id_Serveur_BDD?: number
    Valeur_Brute: number
    Etalon_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure: Date | string
    Message_Erreur?: string
  }

  export type tm_mesure_etalonUpdateInput = {
    Id_Mesure_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Message_Erreur?: StringFieldUpdateOperationsInput | string
  }

  export type tm_mesure_etalonUncheckedUpdateInput = {
    Id_Mesure_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Message_Erreur?: StringFieldUpdateOperationsInput | string
  }

  export type tm_mesure_etalonCreateManyInput = {
    Id_Serveur_BDD?: number
    Valeur_Brute: number
    Etalon_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure: Date | string
    Message_Erreur?: string
  }

  export type tm_mesure_etalonUpdateManyMutationInput = {
    Id_Mesure_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Message_Erreur?: StringFieldUpdateOperationsInput | string
  }

  export type tm_mesure_etalonUncheckedUpdateManyInput = {
    Id_Mesure_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Message_Erreur?: StringFieldUpdateOperationsInput | string
  }

  export type tm_mesure_etalonnageCreateInput = {
    Id_Mesure_Etalonnage?: number
    Id_Serveur_BDD?: number
    Sonde_Numero_serie?: string | null
    Numero_Ordre?: number | null
    Mesure_Sonde?: number | null
    Mesure_Etalon?: number | null
    Date_Heure?: Date | string | null
  }

  export type tm_mesure_etalonnageUncheckedCreateInput = {
    Id_Mesure_Etalonnage?: number
    Id_Serveur_BDD?: number
    Sonde_Numero_serie?: string | null
    Numero_Ordre?: number | null
    Mesure_Sonde?: number | null
    Mesure_Etalon?: number | null
    Date_Heure?: Date | string | null
  }

  export type tm_mesure_etalonnageUpdateInput = {
    Id_Mesure_Etalonnage?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Sonde_Numero_serie?: NullableStringFieldUpdateOperationsInput | string | null
    Numero_Ordre?: NullableIntFieldUpdateOperationsInput | number | null
    Mesure_Sonde?: NullableFloatFieldUpdateOperationsInput | number | null
    Mesure_Etalon?: NullableFloatFieldUpdateOperationsInput | number | null
    Date_Heure?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_mesure_etalonnageUncheckedUpdateInput = {
    Id_Mesure_Etalonnage?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Sonde_Numero_serie?: NullableStringFieldUpdateOperationsInput | string | null
    Numero_Ordre?: NullableIntFieldUpdateOperationsInput | number | null
    Mesure_Sonde?: NullableFloatFieldUpdateOperationsInput | number | null
    Mesure_Etalon?: NullableFloatFieldUpdateOperationsInput | number | null
    Date_Heure?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_mesure_etalonnageCreateManyInput = {
    Id_Serveur_BDD?: number
    Sonde_Numero_serie?: string | null
    Numero_Ordre?: number | null
    Mesure_Sonde?: number | null
    Mesure_Etalon?: number | null
    Date_Heure?: Date | string | null
  }

  export type tm_mesure_etalonnageUpdateManyMutationInput = {
    Id_Mesure_Etalonnage?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Sonde_Numero_serie?: NullableStringFieldUpdateOperationsInput | string | null
    Numero_Ordre?: NullableIntFieldUpdateOperationsInput | number | null
    Mesure_Sonde?: NullableFloatFieldUpdateOperationsInput | number | null
    Mesure_Etalon?: NullableFloatFieldUpdateOperationsInput | number | null
    Date_Heure?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_mesure_etalonnageUncheckedUpdateManyInput = {
    Id_Mesure_Etalonnage?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Sonde_Numero_serie?: NullableStringFieldUpdateOperationsInput | string | null
    Numero_Ordre?: NullableIntFieldUpdateOperationsInput | number | null
    Mesure_Sonde?: NullableFloatFieldUpdateOperationsInput | number | null
    Mesure_Etalon?: NullableFloatFieldUpdateOperationsInput | number | null
    Date_Heure?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_mesures_histoCreateInput = {
    Id_Mesure?: number
    Id_Serveur_BDD?: number
    Date_Heure_Mesure?: Date | string
    Valeur?: number | null
    Valeur_Brute?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    Sonde_Numero_Serie?: string | null
    Id_Lieu?: number
    Est_Valeur_Null?: number
    Frequence?: number | null
    Est_En_Alarme?: boolean | null
    Consigne_Inf_Pre_Alarme?: number | null
    Consigne_Sup_Pre_Alarme?: number | null
    Moyenne?: number | null
  }

  export type tm_mesures_histoUncheckedCreateInput = {
    Id_Mesure?: number
    Id_Serveur_BDD?: number
    Date_Heure_Mesure?: Date | string
    Valeur?: number | null
    Valeur_Brute?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    Sonde_Numero_Serie?: string | null
    Id_Lieu?: number
    Est_Valeur_Null?: number
    Frequence?: number | null
    Est_En_Alarme?: boolean | null
    Consigne_Inf_Pre_Alarme?: number | null
    Consigne_Sup_Pre_Alarme?: number | null
    Moyenne?: number | null
  }

  export type tm_mesures_histoUpdateInput = {
    Id_Mesure?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_En_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type tm_mesures_histoUncheckedUpdateInput = {
    Id_Mesure?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_En_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type tm_mesures_histoCreateManyInput = {
    Id_Serveur_BDD?: number
    Date_Heure_Mesure?: Date | string
    Valeur?: number | null
    Valeur_Brute?: number | null
    Nb_decimal?: number | null
    Consigne?: number | null
    Consigne_Sup?: number | null
    Consigne_Inf?: number | null
    Unite?: string | null
    Sonde_Numero_Serie?: string | null
    Id_Lieu?: number
    Est_Valeur_Null?: number
    Frequence?: number | null
    Est_En_Alarme?: boolean | null
    Consigne_Inf_Pre_Alarme?: number | null
    Consigne_Sup_Pre_Alarme?: number | null
    Moyenne?: number | null
  }

  export type tm_mesures_histoUpdateManyMutationInput = {
    Id_Mesure?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_En_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type tm_mesures_histoUncheckedUpdateManyInput = {
    Id_Mesure?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableFloatFieldUpdateOperationsInput | number | null
    Valeur_Brute?: NullableFloatFieldUpdateOperationsInput | number | null
    Nb_decimal?: NullableIntFieldUpdateOperationsInput | number | null
    Consigne?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Inf?: NullableFloatFieldUpdateOperationsInput | number | null
    Unite?: NullableStringFieldUpdateOperationsInput | string | null
    Sonde_Numero_Serie?: NullableStringFieldUpdateOperationsInput | string | null
    Id_Lieu?: IntFieldUpdateOperationsInput | number
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Frequence?: NullableIntFieldUpdateOperationsInput | number | null
    Est_En_Alarme?: NullableBoolFieldUpdateOperationsInput | boolean | null
    Consigne_Inf_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Consigne_Sup_Pre_Alarme?: NullableFloatFieldUpdateOperationsInput | number | null
    Moyenne?: NullableFloatFieldUpdateOperationsInput | number | null
  }

  export type tm_mesures_testCreateInput = {
    Id_Mesure_Test?: number
    Id_Serveur_BDD?: number
    Valeur_Brute: number
    Sonde_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
    Nombre_Total?: number
    Nombre_Recu?: number
  }

  export type tm_mesures_testUncheckedCreateInput = {
    Id_Mesure_Test?: number
    Id_Serveur_BDD?: number
    Valeur_Brute: number
    Sonde_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
    Nombre_Total?: number
    Nombre_Recu?: number
  }

  export type tm_mesures_testUpdateInput = {
    Id_Mesure_Test?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Sonde_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Nombre_Total?: IntFieldUpdateOperationsInput | number
    Nombre_Recu?: IntFieldUpdateOperationsInput | number
  }

  export type tm_mesures_testUncheckedUpdateInput = {
    Id_Mesure_Test?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Sonde_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Nombre_Total?: IntFieldUpdateOperationsInput | number
    Nombre_Recu?: IntFieldUpdateOperationsInput | number
  }

  export type tm_mesures_testCreateManyInput = {
    Id_Serveur_BDD?: number
    Valeur_Brute: number
    Sonde_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
    Nombre_Total?: number
    Nombre_Recu?: number
  }

  export type tm_mesures_testUpdateManyMutationInput = {
    Id_Mesure_Test?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Sonde_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Nombre_Total?: IntFieldUpdateOperationsInput | number
    Nombre_Recu?: IntFieldUpdateOperationsInput | number
  }

  export type tm_mesures_testUncheckedUpdateManyInput = {
    Id_Mesure_Test?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Sonde_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Nombre_Total?: IntFieldUpdateOperationsInput | number
    Nombre_Recu?: IntFieldUpdateOperationsInput | number
  }

  export type tm_mesures_test_etalonCreateInput = {
    Id_Mesure_Test_Etalon?: number
    Id_Serveur_BDD?: number
    Valeur_Brute: number
    Etalon_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
    Nombre_Total?: number
    Nombre_Recu?: number
  }

  export type tm_mesures_test_etalonUncheckedCreateInput = {
    Id_Mesure_Test_Etalon?: number
    Id_Serveur_BDD?: number
    Valeur_Brute: number
    Etalon_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
    Nombre_Total?: number
    Nombre_Recu?: number
  }

  export type tm_mesures_test_etalonUpdateInput = {
    Id_Mesure_Test_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Nombre_Total?: IntFieldUpdateOperationsInput | number
    Nombre_Recu?: IntFieldUpdateOperationsInput | number
  }

  export type tm_mesures_test_etalonUncheckedUpdateInput = {
    Id_Mesure_Test_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Nombre_Total?: IntFieldUpdateOperationsInput | number
    Nombre_Recu?: IntFieldUpdateOperationsInput | number
  }

  export type tm_mesures_test_etalonCreateManyInput = {
    Id_Serveur_BDD?: number
    Valeur_Brute: number
    Etalon_Numero_Serie?: string
    Est_Valeur_Null: number
    Date_Heure?: Date | string
    Nombre_Total?: number
    Nombre_Recu?: number
  }

  export type tm_mesures_test_etalonUpdateManyMutationInput = {
    Id_Mesure_Test_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Nombre_Total?: IntFieldUpdateOperationsInput | number
    Nombre_Recu?: IntFieldUpdateOperationsInput | number
  }

  export type tm_mesures_test_etalonUncheckedUpdateManyInput = {
    Id_Mesure_Test_Etalon?: IntFieldUpdateOperationsInput | number
    Id_Serveur_BDD?: IntFieldUpdateOperationsInput | number
    Valeur_Brute?: FloatFieldUpdateOperationsInput | number
    Etalon_Numero_Serie?: StringFieldUpdateOperationsInput | string
    Est_Valeur_Null?: IntFieldUpdateOperationsInput | number
    Date_Heure?: DateTimeFieldUpdateOperationsInput | Date | string
    Nombre_Total?: IntFieldUpdateOperationsInput | number
    Nombre_Recu?: IntFieldUpdateOperationsInput | number
  }

  export type tm_mode_degradeCreateInput = {
    Id_Utilisateur?: number | null
    Date_Heure_Creation?: Date | string | null
    Requete_SQL?: string | null
    Est_Archivee?: boolean
    Date_Heure_Archive?: Date | string | null
  }

  export type tm_mode_degradeUncheckedCreateInput = {
    Id_Mode_Degrade?: number
    Id_Utilisateur?: number | null
    Date_Heure_Creation?: Date | string | null
    Requete_SQL?: string | null
    Est_Archivee?: boolean
    Date_Heure_Archive?: Date | string | null
  }

  export type tm_mode_degradeUpdateInput = {
    Id_Utilisateur?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Heure_Creation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Requete_SQL?: NullableStringFieldUpdateOperationsInput | string | null
    Est_Archivee?: BoolFieldUpdateOperationsInput | boolean
    Date_Heure_Archive?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_mode_degradeUncheckedUpdateInput = {
    Id_Mode_Degrade?: IntFieldUpdateOperationsInput | number
    Id_Utilisateur?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Heure_Creation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Requete_SQL?: NullableStringFieldUpdateOperationsInput | string | null
    Est_Archivee?: BoolFieldUpdateOperationsInput | boolean
    Date_Heure_Archive?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_mode_degradeCreateManyInput = {
    Id_Utilisateur?: number | null
    Date_Heure_Creation?: Date | string | null
    Requete_SQL?: string | null
    Est_Archivee?: boolean
    Date_Heure_Archive?: Date | string | null
  }

  export type tm_mode_degradeUpdateManyMutationInput = {
    Id_Utilisateur?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Heure_Creation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Requete_SQL?: NullableStringFieldUpdateOperationsInput | string | null
    Est_Archivee?: BoolFieldUpdateOperationsInput | boolean
    Date_Heure_Archive?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_mode_degradeUncheckedUpdateManyInput = {
    Id_Mode_Degrade?: IntFieldUpdateOperationsInput | number
    Id_Utilisateur?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Heure_Creation?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    Requete_SQL?: NullableStringFieldUpdateOperationsInput | string | null
    Est_Archivee?: BoolFieldUpdateOperationsInput | boolean
    Date_Heure_Archive?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_parametreCreateInput = {
    Id_Parametre?: number
    Cle_Parametre?: string
    Valeur_Parametre?: string | null
    Groupe_Parametre?: string | null
    Commentaire_Parametre?: string | null
  }

  export type tm_parametreUncheckedCreateInput = {
    Id_Parametre?: number
    Cle_Parametre?: string
    Valeur_Parametre?: string | null
    Groupe_Parametre?: string | null
    Commentaire_Parametre?: string | null
  }

  export type tm_parametreUpdateInput = {
    Id_Parametre?: IntFieldUpdateOperationsInput | number
    Cle_Parametre?: StringFieldUpdateOperationsInput | string
    Valeur_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
    Groupe_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_parametreUncheckedUpdateInput = {
    Id_Parametre?: IntFieldUpdateOperationsInput | number
    Cle_Parametre?: StringFieldUpdateOperationsInput | string
    Valeur_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
    Groupe_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_parametreCreateManyInput = {
    Cle_Parametre?: string
    Valeur_Parametre?: string | null
    Groupe_Parametre?: string | null
    Commentaire_Parametre?: string | null
  }

  export type tm_parametreUpdateManyMutationInput = {
    Id_Parametre?: IntFieldUpdateOperationsInput | number
    Cle_Parametre?: StringFieldUpdateOperationsInput | string
    Valeur_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
    Groupe_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_parametreUncheckedUpdateManyInput = {
    Id_Parametre?: IntFieldUpdateOperationsInput | number
    Cle_Parametre?: StringFieldUpdateOperationsInput | string
    Valeur_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
    Groupe_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
    Commentaire_Parametre?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type tm_vigilog_mesureCreateInput = {
    Id_VigiLog_Tournee: number
    Numero_Ordre?: number | null
    Date_Heure_Mesure: Date | string
    Valeur?: Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: boolean
    Est_En_Alarme?: boolean
    Est_Marqueur?: boolean
    Details?: string | null
    Date_Heure_Import?: Date | string
  }

  export type tm_vigilog_mesureUncheckedCreateInput = {
    Id_VigiLog_Mesure?: number
    Id_VigiLog_Tournee: number
    Numero_Ordre?: number | null
    Date_Heure_Mesure: Date | string
    Valeur?: Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: boolean
    Est_En_Alarme?: boolean
    Est_Marqueur?: boolean
    Details?: string | null
    Date_Heure_Import?: Date | string
  }

  export type tm_vigilog_mesureUpdateInput = {
    Id_VigiLog_Tournee?: IntFieldUpdateOperationsInput | number
    Numero_Ordre?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: BoolFieldUpdateOperationsInput | boolean
    Est_En_Alarme?: BoolFieldUpdateOperationsInput | boolean
    Est_Marqueur?: BoolFieldUpdateOperationsInput | boolean
    Details?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Import?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_vigilog_mesureUncheckedUpdateInput = {
    Id_VigiLog_Mesure?: IntFieldUpdateOperationsInput | number
    Id_VigiLog_Tournee?: IntFieldUpdateOperationsInput | number
    Numero_Ordre?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: BoolFieldUpdateOperationsInput | boolean
    Est_En_Alarme?: BoolFieldUpdateOperationsInput | boolean
    Est_Marqueur?: BoolFieldUpdateOperationsInput | boolean
    Details?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Import?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_vigilog_mesureCreateManyInput = {
    Id_VigiLog_Tournee: number
    Numero_Ordre?: number | null
    Date_Heure_Mesure: Date | string
    Valeur?: Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: boolean
    Est_En_Alarme?: boolean
    Est_Marqueur?: boolean
    Details?: string | null
    Date_Heure_Import?: Date | string
  }

  export type tm_vigilog_mesureUpdateManyMutationInput = {
    Id_VigiLog_Tournee?: IntFieldUpdateOperationsInput | number
    Numero_Ordre?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: BoolFieldUpdateOperationsInput | boolean
    Est_En_Alarme?: BoolFieldUpdateOperationsInput | boolean
    Est_Marqueur?: BoolFieldUpdateOperationsInput | boolean
    Details?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Import?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_vigilog_mesureUncheckedUpdateManyInput = {
    Id_VigiLog_Mesure?: IntFieldUpdateOperationsInput | number
    Id_VigiLog_Tournee?: IntFieldUpdateOperationsInput | number
    Numero_Ordre?: NullableIntFieldUpdateOperationsInput | number | null
    Date_Heure_Mesure?: DateTimeFieldUpdateOperationsInput | Date | string
    Valeur?: NullableDecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string | null
    Est_Hors_Limites?: BoolFieldUpdateOperationsInput | boolean
    Est_En_Alarme?: BoolFieldUpdateOperationsInput | boolean
    Est_Marqueur?: BoolFieldUpdateOperationsInput | boolean
    Details?: NullableStringFieldUpdateOperationsInput | string | null
    Date_Heure_Import?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type tm_journal_commentaire_libreCreateInput = {
    Code_Journal: string
    Commentaire: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
  }

  export type tm_journal_commentaire_libreUncheckedCreateInput = {
    Id_Commentaire_Journal?: number
    Code_Journal: string
    Commentaire: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
  }

  export type tm_journal_commentaire_libreUpdateInput = {
    Code_Journal?: StringFieldUpdateOperationsInput | string
    Commentaire?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_journal_commentaire_libreUncheckedUpdateInput = {
    Id_Commentaire_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: StringFieldUpdateOperationsInput | string
    Commentaire?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_journal_commentaire_libreCreateManyInput = {
    Code_Journal: string
    Commentaire: string
    Date_Creation?: Date | string
    Date_Modification?: Date | string | null
  }

  export type tm_journal_commentaire_libreUpdateManyMutationInput = {
    Code_Journal?: StringFieldUpdateOperationsInput | string
    Commentaire?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
  }

  export type tm_journal_commentaire_libreUncheckedUpdateManyInput = {
    Id_Commentaire_Journal?: IntFieldUpdateOperationsInput | number
    Code_Journal?: StringFieldUpdateOperationsInput | string
    Commentaire?: StringFieldUpdateOperationsInput | string
    Date_Creation?: DateTimeFieldUpdateOperationsInput | Date | string
    Date_Modification?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
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
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type tm_graphiqueId_GraphiqueDate_Heure_MesureId_LieuEst_Valeur_NullEst_Etat_AlarmeCompoundUniqueInput = {
    Id_Graphique: number
    Date_Heure_Mesure: Date | string
    Id_Lieu: number
    Est_Valeur_Null: boolean
    Est_Etat_Alarme: number
  }

  export type tm_graphiqueCountOrderByAggregateInput = {
    Id_Graphique?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Adresse_Sonde?: SortOrder
    Id_Sonde?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
  }

  export type tm_graphiqueAvgOrderByAggregateInput = {
    Id_Graphique?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Id_Sonde?: SortOrder
    Id_Lieu?: SortOrder
    Frequence?: SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
  }

  export type tm_graphiqueMaxOrderByAggregateInput = {
    Id_Graphique?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Adresse_Sonde?: SortOrder
    Id_Sonde?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
  }

  export type tm_graphiqueMinOrderByAggregateInput = {
    Id_Graphique?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Adresse_Sonde?: SortOrder
    Id_Sonde?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
  }

  export type tm_graphiqueSumOrderByAggregateInput = {
    Id_Graphique?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Id_Sonde?: SortOrder
    Id_Lieu?: SortOrder
    Frequence?: SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
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
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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

  export type tm_journalId_Serveur_BDDId_JournalCompoundUniqueInput = {
    Id_Serveur_BDD: number
    Id_Journal: number
  }

  export type tm_journalCountOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Nom_Utilisateur?: SortOrder
    Profil_Utilisateur?: SortOrder
    Date_Heure_Journal?: SortOrder
    Id_Lieu?: SortOrder
    Commentaire_Utilisateur?: SortOrder
  }

  export type tm_journalAvgOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Id_Lieu?: SortOrder
  }

  export type tm_journalMaxOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Nom_Utilisateur?: SortOrder
    Profil_Utilisateur?: SortOrder
    Date_Heure_Journal?: SortOrder
    Id_Lieu?: SortOrder
    Commentaire_Utilisateur?: SortOrder
  }

  export type tm_journalMinOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Nom_Utilisateur?: SortOrder
    Profil_Utilisateur?: SortOrder
    Date_Heure_Journal?: SortOrder
    Id_Lieu?: SortOrder
    Commentaire_Utilisateur?: SortOrder
  }

  export type tm_journalSumOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Id_Lieu?: SortOrder
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
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type tm_journal_codeCountOrderByAggregateInput = {
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
  }

  export type tm_journal_codeMaxOrderByAggregateInput = {
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
  }

  export type tm_journal_codeMinOrderByAggregateInput = {
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
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
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type tm_compteur_id_tableId_Serveur_BDDNom_TableCompoundUniqueInput = {
    Id_Serveur_BDD: number
    Nom_Table: string
  }

  export type tm_compteur_id_tableCountOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Nom_Table?: SortOrder
    Compteur_Id?: SortOrder
  }

  export type tm_compteur_id_tableAvgOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Compteur_Id?: SortOrder
  }

  export type tm_compteur_id_tableMaxOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Nom_Table?: SortOrder
    Compteur_Id?: SortOrder
  }

  export type tm_compteur_id_tableMinOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Nom_Table?: SortOrder
    Compteur_Id?: SortOrder
  }

  export type tm_compteur_id_tableSumOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Compteur_Id?: SortOrder
  }

  export type tm_mesuresId_Serveur_BDDId_MesureDate_Heure_MesureId_LieuEst_Valeur_NullCompoundUniqueInput = {
    Id_Serveur_BDD: number
    Id_Mesure: number
    Date_Heure_Mesure: Date | string
    Id_Lieu: number
    Est_Valeur_Null: number
  }

  export type tm_mesuresCountOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Mesure?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Memoire?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Adresse_Sonde?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
    Rssi?: SortOrder
    Tension?: SortOrder
  }

  export type tm_mesuresAvgOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type tm_mesuresMaxOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Mesure?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Memoire?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Adresse_Sonde?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
    Rssi?: SortOrder
    Tension?: SortOrder
  }

  export type tm_mesuresMinOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Mesure?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Memoire?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Adresse_Sonde?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Est_Etat_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
    Rssi?: SortOrder
    Tension?: SortOrder
  }

  export type tm_mesuresSumOrderByAggregateInput = {
    Id_Serveur_BDD?: SortOrder
    Id_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_Decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type tm_mesures_gsoId_capteurDate_mesureCompoundUniqueInput = {
    id_capteur: string
    date_mesure: Date | string
  }

  export type tm_mesures_gsoCountOrderByAggregateInput = {
    Id_mesures_gso?: SortOrder
    id_capteur?: SortOrder
    tep?: SortOrder
    unite?: SortOrder
    date_mesure?: SortOrder
    rssi?: SortOrder
    tension?: SortOrder
  }

  export type tm_mesures_gsoAvgOrderByAggregateInput = {
    Id_mesures_gso?: SortOrder
    tep?: SortOrder
  }

  export type tm_mesures_gsoMaxOrderByAggregateInput = {
    Id_mesures_gso?: SortOrder
    id_capteur?: SortOrder
    tep?: SortOrder
    unite?: SortOrder
    date_mesure?: SortOrder
    rssi?: SortOrder
    tension?: SortOrder
  }

  export type tm_mesures_gsoMinOrderByAggregateInput = {
    Id_mesures_gso?: SortOrder
    id_capteur?: SortOrder
    tep?: SortOrder
    unite?: SortOrder
    date_mesure?: SortOrder
    rssi?: SortOrder
    tension?: SortOrder
  }

  export type tm_mesures_gsoSumOrderByAggregateInput = {
    Id_mesures_gso?: SortOrder
    tep?: SortOrder
  }

  export type tm_journal_histoId_Journal_HistoId_Serveur_BDDId_JournalCompoundUniqueInput = {
    Id_Journal_Histo: number
    Id_Serveur_BDD: number
    Id_Journal: number
  }

  export type tm_journal_histoCountOrderByAggregateInput = {
    Id_Journal_Histo?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Nom_Utilisateur?: SortOrder
    Profil_Utilisateur?: SortOrder
    Date_Heure_Journal?: SortOrder
    Id_Lieu?: SortOrder
    Commentaire_Utilisateur?: SortOrder
  }

  export type tm_journal_histoAvgOrderByAggregateInput = {
    Id_Journal_Histo?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Id_Lieu?: SortOrder
  }

  export type tm_journal_histoMaxOrderByAggregateInput = {
    Id_Journal_Histo?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Nom_Utilisateur?: SortOrder
    Profil_Utilisateur?: SortOrder
    Date_Heure_Journal?: SortOrder
    Id_Lieu?: SortOrder
    Commentaire_Utilisateur?: SortOrder
  }

  export type tm_journal_histoMinOrderByAggregateInput = {
    Id_Journal_Histo?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Nom_Utilisateur?: SortOrder
    Profil_Utilisateur?: SortOrder
    Date_Heure_Journal?: SortOrder
    Id_Lieu?: SortOrder
    Commentaire_Utilisateur?: SortOrder
  }

  export type tm_journal_histoSumOrderByAggregateInput = {
    Id_Journal_Histo?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Id_Journal?: SortOrder
    Id_Lieu?: SortOrder
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

  export type tm_mesure_calibrageId_Mesure_CalibrageId_Serveur_BDDCompoundUniqueInput = {
    Id_Mesure_Calibrage: number
    Id_Serveur_BDD: number
  }

  export type tm_mesure_calibrageCountOrderByAggregateInput = {
    Id_Mesure_Calibrage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_calibrageAvgOrderByAggregateInput = {
    Id_Mesure_Calibrage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
  }

  export type tm_mesure_calibrageMaxOrderByAggregateInput = {
    Id_Mesure_Calibrage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_calibrageMinOrderByAggregateInput = {
    Id_Mesure_Calibrage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_calibrageSumOrderByAggregateInput = {
    Id_Mesure_Calibrage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
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

  export type tm_mesure_calibrage_etalonId_Mesure_Calibrage_EtalonId_Serveur_BDDCompoundUniqueInput = {
    Id_Mesure_Calibrage_Etalon: number
    Id_Serveur_BDD: number
  }

  export type tm_mesure_calibrage_etalonCountOrderByAggregateInput = {
    Id_Mesure_Calibrage_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_calibrage_etalonAvgOrderByAggregateInput = {
    Id_Mesure_Calibrage_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
  }

  export type tm_mesure_calibrage_etalonMaxOrderByAggregateInput = {
    Id_Mesure_Calibrage_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_calibrage_etalonMinOrderByAggregateInput = {
    Id_Mesure_Calibrage_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_calibrage_etalonSumOrderByAggregateInput = {
    Id_Mesure_Calibrage_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
  }

  export type tm_mesure_etalonId_Mesure_EtalonId_Serveur_BDDCompoundUniqueInput = {
    Id_Mesure_Etalon: number
    Id_Serveur_BDD: number
  }

  export type tm_mesure_etalonCountOrderByAggregateInput = {
    Id_Mesure_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Message_Erreur?: SortOrder
  }

  export type tm_mesure_etalonAvgOrderByAggregateInput = {
    Id_Mesure_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
  }

  export type tm_mesure_etalonMaxOrderByAggregateInput = {
    Id_Mesure_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Message_Erreur?: SortOrder
  }

  export type tm_mesure_etalonMinOrderByAggregateInput = {
    Id_Mesure_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Message_Erreur?: SortOrder
  }

  export type tm_mesure_etalonSumOrderByAggregateInput = {
    Id_Mesure_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
  }

  export type tm_mesure_etalonnageId_Mesure_EtalonnageId_Serveur_BDDCompoundUniqueInput = {
    Id_Mesure_Etalonnage: number
    Id_Serveur_BDD: number
  }

  export type tm_mesure_etalonnageCountOrderByAggregateInput = {
    Id_Mesure_Etalonnage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Sonde_Numero_serie?: SortOrder
    Numero_Ordre?: SortOrder
    Mesure_Sonde?: SortOrder
    Mesure_Etalon?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_etalonnageAvgOrderByAggregateInput = {
    Id_Mesure_Etalonnage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Numero_Ordre?: SortOrder
    Mesure_Sonde?: SortOrder
    Mesure_Etalon?: SortOrder
  }

  export type tm_mesure_etalonnageMaxOrderByAggregateInput = {
    Id_Mesure_Etalonnage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Sonde_Numero_serie?: SortOrder
    Numero_Ordre?: SortOrder
    Mesure_Sonde?: SortOrder
    Mesure_Etalon?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_etalonnageMinOrderByAggregateInput = {
    Id_Mesure_Etalonnage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Sonde_Numero_serie?: SortOrder
    Numero_Ordre?: SortOrder
    Mesure_Sonde?: SortOrder
    Mesure_Etalon?: SortOrder
    Date_Heure?: SortOrder
  }

  export type tm_mesure_etalonnageSumOrderByAggregateInput = {
    Id_Mesure_Etalonnage?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Numero_Ordre?: SortOrder
    Mesure_Sonde?: SortOrder
    Mesure_Etalon?: SortOrder
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type tm_mesures_histoId_MesureId_Serveur_BDDDate_Heure_MesureId_LieuEst_Valeur_NullCompoundUniqueInput = {
    Id_Mesure: number
    Id_Serveur_BDD: number
    Date_Heure_Mesure: Date | string
    Id_Lieu: number
    Est_Valeur_Null: number
  }

  export type tm_mesures_histoCountOrderByAggregateInput = {
    Id_Mesure?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Est_En_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type tm_mesures_histoAvgOrderByAggregateInput = {
    Id_Mesure?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type tm_mesures_histoMaxOrderByAggregateInput = {
    Id_Mesure?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Est_En_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type tm_mesures_histoMinOrderByAggregateInput = {
    Id_Mesure?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Unite?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Est_En_Alarme?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type tm_mesures_histoSumOrderByAggregateInput = {
    Id_Mesure?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur?: SortOrder
    Valeur_Brute?: SortOrder
    Nb_decimal?: SortOrder
    Consigne?: SortOrder
    Consigne_Sup?: SortOrder
    Consigne_Inf?: SortOrder
    Id_Lieu?: SortOrder
    Est_Valeur_Null?: SortOrder
    Frequence?: SortOrder
    Consigne_Inf_Pre_Alarme?: SortOrder
    Consigne_Sup_Pre_Alarme?: SortOrder
    Moyenne?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type tm_mesures_testId_Mesure_TestId_Serveur_BDDCompoundUniqueInput = {
    Id_Mesure_Test: number
    Id_Serveur_BDD: number
  }

  export type tm_mesures_testCountOrderByAggregateInput = {
    Id_Mesure_Test?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_testAvgOrderByAggregateInput = {
    Id_Mesure_Test?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_testMaxOrderByAggregateInput = {
    Id_Mesure_Test?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_testMinOrderByAggregateInput = {
    Id_Mesure_Test?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Sonde_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_testSumOrderByAggregateInput = {
    Id_Mesure_Test?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_test_etalonId_Mesure_Test_EtalonId_Serveur_BDDCompoundUniqueInput = {
    Id_Mesure_Test_Etalon: number
    Id_Serveur_BDD: number
  }

  export type tm_mesures_test_etalonCountOrderByAggregateInput = {
    Id_Mesure_Test_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_test_etalonAvgOrderByAggregateInput = {
    Id_Mesure_Test_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_test_etalonMaxOrderByAggregateInput = {
    Id_Mesure_Test_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_test_etalonMinOrderByAggregateInput = {
    Id_Mesure_Test_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Etalon_Numero_Serie?: SortOrder
    Est_Valeur_Null?: SortOrder
    Date_Heure?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mesures_test_etalonSumOrderByAggregateInput = {
    Id_Mesure_Test_Etalon?: SortOrder
    Id_Serveur_BDD?: SortOrder
    Valeur_Brute?: SortOrder
    Est_Valeur_Null?: SortOrder
    Nombre_Total?: SortOrder
    Nombre_Recu?: SortOrder
  }

  export type tm_mode_degradeCountOrderByAggregateInput = {
    Id_Mode_Degrade?: SortOrder
    Id_Utilisateur?: SortOrder
    Date_Heure_Creation?: SortOrder
    Requete_SQL?: SortOrder
    Est_Archivee?: SortOrder
    Date_Heure_Archive?: SortOrder
  }

  export type tm_mode_degradeAvgOrderByAggregateInput = {
    Id_Mode_Degrade?: SortOrder
    Id_Utilisateur?: SortOrder
  }

  export type tm_mode_degradeMaxOrderByAggregateInput = {
    Id_Mode_Degrade?: SortOrder
    Id_Utilisateur?: SortOrder
    Date_Heure_Creation?: SortOrder
    Requete_SQL?: SortOrder
    Est_Archivee?: SortOrder
    Date_Heure_Archive?: SortOrder
  }

  export type tm_mode_degradeMinOrderByAggregateInput = {
    Id_Mode_Degrade?: SortOrder
    Id_Utilisateur?: SortOrder
    Date_Heure_Creation?: SortOrder
    Requete_SQL?: SortOrder
    Est_Archivee?: SortOrder
    Date_Heure_Archive?: SortOrder
  }

  export type tm_mode_degradeSumOrderByAggregateInput = {
    Id_Mode_Degrade?: SortOrder
    Id_Utilisateur?: SortOrder
  }

  export type tm_parametreId_ParametreCle_ParametreCompoundUniqueInput = {
    Id_Parametre: number
    Cle_Parametre: string
  }

  export type tm_parametreCountOrderByAggregateInput = {
    Id_Parametre?: SortOrder
    Cle_Parametre?: SortOrder
    Valeur_Parametre?: SortOrder
    Groupe_Parametre?: SortOrder
    Commentaire_Parametre?: SortOrder
  }

  export type tm_parametreAvgOrderByAggregateInput = {
    Id_Parametre?: SortOrder
  }

  export type tm_parametreMaxOrderByAggregateInput = {
    Id_Parametre?: SortOrder
    Cle_Parametre?: SortOrder
    Valeur_Parametre?: SortOrder
    Groupe_Parametre?: SortOrder
    Commentaire_Parametre?: SortOrder
  }

  export type tm_parametreMinOrderByAggregateInput = {
    Id_Parametre?: SortOrder
    Cle_Parametre?: SortOrder
    Valeur_Parametre?: SortOrder
    Groupe_Parametre?: SortOrder
    Commentaire_Parametre?: SortOrder
  }

  export type tm_parametreSumOrderByAggregateInput = {
    Id_Parametre?: SortOrder
  }

  export type DecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type tm_vigilog_mesureId_VigiLog_TourneeDate_Heure_MesureNumero_OrdreCompoundUniqueInput = {
    Id_VigiLog_Tournee: number
    Date_Heure_Mesure: Date | string
    Numero_Ordre: number
  }

  export type tm_vigilog_mesureCountOrderByAggregateInput = {
    Id_VigiLog_Mesure?: SortOrder
    Id_VigiLog_Tournee?: SortOrder
    Numero_Ordre?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Est_Hors_Limites?: SortOrder
    Est_En_Alarme?: SortOrder
    Est_Marqueur?: SortOrder
    Details?: SortOrder
    Date_Heure_Import?: SortOrder
  }

  export type tm_vigilog_mesureAvgOrderByAggregateInput = {
    Id_VigiLog_Mesure?: SortOrder
    Id_VigiLog_Tournee?: SortOrder
    Numero_Ordre?: SortOrder
    Valeur?: SortOrder
  }

  export type tm_vigilog_mesureMaxOrderByAggregateInput = {
    Id_VigiLog_Mesure?: SortOrder
    Id_VigiLog_Tournee?: SortOrder
    Numero_Ordre?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Est_Hors_Limites?: SortOrder
    Est_En_Alarme?: SortOrder
    Est_Marqueur?: SortOrder
    Details?: SortOrder
    Date_Heure_Import?: SortOrder
  }

  export type tm_vigilog_mesureMinOrderByAggregateInput = {
    Id_VigiLog_Mesure?: SortOrder
    Id_VigiLog_Tournee?: SortOrder
    Numero_Ordre?: SortOrder
    Date_Heure_Mesure?: SortOrder
    Valeur?: SortOrder
    Est_Hors_Limites?: SortOrder
    Est_En_Alarme?: SortOrder
    Est_Marqueur?: SortOrder
    Details?: SortOrder
    Date_Heure_Import?: SortOrder
  }

  export type tm_vigilog_mesureSumOrderByAggregateInput = {
    Id_VigiLog_Mesure?: SortOrder
    Id_VigiLog_Tournee?: SortOrder
    Numero_Ordre?: SortOrder
    Valeur?: SortOrder
  }

  export type DecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
  }

  export type tm_journal_commentaire_libreCountOrderByAggregateInput = {
    Id_Commentaire_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrder
  }

  export type tm_journal_commentaire_libreAvgOrderByAggregateInput = {
    Id_Commentaire_Journal?: SortOrder
  }

  export type tm_journal_commentaire_libreMaxOrderByAggregateInput = {
    Id_Commentaire_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrder
  }

  export type tm_journal_commentaire_libreMinOrderByAggregateInput = {
    Id_Commentaire_Journal?: SortOrder
    Code_Journal?: SortOrder
    Commentaire?: SortOrder
    Date_Creation?: SortOrder
    Date_Modification?: SortOrder
  }

  export type tm_journal_commentaire_libreSumOrderByAggregateInput = {
    Id_Commentaire_Journal?: SortOrder
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
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

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type FloatFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type NullableDecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string | null
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
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
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
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
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
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
    not?: NestedStringFilter<$PrismaModel> | string
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
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
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

  export type NestedDecimalNullableFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
  }

  export type NestedDecimalNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel> | null
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | null
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalNullableWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedDecimalNullableFilter<$PrismaModel>
    _sum?: NestedDecimalNullableFilter<$PrismaModel>
    _min?: NestedDecimalNullableFilter<$PrismaModel>
    _max?: NestedDecimalNullableFilter<$PrismaModel>
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