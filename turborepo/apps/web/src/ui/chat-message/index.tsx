"use client";

import type { Message } from "@/types/ui";
import type { User } from "next-auth";
import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { processMarkdownToReact } from "@/lib/processor";
import { cn } from "@/lib/utils";
import { AnimatedCopyButton } from "@/ui/atoms/animated-copy-button";
import { motion } from "motion/react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Bot,
  Button,
  Check,
  PenLine,
  Textarea,
  User as UserIcon,
  X
} from "@t3-chat-clone/ui";

interface ChatMessageProps {
  message: Message;
  onUpdateMessage?: (messageId: string, newText: string) => void;
  className?: string;
  user?: User;
}

export function ChatMessage({
  message,
  onUpdateMessage,
  className,
  user
}: ChatMessageProps) {
  const isUser = message.sender === "user";
  const [renderedContent, setRenderedContent] = useState<ReactNode>(
    typeof message.text === "string"
      ? message.text.substring(0, 50) + "..."
      : "Loading content..."
  );
  const [isEditing, setIsEditing] = useState(message.isEditing ?? false);

  const messageMemo = useMemo(() => {
    const ogText = message.originalText;
    const textRevision = message.text;

    return typeof ogText === "string"
      ? ogText
      : typeof textRevision === "string"
        ? textRevision
        : "";
  }, [message.originalText, message.text]);

  const [editText, setEditText] = useState(messageMemo);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof message.text === "string") {
      let isMounted = true;
      processMarkdownToReact(message.text)
        .then(content => {
          if (isMounted) setRenderedContent(content);
        })
        .catch(error => {
          console.error("Error processing markdown:", error);
          if (isMounted) setRenderedContent("Error displaying content.");
        });
      return () => {
        isMounted = false;
      };
    } else {
      setRenderedContent(message.text);
    }
  }, [message.text]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      messageRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditText(
      message.originalText ??
        (typeof message.text === "string" ? message.text : "")
    );
    setIsEditing(true);
  };

  const handleCancelEdit = () => setIsEditing(false);

  const handleSaveEdit = () => {
    if (
      onUpdateMessage &&
      editText.trim() !== (message.originalText ?? message.text)
    ) {
      onUpdateMessage(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={messageRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        `group relative flex items-start space-x-2 py-3 sm:space-x-3`, // Ensure group class is here
        isUser ? "justify-end" : "",
        className
      )}>
      {!isUser && (
        <>
          <Avatar className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
            {message.avatar ? (
              <AvatarImage
                src={message.avatar ?? "/placeholder.svg"}
                alt="AI Avatar"
              />
            ) : (
              <AvatarFallback>
                <Bot className="size-4" />
              </AvatarFallback>
            )}
          </Avatar>
          <div
            className={`bg-brand-component text-brand-text prose dark:prose-invert prose-sm max-w-[85%] rounded-lg p-2 shadow-sm sm:max-w-[75%] sm:p-3`}>
            {renderedContent}
            <div className="text-brand-text-muted/80 mt-1.5 flex items-center justify-between text-xs">
              <span className="flex-grow">
                {" "}
                {message.timestamp} {message.model && `· ${message.model}`}
              </span>
              <AnimatedCopyButton
                textToCopy={
                  message.originalText ??
                  (typeof message.text === "string" ? message.text : "")
                }
                className={cn(
                  "text-brand-text-muted hover:text-brand-text h-6 w-6 flex-shrink-0", // Added flex-shrink-0
                  "opacity-0 transition-opacity duration-150 group-hover:opacity-100",
                  "pointer-events-none group-hover:pointer-events-auto" // Control interactivity
                )}
                initialIconSize={12}
                aria-label="Copy AI response"
              />
            </div>
          </div>
        </>
      )}

      {isUser && (
        <>
          <div className="relative flex items-center">
            {!isEditing && (
              <div className="absolute top-1/2 right-full z-10 mr-2 flex -translate-y-1/2 items-center space-x-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                  className="text-brand-text-muted hover:text-brand-text hover:bg-brand-component h-7 w-7"
                  aria-label="Edit message">
                  <PenLine className="size-3.5" />
                </Button>
                <AnimatedCopyButton
                  textToCopy={
                    message.originalText ??
                    (typeof message.text === "string" ? message.text : "")
                  }
                  className="text-brand-text-muted hover:text-brand-text hover:bg-brand-component h-7 w-7"
                  initialIconSize={14}
                  aria-label="Copy message"
                />
              </div>
            )}
            <div
              className={cn(
                "max-w-full rounded-lg p-2 shadow-sm sm:p-3",
                isEditing
                  ? "bg-brand-background border-brand-primary border"
                  : "bg-brand-primary text-brand-primaryForeground",
                !isEditing ? "prose dark:prose-invert prose-sm" : ""
              )}>
              {isEditing ? (
                <div className="min-w-[200px] space-y-2 sm:min-w-[250px]">
                  <Textarea
                    ref={textareaRef}
                    value={editText}
                    onChange={e => {
                      setEditText(e.target.value);
                      if (textareaRef.current) {
                        textareaRef.current.style.height = "auto";
                        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                      }
                    }}
                    className="bg-brand-background text-brand-text-default border-brand-border focus:ring-brand-ring min-h-[60px] w-full text-sm"
                    rows={3}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="text-brand-text-muted">
                      <X className="mr-1 h-4 w-4" /> Cancel
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="bg-brand-primary hover:bg-brand-primary/90 text-brand-primaryForeground">
                      <Check className="mr-1 h-4 w-4" /> Save & Submit
                    </Button>
                  </div>
                </div>
              ) : (
                renderedContent
              )}
              {!isEditing && (
                <div
                  className={`text-brand-primaryForeground/80 mt-1.5 text-xs`}>
                  {message.timestamp}
                </div>
              )}
            </div>
          </div>
          <Avatar className="h-7 w-7 shrink-0 sm:h-8 sm:w-8">
            {message.avatar ? (
              <AvatarImage
                src={user?.image ?? message.avatar ?? "/placeholder.svg"}
                alt="User Avatar"
              />
            ) : (
              <AvatarFallback>
                <UserIcon className="size-4" />
              </AvatarFallback>
            )}
          </Avatar>
        </>
      )}
    </motion.div>
  );
}
