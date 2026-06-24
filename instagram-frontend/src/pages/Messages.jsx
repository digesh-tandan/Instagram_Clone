import API from "../api/axios";

import { useEffect, useState, useRef } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { FiSmile } from "react-icons/fi";

import {
    getRecentChats,
    getMessages,
    reactToMessage,
    sendMessage,
    startConversation,
    markMessagesSeen,
    getUnreadCounts,
    deleteMessage,
    editMessage,
    togglePinChat
}
from "../api/messageApi";

import "../styles/messages.css";

import {
    useSearchParams
}
from "react-router-dom";

import socket from "../socket/socket";

import { useChatStore }
from "../store/chatStore";

import { useAuthStore }
from "../store/authStore";

import { useSocketStore }
from "../store/socketStore";

import {
    useMessageStore
}
from "../store/messageStore";

function Messages() {

    const currentUser =
    useAuthStore(
        state => state.user
    );

    const currentUserId =
    currentUser?.id;

    const selectedChat =
    useChatStore(
        state => state.selectedChat
    );
    
    const setSelectedChat =
    useChatStore(
        state => state.setSelectedChat
    );

    const clearSelectedChat =
    useChatStore(
        state => state.clearSelectedChat
    );

    const unreadCounts =
    useChatStore(
        state => state.unreadCounts
    );
    
    const setUnreadCounts =
    useChatStore(
        state => state.setUnreadCounts
    );

    const queryClient =
    useQueryClient();

    const [showNewChat,setShowNewChat] =
    useState(false);

    const [search,setSearch] =
    useState("");

    const [users,setUsers] =
    useState([]);

    const replyingTo =
    useMessageStore(
        state => state.replyingTo
    );
    
    const setReplyingTo =
    useMessageStore(
        state => state.setReplyingTo
    );
    
    const clearReplyingTo =
    useMessageStore(
        state => state.clearReplyingTo
    );

    const messages =
    useMessageStore(
        state => state.messages
    );

    const setMessages =
    useMessageStore(
        state => state.setMessages
    );

    const addMessage =
    useMessageStore(
        state => state.addMessage
    );

    const [showMessageMenu,setShowMessageMenu] = 
    useState(false);

    const selectedMessage =
    useMessageStore(
        state => state.selectedMessage
    );

    const setSelectedMessage =
    useMessageStore(
        state => state.setSelectedMessage
    );

    const [editingMessageId,setEditingMessageId] =
    useState(null);

    const [editedText,setEditedText] =
    useState("");

    const [showDeleteMessageConfirm,setShowDeleteMessageConfirm] =
    useState(false);

    const [showDeleteChatConfirm,setShowDeleteChatConfirm] =
    useState(false);

    const [showChatMenu,setShowChatMenu] = 
    useState(false);

    const [reactions,setReactions] = 
    useState({});

    const [showReactionPicker,setShowReactionPicker] =
    useState(null);
    
    const text =
    useMessageStore(
        state => state.text
    );

    const setText =
    useMessageStore(
        state => state.setText
    );

    const messagesEndRef =
    useRef(null);

    const typingTimeout =
    useRef(null);

    const [searchParams] = 
    useSearchParams();

    const onlineUsers =
    useSocketStore(
        state => state.onlineUsers
    );

    const typingUsers =
    useSocketStore(
        state => state.typingUsers
    );

    const isTyping =
    typingUsers[
        selectedChat?.conversationId
    ] &&
    typingUsers[
        selectedChat?.conversationId
    ] !== currentUserId;

    const formatLastSeen = (
        lastSeen
    ) => {

        const diff =
        Date.now() -
        new Date(lastSeen).getTime();

        const minutes =
        Math.floor(diff / 60000);

        if (minutes < 1)
            return "moments ago";

        if (minutes < 60)
            return `${minutes} min ago`;

        const hours =
        Math.floor(minutes / 60);

        if (hours < 24)
            return `${hours} hr ago`;

        const days =
        Math.floor(hours / 24);

        if (days < 30)
            return `${days} day ago`;

        const months =
        Math.floor(days / 30);

        if (months < 12)
            return `${months} month ago`;

        const years =
        Math.floor(months / 12);

        return `${years} year ago`;
    };

    const {
        data: recentChats = [],
        refetch
    } = useQuery({

        queryKey: ["recentChats"],

        queryFn: getRecentChats,

        refetchOnWindowFocus: false,

        refetchOnReconnect: false,

        refetchOnMount: false,

        staleTime: 0
    });
    
    useEffect(() => {

    }, [recentChats]);

    const searchUsers = async (
        keyword
    ) => {

        try {

            const res =
            await API.get(

                `/auth/search-users?q=${keyword}`
            );
            setUsers(
                res.data.users || []
            );

        } catch(err) {

            console.log(err);
        }
    };

    const loadUnreadCounts =
    async () => {

        try {

            const data =
            await getUnreadCounts();

            const counts = {};

            data.forEach(
                (item) => {

                    counts[
                        item.conversation_id
                    ] =
                    item.unreadCount;
                }
            );

            setUnreadCounts(
                counts
            );

        } catch (error) {

            console.log(
                error
            );
        }
    };
    
    useEffect(() => {

        if(currentUser?.id){

            socket.emit(
                "join",
                currentUser.id
            );

            socket.emit(
                "getOnlineUsers"
            );
        }

    }, [currentUser]);

    useEffect(() => {

        if (!selectedChat)
            return;

        socket.emit(
            "joinConversation",
            selectedChat.conversationId
        );

    }, [selectedChat]);

    useEffect(() => {

        loadUnreadCounts();
        
    }, []);

    const isEditExpired = (
        createdAt
    ) => {

        const now =
        new Date();

        const created =
        new Date(createdAt);

        const diffMinutes =

            (
                now - created
            )

            /

            1000

            /

            60;

        return diffMinutes > 15;
    };

    const getSeenTime = (date) => {

        const now =
        new Date();

        const seenDate =
        new Date(date);

        const diff =
        Math.floor(
            (now - seenDate) / 1000
        );

        const mins =
        Math.floor(diff / 60);

        const hrs =
        Math.floor(mins / 60);

        const days =
        Math.floor(hrs / 24);

        const months =
        Math.floor(days / 30);

        const years =
        Math.floor(days / 365);

        if (mins < 1)
            return "Seen just now";

        if (mins < 60)
            return `Seen ${mins} min ago`;

        if (hrs < 24)
            return `Seen ${hrs} hr ago`;

        if (days < 30)
            return `Seen ${days} day ago`;

        if (months < 12)
            return `Seen ${months} mon ago`;

        return `Seen ${years} yr ago`;
    };

    useEffect(() => {

        socket.emit(
            "getOnlineUsers"
        );

    }, []);

    useEffect(() => {

        socket.on(

            "newMessage",

            async (message) => {
                        
                if (
                
                    selectedChat &&
                
                    Number(message.conversation_id)
                
                    ===
                
                    Number(
                        selectedChat.conversationId
                    )
                
                ) {
                
                    addMessage(
                        message
                    );
                
                    markMessagesSeen(
                        selectedChat.conversationId
                    );
                }
            
                await queryClient.refetchQueries({
                    queryKey:["recentChats"]
                });

                await loadUnreadCounts();
            }
        );

        socket.on(
            "refreshChats",
            async () => {
                        
                await queryClient.invalidateQueries({
                    queryKey:["recentChats"]
                });
            
                const result =
                await refetch();
            
                await loadUnreadCounts();
            }
        );

        socket.on(
            "userTyping",
            () => {
            
                setTypingUser(
                    true
                );
            
                clearTimeout(
                    typingTimeout.current
                );
            
                typingTimeout.current =
                setTimeout(() => {
                
                    setTypingUser(
                        false
                    );
                
                },1500);
            }
        );

        socket.on(
            "userStoppedTyping",
            () => {
            
                setTypingUser(
                    false
                );
            }
        );

        socket.on(
            "messageReaction",
            (data) => {
            
                setMessages(prev =>
                    prev.map(msg => {
                    
                        if(msg.id !== data.messageId){
                            return msg;
                        }
                    
                        return {
                        
                            ...msg,
                        
                            reactions:[
                                ...(msg.reactions || [])
                                .filter(
                                    r =>
                                    Number(r.user_id)
                                    !==
                                    Number(data.userId)
                                ),
                            
                                {
                                    user_id:data.userId,
                                    reaction:data.reaction
                                }
                            ]
                        };
                    })
                );
            }
        );

        socket.on(
            "reactionRemoved",
            (data) => {
            
                setMessages(prev =>
                    prev.map(msg => {
                    
                        if(msg.id !== data.messageId){
                            return msg;
                        }
                    
                        return {
                        
                            ...msg,
                        
                            reactions:
                            (msg.reactions || [])
                            .filter(
                                r =>
                                Number(r.user_id)
                                !==
                                Number(data.userId)
                            )
                        };
                    })
                );
            }
        );

        return () => {

            socket.off(
                "newMessage"
            );
        
            socket.off(
                "userTyping"
            );
        
            socket.off(
                "userStoppedTyping"
            );

            socket.off(
                "refreshChats"
            );

            socket.off(
                "messageReaction"
            );

            socket.off(
                "reactionRemoved"
            );
        };

    }, [
        selectedChat,
        currentUserId,
        queryClient
    ]);

    useEffect(() => {

    }, [recentChats]);

    const startChat = async (
        userId
    ) => {

        try {

            const res =
            await API.post(
                `/messages/start/${userId}`
            );

            if (
                !res.data.conversationId
            ) {

                alert(
                    "Conversation ID not returned"
                );

                return;
            }

            const conversationId =
            res.data.conversationId;

            setShowNewChat(false);

            await refetch();

            window.location.href =
            `/messages?conversation=${conversationId}`;

        } catch(err) {

            console.error(
                "START CHAT ERROR:",
                err.response?.data || err
            );

            alert(
                "Failed to start chat. Check console."
            );
        }
    };

    useEffect(() => {

        if (!selectedChat)
            return;

        loadMessages();

        loadUnreadCounts();

    }, [
        selectedChat,
        currentUserId,
        refetch
    ]);

    useEffect(() => {

        const conversationId =
        searchParams.get(
            "conversation"
        );

        if (
            !conversationId ||
            !recentChats.length
        ) {

            return;
        }

        const chat =
        recentChats.find(

            (c) =>

            String(
                c.conversationId
            )

            ===

            String(
                conversationId
            )
        );

        if (chat) {

            setSelectedChat(
                chat
            );
        }

    }, [

        recentChats,

        searchParams
    ]);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({

            behavior: "smooth"

        });

    }, [messages]);

    const loadMessages = async () => {

        try {

            const data =
            await getMessages(
                selectedChat.conversationId
            );

            const formatted = data.map(msg => ({
                ...msg,

                reactions:
                    typeof msg.reactions === "string"
                    ? JSON.parse(msg.reactions || "[]")
                    : msg.reactions || []
            }));

            setMessages(prev => {
            
                if (
                    JSON.stringify(prev)
                    ===
                    JSON.stringify(formatted)
                ) {
                    return prev;
                }
            
                return formatted;
            });

            return formatted;

            await markMessagesSeen(
                selectedChat.conversationId
            );

            socket.emit(
                "refreshChats"
            );

            return data;

        } catch(err) {

            console.log(err);

            return [];
        }
    };

    const startEditingMessage = (
        message
    ) => {

        setEditingMessageId(
            message.id
        );

        setEditedText(
            message.message
        );

        setShowMessageMenu(
            false
        );
    };

    const saveEditedMessage =
    async (
        messageId
    ) => {
    
        try {
        
            await editMessage(
            
                messageId,
            
                editedText
            );
        
            setMessages(
            
                prev =>
                
                prev.map(
                
                    msg =>
                    
                    msg.id ===
                    messageId
    
                    ?
    
                    {
                    
                        ...msg,
                    
                        message:
                        editedText,
                    
                        edited_at:
                        new Date()
                    }
                
                    :
                
                    msg
                )
            );
        
            setEditingMessageId(null);

            setEditedText("");

            setShowMessageMenu(false);

            setSelectedMessage(null);
        
        }
    
        catch(err) {
        
            console.log(err);
        }
    };

    const handleReaction = async (
        messageId,
        emoji
    ) => {

        const msg =
        messages.find(
            m => m.id === messageId
        );

        const myReaction =
        msg?.reactions?.find(
        
            r =>
            
            Number(r.user_id)
        
            ===
        
            Number(currentUserId)
        );

        try {
        
            if(
                    myReaction &&
                    myReaction.reaction === emoji
                ){
            
                await removeReaction(
                    messageId
                );

                socket.emit(
                    "reactionRemoved",
                    {
                        messageId,
                        userId:currentUserId
                    }
                );
            
                setMessages(prev =>
                    prev.map(m =>
                        m.id === messageId
                        ? {
                            ...m,
                        
                            reactions:
                            m.reactions.filter(
                                r =>
                                r.user_id !== currentUserId
                            )
                        }
                        : m
                    )
                );
            
                setShowReactionPicker(null);
            
                return;
            }
        
            await reactToMessage(
                messageId,
                emoji
            );

            socket.emit(
                "messageReaction",
                {
                    messageId,
                    userId:currentUserId,
                    reaction:emoji
                }
            );
        
            setMessages(prev =>
                prev.map(m =>
                    m.id === messageId
                    ? {
                        ...m,
                    
                        reactions:[
                            ...(m.reactions || [])
                            .filter(
                                r =>
                                r.user_id !== currentUserId
                            ),
                        
                            {
                                user_id: currentUserId,
                                reaction: emoji
                            }
                        ]
                    }
                    : m
                )
            );
        
            setShowReactionPicker(null);
        
        } catch(err){
        
            console.log(err);
        }
    };

    const handleSend =
    async () => {

        if (

            !text.trim() ||

            !selectedChat
        ) {

            return;
        }

        try {

            await sendMessage(
                selectedChat.conversationId,
                text,
                replyingTo?.id || null
            );

            await queryClient.refetchQueries({
                queryKey:["recentChats"]
            });

            await loadUnreadCounts();

            setText("");

            clearReplyingTo();

            socket.emit(
                "stopTyping",
                {
                    conversationId:
                    selectedChat.conversationId,
                
                    userId:
                    currentUserId
                }
            );

        } catch (err) {

            console.error(err);
        }
    };

    return (

        <div className="messages-page">

            {/* LEFT */}

            <div className="chat-sidebar">

                <div className="chat-sidebar-header">

                    <div className="messages-header">

                        <h2>

                            Messages

                        </h2>

                        <button

                            className="new-chat-btn"

                            onClick={() =>
                                setShowNewChat(
                                    true
                                )
                            }
                        >
                        
                            +
                        
                        </button>
                        
                    </div>
                        
                </div>

                <div className="chat-list">

                    {

                        recentChats.map(

                            (chat) => (

                                <div

                                    key={
                                        chat.conversationId
                                    }

                                    className={`chat-item ${
                                        selectedChat
                                            ?.conversationId ===
                                        chat.conversationId
                                            ? "active"
                                            : ""
                                    }`}

                                    onClick={async () => {

                                        setSelectedChat(chat);

                                        setUnreadCounts(prev => ({
                                        
                                            ...prev,
                                        
                                            [chat.conversationId]: 0
                                        
                                        }));
                                    
                                        await markMessagesSeen(
                                            chat.conversationId
                                        );
                                    
                                        socket.emit(
                                            "messagesSeen",
                                            chat.conversationId
                                        );
                                    
                                        socket.emit(
                                            "refreshChats"
                                        );
                                    }}
                                    onContextMenu={(e) => {

                                        e.preventDefault();

                                        setSelectedChat(chat);

                                        setShowChatMenu(true);
                                    }}
                                >

                                    {

                                        chat.profile_photo

                                        ?

                                        <img
                                            src={`http://localhost:5000/uploads/profile/${chat.profile_photo}`}

                                            alt=""
                                        />

                                        :

                                        <div
                                            className="chat-avatar-placeholder"
                                        >

                                            {
                                                chat.username?.[0]
                                            }

                                        </div>
                                    }

                                    <div className="chat-info">

                                        <div className="chat-name">

                                            <span
                                                className={
                                                    unreadCounts[
                                                        chat.conversationId
                                                    ] > 0
                                                        ? "chat-name-unread"
                                                        : ""
                                                }
                                            >
                                            
                                                {chat.username}
                                                {
                                                    chat.is_pinned === 1 && (
                                                    
                                                        <span
                                                            className="chat-pin-icon"
                                                        >
                                                            📌
                                                        </span>
                                                    )
                                                }
                                            
                                            </span>
                                            
                                        </div>

                                        <div
                                            className={`chat-last-message ${
                                                unreadCounts[
                                                    chat.conversationId
                                                ] > 0
                                                    ? "unread-preview"
                                                    : ""
                                            }`}
                                        >
                                        
                                            {
                                                unreadCounts[
                                                    chat.conversationId
                                                ] > 1
                                            
                                                ?
                                            
                                                `${
                                                    unreadCounts[
                                                        chat.conversationId
                                                    ] > 9
                                                
                                                    ?
                                                
                                                    "9+"
                                                
                                                    :
                                                
                                                    unreadCounts[
                                                        chat.conversationId
                                                    ]
                                                } new messages`
                                            
                                                :
                                            
                                                chat.message_type === "image"
                                            
                                                ?
                                            
                                                "📷 Photo"
                                            
                                                :
                                            
                                                chat.message_type === "video"
                                            
                                                ?
                                            
                                                "🎥 Video"
                                            
                                                :
                                            
                                                chat.message ||
                                                "Start chatting..."
                                            }
                                        
                                            <span className="chat-preview-time">
                                        
                                                {" · "}
                                        
                                                {
                                                
                                                    new Date(
                                                        chat.created_at
                                                    ).toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour:"numeric",
                                                            minute:"2-digit"
                                                        }
                                                    )
                                                
                                                }
                                        
                                            </span>
                                            
                                        </div>

                                    </div>

                                </div>
                            )
                        )
                    }

                </div>

            </div>

            {/* RIGHT */}

            <div className="chat-window">

                {

                    !selectedChat

                    ?

                    <div className="empty-chat">

                        Select a chat
                    </div>

                    :

                    <>

                        <div className="chat-header">

                            <div
                                className="chat-header-user"
                                onClick={() =>
                                    window.open(
                                        `/profile/${selectedChat.username}`,
                                        "_self"
                                    )
                                }
                            >
                                <div className="chat-avatar-wrapper">

                                    {
                                        selectedChat.profile_photo
                                        ?
                                    
                                        <img
                                            src={`http://localhost:5000/uploads/profile/${selectedChat.profile_photo}`}
                                            alt=""
                                        />
                                    
                                        :
                                    
                                        <div className="chat-avatar-placeholder">
                                        
                                            {selectedChat.username?.[0]}
                                    
                                        </div>
                                    }

                                    <span
                                        className={`avatar-status-dot ${
                                            onlineUsers.includes(
                                                Number(selectedChat.userId)
                                            )
                                                ? "online"
                                                : selectedChat.last_seen
                                                ? "offline"
                                                : "unknown"
                                        }`}
                                    ></span>

                                </div>

                                <div>
                            
                                    <div className="chat-header-name">
                            
                                        {selectedChat.username}
                            
                                    </div>
                            
                                    {
                                        onlineUsers.includes(
                                            Number(selectedChat.userId)
                                        ) ? (
                                        
                                            <div className="active-now">
                                                Active now
                                            </div>

                                        ) : selectedChat.last_seen ? (
                                        
                                            <div className="last-seen">
                                                Last seen {
                                                    formatLastSeen(
                                                        selectedChat.last_seen
                                                    )
                                                }
                                            </div>

                                        ) : (
                                        
                                            <div className="last-seen">
                                                Offline
                                            </div>

                                        )
                                    }

                                </div>
                                
                            </div>
                                
                        </div>

                        <div className="messages-container">

                            {

                                messages.map(

                                    (msg, index) => (

                                        <div
                                            key={msg.id}
                                            className={`message-wrapper ${
                                                msg.sender_id === currentUserId
                                                    ? "mine-wrapper"
                                                    : "other-wrapper"
                                            }`}
                                        >
                                            
                                        
                                            {
                                                showReactionPicker === msg.id && (
                                                
                                                    <div className="reaction-picker">
                                                    
                                                        <span
                                                            onClick={() =>
                                                                handleReaction(
                                                                    msg.id,
                                                                    "❤️"
                                                                )
                                                            }
                                                        >
                                                            ❤️
                                                        </span>
                                                        
                                                        <span
                                                            onClick={() =>
                                                                handleReaction(
                                                                    msg.id,
                                                                    "😂"
                                                                )
                                                            }
                                                        >
                                                            😂
                                                        </span>
                                                        
                                                        <span
                                                            onClick={() =>
                                                                handleReaction(
                                                                    msg.id,
                                                                    "🔥"
                                                                )
                                                            }
                                                        >
                                                            🔥
                                                        </span>
                                                        
                                                        <span
                                                            onClick={() =>
                                                                handleReaction(
                                                                    msg.id,
                                                                    "👍"
                                                                )
                                                            }
                                                        >
                                                            👍
                                                        </span>
                                                        
                                                        <span
                                                            onClick={() =>
                                                                handleReaction(
                                                                    msg.id,
                                                                    "😮"
                                                                )
                                                            }
                                                        >
                                                            😮
                                                        </span>
                                                        
                                                    </div>
                                                )
                                            }

                                            <div
                                                className={`message-bubble ${
                                                    msg.sender_id === currentUserId
                                                        ? "mine"
                                                        : "other"
                                                }`}
                                            
                                                onClick={() => {

                                                    if (
                                                    
                                                        editingMessageId === msg.id
                                                    
                                                    ) {
                                                    
                                                        return;
                                                    }
                                                
                                                    setSelectedMessage(msg);

                                                    setShowMessageMenu(true);
                                                }}
                                            >
                                            
                                                {
                                                    msg.message_type === "text" && (
                                                        <div className="message-content">

                                                            {
                                                                editingMessageId ===
                                                                msg.id
                                                            
                                                                ?
                                                            
                                                                (
                                                                
                                                                    <div className="message-edit-box">
                                                                    
                                                                        <input
                                                                            autoFocus
                                                                            onClick={(e) =>
                                                                                e.stopPropagation()
                                                                            }
                                                                            
                                                                            value={editedText}
                                                                
                                                                            onChange={(e) =>
                                                                                setEditedText(
                                                                                    e.target.value
                                                                                )
                                                                            }

                                                                            onKeyDown={(e) => {
                                                                                if(e.key === "Enter"){
                                                                                
                                                                                    saveEditedMessage(
                                                                                        msg.id
                                                                                    );
                                                                                }
                                                                            }}
                                                                        />

                                                                        <button

                                                                            onClick={(e) => {
                                                                            
                                                                                e.stopPropagation();
                                                                            
                                                                                saveEditedMessage(
                                                                                    msg.id
                                                                                );
                                                                            }}
                                                                        >
                                                                            Save
                                                                        </button>
                                                                        
                                                                    </div>

                                                                )
                                                            
                                                                :
                                                            
                                                                (
                                                                
                                                                    <>

                                                                        {
                                                                            msg.reply_message && (
                                                                            
                                                                                <div className="instagram-reply">
                                                                                
                                                                                    <div className="instagram-reply-label">
                                                                            
                                                                                        {
                                                                                            msg.sender_id === currentUserId
                                                                                        
                                                                                            ?
                                                                                        
                                                                                            `You replied to ${msg.reply_username}`
                                                                                        
                                                                                            :
                                                                                        
                                                                                            `Replied to ${msg.reply_username}`
                                                                                        }

                                                                                    </div>
                                                                                    
                                                                                    <div className="instagram-reply-message">
                                                                                    
                                                                                        {
                                                                                            msg.reply_message
                                                                                        }

                                                                                    </div>
                                                                                    
                                                                                </div>
                                                                            )
                                                                        }

                                                                        {msg.message}
                                                                    
                                                                        {
                                                                            msg.edited_at && (
                                                                            
                                                                                <span
                                                                                    className="edited-badge"
                                                                                >
                                                                                    Edited
                                                                                </span>
                                                                            )
                                                                        }

                                                                    </>
                                                                )
                                                            }

                                                        </div>                                                       
                                                    )
                                                }

                                                {
                                                    msg.message_type === "image" && (
                                                        <img
                                                            src={`http://localhost:5000/uploads/chat/${msg.media_url}`}
                                                            alt=""
                                                        />
                                                    )
                                                }

                                                {
                                                    msg.message_type === "video" && (
                                                        <video
                                                            controls
                                                            src={`http://localhost:5000/uploads/chat/${msg.media_url}`}
                                                        />
                                                    )
                                                }

                                            </div>

                                            <button
                                                className="reply-hover-btn"
                                                onClick={() =>
                                                    setReplyingTo(msg)
                                                }
                                            >
                                                ↩
                                            </button>

                                            <button

                                                className="reaction-hover-btn"

                                                onClick={(e) => {
                                                
                                                    e.stopPropagation();
                                                
                                                    setShowReactionPicker(
                                                    
                                                        showReactionPicker === msg.id
                                                    
                                                        ?
                                                    
                                                        null
                                                    
                                                        :
                                                    
                                                        msg.id
                                                    );
                                                }}
                                            >
                                            
                                                <FiSmile />
                                            
                                            </button>
                                            
                                            {
                                                msg.reactions &&
                                                msg.reactions.length > 0 && (
                                                
                                                    <div
                                                        className={`message-reaction ${
                                                            msg.sender_id === currentUserId
                                                            ? "mine-reaction"
                                                            : "other-reaction"
                                                        }`}
                                                    >
                                                    
                                                        {[...new Set(
                                                            msg.reactions.map(
                                                                r => r.reaction
                                                            )
                                                        )].join(" ")}
                                            
                                                        <span className="reaction-count">
                                                    
                                                            {msg.reactions.length}
                                                    
                                                        </span>
                                                    
                                                    </div>
                                                )
                                            }

                                            <div
                                                className={`message-meta ${
                                                    msg.sender_id === currentUserId
                                                        ? "mine-meta"
                                                        : "other-meta"
                                                } hover-meta`}
                                            >
                                            
                                                {new Date(
                                                    msg.created_at
                                                ).toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: "numeric",
                                                        minute: "2-digit"
                                                    }
                                                )}

                                                {
                                                    msg.sender_id === currentUserId &&
                                                    index === messages.length - 1 &&
                                                    (
                                                        <span className="seen-status">

                                                            {
                                                                msg.is_seen
                                                                ?
                                                                getSeenTime(
                                                                    msg.created_at
                                                                )
                                                                :
                                                                msg.is_delivered
                                                                ?
                                                                "Delivered"
                                                                :
                                                                "Sent"
                                                            }

                                                        </span>
                                                    )
                                                }

                                            </div>
                                            
                                        </div>
                                    )
                                )
                            }
                            <div ref={messagesEndRef}></div>

                        </div>

                        {
                            isTyping && (
                            
                                <div className="typing-indicator">
                                
                                    <div className="typing-bubble">

                                        <span></span>
                                        <span></span>
                                        <span></span>

                                    </div>
                            
                                </div>
                            )
                        }

                        {
                            replyingTo && (
                            
                                <div className="reply-preview">
                                
                                    <div className="reply-preview-header">
                            
                                        Replying to
                            
                                        {" "}
                            
                                        {
                                            replyingTo.sender_id === currentUserId
                                        
                                            ?
                                        
                                            "yourself"
                                        
                                            :
                                        
                                            replyingTo.username
                                        }

                                    </div>
                                    
                                    <div className="reply-preview-message">
                                    
                                        {
                                            replyingTo.message
                                        }

                                    </div>
                                    
                                    <button

                                        className="reply-close-btn"
                                    
                                        onClick={
                                            clearReplyingTo
                                        }
                                    >
                                    
                                        ✕
                                    
                                    </button>
                                    
                                </div>
                            )
                        }

                        <div className="chat-input-area">

                            <input

                                type="text"

                                placeholder="Message..."

                                value={text}

                                onChange={(e) => {

                                    setText(
                                        e.target.value
                                    );
                                
                                    if(selectedChat){
                                    
                                        socket.emit(
                                            "typing",
                                            {
                                                conversationId:
                                                selectedChat.conversationId,
                                            
                                                userId:
                                                currentUserId
                                            }
                                        );
                                    
                                        clearTimeout(
                                            typingTimeout.current
                                        );
                                    
                                        typingTimeout.current =
                                        setTimeout(() => {
                                        
                                            socket.emit(
                                                "stopTyping",
                                                {
                                                    conversationId:
                                                    selectedChat.conversationId,
                                                
                                                    userId:
                                                    currentUserId
                                                }
                                            );
                                        
                                        },1000);
                                    }
                                }}

                                onKeyDown={(e) => {

                                    if (
                                        e.key === "Enter"
                                    ) {

                                        handleSend();
                                    }
                                }}

                                onBlur={() => {

                                    if(selectedChat){
                                    
                                        socket.emit(
                                            "stopTyping",
                                            {
                                                conversationId:
                                                selectedChat.conversationId,
                                            
                                                userId:
                                                currentUserId
                                            }
                                        );
                                    }
                                }}
                            />

                            <button

                                onClick={
                                    handleSend
                                }
                            >

                                Send

                            </button>

                        </div>

                    </>
                }

            </div>

            {
                showChatMenu && (
                
                    <div
                        className="message-menu-overlay"
                
                        onClick={() =>
                            setShowChatMenu(
                                false
                            )
                        }
                    >
                    
                        <div
                            className="message-menu"
                    
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                        
                            <button

                            onClick={async () => {
                            
                                try{
                                
                                    await togglePinChat(
                                        selectedChat.conversationId
                                    );

                                    await refetch();
                                
                                }
                            
                                catch(err){
                                
                                    alert(
                                        err.response?.data?.message
                                    );
                                }
                            
                                setShowChatMenu(false);
                            }}
                            >
                            
                            {
                                selectedChat?.is_pinned
                            
                                ?
                            
                                "Unpin Chat"
                            
                                :
                            
                                "Pin Chat"
                            }
                            
                            </button>

                            <button

                                className="danger"

                                onClick={() => {
                                
                                    setShowChatMenu(
                                        false
                                    );
                                
                                    setShowDeleteChatConfirm(
                                        true
                                    );
                                }}
                            >
                            
                                Delete Chat
                            
                            </button>
                            
                            <button

                                onClick={() =>
                                    setShowChatMenu(
                                        false
                                    )
                                }
                            >
                            
                                Cancel
                            
                            </button>
                            
                        </div>
                            
                    </div>
                )
            }

            {
                showMessageMenu && (
                
                    <div
                        className="message-menu-overlay"
                
                        onClick={() =>
                            setShowMessageMenu(
                                false
                            )
                        }
                    >
                    
                        <div
                            className="message-menu"
                    
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                        
                            {
                                selectedMessage &&
                                !isEditExpired(
                                    selectedMessage.created_at
                                ) && (
                                
                                    <button
                                
                                        onClick={() =>
                                            startEditingMessage(
                                                selectedMessage
                                            )
                                        }
                                    >
                                    
                                        Edit Message
                                    
                                    </button>
                                )
                            }

                            <button

                                className="danger"

                                onClick={() => {
                                
                                    setShowMessageMenu(
                                        false
                                    );
                                
                                    setShowDeleteMessageConfirm(
                                        true
                                    );
                                }}
                            >
                            
                                Delete Message
                            
                            </button>
                            
                            <button

                                onClick={() =>
                                    setShowMessageMenu(
                                        false
                                    )
                                }
                            >
                            
                                Cancel
                            
                            </button>
                            
                        </div>
                            
                    </div>
                )
            }

            {
                showDeleteMessageConfirm && (
                
                    <div
                        className="message-menu-overlay"
                    >
                    
                        <div
                            className="delete-confirm-modal"
                        >
                        
                            <div className="delete-confirm-title">

                                Delete Message?

                            </div>
                
                            <div className="delete-confirm-text">

                                This message will be removed permanently.

                            </div>
                
                            <button

                                className="delete-confirm-btn"
                
                                onClick={async () => {
                                
                                    try {
                                    
                                        await deleteMessage(
                                            selectedMessage.id
                                        );
                                    
                                        setMessages(
                                        
                                            prev =>
                                            
                                            prev.filter(
                                            
                                                m =>
                                                
                                                m.id !==
                                                selectedMessage.id
                                            )
                                        );
                                    
                                    }
                                
                                    catch(err){
                                    
                                        console.log(
                                            err
                                        );
                                    }
                                
                                    setShowDeleteMessageConfirm(
                                        false
                                    );
                                }}
                            >
                            
                                Delete
                            
                            </button>
                            
                            <button
                                className="delete-cancel-btn"

                                onClick={() =>
                                    setShowDeleteMessageConfirm(
                                        false
                                    )
                                }
                            >
                            
                                Cancel
                            
                            </button>
                            
                        </div>
                            
                    </div>
                )
            }

            {
                showDeleteChatConfirm && (

                    <div 
                        className="message-menu-overlay"
                    >
                
                        <div
                            className="delete-confirm-modal"
                        >

                            <div className="delete-confirm-title">

                                Delete Chat?

                            </div>

                            <div className="delete-confirm-text">

                                All messages in this conversation
                                will be permanently removed.

                            </div>

                            <button
                                className="delete-confirm-btn"
                                onClick={async () => {
                                
                                    try {
                                    
                                        await API.delete(
                                            `/messages/conversation/${selectedChat.conversationId}`
                                        );
                                    
                                        setMessages([]);
                                    
                                        clearSelectedChat();
                                    
                                        refetch();
                                    
                                    }
                                
                                    catch(err){
                                    
                                        console.log(err);
                                    }
                                
                                    setShowDeleteChatConfirm(false);
                                }}
                            >
                            
                                Delete
                            
                            </button>
                            
                            <button
                                className="delete-cancel-btn"
                                onClick={() =>
                                    setShowDeleteChatConfirm(false)
                                }
                            >
                            
                                Cancel
                            
                            </button>
                            
                        </div>
                        
                    </div>
                )
            }
            
            {
                showNewChat && (
                
                    <div
                        className="chat-modal-overlay"
                    >
                    
                        <div
                            className="chat-modal"
                        >
                        
                            <div
                                className="chat-modal-header"
                            >
                            
                                <h3>
                
                                    New Message
                
                                </h3>
                
                                <button

                                    onClick={() =>
                                        setShowNewChat(
                                            false
                                        )
                                    }
                                >
                                
                                    ✕
                                
                                </button>
                                
                            </div>
                                
                            <input

                                type="text"
                                
                                placeholder="Search user..."
                                
                                value={search}
                                
                                onChange={(e) => {
                                
                                    setSearch(
                                        e.target.value
                                    );
                                
                                    searchUsers(
                                        e.target.value
                                    );
                                }}
                            />

                            <div
                                className="chat-users"
                            >
                            
                                {
                                
                                    users.map((user) => {

                                        return (
                                        
                                            <div
                                                key={user.id}
                                                className="chat-user"
                                                onClick={() => {
                                                
                                                    startChat(
                                                        Number(user.id)
                                                    );
                                                }}
                                            >
                                            
                                                {
                                                    user.profilePhoto ? (
                                                        <img
                                                            src={user.profilePhoto}
                                                            alt={user.username}
                                                            className="chat-user-avatar"
                                                        />
                                                    ) : (
                                                        <div className="chat-avatar">
                                                        
                                                            {
                                                                user.username?.[0]
                                                                ?.toUpperCase()
                                                            }

                                                        </div>
                                                    )
                                                }

                                                <div className="chat-user-info">

                                                    <div className="chat-user-username">
                                                        {user.username}                                
                                                    </div>
                                                    <div className="chat-user-name">
                                                        {user.name}

                                                    </div>

                                                </div>
                                            
                                            </div>
                                        );
                                    })
                                }

                            </div>
                            
                        </div>
                            
                    </div>
                )
            }
        
    </div>
);
}
export default Messages;