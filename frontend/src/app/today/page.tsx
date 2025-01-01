'use client';

import { useEffect, useState } from 'react';
import GenericHeading from '@/components/GenericHeading';
import { Divider } from '@/components/catalyst/divider';
import { ClipLoader } from "react-spinners";
import { Trash2, CheckCircle2, Calendar, Clock, AlertCircle, MessageCircle, ListTodo, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area"

interface Task {
  task_id: string;
  name: string;
  priority: 'High' | 'Medium' | 'Low';
  timeSlot: string;
  description?: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: { dateTime: string };
  end: { dateTime: string };
  description?: string;
}

type CombinedEvent = {
  id: string;
  title: string;
  time: string;
  type: 'task' | 'calendar';
  priority?: 'High' | 'Medium' | 'Low';
  description?: string;
};

interface Message {
  content: string;
  type: 'daily' | 'motivational';
  timestamp?: string;
}

export default function Profile() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [dailyMessage, setDailyMessage] = useState<string>('');
  const [motivationalMessage, setMotivationalMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [completionTimes, setCompletionTimes] = useState({
    startTime: new Date(),
    endTime: new Date(Date.now() + 30 * 60000)
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
          setIsLoading(true);
          
          // Fetch schedule data
          const scheduleResponse = await fetch('http://localhost:3400/api/today/schedule');
          const scheduleData = await scheduleResponse.json();
          setTasks(scheduleData.tasks || []);
          setEvents(scheduleData.events || []);
          
          // Fetch daily message
          const dailyResponse = await fetch('http://localhost:3400/api/today/daily-message');
          const dailyData = await dailyResponse.json();
          setDailyMessage(dailyData.message || '');
          
          // Fetch motivational message
          const motivationalResponse = await fetch('http://localhost:3400/api/today/motivational-message');
          const motivationalData = await motivationalResponse.json();
          setMotivationalMessage(motivationalData.message || '');
          
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      };
    fetchData();
  }, []);


  const handleDelete = async (taskId: string) => {
    try {
      await fetch(`http://localhost:3400/api/todos/delete/${taskId}`, {
        method: "DELETE",
      });
      setTasks(prev => prev.filter(task => task.task_id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const openCompleteModal = (task: Task) => {
    setSelectedTask(task);
    const now = new Date();
    const thirtyMinutesLater = new Date(now.getTime() + 30 * 60000);
    setCompletionTimes({
      startTime: now,
      endTime: thirtyMinutesLater
    });
    setIsCompleteModalOpen(true);
  };

  const handleComplete = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTask) return;

    try {
      const response = await fetch(
        `http://localhost:3400/api/todos/complete/${selectedTask.task_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            startTime: completionTimes.startTime.toISOString(),
            endTime: completionTimes.endTime.toISOString()
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark task as complete: ${response.statusText}`);
      }

      setTasks(prev => prev.filter(task => task.task_id !== selectedTask.task_id));
      setIsCompleteModalOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error(`Failed to mark task as complete:`, error);
    }
  };

  const adjustTime = (type: 'start' | 'end', adjustment: number) => {
    setCompletionTimes(prev => {
      const newTimes = { ...prev };
      const timeToAdjust = type === 'start' ? 'startTime' : 'endTime';
      const currentTime = new Date(prev[timeToAdjust]);
      currentTime.setMinutes(currentTime.getMinutes() + adjustment);
      
      if (type === 'start' && currentTime > prev.endTime) {
        newTimes.endTime = new Date(currentTime.getTime() + 30 * 60000);
      }
      
      if (type === 'end' && currentTime < prev.startTime) {
        return prev;
      }
      
      newTimes[timeToAdjust] = currentTime;
      return newTimes;
    });
  };

  const allEvents: CombinedEvent[] = [
    ...tasks.map(task => ({
      id: task.task_id,
      title: task.name,
      time: task.timeSlot,
      type: 'task' as const,
      priority: task.priority,
      description: task.description
    })),
    ...events.map(event => ({
      id: event.id,
      title: event.summary,
      time: event.start.dateTime,
      type: 'calendar' as const,
      description: event.description
    }))
  ].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getPriorityColor = (priority: 'High' | 'Medium' | 'Low') => {
    switch (priority) {
      case 'High':
        return 'text-red-700 bg-red-50 ring-red-600/20';
      case 'Medium':
        return 'text-yellow-700 bg-yellow-50 ring-yellow-600/20';
      case 'Low':
        return 'text-green-700 bg-green-50 ring-green-600/20';
    }
  };

  const renderMessage = (message: string) => {
    // Split sections by double newlines or section headers
    const sections = message.split(/\n\n+|\n(?=[A-Z]+:)/).filter(section => section.trim());
  
    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          // Check if this section is a header (e.g., "STATUS:", "NEXT STEPS:")
          const isHeader = section.trim().match(/^[A-Z\s]+:$/);
          
          if (isHeader) {
            return (
              <h3 key={index} className="text-base font-semibold text-indigo-600 tracking-wide uppercase border-b border-indigo-200 pb-1">
                {section.trim().replace(':', '')}
              </h3>
            );
          }
  
          // Handle bullet points and paragraphs
          const lines = section.split('\n');
          return (
            <div key={index} className="space-y-2">
              {lines.map((line, i) => {
                const trimmedLine = line.trim();
                if (!trimmedLine) return null;
  
                // Handle bullet points
                if (trimmedLine.startsWith('•') || trimmedLine.startsWith('-')) {
                  return (
                    <div key={i} className="flex items-start space-x-2 pl-2">
                      <span className="text-indigo-400 mt-1">•</span>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {formatMessageText(trimmedLine.slice(1).trim())}
                      </p>
                    </div>
                  );
                }
  
                // Handle regular paragraphs
                return (
                  <p key={i} className="text-sm text-gray-700 leading-relaxed font-medium">
                    {formatMessageText(trimmedLine)}
                  </p>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };
  
  const formatMessageText = (text: string) => {
    // Handle bold text (**text**)
    const boldFormatted = text.split(/\*\*(.*?)\*\*/g).map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-bold text-gray-900">{part}</strong> : part
    );
  
    // Process each part for underline and time-sensitive text
    return boldFormatted.map((part, i) => {
      if (typeof part !== 'string') return part;
      
      // Handle underlined text (__text__)
      return part.split(/__(.*?)__/g).map((subPart, j) => 
        j % 2 === 1 ? (
          <span key={`${i}-${j}`} className="underline decoration-indigo-400 decoration-2 font-medium text-gray-900">
            {subPart}
          </span>
        ) : subPart
      );
    });
  };

  return (
    <div className="p-6">
      <GenericHeading Heading="Today" />
      <Divider className="my-4" />

      <div className="grid grid-cols-12 gap-6">
        {/* Schedule Section - Spans 7 columns */}
        <div className="col-span-7">
          <Card className="h-[calc(100vh-8rem)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Schedule</CardTitle>
                  <CardDescription>Your timeline for today</CardDescription>
                </div>
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-12rem)] p-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <ClipLoader size={30} color="#4A90E2" loading={isLoading} />
                  </div>
                ) : allEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No events scheduled for today</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allEvents.map((item, index) => (
                      <div
                        key={item.id}
                        className="relative flex gap-4 pb-4 group"
                      >
                        {/* Timeline dot and line */}
                        <div className="absolute left-2 top-2 w-2 h-2 rounded-full bg-gray-300 group-hover:bg-blue-500" />
                        {index !== allEvents.length - 1 && (
                          <div className="absolute left-2.5 top-4 w-0.5 h-full -ml-px bg-gray-200" />
                        )}
                        
                        {/* Content */}
                        <div className="ml-8 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.title}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatTime(item.time)}
                              </p>
                            </div>
                            
                            {item.type === 'task' && (
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(item.priority!)}`}>
                                  {item.priority}
                                </span>
                                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      const task = tasks.find(t => t.task_id === item.id);
                                      if (task) openCompleteModal(task);
                                    }}
                                    className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                          {item.description && (
                            <p className="mt-1 text-sm text-gray-600">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Messages Section - Spans 5 columns */}
        <div className="col-span-5 space-y-6">
          {/* Daily Overview */}
          <Card className="h-[calc(100vh-8rem)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Daily Overview</CardTitle>
                  <CardDescription>Your tasks and objectives</CardDescription>
                </div>
                <ListTodo className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {isLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <ClipLoader size={30} color="#4A90E2" loading={isLoading} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renderMessage(dailyMessage)}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Motivational Message */}
          {/* <Card className="h-[calc(50vh-7rem)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">Read Me</CardTitle>
                  <CardDescription>The right mindset</CardDescription>
                </div>
                <Sparkles className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(50vh-14rem)]">
                {isLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <ClipLoader size={30} color="#4A90E2" loading={isLoading} />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {renderMessage(motivationalMessage)}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Complete Task Modal */}
      {isCompleteModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Complete Task</h2>
              <p className="text-gray-600">{selectedTask.name}</p>
            </div>

            <form onSubmit={handleComplete} className="space-y-6">
              {/* Start Time Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  When did you start?
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => adjustTime('start', -15)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    -15m
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-lg font-medium">
                      {completionTimes.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {completionTimes.startTime.toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustTime('start', 15)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    +15m
                  </button>
                </div>
              </div>

              {/* End Time Section */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  When did you finish?
                </label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => adjustTime('end', -15)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    -15m
                  </button>
                  <div className="flex-1 text-center">
                    <div className="text-lg font-medium">
                      {completionTimes.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {completionTimes.endTime.toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => adjustTime('end', 15)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    +15m
                  </button>
                </div>
              </div>

              {/* Duration Display */}
              <div className="text-center text-sm text-gray-500">
                Duration: {Math.round((completionTimes.endTime.getTime() - completionTimes.startTime.getTime()) / 60000)} minutes
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsCompleteModalOpen(false);
                    setSelectedTask(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-md hover:bg-green-600"
                >
                  Complete Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}