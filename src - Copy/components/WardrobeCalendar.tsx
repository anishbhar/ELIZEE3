import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Trash2,
  Clock,
  Tag,
  Check,
  X,
  Layers,
  ArrowRight,
  Info,
  CalendarDays,
  ListOrdered,
  Eye,
  Shirt,
} from 'lucide-react';
import { useFashion } from '../context/FashionContext.tsx';
import { FashionItem, ScheduledOutfit, SavedOutfit } from '../types/fashion.ts';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const OCCASIONS = [
  'Casual Day Out',
  'Work/Office',
  'Date Night',
  'Wedding/Celebration',
  'College',
  'Travel',
];

export const WardrobeCalendar: React.FC = () => {
  const {
    wardrobe,
    savedOutfits,
    schedule,
    setScheduleDay,
    deleteScheduleDay,
    autoPlanWeekSchedule,
    setSelectedProductDetail,
    setActiveTab,
  } = useFashion();

  // Current view date in calendar (defaults to today)
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Selected day for assignment drawer / modal
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Form state for selected day
  const [editingTitle, setEditingTitle] = useState('');
  const [editingOccasion, setEditingOccasion] = useState('Casual Day Out');
  const [editingNotes, setEditingNotes] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [wardrobeCategoryFilter, setWardrobeCategoryFilter] = useState('All');
  const [isAutoPlanning, setIsAutoPlanning] = useState(false);
  const [critiqueText, setCritiqueText] = useState<string | null>(null);
  const [isCritiquing, setIsCritiquing] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Days in month calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days: {
      dateString: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const prevDate = new Date(year, month - 1, d);
      const dateString = prevDate.toISOString().split('T')[0];
      days.push({
        dateString,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      const curr = new Date(year, month, d);
      const dateString = curr.toISOString().split('T')[0];
      days.push({
        dateString,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateString === todayStr,
      });
    }

    // Next month padding to fill grid (multiple of 7)
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining && days.length < 42; d++) {
      const nextDate = new Date(year, month + 1, d);
      const dateString = nextDate.toISOString().split('T')[0];
      days.push({
        dateString,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateString === todayStr,
      });
    }

    return days;
  }, [year, month]);

  // Lookup map for fast schedule retrieval
  const scheduleByDate = useMemo(() => {
    const map = new Map<string, ScheduledOutfit>();
    schedule.forEach((s) => {
      map.set(s.date, s);
    });
    return map;
  }, [schedule]);

  // Upcoming scheduled outfits sorted chronologically
  const upcomingSchedule = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return [...schedule]
      .filter((s) => s.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [schedule]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDayDate(now.toISOString().split('T')[0]);
  };

  // Open modal for day assignment
  const handleOpenDayModal = (dateString: string) => {
    setSelectedDayDate(dateString);
    const existing = scheduleByDate.get(dateString);

    if (existing) {
      setEditingTitle(existing.title);
      setEditingOccasion(existing.occasion);
      setEditingNotes(existing.notes || '');
      setSelectedItemIds(existing.items.map((i) => i.id));
    } else {
      const dateObj = new Date(dateString + 'T00:00:00');
      const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
      setEditingTitle(isWeekend ? 'Weekend Chic Ensemble' : 'Daily Styling Look');
      setEditingOccasion(isWeekend ? 'Casual Day Out' : 'Work/Office');
      setEditingNotes('');
      setSelectedItemIds([]);
    }
    setCritiqueText(null);
    setIsDayModalOpen(true);
  };

  // Toggle item selection for day
  const handleToggleItemForDay = (productId: string) => {
    setSelectedItemIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  };

  // Import from a saved outfit collection
  const handleImportSavedOutfit = (saved: SavedOutfit) => {
    setEditingTitle(saved.title);
    setEditingOccasion(saved.occasion);
    setSelectedItemIds(saved.items.map((i) => i.id));
    if (saved.stylistNotes) {
      setEditingNotes(saved.stylistNotes);
    }
  };

  // Save day schedule
  const handleSaveDaySchedule = async () => {
    if (!selectedDayDate) return;

    if (selectedItemIds.length === 0) {
      // If no items, delete the schedule entry for this day
      await deleteScheduleDay(selectedDayDate);
      setIsDayModalOpen(false);
      return;
    }

    await setScheduleDay({
      date: selectedDayDate,
      title: editingTitle || 'Daily Styling Outfit',
      occasion: editingOccasion,
      itemIds: selectedItemIds,
      notes: editingNotes,
    });

    setIsDayModalOpen(false);
  };

  // Delete day schedule
  const handleDeleteDaySchedule = async () => {
    if (!selectedDayDate) return;
    await deleteScheduleDay(selectedDayDate);
    setIsDayModalOpen(false);
  };

  // Auto-plan week with AI
  const handleAutoPlanWeek = async () => {
    if (wardrobe.length === 0) {
      alert('Please add some items to your digital wardrobe first!');
      return;
    }
    setIsAutoPlanning(true);
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      await autoPlanWeekSchedule(todayStr);
    } catch (err) {
      console.error('Failed to auto-plan week:', err);
    } finally {
      setIsAutoPlanning(false);
    }
  };

  // Filter wardrobe items for picker in modal
  const filteredWardrobeForPicker = useMemo(() => {
    if (wardrobeCategoryFilter === 'All') return wardrobe;
    return wardrobe.filter(
      (w) => w.product.category.toLowerCase() === wardrobeCategoryFilter.toLowerCase()
    );
  }, [wardrobe, wardrobeCategoryFilter]);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ================= CALENDAR HEADER & ACTION BAR ================= */}
      <div className="p-6 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#22211e] text-[#faf9f6] flex items-center justify-center font-serif text-lg font-bold shadow-sm">
            <CalendarIcon className="w-5 h-5 text-[#d9a87d]" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
              Visual Styling Schedule
            </h3>
            <p className="text-xs text-[#706659]">
              Assign your saved wardrobe pieces to specific days. Plan weekly rotations with confidence.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* AI Auto-Plan Week Button */}
          <button
            onClick={handleAutoPlanWeek}
            disabled={isAutoPlanning || wardrobe.length === 0}
            className="px-4 py-2 bg-[#22211e] hover:bg-[#38332c] text-[#faf9f6] text-xs uppercase tracking-wider font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#d9a87d] ${isAutoPlanning ? 'animate-spin' : ''}`} />
            <span>{isAutoPlanning ? 'Styling 7 Days...' : 'Auto-Plan Week with AI'}</span>
          </button>

          {/* Jump to Today */}
          <button
            onClick={handleJumpToday}
            className="px-3.5 py-2 rounded-xl border border-[#d6ccbd] hover:bg-[#ede5d8] text-xs font-semibold uppercase tracking-wider text-[#3d3830] transition-colors cursor-pointer"
          >
            Today
          </button>

          {/* View Toggle */}
          <div className="p-1 bg-[#ede6da] rounded-xl inline-flex border border-[#ded5c7]">
            <button
              onClick={() => setViewMode('month')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'month' ? 'bg-[#22211e] text-white shadow-sm' : 'text-[#5e5345]'
              }`}
              title="Month Grid View"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === 'agenda' ? 'bg-[#22211e] text-white shadow-sm' : 'text-[#5e5345]'
              }`}
              title="Agenda Timeline View"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ================= MONTH NAVIGATION BAR ================= */}
      {viewMode === 'month' && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-3xl font-semibold text-[#1c1a17]">
              {monthNames[month]} {year}
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#eee5d8] text-[#5c5042] font-semibold">
              {schedule.length} Days Scheduled
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-full hover:bg-[#ede5d8] text-[#544a3d] transition-colors cursor-pointer"
              title="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded-full hover:bg-[#ede5d8] text-[#544a3d] transition-colors cursor-pointer"
              title="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ================= VIEW 1: MONTH CALENDAR GRID ================= */}
      {viewMode === 'month' && (
        <div className="bg-[#faf8f5] rounded-3xl border border-[#ded5c7] shadow-sm overflow-hidden">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 border-b border-[#ded5c7] bg-[#f2ece2] text-center text-xs font-semibold text-[#665a4c] uppercase tracking-wider py-3">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* 42 Calendar Cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#ded5c7]">
            {calendarDays.map((cell, idx) => {
              const daySchedule = scheduleByDate.get(cell.dateString);
              const isSelected = selectedDayDate === cell.dateString;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenDayModal(cell.dateString)}
                  className={`min-h-[125px] sm:min-h-[145px] p-2 sm:p-2.5 flex flex-col justify-between transition-all cursor-pointer group ${
                    cell.isCurrentMonth ? 'bg-[#faf8f5]' : 'bg-[#f4efe6]/50 opacity-60'
                  } ${
                    cell.isToday
                      ? 'ring-2 ring-inset ring-[#22211e] bg-[#fbf9f4]'
                      : 'hover:bg-[#f2ece1]'
                  } ${isSelected ? 'bg-[#eee7dc]' : ''}`}
                >
                  {/* Top Bar of Day Cell: Number & Occasion */}
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={`text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center ${
                        cell.isToday
                          ? 'bg-[#22211e] text-[#faf9f6] shadow-sm'
                          : 'text-[#473f34]'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {daySchedule && (
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md font-bold truncate max-w-[80px] bg-[#e8ded1] text-[#5e4f3f]">
                        {daySchedule.occasion.split(' ')[0]}
                      </span>
                    )}
                  </div>

                  {/* Body: Scheduled Outfit Thumbnails or Empty Prompt */}
                  {daySchedule && daySchedule.items.length > 0 ? (
                    <div className="mt-1 flex-1 flex flex-col justify-between">
                      {/* Outfit Title */}
                      <p className="text-[11px] font-semibold text-[#1c1a17] line-clamp-1 leading-tight group-hover:text-[#a07855] transition-colors">
                        {daySchedule.title}
                      </p>

                      {/* Mini Garment Thumbnails Stack */}
                      <div className="flex items-center gap-1 mt-1.5">
                        {daySchedule.items.slice(0, 3).map((item, iIdx) => (
                          <img
                            key={iIdx}
                            src={item.image}
                            alt={item.name}
                            title={`${item.category}: ${item.name}`}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg object-cover ring-1 ring-white shadow-xs"
                          />
                        ))}
                        {daySchedule.items.length > 3 && (
                          <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#22211e] text-white text-[10px] font-bold flex items-center justify-center">
                            +{daySchedule.items.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-[#8a7f72] flex items-center gap-1">
                        <Plus className="w-3 h-3 text-[#a07855]" />
                        <span>Plan Look</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 2: AGENDA / TIMELINE VIEW ================= */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
              Chronological Styling Agenda
            </h3>
            <span className="text-xs text-[#706659]">
              Showing {upcomingSchedule.length} upcoming scheduled outfits
            </span>
          </div>

          {upcomingSchedule.length === 0 ? (
            <div className="py-16 text-center bg-[#faf8f5] rounded-3xl border border-[#ded5c7] max-w-md mx-auto p-6">
              <CalendarDays className="w-10 h-10 text-[#9e9282] mx-auto mb-2" />
              <h4 className="font-serif text-xl font-semibold text-[#1c1a17]">
                No Upcoming Outfits Scheduled
              </h4>
              <p className="text-xs text-[#786e61] mt-1 mb-4">
                Click on any calendar day or use "Auto-Plan Week with AI" to generate your daily outfits.
              </p>
              <button
                onClick={handleAutoPlanWeek}
                className="px-5 py-2.5 bg-[#22211e] text-white text-xs uppercase tracking-wider font-semibold rounded-xl hover:bg-[#38332c]"
              >
                Auto-Plan This Week
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcomingSchedule.map((sched) => {
                const dateObj = new Date(sched.date + 'T00:00:00');
                const isToday = sched.date === new Date().toISOString().split('T')[0];

                return (
                  <div
                    key={sched.id}
                    onClick={() => handleOpenDayModal(sched.date)}
                    className="p-5 rounded-3xl bg-[#faf8f5] border border-[#ded5c7] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                              isToday
                                ? 'bg-[#22211e] text-white'
                                : 'bg-[#eee5d8] text-[#524739]'
                            }`}
                          >
                            {isToday ? 'Today' : dateObj.toLocaleDateString('en-US', { weekday: 'short' })} • {dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#e3dacd] font-bold text-[#473f34]">
                            {sched.occasion}
                          </span>
                        </div>
                        <h4 className="font-serif text-xl font-semibold text-[#1c1a17] mt-1 group-hover:text-[#a07855] transition-colors">
                          {sched.title}
                        </h4>
                      </div>

                      <span className="text-xs font-semibold text-[#a07855] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        <span>Edit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Garments Preview */}
                    <div className="grid grid-cols-4 gap-2">
                      {sched.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-xl overflow-hidden bg-[#e8dfd3]"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 left-1 right-1 px-1 py-0.2 bg-black/60 backdrop-blur-sm text-white text-[8px] rounded text-center truncate">
                            {item.category}
                          </span>
                        </div>
                      ))}
                    </div>

                    {sched.notes && (
                      <p className="text-xs text-[#706659] italic bg-[#f2ece2] p-2.5 rounded-xl border border-[#ded5c7]">
                        "{sched.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= DAY OUTFIT ASSIGNMENT MODAL ================= */}
      {isDayModalOpen && selectedDayDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#faf8f5] rounded-3xl max-w-2xl w-full border border-[#ded5c7] shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#eee7db] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#a07855] font-bold">
                  Daily Outfit Assignment
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#1c1a17]">
                  {new Date(selectedDayDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <button
                onClick={() => setIsDayModalOpen(false)}
                className="p-2 rounded-full text-[#7a7165] hover:text-[#1c1a17] hover:bg-[#ede5d8] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Title & Occasion */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                    Outfit Look Title
                  </label>
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    placeholder="e.g. Creative Client Meeting, Riviera Weekend"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#d6ccbd] rounded-xl text-sm text-[#1c1a17] focus:outline-none focus:ring-2 focus:ring-[#22211e]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                    Occasion
                  </label>
                  <select
                    value={editingOccasion}
                    onChange={(e) => setEditingOccasion(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#d6ccbd] rounded-xl text-sm text-[#1c1a17] focus:outline-none focus:ring-2 focus:ring-[#22211e]"
                  >
                    {OCCASIONS.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Currently Selected Pieces for This Day */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#524b42]">
                    Garments Assigned for This Day ({selectedItemIds.length})
                  </label>
                  {selectedItemIds.length > 0 && (
                    <button
                      onClick={() => setSelectedItemIds([])}
                      className="text-[11px] text-[#8a7f72] hover:text-red-700"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>

                {selectedItemIds.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-[#ded5c7] rounded-2xl bg-white/60">
                    <Shirt className="w-8 h-8 text-[#998d7d] mx-auto mb-1.5" />
                    <p className="text-xs text-[#706659]">
                      No garments assigned yet. Select pieces from your digital wardrobe below!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {selectedItemIds.map((id) => {
                      const item = wardrobe.find((w) => w.product.id === id)?.product;
                      if (!item) return null;

                      return (
                        <div
                          key={id}
                          className="relative p-2 bg-white rounded-xl border border-[#ded5c7] flex flex-col justify-between"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full aspect-square rounded-lg object-cover"
                          />
                          <div className="mt-1.5">
                            <span className="text-[9px] uppercase font-bold text-[#a07855]">
                              {item.category}
                            </span>
                            <p className="text-[11px] font-semibold text-[#1c1a17] line-clamp-1">
                              {item.name}
                            </p>
                          </div>
                          <button
                            onClick={() => handleToggleItemForDay(id)}
                            className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-red-700 transition-colors"
                            title="Remove from day"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick 1-Click Import from Saved Outfit Collections */}
              {savedOutfits.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#f2ece2] border border-[#ded5c7]">
                  <p className="text-[11px] uppercase tracking-wider text-[#665a4c] font-bold mb-2">
                    Quick Assign from Saved Outfit Collections:
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {savedOutfits.map((outfit) => (
                      <button
                        key={outfit.id}
                        type="button"
                        onClick={() => handleImportSavedOutfit(outfit)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#ede5d8] border border-[#d6ccbd] text-xs text-[#2b2722] font-medium shrink-0 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Layers className="w-3 h-3 text-[#a07855]" />
                        <span>{outfit.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Wardrobe Items Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#524b42]">
                    Select From Your Digital Wardrobe ({wardrobe.length} total)
                  </label>
                </div>

                {/* Category filter pills for picker */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none mb-3">
                  {['All', 'Shirts', 'T-Shirts', 'Tops', 'Pants', 'Jeans', 'Shoes', 'Heels', 'Bags', 'Accessories'].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setWardrobeCategoryFilter(cat)}
                        className={`px-3 py-1 rounded-full text-xs transition-colors ${
                          wardrobeCategoryFilter === cat
                            ? 'bg-[#22211e] text-white'
                            : 'bg-white border border-[#ded5c7] text-[#473f35] hover:bg-[#eee7dc]'
                        }`}
                      >
                        {cat}
                      </button>
                    )
                  )}
                </div>

                {filteredWardrobeForPicker.length === 0 ? (
                  <p className="text-xs text-[#8a7f72] py-4 text-center">
                    No wardrobe items in this category.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-1 border border-[#ded5c7] rounded-2xl bg-white">
                    {filteredWardrobeForPicker.map((wb) => {
                      const prod = wb.product;
                      const isSelected = selectedItemIds.includes(prod.id);

                      return (
                        <div
                          key={prod.id}
                          onClick={() => handleToggleItemForDay(prod.id)}
                          className={`relative p-1.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-[#22211e] bg-[#f5efe6] ring-2 ring-[#22211e]'
                              : 'border-transparent hover:border-[#ded5c7]'
                          }`}
                        >
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full aspect-square rounded-lg object-cover"
                          />
                          <p className="text-[10px] font-medium text-[#1c1a17] line-clamp-1 mt-1">
                            {prod.name}
                          </p>

                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#22211e] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Styling Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#524b42] mb-1.5">
                  Daily Styling Note
                </label>
                <input
                  type="text"
                  value={editingNotes}
                  onChange={(e) => setEditingNotes(e.target.value)}
                  placeholder="e.g. Roll sleeves twice, pair with minimal watch, carry tote for laptop"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#d6ccbd] rounded-xl text-xs sm:text-sm text-[#1c1a17] focus:outline-none focus:ring-2 focus:ring-[#22211e]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#eee7db] flex items-center justify-between">
              {scheduleByDate.has(selectedDayDate) ? (
                <button
                  type="button"
                  onClick={handleDeleteDaySchedule}
                  className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-red-700 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear This Day</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDayModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold text-[#5c5144] hover:bg-[#ede5d8]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveDaySchedule}
                  className="px-6 py-2.5 bg-[#22211e] hover:bg-[#38332c] text-white text-xs uppercase tracking-wider font-semibold rounded-xl shadow-sm transition-all"
                >
                  Save Day Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
