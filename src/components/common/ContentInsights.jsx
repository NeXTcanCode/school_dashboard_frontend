import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetNewsQuery } from "../../features/news/newsApi";
import { useGetEventsQuery } from "../../features/events/eventsApi";
import { useGetGalleryQuery } from "../../features/gallery/galleryApi";
import Loader from "./Loader";

const TAB_OPTIONS = [
  { id: "timeline", label: "Timeline" },
  { id: "split", label: "Content Split" },
  { id: "volume", label: "Volume" },
];

const RANGE_OPTIONS = [
  { value: 7, label: "7D" },
  { value: 30, label: "30D" },
  { value: 90, label: "90D" },
];

const COLORS = {
  News: "#0ea5e9",
  Events: "#14b8a6",
  Gallery: "#f59e0b",
};

const toDateKey = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const extractDate = (item) => {
  return item?.createdAt || item?.fromDate || item?.date || item?.updatedAt || null;
};

const withinDays = (dateString, days) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return date >= start && date <= now;
};

const buildTimeline = (news, events, gallery, days) => {
  const now = new Date();
  const timelineMap = new Map();

  for (let i = days - 1; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const key = day.toISOString().slice(0, 10);
    timelineMap.set(key, {
      day: key.slice(5),
      News: 0,
      Events: 0,
      Gallery: 0,
    });
  }

  const apply = (items, type) => {
    items.forEach((item) => {
      const key = toDateKey(extractDate(item));
      if (!key || !timelineMap.has(key)) return;
      const row = timelineMap.get(key);
      row[type] += 1;
    });
  };

  apply(news, "News");
  apply(events, "Events");
  apply(gallery, "Gallery");

  return Array.from(timelineMap.values());
};

const ContentInsights = () => {
  const [activeTab, setActiveTab] = useState("timeline");
  const [rangeDays, setRangeDays] = useState(30);

  const { data: newsData, isLoading: newsLoading } = useGetNewsQuery({ page: 1, limit: 100 });
  const { data: eventsData, isLoading: eventsLoading } = useGetEventsQuery({ page: 1, limit: 100 });
  const { data: galleryData, isLoading: galleryLoading } = useGetGalleryQuery({ page: 1, limit: 100 });

  const loading = newsLoading || eventsLoading || galleryLoading;

  const newsItems = newsData?.data || [];
  const eventItems = eventsData?.data || [];
  const galleryItems = galleryData?.data || [];

  const filtered = useMemo(() => {
    return {
      news: newsItems.filter((item) => withinDays(extractDate(item), rangeDays)),
      events: eventItems.filter((item) => withinDays(extractDate(item), rangeDays)),
      gallery: galleryItems.filter((item) => withinDays(extractDate(item), rangeDays)),
    };
  }, [newsItems, eventItems, galleryItems, rangeDays]);

  const timelineData = useMemo(() => {
    return buildTimeline(filtered.news, filtered.events, filtered.gallery, rangeDays);
  }, [filtered, rangeDays]);

  const splitData = useMemo(() => {
    return [
      { name: "News", value: newsData?.pagination?.total || newsItems.length || 0 },
      { name: "Events", value: eventsData?.pagination?.total || eventItems.length || 0 },
      { name: "Gallery", value: galleryData?.pagination?.total || galleryItems.length || 0 },
    ];
  }, [newsData, eventsData, galleryData, newsItems.length, eventItems.length, galleryItems.length]);

  const volumeData = useMemo(() => {
    return [
      { name: "News", total: newsData?.pagination?.total || newsItems.length || 0, window: filtered.news.length },
      { name: "Events", total: eventsData?.pagination?.total || eventItems.length || 0, window: filtered.events.length },
      { name: "Gallery", total: galleryData?.pagination?.total || galleryItems.length || 0, window: filtered.gallery.length },
    ];
  }, [newsData, eventsData, galleryData, newsItems.length, eventItems.length, galleryItems.length, filtered]);

  const recentActivities = useMemo(() => {
    const activities = [
      ...newsItems.map((item) => ({ type: "News", title: item.title || "News update", date: extractDate(item) })),
      ...eventItems.map((item) => ({ type: "Events", title: item.title || "Event update", date: extractDate(item) })),
      ...galleryItems.map((item) => ({ type: "Gallery", title: item.title || "Gallery update", date: extractDate(item) })),
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    return activities;
  }, [newsItems, eventItems, galleryItems]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-4">
        <Loader size="sm" />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div className="btn-group" role="group" aria-label="Insights tabs">
          {TAB_OPTIONS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`btn ${activeTab === tab.id ? "btn-primary" : "btn-light"}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="btn-group" role="group" aria-label="Range filter">
          {RANGE_OPTIONS.map((range) => (
            <button
              key={range.value}
              type="button"
              className={`btn ${rangeDays === range.value ? "btn-primary" : "btn-light"}`}
              onClick={() => setRangeDays(range.value)}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-12 col-xl-8">
          <div style={{ width: "100%", height: 320 }}>
            {activeTab === "timeline" && (
              <ResponsiveContainer>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="News" stroke={COLORS.News} strokeWidth={2} />
                  <Line type="monotone" dataKey="Events" stroke={COLORS.Events} strokeWidth={2} />
                  <Line type="monotone" dataKey="Gallery" stroke={COLORS.Gallery} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}

            {activeTab === "split" && (
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={splitData} dataKey="value" nameKey="name" outerRadius={110} label>
                    {splitData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}

            {activeTab === "volume" && (
              <ResponsiveContainer>
                <BarChart data={volumeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#334155" name="Total items" />
                  <Bar dataKey="window" fill="#0f766e" name={`Items in last ${rangeDays}d`} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="p-3 rounded-3 border bg-white h-100">
            <h6 className="fw-bold mb-3">Recent Activity</h6>
            <div className="d-flex flex-column gap-2">
              {recentActivities.length === 0 && (
                <p className="text-muted mb-0">No recent items yet.</p>
              )}
              {recentActivities.map((item, idx) => (
                <div key={`${item.type}-${idx}`} className="small border-bottom pb-2">
                  <span className="fw-semibold" style={{ color: COLORS[item.type] }}>
                    {item.type}
                  </span>{" "}
                  <span>{item.title}</span>
                  <div className="text-muted">{new Date(item.date).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentInsights;
