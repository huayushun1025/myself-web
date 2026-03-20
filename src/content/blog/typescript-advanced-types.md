---
title: "TypeScript 高级类型技巧：打造类型安全的应用"
description: "深入探索 TypeScript 高级类型用法，包括泛型、条件类型、映射类型等，帮助你构建更健壮的应用程序。"
pubDate: 2026-03-05
heroImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop"
tags: ["TypeScript", "类型系统", "前端工程化"]
---

## 引言

TypeScript 已经成为现代前端开发的标配。然而，很多人只用了它的皮毛——只是添加类型注解，而没有充分利用其强大的类型系统。本文将带你深入探索 TypeScript 高级类型技巧。

## 泛型约束

### 基本用法

```typescript
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const user = { name: "Alice", age: 30 };
const name = getProperty(user, "name");  // string
const age = getProperty(user, "age");   // number
// getProperty(user, "email");  // Error: 不存在此属性
```

### 多重约束

```typescript
interface HasName {
  name: string;
}

interface HasAge {
  age: number;
}

function greet<T extends HasName & HasAge>(obj: T): string {
  return `Hello, ${obj.name}! You are ${obj.age} years old.`;
}
```

## 条件类型

### 基本语法

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<"hello">;  // true
type B = IsString<42>;       // false
```

### 提取类型

```typescript
type ExtractArrayType<T> = T extends (infer U)[] ? U : never;

type NumArray = number[];
type StrArray = string[];

type A = ExtractArrayType<NumArray>;  // number
type B = ExtractArrayType<StrArray>;   // string
```

### 实际应用：API 响应类型

```typescript
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type SuccessResponse<T> = ApiResponse<T> & { success: true };
type ErrorResponse = ApiResponse<never> & { success: false; error: string };

type ApiResult<T> = SuccessResponse<T> | ErrorResponse;

// 使用示例
function handleResult<T>(result: ApiResult<T>): T | null {
  if (result.success) {
    return result.data;
  }
  return null;
}
```

## 映射类型

### 基本用法

```typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

// 组合使用
type ReadonlyPartial<T> = {
  readonly [P in keyof T]?: T[P];
};
```

### 高级映射

```typescript
// 将所有属性转为可选，并添加默认值
type WithDefaults<T, Defaults> = {
  [P in keyof T]?: T[P];
} & Defaults;

// 示例：表单默认值
type FormConfig = WithDefaults<
  { username: string; password: string },
  { rememberMe: true; theme: "light" }
>;
```

## 模板字面量类型

### 基础语法

```typescript
type EventName = `on${Capitalize<string>}`;
type CSSUnit = `${number}${"px" | "em" | "rem" | "%"}`;
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
```

### 实战：类型安全的路由

```typescript
type ExtractParams<T extends string> =
  T extends `${infer _Start}:${infer Param}/${infer Rest}`
    ? Param | ExtractParams<`/${Rest}`>
    : T extends `${infer _Start}:${infer Param}`
    ? Param
    : never;

type ParamsOf<T extends string> = {
  [K in ExtractParams<T>]: string;
};

type Route<T extends string> = {
  path: T;
  params: ParamsOf<T>;
};

function createRoute<T extends string>(
  path: T,
  params: ParamsOf<T>
): Route<T> {
  return { path, params };
}

// 使用示例
const route = createRoute("/users/:userId/posts/:postId", {
  userId: "123",
  postId: "456",
});

// route.params.userId = "123"
// route.params.postId = "456"
```

## 工具类型库

TypeScript 内置了许多实用的工具类型：

### Required

```typescript
type Required<T> = {
  [P in keyof T]-?: T[P];
};
```

### NonNullable

```typescript
type NonNullable<T> = T extends null | undefined ? never : T;
```

### ReturnType

```typescript
type ReturnType<T extends (...args: any) => any> =
  T extends (...args: any) => infer R ? R : any;
```

## 性能考虑

高级类型会导致类型计算开销：

```typescript
// ⚠️ 复杂类型可能导致编译缓慢
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

// ✅ 更好的做法：限制递归深度
type DeepReadonly<T, Depth extends number = 5> = Depth extends 0
  ? T
  : {
      readonly [P in keyof T]: T[P] extends object
        ? DeepReadonly<T[P], Prev[Depth]>
        : T[P];
    };
```

## 最佳实践

1. **类型优先** - 优先设计类型，再实现逻辑
2. **渐进式** - 从简单类型开始，逐步增加复杂度
3. **文档化** - 为复杂类型添加注释
4. **测试** - 使用 Type-Fest 等库验证类型正确性

## 总结

TypeScript 的类型系统是一个强大的工具，掌握高级类型技巧可以让你：

- 提前发现 bug
- 提升代码可维护性
- 提供更好的 IDE 支持
- 构建更健壮的应用

希望本文对你有所帮助，欢迎在评论区分享你的 TypeScript 类型技巧！
