
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Product
 * 
 */
export type Product = $Result.DefaultSelection<Prisma.$ProductPayload>
/**
 * Model Transaction
 * 
 */
export type Transaction = $Result.DefaultSelection<Prisma.$TransactionPayload>
/**
 * Model TransactionItem
 * 
 */
export type TransactionItem = $Result.DefaultSelection<Prisma.$TransactionItemPayload>
/**
 * Model StoreSetting
 * 
 */
export type StoreSetting = $Result.DefaultSelection<Prisma.$StoreSettingPayload>
/**
 * Model Notification
 * 
 */
export type Notification = $Result.DefaultSelection<Prisma.$NotificationPayload>
/**
 * Model ActivityLog
 * 
 */
export type ActivityLog = $Result.DefaultSelection<Prisma.$ActivityLogPayload>
/**
 * Model UserCart
 * 
 */
export type UserCart = $Result.DefaultSelection<Prisma.$UserCartPayload>
/**
 * Model UserCartItem
 * 
 */
export type UserCartItem = $Result.DefaultSelection<Prisma.$UserCartItemPayload>
/**
 * Model OrderRequest
 * 
 */
export type OrderRequest = $Result.DefaultSelection<Prisma.$OrderRequestPayload>
/**
 * Model OrderStatusHistory
 * 
 */
export type OrderStatusHistory = $Result.DefaultSelection<Prisma.$OrderStatusHistoryPayload>
/**
 * Model OrderRequestItem
 * 
 */
export type OrderRequestItem = $Result.DefaultSelection<Prisma.$OrderRequestItemPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
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
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
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
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.product`: Exposes CRUD operations for the **Product** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Products
    * const products = await prisma.product.findMany()
    * ```
    */
  get product(): Prisma.ProductDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transaction`: Exposes CRUD operations for the **Transaction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Transactions
    * const transactions = await prisma.transaction.findMany()
    * ```
    */
  get transaction(): Prisma.TransactionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.transactionItem`: Exposes CRUD operations for the **TransactionItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more TransactionItems
    * const transactionItems = await prisma.transactionItem.findMany()
    * ```
    */
  get transactionItem(): Prisma.TransactionItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.storeSetting`: Exposes CRUD operations for the **StoreSetting** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StoreSettings
    * const storeSettings = await prisma.storeSetting.findMany()
    * ```
    */
  get storeSetting(): Prisma.StoreSettingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.notification`: Exposes CRUD operations for the **Notification** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Notifications
    * const notifications = await prisma.notification.findMany()
    * ```
    */
  get notification(): Prisma.NotificationDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.activityLog`: Exposes CRUD operations for the **ActivityLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ActivityLogs
    * const activityLogs = await prisma.activityLog.findMany()
    * ```
    */
  get activityLog(): Prisma.ActivityLogDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userCart`: Exposes CRUD operations for the **UserCart** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserCarts
    * const userCarts = await prisma.userCart.findMany()
    * ```
    */
  get userCart(): Prisma.UserCartDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userCartItem`: Exposes CRUD operations for the **UserCartItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserCartItems
    * const userCartItems = await prisma.userCartItem.findMany()
    * ```
    */
  get userCartItem(): Prisma.UserCartItemDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orderRequest`: Exposes CRUD operations for the **OrderRequest** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrderRequests
    * const orderRequests = await prisma.orderRequest.findMany()
    * ```
    */
  get orderRequest(): Prisma.OrderRequestDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orderStatusHistory`: Exposes CRUD operations for the **OrderStatusHistory** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrderStatusHistories
    * const orderStatusHistories = await prisma.orderStatusHistory.findMany()
    * ```
    */
  get orderStatusHistory(): Prisma.OrderStatusHistoryDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.orderRequestItem`: Exposes CRUD operations for the **OrderRequestItem** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more OrderRequestItems
    * const orderRequestItems = await prisma.orderRequestItem.findMany()
    * ```
    */
  get orderRequestItem(): Prisma.OrderRequestItemDelegate<ExtArgs, ClientOptions>;
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
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

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
   * Prisma Client JS version: 6.19.3
   * Query Engine version: c2990dca591cba766e3b7ef5d9e8a84796e47ab7
   */
  export type PrismaVersion = {
    client: string
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
    User: 'User',
    Product: 'Product',
    Transaction: 'Transaction',
    TransactionItem: 'TransactionItem',
    StoreSetting: 'StoreSetting',
    Notification: 'Notification',
    ActivityLog: 'ActivityLog',
    UserCart: 'UserCart',
    UserCartItem: 'UserCartItem',
    OrderRequest: 'OrderRequest',
    OrderStatusHistory: 'OrderStatusHistory',
    OrderRequestItem: 'OrderRequestItem'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "product" | "transaction" | "transactionItem" | "storeSetting" | "notification" | "activityLog" | "userCart" | "userCartItem" | "orderRequest" | "orderStatusHistory" | "orderRequestItem"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Product: {
        payload: Prisma.$ProductPayload<ExtArgs>
        fields: Prisma.ProductFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProductFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProductFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findFirst: {
            args: Prisma.ProductFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProductFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          findMany: {
            args: Prisma.ProductFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          create: {
            args: Prisma.ProductCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          createMany: {
            args: Prisma.ProductCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProductCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          delete: {
            args: Prisma.ProductDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          update: {
            args: Prisma.ProductUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          deleteMany: {
            args: Prisma.ProductDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProductUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ProductUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>[]
          }
          upsert: {
            args: Prisma.ProductUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProductPayload>
          }
          aggregate: {
            args: Prisma.ProductAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProduct>
          }
          groupBy: {
            args: Prisma.ProductGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProductGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProductCountArgs<ExtArgs>
            result: $Utils.Optional<ProductCountAggregateOutputType> | number
          }
        }
      }
      Transaction: {
        payload: Prisma.$TransactionPayload<ExtArgs>
        fields: Prisma.TransactionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findFirst: {
            args: Prisma.TransactionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          findMany: {
            args: Prisma.TransactionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          create: {
            args: Prisma.TransactionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          createMany: {
            args: Prisma.TransactionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          delete: {
            args: Prisma.TransactionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          update: {
            args: Prisma.TransactionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          deleteMany: {
            args: Prisma.TransactionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>[]
          }
          upsert: {
            args: Prisma.TransactionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionPayload>
          }
          aggregate: {
            args: Prisma.TransactionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransaction>
          }
          groupBy: {
            args: Prisma.TransactionGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionCountAggregateOutputType> | number
          }
        }
      }
      TransactionItem: {
        payload: Prisma.$TransactionItemPayload<ExtArgs>
        fields: Prisma.TransactionItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.TransactionItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.TransactionItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          findFirst: {
            args: Prisma.TransactionItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.TransactionItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          findMany: {
            args: Prisma.TransactionItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>[]
          }
          create: {
            args: Prisma.TransactionItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          createMany: {
            args: Prisma.TransactionItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.TransactionItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>[]
          }
          delete: {
            args: Prisma.TransactionItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          update: {
            args: Prisma.TransactionItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          deleteMany: {
            args: Prisma.TransactionItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.TransactionItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.TransactionItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>[]
          }
          upsert: {
            args: Prisma.TransactionItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$TransactionItemPayload>
          }
          aggregate: {
            args: Prisma.TransactionItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateTransactionItem>
          }
          groupBy: {
            args: Prisma.TransactionItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<TransactionItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.TransactionItemCountArgs<ExtArgs>
            result: $Utils.Optional<TransactionItemCountAggregateOutputType> | number
          }
        }
      }
      StoreSetting: {
        payload: Prisma.$StoreSettingPayload<ExtArgs>
        fields: Prisma.StoreSettingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StoreSettingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StoreSettingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload>
          }
          findFirst: {
            args: Prisma.StoreSettingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StoreSettingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload>
          }
          findMany: {
            args: Prisma.StoreSettingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload>[]
          }
          create: {
            args: Prisma.StoreSettingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload>
          }
          createMany: {
            args: Prisma.StoreSettingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StoreSettingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload>[]
          }
          delete: {
            args: Prisma.StoreSettingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload>
          }
          update: {
            args: Prisma.StoreSettingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload>
          }
          deleteMany: {
            args: Prisma.StoreSettingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StoreSettingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StoreSettingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload>[]
          }
          upsert: {
            args: Prisma.StoreSettingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StoreSettingPayload>
          }
          aggregate: {
            args: Prisma.StoreSettingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStoreSetting>
          }
          groupBy: {
            args: Prisma.StoreSettingGroupByArgs<ExtArgs>
            result: $Utils.Optional<StoreSettingGroupByOutputType>[]
          }
          count: {
            args: Prisma.StoreSettingCountArgs<ExtArgs>
            result: $Utils.Optional<StoreSettingCountAggregateOutputType> | number
          }
        }
      }
      Notification: {
        payload: Prisma.$NotificationPayload<ExtArgs>
        fields: Prisma.NotificationFieldRefs
        operations: {
          findUnique: {
            args: Prisma.NotificationFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.NotificationFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findFirst: {
            args: Prisma.NotificationFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.NotificationFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          findMany: {
            args: Prisma.NotificationFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          create: {
            args: Prisma.NotificationCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          createMany: {
            args: Prisma.NotificationCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.NotificationCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          delete: {
            args: Prisma.NotificationDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          update: {
            args: Prisma.NotificationUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          deleteMany: {
            args: Prisma.NotificationDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.NotificationUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.NotificationUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>[]
          }
          upsert: {
            args: Prisma.NotificationUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$NotificationPayload>
          }
          aggregate: {
            args: Prisma.NotificationAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateNotification>
          }
          groupBy: {
            args: Prisma.NotificationGroupByArgs<ExtArgs>
            result: $Utils.Optional<NotificationGroupByOutputType>[]
          }
          count: {
            args: Prisma.NotificationCountArgs<ExtArgs>
            result: $Utils.Optional<NotificationCountAggregateOutputType> | number
          }
        }
      }
      ActivityLog: {
        payload: Prisma.$ActivityLogPayload<ExtArgs>
        fields: Prisma.ActivityLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ActivityLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ActivityLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          findFirst: {
            args: Prisma.ActivityLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ActivityLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          findMany: {
            args: Prisma.ActivityLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>[]
          }
          create: {
            args: Prisma.ActivityLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          createMany: {
            args: Prisma.ActivityLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ActivityLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>[]
          }
          delete: {
            args: Prisma.ActivityLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          update: {
            args: Prisma.ActivityLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          deleteMany: {
            args: Prisma.ActivityLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ActivityLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ActivityLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>[]
          }
          upsert: {
            args: Prisma.ActivityLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ActivityLogPayload>
          }
          aggregate: {
            args: Prisma.ActivityLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateActivityLog>
          }
          groupBy: {
            args: Prisma.ActivityLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ActivityLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ActivityLogCountArgs<ExtArgs>
            result: $Utils.Optional<ActivityLogCountAggregateOutputType> | number
          }
        }
      }
      UserCart: {
        payload: Prisma.$UserCartPayload<ExtArgs>
        fields: Prisma.UserCartFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserCartFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserCartFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload>
          }
          findFirst: {
            args: Prisma.UserCartFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserCartFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload>
          }
          findMany: {
            args: Prisma.UserCartFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload>[]
          }
          create: {
            args: Prisma.UserCartCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload>
          }
          createMany: {
            args: Prisma.UserCartCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCartCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload>[]
          }
          delete: {
            args: Prisma.UserCartDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload>
          }
          update: {
            args: Prisma.UserCartUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload>
          }
          deleteMany: {
            args: Prisma.UserCartDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserCartUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserCartUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload>[]
          }
          upsert: {
            args: Prisma.UserCartUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartPayload>
          }
          aggregate: {
            args: Prisma.UserCartAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserCart>
          }
          groupBy: {
            args: Prisma.UserCartGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserCartGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCartCountArgs<ExtArgs>
            result: $Utils.Optional<UserCartCountAggregateOutputType> | number
          }
        }
      }
      UserCartItem: {
        payload: Prisma.$UserCartItemPayload<ExtArgs>
        fields: Prisma.UserCartItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserCartItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserCartItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload>
          }
          findFirst: {
            args: Prisma.UserCartItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserCartItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload>
          }
          findMany: {
            args: Prisma.UserCartItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload>[]
          }
          create: {
            args: Prisma.UserCartItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload>
          }
          createMany: {
            args: Prisma.UserCartItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCartItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload>[]
          }
          delete: {
            args: Prisma.UserCartItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload>
          }
          update: {
            args: Prisma.UserCartItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload>
          }
          deleteMany: {
            args: Prisma.UserCartItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserCartItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserCartItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload>[]
          }
          upsert: {
            args: Prisma.UserCartItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserCartItemPayload>
          }
          aggregate: {
            args: Prisma.UserCartItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserCartItem>
          }
          groupBy: {
            args: Prisma.UserCartItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserCartItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCartItemCountArgs<ExtArgs>
            result: $Utils.Optional<UserCartItemCountAggregateOutputType> | number
          }
        }
      }
      OrderRequest: {
        payload: Prisma.$OrderRequestPayload<ExtArgs>
        fields: Prisma.OrderRequestFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderRequestFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderRequestFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload>
          }
          findFirst: {
            args: Prisma.OrderRequestFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderRequestFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload>
          }
          findMany: {
            args: Prisma.OrderRequestFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload>[]
          }
          create: {
            args: Prisma.OrderRequestCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload>
          }
          createMany: {
            args: Prisma.OrderRequestCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderRequestCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload>[]
          }
          delete: {
            args: Prisma.OrderRequestDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload>
          }
          update: {
            args: Prisma.OrderRequestUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload>
          }
          deleteMany: {
            args: Prisma.OrderRequestDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderRequestUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderRequestUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload>[]
          }
          upsert: {
            args: Prisma.OrderRequestUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestPayload>
          }
          aggregate: {
            args: Prisma.OrderRequestAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrderRequest>
          }
          groupBy: {
            args: Prisma.OrderRequestGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderRequestGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderRequestCountArgs<ExtArgs>
            result: $Utils.Optional<OrderRequestCountAggregateOutputType> | number
          }
        }
      }
      OrderStatusHistory: {
        payload: Prisma.$OrderStatusHistoryPayload<ExtArgs>
        fields: Prisma.OrderStatusHistoryFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderStatusHistoryFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderStatusHistoryFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload>
          }
          findFirst: {
            args: Prisma.OrderStatusHistoryFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderStatusHistoryFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload>
          }
          findMany: {
            args: Prisma.OrderStatusHistoryFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload>[]
          }
          create: {
            args: Prisma.OrderStatusHistoryCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload>
          }
          createMany: {
            args: Prisma.OrderStatusHistoryCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderStatusHistoryCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload>[]
          }
          delete: {
            args: Prisma.OrderStatusHistoryDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload>
          }
          update: {
            args: Prisma.OrderStatusHistoryUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload>
          }
          deleteMany: {
            args: Prisma.OrderStatusHistoryDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderStatusHistoryUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderStatusHistoryUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload>[]
          }
          upsert: {
            args: Prisma.OrderStatusHistoryUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderStatusHistoryPayload>
          }
          aggregate: {
            args: Prisma.OrderStatusHistoryAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrderStatusHistory>
          }
          groupBy: {
            args: Prisma.OrderStatusHistoryGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderStatusHistoryGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderStatusHistoryCountArgs<ExtArgs>
            result: $Utils.Optional<OrderStatusHistoryCountAggregateOutputType> | number
          }
        }
      }
      OrderRequestItem: {
        payload: Prisma.$OrderRequestItemPayload<ExtArgs>
        fields: Prisma.OrderRequestItemFieldRefs
        operations: {
          findUnique: {
            args: Prisma.OrderRequestItemFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.OrderRequestItemFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload>
          }
          findFirst: {
            args: Prisma.OrderRequestItemFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.OrderRequestItemFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload>
          }
          findMany: {
            args: Prisma.OrderRequestItemFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload>[]
          }
          create: {
            args: Prisma.OrderRequestItemCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload>
          }
          createMany: {
            args: Prisma.OrderRequestItemCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.OrderRequestItemCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload>[]
          }
          delete: {
            args: Prisma.OrderRequestItemDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload>
          }
          update: {
            args: Prisma.OrderRequestItemUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload>
          }
          deleteMany: {
            args: Prisma.OrderRequestItemDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.OrderRequestItemUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.OrderRequestItemUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload>[]
          }
          upsert: {
            args: Prisma.OrderRequestItemUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$OrderRequestItemPayload>
          }
          aggregate: {
            args: Prisma.OrderRequestItemAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateOrderRequestItem>
          }
          groupBy: {
            args: Prisma.OrderRequestItemGroupByArgs<ExtArgs>
            result: $Utils.Optional<OrderRequestItemGroupByOutputType>[]
          }
          count: {
            args: Prisma.OrderRequestItemCountArgs<ExtArgs>
            result: $Utils.Optional<OrderRequestItemCountAggregateOutputType> | number
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
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
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
    adapter?: runtime.SqlDriverAdapterFactory | null
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
    user?: UserOmit
    product?: ProductOmit
    transaction?: TransactionOmit
    transactionItem?: TransactionItemOmit
    storeSetting?: StoreSettingOmit
    notification?: NotificationOmit
    activityLog?: ActivityLogOmit
    userCart?: UserCartOmit
    userCartItem?: UserCartItemOmit
    orderRequest?: OrderRequestOmit
    orderStatusHistory?: OrderStatusHistoryOmit
    orderRequestItem?: OrderRequestItemOmit
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
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    carts: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carts?: boolean | UserCountOutputTypeCountCartsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountCartsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserCartWhereInput
  }


  /**
   * Count Type ProductCountOutputType
   */

  export type ProductCountOutputType = {
    TransactionItems: number
    cartItems: number
    orderRequestItems: number
  }

  export type ProductCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    TransactionItems?: boolean | ProductCountOutputTypeCountTransactionItemsArgs
    cartItems?: boolean | ProductCountOutputTypeCountCartItemsArgs
    orderRequestItems?: boolean | ProductCountOutputTypeCountOrderRequestItemsArgs
  }

  // Custom InputTypes
  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ProductCountOutputType
     */
    select?: ProductCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountTransactionItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionItemWhereInput
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountCartItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserCartItemWhereInput
  }

  /**
   * ProductCountOutputType without action
   */
  export type ProductCountOutputTypeCountOrderRequestItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderRequestItemWhereInput
  }


  /**
   * Count Type TransactionCountOutputType
   */

  export type TransactionCountOutputType = {
    items: number
    notifications: number
  }

  export type TransactionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | TransactionCountOutputTypeCountItemsArgs
    notifications?: boolean | TransactionCountOutputTypeCountNotificationsArgs
  }

  // Custom InputTypes
  /**
   * TransactionCountOutputType without action
   */
  export type TransactionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionCountOutputType
     */
    select?: TransactionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * TransactionCountOutputType without action
   */
  export type TransactionCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionItemWhereInput
  }

  /**
   * TransactionCountOutputType without action
   */
  export type TransactionCountOutputTypeCountNotificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
  }


  /**
   * Count Type UserCartCountOutputType
   */

  export type UserCartCountOutputType = {
    items: number
  }

  export type UserCartCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | UserCartCountOutputTypeCountItemsArgs
  }

  // Custom InputTypes
  /**
   * UserCartCountOutputType without action
   */
  export type UserCartCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartCountOutputType
     */
    select?: UserCartCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCartCountOutputType without action
   */
  export type UserCartCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserCartItemWhereInput
  }


  /**
   * Count Type OrderRequestCountOutputType
   */

  export type OrderRequestCountOutputType = {
    items: number
    statusHistory: number
  }

  export type OrderRequestCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | OrderRequestCountOutputTypeCountItemsArgs
    statusHistory?: boolean | OrderRequestCountOutputTypeCountStatusHistoryArgs
  }

  // Custom InputTypes
  /**
   * OrderRequestCountOutputType without action
   */
  export type OrderRequestCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestCountOutputType
     */
    select?: OrderRequestCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * OrderRequestCountOutputType without action
   */
  export type OrderRequestCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderRequestItemWhereInput
  }

  /**
   * OrderRequestCountOutputType without action
   */
  export type OrderRequestCountOutputTypeCountStatusHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderStatusHistoryWhereInput
  }


  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    username: string | null
    fullName: string | null
    profilePhoto: string | null
    password: string | null
    role: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    username: string | null
    fullName: string | null
    profilePhoto: string | null
    password: string | null
    role: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    username: number
    fullName: number
    profilePhoto: number
    password: number
    role: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    username?: true
    fullName?: true
    profilePhoto?: true
    password?: true
    role?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    username?: true
    fullName?: true
    profilePhoto?: true
    password?: true
    role?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    username?: true
    fullName?: true
    profilePhoto?: true
    password?: true
    role?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    username: string
    fullName: string
    profilePhoto: string | null
    password: string
    role: string
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    fullName?: boolean
    profilePhoto?: boolean
    password?: boolean
    role?: boolean
    carts?: boolean | User$cartsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    fullName?: boolean
    profilePhoto?: boolean
    password?: boolean
    role?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    username?: boolean
    fullName?: boolean
    profilePhoto?: boolean
    password?: boolean
    role?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    username?: boolean
    fullName?: boolean
    profilePhoto?: boolean
    password?: boolean
    role?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "username" | "fullName" | "profilePhoto" | "password" | "role", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    carts?: boolean | User$cartsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      carts: Prisma.$UserCartPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      username: string
      fullName: string
      profilePhoto: string | null
      password: string
      role: string
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
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
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    carts<T extends User$cartsArgs<ExtArgs> = {}>(args?: Subset<T, User$cartsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly username: FieldRef<"User", 'String'>
    readonly fullName: FieldRef<"User", 'String'>
    readonly profilePhoto: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.carts
   */
  export type User$cartsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    where?: UserCartWhereInput
    orderBy?: UserCartOrderByWithRelationInput | UserCartOrderByWithRelationInput[]
    cursor?: UserCartWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserCartScalarFieldEnum | UserCartScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model Product
   */

  export type AggregateProduct = {
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  export type ProductAvgAggregateOutputType = {
    id: number | null
    harga: number | null
    stok: number | null
    gambarPosX: number | null
    gambarPosY: number | null
  }

  export type ProductSumAggregateOutputType = {
    id: number | null
    harga: number | null
    stok: number | null
    gambarPosX: number | null
    gambarPosY: number | null
  }

  export type ProductMinAggregateOutputType = {
    id: number | null
    nama_produk: string | null
    harga: number | null
    satuanHarga: string | null
    stok: number | null
    barcode: string | null
    gambar: string | null
    gambarPosX: number | null
    gambarPosY: number | null
    isArchived: boolean | null
  }

  export type ProductMaxAggregateOutputType = {
    id: number | null
    nama_produk: string | null
    harga: number | null
    satuanHarga: string | null
    stok: number | null
    barcode: string | null
    gambar: string | null
    gambarPosX: number | null
    gambarPosY: number | null
    isArchived: boolean | null
  }

  export type ProductCountAggregateOutputType = {
    id: number
    nama_produk: number
    harga: number
    satuanHarga: number
    stok: number
    barcode: number
    gambar: number
    gambarPosX: number
    gambarPosY: number
    isArchived: number
    _all: number
  }


  export type ProductAvgAggregateInputType = {
    id?: true
    harga?: true
    stok?: true
    gambarPosX?: true
    gambarPosY?: true
  }

  export type ProductSumAggregateInputType = {
    id?: true
    harga?: true
    stok?: true
    gambarPosX?: true
    gambarPosY?: true
  }

  export type ProductMinAggregateInputType = {
    id?: true
    nama_produk?: true
    harga?: true
    satuanHarga?: true
    stok?: true
    barcode?: true
    gambar?: true
    gambarPosX?: true
    gambarPosY?: true
    isArchived?: true
  }

  export type ProductMaxAggregateInputType = {
    id?: true
    nama_produk?: true
    harga?: true
    satuanHarga?: true
    stok?: true
    barcode?: true
    gambar?: true
    gambarPosX?: true
    gambarPosY?: true
    isArchived?: true
  }

  export type ProductCountAggregateInputType = {
    id?: true
    nama_produk?: true
    harga?: true
    satuanHarga?: true
    stok?: true
    barcode?: true
    gambar?: true
    gambarPosX?: true
    gambarPosY?: true
    isArchived?: true
    _all?: true
  }

  export type ProductAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Product to aggregate.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Products
    **/
    _count?: true | ProductCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProductAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProductSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProductMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProductMaxAggregateInputType
  }

  export type GetProductAggregateType<T extends ProductAggregateArgs> = {
        [P in keyof T & keyof AggregateProduct]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProduct[P]>
      : GetScalarType<T[P], AggregateProduct[P]>
  }




  export type ProductGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProductWhereInput
    orderBy?: ProductOrderByWithAggregationInput | ProductOrderByWithAggregationInput[]
    by: ProductScalarFieldEnum[] | ProductScalarFieldEnum
    having?: ProductScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProductCountAggregateInputType | true
    _avg?: ProductAvgAggregateInputType
    _sum?: ProductSumAggregateInputType
    _min?: ProductMinAggregateInputType
    _max?: ProductMaxAggregateInputType
  }

  export type ProductGroupByOutputType = {
    id: number
    nama_produk: string
    harga: number
    satuanHarga: string
    stok: number
    barcode: string | null
    gambar: string | null
    gambarPosX: number
    gambarPosY: number
    isArchived: boolean
    _count: ProductCountAggregateOutputType | null
    _avg: ProductAvgAggregateOutputType | null
    _sum: ProductSumAggregateOutputType | null
    _min: ProductMinAggregateOutputType | null
    _max: ProductMaxAggregateOutputType | null
  }

  type GetProductGroupByPayload<T extends ProductGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProductGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProductGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProductGroupByOutputType[P]>
            : GetScalarType<T[P], ProductGroupByOutputType[P]>
        }
      >
    >


  export type ProductSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nama_produk?: boolean
    harga?: boolean
    satuanHarga?: boolean
    stok?: boolean
    barcode?: boolean
    gambar?: boolean
    gambarPosX?: boolean
    gambarPosY?: boolean
    isArchived?: boolean
    TransactionItems?: boolean | Product$TransactionItemsArgs<ExtArgs>
    cartItems?: boolean | Product$cartItemsArgs<ExtArgs>
    orderRequestItems?: boolean | Product$orderRequestItemsArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["product"]>

  export type ProductSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nama_produk?: boolean
    harga?: boolean
    satuanHarga?: boolean
    stok?: boolean
    barcode?: boolean
    gambar?: boolean
    gambarPosX?: boolean
    gambarPosY?: boolean
    isArchived?: boolean
  }, ExtArgs["result"]["product"]>

  export type ProductSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    nama_produk?: boolean
    harga?: boolean
    satuanHarga?: boolean
    stok?: boolean
    barcode?: boolean
    gambar?: boolean
    gambarPosX?: boolean
    gambarPosY?: boolean
    isArchived?: boolean
  }, ExtArgs["result"]["product"]>

  export type ProductSelectScalar = {
    id?: boolean
    nama_produk?: boolean
    harga?: boolean
    satuanHarga?: boolean
    stok?: boolean
    barcode?: boolean
    gambar?: boolean
    gambarPosX?: boolean
    gambarPosY?: boolean
    isArchived?: boolean
  }

  export type ProductOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "nama_produk" | "harga" | "satuanHarga" | "stok" | "barcode" | "gambar" | "gambarPosX" | "gambarPosY" | "isArchived", ExtArgs["result"]["product"]>
  export type ProductInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    TransactionItems?: boolean | Product$TransactionItemsArgs<ExtArgs>
    cartItems?: boolean | Product$cartItemsArgs<ExtArgs>
    orderRequestItems?: boolean | Product$orderRequestItemsArgs<ExtArgs>
    _count?: boolean | ProductCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ProductIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ProductIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ProductPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Product"
    objects: {
      TransactionItems: Prisma.$TransactionItemPayload<ExtArgs>[]
      cartItems: Prisma.$UserCartItemPayload<ExtArgs>[]
      orderRequestItems: Prisma.$OrderRequestItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      nama_produk: string
      harga: number
      satuanHarga: string
      stok: number
      barcode: string | null
      gambar: string | null
      gambarPosX: number
      gambarPosY: number
      isArchived: boolean
    }, ExtArgs["result"]["product"]>
    composites: {}
  }

  type ProductGetPayload<S extends boolean | null | undefined | ProductDefaultArgs> = $Result.GetResult<Prisma.$ProductPayload, S>

  type ProductCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ProductFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ProductCountAggregateInputType | true
    }

  export interface ProductDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Product'], meta: { name: 'Product' } }
    /**
     * Find zero or one Product that matches the filter.
     * @param {ProductFindUniqueArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProductFindUniqueArgs>(args: SelectSubset<T, ProductFindUniqueArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Product that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ProductFindUniqueOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProductFindUniqueOrThrowArgs>(args: SelectSubset<T, ProductFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProductFindFirstArgs>(args?: SelectSubset<T, ProductFindFirstArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Product that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindFirstOrThrowArgs} args - Arguments to find a Product
     * @example
     * // Get one Product
     * const product = await prisma.product.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProductFindFirstOrThrowArgs>(args?: SelectSubset<T, ProductFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Products that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Products
     * const products = await prisma.product.findMany()
     * 
     * // Get first 10 Products
     * const products = await prisma.product.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const productWithIdOnly = await prisma.product.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProductFindManyArgs>(args?: SelectSubset<T, ProductFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Product.
     * @param {ProductCreateArgs} args - Arguments to create a Product.
     * @example
     * // Create one Product
     * const Product = await prisma.product.create({
     *   data: {
     *     // ... data to create a Product
     *   }
     * })
     * 
     */
    create<T extends ProductCreateArgs>(args: SelectSubset<T, ProductCreateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Products.
     * @param {ProductCreateManyArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProductCreateManyArgs>(args?: SelectSubset<T, ProductCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Products and returns the data saved in the database.
     * @param {ProductCreateManyAndReturnArgs} args - Arguments to create many Products.
     * @example
     * // Create many Products
     * const product = await prisma.product.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Products and only return the `id`
     * const productWithIdOnly = await prisma.product.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProductCreateManyAndReturnArgs>(args?: SelectSubset<T, ProductCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Product.
     * @param {ProductDeleteArgs} args - Arguments to delete one Product.
     * @example
     * // Delete one Product
     * const Product = await prisma.product.delete({
     *   where: {
     *     // ... filter to delete one Product
     *   }
     * })
     * 
     */
    delete<T extends ProductDeleteArgs>(args: SelectSubset<T, ProductDeleteArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Product.
     * @param {ProductUpdateArgs} args - Arguments to update one Product.
     * @example
     * // Update one Product
     * const product = await prisma.product.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProductUpdateArgs>(args: SelectSubset<T, ProductUpdateArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Products.
     * @param {ProductDeleteManyArgs} args - Arguments to filter Products to delete.
     * @example
     * // Delete a few Products
     * const { count } = await prisma.product.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProductDeleteManyArgs>(args?: SelectSubset<T, ProductDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProductUpdateManyArgs>(args: SelectSubset<T, ProductUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Products and returns the data updated in the database.
     * @param {ProductUpdateManyAndReturnArgs} args - Arguments to update many Products.
     * @example
     * // Update many Products
     * const product = await prisma.product.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Products and only return the `id`
     * const productWithIdOnly = await prisma.product.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ProductUpdateManyAndReturnArgs>(args: SelectSubset<T, ProductUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Product.
     * @param {ProductUpsertArgs} args - Arguments to update or create a Product.
     * @example
     * // Update or create a Product
     * const product = await prisma.product.upsert({
     *   create: {
     *     // ... data to create a Product
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Product we want to update
     *   }
     * })
     */
    upsert<T extends ProductUpsertArgs>(args: SelectSubset<T, ProductUpsertArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Products.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductCountArgs} args - Arguments to filter Products to count.
     * @example
     * // Count the number of Products
     * const count = await prisma.product.count({
     *   where: {
     *     // ... the filter for the Products we want to count
     *   }
     * })
    **/
    count<T extends ProductCountArgs>(
      args?: Subset<T, ProductCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProductCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ProductAggregateArgs>(args: Subset<T, ProductAggregateArgs>): Prisma.PrismaPromise<GetProductAggregateType<T>>

    /**
     * Group by Product.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProductGroupByArgs} args - Group by arguments.
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
      T extends ProductGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProductGroupByArgs['orderBy'] }
        : { orderBy?: ProductGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ProductGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProductGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Product model
   */
  readonly fields: ProductFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Product.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProductClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    TransactionItems<T extends Product$TransactionItemsArgs<ExtArgs> = {}>(args?: Subset<T, Product$TransactionItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    cartItems<T extends Product$cartItemsArgs<ExtArgs> = {}>(args?: Subset<T, Product$cartItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    orderRequestItems<T extends Product$orderRequestItemsArgs<ExtArgs> = {}>(args?: Subset<T, Product$orderRequestItemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the Product model
   */
  interface ProductFieldRefs {
    readonly id: FieldRef<"Product", 'Int'>
    readonly nama_produk: FieldRef<"Product", 'String'>
    readonly harga: FieldRef<"Product", 'Int'>
    readonly satuanHarga: FieldRef<"Product", 'String'>
    readonly stok: FieldRef<"Product", 'Int'>
    readonly barcode: FieldRef<"Product", 'String'>
    readonly gambar: FieldRef<"Product", 'String'>
    readonly gambarPosX: FieldRef<"Product", 'Int'>
    readonly gambarPosY: FieldRef<"Product", 'Int'>
    readonly isArchived: FieldRef<"Product", 'Boolean'>
  }
    

  // Custom InputTypes
  /**
   * Product findUnique
   */
  export type ProductFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findUniqueOrThrow
   */
  export type ProductFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product findFirst
   */
  export type ProductFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findFirstOrThrow
   */
  export type ProductFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Product to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Products.
     */
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product findMany
   */
  export type ProductFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter, which Products to fetch.
     */
    where?: ProductWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Products to fetch.
     */
    orderBy?: ProductOrderByWithRelationInput | ProductOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Products.
     */
    cursor?: ProductWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Products from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Products.
     */
    skip?: number
    distinct?: ProductScalarFieldEnum | ProductScalarFieldEnum[]
  }

  /**
   * Product create
   */
  export type ProductCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to create a Product.
     */
    data: XOR<ProductCreateInput, ProductUncheckedCreateInput>
  }

  /**
   * Product createMany
   */
  export type ProductCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product createManyAndReturn
   */
  export type ProductCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to create many Products.
     */
    data: ProductCreateManyInput | ProductCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Product update
   */
  export type ProductUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The data needed to update a Product.
     */
    data: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
    /**
     * Choose, which Product to update.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product updateMany
   */
  export type ProductUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product updateManyAndReturn
   */
  export type ProductUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * The data used to update Products.
     */
    data: XOR<ProductUpdateManyMutationInput, ProductUncheckedUpdateManyInput>
    /**
     * Filter which Products to update
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to update.
     */
    limit?: number
  }

  /**
   * Product upsert
   */
  export type ProductUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * The filter to search for the Product to update in case it exists.
     */
    where: ProductWhereUniqueInput
    /**
     * In case the Product found by the `where` argument doesn't exist, create a new Product with this data.
     */
    create: XOR<ProductCreateInput, ProductUncheckedCreateInput>
    /**
     * In case the Product was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProductUpdateInput, ProductUncheckedUpdateInput>
  }

  /**
   * Product delete
   */
  export type ProductDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
    /**
     * Filter which Product to delete.
     */
    where: ProductWhereUniqueInput
  }

  /**
   * Product deleteMany
   */
  export type ProductDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Products to delete
     */
    where?: ProductWhereInput
    /**
     * Limit how many Products to delete.
     */
    limit?: number
  }

  /**
   * Product.TransactionItems
   */
  export type Product$TransactionItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    where?: TransactionItemWhereInput
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    cursor?: TransactionItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * Product.cartItems
   */
  export type Product$cartItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    where?: UserCartItemWhereInput
    orderBy?: UserCartItemOrderByWithRelationInput | UserCartItemOrderByWithRelationInput[]
    cursor?: UserCartItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserCartItemScalarFieldEnum | UserCartItemScalarFieldEnum[]
  }

  /**
   * Product.orderRequestItems
   */
  export type Product$orderRequestItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    where?: OrderRequestItemWhereInput
    orderBy?: OrderRequestItemOrderByWithRelationInput | OrderRequestItemOrderByWithRelationInput[]
    cursor?: OrderRequestItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderRequestItemScalarFieldEnum | OrderRequestItemScalarFieldEnum[]
  }

  /**
   * Product without action
   */
  export type ProductDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Product
     */
    select?: ProductSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Product
     */
    omit?: ProductOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProductInclude<ExtArgs> | null
  }


  /**
   * Model Transaction
   */

  export type AggregateTransaction = {
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  export type TransactionAvgAggregateOutputType = {
    id: number | null
    total_harga: number | null
  }

  export type TransactionSumAggregateOutputType = {
    id: number | null
    total_harga: number | null
  }

  export type TransactionMinAggregateOutputType = {
    id: number | null
    tanggal: Date | null
    total_harga: number | null
    metode_pembayaran: string | null
    status: string | null
    nama_pembeli: string | null
    nama_kasir: string | null
    status_pengiriman: string | null
    nama_pengrajin: string | null
  }

  export type TransactionMaxAggregateOutputType = {
    id: number | null
    tanggal: Date | null
    total_harga: number | null
    metode_pembayaran: string | null
    status: string | null
    nama_pembeli: string | null
    nama_kasir: string | null
    status_pengiriman: string | null
    nama_pengrajin: string | null
  }

  export type TransactionCountAggregateOutputType = {
    id: number
    tanggal: number
    total_harga: number
    metode_pembayaran: number
    status: number
    nama_pembeli: number
    nama_kasir: number
    status_pengiriman: number
    nama_pengrajin: number
    _all: number
  }


  export type TransactionAvgAggregateInputType = {
    id?: true
    total_harga?: true
  }

  export type TransactionSumAggregateInputType = {
    id?: true
    total_harga?: true
  }

  export type TransactionMinAggregateInputType = {
    id?: true
    tanggal?: true
    total_harga?: true
    metode_pembayaran?: true
    status?: true
    nama_pembeli?: true
    nama_kasir?: true
    status_pengiriman?: true
    nama_pengrajin?: true
  }

  export type TransactionMaxAggregateInputType = {
    id?: true
    tanggal?: true
    total_harga?: true
    metode_pembayaran?: true
    status?: true
    nama_pembeli?: true
    nama_kasir?: true
    status_pengiriman?: true
    nama_pengrajin?: true
  }

  export type TransactionCountAggregateInputType = {
    id?: true
    tanggal?: true
    total_harga?: true
    metode_pembayaran?: true
    status?: true
    nama_pembeli?: true
    nama_kasir?: true
    status_pengiriman?: true
    nama_pengrajin?: true
    _all?: true
  }

  export type TransactionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transaction to aggregate.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Transactions
    **/
    _count?: true | TransactionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionMaxAggregateInputType
  }

  export type GetTransactionAggregateType<T extends TransactionAggregateArgs> = {
        [P in keyof T & keyof AggregateTransaction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransaction[P]>
      : GetScalarType<T[P], AggregateTransaction[P]>
  }




  export type TransactionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionWhereInput
    orderBy?: TransactionOrderByWithAggregationInput | TransactionOrderByWithAggregationInput[]
    by: TransactionScalarFieldEnum[] | TransactionScalarFieldEnum
    having?: TransactionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionCountAggregateInputType | true
    _avg?: TransactionAvgAggregateInputType
    _sum?: TransactionSumAggregateInputType
    _min?: TransactionMinAggregateInputType
    _max?: TransactionMaxAggregateInputType
  }

  export type TransactionGroupByOutputType = {
    id: number
    tanggal: Date
    total_harga: number
    metode_pembayaran: string
    status: string
    nama_pembeli: string | null
    nama_kasir: string | null
    status_pengiriman: string
    nama_pengrajin: string | null
    _count: TransactionCountAggregateOutputType | null
    _avg: TransactionAvgAggregateOutputType | null
    _sum: TransactionSumAggregateOutputType | null
    _min: TransactionMinAggregateOutputType | null
    _max: TransactionMaxAggregateOutputType | null
  }

  type GetTransactionGroupByPayload<T extends TransactionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionGroupByOutputType[P]>
        }
      >
    >


  export type TransactionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    total_harga?: boolean
    metode_pembayaran?: boolean
    status?: boolean
    nama_pembeli?: boolean
    nama_kasir?: boolean
    status_pengiriman?: boolean
    nama_pengrajin?: boolean
    items?: boolean | Transaction$itemsArgs<ExtArgs>
    notifications?: boolean | Transaction$notificationsArgs<ExtArgs>
    orderRequest?: boolean | Transaction$orderRequestArgs<ExtArgs>
    _count?: boolean | TransactionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    total_harga?: boolean
    metode_pembayaran?: boolean
    status?: boolean
    nama_pembeli?: boolean
    nama_kasir?: boolean
    status_pengiriman?: boolean
    nama_pengrajin?: boolean
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    tanggal?: boolean
    total_harga?: boolean
    metode_pembayaran?: boolean
    status?: boolean
    nama_pembeli?: boolean
    nama_kasir?: boolean
    status_pengiriman?: boolean
    nama_pengrajin?: boolean
  }, ExtArgs["result"]["transaction"]>

  export type TransactionSelectScalar = {
    id?: boolean
    tanggal?: boolean
    total_harga?: boolean
    metode_pembayaran?: boolean
    status?: boolean
    nama_pembeli?: boolean
    nama_kasir?: boolean
    status_pengiriman?: boolean
    nama_pengrajin?: boolean
  }

  export type TransactionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "tanggal" | "total_harga" | "metode_pembayaran" | "status" | "nama_pembeli" | "nama_kasir" | "status_pengiriman" | "nama_pengrajin", ExtArgs["result"]["transaction"]>
  export type TransactionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | Transaction$itemsArgs<ExtArgs>
    notifications?: boolean | Transaction$notificationsArgs<ExtArgs>
    orderRequest?: boolean | Transaction$orderRequestArgs<ExtArgs>
    _count?: boolean | TransactionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type TransactionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type TransactionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $TransactionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Transaction"
    objects: {
      items: Prisma.$TransactionItemPayload<ExtArgs>[]
      notifications: Prisma.$NotificationPayload<ExtArgs>[]
      orderRequest: Prisma.$OrderRequestPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      tanggal: Date
      total_harga: number
      metode_pembayaran: string
      status: string
      nama_pembeli: string | null
      nama_kasir: string | null
      status_pengiriman: string
      nama_pengrajin: string | null
    }, ExtArgs["result"]["transaction"]>
    composites: {}
  }

  type TransactionGetPayload<S extends boolean | null | undefined | TransactionDefaultArgs> = $Result.GetResult<Prisma.$TransactionPayload, S>

  type TransactionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionCountAggregateInputType | true
    }

  export interface TransactionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Transaction'], meta: { name: 'Transaction' } }
    /**
     * Find zero or one Transaction that matches the filter.
     * @param {TransactionFindUniqueArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionFindUniqueArgs>(args: SelectSubset<T, TransactionFindUniqueArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Transaction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionFindUniqueOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionFindFirstArgs>(args?: SelectSubset<T, TransactionFindFirstArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Transaction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindFirstOrThrowArgs} args - Arguments to find a Transaction
     * @example
     * // Get one Transaction
     * const transaction = await prisma.transaction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Transactions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Transactions
     * const transactions = await prisma.transaction.findMany()
     * 
     * // Get first 10 Transactions
     * const transactions = await prisma.transaction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionWithIdOnly = await prisma.transaction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionFindManyArgs>(args?: SelectSubset<T, TransactionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Transaction.
     * @param {TransactionCreateArgs} args - Arguments to create a Transaction.
     * @example
     * // Create one Transaction
     * const Transaction = await prisma.transaction.create({
     *   data: {
     *     // ... data to create a Transaction
     *   }
     * })
     * 
     */
    create<T extends TransactionCreateArgs>(args: SelectSubset<T, TransactionCreateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Transactions.
     * @param {TransactionCreateManyArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionCreateManyArgs>(args?: SelectSubset<T, TransactionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Transactions and returns the data saved in the database.
     * @param {TransactionCreateManyAndReturnArgs} args - Arguments to create many Transactions.
     * @example
     * // Create many Transactions
     * const transaction = await prisma.transaction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Transaction.
     * @param {TransactionDeleteArgs} args - Arguments to delete one Transaction.
     * @example
     * // Delete one Transaction
     * const Transaction = await prisma.transaction.delete({
     *   where: {
     *     // ... filter to delete one Transaction
     *   }
     * })
     * 
     */
    delete<T extends TransactionDeleteArgs>(args: SelectSubset<T, TransactionDeleteArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Transaction.
     * @param {TransactionUpdateArgs} args - Arguments to update one Transaction.
     * @example
     * // Update one Transaction
     * const transaction = await prisma.transaction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionUpdateArgs>(args: SelectSubset<T, TransactionUpdateArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Transactions.
     * @param {TransactionDeleteManyArgs} args - Arguments to filter Transactions to delete.
     * @example
     * // Delete a few Transactions
     * const { count } = await prisma.transaction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionDeleteManyArgs>(args?: SelectSubset<T, TransactionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionUpdateManyArgs>(args: SelectSubset<T, TransactionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Transactions and returns the data updated in the database.
     * @param {TransactionUpdateManyAndReturnArgs} args - Arguments to update many Transactions.
     * @example
     * // Update many Transactions
     * const transaction = await prisma.transaction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Transactions and only return the `id`
     * const transactionWithIdOnly = await prisma.transaction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TransactionUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Transaction.
     * @param {TransactionUpsertArgs} args - Arguments to update or create a Transaction.
     * @example
     * // Update or create a Transaction
     * const transaction = await prisma.transaction.upsert({
     *   create: {
     *     // ... data to create a Transaction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Transaction we want to update
     *   }
     * })
     */
    upsert<T extends TransactionUpsertArgs>(args: SelectSubset<T, TransactionUpsertArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Transactions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionCountArgs} args - Arguments to filter Transactions to count.
     * @example
     * // Count the number of Transactions
     * const count = await prisma.transaction.count({
     *   where: {
     *     // ... the filter for the Transactions we want to count
     *   }
     * })
    **/
    count<T extends TransactionCountArgs>(
      args?: Subset<T, TransactionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TransactionAggregateArgs>(args: Subset<T, TransactionAggregateArgs>): Prisma.PrismaPromise<GetTransactionAggregateType<T>>

    /**
     * Group by Transaction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionGroupByArgs} args - Group by arguments.
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
      T extends TransactionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionGroupByArgs['orderBy'] }
        : { orderBy?: TransactionGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TransactionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Transaction model
   */
  readonly fields: TransactionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Transaction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    items<T extends Transaction$itemsArgs<ExtArgs> = {}>(args?: Subset<T, Transaction$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    notifications<T extends Transaction$notificationsArgs<ExtArgs> = {}>(args?: Subset<T, Transaction$notificationsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    orderRequest<T extends Transaction$orderRequestArgs<ExtArgs> = {}>(args?: Subset<T, Transaction$orderRequestArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Transaction model
   */
  interface TransactionFieldRefs {
    readonly id: FieldRef<"Transaction", 'Int'>
    readonly tanggal: FieldRef<"Transaction", 'DateTime'>
    readonly total_harga: FieldRef<"Transaction", 'Int'>
    readonly metode_pembayaran: FieldRef<"Transaction", 'String'>
    readonly status: FieldRef<"Transaction", 'String'>
    readonly nama_pembeli: FieldRef<"Transaction", 'String'>
    readonly nama_kasir: FieldRef<"Transaction", 'String'>
    readonly status_pengiriman: FieldRef<"Transaction", 'String'>
    readonly nama_pengrajin: FieldRef<"Transaction", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Transaction findUnique
   */
  export type TransactionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findUniqueOrThrow
   */
  export type TransactionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction findFirst
   */
  export type TransactionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findFirstOrThrow
   */
  export type TransactionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transaction to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Transactions.
     */
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction findMany
   */
  export type TransactionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter, which Transactions to fetch.
     */
    where?: TransactionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Transactions to fetch.
     */
    orderBy?: TransactionOrderByWithRelationInput | TransactionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Transactions.
     */
    cursor?: TransactionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Transactions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Transactions.
     */
    skip?: number
    distinct?: TransactionScalarFieldEnum | TransactionScalarFieldEnum[]
  }

  /**
   * Transaction create
   */
  export type TransactionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to create a Transaction.
     */
    data: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
  }

  /**
   * Transaction createMany
   */
  export type TransactionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Transaction createManyAndReturn
   */
  export type TransactionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to create many Transactions.
     */
    data: TransactionCreateManyInput | TransactionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Transaction update
   */
  export type TransactionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The data needed to update a Transaction.
     */
    data: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
    /**
     * Choose, which Transaction to update.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction updateMany
   */
  export type TransactionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
  }

  /**
   * Transaction updateManyAndReturn
   */
  export type TransactionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * The data used to update Transactions.
     */
    data: XOR<TransactionUpdateManyMutationInput, TransactionUncheckedUpdateManyInput>
    /**
     * Filter which Transactions to update
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to update.
     */
    limit?: number
  }

  /**
   * Transaction upsert
   */
  export type TransactionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * The filter to search for the Transaction to update in case it exists.
     */
    where: TransactionWhereUniqueInput
    /**
     * In case the Transaction found by the `where` argument doesn't exist, create a new Transaction with this data.
     */
    create: XOR<TransactionCreateInput, TransactionUncheckedCreateInput>
    /**
     * In case the Transaction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionUpdateInput, TransactionUncheckedUpdateInput>
  }

  /**
   * Transaction delete
   */
  export type TransactionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    /**
     * Filter which Transaction to delete.
     */
    where: TransactionWhereUniqueInput
  }

  /**
   * Transaction deleteMany
   */
  export type TransactionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Transactions to delete
     */
    where?: TransactionWhereInput
    /**
     * Limit how many Transactions to delete.
     */
    limit?: number
  }

  /**
   * Transaction.items
   */
  export type Transaction$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    where?: TransactionItemWhereInput
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    cursor?: TransactionItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * Transaction.notifications
   */
  export type Transaction$notificationsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    cursor?: NotificationWhereUniqueInput
    take?: number
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Transaction.orderRequest
   */
  export type Transaction$orderRequestArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    where?: OrderRequestWhereInput
  }

  /**
   * Transaction without action
   */
  export type TransactionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
  }


  /**
   * Model TransactionItem
   */

  export type AggregateTransactionItem = {
    _count: TransactionItemCountAggregateOutputType | null
    _avg: TransactionItemAvgAggregateOutputType | null
    _sum: TransactionItemSumAggregateOutputType | null
    _min: TransactionItemMinAggregateOutputType | null
    _max: TransactionItemMaxAggregateOutputType | null
  }

  export type TransactionItemAvgAggregateOutputType = {
    id: number | null
    transactionId: number | null
    productId: number | null
    jumlah: number | null
    subtotal: number | null
  }

  export type TransactionItemSumAggregateOutputType = {
    id: number | null
    transactionId: number | null
    productId: number | null
    jumlah: number | null
    subtotal: number | null
  }

  export type TransactionItemMinAggregateOutputType = {
    id: number | null
    transactionId: number | null
    productId: number | null
    jumlah: number | null
    subtotal: number | null
  }

  export type TransactionItemMaxAggregateOutputType = {
    id: number | null
    transactionId: number | null
    productId: number | null
    jumlah: number | null
    subtotal: number | null
  }

  export type TransactionItemCountAggregateOutputType = {
    id: number
    transactionId: number
    productId: number
    jumlah: number
    subtotal: number
    _all: number
  }


  export type TransactionItemAvgAggregateInputType = {
    id?: true
    transactionId?: true
    productId?: true
    jumlah?: true
    subtotal?: true
  }

  export type TransactionItemSumAggregateInputType = {
    id?: true
    transactionId?: true
    productId?: true
    jumlah?: true
    subtotal?: true
  }

  export type TransactionItemMinAggregateInputType = {
    id?: true
    transactionId?: true
    productId?: true
    jumlah?: true
    subtotal?: true
  }

  export type TransactionItemMaxAggregateInputType = {
    id?: true
    transactionId?: true
    productId?: true
    jumlah?: true
    subtotal?: true
  }

  export type TransactionItemCountAggregateInputType = {
    id?: true
    transactionId?: true
    productId?: true
    jumlah?: true
    subtotal?: true
    _all?: true
  }

  export type TransactionItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TransactionItem to aggregate.
     */
    where?: TransactionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionItems to fetch.
     */
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: TransactionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned TransactionItems
    **/
    _count?: true | TransactionItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TransactionItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TransactionItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TransactionItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TransactionItemMaxAggregateInputType
  }

  export type GetTransactionItemAggregateType<T extends TransactionItemAggregateArgs> = {
        [P in keyof T & keyof AggregateTransactionItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTransactionItem[P]>
      : GetScalarType<T[P], AggregateTransactionItem[P]>
  }




  export type TransactionItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: TransactionItemWhereInput
    orderBy?: TransactionItemOrderByWithAggregationInput | TransactionItemOrderByWithAggregationInput[]
    by: TransactionItemScalarFieldEnum[] | TransactionItemScalarFieldEnum
    having?: TransactionItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TransactionItemCountAggregateInputType | true
    _avg?: TransactionItemAvgAggregateInputType
    _sum?: TransactionItemSumAggregateInputType
    _min?: TransactionItemMinAggregateInputType
    _max?: TransactionItemMaxAggregateInputType
  }

  export type TransactionItemGroupByOutputType = {
    id: number
    transactionId: number
    productId: number
    jumlah: number
    subtotal: number
    _count: TransactionItemCountAggregateOutputType | null
    _avg: TransactionItemAvgAggregateOutputType | null
    _sum: TransactionItemSumAggregateOutputType | null
    _min: TransactionItemMinAggregateOutputType | null
    _max: TransactionItemMaxAggregateOutputType | null
  }

  type GetTransactionItemGroupByPayload<T extends TransactionItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<TransactionItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TransactionItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TransactionItemGroupByOutputType[P]>
            : GetScalarType<T[P], TransactionItemGroupByOutputType[P]>
        }
      >
    >


  export type TransactionItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    productId?: boolean
    jumlah?: boolean
    subtotal?: boolean
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transactionItem"]>

  export type TransactionItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    productId?: boolean
    jumlah?: boolean
    subtotal?: boolean
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transactionItem"]>

  export type TransactionItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    productId?: boolean
    jumlah?: boolean
    subtotal?: boolean
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["transactionItem"]>

  export type TransactionItemSelectScalar = {
    id?: boolean
    transactionId?: boolean
    productId?: boolean
    jumlah?: boolean
    subtotal?: boolean
  }

  export type TransactionItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "transactionId" | "productId" | "jumlah" | "subtotal", ExtArgs["result"]["transactionItem"]>
  export type TransactionItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type TransactionItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type TransactionItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | TransactionDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $TransactionItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "TransactionItem"
    objects: {
      transaction: Prisma.$TransactionPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      transactionId: number
      productId: number
      jumlah: number
      subtotal: number
    }, ExtArgs["result"]["transactionItem"]>
    composites: {}
  }

  type TransactionItemGetPayload<S extends boolean | null | undefined | TransactionItemDefaultArgs> = $Result.GetResult<Prisma.$TransactionItemPayload, S>

  type TransactionItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<TransactionItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: TransactionItemCountAggregateInputType | true
    }

  export interface TransactionItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['TransactionItem'], meta: { name: 'TransactionItem' } }
    /**
     * Find zero or one TransactionItem that matches the filter.
     * @param {TransactionItemFindUniqueArgs} args - Arguments to find a TransactionItem
     * @example
     * // Get one TransactionItem
     * const transactionItem = await prisma.transactionItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends TransactionItemFindUniqueArgs>(args: SelectSubset<T, TransactionItemFindUniqueArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one TransactionItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {TransactionItemFindUniqueOrThrowArgs} args - Arguments to find a TransactionItem
     * @example
     * // Get one TransactionItem
     * const transactionItem = await prisma.transactionItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends TransactionItemFindUniqueOrThrowArgs>(args: SelectSubset<T, TransactionItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TransactionItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemFindFirstArgs} args - Arguments to find a TransactionItem
     * @example
     * // Get one TransactionItem
     * const transactionItem = await prisma.transactionItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends TransactionItemFindFirstArgs>(args?: SelectSubset<T, TransactionItemFindFirstArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first TransactionItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemFindFirstOrThrowArgs} args - Arguments to find a TransactionItem
     * @example
     * // Get one TransactionItem
     * const transactionItem = await prisma.transactionItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends TransactionItemFindFirstOrThrowArgs>(args?: SelectSubset<T, TransactionItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more TransactionItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all TransactionItems
     * const transactionItems = await prisma.transactionItem.findMany()
     * 
     * // Get first 10 TransactionItems
     * const transactionItems = await prisma.transactionItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const transactionItemWithIdOnly = await prisma.transactionItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends TransactionItemFindManyArgs>(args?: SelectSubset<T, TransactionItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a TransactionItem.
     * @param {TransactionItemCreateArgs} args - Arguments to create a TransactionItem.
     * @example
     * // Create one TransactionItem
     * const TransactionItem = await prisma.transactionItem.create({
     *   data: {
     *     // ... data to create a TransactionItem
     *   }
     * })
     * 
     */
    create<T extends TransactionItemCreateArgs>(args: SelectSubset<T, TransactionItemCreateArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many TransactionItems.
     * @param {TransactionItemCreateManyArgs} args - Arguments to create many TransactionItems.
     * @example
     * // Create many TransactionItems
     * const transactionItem = await prisma.transactionItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends TransactionItemCreateManyArgs>(args?: SelectSubset<T, TransactionItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many TransactionItems and returns the data saved in the database.
     * @param {TransactionItemCreateManyAndReturnArgs} args - Arguments to create many TransactionItems.
     * @example
     * // Create many TransactionItems
     * const transactionItem = await prisma.transactionItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many TransactionItems and only return the `id`
     * const transactionItemWithIdOnly = await prisma.transactionItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends TransactionItemCreateManyAndReturnArgs>(args?: SelectSubset<T, TransactionItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a TransactionItem.
     * @param {TransactionItemDeleteArgs} args - Arguments to delete one TransactionItem.
     * @example
     * // Delete one TransactionItem
     * const TransactionItem = await prisma.transactionItem.delete({
     *   where: {
     *     // ... filter to delete one TransactionItem
     *   }
     * })
     * 
     */
    delete<T extends TransactionItemDeleteArgs>(args: SelectSubset<T, TransactionItemDeleteArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one TransactionItem.
     * @param {TransactionItemUpdateArgs} args - Arguments to update one TransactionItem.
     * @example
     * // Update one TransactionItem
     * const transactionItem = await prisma.transactionItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends TransactionItemUpdateArgs>(args: SelectSubset<T, TransactionItemUpdateArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more TransactionItems.
     * @param {TransactionItemDeleteManyArgs} args - Arguments to filter TransactionItems to delete.
     * @example
     * // Delete a few TransactionItems
     * const { count } = await prisma.transactionItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends TransactionItemDeleteManyArgs>(args?: SelectSubset<T, TransactionItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TransactionItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many TransactionItems
     * const transactionItem = await prisma.transactionItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends TransactionItemUpdateManyArgs>(args: SelectSubset<T, TransactionItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more TransactionItems and returns the data updated in the database.
     * @param {TransactionItemUpdateManyAndReturnArgs} args - Arguments to update many TransactionItems.
     * @example
     * // Update many TransactionItems
     * const transactionItem = await prisma.transactionItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more TransactionItems and only return the `id`
     * const transactionItemWithIdOnly = await prisma.transactionItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends TransactionItemUpdateManyAndReturnArgs>(args: SelectSubset<T, TransactionItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one TransactionItem.
     * @param {TransactionItemUpsertArgs} args - Arguments to update or create a TransactionItem.
     * @example
     * // Update or create a TransactionItem
     * const transactionItem = await prisma.transactionItem.upsert({
     *   create: {
     *     // ... data to create a TransactionItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the TransactionItem we want to update
     *   }
     * })
     */
    upsert<T extends TransactionItemUpsertArgs>(args: SelectSubset<T, TransactionItemUpsertArgs<ExtArgs>>): Prisma__TransactionItemClient<$Result.GetResult<Prisma.$TransactionItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of TransactionItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemCountArgs} args - Arguments to filter TransactionItems to count.
     * @example
     * // Count the number of TransactionItems
     * const count = await prisma.transactionItem.count({
     *   where: {
     *     // ... the filter for the TransactionItems we want to count
     *   }
     * })
    **/
    count<T extends TransactionItemCountArgs>(
      args?: Subset<T, TransactionItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TransactionItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a TransactionItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends TransactionItemAggregateArgs>(args: Subset<T, TransactionItemAggregateArgs>): Prisma.PrismaPromise<GetTransactionItemAggregateType<T>>

    /**
     * Group by TransactionItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TransactionItemGroupByArgs} args - Group by arguments.
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
      T extends TransactionItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TransactionItemGroupByArgs['orderBy'] }
        : { orderBy?: TransactionItemGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, TransactionItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTransactionItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the TransactionItem model
   */
  readonly fields: TransactionItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for TransactionItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__TransactionItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    transaction<T extends TransactionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, TransactionDefaultArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the TransactionItem model
   */
  interface TransactionItemFieldRefs {
    readonly id: FieldRef<"TransactionItem", 'Int'>
    readonly transactionId: FieldRef<"TransactionItem", 'Int'>
    readonly productId: FieldRef<"TransactionItem", 'Int'>
    readonly jumlah: FieldRef<"TransactionItem", 'Int'>
    readonly subtotal: FieldRef<"TransactionItem", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * TransactionItem findUnique
   */
  export type TransactionItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItem to fetch.
     */
    where: TransactionItemWhereUniqueInput
  }

  /**
   * TransactionItem findUniqueOrThrow
   */
  export type TransactionItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItem to fetch.
     */
    where: TransactionItemWhereUniqueInput
  }

  /**
   * TransactionItem findFirst
   */
  export type TransactionItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItem to fetch.
     */
    where?: TransactionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionItems to fetch.
     */
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TransactionItems.
     */
    cursor?: TransactionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TransactionItems.
     */
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * TransactionItem findFirstOrThrow
   */
  export type TransactionItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItem to fetch.
     */
    where?: TransactionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionItems to fetch.
     */
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for TransactionItems.
     */
    cursor?: TransactionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of TransactionItems.
     */
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * TransactionItem findMany
   */
  export type TransactionItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter, which TransactionItems to fetch.
     */
    where?: TransactionItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of TransactionItems to fetch.
     */
    orderBy?: TransactionItemOrderByWithRelationInput | TransactionItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing TransactionItems.
     */
    cursor?: TransactionItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` TransactionItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` TransactionItems.
     */
    skip?: number
    distinct?: TransactionItemScalarFieldEnum | TransactionItemScalarFieldEnum[]
  }

  /**
   * TransactionItem create
   */
  export type TransactionItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * The data needed to create a TransactionItem.
     */
    data: XOR<TransactionItemCreateInput, TransactionItemUncheckedCreateInput>
  }

  /**
   * TransactionItem createMany
   */
  export type TransactionItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many TransactionItems.
     */
    data: TransactionItemCreateManyInput | TransactionItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * TransactionItem createManyAndReturn
   */
  export type TransactionItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * The data used to create many TransactionItems.
     */
    data: TransactionItemCreateManyInput | TransactionItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * TransactionItem update
   */
  export type TransactionItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * The data needed to update a TransactionItem.
     */
    data: XOR<TransactionItemUpdateInput, TransactionItemUncheckedUpdateInput>
    /**
     * Choose, which TransactionItem to update.
     */
    where: TransactionItemWhereUniqueInput
  }

  /**
   * TransactionItem updateMany
   */
  export type TransactionItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update TransactionItems.
     */
    data: XOR<TransactionItemUpdateManyMutationInput, TransactionItemUncheckedUpdateManyInput>
    /**
     * Filter which TransactionItems to update
     */
    where?: TransactionItemWhereInput
    /**
     * Limit how many TransactionItems to update.
     */
    limit?: number
  }

  /**
   * TransactionItem updateManyAndReturn
   */
  export type TransactionItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * The data used to update TransactionItems.
     */
    data: XOR<TransactionItemUpdateManyMutationInput, TransactionItemUncheckedUpdateManyInput>
    /**
     * Filter which TransactionItems to update
     */
    where?: TransactionItemWhereInput
    /**
     * Limit how many TransactionItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * TransactionItem upsert
   */
  export type TransactionItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * The filter to search for the TransactionItem to update in case it exists.
     */
    where: TransactionItemWhereUniqueInput
    /**
     * In case the TransactionItem found by the `where` argument doesn't exist, create a new TransactionItem with this data.
     */
    create: XOR<TransactionItemCreateInput, TransactionItemUncheckedCreateInput>
    /**
     * In case the TransactionItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<TransactionItemUpdateInput, TransactionItemUncheckedUpdateInput>
  }

  /**
   * TransactionItem delete
   */
  export type TransactionItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
    /**
     * Filter which TransactionItem to delete.
     */
    where: TransactionItemWhereUniqueInput
  }

  /**
   * TransactionItem deleteMany
   */
  export type TransactionItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which TransactionItems to delete
     */
    where?: TransactionItemWhereInput
    /**
     * Limit how many TransactionItems to delete.
     */
    limit?: number
  }

  /**
   * TransactionItem without action
   */
  export type TransactionItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the TransactionItem
     */
    select?: TransactionItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the TransactionItem
     */
    omit?: TransactionItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionItemInclude<ExtArgs> | null
  }


  /**
   * Model StoreSetting
   */

  export type AggregateStoreSetting = {
    _count: StoreSettingCountAggregateOutputType | null
    _avg: StoreSettingAvgAggregateOutputType | null
    _sum: StoreSettingSumAggregateOutputType | null
    _min: StoreSettingMinAggregateOutputType | null
    _max: StoreSettingMaxAggregateOutputType | null
  }

  export type StoreSettingAvgAggregateOutputType = {
    id: number | null
  }

  export type StoreSettingSumAggregateOutputType = {
    id: number | null
  }

  export type StoreSettingMinAggregateOutputType = {
    id: number | null
    brand: string | null
    address: string | null
    footer: string | null
    logo: string | null
    receiptLogo: string | null
  }

  export type StoreSettingMaxAggregateOutputType = {
    id: number | null
    brand: string | null
    address: string | null
    footer: string | null
    logo: string | null
    receiptLogo: string | null
  }

  export type StoreSettingCountAggregateOutputType = {
    id: number
    brand: number
    address: number
    footer: number
    logo: number
    receiptLogo: number
    _all: number
  }


  export type StoreSettingAvgAggregateInputType = {
    id?: true
  }

  export type StoreSettingSumAggregateInputType = {
    id?: true
  }

  export type StoreSettingMinAggregateInputType = {
    id?: true
    brand?: true
    address?: true
    footer?: true
    logo?: true
    receiptLogo?: true
  }

  export type StoreSettingMaxAggregateInputType = {
    id?: true
    brand?: true
    address?: true
    footer?: true
    logo?: true
    receiptLogo?: true
  }

  export type StoreSettingCountAggregateInputType = {
    id?: true
    brand?: true
    address?: true
    footer?: true
    logo?: true
    receiptLogo?: true
    _all?: true
  }

  export type StoreSettingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StoreSetting to aggregate.
     */
    where?: StoreSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StoreSettings to fetch.
     */
    orderBy?: StoreSettingOrderByWithRelationInput | StoreSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StoreSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StoreSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StoreSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StoreSettings
    **/
    _count?: true | StoreSettingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StoreSettingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StoreSettingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StoreSettingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StoreSettingMaxAggregateInputType
  }

  export type GetStoreSettingAggregateType<T extends StoreSettingAggregateArgs> = {
        [P in keyof T & keyof AggregateStoreSetting]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStoreSetting[P]>
      : GetScalarType<T[P], AggregateStoreSetting[P]>
  }




  export type StoreSettingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StoreSettingWhereInput
    orderBy?: StoreSettingOrderByWithAggregationInput | StoreSettingOrderByWithAggregationInput[]
    by: StoreSettingScalarFieldEnum[] | StoreSettingScalarFieldEnum
    having?: StoreSettingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StoreSettingCountAggregateInputType | true
    _avg?: StoreSettingAvgAggregateInputType
    _sum?: StoreSettingSumAggregateInputType
    _min?: StoreSettingMinAggregateInputType
    _max?: StoreSettingMaxAggregateInputType
  }

  export type StoreSettingGroupByOutputType = {
    id: number
    brand: string
    address: string
    footer: string
    logo: string | null
    receiptLogo: string | null
    _count: StoreSettingCountAggregateOutputType | null
    _avg: StoreSettingAvgAggregateOutputType | null
    _sum: StoreSettingSumAggregateOutputType | null
    _min: StoreSettingMinAggregateOutputType | null
    _max: StoreSettingMaxAggregateOutputType | null
  }

  type GetStoreSettingGroupByPayload<T extends StoreSettingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StoreSettingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StoreSettingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StoreSettingGroupByOutputType[P]>
            : GetScalarType<T[P], StoreSettingGroupByOutputType[P]>
        }
      >
    >


  export type StoreSettingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brand?: boolean
    address?: boolean
    footer?: boolean
    logo?: boolean
    receiptLogo?: boolean
  }, ExtArgs["result"]["storeSetting"]>

  export type StoreSettingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brand?: boolean
    address?: boolean
    footer?: boolean
    logo?: boolean
    receiptLogo?: boolean
  }, ExtArgs["result"]["storeSetting"]>

  export type StoreSettingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    brand?: boolean
    address?: boolean
    footer?: boolean
    logo?: boolean
    receiptLogo?: boolean
  }, ExtArgs["result"]["storeSetting"]>

  export type StoreSettingSelectScalar = {
    id?: boolean
    brand?: boolean
    address?: boolean
    footer?: boolean
    logo?: boolean
    receiptLogo?: boolean
  }

  export type StoreSettingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "brand" | "address" | "footer" | "logo" | "receiptLogo", ExtArgs["result"]["storeSetting"]>

  export type $StoreSettingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StoreSetting"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      brand: string
      address: string
      footer: string
      logo: string | null
      receiptLogo: string | null
    }, ExtArgs["result"]["storeSetting"]>
    composites: {}
  }

  type StoreSettingGetPayload<S extends boolean | null | undefined | StoreSettingDefaultArgs> = $Result.GetResult<Prisma.$StoreSettingPayload, S>

  type StoreSettingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StoreSettingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StoreSettingCountAggregateInputType | true
    }

  export interface StoreSettingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StoreSetting'], meta: { name: 'StoreSetting' } }
    /**
     * Find zero or one StoreSetting that matches the filter.
     * @param {StoreSettingFindUniqueArgs} args - Arguments to find a StoreSetting
     * @example
     * // Get one StoreSetting
     * const storeSetting = await prisma.storeSetting.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StoreSettingFindUniqueArgs>(args: SelectSubset<T, StoreSettingFindUniqueArgs<ExtArgs>>): Prisma__StoreSettingClient<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StoreSetting that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StoreSettingFindUniqueOrThrowArgs} args - Arguments to find a StoreSetting
     * @example
     * // Get one StoreSetting
     * const storeSetting = await prisma.storeSetting.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StoreSettingFindUniqueOrThrowArgs>(args: SelectSubset<T, StoreSettingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StoreSettingClient<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StoreSetting that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreSettingFindFirstArgs} args - Arguments to find a StoreSetting
     * @example
     * // Get one StoreSetting
     * const storeSetting = await prisma.storeSetting.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StoreSettingFindFirstArgs>(args?: SelectSubset<T, StoreSettingFindFirstArgs<ExtArgs>>): Prisma__StoreSettingClient<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StoreSetting that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreSettingFindFirstOrThrowArgs} args - Arguments to find a StoreSetting
     * @example
     * // Get one StoreSetting
     * const storeSetting = await prisma.storeSetting.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StoreSettingFindFirstOrThrowArgs>(args?: SelectSubset<T, StoreSettingFindFirstOrThrowArgs<ExtArgs>>): Prisma__StoreSettingClient<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StoreSettings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreSettingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StoreSettings
     * const storeSettings = await prisma.storeSetting.findMany()
     * 
     * // Get first 10 StoreSettings
     * const storeSettings = await prisma.storeSetting.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const storeSettingWithIdOnly = await prisma.storeSetting.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StoreSettingFindManyArgs>(args?: SelectSubset<T, StoreSettingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StoreSetting.
     * @param {StoreSettingCreateArgs} args - Arguments to create a StoreSetting.
     * @example
     * // Create one StoreSetting
     * const StoreSetting = await prisma.storeSetting.create({
     *   data: {
     *     // ... data to create a StoreSetting
     *   }
     * })
     * 
     */
    create<T extends StoreSettingCreateArgs>(args: SelectSubset<T, StoreSettingCreateArgs<ExtArgs>>): Prisma__StoreSettingClient<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StoreSettings.
     * @param {StoreSettingCreateManyArgs} args - Arguments to create many StoreSettings.
     * @example
     * // Create many StoreSettings
     * const storeSetting = await prisma.storeSetting.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StoreSettingCreateManyArgs>(args?: SelectSubset<T, StoreSettingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StoreSettings and returns the data saved in the database.
     * @param {StoreSettingCreateManyAndReturnArgs} args - Arguments to create many StoreSettings.
     * @example
     * // Create many StoreSettings
     * const storeSetting = await prisma.storeSetting.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StoreSettings and only return the `id`
     * const storeSettingWithIdOnly = await prisma.storeSetting.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StoreSettingCreateManyAndReturnArgs>(args?: SelectSubset<T, StoreSettingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a StoreSetting.
     * @param {StoreSettingDeleteArgs} args - Arguments to delete one StoreSetting.
     * @example
     * // Delete one StoreSetting
     * const StoreSetting = await prisma.storeSetting.delete({
     *   where: {
     *     // ... filter to delete one StoreSetting
     *   }
     * })
     * 
     */
    delete<T extends StoreSettingDeleteArgs>(args: SelectSubset<T, StoreSettingDeleteArgs<ExtArgs>>): Prisma__StoreSettingClient<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StoreSetting.
     * @param {StoreSettingUpdateArgs} args - Arguments to update one StoreSetting.
     * @example
     * // Update one StoreSetting
     * const storeSetting = await prisma.storeSetting.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StoreSettingUpdateArgs>(args: SelectSubset<T, StoreSettingUpdateArgs<ExtArgs>>): Prisma__StoreSettingClient<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StoreSettings.
     * @param {StoreSettingDeleteManyArgs} args - Arguments to filter StoreSettings to delete.
     * @example
     * // Delete a few StoreSettings
     * const { count } = await prisma.storeSetting.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StoreSettingDeleteManyArgs>(args?: SelectSubset<T, StoreSettingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StoreSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreSettingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StoreSettings
     * const storeSetting = await prisma.storeSetting.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StoreSettingUpdateManyArgs>(args: SelectSubset<T, StoreSettingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StoreSettings and returns the data updated in the database.
     * @param {StoreSettingUpdateManyAndReturnArgs} args - Arguments to update many StoreSettings.
     * @example
     * // Update many StoreSettings
     * const storeSetting = await prisma.storeSetting.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more StoreSettings and only return the `id`
     * const storeSettingWithIdOnly = await prisma.storeSetting.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StoreSettingUpdateManyAndReturnArgs>(args: SelectSubset<T, StoreSettingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one StoreSetting.
     * @param {StoreSettingUpsertArgs} args - Arguments to update or create a StoreSetting.
     * @example
     * // Update or create a StoreSetting
     * const storeSetting = await prisma.storeSetting.upsert({
     *   create: {
     *     // ... data to create a StoreSetting
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StoreSetting we want to update
     *   }
     * })
     */
    upsert<T extends StoreSettingUpsertArgs>(args: SelectSubset<T, StoreSettingUpsertArgs<ExtArgs>>): Prisma__StoreSettingClient<$Result.GetResult<Prisma.$StoreSettingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StoreSettings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreSettingCountArgs} args - Arguments to filter StoreSettings to count.
     * @example
     * // Count the number of StoreSettings
     * const count = await prisma.storeSetting.count({
     *   where: {
     *     // ... the filter for the StoreSettings we want to count
     *   }
     * })
    **/
    count<T extends StoreSettingCountArgs>(
      args?: Subset<T, StoreSettingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StoreSettingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StoreSetting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreSettingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends StoreSettingAggregateArgs>(args: Subset<T, StoreSettingAggregateArgs>): Prisma.PrismaPromise<GetStoreSettingAggregateType<T>>

    /**
     * Group by StoreSetting.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StoreSettingGroupByArgs} args - Group by arguments.
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
      T extends StoreSettingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StoreSettingGroupByArgs['orderBy'] }
        : { orderBy?: StoreSettingGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, StoreSettingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStoreSettingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StoreSetting model
   */
  readonly fields: StoreSettingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StoreSetting.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StoreSettingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the StoreSetting model
   */
  interface StoreSettingFieldRefs {
    readonly id: FieldRef<"StoreSetting", 'Int'>
    readonly brand: FieldRef<"StoreSetting", 'String'>
    readonly address: FieldRef<"StoreSetting", 'String'>
    readonly footer: FieldRef<"StoreSetting", 'String'>
    readonly logo: FieldRef<"StoreSetting", 'String'>
    readonly receiptLogo: FieldRef<"StoreSetting", 'String'>
  }
    

  // Custom InputTypes
  /**
   * StoreSetting findUnique
   */
  export type StoreSettingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * Filter, which StoreSetting to fetch.
     */
    where: StoreSettingWhereUniqueInput
  }

  /**
   * StoreSetting findUniqueOrThrow
   */
  export type StoreSettingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * Filter, which StoreSetting to fetch.
     */
    where: StoreSettingWhereUniqueInput
  }

  /**
   * StoreSetting findFirst
   */
  export type StoreSettingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * Filter, which StoreSetting to fetch.
     */
    where?: StoreSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StoreSettings to fetch.
     */
    orderBy?: StoreSettingOrderByWithRelationInput | StoreSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StoreSettings.
     */
    cursor?: StoreSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StoreSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StoreSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StoreSettings.
     */
    distinct?: StoreSettingScalarFieldEnum | StoreSettingScalarFieldEnum[]
  }

  /**
   * StoreSetting findFirstOrThrow
   */
  export type StoreSettingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * Filter, which StoreSetting to fetch.
     */
    where?: StoreSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StoreSettings to fetch.
     */
    orderBy?: StoreSettingOrderByWithRelationInput | StoreSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StoreSettings.
     */
    cursor?: StoreSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StoreSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StoreSettings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StoreSettings.
     */
    distinct?: StoreSettingScalarFieldEnum | StoreSettingScalarFieldEnum[]
  }

  /**
   * StoreSetting findMany
   */
  export type StoreSettingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * Filter, which StoreSettings to fetch.
     */
    where?: StoreSettingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StoreSettings to fetch.
     */
    orderBy?: StoreSettingOrderByWithRelationInput | StoreSettingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StoreSettings.
     */
    cursor?: StoreSettingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StoreSettings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StoreSettings.
     */
    skip?: number
    distinct?: StoreSettingScalarFieldEnum | StoreSettingScalarFieldEnum[]
  }

  /**
   * StoreSetting create
   */
  export type StoreSettingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * The data needed to create a StoreSetting.
     */
    data: XOR<StoreSettingCreateInput, StoreSettingUncheckedCreateInput>
  }

  /**
   * StoreSetting createMany
   */
  export type StoreSettingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StoreSettings.
     */
    data: StoreSettingCreateManyInput | StoreSettingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StoreSetting createManyAndReturn
   */
  export type StoreSettingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * The data used to create many StoreSettings.
     */
    data: StoreSettingCreateManyInput | StoreSettingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StoreSetting update
   */
  export type StoreSettingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * The data needed to update a StoreSetting.
     */
    data: XOR<StoreSettingUpdateInput, StoreSettingUncheckedUpdateInput>
    /**
     * Choose, which StoreSetting to update.
     */
    where: StoreSettingWhereUniqueInput
  }

  /**
   * StoreSetting updateMany
   */
  export type StoreSettingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StoreSettings.
     */
    data: XOR<StoreSettingUpdateManyMutationInput, StoreSettingUncheckedUpdateManyInput>
    /**
     * Filter which StoreSettings to update
     */
    where?: StoreSettingWhereInput
    /**
     * Limit how many StoreSettings to update.
     */
    limit?: number
  }

  /**
   * StoreSetting updateManyAndReturn
   */
  export type StoreSettingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * The data used to update StoreSettings.
     */
    data: XOR<StoreSettingUpdateManyMutationInput, StoreSettingUncheckedUpdateManyInput>
    /**
     * Filter which StoreSettings to update
     */
    where?: StoreSettingWhereInput
    /**
     * Limit how many StoreSettings to update.
     */
    limit?: number
  }

  /**
   * StoreSetting upsert
   */
  export type StoreSettingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * The filter to search for the StoreSetting to update in case it exists.
     */
    where: StoreSettingWhereUniqueInput
    /**
     * In case the StoreSetting found by the `where` argument doesn't exist, create a new StoreSetting with this data.
     */
    create: XOR<StoreSettingCreateInput, StoreSettingUncheckedCreateInput>
    /**
     * In case the StoreSetting was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StoreSettingUpdateInput, StoreSettingUncheckedUpdateInput>
  }

  /**
   * StoreSetting delete
   */
  export type StoreSettingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
    /**
     * Filter which StoreSetting to delete.
     */
    where: StoreSettingWhereUniqueInput
  }

  /**
   * StoreSetting deleteMany
   */
  export type StoreSettingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StoreSettings to delete
     */
    where?: StoreSettingWhereInput
    /**
     * Limit how many StoreSettings to delete.
     */
    limit?: number
  }

  /**
   * StoreSetting without action
   */
  export type StoreSettingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StoreSetting
     */
    select?: StoreSettingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StoreSetting
     */
    omit?: StoreSettingOmit<ExtArgs> | null
  }


  /**
   * Model Notification
   */

  export type AggregateNotification = {
    _count: NotificationCountAggregateOutputType | null
    _avg: NotificationAvgAggregateOutputType | null
    _sum: NotificationSumAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  export type NotificationAvgAggregateOutputType = {
    id: number | null
    transactionId: number | null
  }

  export type NotificationSumAggregateOutputType = {
    id: number | null
    transactionId: number | null
  }

  export type NotificationMinAggregateOutputType = {
    id: number | null
    transactionId: number | null
    targetRole: string | null
    senderRole: string | null
    senderName: string | null
    statusPengiriman: string | null
    message: string | null
    isRead: boolean | null
    hidden: boolean | null
    createdAt: Date | null
  }

  export type NotificationMaxAggregateOutputType = {
    id: number | null
    transactionId: number | null
    targetRole: string | null
    senderRole: string | null
    senderName: string | null
    statusPengiriman: string | null
    message: string | null
    isRead: boolean | null
    hidden: boolean | null
    createdAt: Date | null
  }

  export type NotificationCountAggregateOutputType = {
    id: number
    transactionId: number
    targetRole: number
    senderRole: number
    senderName: number
    statusPengiriman: number
    message: number
    isRead: number
    hidden: number
    createdAt: number
    _all: number
  }


  export type NotificationAvgAggregateInputType = {
    id?: true
    transactionId?: true
  }

  export type NotificationSumAggregateInputType = {
    id?: true
    transactionId?: true
  }

  export type NotificationMinAggregateInputType = {
    id?: true
    transactionId?: true
    targetRole?: true
    senderRole?: true
    senderName?: true
    statusPengiriman?: true
    message?: true
    isRead?: true
    hidden?: true
    createdAt?: true
  }

  export type NotificationMaxAggregateInputType = {
    id?: true
    transactionId?: true
    targetRole?: true
    senderRole?: true
    senderName?: true
    statusPengiriman?: true
    message?: true
    isRead?: true
    hidden?: true
    createdAt?: true
  }

  export type NotificationCountAggregateInputType = {
    id?: true
    transactionId?: true
    targetRole?: true
    senderRole?: true
    senderName?: true
    statusPengiriman?: true
    message?: true
    isRead?: true
    hidden?: true
    createdAt?: true
    _all?: true
  }

  export type NotificationAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notification to aggregate.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Notifications
    **/
    _count?: true | NotificationCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: NotificationAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: NotificationSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: NotificationMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: NotificationMaxAggregateInputType
  }

  export type GetNotificationAggregateType<T extends NotificationAggregateArgs> = {
        [P in keyof T & keyof AggregateNotification]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateNotification[P]>
      : GetScalarType<T[P], AggregateNotification[P]>
  }




  export type NotificationGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: NotificationWhereInput
    orderBy?: NotificationOrderByWithAggregationInput | NotificationOrderByWithAggregationInput[]
    by: NotificationScalarFieldEnum[] | NotificationScalarFieldEnum
    having?: NotificationScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: NotificationCountAggregateInputType | true
    _avg?: NotificationAvgAggregateInputType
    _sum?: NotificationSumAggregateInputType
    _min?: NotificationMinAggregateInputType
    _max?: NotificationMaxAggregateInputType
  }

  export type NotificationGroupByOutputType = {
    id: number
    transactionId: number | null
    targetRole: string
    senderRole: string
    senderName: string | null
    statusPengiriman: string
    message: string
    isRead: boolean
    hidden: boolean
    createdAt: Date
    _count: NotificationCountAggregateOutputType | null
    _avg: NotificationAvgAggregateOutputType | null
    _sum: NotificationSumAggregateOutputType | null
    _min: NotificationMinAggregateOutputType | null
    _max: NotificationMaxAggregateOutputType | null
  }

  type GetNotificationGroupByPayload<T extends NotificationGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<NotificationGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof NotificationGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], NotificationGroupByOutputType[P]>
            : GetScalarType<T[P], NotificationGroupByOutputType[P]>
        }
      >
    >


  export type NotificationSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    targetRole?: boolean
    senderRole?: boolean
    senderName?: boolean
    statusPengiriman?: boolean
    message?: boolean
    isRead?: boolean
    hidden?: boolean
    createdAt?: boolean
    transaction?: boolean | Notification$transactionArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    targetRole?: boolean
    senderRole?: boolean
    senderName?: boolean
    statusPengiriman?: boolean
    message?: boolean
    isRead?: boolean
    hidden?: boolean
    createdAt?: boolean
    transaction?: boolean | Notification$transactionArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    transactionId?: boolean
    targetRole?: boolean
    senderRole?: boolean
    senderName?: boolean
    statusPengiriman?: boolean
    message?: boolean
    isRead?: boolean
    hidden?: boolean
    createdAt?: boolean
    transaction?: boolean | Notification$transactionArgs<ExtArgs>
  }, ExtArgs["result"]["notification"]>

  export type NotificationSelectScalar = {
    id?: boolean
    transactionId?: boolean
    targetRole?: boolean
    senderRole?: boolean
    senderName?: boolean
    statusPengiriman?: boolean
    message?: boolean
    isRead?: boolean
    hidden?: boolean
    createdAt?: boolean
  }

  export type NotificationOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "transactionId" | "targetRole" | "senderRole" | "senderName" | "statusPengiriman" | "message" | "isRead" | "hidden" | "createdAt", ExtArgs["result"]["notification"]>
  export type NotificationInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | Notification$transactionArgs<ExtArgs>
  }
  export type NotificationIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | Notification$transactionArgs<ExtArgs>
  }
  export type NotificationIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | Notification$transactionArgs<ExtArgs>
  }

  export type $NotificationPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Notification"
    objects: {
      transaction: Prisma.$TransactionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      transactionId: number | null
      targetRole: string
      senderRole: string
      senderName: string | null
      statusPengiriman: string
      message: string
      isRead: boolean
      hidden: boolean
      createdAt: Date
    }, ExtArgs["result"]["notification"]>
    composites: {}
  }

  type NotificationGetPayload<S extends boolean | null | undefined | NotificationDefaultArgs> = $Result.GetResult<Prisma.$NotificationPayload, S>

  type NotificationCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<NotificationFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: NotificationCountAggregateInputType | true
    }

  export interface NotificationDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Notification'], meta: { name: 'Notification' } }
    /**
     * Find zero or one Notification that matches the filter.
     * @param {NotificationFindUniqueArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends NotificationFindUniqueArgs>(args: SelectSubset<T, NotificationFindUniqueArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Notification that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {NotificationFindUniqueOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends NotificationFindUniqueOrThrowArgs>(args: SelectSubset<T, NotificationFindUniqueOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends NotificationFindFirstArgs>(args?: SelectSubset<T, NotificationFindFirstArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Notification that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindFirstOrThrowArgs} args - Arguments to find a Notification
     * @example
     * // Get one Notification
     * const notification = await prisma.notification.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends NotificationFindFirstOrThrowArgs>(args?: SelectSubset<T, NotificationFindFirstOrThrowArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Notifications that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Notifications
     * const notifications = await prisma.notification.findMany()
     * 
     * // Get first 10 Notifications
     * const notifications = await prisma.notification.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const notificationWithIdOnly = await prisma.notification.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends NotificationFindManyArgs>(args?: SelectSubset<T, NotificationFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Notification.
     * @param {NotificationCreateArgs} args - Arguments to create a Notification.
     * @example
     * // Create one Notification
     * const Notification = await prisma.notification.create({
     *   data: {
     *     // ... data to create a Notification
     *   }
     * })
     * 
     */
    create<T extends NotificationCreateArgs>(args: SelectSubset<T, NotificationCreateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Notifications.
     * @param {NotificationCreateManyArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends NotificationCreateManyArgs>(args?: SelectSubset<T, NotificationCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Notifications and returns the data saved in the database.
     * @param {NotificationCreateManyAndReturnArgs} args - Arguments to create many Notifications.
     * @example
     * // Create many Notifications
     * const notification = await prisma.notification.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends NotificationCreateManyAndReturnArgs>(args?: SelectSubset<T, NotificationCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Notification.
     * @param {NotificationDeleteArgs} args - Arguments to delete one Notification.
     * @example
     * // Delete one Notification
     * const Notification = await prisma.notification.delete({
     *   where: {
     *     // ... filter to delete one Notification
     *   }
     * })
     * 
     */
    delete<T extends NotificationDeleteArgs>(args: SelectSubset<T, NotificationDeleteArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Notification.
     * @param {NotificationUpdateArgs} args - Arguments to update one Notification.
     * @example
     * // Update one Notification
     * const notification = await prisma.notification.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends NotificationUpdateArgs>(args: SelectSubset<T, NotificationUpdateArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Notifications.
     * @param {NotificationDeleteManyArgs} args - Arguments to filter Notifications to delete.
     * @example
     * // Delete a few Notifications
     * const { count } = await prisma.notification.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends NotificationDeleteManyArgs>(args?: SelectSubset<T, NotificationDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends NotificationUpdateManyArgs>(args: SelectSubset<T, NotificationUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Notifications and returns the data updated in the database.
     * @param {NotificationUpdateManyAndReturnArgs} args - Arguments to update many Notifications.
     * @example
     * // Update many Notifications
     * const notification = await prisma.notification.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Notifications and only return the `id`
     * const notificationWithIdOnly = await prisma.notification.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends NotificationUpdateManyAndReturnArgs>(args: SelectSubset<T, NotificationUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Notification.
     * @param {NotificationUpsertArgs} args - Arguments to update or create a Notification.
     * @example
     * // Update or create a Notification
     * const notification = await prisma.notification.upsert({
     *   create: {
     *     // ... data to create a Notification
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Notification we want to update
     *   }
     * })
     */
    upsert<T extends NotificationUpsertArgs>(args: SelectSubset<T, NotificationUpsertArgs<ExtArgs>>): Prisma__NotificationClient<$Result.GetResult<Prisma.$NotificationPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Notifications.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationCountArgs} args - Arguments to filter Notifications to count.
     * @example
     * // Count the number of Notifications
     * const count = await prisma.notification.count({
     *   where: {
     *     // ... the filter for the Notifications we want to count
     *   }
     * })
    **/
    count<T extends NotificationCountArgs>(
      args?: Subset<T, NotificationCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], NotificationCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends NotificationAggregateArgs>(args: Subset<T, NotificationAggregateArgs>): Prisma.PrismaPromise<GetNotificationAggregateType<T>>

    /**
     * Group by Notification.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {NotificationGroupByArgs} args - Group by arguments.
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
      T extends NotificationGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: NotificationGroupByArgs['orderBy'] }
        : { orderBy?: NotificationGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, NotificationGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetNotificationGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Notification model
   */
  readonly fields: NotificationFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Notification.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__NotificationClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    transaction<T extends Notification$transactionArgs<ExtArgs> = {}>(args?: Subset<T, Notification$transactionArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the Notification model
   */
  interface NotificationFieldRefs {
    readonly id: FieldRef<"Notification", 'Int'>
    readonly transactionId: FieldRef<"Notification", 'Int'>
    readonly targetRole: FieldRef<"Notification", 'String'>
    readonly senderRole: FieldRef<"Notification", 'String'>
    readonly senderName: FieldRef<"Notification", 'String'>
    readonly statusPengiriman: FieldRef<"Notification", 'String'>
    readonly message: FieldRef<"Notification", 'String'>
    readonly isRead: FieldRef<"Notification", 'Boolean'>
    readonly hidden: FieldRef<"Notification", 'Boolean'>
    readonly createdAt: FieldRef<"Notification", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Notification findUnique
   */
  export type NotificationFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findUniqueOrThrow
   */
  export type NotificationFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification findFirst
   */
  export type NotificationFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findFirstOrThrow
   */
  export type NotificationFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notification to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Notifications.
     */
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification findMany
   */
  export type NotificationFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter, which Notifications to fetch.
     */
    where?: NotificationWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Notifications to fetch.
     */
    orderBy?: NotificationOrderByWithRelationInput | NotificationOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Notifications.
     */
    cursor?: NotificationWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Notifications from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Notifications.
     */
    skip?: number
    distinct?: NotificationScalarFieldEnum | NotificationScalarFieldEnum[]
  }

  /**
   * Notification create
   */
  export type NotificationCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to create a Notification.
     */
    data: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
  }

  /**
   * Notification createMany
   */
  export type NotificationCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Notification createManyAndReturn
   */
  export type NotificationCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to create many Notifications.
     */
    data: NotificationCreateManyInput | NotificationCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification update
   */
  export type NotificationUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The data needed to update a Notification.
     */
    data: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
    /**
     * Choose, which Notification to update.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification updateMany
   */
  export type NotificationUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
  }

  /**
   * Notification updateManyAndReturn
   */
  export type NotificationUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * The data used to update Notifications.
     */
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyInput>
    /**
     * Filter which Notifications to update
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Notification upsert
   */
  export type NotificationUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * The filter to search for the Notification to update in case it exists.
     */
    where: NotificationWhereUniqueInput
    /**
     * In case the Notification found by the `where` argument doesn't exist, create a new Notification with this data.
     */
    create: XOR<NotificationCreateInput, NotificationUncheckedCreateInput>
    /**
     * In case the Notification was found with the provided `where` argument, update it with this data.
     */
    update: XOR<NotificationUpdateInput, NotificationUncheckedUpdateInput>
  }

  /**
   * Notification delete
   */
  export type NotificationDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
    /**
     * Filter which Notification to delete.
     */
    where: NotificationWhereUniqueInput
  }

  /**
   * Notification deleteMany
   */
  export type NotificationDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Notifications to delete
     */
    where?: NotificationWhereInput
    /**
     * Limit how many Notifications to delete.
     */
    limit?: number
  }

  /**
   * Notification.transaction
   */
  export type Notification$transactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
  }

  /**
   * Notification without action
   */
  export type NotificationDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Notification
     */
    select?: NotificationSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Notification
     */
    omit?: NotificationOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: NotificationInclude<ExtArgs> | null
  }


  /**
   * Model ActivityLog
   */

  export type AggregateActivityLog = {
    _count: ActivityLogCountAggregateOutputType | null
    _avg: ActivityLogAvgAggregateOutputType | null
    _sum: ActivityLogSumAggregateOutputType | null
    _min: ActivityLogMinAggregateOutputType | null
    _max: ActivityLogMaxAggregateOutputType | null
  }

  export type ActivityLogAvgAggregateOutputType = {
    id: number | null
    actorId: number | null
  }

  export type ActivityLogSumAggregateOutputType = {
    id: number | null
    actorId: number | null
  }

  export type ActivityLogMinAggregateOutputType = {
    id: number | null
    action: string | null
    entity: string | null
    entityId: string | null
    title: string | null
    description: string | null
    actorId: number | null
    actorName: string | null
    actorRole: string | null
    createdAt: Date | null
  }

  export type ActivityLogMaxAggregateOutputType = {
    id: number | null
    action: string | null
    entity: string | null
    entityId: string | null
    title: string | null
    description: string | null
    actorId: number | null
    actorName: string | null
    actorRole: string | null
    createdAt: Date | null
  }

  export type ActivityLogCountAggregateOutputType = {
    id: number
    action: number
    entity: number
    entityId: number
    title: number
    description: number
    actorId: number
    actorName: number
    actorRole: number
    metadata: number
    createdAt: number
    _all: number
  }


  export type ActivityLogAvgAggregateInputType = {
    id?: true
    actorId?: true
  }

  export type ActivityLogSumAggregateInputType = {
    id?: true
    actorId?: true
  }

  export type ActivityLogMinAggregateInputType = {
    id?: true
    action?: true
    entity?: true
    entityId?: true
    title?: true
    description?: true
    actorId?: true
    actorName?: true
    actorRole?: true
    createdAt?: true
  }

  export type ActivityLogMaxAggregateInputType = {
    id?: true
    action?: true
    entity?: true
    entityId?: true
    title?: true
    description?: true
    actorId?: true
    actorName?: true
    actorRole?: true
    createdAt?: true
  }

  export type ActivityLogCountAggregateInputType = {
    id?: true
    action?: true
    entity?: true
    entityId?: true
    title?: true
    description?: true
    actorId?: true
    actorName?: true
    actorRole?: true
    metadata?: true
    createdAt?: true
    _all?: true
  }

  export type ActivityLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityLog to aggregate.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ActivityLogs
    **/
    _count?: true | ActivityLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ActivityLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ActivityLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ActivityLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ActivityLogMaxAggregateInputType
  }

  export type GetActivityLogAggregateType<T extends ActivityLogAggregateArgs> = {
        [P in keyof T & keyof AggregateActivityLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateActivityLog[P]>
      : GetScalarType<T[P], AggregateActivityLog[P]>
  }




  export type ActivityLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ActivityLogWhereInput
    orderBy?: ActivityLogOrderByWithAggregationInput | ActivityLogOrderByWithAggregationInput[]
    by: ActivityLogScalarFieldEnum[] | ActivityLogScalarFieldEnum
    having?: ActivityLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ActivityLogCountAggregateInputType | true
    _avg?: ActivityLogAvgAggregateInputType
    _sum?: ActivityLogSumAggregateInputType
    _min?: ActivityLogMinAggregateInputType
    _max?: ActivityLogMaxAggregateInputType
  }

  export type ActivityLogGroupByOutputType = {
    id: number
    action: string
    entity: string
    entityId: string | null
    title: string
    description: string
    actorId: number | null
    actorName: string | null
    actorRole: string | null
    metadata: JsonValue | null
    createdAt: Date
    _count: ActivityLogCountAggregateOutputType | null
    _avg: ActivityLogAvgAggregateOutputType | null
    _sum: ActivityLogSumAggregateOutputType | null
    _min: ActivityLogMinAggregateOutputType | null
    _max: ActivityLogMaxAggregateOutputType | null
  }

  type GetActivityLogGroupByPayload<T extends ActivityLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ActivityLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ActivityLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ActivityLogGroupByOutputType[P]>
            : GetScalarType<T[P], ActivityLogGroupByOutputType[P]>
        }
      >
    >


  export type ActivityLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    title?: boolean
    description?: boolean
    actorId?: boolean
    actorName?: boolean
    actorRole?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["activityLog"]>

  export type ActivityLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    title?: boolean
    description?: boolean
    actorId?: boolean
    actorName?: boolean
    actorRole?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["activityLog"]>

  export type ActivityLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    title?: boolean
    description?: boolean
    actorId?: boolean
    actorName?: boolean
    actorRole?: boolean
    metadata?: boolean
    createdAt?: boolean
  }, ExtArgs["result"]["activityLog"]>

  export type ActivityLogSelectScalar = {
    id?: boolean
    action?: boolean
    entity?: boolean
    entityId?: boolean
    title?: boolean
    description?: boolean
    actorId?: boolean
    actorName?: boolean
    actorRole?: boolean
    metadata?: boolean
    createdAt?: boolean
  }

  export type ActivityLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "action" | "entity" | "entityId" | "title" | "description" | "actorId" | "actorName" | "actorRole" | "metadata" | "createdAt", ExtArgs["result"]["activityLog"]>

  export type $ActivityLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ActivityLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      action: string
      entity: string
      entityId: string | null
      title: string
      description: string
      actorId: number | null
      actorName: string | null
      actorRole: string | null
      metadata: Prisma.JsonValue | null
      createdAt: Date
    }, ExtArgs["result"]["activityLog"]>
    composites: {}
  }

  type ActivityLogGetPayload<S extends boolean | null | undefined | ActivityLogDefaultArgs> = $Result.GetResult<Prisma.$ActivityLogPayload, S>

  type ActivityLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ActivityLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ActivityLogCountAggregateInputType | true
    }

  export interface ActivityLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ActivityLog'], meta: { name: 'ActivityLog' } }
    /**
     * Find zero or one ActivityLog that matches the filter.
     * @param {ActivityLogFindUniqueArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ActivityLogFindUniqueArgs>(args: SelectSubset<T, ActivityLogFindUniqueArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ActivityLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ActivityLogFindUniqueOrThrowArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ActivityLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ActivityLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogFindFirstArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ActivityLogFindFirstArgs>(args?: SelectSubset<T, ActivityLogFindFirstArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ActivityLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogFindFirstOrThrowArgs} args - Arguments to find a ActivityLog
     * @example
     * // Get one ActivityLog
     * const activityLog = await prisma.activityLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ActivityLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ActivityLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ActivityLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ActivityLogs
     * const activityLogs = await prisma.activityLog.findMany()
     * 
     * // Get first 10 ActivityLogs
     * const activityLogs = await prisma.activityLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const activityLogWithIdOnly = await prisma.activityLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ActivityLogFindManyArgs>(args?: SelectSubset<T, ActivityLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ActivityLog.
     * @param {ActivityLogCreateArgs} args - Arguments to create a ActivityLog.
     * @example
     * // Create one ActivityLog
     * const ActivityLog = await prisma.activityLog.create({
     *   data: {
     *     // ... data to create a ActivityLog
     *   }
     * })
     * 
     */
    create<T extends ActivityLogCreateArgs>(args: SelectSubset<T, ActivityLogCreateArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ActivityLogs.
     * @param {ActivityLogCreateManyArgs} args - Arguments to create many ActivityLogs.
     * @example
     * // Create many ActivityLogs
     * const activityLog = await prisma.activityLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ActivityLogCreateManyArgs>(args?: SelectSubset<T, ActivityLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ActivityLogs and returns the data saved in the database.
     * @param {ActivityLogCreateManyAndReturnArgs} args - Arguments to create many ActivityLogs.
     * @example
     * // Create many ActivityLogs
     * const activityLog = await prisma.activityLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ActivityLogs and only return the `id`
     * const activityLogWithIdOnly = await prisma.activityLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ActivityLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ActivityLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ActivityLog.
     * @param {ActivityLogDeleteArgs} args - Arguments to delete one ActivityLog.
     * @example
     * // Delete one ActivityLog
     * const ActivityLog = await prisma.activityLog.delete({
     *   where: {
     *     // ... filter to delete one ActivityLog
     *   }
     * })
     * 
     */
    delete<T extends ActivityLogDeleteArgs>(args: SelectSubset<T, ActivityLogDeleteArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ActivityLog.
     * @param {ActivityLogUpdateArgs} args - Arguments to update one ActivityLog.
     * @example
     * // Update one ActivityLog
     * const activityLog = await prisma.activityLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ActivityLogUpdateArgs>(args: SelectSubset<T, ActivityLogUpdateArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ActivityLogs.
     * @param {ActivityLogDeleteManyArgs} args - Arguments to filter ActivityLogs to delete.
     * @example
     * // Delete a few ActivityLogs
     * const { count } = await prisma.activityLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ActivityLogDeleteManyArgs>(args?: SelectSubset<T, ActivityLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivityLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ActivityLogs
     * const activityLog = await prisma.activityLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ActivityLogUpdateManyArgs>(args: SelectSubset<T, ActivityLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ActivityLogs and returns the data updated in the database.
     * @param {ActivityLogUpdateManyAndReturnArgs} args - Arguments to update many ActivityLogs.
     * @example
     * // Update many ActivityLogs
     * const activityLog = await prisma.activityLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ActivityLogs and only return the `id`
     * const activityLogWithIdOnly = await prisma.activityLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ActivityLogUpdateManyAndReturnArgs>(args: SelectSubset<T, ActivityLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ActivityLog.
     * @param {ActivityLogUpsertArgs} args - Arguments to update or create a ActivityLog.
     * @example
     * // Update or create a ActivityLog
     * const activityLog = await prisma.activityLog.upsert({
     *   create: {
     *     // ... data to create a ActivityLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ActivityLog we want to update
     *   }
     * })
     */
    upsert<T extends ActivityLogUpsertArgs>(args: SelectSubset<T, ActivityLogUpsertArgs<ExtArgs>>): Prisma__ActivityLogClient<$Result.GetResult<Prisma.$ActivityLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ActivityLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogCountArgs} args - Arguments to filter ActivityLogs to count.
     * @example
     * // Count the number of ActivityLogs
     * const count = await prisma.activityLog.count({
     *   where: {
     *     // ... the filter for the ActivityLogs we want to count
     *   }
     * })
    **/
    count<T extends ActivityLogCountArgs>(
      args?: Subset<T, ActivityLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ActivityLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ActivityLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends ActivityLogAggregateArgs>(args: Subset<T, ActivityLogAggregateArgs>): Prisma.PrismaPromise<GetActivityLogAggregateType<T>>

    /**
     * Group by ActivityLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ActivityLogGroupByArgs} args - Group by arguments.
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
      T extends ActivityLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ActivityLogGroupByArgs['orderBy'] }
        : { orderBy?: ActivityLogGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, ActivityLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetActivityLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ActivityLog model
   */
  readonly fields: ActivityLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ActivityLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ActivityLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the ActivityLog model
   */
  interface ActivityLogFieldRefs {
    readonly id: FieldRef<"ActivityLog", 'Int'>
    readonly action: FieldRef<"ActivityLog", 'String'>
    readonly entity: FieldRef<"ActivityLog", 'String'>
    readonly entityId: FieldRef<"ActivityLog", 'String'>
    readonly title: FieldRef<"ActivityLog", 'String'>
    readonly description: FieldRef<"ActivityLog", 'String'>
    readonly actorId: FieldRef<"ActivityLog", 'Int'>
    readonly actorName: FieldRef<"ActivityLog", 'String'>
    readonly actorRole: FieldRef<"ActivityLog", 'String'>
    readonly metadata: FieldRef<"ActivityLog", 'Json'>
    readonly createdAt: FieldRef<"ActivityLog", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ActivityLog findUnique
   */
  export type ActivityLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog findUniqueOrThrow
   */
  export type ActivityLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog findFirst
   */
  export type ActivityLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityLogs.
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityLogs.
     */
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * ActivityLog findFirstOrThrow
   */
  export type ActivityLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Filter, which ActivityLog to fetch.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ActivityLogs.
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ActivityLogs.
     */
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * ActivityLog findMany
   */
  export type ActivityLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Filter, which ActivityLogs to fetch.
     */
    where?: ActivityLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ActivityLogs to fetch.
     */
    orderBy?: ActivityLogOrderByWithRelationInput | ActivityLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ActivityLogs.
     */
    cursor?: ActivityLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ActivityLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ActivityLogs.
     */
    skip?: number
    distinct?: ActivityLogScalarFieldEnum | ActivityLogScalarFieldEnum[]
  }

  /**
   * ActivityLog create
   */
  export type ActivityLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * The data needed to create a ActivityLog.
     */
    data: XOR<ActivityLogCreateInput, ActivityLogUncheckedCreateInput>
  }

  /**
   * ActivityLog createMany
   */
  export type ActivityLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ActivityLogs.
     */
    data: ActivityLogCreateManyInput | ActivityLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ActivityLog createManyAndReturn
   */
  export type ActivityLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * The data used to create many ActivityLogs.
     */
    data: ActivityLogCreateManyInput | ActivityLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ActivityLog update
   */
  export type ActivityLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * The data needed to update a ActivityLog.
     */
    data: XOR<ActivityLogUpdateInput, ActivityLogUncheckedUpdateInput>
    /**
     * Choose, which ActivityLog to update.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog updateMany
   */
  export type ActivityLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ActivityLogs.
     */
    data: XOR<ActivityLogUpdateManyMutationInput, ActivityLogUncheckedUpdateManyInput>
    /**
     * Filter which ActivityLogs to update
     */
    where?: ActivityLogWhereInput
    /**
     * Limit how many ActivityLogs to update.
     */
    limit?: number
  }

  /**
   * ActivityLog updateManyAndReturn
   */
  export type ActivityLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * The data used to update ActivityLogs.
     */
    data: XOR<ActivityLogUpdateManyMutationInput, ActivityLogUncheckedUpdateManyInput>
    /**
     * Filter which ActivityLogs to update
     */
    where?: ActivityLogWhereInput
    /**
     * Limit how many ActivityLogs to update.
     */
    limit?: number
  }

  /**
   * ActivityLog upsert
   */
  export type ActivityLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * The filter to search for the ActivityLog to update in case it exists.
     */
    where: ActivityLogWhereUniqueInput
    /**
     * In case the ActivityLog found by the `where` argument doesn't exist, create a new ActivityLog with this data.
     */
    create: XOR<ActivityLogCreateInput, ActivityLogUncheckedCreateInput>
    /**
     * In case the ActivityLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ActivityLogUpdateInput, ActivityLogUncheckedUpdateInput>
  }

  /**
   * ActivityLog delete
   */
  export type ActivityLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
    /**
     * Filter which ActivityLog to delete.
     */
    where: ActivityLogWhereUniqueInput
  }

  /**
   * ActivityLog deleteMany
   */
  export type ActivityLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ActivityLogs to delete
     */
    where?: ActivityLogWhereInput
    /**
     * Limit how many ActivityLogs to delete.
     */
    limit?: number
  }

  /**
   * ActivityLog without action
   */
  export type ActivityLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ActivityLog
     */
    select?: ActivityLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ActivityLog
     */
    omit?: ActivityLogOmit<ExtArgs> | null
  }


  /**
   * Model UserCart
   */

  export type AggregateUserCart = {
    _count: UserCartCountAggregateOutputType | null
    _avg: UserCartAvgAggregateOutputType | null
    _sum: UserCartSumAggregateOutputType | null
    _min: UserCartMinAggregateOutputType | null
    _max: UserCartMaxAggregateOutputType | null
  }

  export type UserCartAvgAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type UserCartSumAggregateOutputType = {
    id: number | null
    userId: number | null
  }

  export type UserCartMinAggregateOutputType = {
    id: number | null
    userId: number | null
    scope: string | null
    customerName: string | null
    paymentMethod: string | null
    sessionActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCartMaxAggregateOutputType = {
    id: number | null
    userId: number | null
    scope: string | null
    customerName: string | null
    paymentMethod: string | null
    sessionActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCartCountAggregateOutputType = {
    id: number
    userId: number
    scope: number
    customerName: number
    paymentMethod: number
    sessionActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserCartAvgAggregateInputType = {
    id?: true
    userId?: true
  }

  export type UserCartSumAggregateInputType = {
    id?: true
    userId?: true
  }

  export type UserCartMinAggregateInputType = {
    id?: true
    userId?: true
    scope?: true
    customerName?: true
    paymentMethod?: true
    sessionActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCartMaxAggregateInputType = {
    id?: true
    userId?: true
    scope?: true
    customerName?: true
    paymentMethod?: true
    sessionActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCartCountAggregateInputType = {
    id?: true
    userId?: true
    scope?: true
    customerName?: true
    paymentMethod?: true
    sessionActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserCartAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserCart to aggregate.
     */
    where?: UserCartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCarts to fetch.
     */
    orderBy?: UserCartOrderByWithRelationInput | UserCartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserCartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCarts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCarts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserCarts
    **/
    _count?: true | UserCartCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserCartAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserCartSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserCartMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserCartMaxAggregateInputType
  }

  export type GetUserCartAggregateType<T extends UserCartAggregateArgs> = {
        [P in keyof T & keyof AggregateUserCart]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserCart[P]>
      : GetScalarType<T[P], AggregateUserCart[P]>
  }




  export type UserCartGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserCartWhereInput
    orderBy?: UserCartOrderByWithAggregationInput | UserCartOrderByWithAggregationInput[]
    by: UserCartScalarFieldEnum[] | UserCartScalarFieldEnum
    having?: UserCartScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCartCountAggregateInputType | true
    _avg?: UserCartAvgAggregateInputType
    _sum?: UserCartSumAggregateInputType
    _min?: UserCartMinAggregateInputType
    _max?: UserCartMaxAggregateInputType
  }

  export type UserCartGroupByOutputType = {
    id: number
    userId: number
    scope: string
    customerName: string | null
    paymentMethod: string | null
    sessionActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: UserCartCountAggregateOutputType | null
    _avg: UserCartAvgAggregateOutputType | null
    _sum: UserCartSumAggregateOutputType | null
    _min: UserCartMinAggregateOutputType | null
    _max: UserCartMaxAggregateOutputType | null
  }

  type GetUserCartGroupByPayload<T extends UserCartGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserCartGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserCartGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserCartGroupByOutputType[P]>
            : GetScalarType<T[P], UserCartGroupByOutputType[P]>
        }
      >
    >


  export type UserCartSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    scope?: boolean
    customerName?: boolean
    paymentMethod?: boolean
    sessionActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
    items?: boolean | UserCart$itemsArgs<ExtArgs>
    _count?: boolean | UserCartCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCart"]>

  export type UserCartSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    scope?: boolean
    customerName?: boolean
    paymentMethod?: boolean
    sessionActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCart"]>

  export type UserCartSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    scope?: boolean
    customerName?: boolean
    paymentMethod?: boolean
    sessionActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCart"]>

  export type UserCartSelectScalar = {
    id?: boolean
    userId?: boolean
    scope?: boolean
    customerName?: boolean
    paymentMethod?: boolean
    sessionActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserCartOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "scope" | "customerName" | "paymentMethod" | "sessionActive" | "createdAt" | "updatedAt", ExtArgs["result"]["userCart"]>
  export type UserCartInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
    items?: boolean | UserCart$itemsArgs<ExtArgs>
    _count?: boolean | UserCartCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserCartIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserCartIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserCartPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserCart"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
      items: Prisma.$UserCartItemPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      userId: number
      scope: string
      customerName: string | null
      paymentMethod: string | null
      sessionActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userCart"]>
    composites: {}
  }

  type UserCartGetPayload<S extends boolean | null | undefined | UserCartDefaultArgs> = $Result.GetResult<Prisma.$UserCartPayload, S>

  type UserCartCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserCartFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCartCountAggregateInputType | true
    }

  export interface UserCartDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserCart'], meta: { name: 'UserCart' } }
    /**
     * Find zero or one UserCart that matches the filter.
     * @param {UserCartFindUniqueArgs} args - Arguments to find a UserCart
     * @example
     * // Get one UserCart
     * const userCart = await prisma.userCart.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserCartFindUniqueArgs>(args: SelectSubset<T, UserCartFindUniqueArgs<ExtArgs>>): Prisma__UserCartClient<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserCart that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserCartFindUniqueOrThrowArgs} args - Arguments to find a UserCart
     * @example
     * // Get one UserCart
     * const userCart = await prisma.userCart.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserCartFindUniqueOrThrowArgs>(args: SelectSubset<T, UserCartFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserCartClient<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserCart that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartFindFirstArgs} args - Arguments to find a UserCart
     * @example
     * // Get one UserCart
     * const userCart = await prisma.userCart.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserCartFindFirstArgs>(args?: SelectSubset<T, UserCartFindFirstArgs<ExtArgs>>): Prisma__UserCartClient<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserCart that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartFindFirstOrThrowArgs} args - Arguments to find a UserCart
     * @example
     * // Get one UserCart
     * const userCart = await prisma.userCart.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserCartFindFirstOrThrowArgs>(args?: SelectSubset<T, UserCartFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserCartClient<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserCarts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserCarts
     * const userCarts = await prisma.userCart.findMany()
     * 
     * // Get first 10 UserCarts
     * const userCarts = await prisma.userCart.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userCartWithIdOnly = await prisma.userCart.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserCartFindManyArgs>(args?: SelectSubset<T, UserCartFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserCart.
     * @param {UserCartCreateArgs} args - Arguments to create a UserCart.
     * @example
     * // Create one UserCart
     * const UserCart = await prisma.userCart.create({
     *   data: {
     *     // ... data to create a UserCart
     *   }
     * })
     * 
     */
    create<T extends UserCartCreateArgs>(args: SelectSubset<T, UserCartCreateArgs<ExtArgs>>): Prisma__UserCartClient<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserCarts.
     * @param {UserCartCreateManyArgs} args - Arguments to create many UserCarts.
     * @example
     * // Create many UserCarts
     * const userCart = await prisma.userCart.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCartCreateManyArgs>(args?: SelectSubset<T, UserCartCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserCarts and returns the data saved in the database.
     * @param {UserCartCreateManyAndReturnArgs} args - Arguments to create many UserCarts.
     * @example
     * // Create many UserCarts
     * const userCart = await prisma.userCart.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserCarts and only return the `id`
     * const userCartWithIdOnly = await prisma.userCart.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCartCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCartCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserCart.
     * @param {UserCartDeleteArgs} args - Arguments to delete one UserCart.
     * @example
     * // Delete one UserCart
     * const UserCart = await prisma.userCart.delete({
     *   where: {
     *     // ... filter to delete one UserCart
     *   }
     * })
     * 
     */
    delete<T extends UserCartDeleteArgs>(args: SelectSubset<T, UserCartDeleteArgs<ExtArgs>>): Prisma__UserCartClient<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserCart.
     * @param {UserCartUpdateArgs} args - Arguments to update one UserCart.
     * @example
     * // Update one UserCart
     * const userCart = await prisma.userCart.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserCartUpdateArgs>(args: SelectSubset<T, UserCartUpdateArgs<ExtArgs>>): Prisma__UserCartClient<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserCarts.
     * @param {UserCartDeleteManyArgs} args - Arguments to filter UserCarts to delete.
     * @example
     * // Delete a few UserCarts
     * const { count } = await prisma.userCart.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserCartDeleteManyArgs>(args?: SelectSubset<T, UserCartDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserCarts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserCarts
     * const userCart = await prisma.userCart.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserCartUpdateManyArgs>(args: SelectSubset<T, UserCartUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserCarts and returns the data updated in the database.
     * @param {UserCartUpdateManyAndReturnArgs} args - Arguments to update many UserCarts.
     * @example
     * // Update many UserCarts
     * const userCart = await prisma.userCart.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserCarts and only return the `id`
     * const userCartWithIdOnly = await prisma.userCart.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserCartUpdateManyAndReturnArgs>(args: SelectSubset<T, UserCartUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserCart.
     * @param {UserCartUpsertArgs} args - Arguments to update or create a UserCart.
     * @example
     * // Update or create a UserCart
     * const userCart = await prisma.userCart.upsert({
     *   create: {
     *     // ... data to create a UserCart
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserCart we want to update
     *   }
     * })
     */
    upsert<T extends UserCartUpsertArgs>(args: SelectSubset<T, UserCartUpsertArgs<ExtArgs>>): Prisma__UserCartClient<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserCarts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartCountArgs} args - Arguments to filter UserCarts to count.
     * @example
     * // Count the number of UserCarts
     * const count = await prisma.userCart.count({
     *   where: {
     *     // ... the filter for the UserCarts we want to count
     *   }
     * })
    **/
    count<T extends UserCartCountArgs>(
      args?: Subset<T, UserCartCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCartCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserCart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserCartAggregateArgs>(args: Subset<T, UserCartAggregateArgs>): Prisma.PrismaPromise<GetUserCartAggregateType<T>>

    /**
     * Group by UserCart.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartGroupByArgs} args - Group by arguments.
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
      T extends UserCartGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserCartGroupByArgs['orderBy'] }
        : { orderBy?: UserCartGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserCartGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserCartGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserCart model
   */
  readonly fields: UserCartFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserCart.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserCartClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    items<T extends UserCart$itemsArgs<ExtArgs> = {}>(args?: Subset<T, UserCart$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the UserCart model
   */
  interface UserCartFieldRefs {
    readonly id: FieldRef<"UserCart", 'Int'>
    readonly userId: FieldRef<"UserCart", 'Int'>
    readonly scope: FieldRef<"UserCart", 'String'>
    readonly customerName: FieldRef<"UserCart", 'String'>
    readonly paymentMethod: FieldRef<"UserCart", 'String'>
    readonly sessionActive: FieldRef<"UserCart", 'Boolean'>
    readonly createdAt: FieldRef<"UserCart", 'DateTime'>
    readonly updatedAt: FieldRef<"UserCart", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserCart findUnique
   */
  export type UserCartFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    /**
     * Filter, which UserCart to fetch.
     */
    where: UserCartWhereUniqueInput
  }

  /**
   * UserCart findUniqueOrThrow
   */
  export type UserCartFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    /**
     * Filter, which UserCart to fetch.
     */
    where: UserCartWhereUniqueInput
  }

  /**
   * UserCart findFirst
   */
  export type UserCartFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    /**
     * Filter, which UserCart to fetch.
     */
    where?: UserCartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCarts to fetch.
     */
    orderBy?: UserCartOrderByWithRelationInput | UserCartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserCarts.
     */
    cursor?: UserCartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCarts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCarts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserCarts.
     */
    distinct?: UserCartScalarFieldEnum | UserCartScalarFieldEnum[]
  }

  /**
   * UserCart findFirstOrThrow
   */
  export type UserCartFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    /**
     * Filter, which UserCart to fetch.
     */
    where?: UserCartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCarts to fetch.
     */
    orderBy?: UserCartOrderByWithRelationInput | UserCartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserCarts.
     */
    cursor?: UserCartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCarts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCarts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserCarts.
     */
    distinct?: UserCartScalarFieldEnum | UserCartScalarFieldEnum[]
  }

  /**
   * UserCart findMany
   */
  export type UserCartFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    /**
     * Filter, which UserCarts to fetch.
     */
    where?: UserCartWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCarts to fetch.
     */
    orderBy?: UserCartOrderByWithRelationInput | UserCartOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserCarts.
     */
    cursor?: UserCartWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCarts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCarts.
     */
    skip?: number
    distinct?: UserCartScalarFieldEnum | UserCartScalarFieldEnum[]
  }

  /**
   * UserCart create
   */
  export type UserCartCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    /**
     * The data needed to create a UserCart.
     */
    data: XOR<UserCartCreateInput, UserCartUncheckedCreateInput>
  }

  /**
   * UserCart createMany
   */
  export type UserCartCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserCarts.
     */
    data: UserCartCreateManyInput | UserCartCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserCart createManyAndReturn
   */
  export type UserCartCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * The data used to create many UserCarts.
     */
    data: UserCartCreateManyInput | UserCartCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserCart update
   */
  export type UserCartUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    /**
     * The data needed to update a UserCart.
     */
    data: XOR<UserCartUpdateInput, UserCartUncheckedUpdateInput>
    /**
     * Choose, which UserCart to update.
     */
    where: UserCartWhereUniqueInput
  }

  /**
   * UserCart updateMany
   */
  export type UserCartUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserCarts.
     */
    data: XOR<UserCartUpdateManyMutationInput, UserCartUncheckedUpdateManyInput>
    /**
     * Filter which UserCarts to update
     */
    where?: UserCartWhereInput
    /**
     * Limit how many UserCarts to update.
     */
    limit?: number
  }

  /**
   * UserCart updateManyAndReturn
   */
  export type UserCartUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * The data used to update UserCarts.
     */
    data: XOR<UserCartUpdateManyMutationInput, UserCartUncheckedUpdateManyInput>
    /**
     * Filter which UserCarts to update
     */
    where?: UserCartWhereInput
    /**
     * Limit how many UserCarts to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserCart upsert
   */
  export type UserCartUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    /**
     * The filter to search for the UserCart to update in case it exists.
     */
    where: UserCartWhereUniqueInput
    /**
     * In case the UserCart found by the `where` argument doesn't exist, create a new UserCart with this data.
     */
    create: XOR<UserCartCreateInput, UserCartUncheckedCreateInput>
    /**
     * In case the UserCart was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserCartUpdateInput, UserCartUncheckedUpdateInput>
  }

  /**
   * UserCart delete
   */
  export type UserCartDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
    /**
     * Filter which UserCart to delete.
     */
    where: UserCartWhereUniqueInput
  }

  /**
   * UserCart deleteMany
   */
  export type UserCartDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserCarts to delete
     */
    where?: UserCartWhereInput
    /**
     * Limit how many UserCarts to delete.
     */
    limit?: number
  }

  /**
   * UserCart.items
   */
  export type UserCart$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    where?: UserCartItemWhereInput
    orderBy?: UserCartItemOrderByWithRelationInput | UserCartItemOrderByWithRelationInput[]
    cursor?: UserCartItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserCartItemScalarFieldEnum | UserCartItemScalarFieldEnum[]
  }

  /**
   * UserCart without action
   */
  export type UserCartDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCart
     */
    select?: UserCartSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCart
     */
    omit?: UserCartOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartInclude<ExtArgs> | null
  }


  /**
   * Model UserCartItem
   */

  export type AggregateUserCartItem = {
    _count: UserCartItemCountAggregateOutputType | null
    _avg: UserCartItemAvgAggregateOutputType | null
    _sum: UserCartItemSumAggregateOutputType | null
    _min: UserCartItemMinAggregateOutputType | null
    _max: UserCartItemMaxAggregateOutputType | null
  }

  export type UserCartItemAvgAggregateOutputType = {
    id: number | null
    cartId: number | null
    productId: number | null
    quantity: number | null
    priceOverride: number | null
  }

  export type UserCartItemSumAggregateOutputType = {
    id: number | null
    cartId: number | null
    productId: number | null
    quantity: number | null
    priceOverride: number | null
  }

  export type UserCartItemMinAggregateOutputType = {
    id: number | null
    cartId: number | null
    productId: number | null
    quantity: number | null
    priceOverride: number | null
    satuanPesan: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCartItemMaxAggregateOutputType = {
    id: number | null
    cartId: number | null
    productId: number | null
    quantity: number | null
    priceOverride: number | null
    satuanPesan: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type UserCartItemCountAggregateOutputType = {
    id: number
    cartId: number
    productId: number
    quantity: number
    priceOverride: number
    satuanPesan: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type UserCartItemAvgAggregateInputType = {
    id?: true
    cartId?: true
    productId?: true
    quantity?: true
    priceOverride?: true
  }

  export type UserCartItemSumAggregateInputType = {
    id?: true
    cartId?: true
    productId?: true
    quantity?: true
    priceOverride?: true
  }

  export type UserCartItemMinAggregateInputType = {
    id?: true
    cartId?: true
    productId?: true
    quantity?: true
    priceOverride?: true
    satuanPesan?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCartItemMaxAggregateInputType = {
    id?: true
    cartId?: true
    productId?: true
    quantity?: true
    priceOverride?: true
    satuanPesan?: true
    createdAt?: true
    updatedAt?: true
  }

  export type UserCartItemCountAggregateInputType = {
    id?: true
    cartId?: true
    productId?: true
    quantity?: true
    priceOverride?: true
    satuanPesan?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type UserCartItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserCartItem to aggregate.
     */
    where?: UserCartItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCartItems to fetch.
     */
    orderBy?: UserCartItemOrderByWithRelationInput | UserCartItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserCartItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCartItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCartItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserCartItems
    **/
    _count?: true | UserCartItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserCartItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserCartItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserCartItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserCartItemMaxAggregateInputType
  }

  export type GetUserCartItemAggregateType<T extends UserCartItemAggregateArgs> = {
        [P in keyof T & keyof AggregateUserCartItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserCartItem[P]>
      : GetScalarType<T[P], AggregateUserCartItem[P]>
  }




  export type UserCartItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserCartItemWhereInput
    orderBy?: UserCartItemOrderByWithAggregationInput | UserCartItemOrderByWithAggregationInput[]
    by: UserCartItemScalarFieldEnum[] | UserCartItemScalarFieldEnum
    having?: UserCartItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCartItemCountAggregateInputType | true
    _avg?: UserCartItemAvgAggregateInputType
    _sum?: UserCartItemSumAggregateInputType
    _min?: UserCartItemMinAggregateInputType
    _max?: UserCartItemMaxAggregateInputType
  }

  export type UserCartItemGroupByOutputType = {
    id: number
    cartId: number
    productId: number
    quantity: number
    priceOverride: number | null
    satuanPesan: string
    createdAt: Date
    updatedAt: Date
    _count: UserCartItemCountAggregateOutputType | null
    _avg: UserCartItemAvgAggregateOutputType | null
    _sum: UserCartItemSumAggregateOutputType | null
    _min: UserCartItemMinAggregateOutputType | null
    _max: UserCartItemMaxAggregateOutputType | null
  }

  type GetUserCartItemGroupByPayload<T extends UserCartItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserCartItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserCartItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserCartItemGroupByOutputType[P]>
            : GetScalarType<T[P], UserCartItemGroupByOutputType[P]>
        }
      >
    >


  export type UserCartItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cartId?: boolean
    productId?: boolean
    quantity?: boolean
    priceOverride?: boolean
    satuanPesan?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cart?: boolean | UserCartDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCartItem"]>

  export type UserCartItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cartId?: boolean
    productId?: boolean
    quantity?: boolean
    priceOverride?: boolean
    satuanPesan?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cart?: boolean | UserCartDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCartItem"]>

  export type UserCartItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    cartId?: boolean
    productId?: boolean
    quantity?: boolean
    priceOverride?: boolean
    satuanPesan?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    cart?: boolean | UserCartDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userCartItem"]>

  export type UserCartItemSelectScalar = {
    id?: boolean
    cartId?: boolean
    productId?: boolean
    quantity?: boolean
    priceOverride?: boolean
    satuanPesan?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type UserCartItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "cartId" | "productId" | "quantity" | "priceOverride" | "satuanPesan" | "createdAt" | "updatedAt", ExtArgs["result"]["userCartItem"]>
  export type UserCartItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cart?: boolean | UserCartDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type UserCartItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cart?: boolean | UserCartDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type UserCartItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    cart?: boolean | UserCartDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $UserCartItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserCartItem"
    objects: {
      cart: Prisma.$UserCartPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      cartId: number
      productId: number
      quantity: number
      priceOverride: number | null
      satuanPesan: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["userCartItem"]>
    composites: {}
  }

  type UserCartItemGetPayload<S extends boolean | null | undefined | UserCartItemDefaultArgs> = $Result.GetResult<Prisma.$UserCartItemPayload, S>

  type UserCartItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserCartItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCartItemCountAggregateInputType | true
    }

  export interface UserCartItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserCartItem'], meta: { name: 'UserCartItem' } }
    /**
     * Find zero or one UserCartItem that matches the filter.
     * @param {UserCartItemFindUniqueArgs} args - Arguments to find a UserCartItem
     * @example
     * // Get one UserCartItem
     * const userCartItem = await prisma.userCartItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserCartItemFindUniqueArgs>(args: SelectSubset<T, UserCartItemFindUniqueArgs<ExtArgs>>): Prisma__UserCartItemClient<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserCartItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserCartItemFindUniqueOrThrowArgs} args - Arguments to find a UserCartItem
     * @example
     * // Get one UserCartItem
     * const userCartItem = await prisma.userCartItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserCartItemFindUniqueOrThrowArgs>(args: SelectSubset<T, UserCartItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserCartItemClient<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserCartItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartItemFindFirstArgs} args - Arguments to find a UserCartItem
     * @example
     * // Get one UserCartItem
     * const userCartItem = await prisma.userCartItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserCartItemFindFirstArgs>(args?: SelectSubset<T, UserCartItemFindFirstArgs<ExtArgs>>): Prisma__UserCartItemClient<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserCartItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartItemFindFirstOrThrowArgs} args - Arguments to find a UserCartItem
     * @example
     * // Get one UserCartItem
     * const userCartItem = await prisma.userCartItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserCartItemFindFirstOrThrowArgs>(args?: SelectSubset<T, UserCartItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserCartItemClient<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserCartItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserCartItems
     * const userCartItems = await prisma.userCartItem.findMany()
     * 
     * // Get first 10 UserCartItems
     * const userCartItems = await prisma.userCartItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userCartItemWithIdOnly = await prisma.userCartItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserCartItemFindManyArgs>(args?: SelectSubset<T, UserCartItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserCartItem.
     * @param {UserCartItemCreateArgs} args - Arguments to create a UserCartItem.
     * @example
     * // Create one UserCartItem
     * const UserCartItem = await prisma.userCartItem.create({
     *   data: {
     *     // ... data to create a UserCartItem
     *   }
     * })
     * 
     */
    create<T extends UserCartItemCreateArgs>(args: SelectSubset<T, UserCartItemCreateArgs<ExtArgs>>): Prisma__UserCartItemClient<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserCartItems.
     * @param {UserCartItemCreateManyArgs} args - Arguments to create many UserCartItems.
     * @example
     * // Create many UserCartItems
     * const userCartItem = await prisma.userCartItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCartItemCreateManyArgs>(args?: SelectSubset<T, UserCartItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserCartItems and returns the data saved in the database.
     * @param {UserCartItemCreateManyAndReturnArgs} args - Arguments to create many UserCartItems.
     * @example
     * // Create many UserCartItems
     * const userCartItem = await prisma.userCartItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserCartItems and only return the `id`
     * const userCartItemWithIdOnly = await prisma.userCartItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCartItemCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCartItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserCartItem.
     * @param {UserCartItemDeleteArgs} args - Arguments to delete one UserCartItem.
     * @example
     * // Delete one UserCartItem
     * const UserCartItem = await prisma.userCartItem.delete({
     *   where: {
     *     // ... filter to delete one UserCartItem
     *   }
     * })
     * 
     */
    delete<T extends UserCartItemDeleteArgs>(args: SelectSubset<T, UserCartItemDeleteArgs<ExtArgs>>): Prisma__UserCartItemClient<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserCartItem.
     * @param {UserCartItemUpdateArgs} args - Arguments to update one UserCartItem.
     * @example
     * // Update one UserCartItem
     * const userCartItem = await prisma.userCartItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserCartItemUpdateArgs>(args: SelectSubset<T, UserCartItemUpdateArgs<ExtArgs>>): Prisma__UserCartItemClient<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserCartItems.
     * @param {UserCartItemDeleteManyArgs} args - Arguments to filter UserCartItems to delete.
     * @example
     * // Delete a few UserCartItems
     * const { count } = await prisma.userCartItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserCartItemDeleteManyArgs>(args?: SelectSubset<T, UserCartItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserCartItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserCartItems
     * const userCartItem = await prisma.userCartItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserCartItemUpdateManyArgs>(args: SelectSubset<T, UserCartItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserCartItems and returns the data updated in the database.
     * @param {UserCartItemUpdateManyAndReturnArgs} args - Arguments to update many UserCartItems.
     * @example
     * // Update many UserCartItems
     * const userCartItem = await prisma.userCartItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserCartItems and only return the `id`
     * const userCartItemWithIdOnly = await prisma.userCartItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserCartItemUpdateManyAndReturnArgs>(args: SelectSubset<T, UserCartItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserCartItem.
     * @param {UserCartItemUpsertArgs} args - Arguments to update or create a UserCartItem.
     * @example
     * // Update or create a UserCartItem
     * const userCartItem = await prisma.userCartItem.upsert({
     *   create: {
     *     // ... data to create a UserCartItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserCartItem we want to update
     *   }
     * })
     */
    upsert<T extends UserCartItemUpsertArgs>(args: SelectSubset<T, UserCartItemUpsertArgs<ExtArgs>>): Prisma__UserCartItemClient<$Result.GetResult<Prisma.$UserCartItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserCartItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartItemCountArgs} args - Arguments to filter UserCartItems to count.
     * @example
     * // Count the number of UserCartItems
     * const count = await prisma.userCartItem.count({
     *   where: {
     *     // ... the filter for the UserCartItems we want to count
     *   }
     * })
    **/
    count<T extends UserCartItemCountArgs>(
      args?: Subset<T, UserCartItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCartItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserCartItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserCartItemAggregateArgs>(args: Subset<T, UserCartItemAggregateArgs>): Prisma.PrismaPromise<GetUserCartItemAggregateType<T>>

    /**
     * Group by UserCartItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCartItemGroupByArgs} args - Group by arguments.
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
      T extends UserCartItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserCartItemGroupByArgs['orderBy'] }
        : { orderBy?: UserCartItemGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserCartItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserCartItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserCartItem model
   */
  readonly fields: UserCartItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserCartItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserCartItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    cart<T extends UserCartDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserCartDefaultArgs<ExtArgs>>): Prisma__UserCartClient<$Result.GetResult<Prisma.$UserCartPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the UserCartItem model
   */
  interface UserCartItemFieldRefs {
    readonly id: FieldRef<"UserCartItem", 'Int'>
    readonly cartId: FieldRef<"UserCartItem", 'Int'>
    readonly productId: FieldRef<"UserCartItem", 'Int'>
    readonly quantity: FieldRef<"UserCartItem", 'Int'>
    readonly priceOverride: FieldRef<"UserCartItem", 'Int'>
    readonly satuanPesan: FieldRef<"UserCartItem", 'String'>
    readonly createdAt: FieldRef<"UserCartItem", 'DateTime'>
    readonly updatedAt: FieldRef<"UserCartItem", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserCartItem findUnique
   */
  export type UserCartItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    /**
     * Filter, which UserCartItem to fetch.
     */
    where: UserCartItemWhereUniqueInput
  }

  /**
   * UserCartItem findUniqueOrThrow
   */
  export type UserCartItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    /**
     * Filter, which UserCartItem to fetch.
     */
    where: UserCartItemWhereUniqueInput
  }

  /**
   * UserCartItem findFirst
   */
  export type UserCartItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    /**
     * Filter, which UserCartItem to fetch.
     */
    where?: UserCartItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCartItems to fetch.
     */
    orderBy?: UserCartItemOrderByWithRelationInput | UserCartItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserCartItems.
     */
    cursor?: UserCartItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCartItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCartItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserCartItems.
     */
    distinct?: UserCartItemScalarFieldEnum | UserCartItemScalarFieldEnum[]
  }

  /**
   * UserCartItem findFirstOrThrow
   */
  export type UserCartItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    /**
     * Filter, which UserCartItem to fetch.
     */
    where?: UserCartItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCartItems to fetch.
     */
    orderBy?: UserCartItemOrderByWithRelationInput | UserCartItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserCartItems.
     */
    cursor?: UserCartItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCartItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCartItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserCartItems.
     */
    distinct?: UserCartItemScalarFieldEnum | UserCartItemScalarFieldEnum[]
  }

  /**
   * UserCartItem findMany
   */
  export type UserCartItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    /**
     * Filter, which UserCartItems to fetch.
     */
    where?: UserCartItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserCartItems to fetch.
     */
    orderBy?: UserCartItemOrderByWithRelationInput | UserCartItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserCartItems.
     */
    cursor?: UserCartItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserCartItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserCartItems.
     */
    skip?: number
    distinct?: UserCartItemScalarFieldEnum | UserCartItemScalarFieldEnum[]
  }

  /**
   * UserCartItem create
   */
  export type UserCartItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    /**
     * The data needed to create a UserCartItem.
     */
    data: XOR<UserCartItemCreateInput, UserCartItemUncheckedCreateInput>
  }

  /**
   * UserCartItem createMany
   */
  export type UserCartItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserCartItems.
     */
    data: UserCartItemCreateManyInput | UserCartItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserCartItem createManyAndReturn
   */
  export type UserCartItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * The data used to create many UserCartItems.
     */
    data: UserCartItemCreateManyInput | UserCartItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserCartItem update
   */
  export type UserCartItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    /**
     * The data needed to update a UserCartItem.
     */
    data: XOR<UserCartItemUpdateInput, UserCartItemUncheckedUpdateInput>
    /**
     * Choose, which UserCartItem to update.
     */
    where: UserCartItemWhereUniqueInput
  }

  /**
   * UserCartItem updateMany
   */
  export type UserCartItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserCartItems.
     */
    data: XOR<UserCartItemUpdateManyMutationInput, UserCartItemUncheckedUpdateManyInput>
    /**
     * Filter which UserCartItems to update
     */
    where?: UserCartItemWhereInput
    /**
     * Limit how many UserCartItems to update.
     */
    limit?: number
  }

  /**
   * UserCartItem updateManyAndReturn
   */
  export type UserCartItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * The data used to update UserCartItems.
     */
    data: XOR<UserCartItemUpdateManyMutationInput, UserCartItemUncheckedUpdateManyInput>
    /**
     * Filter which UserCartItems to update
     */
    where?: UserCartItemWhereInput
    /**
     * Limit how many UserCartItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserCartItem upsert
   */
  export type UserCartItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    /**
     * The filter to search for the UserCartItem to update in case it exists.
     */
    where: UserCartItemWhereUniqueInput
    /**
     * In case the UserCartItem found by the `where` argument doesn't exist, create a new UserCartItem with this data.
     */
    create: XOR<UserCartItemCreateInput, UserCartItemUncheckedCreateInput>
    /**
     * In case the UserCartItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserCartItemUpdateInput, UserCartItemUncheckedUpdateInput>
  }

  /**
   * UserCartItem delete
   */
  export type UserCartItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
    /**
     * Filter which UserCartItem to delete.
     */
    where: UserCartItemWhereUniqueInput
  }

  /**
   * UserCartItem deleteMany
   */
  export type UserCartItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserCartItems to delete
     */
    where?: UserCartItemWhereInput
    /**
     * Limit how many UserCartItems to delete.
     */
    limit?: number
  }

  /**
   * UserCartItem without action
   */
  export type UserCartItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCartItem
     */
    select?: UserCartItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserCartItem
     */
    omit?: UserCartItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserCartItemInclude<ExtArgs> | null
  }


  /**
   * Model OrderRequest
   */

  export type AggregateOrderRequest = {
    _count: OrderRequestCountAggregateOutputType | null
    _avg: OrderRequestAvgAggregateOutputType | null
    _sum: OrderRequestSumAggregateOutputType | null
    _min: OrderRequestMinAggregateOutputType | null
    _max: OrderRequestMaxAggregateOutputType | null
  }

  export type OrderRequestAvgAggregateOutputType = {
    id: number | null
    totalPrice: number | null
    transactionId: number | null
  }

  export type OrderRequestSumAggregateOutputType = {
    id: number | null
    totalPrice: number | null
    transactionId: number | null
  }

  export type OrderRequestMinAggregateOutputType = {
    id: number | null
    code: string | null
    customerName: string | null
    phone: string | null
    status: string | null
    rejectionReason: string | null
    totalPrice: number | null
    transactionId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderRequestMaxAggregateOutputType = {
    id: number | null
    code: string | null
    customerName: string | null
    phone: string | null
    status: string | null
    rejectionReason: string | null
    totalPrice: number | null
    transactionId: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type OrderRequestCountAggregateOutputType = {
    id: number
    code: number
    customerName: number
    phone: number
    status: number
    rejectionReason: number
    totalPrice: number
    transactionId: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type OrderRequestAvgAggregateInputType = {
    id?: true
    totalPrice?: true
    transactionId?: true
  }

  export type OrderRequestSumAggregateInputType = {
    id?: true
    totalPrice?: true
    transactionId?: true
  }

  export type OrderRequestMinAggregateInputType = {
    id?: true
    code?: true
    customerName?: true
    phone?: true
    status?: true
    rejectionReason?: true
    totalPrice?: true
    transactionId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderRequestMaxAggregateInputType = {
    id?: true
    code?: true
    customerName?: true
    phone?: true
    status?: true
    rejectionReason?: true
    totalPrice?: true
    transactionId?: true
    createdAt?: true
    updatedAt?: true
  }

  export type OrderRequestCountAggregateInputType = {
    id?: true
    code?: true
    customerName?: true
    phone?: true
    status?: true
    rejectionReason?: true
    totalPrice?: true
    transactionId?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type OrderRequestAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderRequest to aggregate.
     */
    where?: OrderRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderRequests to fetch.
     */
    orderBy?: OrderRequestOrderByWithRelationInput | OrderRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrderRequests
    **/
    _count?: true | OrderRequestCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderRequestAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderRequestSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderRequestMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderRequestMaxAggregateInputType
  }

  export type GetOrderRequestAggregateType<T extends OrderRequestAggregateArgs> = {
        [P in keyof T & keyof AggregateOrderRequest]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrderRequest[P]>
      : GetScalarType<T[P], AggregateOrderRequest[P]>
  }




  export type OrderRequestGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderRequestWhereInput
    orderBy?: OrderRequestOrderByWithAggregationInput | OrderRequestOrderByWithAggregationInput[]
    by: OrderRequestScalarFieldEnum[] | OrderRequestScalarFieldEnum
    having?: OrderRequestScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderRequestCountAggregateInputType | true
    _avg?: OrderRequestAvgAggregateInputType
    _sum?: OrderRequestSumAggregateInputType
    _min?: OrderRequestMinAggregateInputType
    _max?: OrderRequestMaxAggregateInputType
  }

  export type OrderRequestGroupByOutputType = {
    id: number
    code: string
    customerName: string
    phone: string
    status: string
    rejectionReason: string | null
    totalPrice: number
    transactionId: number | null
    createdAt: Date
    updatedAt: Date
    _count: OrderRequestCountAggregateOutputType | null
    _avg: OrderRequestAvgAggregateOutputType | null
    _sum: OrderRequestSumAggregateOutputType | null
    _min: OrderRequestMinAggregateOutputType | null
    _max: OrderRequestMaxAggregateOutputType | null
  }

  type GetOrderRequestGroupByPayload<T extends OrderRequestGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderRequestGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderRequestGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderRequestGroupByOutputType[P]>
            : GetScalarType<T[P], OrderRequestGroupByOutputType[P]>
        }
      >
    >


  export type OrderRequestSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    customerName?: boolean
    phone?: boolean
    status?: boolean
    rejectionReason?: boolean
    totalPrice?: boolean
    transactionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transaction?: boolean | OrderRequest$transactionArgs<ExtArgs>
    items?: boolean | OrderRequest$itemsArgs<ExtArgs>
    statusHistory?: boolean | OrderRequest$statusHistoryArgs<ExtArgs>
    _count?: boolean | OrderRequestCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderRequest"]>

  export type OrderRequestSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    customerName?: boolean
    phone?: boolean
    status?: boolean
    rejectionReason?: boolean
    totalPrice?: boolean
    transactionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transaction?: boolean | OrderRequest$transactionArgs<ExtArgs>
  }, ExtArgs["result"]["orderRequest"]>

  export type OrderRequestSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    code?: boolean
    customerName?: boolean
    phone?: boolean
    status?: boolean
    rejectionReason?: boolean
    totalPrice?: boolean
    transactionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    transaction?: boolean | OrderRequest$transactionArgs<ExtArgs>
  }, ExtArgs["result"]["orderRequest"]>

  export type OrderRequestSelectScalar = {
    id?: boolean
    code?: boolean
    customerName?: boolean
    phone?: boolean
    status?: boolean
    rejectionReason?: boolean
    totalPrice?: boolean
    transactionId?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type OrderRequestOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "code" | "customerName" | "phone" | "status" | "rejectionReason" | "totalPrice" | "transactionId" | "createdAt" | "updatedAt", ExtArgs["result"]["orderRequest"]>
  export type OrderRequestInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | OrderRequest$transactionArgs<ExtArgs>
    items?: boolean | OrderRequest$itemsArgs<ExtArgs>
    statusHistory?: boolean | OrderRequest$statusHistoryArgs<ExtArgs>
    _count?: boolean | OrderRequestCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type OrderRequestIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | OrderRequest$transactionArgs<ExtArgs>
  }
  export type OrderRequestIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    transaction?: boolean | OrderRequest$transactionArgs<ExtArgs>
  }

  export type $OrderRequestPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrderRequest"
    objects: {
      transaction: Prisma.$TransactionPayload<ExtArgs> | null
      items: Prisma.$OrderRequestItemPayload<ExtArgs>[]
      statusHistory: Prisma.$OrderStatusHistoryPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      code: string
      customerName: string
      phone: string
      status: string
      rejectionReason: string | null
      totalPrice: number
      transactionId: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["orderRequest"]>
    composites: {}
  }

  type OrderRequestGetPayload<S extends boolean | null | undefined | OrderRequestDefaultArgs> = $Result.GetResult<Prisma.$OrderRequestPayload, S>

  type OrderRequestCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderRequestFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderRequestCountAggregateInputType | true
    }

  export interface OrderRequestDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrderRequest'], meta: { name: 'OrderRequest' } }
    /**
     * Find zero or one OrderRequest that matches the filter.
     * @param {OrderRequestFindUniqueArgs} args - Arguments to find a OrderRequest
     * @example
     * // Get one OrderRequest
     * const orderRequest = await prisma.orderRequest.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderRequestFindUniqueArgs>(args: SelectSubset<T, OrderRequestFindUniqueArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrderRequest that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderRequestFindUniqueOrThrowArgs} args - Arguments to find a OrderRequest
     * @example
     * // Get one OrderRequest
     * const orderRequest = await prisma.orderRequest.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderRequestFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderRequestFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderRequest that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestFindFirstArgs} args - Arguments to find a OrderRequest
     * @example
     * // Get one OrderRequest
     * const orderRequest = await prisma.orderRequest.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderRequestFindFirstArgs>(args?: SelectSubset<T, OrderRequestFindFirstArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderRequest that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestFindFirstOrThrowArgs} args - Arguments to find a OrderRequest
     * @example
     * // Get one OrderRequest
     * const orderRequest = await prisma.orderRequest.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderRequestFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderRequestFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrderRequests that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrderRequests
     * const orderRequests = await prisma.orderRequest.findMany()
     * 
     * // Get first 10 OrderRequests
     * const orderRequests = await prisma.orderRequest.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderRequestWithIdOnly = await prisma.orderRequest.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderRequestFindManyArgs>(args?: SelectSubset<T, OrderRequestFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrderRequest.
     * @param {OrderRequestCreateArgs} args - Arguments to create a OrderRequest.
     * @example
     * // Create one OrderRequest
     * const OrderRequest = await prisma.orderRequest.create({
     *   data: {
     *     // ... data to create a OrderRequest
     *   }
     * })
     * 
     */
    create<T extends OrderRequestCreateArgs>(args: SelectSubset<T, OrderRequestCreateArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrderRequests.
     * @param {OrderRequestCreateManyArgs} args - Arguments to create many OrderRequests.
     * @example
     * // Create many OrderRequests
     * const orderRequest = await prisma.orderRequest.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderRequestCreateManyArgs>(args?: SelectSubset<T, OrderRequestCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrderRequests and returns the data saved in the database.
     * @param {OrderRequestCreateManyAndReturnArgs} args - Arguments to create many OrderRequests.
     * @example
     * // Create many OrderRequests
     * const orderRequest = await prisma.orderRequest.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrderRequests and only return the `id`
     * const orderRequestWithIdOnly = await prisma.orderRequest.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderRequestCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderRequestCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrderRequest.
     * @param {OrderRequestDeleteArgs} args - Arguments to delete one OrderRequest.
     * @example
     * // Delete one OrderRequest
     * const OrderRequest = await prisma.orderRequest.delete({
     *   where: {
     *     // ... filter to delete one OrderRequest
     *   }
     * })
     * 
     */
    delete<T extends OrderRequestDeleteArgs>(args: SelectSubset<T, OrderRequestDeleteArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrderRequest.
     * @param {OrderRequestUpdateArgs} args - Arguments to update one OrderRequest.
     * @example
     * // Update one OrderRequest
     * const orderRequest = await prisma.orderRequest.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderRequestUpdateArgs>(args: SelectSubset<T, OrderRequestUpdateArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrderRequests.
     * @param {OrderRequestDeleteManyArgs} args - Arguments to filter OrderRequests to delete.
     * @example
     * // Delete a few OrderRequests
     * const { count } = await prisma.orderRequest.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderRequestDeleteManyArgs>(args?: SelectSubset<T, OrderRequestDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrderRequests
     * const orderRequest = await prisma.orderRequest.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderRequestUpdateManyArgs>(args: SelectSubset<T, OrderRequestUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderRequests and returns the data updated in the database.
     * @param {OrderRequestUpdateManyAndReturnArgs} args - Arguments to update many OrderRequests.
     * @example
     * // Update many OrderRequests
     * const orderRequest = await prisma.orderRequest.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrderRequests and only return the `id`
     * const orderRequestWithIdOnly = await prisma.orderRequest.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrderRequestUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderRequestUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrderRequest.
     * @param {OrderRequestUpsertArgs} args - Arguments to update or create a OrderRequest.
     * @example
     * // Update or create a OrderRequest
     * const orderRequest = await prisma.orderRequest.upsert({
     *   create: {
     *     // ... data to create a OrderRequest
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrderRequest we want to update
     *   }
     * })
     */
    upsert<T extends OrderRequestUpsertArgs>(args: SelectSubset<T, OrderRequestUpsertArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrderRequests.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestCountArgs} args - Arguments to filter OrderRequests to count.
     * @example
     * // Count the number of OrderRequests
     * const count = await prisma.orderRequest.count({
     *   where: {
     *     // ... the filter for the OrderRequests we want to count
     *   }
     * })
    **/
    count<T extends OrderRequestCountArgs>(
      args?: Subset<T, OrderRequestCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderRequestCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrderRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrderRequestAggregateArgs>(args: Subset<T, OrderRequestAggregateArgs>): Prisma.PrismaPromise<GetOrderRequestAggregateType<T>>

    /**
     * Group by OrderRequest.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestGroupByArgs} args - Group by arguments.
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
      T extends OrderRequestGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderRequestGroupByArgs['orderBy'] }
        : { orderBy?: OrderRequestGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrderRequestGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderRequestGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrderRequest model
   */
  readonly fields: OrderRequestFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrderRequest.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderRequestClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    transaction<T extends OrderRequest$transactionArgs<ExtArgs> = {}>(args?: Subset<T, OrderRequest$transactionArgs<ExtArgs>>): Prisma__TransactionClient<$Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    items<T extends OrderRequest$itemsArgs<ExtArgs> = {}>(args?: Subset<T, OrderRequest$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    statusHistory<T extends OrderRequest$statusHistoryArgs<ExtArgs> = {}>(args?: Subset<T, OrderRequest$statusHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
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
   * Fields of the OrderRequest model
   */
  interface OrderRequestFieldRefs {
    readonly id: FieldRef<"OrderRequest", 'Int'>
    readonly code: FieldRef<"OrderRequest", 'String'>
    readonly customerName: FieldRef<"OrderRequest", 'String'>
    readonly phone: FieldRef<"OrderRequest", 'String'>
    readonly status: FieldRef<"OrderRequest", 'String'>
    readonly rejectionReason: FieldRef<"OrderRequest", 'String'>
    readonly totalPrice: FieldRef<"OrderRequest", 'Int'>
    readonly transactionId: FieldRef<"OrderRequest", 'Int'>
    readonly createdAt: FieldRef<"OrderRequest", 'DateTime'>
    readonly updatedAt: FieldRef<"OrderRequest", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrderRequest findUnique
   */
  export type OrderRequestFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequest to fetch.
     */
    where: OrderRequestWhereUniqueInput
  }

  /**
   * OrderRequest findUniqueOrThrow
   */
  export type OrderRequestFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequest to fetch.
     */
    where: OrderRequestWhereUniqueInput
  }

  /**
   * OrderRequest findFirst
   */
  export type OrderRequestFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequest to fetch.
     */
    where?: OrderRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderRequests to fetch.
     */
    orderBy?: OrderRequestOrderByWithRelationInput | OrderRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderRequests.
     */
    cursor?: OrderRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderRequests.
     */
    distinct?: OrderRequestScalarFieldEnum | OrderRequestScalarFieldEnum[]
  }

  /**
   * OrderRequest findFirstOrThrow
   */
  export type OrderRequestFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequest to fetch.
     */
    where?: OrderRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderRequests to fetch.
     */
    orderBy?: OrderRequestOrderByWithRelationInput | OrderRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderRequests.
     */
    cursor?: OrderRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderRequests.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderRequests.
     */
    distinct?: OrderRequestScalarFieldEnum | OrderRequestScalarFieldEnum[]
  }

  /**
   * OrderRequest findMany
   */
  export type OrderRequestFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequests to fetch.
     */
    where?: OrderRequestWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderRequests to fetch.
     */
    orderBy?: OrderRequestOrderByWithRelationInput | OrderRequestOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrderRequests.
     */
    cursor?: OrderRequestWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderRequests from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderRequests.
     */
    skip?: number
    distinct?: OrderRequestScalarFieldEnum | OrderRequestScalarFieldEnum[]
  }

  /**
   * OrderRequest create
   */
  export type OrderRequestCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    /**
     * The data needed to create a OrderRequest.
     */
    data: XOR<OrderRequestCreateInput, OrderRequestUncheckedCreateInput>
  }

  /**
   * OrderRequest createMany
   */
  export type OrderRequestCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrderRequests.
     */
    data: OrderRequestCreateManyInput | OrderRequestCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrderRequest createManyAndReturn
   */
  export type OrderRequestCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * The data used to create many OrderRequests.
     */
    data: OrderRequestCreateManyInput | OrderRequestCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderRequest update
   */
  export type OrderRequestUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    /**
     * The data needed to update a OrderRequest.
     */
    data: XOR<OrderRequestUpdateInput, OrderRequestUncheckedUpdateInput>
    /**
     * Choose, which OrderRequest to update.
     */
    where: OrderRequestWhereUniqueInput
  }

  /**
   * OrderRequest updateMany
   */
  export type OrderRequestUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrderRequests.
     */
    data: XOR<OrderRequestUpdateManyMutationInput, OrderRequestUncheckedUpdateManyInput>
    /**
     * Filter which OrderRequests to update
     */
    where?: OrderRequestWhereInput
    /**
     * Limit how many OrderRequests to update.
     */
    limit?: number
  }

  /**
   * OrderRequest updateManyAndReturn
   */
  export type OrderRequestUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * The data used to update OrderRequests.
     */
    data: XOR<OrderRequestUpdateManyMutationInput, OrderRequestUncheckedUpdateManyInput>
    /**
     * Filter which OrderRequests to update
     */
    where?: OrderRequestWhereInput
    /**
     * Limit how many OrderRequests to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderRequest upsert
   */
  export type OrderRequestUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    /**
     * The filter to search for the OrderRequest to update in case it exists.
     */
    where: OrderRequestWhereUniqueInput
    /**
     * In case the OrderRequest found by the `where` argument doesn't exist, create a new OrderRequest with this data.
     */
    create: XOR<OrderRequestCreateInput, OrderRequestUncheckedCreateInput>
    /**
     * In case the OrderRequest was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderRequestUpdateInput, OrderRequestUncheckedUpdateInput>
  }

  /**
   * OrderRequest delete
   */
  export type OrderRequestDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
    /**
     * Filter which OrderRequest to delete.
     */
    where: OrderRequestWhereUniqueInput
  }

  /**
   * OrderRequest deleteMany
   */
  export type OrderRequestDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderRequests to delete
     */
    where?: OrderRequestWhereInput
    /**
     * Limit how many OrderRequests to delete.
     */
    limit?: number
  }

  /**
   * OrderRequest.transaction
   */
  export type OrderRequest$transactionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Transaction
     */
    select?: TransactionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Transaction
     */
    omit?: TransactionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: TransactionInclude<ExtArgs> | null
    where?: TransactionWhereInput
  }

  /**
   * OrderRequest.items
   */
  export type OrderRequest$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    where?: OrderRequestItemWhereInput
    orderBy?: OrderRequestItemOrderByWithRelationInput | OrderRequestItemOrderByWithRelationInput[]
    cursor?: OrderRequestItemWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderRequestItemScalarFieldEnum | OrderRequestItemScalarFieldEnum[]
  }

  /**
   * OrderRequest.statusHistory
   */
  export type OrderRequest$statusHistoryArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    where?: OrderStatusHistoryWhereInput
    orderBy?: OrderStatusHistoryOrderByWithRelationInput | OrderStatusHistoryOrderByWithRelationInput[]
    cursor?: OrderStatusHistoryWhereUniqueInput
    take?: number
    skip?: number
    distinct?: OrderStatusHistoryScalarFieldEnum | OrderStatusHistoryScalarFieldEnum[]
  }

  /**
   * OrderRequest without action
   */
  export type OrderRequestDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequest
     */
    select?: OrderRequestSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequest
     */
    omit?: OrderRequestOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestInclude<ExtArgs> | null
  }


  /**
   * Model OrderStatusHistory
   */

  export type AggregateOrderStatusHistory = {
    _count: OrderStatusHistoryCountAggregateOutputType | null
    _avg: OrderStatusHistoryAvgAggregateOutputType | null
    _sum: OrderStatusHistorySumAggregateOutputType | null
    _min: OrderStatusHistoryMinAggregateOutputType | null
    _max: OrderStatusHistoryMaxAggregateOutputType | null
  }

  export type OrderStatusHistoryAvgAggregateOutputType = {
    id: number | null
    orderRequestId: number | null
  }

  export type OrderStatusHistorySumAggregateOutputType = {
    id: number | null
    orderRequestId: number | null
  }

  export type OrderStatusHistoryMinAggregateOutputType = {
    id: number | null
    orderRequestId: number | null
    status: string | null
    description: string | null
    createdAt: Date | null
  }

  export type OrderStatusHistoryMaxAggregateOutputType = {
    id: number | null
    orderRequestId: number | null
    status: string | null
    description: string | null
    createdAt: Date | null
  }

  export type OrderStatusHistoryCountAggregateOutputType = {
    id: number
    orderRequestId: number
    status: number
    description: number
    createdAt: number
    _all: number
  }


  export type OrderStatusHistoryAvgAggregateInputType = {
    id?: true
    orderRequestId?: true
  }

  export type OrderStatusHistorySumAggregateInputType = {
    id?: true
    orderRequestId?: true
  }

  export type OrderStatusHistoryMinAggregateInputType = {
    id?: true
    orderRequestId?: true
    status?: true
    description?: true
    createdAt?: true
  }

  export type OrderStatusHistoryMaxAggregateInputType = {
    id?: true
    orderRequestId?: true
    status?: true
    description?: true
    createdAt?: true
  }

  export type OrderStatusHistoryCountAggregateInputType = {
    id?: true
    orderRequestId?: true
    status?: true
    description?: true
    createdAt?: true
    _all?: true
  }

  export type OrderStatusHistoryAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderStatusHistory to aggregate.
     */
    where?: OrderStatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderStatusHistories to fetch.
     */
    orderBy?: OrderStatusHistoryOrderByWithRelationInput | OrderStatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderStatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderStatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderStatusHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrderStatusHistories
    **/
    _count?: true | OrderStatusHistoryCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderStatusHistoryAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderStatusHistorySumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderStatusHistoryMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderStatusHistoryMaxAggregateInputType
  }

  export type GetOrderStatusHistoryAggregateType<T extends OrderStatusHistoryAggregateArgs> = {
        [P in keyof T & keyof AggregateOrderStatusHistory]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrderStatusHistory[P]>
      : GetScalarType<T[P], AggregateOrderStatusHistory[P]>
  }




  export type OrderStatusHistoryGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderStatusHistoryWhereInput
    orderBy?: OrderStatusHistoryOrderByWithAggregationInput | OrderStatusHistoryOrderByWithAggregationInput[]
    by: OrderStatusHistoryScalarFieldEnum[] | OrderStatusHistoryScalarFieldEnum
    having?: OrderStatusHistoryScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderStatusHistoryCountAggregateInputType | true
    _avg?: OrderStatusHistoryAvgAggregateInputType
    _sum?: OrderStatusHistorySumAggregateInputType
    _min?: OrderStatusHistoryMinAggregateInputType
    _max?: OrderStatusHistoryMaxAggregateInputType
  }

  export type OrderStatusHistoryGroupByOutputType = {
    id: number
    orderRequestId: number
    status: string
    description: string | null
    createdAt: Date
    _count: OrderStatusHistoryCountAggregateOutputType | null
    _avg: OrderStatusHistoryAvgAggregateOutputType | null
    _sum: OrderStatusHistorySumAggregateOutputType | null
    _min: OrderStatusHistoryMinAggregateOutputType | null
    _max: OrderStatusHistoryMaxAggregateOutputType | null
  }

  type GetOrderStatusHistoryGroupByPayload<T extends OrderStatusHistoryGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderStatusHistoryGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderStatusHistoryGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderStatusHistoryGroupByOutputType[P]>
            : GetScalarType<T[P], OrderStatusHistoryGroupByOutputType[P]>
        }
      >
    >


  export type OrderStatusHistorySelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderRequestId?: boolean
    status?: boolean
    description?: boolean
    createdAt?: boolean
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderStatusHistory"]>

  export type OrderStatusHistorySelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderRequestId?: boolean
    status?: boolean
    description?: boolean
    createdAt?: boolean
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderStatusHistory"]>

  export type OrderStatusHistorySelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderRequestId?: boolean
    status?: boolean
    description?: boolean
    createdAt?: boolean
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderStatusHistory"]>

  export type OrderStatusHistorySelectScalar = {
    id?: boolean
    orderRequestId?: boolean
    status?: boolean
    description?: boolean
    createdAt?: boolean
  }

  export type OrderStatusHistoryOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderRequestId" | "status" | "description" | "createdAt", ExtArgs["result"]["orderStatusHistory"]>
  export type OrderStatusHistoryInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
  }
  export type OrderStatusHistoryIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
  }
  export type OrderStatusHistoryIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
  }

  export type $OrderStatusHistoryPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrderStatusHistory"
    objects: {
      orderRequest: Prisma.$OrderRequestPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      orderRequestId: number
      status: string
      description: string | null
      createdAt: Date
    }, ExtArgs["result"]["orderStatusHistory"]>
    composites: {}
  }

  type OrderStatusHistoryGetPayload<S extends boolean | null | undefined | OrderStatusHistoryDefaultArgs> = $Result.GetResult<Prisma.$OrderStatusHistoryPayload, S>

  type OrderStatusHistoryCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderStatusHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderStatusHistoryCountAggregateInputType | true
    }

  export interface OrderStatusHistoryDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrderStatusHistory'], meta: { name: 'OrderStatusHistory' } }
    /**
     * Find zero or one OrderStatusHistory that matches the filter.
     * @param {OrderStatusHistoryFindUniqueArgs} args - Arguments to find a OrderStatusHistory
     * @example
     * // Get one OrderStatusHistory
     * const orderStatusHistory = await prisma.orderStatusHistory.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderStatusHistoryFindUniqueArgs>(args: SelectSubset<T, OrderStatusHistoryFindUniqueArgs<ExtArgs>>): Prisma__OrderStatusHistoryClient<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrderStatusHistory that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderStatusHistoryFindUniqueOrThrowArgs} args - Arguments to find a OrderStatusHistory
     * @example
     * // Get one OrderStatusHistory
     * const orderStatusHistory = await prisma.orderStatusHistory.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderStatusHistoryFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderStatusHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderStatusHistoryClient<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderStatusHistory that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderStatusHistoryFindFirstArgs} args - Arguments to find a OrderStatusHistory
     * @example
     * // Get one OrderStatusHistory
     * const orderStatusHistory = await prisma.orderStatusHistory.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderStatusHistoryFindFirstArgs>(args?: SelectSubset<T, OrderStatusHistoryFindFirstArgs<ExtArgs>>): Prisma__OrderStatusHistoryClient<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderStatusHistory that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderStatusHistoryFindFirstOrThrowArgs} args - Arguments to find a OrderStatusHistory
     * @example
     * // Get one OrderStatusHistory
     * const orderStatusHistory = await prisma.orderStatusHistory.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderStatusHistoryFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderStatusHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderStatusHistoryClient<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrderStatusHistories that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderStatusHistoryFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrderStatusHistories
     * const orderStatusHistories = await prisma.orderStatusHistory.findMany()
     * 
     * // Get first 10 OrderStatusHistories
     * const orderStatusHistories = await prisma.orderStatusHistory.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderStatusHistoryWithIdOnly = await prisma.orderStatusHistory.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderStatusHistoryFindManyArgs>(args?: SelectSubset<T, OrderStatusHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrderStatusHistory.
     * @param {OrderStatusHistoryCreateArgs} args - Arguments to create a OrderStatusHistory.
     * @example
     * // Create one OrderStatusHistory
     * const OrderStatusHistory = await prisma.orderStatusHistory.create({
     *   data: {
     *     // ... data to create a OrderStatusHistory
     *   }
     * })
     * 
     */
    create<T extends OrderStatusHistoryCreateArgs>(args: SelectSubset<T, OrderStatusHistoryCreateArgs<ExtArgs>>): Prisma__OrderStatusHistoryClient<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrderStatusHistories.
     * @param {OrderStatusHistoryCreateManyArgs} args - Arguments to create many OrderStatusHistories.
     * @example
     * // Create many OrderStatusHistories
     * const orderStatusHistory = await prisma.orderStatusHistory.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderStatusHistoryCreateManyArgs>(args?: SelectSubset<T, OrderStatusHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrderStatusHistories and returns the data saved in the database.
     * @param {OrderStatusHistoryCreateManyAndReturnArgs} args - Arguments to create many OrderStatusHistories.
     * @example
     * // Create many OrderStatusHistories
     * const orderStatusHistory = await prisma.orderStatusHistory.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrderStatusHistories and only return the `id`
     * const orderStatusHistoryWithIdOnly = await prisma.orderStatusHistory.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderStatusHistoryCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderStatusHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrderStatusHistory.
     * @param {OrderStatusHistoryDeleteArgs} args - Arguments to delete one OrderStatusHistory.
     * @example
     * // Delete one OrderStatusHistory
     * const OrderStatusHistory = await prisma.orderStatusHistory.delete({
     *   where: {
     *     // ... filter to delete one OrderStatusHistory
     *   }
     * })
     * 
     */
    delete<T extends OrderStatusHistoryDeleteArgs>(args: SelectSubset<T, OrderStatusHistoryDeleteArgs<ExtArgs>>): Prisma__OrderStatusHistoryClient<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrderStatusHistory.
     * @param {OrderStatusHistoryUpdateArgs} args - Arguments to update one OrderStatusHistory.
     * @example
     * // Update one OrderStatusHistory
     * const orderStatusHistory = await prisma.orderStatusHistory.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderStatusHistoryUpdateArgs>(args: SelectSubset<T, OrderStatusHistoryUpdateArgs<ExtArgs>>): Prisma__OrderStatusHistoryClient<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrderStatusHistories.
     * @param {OrderStatusHistoryDeleteManyArgs} args - Arguments to filter OrderStatusHistories to delete.
     * @example
     * // Delete a few OrderStatusHistories
     * const { count } = await prisma.orderStatusHistory.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderStatusHistoryDeleteManyArgs>(args?: SelectSubset<T, OrderStatusHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderStatusHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderStatusHistoryUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrderStatusHistories
     * const orderStatusHistory = await prisma.orderStatusHistory.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderStatusHistoryUpdateManyArgs>(args: SelectSubset<T, OrderStatusHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderStatusHistories and returns the data updated in the database.
     * @param {OrderStatusHistoryUpdateManyAndReturnArgs} args - Arguments to update many OrderStatusHistories.
     * @example
     * // Update many OrderStatusHistories
     * const orderStatusHistory = await prisma.orderStatusHistory.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrderStatusHistories and only return the `id`
     * const orderStatusHistoryWithIdOnly = await prisma.orderStatusHistory.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrderStatusHistoryUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderStatusHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrderStatusHistory.
     * @param {OrderStatusHistoryUpsertArgs} args - Arguments to update or create a OrderStatusHistory.
     * @example
     * // Update or create a OrderStatusHistory
     * const orderStatusHistory = await prisma.orderStatusHistory.upsert({
     *   create: {
     *     // ... data to create a OrderStatusHistory
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrderStatusHistory we want to update
     *   }
     * })
     */
    upsert<T extends OrderStatusHistoryUpsertArgs>(args: SelectSubset<T, OrderStatusHistoryUpsertArgs<ExtArgs>>): Prisma__OrderStatusHistoryClient<$Result.GetResult<Prisma.$OrderStatusHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrderStatusHistories.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderStatusHistoryCountArgs} args - Arguments to filter OrderStatusHistories to count.
     * @example
     * // Count the number of OrderStatusHistories
     * const count = await prisma.orderStatusHistory.count({
     *   where: {
     *     // ... the filter for the OrderStatusHistories we want to count
     *   }
     * })
    **/
    count<T extends OrderStatusHistoryCountArgs>(
      args?: Subset<T, OrderStatusHistoryCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderStatusHistoryCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrderStatusHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderStatusHistoryAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrderStatusHistoryAggregateArgs>(args: Subset<T, OrderStatusHistoryAggregateArgs>): Prisma.PrismaPromise<GetOrderStatusHistoryAggregateType<T>>

    /**
     * Group by OrderStatusHistory.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderStatusHistoryGroupByArgs} args - Group by arguments.
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
      T extends OrderStatusHistoryGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderStatusHistoryGroupByArgs['orderBy'] }
        : { orderBy?: OrderStatusHistoryGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrderStatusHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderStatusHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrderStatusHistory model
   */
  readonly fields: OrderStatusHistoryFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrderStatusHistory.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderStatusHistoryClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderRequest<T extends OrderRequestDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderRequestDefaultArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the OrderStatusHistory model
   */
  interface OrderStatusHistoryFieldRefs {
    readonly id: FieldRef<"OrderStatusHistory", 'Int'>
    readonly orderRequestId: FieldRef<"OrderStatusHistory", 'Int'>
    readonly status: FieldRef<"OrderStatusHistory", 'String'>
    readonly description: FieldRef<"OrderStatusHistory", 'String'>
    readonly createdAt: FieldRef<"OrderStatusHistory", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * OrderStatusHistory findUnique
   */
  export type OrderStatusHistoryFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which OrderStatusHistory to fetch.
     */
    where: OrderStatusHistoryWhereUniqueInput
  }

  /**
   * OrderStatusHistory findUniqueOrThrow
   */
  export type OrderStatusHistoryFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which OrderStatusHistory to fetch.
     */
    where: OrderStatusHistoryWhereUniqueInput
  }

  /**
   * OrderStatusHistory findFirst
   */
  export type OrderStatusHistoryFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which OrderStatusHistory to fetch.
     */
    where?: OrderStatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderStatusHistories to fetch.
     */
    orderBy?: OrderStatusHistoryOrderByWithRelationInput | OrderStatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderStatusHistories.
     */
    cursor?: OrderStatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderStatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderStatusHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderStatusHistories.
     */
    distinct?: OrderStatusHistoryScalarFieldEnum | OrderStatusHistoryScalarFieldEnum[]
  }

  /**
   * OrderStatusHistory findFirstOrThrow
   */
  export type OrderStatusHistoryFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which OrderStatusHistory to fetch.
     */
    where?: OrderStatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderStatusHistories to fetch.
     */
    orderBy?: OrderStatusHistoryOrderByWithRelationInput | OrderStatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderStatusHistories.
     */
    cursor?: OrderStatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderStatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderStatusHistories.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderStatusHistories.
     */
    distinct?: OrderStatusHistoryScalarFieldEnum | OrderStatusHistoryScalarFieldEnum[]
  }

  /**
   * OrderStatusHistory findMany
   */
  export type OrderStatusHistoryFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter, which OrderStatusHistories to fetch.
     */
    where?: OrderStatusHistoryWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderStatusHistories to fetch.
     */
    orderBy?: OrderStatusHistoryOrderByWithRelationInput | OrderStatusHistoryOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrderStatusHistories.
     */
    cursor?: OrderStatusHistoryWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderStatusHistories from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderStatusHistories.
     */
    skip?: number
    distinct?: OrderStatusHistoryScalarFieldEnum | OrderStatusHistoryScalarFieldEnum[]
  }

  /**
   * OrderStatusHistory create
   */
  export type OrderStatusHistoryCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    /**
     * The data needed to create a OrderStatusHistory.
     */
    data: XOR<OrderStatusHistoryCreateInput, OrderStatusHistoryUncheckedCreateInput>
  }

  /**
   * OrderStatusHistory createMany
   */
  export type OrderStatusHistoryCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrderStatusHistories.
     */
    data: OrderStatusHistoryCreateManyInput | OrderStatusHistoryCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrderStatusHistory createManyAndReturn
   */
  export type OrderStatusHistoryCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * The data used to create many OrderStatusHistories.
     */
    data: OrderStatusHistoryCreateManyInput | OrderStatusHistoryCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderStatusHistory update
   */
  export type OrderStatusHistoryUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    /**
     * The data needed to update a OrderStatusHistory.
     */
    data: XOR<OrderStatusHistoryUpdateInput, OrderStatusHistoryUncheckedUpdateInput>
    /**
     * Choose, which OrderStatusHistory to update.
     */
    where: OrderStatusHistoryWhereUniqueInput
  }

  /**
   * OrderStatusHistory updateMany
   */
  export type OrderStatusHistoryUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrderStatusHistories.
     */
    data: XOR<OrderStatusHistoryUpdateManyMutationInput, OrderStatusHistoryUncheckedUpdateManyInput>
    /**
     * Filter which OrderStatusHistories to update
     */
    where?: OrderStatusHistoryWhereInput
    /**
     * Limit how many OrderStatusHistories to update.
     */
    limit?: number
  }

  /**
   * OrderStatusHistory updateManyAndReturn
   */
  export type OrderStatusHistoryUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * The data used to update OrderStatusHistories.
     */
    data: XOR<OrderStatusHistoryUpdateManyMutationInput, OrderStatusHistoryUncheckedUpdateManyInput>
    /**
     * Filter which OrderStatusHistories to update
     */
    where?: OrderStatusHistoryWhereInput
    /**
     * Limit how many OrderStatusHistories to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderStatusHistory upsert
   */
  export type OrderStatusHistoryUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    /**
     * The filter to search for the OrderStatusHistory to update in case it exists.
     */
    where: OrderStatusHistoryWhereUniqueInput
    /**
     * In case the OrderStatusHistory found by the `where` argument doesn't exist, create a new OrderStatusHistory with this data.
     */
    create: XOR<OrderStatusHistoryCreateInput, OrderStatusHistoryUncheckedCreateInput>
    /**
     * In case the OrderStatusHistory was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderStatusHistoryUpdateInput, OrderStatusHistoryUncheckedUpdateInput>
  }

  /**
   * OrderStatusHistory delete
   */
  export type OrderStatusHistoryDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
    /**
     * Filter which OrderStatusHistory to delete.
     */
    where: OrderStatusHistoryWhereUniqueInput
  }

  /**
   * OrderStatusHistory deleteMany
   */
  export type OrderStatusHistoryDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderStatusHistories to delete
     */
    where?: OrderStatusHistoryWhereInput
    /**
     * Limit how many OrderStatusHistories to delete.
     */
    limit?: number
  }

  /**
   * OrderStatusHistory without action
   */
  export type OrderStatusHistoryDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderStatusHistory
     */
    select?: OrderStatusHistorySelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderStatusHistory
     */
    omit?: OrderStatusHistoryOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderStatusHistoryInclude<ExtArgs> | null
  }


  /**
   * Model OrderRequestItem
   */

  export type AggregateOrderRequestItem = {
    _count: OrderRequestItemCountAggregateOutputType | null
    _avg: OrderRequestItemAvgAggregateOutputType | null
    _sum: OrderRequestItemSumAggregateOutputType | null
    _min: OrderRequestItemMinAggregateOutputType | null
    _max: OrderRequestItemMaxAggregateOutputType | null
  }

  export type OrderRequestItemAvgAggregateOutputType = {
    id: number | null
    orderRequestId: number | null
    productId: number | null
    quantity: number | null
    unitPrice: number | null
    subtotal: number | null
  }

  export type OrderRequestItemSumAggregateOutputType = {
    id: number | null
    orderRequestId: number | null
    productId: number | null
    quantity: number | null
    unitPrice: number | null
    subtotal: number | null
  }

  export type OrderRequestItemMinAggregateOutputType = {
    id: number | null
    orderRequestId: number | null
    productId: number | null
    productName: string | null
    quantity: number | null
    unitPrice: number | null
    subtotal: number | null
  }

  export type OrderRequestItemMaxAggregateOutputType = {
    id: number | null
    orderRequestId: number | null
    productId: number | null
    productName: string | null
    quantity: number | null
    unitPrice: number | null
    subtotal: number | null
  }

  export type OrderRequestItemCountAggregateOutputType = {
    id: number
    orderRequestId: number
    productId: number
    productName: number
    quantity: number
    unitPrice: number
    subtotal: number
    _all: number
  }


  export type OrderRequestItemAvgAggregateInputType = {
    id?: true
    orderRequestId?: true
    productId?: true
    quantity?: true
    unitPrice?: true
    subtotal?: true
  }

  export type OrderRequestItemSumAggregateInputType = {
    id?: true
    orderRequestId?: true
    productId?: true
    quantity?: true
    unitPrice?: true
    subtotal?: true
  }

  export type OrderRequestItemMinAggregateInputType = {
    id?: true
    orderRequestId?: true
    productId?: true
    productName?: true
    quantity?: true
    unitPrice?: true
    subtotal?: true
  }

  export type OrderRequestItemMaxAggregateInputType = {
    id?: true
    orderRequestId?: true
    productId?: true
    productName?: true
    quantity?: true
    unitPrice?: true
    subtotal?: true
  }

  export type OrderRequestItemCountAggregateInputType = {
    id?: true
    orderRequestId?: true
    productId?: true
    productName?: true
    quantity?: true
    unitPrice?: true
    subtotal?: true
    _all?: true
  }

  export type OrderRequestItemAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderRequestItem to aggregate.
     */
    where?: OrderRequestItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderRequestItems to fetch.
     */
    orderBy?: OrderRequestItemOrderByWithRelationInput | OrderRequestItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: OrderRequestItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderRequestItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderRequestItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned OrderRequestItems
    **/
    _count?: true | OrderRequestItemCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: OrderRequestItemAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: OrderRequestItemSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: OrderRequestItemMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: OrderRequestItemMaxAggregateInputType
  }

  export type GetOrderRequestItemAggregateType<T extends OrderRequestItemAggregateArgs> = {
        [P in keyof T & keyof AggregateOrderRequestItem]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateOrderRequestItem[P]>
      : GetScalarType<T[P], AggregateOrderRequestItem[P]>
  }




  export type OrderRequestItemGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: OrderRequestItemWhereInput
    orderBy?: OrderRequestItemOrderByWithAggregationInput | OrderRequestItemOrderByWithAggregationInput[]
    by: OrderRequestItemScalarFieldEnum[] | OrderRequestItemScalarFieldEnum
    having?: OrderRequestItemScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: OrderRequestItemCountAggregateInputType | true
    _avg?: OrderRequestItemAvgAggregateInputType
    _sum?: OrderRequestItemSumAggregateInputType
    _min?: OrderRequestItemMinAggregateInputType
    _max?: OrderRequestItemMaxAggregateInputType
  }

  export type OrderRequestItemGroupByOutputType = {
    id: number
    orderRequestId: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    _count: OrderRequestItemCountAggregateOutputType | null
    _avg: OrderRequestItemAvgAggregateOutputType | null
    _sum: OrderRequestItemSumAggregateOutputType | null
    _min: OrderRequestItemMinAggregateOutputType | null
    _max: OrderRequestItemMaxAggregateOutputType | null
  }

  type GetOrderRequestItemGroupByPayload<T extends OrderRequestItemGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<OrderRequestItemGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof OrderRequestItemGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], OrderRequestItemGroupByOutputType[P]>
            : GetScalarType<T[P], OrderRequestItemGroupByOutputType[P]>
        }
      >
    >


  export type OrderRequestItemSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderRequestId?: boolean
    productId?: boolean
    productName?: boolean
    quantity?: boolean
    unitPrice?: boolean
    subtotal?: boolean
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderRequestItem"]>

  export type OrderRequestItemSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderRequestId?: boolean
    productId?: boolean
    productName?: boolean
    quantity?: boolean
    unitPrice?: boolean
    subtotal?: boolean
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderRequestItem"]>

  export type OrderRequestItemSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    orderRequestId?: boolean
    productId?: boolean
    productName?: boolean
    quantity?: boolean
    unitPrice?: boolean
    subtotal?: boolean
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["orderRequestItem"]>

  export type OrderRequestItemSelectScalar = {
    id?: boolean
    orderRequestId?: boolean
    productId?: boolean
    productName?: boolean
    quantity?: boolean
    unitPrice?: boolean
    subtotal?: boolean
  }

  export type OrderRequestItemOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "orderRequestId" | "productId" | "productName" | "quantity" | "unitPrice" | "subtotal", ExtArgs["result"]["orderRequestItem"]>
  export type OrderRequestItemInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type OrderRequestItemIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }
  export type OrderRequestItemIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    orderRequest?: boolean | OrderRequestDefaultArgs<ExtArgs>
    product?: boolean | ProductDefaultArgs<ExtArgs>
  }

  export type $OrderRequestItemPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "OrderRequestItem"
    objects: {
      orderRequest: Prisma.$OrderRequestPayload<ExtArgs>
      product: Prisma.$ProductPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      orderRequestId: number
      productId: number
      productName: string
      quantity: number
      unitPrice: number
      subtotal: number
    }, ExtArgs["result"]["orderRequestItem"]>
    composites: {}
  }

  type OrderRequestItemGetPayload<S extends boolean | null | undefined | OrderRequestItemDefaultArgs> = $Result.GetResult<Prisma.$OrderRequestItemPayload, S>

  type OrderRequestItemCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<OrderRequestItemFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: OrderRequestItemCountAggregateInputType | true
    }

  export interface OrderRequestItemDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['OrderRequestItem'], meta: { name: 'OrderRequestItem' } }
    /**
     * Find zero or one OrderRequestItem that matches the filter.
     * @param {OrderRequestItemFindUniqueArgs} args - Arguments to find a OrderRequestItem
     * @example
     * // Get one OrderRequestItem
     * const orderRequestItem = await prisma.orderRequestItem.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends OrderRequestItemFindUniqueArgs>(args: SelectSubset<T, OrderRequestItemFindUniqueArgs<ExtArgs>>): Prisma__OrderRequestItemClient<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one OrderRequestItem that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {OrderRequestItemFindUniqueOrThrowArgs} args - Arguments to find a OrderRequestItem
     * @example
     * // Get one OrderRequestItem
     * const orderRequestItem = await prisma.orderRequestItem.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends OrderRequestItemFindUniqueOrThrowArgs>(args: SelectSubset<T, OrderRequestItemFindUniqueOrThrowArgs<ExtArgs>>): Prisma__OrderRequestItemClient<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderRequestItem that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestItemFindFirstArgs} args - Arguments to find a OrderRequestItem
     * @example
     * // Get one OrderRequestItem
     * const orderRequestItem = await prisma.orderRequestItem.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends OrderRequestItemFindFirstArgs>(args?: SelectSubset<T, OrderRequestItemFindFirstArgs<ExtArgs>>): Prisma__OrderRequestItemClient<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first OrderRequestItem that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestItemFindFirstOrThrowArgs} args - Arguments to find a OrderRequestItem
     * @example
     * // Get one OrderRequestItem
     * const orderRequestItem = await prisma.orderRequestItem.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends OrderRequestItemFindFirstOrThrowArgs>(args?: SelectSubset<T, OrderRequestItemFindFirstOrThrowArgs<ExtArgs>>): Prisma__OrderRequestItemClient<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more OrderRequestItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestItemFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all OrderRequestItems
     * const orderRequestItems = await prisma.orderRequestItem.findMany()
     * 
     * // Get first 10 OrderRequestItems
     * const orderRequestItems = await prisma.orderRequestItem.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const orderRequestItemWithIdOnly = await prisma.orderRequestItem.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends OrderRequestItemFindManyArgs>(args?: SelectSubset<T, OrderRequestItemFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a OrderRequestItem.
     * @param {OrderRequestItemCreateArgs} args - Arguments to create a OrderRequestItem.
     * @example
     * // Create one OrderRequestItem
     * const OrderRequestItem = await prisma.orderRequestItem.create({
     *   data: {
     *     // ... data to create a OrderRequestItem
     *   }
     * })
     * 
     */
    create<T extends OrderRequestItemCreateArgs>(args: SelectSubset<T, OrderRequestItemCreateArgs<ExtArgs>>): Prisma__OrderRequestItemClient<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many OrderRequestItems.
     * @param {OrderRequestItemCreateManyArgs} args - Arguments to create many OrderRequestItems.
     * @example
     * // Create many OrderRequestItems
     * const orderRequestItem = await prisma.orderRequestItem.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends OrderRequestItemCreateManyArgs>(args?: SelectSubset<T, OrderRequestItemCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many OrderRequestItems and returns the data saved in the database.
     * @param {OrderRequestItemCreateManyAndReturnArgs} args - Arguments to create many OrderRequestItems.
     * @example
     * // Create many OrderRequestItems
     * const orderRequestItem = await prisma.orderRequestItem.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many OrderRequestItems and only return the `id`
     * const orderRequestItemWithIdOnly = await prisma.orderRequestItem.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends OrderRequestItemCreateManyAndReturnArgs>(args?: SelectSubset<T, OrderRequestItemCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a OrderRequestItem.
     * @param {OrderRequestItemDeleteArgs} args - Arguments to delete one OrderRequestItem.
     * @example
     * // Delete one OrderRequestItem
     * const OrderRequestItem = await prisma.orderRequestItem.delete({
     *   where: {
     *     // ... filter to delete one OrderRequestItem
     *   }
     * })
     * 
     */
    delete<T extends OrderRequestItemDeleteArgs>(args: SelectSubset<T, OrderRequestItemDeleteArgs<ExtArgs>>): Prisma__OrderRequestItemClient<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one OrderRequestItem.
     * @param {OrderRequestItemUpdateArgs} args - Arguments to update one OrderRequestItem.
     * @example
     * // Update one OrderRequestItem
     * const orderRequestItem = await prisma.orderRequestItem.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends OrderRequestItemUpdateArgs>(args: SelectSubset<T, OrderRequestItemUpdateArgs<ExtArgs>>): Prisma__OrderRequestItemClient<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more OrderRequestItems.
     * @param {OrderRequestItemDeleteManyArgs} args - Arguments to filter OrderRequestItems to delete.
     * @example
     * // Delete a few OrderRequestItems
     * const { count } = await prisma.orderRequestItem.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends OrderRequestItemDeleteManyArgs>(args?: SelectSubset<T, OrderRequestItemDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderRequestItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestItemUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many OrderRequestItems
     * const orderRequestItem = await prisma.orderRequestItem.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends OrderRequestItemUpdateManyArgs>(args: SelectSubset<T, OrderRequestItemUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more OrderRequestItems and returns the data updated in the database.
     * @param {OrderRequestItemUpdateManyAndReturnArgs} args - Arguments to update many OrderRequestItems.
     * @example
     * // Update many OrderRequestItems
     * const orderRequestItem = await prisma.orderRequestItem.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more OrderRequestItems and only return the `id`
     * const orderRequestItemWithIdOnly = await prisma.orderRequestItem.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends OrderRequestItemUpdateManyAndReturnArgs>(args: SelectSubset<T, OrderRequestItemUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one OrderRequestItem.
     * @param {OrderRequestItemUpsertArgs} args - Arguments to update or create a OrderRequestItem.
     * @example
     * // Update or create a OrderRequestItem
     * const orderRequestItem = await prisma.orderRequestItem.upsert({
     *   create: {
     *     // ... data to create a OrderRequestItem
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the OrderRequestItem we want to update
     *   }
     * })
     */
    upsert<T extends OrderRequestItemUpsertArgs>(args: SelectSubset<T, OrderRequestItemUpsertArgs<ExtArgs>>): Prisma__OrderRequestItemClient<$Result.GetResult<Prisma.$OrderRequestItemPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of OrderRequestItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestItemCountArgs} args - Arguments to filter OrderRequestItems to count.
     * @example
     * // Count the number of OrderRequestItems
     * const count = await prisma.orderRequestItem.count({
     *   where: {
     *     // ... the filter for the OrderRequestItems we want to count
     *   }
     * })
    **/
    count<T extends OrderRequestItemCountArgs>(
      args?: Subset<T, OrderRequestItemCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], OrderRequestItemCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a OrderRequestItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestItemAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends OrderRequestItemAggregateArgs>(args: Subset<T, OrderRequestItemAggregateArgs>): Prisma.PrismaPromise<GetOrderRequestItemAggregateType<T>>

    /**
     * Group by OrderRequestItem.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {OrderRequestItemGroupByArgs} args - Group by arguments.
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
      T extends OrderRequestItemGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: OrderRequestItemGroupByArgs['orderBy'] }
        : { orderBy?: OrderRequestItemGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, OrderRequestItemGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetOrderRequestItemGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the OrderRequestItem model
   */
  readonly fields: OrderRequestItemFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for OrderRequestItem.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__OrderRequestItemClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    orderRequest<T extends OrderRequestDefaultArgs<ExtArgs> = {}>(args?: Subset<T, OrderRequestDefaultArgs<ExtArgs>>): Prisma__OrderRequestClient<$Result.GetResult<Prisma.$OrderRequestPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    product<T extends ProductDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProductDefaultArgs<ExtArgs>>): Prisma__ProductClient<$Result.GetResult<Prisma.$ProductPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
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
   * Fields of the OrderRequestItem model
   */
  interface OrderRequestItemFieldRefs {
    readonly id: FieldRef<"OrderRequestItem", 'Int'>
    readonly orderRequestId: FieldRef<"OrderRequestItem", 'Int'>
    readonly productId: FieldRef<"OrderRequestItem", 'Int'>
    readonly productName: FieldRef<"OrderRequestItem", 'String'>
    readonly quantity: FieldRef<"OrderRequestItem", 'Int'>
    readonly unitPrice: FieldRef<"OrderRequestItem", 'Int'>
    readonly subtotal: FieldRef<"OrderRequestItem", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * OrderRequestItem findUnique
   */
  export type OrderRequestItemFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequestItem to fetch.
     */
    where: OrderRequestItemWhereUniqueInput
  }

  /**
   * OrderRequestItem findUniqueOrThrow
   */
  export type OrderRequestItemFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequestItem to fetch.
     */
    where: OrderRequestItemWhereUniqueInput
  }

  /**
   * OrderRequestItem findFirst
   */
  export type OrderRequestItemFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequestItem to fetch.
     */
    where?: OrderRequestItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderRequestItems to fetch.
     */
    orderBy?: OrderRequestItemOrderByWithRelationInput | OrderRequestItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderRequestItems.
     */
    cursor?: OrderRequestItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderRequestItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderRequestItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderRequestItems.
     */
    distinct?: OrderRequestItemScalarFieldEnum | OrderRequestItemScalarFieldEnum[]
  }

  /**
   * OrderRequestItem findFirstOrThrow
   */
  export type OrderRequestItemFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequestItem to fetch.
     */
    where?: OrderRequestItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderRequestItems to fetch.
     */
    orderBy?: OrderRequestItemOrderByWithRelationInput | OrderRequestItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for OrderRequestItems.
     */
    cursor?: OrderRequestItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderRequestItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderRequestItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of OrderRequestItems.
     */
    distinct?: OrderRequestItemScalarFieldEnum | OrderRequestItemScalarFieldEnum[]
  }

  /**
   * OrderRequestItem findMany
   */
  export type OrderRequestItemFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    /**
     * Filter, which OrderRequestItems to fetch.
     */
    where?: OrderRequestItemWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of OrderRequestItems to fetch.
     */
    orderBy?: OrderRequestItemOrderByWithRelationInput | OrderRequestItemOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing OrderRequestItems.
     */
    cursor?: OrderRequestItemWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` OrderRequestItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` OrderRequestItems.
     */
    skip?: number
    distinct?: OrderRequestItemScalarFieldEnum | OrderRequestItemScalarFieldEnum[]
  }

  /**
   * OrderRequestItem create
   */
  export type OrderRequestItemCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    /**
     * The data needed to create a OrderRequestItem.
     */
    data: XOR<OrderRequestItemCreateInput, OrderRequestItemUncheckedCreateInput>
  }

  /**
   * OrderRequestItem createMany
   */
  export type OrderRequestItemCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many OrderRequestItems.
     */
    data: OrderRequestItemCreateManyInput | OrderRequestItemCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * OrderRequestItem createManyAndReturn
   */
  export type OrderRequestItemCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * The data used to create many OrderRequestItems.
     */
    data: OrderRequestItemCreateManyInput | OrderRequestItemCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderRequestItem update
   */
  export type OrderRequestItemUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    /**
     * The data needed to update a OrderRequestItem.
     */
    data: XOR<OrderRequestItemUpdateInput, OrderRequestItemUncheckedUpdateInput>
    /**
     * Choose, which OrderRequestItem to update.
     */
    where: OrderRequestItemWhereUniqueInput
  }

  /**
   * OrderRequestItem updateMany
   */
  export type OrderRequestItemUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update OrderRequestItems.
     */
    data: XOR<OrderRequestItemUpdateManyMutationInput, OrderRequestItemUncheckedUpdateManyInput>
    /**
     * Filter which OrderRequestItems to update
     */
    where?: OrderRequestItemWhereInput
    /**
     * Limit how many OrderRequestItems to update.
     */
    limit?: number
  }

  /**
   * OrderRequestItem updateManyAndReturn
   */
  export type OrderRequestItemUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * The data used to update OrderRequestItems.
     */
    data: XOR<OrderRequestItemUpdateManyMutationInput, OrderRequestItemUncheckedUpdateManyInput>
    /**
     * Filter which OrderRequestItems to update
     */
    where?: OrderRequestItemWhereInput
    /**
     * Limit how many OrderRequestItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * OrderRequestItem upsert
   */
  export type OrderRequestItemUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    /**
     * The filter to search for the OrderRequestItem to update in case it exists.
     */
    where: OrderRequestItemWhereUniqueInput
    /**
     * In case the OrderRequestItem found by the `where` argument doesn't exist, create a new OrderRequestItem with this data.
     */
    create: XOR<OrderRequestItemCreateInput, OrderRequestItemUncheckedCreateInput>
    /**
     * In case the OrderRequestItem was found with the provided `where` argument, update it with this data.
     */
    update: XOR<OrderRequestItemUpdateInput, OrderRequestItemUncheckedUpdateInput>
  }

  /**
   * OrderRequestItem delete
   */
  export type OrderRequestItemDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
    /**
     * Filter which OrderRequestItem to delete.
     */
    where: OrderRequestItemWhereUniqueInput
  }

  /**
   * OrderRequestItem deleteMany
   */
  export type OrderRequestItemDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which OrderRequestItems to delete
     */
    where?: OrderRequestItemWhereInput
    /**
     * Limit how many OrderRequestItems to delete.
     */
    limit?: number
  }

  /**
   * OrderRequestItem without action
   */
  export type OrderRequestItemDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the OrderRequestItem
     */
    select?: OrderRequestItemSelect<ExtArgs> | null
    /**
     * Omit specific fields from the OrderRequestItem
     */
    omit?: OrderRequestItemOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: OrderRequestItemInclude<ExtArgs> | null
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


  export const UserScalarFieldEnum: {
    id: 'id',
    username: 'username',
    fullName: 'fullName',
    profilePhoto: 'profilePhoto',
    password: 'password',
    role: 'role'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const ProductScalarFieldEnum: {
    id: 'id',
    nama_produk: 'nama_produk',
    harga: 'harga',
    satuanHarga: 'satuanHarga',
    stok: 'stok',
    barcode: 'barcode',
    gambar: 'gambar',
    gambarPosX: 'gambarPosX',
    gambarPosY: 'gambarPosY',
    isArchived: 'isArchived'
  };

  export type ProductScalarFieldEnum = (typeof ProductScalarFieldEnum)[keyof typeof ProductScalarFieldEnum]


  export const TransactionScalarFieldEnum: {
    id: 'id',
    tanggal: 'tanggal',
    total_harga: 'total_harga',
    metode_pembayaran: 'metode_pembayaran',
    status: 'status',
    nama_pembeli: 'nama_pembeli',
    nama_kasir: 'nama_kasir',
    status_pengiriman: 'status_pengiriman',
    nama_pengrajin: 'nama_pengrajin'
  };

  export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum]


  export const TransactionItemScalarFieldEnum: {
    id: 'id',
    transactionId: 'transactionId',
    productId: 'productId',
    jumlah: 'jumlah',
    subtotal: 'subtotal'
  };

  export type TransactionItemScalarFieldEnum = (typeof TransactionItemScalarFieldEnum)[keyof typeof TransactionItemScalarFieldEnum]


  export const StoreSettingScalarFieldEnum: {
    id: 'id',
    brand: 'brand',
    address: 'address',
    footer: 'footer',
    logo: 'logo',
    receiptLogo: 'receiptLogo'
  };

  export type StoreSettingScalarFieldEnum = (typeof StoreSettingScalarFieldEnum)[keyof typeof StoreSettingScalarFieldEnum]


  export const NotificationScalarFieldEnum: {
    id: 'id',
    transactionId: 'transactionId',
    targetRole: 'targetRole',
    senderRole: 'senderRole',
    senderName: 'senderName',
    statusPengiriman: 'statusPengiriman',
    message: 'message',
    isRead: 'isRead',
    hidden: 'hidden',
    createdAt: 'createdAt'
  };

  export type NotificationScalarFieldEnum = (typeof NotificationScalarFieldEnum)[keyof typeof NotificationScalarFieldEnum]


  export const ActivityLogScalarFieldEnum: {
    id: 'id',
    action: 'action',
    entity: 'entity',
    entityId: 'entityId',
    title: 'title',
    description: 'description',
    actorId: 'actorId',
    actorName: 'actorName',
    actorRole: 'actorRole',
    metadata: 'metadata',
    createdAt: 'createdAt'
  };

  export type ActivityLogScalarFieldEnum = (typeof ActivityLogScalarFieldEnum)[keyof typeof ActivityLogScalarFieldEnum]


  export const UserCartScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    scope: 'scope',
    customerName: 'customerName',
    paymentMethod: 'paymentMethod',
    sessionActive: 'sessionActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserCartScalarFieldEnum = (typeof UserCartScalarFieldEnum)[keyof typeof UserCartScalarFieldEnum]


  export const UserCartItemScalarFieldEnum: {
    id: 'id',
    cartId: 'cartId',
    productId: 'productId',
    quantity: 'quantity',
    priceOverride: 'priceOverride',
    satuanPesan: 'satuanPesan',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type UserCartItemScalarFieldEnum = (typeof UserCartItemScalarFieldEnum)[keyof typeof UserCartItemScalarFieldEnum]


  export const OrderRequestScalarFieldEnum: {
    id: 'id',
    code: 'code',
    customerName: 'customerName',
    phone: 'phone',
    status: 'status',
    rejectionReason: 'rejectionReason',
    totalPrice: 'totalPrice',
    transactionId: 'transactionId',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type OrderRequestScalarFieldEnum = (typeof OrderRequestScalarFieldEnum)[keyof typeof OrderRequestScalarFieldEnum]


  export const OrderStatusHistoryScalarFieldEnum: {
    id: 'id',
    orderRequestId: 'orderRequestId',
    status: 'status',
    description: 'description',
    createdAt: 'createdAt'
  };

  export type OrderStatusHistoryScalarFieldEnum = (typeof OrderStatusHistoryScalarFieldEnum)[keyof typeof OrderStatusHistoryScalarFieldEnum]


  export const OrderRequestItemScalarFieldEnum: {
    id: 'id',
    orderRequestId: 'orderRequestId',
    productId: 'productId',
    productName: 'productName',
    quantity: 'quantity',
    unitPrice: 'unitPrice',
    subtotal: 'subtotal'
  };

  export type OrderRequestItemScalarFieldEnum = (typeof OrderRequestItemScalarFieldEnum)[keyof typeof OrderRequestItemScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    username?: StringFilter<"User"> | string
    fullName?: StringFilter<"User"> | string
    profilePhoto?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    carts?: UserCartListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    username?: SortOrder
    fullName?: SortOrder
    profilePhoto?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    carts?: UserCartOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    username?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    fullName?: StringFilter<"User"> | string
    profilePhoto?: StringNullableFilter<"User"> | string | null
    password?: StringFilter<"User"> | string
    role?: StringFilter<"User"> | string
    carts?: UserCartListRelationFilter
  }, "id" | "username">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    username?: SortOrder
    fullName?: SortOrder
    profilePhoto?: SortOrderInput | SortOrder
    password?: SortOrder
    role?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    username?: StringWithAggregatesFilter<"User"> | string
    fullName?: StringWithAggregatesFilter<"User"> | string
    profilePhoto?: StringNullableWithAggregatesFilter<"User"> | string | null
    password?: StringWithAggregatesFilter<"User"> | string
    role?: StringWithAggregatesFilter<"User"> | string
  }

  export type ProductWhereInput = {
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    id?: IntFilter<"Product"> | number
    nama_produk?: StringFilter<"Product"> | string
    harga?: IntFilter<"Product"> | number
    satuanHarga?: StringFilter<"Product"> | string
    stok?: IntFilter<"Product"> | number
    barcode?: StringNullableFilter<"Product"> | string | null
    gambar?: StringNullableFilter<"Product"> | string | null
    gambarPosX?: IntFilter<"Product"> | number
    gambarPosY?: IntFilter<"Product"> | number
    isArchived?: BoolFilter<"Product"> | boolean
    TransactionItems?: TransactionItemListRelationFilter
    cartItems?: UserCartItemListRelationFilter
    orderRequestItems?: OrderRequestItemListRelationFilter
  }

  export type ProductOrderByWithRelationInput = {
    id?: SortOrder
    nama_produk?: SortOrder
    harga?: SortOrder
    satuanHarga?: SortOrder
    stok?: SortOrder
    barcode?: SortOrderInput | SortOrder
    gambar?: SortOrderInput | SortOrder
    gambarPosX?: SortOrder
    gambarPosY?: SortOrder
    isArchived?: SortOrder
    TransactionItems?: TransactionItemOrderByRelationAggregateInput
    cartItems?: UserCartItemOrderByRelationAggregateInput
    orderRequestItems?: OrderRequestItemOrderByRelationAggregateInput
  }

  export type ProductWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    barcode?: string
    AND?: ProductWhereInput | ProductWhereInput[]
    OR?: ProductWhereInput[]
    NOT?: ProductWhereInput | ProductWhereInput[]
    nama_produk?: StringFilter<"Product"> | string
    harga?: IntFilter<"Product"> | number
    satuanHarga?: StringFilter<"Product"> | string
    stok?: IntFilter<"Product"> | number
    gambar?: StringNullableFilter<"Product"> | string | null
    gambarPosX?: IntFilter<"Product"> | number
    gambarPosY?: IntFilter<"Product"> | number
    isArchived?: BoolFilter<"Product"> | boolean
    TransactionItems?: TransactionItemListRelationFilter
    cartItems?: UserCartItemListRelationFilter
    orderRequestItems?: OrderRequestItemListRelationFilter
  }, "id" | "barcode">

  export type ProductOrderByWithAggregationInput = {
    id?: SortOrder
    nama_produk?: SortOrder
    harga?: SortOrder
    satuanHarga?: SortOrder
    stok?: SortOrder
    barcode?: SortOrderInput | SortOrder
    gambar?: SortOrderInput | SortOrder
    gambarPosX?: SortOrder
    gambarPosY?: SortOrder
    isArchived?: SortOrder
    _count?: ProductCountOrderByAggregateInput
    _avg?: ProductAvgOrderByAggregateInput
    _max?: ProductMaxOrderByAggregateInput
    _min?: ProductMinOrderByAggregateInput
    _sum?: ProductSumOrderByAggregateInput
  }

  export type ProductScalarWhereWithAggregatesInput = {
    AND?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    OR?: ProductScalarWhereWithAggregatesInput[]
    NOT?: ProductScalarWhereWithAggregatesInput | ProductScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Product"> | number
    nama_produk?: StringWithAggregatesFilter<"Product"> | string
    harga?: IntWithAggregatesFilter<"Product"> | number
    satuanHarga?: StringWithAggregatesFilter<"Product"> | string
    stok?: IntWithAggregatesFilter<"Product"> | number
    barcode?: StringNullableWithAggregatesFilter<"Product"> | string | null
    gambar?: StringNullableWithAggregatesFilter<"Product"> | string | null
    gambarPosX?: IntWithAggregatesFilter<"Product"> | number
    gambarPosY?: IntWithAggregatesFilter<"Product"> | number
    isArchived?: BoolWithAggregatesFilter<"Product"> | boolean
  }

  export type TransactionWhereInput = {
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    id?: IntFilter<"Transaction"> | number
    tanggal?: DateTimeFilter<"Transaction"> | Date | string
    total_harga?: IntFilter<"Transaction"> | number
    metode_pembayaran?: StringFilter<"Transaction"> | string
    status?: StringFilter<"Transaction"> | string
    nama_pembeli?: StringNullableFilter<"Transaction"> | string | null
    nama_kasir?: StringNullableFilter<"Transaction"> | string | null
    status_pengiriman?: StringFilter<"Transaction"> | string
    nama_pengrajin?: StringNullableFilter<"Transaction"> | string | null
    items?: TransactionItemListRelationFilter
    notifications?: NotificationListRelationFilter
    orderRequest?: XOR<OrderRequestNullableScalarRelationFilter, OrderRequestWhereInput> | null
  }

  export type TransactionOrderByWithRelationInput = {
    id?: SortOrder
    tanggal?: SortOrder
    total_harga?: SortOrder
    metode_pembayaran?: SortOrder
    status?: SortOrder
    nama_pembeli?: SortOrderInput | SortOrder
    nama_kasir?: SortOrderInput | SortOrder
    status_pengiriman?: SortOrder
    nama_pengrajin?: SortOrderInput | SortOrder
    items?: TransactionItemOrderByRelationAggregateInput
    notifications?: NotificationOrderByRelationAggregateInput
    orderRequest?: OrderRequestOrderByWithRelationInput
  }

  export type TransactionWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: TransactionWhereInput | TransactionWhereInput[]
    OR?: TransactionWhereInput[]
    NOT?: TransactionWhereInput | TransactionWhereInput[]
    tanggal?: DateTimeFilter<"Transaction"> | Date | string
    total_harga?: IntFilter<"Transaction"> | number
    metode_pembayaran?: StringFilter<"Transaction"> | string
    status?: StringFilter<"Transaction"> | string
    nama_pembeli?: StringNullableFilter<"Transaction"> | string | null
    nama_kasir?: StringNullableFilter<"Transaction"> | string | null
    status_pengiriman?: StringFilter<"Transaction"> | string
    nama_pengrajin?: StringNullableFilter<"Transaction"> | string | null
    items?: TransactionItemListRelationFilter
    notifications?: NotificationListRelationFilter
    orderRequest?: XOR<OrderRequestNullableScalarRelationFilter, OrderRequestWhereInput> | null
  }, "id">

  export type TransactionOrderByWithAggregationInput = {
    id?: SortOrder
    tanggal?: SortOrder
    total_harga?: SortOrder
    metode_pembayaran?: SortOrder
    status?: SortOrder
    nama_pembeli?: SortOrderInput | SortOrder
    nama_kasir?: SortOrderInput | SortOrder
    status_pengiriman?: SortOrder
    nama_pengrajin?: SortOrderInput | SortOrder
    _count?: TransactionCountOrderByAggregateInput
    _avg?: TransactionAvgOrderByAggregateInput
    _max?: TransactionMaxOrderByAggregateInput
    _min?: TransactionMinOrderByAggregateInput
    _sum?: TransactionSumOrderByAggregateInput
  }

  export type TransactionScalarWhereWithAggregatesInput = {
    AND?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    OR?: TransactionScalarWhereWithAggregatesInput[]
    NOT?: TransactionScalarWhereWithAggregatesInput | TransactionScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Transaction"> | number
    tanggal?: DateTimeWithAggregatesFilter<"Transaction"> | Date | string
    total_harga?: IntWithAggregatesFilter<"Transaction"> | number
    metode_pembayaran?: StringWithAggregatesFilter<"Transaction"> | string
    status?: StringWithAggregatesFilter<"Transaction"> | string
    nama_pembeli?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    nama_kasir?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
    status_pengiriman?: StringWithAggregatesFilter<"Transaction"> | string
    nama_pengrajin?: StringNullableWithAggregatesFilter<"Transaction"> | string | null
  }

  export type TransactionItemWhereInput = {
    AND?: TransactionItemWhereInput | TransactionItemWhereInput[]
    OR?: TransactionItemWhereInput[]
    NOT?: TransactionItemWhereInput | TransactionItemWhereInput[]
    id?: IntFilter<"TransactionItem"> | number
    transactionId?: IntFilter<"TransactionItem"> | number
    productId?: IntFilter<"TransactionItem"> | number
    jumlah?: IntFilter<"TransactionItem"> | number
    subtotal?: IntFilter<"TransactionItem"> | number
    transaction?: XOR<TransactionScalarRelationFilter, TransactionWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }

  export type TransactionItemOrderByWithRelationInput = {
    id?: SortOrder
    transactionId?: SortOrder
    productId?: SortOrder
    jumlah?: SortOrder
    subtotal?: SortOrder
    transaction?: TransactionOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
  }

  export type TransactionItemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: TransactionItemWhereInput | TransactionItemWhereInput[]
    OR?: TransactionItemWhereInput[]
    NOT?: TransactionItemWhereInput | TransactionItemWhereInput[]
    transactionId?: IntFilter<"TransactionItem"> | number
    productId?: IntFilter<"TransactionItem"> | number
    jumlah?: IntFilter<"TransactionItem"> | number
    subtotal?: IntFilter<"TransactionItem"> | number
    transaction?: XOR<TransactionScalarRelationFilter, TransactionWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }, "id">

  export type TransactionItemOrderByWithAggregationInput = {
    id?: SortOrder
    transactionId?: SortOrder
    productId?: SortOrder
    jumlah?: SortOrder
    subtotal?: SortOrder
    _count?: TransactionItemCountOrderByAggregateInput
    _avg?: TransactionItemAvgOrderByAggregateInput
    _max?: TransactionItemMaxOrderByAggregateInput
    _min?: TransactionItemMinOrderByAggregateInput
    _sum?: TransactionItemSumOrderByAggregateInput
  }

  export type TransactionItemScalarWhereWithAggregatesInput = {
    AND?: TransactionItemScalarWhereWithAggregatesInput | TransactionItemScalarWhereWithAggregatesInput[]
    OR?: TransactionItemScalarWhereWithAggregatesInput[]
    NOT?: TransactionItemScalarWhereWithAggregatesInput | TransactionItemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"TransactionItem"> | number
    transactionId?: IntWithAggregatesFilter<"TransactionItem"> | number
    productId?: IntWithAggregatesFilter<"TransactionItem"> | number
    jumlah?: IntWithAggregatesFilter<"TransactionItem"> | number
    subtotal?: IntWithAggregatesFilter<"TransactionItem"> | number
  }

  export type StoreSettingWhereInput = {
    AND?: StoreSettingWhereInput | StoreSettingWhereInput[]
    OR?: StoreSettingWhereInput[]
    NOT?: StoreSettingWhereInput | StoreSettingWhereInput[]
    id?: IntFilter<"StoreSetting"> | number
    brand?: StringFilter<"StoreSetting"> | string
    address?: StringFilter<"StoreSetting"> | string
    footer?: StringFilter<"StoreSetting"> | string
    logo?: StringNullableFilter<"StoreSetting"> | string | null
    receiptLogo?: StringNullableFilter<"StoreSetting"> | string | null
  }

  export type StoreSettingOrderByWithRelationInput = {
    id?: SortOrder
    brand?: SortOrder
    address?: SortOrder
    footer?: SortOrder
    logo?: SortOrderInput | SortOrder
    receiptLogo?: SortOrderInput | SortOrder
  }

  export type StoreSettingWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: StoreSettingWhereInput | StoreSettingWhereInput[]
    OR?: StoreSettingWhereInput[]
    NOT?: StoreSettingWhereInput | StoreSettingWhereInput[]
    brand?: StringFilter<"StoreSetting"> | string
    address?: StringFilter<"StoreSetting"> | string
    footer?: StringFilter<"StoreSetting"> | string
    logo?: StringNullableFilter<"StoreSetting"> | string | null
    receiptLogo?: StringNullableFilter<"StoreSetting"> | string | null
  }, "id">

  export type StoreSettingOrderByWithAggregationInput = {
    id?: SortOrder
    brand?: SortOrder
    address?: SortOrder
    footer?: SortOrder
    logo?: SortOrderInput | SortOrder
    receiptLogo?: SortOrderInput | SortOrder
    _count?: StoreSettingCountOrderByAggregateInput
    _avg?: StoreSettingAvgOrderByAggregateInput
    _max?: StoreSettingMaxOrderByAggregateInput
    _min?: StoreSettingMinOrderByAggregateInput
    _sum?: StoreSettingSumOrderByAggregateInput
  }

  export type StoreSettingScalarWhereWithAggregatesInput = {
    AND?: StoreSettingScalarWhereWithAggregatesInput | StoreSettingScalarWhereWithAggregatesInput[]
    OR?: StoreSettingScalarWhereWithAggregatesInput[]
    NOT?: StoreSettingScalarWhereWithAggregatesInput | StoreSettingScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"StoreSetting"> | number
    brand?: StringWithAggregatesFilter<"StoreSetting"> | string
    address?: StringWithAggregatesFilter<"StoreSetting"> | string
    footer?: StringWithAggregatesFilter<"StoreSetting"> | string
    logo?: StringNullableWithAggregatesFilter<"StoreSetting"> | string | null
    receiptLogo?: StringNullableWithAggregatesFilter<"StoreSetting"> | string | null
  }

  export type NotificationWhereInput = {
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    id?: IntFilter<"Notification"> | number
    transactionId?: IntNullableFilter<"Notification"> | number | null
    targetRole?: StringFilter<"Notification"> | string
    senderRole?: StringFilter<"Notification"> | string
    senderName?: StringNullableFilter<"Notification"> | string | null
    statusPengiriman?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    hidden?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    transaction?: XOR<TransactionNullableScalarRelationFilter, TransactionWhereInput> | null
  }

  export type NotificationOrderByWithRelationInput = {
    id?: SortOrder
    transactionId?: SortOrderInput | SortOrder
    targetRole?: SortOrder
    senderRole?: SortOrder
    senderName?: SortOrderInput | SortOrder
    statusPengiriman?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    hidden?: SortOrder
    createdAt?: SortOrder
    transaction?: TransactionOrderByWithRelationInput
  }

  export type NotificationWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    transactionId_targetRole_senderRole_statusPengiriman?: NotificationTransactionIdTargetRoleSenderRoleStatusPengirimanCompoundUniqueInput
    AND?: NotificationWhereInput | NotificationWhereInput[]
    OR?: NotificationWhereInput[]
    NOT?: NotificationWhereInput | NotificationWhereInput[]
    transactionId?: IntNullableFilter<"Notification"> | number | null
    targetRole?: StringFilter<"Notification"> | string
    senderRole?: StringFilter<"Notification"> | string
    senderName?: StringNullableFilter<"Notification"> | string | null
    statusPengiriman?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    hidden?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
    transaction?: XOR<TransactionNullableScalarRelationFilter, TransactionWhereInput> | null
  }, "id" | "transactionId_targetRole_senderRole_statusPengiriman">

  export type NotificationOrderByWithAggregationInput = {
    id?: SortOrder
    transactionId?: SortOrderInput | SortOrder
    targetRole?: SortOrder
    senderRole?: SortOrder
    senderName?: SortOrderInput | SortOrder
    statusPengiriman?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    hidden?: SortOrder
    createdAt?: SortOrder
    _count?: NotificationCountOrderByAggregateInput
    _avg?: NotificationAvgOrderByAggregateInput
    _max?: NotificationMaxOrderByAggregateInput
    _min?: NotificationMinOrderByAggregateInput
    _sum?: NotificationSumOrderByAggregateInput
  }

  export type NotificationScalarWhereWithAggregatesInput = {
    AND?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    OR?: NotificationScalarWhereWithAggregatesInput[]
    NOT?: NotificationScalarWhereWithAggregatesInput | NotificationScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Notification"> | number
    transactionId?: IntNullableWithAggregatesFilter<"Notification"> | number | null
    targetRole?: StringWithAggregatesFilter<"Notification"> | string
    senderRole?: StringWithAggregatesFilter<"Notification"> | string
    senderName?: StringNullableWithAggregatesFilter<"Notification"> | string | null
    statusPengiriman?: StringWithAggregatesFilter<"Notification"> | string
    message?: StringWithAggregatesFilter<"Notification"> | string
    isRead?: BoolWithAggregatesFilter<"Notification"> | boolean
    hidden?: BoolWithAggregatesFilter<"Notification"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Notification"> | Date | string
  }

  export type ActivityLogWhereInput = {
    AND?: ActivityLogWhereInput | ActivityLogWhereInput[]
    OR?: ActivityLogWhereInput[]
    NOT?: ActivityLogWhereInput | ActivityLogWhereInput[]
    id?: IntFilter<"ActivityLog"> | number
    action?: StringFilter<"ActivityLog"> | string
    entity?: StringFilter<"ActivityLog"> | string
    entityId?: StringNullableFilter<"ActivityLog"> | string | null
    title?: StringFilter<"ActivityLog"> | string
    description?: StringFilter<"ActivityLog"> | string
    actorId?: IntNullableFilter<"ActivityLog"> | number | null
    actorName?: StringNullableFilter<"ActivityLog"> | string | null
    actorRole?: StringNullableFilter<"ActivityLog"> | string | null
    metadata?: JsonNullableFilter<"ActivityLog">
    createdAt?: DateTimeFilter<"ActivityLog"> | Date | string
  }

  export type ActivityLogOrderByWithRelationInput = {
    id?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrderInput | SortOrder
    title?: SortOrder
    description?: SortOrder
    actorId?: SortOrderInput | SortOrder
    actorName?: SortOrderInput | SortOrder
    actorRole?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
  }

  export type ActivityLogWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: ActivityLogWhereInput | ActivityLogWhereInput[]
    OR?: ActivityLogWhereInput[]
    NOT?: ActivityLogWhereInput | ActivityLogWhereInput[]
    action?: StringFilter<"ActivityLog"> | string
    entity?: StringFilter<"ActivityLog"> | string
    entityId?: StringNullableFilter<"ActivityLog"> | string | null
    title?: StringFilter<"ActivityLog"> | string
    description?: StringFilter<"ActivityLog"> | string
    actorId?: IntNullableFilter<"ActivityLog"> | number | null
    actorName?: StringNullableFilter<"ActivityLog"> | string | null
    actorRole?: StringNullableFilter<"ActivityLog"> | string | null
    metadata?: JsonNullableFilter<"ActivityLog">
    createdAt?: DateTimeFilter<"ActivityLog"> | Date | string
  }, "id">

  export type ActivityLogOrderByWithAggregationInput = {
    id?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrderInput | SortOrder
    title?: SortOrder
    description?: SortOrder
    actorId?: SortOrderInput | SortOrder
    actorName?: SortOrderInput | SortOrder
    actorRole?: SortOrderInput | SortOrder
    metadata?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: ActivityLogCountOrderByAggregateInput
    _avg?: ActivityLogAvgOrderByAggregateInput
    _max?: ActivityLogMaxOrderByAggregateInput
    _min?: ActivityLogMinOrderByAggregateInput
    _sum?: ActivityLogSumOrderByAggregateInput
  }

  export type ActivityLogScalarWhereWithAggregatesInput = {
    AND?: ActivityLogScalarWhereWithAggregatesInput | ActivityLogScalarWhereWithAggregatesInput[]
    OR?: ActivityLogScalarWhereWithAggregatesInput[]
    NOT?: ActivityLogScalarWhereWithAggregatesInput | ActivityLogScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"ActivityLog"> | number
    action?: StringWithAggregatesFilter<"ActivityLog"> | string
    entity?: StringWithAggregatesFilter<"ActivityLog"> | string
    entityId?: StringNullableWithAggregatesFilter<"ActivityLog"> | string | null
    title?: StringWithAggregatesFilter<"ActivityLog"> | string
    description?: StringWithAggregatesFilter<"ActivityLog"> | string
    actorId?: IntNullableWithAggregatesFilter<"ActivityLog"> | number | null
    actorName?: StringNullableWithAggregatesFilter<"ActivityLog"> | string | null
    actorRole?: StringNullableWithAggregatesFilter<"ActivityLog"> | string | null
    metadata?: JsonNullableWithAggregatesFilter<"ActivityLog">
    createdAt?: DateTimeWithAggregatesFilter<"ActivityLog"> | Date | string
  }

  export type UserCartWhereInput = {
    AND?: UserCartWhereInput | UserCartWhereInput[]
    OR?: UserCartWhereInput[]
    NOT?: UserCartWhereInput | UserCartWhereInput[]
    id?: IntFilter<"UserCart"> | number
    userId?: IntFilter<"UserCart"> | number
    scope?: StringFilter<"UserCart"> | string
    customerName?: StringNullableFilter<"UserCart"> | string | null
    paymentMethod?: StringNullableFilter<"UserCart"> | string | null
    sessionActive?: BoolFilter<"UserCart"> | boolean
    createdAt?: DateTimeFilter<"UserCart"> | Date | string
    updatedAt?: DateTimeFilter<"UserCart"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    items?: UserCartItemListRelationFilter
  }

  export type UserCartOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    scope?: SortOrder
    customerName?: SortOrderInput | SortOrder
    paymentMethod?: SortOrderInput | SortOrder
    sessionActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    user?: UserOrderByWithRelationInput
    items?: UserCartItemOrderByRelationAggregateInput
  }

  export type UserCartWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId_scope?: UserCartUserIdScopeCompoundUniqueInput
    AND?: UserCartWhereInput | UserCartWhereInput[]
    OR?: UserCartWhereInput[]
    NOT?: UserCartWhereInput | UserCartWhereInput[]
    userId?: IntFilter<"UserCart"> | number
    scope?: StringFilter<"UserCart"> | string
    customerName?: StringNullableFilter<"UserCart"> | string | null
    paymentMethod?: StringNullableFilter<"UserCart"> | string | null
    sessionActive?: BoolFilter<"UserCart"> | boolean
    createdAt?: DateTimeFilter<"UserCart"> | Date | string
    updatedAt?: DateTimeFilter<"UserCart"> | Date | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
    items?: UserCartItemListRelationFilter
  }, "id" | "userId_scope">

  export type UserCartOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    scope?: SortOrder
    customerName?: SortOrderInput | SortOrder
    paymentMethod?: SortOrderInput | SortOrder
    sessionActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCartCountOrderByAggregateInput
    _avg?: UserCartAvgOrderByAggregateInput
    _max?: UserCartMaxOrderByAggregateInput
    _min?: UserCartMinOrderByAggregateInput
    _sum?: UserCartSumOrderByAggregateInput
  }

  export type UserCartScalarWhereWithAggregatesInput = {
    AND?: UserCartScalarWhereWithAggregatesInput | UserCartScalarWhereWithAggregatesInput[]
    OR?: UserCartScalarWhereWithAggregatesInput[]
    NOT?: UserCartScalarWhereWithAggregatesInput | UserCartScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserCart"> | number
    userId?: IntWithAggregatesFilter<"UserCart"> | number
    scope?: StringWithAggregatesFilter<"UserCart"> | string
    customerName?: StringNullableWithAggregatesFilter<"UserCart"> | string | null
    paymentMethod?: StringNullableWithAggregatesFilter<"UserCart"> | string | null
    sessionActive?: BoolWithAggregatesFilter<"UserCart"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"UserCart"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserCart"> | Date | string
  }

  export type UserCartItemWhereInput = {
    AND?: UserCartItemWhereInput | UserCartItemWhereInput[]
    OR?: UserCartItemWhereInput[]
    NOT?: UserCartItemWhereInput | UserCartItemWhereInput[]
    id?: IntFilter<"UserCartItem"> | number
    cartId?: IntFilter<"UserCartItem"> | number
    productId?: IntFilter<"UserCartItem"> | number
    quantity?: IntFilter<"UserCartItem"> | number
    priceOverride?: IntNullableFilter<"UserCartItem"> | number | null
    satuanPesan?: StringFilter<"UserCartItem"> | string
    createdAt?: DateTimeFilter<"UserCartItem"> | Date | string
    updatedAt?: DateTimeFilter<"UserCartItem"> | Date | string
    cart?: XOR<UserCartScalarRelationFilter, UserCartWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }

  export type UserCartItemOrderByWithRelationInput = {
    id?: SortOrder
    cartId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    priceOverride?: SortOrderInput | SortOrder
    satuanPesan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    cart?: UserCartOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
  }

  export type UserCartItemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    cartId_productId?: UserCartItemCartIdProductIdCompoundUniqueInput
    AND?: UserCartItemWhereInput | UserCartItemWhereInput[]
    OR?: UserCartItemWhereInput[]
    NOT?: UserCartItemWhereInput | UserCartItemWhereInput[]
    cartId?: IntFilter<"UserCartItem"> | number
    productId?: IntFilter<"UserCartItem"> | number
    quantity?: IntFilter<"UserCartItem"> | number
    priceOverride?: IntNullableFilter<"UserCartItem"> | number | null
    satuanPesan?: StringFilter<"UserCartItem"> | string
    createdAt?: DateTimeFilter<"UserCartItem"> | Date | string
    updatedAt?: DateTimeFilter<"UserCartItem"> | Date | string
    cart?: XOR<UserCartScalarRelationFilter, UserCartWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }, "id" | "cartId_productId">

  export type UserCartItemOrderByWithAggregationInput = {
    id?: SortOrder
    cartId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    priceOverride?: SortOrderInput | SortOrder
    satuanPesan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: UserCartItemCountOrderByAggregateInput
    _avg?: UserCartItemAvgOrderByAggregateInput
    _max?: UserCartItemMaxOrderByAggregateInput
    _min?: UserCartItemMinOrderByAggregateInput
    _sum?: UserCartItemSumOrderByAggregateInput
  }

  export type UserCartItemScalarWhereWithAggregatesInput = {
    AND?: UserCartItemScalarWhereWithAggregatesInput | UserCartItemScalarWhereWithAggregatesInput[]
    OR?: UserCartItemScalarWhereWithAggregatesInput[]
    NOT?: UserCartItemScalarWhereWithAggregatesInput | UserCartItemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserCartItem"> | number
    cartId?: IntWithAggregatesFilter<"UserCartItem"> | number
    productId?: IntWithAggregatesFilter<"UserCartItem"> | number
    quantity?: IntWithAggregatesFilter<"UserCartItem"> | number
    priceOverride?: IntNullableWithAggregatesFilter<"UserCartItem"> | number | null
    satuanPesan?: StringWithAggregatesFilter<"UserCartItem"> | string
    createdAt?: DateTimeWithAggregatesFilter<"UserCartItem"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"UserCartItem"> | Date | string
  }

  export type OrderRequestWhereInput = {
    AND?: OrderRequestWhereInput | OrderRequestWhereInput[]
    OR?: OrderRequestWhereInput[]
    NOT?: OrderRequestWhereInput | OrderRequestWhereInput[]
    id?: IntFilter<"OrderRequest"> | number
    code?: StringFilter<"OrderRequest"> | string
    customerName?: StringFilter<"OrderRequest"> | string
    phone?: StringFilter<"OrderRequest"> | string
    status?: StringFilter<"OrderRequest"> | string
    rejectionReason?: StringNullableFilter<"OrderRequest"> | string | null
    totalPrice?: IntFilter<"OrderRequest"> | number
    transactionId?: IntNullableFilter<"OrderRequest"> | number | null
    createdAt?: DateTimeFilter<"OrderRequest"> | Date | string
    updatedAt?: DateTimeFilter<"OrderRequest"> | Date | string
    transaction?: XOR<TransactionNullableScalarRelationFilter, TransactionWhereInput> | null
    items?: OrderRequestItemListRelationFilter
    statusHistory?: OrderStatusHistoryListRelationFilter
  }

  export type OrderRequestOrderByWithRelationInput = {
    id?: SortOrder
    code?: SortOrder
    customerName?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    totalPrice?: SortOrder
    transactionId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    transaction?: TransactionOrderByWithRelationInput
    items?: OrderRequestItemOrderByRelationAggregateInput
    statusHistory?: OrderStatusHistoryOrderByRelationAggregateInput
  }

  export type OrderRequestWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    code?: string
    transactionId?: number
    AND?: OrderRequestWhereInput | OrderRequestWhereInput[]
    OR?: OrderRequestWhereInput[]
    NOT?: OrderRequestWhereInput | OrderRequestWhereInput[]
    customerName?: StringFilter<"OrderRequest"> | string
    phone?: StringFilter<"OrderRequest"> | string
    status?: StringFilter<"OrderRequest"> | string
    rejectionReason?: StringNullableFilter<"OrderRequest"> | string | null
    totalPrice?: IntFilter<"OrderRequest"> | number
    createdAt?: DateTimeFilter<"OrderRequest"> | Date | string
    updatedAt?: DateTimeFilter<"OrderRequest"> | Date | string
    transaction?: XOR<TransactionNullableScalarRelationFilter, TransactionWhereInput> | null
    items?: OrderRequestItemListRelationFilter
    statusHistory?: OrderStatusHistoryListRelationFilter
  }, "id" | "code" | "transactionId">

  export type OrderRequestOrderByWithAggregationInput = {
    id?: SortOrder
    code?: SortOrder
    customerName?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrderInput | SortOrder
    totalPrice?: SortOrder
    transactionId?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: OrderRequestCountOrderByAggregateInput
    _avg?: OrderRequestAvgOrderByAggregateInput
    _max?: OrderRequestMaxOrderByAggregateInput
    _min?: OrderRequestMinOrderByAggregateInput
    _sum?: OrderRequestSumOrderByAggregateInput
  }

  export type OrderRequestScalarWhereWithAggregatesInput = {
    AND?: OrderRequestScalarWhereWithAggregatesInput | OrderRequestScalarWhereWithAggregatesInput[]
    OR?: OrderRequestScalarWhereWithAggregatesInput[]
    NOT?: OrderRequestScalarWhereWithAggregatesInput | OrderRequestScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OrderRequest"> | number
    code?: StringWithAggregatesFilter<"OrderRequest"> | string
    customerName?: StringWithAggregatesFilter<"OrderRequest"> | string
    phone?: StringWithAggregatesFilter<"OrderRequest"> | string
    status?: StringWithAggregatesFilter<"OrderRequest"> | string
    rejectionReason?: StringNullableWithAggregatesFilter<"OrderRequest"> | string | null
    totalPrice?: IntWithAggregatesFilter<"OrderRequest"> | number
    transactionId?: IntNullableWithAggregatesFilter<"OrderRequest"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"OrderRequest"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"OrderRequest"> | Date | string
  }

  export type OrderStatusHistoryWhereInput = {
    AND?: OrderStatusHistoryWhereInput | OrderStatusHistoryWhereInput[]
    OR?: OrderStatusHistoryWhereInput[]
    NOT?: OrderStatusHistoryWhereInput | OrderStatusHistoryWhereInput[]
    id?: IntFilter<"OrderStatusHistory"> | number
    orderRequestId?: IntFilter<"OrderStatusHistory"> | number
    status?: StringFilter<"OrderStatusHistory"> | string
    description?: StringNullableFilter<"OrderStatusHistory"> | string | null
    createdAt?: DateTimeFilter<"OrderStatusHistory"> | Date | string
    orderRequest?: XOR<OrderRequestScalarRelationFilter, OrderRequestWhereInput>
  }

  export type OrderStatusHistoryOrderByWithRelationInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    status?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    orderRequest?: OrderRequestOrderByWithRelationInput
  }

  export type OrderStatusHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: OrderStatusHistoryWhereInput | OrderStatusHistoryWhereInput[]
    OR?: OrderStatusHistoryWhereInput[]
    NOT?: OrderStatusHistoryWhereInput | OrderStatusHistoryWhereInput[]
    orderRequestId?: IntFilter<"OrderStatusHistory"> | number
    status?: StringFilter<"OrderStatusHistory"> | string
    description?: StringNullableFilter<"OrderStatusHistory"> | string | null
    createdAt?: DateTimeFilter<"OrderStatusHistory"> | Date | string
    orderRequest?: XOR<OrderRequestScalarRelationFilter, OrderRequestWhereInput>
  }, "id">

  export type OrderStatusHistoryOrderByWithAggregationInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    status?: SortOrder
    description?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    _count?: OrderStatusHistoryCountOrderByAggregateInput
    _avg?: OrderStatusHistoryAvgOrderByAggregateInput
    _max?: OrderStatusHistoryMaxOrderByAggregateInput
    _min?: OrderStatusHistoryMinOrderByAggregateInput
    _sum?: OrderStatusHistorySumOrderByAggregateInput
  }

  export type OrderStatusHistoryScalarWhereWithAggregatesInput = {
    AND?: OrderStatusHistoryScalarWhereWithAggregatesInput | OrderStatusHistoryScalarWhereWithAggregatesInput[]
    OR?: OrderStatusHistoryScalarWhereWithAggregatesInput[]
    NOT?: OrderStatusHistoryScalarWhereWithAggregatesInput | OrderStatusHistoryScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OrderStatusHistory"> | number
    orderRequestId?: IntWithAggregatesFilter<"OrderStatusHistory"> | number
    status?: StringWithAggregatesFilter<"OrderStatusHistory"> | string
    description?: StringNullableWithAggregatesFilter<"OrderStatusHistory"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"OrderStatusHistory"> | Date | string
  }

  export type OrderRequestItemWhereInput = {
    AND?: OrderRequestItemWhereInput | OrderRequestItemWhereInput[]
    OR?: OrderRequestItemWhereInput[]
    NOT?: OrderRequestItemWhereInput | OrderRequestItemWhereInput[]
    id?: IntFilter<"OrderRequestItem"> | number
    orderRequestId?: IntFilter<"OrderRequestItem"> | number
    productId?: IntFilter<"OrderRequestItem"> | number
    productName?: StringFilter<"OrderRequestItem"> | string
    quantity?: IntFilter<"OrderRequestItem"> | number
    unitPrice?: IntFilter<"OrderRequestItem"> | number
    subtotal?: IntFilter<"OrderRequestItem"> | number
    orderRequest?: XOR<OrderRequestScalarRelationFilter, OrderRequestWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }

  export type OrderRequestItemOrderByWithRelationInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    subtotal?: SortOrder
    orderRequest?: OrderRequestOrderByWithRelationInput
    product?: ProductOrderByWithRelationInput
  }

  export type OrderRequestItemWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    AND?: OrderRequestItemWhereInput | OrderRequestItemWhereInput[]
    OR?: OrderRequestItemWhereInput[]
    NOT?: OrderRequestItemWhereInput | OrderRequestItemWhereInput[]
    orderRequestId?: IntFilter<"OrderRequestItem"> | number
    productId?: IntFilter<"OrderRequestItem"> | number
    productName?: StringFilter<"OrderRequestItem"> | string
    quantity?: IntFilter<"OrderRequestItem"> | number
    unitPrice?: IntFilter<"OrderRequestItem"> | number
    subtotal?: IntFilter<"OrderRequestItem"> | number
    orderRequest?: XOR<OrderRequestScalarRelationFilter, OrderRequestWhereInput>
    product?: XOR<ProductScalarRelationFilter, ProductWhereInput>
  }, "id">

  export type OrderRequestItemOrderByWithAggregationInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    subtotal?: SortOrder
    _count?: OrderRequestItemCountOrderByAggregateInput
    _avg?: OrderRequestItemAvgOrderByAggregateInput
    _max?: OrderRequestItemMaxOrderByAggregateInput
    _min?: OrderRequestItemMinOrderByAggregateInput
    _sum?: OrderRequestItemSumOrderByAggregateInput
  }

  export type OrderRequestItemScalarWhereWithAggregatesInput = {
    AND?: OrderRequestItemScalarWhereWithAggregatesInput | OrderRequestItemScalarWhereWithAggregatesInput[]
    OR?: OrderRequestItemScalarWhereWithAggregatesInput[]
    NOT?: OrderRequestItemScalarWhereWithAggregatesInput | OrderRequestItemScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"OrderRequestItem"> | number
    orderRequestId?: IntWithAggregatesFilter<"OrderRequestItem"> | number
    productId?: IntWithAggregatesFilter<"OrderRequestItem"> | number
    productName?: StringWithAggregatesFilter<"OrderRequestItem"> | string
    quantity?: IntWithAggregatesFilter<"OrderRequestItem"> | number
    unitPrice?: IntWithAggregatesFilter<"OrderRequestItem"> | number
    subtotal?: IntWithAggregatesFilter<"OrderRequestItem"> | number
  }

  export type UserCreateInput = {
    username: string
    fullName?: string
    profilePhoto?: string | null
    password: string
    role: string
    carts?: UserCartCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: number
    username: string
    fullName?: string
    profilePhoto?: string | null
    password: string
    role: string
    carts?: UserCartUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    username?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    profilePhoto?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    carts?: UserCartUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    profilePhoto?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    carts?: UserCartUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: number
    username: string
    fullName?: string
    profilePhoto?: string | null
    password: string
    role: string
  }

  export type UserUpdateManyMutationInput = {
    username?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    profilePhoto?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    profilePhoto?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type ProductCreateInput = {
    nama_produk: string
    harga: number
    satuanHarga?: string
    stok: number
    barcode?: string | null
    gambar?: string | null
    gambarPosX?: number
    gambarPosY?: number
    isArchived?: boolean
    TransactionItems?: TransactionItemCreateNestedManyWithoutProductInput
    cartItems?: UserCartItemCreateNestedManyWithoutProductInput
    orderRequestItems?: OrderRequestItemCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateInput = {
    id?: number
    nama_produk: string
    harga: number
    satuanHarga?: string
    stok: number
    barcode?: string | null
    gambar?: string | null
    gambarPosX?: number
    gambarPosY?: number
    isArchived?: boolean
    TransactionItems?: TransactionItemUncheckedCreateNestedManyWithoutProductInput
    cartItems?: UserCartItemUncheckedCreateNestedManyWithoutProductInput
    orderRequestItems?: OrderRequestItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductUpdateInput = {
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    TransactionItems?: TransactionItemUpdateManyWithoutProductNestedInput
    cartItems?: UserCartItemUpdateManyWithoutProductNestedInput
    orderRequestItems?: OrderRequestItemUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    TransactionItems?: TransactionItemUncheckedUpdateManyWithoutProductNestedInput
    cartItems?: UserCartItemUncheckedUpdateManyWithoutProductNestedInput
    orderRequestItems?: OrderRequestItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type ProductCreateManyInput = {
    id?: number
    nama_produk: string
    harga: number
    satuanHarga?: string
    stok: number
    barcode?: string | null
    gambar?: string | null
    gambarPosX?: number
    gambarPosY?: number
    isArchived?: boolean
  }

  export type ProductUpdateManyMutationInput = {
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type ProductUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
  }

  export type TransactionCreateInput = {
    tanggal?: Date | string
    total_harga: number
    metode_pembayaran: string
    status?: string
    nama_pembeli?: string | null
    nama_kasir?: string | null
    status_pengiriman?: string
    nama_pengrajin?: string | null
    items?: TransactionItemCreateNestedManyWithoutTransactionInput
    notifications?: NotificationCreateNestedManyWithoutTransactionInput
    orderRequest?: OrderRequestCreateNestedOneWithoutTransactionInput
  }

  export type TransactionUncheckedCreateInput = {
    id?: number
    tanggal?: Date | string
    total_harga: number
    metode_pembayaran: string
    status?: string
    nama_pembeli?: string | null
    nama_kasir?: string | null
    status_pengiriman?: string
    nama_pengrajin?: string | null
    items?: TransactionItemUncheckedCreateNestedManyWithoutTransactionInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutTransactionInput
    orderRequest?: OrderRequestUncheckedCreateNestedOneWithoutTransactionInput
  }

  export type TransactionUpdateInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
    items?: TransactionItemUpdateManyWithoutTransactionNestedInput
    notifications?: NotificationUpdateManyWithoutTransactionNestedInput
    orderRequest?: OrderRequestUpdateOneWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
    items?: TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutTransactionNestedInput
    orderRequest?: OrderRequestUncheckedUpdateOneWithoutTransactionNestedInput
  }

  export type TransactionCreateManyInput = {
    id?: number
    tanggal?: Date | string
    total_harga: number
    metode_pembayaran: string
    status?: string
    nama_pembeli?: string | null
    nama_kasir?: string | null
    status_pengiriman?: string
    nama_pengrajin?: string | null
  }

  export type TransactionUpdateManyMutationInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type TransactionItemCreateInput = {
    jumlah: number
    subtotal: number
    transaction: TransactionCreateNestedOneWithoutItemsInput
    product: ProductCreateNestedOneWithoutTransactionItemsInput
  }

  export type TransactionItemUncheckedCreateInput = {
    id?: number
    transactionId: number
    productId: number
    jumlah: number
    subtotal: number
  }

  export type TransactionItemUpdateInput = {
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
    transaction?: TransactionUpdateOneRequiredWithoutItemsNestedInput
    product?: ProductUpdateOneRequiredWithoutTransactionItemsNestedInput
  }

  export type TransactionItemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    transactionId?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionItemCreateManyInput = {
    id?: number
    transactionId: number
    productId: number
    jumlah: number
    subtotal: number
  }

  export type TransactionItemUpdateManyMutationInput = {
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionItemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    transactionId?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type StoreSettingCreateInput = {
    id?: number
    brand?: string
    address: string
    footer: string
    logo?: string | null
    receiptLogo?: string | null
  }

  export type StoreSettingUncheckedCreateInput = {
    id?: number
    brand?: string
    address: string
    footer: string
    logo?: string | null
    receiptLogo?: string | null
  }

  export type StoreSettingUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    brand?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    footer?: StringFieldUpdateOperationsInput | string
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    receiptLogo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StoreSettingUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    brand?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    footer?: StringFieldUpdateOperationsInput | string
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    receiptLogo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StoreSettingCreateManyInput = {
    id?: number
    brand?: string
    address: string
    footer: string
    logo?: string | null
    receiptLogo?: string | null
  }

  export type StoreSettingUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    brand?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    footer?: StringFieldUpdateOperationsInput | string
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    receiptLogo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StoreSettingUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    brand?: StringFieldUpdateOperationsInput | string
    address?: StringFieldUpdateOperationsInput | string
    footer?: StringFieldUpdateOperationsInput | string
    logo?: NullableStringFieldUpdateOperationsInput | string | null
    receiptLogo?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type NotificationCreateInput = {
    targetRole: string
    senderRole: string
    senderName?: string | null
    statusPengiriman: string
    message: string
    isRead?: boolean
    hidden?: boolean
    createdAt?: Date | string
    transaction?: TransactionCreateNestedOneWithoutNotificationsInput
  }

  export type NotificationUncheckedCreateInput = {
    id?: number
    transactionId?: number | null
    targetRole: string
    senderRole: string
    senderName?: string | null
    statusPengiriman: string
    message: string
    isRead?: boolean
    hidden?: boolean
    createdAt?: Date | string
  }

  export type NotificationUpdateInput = {
    targetRole?: StringFieldUpdateOperationsInput | string
    senderRole?: StringFieldUpdateOperationsInput | string
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    statusPengiriman?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hidden?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transaction?: TransactionUpdateOneWithoutNotificationsNestedInput
  }

  export type NotificationUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    transactionId?: NullableIntFieldUpdateOperationsInput | number | null
    targetRole?: StringFieldUpdateOperationsInput | string
    senderRole?: StringFieldUpdateOperationsInput | string
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    statusPengiriman?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hidden?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationCreateManyInput = {
    id?: number
    transactionId?: number | null
    targetRole: string
    senderRole: string
    senderName?: string | null
    statusPengiriman: string
    message: string
    isRead?: boolean
    hidden?: boolean
    createdAt?: Date | string
  }

  export type NotificationUpdateManyMutationInput = {
    targetRole?: StringFieldUpdateOperationsInput | string
    senderRole?: StringFieldUpdateOperationsInput | string
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    statusPengiriman?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hidden?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    transactionId?: NullableIntFieldUpdateOperationsInput | number | null
    targetRole?: StringFieldUpdateOperationsInput | string
    senderRole?: StringFieldUpdateOperationsInput | string
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    statusPengiriman?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hidden?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogCreateInput = {
    action: string
    entity: string
    entityId?: string | null
    title: string
    description: string
    actorId?: number | null
    actorName?: string | null
    actorRole?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityLogUncheckedCreateInput = {
    id?: number
    action: string
    entity: string
    entityId?: string | null
    title: string
    description: string
    actorId?: number | null
    actorName?: string | null
    actorRole?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityLogUpdateInput = {
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    actorId?: NullableIntFieldUpdateOperationsInput | number | null
    actorName?: NullableStringFieldUpdateOperationsInput | string | null
    actorRole?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    actorId?: NullableIntFieldUpdateOperationsInput | number | null
    actorName?: NullableStringFieldUpdateOperationsInput | string | null
    actorRole?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogCreateManyInput = {
    id?: number
    action: string
    entity: string
    entityId?: string | null
    title: string
    description: string
    actorId?: number | null
    actorName?: string | null
    actorRole?: string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: Date | string
  }

  export type ActivityLogUpdateManyMutationInput = {
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    actorId?: NullableIntFieldUpdateOperationsInput | number | null
    actorName?: NullableStringFieldUpdateOperationsInput | string | null
    actorRole?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ActivityLogUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    action?: StringFieldUpdateOperationsInput | string
    entity?: StringFieldUpdateOperationsInput | string
    entityId?: NullableStringFieldUpdateOperationsInput | string | null
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    actorId?: NullableIntFieldUpdateOperationsInput | number | null
    actorName?: NullableStringFieldUpdateOperationsInput | string | null
    actorRole?: NullableStringFieldUpdateOperationsInput | string | null
    metadata?: NullableJsonNullValueInput | InputJsonValue
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCartCreateInput = {
    scope?: string
    customerName?: string | null
    paymentMethod?: string | null
    sessionActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutCartsInput
    items?: UserCartItemCreateNestedManyWithoutCartInput
  }

  export type UserCartUncheckedCreateInput = {
    id?: number
    userId: number
    scope?: string
    customerName?: string | null
    paymentMethod?: string | null
    sessionActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: UserCartItemUncheckedCreateNestedManyWithoutCartInput
  }

  export type UserCartUpdateInput = {
    scope?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    paymentMethod?: NullableStringFieldUpdateOperationsInput | string | null
    sessionActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCartsNestedInput
    items?: UserCartItemUpdateManyWithoutCartNestedInput
  }

  export type UserCartUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    scope?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    paymentMethod?: NullableStringFieldUpdateOperationsInput | string | null
    sessionActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserCartItemUncheckedUpdateManyWithoutCartNestedInput
  }

  export type UserCartCreateManyInput = {
    id?: number
    userId: number
    scope?: string
    customerName?: string | null
    paymentMethod?: string | null
    sessionActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCartUpdateManyMutationInput = {
    scope?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    paymentMethod?: NullableStringFieldUpdateOperationsInput | string | null
    sessionActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCartUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    scope?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    paymentMethod?: NullableStringFieldUpdateOperationsInput | string | null
    sessionActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCartItemCreateInput = {
    quantity: number
    priceOverride?: number | null
    satuanPesan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cart: UserCartCreateNestedOneWithoutItemsInput
    product: ProductCreateNestedOneWithoutCartItemsInput
  }

  export type UserCartItemUncheckedCreateInput = {
    id?: number
    cartId: number
    productId: number
    quantity: number
    priceOverride?: number | null
    satuanPesan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCartItemUpdateInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cart?: UserCartUpdateOneRequiredWithoutItemsNestedInput
    product?: ProductUpdateOneRequiredWithoutCartItemsNestedInput
  }

  export type UserCartItemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    cartId?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCartItemCreateManyInput = {
    id?: number
    cartId: number
    productId: number
    quantity: number
    priceOverride?: number | null
    satuanPesan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCartItemUpdateManyMutationInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCartItemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    cartId?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderRequestCreateInput = {
    code: string
    customerName: string
    phone: string
    status?: string
    rejectionReason?: string | null
    totalPrice: number
    createdAt?: Date | string
    updatedAt?: Date | string
    transaction?: TransactionCreateNestedOneWithoutOrderRequestInput
    items?: OrderRequestItemCreateNestedManyWithoutOrderRequestInput
    statusHistory?: OrderStatusHistoryCreateNestedManyWithoutOrderRequestInput
  }

  export type OrderRequestUncheckedCreateInput = {
    id?: number
    code: string
    customerName: string
    phone: string
    status?: string
    rejectionReason?: string | null
    totalPrice: number
    transactionId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderRequestItemUncheckedCreateNestedManyWithoutOrderRequestInput
    statusHistory?: OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderRequestInput
  }

  export type OrderRequestUpdateInput = {
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transaction?: TransactionUpdateOneWithoutOrderRequestNestedInput
    items?: OrderRequestItemUpdateManyWithoutOrderRequestNestedInput
    statusHistory?: OrderStatusHistoryUpdateManyWithoutOrderRequestNestedInput
  }

  export type OrderRequestUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    transactionId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderRequestItemUncheckedUpdateManyWithoutOrderRequestNestedInput
    statusHistory?: OrderStatusHistoryUncheckedUpdateManyWithoutOrderRequestNestedInput
  }

  export type OrderRequestCreateManyInput = {
    id?: number
    code: string
    customerName: string
    phone: string
    status?: string
    rejectionReason?: string | null
    totalPrice: number
    transactionId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderRequestUpdateManyMutationInput = {
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderRequestUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    transactionId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderStatusHistoryCreateInput = {
    status: string
    description?: string | null
    createdAt?: Date | string
    orderRequest: OrderRequestCreateNestedOneWithoutStatusHistoryInput
  }

  export type OrderStatusHistoryUncheckedCreateInput = {
    id?: number
    orderRequestId: number
    status: string
    description?: string | null
    createdAt?: Date | string
  }

  export type OrderStatusHistoryUpdateInput = {
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    orderRequest?: OrderRequestUpdateOneRequiredWithoutStatusHistoryNestedInput
  }

  export type OrderStatusHistoryUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderRequestId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderStatusHistoryCreateManyInput = {
    id?: number
    orderRequestId: number
    status: string
    description?: string | null
    createdAt?: Date | string
  }

  export type OrderStatusHistoryUpdateManyMutationInput = {
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderStatusHistoryUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderRequestId?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderRequestItemCreateInput = {
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    orderRequest: OrderRequestCreateNestedOneWithoutItemsInput
    product: ProductCreateNestedOneWithoutOrderRequestItemsInput
  }

  export type OrderRequestItemUncheckedCreateInput = {
    id?: number
    orderRequestId: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }

  export type OrderRequestItemUpdateInput = {
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
    orderRequest?: OrderRequestUpdateOneRequiredWithoutItemsNestedInput
    product?: ProductUpdateOneRequiredWithoutOrderRequestItemsNestedInput
  }

  export type OrderRequestItemUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderRequestId?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type OrderRequestItemCreateManyInput = {
    id?: number
    orderRequestId: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }

  export type OrderRequestItemUpdateManyMutationInput = {
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type OrderRequestItemUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderRequestId?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type UserCartListRelationFilter = {
    every?: UserCartWhereInput
    some?: UserCartWhereInput
    none?: UserCartWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCartOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    fullName?: SortOrder
    profilePhoto?: SortOrder
    password?: SortOrder
    role?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    fullName?: SortOrder
    profilePhoto?: SortOrder
    password?: SortOrder
    role?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    username?: SortOrder
    fullName?: SortOrder
    profilePhoto?: SortOrder
    password?: SortOrder
    role?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
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
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type TransactionItemListRelationFilter = {
    every?: TransactionItemWhereInput
    some?: TransactionItemWhereInput
    none?: TransactionItemWhereInput
  }

  export type UserCartItemListRelationFilter = {
    every?: UserCartItemWhereInput
    some?: UserCartItemWhereInput
    none?: UserCartItemWhereInput
  }

  export type OrderRequestItemListRelationFilter = {
    every?: OrderRequestItemWhereInput
    some?: OrderRequestItemWhereInput
    none?: OrderRequestItemWhereInput
  }

  export type TransactionItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCartItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderRequestItemOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ProductCountOrderByAggregateInput = {
    id?: SortOrder
    nama_produk?: SortOrder
    harga?: SortOrder
    satuanHarga?: SortOrder
    stok?: SortOrder
    barcode?: SortOrder
    gambar?: SortOrder
    gambarPosX?: SortOrder
    gambarPosY?: SortOrder
    isArchived?: SortOrder
  }

  export type ProductAvgOrderByAggregateInput = {
    id?: SortOrder
    harga?: SortOrder
    stok?: SortOrder
    gambarPosX?: SortOrder
    gambarPosY?: SortOrder
  }

  export type ProductMaxOrderByAggregateInput = {
    id?: SortOrder
    nama_produk?: SortOrder
    harga?: SortOrder
    satuanHarga?: SortOrder
    stok?: SortOrder
    barcode?: SortOrder
    gambar?: SortOrder
    gambarPosX?: SortOrder
    gambarPosY?: SortOrder
    isArchived?: SortOrder
  }

  export type ProductMinOrderByAggregateInput = {
    id?: SortOrder
    nama_produk?: SortOrder
    harga?: SortOrder
    satuanHarga?: SortOrder
    stok?: SortOrder
    barcode?: SortOrder
    gambar?: SortOrder
    gambarPosX?: SortOrder
    gambarPosY?: SortOrder
    isArchived?: SortOrder
  }

  export type ProductSumOrderByAggregateInput = {
    id?: SortOrder
    harga?: SortOrder
    stok?: SortOrder
    gambarPosX?: SortOrder
    gambarPosY?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NotificationListRelationFilter = {
    every?: NotificationWhereInput
    some?: NotificationWhereInput
    none?: NotificationWhereInput
  }

  export type OrderRequestNullableScalarRelationFilter = {
    is?: OrderRequestWhereInput | null
    isNot?: OrderRequestWhereInput | null
  }

  export type NotificationOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type TransactionCountOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    total_harga?: SortOrder
    metode_pembayaran?: SortOrder
    status?: SortOrder
    nama_pembeli?: SortOrder
    nama_kasir?: SortOrder
    status_pengiriman?: SortOrder
    nama_pengrajin?: SortOrder
  }

  export type TransactionAvgOrderByAggregateInput = {
    id?: SortOrder
    total_harga?: SortOrder
  }

  export type TransactionMaxOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    total_harga?: SortOrder
    metode_pembayaran?: SortOrder
    status?: SortOrder
    nama_pembeli?: SortOrder
    nama_kasir?: SortOrder
    status_pengiriman?: SortOrder
    nama_pengrajin?: SortOrder
  }

  export type TransactionMinOrderByAggregateInput = {
    id?: SortOrder
    tanggal?: SortOrder
    total_harga?: SortOrder
    metode_pembayaran?: SortOrder
    status?: SortOrder
    nama_pembeli?: SortOrder
    nama_kasir?: SortOrder
    status_pengiriman?: SortOrder
    nama_pengrajin?: SortOrder
  }

  export type TransactionSumOrderByAggregateInput = {
    id?: SortOrder
    total_harga?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type TransactionScalarRelationFilter = {
    is?: TransactionWhereInput
    isNot?: TransactionWhereInput
  }

  export type ProductScalarRelationFilter = {
    is?: ProductWhereInput
    isNot?: ProductWhereInput
  }

  export type TransactionItemCountOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    productId?: SortOrder
    jumlah?: SortOrder
    subtotal?: SortOrder
  }

  export type TransactionItemAvgOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    productId?: SortOrder
    jumlah?: SortOrder
    subtotal?: SortOrder
  }

  export type TransactionItemMaxOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    productId?: SortOrder
    jumlah?: SortOrder
    subtotal?: SortOrder
  }

  export type TransactionItemMinOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    productId?: SortOrder
    jumlah?: SortOrder
    subtotal?: SortOrder
  }

  export type TransactionItemSumOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    productId?: SortOrder
    jumlah?: SortOrder
    subtotal?: SortOrder
  }

  export type StoreSettingCountOrderByAggregateInput = {
    id?: SortOrder
    brand?: SortOrder
    address?: SortOrder
    footer?: SortOrder
    logo?: SortOrder
    receiptLogo?: SortOrder
  }

  export type StoreSettingAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type StoreSettingMaxOrderByAggregateInput = {
    id?: SortOrder
    brand?: SortOrder
    address?: SortOrder
    footer?: SortOrder
    logo?: SortOrder
    receiptLogo?: SortOrder
  }

  export type StoreSettingMinOrderByAggregateInput = {
    id?: SortOrder
    brand?: SortOrder
    address?: SortOrder
    footer?: SortOrder
    logo?: SortOrder
    receiptLogo?: SortOrder
  }

  export type StoreSettingSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type TransactionNullableScalarRelationFilter = {
    is?: TransactionWhereInput | null
    isNot?: TransactionWhereInput | null
  }

  export type NotificationTransactionIdTargetRoleSenderRoleStatusPengirimanCompoundUniqueInput = {
    transactionId: number
    targetRole: string
    senderRole: string
    statusPengiriman: string
  }

  export type NotificationCountOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    targetRole?: SortOrder
    senderRole?: SortOrder
    senderName?: SortOrder
    statusPengiriman?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    hidden?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationAvgOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
  }

  export type NotificationMaxOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    targetRole?: SortOrder
    senderRole?: SortOrder
    senderName?: SortOrder
    statusPengiriman?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    hidden?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationMinOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
    targetRole?: SortOrder
    senderRole?: SortOrder
    senderName?: SortOrder
    statusPengiriman?: SortOrder
    message?: SortOrder
    isRead?: SortOrder
    hidden?: SortOrder
    createdAt?: SortOrder
  }

  export type NotificationSumOrderByAggregateInput = {
    id?: SortOrder
    transactionId?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
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
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type ActivityLogCountOrderByAggregateInput = {
    id?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    actorId?: SortOrder
    actorName?: SortOrder
    actorRole?: SortOrder
    metadata?: SortOrder
    createdAt?: SortOrder
  }

  export type ActivityLogAvgOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
  }

  export type ActivityLogMaxOrderByAggregateInput = {
    id?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    actorId?: SortOrder
    actorName?: SortOrder
    actorRole?: SortOrder
    createdAt?: SortOrder
  }

  export type ActivityLogMinOrderByAggregateInput = {
    id?: SortOrder
    action?: SortOrder
    entity?: SortOrder
    entityId?: SortOrder
    title?: SortOrder
    description?: SortOrder
    actorId?: SortOrder
    actorName?: SortOrder
    actorRole?: SortOrder
    createdAt?: SortOrder
  }

  export type ActivityLogSumOrderByAggregateInput = {
    id?: SortOrder
    actorId?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type UserCartUserIdScopeCompoundUniqueInput = {
    userId: number
    scope: string
  }

  export type UserCartCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    scope?: SortOrder
    customerName?: SortOrder
    paymentMethod?: SortOrder
    sessionActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserCartAvgOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type UserCartMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    scope?: SortOrder
    customerName?: SortOrder
    paymentMethod?: SortOrder
    sessionActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserCartMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    scope?: SortOrder
    customerName?: SortOrder
    paymentMethod?: SortOrder
    sessionActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserCartSumOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
  }

  export type UserCartScalarRelationFilter = {
    is?: UserCartWhereInput
    isNot?: UserCartWhereInput
  }

  export type UserCartItemCartIdProductIdCompoundUniqueInput = {
    cartId: number
    productId: number
  }

  export type UserCartItemCountOrderByAggregateInput = {
    id?: SortOrder
    cartId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    priceOverride?: SortOrder
    satuanPesan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserCartItemAvgOrderByAggregateInput = {
    id?: SortOrder
    cartId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    priceOverride?: SortOrder
  }

  export type UserCartItemMaxOrderByAggregateInput = {
    id?: SortOrder
    cartId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    priceOverride?: SortOrder
    satuanPesan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserCartItemMinOrderByAggregateInput = {
    id?: SortOrder
    cartId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    priceOverride?: SortOrder
    satuanPesan?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type UserCartItemSumOrderByAggregateInput = {
    id?: SortOrder
    cartId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    priceOverride?: SortOrder
  }

  export type OrderStatusHistoryListRelationFilter = {
    every?: OrderStatusHistoryWhereInput
    some?: OrderStatusHistoryWhereInput
    none?: OrderStatusHistoryWhereInput
  }

  export type OrderStatusHistoryOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type OrderRequestCountOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    customerName?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    totalPrice?: SortOrder
    transactionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderRequestAvgOrderByAggregateInput = {
    id?: SortOrder
    totalPrice?: SortOrder
    transactionId?: SortOrder
  }

  export type OrderRequestMaxOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    customerName?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    totalPrice?: SortOrder
    transactionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderRequestMinOrderByAggregateInput = {
    id?: SortOrder
    code?: SortOrder
    customerName?: SortOrder
    phone?: SortOrder
    status?: SortOrder
    rejectionReason?: SortOrder
    totalPrice?: SortOrder
    transactionId?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type OrderRequestSumOrderByAggregateInput = {
    id?: SortOrder
    totalPrice?: SortOrder
    transactionId?: SortOrder
  }

  export type OrderRequestScalarRelationFilter = {
    is?: OrderRequestWhereInput
    isNot?: OrderRequestWhereInput
  }

  export type OrderStatusHistoryCountOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    status?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type OrderStatusHistoryAvgOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
  }

  export type OrderStatusHistoryMaxOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    status?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type OrderStatusHistoryMinOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    status?: SortOrder
    description?: SortOrder
    createdAt?: SortOrder
  }

  export type OrderStatusHistorySumOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
  }

  export type OrderRequestItemCountOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    subtotal?: SortOrder
  }

  export type OrderRequestItemAvgOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    subtotal?: SortOrder
  }

  export type OrderRequestItemMaxOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    subtotal?: SortOrder
  }

  export type OrderRequestItemMinOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    productId?: SortOrder
    productName?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    subtotal?: SortOrder
  }

  export type OrderRequestItemSumOrderByAggregateInput = {
    id?: SortOrder
    orderRequestId?: SortOrder
    productId?: SortOrder
    quantity?: SortOrder
    unitPrice?: SortOrder
    subtotal?: SortOrder
  }

  export type UserCartCreateNestedManyWithoutUserInput = {
    create?: XOR<UserCartCreateWithoutUserInput, UserCartUncheckedCreateWithoutUserInput> | UserCartCreateWithoutUserInput[] | UserCartUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserCartCreateOrConnectWithoutUserInput | UserCartCreateOrConnectWithoutUserInput[]
    createMany?: UserCartCreateManyUserInputEnvelope
    connect?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
  }

  export type UserCartUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserCartCreateWithoutUserInput, UserCartUncheckedCreateWithoutUserInput> | UserCartCreateWithoutUserInput[] | UserCartUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserCartCreateOrConnectWithoutUserInput | UserCartCreateOrConnectWithoutUserInput[]
    createMany?: UserCartCreateManyUserInputEnvelope
    connect?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type UserCartUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserCartCreateWithoutUserInput, UserCartUncheckedCreateWithoutUserInput> | UserCartCreateWithoutUserInput[] | UserCartUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserCartCreateOrConnectWithoutUserInput | UserCartCreateOrConnectWithoutUserInput[]
    upsert?: UserCartUpsertWithWhereUniqueWithoutUserInput | UserCartUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserCartCreateManyUserInputEnvelope
    set?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
    disconnect?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
    delete?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
    connect?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
    update?: UserCartUpdateWithWhereUniqueWithoutUserInput | UserCartUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserCartUpdateManyWithWhereWithoutUserInput | UserCartUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserCartScalarWhereInput | UserCartScalarWhereInput[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserCartUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserCartCreateWithoutUserInput, UserCartUncheckedCreateWithoutUserInput> | UserCartCreateWithoutUserInput[] | UserCartUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserCartCreateOrConnectWithoutUserInput | UserCartCreateOrConnectWithoutUserInput[]
    upsert?: UserCartUpsertWithWhereUniqueWithoutUserInput | UserCartUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserCartCreateManyUserInputEnvelope
    set?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
    disconnect?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
    delete?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
    connect?: UserCartWhereUniqueInput | UserCartWhereUniqueInput[]
    update?: UserCartUpdateWithWhereUniqueWithoutUserInput | UserCartUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserCartUpdateManyWithWhereWithoutUserInput | UserCartUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserCartScalarWhereInput | UserCartScalarWhereInput[]
  }

  export type TransactionItemCreateNestedManyWithoutProductInput = {
    create?: XOR<TransactionItemCreateWithoutProductInput, TransactionItemUncheckedCreateWithoutProductInput> | TransactionItemCreateWithoutProductInput[] | TransactionItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutProductInput | TransactionItemCreateOrConnectWithoutProductInput[]
    createMany?: TransactionItemCreateManyProductInputEnvelope
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
  }

  export type UserCartItemCreateNestedManyWithoutProductInput = {
    create?: XOR<UserCartItemCreateWithoutProductInput, UserCartItemUncheckedCreateWithoutProductInput> | UserCartItemCreateWithoutProductInput[] | UserCartItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: UserCartItemCreateOrConnectWithoutProductInput | UserCartItemCreateOrConnectWithoutProductInput[]
    createMany?: UserCartItemCreateManyProductInputEnvelope
    connect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
  }

  export type OrderRequestItemCreateNestedManyWithoutProductInput = {
    create?: XOR<OrderRequestItemCreateWithoutProductInput, OrderRequestItemUncheckedCreateWithoutProductInput> | OrderRequestItemCreateWithoutProductInput[] | OrderRequestItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderRequestItemCreateOrConnectWithoutProductInput | OrderRequestItemCreateOrConnectWithoutProductInput[]
    createMany?: OrderRequestItemCreateManyProductInputEnvelope
    connect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
  }

  export type TransactionItemUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<TransactionItemCreateWithoutProductInput, TransactionItemUncheckedCreateWithoutProductInput> | TransactionItemCreateWithoutProductInput[] | TransactionItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutProductInput | TransactionItemCreateOrConnectWithoutProductInput[]
    createMany?: TransactionItemCreateManyProductInputEnvelope
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
  }

  export type UserCartItemUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<UserCartItemCreateWithoutProductInput, UserCartItemUncheckedCreateWithoutProductInput> | UserCartItemCreateWithoutProductInput[] | UserCartItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: UserCartItemCreateOrConnectWithoutProductInput | UserCartItemCreateOrConnectWithoutProductInput[]
    createMany?: UserCartItemCreateManyProductInputEnvelope
    connect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
  }

  export type OrderRequestItemUncheckedCreateNestedManyWithoutProductInput = {
    create?: XOR<OrderRequestItemCreateWithoutProductInput, OrderRequestItemUncheckedCreateWithoutProductInput> | OrderRequestItemCreateWithoutProductInput[] | OrderRequestItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderRequestItemCreateOrConnectWithoutProductInput | OrderRequestItemCreateOrConnectWithoutProductInput[]
    createMany?: OrderRequestItemCreateManyProductInputEnvelope
    connect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type TransactionItemUpdateManyWithoutProductNestedInput = {
    create?: XOR<TransactionItemCreateWithoutProductInput, TransactionItemUncheckedCreateWithoutProductInput> | TransactionItemCreateWithoutProductInput[] | TransactionItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutProductInput | TransactionItemCreateOrConnectWithoutProductInput[]
    upsert?: TransactionItemUpsertWithWhereUniqueWithoutProductInput | TransactionItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: TransactionItemCreateManyProductInputEnvelope
    set?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    disconnect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    delete?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    update?: TransactionItemUpdateWithWhereUniqueWithoutProductInput | TransactionItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: TransactionItemUpdateManyWithWhereWithoutProductInput | TransactionItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
  }

  export type UserCartItemUpdateManyWithoutProductNestedInput = {
    create?: XOR<UserCartItemCreateWithoutProductInput, UserCartItemUncheckedCreateWithoutProductInput> | UserCartItemCreateWithoutProductInput[] | UserCartItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: UserCartItemCreateOrConnectWithoutProductInput | UserCartItemCreateOrConnectWithoutProductInput[]
    upsert?: UserCartItemUpsertWithWhereUniqueWithoutProductInput | UserCartItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: UserCartItemCreateManyProductInputEnvelope
    set?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    disconnect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    delete?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    connect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    update?: UserCartItemUpdateWithWhereUniqueWithoutProductInput | UserCartItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: UserCartItemUpdateManyWithWhereWithoutProductInput | UserCartItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: UserCartItemScalarWhereInput | UserCartItemScalarWhereInput[]
  }

  export type OrderRequestItemUpdateManyWithoutProductNestedInput = {
    create?: XOR<OrderRequestItemCreateWithoutProductInput, OrderRequestItemUncheckedCreateWithoutProductInput> | OrderRequestItemCreateWithoutProductInput[] | OrderRequestItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderRequestItemCreateOrConnectWithoutProductInput | OrderRequestItemCreateOrConnectWithoutProductInput[]
    upsert?: OrderRequestItemUpsertWithWhereUniqueWithoutProductInput | OrderRequestItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: OrderRequestItemCreateManyProductInputEnvelope
    set?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    disconnect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    delete?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    connect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    update?: OrderRequestItemUpdateWithWhereUniqueWithoutProductInput | OrderRequestItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: OrderRequestItemUpdateManyWithWhereWithoutProductInput | OrderRequestItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: OrderRequestItemScalarWhereInput | OrderRequestItemScalarWhereInput[]
  }

  export type TransactionItemUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<TransactionItemCreateWithoutProductInput, TransactionItemUncheckedCreateWithoutProductInput> | TransactionItemCreateWithoutProductInput[] | TransactionItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutProductInput | TransactionItemCreateOrConnectWithoutProductInput[]
    upsert?: TransactionItemUpsertWithWhereUniqueWithoutProductInput | TransactionItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: TransactionItemCreateManyProductInputEnvelope
    set?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    disconnect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    delete?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    update?: TransactionItemUpdateWithWhereUniqueWithoutProductInput | TransactionItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: TransactionItemUpdateManyWithWhereWithoutProductInput | TransactionItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
  }

  export type UserCartItemUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<UserCartItemCreateWithoutProductInput, UserCartItemUncheckedCreateWithoutProductInput> | UserCartItemCreateWithoutProductInput[] | UserCartItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: UserCartItemCreateOrConnectWithoutProductInput | UserCartItemCreateOrConnectWithoutProductInput[]
    upsert?: UserCartItemUpsertWithWhereUniqueWithoutProductInput | UserCartItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: UserCartItemCreateManyProductInputEnvelope
    set?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    disconnect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    delete?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    connect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    update?: UserCartItemUpdateWithWhereUniqueWithoutProductInput | UserCartItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: UserCartItemUpdateManyWithWhereWithoutProductInput | UserCartItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: UserCartItemScalarWhereInput | UserCartItemScalarWhereInput[]
  }

  export type OrderRequestItemUncheckedUpdateManyWithoutProductNestedInput = {
    create?: XOR<OrderRequestItemCreateWithoutProductInput, OrderRequestItemUncheckedCreateWithoutProductInput> | OrderRequestItemCreateWithoutProductInput[] | OrderRequestItemUncheckedCreateWithoutProductInput[]
    connectOrCreate?: OrderRequestItemCreateOrConnectWithoutProductInput | OrderRequestItemCreateOrConnectWithoutProductInput[]
    upsert?: OrderRequestItemUpsertWithWhereUniqueWithoutProductInput | OrderRequestItemUpsertWithWhereUniqueWithoutProductInput[]
    createMany?: OrderRequestItemCreateManyProductInputEnvelope
    set?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    disconnect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    delete?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    connect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    update?: OrderRequestItemUpdateWithWhereUniqueWithoutProductInput | OrderRequestItemUpdateWithWhereUniqueWithoutProductInput[]
    updateMany?: OrderRequestItemUpdateManyWithWhereWithoutProductInput | OrderRequestItemUpdateManyWithWhereWithoutProductInput[]
    deleteMany?: OrderRequestItemScalarWhereInput | OrderRequestItemScalarWhereInput[]
  }

  export type TransactionItemCreateNestedManyWithoutTransactionInput = {
    create?: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput> | TransactionItemCreateWithoutTransactionInput[] | TransactionItemUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutTransactionInput | TransactionItemCreateOrConnectWithoutTransactionInput[]
    createMany?: TransactionItemCreateManyTransactionInputEnvelope
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
  }

  export type NotificationCreateNestedManyWithoutTransactionInput = {
    create?: XOR<NotificationCreateWithoutTransactionInput, NotificationUncheckedCreateWithoutTransactionInput> | NotificationCreateWithoutTransactionInput[] | NotificationUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutTransactionInput | NotificationCreateOrConnectWithoutTransactionInput[]
    createMany?: NotificationCreateManyTransactionInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type OrderRequestCreateNestedOneWithoutTransactionInput = {
    create?: XOR<OrderRequestCreateWithoutTransactionInput, OrderRequestUncheckedCreateWithoutTransactionInput>
    connectOrCreate?: OrderRequestCreateOrConnectWithoutTransactionInput
    connect?: OrderRequestWhereUniqueInput
  }

  export type TransactionItemUncheckedCreateNestedManyWithoutTransactionInput = {
    create?: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput> | TransactionItemCreateWithoutTransactionInput[] | TransactionItemUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutTransactionInput | TransactionItemCreateOrConnectWithoutTransactionInput[]
    createMany?: TransactionItemCreateManyTransactionInputEnvelope
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
  }

  export type NotificationUncheckedCreateNestedManyWithoutTransactionInput = {
    create?: XOR<NotificationCreateWithoutTransactionInput, NotificationUncheckedCreateWithoutTransactionInput> | NotificationCreateWithoutTransactionInput[] | NotificationUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutTransactionInput | NotificationCreateOrConnectWithoutTransactionInput[]
    createMany?: NotificationCreateManyTransactionInputEnvelope
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
  }

  export type OrderRequestUncheckedCreateNestedOneWithoutTransactionInput = {
    create?: XOR<OrderRequestCreateWithoutTransactionInput, OrderRequestUncheckedCreateWithoutTransactionInput>
    connectOrCreate?: OrderRequestCreateOrConnectWithoutTransactionInput
    connect?: OrderRequestWhereUniqueInput
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type TransactionItemUpdateManyWithoutTransactionNestedInput = {
    create?: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput> | TransactionItemCreateWithoutTransactionInput[] | TransactionItemUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutTransactionInput | TransactionItemCreateOrConnectWithoutTransactionInput[]
    upsert?: TransactionItemUpsertWithWhereUniqueWithoutTransactionInput | TransactionItemUpsertWithWhereUniqueWithoutTransactionInput[]
    createMany?: TransactionItemCreateManyTransactionInputEnvelope
    set?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    disconnect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    delete?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    update?: TransactionItemUpdateWithWhereUniqueWithoutTransactionInput | TransactionItemUpdateWithWhereUniqueWithoutTransactionInput[]
    updateMany?: TransactionItemUpdateManyWithWhereWithoutTransactionInput | TransactionItemUpdateManyWithWhereWithoutTransactionInput[]
    deleteMany?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
  }

  export type NotificationUpdateManyWithoutTransactionNestedInput = {
    create?: XOR<NotificationCreateWithoutTransactionInput, NotificationUncheckedCreateWithoutTransactionInput> | NotificationCreateWithoutTransactionInput[] | NotificationUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutTransactionInput | NotificationCreateOrConnectWithoutTransactionInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutTransactionInput | NotificationUpsertWithWhereUniqueWithoutTransactionInput[]
    createMany?: NotificationCreateManyTransactionInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutTransactionInput | NotificationUpdateWithWhereUniqueWithoutTransactionInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutTransactionInput | NotificationUpdateManyWithWhereWithoutTransactionInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type OrderRequestUpdateOneWithoutTransactionNestedInput = {
    create?: XOR<OrderRequestCreateWithoutTransactionInput, OrderRequestUncheckedCreateWithoutTransactionInput>
    connectOrCreate?: OrderRequestCreateOrConnectWithoutTransactionInput
    upsert?: OrderRequestUpsertWithoutTransactionInput
    disconnect?: OrderRequestWhereInput | boolean
    delete?: OrderRequestWhereInput | boolean
    connect?: OrderRequestWhereUniqueInput
    update?: XOR<XOR<OrderRequestUpdateToOneWithWhereWithoutTransactionInput, OrderRequestUpdateWithoutTransactionInput>, OrderRequestUncheckedUpdateWithoutTransactionInput>
  }

  export type TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput = {
    create?: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput> | TransactionItemCreateWithoutTransactionInput[] | TransactionItemUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: TransactionItemCreateOrConnectWithoutTransactionInput | TransactionItemCreateOrConnectWithoutTransactionInput[]
    upsert?: TransactionItemUpsertWithWhereUniqueWithoutTransactionInput | TransactionItemUpsertWithWhereUniqueWithoutTransactionInput[]
    createMany?: TransactionItemCreateManyTransactionInputEnvelope
    set?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    disconnect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    delete?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    connect?: TransactionItemWhereUniqueInput | TransactionItemWhereUniqueInput[]
    update?: TransactionItemUpdateWithWhereUniqueWithoutTransactionInput | TransactionItemUpdateWithWhereUniqueWithoutTransactionInput[]
    updateMany?: TransactionItemUpdateManyWithWhereWithoutTransactionInput | TransactionItemUpdateManyWithWhereWithoutTransactionInput[]
    deleteMany?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
  }

  export type NotificationUncheckedUpdateManyWithoutTransactionNestedInput = {
    create?: XOR<NotificationCreateWithoutTransactionInput, NotificationUncheckedCreateWithoutTransactionInput> | NotificationCreateWithoutTransactionInput[] | NotificationUncheckedCreateWithoutTransactionInput[]
    connectOrCreate?: NotificationCreateOrConnectWithoutTransactionInput | NotificationCreateOrConnectWithoutTransactionInput[]
    upsert?: NotificationUpsertWithWhereUniqueWithoutTransactionInput | NotificationUpsertWithWhereUniqueWithoutTransactionInput[]
    createMany?: NotificationCreateManyTransactionInputEnvelope
    set?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    disconnect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    delete?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    connect?: NotificationWhereUniqueInput | NotificationWhereUniqueInput[]
    update?: NotificationUpdateWithWhereUniqueWithoutTransactionInput | NotificationUpdateWithWhereUniqueWithoutTransactionInput[]
    updateMany?: NotificationUpdateManyWithWhereWithoutTransactionInput | NotificationUpdateManyWithWhereWithoutTransactionInput[]
    deleteMany?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
  }

  export type OrderRequestUncheckedUpdateOneWithoutTransactionNestedInput = {
    create?: XOR<OrderRequestCreateWithoutTransactionInput, OrderRequestUncheckedCreateWithoutTransactionInput>
    connectOrCreate?: OrderRequestCreateOrConnectWithoutTransactionInput
    upsert?: OrderRequestUpsertWithoutTransactionInput
    disconnect?: OrderRequestWhereInput | boolean
    delete?: OrderRequestWhereInput | boolean
    connect?: OrderRequestWhereUniqueInput
    update?: XOR<XOR<OrderRequestUpdateToOneWithWhereWithoutTransactionInput, OrderRequestUpdateWithoutTransactionInput>, OrderRequestUncheckedUpdateWithoutTransactionInput>
  }

  export type TransactionCreateNestedOneWithoutItemsInput = {
    create?: XOR<TransactionCreateWithoutItemsInput, TransactionUncheckedCreateWithoutItemsInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutItemsInput
    connect?: TransactionWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutTransactionItemsInput = {
    create?: XOR<ProductCreateWithoutTransactionItemsInput, ProductUncheckedCreateWithoutTransactionItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutTransactionItemsInput
    connect?: ProductWhereUniqueInput
  }

  export type TransactionUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<TransactionCreateWithoutItemsInput, TransactionUncheckedCreateWithoutItemsInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutItemsInput
    upsert?: TransactionUpsertWithoutItemsInput
    connect?: TransactionWhereUniqueInput
    update?: XOR<XOR<TransactionUpdateToOneWithWhereWithoutItemsInput, TransactionUpdateWithoutItemsInput>, TransactionUncheckedUpdateWithoutItemsInput>
  }

  export type ProductUpdateOneRequiredWithoutTransactionItemsNestedInput = {
    create?: XOR<ProductCreateWithoutTransactionItemsInput, ProductUncheckedCreateWithoutTransactionItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutTransactionItemsInput
    upsert?: ProductUpsertWithoutTransactionItemsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutTransactionItemsInput, ProductUpdateWithoutTransactionItemsInput>, ProductUncheckedUpdateWithoutTransactionItemsInput>
  }

  export type TransactionCreateNestedOneWithoutNotificationsInput = {
    create?: XOR<TransactionCreateWithoutNotificationsInput, TransactionUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutNotificationsInput
    connect?: TransactionWhereUniqueInput
  }

  export type TransactionUpdateOneWithoutNotificationsNestedInput = {
    create?: XOR<TransactionCreateWithoutNotificationsInput, TransactionUncheckedCreateWithoutNotificationsInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutNotificationsInput
    upsert?: TransactionUpsertWithoutNotificationsInput
    disconnect?: TransactionWhereInput | boolean
    delete?: TransactionWhereInput | boolean
    connect?: TransactionWhereUniqueInput
    update?: XOR<XOR<TransactionUpdateToOneWithWhereWithoutNotificationsInput, TransactionUpdateWithoutNotificationsInput>, TransactionUncheckedUpdateWithoutNotificationsInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserCreateNestedOneWithoutCartsInput = {
    create?: XOR<UserCreateWithoutCartsInput, UserUncheckedCreateWithoutCartsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCartsInput
    connect?: UserWhereUniqueInput
  }

  export type UserCartItemCreateNestedManyWithoutCartInput = {
    create?: XOR<UserCartItemCreateWithoutCartInput, UserCartItemUncheckedCreateWithoutCartInput> | UserCartItemCreateWithoutCartInput[] | UserCartItemUncheckedCreateWithoutCartInput[]
    connectOrCreate?: UserCartItemCreateOrConnectWithoutCartInput | UserCartItemCreateOrConnectWithoutCartInput[]
    createMany?: UserCartItemCreateManyCartInputEnvelope
    connect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
  }

  export type UserCartItemUncheckedCreateNestedManyWithoutCartInput = {
    create?: XOR<UserCartItemCreateWithoutCartInput, UserCartItemUncheckedCreateWithoutCartInput> | UserCartItemCreateWithoutCartInput[] | UserCartItemUncheckedCreateWithoutCartInput[]
    connectOrCreate?: UserCartItemCreateOrConnectWithoutCartInput | UserCartItemCreateOrConnectWithoutCartInput[]
    createMany?: UserCartItemCreateManyCartInputEnvelope
    connect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
  }

  export type UserUpdateOneRequiredWithoutCartsNestedInput = {
    create?: XOR<UserCreateWithoutCartsInput, UserUncheckedCreateWithoutCartsInput>
    connectOrCreate?: UserCreateOrConnectWithoutCartsInput
    upsert?: UserUpsertWithoutCartsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutCartsInput, UserUpdateWithoutCartsInput>, UserUncheckedUpdateWithoutCartsInput>
  }

  export type UserCartItemUpdateManyWithoutCartNestedInput = {
    create?: XOR<UserCartItemCreateWithoutCartInput, UserCartItemUncheckedCreateWithoutCartInput> | UserCartItemCreateWithoutCartInput[] | UserCartItemUncheckedCreateWithoutCartInput[]
    connectOrCreate?: UserCartItemCreateOrConnectWithoutCartInput | UserCartItemCreateOrConnectWithoutCartInput[]
    upsert?: UserCartItemUpsertWithWhereUniqueWithoutCartInput | UserCartItemUpsertWithWhereUniqueWithoutCartInput[]
    createMany?: UserCartItemCreateManyCartInputEnvelope
    set?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    disconnect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    delete?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    connect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    update?: UserCartItemUpdateWithWhereUniqueWithoutCartInput | UserCartItemUpdateWithWhereUniqueWithoutCartInput[]
    updateMany?: UserCartItemUpdateManyWithWhereWithoutCartInput | UserCartItemUpdateManyWithWhereWithoutCartInput[]
    deleteMany?: UserCartItemScalarWhereInput | UserCartItemScalarWhereInput[]
  }

  export type UserCartItemUncheckedUpdateManyWithoutCartNestedInput = {
    create?: XOR<UserCartItemCreateWithoutCartInput, UserCartItemUncheckedCreateWithoutCartInput> | UserCartItemCreateWithoutCartInput[] | UserCartItemUncheckedCreateWithoutCartInput[]
    connectOrCreate?: UserCartItemCreateOrConnectWithoutCartInput | UserCartItemCreateOrConnectWithoutCartInput[]
    upsert?: UserCartItemUpsertWithWhereUniqueWithoutCartInput | UserCartItemUpsertWithWhereUniqueWithoutCartInput[]
    createMany?: UserCartItemCreateManyCartInputEnvelope
    set?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    disconnect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    delete?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    connect?: UserCartItemWhereUniqueInput | UserCartItemWhereUniqueInput[]
    update?: UserCartItemUpdateWithWhereUniqueWithoutCartInput | UserCartItemUpdateWithWhereUniqueWithoutCartInput[]
    updateMany?: UserCartItemUpdateManyWithWhereWithoutCartInput | UserCartItemUpdateManyWithWhereWithoutCartInput[]
    deleteMany?: UserCartItemScalarWhereInput | UserCartItemScalarWhereInput[]
  }

  export type UserCartCreateNestedOneWithoutItemsInput = {
    create?: XOR<UserCartCreateWithoutItemsInput, UserCartUncheckedCreateWithoutItemsInput>
    connectOrCreate?: UserCartCreateOrConnectWithoutItemsInput
    connect?: UserCartWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutCartItemsInput = {
    create?: XOR<ProductCreateWithoutCartItemsInput, ProductUncheckedCreateWithoutCartItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutCartItemsInput
    connect?: ProductWhereUniqueInput
  }

  export type UserCartUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<UserCartCreateWithoutItemsInput, UserCartUncheckedCreateWithoutItemsInput>
    connectOrCreate?: UserCartCreateOrConnectWithoutItemsInput
    upsert?: UserCartUpsertWithoutItemsInput
    connect?: UserCartWhereUniqueInput
    update?: XOR<XOR<UserCartUpdateToOneWithWhereWithoutItemsInput, UserCartUpdateWithoutItemsInput>, UserCartUncheckedUpdateWithoutItemsInput>
  }

  export type ProductUpdateOneRequiredWithoutCartItemsNestedInput = {
    create?: XOR<ProductCreateWithoutCartItemsInput, ProductUncheckedCreateWithoutCartItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutCartItemsInput
    upsert?: ProductUpsertWithoutCartItemsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutCartItemsInput, ProductUpdateWithoutCartItemsInput>, ProductUncheckedUpdateWithoutCartItemsInput>
  }

  export type TransactionCreateNestedOneWithoutOrderRequestInput = {
    create?: XOR<TransactionCreateWithoutOrderRequestInput, TransactionUncheckedCreateWithoutOrderRequestInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutOrderRequestInput
    connect?: TransactionWhereUniqueInput
  }

  export type OrderRequestItemCreateNestedManyWithoutOrderRequestInput = {
    create?: XOR<OrderRequestItemCreateWithoutOrderRequestInput, OrderRequestItemUncheckedCreateWithoutOrderRequestInput> | OrderRequestItemCreateWithoutOrderRequestInput[] | OrderRequestItemUncheckedCreateWithoutOrderRequestInput[]
    connectOrCreate?: OrderRequestItemCreateOrConnectWithoutOrderRequestInput | OrderRequestItemCreateOrConnectWithoutOrderRequestInput[]
    createMany?: OrderRequestItemCreateManyOrderRequestInputEnvelope
    connect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
  }

  export type OrderStatusHistoryCreateNestedManyWithoutOrderRequestInput = {
    create?: XOR<OrderStatusHistoryCreateWithoutOrderRequestInput, OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput> | OrderStatusHistoryCreateWithoutOrderRequestInput[] | OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput[]
    connectOrCreate?: OrderStatusHistoryCreateOrConnectWithoutOrderRequestInput | OrderStatusHistoryCreateOrConnectWithoutOrderRequestInput[]
    createMany?: OrderStatusHistoryCreateManyOrderRequestInputEnvelope
    connect?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
  }

  export type OrderRequestItemUncheckedCreateNestedManyWithoutOrderRequestInput = {
    create?: XOR<OrderRequestItemCreateWithoutOrderRequestInput, OrderRequestItemUncheckedCreateWithoutOrderRequestInput> | OrderRequestItemCreateWithoutOrderRequestInput[] | OrderRequestItemUncheckedCreateWithoutOrderRequestInput[]
    connectOrCreate?: OrderRequestItemCreateOrConnectWithoutOrderRequestInput | OrderRequestItemCreateOrConnectWithoutOrderRequestInput[]
    createMany?: OrderRequestItemCreateManyOrderRequestInputEnvelope
    connect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
  }

  export type OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderRequestInput = {
    create?: XOR<OrderStatusHistoryCreateWithoutOrderRequestInput, OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput> | OrderStatusHistoryCreateWithoutOrderRequestInput[] | OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput[]
    connectOrCreate?: OrderStatusHistoryCreateOrConnectWithoutOrderRequestInput | OrderStatusHistoryCreateOrConnectWithoutOrderRequestInput[]
    createMany?: OrderStatusHistoryCreateManyOrderRequestInputEnvelope
    connect?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
  }

  export type TransactionUpdateOneWithoutOrderRequestNestedInput = {
    create?: XOR<TransactionCreateWithoutOrderRequestInput, TransactionUncheckedCreateWithoutOrderRequestInput>
    connectOrCreate?: TransactionCreateOrConnectWithoutOrderRequestInput
    upsert?: TransactionUpsertWithoutOrderRequestInput
    disconnect?: TransactionWhereInput | boolean
    delete?: TransactionWhereInput | boolean
    connect?: TransactionWhereUniqueInput
    update?: XOR<XOR<TransactionUpdateToOneWithWhereWithoutOrderRequestInput, TransactionUpdateWithoutOrderRequestInput>, TransactionUncheckedUpdateWithoutOrderRequestInput>
  }

  export type OrderRequestItemUpdateManyWithoutOrderRequestNestedInput = {
    create?: XOR<OrderRequestItemCreateWithoutOrderRequestInput, OrderRequestItemUncheckedCreateWithoutOrderRequestInput> | OrderRequestItemCreateWithoutOrderRequestInput[] | OrderRequestItemUncheckedCreateWithoutOrderRequestInput[]
    connectOrCreate?: OrderRequestItemCreateOrConnectWithoutOrderRequestInput | OrderRequestItemCreateOrConnectWithoutOrderRequestInput[]
    upsert?: OrderRequestItemUpsertWithWhereUniqueWithoutOrderRequestInput | OrderRequestItemUpsertWithWhereUniqueWithoutOrderRequestInput[]
    createMany?: OrderRequestItemCreateManyOrderRequestInputEnvelope
    set?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    disconnect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    delete?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    connect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    update?: OrderRequestItemUpdateWithWhereUniqueWithoutOrderRequestInput | OrderRequestItemUpdateWithWhereUniqueWithoutOrderRequestInput[]
    updateMany?: OrderRequestItemUpdateManyWithWhereWithoutOrderRequestInput | OrderRequestItemUpdateManyWithWhereWithoutOrderRequestInput[]
    deleteMany?: OrderRequestItemScalarWhereInput | OrderRequestItemScalarWhereInput[]
  }

  export type OrderStatusHistoryUpdateManyWithoutOrderRequestNestedInput = {
    create?: XOR<OrderStatusHistoryCreateWithoutOrderRequestInput, OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput> | OrderStatusHistoryCreateWithoutOrderRequestInput[] | OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput[]
    connectOrCreate?: OrderStatusHistoryCreateOrConnectWithoutOrderRequestInput | OrderStatusHistoryCreateOrConnectWithoutOrderRequestInput[]
    upsert?: OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderRequestInput | OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderRequestInput[]
    createMany?: OrderStatusHistoryCreateManyOrderRequestInputEnvelope
    set?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
    disconnect?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
    delete?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
    connect?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
    update?: OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderRequestInput | OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderRequestInput[]
    updateMany?: OrderStatusHistoryUpdateManyWithWhereWithoutOrderRequestInput | OrderStatusHistoryUpdateManyWithWhereWithoutOrderRequestInput[]
    deleteMany?: OrderStatusHistoryScalarWhereInput | OrderStatusHistoryScalarWhereInput[]
  }

  export type OrderRequestItemUncheckedUpdateManyWithoutOrderRequestNestedInput = {
    create?: XOR<OrderRequestItemCreateWithoutOrderRequestInput, OrderRequestItemUncheckedCreateWithoutOrderRequestInput> | OrderRequestItemCreateWithoutOrderRequestInput[] | OrderRequestItemUncheckedCreateWithoutOrderRequestInput[]
    connectOrCreate?: OrderRequestItemCreateOrConnectWithoutOrderRequestInput | OrderRequestItemCreateOrConnectWithoutOrderRequestInput[]
    upsert?: OrderRequestItemUpsertWithWhereUniqueWithoutOrderRequestInput | OrderRequestItemUpsertWithWhereUniqueWithoutOrderRequestInput[]
    createMany?: OrderRequestItemCreateManyOrderRequestInputEnvelope
    set?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    disconnect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    delete?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    connect?: OrderRequestItemWhereUniqueInput | OrderRequestItemWhereUniqueInput[]
    update?: OrderRequestItemUpdateWithWhereUniqueWithoutOrderRequestInput | OrderRequestItemUpdateWithWhereUniqueWithoutOrderRequestInput[]
    updateMany?: OrderRequestItemUpdateManyWithWhereWithoutOrderRequestInput | OrderRequestItemUpdateManyWithWhereWithoutOrderRequestInput[]
    deleteMany?: OrderRequestItemScalarWhereInput | OrderRequestItemScalarWhereInput[]
  }

  export type OrderStatusHistoryUncheckedUpdateManyWithoutOrderRequestNestedInput = {
    create?: XOR<OrderStatusHistoryCreateWithoutOrderRequestInput, OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput> | OrderStatusHistoryCreateWithoutOrderRequestInput[] | OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput[]
    connectOrCreate?: OrderStatusHistoryCreateOrConnectWithoutOrderRequestInput | OrderStatusHistoryCreateOrConnectWithoutOrderRequestInput[]
    upsert?: OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderRequestInput | OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderRequestInput[]
    createMany?: OrderStatusHistoryCreateManyOrderRequestInputEnvelope
    set?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
    disconnect?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
    delete?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
    connect?: OrderStatusHistoryWhereUniqueInput | OrderStatusHistoryWhereUniqueInput[]
    update?: OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderRequestInput | OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderRequestInput[]
    updateMany?: OrderStatusHistoryUpdateManyWithWhereWithoutOrderRequestInput | OrderStatusHistoryUpdateManyWithWhereWithoutOrderRequestInput[]
    deleteMany?: OrderStatusHistoryScalarWhereInput | OrderStatusHistoryScalarWhereInput[]
  }

  export type OrderRequestCreateNestedOneWithoutStatusHistoryInput = {
    create?: XOR<OrderRequestCreateWithoutStatusHistoryInput, OrderRequestUncheckedCreateWithoutStatusHistoryInput>
    connectOrCreate?: OrderRequestCreateOrConnectWithoutStatusHistoryInput
    connect?: OrderRequestWhereUniqueInput
  }

  export type OrderRequestUpdateOneRequiredWithoutStatusHistoryNestedInput = {
    create?: XOR<OrderRequestCreateWithoutStatusHistoryInput, OrderRequestUncheckedCreateWithoutStatusHistoryInput>
    connectOrCreate?: OrderRequestCreateOrConnectWithoutStatusHistoryInput
    upsert?: OrderRequestUpsertWithoutStatusHistoryInput
    connect?: OrderRequestWhereUniqueInput
    update?: XOR<XOR<OrderRequestUpdateToOneWithWhereWithoutStatusHistoryInput, OrderRequestUpdateWithoutStatusHistoryInput>, OrderRequestUncheckedUpdateWithoutStatusHistoryInput>
  }

  export type OrderRequestCreateNestedOneWithoutItemsInput = {
    create?: XOR<OrderRequestCreateWithoutItemsInput, OrderRequestUncheckedCreateWithoutItemsInput>
    connectOrCreate?: OrderRequestCreateOrConnectWithoutItemsInput
    connect?: OrderRequestWhereUniqueInput
  }

  export type ProductCreateNestedOneWithoutOrderRequestItemsInput = {
    create?: XOR<ProductCreateWithoutOrderRequestItemsInput, ProductUncheckedCreateWithoutOrderRequestItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutOrderRequestItemsInput
    connect?: ProductWhereUniqueInput
  }

  export type OrderRequestUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<OrderRequestCreateWithoutItemsInput, OrderRequestUncheckedCreateWithoutItemsInput>
    connectOrCreate?: OrderRequestCreateOrConnectWithoutItemsInput
    upsert?: OrderRequestUpsertWithoutItemsInput
    connect?: OrderRequestWhereUniqueInput
    update?: XOR<XOR<OrderRequestUpdateToOneWithWhereWithoutItemsInput, OrderRequestUpdateWithoutItemsInput>, OrderRequestUncheckedUpdateWithoutItemsInput>
  }

  export type ProductUpdateOneRequiredWithoutOrderRequestItemsNestedInput = {
    create?: XOR<ProductCreateWithoutOrderRequestItemsInput, ProductUncheckedCreateWithoutOrderRequestItemsInput>
    connectOrCreate?: ProductCreateOrConnectWithoutOrderRequestItemsInput
    upsert?: ProductUpsertWithoutOrderRequestItemsInput
    connect?: ProductWhereUniqueInput
    update?: XOR<XOR<ProductUpdateToOneWithWhereWithoutOrderRequestItemsInput, ProductUpdateWithoutOrderRequestItemsInput>, ProductUncheckedUpdateWithoutOrderRequestItemsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
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
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
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

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
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

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
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

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
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
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
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
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type UserCartCreateWithoutUserInput = {
    scope?: string
    customerName?: string | null
    paymentMethod?: string | null
    sessionActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: UserCartItemCreateNestedManyWithoutCartInput
  }

  export type UserCartUncheckedCreateWithoutUserInput = {
    id?: number
    scope?: string
    customerName?: string | null
    paymentMethod?: string | null
    sessionActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: UserCartItemUncheckedCreateNestedManyWithoutCartInput
  }

  export type UserCartCreateOrConnectWithoutUserInput = {
    where: UserCartWhereUniqueInput
    create: XOR<UserCartCreateWithoutUserInput, UserCartUncheckedCreateWithoutUserInput>
  }

  export type UserCartCreateManyUserInputEnvelope = {
    data: UserCartCreateManyUserInput | UserCartCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserCartUpsertWithWhereUniqueWithoutUserInput = {
    where: UserCartWhereUniqueInput
    update: XOR<UserCartUpdateWithoutUserInput, UserCartUncheckedUpdateWithoutUserInput>
    create: XOR<UserCartCreateWithoutUserInput, UserCartUncheckedCreateWithoutUserInput>
  }

  export type UserCartUpdateWithWhereUniqueWithoutUserInput = {
    where: UserCartWhereUniqueInput
    data: XOR<UserCartUpdateWithoutUserInput, UserCartUncheckedUpdateWithoutUserInput>
  }

  export type UserCartUpdateManyWithWhereWithoutUserInput = {
    where: UserCartScalarWhereInput
    data: XOR<UserCartUpdateManyMutationInput, UserCartUncheckedUpdateManyWithoutUserInput>
  }

  export type UserCartScalarWhereInput = {
    AND?: UserCartScalarWhereInput | UserCartScalarWhereInput[]
    OR?: UserCartScalarWhereInput[]
    NOT?: UserCartScalarWhereInput | UserCartScalarWhereInput[]
    id?: IntFilter<"UserCart"> | number
    userId?: IntFilter<"UserCart"> | number
    scope?: StringFilter<"UserCart"> | string
    customerName?: StringNullableFilter<"UserCart"> | string | null
    paymentMethod?: StringNullableFilter<"UserCart"> | string | null
    sessionActive?: BoolFilter<"UserCart"> | boolean
    createdAt?: DateTimeFilter<"UserCart"> | Date | string
    updatedAt?: DateTimeFilter<"UserCart"> | Date | string
  }

  export type TransactionItemCreateWithoutProductInput = {
    jumlah: number
    subtotal: number
    transaction: TransactionCreateNestedOneWithoutItemsInput
  }

  export type TransactionItemUncheckedCreateWithoutProductInput = {
    id?: number
    transactionId: number
    jumlah: number
    subtotal: number
  }

  export type TransactionItemCreateOrConnectWithoutProductInput = {
    where: TransactionItemWhereUniqueInput
    create: XOR<TransactionItemCreateWithoutProductInput, TransactionItemUncheckedCreateWithoutProductInput>
  }

  export type TransactionItemCreateManyProductInputEnvelope = {
    data: TransactionItemCreateManyProductInput | TransactionItemCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type UserCartItemCreateWithoutProductInput = {
    quantity: number
    priceOverride?: number | null
    satuanPesan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    cart: UserCartCreateNestedOneWithoutItemsInput
  }

  export type UserCartItemUncheckedCreateWithoutProductInput = {
    id?: number
    cartId: number
    quantity: number
    priceOverride?: number | null
    satuanPesan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCartItemCreateOrConnectWithoutProductInput = {
    where: UserCartItemWhereUniqueInput
    create: XOR<UserCartItemCreateWithoutProductInput, UserCartItemUncheckedCreateWithoutProductInput>
  }

  export type UserCartItemCreateManyProductInputEnvelope = {
    data: UserCartItemCreateManyProductInput | UserCartItemCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type OrderRequestItemCreateWithoutProductInput = {
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    orderRequest: OrderRequestCreateNestedOneWithoutItemsInput
  }

  export type OrderRequestItemUncheckedCreateWithoutProductInput = {
    id?: number
    orderRequestId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }

  export type OrderRequestItemCreateOrConnectWithoutProductInput = {
    where: OrderRequestItemWhereUniqueInput
    create: XOR<OrderRequestItemCreateWithoutProductInput, OrderRequestItemUncheckedCreateWithoutProductInput>
  }

  export type OrderRequestItemCreateManyProductInputEnvelope = {
    data: OrderRequestItemCreateManyProductInput | OrderRequestItemCreateManyProductInput[]
    skipDuplicates?: boolean
  }

  export type TransactionItemUpsertWithWhereUniqueWithoutProductInput = {
    where: TransactionItemWhereUniqueInput
    update: XOR<TransactionItemUpdateWithoutProductInput, TransactionItemUncheckedUpdateWithoutProductInput>
    create: XOR<TransactionItemCreateWithoutProductInput, TransactionItemUncheckedCreateWithoutProductInput>
  }

  export type TransactionItemUpdateWithWhereUniqueWithoutProductInput = {
    where: TransactionItemWhereUniqueInput
    data: XOR<TransactionItemUpdateWithoutProductInput, TransactionItemUncheckedUpdateWithoutProductInput>
  }

  export type TransactionItemUpdateManyWithWhereWithoutProductInput = {
    where: TransactionItemScalarWhereInput
    data: XOR<TransactionItemUpdateManyMutationInput, TransactionItemUncheckedUpdateManyWithoutProductInput>
  }

  export type TransactionItemScalarWhereInput = {
    AND?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
    OR?: TransactionItemScalarWhereInput[]
    NOT?: TransactionItemScalarWhereInput | TransactionItemScalarWhereInput[]
    id?: IntFilter<"TransactionItem"> | number
    transactionId?: IntFilter<"TransactionItem"> | number
    productId?: IntFilter<"TransactionItem"> | number
    jumlah?: IntFilter<"TransactionItem"> | number
    subtotal?: IntFilter<"TransactionItem"> | number
  }

  export type UserCartItemUpsertWithWhereUniqueWithoutProductInput = {
    where: UserCartItemWhereUniqueInput
    update: XOR<UserCartItemUpdateWithoutProductInput, UserCartItemUncheckedUpdateWithoutProductInput>
    create: XOR<UserCartItemCreateWithoutProductInput, UserCartItemUncheckedCreateWithoutProductInput>
  }

  export type UserCartItemUpdateWithWhereUniqueWithoutProductInput = {
    where: UserCartItemWhereUniqueInput
    data: XOR<UserCartItemUpdateWithoutProductInput, UserCartItemUncheckedUpdateWithoutProductInput>
  }

  export type UserCartItemUpdateManyWithWhereWithoutProductInput = {
    where: UserCartItemScalarWhereInput
    data: XOR<UserCartItemUpdateManyMutationInput, UserCartItemUncheckedUpdateManyWithoutProductInput>
  }

  export type UserCartItemScalarWhereInput = {
    AND?: UserCartItemScalarWhereInput | UserCartItemScalarWhereInput[]
    OR?: UserCartItemScalarWhereInput[]
    NOT?: UserCartItemScalarWhereInput | UserCartItemScalarWhereInput[]
    id?: IntFilter<"UserCartItem"> | number
    cartId?: IntFilter<"UserCartItem"> | number
    productId?: IntFilter<"UserCartItem"> | number
    quantity?: IntFilter<"UserCartItem"> | number
    priceOverride?: IntNullableFilter<"UserCartItem"> | number | null
    satuanPesan?: StringFilter<"UserCartItem"> | string
    createdAt?: DateTimeFilter<"UserCartItem"> | Date | string
    updatedAt?: DateTimeFilter<"UserCartItem"> | Date | string
  }

  export type OrderRequestItemUpsertWithWhereUniqueWithoutProductInput = {
    where: OrderRequestItemWhereUniqueInput
    update: XOR<OrderRequestItemUpdateWithoutProductInput, OrderRequestItemUncheckedUpdateWithoutProductInput>
    create: XOR<OrderRequestItemCreateWithoutProductInput, OrderRequestItemUncheckedCreateWithoutProductInput>
  }

  export type OrderRequestItemUpdateWithWhereUniqueWithoutProductInput = {
    where: OrderRequestItemWhereUniqueInput
    data: XOR<OrderRequestItemUpdateWithoutProductInput, OrderRequestItemUncheckedUpdateWithoutProductInput>
  }

  export type OrderRequestItemUpdateManyWithWhereWithoutProductInput = {
    where: OrderRequestItemScalarWhereInput
    data: XOR<OrderRequestItemUpdateManyMutationInput, OrderRequestItemUncheckedUpdateManyWithoutProductInput>
  }

  export type OrderRequestItemScalarWhereInput = {
    AND?: OrderRequestItemScalarWhereInput | OrderRequestItemScalarWhereInput[]
    OR?: OrderRequestItemScalarWhereInput[]
    NOT?: OrderRequestItemScalarWhereInput | OrderRequestItemScalarWhereInput[]
    id?: IntFilter<"OrderRequestItem"> | number
    orderRequestId?: IntFilter<"OrderRequestItem"> | number
    productId?: IntFilter<"OrderRequestItem"> | number
    productName?: StringFilter<"OrderRequestItem"> | string
    quantity?: IntFilter<"OrderRequestItem"> | number
    unitPrice?: IntFilter<"OrderRequestItem"> | number
    subtotal?: IntFilter<"OrderRequestItem"> | number
  }

  export type TransactionItemCreateWithoutTransactionInput = {
    jumlah: number
    subtotal: number
    product: ProductCreateNestedOneWithoutTransactionItemsInput
  }

  export type TransactionItemUncheckedCreateWithoutTransactionInput = {
    id?: number
    productId: number
    jumlah: number
    subtotal: number
  }

  export type TransactionItemCreateOrConnectWithoutTransactionInput = {
    where: TransactionItemWhereUniqueInput
    create: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput>
  }

  export type TransactionItemCreateManyTransactionInputEnvelope = {
    data: TransactionItemCreateManyTransactionInput | TransactionItemCreateManyTransactionInput[]
    skipDuplicates?: boolean
  }

  export type NotificationCreateWithoutTransactionInput = {
    targetRole: string
    senderRole: string
    senderName?: string | null
    statusPengiriman: string
    message: string
    isRead?: boolean
    hidden?: boolean
    createdAt?: Date | string
  }

  export type NotificationUncheckedCreateWithoutTransactionInput = {
    id?: number
    targetRole: string
    senderRole: string
    senderName?: string | null
    statusPengiriman: string
    message: string
    isRead?: boolean
    hidden?: boolean
    createdAt?: Date | string
  }

  export type NotificationCreateOrConnectWithoutTransactionInput = {
    where: NotificationWhereUniqueInput
    create: XOR<NotificationCreateWithoutTransactionInput, NotificationUncheckedCreateWithoutTransactionInput>
  }

  export type NotificationCreateManyTransactionInputEnvelope = {
    data: NotificationCreateManyTransactionInput | NotificationCreateManyTransactionInput[]
    skipDuplicates?: boolean
  }

  export type OrderRequestCreateWithoutTransactionInput = {
    code: string
    customerName: string
    phone: string
    status?: string
    rejectionReason?: string | null
    totalPrice: number
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderRequestItemCreateNestedManyWithoutOrderRequestInput
    statusHistory?: OrderStatusHistoryCreateNestedManyWithoutOrderRequestInput
  }

  export type OrderRequestUncheckedCreateWithoutTransactionInput = {
    id?: number
    code: string
    customerName: string
    phone: string
    status?: string
    rejectionReason?: string | null
    totalPrice: number
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderRequestItemUncheckedCreateNestedManyWithoutOrderRequestInput
    statusHistory?: OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderRequestInput
  }

  export type OrderRequestCreateOrConnectWithoutTransactionInput = {
    where: OrderRequestWhereUniqueInput
    create: XOR<OrderRequestCreateWithoutTransactionInput, OrderRequestUncheckedCreateWithoutTransactionInput>
  }

  export type TransactionItemUpsertWithWhereUniqueWithoutTransactionInput = {
    where: TransactionItemWhereUniqueInput
    update: XOR<TransactionItemUpdateWithoutTransactionInput, TransactionItemUncheckedUpdateWithoutTransactionInput>
    create: XOR<TransactionItemCreateWithoutTransactionInput, TransactionItemUncheckedCreateWithoutTransactionInput>
  }

  export type TransactionItemUpdateWithWhereUniqueWithoutTransactionInput = {
    where: TransactionItemWhereUniqueInput
    data: XOR<TransactionItemUpdateWithoutTransactionInput, TransactionItemUncheckedUpdateWithoutTransactionInput>
  }

  export type TransactionItemUpdateManyWithWhereWithoutTransactionInput = {
    where: TransactionItemScalarWhereInput
    data: XOR<TransactionItemUpdateManyMutationInput, TransactionItemUncheckedUpdateManyWithoutTransactionInput>
  }

  export type NotificationUpsertWithWhereUniqueWithoutTransactionInput = {
    where: NotificationWhereUniqueInput
    update: XOR<NotificationUpdateWithoutTransactionInput, NotificationUncheckedUpdateWithoutTransactionInput>
    create: XOR<NotificationCreateWithoutTransactionInput, NotificationUncheckedCreateWithoutTransactionInput>
  }

  export type NotificationUpdateWithWhereUniqueWithoutTransactionInput = {
    where: NotificationWhereUniqueInput
    data: XOR<NotificationUpdateWithoutTransactionInput, NotificationUncheckedUpdateWithoutTransactionInput>
  }

  export type NotificationUpdateManyWithWhereWithoutTransactionInput = {
    where: NotificationScalarWhereInput
    data: XOR<NotificationUpdateManyMutationInput, NotificationUncheckedUpdateManyWithoutTransactionInput>
  }

  export type NotificationScalarWhereInput = {
    AND?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    OR?: NotificationScalarWhereInput[]
    NOT?: NotificationScalarWhereInput | NotificationScalarWhereInput[]
    id?: IntFilter<"Notification"> | number
    transactionId?: IntNullableFilter<"Notification"> | number | null
    targetRole?: StringFilter<"Notification"> | string
    senderRole?: StringFilter<"Notification"> | string
    senderName?: StringNullableFilter<"Notification"> | string | null
    statusPengiriman?: StringFilter<"Notification"> | string
    message?: StringFilter<"Notification"> | string
    isRead?: BoolFilter<"Notification"> | boolean
    hidden?: BoolFilter<"Notification"> | boolean
    createdAt?: DateTimeFilter<"Notification"> | Date | string
  }

  export type OrderRequestUpsertWithoutTransactionInput = {
    update: XOR<OrderRequestUpdateWithoutTransactionInput, OrderRequestUncheckedUpdateWithoutTransactionInput>
    create: XOR<OrderRequestCreateWithoutTransactionInput, OrderRequestUncheckedCreateWithoutTransactionInput>
    where?: OrderRequestWhereInput
  }

  export type OrderRequestUpdateToOneWithWhereWithoutTransactionInput = {
    where?: OrderRequestWhereInput
    data: XOR<OrderRequestUpdateWithoutTransactionInput, OrderRequestUncheckedUpdateWithoutTransactionInput>
  }

  export type OrderRequestUpdateWithoutTransactionInput = {
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderRequestItemUpdateManyWithoutOrderRequestNestedInput
    statusHistory?: OrderStatusHistoryUpdateManyWithoutOrderRequestNestedInput
  }

  export type OrderRequestUncheckedUpdateWithoutTransactionInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderRequestItemUncheckedUpdateManyWithoutOrderRequestNestedInput
    statusHistory?: OrderStatusHistoryUncheckedUpdateManyWithoutOrderRequestNestedInput
  }

  export type TransactionCreateWithoutItemsInput = {
    tanggal?: Date | string
    total_harga: number
    metode_pembayaran: string
    status?: string
    nama_pembeli?: string | null
    nama_kasir?: string | null
    status_pengiriman?: string
    nama_pengrajin?: string | null
    notifications?: NotificationCreateNestedManyWithoutTransactionInput
    orderRequest?: OrderRequestCreateNestedOneWithoutTransactionInput
  }

  export type TransactionUncheckedCreateWithoutItemsInput = {
    id?: number
    tanggal?: Date | string
    total_harga: number
    metode_pembayaran: string
    status?: string
    nama_pembeli?: string | null
    nama_kasir?: string | null
    status_pengiriman?: string
    nama_pengrajin?: string | null
    notifications?: NotificationUncheckedCreateNestedManyWithoutTransactionInput
    orderRequest?: OrderRequestUncheckedCreateNestedOneWithoutTransactionInput
  }

  export type TransactionCreateOrConnectWithoutItemsInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutItemsInput, TransactionUncheckedCreateWithoutItemsInput>
  }

  export type ProductCreateWithoutTransactionItemsInput = {
    nama_produk: string
    harga: number
    satuanHarga?: string
    stok: number
    barcode?: string | null
    gambar?: string | null
    gambarPosX?: number
    gambarPosY?: number
    isArchived?: boolean
    cartItems?: UserCartItemCreateNestedManyWithoutProductInput
    orderRequestItems?: OrderRequestItemCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutTransactionItemsInput = {
    id?: number
    nama_produk: string
    harga: number
    satuanHarga?: string
    stok: number
    barcode?: string | null
    gambar?: string | null
    gambarPosX?: number
    gambarPosY?: number
    isArchived?: boolean
    cartItems?: UserCartItemUncheckedCreateNestedManyWithoutProductInput
    orderRequestItems?: OrderRequestItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutTransactionItemsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutTransactionItemsInput, ProductUncheckedCreateWithoutTransactionItemsInput>
  }

  export type TransactionUpsertWithoutItemsInput = {
    update: XOR<TransactionUpdateWithoutItemsInput, TransactionUncheckedUpdateWithoutItemsInput>
    create: XOR<TransactionCreateWithoutItemsInput, TransactionUncheckedCreateWithoutItemsInput>
    where?: TransactionWhereInput
  }

  export type TransactionUpdateToOneWithWhereWithoutItemsInput = {
    where?: TransactionWhereInput
    data: XOR<TransactionUpdateWithoutItemsInput, TransactionUncheckedUpdateWithoutItemsInput>
  }

  export type TransactionUpdateWithoutItemsInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
    notifications?: NotificationUpdateManyWithoutTransactionNestedInput
    orderRequest?: OrderRequestUpdateOneWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateWithoutItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
    notifications?: NotificationUncheckedUpdateManyWithoutTransactionNestedInput
    orderRequest?: OrderRequestUncheckedUpdateOneWithoutTransactionNestedInput
  }

  export type ProductUpsertWithoutTransactionItemsInput = {
    update: XOR<ProductUpdateWithoutTransactionItemsInput, ProductUncheckedUpdateWithoutTransactionItemsInput>
    create: XOR<ProductCreateWithoutTransactionItemsInput, ProductUncheckedCreateWithoutTransactionItemsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutTransactionItemsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutTransactionItemsInput, ProductUncheckedUpdateWithoutTransactionItemsInput>
  }

  export type ProductUpdateWithoutTransactionItemsInput = {
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    cartItems?: UserCartItemUpdateManyWithoutProductNestedInput
    orderRequestItems?: OrderRequestItemUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutTransactionItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    cartItems?: UserCartItemUncheckedUpdateManyWithoutProductNestedInput
    orderRequestItems?: OrderRequestItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type TransactionCreateWithoutNotificationsInput = {
    tanggal?: Date | string
    total_harga: number
    metode_pembayaran: string
    status?: string
    nama_pembeli?: string | null
    nama_kasir?: string | null
    status_pengiriman?: string
    nama_pengrajin?: string | null
    items?: TransactionItemCreateNestedManyWithoutTransactionInput
    orderRequest?: OrderRequestCreateNestedOneWithoutTransactionInput
  }

  export type TransactionUncheckedCreateWithoutNotificationsInput = {
    id?: number
    tanggal?: Date | string
    total_harga: number
    metode_pembayaran: string
    status?: string
    nama_pembeli?: string | null
    nama_kasir?: string | null
    status_pengiriman?: string
    nama_pengrajin?: string | null
    items?: TransactionItemUncheckedCreateNestedManyWithoutTransactionInput
    orderRequest?: OrderRequestUncheckedCreateNestedOneWithoutTransactionInput
  }

  export type TransactionCreateOrConnectWithoutNotificationsInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutNotificationsInput, TransactionUncheckedCreateWithoutNotificationsInput>
  }

  export type TransactionUpsertWithoutNotificationsInput = {
    update: XOR<TransactionUpdateWithoutNotificationsInput, TransactionUncheckedUpdateWithoutNotificationsInput>
    create: XOR<TransactionCreateWithoutNotificationsInput, TransactionUncheckedCreateWithoutNotificationsInput>
    where?: TransactionWhereInput
  }

  export type TransactionUpdateToOneWithWhereWithoutNotificationsInput = {
    where?: TransactionWhereInput
    data: XOR<TransactionUpdateWithoutNotificationsInput, TransactionUncheckedUpdateWithoutNotificationsInput>
  }

  export type TransactionUpdateWithoutNotificationsInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
    items?: TransactionItemUpdateManyWithoutTransactionNestedInput
    orderRequest?: OrderRequestUpdateOneWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateWithoutNotificationsInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
    items?: TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput
    orderRequest?: OrderRequestUncheckedUpdateOneWithoutTransactionNestedInput
  }

  export type UserCreateWithoutCartsInput = {
    username: string
    fullName?: string
    profilePhoto?: string | null
    password: string
    role: string
  }

  export type UserUncheckedCreateWithoutCartsInput = {
    id?: number
    username: string
    fullName?: string
    profilePhoto?: string | null
    password: string
    role: string
  }

  export type UserCreateOrConnectWithoutCartsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutCartsInput, UserUncheckedCreateWithoutCartsInput>
  }

  export type UserCartItemCreateWithoutCartInput = {
    quantity: number
    priceOverride?: number | null
    satuanPesan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
    product: ProductCreateNestedOneWithoutCartItemsInput
  }

  export type UserCartItemUncheckedCreateWithoutCartInput = {
    id?: number
    productId: number
    quantity: number
    priceOverride?: number | null
    satuanPesan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCartItemCreateOrConnectWithoutCartInput = {
    where: UserCartItemWhereUniqueInput
    create: XOR<UserCartItemCreateWithoutCartInput, UserCartItemUncheckedCreateWithoutCartInput>
  }

  export type UserCartItemCreateManyCartInputEnvelope = {
    data: UserCartItemCreateManyCartInput | UserCartItemCreateManyCartInput[]
    skipDuplicates?: boolean
  }

  export type UserUpsertWithoutCartsInput = {
    update: XOR<UserUpdateWithoutCartsInput, UserUncheckedUpdateWithoutCartsInput>
    create: XOR<UserCreateWithoutCartsInput, UserUncheckedCreateWithoutCartsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutCartsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutCartsInput, UserUncheckedUpdateWithoutCartsInput>
  }

  export type UserUpdateWithoutCartsInput = {
    username?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    profilePhoto?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type UserUncheckedUpdateWithoutCartsInput = {
    id?: IntFieldUpdateOperationsInput | number
    username?: StringFieldUpdateOperationsInput | string
    fullName?: StringFieldUpdateOperationsInput | string
    profilePhoto?: NullableStringFieldUpdateOperationsInput | string | null
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
  }

  export type UserCartItemUpsertWithWhereUniqueWithoutCartInput = {
    where: UserCartItemWhereUniqueInput
    update: XOR<UserCartItemUpdateWithoutCartInput, UserCartItemUncheckedUpdateWithoutCartInput>
    create: XOR<UserCartItemCreateWithoutCartInput, UserCartItemUncheckedCreateWithoutCartInput>
  }

  export type UserCartItemUpdateWithWhereUniqueWithoutCartInput = {
    where: UserCartItemWhereUniqueInput
    data: XOR<UserCartItemUpdateWithoutCartInput, UserCartItemUncheckedUpdateWithoutCartInput>
  }

  export type UserCartItemUpdateManyWithWhereWithoutCartInput = {
    where: UserCartItemScalarWhereInput
    data: XOR<UserCartItemUpdateManyMutationInput, UserCartItemUncheckedUpdateManyWithoutCartInput>
  }

  export type UserCartCreateWithoutItemsInput = {
    scope?: string
    customerName?: string | null
    paymentMethod?: string | null
    sessionActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
    user: UserCreateNestedOneWithoutCartsInput
  }

  export type UserCartUncheckedCreateWithoutItemsInput = {
    id?: number
    userId: number
    scope?: string
    customerName?: string | null
    paymentMethod?: string | null
    sessionActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCartCreateOrConnectWithoutItemsInput = {
    where: UserCartWhereUniqueInput
    create: XOR<UserCartCreateWithoutItemsInput, UserCartUncheckedCreateWithoutItemsInput>
  }

  export type ProductCreateWithoutCartItemsInput = {
    nama_produk: string
    harga: number
    satuanHarga?: string
    stok: number
    barcode?: string | null
    gambar?: string | null
    gambarPosX?: number
    gambarPosY?: number
    isArchived?: boolean
    TransactionItems?: TransactionItemCreateNestedManyWithoutProductInput
    orderRequestItems?: OrderRequestItemCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutCartItemsInput = {
    id?: number
    nama_produk: string
    harga: number
    satuanHarga?: string
    stok: number
    barcode?: string | null
    gambar?: string | null
    gambarPosX?: number
    gambarPosY?: number
    isArchived?: boolean
    TransactionItems?: TransactionItemUncheckedCreateNestedManyWithoutProductInput
    orderRequestItems?: OrderRequestItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutCartItemsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutCartItemsInput, ProductUncheckedCreateWithoutCartItemsInput>
  }

  export type UserCartUpsertWithoutItemsInput = {
    update: XOR<UserCartUpdateWithoutItemsInput, UserCartUncheckedUpdateWithoutItemsInput>
    create: XOR<UserCartCreateWithoutItemsInput, UserCartUncheckedCreateWithoutItemsInput>
    where?: UserCartWhereInput
  }

  export type UserCartUpdateToOneWithWhereWithoutItemsInput = {
    where?: UserCartWhereInput
    data: XOR<UserCartUpdateWithoutItemsInput, UserCartUncheckedUpdateWithoutItemsInput>
  }

  export type UserCartUpdateWithoutItemsInput = {
    scope?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    paymentMethod?: NullableStringFieldUpdateOperationsInput | string | null
    sessionActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    user?: UserUpdateOneRequiredWithoutCartsNestedInput
  }

  export type UserCartUncheckedUpdateWithoutItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    userId?: IntFieldUpdateOperationsInput | number
    scope?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    paymentMethod?: NullableStringFieldUpdateOperationsInput | string | null
    sessionActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProductUpsertWithoutCartItemsInput = {
    update: XOR<ProductUpdateWithoutCartItemsInput, ProductUncheckedUpdateWithoutCartItemsInput>
    create: XOR<ProductCreateWithoutCartItemsInput, ProductUncheckedCreateWithoutCartItemsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutCartItemsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutCartItemsInput, ProductUncheckedUpdateWithoutCartItemsInput>
  }

  export type ProductUpdateWithoutCartItemsInput = {
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    TransactionItems?: TransactionItemUpdateManyWithoutProductNestedInput
    orderRequestItems?: OrderRequestItemUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutCartItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    TransactionItems?: TransactionItemUncheckedUpdateManyWithoutProductNestedInput
    orderRequestItems?: OrderRequestItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type TransactionCreateWithoutOrderRequestInput = {
    tanggal?: Date | string
    total_harga: number
    metode_pembayaran: string
    status?: string
    nama_pembeli?: string | null
    nama_kasir?: string | null
    status_pengiriman?: string
    nama_pengrajin?: string | null
    items?: TransactionItemCreateNestedManyWithoutTransactionInput
    notifications?: NotificationCreateNestedManyWithoutTransactionInput
  }

  export type TransactionUncheckedCreateWithoutOrderRequestInput = {
    id?: number
    tanggal?: Date | string
    total_harga: number
    metode_pembayaran: string
    status?: string
    nama_pembeli?: string | null
    nama_kasir?: string | null
    status_pengiriman?: string
    nama_pengrajin?: string | null
    items?: TransactionItemUncheckedCreateNestedManyWithoutTransactionInput
    notifications?: NotificationUncheckedCreateNestedManyWithoutTransactionInput
  }

  export type TransactionCreateOrConnectWithoutOrderRequestInput = {
    where: TransactionWhereUniqueInput
    create: XOR<TransactionCreateWithoutOrderRequestInput, TransactionUncheckedCreateWithoutOrderRequestInput>
  }

  export type OrderRequestItemCreateWithoutOrderRequestInput = {
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
    product: ProductCreateNestedOneWithoutOrderRequestItemsInput
  }

  export type OrderRequestItemUncheckedCreateWithoutOrderRequestInput = {
    id?: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }

  export type OrderRequestItemCreateOrConnectWithoutOrderRequestInput = {
    where: OrderRequestItemWhereUniqueInput
    create: XOR<OrderRequestItemCreateWithoutOrderRequestInput, OrderRequestItemUncheckedCreateWithoutOrderRequestInput>
  }

  export type OrderRequestItemCreateManyOrderRequestInputEnvelope = {
    data: OrderRequestItemCreateManyOrderRequestInput | OrderRequestItemCreateManyOrderRequestInput[]
    skipDuplicates?: boolean
  }

  export type OrderStatusHistoryCreateWithoutOrderRequestInput = {
    status: string
    description?: string | null
    createdAt?: Date | string
  }

  export type OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput = {
    id?: number
    status: string
    description?: string | null
    createdAt?: Date | string
  }

  export type OrderStatusHistoryCreateOrConnectWithoutOrderRequestInput = {
    where: OrderStatusHistoryWhereUniqueInput
    create: XOR<OrderStatusHistoryCreateWithoutOrderRequestInput, OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput>
  }

  export type OrderStatusHistoryCreateManyOrderRequestInputEnvelope = {
    data: OrderStatusHistoryCreateManyOrderRequestInput | OrderStatusHistoryCreateManyOrderRequestInput[]
    skipDuplicates?: boolean
  }

  export type TransactionUpsertWithoutOrderRequestInput = {
    update: XOR<TransactionUpdateWithoutOrderRequestInput, TransactionUncheckedUpdateWithoutOrderRequestInput>
    create: XOR<TransactionCreateWithoutOrderRequestInput, TransactionUncheckedCreateWithoutOrderRequestInput>
    where?: TransactionWhereInput
  }

  export type TransactionUpdateToOneWithWhereWithoutOrderRequestInput = {
    where?: TransactionWhereInput
    data: XOR<TransactionUpdateWithoutOrderRequestInput, TransactionUncheckedUpdateWithoutOrderRequestInput>
  }

  export type TransactionUpdateWithoutOrderRequestInput = {
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
    items?: TransactionItemUpdateManyWithoutTransactionNestedInput
    notifications?: NotificationUpdateManyWithoutTransactionNestedInput
  }

  export type TransactionUncheckedUpdateWithoutOrderRequestInput = {
    id?: IntFieldUpdateOperationsInput | number
    tanggal?: DateTimeFieldUpdateOperationsInput | Date | string
    total_harga?: IntFieldUpdateOperationsInput | number
    metode_pembayaran?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    nama_pembeli?: NullableStringFieldUpdateOperationsInput | string | null
    nama_kasir?: NullableStringFieldUpdateOperationsInput | string | null
    status_pengiriman?: StringFieldUpdateOperationsInput | string
    nama_pengrajin?: NullableStringFieldUpdateOperationsInput | string | null
    items?: TransactionItemUncheckedUpdateManyWithoutTransactionNestedInput
    notifications?: NotificationUncheckedUpdateManyWithoutTransactionNestedInput
  }

  export type OrderRequestItemUpsertWithWhereUniqueWithoutOrderRequestInput = {
    where: OrderRequestItemWhereUniqueInput
    update: XOR<OrderRequestItemUpdateWithoutOrderRequestInput, OrderRequestItemUncheckedUpdateWithoutOrderRequestInput>
    create: XOR<OrderRequestItemCreateWithoutOrderRequestInput, OrderRequestItemUncheckedCreateWithoutOrderRequestInput>
  }

  export type OrderRequestItemUpdateWithWhereUniqueWithoutOrderRequestInput = {
    where: OrderRequestItemWhereUniqueInput
    data: XOR<OrderRequestItemUpdateWithoutOrderRequestInput, OrderRequestItemUncheckedUpdateWithoutOrderRequestInput>
  }

  export type OrderRequestItemUpdateManyWithWhereWithoutOrderRequestInput = {
    where: OrderRequestItemScalarWhereInput
    data: XOR<OrderRequestItemUpdateManyMutationInput, OrderRequestItemUncheckedUpdateManyWithoutOrderRequestInput>
  }

  export type OrderStatusHistoryUpsertWithWhereUniqueWithoutOrderRequestInput = {
    where: OrderStatusHistoryWhereUniqueInput
    update: XOR<OrderStatusHistoryUpdateWithoutOrderRequestInput, OrderStatusHistoryUncheckedUpdateWithoutOrderRequestInput>
    create: XOR<OrderStatusHistoryCreateWithoutOrderRequestInput, OrderStatusHistoryUncheckedCreateWithoutOrderRequestInput>
  }

  export type OrderStatusHistoryUpdateWithWhereUniqueWithoutOrderRequestInput = {
    where: OrderStatusHistoryWhereUniqueInput
    data: XOR<OrderStatusHistoryUpdateWithoutOrderRequestInput, OrderStatusHistoryUncheckedUpdateWithoutOrderRequestInput>
  }

  export type OrderStatusHistoryUpdateManyWithWhereWithoutOrderRequestInput = {
    where: OrderStatusHistoryScalarWhereInput
    data: XOR<OrderStatusHistoryUpdateManyMutationInput, OrderStatusHistoryUncheckedUpdateManyWithoutOrderRequestInput>
  }

  export type OrderStatusHistoryScalarWhereInput = {
    AND?: OrderStatusHistoryScalarWhereInput | OrderStatusHistoryScalarWhereInput[]
    OR?: OrderStatusHistoryScalarWhereInput[]
    NOT?: OrderStatusHistoryScalarWhereInput | OrderStatusHistoryScalarWhereInput[]
    id?: IntFilter<"OrderStatusHistory"> | number
    orderRequestId?: IntFilter<"OrderStatusHistory"> | number
    status?: StringFilter<"OrderStatusHistory"> | string
    description?: StringNullableFilter<"OrderStatusHistory"> | string | null
    createdAt?: DateTimeFilter<"OrderStatusHistory"> | Date | string
  }

  export type OrderRequestCreateWithoutStatusHistoryInput = {
    code: string
    customerName: string
    phone: string
    status?: string
    rejectionReason?: string | null
    totalPrice: number
    createdAt?: Date | string
    updatedAt?: Date | string
    transaction?: TransactionCreateNestedOneWithoutOrderRequestInput
    items?: OrderRequestItemCreateNestedManyWithoutOrderRequestInput
  }

  export type OrderRequestUncheckedCreateWithoutStatusHistoryInput = {
    id?: number
    code: string
    customerName: string
    phone: string
    status?: string
    rejectionReason?: string | null
    totalPrice: number
    transactionId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    items?: OrderRequestItemUncheckedCreateNestedManyWithoutOrderRequestInput
  }

  export type OrderRequestCreateOrConnectWithoutStatusHistoryInput = {
    where: OrderRequestWhereUniqueInput
    create: XOR<OrderRequestCreateWithoutStatusHistoryInput, OrderRequestUncheckedCreateWithoutStatusHistoryInput>
  }

  export type OrderRequestUpsertWithoutStatusHistoryInput = {
    update: XOR<OrderRequestUpdateWithoutStatusHistoryInput, OrderRequestUncheckedUpdateWithoutStatusHistoryInput>
    create: XOR<OrderRequestCreateWithoutStatusHistoryInput, OrderRequestUncheckedCreateWithoutStatusHistoryInput>
    where?: OrderRequestWhereInput
  }

  export type OrderRequestUpdateToOneWithWhereWithoutStatusHistoryInput = {
    where?: OrderRequestWhereInput
    data: XOR<OrderRequestUpdateWithoutStatusHistoryInput, OrderRequestUncheckedUpdateWithoutStatusHistoryInput>
  }

  export type OrderRequestUpdateWithoutStatusHistoryInput = {
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transaction?: TransactionUpdateOneWithoutOrderRequestNestedInput
    items?: OrderRequestItemUpdateManyWithoutOrderRequestNestedInput
  }

  export type OrderRequestUncheckedUpdateWithoutStatusHistoryInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    transactionId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: OrderRequestItemUncheckedUpdateManyWithoutOrderRequestNestedInput
  }

  export type OrderRequestCreateWithoutItemsInput = {
    code: string
    customerName: string
    phone: string
    status?: string
    rejectionReason?: string | null
    totalPrice: number
    createdAt?: Date | string
    updatedAt?: Date | string
    transaction?: TransactionCreateNestedOneWithoutOrderRequestInput
    statusHistory?: OrderStatusHistoryCreateNestedManyWithoutOrderRequestInput
  }

  export type OrderRequestUncheckedCreateWithoutItemsInput = {
    id?: number
    code: string
    customerName: string
    phone: string
    status?: string
    rejectionReason?: string | null
    totalPrice: number
    transactionId?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    statusHistory?: OrderStatusHistoryUncheckedCreateNestedManyWithoutOrderRequestInput
  }

  export type OrderRequestCreateOrConnectWithoutItemsInput = {
    where: OrderRequestWhereUniqueInput
    create: XOR<OrderRequestCreateWithoutItemsInput, OrderRequestUncheckedCreateWithoutItemsInput>
  }

  export type ProductCreateWithoutOrderRequestItemsInput = {
    nama_produk: string
    harga: number
    satuanHarga?: string
    stok: number
    barcode?: string | null
    gambar?: string | null
    gambarPosX?: number
    gambarPosY?: number
    isArchived?: boolean
    TransactionItems?: TransactionItemCreateNestedManyWithoutProductInput
    cartItems?: UserCartItemCreateNestedManyWithoutProductInput
  }

  export type ProductUncheckedCreateWithoutOrderRequestItemsInput = {
    id?: number
    nama_produk: string
    harga: number
    satuanHarga?: string
    stok: number
    barcode?: string | null
    gambar?: string | null
    gambarPosX?: number
    gambarPosY?: number
    isArchived?: boolean
    TransactionItems?: TransactionItemUncheckedCreateNestedManyWithoutProductInput
    cartItems?: UserCartItemUncheckedCreateNestedManyWithoutProductInput
  }

  export type ProductCreateOrConnectWithoutOrderRequestItemsInput = {
    where: ProductWhereUniqueInput
    create: XOR<ProductCreateWithoutOrderRequestItemsInput, ProductUncheckedCreateWithoutOrderRequestItemsInput>
  }

  export type OrderRequestUpsertWithoutItemsInput = {
    update: XOR<OrderRequestUpdateWithoutItemsInput, OrderRequestUncheckedUpdateWithoutItemsInput>
    create: XOR<OrderRequestCreateWithoutItemsInput, OrderRequestUncheckedCreateWithoutItemsInput>
    where?: OrderRequestWhereInput
  }

  export type OrderRequestUpdateToOneWithWhereWithoutItemsInput = {
    where?: OrderRequestWhereInput
    data: XOR<OrderRequestUpdateWithoutItemsInput, OrderRequestUncheckedUpdateWithoutItemsInput>
  }

  export type OrderRequestUpdateWithoutItemsInput = {
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    transaction?: TransactionUpdateOneWithoutOrderRequestNestedInput
    statusHistory?: OrderStatusHistoryUpdateManyWithoutOrderRequestNestedInput
  }

  export type OrderRequestUncheckedUpdateWithoutItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    code?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    phone?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    rejectionReason?: NullableStringFieldUpdateOperationsInput | string | null
    totalPrice?: IntFieldUpdateOperationsInput | number
    transactionId?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    statusHistory?: OrderStatusHistoryUncheckedUpdateManyWithoutOrderRequestNestedInput
  }

  export type ProductUpsertWithoutOrderRequestItemsInput = {
    update: XOR<ProductUpdateWithoutOrderRequestItemsInput, ProductUncheckedUpdateWithoutOrderRequestItemsInput>
    create: XOR<ProductCreateWithoutOrderRequestItemsInput, ProductUncheckedCreateWithoutOrderRequestItemsInput>
    where?: ProductWhereInput
  }

  export type ProductUpdateToOneWithWhereWithoutOrderRequestItemsInput = {
    where?: ProductWhereInput
    data: XOR<ProductUpdateWithoutOrderRequestItemsInput, ProductUncheckedUpdateWithoutOrderRequestItemsInput>
  }

  export type ProductUpdateWithoutOrderRequestItemsInput = {
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    TransactionItems?: TransactionItemUpdateManyWithoutProductNestedInput
    cartItems?: UserCartItemUpdateManyWithoutProductNestedInput
  }

  export type ProductUncheckedUpdateWithoutOrderRequestItemsInput = {
    id?: IntFieldUpdateOperationsInput | number
    nama_produk?: StringFieldUpdateOperationsInput | string
    harga?: IntFieldUpdateOperationsInput | number
    satuanHarga?: StringFieldUpdateOperationsInput | string
    stok?: IntFieldUpdateOperationsInput | number
    barcode?: NullableStringFieldUpdateOperationsInput | string | null
    gambar?: NullableStringFieldUpdateOperationsInput | string | null
    gambarPosX?: IntFieldUpdateOperationsInput | number
    gambarPosY?: IntFieldUpdateOperationsInput | number
    isArchived?: BoolFieldUpdateOperationsInput | boolean
    TransactionItems?: TransactionItemUncheckedUpdateManyWithoutProductNestedInput
    cartItems?: UserCartItemUncheckedUpdateManyWithoutProductNestedInput
  }

  export type UserCartCreateManyUserInput = {
    id?: number
    scope?: string
    customerName?: string | null
    paymentMethod?: string | null
    sessionActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCartUpdateWithoutUserInput = {
    scope?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    paymentMethod?: NullableStringFieldUpdateOperationsInput | string | null
    sessionActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserCartItemUpdateManyWithoutCartNestedInput
  }

  export type UserCartUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    scope?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    paymentMethod?: NullableStringFieldUpdateOperationsInput | string | null
    sessionActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserCartItemUncheckedUpdateManyWithoutCartNestedInput
  }

  export type UserCartUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    scope?: StringFieldUpdateOperationsInput | string
    customerName?: NullableStringFieldUpdateOperationsInput | string | null
    paymentMethod?: NullableStringFieldUpdateOperationsInput | string | null
    sessionActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TransactionItemCreateManyProductInput = {
    id?: number
    transactionId: number
    jumlah: number
    subtotal: number
  }

  export type UserCartItemCreateManyProductInput = {
    id?: number
    cartId: number
    quantity: number
    priceOverride?: number | null
    satuanPesan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type OrderRequestItemCreateManyProductInput = {
    id?: number
    orderRequestId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }

  export type TransactionItemUpdateWithoutProductInput = {
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
    transaction?: TransactionUpdateOneRequiredWithoutItemsNestedInput
  }

  export type TransactionItemUncheckedUpdateWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    transactionId?: IntFieldUpdateOperationsInput | number
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionItemUncheckedUpdateManyWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    transactionId?: IntFieldUpdateOperationsInput | number
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type UserCartItemUpdateWithoutProductInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    cart?: UserCartUpdateOneRequiredWithoutItemsNestedInput
  }

  export type UserCartItemUncheckedUpdateWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    cartId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCartItemUncheckedUpdateManyWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    cartId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderRequestItemUpdateWithoutProductInput = {
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
    orderRequest?: OrderRequestUpdateOneRequiredWithoutItemsNestedInput
  }

  export type OrderRequestItemUncheckedUpdateWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderRequestId?: IntFieldUpdateOperationsInput | number
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type OrderRequestItemUncheckedUpdateManyWithoutProductInput = {
    id?: IntFieldUpdateOperationsInput | number
    orderRequestId?: IntFieldUpdateOperationsInput | number
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionItemCreateManyTransactionInput = {
    id?: number
    productId: number
    jumlah: number
    subtotal: number
  }

  export type NotificationCreateManyTransactionInput = {
    id?: number
    targetRole: string
    senderRole: string
    senderName?: string | null
    statusPengiriman: string
    message: string
    isRead?: boolean
    hidden?: boolean
    createdAt?: Date | string
  }

  export type TransactionItemUpdateWithoutTransactionInput = {
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
    product?: ProductUpdateOneRequiredWithoutTransactionItemsNestedInput
  }

  export type TransactionItemUncheckedUpdateWithoutTransactionInput = {
    id?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type TransactionItemUncheckedUpdateManyWithoutTransactionInput = {
    id?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    jumlah?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type NotificationUpdateWithoutTransactionInput = {
    targetRole?: StringFieldUpdateOperationsInput | string
    senderRole?: StringFieldUpdateOperationsInput | string
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    statusPengiriman?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hidden?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateWithoutTransactionInput = {
    id?: IntFieldUpdateOperationsInput | number
    targetRole?: StringFieldUpdateOperationsInput | string
    senderRole?: StringFieldUpdateOperationsInput | string
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    statusPengiriman?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hidden?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type NotificationUncheckedUpdateManyWithoutTransactionInput = {
    id?: IntFieldUpdateOperationsInput | number
    targetRole?: StringFieldUpdateOperationsInput | string
    senderRole?: StringFieldUpdateOperationsInput | string
    senderName?: NullableStringFieldUpdateOperationsInput | string | null
    statusPengiriman?: StringFieldUpdateOperationsInput | string
    message?: StringFieldUpdateOperationsInput | string
    isRead?: BoolFieldUpdateOperationsInput | boolean
    hidden?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCartItemCreateManyCartInput = {
    id?: number
    productId: number
    quantity: number
    priceOverride?: number | null
    satuanPesan?: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type UserCartItemUpdateWithoutCartInput = {
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    product?: ProductUpdateOneRequiredWithoutCartItemsNestedInput
  }

  export type UserCartItemUncheckedUpdateWithoutCartInput = {
    id?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCartItemUncheckedUpdateManyWithoutCartInput = {
    id?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    priceOverride?: NullableIntFieldUpdateOperationsInput | number | null
    satuanPesan?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderRequestItemCreateManyOrderRequestInput = {
    id?: number
    productId: number
    productName: string
    quantity: number
    unitPrice: number
    subtotal: number
  }

  export type OrderStatusHistoryCreateManyOrderRequestInput = {
    id?: number
    status: string
    description?: string | null
    createdAt?: Date | string
  }

  export type OrderRequestItemUpdateWithoutOrderRequestInput = {
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
    product?: ProductUpdateOneRequiredWithoutOrderRequestItemsNestedInput
  }

  export type OrderRequestItemUncheckedUpdateWithoutOrderRequestInput = {
    id?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type OrderRequestItemUncheckedUpdateManyWithoutOrderRequestInput = {
    id?: IntFieldUpdateOperationsInput | number
    productId?: IntFieldUpdateOperationsInput | number
    productName?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    unitPrice?: IntFieldUpdateOperationsInput | number
    subtotal?: IntFieldUpdateOperationsInput | number
  }

  export type OrderStatusHistoryUpdateWithoutOrderRequestInput = {
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderStatusHistoryUncheckedUpdateWithoutOrderRequestInput = {
    id?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type OrderStatusHistoryUncheckedUpdateManyWithoutOrderRequestInput = {
    id?: IntFieldUpdateOperationsInput | number
    status?: StringFieldUpdateOperationsInput | string
    description?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
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