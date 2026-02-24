import { Session } from "./session";

type EventHandler = (payload: any) => void;

class RealtimeClient {
  private static instance: RealtimeClient;
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private pendingQueue: string[] = [];
  private isConnecting = false;

  private constructor() {}

  static getInstance() {
    return (this.instance ??= new RealtimeClient());
  }

  subscribe(event: string, callback: EventHandler): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);

    return () => {
      const set = this.listeners.get(event);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.listeners.delete(event);
      }
    };
  }

  emit(event: string, payload: any = {}) {
    const message = JSON.stringify({ type: event, payload });

    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
    } else {
      console.warn("WS: Not connected, queuing message", event);
      this.pendingQueue.push(message);
      this.connect();
    }
  }

  connect() {
    if (this.socket || this.isConnecting) return;
    this.isConnecting = true;

    Session.getAccessToken().then((token) => {
      if (!token) return;

      const host = import.meta.env.VITE_WS_HOST || "core:5002/ws";
      const protocol = window.location.protocol === "https:" ? "wss" : "ws";
      const url = `${protocol}://${host.replace(/^https?:\/\//, "")}?token=${token}`;

      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log("WS: Connected");
        this.isConnecting = false;
        while (this.pendingQueue.length > 0)
          this.socket?.send(this.pendingQueue.shift()!);
      };

      this.socket.onmessage = (ev) => {
        try {
          const data = JSON.parse(ev.data);
          const { type, payload } = data;

          const handlers = this.listeners.get(type);
          if (handlers) handlers.forEach((handler) => handler(payload));
        } catch (e) {
          console.error("WS: Parse error", e);
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
        this.isConnecting = false;
        setTimeout(() => this.connect(), 3000);
      };
    });
  }
}

export const RTClient = RealtimeClient.getInstance();
