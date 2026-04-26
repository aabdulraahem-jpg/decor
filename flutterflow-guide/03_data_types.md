# 03 — Custom Data Types و Enums

> أنشئ كل نوع تحت `Build → Custom Data Types → Add` وكل Enum تحت `Build → Custom Enums → Add`.
> الأنواع مطابقة لـ `backend/prisma/schema.prisma`.

## كيفية الإدخال

### Custom Data Type:
1. `Build → Custom Data Types → + Add Data Type`.
2. أدخل الاسم (camelCase أو PascalCase حسب المعتاد لديك — هنا نستخدم PascalCase).
3. لكل حقل: `Add Field` → اسم الحقل + النوع + (Required/Optional).
4. للحقول من نوع List: اختر `Toggle List`.
5. للحقول من نوع Custom Enum: اختر `Enum` ثم اختر الـ Enum من القائمة.

### Custom Enum:
1. `Build → Custom Enums → + Add Enum`.
2. أدخل الاسم.
3. أضف القيم واحدة واحدة (UPPER_SNAKE_CASE).

---

## Enums

أنشئ هذه الـ Enums **قبل** الـ Data Types لأن بعض الحقول تعتمد عليها.

### `AuthProvider`
| القيمة |
|---|
| `LOCAL` |
| `GOOGLE` |
| `APPLE` |

### `UserRole`
| القيمة |
|---|
| `USER` |
| `ADMIN` |

### `RoomType`
| القيمة | الترجمة |
|---|---|
| `MAJLIS` | مجلس |
| `BEDROOM` | غرفة نوم |
| `KITCHEN` | مطبخ |
| `BATHROOM` | حمام |
| `LIVING_ROOM` | صالة |
| `DINING_ROOM` | غرفة طعام |
| `OFFICE` | مكتب |
| `ENTRYWAY` | مدخل |

### `Style`
| القيمة | الترجمة |
|---|---|
| `MODERN` | حديث |
| `CLASSIC` | كلاسيكي |
| `MINIMAL` | بسيط |
| `ARABIC_CONTEMPORARY` | عربي معاصر |
| `INDUSTRIAL` | صناعي |
| `BOHEMIAN` | بوهيمي |
| `SCANDINAVIAN` | اسكندنافي |

### `TransactionStatus`
| القيمة |
|---|
| `PENDING` |
| `SUCCESS` |
| `FAILED` |
| `REFUNDED` |

### `PaymentMethod`
| القيمة |
|---|
| `VISA` |
| `MASTERCARD` |
| `MADA` |
| `APPLE_PAY` |
| `GOOGLE_PAY` |
| `STC_PAY` |

### `ApiProvider`
| القيمة |
|---|
| `OPENAI` |
| `APS` |

---

## Custom Data Types

### `User`

| Field | Type | Required |
|---|---|---|
| `id` | String | yes |
| `email` | String | yes |
| `name` | String | no |
| `phoneNumber` | String | no |
| `authProvider` | AuthProvider (Enum) | yes |
| `pointsBalance` | Integer | yes |
| `role` | UserRole (Enum) | yes |
| `avatarUrl` | String | no |
| `emailVerified` | Boolean | yes |
| `phoneVerified` | Boolean | yes |
| `createdAt` | DateTime | yes |

### `AuthTokens`
> **Persisted:** نعم — يُخزَّن في App State كحقل مُستديم.

| Field | Type | Required |
|---|---|---|
| `accessToken` | String | yes |
| `refreshToken` | String | yes |
| `expiresAt` | DateTime | yes |

### `Project`

| Field | Type | Required |
|---|---|---|
| `id` | String | yes |
| `userId` | String | yes |
| `name` | String | yes |
| `roomType` | RoomType (Enum) | yes |
| `originalImageUrl` | String | yes |
| `createdAt` | DateTime | yes |
| `designsCount` | Integer | no |

### `Design`

