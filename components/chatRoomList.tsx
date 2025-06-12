'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import firestoreChatroom from '@/services/firestoreChatroom';
import firestore from '@/services/firestore';
import { chatroom, chatMessage, users, events } from '@/lib/type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { X, Send, User2, Users, AlertCircle, Calendar, MapPin, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { auth } from '@/conf/firebase';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import parser from 'html-react-parser';
import helper from '@/lib/helper/function';
import Link from 'next/link';

const ChatRoomList = () => {
  const [chatrooms, setChatrooms] = useState<chatroom[]>([]);
  const [selectedChatroom, setSelectedChatroom] = useState<chatroom | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: users}>({});
  const [userID, setUserID] = useState<string | null>(null);
  const [eventDetails, setEventDetails] = useState<{[key: string]: events}>({});
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // Manual scrolling control
  const [autoScroll, setAutoScroll] = useState(true);
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  
  // Load chatrooms for the user
  useEffect(() => {
    if (!auth.currentUser) return;
    const currentUserID = auth.currentUser.uid;
    setUserID(currentUserID);
    
    const fetchChatrooms = async () => {
      try {
        setLoading(true);
        const rooms = await firestoreChatroom.getChatrooms(currentUserID) as chatroom[];
        setChatrooms(rooms);
        
        // Fetch user profiles for all participants across all chatrooms
        const uniqueParticipantIds = new Set<string>();
        const uniqueEventIds = new Set<string>();
        
        rooms.forEach(room => {
          // Add organizer ID to the list of users to fetch
          if (room.organizerID) {
            uniqueParticipantIds.add(room.organizerID);
          }
          
          room.participants.forEach(participantId => {
            uniqueParticipantIds.add(participantId);
          });
          
          // Add event IDs to fetch event details
          if (room.eventID) {
            uniqueEventIds.add(room.eventID);
          }
        });
        
        // Fetch user profiles
        const profiles: {[key: string]: users} = {};
        for (const id of uniqueParticipantIds) {
          const profile = await firestore.readUserDatabaseByUserID(id);
          if (profile) {
            profiles[id] = profile as users;
          }
        }
        
        // Fetch event details
        const events: {[key: string]: events} = {};
        for (const id of uniqueEventIds) {
          const event = await firestore.getEventByID(id) as events;
          if (event) {
            events[id] = event;
          }
        }
        
        setUserProfiles(profiles);
        setEventDetails(events);
      } catch (error) {
        console.error('Error fetching chatrooms:', error);
      } finally {
        setLoading(false);
      }
    };
    
    if (currentUserID) {
      fetchChatrooms();
    }
  }, [auth.currentUser]);
  
  // Subscribe to updates when a chatroom is selected
  useEffect(() => {
    if (!selectedChatroom || !userID) return;
    
    // Check if current user is the organizer
    const checkIsOrganizer = selectedChatroom.organizerID === userID;
    setIsOrganizer(checkIsOrganizer);
    
    // Subscribe to real-time updates for the selected chatroom
    const unsubscribe = firestoreChatroom.listenToChatroom(
      selectedChatroom.chatroomID as string,
      (updatedChatroom: chatroom) => {
        if (updatedChatroom) {
          setSelectedChatroom(updatedChatroom);
          
          // Also update the chatroom in the list
          setChatrooms(prevRooms => 
            prevRooms.map(room => 
              room.chatroomID === updatedChatroom.chatroomID ? updatedChatroom : room
            )
          );
        }
      }
    );
    
    // Clean up subscription
    return () => unsubscribe();
  }, [selectedChatroom, userID]);
  
  // Fetch additional user profiles and event details when needed
  useEffect(() => {
    const fetchMissingData = async () => {
      if (!selectedChatroom) return;
      
      // Check for missing user profiles
      const missingUserIds = [
        ...(selectedChatroom.organizerID && !userProfiles[selectedChatroom.organizerID] 
          ? [selectedChatroom.organizerID] : []),
        ...selectedChatroom.participants.filter(id => !userProfiles[id])
      ];
      
      if (missingUserIds.length > 0) {
        const newProfiles = { ...userProfiles };
        for (const id of missingUserIds) {
          const profile = await firestore.readUserDatabaseByUserID(id);
          if (profile) {
            newProfiles[id] = profile as users;
          }
        }
        setUserProfiles(newProfiles);
      }
      
      // Check for missing event details
      if (selectedChatroom.eventID && !eventDetails[selectedChatroom.eventID]) {
        const event = await firestore.getEventByID(selectedChatroom.eventID) as events;
        if (event) {
          setEventDetails(prev => ({
            ...prev,
            [selectedChatroom.eventID]: event
          }));
        }
      }
    };
    
    fetchMissingData();
  }, [selectedChatroom, userProfiles, eventDetails]);
  
  // Add scroll event listener to the chat container
  useEffect(() => {
    const element = chatContainerRef.current;
    if (!element) return;
    
    const handleScrollEvent = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 30;
      
      if (!isAtBottom && !userHasScrolled) {
        setUserHasScrolled(true);
        setAutoScroll(false);
      } else if (isAtBottom && userHasScrolled) {
        setUserHasScrolled(false);
        setAutoScroll(true);
      }
    };
    
    element.addEventListener('scroll', handleScrollEvent);
    return () => element.removeEventListener('scroll', handleScrollEvent);
  }, [userHasScrolled]);
  
  // Function to manually jump to latest messages
  const jumpToLatest = () => {
    scrollToBottom('auto');
    setUserHasScrolled(false);
    setAutoScroll(true);
  };
  
  // Improved scroll to bottom function
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (!chatContainerRef.current) return;
    
    const container = chatContainerRef.current;
    
    if (behavior === 'auto') {
      // Immediate scroll
      container.scrollTop = container.scrollHeight;
    } else {
      // Smooth scroll
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
    
    // Also use the messagesEndRef as a backup method
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({
        behavior: behavior,
        block: 'end'
      });
    }, 100);
  }, []);

  // Auto-scroll on new messages if appropriate
  useEffect(() => {
    if (!selectedChatroom?.messages?.length) return;
    
    const lastMessage = selectedChatroom.messages[selectedChatroom.messages.length - 1];
    const isOwnMessage = lastMessage?.senderID === userID;
    
    if (autoScroll || isOwnMessage) {
      const timer = setTimeout(() => scrollToBottom(), 100);
      return () => clearTimeout(timer);
    }
  }, [selectedChatroom?.messages, autoScroll, userID, scrollToBottom]);
  
  // Reset scroll state when changing chatrooms
  useEffect(() => {
    if (selectedChatroom) {
      setUserHasScrolled(false);
      setAutoScroll(true);
      
      // Use setTimeout to ensure the DOM has been updated
      setTimeout(() => scrollToBottom('auto'), 100);
    }
  }, [selectedChatroom?.chatroomID, scrollToBottom]);
  
  const handleSelectChatroom = (chatroom: chatroom) => {
    setSelectedChatroom(chatroom);
  };
  
  // Handle Enter key to send message
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChatroom || !userID || isSending) return;
    
    try {
      setIsSending(true);
      const currentMessage = message; // Store the message before clearing
      setMessage(''); // Clear input field immediately
      
      await firestoreChatroom.sendMessage(
        selectedChatroom.chatroomID as string, 
        {
          senderID: userID,
          content: currentMessage
        }
      );
      
      // Reset scroll state and force scroll to bottom after sending
      setUserHasScrolled(false);
      setAutoScroll(true);
      scrollToBottom('auto');
    } catch (error) {
      console.error('Error sending message:', error);
      // If there's an error, restore the message
      setMessage(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteMessage = async (messageID: string) => {
    if (!selectedChatroom || !userID || isDeleting) return;
    
    setMessageToDelete(messageID);
    setShowDeleteDialog(true);
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete || !selectedChatroom) return;
    
    try {
      setIsDeleting(messageToDelete);
      await firestoreChatroom.deleteMessage(selectedChatroom.chatroomID as string, messageToDelete);
      console.log("Message deleted successfully");
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsDeleting(null);
      setMessageToDelete(null);
      setShowDeleteDialog(false);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };
  
  const getLatestMessage = (room: chatroom) => {
    if (!room.messages || room.messages.length === 0) {
      return 'No messages yet';
    }
    
    const sortedMessages = [...room.messages].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sortedMessages[0].content.length > 30
      ? sortedMessages[0].content.substring(0, 30) + '...'
      : sortedMessages[0].content;
  };
  
  // Group messages by date
  const groupMessagesByDate = (messages: chatMessage[]): { [key: string]: chatMessage[] } => {
    const grouped: { [key: string]: chatMessage[] } = {};
    
    messages.forEach(message => {
      const dateStr = formatDate(new Date(message.timestamp));
      if (!grouped[dateStr]) {
        grouped[dateStr] = [];
      }
      grouped[dateStr].push(message);
    });
    
    return grouped;
  };
  
  // Get the chatroom organizer's name
  const getOrganizerName = (room: chatroom): string => {
    if (!room.organizerID) return 'Unknown organizer';
    const organizer = userProfiles[room.organizerID];
    return organizer?.name || 'Unknown organizer';
  };
  
  // Get event information for the selected chatroom
  const getEventInfo = (eventID: string) => {
    return eventDetails[eventID];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-150px)] border rounded-lg overflow-hidden">
      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Chatroom List */}
        <div className="w-full md:w-1/3 border-r bg-gray-50 flex flex-col overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Event Community</h2>
            <p className="text-sm text-gray-500">Stay updated with the latest information</p>
          </div>
          
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center space-x-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : chatrooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No community boards available</p>
            </div>
          ) : (
            <ScrollArea className="flex-grow">
              <div className="pb-2">
                {chatrooms.map(room => {
                  const event = eventDetails[room.eventID];
                  return (
                    <div
                      key={room.chatroomID}
                      className={`p-3 hover:bg-gray-100 cursor-pointer border-b ${
                        selectedChatroom?.chatroomID === room.chatroomID 
                          ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                          : ''
                      }`}
                      onClick={() => handleSelectChatroom(room)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium line-clamp-1">{room.title}</h3>
                        {room.updatedAt && (
                          <span className="text-xs text-gray-500">
                            {formatDate(room.updatedAt) === 'Today' 
                              ? formatTime(room.updatedAt) 
                              : formatDate(room.updatedAt)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {getLatestMessage(room)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Users className="h-3 w-3 mr-1" />
                          <span>{room.participants.length} participants</span>
                        </div>
                        
                        {event && (
                          <Badge 
                            className={
                              event.status === "Active" ? "bg-green-100 text-green-800" :
                              event.status === "Ongoing" ? "bg-blue-100 text-blue-800" :
                              event.status === "Past" ? "bg-gray-100 text-gray-800" :
                              "bg-amber-100 text-amber-800"
                            }
                          >
                            {event.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </div>
        
        {/* Chat Area */}
        <div className="w-full md:w-2/3 flex flex-col overflow-hidden">
          {selectedChatroom ? (
            <>
              {/* Chatroom Header with Event Info */}
              <div className="p-4 border-b bg-gray-50 flex-shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="font-semibold text-lg">{selectedChatroom.title}</h2>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <User2 className="h-3 w-3 mr-1" />
                      <span>Organized by: {getOrganizerName(selectedChatroom)}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    Community Board
                  </Badge>
                </div>
                
                {/* Event Details */}
                {selectedChatroom.eventID && eventDetails[selectedChatroom.eventID] && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-100">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium">
                        {eventDetails[selectedChatroom.eventID].title && eventDetails[selectedChatroom.eventID].title.replace(/<[^>]*>/g, '')}
                      </h3>
                      <Link 
                        href={`/student/details/${selectedChatroom.eventID}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View Event
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{helper.formatDate(eventDetails[selectedChatroom.eventID].eventDate)}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{helper.formatTime(eventDetails[selectedChatroom.eventID].eventTime)}</span>
                      </div>
                      <div className="flex items-center col-span-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{eventDetails[selectedChatroom.eventID].eventLocation}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Message Area with Manual Scroll Control */}
              <div 
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto relative p-4 pb-6"
              >
                {/* Jump to latest button */}
                {userHasScrolled && selectedChatroom.messages.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={jumpToLatest}
                    className="fixed bottom-24 right-8 z-10 shadow-md border border-gray-200 bg-white flex items-center"
                  >
                    <ChevronDown className="h-4 w-4 mr-1" />
                    Latest messages
                  </Button>
                )}
                
                <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This is a community board for the event. The organizer's messages appear as announcements.
                  </AlertDescription>
                </Alert>
                
                {selectedChatroom.messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    <p>No messages have been sent yet.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupMessagesByDate(selectedChatroom.messages)).map(([date, messages]) => (
                      <div key={date} className="mb-6">
                        <div className="flex justify-center mb-4">
                          <Badge variant="outline" className="text-xs">
                            {date}
                          </Badge>
                        </div>
                        
                        {messages.map((msg) => {
                          const sender = userProfiles[msg.senderID];
                          const isMessageFromOrganizer = msg.senderID === selectedChatroom.organizerID;
                          const isOwnMessage = msg.senderID === userID;
                          const canDeleteMessage = isOwnMessage || isOrganizer;
                          
                          return (
                            <div 
                              key={msg.messageID} 
                              className={`mb-6 p-4 border rounded-lg shadow-sm relative group ${
                                isMessageFromOrganizer 
                                  ? 'bg-white' 
                                  : 'bg-blue-50'
                              }`}
                            >
                              {canDeleteMessage && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (msg.messageID) {
                                            handleDeleteMessage(msg.messageID);
                                          }
                                        }}
                                        disabled={isDeleting === msg.messageID}
                                      >
                                        {isDeleting === msg.messageID ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <X className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Delete message</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              <div className="flex items-center mb-3">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage 
                                    src={sender?.profilePicture} 
                                    alt={sender?.name || 'User'} 
                                  />
                                  <AvatarFallback>
                                    {(sender?.name?.charAt(0) || 'U').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium text-sm">
                                      {sender?.name || 'Unknown User'}
                                    </p>
                                    {isMessageFromOrganizer && (
                                      <Badge className="bg-blue-100 text-blue-700 text-xs">
                                        Organizer
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(new Date(msg.timestamp)) === 'Today' 
                                      ? formatTime(new Date(msg.timestamp))
                                      : `${formatDate(new Date(msg.timestamp))}, ${formatTime(new Date(msg.timestamp))}`}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-gray-800 whitespace-pre-wrap">
                                {msg.content}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    {/* This invisible div helps us scroll to the bottom */}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message Input */}
              <div className="p-4 border-t bg-gray-50 flex-shrink-0">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex flex-col gap-2"
                >
                  <div className="text-sm font-medium text-gray-700">
                    {isOrganizer ? "Post Announcement" : "Send Message"}
                  </div>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={isOrganizer 
                      ? "Type your announcement here..." 
                      : "Type your message here..."}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                    disabled={isSending}
                  />
                  <Button 
                    type="submit"
                    className="ml-auto"
                    disabled={!message.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {isOrganizer ? "Post Announcement" : "Send Message"}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col p-8 text-center text-gray-500">
              <Users className="h-16 w-16 mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Select an Event</h3>
              <p>Choose an event from the list to view messages and announcements</p>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              {messageToDelete && selectedChatroom?.messages?.find(msg => msg.messageID === messageToDelete)?.senderID === userID ? (
                "Are you sure you want to delete this message? This action cannot be undone."
              ) : (
                "As an organizer, you can delete any message in this chatroom. This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteMessage} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting === messageToDelete ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ChatRoomList;