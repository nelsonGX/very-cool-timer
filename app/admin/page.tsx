"use client"

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, MessageCircle, Send, Trash2 } from 'lucide-react';

interface Timer {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: number;
  content: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPanel() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConfigured, setIsConfigured] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [timers, setTimers] = useState<Timer[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    loadMessages();
    loadTimers();
    return () => clearInterval(timer);
  }, []);

  const loadMessages = async () => {
    try {
      const response = await fetch('/api/messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadTimers = async () => {
    try {
      const response = await fetch('/api/timers');
      const data = await response.json();
      setTimers(data);
    } catch (error) {
      console.error('Error loading timers:', error);
    }
  };

  const handleStart = async () => {
    if (!startTime || !endTime) {
      alert('請設定開始和結束時間');
      return;
    }
    
    const start = new Date();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    start.setHours(startHours, startMinutes, 0, 0);
    const end = new Date(start);
    end.setHours(endHours, endMinutes, 0, 0);
    
    if (end <= start) {
      alert('結束時間必須在開始時間之後');
      return;
    }
    
    try {
      const response = await fetch('/api/timers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          startTime,
          endTime,
          isActive: true,
        }),
      });
      
      if (response.ok) {
        setIsConfigured(true);
        setIsRunning(true);
        loadTimers();
      }
    } catch (error) {
      console.error('Error creating timer:', error);
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsConfigured(false);
    setStartTime('');
    setEndTime('');
    setTitle('');
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
        }),
      });
      
      if (response.ok) {
        setMessage('');
        loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (id: number) => {
    try {
      const response = await fetch(`/api/messages/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        loadMessages();
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  const getTimeRemaining = () => {
    if (!startTime || !endTime) return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    
    const now = new Date();
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    const diff = endDate.getTime() - now.getTime();
    const totalSeconds = Math.max(0, Math.floor(diff / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return { hours, minutes, seconds, totalSeconds };
  };

  const getProgress = () => {
    if (!startTime || !endTime) return 0;
    
    const now = new Date();
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, 0, 0);
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, 0, 0);
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };

  const timeRemaining = getTimeRemaining();
  const progress = getProgress();
  const isClassActive = isRunning && timeRemaining.totalSeconds > 0;
  const isClassEnded = isConfigured && timeRemaining.totalSeconds === 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">管理員面板</h1>
            <p className="text-gray-500">管理計時器和訊息</p>
          </div>

          {/* Timer Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">計時器設定</h2>
            
            {!isRunning && (
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">課程標題</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="例如：數學課、團隊會議"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">開始時間</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">結束時間</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4 mb-6">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Play size={20} />
                  開始課程
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  <Pause size={20} />
                  暫停
                </button>
              )}
              <button
                onClick={handleReset}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <RotateCcw size={20} />
                重置
              </button>
            </div>

            {isConfigured && (
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock size={24} className="text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">目前時間</h3>
                  </div>
                  <p className="text-3xl font-semibold text-gray-900">{formatTime(currentTime)}</p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">剩餘時間</h3>
                  <div className="text-3xl font-semibold text-gray-900">
                    {isClassEnded ? (
                      '課程結束'
                    ) : (
                      `${timeRemaining.hours.toString().padStart(2, '0')}:${timeRemaining.minutes.toString().padStart(2, '0')}:${timeRemaining.seconds.toString().padStart(2, '0')}`
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">狀態</h3>
                  <p className="text-2xl font-semibold text-gray-900">
                    {isClassActive ? '進行中' : isClassEnded ? '已完成' : '未開始'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Message Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">訊息管理</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="輸入要發送的訊息..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg bg-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
              </div>
              <button
                onClick={handleSendMessage}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Send size={20} />
                發送
              </button>
            </div>

            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <MessageCircle size={20} className="text-gray-600" />
                    <span className="text-gray-900">{msg.content}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      {new Date(msg.createdAt).toLocaleString('zh-TW')}
                    </span>
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}