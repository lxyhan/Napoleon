'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Activity, Droplets, Dumbbell, Moon, CheckCircle, Flame, Target, TrendingUp, Loader2 } from 'lucide-react';
import { format, addDays, startOfToday, getDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface Metrics {
  workout: boolean;
  water: boolean;
  supplements: boolean;
  sleep: boolean;
  accountability: boolean;
}

interface MetricCompletion {
  name: string;
  rate: number;
}

interface DayData {
  date: string;
  metrics: Metrics;
  updated_at?: string;
}

interface CalendarDayProps {
  date: Date;
  metrics: Metrics | undefined;
  isSelected: boolean;
  onClick: () => void;
}

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full w-full">
    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
  </div>
);

const CalendarDay: React.FC<CalendarDayProps> = ({ date, metrics, isSelected, onClick }) => {
  const completedTasks = metrics ? Object.values(metrics).filter(Boolean).length : 0;
  const isTodays = isSameDay(date, new Date());
  
  const getTaskIcons = () => {
    if (!metrics) return null;
    return (
      <div className="grid grid-cols-5 gap-[2px]">
        {metrics.workout && <Dumbbell className="h-2.5 w-2.5 text-blue-600" />}
        {metrics.water && <Droplets className="h-2.5 w-2.5 text-blue-600" />}
        {metrics.supplements && <Activity className="h-2.5 w-2.5 text-blue-600" />}
        {metrics.sleep && <Moon className="h-2.5 w-2.5 text-blue-600" />}
        {metrics.accountability && <CheckCircle className="h-2.5 w-2.5 text-blue-600" />}
      </div>
    );
  };
  
  return (
    <div
      onClick={onClick}
      className={`
        p-2 rounded-lg cursor-pointer transition-all h-20
        ${completedTasks === 0 ? 'bg-gray-50 hover:bg-gray-100' : ''}
        ${completedTasks === 1 || completedTasks === 2 ? 'bg-blue-50 hover:bg-blue-100' : ''}
        ${completedTasks === 3 || completedTasks === 4 ? 'bg-green-50 hover:bg-green-100' : ''}
        ${completedTasks === 5 ? 'bg-green-100 hover:bg-green-200' : ''}
        ${isSelected ? 'ring-2 ring-blue-500' : 'ring-1 ring-gray-200'}
        ${isTodays ? 'ring-2 ring-orange-500' : ''}
      `}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium ${isTodays ? 'text-orange-600' : ''}`}>
            {format(date, 'd')}
          </span>
          <span className="text-xs text-gray-500">
            {completedTasks}/5
          </span>
        </div>
        <div className="mt-auto">
          {getTaskIcons()}
        </div>
      </div>
    </div>
  );
};

const DailyGoal: React.FC<{
  icon: React.ElementType;
  label: string;
  description: string;
  isCompleted: boolean;
  onClick: () => void;
}> = ({ icon: Icon, label, description, isCompleted, onClick }) => (
  <button
    onClick={onClick}
    className={`
      w-full p-4 rounded-lg border transition-all text-left space-y-2
      ${isCompleted ? 'bg-blue-50 border-blue-200' : 'bg-white hover:bg-gray-50'}
    `}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-full ${isCompleted ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <Icon className={`h-5 w-5 ${isCompleted ? 'text-blue-600' : 'text-gray-600'}`} />
        </div>
        <span className="font-medium">{label}</span>
      </div>
      {isCompleted && <CheckCircle className="h-5 w-5 text-blue-600" />}
    </div>
    <p className="text-sm text-gray-600 pl-12">{description}</p>
  </button>
);

const HealthTracker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [metrics, setMetrics] = useState<Metrics>({
    workout: false,
    water: false,
    supplements: false,
    sleep: false,
    accountability: false
  });
  const [gridData, setGridData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGridData = async () => {
      setLoading(true);
      setError(null);
      try {
        const startDate = '2025-01-06';
        const endDate = format(addDays(startOfToday(), 30), 'yyyy-MM-dd');
        
        const response = await fetch(`http://localhost:3400/api/tracker/metrics/range/${startDate}/${endDate}`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        
        const data: DayData[] = await response.json();
        setGridData(data);
        
        const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
        const selectedDayData = data.find(d => d.date === selectedDateStr);
        if (selectedDayData) {
          setMetrics(selectedDayData.metrics);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGridData();
  }, [selectedDate]);

  const analyticsData = useMemo(() => {
    const startDate = new Date('2025-01-06');
    
    // Filter data from Jan 6th 2025 onwards
    const filteredData = gridData.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= startDate;
    });

    const weeklyData = filteredData.reduce((acc: any[], day) => {
      if (!day.metrics) return acc;
      const week = format(new Date(day.date), 'MMM d');
      const completedTasks = Object.values(day.metrics).filter(Boolean).length;
      acc.push({
        date: week,
        completion: (completedTasks / 5) * 100
      });
      return acc;
    }, []);

    const metricCompletion = Object.keys(metrics).reduce((acc: Record<string, MetricCompletion>, metric: string) => {
      const completed = filteredData.filter(day => day.metrics && day.metrics[metric as keyof Metrics]).length;
      acc[metric] = {
        name: metric,
        rate: (completed / filteredData.length) * 100
      };
      return acc;
    }, {});

    let currentStreak = 0;
    // Only consider streak from filtered data
    for (let i = 0; i < filteredData.length; i++) {
      const day = filteredData[i];
      if (!day.metrics) break;
      const completedTasks = Object.values(day.metrics).filter(Boolean).length;
      if (completedTasks >= 3) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      weeklyData,
      metricCompletion: Object.values(metricCompletion),
      currentStreak,
      weeklyAverage: Math.round(weeklyData.reduce((acc, day) => acc + day.completion, 0) / weeklyData.length)
    };
  }, [gridData]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const date = format(selectedDate, 'yyyy-MM-dd');
      const response = await fetch(`http://localhost:3400/api/tracker/metrics/${date}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
      
      if (!response.ok) throw new Error('Failed to save metrics');
      
      const updatedData = gridData.map(day => 
        day.date === date 
          ? { ...day, metrics, updated_at: new Date().toISOString() } 
          : day
      );
      setGridData(updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="w-full p-6">
      {/* Header with Today's Date */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Health Tracker</h2>
        <div className="text-lg font-medium text-blue-600">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          <div className="bg-white rounded-lg p-6 h-[600px]">
            <LoadingSpinner />
          </div>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 bg-gray-100 rounded-lg" />
              ))}
            </div>
            <div className="bg-white rounded-lg p-6 h-[400px]">
              <LoadingSpinner />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
          {/* Left Column - Daily Goals */}
          <div className="space-y-3">
            <DailyGoal
              icon={Dumbbell}
              label="Complete Workout"
              description="Finish your planned workout for the day"
              isCompleted={metrics.workout}
              onClick={() => setMetrics(prev => ({ ...prev, workout: !prev.workout }))}
            />
            <DailyGoal
              icon={Droplets}
              label="Water Intake"
              description="Drink at least 2L of water"
              isCompleted={metrics.water}
              onClick={() => setMetrics(prev => ({ ...prev, water: !prev.water }))}
            />
            <DailyGoal
              icon={Activity}
              label="Take Supplements"
              description="Protein and creatine supplements"
              isCompleted={metrics.supplements}
              onClick={() => setMetrics(prev => ({ ...prev, supplements: !prev.supplements }))}
            />
            <DailyGoal
              icon={Moon}
              label="Sleep Schedule"
              description="In bed before 11:30 PM"
              isCompleted={metrics.sleep}
              onClick={() => setMetrics(prev => ({ ...prev, sleep: !prev.sleep }))}
            />
            <DailyGoal
              icon={CheckCircle}
              label="Daily Check-in"
              description="Record your progress in the app"
              isCompleted={metrics.accountability}
              onClick={() => setMetrics(prev => ({ ...prev, accountability: !prev.accountability }))}
            />
            <button
              onClick={handleSave}
              disabled={loading}
              className={`
                w-full px-4 py-3 rounded-lg font-medium mt-6
                ${loading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}
                text-white transition-colors
              `}
            >
              {loading ? 'Saving...' : 'Save Progress'}
            </button>
          </div>

          {/* Right Column - Analytics */}
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Current Streak</div>
                <div className="flex items-center mt-1">
                  <Flame className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="text-2xl font-bold">{analyticsData.currentStreak} days</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Weekly Average</div>
                <div className="flex items-center mt-1">
                  <Target className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{analyticsData.weeklyAverage}%</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Most Consistent</div>
                <div className="flex items-center mt-1">
                  <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold capitalize">
                    {analyticsData.metricCompletion
                      .sort((a: MetricCompletion, b: MetricCompletion) => b.rate - a.rate)
                      .find((metric: MetricCompletion) => metric.name)?.name || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="text-sm font-medium mb-4">Progress Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Overview Calendar */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium">Monthly Overview</h3>
                <div className="text-xs text-gray-500">
                  Click a day to update goals
                </div>
              </div>
              
              {/* Days of Week Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-medium text-gray-500 text-center">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Add empty cells for proper alignment with weekday headers */}
                {Array.from({ length: getDay(startOfToday()) }).map((_, index) => (
                  <div key={`empty-${index}`} className="h-20" />
                ))}
                {/* Show next 30 days starting from today */}
                {Array.from({ length: 30 }).map((_, index) => {
                  const date = addDays(startOfToday(), index);
                  const dateStr = format(date, 'yyyy-MM-dd');
                  const dayData = gridData.find(d => d.date === dateStr);
                  
                  return (
                    <CalendarDay
                      key={dateStr}
                      date={date}
                      metrics={dayData?.metrics}
                      isSelected={format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')}
                      onClick={() => setSelectedDate(date)}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center justify-end gap-4 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-50 rounded" />
                  <span>No tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-50 rounded" />
                  <span>1-2 tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-50 rounded" />
                  <span>3-4 tasks</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 rounded" />
                  <span>All tasks</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthTracker;