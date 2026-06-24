import { create } from "zustand";

export const useMessageStore = create(

    (set) => ({

        messages: [],

        text: "",

        selectedMessage: null,

        editingMessageId: null,

        replyingTo: null,

        messageReactions: [],

        editedText: "",

        setMessages: (messagesOrUpdater) =>

            set((state) => ({
            
                messages:
            
                    typeof messagesOrUpdater === "function"
            
                    ?
            
                    messagesOrUpdater(
                        state.messages
                    )
                
                    :
                
                    messagesOrUpdater
            })),

        addMessage: (message) =>
            set((state) => ({
                messages: [
                    ...state.messages,
                    message
                ]
            })),

        setText: (text) =>
            set({ text }),

        setSelectedMessage: (message) =>
            set({
                selectedMessage: message
            }),

        setEditingMessageId: (id) =>
            set({
                editingMessageId: id
            }),

        setEditedText: (text) =>
            set({
                editedText: text
            }),

        clearMessages: () =>
            set({
                messages: []
            }),
        setReplyingTo: (
            message
        ) =>
            set({
                replyingTo:
                message
            }),
        
        clearReplyingTo: () =>
            set({
                replyingTo:
                null
            }),
        setMessageReactions:

        (reactions) =>
        
        set({
        
            messageReactions:
            reactions
        }),
    })
);