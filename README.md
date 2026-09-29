# GREEN-API Chat

Простой веб-интерфейс для отправки и получения текстовых сообщений через
[GREEN-API](https://green-api.com/), выполнен как тестовое задание на позицию
Frontend-разработчик React.

Интерфейс не хранит и не обрабатывает ничего, кроме текста: без файлов,
групп и прочих функций — согласно условиям задания.

## Стек

- React 18 + TypeScript (strict mode)
- Vite
- Без сторонних UI/state-библиотек: состояние чатов — React Context + `useReducer`,
  весь HTTP-слой изолирован в `src/api/greenApi.ts`

## Как это работает

- **Отправка** — [`SendMessage`](https://green-api.com/docs/api/sending/SendMessage/):
  POST-запрос с `chatId` и `message`.
- **Получение** — [`technology-http-api`](https://green-api.com/docs/api/receiving/technology-http-api/):
  клиент в цикле опрашивает `ReceiveNotification`, и для каждого пришедшего
  уведомления вызывает `DeleteNotification`, подтверждая обработку. Цикл
  реализован в `src/hooks/useNotificationPolling.ts`.

## Локальный запуск

1. Зарегистрируйтесь на [green-api.com](https://green-api.com/), создайте
   инстанс и авторизуйте его (отсканируйте QR).
2. В настройках инстанса включите:
   - Получать уведомления о входящих сообщениях (`incomingWebhook`)
   - Получать уведомления о сообщениях, отправленных через API (`outgoingWebhook`)
3. Скопируйте `.env.example` в `.env` и при необходимости поправьте
   `VITE_GREEN_API_URL` (обычно менять не нужно).
4. Установите зависимости и запустите:

   ```bash
   npm install
   npm run dev
   ```

5. Откройте `http://localhost:5173`, введите `idInstance` и
   `apiTokenInstance` из личного кабинета GREEN-API.
6. Добавьте чат по номеру телефона получателя (в международном формате,
   без `+`) и отправьте сообщение.

## Структура проекта

```
src/
  api/greenApi.ts        — весь HTTP-слой к GREEN-API
  hooks/useNotificationPolling.ts — цикл ReceiveNotification/DeleteNotification
  context/ChatContext.tsx — состояние чатов (Context + reducer)
  components/             — UI: LoginScreen, Sidebar, ChatWindow, MessageInput, MessageBubble
  types/                  — общие типы
```

## Известные ограничения

- Учётные данные инстанса живут только в памяти вкладки (не сохраняются),
  для тестового задания это осознанный выбор в пользу простоты.
- Поллинг идёт напрямую из браузера, поэтому `apiTokenInstance` виден в
  сетевых запросах со стороны клиента. Для продакшена его стоит вынести за
  простой бэкенд-прокси.
