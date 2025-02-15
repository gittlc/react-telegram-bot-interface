import { BotData } from "./types";

export const getBotData = (token: string): BotData => {
  const data = localStorage.getItem(`bot_${token}`);
  return data ? JSON.parse(data) : { messages: {}, chats: [], currentChat: "" };
};

export const showNotification = (title: string, body: string) => {
  if (Notification.permission === "granted") {
    new Notification(title, { body });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, { body });
      }
    });
  }
};
