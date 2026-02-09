import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useGetNewsQuery } from "../features/news/newsApi";
import { useGetEventsQuery } from "../features/events/eventsApi";
import { useGetGalleryQuery } from "../features/gallery/galleryApi";
import Card from "../components/common/Card";
import Loader from "../components/common/Loader";

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
      color: "primary",
      icon: "bi-newspaper",
      show: user?.features?.news,
      loading: newsLoading,
      link: "/news",
    },
    {
      label: "Events Count",
      value: eventsData?.pagination?.total || 0,
      color: "success",
      icon: "bi-calendar-event",
      show: user?.features?.events,
      loading: eventsLoading,
      link: "/events",
    },
    {
      label: "Gallery Items",
      value: galleryData?.pagination?.total || 0,
      color: "warning",
      icon: "bi-images",
      show: user?.features?.gallery,
      loading: galleryLoading,
      link: "/gallery",
    },
  ];

  return (
    <div>
      <div className="mb-4">
        <h2 className="fw-bold">Welcome back!</h2>
        <p className="lead text-muted">{user?.schoolName}</p>
      </div>

      <div className="row g-4">
        {stats
          .filter((s) => s.show)
          .map((stat, index) => (
            <div key={index} className="col-md-4">
              <Card
                className={`bg-${stat.color} text-white shadow-sm border-0 cursor-pointer`}
                onClick={() => navigate(stat.link)}
                style={{ cursor: "pointer", transition: "transform 0.2s" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-5px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase mb-2 opacity-75">
                      {stat.label}
                    </h6>
                    {stat.loading ? (
                      <Loader size="sm" />
                    ) : (
                      <h2 className="display-5 fw-bold mb-0">{stat.value}</h2>
                    )}
                  </div>
                  <i className={`bi ${stat.icon} fs-1 opacity-50`}></i>
                </div>
              </Card>
            </div>
          ))}
      </div>

      <div className="mt-5">
        <h4>Overview</h4>
        <Card className="p-2">
          <div className="card-body">
            <p className="text-muted mb-0">
              Use the sidebar to manage your school's dynamic content. Any
              changes you make here will be immediately reflected on your public
              website.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
