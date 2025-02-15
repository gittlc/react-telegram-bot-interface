import { useState, useEffect } from "react";
import { Bot } from "grammy";
import type { Messages, Chat, BotData } from "./types";
import { showNotification } from "./util";

export default function useTelegramBot(
  botToken: string,
  saveHistory: boolean = true
) {
  const [messages, setMessages] = useState<Messages>({});
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<string>("");
  const bot = new Bot(botToken);

  const saveBotData = () => {
    const data: BotData = {
      messages,
      chats,
      currentChat,
    };
    localStorage.setItem(`bot_${botToken}`, JSON.stringify(data));
  };

  useEffect(() => {
    bot.on("message", async (ctx) => {
      localStorage.setItem("context", JSON.stringify(ctx));
      let message = {
        ...ctx.message,
        notification: true, // Mark message as notification
      };
      const chatId = ctx.chat.id.toString();
      const chatName = ctx.chat.title || ctx.chat.first_name || chatId;

      if (!messages[chatId]) {
        messages[chatId] = [];
      }
      messages[chatId] = [...messages[chatId], message];
      saveBotData();

      const existingChat = chats.find((chat) => chat.id === chatId);
      if (!existingChat) {
        setChats([
          ...chats,
          {
            id: chatId,
            name: chatName,
            unread: chatId !== currentChat ? 1 : 0,
            hasNotification: chatId !== currentChat, // Add notification flag
          },
        ]);
      } else if (chatId !== currentChat) {
        setChats(
          chats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  unread: (chat.unread || 0) + 1,
                  hasNotification: true,
                }
              : chat
          )
        );
      }
      saveBotData();

      if (!currentChat) {
        setCurrentChat(chatId);
        saveBotData();
      }

      if (chatId !== currentChat) {
        showNotification(chatName, message.text || "");
      }
    });

    bot.start();

    return () => {
      bot.stop();
    };
  });
  return {
    messages,
    chats,
    currentChat,
    setCurrentChat,
    bot,
  };
}
