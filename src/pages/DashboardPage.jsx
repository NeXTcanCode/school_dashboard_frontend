import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useGetNewsQuery } from "../features/news/newsApi";
import { useGetEventsQuery } from "../features/events/eventsApi";
import { useGetGalleryQuery } from "../features/gallery/galleryApi";
import AdditionalInfo from "../components/common/AdditionalInfo";
import DashboardHeroStats from "../components/common/DashboardHeroStats";

const DashboardPage = () => {
  const user = useSelector(selectCurrentUser);
  const navigate = useNavigate();

  const { data: newsData, isLoading: newsLoading } = useGetNewsQuery({
    limit: 1,
  });
  const { data: eventsData, isLoading: eventsLoading } = useGetEventsQuery({
    limit: 1,
  });
  const { data: galleryData, isLoading: galleryLoading } = useGetGalleryQuery({
    limit: 1,
  });

  const stats = [
    {
      label: "News Feed",
      value: newsData?.pagination?.total || 0,
      icon: "bi-newspaper",
      show: user?.features?.news,
      loading: newsLoading,
      link: "/news",
    },
    {
      label: "Events Count",
      value: eventsData?.pagination?.total || 0,
      icon: "bi-calendar-event",
      show: user?.features?.events,
      loading: eventsLoading,
      link: "/events",
    },
    {
      label: "Gallery Items",
      value: galleryData?.pagination?.total || 0,
      icon: "bi-images",
      show: user?.features?.gallery,
      loading: galleryLoading,
      link: "/gallery",
    },
  ];

  return (
    <div>
      <DashboardHeroStats
        schoolName={user?.schoolName}
        stats={stats}
        onCardClick={(link) => navigate(link)}
      />
      <AdditionalInfo />
    </div>
  );
};

export default DashboardPage;
