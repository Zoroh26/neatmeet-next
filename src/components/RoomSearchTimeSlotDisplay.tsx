import React from 'react';

interface TimeSlot {
  start_time: string;
  end_time: string;
}

export const RoomSearchTimeSlotDisplay: React.FC<{ timeSlot: TimeSlot; duration: number; className?: string }> = ({ timeSlot, duration, className }) => {
  const [date, setDate] = React.useState('');
  const [start, setStart] = React.useState('');
  const [end, setEnd] = React.useState('');
  React.useEffect(() => {
    setDate(new Date(timeSlot.start_time).toLocaleDateString());
    setStart(new Date(timeSlot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setEnd(new Date(timeSlot.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, [timeSlot.start_time, timeSlot.end_time]);
  return (
    <p className={className}>
      {date} • {start} - {end} • Duration: {duration}
    </p>
  );
};