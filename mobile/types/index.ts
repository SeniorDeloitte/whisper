export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface MessageSender {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface Message {
  id: string;
  chat: string;
  sender: MessageSender | string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatLastMessage {
  id: string;
  text: string;
  sender: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  participant: MessageSender;
  lastMessage: ChatLastMessage | null;
  lastMessageAt: string;
  createdAt: string;
}
