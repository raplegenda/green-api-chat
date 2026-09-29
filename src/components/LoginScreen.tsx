import { useState, type FormEvent } from "react";
import { getInstanceState } from "../api/greenApi";
import type { InstanceCredentials } from "../types";

interface Props {
  onSuccess: (credentials: InstanceCredentials) => void;
}

export function LoginScreen({ onSuccess }: Props) {
  const [idInstance, setIdInstance] = useState("");
  const [apiTokenInstance, setApiTokenInstance] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!idInstance.trim() || !apiTokenInstance.trim()) {
      setError("Заполните оба поля.");
      return;
    }

    const credentials: InstanceCredentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    };

    setChecking(true);
    try {
      const { stateInstance } = await getInstanceState(credentials);
      if (stateInstance !== "authorized") {
        setError(
          `Инстанс не авторизован (статус: ${stateInstance}). Отсканируйте QR-код в личном кабинете GREEN-API.`,
        );
        return;
      }
      onSuccess(credentials);
    } catch {
      setError("Не удалось подключиться. Проверьте idInstance и apiTokenInstance.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Вход в чат</h1>
        <p className="login-hint">Данные инстанса указаны в личном кабинете green-api.com</p>

        <label className="field">
          <span>ID Instance</span>
          <input
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            placeholder="1101000001"
            autoComplete="off"
          />
        </label>

        <label className="field">
          <span>API Token Instance</span>
          <input
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            placeholder="d0d0...token"
            type="password"
            autoComplete="off"
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={checking}>
          {checking ? "Проверка…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
