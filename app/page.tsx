"use client"

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export default function ClassTimerDashboard() {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [title, setTitle] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
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
    
    setIsConfigured(true);
    setIsRunning(true);
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
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
      <div className="h-full">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full flex flex-col">
          <div className="text-center mb-6">
            <h1 className="text-6xl font-bold text-gray-900 mb-2">
              {isConfigured && title ? title : '課堂計時器'}
            </h1>
            <p className="text-gray-500">設定課堂時間並追蹤進度</p>
          </div>

          {/* Time Input Section */}
          {!isRunning && (
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">課程標題</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：數學課、團隊會議"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">開始時間</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">結束時間</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg bg-white"
                />
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Play size={20} />
                開始課程
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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

          {/* Status Display */}
          {isConfigured && (
            <div className="flex-1 flex flex-col">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Current Time */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Clock size={32} className="text-gray-600" />
                    <h3 className="text-2xl font-medium text-gray-900">目前時間</h3>
                  </div>
                  <p className="text-6xl font-semibold text-gray-900">{formatTime(currentTime)}</p>
                </div>

                {/* Time Remaining */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">剩餘時間</h3>
                  <div className="text-6xl font-semibold text-gray-900">
                    {isClassEnded ? (
                      '課程結束'
                    ) : (
                      <div className="flex justify-center items-baseline gap-2">
                        <div className="flex flex-col items-center">
                          <span>{timeRemaining.hours.toString().padStart(2, '0')}</span>
                          <span className="text-lg text-gray-600">時</span>
                        </div>
                        <span className="text-4xl">:</span>
                        <div className="flex flex-col items-center">
                          <span>{timeRemaining.minutes.toString().padStart(2, '0')}</span>
                          <span className="text-lg text-gray-600">分</span>
                        </div>
                        <span className="text-4xl">:</span>
                        <div className="flex flex-col items-center">
                          <span>{timeRemaining.seconds.toString().padStart(2, '0')}</span>
                          <span className="text-lg text-gray-600">秒</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Class Status */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <h3 className="text-2xl font-medium text-gray-900 mb-4">狀態</h3>
                  <p className="text-4xl font-semibold text-gray-900">
                    {isClassActive ? '進行中' : isClassEnded ? '已完成' : '未開始'}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-700">課程進度</span>
                  <span className="text-lg font-medium text-gray-700">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gray-900 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Class Duration Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                <p className="text-lg text-gray-600">
                  {title && <span className="font-medium text-gray-900 block mb-2">{title}</span>}
                  課程時間從 <span className="font-medium text-gray-900">{startTime}</span> 到 <span className="font-medium text-gray-900">{endTime}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}