| Field | Type | Required | ملاحظات |
|---|---|---|---|
| `id` | String | yes | |
| `projectId` | String | yes | |
| `generatedImageUrl` | String | yes | |
| `promptUsed` | String | yes | |
| `parametersJson` | String | yes | JSON مُتسلسل (كـ نص). فُكّ تسلسله عند الحاجة بـ Custom Function. |
| `modelUsed` | String | yes | اسم نموذج AI المُستخدم |
| `pointsConsumed` | Integer | yes | |
| `createdAt` | DateTime | yes | |

### `FurnitureItem`

| Field | Type | Required |
|---|---|---|
| `id` | String | yes |
| `name` | String | yes |
| `description` | String | yes |
| `imageUrl` | String | yes |
| `category` | String | yes |
| `styleTags` | List\<String\> | yes |

### `DecorElement`
> نفس بنية `FurnitureItem`.

| Field | Type | Required |
|---|---|---|
| `id` | String | yes |
| `name` | String | yes |
| `description` | String | yes |
| `imageUrl` | String | yes |
| `category` | String | yes |
| `styleTags` | List\<String\> | yes |

### `TileOption`
> نفس بنية `FurnitureItem` + خاصية textureUrl.

| Field | Type | Required |
|---|---|---|
| `id` | String | yes |
| `name` | String | yes |
| `description` | String | yes |
| `imageUrl` | String | yes |
| `category` | String | yes |
| `styleTags` | List\<String\> | yes |
| `textureUrl` | String | no |

### `WallOption`
> مماثل + finishType.

| Field | Type | Required | القيم |
|---|---|---|---|
| `id` | String | yes | |
| `name` | String | yes | |
| `description` | String | yes | |
| `imageUrl` | String | yes | |
| `category` | String | yes | |
| `styleTags` | List\<String\> | yes | |
| `finishType` | String | yes | `paint` / `wallpaper` / `wood` |

### `ColorPalette`

| Field | Type | Required |
|---|---|---|
| `id` | String | yes |
| `name` | String | yes |
| `colorsList` | List\<String\> | yes |

> `colorsList` يحتوي رموز HEX مثل `["#C9A876", "#1A1F2E", "#E8DCC4"]`.

### `Package`

| Field | Type | Required |
|---|---|---|
| `id` | String | yes |
| `name` | String | yes |
| `pointsAmount` | Integer | yes |
| `priceSar` | Double | yes |
| `profitMarginPercent` | Double | no |
| `isActive` | Boolean | yes |
| `sortOrder` | Integer | yes |

### `Transaction`

| Field | Type | Required |
|---|---|---|
| `id` | String | yes |
| `userId` | String | yes |
| `packageId` | String | yes |
| `amountPaid` | Double | yes |
| `pointsAdded` | Integer | yes |
| `status` | TransactionStatus (Enum) | yes |
| `apsTransactionId` | String | no |
| `paymentMethod` | PaymentMethod (Enum) | no |
| `createdAt` | DateTime | yes |

### `ApiSetting`
> للأدمن فقط.

| Field | Type | Required |
|---|---|---|
| `id` | String | yes |
| `provider` | ApiProvider (Enum) | yes |
| `modelName` | String | no |
| `isActive` | Boolean | yes |
| `configJson` | String | no |

---

## ملاحظات

- **JSON كنص:** FlutterFlow لا يدعم نوع `Json` مباشرةً، لذلك حقول مثل `parametersJson` و `configJson` مُعرَّفة كـ String. استعمل Custom Functions للتحويل من/إلى Map.
- **List\<String\>:** في FlutterFlow اختر النوع الأساسي ثم فعّل `List`.
- **Enums كـ String في API:** الـ API يُعيد قيم Enum كنصوص (`"MODERN"`)، فعند ربط API Response بـ Custom Data Type قد تحتاج Custom Function `stringToEnum` لتحويلها — أو احفظ القيمة كـ String داخل DataType بدلاً من Enum إن واجهت صعوبة في الربط المباشر.

## الخطوة التالية

[`04_app_state_variables.md`](./04_app_state_variables.md) — متغيّرات App State.
