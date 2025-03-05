// src/components/worldmap/EventDataTab.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Event list component
const EventList = ({
  events,
  onSelect,
  selectedEvent,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState('all');

  // Filter events based on search term and data source filter
  const filteredEvents = events.filter(event => {
    const matchesSearch =
      (event.country || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.event_type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === 'all' ||
      (filter === 'gdelt' && event.data_source === 'GDELT') ||
      (filter === 'acled' && event.data_source === 'ACLED');

    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-96 overflow-y-auto mt-4">
        <div className="sticky top-0 bg-black/70 p-2 -m-2 mb-2 backdrop-blur-sm border-b border-white/10">
          <Skeleton className="w-full h-10 mb-2" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </div>
        </div>
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="w-full h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/30 p-4 rounded-lg border border-white/10 h-96 overflow-y-auto mt-4">
      <div className="sticky top-0 bg-black/70 p-2 -m-2 mb-2 backdrop-blur-sm border-b border-white/10">
        <div className="flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/50 text-white border border-white/20 rounded p-2"
          />
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs flex-1",
                filter === 'all'
                  ? "bg-blue-900/50 text-white border-blue-500/50"
                  : "bg-black/50 text-white border-white/20"
              )}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs flex-1",
                filter === 'gdelt'
                  ? "bg-orange-900/50 text-white border-orange-500/50"
                  : "bg-black/50 text-white border-white/20"
              )}
              onClick={() => setFilter('gdelt')}
            >
              GDELT
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "text-xs flex-1",
                filter === 'acled'
                  ? "bg-red-900/50 text-white border-red-500/50"
                  : "bg-black/50 text-white border-white/20"
              )}
              onClick={() => setFilter('acled')}
            >
              ACLED
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {filteredEvents.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No events match your search
          </div>
        )}
        {filteredEvents.map((event, index) => (
          <div
            key={event.id || index}
            onClick={() => onSelect(event)}
            className={cn(
              "p-2 rounded cursor-pointer border transition-colors",
              selectedEvent === event
                ? "bg-white/20 border-white/30"
                : "bg-black/40 hover:bg-black/60 border-white/10"
            )}
          >
            <div className="flex justify-between">
              <span className="text-white">{event.event_type}</span>
              <span className={`px-2 rounded text-xs text-white ${event.data_source === 'GDELT' ? 'bg-orange-600' : 'bg-red-600'}`}>
                {event.data_source}
              </span>
            </div>
            <div className="text-sm text-gray-400">{event.country} - {new Date(event.event_date).toLocaleDateString()}</div>
            {event.description && (
              <div className="text-xs text-gray-500 mt-1 line-clamp-1">{event.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Event detail component
const EventDetail = ({
  event,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-6 w-16" />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-1/3 mb-2" />
            <Skeleton className="h-24" />
          </div>
        </div>
      </div>
    );
  }

  if (!event) return (
    <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4 text-center py-12">
      <p className="text-gray-300">Select an event to view detailed information</p>
    </div>
  );

  return (
    <div className="bg-black/40 p-6 rounded-lg border border-white/10 mt-4">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-medium text-white mb-4">{event.event_type}</h3>
        <span className={`px-2 py-1 rounded text-xs text-white ${event.data_source === 'GDELT' ? 'bg-orange-600' : 'bg-red-600'}`}>
          {event.data_source}
        </span>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">Date</div>
            <div className="text-lg font-medium text-white">{new Date(event.event_date).toLocaleDateString()}</div>
          </div>
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">Location</div>
            <div className="text-lg font-medium text-white">{event.location || event.country}</div>
          </div>
        </div>

        {(event.actor1 || event.actor2) && (
          <div>
            <h4 className="text-lg text-white mb-2">Actors</h4>
            <div className="grid grid-cols-2 gap-4">
              {event.actor1 && (
                <div className="bg-black/30 p-3 rounded">
                  <div className="text-sm text-gray-400">Primary Actor</div>
                  <div className="text-white">{event.actor1}</div>
                </div>
              )}
              {event.actor2 && (
                <div className="bg-black/30 p-3 rounded">
                  <div className="text-sm text-gray-400">Secondary Actor</div>
                  <div className="text-white">{event.actor2}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {event.fatalities !== undefined && (
          <div className="bg-black/30 p-3 rounded">
            <div className="text-sm text-gray-400">Fatalities</div>
            <div className="text-lg font-medium text-white">{event.fatalities}</div>
          </div>
        )}

        {event.description && (
          <div>
            <h4 className="text-lg text-white mb-2">Description</h4>
            <p className="text-gray-300 bg-black/30 p-3 rounded">{event.description}</p>
          </div>
        )}

        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-400">
            Coordinates: {event.latitude?.toFixed(4)}, {event.longitude?.toFixed(4)}
          </span>
        </div>
      </div>
    </div>
  );
};

interface EventDataTabProps {
  events: any[];
  selectedEvent: any;
  setSelectedEvent: (event: any) => void;
  isLoading: boolean;
}

const EventDataTab: React.FC<EventDataTabProps> = ({
  events,
  selectedEvent,
  setSelectedEvent,
  isLoading
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <h2 className="text-xl text-white mb-2">Conflict Events</h2>
        <EventList
          events={events}
          onSelect={setSelectedEvent}
          selectedEvent={selectedEvent}
          isLoading={isLoading}
        />
      </div>
      <div className="md:col-span-2">
        <h2 className="text-xl text-white mb-2">Event Details</h2>
        <EventDetail
          event={selectedEvent}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default EventDataTab;